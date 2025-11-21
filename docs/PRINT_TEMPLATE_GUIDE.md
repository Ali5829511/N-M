# قالب الطباعة الموحد للتقارير
# Standardized Print Template for Reports

## نظرة عامة | Overview

تم إنشاء هذا القالب بناءً على الملف المرجعي `صفحة.pdf` (commit 4c6eb987) لتوحيد شكل وتنسيق طباعة جميع التقارير في نظام إدارة إسكان أعضاء هيئة التدريس.

This template was created based on the reference file `صفحة.pdf` (commit 4c6eb987) to standardize the appearance and formatting of all report printouts in the Faculty Housing Management System.

## الملفات | Files

### 1. css/print-template.css
ملف CSS يحتوي على تنسيقات الطباعة الموحدة لجميع التقارير.

A CSS file containing standardized print formatting for all reports.

**المميزات | Features:**
- تنسيق صفحة A4 مع هوامش مناسبة
- رأس صفحة احترافي مع شعار الجامعة
- تذييل صفحة مع رقم الصفحة والتاريخ
- تنسيق موحد للجداول والبيانات
- إخفاء العناصر التفاعلية عند الطباعة
- دعم كامل للغة العربية

**Features:**
- A4 page format with appropriate margins
- Professional header with university logo
- Footer with page number and date
- Unified formatting for tables and data
- Hide interactive elements when printing
- Full Arabic language support

### 2. js/print-template.js
ملف JavaScript يوفر وظائف مساعدة لإضافة رأس وتذييل الطباعة تلقائياً.

A JavaScript file providing helper functions to automatically add print headers and footers.

**الوظائف الرئيسية | Main Functions:**
- `PrintTemplate.init(config)` - تهيئة القالب للصفحة
- `PrintTemplate.print()` - فتح نافذة الطباعة
- `PrintTemplate.prepareTable(selector)` - تجهيز الجداول للطباعة
- `PrintTemplate.preventPageBreak(selector)` - منع فصل العناصر عبر الصفحات
- `PrintTemplate.addPageBreakBefore(selector)` - إضافة فاصل صفحة قبل عنصر
- `PrintTemplate.addSignatureSection()` - إضافة قسم التوقيعات

## كيفية الاستخدام | How to Use

### الطريقة الأولى: التضمين في HTML | Method 1: HTML Inclusion

أضف الملفات التالية في صفحة HTML الخاصة بك:

```html
<head>
    <!-- الأنماط الأخرى -->
    <link rel="stylesheet" href="../css/print-template.css">
</head>

<body>
    <!-- محتوى الصفحة -->
    
    <script src="../js/print-template.js"></script>
    <script>
        // تهيئة القالب
        PrintTemplate.init({
            reportTitle: 'عنوان التقرير',
            reportSubtitle: 'عنوان فرعي اختياري',
            showDate: true,
            showLogo: true
        });
        
        // تجهيز الجداول
        PrintTemplate.prepareTable('table');
        
        // منع فصل البطاقات الإحصائية
        PrintTemplate.preventPageBreak('.stat-card');
    </script>
</body>
```

### الطريقة الثانية: استخدام خاصية البيانات | Method 2: Using Data Attributes

```html
<body 
    data-print-template="true" 
    data-report-title="عنوان التقرير"
    data-report-subtitle="عنوان فرعي"
    data-show-date="true"
    data-show-logo="true">
    <!-- محتوى الصفحة -->
    
    <script src="../js/print-template.js"></script>
    <!-- سيتم التهيئة تلقائياً -->
</body>
```

## الصفحات المحدثة | Updated Pages

تم تطبيق القالب الموحد على الصفحات التالية:

The standardized template has been applied to the following pages:

1. ✅ pages/violations_report.html - تقرير المخالفات المرورية
2. ✅ pages/comprehensive_reports.html - التقارير الشاملة
3. ✅ pages/comprehensive_reports_enhanced.html - التقارير العامة المحسنة
4. ✅ pages/stickers_comprehensive_report.html - تقرير ملصقات السيارات الشامل
5. ✅ pages/general_statistics.html - تقرير الإحصائيات العامة
6. ✅ pages/enhanced_immobilized_cars.html - تقرير المركبات المحجوزة
7. ✅ pages/enhanced_traffic_accidents.html - تقرير الحوادث المرورية
8. ✅ pages/enhanced_stickers_management.html - إدارة الملصقات المحسنة
9. ✅ pages/parkpow_management.html - إدارة نظام ParkPow
10. ✅ pages/resident_inquiry.html - استعلام السكان
11. ✅ pages/security_incidents.html - تقرير الحوادث الأمنية
12. ✅ pages/unified_dashboard.html - لوحة التحكم الموحدة
13. ✅ pages/dashboard.html - لوحة التحكم

## عناصر القالب | Template Elements

### رأس الصفحة | Page Header
- شعار الجامعة | University Logo
- اسم الجامعة | University Name: "جامعة الإمام محمد بن سعود الإسلامية"
- اسم النظام | System Name: "نظام إدارة إسكان أعضاء هيئة التدريس"
- عنوان التقرير | Report Title
- تاريخ الطباعة (هجري وميلادي) | Print Date (Hijri and Gregorian)

### تذييل الصفحة | Page Footer
- معلومات النظام | System Information
- رقم الصفحة | Page Number
- تاريخ ووقت إنشاء التقرير | Report Generation Date and Time

### تنسيق الجداول | Table Formatting
- رأس جدول ملون | Colored Table Header (#6B5536)
- صفوف متناوبة الألوان | Alternating Row Colors
- حدود واضحة | Clear Borders
- تكرار رأس الجدول في كل صفحة | Repeat Header on Each Page

## CSS Classes المفيدة | Useful CSS Classes

- `.no-print` - لإخفاء عنصر عند الطباعة
- `.print-only` - لإظهار عنصر عند الطباعة فقط
- `.page-break-before` - لإضافة فاصل صفحة قبل العنصر
- `.page-break-after` - لإضافة فاصل صفحة بعد العنصر
- `.no-page-break` - لمنع فصل العنصر عبر الصفحات

## مثال كامل | Complete Example

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>تقرير مثال</title>
    <link rel="stylesheet" href="../css/print-template.css">
</head>
<body>
    <div class="container">
        <h1>عنوان التقرير</h1>
        
        <!-- محتوى التقرير -->
        <table>
            <thead>
                <tr>
                    <th>العمود 1</th>
                    <th>العمود 2</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>بيانات 1</td>
                    <td>بيانات 2</td>
                </tr>
            </tbody>
        </table>
        
        <!-- زر الطباعة (سيتم إخفاؤه عند الطباعة) -->
        <button class="no-print" onclick="window.print()">
            🖨️ طباعة التقرير
        </button>
    </div>
    
    <script src="../js/print-template.js"></script>
    <script>
        PrintTemplate.init({
            reportTitle: 'تقرير مثال',
            showDate: true,
            showLogo: true
        });
    </script>
</body>
</html>
```

## ملاحظات مهمة | Important Notes

1. **التوافقية | Compatibility**: القالب متوافق مع جميع المتصفحات الحديثة
2. **التجربة | Testing**: يمكن استخدام معاينة الطباعة في المتصفح للتحقق من الشكل النهائي
3. **التخصيص | Customization**: يمكن تخصيص الألوان والخطوط في ملف CSS حسب الحاجة
4. **الأداء | Performance**: القالب لا يؤثر على أداء الصفحة في وضع العرض العادي

## الدعم والصيانة | Support and Maintenance

للإبلاغ عن مشاكل أو اقتراح تحسينات، يرجى فتح issue في المستودع.

To report issues or suggest improvements, please open an issue in the repository.

---

**تاريخ الإنشاء | Created:** 2025-11-21  
**الإصدار | Version:** 1.0.0  
**المؤلف | Author:** Copilot Workspace  
**المرجع | Reference:** commit 4c6eb987 (صفحة.pdf)
