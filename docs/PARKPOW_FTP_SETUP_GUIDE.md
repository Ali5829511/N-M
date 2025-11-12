# 🚗 دليل إعداد نظام التعرف على اللوحات
# Plate Recognition System Setup Guide

**التحديث:** 2025-11-12  
**الإصدار:** 1.3.0  
**الحالة:** ✅ جاهز للاستخدام

---

## 📋 نظرة عامة - Overview

هذا الدليل يشرح كيفية إعداد نظام التعرف التلقائي على لوحات السيارات باستخدام ParkPow و Plate Recognizer.

This guide explains how to set up the Automatic License Plate Recognition (ALPR) system using ParkPow and Plate Recognizer.

---

## 🔑 بيانات الاعتماد - Credentials

### ParkPow API

**API Token:**
```
7c13be422713a758a42a0bc453cf3331fbf4d346
```

**API Base URL:**
```
https://app.parkpow.com/api/v1
```

**Webhook Receiver URL:**
```
https://app.parkpow.com/api/v1/webhook-receiver/
```

### Plate Recognizer FTP

**Host:**
```
ftp.platerecognizer.com
```

**Ports:**
- Standard FTP: `21`
- FTPS (Secure): `2121`
- SFTP: `2022`

**Username:**
```
aliayashi522
```

**Password:**
```
708c4bbfdde0
```

---

## ⚙️ إعداد ملف .env

قم بإنشاء ملف `.env` في المجلد الرئيسي:

```env
# ParkPow API Configuration
PARKPOW_API_TOKEN=7c13be422713a758a42a0bc453cf3331fbf4d346
PARKPOW_API_URL=https://app.parkpow.com/api/v1
PARKPOW_WEBHOOK_URL=https://app.parkpow.com/api/v1/webhook-receiver/

# Plate Recognizer FTP Configuration
FTP_HOST=ftp.platerecognizer.com
FTP_PORT=21
FTP_PORT_FTPS=2121
FTP_PORT_SFTP=2022
FTP_USERNAME=aliayashi522
FTP_PASSWORD=708c4bbfdde0
```

---

## 🚀 استخدام ParkPow API

### 1. التحقق من الاتصال

**من المتصفح:**
```
http://localhost:8080/api/parkpow/status
```

**من JavaScript:**
```javascript
async function checkParkPowConnection() {
    const response = await fetch('/api/parkpow/status');
    const data = await response.json();
    
    if (data.success && data.connected) {
        console.log('✅ متصل بـ ParkPow');
    } else {
        console.error('❌ فشل الاتصال');
    }
}
```

### 2. التعرف على اللوحات من صورة

**POST Request:**
```javascript
async function recognizePlate(imageFile) {
    const formData = new FormData();
    formData.append('upload', imageFile);
    formData.append('regions', 'sa'); // السعودية
    
    const response = await fetch('/api/parkpow/recognize', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    
    if (result.success && result.results.length > 0) {
        const plate = result.results[0];
        console.log('رقم اللوحة:', plate.plate);
        console.log('الثقة:', plate.score);
    }
}
```

### 3. استخدام Webhook

**تكوين Webhook:**
```javascript
// في server.js
app.post('/webhook/parkpow', async (req, res) => {
    const data = req.body;
    
    console.log('تم استلام webhook من ParkPow');
    console.log('رقم اللوحة:', data.plate);
    
    // معالجة البيانات وحفظها
    await saveViolation({
        plateNumber: data.plate,
        confidence: data.score,
        timestamp: data.timestamp,
        image: data.image_url
    });
    
    res.json({ success: true });
});
```

**تفعيل Webhook في ParkPow:**
1. اذهب إلى Dashboard
2. Settings → Webhooks
3. أضف URL: `https://your-domain.com/webhook/parkpow`

---

## 📤 استخدام FTP للتعرف على اللوحات

### 1. رفع صورة عبر FTP

**باستخدام Node.js:**
```javascript
const ftp = require('basic-ftp');
const fs = require('fs');

async function uploadImageToFTP(imagePath) {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    
    try {
        // الاتصال
        await client.access({
            host: 'ftp.platerecognizer.com',
            port: 21,
            user: 'aliayashi522',
            password: '708c4bbfdde0',
            secure: false
        });
        
        console.log('✅ متصل بـ FTP');
        
        // رفع الصورة
        await client.uploadFrom(imagePath, '/incoming/' + path.basename(imagePath));
        
        console.log('✅ تم رفع الصورة');
        
    } catch (err) {
        console.error('❌ خطأ:', err);
    } finally {
        client.close();
    }
}
```

### 2. تحميل النتائج من FTP

```javascript
async function downloadResults() {
    const client = new ftp.Client();
    
    try {
        await client.access({
            host: 'ftp.platerecognizer.com',
            port: 21,
            user: 'aliayashi522',
            password: '708c4bbfdde0'
        });
        
        // قائمة الملفات
        const list = await client.list('/processed');
        
        // تحميل ملف النتائج
        for (const file of list) {
            if (file.name.endsWith('.json')) {
                await client.downloadTo(
                    `./results/${file.name}`,
                    `/processed/${file.name}`
                );
                
                // قراءة النتائج
                const results = JSON.parse(
                    fs.readFileSync(`./results/${file.name}`, 'utf8')
                );
                
                console.log('النتائج:', results);
            }
        }
        
    } catch (err) {
        console.error('❌ خطأ:', err);
    } finally {
        client.close();
    }
}
```

### 3. استخدام FTPS (آمن)

```javascript
async function uploadSecure(imagePath) {
    const client = new ftp.Client();
    
    await client.access({
        host: 'ftp.platerecognizer.com',
        port: 2121, // FTPS port
        user: 'aliayashi522',
        password: '708c4bbfdde0',
        secure: true, // تفعيل SSL/TLS
        secureOptions: {
            rejectUnauthorized: false
        }
    });
    
    await client.uploadFrom(imagePath, '/incoming/' + path.basename(imagePath));
    client.close();
}
```

---

## 🔄 سير العمل الكامل - Complete Workflow

### سيناريو 1: معالجة صورة مباشرة

```javascript
async function processPlateImage(imageFile) {
    // 1. رفع الصورة إلى ParkPow
    const formData = new FormData();
    formData.append('upload', imageFile);
    formData.append('regions', 'sa');
    
    const response = await fetch('/api/parkpow/recognize', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
        // 2. حفظ النتائج في قاعدة البيانات
        for (const plate of result.results) {
            await db.addOrUpdateVehicle({
                plateNumber: plate.plate,
                vehicleType: plate.vehicle?.type || 'غير محدد',
                lastDetectionDate: new Date().toISOString(),
                confidence: plate.score
            });
            
            // 3. إنشاء مخالفة إذا لزم الأمر
            await db.addViolation({
                plateNumber: plate.plate,
                violationType: 'توقف غير قانوني',
                date: new Date().toISOString(),
                location: 'كاميرا الموقف 1',
                confidence: plate.score,
                imageUrl: plate.image_url
            });
        }
        
        console.log('✅ تم معالجة الصورة بنجاح');
    }
}
```

### سيناريو 2: معالجة دفعية عبر FTP

```javascript
async function batchProcessImages(imagesFolder) {
    const client = new ftp.Client();
    
    try {
        // 1. الاتصال بـ FTP
        await client.access({
            host: 'ftp.platerecognizer.com',
            port: 21,
            user: 'aliayashi522',
            password: '708c4bbfdde0'
        });
        
        // 2. رفع جميع الصور
        const files = fs.readdirSync(imagesFolder);
        for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png)$/i)) {
                await client.uploadFrom(
                    path.join(imagesFolder, file),
                    `/incoming/${file}`
                );
                console.log(`✅ تم رفع: ${file}`);
            }
        }
        
        // 3. الانتظار لمعالجة الصور (حسب الحاجة)
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 ثانية
        
        // 4. تحميل النتائج
        const results = await client.list('/processed');
        for (const result of results) {
            if (result.name.endsWith('.json')) {
                await client.downloadTo(
                    `./results/${result.name}`,
                    `/processed/${result.name}`
                );
                
                // 5. معالجة النتائج
                const data = JSON.parse(
                    fs.readFileSync(`./results/${result.name}`, 'utf8')
                );
                
                await processRecognitionResults(data);
            }
        }
        
    } finally {
        client.close();
    }
}
```

---

## 📊 تكامل مع لوحة التحليلات

### تحديث البيانات تلقائياً

```javascript
// في advanced_analytics_dashboard.html
async function syncPlateRecognitionData() {
    // 1. جلب آخر النتائج من ParkPow
    const response = await fetch('/api/parkpow/recent-detections');
    const detections = await response.json();
    
    // 2. تحديث قاعدة بيانات السيارات
    for (const detection of detections) {
        await db.addOrUpdateVehicle({
            plateNumber: detection.plate,
            vehicleType: detection.vehicle_type,
            lastDetectionDate: detection.timestamp,
            detectionSource: 'ParkPow'
        });
    }
    
    // 3. حساب الإحصائيات
    await db.calculateVehicleViolations();
    
    // 4. تحديث العرض
    loadAnalytics();
}

// تحديث كل دقيقة
setInterval(syncPlateRecognitionData, 60000);
```

---

## 🔐 الأمان - Security

### ⚠️ تحذيرات مهمة:

1. **لا تشارك بيانات الاعتماد علناً**
   - ❌ لا تضعها في الكود المصدري
   - ❌ لا تشاركها على GitHub
   - ✅ استخدم `.env` دائماً

2. **حماية FTP**
   - ✅ استخدم FTPS (port 2121) أو SFTP (port 2022)
   - ✅ غيّر كلمة المرور بشكل دوري
   - ✅ راقب نشاط FTP

3. **حماية API Token**
   - ✅ استخدم HTTPS فقط
   - ✅ لا تكشف التوكن في Logs
   - ✅ استخدم توكنات مختلفة لكل بيئة

### التحقق من الأمان:

```javascript
// التحقق من اتصال آمن
if (window.location.protocol !== 'https:' && 
    window.location.hostname !== 'localhost') {
    console.warn('⚠️ يجب استخدام HTTPS للأمان');
}

// عدم كشف البيانات الحساسة
function logSecure(message, data) {
    const safeData = { ...data };
    delete safeData.password;
    delete safeData.token;
    delete safeData.apiKey;
    console.log(message, safeData);
}
```

---

## 🧪 اختبار النظام

### 1. اختبار ParkPow API

```bash
# من سطر الأوامر
curl -X GET "http://localhost:8080/api/parkpow/status" \
  -H "Content-Type: application/json"
```

**النتيجة المتوقعة:**
```json
{
    "success": true,
    "configured": true,
    "connected": true,
    "message": "متصل بـ ParkPow API"
}
```

### 2. اختبار FTP

```bash
# اختبار الاتصال
ftp ftp.platerecognizer.com 21
# Username: aliayashi522
# Password: 708c4bbfdde0

# الأوامر:
ls          # قائمة الملفات
pwd         # المجلد الحالي
cd incoming # الانتقال للمجلد
quit        # الخروج
```

### 3. اختبار التعرف على اللوحات

```javascript
// test-plate-recognition.js
const fs = require('fs');

async function testPlateRecognition() {
    // استخدام صورة تجريبية
    const imageBuffer = fs.readFileSync('./test-images/car-plate.jpg');
    const blob = new Blob([imageBuffer]);
    
    const formData = new FormData();
    formData.append('upload', blob, 'test.jpg');
    formData.append('regions', 'sa');
    
    const response = await fetch('http://localhost:8080/api/parkpow/recognize', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    console.log('نتيجة الاختبار:', result);
}

testPlateRecognition();
```

---

## 📝 أمثلة الاستخدام

### مثال 1: كاميرا مراقبة تلقائية

```javascript
// يتم تشغيله عند التقاط صورة من الكاميرا
async function onCameraCapture(imageData) {
    // 1. إرسال للتعرف
    const result = await recognizePlate(imageData);
    
    if (result.success) {
        // 2. التحقق من قاعدة البيانات
        const vehicle = await db.getVehicleByPlateNumber(result.plate);
        
        if (vehicle) {
            // 3. إنشاء تنبيه إذا كانت سيارة مخالفة
            if (vehicle.violationsCount >= 3) {
                await sendAlert({
                    type: 'warning',
                    message: `سيارة مخالفة: ${result.plate}`,
                    violations: vehicle.violationsCount
                });
            }
        } else {
            // 4. إضافة سيارة جديدة
            await db.addOrUpdateVehicle({
                plateNumber: result.plate,
                firstDetection: new Date().toISOString()
            });
        }
    }
}
```

### مثال 2: تقرير يومي

```javascript
async function generateDailyReport() {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. جلب جميع الكشوفات اليوم
    const detections = await db.getDetectionsByDate(today);
    
    // 2. تحليل البيانات
    const stats = {
        totalDetections: detections.length,
        uniquePlates: new Set(detections.map(d => d.plate)).size,
        topViolators: await db.getRepeatedOffenders(2)
    };
    
    // 3. إرسال التقرير
    await sendDailyReport(stats);
}

// تشغيل يومياً في منتصف الليل
schedule.scheduleJob('0 0 * * *', generateDailyReport);
```

---

## 🛠️ استكشاف الأخطاء

### خطأ: "Connection refused" مع FTP

**الحلول:**
1. تحقق من Port (21 للـ FTP العادي)
2. جرب FTPS (port 2121)
3. تحقق من Firewall
4. تحقق من صحة Username/Password

### خطأ: "Invalid API token"

**الحلول:**
1. تحقق من التوكن في `.env`
2. تأكد من عدم وجود مسافات
3. أعد تشغيل الخادم
4. اطلب توكن جديد

### خطأ: "No plates detected"

**الأسباب المحتملة:**
1. جودة الصورة منخفضة
2. زاوية اللوحة غير واضحة
3. اللوحة مغطاة أو متسخة
4. الإضاءة غير مناسبة

**الحلول:**
1. استخدم صور عالية الدقة (min 720p)
2. تأكد من وضوح اللوحة
3. حسّن الإضاءة
4. جرب regions مختلفة

---

## 📚 موارد إضافية

### الوثائق الرسمية:
- [ParkPow API Docs](https://app.parkpow.com/api/docs)
- [Plate Recognizer Docs](https://docs.platerecognizer.com/)

### مكتبات مفيدة:
```bash
npm install basic-ftp      # FTP client
npm install dotenv         # Environment variables
npm install form-data      # Form data handling
npm install node-schedule  # Job scheduling
```

---

## ✅ قائمة التحقق النهائية

قبل البدء:

- [x] تم إنشاء ملف `.env`
- [x] تم إضافة ParkPow Token
- [x] تم إضافة FTP Credentials
- [x] `.env` في `.gitignore`
- [x] تم اختبار الاتصال بـ ParkPow
- [x] تم اختبار الاتصال بـ FTP
- [x] تم اختبار التعرف على اللوحات
- [x] تم تكوين Webhooks (إذا لزم)

---

**آخر تحديث:** 2025-11-12  
**الإصدار:** 1.3.0  
**الحالة:** ✅ جاهز للاستخدام

---

© 2025 - نظام إدارة المرور  
جامعة الإمام محمد بن سعود الإسلامية
