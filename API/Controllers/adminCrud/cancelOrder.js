import pool from "../../db/db_handle.js";
import { restockOrder } from "../user/placeOrder.js";

export const ORDER_STATUSES = ["pending", "completed", "shipping", "delivered", "canceled"];

// Marks an order canceled and returns its items to stock, once. Returns the previous status,
// or null if the order doesn't exist.
export const cancelOrderById = async (orderId) => {
    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();
        const [[order]] = await connection.query(
            `SELECT status FROM orders WHERE order_id = ? FOR UPDATE`,
            [orderId]
        );
        if (!order) {
            await connection.rollback();
            return null;
        }
        if (order.status !== "canceled") {
            await restockOrder(orderId, connection);
            await connection.query(`UPDATE orders SET status = 'canceled' WHERE order_id = ?`, [orderId]);
        }
        await connection.commit();
        return order.status;
    } catch (error) {
        await connection.rollback().catch(() => {});
        throw error;
    } finally {
        connection.release();
    }
};

// Cancel an order (mark as canceled, don't delete)
export const cancelOrder = async (req, res) => {
    const { order_id } = req.params;

    if (!order_id) {
        return res.status(400).json({ message: "Order ID is required" });
    }

    const previous = await cancelOrderById(order_id);
    if (previous === null) {
        return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
        message: previous === "canceled" ? "Order was already canceled" : "Order canceled successfully",
        order_id,
        status: "canceled"
    });
};
