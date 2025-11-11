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
import requests
import sqlite3
import json
from datetime import datetime
from pathlib import Path

# تحميل الإعدادات من ملف التكوين
# Load settings from configuration file
CONFIG_FILE = "plate_recognition_config.json"

def load_config():
    """تحميل الإعدادات من ملف التكوين أو إنشاء إعدادات افتراضية"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ خطأ في قراءة ملف الإعدادات: {e}")
            print(f"⚠️ Error reading config file: {e}")
            return None
    return None

def create_default_config():
    """إنشاء ملف إعدادات افتراضي"""
    default_config = {
        "api_token": "ضع هنا رمز API الخاص بك",
        "api_url": "https://api.platerecognizer.com/v1/plate-reader/",
        "input_folder": "images",
        "output_folder": "processed_images",
        "database_name": "traffic.db",
        "violation_type": "دخول موقف خاص بدون تصريح",
        "fine_amount": 1000,
        "officer_name": "نظام تلقائي",
        "auto_process": True
    }
    
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(default_config, f, ensure_ascii=False, indent=4)
        print(f"✅ تم إنشاء ملف الإعدادات: {CONFIG_FILE}")
        print(f"✅ Configuration file created: {CONFIG_FILE}")
        print(f"⚠️ يرجى تعديل الملف وإضافة رمز API الخاص بك")
        print(f"⚠️ Please edit the file and add your API token")
        return default_config
    except Exception as e:
        print(f"❌ فشل إنشاء ملف الإعدادات: {e}")
        print(f"❌ Failed to create config file: {e}")
        return None

class PlateRecognitionSystem:
    """نظام التعرف التلقائي على لوحات السيارات"""
    
    def __init__(self, config):
        """تهيئة النظام بالإعدادات المحددة"""
        self.api_token = config.get('api_token')
        self.api_url = config.get('api_url')
        self.input_folder = config.get('input_folder')
        self.output_folder = config.get('output_folder')
        self.database_name = config.get('database_name')
        self.violation_type = config.get('violation_type')
        self.fine_amount = config.get('fine_amount')
        self.officer_name = config.get('officer_name')
        
        # التحقق من صحة الإعدادات
        if not self.validate_config():
            raise ValueError("إعدادات غير صحيحة / Invalid configuration")
        
        # إنشاء المجلدات إذا لم تكن موجودة
        self.create_directories()
        
        # الاتصال بقاعدة البيانات
        self.conn = None
        self.cursor = None
        self.setup_database()
    
    def validate_config(self):
        """التحقق من صحة الإعدادات"""
        if not self.api_token or self.api_token == "ضع هنا رمز API الخاص بك":
            print("❌ خطأ: لم يتم تعيين رمز API")
            print("❌ Error: API token not set")
            print(f"⚠️ يرجى تعديل ملف {CONFIG_FILE} وإضافة رمز API الصحيح")
            print(f"⚠️ Please edit {CONFIG_FILE} and add your API token")
            return False
        
        return True
    
    def create_directories(self):
        """إنشاء المجلدات المطلوبة"""
        try:
            Path(self.input_folder).mkdir(parents=True, exist_ok=True)
            Path(self.output_folder).mkdir(parents=True, exist_ok=True)
            print(f"✅ المجلدات جاهزة: {self.input_folder}, {self.output_folder}")
            print(f"✅ Folders ready: {self.input_folder}, {self.output_folder}")
        except Exception as e:
            print(f"⚠️ خطأ في إنشاء المجلدات: {e}")
            print(f"⚠️ Error creating folders: {e}")
    
    def setup_database(self):
        """إعداد قاعدة البيانات والجداول"""
        try:
            self.conn = sqlite3.connect(self.database_name)
            self.cursor = self.conn.cursor()
            
            # إنشاء جدول السيارات
            self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS cars (
                car_id INTEGER PRIMARY KEY AUTOINCREMENT,
                plate_number TEXT UNIQUE NOT NULL,
                owner_name TEXT,
                model TEXT,
                year INTEGER,
                color TEXT
            )
            """)
            
            # إنشاء جدول المخالفات
            self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS violations (
                violation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                car_id INTEGER NOT NULL,
                violation_type TEXT NOT NULL,
                violation_date TEXT NOT NULL,
                fine_amount REAL NOT NULL,
                officer_name TEXT,
                FOREIGN KEY (car_id) REFERENCES cars(car_id)
            )
            """)
            
            self.conn.commit()
            print("✅ قاعدة البيانات جاهزة")
            print("✅ Database ready")
            
        except Exception as e:
            print(f"❌ خطأ في إعداد قاعدة البيانات: {e}")
            print(f"❌ Error setting up database: {e}")
            raise
    
    def process_image(self, image_path):
        """تحليل صورة واحدة باستخدام API"""
        try:
            with open(image_path, "rb") as img:
                response = requests.post(
                    self.api_url,
                    files={"upload": img},
                    headers={"Authorization": f"Token {self.api_token}"},
                    timeout=30
                )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"⚠️ خطأ في الاستجابة: {response.status_code}")
                print(f"⚠️ Response error: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"⚠️ خطأ في الاتصال بـ API: {e}")
            print(f"⚠️ API connection error: {e}")
            return None
        except Exception as e:
            print(f"⚠️ خطأ في معالجة الصورة: {e}")
            print(f"⚠️ Image processing error: {e}")
            return None
    
    def handle_result(self, result, image_path):
        """التعامل مع نتيجة التحليل"""
        filename = os.path.basename(image_path)
        
        if not result:
            print(f"⚠️ لا توجد نتائج للصورة: {filename}")
            print(f"⚠️ No results for image: {filename}")
            return
        
        try:
            # التحقق من وجود نتائج
            if not result.get('results') or len(result['results']) == 0:
                print(f"⚠️ لم يتم اكتشاف لوحة في الصورة: {filename}")
                print(f"⚠️ No plate detected in image: {filename}")
                return
            
            # استخراج البيانات
            plate = result['results'][0]['plate']
            timestamp = result.get('timestamp', datetime.now().isoformat())
            
            vehicle = result.get('vehicle', {})
            brand = vehicle.get('make', [{}])[0].get('name', 'غير معروف') if vehicle.get('make') else 'غير معروف'
            model = vehicle.get('model', [{}])[0].get('name', 'غير معروف') if vehicle.get('model') else 'غير معروف'
            color = vehicle.get('color', [{}])[0].get('name', 'غير معروف') if vehicle.get('color') else 'غير معروف'
            
            print(f"\n📸 الصورة / Image: {filename}")
            print(f"🔍 اللوحة / Plate: {plate}")
            print(f"🚗 النوع / Type: {brand} {model}")
            print(f"🎨 اللون / Color: {color}")
            print(f"⏰ الوقت / Time: {timestamp}")
            
            # التحقق من وجود السيارة في قاعدة البيانات
            self.cursor.execute("SELECT car_id FROM cars WHERE plate_number = ?", (plate,))
            car = self.cursor.fetchone()
            
            if car:
                # تسجيل مخالفة تلقائية
                self.cursor.execute("""
                INSERT INTO violations (car_id, violation_type, violation_date, fine_amount, officer_name)
                VALUES (?, ?, ?, ?, ?)
                """, (car[0], self.violation_type, timestamp, self.fine_amount, self.officer_name))
                self.conn.commit()
                print("✅ تم تسجيل مخالفة تلقائية")
                print("✅ Violation recorded automatically")
            else:
                print("⚠️ السيارة غير موجودة في قاعدة البيانات")
                print("⚠️ Vehicle not found in database")
            
            # حفظ الصورة بعد المعالجة
            output_path = os.path.join(self.output_folder, filename)
            shutil.copy(image_path, output_path)
            print(f"📁 تم حفظ الصورة / Image saved: {output_path}")
            
        except Exception as e:
            print(f"⚠️ خطأ في معالجة النتيجة للصورة {filename}: {e}")
            print(f"⚠️ Error processing result for {filename}: {e}")
    
    def process_all_images(self):
        """معالجة جميع الصور في مجلد الإدخال"""
        print("\n" + "=" * 60)
        print("🚀 بدء معالجة الصور / Starting image processing")
        print("=" * 60 + "\n")
        
        # البحث عن الصور
        image_extensions = ('.jpg', '.jpeg', '.png', '.bmp')
        images = [f for f in os.listdir(self.input_folder) 
                 if f.lower().endswith(image_extensions)]
        
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
                result = self.process_image(full_path)
                self.handle_result(result, full_path)
                processed += 1
            except Exception as e:
                print(f"❌ فشلت معالجة الصورة / Failed to process: {filename}")
                print(f"   الخطأ / Error: {e}")
                errors += 1
            
            print("-" * 60)
        
        # ملخص النتائج
        print("\n" + "=" * 60)
        print("📊 ملخص المعالجة / Processing Summary")
        print("=" * 60)
        print(f"✅ تمت معالجتها بنجاح / Successfully processed: {processed}")
        print(f"❌ فشلت / Failed: {errors}")
        print(f"📁 الصور المحفوظة في / Images saved in: {os.path.abspath(self.output_folder)}")
        print("=" * 60 + "\n")
    
    def close(self):
        """إغلاق الاتصال بقاعدة البيانات"""
        if self.conn:
            self.conn.close()
            print("✅ تم إغلاق الاتصال بقاعدة البيانات")
            print("✅ Database connection closed")

def main():
    """الدالة الرئيسية"""
    print("\n" + "=" * 60)
    print("🚗 نظام التعرف التلقائي على لوحات السيارات")
    print("🚗 Automatic License Plate Recognition System")
    print("=" * 60 + "\n")
    
    # تحميل أو إنشاء الإعدادات
    config = load_config()
    
    if not config:
        print("⚠️ ملف الإعدادات غير موجود، سيتم إنشاء واحد افتراضي...")
        print("⚠️ Config file not found, creating default...")
        config = create_default_config()
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
