-- إنشاء جدول لتخزين نتائج snapshot من Plate Recognizer
-- Create table for storing Plate Recognizer snapshot results
-- 
-- Database: PostgreSQL 12+
-- Features:
--   - UUID primary keys
--   - JSONB for structured data (makes/models, colors, bbox)
--   - Optional image storage in database (bytea)
--   - Image metadata (SHA256, MIME type, size)
--   - Full API response storage
--   - GIN indexes for JSONB fields

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
  
  -- Option 2: Store image directly in DB (for STORE_IMAGES=db mode)
  image_data bytea,
  
  -- Image metadata
  image_mime text,           -- MIME type (e.g., 'image/jpeg', 'image/png')
  image_size integer,        -- Size in bytes
  image_sha256 text,         -- SHA256 hash for deduplication and integrity
  
  -- Additional metadata
  meta jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for common queries

-- Index on plate text for searching by license plate
CREATE INDEX IF NOT EXISTS idx_vehicle_plate_text ON vehicle_snapshots (plate_text);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_vehicle_created_at ON vehicle_snapshots (created_at);

-- Index on captured_at for snapshot time queries
CREATE INDEX IF NOT EXISTS idx_vehicle_captured_at ON vehicle_snapshots (captured_at);

-- GIN index on makes_models for JSONB queries
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_models_jsonb ON vehicle_snapshots USING gin (makes_models);

-- GIN index on colors for JSONB queries
CREATE INDEX IF NOT EXISTS idx_vehicle_colors_jsonb ON vehicle_snapshots USING gin (colors);

-- Index on image_sha256 for deduplication checks
CREATE INDEX IF NOT EXISTS idx_vehicle_image_sha256 ON vehicle_snapshots (image_sha256);

-- Index on snapshot_ref for reference lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshot_ref ON vehicle_snapshots (snapshot_ref);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicle_snapshots_updated_at BEFORE UPDATE
    ON vehicle_snapshots FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE vehicle_snapshots IS 'Stores vehicle snapshot data from Plate Recognizer API';
COMMENT ON COLUMN vehicle_snapshots.snapshot_ref IS 'Reference ID from API or custom reference';
COMMENT ON COLUMN vehicle_snapshots.image_data IS 'Optional: store image bytes directly in DB (when STORE_IMAGES=db)';
COMMENT ON COLUMN vehicle_snapshots.image_url IS 'URL to image in S3 or external storage (when STORE_IMAGES=s3)';
COMMENT ON COLUMN vehicle_snapshots.image_sha256 IS 'SHA256 hash of image for integrity and deduplication';
