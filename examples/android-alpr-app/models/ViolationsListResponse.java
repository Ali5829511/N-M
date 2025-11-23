package com.traffic.alpr.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/**
 * ViolationsListResponse - استجابة قائمة المخالفات
 * Violations list response
 */
public class ViolationsListResponse {
    
    @SerializedName("success")
    private boolean success;
    
    @SerializedName("total")
    private int total;
    
    @SerializedName("page")
    private int page;
    
    @SerializedName("limit")
    private int limit;
    
    @SerializedName("violations")
    private List<Violation> violations;
    
    // Inner class for violation item
    public static class Violation {
        @SerializedName("violation_id")
        private String violationId;
        
        @SerializedName("plate_number")
        private String plateNumber;
        
        @SerializedName("date")
        private String date;
        
        @SerializedName("type")
        private String type;
        
        @SerializedName("fine_amount")
        private int fineAmount;
        
        @SerializedName("status")
        private String status;
        
        @SerializedName("location")
        private String location;
        
        @SerializedName("officer_name")
        private String officerName;
        
        @SerializedName("confidence")
        private float confidence;
        
        // Getters and Setters
        public String getViolationId() { return violationId; }
        public void setViolationId(String violationId) { this.violationId = violationId; }
        
        public String getPlateNumber() { return plateNumber; }
        public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }
        
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public int getFineAmount() { return fineAmount; }
        public void setFineAmount(int fineAmount) { this.fineAmount = fineAmount; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public String getOfficerName() { return officerName; }
        public void setOfficerName(String officerName) { this.officerName = officerName; }
        
        public float getConfidence() { return confidence; }
        public void setConfidence(float confidence) { this.confidence = confidence; }
    }
    
    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
    
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    
    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }
    
    public List<Violation> getViolations() { return violations; }
    public void setViolations(List<Violation> violations) { this.violations = violations; }
}
