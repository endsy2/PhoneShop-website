import { BakongKHQR, MerchantInfo, IndividualInfo, khqrData } from "bakong-khqr";
import axios from "axios";
import { config } from "dotenv";
import crypto from "crypto";
import pool from "../../db/db_handle.js";
import { log } from "console";

config();

const BAKONG_BASE_URL = process.env.BAKONG_BASE_URL || "https://api-bakong.nbc.gov.kh";
const ACCOUNT_ID = process.env.BAKONG_ACCOUNT_ID;
const MERCHANT_ID = process.env.BAKONG_MERCHANT_ID || process.env.BAKONG_ACCOUNT_ID; // Merchant ID
const ACQUIRING_BANK = process.env.ACQUIRINGBANK; // Acquiring Bank
const MERCHANT_NAME = process.env.MERCHANTNAME;
const STORE_LABEL = process.env.STORELABEL || "GeniusStore";
const MOBILE = process.env.MOBILENUMBERSTORELABEL;

// ─── Token Management ─────────────────────────────────────────────────────────
// cachedToken: holds the active token in memory.
// Seeded from .env on startup; renewed via Bakong API when expired.
let cachedToken = process.env.BAKONG_TOKEN?.trim() || null;
let tokenExpiry = cachedToken ? Date.now() + 23 * 60 * 60 * 1000 : null;
let isRenewing = false; // prevents concurrent renewal races

if (cachedToken) {
    console.log("✅ Bakong token initialized from .env");
} else {
    console.warn("⚠️  No BAKONG_TOKEN in .env — Bakong payments will not work until a token is set");
}

// ─── Internal: Renew token via Bakong API ─────────────────────────────────────
// Uses the current cachedToken (must be valid or recently expired).
// BUG FIX: Original code had inverted condition (!existingToken) and mixed
// route-handler / utility concerns. This is now a pure async utility.
const renewToken = async () => {
    const tokenToRenew = cachedToken || process.env.BAKONG_TOKEN?.trim();

    if (!tokenToRenew) {
        throw new Error(
            "No Bakong token available to renew. " +
            "Register at https://api-bakong.nbc.gov.kh/register and set BAKONG_TOKEN in .env"
        );
    }

    console.log("🔄 Renewing Bakong token...");
    const response = await axios.post(
        `${BAKONG_BASE_URL}/v1/auth/token/renew`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenToRenew}`,
            },
        }
    );

    const newToken = response.data?.data?.token;
    if (!newToken) {
        throw new Error(`Bakong renewal response missing token: ${JSON.stringify(response.data)}`);
    }

    cachedToken = newToken;
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    console.log("✅ Bakong token renewed and cached");
    return cachedToken;
};

// ─── Internal: Get a valid token (auto-renew if expired) ─────────────────────
// BUG FIX: Original awaited nothing and assigned a Promise to cachedToken.
const getToken = async () => {
    // Return cached token if still valid
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    // Prevent concurrent renewals (e.g. two polls firing at the same time)
    if (isRenewing) {
        // Wait up to 5s for the ongoing renewal to finish
        for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 500));
            if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) return cachedToken;
        }
        throw new Error("Token renewal timed out");
    }

    isRenewing = true;
    try {
        console.log("Start renew token");
        
        return await renewToken();
    } finally {
        isRenewing = false;
    }
};

// ─── Resolve username from JWT token ─────────────────────────────────────────
const resolveUsername = (req) => {
    const tokenPayload = req?.user?.user || {};
    if (typeof tokenPayload.username === "object") {
        return tokenPayload.username.username || tokenPayload.username.name || "";
    }
    return tokenPayload.username || tokenPayload.name || "";
};

// ─── Insert order into DB ─────────────────────────────────────────────────────
// payment_verified: 0 = pending (QR shown, not paid yet), 1 = confirmed paid
const placeOrder = async ({
    req,
    items,
    delivery,
    payment,
    location,
    customerName,
    payment_verified = 0,
}) => {
    const tokenUsername = resolveUsername(req);
    if (!tokenUsername) throw new Error("Not authenticated");

    const [customerRows] = await pool.promise().query(
        `SELECT customer_id FROM customers WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) LIMIT 1`,
        [tokenUsername]
    );
    if (customerRows.length === 0) throw new Error("Customer account not found");
    const customer_id = customerRows[0].customer_id;

    const specIds = items.map((item) => item.spec_id).filter(Boolean);
    if (specIds.length === 0) throw new Error("No valid items in cart");

    const placeholders = specIds.map(() => "?").join(",");
    const [specRows] = await pool.promise().query(
        `SELECT spec_id FROM specifications WHERE spec_id IN (${placeholders})`,
        specIds
    );
    const validSpecIds = new Set(specRows.map((r) => r.spec_id));
    const validItems = items.filter((item) => validSpecIds.has(Number(item.spec_id)));
    if (validItems.length === 0) throw new Error("None of the cart items are available");

    const recipientName = customerName?.trim() || tokenUsername;

    const [ordersRows] = await pool.promise().query(
        `INSERT INTO orders (customer_id, recipient_name, delivery, payment, payment_verified, location)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [customer_id, recipientName, delivery, payment || "Bakong QR", payment_verified, location.trim()]
    );
    const order_id = ordersRows.insertId;

    for (const item of validItems) {
        await pool.promise().query(
            `INSERT INTO order_items (order_id, spec_id, quantity) VALUES (?, ?, ?)`,
            [order_id, item.spec_id, item.quantity]
        );
    }

    return { order_id, skipped: items.length - validItems.length };
};

// ─── Route: Manually renew Bakong token ──────────────────────────────────────
// POST /bakong/token/renew
// BUG FIX: Separated route handler from the internal renewToken() utility so
// getToken() can call renewToken() without needing a res object.
export const generateBakongToken = async (req, res) => {
    try {
        const token = await renewToken();
        return res.status(200).json({
            message: "Token renewed successfully and stored in cache",
            token,
        });
    } catch (err) {
        console.error("Token renewal error:", err.response?.data || err.message);
        return res.status(500).json({
            message:
                "Token renewal failed. Your BAKONG_TOKEN may be expired. " +
                "Get a new one at https://api-bakong.nbc.gov.kh/register",
            error: err.response?.data || err.message,
        });
    }
};

// ─── Route: Generate QR Code + Create Pending Order ──────────────────────────
// POST /bakong/qr/generate
// Body: { amount, currency, items, delivery, location, customerName }
export const generateQR = async (req, res) => {
    try {
        const { amount, currency = "USD", items, delivery, location, customerName } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Valid amount is required" });
        }

        // Validate required order data
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items are required" });
        }

        if (!delivery || !location) {
            return res.status(400).json({ message: "Delivery and location are required" });
        }

        // ── Step 1: Create pending order ──────────────────────────────────────
        let orderId = null;
        try {
            const { order_id } = await placeOrder({
                req,
                items,
                delivery,
                payment: "Bakong QR",
                location,
                customerName,
                payment_verified: 0  // pending payment
            });
            orderId = order_id;
            console.log(`📦 Pending Bakong order created: #${orderId}`);
        } catch (orderErr) {
            console.error("Failed to create pending order:", orderErr.message);
            return res.status(400).json({
                message: orderErr.message
            });
        }

        // ── Step 2: Generate QR code ──────────────────────────────────────────
        const expirationTimestamp = Date.now() + 5 * 60 * 1000; // 5 minutes

        const currencyCode =
            currency === "KHR" ? khqrData.currency.khr : khqrData.currency.usd;

        const optionalData = {
            currency: currencyCode,
            amount: parseFloat(amount),
            billNumber: `ORDER-${orderId}`,
            mobileNumber: MOBILE,
            storeLabel: STORE_LABEL,
            terminalLabel: "GeniusStore",
            expirationTimestamp,
        };

        let response;
        let qrType = "merchant";

        try {
            // Validate required Bakong parameters
            if (!ACCOUNT_ID) throw new Error("BAKONG_ACCOUNT_ID is not set in .env");
            if (!MERCHANT_NAME) throw new Error("MERCHANTNAME is not set in .env");
            if (!MERCHANT_ID) throw new Error("BAKONG_MERCHANT_ID is not set in .env");

            // Try Merchant QR first
            console.log("Attempting to generate Merchant QR...");
            console.log("Parameters:", { accountId: ACCOUNT_ID, merchantId: MERCHANT_ID, merchantName: MERCHANT_NAME, acquiringBank: ACQUIRING_BANK });
            
            // Create MerchantInfo object and set properties one by one
            const merchantInfo = new MerchantInfo();
            merchantInfo.bakongAccountID = ACCOUNT_ID;
            merchantInfo.acquiringBank = ACQUIRING_BANK;
            merchantInfo.currency = currencyCode;
            merchantInfo.merchantName = MERCHANT_NAME;
            merchantInfo.merchantCity = "Phnom Penh";
            merchantInfo.merchantID = MERCHANT_ID;
            merchantInfo.amount = parseFloat(amount);
            merchantInfo.billNumber = `ORDER-${orderId}`;
            merchantInfo.mobileNumber = MOBILE;
            merchantInfo.storeLabel = STORE_LABEL;
            merchantInfo.terminalLabel = "GeniusStore";
            merchantInfo.expirationTimestamp = expirationTimestamp; // Required for dynamic KHQR

            const khqr = new BakongKHQR();
            response = khqr.generateMerchant(merchantInfo);
            console.log("✅ Merchant QR generated successfully");
        } catch (merchantErr) {
            // If merchant QR fails (error 840 = account not registered as merchant)
            console.warn("⚠️  Merchant QR failed:", merchantErr.message);
            console.log("Attempting to generate Individual QR as fallback...");
        }

        if (!response?.data?.qr) {
            console.error("❌ QR generation returned no data:", response);
            return res.status(500).json({ 
                message: "Failed to generate QR code - no QR data returned",
                debug: response
            });
        }

        const qrString = response.data.qr;
        const md5Hash = crypto.createHash("md5").update(qrString).digest("hex");

        console.log(`✅ ${qrType.toUpperCase()} QR generated for order #${orderId}`);

        return res.status(200).json({
            message: `${qrType === "merchant" ? "Merchant" : "Individual"} QR generated successfully and order created`,
            data: {
                qrString,
                md5Hash,
                amount: parseFloat(amount),
                currency,
                orderId,
                qrType,
                expiresAt: new Date(expirationTimestamp).toISOString(),
                expirationTimestamp,
            },
        });
    } catch (err) {
        console.error("❌ QR generation error:", err);
        return res.status(500).json({ 
            message: "QR generation failed", 
            error: err.message,
            details: err.stack
        });
    }
};

// ─── Route: Check Payment Status ─────────────────────────────────────────────
// POST /bakong/payment/check
//
// Flow:
//   1. Order already created by generateQR with payment_verified=0
//   2. Frontend calls this ONCE with { md5Hash, orderId }
//   3. Backend polls Bakong API every 3 seconds for up to 5 minutes
//   4. When payment confirmed: update order payment_verified=1, return success
//   5. If timeout (5 min): return timeout, order remains pending
//
// Body: { md5Hash, orderId }
export const checkPayment = async (req, res) => {
    try {
        const { md5Hash, orderId } = req.body;

        if (!md5Hash) {
            return res.status(400).json({ message: "md5Hash is required" });
        }

        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }

        // ── Step 1: Verify order exists ────────────────────────────────────────
        const [orderRows] = await pool.promise().query(
            `SELECT order_id, payment_verified FROM orders WHERE order_id = ?`,
            [orderId]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        // If already paid, return success immediately
        if (orderRows[0].payment_verified === 1) {
            return res.status(200).json({
                paid: true,
                orderId: orderId,
                message: "Payment already confirmed"
            });
        }

        // ── Step 2: Get token ──────────────────────────────────────────────────
        let token;
        try {
            token = await getToken();
            if (!token) {
                throw new Error("Bakong token not available. Please generate a token first.");
            }
        } catch (tokenErr) {
            console.error("Token error:", tokenErr.message);
            return res.status(500).json({
                paid: false,
                orderId: orderId,
                message: tokenErr.message
            });
        }

        // ── Step 3: Poll Bakong API for 5 minutes ──────────────────────────────
        const POLL_INTERVAL = 3000; // 3 seconds
        const MAX_DURATION = 5 * 60 * 1000; // 5 minutes
        const startTime = Date.now();
        let attempts = 0;

        console.log(`🔄 Starting payment polling for order #${orderId}, md5: ${md5Hash}`);

        while (Date.now() - startTime < MAX_DURATION) {
            attempts++;
            
            try {
                console.log("Start Verify MD5");
                
                const bakongRes = await axios.post(
                    `${BAKONG_BASE_URL}/v1/check_transaction_by_md5`,
                    { md5: md5Hash },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                // ── Payment CONFIRMED ──────────────────────────────────────────
                if (bakongRes.data?.data && bakongRes.data?.responseCode === 0) {
                    await pool.promise().query(
                        `UPDATE orders SET payment_verified = 1 WHERE order_id = ?`,
                        [orderId]
                    );
                    console.log(`✅ Payment confirmed for order #${orderId} after ${attempts} attempts (${Math.round((Date.now() - startTime) / 1000)}s)`);
                    
                    return res.status(200).json({
                        paid: true,
                        orderId: orderId,
                        message: "Payment confirmed! Your order has been placed.",
                        transaction: bakongRes.data.data,
                        attempts,
                        duration: Math.round((Date.now() - startTime) / 1000)
                    });
                }

            } catch (err) {
                const status = err.response?.status;
                const responseCode = err.response?.data?.responseCode;

                // 404 or responseCode 1 = not paid yet (continue polling)
                if (status === 404 || responseCode === 1) {
                    // Continue polling - this is normal
                } 
                // Token expired — try to refresh
                else if (status === 401) {
                    console.log("⚠️  Token expired during polling, attempting refresh...");
                    cachedToken = null;
                    tokenExpiry = null;
                    const newToken = await getToken();
                    if (newToken) {
                        token = newToken; // Use refreshed token for next attempt
                    } else {
                        return res.status(500).json({
                            paid: false,
                            orderId: orderId,
                            message: "Token refresh failed during payment check"
                        });
                    }
                }
                // Other errors — log but continue polling
                else {
                    console.error(`Polling attempt ${attempts} error:`, err.response?.data || err.message);
                }
            }

            // Wait before next poll (unless we're at the end)
            if (Date.now() - startTime < MAX_DURATION) {
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
            }
        }

        // ── Step 4: Timeout — payment not received within 5 minutes ────────────
        console.log(`⏱️  Payment timeout for order #${orderId} after ${attempts} attempts (5 minutes)`);
        
        return res.status(200).json({
            paid: false,
            orderId: orderId,
            message: "Payment timeout. Your order is saved as pending. Please contact support if you completed the payment.",
            timeout: true,
            attempts
        });

    } catch (err) {
        console.error("checkPayment unexpected error:", err.response?.data || err.message);
        return res.status(500).json({
            paid: false,
            message: "Payment check failed",
            error: err.message
        });
    }
};