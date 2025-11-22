#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Plate Recognizer Snapshot to PostgreSQL
سكربت جمع بيانات السيارات من Plate Recognizer Snapshot API وتخزينها في PostgreSQL

This script:
1. Reads image paths/URLs from a text file
2. Sends each image to Plate Recognizer Snapshot API
3. Extracts vehicle data (plate, confidence, make/model, color, bbox, etc.)
4. Stores complete response in PostgreSQL with JSONB format
"""

import os
import sys
import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List

import requests
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import Json
from tqdm import tqdm

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('snapshot_processor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# HTTP Status codes for successful API responses
HTTP_SUCCESS_CODES = (200, 201)

# Configuration from environment variables
PLATE_API_KEY = os.getenv('PLATE_API_KEY')
SNAPSHOT_API_URL = os.getenv('SNAPSHOT_API_URL', 'https://api.platerecognizer.com/v1/plate-reader/')
DATABASE_URL = os.getenv('DATABASE_URL')
REQUEST_DELAY = float(os.getenv('REQUEST_DELAY', '1.0'))  # Delay between requests in seconds
MAX_RETRIES = int(os.getenv('MAX_RETRIES', '3'))

# Validate configuration
if not PLATE_API_KEY:
    logger.error("❌ PLATE_API_KEY not found in environment variables")
    sys.exit(1)

if not DATABASE_URL:
    logger.error("❌ DATABASE_URL not found in environment variables")
    sys.exit(1)


class SnapshotProcessor:
    """Process images through Plate Recognizer Snapshot API and store in PostgreSQL"""
    
    def __init__(self):
        self.api_key = PLATE_API_KEY
        self.api_url = SNAPSHOT_API_URL
        self.db_conn = None
        self.stats = {
            'total': 0,
            'success': 0,
            'failed': 0,
            'no_plates': 0
        }
    
    def connect_db(self):
        """Connect to PostgreSQL database"""
        try:
            self.db_conn = psycopg2.connect(DATABASE_URL)
            logger.info("✅ Connected to PostgreSQL database")
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            sys.exit(1)
    
    def close_db(self):
        """Close database connection"""
        if self.db_conn:
            self.db_conn.close()
            logger.info("🔒 Database connection closed")
    
    def process_image_file(self, image_path: str) -> Optional[Dict[str, Any]]:
        """
        Send local image file to Snapshot API
        
        Args:
            image_path: Path to local image file
            
        Returns:
            API response dict or None if failed
        """
        if not Path(image_path).exists():
            logger.error(f"❌ Image file not found: {image_path}")
            return None
        
        headers = {
            'Authorization': f'Token {self.api_key}'
        }
        
        try:
            with open(image_path, 'rb') as fp:
                files = {'upload': fp}
                response = requests.post(
                    self.api_url,
                    headers=headers,
                    files=files,
                    timeout=30
                )
            
            if response.status_code in HTTP_SUCCESS_CODES:
                return response.json()
            else:
                logger.error(f"❌ API error {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error processing image {image_path}: {e}")
            return None
    
    def process_image_url(self, image_url: str) -> Optional[Dict[str, Any]]:
        """
        Send image URL to Snapshot API
        
        Args:
            image_url: URL of the image
            
        Returns:
            API response dict or None if failed
        """
        headers = {
            'Authorization': f'Token {self.api_key}'
        }
        
        data = {
            'upload': image_url
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                data=data,
                timeout=30
            )
            
            if response.status_code in HTTP_SUCCESS_CODES:
                return response.json()
            else:
                logger.error(f"❌ API error {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error processing URL {image_url}: {e}")
            return None
    
    def extract_vehicle_data(self, api_response: Dict[str, Any], image_ref: str) -> Dict[str, Any]:
        """
        Extract relevant vehicle data from API response
        
        Args:
            api_response: Full API response
            image_ref: Image path or URL for reference
            
        Returns:
            Extracted data dictionary
        """
        results = api_response.get('results', [])
        
        # Extract data from first plate result (if any)
        plate_text = None
        plate_confidence = None
        bbox = None
        
        if results:
            first_result = results[0]
            plate = first_result.get('plate', '')
            plate_text = plate
            plate_confidence = first_result.get('score', 0.0)
            bbox = first_result.get('box', {})
        
        # Extract vehicle information
        vehicle_data = api_response.get('vehicle', {})
        makes_models = []
        colors = []
        
        if vehicle_data:
            # Extract makes and models
            if 'make_model' in vehicle_data:
                for mm in vehicle_data['make_model']:
                    makes_models.append({
                        'make': mm.get('make', ''),
                        'model': mm.get('model', ''),
                        'confidence': mm.get('score', 0.0)
                    })
            
            # Extract colors
            if 'color' in vehicle_data:
                for color_item in vehicle_data['color']:
                    colors.append({
                        'color': color_item.get('color', ''),
                        'confidence': color_item.get('score', 0.0)
                    })
        
        # Camera ID from API response
        camera_id = api_response.get('camera_id')
        
        # Timestamp
        timestamp_str = api_response.get('timestamp')
        captured_at = None
        if timestamp_str:
            try:
                captured_at = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except (ValueError, TypeError):
                captured_at = datetime.utcnow()
        else:
            captured_at = datetime.utcnow()
        
        return {
            'snapshot_ref': image_ref,
            'camera_id': camera_id,
            'captured_at': captured_at,
            'plate_text': plate_text,
            'plate_confidence': plate_confidence,
            'makes_models': makes_models if makes_models else None,
            'colors': colors if colors else None,
            'bbox': bbox,
            'raw_response': api_response,
            'image_url': image_ref if image_ref.startswith('http') else None,
        }
    
    def store_snapshot(self, vehicle_data: Dict[str, Any]) -> bool:
        """
        Store vehicle snapshot data in PostgreSQL
        
        Args:
            vehicle_data: Extracted vehicle data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            cursor = self.db_conn.cursor()
            
            insert_query = """
                INSERT INTO vehicle_snapshots (
                    snapshot_ref, camera_id, captured_at, plate_text, 
                    plate_confidence, makes_models, colors, bbox, 
                    raw_response, image_url
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(insert_query, (
                vehicle_data['snapshot_ref'],
                vehicle_data['camera_id'],
                vehicle_data['captured_at'],
                vehicle_data['plate_text'],
                vehicle_data['plate_confidence'],
                Json(vehicle_data['makes_models']) if vehicle_data['makes_models'] else None,
                Json(vehicle_data['colors']) if vehicle_data['colors'] else None,
                Json(vehicle_data['bbox']) if vehicle_data['bbox'] else None,
                Json(vehicle_data['raw_response']),
                vehicle_data['image_url']
            ))
            
            self.db_conn.commit()
            cursor.close()
            return True
            
        except Exception as e:
            logger.error(f"❌ Error storing snapshot: {e}")
            self.db_conn.rollback()
            return False
    
    def process_images_from_file(self, images_file: str):
        """
        Process images from a text file containing paths or URLs
        
        Args:
            images_file: Path to text file with image paths/URLs (one per line)
        """
        if not Path(images_file).exists():
            logger.error(f"❌ Images file not found: {images_file}")
            sys.exit(1)
        
        # Read image references
        with open(images_file, 'r', encoding='utf-8') as f:
            image_refs = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        
        if not image_refs:
            logger.warning("⚠️ No images found in file")
            return
        
        logger.info(f"📋 Found {len(image_refs)} images to process")
        self.stats['total'] = len(image_refs)
        
        # Connect to database
        self.connect_db()
        
        # Process each image with progress bar
        for image_ref in tqdm(image_refs, desc="Processing images"):
            try:
                # Determine if it's a URL or local file
                if image_ref.startswith('http://') or image_ref.startswith('https://'):
                    api_response = self.process_image_url(image_ref)
                else:
                    api_response = self.process_image_file(image_ref)
                
                if api_response:
                    # Check if plates were detected
                    results = api_response.get('results', [])
                    if not results:
                        logger.warning(f"⚠️ No plates detected in: {image_ref}")
                        self.stats['no_plates'] += 1
                    
                    # Extract and store data
                    vehicle_data = self.extract_vehicle_data(api_response, image_ref)
                    
                    if self.store_snapshot(vehicle_data):
                        self.stats['success'] += 1
                        logger.info(f"✅ Stored: {image_ref} - Plate: {vehicle_data.get('plate_text', 'N/A')}")
                    else:
                        self.stats['failed'] += 1
                else:
                    self.stats['failed'] += 1
                
                # Delay between requests to respect API rate limits
                time.sleep(REQUEST_DELAY)
                
            except Exception as e:
                logger.error(f"❌ Unexpected error processing {image_ref}: {e}")
                self.stats['failed'] += 1
        
        # Close database connection
        self.close_db()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print processing summary statistics"""
        logger.info("\n" + "="*60)
        logger.info("📊 PROCESSING SUMMARY / ملخص المعالجة")
        logger.info("="*60)
        logger.info(f"Total images processed / إجمالي الصور: {self.stats['total']}")
        logger.info(f"Successfully stored / تم التخزين بنجاح: {self.stats['success']}")
        logger.info(f"Failed / فشل: {self.stats['failed']}")
        logger.info(f"No plates detected / لم يتم اكتشاف لوحات: {self.stats['no_plates']}")
        logger.info("="*60)


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python snapshot_to_postgres.py <images_file.txt>")
        print("Example: python snapshot_to_postgres.py images.txt")
        sys.exit(1)
    
    images_file = sys.argv[1]
    
    logger.info("🚀 Starting Plate Recognizer Snapshot Processor")
    logger.info(f"📁 Images file: {images_file}")
    logger.info(f"🔗 API URL: {SNAPSHOT_API_URL}")
    logger.info(f"⏱️ Request delay: {REQUEST_DELAY} seconds")
    
    processor = SnapshotProcessor()
    processor.process_images_from_file(images_file)
    
    logger.info("✅ Processing complete!")


if __name__ == '__main__':
    main()
