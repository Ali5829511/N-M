/**
 * أدوات التشفير - Cryptography Utilities
 * @version 2.0.0
 * 
 * نظام تشفير كلمات المرور باستخدام PBKDF2 مع SHA-256
 * Password encryption system using PBKDF2 with SHA-256
 */

class CryptoUtils {
    /**
     * تشفير كلمة المرور باستخدام PBKDF2 مع SHA-256
     * Hash password using PBKDF2 with SHA-256
     * @param {string} password - كلمة المرور النصية
     * @returns {Promise<string>} - كلمة المرور المشفرة بصيغة saltBase64$hashBase64
     */
    static async hashPassword(password) {
        try {
            // إنشاء salt عشوائي (16 بايت)
            const salt = crypto.getRandomValues(new Uint8Array(16));
            
            // تحويل كلمة المرور إلى bytes
            const encoder = new TextEncoder();
            const passwordData = encoder.encode(password);
            
            // استيراد كلمة المرور كمفتاح
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordData,
                'PBKDF2',
                false,
                ['deriveBits']
            );
            
            // تطبيق PBKDF2 مع 100000 تكرار
            const hashBuffer = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                256 // 32 بايت = 256 بت
            );
            
            // تحويل salt و hash إلى Base64
            const saltBase64 = btoa(String.fromCharCode(...salt));
            const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
            
            // إرجاع بصيغة saltBase64$hashBase64
            return `${saltBase64}$${hashBase64}`;
        } catch (error) {
            console.error('خطأ في تشفير كلمة المرور:', error);
            throw error;
        }
    }

    /**
     * التحقق من كلمة المرور
     * Verify password against stored hash
     * @param {string} password - كلمة المرور النصية
     * @param {string} stored - كلمة المرور المخزنة بصيغة saltBase64$hashBase64
     * @returns {Promise<boolean>} - هل كلمة المرور صحيحة؟
     */
    static async verifyPassword(password, stored) {
        try {
            // فك التشفير المخزن إلى salt و hash
            const [saltBase64, storedHashBase64] = stored.split('$');
            if (!saltBase64 || !storedHashBase64) {
                return false;
            }
            
            // تحويل salt من Base64 إلى Uint8Array
            const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
            
            // تحويل كلمة المرور إلى bytes
            const encoder = new TextEncoder();
            const passwordData = encoder.encode(password);
            
            // استيراد كلمة المرور كمفتاح
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordData,
                'PBKDF2',
                false,
                ['deriveBits']
            );
            
            // تطبيق PBKDF2 مع نفس الإعدادات
            const hashBuffer = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                256
            );
            
            // تحويل hash إلى Base64
            const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
            
            // مقارنة الـ hash
            return hashBase64 === storedHashBase64;
        } catch (error) {
            console.error('خطأ في التحقق من كلمة المرور:', error);
            return false;
        }
    }

    /**
     * توليد كلمة مرور عشوائية قوية
     * Generate a strong random password
     * @param {number} length - طول كلمة المرور (افتراضي: 16)
     * @returns {string} - كلمة المرور العشوائية
     */
    static generateSecurePassword(length = 16) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }
        
        return password;
    }

    /**
     * توليد رمز مميز آمن (Token)
     * Generate secure token
     * @returns {string} - رمز مميز عشوائي
     */
    static generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
}

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoUtils;
}
