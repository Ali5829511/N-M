/**
 * API Server with Neon PostgreSQL Database
 * نظام المرور - Traffic Management System API
 * @version 2.0.0
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { NeonDatabase } from './database/neon-db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize database
let db;
try {
    db = new NeonDatabase();
    console.log('✅ Database connection initialized');
} catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Running in fallback mode - using localStorage only');
}

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static('.'));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ============ API Routes ============

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: db ? 'connected' : 'fallback',
        timestamp: new Date().toISOString()
    });
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const users = await db.getUsers();
        
        // Remove sensitive data
        const sanitizedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            createdDate: user.created_date,
            lastLogin: user.last_login
        }));
        
        res.json(sanitizedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by username
app.get('/api/users/:username', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const user = await db.getUserByUsername(req.params.username);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Remove sensitive data
        const { password, temp_password, ...sanitizedUser } = user;
        
        res.json(sanitizedUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create user
app.post('/api/users', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const user = await db.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const user = await db.updateUser(req.params.id, req.body);
        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Get all violations
app.get('/api/violations', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const filters = {
            plateNumber: req.query.plate,
            status: req.query.status,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };
        
        const violations = await db.getViolations(filters);
        res.json(violations);
    } catch (error) {
        console.error('Error fetching violations:', error);
        res.status(500).json({ error: 'Failed to fetch violations' });
    }
});

// Get violation by ID
app.get('/api/violations/:id', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const [violation] = await db.sql`
            SELECT * FROM violations WHERE id = ${req.params.id}
        `;
        
        if (!violation) {
            return res.status(404).json({ error: 'Violation not found' });
        }
        
        res.json(violation);
    } catch (error) {
        console.error('Error fetching violation:', error);
        res.status(500).json({ error: 'Failed to fetch violation' });
    }
});

// Create violation
app.post('/api/violations', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const violation = await db.createViolation(req.body);
        
        // Log activity
        if (req.body.recordedBy) {
            await db.logActivity(
                req.body.recordedBy,
                'CREATE_VIOLATION',
                `Created violation ${violation.violation_number}`,
                'violation',
                violation.id
            );
        }
        
        res.status(201).json(violation);
    } catch (error) {
        console.error('Error creating violation:', error);
        res.status(500).json({ error: 'Failed to create violation' });
    }
});

// Get vehicle by plate number
app.get('/api/vehicles/:plateNumber', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const vehicle = await db.getVehicleByPlate(req.params.plateNumber);
        
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        
        res.json(vehicle);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
});

// Initialize database (setup endpoint - should be protected in production)
app.post('/api/setup/initialize', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        // Check if this is the first run
        const users = await db.getUsers();
        if (users.length > 0) {
            return res.status(400).json({ 
                error: 'Database already initialized',
                message: 'Users already exist in the database'
            });
        }
        
        // This would require crypto-utils to be available server-side
        // For now, return instructions
        res.json({
            message: 'Run database/schema.sql first, then use the admin panel to create users',
            sqlFile: 'database/schema.sql'
        });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ error: 'Failed to initialize database' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log('━'.repeat(60));
    console.log('🚀 نظام المرور - Traffic Management System');
    console.log('━'.repeat(60));
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log(`✅ API available at: http://localhost:${PORT}/api`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Database: ${db ? 'Neon PostgreSQL ✅' : 'Fallback mode ⚠️'}`);
    console.log('━'.repeat(60));
    console.log('📖 API Documentation:');
    console.log('   GET  /api/users - Get all users');
    console.log('   GET  /api/users/:username - Get user by username');
    console.log('   POST /api/users - Create new user');
    console.log('   GET  /api/violations - Get all violations');
    console.log('   POST /api/violations - Create new violation');
    console.log('   GET  /api/vehicles/:plate - Get vehicle by plate');
    console.log('━'.repeat(60));
});

export default app;
