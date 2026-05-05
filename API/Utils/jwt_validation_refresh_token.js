import jwt from "jsonwebtoken";
import { generateAccessToken } from "./generateToken.js";
import { cookieConfig } from "./handleCookies.js";

export const validateToken_refresh_token = async (req, res, next) => {
  const token = req.cookies['access-token'];

  if (!token) return res.sendStatus(401); // No token provided

  try {
    // Verify the access token first
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    return next(); // Access token is valid, proceed to the next middleware
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Access token expired, attempting refresh...");

      const refreshToken = req.cookies['refresh-token'];
      if (!refreshToken) {
        return res.status(403).json({ message: "No refresh token available" });
      }

      try {
        // Verify the refresh token
        const refreshUser = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        req.user = refreshUser;

        // Extract payload — tokens are always signed as { user: { username, role } }
        const payload = refreshUser?.user || {};
        const username = payload.username || payload.name || "";
        const role = payload.role;

        // Generate a new access token
        const newAccessToken = generateAccessToken({ username, role });
        res.cookie('access-token', newAccessToken, cookieConfig);

        console.log("New access token generated for:", username);
        return next();
      } catch (err) {
        console.error("Invalid or expired refresh token");
        return res.status(403).json({ message: "Session expired. Please log in again." });
      }
    }

    console.error("Token verification failed:", error.message);
    return res.status(403).json({ message: "Token verification failed" });
  }
};
