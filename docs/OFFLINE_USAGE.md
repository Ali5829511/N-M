# ملاحظات الاستخدام دون اتصال - Offline Usage Notes
# نظام إدارة إسكان أعضاء هيئة التدريس

## 📡 المتطلبات الخارجية

النظام يعتمد على مكتبات خارجية من CDN للواجهة:

### 1. خطوط Tajawal العربية
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap">
```

### 2. أيقونات Font Awesome
```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
```

## 🔌 الاستخدام دون اتصال بالإنترنت

للاستخدام في بيئة بدون إنترنت، يجب تحميل المكتبات محلياً:

### الخطوة 1: تحميل المكتبات

```bash
# إنشاء مجلد للمكتبات
mkdir -p assets/fonts
mkdir -p assets/css

# تحميل Font Awesome
cd assets/css
wget https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css
wget https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2

# تحميل خطوط Tajawal
cd ../fonts
# قم بتحميل ملفات الخطوط من Google Fonts
```

### الخطوة 2: تحديث المراجع في HTML

استبدل روابط CDN بروابط محلية:

```html
<!-- بدلاً من CDN -->
<link rel="stylesheet" href="assets/css/all.min.css">
<link rel="stylesheet" href="assets/fonts/tajawal.css">
```

### الخطوة 3: تحديث مسارات الخطوط

قم بإنشاء ملف `assets/fonts/tajawal.css`:

```css
@font-face {
  font-family: 'Tajawal';
  font-style: normal;
  font-weight: 400;
  src: url('Tajawal-Regular.ttf') format('truetype');
}

@font-face {
  font-family: 'Tajawal';
  font-style: normal;
  font-weight: 500;
  src: url('Tajawal-Medium.ttf') format('truetype');
}

@font-face {
  font-family: 'Tajawal';
  font-style: normal;
  font-weight: 700;
  src: url('Tajawal-Bold.ttf') format('truetype');
}
```

## 📦 حزمة الاستخدام دون اتصال

لتجهيز حزمة كاملة للاستخدام دون اتصال:

```bash
#!/bin/bash
# prepare-offline.sh

# إنشاء مجلد الحزمة
mkdir -p offline-package/assets

# نسخ ملفات النظام
cp -r *.html offline-package/
cp -r js offline-package/
cp -r *.png *.jpg *.jpeg offline-package/ 2>/dev/null

# تحميل المكتبات
cd offline-package/assets

# Font Awesome
mkdir -p fontawesome
cd fontawesome
wget https://github.com/FortAwesome/Font-Awesome/releases/download/6.0.0/fontawesome-free-6.0.0-web.zip
unzip fontawesome-free-6.0.0-web.zip
cd ..

# Tajawal Fonts
mkdir -p tajawal
cd tajawal
# تحميل من: https://fonts.google.com/specimen/Tajawal
# أو استخدام: git clone https://github.com/Tajawal/Tajawal
cd ../..

echo "حزمة الاستخدام دون اتصال جاهزة في: offline-package/"
```

## ⚙️ تحديث جميع ملفات HTML تلقائياً

سكريبت لتحديث جميع ملفات HTML:

```bash
#!/bin/bash
# update-cdn-to-local.sh

# استبدال Font Awesome
find . -name "*.html" -exec sed -i 's|https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css|assets/fontawesome/css/all.min.css|g' {} \;

# استبدال خطوط Google
find . -name "*.html" -exec sed -i 's|https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap|assets/tajawal/tajawal.css|g' {} \;

echo "تم تحديث جميع الملفات"
```

## 🌐 الاستخدام مع الإنترنت (الحالي)

**المزايا:**
- ✅ لا حاجة لتحميل ملفات إضافية
- ✅ يتم تحديث المكتبات تلقائياً
- ✅ تحميل أسرع من CDN
- ✅ ذاكرة تخزين مؤقت في المتصفح

**العيوب:**
- ❌ يحتاج اتصال بالإنترنت
- ❌ قد يفشل إذا كان CDN معطلاً
- ❌ مشاكل محتملة مع بعض الجدران النارية

## 📱 التوصيات

### للاستخدام الداخلي في الجامعة:
✅ استخدام CDN (الإعداد الحالي) - موصى به

### للاستخدام في بيئة معزولة:
⚠️ تحميل المكتبات محلياً - مطلوب

### للإنتاج:
✅ استخدام CDN + Fallback محلي - الأفضل

## 🔄 إعداد Fallback

لأفضل موثوقية، استخدم CDN مع fallback محلي:

```html
<!-- Font Awesome مع fallback -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
      rel="stylesheet" 
      onerror="this.onerror=null;this.href='assets/fontawesome/css/all.min.css';">

<!-- خطوط Google مع fallback -->
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" 
      rel="stylesheet"
      onerror="this.onerror=null;this.href='assets/tajawal/tajawal.css';">
```

## 📊 حجم المكتبات

تقديرات حجم التحميل:

- Font Awesome: ~1 MB
- Tajawal Fonts: ~300 KB
- **المجموع: ~1.3 MB**

## 🔍 التحقق

للتحقق من تحميل المكتبات بنجاح:

```javascript
// في Console المتصفح
// التحقق من Font Awesome
console.log(window.getComputedStyle(document.querySelector('.fas')).fontFamily);

// التحقق من Tajawal
console.log(window.getComputedStyle(document.body).fontFamily);
```

---

**ملاحظة**: النظام الحالي يعمل مع اتصال بالإنترنت فقط.
لاستخدامه بدون إنترنت، اتبع الخطوات أعلاه.

تم التحديث: 2025-11-08
