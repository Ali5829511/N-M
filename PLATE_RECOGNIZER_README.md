# Plate Recognizer Snapshot → PostgreSQL

هذا المجلد يوفّر سكربت بايثون لإرسال صور أو روابط صور إلى Plate Recognizer Snapshot API، وقراءة النتائج وتخزينها في PostgreSQL بصيغة مرنة (JSONB). يدعم السكربت تخزين الصور في Amazon S3 أو MinIO أو مباشرة في قاعدة البيانات.

## الإعداد

### 1. إنشاء قاعدة البيانات
أنشئ قاعدة بيانات PostgreSQL.

### 2. تكوين المتغيرات البيئية
انسخ `.env.example` إلى `.env` واملأ القيم:
- `PLATE_API_KEY`: مفتاح API من Plate Recognizer
- `SNAPSHOT_API_URL`: نقطة نهاية API (مثال: `https://api.platerecognizer.com/v1/plate-reader/`)
- `DATABASE_URL`: رابط الاتصال بقاعدة بيانات PostgreSQL
- `STORE_IMAGES`: وضع التخزين - `s3` (افتراضي) أو `db`
- `S3_BUCKET`: اسم S3 bucket (مطلوب عند `STORE_IMAGES=s3`)
- `AWS_ACCESS_KEY_ID`: مفتاح الوصول إلى AWS
- `AWS_SECRET_ACCESS_KEY`: المفتاح السري لـ AWS
- `AWS_REGION`: منطقة AWS (افتراضي: `us-east-1`)

⚠️ **تحذير أمني**: لا تضف مفاتيح حقيقية في ملف `.env` المدرج في نظام التحكم بالإصدار. استخدم GitHub Secrets أو متغيرات بيئة آمنة في بيئة الإنتاج.

### 3. إعداد تخزين الصور

#### الخيار 1: Amazon S3 (الافتراضي - موصى به)
```bash
# في ملف .env
STORE_IMAGES=s3
S3_BUCKET=your-vehicle-snapshots-bucket
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

خطوات إعداد S3:
1. أنشئ bucket في AWS S3
2. اضبط سياسات الوصول (عام للقراءة أو استخدم presigned URLs)
3. أنشئ IAM user مع صلاحيات `s3:PutObject` و `s3:GetObject`

#### الخيار 2: MinIO (بديل مفتوح المصدر لـ S3)
```bash
# في ملف .env
STORE_IMAGES=s3
S3_BUCKET=vehicle-snapshots
AWS_ENDPOINT_URL=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
```

لتشغيل MinIO محلياً:
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

#### الخيار 3: تخزين في قاعدة البيانات
```bash
# في ملف .env
STORE_IMAGES=db
```

⚠️ **تحذير**: تخزين الصور في قاعدة البيانات قد يؤدي إلى:
- زيادة كبيرة في حجم قاعدة البيانات
- تباطؤ في الأداء
- تكاليف أعلى للنسخ الاحتياطية

يُنصح باستخدام S3 للإنتاج.

### 4. تثبيت المتطلبات
```bash
pip install -r requirements.txt
```

### 5. إنشاء الجداول
شغّل السكربت SQL لإنشاء الجداول:
```bash
psql -d yourdb -f db_schema.sql
```

أو باستخدام متغير DATABASE_URL:
```bash
psql $DATABASE_URL -f db_schema.sql
```

### 6. تحضير ملف الصور
حضّر ملف نصي `images.txt` مع رابط/مسار صورة لكل سطر:
```
https://example.com/image1.jpg
https://example.com/image2.jpg
/path/to/local/image3.jpg
```

### 7. تشغيل السكربت
نفّذ السكربت مع المعاملات الأساسية:
```bash
python snapshot_to_postgres.py --images images.txt
```

مع معاملات متقدمة:
```bash
python snapshot_to_postgres.py \
  --images images.txt \
  --delay 1.0 \
  --confidence-threshold 0.8
```

المعاملات المتاحة:
- `--images`: ملف نصي يحتوي على صور (مطلوب)
- `--delay`: تأخير بين الطلبات بالثواني (افتراضي: 0.5)
- `--confidence-threshold`: حد أدنى للثقة في قراءة اللوحة (افتراضي: 0.0)

## التشغيل باستخدام Docker

### البناء والتشغيل
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
- `image_url`: رابط الصورة في S3 أو URL الأصلي
- `image_data`: بايتات الصورة (bytea، NULL عند استخدام S3)
- `image_mime`: نوع MIME للصورة
- `image_size`: حجم الصورة بالبايت
- `image_sha256`: SHA256 hash للصورة (للتحقق من التكرار)
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
- ⚠️ تحتوي الصور على معلومات حساسة (لوحات المركبات، مواقع)
- تأكد من تأمين الوصول إلى S3 bucket والبيانات
- استخدم HTTPS دائماً لنقل البيانات
- التزم بقوانين حماية البيانات المحلية (GDPR، إلخ)
- احذف الصور بعد فترة محددة إذا لم تكن هناك حاجة قانونية للاحتفاظ بها

### حجم التخزين
- كل صورة عالية الجودة قد تستهلك 1-3 ميجابايت
- 1000 صورة = ~2 جيجابايت تخزين
- خطط لتكاليف التخزين في S3 أو قاعدة البيانات

### حدود API
- راجع حدود الاستهلاك في Plate Recognizer
- استخدم `--delay` لتجنب تجاوز الحدود
- يمكن تكييف السكربت لإرسال دفعات أو العمل كمهمة مجدولة

### دعم أنواع الصور
- يدعم السكربت:
  - روابط الصور عبر الإنترنت (http/https)
  - ملفات الصور المحلية (jpg, png, إلخ)
- يتم حساب SHA256 لكل صورة لمنع التكرار

## الاستخدام المتقدم

### معالجة دفعات كبيرة
للمعالجة المجدولة، يمكن استخدام cron:
```bash
0 * * * * /usr/bin/python3 /path/to/snapshot_to_postgres.py --images /path/to/images.txt
```

### التكامل مع أنظمة أخرى
يمكن استيراد الدوال من السكربت واستخدامها في تطبيقات أخرى:
```python
from snapshot_to_postgres import send_request, parse_and_normalize_response

# استخدام الدوال
payload = {"image_url": "https://example.com/image.jpg"}
response = send_request(payload)
record = parse_and_normalize_response(response)
```

## الدعم والمساعدة

للمزيد من المعلومات، راجع:
- [توثيق Plate Recognizer](https://guides.platerecognizer.com/docs/snapshot/getting-started)
- [توثيق PostgreSQL](https://www.postgresql.org/docs/)
