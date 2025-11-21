#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تقارير تراخيص ParkPow السحابية
ParkPow Cloud Licenses Reporting System

هذا السكريبت يقوم بإنشاء تقارير رسمية لتراخيص ParkPow السحابية
مع ربط الصور المصغرة تلقائياً من مجلد محلي
"""

import os
import json
import pandas as pd
from datetime import datetime
from pathlib import Path


class ParkPowLicensesReport:
    """فئة لإدارة تقارير تراخيص ParkPow"""
    
    def __init__(self, image_folder="assets/parkpow_thumbnails"):
        """
        تهيئة مدير التقارير
        
        Args:
            image_folder (str): مجلد الصور المصغرة
        """
        self.image_folder = image_folder
        self.licenses = []
        self.report_date = datetime.now().strftime("%Y-%m-%d")
        
        # إنشاء مجلد الصور إذا لم يكن موجوداً
        Path(self.image_folder).mkdir(parents=True, exist_ok=True)
    
    def add_license(self, creation_date, cameras_count, license_key, description):
        """
        إضافة ترخيص جديد
        
        Args:
            creation_date (str): تاريخ الإنشاء
            cameras_count (int): عدد الكاميرات
            license_key (str): مفتاح الترخيص
            description (str): الوصف
        """
        license_data = {
            "رقم": len(self.licenses) + 1,
            "تاريخ_الإنشاء": creation_date,
            "عدد_الكاميرات": cameras_count,
            "مفتاح_الترخيص": license_key,
            "الوصف": description
        }
        self.licenses.append(license_data)
    
    def attach_thumbnails(self, df):
        """
        ربط الصور المصغرة تلقائياً بناءً على مفتاح الترخيص
        
        Args:
            df (DataFrame): جدول البيانات
            
        Returns:
            DataFrame: جدول البيانات مع الصور المصغرة
        """
        def get_thumbnail_path(license_key):
            thumbnail_name = f"thumbnail_{license_key}.jpg"
            thumbnail_path = os.path.join(self.image_folder, thumbnail_name)
            
            # التحقق من وجود الصورة
            if os.path.exists(thumbnail_path):
                return thumbnail_path
            else:
                return "لا توجد صورة"
        
        df["الصورة_المصغرة"] = df["مفتاح_الترخيص"].apply(get_thumbnail_path)
        return df
    
    def generate_dataframe(self):
        """
        إنشاء DataFrame من بيانات التراخيص
        
        Returns:
            DataFrame: جدول البيانات
        """
        if not self.licenses:
            return pd.DataFrame()
        
        df = pd.DataFrame(self.licenses)
        df = self.attach_thumbnails(df)
        return df
    
    def export_to_excel(self, filename="data/ParkPow_Licenses_Report.xlsx"):
        """
        تصدير التقرير إلى Excel
        
        Args:
            filename (str): اسم الملف
        """
        df = self.generate_dataframe()
        if df.empty:
            print("⚠️ لا توجد بيانات للتصدير")
            return
        
        # إنشاء مجلد data إذا لم يكن موجوداً
        Path(os.path.dirname(filename)).mkdir(parents=True, exist_ok=True)
        
        df.to_excel(filename, index=False, engine='openpyxl')
        print(f"✅ تم تصدير التقرير إلى Excel: {filename}")
    
    def export_to_csv(self, filename="data/ParkPow_Licenses_Report.csv"):
        """
        تصدير التقرير إلى CSV
        
        Args:
            filename (str): اسم الملف
        """
        df = self.generate_dataframe()
        if df.empty:
            print("⚠️ لا توجد بيانات للتصدير")
            return
        
        # إنشاء مجلد data إذا لم يكن موجوداً
        Path(os.path.dirname(filename)).mkdir(parents=True, exist_ok=True)
        
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"✅ تم تصدير التقرير إلى CSV: {filename}")
    
    def export_to_html(self, filename="data/ParkPow_Licenses_Report.html"):
        """
        تصدير التقرير إلى HTML
        
        Args:
            filename (str): اسم الملف
        """
        df = self.generate_dataframe()
        if df.empty:
            print("⚠️ لا توجد بيانات للتصدير")
            return
        
        # إنشاء مجلد data إذا لم يكن موجوداً
        Path(os.path.dirname(filename)).mkdir(parents=True, exist_ok=True)
        
        # إنشاء HTML مع تنسيق
        html_content = f"""
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير تراخيص ParkPow السحابية</title>
    <style>
        body {{
            font-family: 'Tajawal', Arial, sans-serif;
            direction: rtl;
            padding: 20px;
            background: #f5f5f5;
        }}
        .header {{
            text-align: center;
            background: linear-gradient(90deg, #6B5536 60%, #8B6F47 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 2em;
        }}
        .header p {{
            margin: 5px 0;
            opacity: 0.9;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
        }}
        th {{
            background: #6B5536;
            color: white;
            padding: 15px;
            text-align: right;
            font-weight: bold;
        }}
        td {{
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            text-align: right;
        }}
        tr:hover {{
            background: #f9f9f9;
        }}
        .thumbnail {{
            max-width: 100px;
            max-height: 60px;
            border-radius: 5px;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            color: #666;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 تقرير تراخيص ParkPow السحابية</h1>
        <p>🏢 الجهة: جامعة الإمام محمد بن سعود الإسلامية</p>
        <p>📅 تاريخ التقرير: {self.report_date}</p>
        <p>🧠 إعداد: علي فرحان موسى عياشي – قائد مشاريع رقمية وتشغيلية</p>
    </div>
    
    {df.to_html(index=False, classes='report-table', escape=False)}
    
    <div class="footer">
        <p>✅ تم إنشاء التقرير تلقائياً بواسطة نظام ParkPow</p>
        <p>© {datetime.now().year} جميع الحقوق محفوظة</p>
    </div>
</body>
</html>
"""
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ تم تصدير التقرير إلى HTML: {filename}")
    
    def export_to_json(self, filename="data/ParkPow_Licenses_Report.json"):
        """
        تصدير التقرير إلى JSON
        
        Args:
            filename (str): اسم الملف
        """
        df = self.generate_dataframe()
        if df.empty:
            print("⚠️ لا توجد بيانات للتصدير")
            return
        
        # إنشاء مجلد data إذا لم يكن موجوداً
        Path(os.path.dirname(filename)).mkdir(parents=True, exist_ok=True)
        
        # تحويل إلى JSON
        report_data = {
            "report_info": {
                "organization": "جامعة الإمام محمد بن سعود الإسلامية",
                "report_date": self.report_date,
                "prepared_by": "علي فرحان موسى عياشي – قائد مشاريع رقمية وتشغيلية",
                "total_licenses": len(self.licenses)
            },
            "licenses": df.to_dict(orient='records')
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ تم تصدير التقرير إلى JSON: {filename}")
    
    def export_all(self, base_filename="data/ParkPow_Licenses_Report"):
        """
        تصدير التقرير إلى جميع الصيغ المدعومة
        
        Args:
            base_filename (str): اسم الملف الأساسي
        """
        self.export_to_excel(f"{base_filename}.xlsx")
        self.export_to_csv(f"{base_filename}.csv")
        self.export_to_html(f"{base_filename}.html")
        self.export_to_json(f"{base_filename}.json")
        print("\n✅ تم تصدير التقرير بنجاح إلى جميع الصيغ!")


def create_sample_report():
    """إنشاء تقرير نموذجي للاختبار"""
    print("🚀 إنشاء تقرير نموذجي لتراخيص ParkPow...")
    
    # إنشاء مدير التقارير
    report = ParkPowLicensesReport()
    
    # إضافة بيانات نموذجية
    report.add_license(
        creation_date="2025-11-01",
        cameras_count=3,
        license_key="6nBNl5S6L6w",
        description="مراقبة بوابة المجمع السكني"
    )
    
    report.add_license(
        creation_date="2025-11-05",
        cameras_count=5,
        license_key="A7xMk9P2Q3r",
        description="مراقبة مواقف الزوار"
    )
    
    report.add_license(
        creation_date="2025-11-10",
        cameras_count=2,
        license_key="B4cNt8R1S5v",
        description="مراقبة البوابة الرئيسية"
    )
    
    # تصدير إلى جميع الصيغ
    report.export_all()
    
    print("\n📊 معلومات التقرير:")
    print(f"   - عدد التراخيص: {len(report.licenses)}")
    print(f"   - تاريخ التقرير: {report.report_date}")
    print(f"   - مجلد الصور: {report.image_folder}")
    
    return report


if __name__ == "__main__":
    # إنشاء تقرير نموذجي
    report = create_sample_report()
    
    print("\n" + "="*60)
    print("✅ اكتمل إنشاء التقرير بنجاح!")
    print("="*60)
