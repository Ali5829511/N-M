#!/usr/bin/env python3
"""
سكربت لإرسال صور/روابط إلى Plate Recognizer API وتخزين النتائج في PostgreSQL.
يدعم تخزين الصور في S3 أو قاعدة البيانات مباشرة.

يدعم نوعين من API:
1. Snapshot API (السحابي): للاستخدام مع خدمة Plate Recognizer السحابية
2. SDK/Server (المحلي): للاستخدام مع Plate Recognizer SDK المستضاف محلياً

ملاحظات:
- عدّل PLATE_API_TYPE لتحديد نوع API (snapshot أو sdk)
- للـ Snapshot API: راجع https://guides.platerecognizer.com/docs/snapshot/getting-started
- للـ SDK/Server: راجع https://guides.platerecognizer.com/docs/tech-references/server
- يدعم السكربت إرسال قائمة روابط صور من ملف نصي أو مسارات ملفات محلية
- الوضع الافتراضي لتخزين الصور هو S3 (STORE_IMAGES=s3)
"""

import os
import sys
import argparse
import hashlib
import mimetypes
import time
from urllib.parse import urlparse
from io import BytesIO
from datetime import datetime

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
PLATE_API_TYPE = os.getenv("PLATE_API_TYPE", "snapshot").lower()  # "snapshot" or "sdk"
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
SDK_API_URL = os.getenv("SDK_API_URL", "http://localhost:8080/v1/plate-reader/")
DATABASE_URL = os.getenv("DATABASE_URL")
STORE_IMAGES = os.getenv("STORE_IMAGES", "s3").lower()  # "s3" or "db"
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Global variables initialized in main()
boto3_client = None
HEADERS = {}
API_URL = None  # Will be set based on PLATE_API_TYPE


def get_image_bytes(path_or_url):
    """
    احصل على بايتات الصورة من ملف محلي أو URL
    """
    if urlparse(path_or_url).scheme in ("http", "https"):
        response = requests.get(path_or_url, timeout=30)
        response.raise_for_status()
        return response.content
    else:
        with open(path_or_url, "rb") as f:
            return f.read()


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


def insert_into_db(conn, record, image_data=None):
    """
    إدخال السجل في قاعدة البيانات
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
            Binary(image_data) if image_data else None,
            record.get("image_mime"),
            record.get("image_size"),
            record.get("image_sha256"),
            Json(record["meta"])
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id



def main():
    parser = argparse.ArgumentParser(
        description="Send images to Plate Recognizer (Snapshot API or SDK/Server) and store results",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Example usage:
  python snapshot_to_postgres.py --images images.txt --delay 1.0 --confidence-threshold 0.8

Environment variables required:
  PLATE_API_KEY, DATABASE_URL
  PLATE_API_TYPE (snapshot or sdk, default: snapshot)
  
  For Snapshot API (cloud):
    SNAPSHOT_API_URL (default: https://api.platerecognizer.com/v1/plate-reader/)
  
  For SDK/Server (on-premise):
    SDK_API_URL (default: http://localhost:8080/v1/plate-reader/)
  
  For S3 storage: 
    S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
        """
    )
    parser.add_argument("--images", required=True, help="ملف نصي يحتوي على مسار/URL لكل صورة في سطر مستقل")
    parser.add_argument("--delay", type=float, default=0.5, help="تأخير بين الطلبات بالثواني")
    parser.add_argument("--confidence-threshold", type=float, default=0.0, 
                       help="الحد الأدنى للثقة في نتيجة اللوحة (0.0-1.0)")
    args = parser.parse_args()
    
    # Validate environment variables after parsing args (so --help works without env vars)
    global boto3_client, HEADERS, API_URL
    
    # Validate API type
    if PLATE_API_TYPE not in ["snapshot", "sdk"]:
        print(f"ERROR: PLATE_API_TYPE must be 'snapshot' or 'sdk', got '{PLATE_API_TYPE}'")
        sys.exit(1)
    
    # Set API URL based on type
    if PLATE_API_TYPE == "snapshot":
        if not SNAPSHOT_API_URL:
            print("ERROR: SNAPSHOT_API_URL must be set when PLATE_API_TYPE=snapshot")
            sys.exit(1)
        API_URL = SNAPSHOT_API_URL
    else:  # sdk
        if not SDK_API_URL:
            print("ERROR: SDK_API_URL must be set when PLATE_API_TYPE=sdk")
            sys.exit(1)
        API_URL = SDK_API_URL
    
    # Validate required environment variables
    if not PLATE_API_KEY or not DATABASE_URL:
        print("ERROR: Please set required environment variables: PLATE_API_KEY, DATABASE_URL")
        sys.exit(1)
    
    # Set authentication header
    # Note: SDK/Server may not require authentication if running locally
    # but we include it for compatibility
    HEADERS = {
        "Authorization": f"Token {PLATE_API_KEY}"
    }
    
    print(f"Using Plate Recognizer API type: {PLATE_API_TYPE}")
    print(f"API endpoint: {API_URL}")
    print()
    
    # Initialize boto3 only if using S3
    if STORE_IMAGES == "s3":
        if not S3_BUCKET:
            print("ERROR: S3_BUCKET must be set when STORE_IMAGES=s3")
            sys.exit(1)
        try:
            import boto3
            
            # Support for MinIO or custom S3-compatible endpoints
            AWS_ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL")
            if AWS_ENDPOINT_URL:
                boto3_client = boto3.client(
                    's3',
                    endpoint_url=AWS_ENDPOINT_URL,
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                    region_name=AWS_REGION
                )
                print(f"Using S3-compatible storage: {S3_BUCKET} at {AWS_ENDPOINT_URL}")
            else:
                boto3_client = boto3.client(
                    's3',
                    region_name=AWS_REGION,
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
                )
                print(f"Using AWS S3 storage: {S3_BUCKET} (region: {AWS_REGION})")
        except ImportError:
            print("ERROR: boto3 is required when STORE_IMAGES=s3. Install it with: pip install boto3")
            sys.exit(1)
    elif STORE_IMAGES == "db":
        print("Using database storage for images")
    else:
        print(f"ERROR: Unknown STORE_IMAGES value '{STORE_IMAGES}'. Must be 's3' or 'db'")
        sys.exit(1)

    # Read images list
    try:
        with open(args.images, "r") as f:
            items = [line.strip() for line in f if line.strip() and not line.strip().startswith('#')]
    except FileNotFoundError:
        print(f"ERROR: Images file not found: {args.images}")
        sys.exit(1)
    
    if not items:
        print("ERROR: No images found in file (empty or all lines are comments)")
        sys.exit(1)
    
    print(f"Processing {len(items)} images...")
    print(f"Storage mode: {STORE_IMAGES}")
    print(f"Confidence threshold: {args.confidence_threshold}")
    print()

    # Connect to database
    try:
        conn = psycopg2.connect(DATABASE_URL)
        register_uuid()
    except Exception as e:
        print(f"ERROR: Cannot connect to database: {e}")
        sys.exit(1)

    # Process images
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    for item in tqdm(items, desc="Processing images"):
        try:
            # 1. احصل على بايتات الصورة
            image_bytes = get_image_bytes(item)
            
            # 2. احسب البيانات الوصفية
            sha256_hash, mime_type, size = calculate_image_metadata(image_bytes, item)
            
            # 3. تخزين الصورة حسب الوضع المحدد
            image_url_stored = None
            image_data_to_store = None
            
            if STORE_IMAGES == "s3":
                # رفع إلى S3
                image_url_stored = upload_to_s3(image_bytes, item, mime_type)
                if not image_url_stored:
                    print(f"  فشل رفع الصورة إلى S3: {item}")
                    error_count += 1
                    time.sleep(args.delay)
                    continue
            elif STORE_IMAGES == "db":
                # تخزين في قاعدة البيانات
                image_data_to_store = image_bytes
            
            # 4. إرسال إلى Plate Recognizer API
            try:
                resp = send_to_plate_recognizer(image_bytes, mime_type)
            except Exception as e:
                print(f"  خطأ عند إرسال {item}: {e}")
                error_count += 1
                time.sleep(args.delay)
                continue
            
            # 5. استخراج البيانات من الرد
            record = parse_plate_recognizer_response(resp, args.confidence_threshold)
            
            # 6. فحص حد الثقة
            if record is None:
                print(f"  تخطي {item}: الثقة أقل من الحد {args.confidence_threshold}")
                skipped_count += 1
                time.sleep(args.delay)
                continue
            
            # 7. إضافة البيانات الوصفية
            record["snapshot_ref"] = record["snapshot_ref"] or sha256_hash
            if STORE_IMAGES == "s3" and image_url_stored:
                record["image_url"] = image_url_stored
            elif not record["image_url"] and urlparse(item).scheme in ("http", "https"):
                record["image_url"] = item
            
            record["image_sha256"] = sha256_hash
            record["image_mime"] = mime_type
            record["image_size"] = size
            
            # 8. إدخال في قاعدة البيانات
            try:
                new_id = insert_into_db(conn, record, image_data_to_store)
                print(f"  ✓ تم إدخال السجل {new_id} للصورة {item}")
                success_count += 1
            except Exception as e:
                print(f"  خطأ في إدخال DB لـ {item}: {e}")
                conn.rollback()
                error_count += 1
            
        except Exception as e:
            print(f"  خطأ في معالجة {item}: {e}")
            error_count += 1
        
        time.sleep(args.delay)

    conn.close()
    print()
    print("=" * 60)
    print(f"تمت معالجة {len(items)} صورة:")
    print(f"  ✓ نجح: {success_count}")
    print(f"  ✗ فشل: {error_count}")
    print(f"  ⊘ متخطى: {skipped_count}")
    print("=" * 60)

if __name__ == "__main__":
    main()
