/**
 * نظام قاعدة بيانات المخالفات المرورية
 * Traffic Violations Database System
 * 
 * @description نظام متكامل لإدارة المخالفات المرورية مع الربط التلقائي بالمركبات
 * @version 2.0.0
 * @author University Traffic System
 */

class ViolationsDatabaseSystem {
    constructor() {
        this.storageKey = 'violations_database';
        this.violations = [];
        this.violationTypes = this.getViolationTypes();
        this.init();
    }

    /**
     * تهيئة النظام
     */
    init() {
        this.loadViolations();
        console.log('✓ تم تهيئة نظام قاعدة بيانات المخالفات');
    }

    /**
     * تحميل المخالفات من LocalStorage
     */
    loadViolations() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.violations = data ? JSON.parse(data) : [];
            return this.violations;
        } catch (error) {
            console.error('خطأ في تحميل المخالفات:', error);
            this.violations = [];
            return [];
        }
    }

    /**
     * حفظ المخالفات في LocalStorage
     */
    saveViolations() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.violations));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ المخالفات:', error);
            return false;
        }
    }

    /**
     * أنواع المخالفات المرورية
     */
    getViolationTypes() {
        return {
            'speeding': {
                name: 'تجاوز السرعة المحددة',
                nameEn: 'Speeding',
                fine: 500,
                severity: 'medium',
                points: 2
            },
            'wrong_parking': {
                name: 'الوقوف في مكان غير مصرح',
                nameEn: 'Wrong Parking',
                fine: 150,
                severity: 'low',
                points: 1
            },
            'no_sticker': {
                name: 'عدم وجود ملصق',
                nameEn: 'No Sticker',
                fine: 300,
                severity: 'medium',
                points: 2
            },
            'expired_sticker': {
                name: 'ملصق منتهي الصلاحية',
                nameEn: 'Expired Sticker',
                fine: 200,
                severity: 'low',
                points: 1
            },
            'restricted_area': {
                name: 'دخول منطقة محظورة',
                nameEn: 'Restricted Area Entry',
                fine: 400,
                severity: 'high',
                points: 3
            },
            'reckless_driving': {
                name: 'قيادة متهورة',
                nameEn: 'Reckless Driving',
                fine: 1000,
                severity: 'high',
                points: 4
            },
            'wrong_direction': {
                name: 'السير عكس الاتجاه',
                nameEn: 'Wrong Direction',
                fine: 600,
                severity: 'high',
                points: 3
            },
            'blocking_traffic': {
                name: 'إعاقة حركة المرور',
                nameEn: 'Blocking Traffic',
                fine: 300,
                severity: 'medium',
                points: 2
            },
            'pedestrian_area': {
                name: 'دخول منطقة مشاة',
                nameEn: 'Pedestrian Area Entry',
                fine: 250,
                severity: 'medium',
                points: 2
            },
            'no_license': {
                name: 'عدم وجود رخصة قيادة',
                nameEn: 'No License',
                fine: 1500,
                severity: 'critical',
                points: 6
            },
            'unauthorized_vehicle': {
                name: 'مركبة غير مصرح لها',
                nameEn: 'Unauthorized Vehicle',
                fine: 500,
                severity: 'high',
                points: 3
            },
            'other': {
                name: 'مخالفة أخرى',
                nameEn: 'Other Violation',
                fine: 200,
                severity: 'low',
                points: 1
            }
        };
    }

    /**
     * إضافة مخالفة جديدة
     */
    addViolation(violationData) {
        try {
            // التحقق من البيانات المطلوبة
            if (!violationData.plateNumber) {
                throw new Error('رقم اللوحة مطلوب');
            }

            if (!violationData.violationType) {
                throw new Error('نوع المخالفة مطلوب');
            }

            // الحصول على معلومات نوع المخالفة
            const typeInfo = this.violationTypes[violationData.violationType] || this.violationTypes['other'];

            // إنشاء كائن المخالفة
            const violation = {
                id: this.generateId(),
                violationNumber: this.generateViolationNumber(),
                
                // معلومات المركبة
                plateNumber: violationData.plateNumber,
                vehicleId: violationData.vehicleId || null,
                
                // معلومات المخالفة
                violationType: violationData.violationType,
                violationName: typeInfo.name,
                violationNameEn: typeInfo.nameEn,
                description: violationData.description || typeInfo.name,
                
                // المبلغ والنقاط
                fine: violationData.fine || typeInfo.fine,
                points: violationData.points || typeInfo.points,
                severity: violationData.severity || typeInfo.severity,
                
                // الموقع والوقت
                location: violationData.location || 'غير محدد',
                gate: violationData.gate || '',
                camera: violationData.camera || '',
                timestamp: violationData.timestamp || new Date().toISOString(),
                date: violationData.date || new Date().toISOString().split('T')[0],
                time: violationData.time || new Date().toLocaleTimeString('ar-SA'),
                
                // الصور والأدلة
                images: violationData.images || [],
                evidenceImages: violationData.evidenceImages || [],
                videoUrl: violationData.videoUrl || null,
                
                // معلومات التسجيل
                recordedBy: violationData.recordedBy || 'system',
                officerName: violationData.officerName || '',
                officerId: violationData.officerId || '',
                
                // الحالة
                status: violationData.status || 'pending', // pending, paid, appealed, cancelled
                isPaid: false,
                paymentDate: null,
                paymentMethod: null,
                paymentReference: null,
                
                // الاعتراض
                isAppealed: false,
                appealDate: null,
                appealReason: null,
                appealStatus: null, // pending, approved, rejected
                appealResponse: null,
                
                // ملاحظات
                notes: violationData.notes || '',
                internalNotes: violationData.internalNotes || '',
                
                // معلومات التعرف التلقائي
                recognitionData: violationData.recognitionData || null,
                isAutoDetected: violationData.isAutoDetected || false,
                
                // التواريخ
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: violationData.createdBy || 'system'
            };

            // إضافة المخالفة
            this.violations.push(violation);
            this.saveViolations();

            // تحديث عداد المخالفات في المركبة
            if (window.vehiclesDB && violation.vehicleId) {
                window.vehiclesDB.addViolation(violation.vehicleId, violation.id);
            }

            console.log('✓ تم إضافة المخالفة بنجاح:', violation.violationNumber);
            return {
                success: true,
                violation: violation
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
     * تحديث مخالفة
     */
    updateViolation(violationId, updates) {
        try {
            const index = this.violations.findIndex(v => v.id === violationId);
            if (index === -1) {
                throw new Error('المخالفة غير موجودة');
            }

            // تحديث البيانات
            this.violations[index] = {
                ...this.violations[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            this.saveViolations();

            console.log('✓ تم تحديث المخالفة بنجاح');
            return {
                success: true,
                violation: this.violations[index]
            };
        } catch (error) {
            console.error('خطأ في تحديث المخالفة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * حذف مخالفة
     */
    deleteViolation(violationId) {
        try {
            const index = this.violations.findIndex(v => v.id === violationId);
            if (index === -1) {
                throw new Error('المخالفة غير موجودة');
            }

            const violation = this.violations[index];
            this.violations.splice(index, 1);
            this.saveViolations();

            console.log('✓ تم حذف المخالفة بنجاح');
            return {
                success: true,
                message: 'تم حذف المخالفة بنجاح',
                violation: violation
            };
        } catch (error) {
            console.error('خطأ في حذف المخالفة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * البحث عن مخالفة بالمعرف
     */
    findById(violationId) {
        return this.violations.find(v => v.id === violationId);
    }

    /**
     * البحث عن مخالفة برقم المخالفة
     */
    findByViolationNumber(violationNumber) {
        return this.violations.find(v => v.violationNumber === violationNumber);
    }

    /**
     * جلب مخالفات مركبة معينة
     */
    getVehicleViolations(plateNumber) {
        return this.violations.filter(v => v.plateNumber === plateNumber);
    }

    /**
     * البحث المتقدم
     */
    search(criteria) {
        let results = [...this.violations];

        // البحث برقم اللوحة
        if (criteria.plateNumber) {
            const searchTerm = criteria.plateNumber.toLowerCase().replace(/\s/g, '');
            results = results.filter(v => 
                v.plateNumber.toLowerCase().replace(/\s/g, '').includes(searchTerm)
            );
        }

        // البحث برقم المخالفة
        if (criteria.violationNumber) {
            results = results.filter(v => 
                v.violationNumber.includes(criteria.violationNumber)
            );
        }

        // البحث بنوع المخالفة
        if (criteria.violationType) {
            results = results.filter(v => v.violationType === criteria.violationType);
        }

        // البحث بالحالة
        if (criteria.status) {
            results = results.filter(v => v.status === criteria.status);
        }

        // البحث بالتاريخ
        if (criteria.dateFrom) {
            results = results.filter(v => v.date >= criteria.dateFrom);
        }

        if (criteria.dateTo) {
            results = results.filter(v => v.date <= criteria.dateTo);
        }

        // البحث بالموقع
        if (criteria.location) {
            results = results.filter(v => 
                v.location.toLowerCase().includes(criteria.location.toLowerCase())
            );
        }

        // البحث بالخطورة
        if (criteria.severity) {
            results = results.filter(v => v.severity === criteria.severity);
        }

        return results;
    }

    /**
     * دفع مخالفة
     */
    payViolation(violationId, paymentData) {
        return this.updateViolation(violationId, {
            status: 'paid',
            isPaid: true,
            paymentDate: new Date().toISOString(),
            paymentMethod: paymentData.method || 'cash',
            paymentReference: paymentData.reference || this.generatePaymentReference()
        });
    }

    /**
     * الاعتراض على مخالفة
     */
    appealViolation(violationId, appealData) {
        return this.updateViolation(violationId, {
            status: 'appealed',
            isAppealed: true,
            appealDate: new Date().toISOString(),
            appealReason: appealData.reason || '',
            appealStatus: 'pending'
        });
    }

    /**
     * الرد على الاعتراض
     */
    respondToAppeal(violationId, response, approved) {
        const updates = {
            appealStatus: approved ? 'approved' : 'rejected',
            appealResponse: response,
            appealResponseDate: new Date().toISOString()
        };

        if (approved) {
            updates.status = 'cancelled';
        } else {
            updates.status = 'pending';
        }

        return this.updateViolation(violationId, updates);
    }

    /**
     * إلغاء مخالفة
     */
    cancelViolation(violationId, reason) {
        return this.updateViolation(violationId, {
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: new Date().toISOString()
        });
    }

    /**
     * جلب جميع المخالفات
     */
    getAllViolations() {
        return this.violations;
    }

    /**
     * جلب المخالفات المعلقة
     */
    getPendingViolations() {
        return this.violations.filter(v => v.status === 'pending');
    }

    /**
     * جلب المخالفات المدفوعة
     */
    getPaidViolations() {
        return this.violations.filter(v => v.status === 'paid');
    }

    /**
     * جلب المخالفات المعترض عليها
     */
    getAppealedViolations() {
        return this.violations.filter(v => v.status === 'appealed');
    }

    /**
     * جلب المخالفات الملغاة
     */
    getCancelledViolations() {
        return this.violations.filter(v => v.status === 'cancelled');
    }

    /**
     * جلب الإحصائيات
     */
    getStatistics() {
        const total = this.violations.length;
        const pending = this.violations.filter(v => v.status === 'pending').length;
        const paid = this.violations.filter(v => v.status === 'paid').length;
        const appealed = this.violations.filter(v => v.status === 'appealed').length;
        const cancelled = this.violations.filter(v => v.status === 'cancelled').length;

        const totalFines = this.violations.reduce((sum, v) => sum + (v.fine || 0), 0);
        const paidFines = this.violations
            .filter(v => v.status === 'paid')
            .reduce((sum, v) => sum + (v.fine || 0), 0);
        const pendingFines = this.violations
            .filter(v => v.status === 'pending')
            .reduce((sum, v) => sum + (v.fine || 0), 0);

        const bySeverity = {
            low: this.violations.filter(v => v.severity === 'low').length,
            medium: this.violations.filter(v => v.severity === 'medium').length,
            high: this.violations.filter(v => v.severity === 'high').length,
            critical: this.violations.filter(v => v.severity === 'critical').length
        };

        const byType = {};
        Object.keys(this.violationTypes).forEach(type => {
            byType[type] = this.violations.filter(v => v.violationType === type).length;
        });

        // أكثر المخالفات شيوعاً
        const topViolations = Object.entries(byType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => ({
                type: type,
                name: this.violationTypes[type].name,
                count: count
            }));

        return {
            total,
            pending,
            paid,
            appealed,
            cancelled,
            totalFines,
            paidFines,
            pendingFines,
            bySeverity,
            byType,
            topViolations,
            collectionRate: total > 0 ? ((paid / total) * 100).toFixed(2) : 0
        };
    }

    /**
     * جلب إحصائيات حسب الفترة الزمنية
     */
    getStatisticsByPeriod(startDate, endDate) {
        const filtered = this.violations.filter(v => {
            const date = v.date;
            return date >= startDate && date <= endDate;
        });

        const total = filtered.length;
        const totalFines = filtered.reduce((sum, v) => sum + (v.fine || 0), 0);

        return {
            total,
            totalFines,
            violations: filtered
        };
    }

    /**
     * تصدير البيانات إلى CSV
     */
    exportToCSV() {
        try {
            const headers = [
                'رقم المخالفة', 'رقم اللوحة', 'نوع المخالفة', 'الوصف',
                'الغرامة', 'النقاط', 'الخطورة', 'الموقع', 'التاريخ',
                'الوقت', 'الحالة', 'مدفوعة', 'معترض عليها', 'المسجل بواسطة'
            ];

            const rows = this.violations.map(v => [
                v.violationNumber,
                v.plateNumber,
                v.violationName,
                v.description,
                v.fine,
                v.points,
                v.severity,
                v.location,
                v.date,
                v.time,
                v.status,
                v.isPaid ? 'نعم' : 'لا',
                v.isAppealed ? 'نعم' : 'لا',
                v.recordedBy
            ]);

            let csv = '\uFEFF' + headers.join(',') + '\n';
            rows.forEach(row => {
                csv += row.map(cell => `"${cell}"`).join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `violations_database_${new Date().toISOString().split('T')[0]}.csv`;
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
     * توليد رقم مخالفة
     */
    generateViolationNumber() {
        const year = new Date().getFullYear();
        const count = this.violations.length + 1;
        return `V-${year}-${String(count).padStart(6, '0')}`;
    }

    /**
     * توليد رقم مرجعي للدفع
     */
    generatePaymentReference() {
        return 'PAY-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    /**
     * توليد معرف فريد
     */
    generateId() {
        return 'VIO-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * مسح جميع البيانات
     */
    clearAll() {
        if (confirm('هل أنت متأكد من حذف جميع المخالفات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
            this.violations = [];
            this.saveViolations();
            return {
                success: true,
                message: 'تم حذف جميع المخالفات'
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
    module.exports = ViolationsDatabaseSystem;
}

// إنشاء نسخة عامة
window.ViolationsDatabaseSystem = ViolationsDatabaseSystem;
window.violationsDB = new ViolationsDatabaseSystem();
