package com.traffic.alpr.models;

import com.google.gson.annotations.SerializedName;

/**
 * ViolationResponse - استجابة إرسال المخالفة
 * Response for violation submission
 */
public class ViolationResponse {
    
    @SerializedName("success")
    private boolean success;
    
    @SerializedName("violation_id")
    private String violationId;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("message_en")
    private String messageEn;
    
    @SerializedName("fine_amount")
    private int fineAmount;
    
    @SerializedName("status")
    private String status;
    
    @SerializedName("timestamp")
    private String timestamp;
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getViolationId() {
        return violationId;
    }
    
    public void setViolationId(String violationId) {
        this.violationId = violationId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getMessageEn() {
        return messageEn;
    }
    
    public void setMessageEn(String messageEn) {
        this.messageEn = messageEn;
    }
    
    public int getFineAmount() {
        return fineAmount;
    }
    
    public void setFineAmount(int fineAmount) {
        this.fineAmount = fineAmount;
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
}
