// API Endpoints for Android ALPR Integration
// Add these endpoints to your server.js or api-server.js

const express = require('express');
const router = express.Router();

// Middleware للمصادقة
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid authentication token'
    });
  }
  
  const token = authHeader.substring(7);
  
  // تحقق من صحة الرمز (يجب استبداله بنظام مصادقة حقيقي)
  if (token !== process.env.API_TOKEN) {
    return res.status(403).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }
  
  next();
};

// 1. فحص صحة الخادم / Health Check
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.5.1'
  });
});

// 2. إرسال مخالفة جديدة / Submit New Violation
router.post('/api/violations', authenticate, async (req, res) => {
  try {
    const {
      plate_number,
      plate_type,
      violation_type,
      location,
      timestamp,
      image_url,
      officer_name,
      device_id,
      confidence_score
    } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!plate_number || !violation_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: plate_number, violation_type'
      });
    }
    
    // حفظ المخالفة في قاعدة البيانات
    // TODO: إضافة كود حفظ البيانات في قاعدة البيانات
    
    const violationId = `V-${new Date().getFullYear()}-${Date.now()}`;
    
    res.json({
      success: true,
      violation_id: violationId,
      message: 'تم تسجيل المخالفة بنجاح',
      message_en: 'Violation recorded successfully',
      fine_amount: 500, // يمكن حسابه بناءً على نوع المخالفة
      status: 'pending',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error submitting violation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 3. التحقق من لوحة السيارة / Verify Plate Number
router.get('/api/plates/:plate_number', authenticate, async (req, res) => {
  try {
    const { plate_number } = req.params;
    
    // البحث في قاعدة البيانات
    // TODO: إضافة كود البحث في قاعدة البيانات
    
    // مثال على البيانات المرتجعة
    res.json({
      plate_number: plate_number,
      is_authorized: false,
      vehicle_info: {
        owner_name: 'محمد أحمد',
        owner_phone: '05XXXXXXXX',
        building_number: '12',
        apartment_number: '301'
      },
      previous_violations: 3,
      total_fines: 1500,
      status: 'active',
      last_violation_date: '2024-11-20'
    });
    
  } catch (error) {
    console.error('Error verifying plate:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 4. الحصول على المخالفات / Get Violations
router.get('/api/violations', authenticate, async (req, res) => {
  try {
    const { plate, page = 1, limit = 20 } = req.query;
    
    // البحث في قاعدة البيانات
    // TODO: إضافة كود البحث في قاعدة البيانات
    
    // مثال على البيانات المرتجعة
    const violations = [
      {
        violation_id: 'V-2024-001234',
        plate_number: plate || 'ABC-1234',
        date: '2024-11-23',
        type: 'unauthorized_parking',
        fine_amount: 500,
        status: 'pending',
        location: 'موقف خاص - مبنى رقم 12',
        officer_name: 'محمد أحمد',
        confidence: 0.95
      }
    ];
    
    res.json({
      success: true,
      total: violations.length,
      page: parseInt(page),
      limit: parseInt(limit),
      violations: violations
    });
    
  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 5. مزامنة البيانات / Data Sync
router.post('/api/sync', authenticate, async (req, res) => {
  try {
    const { device_id, last_sync, pending_violations } = req.body;
    
    if (!device_id || !pending_violations) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: device_id, pending_violations'
      });
    }
    
    let syncedCount = 0;
    let failedCount = 0;
    const syncResults = [];
    
    // معالجة كل مخالفة معلقة
    for (const violation of pending_violations) {
      try {
        // حفظ المخالفة في قاعدة البيانات
        // TODO: إضافة كود حفظ البيانات
        
        syncedCount++;
        syncResults.push({
          local_id: violation.local_id,
          status: 'success',
          server_id: `V-2024-${Date.now()}`
        });
      } catch (error) {
        failedCount++;
        syncResults.push({
          local_id: violation.local_id,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      synced_count: syncedCount,
      failed_count: failedCount,
      results: syncResults,
      next_sync: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // بعد ساعتين
    });
    
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 6. البحث عن مخالفات حسب التاريخ / Search by Date
router.get('/api/violations/search', authenticate, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: start_date, end_date'
      });
    }
    
    // البحث في قاعدة البيانات
    // TODO: إضافة كود البحث حسب التاريخ
    
    res.json({
      success: true,
      start_date,
      end_date,
      total: 0,
      violations: []
    });
    
  } catch (error) {
    console.error('Error searching violations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 7. الحصول على الإحصائيات / Get Statistics
router.get('/api/statistics', authenticate, async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    
    // حساب الإحصائيات من قاعدة البيانات
    // TODO: إضافة كود حساب الإحصائيات
    
    res.json({
      success: true,
      period,
      statistics: {
        total_violations: 150,
        pending: 45,
        paid: 95,
        cancelled: 10,
        total_fines: 75000,
        collected_fines: 47500,
        unique_vehicles: 120,
        repeat_offenders: 25
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 8. رفع صورة / Upload Image
router.post('/api/upload/image', authenticate, async (req, res) => {
  try {
    // معالجة رفع الصورة
    // TODO: إضافة كود رفع الصورة إلى S3 أو التخزين المحلي
    
    const imageUrl = `https://example.com/images/${Date.now()}.jpg`;
    
    res.json({
      success: true,
      image_url: imageUrl,
      thumbnail_url: imageUrl.replace('.jpg', '_thumb.jpg'),
      size: 1024000,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;

/*
 * استخدام / Usage:
 * 
 * في ملف server.js أو api-server.js، أضف:
 * 
 * const androidApiRoutes = require('./api/android-api-routes');
 * app.use(androidApiRoutes);
 * 
 * In server.js or api-server.js, add:
 * 
 * const androidApiRoutes = require('./api/android-api-routes');
 * app.use(androidApiRoutes);
 */
