package com.traffic.alpr.models;

import com.google.gson.annotations.SerializedName;

/**
 * StatisticsResponse - استجابة الإحصائيات
 * Statistics response
 */
public class StatisticsResponse {
    
    @SerializedName("success")
    private boolean success;
    
    @SerializedName("period")
    private String period;
    
    @SerializedName("statistics")
    private Statistics statistics;
    
    @SerializedName("timestamp")
    private String timestamp;
    
    // Inner class for statistics data
    public static class Statistics {
        @SerializedName("total_violations")
        private int totalViolations;
        
        @SerializedName("pending")
        private int pending;
        
        @SerializedName("paid")
        private int paid;
        
        @SerializedName("cancelled")
        private int cancelled;
        
        @SerializedName("total_fines")
        private int totalFines;
        
        @SerializedName("collected_fines")
        private int collectedFines;
        
        @SerializedName("unique_vehicles")
        private int uniqueVehicles;
        
        @SerializedName("repeat_offenders")
        private int repeatOffenders;
        
        // Getters and Setters
        public int getTotalViolations() { return totalViolations; }
        public void setTotalViolations(int totalViolations) { this.totalViolations = totalViolations; }
        
        public int getPending() { return pending; }
        public void setPending(int pending) { this.pending = pending; }
        
        public int getPaid() { return paid; }
        public void setPaid(int paid) { this.paid = paid; }
        
        public int getCancelled() { return cancelled; }
        public void setCancelled(int cancelled) { this.cancelled = cancelled; }
        
        public int getTotalFines() { return totalFines; }
        public void setTotalFines(int totalFines) { this.totalFines = totalFines; }
        
        public int getCollectedFines() { return collectedFines; }
        public void setCollectedFines(int collectedFines) { this.collectedFines = collectedFines; }
        
        public int getUniqueVehicles() { return uniqueVehicles; }
        public void setUniqueVehicles(int uniqueVehicles) { this.uniqueVehicles = uniqueVehicles; }
        
        public int getRepeatOffenders() { return repeatOffenders; }
        public void setRepeatOffenders(int repeatOffenders) { this.repeatOffenders = repeatOffenders; }
    }
    
    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    
    public Statistics getStatistics() { return statistics; }
    public void setStatistics(Statistics statistics) { this.statistics = statistics; }
    
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
