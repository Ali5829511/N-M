# Plate Recognizer Snapshot to PostgreSQL

## نظام جمع بيانات السيارات من Plate Recognizer Snapshot API

This system collects vehicle data from Plate Recognizer Snapshot API and stores it in PostgreSQL with full JSONB support for flexible querying.

هذا النظام يجمع بيانات المركبات من Plate Recognizer Snapshot API ويخزنها في PostgreSQL مع دعم كامل لـ JSONB للاستعلام المرن.

---

## Features / المميزات

- ✅ **Automatic Plate Recognition** - Detects license plates from images / تعرف تلقائي على اللوحات من الصور
- ✅ **Vehicle Information** - Extracts make, model, and color / استخراج الماركة والموديل واللون
- ✅ **PostgreSQL Storage** - Stores data in JSONB format / تخزين البيانات بصيغة JSONB
- ✅ **Flexible Queries** - Query by plate, make, model, or color / استعلام حسب اللوحة أو الماركة أو الموديل أو اللون
- ✅ **Local & Remote Images** - Supports both local files and URLs / يدعم الملفات المحلية والروابط
- ✅ **Docker Support** - Run locally or in Docker / التشغيل محلياً أو داخل Docker
- ✅ **Error Handling** - Automatic retries and logging / معالجة الأخطاء وإعادة المحاولات التلقائية

---

## Prerequisites / المتطلبات الأساسية

1. **Python 3.11+** installed / مثبت
2. **PostgreSQL 15+** database / قاعدة بيانات
3. **Plate Recognizer API Key** - Get from [platerecognizer.com](https://app.platerecognizer.com/accounts/plan/)
4. **Docker** (optional) - For containerized deployment / للنشر باستخدام الحاويات

---

## Quick Start / البداية السريعة

### 1. Database Setup / إعداد قاعدة البيانات

Create a PostgreSQL database:

```bash
# Create database
createdb vehicle_snapshots

# Or using psql
psql -U postgres
CREATE DATABASE vehicle_snapshots;
\q
```

Run the schema file:

```bash
psql -U postgres -d vehicle_snapshots -f snapshot_db_schema.sql
```

### 2. Environment Configuration / إعداد البيئة

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Plate Recognizer API Key (REQUIRED)
PLATE_API_KEY=your_actual_api_key_here

# Database URL (REQUIRED)
DATABASE_URL=postgresql://username:password@localhost:5432/vehicle_snapshots

# Optional settings
SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/
REQUEST_DELAY=1.0
MAX_RETRIES=3
```

### 3. Install Dependencies / تثبيت المتطلبات

```bash
pip install -r snapshot_requirements.txt
```

### 4. Prepare Images File / إعداد ملف الصور

Create a text file `images.txt` with image paths or URLs (one per line):

```text
# Local files
/path/to/image1.jpg
/path/to/image2.png

# Or URLs
https://example.com/car-image1.jpg
https://example.com/car-image2.jpg
```

### 5. Run the Script / تشغيل السكربت

```bash
python snapshot_to_postgres.py images.txt
```

The script will:
- ✅ Read images from the file
- ✅ Send each image to Plate Recognizer API
- ✅ Extract vehicle data (plate, make, model, color)
- ✅ Store complete response in PostgreSQL
- ✅ Display progress and summary

---

## Docker Deployment / النشر باستخدام Docker

### Using Docker Compose (Recommended)

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your API key:**
   ```env
   PLATE_API_KEY=your_actual_api_key_here
   ```

3. **Create `images.txt`** with your image paths/URLs

4. **Start services:**
   ```bash
   docker-compose up -d
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

6. **Stop services:**
   ```bash
   docker-compose down
   ```

### Using Docker Only

1. **Build image:**
   ```bash
   docker build -t snapshot-collector .
   ```

2. **Run container:**
   ```bash
   docker run --rm \
     -e PLATE_API_KEY=your_api_key \
     -e DATABASE_URL=postgresql://user:pass@host:5432/db \
     -v $(pwd)/images.txt:/app/images.txt \
     snapshot-collector
   ```

---

## Database Schema / مخطط قاعدة البيانات

### Table: `vehicle_snapshots`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier / المعرف الفريد |
| `snapshot_ref` | VARCHAR | Image path or URL / مسار أو رابط الصورة |
| `camera_id` | VARCHAR | Camera identifier / معرف الكاميرا |
| `captured_at` | TIMESTAMP | Capture timestamp / وقت الالتقاط |
| `plate_text` | VARCHAR | Detected plate / اللوحة المكتشفة |
| `plate_confidence` | DECIMAL | Detection confidence / درجة الثقة |
| `makes_models` | JSONB | Vehicle makes/models / الماركات والموديلات |
| `colors` | JSONB | Vehicle colors / الألوان |
| `bbox` | JSONB | Bounding box / المربع المحيط |
| `raw_response` | JSONB | Full API response / الاستجابة الكاملة |
| `image_url` | VARCHAR | Image URL / رابط الصورة |
| `meta` | JSONB | Additional metadata / بيانات إضافية |
| `created_at` | TIMESTAMP | Record creation time / وقت إنشاء السجل |

---

## Example Queries / أمثلة على الاستعلامات

### Search by Plate Number / البحث برقم اللوحة

```sql
SELECT * FROM vehicle_snapshots 
WHERE plate_text = 'ABC123';
```

### Search by Vehicle Make / البحث بماركة السيارة

```sql
SELECT * FROM vehicle_snapshots 
WHERE makes_models @> '[{"make": "Toyota"}]'::jsonb;
```

### Search by Vehicle Color / البحث بلون السيارة

```sql
SELECT * FROM vehicle_snapshots 
WHERE colors @> '[{"color": "white"}]'::jsonb;
```

### Get Recent Snapshots / الحصول على اللقطات الأخيرة

```sql
SELECT plate_text, captured_at, makes_models, colors
FROM vehicle_snapshots 
ORDER BY created_at DESC 
LIMIT 10;
```

### Count Snapshots per Plate / عد اللقطات لكل لوحة

```sql
SELECT plate_text, COUNT(*) as snapshot_count
FROM vehicle_snapshots
WHERE plate_text IS NOT NULL
GROUP BY plate_text
ORDER BY snapshot_count DESC;
```

---

## Configuration Options / خيارات الإعداد

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PLATE_API_KEY` | ✅ Yes | - | Plate Recognizer API key |
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection URL |
| `SNAPSHOT_API_URL` | No | `https://api.platerecognizer.com/v1/plate-reader/` | API endpoint |
| `REQUEST_DELAY` | No | `1.0` | Delay between requests (seconds) |
| `MAX_RETRIES` | No | `3` | Maximum retry attempts |

---

## Troubleshooting / استكشاف الأخطاء

### Database Connection Error

**Error:** `Database connection failed`

**Solution:**
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists

### API Key Error

**Error:** `PLATE_API_KEY not found`

**Solution:**
- Add `PLATE_API_KEY` to `.env` file
- Get API key from [platerecognizer.com](https://app.platerecognizer.com/accounts/plan/)

### Image Not Found

**Error:** `Image file not found`

**Solution:**
- Check file paths in `images.txt`
- Use absolute paths for local files
- Verify image files exist

### Rate Limit Errors

**Error:** `API error 429: Too Many Requests`

**Solution:**
- Increase `REQUEST_DELAY` in `.env`
- Check your API plan limits
- Consider upgrading your API plan

---

## API Documentation / وثائق API

- [Plate Recognizer API Docs](https://docs.platerecognizer.com/)
- [Snapshot API Reference](https://docs.platerecognizer.com/snapshot/)

---

## Security Notes / ملاحظات أمنية

⚠️ **Important:**

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Keep API keys secure** - Don't share publicly
3. **Use different keys** - Development vs. Production
4. **Rotate keys regularly** - Change API keys periodically
5. **Secure database** - Use strong passwords and SSL connections

---

## License / الترخيص

This project follows the main repository license.

---

## Support / الدعم

For issues or questions:
- Open an issue on GitHub
- Check Plate Recognizer documentation
- Review the logs in `snapshot_processor.log`

---

**Happy Vehicle Tracking! 🚗📸**
