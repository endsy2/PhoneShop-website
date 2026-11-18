import pool from "../db/db_handle.js";
import { normalizeRole, STAFF_ROLES } from "./rbac.js";

const payloadOf = (req) => req?.user?.user || {};

// Username of the logged-in caller, from the token payload set by validateToken_refresh_token.
// Older tokens nested the identity one level deeper or used `name`, so accept those shapes too.
export const resolveUsername = (req) => {
    const tokenPayload = payloadOf(req);
    if (typeof tokenPayload.username === "object") {
        return tokenPayload.username.username || tokenPayload.username.name || "";
    }
    return tokenPayload.username || tokenPayload.name || "";
};

// customers.customer_id of the caller, or null when the caller is not a logged-in customer.
// Tokens issued before ids were added to the payload are resolved by username.
export const resolveCustomerId = async (req) => {
    const payload = payloadOf(req);
    if (normalizeRole(payload.role) !== "customer") return null;
    if (payload.id) return payload.id;

    const username = resolveUsername(req);
    if (!username) return null;
    const [rows] = await pool.promise().query(
        `SELECT customer_id FROM customers WHERE username = ? LIMIT 1`,
        [username]
    );
    return rows[0]?.customer_id ?? null;
};

// admin.admin_id of the caller, or null for customers and tokens without an id (log in again).
export const resolveStaffId = (req) => {
    const payload = payloadOf(req);
    return STAFF_ROLES.includes(normalizeRole(payload.role)) ? payload.id ?? null : null;
};
