#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
أداة تحويل ملف Excel لملصقات السيارات إلى JSON
Excel to JSON Converter for Stickers Data

الاستخدام / Usage:
    python convert_excel_to_json.py input.xlsx output.json

المتطلبات / Requirements:
    pip install pandas openpyxl
"""

import sys
import json
import pandas as pd
from pathlib import Path

def convert_excel_to_json(excel_file, json_file):
    """
    تحويل ملف Excel إلى JSON
    Convert Excel file to JSON
    
    Args:
        excel_file: مسار ملف Excel المدخل
        json_file: مسار ملف JSON المخرج
    """
    try:
        # قراءة ملف Excel
        print(f"جاري قراءة ملف Excel: {excel_file}")
        df = pd.read_excel(excel_file)
        
        # عرض معلومات عن البيانات
        print(f"\nعدد السجلات: {len(df)}")
        print(f"الأعمدة: {', '.join(df.columns)}")
        
        # التحقق من الأعمدة المطلوبة
        required_columns = [
            'رقم الهوية',
            'اسم الساكن',
            'حالة',
            'تاريخ الملصق',
            'رقم لوحة السيارة',
            'نوع المركبة',
            'نوع الوحدة',
            'المبنى',
            'شقة'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"\n⚠️ تحذير: الأعمدة التالية مفقودة: {', '.join(missing_columns)}")
        
        # تحويل التواريخ إلى نص
        for col in df.columns:
            if 'تاريخ' in col.lower() or 'date' in col.lower():
                df[col] = pd.to_datetime(df[col], errors='coerce').dt.strftime('%Y-%m-%d')
        
        # تحويل NaN إلى قيم فارغة
        df = df.fillna('')
        
        # تحويل إلى قاموس
        data = df.to_dict(orient='records')
        
        # حفظ إلى JSON
        print(f"\nجاري حفظ البيانات إلى: {json_file}")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ تم التحويل بنجاح!")
        print(f"✓ عدد السجلات المحولة: {len(data)}")
        
        # عرض مثال على أول سجل
        if data:
            print("\nمثال على أول سجل:")
            print(json.dumps(data[0], ensure_ascii=False, indent=2))
        
        return True
        
    except FileNotFoundError:
        print(f"❌ خطأ: الملف {excel_file} غير موجود")
        return False
    except Exception as e:
        print(f"❌ خطأ: {str(e)}")
        return False

def main():
    """الدالة الرئيسية"""
    
    # عرض معلومات الاستخدام
    if len(sys.argv) < 2:
        print("أداة تحويل ملف Excel لملصقات السيارات إلى JSON")
        print("\nالاستخدام:")
        print(f"  python {sys.argv[0]} input.xlsx [output.json]")
        print("\nأمثلة:")
        print(f"  python {sys.argv[0]} stickers.xlsx")
        print(f"  python {sys.argv[0]} stickers.xlsx pages/stickers_data.json")
        sys.exit(1)
    
    # الحصول على مسارات الملفات
    excel_file = sys.argv[1]
    
    if len(sys.argv) >= 3:
        json_file = sys.argv[2]
    else:
        # استخدام نفس اسم الملف مع امتداد .json
        json_file = Path(excel_file).stem + '.json'
    
    # التحويل
    success = convert_excel_to_json(excel_file, json_file)
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
