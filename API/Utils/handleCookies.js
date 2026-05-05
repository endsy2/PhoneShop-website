export const cookieConfig = {
    httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not accessible to JavaScript
    secure: process.env.NODE_ENV === "production", // Only require HTTPS in production; allow HTTP on localhost
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax", // Lax allows cross-origin on localhost
    path: "/", // Ensures the cookie is sent for all paths
};