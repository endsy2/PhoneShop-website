import pool from "../../db/db_handle.js";
import axios from "axios";

const BAKONG_BASE_URL = process.env.BAKONG_BASE_URL || "https://api-bakong.nbc.gov.kh";

// Import token management from bakong.js (we'll need to export these)
let cachedToken = null;
let tokenExpiry = null;

const getToken = async () => {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const tokenToRenew = cachedToken || process.env.BAKONG_TOKEN?.trim();
    
    if (!tokenToRenew) {
        console.error("No Bakong token available");
        return null;
    }

    try {
        console.log("Attempting to renew Bakong token...");
        const res = await axios.post(
            `${BAKONG_BASE_URL}/v1/auth/token/renew`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenToRenew}`
                }
            }
        );
        if (res.data?.data?.token) {
            cachedToken = res.data.data.token;
            tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
            console.log("Bakong token auto-renewed and cached successfully");
            return cachedToken;
        }
    } catch (err) {
        console.error("Token auto-renewal failed:", err.response?.data?.responseMessage || err.message);
        
        if (cachedToken) {
            console.log("Using existing cached token despite renewal failure");
            tokenExpiry = Date.now() + (1 * 60 * 60 * 1000);
            return cachedToken;
        }
    }

    return null;
};

const resolveUsername = (req) => {
    const tokenPayload = req?.user?.user || {};
    if (typeof tokenPayload.username === "object") {
        return tokenPayload.username.username || tokenPayload.username.name || "";
    }
    return tokenPayload.username || tokenPayload.name || "";
};

// Helper function to poll Bakong payment
const pollBakongPayment = async (md5Hash, orderId) => {
    const POLL_INTERVAL = 3000; // 3 seconds
    const MAX_DURATION = 5 * 60 * 1000; // 5 minutes
    const startTime = Date.now();
    let attempts = 0;

    console.log(`🔄 Starting payment polling for order #${orderId}, md5: ${md5Hash}`);

    let token = await getToken();
    if (!token) {
        throw new Error("Bakong token not available");
    }

    while (Date.now() - startTime < MAX_DURATION) {
        attempts++;
        
        try {
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

            // Payment CONFIRMED
            if (bakongRes.data?.data && bakongRes.data?.responseCode === 0) {
                console.log(`✅ Payment confirmed for order #${orderId} after ${attempts} attempts (${Math.round((Date.now() - startTime) / 1000)}s)`);
                return {
                    success: true,
                    transaction: bakongRes.data.data,
                    attempts,
                    duration: Math.round((Date.now() - startTime) / 1000)
                };
            }

        } catch (err) {
            const status = err.response?.status;
            const responseCode = err.response?.data?.responseCode;

            // 404 or responseCode 1 = not paid yet (continue polling)
            if (status === 404 || responseCode === 1) {
                // Continue polling
            } 
            // Token expired — refresh
            else if (status === 401) {
                console.log("⚠️  Token expired during polling, attempting refresh...");
                cachedToken = null;
                tokenExpiry = null;
                const newToken = await getToken();
                if (newToken) {
                    token = newToken;
                } else {
                    throw new Error("Token refresh failed during payment check");
                }
            }
            // Other errors — log but continue
            else {
                console.error(`Polling attempt ${attempts} error:`, err.response?.data || err.message);
            }
        }

        // Wait before next poll
        if (Date.now() - startTime < MAX_DURATION) {
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
    }

    // Timeout
    console.log(`⏱️  Payment timeout for order #${orderId} after ${attempts} attempts (5 minutes)`);
    return {
        success: false,
        timeout: true,
        attempts
    };
};

export const checkout = async (req, res) => {
    try {
        const { items, delivery, payment, location, customerName, md5Hash } = req.body;

        // Always resolve the customer from the JWT token
        const tokenUsername = resolveUsername(req);

        if (!tokenUsername) {
            return res.status(401).json({ message: "Not authenticated. Please log in." });
        }

        if (!items || !Array.isArray(items) || items.length === 0 || !delivery || !payment || !location) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        // Find customer by their account username from the token
        const [customerRows] = await pool.promise().query(
            `SELECT customer_id FROM customers WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) LIMIT 1`,
            [tokenUsername]
        );

        if (customerRows.length === 0) {
            return res.status(404).json({ message: "Customer account not found. Please log in again." });
        }

        const customer_id = customerRows[0].customer_id;

        // Validate all spec_ids exist in specifications table
        const specIds = items.map(item => item.spec_id).filter(Boolean);
        if (specIds.length === 0) {
            return res.status(400).json({ message: "No valid items in cart" });
        }

        const placeholders = specIds.map(() => '?').join(',');
        const [specRows] = await pool.promise().query(
            `SELECT spec_id FROM specifications WHERE spec_id IN (${placeholders})`,
            specIds
        );

        const validSpecIds = new Set(specRows.map(r => r.spec_id));
        const invalidItems = items.filter(item => !validSpecIds.has(Number(item.spec_id)));

        if (invalidItems.length > 0) {
            return res.status(400).json({
                message: "Some cart items are no longer available. Please refresh your cart and try again.",
                invalidSpecIds: invalidItems.map(i => i.spec_id)
            });
        }

        // Determine if this is a Bakong payment
        const isBakongPayment = payment === "Bakong QR" && md5Hash;

        // Insert order with payment_verified flag
        const recipientName = customerName?.trim() || tokenUsername;
        const payment_verified = isBakongPayment ? 0 : 1; // Bakong starts as unverified

        const [ordersRows] = await pool.promise().query(
            `INSERT INTO orders (customer_id, recipient_name, delivery, payment, payment_verified, location) VALUES (?, ?, ?, ?, ?, ?)`,
            [customer_id, recipientName, delivery, payment, payment_verified, location.trim()]
        );

        const order_id = ordersRows.insertId;

        // Insert order items
        for (const item of items) {
            await pool.promise().query(
                `INSERT INTO order_items (order_id, spec_id, quantity) VALUES (?, ?, ?)`,
                [order_id, item.spec_id, item.quantity]
            );
        }

        console.log(`📦 Order created: #${order_id} (${isBakongPayment ? 'Bakong - pending payment' : 'confirmed'})`);

        // If Bakong payment, poll for payment confirmation
        if (isBakongPayment) {
            try {
                const paymentResult = await pollBakongPayment(md5Hash, order_id);

                if (paymentResult.success) {
                    // Update order to verified
                    await pool.promise().query(
                        `UPDATE orders SET payment_verified = 1, status = 'Pending' WHERE order_id = ?`,
                        [order_id]
                    );

                    return res.status(201).json({
                        message: "Payment confirmed! Your order has been placed.",
                        orderId: order_id,
                        paid: true,
                        transaction: paymentResult.transaction,
                        attempts: paymentResult.attempts,
                        duration: paymentResult.duration
                    });
                } else {
                    // Timeout - order stays pending
                    return res.status(200).json({
                        message: "Payment timeout. Your order is saved as pending. Please contact support if you completed the payment.",
                        orderId: order_id,
                        paid: false,
                        timeout: true,
                        attempts: paymentResult.attempts
                    });
                }
            } catch (paymentErr) {
                console.error("Payment polling error:", paymentErr.message);
                return res.status(500).json({
                    message: "Payment verification failed. Your order is saved as pending.",
                    orderId: order_id,
                    paid: false,
                    error: paymentErr.message
                });
            }
        }

        // Non-Bakong payment - immediate success
        res.status(201).json({ 
            message: "Order placed successfully", 
            orderId: order_id,
            paid: true
        });

    } catch (error) {
        console.error("Error in checkout:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
