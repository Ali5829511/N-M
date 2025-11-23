package com.traffic.alpr;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.work.WorkManager;
import com.traffic.alpr.api.ApiClient;
import com.traffic.alpr.api.ApiService;
import com.traffic.alpr.database.DatabaseHelper;
import com.traffic.alpr.models.ViolationData;
import java.util.List;

/**
 * MainActivity - الشاشة الرئيسية للتطبيق
 * Main screen of the Traffic Management ALPR application
 * 
 * Features:
 * - Camera access for plate recognition
 * - View pending violations
 * - Sync with server
 * - View statistics
 */
public class MainActivity extends AppCompatActivity {
    
    private static final int CAMERA_PERMISSION_CODE = 100;
    private static final int LOCATION_PERMISSION_CODE = 101;
    
    private Button btnStartCamera;
    private Button btnViewViolations;
    private Button btnSyncData;
    private TextView txtPendingCount;
    private TextView txtSyncStatus;
    
    private DatabaseHelper databaseHelper;
    private ApiService apiService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // تهيئة المكونات
        initializeComponents();
        
        // التحقق من الأذونات
        checkPermissions();
        
        // تحديث العدادات
        updatePendingCount();
        
        // جدولة المزامنة التلقائية
        scheduleSyncService();
    }
    
    /**
     * تهيئة مكونات الواجهة
     */
    private void initializeComponents() {
        btnStartCamera = findViewById(R.id.btn_start_camera);
        btnViewViolations = findViewById(R.id.btn_view_violations);
        btnSyncData = findViewById(R.id.btn_sync_data);
        txtPendingCount = findViewById(R.id.txt_pending_count);
        txtSyncStatus = findViewById(R.id.txt_sync_status);
        
        databaseHelper = new DatabaseHelper(this);
        apiService = ApiClient.getApiService();
        
        // تعيين الأحداث
        btnStartCamera.setOnClickListener(v -> openCameraActivity());
        btnViewViolations.setOnClickListener(v -> openViolationsActivity());
        btnSyncData.setOnClickListener(v -> syncDataWithServer());
    }
    
    /**
     * التحقق من الأذونات المطلوبة
     */
    private void checkPermissions() {
        // التحقق من إذن الكاميرا
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.CAMERA},
                CAMERA_PERMISSION_CODE);
        }
        
        // التحقق من إذن الموقع
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                },
                LOCATION_PERMISSION_CODE);
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                          @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == CAMERA_PERMISSION_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "تم منح إذن الكاميرا", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "إذن الكاميرا مطلوب للتطبيق", Toast.LENGTH_LONG).show();
            }
        }
        
        if (requestCode == LOCATION_PERMISSION_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "تم منح إذن الموقع", Toast.LENGTH_SHORT).show();
            }
        }
    }
    
    /**
     * فتح نشاط الكاميرا
     */
    private void openCameraActivity() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            Intent intent = new Intent(this, CameraActivity.class);
            startActivity(intent);
        } else {
            Toast.makeText(this, "الرجاء منح إذن الكاميرا أولاً", Toast.LENGTH_SHORT).show();
            checkPermissions();
        }
    }
    
    /**
     * فتح نشاط المخالفات
     */
    private void openViolationsActivity() {
        // TODO: Create ViolationsListActivity or use alternative
        Toast.makeText(this, "عرض المخالفات - قيد التطوير", Toast.LENGTH_SHORT).show();
        // Intent intent = new Intent(this, ViolationsListActivity.class);
        // startActivity(intent);
    }
    
    /**
     * مزامنة البيانات مع الخادم
     */
    private void syncDataWithServer() {
        txtSyncStatus.setText("جاري المزامنة...");
        btnSyncData.setEnabled(false);
        
        new Thread(() -> {
            try {
                List<ViolationData> pendingViolations = databaseHelper.getPendingViolations();
                
                if (pendingViolations.isEmpty()) {
                    runOnUiThread(() -> {
                        txtSyncStatus.setText("لا توجد بيانات للمزامنة");
                        btnSyncData.setEnabled(true);
                    });
                    return;
                }
                
                int successCount = 0;
                int failCount = 0;
                
                for (ViolationData violation : pendingViolations) {
                    try {
                        retrofit2.Response<com.traffic.alpr.models.ViolationResponse> response =
                            apiService.submitViolation(violation).execute();
                        
                        if (response.isSuccessful() && response.body() != null) {
                            databaseHelper.markAsSynced(violation.getId());
                            successCount++;
                        } else {
                            failCount++;
                        }
                    } catch (Exception e) {
                        failCount++;
                        e.printStackTrace();
                    }
                }
                
                final int finalSuccess = successCount;
                final int finalFail = failCount;
                
                runOnUiThread(() -> {
                    String message = String.format("تمت المزامنة: %d نجح، %d فشل",
                        finalSuccess, finalFail);
                    txtSyncStatus.setText(message);
                    Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
                    btnSyncData.setEnabled(true);
                    updatePendingCount();
                });
                
            } catch (Exception e) {
                runOnUiThread(() -> {
                    txtSyncStatus.setText("خطأ في المزامنة");
                    Toast.makeText(MainActivity.this,
                        "حدث خطأ أثناء المزامنة", Toast.LENGTH_SHORT).show();
                    btnSyncData.setEnabled(true);
                });
                e.printStackTrace();
            }
        }).start();
    }
    
    /**
     * تحديث عدد المخالفات المعلقة
     */
    private void updatePendingCount() {
        new Thread(() -> {
            int pendingCount = databaseHelper.getPendingViolationsCount();
            runOnUiThread(() -> {
                txtPendingCount.setText(String.format("المخالفات المعلقة: %d", pendingCount));
            });
        }).start();
    }
    
    /**
     * جدولة خدمة المزامنة التلقائية
     */
    private void scheduleSyncService() {
        // استخدام WorkManager للمزامنة الدورية كل 15 دقيقة
        androidx.work.PeriodicWorkRequest syncRequest =
            new androidx.work.PeriodicWorkRequest.Builder(
                SyncWorker.class, 15, java.util.concurrent.TimeUnit.MINUTES)
            .setConstraints(new androidx.work.Constraints.Builder()
                .setRequiredNetworkType(androidx.work.NetworkType.CONNECTED)
                .build())
            .build();
        
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "violation_sync",
            androidx.work.ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        );
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        updatePendingCount();
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (databaseHelper != null) {
            databaseHelper.close();
        }
    }
}
