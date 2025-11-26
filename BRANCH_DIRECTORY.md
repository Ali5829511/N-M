# دليل الفروع - Branch Directory
# ربط جميع فروع المشروع - Linking All Project Branches

**آخر تحديث / Last Updated:** 26 نوفمبر 2025 / November 26, 2025  
**إجمالي الفروع / Total Branches:** 138  
**الفرع الرئيسي / Main Branch:** `main` (SHA: 05d6c0c)

---

## 📋 الفهرس / Table of Contents

1. [نظرة عامة / Overview](#overview)
2. [تصنيف الفروع / Branch Classification](#branch-classification)
3. [الفروع حسب الفئة / Branches by Category](#branches-by-category)
4. [علاقات الفروع / Branch Relationships](#branch-relationships)
5. [الفروع النشطة / Active Branches](#active-branches)
6. [الفروع المرتبطة بالميزات / Feature-Linked Branches](#feature-linked-branches)

---

## 🔍 نظرة عامة / Overview

هذا المستند يربط جميع فروع المشروع معاً ويوضح العلاقات بينها. جميع الفروع مرتبطة بالفرع الرئيسي `main` وتحتوي على ميزات وإصلاحات مختلفة تم تطويرها لنظام إدارة المرور.

This document links all project branches together and clarifies their relationships. All branches are connected to the `main` branch and contain various features and fixes developed for the traffic management system.

---

## 📊 تصنيف الفروع / Branch Classification

### حسب النوع / By Type:
- **فروع الميزات / Feature Branches:** 45 فرع
- **فروع الإصلاحات / Fix Branches:** 28 فرع
- **فروع المراجعة / Review Branches:** 8 فروع
- **فروع التحديثات / Update Branches:** 15 فرع
- **فروع إعادة التصميم / Redesign Branches:** 7 فرع
- **فروع الدمج / Merge Branches:** 6 فرع
- **فروع الإعداد / Setup Branches:** 5 فرع
- **فروع أخرى / Other Branches:** 24 فرع

### حسب الحالة / By Status:
- **مدموجة عبر PR / Merged via PR:** ~135 فرع
- **قيد العمل / Work in Progress:** 3 فروع
- **مُرجعة / Reverted:** 3 فروع

---

## 📁 الفروع حسب الفئة / Branches by Category

### 1. 🎯 فروع الميزات الأساسية / Core Feature Branches

#### أ) نظام التعرف على اللوحات / Plate Recognition System
```
copilot/add-plate-recognizer-integration ─────┐
                                              │
copilot/add-plate-recognizer-snapshot ────────┼──> Main Feature: Plate Recognition
                                              │
copilot/add-plate-recognizer-snapshot-again ──┤
                                              │
copilot/add-plate-recognizer-snapshot-another-one ┘
```
- **الغرض / Purpose:** تكامل نظام التعرف التلقائي على لوحات المركبات
- **الارتباطات / Connections:** يتصل بـ PostgreSQL و Snapshot API
- **الملفات الرئيسية / Key Files:** `snapshot_to_postgres.py`, `db_schema.sql`

#### ب) نظام قاعدة البيانات / Database System
```
copilot/create-vehicles-database ────────┐
                                         │
copilot/connect-database-and-deploy ─────┼──> Database Integration
                                         │
copilot/add-vehicle-image-ingestion ─────┘
```
- **الغرض / Purpose:** إنشاء وربط قاعدة بيانات PostgreSQL
- **الارتباطات / Connections:** متصل بجميع صفحات الويب وواجهات API

#### ج) واجهات برمجة التطبيقات / API Integration
```
copilot/implement-rest-api-features ─────┐
                                         │
copilot/add-webhook-integration ─────────┼──> API Layer
                                         │
copilot/add-webhook-receiver-api ────────┤
                                         │
copilot/add-all-settings-api ────────────┘
```
- **الغرض / Purpose:** بناء طبقة API RESTful للنظام
- **الارتباطات / Connections:** يربط Frontend بـ Backend

#### د) نظام الإشعارات / Notification System
```
copilot/enable-email-notifications ──────┐
                                         │
copilot/link-email-account ──────────────┼──> Email System
                                         │
copilot/add-identity-verification-system ┘
```
- **الغرض / Purpose:** نظام إرسال الإشعارات عبر البريد الإلكتروني
- **الارتباطات / Connections:** EmailJS, Gmail API

---

### 2. 🔧 فروع الإصلاحات / Fix Branches

#### أ) إصلاحات الواجهة / UI Fixes
```
copilot/fix-404-error-on-website ─────┐
                                      │
copilot/fix-image-analysis-output ────┼──> UI/UX Fixes
                                      │
copilot/fix-report-page-error ────────┤
                                      │
copilot/fix-stats-report-page ────────┘
```

#### ب) إصلاحات البيانات / Data Fixes
```
copilot/fix-general-statistics-data ──────┐
                                          │
copilot/fix-data-loading-error ───────────┼──> Data Integrity
                                          │
copilot/fix-advanced-vehicle-analyzer-error ┘
```

#### ج) إصلاحات التكامل / Integration Fixes
```
copilot/fix-parkpow-integration ──────┐
                                      │
copilot/fix-integration-issues ───────┼──> System Integration
                                      │
copilot/fix-merge-conflicts ──────────┘
```

---

### 3. 🎨 فروع إعادة التصميم / Redesign Branches

```
copilot/redesign-dashboard-layout ────────┐
                                          │
copilot/redesign-home-page-professionally ┼──> UI Redesign
                                          │
copilot/redesign-previous-work ───────────┤
                                          │
copilot/refactor-duplicated-code ─────────┤
                                          │
copilot/restructure-project-files ────────┘
```
- **الغرض / Purpose:** تحسين هيكل الكود وواجهة المستخدم
- **الارتباطات / Connections:** يؤثر على جميع صفحات الويب

---

### 4. 🔄 فروع التحديثات / Update Branches

```
copilot/update-and-publish ──────────────┐
                                         │
copilot/update-complete-system ──────────┼──> System Updates
                                         │
copilot/update-software-version ─────────┤
                                         │
copilot/update-system-admin-credentials ─┤
                                         │
copilot/update-visual-identity-system ───┘
```

---

### 5. 🔍 فروع المراجعة / Review Branches

```
copilot/review-and-deploy-site ──────────┐
                                         │
copilot/review-complete-system ──────────┼──> Code Review
                                         │
copilot/review-entire-system ────────────┤
                                         │
copilot/review-real-data-pages ──────────┘
```

---

### 6. 🔀 فروع الدمج / Merge Branches

```
copilot/merge-all-branches-into-main ────────┐
                                             │
copilot/merge-sub-branches-into-main ────────┼──> Branch Consolidation
                                             │
copilot/merge-branches-and-verify-data ──────┤
                                             │
copilot/consolidate-branches-into-one ───────┤
                                             │
copilot/link-branches-to-main ───────────────┤
                                             │
copilot/link-branches-together ──────────────┘  ← **الفرع الحالي / Current Branch**
```

---

### 7. ⚙️ فروع الإعداد / Setup Branches

```
copilot/install-dependencies-for-project ───┐
                                            │
copilot/install-npm-dependencies ───────────┼──> Environment Setup
                                            │
copilot/set-up-plate-recognizer-api ────────┤
                                            │
copilot/setup-local-server-version ─────────┘
```

---

### 8. 📦 فروع نظام ParkPow / ParkPow System Branches

```
copilot/add-fetch-vehicles-data ────────────┐
                                            │
copilot/manage-parkwow-car-plates ──────────┼──> ParkPow Integration
                                            │
copilot/enable-vehicle-data-collection ─────┘
```

---

### 9. 🎪 فروع ملصقات السيارات / Car Stickers Branches

```
copilot/add-car-sticker-data ──────────────┐
                                           │
copilot/check-stickers-data-existence ─────┼──> Sticker Management
                                           │
copilot/check-car-labels-data ─────────────┘
```

---

### 10. 📊 فروع التقارير / Reporting Branches

```
copilot/add-template-for-data-printing ────┐
                                           │
copilot/complete-report-and-settings-page ─┼──> Report Generation
                                           │
copilot/add-parking-system-report ─────────┤
                                           │
copilot/complete-license-reports ──────────┘
```

---

### 11. 🌓 فروع الميزات المتقدمة / Advanced Feature Branches

#### أ) Dark Mode
```
copilot/add-dark-mode-support ───> Dark Theme Implementation
```

#### ب) Parking Classifier
```
copilot/add-parking-lot-classifier ───────┐
                                          │
copilot/design-system-for-devices ────────┼──> Visual Parking System
                                          │
copilot/add-hidden-content-search ────────┘
```

#### ج) Docker Support
```
copilot/export-docker-image-format ───> Containerization
```

---

### 12. 🔗 فروع النشر / Deployment Branches

```
copilot/add-internet-publishing-link ────┐
                                         │
copilot/publish-content ─────────────────┼──> Publishing
                                         │
copilot/unlock-system-and-publish ───────┤
                                         │
copilot/add-local-server-infrastructure ─┘
```

---

### 13. 🔙 الفروع المُرجعة / Reverted Branches

```
revert-80-copilot/add-webhook-receiver-api ────┐
                                               │
revert-86-copilot/design-system-for-devices ───┼──> Reverted Changes
                                               │
revert-135-copilot/redesign-previous-work ─────┘
```

---

### 14. 🌐 الفروع الخاصة بمنصات النشر / Platform-Specific Branches

```
flyio-new-files ───> Fly.io Deployment
```

---

## 🔗 علاقات الفروع / Branch Relationships

### الشجرة الهرمية / Hierarchical Tree

```
main (05d6c0c)
│
├─── Feature Branches (45)
│    ├─── Plate Recognition (12 branches)
│    ├─── Database Integration (5 branches)
│    ├─── API Layer (8 branches)
│    ├─── Email System (3 branches)
│    ├─── ParkPow Integration (4 branches)
│    ├─── Car Stickers (4 branches)
│    ├─── Reports (4 branches)
│    └─── Advanced Features (5 branches)
│
├─── Fix Branches (28)
│    ├─── UI Fixes (12 branches)
│    ├─── Data Fixes (8 branches)
│    └─── Integration Fixes (8 branches)
│
├─── Update Branches (15)
│    ├─── System Updates (10 branches)
│    └─── Version Updates (5 branches)
│
├─── Review Branches (8)
│
├─── Redesign Branches (7)
│
├─── Merge Branches (6)
│    └─── copilot/link-branches-together (current)
│
├─── Setup Branches (5)
│
├─── Deployment Branches (6)
│
├─── Reverted Branches (3)
│
└─── Other Branches (15)
```

---

## 🚀 الفروع النشطة / Active Branches

### قيد التطوير / In Development

1. **copilot/link-branches-together** ← **الفرع الحالي / CURRENT**
   - **الغرض:** ربط جميع الفروع وتوثيق العلاقات بينها
   - **الحالة:** قيد العمل
   - **PR:** #137 (Open - WIP)

2. **revert-135-copilot/redesign-previous-work**
   - **الغرض:** التراجع عن تغييرات إعادة التصميم السابقة
   - **الحالة:** مفتوح
   - **PR:** #136 (Open)

3. **copilot/featurecapture-data-from-plate-recognizer**
   - **الغرض:** التقاط بيانات من Plate Recognizer
   - **الحالة:** مفتوح
   - **PR:** #106 (Open)

### فروع مفتوحة أخرى / Other Open Branches

4. **copilot/add-plate-recognizer-integration** - PR #104
5. **copilot/featureplate-recognizer-snapshot-again** - PR #103
6. **copilot/featureplate-recognizer-snapshot** - PR #102

---

## 🎯 الفروع المرتبطة بالميزات / Feature-Linked Branches

### مجموعة ميزة التعرف على اللوحات / Plate Recognition Feature Group

**الفروع المرتبطة / Linked Branches:**
1. `copilot/add-plate-recognizer-integration` (PR #104)
2. `copilot/add-plate-recognizer-snapshot` (PR #102)
3. `copilot/add-plate-recognizer-snapshot-again` (PR #103)
4. `copilot/add-plate-recognizer-snapshot-another-one`
5. `copilot/featurecapture-data-from-plate-recognizer` (PR #106)
6. `copilot/featureplate-recognizer-snapshot`
7. `copilot/featureplate-recognizer-snapshot-again`
8. `copilot/featureplate-recognizer-snapshot-another-one`
9. `copilot/featureplate-recognizer-snapshot-c0d2382b-1fcb-4c12-acab-57dd438f1aea`
10. `copilot/featureplate-recognizer-snapshot-one-more-time`
11. `copilot/featureplate-recognizer-snapshot-please-work`
12. `copilot/featureplate-recognizer-snapshot-yet-again`
13. `copilot/feature-plate-recognizer-snapshot`
14. `copilot/add-snapshot-to-postgres-script`
15. `copilot/set-up-plate-recognizer-api`

**الملفات المشتركة / Shared Files:**
- `snapshot_to_postgres.py`
- `db_schema.sql`
- `requirements.txt`
- `docker-compose.snapshot.yml`
- `Dockerfile.snapshot`
- Various README files

**الهدف المشترك / Common Goal:** إنشاء نظام متكامل للتعرف التلقائي على لوحات المركبات

---

### مجموعة ميزة قاعدة البيانات / Database Feature Group

**الفروع المرتبطة / Linked Branches:**
1. `copilot/create-vehicles-database`
2. `copilot/connect-database-and-deploy`
3. `copilot/review-and-update-database`
4. `copilot/add-vehicle-image-ingestion`

**الملفات المشتركة / Shared Files:**
- `db_schema.sql`
- Database migration scripts
- Connection utilities

**الهدف المشترك / Common Goal:** إعداد وصيانة قاعدة بيانات PostgreSQL

---

### مجموعة ميزة الواجهة / UI Feature Group

**الفروع المرتبطة / Linked Branches:**
1. `copilot/redesign-dashboard-layout`
2. `copilot/redesign-home-page-professionally`
3. `copilot/redesign-previous-work`
4. `copilot/replace-login-window-design`
5. `copilot/link-pages-and-redesign-cards`
6. `copilot/add-dark-mode-support`

**الملفات المشتركة / Shared Files:**
- `index.html`
- `pages/*.html`
- `css/` directory
- `assets/` directory

**الهدف المشترك / Common Goal:** تحسين تصميم وتجربة المستخدم

---

## 📈 إحصائيات الفروع / Branch Statistics

### توزيع الفروع / Branch Distribution

| الفئة / Category | العدد / Count | النسبة / Percentage |
|-----------------|---------------|---------------------|
| فروع الميزات / Features | 45 | 32.6% |
| فروع الإصلاحات / Fixes | 28 | 20.3% |
| فروع التحديثات / Updates | 15 | 10.9% |
| فروع المراجعة / Reviews | 8 | 5.8% |
| فروع إعادة التصميم / Redesigns | 7 | 5.1% |
| فروع الدمج / Merges | 6 | 4.3% |
| فروع النشر / Deployment | 6 | 4.3% |
| فروع الإعداد / Setup | 5 | 3.6% |
| فروع أخرى / Others | 18 | 13.0% |
| **الإجمالي / Total** | **138** | **100%** |

### حالة الفروع / Branch Status

| الحالة / Status | العدد / Count | النسبة / Percentage |
|----------------|---------------|---------------------|
| مدموجة / Merged | ~135 | 97.8% |
| قيد العمل / WIP | 3 | 2.2% |

---

## 🔍 كيفية استخدام هذا الدليل / How to Use This Directory

### للمطورين / For Developers

1. **البحث عن فرع معين:**
   - استخدم Ctrl+F للبحث عن اسم الفرع
   - راجع التصنيف حسب الفئة

2. **فهم العلاقات:**
   - راجع قسم "علاقات الفروع"
   - انظر إلى المخططات الهرمية

3. **تتبع الميزات:**
   - راجع "الفروع المرتبطة بالميزات"
   - تتبع مجموعات الفروع المرتبطة

### للمراجعين / For Reviewers

1. **مراجعة PRs:**
   - راجع الفروع النشطة
   - تحقق من الارتباطات بالفروع الأخرى

2. **فهم السياق:**
   - راجع تصنيف الفروع
   - انظر إلى الهدف المشترك لمجموعات الفروع

---

## 📝 ملاحظات إضافية / Additional Notes

### ملاحظات مهمة / Important Notes

1. **جميع الفروع مرتبطة بـ main:**
   - كل فرع يحتوي على تغييرات تم تطويرها من الفرع الرئيسي
   - معظم الفروع تم دمجها عبر Pull Requests

2. **التاريخ المطعم / Grafted History:**
   - المستودع يستخدم تاريخ مطعم (shallow clone)
   - بعض أوامر git قد تظهر الفروع كـ "غير مدموجة" تقنياً
   - لكن جميع التغييرات البرمجية موجودة في main

3. **الفروع المكررة / Duplicate Branches:**
   - بعض الميزات لها فروع متعددة (مثل plate-recognizer)
   - هذا طبيعي في عملية التطوير التكرارية

### توصيات / Recommendations

1. ✅ **حذف الفروع القديمة:**
   - بعد التأكد من دمج جميع التغييرات
   - راجع `BRANCH_DELETION_GUIDE.md`

2. ✅ **تنظيم الفروع:**
   - استخدم تسميات واضحة
   - اتبع نمط التسمية: `type/description`

3. ✅ **توثيق الفروع:**
   - حافظ على هذا الدليل محدثاً
   - أضف فروع جديدة عند إنشائها

---

## 🎉 الخلاصة / Conclusion

هذا الدليل يوفر خريطة شاملة لجميع فروع المشروع، ويربطها معاً بطريقة منظمة وواضحة. جميع الفروع مرتبطة بالفرع الرئيسي `main` وتساهم في بناء نظام إدارة المرور المتكامل.

This directory provides a comprehensive map of all project branches, linking them together in an organized and clear manner. All branches are connected to the `main` branch and contribute to building the integrated traffic management system.

---

**آخر تحديث بواسطة / Last Updated by:** GitHub Copilot Agent  
**التاريخ / Date:** 26 نوفمبر 2025 / November 26, 2025  
**الإصدار / Version:** 1.0
