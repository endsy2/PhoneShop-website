import pool from "../../db/db_handle.js"
import { currentUnitPrices, restockOrder } from "../user/placeOrder.js";

export const OrderTableItemsByID = async (req, res) => {
    const { order_id } = req.params;

    const queryOrderItems = `SELECT 
    o.order_id,
    o.order_date,
    o.status,
    ot.order_item_id,
    ot.quantity,
    ot.amount AS amount_per_total_orderItem,
    pv.color,
    pv.idphone_variants,
    s.spec_id,
    s.price AS price_per_unit,
    pm.discount_percentage,
    GROUP_CONCAT(DISTINCT pdm.image ORDER BY pdm.image SEPARATOR ',') AS images,
    p.name AS phone_name,
    CASE
        WHEN pm.status = "Active" THEN ROUND(s.price * (100 - pm.discount_percentage) / 100, 2)
        ELSE s.price
    END AS discount_price_per_unit,
    o.total_amount AS total_before_discount,
    CASE
        WHEN pm.status = "Active" THEN ROUND(s.price * (100 - pm.discount_percentage) / 100, 2) * ot.quantity
        ELSE s.price * ot.quantity
    END AS total_after_discount
FROM 
    orders o  
INNER JOIN 
    order_items ot ON ot.order_id = o.order_id
LEFT JOIN 
    specifications s ON s.spec_id = ot.spec_id
INNER JOIN 
    phone_variants pv ON pv.idphone_variants = s.phone_variant_id
INNER JOIN 
    phones p ON p.phone_id = pv.phone_id
LEFT JOIN 
    productimage pdm ON pdm.phone_variant_id = pv.idphone_variants
LEFT JOIN 
    promotions pm ON pm.spec_id = s.spec_id
WHERE 
    o.order_id = ?
GROUP BY 
    o.order_id, 
    o.order_date,
    o.status,
    ot.order_item_id,
    ot.quantity,
    ot.amount,
    pv.color,
    pv.idphone_variants,
    s.spec_id,
    s.price,
    pm.discount_percentage,
    p.name,
    pm.status,
    o.total_amount

`

    const queryCustomer = `SELECT o.*, c.username, c.phone_number, c.address,
                            COALESCE(o.recipient_name, c.username) AS display_name
                            FROM orders o
                            INNER JOIN customers c ON 
                            c.customer_id = o.customer_id
                            WHERE o.order_id = ?;`

    try {
        // Execute both queries
        const orderItems = await new Promise((resolve, reject) => {
            pool.query(queryOrderItems, [order_id], (err, rows) => {
                if (err) {
                    return reject(new Error("Order data error"));
                }
                resolve(rows);
            });
        });

        const customerData = await new Promise((resolve, reject) => {
            pool.query(queryCustomer, [order_id], (err, rows) => {
                if (err) {
                    return reject(new Error("Customer data error"));
                }
                resolve(rows);
            });
        });

        // Return both results in the response
        return res.status(200).json({
            orderItems,
            customerData
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const orderByID = (req, res) => {
    const { order_id } = req.params;

    const query = `SELECT * FROM orders o
                    INNER JOIN customers c ON
                    c.customer_id=o.customer_id
                    WHERE order_id=?`
    pool.promise().query(query, [order_id])
        .then(([rows]) => {
            return res.status(200).json({
                message: "successfully",
                data: rows
            })
        })
        .catch((error) => {
            return res.status(400).json({
                message: "something went wrong"
            })
        })
}
export const orderTable = async (req, res) => {
    const [data] = await pool.promise().query(
        `SELECT o.*, c.username, COALESCE(o.recipient_name, c.username) AS display_name
         FROM orders o
         INNER JOIN customers c ON c.customer_id = o.customer_id`
    );
    return res.status(200).json({ message: "successfully", data });
};

// orders.total_amount is filled by a DB trigger on INSERT only; recompute it after edits/deletes.
const recalcOrderTotal = (orderId, connection = pool.promise()) =>
    connection.query(
        `UPDATE orders
         SET total_amount = (SELECT COALESCE(SUM(amount), 0) FROM order_items WHERE order_id = ?)
         WHERE order_id = ?`,
        [orderId, orderId]
    );

// Change an order line to another phone/colour and/or quantity, keeping the line's storage size.
// Stock follows the change: the old quantity goes back, the new one is taken.
export const updateOrderitems = async (req, res) => {
    const { phone_name, color, order_items_id } = req.body;
    const quantity = Number(req.body.quantity);

    if (!phone_name || !color || !order_items_id || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();
        const fail = async (status, message) => {
            await connection.rollback();
            return res.status(status).json({ message });
        };

        const [[line]] = await connection.query(
            `SELECT ot.order_id, ot.spec_id, ot.quantity, cur.storage, o.status
             FROM order_items ot
             JOIN specifications cur ON cur.spec_id = ot.spec_id
             JOIN orders o ON o.order_id = ot.order_id
             WHERE ot.order_item_id = ?
             FOR UPDATE`,
            [order_items_id]
        );
        if (!line) return fail(404, "Order item not found");
        if (line.status === "canceled") return fail(400, "A canceled order can't be edited");

        const [[spec]] = await connection.query(
            `SELECT s.spec_id
             FROM phones p
             JOIN phone_variants pv ON pv.phone_id = p.phone_id AND pv.color = ?
             JOIN specifications s ON s.phone_variant_id = pv.idphone_variants AND s.storage = ?
             WHERE p.name = ?
             LIMIT 1
             FOR UPDATE`,
            [color, line.storage, phone_name]
        );
        if (!spec) return fail(404, "That phone/colour has no spec with the same storage");

        await connection.query(`UPDATE specifications SET stock = stock + ? WHERE spec_id = ?`, [line.quantity, line.spec_id]);
        const [taken] = await connection.query(
            `UPDATE specifications SET stock = stock - ? WHERE spec_id = ? AND stock >= ?`,
            [quantity, spec.spec_id, quantity]
        );
        if (taken.affectedRows === 0) return fail(400, "Not enough stock for that change");

        const unitPrice = (await currentUnitPrices(connection, [spec.spec_id])).get(spec.spec_id);
        const [result] = await connection.query(
            `UPDATE order_items SET quantity = ?, spec_id = ?, amount = ? WHERE order_item_id = ?`,
            [quantity, spec.spec_id, Math.round(unitPrice * quantity * 100) / 100, order_items_id]
        );
        await recalcOrderTotal(line.order_id, connection);
        await connection.commit();
        return res.status(200).json({ message: "Order updated successfully", data: result });
    } catch (error) {
        await connection.rollback().catch(() => {});
        throw error;
    } finally {
        connection.release();
    }
};
// Delete an order and its lines. A still-pending order's items go back to stock;
// shipped/delivered goods have left the shop and canceled orders were already restocked.
export const deleteOrder = async (req, res) => {
    const { DeleteOrderID } = req.params;

    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();
        const [[order]] = await connection.query(
            `SELECT status FROM orders WHERE order_id = ? FOR UPDATE`,
            [DeleteOrderID]
        );
        if (!order) {
            await connection.rollback();
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status === "pending") {
            await restockOrder(DeleteOrderID, connection);
        }
        await connection.query(`DELETE FROM order_items WHERE order_id = ?`, [DeleteOrderID]);
        const [rows] = await connection.query(`DELETE FROM orders WHERE order_id = ?`, [DeleteOrderID]);
        await connection.commit();
        return res.status(200).json({ message: "Successfully deleted order", data: rows });
    } catch (error) {
        await connection.rollback().catch(() => {});
        throw error;
    } finally {
        connection.release();
    }
};
// Remove one line; a pending order's quantity goes back to stock.
export const deleteOrderItems = async (req, res) => {
    const { orderItemsID } = req.params;

    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();
        const [[line]] = await connection.query(
            `SELECT ot.order_id, ot.spec_id, ot.quantity, o.status
             FROM order_items ot JOIN orders o ON o.order_id = ot.order_id
             WHERE ot.order_item_id = ?
             FOR UPDATE`,
            [orderItemsID]
        );
        if (!line) {
            await connection.rollback();
            return res.status(404).json({ message: "Order item not found" });
        }
        if (line.status === "pending") {
            await connection.query(`UPDATE specifications SET stock = stock + ? WHERE spec_id = ?`, [line.quantity, line.spec_id]);
        }
        const [rows] = await connection.query(`DELETE FROM order_items WHERE order_item_id = ?`, [orderItemsID]);
        await recalcOrderTotal(line.order_id, connection);
        await connection.commit();
        return res.status(200).json({ data: rows, message: "successfully" });
    } catch (error) {
        await connection.rollback().catch(() => {});
        throw error;
    } finally {
        connection.release();
    }
};
export const headerOrder = (req, res) => {
    const query = `
        SELECT 
    s.status,
    COUNT(o.status) AS count
FROM 
    (SELECT 'pending' AS status
     UNION ALL
     SELECT 'completed'
     UNION ALL
     SELECT 'canceled') s
LEFT JOIN 
    orders o
ON 
    s.status = o.status
GROUP BY 
    s.status;

    `
    try {
        pool.promise().query(query).then((rows) => {
            res.status(200).json({
                message: "successfully",
                data: rows[0]
            })
        }).catch((error) => {
            res.status(400).json({
                message: "something went wrong",
            })
        })
    } catch (error) {
        res.status(500).json({
            message: "something went wrong"
        })
    }
}
export const searchOrder = (req, res) => {
    const { username } = req.query;

    const query = `SELECT o.*, c.username, COALESCE(o.recipient_name, c.username) AS display_name
FROM orders o
INNER JOIN customers c 
ON c.customer_id = o.customer_id
WHERE c.username LIKE ? OR o.recipient_name LIKE ?;`
    if (!username) {
        return res.status(400).json({ message: "Enter User name" })
    }
    pool.promise().query(query, [`%${username}%`, `%${username}%`])
        .then(([rows]) => {
            return res.status(200).json({
                data: rows,
                message: "successfully"
            })
        })
        .catch((error) => {
            return res.status(400).json({
                message: "something went wrong"
            })
        })
}