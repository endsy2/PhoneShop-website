import pool from "../../db/db_handle.js";

// Sets orders.payment_verified; order status is left unchanged.
// (mysql2 reports matched rows, so affectedRows is 0 only when the order doesn't exist.)
const setPaymentVerified = (verified, action) => async (req, res) => {
    const { order_id } = req.params;

    if (!order_id) {
        return res.status(400).json({ message: "Order ID is required" });
    }

    try {
        const [result] = await pool.promise().query(
            `UPDATE orders SET payment_verified = ? WHERE order_id = ?`,
            [verified ? 1 : 0, order_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const [updated] = await pool.promise().query(
            `SELECT status FROM orders WHERE order_id = ?`,
            [order_id]
        );

        return res.status(200).json({
            message: `Payment ${action} successfully`,
            order_id,
            payment_verified: verified,
            status: updated[0]?.status
        });
    } catch (error) {
        console.error(`Error setting payment ${action}:`, error.sqlMessage || error.message);
        return res.status(500).json({ message: `Failed to update payment` });
    }
};

export const confirmPayment = setPaymentVerified(true, "confirmed");
export const cancelPayment = setPaymentVerified(false, "canceled");
