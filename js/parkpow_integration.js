/**
 * نظام دمج بيانات ParkPow مع قاعدة البيانات المحلية
 * ParkPow Data Integration with Local Database
 * 
 * يتيح استيراد وتحديث قاعدة بيانات السيارات من بيانات ParkPow
 * Allows importing and updating vehicle database from ParkPow data
 */

class ParkPowIntegration {
    constructor() {
        this.parkpowData = null;
        this.vehicleDatabase = window.vehicleDatabase || new VehicleDatabase();
    }

    /**
     * تحميل بيانات ParkPow من الملف
     * Load ParkPow data from file
     */
    async loadParkPowData() {
        try {
            console.log('🔄 تحميل بيانات ParkPow...');
            const response = await fetch('../data/parkpow_vehicles.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.parkpowData = await response.json();
            console.log('✅ تم تحميل بيانات ParkPow بنجاح');
            console.log(`📊 عدد السيارات: ${this.parkpowData.vehicles.length}`);
            
            return this.parkpowData;
        } catch (error) {
            console.error('❌ خطأ في تحميل بيانات ParkPow:', error);
            throw error;
        }
    }

    /**
     * استيراد جميع السيارات إلى قاعدة البيانات المحلية
     * Import all vehicles to local database
     */
    async importAllVehicles(options = {}) {
        const {
            skipDuplicates = true,
            updateExisting = false,
            onProgress = null
        } = options;

        try {
            if (!this.parkpowData) {
                await this.loadParkPowData();
            }

            const vehicles = this.parkpowData.vehicles;
            let imported = 0;
            let skipped = 0;
            let updated = 0;
            let errors = 0;

            console.log(`🔄 بدء استيراد ${vehicles.length} سيارة...`);

            for (let i = 0; i < vehicles.length; i++) {
                const vehicle = vehicles[i];
                
                try {
                    // التحقق من وجود السيارة
                    const existing = this.vehicleDatabase.findVehicleByPlate(vehicle.plateNumber);
                    
                    if (existing.length > 0) {
                        if (updateExisting) {
                            // تحديث البيانات الموجودة
                            this.updateVehicle(existing[0].id, vehicle);
                            updated++;
                        } else if (skipDuplicates) {
                            skipped++;
                            continue;
                        }
                    } else {
                        // إضافة سيارة جديدة
                        this.vehicleDatabase.addVehicle(this.transformVehicle(vehicle));
                        imported++;
                    }

                    // تحديث التقدم
                    if (onProgress) {
                        onProgress({
                            current: i + 1,
                            total: vehicles.length,
                            imported,
                            updated,
                            skipped,
                            errors
                        });
                    }

                } catch (error) {
                    console.error(`❌ خطأ في استيراد السيارة ${vehicle.plateNumber}:`, error);
                    errors++;
                }
            }

            const result = {
                total: vehicles.length,
                imported,
                updated,
                skipped,
                errors,
                success: errors === 0
            };

            console.log('✅ اكتمل الاستيراد:');
            console.log(`   • تم استيراد: ${imported}`);
            console.log(`   • تم تحديث: ${updated}`);
            console.log(`   • تم تخطي: ${skipped}`);
            console.log(`   • أخطاء: ${errors}`);

            return result;

        } catch (error) {
            console.error('❌ خطأ في عملية الاستيراد:', error);
            throw error;
        }
    }

    /**
     * تحويل بيانات ParkPow إلى تنسيق قاعدة البيانات المحلية
     * Transform ParkPow data to local database format
     */
    transformVehicle(parkpowVehicle) {
        return {
            plateNumber: parkpowVehicle.plateNumber,
            vehicleType: parkpowVehicle.vehicleType || 'غير محدد',
            color: parkpowVehicle.color || 'غير محدد',
            make: parkpowVehicle.make,
            model: parkpowVehicle.model,
            year: parkpowVehicle.year,
            ownerName: '',
            ownerPhone: '',
            buildingNumber: '',
            apartmentNumber: '',
            stickerNumber: '',
            region: parkpowVehicle.region,
            confidence: parkpowVehicle.confidence,
            source: 'parkpow_import',
            imageUrl: parkpowVehicle.imageUrl,
            latitude: parkpowVehicle.latitude,
            longitude: parkpowVehicle.longitude,
            notes: `مستورد من ParkPow - ${parkpowVehicle.timestamp}`,
            metadata: {
                parkpowId: parkpowVehicle.id,
                cameraId: parkpowVehicle.cameraId,
                reviewed: parkpowVehicle.reviewed,
                reviewStatus: parkpowVehicle.reviewStatus,
                capturedAt: parkpowVehicle.capturedAt
            }
        };
    }

    /**
     * تحديث بيانات سيارة موجودة
     * Update existing vehicle data
     */
    updateVehicle(vehicleId, newData) {
        // تحديث البيانات في قاعدة البيانات المحلية
        const vehicles = this.vehicleDatabase.loadVehicles();
        const index = vehicles.findIndex(v => v.id === vehicleId);
        
        if (index !== -1) {
            // دمج البيانات القديمة مع الجديدة
            vehicles[index] = {
                ...vehicles[index],
                ...this.transformVehicle(newData),
                id: vehicleId, // الحفاظ على المعرف الأصلي
                updatedAt: new Date().toISOString(),
                updatedFrom: 'parkpow_import'
            };
            
            localStorage.setItem('vehicles', JSON.stringify(vehicles));
            return true;
        }
        
        return false;
    }

    /**
     * الحصول على إحصائيات البيانات
     * Get data statistics
     */
    getStatistics() {
        if (!this.parkpowData) {
            return null;
        }

        return {
            metadata: this.parkpowData.metadata,
            statistics: this.parkpowData.statistics,
            totalVehicles: this.parkpowData.vehicles.length
        };
    }

    /**
     * البحث في بيانات ParkPow
     * Search in ParkPow data
     */
    searchVehicles(query, filters = {}) {
        if (!this.parkpowData) {
            return [];
        }

        let results = this.parkpowData.vehicles;

        // البحث برقم اللوحة
        if (query) {
            results = results.filter(v => 
                v.plateNumber.toLowerCase().includes(query.toLowerCase())
            );
        }

        // تطبيق الفلاتر
        if (filters.vehicleType) {
            results = results.filter(v => v.vehicleType === filters.vehicleType);
        }

        if (filters.color) {
            results = results.filter(v => v.color === filters.color);
        }

        if (filters.region) {
            results = results.filter(v => v.region === filters.region);
        }

        if (filters.minConfidence) {
            results = results.filter(v => v.confidence >= filters.minConfidence);
        }

        return results;
    }

    /**
     * تصدير البيانات المدمجة
     * Export merged data
     */
    exportMergedData() {
        const localVehicles = this.vehicleDatabase.loadVehicles();
        const parkpowVehicles = this.parkpowData ? this.parkpowData.vehicles : [];

        const merged = {
            metadata: {
                exportedAt: new Date().toISOString(),
                source: 'merged_data',
                localCount: localVehicles.length,
                parkpowCount: parkpowVehicles.length,
                totalCount: localVehicles.length + parkpowVehicles.length
            },
            localVehicles,
            parkpowVehicles,
            allVehicles: [...localVehicles, ...parkpowVehicles.map(v => this.transformVehicle(v))]
        };

        return merged;
    }
}

// إنشاء نسخة عامة
window.parkpowIntegration = new ParkPowIntegration();

// دوال مساعدة للاستخدام السريع
window.importParkPowData = async function() {
    try {
        const integration = window.parkpowIntegration;
        await integration.loadParkPowData();
        
        const result = await integration.importAllVehicles({
            skipDuplicates: true,
            updateExisting: false,
            onProgress: (progress) => {
                console.log(`⏳ التقدم: ${progress.current}/${progress.total} (${Math.round(progress.current/progress.total*100)}%)`);
            }
        });
        
        console.log('✅ تم الاستيراد بنجاح:', result);
        return result;
    } catch (error) {
        console.error('❌ خطأ في الاستيراد:', error);
        throw error;
    }
};

console.log('✅ تم تحميل نظام دمج ParkPow');
console.log('📖 للاستخدام: await importParkPowData()');
