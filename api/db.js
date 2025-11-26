/**
 * 🗄️ ملف اتصال قاعدة البيانات - Database Connection
 * نظام المرور المتكامل - University Traffic System
 */

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "traffic_system",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
