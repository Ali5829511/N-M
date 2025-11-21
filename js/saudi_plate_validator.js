/**
 * نظام التحقق من صحة لوحات السيارات السعودية
 * Saudi License Plate Validation System
 * 
 * هذا الملف يحتوي على جميع القواعد والتحققات الخاصة بلوحات السيارات السعودية
 * لضمان دقة 100% عند التعرف على اللوحات وتحليلها.
 * 
 * This file contains all rules and validations for Saudi license plates
 * to ensure 100% accuracy when recognizing and analyzing plates.
 */

// الأحرف العربية المسموح بها في لوحات السيارات السعودية
// Allowed Arabic letters in Saudi license plates
// المصدر: نظام المرور السعودي
const ALLOWED_ARABIC_LETTERS = {
    'أ': 'A', 'ب': 'B', 'ح': 'J', 'د': 'D',
    'ر': 'R', 'س': 'S', 'ص': 'X', 'ط': 'T',
    'ع': 'E', 'ق': 'G', 'ك': 'K', 'ل': 'L',
    'م': 'Z', 'ن': 'N', 'هـ': 'H', 'و': 'U',
    'ى': 'V'
};

// الأحرف الإنجليزية المقابلة (للأنظمة التي تستخدم الحروف الإنجليزية)
const ENGLISH_TO_ARABIC = {};
for (const [arabic, english] of Object.entries(ALLOWED_ARABIC_LETTERS)) {
    ENGLISH_TO_ARABIC[english] = arabic;
}

// قائمة الأحرف العربية المسموحة فقط
const ALLOWED_LETTERS_ARRAY = Object.keys(ALLOWED_ARABIC_LETTERS);

class SaudiPlateValidator {
    constructor() {
        this.allowedLetters = ALLOWED_ARABIC_LETTERS;
        this.englishToArabic = ENGLISH_TO_ARABIC;
        this.allowedLettersArray = ALLOWED_LETTERS_ARRAY;
    }

    /**
     * التحقق من أن الحرف العربي مسموح به في اللوحات السعودية
     * Check if Arabic letter is allowed in Saudi plates
     */
    isValidArabicLetter(letter) {
        return letter in this.allowedLetters;
    }

    /**
     * التحقق من أن الحرف الإنجليزي له مقابل عربي مسموح
     * Check if English letter has a valid Arabic equivalent
     */
    isValidEnglishLetter(letter) {
        return letter.toUpperCase() in this.englishToArabic;
    }

    /**
     * تطبيع رقم اللوحة بإزالة المسافات والرموز الخاصة
     * Normalize plate number by removing spaces and special characters
     */
    normalizePlate(plate) {
        return plate.replace(/[\s\-_]/g, '').trim();
    }

    /**
     * تحويل الحرف الإنجليزي إلى المقابل العربي
     * Convert English letter to Arabic equivalent
     */
    convertEnglishToArabic(letter) {
        return this.englishToArabic[letter.toUpperCase()] || null;
    }

    /**
     * تحويل الحرف العربي إلى المقابل الإنجليزي
     * Convert Arabic letter to English equivalent
     */
    convertArabicToEnglish(letter) {
        return this.allowedLetters[letter] || null;
    }

    /**
     * استخراج مكونات اللوحة (أحرف وأرقام)
     * Extract plate components (letters and numbers)
     */
    extractComponents(plate) {
        const normalized = this.normalizePlate(plate);
        
        // استخراج الأحرف العربية
        const arabicLetters = normalized.match(/[\u0600-\u06FF]+/g) || [];
        
        // استخراج الأحرف الإنجليزية
        const englishLetters = normalized.match(/[A-Za-z]+/g) || [];
        
        // استخراج الأرقام
        const numbers = normalized.match(/\d+/g) || [];
        
        return {
            arabicLetters,
            englishLetters,
            numbers,
            raw: normalized
        };
    }

    /**
     * التحقق الشامل من تنسيق اللوحة السعودية
     * Comprehensive validation of Saudi plate format
     */
    validatePlateFormat(plate) {
        const components = this.extractComponents(plate);
        const details = {
            valid: false,
            plate: plate,
            normalized: components.raw,
            components: components,
            errors: [],
            warnings: []
        };

        // التحقق من وجود أحرف
        const hasArabic = components.arabicLetters.length > 0;
        const hasEnglish = components.englishLetters.length > 0;

        if (!hasArabic && !hasEnglish) {
            details.errors.push('لا توجد أحرف في اللوحة / No letters found');
            return {
                isValid: false,
                message: 'لوحة غير صحيحة: لا توجد أحرف',
                details: details
            };
        }

        // التحقق من وجود أرقام
        if (components.numbers.length === 0) {
            details.errors.push('لا توجد أرقام في اللوحة / No numbers found');
            return {
                isValid: false,
                message: 'لوحة غير صحيحة: لا توجد أرقام',
                details: details
            };
        }

        // التحقق من الأحرف العربية
        let allLetters = '';
        if (hasArabic) {
            allLetters = components.arabicLetters.join('');
            if (allLetters.length < 1 || allLetters.length > 3) {
                details.errors.push(`عدد الأحرف غير صحيح: ${allLetters.length} (المسموح: 1-3)`);
                return {
                    isValid: false,
                    message: `عدد الأحرف غير صحيح: ${allLetters.length}`,
                    details: details
                };
            }

            // التحقق من أن جميع الأحرف مسموحة
            for (const letter of allLetters) {
                if (!this.isValidArabicLetter(letter)) {
                    details.errors.push(`حرف غير مسموح: ${letter}`);
                    details.warnings.push(`الأحرف المسموحة: ${this.allowedLettersArray.join(', ')}`);
                    return {
                        isValid: false,
                        message: `حرف غير مسموح في اللوحات السعودية: ${letter}`,
                        details: details
                    };
                }
            }
        }

        // التحقق من الأحرف الإنجليزية (إن وجدت)
        let allEnglish = '';
        if (hasEnglish) {
            allEnglish = components.englishLetters.join('');
            if (allEnglish.length < 1 || allEnglish.length > 3) {
                details.errors.push(`عدد الأحرف الإنجليزية غير صحيح: ${allEnglish.length} (المسموح: 1-3)`);
            }

            // التحقق من أن جميع الأحرف لها مقابل عربي
            for (const letter of allEnglish) {
                if (!this.isValidEnglishLetter(letter)) {
                    details.warnings.push(`حرف إنجليزي ليس له مقابل عربي مسموح: ${letter}`);
                }
            }
        }

        // التحقق من الأرقام
        const allNumbers = components.numbers.join('');
        if (allNumbers.length < 1 || allNumbers.length > 4) {
            details.errors.push(`عدد الأرقام غير صحيح: ${allNumbers.length} (المسموح: 1-4)`);
            return {
                isValid: false,
                message: `عدد الأرقام غير صحيح: ${allNumbers.length}`,
                details: details
            };
        }

        // اللوحة صحيحة
        details.valid = true;
        details.lettersCount = allLetters.length || allEnglish.length;
        details.numbersCount = allNumbers.length;

        return {
            isValid: true,
            message: 'لوحة صحيحة ✓',
            details: details
        };
    }

    /**
     * الحصول على قائمة الأحرف المسموحة
     * Get list of allowed letters
     */
    getAllowedLettersList() {
        return this.allowedLettersArray.map(arabic => ({
            arabic: arabic,
            english: this.allowedLetters[arabic],
            note: 'مسموح'
        }));
    }

    /**
     * اقتراح تصحيحات محتملة للوحة غير صحيحة
     * Suggest possible corrections for invalid plate
     */
    suggestCorrections(plate) {
        const suggestions = [];
        const components = this.extractComponents(plate);

        // إذا كانت هناك أحرف إنجليزية، اقترح التحويل للعربية
        if (components.englishLetters.length > 0) {
            const englishText = components.englishLetters.join('');
            let arabicEquivalent = '';
            
            for (const letter of englishText) {
                const arabicLetter = this.convertEnglishToArabic(letter);
                if (arabicLetter) {
                    arabicEquivalent += arabicLetter;
                } else {
                    suggestions.push(`لا يوجد مقابل عربي للحرف: ${letter}`);
                }
            }

            if (arabicEquivalent) {
                const numbers = components.numbers.join('');
                suggestions.push(`اقتراح: ${arabicEquivalent} ${numbers}`);
            }
        }

        return suggestions;
    }

    /**
     * توليد رقم لوحة عشوائي صحيح حسب معايير السعودية
     * Generate a random valid Saudi plate number
     */
    generateRandomPlate() {
        // اختيار 1-3 أحرف عشوائية من القائمة المسموحة
        const letterCount = Math.floor(Math.random() * 3) + 1; // 1 to 3
        let letters = '';
        for (let i = 0; i < letterCount; i++) {
            const randomIndex = Math.floor(Math.random() * this.allowedLettersArray.length);
            letters += this.allowedLettersArray[randomIndex];
        }

        // اختيار 1-4 أرقام عشوائية
        const numberCount = Math.floor(Math.random() * 4) + 1; // 1 to 4
        let numbers = '';
        for (let i = 0; i < numberCount; i++) {
            numbers += Math.floor(Math.random() * 10);
        }

        // تنسيق اللوحة: أحرف ثم أرقام مع مسافة
        return `${letters} ${numbers}`;
    }

    /**
     * تنظيف وتصحيح رقم اللوحة
     * Clean and correct plate number
     */
    cleanAndCorrectPlate(plate) {
        if (!plate) return null;

        const components = this.extractComponents(plate);
        
        // استخدام الأحرف العربية إذا كانت موجودة
        let letters = '';
        if (components.arabicLetters.length > 0) {
            letters = components.arabicLetters.join('');
            // التحقق من صحة الأحرف
            letters = letters.split('').filter(l => this.isValidArabicLetter(l)).join('');
        } else if (components.englishLetters.length > 0) {
            // تحويل الأحرف الإنجليزية إلى عربية
            const englishText = components.englishLetters.join('');
            for (const letter of englishText) {
                const arabic = this.convertEnglishToArabic(letter);
                if (arabic) {
                    letters += arabic;
                }
            }
        }

        // استخدام الأرقام
        const numbers = components.numbers.join('');

        // التحقق من صحة التنسيق
        if (letters.length >= 1 && letters.length <= 3 && numbers.length >= 1 && numbers.length <= 4) {
            return `${letters} ${numbers}`;
        }

        return null;
    }
}

// Create a global instance
const saudiPlateValidator = new SaudiPlateValidator();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SaudiPlateValidator = SaudiPlateValidator;
    window.saudiPlateValidator = saudiPlateValidator;
}
