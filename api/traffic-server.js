/**
 * 🚦 خادم API نظام المرور - Traffic System API Server
 * University Traffic Management System
 * 
 * هذا الملف هو نقطة الدخول الرئيسية لـ API نظام المرور
 */

import express from "express";
import cors from "cors";
import vehiclesRoutes from "./routes/vehicles.js";
import violationsRoutes from "./routes/violations.js";
import statsRoutes from "./routes/stats.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/violations", violationsRoutes);
app.use("/api/stats", statsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "🚦 نظام المرور يعمل بنجاح",
    timestamp: new Date().toISOString()
  });
});

// Welcome endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "🚦 University Traffic API",
    version: "1.0.0",
    description: "نظام المرور المتكامل - إدارة المركبات والمخالفات",
    endpoints: {
      vehicles: "/api/vehicles",
      violations: "/api/violations",
      stats: "/api/stats",
      health: "/api/health"
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "المسار غير موجود",
    path: req.url
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ خطأ في الخادم:", err);
  res.status(500).json({ 
    error: "خطأ داخلي في الخادم",
    message: err.message
  });
});

// Start server
const PORT = process.env.TRAFFIC_API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚦 University Traffic API يعمل على http://localhost:${PORT}`);
  console.log(`📚 للاطلاع على التوثيق: http://localhost:${PORT}/api`);
});

export default app;
