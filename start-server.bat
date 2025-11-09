@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM نظام إدارة المرور - سكريبت تشغيل الخادم المحلي
REM Traffic Management System - Local Server Start Script

echo ═══════════════════════════════════════════════════════════
echo 🚀 نظام إدارة المرور - خادم محلي
echo 🚀 Traffic Management System - Local Server
echo ═══════════════════════════════════════════════════════════
echo.

REM التحقق من وجود Node.js
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js موجود / Node.js found
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo    الإصدار / Version: !NODE_VERSION!
    echo.
    
    REM التحقق من وجود المتطلبات
    if not exist "node_modules" (
        echo 📦 تثبيت المتطلبات / Installing dependencies...
        call npm install
        echo.
    )
    
    echo 🎯 اختر خيار التشغيل / Choose start option:
    echo.
    echo   1^) Express Server ^(موصى به / Recommended^) ⭐
    echo   2^) HTTP-Server ^(سريع / Fast^)
    echo   3^) Python Server ^(بسيط / Simple^)
    echo.
    set /p choice="اختيارك / Your choice (1-3): "
    echo.
    
    if "!choice!"=="1" (
        echo 🚀 تشغيل Express Server...
        call npm start
    ) else if "!choice!"=="2" (
        echo ⚡ تشغيل HTTP-Server...
        call npm run start:http-server
    ) else if "!choice!"=="3" (
        where python >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            echo 🐍 تشغيل Python Server...
            call npm run start:python
        ) else (
            echo ❌ Python غير موجود / Python not found
            echo    استخدم خيار 1 أو 2 / Use option 1 or 2
        )
    ) else (
        echo ❌ خيار غير صحيح / Invalid option
        echo    استخدم 1 أو 2 أو 3 / Use 1, 2, or 3
    )
    
) else (
    echo ⚠️  Node.js غير موجود / Node.js not found
    echo.
    
    REM التحقق من Python
    where python >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Python موجود / Python found
        for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
        echo    الإصدار / Version: !PYTHON_VERSION!
        echo.
        echo 🐍 تشغيل Python Server...
        python -m http.server 8080
    ) else (
        echo ❌ Python أيضاً غير موجود / Python also not found
        echo.
        echo ⚠️  يرجى تثبيت Node.js أو Python لتشغيل الخادم
        echo ⚠️  Please install Node.js or Python to run the server
        echo.
        echo 📥 روابط التحميل / Download links:
        echo    Node.js: https://nodejs.org
        echo    Python:  https://python.org
    )
)

echo.
echo ═══════════════════════════════════════════════════════════
pause
