import pool from "../../db/db_handle.js";

// Payment methods the storefront offers. Every order starts unpaid (payment_verified = 0):
// cash is confirmed by an admin after delivery, Bakong by polling the Bakong API.
export const PAYMENT_METHODS = ["By Delivery", "Bakong QR"];

// Current unit price per spec: the live promotion price if there is one, else the list price.
// Same rule the storefront uses (getProduct's price_discount), so stored totals match what the cart showed.
export const currentUnitPrices = async (connection, specIds) => {
    const [rows] = await connection.query(
        `SELECT s.spec_id,
                COALESCE(ROUND(s.price * (100 - MAX(pm.discount_percentage)) / 100, 2), s.price) AS unit_price
         FROM specifications s
         LEFT JOIN promotions pm ON pm.spec_id = s.spec_id
             AND CURDATE() BETWEEN DATE(pm.start_date) AND DATE(pm.end_date)
         WHERE s.spec_id IN (${specIds.map(() => "?").join(",")})
         GROUP BY s.spec_id, s.price`,
        specIds
    );
    return new Map(rows.map((r) => [r.spec_id, Number(r.unit_price)]));
};

export class OrderError extends Error {
    constructor(status, message, extra = {}) {
        super(message);
        this.status = status;
        this.extra = extra;
    }
}

// Creates an order in one transaction: checks every item exists and is in stock, takes the
// stock, then inserts the order and its lines with promotion-aware amounts and total.
// Returns { orderId, amountDue }.
export const placeOrder = async ({ customerId, recipientName, items, delivery, payment, location }) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new OrderError(400, "No items in cart");
    }
    const lines = items.map((item) => ({ specId: Number(item.spec_id), quantity: Number(item.quantity) }));
    if (lines.some((l) => !Number.isInteger(l.specId) || !Number.isInteger(l.quantity) || l.quantity < 1)) {
        throw new OrderError(400, "Each item needs a spec_id and a quantity of at least 1");
    }
    if (!PAYMENT_METHODS.includes(payment)) {
        throw new OrderError(400, `Payment must be one of: ${PAYMENT_METHODS.join(", ")}`);
    }

    // Merge duplicate lines so the stock check sees the full quantity per spec
    const wanted = new Map();
    for (const { specId, quantity } of lines) wanted.set(specId, (wanted.get(specId) || 0) + quantity);

    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();

        const ids = [...wanted.keys()];
        const [specRows] = await connection.query(
            `SELECT spec_id, stock FROM specifications WHERE spec_id IN (${ids.map(() => "?").join(",")}) FOR UPDATE`,
            ids
        );
        const stockById = new Map(specRows.map((r) => [r.spec_id, r.stock]));

        const missing = ids.filter((id) => !stockById.has(id));
        if (missing.length) {
            throw new OrderError(400, "Some cart items are no longer available. Please refresh your cart and try again.", { invalidSpecIds: missing });
        }
        const short = ids.filter((id) => stockById.get(id) < wanted.get(id));
        if (short.length) {
            throw new OrderError(400, "Not enough stock for some items", {
                outOfStock: short.map((id) => ({ spec_id: id, available: stockById.get(id), requested: wanted.get(id) })),
            });
        }

        const unitPrices = await currentUnitPrices(connection, ids);
        const lineAmount = (specId) => Math.round(unitPrices.get(specId) * wanted.get(specId) * 100) / 100;
        const amountDue = Math.round(ids.reduce((sum, id) => sum + lineAmount(id), 0) * 100) / 100;

        for (const [specId, quantity] of wanted) {
            await connection.query(`UPDATE specifications SET stock = stock - ? WHERE spec_id = ?`, [quantity, specId]);
        }

        const [orderResult] = await connection.query(
            `INSERT INTO orders (customer_id, recipient_name, delivery, payment, payment_verified, location)
             VALUES (?, ?, ?, ?, 0, ?)`,
            [customerId, recipientName, delivery, payment, location.trim()]
        );
        const orderId = orderResult.insertId;

        for (const [specId, quantity] of wanted) {
            const [line] = await connection.query(
                `INSERT INTO order_items (order_id, spec_id, quantity) VALUES (?, ?, ?)`,
                [orderId, specId, quantity]
            );
            // Set after the INSERT so a DB trigger computing list-price amounts can't overwrite it
            await connection.query(`UPDATE order_items SET amount = ? WHERE order_item_id = ?`, [lineAmount(specId), line.insertId]);
        }
        await connection.query(`UPDATE orders SET total_amount = ? WHERE order_id = ?`, [amountDue, orderId]);

        await connection.commit();
        return { orderId, amountDue };
    } catch (error) {
        await connection.rollback().catch(() => {});
        throw error;
    } finally {
        connection.release();
    }
};

// Puts an order's quantities back into stock (used when an order is canceled or removed).
export const restockOrder = (orderId, connection = pool.promise()) =>
    connection.query(
        `UPDATE specifications s
         JOIN (SELECT spec_id, SUM(quantity) AS qty FROM order_items WHERE order_id = ? GROUP BY spec_id) oi
           ON oi.spec_id = s.spec_id
         SET s.stock = s.stock + oi.qty`,
        [orderId]
    );
