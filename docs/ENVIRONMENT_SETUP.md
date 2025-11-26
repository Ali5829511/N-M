# 🌍 دليل إعداد البيئة - Environment Setup Guide

**آخر تحديث:** 2025-11-26  
**الإصدار:** 1.5.1

---

## 📋 نظرة عامة - Overview

يستخدم نظام إدارة المرور ملف `.env` لتخزين إعدادات البيئة والمفاتيح السرية بشكل آمن. هذا الدليل يشرح كيفية إعداد البيئة بشكل صحيح.

The Traffic Management System uses an `.env` file to securely store environment settings and secret keys. This guide explains how to set up your environment correctly.

---

## 🚀 البدء السريع - Quick Start

### الخطوة 1: نسخ ملف الإعدادات الأساسي

**على Windows:**
```bash
copy .env.example .env
```

**على Linux/Mac:**
```bash
cp .env.example .env
```

### الخطوة 2: تعديل الإعدادات

افتح ملف `.env` بمحرر نصوص واملأ القيم المطلوبة:

```env
# الإعدادات الأساسية - Basic Configuration
PORT=8080
HOST=0.0.0.0

# ParkPow API (اختياري - Optional)
PARKPOW_API_TOKEN=your_parkpow_api_token_here
```

### الخطوة 3: تشغيل الخادم

```bash
npm install
npm start
```

---

## 🔑 الإعدادات الأساسية - Core Settings

### إعدادات الخادم - Server Configuration

```env
# المنفذ الذي سيعمل عليه الخادم
# The port the server will run on
PORT=8080

# عنوان الاستماع - 0.0.0.0 للسماح بالاتصالات من الشبكة
# Listen address - 0.0.0.0 allows network connections
HOST=0.0.0.0

# بيئة العمل: development أو production
# Environment: development or production
NODE_ENV=development
```

### إعدادات ParkPow API

ParkPow هو نظام للتعرف على لوحات السيارات. لاستخدامه:

1. **احصل على API Token:**
   - قم بزيارة: https://app.parkpow.com
   - سجل الدخول أو أنشئ حساب جديد
   - انتقل إلى **API Settings**
   - انسخ API Token

2. **أضف التوكن في ملف .env:**
```env
PARKPOW_API_TOKEN=your_actual_token_here
PARKPOW_API_URL=https://app.parkpow.com/api/v1
```

⚠️ **ملاحظة:** إذا لم تقم بتعيين `PARKPOW_API_TOKEN`، سيعمل النظام ولكن بدون ميزة التعرف على اللوحات من ParkPow.

---

## 🗄️ إعدادات قاعدة البيانات - Database Configuration

### Neon PostgreSQL (موصى به للإنتاج)

```env
# احصل على الرابط من: https://console.neon.tech
# Get the URL from: https://console.neon.tech
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**كيفية الحصول على DATABASE_URL:**
1. اذهب إلى: https://console.neon.tech
2. اختر مشروعك
3. اضغط على "Connection Details"
4. انسخ رابط الاتصال

### PostgreSQL المحلي (للتطوير)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=traffic_system
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

---

## 📷 إعدادات Plate Recognizer API

للتعرف على لوحات السيارات من الصور:

### الطريقة 1: Snapshot API (سحابي)

```env
# احصل على مفتاح API من: https://app.platerecognizer.com/
PLATE_API_KEY=your_plate_recognizer_api_key_here
PLATE_API_TYPE=snapshot
SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/
```

### الطريقة 2: SDK/Server (محلي)

```env
PLATE_API_TYPE=sdk
SDK_API_URL=http://localhost:8080/v1/plate-reader/
SDK_LICENSE_TOKEN=your_sdk_license_token_here
```

---

## 📧 إعدادات البريد الإلكتروني - Email Configuration

لإرسال الإشعارات عبر البريد الإلكتروني:

```env
# احصل على المفاتيح من: https://www.emailjs.com/
EMAILJS_SERVICE_ID=your_service_id_here
EMAILJS_PUBLIC_KEY=your_public_key_here
```

---

## 🔐 الإعدادات الأمنية - Security Settings

```env
# مفتاح سري للجلسات - يُنصح باستخدام قيمة عشوائية قوية
# Secret key for sessions - use a strong random value
SESSION_SECRET=your_random_session_secret_here
```

**توليد مفتاح سري قوي:**

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Python:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**OpenSSL:**
```bash
openssl rand -hex 32
```

---

## ☁️ إعدادات التخزين السحابي - Cloud Storage Configuration

### AWS S3 (موصى به للإنتاج)

```env
STORE_IMAGES=s3
S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

### MinIO (بديل محلي لـ S3)

```env
STORE_IMAGES=s3
S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_ENDPOINT_URL=http://localhost:9000
```

---

## 🧪 اختبار الإعدادات - Testing Configuration

### التحقق من تحميل ملف .env

```bash
node -e "require('dotenv').config(); console.log('PORT:', process.env.PORT);"
```

يجب أن يظهر: `PORT: 8080` (أو القيمة التي حددتها)

### التحقق من اتصال ParkPow API

بعد تشغيل الخادم، افتح:
```
http://localhost:8080/api/parkpow/status
```

يجب أن تحصل على:
- ✅ `configured: true` - إذا تم تعيين PARKPOW_API_TOKEN
- ✅ `connected: true` - إذا كان التوكن صحيح
- ❌ `configured: false` - إذا لم يتم تعيين التوكن

### التحقق من صحة الخادم

```bash
curl http://localhost:8080/health
```

يجب أن تحصل على استجابة JSON تحتوي على:
```json
{
  "status": "healthy",
  "parkpow_configured": true
}
```

---

## 🔒 أفضل الممارسات الأمنية - Security Best Practices

### ✅ افعل (Do):

1. **استخدم ملف .env للإعدادات السرية**
   ```env
   PARKPOW_API_TOKEN=actual_token_here
   ```

2. **تأكد من وجود .env في .gitignore**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

3. **استخدم توكنات مختلفة لكل بيئة**
   - Development: توكنات اختبارية
   - Production: توكنات حقيقية

4. **غيّر التوكنات بشكل دوري**
   - على الأقل كل 90 يوم
   - عند مغادرة موظف
   - عند الاشتباه بتسريب

### ❌ لا تفعل (Don't):

1. **لا تضع التوكنات مباشرة في الكود**
   ```javascript
   // ❌ خطأ!
   const token = 'my_secret_token';
   
   // ✅ صحيح!
   const token = process.env.PARKPOW_API_TOKEN;
   ```

2. **لا ترفع ملف .env إلى GitHub**
   - استخدم .env.example بدلاً منه
   - تأكد من وجود .env في .gitignore

3. **لا تشارك ملف .env**
   - استخدم أنظمة إدارة الأسرار (Secrets Management)
   - في GitHub Actions: استخدم GitHub Secrets

---

## 🌐 بيئات مختلفة - Different Environments

### التطوير المحلي - Local Development

```env
NODE_ENV=development
PORT=8080
HOST=0.0.0.0
# استخدم توكنات اختبارية هنا
```

### بيئة الإنتاج - Production

```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
# استخدم توكنات حقيقية آمنة
# تأكد من تفعيل HTTPS
```

### CI/CD (GitHub Actions)

لا تستخدم ملف .env في GitHub Actions. بدلاً من ذلك:
1. اذهب إلى: Settings > Secrets and variables > Actions
2. أضف المتغيرات المطلوبة

---

## 🆘 حل المشاكل الشائعة - Troubleshooting

### المشكلة: "PARKPOW_API_TOKEN is not set"

**الحل:**
1. تأكد من وجود ملف `.env` في المجلد الرئيسي للمشروع
2. تأكد من وجود السطر: `PARKPOW_API_TOKEN=your_token_here`
3. تأكد من عدم وجود مسافات قبل أو بعد `=`
4. أعد تشغيل الخادم بعد تعديل ملف .env

### المشكلة: "Cannot find module 'dotenv'"

**الحل:**
```bash
npm install dotenv
```

### المشكلة: التغييرات في .env لا تظهر

**الحل:**
- أعد تشغيل الخادم (dotenv يُحمّل الملف عند بدء التشغيل فقط)
- توقف بـ Ctrl+C ثم شغل `npm start` مرة أخرى

### المشكلة: "Access Denied" عند استخدام ParkPow API

**الحل:**
1. تأكد من صحة PARKPOW_API_TOKEN
2. تحقق من انتهاء صلاحية التوكن
3. تأكد من وجود رصيد كافٍ في حسابك

---

## 📚 مراجع إضافية - Additional Resources

- 📖 [API Token Setup Guide](API_TOKEN_SETUP_GUIDE.md) - دليل تفصيلي لإعداد API Tokens
- 📖 [Server Setup Guide](SERVER_SETUP_AR.md) - دليل إعداد الخادم
- 📖 [Security Guide](SECURITY.md) - إرشادات الأمان الشاملة
- 📖 [ParkPow Integration](PARKPOW_README.md) - دليل تكامل ParkPow
- 📖 [Deployment Guide](DEPLOYMENT.md) - دليل النشر

---

## 📞 الدعم - Support

إذا واجهت أي مشاكل:
1. راجع قسم حل المشاكل أعلاه
2. تحقق من سجلات الخادم (Server Logs)
3. افتح Console المتصفح (F12) للأخطاء
4. راجع التوثيق الكامل

---

**ملاحظة أمنية مهمة:** 🔐

لا تشارك ملف `.env` أو محتوياته مع أحد. جميع المفاتيح والتوكنات يجب أن تبقى سرية.

Never share your `.env` file or its contents with anyone. All keys and tokens must remain confidential.

---

**جميع الحقوق محفوظة © 2025**
