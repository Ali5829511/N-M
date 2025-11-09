# إرشادات الأمان - Security Guidelines
# نظام إدارة إسكان أعضاء هيئة التدريس

## ⚠️ تحذير مهم جداً

**هذا النظام في حالته الحالية مصمم للتطوير والاختبار الداخلي فقط!**

النظام يستخدم:
- ❌ localStorage لتخزين البيانات (غير آمن للإنتاج)
- ❌ كلمات مرور غير مشفرة (plain text)
- ❌ لا يوجد backend API
- ❌ لا يوجد HTTPS
- ❌ لا يوجد حماية ضد الهجمات الشائعة

## 🛡️ الثغرات الأمنية الحالية

### 1. تخزين كلمات المرور بنص عادي
**المشكلة:**
```javascript
// في database.js - كلمة المرور مخزنة بنص عادي
password: 'admin123'
```

**الحل المطلوب:**
```javascript
// استخدام bcrypt لتشفير كلمات المرور
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash('admin123', 10);
password_hash: hashedPassword
```

### 2. استخدام localStorage للبيانات الحساسة
**المشكلة:**
- localStorage غير آمن
- يمكن الوصول إليه من JavaScript
- عرضة لهجمات XSS
- البيانات مخزنة بنص عادي

**الحل المطلوب:**
- استخدام قاعدة بيانات خلفية (PostgreSQL/MySQL)
- تخزين JWT tokens فقط (مع httpOnly cookies)
- تشفير البيانات الحساسة

### 3. عدم وجود Backend API
**المشكلة:**
- جميع العمليات تتم في المتصفح
- يمكن التلاعب بالبيانات من Console
- لا يوجد تحقق من الصلاحيات على الخادم

**الحل المطلوب:**
- بناء REST API مع Node.js/Express أو Python/Django
- تطبيق Authentication middleware
- تطبيق Authorization على جميع endpoints

### 4. عدم وجود HTTPS
**المشكلة:**
- البيانات تُنقل بدون تشفير
- عرضة لهجمات Man-in-the-Middle
- كلمات المرور يمكن اعتراضها

**الحل المطلوب:**
- الحصول على شهادة SSL (Let's Encrypt مجاني)
- إجبار جميع الاتصالات على HTTPS
- تطبيق HSTS headers

### 5. عدم وجود حماية CSRF
**المشكلة:**
- عرضة لهجمات Cross-Site Request Forgery
- يمكن تنفيذ عمليات غير مصرح بها

**الحل المطلوب:**
```javascript
// تطبيق CSRF tokens
app.use(csrf({ cookie: true }));
```

### 6. عدم وجود Rate Limiting
**المشكلة:**
- عرضة لهجمات Brute Force على تسجيل الدخول
- لا حد لعدد المحاولات

**الحل المطلوب:**
```javascript
// تطبيق rate limiting
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5 // 5 محاولات كحد أقصى
});
```

### 7. عدم التحقق من المدخلات
**المشكلة:**
- عرضة لهجمات XSS
- عرضة لهجمات Injection
- لا يوجد sanitization للبيانات

**الحل المطلوب:**
```javascript
// استخدام مكتبات validation
const { body, validationResult } = require('express-validator');

// تطبيق sanitization
const sanitizeHtml = require('sanitize-html');
```

## 🔐 خطة الأمان للإنتاج

### المرحلة 1: الأساسيات (أولوية عالية)

#### 1.1 تشفير كلمات المرور
```bash
npm install bcrypt
```

```javascript
// عند إنشاء مستخدم
const hashedPassword = await bcrypt.hash(password, 10);

// عند تسجيل الدخول
const isValid = await bcrypt.compare(password, user.password_hash);
```

#### 1.2 قاعدة بيانات آمنة
```sql
-- PostgreSQL Schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'violation_entry', 'inquiry')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### 1.3 Backend API
```javascript
// مثال: Express.js API
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// تطبيق security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'بيانات غير صحيحة' });
    }
    
    // التحقق من المستخدم
    const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'بيانات دخول خاطئة' });
    }
    
    // إنشاء JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});
```

#### 1.4 JWT Tokens
```javascript
const jwt = require('jsonwebtoken');

// إنشاء token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Middleware للتحقق
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'token غير صالح' });
    }
    req.user = user;
    next();
  });
};
```

### المرحلة 2: الحماية المتقدمة

#### 2.1 Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'تم تجاوز عدد المحاولات. حاول لاحقاً'
});

app.post('/api/auth/login', loginLimiter, loginHandler);
```

#### 2.2 CSRF Protection
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);
```

#### 2.3 Input Validation
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/violations',
  authenticateToken,
  [
    body('plateNumber').isLength({ min: 3, max: 20 }).trim().escape(),
    body('violationType').isLength({ min: 1, max: 100 }).trim().escape(),
    body('amount').isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // معالجة الطلب
  }
);
```

#### 2.4 XSS Protection
```javascript
const sanitizeHtml = require('sanitize-html');

function sanitizeInput(input) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
}
```

### المرحلة 3: البنية التحتية

#### 3.1 HTTPS
```bash
# باستخدام Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 3.2 Environment Variables
```bash
# .env file
JWT_SECRET=your-very-long-random-secret-key-here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=traffic_system
DB_USER=dbuser
DB_PASSWORD=strong-db-password
SESSION_SECRET=another-very-long-random-secret
```

#### 3.3 Database Security
```sql
-- إنشاء مستخدم قاعدة بيانات محدود الصلاحيات
CREATE USER app_user WITH PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE traffic_system TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- منع الوصول المباشر للـ superuser
REVOKE ALL ON DATABASE traffic_system FROM PUBLIC;
```

## 📋 Security Checklist

قبل الإطلاق:

- [ ] تشفير جميع كلمات المرور بـ bcrypt
- [ ] استبدال localStorage بقاعدة بيانات
- [ ] بناء Backend API كامل
- [ ] تطبيق HTTPS
- [ ] تطبيق JWT authentication
- [ ] تطبيق Rate limiting
- [ ] تطبيق CSRF protection
- [ ] تطبيق Input validation
- [ ] تطبيق XSS protection
- [ ] تطبيق SQL injection protection
- [ ] إعداد Security headers
- [ ] إعداد CORS بشكل صحيح
- [ ] إعداد Environment variables
- [ ] مراجعة أمان قاعدة البيانات
- [ ] إعداد Logging للعمليات الحساسة
- [ ] إعداد Monitoring للأنشطة المشبوهة
- [ ] إجراء Security audit
- [ ] إجراء Penetration testing

## 🔍 أدوات الفحص الأمني

```bash
# npm audit للفحص
npm audit

# OWASP ZAP
# Burp Suite
# Nmap
# SQLMap
```

## 📚 مراجع

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**تذكير مهم**: لا تنشر النظام في بيئة إنتاج بدون تطبيق جميع الإجراءات الأمنية!

تم التحديث: 2025-11-08
