#!/usr/bin/env python3
"""
سكربت لإرسال صور/روابط إلى Plate Recognizer Snapshot API وتخزين النتائج في PostgreSQL.

ملاحظات:
- عدّل SNAPSHOT_API_URL حسب الوثائق الرسمية (https://guides.platerecognizer.com/docs/snapshot/getting-started).
- يدعم السكربت إرسال قائمة روابط صور من ملف نصي أو مسارات ملفات محلية.
- يدعم تخزين الصور في S3 (افتراضي) أو في قاعدة البيانات (STORE_IMAGES=db)
"""

import os
import sys
import argparse
import json
import time
import hashlib
import mimetypes
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv
from tqdm import tqdm
import psycopg2
from psycopg2.extras import Json, register_uuid
from datetime import datetime

load_dotenv()

def validate_environment():
    """Validate required environment variables"""
    PLATE_API_KEY = os.getenv("PLATE_API_KEY")
    SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
    DATABASE_URL = os.getenv("DATABASE_URL")
    STORE_IMAGES = os.getenv("STORE_IMAGES", "s3")
    
    if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
        print("الرجاء ضبط المتغيرات البيئية: PLATE_API_KEY و SNAPSHOT_API_URL و DATABASE_URL")
        sys.exit(1)
    
    if STORE_IMAGES == "s3":
        S3_BUCKET = os.getenv("S3_BUCKET")
        AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
        AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
        
        if not S3_BUCKET or not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
            print("الرجاء ضبط متغيرات S3: S3_BUCKET و AWS_ACCESS_KEY_ID و AWS_SECRET_ACCESS_KEY")
            sys.exit(1)
    
    return {
        'PLATE_API_KEY': PLATE_API_KEY,
        'SNAPSHOT_API_URL': SNAPSHOT_API_URL,
        'DATABASE_URL': DATABASE_URL,
        'STORE_IMAGES': STORE_IMAGES,
        'S3_BUCKET': os.getenv("S3_BUCKET"),
        'AWS_ACCESS_KEY_ID': os.getenv("AWS_ACCESS_KEY_ID"),
        'AWS_SECRET_ACCESS_KEY': os.getenv("AWS_SECRET_ACCESS_KEY"),
        'AWS_REGION': os.getenv("AWS_REGION", "us-east-1")
    }

# Helper functions
def calculate_sha256(data):
    """حساب SHA256 hash للبيانات"""
    return hashlib.sha256(data).hexdigest()

def detect_mime_type(path_or_url, data=None):
    """تحديد MIME type للصورة"""
    if data and data[:4] == b'\x89PNG':
        return 'image/png'
    elif data and data[:3] == b'\xff\xd8\xff':
        return 'image/jpeg'
    elif data and data[:6] in (b'GIF87a', b'GIF89a'):
        return 'image/gif'
    
    mime_type, _ = mimetypes.guess_type(path_or_url)
    return mime_type or 'application/octet-stream'

def upload_to_s3(image_bytes, sha256_hash, mime_type, config):
    """رفع الصورة إلى S3 وإرجاع URL"""
    try:
        import boto3
        
        s3_client = boto3.client(
            's3',
            aws_access_key_id=config['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=config['AWS_SECRET_ACCESS_KEY'],
            region_name=config['AWS_REGION']
        )
        
        # استخدام SHA256 كاسم الملف لتجنب التكرار
        ext = mimetypes.guess_extension(mime_type) or '.jpg'
        key = f"vehicle-snapshots/{sha256_hash}{ext}"
        
        s3_client.put_object(
            Bucket=config['S3_BUCKET'],
            Key=key,
            Body=image_bytes,
            ContentType=mime_type,
            ACL='public-read'  # يمكن تغييره حسب الحاجة
        )
        
        # إرجاع URL العام
        url = f"https://{config['S3_BUCKET']}.s3.{config['AWS_REGION']}.amazonaws.com/{key}"
        return url
    except ImportError:
        print("الرجاء تثبيت boto3: pip install boto3")
        return None
    except Exception as e:
        print(f"خطأ في رفع الصورة إلى S3: {e}")
        return None

def fetch_image_bytes(path_or_url):
    """جلب بايتات الصورة من URL أو ملف محلي"""
    if urlparse(path_or_url).scheme in ("http", "https"):
        response = requests.get(path_or_url, timeout=30)
        response.raise_for_status()
        return response.content
    else:
        with open(path_or_url, "rb") as f:
            return f.read()

# Helper: قراءة صورة محلياً أو إرسال عنوان URL مباشرة
def build_payload_for_image(path_or_url):
    # يفضّل استخدام خاصية API التي تقبل url بدلاً من رفع الملفات إن أمكن
    if urlparse(path_or_url).scheme in ("http", "https"):
        # إن كانت الـ API تدعم إرسال image_url في json body
        return {"image_url": path_or_url}
    else:
        # في حالة الملفات المحلية: سنستعمل رفع multipart في send_request
        return {"local_path": path_or_url}

def send_request(payload, config):
    """
    إذا payload يحتوي 'local_path' نرفع الملف كـ multipart، وإلا نرسل JSON مع image_url.
    """
    headers = {
        "Authorization": f"Token {config['PLATE_API_KEY']}"
    }
    
    if "local_path" in payload:
        path = payload["local_path"]
        with open(path, "rb") as fh:
            files = {"image": fh}
            # تأكد من حقل الملف حسب ما تطلبه الوثائق (قد يكون 'upload' أو 'image')
            r = requests.post(config['SNAPSHOT_API_URL'], headers=headers, files=files, timeout=60)
    else:
        r = requests.post(config['SNAPSHOT_API_URL'], headers={**headers, "Content-Type": "application/json"}, json=payload, timeout=60)
    r.raise_for_status()
    return r.json()

def parse_and_normalize_response(resp):
    """
    استخرج الحقول المهمة من ردّ Plate Recognizer.
    بما أن الرد قد يختلف حسب إعدادات النموذج، ستخزن الرد الخام أيضاً.
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
        plate = r0.get("plate") or r0.get("plate_info") or {}
        if isinstance(plate, dict):
            out["plate_text"] = plate.get("plate") or plate.get("number") or out["plate_text"]
            out["plate_confidence"] = plate.get("confidence") or out["plate_confidence"]
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
            Json(record["makes_models"]),
            Json(record["colors"]),
            Json(record["bbox"]),
            Json(record["raw_response"]),
            record["image_url"],
            record.get("image_data"),
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
                        help="الحد الأدنى لثقة اللوحة (0.0-1.0)")
    parser.add_argument("--retries", type=int, default=3, help="عدد محاولات إعادة الإرسال عند الفشل")
    args = parser.parse_args()
    
    # Validate environment after parsing args (allows --help without env vars)
    config = validate_environment()

    with open(args.images, "r") as f:
        items = [line.strip() for line in f if line.strip()]

    conn = psycopg2.connect(config['DATABASE_URL'])
    register_uuid()

    for item in tqdm(items, desc="Processing images"):
        # جلب بايتات الصورة
        try:
            image_bytes = fetch_image_bytes(item)
            image_sha256 = calculate_sha256(image_bytes)
            image_mime = detect_mime_type(item, image_bytes)
            image_size = len(image_bytes)
        except Exception as e:
            print(f"خطأ في جلب الصورة {item}: {e}")
            time.sleep(args.delay)
            continue

        # إعادة المحاولة عند الفشل
        resp = None
        for attempt in range(args.retries):
            payload = build_payload_for_image(item)
            try:
                resp = send_request(payload, config)
                break
            except Exception as e:
                if attempt == args.retries - 1:
                    print(f"خطأ عند إرسال {item} بعد {args.retries} محاولات: {e}")
                    break
                time.sleep(args.delay * (attempt + 1))
        
        if not resp:
            continue

        record = parse_and_normalize_response(resp)
        
        # تطبيق مرشح الثقة
        if record["plate_confidence"] and record["plate_confidence"] < args.confidence_threshold:
            print(f"تجاهل {item}: الثقة ({record['plate_confidence']}) أقل من الحد الأدنى ({args.confidence_threshold})")
            time.sleep(args.delay)
            continue
        
        record["snapshot_ref"] = record["snapshot_ref"] or item
        record["image_sha256"] = image_sha256
        record["image_mime"] = image_mime
        record["image_size"] = image_size
        
        # التعامل مع تخزين الصورة
        if config['STORE_IMAGES'] == "s3":
            # رفع الصورة إلى S3
            s3_url = upload_to_s3(image_bytes, image_sha256, image_mime, config)
            if s3_url:
                record["image_url"] = s3_url
            elif not record["image_url"] and urlparse(item).scheme in ("http", "https"):
                record["image_url"] = item
            record["image_data"] = None
        else:  # STORE_IMAGES == "db"
            # تخزين الصورة في قاعدة البيانات
            record["image_data"] = psycopg2.Binary(image_bytes)
            if not record["image_url"] and urlparse(item).scheme in ("http", "https"):
                record["image_url"] = item

        try:
            new_id = insert_into_db(conn, record)
            print(f"✓ تم إدخال السجل {new_id} للصورة {item}")
        except Exception as e:
            print(f"خطأ في إدخال DB لـ {item}: {e}")
            conn.rollback()
        
        time.sleep(args.delay)

    conn.close()
    print(f"\nانتهت المعالجة. تم معالجة {len(items)} صورة.")

if __name__ == "__main__":
    main()
