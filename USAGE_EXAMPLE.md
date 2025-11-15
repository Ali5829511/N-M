# 📖 دليل الاستخدام الكامل - Complete Usage Guide
# نظام جلب بيانات السيارات من ParkPow

## 🎯 نظرة عامة / Overview

هذا الدليل يشرح كيفية استخدام نظام جلب البيانات من ParkPow بشكل كامل، خطوة بخطوة.

This guide explains how to use the ParkPow data fetching system completely, step by step.

---

## 📋 المتطلبات الأساسية / Prerequisites

### 1. متطلبات النظام / System Requirements

- ✅ Python 3.7 أو أحدث
- ✅ اتصال بالإنترنت
- ✅ رمز API من ParkPow

### 2. تثبيت المتطلبات / Install Requirements

```bash
# تثبيت المكتبات المطلوبة
pip install -r requirements.txt

# أو تثبيت مباشر
pip install requests
```

---

## 🔑 الحصول على رمز API / Getting API Token

### من لوحة تحكم ParkPow:

1. سجل الدخول إلى: https://app.parkpow.com
2. اذهب إلى **Settings** → **API Tokens**
3. انقر على **Generate New Token**
4. انسخ الرمز واحفظه في مكان آمن

---

## ⚙️ إعداد النظام / System Setup

### الطريقة 1: استخدام ملف .env (موصى بها ⭐)

```bash
# 1. نسخ ملف الإعدادات
cp .env.example .env

# 2. تعديل الملف وإضافة رمز API الخاص بك
nano .env  # أو أي محرر نصوص آخر
```

في ملف `.env`:
```env
# ParkPow API Configuration
PARKPOW_API_TOKEN=your_actual_token_here
PARKPOW_API_URL=https://app.parkpow.com/api/v1
```

### الطريقة 2: متغير بيئة مؤقت

```bash
# Linux/Mac
export PARKPOW_API_TOKEN="your_actual_token_here"

# Windows PowerShell
$env:PARKPOW_API_TOKEN="your_actual_token_here"

# Windows CMD
set PARKPOW_API_TOKEN=your_actual_token_here
```

---

## 🚀 التشغيل / Execution

### الطريقة 1: استخدام السكريبتات الجاهزة (الأسهل ⭐⭐⭐)

#### Linux/Mac:
```bash
# إعطاء صلاحية التنفيذ (مرة واحدة فقط)
chmod +x run_parkpow_extraction.sh

# تشغيل
./run_parkpow_extraction.sh
```

#### Windows:
```cmd
# مجرد نقر مزدوج على الملف
run_parkpow_extraction.bat

# أو من CMD
run_parkpow_extraction.bat
```

### الطريقة 2: تشغيل مباشر

```bash
python3 fetch_parkpow_vehicles.py
```

---

## 📊 فهم النتائج / Understanding the Output

### أثناء التشغيل / During Execution

```
======================================================
🚗 نظام استخراج بيانات السيارات من ParkPow
======================================================

🔄 اختبار الاتصال بـ ParkPow API...
✅ تم الاتصال بنجاح!
👤 المستخدم: your_username
📧 البريد: your_email@example.com

🔄 محاولة جلب البيانات من: https://app.parkpow.com/api/v1/review/?page=2
🔄 محاولة جلب البيانات من: https://app.parkpow.com/api/v1/vehicles/?page=2
✅ تم جلب البيانات بنجاح من الصفحة 2
📦 عدد العناصر المستلمة: 100

📦 تم جلب 100 عنصر من الصفحة 2 (المجموع: 100)
...
```

### بعد الانتهاء / After Completion

```
======================================================
✅ تمت العملية بنجاح!
======================================================

📁 الملفات المحفوظة / Saved Files:
   1. data/parkpow_vehicles.json - قاعدة بيانات السيارات
   2. data/parkpow_violations.json - قاعدة بيانات المخالفات

📊 الإحصائيات النهائية / Final Statistics:
   • السيارات / Vehicles: 150
   • المخالفات / Violations: 150
   • المخالفين المتكررين / Repeat Offenders: 25
======================================================
```

---

## 📁 الملفات الناتجة / Output Files

### 1. قاعدة بيانات السيارات / Vehicle Database
**الملف:** `data/parkpow_vehicles.json`

```json
{
  "metadata": {
    "title": "قاعدة بيانات السيارات من ParkPow",
    "source": "ParkPow API - Review Endpoint",
    "endpoint": "https://app.parkpow.com/api/v1/review/",
    "fetched_at": "2025-11-15T16:30:00.000Z",
    "version": "1.0",
    "accuracy": "100%"
  },
  "statistics": {
    "total_vehicles": 150,
    "vehicles_with_type": 145,
    "vehicles_with_color": 140,
    "avg_confidence": 95.5
  },
  "vehicles": [
    {
      "id": "parkpow_12345",
      "plateNumber": "ABC 1234",
      "plateUnicode": "ا ب ج ١٢٣٤",
      "vehicleType": "سيدان",
      "color": "أبيض",
      "make": "تويوتا",
      "model": "كامري",
      "year": "2020",
      "region": "sa",
      "regionName": "السعودية",
      "confidence": 98.5,
      "timestamp": "2025-11-15T12:00:00",
      "latitude": "24.7136",
      "longitude": "46.6753",
      "source": "parkpow_review",
      "cameraId": "CAM001",
      "imageUrl": "https://...",
      "status": "active"
    }
  ]
}
```

### 2. قاعدة بيانات المخالفات / Violations Database
**الملف:** `data/parkpow_violations.json`

```json
{
  "metadata": {
    "title": "قاعدة بيانات المخالفات المرورية",
    "source": "ParkPow API",
    "generated_at": "2025-11-15T16:30:00.000Z"
  },
  "statistics": {
    "total_violations": 150,
    "unique_vehicles": 120,
    "repeat_offenders_count": 25,
    "average_violations_per_vehicle": 1.25
  },
  "violations": [...],
  "repeat_offenders": [
    {
      "plateNumber": "ABC 1234",
      "violationCount": 5,
      "riskLevel": "high",
      "firstViolation": "2025-11-01T10:00:00",
      "lastViolation": "2025-11-15T12:00:00",
      "status": "repeat_offender"
    }
  ]
}
```

---

## 🌐 عرض البيانات / Viewing Data

### 1. عارض قاعدة بيانات السيارات
```
افتح في المتصفح / Open in browser:
pages/parkpow_database_viewer.html
```

**الميزات:**
- ✅ عرض جميع السيارات مع معلومات كاملة
- ✅ بحث وتصفية متقدم (حسب اللوحة، النوع، اللون)
- ✅ إحصائيات تفصيلية وتحليلات
- ✅ تصدير البيانات
- ✅ واجهة عصرية ومتجاوبة

### 2. متتبع المخالفين المتكررين
```
افتح في المتصفح / Open in browser:
pages/repeat_offenders_tracker.html
```

**الميزات:**
- ✅ قائمة كاملة بالمخالفين المتكررين
- ✅ تصنيف حسب مستوى الخطورة (🔴 عالي، 🟡 متوسط، 🟢 منخفض)
- ✅ تفاصيل كل مخالفة
- ✅ إحصائيات مفصلة
- ✅ رسوم بيانية تفاعلية

### 3. صفحة التكامل
```
افتح في المتصفح / Open in browser:
pages/parkpow_integration.html
```

**الميزات:**
- ✅ استيراد البيانات إلى النظام
- ✅ دمج مع قاعدة البيانات المحلية
- ✅ إدارة التكرارات
- ✅ تحديث البيانات

---

## 🔧 التخصيص / Customization

### تغيير عدد الصفحات المستخرجة

في ملف `fetch_parkpow_vehicles.py`، عدّل السطر 714:

```python
# القيمة الافتراضية: صفحات من 2 إلى 11
for page_num in range(2, 12):  # Pages 2 to 11

# مثال: صفحات من 1 إلى 20
for page_num in range(1, 21):  # Pages 1 to 20
```

### تغيير عدد العناصر في الصفحة

في السطر 100:

```python
def fetch_reviews(self, page: int = 1, page_size: int = 100):

# تغيير إلى 50 عنصر لكل صفحة
def fetch_reviews(self, page: int = 1, page_size: int = 50):
```

---

## 🐛 استكشاف الأخطاء / Troubleshooting

### خطأ: PARKPOW_API_TOKEN غير مُعرّف

```
❌ خطأ: لم يتم تعيين PARKPOW_API_TOKEN
Error: PARKPOW_API_TOKEN is not set
```

**الحل:**
1. تأكد من وجود ملف `.env` مع الرمز الصحيح
2. أو قم بتصدير المتغير يدوياً:
   ```bash
   export PARKPOW_API_TOKEN="your_token"
   ```

### خطأ: 401 Unauthorized

```
❌ فشل الاتصال: 401
```

**الأسباب المحتملة:**
- رمز API غير صحيح
- رمز API منتهي الصلاحية
- رمز API تم إلغاؤه

**الحل:**
1. تحقق من صحة الرمز
2. احصل على رمز جديد من لوحة التحكم

### خطأ: لا توجد بيانات

```
⚠️  لم يتم العثور على بيانات
```

**الحل:**
1. تحقق من وجود بيانات في حساب ParkPow
2. جرب الوصول من الصفحة 1:
   ```python
   # في السطر 714، غيّر:
   for page_num in range(1, 12):  # ابدأ من صفحة 1
   ```

### خطأ: Module 'requests' not found

```
ModuleNotFoundError: No module named 'requests'
```

**الحل:**
```bash
pip install requests
# أو
pip install -r requirements.txt
```

---

## 📚 أمثلة متقدمة / Advanced Examples

### مثال 1: جلب صفحات محددة فقط

```python
# إنشاء سكريبت مخصص
from fetch_parkpow_vehicles import ParkPowVehicleFetcher

fetcher = ParkPowVehicleFetcher()
fetcher.test_connection()

# جلب الصفحة 5 فقط
data = fetcher.fetch_reviews(page=5)
print(f"تم جلب {len(data.get('results', []))} عنصر")
```

### مثال 2: معالجة البيانات مخصصة

```python
from fetch_parkpow_vehicles import ParkPowVehicleFetcher

fetcher = ParkPowVehicleFetcher()
items = fetcher.fetch_all_reviews(max_pages=5)

# تصفية السيارات حسب اللون
white_vehicles = [
    v for v in items 
    if v.get('vehicle', {}).get('color', '').lower() == 'white'
]

print(f"عدد السيارات البيضاء: {len(white_vehicles)}")
```

### مثال 3: جدولة تلقائية (Cron)

**Linux/Mac:**
```bash
# تعديل crontab
crontab -e

# إضافة: تشغيل كل يوم في الساعة 3 صباحاً
0 3 * * * cd /path/to/N-M && /usr/bin/python3 fetch_parkpow_vehicles.py
```

**Windows Task Scheduler:**
1. افتح Task Scheduler
2. Create Basic Task
3. اختر التوقيت المطلوب
4. Action: Start a program
5. Program: `python.exe`
6. Arguments: `fetch_parkpow_vehicles.py`
7. Start in: مسار المشروع

---

## 🔒 أفضل الممارسات الأمنية / Security Best Practices

### ✅ DO:
- احفظ رمز API في ملف `.env` وليس في الكود
- أضف `.env` إلى `.gitignore`
- استخدم رموز API مختلفة للتطوير والإنتاج
- احفظ نسخة احتياطية من رمز API في مكان آمن
- راقب استخدام API للكشف عن أي نشاط غير عادي

### ❌ DON'T:
- لا تشارك رمز API مع أي شخص
- لا تنشر رمز API في GitHub أو أي مستودع عام
- لا تخزن رمز API في الكود المصدري
- لا تستخدم نفس الرمز في عدة مشاريع

---

## 📊 الأداء والتحسين / Performance and Optimization

### نصائح الأداء:

1. **استخدام التخزين المؤقت:**
   - لا تجلب نفس البيانات مراراً
   - احفظ النتائج واستخدمها عند الحاجة

2. **تجنب Rate Limiting:**
   - النظام يضيف تأخير 1 ثانية بين الطلبات
   - يمكن تعديل التأخير في السطر 223

3. **معالجة الأخطاء:**
   - النظام يحاول endpoints متعددة تلقائياً
   - يمكنك إضافة إعادة محاولة للطلبات الفاشلة

---

## 📞 الدعم والمساعدة / Support

### الوثائق:
- 📖 [README.md](README.md) - النظرة العامة
- 📖 [PARKPOW_README.md](PARKPOW_README.md) - دليل سريع
- 📖 [docs/PARKPOW_DATA_EXTRACTION.md](docs/PARKPOW_DATA_EXTRACTION.md) - دليل شامل
- 📖 [PARKPOW_VEHICLES_ENDPOINT_CONFIRMATION.md](PARKPOW_VEHICLES_ENDPOINT_CONFIRMATION.md) - تأكيد التنفيذ

### الحصول على المساعدة:
- 🔍 ابحث في التوثيق أولاً
- 📧 ParkPow Support: support@parkpow.com
- 💬 GitHub Issues: افتح issue في المستودع

---

## 🎓 أمثلة واقعية / Real-World Examples

### مثال 1: تقرير يومي للسيارات الجديدة

```bash
#!/bin/bash
# daily_report.sh

# جلب البيانات
python3 fetch_parkpow_vehicles.py

# إرسال إشعار
echo "تم جلب البيانات بنجاح في $(date)" | mail -s "تقرير يومي" admin@example.com
```

### مثال 2: تكامل مع قاعدة بيانات

```python
# integrate_with_db.py
import json
import sqlite3
from fetch_parkpow_vehicles import ParkPowVehicleFetcher

# جلب البيانات
fetcher = ParkPowVehicleFetcher()
items = fetcher.fetch_all_reviews(max_pages=10)
vehicles = fetcher.transform_to_vehicle_format(items)

# حفظ في SQLite
conn = sqlite3.connect('vehicles.db')
cursor = conn.cursor()

for vehicle in vehicles:
    cursor.execute('''
        INSERT INTO vehicles (plate, type, color, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (
        vehicle['plateNumber'],
        vehicle['vehicleType'],
        vehicle['color'],
        vehicle['timestamp']
    ))

conn.commit()
conn.close()
```

---

## 📝 الخلاصة / Summary

هذا النظام يوفر:
- ✅ جلب تلقائي للبيانات من ParkPow
- ✅ دعم كامل لنقطة النهاية `/vehicles/`
- ✅ تحويل وتنسيق تلقائي للبيانات
- ✅ تحديد المخالفين المتكررين
- ✅ واجهات عرض احترافية
- ✅ توثيق شامل بالعربية والإنجليزية

**الحالة:** ✅ **جاهز للاستخدام - Ready for Production**

---

**آخر تحديث / Last Updated:** 2025-11-15  
**الإصدار / Version:** 1.0  
**المؤلف / Author:** Traffic Management System Team
