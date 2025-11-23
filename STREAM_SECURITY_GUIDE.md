# 🔐 أمان تكوين Stream
# Stream Configuration Security Guide

## ⚠️ مهم جداً / VERY IMPORTANT

**لا تضف أبداً ملفات التكوين التي تحتوي على رموز API حقيقية إلى Git!**

**NEVER commit configuration files with real API tokens to Git!**

---

## 📋 نظرة عامة / Overview

هذا الدليل يشرح كيفية تأمين تكوين Stream و ParkPow API بشكل صحيح.

This guide explains how to properly secure Stream and ParkPow API configuration.

---

## 🔑 رمز API / API Token

### الحصول على الرمز / Getting Your Token

رمز API الخاص بك متوفر في لوحة تحكم ParkPow:

Your API token is available in your ParkPow dashboard:

1. اذهب إلى: https://app.parkpow.com
2. تسجيل الدخول / Log in
3. الإعدادات > API
4. انسخ الرمز / Copy the token

**مثال على رمز API / Example API Token:**
```
YOUR_PARKPOW_API_TOKEN_HERE
```

⚠️ **هذا مجرد placeholder! / This is just a placeholder!**  
استخدم رمزك الخاص من لوحة التحكم.  
Use your own token from your dashboard.

---

## 📁 ملفات التكوين / Configuration Files

### الملفات في المشروع / Files in the Project

| الملف / File | الغرض / Purpose | هل يُضاف لـ Git؟ / Committed to Git? |
|-------------|-----------------|-----------------------------------|
| `config.ini` | قالب مع placeholders / Template with placeholders | ✅ نعم / Yes |
| `config.ini.private` | التكوين الفعلي مع الرمز الحقيقي / Actual config with real token | ❌ لا / No (في .gitignore) |
| `config.ini.example` | مثال للتوثيق / Example for documentation | ✅ نعم / Yes |

### كيفية الاستخدام / How to Use

#### الخطوة 1: نسخ القالب

```bash
# نسخ القالب إلى ملف خاص
cp config.ini config.ini.private
```

#### الخطوة 2: تحرير الملف الخاص

```bash
# تحرير بمحرر النصوص المفضل لديك
nano config.ini.private
# أو
vim config.ini.private
# أو
code config.ini.private
```

#### الخطوة 3: إضافة الرمز الحقيقي

استبدل `YOUR_PARKPOW_API_TOKEN_HERE` برمزك الحقيقي:

```ini
[webhooks]
[[parkpow]]
url = https://app.parkpow.com/api/v1/webhook-receiver/
header = Authorization: Token YOUR_ACTUAL_TOKEN_HERE
image = yes
image_type = car
```

#### الخطوة 4: استخدام الملف الخاص

```bash
# استخدام الملف الخاص مع Stream
stream --config config.ini.private start
```

---

## 🛡️ .gitignore

تأكد من أن `.gitignore` يحتوي على:

Make sure `.gitignore` contains:

```gitignore
# Private configuration files
config.ini.private
*.private
.env
.env.local
```

### التحقق من .gitignore

```bash
# تحقق من أن الملف الخاص لن يُضاف
git status

# يجب ألا ترى config.ini.private في القائمة
# You should NOT see config.ini.private in the list
```

---

## 🔒 أفضل الممارسات الأمنية / Security Best Practices

### 1. استخدام متغيرات البيئة / Use Environment Variables

بدلاً من تخزين الرمز في الملف:

```bash
# تعيين في البيئة
export PARKPOW_API_TOKEN="your_token_here"

# استخدام في السكريبت
TOKEN="${PARKPOW_API_TOKEN}"
```

### 2. أدوات إدارة الأسرار / Secret Management Tools

للإنتاج، استخدم أدوات احترافية:

For production, use professional tools:

- **HashiCorp Vault**: https://www.vaultproject.io/
- **AWS Secrets Manager**: https://aws.amazon.com/secrets-manager/
- **Azure Key Vault**: https://azure.microsoft.com/en-us/services/key-vault/
- **Google Secret Manager**: https://cloud.google.com/secret-manager

### 3. تدوير الرموز / Token Rotation

قم بتغيير رموز API بانتظام:

- كل 30-90 يوم / Every 30-90 days
- عند الاشتباه في اختراق / When breach is suspected
- عند مغادرة موظف / When employee leaves

```bash
# إنشاء رمز جديد في ParkPow
# Generate new token in ParkPow

# تحديث التكوين
# Update configuration

# اختبار الرمز الجديد
# Test new token

# إلغاء الرمز القديم
# Revoke old token
```

### 4. الصلاحيات المحدودة / Limited Permissions

استخدم رموز API بصلاحيات محدودة:

- ✅ فقط ما تحتاجه / Only what you need
- ❌ ليس admin كامل / Not full admin
- ✅ قراءة فقط إذا ممكن / Read-only if possible

### 5. المراقبة / Monitoring

راقب استخدام API:

- عدد الطلبات / Request count
- IP addresses المستخدمة / IP addresses used
- أنماط غير طبيعية / Unusual patterns
- محاولات فاشلة / Failed attempts

```bash
# مراقبة السجلات
stream logs | grep "401\|403\|429"
```

### 6. HTTPS فقط / HTTPS Only

✅ استخدم دائماً HTTPS  
❌ لا تستخدم HTTP أبداً

```ini
# ✅ صحيح
url = https://app.parkpow.com/api/v1/webhook-receiver/

# ❌ خطأ
url = http://app.parkpow.com/api/v1/webhook-receiver/
```

---

## 🚨 ماذا تفعل إذا تسرب الرمز؟ / What If Token Is Leaked?

### خطوات فورية / Immediate Steps

1. **إلغاء الرمز فوراً / Revoke Token Immediately**
   ```
   https://app.parkpow.com → Settings → API → Revoke
   ```

2. **إنشاء رمز جديد / Generate New Token**
   ```
   https://app.parkpow.com → Settings → API → Generate New
   ```

3. **تحديث التكوين / Update Configuration**
   ```bash
   # تحديث config.ini.private
   nano config.ini.private
   ```

4. **مراجعة السجلات / Review Logs**
   ```bash
   # تحقق من أي نشاط مشبوه
   stream logs --since "1 week ago"
   ```

5. **إبلاغ الفريق / Notify Team**
   - أخبر فريقك / Inform your team
   - غير كلمات المرور / Change passwords
   - راجع الوصول / Review access

---

## ✅ قائمة التحقق الأمنية / Security Checklist

قبل النشر، تحقق من:

Before deployment, verify:

- [ ] `config.ini.private` في `.gitignore`
- [ ] لا توجد رموز في `config.ini`
- [ ] استخدام HTTPS فقط
- [ ] تم اختبار التكوين
- [ ] الرموز محدودة الصلاحيات
- [ ] تم إعداد المراقبة
- [ ] الفريق يعرف إجراءات الطوارئ
- [ ] لديك نسخة احتياطية من التكوين (بشكل آمن)

---

## 📚 موارد إضافية / Additional Resources

### الوثائق / Documentation

- [STREAM_INTEGRATION_GUIDE.md](STREAM_INTEGRATION_GUIDE.md) - دليل التكامل
- [PARKPOW_429_ERROR_SOLUTION.md](PARKPOW_429_ERROR_SOLUTION.md) - حل مشاكل API
- [.env.example](.env.example) - مثال على متغيرات البيئة

### روابط خارجية / External Links

- **ParkPow Dashboard**: https://app.parkpow.com
- **ParkPow Support**: support@parkpow.com
- **OWASP API Security**: https://owasp.org/www-project-api-security/

---

## 🎓 أمثلة عملية / Practical Examples

### مثال 1: استخدام متغيرات البيئة

```bash
#!/bin/bash
# start_stream_secure.sh

# قراءة الرمز من ملف آمن
source ~/.parkpow_credentials

# أو من متغير بيئة
if [ -z "$PARKPOW_API_TOKEN" ]; then
    echo "❌ Error: PARKPOW_API_TOKEN not set"
    exit 1
fi

# إنشاء config مؤقت
cat > /tmp/stream_config.ini << EOF
[webhooks]
[[parkpow]]
url = https://app.parkpow.com/api/v1/webhook-receiver/
header = Authorization: Token ${PARKPOW_API_TOKEN}
image = yes
image_type = car
EOF

# تشغيل Stream
stream --config /tmp/stream_config.ini start

# حذف الملف المؤقت
rm /tmp/stream_config.ini
```

### مثال 2: Python مع متغيرات البيئة

```python
import os
import configparser

def create_secure_config():
    """إنشاء تكوين آمن من متغيرات البيئة"""
    
    # قراءة الرمز من البيئة
    api_token = os.environ.get('PARKPOW_API_TOKEN')
    
    if not api_token:
        raise ValueError("PARKPOW_API_TOKEN not set in environment")
    
    # إنشاء التكوين
    config = configparser.ConfigParser()
    config['webhooks'] = {}
    config['webhooks']['parkpow'] = {
        'url': 'https://app.parkpow.com/api/v1/webhook-receiver/',
        'header': f'Authorization: Token {api_token}',
        'image': 'yes',
        'image_type': 'car'
    }
    
    # إنشاء المجلد بصلاحيات آمنة
    config_dir = os.path.dirname(config_path)
    os.makedirs(config_dir, mode=0o700, exist_ok=True)
    
    # حفظ في موقع آمن (ليس في Git)
    config_path = os.path.expanduser('~/.stream/config.ini')
    with open(config_path, 'w') as f:
        config.write(f)
    
    # تعيين صلاحيات الملف
    os.chmod(config_path, 0o600)
    
    return config_path

if __name__ == '__main__':
    config_path = create_secure_config()
    print(f"✅ Config created at: {config_path}")
```

---

**آخر تحديث / Last Updated:** 2025-11-22  
**الأولوية / Priority:** 🔴 عالية / High  
**الحالة / Status:** ✅ مكتمل / Complete
