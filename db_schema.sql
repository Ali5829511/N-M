<<<<<<< HEAD
-- Database Schema for Plate Recognizer Snapshot Integration
-- مخطط قاعدة البيانات لدمج نظام التعرف على اللوحات

-- Enable UUID extension
-- تفعيل امتداد UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vehicle_snapshots table
-- إنشاء جدول لقطات المركبات
CREATE TABLE IF NOT EXISTS vehicle_snapshots (
    -- Primary key with UUID
    -- المفتاح الأساسي بصيغة UUID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Snapshot reference ID (custom identifier)
    -- معرف مرجعي للقطة
    snapshot_ref VARCHAR(255),
    
    -- Camera identifier
    -- معرف الكاميرا
    camera_id VARCHAR(100),
    
    -- Timestamp when the image was captured
    -- وقت التقاط الصورة
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Detected plate text
    -- نص اللوحة المكتشف
    plate_text VARCHAR(50),
    
    -- Confidence score for plate detection (0.0 to 1.0)
    -- درجة الثقة في الكشف (من 0.0 إلى 1.0)
    plate_confidence DECIMAL(5, 4),
    
    -- Vehicle makes and models (JSONB for flexibility)
    -- العلامات التجارية وموديلات المركبات
    makes_models JSONB DEFAULT '[]'::jsonb,
    
    -- Vehicle colors (JSONB for multiple colors)
    -- ألوان المركبة
    colors JSONB DEFAULT '[]'::jsonb,
    
    -- Bounding box coordinates (JSONB)
    -- إحداثيات الصندوق المحيط
    bbox JSONB,
    
    -- Full raw API response (JSONB)
    -- الاستجابة الكاملة من API
    raw_response JSONB,
    
    -- Original image URL (if applicable)
    -- رابط الصورة الأصلي (إن وجد)
    image_url TEXT,
    
    -- Additional metadata (JSONB for flexibility)
    -- بيانات وصفية إضافية
    meta JSONB DEFAULT '{}'::jsonb,
    
    -- Record creation timestamp
    -- وقت إنشاء السجل
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
-- إنشاء فهارس لتحسين أداء الاستعلامات

-- Index on plate_text for fast plate lookups
-- فهرس على نص اللوحة للبحث السريع
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_plate_text 
ON vehicle_snapshots(plate_text);

-- Index on created_at for time-based queries
-- فهرس على وقت الإنشاء للاستعلامات الزمنية
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_created_at 
ON vehicle_snapshots(created_at DESC);

-- Index on captured_at for chronological queries
-- فهرس على وقت التقاط الصورة للاستعلامات الزمنية
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_captured_at 
ON vehicle_snapshots(captured_at DESC);

-- GIN index on makes_models for JSONB queries
-- فهرس GIN على موديلات المركبات لاستعلامات JSONB
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_makes_models 
ON vehicle_snapshots USING GIN (makes_models);

-- GIN index on colors for JSONB queries
-- فهرس GIN على الألوان لاستعلامات JSONB
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_colors 
ON vehicle_snapshots USING GIN (colors);

-- GIN index on meta for flexible metadata queries
-- فهرس GIN على البيانات الوصفية للاستعلامات المرنة
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_meta 
ON vehicle_snapshots USING GIN (meta);

-- Index on camera_id for camera-specific queries
-- فهرس على معرف الكاميرا
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_camera_id 
ON vehicle_snapshots(camera_id);

-- Index on plate_confidence for filtering high-confidence detections
-- فهرس على درجة الثقة لتصفية الكشوفات عالية الثقة
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_confidence 
ON vehicle_snapshots(plate_confidence DESC);

-- Add comments to table and columns
-- إضافة تعليقات على الجدول والأعمدة
COMMENT ON TABLE vehicle_snapshots IS 
'Stores vehicle snapshot data from Plate Recognizer Snapshot API - يخزن بيانات لقطات المركبات من API التعرف على اللوحات';

COMMENT ON COLUMN vehicle_snapshots.id IS 
'Unique identifier (UUID) - المعرف الفريد';

COMMENT ON COLUMN vehicle_snapshots.snapshot_ref IS 
'Custom reference ID for the snapshot - معرف مرجعي مخصص للقطة';

COMMENT ON COLUMN vehicle_snapshots.camera_id IS 
'Camera identifier - معرف الكاميرا';

COMMENT ON COLUMN vehicle_snapshots.captured_at IS 
'Timestamp when image was captured - وقت التقاط الصورة';

COMMENT ON COLUMN vehicle_snapshots.plate_text IS 
'Detected license plate text - نص اللوحة المكتشف';

COMMENT ON COLUMN vehicle_snapshots.plate_confidence IS 
'Confidence score (0.0-1.0) - درجة الثقة';

COMMENT ON COLUMN vehicle_snapshots.makes_models IS 
'Vehicle makes and models (JSONB) - العلامات التجارية والموديلات';

COMMENT ON COLUMN vehicle_snapshots.colors IS 
'Vehicle colors (JSONB) - ألوان المركبة';

COMMENT ON COLUMN vehicle_snapshots.bbox IS 
'Bounding box coordinates (JSONB) - إحداثيات الصندوق المحيط';

COMMENT ON COLUMN vehicle_snapshots.raw_response IS 
'Full API response (JSONB) - الاستجابة الكاملة من API';

COMMENT ON COLUMN vehicle_snapshots.image_url IS 
'Original image URL - رابط الصورة الأصلي';

COMMENT ON COLUMN vehicle_snapshots.meta IS 
'Additional metadata (JSONB) - بيانات وصفية إضافية';

COMMENT ON COLUMN vehicle_snapshots.created_at IS 
'Record creation timestamp - وقت إنشاء السجل';

-- Example queries / أمثلة على الاستعلامات
-- 
-- Find all snapshots for a specific plate:
-- البحث عن جميع اللقطات للوحة معينة:
-- SELECT * FROM vehicle_snapshots WHERE plate_text = 'ABC123';
--
-- Find high-confidence detections:
-- البحث عن الكشوفات عالية الثقة:
-- SELECT * FROM vehicle_snapshots WHERE plate_confidence > 0.90;
--
-- Find snapshots from the last 24 hours:
-- البحث عن اللقطات من آخر 24 ساعة:
-- SELECT * FROM vehicle_snapshots WHERE created_at > NOW() - INTERVAL '24 hours';
--
-- Search for specific vehicle make/model:
-- البحث عن علامة تجارية أو موديل معين:
-- SELECT * FROM vehicle_snapshots WHERE makes_models @> '[{"type": "sedan"}]';
--
-- Count snapshots by camera:
-- عد اللقطات حسب الكاميرا:
-- SELECT camera_id, COUNT(*) FROM vehicle_snapshots GROUP BY camera_id;
=======
-- إنشاء جدول لتخزين نتائج snapshot من Plate Recognizer
-- افتراض استخدام PostgreSQL
-- يدعم تخزين الصور في S3 أو قاعدة البيانات

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main table for vehicle snapshot data
CREATE TABLE IF NOT EXISTS vehicle_snapshots (
  -- Primary key
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Snapshot identification
  snapshot_ref text,
  camera_id text,
  captured_at timestamptz,
  
  -- Plate information
  plate_text text,
  plate_confidence numeric,
  
  -- Vehicle information (JSONB for flexibility)
  makes_models jsonb,
  colors jsonb,
  bbox jsonb,
  
  -- Raw API response
  raw_response jsonb,
  
  -- Image storage options
  -- Option 1: URL to image (S3 or external)
  image_url text,
  image_data bytea,  -- NULLABLE: used when STORE_IMAGES=db
  image_mime text,
  image_size integer,
  image_sha256 text,
  meta jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vehicle_plate_text ON vehicle_snapshots (plate_text);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_vehicle_created_at ON vehicle_snapshots (created_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_models_jsonb ON vehicle_snapshots USING gin (makes_models);
CREATE INDEX IF NOT EXISTS idx_vehicle_image_sha256 ON vehicle_snapshots (image_sha256);
>>>>>>> origin/main
