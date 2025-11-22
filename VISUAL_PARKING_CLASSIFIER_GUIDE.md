# دليل مصنف المواقف المرئي
# Visual Parking Classifier Guide

## نظرة عامة / Overview

صفحة مصنف المواقف المرئي هي أداة شاملة لإدارة مواقف السيارات مع التعرف التلقائي على اللوحات باستخدام Plate Recognizer API.

The Visual Parking Classifier is a comprehensive tool for managing parking lots with automatic license plate recognition using Plate Recognizer API.

## المميزات / Features

### 1. إدارة المواقف / Parking Management
- رفع صور المواقف بسحب وإفلات أو النقر للاختيار
- تصنيف المواقف حسب النوع (خاص، زوار، هيئة تدريس، موظفين، إلخ)
- عرض إحصائيات المواقف حسب النوع
- إضافة، تعديل، وحذف المواقف

### 2. التعرف على اللوحات / Plate Recognition
- **كشف تلقائي** للوحات السيارات في صور المواقف
- عرض اللوحات المكتشفة مع نسبة الثقة
- حفظ اللوحات مع بيانات الموقف
- معالجة الأخطاء بشكل سلس

### 3. إحصائيات / Statistics
- إجمالي المواقف
- مواقف أعضاء هيئة التدريس
- مواقف الموظفين
- مواقف الزوار

## الاستخدام / Usage

### 1. فتح الصفحة / Open Page
```
http://your-domain/visual_parking_classifier.html
```

### 2. إضافة موقف جديد / Add New Parking Lot

#### الخطوة 1: رفع الصورة
- انقر على منطقة الرفع أو اسحب الصورة
- سيتم تحليل الصورة تلقائياً للبحث عن اللوحات
- ستظهر نتائج الكشف في معاينة الصورة

#### الخطوة 2: اختيار النوع
- اختر نوع الموقف من القائمة المنسدلة:
  - خاص (Private)
  - زوار (Visitor)
  - أعضاء هيئة التدريس (Faculty)
  - موظفين (Staff)
  - ضيوف (Guest)
  - محجوز (Reserved)
  - عام (Public)

#### الخطوة 3: الحفظ
- انقر على "حفظ المواقف"
- سيتم حفظ البيانات في المتصفح

### 3. إدارة المواقف / Manage Parking Lots

#### التعديل / Edit
- انقر على زر "تعديل" بجانب الموقف
- اختر النوع الجديد من القائمة

#### الحذف / Delete
- انقر على زر "حذف"
- أكد الحذف

## التكامل مع Plate Recognizer API

### إعداد API Token

الصفحة تستخدم Plate Recognizer API للكشف التلقائي عن اللوحات. Token API محفوظ في localStorage.

#### تغيير Token
```javascript
localStorage.setItem('PLATE_RECOGNIZER_API_TOKEN', 'your-token-here');
```

### حدود الاستخدام / Rate Limits

Plate Recognizer API لديها حدود استخدام. في حالة تجاوز الحد:
- ستظهر رسالة تحذير
- يمكنك متابعة رفع الصور بدون كشف اللوحات

## البيانات والتخزين / Data Storage

### LocalStorage
البيانات محفوظة في localStorage تحت المفتاح: `parkingLots`

### هيكل البيانات / Data Structure
```javascript
{
  id: "unique-id",
  name: "parking-name",
  type: "faculty",
  image: "base64-encoded-image",
  createdAt: "2025-01-01T00:00:00.000Z",
  size: 12345,
  detectedPlates: [
    {
      plate: "ABC1234",
      score: 0.95,
      vehicle_type: "Sedan",
      region: "SA"
    }
  ],
  plateCount: 1
}
```

### النسخ الاحتياطي / Backup
لعمل نسخة احتياطية:
```javascript
const data = localStorage.getItem('parkingLots');
console.log(data); // انسخ هذا النص
```

لاستعادة النسخة الاحتياطية:
```javascript
localStorage.setItem('parkingLots', 'your-backup-data');
```

## الأمان / Security

### حماية من XSS
- جميع المدخلات معالجة بـ `escapeHtml()`
- الصور محفوظة كـ Base64

### API Token
- Token محفوظ في localStorage
- للإنتاج: استخدم خادم وسيط لحماية Token

## استكشاف الأخطاء / Troubleshooting

### لم يتم كشف اللوحات
**الأسباب المحتملة:**
1. الصورة لا تحتوي على لوحات واضحة
2. خطأ في Token API
3. تجاوز حد الاستخدام

**الحل:**
- تحقق من Token في localStorage
- تحقق من console للأخطاء
- انتظر قليلاً وحاول مرة أخرى

### البيانات لا تُحفظ
**الحل:**
- تحقق من إعدادات المتصفح
- تأكد من عدم تفعيل وضع التصفح الخاص
- امسح الكاش وحاول مرة أخرى

## التطوير المستقبلي / Future Enhancements

### مقترحات
- [ ] ضغط الصور قبل الحفظ
- [ ] تصدير البيانات (Excel, PDF)
- [ ] ربط مع قاعدة بيانات السيارات
- [ ] إضافة خريطة للمواقف
- [ ] نظام حجز المواقف
- [ ] إشعارات للمواقف الممتلئة

## الدعم / Support

للمزيد من المعلومات:
- [Plate Recognizer Documentation](https://docs.platerecognizer.com/)
- [Project Repository](https://github.com/Ali5829511/N-M)

## الترخيص / License
جزء من نظام إدارة المرور - Traffic Management System
MIT License
