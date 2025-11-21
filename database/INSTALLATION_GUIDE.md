# 🚀 دليل التثبيت والإعداد - قاعدة بيانات نظام إدارة المرور

**نظام المرور - Traffic Management System**  
**Neon PostgreSQL Database Setup**

---

## 📋 المتطلبات الأساسية

### متطلبات النظام

| المتطلب | الإصدار الموصى به | ملاحظات |
|---------|-------------------|----------|
| **Neon PostgreSQL** | Cloud-based | Serverless PostgreSQL |
| **Node.js** | 18+ | للخادم والـ API |
| **npm** | 8+ | مدير الحزم |
| **حساب Neon** | مجاني | https://neon.tech |
| **حساب Netlify** | مجاني (اختياري) | للنشر |

---

## 🌐 الخطوة 1: إنشاء حساب Neon

### 1. التسجيل في Neon

1. اذهب إلى: https://neon.tech
2. اضغط على "Sign Up" أو "Get Started"
3. سجل باستخدام:
   - GitHub
   - Google
   - أو البريد الإلكتروني

### 2. إنشاء مشروع جديد

1. بعد تسجيل الدخول، اضغط على "New Project"
2. اختر:
   - **Project Name**: `traffic-management-system` (أو أي اسم تفضله)
   - **Region**: اختر أقرب منطقة (مثل: US East)
   - **PostgreSQL Version**: 15 أو أحدث
3. اضغط "Create Project"

### 3. الحصول على رابط الاتصال

1. في صفحة Project Dashboard
2. اضغط على "Connection Details"
3. انسخ "Connection string" - يبدأ بـ `postgresql://`
4. احفظه في مكان آمن - ستحتاجه لاحقاً

---

---

## 🔧 الخطوة 2: إنشاء قاعدة البيانات

### 1. فتح SQL Editor في Neon

1. في Neon Dashboard، اختر مشروعك
2. اضغط على "SQL Editor" من القائمة الجانبية
3. ستفتح واجهة تحرير SQL

### 2. إنشاء قاعدة البيانات (تلقائي)

قاعدة البيانات الافتراضية (`neondb`) موجودة مسبقاً، لكن يمكنك إنشاء قاعدة جديدة:

```sql
-- إنشاء قاعدة بيانات جديدة (اختياري)
CREATE DATABASE traffic_management_system;

-- أو استخدم قاعدة البيانات الافتراضية
-- \c neondb
```

---

## 📥 الخطوة 3: استيراد المخطط (Schema)

### الطريقة الأولى: عبر Neon SQL Editor (موصى بها)

1. في Neon SQL Editor
2. افتح ملف `database/schema.sql` من المشروع
3. انسخ محتوى الملف بالكامل
4. الصقه في SQL Editor
5. اضغط "Run" أو Ctrl+Enter
6. انتظر حتى يكتمل التنفيذ

### الطريقة الثانية: عبر psql (سطر الأوامر)

إذا كان لديك PostgreSQL مثبت محلياً:

```bash
# الانتقال إلى مجلد قاعدة البيانات
cd /path/to/N-M/database/

# استيراد المخطط
psql "postgresql://[user]:[password]@[host]/[database]?sslmode=require" < schema.sql

# أو باستخدام متغير البيئة
export DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
psql $DATABASE_URL < schema.sql
```

### التحقق من إنشاء الجداول

```sql
-- عرض جميع الجداول
\dt

-- أو
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

يجب أن ترى الجداول التالية:
- `users` - المستخدمون
- `violations` - المخالفات
- `stickers` - الملصقات
- `vehicles` - المركبات
- `immobilized_cars` - السيارات المحجوزة
- `activity_log` - سجل الأنشطة

---

## ⚙️ الخطوة 4: إعداد المتغيرات البيئية

### للتطوير المحلي

1. **انسخ ملف .env.example**
   ```bash
   cp .env.example .env
   ```

2. **حدّث DATABASE_URL**
   ```env
   DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```
   استبدل القيمة برابط الاتصال من Neon

3. **مثال**
   ```env
   DATABASE_URL=postgresql://myuser:mypass@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### للنشر على Netlify

راجع الدليل الشامل: [NETLIFY_NEON_SETUP.md](../NETLIFY_NEON_SETUP.md)

**طريقة سريعة:**
1. ثبت Neon Extension: https://app.netlify.com/projects/n-m-m/extensions/neon
2. أو أضف `DATABASE_URL` يدوياً في: Site settings > Environment variables

---

## 🔐 الخطوة 5: إنشاء المستخدمين الافتراضيين

المستخدمون الافتراضيون يتم إنشاؤهم تلقائياً عند أول تشغيل للنظام، لكن يمكنك إنشاءهم يدوياً:

### 1. عبر واجهة النظام (موصى به)

1. شغّل النظام محلياً: `npm start`
2. افتح المتصفح: http://localhost:8080
3. عند أول تشغيل، سيتم إنشاء المستخدمين تلقائياً
4. افتح Console المتصفح (F12) لرؤية كلمات المرور المولدة

### 2. إنشاء مستخدم يدوياً (متقدم)

```sql
-- مثال: إنشاء مستخدم مدير
INSERT INTO users (
    username, password, name, email, role, status, 
    require_password_change, created_date
) VALUES (
    'admin',
    -- استخدم bcrypt أو SHA-256 لتشفير كلمة المرور
    '$2a$10$...',  -- كلمة مرور مشفرة
    'مدير النظام',
    'admin@example.com',
    'admin',
    'active',
    true,
    CURRENT_TIMESTAMP
);
```

**⚠️ ملاحظة مهمة:** لا تحفظ كلمات المرور بنص واضح! استخدم تشفير قوي.

---

## 🔍 الخطوة 6: اختبار الاتصال

### 1. تشغيل خادم API

```bash
# تثبيت المتطلبات
npm install

# تشغيل خادم API
npm run start:api
```

### 2. التحقق من رسائل Console

ابحث عن:
```
✅ Neon database connection initialized
✅ Database connection initialized
```

إذا رأيت خطأ:
```
❌ DATABASE_URL or NETLIFY_DATABASE_URL not found in environment variables
```
تأكد من إعداد المتغيرات البيئية بشكل صحيح.

### 3. اختبار الاستعلامات

```bash
# اختبار بسيط
node -e "
import { NeonDatabase } from './database/neon-db.js';
const db = new NeonDatabase();
db.getUsers().then(users => {
    console.log('عدد المستخدمين:', users.length);
    console.log('✅ الاتصال يعمل بنجاح!');
}).catch(err => {
    console.error('❌ خطأ:', err.message);
});
"
```

---

## 🎲 الخطوة 7: إدراج بيانات تجريبية (اختياري)

### عبر Neon SQL Editor

```sql
-- إضافة مخالفات تجريبية
INSERT INTO violations (
    violation_number, plate_number, violation_type,
    violation_date, violation_time, location,
    fine_amount, status
) VALUES 
    ('V-2024-001', 'ABC-1234', 'parking violation', 
     '2024-01-15', '10:30:00', 'Building A - Zone 1',
     100.00, 'pending'),
    ('V-2024-002', 'XYZ-5678', 'speeding', 
     '2024-01-16', '14:20:00', 'Main Gate',
     200.00, 'paid');

-- إضافة مركبات تجريبية
INSERT INTO vehicles (
    plate_number, owner_name, vehicle_type, 
    vehicle_make, vehicle_model, vehicle_color
) VALUES 
    ('ABC-1234', 'أحمد محمد', 'سيارة', 'Toyota', 'Camry', 'أبيض'),
    ('XYZ-5678', 'فاطمة علي', 'سيارة', 'Honda', 'Accord', 'أسود');
```

---

## 📊 الخطوة 8: إعداد النسخ الاحتياطي

### نسخ احتياطي من Neon

1. **عبر لوحة التحكم**
   - Neon تقوم بنسخ احتياطي تلقائي
   - يمكنك استعادة قاعدة البيانات من: Project Settings > Backups

2. **نسخ احتياطي يدوي**
   ```bash
   # تصدير قاعدة البيانات
   pg_dump "postgresql://[connection-string]" > backup_$(date +%Y%m%d).sql
   
   # نسخ احتياطي مضغوط
   pg_dump "postgresql://[connection-string]" | gzip > backup_$(date +%Y%m%d).sql.gz
   ```

3. **استعادة من نسخة احتياطية**
   ```bash
   # استعادة عادية
   psql "postgresql://[connection-string]" < backup_20240115.sql
   
   # استعادة من ملف مضغوط
   gunzip < backup_20240115.sql.gz | psql "postgresql://[connection-string]"
   ```

---

## 🔧 الخطوة 9: تحسين الأداء

### 1. مراقبة الأداء في Neon

1. اذهب إلى Neon Dashboard
2. اضغط على "Monitoring"
3. راقب:
   - عدد الاتصالات
   - وقت الاستجابة
   - استخدام الذاكرة

### 2. تحليل الاستعلامات البطيئة

```sql
-- عرض الاستعلامات النشطة
SELECT pid, usename, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- إحصائيات الجداول
SELECT schemaname, tablename, 
       n_live_tup as rows,
       n_tup_ins as inserts,
       n_tup_upd as updates,
       n_tup_del as deletes
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### 3. تحسين الفهارس

```sql
-- تحليل استخدام الفهارس
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- إعادة بناء الفهارس (عند الحاجة)
REINDEX TABLE violations;
REINDEX TABLE vehicles;
```

---

## 🐛 استكشاف الأخطاء وإصلاحها

### مشكلة: خطأ في الاتصال

```
Error: Connection failed
```

**الحل:**
1. تحقق من رابط DATABASE_URL
2. تأكد من أن قاعدة البيانات في Neon نشطة (Active)
3. تحقق من الاتصال بالإنترنت
4. جرب الاتصال من Neon Dashboard

### مشكلة: خطأ في الصلاحيات

```
Error: permission denied for table users
```

**الحل:**
```sql
-- منح الصلاحيات للمستخدم
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### مشكلة: الجداول غير موجودة

```
Error: relation "users" does not exist
```

**الحل:**
1. نفذ سكريبت schema.sql مرة أخرى
2. تأكد من أنك متصل بقاعدة البيانات الصحيحة

### مشكلة: DATABASE_URL غير موجود

```
Error: DATABASE_URL not found in environment variables
```

**الحل:**
1. تأكد من وجود ملف .env
2. تأكد من إضافة DATABASE_URL في Netlify (للنشر)
3. أعد تشغيل الخادم

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء حساب Neon
- [ ] إنشاء مشروع في Neon
- [ ] الحصول على رابط الاتصال (DATABASE_URL)
- [ ] استيراد المخطط (schema.sql)
- [ ] إعداد المتغيرات البيئية (.env)
- [ ] إنشاء المستخدمين الافتراضيين
- [ ] اختبار الاتصال
- [ ] إضافة بيانات تجريبية (اختياري)
- [ ] إعداد النسخ الاحتياطي
- [ ] للنشر: ربط Neon مع Netlify

---

## 📚 موارد إضافية

- **Neon Documentation**: https://neon.tech/docs
- **PostgreSQL Manual**: https://www.postgresql.org/docs/
- **Neon + Netlify Guide**: [NETLIFY_NEON_SETUP.md](../NETLIFY_NEON_SETUP.md)
- **Node.js PostgreSQL**: https://node-postgres.com/

---

## 📞 الدعم الفني

في حال واجهت أي مشاكل:

1. **راجع الوثائق:**
   - [NETLIFY_NEON_SETUP.md](../NETLIFY_NEON_SETUP.md) - للنشر على Netlify
   - [README.md](../README.md) - دليل المشروع

2. **تحقق من السجلات:**
   ```bash
   # سجلات الخادم المحلي
   npm run start:api
   
   # سجلات Netlify
   # في Netlify Dashboard: Deploys > [Latest Deploy] > Deploy log
   ```

3. **موارد Neon:**
   - Neon Status: https://neon.tech/status
   - Neon Support: https://neon.tech/docs/introduction/support

---

**© 2025 نظام المرور - Traffic Management System**
