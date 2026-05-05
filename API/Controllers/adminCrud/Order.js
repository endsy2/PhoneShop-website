import pool from "../../db/db_handle.js"


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
                    console.log(err);
                    return reject(new Error("Order data error"));
                }
                resolve(rows);
            });
        });

        const customerData = await new Promise((resolve, reject) => {
            pool.query(queryCustomer, [order_id], (err, rows) => {
                if (err) {
                    console.log(err);
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
                message: "something went wrong",
                error: error
            })
        })
}
export const orderTable = async (req, res) => {
    const query = `SELECT o.*, c.username, COALESCE(o.recipient_name, c.username) AS display_name
                FROM orders o 
                INNER JOIN customers c ON 
                c.customer_id=o.customer_id;`
    try {
        await pool.promise().query(query).then(([data]) => {
            return res.status(200).json({
                message: "successfully",
                data: data
            })
        }).catch((err) => {
            console.log(err);
            return res.status(400).json({
                message: "something went wrong"
            })
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateOrderitems = (req, res) => {
    // The SQL query to update the order
    const query = `
        UPDATE order_items ot
        SET ot.quantity=?,
            ot.phone_variants_id=(SELECT pv.idphone_variants FROM phone_variants pv
                                INNER JOIN phones p ON
                                pv.phone_id=p.phone_id
                                WHERE p.name=? AND pv.color=?
                                LIMIT 1),
            ot.amount=(SELECT price FROM phone_variants WHERE idphone_variants=ot.phone_variants_id)*ot.quantity
        WHERE order_item_id=?;
    `;

    // Accessing parameters from the request

    const { phone_name, quantity, color, order_items_id } = req.body; // Request body

    // Validate the parameters
    if (!phone_name || !quantity || !color || !order_items_id) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Prepare the values for the SQL query
    const values = [
        quantity,
        phone_name,
        color,
        order_items_id
    ];



    // Execute the query with the prepared values using .then() and .catch()
    pool.promise().query(query, values)
        .then(([newUpdate]) => {
            // If the query is successful, send the response
            res.status(200).json({
                message: "Order updated successfully",
                data: newUpdate
            });
        })
        .catch((error) => {
            // If there is an error, send an error message
            console.error(error);
            res.status(500).json({ message: "Something went wrong", error: error.message });
        });
};
export const deleteOrder = (req, res) => {
    const { DeleteOrderID } = req.params;

    const queryDeleteOrderItems = `
        DELETE FROM order_items
        WHERE order_id = ?
    `;
    const queryDeleteOrders = `
        DELETE FROM orders
        WHERE order_id = ?
    `;

    pool.promise()
        .query(queryDeleteOrderItems, [DeleteOrderID]) // Delete from order_items first
        .then(() => {
            // Delete from orders after order_items are deleted
            return pool.promise().query(queryDeleteOrders, [DeleteOrderID]);
        })
        .then(([rows]) => {
            // Send success response
            res.status(200).json({
                message: "Successfully deleted order",
                data: rows,
            });
        })
        .catch((error) => {
            // Handle errors in either query
            console.error("Error while deleting order:", error);
            res.status(400).json({
                message: "Something went wrong",
                error: error.message,
            });
        });
};
export const deleteOrderItems = (req, res) => {
    const { orderItemsID } = req.params;
    const query = `DELETE FROM order_items 
                WHERE order_item_id=?`;
    try {
        pool.promise()
            .query(query, [orderItemsID])
            .then(([rows]) => {
                return res.status(200).json({
                    data: rows,
                    message: "successfully"
                })
            }).catch((error) => {
                return res.status(400).json({
                    message: "something went wrong "
                })
            })
    } catch (error) {
        console.log(error);

    }
}
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
        console.log(error);
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
                message: "something went wrong",
                error: error
            })
        })
}