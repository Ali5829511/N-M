#!/usr/bin/env python3
"""
سكربت لإرسال صور/روابط إلى Plate Recognizer Snapshot API وتخزين النتائج في PostgreSQL.

ملاحظات:
- عدّل SNAPSHOT_API_URL حسب الوثائق الرسمية (https://guides.platerecognizer.com/docs/snapshot/getting-started).
- يدعم السكربت إرسال قائمة روابط صور من ملف نصي أو مسارات ملفات محلية.
"""

import os
import sys
import argparse
import json
import time
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv
from tqdm import tqdm
import psycopg2
from psycopg2.extras import Json, register_uuid
from datetime import datetime

load_dotenv()

PLATE_API_KEY = os.getenv("PLATE_API_KEY")
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")  # ضع هنا endpoint كما في الوثائق
DATABASE_URL = os.getenv("DATABASE_URL")

if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
    print("الرجاء ضبط المتغيرات البيئية: PLATE_API_KEY و SNAPSHOT_API_URL و DATABASE_URL")
    sys.exit(1)

HEADERS = {
    "Authorization": f"Token {PLATE_API_KEY}"
}

# Helper: قراءة صورة محلياً أو إرسال عنوان URL مباشرة
def build_payload_for_image(path_or_url):
    # يفضّل استخدام خاصية API التي تقبل url بدلاً من رفع الملفات إن أمكن
    if urlparse(path_or_url).scheme in ("http", "https"):
        # إن كانت الـ API تدعم إرسال image_url في json body
        return {"image_url": path_or_url}
    else:
        # في حالة الملفات المحلية: سنستعمل رفع multipart في send_request
        return {"local_path": path_or_url}

def send_request(payload):
    """
    إذا payload يحتوي 'local_path' نرفع الملف كـ multipart، وإلا نرسل JSON مع image_url.
    """
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
            (snapshot_ref, camera_id, captured_at, plate_text, plate_confidence, makes_models, colors, bbox, raw_response, image_url, meta)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
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
            Json(record["meta"])
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id

def main():
    parser = argparse.ArgumentParser(description="Send images to Plate Recognizer snapshot and store results")
    parser.add_argument("--images", required=True, help="ملف نصي يحتوي على مسار/URL لكل صورة في سطر مستقل")
    parser.add_argument("--delay", type=float, default=0.5, help="تأخير بين الطلبات بالثواني")
    args = parser.parse_args()

    with open(args.images, "r") as f:
        items = [line.strip() for line in f if line.strip()]

    conn = psycopg2.connect(DATABASE_URL)
    register_uuid()

    for item in tqdm(items, desc="Processing images"):
        payload = build_payload_for_image(item)
        try:
            resp = send_request(payload)
        except Exception as e:
            print(f"خطأ عند إرسال {item}: {e}")
            time.sleep(args.delay)
            continue

        record = parse_and_normalize_response(resp)
        record["snapshot_ref"] = record["snapshot_ref"] or item
        if not record["image_url"] and urlparse(item).scheme in ("http", "https"):
            record["image_url"] = item

        try:
            new_id = insert_into_db(conn, record)
        except Exception as e:
            print(f"خطأ في إدخال DB لـ {item}: {e}")
            conn.rollback()
        time.sleep(args.delay)

    conn.close()

if __name__ == "__main__":
    main()
