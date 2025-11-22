-- Plate Recognizer Snapshot Database Schema
-- Schema for storing vehicle snapshot data with images
-- سكيما قاعدة البيانات لتخزين بيانات السيارات مع الصور

-- جدول لقطات المركبات - Vehicle Snapshots Table
CREATE TABLE IF NOT EXISTS vehicle_snapshots (
    id SERIAL PRIMARY KEY,
    
    -- معرف فريد للقطة - Unique snapshot identifier
    snapshot_id VARCHAR(100) UNIQUE,
    
    -- البيانات الخام من API كـ JSONB - Raw API response as JSONB
    raw_response JSONB NOT NULL,
    
    -- رابط الصورة الأصلية - Original image URL
    image_url TEXT,
    
    -- بيانات الصورة الثنائية - Binary image data
    image_data BYTEA,
    
    -- نوع محتوى الصورة - Image MIME type
    image_mime TEXT,
    
    -- حجم الصورة بالبايتات - Image size in bytes
    image_size INTEGER,
    
    -- هاش SHA256 للصورة - Image SHA256 hash
    image_sha256 TEXT,
    
    -- رقم اللوحة المستخرج - Extracted plate number
    plate_number VARCHAR(50),
    
    -- بلد اللوحة - Plate region/country
    plate_region VARCHAR(50),
    
    -- درجة الثقة في التعرف - Recognition confidence
    confidence FLOAT,
    
    -- حالة المعالجة - Processing status
    status VARCHAR(20) DEFAULT 'processed' CHECK (status IN ('processed', 'pending', 'error')),
    
    -- ملاحظات - Notes
    notes TEXT,
    
    -- طوابع زمنية - Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء الفهارس للأداء - Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_snapshots_plate ON vehicle_snapshots(plate_number);
CREATE INDEX IF NOT EXISTS idx_snapshots_created ON vehicle_snapshots(created_at);
CREATE INDEX IF NOT EXISTS idx_snapshots_status ON vehicle_snapshots(status);
CREATE INDEX IF NOT EXISTS idx_snapshots_sha256 ON vehicle_snapshots(image_sha256);
CREATE INDEX IF NOT EXISTS idx_snapshots_region ON vehicle_snapshots(plate_region);

-- فهرس JSONB للبحث السريع - JSONB index for fast queries
CREATE INDEX IF NOT EXISTS idx_snapshots_raw_response ON vehicle_snapshots USING GIN (raw_response);

-- دالة تحديث updated_at تلقائياً - Auto-update updated_at function
CREATE OR REPLACE FUNCTION update_snapshot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على جدول vehicle_snapshots - Apply trigger to vehicle_snapshots table
DROP TRIGGER IF EXISTS update_vehicle_snapshots_updated_at ON vehicle_snapshots;
CREATE TRIGGER update_vehicle_snapshots_updated_at BEFORE UPDATE ON vehicle_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_snapshot_updated_at();

-- ملاحظات مهمة - Important Notes:
-- 1. حقل image_data قد يستهلك مساحة كبيرة - image_data field may consume significant storage
-- 2. يُنصح بإعداد سياسة نسخ احتياطي مناسبة - Recommend setting up proper backup policy
-- 3. تأكد من أن قاعدة البيانات لديها مساحة كافية - Ensure database has sufficient storage
-- 4. راعِ سياسات الخصوصية عند تخزين الصور - Consider privacy policies when storing images
