import pool from "../../db/db_handle.js";
import { cancelOrderById, ORDER_STATUSES } from "./cancelOrder.js";

// Update order status
export const updateOrderStatus = async (req, res) => {
    const { order_id } = req.params;
    const status = String(req.body.status || "").toLowerCase();

    if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(", ")}` });
    }

    const [[order]] = await pool.promise().query(`SELECT status FROM orders WHERE order_id = ?`, [order_id]);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (status === "canceled") {
        await cancelOrderById(order_id); // also returns the items to stock
    } else if (order.status === "canceled") {
        // Its stock was already returned; reopening could sell stock that is gone. Place a new order instead.
        return res.status(400).json({ message: "A canceled order can't be reopened" });
    } else {
        await pool.promise().query(`UPDATE orders SET status = ? WHERE order_id = ?`, [status, order_id]);
    }

    return res.status(200).json({
        message: "Order status updated successfully",
        order_id,
        new_status: status
    });
};
