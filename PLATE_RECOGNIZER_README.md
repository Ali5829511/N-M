# Plate Recognizer Snapshot → PostgreSQL (مع تخزين S3)

هذا المجلد يوفّر سكربت بايثون لإرسال صور أو روابط صور إلى Plate Recognizer Snapshot API، وقراءة النتائج وتخزينها في PostgreSQL بصيغة مرنة (JSONB)، مع دعم تخزين الصور في S3 أو قاعدة البيانات.

## الميزات الرئيسية

- ✅ إرسال صور إلى Plate Recognizer Snapshot API
- ✅ تخزين النتائج في PostgreSQL
- ✅ **تخزين الصور في AWS S3 (الوضع الافتراضي)**
- ✅ تخزين الصور في قاعدة البيانات كـ bytea (اختياري)
- ✅ حساب SHA256 للصور لتجنب التكرار
- ✅ دعم MIME types وحجم الملفات
- ✅ فلترة بحد أدنى للثقة (confidence threshold)
- ✅ إعادة محاولة تلقائية عند فشل الشبكة
- ✅ دعم MinIO كبديل لـ AWS S3

## Features

### 1. إنشاء قاعدة البيانات
أنشئ قاعدة بيانات PostgreSQL:
```bash
createdb platenet
```

### 2. تكوين المتغيرات البيئية
انسخ `.env.example` إلى `.env` واملأ القيم:

```bash
cp .env.example .env
```

املأ المتغيرات التالية في `.env`:

#### متغيرات إلزامية:
- `PLATE_API_KEY`: مفتاح API من Plate Recognizer
- `SNAPSHOT_API_URL`: نقطة نهاية API (مثال: `https://api.platerecognizer.com/v1/plate-reader/`)
- `DATABASE_URL`: رابط الاتصال بقاعدة بيانات PostgreSQL
- `STORE_IMAGES`: وضع التخزين - `s3` (افتراضي) أو `db`
- `S3_BUCKET`: اسم S3 bucket (مطلوب عند `STORE_IMAGES=s3`)
- `AWS_ACCESS_KEY_ID`: مفتاح الوصول إلى AWS
- `AWS_SECRET_ACCESS_KEY`: المفتاح السري لـ AWS
- `AWS_REGION`: منطقة AWS (افتراضي: `us-east-1`)

#### متغيرات تخزين الصور (للوضع S3):
- `STORE_IMAGES=s3` (الافتراضي، موصى به)
- `S3_BUCKET`: اسم حاوية S3
- `AWS_REGION`: منطقة AWS (مثال: `us-east-1`)
- `AWS_ACCESS_KEY_ID`: مفتاح الوصول إلى AWS
- `AWS_SECRET_ACCESS_KEY`: المفتاح السري لـ AWS

#### للتخزين في قاعدة البيانات بدلاً من S3:
```bash
STORE_IMAGES=db
```

**⚠️ تحذير**: لا تضف ملف `.env` الحقيقي إلى Git! استخدم `.env.example` كنموذج فقط.

### 3. تثبيت المتطلبات
```bash
pip install -r requirements.txt
```

المتطلبات تشمل:
- `requests`: للتواصل مع API
- `psycopg2-binary`: للاتصال بـ PostgreSQL
- `python-dotenv`: لقراءة متغيرات البيئة
- `tqdm`: لعرض شريط التقدم
- `boto3`: للتخزين في S3

### 4. إنشاء الجداول
شغّل السكربت SQL لإنشاء الجداول:
```bash
psql -d platenet -f db_schema.sql
```

أو باستخدام متغير DATABASE_URL:
```bash
psql $DATABASE_URL -f db_schema.sql
```

### 5. إعداد S3 Bucket (إن كنت تستخدم STORE_IMAGES=s3)

#### باستخدام AWS S3:
1. أنشئ bucket في AWS S3
2. تأكد من أن IAM user لديه صلاحيات `s3:PutObject` و `s3:GetObject`
3. اضبط سياسة الوصول حسب احتياجاتك (عام أو خاص)

#### باستخدام MinIO (بديل محلي لـ S3):
```bash
# تشغيل MinIO محلياً
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

ثم أنشئ bucket:
```bash
# باستخدام MinIO client
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/plate-snapshots
```

### 6. تحضير ملف الصور
حضّر ملف نصي `images.txt` مع رابط/مسار صورة لكل سطر:
```

### 5. Prepare Images File

Create a text file `images.txt` with one image path/URL per line:

```
https://example.com/vehicle1.jpg
https://example.com/vehicle2.jpg
/path/to/local/vehicle3.jpg
```

### 7. تشغيل السكربت

#### الاستخدام الأساسي:
```bash
python snapshot_to_postgres.py --images images.txt
```

#### مع تأخير مخصص بين الطلبات:
```bash
# With delay between requests
python snapshot_to_postgres.py --images images.txt --delay 1.0

# With confidence threshold (only store plates with >80% confidence)
python snapshot_to_postgres.py --images images.txt --confidence-threshold 0.8

# Combined options
python snapshot_to_postgres.py --images images.txt --delay 1.0 --confidence-threshold 0.8
```

## Running with Docker

### Build and Run

1. **Set up environment variables** (copy `.env.example` to `.env` and fill credentials)

2. **Start services:**
```bash
docker-compose -f docker-compose.snapshot.yml up -d
```

This will:
- Create a PostgreSQL 15 database
- Build the application Docker image
- Start both services

3. **Execute the script:**
```bash
docker-compose -f docker-compose.snapshot.yml exec app python snapshot_to_postgres.py --images images.txt
```

4. **Stop services:**
```bash
docker-compose -f docker-compose.snapshot.yml down
```

To remove database data as well:
```bash
docker-compose -f docker-compose.snapshot.yml down -v
```

## Data Structure

Data is stored in the `vehicle_snapshots` table with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier (auto-generated) |
| `snapshot_ref` | TEXT | Reference ID from Plate Recognizer API |
| `camera_id` | TEXT | Camera identifier |
| `captured_at` | TIMESTAMPTZ | Image capture timestamp |
| `plate_text` | TEXT | Detected license plate text |
| `plate_confidence` | NUMERIC | Confidence score (0.0-1.0) |
| `makes_models` | JSONB | Vehicle make/model predictions |
| `colors` | JSONB | Detected colors |
| `bbox` | JSONB | Bounding box coordinates |
| `raw_response` | JSONB | Full API response |
| `image_url` | TEXT | S3 URL or original image reference |
| `image_data` | BYTEA | Image bytes (only when STORE_IMAGES=db) |
| `image_mime` | TEXT | MIME type (e.g., 'image/jpeg') |
| `image_size` | INTEGER | Image size in bytes |
| `image_sha256` | TEXT | SHA256 hash (for deduplication) |
| `meta` | JSONB | Additional metadata |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |

### Indexes

The schema includes indexes for efficient queries:
- `idx_vehicle_plate_text`: Search by plate text
- `idx_vehicle_created_at`: Search by date
- `idx_vehicle_makes_models_jsonb`: GIN index for JSONB queries on vehicle data
- `idx_vehicle_image_sha256`: Deduplication queries

## Image Storage Options

### Option 1: S3 Storage (Default, Recommended)

**Advantages:**
- Scalable storage
- Cost-effective for large datasets
- Fast access via CDN
- Automatic backups

**Configuration:**
```bash
STORE_IMAGES=s3
S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

#### مع حد أدنى للثقة:
```bash
python snapshot_to_postgres.py --images images.txt --confidence-threshold 0.8
```

#### جميع الخيارات معاً:
```bash
python snapshot_to_postgres.py \
  --images images.txt \
  --delay 0.5 \
  --confidence-threshold 0.75
```

المعاملات المتاحة:
- `--images`: ملف نصي يحتوي على صور (مطلوب)
- `--delay`: تأخير بين الطلبات بالثواني (افتراضي: 0.5)
- `--confidence-threshold`: حد أدنى للثقة في قراءة اللوحة (افتراضي: 0.0)

## التشغيل باستخدام Docker

**⚠️ WARNING:** Storing images in database can cause:
- Large database size
- Slower queries
- Backup/restore issues
- Higher costs

**Configuration:**
```bash
docker-compose -f docker-compose.snapshot.yml up -d
```

هذا سيقوم بما يلي:
- إنشاء قاعدة بيانات PostgreSQL
- بناء صورة Docker للتطبيق
- تشغيل السكربت

للإيقاف:
```bash
docker-compose -f docker-compose.snapshot.yml down
```

## بنية البيانات

يتم تخزين البيانات في جدول `vehicle_snapshots` مع الحقول التالية:
- `id`: معرف فريد (UUID)
- `snapshot_ref`: مرجع اللقطة من API
- `camera_id`: معرف الكاميرا
- `captured_at`: تاريخ ووقت التقاط الصورة
- `plate_text`: نص اللوحة المكتشفة
- `plate_confidence`: مستوى الثقة في القراءة
- `makes_models`: معلومات الصانع والطراز (JSONB)
- `colors`: الألوان المكتشفة (JSONB)
- `bbox`: إحداثيات صندوق الحدود (JSONB)
- `raw_response`: الرد الكامل من API (JSONB)
- `image_url`: رابط الصورة (S3 URL أو URL الأصلي)
- **`image_data`**: بيانات الصورة (bytea) - NULL عند STORE_IMAGES=s3
- **`image_mime`**: نوع MIME للصورة (مثال: image/jpeg)
- **`image_size`**: حجم الصورة بالبايتات
- **`image_sha256`**: SHA256 hash للصورة (لتجنب التكرار)
- `meta`: بيانات إضافية (JSONB)
- `created_at`: تاريخ إضافة السجل

## استرجاع الصور

### من S3:
```python
import psycopg2
import requests

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# الحصول على URL الصورة
cur.execute("SELECT image_url, plate_text FROM vehicle_snapshots WHERE plate_text = %s", ("ABC123",))
row = cur.fetchone()

if row:
    image_url, plate = row
    # تحميل الصورة
    response = requests.get(image_url)
    with open(f"{plate}.jpg", "wb") as f:
        f.write(response.content)
```

### من قاعدة البيانات:
```python
import psycopg2

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# الحصول على بايتات الصورة
cur.execute("SELECT image_data, image_mime, plate_text FROM vehicle_snapshots WHERE plate_text = %s", ("ABC123",))
row = cur.fetchone()

if row:
    image_data, mime, plate = row
    # حفظ الصورة
    extension = mime.split('/')[-1] if mime else 'jpg'
    with open(f"{plate}.{extension}", "wb") as f:
        f.write(image_data)
```

## ملاحظات مهمة

### الخصوصية والأمان
- ⚠️ **لا تضف مفاتيح API أو بيانات AWS إلى Git**
- استخدم `.env` للتطوير المحلي (موجود في `.gitignore`)
- للإنتاج، استخدم GitHub Secrets أو AWS Secrets Manager
- تأكد من تشفير قاعدة البيانات إذا كنت تخزن الصور فيها (STORE_IMAGES=db)

### حجم التخزين
- **S3 (موصى به)**: أفضل للصور الكبيرة والعدد الكبير من السجلات
- **قاعدة البيانات**: مناسب للتطبيقات الصغيرة، لكنه قد يبطئ الأداء مع الصور الكبيرة

### حدود API
- راجع حدود الاستهلاك في Plate Recognizer
- استخدم `--delay` لتجنب تجاوز حدود الطلبات

### تجنب التكرار
- يستخدم السكربت SHA256 لتحديد الصور بشكل فريد
- الصور في S3 تُخزن باسم مبني على SHA256

## الاستخدام المتقدم

### استرجاع الصور من قاعدة البيانات

إذا كنت تستخدم `STORE_IMAGES=db`، يمكنك استرجاع الصور:

```python
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv("DATABASE_URL"))

with conn.cursor() as cur:
    cur.execute("SELECT image_data, image_mime FROM vehicle_snapshots WHERE id = %s", (record_id,))
    image_data, mime_type = cur.fetchone()
    
    # حفظ الصورة
    with open(f"output.{mime_type.split('/')[1]}", "wb") as f:
        f.write(image_data)
```

### الوصول إلى الصور في S3

إذا كنت تستخدم `STORE_IMAGES=s3`:

```python
import boto3

s3 = boto3.client('s3')

# تحميل صورة
s3.download_file('your-bucket', 'plate-snapshots/abc123.jpg', 'local-image.jpg')

# أو الحصول على URL موقع مسبقاً
url = s3.generate_presigned_url('get_object',
    Params={'Bucket': 'your-bucket', 'Key': 'plate-snapshots/abc123.jpg'},
    ExpiresIn=3600)
```

### معالجة دفعات كبيرة
للمعالجة المجدولة، يمكن استخدام cron:
```bash
# Run every hour
0 * * * * cd /path/to/project && python snapshot_to_postgres.py --images /path/to/images.txt --delay 1.0 >> /var/log/plate-recognizer.log 2>&1
```

### Integration with Other Systems

Import functions from the script for use in other applications:

```python
from snapshot_to_postgres import send_request, parse_and_normalize_response, upload_to_s3

# Process single image
image_bytes, mime, size, sha256 = fetch_image_bytes("path/to/image.jpg")
s3_url = upload_to_s3(image_bytes, sha256, mime)
response = send_request_with_retry(None, image_url=s3_url)
record = parse_and_normalize_response(response)
```

### Querying Data

**Find all vehicles of a specific make:**
```sql
SELECT plate_text, captured_at, image_url
FROM vehicle_snapshots
WHERE makes_models @> '[{"make": "Toyota"}]'
ORDER BY captured_at DESC;
```

**Find high-confidence plates:**
```sql
SELECT plate_text, plate_confidence, image_url
FROM vehicle_snapshots
WHERE plate_confidence > 0.9
ORDER BY plate_confidence DESC;
```

**Check for duplicate images:**
```sql
SELECT image_sha256, COUNT(*) as count
FROM vehicle_snapshots
GROUP BY image_sha256
HAVING COUNT(*) > 1;
```

## GitHub Secrets Configuration

For CI/CD or automated workflows, add these secrets to your GitHub repository:

1. Go to Repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `PLATE_API_KEY`
   - `DATABASE_URL`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET`

**Never commit these values to the repository!**

## Troubleshooting

### Issue: "boto3 not found"
**Solution:** Install boto3: `pip install boto3`

### Issue: "S3 upload failed - Access Denied"
**Solution:** Check IAM permissions include `s3:PutObject` and `s3:GetObject`

### Issue: "Database column not found"
**Solution:** Re-run `db_schema.sql` to update table schema

### Issue: "Rate limit exceeded"
**Solution:** Increase `--delay` parameter or upgrade your Plate Recognizer plan

### Issue: "Low confidence results"
**Solution:** 
- Use higher quality images
- Use `--confidence-threshold` to filter low-quality results
- Check image resolution and lighting

## Support and Resources

For more information:
- [Plate Recognizer Documentation](https://guides.platerecognizer.com/docs/snapshot/getting-started)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

## License

للمزيد من المعلومات، راجع:
- [توثيق Plate Recognizer](https://guides.platerecognizer.com/docs/snapshot/getting-started)
- [توثيق PostgreSQL](https://www.postgresql.org/docs/)
- [توثيق AWS S3](https://docs.aws.amazon.com/s3/)
- [توثيق boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
