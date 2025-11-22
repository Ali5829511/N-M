#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Plate Recognizer Snapshot to PostgreSQL Integration
تكامل Plate Recognizer Snapshot مع PostgreSQL

This script fetches vehicle data from Plate Recognizer Snapshot API
and stores it in PostgreSQL database with image binary data.

يقوم هذا السكربت بجلب بيانات المركبات من Plate Recognizer Snapshot API
وتخزينها في قاعدة بيانات PostgreSQL مع البيانات الثنائية للصور.
"""

import os
import sys
import json
import hashlib
import requests
import psycopg2
from psycopg2 import Binary
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from pathlib import Path


class PlateRecognizerSnapshot:
    """
    Class to handle Plate Recognizer Snapshot API integration with PostgreSQL
    """
    
    def __init__(self):
        """Initialize with environment variables"""
        self.api_token = os.getenv('PLATE_RECOGNIZER_API_TOKEN')
        self.api_url = os.getenv('PLATE_RECOGNIZER_API_URL', 
                                  'https://api.platerecognizer.com/v1/plate-reader/')
        
        # PostgreSQL connection parameters
        self.db_params = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', '5432')),
            'dbname': os.getenv('DB_NAME', 'traffic_system'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', '')
        }
        
        # Validate required parameters
        if not self.api_token:
            raise ValueError("PLATE_RECOGNIZER_API_TOKEN environment variable is required")
    
    def get_db_connection(self):
        """
        Create and return a database connection
        إنشاء وإرجاع اتصال بقاعدة البيانات
        """
        try:
            conn = psycopg2.connect(**self.db_params)
            return conn
        except Exception as e:
            print(f"❌ Database connection error: {e}")
            raise
    
    def fetch_image_bytes(self, image_source: str) -> Tuple[bytes, str, int]:
        """
        Fetch image bytes from URL or local file
        جلب بايتات الصورة من URL أو ملف محلي
        
        Args:
            image_source: URL or local file path
        
        Returns:
            Tuple of (image_bytes, mime_type, size)
        """
        # Check if it's a URL
        if image_source.startswith(('http://', 'https://')):
            print(f"📥 Fetching image from URL: {image_source}")
            response = requests.get(image_source, timeout=30)
            response.raise_for_status()
            
            image_bytes = response.content
            mime_type = response.headers.get('Content-Type', 'image/jpeg')
            size = len(image_bytes)
            
            return image_bytes, mime_type, size
        
        # Otherwise, treat as local file
        else:
            print(f"📂 Reading local image file: {image_source}")
            file_path = Path(image_source)
            
            if not file_path.exists():
                raise FileNotFoundError(f"Image file not found: {image_source}")
            
            with open(file_path, 'rb') as f:
                image_bytes = f.read()
            
            # Determine MIME type based on extension
            ext = file_path.suffix.lower()
            mime_map = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp'
            }
            mime_type = mime_map.get(ext, 'application/octet-stream')
            size = len(image_bytes)
            
            return image_bytes, mime_type, size
    
    def calculate_sha256(self, data: bytes) -> str:
        """
        Calculate SHA256 hash of image data
        حساب هاش SHA256 لبيانات الصورة
        """
        return hashlib.sha256(data).hexdigest()
    
    def recognize_plate(self, image_source: str, use_upload: bool = True) -> Dict[str, Any]:
        """
        Send image to Plate Recognizer API for recognition
        إرسال الصورة إلى Plate Recognizer API للتعرف عليها
        
        Args:
            image_source: URL or local file path
            use_upload: If True, upload file; if False, send image_url (for URLs only)
        
        Returns:
            API response as dictionary
        """
        headers = {
            'Authorization': f'Token {self.api_token}'
        }
        
        # Check if it's a URL and use_upload is False
        if image_source.startswith(('http://', 'https://')) and not use_upload:
            print(f"🔗 Sending image URL to API: {image_source}")
            data = {'upload_url': image_source}
            response = requests.post(self.api_url, data=data, headers=headers)
        else:
            # Upload file (either local file or URL fetched first)
            print(f"📤 Uploading image to API...")
            image_bytes, mime_type, _ = self.fetch_image_bytes(image_source)
            
            files = {'upload': ('image', image_bytes, mime_type)}
            response = requests.post(self.api_url, files=files, headers=headers)
        
        response.raise_for_status()
        return response.json()
    
    def store_snapshot(self, image_source: str, api_response: Dict[str, Any]) -> int:
        """
        Store snapshot data and image in PostgreSQL
        تخزين بيانات اللقطة والصورة في PostgreSQL
        
        Args:
            image_source: URL or local file path
            api_response: Response from Plate Recognizer API
        
        Returns:
            ID of inserted record
        """
        # Fetch image bytes and metadata
        image_bytes, mime_type, size = self.fetch_image_bytes(image_source)
        sha256_hash = self.calculate_sha256(image_bytes)
        
        # Extract plate information from response
        results = api_response.get('results', [])
        plate_number = None
        plate_region = None
        confidence = None
        
        if results:
            first_result = results[0]
            plate_number = first_result.get('plate', '')
            plate_region = first_result.get('region', {}).get('code', '')
            confidence = first_result.get('score', 0.0)
        
        # Generate snapshot_id
        snapshot_id = f"snap_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{sha256_hash[:8]}"
        
        # Prepare SQL insert
        sql = """
        INSERT INTO vehicle_snapshots 
        (snapshot_id, raw_response, image_url, image_data, image_mime, 
         image_size, image_sha256, plate_number, plate_region, confidence, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """
        
        # Determine image_url value
        image_url = image_source if image_source.startswith(('http://', 'https://')) else None
        
        conn = None
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute(sql, (
                snapshot_id,
                json.dumps(api_response),  # JSONB
                image_url,
                Binary(image_bytes),  # BYTEA
                mime_type,
                size,
                sha256_hash,
                plate_number,
                plate_region,
                confidence,
                'processed'
            ))
            
            record_id = cursor.fetchone()[0]
            conn.commit()
            
            print(f"✅ Successfully stored snapshot with ID: {record_id}")
            print(f"   - Snapshot ID: {snapshot_id}")
            print(f"   - Plate: {plate_number or 'N/A'}")
            print(f"   - Region: {plate_region or 'N/A'}")
            print(f"   - Confidence: {confidence or 0.0:.2%}")
            print(f"   - Image size: {size / 1024:.2f} KB")
            print(f"   - SHA256: {sha256_hash}")
            
            return record_id
            
        except Exception as e:
            if conn:
                conn.rollback()
            print(f"❌ Error storing snapshot: {e}")
            raise
        finally:
            if conn:
                cursor.close()
                conn.close()
    
    def process_image(self, image_source: str, use_upload: bool = True) -> int:
        """
        Main method to process an image: recognize and store
        الطريقة الرئيسية لمعالجة الصورة: التعرف والتخزين
        
        Args:
            image_source: URL or local file path
            use_upload: Whether to upload file or send URL (for URLs only)
        
        Returns:
            ID of stored record
        """
        print(f"\n{'='*60}")
        print(f"🚗 Processing image: {image_source}")
        print(f"{'='*60}")
        
        try:
            # Step 1: Recognize plate
            print("\n📸 Step 1: Recognizing plate...")
            api_response = self.recognize_plate(image_source, use_upload)
            
            # Step 2: Store in database
            print("\n💾 Step 2: Storing in database...")
            record_id = self.store_snapshot(image_source, api_response)
            
            print(f"\n✅ Processing completed successfully!")
            return record_id
            
        except Exception as e:
            print(f"\n❌ Error processing image: {e}")
            raise


def main():
    """
    Main entry point for the script
    """
    print("🚀 Plate Recognizer Snapshot to PostgreSQL")
    print("="*60)
    
    # Check command line arguments
    if len(sys.argv) < 2:
        print("\n❌ Usage: python snapshot_to_postgres.py <image_source>")
        print("   image_source: URL or local file path to image")
        print("\nExample:")
        print("   python snapshot_to_postgres.py https://example.com/car.jpg")
        print("   python snapshot_to_postgres.py /path/to/car.jpg")
        sys.exit(1)
    
    image_source = sys.argv[1]
    
    # Optional: use_upload flag (default True)
    use_upload = True
    if len(sys.argv) > 2 and sys.argv[2].lower() == '--url-only':
        use_upload = False
        print("📋 Mode: Sending URL to API (not uploading)")
    
    try:
        processor = PlateRecognizerSnapshot()
        record_id = processor.process_image(image_source, use_upload)
        
        print(f"\n🎉 Success! Record ID: {record_id}")
        print("\n💡 Tip: You can retrieve the image from database using:")
        print(f"   SELECT image_data, image_mime FROM vehicle_snapshots WHERE id = {record_id};")
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
