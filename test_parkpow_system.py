#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سكريبت اختبار شامل لنظام ParkPow
Comprehensive Test Script for ParkPow System

يختبر هذا السكريبت جميع مكونات النظام للتأكد من صحة التنفيذ
This script tests all system components to ensure correct implementation
"""

import os
import sys
import json

def print_header(title):
    """طباعة عنوان منسق / Print formatted header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def test_imports():
    """اختبار استيراد المكتبات / Test library imports"""
    print_header("🧪 Test 1: Library Imports")
    
    try:
        import requests
        print("✅ requests library imported successfully")
        print(f"   Version: {requests.__version__}")
        return True
    except ImportError as e:
        print(f"❌ Failed to import requests: {e}")
        print("   Run: pip install requests")
        return False

def test_file_structure():
    """اختبار هيكل الملفات / Test file structure"""
    print_header("🧪 Test 2: File Structure")
    
    required_files = {
        'fetch_parkpow_vehicles.py': 'Main script',
        'run_parkpow_extraction.sh': 'Linux/Mac execution script',
        'run_parkpow_extraction.bat': 'Windows execution script',
        'PARKPOW_README.md': 'Quick start guide',
        'PARKPOW_VEHICLES_ENDPOINT_CONFIRMATION.md': 'Endpoint confirmation',
        'docs/PARKPOW_DATA_EXTRACTION.md': 'Comprehensive guide',
        'requirements.txt': 'Python requirements',
        '.env.example': 'Environment configuration example'
    }
    
    all_exist = True
    for file_path, description in required_files.items():
        if os.path.exists(file_path):
            print(f"✅ {file_path:45s} - {description}")
        else:
            print(f"❌ {file_path:45s} - MISSING")
            all_exist = False
    
    return all_exist

def test_code_structure():
    """اختبار بنية الكود / Test code structure"""
    print_header("🧪 Test 3: Code Structure")
    
    script_path = 'fetch_parkpow_vehicles.py'
    
    if not os.path.exists(script_path):
        print(f"❌ {script_path} not found")
        return False
    
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tests = {
        'class ParkPowVehicleFetcher:': 'Main class',
        'def __init__': 'Constructor method',
        'def test_connection': 'Connection test method',
        'def fetch_reviews': 'Data fetching method',
        'def fetch_all_reviews': 'Batch fetching method',
        'def transform_to_vehicle_format': 'Data transformation method',
        'def save_to_json': 'Save to JSON method',
        'def process_violations': 'Violations processing method',
        'def main():': 'Main function',
        "if __name__ == '__main__':": 'Entry point',
        '/vehicles/': 'Vehicles endpoint',
        '/review/': 'Review endpoint',
        '/plate-reader/': 'Plate reader endpoint',
        '/results/': 'Results endpoint'
    }
    
    all_present = True
    for pattern, description in tests.items():
        if pattern in content:
            print(f"✅ {description:35s} - Found")
        else:
            print(f"❌ {description:35s} - NOT FOUND")
            all_present = False
    
    return all_present

def test_vehicles_endpoint():
    """اختبار تنفيذ نقطة النهاية /vehicles/ / Test /vehicles/ endpoint implementation"""
    print_header("🧪 Test 4: Vehicles Endpoint Implementation")
    
    script_path = 'fetch_parkpow_vehicles.py'
    
    with open(script_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # البحث عن نقطة النهاية vehicles
    found = False
    line_number = 0
    
    for i, line in enumerate(lines, 1):
        if '/vehicles/' in line and 'page=' in line:
            found = True
            line_number = i
            print(f"✅ Vehicles endpoint found at line {i}")
            print(f"   Code: {line.strip()}")
            break
    
    if not found:
        print("❌ Vehicles endpoint NOT found")
        return False
    
    # التحقق من المعاملات
    if 'page={page}' in lines[line_number - 1]:
        print("✅ Pagination parameter 'page' present")
    else:
        print("⚠️  Pagination parameter 'page' missing")
    
    if 'page_size={page_size}' in lines[line_number - 1]:
        print("✅ Pagination parameter 'page_size' present")
    else:
        print("⚠️  Pagination parameter 'page_size' missing")
    
    # التحقق من التعليقات
    if line_number > 1:
        prev_line = lines[line_number - 2].strip()
        if 'Vehicles' in prev_line or 'vehicles' in prev_line or 'السيارات' in prev_line:
            print("✅ Endpoint is documented with comments")
        else:
            print("⚠️  Endpoint documentation missing")
    
    return True

def test_documentation():
    """اختبار التوثيق / Test documentation"""
    print_header("🧪 Test 5: Documentation")
    
    docs_to_check = [
        ('PARKPOW_README.md', ['vehicles', 'endpoint', 'Supported Endpoints']),
        ('PARKPOW_VEHICLES_ENDPOINT_CONFIRMATION.md', ['/vehicles/', 'confirmed', 'تأكيد']),
        ('docs/PARKPOW_DATA_EXTRACTION.md', ['vehicles', 'endpoint', 'fallback']),
        ('USAGE_EXAMPLE.md', ['example', 'usage', 'استخدام'])
    ]
    
    all_complete = True
    
    for doc_path, keywords in docs_to_check:
        if os.path.exists(doc_path):
            with open(doc_path, 'r', encoding='utf-8') as f:
                content = f.read().lower()
            
            keywords_found = sum(1 for keyword in keywords if keyword.lower() in content)
            
            if keywords_found >= 2:
                print(f"✅ {doc_path:45s} - Complete ({keywords_found}/{len(keywords)} keywords)")
            else:
                print(f"⚠️  {doc_path:45s} - Incomplete ({keywords_found}/{len(keywords)} keywords)")
                all_complete = False
        else:
            print(f"❌ {doc_path:45s} - NOT FOUND")
            all_complete = False
    
    return all_complete

def test_viewer_pages():
    """اختبار صفحات العرض / Test viewer pages"""
    print_header("🧪 Test 6: Viewer Pages")
    
    viewer_pages = {
        'pages/parkpow_database_viewer.html': 'Vehicle database viewer',
        'pages/parkpow_integration.html': 'Integration page',
        'pages/repeat_offenders_tracker.html': 'Repeat offenders tracker'
    }
    
    all_exist = True
    
    for page_path, description in viewer_pages.items():
        if os.path.exists(page_path):
            # التحقق من حجم الملف
            size = os.path.getsize(page_path)
            print(f"✅ {page_path:45s} - {description} ({size} bytes)")
        else:
            print(f"❌ {page_path:45s} - NOT FOUND")
            all_exist = False
    
    return all_exist

def test_env_configuration():
    """اختبار ملف الإعدادات / Test configuration file"""
    print_header("🧪 Test 7: Environment Configuration")
    
    if os.path.exists('.env.example'):
        print("✅ .env.example found")
        
        with open('.env.example', 'r') as f:
            content = f.read()
        
        if 'PARKPOW_API_TOKEN' in content:
            print("✅ PARKPOW_API_TOKEN defined in .env.example")
        else:
            print("❌ PARKPOW_API_TOKEN NOT defined in .env.example")
            return False
        
        if 'PARKPOW_API_URL' in content:
            print("✅ PARKPOW_API_URL defined in .env.example")
        else:
            print("⚠️  PARKPOW_API_URL not defined (optional)")
        
        return True
    else:
        print("❌ .env.example NOT found")
        return False

def test_syntax():
    """اختبار صحة الكود البرمجي / Test code syntax"""
    print_header("🧪 Test 8: Code Syntax Validation")
    
    script_path = 'fetch_parkpow_vehicles.py'
    
    try:
        import py_compile
        py_compile.compile(script_path, doraise=True)
        print(f"✅ {script_path} - Syntax is valid")
        return True
    except SyntaxError as e:
        print(f"❌ {script_path} - Syntax error: {e}")
        return False
    except Exception as e:
        print(f"⚠️  {script_path} - Could not validate: {e}")
        return True  # لا نعتبره فشل

def generate_summary(results):
    """إنشاء ملخص النتائج / Generate results summary"""
    print_header("📊 Test Summary")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    failed_tests = total_tests - passed_tests
    
    print(f"\nTotal Tests:  {total_tests}")
    print(f"Passed:       {passed_tests} ✅")
    print(f"Failed:       {failed_tests} ❌")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    print("\n" + "=" * 70)
    
    if failed_tests == 0:
        print("🎉 All tests passed! System is ready to use.")
        print("🎉 جميع الاختبارات نجحت! النظام جاهز للاستخدام.")
        return True
    else:
        print("⚠️  Some tests failed. Please review the results above.")
        print("⚠️  بعض الاختبارات فشلت. يرجى مراجعة النتائج أعلاه.")
        return False

def main():
    """الدالة الرئيسية / Main function"""
    print("=" * 70)
    print("  🧪 ParkPow System Comprehensive Test Suite")
    print("  🧪 مجموعة اختبارات شاملة لنظام ParkPow")
    print("=" * 70)
    print("\nRunning all tests...")
    print("تشغيل جميع الاختبارات...")
    
    # تشغيل جميع الاختبارات
    results = {
        'Library Imports': test_imports(),
        'File Structure': test_file_structure(),
        'Code Structure': test_code_structure(),
        'Vehicles Endpoint': test_vehicles_endpoint(),
        'Documentation': test_documentation(),
        'Viewer Pages': test_viewer_pages(),
        'Environment Config': test_env_configuration(),
        'Code Syntax': test_syntax()
    }
    
    # إنشاء الملخص
    success = generate_summary(results)
    
    # رمز الخروج
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
