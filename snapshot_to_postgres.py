#!/usr/bin/env python3
"""
Plate Recognizer Snapshot to PostgreSQL Ingestion Script
=========================================================
This script reads a text file containing image paths or URLs,
sends each image to the Plate Recognizer Snapshot API,
and stores the results in a PostgreSQL database.

Required environment variables:
- PLATE_API_KEY: Your Plate Recognizer API key
- SNAPSHOT_API_URL: Snapshot API endpoint (default: https://api.platerecognizer.com/v1/plate-reader/)
- DATABASE_URL: PostgreSQL connection string
"""

import os
import sys
import json
import time
import requests
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from tqdm import tqdm
import psycopg2
from psycopg2.extras import Json
from psycopg2.extensions import connection as Connection

# Load environment variables
load_dotenv()

# Configuration
PLATE_API_KEY = os.getenv('PLATE_API_KEY')
SNAPSHOT_API_URL = os.getenv('SNAPSHOT_API_URL', 'https://api.platerecognizer.com/v1/plate-reader/')
DATABASE_URL = os.getenv('DATABASE_URL')
REQUEST_DELAY = float(os.getenv('REQUEST_DELAY', '1.0'))  # Delay between requests in seconds

# Validate required configuration
if not PLATE_API_KEY:
    print("Error: PLATE_API_KEY environment variable is required")
    sys.exit(1)

if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable is required")
    sys.exit(1)


def get_db_connection() -> Connection:
    """Create and return a database connection."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)


def process_image_file(image_path: str, camera_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Send a local image file to Plate Recognizer Snapshot API.
    
    Args:
        image_path: Path to the local image file
        camera_id: Optional camera identifier
        
    Returns:
        API response as dictionary or None if error
    """
    headers = {
        'Authorization': f'Token {PLATE_API_KEY}'
    }
    
    data = {}
    if camera_id:
        data['camera_id'] = camera_id
    
    try:
        with open(image_path, 'rb') as fp:
            files = {'upload': fp}
            response = requests.post(
                SNAPSHOT_API_URL,
                headers=headers,
                data=data,
                files=files,
                timeout=30
            )
            
        response.raise_for_status()
        return response.json()
    except FileNotFoundError:
        print(f"Error: Image file not found: {image_path}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error processing image {image_path}: {e}")
        return None


def process_image_url(image_url: str, camera_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Send an image URL to Plate Recognizer Snapshot API.
    
    Args:
        image_url: URL of the image
        camera_id: Optional camera identifier
        
    Returns:
        API response as dictionary or None if error
    """
    headers = {
        'Authorization': f'Token {PLATE_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'image_url': image_url
    }
    if camera_id:
        data['camera_id'] = camera_id
    
    try:
        response = requests.post(
            SNAPSHOT_API_URL,
            headers=headers,
            json=data,
            timeout=30
        )
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error processing image URL {image_url}: {e}")
        return None


def extract_plate_data(api_response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract relevant fields from Plate Recognizer API response.
    
    Args:
        api_response: Raw API response
        
    Returns:
        Extracted data dictionary
    """
    results = api_response.get('results', [])
    
    # Extract data from first result (if available)
    if results:
        first_result = results[0]
        plate_text = first_result.get('plate', '')
        plate_confidence = first_result.get('score', 0.0)
        bbox = first_result.get('box', {})
        
        # Extract vehicle information
        vehicle = first_result.get('vehicle', {})
        
        # Extract makes and models
        makes_models = []
        if 'make_model' in vehicle:
            for mm in vehicle['make_model']:
                makes_models.append({
                    'make': mm.get('make', ''),
                    'model': mm.get('model', ''),
                    'confidence': mm.get('score', 0.0)
                })
        
        # Extract colors
        colors = []
        if 'color' in vehicle:
            for color_info in vehicle['color']:
                colors.append({
                    'color': color_info.get('color', ''),
                    'confidence': color_info.get('score', 0.0)
                })
    else:
        # No results found
        plate_text = None
        plate_confidence = 0.0
        bbox = {}
        makes_models = []
        colors = []
    
    # Extract metadata
    camera_id = api_response.get('camera_id')
    timestamp = api_response.get('timestamp')
    
    return {
        'snapshot_ref': api_response.get('filename') or api_response.get('uuid'),
        'camera_id': camera_id,
        'captured_at': timestamp,
        'plate_text': plate_text,
        'plate_confidence': plate_confidence,
        'makes_models': makes_models,
        'colors': colors,
        'bbox': bbox,
        'raw_response': api_response
    }


def insert_snapshot_record(conn: Connection, data: Dict[str, Any], image_source: str) -> bool:
    """
    Insert snapshot record into PostgreSQL database.
    
    Args:
        conn: Database connection
        data: Extracted data dictionary
        image_source: Source image path or URL
        
    Returns:
        True if successful, False otherwise
    """
    try:
        with conn.cursor() as cursor:
            insert_query = """
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
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """
            
            # Prepare captured_at timestamp
            captured_at = None
            if data.get('captured_at'):
                try:
                    captured_at = datetime.fromisoformat(data['captured_at'].replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    captured_at = None
            
            # If no timestamp from API, use current time
            if not captured_at:
                captured_at = datetime.now(timezone.utc)
            
            # Prepare metadata
            meta = {
                'source': image_source,
                'processed_at': datetime.now(timezone.utc).isoformat()
            }
            
            cursor.execute(
                insert_query,
                (
                    data.get('snapshot_ref'),
                    data.get('camera_id'),
                    captured_at,
                    data.get('plate_text'),
                    data.get('plate_confidence'),
                    Json(data.get('makes_models', [])),
                    Json(data.get('colors', [])),
                    Json(data.get('bbox', {})),
                    Json(data.get('raw_response', {})),
                    image_source if image_source.startswith('http') else None,
                    Json(meta)
                )
            )
            
        conn.commit()
        return True
    except Exception as e:
        print(f"Error inserting record: {e}")
        conn.rollback()
        return False


def process_images_file(images_file: str, camera_id: Optional[str] = None) -> None:
    """
    Process all images from a text file.
    
    Args:
        images_file: Path to text file containing image paths/URLs (one per line)
        camera_id: Optional camera identifier
    """
    # Check if file exists
    if not os.path.exists(images_file):
        print(f"Error: Images file not found: {images_file}")
        sys.exit(1)
    
    # Read image paths/URLs
    with open(images_file, 'r') as f:
        images = [line.strip() for line in f if line.strip() and not line.strip().startswith('#')]
    
    if not images:
        print(f"Error: No images found in {images_file}")
        sys.exit(1)
    
    print(f"Found {len(images)} images to process")
    
    # Connect to database
    conn = get_db_connection()
    print("Connected to database")
    
    # Process images with progress bar
    success_count = 0
    error_count = 0
    
    for image in tqdm(images, desc="Processing images"):
        # Determine if it's a URL or file path
        is_url = image.startswith('http://') or image.startswith('https://')
        
        # Process image
        if is_url:
            api_response = process_image_url(image, camera_id)
        else:
            api_response = process_image_file(image, camera_id)
        
        if api_response:
            # Extract data
            extracted_data = extract_plate_data(api_response)
            
            # Insert into database
            if insert_snapshot_record(conn, extracted_data, image):
                success_count += 1
            else:
                error_count += 1
        else:
            error_count += 1
        
        # Delay between requests to avoid rate limiting
        if REQUEST_DELAY > 0:
            time.sleep(REQUEST_DELAY)
    
    # Close database connection
    conn.close()
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"Processing complete!")
    print(f"Successful: {success_count}")
    print(f"Errors: {error_count}")
    print(f"{'='*50}")


def main():
    """Main entry point."""
    # Parse command line arguments
    if len(sys.argv) < 2:
        print("Usage: python snapshot_to_postgres.py <images_file> [camera_id]")
        print("\nExample:")
        print("  python snapshot_to_postgres.py images.txt")
        print("  python snapshot_to_postgres.py images.txt camera_001")
        sys.exit(1)
    
    images_file = sys.argv[1]
    camera_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Process images
    process_images_file(images_file, camera_id)


if __name__ == '__main__':
    main()
