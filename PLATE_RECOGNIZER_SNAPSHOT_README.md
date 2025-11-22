# Plate Recognizer Snapshot Integration
# دليل تكامل Plate Recognizer Snapshot

## Overview / نظرة عامة

This system integrates Plate Recognizer Snapshot API with PostgreSQL database to automatically process vehicle images, extract license plate information, and store the results with optional S3 image storage.

يتكامل هذا النظام مع Plate Recognizer Snapshot API وقاعدة بيانات PostgreSQL لمعالجة صور المركبات تلقائياً واستخراج معلومات اللوحات وتخزين النتائج مع خيار تخزين الصور في S3.

## Features / المميزات

- ✅ Automatic license plate recognition using Plate Recognizer API
- ✅ Support for both URL-based and local file images
- ✅ S3 storage for images (default, recommended)
- ✅ Optional database storage for small-scale testing
- ✅ SHA256 hash calculation to prevent duplicate images
- ✅ MIME type detection and image size tracking
- ✅ Confidence threshold filtering
- ✅ Automatic retry on network failures
- ✅ Progress tracking with tqdm
- ✅ Comprehensive metadata storage (makes, models, colors, bbox)

## Setup Instructions / تعليمات الإعداد

### 1. Prerequisites / المتطلبات الأساسية

- Python 3.11 or higher
- PostgreSQL 15 or higher
- AWS S3 account (for production use)
- Plate Recognizer API account

### 2. Install Dependencies / تثبيت المتطلبات

```bash
pip install -r requirements.txt
```

### 3. Database Setup / إعداد قاعدة البيانات

Create the database schema:

```bash
psql $DATABASE_URL -f db_schema.sql
```

Or using Docker Compose:

```bash
docker-compose -f docker-compose.snapshot.yml up -d db
```

### 4. Environment Configuration / تكوين البيئة

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```bash
# Plate Recognizer API
PLATE_API_KEY=your_api_key_here
SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/platenet

# Image Storage (choose one)
STORE_IMAGES=s3  # or "db" for testing

# S3 Configuration (required if STORE_IMAGES=s3)
S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## Usage / الاستخدام

### Basic Usage / الاستخدام الأساسي

Create a text file with image paths or URLs (one per line):

```bash
# images.txt
https://example.com/vehicle1.jpg
https://example.com/vehicle2.jpg
/path/to/local/image.jpg
```

Run the script:

```bash
python snapshot_to_postgres.py --images images.txt
```

### Advanced Options / خيارات متقدمة

```bash
python snapshot_to_postgres.py \
  --images images.txt \
  --delay 1.0 \
  --confidence-threshold 0.8 \
  --retries 3
```

Parameters:
- `--images`: Text file with image paths/URLs (required)
- `--delay`: Delay between requests in seconds (default: 0.5)
- `--confidence-threshold`: Minimum plate confidence (0.0-1.0, default: 0.0)
- `--retries`: Number of retry attempts on failure (default: 3)

### Docker Usage / استخدام Docker

Using Docker Compose:

```bash
# Start database
docker-compose -f docker-compose.snapshot.yml up -d db

# Run the application
docker-compose -f docker-compose.snapshot.yml run app \
  python snapshot_to_postgres.py --images images.txt --delay 1.0
```

## Storage Modes / أوضاع التخزين

### S3 Storage (Recommended) / تخزين S3 (موصى به)

Default mode. Images are uploaded to S3 and only metadata is stored in the database.

**Advantages:**
- ✅ Scalable for large datasets
- ✅ Cost-effective storage
- ✅ Faster database operations
- ✅ Easier backups

**Configuration:**
```bash
STORE_IMAGES=s3
S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### Database Storage (Testing Only) / تخزين قاعدة البيانات (للاختبار فقط)

Images are stored as bytea in PostgreSQL. Only suitable for small-scale testing.

**Configuration:**
```bash
STORE_IMAGES=db
```

**⚠️ Warning:** Not recommended for production use. Database size will grow rapidly.

## Retrieving Images / استرجاع الصور

### From S3

Images stored in S3 can be accessed directly via the `image_url` field:

```sql
SELECT id, plate_text, image_url FROM vehicle_snapshots 
WHERE plate_text = 'ABC123';
```

### From Database

For images stored in the database:

```sql
-- Get image data
SELECT id, plate_text, image_data, image_mime 
FROM vehicle_snapshots 
WHERE plate_text = 'ABC123';
```

Python example to retrieve and save:

```python
import psycopg2
from io import BytesIO

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
cur.execute("SELECT image_data, image_mime FROM vehicle_snapshots WHERE id = %s", (image_id,))
image_data, mime_type = cur.fetchone()

# Save to file
ext = mime_type.split('/')[-1]
with open(f'output.{ext}', 'wb') as f:
    f.write(image_data)
```

## Database Schema / مخطط قاعدة البيانات

```sql
CREATE TABLE vehicle_snapshots (
  id uuid PRIMARY KEY,
  snapshot_ref text,
  camera_id text,
  captured_at timestamptz,
  plate_text text,              -- License plate number
  plate_confidence numeric,     -- Confidence score (0.0-1.0)
  makes_models jsonb,           -- Vehicle make/model predictions
  colors jsonb,                 -- Vehicle color predictions
  bbox jsonb,                   -- Bounding box coordinates
  raw_response jsonb,           -- Full API response
  image_url text,               -- S3 URL (if STORE_IMAGES=s3)
  image_data bytea,             -- Image bytes (if STORE_IMAGES=db)
  image_mime text,              -- MIME type (e.g., image/jpeg)
  image_size integer,           -- Image size in bytes
  image_sha256 text,            -- SHA256 hash for deduplication
  meta jsonb,                   -- Additional metadata
  created_at timestamptz DEFAULT now()
);
```

## Example Queries / أمثلة الاستعلامات

```sql
-- Find all snapshots for a specific plate
SELECT * FROM vehicle_snapshots 
WHERE plate_text = 'ABC123'
ORDER BY created_at DESC;

-- Get snapshots with high confidence
SELECT plate_text, plate_confidence, image_url 
FROM vehicle_snapshots 
WHERE plate_confidence > 0.9;

-- Search by vehicle make/model
SELECT * FROM vehicle_snapshots 
WHERE makes_models @> '{"make": "Toyota"}';

-- Check storage statistics
SELECT 
  COUNT(*) as total_snapshots,
  pg_size_pretty(SUM(image_size)) as total_image_size,
  COUNT(CASE WHEN image_data IS NOT NULL THEN 1 END) as stored_in_db,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as stored_in_s3
FROM vehicle_snapshots;

-- Find duplicate images by hash
SELECT image_sha256, COUNT(*) as duplicates
FROM vehicle_snapshots
GROUP BY image_sha256
HAVING COUNT(*) > 1;
```

## Privacy and Security / الخصوصية والأمان

### ⚠️ Important Privacy Considerations

1. **Data Protection**: Vehicle images and license plate data are sensitive personal information
   - Comply with local data protection laws (GDPR, CCPA, etc.)
   - Implement proper access controls
   - Consider data retention policies

2. **AWS Credentials**: Never commit credentials to version control
   - Use environment variables or AWS IAM roles
   - Rotate credentials regularly
   - Use minimal required permissions

3. **API Keys**: Keep Plate Recognizer API keys secure
   - Use GitHub Secrets for CI/CD
   - Rotate keys periodically
   - Monitor API usage

4. **Database Access**: Secure your PostgreSQL database
   - Use strong passwords
   - Enable SSL connections
   - Restrict network access

5. **S3 Bucket Security**:
   - Keep buckets private (ACL='private' is default)
   - Use presigned URLs for temporary access (S3_USE_PRESIGNED_URLS=true)
   - Use bucket policies to restrict access
   - Enable encryption at rest
   - Enable versioning for backup
   - Never use public-read ACL for sensitive vehicle data

### Recommended IAM Policy for S3

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/vehicle-snapshots/*"
    }
  ]
}
```

## Troubleshooting / استكشاف الأخطاء

### Common Issues

1. **S3 Upload Fails**
   - Verify AWS credentials are correct
   - Check bucket name and region
   - Ensure IAM permissions are set correctly
   - Check network connectivity

2. **Database Connection Error**
   - Verify DATABASE_URL format
   - Check PostgreSQL is running
   - Ensure database exists
   - Test connection: `psql $DATABASE_URL`

3. **API Rate Limiting**
   - Increase `--delay` parameter
   - Check Plate Recognizer account limits
   - Implement exponential backoff

4. **Image Not Found**
   - Verify image URLs are accessible
   - Check local file paths
   - Ensure proper permissions

## Performance Tips / نصائح الأداء

1. **Batch Processing**: Process images in batches during off-peak hours
2. **Delay Configuration**: Adjust delay based on API rate limits
3. **Database Indexes**: Ensure indexes are created on frequently queried fields
4. **S3 Transfer Acceleration**: Enable for faster uploads from distant regions
5. **Connection Pooling**: Use pgbouncer for high-throughput scenarios

## License / الترخيص

See LICENSE file in the repository root.

## Support / الدعم

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/Ali5829511/N-M/issues)
- Plate Recognizer Docs: https://guides.platerecognizer.com/

## Changelog / سجل التغييرات

### Version 1.0.0
- Initial release
- S3 and database storage support
- Confidence threshold filtering
- SHA256 deduplication
- Retry logic
