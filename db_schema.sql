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
  image_data bytea,
  image_mime text,
  image_size bigint,
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
CREATE INDEX IF NOT EXISTS idx_vehicle_plate_jsonb ON vehicle_snapshots USING gin (makes_models);
CREATE INDEX IF NOT EXISTS idx_vehicle_image_sha256 ON vehicle_snapshots (image_sha256);
