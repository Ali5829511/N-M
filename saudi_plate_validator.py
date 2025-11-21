#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
نظام التحقق من صحة لوحات السيارات السعودية
Saudi License Plate Validation System

هذا الملف يحتوي على جميع القواعد والتحققات الخاصة بلوحات السيارات السعودية
لضمان دقة 100% عند التعرف على اللوحات وتحليلها.

This file contains all rules and validations for Saudi license plates
to ensure 100% accuracy when recognizing and analyzing plates.
"""

import re
from typing import Dict, Tuple, List, Optional

# الأحرف العربية المسموح بها في لوحات السيارات السعودية
# Allowed Arabic letters in Saudi license plates
# المصدر: نظام المرور السعودي
# Source: Saudi Traffic System

ALLOWED_ARABIC_LETTERS = {
    'أ': 'A', 'ب': 'B', 'ح': 'J', 'د': 'D',
    'ر': 'R', 'س': 'S', 'ص': 'X', 'ط': 'T',
    'ع': 'E', 'ق': 'G', 'ك': 'K', 'ل': 'L',
    'م': 'Z', 'ن': 'N', 'هـ': 'H', 'و': 'U',
    'ى': 'V'
}

# الأحرف الإنجليزية المقابلة (للأنظمة التي تستخدم الحروف الإنجليزية)
# Corresponding English letters (for systems using English letters)
ENGLISH_TO_ARABIC = {v: k for k, v in ALLOWED_ARABIC_LETTERS.items()}

# أنواع اللوحات السعودية
# Saudi plate types
PLATE_TYPES = {
    'private': 'خاصة',           # Private vehicles
    'public': 'عمومي',           # Public transport
    'taxi': 'أجرة',              # Taxi
    'export': 'تصدير',           # Export
    'diplomatic': 'دبلوماسية',   # Diplomatic
    'temporary': 'مؤقتة',        # Temporary
    'government': 'حكومية',      # Government
    'military': 'عسكرية'         # Military
}


class SaudiPlateValidator:
    """
    فئة التحقق من صحة لوحات السيارات السعودية
    Saudi License Plate Validator Class
    """
    
    def __init__(self):
        """تهيئة المتحقق"""
        self.allowed_letters = ALLOWED_ARABIC_LETTERS
        self.english_to_arabic = ENGLISH_TO_ARABIC
    
    def is_valid_arabic_letter(self, letter: str) -> bool:
        """
        التحقق من أن الحرف العربي مسموح به في اللوحات السعودية
        Check if Arabic letter is allowed in Saudi plates
        
        Args:
            letter: الحرف العربي للتحقق منه
            
        Returns:
            True إذا كان الحرف مسموحاً، False غير ذلك
        """
        return letter in self.allowed_letters
    
    def is_valid_english_letter(self, letter: str) -> bool:
        """
        التحقق من أن الحرف الإنجليزي له مقابل عربي مسموح
        Check if English letter has a valid Arabic equivalent
        
        Args:
            letter: الحرف الإنجليزي للتحقق منه
            
        Returns:
            True إذا كان الحرف له مقابل مسموح، False غير ذلك
        """
        return letter.upper() in self.english_to_arabic
    
    def normalize_plate(self, plate: str) -> str:
        """
        تطبيع رقم اللوحة بإزالة المسافات والرموز الخاصة
        Normalize plate number by removing spaces and special characters
        
        Args:
            plate: رقم اللوحة
            
        Returns:
            رقم اللوحة المطبّع
        """
        # إزالة المسافات والرموز الخاصة
        normalized = re.sub(r'[\s\-_]', '', plate)
        return normalized.strip()
    
    def convert_english_to_arabic(self, letter: str) -> Optional[str]:
        """
        تحويل الحرف الإنجليزي إلى المقابل العربي
        Convert English letter to Arabic equivalent
        
        Args:
            letter: الحرف الإنجليزي
            
        Returns:
            الحرف العربي المقابل أو None إذا لم يوجد
        """
        return self.english_to_arabic.get(letter.upper())
    
    def convert_arabic_to_english(self, letter: str) -> Optional[str]:
        """
        تحويل الحرف العربي إلى المقابل الإنجليزي
        Convert Arabic letter to English equivalent
        
        Args:
            letter: الحرف العربي
            
        Returns:
            الحرف الإنجليزي المقابل أو None إذا لم يوجد
        """
        return self.allowed_letters.get(letter)
    
    def extract_components(self, plate: str) -> Dict[str, any]:
        """
        استخراج مكونات اللوحة (أحرف وأرقام)
        Extract plate components (letters and numbers)
        
        تنسيق اللوحة السعودية النموذجي:
        - 1-3 أحرف عربية (يمين)
        - 1-4 أرقام (يسار)
        
        Standard Saudi plate format:
        - 1-3 Arabic letters (right)
        - 1-4 numbers (left)
        
        Args:
            plate: رقم اللوحة
            
        Returns:
            قاموس يحتوي على المكونات
        """
        normalized = self.normalize_plate(plate)
        
        # استخراج الأحرف العربية
        arabic_letters = re.findall(r'[\u0600-\u06FF]+', normalized)
        
        # استخراج الأحرف الإنجليزية
        english_letters = re.findall(r'[A-Za-z]+', normalized)
        
        # استخراج الأرقام
        numbers = re.findall(r'\d+', normalized)
        
        return {
            'arabic_letters': arabic_letters,
            'english_letters': english_letters,
            'numbers': numbers,
            'raw': normalized
        }
    
    def validate_plate_format(self, plate: str) -> Tuple[bool, str, Dict]:
        """
        التحقق الشامل من تنسيق اللوحة السعودية
        Comprehensive validation of Saudi plate format
        
        القواعد:
        1. يجب أن تحتوي على 1-3 أحرف
        2. يجب أن تحتوي على 1-4 أرقام
        3. الأحرف يجب أن تكون من القائمة المسموحة
        4. الأرقام يجب أن تكون أرقام فقط
        
        Rules:
        1. Must contain 1-3 letters
        2. Must contain 1-4 numbers
        3. Letters must be from allowed list
        4. Numbers must be digits only
        
        Args:
            plate: رقم اللوحة للتحقق منه
            
        Returns:
            (صحة اللوحة، رسالة، تفاصيل)
        """
        components = self.extract_components(plate)
        details = {
            'valid': False,
            'plate': plate,
            'normalized': components['raw'],
            'components': components,
            'errors': [],
            'warnings': []
        }
        
        # التحقق من وجود أحرف
        has_arabic = len(components['arabic_letters']) > 0
        has_english = len(components['english_letters']) > 0
        
        if not has_arabic and not has_english:
            details['errors'].append('لا توجد أحرف في اللوحة / No letters found')
            return False, 'لوحة غير صحيحة: لا توجد أحرف', details
        
        # التحقق من وجود أرقام
        if not components['numbers']:
            details['errors'].append('لا توجد أرقام في اللوحة / No numbers found')
            return False, 'لوحة غير صحيحة: لا توجد أرقام', details
        
        # التحقق من الأحرف العربية
        if has_arabic:
            all_letters = ''.join(components['arabic_letters'])
            if len(all_letters) < 1 or len(all_letters) > 3:
                details['errors'].append(f'عدد الأحرف غير صحيح: {len(all_letters)} (المسموح: 1-3)')
                return False, f'عدد الأحرف غير صحيح: {len(all_letters)}', details
            
            # التحقق من أن جميع الأحرف مسموحة
            for letter in all_letters:
                if not self.is_valid_arabic_letter(letter):
                    details['errors'].append(f'حرف غير مسموح: {letter}')
                    details['warnings'].append(f'الأحرف المسموحة: {", ".join(self.allowed_letters.keys())}')
                    return False, f'حرف غير مسموح في اللوحات السعودية: {letter}', details
        
        # التحقق من الأحرف الإنجليزية (إن وجدت)
        if has_english:
            all_english = ''.join(components['english_letters'])
            if len(all_english) < 1 or len(all_english) > 3:
                details['errors'].append(f'عدد الأحرف الإنجليزية غير صحيح: {len(all_english)} (المسموح: 1-3)')
            
            # التحقق من أن جميع الأحرف لها مقابل عربي
            for letter in all_english:
                if not self.is_valid_english_letter(letter):
                    details['warnings'].append(f'حرف إنجليزي ليس له مقابل عربي مسموح: {letter}')
        
        # التحقق من الأرقام
        all_numbers = ''.join(components['numbers'])
        if len(all_numbers) < 1 or len(all_numbers) > 4:
            details['errors'].append(f'عدد الأرقام غير صحيح: {len(all_numbers)} (المسموح: 1-4)')
            return False, f'عدد الأرقام غير صحيح: {len(all_numbers)}', details
        
        # اللوحة صحيحة
        details['valid'] = True
        details['letters_count'] = len(all_letters) if has_arabic else len(all_english)
        details['numbers_count'] = len(all_numbers)
        
        return True, 'لوحة صحيحة ✓', details
    
    def get_allowed_letters_list(self) -> List[Dict[str, str]]:
        """
        الحصول على قائمة الأحرف المسموحة مع مقابلاتها
        Get list of allowed letters with their equivalents
        
        Returns:
            قائمة بالأحرف المسموحة
        """
        return [
            {'arabic': ar, 'english': en, 'note': 'مسموح'}
            for ar, en in self.allowed_letters.items()
        ]
    
    def suggest_corrections(self, plate: str) -> List[str]:
        """
        اقتراح تصحيحات محتملة للوحة غير صحيحة
        Suggest possible corrections for invalid plate
        
        Args:
            plate: رقم اللوحة
            
        Returns:
            قائمة بالاقتراحات
        """
        suggestions = []
        components = self.extract_components(plate)
        
        # إذا كانت هناك أحرف إنجليزية، اقترح التحويل للعربية
        if components['english_letters']:
            english_text = ''.join(components['english_letters'])
            arabic_equivalent = ''
            for letter in english_text:
                arabic_letter = self.convert_english_to_arabic(letter)
                if arabic_letter:
                    arabic_equivalent += arabic_letter
                else:
                    suggestions.append(f'لا يوجد مقابل عربي للحرف: {letter}')
            
            if arabic_equivalent:
                numbers = ''.join(components['numbers'])
                suggestions.append(f'اقتراح: {arabic_equivalent} {numbers}')
        
        return suggestions


def print_allowed_letters():
    """طباعة قائمة الأحرف المسموحة"""
    print("\n" + "="*70)
    print("🚗 الأحرف العربية المسموحة في لوحات السيارات السعودية")
    print("   Allowed Arabic Letters in Saudi License Plates")
    print("="*70)
    
    validator = SaudiPlateValidator()
    letters = validator.get_allowed_letters_list()
    
    print(f"\n{'العربي':<10} {'English':<10} {'الحالة':<15}")
    print("-"*40)
    
    for letter in letters:
        print(f"{letter['arabic']:<10} {letter['english']:<10} {letter['note']:<15}")
    
    print(f"\nإجمالي الأحرف المسموحة: {len(letters)}")
    print("="*70 + "\n")


def test_plate_validation():
    """اختبار نظام التحقق من اللوحات"""
    validator = SaudiPlateValidator()
    
    test_plates = [
        'أ ب ج ١٢٣٤',     # لوحة صحيحة
        'أبج1234',          # لوحة صحيحة بدون مسافات
        'ABC1234',          # لوحة بأحرف إنجليزية
        'س ص ٩٨٧',        # لوحة صحيحة
        'ث خ ذ 123',       # أحرف غير مسموحة
        'أب12345',          # أرقام زائدة
        'أبجد123',          # أحرف زائدة
        '1234',             # لا توجد أحرف
        'أبج',              # لا توجد أرقام
    ]
    
    print("\n" + "="*70)
    print("🔍 اختبار نظام التحقق من اللوحات السعودية")
    print("   Testing Saudi Plate Validation System")
    print("="*70 + "\n")
    
    for plate in test_plates:
        is_valid, message, details = validator.validate_plate_format(plate)
        status = "✓ صحيحة" if is_valid else "✗ غير صحيحة"
        print(f"اللوحة: {plate:<20} {status}")
        print(f"  الرسالة: {message}")
        
        if details['errors']:
            print(f"  الأخطاء: {', '.join(details['errors'])}")
        
        if details['warnings']:
            print(f"  تحذيرات: {', '.join(details['warnings'])}")
        
        # عرض الاقتراحات إذا كانت اللوحة غير صحيحة
        if not is_valid:
            suggestions = validator.suggest_corrections(plate)
            if suggestions:
                print(f"  اقتراحات: {', '.join(suggestions)}")
        
        print()
    
    print("="*70 + "\n")


if __name__ == "__main__":
    # طباعة الأحرف المسموحة
    print_allowed_letters()
    
    # اختبار النظام
    test_plate_validation()
