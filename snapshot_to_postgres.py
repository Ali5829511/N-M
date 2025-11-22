#!/usr/bin/env python3
"""
Script to send images/URLs to Plate Recognizer Snapshot API and store results in PostgreSQL.
سكربت لإرسال صور/روابط إلى Plate Recognizer Snapshot API وتخزين النتائج في PostgreSQL.

Features:
- Supports S3 or database storage for images
- Computes SHA256 hash for deduplication
- Handles retries for network errors
- CLI arguments for configuration
"""

import os
import sys
import argparse
import hashlib
import mimetypes
import time
import hashlib
import mimetypes
from urllib.parse import urlparse
from io import BytesIO

import requests
from dotenv import load_dotenv
from tqdm import tqdm
import psycopg2
from psycopg2 import Binary
from psycopg2.extras import Json, register_uuid

# Load environment variables
load_dotenv()

# Required environment variables (will be validated in main())
PLATE_API_KEY = os.getenv("PLATE_API_KEY")
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
STORE_IMAGES = os.getenv("STORE_IMAGES", "s3")  # Default to s3
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")  # For MinIO or custom S3

if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
    print("ERROR: Missing required environment variables: PLATE_API_KEY, SNAPSHOT_API_URL, DATABASE_URL")
    print("خطأ: المتغيرات البيئية المطلوبة غير موجودة: PLATE_API_KEY و SNAPSHOT_API_URL و DATABASE_URL")
    sys.exit(1)

if STORE_IMAGES == "s3":
    if not S3_BUCKET:
        print("ERROR: STORE_IMAGES=s3 requires S3_BUCKET to be set")
        print("خطأ: STORE_IMAGES=s3 يتطلب تعيين S3_BUCKET")
        sys.exit(1)
    try:
        import boto3
        from botocore.exceptions import ClientError
    except ImportError:
        print("ERROR: boto3 is required for S3 storage. Install with: pip install boto3")
        print("خطأ: boto3 مطلوب لتخزين S3. قم بالتثبيت باستخدام: pip install boto3")
        sys.exit(1)

HEADERS = {
    "Authorization": f"Token {PLATE_API_KEY}"
}

def fetch_image_bytes(path_or_url):
    """
    Fetch image bytes from URL or local file path.
    Returns: (image_bytes, original_source)
    """
    if urlparse(path_or_url).scheme in ("http", "https"):
        response = requests.get(path_or_url, timeout=30)
        response.raise_for_status()
        return response.content, path_or_url
    else:
        with open(path_or_url, "rb") as f:
            return f.read(), path_or_url

def compute_image_metadata(image_bytes, original_source):
    """
    Compute SHA256 hash, MIME type, and size for image bytes.
    """
    sha256_hash = hashlib.sha256(image_bytes).hexdigest()
    size = len(image_bytes)
    
    # Determine MIME type from filename/URL
    mime_type = mimetypes.guess_type(original_source)[0]
    
    # Fallback to detecting from magic bytes
    if not mime_type:
        if image_bytes.startswith(b'\xff\xd8\xff'):
            mime_type = 'image/jpeg'
        elif image_bytes.startswith(b'\x89PNG'):
            mime_type = 'image/png'
        elif image_bytes.startswith(b'GIF'):
            mime_type = 'image/gif'
        else:
            mime_type = 'application/octet-stream'
    
    return sha256_hash, mime_type, size

def upload_to_s3(image_bytes, sha256_hash, mime_type):
    """
    Upload image to S3 and return the URL.
    Uses SHA256 as the object key for deduplication.
    """
    s3_client_kwargs = {
        'region_name': AWS_REGION
    }
    
    if S3_ENDPOINT_URL:
        s3_client_kwargs['endpoint_url'] = S3_ENDPOINT_URL
    
    s3_client = boto3.client('s3', **s3_client_kwargs)
    
    # Use SHA256 as filename with appropriate extension
    ext_map = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif'
    }
    ext = ext_map.get(mime_type, '.bin')
    object_key = f"snapshots/{sha256_hash}{ext}"
    
    try:
        # Check if object already exists
        try:
            s3_client.head_object(Bucket=S3_BUCKET, Key=object_key)
            # Object exists, just return the URL
            print(f"Image {sha256_hash} already exists in S3, skipping upload")
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                # Object doesn't exist, upload it
                s3_client.put_object(
                    Bucket=S3_BUCKET,
                    Key=object_key,
                    Body=image_bytes,
                    ContentType=mime_type
                )
                print(f"Uploaded image {sha256_hash} to S3")
            else:
                raise
        
        # Generate URL (adjust based on your bucket configuration)
        if S3_ENDPOINT_URL:
            s3_url = f"{S3_ENDPOINT_URL}/{S3_BUCKET}/{object_key}"
        else:
            s3_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{object_key}"
        
        return s3_url
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        raise

def send_request(image_bytes):
    """
    Send image bytes to Plate Recognizer API.
    Returns the API response.
    """
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            # Note: 'upload' is the field name required by Plate Recognizer API
            # Create new BytesIO for each retry attempt
            image_io = BytesIO(image_bytes)
            image_io.seek(0)
            files = {"upload": image_io}
            r = requests.post(SNAPSHOT_API_URL, headers=HEADERS, files=files, timeout=60)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                print(f"Request failed (attempt {attempt + 1}/{max_retries}): {e}. Retrying in {retry_delay}s...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                raise

def calculate_image_metadata(image_bytes, path_or_url):
    """
    احسب البيانات الوصفية للصورة: SHA256، MIME type، الحجم
    """
    sha256_hash = hashlib.sha256(image_bytes).hexdigest()
    size = len(image_bytes)
    
    # تحديد MIME type
    mime_type = mimetypes.guess_type(path_or_url)[0]
    
    # إذا لم نتمكن من تحديد MIME type، نستخدم القيمة الافتراضية
    if not mime_type:
        # فحص الـ magic bytes
        if image_bytes.startswith(b'\xff\xd8\xff'):
            mime_type = 'image/jpeg'
        elif image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
            mime_type = 'image/png'
        elif image_bytes.startswith(b'GIF87a') or image_bytes.startswith(b'GIF89a'):
            mime_type = 'image/gif'
        else:
            mime_type = 'application/octet-stream'
    
    return sha256_hash, mime_type, size


def upload_to_s3(image_bytes, filename, mime_type):
    """
    ارفع الصورة إلى S3 وأرجع الـ URL
    """
    try:
        # استخدام SHA256 كاسم للملف لتجنب التكرار
        sha256_hash = hashlib.sha256(image_bytes).hexdigest()
        extension = mimetypes.guess_extension(mime_type) or '.jpg'
        s3_key = f"plate-snapshots/{sha256_hash}{extension}"
        
        boto3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=image_bytes,
            ContentType=mime_type
        )
        
        # إنشاء URL للصورة
        # إذا كان هناك AWS_ENDPOINT_URL (MinIO)، استخدمه
        AWS_ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL")
        if AWS_ENDPOINT_URL:
            # MinIO or custom S3-compatible endpoint
            s3_url = f"{AWS_ENDPOINT_URL}/{S3_BUCKET}/{s3_key}"
        else:
            # AWS S3 URL
            s3_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
        
        return s3_url
    except Exception as e:
        print(f"  خطأ في رفع الصورة إلى S3: {e}")
        return None


def send_to_plate_recognizer(image_bytes, mime_type='image/jpeg'):
    """
    Send image to Plate Recognizer API (Snapshot or SDK) and return response.
    Supports both cloud-based Snapshot API and on-premise SDK/Server.
    """
    # Determine file extension from mime type
    ext = mime_type.split('/')[-1] if '/' in mime_type else 'jpg'
    filename = f"image.{ext}"
    
    files = {"upload": (filename, image_bytes, mime_type)}
    
    # Retry logic
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(
                API_URL,  # Uses either SNAPSHOT_API_URL or SDK_API_URL
                headers=HEADERS,
                files=files,
                timeout=60
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                print(f"  Retry {attempt + 1}/{max_retries} after error: {e}")
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                raise



def parse_plate_recognizer_response(resp, confidence_threshold=0.0):
    """
    Parse Plate Recognizer response and extract relevant information.
    Returns a dictionary with extracted fields, or None if below threshold.
    """
    parsed = {
        "snapshot_ref": None,
        "camera_id": None,
        "captured_at": None,
        "plate_text": None,
        "plate_confidence": None,
        "makes_models": None,
        "colors": None,
        "bbox": None,
        "raw_response": resp,
        "meta": {}
    }
    
    # Extract results (structure may vary)
    results = resp.get("results", [])
    
    if results and len(results) > 0:
        result = results[0]
        
        # Extract plate information
        plate = result.get("plate", {})
        if isinstance(plate, dict):
            plate_text = plate.get("plate") or plate.get("text") or plate.get("number")
        else:
            plate_text = str(plate) if plate else None
        
        plate_confidence = result.get("score", 0.0)
        
        # Apply confidence threshold
        if plate_confidence < confidence_threshold:
            return None
        
        parsed["plate_text"] = plate_text
        parsed["plate_confidence"] = plate_confidence
        
        # Extract vehicle information
        vehicle = result.get("vehicle", {})
        if vehicle:
            parsed["makes_models"] = vehicle.get("type", {})
            parsed["colors"] = vehicle.get("color", [])
        
        # Extract bounding box
        parsed["bbox"] = result.get("box", {})
        
        # Extract other metadata
        parsed["camera_id"] = resp.get("camera_id")
        parsed["snapshot_ref"] = resp.get("uuid") or resp.get("filename")
        
        # Extract timestamp
        timestamp = resp.get("timestamp")
        if timestamp:
            try:
                parsed["captured_at"] = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except Exception:
                parsed["captured_at"] = datetime.now()
        else:
            parsed["captured_at"] = datetime.now()
    
    return parsed


def insert_into_db(conn, record):
    """
    Insert a vehicle snapshot record into the database.
    """
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO vehicle_snapshots
            (snapshot_ref, camera_id, captured_at, plate_text, plate_confidence, 
             makes_models, colors, bbox, raw_response, image_url, image_data,
             image_mime, image_size, image_sha256, meta)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            record["snapshot_ref"],
            record["camera_id"],
            record["captured_at"],
            record["plate_text"],
            record["plate_confidence"],
            Json(record["makes_models"]) if record["makes_models"] else None,
            Json(record["colors"]) if record["colors"] else None,
            Json(record["bbox"]) if record["bbox"] else None,
            Json(record["raw_response"]),
            record["image_url"],
            record.get("image_data"),  # May be None
            record["image_mime"],
            record["image_size"],
            record["image_sha256"],
            Json(record["meta"])
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id



def main():
    parser = argparse.ArgumentParser(
        description="Send images to Plate Recognizer Snapshot API and store results in PostgreSQL"
    )
    parser.add_argument(
        "--images", 
        required=True, 
        help="Text file containing one image path/URL per line"
    )
    parser.add_argument(
        "--delay", 
        type=float, 
        default=0.5, 
        help="Delay between requests in seconds (default: 0.5)"
    )
    parser.add_argument(
        "--confidence-threshold",
        type=float,
        default=0.0,
        help="Minimum confidence threshold for plate detection (0.0-1.0, default: 0.0)"
    )
    args = parser.parse_args()
    
    # Validate environment variables after parsing args (so --help works without env vars)
    global boto3_client, HEADERS, API_URL
    
    # Validate API type
    if PLATE_API_TYPE not in ["snapshot", "sdk"]:
        print(f"ERROR: PLATE_API_TYPE must be 'snapshot' or 'sdk', got '{PLATE_API_TYPE}'")
        sys.exit(1)
    
    # Validate required environment variables based on API type
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL is required")
        sys.exit(1)
    
    # Set API URL and validate credentials based on type
    if PLATE_API_TYPE == "snapshot":
        if not SNAPSHOT_API_URL:
            print("ERROR: SNAPSHOT_API_URL must be set when PLATE_API_TYPE=snapshot")
            sys.exit(1)
        if not PLATE_API_KEY:
            print("ERROR: PLATE_API_KEY must be set when PLATE_API_TYPE=snapshot")
            sys.exit(1)
        API_URL = SNAPSHOT_API_URL
        # Set authentication header for Snapshot API
        HEADERS = {
            "Authorization": f"Token {PLATE_API_KEY}"
        }
    else:  # sdk
        if not SDK_API_URL:
            print("ERROR: SDK_API_URL must be set when PLATE_API_TYPE=sdk")
            sys.exit(1)
        # Validate SDK_LICENSE_TOKEN for documentation purposes
        # Note: The token is actually used by the SDK Docker container, not by this script
        SDK_LICENSE_TOKEN = os.getenv("SDK_LICENSE_TOKEN")
        if not SDK_LICENSE_TOKEN:
            print("WARNING: SDK_LICENSE_TOKEN is not set. Make sure your SDK container is configured correctly.")
            print("         The SDK Docker container requires LICENSE_TOKEN to be set as an environment variable.")
        API_URL = SDK_API_URL
        # SDK/Server may not require authentication header, but we include a dummy one for compatibility
        HEADERS = {
            "Authorization": f"Token {PLATE_API_KEY or 'sdk-no-auth-needed'}"
        }
    
    print(f"Using Plate Recognizer API type: {PLATE_API_TYPE}")
    print(f"API endpoint: {API_URL}")
    print()

    print(f"Configuration:")
    print(f"  Storage mode: {STORE_IMAGES}")
    print(f"  Database: {DATABASE_URL}")
    if STORE_IMAGES == "s3":
        print(f"  S3 Bucket: {S3_BUCKET}")
        print(f"  AWS Region: {AWS_REGION}")
    print(f"  Confidence threshold: {args.confidence_threshold}")
    print()

    with open(args.images, "r") as f:
        items = [line.strip() for line in f if line.strip()]

    conn = psycopg2.connect(DATABASE_URL)
    register_uuid(conn=conn)

    processed = 0
    errors = 0

    try:
        for item in tqdm(items, desc="Processing images"):
            try:
                # Fetch image bytes
                image_bytes, original_source = fetch_image_bytes(item)
                
                # Compute metadata
                sha256_hash, mime_type, size = compute_image_metadata(image_bytes, original_source)
                
                # Check if image already processed (by SHA256)
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT id FROM vehicle_snapshots WHERE image_sha256 = %s LIMIT 1",
                        (sha256_hash,)
                    )
                    if cur.fetchone():
                        print(f"Image {item} already processed (SHA256: {sha256_hash}), skipping")
                        continue
                
                # Store image based on configuration
                image_url = None
                image_data = None
                
                if STORE_IMAGES == "s3":
                    image_url = upload_to_s3(image_bytes, sha256_hash, mime_type)
                elif STORE_IMAGES == "db":
                    image_data = psycopg2.Binary(image_bytes)
                    print(f"Storing image {item} in database ({size} bytes)")
                else:
                    raise ValueError(f"Invalid STORE_IMAGES value '{STORE_IMAGES}'. Must be 's3' or 'db'")
                
                # Send to Plate Recognizer API
                resp = send_request(image_bytes)
                
                # Parse response
                record = parse_and_normalize_response(resp)
                
                # Apply confidence threshold
                if args.confidence_threshold > 0 and record.get("plate_confidence"):
                    if record["plate_confidence"] < args.confidence_threshold:
                        print(f"Plate confidence {record['plate_confidence']:.2f} below threshold {args.confidence_threshold}, skipping")
                        time.sleep(args.delay)
                        continue
                
                # Add image metadata to record
                record["snapshot_ref"] = record["snapshot_ref"] or sha256_hash
                # Determine image URL: use S3 URL if available, otherwise API response URL, or original URL
                if image_url:
                    record["image_url"] = image_url
                elif record.get("image_url"):
                    record["image_url"] = record["image_url"]
                elif urlparse(item).scheme in ("http", "https"):
                    record["image_url"] = item
                else:
                    record["image_url"] = None
                record["image_data"] = image_data
                record["image_mime"] = mime_type
                record["image_size"] = size
                record["image_sha256"] = sha256_hash
                
                # Insert into database
                new_id = insert_into_db(conn, record)
                processed += 1
                print(f"Processed {item} -> ID: {new_id}, Plate: {record.get('plate_text', 'N/A')}")
                
            except Exception as e:
                print(f"ERROR processing {item}: {e}")
                errors += 1
                conn.rollback()
            
            time.sleep(args.delay)
    finally:
        conn.close()
    
    print()
    print(f"Summary:")
    print(f"  Total items: {len(items)}")
    print(f"  Processed: {processed}")
    print(f"  Errors: {errors}")

if __name__ == "__main__":
    main()
