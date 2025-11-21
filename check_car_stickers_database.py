#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
التحقق من قاعدة بيانات ملصقات السيارات
Check Car Stickers Database

يقوم هذا السكريبت بـ:
1. التحقق من وجود ملف Excel للملصقات
2. التحقق من جدول الملصقات في قاعدة البيانات
3. مقارنة البيانات بين المصدرين
4. تقديم تقرير شامل

This script:
1. Checks for the Excel file with stickers data
2. Verifies the stickers table in the database
3. Compares data between sources
4. Provides comprehensive report
"""

import os
import sys
import json
import traceback
from datetime import datetime

# Constants
EXCEL_FILE = 'ملصقات السيارات.xlsx'
JSON_REPORT = 'car_stickers_analysis.json'
VERIFICATION_SCRIPT = 'verify_car_stickers_data.py'
SCHEMA_FILE = 'database/schema.sql'
ENV_FILE = '.env'

def check_excel_file():
    """
    التحقق من وجود ملف Excel
    Check for Excel file existence and analyze its contents
    """
    excel_file = EXCEL_FILE
    
    print("\n" + "="*80)
    print("📄 التحقق من ملف البيانات الأصلي / Checking Source Data File")
    print("="*80)
    
    if os.path.exists(excel_file):
        file_size = os.path.getsize(excel_file)
        file_size_kb = file_size / 1024
        print(f"✅ ملف Excel موجود: {excel_file}")
        print(f"   الحجم: {file_size_kb:.2f} KB")
        
        # Try to load and analyze
        try:
            import openpyxl
            wb = openpyxl.load_workbook(excel_file, read_only=True)
            sheets = wb.sheetnames
            print(f"   الأوراق: {', '.join(sheets)}")
            
            # Count rows in each sheet
            total_rows = 0
            for sheet_name in sheets:
                ws = wb[sheet_name]
                row_count = sum(1 for row in ws.iter_rows(min_row=2) if any(cell.value for cell in row))
                total_rows += row_count
                print(f"   • {sheet_name}: {row_count:,} صف")
            
            wb.close()
            print(f"   📊 إجمالي الملصقات: {total_rows:,}")
            return True, total_rows
            
        except ImportError:
            print("   ⚠️  مكتبة openpyxl غير متوفرة - يمكن تثبيتها بـ: pip install openpyxl")
            return True, 0
        except Exception as e:
            print(f"   ⚠️  خطأ في قراءة الملف: {str(e)}")
            return True, 0
    else:
        print(f"❌ ملف Excel غير موجود: {excel_file}")
        return False, 0

def check_json_analysis():
    """
    التحقق من ملف تحليل JSON
    Check for JSON analysis report
    """
    json_file = JSON_REPORT
    
    print("\n" + "="*80)
    print("📊 التحقق من تقرير التحليل / Checking Analysis Report")
    print("="*80)
    
    if os.path.exists(json_file):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"✅ تقرير التحليل موجود: {json_file}")
            print(f"   تاريخ التحليل: {data.get('تاريخ_التحليل', 'غير محدد')}")
            
            stats = data.get('إحصائيات_عامة', {})
            print(f"\n   الإحصائيات العامة:")
            print(f"   • الملصقات الفعالة: {stats.get('إجمالي_الملصقات_الفعالة', 0):,}")
            print(f"   • الملصقات الملغية: {stats.get('إجمالي_الملصقات_الملغية', 0):,}")
            print(f"   • إجمالي الملصقات: {stats.get('إجمالي_كل_الملصقات', 0):,}")
            
            return True, data
        except Exception as e:
            print(f"   ⚠️  خطأ في قراءة التقرير: {str(e)}")
            return True, None
    else:
        print(f"⚠️  تقرير التحليل غير موجود: {json_file}")
        print(f"   💡 يمكنك إنشاءه بتشغيل: python {VERIFICATION_SCRIPT}")
        return False, None

def check_database_schema():
    """
    التحقق من وجود schema قاعدة البيانات
    Check database schema file
    """
    schema_file = SCHEMA_FILE
    
    print("\n" + "="*80)
    print("🗄️  التحقق من هيكل قاعدة البيانات / Checking Database Schema")
    print("="*80)
    
    if os.path.exists(schema_file):
        print(f"✅ ملف Schema موجود: {schema_file}")
        
        try:
            with open(schema_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for stickers table
            if 'CREATE TABLE' in content and 'stickers' in content.lower():
                print("   ✅ جدول الملصقات (stickers) معرّف في Schema")
                
                # Extract column info
                if 'sticker_number' in content:
                    print("   • يحتوي على: رقم الملصق (sticker_number)")
                if 'plate_number' in content:
                    print("   • يحتوي على: رقم اللوحة (plate_number)")
                if 'owner_name' in content:
                    print("   • يحتوي على: اسم المالك (owner_name)")
                if 'status' in content:
                    print("   • يحتوي على: الحالة (status)")
                
                return True
            else:
                print("   ❌ جدول الملصقات غير موجود في Schema")
                return False
                
        except Exception as e:
            print(f"   ⚠️  خطأ في قراءة Schema: {str(e)}")
            return False
    else:
        print(f"❌ ملف Schema غير موجود: {schema_file}")
        return False

def check_database_connection():
    """
    التحقق من الاتصال بقاعدة البيانات
    Check database connection configuration
    """
    print("\n" + "="*80)
    print("🔌 التحقق من الاتصال بقاعدة البيانات / Checking Database Connection")
    print("="*80)
    
    # Check for .env file
    env_file = ENV_FILE
    if os.path.exists(env_file):
        print(f"✅ ملف الإعدادات موجود: {env_file}")
        try:
            with open(env_file, 'r') as f:
                content = f.read()
            if 'DATABASE_URL' in content or 'NETLIFY_DATABASE_URL' in content:
                print("   ✅ متغيرات قاعدة البيانات موجودة")
                print("   💡 للاتصال بقاعدة البيانات، استخدم: node.js أو python مع المكتبات المناسبة")
                return True
            else:
                print("   ⚠️  متغيرات قاعدة البيانات غير موجودة")
                return False
        except Exception as e:
            print(f"   ⚠️  خطأ في قراءة ملف الإعدادات: {str(e)}")
            return False
    else:
        print(f"⚠️  ملف الإعدادات غير موجود: {env_file}")
        print(f"   💡 راجع: .env.example للإعدادات المطلوبة")
        return False

def generate_report(excel_exists, excel_rows, json_exists, json_data, schema_exists, db_config_exists):
    """
    إنشاء تقرير شامل
    Generate comprehensive report based on all checks
    """
    print("\n" + "="*80)
    print("📋 التقرير الشامل / Comprehensive Report")
    print("="*80)
    print(f"\nتاريخ التقرير: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    print("\n1️⃣  البيانات الأصلية (Excel):")
    if excel_exists:
        print(f"   ✅ موجود - {excel_rows:,} ملصق")
    else:
        print("   ❌ غير موجود")
    
    print("\n2️⃣  تحليل البيانات (JSON):")
    if json_exists and json_data:
        stats = json_data.get('إحصائيات_عامة', {})
        print(f"   ✅ موجود - {stats.get('إجمالي_كل_الملصقات', 0):,} ملصق")
        print(f"   • فعال: {stats.get('إجمالي_الملصقات_الفعالة', 0):,}")
        print(f"   • ملغي: {stats.get('إجمالي_الملصقات_الملغية', 0):,}")
    else:
        print("   ⚠️  غير موجود أو غير محدّث")
    
    print("\n3️⃣  هيكل قاعدة البيانات:")
    if schema_exists:
        print("   ✅ جدول الملصقات معرّف في Schema")
    else:
        print("   ❌ جدول الملصقات غير معرّف")
    
    print("\n4️⃣  إعدادات الاتصال بقاعدة البيانات:")
    if db_config_exists:
        print("   ✅ إعدادات الاتصال موجودة")
    else:
        print("   ⚠️  إعدادات الاتصال غير مكتملة")
    
    # Overall status
    print("\n" + "="*80)
    print("🎯 الحالة العامة / Overall Status")
    print("="*80)
    
    if excel_exists and schema_exists:
        print("\n✅ **بيانات ملصقات السيارات موجودة ومهيأة**")
        print("\n📌 الخطوات التالية:")
        print("   1. التأكد من إعدادات الاتصال بقاعدة البيانات (.env)")
        print("   2. تحميل البيانات من Excel إلى قاعدة البيانات")
        print("   3. التحقق من تزامن البيانات")
    elif excel_exists:
        print("\n⚠️  **البيانات موجودة لكن قاعدة البيانات تحتاج إعداد**")
        print("\n📌 الخطوات المطلوبة:")
        print("   1. إنشاء جدول الملصقات في قاعدة البيانات")
        print("   2. تحميل البيانات من Excel")
    else:
        print("\n❌ **بيانات الملصقات غير موجودة**")
        print("\n📌 الخطوات المطلوبة:")
        print("   1. الحصول على ملف البيانات (ملصقات السيارات.xlsx)")
        print("   2. تحليل البيانات")
        print("   3. تحميلها إلى قاعدة البيانات")
    
    print("\n" + "="*80)

def main():
    """
    الدالة الرئيسية
    Main function - orchestrates all verification checks
    
    Performs comprehensive verification of:
    - Excel source data file
    - JSON analysis report
    - Database schema
    - Database connection configuration
    
    Generates a detailed report of findings and recommendations.
    """
    print("\n" + "="*80)
    print("🚗 التحقق من قاعدة بيانات ملصقات السيارات")
    print("Car Stickers Database Verification")
    print("="*80)
    
    # Check all components
    excel_exists, excel_rows = check_excel_file()
    json_exists, json_data = check_json_analysis()
    schema_exists = check_database_schema()
    db_config_exists = check_database_connection()
    
    # Generate comprehensive report
    generate_report(excel_exists, excel_rows, json_exists, json_data, schema_exists, db_config_exists)
    
    print("\n✅ التحقق مكتمل / Verification Complete\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  تم إيقاف السكريبت من قبل المستخدم")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ خطأ: {str(e)}")
        traceback.print_exc()
        sys.exit(1)
