/**
 * نظام التعرف على لوحات السيارات
 * يدعم نظامين:
 * 1. Mock System - نظام محاكاة مجاني للاختبار
 * 2. Plate Recognizer API - نظام احترافي حقيقي
 */

class PlateRecognitionSystem {
    constructor() {
        this.system = localStorage.getItem('RECOGNITION_SYSTEM') || 'mock';
        this.apiToken = localStorage.getItem('PLATE_RECOGNIZER_API_TOKEN') || '';
        this.region = localStorage.getItem('PLATE_RECOGNIZER_REGION') || 'sa';
    }

    /**
     * التعرف على لوحة من صورة
     * @param {File} imageFile - ملف الصورة
     * @returns {Promise<Object>} - نتيجة التعرف
     */
    async recognizePlate(imageFile) {
        if (this.system === 'mock') {
            return this.mockRecognition(imageFile);
        } else if (this.system === 'platerecognizer') {
            return this.apiRecognition(imageFile);
        } else {
            throw new Error('نظام التعرف غير معروف');
        }
    }

    /**
     * نظام المحاكاة - ينشئ بيانات عشوائية واقعية
     * @param {File} imageFile - ملف الصورة
     * @returns {Promise<Object>} - نتيجة المحاكاة
     */
    async mockRecognition(imageFile) {
        // محاكاة وقت المعالجة
        await new Promise(resolve => setTimeout(resolve, 1500));

        // توليد رقم لوحة سعودي واقعي
        const plateNumber = this.generateSaudiPlateNumber();
        
        return {
            success: true,
            system: 'mock',
            plate: plateNumber,
            confidence: 0.85 + Math.random() * 0.14, // 85-99%
            region: 'SA',
            vehicleType: this.getRandomVehicleType(),
            timestamp: new Date().toISOString(),
            imageSize: imageFile.size,
            imageName: imageFile.name
        };
    }

    /**
     * نظام API الحقيقي - Plate Recognizer
     * @param {File} imageFile - ملف الصورة
     * @returns {Promise<Object>} - نتيجة API
     */
    async apiRecognition(imageFile) {
        if (!this.apiToken) {
            throw new Error('لم يتم تكوين API Token. الرجاء الذهاب إلى صفحة الإعدادات.');
        }

        const formData = new FormData();
        formData.append('upload', imageFile);
        formData.append('regions', this.region);

        try {
            const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Token ' + this.apiToken
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'فشل في الاتصال بـ API');
            }

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                return {
                    success: false,
                    system: 'platerecognizer',
                    error: 'لم يتم العثور على لوحة في الصورة',
                    timestamp: new Date().toISOString()
                };
            }

            const result = data.results[0];
            
            return {
                success: true,
                system: 'platerecognizer',
                plate: result.plate,
                confidence: result.score,
                region: result.region?.code || 'SA',
                vehicleType: result.vehicle?.type || 'غير محدد',
                timestamp: new Date().toISOString(),
                imageSize: imageFile.size,
                imageName: imageFile.name,
                rawData: result
            };

        } catch (error) {
            console.error('خطأ في API:', error);
            throw new Error('فشل في التعرف على اللوحة: ' + error.message);
        }
    }

    /**
     * توليد رقم لوحة سعودي واقعي
     * @returns {string} - رقم اللوحة
     */
    generateSaudiPlateNumber() {
        // الأحرف العربية المستخدمة في اللوحات السعودية
        const arabicLetters = ['أ', 'ب', 'ح', 'د', 'ر', 'س', 'ص', 'ط', 'ع', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'];
        
        // اختيار 3 أحرف عشوائية
        const letter1 = arabicLetters[Math.floor(Math.random() * arabicLetters.length)];
        const letter2 = arabicLetters[Math.floor(Math.random() * arabicLetters.length)];
        const letter3 = arabicLetters[Math.floor(Math.random() * arabicLetters.length)];
        
        // توليد 4 أرقام
        const numbers = Math.floor(1000 + Math.random() * 9000);
        
        // تنسيق اللوحة السعودية: أحرف - أرقام
        return `${letter1} ${letter2} ${letter3} ${numbers}`;
    }

    /**
     * الحصول على نوع مركبة عشوائي
     * @returns {string} - نوع المركبة
     */
    getRandomVehicleType() {
        const types = ['سيارة خاصة', 'سيارة نقل', 'دراجة نارية', 'حافلة'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * التحقق من صحة رقم لوحة
     * @param {string} plateNumber - رقم اللوحة
     * @returns {boolean} - هل الرقم صحيح
     */
    validatePlateNumber(plateNumber) {
        if (!plateNumber || plateNumber.trim() === '') {
            return false;
        }
        
        // التحقق من وجود أحرف وأرقام
        const hasArabicLetters = /[\u0600-\u06FF]/.test(plateNumber);
        const hasNumbers = /\d/.test(plateNumber);
        
        return hasArabicLetters && hasNumbers;
    }

    /**
     * تنسيق نتيجة التعرف للعرض
     * @param {Object} result - نتيجة التعرف
     * @returns {string} - HTML منسق
     */
    formatResultHTML(result) {
        if (!result.success) {
            return `
                <div class="recognition-result error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>فشل التعرف</h3>
                    <p>${result.error || 'حدث خطأ غير معروف'}</p>
                </div>
            `;
        }

        const systemName = result.system === 'mock' ? 'نظام المحاكاة' : 'Plate Recognizer API';
        const confidencePercent = (result.confidence * 100).toFixed(1);
        const confidenceClass = result.confidence > 0.9 ? 'high' : result.confidence > 0.7 ? 'medium' : 'low';

        return `
            <div class="recognition-result success">
                <div class="result-header">
                    <i class="fas fa-check-circle"></i>
                    <h3>تم التعرف على اللوحة بنجاح</h3>
                </div>
                
                <div class="plate-display">
                    <div class="plate-number">${result.plate}</div>
                </div>

                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">النظام:</span>
                        <span class="detail-value">${systemName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">الثقة:</span>
                        <span class="detail-value confidence-${confidenceClass}">
                            ${confidencePercent}%
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">المنطقة:</span>
                        <span class="detail-value">${result.region}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">نوع المركبة:</span>
                        <span class="detail-value">${result.vehicleType}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">الوقت:</span>
                        <span class="detail-value">${new Date(result.timestamp).toLocaleString('ar-SA')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * الحصول على معلومات النظام الحالي
     * @returns {Object} - معلومات النظام
     */
    getSystemInfo() {
        return {
            system: this.system,
            systemName: this.system === 'mock' ? 'نظام المحاكاة' : 'Plate Recognizer API',
            isConfigured: this.system === 'mock' || (this.system === 'platerecognizer' && this.apiToken !== ''),
            region: this.region
        };
    }

    /**
     * تغيير النظام
     * @param {string} newSystem - النظام الجديد (mock أو platerecognizer)
     */
    setSystem(newSystem) {
        if (newSystem !== 'mock' && newSystem !== 'platerecognizer') {
            throw new Error('نظام غير صحيح');
        }
        this.system = newSystem;
        localStorage.setItem('RECOGNITION_SYSTEM', newSystem);
    }

    /**
     * حفظ مفتاح API
     * @param {string} token - مفتاح API
     */
    setAPIToken(token) {
        this.apiToken = token;
        localStorage.setItem('PLATE_RECOGNIZER_API_TOKEN', token);
    }

    /**
     * حفظ المنطقة
     * @param {string} region - رمز المنطقة
     */
    setRegion(region) {
        this.region = region;
        localStorage.setItem('PLATE_RECOGNIZER_REGION', region);
    }
}

// إنشاء نسخة عامة من النظام
window.plateRecognitionSystem = new PlateRecognitionSystem();

// دالة مساعدة سريعة للتعرف على لوحة
async function recognizePlateFromImage(imageFile) {
    return await window.plateRecognitionSystem.recognizePlate(imageFile);
}

// CSS للنتائج (يمكن إضافته إلى ملف CSS منفصل)
const recognitionStyles = `
<style>
.recognition-result {
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
}

.recognition-result.success {
    background: #d4edda;
    border: 2px solid #28a745;
}

.recognition-result.error {
    background: #f8d7da;
    border: 2px solid #dc3545;
    text-align: center;
}

.result-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    color: #155724;
}

.result-header i {
    font-size: 24px;
}

.plate-display {
    background: white;
    border: 3px solid #333;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    margin: 20px 0;
}

.plate-number {
    font-size: 32px;
    font-weight: bold;
    color: #000;
    letter-spacing: 2px;
    font-family: 'Arial', sans-serif;
}

.result-details {
    background: white;
    padding: 15px;
    border-radius: 8px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: bold;
    color: #555;
}

.detail-value {
    color: #333;
}

.confidence-high {
    color: #28a745;
    font-weight: bold;
}

.confidence-medium {
    color: #ffc107;
    font-weight: bold;
}

.confidence-low {
    color: #dc3545;
    font-weight: bold;
}
</style>
`;

console.log('✅ نظام التعرف على لوحات السيارات جاهز');
console.log('النظام الحالي:', window.plateRecognitionSystem.getSystemInfo().systemName);
