# دليل دمج نظام السمات
# Theme System Integration Guide

## نظرة عامة | Overview

تم إضافة نظام سمات محسّن يتضمن:
- الوضع الليلي (Dark Mode)
- تخصيص الألوان (Color Customization)
- أنماط محسّنة للأزرار والنماذج والجداول

An enhanced theme system has been added that includes:
- Dark Mode
- Color Customization
- Enhanced styles for buttons, forms, and tables

---

## التكامل مع الصفحات الموجودة | Integration with Existing Pages

### الخطوة 1: إضافة ملفات CSS | Step 1: Add CSS Files

أضف هذه الأسطر في `<head>` لأي صفحة:

```html
<link rel="stylesheet" href="../css/unified-color-scheme.css">
<link rel="stylesheet" href="../css/theme-system.css">
```

### الخطوة 2: إضافة JavaScript | Step 2: Add JavaScript

أضف هذا السطر قبل إغلاق `</body>`:

```html
<script src="../js/theme-manager.js"></script>
```

---

## استخدام الأنماط الجديدة | Using New Styles

### الأزرار | Buttons

```html
<!-- أزرار ملونة | Colored Buttons -->
<button class="btn btn-primary">أساسي</button>
<button class="btn btn-secondary">ثانوي</button>
<button class="btn btn-success">نجاح</button>
<button class="btn btn-danger">خطر</button>
<button class="btn btn-warning">تحذير</button>
<button class="btn btn-info">معلومات</button>

<!-- أزرار مسطحة | Outline Buttons -->
<button class="btn btn-outline-primary">مسطح أساسي</button>
<button class="btn btn-outline-secondary">مسطح ثانوي</button>

<!-- أحجام مختلفة | Different Sizes -->
<button class="btn btn-primary btn-sm">صغير</button>
<button class="btn btn-primary">عادي</button>
<button class="btn btn-primary btn-lg">كبير</button>
<button class="btn btn-primary btn-xl">كبير جداً</button>
```

### النماذج | Forms

```html
<div class="form-group">
    <label class="form-label">اسم المستخدم</label>
    <input type="text" class="form-control" placeholder="أدخل اسم المستخدم">
    <small class="form-text">نص مساعد</small>
</div>

<!-- حقل مع أيقونة | Input with Icon -->
<div class="form-group">
    <label class="form-label">البريد الإلكتروني</label>
    <div class="input-group">
        <i class="fas fa-envelope input-icon"></i>
        <input type="email" class="form-control" placeholder="example@email.com">
    </div>
</div>

<!-- حالات التحقق | Validation States -->
<input type="text" class="form-control is-valid" value="قيمة صحيحة">
<div class="valid-feedback">رائع! البيانات صحيحة</div>

<input type="text" class="form-control is-invalid" value="قيمة خاطئة">
<div class="invalid-feedback">يرجى إدخال قيمة صحيحة</div>
```

### الجداول | Tables

```html
<div class="table-container">
    <table class="table table-striped">
        <thead>
            <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الإجراءات</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>أحمد محمد</td>
                <td>ahmed@example.com</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn table-action-view">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="table-action-btn table-action-edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn table-action-delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

---

## واجهة برمجة التطبيقات | API Reference

### ThemeManager Class

```javascript
// تبديل السمة | Toggle Theme
themeManager.toggleTheme();

// تعيين لون مخصص | Set Custom Color
themeManager.setCustomColor('primary-blue', '#ff0000');

// إعادة تعيين الألوان المخصصة | Reset Custom Colors
themeManager.resetCustomColors();

// فتح نافذة تخصيص الألوان | Open Color Customizer
themeManager.openColorCustomizer();
```

---

## متغيرات CSS المتاحة | Available CSS Variables

يمكنك استخدام هذه المتغيرات في CSS الخاص بك:

```css
/* الألوان الأساسية | Primary Colors */
var(--primary-blue)
var(--primary-blue-light)
var(--primary-blue-dark)
var(--gold)
var(--gold-dark)
var(--gold-light)

/* ألوان الخلفية | Background Colors */
var(--bg-primary)
var(--bg-secondary)
var(--bg-tertiary)

/* ألوان النص | Text Colors */
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)
var(--text-white)

/* ألوان الحالة | Status Colors */
var(--success)
var(--warning)
var(--error)
var(--info)

/* الظلال | Shadows */
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)
var(--shadow-xl)

/* الحدود | Borders */
var(--border-radius-sm)
var(--border-radius-md)
var(--border-radius-lg)
var(--border-radius-xl)

/* المسافات | Spacing */
var(--spacing-xs)
var(--spacing-sm)
var(--spacing-md)
var(--spacing-lg)
var(--spacing-xl)
```

---

## صفحة العرض | Demo Page

للاطلاع على جميع الميزات، افتح:

To see all features, open:

```
pages/theme-demo.html
```

---

## الميزات الرئيسية | Key Features

### 1. الوضع الليلي | Dark Mode
- تبديل تلقائي بين الوضع النهاري والليلي
- حفظ التفضيل في localStorage
- انتقالات سلسة بين الأوضاع

### 2. تخصيص الألوان | Color Customization
- تخصيص الألوان الأساسية
- حفظ الألوان المخصصة
- إعادة تعيين إلى الألوان الافتراضية

### 3. الأنماط المحسّنة | Enhanced Styles
- 6 أنواع أزرار ملونة
- 4 أحجام للأزرار
- أنماط للنماذج مع حالات التحقق
- جداول تفاعلية مع تأثيرات hover
- مجموعة أزرار
- أزرار مسطحة

---

## التوافق | Compatibility

- متوافق مع جميع المتصفحات الحديثة
- يدعم RTL (من اليمين إلى اليسار)
- متجاوب مع جميع أحجام الشاشات

---

## الملاحظات | Notes

- يتم حفظ تفضيلات السمة تلقائياً في localStorage
- يمكن للمستخدمين تخصيص الألوان وحفظها
- جميع العناصر تستخدم CSS Variables لسهولة التخصيص
- الانتقالات سلسة ومرئية

---

## الدعم | Support

للمزيد من المعلومات أو الإبلاغ عن مشاكل:
- راجع الكود في `js/theme-manager.js`
- راجع الأنماط في `css/theme-system.css`
- افتح issue على GitHub
