/**
 * نظام قاعدة بيانات المركبات الشامل
 * Comprehensive Vehicles Database System
 * 
 * @description نظام متكامل لإدارة قاعدة بيانات المركبات مع التعرف على اللوحات
 * @version 2.0.0
 * @author University Traffic System
 */

class VehiclesDatabaseSystem {
    constructor() {
        this.storageKey = 'vehicles_database';
        this.vehicles = [];
        this.init();
    }

    /**
     * تهيئة النظام
     */
    init() {
        this.loadVehicles();
        console.log('✓ تم تهيئة نظام قاعدة بيانات المركبات');
    }

    /**
     * تحميل المركبات من LocalStorage
     */
    loadVehicles() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.vehicles = data ? JSON.parse(data) : [];
            return this.vehicles;
        } catch (error) {
            console.error('خطأ في تحميل المركبات:', error);
            this.vehicles = [];
            return [];
        }
    }

    /**
     * حفظ المركبات في LocalStorage
     */
    saveVehicles() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.vehicles));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ المركبات:', error);
            return false;
        }
    }

    /**
     * إضافة مركبة جديدة
     */
    addVehicle(vehicleData) {
        try {
            // التحقق من البيانات المطلوبة
            if (!vehicleData.plateNumber) {
                throw new Error('رقم اللوحة مطلوب');
            }

            // التحقق من عدم وجود المركبة
            const exists = this.vehicles.find(v => v.plateNumber === vehicleData.plateNumber);
            if (exists) {
                throw new Error('المركبة موجودة مسبقاً');
            }

            // إنشاء كائن المركبة
            const vehicle = {
                id: this.generateId(),
                plateNumber: vehicleData.plateNumber,
                plateLetters: vehicleData.plateLetters || '',
                plateNumbers: vehicleData.plateNumbers || '',
                
                // معلومات المركبة
                make: vehicleData.make || '',
                model: vehicleData.model || '',
                year: vehicleData.year || '',
                color: vehicleData.color || '',
                vehicleType: vehicleData.vehicleType || 'sedan',
                
                // معلومات المالك
                ownerName: vehicleData.ownerName || '',
                ownerType: vehicleData.ownerType || 'student', // student, staff, faculty, visitor
                nationalId: vehicleData.nationalId || '',
                mobile: vehicleData.mobile || '',
                email: vehicleData.email || '',
                
                // معلومات الجامعة
                universityId: vehicleData.universityId || '',
                department: vehicleData.department || '',
                college: vehicleData.college || '',
                
                // معلومات الملصق
                stickerNumber: vehicleData.stickerNumber || '',
                stickerType: vehicleData.stickerType || 'temporary',
                stickerIssueDate: vehicleData.stickerIssueDate || new Date().toISOString(),
                stickerExpiryDate: vehicleData.stickerExpiryDate || '',
                
                // الحالة
                status: vehicleData.status || 'active', // active, suspended, expired
                isAuthorized: vehicleData.isAuthorized !== false,
                
                // معلومات إضافية
                notes: vehicleData.notes || '',
                images: vehicleData.images || [],
                documents: vehicleData.documents || [],
                
                // معلومات التعرف التلقائي
                recognitionData: vehicleData.recognitionData || null,
                parkpowId: vehicleData.parkpowId || null,
                
                // إحصائيات
                violationsCount: 0,
                entriesCount: 0,
                lastEntry: null,
                
                // التواريخ
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: vehicleData.createdBy || 'system'
            };

            // إضافة المركبة
            this.vehicles.push(vehicle);
            this.saveVehicles();

            console.log('✓ تم إضافة المركبة بنجاح:', vehicle.plateNumber);
            return {
                success: true,
                vehicle: vehicle
            };
        } catch (error) {
            console.error('خطأ في إضافة المركبة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * تحديث مركبة
     */
    updateVehicle(vehicleId, updates) {
        try {
            const index = this.vehicles.findIndex(v => v.id === vehicleId);
            if (index === -1) {
                throw new Error('المركبة غير موجودة');
            }

            // تحديث البيانات
            this.vehicles[index] = {
                ...this.vehicles[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            this.saveVehicles();

            console.log('✓ تم تحديث المركبة بنجاح');
            return {
                success: true,
                vehicle: this.vehicles[index]
            };
        } catch (error) {
            console.error('خطأ في تحديث المركبة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * حذف مركبة
     */
    deleteVehicle(vehicleId) {
        try {
            const index = this.vehicles.findIndex(v => v.id === vehicleId);
            if (index === -1) {
                throw new Error('المركبة غير موجودة');
            }

            const vehicle = this.vehicles[index];
            this.vehicles.splice(index, 1);
            this.saveVehicles();

            console.log('✓ تم حذف المركبة بنجاح');
            return {
                success: true,
                message: 'تم حذف المركبة بنجاح',
                vehicle: vehicle
            };
        } catch (error) {
            console.error('خطأ في حذف المركبة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * البحث عن مركبة برقم اللوحة
     */
    findByPlateNumber(plateNumber) {
        return this.vehicles.find(v => 
            v.plateNumber === plateNumber || 
            v.plateNumber.replace(/\s/g, '') === plateNumber.replace(/\s/g, '')
        );
    }

    /**
     * البحث عن مركبة بالمعرف
     */
    findById(vehicleId) {
        return this.vehicles.find(v => v.id === vehicleId);
    }

    /**
     * البحث المتقدم
     */
    search(criteria) {
        let results = [...this.vehicles];

        // البحث برقم اللوحة
        if (criteria.plateNumber) {
            const searchTerm = criteria.plateNumber.toLowerCase().replace(/\s/g, '');
            results = results.filter(v => 
                v.plateNumber.toLowerCase().replace(/\s/g, '').includes(searchTerm)
            );
        }

        // البحث بالاسم
        if (criteria.ownerName) {
            const searchTerm = criteria.ownerName.toLowerCase();
            results = results.filter(v => 
                v.ownerName.toLowerCase().includes(searchTerm)
            );
        }

        // البحث بنوع المالك
        if (criteria.ownerType) {
            results = results.filter(v => v.ownerType === criteria.ownerType);
        }

        // البحث بالحالة
        if (criteria.status) {
            results = results.filter(v => v.status === criteria.status);
        }

        // البحث بالقسم
        if (criteria.department) {
            results = results.filter(v => v.department === criteria.department);
        }

        // البحث بالكلية
        if (criteria.college) {
            results = results.filter(v => v.college === criteria.college);
        }

        // البحث بنوع المركبة
        if (criteria.vehicleType) {
            results = results.filter(v => v.vehicleType === criteria.vehicleType);
        }

        return results;
    }

    /**
     * جلب جميع المركبات
     */
    getAllVehicles() {
        return this.vehicles;
    }

    /**
     * جلب المركبات النشطة
     */
    getActiveVehicles() {
        return this.vehicles.filter(v => v.status === 'active');
    }

    /**
     * جلب المركبات المعلقة
     */
    getSuspendedVehicles() {
        return this.vehicles.filter(v => v.status === 'suspended');
    }

    /**
     * جلب المركبات المنتهية
     */
    getExpiredVehicles() {
        return this.vehicles.filter(v => v.status === 'expired');
    }

    /**
     * جلب المركبات حسب نوع المالك
     */
    getVehiclesByOwnerType(ownerType) {
        return this.vehicles.filter(v => v.ownerType === ownerType);
    }

    /**
     * تسجيل دخول مركبة
     */
    recordEntry(vehicleId, entryData = {}) {
        try {
            const vehicle = this.findById(vehicleId);
            if (!vehicle) {
                throw new Error('المركبة غير موجودة');
            }

            // تحديث إحصائيات الدخول
            vehicle.entriesCount = (vehicle.entriesCount || 0) + 1;
            vehicle.lastEntry = {
                timestamp: new Date().toISOString(),
                gate: entryData.gate || 'unknown',
                camera: entryData.camera || 'unknown',
                image: entryData.image || null,
                recognitionData: entryData.recognitionData || null
            };

            this.saveVehicles();

            return {
                success: true,
                vehicle: vehicle
            };
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * إضافة مخالفة للمركبة
     */
    addViolation(vehicleId, violationId) {
        try {
            const vehicle = this.findById(vehicleId);
            if (!vehicle) {
                throw new Error('المركبة غير موجودة');
            }

            vehicle.violationsCount = (vehicle.violationsCount || 0) + 1;
            this.saveVehicles();

            return {
                success: true,
                vehicle: vehicle
            };
        } catch (error) {
            console.error('خطأ في إضافة المخالفة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * تعليق مركبة
     */
    suspendVehicle(vehicleId, reason) {
        return this.updateVehicle(vehicleId, {
            status: 'suspended',
            suspensionReason: reason,
            suspendedAt: new Date().toISOString()
        });
    }

    /**
     * إعادة تفعيل مركبة
     */
    activateVehicle(vehicleId) {
        return this.updateVehicle(vehicleId, {
            status: 'active',
            suspensionReason: null,
            suspendedAt: null,
            reactivatedAt: new Date().toISOString()
        });
    }

    /**
     * إضافة صورة للمركبة
     */
    addImage(vehicleId, imageData) {
        try {
            const vehicle = this.findById(vehicleId);
            if (!vehicle) {
                throw new Error('المركبة غير موجودة');
            }

            if (!vehicle.images) {
                vehicle.images = [];
            }

            vehicle.images.push({
                id: this.generateId(),
                url: imageData.url,
                type: imageData.type || 'general',
                uploadedAt: new Date().toISOString()
            });

            this.saveVehicles();

            return {
                success: true,
                vehicle: vehicle
            };
        } catch (error) {
            console.error('خطأ في إضافة الصورة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * جلب الإحصائيات
     */
    getStatistics() {
        const total = this.vehicles.length;
        const active = this.vehicles.filter(v => v.status === 'active').length;
        const suspended = this.vehicles.filter(v => v.status === 'suspended').length;
        const expired = this.vehicles.filter(v => v.status === 'expired').length;

        const byOwnerType = {
            student: this.vehicles.filter(v => v.ownerType === 'student').length,
            staff: this.vehicles.filter(v => v.ownerType === 'staff').length,
            faculty: this.vehicles.filter(v => v.ownerType === 'faculty').length,
            visitor: this.vehicles.filter(v => v.ownerType === 'visitor').length
        };

        const totalViolations = this.vehicles.reduce((sum, v) => sum + (v.violationsCount || 0), 0);
        const totalEntries = this.vehicles.reduce((sum, v) => sum + (v.entriesCount || 0), 0);

        return {
            total,
            active,
            suspended,
            expired,
            byOwnerType,
            totalViolations,
            totalEntries,
            averageViolationsPerVehicle: total > 0 ? (totalViolations / total).toFixed(2) : 0,
            averageEntriesPerVehicle: total > 0 ? (totalEntries / total).toFixed(2) : 0
        };
    }

    /**
     * تصدير البيانات إلى CSV
     */
    exportToCSV() {
        try {
            const headers = [
                'ID', 'رقم اللوحة', 'الماركة', 'الموديل', 'السنة', 'اللون',
                'نوع المركبة', 'اسم المالك', 'نوع المالك', 'رقم الهوية',
                'الجوال', 'البريد الإلكتروني', 'رقم الملصق', 'نوع الملصق',
                'الحالة', 'عدد المخالفات', 'عدد الدخول', 'تاريخ الإنشاء'
            ];

            const rows = this.vehicles.map(v => [
                v.id,
                v.plateNumber,
                v.make,
                v.model,
                v.year,
                v.color,
                v.vehicleType,
                v.ownerName,
                v.ownerType,
                v.nationalId,
                v.mobile,
                v.email,
                v.stickerNumber,
                v.stickerType,
                v.status,
                v.violationsCount || 0,
                v.entriesCount || 0,
                new Date(v.createdAt).toLocaleDateString('ar-SA')
            ]);

            let csv = '\uFEFF' + headers.join(',') + '\n';
            rows.forEach(row => {
                csv += row.map(cell => `"${cell}"`).join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `vehicles_database_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            return {
                success: true,
                message: 'تم تصدير البيانات بنجاح'
            };
        } catch (error) {
            console.error('خطأ في التصدير:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * استيراد البيانات من CSV
     */
    async importFromCSV(file) {
        try {
            const text = await file.text();
            const lines = text.split('\n');
            const imported = [];
            const errors = [];

            // تخطي السطر الأول (العناوين)
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                try {
                    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                    
                    const vehicleData = {
                        plateNumber: values[1],
                        make: values[2],
                        model: values[3],
                        year: values[4],
                        color: values[5],
                        vehicleType: values[6],
                        ownerName: values[7],
                        ownerType: values[8],
                        nationalId: values[9],
                        mobile: values[10],
                        email: values[11],
                        stickerNumber: values[12],
                        stickerType: values[13],
                        status: values[14]
                    };

                    const result = this.addVehicle(vehicleData);
                    if (result.success) {
                        imported.push(vehicleData.plateNumber);
                    } else {
                        errors.push(`السطر ${i + 1}: ${result.error}`);
                    }
                } catch (error) {
                    errors.push(`السطر ${i + 1}: ${error.message}`);
                }
            }

            return {
                success: true,
                imported: imported.length,
                errors: errors
            };
        } catch (error) {
            console.error('خطأ في الاستيراد:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * توليد معرف فريد
     */
    generateId() {
        return 'VEH-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * مسح جميع البيانات
     */
    clearAll() {
        if (confirm('هل أنت متأكد من حذف جميع المركبات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
            this.vehicles = [];
            this.saveVehicles();
            return {
                success: true,
                message: 'تم حذف جميع المركبات'
            };
        }
        return {
            success: false,
            message: 'تم إلغاء العملية'
        };
    }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VehiclesDatabaseSystem;
}

// إنشاء نسخة عامة
window.VehiclesDatabaseSystem = VehiclesDatabaseSystem;
window.vehiclesDB = new VehiclesDatabaseSystem();
