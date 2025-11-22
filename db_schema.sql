-- Database schema for storing Plate Recognizer Snapshot results
-- PostgreSQL with support for S3 or database image storage

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS vehicle_snapshots (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  snapshot_ref text,
  camera_id text,
  captured_at timestamptz,
  plate_text text,
  plate_confidence numeric,
  makes_models jsonb,
  colors jsonb,
  bbox jsonb,
  raw_response jsonb,
  image_url text,
  image_data bytea,              -- Image bytes (nullable, only used when STORE_IMAGES=db)
  image_mime text,               -- MIME type (e.g., 'image/jpeg')
  image_size integer,            -- Image size in bytes
  image_sha256 text,             -- SHA256 hash of image (for deduplication)
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vehicle_plate_text ON vehicle_snapshots (plate_text);
CREATE INDEX IF NOT EXISTS idx_vehicle_created_at ON vehicle_snapshots (created_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_models_jsonb ON vehicle_snapshots USING gin (makes_models);
CREATE INDEX IF NOT EXISTS idx_vehicle_image_sha256 ON vehicle_snapshots (image_sha256);

-- Comments for documentation
COMMENT ON TABLE vehicle_snapshots IS 'Stores vehicle snapshot data from Plate Recognizer API';
COMMENT ON COLUMN vehicle_snapshots.image_data IS 'Image bytes - only populated when STORE_IMAGES=db, otherwise NULL';
COMMENT ON COLUMN vehicle_snapshots.image_url IS 'S3 URL when STORE_IMAGES=s3, or original URL reference';
COMMENT ON COLUMN vehicle_snapshots.image_sha256 IS 'SHA256 hash for image deduplication and verification';
