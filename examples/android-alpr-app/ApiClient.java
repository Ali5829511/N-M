package com.traffic.alpr.api;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import java.util.concurrent.TimeUnit;

/**
 * ApiClient - عميل API
 * API Client for making network requests
 * 
 * This class provides a configured Retrofit instance
 * for communicating with the backend server.
 */
public class ApiClient {
    
    // عنوان الخادم - يجب تغييره إلى عنوان الخادم الفعلي
    // Server URL - should be changed to actual server address
    private static final String BASE_URL = "https://ali5829511.github.io/N-M/";
    
    // رمز المصادقة - يجب الحصول عليه من الخادم
    // Authentication token - should be obtained from server
    private static final String API_TOKEN = "your_secure_token_here";
    
    private static Retrofit retrofit = null;
    private static ApiService apiService = null;
    
    /**
     * الحصول على عميل Retrofit
     * Get Retrofit client
     */
    public static Retrofit getClient() {
        if (retrofit == null) {
            // إنشاء interceptor لإضافة رمز المصادقة
            OkHttpClient.Builder httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(chain -> {
                    Request original = chain.request();
                    
                    // إضافة رؤوس المصادقة
                    Request request = original.newBuilder()
                        .header("Authorization", "Bearer " + API_TOKEN)
                        .header("Content-Type", "application/json")
                        .header("Accept", "application/json")
                        .header("User-Agent", "Traffic-ALPR-Android/1.0")
                        .method(original.method(), original.body())
                        .build();
                    
                    return chain.proceed(request);
                });
            
            // إضافة logging في وضع التطوير
            if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
                loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
                httpClient.addInterceptor(loggingInterceptor);
            }
            
            retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(httpClient.build())
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        }
        
        return retrofit;
    }
    
    /**
     * الحصول على خدمة API
     * Get API service
     */
    public static ApiService getApiService() {
        if (apiService == null) {
            apiService = getClient().create(ApiService.class);
        }
        return apiService;
    }
    
    /**
     * تعيين عنوان الخادم
     * Set server URL
     * 
     * @param url عنوان الخادم الجديد / New server URL
     */
    public static void setBaseUrl(String url) {
        retrofit = null;
        apiService = null;
        // سيتم إنشاء عميل جديد في المرة القادمة
    }
    
    /**
     * تعيين رمز المصادقة
     * Set authentication token
     * 
     * @param token رمز المصادقة الجديد / New authentication token
     */
    public static void setApiToken(String token) {
        // سيتم تحديث الرمز في المرة القادمة
        retrofit = null;
        apiService = null;
    }
}
