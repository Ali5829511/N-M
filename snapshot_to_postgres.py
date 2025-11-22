#!/usr/bin/env python3
<<<<<<< HEAD
# -*- coding: utf-8 -*-
"""
Plate Recognizer Snapshot API Integration with PostgreSQL
يدمج بيانات التعرف على اللوحات من Snapshot API مع قاعدة بيانات PostgreSQL

This script reads image paths/URLs from a text file, sends them to
Plate Recognizer Snapshot API, and stores the results in PostgreSQL.
=======
"""
سكربت لإرسال صور/روابط إلى Plate Recognizer Snapshot API وتخزين النتائج في PostgreSQL.
يدعم تخزين الصور في S3 أو قاعدة البيانات مباشرة.

ملاحظات:
- عدّل SNAPSHOT_API_URL حسب الوثائق الرسمية (https://guides.platerecognizer.com/docs/snapshot/getting-started).
- يدعم السكربت إرسال قائمة روابط صور من ملف نصي أو مسارات ملفات محلية.
- الوضع الافتراضي لتخزين الصور هو S3 (STORE_IMAGES=s3)
>>>>>>> origin/main
"""

import os
import sys
<<<<<<< HEAD
import time
import json
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse

from dotenv import load_dotenv
from tqdm import tqdm
import psycopg2
from psycopg2.extras import Json
from sqlalchemy import create_engine, text
=======
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
>>>>>>> origin/main

# Load environment variables
load_dotenv()

<<<<<<< HEAD

def is_url(path: str) -> bool:
    """Check if path is a URL"""
    try:
        result = urlparse(path)
        return all([result.scheme, result.netloc])
    except (ValueError, TypeError, AttributeError):
        return False

# Configuration from environment variables
PLATE_API_KEY = os.getenv('PLATE_API_KEY')
SNAPSHOT_API_URL = os.getenv('SNAPSHOT_API_URL', 'https://api.platerecognizer.com/v1/plate-reader/')
DATABASE_URL = os.getenv('DATABASE_URL')
REQUEST_DELAY = float(os.getenv('REQUEST_DELAY', '1.0'))  # Delay between requests in seconds

# Validate required configuration
if not PLATE_API_KEY:
    print("❌ Error: PLATE_API_KEY environment variable is not set")
    print("   Please set it in your .env file")
    sys.exit(1)

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL environment variable is not set")
    print("   Please set it in your .env file")
    sys.exit(1)


class PlateRecognizerClient:
    """Client for interacting with Plate Recognizer Snapshot API"""
    
    def __init__(self, api_key: str, api_url: str):
        self.api_key = api_key
        self.api_url = api_url
        self.headers = {'Authorization': f'Token {api_key}'}
    
    def recognize_from_file(self, image_path: str, camera_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send local image file to Plate Recognizer API
        
        Args:
            image_path: Path to local image file
            camera_id: Optional camera identifier
            
        Returns:
            API response as dictionary
        """
        if not Path(image_path).exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        with open(image_path, 'rb') as fp:
            files = {'upload': fp}
            data = {}
            if camera_id:
                data['camera_id'] = camera_id
            
            response = requests.post(
                self.api_url,
                headers=self.headers,
                files=files,
                data=data
            )
            response.raise_for_status()
            return response.json()
    
    def recognize_from_url(self, image_url: str, camera_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send image URL to Plate Recognizer API
        
        Args:
            image_url: URL of the image
            camera_id: Optional camera identifier
            
        Returns:
            API response as dictionary
        """
        data = {'image_url': image_url}
        if camera_id:
            data['camera_id'] = camera_id
        
        response = requests.post(
            self.api_url,
            headers=self.headers,
            data=data
        )
        response.raise_for_status()
        return response.json()
    
    def process_image(self, image_path: str, camera_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process image (auto-detect if file or URL)
        
        Args:
            image_path: Path to image file or image URL
            camera_id: Optional camera identifier
            
        Returns:
            API response as dictionary
        """
        if is_url(image_path):
            return self.recognize_from_url(image_path, camera_id)
        else:
            return self.recognize_from_file(image_path, camera_id)


class PostgreSQLStorage:
    """Handle storage of plate recognition results in PostgreSQL"""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.engine = create_engine(database_url)
    
    def insert_snapshot(self, api_response: Dict[str, Any], image_source: str) -> Optional[str]:
        """
        Insert snapshot data into PostgreSQL
        
        Args:
            api_response: Response from Plate Recognizer API
            image_source: Original image path or URL
            
        Returns:
            UUID of inserted record, or None on error
        """
        try:
            # Extract relevant fields from API response
            results = api_response.get('results', [])
            
            # For each detected plate, create a record
            inserted_ids = []
            
            with self.engine.connect() as conn:
                for result in results:
                    plate_text = result.get('plate', '')
                    plate_confidence = result.get('score', 0.0)
                    
                    # Extract vehicle information
                    vehicle = result.get('vehicle', {})
                    makes_models = []
                    colors = []
                    
                    if vehicle:
                        # Vehicle type/make/model information
                        vehicle_type = vehicle.get('type')
                        if vehicle_type:
                            makes_models.append({'type': vehicle_type})
                    
                        # Color information
                        vehicle_color = vehicle.get('color')
                        if vehicle_color:
                            colors.append(vehicle_color)
                    
                    # Bounding box
                    bbox = result.get('box', {})
                    
                    # Region information
                    region = result.get('region', {})
                    
                    # Camera ID from API response
                    camera_id = api_response.get('camera_id')
                    
                    # Timestamp
                    timestamp_str = api_response.get('timestamp')
                    if timestamp_str:
                        try:
                            captured_at = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                        except (ValueError, AttributeError):
                            captured_at = datetime.utcnow()
                    else:
                        captured_at = datetime.utcnow()
                    
                    # Prepare metadata
                    meta = {
                        'region': region,
                        'candidates': result.get('candidates', []),
                        'processing_time': api_response.get('processing_time'),
                        'image_source': image_source
                    }
                    
                    # Insert query
                    query = text("""
                        INSERT INTO vehicle_snapshots (
                            snapshot_ref,
                            camera_id,
                            captured_at,
                            plate_text,
                            plate_confidence,
                            makes_models,
                            colors,
                            bbox,
                            raw_response,
                            image_url,
                            meta
                        ) VALUES (
                            :snapshot_ref,
                            :camera_id,
                            :captured_at,
                            :plate_text,
                            :plate_confidence,
                            :makes_models::jsonb,
                            :colors::jsonb,
                            :bbox::jsonb,
                            :raw_response::jsonb,
                            :image_url,
                            :meta::jsonb
                        ) RETURNING id
                    """)
                    
                    result_proxy = conn.execute(query, {
                        'snapshot_ref': f"snap_{int(time.time() * 1000)}",
                        'camera_id': camera_id,
                        'captured_at': captured_at,
                        'plate_text': plate_text,
                        'plate_confidence': plate_confidence,
                        'makes_models': json.dumps(makes_models),
                        'colors': json.dumps(colors),
                        'bbox': json.dumps(bbox),
                        'raw_response': json.dumps(api_response),
                        'image_url': image_source if is_url(image_source) else None,
                        'meta': json.dumps(meta)
                    })
                    
                    conn.commit()
                    
                    record_id = result_proxy.fetchone()[0]
                    inserted_ids.append(str(record_id))
            
            return inserted_ids[0] if inserted_ids else None
            
        except Exception as e:
            print(f"❌ Database error ({type(e).__name__}): {str(e)}")
            import traceback
            traceback.print_exc()
            return None


def read_image_list(file_path: str) -> List[str]:
    """
    Read list of image paths/URLs from text file
    
    Args:
        file_path: Path to text file containing image paths/URLs (one per line)
        
    Returns:
        List of image paths/URLs
    """
    if not Path(file_path).exists():
        raise FileNotFoundError(f"Image list file not found: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip() and not line.startswith('#')]
    
    return lines


def main():
    """Main execution function"""
    print("=" * 60)
    print("🚗 Plate Recognizer Snapshot to PostgreSQL")
    print("   التعرف على اللوحات وحفظها في قاعدة البيانات")
    print("=" * 60)
    print()
    
    # Get image list file from command line or use default
    if len(sys.argv) > 1:
        image_list_file = sys.argv[1]
    else:
        image_list_file = 'images.txt'
    
    print(f"📁 Reading image list from: {image_list_file}")
    
    try:
        image_paths = read_image_list(image_list_file)
        print(f"✅ Found {len(image_paths)} images to process")
        print()
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print(f"   Please create {image_list_file} with image paths/URLs (one per line)")
        sys.exit(1)
    
    # Initialize clients
    print("🔧 Initializing API client and database connection...")
    client = PlateRecognizerClient(PLATE_API_KEY, SNAPSHOT_API_URL)
    storage = PostgreSQLStorage(DATABASE_URL)
    print("✅ Initialization complete")
    print()
    
    # Process images
    print(f"🚀 Processing {len(image_paths)} images...")
    print(f"   Delay between requests: {REQUEST_DELAY}s")
    print()
    
    success_count = 0
    error_count = 0
    
    for idx, image_path in enumerate(tqdm(image_paths, desc="Processing"), 1):
        try:
            # Call API
            api_response = client.process_image(image_path)
            
            # Check if plates were detected
            results = api_response.get('results', [])
            if not results:
                print(f"⚠️  No plates detected in: {image_path}")
                error_count += 1
                continue
            
            # Store in database
            record_id = storage.insert_snapshot(api_response, image_path)
            
            if record_id:
                plates_found = [r.get('plate', 'N/A') for r in results]
                print(f"✅ [{idx}/{len(image_paths)}] Processed: {image_path}")
                print(f"   Plates detected: {', '.join(plates_found)}")
                print(f"   Record ID: {record_id}")
                success_count += 1
            else:
                print(f"❌ [{idx}/{len(image_paths)}] Failed to store: {image_path}")
                error_count += 1
            
        except requests.exceptions.HTTPError as e:
            print(f"❌ [{idx}/{len(image_paths)}] API error for {image_path}: {str(e)}")
            error_count += 1
        except FileNotFoundError as e:
            print(f"❌ [{idx}/{len(image_paths)}] File not found: {image_path}")
            error_count += 1
        except Exception as e:
            print(f"❌ [{idx}/{len(image_paths)}] Unexpected error ({type(e).__name__}) for {image_path}: {str(e)}")
            error_count += 1
        
        # Delay between requests to avoid rate limiting
        if idx < len(image_paths):
            time.sleep(REQUEST_DELAY)
    
    # Summary
    print()
    print("=" * 60)
    print("📊 Processing Summary / ملخص المعالجة")
    print("=" * 60)
    print(f"✅ Successful: {success_count}")
    print(f"❌ Errors: {error_count}")
    print(f"📝 Total: {len(image_paths)}")
    print()
    
    if success_count > 0:
        print("✅ Data successfully stored in PostgreSQL!")
        print("   البيانات محفوظة بنجاح في قاعدة البيانات")
    else:
        print("⚠️  No data was stored. Please check the errors above.")
        print("   لم يتم حفظ أي بيانات. يرجى مراجعة الأخطاء أعلاه")


if __name__ == '__main__':
=======
# Required environment variables (will be validated in main())
PLATE_API_KEY = os.getenv("PLATE_API_KEY")
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
STORE_IMAGES = os.getenv("STORE_IMAGES", "s3").lower()  # "s3" or "db"
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Global variables initialized in main()
boto3_client = None
HEADERS = {}


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
    Send image to Plate Recognizer API and return response.
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
                SNAPSHOT_API_URL,
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
        description="Send images to Plate Recognizer snapshot and store results",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Example usage:
  python snapshot_to_postgres.py --images images.txt --delay 1.0 --confidence-threshold 0.8

Environment variables required:
  PLATE_API_KEY, SNAPSHOT_API_URL, DATABASE_URL
  For S3: S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
        """
    )
    parser.add_argument("--images", required=True, help="ملف نصي يحتوي على مسار/URL لكل صورة في سطر مستقل")
    parser.add_argument("--delay", type=float, default=0.5, help="تأخير بين الطلبات بالثواني")
    parser.add_argument("--confidence-threshold", type=float, default=0.0, 
                       help="الحد الأدنى للثقة في نتيجة اللوحة (0.0-1.0)")
    args = parser.parse_args()
    
    # Validate environment variables after parsing args (so --help works without env vars)
    global boto3_client, HEADERS
    
    if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
        print("ERROR: Please set required environment variables: PLATE_API_KEY, SNAPSHOT_API_URL, DATABASE_URL")
        sys.exit(1)
    
    HEADERS = {
        "Authorization": f"Token {PLATE_API_KEY}"
    }
    
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
>>>>>>> origin/main
    main()
