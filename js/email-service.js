/**
 * نظام إدارة إرسال البريد الإلكتروني
 * Email Notification Service
 * @version 1.1.0
 * 
 * يستخدم EmailJS لإرسال الإشعارات عبر البريد الإلكتروني
 * Uses EmailJS for sending email notifications
 * 
 * 📚 للإعداد الكامل، راجع الأدلة التالية:
 * For complete setup, see the following guides:
 * 
 * 🚀 البدء السريع / Quick Start:
 *    - EMAILJS_QUICK_SETUP.md (15 دقيقة)
 * 
 * 📖 الدليل الشامل / Complete Guide:
 *    - EMAILJS_SETUP_GUIDE.md (تفاصيل كاملة)
 * 
 * 🔧 استكشاف الأخطاء / Troubleshooting:
 *    - WHY_EMAIL_NOT_WORKING.md
 * 
 * 🌐 رابط EmailJS المباشر / Direct Link:
 *    https://dashboard.emailjs.com/admin
 * 
 * ⚙️ صفحة الإعدادات / Settings Page:
 *    pages/email_settings.html (الطريقة الأسهل!)
 */

class EmailService {
    constructor() {
        // تكوين EmailJS - يجب تعيين هذه القيم من لوحة تحكم EmailJS
        // EmailJS configuration - these values should be set from EmailJS dashboard
        // 
        // ⚠️ طريقتان للتكوين / Two ways to configure:
        // 
        // 1️⃣ استخدام صفحة الإعدادات (موصى به):
        //    افتح pages/email_settings.html وملأ النموذج
        //    Open pages/email_settings.html and fill the form
        // 
        // 2️⃣ التحديث اليدوي هنا:
        //    عدّل القيم أدناه بقيمك من EmailJS
        //    Update the values below with your EmailJS values
        
        this.serviceId = 'service_default'; // معرف الخدمة / Service ID
        this.templateIds = {
            userCreated: 'template_user_created',           // قالب إنشاء مستخدم
            violationAdded: 'template_violation_added',     // قالب مخالفة جديدة
            passwordReset: 'template_password_reset',       // قالب استعادة كلمة المرور
            systemNotification: 'template_system_notification' // قالب إشعار عام
        };
        this.publicKey = 'YOUR_PUBLIC_KEY'; // المفتاح العام من EmailJS / Public Key
        
        // حالة النظام
        this.isEnabled = this.loadEmailSettings().enabled || false;
        this.isConfigured = false;
        
        this.init();
        this.showSetupMessage();
    }
    
    /**
     * عرض رسالة توجيهية للإعداد
     */
    showSetupMessage() {
        if (!this.isEmailEnabled() && !localStorage.getItem('emailSetupMessageShown')) {
            console.log('%c📧 إعداد خدمة البريد الإلكتروني', 'font-size: 16px; font-weight: bold; color: #8B6F47;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8B6F47;');
            console.log('');
            console.log('%c🚀 للبدء السريع (15 دقيقة):', 'font-weight: bold; color: #51cf66;');
            console.log('   1. راجع ملف: EMAILJS_QUICK_SETUP.md');
            console.log('   2. أو افتح: pages/email_settings.html');
            console.log('');
            console.log('%c📖 للدليل الشامل:', 'font-weight: bold; color: #339af0;');
            console.log('   راجع ملف: EMAILJS_SETUP_GUIDE.md');
            console.log('');
            console.log('%c🌐 رابط EmailJS:', 'font-weight: bold; color: #ff6b6b;');
            console.log('   https://dashboard.emailjs.com/admin');
            console.log('');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8B6F47;');
            
            // تعيين علامة لعدم إظهار الرسالة مرة أخرى في نفس الجلسة
            sessionStorage.setItem('emailSetupMessageShown', 'true');
        }
    }

    /**
     * تهيئة خدمة البريد الإلكتروني
     */
    init() {
        // التحقق من تحميل مكتبة EmailJS
        if (typeof emailjs !== 'undefined') {
            this.isConfigured = true;
            emailjs.init(this.publicKey);
            console.log('Email service initialized');
        } else {
            console.warn('EmailJS library not loaded. Email notifications will be disabled.');
        }
    }

    /**
     * تحميل إعدادات البريد الإلكتروني من التخزين المحلي
     */
    loadEmailSettings() {
        try {
            const settings = localStorage.getItem('emailSettings');
            if (settings) {
                return JSON.parse(settings);
            }
        } catch (error) {
            console.error('Error loading email settings:', error);
        }
        
        // الإعدادات الافتراضية
        return {
            enabled: false,
            serviceId: 'service_default',
            publicKey: '',
            notifyOnUserCreation: true,
            notifyOnViolation: true,
            notifyOnPasswordReset: true,
            adminEmail: 'aliayashi522@gmail.com'
        };
    }

    /**
     * حفظ إعدادات البريد الإلكتروني
     * 
     * ملاحظة أمنية: المفتاح العام (Public Key) مصمم ليكون عاماً
     * حسب نموذج أمان EmailJS. لا يتم تخزين أي بيانات حساسة.
     * Security Note: The Public Key is designed to be public
     * per EmailJS security model. No sensitive data is stored.
     */
    saveEmailSettings(settings) {
        try {
            localStorage.setItem('emailSettings', JSON.stringify(settings));
            this.isEnabled = settings.enabled;
            this.serviceId = settings.serviceId || this.serviceId;
            this.publicKey = settings.publicKey || this.publicKey;
            
            // إعادة تهيئة EmailJS بالمفتاح الجديد
            if (this.isConfigured && this.publicKey) {
                emailjs.init(this.publicKey);
            }
            
            return { success: true, message: 'تم حفظ إعدادات البريد الإلكتروني بنجاح' };
        } catch (error) {
            console.error('Error saving email settings:', error);
            return { success: false, error: 'حدث خطأ أثناء حفظ الإعدادات' };
        }
    }

    /**
     * التحقق من تمكين خدمة البريد الإلكتروني
     */
    isEmailEnabled() {
        return this.isEnabled && this.isConfigured;
    }

    /**
     * إرسال بريد إلكتروني
     * @param {string} templateId - معرف القالب
     * @param {object} params - معلمات البريد الإلكتروني
     */
    async sendEmail(templateId, params) {
        if (!this.isEmailEnabled()) {
            console.log('Email service is disabled or not configured');
            return { success: false, message: 'خدمة البريد الإلكتروني غير مفعلة' };
        }

        try {
            const response = await emailjs.send(
                this.serviceId,
                templateId,
                params
            );
            
            console.log('Email sent successfully:', response);
            return {
                success: true,
                message: 'تم إرسال البريد الإلكتروني بنجاح',
                response: response
            };
        } catch (error) {
            console.error('Failed to send email:', error);
            return {
                success: false,
                error: 'فشل إرسال البريد الإلكتروني',
                details: error
            };
        }
    }

    /**
     * إرسال إشعار عند إنشاء مستخدم جديد
     */
    async notifyUserCreated(userData) {
        const settings = this.loadEmailSettings();
        if (!settings.notifyOnUserCreation) {
            return { success: false, message: 'Notifications for user creation are disabled' };
        }

        const params = {
            to_email: userData.email,
            to_name: userData.name,
            username: userData.username,
            role: window.ROLE_NAMES[userData.role] || userData.role,
            login_url: window.location.origin + '/index.html'
        };

        return await this.sendEmail(this.templateIds.userCreated, params);
    }

    /**
     * إرسال إشعار عند تسجيل مخالفة جديدة
     */
    async notifyViolationAdded(violationData) {
        const settings = this.loadEmailSettings();
        if (!settings.notifyOnViolation) {
            return { success: false, message: 'Notifications for violations are disabled' };
        }

        // البحث عن بيانات المخالف إذا كانت متوفرة
        const params = {
            to_email: settings.adminEmail,
            violation_id: violationData.id,
            plate_number: violationData.plateNumber || 'غير متوفر',
            violation_type: violationData.violationType || 'غير محدد',
            violation_date: violationData.violationDate || new Date().toISOString().split('T')[0],
            location: violationData.location || 'غير محدد',
            view_url: window.location.origin + '/inquiry_violations.html'
        };

        return await this.sendEmail(this.templateIds.violationAdded, params);
    }

    /**
     * إرسال إشعار إعادة تعيين كلمة المرور
     */
    async notifyPasswordReset(email, username, resetToken) {
        const settings = this.loadEmailSettings();
        if (!settings.notifyOnPasswordReset) {
            return { success: false, message: 'Notifications for password reset are disabled' };
        }

        const params = {
            to_email: email,
            username: username,
            reset_link: window.location.origin + '/reset-password.html?token=' + resetToken,
            expiry_time: '24 ساعة'
        };

        return await this.sendEmail(this.templateIds.passwordReset, params);
    }

    /**
     * إرسال إشعار عام للنظام
     */
    async notifySystem(recipient, subject, message) {
        const params = {
            to_email: recipient,
            subject: subject,
            message: message,
            system_name: 'نظام إدارة إسكان أعضاء هيئة التدريس'
        };

        return await this.sendEmail(this.templateIds.systemNotification, params);
    }

    /**
     * اختبار إرسال بريد إلكتروني
     */
    async testEmailConfiguration(testEmail) {
        if (!this.isConfigured) {
            return {
                success: false,
                error: 'خدمة البريد الإلكتروني غير مكونة. يرجى التحقق من تحميل مكتبة EmailJS.'
            };
        }

        const params = {
            to_email: testEmail,
            to_name: 'مستخدم الاختبار',
            message: 'هذا بريد إلكتروني تجريبي من نظام إدارة إسكان أعضاء هيئة التدريس.',
            test_date: new Date().toLocaleString('ar-SA')
        };

        return await this.sendEmail(this.templateIds.systemNotification, params);
    }

    /**
     * إرسال بريد إلكتروني لاسترجاع كلمة المرور مع كلمة المرور المؤقتة
     * @param {string} email - البريد الإلكتروني للمستخدم
     * @param {string} username - اسم المستخدم
     * @param {string} tempPassword - كلمة المرور المؤقتة الجديدة
     */
    async sendPasswordResetEmail(email, username, tempPassword) {
        const settings = this.loadEmailSettings();
        if (!settings.notifyOnPasswordReset) {
            return { success: false, message: 'إشعارات استرجاع كلمة المرور غير مفعلة' };
        }

        const params = {
            to_email: email,
            username: username,
            temp_password: tempPassword,
            login_url: window.location.origin + '/index.html',
            system_name: 'نظام إدارة المرور',
            reset_date: new Date().toLocaleString('ar-SA')
        };

        return await this.sendEmail(this.templateIds.passwordReset, params);
    }

    /**
     * الحصول على حالة خدمة البريد الإلكتروني
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            configured: this.isConfigured,
            settings: this.loadEmailSettings()
        };
    }
}

// إنشاء نسخة عامة من EmailService
window.emailService = new EmailService();
