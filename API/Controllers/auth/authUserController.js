import pool from "../../db/db_handle.js";
import bcrypt from "bcrypt"; // Make sure bcrypt is imported
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../Utils/generateToken.js";
import { cookieConfig } from "../../Utils/handleCookies.js";

export const handlelogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({
      message: "All fields must not be empty",
    });
  }

  try {
    const sql = `SELECT * FROM customers WHERE email=?`;
    const [rows] = await pool.promise().query(sql, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const userPayLoad = { username: user.username, role: 2 };
    const accessToken = generateAccessToken(userPayLoad);
    const refreshToken = generateRefreshToken(userPayLoad);

    res.cookie('access-token', accessToken, cookieConfig);
    res.cookie('refresh-token', refreshToken, cookieConfig);

    return res.json({
      token: accessToken,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const register = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);

  // Validate that all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields must be filled" });
  }

  try {
    // Hash the password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const queryInsert =
      "INSERT INTO customers (username, email, password) VALUES ( ?, ?, ?)";
    const values = [username, email, hashedPassword];

    pool.query(queryInsert, values, (error, result) => {
      if (error) {
        console.error("Database insert error:", error.message); // Log for debugging
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email or phone already exists" });
        }
        return res
          .status(500)
          .json({ message: "Something went wrong while inserting the user" });
      }

      // Generate tokens using input data
      const payload = { username, role: 2 };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Set tokens in cookies
      res.cookie("access-token", accessToken, cookieConfig);
      res.cookie("refresh-token", refreshToken, cookieConfig);

      return res
        .status(201)
        .json({ message: "User registered successfully", token: accessToken });
    });
  } catch (error) {
    console.error("Error:", error.message); // Log for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const adminlogout = (req, res) => {
//   try {
//     // Clear cookies with matching options (path, secure, httpOnly)
//     res.clearCookie('admin-access-token', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
//     res.clearCookie('admin-refresh-token', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });

//     res.status(200).json({ message: "Logout successfully" });
//   } catch (error) {
//     console.error("Error during logout:", error);
//     return res.status(400).json({ message: "Something went wrong" });
//   }
// };
export const logout = (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const clearOptions = { path: "/", httpOnly: true, secure: isProduction };
    res.clearCookie('access-token', clearOptions);
    res.clearCookie('refresh-token', clearOptions);
    res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};
