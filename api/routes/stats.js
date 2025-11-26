/**
 * 📊 مسارات الإحصائيات - Statistics Routes
 * نظام المرور المتكامل - University Traffic System
 */

import express from "express";
import pool from "../db.js";

const router = express.Router();

// الحصول على الإحصائيات العامة - Get general statistics
router.get("/", async (req, res) => {
  try {
    const [[vehicles]] = await pool.query("SELECT COUNT(*) AS total_vehicles FROM vehicles");
    const [[violations]] = await pool.query("SELECT COUNT(*) AS total_violations FROM violations");
    const [[openViolations]] = await pool.query("SELECT COUNT(*) AS open_violations FROM violations WHERE violation_status = 'مفتوحة'");
    const [[images]] = await pool.query("SELECT COUNT(*) AS total_images FROM vehicle_images");

    res.json({
      totalVehicles: vehicles.total_vehicles,
      totalViolations: violations.total_violations,
      openViolations: openViolations.open_violations,
      totalImages: images.total_images
    });
  } catch (error) {
    console.error("خطأ في جلب الإحصائيات:", error);
    res.status(500).json({ error: "فشل في جلب الإحصائيات" });
  }
});

// إحصائيات المخالفات حسب النوع - Violations by type
router.get("/by-type", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT violation_type, COUNT(*) AS count 
      FROM violations 
      GROUP BY violation_type 
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("خطأ في جلب إحصائيات الأنواع:", error);
    res.status(500).json({ error: "فشل في جلب الإحصائيات" });
  }
});

// إحصائيات المخالفات حسب الحالة - Violations by status
router.get("/by-status", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT violation_status, COUNT(*) AS count 
      FROM violations 
      GROUP BY violation_status 
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("خطأ في جلب إحصائيات الحالات:", error);
    res.status(500).json({ error: "فشل في جلب الإحصائيات" });
  }
});

// إحصائيات المركبات الأكثر مخالفة - Top violating vehicles
router.get("/top-violators", async (req, res) => {
  try {
    // Add bounds checking for limit parameter (max 100)
    const requestedLimit = parseInt(req.query.limit) || 10;
    const limit = Math.min(Math.max(1, requestedLimit), 100);
    
    const [rows] = await pool.query(`
      SELECT v.plate_number, v.vehicle_type, COUNT(vio.violation_id) AS violation_count
      FROM vehicles v
      LEFT JOIN violations vio ON v.vehicle_id = vio.vehicle_id
      GROUP BY v.vehicle_id
      HAVING violation_count > 0
      ORDER BY violation_count DESC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (error) {
    console.error("خطأ في جلب أكثر المركبات مخالفة:", error);
    res.status(500).json({ error: "فشل في جلب الإحصائيات" });
  }
});

// إحصائيات مركبة محددة - Statistics for specific vehicle
router.get("/vehicle/:vehicleId", async (req, res) => {
  try {
    const [stats] = await pool.query(
      "SELECT * FROM violation_stats WHERE vehicle_id = ?",
      [req.params.vehicleId]
    );
    
    const [[totalViolations]] = await pool.query(
      "SELECT COUNT(*) AS count FROM violations WHERE vehicle_id = ?",
      [req.params.vehicleId]
    );
    
    const [[openViolations]] = await pool.query(
      "SELECT COUNT(*) AS count FROM violations WHERE vehicle_id = ? AND violation_status = 'مفتوحة'",
      [req.params.vehicleId]
    );

    res.json({
      detailedStats: stats,
      totalViolations: totalViolations.count,
      openViolations: openViolations.count
    });
  } catch (error) {
    console.error("خطأ في جلب إحصائيات المركبة:", error);
    res.status(500).json({ error: "فشل في جلب الإحصائيات" });
  }
});

// إحصائيات المخالفات الشهرية - Monthly violations statistics
router.get("/monthly", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(violation_date, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM violations
      WHERE violation_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(violation_date, '%Y-%m')
      ORDER BY month DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("خطأ في جلب الإحصائيات الشهرية:", error);
    res.status(500).json({ error: "فشل في جلب الإحصائيات" });
  }
});

// تقرير شامل - Comprehensive report
router.get("/report", async (req, res) => {
  try {
    const [[vehicles]] = await pool.query("SELECT COUNT(*) AS count FROM vehicles");
    const [[activeVehicles]] = await pool.query("SELECT COUNT(*) AS count FROM vehicles WHERE status = 'نشط'");
    const [[violations]] = await pool.query("SELECT COUNT(*) AS count FROM violations");
    const [[openViolations]] = await pool.query("SELECT COUNT(*) AS count FROM violations WHERE violation_status = 'مفتوحة'");
    const [[closedViolations]] = await pool.query("SELECT COUNT(*) AS count FROM violations WHERE violation_status = 'مغلقة'");
    const [[totalFines]] = await pool.query("SELECT COALESCE(SUM(total_fines), 0) AS total FROM violation_stats");
    
    const [recentViolations] = await pool.query(`
      SELECT v.*, veh.plate_number 
      FROM violations v 
      LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
      ORDER BY v.violation_date DESC 
      LIMIT 5
    `);

    res.json({
      summary: {
        totalVehicles: vehicles.count,
        activeVehicles: activeVehicles.count,
        totalViolations: violations.count,
        openViolations: openViolations.count,
        closedViolations: closedViolations.count,
        totalFines: totalFines.total
      },
      recentViolations
    });
  } catch (error) {
    console.error("خطأ في إنشاء التقرير:", error);
    res.status(500).json({ error: "فشل في إنشاء التقرير" });
  }
});

export default router;
