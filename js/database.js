/**
 * نظام إدارة قاعدة البيانات المحلية
 * Local Database Management System
 * @version 2.0.0
 * 
 * ✅ التحسينات الأمنية:
 * - تشفير كلمات المرور باستخدام SHA-256
 * - نظام تحذير لكلمات المرور الافتراضية
 * - دعم تغيير كلمة المرور الإجباري عند أول تسجيل دخول
 * 
 * ⚠️ ملاحظة:
 * للإنتاج، يوصى باستخدام:
 * 1. قاعدة بيانات خلفية (PostgreSQL, MySQL, MongoDB)
 * 2. تشفير bcrypt أو argon2 (أقوى من SHA-256)
 * 3. API خلفي آمن
 * 4. SSL/TLS (HTTPS)
 * 
 * 📊 للتحقق من حالة قاعدة البيانات، افتح: database_status.html
 */

class DatabaseManager {
    constructor() {
        this.dbName = 'TrafficSystemDB';
        this.version = 2; // تحديث الإصدار
        this.dbType = 'localStorage'; // نوع قاعدة البيانات
        this.connectionStatus = 'disconnected'; // حالة الاتصال
        this.passwordsHashed = false; // حالة تشفير كلمات المرور
        this.init();
    }

    /**
     * تهيئة قاعدة البيانات
     */
    async init() {
        try {
            // التحقق من دعم localStorage
            if (typeof localStorage === 'undefined') {
                console.error('localStorage غير مدعوم في هذا المتصفح');
                this.connectionStatus = 'error';
                return;
            }

            // التحقق من حالة تشفير كلمات المرور
            const passwordsHashedFlag = localStorage.getItem('passwords_hashed');
            this.passwordsHashed = passwordsHashedFlag === 'true';

            // إنشاء المستخدمين الافتراضيين إذا لم يكونوا موجودين
            if (!localStorage.getItem('users')) {
                await this.initializeDefaultUsers();
            } else if (!this.passwordsHashed) {
                // ترقية كلمات المرور القديمة
                console.log('🔐 جاري ترقية كلمات المرور إلى نظام مشفر...');
                await this.upgradePasswordSecurity();
            }
            
            // إنشاء جدول المخالفات إذا لم يكن موجوداً
            if (!localStorage.getItem('violations')) {
                localStorage.setItem('violations', JSON.stringify([]));
            }

            // إنشاء جدول الملصقات إذا لم يكن موجوداً
            if (!localStorage.getItem('stickers')) {
                this.initializeDefaultStickers();
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
     * إنشاء المستخدمين الافتراضيين مع كلمات مرور مشفرة
     * ✅ تحسين أمني: كلمات المرور الآن مشفرة باستخدام SHA-256
     */
    async initializeDefaultUsers() {
        // توليد كلمات مرور قوية عشوائية
        const adminPassword = CryptoUtils.generateSecurePassword(16);
        const violationsPassword = CryptoUtils.generateSecurePassword(16);
        const inquiryPassword = CryptoUtils.generateSecurePassword(16);

        // تشفير كلمات المرور
        const hashedAdminPassword = await CryptoUtils.hashPassword(adminPassword);
        const hashedViolationsPassword = await CryptoUtils.hashPassword(violationsPassword);
        const hashedInquiryPassword = await CryptoUtils.hashPassword(inquiryPassword);

        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: hashedAdminPassword, // ✅ كلمة مرور مشفرة
                name: 'مدير النظام',
                email: 'aliayashi522@gmail.com',
                role: 'admin',
                status: 'active',
                createdDate: new Date().toISOString().split('T')[0],
                lastLogin: new Date().toISOString(),
                requirePasswordChange: true, // يجب تغيير كلمة المرور عند أول تسجيل دخول
                tempPassword: adminPassword // كلمة المرور المؤقتة (سيتم حذفها بعد أول تسجيل دخول)
            },
            {
                id: 2,
                username: 'violations_officer',
                password: hashedViolationsPassword, // ✅ كلمة مرور مشفرة
                name: 'مسؤول المخالفات',
                email: 'violations@university.edu.sa',
                role: 'violation_entry',
                status: 'active',
                createdDate: new Date().toISOString().split('T')[0],
                lastLogin: new Date().toISOString(),
                requirePasswordChange: true,
                tempPassword: violationsPassword
            },
            {
                id: 3,
                username: 'inquiry_user',
                password: hashedInquiryPassword, // ✅ كلمة مرور مشفرة
                name: 'موظف الاستعلام',
                email: 'inquiry@university.edu.sa',
                role: 'inquiry',
                status: 'active',
                createdDate: new Date().toISOString().split('T')[0],
                lastLogin: new Date().toISOString(),
                requirePasswordChange: true,
                tempPassword: inquiryPassword
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        localStorage.setItem('passwords_hashed', 'true');
        this.passwordsHashed = true;

        // عرض كلمات المرور المؤقتة في Console للمسؤول
        console.log('🔐 تم إنشاء المستخدمين بكلمات مرور آمنة:');
        console.log('━'.repeat(60));
        console.log('👤 admin:', adminPassword);
        console.log('👤 violations_officer:', violationsPassword);
        console.log('👤 inquiry_user:', inquiryPassword);
        console.log('━'.repeat(60));
        console.log('⚠️ احفظ هذه الكلمات في مكان آمن!');
        console.log('⚠️ يجب تغييرها عند أول تسجيل دخول.');
        
        // تم إنشاء المستخدمين الافتراضيين
    }

    /**
     * ترقية أمان كلمات المرور للمستخدمين الحاليين
     * Upgrade password security for existing users
     */
    async upgradePasswordSecurity() {
        try {
            const users = await this.getUsers();
            const oldPasswords = {
                'admin': 'admin123',
                'violations_officer': 'violations123',
                'inquiry_user': 'inquiry123'
            };

            let upgraded = false;
            for (let user of users) {
                // التحقق إذا كانت كلمة المرور غير مشفرة
                const oldPassword = oldPasswords[user.username];
                if (oldPassword && user.password === oldPassword) {
                    // توليد كلمة مرور جديدة قوية
                    const newPassword = CryptoUtils.generateSecurePassword(16);
                    user.password = await CryptoUtils.hashPassword(newPassword);
                    user.requirePasswordChange = true;
                    user.tempPassword = newPassword;
                    upgraded = true;

                    console.log(`🔐 تم ترقية كلمة مرور ${user.username}: ${newPassword}`);
                }
            }

            if (upgraded) {
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('passwords_hashed', 'true');
                this.passwordsHashed = true;
                console.log('✅ تم ترقية أمان كلمات المرور بنجاح!');
            }

            return upgraded;
        } catch (error) {
            console.error('خطأ في ترقية كلمات المرور:', error);
            return false;
        }
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
     * ✅ تشفير كلمة المرور تلقائياً
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
            
            // تشفير كلمة المرور
            const hashedPassword = await CryptoUtils.hashPassword(userData.password);
            
            const newUser = {
                id: newId,
                username: userData.username,
                password: hashedPassword, // ✅ كلمة مرور مشفرة
                name: userData.name,
                email: userData.email,
                role: userData.role,
                status: userData.status || 'active',
                createdDate: new Date().toISOString().split('T')[0],
                lastLogin: null,
                requirePasswordChange: false // المستخدم اختار كلمة مروره
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
     * إنشاء بيانات الملصقات الافتراضية
     */
    /**
     * تحميل ملصقات السيارات من ملف stickers_data.json
     * يتم تحميل البيانات الحقيقية من ملف ملصقات السيارات
     * الملف يحتوي على صفحتين: فعال وملغي
     */
    async initializeDefaultStickers() {
        try {
            // محاولة تحميل البيانات من ملف stickers_data.json
            const response = await fetch('pages/stickers_data.json');
            const stickersData = await response.json();
            
            // تحويل البيانات إلى التنسيق المتوافق مع النظام
            const formattedStickers = stickersData.map((item, index) => ({
                id: index + 1,
                idNumber: item['رقم الهوية'],
                residentName: item['اسم الساكن'],
                status: item['حالة'], // فعال أو ملغي
                issueDate: item['تاريخ الملصق'],
                plateNumber: item['رقم لوحة السيارة'],
                vehicleType: item['نوع المركبة'],
                unitType: item['نوع الوحدة'],
                building: item['المبنى'],
                apartment: item['شقة'],
                deliveryImage: '',
                notes: item['ملاحظات'] || '',
                createdDate: new Date().toISOString(),
                source: 'excel_import', // مصدر البيانات
                sheetType: item['حالة'] === 'فعال' ? 'active' : 'cancelled' // نوع الصفحة
            }));
            
            localStorage.setItem('stickers', JSON.stringify(formattedStickers));
            console.log(`✓ تم تحميل ${formattedStickers.length} ملصق من ملف البيانات`);
            console.log(`  - فعال: ${formattedStickers.filter(s => s.status === 'فعال').length}`);
            console.log(`  - ملغي: ${formattedStickers.filter(s => s.status === 'ملغي').length}`);
            
            return formattedStickers;
        } catch (error) {
            console.error('خطأ في تحميل بيانات الملصقات من الملف:', error);
            console.log('سيتم استخدام بيانات افتراضية مؤقتة');
            
            // في حالة الفشل، استخدام بيانات افتراضية
            const fallbackStickers = [
                {
                    id: 1,
                    idNumber: '1049763921',
                    residentName: 'ناصر مبارك فهيد البقعاوي',
                    status: 'فعال',
                    issueDate: '2022-05-24',
                    plateNumber: 'د هـ ك 8466',
                    vehicleType: 'هونداي كحلي 2018',
                    unitType: 'A',
                    building: '25',
                    apartment: '21',
                    deliveryImage: '',
                    notes: '',
                    createdDate: new Date().toISOString(),
                    source: 'fallback'
                }
            ];
            
            localStorage.setItem('stickers', JSON.stringify(fallbackStickers));
            return fallbackStickers;
        }
    }

    /**
     * الحصول على جميع الملصقات
     */
    async getStickers() {
        try {
            const stickers = JSON.parse(localStorage.getItem('stickers') || '[]');
            return stickers;
        } catch (error) {
            console.error('Error getting stickers:', error);
            return [];
        }
    }

    /**
     * الحصول على ملصق بواسطة المعرف
     */
    async getStickerById(id) {
        const stickers = await this.getStickers();
        return stickers.find(s => s.id === id);
    }

    /**
     * إضافة ملصق جديد
     */
    async addSticker(stickerData) {
        try {
            const stickers = await this.getStickers();
            
            // إنشاء معرف جديد
            const newId = stickers.length > 0 ? Math.max(...stickers.map(s => s.id)) + 1 : 1;
            
            const newSticker = {
                id: newId,
                ...stickerData,
                createdDate: new Date().toISOString(),
                createdBy: window.authManager ? window.authManager.getCurrentUser()?.id : null
            };
            
            stickers.push(newSticker);
            localStorage.setItem('stickers', JSON.stringify(stickers));
            
            return {
                success: true,
                sticker: newSticker
            };
        } catch (error) {
            console.error('Error adding sticker:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء إضافة الملصق'
            };
        }
    }

    /**
     * تحديث ملصق
     */
    async updateSticker(id, stickerData) {
        try {
            const stickers = await this.getStickers();
            const index = stickers.findIndex(s => s.id === id);
            
            if (index === -1) {
                return {
                    success: false,
                    error: 'الملصق غير موجود'
                };
            }
            
            stickers[index] = {
                ...stickers[index],
                ...stickerData,
                id: id,
                updatedDate: new Date().toISOString(),
                updatedBy: window.authManager ? window.authManager.getCurrentUser()?.id : null
            };
            
            localStorage.setItem('stickers', JSON.stringify(stickers));
            
            return {
                success: true,
                sticker: stickers[index]
            };
        } catch (error) {
            console.error('Error updating sticker:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء تحديث الملصق'
            };
        }
    }

    /**
     * حذف ملصق
     */
    async deleteSticker(id) {
        try {
            const stickers = await this.getStickers();
            const filteredStickers = stickers.filter(s => s.id !== id);
            
            if (stickers.length === filteredStickers.length) {
                return {
                    success: false,
                    error: 'الملصق غير موجود'
                };
            }
            
            localStorage.setItem('stickers', JSON.stringify(filteredStickers));
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting sticker:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء حذف الملصق'
            };
        }
    }

    /**
     * البحث عن ملصقات برقم الهوية
     */
    async searchStickersByIdNumber(idNumber) {
        const stickers = await this.getStickers();
        return stickers.filter(s => 
            s.idNumber && s.idNumber.includes(idNumber)
        );
    }

    /**
     * البحث عن ملصقات برقم اللوحة
     */
    async searchStickersByPlate(plateNumber) {
        const stickers = await this.getStickers();
        return stickers.filter(s => 
            s.plateNumber && s.plateNumber.includes(plateNumber)
        );
    }

    /**
     * الحصول على إحصائيات الملصقات
     */
    async getStickerStats() {
        const stickers = await this.getStickers();
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        return {
            total: stickers.length,
            active: stickers.filter(s => s.status === 'فعال').length,
            inactive: stickers.filter(s => s.status === 'غير فعال').length,
            canceled: stickers.filter(s => s.status === 'ملغي').length,
            violated: stickers.filter(s => s.status === 'مخالف').length,
            today: stickers.filter(s => s.issueDate === today).length,
            thisWeek: stickers.filter(s => s.issueDate >= weekAgo).length,
            villas: stickers.filter(s => s.unitType === 'V').length,
            apartments: stickers.filter(s => s.unitType === 'A').length
        };
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
        
        if (type === 'all' || type === 'stickers') {
            data.stickers = await this.getStickers();
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
            
            if (data.stickers) {
                localStorage.setItem('stickers', JSON.stringify(data.stickers));
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
        localStorage.removeItem('stickers');
        localStorage.removeItem('vehiclesDatabase');
        this.init();
    }

    // ============================================
    // وظائف قاعدة بيانات السيارات والتحليلات
    // Vehicles Database and Analytics Functions
    // ============================================

    /**
     * الحصول على جميع السيارات من قاعدة البيانات
     */
    async getVehiclesDatabase() {
        try {
            const vehicles = JSON.parse(localStorage.getItem('vehiclesDatabase') || '[]');
            return vehicles;
        } catch (error) {
            console.error('Error getting vehicles database:', error);
            return [];
        }
    }

    /**
     * إضافة أو تحديث سيارة في قاعدة البيانات
     */
    async addOrUpdateVehicle(vehicleData) {
        try {
            const vehicles = await this.getVehiclesDatabase();
            const existingIndex = vehicles.findIndex(v => v.plateNumber === vehicleData.plateNumber);
            
            if (existingIndex !== -1) {
                // تحديث السيارة الموجودة
                vehicles[existingIndex] = {
                    ...vehicles[existingIndex],
                    ...vehicleData,
                    updatedDate: new Date().toISOString()
                };
            } else {
                // إضافة سيارة جديدة
                const newVehicle = {
                    plateNumber: vehicleData.plateNumber,
                    vehicleType: vehicleData.vehicleType || 'غير محدد',
                    ownerName: vehicleData.ownerName || 'غير محدد',
                    ownerPhone: vehicleData.ownerPhone || '',
                    ownerEmail: vehicleData.ownerEmail || '',
                    violationsCount: 0,
                    lastViolationDate: null,
                    status: 'نشط',
                    createdDate: new Date().toISOString(),
                    notes: vehicleData.notes || ''
                };
                vehicles.push(newVehicle);
            }
            
            localStorage.setItem('vehiclesDatabase', JSON.stringify(vehicles));
            
            return {
                success: true,
                message: 'تم حفظ بيانات السيارة بنجاح'
            };
        } catch (error) {
            console.error('Error adding/updating vehicle:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء حفظ بيانات السيارة'
            };
        }
    }

    /**
     * الحصول على سيارة بواسطة رقم اللوحة
     */
    async getVehicleByPlateNumber(plateNumber) {
        const vehicles = await this.getVehiclesDatabase();
        return vehicles.find(v => v.plateNumber === plateNumber);
    }

    /**
     * حساب عدد المخالفات لكل سيارة
     */
    async calculateVehicleViolations() {
        try {
            const vehicles = await this.getVehiclesDatabase();
            const violations = await this.getViolations();
            
            // إعادة تعيين العدادات
            vehicles.forEach(vehicle => {
                const vehicleViolations = violations.filter(v => v.plateNumber === vehicle.plateNumber);
                vehicle.violationsCount = vehicleViolations.length;
                
                if (vehicleViolations.length > 0) {
                    // ترتيب حسب التاريخ
                    const sortedViolations = vehicleViolations.sort((a, b) => 
                        new Date(b.date || b.createdDate) - new Date(a.date || a.createdDate)
                    );
                    vehicle.lastViolationDate = sortedViolations[0].date || sortedViolations[0].createdDate;
                    
                    // تحديث حالة السيارة بناءً على عدد المخالفات
                    if (vehicle.violationsCount >= 5) {
                        vehicle.status = 'خطر';
                    } else if (vehicle.violationsCount >= 3) {
                        vehicle.status = 'تحذير';
                    } else {
                        vehicle.status = 'نشط';
                    }
                } else {
                    vehicle.lastViolationDate = null;
                    vehicle.status = 'نشط';
                }
            });
            
            localStorage.setItem('vehiclesDatabase', JSON.stringify(vehicles));
            
            return {
                success: true,
                vehicles: vehicles
            };
        } catch (error) {
            console.error('Error calculating vehicle violations:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء حساب المخالفات'
            };
        }
    }

    /**
     * الحصول على المخالفين المتكررين
     * @param {number} minViolations - الحد الأدنى لعدد المخالفات
     */
    async getRepeatedOffenders(minViolations = 2) {
        try {
            const vehicles = await this.getVehiclesDatabase();
            return vehicles.filter(v => v.violationsCount >= minViolations)
                          .sort((a, b) => b.violationsCount - a.violationsCount);
        } catch (error) {
            console.error('Error getting repeated offenders:', error);
            return [];
        }
    }

    /**
     * الحصول على إحصائيات متقدمة
     */
    async getAdvancedStatistics() {
        try {
            const vehicles = await this.getVehiclesDatabase();
            const violations = await this.getViolations();
            
            // حساب الإحصائيات
            const totalVehicles = vehicles.length;
            const totalViolations = violations.length;
            const repeatedOffenders = vehicles.filter(v => v.violationsCount >= 2).length;
            const dangerousVehicles = vehicles.filter(v => v.status === 'خطر').length;
            const warningVehicles = vehicles.filter(v => v.status === 'تحذير').length;
            
            // حساب المخالفات حسب النوع
            const violationsByType = {};
            violations.forEach(v => {
                const type = v.violationType || 'غير محدد';
                violationsByType[type] = (violationsByType[type] || 0) + 1;
            });
            
            // حساب المخالفات حسب الشهر
            const violationsByMonth = {};
            violations.forEach(v => {
                const date = new Date(v.date || v.createdDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                violationsByMonth[monthKey] = (violationsByMonth[monthKey] || 0) + 1;
            });
            
            return {
                success: true,
                statistics: {
                    totalVehicles,
                    totalViolations,
                    repeatedOffenders,
                    dangerousVehicles,
                    warningVehicles,
                    violationsByType,
                    violationsByMonth,
                    averageViolationsPerVehicle: totalVehicles > 0 ? (totalViolations / totalVehicles).toFixed(2) : 0
                }
            };
        } catch (error) {
            console.error('Error getting advanced statistics:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء حساب الإحصائيات'
            };
        }
    }

    /**
     * مزامنة قاعدة بيانات السيارات مع المخالفات
     */
    async syncVehiclesFromViolations() {
        try {
            const vehicles = await this.getVehiclesDatabase();
            const violations = await this.getViolations();
            
            // إضافة سيارات جديدة من المخالفات
            violations.forEach(violation => {
                if (!vehicles.find(v => v.plateNumber === violation.plateNumber)) {
                    const newVehicle = {
                        plateNumber: violation.plateNumber,
                        vehicleType: violation.vehicleType || 'غير محدد',
                        ownerName: violation.driverName || violation.ownerName || 'غير محدد',
                        ownerPhone: violation.driverPhone || '',
                        ownerEmail: '',
                        violationsCount: 0,
                        lastViolationDate: null,
                        status: 'نشط',
                        createdDate: new Date().toISOString(),
                        notes: 'تم الإضافة تلقائياً من المخالفات'
                    };
                    vehicles.push(newVehicle);
                }
            });
            
            localStorage.setItem('vehiclesDatabase', JSON.stringify(vehicles));
            
            // حساب عدد المخالفات
            await this.calculateVehicleViolations();
            
            return {
                success: true,
                message: 'تم مزامنة قاعدة البيانات بنجاح'
            };
        } catch (error) {
            console.error('Error syncing vehicles from violations:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء المزامنة'
            };
        }
    }

    /**
     * حذف سيارة من قاعدة البيانات
     */
    async deleteVehicle(plateNumber) {
        try {
            const vehicles = await this.getVehiclesDatabase();
            const filteredVehicles = vehicles.filter(v => v.plateNumber !== plateNumber);
            
            if (vehicles.length === filteredVehicles.length) {
                return {
                    success: false,
                    error: 'السيارة غير موجودة'
                };
            }
            
            localStorage.setItem('vehiclesDatabase', JSON.stringify(filteredVehicles));
            
            return {
                success: true,
                message: 'تم حذف السيارة بنجاح'
            };
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            return {
                success: false,
                error: 'حدث خطأ أثناء حذف السيارة'
            };
        }
    }

    /**
     * البحث في قاعدة بيانات السيارات
     */
    async searchVehicles(searchTerm) {
        try {
            const vehicles = await this.getVehiclesDatabase();
            const term = searchTerm.toLowerCase();
            
            return vehicles.filter(v => 
                v.plateNumber.toLowerCase().includes(term) ||
                v.vehicleType.toLowerCase().includes(term) ||
                v.ownerName.toLowerCase().includes(term) ||
                (v.ownerPhone && v.ownerPhone.includes(term))
            );
        } catch (error) {
            console.error('Error searching vehicles:', error);
            return [];
        }
    }
}

// إنشاء نسخة عامة من DatabaseManager
window.db = new DatabaseManager();
