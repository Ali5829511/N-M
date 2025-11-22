-- Plate Recognizer Snapshot Database Schema
-- ============================================
-- This schema creates the necessary tables and indexes for storing
-- vehicle snapshot data from Plate Recognizer API

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vehicle_snapshots table
CREATE TABLE IF NOT EXISTS vehicle_snapshots (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Snapshot reference from API
    snapshot_ref VARCHAR(255),
    
    -- Camera identifier
    camera_id VARCHAR(100),
    
    -- Timestamp when the image was captured
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- License plate information
    plate_text VARCHAR(50),
    plate_confidence DECIMAL(5, 4),
    
    -- Vehicle make and model information (JSONB array)
    -- Format: [{"make": "Toyota", "model": "Camry", "confidence": 0.95}, ...]
    makes_models JSONB DEFAULT '[]'::jsonb,
    
    -- Vehicle color information (JSONB array)
    -- Format: [{"color": "silver", "confidence": 0.89}, ...]
    colors JSONB DEFAULT '[]'::jsonb,
    
    -- Bounding box coordinates (JSONB object)
    -- Format: {"xmin": 100, "ymin": 200, "xmax": 300, "ymax": 400}
    bbox JSONB DEFAULT '{}'::jsonb,
    
    -- Full raw API response (JSONB)
    raw_response JSONB NOT NULL,
    
    -- Image URL (if applicable)
    image_url TEXT,
    
    -- Additional metadata (JSONB)
    -- Format: {"source": "path/to/image.jpg", "processed_at": "2024-01-01T12:00:00Z", ...}
    meta JSONB DEFAULT '{}'::jsonb,
    
    -- Record creation timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_plate_text 
    ON vehicle_snapshots(plate_text);

CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_created_at 
    ON vehicle_snapshots(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vehicle_snapshots_captured_at 
    ON vehicle_snapshots(captured_at DESC);

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

-- Add comments to table and columns
COMMENT ON TABLE vehicle_snapshots IS 'Stores vehicle snapshot data from Plate Recognizer API';
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
COMMENT ON COLUMN vehicle_snapshots.image_url IS 'URL of the processed image (if applicable)';
COMMENT ON COLUMN vehicle_snapshots.meta IS 'Additional metadata about the processing';
COMMENT ON COLUMN vehicle_snapshots.created_at IS 'Timestamp when the record was created in the database';

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
