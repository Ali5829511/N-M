# 🔑 دليل إعداد API Token
# API Token Configuration Guide

**آخر تحديث:** 2025-11-12  
**الإصدار:** 1.3.0

---

## 📋 نظرة عامة - Overview

هذا الدليل يوضح كيفية إعداد واستخدام API Tokens في نظام إدارة المرور.

This guide explains how to set up and use API Tokens in the Traffic Management System.

---

## 🔐 إعداد ParkPow API Token

### الخطوة 1: الحصول على التوكن

1. قم بزيارة: https://app.parkpow.com
2. سجل الدخول أو أنشئ حساب جديد
3. انتقل إلى **API Settings** أو **إعدادات API**
4. انسخ API Token الخاص بك

### الخطوة 2: إنشاء ملف .env

**على Windows:**
```bash
copy .env.example .env
```

**على Linux/Mac:**
```bash
cp .env.example .env
```

### الخطوة 3: إضافة التوكن

افتح ملف `.env` وأضف التوكن:

```env
# ParkPow API Configuration
PARKPOW_API_TOKEN=your_parkpow_api_token_here
```

**⚠️ تحذير أمني مهم:**
- ❌ **لا تضع** التوكن مباشرة في ملفات الكود
- ❌ **لا تشارك** التوكن على GitHub أو أي مكان عام
- ✅ **استخدم دائماً** ملف `.env` (محمي بـ .gitignore)
- ✅ **غيّر التوكن** بشكل دوري للأمان

---

## 🚀 استخدام API Token في التطوير

### الطريقة الصحيحة:

```javascript
// في server.js - الطريقة الآمنة ✅
const PARKPOW_API_TOKEN = process.env.PARKPOW_API_TOKEN;

if (!PARKPOW_API_TOKEN) {
  console.warn('⚠️  WARNING: PARKPOW_API_TOKEN is not set.');
}
```

### الطريقة الخاطئة (تجنبها):

```javascript
// ❌ لا تفعل هذا أبداً!
const PARKPOW_API_TOKEN = 'your_actual_token_here'; // Never hardcode tokens!
```

---

## 🌐 التوكنات في بيئات مختلفة

### Development (التطوير)
```env
# .env.development
PARKPOW_API_TOKEN=dev_token_here
NODE_ENV=development
```

### Production (الإنتاج)
```env
# .env.production
PARKPOW_API_TOKEN=prod_token_here
NODE_ENV=production
```

### Testing (الاختبار)
```env
# .env.test
PARKPOW_API_TOKEN=test_token_here
NODE_ENV=test
```

---

## 🔧 إعداد التوكنات في منصات النشر

### GitHub Actions

في GitHub Repository → Settings → Secrets → Actions:

```yaml
# .github/workflows/deploy.yml
env:
  PARKPOW_API_TOKEN: ${{ secrets.PARKPOW_API_TOKEN }}
```

### Render.com

في Dashboard → Environment Variables:

```
Key: PARKPOW_API_TOKEN
Value: YOUR_PARKPOW_API_TOKEN_HERE
```

### Fly.io

```bash
fly secrets set PARKPOW_API_TOKEN=YOUR_PARKPOW_API_TOKEN_HERE
```

### Heroku

```bash
heroku config:set PARKPOW_API_TOKEN=YOUR_PARKPOW_API_TOKEN_HERE
```

### Docker

```bash
docker run -e PARKPOW_API_TOKEN=YOUR_PARKPOW_API_TOKEN_HERE myapp
```

---

## 🧪 اختبار التوكن

### من سطر الأوامر:

```bash
# Windows
set PARKPOW_API_TOKEN=YOUR_PARKPOW_API_TOKEN_HERE
npm start

# Linux/Mac
export PARKPOW_API_TOKEN=YOUR_PARKPOW_API_TOKEN_HERE
npm start
```

### من JavaScript:

```javascript
// test-api-token.js
async function testParkPowAPI() {
    const token = process.env.PARKPOW_API_TOKEN;
    
    if (!token) {
        console.error('❌ Token not configured');
        return;
    }
    
    try {
        const response = await fetch('https://app.parkpow.com/api/v1/user/', {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Token is valid!');
            const data = await response.json();
            console.log('User:', data);
        } else {
            console.error('❌ Token is invalid');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testParkPowAPI();
```

### تشغيل الاختبار:

```bash
node test-api-token.js
```

---

## 📊 استخدام التوكن في الصفحات

### في advanced_analytics_dashboard.html:

النظام يستخدم API من خلال `server.js` الذي يحمي التوكن:

```javascript
// الصفحة تطلب من الخادم
fetch('/api/parkpow/status')
    .then(response => response.json())
    .then(data => {
        if (data.configured && data.connected) {
            console.log('✅ ParkPow API متصل');
        }
    });
```

```javascript
// الخادم يستخدم التوكن بشكل آمن
app.get('/api/parkpow/status', async (req, res) => {
    if (!PARKPOW_API_TOKEN) {
        return res.json({ 
            configured: false,
            message: 'Token not configured' 
        });
    }
    
    // استخدام التوكن بشكل آمن
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Token ${PARKPOW_API_TOKEN}` }
    });
    
    // إرجاع النتائج بدون كشف التوكن
    res.json(await response.json());
});
```

---

## 🔄 تجديد التوكن

### متى تحتاج لتجديد التوكن؟

- ⏰ كل 3-6 أشهر (للأمان)
- 🔓 عند اكتشاف تسريب محتمل
- 👥 عند تغيير أعضاء الفريق
- 🔧 عند الانتقال للإنتاج

### خطوات التجديد:

1. احصل على توكن جديد من ParkPow
2. حدّث ملف `.env`:
   ```env
   PARKPOW_API_TOKEN=new_token_here
   ```
3. أعد تشغيل الخادم:
   ```bash
   npm restart
   ```
4. اختبر التوكن الجديد
5. احذف التوكن القديم من ParkPow

---

## 🛡️ أفضل ممارسات الأمان

### ✅ افعل:

1. **استخدم متغيرات البيئة دائماً**
   ```javascript
   const token = process.env.API_TOKEN;
   ```

2. **أضف .env إلى .gitignore**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

3. **استخدم توكنات مختلفة لكل بيئة**
   - Development
   - Testing
   - Production

4. **راقب استخدام API**
   - تتبع الطلبات
   - راقب الأخطاء
   - احذر من تجاوز الحدود

5. **خزّن التوكنات في مكان آمن**
   - مدير كلمات المرور
   - خدمات إدارة الأسرار (AWS Secrets Manager, Azure Key Vault)

### ❌ لا تفعل:

1. ❌ **لا تضع التوكن في الكود**
   ```javascript
   // ❌ خطأ!
   const token = 'YOUR_PARKPOW_API_TOKEN_HERE';
   ```

2. ❌ **لا تشارك التوكن عبر البريد أو الدردشة**

3. ❌ **لا ترفع .env إلى GitHub**

4. ❌ **لا تستخدم نفس التوكن في جميع البيئات**

5. ❌ **لا تكشف التوكن في Logs أو Error Messages**
   ```javascript
   // ❌ خطأ!
   console.log('Using token:', PARKPOW_API_TOKEN);
   
   // ✅ صحيح
   console.log('Token configured:', !!PARKPOW_API_TOKEN);
   ```

---

## 📝 مثال كامل

### ملف .env:

```env
# N-M Traffic Management System - Environment Configuration

# Server
PORT=8080
HOST=0.0.0.0
NODE_ENV=development

# ParkPow API (Plate Recognition)
PARKPOW_API_TOKEN=YOUR_PARKPOW_API_TOKEN_HERE
PARKPOW_API_URL=https://app.parkpow.com/api/v1

# EmailJS (Notifications)
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_PUBLIC_KEY=pk_xyz789

# Security
SESSION_SECRET=random_secret_key_here_minimum_32_chars
JWT_SECRET=another_random_secret_for_jwt_tokens

# Database (future)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=traffic_system
# DB_USER=dbuser
# DB_PASSWORD=secure_password
```

### تحميل في server.js:

```javascript
// في بداية server.js
require('dotenv').config();

// استخدام المتغيرات
const PORT = process.env.PORT || 8080;
const PARKPOW_API_TOKEN = process.env.PARKPOW_API_TOKEN;
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-dev-secret';

// التحقق
if (!PARKPOW_API_TOKEN) {
    console.warn('⚠️  ParkPow API token not configured');
}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "PARKPOW_API_TOKEN is not set"

**الحلول:**
1. تأكد من وجود ملف `.env` في المجلد الرئيسي
2. تحقق من صحة اسم المتغير (حساس لحالة الأحرف)
3. أعد تشغيل الخادم بعد تعديل `.env`
4. تأكد من تثبيت `dotenv` إذا كنت تستخدمه

### المشكلة: "Invalid API token"

**الحلول:**
1. تحقق من صحة التوكن من ParkPow Dashboard
2. تأكد من عدم وجود مسافات قبل أو بعد التوكن
3. جرب الحصول على توكن جديد
4. تحقق من انتهاء صلاحية الحساب

### المشكلة: Token في الكود المصدري

**الحل:**
1. احذف التوكن من الكود فوراً
2. أضفه إلى `.env`
3. غيّر التوكن من ParkPow Dashboard
4. تأكد من عدم وجوده في تاريخ Git:
   ```bash
   git log -S "YOUR_PARKPOW_API_TOKEN_HERE"
   ```

---

## 📚 موارد إضافية

### التوثيق:
- [ParkPow API Documentation](https://app.parkpow.com/api/docs)
- [dotenv Package](https://www.npmjs.com/package/dotenv)
- [Security Best Practices](../SECURITY.md)

### أدوات مفيدة:
- [git-secrets](https://github.com/awslabs/git-secrets) - منع تسريب الأسرار
- [truffleHog](https://github.com/trufflesecurity/trufflehog) - البحث عن أسرار مسربة
- [1Password](https://1password.com/) - إدارة كلمات المرور

---

## ✅ قائمة التحقق

قبل النشر، تأكد من:

- [ ] التوكن في `.env` وليس في الكود
- [ ] `.env` مضاف إلى `.gitignore`
- [ ] التوكن لم يُرفع إلى GitHub
- [ ] استخدام توكنات مختلفة للتطوير والإنتاج
- [ ] التوكن محفوظ في مكان آمن
- [ ] تم اختبار التوكن والتأكد من عمله
- [ ] الفريق يعرف كيفية التعامل مع التوكنات

---

**آخر تحديث:** 2025-11-12  
**الإصدار:** 1.3.0  
**الحالة:** ✅ جاهز للاستخدام

---

© 2025 - نظام إدارة المرور  
جامعة الإمام محمد بن سعود الإسلامية
