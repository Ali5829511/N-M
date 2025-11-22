# Plate Recognizer Snapshot Integration
# دمج نظام التعرف على اللوحات (Snapshot)

This module integrates Plate Recognizer Snapshot API with PostgreSQL to capture and store vehicle data.

هذه الوحدة تدمج API للتعرف على اللوحات مع PostgreSQL لالتقاط وتخزين بيانات المركبات.

## Features / المميزات

- ✅ Automatic plate recognition using Plate Recognizer Snapshot API
  - التعرف التلقائي على اللوحات باستخدام API
- ✅ Support for local image files and image URLs
  - دعم الملفات المحلية وروابط الصور
- ✅ PostgreSQL storage with JSONB for flexible data structure
  - تخزين في PostgreSQL مع JSONB لهيكل بيانات مرن
- ✅ Error handling and rate limiting
  - معالجة الأخطاء والتحكم في معدل الطلبات
- ✅ Docker support for easy deployment
  - دعم Docker للنشر السهل
- ✅ Progress tracking with tqdm
  - تتبع التقدم مع tqdm

## Prerequisites / المتطلبات الأساسية

1. **Plate Recognizer API Key** / مفتاح API
   - Sign up at: https://app.platerecognizer.com/
   - Get your API key from the dashboard
   - التسجيل في الموقع والحصول على مفتاح API

2. **PostgreSQL Database** / قاعدة بيانات PostgreSQL
   - PostgreSQL 12+ (recommended PostgreSQL 15)
   - قاعدة بيانات PostgreSQL 12 أو أحدث

3. **Python 3.11+** (for local development)
   - بايثون 3.11 أو أحدث (للتطوير المحلي)

## Quick Start / البدء السريع

### Option 1: Using Docker Compose (Recommended) / استخدام Docker Compose (موصى به)

1. **Clone the repository** / استنسخ المستودع
   ```bash
   git clone <repository-url>
   cd N-M
   ```

2. **Create `.env` file** / أنشئ ملف `.env`
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` and add your credentials** / عدّل `.env` وأضف بياناتك
   ```bash
   nano .env
   ```
   
   Update the following values:
   ```
   PLATE_API_KEY=your_actual_api_key_here
   SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/
   DATABASE_URL=postgresql://postgres:postgres_password_change_me@db:5432/vehicle_snapshots
   ```

4. **Create `images.txt` file** / أنشئ ملف `images.txt`
   ```bash
   nano images.txt
   ```
   
   Add image paths or URLs (one per line):
   ```
   /app/input_images/car1.jpg
   /app/input_images/car2.jpg
   https://example.com/car3.jpg
   ```

5. **Start services with Docker Compose** / شغّل الخدمات باستخدام Docker Compose
   ```bash
   docker-compose up -d
   ```

6. **View logs** / عرض السجلات
   ```bash
   docker-compose logs -f app
   ```

### Option 2: Local Development / التطوير المحلي

1. **Create and activate virtual environment** / أنشئ وفعّل البيئة الافتراضية
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies** / ثبّت المتطلبات
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database** / أعد قاعدة البيانات
   ```bash
   # Create database
   createdb vehicle_snapshots
   
   # Run schema
   psql -d vehicle_snapshots -f db_schema.sql
   ```

4. **Create `.env` file** / أنشئ ملف `.env`
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Update with your credentials:
   ```
   PLATE_API_KEY=your_actual_api_key_here
   SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/
   DATABASE_URL=postgresql://user:password@localhost:5432/vehicle_snapshots
   REQUEST_DELAY=1.0
   ```

5. **Create `images.txt`** / أنشئ ملف `images.txt`
   ```bash
   nano images.txt
   ```
   
   Add image paths or URLs:
   ```
   /path/to/image1.jpg
   /path/to/image2.jpg
   https://example.com/image3.jpg
   ```

6. **Run the script** / شغّل السكربت
   ```bash
   python snapshot_to_postgres.py images.txt
   ```

## Database Schema / مخطط قاعدة البيانات

The `vehicle_snapshots` table stores all captured vehicle data:

جدول `vehicle_snapshots` يخزن جميع بيانات المركبات المُلتقطة:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `snapshot_ref` | VARCHAR(255) | Custom reference ID |
| `camera_id` | VARCHAR(100) | Camera identifier |
| `captured_at` | TIMESTAMP | Image capture timestamp |
| `plate_text` | VARCHAR(50) | Detected plate number |
| `plate_confidence` | DECIMAL(5,4) | Detection confidence (0.0-1.0) |
| `makes_models` | JSONB | Vehicle makes/models |
| `colors` | JSONB | Vehicle colors |
| `bbox` | JSONB | Bounding box coordinates |
| `raw_response` | JSONB | Full API response |
| `image_url` | TEXT | Original image URL |
| `meta` | JSONB | Additional metadata |
| `created_at` | TIMESTAMP | Record creation timestamp |

### Example Queries / أمثلة استعلامات

```sql
-- Find all snapshots for a specific plate
-- البحث عن جميع اللقطات للوحة معينة
SELECT * FROM vehicle_snapshots WHERE plate_text = 'ABC123';

-- Find high-confidence detections
-- البحث عن الكشوفات عالية الثقة
SELECT * FROM vehicle_snapshots WHERE plate_confidence > 0.90;

-- Find snapshots from the last 24 hours
-- البحث عن اللقطات من آخر 24 ساعة
SELECT * FROM vehicle_snapshots 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Search for specific vehicle type
-- البحث عن نوع مركبة معين
SELECT * FROM vehicle_snapshots 
WHERE makes_models @> '[{"type": "sedan"}]';

-- Count snapshots by camera
-- عد اللقطات حسب الكاميرا
SELECT camera_id, COUNT(*) 
FROM vehicle_snapshots 
GROUP BY camera_id;
```

## Configuration / الإعدادات

### Environment Variables / متغيرات البيئة

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PLATE_API_KEY` | ✅ Yes | - | Your Plate Recognizer API key |
| `SNAPSHOT_API_URL` | No | `https://api.platerecognizer.com/v1/plate-reader/` | Snapshot API endpoint |
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `REQUEST_DELAY` | No | `1.0` | Delay between API requests (seconds) |

### Input File Format / تنسيق ملف الإدخال

The `images.txt` file should contain one image path or URL per line:

ملف `images.txt` يجب أن يحتوي على مسار صورة أو رابط واحد في كل سطر:

```
# Lines starting with # are ignored
# السطور التي تبدأ بـ # يتم تجاهلها

# Local file paths
/path/to/image1.jpg
/path/to/image2.png

# Image URLs
https://example.com/car1.jpg
https://example.com/car2.jpg

# Empty lines are ignored
```

## Docker Commands / أوامر Docker

### Start services / تشغيل الخدمات
```bash
docker-compose up -d
```

### View logs / عرض السجلات
```bash
docker-compose logs -f app
```

### Stop services / إيقاف الخدمات
```bash
docker-compose down
```

### Rebuild after code changes / إعادة البناء بعد تغيير الكود
```bash
docker-compose up -d --build
```

### Access PostgreSQL / الوصول إلى PostgreSQL
```bash
docker-compose exec db psql -U postgres -d vehicle_snapshots
```

## Troubleshooting / حل المشكلات

### API Key Not Set / مفتاح API غير محدد
```
❌ Error: PLATE_API_KEY environment variable is not set
```
**Solution:** Add your API key to the `.env` file

**الحل:** أضف مفتاح API إلى ملف `.env`

### Database Connection Failed / فشل الاتصال بقاعدة البيانات
```
❌ Database error: could not connect to server
```
**Solution:** 
- Check that PostgreSQL is running
- Verify DATABASE_URL in `.env`
- For Docker: ensure `db` service is healthy

**الحل:**
- تأكد من تشغيل PostgreSQL
- تحقق من DATABASE_URL في `.env`
- لـ Docker: تأكد من صحة خدمة `db`

### No Plates Detected / لم يتم اكتشاف لوحات
```
⚠️  No plates detected in: image.jpg
```
**Solution:**
- Check image quality and clarity
- Ensure plates are visible in the image
- Verify API key has sufficient credits

**الحل:**
- تحقق من جودة ووضوح الصورة
- تأكد من ظهور اللوحات في الصورة
- تحقق من رصيد API

### Rate Limiting / تجاوز الحد الأقصى للطلبات
**Solution:** Increase `REQUEST_DELAY` in `.env`

**الحل:** زد قيمة `REQUEST_DELAY` في `.env`

## Security Notes / ملاحظات الأمان

⚠️ **IMPORTANT / مهم:**

1. **Never commit `.env` file** / لا تضف ملف `.env` إلى Git
   - The `.env` file is already in `.gitignore`
   - ملف `.env` موجود بالفعل في `.gitignore`

2. **Keep API keys secure** / احفظ مفاتيح API بشكل آمن
   - Don't share API keys publicly
   - لا تشارك مفاتيح API بشكل علني

3. **Use strong database passwords** / استخدم كلمات مرور قوية
   - Change default PostgreSQL password
   - غيّر كلمة مرور PostgreSQL الافتراضية

4. **Rotate credentials regularly** / غيّر بيانات الاعتماد بانتظام

## API Credits / رصيد API

Plate Recognizer API has usage limits:
- Free tier: Limited requests per month
- Paid plans: Higher limits

API للتعرف على اللوحات له حدود استخدام:
- الخطة المجانية: عدد محدود من الطلبات شهرياً
- الخطط المدفوعة: حدود أعلى

Check your usage at: https://app.platerecognizer.com/

## Support / الدعم

For issues or questions:
- Plate Recognizer: https://platerecognizer.com/help/
- Project Issues: [Create an issue](../../issues)

للمساعدة أو الأسئلة:
- Plate Recognizer: https://platerecognizer.com/help/
- مشاكل المشروع: [أنشئ issue](../../issues)

## License / الرخصة

See [LICENSE](LICENSE) file for details.

راجع ملف [LICENSE](LICENSE) للتفاصيل.
