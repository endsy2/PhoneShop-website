import { config } from "dotenv";
import express from "express";
import pool from "./db/db_handle.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminRouter from "./Routs/AdminHandle.js";
import AuthRouter from "./Routs/Auth.js";
import commonRouter from "./Routs/Common.js";
import userRouter from "./Routs/User.js";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// Express 5 leaves req.body undefined when no body was sent; handlers destructure it.
app.use((req, res, next) => {
  req.body ??= {};
  next();
});
app.use(cookieParser());
// Serve uploaded images under /uploads path so frontend can access them as http://localhost:3000/uploads/filename
app.use("/uploads", express.static("uploads"));
// Also serve from root for backward compatibility with existing image URLs
app.use(express.static("uploads"));
// CORS_ORIGINS: comma-separated frontend URLs allowed to call the API with cookies.
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim());
app.use(cors({ origin: corsOrigins, credentials: true }));

// Establish database connection
pool.getConnection((error, connection) => {
  if (error) {
    console.error("Failed to connect to the database:", error);
    return;
  }
  connection.release();
  console.log("Successfully connected to the database.");
});

app.use("/auth", AuthRouter);
app.use("/admin", adminRouter);
app.use("/common", commonRouter);
app.use("/user", userRouter);

// Last stop for any error a handler throws or rejects with (Express 5 forwards async errors here).
app.use((err, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl} failed:`, err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: "Internal server error" });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
