#!/usr/bin/env node

/**
 * نظام إدارة المرور - خادم محلي عالي الجودة
 * Traffic Management System - High-Quality Local Server
 * 
 * هذا الخادم يوفر:
 * - خادم HTTP محلي للتطوير والاختبار
 * - ضغط الملفات لتحسين الأداء
 * - دعم CORS للتطوير
 * - معالجة الأخطاء المتقدمة
 * - سجلات مفصلة للطلبات
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

// تفعيل ضغط الملفات لتحسين الأداء
app.use(compression());

// تفعيل CORS للسماح بالطلبات من أي مصدر
app.use(cors());

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
  console.log('🚀 نظام إدارة المرور - خادم محلي عالي الجودة');
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
  console.log('👋 شكراً لاستخدامك نظام إدارة المرور / Thank you for using the system\n');
  process.exit(0);
});
