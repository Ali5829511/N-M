# نظام معالجة المخالفات من خلال تمييز اللوحات
# Violation Processing System using Plate Recognition

هذا النظام يقوم بمعالجة صور السيارات تلقائياً وتسجيل المخالفات للسيارات المسجلة في قاعدة البيانات.

This system automatically processes vehicle images and logs violations for registered vehicles in the database.

## 📋 المميزات / Features

- ✅ معالجة دفعية للصور / Batch image processing
- ✅ التعرف التلقائي على اللوحات / Automatic plate recognition
- ✅ التحقق من قاعدة البيانات / Database verification
- ✅ تسجيل المخالفات / Violation logging
- ✅ توليد تقارير PDF و Excel / PDF & Excel report generation
- ✅ حفظ الصور مع معلومات المخالفة / Image archiving with violation data

## 🔧 المتطلبات / Requirements

### Python 3.8+

قم بتثبيت المكتبات المطلوبة:

```bash
pip install -r requirements.txt
```

أو يدوياً:

```bash
pip install requests fpdf pandas openpyxl Pillow
```

### Plate Recognizer API Key

احصل على API Key من:
Get API Key from: https://platerecognizer.com/

## 🚀 الاستخدام / Usage

### 1. إعداد البيئة / Environment Setup

قم بتعيين API Key كمتغير بيئة:

```bash
# Linux/Mac
export PLATE_RECOGNIZER_API_KEY="your_api_key_here"

# Windows (PowerShell)
$env:PLATE_RECOGNIZER_API_KEY="your_api_key_here"

# Windows (CMD)
set PLATE_RECOGNIZER_API_KEY=your_api_key_here
```

### 2. إعداد المجلدات / Folder Setup

البرنامج يستخدم المجلدات التالية:

```
.
├── input_images/       # ضع الصور هنا للمعالجة
├── output_reports/     # التقارير والصور المعالجة
└── vehicles.db         # قاعدة البيانات (تُنشأ تلقائياً)
```

### 3. تحضير قاعدة البيانات / Database Preparation

قم بإضافة السيارات المسموح لها إلى قاعدة البيانات. يمكنك استخدام السكريبت التالي:

```python
import sqlite3

conn = sqlite3.connect('vehicles.db')
cursor = conn.cursor()

# إضافة سيارة مثال
cursor.execute("""
    INSERT INTO vehicles (plate, owner_name, unit_number, vehicle_type, make, model, year, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", ('ABC-1234', 'أحمد محمد', 'A-101', 'سيارة خاصة', 'Toyota', 'Camry', 2023, 'أبيض'))

conn.commit()
conn.close()
```

### 4. وضع الصور / Place Images

ضع صور السيارات في مجلد `input_images/`:

```bash
input_images/
├── car1.jpg
├── car2.png
└── car3.jpeg
```

### 5. تشغيل البرنامج / Run the Program

```bash
python plate_violation_processor.py
```

## 📊 المخرجات / Output

البرنامج ينتج:

### 1. تقرير PDF
- ملف: `output_reports/violation_report_YYYYMMDD_HHMMSS.pdf`
- يحتوي على: رقم اللوحة، صورة السيارة، التاريخ، المالك

### 2. تقرير Excel
- ملف: `output_reports/violation_report_YYYYMMDD_HHMMSS.xlsx`
- يحتوي على: جدول بيانات بجميع المخالفات

### 3. الصور المعالجة
- المجلد: `output_reports/`
- الصور مع أسماء تتضمن: التاريخ، رقم اللوحة، اسم الصورة الأصلية

## 📝 مثال على الاستخدام / Usage Example

```bash
$ export PLATE_RECOGNIZER_API_KEY="sk_1234567890abcdef"
$ python plate_violation_processor.py

============================================================
🚗 نظام معالجة المخالفات - Violation Processing System
============================================================

✓ تم تهيئة قاعدة البيانات / Database initialized
📸 تم العثور على 3 صورة للمعالجة

🔍 معالجة: car1.jpg
   ✓ تم التعرف على اللوحة: ABC-1234 (دقة: 95.3%)
   ✓ السيارة موجودة في القاعدة - المالك: أحمد محمد
   ✓ تم تسجيل المخالفة وحفظ الصورة

🔍 معالجة: car2.jpg
   ✓ تم التعرف على اللوحة: XYZ-5678 (دقة: 92.1%)
   ⚠️  السيارة غير موجودة في قاعدة البيانات

============================================================
📊 توليد التقارير / Generating Reports
============================================================

✓ تم إنشاء تقرير PDF: output_reports/violation_report_20250111_123456.pdf
✓ تم إنشاء تقرير Excel: output_reports/violation_report_20250111_123456.xlsx

============================================================
📈 ملخص النتائج / Summary
============================================================
📸 إجمالي الصور: 3
✓ تم التعرف عليها: 2
✓ مخالفات مسجلة: 1
⚠️  سيارات غير مسجلة: 1
============================================================

✅ تم توليد التقارير بنجاح في المجلد: output_reports
```

## 🔗 التكامل مع النظام الويب / Web System Integration

يمكن ربط هذا السكريبت مع النظام الويب الموجود:

1. **استخدام نفس قاعدة البيانات**: قم بمزامنة بيانات localStorage من النظام الويب مع SQLite
2. **تشغيل دوري**: استخدم cron job أو Windows Task Scheduler لتشغيل السكريبت دورياً
3. **رفع التقارير**: رفع التقارير المولدة إلى موقع يمكن الوصول إليه من النظام الويب

### مثال على cron job:

```bash
# تشغيل كل ساعة
0 * * * * cd /path/to/N-M && /usr/bin/python3 plate_violation_processor.py >> logs/processor.log 2>&1
```

## 🔒 ملاحظات أمنية / Security Notes

⚠️ **مهم / Important:**

1. لا تشارك API Key الخاص بك / Don't share your API Key
2. استخدم HTTPS للاتصال بالـ API / Use HTTPS for API connections
3. احفظ قاعدة البيانات في مكان آمن / Store database in secure location
4. راجع سياسة الخصوصية لـ Plate Recognizer / Review Plate Recognizer privacy policy

## 🐛 استكشاف الأخطاء / Troubleshooting

### خطأ: "API Key not set"
```bash
export PLATE_RECOGNIZER_API_KEY="your_key_here"
```

### خطأ: "No module named 'fpdf'"
```bash
pip install -r requirements.txt
```

### خطأ: "Image not found"
- تأكد من وجود الصور في مجلد `input_images/`
- تأكد من صيغة الصور (.jpg, .png, .jpeg)

### خطأ في التعرف على اللوحة
- تأكد من جودة الصورة
- تأكد من وضوح اللوحة في الصورة
- جرّب صور بدقة أعلى

## 📞 الدعم / Support

للمزيد من المعلومات:
- Plate Recognizer Documentation: https://docs.platerecognizer.com/
- GitHub Issues: https://github.com/Ali5829511/N-M/issues

## 📄 الترخيص / License

MIT License - راجع LICENSE للمزيد من التفاصيل
