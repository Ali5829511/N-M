# 🔧 دليل المطورين - Developer Guide

## بيئة التطوير / Development Environment

### المتطلبات / Requirements

- Node.js 14.0+
- npm 6.0+
- Python 3.x (اختياري / optional)
- Git

### الإعداد / Setup

```bash
# استنساخ المشروع / Clone repository
git clone https://github.com/Ali5829511/N-M.git
cd N-M

# تثبيت المتطلبات / Install dependencies
npm install

# تشغيل الخادم / Start server
npm start
```

---

## 🚀 أوامر التطوير / Development Commands

### تشغيل الخادم / Server Commands

```bash
# خادم Express (موصى به للتطوير)
npm start

# خادم مع إعادة تحميل تلقائية
npm run dev

# خادم HTTP سريع
npm run start:http-server

# خادم Python بسيط
npm run start:python

# سكريبت Python مخصص
python3 simple-server.py [port]
```

### الاختبار / Testing

```bash
# اختبار إعدادات الخادم
npm run test:server
```

---

## 📁 هيكل المشروع / Project Structure

```
N-M/
├── js/
│   ├── auth.js              # نظام المصادقة
│   ├── database.js          # قاعدة البيانات المحلية
│   └── email-service.js     # خدمة البريد الإلكتروني
│
├── server/                  # ملفات الخادم
│   ├── server.js           # خادم Express الرئيسي
│   ├── server.config.json  # إعدادات الخادم
│   └── simple-server.py    # خادم Python بسيط
│
├── docs/                    # الوثائق
│   ├── SERVER_SETUP_AR.md  # دليل الخادم بالعربية
│   ├── SERVER_SETUP_EN.md  # دليل الخادم بالإنجليزية
│   └── ...
│
├── *.html                   # صفحات النظام
├── package.json            # تكوين npm
├── start-server.sh         # سكريبت تشغيل Linux/Mac
├── start-server.bat        # سكريبت تشغيل Windows
└── README.md              # الملف التعريفي
```

---

## 🔨 إضافة ميزات جديدة / Adding New Features

### 1. صفحات HTML جديدة

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>اسم الصفحة</title>
    <script src="js/auth.js"></script>
    <script src="js/database.js"></script>
</head>
<body>
    <!-- المحتوى -->
</body>
</html>
```

### 2. وظائف JavaScript جديدة

```javascript
// في js/database.js أو ملف مخصص
function newFeature() {
    // الكود هنا
}
```

### 3. تحديث نظام الصلاحيات

```javascript
// في js/auth.js
const rolePermissions = {
    'new_role': {
        canAccess: ['page1.html', 'page2.html'],
        canEdit: true,
        // ...
    }
};
```

---

## 🎨 تخصيص الخادم / Server Customization

### تعديل إعدادات Express

عدّل ملف `server.config.json`:

```json
{
  "server": {
    "port": 8080,
    "host": "0.0.0.0",
    "compression": true,
    "cors": {
      "enabled": true,
      "origin": "*"
    }
  }
}
```

### إضافة مسارات جديدة / Adding New Routes

في `server.js`:

```javascript
// مسار جديد
app.get('/api/new-endpoint', (req, res) => {
    res.json({ message: 'Success' });
});
```

### تخصيص معالجة الأخطاء / Custom Error Handling

في `server.js`:

```javascript
app.use((err, req, res, next) => {
    // معالجة مخصصة للأخطاء
    res.status(500).json({ error: err.message });
});
```

---

## 🔍 تصحيح الأخطاء / Debugging

### تفعيل السجلات المفصلة / Enable Verbose Logging

```bash
# مع Express
DEBUG=* npm start

# مع nodemon
npm run dev
```

### استخدام أدوات المطور / Browser DevTools

1. افتح المتصفح
2. اضغط F12
3. تحقق من:
   - Console: للأخطاء JavaScript
   - Network: للطلبات
   - Application: لـ localStorage
   - Sources: لتصحيح الكود

### فحص قاعدة البيانات المحلية / Check Local Database

```javascript
// في Console المتصفح
console.log(localStorage);
console.log(localStorage.getItem('users'));
console.log(localStorage.getItem('violations'));
```

---

## 📦 إدارة التبعيات / Dependency Management

### إضافة تبعية جديدة / Adding New Dependency

```bash
# للإنتاج
npm install package-name --save

# للتطوير فقط
npm install package-name --save-dev
```

### تحديث التبعيات / Updating Dependencies

```bash
# فحص التحديثات المتاحة
npm outdated

# تحديث جميع الحزم
npm update

# تحديث حزمة محددة
npm update package-name
```

### فحص الثغرات الأمنية / Security Audit

```bash
# فحص الثغرات
npm audit

# إصلاح تلقائي
npm audit fix
```

---

## 🧪 الاختبار / Testing

### اختبار الخادم / Server Testing

```bash
# اختبار بسيط
curl http://localhost:8080

# اختبار مع headers
curl -I http://localhost:8080

# اختبار CORS
curl -H "Origin: http://example.com" \
     -H "Access-Control-Request-Method: GET" \
     -I http://localhost:8080
```

### اختبار الأداء / Performance Testing

```bash
# باستخدام ab (Apache Bench)
ab -n 1000 -c 10 http://localhost:8080/

# باستخدام wrk
wrk -t4 -c100 -d30s http://localhost:8080/
```

---

## 🚀 النشر / Deployment

### بناء للإنتاج / Build for Production

```bash
# تنظيف node_modules
rm -rf node_modules

# تثبيت للإنتاج فقط
npm install --production

# أو باستخدام yarn
yarn install --production
```

### متغيرات البيئة / Environment Variables

```bash
# Linux/Mac
export PORT=3000
export NODE_ENV=production
npm start

# Windows
set PORT=3000
set NODE_ENV=production
npm start
```

### Docker (اختياري) / Docker (Optional)

```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

---

## 📝 أفضل الممارسات / Best Practices

### الكود / Code

- ✅ استخدم أسماء متغيرات واضحة
- ✅ أضف تعليقات للكود المعقد
- ✅ اتبع نمط الكود الموجود
- ✅ تجنب التكرار (DRY)

### الأمان / Security

- ✅ لا تحفظ كلمات مرور في الكود
- ✅ استخدم HTTPS في الإنتاج
- ✅ تحقق من المدخلات
- ✅ راجع [SECURITY.md](SECURITY.md)

### الأداء / Performance

- ✅ استخدم ضغط الملفات
- ✅ فعّل Caching
- ✅ قلل حجم الصور
- ✅ قلل طلبات HTTP

---

## 🤝 المساهمة / Contributing

### خطوات المساهمة / Contribution Steps

1. Fork المشروع
2. أنشئ فرع جديد:
   ```bash
   git checkout -b feature/new-feature
   ```
3. اعمل التغييرات
4. اختبر التغييرات
5. Commit:
   ```bash
   git commit -m "Add new feature"
   ```
6. Push:
   ```bash
   git push origin feature/new-feature
   ```
7. أنشئ Pull Request

### معايير الكود / Code Standards

- استخدم UTF-8 encoding
- مسافات بدلاً من tabs
- أسطر لا تتجاوز 100 حرف
- تعليقات بالعربية والإنجليزية

---

## 📚 موارد إضافية / Additional Resources

### الوثائق الداخلية / Internal Documentation

- [README.md](README.md) - معلومات عامة
- [QUICKSTART.md](QUICKSTART.md) - البدء السريع
- [SERVER_SETUP_AR.md](SERVER_SETUP_AR.md) - دليل الخادم
- [DEPLOYMENT.md](DEPLOYMENT.md) - دليل النشر
- [SECURITY.md](SECURITY.md) - إرشادات الأمان

### الموارد الخارجية / External Resources

- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## 🐛 الإبلاغ عن المشاكل / Reporting Issues

عند الإبلاغ عن مشكلة، أضف:

1. وصف المشكلة
2. خطوات إعادة إنتاج المشكلة
3. السلوك المتوقع
4. السلوك الفعلي
5. معلومات البيئة:
   - نظام التشغيل
   - إصدار Node.js
   - إصدار المتصفح

---

## 📞 الدعم / Support

- **GitHub Issues**: للمشاكل التقنية
- **Pull Requests**: للمساهمات
- **Documentation**: للأسئلة العامة

---

© 2025 - Traffic Management System
جامعة الإمام محمد بن سعود الإسلامية
