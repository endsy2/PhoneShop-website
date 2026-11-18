import bcrypt from "bcrypt";
import pool from "../../db/db_handle.js";
import { generateAccessToken, generateRefreshToken } from "../../Utils/generateToken.js";
import { cookieConfig } from "../../Utils/handleCookies.js";
import { permissionsFor, STAFF_ROLES } from "../../Utils/rbac.js";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const sql = "SELECT * FROM admin WHERE email = ?";
    const [rows] = await pool.promise().query(sql, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const admin = rows[0];

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Rows created before migrations/add_admin_role.sql have no role; they keep full admin rights.
    const role = STAFF_ROLES.includes(admin.role) ? admin.role : "admin";

    // Generate tokens
    const adminPayload = { id: admin.admin_id, name: admin.adminname, role };
    const accessToken = generateAccessToken(adminPayload);
    const refreshToken = generateRefreshToken(adminPayload);

    res.cookie('access-token', accessToken, cookieConfig);
    res.cookie('refresh-token', refreshToken, cookieConfig);

    return res.status(200).json({
      token: accessToken,
      role,
      permissions: permissionsFor(role),
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Error during admin login:", error.message);
    return res.status(500).json({ message: "An internal server error occurred" });
  }
};

// Creates a staff account. Route is guarded by authorize("staff:manage"), so only admins reach it.
// Does not log the new staff member in; the caller stays signed in as themselves.
export const adminRegister = async (req, res) => {
  const { username, email, password, role = "support" } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields must be filled" });
  }
  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${STAFF_ROLES.join(", ")}` });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.promise().query(
      "INSERT INTO admin (adminname, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );
    return res.status(201).json({ message: "Staff account created", role });
  } catch (error) {
    console.error("Error creating staff account:", error.message);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email or username already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
