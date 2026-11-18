import pool from "../../db/db_handle.js";
import { resolveCustomerId, resolveUsername } from "../../Utils/currentUser.js";
import { OrderError, placeOrder } from "./placeOrder.js";
import { pollBakongPayment } from "./bakong.js";

export const checkout = async (req, res) => {
    const { items, delivery, payment, location, customerName, md5Hash } = req.body;

    if (!delivery || !payment || !location) {
        return res.status(400).json({ message: "Invalid input data" });
    }

    const customer_id = await resolveCustomerId(req);
    if (!customer_id) {
        return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    let order_id;
    try {
        ({ orderId: order_id } = await placeOrder({
            customerId: customer_id,
            recipientName: customerName?.trim() || resolveUsername(req),
            items,
            delivery,
            payment,
            location,
        }));
    } catch (error) {
        if (error instanceof OrderError) {
            return res.status(error.status).json({ message: error.message, ...error.extra });
        }
        throw error;
    }

    // Bakong: wait for the transfer, then mark the order paid
    if (payment === "Bakong QR" && md5Hash) {
        try {
            const paymentResult = await pollBakongPayment(md5Hash);

            if (paymentResult.success) {
                // Update order to verified
                await pool.promise().query(
                    `UPDATE orders SET payment_verified = 1 WHERE order_id = ?`,
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

    // Cash on delivery: unpaid until an admin confirms payment after delivery
    return res.status(201).json({
        message: "Order placed successfully",
        orderId: order_id,
        paid: false,
        paymentPending: true
    });
};
