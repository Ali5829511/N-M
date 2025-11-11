#!/bin/bash

# دليل التشغيل السريع - نظام التعرف التلقائي على لوحات السيارات
# Quick Start Guide - Automatic Plate Recognition System

echo "=============================================================="
echo "🚗 نظام التعرف التلقائي على لوحات السيارات"
echo "🚗 Automatic License Plate Recognition System"
echo "=============================================================="
echo ""

# التحقق من وجود Python
echo "🔍 التحقق من متطلبات النظام / Checking system requirements..."
echo ""

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 غير موجود / Python 3 not found"
    echo "⚠️  يرجى تثبيت Python 3.7 أو أحدث من: https://python.org"
    echo "⚠️  Please install Python 3.7 or newer from: https://python.org"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ $PYTHON_VERSION"
echo ""

# تثبيت المتطلبات
echo "📦 تثبيت المتطلبات / Installing requirements..."
pip3 install -r requirements.txt
echo ""

# التحقق من وجود ملف الإعدادات
if [ ! -f "plate_recognition_config.json" ]; then
    echo "⚙️  إنشاء ملف الإعدادات / Creating configuration file..."
    python3 auto_plate_recognition.py
    echo ""
    echo "=============================================================="
    echo "📝 خطوات المتابعة / Next Steps:"
    echo "=============================================================="
    echo ""
    echo "1. احصل على API Token من Plate Recognizer:"
    echo "   Get API Token from Plate Recognizer:"
    echo "   👉 https://platerecognizer.com/signup/"
    echo ""
    echo "2. قم بتحرير ملف الإعدادات:"
    echo "   Edit the configuration file:"
    echo "   👉 nano plate_recognition_config.json"
    echo "   أو / or"
    echo "   👉 gedit plate_recognition_config.json"
    echo ""
    echo "3. ضع صور السيارات في مجلد images/"
    echo "   Place car images in images/ folder"
    echo ""
    echo "4. شغّل السكريبت مرة أخرى:"
    echo "   Run the script again:"
    echo "   👉 python3 auto_plate_recognition.py"
    echo ""
    echo "=============================================================="
    exit 0
fi

# إنشاء مجلد الصور إذا لم يكن موجوداً
if [ ! -d "images" ]; then
    mkdir images
    echo "✅ تم إنشاء مجلد images/"
    echo "✅ Created images/ folder"
fi

# التحقق من وجود صور
IMAGE_COUNT=$(find images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.bmp" \) 2>/dev/null | wc -l)

if [ "$IMAGE_COUNT" -eq 0 ]; then
    echo "⚠️  لا توجد صور في مجلد images/"
    echo "⚠️  No images found in images/ folder"
    echo ""
    echo "💡 ضع صور السيارات في مجلد images/ ثم شغّل السكريبت مرة أخرى"
    echo "💡 Place car images in images/ folder and run the script again"
    exit 0
fi

echo "✅ تم العثور على $IMAGE_COUNT صورة في مجلد images/"
echo "✅ Found $IMAGE_COUNT images in images/ folder"
echo ""

# تشغيل السكريبت
echo "🚀 بدء المعالجة / Starting processing..."
echo ""
python3 auto_plate_recognition.py

echo ""
echo "=============================================================="
echo "✅ تمت العملية / Process completed"
echo "=============================================================="
