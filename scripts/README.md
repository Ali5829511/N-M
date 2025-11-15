# Scripts - سكريبتات التنفيذ

## 📁 محتويات المجلد - Folder Contents

هذا المجلد يحتوي على السكريبتات الآلية لتنفيذ عملية تنظيف الفروع.

---

## 🛠️ السكريبتات المتوفرة - Available Scripts

### 1. cleanup-branches.sh
**المنصة:** Linux / Mac / Unix  
**الحجم:** ~7 KB  
**الوظيفة:** حذف جميع الفروع غير المفيدة (53 فرع)

**الاستخدام:**
```bash
chmod +x cleanup-branches.sh
./cleanup-branches.sh
```

**الميزات:**
- ✅ نسخ احتياطي تلقائي (backup tag)
- ✅ تأكيد قبل التنفيذ
- ✅ عدادات للفروع المحذوفة
- ✅ معالجة الأخطاء
- ✅ تقرير نهائي مفصل

---

### 2. cleanup-branches.bat
**المنصة:** Windows  
**الحجم:** ~6 KB  
**الوظيفة:** نفس وظيفة cleanup-branches.sh لنظام Windows

**الاستخدام:**
```cmd
cleanup-branches.bat
```

**الميزات:**
- ✅ نسخ احتياطي تلقائي
- ✅ تأكيد قبل التنفيذ
- ✅ حذف تلقائي لـ 53 فرع
- ✅ تقرير نهائي

---

### 3. final-cleanup.sh (موصى به ⭐)
**المنصة:** Linux / Mac / Unix  
**الحجم:** ~8 KB  
**الوظيفة:** السكريبت النهائي المحسّن لحذف الفروع

**الاستخدام:**
```bash
chmod +x final-cleanup.sh
./final-cleanup.sh
```

**الميزات المتقدمة:**
- ✅ نسخ احتياطي محلي (local backup tag)
- ✅ تأكيد مع معلومات مفصلة
- ✅ حذف حسب الفئات (8 فئات)
- ✅ معالجة متقدمة للأخطاء
- ✅ عدادات تفصيلية (محذوف، فشل، مُتخطى)
- ✅ تحقق من وجود الفرع قبل الحذف
- ✅ رسائل ملونة وواضحة
- ✅ تقرير نهائي شامل

---

## 📋 الفروع المستهدفة للحذف - Target Branches

### المجموع: 53 فرع

1. **فروع الإصلاحات (10):**
   - fix-404-error-on-website
   - fix-and-publish
   - fix-build-command-issue
   - fix-issue-in-recent-update
   - fix-publish-directory-issue
   - fix-report-page-error
   - fix-report-page-issue
   - fix-uncommitted-changes-issue

2. **فروع المراجعة (7):**
   - review-and-deploy-site
   - review-and-publish-project
   - review-and-update-database
   - review-complete-system
   - review-entire-system
   - review-entire-system-again

3. **فروع التحديثات (6):**
   - update-and-publish
   - update-and-publish-new-changes
   - update-complete-system
   - update-latest-releases-for-deployment
   - update-unknown-parameters
   - update-visual-identity-system

4. **فروع التثبيت (2):**
   - install-dependencies-for-project
   - install-npm-dependencies

5. **فروع إعادة التصميم (5):**
   - redesign-dashboard-layout
   - redesign-home-page-professionally
   - refactor-duplicated-code
   - refactor-microphone-structure
   - restructure-project-files

6. **فروع الإضافات (6):**
   - add-back-button-to-traffic-violations
   - add-car-sticker-data
   - add-hidden-content-search
   - add-identity-verification-system
   - add-internet-publishing-link
   - add-local-server-infrastructure

7. **فروع النشر (4):**
   - publish-content
   - unlock-system-and-publish
   - connect-database-and-deploy

8. **فروع أخرى (17):**
   - check-stickers-data-existence
   - check-vehicle-sticker-page
   - cleanup-unrelated-files
   - complete-report-and-settings-page
   - create-page-if-not-exists
   - create-vehicles-database
   - design-comprehensive-traffic-system
   - enable-email-notifications
   - export-docker-image-format
   - improve-code-efficiency
   - link-pages-and-redesign-cards
   - remove-dashboard-page
   - replace-login-window-design
   - show-single-pages
   - verify-repo-connection
   - set-up-plate-recognizer-api
   - setup-local-server-version

9. **فرع Flyio (1):**
   - flyio-new-files

---

## ⚠️ تحذيرات مهمة - Important Warnings

### قبل التنفيذ:
1. ✅ تأكد من دمج PR في `main` أولاً
2. ✅ تأكد من أن `main` يحتوي على جميع الميزات
3. ✅ تأكد من وجود صلاحيات push للريبو
4. ⚠️ الحذف نهائي (لكن يمكن الاستعادة من backup)

### أثناء التنفيذ:
- السكريبت سيطلب تأكيد
- اكتب `yes` للمتابعة
- راقب الرسائل الظاهرة

### بعد التنفيذ:
- تحقق من أن `main` يعمل بشكل صحيح
- تأكد من بقاء فرع واحد فقط
- احذف فرع `copilot/consolidate-branches-into-one`

---

## 🛡️ النسخ الاحتياطي - Backup

### تلقائي:
السكريبت ينشئ تلقائياً نسخة احتياطية بصيغة:
```
backup-before-cleanup-YYYYMMDD-HHMMSS
```

### الاستعادة:
```bash
# عرض النسخ الاحتياطية
git tag | grep backup

# استعادة من نسخة
git checkout backup-before-cleanup-20251115-123456

# استعادة فرع محدد
git checkout -b restored-branch backup-tag-name
```

---

## 🚀 التنفيذ السريع - Quick Execution

### السكريبت الموصى به:

```bash
cd /home/runner/work/N-M/N-M
./scripts/final-cleanup.sh
```

هذا السكريبت سيقوم بـ:
1. ✅ عرض معلومات عن العملية
2. ✅ طلب تأكيد منك
3. ✅ إنشاء نسخة احتياطية
4. ✅ حذف 53 فرع حسب الفئات
5. ✅ عرض تقرير نهائي
6. ✅ إظهار الخطوات التالية

---

## 📊 النتيجة المتوقعة - Expected Result

```
قبل التنفيذ:
├── main
├── copilot/consolidate-branches-into-one
└── 53 فرع آخر

بعد التنفيذ:
├── main (نظام متكامل)
└── backup tag (للطوارئ)
```

---

## 🔍 استكشاف الأخطاء - Troubleshooting

### إذا فشل حذف فرع:
```bash
# حذف يدوي
git push origin --delete branch-name
```

### إذا كان الفرع محمي:
1. اذهب إلى GitHub Settings
2. Branches → Branch protection rules
3. أزل الحماية
4. حاول مرة أخرى

### إذا أردت التراجع:
```bash
# استعادة من backup
git checkout backup-tag-name
```

---

## 📞 الدعم - Support

للمزيد من المعلومات، راجع:
- 📘 ../BRANCH_MANAGEMENT_GUIDE.md
- 📗 ../INTEGRATED_SYSTEM_PLAN.md
- 📕 ../BRANCH_CLEANUP_ANALYSIS.md
- 📙 ../BRANCH_CONSOLIDATION_EXECUTION.md
- 📄 ../QUICK_EXECUTION_GUIDE.md
- 📊 ../UNIFIED_SYSTEM_SUMMARY.md

---

**تاريخ الإنشاء:** 2025-11-15  
**الإصدار:** 2.0.0  
**الحالة:** ✅ جاهز للاستخدام
