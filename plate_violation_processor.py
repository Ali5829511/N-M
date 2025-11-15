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
from datetime import datetime

# استيراد الأدوات المشتركة
from plate_recognition_utils import (
    DatabaseManager,
    PlateRecognizerAPI,
    FileManager,
    print_banner,
    print_summary
)

# Check for required dependencies for reports
try:
    from fpdf import FPDF
    import pandas as pd
except ImportError as e:
    print(f"❌ خطأ: المكتبة غير مثبتة - {e}")
    print("   يرجى تشغيل: pip install -r requirements.txt")
    print("   Please run: pip install -r requirements.txt")
    exit(1)

# إعدادات المجلدات وقاعدة البيانات
# Folder and database settings
input_folder = 'input_images'
output_folder = 'output_reports'
db_path = 'vehicles.db'

# إعدادات Plate Recognizer API
# Plate Recognizer API settings
PLATE_RECOGNIZER_API_KEY = os.environ.get('PLATE_RECOGNIZER_API_KEY', 'YOUR_API_KEY')
PLATE_RECOGNIZER_API_URL = 'https://api.platerecognizer.com/v1/plate-reader/'

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
    print_banner("نظام معالجة المخالفات - Violation Processing System")
    
    # تهيئة قاعدة البيانات
    db_manager = DatabaseManager(db_path)
    if not db_manager.connect():
        print("❌ فشل الاتصال بقاعدة البيانات")
        return
    db_manager.setup_tables()
    
    # التحقق من وجود مجلد الإدخال
    FileManager.create_directories(input_folder, output_folder)
    
    # التحقق من API Key
    if PLATE_RECOGNIZER_API_KEY == 'YOUR_API_KEY':
        print("⚠️  تحذير: يرجى تعيين PLATE_RECOGNIZER_API_KEY في متغيرات البيئة")
        print("   Warning: Please set PLATE_RECOGNIZER_API_KEY environment variable")
        return
    
    # إعداد واجهة API
    api = PlateRecognizerAPI(PLATE_RECOGNIZER_API_KEY, PLATE_RECOGNIZER_API_URL)
    
    violations = []
    processed_count = 0
    found_count = 0
    not_found_count = 0
    
    # معالجة جميع الصور في مجلد الإدخال
    image_files = FileManager.get_image_files(input_folder)
    
    if not image_files:
        print(f"⚠️  لا توجد صور في مجلد الإدخال: {input_folder}")
        return
    
    print(f"📸 تم العثور على {len(image_files)} صورة للمعالجة\n")
    
    for filename in image_files:
        image_path = os.path.join(input_folder, filename)
        print(f"🔍 معالجة: {filename}")
        
        # تحليل الصورة
        result = api.process_image(image_path)
        
        if result:
            plate_info = api.extract_plate_info(result)
            if plate_info:
                plate = plate_info['plate']
                confidence = plate_info['confidence']
                print(f"   ✓ تم التعرف على اللوحة: {plate} (دقة: {confidence*100:.1f}%)")
                
                # التحقق من وجود السيارة في قاعدة البيانات
                vehicle = db_manager.get_vehicle(plate)
                
                if vehicle:
                    found_count += 1
                    owner_name = vehicle[2] if len(vehicle) > 2 else ''
                    print(f"   ✓ السيارة موجودة في القاعدة - المالك: {owner_name}")
                    
                    # تسجيل المخالفة وحفظ الصورة
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    new_image_name = f"{timestamp}_{plate.replace(' ', '_')}_{filename}"
                    saved_path = FileManager.copy_image(image_path, output_folder, new_image_name)
                    
                    if saved_path and db_manager.add_violation(
                        vehicle[0], plate, 'دخول موقف خاص بدون تصريح',
                        plate_info['timestamp'], 0, 'النظام', saved_path
                    ):
                        violations.append((
                            plate,
                            owner_name,
                            saved_path,
                            plate_info['timestamp'],
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
        print_banner("توليد التقارير / Generating Reports")
        
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
    print_summary(processed_count, len(image_files) - processed_count, len(image_files))
    print(f"✓ مخالفات مسجلة: {found_count}")
    print(f"⚠️  سيارات غير مسجلة: {not_found_count}")
    print("=" * 60 + "\n")
    
    if violations:
        print(f"✅ تم توليد التقارير بنجاح في المجلد: {output_folder}")
    else:
        print("⚠️  لا توجد مخالفات لتوليد التقارير")
    
    # إغلاق قاعدة البيانات
    db_manager.close()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️  تم إيقاف البرنامج")
    except Exception as e:
        print(f"\n❌ خطأ: {e}")
        import traceback
        traceback.print_exc()
