#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سكريبت لإضافة بيانات تجريبية لقاعدة البيانات
Script to add sample data to the database

استخدام / Usage:
    python setup_sample_database.py
"""

import sqlite3
from datetime import datetime

def setup_database():
    """إنشاء وتهيئة قاعدة البيانات مع بيانات تجريبية"""
    
    print("\n" + "="*60)
    print("🗄️  إعداد قاعدة البيانات / Database Setup")
    print("="*60 + "\n")
    
    conn = sqlite3.connect('vehicles.db')
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
    print("✓ تم إنشاء جدول المركبات / Vehicles table created")
    
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
    print("✓ تم إنشاء جدول المخالفات / Violations table created")
    
    # بيانات تجريبية للمركبات
    sample_vehicles = [
        ('ABC-1234', 'أحمد محمد علي', 'A-101', 'سيارة خاصة', 'Toyota', 'Camry', 2023, 'أبيض', 'STK-001'),
        ('XYZ-5678', 'محمد أحمد حسن', 'B-205', 'سيارة خاصة', 'Honda', 'Accord', 2022, 'أسود', 'STK-002'),
        ('DEF-9012', 'سارة خالد محمد', 'C-310', 'سيارة خاصة', 'Hyundai', 'Sonata', 2021, 'فضي', 'STK-003'),
        ('GHI-3456', 'عمر عبدالله أحمد', 'D-420', 'سيارة نقل', 'Ford', 'F-150', 2020, 'أزرق', 'STK-004'),
        ('JKL-7890', 'فاطمة حسين علي', 'E-115', 'سيارة خاصة', 'Nissan', 'Altima', 2023, 'أحمر', 'STK-005'),
    ]
    
    added_count = 0
    for vehicle in sample_vehicles:
        try:
            cursor.execute("""
                INSERT INTO vehicles (plate, owner_name, unit_number, vehicle_type, make, model, year, color, sticker_number, registration_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, vehicle + (datetime.now().isoformat(),))
            added_count += 1
            print(f"  ✓ تم إضافة: {vehicle[0]} - {vehicle[1]}")
        except sqlite3.IntegrityError:
            print(f"  ⚠️  موجود مسبقاً: {vehicle[0]}")
    
    conn.commit()
    
    # عرض إحصائيات
    cursor.execute("SELECT COUNT(*) FROM vehicles")
    total_vehicles = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM violations")
    total_violations = cursor.fetchone()[0]
    
    print("\n" + "="*60)
    print("📊 إحصائيات قاعدة البيانات / Database Statistics")
    print("="*60)
    print(f"🚗 إجمالي المركبات: {total_vehicles}")
    print(f"⚠️  إجمالي المخالفات: {total_violations}")
    print(f"➕ تم إضافة: {added_count} مركبة جديدة")
    print("="*60 + "\n")
    
    conn.close()
    
    print("✅ تم إعداد قاعدة البيانات بنجاح!")
    print("\n💡 يمكنك الآن تشغيل: python plate_violation_processor.py")

def list_vehicles():
    """عرض جميع المركبات المسجلة"""
    
    conn = sqlite3.connect('vehicles.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT plate, owner_name, unit_number, make, model, color FROM vehicles ORDER BY plate")
    vehicles = cursor.fetchall()
    
    if vehicles:
        print("\n" + "="*80)
        print("📋 قائمة المركبات المسجلة / Registered Vehicles")
        print("="*80)
        print(f"{'رقم اللوحة':<15} {'المالك':<20} {'الوحدة':<10} {'الماركة':<12} {'الطراز':<12} {'اللون':<10}")
        print("-"*80)
        for vehicle in vehicles:
            print(f"{vehicle[0]:<15} {vehicle[1]:<20} {vehicle[2]:<10} {vehicle[3]:<12} {vehicle[4]:<12} {vehicle[5]:<10}")
        print("="*80 + "\n")
    else:
        print("\n⚠️  لا توجد مركبات مسجلة في قاعدة البيانات")
    
    conn.close()

if __name__ == '__main__':
    try:
        setup_database()
        list_vehicles()
    except Exception as e:
        print(f"\n❌ خطأ: {e}")
        import traceback
        traceback.print_exc()
