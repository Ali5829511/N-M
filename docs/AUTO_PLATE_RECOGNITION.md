# نظام التعرف التلقائي على لوحات السيارات
# Automatic License Plate Recognition System

## نظرة عامة / Overview

هذا النظام يستخدم تقنية التعرف على لوحات السيارات (ALPR) لمعالجة صور السيارات تلقائياً وتسجيل المخالفات للسيارات غير المصرح لها بدخول المواقف الخاصة.

This system uses Automatic License Plate Recognition (ALPR) technology to automatically process car images and record violations for unauthorized vehicles in restricted parking areas.

---

## الميزات / Features

### ✅ الميزات الأساسية / Core Features

- **التعرف التلقائي**: استخدام Plate Recognizer API للتعرف على لوحات السيارات
- **معالجة دفعية**: معالجة عدة صور دفعة واحدة
- **قاعدة بيانات SQLite**: تخزين بيانات السيارات والمخالفات
- **تسجيل تلقائي للمخالفات**: تسجيل المخالفات تلقائياً للسيارات المسجلة
- **حفظ الصور**: حفظ نسخ من الصور المعالجة
- **تقارير مفصلة**: عرض نتائج المعالجة بالتفصيل

### 🔧 مميزات إضافية / Additional Features

- **إعدادات قابلة للتخصيص**: ملف JSON للإعدادات
- **معالجة الأخطاء**: معالجة احترافية للأخطاء والاستثناءات
- **دعم ثنائي اللغة**: واجهة بالعربية والإنجليزية
- **سهولة التثبيت**: متطلبات بسيطة وتثبيت سريع

---

## المتطلبات / Requirements

### متطلبات النظام / System Requirements

- **Python**: الإصدار 3.7 أو أحدث / Version 3.7 or newer
- **نظام التشغيل**: Windows, Linux, أو macOS
- **الاتصال بالإنترنت**: مطلوب للتواصل مع API

### متطلبات API

- **حساب Plate Recognizer**: [سجل هنا / Sign up here](https://platerecognizer.com/)
- **رمز API**: احصل على API Token من لوحة التحكم

---

## التثبيت / Installation

### الخطوة 1: تثبيت Python (إذا لم يكن مثبتاً)

#### Windows:
```bash
# قم بتنزيل Python من الموقع الرسمي
# Download Python from official website
https://www.python.org/downloads/
```

#### Linux/Ubuntu:
```bash
sudo apt update
sudo apt install python3 python3-pip
```

#### macOS:
```bash
# استخدم Homebrew
# Use Homebrew
brew install python3
```

### الخطوة 2: تثبيت المتطلبات

```bash
# انتقل إلى مجلد المشروع
# Navigate to project folder
cd /path/to/N-M

# قم بتثبيت المتطلبات
# Install requirements
pip3 install -r requirements.txt
```

أو يدوياً / Or manually:
```bash
pip3 install requests
```

### الخطوة 3: إعداد ملف الإعدادات

```bash
# انسخ ملف الإعدادات النموذجي
# Copy example config file
cp plate_recognition_config.json.example plate_recognition_config.json

# قم بتحرير الملف وأضف API Token الخاص بك
# Edit file and add your API token
nano plate_recognition_config.json
# أو استخدم أي محرر نصوص آخر
# or use any text editor
```

---

## الإعداد / Configuration

### ملف الإعدادات / Configuration File

قم بتحرير ملف `plate_recognition_config.json`:

```json
{
    "api_token": "ضع رمز API هنا",
    "api_url": "https://api.platerecognizer.com/v1/plate-reader/",
    "input_folder": "images",
    "output_folder": "processed_images",
    "database_name": "traffic.db",
    "violation_type": "دخول موقف خاص بدون تصريح",
    "fine_amount": 1000,
    "officer_name": "نظام تلقائي",
    "auto_process": true
}
```

### شرح الإعدادات / Configuration Explanation

| المفتاح / Key | الوصف / Description |
|--------------|---------------------|
| `api_token` | رمز API من Plate Recognizer / API token from Plate Recognizer |
| `api_url` | عنوان API (لا يحتاج تعديل عادة) / API URL (usually no need to change) |
| `input_folder` | مجلد الصور المراد معالجتها / Folder containing images to process |
| `output_folder` | مجلد حفظ الصور المعالجة / Folder to save processed images |
| `database_name` | اسم قاعدة البيانات / Database name |
| `violation_type` | نوع المخالفة / Violation type |
| `fine_amount` | قيمة الغرامة / Fine amount |
| `officer_name` | اسم المسجل / Officer name |
| `auto_process` | المعالجة التلقائية / Auto processing |

---

## الاستخدام / Usage

### التشغيل الأساسي / Basic Usage

```bash
# تأكد من وجود صور في مجلد images
# Make sure you have images in the images folder

# قم بتشغيل السكريبت
# Run the script
python3 auto_plate_recognition.py
```

### سير العمل / Workflow

1. **تحضير الصور**: ضع صور السيارات في مجلد `images/`
2. **التشغيل**: نفذ السكريبت
3. **المراجعة**: راجع النتائج في الطرفية (Terminal)
4. **التحقق**: تحقق من الصور المعالجة في `processed_images/`
5. **قاعدة البيانات**: استعرض المخالفات في `traffic.db`

---

## هيكل المجلدات / Folder Structure

```
N-M/
├── auto_plate_recognition.py          # السكريبت الرئيسي / Main script
├── plate_recognition_config.json      # ملف الإعدادات / Config file
├── plate_recognition_config.json.example  # مثال الإعدادات / Example config
├── requirements.txt                   # المتطلبات / Requirements
├── images/                            # مجلد الصور المدخلة / Input images folder
│   ├── car1.jpg
│   ├── car2.jpg
│   └── ...
├── processed_images/                  # مجلد الصور المعالجة / Processed images folder
│   ├── car1.jpg
│   ├── car2.jpg
│   └── ...
└── traffic.db                         # قاعدة البيانات / Database
```

---

## قاعدة البيانات / Database

### هيكل الجداول / Table Structure

#### جدول السيارات / Cars Table
```sql
CREATE TABLE cars (
    car_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plate_number TEXT UNIQUE NOT NULL,
    owner_name TEXT,
    model TEXT,
    year INTEGER,
    color TEXT
)
```

#### جدول المخالفات / Violations Table
```sql
CREATE TABLE violations (
    violation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_id INTEGER NOT NULL,
    violation_type TEXT NOT NULL,
    violation_date TEXT NOT NULL,
    fine_amount REAL NOT NULL,
    officer_name TEXT,
    FOREIGN KEY (car_id) REFERENCES cars(car_id)
)
```

### الاستعلام عن البيانات / Querying Data

```bash
# فتح قاعدة البيانات
# Open database
sqlite3 traffic.db

# عرض جميع المخالفات
# Show all violations
SELECT * FROM violations;

# عرض مخالفات سيارة معينة
# Show violations for specific car
SELECT v.*, c.plate_number, c.owner_name 
FROM violations v 
JOIN cars c ON v.car_id = c.car_id 
WHERE c.plate_number = 'ABC123';

# الخروج
# Exit
.quit
```

---

## استكشاف الأخطاء / Troubleshooting

### المشاكل الشائعة / Common Issues

#### 1. خطأ في رمز API / API Token Error

**المشكلة**: `❌ Error: API token not set`

**الحل / Solution**:
- افتح `plate_recognition_config.json`
- استبدل `ضع هنا رمز API الخاص بك` برمز API الفعلي
- احصل على الرمز من: https://platerecognizer.com/

#### 2. لا توجد صور / No Images Found

**المشكلة**: `⚠️ No images found in input folder`

**الحل / Solution**:
- تأكد من وجود صور في مجلد `images/`
- الصيغ المدعومة: `.jpg`, `.jpeg`, `.png`, `.bmp`
- تحقق من المسار في ملف الإعدادات

#### 3. خطأ في الاتصال / Connection Error

**المشكلة**: `⚠️ API connection error`

**الحل / Solution**:
- تحقق من اتصال الإنترنت
- تأكد من صحة رمز API
- تحقق من حصتك في Plate Recognizer

#### 4. خطأ في قاعدة البيانات / Database Error

**المشكلة**: `❌ Error setting up database`

**الحل / Solution**:
- تأكد من صلاحيات الكتابة في المجلد
- احذف ملف `traffic.db` وحاول مرة أخرى
- تحقق من توفر مساحة كافية

---

## أمثلة / Examples

### مثال 1: معالجة صور في مجلد مخصص
### Example 1: Process Images in Custom Folder

```json
{
    "input_folder": "D:/سيارات_اليوم",
    "output_folder": "D:/معالجة_اليوم"
}
```

### مثال 2: تغيير نوع المخالفة والغرامة
### Example 2: Change Violation Type and Fine

```json
{
    "violation_type": "وقوف في منطقة محظورة",
    "fine_amount": 500
}
```

### مثال 3: استخدام API مختلف
### Example 3: Use Different API

```json
{
    "api_url": "https://api.platerecognizer.com/v1/plate-reader/"
}
```

---

## الأمان / Security

### ⚠️ تحذيرات أمنية / Security Warnings

1. **لا تشارك رمز API**: احتفظ برمز API سرياً
2. **لا تضع الرمز في Git**: ملف الإعدادات مستثنى في `.gitignore`
3. **استخدم HTTPS**: تأكد من استخدام HTTPS للاتصال بـ API
4. **حماية قاعدة البيانات**: لا تشارك ملف `traffic.db`

### أفضل الممارسات / Best Practices

- ✅ استخدم رموز API منفصلة للتطوير والإنتاج
- ✅ راجع الصور المعالجة بانتظام
- ✅ احتفظ بنسخ احتياطية من قاعدة البيانات
- ✅ راقب استخدام API لتجنب تجاوز الحصة

---

## التطوير المستقبلي / Future Development

### الميزات المخططة / Planned Features

- [ ] واجهة مستخدم رسومية (GUI)
- [ ] معالجة الفيديو في الوقت الفعلي
- [ ] تكامل مع كاميرات IP
- [ ] تقارير PDF تلقائية
- [ ] إشعارات عبر البريد الإلكتروني
- [ ] لوحة تحكم ويب
- [ ] تصدير البيانات إلى Excel
- [ ] دعم لقواعد بيانات أخرى (MySQL, PostgreSQL)

---

## الدعم الفني / Support

### الحصول على المساعدة / Getting Help

1. **الوثائق**: اقرأ هذا الملف بالكامل
2. **المشاكل**: افتح Issue على GitHub
3. **الأسئلة**: استخدم قسم Discussions

### الموارد المفيدة / Useful Resources

- [Plate Recognizer API Docs](https://docs.platerecognizer.com/)
- [Python Documentation](https://docs.python.org/3/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

## الترخيص / License

هذا المشروع جزء من نظام إدارة المرور - جامعة الإمام محمد بن سعود الإسلامية

This project is part of the Traffic Management System - Imam Muhammad Ibn Saud Islamic University

© 2025 جميع الحقوق محفوظة / All Rights Reserved

---

## ملاحظات إضافية / Additional Notes

### حدود API / API Limits

Plate Recognizer يقدم خطط مختلفة:
- **خطة مجانية**: 2500 استدعاء/شهر
- **خطط مدفوعة**: حدود أعلى

راجع: https://platerecognizer.com/pricing/

### الأداء / Performance

- **سرعة المعالجة**: تعتمد على سرعة الإنترنت واستجابة API
- **الدقة**: تعتمد على جودة الصورة ووضوح اللوحة
- **الاستهلاك**: كل صورة = استدعاء API واحد

---

## الخلاصة / Conclusion

نظام التعرف التلقائي على لوحات السيارات يوفر حلاً فعالاً لمراقبة المواقف وتسجيل المخالفات تلقائياً. اتبع التعليمات بعناية للحصول على أفضل النتائج.

The Automatic License Plate Recognition System provides an effective solution for parking monitoring and automatic violation recording. Follow the instructions carefully for best results.

**بالتوفيق! / Good Luck!** 🚗✨
