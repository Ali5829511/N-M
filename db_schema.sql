-- Plate Recognizer Snapshot Database Schema
-- ============================================
-- This schema creates the necessary tables and indexes for storing
-- vehicle snapshot data from Plate Recognizer API
-- Supports storing images in S3 or database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vehicle_snapshots table
CREATE TABLE IF NOT EXISTS vehicle_snapshots (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Snapshot reference from API
    snapshot_ref TEXT,
    
    -- Camera identifier
    camera_id TEXT,
    
    -- Timestamp when the image was captured
    captured_at TIMESTAMP WITH TIME ZONE,
    
    -- License plate information
    plate_text TEXT,
    plate_confidence NUMERIC,
    
    -- Vehicle make and model information (JSONB array)
    -- Format: [{"make": "Toyota", "model": "Camry", "confidence": 0.95}, ...]
    makes_models JSONB,
    
    -- Vehicle color information (JSONB array)
    -- Format: [{"color": "silver", "confidence": 0.89}, ...]
    colors JSONB,
    
    -- Bounding box coordinates (JSONB object)
    -- Format: {"xmin": 100, "ymin": 200, "xmax": 300, "ymax": 400}
    bbox JSONB,
    
    -- Full raw API response (JSONB)
    raw_response JSONB,
    
    -- Image storage options
    -- Option 1: URL to image (S3 or external)
    image_url TEXT,
    
    -- Option 2: Store image in database (used when STORE_IMAGES=db)
    image_data BYTEA,  -- NULLABLE: binary image data
    image_mime TEXT,   -- MIME type (e.g., image/jpeg)
    image_size INTEGER, -- Image size in bytes
    image_sha256 TEXT,  -- SHA256 hash for deduplication
    
    -- Additional metadata (JSONB)
    -- Format: {"source": "path/to/image.jpg", "processed_at": "2024-01-01T12:00:00Z", ...}
    meta JSONB,
    
    -- Record timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance

-- Index on plate_text for license plate lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_plate_text 
    ON vehicle_snapshots(plate_text);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_created_at 
    ON vehicle_snapshots(created_at DESC);

-- Index on captured_at for when the image was captured
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_captured_at 
    ON vehicle_snapshots(captured_at DESC);

-- Index on camera_id for camera-specific queries
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_camera_id 
    ON vehicle_snapshots(camera_id);

-- GIN index for efficient JSONB queries on makes_models
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_makes_models 
    ON vehicle_snapshots USING GIN (makes_models);

-- GIN index for efficient JSONB queries on colors
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_colors 
    ON vehicle_snapshots USING GIN (colors);

-- GIN index for efficient JSONB queries on raw_response
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_raw_response 
    ON vehicle_snapshots USING GIN (raw_response);

-- Index on image_sha256 for deduplication
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_image_sha256 
    ON vehicle_snapshots(image_sha256);

-- Add comments to table and columns
COMMENT ON TABLE vehicle_snapshots IS 'Stores vehicle snapshot data from Plate Recognizer API with support for S3 or database image storage';
COMMENT ON COLUMN vehicle_snapshots.id IS 'Unique identifier for each snapshot record';
COMMENT ON COLUMN vehicle_snapshots.snapshot_ref IS 'Reference ID from Plate Recognizer API';
COMMENT ON COLUMN vehicle_snapshots.camera_id IS 'Identifier for the camera that captured the image';
COMMENT ON COLUMN vehicle_snapshots.captured_at IS 'Timestamp when the image was captured';
COMMENT ON COLUMN vehicle_snapshots.plate_text IS 'Recognized license plate number';
COMMENT ON COLUMN vehicle_snapshots.plate_confidence IS 'Confidence score for plate recognition (0-1)';
COMMENT ON COLUMN vehicle_snapshots.makes_models IS 'Array of vehicle make/model predictions with confidence scores';
COMMENT ON COLUMN vehicle_snapshots.colors IS 'Array of vehicle color predictions with confidence scores';
COMMENT ON COLUMN vehicle_snapshots.bbox IS 'Bounding box coordinates for the detected plate';
COMMENT ON COLUMN vehicle_snapshots.raw_response IS 'Complete raw JSON response from Plate Recognizer API';
COMMENT ON COLUMN vehicle_snapshots.image_url IS 'URL of the processed image (S3 or external)';
COMMENT ON COLUMN vehicle_snapshots.image_data IS 'Binary image data (used when STORE_IMAGES=db)';
COMMENT ON COLUMN vehicle_snapshots.image_mime IS 'MIME type of the stored image';
COMMENT ON COLUMN vehicle_snapshots.image_size IS 'Size of the image in bytes';
COMMENT ON COLUMN vehicle_snapshots.image_sha256 IS 'SHA256 hash of the image for deduplication';
COMMENT ON COLUMN vehicle_snapshots.meta IS 'Additional metadata about the processing';
COMMENT ON COLUMN vehicle_snapshots.created_at IS 'Timestamp when the record was created in the database';
COMMENT ON COLUMN vehicle_snapshots.updated_at IS 'Timestamp when the record was last updated';

-- Sample query examples (commented out)
-- 
-- -- Get all snapshots for a specific plate
-- SELECT * FROM vehicle_snapshots WHERE plate_text = 'ABC123' ORDER BY created_at DESC;
-- 
-- -- Get all Toyota vehicles
-- SELECT * FROM vehicle_snapshots WHERE makes_models @> '[{"make": "Toyota"}]';
-- 
-- -- Get all snapshots from a specific camera
-- SELECT * FROM vehicle_snapshots WHERE camera_id = 'camera_001' ORDER BY captured_at DESC;
-- 
-- -- Get snapshots with high confidence plates
-- SELECT plate_text, plate_confidence, captured_at 
-- FROM vehicle_snapshots 
-- WHERE plate_confidence > 0.90 
-- ORDER BY plate_confidence DESC;
--
-- -- Get all silver vehicles
-- SELECT * FROM vehicle_snapshots WHERE colors @> '[{"color": "silver"}]';
--
-- -- Find duplicate images by SHA256
-- SELECT image_sha256, COUNT(*) 
-- FROM vehicle_snapshots 
-- WHERE image_sha256 IS NOT NULL 
-- GROUP BY image_sha256 
-- HAVING COUNT(*) > 1;
