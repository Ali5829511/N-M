/**
 * وحدة دمج ParkPow API
 * ParkPow API Integration Module
 * @version 1.0.0
 * 
 * هذه الوحدة تتيح دمج نظام N-M مع ParkPow للتعرف التلقائي على لوحات السيارات
 */

class ParkPowAPI {
    constructor() {
        this.apiUrl = '';
        this.apiToken = '';
        this.enabled = false;
        this.region = 'sa-riyadh';
        this.config = null;
    }

    /**
     * تهيئة الاتصال بـ ParkPow
     */
    async init() {
        try {
            this.config = await this.loadConfig();
            if (this.config) {
                this.apiUrl = this.config.api_url;
                this.apiToken = this.config.api_token;
                this.enabled = this.config.enabled;
                this.region = this.config.region || 'sa-riyadh';
                
                console.log('✓ تم تهيئة ParkPow API بنجاح');
                return true;
            }
            return false;
        } catch (error) {
            console.error('خطأ في تهيئة ParkPow:', error);
            return false;
        }
    }

    /**
     * تحميل ملف التكوين
     */
    async loadConfig() {
        try {
            // Try multiple possible paths based on where the script is loaded from
            const paths = [
                '../config/parkpow_config.json',  // من داخل مجلد pages
                'config/parkpow_config.json'      // من المجلد الجذر
            ];
            
            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        const config = await response.json();
                        console.log(`✓ تم تحميل التكوين من: ${path}`);
                        return config;
                    }
                } catch (e) {
                    // Log error and try next path
                    console.log(`⚠ فشل تحميل التكوين من ${path}:`, e.message);
                }
            }
            
            throw new Error('فشل تحميل ملف التكوين من جميع المسارات المحتملة');
        } catch (error) {
            console.error('خطأ في تحميل تكوين ParkPow:', error);
            return null;
        }
    }

    /**
     * التحقق من حالة الاتصال
     */
    isEnabled() {
        return this.enabled && this.apiToken && this.apiUrl;
    }

    /**
     * إنشاء أو تحديث مركبة في ParkPow
     */
    async createOrUpdateVehicle(vehicleData) {
        if (!this.isEnabled()) {
            throw new Error('ParkPow غير مفعّل');
        }

        try {
            const response = await fetch(`${this.apiUrl}create-vehicle/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.apiToken}`
                },
                body: JSON.stringify(vehicleData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`خطأ ${response.status}: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('خطأ في إنشاء/تحديث المركبة:', error);
            throw error;
        }
    }

    /**
     * حذف مركبة من ParkPow
     */
    async deleteVehicle(vehicleId) {
        if (!this.isEnabled()) {
            throw new Error('ParkPow غير مفعّل');
        }

        try {
            const response = await fetch(`${this.apiUrl}delete-vehicle/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.apiToken}`
                },
                body: JSON.stringify({ id: vehicleId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('خطأ في حذف المركبة:', error);
            throw error;
        }
    }

    /**
     * إنشاء أو تحديث كاميرا في ParkPow
     */
    async createOrUpdateCamera(cameraData) {
        if (!this.isEnabled()) {
            throw new Error('ParkPow غير مفعّل');
        }

        try {
            const response = await fetch(`${this.apiUrl}create-camera/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.apiToken}`
                },
                body: JSON.stringify(cameraData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('خطأ في إنشاء/تحديث الكاميرا:', error);
            throw error;
        }
    }

    /**
     * الحصول على قائمة الزيارات
     */
    async getVisits(params = {}) {
        if (!this.isEnabled()) {
            throw new Error('ParkPow غير مفعّل');
        }

        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.apiUrl}visits/${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${this.apiToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('خطأ في الحصول على الزيارات:', error);
            throw error;
        }
    }

    /**
     * الحصول على التنبيهات
     */
    async getAlerts() {
        if (!this.isEnabled()) {
            throw new Error('ParkPow غير مفعّل');
        }

        try {
            const response = await fetch(`${this.apiUrl}alerts/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${this.apiToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('خطأ في الحصول على التنبيهات:', error);
            throw error;
        }
    }

    /**
     * مزامنة جميع المركبات من قاعدة البيانات المحلية إلى ParkPow
     */
    async syncAllVehicles() {
        if (!this.isEnabled()) {
            throw new Error('ParkPow غير مفعّل');
        }

        try {
            // الحصول على جميع الملصقات من قاعدة البيانات المحلية
            const stickers = JSON.parse(localStorage.getItem('stickers') || '[]');

            const results = {
                total: stickers.length,
                success: [],
                failed: [],
                errors: []
            };

            for (const sticker of stickers) {
                try {
                    // تحويل بيانات الملصق إلى تنسيق ParkPow
                    const vehicleData = this.convertStickerToVehicle(sticker);
                    
                    // إرسال إلى ParkPow
                    const result = await this.createOrUpdateVehicle(vehicleData);
                    
                    results.success.push({
                        sticker: sticker,
                        parkpow_id: result.id
                    });

                    // حفظ معرّف ParkPow في الملصق المحلي
                    sticker.parkpow_id = result.id;
                } catch (error) {
                    results.failed.push({
                        sticker: sticker,
                        error: error.message
                    });
                    results.errors.push(error.message);
                }
            }

            // تحديث قاعدة البيانات المحلية بمعرّفات ParkPow
            if (results.success.length > 0) {
                localStorage.setItem('stickers', JSON.stringify(stickers));
            }

            return results;
        } catch (error) {
            console.error('خطأ في مزامنة المركبات:', error);
            throw error;
        }
    }

    /**
     * مزامنة مركبة واحدة
     */
    async syncSingleVehicle(sticker) {
        if (!this.isEnabled()) {
            throw new Error('ParkPow غير مفعّل');
        }

        try {
            const vehicleData = this.convertStickerToVehicle(sticker);
            const result = await this.createOrUpdateVehicle(vehicleData);
            
            // حفظ معرّف ParkPow
            sticker.parkpow_id = result.id;
            
            // تحديث في قاعدة البيانات المحلية
            const stickers = JSON.parse(localStorage.getItem('stickers') || '[]');
            const index = stickers.findIndex(s => s.id === sticker.id);
            if (index !== -1) {
                stickers[index] = sticker;
                localStorage.setItem('stickers', JSON.stringify(stickers));
            }

            return result;
        } catch (error) {
            console.error('خطأ في مزامنة المركبة:', error);
            throw error;
        }
    }

    /**
     * تحويل بيانات الملصق إلى تنسيق ParkPow
     */
    convertStickerToVehicle(sticker) {
        return {
            license_plate: sticker.plateNumber || sticker.plate_number || '',
            region: this.region,
            make: sticker.make || '',
            model: sticker.model || '',
            color: sticker.color || '',
            type: sticker.vehicleType || 'sedan',
            field1: `اسم المالك: ${sticker.ownerName || ''}`,
            field2: `رقم الوحدة: ${sticker.unitNumber || ''}`,
            field3: `رقم الملصق: ${sticker.stickerNumber || sticker.id || ''}`,
            field4: `رقم الهوية: ${sticker.nationalId || ''}`,
            field5: `رقم الجوال: ${sticker.mobile || ''}`
        };
    }

    /**
     * حذف مركبة من ParkPow عند حذف الملصق
     */
    async deleteStickerFromParkPow(sticker) {
        if (!this.isEnabled()) {
            return; // لا نرمي خطأ، فقط نتجاهل
        }

        if (sticker.parkpow_id) {
            try {
                await this.deleteVehicle(sticker.parkpow_id);
                console.log(`تم حذف المركبة من ParkPow: ${sticker.parkpow_id}`);
            } catch (error) {
                console.error('خطأ في حذف المركبة من ParkPow:', error);
            }
        }
    }

    /**
     * اختبار الاتصال بـ ParkPow
     */
    async testConnection() {
        if (!this.isEnabled()) {
            return {
                success: false,
                message: 'ParkPow غير مفعّل'
            };
        }

        try {
            // محاولة الحصول على الزيارات كاختبار
            await this.getVisits({ limit: 1 });
            
            return {
                success: true,
                message: 'الاتصال بـ ParkPow ناجح ✓'
            };
        } catch (error) {
            return {
                success: false,
                message: `فشل الاتصال: ${error.message}`
            };
        }
    }
}

// إنشاء نسخة عامة من الكلاس
window.ParkPowAPI = ParkPowAPI;

// إنشاء نسخة جاهزة للاستخدام
window.parkpowAPI = new ParkPowAPI();

// تهيئة تلقائية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await window.parkpowAPI.init();
});
