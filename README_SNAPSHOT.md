# Plate Recognizer Snapshot to PostgreSQL

هذا المشروع يوفر نظام متكامل لجمع بيانات السيارات من **Plate Recognizer Snapshot API** وتخزينها في قاعدة بيانات **PostgreSQL**.

This project provides a complete system for collecting vehicle data from **Plate Recognizer Snapshot API** and storing it in a **PostgreSQL** database.

---

## 📋 المحتويات / Contents

- [المتطلبات / Requirements](#المتطلبات--requirements)
- [الإعداد / Setup](#الإعداد--setup)
- [التشغيل المحلي / Local Execution](#التشغيل-المحلي--local-execution)
- [التشغيل باستخدام Docker / Docker Execution](#التشغيل-باستخدام-docker--docker-execution)
- [استخدام السكربت / Script Usage](#استخدام-السكربت--script-usage)
- [البنية / Structure](#البنية--structure)

---

## 📦 المتطلبات / Requirements

### التشغيل المحلي / Local Execution
- Python 3.11 أو أحدث / or newer
- PostgreSQL 15 أو أحدث / or newer
- حساب في Plate Recognizer / Plate Recognizer account with API key

### التشغيل عبر Docker / Docker Execution
- Docker
- Docker Compose

---

## 🚀 الإعداد / Setup

### 1. نسخ المستودع / Clone Repository

```bash
git clone https://github.com/Ali5829511/N-M.git
cd N-M
git checkout feature/plate-recognizer-snapshot
```

### 2. إعداد ملف البيئة / Configure Environment File

انسخ ملف `.env.example` إلى `.env` وقم بتعبئة القيم الحقيقية:

Copy `.env.example` to `.env` and fill in the actual values:

```bash
cp .env.example .env
```

قم بتحرير ملف `.env` وأضف:

Edit `.env` file and add:

```env
# Plate Recognizer API Key (احصل عليه من / Get it from: https://app.platerecognizer.com/)
PLATE_API_KEY=your_actual_api_key_here

# Snapshot API URL (استخدم القيمة الافتراضية / Use default value)
SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/

# Database URL (للتشغيل المحلي / For local execution)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/plate_recognizer

# Or for Docker (أو للتشغيل عبر Docker)
# DATABASE_URL=postgresql://postgres:postgres@db:5432/plate_recognizer

# Request delay in seconds (optional)
REQUEST_DELAY=1.0
```

### 3. إعداد قاعدة البيانات (للتشغيل المحلي فقط) / Database Setup (Local Only)

إذا كنت تستخدم التشغيل المحلي، قم بإنشاء قاعدة البيانات:

If using local execution, create the database:

```bash
# اتصل بـ PostgreSQL / Connect to PostgreSQL
psql -U postgres

# أنشئ قاعدة البيانات / Create database
CREATE DATABASE plate_recognizer;
\q
```

قم بتشغيل سكربت المخطط:

Run the schema script:

```bash
psql -U postgres -d plate_recognizer -f db_schema.sql
```

---

## 💻 التشغيل المحلي / Local Execution

### 1. تثبيت المتطلبات / Install Requirements

```bash
pip install -r requirements.txt
```

### 2. إعداد ملف الصور / Prepare Images File

أنشئ ملف `images.txt` يحتوي على مسارات الصور أو عناوين URL (سطر واحد لكل صورة):

Create an `images.txt` file containing image paths or URLs (one per line):

```text
# مسارات محلية / Local paths
/path/to/image1.jpg
/path/to/image2.jpg

# أو عناوين URL / Or URLs
https://example.com/image1.jpg
https://example.com/image2.jpg
```

### 3. تشغيل السكربت / Run Script

```bash
python snapshot_to_postgres.py images.txt

# أو مع معرف الكاميرا / Or with camera ID
python snapshot_to_postgres.py images.txt camera_001
```

---

## 🐳 التشغيل باستخدام Docker / Docker Execution

### 1. تعديل ملف `.env` / Update `.env` File

تأكد من أن `DATABASE_URL` يشير إلى خدمة Docker:

Ensure `DATABASE_URL` points to Docker service:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/plate_recognizer
```

### 2. بناء وتشغيل الحاويات / Build and Run Containers

```bash
# بناء وتشغيل الخدمات / Build and start services
docker-compose up -d

# عرض السجلات / View logs
docker-compose logs -f app
```

### 3. إيقاف الخدمات / Stop Services

```bash
docker-compose down

# لإيقاف وحذف البيانات / To stop and remove data
docker-compose down -v
```

---

## 📝 استخدام السكربت / Script Usage

### الصيغة / Syntax

```bash
python snapshot_to_postgres.py <images_file> [camera_id]
```

### المعاملات / Parameters

- `images_file`: ملف نصي يحتوي على مسارات الصور أو عناوين URL / Text file containing image paths or URLs
- `camera_id` (اختياري): معرف الكاميرا / (Optional) Camera identifier

### أمثلة / Examples

```bash
# معالجة صور من ملف / Process images from file
python snapshot_to_postgres.py images.txt

# معالجة صور مع معرف الكاميرا / Process images with camera ID
python snapshot_to_postgres.py images.txt parking_camera_01

# عرض المساعدة / Show help
python snapshot_to_postgres.py
```

---

## 📂 البنية / Structure

```
.
├── snapshot_to_postgres.py    # السكربت الرئيسي / Main script
├── db_schema.sql              # مخطط قاعدة البيانات / Database schema
├── requirements.txt           # المتطلبات / Python dependencies
├── .env.example              # مثال على ملف البيئة / Environment template
├── Dockerfile                # تكوين Docker / Docker configuration
├── docker-compose.yml        # تكوين Docker Compose / Docker Compose setup
├── images.txt                # ملف الصور (مثال) / Images file (example)
└── README.md                 # هذا الملف / This file
```

---

## 📊 بنية جدول البيانات / Database Table Structure

جدول `vehicle_snapshots` يحتوي على:

The `vehicle_snapshots` table contains:

| الحقل / Column | النوع / Type | الوصف / Description |
|---------------|-------------|---------------------|
| id | UUID | المعرف الفريد / Unique identifier (PK) |
| snapshot_ref | VARCHAR(255) | معرف اللقطة من API / Snapshot reference from API |
| camera_id | VARCHAR(100) | معرف الكاميرا / Camera identifier |
| captured_at | TIMESTAMP | وقت التقاط الصورة / Image capture timestamp |
| plate_text | VARCHAR(50) | رقم اللوحة / License plate number |
| plate_confidence | DECIMAL(5,4) | درجة الثقة / Confidence score |
| makes_models | JSONB | معلومات الشركة والطراز / Make/model information |
| colors | JSONB | معلومات الألوان / Color information |
| bbox | JSONB | إحداثيات الصندوق / Bounding box coordinates |
| raw_response | JSONB | الاستجابة الكاملة من API / Full API response |
| image_url | TEXT | رابط الصورة / Image URL (if applicable) |
| meta | JSONB | بيانات وصفية إضافية / Additional metadata |
| created_at | TIMESTAMP | وقت إنشاء السجل / Record creation time |

### الفهارس / Indexes

- فهرس على `plate_text` / Index on `plate_text`
- فهرس على `created_at` / Index on `created_at`
- فهرس على `captured_at` / Index on `captured_at`
- فهرس على `camera_id` / Index on `camera_id`
- فهرس GIN على `makes_models` / GIN index on `makes_models`
- فهرس GIN على `colors` / GIN index on `colors`
- فهرس GIN على `raw_response` / GIN index on `raw_response`

---

## 🔍 أمثلة على الاستعلامات / Query Examples

```sql
-- الحصول على جميع اللقطات للوحة معينة / Get all snapshots for a specific plate
SELECT * FROM vehicle_snapshots 
WHERE plate_text = 'ABC123' 
ORDER BY created_at DESC;

-- الحصول على جميع سيارات تويوتا / Get all Toyota vehicles
SELECT * FROM vehicle_snapshots 
WHERE makes_models @> '[{"make": "Toyota"}]';

-- الحصول على اللقطات من كاميرا معينة / Get snapshots from specific camera
SELECT * FROM vehicle_snapshots 
WHERE camera_id = 'camera_001' 
ORDER BY captured_at DESC;

-- الحصول على اللوحات بثقة عالية / Get high-confidence plates
SELECT plate_text, plate_confidence, captured_at 
FROM vehicle_snapshots 
WHERE plate_confidence > 0.90 
ORDER BY plate_confidence DESC;
```

---

## ⚠️ ملاحظات أمنية مهمة / Important Security Notes

1. **لا تشارك مفاتيح API** / **Never share API keys**
   - لا تضف ملف `.env` إلى Git / Never commit `.env` to Git
   - استخدم ملف `.env.example` فقط كمثال / Use `.env.example` as template only

2. **بيانات الاعتماد** / **Credentials**
   - احتفظ بكلمات المرور آمنة / Keep passwords secure
   - استخدم بيانات مختلفة للتطوير والإنتاج / Use different credentials for dev/prod

3. **حدود الاستخدام** / **Rate Limits**
   - احترم حدود Plate Recognizer API / Respect Plate Recognizer API limits
   - استخدم `REQUEST_DELAY` لتجنب تجاوز الحدود / Use `REQUEST_DELAY` to avoid rate limiting

---

## 🆘 استكشاف الأخطاء / Troubleshooting

### خطأ في الاتصال بقاعدة البيانات / Database Connection Error

```bash
# تحقق من تشغيل PostgreSQL / Check if PostgreSQL is running
pg_isready

# تحقق من رابط قاعدة البيانات في .env / Verify DATABASE_URL in .env
```

### خطأ في مفتاح API / API Key Error

```bash
# تحقق من صحة PLATE_API_KEY في .env / Verify PLATE_API_KEY in .env
# احصل على مفتاح جديد من / Get new key from: https://app.platerecognizer.com/
```

### خطأ في Docker / Docker Error

```bash
# إعادة بناء الحاويات / Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📄 الترخيص / License

هذا المشروع مرخص بموجب MIT License.

This project is licensed under the MIT License.

---

## 📞 الدعم / Support

للأسئلة والدعم، يرجى فتح issue في GitHub.

For questions and support, please open an issue on GitHub.

---

## 🔗 روابط مفيدة / Useful Links

- [Plate Recognizer Documentation](https://docs.platerecognizer.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
