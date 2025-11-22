#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Retrieve Image from PostgreSQL Database
استرجاع الصور من قاعدة بيانات PostgreSQL

This script retrieves vehicle snapshot images from the database and saves them to files.
يسترجع هذا السكربت صور لقطات المركبات من قاعدة البيانات ويحفظها في ملفات.
"""

import os
import sys
import psycopg2
from pathlib import Path
from typing import Optional


def get_db_connection():
    """
    Create and return a database connection
    إنشاء وإرجاع اتصال بقاعدة البيانات
    """
    db_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', '5432')),
        'dbname': os.getenv('DB_NAME', 'traffic_system'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', '')
    }
    
    try:
        conn = psycopg2.connect(**db_params)
        return conn
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        raise


def list_snapshots(limit: int = 10):
    """
    List recent snapshots in the database
    عرض قائمة باللقطات الأخيرة في قاعدة البيانات
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n📋 Recent Snapshots / اللقطات الأخيرة:")
    print("="*80)
    
    sql = """
    SELECT id, snapshot_id, plate_number, plate_region, confidence, 
           image_mime, image_size, created_at
    FROM vehicle_snapshots 
    ORDER BY created_at DESC 
    LIMIT %s;
    """
    
    cursor.execute(sql, (limit,))
    results = cursor.fetchall()
    
    if not results:
        print("No snapshots found in database.")
        return
    
    print(f"{'ID':<6} {'Snapshot ID':<25} {'Plate':<12} {'Region':<8} {'Conf':<6} {'Type':<12} {'Size':<10} {'Date':<20}")
    print("-"*80)
    
    for row in results:
        id_, snap_id, plate, region, conf, mime, size, created = row
        plate = plate or 'N/A'
        region = region or 'N/A'
        conf = f"{conf*100:.1f}%" if conf else 'N/A'
        size_kb = f"{size/1024:.1f}KB" if size else 'N/A'
        created_str = created.strftime('%Y-%m-%d %H:%M:%S')
        
        print(f"{id_:<6} {snap_id:<25} {plate:<12} {region:<8} {conf:<6} {mime:<12} {size_kb:<10} {created_str:<20}")
    
    cursor.close()
    conn.close()


def retrieve_image(snapshot_id: int, output_dir: str = './retrieved_images') -> Optional[str]:
    """
    Retrieve an image from database and save to file
    استرجاع صورة من قاعدة البيانات وحفظها في ملف
    
    Args:
        snapshot_id: Database ID of the snapshot
        output_dir: Directory to save the image
    
    Returns:
        Path to saved image file or None if not found
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print(f"\n🔍 Retrieving snapshot ID: {snapshot_id}")
    
    sql = """
    SELECT image_data, image_mime, plate_number, snapshot_id, image_sha256
    FROM vehicle_snapshots 
    WHERE id = %s;
    """
    
    cursor.execute(sql, (snapshot_id,))
    result = cursor.fetchone()
    
    if not result:
        print(f"❌ Snapshot ID {snapshot_id} not found in database.")
        cursor.close()
        conn.close()
        return None
    
    image_data, mime_type, plate_number, snap_id, sha256 = result
    
    if not image_data:
        print(f"❌ No image data found for snapshot ID {snapshot_id}.")
        cursor.close()
        conn.close()
        return None
    
    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Determine file extension from MIME type
    ext_map = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/bmp': 'bmp'
    }
    ext = ext_map.get(mime_type, 'jpg')
    
    # Create filename
    plate_str = plate_number.replace(' ', '_') if plate_number else 'unknown'
    filename = f"snapshot_{snapshot_id}_{plate_str}_{sha256[:8]}.{ext}"
    filepath = output_path / filename
    
    # Write image data to file
    with open(filepath, 'wb') as f:
        f.write(image_data)
    
    print(f"✅ Image saved successfully!")
    print(f"   - File: {filepath}")
    print(f"   - Plate: {plate_number or 'N/A'}")
    print(f"   - Type: {mime_type}")
    print(f"   - Size: {len(image_data) / 1024:.2f} KB")
    print(f"   - SHA256: {sha256}")
    
    cursor.close()
    conn.close()
    
    return str(filepath)


def retrieve_all_images(output_dir: str = './retrieved_images', limit: Optional[int] = None):
    """
    Retrieve all images from database
    استرجاع جميع الصور من قاعدة البيانات
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = "SELECT id FROM vehicle_snapshots ORDER BY created_at DESC"
    if limit:
        sql += f" LIMIT {limit}"
    
    cursor.execute(sql)
    ids = [row[0] for row in cursor.fetchall()]
    
    cursor.close()
    conn.close()
    
    print(f"\n📦 Retrieving {len(ids)} snapshots...")
    
    for idx, snap_id in enumerate(ids, 1):
        print(f"\n[{idx}/{len(ids)}]", end=" ")
        retrieve_image(snap_id, output_dir)
    
    print(f"\n✅ All images retrieved to: {output_dir}")


def main():
    """
    Main entry point
    """
    print("🗂️ Plate Recognizer Image Retriever")
    print("="*60)
    
    if len(sys.argv) < 2:
        print("\n❌ Usage:")
        print("   python retrieve_images.py list [limit]")
        print("   python retrieve_images.py get <id> [output_dir]")
        print("   python retrieve_images.py all [output_dir] [limit]")
        print("\nExamples:")
        print("   python retrieve_images.py list")
        print("   python retrieve_images.py list 20")
        print("   python retrieve_images.py get 1")
        print("   python retrieve_images.py get 1 ./my_images")
        print("   python retrieve_images.py all")
        print("   python retrieve_images.py all ./all_images 50")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    try:
        if command == 'list':
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            list_snapshots(limit)
        
        elif command == 'get':
            if len(sys.argv) < 3:
                print("❌ Error: Snapshot ID required")
                print("   Usage: python retrieve_images.py get <id> [output_dir]")
                sys.exit(1)
            
            snapshot_id = int(sys.argv[2])
            output_dir = sys.argv[3] if len(sys.argv) > 3 else './retrieved_images'
            
            filepath = retrieve_image(snapshot_id, output_dir)
            if filepath:
                print(f"\n✅ Success! Image saved to: {filepath}")
        
        elif command == 'all':
            output_dir = sys.argv[2] if len(sys.argv) > 2 else './retrieved_images'
            limit = int(sys.argv[3]) if len(sys.argv) > 3 else None
            
            retrieve_all_images(output_dir, limit)
        
        else:
            print(f"❌ Unknown command: {command}")
            print("   Valid commands: list, get, all")
            sys.exit(1)
    
    except ValueError as e:
        print(f"❌ Invalid argument: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
