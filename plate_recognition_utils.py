#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
وحدة الأدوات المشتركة للتعرف على لوحات السيارات
Shared utilities for plate recognition systems

هذه الوحدة تحتوي على وظائف مشتركة بين أنظمة التعرف على اللوحات
مع دعم التحقق من صحة اللوحات السعودية بدقة 100%

This module contains shared functions between plate recognition systems
with support for 100% accurate Saudi plate validation
"""

import os
import sqlite3
import json
from datetime import datetime
from pathlib import Path

# استيراد نظام التحقق من اللوحات السعودية
try:
    from saudi_plate_validator import SaudiPlateValidator
    SAUDI_VALIDATOR_AVAILABLE = True
except ImportError:
    SAUDI_VALIDATOR_AVAILABLE = False
    print("⚠️ تحذير: نظام التحقق من اللوحات السعودية غير متوفر")
    print("⚠️ Warning: Saudi plate validator not available")


class DatabaseManager:
    """مدير قاعدة البيانات - Database Manager"""
    
    def __init__(self, database_name='traffic.db'):
        """تهيئة مدير قاعدة البيانات"""
        self.database_name = database_name
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """الاتصال بقاعدة البيانات"""
        try:
            self.conn = sqlite3.connect(self.database_name)
            self.cursor = self.conn.cursor()
            return True
        except Exception as e:
            print(f"❌ خطأ في الاتصال بقاعدة البيانات: {e}")
            print(f"❌ Error connecting to database: {e}")
            return False
    
    def setup_tables(self):
        """إنشاء الجداول المطلوبة"""
        if not self.cursor:
            return False
        
        try:
            # إنشاء جدول السيارات
            self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS cars (
                car_id INTEGER PRIMARY KEY AUTOINCREMENT,
                plate_number TEXT UNIQUE NOT NULL,
                owner_name TEXT,
                model TEXT,
                year INTEGER,
                color TEXT,
                unit_number TEXT,
                vehicle_type TEXT,
                make TEXT,
                sticker_number TEXT,
                registration_date TEXT
            )
            """)
            
            # إنشاء جدول المخالفات
            self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS violations (
                violation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                car_id INTEGER,
                plate TEXT NOT NULL,
                violation_type TEXT NOT NULL,
                violation_date TEXT NOT NULL,
                fine_amount REAL NOT NULL,
                officer_name TEXT,
                image_path TEXT,
                processed INTEGER DEFAULT 0,
                FOREIGN KEY (car_id) REFERENCES cars(car_id)
            )
            """)
            
            self.conn.commit()
            print("✅ قاعدة البيانات جاهزة")
            print("✅ Database ready")
            return True
            
        except Exception as e:
            print(f"❌ خطأ في إعداد قاعدة البيانات: {e}")
            print(f"❌ Error setting up database: {e}")
            return False
    
    def get_vehicle(self, plate_number):
        """البحث عن سيارة برقم اللوحة"""
        if not self.cursor:
            return None
        
        try:
            self.cursor.execute(
                "SELECT * FROM cars WHERE plate_number = ?", 
                (plate_number,)
            )
            return self.cursor.fetchone()
        except Exception as e:
            print(f"⚠️ خطأ في البحث عن السيارة: {e}")
            return None
    
    def add_violation(self, car_id, plate, violation_type, violation_date, 
                     fine_amount, officer_name, image_path=None):
        """إضافة مخالفة جديدة"""
        if not self.cursor:
            return False
        
        try:
            self.cursor.execute("""
            INSERT INTO violations 
            (car_id, plate, violation_type, violation_date, fine_amount, officer_name, image_path)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (car_id, plate, violation_type, violation_date, fine_amount, 
                  officer_name, image_path))
            self.conn.commit()
            return True
        except Exception as e:
            print(f"⚠️ خطأ في إضافة المخالفة: {e}")
            return False
    
    def close(self):
        """إغلاق الاتصال بقاعدة البيانات"""
        if self.conn:
            self.conn.close()
            print("✅ تم إغلاق الاتصال بقاعدة البيانات")
            print("✅ Database connection closed")


class PlateRecognizerAPI:
    """واجهة برمجة التطبيقات للتعرف على اللوحات"""
    
    def __init__(self, api_token, api_url='https://api.platerecognizer.com/v1/plate-reader/'):
        """تهيئة واجهة API"""
        self.api_token = api_token
        self.api_url = api_url
    
    def process_image(self, image_path, regions='sa'):
        """معالجة صورة واحدة"""
        try:
            import requests
            
            with open(image_path, "rb") as img:
                response = requests.post(
                    self.api_url,
                    files={"upload": img},
                    headers={"Authorization": f"Token {self.api_token}"},
                    data={'regions': regions},
                    timeout=30
                )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"⚠️ خطأ في الاستجابة: {response.status_code}")
                print(f"⚠️ Response error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"⚠️ خطأ في معالجة الصورة: {e}")
            print(f"⚠️ Image processing error: {e}")
            return None
    
    def extract_plate_info(self, result):
        """استخراج معلومات اللوحة من النتيجة"""
        if not result or not result.get('results'):
            return None
        
        try:
            plate_data = result['results'][0]
            vehicle = result.get('vehicle', {})
            
            return {
                'plate': plate_data['plate'],
                'confidence': plate_data.get('score', 0),
                'timestamp': result.get('timestamp', datetime.now().isoformat()),
                'brand': vehicle.get('make', [{}])[0].get('name', 'غير معروف') if vehicle.get('make') else 'غير معروف',
                'model': vehicle.get('model', [{}])[0].get('name', 'غير معروف') if vehicle.get('model') else 'غير معروف',
                'color': vehicle.get('color', [{}])[0].get('name', 'غير معروف') if vehicle.get('color') else 'غير معروف'
            }
        except Exception as e:
            print(f"⚠️ خطأ في استخراج البيانات: {e}")
            return None


class ConfigManager:
    """مدير التكوين - Configuration Manager"""
    
    @staticmethod
    def load_config(config_file):
        """تحميل الإعدادات من ملف التكوين"""
        if os.path.exists(config_file):
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ خطأ في قراءة ملف الإعدادات: {e}")
                print(f"⚠️ Error reading config file: {e}")
                return None
        return None
    
    @staticmethod
    def create_default_config(config_file, api_token_placeholder="ضع هنا رمز API الخاص بك"):
        """إنشاء ملف إعدادات افتراضي"""
        default_config = {
            "api_token": api_token_placeholder,
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
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, ensure_ascii=False, indent=4)
            print(f"✅ تم إنشاء ملف الإعدادات: {config_file}")
            print(f"✅ Configuration file created: {config_file}")
            print(f"⚠️ يرجى تعديل الملف وإضافة رمز API الخاص بك")
            print(f"⚠️ Please edit the file and add your API token")
            return default_config
        except Exception as e:
            print(f"❌ فشل إنشاء ملف الإعدادات: {e}")
            print(f"❌ Failed to create config file: {e}")
            return None


class FileManager:
    """مدير الملفات - File Manager"""
    
    @staticmethod
    def create_directories(*dirs):
        """إنشاء المجلدات المطلوبة"""
        try:
            for directory in dirs:
                Path(directory).mkdir(parents=True, exist_ok=True)
            print(f"✅ المجلدات جاهزة / Folders ready")
            return True
        except Exception as e:
            print(f"⚠️ خطأ في إنشاء المجلدات: {e}")
            print(f"⚠️ Error creating folders: {e}")
            return False
    
    @staticmethod
    def get_image_files(folder, extensions=('.jpg', '.jpeg', '.png', '.bmp')):
        """الحصول على قائمة ملفات الصور"""
        if not os.path.exists(folder):
            return []
        
        return [f for f in os.listdir(folder) 
                if f.lower().endswith(extensions)]
    
    @staticmethod
    def copy_image(source_path, dest_folder, new_name=None):
        """نسخ صورة إلى مجلد الوجهة"""
        try:
            import shutil
            
            if not os.path.exists(dest_folder):
                os.makedirs(dest_folder)
            
            if new_name:
                dest_path = os.path.join(dest_folder, new_name)
            else:
                dest_path = os.path.join(dest_folder, os.path.basename(source_path))
            
            shutil.copy2(source_path, dest_path)
            return dest_path
        except Exception as e:
            print(f"⚠️ خطأ في نسخ الصورة: {e}")
            return None


def print_banner(title):
    """طباعة عنوان النظام"""
    print("\n" + "=" * 60)
    print(f"🚗 {title}")
    print("=" * 60 + "\n")


def print_summary(processed, errors, total):
    """طباعة ملخص المعالجة"""
    print("\n" + "=" * 60)
    print("📊 ملخص المعالجة / Processing Summary")
    print("=" * 60)
    print(f"📸 إجمالي الصور / Total images: {total}")
    print(f"✅ تمت معالجتها بنجاح / Successfully processed: {processed}")
    print(f"❌ فشلت / Failed: {errors}")
    print("=" * 60 + "\n")
