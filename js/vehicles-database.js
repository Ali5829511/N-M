/**
 * نظام قاعدة بيانات السيارات
 * يدير معلومات السيارات، الصور، والتاريخ
 */

class VehiclesDatabase {
    constructor() {
        this.storageKey = 'vehicles_database';
        this.imagesKey = 'vehicles_images';
        this.historyKey = 'vehicles_history';
        this.init();
    }

    /**
     * تهيئة قاعدة البيانات
     */
    init() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.imagesKey)) {
            localStorage.setItem(this.imagesKey, JSON.stringify({}));
        }
        if (!localStorage.getItem(this.historyKey)) {
            localStorage.setItem(this.historyKey, JSON.stringify([]));
        }
    }

    /**
     * الحصول على جميع السيارات
     * @returns {Array} - قائمة السيارات
     */
    getAllVehicles() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    /**
     * الحصول على سيارة بواسطة رقم اللوحة
     * @param {string} plateNumber - رقم اللوحة
     * @returns {Object|null} - بيانات السيارة
     */
    getVehicleByPlate(plateNumber) {
        const vehicles = this.getAllVehicles();
        return vehicles.find(v => v.plateNumber === plateNumber) || null;
    }

    /**
     * الحصول على سيارات ساكن معين
     * @param {string} nationalId - رقم الهوية الوطنية
     * @returns {Array} - قائمة السيارات
     */
    getVehiclesByResident(nationalId) {
        const vehicles = this.getAllVehicles();
        return vehicles.filter(v => v.nationalId === nationalId);
    }

    /**
     * إضافة سيارة جديدة
     * @param {Object} vehicleData - بيانات السيارة
     * @returns {Object} - نتيجة العملية
     */
    addVehicle(vehicleData) {
        try {
            const vehicles = this.getAllVehicles();
            
            // التحقق من عدم تكرار رقم اللوحة
            if (vehicles.some(v => v.plateNumber === vehicleData.plateNumber)) {
                return {
                    success: false,
                    error: 'رقم اللوحة موجود مسبقاً'
                };
            }

            // إنشاء معرف فريد
            const vehicleId = this.generateId();

            // إنشاء كائن السيارة
            const vehicle = {
                id: vehicleId,
                plateNumber: vehicleData.plateNumber,
                vehicleType: vehicleData.vehicleType || '',
                vehicleBrand: vehicleData.vehicleBrand || '',
                vehicleModel: vehicleData.vehicleModel || '',
                vehicleYear: vehicleData.vehicleYear || '',
                vehicleColor: vehicleData.vehicleColor || '',
                nationalId: vehicleData.nationalId || '',
                residentName: vehicleData.residentName || '',
                unitType: vehicleData.unitType || '',
                building: vehicleData.building || '',
                apartment: vehicleData.apartment || '',
                status: vehicleData.status || 'نشط',
                registrationDate: vehicleData.registrationDate || new Date().toISOString(),
                notes: vehicleData.notes || '',
                stickerId: vehicleData.stickerId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            vehicles.push(vehicle);
            localStorage.setItem(this.storageKey, JSON.stringify(vehicles));

            // إضافة سجل في التاريخ
            this.addHistory({
                vehicleId: vehicleId,
                action: 'إضافة سيارة',
                details: `تم إضافة سيارة برقم لوحة: ${vehicle.plateNumber}`,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                vehicle: vehicle
            };
        } catch (error) {
            console.error('خطأ في إضافة السيارة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * تحديث بيانات سيارة
     * @param {string} vehicleId - معرف السيارة
     * @param {Object} updates - التحديثات
     * @returns {Object} - نتيجة العملية
     */
    updateVehicle(vehicleId, updates) {
        try {
            const vehicles = this.getAllVehicles();
            const index = vehicles.findIndex(v => v.id === vehicleId);

            if (index === -1) {
                return {
                    success: false,
                    error: 'السيارة غير موجودة'
                };
            }

            // تحديث البيانات
            vehicles[index] = {
                ...vehicles[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(vehicles));

            // إضافة سجل في التاريخ
            this.addHistory({
                vehicleId: vehicleId,
                action: 'تحديث بيانات',
                details: `تم تحديث بيانات السيارة: ${vehicles[index].plateNumber}`,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                vehicle: vehicles[index]
            };
        } catch (error) {
            console.error('خطأ في تحديث السيارة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * حذف سيارة
     * @param {string} vehicleId - معرف السيارة
     * @returns {Object} - نتيجة العملية
     */
    deleteVehicle(vehicleId) {
        try {
            const vehicles = this.getAllVehicles();
            const vehicle = vehicles.find(v => v.id === vehicleId);

            if (!vehicle) {
                return {
                    success: false,
                    error: 'السيارة غير موجودة'
                };
            }

            // حذف السيارة
            const filtered = vehicles.filter(v => v.id !== vehicleId);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));

            // حذف الصور المرتبطة
            this.deleteVehicleImages(vehicleId);

            // إضافة سجل في التاريخ
            this.addHistory({
                vehicleId: vehicleId,
                action: 'حذف سيارة',
                details: `تم حذف السيارة: ${vehicle.plateNumber}`,
                timestamp: new Date().toISOString()
            });

            return {
                success: true
            };
        } catch (error) {
            console.error('خطأ في حذف السيارة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * إضافة صورة لسيارة
     * @param {string} vehicleId - معرف السيارة
     * @param {string} imageData - بيانات الصورة (Base64)
     * @param {string} imageType - نوع الصورة (plate, front, back, side, other)
     * @returns {Object} - نتيجة العملية
     */
    addVehicleImage(vehicleId, imageData, imageType = 'other') {
        try {
            const images = JSON.parse(localStorage.getItem(this.imagesKey) || '{}');
            
            if (!images[vehicleId]) {
                images[vehicleId] = [];
            }

            const imageId = this.generateId();
            const image = {
                id: imageId,
                vehicleId: vehicleId,
                imageData: imageData,
                imageType: imageType,
                uploadedAt: new Date().toISOString()
            };

            images[vehicleId].push(image);
            localStorage.setItem(this.imagesKey, JSON.stringify(images));

            // إضافة سجل في التاريخ
            this.addHistory({
                vehicleId: vehicleId,
                action: 'إضافة صورة',
                details: `تم إضافة صورة من نوع: ${imageType}`,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                image: image
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
     * الحصول على صور سيارة
     * @param {string} vehicleId - معرف السيارة
     * @returns {Array} - قائمة الصور
     */
    getVehicleImages(vehicleId) {
        const images = JSON.parse(localStorage.getItem(this.imagesKey) || '{}');
        return images[vehicleId] || [];
    }

    /**
     * حذف صورة
     * @param {string} vehicleId - معرف السيارة
     * @param {string} imageId - معرف الصورة
     * @returns {Object} - نتيجة العملية
     */
    deleteImage(vehicleId, imageId) {
        try {
            const images = JSON.parse(localStorage.getItem(this.imagesKey) || '{}');
            
            if (images[vehicleId]) {
                images[vehicleId] = images[vehicleId].filter(img => img.id !== imageId);
                localStorage.setItem(this.imagesKey, JSON.stringify(images));
            }

            return {
                success: true
            };
        } catch (error) {
            console.error('خطأ في حذف الصورة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * حذف جميع صور سيارة
     * @param {string} vehicleId - معرف السيارة
     */
    deleteVehicleImages(vehicleId) {
        const images = JSON.parse(localStorage.getItem(this.imagesKey) || '{}');
        delete images[vehicleId];
        localStorage.setItem(this.imagesKey, JSON.stringify(images));
    }

    /**
     * إضافة سجل في التاريخ
     * @param {Object} historyEntry - سجل التاريخ
     */
    addHistory(historyEntry) {
        const history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
        history.unshift(historyEntry); // إضافة في البداية
        
        // الاحتفاظ بآخر 1000 سجل فقط
        if (history.length > 1000) {
            history.splice(1000);
        }
        
        localStorage.setItem(this.historyKey, JSON.stringify(history));
    }

    /**
     * الحصول على تاريخ سيارة
     * @param {string} vehicleId - معرف السيارة
     * @returns {Array} - سجل التاريخ
     */
    getVehicleHistory(vehicleId) {
        const history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
        return history.filter(h => h.vehicleId === vehicleId);
    }

    /**
     * البحث عن سيارات
     * @param {string} query - نص البحث
     * @returns {Array} - نتائج البحث
     */
    searchVehicles(query) {
        if (!query || query.trim() === '') {
            return this.getAllVehicles();
        }

        const vehicles = this.getAllVehicles();
        const lowerQuery = query.toLowerCase();

        return vehicles.filter(v => {
            return (
                v.plateNumber.toLowerCase().includes(lowerQuery) ||
                v.vehicleType.toLowerCase().includes(lowerQuery) ||
                v.vehicleBrand.toLowerCase().includes(lowerQuery) ||
                v.vehicleModel.toLowerCase().includes(lowerQuery) ||
                v.vehicleColor.toLowerCase().includes(lowerQuery) ||
                v.nationalId.includes(lowerQuery) ||
                v.residentName.toLowerCase().includes(lowerQuery)
            );
        });
    }

    /**
     * الحصول على إحصائيات السيارات
     * @returns {Object} - الإحصائيات
     */
    getStatistics() {
        const vehicles = this.getAllVehicles();
        
        const stats = {
            total: vehicles.length,
            active: vehicles.filter(v => v.status === 'نشط').length,
            inactive: vehicles.filter(v => v.status === 'غير نشط').length,
            byUnitType: {},
            byVehicleType: {},
            byColor: {},
            byYear: {},
            withImages: 0,
            withStickers: 0
        };

        const images = JSON.parse(localStorage.getItem(this.imagesKey) || '{}');

        vehicles.forEach(v => {
            // حسب نوع الوحدة
            stats.byUnitType[v.unitType] = (stats.byUnitType[v.unitType] || 0) + 1;

            // حسب نوع المركبة
            const type = v.vehicleType || 'غير محدد';
            stats.byVehicleType[type] = (stats.byVehicleType[type] || 0) + 1;

            // حسب اللون
            const color = v.vehicleColor || 'غير محدد';
            stats.byColor[color] = (stats.byColor[color] || 0) + 1;

            // حسب السنة
            const year = v.vehicleYear || 'غير محدد';
            stats.byYear[year] = (stats.byYear[year] || 0) + 1;

            // مع صور
            if (images[v.id] && images[v.id].length > 0) {
                stats.withImages++;
            }

            // مع ملصقات
            if (v.stickerId) {
                stats.withStickers++;
            }
        });

        return stats;
    }

    /**
     * توليد معرف فريد
     * @returns {string} - المعرف
     */
    generateId() {
        return 'VEH-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * استيراد السيارات من بيانات الملصقات
     * @returns {Object} - نتيجة الاستيراد
     */
    importFromStickers() {
        try {
            // قراءة بيانات الملصقات من real_data.json
            const stickersData = JSON.parse(localStorage.getItem('stickers_data') || '[]');
            
            if (stickersData.length === 0) {
                return {
                    success: false,
                    error: 'لا توجد بيانات ملصقات للاستيراد'
                };
            }

            let imported = 0;
            let skipped = 0;
            let errors = 0;

            stickersData.forEach(sticker => {
                // التحقق من وجود رقم اللوحة
                if (!sticker.plate_number || sticker.plate_number.trim() === '') {
                    skipped++;
                    return;
                }

                // التحقق من عدم وجود السيارة مسبقاً
                if (this.getVehicleByPlate(sticker.plate_number)) {
                    skipped++;
                    return;
                }

                // استخراج معلومات السيارة من نوع المركبة
                const vehicleInfo = this.parseVehicleType(sticker.vehicle_type);

                // إضافة السيارة
                const result = this.addVehicle({
                    plateNumber: sticker.plate_number,
                    vehicleType: vehicleInfo.type,
                    vehicleBrand: vehicleInfo.brand,
                    vehicleModel: vehicleInfo.model,
                    vehicleYear: vehicleInfo.year,
                    vehicleColor: vehicleInfo.color,
                    nationalId: sticker.national_id || '',
                    residentName: sticker.resident_name || '',
                    unitType: sticker.unit_type || '',
                    building: sticker.building || '',
                    apartment: sticker.apartment || '',
                    status: sticker.status === 'فعال' ? 'نشط' : 'غير نشط',
                    registrationDate: sticker.issue_date || new Date().toISOString(),
                    stickerId: sticker.id || null
                });

                if (result.success) {
                    imported++;
                } else {
                    errors++;
                }
            });

            return {
                success: true,
                imported: imported,
                skipped: skipped,
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
     * تحليل نوع المركبة لاستخراج المعلومات
     * @param {string} vehicleTypeString - نص نوع المركبة
     * @returns {Object} - معلومات السيارة
     */
    parseVehicleType(vehicleTypeString) {
        if (!vehicleTypeString) {
            return {
                type: '',
                brand: '',
                model: '',
                year: '',
                color: ''
            };
        }

        const text = vehicleTypeString.trim();
        const result = {
            type: '',
            brand: '',
            model: '',
            year: '',
            color: ''
        };

        // استخراج السنة (4 أرقام)
        const yearMatch = text.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            result.year = yearMatch[0];
        }

        // قائمة الألوان الشائعة
        const colors = ['أبيض', 'أسود', 'رمادي', 'فضي', 'أحمر', 'أزرق', 'أخضر', 'بني', 'ذهبي', 'كحلي', 'رصاصي', 'بيج', 'برتقالي'];
        colors.forEach(color => {
            if (text.includes(color)) {
                result.color = color;
            }
        });

        // استخراج الماركة والموديل (أول كلمة عادة)
        const words = text.split(/\s+/);
        if (words.length > 0) {
            result.brand = words[0];
        }
        if (words.length > 1) {
            result.model = words.slice(1).join(' ');
        }

        // نوع المركبة
        if (text.includes('سيدان')) result.type = 'سيدان';
        else if (text.includes('SUV') || text.includes('جيب')) result.type = 'SUV';
        else if (text.includes('بكب') || text.includes('غمارة')) result.type = 'بكب';
        else if (text.includes('فان') || text.includes('حافلة')) result.type = 'فان';
        else if (text.includes('دراجة')) result.type = 'دراجة نارية';
        else result.type = 'سيارة خاصة';

        return result;
    }

    /**
     * تصدير البيانات إلى JSON
     * @returns {string} - البيانات بصيغة JSON
     */
    exportToJSON() {
        const vehicles = this.getAllVehicles();
        const images = JSON.parse(localStorage.getItem(this.imagesKey) || '{}');
        const history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');

        return JSON.stringify({
            vehicles: vehicles,
            images: images,
            history: history,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * استيراد البيانات من JSON
     * @param {string} jsonData - البيانات بصيغة JSON
     * @returns {Object} - نتيجة الاستيراد
     */
    importFromJSON(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.vehicles) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.vehicles));
            }
            if (data.images) {
                localStorage.setItem(this.imagesKey, JSON.stringify(data.images));
            }
            if (data.history) {
                localStorage.setItem(this.historyKey, JSON.stringify(data.history));
            }

            return {
                success: true,
                message: 'تم استيراد البيانات بنجاح'
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
     * مسح جميع البيانات
     * @returns {Object} - نتيجة العملية
     */
    clearAll() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
            localStorage.setItem(this.imagesKey, JSON.stringify({}));
            localStorage.setItem(this.historyKey, JSON.stringify([]));

            return {
                success: true,
                message: 'تم مسح جميع البيانات'
            };
        } catch (error) {
            console.error('خطأ في المسح:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// إنشاء نسخة عامة من قاعدة البيانات
window.vehiclesDB = new VehiclesDatabase();

console.log('✅ نظام قاعدة بيانات السيارات جاهز');
console.log('عدد السيارات:', window.vehiclesDB.getAllVehicles().length);
