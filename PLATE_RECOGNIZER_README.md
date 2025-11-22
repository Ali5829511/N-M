# Plate Recognizer Snapshot → PostgreSQL with S3 Storage

This script sends images/URLs to the Plate Recognizer Snapshot API and stores results in PostgreSQL with flexible image storage options (S3 or database).

## Features

- 🚀 **Vehicle Image Ingestion**: Process images from URLs or local files
- 📊 **Plate Recognition**: Extract license plate text, confidence, vehicle make/model, colors
- ☁️ **S3 Object Storage**: Store images in AWS S3 or MinIO (default, recommended)
- 💾 **Database Storage**: Optional image storage in PostgreSQL (for small tests)
- 🔒 **Image Deduplication**: SHA256 hash-based deduplication
- 🔄 **Retry Logic**: Automatic retry with exponential backoff for network errors
- 📈 **Confidence Filtering**: Filter results by minimum plate confidence threshold

## Setup

### 1. Create Database

Create a PostgreSQL database (local or cloud-based like Neon):

```bash
createdb platenet
```

### 2. Configure Environment Variables

**⚠️ IMPORTANT: Never commit real credentials to the repository!**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and set:

**Required variables:**
- `PLATE_API_KEY`: Get from https://app.platerecognizer.com/
- `SNAPSHOT_API_URL`: https://api.platerecognizer.com/v1/plate-reader/
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/dbname`)

**For S3 storage (default, recommended for production):**
- `STORE_IMAGES=s3`
- `S3_BUCKET`: Your S3 bucket name
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region (default: us-east-1)

**For database storage (small tests only):**
- `STORE_IMAGES=db`

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create Database Schema

Run the SQL script to create tables and indexes:

```bash
psql -d platenet -f db_schema.sql
```

Or if using DATABASE_URL:
```bash
psql $DATABASE_URL -f db_schema.sql
```

### 5. Prepare Images File

Create a text file `images.txt` with one image path/URL per line:

```
https://example.com/vehicle1.jpg
https://example.com/vehicle2.jpg
/path/to/local/vehicle3.jpg
```

### 6. Run the Script

Execute the script:

```bash
python snapshot_to_postgres.py --images images.txt
```

**With custom options:**

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

**AWS S3 Setup:**
1. Create an S3 bucket in AWS Console
2. Set bucket permissions (consider using presigned URLs for privacy)
3. Create IAM user with permissions:
   - `s3:PutObject`
   - `s3:GetObject`

**MinIO Setup (S3-compatible, self-hosted):**
1. Install MinIO: https://min.io/docs/minio/linux/index.html
2. Create bucket: `mc mb myminio/vehicle-images`
3. Use same environment variables as AWS S3
4. Optionally set `AWS_ENDPOINT_URL` for custom endpoint

### Option 2: Database Storage (Small Tests Only)

**Use only for:**
- Small test datasets (<100 images)
- Quick prototyping
- Offline systems

**⚠️ WARNING:** Storing images in database can cause:
- Large database size
- Slower queries
- Backup/restore issues
- Higher costs

**Configuration:**
```bash
STORE_IMAGES=db
```

## Retrieving Images

### From S3

```python
import boto3

s3 = boto3.client('s3')
obj = s3.get_object(Bucket='your-bucket', Key='vehicle-snapshots/ab/abc123....jpg')
image_bytes = obj['Body'].read()

# Or use the stored image_url (presigned URL)
import requests
response = requests.get(image_url)
image_bytes = response.content
```

### From Database

```python
import psycopg2

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
cur.execute("SELECT image_data, image_mime FROM vehicle_snapshots WHERE id = %s", (record_id,))
image_bytes, mime_type = cur.fetchone()
```

## Privacy and Security Warnings

⚠️ **IMPORTANT CONSIDERATIONS:**

1. **Data Privacy:** License plate images may contain personal information
   - Ensure compliance with GDPR, CCPA, and local privacy laws
   - Implement data retention policies
   - Consider anonymization for non-essential use cases

2. **Access Control:**
   - Use private S3 buckets with presigned URLs
   - Implement IAM policies with least privilege
   - Rotate API keys regularly

3. **Storage Costs:**
   - Monitor S3 storage usage
   - Implement lifecycle policies to archive old images
   - Consider image compression before upload

4. **API Rate Limits:**
   - Plate Recognizer has rate limits based on your plan
   - Use `--delay` parameter to avoid hitting limits
   - Monitor usage in your Plate Recognizer dashboard

## Advanced Usage

### Processing Large Batches

For scheduled processing with cron:
```bash
# Run every hour
0 * * * * cd /path/to/project && python snapshot_to_postgres.py --images /path/to/images.txt --delay 1.0 >> /var/log/plate-recognizer.log 2>&1
```

### Integration with Other Systems

Import functions from the script for use in other applications:

```python
from snapshot_to_postgres import (
    fetch_image_bytes,
    upload_to_s3,
    send_request_with_retry,
    parse_and_normalize_response
)

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

This implementation is part of the N-M Traffic Management System. See [LICENSE](LICENSE) for details.
