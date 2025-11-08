/**
 * نظام إدارة قاعدة البيانات المحلية
 * Local Database Management System
 * @version 1.0.0
 * 
 * ⚠️ تحذير أمني مهم:
 * هذا النظام مصمم للتطوير والاختبار فقط!
 * 
 * في بيئة الإنتاج، يجب:
 * 1. استخدام قاعدة بيانات حقيقية (PostgreSQL, MySQL, MongoDB)
 * 2. تشفير كلمات المرور باستخدام bcrypt أو argon2
 * 3. استخدام API خلفي آمن بدلاً من localStorage
 * 4. تطبيق SSL/TLS (HTTPS)
 * 5. إضافة معالجة الأخطاء والتحقق من صحة البيانات
 * 6. تطبيق rate limiting و CSRF protection
 * 
 * 📊 للتحقق من حالة قاعدة البيانات، افتح: database_status.html
 */

class DatabaseManager {
    constructor() {
        this.dbName = 'TrafficSystemDB';
        this.version = 1;
        this.dbType = 'localStorage'; // نوع قاعدة البيانات
        this.connectionStatus = 'disconnected'; // حالة الاتصال
        this.init();
    }

    /**
     * تهيئة قاعدة البيانات
     */
    init() {
        try {
            // التحقق من دعم localStorage
            if (typeof localStorage === 'undefined') {
                console.error('localStorage غير مدعوم في هذا المتصفح');
                this.connectionStatus = 'error';
                return;
            }

            // إنشاء المستخدمين الافتراضيين إذا لم يكونوا موجودين
            if (!localStorage.getItem('users')) {
                this.initializeDefaultUsers();
            }
            
            // إنشاء جدول المخالفات إذا لم يكن موجوداً
            if (!localStorage.getItem('violations')) {
                localStorage.setItem('violations', JSON.stringify([]));
            }

            // تحديث حالة الاتصال
            this.connectionStatus = 'connected';
            console.log('✓ قاعدة البيانات متصلة بنجاح (localStorage)');
            console.log('📊 للتحقق من الحالة، افتح: database_status.html');
        } catch (error) {
            console.error('خطأ في تهيئة قاعدة البيانات:', error);
            this.connectionStatus = 'error';
        }
    }

    /**
     * الحصول على حالة الاتصال
     */
    getConnectionStatus() {
        return {
            status: this.connectionStatus,
            type: this.dbType,
            name: this.dbName,
            version: this.version,
            isConnected: this.connectionStatus === 'connected'
        };
    }

    /**
     * إنشاء المستخدمين الافتراضيين
     * 
     * ⚠️ ملاحظة: كلمات المرور مخزنة بنص عادي للتطوير فقط
     * في الإنتاج: استخدم bcrypt لتشفير كلمات المرور
     */
    initializeDefaultUsers() {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123', // ⚠️ في نظام حقيقي، يجب تشفير كلمة المرور
                name: 'مدير النظام',
                email: 'admin@university.edu.sa',
                role: 'admin',
                status: 'active',
                createdDate: new Date().toISOString().split('T')[0],
                lastLogin: new Date().toISOString()
            },
            {
                id: 2,
                username: 'violations_officer',
                password: 'violations123', // ⚠️ في نظام حقيقي، يجب تشفير كلمة المرور
                name: 'مسؤول المخالفات',
                email: 'violations@university.edu.sa',
                role: 'violation_entry',
                status: 'active',
                createdDate: new Date().toISOString().split('T')[0],
                lastLogin: new Date().toISOString()
            },
            {
                id: 3,
                username: 'inquiry_user',
                password: 'inquiry123', // ⚠️ في نظام حقيقي، يجب تشفير كلمة المرور
                name: 'موظف الاستعلام',
                email: 'inquiry@university.edu.sa',
                role: 'inquiry',
                status: 'active',
                createdDate: new Date().toISOString().split('T')[0],
                lastLogin: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        // تم إنشاء المستخدمين الافتراضيين
    }

    /**
     * الحصول على جميع المستخدمين
     */
    async getUsers() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }

    /**
     * الحصول على مستخدم بواسطة المعرف
     */
    async getUserById(id) {
        const users = await this.getUsers();
        return users.find(u => u.id === id);
    }

    /**
     * الحصول على مستخدم بواسطة اسم المستخدم
     */
    async getUserByUsername(username) {
        const users = await this.getUsers();
        return users.find(u => u.username === username);
    }

    /**
     * إضافة مستخدم جديد
     */
    async addUser(userData) {
        try {
            const users = await this.getUsers();
            
            // التحقق من عدم وجود اسم المستخدم
            if (users.some(u => u.username === userData.username)) {
                return {
                    success: false,
                    error: 'اسم المستخدم موجود بالفعل'
                };
            }
            
            // إنشاء معرف جديد
            const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            
            const newUser = {
                id: newId,
                username: userData.username,
                password: userData.password,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                status: userData.status || 'active',
                createdDate: new Date().toISOString().split('T')[0],
                lastLogin: null
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            return {
                success: true,
                user: newUser
            };
        } catch (error) {
            console.error('Error adding user:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء إضافة المستخدم'
            };
        }
    }

    /**
     * تحديث مستخدم
     */
    async updateUser(id, userData) {
        try {
            const users = await this.getUsers();
            const index = users.findIndex(u => u.id === id);
            
            if (index === -1) {
                return {
                    success: false,
                    error: 'المستخدم غير موجود'
                };
            }
            
            // التحقق من تفرد اسم المستخدم
            if (userData.username && userData.username !== users[index].username) {
                if (users.some(u => u.username === userData.username && u.id !== id)) {
                    return {
                        success: false,
                        error: 'اسم المستخدم موجود بالفعل'
                    };
                }
            }
            
            users[index] = {
                ...users[index],
                ...userData,
                id: id // الحفاظ على المعرف الأصلي
            };
            
            localStorage.setItem('users', JSON.stringify(users));
            
            return {
                success: true,
                user: users[index]
            };
        } catch (error) {
            console.error('Error updating user:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء تحديث المستخدم'
            };
        }
    }

    /**
     * حذف مستخدم
     */
    async deleteUser(id) {
        try {
            const users = await this.getUsers();
            const filteredUsers = users.filter(u => u.id !== id);
            
            if (users.length === filteredUsers.length) {
                return {
                    success: false,
                    error: 'المستخدم غير موجود'
                };
            }
            
            localStorage.setItem('users', JSON.stringify(filteredUsers));
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting user:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء حذف المستخدم'
            };
        }
    }

    /**
     * تحديث وقت آخر تسجيل دخول
     */
    async updateLastLogin(userId) {
        try {
            const users = await this.getUsers();
            const index = users.findIndex(u => u.id === userId);
            
            if (index !== -1) {
                users[index].lastLogin = new Date().toISOString();
                localStorage.setItem('users', JSON.stringify(users));
            }
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    /**
     * الحصول على جميع المخالفات
     */
    async getViolations() {
        try {
            const violations = JSON.parse(localStorage.getItem('violations') || '[]');
            return violations;
        } catch (error) {
            console.error('Error getting violations:', error);
            return [];
        }
    }

    /**
     * إضافة مخالفة جديدة
     */
    async addViolation(violationData) {
        try {
            const violations = await this.getViolations();
            
            // إنشاء معرف جديد
            const newId = violations.length > 0 ? Math.max(...violations.map(v => v.id)) + 1 : 1;
            
            const newViolation = {
                id: newId,
                ...violationData,
                createdDate: new Date().toISOString(),
                createdBy: window.authManager ? window.authManager.getCurrentUser()?.id : null
            };
            
            violations.push(newViolation);
            localStorage.setItem('violations', JSON.stringify(violations));
            
            return {
                success: true,
                violation: newViolation
            };
        } catch (error) {
            console.error('Error adding violation:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء إضافة المخالفة'
            };
        }
    }

    /**
     * تحديث مخالفة
     */
    async updateViolation(id, violationData) {
        try {
            const violations = await this.getViolations();
            const index = violations.findIndex(v => v.id === id);
            
            if (index === -1) {
                return {
                    success: false,
                    error: 'المخالفة غير موجودة'
                };
            }
            
            violations[index] = {
                ...violations[index],
                ...violationData,
                id: id,
                updatedDate: new Date().toISOString(),
                updatedBy: window.authManager ? window.authManager.getCurrentUser()?.id : null
            };
            
            localStorage.setItem('violations', JSON.stringify(violations));
            
            return {
                success: true,
                violation: violations[index]
            };
        } catch (error) {
            console.error('Error updating violation:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء تحديث المخالفة'
            };
        }
    }

    /**
     * حذف مخالفة
     */
    async deleteViolation(id) {
        try {
            const violations = await this.getViolations();
            const filteredViolations = violations.filter(v => v.id !== id);
            
            if (violations.length === filteredViolations.length) {
                return {
                    success: false,
                    error: 'المخالفة غير موجودة'
                };
            }
            
            localStorage.setItem('violations', JSON.stringify(filteredViolations));
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting violation:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء حذف المخالفة'
            };
        }
    }

    /**
     * البحث عن مخالفة برقم اللوحة
     */
    async searchViolationsByPlate(plateNumber) {
        const violations = await this.getViolations();
        return violations.filter(v => 
            v.plateNumber && v.plateNumber.includes(plateNumber)
        );
    }

    /**
     * البحث عن مخالفات بتاريخ معين
     */
    async searchViolationsByDate(date) {
        const violations = await this.getViolations();
        return violations.filter(v => 
            v.violationDate && v.violationDate.startsWith(date)
        );
    }

    /**
     * الحصول على إحصائيات المستخدمين
     */
    async getUserStats() {
        const users = await this.getUsers();
        return {
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            inactive: users.filter(u => u.status === 'inactive').length,
            admins: users.filter(u => u.role === 'admin').length,
            violationOfficers: users.filter(u => u.role === 'violation_entry').length,
            inquiryUsers: users.filter(u => u.role === 'inquiry').length
        };
    }

    /**
     * الحصول على إحصائيات المخالفات
     */
    async getViolationStats() {
        const violations = await this.getViolations();
        return {
            total: violations.length,
            thisMonth: violations.filter(v => {
                const date = new Date(v.createdDate);
                const now = new Date();
                return date.getMonth() === now.getMonth() && 
                       date.getFullYear() === now.getFullYear();
            }).length,
            thisWeek: violations.filter(v => {
                const date = new Date(v.createdDate);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
            }).length
        };
    }

    /**
     * تصدير البيانات
     */
    async exportData(type = 'all') {
        const data = {};
        
        if (type === 'all' || type === 'users') {
            data.users = await this.getUsers();
        }
        
        if (type === 'all' || type === 'violations') {
            data.violations = await this.getViolations();
        }
        
        return data;
    }

    /**
     * استيراد البيانات
     */
    async importData(data) {
        try {
            if (data.users) {
                localStorage.setItem('users', JSON.stringify(data.users));
            }
            
            if (data.violations) {
                localStorage.setItem('violations', JSON.stringify(data.violations));
            }
            
            return {
                success: true,
                message: 'تم استيراد البيانات بنجاح'
            };
        } catch (error) {
            console.error('Error importing data:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء استيراد البيانات'
            };
        }
    }

    /**
     * إعادة تعيين قاعدة البيانات
     */
    async resetDatabase() {
        localStorage.removeItem('users');
        localStorage.removeItem('violations');
        this.init();
    }
}

// إنشاء نسخة عامة من DatabaseManager
window.db = new DatabaseManager();
