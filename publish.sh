#!/bin/bash
# Publish Script - نشر النظام
# Automated deployment helper for version 1.1.0

set -e

echo "=================================="
echo "🚀 نشر نظام إدارة المرور v1.1.0"
echo "🚀 Publishing Traffic Management System v1.1.0"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from the repository root.${NC}"
    exit 1
fi

# Check version
VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ Current Version: ${VERSION}${NC}"
echo ""

# Step 1: Check git status
echo "=================================="
echo "Step 1: Checking git status / فحص حالة Git"
echo "=================================="
git status
echo ""

# Step 2: Check if we're on the right branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "Current branch: ${GREEN}${BRANCH}${NC}"
echo ""

# Step 3: Run tests
echo "=================================="
echo "Step 2: Running tests / تشغيل الاختبارات"
echo "=================================="
npm run test:server
echo -e "${GREEN}✅ Tests passed!${NC}"
echo ""

# Step 4: Check deployment status
echo "=================================="
echo "Step 3: Checking deployment readiness / فحص جاهزية النشر"
echo "=================================="
if [ -f "check-deployment-status.js" ]; then
    npm run deploy:status
else
    echo -e "${YELLOW}⚠️  deploy:status script not found, skipping...${NC}"
fi
echo ""

# Step 5: Display manual steps
echo "=================================="
echo "Step 4: Manual steps required / خطوات يدوية مطلوبة"
echo "=================================="
echo ""
echo -e "${YELLOW}⚠️  The following steps must be completed manually:${NC}"
echo ""
echo "1. 🔓 Make repository public:"
echo "   Settings → Danger Zone → Change visibility → Make public"
echo "   الإعدادات ← منطقة الخطر ← تغيير الرؤية ← اجعله عاماً"
echo ""
echo "2. 📄 Enable GitHub Pages:"
echo "   Settings → Pages → Source: GitHub Actions"
echo "   الإعدادات ← Pages ← المصدر: GitHub Actions"
echo ""
echo "3. 🔀 Merge Pull Request:"
echo "   Go to: https://github.com/Ali5829511/N-M/pulls"
echo "   Merge the 'Version 1.1.0' PR"
echo "   ادمج Pull Request الخاص بالإصدار 1.1.0"
echo ""
echo "4. ⏱️  Wait for deployment (2-3 minutes)"
echo "   انتظر اكتمال النشر (2-3 دقائق)"
echo ""
echo "5. 🌐 Access the deployed site:"
echo "   https://ali5829511.github.io/N-M/"
echo ""
echo "=================================="
echo "Additional Resources / موارد إضافية:"
echo "=================================="
echo "📖 CHANGELOG.md - Version history"
echo "📖 RELEASE_NOTES.md - Release notes for v${VERSION}"
echo "📖 UPDATE_PUBLISH_SUMMARY.md - Complete deployment guide"
echo "📖 UNLOCK_AND_DEPLOY.md - Unlock and deploy instructions"
echo ""
echo "=================================="
echo "Default Login Credentials / بيانات الدخول:"
echo "=================================="
echo "Admin: admin / admin123"
echo "Violations Officer: violations_officer / violations123"
echo "Inquiry User: inquiry_user / inquiry123"
echo ""
echo -e "${RED}⚠️  Change passwords immediately after deployment!${NC}"
echo -e "${RED}⚠️  غيّر كلمات المرور فوراً بعد النشر!${NC}"
echo ""
echo "=================================="
echo -e "${GREEN}✅ Pre-deployment checks complete!${NC}"
echo -e "${GREEN}✅ اكتملت فحوصات ما قبل النشر!${NC}"
echo "=================================="
