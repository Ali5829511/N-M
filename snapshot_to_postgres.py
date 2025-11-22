#!/usr/bin/env python3
"""
سكربت لإرسال صور/روابط إلى Plate Recognizer Snapshot API وتخزين النتائج في PostgreSQL.

ملاحظات:
- عدّل SNAPSHOT_API_URL حسب الوثائق الرسمية (https://guides.platerecognizer.com/docs/snapshot/getting-started).
- يدعم السكربت إرسال قائمة روابط صور من ملف نصي أو مسارات ملفات محلية.
- يدعم تخزين الصور في S3 أو في قاعدة البيانات مباشرة.
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

PLATE_API_KEY = os.getenv("PLATE_API_KEY")
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
STORE_IMAGES = os.getenv("STORE_IMAGES", "s3")  # Default to S3 storage
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Conditionally import boto3 only if S3 storage is enabled
boto3 = None
if STORE_IMAGES == "s3":
    try:
        import boto3
    except ImportError:
        print("تحذير: boto3 غير مثبت. يرجى تثبيته لاستخدام تخزين S3.")
        sys.exit(1)

if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
    print("الرجاء ضبط المتغيرات البيئية: PLATE_API_KEY و SNAPSHOT_API_URL و DATABASE_URL")
    sys.exit(1)

if STORE_IMAGES == "s3" and not S3_BUCKET:
    print("الرجاء ضبط S3_BUCKET عند استخدام STORE_IMAGES=s3")
    sys.exit(1)

HEADERS = {
    "Authorization": f"Token {PLATE_API_KEY}"
}

def calculate_sha256(data):
    """حساب SHA256 hash للبيانات"""
    return hashlib.sha256(data).hexdigest()

def get_mime_type(path_or_url):
    """تحديد MIME type للصورة"""
    mime_type, _ = mimetypes.guess_type(path_or_url)
    return mime_type or "application/octet-stream"

def fetch_image_bytes(path_or_url):
    """جلب بايتات الصورة من URL أو ملف محلي"""
    if urlparse(path_or_url).scheme in ("http", "https"):
        response = requests.get(path_or_url, timeout=30)
        response.raise_for_status()
        return response.content
    else:
        with open(path_or_url, "rb") as f:
            return f.read()

def upload_to_s3(image_bytes, filename):
    """رفع الصورة إلى S3 والحصول على URL"""
    # Support MinIO by checking for custom endpoint
    endpoint_url = os.getenv("AWS_ENDPOINT_URL")
    
    s3_client_config = {
        'aws_access_key_id': AWS_ACCESS_KEY_ID,
        'aws_secret_access_key': AWS_SECRET_ACCESS_KEY,
        'region_name': AWS_REGION
    }
    
    if endpoint_url:
        s3_client_config['endpoint_url'] = endpoint_url
    
    s3_client = boto3.client('s3', **s3_client_config)
    
    key = f"vehicle-snapshots/{filename}"
    s3_client.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=image_bytes,
        ContentType=get_mime_type(filename)
    )
    
    # Generate URL based on endpoint configuration
    if endpoint_url:
        # MinIO or custom S3-compatible endpoint
        s3_url = f"{endpoint_url}/{S3_BUCKET}/{key}"
    else:
        # AWS S3 standard URL
        s3_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
    
    # For private bucket, use presigned URL (valid for 1 year):
    # s3_url = s3_client.generate_presigned_url(
    #     'get_object',
    #     Params={'Bucket': S3_BUCKET, 'Key': key},
    #     ExpiresIn=31536000
    # )
    
    return s3_url

# Helper: قراءة صورة محلياً أو إرسال عنوان URL مباشرة
def build_payload_for_image(path_or_url):
    # يفضّل استخدام خاصية API التي تقبل url بدلاً من رفع الملفات إن أمكن
    if urlparse(path_or_url).scheme in ("http", "https"):
        # إن كانت الـ API تدعم إرسال image_url في json body
        return {"image_url": path_or_url}
    else:
        # في حالة الملفات المحلية: سنستعمل رفع multipart في send_request
        return {"local_path": path_or_url}

def send_request(payload, retries=3):
    """
    إذا payload يحتوي 'local_path' نرفع الملف كـ multipart، وإلا نرسل JSON مع image_url.
    يدعم retry بسيط عند أخطاء الشبكة.
    """
    for attempt in range(retries):
        try:
            if "local_path" in payload:
                path = payload["local_path"]
                with open(path, "rb") as fh:
                    files = {"image": fh}
                    # تأكد من حقل الملف حسب ما تطلبه الوثائق (قد يكون 'upload' أو 'image')
                    r = requests.post(SNAPSHOT_API_URL, headers=HEADERS, files=files, timeout=60)
            else:
                r = requests.post(SNAPSHOT_API_URL, headers={**HEADERS, "Content-Type": "application/json"}, json=payload, timeout=60)
            r.raise_for_status()
            return r.json()
        except (requests.exceptions.RequestException, requests.exceptions.Timeout) as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                raise

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
            (snapshot_ref, camera_id, captured_at, plate_text, plate_confidence, makes_models, colors, bbox, 
             raw_response, image_url, image_data, image_mime, image_size, image_sha256, meta)
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
            record.get("image_url"),
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
    parser = argparse.ArgumentParser(description="Send images to Plate Recognizer snapshot and store results")
    parser.add_argument("--images", required=True, help="ملف نصي يحتوي على مسار/URL لكل صورة في سطر مستقل")
    parser.add_argument("--delay", type=float, default=0.5, help="تأخير بين الطلبات بالثواني")
    parser.add_argument("--confidence-threshold", type=float, default=0.0, help="حد أدنى للثقة في قراءة اللوحة")
    args = parser.parse_args()

    with open(args.images, "r") as f:
        items = [line.strip() for line in f if line.strip()]

    conn = psycopg2.connect(DATABASE_URL)
    register_uuid()

    for item in tqdm(items, desc="Processing images"):
        try:
            # جلب بايتات الصورة وحساب المعلومات
            image_bytes = fetch_image_bytes(item)
            image_sha256 = calculate_sha256(image_bytes)
            image_mime = get_mime_type(item)
            image_size = len(image_bytes)
            
            # التعامل مع التخزين
            image_url = None
            image_data = None
            
            if STORE_IMAGES == "s3":
                # رفع إلى S3
                filename = f"{image_sha256}{os.path.splitext(item)[1] or '.jpg'}"
                image_url = upload_to_s3(image_bytes, filename)
            elif STORE_IMAGES == "db":
                # تخزين في قاعدة البيانات
                image_data = psycopg2.Binary(image_bytes)
            
            # إرسال إلى Plate Recognizer API
            # إذا كانت صورة على الإنترنت وليست مرفوعة على S3، استخدم الـ URL الأصلي
            if urlparse(item).scheme in ("http", "https") and STORE_IMAGES != "s3":
                payload = {"image_url": item}
            elif image_url:
                payload = {"image_url": image_url}
            else:
                payload = {"local_path": item}
            
            resp = send_request(payload)
            
        except Exception as e:
            print(f"\nخطأ عند معالجة {item}: {e}")
            time.sleep(args.delay)
            continue

        record = parse_and_normalize_response(resp)
        
        # تطبيق حد الثقة
        if record["plate_confidence"] and record["plate_confidence"] < args.confidence_threshold:
            print(f"\nتم تجاهل {item}: الثقة {record['plate_confidence']} أقل من الحد الأدنى {args.confidence_threshold}")
            time.sleep(args.delay)
            continue
        
        record["snapshot_ref"] = record["snapshot_ref"] or item
        
        # إضافة معلومات الصورة
        if not record.get("image_url") and image_url:
            record["image_url"] = image_url
        elif not record.get("image_url") and urlparse(item).scheme in ("http", "https"):
            record["image_url"] = item
            
        record["image_data"] = image_data
        record["image_mime"] = image_mime
        record["image_size"] = image_size
        record["image_sha256"] = image_sha256

        try:
            new_id = insert_into_db(conn, record)
        except Exception as e:
            print(f"\nخطأ في إدخال DB لـ {item}: {e}")
            conn.rollback()
        time.sleep(args.delay)

    conn.close()

if __name__ == "__main__":
    main()
