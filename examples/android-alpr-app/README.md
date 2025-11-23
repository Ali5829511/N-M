# 📱 Android ALPR Application Examples

This directory contains complete example code for integrating the ParkPow Android ALPR library with the Traffic Management System.

## 📂 Structure / الهيكل

```
android-alpr-app/
├── MainActivity.java           # Main application screen / الشاشة الرئيسية
├── CameraActivity.java         # Camera and ALPR screen / شاشة الكاميرا والتعرف
├── ApiService.java             # API interface / واجهة API
├── ApiClient.java              # API client configuration / إعداد عميل API
└── DatabaseHelper.java         # Local database / قاعدة البيانات المحلية
```

## 🚀 Quick Start / البداية السريعة

### 1. Prerequisites / المتطلبات

- Android Studio (latest version)
- Android SDK (API Level 21+)
- ParkPow API Key
- Backend server running

### 2. Setup / الإعداد

#### أ. إنشاء مشروع Android جديد / Create New Android Project

1. Open Android Studio
2. File → New → New Project
3. Select "Empty Activity"
4. Name: "TrafficALPR"
5. Package: "com.traffic.alpr"
6. Language: Java
7. Minimum SDK: API 21 (Android 5.0)

#### ب. إضافة التبعيات / Add Dependencies

في ملف `build.gradle` (Module: app):

```gradle
android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.traffic.alpr"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
    
    buildFeatures {
        viewBinding true
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    // ParkPow ALPR SDK
    implementation 'com.github.parkpow:alpr-anpr-android:1.0.0'
    
    // Networking
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    
    // Location Services
    implementation 'com.google.android.gms:play-services-location:21.0.1'
    
    // Work Manager for background sync
    implementation 'androidx.work:work-runtime:2.8.1'
    
    // Material Design
    implementation 'com.google.android.material:material:1.10.0'
    
    // AndroidX
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}
```

#### ج. إضافة الأذونات / Add Permissions

في ملف `AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.traffic.alpr">
    
    <!-- Camera -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="true" />
    <uses-feature android:name="android.hardware.camera.autofocus" />
    
    <!-- Internet -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Location -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Storage -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.TrafficALPR"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <activity
            android:name=".CameraActivity"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.AppCompat.NoActionBar" />
        
    </application>
</manifest>
```

#### د. نسخ الملفات / Copy Files

1. Copy all `.java` files from this directory to your project:
   - `MainActivity.java` → `app/src/main/java/com/traffic/alpr/`
   - `CameraActivity.java` → `app/src/main/java/com/traffic/alpr/`
   - `ApiService.java` → `app/src/main/java/com/traffic/alpr/api/`
   - `ApiClient.java` → `app/src/main/java/com/traffic/alpr/api/`
   - `DatabaseHelper.java` → `app/src/main/java/com/traffic/alpr/database/`

2. Create model classes in `app/src/main/java/com/traffic/alpr/models/`:
   - `ViolationData.java`
   - `ViolationResponse.java`
   - `PlateInfo.java`
   - (See Models section below)

#### هـ. تكوين API / Configure API

In `ApiClient.java`, update:

```java
private static final String BASE_URL = "https://your-domain.com/";
private static final String API_TOKEN = "your_api_token_here";
```

In `CameraActivity.java`, update:

```java
alprEngine.initialize("YOUR_PARKPOW_API_KEY");
```

## 📦 Model Classes / فئات النماذج

### ViolationData.java

```java
package com.traffic.alpr.models;

import java.util.Date;

public class ViolationData {
    private long id;
    private String plateNumber;
    private String violationType;
    private Date timestamp;
    private double latitude;
    private double longitude;
    private String imagePath;
    private float confidence;
    private String officerName;
    private String deviceId;
    
    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    
    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }
    
    public String getViolationType() { return violationType; }
    public void setViolationType(String violationType) { this.violationType = violationType; }
    
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
    
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    
    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
    
    public float getConfidence() { return confidence; }
    public void setConfidence(float confidence) { this.confidence = confidence; }
    
    public String getOfficerName() { return officerName; }
    public void setOfficerName(String officerName) { this.officerName = officerName; }
    
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
}
```

## 🎨 Layout Files / ملفات التخطيط

### activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:gravity="center">
    
    <TextView
        android:id="@+id/txt_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="نظام المرور - ALPR"
        android:textSize="24sp"
        android:textStyle="bold"
        android:layout_marginBottom="32dp"/>
    
    <Button
        android:id="@+id/btn_start_camera"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="بدء الكاميرا"
        android:padding="16dp"
        android:layout_marginBottom="16dp"/>
    
    <Button
        android:id="@+id/btn_view_violations"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="عرض المخالفات"
        android:padding="16dp"
        android:layout_marginBottom="16dp"/>
    
    <Button
        android:id="@+id/btn_sync_data"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="مزامنة البيانات"
        android:padding="16dp"
        android:layout_marginBottom="32dp"/>
    
    <TextView
        android:id="@+id/txt_pending_count"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="المخالفات المعلقة: 0"
        android:textSize="16sp"
        android:layout_marginBottom="8dp"/>
    
    <TextView
        android:id="@+id/txt_sync_status"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="جاهز للمزامنة"
        android:textSize="14sp"
        android:textColor="#666"/>
</LinearLayout>
```

### activity_camera.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#000000">
    
    <SurfaceView
        android:id="@+id/camera_preview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
    
    <View
        android:id="@+id/plate_frame"
        android:layout_width="300dp"
        android:layout_height="80dp"
        android:layout_centerInParent="true"
        android:background="@drawable/plate_frame"
        android:alpha="0.7" />
    
    <TextView
        android:id="@+id/result_text"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:background="#CC000000"
        android:padding="16dp"
        android:text="قم بتوجيه الكاميرا نحو لوحة السيارة"
        android:textColor="#FFFFFF"
        android:textSize="16sp"
        android:gravity="center" />
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_alignParentBottom="true"
        android:orientation="horizontal"
        android:gravity="center"
        android:padding="20dp">
        
        <Button
            android:id="@+id/flash_button"
            android:layout_width="60dp"
            android:layout_height="60dp"
            android:text="⚡"
            android:textSize="24sp"
            android:layout_marginEnd="40dp"/>
        
        <Button
            android:id="@+id/capture_button"
            android:layout_width="80dp"
            android:layout_height="80dp"
            android:text="📷"
            android:textSize="32sp"
            android:background="@drawable/circle_button"/>
    </LinearLayout>
</RelativeLayout>
```

## 🔧 Build and Run / البناء والتشغيل

### 1. Build the project / بناء المشروع

```bash
./gradlew build
```

### 2. Run on device / تشغيل على الجهاز

```bash
./gradlew installDebug
```

Or press **Run** button in Android Studio (Shift + F10)

## 🧪 Testing / الاختبار

### Test API Connection

```java
ApiService apiService = ApiClient.getApiService();
Call<HealthCheck> call = apiService.checkHealth();
call.enqueue(new Callback<HealthCheck>() {
    @Override
    public void onResponse(Call<HealthCheck> call, Response<HealthCheck> response) {
        if (response.isSuccessful()) {
            Log.d("API", "Server is reachable");
        }
    }
    
    @Override
    public void onFailure(Call<HealthCheck> call, Throwable t) {
        Log.e("API", "Connection failed: " + t.getMessage());
    }
});
```

## 📚 Documentation / التوثيق

For complete integration documentation, see:
- [ANDROID_ALPR_INTEGRATION.md](../ANDROID_ALPR_INTEGRATION.md)
- [ParkPow Android Library](https://github.com/parkpow/alpr-anpr-android)
- [Backend API Documentation](../PARKPOW_README.md)

## 🐛 Troubleshooting / استكشاف الأخطاء

### Issue: Camera not opening
- Check camera permissions in AndroidManifest.xml
- Request runtime permissions in MainActivity

### Issue: ALPR not recognizing plates
- Ensure good lighting conditions
- Check API key validity
- Verify image quality

### Issue: Network errors
- Check internet connection
- Verify API endpoint URL
- Check authentication token

## 📝 License / الترخيص

MIT License - See [LICENSE](../../LICENSE) file

## 🤝 Contributing / المساهمة

Contributions are welcome! Please:
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support / الدعم

- GitHub Issues: [Create an issue](https://github.com/Ali5829511/N-M/issues)
- Email: support@traffic-system.com

---

**Last Updated:** 2024-11-23  
**Version:** 1.0.0
