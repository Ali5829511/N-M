#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام معالجة المخالفات من خلال تمييز اللوحات
Violation Processing System using Plate Recognition

هذا السكريبت يقوم بـ:
1. معالجة صور السيارات من مجلد الإدخال
2. التعرف على اللوحات باستخدام Plate Recognizer API
3. التحقق من السيارات في قاعدة البيانات
4. تسجيل المخالفات للسيارات الموجودة
5. توليد تقارير PDF و Excel

This script:
1. Processes car images from input folder
2. Recognizes plates using Plate Recognizer API
3. Checks vehicles in database
4. Logs violations for registered vehicles
5. Generates PDF and Excel reports
"""

import os
import sqlite3
import requests
from fpdf import FPDF
import pandas as pd
from PIL import Image
from datetime import datetime
import json

# إعدادات المجلدات وقاعدة البيانات
# Folder and database settings
input_folder = 'input_images'
output_folder = 'output_reports'
db_path = 'vehicles.db'

# إعدادات Plate Recognizer API
# Plate Recognizer API settings
PLATE_RECOGNIZER_API_KEY = os.environ.get('PLATE_RECOGNIZER_API_KEY', 'YOUR_API_KEY')
PLATE_RECOGNIZER_API_URL = 'https://api.platerecognizer.com/v1/plate-reader/'

def init_database():
    """
    تهيئة قاعدة البيانات وإنشاء الجداول
    Initialize database and create tables
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # إنشاء جدول المركبات
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plate TEXT UNIQUE NOT NULL,
            owner_name TEXT,
            unit_number TEXT,
            vehicle_type TEXT,
            make TEXT,
            model TEXT,
            year INTEGER,
            color TEXT,
            sticker_number TEXT,
            registration_date TEXT
        )
    """)
    
    # إنشاء جدول المخالفات
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS violations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plate TEXT NOT NULL,
            image_path TEXT,
            violation_date TEXT,
            violation_type TEXT DEFAULT 'دخول موقف خاص بدون تصريح',
            processed INTEGER DEFAULT 0,
            FOREIGN KEY (plate) REFERENCES vehicles(plate)
        )
    """)
    
    conn.commit()
    conn.close()
    print("✓ تم تهيئة قاعدة البيانات / Database initialized")

def analyze_image(image_path):
    """
    تحليل صورة واستخراج لوحة السيارة باستخدام Plate Recognizer API
    Analyze image and extract license plate using Plate Recognizer API
    
    Args:
        image_path: مسار الصورة / Path to image
        
    Returns:
        dict: معلومات اللوحة أو None / Plate information or None
    """
    try:
        with open(image_path, 'rb') as img_file:
            response = requests.post(
                PLATE_RECOGNIZER_API_URL,
                files={'upload': img_file},
                headers={'Authorization': f'Token {PLATE_RECOGNIZER_API_KEY}'},
                data={'regions': 'sa'}  # Saudi Arabia region
            )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('results'):
                result = data['results'][0]
                return {
                    'plate': result['plate'],
                    'confidence': result.get('score', 0),
                    'vehicle': result.get('vehicle', {}),
                    'timestamp': data.get('timestamp', datetime.now().isoformat())
                }
        else:
            print(f"⚠️  خطأ في API: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"⚠️  خطأ في معالجة الصورة {image_path}: {e}")
    
    return None

def check_vehicle(plate):
    """
    التحقق من السيارة في قاعدة البيانات
    Check vehicle in database
    
    Args:
        plate: رقم اللوحة / Plate number
        
    Returns:
        tuple: بيانات السيارة أو None / Vehicle data or None
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE plate=?", (plate,))
    result = cursor.fetchone()
    conn.close()
    return result

def log_violation(plate, image_path, violation_type='دخول موقف خاص بدون تصريح'):
    """
    تسجيل مخالفة
    Log violation
    
    Args:
        plate: رقم اللوحة / Plate number
        image_path: مسار الصورة الأصلية / Original image path
        violation_type: نوع المخالفة / Violation type
        
    Returns:
        str: مسار الصورة المحفوظة / Saved image path
    """
    # إنشاء مجلد الإخراج إذا لم يكن موجوداً
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # نسخ الصورة إلى مجلد الإخراج (نسخ بدلاً من نقل للحفاظ على الصورة الأصلية)
    image_name = os.path.basename(image_path)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    new_image_name = f"{timestamp}_{plate.replace(' ', '_')}_{image_name}"
    saved_path = os.path.join(output_folder, new_image_name)
    
    try:
        import shutil
        shutil.copy2(image_path, saved_path)
    except Exception as e:
        print(f"⚠️  خطأ في نسخ الصورة: {e}")
        saved_path = image_path
    
    # تسجيل المخالفة في قاعدة البيانات
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO violations (plate, image_path, violation_date, violation_type) VALUES (?, ?, ?, ?)",
        (plate, saved_path, datetime.now().isoformat(), violation_type)
    )
    conn.commit()
    conn.close()
    
    return saved_path

class PDFReport(FPDF):
    """
    تقرير PDF للمخالفات
    PDF Report for Violations
    """
    
    def header(self):
        """رأس الصفحة / Page header"""
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'Violation Report - تقرير المخالفات', 0, 1, 'C')
        self.ln(5)
    
    def footer(self):
        """تذييل الصفحة / Page footer"""
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
    
    def add_violation(self, plate, image_path, timestamp, owner_name=''):
        """
        إضافة مخالفة إلى التقرير
        Add violation to report
        """
        self.add_page()
        self.set_font('Arial', 'B', 14)
        self.cell(0, 10, f'Plate Number: {plate}', 0, 1)
        
        if owner_name:
            self.set_font('Arial', '', 12)
            self.cell(0, 8, f'Owner: {owner_name}', 0, 1)
        
        self.set_font('Arial', '', 10)
        self.cell(0, 8, f'Date: {timestamp}', 0, 1)
        self.ln(5)
        
        # إضافة الصورة إذا كانت موجودة
        if os.path.exists(image_path):
            try:
                # تحديد حجم الصورة بحيث تتناسب مع الصفحة
                img_width = 150
                self.image(image_path, x=30, w=img_width)
            except Exception as e:
                self.set_font('Arial', 'I', 10)
                self.cell(0, 10, f'Error loading image: {str(e)}', 0, 1)
        else:
            self.set_font('Arial', 'I', 10)
            self.cell(0, 10, 'Image not found', 0, 1)

def generate_excel_report(data, filename):
    """
    توليد تقرير Excel
    Generate Excel report
    
    Args:
        data: بيانات المخالفات / Violations data
        filename: اسم الملف / Filename
    """
    df = pd.DataFrame(data, columns=[
        'رقم اللوحة / Plate',
        'اسم المالك / Owner',
        'مسار الصورة / Image Path',
        'التاريخ / Date',
        'نوع المخالفة / Violation Type'
    ])
    df.to_excel(filename, index=False, engine='openpyxl')
    print(f"✓ تم إنشاء تقرير Excel: {filename}")

def main():
    """
    الدالة الرئيسية لمعالجة الصور وتوليد التقارير
    Main function to process images and generate reports
    """
    print("\n" + "="*60)
    print("🚗 نظام معالجة المخالفات - Violation Processing System")
    print("="*60 + "\n")
    
    # تهيئة قاعدة البيانات
    init_database()
    
    # التحقق من وجود مجلد الإدخال
    if not os.path.exists(input_folder):
        os.makedirs(input_folder)
        print(f"⚠️  تم إنشاء مجلد الإدخال: {input_folder}")
        print(f"   يرجى وضع الصور في هذا المجلد")
        return
    
    # التحقق من API Key
    if PLATE_RECOGNIZER_API_KEY == 'YOUR_API_KEY':
        print("⚠️  تحذير: يرجى تعيين PLATE_RECOGNIZER_API_KEY في متغيرات البيئة")
        print("   Warning: Please set PLATE_RECOGNIZER_API_KEY environment variable")
        return
    
    violations = []
    processed_count = 0
    found_count = 0
    not_found_count = 0
    
    # معالجة جميع الصور في مجلد الإدخال
    image_files = [f for f in os.listdir(input_folder) 
                   if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not image_files:
        print(f"⚠️  لا توجد صور في مجلد الإدخال: {input_folder}")
        return
    
    print(f"📸 تم العثور على {len(image_files)} صورة للمعالجة\n")
    
    for filename in image_files:
        image_path = os.path.join(input_folder, filename)
        print(f"🔍 معالجة: {filename}")
        
        # تحليل الصورة
        result = analyze_image(image_path)
        
        if result:
            plate = result['plate']
            confidence = result['confidence']
            print(f"   ✓ تم التعرف على اللوحة: {plate} (دقة: {confidence*100:.1f}%)")
            
            # التحقق من وجود السيارة في قاعدة البيانات
            vehicle = check_vehicle(plate)
            
            if vehicle:
                found_count += 1
                owner_name = vehicle[2] if len(vehicle) > 2 else ''
                print(f"   ✓ السيارة موجودة في القاعدة - المالك: {owner_name}")
                
                # تسجيل المخالفة
                saved_path = log_violation(plate, image_path)
                violations.append((
                    plate,
                    owner_name,
                    saved_path,
                    result['timestamp'],
                    'دخول موقف خاص بدون تصريح'
                ))
                print(f"   ✓ تم تسجيل المخالفة وحفظ الصورة")
            else:
                not_found_count += 1
                print(f"   ⚠️  السيارة غير موجودة في قاعدة البيانات")
            
            processed_count += 1
        else:
            print(f"   ✗ فشل التعرف على اللوحة")
        
        print()
    
    # توليد التقارير إذا وجدت مخالفات
    if violations:
        print("\n" + "="*60)
        print("📊 توليد التقارير / Generating Reports")
        print("="*60 + "\n")
        
        # تقرير PDF
        pdf = PDFReport()
        for plate, owner, img_path, timestamp, violation_type in violations:
            pdf.add_violation(plate, img_path, timestamp, owner)
        
        pdf_output = os.path.join(output_folder, f'violation_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf')
        pdf.output(pdf_output)
        print(f"✓ تم إنشاء تقرير PDF: {pdf_output}")
        
        # تقرير Excel
        excel_output = os.path.join(output_folder, f'violation_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx')
        generate_excel_report(violations, excel_output)
    
    # ملخص النتائج
    print("\n" + "="*60)
    print("📈 ملخص النتائج / Summary")
    print("="*60)
    print(f"📸 إجمالي الصور: {len(image_files)}")
    print(f"✓ تم التعرف عليها: {processed_count}")
    print(f"✓ مخالفات مسجلة: {found_count}")
    print(f"⚠️  سيارات غير مسجلة: {not_found_count}")
    print("="*60 + "\n")
    
    if violations:
        print(f"✅ تم توليد التقارير بنجاح في المجلد: {output_folder}")
    else:
        print("⚠️  لا توجد مخالفات لتوليد التقارير")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️  تم إيقاف البرنامج")
    except Exception as e:
        print(f"\n❌ خطأ: {e}")
        import traceback
        traceback.print_exc()
