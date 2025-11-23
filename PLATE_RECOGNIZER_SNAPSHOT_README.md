# Plate Recognizer Integration with PostgreSQL

This feature enables ingestion of vehicle images using [Plate Recognizer](https://platerecognizer.com/) and stores the recognition results along with image metadata in PostgreSQL.

## Deployment Options

This integration supports two Plate Recognizer deployment types:

1. **Snapshot API (Cloud)**: Cloud-based API, no installation required
   - Documentation: https://guides.platerecognizer.com/docs/snapshot/api-reference/
   
2. **SDK/Server (On-Premise)**: Self-hosted solution on your infrastructure
   - Documentation: https://guides.platerecognizer.com/docs/tech-references/server/
   - Setup Guide: [PLATE_RECOGNIZER_SDK_GUIDE.md](PLATE_RECOGNIZER_SDK_GUIDE.md)

## Features

- **Dual API Support**: Use either Snapshot API (cloud) or SDK/Server (on-premise)
- **Flexible Image Storage**: Choose between S3 object storage (default) or PostgreSQL bytea (for small tests)
- **Comprehensive Metadata**: Stores plate text, confidence, vehicle make/model, colors, bounding boxes
- **Deduplication**: Uses SHA-256 hashing to avoid storing duplicate images
- **Retry Logic**: Automatic retries for network errors with exponential backoff
- **Batch Processing**: Process multiple images from a text file
- **Confidence Filtering**: Filter results by confidence threshold

## Architecture

### API Deployment Modes

1. **Snapshot API (Cloud)**
   - Hosted by Plate Recognizer
   - Pay-per-use pricing
   - No infrastructure management
   - Best for: Variable workloads, quick setup

2. **SDK/Server (On-Premise)**
   - Self-hosted via Docker
   - One-time license fee
   - Full data privacy and control
   - Best for: High volume, offline operation, privacy requirements

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
- **For Snapshot API**: Plate Recognizer account and API key
- **For SDK/Server**: Plate Recognizer SDK license token
- (Optional) AWS S3 bucket or MinIO for image storage

## Choosing Between Snapshot API and SDK/Server

| Consideration | Choose Snapshot API | Choose SDK/Server |
|--------------|---------------------|-------------------|
| **Setup Complexity** | Simple (cloud-based) | Complex (requires deployment) |
| **Cost Model** | Pay-per-API-call | One-time license fee |
| **Privacy** | Data sent to cloud | Data stays on-premise |
| **Internet Required** | Yes | No |
| **Scalability** | Automatic | Limited by hardware |
| **Latency** | Higher (network) | Lower (local) |
| **Maintenance** | Managed by Plate Recognizer | Self-managed |
| **Best For** | Variable workloads, quick start | High volume, privacy, offline |

**Recommendation**: 
- Start with **Snapshot API** for proof-of-concept and testing
- Move to **SDK/Server** for production if you need privacy, offline operation, or process >10,000 images/month

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

#### For Snapshot API (Cloud):

Edit `.env` and fill in your credentials:

```bash
# API Type
PLATE_API_TYPE=snapshot

# Required for Snapshot API
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

#### For SDK/Server (On-Premise):

Edit `.env` for SDK deployment:

```bash
# API Type
PLATE_API_TYPE=sdk

# Required for SDK/Server
PLATE_API_KEY=dummy_key_for_compatibility  # Not used by SDK but keep for compatibility
SDK_API_URL=http://localhost:8080/v1/plate-reader/
SDK_LICENSE_TOKEN=your_sdk_license_token_here
DATABASE_URL=postgresql://user:pass@localhost:5432/platenet

# Storage mode: "s3" (default) or "db"
STORE_IMAGES=s3

# Required when STORE_IMAGES=s3
S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

**📖 For complete SDK setup instructions, see**: [PLATE_RECOGNIZER_SDK_GUIDE.md](PLATE_RECOGNIZER_SDK_GUIDE.md)

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
