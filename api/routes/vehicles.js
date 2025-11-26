/**
 * 🚗 مسارات المركبات - Vehicles Routes
 * نظام المرور المتكامل - University Traffic System
 */

import express from "express";
import pool from "../db.js";

const router = express.Router();

// الحصول على جميع المركبات - Get all vehicles
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vehicles ORDER BY vehicle_id DESC");
    res.json(rows);
  } catch (error) {
    console.error("خطأ في جلب المركبات:", error);
    res.status(500).json({ error: "فشل في جلب المركبات" });
  }
});

// الحصول على مركبة بواسطة المعرف - Get vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vehicles WHERE vehicle_id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "المركبة غير موجودة" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("خطأ في جلب المركبة:", error);
    res.status(500).json({ error: "فشل في جلب المركبة" });
  }
});

// البحث عن مركبة برقم اللوحة - Search vehicle by plate number
router.get("/search/:plate", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM vehicles WHERE plate_number LIKE ?",
      [`%${req.params.plate}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error("خطأ في البحث عن المركبة:", error);
    res.status(500).json({ error: "فشل في البحث" });
  }
});

// إضافة مركبة جديدة - Add new vehicle
router.post("/", async (req, res) => {
  try {
    const { plate_number, vehicle_type, color, status } = req.body;
    
    if (!plate_number) {
      return res.status(400).json({ error: "رقم اللوحة مطلوب" });
    }

    const [result] = await pool.query(
      "INSERT INTO vehicles (plate_number, vehicle_type, color, status, first_seen, last_seen) VALUES (?, ?, ?, ?, CURDATE(), CURDATE())",
      [plate_number, vehicle_type, color, status || 'نشط']
    );
    
    res.status(201).json({ 
      message: "✅ تمت إضافة المركبة بنجاح",
      vehicle_id: result.insertId
    });
  } catch (error) {
    console.error("خطأ في إضافة المركبة:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: "رقم اللوحة موجود مسبقاً" });
    } else {
      res.status(500).json({ error: "فشل في إضافة المركبة" });
    }
  }
});

// تحديث مركبة - Update vehicle
router.put("/:id", async (req, res) => {
  try {
    const { plate_number, vehicle_type, color, status } = req.body;
    
    const [result] = await pool.query(
      "UPDATE vehicles SET plate_number = ?, vehicle_type = ?, color = ?, status = ?, last_seen = CURDATE() WHERE vehicle_id = ?",
      [plate_number, vehicle_type, color, status, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "المركبة غير موجودة" });
    }
    
    res.json({ message: "✅ تم تحديث المركبة بنجاح" });
  } catch (error) {
    console.error("خطأ في تحديث المركبة:", error);
    res.status(500).json({ error: "فشل في تحديث المركبة" });
  }
});

// حذف مركبة - Delete vehicle
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM vehicles WHERE vehicle_id = ?", [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "المركبة غير موجودة" });
    }
    
    res.json({ message: "✅ تم حذف المركبة بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف المركبة:", error);
    res.status(500).json({ error: "فشل في حذف المركبة" });
  }
});

// الحصول على صور المركبة - Get vehicle images
router.get("/:id/images", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY capture_date DESC",
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("خطأ في جلب صور المركبة:", error);
    res.status(500).json({ error: "فشل في جلب الصور" });
  }
});

// إضافة صورة للمركبة - Add image to vehicle
router.post("/:id/images", async (req, res) => {
  try {
    const { image_path, capture_date } = req.body;
    
    const [result] = await pool.query(
      "INSERT INTO vehicle_images (vehicle_id, image_path, capture_date) VALUES (?, ?, ?)",
      [req.params.id, image_path, capture_date || new Date()]
    );
    
    res.status(201).json({ 
      message: "✅ تمت إضافة الصورة بنجاح",
      image_id: result.insertId
    });
  } catch (error) {
    console.error("خطأ في إضافة الصورة:", error);
    res.status(500).json({ error: "فشل في إضافة الصورة" });
  }
});

export default router;
