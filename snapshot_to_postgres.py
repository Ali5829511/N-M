#!/usr/bin/env python3
"""
Plate Recognizer Snapshot API to PostgreSQL Integration
معالج لقطات التعرف على اللوحات وحفظها في قاعدة البيانات

This script reads image paths/URLs from images.txt, sends them to
Plate Recognizer Snapshot API, and stores results with image data in PostgreSQL.
"""

import os
import sys
import hashlib
import time
import mimetypes
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime

import requests
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv
from tqdm import tqdm

# Load environment variables
load_dotenv()

# Configuration from environment
PLATE_API_KEY = os.getenv('PLATE_API_KEY')
SNAPSHOT_API_URL = os.getenv('SNAPSHOT_API_URL', 'https://api.platerecognizer.com/v1/plate-reader/')
DATABASE_URL = os.getenv('DATABASE_URL')
REQUEST_DELAY = float(os.getenv('REQUEST_DELAY', '1.0'))  # Delay between requests in seconds
CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', '0.0'))  # Minimum confidence (0-1)
BATCH_SIZE = int(os.getenv('BATCH_SIZE', '10'))  # Number of images to process before committing


def get_image_data(image_path_or_url: str) -> Tuple[bytes, str, int, str]:
    """
    Fetch image data from URL or local file.
    
    Args:
        image_path_or_url: URL or local file path
        
    Returns:
        Tuple of (image_bytes, mime_type, size, sha256_hash)
    """
    # Check if it's a URL
    if image_path_or_url.startswith(('http://', 'https://')):
        response = requests.get(image_path_or_url, timeout=30)
        response.raise_for_status()
        image_bytes = response.content
        
        # Detect MIME type from content-type header or extension
        mime_type = response.headers.get('content-type', 'image/jpeg')
        if ';' in mime_type:
            mime_type = mime_type.split(';')[0].strip()
    else:
        # Local file
        file_path = Path(image_path_or_url)
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {image_path_or_url}")
        
        with open(file_path, 'rb') as f:
            image_bytes = f.read()
        
        # Detect MIME type from extension
        mime_type = mimetypes.guess_type(str(file_path))[0] or 'image/jpeg'
    
    # Calculate hash and size
    sha256_hash = hashlib.sha256(image_bytes).hexdigest()
    size = len(image_bytes)
    
    return image_bytes, mime_type, size, sha256_hash


def send_to_plate_recognizer(image_data: bytes = None, image_url: str = None, mime_type: str = 'image/jpeg') -> Dict:
    """
    Send image to Plate Recognizer Snapshot API.
    
    Args:
        image_data: Image bytes (for upload)
        image_url: Image URL (alternative to upload)
        mime_type: MIME type of the image (default: image/jpeg)
        
    Returns:
        API response as dictionary
    """
    if not PLATE_API_KEY:
        raise ValueError("PLATE_API_KEY environment variable not set")
    
    # Validate that exactly one method is provided
    if (image_data is None and image_url is None) or (image_data is not None and image_url is not None):
        raise ValueError("Exactly one of image_data or image_url must be provided")
    
    headers = {
        'Authorization': f'Token {PLATE_API_KEY}'
    }
    
    if image_url:
        # Send URL
        data = {'upload_url': image_url}
        response = requests.post(SNAPSHOT_API_URL, headers=headers, data=data, timeout=60)
    else:
        # Upload file with proper MIME type
        files = {'upload': ('image', image_data, mime_type)}
        response = requests.post(SNAPSHOT_API_URL, headers=headers, files=files, timeout=60)
    
    response.raise_for_status()
    return response.json()


def extract_plate_data(api_response: Dict) -> Dict:
    """
    Extract relevant plate data from API response.
    
    Args:
        api_response: Full API response
        
    Returns:
        Dictionary with extracted fields
    """
    results = api_response.get('results', [])
    
    extracted = {
        'plate_text': None,
        'plate_confidence': None,
        'makes_models': [],
        'colors': [],
        'bbox': None
    }
    
    if results:
        result = results[0]  # Get first (highest confidence) result
        
        extracted['plate_text'] = result.get('plate', '')
        extracted['plate_confidence'] = result.get('score', 0.0)
        
        # Vehicle data
        vehicle = result.get('vehicle', {})
        if vehicle:
            # Makes and models
            if 'make' in vehicle:
                for make in vehicle['make']:
                    extracted['makes_models'].append({
                        'make': make.get('name', ''),
                        'confidence': make.get('score', 0.0)
                    })
            
            if 'make_model' in vehicle:
                for model in vehicle['make_model']:
                    extracted['makes_models'].append({
                        'model': model.get('name', ''),
                        'confidence': model.get('score', 0.0)
                    })
            
            # Colors
            if 'color' in vehicle:
                for color in vehicle['color']:
                    extracted['colors'].append({
                        'color': color.get('color', ''),
                        'confidence': color.get('score', 0.0)
                    })
        
        # Bounding box
        if 'box' in result:
            extracted['bbox'] = result['box']
    
    return extracted


def insert_snapshot(
    conn,
    snapshot_ref: str,
    camera_id: Optional[str],
    captured_at: datetime,
    plate_text: Optional[str],
    plate_confidence: Optional[float],
    makes_models: List[Dict],
    colors: List[Dict],
    bbox: Optional[Dict],
    raw_response: Dict,
    image_url: Optional[str],
    image_data: bytes,
    image_mime: str,
    image_size: int,
    image_sha256: str,
    meta: Optional[Dict] = None
):
    """
    Insert snapshot record into PostgreSQL.
    """
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO vehicle_snapshots (
                snapshot_ref, camera_id, captured_at,
                plate_text, plate_confidence,
                makes_models, colors, bbox,
                raw_response, image_url,
                image_data, image_mime, image_size, image_sha256,
                meta
            ) VALUES (
                %s, %s, %s,
                %s, %s,
                %s, %s, %s,
                %s, %s,
                %s, %s, %s, %s,
                %s
            )
            ON CONFLICT (image_sha256) DO UPDATE SET
                snapshot_ref = EXCLUDED.snapshot_ref,
                camera_id = EXCLUDED.camera_id,
                captured_at = EXCLUDED.captured_at,
                plate_text = EXCLUDED.plate_text,
                plate_confidence = EXCLUDED.plate_confidence,
                makes_models = EXCLUDED.makes_models,
                colors = EXCLUDED.colors,
                bbox = EXCLUDED.bbox,
                raw_response = EXCLUDED.raw_response,
                image_url = EXCLUDED.image_url,
                meta = EXCLUDED.meta,
                created_at = NOW()
        """, (
            snapshot_ref, camera_id, captured_at,
            plate_text, plate_confidence,
            Json(makes_models), Json(colors), Json(bbox) if bbox else None,
            Json(raw_response), image_url,
            psycopg2.Binary(image_data), image_mime, image_size, image_sha256,
            Json(meta) if meta else None
        ))


def process_images(image_file: str = 'images.txt'):
    """
    Main processing function to read images and send to API.
    
    Args:
        image_file: Path to file containing image paths/URLs (one per line)
    """
    if not os.path.exists(image_file):
        print(f"Error: {image_file} not found")
        print("Create an images.txt file with one image path or URL per line")
        sys.exit(1)
    
    # Read image paths
    with open(image_file, 'r', encoding='utf-8') as f:
        image_paths = [line.strip() for line in f if line.strip() and not line.startswith('#')]
    
    if not image_paths:
        print(f"No images found in {image_file}")
        sys.exit(1)
    
    print(f"Found {len(image_paths)} images to process")
    
    # Connect to database
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        print("Connected to PostgreSQL database")
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)
    
    # Process images
    processed = 0
    errors = 0
    skipped = 0
    
    try:
        for idx, image_path in enumerate(tqdm(image_paths, desc="Processing images"), 1):
            try:
                # Get image data
                print(f"\n[{idx}/{len(image_paths)}] Processing: {image_path}")
                
                is_url = image_path.startswith(('http://', 'https://'))
                image_bytes, mime_type, size, sha256 = get_image_data(image_path)
                
                print(f"  Image: {mime_type}, {size} bytes, SHA256: {sha256[:16]}...")
                
                # Send to API (prefer URL if available to save bandwidth)
                if is_url:
                    api_response = send_to_plate_recognizer(image_url=image_path)
                else:
                    api_response = send_to_plate_recognizer(image_data=image_bytes, mime_type=mime_type)
                
                # Extract data
                extracted = extract_plate_data(api_response)
                
                # Check confidence threshold
                if extracted['plate_confidence'] and extracted['plate_confidence'] < CONFIDENCE_THRESHOLD:
                    print(f"  Skipped: confidence {extracted['plate_confidence']:.2f} below threshold {CONFIDENCE_THRESHOLD}")
                    skipped += 1
                    time.sleep(REQUEST_DELAY)
                    continue
                
                print(f"  Plate: {extracted['plate_text']} (confidence: {extracted['plate_confidence']:.2f})")
                
                # Insert into database with consistent timestamp
                captured_at = datetime.now()
                snapshot_ref = f"snapshot_{captured_at.strftime('%Y%m%d_%H%M%S')}_{idx}"
                
                insert_snapshot(
                    conn,
                    snapshot_ref=snapshot_ref,
                    camera_id=None,  # Can be extracted from filename or passed as parameter
                    captured_at=captured_at,
                    plate_text=extracted['plate_text'],
                    plate_confidence=extracted['plate_confidence'],
                    makes_models=extracted['makes_models'],
                    colors=extracted['colors'],
                    bbox=extracted['bbox'],
                    raw_response=api_response,
                    image_url=image_path if is_url else None,
                    image_data=image_bytes,
                    image_mime=mime_type,
                    image_size=size,
                    image_sha256=sha256,
                    meta={'source_file': image_file, 'processing_timestamp': captured_at.isoformat()}
                )
                
                processed += 1
                
                # Commit in batches
                if processed % BATCH_SIZE == 0:
                    conn.commit()
                    print(f"  Committed batch of {BATCH_SIZE} records")
                
                # Rate limiting
                time.sleep(REQUEST_DELAY)
                
            except Exception as e:
                print(f"  Error processing {image_path}: {e}")
                errors += 1
                # Don't rollback - let successful images in batch commit
                continue
        
        # Final commit
        conn.commit()
        print("\n" + "="*60)
        print(f"Processing complete!")
        print(f"  Processed: {processed}")
        print(f"  Skipped (low confidence): {skipped}")
        print(f"  Errors: {errors}")
        print("="*60)
        
    finally:
        conn.close()


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Process images through Plate Recognizer and store in PostgreSQL'
    )
    parser.add_argument(
        '--images',
        default='images.txt',
        help='File containing image paths/URLs (default: images.txt)'
    )
    
    args = parser.parse_args()
    
    process_images(args.images)
