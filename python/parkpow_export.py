#!/usr/bin/env python3
"""
نظام تصدير بيانات ParkPow الاحترافي
ParkPow Professional Data Export System

يدعم تصدير البيانات إلى:
- PDF (جاهز للطباعة والمحاكم)
- Excel (مع صور مصغرة)
- HTML (جاهز للطباعة)

المميزات:
- تحميل الصور تلقائياً
- إنشاء صور مصغرة
- تقارير احترافية
- دعم اللغة العربية
- جاهز للتوثيق الرسمي
"""

import os
import csv
import json
import time
import math
import shutil
import pathlib
import requests
import pandas as pd
from datetime import datetime, timedelta, timezone
from PIL import Image
from jinja2 import Template
import subprocess

# ========================================
# الإعدادات - Configuration
# ========================================

AST = timezone(timedelta(hours=3))  # Arabia Standard Time

CONFIG = {
    "api_base": "https://api.platerecognizer.com",
    "events_endpoint": "/v1/plate-reader",
    "token": os.environ.get("PARKPOW_TOKEN", "560a4728fc1f0fee1f76d1eb67f001d762a941d9"),
    "out_dir": "exports/parkpow",
    "img_dir": "exports/parkpow/images",
    "date_from": (datetime.now(AST) - timedelta(days=1)).isoformat(),
    "date_to": datetime.now(AST).isoformat(),
    "site": None,
    "camera": None,
    "organization": "جامعة الإمام محمد بن سعود الإسلامية",
    "department": "وحدة إسكان أعضاء هيئة التدريس"
}

# إنشاء المجلدات
os.makedirs(CONFIG["out_dir"], exist_ok=True)
os.makedirs(CONFIG["img_dir"], exist_ok=True)

# ========================================
# الدوال المساعدة - Helper Functions
# ========================================

def auth_headers():
    """إرجاع رؤوس المصادقة"""
    return {"Authorization": f"Token {CONFIG['token']}"}

def to_ast(dt_str):
    """تحويل التاريخ إلى توقيت السعودية"""
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        return dt.astimezone(AST)
    except Exception:
        return None

def format_datetime(dt):
    """تنسيق التاريخ والوقت بالعربية"""
    if not dt:
        return ""
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def format_confidence(conf):
    """تنسيق نسبة الثقة"""
    if conf is None:
        return ""
    try:
        return f"{float(conf):.2%}"
    except:
        return str(conf)

# ========================================
# جلب البيانات - Data Fetching
# ========================================

def fetch_events():
    """جلب الأحداث من API"""
    print("🔄 جلب البيانات من ParkPow...")
    
    params = {
        "date_from": CONFIG["date_from"],
        "date_to": CONFIG["date_to"],
    }
    
    if CONFIG["site"]:
        params["site"] = CONFIG["site"]
    if CONFIG["camera"]:
        params["camera"] = CONFIG["camera"]
    
    try:
        r = requests.get(
            CONFIG["api_base"] + CONFIG["events_endpoint"],
            headers=auth_headers(),
            params=params,
            timeout=30
        )
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"❌ خطأ في جلب البيانات: {e}")
        return []
    
    # تطبيع البيانات
    normalized = []
    results = data.get("results", data if isinstance(data, list) else [])
    
    for e in results:
        ts = to_ast(e.get("timestamp") or e.get("time"))
        plate = (e.get("plate") or "").upper()
        conf = e.get("confidence") or e.get("score")
        cam = e.get("camera") or e.get("camera_name") or e.get("source")
        loc = e.get("location") or e.get("site") or e.get("zone")
        
        # معلومات المركبة
        vehicle = e.get("vehicle", {})
        if not isinstance(vehicle, dict):
            vehicle = {}
        
        make = vehicle.get("make")
        model = vehicle.get("model")
        color = vehicle.get("color")
        
        direction = e.get("direction") or e.get("event_type")
        img_url = e.get("image_url") or e.get("snapshot") or e.get("thumbnail")
        event_id = e.get("id") or e.get("uuid") or f"{plate}-{int(time.time()*1000)}"
        
        normalized.append({
            "event_id": event_id,
            "timestamp_ast": ts,
            "timestamp_formatted": format_datetime(ts),
            "timestamp_raw": e.get("timestamp") or e.get("time"),
            "plate": plate,
            "confidence": conf,
            "confidence_formatted": format_confidence(conf),
            "camera": cam,
            "direction": direction,
            "location": loc,
            "make": make,
            "model": model,
            "color": color,
            "image_url": img_url,
            "image_path": None,
            "thumbnail_path": None,
        })
    
    print(f"✅ تم جلب {len(normalized)} حدث")
    return normalized

# ========================================
# تحميل الصور - Image Download
# ========================================

def path_for(event_id, suffix="jpg"):
    """إنشاء مسار للصورة"""
    dt = datetime.now(AST)
    sub = f"{dt.year}/{dt.month:02d}/{dt.day:02d}"
    base = pathlib.Path(CONFIG["img_dir"]) / sub
    base.mkdir(parents=True, exist_ok=True)
    return str(base / f"{event_id}.{suffix}")

def download_image(url, event_id):
    """تحميل الصورة وإنشاء صورة مصغرة"""
    if not url:
        return None, None
    
    out_path = path_for(event_id, "jpg")
    
    try:
        # تحميل الصورة
        with requests.get(url, headers=auth_headers(), stream=True, timeout=30) as resp:
            resp.raise_for_status()
            with open(out_path, "wb") as f:
                shutil.copyfileobj(resp.raw, f)
        
        # إنشاء صورة مصغرة
        thumb_path = path_for(event_id + "_thumb", "jpg")
        with Image.open(out_path) as img:
            img.thumbnail((320, 320))
            img.save(thumb_path, "JPEG", quality=85)
        
        return out_path, thumb_path
    except Exception as e:
        print(f"⚠️ خطأ في تحميل الصورة {event_id}: {e}")
        return None, None

def attach_images(events):
    """إرفاق الصور بالأحداث"""
    print("🔄 تحميل الصور...")
    
    for i, e in enumerate(events, 1):
        print(f"  [{i}/{len(events)}] {e['event_id']}")
        full, thumb = download_image(e["image_url"], e["event_id"])
        e["image_path"] = full
        e["thumbnail_path"] = thumb
    
    print("✅ تم تحميل الصور")
    return events

# ========================================
# تصدير Excel - Excel Export
# ========================================

def export_excel(events, filename="parkpow_events.xlsx"):
    """تصدير البيانات إلى Excel مع الصور"""
    print("🔄 إنشاء ملف Excel...")
    
    xls_path = os.path.join(CONFIG["out_dir"], filename)
    df = pd.DataFrame(events)
    
    # اختيار الأعمدة للعرض
    display_columns = [
        "event_id", "timestamp_formatted", "plate", "confidence_formatted",
        "camera", "direction", "location", "make", "model", "color"
    ]
    
    df_display = df[display_columns].copy()
    df_display.columns = [
        "المعرف", "التاريخ والوقت", "اللوحة", "الثقة",
        "الكاميرا", "الاتجاه", "الموقع", "الماركة", "الموديل", "اللون"
    ]
    
    with pd.ExcelWriter(xls_path, engine="xlsxwriter") as writer:
        # ورقة البيانات الأساسية
        df_display.to_excel(writer, sheet_name="الأحداث", index=False)
        wb = writer.book
        ws = writer.sheets["الأحداث"]
        
        # تنسيق الرأس
        header_fmt = wb.add_format({
            "bold": True,
            "bg_color": "#4682B4",
            "font_color": "white",
            "align": "center",
            "valign": "vcenter"
        })
        
        for col_num in range(len(df_display.columns)):
            ws.set_row(0, 25, header_fmt)
            ws.set_column(col_num, col_num, 20)
        
        # ورقة مع الصور المصغرة
        ws2 = wb.add_worksheet("الأحداث مع الصور")
        
        columns = [
            "event_id", "timestamp_formatted", "plate", "confidence_formatted",
            "camera", "location"
        ]
        headers = ["المعرف", "التاريخ والوقت", "اللوحة", "الثقة", "الكاميرا", "الموقع"]
        
        for i, h in enumerate(headers):
            ws2.write(0, i, h, header_fmt)
            ws2.set_column(i, i, 18)
        
        # كتابة البيانات والصور
        for idx, e in enumerate(events, start=1):
            for i, c in enumerate(columns):
                ws2.write(idx, i, e.get(c, ""))
            
            if e.get("thumbnail_path") and os.path.exists(e["thumbnail_path"]):
                ws2.set_row(idx, 80)
                ws2.insert_image(
                    idx, len(columns),
                    e["thumbnail_path"],
                    {"x_scale": 0.7, "y_scale": 0.7}
                )
        
        # ورقة جودة البيانات
        ws3 = wb.add_worksheet("جودة البيانات")
        
        total = len(events)
        missing_img = sum(1 for e in events if not e.get("image_path"))
        low_conf = sum(1 for e in events if e.get("confidence") and float(e["confidence"]) < 0.8)
        
        ws3.write(0, 0, "إجمالي الأحداث", header_fmt)
        ws3.write(0, 1, total)
        ws3.write(1, 0, "الصور المفقودة", header_fmt)
        ws3.write(1, 1, missing_img)
        ws3.write(2, 0, "ثقة منخفضة (<80%)", header_fmt)
        ws3.write(2, 1, low_conf)
        
        ws3.set_column(0, 0, 25)
        ws3.set_column(1, 1, 15)
    
    print(f"✅ تم إنشاء ملف Excel: {xls_path}")
    return xls_path

# ========================================
# تصدير HTML - HTML Export
# ========================================

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>تقرير المركبات - ParkPow</title>
<link rel="stylesheet" href="../../css/brand-identity.css">
<style>
@page { size: A4; margin: 15mm; }
@media print {
    .no-print { display: none; }
}

body {
    font-family: var(--font-family);
    color: var(--neutral-800);
    background: white;
    margin: 0;
    padding: 20px;
}

.report-header {
    background: var(--gradient-primary);
    color: var(--primary-white);
    padding: var(--spacing-xl);
    border-radius: var(--radius-xl);
    margin-bottom: var(--spacing-xl);
    text-align: center;
}

.report-header h1 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: var(--font-size-3xl);
}

.report-meta {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
    font-size: var(--font-size-sm);
}

.report-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-md);
}

.report-table th {
    background: var(--gradient-primary);
    color: var(--primary-white);
    padding: 12px 8px;
    text-align: center;
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
}

.report-table td {
    border: 1px solid var(--neutral-200);
    padding: 10px 8px;
    text-align: center;
    font-size: var(--font-size-xs);
}

.report-table tr:nth-child(even) {
    background: var(--neutral-50);
}

.report-table tr:hover {
    background: rgba(135, 206, 235, 0.1);
}

.thumb {
    width: 120px;
    height: auto;
    border: 2px solid var(--neutral-300);
    border-radius: var(--radius-sm);
}

.signature-section {
    margin-top: var(--spacing-3xl);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-2xl);
}

.signature-box {
    border-top: 2px solid var(--neutral-800);
    padding-top: var(--spacing-md);
    text-align: center;
    font-weight: var(--font-weight-bold);
}

.footer-note {
    margin-top: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--neutral-100);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    color: var(--neutral-600);
    text-align: center;
}

.print-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    background: var(--gradient-primary);
    color: var(--primary-white);
    border: none;
    padding: 12px 24px;
    border-radius: var(--radius-full);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    box-shadow: var(--shadow-lg);
}

.print-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
}
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">🖨️ طباعة</button>

<div class="report-header">
    <h1>📋 تقرير المركبات - ParkPow</h1>
    <div class="report-meta">
        <div><strong>الجهة:</strong> {{ organization }}</div>
        <div><strong>القسم:</strong> {{ department }}</div>
        <div><strong>من:</strong> {{ date_from }}</div>
        <div><strong>إلى:</strong> {{ date_to }}</div>
        <div><strong>تاريخ الإنشاء:</strong> {{ generated_at }}</div>
        <div><strong>عدد الأحداث:</strong> {{ total_events }}</div>
    </div>
</div>

<table class="report-table">
<thead>
<tr>
    <th>المعرف</th>
    <th>التاريخ والوقت</th>
    <th>اللوحة</th>
    <th>الثقة</th>
    <th>الكاميرا</th>
    <th>الاتجاه</th>
    <th>الموقع</th>
    <th>الماركة</th>
    <th>الموديل</th>
    <th>اللون</th>
    <th>الصورة</th>
</tr>
</thead>
<tbody>
{% for e in events %}
<tr>
    <td>{{ e.event_id }}</td>
    <td>{{ e.timestamp_formatted }}</td>
    <td><strong>{{ e.plate }}</strong></td>
    <td>{{ e.confidence_formatted }}</td>
    <td>{{ e.camera }}</td>
    <td>{{ e.direction }}</td>
    <td>{{ e.location }}</td>
    <td>{{ e.make }}</td>
    <td>{{ e.model }}</td>
    <td>{{ e.color }}</td>
    <td>
        {% if e.thumbnail_path %}
        <img class="thumb" src="{{ e.thumbnail_path }}" alt="صورة المركبة">
        {% else %}
        <span style="color: #999;">لا توجد صورة</span>
        {% endif %}
    </td>
</tr>
{% endfor %}
</tbody>
</table>

<div class="signature-section">
    <div class="signature-box">
        <div>إعداد: _________________________</div>
        <div style="margin-top: 10px; font-size: 12px; color: #666;">التوقيع والتاريخ</div>
    </div>
    <div class="signature-box">
        <div>اعتماد: _________________________</div>
        <div style="margin-top: 10px; font-size: 12px; color: #666;">التوقيع والختم</div>
    </div>
</div>

<div class="footer-note">
    <strong>ملاحظة:</strong> هذا التقرير تقني ويُستخدم لأغراض التوثيق والشفافية المؤسسية.
    يمكن إرفاق صور كاملة في ملحق مستقل عند الحاجة للاستخدام القانوني.
    <br><br>
    <strong>{{ organization }}</strong> - {{ department }}
</div>

</body>
</html>
"""

def export_html(events, filename="parkpow_events.html"):
    """تصدير البيانات إلى HTML"""
    print("🔄 إنشاء ملف HTML...")
    
    html_path = os.path.join(CONFIG["out_dir"], filename)
    tmpl = Template(HTML_TEMPLATE)
    
    html = tmpl.render(
        events=events,
        organization=CONFIG["organization"],
        department=CONFIG["department"],
        date_from=CONFIG["date_from"],
        date_to=CONFIG["date_to"],
        generated_at=datetime.now(AST).strftime("%Y-%m-%d %H:%M"),
        total_events=len(events)
    )
    
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    
    print(f"✅ تم إنشاء ملف HTML: {html_path}")
    return html_path

# ========================================
# تصدير PDF - PDF Export
# ========================================

def export_pdf(html_path, filename="parkpow_events.pdf"):
    """تحويل HTML إلى PDF"""
    print("🔄 إنشاء ملف PDF...")
    
    pdf_path = os.path.join(CONFIG["out_dir"], filename)
    
    try:
        # استخدام wkhtmltopdf إذا كان متوفراً
        subprocess.run([
            "wkhtmltopdf",
            "--encoding", "utf-8",
            "--enable-local-file-access",
            html_path,
            pdf_path
        ], check=True)
        
        print(f"✅ تم إنشاء ملف PDF: {pdf_path}")
        return pdf_path
    except FileNotFoundError:
        print("⚠️ wkhtmltopdf غير متوفر، استخدم HTML للطباعة")
        return None
    except Exception as e:
        print(f"❌ خطأ في إنشاء PDF: {e}")
        return None

# ========================================
# التنفيذ الرئيسي - Main Execution
# ========================================

def run(date_from=None, date_to=None, site=None, camera=None):
    """تشغيل عملية التصدير الكاملة"""
    print("=" * 60)
    print("🚀 نظام تصدير بيانات ParkPow")
    print("=" * 60)
    
    # تحديث الإعدادات
    if date_from:
        CONFIG["date_from"] = date_from
    if date_to:
        CONFIG["date_to"] = date_to
    if site:
        CONFIG["site"] = site
    if camera:
        CONFIG["camera"] = camera
    
    # جلب البيانات
    events = fetch_events()
    
    if not events:
        print("⚠️ لا توجد أحداث للتصدير")
        return None
    
    # تحميل الصور
    events = attach_images(events)
    
    # التصدير
    xls = export_excel(events)
    html = export_html(events)
    pdf = export_pdf(html)
    
    print("\n" + "=" * 60)
    print("✅ اكتمل التصدير بنجاح!")
    print("=" * 60)
    print(f"📊 Excel: {xls}")
    print(f"🌐 HTML: {html}")
    if pdf:
        print(f"📄 PDF: {pdf}")
    print("=" * 60)
    
    return {
        "excel": xls,
        "html": html,
        "pdf": pdf,
        "events_count": len(events)
    }

if __name__ == "__main__":
    run()
