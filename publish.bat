@echo off
REM Publish Script for Windows - نشر النظام على Windows
REM نظام إدارة المرور v1.1.0

echo ==================================
echo ^🚀 نشر نظام إدارة المرور v1.1.0
echo ^🚀 Publishing Traffic Management System v1.1.0
echo ==================================
echo.

REM Check if package.json exists
if not exist package.json (
    echo ❌ Error: package.json not found. Run this script from the repository root.
    pause
    exit /b 1
)

REM Get version from package.json
echo ✅ Current Version: 1.1.0
echo.

REM Step 1: Check git status
echo ==================================
echo Step 1: Checking git status / فحص حالة Git
echo ==================================
git status
echo.

REM Step 2: Run tests
echo ==================================
echo Step 2: Running tests / تشغيل الاختبارات
echo ==================================
call npm run test:server
if errorlevel 1 (
    echo ❌ Tests failed!
    pause
    exit /b 1
)
echo ✅ Tests passed!
echo.

REM Step 3: Check deployment status
echo ==================================
echo Step 3: Checking deployment readiness / فحص جاهزية النشر
echo ==================================
if exist check-deployment-status.js (
    call npm run deploy:status
) else (
    echo ⚠️  deploy:status script not found, skipping...
)
echo.

REM Step 4: Display manual steps
echo ==================================
echo Step 4: Manual steps required / خطوات يدوية مطلوبة
echo ==================================
echo.
echo ⚠️  The following steps must be completed manually:
echo.
echo 1. ^🔓 Make repository public:
echo    Settings ^→ Danger Zone ^→ Change visibility ^→ Make public
echo    الإعدادات ^← منطقة الخطر ^← تغيير الرؤية ^← اجعله عاماً
echo.
echo 2. ^📄 Enable GitHub Pages:
echo    Settings ^→ Pages ^→ Source: GitHub Actions
echo    الإعدادات ^← Pages ^← المصدر: GitHub Actions
echo.
echo 3. ^🔀 Merge Pull Request:
echo    Go to: https://github.com/Ali5829511/N-M/pulls
echo    Merge the 'Version 1.1.0' PR
echo    ادمج Pull Request الخاص بالإصدار 1.1.0
echo.
echo 4. ^⏱️  Wait for deployment (2-3 minutes)
echo    انتظر اكتمال النشر (2-3 دقائق)
echo.
echo 5. ^🌐 Access the deployed site:
echo    https://ali5829511.github.io/N-M/
echo.
echo ==================================
echo Additional Resources / موارد إضافية:
echo ==================================
echo ^📖 CHANGELOG.md - Version history
echo ^📖 RELEASE_NOTES.md - Release notes for v1.1.0
echo ^📖 UPDATE_PUBLISH_SUMMARY.md - Complete deployment guide
echo ^📖 UNLOCK_AND_DEPLOY.md - Unlock and deploy instructions
echo ^📖 QUICK_PUBLISH_GUIDE.md - Quick publish guide
echo.
echo ==================================
echo Default Login Credentials / بيانات الدخول:
echo ==================================
echo Admin: admin / admin123
echo Violations Officer: violations_officer / violations123
echo Inquiry User: inquiry_user / inquiry123
echo.
echo ⚠️  Change passwords immediately after deployment!
echo ⚠️  غيّر كلمات المرور فوراً بعد النشر!
echo.
echo ==================================
echo ✅ Pre-deployment checks complete!
echo ✅ اكتملت فحوصات ما قبل النشر!
echo ==================================
echo.
pause
