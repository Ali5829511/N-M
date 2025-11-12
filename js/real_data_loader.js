/**
 * محمل البيانات الحقيقية
 * Real Data Loader
 * @version 1.0.0
 */

class RealDataLoader {
    constructor() {
        this.dataFile = '../data/real_data.json';
        this.data = null;
        this.loaded = false;
    }

    /**
     * تحميل البيانات من ملف JSON
     */
    async loadData() {
        try {
            const response = await fetch(this.dataFile);
            if (!response.ok) {
                throw new Error(`فشل في تحميل البيانات: ${response.status}`);
            }
            
            this.data = await response.json();
            this.loaded = true;
            
            // حفظ البيانات في localStorage
            this.saveToLocalStorage();
            
            console.log('✓ تم تحميل البيانات الحقيقية بنجاح');
            console.log('الإحصائيات:', this.data.statistics);
            
            return this.data;
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            // محاولة تحميل البيانات من localStorage
            return this.loadFromLocalStorage();
        }
    }

    /**
     * حفظ البيانات في localStorage
     */
    saveToLocalStorage() {
        if (!this.data) return;

        try {
            // حفظ الملصقات
            localStorage.setItem('stickers_real', JSON.stringify(this.data.stickers));
            
            // حفظ المباني
            localStorage.setItem('buildings_real', JSON.stringify(this.data.buildings));
            
            // حفظ السكان
            localStorage.setItem('residents_real', JSON.stringify(this.data.residents));
            
            // حفظ الوحدات السكنية
            localStorage.setItem('residential_units_real', JSON.stringify(this.data.units));
            
            // حفظ المواقف
            localStorage.setItem('parking_real', JSON.stringify(this.data.parking));
            
            // حفظ الإحصائيات
            localStorage.setItem('statistics_real', JSON.stringify(this.data.statistics));
            
            console.log('✓ تم حفظ البيانات في localStorage');
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
        }
    }

    /**
     * تحميل البيانات من localStorage
     */
    loadFromLocalStorage() {
        try {
            const stickers = JSON.parse(localStorage.getItem('stickers_real') || '[]');
            const buildings = JSON.parse(localStorage.getItem('buildings_real') || '[]');
            const residents = JSON.parse(localStorage.getItem('residents_real') || '[]');
            const units = JSON.parse(localStorage.getItem('residential_units_real') || '[]');
            const parking = JSON.parse(localStorage.getItem('parking_real') || '[]');
            const statistics = JSON.parse(localStorage.getItem('statistics_real') || '{}');

            this.data = {
                stickers,
                buildings,
                residents,
                units,
                parking,
                statistics
            };

            this.loaded = true;
            console.log('✓ تم تحميل البيانات من localStorage');
            return this.data;
        } catch (error) {
            console.error('خطأ في تحميل البيانات من localStorage:', error);
            return null;
        }
    }

    /**
     * الحصول على الملصقات
     */
    getStickers(status = null) {
        if (!this.loaded || !this.data) return [];
        
        if (status) {
            return this.data.stickers.filter(s => s.status === status);
        }
        
        return this.data.stickers;
    }

    /**
     * الحصول على المباني
     */
    getBuildings(type = null) {
        if (!this.loaded || !this.data) return [];
        
        if (type) {
            return this.data.buildings.filter(b => b.type === type);
        }
        
        return this.data.buildings;
    }

    /**
     * الحصول على السكان
     */
    getResidents() {
        if (!this.loaded || !this.data) return [];
        return this.data.residents;
    }

    /**
     * الحصول على الوحدات السكنية
     */
    getUnits(category = null) {
        if (!this.loaded || !this.data) return [];
        
        if (category) {
            return this.data.units.filter(u => u.building_category === category);
        }
        
        return this.data.units;
    }

    /**
     * دمج بيانات الوحدات مع السكان
     */
    getUnitsWithResidents() {
        if (!this.loaded || !this.data) return [];
        
        const units = this.data.units;
        const residents = this.data.residents;
        
        return units.map(unit => {
            // البحث عن الساكن المطابق
            const resident = residents.find(r => 
                r.building_type === unit.building_number && 
                r.unit_number === unit.unit_number
            );
            
            return {
                ...unit,
                is_occupied: !!resident,
                occupancy_status: resident ? 'مشغول' : 'شاغر',
                resident_name: resident ? resident.name : null,
                resident_phone: resident ? resident.phone : null,
                parking_number: resident ? resident.parking_number : null,
                parking_area: resident ? resident.parking_area : null
            };
        });
    }

    /**
     * الحصول على المواقف
     */
    getParking() {
        if (!this.loaded || !this.data) return [];
        return this.data.parking;
    }

    /**
     * الحصول على الإحصائيات
     */
    getStatistics() {
        if (!this.loaded || !this.data) return {};
        
        const unitsWithResidents = this.getUnitsWithResidents();
        
        return {
            ...this.data.statistics,
            occupied_units: unitsWithResidents.filter(u => u.is_occupied).length,
            vacant_units: unitsWithResidents.filter(u => !u.is_occupied).length,
            villas_count: unitsWithResidents.filter(u => u.unit_type === 'فلة').length,
            new_buildings_units: unitsWithResidents.filter(u => u.building_category === 'جديد').length,
            old_buildings_units: unitsWithResidents.filter(u => u.building_category === 'قديم').length
        };
    }

    /**
     * البحث في الوحدات
     */
    searchUnits(searchTerm = '', statusFilter = '', categoryFilter = '') {
        let units = this.getUnitsWithResidents();

        // البحث
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            units = units.filter(unit => 
                (unit.name && unit.name.toLowerCase().includes(term)) ||
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
}

// إنشاء نسخة عامة
const realDataLoader = new RealDataLoader();

// تصدير للاستخدام في الصفحات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealDataLoader;
}
