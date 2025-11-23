package com.traffic.alpr;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.hardware.Camera;
import android.location.Location;
import android.os.Bundle;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.parkpow.alpr.AlprEngine;
import com.parkpow.alpr.AlprResult;
import com.traffic.alpr.database.DatabaseHelper;
import com.traffic.alpr.models.ViolationData;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Date;

/**
 * CameraActivity - نشاط الكاميرا والتعرف على اللوحات
 * Camera and plate recognition activity
 * 
 * Features:
 * - Real-time camera preview
 * - Capture and process images
 * - ALPR integration with ParkPow
 * - Save violations locally
 */
@SuppressWarnings("deprecation")
public class CameraActivity extends AppCompatActivity implements SurfaceHolder.Callback {
    
    private Camera camera;
    private SurfaceView surfaceView;
    private SurfaceHolder surfaceHolder;
    private Button btnCapture;
    private Button btnFlash;
    private TextView txtResult;
    private View plateFrame;
    
    private AlprEngine alprEngine;
    private DatabaseHelper databaseHelper;
    private FusedLocationProviderClient fusedLocationClient;
    
    private boolean isFlashOn = false;
    private boolean isProcessing = false;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);
        
        // تهيئة المكونات
        initializeComponents();
        
        // إعداد الكاميرا
        setupCamera();
        
        // تهيئة محرك ALPR
        initializeAlprEngine();
    }
    
    /**
     * تهيئة مكونات الواجهة
     */
    private void initializeComponents() {
        surfaceView = findViewById(R.id.camera_preview);
        btnCapture = findViewById(R.id.capture_button);
        btnFlash = findViewById(R.id.flash_button);
        txtResult = findViewById(R.id.result_text);
        plateFrame = findViewById(R.id.plate_frame);
        
        databaseHelper = new DatabaseHelper(this);
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        
        // تعيين الأحداث
        btnCapture.setOnClickListener(v -> captureImage());
        btnFlash.setOnClickListener(v -> toggleFlash());
    }
    
    /**
     * إعداد الكاميرا
     */
    private void setupCamera() {
        surfaceHolder = surfaceView.getHolder();
        surfaceHolder.addCallback(this);
        surfaceHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
    }
    
    /**
     * تهيئة محرك ALPR من ParkPow
     */
    private void initializeAlprEngine() {
        try {
            alprEngine = new AlprEngine(this);
            // استبدل YOUR_PARKPOW_API_KEY بمفتاح API الخاص بك
            alprEngine.initialize("YOUR_PARKPOW_API_KEY");
            txtResult.setText("محرك ALPR جاهز - قم بتوجيه الكاميرا نحو لوحة السيارة");
        } catch (Exception e) {
            txtResult.setText("خطأ في تهيئة محرك ALPR: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @Override
    public void surfaceCreated(@NonNull SurfaceHolder holder) {
        try {
            camera = Camera.open();
            camera.setPreview Display(holder);
            camera.startPreview();
            
            // ضبط التركيز التلقائي
            Camera.Parameters params = camera.getParameters();
            if (params.getSupportedFocusModes().contains(
                    Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE)) {
                params.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);
                camera.setParameters(params);
            }
        } catch (Exception e) {
            txtResult.setText("خطأ في فتح الكاميرا: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @Override
    public void surfaceChanged(@NonNull SurfaceHolder holder, int format, int width, int height) {
        // يمكن تحديث إعدادات الكاميرا هنا إذا لزم الأمر
    }
    
    @Override
    public void surfaceDestroyed(@NonNull SurfaceHolder holder) {
        releaseCamera();
    }
    
    /**
     * التقاط الصورة ومعالجتها
     */
    private void captureImage() {
        if (camera == null || isProcessing) {
            return;
        }
        
        isProcessing = true;
        btnCapture.setEnabled(false);
        txtResult.setText("جاري التقاط ومعالجة الصورة...");
        
        camera.takePicture(null, null, (data, camera) -> {
            // تحويل البيانات إلى Bitmap
            Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
            
            // معالجة الصورة
            processImage(bitmap);
            
            // إعادة تشغيل المعاينة
            camera.startPreview();
        });
    }
    
    /**
     * معالجة الصورة باستخدام ALPR
     */
    private void processImage(Bitmap image) {
        new Thread(() -> {
            try {
                // استخدام محرك ALPR للتعرف على اللوحة
                AlprResult result = alprEngine.recognize(image);
                
                if (result.isSuccess()) {
                    String plateNumber = result.getPlateNumber();
                    float confidence = result.getConfidence();
                    
                    // حفظ الصورة
                    String imagePath = saveImage(image, plateNumber);
                    
                    // الحصول على الموقع الحالي
                    getCurrentLocation(location -> {
                        // حفظ المخالفة في قاعدة البيانات المحلية
                        saveViolation(plateNumber, confidence, imagePath, location);
                        
                        runOnUiThread(() -> {
                            String resultText = String.format(
                                "✅ تم التعرف على اللوحة: %s\nدقة التعرف: %.1f%%",
                                plateNumber, confidence * 100);
                            txtResult.setText(resultText);
                            Toast.makeText(CameraActivity.this,
                                "تم حفظ المخالفة بنجاح", Toast.LENGTH_SHORT).show();
                            
                            btnCapture.setEnabled(true);
                            isProcessing = false;
                        });
                    });
                } else {
                    runOnUiThread(() -> {
                        txtResult.setText("❌ لم يتم التعرف على أي لوحة\nحاول مرة أخرى مع تحسين الإضاءة");
                        btnCapture.setEnabled(true);
                        isProcessing = false;
                    });
                }
            } catch (Exception e) {
                runOnUiThread(() -> {
                    txtResult.setText("خطأ في المعالجة: " + e.getMessage());
                    btnCapture.setEnabled(true);
                    isProcessing = false;
                });
                e.printStackTrace();
            }
        }).start();
    }
    
    /**
     * حفظ الصورة في التخزين المحلي
     */
    private String saveImage(Bitmap bitmap, String plateNumber) {
        try {
            File imagesDir = new File(getExternalFilesDir(null), "violations");
            if (!imagesDir.exists()) {
                imagesDir.mkdirs();
            }
            
            String timestamp = String.valueOf(System.currentTimeMillis());
            String filename = plateNumber.replace("-", "_") + "_" + timestamp + ".jpg";
            File imageFile = new File(imagesDir, filename);
            
            FileOutputStream fos = new FileOutputStream(imageFile);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, fos);
            fos.close();
            
            return imageFile.getAbsolutePath();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * الحصول على الموقع الحالي
     */
    private void getCurrentLocation(LocationCallback callback) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            fusedLocationClient.getLastLocation()
                .addOnSuccessListener(this, location -> {
                    callback.onLocationReceived(location);
                })
                .addOnFailureListener(e -> {
                    callback.onLocationReceived(null);
                });
        } else {
            callback.onLocationReceived(null);
        }
    }
    
    /**
     * حفظ المخالفة في قاعدة البيانات المحلية
     */
    private void saveViolation(String plateNumber, float confidence,
                               String imagePath, Location location) {
        ViolationData violation = new ViolationData();
        violation.setPlateNumber(plateNumber);
        violation.setViolationType("unauthorized_parking");
        violation.setTimestamp(new Date());
        violation.setConfidence(confidence);
        violation.setImagePath(imagePath);
        violation.setOfficerName("Android App User");
        violation.setDeviceId(android.provider.Settings.Secure.getString(
            getContentResolver(), android.provider.Settings.Secure.ANDROID_ID));
        
        if (location != null) {
            violation.setLatitude(location.getLatitude());
            violation.setLongitude(location.getLongitude());
        }
        
        long id = databaseHelper.savePendingViolation(violation);
        violation.setId(id);
    }
    
    /**
     * تبديل الفلاش
     */
    private void toggleFlash() {
        if (camera == null) {
            return;
        }
        
        try {
            Camera.Parameters params = camera.getParameters();
            if (isFlashOn) {
                params.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
                isFlashOn = false;
                btnFlash.setText("تشغيل الفلاش");
            } else {
                params.setFlashMode(Camera.Parameters.FLASH_MODE_TORCH);
                isFlashOn = true;
                btnFlash.setText("إيقاف الفلاش");
            }
            camera.setParameters(params);
        } catch (Exception e) {
            Toast.makeText(this, "الفلاش غير متوفر", Toast.LENGTH_SHORT).show();
        }
    }
    
    /**
     * تحرير الكاميرا
     */
    private void releaseCamera() {
        if (camera != null) {
            camera.stopPreview();
            camera.release();
            camera = null;
        }
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        releaseCamera();
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (alprEngine != null) {
            alprEngine.cleanup();
        }
        if (databaseHelper != null) {
            databaseHelper.close();
        }
    }
    
    /**
     * واجهة رد الاتصال للموقع
     */
    interface LocationCallback {
        void onLocationReceived(Location location);
    }
}
