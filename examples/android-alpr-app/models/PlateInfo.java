package com.traffic.alpr.models;

import com.google.gson.annotations.SerializedName;

/**
 * PlateInfo - معلومات اللوحة
 * Plate information response
 */
public class PlateInfo {
    
    @SerializedName("plate_number")
    private String plateNumber;
    
    @SerializedName("is_authorized")
    private boolean isAuthorized;
    
    @SerializedName("vehicle_info")
    private VehicleInfo vehicleInfo;
    
    @SerializedName("previous_violations")
    private int previousViolations;
    
    @SerializedName("total_fines")
    private int totalFines;
    
    @SerializedName("status")
    private String status;
    
    @SerializedName("last_violation_date")
    private String lastViolationDate;
    
    // Inner class for vehicle info
    public static class VehicleInfo {
        @SerializedName("owner_name")
        private String ownerName;
        
        @SerializedName("owner_phone")
        private String ownerPhone;
        
        @SerializedName("building_number")
        private String buildingNumber;
        
        @SerializedName("apartment_number")
        private String apartmentNumber;
        
        // Getters and Setters
        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
        
        public String getOwnerPhone() { return ownerPhone; }
        public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }
        
        public String getBuildingNumber() { return buildingNumber; }
        public void setBuildingNumber(String buildingNumber) { this.buildingNumber = buildingNumber; }
        
        public String getApartmentNumber() { return apartmentNumber; }
        public void setApartmentNumber(String apartmentNumber) { this.apartmentNumber = apartmentNumber; }
    }
    
    // Getters and Setters
    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }
    
    public boolean isAuthorized() { return isAuthorized; }
    public void setAuthorized(boolean authorized) { isAuthorized = authorized; }
    
    public VehicleInfo getVehicleInfo() { return vehicleInfo; }
    public void setVehicleInfo(VehicleInfo vehicleInfo) { this.vehicleInfo = vehicleInfo; }
    
    public int getPreviousViolations() { return previousViolations; }
    public void setPreviousViolations(int previousViolations) { this.previousViolations = previousViolations; }
    
    public int getTotalFines() { return totalFines; }
    public void setTotalFines(int totalFines) { this.totalFines = totalFines; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getLastViolationDate() { return lastViolationDate; }
    public void setLastViolationDate(String lastViolationDate) { this.lastViolationDate = lastViolationDate; }
}
