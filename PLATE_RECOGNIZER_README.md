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

## الإعداد

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
https://example.com/image1.jpg
https://example.com/image2.jpg
/path/to/local/image3.jpg
```

### 7. تشغيل السكربت

#### الاستخدام الأساسي:
```bash
python snapshot_to_postgres.py --images images.txt
```

#### مع تأخير مخصص بين الطلبات:
```bash
python snapshot_to_postgres.py --images images.txt --delay 1.0
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

## التشغيل باستخدام Docker

### البناء والتشغيل
```bash
docker-compose up -d
```

هذا سيقوم بما يلي:
- إنشاء قاعدة بيانات PostgreSQL
- بناء صورة Docker للتطبيق
- تشغيل السكربت

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
0 * * * * /usr/bin/python3 /path/to/snapshot_to_postgres.py --images /path/to/images.txt
```

### التكامل مع أنظمة أخرى
يمكن استيراد الدوال من السكربت واستخدامها في تطبيقات أخرى:
```python
from snapshot_to_postgres import send_request, parse_and_normalize_response, upload_to_s3

# استخدام الدوال
payload = {"image_url": "https://example.com/image.jpg"}
response = send_request(payload)
record = parse_and_normalize_response(response)
```

## الدعم والمساعدة

للمزيد من المعلومات، راجع:
- [توثيق Plate Recognizer](https://guides.platerecognizer.com/docs/snapshot/getting-started)
- [توثيق PostgreSQL](https://www.postgresql.org/docs/)
- [توثيق AWS S3](https://docs.aws.amazon.com/s3/)
- [توثيق boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
