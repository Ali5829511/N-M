/**
 * نظام ربط ملصقات السيارات مع قاعدة البيانات والمخالفات
 * System for linking car stickers with database and violations
 * 
 * يوفر هذا النظام:
 * - ربط ملصقات السيارات مع قاعدة بيانات السيارات
 * - ربط السيارات مع المخالفات المرورية
 * - استعلامات متقدمة عن السيارات والمخالفات
 * - تحليلات وإحصائيات شاملة
 */

class StickersIntegration {
    constructor() {
        this.stickers = [];
        this.vehicles = [];
        this.violations = [];
        this.stickerDeliveries = []; // تتبع تسليم الملصقات
        this.stickerMisuse = []; // تتبع المخالفات في استخدام الملصقات
        this.initialized = false;
    }

    /**
     * تهيئة النظام وتحميل البيانات
     */
    async initialize() {
        try {
            // تحميل ملصقات السيارات
            await this.loadStickers();
            
            // تحميل قاعدة بيانات السيارات
            this.vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
            
            // تحميل المخالفات المرورية
            this.violations = JSON.parse(localStorage.getItem('violations') || '[]');
            
            // تحميل سجلات تسليم الملصقات
            this.stickerDeliveries = JSON.parse(localStorage.getItem('stickerDeliveries') || '[]');
            
            // تحميل سجلات مخالفات استخدام الملصقات
            this.stickerMisuse = JSON.parse(localStorage.getItem('stickerMisuse') || '[]');
            
            // ربط البيانات
            await this.linkData();
            
            this.initialized = true;
            console.log('✓ نظام ربط الملصقات تم تهيئته بنجاح');
            console.log(`  - ملصقات: ${this.stickers.length}`);
            console.log(`  - سيارات: ${this.vehicles.length}`);
            console.log(`  - مخالفات: ${this.violations.length}`);
            console.log(`  - تسليمات قيد الانتظار: ${this.stickerDeliveries.length}`);
            console.log(`  - مخالفات استخدام: ${this.stickerMisuse.length}`);
            
            return { success: true };
        } catch (error) {
            console.error('خطأ في تهيئة نظام الربط:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * تحميل بيانات الملصقات
     */
    async loadStickers() {
        try {
            const response = await fetch('stickers_data.json');
            this.stickers = await response.json();
            return this.stickers;
        } catch (error) {
            console.error('خطأ في تحميل بيانات الملصقات:', error);
            // محاولة التحميل من localStorage كبديل
            this.stickers = JSON.parse(localStorage.getItem('stickers') || '[]');
            return this.stickers;
        }
    }

    /**
     * ربط البيانات بين الملصقات والسيارات والمخالفات
     */
    async linkData() {
        // ربط الملصقات مع السيارات
        for (let sticker of this.stickers) {
            const plateNumber = sticker['رقم لوحة السيارة'];
            const nationalId = sticker['رقم الهوية'];
            
            // البحث عن السيارة المرتبطة
            const relatedVehicles = this.vehicles.filter(v => 
                v.plateNumber === plateNumber || 
                v.stickerNumber === nationalId
            );
            
            // إضافة معلومات الربط
            sticker._linked = {
                vehicles: relatedVehicles.map(v => v.id),
                hasVehicle: relatedVehicles.length > 0
            };
            
            // إذا لم توجد سيارة مرتبطة، نقوم بإنشاء سجل في قاعدة السيارات
            if (relatedVehicles.length === 0 && sticker['حالة'] === 'فعال') {
                const newVehicle = await this.createVehicleFromSticker(sticker);
                if (newVehicle) {
                    sticker._linked.vehicles.push(newVehicle.id);
                    sticker._linked.hasVehicle = true;
                }
            }
        }

        // ربط المخالفات مع الملصقات والسيارات
        for (let violation of this.violations) {
            const plateNumber = violation.plateNumber || violation['رقم اللوحة'];
            
            // البحث عن الملصق المرتبط
            const relatedSticker = this.stickers.find(s => 
                s['رقم لوحة السيارة'] === plateNumber
            );
            
            // البحث عن السيارة المرتبطة
            const relatedVehicle = this.vehicles.find(v => 
                v.plateNumber === plateNumber
            );
            
            // إضافة معلومات الربط
            violation._linked = {
                stickerId: relatedSticker ? relatedSticker['رقم الهوية'] : null,
                vehicleId: relatedVehicle ? relatedVehicle.id : null,
                hasSticker: !!relatedSticker,
                hasVehicle: !!relatedVehicle,
                stickerStatus: relatedSticker ? relatedSticker['حالة'] : null
            };
        }

        // حفظ التحديثات
        this.saveAllData();
    }

    /**
     * إنشاء سجل سيارة من بيانات الملصق
     */
    async createVehicleFromSticker(sticker) {
        try {
            const vehicle = {
                id: Date.now() + Math.random(),
                plateNumber: sticker['رقم لوحة السيارة'],
                vehicleType: sticker['نوع المركبة'] || 'غير محدد',
                ownerName: sticker['اسم الساكن'],
                buildingNumber: sticker['المبنى'],
                apartmentNumber: sticker['شقة'],
                stickerNumber: sticker['رقم الهوية'],
                unit: sticker['نوع الوحدة'],
                stickerStatus: sticker['حالة'],
                stickerDate: sticker['تاريخ الملصق'],
                addedDate: new Date().toISOString(),
                source: 'sticker_integration',
                status: sticker['حالة'] === 'فعال' ? 'active' : 'inactive',
                notes: `تم الربط تلقائياً من ملصقات السيارات`
            };

            this.vehicles.push(vehicle);
            return vehicle;
        } catch (error) {
            console.error('خطأ في إنشاء سيارة من الملصق:', error);
            return null;
        }
    }

    /**
     * البحث عن سيارة برقم اللوحة مع معلومات الملصق والمخالفات
     */
    findVehicleByPlate(plateNumber) {
        // البحث عن السيارة
        const vehicle = this.vehicles.find(v => v.plateNumber === plateNumber);
        
        // البحث عن الملصق
        const sticker = this.stickers.find(s => s['رقم لوحة السيارة'] === plateNumber);
        
        // البحث عن المخالفات
        const violations = this.violations.filter(v => 
            (v.plateNumber || v['رقم اللوحة']) === plateNumber
        );

        return {
            vehicle: vehicle || null,
            sticker: sticker || null,
            violations: violations || [],
            hasSticker: !!sticker,
            stickerStatus: sticker ? sticker['حالة'] : null,
            violationsCount: violations.length,
            ownerName: sticker ? sticker['اسم الساكن'] : (vehicle ? vehicle.ownerName : null),
            building: sticker ? sticker['المبنى'] : (vehicle ? vehicle.buildingNumber : null)
        };
    }

    /**
     * البحث عن معلومات كاملة برقم الهوية
     */
    findByNationalId(nationalId) {
        // البحث عن جميع الملصقات لهذا الشخص
        const stickers = this.stickers.filter(s => s['رقم الهوية'] === nationalId);
        
        // جمع أرقام اللوحات
        const plateNumbers = stickers.map(s => s['رقم لوحة السيارة']);
        
        // البحث عن السيارات
        const vehicles = this.vehicles.filter(v => 
            plateNumbers.includes(v.plateNumber) || v.stickerNumber === nationalId
        );
        
        // البحث عن المخالفات
        const violations = this.violations.filter(v => 
            plateNumbers.includes(v.plateNumber || v['رقم اللوحة'])
        );

        return {
            nationalId: nationalId,
            ownerName: stickers[0] ? stickers[0]['اسم الساكن'] : null,
            stickers: stickers,
            vehicles: vehicles,
            violations: violations,
            stickersCount: stickers.length,
            activeStickersCount: stickers.filter(s => s['حالة'] === 'فعال').length,
            cancelledStickersCount: stickers.filter(s => s['حالة'] === 'ملغي').length,
            violationsCount: violations.length
        };
    }

    /**
     * الحصول على إحصائيات شاملة
     */
    getStatistics() {
        // إحصائيات الملصقات
        const activeStickers = this.stickers.filter(s => s['حالة'] === 'فعال').length;
        const cancelledStickers = this.stickers.filter(s => s['حالة'] === 'ملغي').length;
        
        // إحصائيات السيارات
        const vehiclesWithStickers = this.vehicles.filter(v => v.stickerNumber).length;
        const vehiclesWithoutStickers = this.vehicles.filter(v => !v.stickerNumber).length;
        
        // إحصائيات المخالفات
        const violationsWithStickers = this.violations.filter(v => v._linked?.hasSticker).length;
        const violationsWithoutStickers = this.violations.filter(v => !v._linked?.hasSticker).length;
        
        // الملاك الأكثر مخالفات
        const ownerViolations = {};
        this.violations.forEach(v => {
            if (v._linked?.stickerId) {
                const sticker = this.stickers.find(s => s['رقم الهوية'] === v._linked.stickerId);
                if (sticker) {
                    const owner = sticker['اسم الساكن'];
                    ownerViolations[owner] = (ownerViolations[owner] || 0) + 1;
                }
            }
        });
        
        const topViolators = Object.entries(ownerViolations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, violations: count }));

        // إحصائيات التسليم والتفعيل
        const deliveredNotActivated = this.stickerDeliveries.filter(d => d.status === 'delivered_not_activated').length;
        const activatedStickers = this.stickerDeliveries.filter(d => d.status === 'activated').length;
        
        // إحصائيات مخالفات الاستخدام
        const reportedMisuses = this.stickerMisuse.filter(m => m.status === 'reported').length;
        const confirmedMisuses = this.stickerMisuse.filter(m => m.status === 'confirmed').length;
        const resolvedMisuses = this.stickerMisuse.filter(m => m.status === 'resolved').length;

        return {
            stickers: {
                total: this.stickers.length,
                active: activeStickers,
                cancelled: cancelledStickers,
                activePercentage: ((activeStickers / this.stickers.length) * 100).toFixed(2)
            },
            vehicles: {
                total: this.vehicles.length,
                withStickers: vehiclesWithStickers,
                withoutStickers: vehiclesWithoutStickers,
                stickerCoverage: ((vehiclesWithStickers / this.vehicles.length) * 100).toFixed(2)
            },
            violations: {
                total: this.violations.length,
                withStickers: violationsWithStickers,
                withoutStickers: violationsWithoutStickers,
                stickerCoverage: ((violationsWithStickers / this.violations.length) * 100).toFixed(2)
            },
            // إحصائيات التسليم والتفعيل
            deliveryTracking: {
                totalDeliveries: this.stickerDeliveries.length,
                deliveredNotActivated: deliveredNotActivated,
                activatedStickers: activatedStickers,
                activationRate: this.stickerDeliveries.length > 0 ? 
                    ((activatedStickers / this.stickerDeliveries.length) * 100).toFixed(2) : '0.00'
            },
            // إحصائيات مخالفات الاستخدام
            misuseTracking: {
                totalMisuses: this.stickerMisuse.length,
                reported: reportedMisuses,
                confirmed: confirmedMisuses,
                resolved: resolvedMisuses,
                pending: reportedMisuses + confirmedMisuses,
                resolutionRate: this.stickerMisuse.length > 0 ? 
                    ((resolvedMisuses / this.stickerMisuse.length) * 100).toFixed(2) : '0.00'
            },
            topViolators: topViolators,
            dataLinks: {
                stickersLinkedToVehicles: this.stickers.filter(s => s._linked?.hasVehicle).length,
                violationsLinkedToStickers: violationsWithStickers,
                completeDataIntegrity: ((violationsWithStickers / this.violations.length) * 100).toFixed(2) + '%'
            }
        };
    }

    /**
     * حفظ جميع البيانات
     */
    saveAllData() {
        try {
            localStorage.setItem('vehicles', JSON.stringify(this.vehicles));
            localStorage.setItem('violations', JSON.stringify(this.violations));
            localStorage.setItem('stickers', JSON.stringify(this.stickers));
            return { success: true };
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * إضافة مخالفة مرتبطة بملصق
     */
    async addViolationWithStickerLink(violationData) {
        const plateNumber = violationData.plateNumber || violationData['رقم اللوحة'];
        
        // البحث عن الملصق المرتبط
        const sticker = this.stickers.find(s => s['رقم لوحة السيارة'] === plateNumber);
        
        // إضافة معلومات الملصق إلى المخالفة
        const enhancedViolation = {
            ...violationData,
            stickerNumber: sticker ? sticker['رقم الهوية'] : null,
            ownerName: sticker ? sticker['اسم الساكن'] : null,
            stickerStatus: sticker ? sticker['حالة'] : null,
            building: sticker ? sticker['المبنى'] : null,
            apartment: sticker ? sticker['شقة'] : null,
            hasValidSticker: sticker && sticker['حالة'] === 'فعال',
            _linked: {
                stickerId: sticker ? sticker['رقم الهوية'] : null,
                hasSticker: !!sticker
            }
        };

        this.violations.push(enhancedViolation);
        this.saveAllData();
        
        return enhancedViolation;
    }

    /**
     * التحقق من صحة ملصق السيارة
     */
    validateSticker(plateNumber) {
        const sticker = this.stickers.find(s => s['رقم لوحة السيارة'] === plateNumber);
        
        if (!sticker) {
            return {
                valid: false,
                status: 'لا يوجد ملصق',
                message: 'هذه السيارة لا تملك ملصق مسجل'
            };
        }
        
        if (sticker['حالة'] === 'ملغي') {
            return {
                valid: false,
                status: 'ملصق ملغي',
                message: 'ملصق هذه السيارة تم إلغاؤه',
                sticker: sticker
            };
        }
        
        return {
            valid: true,
            status: 'ملصق فعال',
            message: 'الملصق صالح وفعال',
            sticker: sticker
        };
    }

    /**
     * تسجيل تسليم ملصق قبل التفعيل
     * Register sticker delivery before activation
     */
    registerStickerDelivery(deliveryData) {
        const delivery = {
            id: Date.now() + Math.random(),
            stickerNumber: deliveryData.stickerNumber || deliveryData['رقم الهوية'],
            residentName: deliveryData.residentName || deliveryData['اسم الساكن'],
            plateNumber: deliveryData.plateNumber || deliveryData['رقم لوحة السيارة'],
            deliveryDate: deliveryData.deliveryDate || new Date().toISOString().split('T')[0],
            deliveredBy: deliveryData.deliveredBy || 'النظام',
            status: 'delivered_not_activated', // تم التسليم ولم يتم التفعيل
            activationDate: null,
            building: deliveryData.building || deliveryData['المبنى'],
            apartment: deliveryData.apartment || deliveryData['شقة'],
            notes: deliveryData.notes || '',
            createdDate: new Date().toISOString()
        };

        this.stickerDeliveries.push(delivery);
        this.saveStickerDeliveries();
        
        return {
            success: true,
            delivery: delivery
        };
    }

    /**
     * تفعيل ملصق تم تسليمه
     * Activate a delivered sticker
     */
    activateDeliveredSticker(stickerNumber) {
        const delivery = this.stickerDeliveries.find(d => 
            d.stickerNumber === stickerNumber && d.status === 'delivered_not_activated'
        );

        if (!delivery) {
            return {
                success: false,
                error: 'لم يتم العثور على سجل تسليم لهذا الملصق'
            };
        }

        delivery.status = 'activated';
        delivery.activationDate = new Date().toISOString().split('T')[0];
        this.saveStickerDeliveries();

        return {
            success: true,
            message: 'تم تفعيل الملصق بنجاح',
            delivery: delivery
        };
    }

    /**
     * تسجيل مخالفة استخدام ملصق
     * Register sticker misuse (used by relatives or others)
     */
    registerStickerMisuse(misuseData) {
        const misuse = {
            id: Date.now() + Math.random(),
            stickerNumber: misuseData.stickerNumber || misuseData['رقم الهوية'],
            originalOwner: misuseData.originalOwner || misuseData['اسم الساكن'],
            registeredPlate: misuseData.registeredPlate || misuseData['رقم لوحة السيارة المسجلة'],
            actualPlate: misuseData.actualPlate || misuseData['رقم اللوحة الفعلية'],
            misuseType: misuseData.misuseType || 'استخدام من قبل أقارب', // نوع المخالفة
            detectedDate: misuseData.detectedDate || new Date().toISOString().split('T')[0],
            detectedBy: misuseData.detectedBy || 'النظام',
            actualUser: misuseData.actualUser || 'غير محدد',
            relationToOwner: misuseData.relationToOwner || 'قريب',
            status: 'reported', // reported, under_investigation, confirmed, resolved
            resolution: null,
            resolutionDate: null,
            notes: misuseData.notes || '',
            createdDate: new Date().toISOString()
        };

        this.stickerMisuse.push(misuse);
        this.saveStickerMisuse();

        // تحديث حالة الملصق في قاعدة البيانات
        const sticker = this.stickers.find(s => s['رقم الهوية'] === misuse.stickerNumber);
        if (sticker) {
            sticker._misused = true;
            sticker._misuseDetails = misuse;
        }

        return {
            success: true,
            misuse: misuse
        };
    }

    /**
     * حل/معالجة مخالفة استخدام ملصق
     * Resolve sticker misuse case
     */
    resolveStickerMisuse(misuseId, resolution) {
        const misuse = this.stickerMisuse.find(m => m.id === misuseId);

        if (!misuse) {
            return {
                success: false,
                error: 'لم يتم العثور على سجل المخالفة'
            };
        }

        misuse.status = 'resolved';
        misuse.resolution = resolution;
        misuse.resolutionDate = new Date().toISOString().split('T')[0];
        this.saveStickerMisuse();

        return {
            success: true,
            message: 'تم حل المخالفة',
            misuse: misuse
        };
    }

    /**
     * الحصول على جميع الملصقات التي لم يتم تفعيلها بعد التسليم
     */
    getUnactivatedStickers() {
        return this.stickerDeliveries.filter(d => d.status === 'delivered_not_activated');
    }

    /**
     * الحصول على جميع مخالفات استخدام الملصقات
     */
    getAllStickerMisuses(statusFilter = null) {
        if (statusFilter) {
            return this.stickerMisuse.filter(m => m.status === statusFilter);
        }
        return this.stickerMisuse;
    }

    /**
     * حفظ سجلات تسليم الملصقات
     */
    saveStickerDeliveries() {
        try {
            localStorage.setItem('stickerDeliveries', JSON.stringify(this.stickerDeliveries));
            return { success: true };
        } catch (error) {
            console.error('خطأ في حفظ سجلات التسليم:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * حفظ سجلات مخالفات الاستخدام
     */
    saveStickerMisuse() {
        try {
            localStorage.setItem('stickerMisuse', JSON.stringify(this.stickerMisuse));
            return { success: true };
        } catch (error) {
            console.error('خطأ في حفظ سجلات المخالفات:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * تصدير البيانات المرتبطة
     */
    exportLinkedData() {
        return {
            timestamp: new Date().toISOString(),
            summary: this.getStatistics(),
            data: {
                stickers: this.stickers,
                vehicles: this.vehicles,
                violations: this.violations,
                deliveries: this.stickerDeliveries,
                misuses: this.stickerMisuse
            }
        };
    }
}

// إنشاء نسخة عامة من النظام
window.stickersIntegration = new StickersIntegration();

// تهيئة تلقائية عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.stickersIntegration.initialize();
    });
} else {
    window.stickersIntegration.initialize();
}
