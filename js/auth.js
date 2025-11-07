/**
 * نظام إدارة الصلاحيات والأدوار
 * Role-Based Access Control System
 * @version 1.0.0
 */

// تعريف الأدوار والصلاحيات
const ROLES = {
    ADMIN: 'admin',
    VIOLATION_ENTRY: 'violation_entry',
    INQUIRY: 'inquiry'
};

// تعريف الصلاحيات لكل دور
const PERMISSIONS = {
    [ROLES.ADMIN]: {
        canViewDashboard: true,
        canAddViolation: true,
        canEditViolation: true,
        canDeleteViolation: true,
        canViewViolation: true,
        canManageUsers: true,
        canViewReports: true,
        canExportData: true,
        canImportData: true,
        canManageSystem: true
    },
    [ROLES.VIOLATION_ENTRY]: {
        canViewDashboard: false,
        canAddViolation: true,
        canEditViolation: false,
        canDeleteViolation: false,
        canViewViolation: true,
        canManageUsers: false,
        canViewReports: false,
        canExportData: false,
        canImportData: false,
        canManageSystem: false
    },
    [ROLES.INQUIRY]: {
        canViewDashboard: false,
        canAddViolation: false,
        canEditViolation: false,
        canDeleteViolation: false,
        canViewViolation: true,
        canManageUsers: false,
        canViewReports: true,
        canExportData: true,
        canImportData: false,
        canManageSystem: false
    }
};

// أسماء الأدوار بالعربية
const ROLE_NAMES = {
    [ROLES.ADMIN]: 'مدير النظام',
    [ROLES.VIOLATION_ENTRY]: 'مسجل المخالفات',
    [ROLES.INQUIRY]: 'الاستعلام'
};

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastActivity = Date.now();
        this.init();
    }

    /**
     * تهيئة النظام
     */
    init() {
        // التحقق من الجلسة الحالية
        this.checkSession();
        
        // مراقبة نشاط المستخدم
        this.setupActivityMonitoring();
    }

    /**
     * التحقق من الجلسة الحالية
     */
    checkSession() {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const now = Date.now();
                
                // التحقق من انتهاء الجلسة
                if (now - session.lastActivity > this.sessionTimeout) {
                    this.logout();
                    return false;
                }
                
                this.currentUser = session.user;
                this.lastActivity = session.lastActivity;
                return true;
            } catch (error) {
                console.error('Error parsing session:', error);
                this.logout();
                return false;
            }
        }
        return false;
    }

    /**
     * تسجيل الدخول
     */
    async login(username, password) {
        try {
            // محاكاة استدعاء API (في النظام الحقيقي سيكون هذا استدعاء للخادم)
            const user = await this.validateCredentials(username, password);
            
            if (user) {
                this.currentUser = user;
                this.lastActivity = Date.now();
                
                // حفظ الجلسة
                this.saveSession();
                
                return {
                    success: true,
                    user: user,
                    message_ar: 'تم تسجيل الدخول بنجاح'
                };
            } else {
                return {
                    success: false,
                    error_ar: 'اسم المستخدم أو كلمة المرور غير صحيحة'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error_ar: 'حدث خطأ أثناء تسجيل الدخول'
            };
        }
    }

    /**
     * التحقق من بيانات الاعتماد
     */
    async validateCredentials(username, password) {
        // محاكاة التحقق من قاعدة البيانات
        const users = await window.db.getUsers();
        const user = users.find(u => u.username === username && u.password === password && u.status === 'active');
        
        if (user) {
            // إزالة كلمة المرور من البيانات المرتجعة
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        
        return null;
    }

    /**
     * حفظ الجلسة
     */
    saveSession() {
        const sessionData = {
            user: this.currentUser,
            lastActivity: this.lastActivity
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    /**
     * تسجيل الخروج
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('userSession');
        localStorage.removeItem('currentUser');
        
        // إعادة التوجيه إلى صفحة تسجيل الدخول
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }

    /**
     * الحصول على المستخدم الحالي
     */
    getCurrentUser() {
        if (!this.currentUser) {
            this.checkSession();
        }
        return this.currentUser;
    }

    /**
     * التحقق من صلاحية معينة
     */
    hasPermission(permission) {
        if (!this.currentUser) {
            return false;
        }
        
        const role = this.currentUser.role;
        return PERMISSIONS[role] && PERMISSIONS[role][permission] === true;
    }

    /**
     * التحقق من دور معين
     */
    hasRole(role) {
        if (!this.currentUser) {
            return false;
        }
        return this.currentUser.role === role;
    }

    /**
     * التحقق من أحد الأدوار
     */
    hasAnyRole(roles) {
        if (!this.currentUser) {
            return false;
        }
        return roles.includes(this.currentUser.role);
    }

    /**
     * التحقق من تسجيل الدخول
     */
    isAuthenticated() {
        return this.currentUser !== null && this.checkSession();
    }

    /**
     * حماية الصفحة - يجب استدعاؤها في بداية كل صفحة محمية
     */
    requireAuth(requiredRoles = null) {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        
        if (requiredRoles && !this.hasAnyRole(requiredRoles)) {
            alert('عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة');
            this.redirectToDefaultPage();
            return false;
        }
        
        return true;
    }

    /**
     * إعادة التوجيه إلى الصفحة الافتراضية حسب الدور
     */
    redirectToDefaultPage() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        switch (this.currentUser.role) {
            case ROLES.ADMIN:
                window.location.href = 'unified_dashboard.html';
                break;
            case ROLES.VIOLATION_ENTRY:
                window.location.href = 'المخالفات_المرورية.html';
                break;
            case ROLES.INQUIRY:
                window.location.href = 'inquiry_violations.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    }

    /**
     * إعداد مراقبة نشاط المستخدم
     */
    setupActivityMonitoring() {
        // تحديث وقت النشاط عند أي تفاعل
        const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
            }, true);
        });
        
        // التحقق من انتهاء الجلسة كل دقيقة
        setInterval(() => {
            if (this.currentUser) {
                const now = Date.now();
                if (now - this.lastActivity > this.sessionTimeout) {
                    alert('انتهت مدة الجلسة. يرجى تسجيل الدخول مرة أخرى.');
                    this.logout();
                }
            }
        }, 60000); // كل دقيقة
    }

    /**
     * تحديث وقت النشاط
     */
    updateActivity() {
        this.lastActivity = Date.now();
        if (this.currentUser) {
            this.saveSession();
        }
    }

    /**
     * الحصول على اسم الدور بالعربية
     */
    getRoleName(role) {
        return ROLE_NAMES[role] || role;
    }

    /**
     * الحصول على جميع الصلاحيات للدور الحالي
     */
    getAllPermissions() {
        if (!this.currentUser) {
            return {};
        }
        return PERMISSIONS[this.currentUser.role] || {};
    }
}

// إنشاء نسخة عامة من AuthManager
window.authManager = new AuthManager();

// تصدير الثوابت للاستخدام في صفحات أخرى
window.ROLES = ROLES;
window.PERMISSIONS = PERMISSIONS;
window.ROLE_NAMES = ROLE_NAMES;
