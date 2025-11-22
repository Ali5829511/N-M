# Plate Recognizer Snapshot - Usage Examples
# أمثلة استخدام Plate Recognizer Snapshot

## Quick Start Example

### 1. Setup Environment

```bash
# Copy and edit .env file
cp .env.example .env

# Edit .env and add your credentials:
# PLATE_API_KEY=your_actual_api_key
# S3_BUCKET=your_bucket_name
# AWS_ACCESS_KEY_ID=your_aws_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret
# DATABASE_URL=postgresql://user:pass@localhost:5432/platenet
```

### 2. Create Database Schema

```bash
# Option 1: Using Docker Compose (recommended)
docker-compose -f docker-compose.snapshot.yml up -d db

# Option 2: Manual setup
psql $DATABASE_URL -f db_schema.sql
```

### 3. Prepare Image List

Create a file `images.txt` with image URLs or local paths:

```txt
https://example.com/vehicle1.jpg
https://example.com/vehicle2.jpg
/path/to/local/image.jpg
```

### 4. Run the Script

**Basic usage:**
```bash
python snapshot_to_postgres.py --images images.txt
```

**With confidence threshold:**
```bash
python snapshot_to_postgres.py \
  --images images.txt \
  --confidence-threshold 0.8 \
  --delay 1.0
```

**With retry settings:**
```bash
python snapshot_to_postgres.py \
  --images images.txt \
  --delay 1.0 \
  --confidence-threshold 0.7 \
  --retries 5
```

## Example Output

```
Processing images: 100%|██████████| 50/50 [02:30<00:00, 3.01s/it]
✓ تم إدخال السجل 123e4567-e89b-12d3-a456-426614174000 للصورة https://example.com/vehicle1.jpg
✓ تم إدخال السجل 223e4567-e89b-12d3-a456-426614174001 للصورة https://example.com/vehicle2.jpg
تجاهل /path/to/image3.jpg: الثقة (0.65) أقل من الحد الأدنى (0.80)

انتهت المعالجة. تم معالجة 50 صورة.
```

## Querying Results

### Find vehicles by plate number
```sql
SELECT 
  id,
  plate_text,
  plate_confidence,
  captured_at,
  image_url
FROM vehicle_snapshots
WHERE plate_text = 'ABC123'
ORDER BY created_at DESC;
```

### Get high-confidence detections
```sql
SELECT 
  plate_text,
  plate_confidence,
  makes_models->0->>'make' as make,
  makes_models->0->>'model' as model,
  image_url
FROM vehicle_snapshots
WHERE plate_confidence > 0.9
ORDER BY plate_confidence DESC
LIMIT 10;
```

### Access stored images
```sql
-- For S3 storage (most common)
SELECT image_url FROM vehicle_snapshots WHERE id = 'uuid-here';
-- Copy the URL and access it (presigned URL valid for 1 hour)

-- For DB storage (testing only)
SELECT image_data, image_mime FROM vehicle_snapshots WHERE id = 'uuid-here';
-- Use Python/application code to extract and display
```

## Storage Mode Comparison

### S3 Storage (Default, Recommended)

**Setup:**
```bash
STORE_IMAGES=s3
S3_BUCKET=my-vehicle-images
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_USE_PRESIGNED_URLS=true
```

**Advantages:**
- Scalable for large datasets
- Lower database costs
- Faster queries
- Industry standard

### Database Storage (Testing Only)

**Setup:**
```bash
STORE_IMAGES=db
# S3 credentials not required
```

**Use cases:**
- Small-scale testing (< 100 images)
- Offline development
- POC demonstrations

**⚠️ Warning:** Not recommended for production. Database will grow rapidly.

## Docker Usage

### Start complete environment
```bash
docker-compose -f docker-compose.snapshot.yml up -d
```

### Run script in container
```bash
docker-compose -f docker-compose.snapshot.yml run app \
  python snapshot_to_postgres.py --images images.txt --delay 1.0
```

### View logs
```bash
docker-compose -f docker-compose.snapshot.yml logs -f app
```

### Stop services
```bash
docker-compose -f docker-compose.snapshot.yml down
```

## Troubleshooting

### Error: "الرجاء ضبط المتغيرات البيئية"
**Solution:** Ensure all required environment variables are set in `.env` file

### Error: "boto3 not installed"
**Solution:** `pip install boto3`

### Error: "S3 upload failed"
**Solution:** 
- Verify AWS credentials
- Check IAM permissions
- Ensure bucket exists and is in correct region

### Error: "Connection refused" to database
**Solution:**
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Test connection: `psql $DATABASE_URL`

### Low detection accuracy
**Solution:**
- Try different `--confidence-threshold` values
- Verify image quality (minimum 720p recommended)
- Check Plate Recognizer API documentation for region-specific models

## Performance Tips

1. **Batch Processing:** Process images during off-peak hours
2. **Parallel Processing:** Run multiple instances with different image lists
3. **Delay Tuning:** Adjust `--delay` based on API rate limits
4. **Network:** Use instances in same region as S3 bucket
5. **Database:** Use connection pooling for high-throughput

## Best Practices

1. **Start Small:** Test with 5-10 images first
2. **Monitor Costs:** Track S3 storage and API usage
3. **Backup Regularly:** Enable S3 versioning
4. **Rotate Credentials:** Change API keys and AWS credentials periodically
5. **Review Privacy:** Ensure compliance with local data protection laws

## Support

For more information, see:
- Full documentation: `PLATE_RECOGNIZER_SNAPSHOT_README.md`
- Plate Recognizer Docs: https://guides.platerecognizer.com/
- GitHub Issues: https://github.com/Ali5829511/N-M/issues
