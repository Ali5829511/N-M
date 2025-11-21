# دليل ربط قاعدة بيانات Neon مع Netlify
# Netlify + Neon Database Integration Guide

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>
## 🇸🇦 النسخة العربية

### 📋 نظرة عامة

هذا الدليل يشرح كيفية ربط قاعدة بيانات Neon PostgreSQL مع موقع Netlify لنظام المرور.

### ✅ المتطلبات

- حساب على [Netlify](https://www.netlify.com)
- حساب على [Neon](https://neon.tech)
- المشروع منشور على Netlify

### 🚀 طريقة الإعداد (طريقتان)

---

#### **الطريقة الأولى: استخدام إضافة Neon في Netlify (الأسهل)**

هذه الطريقة الموصى بها وهي الأسرع والأكثر أماناً.

1. **افتح لوحة تحكم Netlify**
   - اذهب إلى صفحة الإضافات في مشروعك
   - الرابط: `https://app.netlify.com/sites/[your-site-name]/extensions`
   - **ملاحظة**: استبدل `[your-site-name]` باسم موقعك الفعلي في Netlify

2. **ابحث عن إضافة Neon**
   - في صفحة الإضافات (Extensions)
   - ابحث عن "Neon"
   - أو اذهب مباشرة إلى صفحة الإضافات واختر Neon من القائمة

3. **ثبت الإضافة**
   - اضغط على زر "Install" أو "Enable"
   - سيطلب منك تسجيل الدخول إلى حساب Neon أو إنشاء حساب جديد
   - اربط حساب Neon مع Netlify

4. **اختر قاعدة البيانات**
   - اختر مشروع Neon الموجود
   - أو أنشئ مشروع جديد
   - اختر قاعدة البيانات المراد ربطها

5. **اكتمال الإعداد**
   - ستقوم الإضافة تلقائياً بإضافة `DATABASE_URL` إلى المتغيرات البيئية
   - لن تحتاج إلى نسخ أو لصق أي شيء يدوياً

6. **تحقق من الإعداد**
   - اذهب إلى: Site settings > Environment variables
   - يجب أن ترى متغير `DATABASE_URL` مضافاً تلقائياً

---

#### **الطريقة الثانية: الإعداد اليدوي**

إذا لم تعمل الطريقة الأولى، استخدم هذه الطريقة.

1. **احصل على رابط الاتصال من Neon**
   - اذهب إلى: https://console.neon.tech
   - سجل دخول إلى حسابك
   - اختر مشروعك
   - من صفحة Dashboard، اضغط على "Connection Details"
   - انسخ "Connection string" (يبدأ بـ `postgresql://`)

2. **أضف المتغير البيئي في Netlify**
   - اذهب إلى لوحة تحكم مشروعك في Netlify
   - Site settings > Environment variables > Add a variable
   - أضف المتغير التالي:
     - **Key**: `DATABASE_URL`
     - **Value**: [الصق رابط الاتصال من Neon]
     - **Scopes**: All (أو اختر البيئات المحددة)

3. **احفظ التغييرات**
   - اضغط "Save"
   - سيتم إعادة نشر الموقع تلقائياً

---

### 🔧 إعداد قاعدة البيانات

بعد ربط Neon مع Netlify، تحتاج إلى إعداد جداول قاعدة البيانات:

1. **افتح Neon SQL Editor**
   - من لوحة تحكم Neon: https://console.neon.tech
   - اختر مشروعك
   - اضغط على "SQL Editor"

2. **نفذ سكريبت إنشاء الجداول**
   - افتح ملف `database/schema.sql` من المشروع
   - انسخ محتوى الملف بالكامل
   - الصقه في SQL Editor
   - اضغط "Run" لتنفيذ السكريبت

3. **تحقق من إنشاء الجداول**
   - يجب أن ترى الجداول التالية:
     - `users` - المستخدمون
     - `violations` - المخالفات
     - `stickers` - الملصقات
     - `vehicles` - المركبات
     - `immobilized_cars` - السيارات المحجوزة
     - `activity_log` - سجل الأنشطة

---

### ✅ التحقق من الاتصال

بعد الإعداد، تحقق من عمل الاتصال:

1. **افتح موقعك على Netlify**
   - `https://[your-site-name].netlify.app`

2. **افتح Console المتصفح** (F12)
   - ابحث عن رسالة: `✅ Neon database connection initialized`
   - إذا ظهرت رسالة خطأ، راجع قسم استكشاف الأخطاء

3. **اختبر وظائف النظام**
   - سجل دخول إلى النظام
   - جرب إنشاء مخالفة جديدة
   - تحقق من حفظ البيانات

---

### 🔍 استكشاف الأخطاء

#### خطأ: "DATABASE_URL not found"
- **السبب**: لم يتم إضافة المتغير البيئي
- **الحل**: تأكد من إضافة `DATABASE_URL` في Netlify Environment Variables

#### خطأ: "Connection failed"
- **السبب**: رابط الاتصال غير صحيح أو قاعدة البيانات متوقفة
- **الحل**: 
  - تحقق من رابط الاتصال في Neon
  - تأكد من أن قاعدة البيانات نشطة (Active) في Neon

#### خطأ: "Table does not exist"
- **السبب**: لم يتم تنفيذ سكريبت schema.sql
- **الحل**: نفذ سكريبت إنشاء الجداول من `database/schema.sql`

---

### 📚 موارد إضافية

- **وثائق Neon**: https://neon.tech/docs
- **وثائق Netlify Environment Variables**: https://docs.netlify.com/environment-variables/overview/
- **دليل تثبيت قاعدة البيانات**: `database/INSTALLATION_GUIDE.md`
- **ملف الإعداد**: `.env.example`

---

<a name="english"></a>
## 🇬🇧 English Version

### 📋 Overview

This guide explains how to connect Neon PostgreSQL database with Netlify for the Traffic Management System.

### ✅ Prerequisites

- Account on [Netlify](https://www.netlify.com)
- Account on [Neon](https://neon.tech)
- Project deployed on Netlify

### 🚀 Setup Methods (Two Options)

---

#### **Method 1: Using Neon Extension in Netlify (Easiest)**

This is the recommended method - fastest and most secure.

1. **Open Netlify Dashboard**
   - Go to your project's extensions page
   - URL: `https://app.netlify.com/sites/[your-site-name]/extensions`
   - **Note**: Replace `[your-site-name]` with your actual Netlify site name

2. **Find Neon Extension**
   - In the Extensions page
   - Search for "Neon"
   - Or go directly to the extensions page and select Neon from the list

3. **Install Extension**
   - Click "Install" or "Enable" button
   - You'll be prompted to log in to Neon or create a new account
   - Connect your Neon account with Netlify

4. **Select Database**
   - Choose an existing Neon project
   - Or create a new project
   - Select the database to connect

5. **Setup Complete**
   - The extension will automatically add `DATABASE_URL` to environment variables
   - No manual copying or pasting required

6. **Verify Setup**
   - Go to: Site settings > Environment variables
   - You should see `DATABASE_URL` variable added automatically

---

#### **Method 2: Manual Setup**

If Method 1 doesn't work, use this approach.

1. **Get Connection String from Neon**
   - Go to: https://console.neon.tech
   - Log in to your account
   - Select your project
   - From Dashboard, click "Connection Details"
   - Copy the "Connection string" (starts with `postgresql://`)

2. **Add Environment Variable in Netlify**
   - Go to your project dashboard in Netlify
   - Site settings > Environment variables > Add a variable
   - Add the following:
     - **Key**: `DATABASE_URL`
     - **Value**: [Paste connection string from Neon]
     - **Scopes**: All (or select specific environments)

3. **Save Changes**
   - Click "Save"
   - Site will redeploy automatically

---

### 🔧 Database Setup

After connecting Neon to Netlify, you need to set up database tables:

1. **Open Neon SQL Editor**
   - From Neon dashboard: https://console.neon.tech
   - Select your project
   - Click "SQL Editor"

2. **Execute Table Creation Script**
   - Open `database/schema.sql` from the project
   - Copy the entire file content
   - Paste it in SQL Editor
   - Click "Run" to execute the script

3. **Verify Tables Created**
   - You should see the following tables:
     - `users` - Users
     - `violations` - Violations
     - `stickers` - Stickers
     - `vehicles` - Vehicles
     - `immobilized_cars` - Immobilized Cars
     - `activity_log` - Activity Log

---

### ✅ Verify Connection

After setup, verify the connection works:

1. **Open Your Netlify Site**
   - `https://[your-site-name].netlify.app`

2. **Open Browser Console** (F12)
   - Look for message: `✅ Neon database connection initialized`
   - If you see an error, check troubleshooting section

3. **Test System Functions**
   - Log in to the system
   - Try creating a new violation
   - Verify data is saved

---

### 🔍 Troubleshooting

#### Error: "DATABASE_URL not found"
- **Cause**: Environment variable not added
- **Solution**: Ensure `DATABASE_URL` is added in Netlify Environment Variables

#### Error: "Connection failed"
- **Cause**: Connection string incorrect or database is stopped
- **Solution**: 
  - Verify connection string in Neon
  - Ensure database is Active in Neon

#### Error: "Table does not exist"
- **Cause**: schema.sql script not executed
- **Solution**: Run table creation script from `database/schema.sql`

---

### 📚 Additional Resources

- **Neon Documentation**: https://neon.tech/docs
- **Netlify Environment Variables Docs**: https://docs.netlify.com/environment-variables/overview/
- **Database Installation Guide**: `database/INSTALLATION_GUIDE.md`
- **Configuration File**: `.env.example`

---

## 🔐 Security Notes / ملاحظات الأمان

- **Never commit** `.env` files with real credentials to version control
  - **لا تقم بإضافة** ملفات `.env` التي تحتوي على بيانات حقيقية إلى Git

- **Use environment variables** for all sensitive data in production
  - **استخدم المتغيرات البيئية** لجميع البيانات الحساسة في الإنتاج

- **Rotate credentials** regularly
  - **قم بتغيير بيانات الاعتماد** بشكل دوري

- **Enable SSL/TLS** - Neon uses SSL by default
  - **تأكد من تفعيل SSL/TLS** - Neon يستخدم SSL افتراضياً

---

## 📞 Support / الدعم

If you encounter issues:
إذا واجهت مشاكل:

- Check `database/INSTALLATION_GUIDE.md` for detailed setup
  - راجع `database/INSTALLATION_GUIDE.md` لتفاصيل الإعداد

- Review Neon documentation: https://neon.tech/docs
  - راجع وثائق Neon: https://neon.tech/docs

- Check Netlify build logs for errors
  - راجع سجلات البناء في Netlify للأخطاء
