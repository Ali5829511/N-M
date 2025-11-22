#!/usr/bin/env python3
"""
Script to send images/URLs to Plate Recognizer Snapshot API and store results in PostgreSQL.
Supports S3 object storage and database storage for images.

Notes:
- Set SNAPSHOT_API_URL according to official documentation (https://guides.platerecognizer.com/docs/snapshot/getting-started).
- Supports sending image URLs from text file or local file paths.
- Can store images in S3 (default) or database (for testing).
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
from psycopg2.extras import Json, register_uuid, Binary
from datetime import datetime

load_dotenv()

# Required environment variables
PLATE_API_KEY = os.getenv("PLATE_API_KEY")
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
STORE_IMAGES = os.getenv("STORE_IMAGES", "s3").lower()  # Default to S3

if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
    print("ERROR: Please set required environment variables: PLATE_API_KEY, SNAPSHOT_API_URL, DATABASE_URL")
    sys.exit(1)

# S3 configuration (only if STORE_IMAGES=s3)
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Initialize boto3 only if using S3
s3_client = None
if STORE_IMAGES == "s3":
    try:
        import boto3
        s3_client = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        )
        if not S3_BUCKET:
            print("ERROR: S3_BUCKET must be set when STORE_IMAGES=s3")
            sys.exit(1)
        print(f"Using S3 storage: {S3_BUCKET}")
    except ImportError:
        print("ERROR: boto3 is required when STORE_IMAGES=s3. Install it with: pip install boto3")
        sys.exit(1)
elif STORE_IMAGES == "db":
    print("Using database storage for images")
else:
    print(f"WARNING: Unknown STORE_IMAGES value '{STORE_IMAGES}', defaulting to 's3'")
    STORE_IMAGES = "s3"

HEADERS = {
    "Authorization": f"Token {PLATE_API_KEY}"
}

def fetch_image_bytes(path_or_url):
    """
    Fetch image bytes from URL or local file.
    Returns: (image_bytes, mime_type, size, sha256_hash)
    """
    if urlparse(path_or_url).scheme in ("http", "https"):
        # Fetch from URL
        response = requests.get(path_or_url, timeout=60)
        response.raise_for_status()
        image_bytes = response.content
        # Try to determine MIME type from Content-Type header
        mime_type = response.headers.get('Content-Type', 'image/jpeg')
        if ';' in mime_type:
            mime_type = mime_type.split(';')[0].strip()
    else:
        # Read local file
        with open(path_or_url, "rb") as f:
            image_bytes = f.read()
        # Determine MIME type from file extension
        mime_type, _ = mimetypes.guess_type(path_or_url)
        if not mime_type:
            mime_type = 'image/jpeg'  # Default
    
    # Calculate SHA256 hash
    sha256_hash = hashlib.sha256(image_bytes).hexdigest()
    size = len(image_bytes)
    
    return image_bytes, mime_type, size, sha256_hash

def upload_to_s3(image_bytes, sha256_hash, mime_type):
    """
    Upload image to S3 and return the URL.
    Uses sha256 hash as the key for deduplication.
    """
    if not s3_client:
        raise RuntimeError("S3 client not initialized")
    
    # Use hash as key to avoid duplicates
    key = f"vehicle-snapshots/{sha256_hash[:2]}/{sha256_hash}.jpg"
    
    try:
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=image_bytes,
            ContentType=mime_type,
            # Make public-read or use presigned URLs based on your security requirements
            # ACL='public-read'  # Uncomment if you want public URLs
        )
        
        # Generate URL (adjust based on your S3 bucket configuration)
        # For public buckets:
        # image_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
        
        # For private buckets, generate presigned URL (valid for 7 days)
        image_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET, 'Key': key},
            ExpiresIn=604800  # 7 days
        )
        
        return image_url
    except Exception as e:
        print(f"ERROR uploading to S3: {e}")
        raise

def send_request_with_retry(image_bytes, image_url=None, max_retries=3):
    """
    Send image to Plate Recognizer Snapshot API with retry logic.
    Can send either image bytes (multipart) or image_url.
    """
    for attempt in range(max_retries):
        try:
            if image_url:
                # Send image URL
                r = requests.post(
                    SNAPSHOT_API_URL,
                    headers={**HEADERS, "Content-Type": "application/json"},
                    json={"image_url": image_url},
                    timeout=60
                )
            else:
                # Send image bytes as multipart
                files = {"upload": ("image.jpg", BytesIO(image_bytes), "image/jpeg")}
                r = requests.post(SNAPSHOT_API_URL, headers=HEADERS, files=files, timeout=60)
            
            r.raise_for_status()
            return r.json()
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2  # Exponential backoff
                print(f"  Retry {attempt + 1}/{max_retries} after {wait_time}s due to: {e}")
                time.sleep(wait_time)
            else:
                raise
    
    return None

def parse_and_normalize_response(resp):
    """
    Extract important fields from Plate Recognizer response.
    Since response may vary based on model settings, we also store the raw response.
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
    """
    Insert record into vehicle_snapshots table.
    Includes image metadata (mime, size, sha256) and optionally image_data.
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
            Json(record["makes_models"]),
            Json(record["colors"]),
            Json(record["bbox"]),
            Json(record["raw_response"]),
            record["image_url"],
            record.get("image_data"),  # bytea or None
            record.get("image_mime"),
            record.get("image_size"),
            record.get("image_sha256"),
            Json(record["meta"])
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id

def process_image(item, confidence_threshold=0.0):
    """
    Process a single image: fetch bytes, compute metadata, store to S3/DB, 
    send to Plate Recognizer API, and return record data.
    """
    # Step 1: Fetch image bytes and compute metadata
    try:
        image_bytes, mime_type, size, sha256_hash = fetch_image_bytes(item)
    except Exception as e:
        print(f"  ERROR fetching image from {item}: {e}")
        return None
    
    # Step 2: Store image (S3 or DB)
    image_url = None
    image_data = None
    
    if STORE_IMAGES == "s3":
        try:
            image_url = upload_to_s3(image_bytes, sha256_hash, mime_type)
        except Exception as e:
            print(f"  ERROR uploading to S3: {e}")
            return None
    elif STORE_IMAGES == "db":
        # Store in database
        image_data = Binary(image_bytes)
        # For DB storage, we can optionally keep the original URL as reference
        if urlparse(item).scheme in ("http", "https"):
            image_url = item
    
    # Step 3: Send to Plate Recognizer API
    try:
        # If we have S3 URL, send that; otherwise send bytes
        if STORE_IMAGES == "s3" and image_url:
            resp = send_request_with_retry(None, image_url=image_url)
        else:
            resp = send_request_with_retry(image_bytes)
    except Exception as e:
        print(f"  ERROR calling Plate Recognizer API: {e}")
        return None
    
    # Step 4: Parse response
    record = parse_and_normalize_response(resp)
    record["snapshot_ref"] = record["snapshot_ref"] or sha256_hash
    
    # Apply confidence threshold filter
    if record["plate_confidence"] is not None:
        if float(record["plate_confidence"]) < confidence_threshold:
            print(f"  Skipping - confidence {record['plate_confidence']} below threshold {confidence_threshold}")
            return None
    
    # Add image metadata
    record["image_url"] = image_url
    record["image_data"] = image_data
    record["image_mime"] = mime_type
    record["image_size"] = size
    record["image_sha256"] = sha256_hash
    
    # Keep original URL in metadata if available
    if not record["image_url"] and urlparse(item).scheme in ("http", "https"):
        record["image_url"] = item
    
    return record

def main():
    parser = argparse.ArgumentParser(
        description="Send images to Plate Recognizer Snapshot API and store results in PostgreSQL",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --images images.txt
  %(prog)s --images images.txt --delay 1.0 --confidence-threshold 0.8

Environment Variables:
  PLATE_API_KEY          API key for Plate Recognizer
  SNAPSHOT_API_URL       Snapshot API endpoint URL
  DATABASE_URL           PostgreSQL connection string
  STORE_IMAGES           Where to store images: 's3' (default) or 'db'
  S3_BUCKET              S3 bucket name (required if STORE_IMAGES=s3)
  AWS_ACCESS_KEY_ID      AWS access key (required if STORE_IMAGES=s3)
  AWS_SECRET_ACCESS_KEY  AWS secret key (required if STORE_IMAGES=s3)
  AWS_REGION             AWS region (default: us-east-1)
        """
    )
    parser.add_argument("--images", required=True, 
                       help="Text file containing one image path/URL per line")
    parser.add_argument("--delay", type=float, default=0.5, 
                       help="Delay between requests in seconds (default: 0.5)")
    parser.add_argument("--confidence-threshold", type=float, default=0.0,
                       help="Minimum plate confidence threshold (0.0-1.0, default: 0.0)")
    args = parser.parse_args()

    # Read images list
    try:
        with open(args.images, "r") as f:
            items = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"ERROR: Images file not found: {args.images}")
        sys.exit(1)
    
    if not items:
        print("ERROR: No images found in file")
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
            record = process_image(item, args.confidence_threshold)
            
            if record is None:
                skipped_count += 1
                time.sleep(args.delay)
                continue
            
            # Insert into database
            new_id = insert_into_db(conn, record)
            success_count += 1
            
        except Exception as e:
            print(f"  ERROR processing {item}: {e}")
            error_count += 1
            conn.rollback()
        
        time.sleep(args.delay)

    conn.close()
    
    # Print summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total images:     {len(items)}")
    print(f"Successful:       {success_count}")
    print(f"Skipped:          {skipped_count}")
    print(f"Errors:           {error_count}")
    print("=" * 60)

if __name__ == "__main__":
    main()
