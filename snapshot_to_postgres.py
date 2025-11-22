#!/usr/bin/env python3
"""
سكربت لإرسال صور/روابط إلى Plate Recognizer Snapshot API وتخزين النتائج في PostgreSQL.
يدعم تخزين الصور في S3 أو قاعدة البيانات مباشرة.

ملاحظات:
- عدّل SNAPSHOT_API_URL حسب الوثائق الرسمية (https://guides.platerecognizer.com/docs/snapshot/getting-started).
- يدعم السكربت إرسال قائمة روابط صور من ملف نصي أو مسارات ملفات محلية.
- الوضع الافتراضي لتخزين الصور هو S3 (STORE_IMAGES=s3)
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
from psycopg2.extras import Json, Binary, register_uuid
from datetime import datetime

load_dotenv()

PLATE_API_KEY = os.getenv("PLATE_API_KEY")
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
STORE_IMAGES = os.getenv("STORE_IMAGES", "s3").lower()  # "s3" or "db"
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
    print("الرجاء ضبط المتغيرات البيئية: PLATE_API_KEY و SNAPSHOT_API_URL و DATABASE_URL")
    sys.exit(1)

# Initialize boto3 client only if STORE_IMAGES is s3
boto3_client = None
if STORE_IMAGES == "s3":
    if not S3_BUCKET or not AWS_REGION:
        print("الرجاء ضبط المتغيرات البيئية: S3_BUCKET و AWS_REGION عند استخدام STORE_IMAGES=s3")
        sys.exit(1)
    try:
        import boto3
        boto3_client = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
    except ImportError:
        print("خطأ: يرجى تثبيت boto3 باستخدام: pip install boto3")
        sys.exit(1)

HEADERS = {
    "Authorization": f"Token {PLATE_API_KEY}"
}

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
    mime_type = None
    if urlparse(path_or_url).scheme in ("http", "https"):
        # محاولة الحصول على MIME type من URL
        mime_type = mimetypes.guess_type(path_or_url)[0]
    else:
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
        
        # إنشاء URL للصورة (عام أو presigned حسب إعدادات الـ bucket)
        s3_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
        
        return s3_url
    except Exception as e:
        print(f"خطأ في رفع الصورة إلى S3: {e}")
        return None

def build_payload_for_image(path_or_url):
    """
    إنشاء payload لإرسال الصورة إلى API
    """
    if urlparse(path_or_url).scheme in ("http", "https"):
        # إن كانت الـ API تدعم إرسال image_url في json body
        return {"image_url": path_or_url}
    else:
        # في حالة الملفات المحلية: سنستعمل رفع multipart في send_request
        return {"local_path": path_or_url}

def send_request(payload, retry_count=3):
    """
    إذا payload يحتوي 'local_path' نرفع الملف كـ multipart، وإلا نرسل JSON مع image_url.
    يتضمن إعادة المحاولة عند فشل الشبكة.
    """
    for attempt in range(retry_count):
        try:
            if "local_path" in payload:
                path = payload["local_path"]
                with open(path, "rb") as fh:
                    files = {"upload": fh}
                    r = requests.post(SNAPSHOT_API_URL, headers=HEADERS, files=files, timeout=60)
            else:
                r = requests.post(SNAPSHOT_API_URL, headers={**HEADERS, "Content-Type": "application/json"}, json=payload, timeout=60)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.RequestException as e:
            if attempt < retry_count - 1:
                print(f"محاولة {attempt + 1} فشلت، إعادة المحاولة...")
                time.sleep(2 ** attempt)  # exponential backoff
            else:
                raise e

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
            Json(record["makes_models"]),
            Json(record["colors"]),
            Json(record["bbox"]),
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
    parser = argparse.ArgumentParser(description="Send images to Plate Recognizer snapshot and store results")
    parser.add_argument("--images", required=True, help="ملف نصي يحتوي على مسار/URL لكل صورة في سطر مستقل")
    parser.add_argument("--delay", type=float, default=0.5, help="تأخير بين الطلبات بالثواني")
    parser.add_argument("--confidence-threshold", type=float, default=0.0, 
                       help="الحد الأدنى للثقة في نتيجة اللوحة (0.0-1.0)")
    args = parser.parse_args()

    with open(args.images, "r") as f:
        items = [line.strip() for line in f if line.strip()]

    conn = psycopg2.connect(DATABASE_URL)
    register_uuid()

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
                    print(f"فشل رفع الصورة إلى S3: {item}")
                    continue
            elif STORE_IMAGES == "db":
                # تخزين في قاعدة البيانات
                image_data_to_store = image_bytes
            
            # 4. إرسال إلى Plate Recognizer API
            payload = build_payload_for_image(item)
            try:
                resp = send_request(payload)
            except Exception as e:
                print(f"خطأ عند إرسال {item}: {e}")
                time.sleep(args.delay)
                continue
            
            # 5. استخراج البيانات من الرد
            record = parse_and_normalize_response(resp)
            
            # 6. فحص حد الثقة
            if record["plate_confidence"] is not None:
                if record["plate_confidence"] < args.confidence_threshold:
                    print(f"تخطي {item}: الثقة {record['plate_confidence']} أقل من الحد {args.confidence_threshold}")
                    time.sleep(args.delay)
                    continue
            
            # 7. إضافة البيانات الوصفية
            record["snapshot_ref"] = record["snapshot_ref"] or item
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
                print(f"تم إدخال السجل {new_id} للصورة {item}")
            except Exception as e:
                print(f"خطأ في إدخال DB لـ {item}: {e}")
                conn.rollback()
            
        except Exception as e:
            print(f"خطأ في معالجة {item}: {e}")
        
        time.sleep(args.delay)

    conn.close()
    print(f"تمت معالجة {len(items)} صورة")

if __name__ == "__main__":
    main()
