-- Plate Recognizer Snapshot Database Schema
-- مخطط قاعدة بيانات لقطات التعرف على اللوحات

-- Enable UUID extension
-- تفعيل امتداد UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vehicle Snapshots Table
-- جدول لقطات المركبات
CREATE TABLE IF NOT EXISTS vehicle_snapshots (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Snapshot identification
    snapshot_ref VARCHAR(100) UNIQUE NOT NULL,
    camera_id VARCHAR(50),
    captured_at TIMESTAMPTZ NOT NULL,
    
    -- Plate information
    plate_text VARCHAR(50),
    plate_confidence DECIMAL(5, 4),  -- 0.0 to 1.0
    
    -- Vehicle information (stored as JSONB for flexibility)
    makes_models JSONB,  -- Array of {make/model: string, confidence: float}
    colors JSONB,        -- Array of {color: string, confidence: float}
    bbox JSONB,          -- Bounding box coordinates {xmin, ymin, xmax, ymax}
    
    -- Raw API response (for future reference and data mining)
    raw_response JSONB NOT NULL,
    
    -- Image data
    image_url TEXT,                    -- Original URL if available
    image_data BYTEA NOT NULL,         -- Image bytes (WARNING: increases DB size!)
    image_mime VARCHAR(50) NOT NULL,   -- MIME type (image/jpeg, image/png, etc.)
    image_size INTEGER NOT NULL,       -- Size in bytes
    image_sha256 VARCHAR(64) UNIQUE NOT NULL,  -- SHA256 hash for deduplication
    
    -- Additional metadata
    meta JSONB,  -- Additional metadata (processing info, etc.)
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
-- إنشاء الفهارس للأداء

-- Index on plate text for quick lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_plate_text 
ON vehicle_snapshots(plate_text);

-- Index on captured timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_captured_at 
ON vehicle_snapshots(captured_at DESC);

-- Index on creation timestamp
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_created_at 
ON vehicle_snapshots(created_at DESC);

-- GIN index on makes_models for JSON queries
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_makes_models 
ON vehicle_snapshots USING GIN (makes_models);

-- GIN index on colors for JSON queries
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_colors 
ON vehicle_snapshots USING GIN (colors);

-- Index on image SHA256 for deduplication checks
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_image_sha256 
ON vehicle_snapshots(image_sha256);

-- Index on camera_id for filtering by camera
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_camera_id 
ON vehicle_snapshots(camera_id);

-- Comments for documentation
-- تعليقات للتوثيق

COMMENT ON TABLE vehicle_snapshots IS 'Stores vehicle snapshots from Plate Recognizer API with embedded image data';
COMMENT ON COLUMN vehicle_snapshots.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN vehicle_snapshots.snapshot_ref IS 'Human-readable snapshot reference';
COMMENT ON COLUMN vehicle_snapshots.camera_id IS 'Camera identifier that captured the image';
COMMENT ON COLUMN vehicle_snapshots.captured_at IS 'Timestamp when the image was captured';
COMMENT ON COLUMN vehicle_snapshots.plate_text IS 'Detected license plate text';
COMMENT ON COLUMN vehicle_snapshots.plate_confidence IS 'Confidence score for plate detection (0.0 to 1.0)';
COMMENT ON COLUMN vehicle_snapshots.makes_models IS 'Detected vehicle makes and models with confidence scores';
COMMENT ON COLUMN vehicle_snapshots.colors IS 'Detected vehicle colors with confidence scores';
COMMENT ON COLUMN vehicle_snapshots.bbox IS 'Bounding box coordinates for the detected plate';
COMMENT ON COLUMN vehicle_snapshots.raw_response IS 'Complete API response from Plate Recognizer';
COMMENT ON COLUMN vehicle_snapshots.image_url IS 'Original image URL if provided';
COMMENT ON COLUMN vehicle_snapshots.image_data IS 'Binary image data (WARNING: storing images in DB increases size significantly)';
COMMENT ON COLUMN vehicle_snapshots.image_mime IS 'MIME type of the stored image';
COMMENT ON COLUMN vehicle_snapshots.image_size IS 'Size of the image in bytes';
COMMENT ON COLUMN vehicle_snapshots.image_sha256 IS 'SHA256 hash of image for deduplication';
COMMENT ON COLUMN vehicle_snapshots.meta IS 'Additional metadata (processing info, source, etc.)';
COMMENT ON COLUMN vehicle_snapshots.created_at IS 'Record creation timestamp';

-- Example queries
-- استعلامات مثال

/*
-- Get all snapshots with high confidence plates
SELECT snapshot_ref, plate_text, plate_confidence, captured_at
FROM vehicle_snapshots
WHERE plate_confidence > 0.8
ORDER BY captured_at DESC;

-- Get snapshots for a specific plate
SELECT snapshot_ref, captured_at, plate_confidence
FROM vehicle_snapshots
WHERE plate_text = 'ABC123'
ORDER BY captured_at DESC;

-- Get snapshots with specific vehicle make
SELECT snapshot_ref, plate_text, makes_models
FROM vehicle_snapshots
WHERE makes_models @> '[{"make": "Toyota"}]'::jsonb;

-- Get image from database (converts bytea to base64)
SELECT 
    snapshot_ref,
    plate_text,
    image_mime,
    encode(image_data, 'base64') as image_base64
FROM vehicle_snapshots
WHERE id = 'your-uuid-here';

-- Database size monitoring
SELECT 
    pg_size_pretty(pg_total_relation_size('vehicle_snapshots')) as total_size,
    pg_size_pretty(pg_relation_size('vehicle_snapshots')) as table_size,
    pg_size_pretty(pg_indexes_size('vehicle_snapshots')) as indexes_size;

-- Count and average image size
SELECT 
    COUNT(*) as total_snapshots,
    pg_size_pretty(AVG(image_size)::bigint) as avg_image_size,
    pg_size_pretty(SUM(image_size)) as total_images_size
FROM vehicle_snapshots;
*/
