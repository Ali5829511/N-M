/**
 * أدوات التشفير - Cryptography Utilities
 * @version 1.0.0
 * 
 * نظام تشفير كلمات المرور باستخدام SHA-256
 * Password encryption system using SHA-256
 */

class CryptoUtils {
    /**
     * تشفير كلمة المرور باستخدام SHA-256
     * Encrypt password using SHA-256
     * @param {string} password - كلمة المرور النصية
     * @returns {Promise<string>} - كلمة المرور المشفرة
     */
    static async hashPassword(password) {
        try {
            // تحويل النص إلى bytes
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            
            // تشفير باستخدام SHA-256
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            
            // تحويل إلى hex string
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return hashHex;
        } catch (error) {
            console.error('خطأ في تشفير كلمة المرور:', error);
            throw error;
        }
    }

    /**
     * التحقق من كلمة المرور
     * Verify password
     * @param {string} password - كلمة المرور النصية
     * @param {string} hash - كلمة المرور المشفرة
     * @returns {Promise<boolean>} - هل كلمة المرور صحيحة؟
     */
    static async verifyPassword(password, hash) {
        try {
            const hashedInput = await this.hashPassword(password);
            return hashedInput === hash;
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
