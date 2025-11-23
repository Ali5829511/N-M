package com.traffic.alpr.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/**
 * SyncRequest - طلب المزامنة
 * Sync request data
 */
public class SyncRequest {
    
    @SerializedName("device_id")
    private String deviceId;
    
    @SerializedName("last_sync")
    private String lastSync;
    
    @SerializedName("pending_violations")
    private List<PendingViolation> pendingViolations;
    
    // Inner class for pending violation
    public static class PendingViolation {
        @SerializedName("local_id")
        private String localId;
        
        @SerializedName("plate_number")
        private String plateNumber;
        
        @SerializedName("timestamp")
        private String timestamp;
        
        @SerializedName("violation_type")
        private String violationType;
        
        @SerializedName("confidence")
        private float confidence;
        
        // Getters and Setters
        public String getLocalId() { return localId; }
        public void setLocalId(String localId) { this.localId = localId; }
        
        public String getPlateNumber() { return plateNumber; }
        public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }
        
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        
        public String getViolationType() { return violationType; }
        public void setViolationType(String violationType) { this.violationType = violationType; }
        
        public float getConfidence() { return confidence; }
        public void setConfidence(float confidence) { this.confidence = confidence; }
    }
    
    // Getters and Setters
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    
    public String getLastSync() { return lastSync; }
    public void setLastSync(String lastSync) { this.lastSync = lastSync; }
    
    public List<PendingViolation> getPendingViolations() { return pendingViolations; }
    public void setPendingViolations(List<PendingViolation> pendingViolations) { 
        this.pendingViolations = pendingViolations; 
    }
}
