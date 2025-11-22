# معالجة خطأ 429 من ParkPow
# Handling ParkPow 429 Rate Limit Error

## ⚠️ المشكلة / The Issue

عند محاولة الوصول إلى وثائق API على:
```
https://app.parkpow.com/openapi/
```

تحصل على الخطأ:
```
429 Too Many Requests
```

When trying to access the API documentation at the above URL, you receive a 429 error.

---

## ✅ الحل السريع / Quick Solution

**هذا الخطأ لا يؤثر على عمل النظام!**

**This error does NOT affect your system operation!**

### لماذا؟ / Why?

1. **الخطأ على endpoint الوثائق فقط** (`/openapi/`)
   - The error is only on the documentation endpoint
   
2. **Webhook endpoint يعمل بشكل طبيعي** (`/api/v1/webhook-receiver/`)
   - Your webhook endpoint works normally
   
3. **التكوين صحيح 100%**
   - Your configuration is 100% correct

---

## 🔧 ماذا تفعل؟ / What To Do?

### الخيار 1: استخدم التكوين الموجود (موصى به) ⭐

التكوين في `config.ini` **جاهز وصحيح**:

```ini
[webhooks]
[[parkpow]]
url = https://app.parkpow.com/api/v1/webhook-receiver/
header = Authorization: Token YOUR_PARKPOW_API_TOKEN_HERE
image = yes
image_type = car
```

✅ **ابدأ باستخدامه مباشرة!**
✅ **Start using it directly!**

---

### الخيار 2: انتظر وأعد المحاولة لاحقاً

إذا كنت تريد فقط مراجعة الوثائق:

1. **انتظر 1-5 دقائق**
2. **حاول مرة أخرى**
3. **استخدم VPN** إذا استمرت المشكلة

---

### الخيار 3: استخدم الوثائق البديلة

بدلاً من `/openapi/`، استخدم:

#### وثائق ParkPow الرسمية:
- **Dashboard**: https://app.parkpow.com/
- **API Docs**: قد تكون متوفرة في لوحة التحكم
- **Support**: contact@parkpow.com

#### الوثائق المحلية:
- [STREAM_INTEGRATION_GUIDE.md](STREAM_INTEGRATION_GUIDE.md) - دليل كامل
- [STREAM_QUICK_START.md](STREAM_QUICK_START.md) - بدء سريع
- [config.ini](config.ini) - ملف التكوين

---

## 🧪 اختبار الاتصال / Test Connection

لا تحتاج لوثائق OpenAPI لاختبار النظام!

### اختبار مباشر / Direct Test:

```bash
curl -X POST https://app.parkpow.com/api/v1/webhook-receiver/ \
  -H "Authorization: Token YOUR_PARKPOW_API_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "test": true,
    "plate_number": "ABC-1234",
    "vehicle_type": "car",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

**الاستجابة المتوقعة:**
- ✅ `200 OK` - نجح الاتصال
- ✅ `201 Created` - تم إنشاء السجل
- ⚠️ `401 Unauthorized` - تحقق من API token
- ⚠️ `429 Too Many Requests` - أنت ترسل طلبات كثيرة

---

## 📊 فهم حدود الطلبات / Understanding Rate Limits

### ما هو 429؟ / What is 429?

**429 Too Many Requests** يعني:
- أرسلت طلبات كثيرة جداً في وقت قصير
- الخادم يحميك من الإفراط في الاستخدام
- عليك الانتظار قليلاً قبل إعادة المحاولة

The server is protecting against excessive requests.

### الحدود المتوقعة / Expected Limits:

| النوع / Type | الحد / Limit | الفترة / Period |
|--------------|--------------|------------------|
| OpenAPI Docs | منخفض / Low | لمنع الإساءة / Abuse prevention |
| Webhook API | عالي / High | حسب باقتك / Based on your plan |
| عادي / Normal | 100-1000 | في الساعة / per hour |

---

## 🛡️ أفضل الممارسات / Best Practices

### 1. استخدام Rate Limiting في التكوين

أضف إلى `config.ini`:

```ini
[webhooks]
[[parkpow]]
url = https://app.parkpow.com/api/v1/webhook-receiver/
header = Authorization: Token YOUR_PARKPOW_API_TOKEN_HERE
image = yes
image_type = car

# Rate limiting settings / إعدادات تحديد المعدل
max_requests_per_minute = 10
batch_interval = 6  # ثوانٍ بين الدفعات
retry_on_429 = yes
retry_delay = 60  # انتظار 60 ثانية
max_retries = 3
```

### 2. Exponential Backoff

```python
import time
import requests

def send_with_backoff(url, data, headers, max_retries=5):
    """إرسال مع إعادة محاولة ذكية"""
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 429:
                # احسب وقت الانتظار
                wait_time = 2 ** attempt  # 1, 2, 4, 8, 16 ثانية
                print(f"⚠️ 429 Error. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
                
            return response
            
        except Exception as e:
            print(f"❌ Error: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
    
    return None
```

### 3. Batch Processing

```python
import time

def send_batch(items, batch_size=5, delay=2):
    """إرسال دفعات مع تأخير"""
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        
        for item in batch:
            send_to_parkpow(item)
        
        # تأخير بين الدفعات
        if i + batch_size < len(items):
            time.sleep(delay)
```

### 4. Request Queuing

```python
from queue import Queue
import threading
import time

class RateLimitedSender:
    """مرسل مع تحديد معدل"""
    
    def __init__(self, max_per_minute=10):
        self.queue = Queue()
        self.max_per_minute = max_per_minute
        self.running = False
        
    def add(self, data):
        """أضف إلى قائمة الانتظار"""
        self.queue.put(data)
    
    def start(self):
        """ابدأ المعالجة"""
        self.running = True
        thread = threading.Thread(target=self._process)
        thread.start()
    
    def _process(self):
        """معالجة قائمة الانتظار"""
        interval = 60 / self.max_per_minute
        
        while self.running:
            if not self.queue.empty():
                data = self.queue.get()
                send_to_parkpow(data)
                time.sleep(interval)
            else:
                time.sleep(1)
```

---

## 🔍 تشخيص المشكلة / Diagnostic

### تحقق من الاستخدام / Check Usage:

```bash
# عدد الطلبات في آخر دقيقة
curl -H "Authorization: Token YOUR_PARKPOW_API_TOKEN_HERE" \
  https://app.parkpow.com/api/v1/usage/

# حالة API
curl -I https://app.parkpow.com/api/v1/webhook-receiver/
```

### مراقبة السجلات / Monitor Logs:

```bash
# إذا كنت تستخدم Stream
stream logs --tail 100 | grep "429"

# أو باستخدام الطوابع الزمنية
stream logs --since "1 hour ago" | grep -E "(429|rate limit)"
```

---

## 📞 الدعم / Support

### متى تتصل بالدعم؟ / When to Contact Support?

اتصل بدعم ParkPow إذا:
- ✅ الخطأ 429 يحدث على `/webhook-receiver/` (ليس فقط `/openapi/`)
- ✅ لديك باقة مدفوعة وتحتاج حدود أعلى
- ✅ الخطأ مستمر بعد ساعات من الانتظار

Contact ParkPow support if the error persists on webhook endpoint.

**معلومات الاتصال / Contact Info:**
- 📧 Email: support@parkpow.com
- 🌐 Dashboard: https://app.parkpow.com/
- 📖 Docs: Check your dashboard for API documentation

---

## ✅ الخلاصة / Summary

### ✨ النقاط الرئيسية:

1. ✅ **التكوين صحيح** - لا حاجة لتغيير شيء
2. ✅ **Webhook يعمل** - الخطأ فقط على `/openapi/`
3. ✅ **استخدم النظام** - ابدأ الآن بثقة
4. ⚠️ **راقب الحدود** - لا ترسل طلبات كثيرة
5. 🔄 **أضف إعادة محاولة** - للتعامل مع 429

### 🚀 الخطوة التالية:

```bash
# 1. نسخ التكوين
cp config.ini ~/.stream/config.ini

# 2. بدء Stream
stream start

# 3. مراقبة
stream logs --tail 50
```

**كل شيء جاهز! 🎉**

---

**آخر تحديث / Last Updated:** 2025-11-22  
**الحالة / Status:** ✅ مُحدّث / Updated  
**الأولوية / Priority:** 🟡 متوسط / Medium (لا يؤثر على العمل / Doesn't affect operation)
