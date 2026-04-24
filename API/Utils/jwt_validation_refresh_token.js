import jwt from "jsonwebtoken";
import { generateAccessToken } from "./generateToken.js";
import { cookieConfig } from "./handleCookies.js";

export const validateToken_refresh_token = async (req, res, next) => {
  const token = req.cookies['access-token'];

  // console.log(token);

  if (!token) return res.sendStatus(401); // No token provided

  try {
    // Verify the access token first
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    return next(); // Access token is valid, proceed to the next middleware
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Access token expired");

      const refreshToken = req.cookies['refresh-token'];
      if (!refreshToken) {
        return res.status(403).json({ message: "No refresh token available" });
      }

      try {
        // Verify the refresh token
        const refreshUser = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        req.user = refreshUser;
        const refreshPayload = refreshUser?.user || {};
        const username =
          typeof refreshPayload.username === "object"
            ? refreshPayload.username.username || refreshPayload.username.name
            : refreshPayload.username || refreshPayload.name;
        const role =
          refreshPayload.role ??
          (typeof refreshPayload.username === "object"
            ? refreshPayload.username.role
            : undefined);

        // Generate a new access token only if the refresh token is valid
        const newAccessToken = generateAccessToken({ username, role });

        // Update the session with the new access token
        res.cookie('access-token', newAccessToken, cookieConfig);

        console.log("New access token generated:", newAccessToken);

        return next();
      } catch (err) {
        console.error("Invalid or expired refresh token");
        return res.status(403).json({ message: "Refresh token is expired or invalid" });
      }
    }

    console.error("Token verification failed", error);
    return res.status(403).json({ message: "Token verification failed" });
  }
};

