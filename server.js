#!/usr/bin/env node

/**
 * نظام المرور - خادم محلي عالي الجودة
 * Traffic System - High-Quality Local Server
 * 
 * ⚠️ للتطوير والاختبار المحلي فقط / For local development and testing only
 * 
 * هذا الخادم يوفر:
 * - خادم HTTP محلي للتطوير والاختبار
 * - ضغط الملفات لتحسين الأداء
 * - دعم CORS للتطوير
 * - معالجة الأخطاء المتقدمة
 * - سجلات مفصلة للطلبات
 * 
 * ملاحظة أمنية / Security Note:
 * هذا الخادم لا يحتوي على rate limiting أو حماية متقدمة
 * لا تستخدمه في بيئة الإنتاج بدون إضافة طبقات أمان إضافية
 * This server lacks rate limiting and advanced security features
 * Do not use in production without additional security layers
 */

const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');

// إنشاء تطبيق Express
const app = express();

// تكوين المنفذ (Port)
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// تكوين ParkPow API
// ⚠️ Security Note: ParkPow API token should be set via environment variable
// For development, set PARKPOW_API_TOKEN in .env file (see .env.example)
// ملاحظة أمنية: يجب تعيين رمز ParkPow API عبر متغير بيئي
const PARKPOW_API_TOKEN = process.env.PARKPOW_API_TOKEN;
const PARKPOW_API_URL = 'https://app.parkpow.com/api/v1';

// تحذير إذا لم يتم تعيين رمز API
if (!PARKPOW_API_TOKEN) {
  console.warn('⚠️  WARNING: PARKPOW_API_TOKEN is not set. ParkPow integration will not work.');
  console.warn('⚠️  تحذير: لم يتم تعيين PARKPOW_API_TOKEN. لن يعمل تكامل ParkPow.');
  console.warn('    Set it in .env file or as environment variable.');
  console.warn('    قم بتعيينه في ملف .env أو كمتغير بيئي.');
}

// تفعيل ضغط الملفات لتحسين الأداء
app.use(compression());

// تفعيل CORS للسماح بالطلبات من أي مصدر
app.use(cors());

// إضافة Security Headers لتحسين الأمان
app.use((req, res, next) => {
  // منع تحميل الموقع في iframe (Clickjacking protection)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // منع MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // تفعيل XSS Protection في المتصفحات القديمة
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// تفعيل JSON parsing للـ API requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تسجيل جميع الطلبات
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// تقديم الملفات الثابتة من المجلد الحالي
app.use(express.static(path.join(__dirname), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // إعداد Headers المناسبة لأنواع الملفات المختلفة
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
  }
}));

// معالجة الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// نقطة فحص صحة الخادم - Health Check Endpoint
// يستخدم للتحقق من حالة الخادم في بيئات الإنتاج
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.5.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    parkpow_configured: !!PARKPOW_API_TOKEN
  });
});

// ============================================
// Statistics and Violations Report API Endpoints
// ============================================

// نقطة API للإحصائيات العامة - General Statistics Endpoint
app.get('/api/statistics', async (req, res) => {
  try {
    // في بيئة الإنتاج، يجب جلب هذه البيانات من قاعدة البيانات
    // In production, this data should be fetched from the database
    const statistics = {
      total_residents: 1057,
      total_buildings: 165,
      total_stickers: 2382,
      total_units: 1134,
      total_parking: 1308,
      active_violations: 12
    };
    
    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب الإحصائيات',
      message: error.message
    });
  }
});

// نقطة API لتقرير المخالفات - Violations Report Endpoint
app.get('/api/violation-report', async (req, res) => {
  try {
    // في بيئة الإنتاج، يجب جلب هذه البيانات من قاعدة البيانات
    // In production, this data should be fetched from the database
    
    // بيانات تجريبية للتقرير - Sample data for the report
    const violationsReport = [
      {
        plateNumber: 'و 2309',
        violationCount: 3,
        vehicleType: 'كامري',
        processingDate: '1447/4/5',
        residentName: 'يحيى بن علي بن يحيى العمري',
        buildingNumber: '1',
        unitNumber: '0'
      },
      {
        plateNumber: 'ز 3477',
        violationCount: 2,
        vehicleType: 'يوكن',
        processingDate: '1447/2/17',
        residentName: 'مثقب بن سعيد بن طويفير الفحماني',
        buildingNumber: '2',
        unitNumber: '0'
      }
    ];
    
    res.json({
      success: true,
      data: violationsReport,
      timestamp: new Date().toISOString(),
      count: violationsReport.length
    });
  } catch (error) {
    console.error('Error getting violation report:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب تقرير المخالفات',
      message: error.message
    });
  }
});

// ============================================
// ParkPow API Endpoints
// ============================================

// التحقق من حالة الاتصال بـ ParkPow API
app.get('/api/parkpow/status', async (req, res) => {
  // Check if API token is configured
  if (!PARKPOW_API_TOKEN) {
    return res.json({
      success: false,
      configured: false,
      connected: false,
      message: 'PARKPOW_API_TOKEN غير مُعرّف. يرجى تعيينه في ملف .env',
      error: 'PARKPOW_API_TOKEN is not configured. Please set it in .env file'
    });
  }

  try {
    const response = await fetch(`${PARKPOW_API_URL}/user/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PARKPOW_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        configured: true,
        connected: true,
        message: 'متصل بـ ParkPow API',
        user: data
      });
    } else {
      res.json({
        success: false,
        configured: true,
        connected: false,
        message: 'فشل الاتصال بـ ParkPow API',
        error: `HTTP ${response.status}: ${response.statusText}`
      });
    }
  } catch (error) {
    res.json({
      success: false,
      configured: true,
      connected: false,
      message: 'خطأ في الاتصال بـ ParkPow API',
      error: error.message
    });
  }
});

// التعرف على اللوحات من خلال ParkPow
app.post('/api/parkpow/recognize', async (req, res) => {
  // Check if API token is configured
  if (!PARKPOW_API_TOKEN) {
    return res.status(503).json({
      success: false,
      error: 'PARKPOW_API_TOKEN غير مُعرّف. يرجى تعيينه في ملف .env',
      message: 'ParkPow API is not configured'
    });
  }

  try {
    const { image, regions = 'sa' } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إرفاق صورة'
      });
    }

    // استدعاء ParkPow API
    const formData = new FormData();
    formData.append('upload', image);
    formData.append('regions', regions);

    const response = await fetch(`${PARKPOW_API_URL}/plate-reader/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${PARKPOW_API_TOKEN}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok && data.results) {
      res.json({
        success: true,
        results: data.results,
        processing_time: data.processing_time,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        error: data.error || 'فشل التعرف على اللوحة'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// استقبال Webhook من ParkPow
app.post('/api/parkpow/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('📨 ParkPow Webhook received:', webhookData);
    
    // هنا يمكن معالجة البيانات وحفظها في قاعدة البيانات
    
    res.json({
      success: true,
      message: 'تم استقبال البيانات بنجاح'
    });
  } catch (error) {
    console.error('❌ خطأ في معالجة Webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// الحصول على سجل التعرف على اللوحات
app.get('/api/parkpow/history', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const response = await fetch(`${PARKPOW_API_URL}/plate-reader/?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PARKPOW_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      res.json({
        success: true,
        history: data.results || [],
        count: data.count || 0
      });
    } else {
      res.json({
        success: false,
        error: 'فشل الحصول على السجل'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// معالجة الصفحات غير الموجودة
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم / Server Error:', err.stack);
  res.status(500).send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>خطأ في الخادم - Server Error</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          direction: rtl;
          text-align: center;
          padding: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .error-container {
          background: white;
          color: #333;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          max-width: 600px;
          margin: 0 auto;
        }
        h1 { color: #e74c3c; }
        .error-code { font-size: 72px; font-weight: bold; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-code">500</div>
        <h1>عذراً، حدث خطأ في الخادم</h1>
        <p>نعمل على حل المشكلة. يرجى المحاولة مرة أخرى لاحقاً.</p>
        <p style="margin-top: 30px;">
          <a href="/" style="color: #667eea; text-decoration: none; font-weight: bold;">
            العودة إلى الصفحة الرئيسية
          </a>
        </p>
      </div>
    </body>
    </html>
  `);
});

// بدء الخادم
app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 نظام المرور - خادم محلي عالي الجودة');
  console.log('🚀 Traffic Management System - High-Quality Server');
  console.log('='.repeat(60));
  console.log(`\n✅ الخادم يعمل الآن / Server is running!`);
  console.log(`\n📡 العنوان المحلي / Local Address:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  
  // عرض عنوان IP المحلي للشبكة
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  console.log(`\n🌐 عنوان الشبكة / Network Address:`);
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   http://${iface.address}:${PORT}`);
      }
    });
  });
  
  console.log(`\n💡 نصائح / Tips:`);
  console.log(`   - اضغط Ctrl+C لإيقاف الخادم / Press Ctrl+C to stop`);
  console.log(`   - استخدم npm run dev للتحديث التلقائي / Use npm run dev for auto-reload`);
  console.log(`   - جميع الملفات محمية بـ CORS / All files are CORS-enabled`);
  console.log('\n' + '='.repeat(60) + '\n');
});

// معالجة إيقاف الخادم بشكل آمن
process.on('SIGTERM', () => {
  console.log('\n⏹️  إيقاف الخادم... / Shutting down server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n\n⏹️  تم إيقاف الخادم بنجاح / Server stopped successfully');
  console.log('👋 شكراً لاستخدامك نظام المرور / Thank you for using the system\n');
  process.exit(0);
});
