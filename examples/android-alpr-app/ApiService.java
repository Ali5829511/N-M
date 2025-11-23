package com.traffic.alpr.api;

import com.traffic.alpr.models.HealthCheck;
import com.traffic.alpr.models.PlateInfo;
import com.traffic.alpr.models.SyncRequest;
import com.traffic.alpr.models.SyncResponse;
import com.traffic.alpr.models.ViolationData;
import com.traffic.alpr.models.ViolationResponse;
import com.traffic.alpr.models.ViolationsListResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

/**
 * ApiService - واجهة خدمة API
 * API Service Interface for Traffic Management System
 * 
 * This interface defines all API endpoints for communication
 * between the Android app and the backend server.
 */
public interface ApiService {
    
    /**
     * فحص صحة الاتصال بالخادم
     * Check server health
     */
    @GET("api/health")
    Call<HealthCheck> checkHealth();
    
    /**
     * إرسال مخالفة جديدة
     * Submit a new violation
     * 
     * @param violation بيانات المخالفة / Violation data
     * @return استجابة الخادم / Server response
     */
    @POST("api/violations")
    Call<ViolationResponse> submitViolation(@Body ViolationData violation);
    
    /**
     * التحقق من لوحة سيارة
     * Verify a plate number
     * 
     * @param plateNumber رقم اللوحة / Plate number
     * @return معلومات اللوحة / Plate information
     */
    @GET("api/plates/{plate_number}")
    Call<PlateInfo> verifyPlate(@Path("plate_number") String plateNumber);
    
    /**
     * الحصول على قائمة المخالفات
     * Get list of violations
     * 
     * @param plateNumber رقم اللوحة (اختياري) / Plate number (optional)
     * @param page رقم الصفحة / Page number
     * @param limit عدد النتائج في الصفحة / Results per page
     * @return قائمة المخالفات / Violations list
     */
    @GET("api/violations")
    Call<ViolationsListResponse> getViolations(
        @Query("plate") String plateNumber,
        @Query("page") int page,
        @Query("limit") int limit
    );
    
    /**
     * مزامنة البيانات مع الخادم
     * Sync data with server
     * 
     * @param syncRequest طلب المزامنة / Sync request
     * @return استجابة المزامنة / Sync response
     */
    @POST("api/sync")
    Call<SyncResponse> syncData(@Body SyncRequest syncRequest);
    
    /**
     * البحث عن مخالفات حسب التاريخ
     * Search violations by date
     * 
     * @param startDate تاريخ البداية / Start date
     * @param endDate تاريخ النهاية / End date
     * @return قائمة المخالفات / Violations list
     */
    @GET("api/violations/search")
    Call<ViolationsListResponse> searchViolationsByDate(
        @Query("start_date") String startDate,
        @Query("end_date") String endDate
    );
    
    /**
     * الحصول على إحصائيات المخالفات
     * Get violation statistics
     * 
     * @param period الفترة الزمنية / Time period (day, week, month)
     * @return الإحصائيات / Statistics
     */
    @GET("api/statistics")
    Call<com.traffic.alpr.models.StatisticsResponse> getStatistics(
        @Query("period") String period
    );
    
    /**
     * رفع صورة المخالفة
     * Upload violation image
     * 
     * @param image بيانات الصورة / Image data
     * @return رابط الصورة / Image URL
     */
    @POST("api/upload/image")
    Call<com.traffic.alpr.models.ImageUploadResponse> uploadImage(
        @Body okhttp3.MultipartBody.Part image
    );
}
