import pool from "../../db/db_handle.js";

// Update order status
export const updateOrderStatus = async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    try {
        // First, check what the current status looks like in DB to understand the ENUM format
        const [current] = await pool.promise().query(
            `SELECT order_id, status FROM orders WHERE order_id = ?`,
            [order_id]
        );
        
        console.log('Current DB status:', current[0]);
        console.log('Requested new status:', status);

        // Get the ENUM column info to see exact allowed values
        const [enumInfo] = await pool.promise().query(
            `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'status'`
        );
        console.log('DB ENUM definition:', enumInfo[0]?.COLUMN_TYPE);

        const [result] = await pool.promise().query(
            `UPDATE orders SET status = ? WHERE order_id = ?`,
            [status, order_id]
        );

        console.log('Update result affectedRows:', result.affectedRows);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const [verify] = await pool.promise().query(
            `SELECT order_id, status FROM orders WHERE order_id = ?`,
            [order_id]
        );
        console.log('Status after update:', verify[0]);

        return res.status(200).json({ 
            message: "Order status updated successfully",
            order_id,
            new_status: verify[0]?.status
        });
    } catch (error) {
        console.error("Error updating order status:", error.sqlMessage || error.message);
        return res.status(500).json({ 
            message: "Failed to update order status",
            error: error.message,
            sqlError: error.sqlMessage
        });
    }
};
