package com.traffic.alpr.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import com.traffic.alpr.models.ViolationData;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * DatabaseHelper - مساعد قاعدة البيانات
 * Database Helper for local data storage
 * 
 * Manages local SQLite database for storing violations
 * before they are synced with the server.
 */
public class DatabaseHelper extends SQLiteOpenHelper {
    
    private static final String DATABASE_NAME = "traffic_violations.db";
    private static final int DATABASE_VERSION = 1;
    
    // اسم جدول المخالفات / Violations table name
    private static final String TABLE_VIOLATIONS = "pending_violations";
    
    // أعمدة الجدول / Table columns
    private static final String COLUMN_ID = "id";
    private static final String COLUMN_PLATE_NUMBER = "plate_number";
    private static final String COLUMN_VIOLATION_TYPE = "violation_type";
    private static final String COLUMN_TIMESTAMP = "timestamp";
    private static final String COLUMN_LATITUDE = "latitude";
    private static final String COLUMN_LONGITUDE = "longitude";
    private static final String COLUMN_IMAGE_PATH = "image_path";
    private static final String COLUMN_CONFIDENCE = "confidence";
    private static final String COLUMN_OFFICER_NAME = "officer_name";
    private static final String COLUMN_DEVICE_ID = "device_id";
    private static final String COLUMN_SYNCED = "synced";
    private static final String COLUMN_SYNC_ATTEMPTS = "sync_attempts";
    
    // استعلام إنشاء الجدول / Table creation query
    private static final String CREATE_TABLE_VIOLATIONS = 
        "CREATE TABLE " + TABLE_VIOLATIONS + " (" +
        COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
        COLUMN_PLATE_NUMBER + " TEXT NOT NULL, " +
        COLUMN_VIOLATION_TYPE + " TEXT NOT NULL, " +
        COLUMN_TIMESTAMP + " TEXT NOT NULL, " +
        COLUMN_LATITUDE + " REAL, " +
        COLUMN_LONGITUDE + " REAL, " +
        COLUMN_IMAGE_PATH + " TEXT, " +
        COLUMN_CONFIDENCE + " REAL, " +
        COLUMN_OFFICER_NAME + " TEXT, " +
        COLUMN_DEVICE_ID + " TEXT, " +
        COLUMN_SYNCED + " INTEGER DEFAULT 0, " +
        COLUMN_SYNC_ATTEMPTS + " INTEGER DEFAULT 0" +
        ")";
    
    private SimpleDateFormat dateFormat = 
        new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US);
    
    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }
    
    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(CREATE_TABLE_VIOLATIONS);
    }
    
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_VIOLATIONS);
        onCreate(db);
    }
    
    /**
     * حفظ مخالفة جديدة
     * Save a new violation
     * 
     * @param violation بيانات المخالفة / Violation data
     * @return معرف المخالفة / Violation ID
     */
    public long savePendingViolation(ViolationData violation) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(COLUMN_PLATE_NUMBER, violation.getPlateNumber());
        values.put(COLUMN_VIOLATION_TYPE, violation.getViolationType());
        values.put(COLUMN_TIMESTAMP, dateFormat.format(violation.getTimestamp()));
        values.put(COLUMN_LATITUDE, violation.getLatitude());
        values.put(COLUMN_LONGITUDE, violation.getLongitude());
        values.put(COLUMN_IMAGE_PATH, violation.getImagePath());
        values.put(COLUMN_CONFIDENCE, violation.getConfidence());
        values.put(COLUMN_OFFICER_NAME, violation.getOfficerName());
        values.put(COLUMN_DEVICE_ID, violation.getDeviceId());
        values.put(COLUMN_SYNCED, 0);
        values.put(COLUMN_SYNC_ATTEMPTS, 0);
        
        long id = db.insert(TABLE_VIOLATIONS, null, values);
        db.close();
        
        return id;
    }
    
    /**
     * الحصول على المخالفات غير المزامنة
     * Get pending (unsynced) violations
     * 
     * @return قائمة المخالفات / List of violations
     */
    public List<ViolationData> getPendingViolations() {
        List<ViolationData> violations = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        
        String query = "SELECT * FROM " + TABLE_VIOLATIONS + 
                      " WHERE " + COLUMN_SYNCED + " = 0" +
                      " ORDER BY " + COLUMN_TIMESTAMP + " ASC";
        
        Cursor cursor = db.rawQuery(query, null);
        
        if (cursor.moveToFirst()) {
            do {
                ViolationData violation = cursorToViolation(cursor);
                violations.add(violation);
            } while (cursor.moveToNext());
        }
        
        cursor.close();
        db.close();
        
        return violations;
    }
    
    /**
     * الحصول على عدد المخالفات المعلقة
     * Get count of pending violations
     * 
     * @return العدد / Count
     */
    public int getPendingViolationsCount() {
        SQLiteDatabase db = this.getReadableDatabase();
        
        String query = "SELECT COUNT(*) FROM " + TABLE_VIOLATIONS + 
                      " WHERE " + COLUMN_SYNCED + " = 0";
        
        Cursor cursor = db.rawQuery(query, null);
        int count = 0;
        
        if (cursor.moveToFirst()) {
            count = cursor.getInt(0);
        }
        
        cursor.close();
        db.close();
        
        return count;
    }
    
    /**
     * تحديد المخالفة كمُزامنة
     * Mark violation as synced
     * 
     * @param violationId معرف المخالفة / Violation ID
     */
    public void markAsSynced(long violationId) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_SYNCED, 1);
        
        db.update(TABLE_VIOLATIONS, values, 
                 COLUMN_ID + " = ?", 
                 new String[]{String.valueOf(violationId)});
        db.close();
    }
    
    /**
     * زيادة عدد محاولات المزامنة
     * Increment sync attempts
     * 
     * @param violationId معرف المخالفة / Violation ID
     */
    public void incrementSyncAttempts(long violationId) {
        SQLiteDatabase db = this.getWritableDatabase();
        
        String query = "UPDATE " + TABLE_VIOLATIONS + 
                      " SET " + COLUMN_SYNC_ATTEMPTS + " = " + COLUMN_SYNC_ATTEMPTS + " + 1" +
                      " WHERE " + COLUMN_ID + " = ?";
        
        db.execSQL(query, new String[]{String.valueOf(violationId)});
        db.close();
    }
    
    /**
     * حذف المخالفات المزامنة القديمة
     * Delete old synced violations
     * 
     * @param daysOld عدد الأيام / Number of days
     */
    public void deleteOldSyncedViolations(int daysOld) {
        SQLiteDatabase db = this.getWritableDatabase();
        
        long cutoffTime = System.currentTimeMillis() - (daysOld * 24 * 60 * 60 * 1000L);
        String cutoffDate = dateFormat.format(new Date(cutoffTime));
        
        db.delete(TABLE_VIOLATIONS,
                 COLUMN_SYNCED + " = 1 AND " + COLUMN_TIMESTAMP + " < ?",
                 new String[]{cutoffDate});
        db.close();
    }
    
    /**
     * الحصول على جميع المخالفات
     * Get all violations
     * 
     * @return قائمة المخالفات / List of violations
     */
    public List<ViolationData> getAllViolations() {
        List<ViolationData> violations = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        
        String query = "SELECT * FROM " + TABLE_VIOLATIONS + 
                      " ORDER BY " + COLUMN_TIMESTAMP + " DESC";
        
        Cursor cursor = db.rawQuery(query, null);
        
        if (cursor.moveToFirst()) {
            do {
                ViolationData violation = cursorToViolation(cursor);
                violations.add(violation);
            } while (cursor.moveToNext());
        }
        
        cursor.close();
        db.close();
        
        return violations;
    }
    
    /**
     * البحث عن مخالفات حسب رقم اللوحة
     * Search violations by plate number
     * 
     * @param plateNumber رقم اللوحة / Plate number
     * @return قائمة المخالفات / List of violations
     */
    public List<ViolationData> searchByPlateNumber(String plateNumber) {
        List<ViolationData> violations = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        
        String query = "SELECT * FROM " + TABLE_VIOLATIONS + 
                      " WHERE " + COLUMN_PLATE_NUMBER + " LIKE ?" +
                      " ORDER BY " + COLUMN_TIMESTAMP + " DESC";
        
        Cursor cursor = db.rawQuery(query, new String[]{"%" + plateNumber + "%"});
        
        if (cursor.moveToFirst()) {
            do {
                ViolationData violation = cursorToViolation(cursor);
                violations.add(violation);
            } while (cursor.moveToNext());
        }
        
        cursor.close();
        db.close();
        
        return violations;
    }
    
    /**
     * تحويل Cursor إلى كائن ViolationData
     * Convert Cursor to ViolationData object
     */
    private ViolationData cursorToViolation(Cursor cursor) {
        ViolationData violation = new ViolationData();
        
        violation.setId(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_ID)));
        violation.setPlateNumber(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PLATE_NUMBER)));
        violation.setViolationType(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_VIOLATION_TYPE)));
        
        try {
            String timestampStr = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TIMESTAMP));
            violation.setTimestamp(dateFormat.parse(timestampStr));
        } catch (Exception e) {
            violation.setTimestamp(new Date());
        }
        
        violation.setLatitude(cursor.getDouble(cursor.getColumnIndexOrThrow(COLUMN_LATITUDE)));
        violation.setLongitude(cursor.getDouble(cursor.getColumnIndexOrThrow(COLUMN_LONGITUDE)));
        violation.setImagePath(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_IMAGE_PATH)));
        violation.setConfidence(cursor.getFloat(cursor.getColumnIndexOrThrow(COLUMN_CONFIDENCE)));
        violation.setOfficerName(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_OFFICER_NAME)));
        violation.setDeviceId(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_DEVICE_ID)));
        
        return violation;
    }
    
    /**
     * مسح جميع البيانات
     * Clear all data
     */
    public void clearAllData() {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_VIOLATIONS, null, null);
        db.close();
    }
}
