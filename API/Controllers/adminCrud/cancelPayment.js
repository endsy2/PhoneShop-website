import pool from "../../db/db_handle.js";

// Cancel/Reject payment for an order
export const cancelPayment = async (req, res) => {
    const { order_id } = req.params;

    console.log('=== Cancel Payment Request ===');
    console.log('Order ID:', order_id);

    if (!order_id) {
        return res.status(400).json({ message: "Order ID is required" });
    }

    try {
        // First, check if order exists
        const [orderCheck] = await pool.promise().query(
            `SELECT order_id, payment_verified, status FROM orders WHERE order_id = ?`,
            [order_id]
        );

        if (orderCheck.length === 0) {
            console.log('Order not found:', order_id);
            return res.status(404).json({ message: "Order not found" });
        }

        console.log('Current order status:', orderCheck[0]);
        
        // Set payment_verified to 0 (mark as unpaid/canceled)
        const [result] = await pool.promise().query(
            `UPDATE orders 
             SET payment_verified = 0
             WHERE order_id = ?`,
            [order_id]
        );

        console.log('Cancel result:', result);

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to cancel payment" });
        }

        // Fetch updated order
        const [updatedOrder] = await pool.promise().query(
            `SELECT order_id, payment_verified, status FROM orders WHERE order_id = ?`,
            [order_id]
        );

        console.log('Updated order status:', updatedOrder[0]);

        return res.status(200).json({ 
            message: "Payment canceled successfully",
            order_id,
            payment_verified: false,
            status: updatedOrder[0]?.status
        });
    } catch (error) {
        console.error("Error canceling payment:", error);
        return res.status(500).json({ 
            message: "Failed to cancel payment",
            error: error.message
        });
    }
};
