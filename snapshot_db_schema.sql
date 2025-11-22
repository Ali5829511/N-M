-- Plate Recognizer Snapshot Database Schema
-- مخطط قاعدة البيانات لنظام Plate Recognizer Snapshot
-- PostgreSQL Database Schema for storing vehicle snapshot data

-- Enable UUID extension for generating unique IDs
-- تفعيل امتداد UUID لإنشاء معرفات فريدة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vehicle Snapshots Table
-- جدول لقطات المركبات
-- Stores complete vehicle detection data from Plate Recognizer Snapshot API
CREATE TABLE IF NOT EXISTS vehicle_snapshots (
    -- Unique identifier for each snapshot
    -- المعرف الفريد لكل لقطة
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference to source image (file path or URL)
    -- مرجع للصورة المصدر (مسار الملف أو الرابط)
    snapshot_ref VARCHAR(500),
    
    -- Camera identifier from API response
    -- معرف الكاميرا من استجابة API
    camera_id VARCHAR(100),
    
    -- Timestamp when the image was captured
    -- الطابع الزمني لالتقاط الصورة
    captured_at TIMESTAMP WITH TIME ZONE,
    
    -- Detected license plate text
    -- نص اللوحة المكتشفة
    plate_text VARCHAR(50),
    
    -- Confidence score for plate detection (0-1)
    -- درجة الثقة في اكتشاف اللوحة (0-1)
    plate_confidence DECIMAL(5, 4),
    
    -- Vehicle makes and models detected (JSONB array)
    -- ماركات وموديلات المركبة المكتشفة (مصفوفة JSONB)
    -- Example: [{"make": "Toyota", "model": "Camry", "confidence": 0.95}]
    makes_models JSONB,
    
    -- Vehicle colors detected (JSONB array)
    -- ألوان المركبة المكتشفة (مصفوفة JSONB)
    -- Example: [{"color": "white", "confidence": 0.92}]
    colors JSONB,
    
    -- Bounding box coordinates for detected plate (JSONB object)
    -- إحداثيات المربع المحيط باللوحة المكتشفة (كائن JSONB)
    -- Example: {"xmin": 100, "ymin": 200, "xmax": 300, "ymax": 250}
    bbox JSONB,
    
    -- Complete raw API response (JSONB)
    -- الاستجابة الكاملة من API (JSONB)
    -- Stores the entire API response for future reference and data extraction
    raw_response JSONB NOT NULL,
    
    -- Image URL if provided (for remote images)
    -- رابط الصورة إذا تم توفيره (للصور البعيدة)
    image_url VARCHAR(1000),
    
    -- Additional metadata (JSONB)
    -- بيانات وصفية إضافية (JSONB)
    -- Can store custom fields like location, notes, processing info, etc.
    meta JSONB,
    
    -- Record creation timestamp
    -- الطابع الزمني لإنشاء السجل
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
-- فهارس لتحسين الأداء

-- Index on plate text for quick lookups
-- فهرس على نص اللوحة للبحث السريع
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_plate 
    ON vehicle_snapshots(plate_text);

-- Index on creation timestamp for time-based queries
-- فهرس على الطابع الزمني للاستعلامات الزمنية
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_created 
    ON vehicle_snapshots(created_at DESC);

-- Index on captured_at for sorting by capture time
-- فهرس على وقت الالتقاط للترتيب حسب وقت الالتقاط
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_captured 
    ON vehicle_snapshots(captured_at DESC);

-- GIN index on makes_models JSONB for efficient queries
-- فهرس GIN على makes_models للاستعلامات الفعالة
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_makes_models 
    ON vehicle_snapshots USING GIN (makes_models);

-- GIN index on colors JSONB for efficient queries
-- فهرس GIN على colors للاستعلامات الفعالة
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_colors 
    ON vehicle_snapshots USING GIN (colors);

-- GIN index on raw_response for full-text search capabilities
-- فهرس GIN على raw_response لإمكانيات البحث النصي الكامل
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_raw_response 
    ON vehicle_snapshots USING GIN (raw_response);

-- Comments on table and important columns
-- تعليقات على الجدول والأعمدة المهمة
COMMENT ON TABLE vehicle_snapshots IS 
    'Stores vehicle detection data from Plate Recognizer Snapshot API / يخزن بيانات اكتشاف المركبات من Plate Recognizer Snapshot API';

COMMENT ON COLUMN vehicle_snapshots.raw_response IS 
    'Complete API response in JSONB format for full data preservation / الاستجابة الكاملة من API بصيغة JSONB للحفاظ على البيانات الكاملة';

COMMENT ON COLUMN vehicle_snapshots.makes_models IS 
    'Array of detected vehicle makes and models with confidence scores / مصفوفة من ماركات وموديلات المركبات المكتشفة مع درجات الثقة';

COMMENT ON COLUMN vehicle_snapshots.colors IS 
    'Array of detected vehicle colors with confidence scores / مصفوفة من ألوان المركبات المكتشفة مع درجات الثقة';

-- Example queries for reference
-- أمثلة على الاستعلامات للمرجع

-- Find all snapshots with a specific plate
-- البحث عن جميع اللقطات بلوحة محددة
-- SELECT * FROM vehicle_snapshots WHERE plate_text = 'ABC123';

-- Find snapshots by make/model
-- البحث عن اللقطات حسب الماركة/الموديل
-- SELECT * FROM vehicle_snapshots 
-- WHERE makes_models @> '[{"make": "Toyota"}]'::jsonb;

-- Find snapshots by color
-- البحث عن اللقطات حسب اللون
-- SELECT * FROM vehicle_snapshots 
-- WHERE colors @> '[{"color": "white"}]'::jsonb;

-- Get recent snapshots
-- الحصول على اللقطات الأخيرة
-- SELECT * FROM vehicle_snapshots 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- Count snapshots per plate
-- عد اللقطات لكل لوحة
-- SELECT plate_text, COUNT(*) as snapshot_count
-- FROM vehicle_snapshots
-- WHERE plate_text IS NOT NULL
-- GROUP BY plate_text
-- ORDER BY snapshot_count DESC;
