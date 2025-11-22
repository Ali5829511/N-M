# Plate Recognizer Snapshot Integration Guide
# دليل تكامل Plate Recognizer Snapshot

## 📋 نظرة عامة / Overview

هذا الدليل الشامل لإعداد واستخدام تكامل Plate Recognizer Snapshot API مع PostgreSQL.

This comprehensive guide covers setup and usage of the Plate Recognizer Snapshot API integration with PostgreSQL.

---

## 🎯 الهدف / Objective

توفير نظام متكامل لـ:
- جمع بيانات المركبات من Plate Recognizer Snapshot API
- تخزين النتائج في PostgreSQL بصيغة JSONB
- حفظ الصور كبيانات ثنائية (binary/bytea)
- معالجة الصور من URLs أو ملفات محلية

Provide an integrated system to:
- Collect vehicle data from Plate Recognizer Snapshot API
- Store results in PostgreSQL as JSONB
- Save images as binary data (binary/bytea)
- Process images from URLs or local files

---

## 📦 المكونات / Components

### 1. Files / الملفات

| File | Description (AR) | Description (EN) |
|------|------------------|------------------|
| `snapshot_to_postgres.py` | السكربت الرئيسي للتكامل | Main integration script |
| `retrieve_images.py` | استرجاع الصور من قاعدة البيانات | Retrieve images from database |
| `db_schema.sql` | سكيما قاعدة البيانات | Database schema |
| `docker-compose.yml` | تكوين Docker | Docker configuration |
| `Dockerfile.snapshot` | صورة Docker للتطبيق | Docker image for application |
| `.env.example` | مثال المتغيرات البيئية | Environment variables example |

### 2. Database Schema / سكيما قاعدة البيانات

```sql
CREATE TABLE vehicle_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_id VARCHAR(100) UNIQUE,
    raw_response JSONB NOT NULL,
    image_url TEXT,
    image_data BYTEA,
    image_mime TEXT,
    image_size INTEGER,
    image_sha256 TEXT,
    plate_number VARCHAR(50),
    plate_region VARCHAR(50),
    confidence FLOAT,
    status VARCHAR(20) DEFAULT 'processed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 التثبيت والإعداد / Installation & Setup

### المتطلبات الأساسية / Prerequisites

- Docker و Docker Compose
- Python 3.8+ (للتشغيل المحلي)
- حساب Plate Recognizer API
- PostgreSQL 12+ (إذا لم تستخدم Docker)

### خطوة 1: Clone المستودع / Clone Repository

```bash
git clone https://github.com/Ali5829511/N-M.git
cd N-M
git checkout feature/plate-recognizer-snapshot
```

### خطوة 2: إعداد البيئة / Configure Environment

```bash
# نسخ ملف البيئة / Copy environment file
cp .env.example .env

# تعديل الملف / Edit file
nano .env  # or vim, code, etc.
```

**المتغيرات المطلوبة / Required Variables:**

```env
# Plate Recognizer API
PLATE_RECOGNIZER_API_TOKEN=your_api_token_here
PLATE_RECOGNIZER_API_URL=https://api.platerecognizer.com/v1/plate-reader/

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=traffic_system
DB_USER=postgres
DB_PASSWORD=secure_password_here
```

### خطوة 3: تشغيل Docker / Start Docker

```bash
# تشغيل جميع الخدمات / Start all services
docker-compose up -d

# التحقق من الحالة / Check status
docker-compose ps

# عرض السجلات / View logs
docker-compose logs -f
```

### خطوة 4: تهيئة قاعدة البيانات / Initialize Database

```bash
# قاعدة البيانات ستُهيأ تلقائياً من db_schema.sql
# Database will be initialized automatically from db_schema.sql

# للتحقق / To verify
docker-compose exec postgres psql -U postgres -d traffic_system -c "\dt"
```

---

## 📖 الاستخدام / Usage

### 1. معالجة صورة من URL / Process Image from URL

```bash
docker-compose exec plate_recognizer python snapshot_to_postgres.py \
  https://example.com/car.jpg
```

### 2. معالجة صورة محلية / Process Local Image

```bash
# نسخ الصورة إلى الحاوية / Copy image to container
docker cp /path/to/local/car.jpg traffic_plate_recognizer:/app/images/

# معالجة الصورة / Process image
docker-compose exec plate_recognizer python snapshot_to_postgres.py \
  /app/images/car.jpg
```

### 3. إرسال URL بدلاً من الرفع / Send URL instead of Upload

```bash
docker-compose exec plate_recognizer python snapshot_to_postgres.py \
  https://example.com/car.jpg --url-only
```

### 4. التشغيل المحلي بدون Docker / Run Locally without Docker

```bash
# تثبيت المتطلبات / Install requirements
pip install -r requirements.txt

# تشغيل السكربت / Run script
export PLATE_RECOGNIZER_API_TOKEN="your_token"
export DB_PASSWORD="your_password"
python snapshot_to_postgres.py https://example.com/car.jpg
```

---

## 🔍 استرجاع الصور / Retrieving Images

### استخدام السكربت / Using Script

```bash
# عرض قائمة اللقطات / List snapshots
docker-compose exec plate_recognizer python retrieve_images.py list

# عرض 20 لقطة / Show 20 snapshots
docker-compose exec plate_recognizer python retrieve_images.py list 20

# استرجاع صورة معينة / Retrieve specific image
docker-compose exec plate_recognizer python retrieve_images.py get 1

# استرجاع جميع الصور / Retrieve all images
docker-compose exec plate_recognizer python retrieve_images.py all

# استرجاع أول 50 صورة / Retrieve first 50 images
docker-compose exec plate_recognizer python retrieve_images.py all ./images 50
```

### استخدام SQL / Using SQL

```sql
-- عرض معلومات اللقطات / View snapshot information
SELECT id, snapshot_id, plate_number, image_mime, 
       image_size, confidence, created_at
FROM vehicle_snapshots
ORDER BY created_at DESC
LIMIT 10;

-- البحث عن رقم لوحة / Search by plate number
SELECT * FROM vehicle_snapshots
WHERE plate_number LIKE '%ABC%'
ORDER BY created_at DESC;

-- إحصائيات / Statistics
SELECT 
    COUNT(*) as total_snapshots,
    SUM(image_size) as total_size_bytes,
    pg_size_pretty(SUM(image_size)::bigint) as total_size,
    AVG(confidence) as avg_confidence
FROM vehicle_snapshots;

-- البحث في البيانات الخام JSONB / Search in raw JSONB data
SELECT id, plate_number, 
       raw_response->'results'->0->>'vehicle' as vehicle_type
FROM vehicle_snapshots
WHERE raw_response @> '{"results": [{"vehicle": {"type": "Car"}}]}';
```

---

## 🔒 الأمان والخصوصية / Security & Privacy

### ⚠️ تحذيرات مهمة / Important Warnings

1. **تخزين البيانات الحساسة / Storing Sensitive Data**
   - الصور قد تحتوي على معلومات شخصية
   - Images may contain personal information
   - تأكد من الامتثال للوائح حماية البيانات (GDPR, etc.)
   - Ensure compliance with data protection regulations

2. **التشفير / Encryption**
   - استخدم HTTPS فقط عند نقل البيانات
   - Use HTTPS only for data transfer
   - شفّر اتصالات قاعدة البيانات
   - Encrypt database connections
   - استخدم SSL/TLS لـ PostgreSQL
   - Use SSL/TLS for PostgreSQL

3. **الوصول / Access Control**
   - قيّد الوصول إلى قاعدة البيانات
   - Restrict database access
   - استخدم كلمات مرور قوية
   - Use strong passwords
   - فعّل المصادقة الثنائية
   - Enable two-factor authentication

### سياسة الاحتفاظ بالبيانات / Data Retention Policy

```sql
-- حذف البيانات الأقدم من 30 يوم / Delete data older than 30 days
DELETE FROM vehicle_snapshots 
WHERE created_at < NOW() - INTERVAL '30 days';

-- حذف الصور فقط، الاحتفاظ بالبيانات / Delete images only, keep metadata
UPDATE vehicle_snapshots 
SET image_data = NULL 
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 💾 إدارة التخزين / Storage Management

### مراقبة المساحة / Monitor Space

```bash
# حجم قاعدة البيانات / Database size
docker-compose exec postgres psql -U postgres -d traffic_system -c "
SELECT pg_size_pretty(pg_database_size('traffic_system')) as db_size;
"

# حجم الجدول / Table size
docker-compose exec postgres psql -U postgres -d traffic_system -c "
SELECT pg_size_pretty(pg_total_relation_size('vehicle_snapshots')) as table_size;
"

# حجم الصور فقط / Images size only
docker-compose exec postgres psql -U postgres -d traffic_system -c "
SELECT pg_size_pretty(SUM(image_size)::bigint) as images_size
FROM vehicle_snapshots;
"
```

### التنظيف / Cleanup

```bash
# حذف البيانات القديمة / Delete old data
docker-compose exec postgres psql -U postgres -d traffic_system -c "
DELETE FROM vehicle_snapshots 
WHERE created_at < NOW() - INTERVAL '7 days';
"

# تحرير المساحة / Free up space
docker-compose exec postgres psql -U postgres -d traffic_system -c "
VACUUM FULL vehicle_snapshots;
"

# إعادة بناء الفهارس / Rebuild indexes
docker-compose exec postgres psql -U postgres -d traffic_system -c "
REINDEX TABLE vehicle_snapshots;
"
```

---

## 📊 النسخ الاحتياطي والاستعادة / Backup & Restore

### النسخ الاحتياطي / Backup

```bash
# نسخ احتياطي كامل / Full backup
docker-compose exec postgres pg_dump -U postgres traffic_system \
  > backup_full_$(date +%Y%m%d_%H%M%S).sql

# نسخ احتياطي للجدول فقط / Table only backup
docker-compose exec postgres pg_dump -U postgres -t vehicle_snapshots traffic_system \
  > backup_snapshots_$(date +%Y%m%d_%H%M%S).sql

# نسخ احتياطي بدون الصور / Backup without images
docker-compose exec postgres pg_dump -U postgres traffic_system \
  --exclude-table-data=vehicle_snapshots \
  > backup_no_images_$(date +%Y%m%d_%H%M%S).sql
```

### الاستعادة / Restore

```bash
# استعادة كاملة / Full restore
docker-compose exec -T postgres psql -U postgres traffic_system < backup.sql

# استعادة الجدول فقط / Restore table only
docker-compose exec -T postgres psql -U postgres traffic_system < backup_snapshots.sql
```

---

## 🐛 استكشاف الأخطاء / Troubleshooting

### مشكلة: API Token غير صحيح / Invalid API Token

**الأعراض / Symptoms:**
```
❌ Error: 401 Unauthorized
```

**الحل / Solution:**
```bash
# التحقق من التوكن / Verify token
echo $PLATE_RECOGNIZER_API_TOKEN

# اختبار الاتصال / Test connection
curl -H "Authorization: Token $PLATE_RECOGNIZER_API_TOKEN" \
  https://api.platerecognizer.com/v1/plate-reader/
```

### مشكلة: فشل الاتصال بقاعدة البيانات / Database Connection Failed

**الأعراض / Symptoms:**
```
❌ Database connection error: could not connect to server
```

**الحل / Solution:**
```bash
# التحقق من حالة PostgreSQL / Check PostgreSQL status
docker-compose ps postgres

# إعادة التشغيل / Restart
docker-compose restart postgres

# اختبار الاتصال / Test connection
docker-compose exec postgres psql -U postgres -d traffic_system -c "SELECT 1;"
```

### مشكلة: نفاد المساحة / Out of Disk Space

**الأعراض / Symptoms:**
```
❌ Error: No space left on device
```

**الحل / Solution:**
```bash
# فحص المساحة / Check space
df -h

# حذف البيانات القديمة / Delete old data
docker-compose exec postgres psql -U postgres -d traffic_system -c "
DELETE FROM vehicle_snapshots WHERE created_at < NOW() - INTERVAL '7 days';
VACUUM FULL vehicle_snapshots;
"

# تنظيف Docker / Clean Docker
docker system prune -a --volumes
```

### مشكلة: بطء في الأداء / Slow Performance

**الحل / Solution:**
```sql
-- إعادة بناء الفهارس / Rebuild indexes
REINDEX TABLE vehicle_snapshots;

-- تحديث الإحصائيات / Update statistics
ANALYZE vehicle_snapshots;

-- فحص الاستعلامات البطيئة / Check slow queries
EXPLAIN ANALYZE 
SELECT * FROM vehicle_snapshots WHERE plate_number = 'ABC123';
```

---

## 📈 أفضل الممارسات / Best Practices

### 1. الأداء / Performance

- ✅ حدد حجم الصور (< 2 MB) / Limit image size (< 2 MB)
- ✅ استخدم الفهارس للبحث السريع / Use indexes for fast search
- ✅ قم بتنظيف البيانات القديمة بانتظام / Clean old data regularly
- ✅ استخدم VACUUM بشكل دوري / Use VACUUM periodically

### 2. الأمان / Security

- ✅ لا تضع .env في Git / Don't commit .env to Git
- ✅ استخدم كلمات مرور قوية / Use strong passwords
- ✅ شفّر الاتصالات / Encrypt connections
- ✅ قيّد الوصول للشبكة / Restrict network access

### 3. الموثوقية / Reliability

- ✅ النسخ الاحتياطي اليومي / Daily backups
- ✅ راقب المساحة المتاحة / Monitor available space
- ✅ سجّل الأخطاء / Log errors
- ✅ اختبر الاستعادة / Test restore procedures

---

## 📚 مراجع إضافية / Additional References

- [Plate Recognizer API Documentation](https://docs.platerecognizer.com/)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [psycopg2 Documentation](https://www.psycopg.org/docs/)

---

## 🆘 الدعم / Support

إذا واجهت مشاكل / If you encounter issues:

1. راجع قسم استكشاف الأخطاء / Check Troubleshooting section
2. راجع السجلات / Check logs: `docker-compose logs -f`
3. افتح Issue على GitHub / Open an issue on GitHub
4. راسل الدعم الفني / Contact technical support

---

## 📝 الترخيص / License

هذا المشروع مرخص تحت رخصة MIT / This project is licensed under the MIT License.

جميع الحقوق محفوظة © 2025 / All rights reserved © 2025
