import pool from "../../db/db_handle.js";

// Confirm payment for an order
export const confirmPayment = async (req, res) => {
    const { order_id } = req.params;

    // Log request details for debugging
    console.log('=== Confirm Payment Request ===');
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
        
        // Update payment_verified to 1
        // Keep status as is - don't change it automatically
        const [result] = await pool.promise().query(
            `UPDATE orders 
             SET payment_verified = 1
             WHERE order_id = ?`,
            [order_id]
        );

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to update order" });
        }

        // Fetch updated order
        const [updatedOrder] = await pool.promise().query(
            `SELECT order_id, payment_verified, status FROM orders WHERE order_id = ?`,
            [order_id]
        );

        console.log('Updated order status:', updatedOrder[0]);

        return res.status(200).json({ 
            message: "Payment confirmed successfully",
            order_id,
            payment_verified: true,
            status: updatedOrder[0]?.status
        });
    } catch (error) {
        console.error("Error confirming payment:", error);
        return res.status(500).json({ 
            message: "Failed to confirm payment",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
