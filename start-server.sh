#!/bin/bash

# نظام إدارة المرور - سكريبت تشغيل الخادم المحلي
# Traffic Management System - Local Server Start Script

echo "═══════════════════════════════════════════════════════════"
echo "🚀 نظام إدارة المرور - خادم محلي"
echo "🚀 Traffic Management System - Local Server"
echo "═══════════════════════════════════════════════════════════"
echo ""

# التحقق من وجود Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js موجود / Node.js found"
    NODE_VERSION=$(node --version)
    echo "   الإصدار / Version: $NODE_VERSION"
    echo ""
    
    # التحقق من وجود المتطلبات
    if [ ! -d "node_modules" ]; then
        echo "📦 تثبيت المتطلبات / Installing dependencies..."
        npm install
        echo ""
    fi
    
    echo "🎯 اختر خيار التشغيل / Choose start option:"
    echo ""
    echo "  1) Express Server (موصى به / Recommended) ⭐"
    echo "  2) HTTP-Server (سريع / Fast)"
    echo "  3) Python Server (بسيط / Simple)"
    echo ""
    read -p "اختيارك / Your choice (1-3): " choice
    echo ""
    
    case $choice in
        1)
            echo "🚀 تشغيل Express Server..."
            npm start
            ;;
        2)
            echo "⚡ تشغيل HTTP-Server..."
            npm run start:http-server
            ;;
        3)
            if command -v python3 &> /dev/null; then
                echo "🐍 تشغيل Python Server..."
                npm run start:python
            else
                echo "❌ Python غير موجود / Python not found"
                echo "   استخدم خيار 1 أو 2 / Use option 1 or 2"
            fi
            ;;
        *)
            echo "❌ خيار غير صحيح / Invalid option"
            echo "   استخدم 1 أو 2 أو 3 / Use 1, 2, or 3"
            ;;
    esac
    
else
    echo "⚠️  Node.js غير موجود / Node.js not found"
    echo ""
    
    # التحقق من Python
    if command -v python3 &> /dev/null; then
        echo "✅ Python موجود / Python found"
        PYTHON_VERSION=$(python3 --version)
        echo "   الإصدار / Version: $PYTHON_VERSION"
        echo ""
        echo "🐍 تشغيل Python Server..."
        python3 -m http.server 8080
    else
        echo "❌ Python أيضاً غير موجود / Python also not found"
        echo ""
        echo "⚠️  يرجى تثبيت Node.js أو Python لتشغيل الخادم"
        echo "⚠️  Please install Node.js or Python to run the server"
        echo ""
        echo "📥 روابط التحميل / Download links:"
        echo "   Node.js: https://nodejs.org"
        echo "   Python:  https://python.org"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
