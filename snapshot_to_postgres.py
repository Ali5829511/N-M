#!/usr/bin/env python3
"""
CLI script to ingest vehicle images using Plate Recognizer Snapshot API
and store metadata in PostgreSQL.

Default behavior: Store images in Object Storage (S3) and save metadata and S3 URL in DB.
Optional behavior: Set STORE_IMAGES=db to store image bytes in DB (bytea) for small tests.
"""

import os
import sys
import argparse
import hashlib
import mimetypes
import time
from urllib.parse import urlparse
from datetime import datetime

import requests
from dotenv import load_dotenv
from tqdm import tqdm
import psycopg2
from psycopg2.extras import Json, register_uuid, Binary

# Load environment variables
load_dotenv()

# Required environment variables
PLATE_API_KEY = os.getenv("PLATE_API_KEY")
SNAPSHOT_API_URL = os.getenv("SNAPSHOT_API_URL")
DATABASE_URL = os.getenv("DATABASE_URL")

# Storage configuration
STORE_IMAGES = os.getenv("STORE_IMAGES", "s3")  # Default to S3

# S3 configuration (only needed when STORE_IMAGES=s3)
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Validate required environment variables
if not PLATE_API_KEY or not SNAPSHOT_API_URL or not DATABASE_URL:
    print("Error: Missing required environment variables.")
    print("Please set: PLATE_API_KEY, SNAPSHOT_API_URL, DATABASE_URL")
    sys.exit(1)

# Validate S3 configuration if needed
if STORE_IMAGES == "s3":
    if not S3_BUCKET or not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        print("Error: STORE_IMAGES=s3 but missing S3 configuration.")
        print("Please set: S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY")
        sys.exit(1)
    # Import boto3 only when needed
    try:
        import boto3
        from botocore.exceptions import ClientError
    except ImportError:
        print("Error: boto3 is required for S3 storage. Install with: pip install boto3")
        sys.exit(1)

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
        response = requests.get(path_or_url, timeout=30)
        response.raise_for_status()
        image_bytes = response.content
        # Try to get mime type from Content-Type header or guess from URL
        mime_type = response.headers.get('Content-Type', 'image/jpeg')
        if ';' in mime_type:
            mime_type = mime_type.split(';')[0].strip()
    else:
        # Read from local file
        with open(path_or_url, 'rb') as f:
            image_bytes = f.read()
        mime_type = mimetypes.guess_type(path_or_url)[0] or 'application/octet-stream'
    
    # Compute size and hash
    size = len(image_bytes)
    sha256_hash = hashlib.sha256(image_bytes).hexdigest()
    
    return image_bytes, mime_type, size, sha256_hash


def upload_to_s3(image_bytes, sha256_hash, mime_type):
    """
    Upload image bytes to S3 and return the URL.
    Uses sha256 hash as the object key to avoid duplicates.
    """
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    
    # Use sha256 as filename with appropriate extension
    ext = mime_type.split('/')[-1] if '/' in mime_type else 'jpg'
    object_key = f"vehicle-images/{sha256_hash}.{ext}"
    
    try:
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=object_key,
            Body=image_bytes,
            ContentType=mime_type
        )
        
        # Generate URL (public or presigned based on bucket policy)
        # For simplicity, returning the standard S3 URL
        s3_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{object_key}"
        return s3_url
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        raise


def send_to_plate_recognizer(image_bytes):
    """
    Send image to Plate Recognizer Snapshot API.
    Returns the API response.
    """
    files = {"upload": ("image.jpg", image_bytes, "image/jpeg")}
    
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
    Returns a dictionary with extracted fields.
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
    }
    
    # Extract results (structure may vary)
    results = resp.get("results", [])
    
    if results and len(results) > 0:
        result = results[0]
        
        # Extract plate information
        plate = result.get("plate", {})
        plate_text = plate
        plate_confidence = result.get("score", 0.0)
        
        # Apply confidence threshold
        if plate_confidence < confidence_threshold:
            return None
        
        parsed["plate_text"] = plate
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
    Insert record into vehicle_snapshots table.
    """
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO vehicle_snapshots
            (snapshot_ref, camera_id, captured_at, plate_text, plate_confidence,
             makes_models, colors, bbox, raw_response, image_url, image_data,
             image_mime, image_size, image_sha256, meta)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            Binary(record["image_data"]) if record.get("image_data") else None,
            record.get("image_mime"),
            record.get("image_size"),
            record.get("image_sha256"),
            Json(record.get("meta", {}))
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id


def process_image(path_or_url, conn, confidence_threshold, delay):
    """
    Process a single image: fetch, upload/store, recognize plate, and save to DB.
    """
    try:
        # Fetch image bytes
        image_bytes, mime_type, size, sha256_hash = fetch_image_bytes(path_or_url)
        
        # Prepare record
        record = {
            "image_mime": mime_type,
            "image_size": size,
            "image_sha256": sha256_hash,
            "meta": {"source": path_or_url}
        }
        
        # Store image based on configuration
        if STORE_IMAGES == "s3":
            # Upload to S3
            s3_url = upload_to_s3(image_bytes, sha256_hash, mime_type)
            record["image_url"] = s3_url
            record["image_data"] = None
        else:
            # Store in DB
            record["image_url"] = None
            record["image_data"] = image_bytes
        
        # Send to Plate Recognizer API
        api_response = send_to_plate_recognizer(image_bytes)
        
        # Parse response
        parsed = parse_plate_recognizer_response(api_response, confidence_threshold)
        
        if parsed is None:
            print(f"  Skipped (confidence below threshold): {path_or_url}")
            return None
        
        # Merge parsed data with record
        record.update(parsed)
        
        # Insert into database
        new_id = insert_into_db(conn, record)
        
        return new_id
        
    except Exception as e:
        print(f"  Error processing {path_or_url}: {e}")
        conn.rollback()
        return None
    finally:
        time.sleep(delay)


def main():
    parser = argparse.ArgumentParser(
        description="Ingest vehicle images using Plate Recognizer Snapshot API"
    )
    parser.add_argument(
        "--images",
        required=True,
        help="Path to images.txt file containing image paths/URLs (one per line)"
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
        help="Minimum confidence threshold for plate recognition (default: 0.0)"
    )
    args = parser.parse_args()
    
    # Read image paths/URLs
    with open(args.images, "r") as f:
        items = [line.strip() for line in f if line.strip()]
    
    print(f"Processing {len(items)} images...")
    print(f"Storage mode: {STORE_IMAGES}")
    print(f"Confidence threshold: {args.confidence_threshold}")
    
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    register_uuid()
    
    # Process images
    successful = 0
    for item in tqdm(items, desc="Processing images"):
        result = process_image(item, conn, args.confidence_threshold, args.delay)
        if result:
            successful += 1
    
    conn.close()
    
    print(f"\nCompleted: {successful}/{len(items)} images processed successfully")


if __name__ == "__main__":
    main()
