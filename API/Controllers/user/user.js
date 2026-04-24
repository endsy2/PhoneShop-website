import pool from "../../db/db_handle.js";

const resolveUsername = (req) => {
    const tokenPayload = req?.user?.user || {};
    if (typeof tokenPayload.username === "object") {
        return tokenPayload.username.username || tokenPayload.username.name || "";
    }
    return tokenPayload.username || tokenPayload.name || "";
};

export const getUserInformation = async (req, res) => {
    try {
        const username = resolveUsername(req);
        // console.log(username);



        if (!username) {
            return res.status(400).json({
                message: "Missing required parameter: username",
            });
        }

        const query = `SELECT * FROM customers WHERE username = ?`;


        const [rows] = await pool.promise().query(query, [username]);

        return res.status(200).json({
            data: rows,
            message: "Successfully retrieved user information",
        });
    } catch (err) {
        console.error("Error fetching user information:", err);
        return res.status(500).json({
            error: err.message,
            message: "Something went wrong",
        });
    }
};
export const getOrderByName = async (req, res) => {
    const username = resolveUsername(req);
    const queryOrderItems = `SELECT 
    o.order_id,
    c.username,
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
INNER JOIN 
	customers c ON c.customer_id=o.customer_id
WHERE 
	c.username=?
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
    try {

        const [response] = await pool.promise().query(queryOrderItems, [username]);
        console.log(response);
        return res.status(200).json({
            message: "successfully",
            data: response
        })
    } catch (error) {
        console.error(error);
    }

}