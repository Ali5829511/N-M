/**
 * Neon PostgreSQL Database Connection
 * @version 1.0.0
 */

import { neon } from '@neondatabase/serverless';

/**
 * Initialize Neon database connection
 * Uses DATABASE_URL or NETLIFY_DATABASE_URL from environment variables
 */
export function createDatabaseConnection() {
    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL or NETLIFY_DATABASE_URL not found in environment variables');
        throw new Error('Database URL not configured');
    }
    
    const sql = neon(databaseUrl);
    console.log('✅ Neon database connection initialized');
    
    return sql;
}

/**
 * Database helper class
 */
export class NeonDatabase {
    constructor() {
        this.sql = createDatabaseConnection();
    }
    
    /**
     * Get all users
     */
    async getUsers() {
        try {
            const users = await this.sql`
                SELECT id, username, name, email, role, status, 
                       require_password_change, created_date, last_login
                FROM users
                WHERE status != 'deleted'
                ORDER BY id
            `;
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }
    
    /**
     * Get user by username
     */
    async getUserByUsername(username) {
        try {
            const [user] = await this.sql`
                SELECT * FROM users 
                WHERE username = ${username} AND status = 'active'
            `;
            return user || null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
    
    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        try {
            const [user] = await this.sql`
                SELECT * FROM users 
                WHERE email = ${email} AND status = 'active'
            `;
            return user || null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
    
    /**
     * Create new user
     */
    async createUser(userData) {
        try {
            const [user] = await this.sql`
                INSERT INTO users (
                    username, password, name, email, role, status,
                    require_password_change, temp_password, created_date
                )
                VALUES (
                    ${userData.username},
                    ${userData.password},
                    ${userData.name},
                    ${userData.email},
                    ${userData.role},
                    ${userData.status || 'active'},
                    ${userData.requirePasswordChange || false},
                    ${userData.tempPassword || null},
                    ${userData.createdDate || new Date().toISOString()}
                )
                RETURNING id, username, name, email, role, status, created_date
            `;
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    
    /**
     * Update user
     */
    async updateUser(userId, updates) {
        try {
            const setClauses = [];
            const values = [];
            
            Object.keys(updates).forEach((key) => {
                setClauses.push(`${key} = $${values.length + 1}`);
                values.push(updates[key]);
            });
            
            const [user] = await this.sql`
                UPDATE users 
                SET ${this.sql(updates)}
                WHERE id = ${userId}
                RETURNING id, username, name, email, role, status
            `;
            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    
    /**
     * Update user password
     */
    async updatePassword(userId, hashedPassword, tempPassword = null) {
        try {
            await this.sql`
                UPDATE users 
                SET password = ${hashedPassword},
                    temp_password = ${tempPassword},
                    password_reset_date = ${new Date().toISOString()}
                WHERE id = ${userId}
            `;
            return true;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }
    
    /**
     * Get all violations
     */
    async getViolations(filters = {}) {
        try {
            let query = this.sql`SELECT * FROM violations WHERE 1=1`;
            
            if (filters.plateNumber) {
                query = this.sql`${query} AND plate_number = ${filters.plateNumber}`;
            }
            
            if (filters.status) {
                query = this.sql`${query} AND status = ${filters.status}`;
            }
            
            if (filters.startDate) {
                query = this.sql`${query} AND violation_date >= ${filters.startDate}`;
            }
            
            if (filters.endDate) {
                query = this.sql`${query} AND violation_date <= ${filters.endDate}`;
            }
            
            const violations = await query;
            return violations;
        } catch (error) {
            console.error('Error fetching violations:', error);
            throw error;
        }
    }
    
    /**
     * Create new violation
     */
    async createViolation(violationData) {
        try {
            const [violation] = await this.sql`
                INSERT INTO violations (
                    violation_number, plate_number, violation_type,
                    violation_date, violation_time, location,
                    driver_name, driver_id, vehicle_type, vehicle_color,
                    fine_amount, status, notes, recorded_by
                )
                VALUES (
                    ${violationData.violationNumber},
                    ${violationData.plateNumber},
                    ${violationData.violationType},
                    ${violationData.violationDate},
                    ${violationData.violationTime},
                    ${violationData.location || null},
                    ${violationData.driverName || null},
                    ${violationData.driverId || null},
                    ${violationData.vehicleType || null},
                    ${violationData.vehicleColor || null},
                    ${violationData.fineAmount || 0},
                    ${violationData.status || 'pending'},
                    ${violationData.notes || null},
                    ${violationData.recordedBy || null}
                )
                RETURNING *
            `;
            
            // Update vehicle violation count
            await this.updateVehicleViolationCount(violationData.plateNumber);
            
            return violation;
        } catch (error) {
            console.error('Error creating violation:', error);
            throw error;
        }
    }
    
    /**
     * Get vehicle by plate number
     */
    async getVehicleByPlate(plateNumber) {
        try {
            const [vehicle] = await this.sql`
                SELECT * FROM vehicles 
                WHERE plate_number = ${plateNumber}
            `;
            return vehicle || null;
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            throw error;
        }
    }
    
    /**
     * Update vehicle violation count
     */
    async updateVehicleViolationCount(plateNumber) {
        try {
            await this.sql`
                UPDATE vehicles 
                SET violation_count = (
                    SELECT COUNT(*) FROM violations 
                    WHERE plate_number = ${plateNumber}
                ),
                total_fines = (
                    SELECT COALESCE(SUM(fine_amount), 0) FROM violations 
                    WHERE plate_number = ${plateNumber} AND status != 'cancelled'
                )
                WHERE plate_number = ${plateNumber}
            `;
        } catch (error) {
            console.error('Error updating vehicle count:', error);
            // Don't throw, just log - this is not critical
        }
    }
    
    /**
     * Log activity
     */
    async logActivity(userId, actionType, description, targetType = null, targetId = null) {
        try {
            await this.sql`
                INSERT INTO activity_log (
                    user_id, action_type, action_description,
                    target_type, target_id
                )
                VALUES (
                    ${userId},
                    ${actionType},
                    ${description},
                    ${targetType},
                    ${targetId}
                )
            `;
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw - logging failures shouldn't break the app
        }
    }
    
    /**
     * Initialize default users (run once)
     */
    async initializeDefaultUsers(CryptoUtils) {
        try {
            // Check if users already exist
            const existingUsers = await this.getUsers();
            if (existingUsers.length > 0) {
                console.log('✅ Users already exist, skipping initialization');
                return;
            }
            
            console.log('🔐 Creating default users...');
            
            // Generate secure passwords
            const adminPassword = CryptoUtils.generateSecurePassword(16);
            const violationsPassword = CryptoUtils.generateSecurePassword(16);
            const inquiryPassword = CryptoUtils.generateSecurePassword(16);
            
            // Hash passwords
            const hashedAdminPassword = await CryptoUtils.hashPassword(adminPassword);
            const hashedViolationsPassword = await CryptoUtils.hashPassword(violationsPassword);
            const hashedInquiryPassword = await CryptoUtils.hashPassword(inquiryPassword);
            
            // Create users
            const defaultUsers = [
                {
                    username: 'admin',
                    password: hashedAdminPassword,
                    name: 'مدير النظام',
                    email: 'aliayashi522@gmail.com',
                    role: 'admin',
                    status: 'active',
                    requirePasswordChange: true,
                    tempPassword: adminPassword
                },
                {
                    username: 'violations_officer',
                    password: hashedViolationsPassword,
                    name: 'مسؤول المخالفات',
                    email: 'violations@university.edu.sa',
                    role: 'violation_entry',
                    status: 'active',
                    requirePasswordChange: true,
                    tempPassword: violationsPassword
                },
                {
                    username: 'inquiry_user',
                    password: hashedInquiryPassword,
                    name: 'موظف الاستعلام',
                    email: 'inquiry@university.edu.sa',
                    role: 'inquiry',
                    status: 'active',
                    requirePasswordChange: true,
                    tempPassword: inquiryPassword
                }
            ];
            
            for (const userData of defaultUsers) {
                await this.createUser(userData);
            }
            
            // Log passwords for first time setup
            console.log('🔐 تم إنشاء المستخدمين بكلمات مرور آمنة:');
            console.log('━'.repeat(60));
            console.log('👤 admin:', adminPassword);
            console.log('👤 violations_officer:', violationsPassword);
            console.log('👤 inquiry_user:', inquiryPassword);
            console.log('━'.repeat(60));
            console.log('⚠️ احفظ هذه الكلمات في مكان آمن!');
            
            return true;
        } catch (error) {
            console.error('Error initializing default users:', error);
            throw error;
        }
    }
}

export default NeonDatabase;
