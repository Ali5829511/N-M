package com.traffic.alpr.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/**
 * SyncResponse - استجابة المزامنة
 * Sync response data
 */
public class SyncResponse {
    
    @SerializedName("success")
    private boolean success;
    
    @SerializedName("synced_count")
    private int syncedCount;
    
    @SerializedName("failed_count")
    private int failedCount;
    
    @SerializedName("results")
    private List<SyncResult> results;
    
    @SerializedName("next_sync")
    private String nextSync;
    
    // Inner class for sync result
    public static class SyncResult {
        @SerializedName("local_id")
        private String localId;
        
        @SerializedName("status")
        private String status;
        
        @SerializedName("server_id")
        private String serverId;
        
        @SerializedName("error")
        private String error;
        
        // Getters and Setters
        public String getLocalId() { return localId; }
        public void setLocalId(String localId) { this.localId = localId; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getServerId() { return serverId; }
        public void setServerId(String serverId) { this.serverId = serverId; }
        
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
    
    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public int getSyncedCount() { return syncedCount; }
    public void setSyncedCount(int syncedCount) { this.syncedCount = syncedCount; }
    
    public int getFailedCount() { return failedCount; }
    public void setFailedCount(int failedCount) { this.failedCount = failedCount; }
    
    public List<SyncResult> getResults() { return results; }
    public void setResults(List<SyncResult> results) { this.results = results; }
    
    public String getNextSync() { return nextSync; }
    public void setNextSync(String nextSync) { this.nextSync = nextSync; }
}
