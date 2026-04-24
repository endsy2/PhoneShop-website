import pool from "../../db/db_handle.js";

const resolveUsername = (req) => {
    const tokenPayload = req?.user?.user || {};
    if (typeof tokenPayload.username === "object") {
        return tokenPayload.username.username || tokenPayload.username.name || "";
    }
    return tokenPayload.username || tokenPayload.name || "";
};

export const checkout = async (req, res) => {
    try {
        const { items, delivery, payment, location, customerName } = req.body;
        const fallbackUserName = resolveUsername(req);

        // Prefer the name entered at checkout; otherwise fall back to token payload.
        let userName = customerName?.trim() || fallbackUserName || "";



        console.log(req.body);
        console.log(userName);

        if (!userName || !items || !Array.isArray(items) || !delivery || !payment || !location) {
            return res.status(400).json({ message: "Invalid input data" });
        }


        // Find the customer ID
        const queryFindCustomerID = `SELECT customer_id FROM customers WHERE username = ?`;
        let [customerRows] = await pool.promise().query(queryFindCustomerID, [userName]);

        // If the entered name does not exist, use the authenticated account username.
        if (
            customerRows.length === 0 &&
            fallbackUserName &&
            userName !== fallbackUserName
        ) {
            userName = fallbackUserName;
            [customerRows] = await pool.promise().query(queryFindCustomerID, [userName]);
        }

        if (customerRows.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const customer_id = customerRows[0].customer_id;

        console.log("Customer ID:", customer_id);

        // Insert into orders
        const queryInsertOrders = `INSERT INTO orders (customer_id,delivery,payment,location) VALUES (?,?,?,?)`;
        const [ordersRows] = await pool.promise().query(queryInsertOrders, [customer_id, delivery, payment, location]);

        const order_id = ordersRows.insertId;

        console.log("Order ID:", order_id);

        // Prepare bulk insert for order items
        const queryInsertOrderItem = `INSERT INTO order_items (order_id, spec_id, quantity) VALUES ?`;
        const orderItems = items.map(item => [order_id, item.spec_id, item.quantity]);

        if (orderItems.length > 0) {
            await pool.promise().query(queryInsertOrderItem, [orderItems]);
        }

        console.log("Order items inserted successfully.");

        res.status(201).json({ message: "Order placed successfully", orderId: order_id });
    } catch (error) {
        console.error("Error in checkout:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
