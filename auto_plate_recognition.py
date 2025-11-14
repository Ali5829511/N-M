#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
نظام التعرف التلقائي على لوحات السيارات
Automatic License Plate Recognition System

هذا السكريبت يقوم بمعالجة صور السيارات تلقائياً باستخدام Plate Recognizer API
ويسجل المخالفات للسيارات غير المصرح لها بدخول المواقف الخاصة.

This script automatically processes car images using Plate Recognizer API
and records violations for unauthorized vehicles in restricted parking areas.
"""

import os
import sys
import shutil
from datetime import datetime

# استيراد الأدوات المشتركة
from plate_recognition_utils import (
    DatabaseManager,
    PlateRecognizerAPI,
    ConfigManager,
    FileManager,
    print_banner,
    print_summary
)

# تحميل الإعدادات من ملف التكوين
# Load settings from configuration file
CONFIG_FILE = "plate_recognition_config.json"

class PlateRecognitionSystem:
    """نظام التعرف التلقائي على لوحات السيارات"""
    
    def __init__(self, config):
        """تهيئة النظام بالإعدادات المحددة"""
        self.api_token = config.get('api_token')
        self.api_url = config.get('api_url')
        self.input_folder = config.get('input_folder')
        self.output_folder = config.get('output_folder')
        self.violation_type = config.get('violation_type')
        self.fine_amount = config.get('fine_amount')
        self.officer_name = config.get('officer_name')
        
        # التحقق من صحة الإعدادات
        if not self.validate_config():
            raise ValueError("إعدادات غير صحيحة / Invalid configuration")
        
        # إنشاء المجلدات إذا لم تكن موجودة
        FileManager.create_directories(self.input_folder, self.output_folder)
        
        # إعداد قاعدة البيانات
        self.db_manager = DatabaseManager(config.get('database_name'))
        if not self.db_manager.connect():
            raise RuntimeError("فشل الاتصال بقاعدة البيانات / Failed to connect to database")
        self.db_manager.setup_tables()
        
        # إعداد واجهة API
        self.api = PlateRecognizerAPI(self.api_token, self.api_url)
    
    def validate_config(self):
        """التحقق من صحة الإعدادات"""
        if not self.api_token or self.api_token == "ضع هنا رمز API الخاص بك":
            print("❌ خطأ: لم يتم تعيين رمز API")
            print("❌ Error: API token not set")
            print(f"⚠️ يرجى تعديل ملف {CONFIG_FILE} وإضافة رمز API الصحيح")
            print(f"⚠️ Please edit {CONFIG_FILE} and add your API token")
            return False
        
        return True
    
    def handle_result(self, result, image_path):
        """التعامل مع نتيجة التحليل"""
        filename = os.path.basename(image_path)
        
        if not result:
            print(f"⚠️ لا توجد نتائج للصورة: {filename}")
            print(f"⚠️ No results for image: {filename}")
            return
        
        try:
            # استخراج البيانات
            plate_info = self.api.extract_plate_info(result)
            if not plate_info:
                print(f"⚠️ لم يتم اكتشاف لوحة في الصورة: {filename}")
                print(f"⚠️ No plate detected in image: {filename}")
                return
            
            plate = plate_info['plate']
            timestamp = plate_info['timestamp']
            
            print(f"\n📸 الصورة / Image: {filename}")
            print(f"🔍 اللوحة / Plate: {plate}")
            print(f"🚗 النوع / Type: {plate_info['brand']} {plate_info['model']}")
            print(f"🎨 اللون / Color: {plate_info['color']}")
            print(f"⏰ الوقت / Time: {timestamp}")
            
            # التحقق من وجود السيارة في قاعدة البيانات
            vehicle = self.db_manager.get_vehicle(plate)
            
            if vehicle:
                # تسجيل مخالفة تلقائية
                car_id = vehicle[0]
                if self.db_manager.add_violation(
                    car_id, plate, self.violation_type, timestamp,
                    self.fine_amount, self.officer_name
                ):
                    print("✅ تم تسجيل مخالفة تلقائية")
                    print("✅ Violation recorded automatically")
            else:
                print("⚠️ السيارة غير موجودة في قاعدة البيانات")
                print("⚠️ Vehicle not found in database")
            
            # حفظ الصورة بعد المعالجة
            output_path = FileManager.copy_image(image_path, self.output_folder, filename)
            if output_path:
                print(f"📁 تم حفظ الصورة / Image saved: {output_path}")
            
        except Exception as e:
            print(f"⚠️ خطأ في معالجة النتيجة للصورة {filename}: {e}")
            print(f"⚠️ Error processing result for {filename}: {e}")
    
    def process_all_images(self):
        """معالجة جميع الصور في مجلد الإدخال"""
        print_banner("بدء معالجة الصور / Starting image processing")
        
        # البحث عن الصور
        images = FileManager.get_image_files(self.input_folder)
        
        if not images:
            print("⚠️ لا توجد صور في مجلد الإدخال")
            print("⚠️ No images found in input folder")
            print(f"📂 المجلد: {os.path.abspath(self.input_folder)}")
            print(f"📂 Folder: {os.path.abspath(self.input_folder)}")
            return
        
        print(f"📊 عدد الصور المكتشفة / Images found: {len(images)}\n")
        
        # معالجة كل صورة
        processed = 0
        errors = 0
        
        for i, filename in enumerate(images, 1):
            print(f"[{i}/{len(images)}] معالجة / Processing: {filename}")
            full_path = os.path.join(self.input_folder, filename)
            
            try:
                result = self.api.process_image(full_path)
                self.handle_result(result, full_path)
                processed += 1
            except Exception as e:
                print(f"❌ فشلت معالجة الصورة / Failed to process: {filename}")
                print(f"   الخطأ / Error: {e}")
                errors += 1
            
            print("-" * 60)
        
        # ملخص النتائج
        print_summary(processed, errors, len(images))
        print(f"📁 الصور المحفوظة في / Images saved in: {os.path.abspath(self.output_folder)}")
    
    def close(self):
        """إغلاق الاتصال بقاعدة البيانات"""
        self.db_manager.close()

def main():
    """الدالة الرئيسية"""
    print_banner("نظام التعرف التلقائي على لوحات السيارات\nAutomatic License Plate Recognition System")
    
    # تحميل أو إنشاء الإعدادات
    config = ConfigManager.load_config(CONFIG_FILE)
    
    if not config:
        print("⚠️ ملف الإعدادات غير موجود، سيتم إنشاء واحد افتراضي...")
        print("⚠️ Config file not found, creating default...")
        config = ConfigManager.create_default_config(CONFIG_FILE)
        if not config:
            print("❌ فشل في إنشاء ملف الإعدادات")
            print("❌ Failed to create config file")
            return 1
        print("\n⚠️ يرجى تعديل ملف الإعدادات ثم إعادة تشغيل السكريبت")
        print("⚠️ Please edit the config file and run the script again")
        return 1
    
    try:
        # إنشاء نظام التعرف
        system = PlateRecognitionSystem(config)
        
        # معالجة جميع الصور
        system.process_all_images()
        
        # إغلاق النظام
        system.close()
        
        print("\n✅ اكتملت المعالجة بنجاح")
        print("✅ Processing completed successfully\n")
        return 0
        
    except KeyboardInterrupt:
        print("\n\n⏹️ تم إيقاف المعالجة من قبل المستخدم")
        print("⏹️ Processing stopped by user\n")
        return 0
    except Exception as e:
        print(f"\n❌ خطأ عام: {e}")
        print(f"❌ General error: {e}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
