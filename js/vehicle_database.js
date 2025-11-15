/**
 * نظام إدارة قاعدة بيانات السيارات
 * يدير السيارات والمخالفات والتحليلات
 */

class VehicleDatabase {
    constructor() {
        this.vehicles = this.loadVehicles();
        this.violations = this.loadViolations();
        this.plateRecognitions = this.loadPlateRecognitions();
    }

    // تحميل البيانات من localStorage
    loadVehicles() {
        return JSON.parse(localStorage.getItem('vehicles') || '[]');
    }

    loadViolations() {
        return JSON.parse(localStorage.getItem('violations') || '[]');
    }

    loadPlateRecognitions() {
        return JSON.parse(localStorage.getItem('plateRecognitions') || '[]');
    }

    // حفظ البيانات في localStorage
    saveVehicles() {
        localStorage.setItem('vehicles', JSON.stringify(this.vehicles));
    }

    saveViolations() {
        localStorage.setItem('violations', JSON.stringify(this.violations));
    }

    savePlateRecognitions() {
        localStorage.setItem('plateRecognitions', JSON.stringify(this.plateRecognitions));
    }

    // إضافة سيارة جديدة
    addVehicle(vehicleData) {
        const vehicle = {
            id: Date.now() + Math.random(),
            plateNumber: vehicleData.plateNumber,
            vehicleType: vehicleData.vehicleType || 'غير محدد',
            color: vehicleData.color || 'غير محدد',
            ownerName: vehicleData.ownerName || '',
            ownerPhone: vehicleData.ownerPhone || '',
            buildingNumber: vehicleData.buildingNumber || '',
            apartmentNumber: vehicleData.apartmentNumber || '',
            stickerNumber: vehicleData.stickerNumber || '',
            addedDate: new Date().toISOString(),
            source: vehicleData.source || 'manual',
            confidence: vehicleData.confidence || 100,
            status: 'active',
            notes: vehicleData.notes || ''
        };

        this.vehicles.push(vehicle);
        this.saveVehicles();
        return vehicle;
    }

    // البحث عن سيارة برقم اللوحة
    findVehicleByPlate(plateNumber) {
        return this.vehicles.filter(v => 
            v.plateNumber.includes(plateNumber) || plateNumber.includes(v.plateNumber)
        );
    }

    // الحصول على عدد تكرار السيارة
    getVehicleRepeatCount(plateNumber) {
        // عدد المرات في قاعدة البيانات
        const dbCount = this.vehicles.filter(v => v.plateNumber === plateNumber).length;
        
        // عدد المرات في التعرف على اللوحات
        const recognitionCount = this.plateRecognitions.filter(r => r.plateNumber === plateNumber).length;
        
        // عدد المخالفات
        const violationCount = this.violations.filter(v => v.plateNumber === plateNumber).length;
        
        return {
            total: dbCount + recognitionCount + violationCount,
            database: dbCount,
            recognitions: recognitionCount,
            violations: violationCount
        };
    }

    // إضافة نتيجة تعرف على لوحة
    addPlateRecognition(recognitionData) {
        const recognition = {
            id: Date.now() + Math.random(),
            plateNumber: recognitionData.plateNumber,
            vehicleType: recognitionData.vehicleType || 'غير محدد',
            color: recognitionData.color || 'غير محدد',
            confidence: recognitionData.confidence || 0,
            region: recognitionData.region || 'السعودية',
            timestamp: new Date().toISOString(),
            imageName: recognitionData.imageName || '',
            source: 'plate_recognizer',
            rawData: recognitionData.rawData || {}
        };

        this.plateRecognitions.push(recognition);
        this.savePlateRecognitions();
        return recognition;
    }

    // إضافة مخالفة
    addViolation(violationData) {
        const violation = {
            id: Date.now() + Math.random(),
            plateNumber: violationData.plateNumber,
            violationType: violationData.violationType || 'مخالفة مرورية',
            date: violationData.date || new Date().toISOString().split('T')[0],
            time: violationData.time || new Date().toTimeString().split(' ')[0],
            location: violationData.location || 'وحدة إسكان هيئة التدريس',
            buildingNumber: violationData.buildingNumber || '',
            description: violationData.description || '',
            status: violationData.status || 'جديد',
            fine: violationData.fine || 0,
            source: violationData.source || 'manual',
            confidence: violationData.confidence || 100,
            imagePath: violationData.imagePath || '',
            notes: violationData.notes || '',
            createdAt: new Date().toISOString()
        };

        this.violations.push(violation);
        this.saveViolations();
        return violation;
    }

    // البحث عن مخالفات سيارة معينة
    getVehicleViolations(plateNumber) {
        return this.violations.filter(v => v.plateNumber === plateNumber);
    }

    // الحصول على السيارات المتكررة في المخالفات
    getRepeatedViolators(minCount = 3) {
        const plateCounts = {};
        
        this.violations.forEach(v => {
            if (!plateCounts[v.plateNumber]) {
                plateCounts[v.plateNumber] = {
                    plateNumber: v.plateNumber,
                    count: 0,
                    violations: []
                };
            }
            plateCounts[v.plateNumber].count++;
            plateCounts[v.plateNumber].violations.push(v);
        });

        return Object.values(plateCounts)
            .filter(p => p.count >= minCount)
            .sort((a, b) => b.count - a.count);
    }

    // الحصول على إحصائيات شاملة
    getStatistics() {
        const uniquePlates = new Set([
            ...this.vehicles.map(v => v.plateNumber),
            ...this.plateRecognitions.map(r => r.plateNumber)
        ]);

        const repeatedVehicles = Array.from(uniquePlates).filter(plate => {
            const count = this.getVehicleRepeatCount(plate);
            return count.total > 1;
        });

        return {
            totalVehicles: this.vehicles.length,
            uniqueVehicles: uniquePlates.size,
            totalRecognitions: this.plateRecognitions.length,
            totalViolations: this.violations.length,
            repeatedVehicles: repeatedVehicles.length,
            activeViolations: this.violations.filter(v => v.status === 'جديد').length,
            resolvedViolations: this.violations.filter(v => v.status === 'محلول').length
        };
    }

    // الحصول على السيارات الجديدة (لم تكن موجودة من قبل)
    getNewVehicles(plateNumbers) {
        return plateNumbers.filter(plate => {
            const existing = this.findVehicleByPlate(plate);
            return existing.length === 0;
        });
    }

    // ربط السيارة مع بيانات الساكن
    linkVehicleToResident(plateNumber, residentData) {
        const vehicles = this.findVehicleByPlate(plateNumber);
        
        vehicles.forEach(vehicle => {
            vehicle.ownerName = residentData.name;
            vehicle.ownerPhone = residentData.phone;
            vehicle.buildingNumber = residentData.buildingNumber;
            vehicle.apartmentNumber = residentData.apartmentNumber;
            vehicle.linkedAt = new Date().toISOString();
        });

        this.saveVehicles();
        return vehicles;
    }

    // تحديث حالة المخالفة
    updateViolationStatus(violationId, newStatus, notes = '') {
        const violation = this.violations.find(v => v.id === violationId);
        if (violation) {
            violation.status = newStatus;
            violation.notes = notes;
            violation.updatedAt = new Date().toISOString();
            this.saveViolations();
            return violation;
        }
        return null;
    }

    // حذف سيارة
    deleteVehicle(vehicleId) {
        this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
        this.saveVehicles();
    }

    // حذف مخالفة
    deleteViolation(violationId) {
        this.violations = this.violations.filter(v => v.id !== violationId);
        this.saveViolations();
    }

    // تصدير البيانات إلى CSV
    exportToCSV(dataType = 'vehicles') {
        let data, headers, filename;

        switch(dataType) {
            case 'vehicles':
                data = this.vehicles;
                headers = ['رقم اللوحة', 'نوع المركبة', 'اللون', 'اسم المالك', 'رقم الجوال', 'رقم المبنى', 'رقم الشقة', 'تاريخ الإضافة'];
                filename = 'vehicles';
                break;
            case 'violations':
                data = this.violations;
                headers = ['رقم اللوحة', 'نوع المخالفة', 'التاريخ', 'الوقت', 'الموقع', 'الحالة', 'الغرامة'];
                filename = 'violations';
                break;
            case 'recognitions':
                data = this.plateRecognitions;
                headers = ['رقم اللوحة', 'نوع المركبة', 'اللون', 'الدقة', 'التاريخ'];
                filename = 'plate_recognitions';
                break;
        }

        let csv = headers.join(',') + '\n';

        data.forEach(item => {
            const row = this.formatRowForCSV(item, dataType);
            csv += row.join(',') + '\n';
        });

        return {
            content: '\ufeff' + csv,
            filename: `${filename}_${Date.now()}.csv`
        };
    }

    formatRowForCSV(item, dataType) {
        switch(dataType) {
            case 'vehicles':
                return [
                    item.plateNumber,
                    item.vehicleType,
                    item.color,
                    item.ownerName,
                    item.ownerPhone,
                    item.buildingNumber,
                    item.apartmentNumber,
                    new Date(item.addedDate).toLocaleDateString('ar-SA')
                ];
            case 'violations':
                return [
                    item.plateNumber,
                    item.violationType,
                    item.date,
                    item.time,
                    item.location,
                    item.status,
                    item.fine
                ];
            case 'recognitions':
                return [
                    item.plateNumber,
                    item.vehicleType,
                    item.color,
                    item.confidence + '%',
                    new Date(item.timestamp).toLocaleDateString('ar-SA')
                ];
        }
    }

    // البحث المتقدم
    advancedSearch(criteria) {
        let results = this.vehicles;

        if (criteria.plateNumber) {
            results = results.filter(v => v.plateNumber.includes(criteria.plateNumber));
        }

        if (criteria.vehicleType) {
            results = results.filter(v => v.vehicleType === criteria.vehicleType);
        }

        if (criteria.color) {
            results = results.filter(v => v.color === criteria.color);
        }

        if (criteria.buildingNumber) {
            results = results.filter(v => v.buildingNumber === criteria.buildingNumber);
        }

        if (criteria.ownerName) {
            results = results.filter(v => v.ownerName.includes(criteria.ownerName));
        }

        return results;
    }

    // الحصول على تقرير المخالفات حسب النوع
    getViolationsByType() {
        const types = {};
        
        this.violations.forEach(v => {
            if (!types[v.violationType]) {
                types[v.violationType] = {
                    type: v.violationType,
                    count: 0,
                    violations: []
                };
            }
            types[v.violationType].count++;
            types[v.violationType].violations.push(v);
        });

        return Object.values(types).sort((a, b) => b.count - a.count);
    }

    // الحصول على تقرير المخالفات حسب المبنى
    getViolationsByBuilding() {
        const buildings = {};
        
        this.violations.forEach(v => {
            const building = v.buildingNumber || 'غير محدد';
            if (!buildings[building]) {
                buildings[building] = {
                    building: building,
                    count: 0,
                    violations: []
                };
            }
            buildings[building].count++;
            buildings[building].violations.push(v);
        });

        return Object.values(buildings).sort((a, b) => b.count - a.count);
    }

    // مسح جميع البيانات
    clearAllData() {
        if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
            this.vehicles = [];
            this.violations = [];
            this.plateRecognitions = [];
            this.saveVehicles();
            this.saveViolations();
            this.savePlateRecognitions();
            return true;
        }
        return false;
    }
}

// إنشاء نسخة عامة من قاعدة البيانات
const vehicleDB = new VehicleDatabase();
