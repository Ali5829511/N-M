# 📨 Webhook Receiver API Documentation
# توثيق واجهة برمجة تطبيقات جهاز استقبال الـ Webhook

**Endpoint:** `/api/v1/webhook-receiver/`  
**Version:** 1.0  
**Status:** ✅ Active  
**Authentication:** ❌ Not Required (Public endpoint for webhooks)

---

## 📋 Overview | نظرة عامة

This endpoint provides a Django REST Framework-style webhook receiver that accepts incoming webhook notifications from external services like ParkPow without requiring authentication.

نقطة النهاية هذه توفر جهاز استقبال webhook بنمط Django REST Framework يقبل إشعارات webhook الواردة من الخدمات الخارجية مثل ParkPow بدون الحاجة إلى مصادقة.

---

## 🔐 Security Note | ملاحظة أمنية

⚠️ **This endpoint does NOT require authentication** to allow external webhook services to send data. Ensure you validate webhook data and implement additional security measures like:

- IP whitelisting
- Webhook signatures/tokens
- Rate limiting

⚠️ **نقطة النهاية هذه لا تتطلب مصادقة** للسماح لخدمات webhook الخارجية بإرسال البيانات. تأكد من التحقق من صحة بيانات webhook وتنفيذ تدابير أمنية إضافية مثل:

- القائمة البيضاء لعناوين IP
- توقيعات/رموز webhook
- تحديد المعدل

---

## 📡 Supported Methods | الطرق المدعومة

### 1. GET Request | طلب GET

Returns information about the webhook endpoint.

يعيد معلومات حول نقطة النهاية webhook.

**Request:**
```bash
curl -X GET http://localhost:8080/api/v1/webhook-receiver/
```

**Response:**
```json
{
  "name": "Webhook Receiver",
  "description": "جهاز استقبال هوك - Webhook receiver for ParkPow and other services",
  "detail": "Use POST method to send webhook data",
  "methods_allowed": ["POST", "OPTIONS"]
}
```

**Status Code:** `200 OK`

**Headers:**
- `Allow: POST, OPTIONS`
- `Content-Type: application/json`
- `Vary: Accept`

---

### 2. POST Request | طلب POST

Receives webhook data from external services.

يستقبل بيانات webhook من الخدمات الخارجية.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/webhook-receiver/ \
  -H "Content-Type: application/json" \
  -d '{
    "plate": "و 2309",
    "score": 0.95,
    "vehicle": {
      "type": "sedan"
    },
    "timestamp": "2025-11-17T15:00:00Z"
  }'
```

**Response:**
```json
{
  "detail": "تم استقبال البيانات بنجاح",
  "message": "Webhook data received successfully",
  "received_at": "2025-11-17T15:54:26.975Z",
  "status": "success"
}
```

**Status Code:** `200 OK`

**Headers:**
- `Allow: POST, OPTIONS`
- `Content-Type: application/json`
- `Vary: Accept`

---

### 3. OPTIONS Request | طلب OPTIONS

Returns allowed HTTP methods (used for CORS preflight requests).

يعيد طرق HTTP المسموح بها (يستخدم لطلبات CORS preflight).

**Request:**
```bash
curl -X OPTIONS http://localhost:8080/api/v1/webhook-receiver/
```

**Response:**
```json
{
  "name": "Webhook Receiver",
  "description": "Endpoint for receiving webhook notifications",
  "renders": ["application/json"],
  "parses": ["application/json"]
}
```

**Status Code:** `200 OK`

**Headers:**
- `Allow: POST, OPTIONS`
- `Content-Type: application/json`
- `Vary: Accept`

---

## 📊 Request Body Schema | مخطط طلب البيانات

The webhook endpoint accepts any valid JSON payload. For ParkPow plate recognition webhooks, the expected format is:

نقطة النهاية webhook تقبل أي حمولة JSON صالحة. لـ webhooks التعرف على اللوحات من ParkPow، التنسيق المتوقع هو:

```json
{
  "plate": "string",           // رقم اللوحة | Plate number
  "score": 0.0-1.0,           // الثقة | Confidence score
  "vehicle": {
    "type": "string",         // نوع السيارة | Vehicle type
    "color": "string",        // اللون | Color
    "make": "string"          // الصانع | Make
  },
  "timestamp": "ISO8601",     // الوقت | Timestamp
  "camera_id": "string",      // معرف الكاميرا | Camera ID
  "image_url": "string"       // رابط الصورة | Image URL
}
```

---

## 🎯 Response Schema | مخطط الاستجابة

### Success Response | استجابة النجاح

```json
{
  "detail": "تم استقبال البيانات بنجاح",
  "message": "Webhook data received successfully",
  "received_at": "2025-11-17T15:54:26.975Z",
  "status": "success"
}
```

### Error Response | استجابة الخطأ

```json
{
  "detail": "خطأ في معالجة البيانات",
  "message": "Error processing webhook data",
  "error": "Error message details"
}
```

**Status Code:** `500 Internal Server Error`

---

## 🔄 Integration Examples | أمثلة التكامل

### JavaScript/Node.js

```javascript
async function sendWebhook(data) {
  const response = await fetch('http://localhost:8080/api/v1/webhook-receiver/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  console.log('Webhook response:', result);
  return result;
}

// Example usage
sendWebhook({
  plate: 'و 2309',
  score: 0.95,
  vehicle: { type: 'sedan' },
  timestamp: new Date().toISOString()
});
```

### Python

```python
import requests
import json
from datetime import datetime

def send_webhook(data):
    url = 'http://localhost:8080/api/v1/webhook-receiver/'
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, 
                           headers=headers, 
                           data=json.dumps(data))
    
    print('Webhook response:', response.json())
    return response.json()

# Example usage
send_webhook({
    'plate': 'و 2309',
    'score': 0.95,
    'vehicle': {'type': 'sedan'},
    'timestamp': datetime.now().isoformat()
})
```

### cURL

```bash
curl -X POST http://localhost:8080/api/v1/webhook-receiver/ \
  -H "Content-Type: application/json" \
  -d '{
    "plate": "و 2309",
    "score": 0.95,
    "vehicle": {"type": "sedan"},
    "timestamp": "2025-11-17T15:00:00Z"
  }'
```

---

## 🔗 ParkPow Integration | تكامل ParkPow

To configure ParkPow to send webhooks to your server:

لتكوين ParkPow لإرسال webhooks إلى الخادم الخاص بك:

1. **Login to ParkPow Dashboard**
   - Go to: https://app.parkpow.com/
   - تسجيل الدخول إلى لوحة تحكم ParkPow

2. **Configure Webhook URL**
   - Navigate to: Settings → Webhooks
   - Add URL: `https://your-domain.com/api/v1/webhook-receiver/`
   - انتقل إلى: الإعدادات → Webhooks
   - أضف الرابط: `https://your-domain.com/api/v1/webhook-receiver/`

3. **Select Events**
   - Choose events: Plate Recognition, Vehicle Detection
   - اختر الأحداث: التعرف على اللوحات، اكتشاف السيارات

4. **Save Configuration**
   - Click "Save" and test the webhook
   - انقر على "حفظ" واختبر الـ webhook

---

## 📝 Server Logs | سجلات الخادم

When a webhook is received, the server logs the following:

عند استلام webhook، يسجل الخادم ما يلي:

```
📨 [Webhook Receiver] Data received at: 2025-11-17T15:54:26.975Z
📨 [Webhook Receiver] Payload: {
  "plate": "و 2309",
  "score": 0.95
}
📋 [Webhook Receiver] Plate recognition data detected
```

---

## 🧪 Testing | الاختبار

### Manual Testing | الاختبار اليدوي

```bash
# Test with sample plate data
curl -X POST http://localhost:8080/api/v1/webhook-receiver/ \
  -H "Content-Type: application/json" \
  -d '{"plate": "ABC 123", "score": 0.95}'
```

### Automated Testing | الاختبار التلقائي

A test script is available at `/tmp/test_webhook_endpoint.sh`:

```bash
chmod +x /tmp/test_webhook_endpoint.sh
./tmp/test_webhook_endpoint.sh
```

---

## ⚠️ Error Handling | معالجة الأخطاء

### Common Errors | الأخطاء الشائعة

1. **Invalid JSON**
   ```json
   {
     "detail": "خطأ في معالجة البيانات",
     "message": "Invalid JSON format"
   }
   ```

2. **Server Error**
   ```json
   {
     "detail": "خطأ في معالجة البيانات",
     "message": "Error processing webhook data",
     "error": "Internal server error details"
   }
   ```

---

## 🔒 Security Recommendations | توصيات الأمان

### Production Deployment | النشر في الإنتاج

When deploying to production, consider:

عند النشر في الإنتاج، ضع في الاعتبار:

1. **Use HTTPS** - Always use secure connections
   - استخدم HTTPS - استخدم دائمًا اتصالات آمنة

2. **Validate Webhook Source** - Check request origin
   - تحقق من مصدر Webhook - تحقق من أصل الطلب

3. **Rate Limiting** - Prevent abuse
   - تحديد المعدل - منع إساءة الاستخدام

4. **Request Logging** - Monitor all incoming webhooks
   - تسجيل الطلبات - راقب جميع webhooks الواردة

5. **Data Validation** - Validate all incoming data
   - التحقق من البيانات - تحقق من صحة جميع البيانات الواردة

---

## 📚 Related Documentation | التوثيق ذو الصلة

- [ParkPow FTP Setup Guide](./PARKPOW_FTP_SETUP_GUIDE.md)
- [API Token Setup Guide](./API_TOKEN_SETUP_GUIDE.md)
- [Security Guide](./SECURITY.md)

---

## 📞 Support | الدعم

For questions or issues:

للأسئلة أو المشاكل:

- 📧 Email: support@university.edu.sa
- 🌐 Documentation: https://github.com/Ali5829511/N-M/tree/main/docs
- 💬 GitHub Issues: https://github.com/Ali5829511/N-M/issues

---

**Last Updated:** 2025-11-17  
**Version:** 1.0  
**Status:** ✅ Active and Tested

© 2025 - نظام إدارة المرور  
جامعة الإمام محمد بن سعود الإسلامية
