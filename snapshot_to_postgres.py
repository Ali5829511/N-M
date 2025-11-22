#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Plate Recognizer Snapshot API Integration with PostgreSQL
يدمج بيانات التعرف على اللوحات من Snapshot API مع قاعدة بيانات PostgreSQL

This script reads image paths/URLs from a text file, sends them to
Plate Recognizer Snapshot API, and stores the results in PostgreSQL.
"""

import os
import sys
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

# Load environment variables
load_dotenv()


def is_url(path: str) -> bool:
    """Check if path is a URL"""
    try:
        result = urlparse(path)
        return all([result.scheme, result.netloc])
    except Exception:
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
            print(f"❌ Database error: {str(e)}")
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
            print(f"❌ [{idx}/{len(image_paths)}] Unexpected error for {image_path}: {str(e)}")
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
    main()
