# Plate Recognizer Snapshot → PostgreSQL

هذا المجلد يوفّر سكربت بايثون لإرسال صور أو روابط صور إلى Plate Recognizer Snapshot API، وقراءة النتائج وتخزينها في PostgreSQL بصيغة مرنة (JSONB).

## الإعداد

### 1. إنشاء قاعدة البيانات
أنشئ قاعدة بيانات PostgreSQL.

### 2. تكوين المتغيرات البيئية
انسخ `.env.example` إلى `.env` واملأ القيم:
- `PLATE_API_KEY`: مفتاح API من Plate Recognizer
- `SNAPSHOT_API_URL`: نقطة نهاية API (مثال: `https://api.platerecognizer.com/v1/plate-reader/`)
- `DATABASE_URL`: رابط الاتصال بقاعدة بيانات PostgreSQL

### 3. تثبيت المتطلبات
```bash
pip install -r requirements.txt
```

### 4. إنشاء الجداول
شغّل السكربت SQL لإنشاء الجداول:
```bash
psql -d yourdb -f db_schema.sql
```

### 5. تحضير ملف الصور
حضّر ملف نصي `images.txt` مع رابط/مسار صورة لكل سطر:
```
https://example.com/image1.jpg
https://example.com/image2.jpg
/path/to/local/image3.jpg
```

### 6. تشغيل السكربت
نفّذ السكربت:
```bash
python snapshot_to_postgres.py --images images.txt
```

أو مع تأخير مخصص بين الطلبات:
```bash
python snapshot_to_postgres.py --images images.txt --delay 1.0
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
- `image_url`: رابط الصورة الأصلية
- `meta`: بيانات إضافية (JSONB)
- `created_at`: تاريخ إضافة السجل

## ملاحظات مهمة

- راجع حدود الاستهلاك في Plate Recognizer وPolicy الخصوصية
- يمكن تكييف السكربت لإرسال دفعات أو العمل كمهمة مجدولة
- يدعم السكربت كلاً من:
  - روابط الصور عبر الإنترنت
  - ملفات الصور المحلية

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
