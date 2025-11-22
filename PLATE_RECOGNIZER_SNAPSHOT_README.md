<<<<<<< HEAD
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
=======
# Plate Recognizer Snapshot Integration with PostgreSQL

This feature enables ingestion of vehicle images using the [Plate Recognizer Snapshot API](https://platerecognizer.com/) and stores the recognition results along with image metadata in PostgreSQL.

## Features

- **Flexible Image Storage**: Choose between S3 object storage (default) or PostgreSQL bytea (for small tests)
- **Comprehensive Metadata**: Stores plate text, confidence, vehicle make/model, colors, bounding boxes
- **Deduplication**: Uses SHA-256 hashing to avoid storing duplicate images
- **Retry Logic**: Automatic retries for network errors with exponential backoff
- **Batch Processing**: Process multiple images from a text file
- **Confidence Filtering**: Filter results by confidence threshold

## Architecture

### Storage Modes

1. **S3 Mode (Default - Recommended for Production)**
   - Images are uploaded to AWS S3 or S3-compatible storage (e.g., MinIO)
   - Only metadata and S3 URL are stored in PostgreSQL
   - Efficient for large-scale deployments
   - Reduces database size and improves performance

2. **DB Mode (For Small Tests Only)**
   - Images are stored as bytea in PostgreSQL
   - Useful for small-scale testing or when S3 is not available
   - ⚠️ **Warning**: Not recommended for production due to database bloat

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ with uuid-ossp extension
- Plate Recognizer API account and API key
- (Optional) AWS S3 bucket or MinIO for image storage

## Setup Instructions

### 1. Database Setup

Create the PostgreSQL database and run the schema:

```bash
# Connect to PostgreSQL
psql -U your_user -d your_database

# Run the schema
\i db_schema.sql
```

Or using Docker Compose (see below).

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```bash
# Required for all modes
PLATE_API_KEY=your_plate_recognizer_api_key_here
SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/
DATABASE_URL=postgresql://user:pass@localhost:5432/platenet

# Storage mode: "s3" (default) or "db"
STORE_IMAGES=s3

# Required when STORE_IMAGES=s3
S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Prepare Image List

Create a file `images.txt` with one image path or URL per line:

```
/path/to/image1.jpg
/path/to/image2.jpg
https://example.com/vehicle.jpg
https://example.com/another-vehicle.png
```

### 5. Run the Script

Basic usage:

```bash
python snapshot_to_postgres.py --images images.txt
```

With options:

```bash
python snapshot_to_postgres.py \
  --images images.txt \
  --delay 1.0 \
  --confidence-threshold 0.7
```

#### Command Line Options

- `--images`: Path to text file containing image paths/URLs (required)
- `--delay`: Delay between API requests in seconds (default: 0.5)
- `--confidence-threshold`: Minimum confidence to store results (default: 0.0)

## Docker Deployment

### Using Docker Compose

1. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Create images.txt** with your image paths/URLs

3. **Run with Docker Compose**:
   ```bash
   # For S3 storage mode
   docker-compose -f docker-compose.snapshot.yml up

   # For DB storage mode (testing only)
   STORE_IMAGES=db docker-compose -f docker-compose.snapshot.yml up
   ```

The database will be automatically initialized with the schema.

### Building the Docker Image Separately

```bash
docker build -f Dockerfile.snapshot -t plate-snapshot:latest .
```

## Usage Examples

### Example 1: Process Images with S3 Storage

```bash
# .env configuration
STORE_IMAGES=s3
S3_BUCKET=my-vehicle-images
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# Run script
python snapshot_to_postgres.py --images images.txt --delay 1.0
```

### Example 2: Process Images with DB Storage

```bash
# .env configuration
STORE_IMAGES=db

# Run script
python snapshot_to_postgres.py --images images.txt --delay 0.5
```

### Example 3: Filter by Confidence

Only store results with confidence >= 0.8:

```bash
python snapshot_to_postgres.py \
  --images images.txt \
  --confidence-threshold 0.8
```

## Retrieving Stored Data

### Query Metadata

```sql
-- Get all recognized plates
SELECT 
  plate_text,
  plate_confidence,
  captured_at,
  image_url,
  image_sha256
FROM vehicle_snapshots
ORDER BY created_at DESC;

-- Search by plate text
SELECT * FROM vehicle_snapshots
WHERE plate_text ILIKE '%ABC123%';

-- Get high confidence results
SELECT * FROM vehicle_snapshots
WHERE plate_confidence > 0.9;
```

### Retrieve Images

#### From S3

Images are stored at the URL in the `image_url` column:

```sql
SELECT image_url FROM vehicle_snapshots WHERE plate_text = 'ABC123';
```

Access the URL directly in your browser or application.

#### From Database (bytea)

```sql
-- Get image bytes
SELECT image_data, image_mime FROM vehicle_snapshots WHERE plate_text = 'ABC123';
```

In Python:

```python
import psycopg2
from io import BytesIO
from PIL import Image

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute("SELECT image_data, image_mime FROM vehicle_snapshots WHERE plate_text = %s", ('ABC123',))
row = cur.fetchone()

if row and row[0]:
    image_bytes = bytes(row[0])
    image = Image.open(BytesIO(image_bytes))
    image.show()
```

## Using MinIO as S3 Alternative

For local development, you can use MinIO as an S3-compatible storage:

1. **Install MinIO**:
   ```bash
   docker run -p 9000:9000 -p 9001:9001 \
     -e MINIO_ROOT_USER=minioadmin \
     -e MINIO_ROOT_PASSWORD=minioadmin \
     minio/minio server /data --console-address ":9001"
   ```

2. **Create bucket**: Visit http://localhost:9001 and create a bucket

3. **Configure .env for MinIO**:
   ```bash
   STORE_IMAGES=s3
   S3_BUCKET=vehicle-images
   AWS_ACCESS_KEY_ID=minioadmin
   AWS_SECRET_ACCESS_KEY=minioadmin
   # For MinIO, you need to configure the endpoint
   # (requires modifying snapshot_to_postgres.py to add endpoint_url parameter)
   ```

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit credentials** to version control
   - Add `.env` to `.gitignore`
   - Use `.env.example` as a template

2. **Use GitHub Secrets** for CI/CD:
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Add secrets: `PLATE_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

3. **Rotate credentials regularly**:
   - Change API keys every 90 days
   - Use temporary credentials when possible

4. **Use IAM roles** in production:
   - Instead of access keys, use EC2 instance roles or ECS task roles
   - Grant minimum required permissions

5. **S3 bucket security**:
   - Enable encryption at rest
   - Use bucket policies to restrict access
   - Enable versioning for data protection
   - Consider private buckets with presigned URLs

6. **Database security**:
   - Use SSL/TLS for database connections
   - Restrict network access with security groups
   - Use strong passwords
   - Regularly backup your database

## Privacy and Storage Warnings

### ⚠️ Privacy Considerations

- **Personal Data**: Vehicle images and license plates may constitute personal data under GDPR, CCPA, and similar regulations
- **Data Minimization**: Only store necessary data; consider retention policies
- **Access Control**: Implement proper access controls to protect sensitive data
- **Consent**: Ensure you have legal basis for collecting and storing this data
- **Data Processing Agreement**: Required if using third-party services (Plate Recognizer, AWS)

### ⚠️ Storage Size Warnings

- **S3 Mode**: Each image is typically 100KB-5MB
  - 10,000 images ≈ 1-50 GB
  - S3 storage cost: ~$0.023/GB/month
  
- **DB Mode**: Images stored as bytea significantly increase database size
  - 10,000 images ≈ 1-50 GB added to database
  - **Not recommended for production**
  - Can impact database performance
  - Increases backup time and storage costs

### Recommendations

1. Use **S3 mode** for production
2. Implement **data retention policies** (e.g., delete images after 90 days)
3. Use **lifecycle policies** on S3 to automatically transition old data to cheaper storage
4. Monitor storage usage and costs regularly
5. Consider **image compression** before storage if quality allows

## Troubleshooting

### Common Issues

**Error: Missing required environment variables**
- Ensure `.env` file exists and contains all required variables
- Check that variable names are correct (case-sensitive)

**Error: boto3 not installed**
- Run: `pip install boto3`
- Or reinstall requirements: `pip install -r requirements.txt`

**Error: S3 upload failed**
- Verify AWS credentials are correct
- Check bucket name and region
- Ensure bucket exists and you have write permissions
- Check network connectivity

**Error: Database connection failed**
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
- Check if PostgreSQL is running
- Verify network connectivity and firewall rules

**Low recognition accuracy**
- Use higher quality images
- Ensure images are well-lit
- Check that plates are clearly visible
- Consider adjusting confidence threshold

## Database Schema

```sql
CREATE TABLE vehicle_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_ref text,
  camera_id text,
  captured_at timestamptz,
  plate_text text,
  plate_confidence numeric,
  makes_models jsonb,
  colors jsonb,
  bbox jsonb,
  raw_response jsonb,
  image_url text,
  image_data bytea,           -- NULL when STORE_IMAGES=s3
  image_mime text,
  image_size integer,
  image_sha256 text,          -- For deduplication
  meta jsonb,
  created_at timestamptz DEFAULT now()
);
```

Indexes:
- `plate_text` - Fast plate lookups
- `created_at` - Time-based queries
- `makes_models` (GIN) - JSONB searches
- `image_sha256` - Deduplication checks

## API Rate Limits

Plate Recognizer API has rate limits depending on your subscription:
- Free tier: 2,500 lookups/month
- Paid tiers: Higher limits

Use the `--delay` parameter to control request rate and avoid hitting limits.

## License

See [LICENSE](LICENSE) file for details.

## Support

For issues with:
- **This integration**: Open an issue in this repository
- **Plate Recognizer API**: Visit [Plate Recognizer Support](https://platerecognizer.com/help/)
- **AWS S3**: Consult [AWS Documentation](https://docs.aws.amazon.com/s3/)

## References

- [Plate Recognizer Documentation](https://docs.platerecognizer.com/)
- [Plate Recognizer Snapshot API](https://guides.platerecognizer.com/docs/snapshot/api-reference/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
>>>>>>> origin/main
