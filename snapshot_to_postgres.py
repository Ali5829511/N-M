#!/usr/bin/env python3
"""
سكربت لإرسال صور/روابط إلى Plate Recognizer Snapshot API وتخزين النتائج في PostgreSQL.

Features / الميزات:
- دعم تخزين الصور في S3 (افتراضي) أو قاعدة البيانات (bytea)
- حساب SHA256 لكل صورة
- تحديد تلقائي لنوع MIME
- دعم عتبة الثقة للوحات المرورية
- معالجة أخطاء الشبكة بشكل سليم
- تأخير قابل للتخصيص بين الطلبات

Usage / الاستخدام:
    python snapshot_to_postgres.py --images images.txt --delay 1.0 --confidence-threshold 0.75
"""

import os
import sys
import argparse
import json
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
from datetime import datetime

load_dotenv()

# Environment variables / المتغيرات البيئية
PLATE_API_KEY = os.getenv("PLATE_API_KEY")
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
STORE_IMAGES = os.getenv("STORE_IMAGES", "s3").lower()  # "s3" or "db"
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

HEADERS = None


def validate_environment():
    """Validate required environment variables"""
    if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
        print("❌ الرجاء ضبط المتغيرات البيئية: PLATE_API_KEY و SNAPSHOT_API_URL و DATABASE_URL")
        print("❌ Please set environment variables: PLATE_API_KEY, SNAPSHOT_API_URL, DATABASE_URL")
        sys.exit(1)

    # Import boto3 only if S3 storage is enabled
    if STORE_IMAGES == "s3":
        if not S3_BUCKET or not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
            print("❌ عند استخدام STORE_IMAGES=s3، يجب تعيين: S3_BUCKET و AWS_ACCESS_KEY_ID و AWS_SECRET_ACCESS_KEY")
            print("❌ When using STORE_IMAGES=s3, must set: S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY")
            sys.exit(1)
        try:
            global boto3, ClientError, s3_client
            import boto3
            from botocore.exceptions import ClientError
            # Initialize S3 client
            s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                region_name=AWS_REGION
            )
        except ImportError:
            print("❌ boto3 غير مثبت. قم بتثبيته باستخدام: pip install boto3")
            print("❌ boto3 not installed. Install it with: pip install boto3")
            sys.exit(1)
    
    global HEADERS
    HEADERS = {
        "Authorization": f"Token {PLATE_API_KEY}"
    }

# Initialize S3 client (will be set in validate_environment)
s3_client = None


def get_image_bytes(path_or_url):
    """
    جلب بايتات الصورة من مسار محلي أو URL
    Get image bytes from local path or URL
    
    Returns: (image_bytes, source_url_or_path)
    """
    if urlparse(path_or_url).scheme in ("http", "https"):
        # Download from URL
        response = requests.get(path_or_url, timeout=60)
        response.raise_for_status()
        return response.content, path_or_url
    else:
        # Read from local file
        with open(path_or_url, "rb") as f:
            return f.read(), path_or_url


def calculate_image_metadata(image_bytes, path_or_url):
    """
    حساب SHA256 وتحديد MIME type وحجم الصورة
    Calculate SHA256, determine MIME type and image size
    
    Returns: (sha256, mime_type, size_bytes)
    """
    sha256 = hashlib.sha256(image_bytes).hexdigest()
    size_bytes = len(image_bytes)
    
    # Determine MIME type
    mime_type = None
    if urlparse(path_or_url).scheme not in ("http", "https"):
        # For local files, use mimetypes
        mime_type, _ = mimetypes.guess_type(path_or_url)
    
    if not mime_type:
        # Try to detect from bytes (simple detection)
        if image_bytes.startswith(b'\xff\xd8\xff'):
            mime_type = 'image/jpeg'
        elif image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
            mime_type = 'image/png'
        elif image_bytes.startswith(b'GIF87a') or image_bytes.startswith(b'GIF89a'):
            mime_type = 'image/gif'
        else:
            mime_type = 'application/octet-stream'
    
    return sha256, mime_type, size_bytes


def upload_to_s3(image_bytes, sha256, mime_type):
    """
    رفع الصورة إلى S3 والحصول على URL
    Upload image to S3 and get URL
    
    Returns: s3_url
    """
    if not s3_client:
        raise RuntimeError("S3 client not initialized")
    
    # Use SHA256 as filename to avoid duplicates
    s3_key = f"vehicle-snapshots/{sha256[:2]}/{sha256[2:4]}/{sha256}"
    
    # Add extension based on mime type
    ext_map = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp'
    }
    if mime_type in ext_map:
        s3_key += ext_map[mime_type]
    
    try:
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=image_bytes,
            ContentType=mime_type,
            Metadata={
                'sha256': sha256
            }
        )
        
        # Generate URL
        s3_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
        return s3_url
    except ClientError as e:
        print(f"❌ خطأ في رفع الصورة إلى S3: {e}")
        print(f"❌ Error uploading to S3: {e}")
        raise


def send_request_to_api(image_bytes, path_or_url):
    """
    إرسال الصورة إلى Plate Recognizer API
    Send image to Plate Recognizer API
    
    Returns: API response (JSON)
    """
    # Always send as multipart file upload for reliability
    files = {"upload": BytesIO(image_bytes)}
    r = requests.post(SNAPSHOT_API_URL, headers=HEADERS, files=files, timeout=60)
    r.raise_for_status()
    return r.json()

def parse_and_normalize_response(resp, confidence_threshold=None):
    """
    استخرج الحقول المهمة من ردّ Plate Recognizer.
    بما أن الرد قد يختلف حسب إعدادات النموذج، ستخزن الرد الخام أيضاً.
    
    Extract important fields from Plate Recognizer response.
    Since response may vary based on model settings, raw response is also stored.
    """
    out = {
        "snapshot_ref": None,
        "camera_id": None,
        "captured_at": None,
        "plate_text": None,
        "plate_confidence": None,
        "makes_models": None,
        "colors": None,
        "bbox": None,
        "raw_response": resp,
        "image_url": None,
        "meta": {}
    }

    results = resp.get("results") or resp.get("vehicles") or [resp]

    if isinstance(results, dict):
        results = [results]

    if len(results) > 0:
        r0 = results[0]
        out["snapshot_ref"] = r0.get("id") or r0.get("snapshot_id") or out["snapshot_ref"]
        out["camera_id"] = r0.get("camera_id") or r0.get("camera")
        
        # Extract plate information
        plate = r0.get("plate") or r0.get("plate_info") or {}
        if isinstance(plate, dict):
            out["plate_text"] = plate.get("plate") or plate.get("number") or out["plate_text"]
            out["plate_confidence"] = plate.get("confidence") or out["plate_confidence"]
        
        # Check confidence threshold
        if confidence_threshold is not None and out["plate_confidence"] is not None:
            if float(out["plate_confidence"]) < confidence_threshold:
                print(f"⚠️  تحذير: ثقة اللوحة ({out['plate_confidence']:.2f}) أقل من العتبة ({confidence_threshold:.2f})")
                print(f"⚠️  Warning: Plate confidence ({out['plate_confidence']:.2f}) below threshold ({confidence_threshold:.2f})")
        
        # Extract vehicle information
        mm = r0.get("vehicle") or r0.get("vehicle_info") or {}
        if mm:
            out["makes_models"] = mm.get("predictions") or mm.get("makes_models") or mm
        
        colors = r0.get("color") or r0.get("colors")
        if colors:
            out["colors"] = colors
        
        bbox = r0.get("box") or r0.get("bounding_box") or r0.get("bbox")
        if bbox:
            out["bbox"] = bbox
        
        if r0.get("timestamp"):
            try:
                out["captured_at"] = datetime.fromisoformat(r0.get("timestamp"))
            except Exception:
                out["captured_at"] = None
        
        if r0.get("image_url"):
            out["image_url"] = r0.get("image_url")

    return out

def insert_into_db(conn, record):
    """
    إدراج سجل في جدول vehicle_snapshots
    Insert record into vehicle_snapshots table
    """
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO vehicle_snapshots
            (snapshot_ref, camera_id, captured_at, plate_text, plate_confidence, 
             makes_models, colors, bbox, raw_response, image_url, 
             image_data, image_mime, image_size, image_sha256, meta)
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
            Binary(record["image_data"]) if record.get("image_data") else None,
            record.get("image_mime"),
            record.get("image_size"),
            record.get("image_sha256"),
            Json(record["meta"])
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id

def main():
    # Parse arguments first to allow --help without env vars
    parser = argparse.ArgumentParser(
        description="Send images to Plate Recognizer Snapshot API and store results in PostgreSQL",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples / أمثلة:
  # استخدام S3 لتخزين الصور (افتراضي)
  python snapshot_to_postgres.py --images images.txt
  
  # استخدام قاعدة البيانات لتخزين الصور
  STORE_IMAGES=db python snapshot_to_postgres.py --images images.txt
  
  # تحديد عتبة الثقة وتأخير مخصص
  python snapshot_to_postgres.py --images images.txt --confidence-threshold 0.8 --delay 1.5
        """
    )
    parser.add_argument("--images", required=True, 
                       help="ملف نصي يحتوي على مسار/URL لكل صورة في سطر مستقل / Text file with image path/URL per line")
    parser.add_argument("--delay", type=float, default=0.5, 
                       help="تأخير بين الطلبات بالثواني / Delay between requests in seconds (default: 0.5)")
    parser.add_argument("--confidence-threshold", type=float, default=None,
                       help="الحد الأدنى لثقة اللوحة (0-1) / Minimum plate confidence threshold (0-1)")
    args = parser.parse_args()

    # Validate environment after parsing args (allows --help to work)
    validate_environment()

    # Print configuration
    print("=" * 60)
    print("🚗 Plate Recognizer Snapshot to PostgreSQL")
    print("=" * 60)
    print(f"📁 Images file: {args.images}")
    print(f"⏱️  Delay: {args.delay}s")
    print(f"📊 Confidence threshold: {args.confidence_threshold if args.confidence_threshold else 'None'}")
    print(f"💾 Storage mode: {STORE_IMAGES.upper()}")
    if STORE_IMAGES == "s3":
        print(f"🪣 S3 Bucket: {S3_BUCKET}")
        print(f"🌍 AWS Region: {AWS_REGION}")
    print(f"🗄️  Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'configured'}")
    print("=" * 60)

    # Read image list
    with open(args.images, "r") as f:
        items = [line.strip() for line in f if line.strip()]
    
    print(f"📋 Found {len(items)} image(s) to process\n")

    # Connect to database with context management
    success_count = 0
    error_count = 0

    try:
        conn = psycopg2.connect(DATABASE_URL)
        register_uuid()

        for item in tqdm(items, desc="Processing images", unit="image"):
            try:
                # Get image bytes
                try:
                    image_bytes, source = get_image_bytes(item)
                except requests.RequestException as e:
                    error_count += 1
                    tqdm.write(f"❌ خطأ في تحميل الصورة / Error downloading image {item}: {e}")
                    time.sleep(args.delay)
                    continue
                except IOError as e:
                    error_count += 1
                    tqdm.write(f"❌ خطأ في قراءة الملف / Error reading file {item}: {e}")
                    time.sleep(args.delay)
                    continue
                
                # Calculate metadata
                sha256, mime_type, size_bytes = calculate_image_metadata(image_bytes, item)
                
                # Prepare storage
                image_url = None
                image_data_for_db = None
                
                try:
                    if STORE_IMAGES == "s3":
                        # Upload to S3
                        image_url = upload_to_s3(image_bytes, sha256, mime_type)
                    elif STORE_IMAGES == "db":
                        # Store in database
                        image_data_for_db = image_bytes
                        image_url = source if urlparse(source).scheme in ("http", "https") else None
                except ClientError as e:
                    error_count += 1
                    tqdm.write(f"❌ خطأ في رفع S3 / S3 upload error {item}: {e}")
                    time.sleep(args.delay)
                    continue
                
                # Send to Plate Recognizer API
                try:
                    api_response = send_request_to_api(image_bytes, item)
                except requests.RequestException as e:
                    error_count += 1
                    tqdm.write(f"❌ خطأ في API / API error {item}: {e}")
                    time.sleep(args.delay)
                    continue
                
                # Parse response
                record = parse_and_normalize_response(api_response, args.confidence_threshold)
                
                # Add image metadata
                record["snapshot_ref"] = record["snapshot_ref"] or sha256
                record["image_url"] = record["image_url"] or image_url
                record["image_data"] = image_data_for_db
                record["image_mime"] = mime_type
                record["image_size"] = size_bytes
                record["image_sha256"] = sha256
                
                # Insert into database
                try:
                    new_id = insert_into_db(conn, record)
                    success_count += 1
                    tqdm.write(f"✅ {item} -> DB ID: {new_id}, Plate: {record['plate_text'] or 'N/A'}")
                except psycopg2.Error as e:
                    error_count += 1
                    tqdm.write(f"❌ خطأ في قاعدة البيانات / Database error {item}: {e}")
                    conn.rollback()
                
            except Exception as e:
                # Catch any unexpected errors
                error_count += 1
                tqdm.write(f"❌ خطأ غير متوقع / Unexpected error {item}: {e}")
                conn.rollback()
            
            time.sleep(args.delay)

    finally:
        # Ensure database connection is always closed
        if 'conn' in locals():
            conn.close()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 Processing Summary / ملخص المعالجة")
    print("=" * 60)
    print(f"✅ Successful: {success_count}")
    print(f"❌ Errors: {error_count}")
    print(f"📊 Total: {len(items)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
