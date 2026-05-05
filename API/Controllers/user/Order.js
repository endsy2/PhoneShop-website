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

        // Always resolve the customer from the JWT token — never from the typed name
        const tokenUsername = resolveUsername(req);

        if (!tokenUsername) {
            return res.status(401).json({ message: "Not authenticated. Please log in." });
        }

        if (!items || !Array.isArray(items) || items.length === 0 || !delivery || !payment || !location) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        // Find customer by their account username from the token
        const [customerRows] = await pool.promise().query(
            `SELECT customer_id FROM customers WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) LIMIT 1`,
            [tokenUsername]
        );

        if (customerRows.length === 0) {
            return res.status(404).json({ message: "Customer account not found. Please log in again." });
        }

        const customer_id = customerRows[0].customer_id;

        // Validate all spec_ids exist in specifications table before inserting
        const specIds = items.map(item => item.spec_id).filter(Boolean);
        if (specIds.length === 0) {
            return res.status(400).json({ message: "No valid items in cart" });
        }

        const placeholders = specIds.map(() => '?').join(',');
        const [specRows] = await pool.promise().query(
            `SELECT spec_id FROM specifications WHERE spec_id IN (${placeholders})`,
            specIds
        );

        const validSpecIds = new Set(specRows.map(r => r.spec_id));
        const invalidItems = items.filter(item => !validSpecIds.has(Number(item.spec_id)));

        if (invalidItems.length > 0) {
            return res.status(400).json({
                message: "Some cart items are no longer available. Please refresh your cart and try again.",
                invalidSpecIds: invalidItems.map(i => i.spec_id)
            });
        }

        // Insert into orders — store recipient_name separately from location
        const recipientName = customerName?.trim() || tokenUsername;
        const [ordersRows] = await pool.promise().query(
            `INSERT INTO orders (customer_id, recipient_name, delivery, payment, location) VALUES (?, ?, ?, ?, ?)`,
            [customer_id, recipientName, delivery, payment, location.trim()]
        );

        const order_id = ordersRows.insertId;

        // Insert order items
        for (const item of items) {
            await pool.promise().query(
                `INSERT INTO order_items (order_id, spec_id, quantity) VALUES (?, ?, ?)`,
                [order_id, item.spec_id, item.quantity]
            );
        }

        res.status(201).json({ message: "Order placed successfully", orderId: order_id });
    } catch (error) {
        console.error("Error in checkout:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
