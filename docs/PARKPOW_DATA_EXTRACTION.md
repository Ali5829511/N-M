# دليل استخراج بيانات السيارات والمخالفات من ParkPow
# ParkPow Vehicle Database and Violations Extraction Guide

## نظرة عامة / Overview

نظام شامل لاستخراج بيانات السيارات والمخالفات المرورية من ParkPow API.

A comprehensive system for extracting vehicle data and traffic violations from ParkPow API.

## الأهداف الرئيسية / Main Objectives

### 1. قاعدة بيانات السيارات / Vehicle Database
- بناء قاعدة بيانات كاملة ودقيقة لجميع السيارات
- جمع معلومات شاملة (رقم اللوحة، النوع، اللون، الماركة، الموديل، إلخ)
- Building a complete and accurate database of all vehicles
- Collecting comprehensive information (plate number, type, color, make, model, etc.)

### 2. تسجيل المخالفات المرورية / Traffic Violations Registration
- تسجيل جميع المخالفات المرورية تلقائياً
- تحديد نوع المخالفة، التاريخ، الموقع، والكاميرا
- Automatically register all traffic violations
- Identify violation type, date, location, and camera

### 3. تحديد المخالفين المتكررين / Repeat Offenders Identification
- تتبع السيارات المخالفة بشكل متكرر
- تصنيف حسب مستوى الخطورة (عالي، متوسط، منخفض)
- إحصائيات مفصلة لكل مخالف
- Track repeat offender vehicles
- Classify by risk level (high, medium, low)
- Detailed statistics for each offender

## المتطلبات / Requirements

### 1. مكتبات Python المطلوبة / Required Python Libraries

```bash
pip install requests
```

جميع المكتبات المطلوبة موجودة بالفعل في `requirements.txt`.

All required libraries are already in `requirements.txt`.

### 2. رمز API من ParkPow / ParkPow API Token

يجب الحصول على رمز API من ParkPow وتعيينه في ملف `.env`:

You need to get an API token from ParkPow and set it in `.env` file:

```env
PARKPOW_API_TOKEN=your_token_here
PARKPOW_API_URL=https://app.parkpow.com/api/v1
```

## الاستخدام / Usage

### الطريقة الأولى: تشغيل مباشر / Direct Execution

```bash
# تعيين رمز API
export PARKPOW_API_TOKEN="your_token_here"

# تشغيل السكريبت
python3 fetch_parkpow_vehicles.py
```

### الطريقة الثانية: باستخدام ملف .env / Using .env File

```bash
# إنشاء ملف .env من المثال
cp .env.example .env

# تعديل ملف .env وإضافة رمز API الخاص بك
nano .env

# تشغيل السكريبت (سيقرأ من .env تلقائياً)
python3 fetch_parkpow_vehicles.py
```

## كيف يعمل السكريبت / How It Works

### 1. الاتصال بـ API / API Connection

يتصل السكريبت بـ ParkPow API باستخدام رمز المصادقة:

The script connects to ParkPow API using authentication token:

```python
headers = {
    'Authorization': f'Token {api_token}',
    'Content-Type': 'application/json'
}
```

### 2. جلب البيانات / Data Fetching

السكريبت يستخدم استراتيجية **fallback متعددة المستويات** لجلب البيانات من عدة نقاط نهاية:

The script uses a **multi-level fallback strategy** to fetch data from multiple endpoints:

#### نقاط النهاية المستخدمة / Endpoints Used:

1. **`/review/`** - نقطة نهاية المراجعات (الأساسية)
   - Review endpoint (primary)
2. **`/plate-reader/`** - نتائج التعرف على اللوحات
   - Plate reader results
3. **`/results/`** - النتائج الكاملة
   - Complete results
4. **`/vehicles/`** - ✅ **نقطة نهاية السيارات** (**تم الإضافة**)
   - ✅ **Vehicles endpoint** (**Added**)

إذا فشلت نقطة نهاية، يحاول النظام النقطة التالية تلقائياً.

If one endpoint fails, the system automatically tries the next one.

#### الصفحات / Pages:

يجلب البيانات من صفحات متعددة، بدءاً من الصفحة 2 كما هو مطلوب:

Fetches data from multiple pages, starting from page 2 as required:

- الصفحة 2 / Page 2
- الصفحة 3 / Page 3
- وهكذا حتى نفاد البيانات / And so on until no more data

### 3. تحويل البيانات / Data Transformation

يحول البيانات من تنسيق ParkPow API إلى تنسيق متوافق مع قاعدة بيانات السيارات المحلية:

Transforms data from ParkPow API format to local vehicle database format:

```javascript
{
  "id": "unique_id",
  "plateNumber": "رقم اللوحة",
  "vehicleType": "نوع السيارة",
  "color": "اللون",
  "region": "المنطقة",
  "confidence": 95.5,
  "timestamp": "2025-11-14T15:00:00",
  "source": "parkpow_api",
  "status": "active"
}
```

### 4. حفظ البيانات / Saving Data

يحفظ البيانات في ملف JSON في مجلد `data/`:

Saves data to JSON file in `data/` folder:

```
data/parkpow_vehicles.json
```

## تنسيق ملف الإخراج / Output File Format

### 1. قاعدة بيانات السيارات / Vehicle Database
**الملف:** `data/parkpow_vehicles.json`

```json
{
  "metadata": {
    "source": "ParkPow API",
    "fetched_at": "2025-11-14T15:33:52.000Z",
    "total_count": 150,
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
      "vehicleType": "سيدان",
      "color": "أبيض",
      "make": "تويوتا",
      "model": "كامري",
      "year": "2020",
      "region": "sa",
      "confidence": 98.5,
      "timestamp": "2025-11-14T12:00:00",
      "latitude": "24.7136",
      "longitude": "46.6753"
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
    "generated_at": "2025-11-14T15:33:52.000Z"
  },
  "statistics": {
    "total_violations": 150,
    "unique_vehicles": 120,
    "repeat_offenders_count": 25,
    "average_violations_per_vehicle": 1.25
  },
  "violations": [
    {
      "id": "violation_123",
      "plateNumber": "ABC 1234",
      "violationType": "دخول/وقوف غير مصرح",
      "violationDate": "2025-11-14T12:00:00",
      "location": {
        "latitude": "24.7136",
        "longitude": "46.6753",
        "region": "الرياض",
        "cameraId": "CAM001"
      },
      "confidence": 98.5,
      "status": "pending"
    }
  ],
  "repeat_offenders": [
    {
      "plateNumber": "ABC 1234",
      "violationCount": 5,
      "riskLevel": "high",
      "firstViolation": "2025-11-01T10:00:00",
      "lastViolation": "2025-11-14T12:00:00",
      "status": "repeat_offender"
    }
  ]
}
```

## دمج البيانات مع النظام / Integration with System

بعد جلب البيانات، يمكن استيرادها إلى النظام بعدة طرق:

After fetching data, you can import it into the system in several ways:

### 1. عرض قاعدة بيانات السيارات / View Vehicle Database

افتح في المتصفح / Open in browser:
```
pages/parkpow_database_viewer.html
```

الميزات:
- عرض جميع السيارات مع معلومات كاملة
- بحث وتصفية متقدم
- إحصائيات شاملة

### 2. عرض المخالفين المتكررين / View Repeat Offenders

افتح في المتصفح / Open in browser:
```
pages/repeat_offenders_tracker.html
```

الميزات:
- قائمة كاملة بالمخالفين المتكررين
- تصنيف حسب مستوى الخطورة
- تفاصيل كل مخالفة
- إحصائيات مفصلة

### 3. الدمج التلقائي في JavaScript / Automatic Integration in JavaScript

```javascript
// في صفحة HTML
<script src="../js/parkpow_integration.js"></script>
<script>
  // استيراد البيانات تلقائياً
  await importParkPowData();
  
  // أو استخدام API مباشرة
  const integration = window.parkpowIntegration;
  await integration.loadParkPowData();
  const result = await integration.importAllVehicles({
    skipDuplicates: true,
    updateExisting: false
  });
  
  console.log('تم استيراد:', result.imported);
</script>
```

### 4. استخدام صفحة استيراد البيانات / Using Data Import Page

1. افتح `pages/bulk_vehicle_import.html`
2. حمّل ملف `data/parkpow_vehicles.json`
3. اضغط "استيراد"

## استكشاف الأخطاء / Troubleshooting

### خطأ: PARKPOW_API_TOKEN غير مُعرّف

```bash
❌ خطأ: لم يتم تعيين PARKPOW_API_TOKEN
```

**الحل / Solution:**
- تأكد من تعيين رمز API في ملف `.env`
- أو قم بتصديره كمتغير بيئي

### خطأ: فشل الاتصال 401 Unauthorized

```bash
❌ فشل الاتصال: 401
```

**الحل / Solution:**
- تحقق من صحة رمز API
- تأكد من أن الرمز لم ينتهي صلاحيته

### خطأ: لا توجد بيانات

```bash
⚠️  لم يتم العثور على بيانات
```

**الحل / Solution:**
- تحقق من وجود بيانات في حساب ParkPow
- جرب الوصول إلى الصفحة 1 بدلاً من الصفحة 2
- تحقق من صلاحيات API token

## الأمان / Security

⚠️ **تحذير أمني / Security Warning:**

- لا تشارك رمز API الخاص بك / Don't share your API token
- لا تضف ملف `.env` إلى Git / Don't commit `.env` to Git
- استخدم رموز مختلفة للتطوير والإنتاج / Use different tokens for dev and production

## الأداء / Performance

- السكريبت يضيف تأخير 1 ثانية بين الطلبات لتجنب rate limiting
- The script adds 1 second delay between requests to avoid rate limiting

- يمكن تعديل الحد الأقصى للصفحات في الكود
- You can modify the maximum pages in the code

## المساعدة / Support

للمزيد من المعلومات:

For more information:

- 📖 [ParkPow API Documentation](https://app.parkpow.com/api/docs/)
- 📖 [Vehicle Database Guide](DATABASE_INFO.md)
- 📧 دعم ParkPow / ParkPow Support: support@parkpow.com

## التحديثات المستقبلية / Future Updates

- [ ] دعم التصفية حسب التاريخ / Support date filtering
- [ ] دعم البحث حسب رقم اللوحة / Support plate number search
- [ ] جدولة تلقائية للجلب / Automatic scheduled fetching
- [ ] واجهة ويب للتحكم / Web interface for control

---

**آخر تحديث / Last Updated:** 2025-11-14
**الإصدار / Version:** 1.0
