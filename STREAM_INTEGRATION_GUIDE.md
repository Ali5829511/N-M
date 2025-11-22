# دليل تكامل Stream مع ParkPow
# Stream Integration Guide with ParkPow

## 📋 نظرة عامة / Overview

هذا الدليل يشرح كيفية تكوين واستخدام Stream لإرسال البيانات تلقائياً إلى نظام ParkPow عبر Webhook.

This guide explains how to configure and use Stream to automatically send data to ParkPow system via webhooks.

---

## 🔑 معلومات API / API Information

**رمز API الخاص بك / Your API Key:**
```
7c13be422713a758a42a0bc453cf3331fbf4d346
```

**نقطة استقبال Webhook / Webhook Endpoint:**
```
https://app.parkpow.com/api/v1/webhook-receiver/
```

⚠️ **ملاحظة أمنية / Security Note:**  
احتفظ برمز API في مكان آمن ولا تشاركه علناً.  
Keep your API key secure and do not share it publicly.

---

## ⚙️ التكوين / Configuration

### استخدام Stream / Using Stream

إذا كنت تستخدم Stream لمزامنة البيانات، اتبع هذه الخطوات:

If you are using Stream for data synchronization, follow these steps:

#### الخطوة 1: تحرير ملف config.ini

أضف القسم التالي إلى ملف `config.ini` الخاص بك:

```ini
[webhooks]
[[parkpow]]
url = https://app.parkpow.com/api/v1/webhook-receiver/
header = Authorization: Token 7c13be422713a758a42a0bc453cf3331fbf4d346
image = yes
image_type = car
```

#### الخطوة 2: شرح الإعدادات / Configuration Explanation

| الإعداد / Setting | الوصف / Description |
|-------------------|---------------------|
| `url` | عنوان webhook لاستقبال البيانات / Webhook URL for receiving data |
| `header` | رأس التفويض مع رمز API / Authorization header with API token |
| `image` | تفعيل إرسال الصور (yes/no) / Enable image sending (yes/no) |
| `image_type` | نوع الصور المرسلة / Type of images to send |

---

## 🚀 البدء السريع / Quick Start

### 1. التحقق من التثبيت / Verify Installation

تأكد من تثبيت Stream على نظامك:

```bash
stream --version
```

### 2. نسخ التكوين / Copy Configuration

انسخ ملف `config.ini` الموجود في جذر المشروع:

```bash
cp config.ini ~/.stream/config.ini
```

أو قم بإنشاء ملف جديد في المجلد الخاص بـ Stream:

```bash
mkdir -p ~/.stream
nano ~/.stream/config.ini
```

ثم الصق التكوين أعلاه.

### 3. بدء المزامنة / Start Synchronization

ابدأ Stream لبدء إرسال البيانات إلى ParkPow:

```bash
stream start
```

للتحقق من حالة الاتصال:

```bash
stream status
```

---

## 📊 أنواع البيانات المدعومة / Supported Data Types

Stream سيرسل البيانات التالية إلى ParkPow تلقائياً:

Stream will automatically send the following data to ParkPow:

### 1. بيانات السيارات / Vehicle Data
- رقم اللوحة / License Plate Number
- النوع والطراز / Type and Model
- اللون / Color
- تاريخ التسجيل / Registration Date

### 2. الصور / Images
- صور السيارات / Vehicle Images
- صور اللوحات / License Plate Images
- نوع الصورة: سيارة (car) / Image Type: car

### 3. المخالفات / Violations
- نوع المخالفة / Violation Type
- التاريخ والوقت / Date and Time
- الموقع / Location
- حالة المخالفة / Violation Status

---

## 🔍 اختبار الاتصال / Testing Connection

### اختبار يدوي / Manual Test

يمكنك اختبار webhook يدوياً باستخدام curl:

```bash
curl -X POST https://app.parkpow.com/api/v1/webhook-receiver/ \
  -H "Authorization: Token 7c13be422713a758a42a0bc453cf3331fbf4d346" \
  -H "Content-Type: application/json" \
  -d '{
    "plate_number": "ABC-1234",
    "vehicle_type": "sedan",
    "timestamp": "2025-11-22T10:00:00Z"
  }'
```

### استجابة ناجحة / Successful Response

عند النجاح، ستحصل على استجابة مشابهة لـ:

```json
{
  "status": "success",
  "message": "Data received successfully",
  "webhook_id": "wh_123456789"
}
```

---

## 📝 سجلات وتتبع / Logs and Monitoring

### عرض السجلات / View Logs

للتحقق من سجلات Stream:

```bash
stream logs --tail 100
```

لعرض سجلات محددة بـ ParkPow:

```bash
stream logs --filter parkpow
```

### مراقبة الأداء / Performance Monitoring

تحقق من إحصائيات الإرسال:

```bash
stream stats parkpow
```

ستعرض:
- عدد الطلبات المرسلة / Requests Sent
- عدد الطلبات الناجحة / Successful Requests
- عدد الأخطاء / Errors
- متوسط وقت الاستجابة / Average Response Time

---

## 🛠️ استكشاف الأخطاء / Troubleshooting

### المشكلة 1: فشل الاتصال / Connection Failed

**السبب المحتمل:**
- خطأ في رمز API
- مشكلة في الشبكة
- عنوان URL غير صحيح

**الحل:**
1. تحقق من صحة رمز API
2. تأكد من الاتصال بالإنترنت
3. تحقق من عنوان webhook

```bash
# اختبار الاتصال
ping app.parkpow.com

# اختبار URL
curl -I https://app.parkpow.com/api/v1/webhook-receiver/
```

### المشكلة 2: رفض التفويض / Authorization Denied

**الخطأ:** `401 Unauthorized`

**السبب:**
- رمز API غير صحيح أو منتهي الصلاحية

**الحل:**
1. تحقق من رمز API في لوحة تحكم ParkPow
2. تأكد من عدم وجود مسافات إضافية في الرمز
3. جدد الرمز إذا لزم الأمر

### المشكلة 3: فشل إرسال الصور / Image Upload Failed

**السبب المحتمل:**
- حجم الصورة كبير جداً
- تنسيق الصورة غير مدعوم

**الحل:**
1. تأكد من أن حجم الصورة أقل من 10MB
2. استخدم التنسيقات المدعومة: JPG, PNG, WEBP
3. قم بضغط الصور إذا لزم الأمر

---

## 🔧 إعدادات متقدمة / Advanced Configuration

### إعادة المحاولة التلقائية / Auto-Retry

أضف إعدادات إعادة المحاولة في `config.ini`:

```ini
[webhooks]
[[parkpow]]
url = https://app.parkpow.com/api/v1/webhook-receiver/
header = Authorization: Token 7c13be422713a758a42a0bc453cf3331fbf4d346
image = yes
image_type = car
retry_count = 3
retry_delay = 5
timeout = 30
```

### التنبيهات / Notifications

لتلقي تنبيهات عند فشل الإرسال:

```ini
[notifications]
email = admin@example.com
on_failure = yes
on_success = no
```

### تصفية البيانات / Data Filtering

لإرسال بيانات محددة فقط:

```ini
[webhooks]
[[parkpow]]
url = https://app.parkpow.com/api/v1/webhook-receiver/
header = Authorization: Token 7c13be422713a758a42a0bc453cf3331fbf4d346
image = yes
image_type = car
filter = vehicle_type in ['car', 'truck']
exclude_fields = ['internal_notes', 'private_data']
```

---

## 📚 الوثائق الرسمية / Official Documentation

للمزيد من المعلومات، راجع:

For more information, refer to:

- **Stream Documentation**: https://getstream.io/docs/
- **ParkPow API Reference**: https://app.parkpow.com/docs/api/
- **Webhook Best Practices**: https://app.parkpow.com/docs/webhooks/

---

## 🔒 أفضل ممارسات الأمان / Security Best Practices

### 1. حماية رمز API / Protect API Key
- ❌ لا تضمن الرمز في الكود المصدري
- ❌ لا تشارك الرمز في repositories عامة
- ✅ استخدم متغيرات بيئة
- ✅ قم بتدوير الرموز بشكل دوري

### 2. استخدام HTTPS / Use HTTPS
- ✅ استخدم دائماً HTTPS للاتصالات
- ✅ تحقق من شهادات SSL
- ❌ لا تستخدم HTTP غير المشفر

### 3. التحقق من البيانات / Data Validation
- ✅ تحقق من صحة البيانات قبل الإرسال
- ✅ قم بتنظيف البيانات الحساسة
- ✅ استخدم التشفير للبيانات الحساسة

### 4. المراقبة والتسجيل / Monitoring and Logging
- ✅ سجل جميع الطلبات والاستجابات
- ✅ راقب الأنشطة المشبوهة
- ✅ قم بإعداد تنبيهات للأخطاء

---

## 📞 الدعم / Support

### الحصول على المساعدة / Getting Help

إذا واجهت مشاكل:

If you encounter issues:

1. **التحقق من السجلات / Check Logs**
   ```bash
   stream logs --tail 100
   ```

2. **البحث في الوثائق / Search Documentation**
   - راجع هذا الدليل
   - تحقق من وثائق ParkPow
   - ابحث في منتدى Stream

3. **الاتصال بالدعم / Contact Support**
   - 📧 ParkPow Support: support@parkpow.com
   - 📧 Stream Support: support@getstream.io
   - 🌐 منتدى المجتمع / Community Forum

---

## ✅ قائمة التحقق / Checklist

قبل الإنتاج، تأكد من:

Before production, ensure:

- [ ] تثبيت Stream وتكوينه بشكل صحيح
- [ ] نسخ config.ini إلى المكان الصحيح
- [ ] اختبار الاتصال بـ webhook
- [ ] التحقق من إرسال البيانات بنجاح
- [ ] إعداد المراقبة والسجلات
- [ ] تكوين إعادة المحاولة والتنبيهات
- [ ] مراجعة إعدادات الأمان
- [ ] توثيق التكوين للفريق

---

## 📈 أمثلة متقدمة / Advanced Examples

### مثال 1: إرسال بيانات مخصصة / Custom Data Sending

```python
import requests

def send_to_parkpow(data):
    url = "https://app.parkpow.com/api/v1/webhook-receiver/"
    headers = {
        "Authorization": "Token 7c13be422713a758a42a0bc453cf3331fbf4d346",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        print("✅ Data sent successfully")
        return response.json()
    else:
        print(f"❌ Error: {response.status_code}")
        return None

# استخدام
vehicle_data = {
    "plate_number": "ABC-1234",
    "vehicle_type": "car",
    "color": "red",
    "timestamp": "2025-11-22T10:00:00Z"
}

result = send_to_parkpow(vehicle_data)
```

### مثال 2: إرسال صورة / Sending Image

```python
def send_image_to_parkpow(image_path, metadata):
    url = "https://app.parkpow.com/api/v1/webhook-receiver/"
    headers = {
        "Authorization": "Token 7c13be422713a758a42a0bc453cf3331fbf4d346"
    }
    
    files = {
        'image': open(image_path, 'rb'),
        'type': 'car'
    }
    data = metadata
    
    response = requests.post(url, files=files, data=data, headers=headers)
    return response.json()

# استخدام
result = send_image_to_parkpow(
    'car_image.jpg',
    {'plate_number': 'ABC-1234', 'location': 'Gate A'}
)
```

---

**آخر تحديث / Last Updated:** 2025-11-22  
**الإصدار / Version:** 1.0  
**الحالة / Status:** ✅ جاهز للإنتاج / Production Ready
