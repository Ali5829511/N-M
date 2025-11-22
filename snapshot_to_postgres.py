#!/usr/bin/env python3
"""
Script to send images/URLs to Plate Recognizer Snapshot API and store results in PostgreSQL.

Features:
- Support local file paths and HTTP/HTTPS URLs
- Store images in S3 or PostgreSQL (configurable via STORE_IMAGES env variable)
- Compute SHA256 hash, MIME type, and file size for each image
- Filter results by confidence threshold
- Retry mechanism for network errors
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
from psycopg2.extras import Json, register_uuid
from psycopg2 import Binary
from datetime import datetime

load_dotenv()

# Required environment variables
PLATE_API_KEY = os.getenv("PLATE_API_KEY")
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
STORE_IMAGES = os.getenv("STORE_IMAGES", "s3")  # Default: s3, alternative: db

# AWS/S3 configuration (only needed if STORE_IMAGES == "s3")
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
    print("ERROR: Required environment variables not set: PLATE_API_KEY, SNAPSHOT_API_URL, DATABASE_URL")
    sys.exit(1)

# Import boto3 only if needed
boto3_client = None
if STORE_IMAGES == "s3":
    if not S3_BUCKET or not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        print("ERROR: STORE_IMAGES=s3 requires S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY")
        sys.exit(1)
    try:
        import boto3
        boto3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
    except ImportError:
        print("ERROR: boto3 not installed. Run: pip install boto3")
        sys.exit(1)

HEADERS = {
    "Authorization": f"Token {PLATE_API_KEY}"
}

def compute_image_metadata(image_bytes):
    """Compute SHA256 hash, MIME type, and size for image bytes."""
    sha256_hash = hashlib.sha256(image_bytes).hexdigest()
    size = len(image_bytes)
    
    # Determine MIME type from image bytes
    mime_type = None
    if image_bytes.startswith(b'\xff\xd8\xff'):
        mime_type = 'image/jpeg'
    elif image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
        mime_type = 'image/png'
    elif image_bytes.startswith(b'GIF89a') or image_bytes.startswith(b'GIF87a'):
        mime_type = 'image/gif'
    elif image_bytes.startswith(b'RIFF') and image_bytes[8:12] == b'WEBP':
        mime_type = 'image/webp'
    else:
        mime_type = 'application/octet-stream'
    
    return sha256_hash, mime_type, size

def upload_to_s3(image_bytes, sha256_hash, mime_type):
    """Upload image to S3 and return the URL."""
    if not boto3_client:
        raise RuntimeError("S3 client not initialized")
    
    # Use SHA256 as filename to avoid duplicates
    key = f"vehicle-images/{sha256_hash[:2]}/{sha256_hash}.jpg"
    
    try:
        boto3_client.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=image_bytes,
            ContentType=mime_type,
            ACL='public-read'  # Make publicly readable, or use presigned URLs
        )
        # Generate public URL
        url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
        return url
    except Exception as e:
        print(f"ERROR uploading to S3: {e}")
        return None

def fetch_image_bytes(path_or_url):
    """Fetch image bytes from local path or URL."""
    if urlparse(path_or_url).scheme in ("http", "https"):
        response = requests.get(path_or_url, timeout=30)
        response.raise_for_status()
        return response.content
    else:
        with open(path_or_url, "rb") as f:
            return f.read()

def send_request_with_retry(image_bytes, max_retries=3):
    """Send image to Plate Recognizer API with retry mechanism."""
    for attempt in range(max_retries):
        try:
            files = {"upload": BytesIO(image_bytes)}
            response = requests.post(SNAPSHOT_API_URL, headers=HEADERS, files=files, timeout=60)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"  Retry {attempt + 1}/{max_retries} after error: {e}. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
    return None

def parse_and_normalize_response(resp, confidence_threshold):
    """
    Extract important fields from Plate Recognizer response.
    Filter by confidence threshold if specified.
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

    results = resp.get("results") or resp.get("vehicles") or []
    
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
            out["plate_confidence"] = plate.get("score") or plate.get("confidence") or out["plate_confidence"]
        
        # Check confidence threshold
        if confidence_threshold and out["plate_confidence"] is not None:
            if float(out["plate_confidence"]) < confidence_threshold:
                return None  # Skip this result
        
        # Extract vehicle information
        mm = r0.get("vehicle") or r0.get("vehicle_info") or {}
        if mm:
            out["makes_models"] = mm.get("predictions") or mm.get("makes_models") or mm
        
        # Extract color information
        colors = r0.get("color") or r0.get("colors")
        if colors:
            out["colors"] = colors
        
        # Extract bounding box
        bbox = r0.get("box") or r0.get("bounding_box") or r0.get("bbox")
        if bbox:
            out["bbox"] = bbox
        
        # Extract timestamp
        if r0.get("timestamp"):
            try:
                out["captured_at"] = datetime.fromisoformat(r0.get("timestamp").replace('Z', '+00:00'))
            except Exception:
                out["captured_at"] = None
        
        if r0.get("image_url"):
            out["image_url"] = r0.get("image_url")

    return out

def insert_into_db(conn, record):
    """Insert record into vehicle_snapshots table."""
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
            record.get("image_data"),  # Binary data or None
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
        help="Text file containing image path/URL per line"
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
        default=None,
        help="Minimum confidence threshold (0-1) to store results (default: None, store all)"
    )
    args = parser.parse_args()

    print(f"Configuration:")
    print(f"  STORE_IMAGES: {STORE_IMAGES}")
    print(f"  Confidence threshold: {args.confidence_threshold or 'None (store all)'}")
    print(f"  Delay: {args.delay}s")
    print()

    # Read image list
    with open(args.images, "r") as f:
        items = [line.strip() for line in f if line.strip()]
    
    print(f"Found {len(items)} images to process\n")

    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    register_uuid()

    processed = 0
    skipped = 0
    errors = 0

    for item in tqdm(items, desc="Processing images"):
        try:
            # Step 1: Fetch image bytes
            image_bytes = fetch_image_bytes(item)
            
            # Step 2: Compute metadata
            sha256_hash, mime_type, size = compute_image_metadata(image_bytes)
            
            # Step 3: Store image (S3 or database)
            image_url = None
            image_data = None
            
            if STORE_IMAGES == "s3":
                image_url = upload_to_s3(image_bytes, sha256_hash, mime_type)
                if not image_url:
                    print(f"  WARNING: Failed to upload to S3 for {item}")
            elif STORE_IMAGES == "db":
                image_data = Binary(image_bytes)
                image_url = None  # No external URL when storing in DB
            
            # If original was a URL, keep it as image_url
            if not image_url and urlparse(item).scheme in ("http", "https"):
                image_url = item
            
            # Step 4: Send to Plate Recognizer API
            resp = send_request_with_retry(image_bytes)
            
            # Step 5: Parse response
            record = parse_and_normalize_response(resp, args.confidence_threshold)
            
            # Check if result meets confidence threshold
            if record is None:
                skipped += 1
                print(f"  Skipped (low confidence): {item}")
                time.sleep(args.delay)
                continue
            
            # Step 6: Prepare record for database
            record["snapshot_ref"] = record["snapshot_ref"] or item
            record["image_url"] = image_url
            record["image_data"] = image_data
            record["image_mime"] = mime_type
            record["image_size"] = size
            record["image_sha256"] = sha256_hash
            
            # Step 7: Insert into database
            new_id = insert_into_db(conn, record)
            processed += 1
            
        except Exception as e:
            errors += 1
            print(f"  ERROR processing {item}: {e}")
            conn.rollback()
        
        time.sleep(args.delay)

    conn.close()
    
    print(f"\n{'='*60}")
    print(f"Processing complete!")
    print(f"  Processed: {processed}")
    print(f"  Skipped (low confidence): {skipped}")
    print(f"  Errors: {errors}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
