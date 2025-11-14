#!/bin/bash
# سكريبت تشغيل سريع لاستخراج بيانات السيارات من ParkPow
# Quick start script for ParkPow vehicle data extraction

echo "======================================================"
echo "🚗 نظام استخراج بيانات السيارات من ParkPow"
echo "🚗 ParkPow Vehicle Data Extraction System"
echo "======================================================"
echo ""

# التحقق من وجود Python
if ! command -v python3 &> /dev/null; then
    echo "❌ خطأ: Python3 غير مثبت"
    echo "❌ Error: Python3 is not installed"
    exit 1
fi

echo "✅ Python3 متوفر"
echo ""

# التحقق من وجود المتطلبات
echo "🔍 التحقق من المكتبات المطلوبة..."
echo "🔍 Checking required libraries..."

if ! python3 -c "import requests" 2>/dev/null; then
    echo "⚠️  تثبيت المكتبات المطلوبة..."
    echo "⚠️  Installing required libraries..."
    pip3 install -r requirements.txt
fi

echo "✅ جميع المكتبات متوفرة"
echo ""

# التحقق من ملف .env
if [ ! -f .env ]; then
    echo "⚠️  ملف .env غير موجود"
    echo "⚠️  .env file not found"
    echo "📝 إنشاء من .env.example..."
    echo "📝 Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  يرجى تعديل ملف .env وإضافة PARKPOW_API_TOKEN الخاص بك"
    echo "⚠️  Please edit .env file and add your PARKPOW_API_TOKEN"
    echo ""
    read -p "اضغط Enter للمتابعة بعد تعديل .env / Press Enter after editing .env..."
fi

# تحميل متغيرات البيئة
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# التحقق من API Token
if [ -z "$PARKPOW_API_TOKEN" ]; then
    echo ""
    echo "⚠️  تحذير: PARKPOW_API_TOKEN غير مُعرّف"
    echo "⚠️  Warning: PARKPOW_API_TOKEN is not set"
    echo ""
    read -p "هل تريد إدخال API Token الآن؟ (y/n): " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        read -p "أدخل PARKPOW_API_TOKEN: " token
        export PARKPOW_API_TOKEN="$token"
    else
        echo "❌ لا يمكن المتابعة بدون API Token"
        echo "❌ Cannot continue without API Token"
        exit 1
    fi
fi

echo ""
echo "======================================================"
echo "🚀 بدء استخراج البيانات..."
echo "🚀 Starting data extraction..."
echo "======================================================"
echo ""

# تشغيل السكريبت
python3 fetch_parkpow_vehicles.py

# التحقق من النتيجة
if [ $? -eq 0 ]; then
    echo ""
    echo "======================================================"
    echo "✅ تمت العملية بنجاح!"
    echo "✅ Operation completed successfully!"
    echo "======================================================"
    echo ""
    echo "📁 تم حفظ البيانات في: data/parkpow_vehicles.json"
    echo "📁 Data saved to: data/parkpow_vehicles.json"
    echo ""
    echo "🌐 لعرض البيانات، افتح:"
    echo "🌐 To view data, open:"
    echo "   pages/parkpow_database_viewer.html"
    echo ""
    echo "📖 للمزيد من المعلومات، راجع:"
    echo "📖 For more information, see:"
    echo "   docs/PARKPOW_DATA_EXTRACTION.md"
    echo ""
else
    echo ""
    echo "======================================================"
    echo "❌ حدث خطأ أثناء الاستخراج"
    echo "❌ An error occurred during extraction"
    echo "======================================================"
    echo ""
    echo "📖 راجع الوثائق للمساعدة:"
    echo "📖 Check documentation for help:"
    echo "   docs/PARKPOW_DATA_EXTRACTION.md"
    echo ""
    exit 1
fi
