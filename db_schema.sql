-- إنشاء جدول لتخزين نتائج snapshot من Plate Recognizer
-- افتراض استخدام PostgreSQL

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
  image_data bytea,
  image_mime text,
  image_size integer,
  image_sha256 text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_plate_text ON vehicle_snapshots (plate_text);
CREATE INDEX IF NOT EXISTS idx_vehicle_created_at ON vehicle_snapshots (created_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_plate_jsonb ON vehicle_snapshots USING gin (makes_models);
CREATE INDEX IF NOT EXISTS idx_vehicle_image_sha256 ON vehicle_snapshots (image_sha256);
