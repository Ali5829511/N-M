# Stream + ParkPow: دليل سريع
# Stream + ParkPow: Quick Reference

## 🚀 البدء السريع / Quick Start

### رمز API / API Key
```
7c13be422713a758a42a0bc453cf3331fbf4d346
```

### التكوين / Configuration

أضف هذا إلى `config.ini`:

```ini
[webhooks]
[[parkpow]]
url = https://app.parkpow.com/api/v1/webhook-receiver/
header = Authorization: Token 7c13be422713a758a42a0bc453cf3331fbf4d346
image = yes
image_type = car
```

### الأوامر الأساسية / Basic Commands

```bash
# نسخ التكوين / Copy config
cp config.ini ~/.stream/config.ini

# بدء Stream / Start Stream
stream start

# حالة الاتصال / Connection status
stream status

# عرض السجلات / View logs
stream logs --tail 100
```

### اختبار سريع / Quick Test

```bash
curl -X POST https://app.parkpow.com/api/v1/webhook-receiver/ \
  -H "Authorization: Token 7c13be422713a758a42a0bc453cf3331fbf4d346" \
  -H "Content-Type: application/json" \
  -d '{"plate_number": "ABC-1234", "vehicle_type": "car"}'
```

## 📚 للمزيد / For More

راجع: [STREAM_INTEGRATION_GUIDE.md](STREAM_INTEGRATION_GUIDE.md)

---

**الحالة / Status:** ✅ جاهز / Ready
