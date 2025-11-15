/**
 * نظام إدارة إرسال البريد الإلكتروني
 * Email Notification Service
 * @version 1.0.0
 * 
 * يستخدم EmailJS لإرسال الإشعارات عبر البريد الإلكتروني
 * Uses EmailJS for sending email notifications
 */

class EmailService {
    constructor() {
        // تكوين EmailJS - يجب تعيين هذه القيم من لوحة تحكم EmailJS
        // EmailJS configuration - these values should be set from EmailJS dashboard
        this.serviceId = 'service_default'; // معرف الخدمة
        this.templateIds = {
            userCreated: 'template_user_created',
            violationAdded: 'template_violation_added',
            passwordReset: 'template_password_reset',
            systemNotification: 'template_system_notification'
        };
        this.publicKey = 'YOUR_PUBLIC_KEY'; // المفتاح العام من EmailJS
        
        // حالة النظام
        this.isEnabled = this.loadEmailSettings().enabled || false;
        this.isConfigured = false;
        
        this.init();
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
