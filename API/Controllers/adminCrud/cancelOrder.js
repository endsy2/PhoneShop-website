import pool from "../../db/db_handle.js";

// Cancel an order (mark as canceled, don't delete)
export const cancelOrder = async (req, res) => {
    const { order_id } = req.params;

    console.log('=== Cancel Order Request ===');
    console.log('Order ID:', order_id);

    if (!order_id) {
        return res.status(400).json({ message: "Order ID is required" });
    }

    try {
        // First, check if order exists
        const [orderCheck] = await pool.promise().query(
            `SELECT order_id, status FROM orders WHERE order_id = ?`,
            [order_id]
        );

        if (orderCheck.length === 0) {
            console.log('Order not found:', order_id);
            return res.status(404).json({ message: "Order not found" });
        }

        console.log('Current order status:', orderCheck[0]);
        
        // Update order status to 'canceled'
        const [result] = await pool.promise().query(
            `UPDATE orders 
             SET status = ?
             WHERE order_id = ?`,
            ['canceled', order_id]
        );

        console.log('Cancel result:', result);

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to cancel order" });
        }

        // Fetch updated order
        const [updatedOrder] = await pool.promise().query(
            `SELECT order_id, status FROM orders WHERE order_id = ?`,
            [order_id]
        );

        console.log('Updated order status:', updatedOrder[0]);

        return res.status(200).json({ 
            message: "Order canceled successfully",
            order_id,
            status: updatedOrder[0]?.status
        });
    } catch (error) {
        console.error("Error canceling order:", error);
        console.error("SQL Error:", error.sqlMessage);
        return res.status(500).json({ 
            message: "Failed to cancel order",
            error: error.message,
            sqlError: error.sqlMessage
        });
    }
};
