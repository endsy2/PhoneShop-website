import { BakongKHQR, MerchantInfo, khqrData } from "bakong-khqr";
import axios from "axios";
import { config } from "dotenv";
import crypto from "crypto";
import pool from "../../db/db_handle.js";
import { resolveCustomerId, resolveUsername } from "../../Utils/currentUser.js";
import { OrderError, placeOrder } from "./placeOrder.js";
import { cancelOrderById } from "../adminCrud/cancelOrder.js";

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

if (!cachedToken) {
    console.warn("⚠️  No BAKONG_TOKEN in .env — Bakong payments will not work until a token is set");
}

// ─── Internal: Renew token via Bakong API ─────────────────────────────────────
// Uses the current cachedToken (must be valid or recently expired).
const renewToken = async () => {
    const tokenToRenew = cachedToken || process.env.BAKONG_TOKEN?.trim();

    if (!tokenToRenew) {
        throw new Error(
            "No Bakong token available to renew. " +
            "Register at https://api-bakong.nbc.gov.kh/register and set BAKONG_TOKEN in .env"
        );
    }

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
    return cachedToken;
};

// ─── Internal: Get a valid token (auto-renew if expired) ─────────────────────
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
        return await renewToken();
    } finally {
        isRenewing = false;
    }
};

// ─── Poll Bakong until the QR (identified by its md5) is paid ─────────────────
// Used by checkPayment below and by checkout in Order.js.
// Resolves { success: true, transaction, attempts, duration } once paid, or
// { success: false, timeout: true, attempts } after 5 minutes. Throws if no token is available.
const POLL_INTERVAL = 3000;
const MAX_POLL_DURATION = 5 * 60 * 1000;

export const pollBakongPayment = async (md5Hash) => {
    const startTime = Date.now();
    let attempts = 0;

    let token = await getToken();
    if (!token) {
        throw new Error("Bakong token not available. Please generate a token first.");
    }

    while (Date.now() - startTime < MAX_POLL_DURATION) {
        attempts++;
        try {
            const bakongRes = await axios.post(
                `${BAKONG_BASE_URL}/v1/check_transaction_by_md5`,
                { md5: md5Hash },
                { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
            );
            if (bakongRes.data?.data && bakongRes.data?.responseCode === 0) {
                return {
                    success: true,
                    transaction: bakongRes.data.data,
                    attempts,
                    duration: Math.round((Date.now() - startTime) / 1000),
                };
            }
        } catch (err) {
            const status = err.response?.status;
            const responseCode = err.response?.data?.responseCode;
            if (status === 401) {
                // Token expired mid-poll: force a renewal and keep polling
                cachedToken = null;
                tokenExpiry = null;
                token = await getToken();
            } else if (status !== 404 && responseCode !== 1) {
                // 404 / responseCode 1 just mean "not paid yet"
                console.error(`Bakong poll attempt ${attempts} failed:`, err.response?.data || err.message);
            }
        }

        if (Date.now() - startTime < MAX_POLL_DURATION) {
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }
    }

    return { success: false, timeout: true, attempts };
};

// ─── Route: Manually renew Bakong token ──────────────────────────────────────
// POST /user/bakong/generate-token
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
// POST /user/bakong/generate-qr
// Body: { currency, items, delivery, location, customerName }
export const generateQR = async (req, res) => {
    try {
        // The amount is computed from the order on the server; a client-sent amount is ignored.
        const { currency = "USD", items, delivery, location, customerName } = req.body;

        // Validate required order data
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items are required" });
        }

        if (!delivery || !location) {
            return res.status(400).json({ message: "Delivery and location are required" });
        }

        // Check config before taking stock, or a QR that can't be generated leaves an unpayable order
        if (!ACCOUNT_ID || !MERCHANT_NAME || !MERCHANT_ID) {
            console.error("Bakong is not configured: set BAKONG_ACCOUNT_ID, BAKONG_MERCHANT_ID and MERCHANTNAME");
            return res.status(503).json({ message: "Bakong QR payment is not available right now" });
        }

        // ── Step 1: Create pending order ──────────────────────────────────────
        const customerId = await resolveCustomerId(req);
        if (!customerId) {
            return res.status(401).json({ message: "Not authenticated. Please log in." });
        }

        let orderId, amount;
        try {
            ({ orderId, amountDue: amount } = await placeOrder({
                customerId,
                recipientName: customerName?.trim() || resolveUsername(req),
                items,
                delivery,
                payment: "Bakong QR",
                location,
            }));
        } catch (orderErr) {
            if (!(orderErr instanceof OrderError)) throw orderErr;
            return res.status(orderErr.status).json({ message: orderErr.message, ...orderErr.extra });
        }

        // ── Step 2: Generate QR code ──────────────────────────────────────────
        const expirationTimestamp = Date.now() + 5 * 60 * 1000; // 5 minutes

        const currencyCode =
            currency === "KHR" ? khqrData.currency.khr : khqrData.currency.usd;

        let response;
        const qrType = "merchant";

        try {
            const merchantInfo = new MerchantInfo();
            merchantInfo.bakongAccountID = ACCOUNT_ID;
            merchantInfo.acquiringBank = ACQUIRING_BANK;
            merchantInfo.currency = currencyCode;
            merchantInfo.merchantName = MERCHANT_NAME;
            merchantInfo.merchantCity = "Phnom Penh";
            merchantInfo.merchantID = MERCHANT_ID;
            merchantInfo.amount = amount;
            merchantInfo.billNumber = `ORDER-${orderId}`;
            merchantInfo.mobileNumber = MOBILE;
            merchantInfo.storeLabel = STORE_LABEL;
            merchantInfo.terminalLabel = "GeniusStore";
            merchantInfo.expirationTimestamp = expirationTimestamp; // Required for dynamic KHQR

            const khqr = new BakongKHQR();
            response = khqr.generateMerchant(merchantInfo);
        } catch (merchantErr) {
            // Error 840 = account not registered as merchant
            console.warn("Merchant QR failed:", merchantErr.message);
        }

        if (!response?.data?.qr) {
            console.error("QR generation returned no data:", response);
            await cancelOrderById(orderId); // give the stock back; the customer can't pay this order
            return res.status(500).json({ message: "Failed to generate QR code - no QR data returned" });
        }

        const qrString = response.data.qr;
        const md5Hash = crypto.createHash("md5").update(qrString).digest("hex");

        return res.status(200).json({
            message: `${qrType === "merchant" ? "Merchant" : "Individual"} QR generated successfully and order created`,
            data: {
                qrString,
                md5Hash,
                amount: amount,
                currency,
                orderId,
                qrType,
                expiresAt: new Date(expirationTimestamp).toISOString(),
                expirationTimestamp,
            },
        });
    } catch (err) {
        console.error("QR generation error:", err);
        return res.status(500).json({ message: "QR generation failed", error: err.message });
    }
};

// ─── Route: Check Payment Status ─────────────────────────────────────────────
// POST /user/bakong/check-payment
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

        // ── Step 2: Poll Bakong for up to 5 minutes ────────────────────────────
        let result;
        try {
            result = await pollBakongPayment(md5Hash);
        } catch (pollErr) {
            console.error("Bakong polling error:", pollErr.message);
            return res.status(500).json({ paid: false, orderId, message: pollErr.message });
        }

        if (result.success) {
            await pool.promise().query(
                `UPDATE orders SET payment_verified = 1 WHERE order_id = ?`,
                [orderId]
            );
            return res.status(200).json({
                paid: true,
                orderId,
                message: "Payment confirmed! Your order has been placed.",
                transaction: result.transaction,
                attempts: result.attempts,
                duration: result.duration,
            });
        }

        // ── Step 3: Timeout — payment not received within 5 minutes ────────────
        return res.status(200).json({
            paid: false,
            orderId,
            message: "Payment timeout. Your order is saved as pending. Please contact support if you completed the payment.",
            timeout: true,
            attempts: result.attempts,
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