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

// Simple in-memory rate limiter
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // max requests per window

function rateLimiter(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, { count: 1, startTime: now });
    return next();
  }
  
  const clientData = rateLimitStore.get(clientIP);
  
  // Reset window if expired
  if (now - clientData.startTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientIP, { count: 1, startTime: now });
    return next();
  }
  
  // Check rate limit
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: "تم تجاوز الحد الأقصى للطلبات",
      message: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((clientData.startTime + RATE_LIMIT_WINDOW_MS - now) / 1000)
    });
  }
  
  // Increment count
  clientData.count++;
  next();
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

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
