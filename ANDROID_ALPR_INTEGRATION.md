# 📱 تكامل Android ALPR - Android ALPR Integration

## 🎯 نظرة عامة / Overview

هذا المستند يشرح كيفية تكامل تطبيق Android للتعرف على لوحات السيارات مع نظام إدارة المرور الحالي.

This document explains how to integrate an Android License Plate Recognition app with the current Traffic Management System.

---

## 🔗 مستودع Android ALPR

**Repository:** [parkpow/alpr-anpr-android](https://github.com/parkpow/alpr-anpr-android)

مكتبة Android قوية للتعرف التلقائي على لوحات السيارات (ALPR/ANPR) توفر:
- التعرف على اللوحات في الوقت الفعلي
- معالجة الصور
- دعم متعدد البلدان
- أداء عالي وسريع

A powerful Android library for Automatic License Plate Recognition (ALPR/ANPR) that provides:
- Real-time plate recognition
- Image processing
- Multi-country support
- High performance and fast processing

---

## 🏗️ معمارية النظام / System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     النظام المتكامل                          │
│                   Integrated System                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────┬──────────────────┐
                              │                 │                  │
                              ▼                 ▼                  ▼
                   ┌──────────────────┐ ┌─────────────┐ ┌──────────────────┐
                   │   Web Frontend   │ │  API Server │ │  Android App     │
                   │   واجهة الويب    │ │  خادم API   │ │  تطبيق أندرويد   │
                   └──────────────────┘ └─────────────┘ └──────────────────┘
                            │                  │                  │
                            │                  │                  │
                            └──────────┬───────┴──────────────────┘
                                       │
                                       ▼
                           ┌─────────────────────┐
                           │  PostgreSQL/SQLite  │
                           │  قاعدة البيانات     │
                           └─────────────────────┘
```

---

## 📲 تدفق عمل التطبيق / Application Workflow

### 1. التقاط الصورة / Image Capture
```
Android App → Camera → Capture Image → ALPR Processing
```

### 2. التعرف على اللوحة / Plate Recognition
```
Image → ParkPow ALPR SDK → Extract Plate Number → Validate Format
```

### 3. إرسال البيانات / Data Submission
```
Plate Data → API Request → Backend Server → Database Storage
```

### 4. الاستجابة / Response
```
Database → Server Response → Android App → Display Result
```

---

## 🔌 نقاط النهاية API / API Endpoints

### 1. إرسال مخالفة جديدة / Submit New Violation

**Endpoint:** `POST /api/violations`

**Request Body:**
```json
{
  "plate_number": "ABC-1234",
  "plate_type": "saudi",
  "violation_type": "unauthorized_parking",
  "location": {
    "latitude": 24.7136,
    "longitude": 46.6753,
    "address": "الرياض، المملكة العربية السعودية"
  },
  "timestamp": "2024-11-23T12:00:00Z",
  "image_url": "https://example.com/image.jpg",
  "officer_name": "محمد أحمد",
  "device_id": "android-device-12345",
  "confidence_score": 0.95
}
```

**Response:**
```json
{
  "success": true,
  "violation_id": "V-2024-001234",
  "message": "تم تسجيل المخالفة بنجاح",
  "fine_amount": 500,
  "status": "pending"
}
```

---

### 2. التحقق من لوحة السيارة / Verify Plate Number

**Endpoint:** `GET /api/plates/{plate_number}`

**Response:**
```json
{
  "plate_number": "ABC-1234",
  "is_authorized": false,
  "vehicle_info": {
    "owner_name": "محمد أحمد",
    "owner_phone": "05XXXXXXXX",
    "building_number": "12",
    "apartment_number": "301"
  },
  "previous_violations": 3,
  "total_fines": 1500,
  "status": "active"
}
```

---

### 3. الحصول على المخالفات / Get Violations

**Endpoint:** `GET /api/violations?plate={plate_number}`

**Response:**
```json
{
  "total": 3,
  "violations": [
    {
      "violation_id": "V-2024-001234",
      "date": "2024-11-23",
      "type": "unauthorized_parking",
      "fine_amount": 500,
      "status": "pending",
      "location": "موقف خاص - مبنى رقم 12"
    }
  ]
}
```

---

### 4. مزامنة البيانات / Data Sync

**Endpoint:** `POST /api/sync`

**Request Body:**
```json
{
  "device_id": "android-device-12345",
  "last_sync": "2024-11-23T10:00:00Z",
  "pending_violations": [
    {
      "local_id": "local-001",
      "plate_number": "ABC-1234",
      "timestamp": "2024-11-23T11:30:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "synced_count": 1,
  "failed_count": 0,
  "next_sync": "2024-11-23T14:00:00Z"
}
```

---

## 🔐 المصادقة والأمان / Authentication & Security

### رمز المصادقة / Authentication Token

جميع طلبات API تتطلب رمز مصادقة في الرأس:

All API requests require an authentication token in the header:

```http
Authorization: Bearer YOUR_API_TOKEN_HERE
Content-Type: application/json
```

### مثال في Android / Android Example

```java
// في ملف ApiClient.java
public class ApiClient {
    private static final String BASE_URL = "https://your-domain.com/api/";
    private static final String API_TOKEN = "your_secure_token_here";
    
    public static OkHttpClient getClient() {
        return new OkHttpClient.Builder()
            .addInterceptor(chain -> {
                Request original = chain.request();
                Request request = original.newBuilder()
                    .header("Authorization", "Bearer " + API_TOKEN)
                    .header("Content-Type", "application/json")
                    .method(original.method(), original.body())
                    .build();
                return chain.proceed(request);
            })
            .build();
    }
}
```

---

## 📱 دمج مكتبة Android ALPR / Integrating Android ALPR Library

### الخطوة 1: إضافة المكتبة / Step 1: Add Library

في ملف `build.gradle` (app level):

```gradle
dependencies {
    // ParkPow ALPR SDK
    implementation 'com.github.parkpow:alpr-anpr-android:1.0.0'
    
    // مكتبات إضافية مطلوبة
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:okhttp:4.10.0'
}
```

### الخطوة 2: الأذونات / Step 2: Permissions

في ملف `AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- أذونات الكاميرا -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" />
    <uses-feature android:name="android.hardware.camera.autofocus" />
    
    <!-- أذونات الإنترنت -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- أذونات الموقع -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- أذونات التخزين -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    
</manifest>
```

### الخطوة 3: تهيئة ALPR / Step 3: Initialize ALPR

```java
// في MainActivity.java
import com.parkpow.alpr.AlprEngine;
import com.parkpow.alpr.AlprResult;

public class MainActivity extends AppCompatActivity {
    
    private AlprEngine alprEngine;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // تهيئة محرك ALPR
        alprEngine = new AlprEngine(this);
        alprEngine.initialize("YOUR_PARKPOW_API_KEY");
        
        // إعداد الكاميرا
        setupCamera();
    }
    
    private void processImage(Bitmap image) {
        // معالجة الصورة والتعرف على اللوحة
        AlprResult result = alprEngine.recognize(image);
        
        if (result.isSuccess()) {
            String plateNumber = result.getPlateNumber();
            float confidence = result.getConfidence();
            
            // إرسال البيانات إلى الخادم
            sendViolationToServer(plateNumber, confidence);
        }
    }
    
    private void sendViolationToServer(String plateNumber, float confidence) {
        // استخدام Retrofit لإرسال البيانات
        ViolationData violation = new ViolationData();
        violation.setPlateNumber(plateNumber);
        violation.setConfidence(confidence);
        violation.setTimestamp(new Date());
        
        apiService.submitViolation(violation).enqueue(new Callback<Response>() {
            @Override
            public void onResponse(Call<Response> call, retrofit2.Response<Response> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(MainActivity.this, 
                        "تم تسجيل المخالفة بنجاح", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<Response> call, Throwable t) {
                Toast.makeText(MainActivity.this, 
                    "خطأ في الاتصال", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
```

---

## 🎨 واجهة المستخدم / User Interface

### شاشة التقاط الصورة / Camera Capture Screen

```xml
<!-- في layout/activity_camera.xml -->
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    
    <!-- معاينة الكاميرا -->
    <SurfaceView
        android:id="@+id/camera_preview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
    
    <!-- إطار اللوحة -->
    <View
        android:id="@+id/plate_frame"
        android:layout_width="300dp"
        android:layout_height="80dp"
        android:layout_centerInParent="true"
        android:background="@drawable/plate_frame"
        android:alpha="0.7" />
    
    <!-- زر التقاط الصورة -->
    <Button
        android:id="@+id/capture_button"
        android:layout_width="80dp"
        android:layout_height="80dp"
        android:layout_alignParentBottom="true"
        android:layout_centerHorizontal="true"
        android:layout_marginBottom="30dp"
        android:background="@drawable/ic_camera"
        android:text="التقط" />
    
    <!-- نتيجة المسح -->
    <TextView
        android:id="@+id/result_text"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:background="#CC000000"
        android:padding="16dp"
        android:text="قم بتوجيه الكاميرا نحو لوحة السيارة"
        android:textColor="#FFFFFF"
        android:textSize="16sp" />
    
</RelativeLayout>
```

---

## 📊 تخزين البيانات المحلية / Local Data Storage

### قاعدة بيانات SQLite المحلية / Local SQLite Database

```java
// في DatabaseHelper.java
public class DatabaseHelper extends SQLiteOpenHelper {
    
    private static final String DATABASE_NAME = "violations.db";
    private static final int DATABASE_VERSION = 1;
    
    // جدول المخالفات المؤقتة
    private static final String CREATE_VIOLATIONS_TABLE = 
        "CREATE TABLE pending_violations (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "plate_number TEXT NOT NULL, " +
        "violation_type TEXT NOT NULL, " +
        "timestamp TEXT NOT NULL, " +
        "latitude REAL, " +
        "longitude REAL, " +
        "image_path TEXT, " +
        "confidence REAL, " +
        "synced INTEGER DEFAULT 0" +
        ")";
    
    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(CREATE_VIOLATIONS_TABLE);
    }
    
    // حفظ المخالفة محلياً
    public long savePendingViolation(ViolationData violation) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put("plate_number", violation.getPlateNumber());
        values.put("violation_type", violation.getViolationType());
        values.put("timestamp", violation.getTimestamp());
        values.put("synced", 0);
        
        return db.insert("pending_violations", null, values);
    }
    
    // الحصول على المخالفات غير المزامنة
    public List<ViolationData> getPendingViolations() {
        List<ViolationData> violations = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        
        Cursor cursor = db.query("pending_violations", 
            null, "synced = ?", new String[]{"0"}, 
            null, null, "timestamp ASC");
        
        while (cursor.moveToNext()) {
            ViolationData violation = new ViolationData();
            violation.setId(cursor.getLong(0));
            violation.setPlateNumber(cursor.getString(1));
            violation.setViolationType(cursor.getString(2));
            violations.add(violation);
        }
        cursor.close();
        
        return violations;
    }
}
```

---

## 🔄 مزامنة البيانات / Data Synchronization

### خدمة المزامنة التلقائية / Auto-Sync Service

```java
// في SyncService.java
public class SyncService extends IntentService {
    
    public SyncService() {
        super("SyncService");
    }
    
    @Override
    protected void onHandleIntent(Intent intent) {
        // الحصول على المخالفات غير المزامنة
        DatabaseHelper dbHelper = new DatabaseHelper(this);
        List<ViolationData> pendingViolations = dbHelper.getPendingViolations();
        
        if (pendingViolations.isEmpty()) {
            return;
        }
        
        // إرسال كل مخالفة إلى الخادم
        for (ViolationData violation : pendingViolations) {
            try {
                Response response = apiService.submitViolation(violation).execute();
                
                if (response.isSuccessful()) {
                    // تحديث حالة المزامنة في قاعدة البيانات
                    dbHelper.markAsSynced(violation.getId());
                }
            } catch (IOException e) {
                Log.e("SyncService", "Error syncing violation: " + e.getMessage());
            }
        }
    }
}
```

### جدولة المزامنة / Sync Scheduling

```java
// في MainActivity.java
private void scheduleSyncService() {
    // مزامنة كل 15 دقيقة
    WorkManager workManager = WorkManager.getInstance(this);
    PeriodicWorkRequest syncRequest = 
        new PeriodicWorkRequest.Builder(SyncWorker.class, 15, TimeUnit.MINUTES)
            .setConstraints(new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build())
            .build();
    
    workManager.enqueueUniquePeriodicWork(
        "violation_sync",
        ExistingPeriodicWorkPolicy.KEEP,
        syncRequest
    );
}
```

---

## 🧪 اختبار التكامل / Integration Testing

### اختبار الاتصال بالـ API / API Connection Test

```java
@Test
public void testApiConnection() {
    ApiService apiService = ApiClient.getService();
    
    try {
        Response<HealthCheck> response = apiService.checkHealth().execute();
        assertTrue("API should be reachable", response.isSuccessful());
        assertEquals(200, response.code());
    } catch (IOException e) {
        fail("Failed to connect to API: " + e.getMessage());
    }
}
```

### اختبار إرسال المخالفة / Violation Submission Test

```java
@Test
public void testViolationSubmission() {
    ViolationData testViolation = new ViolationData();
    testViolation.setPlateNumber("ABC-1234");
    testViolation.setViolationType("unauthorized_parking");
    testViolation.setTimestamp(new Date());
    
    try {
        Response<ViolationResponse> response = 
            apiService.submitViolation(testViolation).execute();
        
        assertTrue("Violation should be submitted successfully", 
            response.isSuccessful());
        assertNotNull("Response body should not be null", 
            response.body());
    } catch (IOException e) {
        fail("Failed to submit violation: " + e.getMessage());
    }
}
```

---

## 📖 أمثلة كاملة / Complete Examples

### مثال: تطبيق كامل للتعرف على اللوحات / Full Plate Recognition App Example

يمكنك العثور على مثال كامل لتطبيق Android في المجلد:
```
/examples/android-alpr-app/
```

### الملفات المضمنة / Included Files:
1. **MainActivity.java** - الشاشة الرئيسية
2. **CameraActivity.java** - شاشة الكاميرا
3. **ViolationActivity.java** - شاشة تفاصيل المخالفة
4. **ApiService.java** - خدمة الـ API
5. **DatabaseHelper.java** - قاعدة البيانات المحلية

---

## 🔧 استكشاف الأخطاء / Troubleshooting

### مشكلة: فشل التعرف على اللوحة / Issue: Plate Recognition Failed

**الحل / Solution:**
1. تأكد من جودة الإضاءة
2. تأكد من وضوح الصورة
3. تأكد من أن اللوحة ظاهرة بالكامل
4. تحقق من مفتاح API

### مشكلة: فشل إرسال البيانات / Issue: Data Submission Failed

**الحل / Solution:**
1. تحقق من الاتصال بالإنترنت
2. تحقق من صلاحية رمز المصادقة
3. تحقق من صحة البيانات المرسلة
4. راجع سجلات الخادم

### مشكلة: بطء التطبيق / Issue: Slow Performance

**الحل / Solution:**
1. قم بتحسين حجم الصورة قبل المعالجة
2. استخدم معالجة غير متزامنة
3. قم بتخزين البيانات مؤقتاً
4. قلل من عدد استدعاءات API

---

## 📞 الدعم والمساعدة / Support

### الوثائق / Documentation
- [دليل ParkPow API](https://docs.parkpow.com)
- [مكتبة Android ALPR](https://github.com/parkpow/alpr-anpr-android)
- [دليل المطور](PARKPOW_README.md)

### التواصل / Contact
- **البريد الإلكتروني / Email:** support@parkpow.com
- **GitHub Issues:** [إنشاء مشكلة جديدة](https://github.com/Ali5829511/N-M/issues)

---

## 📝 الترخيص / License

هذا المشروع مرخص بموجب MIT License - راجع ملف [LICENSE](LICENSE) للتفاصيل.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 الخلاصة / Summary

الآن لديك تكامل كامل بين تطبيق Android والنظام الحالي!

You now have a complete integration between the Android app and the current system!

### الميزات المتاحة / Available Features:
✅ التعرف على اللوحات في الوقت الفعلي
✅ تسجيل المخالفات تلقائياً
✅ مزامنة البيانات مع الخادم
✅ التخزين المحلي للبيانات
✅ واجهة مستخدم سهلة الاستخدام
✅ دعم اللغة العربية والإنجليزية

### الخطوات التالية / Next Steps:
1. قم بتثبيت Android Studio
2. استنساخ المستودع
3. إضافة مفتاح API الخاص بك
4. بناء التطبيق وتشغيله
5. البدء في التعرف على اللوحات!

---

**آخر تحديث / Last Updated:** 2024-11-23
**الإصدار / Version:** 1.0.0
