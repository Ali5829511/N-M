package com.traffic.alpr.models;

import com.google.gson.annotations.SerializedName;

/**
 * ImageUploadResponse - استجابة رفع الصورة
 * Image upload response
 */
public class ImageUploadResponse {
    
    @SerializedName("success")
    private boolean success;
    
    @SerializedName("image_url")
    private String imageUrl;
    
    @SerializedName("thumbnail_url")
    private String thumbnailUrl;
    
    @SerializedName("size")
    private long size;
    
    @SerializedName("timestamp")
    private String timestamp;
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getThumbnailUrl() {
        return thumbnailUrl;
    }
    
    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
    
    public long getSize() {
        return size;
    }
    
    public void setSize(long size) {
        this.size = size;
    }
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
