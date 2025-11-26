/**
 * 🗄️ ملف اتصال قاعدة البيانات - Database Connection
 * نظام المرور المتكامل - University Traffic System
 * 
 * ⚠️ Security Note: Ensure proper environment variables are set in production
 */

import mysql from "mysql2/promise";

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.DB_PASSWORD) {
    console.warn('⚠️ Warning: DB_PASSWORD environment variable is not set');
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "traffic_system",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable SSL in production
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: true
    }
  })
});

export default pool;
