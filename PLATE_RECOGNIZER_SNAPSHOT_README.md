# Plate Recognizer Snapshot Integration
# دليل تكامل Plate Recognizer Snapshot

Complete guide for integrating Plate Recognizer Snapshot API with PostgreSQL database and S3 object storage.

دليل شامل لتكامل Plate Recognizer Snapshot API مع قاعدة بيانات PostgreSQL وتخزين S3.

---

## 📋 Table of Contents / جدول المحتويات

1. [Overview / نظرة عامة](#overview)
2. [Features / الميزات](#features)
3. [Prerequisites / المتطلبات](#prerequisites)
4. [Installation / التثبيت](#installation)
5. [Configuration / الإعداد](#configuration)
6. [Database Setup / إعداد قاعدة البيانات](#database-setup)
7. [S3 Setup / إعداد S3](#s3-setup)
8. [Usage / الاستخدام](#usage)
9. [Storage Modes / أوضاع التخزين](#storage-modes)
10. [Docker Deployment / النشر باستخدام Docker](#docker-deployment)
11. [Troubleshooting / حل المشاكل](#troubleshooting)
12. [Privacy & Legal / الخصوصية والقانون](#privacy-legal)

---

## Overview / نظرة عامة {#overview}

This integration allows you to:
- Capture vehicle license plate data using Plate Recognizer Snapshot API
- Store metadata and analysis results in PostgreSQL
- Store images in AWS S3 (default) or PostgreSQL (optional)
- Calculate SHA256 hashes for image integrity
- Filter results by confidence threshold

يتيح لك هذا التكامل:
- التقاط بيانات لوحات السيارات باستخدام Plate Recognizer Snapshot API
- تخزين البيانات الوصفية ونتائج التحليل في PostgreSQL
- تخزين الصور في AWS S3 (افتراضي) أو PostgreSQL (اختياري)
- حساب تجزئة SHA256 لسلامة الصور
- تصفية النتائج حسب عتبة الثقة

---

## Features / الميزات {#features}

### ✅ Core Features

- **🔍 Plate Recognition**: Automatic license plate detection and OCR
- **📊 Vehicle Analysis**: Extract vehicle make, model, color, and more
- **💾 Flexible Storage**: Choose between S3 (recommended) or database storage
- **🔐 Image Integrity**: SHA256 hashing for verification
- **📈 Confidence Filtering**: Filter low-confidence results
- **⚡ Batch Processing**: Process multiple images with progress tracking
- **🐳 Docker Ready**: Full Docker and docker-compose support
- **🌍 Bilingual**: Full support for English and Arabic

### الميزات الأساسية

- **🔍 التعرف على اللوحات**: كشف تلقائي للوحات السيارات و OCR
- **📊 تحليل المركبات**: استخراج نوع السيارة والموديل واللون والمزيد
- **💾 تخزين مرن**: اختر بين S3 (موصى به) أو التخزين في قاعدة البيانات
- **🔐 سلامة الصور**: تجزئة SHA256 للتحقق
- **📈 تصفية الثقة**: تصفية النتائج منخفضة الثقة
- **⚡ معالجة دفعية**: معالجة صور متعددة مع تتبع التقدم
- **🐳 جاهز لـ Docker**: دعم كامل لـ Docker و docker-compose
- **🌍 ثنائي اللغة**: دعم كامل للإنجليزية والعربية

---

## Prerequisites / المتطلبات {#prerequisites}

### Required / مطلوب

1. **Python 3.8+**
2. **PostgreSQL 12+** (with uuid-ossp extension)
3. **Plate Recognizer API Key** - Get from [platerecognizer.com](https://app.platerecognizer.com/)

### Optional (for S3 storage) / اختياري (لتخزين S3)

4. **AWS Account** with S3 access, or
5. **MinIO** (self-hosted S3-compatible storage)

---

## Installation / التثبيت {#installation}

### 1. Clone Repository / استنساخ المستودع

```bash
git clone https://github.com/Ali5829511/N-M.git
cd N-M
git checkout feature/plate-recognizer-snapshot
```

### 2. Install Python Dependencies / تثبيت تبعيات Python

```bash
pip install -r requirements.txt
```

This installs:
- `requests` - HTTP client for API calls
- `psycopg2-binary` - PostgreSQL adapter
- `python-dotenv` - Environment variable management
- `tqdm` - Progress bar
- `boto3` - AWS SDK (for S3 storage)
- `sqlalchemy` - SQL toolkit

---

## Configuration / الإعداد {#configuration}

### 1. Create Environment File / إنشاء ملف البيئة

```bash
cp .env.example .env
```

### 2. Edit Configuration / تعديل الإعداد

Edit `.env` and fill in your credentials:

```bash
# Plate Recognizer API
PLATE_API_KEY=your_actual_api_key_here
SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/platenet

# Storage Mode (s3 or db)
STORE_IMAGES=s3

# AWS S3 (if STORE_IMAGES=s3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

### ⚠️ Security Notes / ملاحظات الأمان

- **Never commit `.env` file** / لا تُرسل ملف `.env` إلى Git
- **Keep API keys secure** / احفظ مفاتيح API بأمان
- **Use different keys for dev/prod** / استخدم مفاتيح مختلفة للتطوير/الإنتاج
- **Rotate credentials regularly** / غيّر بيانات الاعتماد بانتظام

---

## Database Setup / إعداد قاعدة البيانات {#database-setup}

### 1. Create Database / إنشاء قاعدة البيانات

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE platenet;

# Connect to new database
\c platenet
```

### 2. Run Schema Migration / تشغيل ترحيل المخطط

```bash
psql -U postgres -d platenet -f db_schema.sql
```

This creates:
- `vehicle_snapshots` table with all required columns
- Indexes for efficient querying
- UUID extension
- Triggers for automatic timestamp updates

### 3. Verify Setup / التحقق من الإعداد

```sql
-- Check table structure
\d vehicle_snapshots

-- Check indexes
\di

-- Expected columns:
-- id, snapshot_ref, camera_id, captured_at, plate_text, 
-- plate_confidence, makes_models, colors, bbox, raw_response,
-- image_url, image_data, image_mime, image_size, image_sha256,
-- meta, created_at, updated_at
```

---

## S3 Setup / إعداد S3 {#s3-setup}

### Option 1: AWS S3

#### A. Create S3 Bucket / إنشاء دلو S3

```bash
# Using AWS CLI
aws s3 mb s3://your-vehicle-snapshots-bucket --region us-east-1
```

Or use AWS Console:
1. Go to S3 service
2. Click "Create bucket"
3. Enter unique bucket name
4. Select region
5. Configure permissions (keep default for private bucket)
6. Create bucket

#### B. Create IAM User / إنشاء مستخدم IAM

1. Go to IAM Console
2. Create new user with programmatic access
3. Attach policy: `AmazonS3FullAccess` (or create custom policy)
4. Save Access Key ID and Secret Access Key

#### C. Configure Bucket Policy (Optional) / تكوين سياسة الدلو

For public read access to images:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-vehicle-snapshots-bucket/*"
    }
  ]
}
```

### Option 2: MinIO (Self-Hosted)

MinIO is an open-source S3-compatible object storage server.

#### A. Install MinIO / تثبيت MinIO

```bash
# Using Docker
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v /data/minio:/data \
  minio/minio server /data --console-address ":9001"
```

#### B. Create Bucket / إنشاء دلو

1. Open http://localhost:9001
2. Login with credentials
3. Create bucket: `vehicle-snapshots`

#### C. Configure Environment / تكوين البيئة

```bash
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
S3_BUCKET=vehicle-snapshots
AWS_ENDPOINT_URL=http://localhost:9000  # MinIO endpoint
```

---

## Usage / الاستخدام {#usage}

### 1. Prepare Image List / تحضير قائمة الصور

Create `images.txt` with image paths or URLs (one per line):

```text
https://example.com/car1.jpg
https://example.com/car2.jpg
/path/to/local/image1.jpg
/path/to/local/image2.png
```

### 2. Run Script / تشغيل السكربت

#### Basic Usage / الاستخدام الأساسي

```bash
python snapshot_to_postgres.py --images images.txt
```

#### With Custom Delay / مع تأخير مخصص

```bash
python snapshot_to_postgres.py --images images.txt --delay 1.5
```

#### With Confidence Threshold / مع عتبة الثقة

```bash
# Only accept plates with confidence >= 0.8
python snapshot_to_postgres.py --images images.txt --confidence-threshold 0.8
```

#### Full Options / خيارات كاملة

```bash
python snapshot_to_postgres.py \
  --images images.txt \
  --delay 2.0 \
  --confidence-threshold 0.75
```

### 3. Query Results / الاستعلام عن النتائج

```sql
-- Get all snapshots
SELECT * FROM vehicle_snapshots ORDER BY created_at DESC LIMIT 10;

-- Search by plate number
SELECT * FROM vehicle_snapshots WHERE plate_text = 'ABC123';

-- Filter by confidence
SELECT * FROM vehicle_snapshots WHERE plate_confidence >= 0.9;

-- Get snapshots from last 24 hours
SELECT * FROM vehicle_snapshots 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Query vehicle makes/models (JSONB)
SELECT plate_text, makes_models->>'make' as make 
FROM vehicle_snapshots 
WHERE makes_models IS NOT NULL;
```

---

## Storage Modes / أوضاع التخزين {#storage-modes}

### Mode 1: S3 Storage (Default) / تخزين S3 (افتراضي)

**Recommended for production** / موصى به للإنتاج

```bash
STORE_IMAGES=s3
```

**Pros / الإيجابيات:**
- ✅ Scalable storage
- ✅ Better database performance
- ✅ Cost-effective for large volumes
- ✅ Built-in redundancy and backups
- ✅ CDN integration possible

**Cons / السلبيات:**
- ❌ Requires AWS account or MinIO setup
- ❌ Additional service to manage
- ❌ Network dependency for image access

**Data stored:**
- `image_url`: URL to image in S3
- `image_sha256`: Hash for verification
- `image_mime`, `image_size`: Metadata

### Mode 2: Database Storage / تخزين قاعدة البيانات

**Good for testing or small deployments** / جيد للاختبار أو النشر الصغير

```bash
STORE_IMAGES=db
```

**Pros / الإيجابيات:**
- ✅ Simple setup (no external storage)
- ✅ All data in one place
- ✅ Easier backups (single database dump)
- ✅ No network dependency

**Cons / السلبيات:**
- ❌ Increases database size significantly
- ❌ May impact database performance
- ❌ Higher backup/restore times
- ❌ Less scalable

**Data stored:**
- `image_data`: Full image as bytea
- `image_sha256`: Hash for verification
- `image_mime`, `image_size`: Metadata

### Retrieving Images / استرجاع الصور

#### From S3:

```python
# Images are accessible via URL
url = "https://bucket.s3.region.amazonaws.com/vehicle-snapshots/ab/cd/abcd123..."
```

#### From Database:

```python
import psycopg2

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
cur.execute("SELECT image_data, image_mime FROM vehicle_snapshots WHERE id = %s", (record_id,))
image_bytes, mime_type = cur.fetchone()

# Save to file
with open(f"image.{mime_type.split('/')[-1]}", "wb") as f:
    f.write(image_bytes)
```

```sql
-- SQL query to export image
\lo_export (SELECT image_data FROM vehicle_snapshots WHERE id = 'uuid') '/tmp/image.jpg'
```

---

## Docker Deployment / النشر باستخدام Docker {#docker-deployment}

### Using docker-compose / استخدام docker-compose

#### 1. Review Configuration / مراجعة الإعداد

Check `docker-compose.snapshot.yml`:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: platenet
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./db_schema.sql:/docker-entrypoint-initdb.d/db_schema.sql
    ports:
      - "5432:5432"

  app:
    build:
      context: .
      dockerfile: Dockerfile.snapshot
    environment:
      PLATE_API_KEY: ${PLATE_API_KEY}
      SNAPSHOT_API_URL: ${SNAPSHOT_API_URL}
      DATABASE_URL: postgres://user:pass@db:5432/platenet
      STORE_IMAGES: ${STORE_IMAGES}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_REGION: ${AWS_REGION}
      S3_BUCKET: ${S3_BUCKET}
    depends_on:
      - db
    volumes:
      - .:/app

volumes:
  db-data:
```

#### 2. Set Environment Variables / تعيين متغيرات البيئة

Create `.env` file with your credentials (shown above).

#### 3. Start Services / بدء الخدمات

```bash
# Start database and app
docker-compose -f docker-compose.snapshot.yml up -d

# Check logs
docker-compose -f docker-compose.snapshot.yml logs -f

# Stop services
docker-compose -f docker-compose.snapshot.yml down
```

#### 4. Run Script in Container / تشغيل السكربت في الحاوية

```bash
# Create images.txt first
echo "https://example.com/car.jpg" > images.txt

# Run script
docker-compose -f docker-compose.snapshot.yml exec app \
  python snapshot_to_postgres.py --images images.txt
```

### Volume Considerations / اعتبارات الحجم

**Database Volume:**
- Stores all PostgreSQL data
- Size depends on number of snapshots and STORE_IMAGES mode
- With `STORE_IMAGES=db`: ~1-5 MB per image
- With `STORE_IMAGES=s3`: ~10-50 KB per record

**Backup Recommendations:**
- Regular backups: `docker exec postgres pg_dump -U user platenet > backup.sql`
- For large deployments, use automated backup solutions
- Test restore procedures regularly

---

## Troubleshooting / حل المشاكل {#troubleshooting}

### Issue: "boto3 not installed"

**Solution:**
```bash
pip install boto3
```

### Issue: "AWS credentials not found"

**Solution:**
Ensure `.env` file contains:
```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### Issue: "S3 bucket does not exist"

**Solution:**
Create bucket first:
```bash
aws s3 mb s3://your-bucket-name
```

### Issue: "Database connection failed"

**Solution:**
Check DATABASE_URL format:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

### Issue: "Plate confidence too low"

**Solution:**
- Adjust `--confidence-threshold` parameter
- Improve image quality
- Ensure proper lighting in images
- Check camera angle and distance

### Issue: "API rate limit exceeded"

**Solution:**
- Increase `--delay` parameter
- Check your API plan limits
- Upgrade API plan if needed

### Enable Debug Mode / تفعيل وضع التصحيح

```bash
# Add verbose output
python snapshot_to_postgres.py --images images.txt --delay 1 2>&1 | tee debug.log
```

---

## Privacy & Legal / الخصوصية والقانون {#privacy-legal}

### ⚠️ Important Warnings / تحذيرات مهمة

#### Privacy Considerations / اعتبارات الخصوصية

- **License plate data is personal information** in many jurisdictions
- **Obtain proper consent** before capturing and storing vehicle data
- **Comply with GDPR, CCPA**, and local privacy laws
- **Implement data retention policies** (don't store data indefinitely)
- **Secure access controls** - limit who can access the data
- **Encrypt sensitive data** both in transit and at rest

#### Legal Requirements / المتطلبات القانونية

- ✅ **Check local laws** regarding vehicle surveillance
- ✅ **Post visible notices** if cameras are recording
- ✅ **Have legitimate purpose** for data collection
- ✅ **Implement data subject rights** (access, deletion, etc.)
- ✅ **Keep audit logs** of data access
- ✅ **Have incident response plan** for data breaches

#### Ethical Use / الاستخدام الأخلاقي

- ❌ **Do not** use for unauthorized surveillance
- ❌ **Do not** share data with unauthorized parties
- ❌ **Do not** use for discriminatory purposes
- ✅ **Do** limit data collection to necessary purposes
- ✅ **Do** inform individuals about data collection
- ✅ **Do** implement security best practices

### البيانات الشخصية والخصوصية

- **لوحات السيارات تُعتبر معلومات شخصية** في العديد من الولايات القضائية
- **احصل على موافقة مناسبة** قبل التقاط وتخزين بيانات السيارات
- **التزم بـ GDPR و CCPA** والقوانين المحلية للخصوصية
- **نفذ سياسات الاحتفاظ بالبيانات** (لا تخزن البيانات إلى الأبد)
- **ضوابط وصول آمنة** - حدد من يمكنه الوصول إلى البيانات
- **شفّر البيانات الحساسة** أثناء النقل والتخزين

---

## Additional Resources / موارد إضافية

### Documentation / التوثيق
- [Plate Recognizer API Docs](https://guides.platerecognizer.com/docs/snapshot/getting-started)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MinIO Documentation](https://min.io/docs/)

### Support / الدعم
- Report issues: [GitHub Issues](https://github.com/Ali5829511/N-M/issues)
- Plate Recognizer Support: support@platerecognizer.com
- Community: [Plate Recognizer Forum](https://guides.platerecognizer.com/)

---

## License / الترخيص

See LICENSE file in repository.

---

## Contributors / المساهمون

This integration was developed as part of the N-M Traffic Management System.

تم تطوير هذا التكامل كجزء من نظام إدارة المرور N-M.

---

**Last Updated:** 2025-11-22
**Version:** 1.0.0
