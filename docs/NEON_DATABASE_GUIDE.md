# دليل قاعدة بيانات Neon PostgreSQL
# Neon PostgreSQL Database Guide

## 📚 نظرة عامة - Overview

تم ترقية النظام ليدعم قاعدة بيانات **Neon PostgreSQL** الحقيقية بدلاً من localStorage. هذا يوفر:

- ✅ قاعدة بيانات SQL حقيقية في السحابة
- ✅ أداء أفضل وأمان أعلى
- ✅ دعم كامل للعلاقات (Relations)
- ✅ نسخ احتياطي تلقائي
- ✅ مجاني حتى 0.5 GB

---

## 🚀 البدء السريع - Quick Start

### 1. إنشاء حساب Neon

1. اذهب إلى [https://console.neon.tech](https://console.neon.tech)
2. قم بإنشاء حساب مجاني
3. أنشئ مشروع جديد (New Project)
4. اختر المنطقة الأقرب لك (مثلاً: AWS US East 2)

### 2. الحصول على Connection String

من لوحة التحكم، انسخ **Connection String**:

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

مثال:
```
postgresql://myuser:mypassword123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3. إعداد المتغيرات البيئية

أنشئ ملف `.env` في جذر المشروع:

```bash
cp .env.example .env
```

ثم عدّل ملف `.env`:

```env
DATABASE_URL=postgresql://[your-connection-string-here]
NODE_ENV=development
PORT=8080
```

### 4. إنشاء الجداول

قم بتشغيل ملف SQL لإنشاء الجداول:

```bash
# طريقة 1: من خلال Neon Console
# افتح SQL Editor في Neon Console وانسخ محتوى database/schema.sql

# طريقة 2: استخدام psql (إذا كان مثبتاً)
psql "postgresql://your-connection-string" -f database/schema.sql
```

### 5. تشغيل الخادم مع قاعدة البيانات

```bash
npm run start:api
```

سترى:
```
✅ Neon database connection initialized
✅ Server running on: http://localhost:8080
✅ API available at: http://localhost:8080/api
📊 Database: Neon PostgreSQL ✅
```

---

## 📁 بنية الملفات - File Structure

```
N-M/
├── database/
│   ├── schema.sql           # مخطط قاعدة البيانات
│   └── neon-db.js           # وحدة الاتصال بـ Neon
├── api-server.js            # خادم API مع Neon
├── server.js                # خادم ملفات ثابتة (fallback)
├── .env                     # متغيرات البيئة (لا تشاركه!)
└── .env.example             # نموذج المتغيرات البيئية
```

---

## 🔌 واجهة برمجة التطبيقات - API Endpoints

### المستخدمون - Users

```javascript
// Get all users
GET /api/users

// Get user by username
GET /api/users/:username

// Create new user
POST /api/users
Body: {
    username: "newuser",
    password: "hashed_password",
    name: "اسم المستخدم",
    email: "user@example.com",
    role: "admin",
    status: "active"
}

// Update user
PUT /api/users/:id
Body: { name: "اسم جديد", ... }
```

### المخالفات - Violations

```javascript
// Get all violations (with optional filters)
GET /api/violations?plate=ABC123&status=pending

// Get violation by ID
GET /api/violations/:id

// Create new violation
POST /api/violations
Body: {
    violationNumber: "V-2025-001",
    plateNumber: "ABC123",
    violationType: "موقف خاطئ",
    violationDate: "2025-01-15",
    violationTime: "14:30:00",
    fineAmount: 500,
    recordedBy: 1
}
```

### السيارات - Vehicles

```javascript
// Get vehicle by plate number
GET /api/vehicles/:plateNumber
```

### فحص الصحة - Health Check

```javascript
// Check if API and database are working
GET /api/health

Response: {
    status: "ok",
    database: "connected",
    timestamp: "2025-01-15T10:30:00.000Z"
}
```

---

## 💻 استخدام في الكود - Usage in Code

### Client-Side (JavaScript)

```javascript
// استدعاء API من الواجهة الأمامية
async function getUsers() {
    const response = await fetch('http://localhost:8080/api/users');
    const users = await response.json();
    return users;
}

async function createViolation(violationData) {
    const response = await fetch('http://localhost:8080/api/violations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(violationData)
    });
    const violation = await response.json();
    return violation;
}
```

### Server-Side (Node.js)

```javascript
import { NeonDatabase } from './database/neon-db.js';

const db = new NeonDatabase();

// Get users
const users = await db.getUsers();

// Create violation
const violation = await db.createViolation({
    violationNumber: 'V-2025-001',
    plateNumber: 'ABC123',
    violationType: 'موقف خاطئ',
    violationDate: '2025-01-15',
    violationTime: '14:30:00',
    fineAmount: 500
});

// Log activity
await db.logActivity(userId, 'CREATE_VIOLATION', 'Created violation V-2025-001');
```

---

## 🔒 الأمان - Security

### Best Practices

1. **لا تشارك ملف .env**:
   ```bash
   # تأكد من إضافته إلى .gitignore
   echo ".env" >> .gitignore
   ```

2. **استخدم متغيرات بيئة منفصلة للإنتاج**:
   - Development: قاعدة بيانات تجريبية
   - Production: قاعدة بيانات حقيقية مع كلمة مرور قوية

3. **قم بتدوير كلمات المرور بانتظام**

4. **استخدم SSL دائماً**:
   ```
   ?sslmode=require
   ```

5. **راقب النشاط**:
   - استخدم جدول `activity_log`
   - راقب محاولات تسجيل الدخول الفاشلة

---

## 🔄 الانتقال من localStorage

### خطوات الترحيل - Migration Steps

1. **تصدير البيانات من localStorage**:
   ```javascript
   // في Console المتصفح
   const users = JSON.parse(localStorage.getItem('users'));
   const violations = JSON.parse(localStorage.getItem('violations'));
   console.log(JSON.stringify({ users, violations }));
   ```

2. **استيراد إلى Neon**:
   ```javascript
   // في Node.js
   import { NeonDatabase } from './database/neon-db.js';
   const db = new NeonDatabase();
   
   // Import users
   for (const user of localStorageUsers) {
       await db.createUser(user);
   }
   
   // Import violations
   for (const violation of localStorageViolations) {
       await db.createViolation(violation);
   }
   ```

3. **اختبار الوظائف**:
   - تسجيل دخول
   - إضافة مخالفة
   - عرض التقارير

4. **حذف localStorage (اختياري)**:
   ```javascript
   localStorage.clear();
   ```

---

## 📊 مخطط قاعدة البيانات - Database Schema

### الجداول الرئيسية - Main Tables

#### 1. users - المستخدمون
```sql
- id (SERIAL PRIMARY KEY)
- username (VARCHAR, UNIQUE)
- password (VARCHAR - hashed)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- role (VARCHAR: admin, violation_entry, inquiry)
- status (VARCHAR: active, inactive, suspended)
- created_at, updated_at
```

#### 2. violations - المخالفات
```sql
- id (SERIAL PRIMARY KEY)
- violation_number (VARCHAR, UNIQUE)
- plate_number (VARCHAR)
- violation_type (VARCHAR)
- violation_date (DATE)
- violation_time (TIME)
- fine_amount (DECIMAL)
- status (VARCHAR: pending, paid, cancelled)
- recorded_by (FK → users.id)
- created_at, updated_at
```

#### 3. vehicles - السيارات
```sql
- id (SERIAL PRIMARY KEY)
- plate_number (VARCHAR, UNIQUE)
- owner_name (VARCHAR)
- vehicle_type (VARCHAR)
- violation_count (INTEGER)
- total_fines (DECIMAL)
- created_at, updated_at
```

#### 4. activity_log - سجل الأنشطة
```sql
- id (SERIAL PRIMARY KEY)
- user_id (FK → users.id)
- action_type (VARCHAR)
- action_description (TEXT)
- ip_address (VARCHAR)
- created_at
```

### العلاقات - Relationships

```
users (1) ──── (N) violations (recorded_by)
vehicles (1) ──── (N) violations (plate_number)
users (1) ──── (N) activity_log (user_id)
```

---

## 🐛 حل المشكلات - Troubleshooting

### المشكلة: "DATABASE_URL not found"

**الحل**:
```bash
# تأكد من وجود ملف .env
ls -la .env

# تأكد من المحتوى
cat .env

# إذا لم يكن موجوداً
cp .env.example .env
# ثم عدّل DATABASE_URL
```

### المشكلة: "Connection refused"

**الأسباب المحتملة**:
1. Connection string خاطئ
2. قاعدة البيانات متوقفة
3. مشاكل في الشبكة

**الحل**:
```bash
# اختبر الاتصال
psql "your-connection-string"

# تحقق من Neon Console
# https://console.neon.tech
```

### المشكلة: "Table does not exist"

**الحل**:
```bash
# قم بتشغيل schema.sql
psql "your-connection-string" -f database/schema.sql
```

### المشكلة: "Cannot find module"

**الحل**:
```bash
# تأكد من تثبيت الحزم
npm install

# تحقق من package.json
cat package.json | grep "type"
# يجب أن يحتوي على: "type": "module"
```

---

## 📈 الأداء - Performance

### تحسينات الأداء

1. **استخدام الفهارس (Indexes)**:
   - تم إنشاؤها تلقائياً في schema.sql
   - Indexes على: plate_number, username, violation_date

2. **Connection Pooling**:
   - Neon serverless يدير الاتصالات تلقائياً

3. **Caching** (للإضافة لاحقاً):
   ```javascript
   // مثال: Redis caching
   const cachedUsers = await redis.get('users');
   if (!cachedUsers) {
       const users = await db.getUsers();
       await redis.set('users', JSON.stringify(users), 'EX', 300);
   }
   ```

---

## 📦 النشر - Deployment

### Netlify

1. أضف متغيرات البيئة في Netlify:
   ```
   Site Settings → Environment Variables → Add
   NETLIFY_DATABASE_URL = [your-neon-connection-string]
   ```

2. النشر:
   ```bash
   netlify deploy --prod
   ```

### Render.com

1. أنشئ Web Service جديد
2. أضف Environment Variables:
   ```
   DATABASE_URL = [your-neon-connection-string]
   ```
3. Deploy!

---

## 📞 الدعم - Support

- **Neon Documentation**: https://neon.tech/docs
- **Neon Community**: https://community.neon.tech
- **GitHub Issues**: [رابط مستودع المشروع]

---

## 📝 الترخيص

جميع الحقوق محفوظة © 2025 - جامعة الإمام محمد بن سعود الإسلامية
