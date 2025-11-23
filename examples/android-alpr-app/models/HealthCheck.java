package com.traffic.alpr.models;

import com.google.gson.annotations.SerializedName;

/**
 * HealthCheck - فحص صحة الخادم
 * Server health check response
 */
public class HealthCheck {
    
    @SerializedName("success")
    private boolean success;
    
    @SerializedName("status")
    private String status;
    
    @SerializedName("timestamp")
    private String timestamp;
    
    @SerializedName("version")
    private String version;
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getVersion() {
        return version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }
}
