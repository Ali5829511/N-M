/**
 * 🚨 مسارات المخالفات - Violations Routes
 * نظام المرور المتكامل - University Traffic System
 */

import express from "express";
import pool from "../db.js";

const router = express.Router();

// الحصول على جميع المخالفات - Get all violations
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.*, veh.plate_number 
      FROM violations v 
      LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
      ORDER BY v.violation_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("خطأ في جلب المخالفات:", error);
    res.status(500).json({ error: "فشل في جلب المخالفات" });
  }
});

// الحصول على مخالفة بواسطة المعرف - Get violation by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.*, veh.plate_number 
      FROM violations v 
      LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
      WHERE v.violation_id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "المخالفة غير موجودة" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("خطأ في جلب المخالفة:", error);
    res.status(500).json({ error: "فشل في جلب المخالفة" });
  }
});

// الحصول على مخالفات مركبة معينة - Get violations by vehicle ID
router.get("/vehicle/:vehicleId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM violations WHERE vehicle_id = ? ORDER BY violation_date DESC",
      [req.params.vehicleId]
    );
    res.json(rows);
  } catch (error) {
    console.error("خطأ في جلب مخالفات المركبة:", error);
    res.status(500).json({ error: "فشل في جلب المخالفات" });
  }
});

// إضافة مخالفة جديدة - Add new violation
router.post("/", async (req, res) => {
  try {
    const { vehicle_id, violation_type, violation_date, location, officer_name, action_taken, status, image_path } = req.body;
    
    // Enhanced input validation
    if (!vehicle_id || !violation_type || !violation_date) {
      return res.status(400).json({ error: "البيانات الإلزامية مطلوبة: vehicle_id, violation_type, violation_date" });
    }

    // Validate vehicle_id is a positive integer
    const vehicleIdNum = parseInt(vehicle_id);
    if (isNaN(vehicleIdNum) || vehicleIdNum <= 0) {
      return res.status(400).json({ error: "معرف المركبة غير صالح" });
    }

    // Validate violation_type length
    if (typeof violation_type !== 'string' || violation_type.length > 100) {
      return res.status(400).json({ error: "نوع المخالفة غير صالح" });
    }

    // Validate date format
    const dateObj = new Date(violation_date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: "تاريخ المخالفة غير صالح" });
    }

    // Verify vehicle exists (foreign key validation)
    const [vehicleCheck] = await pool.query("SELECT vehicle_id FROM vehicles WHERE vehicle_id = ?", [vehicleIdNum]);
    if (vehicleCheck.length === 0) {
      return res.status(400).json({ error: "المركبة غير موجودة" });
    }

    // Sanitize optional string inputs (limit length)
    const sanitizedLocation = location ? String(location).slice(0, 100) : null;
    const sanitizedOfficer = officer_name ? String(officer_name).slice(0, 100) : null;
    const sanitizedAction = action_taken ? String(action_taken).slice(0, 100) : null;
    const sanitizedImagePath = image_path ? String(image_path).slice(0, 255) : null;

    const [result] = await pool.query(
      `INSERT INTO violations (vehicle_id, violation_type, violation_date, location, officer_name, action_taken, violation_status, image_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicleIdNum, violation_type, violation_date, sanitizedLocation, sanitizedOfficer, sanitizedAction, status || 'مفتوحة', sanitizedImagePath]
    );
    
    // تحديث last_seen للمركبة
    await pool.query("UPDATE vehicles SET last_seen = CURDATE() WHERE vehicle_id = ?", [vehicleIdNum]);
    
    // تحديث الإحصائيات
    await updateViolationStats(vehicleIdNum, violation_type);
    
    res.status(201).json({ 
      message: "🚨 تم تسجيل المخالفة بنجاح",
      violation_id: result.insertId
    });
  } catch (error) {
    console.error("خطأ في إضافة المخالفة:", error);
    res.status(500).json({ error: "فشل في إضافة المخالفة" });
  }
});

// تحديث مخالفة - Update violation
router.put("/:id", async (req, res) => {
  try {
    const { violation_type, violation_date, location, officer_name, action_taken, status, image_path } = req.body;
    
    const [result] = await pool.query(
      `UPDATE violations SET 
        violation_type = ?, violation_date = ?, location = ?, officer_name = ?, 
        action_taken = ?, violation_status = ?, image_path = ?
       WHERE violation_id = ?`,
      [violation_type, violation_date, location, officer_name, action_taken, status, image_path, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "المخالفة غير موجودة" });
    }
    
    res.json({ message: "✅ تم تحديث المخالفة بنجاح" });
  } catch (error) {
    console.error("خطأ في تحديث المخالفة:", error);
    res.status(500).json({ error: "فشل في تحديث المخالفة" });
  }
});

// حذف مخالفة - Delete violation
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM violations WHERE violation_id = ?", [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "المخالفة غير موجودة" });
    }
    
    res.json({ message: "✅ تم حذف المخالفة بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف المخالفة:", error);
    res.status(500).json({ error: "فشل في حذف المخالفة" });
  }
});

// دالة تحديث الإحصائيات - Update statistics function
async function updateViolationStats(vehicleId, violationType) {
  try {
    // التحقق من وجود سجل إحصائيات
    const [existing] = await pool.query(
      "SELECT * FROM violation_stats WHERE vehicle_id = ? AND violation_type = ?",
      [vehicleId, violationType]
    );
    
    if (existing.length > 0) {
      // تحديث السجل الموجود
      await pool.query(
        `UPDATE violation_stats SET 
          total_count = total_count + 1, 
          last_violation = NOW() 
         WHERE vehicle_id = ? AND violation_type = ?`,
        [vehicleId, violationType]
      );
    } else {
      // إنشاء سجل جديد
      await pool.query(
        `INSERT INTO violation_stats (vehicle_id, violation_type, total_count, last_violation) 
         VALUES (?, ?, 1, NOW())`,
        [vehicleId, violationType]
      );
    }
  } catch (error) {
    console.error("خطأ في تحديث الإحصائيات:", error);
  }
}

export default router;
