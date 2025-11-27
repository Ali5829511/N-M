/**
 * نظام التكامل المتقدم مع ParkPow API
 * Advanced ParkPow API Integration System
 * 
 * @description نظام متقدم للتكامل مع ParkPow للتعرف التلقائي على اللوحات وإدارة المخالفات
 * @version 2.0.0
 * @author University Traffic System
 */

class ParkPowAdvancedIntegration {
    constructor() {
        this.apiToken = '64fbe3cdf0861b97a5e08bc9d5116a3d6d17ab66';
        this.baseURL = 'https://app.parkpow.com/api/v1';
        this.licenseKey = '6mBNSb5L6W';
        this.isEnabled = true;
        this.autoSync = true;
        this.syncInterval = 300000; // 5 دقائق
        this.syncTimer = null;
    }

    /**
     * تهيئة النظام
     */
    async init() {
        try {
            console.log('🚀 بدء تهيئة نظام ParkPow المتقدم...');
            
            // اختبار الاتصال
            const testResult = await this.testConnection();
            if (!testResult.success) {
                console.warn('⚠️ فشل الاتصال بـ ParkPow:', testResult.error);
                this.isEnabled = false;
                return false;
            }

            console.log('✓ تم الاتصال بـ ParkPow بنجاح');

            // بدء المزامنة التلقائية
            if (this.autoSync) {
                this.startAutoSync();
            }

            return true;
        } catch (error) {
            console.error('خطأ في تهيئة ParkPow:', error);
            this.isEnabled = false;
            return false;
        }
    }

    /**
     * إعداد الرؤوس للطلبات
     */
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * اختبار الاتصال
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/vehicles/tags?limit=1`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return {
                success: true,
                message: 'الاتصال ناجح'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * معالجة صورة ورقم اللوحة
     */
    async processPlateImage(imageFile) {
        try {
            console.log('🔍 بدء معالجة صورة اللوحة...');

            // تحويل الصورة إلى Base64
            const base64Image = await this.fileToBase64(imageFile);

            // إرسال إلى ParkPow للتعرف
            const recognitionResult = await this.recognizePlate(base64Image);

            if (!recognitionResult.success) {
                throw new Error('فشل التعرف على اللوحة');
            }

            // استخراج البيانات
            const plateData = this.extractPlateData(recognitionResult.data);

            // البحث عن المركبة في قاعدة البيانات
            let vehicle = null;
            if (window.vehiclesDB) {
                vehicle = window.vehiclesDB.findByPlateNumber(plateData.plateNumber);
            }

            return {
                success: true,
                plateData: plateData,
                vehicle: vehicle,
                recognitionData: recognitionResult.data
            };
        } catch (error) {
            console.error('خطأ في معالجة الصورة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * التعرف على اللوحة
     */
    async recognizePlate(imageBase64) {
        try {
            // استخدام Plate Recognizer API
            const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Token 560a4728fc1f0fee1f76d1eb67f001d762a941d9',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    upload: imageBase64,
                    regions: ['sa']
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                throw new Error('لم يتم العثور على لوحة في الصورة');
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('خطأ في التعرف على اللوحة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * استخراج بيانات اللوحة
     */
    extractPlateData(recognitionData) {
        const result = recognitionData.results[0];
        
        return {
            plateNumber: result.plate,
            confidence: result.score,
            region: result.region?.code || 'sa',
            vehicle: {
                type: result.vehicle?.type || 'unknown',
                make: result.vehicle?.make?.[0]?.name || '',
                makeConfidence: result.vehicle?.make?.[0]?.score || 0,
                model: result.vehicle?.model?.[0]?.name || '',
                modelConfidence: result.vehicle?.model?.[0]?.score || 0,
                color: result.vehicle?.color?.[0]?.color || '',
                colorConfidence: result.vehicle?.color?.[0]?.score || 0,
                year: result.vehicle?.year?.[0]?.year || '',
                yearConfidence: result.vehicle?.year?.[0]?.score || 0
            },
            box: result.box,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * تسجيل دخول مركبة تلقائياً
     */
    async autoRecordEntry(plateData, gateInfo = {}) {
        try {
            console.log('📝 تسجيل دخول تلقائي للمركبة:', plateData.plateNumber);

            // البحث عن المركبة
            let vehicle = null;
            if (window.vehiclesDB) {
                vehicle = window.vehiclesDB.findByPlateNumber(plateData.plateNumber);
            }

            // إذا لم توجد المركبة، إنشاء سجل مؤقت
            if (!vehicle) {
                console.log('⚠️ مركبة غير مسجلة:', plateData.plateNumber);
                
                // إنشاء تنبيه للمركبة غير المسجلة
                this.createUnauthorizedAlert(plateData, gateInfo);
                
                return {
                    success: false,
                    error: 'مركبة غير مسجلة',
                    plateData: plateData
                };
            }

            // التحقق من حالة المركبة
            if (vehicle.status === 'suspended') {
                console.log('⚠️ مركبة معلقة:', plateData.plateNumber);
                this.createSuspendedVehicleAlert(vehicle, plateData, gateInfo);
                
                return {
                    success: false,
                    error: 'مركبة معلقة',
                    vehicle: vehicle
                };
            }

            // تسجيل الدخول
            if (window.vehiclesDB) {
                window.vehiclesDB.recordEntry(vehicle.id, {
                    gate: gateInfo.gate || 'unknown',
                    camera: gateInfo.camera || 'unknown',
                    recognitionData: plateData,
                    timestamp: new Date().toISOString()
                });
            }

            console.log('✓ تم تسجيل الدخول بنجاح');
            return {
                success: true,
                vehicle: vehicle,
                plateData: plateData
            };
        } catch (error) {
            console.error('خطأ في تسجيل الدخول التلقائي:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * إنشاء تنبيه لمركبة غير مسجلة
     */
    createUnauthorizedAlert(plateData, gateInfo) {
        const alert = {
            id: this.generateId(),
            type: 'unauthorized_vehicle',
            plateNumber: plateData.plateNumber,
            timestamp: new Date().toISOString(),
            gate: gateInfo.gate || 'unknown',
            camera: gateInfo.camera || 'unknown',
            recognitionData: plateData,
            status: 'active'
        };

        // حفظ التنبيه
        const alerts = JSON.parse(localStorage.getItem('security_alerts') || '[]');
        alerts.push(alert);
        localStorage.setItem('security_alerts', JSON.stringify(alerts));

        console.log('🚨 تم إنشاء تنبيه أمني: مركبة غير مسجلة');
    }

    /**
     * إنشاء تنبيه لمركبة معلقة
     */
    createSuspendedVehicleAlert(vehicle, plateData, gateInfo) {
        const alert = {
            id: this.generateId(),
            type: 'suspended_vehicle',
            plateNumber: plateData.plateNumber,
            vehicleId: vehicle.id,
            timestamp: new Date().toISOString(),
            gate: gateInfo.gate || 'unknown',
            camera: gateInfo.camera || 'unknown',
            recognitionData: plateData,
            status: 'active'
        };

        // حفظ التنبيه
        const alerts = JSON.parse(localStorage.getItem('security_alerts') || '[]');
        alerts.push(alert);
        localStorage.setItem('security_alerts', JSON.stringify(alerts));

        console.log('🚨 تم إنشاء تنبيه أمني: مركبة معلقة');
    }

    /**
     * الكشف التلقائي عن المخالفات
     */
    async autoDetectViolation(plateData, violationType, gateInfo = {}) {
        try {
            console.log('⚠️ كشف مخالفة تلقائي:', violationType);

            // البحث عن المركبة
            let vehicle = null;
            if (window.vehiclesDB) {
                vehicle = window.vehiclesDB.findByPlateNumber(plateData.plateNumber);
            }

            // إنشاء المخالفة
            if (window.violationsDB) {
                const violationData = {
                    plateNumber: plateData.plateNumber,
                    vehicleId: vehicle?.id || null,
                    violationType: violationType,
                    location: gateInfo.location || 'غير محدد',
                    gate: gateInfo.gate || '',
                    camera: gateInfo.camera || '',
                    recognitionData: plateData,
                    isAutoDetected: true,
                    recordedBy: 'auto-system'
                };

                const result = window.violationsDB.addViolation(violationData);
                
                if (result.success) {
                    console.log('✓ تم تسجيل المخالفة تلقائياً');
                    return {
                        success: true,
                        violation: result.violation
                    };
                }
            }

            return {
                success: false,
                error: 'فشل تسجيل المخالفة'
            };
        } catch (error) {
            console.error('خطأ في الكشف التلقائي عن المخالفة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * مزامنة البيانات مع ParkPow
     */
    async syncWithParkPow() {
        try {
            console.log('🔄 بدء المزامنة مع ParkPow...');

            const results = {
                vehicles: { success: 0, failed: 0 },
                violations: { success: 0, failed: 0 },
                errors: []
            };

            // مزامنة المركبات
            if (window.vehiclesDB) {
                const vehicles = window.vehiclesDB.getAllVehicles();
                
                for (const vehicle of vehicles) {
                    try {
                        await this.syncVehicle(vehicle);
                        results.vehicles.success++;
                    } catch (error) {
                        results.vehicles.failed++;
                        results.errors.push(`مركبة ${vehicle.plateNumber}: ${error.message}`);
                    }
                }
            }

            console.log('✓ اكتملت المزامنة:', results);
            return {
                success: true,
                results: results
            };
        } catch (error) {
            console.error('خطأ في المزامنة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * مزامنة مركبة واحدة
     */
    async syncVehicle(vehicle) {
        try {
            const vehicleData = {
                license_plate: vehicle.plateNumber,
                region: 'sa',
                make: vehicle.make || '',
                model: vehicle.model || '',
                color: vehicle.color || '',
                type: vehicle.vehicleType || 'sedan',
                notes: `${vehicle.ownerName} - ${vehicle.ownerType}`
            };

            // إرسال إلى ParkPow
            const response = await fetch(`${this.baseURL}/vehicles/tags`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(vehicleData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            // حفظ معرف ParkPow
            if (window.vehiclesDB) {
                window.vehiclesDB.updateVehicle(vehicle.id, {
                    parkpowId: data.id
                });
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * بدء المزامنة التلقائية
     */
    startAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.syncTimer = setInterval(() => {
            this.syncWithParkPow();
        }, this.syncInterval);

        console.log('✓ تم تفعيل المزامنة التلقائية');
    }

    /**
     * إيقاف المزامنة التلقائية
     */
    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }

        console.log('✓ تم إيقاف المزامنة التلقائية');
    }

    /**
     * تحويل ملف إلى Base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * توليد معرف فريد
     */
    generateId() {
        return 'PKP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * جلب الإحصائيات
     */
    getStatistics() {
        return {
            isEnabled: this.isEnabled,
            autoSync: this.autoSync,
            syncInterval: this.syncInterval,
            lastSync: localStorage.getItem('parkpow_last_sync') || 'لم يتم',
            apiToken: this.apiToken ? '••••••••' + this.apiToken.slice(-8) : 'غير محدد'
        };
    }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParkPowAdvancedIntegration;
}

// إنشاء نسخة عامة
window.ParkPowAdvancedIntegration = ParkPowAdvancedIntegration;
window.parkpowAdvanced = new ParkPowAdvancedIntegration();

// تهيئة تلقائية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await window.parkpowAdvanced.init();
});
