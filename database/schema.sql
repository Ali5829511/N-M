-- نظام المرور - Traffic Management System Database Schema
-- Neon PostgreSQL Database Schema

-- جدول المستخدمين - Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'violation_entry', 'inquiry')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    require_password_change BOOLEAN DEFAULT false,
    temp_password VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    password_reset_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المخالفات - Violations Table
CREATE TABLE IF NOT EXISTS violations (
    id SERIAL PRIMARY KEY,
    violation_number VARCHAR(50) UNIQUE NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    violation_date DATE NOT NULL,
    violation_time TIME NOT NULL,
    location VARCHAR(200),
    driver_name VARCHAR(100),
    driver_id VARCHAR(20),
    vehicle_type VARCHAR(50),
    vehicle_color VARCHAR(50),
    fine_amount DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'appealed')),
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الملصقات - Stickers Table
CREATE TABLE IF NOT EXISTS stickers (
    id SERIAL PRIMARY KEY,
    sticker_number VARCHAR(50) UNIQUE NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    sticker_type VARCHAR(50),
    vehicle_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المركبات - Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    owner_name VARCHAR(100),
    vehicle_type VARCHAR(50),
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_color VARCHAR(50),
    vehicle_year INTEGER,
    registration_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'immobilized', 'blacklisted')),
    violation_count INTEGER DEFAULT 0,
    total_fines DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    gps_location VARCHAR(200),
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول السيارات المحجوزة - Immobilized Cars Table
CREATE TABLE IF NOT EXISTS immobilized_cars (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    immobilization_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT NOT NULL,
    location VARCHAR(200),
    released_date TIMESTAMP,
    released_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'immobilized' CHECK (status IN ('immobilized', 'released')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول سجل الأنشطة - Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    target_type VARCHAR(50),
    target_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء الفهارس للأداء - Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_violations_plate ON violations(plate_number);
CREATE INDEX IF NOT EXISTS idx_violations_date ON violations(violation_date);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_stickers_plate ON stickers(plate_number);
CREATE INDEX IF NOT EXISTS idx_stickers_status ON stickers(status);
CREATE INDEX IF NOT EXISTS idx_immobilized_plate ON immobilized_cars(plate_number);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(created_at);

-- دالة تحديث updated_at تلقائياً - Auto-update updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على الجداول - Apply function to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_violations_updated_at ON violations;
CREATE TRIGGER update_violations_updated_at BEFORE UPDATE ON violations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stickers_updated_at ON stickers;
CREATE TRIGGER update_stickers_updated_at BEFORE UPDATE ON stickers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_immobilized_cars_updated_at ON immobilized_cars;
CREATE TRIGGER update_immobilized_cars_updated_at BEFORE UPDATE ON immobilized_cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إضافة بيانات تجريبية للمستخدمين الافتراضيين (يتم تشغيلها مرة واحدة فقط)
-- Default users will be created by the application with hashed passwords
