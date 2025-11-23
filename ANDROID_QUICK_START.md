# 🚀 دليل البدء السريع لتكامل Android ALPR
# Quick Start Guide for Android ALPR Integration

## ⚡ البدء في 5 دقائق / Get Started in 5 Minutes

### الخطوة 1: تحضير الخادم / Step 1: Prepare Server

```bash
# تثبيت التبعيات / Install dependencies
npm install

# إضافة نقاط نهاية Android API / Add Android API endpoints
# تأكد من وجود ملف api/android-api-routes.js
# Ensure api/android-api-routes.js file exists

# تعيين متغيرات البيئة / Set environment variables
export API_TOKEN="your_secure_token_here"

# تشغيل الخادم / Start server
npm start
```

### الخطوة 2: إعداد تطبيق Android / Step 2: Setup Android App

#### أ. إنشاء مشروع جديد / Create New Project

```bash
# في Android Studio
# In Android Studio
File → New → New Project
Select: "Empty Activity"
Name: TrafficALPR
Package: com.traffic.alpr
Language: Java
Min SDK: API 21
```

#### ب. إضافة التبعيات / Add Dependencies

في `build.gradle (Module: app)`:

```gradle
dependencies {
    // ParkPow ALPR
    implementation 'com.github.parkpow:alpr-anpr-android:1.0.0'
    
    // Networking
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    
    // Location
    implementation 'com.google.android.gms:play-services-location:21.0.1'
    
    // WorkManager
    implementation 'androidx.work:work-runtime:2.8.1'
}
```

#### ج. نسخ الملفات / Copy Files

```bash
# انسخ الملفات من examples/android-alpr-app/ إلى مشروعك
# Copy files from examples/android-alpr-app/ to your project

MainActivity.java → app/src/main/java/com/traffic/alpr/
CameraActivity.java → app/src/main/java/com/traffic/alpr/
ApiService.java → app/src/main/java/com/traffic/alpr/api/
ApiClient.java → app/src/main/java/com/traffic/alpr/api/
DatabaseHelper.java → app/src/main/java/com/traffic/alpr/database/
```

### الخطوة 3: التكوين / Step 3: Configuration

#### في ApiClient.java:

```java
// استبدل بعنوان الخادم الحقيقي / Replace with actual server URL
private static final String BASE_URL = "http://your-server.com/";

// استبدل برمز المصادقة / Replace with auth token
private static final String API_TOKEN = "your_secure_token_here";
```

#### في CameraActivity.java:

```java
// استبدل بمفتاح ParkPow API / Replace with ParkPow API key
alprEngine.initialize("YOUR_PARKPOW_API_KEY");
```

### الخطوة 4: البناء والتشغيل / Step 4: Build & Run

```bash
# بناء المشروع / Build project
./gradlew build

# تشغيل على الجهاز / Run on device
./gradlew installDebug
```

أو اضغط **Run** في Android Studio (Shift + F10)

---

## 📱 كيفية الاستخدام / How to Use

### 1. فتح التطبيق / Open App
- افتح تطبيق TrafficALPR على هاتفك
- Open TrafficALPR app on your phone

### 2. التقاط صورة / Capture Image
- اضغط على "بدء الكاميرا" / Tap "Start Camera"
- وجه الكاميرا نحو لوحة السيارة / Point camera at license plate
- اضغط على زر التقاط / Tap capture button

### 3. التعرف التلقائي / Auto Recognition
- سيتم التعرف على اللوحة تلقائياً
- Plate will be recognized automatically
- عرض النتيجة مع نسبة الثقة
- Result shown with confidence score

### 4. الحفظ والمزامنة / Save & Sync
- يتم حفظ المخالفة محلياً
- Violation saved locally
- مزامنة تلقائية مع الخادم
- Auto-sync with server

---

## 🔧 الإعدادات / Settings

### تكوين المزامنة / Sync Configuration

في `MainActivity.java`:

```java
// تغيير فترة المزامنة (بالدقائق) / Change sync period (in minutes)
new PeriodicWorkRequest.Builder(SyncWorker.class, 15, TimeUnit.MINUTES)
```

### تكوين الثقة / Confidence Configuration

في `CameraActivity.java`:

```java
// الحد الأدنى لنسبة الثقة / Minimum confidence threshold
if (confidence > 0.7) {  // 70%
    // حفظ المخالفة / Save violation
}
```

---

## 🧪 اختبار الاتصال / Test Connection

### اختبار API من المتصفح:

```bash
# فحص صحة الخادم / Health check
curl http://localhost:8080/api/health

# يجب أن يرجع / Should return:
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-11-23T12:00:00.000Z",
  "version": "1.5.1"
}
```

### اختبار المصادقة:

```bash
# مع رمز المصادقة / With auth token
curl -H "Authorization: Bearer your_token_here" \
     http://localhost:8080/api/violations
```

---

## 📊 تدفق البيانات / Data Flow

```
1. المستخدم يلتقط صورة / User captures image
   ↓
2. ParkPow ALPR يعالج الصورة / ParkPow ALPR processes image
   ↓
3. استخراج رقم اللوحة / Extract plate number
   ↓
4. حفظ في قاعدة البيانات المحلية / Save to local database
   ↓
5. مزامنة مع الخادم / Sync with server
   ↓
6. عرض في النظام الويب / Display in web system
```

---

## ⚠️ استكشاف الأخطاء الشائعة / Common Issues

### 1. الكاميرا لا تعمل / Camera Not Working

**المشكلة:** الكاميرا لا تفتح
**الحل:**
- تحقق من الأذونات في AndroidManifest.xml
- اطلب الأذونات في وقت التشغيل
- تأكد من أن الجهاز به كاميرا

```java
// طلب إذن الكاميرا / Request camera permission
ActivityCompat.requestPermissions(this,
    new String[]{Manifest.permission.CAMERA},
    CAMERA_PERMISSION_CODE);
```

### 2. فشل التعرف على اللوحة / Recognition Failed

**المشكلة:** لا يتم التعرف على اللوحات
**الحل:**
- تحسين الإضاءة
- التأكد من وضوح الصورة
- التحقق من صحة مفتاح API
- التأكد من ظهور اللوحة بالكامل

### 3. خطأ في الاتصال / Connection Error

**المشكلة:** فشل الاتصال بالخادم
**الحل:**
- تحقق من عنوان الخادم في ApiClient.java
- تأكد من تشغيل الخادم
- تحقق من الاتصال بالإنترنت
- تأكد من صحة رمز المصادقة

```java
// تمكين تسجيل الأخطاء / Enable error logging
HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
logging.setLevel(HttpLoggingInterceptor.Level.BODY);
```

### 4. فشل المزامنة / Sync Failed

**المشكلة:** لا تتم مزامنة البيانات
**الحل:**
- تحقق من الاتصال بالإنترنت
- تحقق من صلاحية الرمز
- راجع سجلات الخادم
- تحقق من حالة WorkManager

```java
// التحقق من حالة المزامنة / Check sync status
WorkManager.getInstance(context)
    .getWorkInfosForUniqueWork("violation_sync")
    .get();
```

---

## 📖 موارد إضافية / Additional Resources

### الوثائق:
- 📘 [دليل التكامل الكامل](ANDROID_ALPR_INTEGRATION.md)
- 📗 [أمثلة الكود](examples/android-alpr-app/README.md)
- 📕 [ParkPow Android Library](https://github.com/parkpow/alpr-anpr-android)
- 📙 [API Documentation](api/android-api-routes.js)

### الدعم:
- 💬 GitHub Issues
- 📧 Email Support
- 📚 Wiki Pages

---

## ✅ قائمة التحقق / Checklist

قبل البدء، تأكد من:

- [ ] تثبيت Android Studio
- [ ] إنشاء حساب ParkPow والحصول على API key
- [ ] إعداد الخادم وتشغيله
- [ ] إعداد رمز المصادقة
- [ ] تكوين عنوان الخادم
- [ ] إضافة الأذونات في AndroidManifest.xml
- [ ] نسخ جميع الملفات المطلوبة
- [ ] اختبار الاتصال بالخادم

---

## 🎉 جاهز للانطلاق! / Ready to Go!

الآن لديك كل ما تحتاجه للبدء!

Now you have everything you need to get started!

### الخطوات التالية / Next Steps:
1. ✅ بناء التطبيق / Build the app
2. ✅ تجربة التقاط الصور / Test image capture
3. ✅ التحقق من التعرف على اللوحات / Verify plate recognition
4. ✅ اختبار المزامنة / Test synchronization
5. ✅ البدء في الاستخدام الفعلي / Start actual usage

---

**آخر تحديث / Last Updated:** 2024-11-23  
**الإصدار / Version:** 1.0.0
