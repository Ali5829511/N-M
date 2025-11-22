# Plate Recognizer Snapshot Integration
# تكامل Plate Recognizer Snapshot

Complete integration with Plate Recognizer Snapshot API to capture vehicle data and store it in PostgreSQL with embedded image data.

تكامل كامل مع Plate Recognizer Snapshot API لالتقاط بيانات المركبات وتخزينها في PostgreSQL مع تضمين بيانات الصور.

## Features / الميزات

- ✅ Process images from local files or URLs
- ✅ Calculate SHA256 hash for deduplication
- ✅ Send images to Plate Recognizer Snapshot API
- ✅ Extract plate numbers, confidence scores, vehicle makes/models, colors
- ✅ Store complete API response and image data in PostgreSQL
- ✅ Configurable confidence threshold
- ✅ Rate limiting with configurable delay
- ✅ Batch processing with progress tracking
- ✅ Docker support for easy deployment

## ⚠️ Important Warnings / تحذيرات مهمة

### Storage Considerations / اعتبارات التخزين

**Storing images as BYTEA in PostgreSQL will significantly increase database size!**

تخزين الصور كـ BYTEA في PostgreSQL سيزيد حجم قاعدة البيانات بشكل كبير!

- Each 1MB image = 1MB+ in database
- 1000 images × 1MB each = ~1GB+ database size
- Consider using external storage (S3, MinIO, etc.) for production

### Privacy & Legal / الخصوصية والقوانين

**Storing vehicle images may have privacy and legal implications.**

تخزين صور المركبات قد يكون له آثار على الخصوصية والقوانين.

- Ensure compliance with local data protection laws
- Consider data retention policies
- Implement proper access controls
- Document your data handling procedures

## Prerequisites / المتطلبات

- Python 3.8+
- PostgreSQL 12+
- Plate Recognizer API account and token
- Docker (optional, for containerized deployment)

## Installation / التثبيت

### 1. Clone the Repository

```bash
git clone https://github.com/Ali5829511/N-M.git
cd N-M
git checkout feature/plate-recognizer-snapshot
```

### 2. Install Python Dependencies

```bash
pip install -r snapshot_requirements.txt
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.snapshot.example .env

# Edit .env and fill in your values
nano .env
```

Required environment variables:
```
PLATE_API_KEY=your_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

### 4. Initialize Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE plate_recognizer;

# Run schema
\c plate_recognizer
\i db_schema.sql
```

Or use the provided script:
```bash
psql -U postgres -d plate_recognizer -f db_schema.sql
```

## Usage / الاستخدام

### 1. Prepare Image List

Create `images.txt` with one image path or URL per line:

```
https://example.com/images/car1.jpg
https://example.com/images/car2.jpg
/path/to/local/image1.jpg
/path/to/local/image2.png
```

### 2. Run the Script

```bash
python snapshot_to_postgres.py
```

With custom image file:
```bash
python snapshot_to_postgres.py --images my_images.txt
```

### 3. Monitor Progress

The script will show:
- Progress bar with percentage
- Image processing details
- API responses
- Database insertion status
- Final statistics

## Docker Deployment / النشر باستخدام Docker

### Build and Run with Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t plate-recognizer-snapshot -f Dockerfile.snapshot .

# Run container
docker run --env-file .env plate-recognizer-snapshot
```

## Configuration / التكوين

Environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `PLATE_API_KEY` | Plate Recognizer API token | Required |
| `SNAPSHOT_API_URL` | API endpoint URL | `https://api.platerecognizer.com/v1/plate-reader/` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REQUEST_DELAY` | Delay between requests (seconds) | `1.0` |
| `CONFIDENCE_THRESHOLD` | Minimum confidence (0.0-1.0) | `0.0` |
| `BATCH_SIZE` | Records per commit | `10` |

### API Endpoint Options / خيارات نقطة نهاية API

The script supports two Plate Recognizer API endpoints:

**Standard Snapshot API** (default):
```
SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/
```

**Snapshot Cloud API**:
```
SNAPSHOT_API_URL=https://app.platerecognizer.com/service/snapshot-cloud/
```

Choose the endpoint that matches your Plate Recognizer subscription. Both endpoints work with the same API key and provide the same response format.

يدعم السكربت نقطتي نهاية من Plate Recognizer API. اختر النقطة التي تتناسب مع اشتراكك. كلا النقطتين تعملان بنفس مفتاح API وتوفران نفس تنسيق الاستجابة.

## Database Schema / مخطط قاعدة البيانات

The `vehicle_snapshots` table stores:

- **Identifiers**: UUID, snapshot reference, camera ID
- **Timestamps**: Capture time, creation time
- **Plate Data**: Text, confidence score
- **Vehicle Data**: Makes/models, colors (JSONB)
- **Bounding Box**: Plate location coordinates
- **API Response**: Complete raw response (JSONB)
- **Image Data**: Binary data, MIME type, size, SHA256 hash
- **Metadata**: Processing info, source details

## Querying Data / الاستعلام عن البيانات

### Get All Snapshots with High Confidence

```sql
SELECT snapshot_ref, plate_text, plate_confidence, captured_at
FROM vehicle_snapshots
WHERE plate_confidence > 0.8
ORDER BY captured_at DESC;
```

### Search by Plate Number

```sql
SELECT snapshot_ref, captured_at, plate_confidence
FROM vehicle_snapshots
WHERE plate_text = 'ABC123'
ORDER BY captured_at DESC;
```

### Find Vehicles by Make

```sql
SELECT snapshot_ref, plate_text, makes_models
FROM vehicle_snapshots
WHERE makes_models @> '[{"make": "Toyota"}]'::jsonb;
```

### Retrieve Image from Database

```sql
SELECT 
    snapshot_ref,
    plate_text,
    image_mime,
    encode(image_data, 'base64') as image_base64
FROM vehicle_snapshots
WHERE id = 'your-uuid-here';
```

To display in HTML:
```html
<img src="data:image/jpeg;base64,{image_base64}" />
```

### Monitor Database Size

```sql
SELECT 
    pg_size_pretty(pg_total_relation_size('vehicle_snapshots')) as total_size,
    pg_size_pretty(pg_relation_size('vehicle_snapshots')) as table_size,
    pg_size_pretty(pg_indexes_size('vehicle_snapshots')) as indexes_size;
```

## Alternative: Using S3 for Image Storage / البديل: استخدام S3 لتخزين الصور

**Recommended for production:** Instead of storing images in PostgreSQL, consider:

### AWS S3
```python
import boto3

s3 = boto3.client('s3')
s3.put_object(
    Bucket='my-bucket',
    Key=f'snapshots/{sha256}.jpg',
    Body=image_bytes
)

# Store only S3 URL in database
image_s3_url = f's3://my-bucket/snapshots/{sha256}.jpg'
```

### MinIO (Self-hosted S3-compatible)
```python
from minio import Minio

client = Minio('minio.example.com', access_key='...', secret_key='...')
client.put_object('snapshots', f'{sha256}.jpg', image_data, len(image_data))
```

## Troubleshooting / استكشاف الأخطاء

### API Key Error

```
Error: PLATE_API_KEY environment variable not set
```
**Solution:** Set `PLATE_API_KEY` in `.env` file

### Database Connection Error

```
Error connecting to database: could not connect to server
```
**Solution:** Check `DATABASE_URL` and ensure PostgreSQL is running

### Rate Limiting

```
HTTP 429: Too Many Requests
```
**Solution:** Increase `REQUEST_DELAY` in `.env`

### Low Confidence Results

Many images are skipped?
**Solution:** Lower `CONFIDENCE_THRESHOLD` or improve image quality

## Security Best Practices / أفضل ممارسات الأمان

1. ✅ Never commit `.env` file to version control
2. ✅ Use environment-specific API keys
3. ✅ Rotate API keys regularly
4. ✅ Use strong database passwords
5. ✅ Implement proper access controls
6. ✅ Enable SSL for database connections
7. ✅ Monitor and log API usage
8. ✅ Implement data retention policies
9. ✅ Consider anonymization for stored images
10. ✅ Regular security audits

## Performance Tips / نصائح الأداء

1. **Batch Processing**: Adjust `BATCH_SIZE` based on your system
2. **Indexing**: Ensure indexes are created (see `db_schema.sql`)
3. **Connection Pooling**: Use connection pooling for high volume
4. **Image Optimization**: Resize images before processing
5. **External Storage**: Use S3/MinIO for large deployments
6. **Database Maintenance**: Regular VACUUM and ANALYZE
7. **Monitoring**: Track API usage and database size

## API Documentation / وثائق API

For Plate Recognizer API details:
- Documentation: https://docs.platerecognizer.com/
- Dashboard: https://app.platerecognizer.com/
- API Status: https://status.platerecognizer.com/

## License / الترخيص

MIT License - See LICENSE file

## Support / الدعم

For issues or questions:
- GitHub Issues: https://github.com/Ali5829511/N-M/issues
- Plate Recognizer Support: https://platerecognizer.com/help/

## Contributing / المساهمة

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Note:** This implementation stores images directly in PostgreSQL using BYTEA. For production systems handling large volumes, consider using external object storage (S3, MinIO, etc.) and storing only URLs in the database.

**ملاحظة:** هذا التنفيذ يخزن الصور مباشرة في PostgreSQL باستخدام BYTEA. للأنظمة الإنتاجية التي تتعامل مع حجم كبير، فكر في استخدام تخزين الكائنات الخارجي (S3، MinIO، إلخ) وتخزين الروابط فقط في قاعدة البيانات.
