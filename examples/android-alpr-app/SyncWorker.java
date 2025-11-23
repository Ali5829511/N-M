package com.traffic.alpr;

import android.content.Context;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import com.traffic.alpr.api.ApiClient;
import com.traffic.alpr.api.ApiService;
import com.traffic.alpr.database.DatabaseHelper;
import com.traffic.alpr.models.ViolationData;
import java.util.List;

/**
 * SyncWorker - عامل المزامنة الخلفية
 * Background sync worker for automatic data synchronization
 * 
 * This worker runs periodically in the background to sync
 * pending violations with the server.
 */
public class SyncWorker extends Worker {
    
    private static final String TAG = "SyncWorker";
    
    private DatabaseHelper databaseHelper;
    private ApiService apiService;
    
    public SyncWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
        databaseHelper = new DatabaseHelper(context);
        apiService = ApiClient.getApiService();
    }
    
    @NonNull
    @Override
    public Result doWork() {
        Log.d(TAG, "Starting background sync...");
        
        try {
            // الحصول على المخالفات المعلقة
            List<ViolationData> pendingViolations = databaseHelper.getPendingViolations();
            
            if (pendingViolations.isEmpty()) {
                Log.d(TAG, "No pending violations to sync");
                return Result.success();
            }
            
            Log.d(TAG, "Found " + pendingViolations.size() + " pending violations");
            
            int successCount = 0;
            int failCount = 0;
            
            // مزامنة كل مخالفة
            for (ViolationData violation : pendingViolations) {
                try {
                    retrofit2.Response<com.traffic.alpr.models.ViolationResponse> response =
                        apiService.submitViolation(violation).execute();
                    
                    if (response.isSuccessful() && response.body() != null) {
                        // تحديد كمزامنة
                        databaseHelper.markAsSynced(violation.getId());
                        successCount++;
                        Log.d(TAG, "Synced violation: " + violation.getPlateNumber());
                    } else {
                        // زيادة عدد المحاولات
                        databaseHelper.incrementSyncAttempts(violation.getId());
                        failCount++;
                        Log.e(TAG, "Failed to sync violation: " + response.code());
                    }
                } catch (Exception e) {
                    databaseHelper.incrementSyncAttempts(violation.getId());
                    failCount++;
                    Log.e(TAG, "Error syncing violation: " + e.getMessage());
                }
                
                // توقف قصير بين الطلبات
                Thread.sleep(100);
            }
            
            Log.d(TAG, "Sync complete. Success: " + successCount + ", Failed: " + failCount);
            
            // حذف المخالفات المزامنة القديمة (أكثر من 30 يوم)
            databaseHelper.deleteOldSyncedViolations(30);
            
            if (failCount == 0) {
                return Result.success();
            } else if (successCount > 0) {
                // بعض المخالفات تمت مزامنتها
                return Result.success();
            } else {
                // فشلت جميع المحاولات
                return Result.retry();
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Sync worker failed: " + e.getMessage());
            return Result.retry();
        } finally {
            if (databaseHelper != null) {
                databaseHelper.close();
            }
        }
    }
}
