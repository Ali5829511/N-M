/**
 * بيانات الوحدات السكنية التجريبية
 * Residential Units Sample Data
 * @version 1.0.0
 */

class ResidentialUnitsData {
    constructor() {
        this.storageKey = 'residential_units';
        this.init();
    }

    /**
     * تهيئة البيانات التجريبية
     */
    init() {
        if (!localStorage.getItem(this.storageKey)) {
            this.createSampleData();
        }
    }

    /**
     * إنشاء بيانات تجريبية شاملة
     */
    createSampleData() {
        const units = [];
        let unitId = 1;

        // 1. المباني القديمة (30 عمارة: 1-30)
        for (let buildingNum = 1; buildingNum <= 30; buildingNum++) {
            const floors = [0, 1, 2, 3, 4]; // الأدوار
            const unitsPerFloor = [1, 2, 3, 4]; // الشقق في كل دور

            floors.forEach(floor => {
                unitsPerFloor.forEach(unitNum => {
                    const fullUnitNum = floor * 10 + unitNum;
                    const isOccupied = Math.random() > 0.05; // 95% مشغول
                    
                    units.push({
                        id: unitId++,
                        unit_number: fullUnitNum,
                        building_number: buildingNum,
                        unit_name: `شقة ${fullUnitNum} عمارة ${buildingNum}`,
                        building_category: 'قديم',
                        building_description: `عمارة ${buildingNum} - المباني القديمة`,
                        unit_type: 'شقة',
                        occupancy_status: isOccupied ? 'مشغول' : 'شاغر',
                        is_occupied: isOccupied,
                        floor_number: floor,
                        resident_name: isOccupied ? this.generateRandomName() : null,
                        resident_phone: isOccupied ? this.generateRandomPhone() : null,
                        parking_number: `P-${buildingNum}-${fullUnitNum}`,
                        area_sqm: 120,
                        rooms_count: 3
                    });
                });
            });
        }

        // 2. المباني الجديدة (21 عمارة)
        const newBuildings = [
            ...Array.from({length: 4}, (_, i) => 53 + i), // 53-56
            ...Array.from({length: 8}, (_, i) => 61 + i), // 61-68
            ...Array.from({length: 9}, (_, i) => 71 + i)  // 71-79
        ];

        newBuildings.forEach(buildingNum => {
            const floors = [1, 2, 3, 4, 5, 6, 7]; // 7 أدوار
            const unitsPerFloor = [1, 2, 3]; // 3 شقق في كل دور

            floors.forEach(floor => {
                unitsPerFloor.forEach(unitNum => {
                    const fullUnitNum = floor * 10 + unitNum;
                    const isOccupied = Math.random() > 0.05; // 95% مشغول
                    
                    units.push({
                        id: unitId++,
                        unit_number: fullUnitNum,
                        building_number: buildingNum,
                        unit_name: `شقة ${fullUnitNum} عمارة ${buildingNum}`,
                        building_category: 'جديد',
                        building_description: `عمارة ${buildingNum} - المباني الجديدة`,
                        unit_type: 'شقة',
                        occupancy_status: isOccupied ? 'مشغول' : 'شاغر',
                        is_occupied: isOccupied,
                        floor_number: floor,
                        resident_name: isOccupied ? this.generateRandomName() : null,
                        resident_phone: isOccupied ? this.generateRandomPhone() : null,
                        parking_number: `P-${buildingNum}-${fullUnitNum}`,
                        area_sqm: 150,
                        rooms_count: 4
                    });
                });
            });
        });

        // 3. الفلل (114 فلة)
        for (let villaNum = 1; villaNum <= 114; villaNum++) {
            const isOccupied = Math.random() > 0.05; // 95% مشغول
            
            units.push({
                id: unitId++,
                unit_number: villaNum,
                building_number: 1000 + villaNum, // أرقام خاصة للفلل
                unit_name: `فلة ${villaNum}`,
                building_category: 'فلل',
                building_description: `فلة ${villaNum} - الفلل الفردية`,
                unit_type: 'فلة',
                occupancy_status: isOccupied ? 'مشغول' : 'شاغر',
                is_occupied: isOccupied,
                floor_number: 1,
                resident_name: isOccupied ? this.generateRandomName() : null,
                resident_phone: isOccupied ? this.generateRandomPhone() : null,
                parking_number: null, // الفلل لها مواقفها الخاصة
                area_sqm: 300,
                rooms_count: 5
            });
        }

        // حفظ البيانات
        localStorage.setItem(this.storageKey, JSON.stringify(units));
        console.log(`✓ تم إنشاء ${units.length} وحدة سكنية تجريبية`);
        
        return units;
    }

    /**
     * توليد اسم عشوائي
     */
    generateRandomName() {
        const firstNames = [
            'محمد', 'أحمد', 'عبدالله', 'عبدالرحمن', 'خالد', 'سعد', 'فهد', 'عبدالعزيز',
            'سلطان', 'تركي', 'ناصر', 'سعود', 'فيصل', 'مشعل', 'بندر', 'عمر'
        ];
        
        const lastNames = [
            'العتيبي', 'الدوسري', 'القحطاني', 'الشمري', 'الحربي', 'الزهراني', 'الغامدي', 'العمري',
            'المطيري', 'الشهري', 'الأحمدي', 'السهلي', 'العنزي', 'الرشيدي', 'البقمي', 'الجهني'
        ];

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }

    /**
     * توليد رقم جوال عشوائي
     */
    generateRandomPhone() {
        const prefixes = ['050', '053', '054', '055', '056', '058', '059'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
        
        return `${prefix}${number}`;
    }

    /**
     * الحصول على جميع الوحدات
     */
    getAllUnits() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    /**
     * الحصول على الإحصائيات
     */
    getStatistics() {
        const units = this.getAllUnits();
        
        return {
            total_units: units.length,
            occupied_units: units.filter(u => u.is_occupied).length,
            vacant_units: units.filter(u => !u.is_occupied).length,
            villas_count: units.filter(u => u.unit_type === 'فلة').length,
            new_buildings_units: units.filter(u => u.building_category === 'جديد').length
        };
    }

    /**
     * البحث والتصفية
     */
    searchAndFilter(searchTerm = '', statusFilter = '', categoryFilter = '') {
        let units = this.getAllUnits();

        // البحث
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            units = units.filter(unit => 
                (unit.unit_name && unit.unit_name.toLowerCase().includes(term)) ||
                (unit.building_number && unit.building_number.toString().includes(term)) ||
                (unit.unit_number && unit.unit_number.toString().includes(term)) ||
                (unit.resident_name && unit.resident_name.toLowerCase().includes(term))
            );
        }

        // تصفية حسب الحالة
        if (statusFilter) {
            units = units.filter(unit => unit.occupancy_status === statusFilter);
        }

        // تصفية حسب الفئة
        if (categoryFilter) {
            units = units.filter(unit => unit.building_category === categoryFilter);
        }

        return units;
    }

    /**
     * مسح جميع البيانات
     */
    clearAll() {
        localStorage.removeItem(this.storageKey);
        console.log('✓ تم مسح جميع بيانات الوحدات السكنية');
    }

    /**
     * إعادة إنشاء البيانات
     */
    reset() {
        this.clearAll();
        return this.createSampleData();
    }
}

// إنشاء نسخة عامة
const residentialUnitsDB = new ResidentialUnitsData();

// تصدير للاستخدام في الصفحات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResidentialUnitsData;
}
