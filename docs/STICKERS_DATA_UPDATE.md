# دليل تحديث بيانات ملصقات السيارات
# Stickers Data Update Guide

## نظرة عامة
هذا الدليل يشرح كيفية تحديث بيانات ملصقات السيارات في النظام من ملف Excel.

## موقع البيانات

### 1. ملف JSON (pages/stickers_data.json)
هذا الملف يحتوي على بيانات الملصقات التي يتم تحميلها مباشرة في الصفحة.

**الموقع:** `/pages/stickers_data.json`

### 2. قاعدة البيانات المحلية (localStorage)
البيانات يتم تخزينها أيضًا في localStorage في المتصفح من خلال `js/database.js`

**المفتاح:** `stickers`

## تنسيق البيانات

كل سجل ملصق يجب أن يحتوي على الحقول التالية:

```json
{
  "رقم الهوية": "1234567890",
  "اسم الساكن": "د. أحمد محمد علي",
  "حالة": "فعال",
  "تاريخ الملصق": "2025-01-15",
  "رقم لوحة السيارة": "ر ق ل 1234",
  "نوع المركبة": "سيدان",
  "نوع الوحدة": "فلة",
  "المبنى": "15",
  "شقة": "25",
  "ملاحظات": "ملصق جديد"
}
```

### الحقول المطلوبة:
- **رقم الهوية**: رقم هوية الساكن (نص)
- **اسم الساكن**: الاسم الكامل للساكن (نص)
- **حالة**: حالة الملصق (فعال / غير فعال / ملغي / مخالفة)
- **تاريخ الملصق**: تاريخ إصدار الملصق (YYYY-MM-DD)
- **رقم لوحة السيارة**: رقم لوحة السيارة (نص)
- **نوع المركبة**: نوع المركبة (سيدان، SUV، إلخ)
- **نوع الوحدة**: نوع الوحدة السكنية (فلة / شقة)
- **المبنى**: رقم المبنى (نص)
- **شقة**: رقم الشقة (نص)
- **ملاحظات**: ملاحظات إضافية (نص، اختياري)

## كيفية التحديث من ملف Excel

### الطريقة 1: استخدام أداة تحويل Excel إلى JSON

#### الخطوة 1: تجهيز ملف Excel
تأكد من أن ملف Excel الخاص بك يحتوي على الأعمدة التالية:
- رقم الهوية
- اسم الساكن
- حالة
- تاريخ الملصق
- رقم لوحة السيارة
- نوع المركبة
- نوع الوحدة
- المبنى
- شقة
- ملاحظات

#### الخطوة 2: تحويل Excel إلى JSON
استخدم أحد الأدوات التالية:
- [ConvertCSV](https://www.convertcsv.com/excel-to-json.htm)
- [Excel to JSON Online](https://beautifytools.com/excel-to-json-converter.php)
- Python script (انظر الأسفل)

#### الخطوة 3: نسخ البيانات
بعد التحويل، انسخ محتوى JSON إلى ملف `pages/stickers_data.json`

### الطريقة 2: استخدام Python Script

```python
import pandas as pd
import json

# قراءة ملف Excel
df = pd.read_excel('stickers_data.xlsx')

# تحويل إلى JSON
json_data = df.to_dict(orient='records')

# حفظ إلى ملف JSON
with open('pages/stickers_data.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=2)

print("تم تحويل البيانات بنجاح!")
```

### الطريقة 3: استخدام Node.js Script

```javascript
const XLSX = require('xlsx');
const fs = require('fs');

// قراءة ملف Excel
const workbook = XLSX.readFile('stickers_data.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// تحويل إلى JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// حفظ إلى ملف JSON
fs.writeFileSync(
  'pages/stickers_data.json',
  JSON.stringify(jsonData, null, 2),
  'utf-8'
);

console.log('تم تحويل البيانات بنجاح!');
```

## التحقق من البيانات

بعد تحديث الملف، تأكد من:

1. **صحة تنسيق JSON:**
   ```bash
   # استخدم أداة للتحقق من صحة JSON
   cat pages/stickers_data.json | jq .
   ```

2. **فتح الصفحة في المتصفح:**
   افتح `pages/enhanced_stickers_management.html` وتحقق من ظهور البيانات

3. **التحقق من Console في المتصفح:**
   يجب أن ترى رسالة: `تم تحميل X سجل من البيانات الحقيقية`

## الحالات الخاصة

### تحديث البيانات من OneDrive

إذا كانت البيانات موجودة في OneDrive:

1. قم بتحميل الملف من OneDrive
2. افتحه في Excel
3. احفظه كملف `.xlsx` على جهازك
4. استخدم إحدى الطرق المذكورة أعلاه للتحويل

### معالجة الأخطاء الشائعة

#### خطأ: "Failed to load resource: 404"
- تأكد من وجود ملف `stickers_data.json` في مجلد `pages`
- تحقق من اسم الملف (يجب أن يكون بالضبط: `stickers_data.json`)

#### خطأ: "JSON Parse Error"
- تحقق من صحة تنسيق JSON
- تأكد من عدم وجود فواصل زائدة
- تأكد من استخدام UTF-8 encoding

#### البيانات لا تظهر
- افتح console في المتصفح
- احذف cache المتصفح (Ctrl+Shift+Delete)
- أعد تحميل الصفحة (Ctrl+F5)

## قاعدة البيانات المحلية

### تهيئة البيانات الافتراضية
يتم تهيئة بيانات الملصقات الافتراضية تلقائيًا عند أول تحميل من خلال:
- `js/database.js` → `initializeDefaultStickers()`

### الوصول إلى البيانات برمجيًا

```javascript
// الحصول على جميع الملصقات
const stickers = await window.db.getStickers();

// إضافة ملصق جديد
const result = await window.db.addSticker({
  idNumber: '1234567890',
  residentName: 'د. أحمد محمد',
  status: 'فعال',
  // ... باقي الحقول
});

// البحث برقم اللوحة
const results = await window.db.searchStickersByPlate('ر ق ل 1234');

// الحصول على الإحصائيات
const stats = await window.db.getStickerStats();
```

## الصلاحيات والأمان

⚠️ **ملاحظة مهمة:** النظام الحالي يستخدم localStorage للتطوير والاختبار فقط.

في بيئة الإنتاج:
- استخدم قاعدة بيانات حقيقية (PostgreSQL, MySQL, MongoDB)
- أضف authentication و authorization
- استخدم API خلفي آمن
- فعّل HTTPS/SSL
- أضف تشفير للبيانات الحساسة

## الدعم والمساعدة

للمزيد من المساعدة:
1. راجع ملف `js/database.js` لفهم وظائف قاعدة البيانات
2. راجع `pages/enhanced_stickers_management.html` لفهم كيفية عرض البيانات
3. راجع console المتصفح لرسائل الأخطاء

## التحديثات المستقبلية

خطط التطوير المستقبلية:
- [ ] واجهة لاستيراد Excel مباشرة من المتصفح
- [ ] التحقق التلقائي من صحة البيانات
- [ ] دعم التحديثات الدفعية (Batch Updates)
- [ ] تصدير البيانات إلى Excel
- [ ] النسخ الاحتياطي التلقائي

---

**آخر تحديث:** 2025-01-15
**الإصدار:** 1.0.0
