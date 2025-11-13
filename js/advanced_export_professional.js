/**
 * مكتبة التصدير المتقدمة - نسخة احترافية
 * تدعم التصدير إلى Excel, PDF, HTML مع تصميم رسمي احترافي
 */

class ProfessionalExporter {
    constructor() {
        this.data = [];
        this.images = [];
        this.title = 'تقرير تحليل السيارات';
        this.reportNumber = this.generateReportNumber();
        this.organizationName = 'جامعة الإمام محمد بن سعود الإسلامية';
        this.departmentName = 'وحدة إسكان هيئة التدريس';
        this.logoUrl = '../assets/logo.png'; // يمكن تحديثه لاحقاً
    }

    /**
     * توليد رقم تقرير فريد
     */
    generateReportNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `TR-${year}${month}${day}-${random}`;
    }

    /**
     * تعيين البيانات للتصدير
     */
    setData(data, images = []) {
        this.data = data;
        this.images = images;
    }

    /**
     * تجميع البيانات حسب اليوم (سياسة عدم التكرار)
     */
    groupByPlateAndDate(data) {
        const grouped = {};
        
        data.forEach(item => {
            const date = new Date(item.timestamp).toISOString().split('T')[0];
            const key = `${item.plateNumber}_${date}`;
            
            if (!grouped[key]) {
                grouped[key] = {
                    ...item,
                    imageCount: 1,
                    images: [item.fileName || ''],
                    allData: [item]
                };
            } else {
                grouped[key].imageCount++;
                grouped[key].images.push(item.fileName || '');
                grouped[key].allData.push(item);
                
                // تحديث الدقة بالمتوسط
                const totalConfidence = grouped[key].allData.reduce((sum, d) => sum + parseFloat(d.confidence || 0), 0);
                grouped[key].confidence = (totalConfidence / grouped[key].allData.length).toFixed(2);
            }
        });
        
        return Object.values(grouped);
    }

    /**
     * تصدير إلى Excel مع تصميم رسمي
     */
    async exportToExcel() {
        try {
            // تجميع البيانات حسب السياسة
            const groupedData = this.groupByPlateAndDate(this.data);
            
            // إنشاء محتوى HTML للجدول
            let html = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                      xmlns:x="urn:schemas-microsoft-com:office:excel" 
                      xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Arial', sans-serif; direction: rtl; }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 4px double #1a5f3f;
                            padding-bottom: 20px;
                        }
                        
                        .logo {
                            width: 100px;
                            height: 100px;
                            margin: 0 auto 15px;
                        }
                        
                        .org-name {
                            font-size: 20px;
                            font-weight: bold;
                            color: #1a5f3f;
                            margin-bottom: 5px;
                        }
                        
                        .dept-name {
                            font-size: 16px;
                            color: #666;
                            margin-bottom: 15px;
                        }
                        
                        .report-title {
                            font-size: 18px;
                            font-weight: bold;
                            color: #1a5f3f;
                            margin: 10px 0;
                        }
                        
                        .report-info {
                            font-size: 12px;
                            color: #888;
                        }
                        
                        .report-number {
                            font-weight: bold;
                            color: #1a5f3f;
                        }
                        
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin-top: 20px;
                        }
                        
                        th, td {
                            border: 2px solid #1a5f3f;
                            padding: 12px;
                            text-align: right;
                        }
                        
                        th {
                            background: linear-gradient(135deg, #1a5f3f 0%, #2d8659 100%);
                            color: white;
                            font-weight: bold;
                            font-size: 14px;
                        }
                        
                        tr:nth-child(even) {
                            background-color: #f0f8f5;
                        }
                        
                        .plate-number {
                            font-weight: bold;
                            font-size: 16px;
                            color: #1a5f3f;
                        }
                        
                        .image-count-badge {
                            background: #d4af37;
                            color: white;
                            padding: 3px 8px;
                            border-radius: 12px;
                            font-size: 11px;
                            font-weight: bold;
                        }
                        
                        img {
                            width: 100px;
                            height: 75px;
                            object-fit: cover;
                            border-radius: 5px;
                            border: 2px solid #1a5f3f;
                        }
                        
                        .footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 3px double #1a5f3f;
                            text-align: center;
                        }
                        
                        .signature-section {
                            display: flex;
                            justify-content: space-around;
                            margin: 30px 0;
                        }
                        
                        .signature-box {
                            text-align: center;
                            padding: 15px;
                        }
                        
                        .signature-line {
                            border-top: 2px solid #1a5f3f;
                            width: 200px;
                            margin: 50px auto 10px;
                        }
                        
                        .signature-label {
                            font-weight: bold;
                            color: #1a5f3f;
                        }
                        
                        .stamp-area {
                            border: 3px dashed #d4af37;
                            width: 150px;
                            height: 150px;
                            margin: 20px auto;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #d4af37;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="org-name">${this.organizationName}</div>
                        <div class="dept-name">${this.departmentName}</div>
                        <div class="report-title">${this.title}</div>
                        <div class="report-info">
                            <p>رقم التقرير: <span class="report-number">${this.reportNumber}</span></p>
                            <p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'})}</p>
                            <p>عدد المخالفات: ${groupedData.length} مخالفة</p>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>م</th>
                                <th>الصورة</th>
                                <th>رقم اللوحة</th>
                                <th>نوع المركبة</th>
                                <th>اللون</th>
                                <th>عدد التكرار</th>
                                <th>التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // إضافة البيانات
            groupedData.forEach((item, index) => {
                const imageData = this.images[index] || '';
                html += `
                    <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        <td style="text-align: center; padding: 5px;">${imageData ? `<img src="${imageData}" style="width: 120px; height: 90px; object-fit: cover; border-radius: 5px; border: 2px solid #1a5f3f;" />` : 'لا توجد صورة'}</td>
                        <td class="plate-number" style="font-size: 18px; font-weight: bold;">${item.plateNumber || '-'}</td>
                        <td style="font-size: 14px;">${item.vehicleType || '-'}</td>
                        <td style="font-size: 14px;">${item.color || '-'}</td>
                        <td style="text-align: center;"><span class="image-count-badge">${item.imageCount || 1}</span></td>
                        <td style="text-align: center;">${new Date(item.timestamp || Date.now()).toLocaleDateString('ar-SA')}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <div class="signature-section">
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-label">المعد</div>
                            </div>
                            <div class="signature-box">
                                <div class="stamp-area">ختم الجهة</div>
                            </div>
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-label">المدير</div>
                            </div>
                        </div>
                        
                        <p style="color: #888; font-size: 11px; margin-top: 20px;">
                            تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة المرور والإسكان<br>
                            © ${new Date().getFullYear()} ${this.organizationName} - جميع الحقوق محفوظة
                        </p>
                    </div>
                </body>
                </html>
            `;

            // تحويل إلى Blob وتحميل
            const blob = new Blob(['\ufeff' + html], { 
                type: 'application/vnd.ms-excel;charset=utf-8' 
            });
            
            this.downloadFile(blob, `تقرير_السيارات_${this.reportNumber}.xls`);
            return true;
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            return false;
        }
    }

    /**
     * تصدير إلى PDF مع تصميم رسمي
     */
    async exportToPDF() {
        try {
            // تجميع البيانات حسب السياسة
            const groupedData = this.groupByPlateAndDate(this.data);
            
            // إنشاء نافذة جديدة للطباعة
            const printWindow = window.open('', '_blank');
            
            let html = `
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>${this.title} - ${this.reportNumber}</title>
                    <style>
                        @page {
                            size: A4 landscape;
                            margin: 15mm;
                        }
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Arial', 'Tahoma', sans-serif;
                            direction: rtl;
                            background: white;
                            padding: 20px;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 25px;
                            border-bottom: 4px double #1a5f3f;
                            padding-bottom: 15px;
                        }
                        
                        .org-name {
                            font-size: 22px;
                            font-weight: bold;
                            color: #1a5f3f;
                            margin-bottom: 5px;
                        }
                        
                        .dept-name {
                            font-size: 16px;
                            color: #666;
                            margin-bottom: 12px;
                        }
                        
                        .report-title {
                            font-size: 20px;
                            font-weight: bold;
                            color: #1a5f3f;
                            margin: 10px 0;
                        }
                        
                        .report-info {
                            font-size: 12px;
                            color: #666;
                            margin-top: 10px;
                        }
                        
                        .report-number {
                            font-weight: bold;
                            color: #d4af37;
                            background: #1a5f3f;
                            padding: 3px 10px;
                            border-radius: 5px;
                            display: inline-block;
                            margin: 5px 0;
                        }
                        
                        .summary {
                            display: flex;
                            justify-content: space-around;
                            margin: 15px 0;
                            padding: 12px;
                            background: linear-gradient(135deg, #f0f8f5 0%, #e6f4ed 100%);
                            border-radius: 10px;
                            border: 2px solid #1a5f3f;
                        }
                        
                        .summary-item {
                            text-align: center;
                        }
                        
                        .summary-value {
                            font-size: 26px;
                            font-weight: bold;
                            color: #1a5f3f;
                        }
                        
                        .summary-label {
                            font-size: 11px;
                            color: #666;
                            margin-top: 3px;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 15px;
                        }
                        
                        th, td {
                            border: 2px solid #1a5f3f;
                            padding: 10px;
                            text-align: right;
                            vertical-align: middle;
                        }
                        
                        th {
                            background: linear-gradient(135deg, #1a5f3f 0%, #2d8659 100%);
                            color: white;
                            font-weight: bold;
                            font-size: 13px;
                        }
                        
                        tr:nth-child(even) {
                            background-color: #f0f8f5;
                        }
                        
                        .plate-number {
                            font-weight: bold;
                            font-size: 16px;
                            color: #1a5f3f;
                        }
                        
                        .thumbnail {
                            width: 70px;
                            height: 52px;
                            object-fit: cover;
                            border-radius: 5px;
                            border: 2px solid #1a5f3f;
                        }
                        
                        .image-count-badge {
                            background: #d4af37;
                            color: white;
                            padding: 3px 8px;
                            border-radius: 12px;
                            font-size: 11px;
                            font-weight: bold;
                            display: inline-block;
                        }
                        
                        .footer {
                            margin-top: 30px;
                            padding-top: 15px;
                            border-top: 3px double #1a5f3f;
                        }
                        
                        .signature-section {
                            display: flex;
                            justify-content: space-around;
                            margin: 25px 0;
                            page-break-inside: avoid;
                        }
                        
                        .signature-box {
                            text-align: center;
                            flex: 1;
                        }
                        
                        .signature-line {
                            border-top: 2px solid #1a5f3f;
                            width: 150px;
                            margin: 40px auto 8px;
                        }
                        
                        .signature-label {
                            font-weight: bold;
                            color: #1a5f3f;
                            font-size: 13px;
                        }
                        
                        .stamp-area {
                            border: 3px dashed #d4af37;
                            width: 120px;
                            height: 120px;
                            margin: 15px auto;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #d4af37;
                            font-size: 11px;
                            font-weight: bold;
                        }
                        
                        .footer-text {
                            text-align: center;
                            color: #888;
                            font-size: 10px;
                            margin-top: 15px;
                        }
                        
                        @media print {
                            body {
                                padding: 0;
                            }
                            
                            .no-print {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="org-name">${this.organizationName}</div>
                        <div class="dept-name">${this.departmentName}</div>
                        <div class="report-title">${this.title}</div>
                        <div class="report-info">
                            <div class="report-number">${this.reportNumber}</div>
                            <p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'})}</p>
                        </div>
                    </div>
                    
                    <div class="summary">
                        <div class="summary-item">
                            <div class="summary-value">${groupedData.length}</div>
                            <div class="summary-label">إجمالي المخالفات</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${this.data.length}</div>
                            <div class="summary-label">إجمالي الصور</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${new Set(groupedData.map(d => d.plateNumber)).size}</div>
                            <div class="summary-label">سيارات مختلفة</div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">م</th>
                                <th style="width: 100px;">الصورة</th>
                                <th>رقم اللوحة</th>
                                <th>نوع المركبة</th>
                                <th>اللون</th>
                                <th style="width: 90px;">عدد التكرار</th>
                                <th style="width: 100px;">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // إضافة البيانات
            groupedData.forEach((item, index) => {
                const imageData = this.images[index] || '';
                html += `
                    <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        <td style="text-align: center; padding: 5px;">
                            ${imageData ? `<img src="${imageData}" style="width: 90px; height: 67px; object-fit: cover; border-radius: 5px; border: 2px solid #1a5f3f;" />` : '-'}
                        </td>
                        <td class="plate-number">${item.plateNumber || '-'}</td>
                        <td>${item.vehicleType || '-'}</td>
                        <td>${item.color || '-'}</td>
                        <td style="text-align: center;">
                            <span class="image-count-badge">${item.imageCount || 1}</span>
                        </td>
                        <td style="text-align: center;">${new Date(item.timestamp || Date.now()).toLocaleDateString('ar-SA')}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <div class="signature-section">
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-label">المعد</div>
                            </div>
                            <div class="signature-box">
                                <div class="stamp-area">ختم الجهة</div>
                            </div>
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-label">المدير</div>
                            </div>
                        </div>
                        
                        <div class="footer-text">
                            <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة المرور والإسكان</p>
                            <p>© ${new Date().getFullYear()} ${this.organizationName} - جميع الحقوق محفوظة</p>
                            <p style="margin-top: 5px; font-size: 9px;">رقم التقرير: ${this.reportNumber}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(html);
            printWindow.document.close();
            
            // الانتظار قليلاً ثم فتح نافذة الطباعة
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
            
            return true;
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            return false;
        }
    }

    /**
     * تصدير إلى HTML مع تصميم رسمي
     */
    async exportToHTML() {
        try {
            // تجميع البيانات حسب السياسة
            const groupedData = this.groupByPlateAndDate(this.data);
            
            // نفس HTML كـ PDF لكن بدون نافذة طباعة
            let html = `
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${this.title} - ${this.reportNumber}</title>
                    <style>
                        /* نفس الأنماط من PDF */
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Arial', 'Tahoma', sans-serif; direction: rtl; background: #f5f5f5; padding: 20px; }
                        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 4px double #1a5f3f; padding-bottom: 20px; }
                        .org-name { font-size: 24px; font-weight: bold; color: #1a5f3f; margin-bottom: 8px; }
                        .dept-name { font-size: 18px; color: #666; margin-bottom: 15px; }
                        .report-title { font-size: 22px; font-weight: bold; color: #1a5f3f; margin: 12px 0; }
                        .report-number { font-weight: bold; color: #d4af37; background: #1a5f3f; padding: 5px 15px; border-radius: 5px; display: inline-block; margin: 8px 0; }
                        .summary { display: flex; justify-content: space-around; margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #f0f8f5 0%, #e6f4ed 100%); border-radius: 10px; border: 2px solid #1a5f3f; }
                        .summary-item { text-align: center; }
                        .summary-value { font-size: 32px; font-weight: bold; color: #1a5f3f; }
                        .summary-label { font-size: 13px; color: #666; margin-top: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 2px solid #1a5f3f; padding: 12px; text-align: right; vertical-align: middle; }
                        th { background: linear-gradient(135deg, #1a5f3f 0%, #2d8659 100%); color: white; font-weight: bold; }
                        tr:nth-child(even) { background-color: #f0f8f5; }
                        .plate-number { font-weight: bold; font-size: 18px; color: #1a5f3f; }
                        .thumbnail { width: 100px; height: 75px; object-fit: cover; border-radius: 5px; border: 2px solid #1a5f3f; }
                        .image-count-badge { background: #d4af37; color: white; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: bold; display: inline-block; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 3px double #1a5f3f; text-align: center; color: #888; font-size: 12px; }
                        .print-btn { background: #1a5f3f; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 20px 0; }
                        .print-btn:hover { background: #2d8659; }
                        @media print { .print-btn { display: none; } body { background: white; padding: 0; } .container { box-shadow: none; } }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="org-name">${this.organizationName}</div>
                            <div class="dept-name">${this.departmentName}</div>
                            <div class="report-title">${this.title}</div>
                            <div class="report-number">${this.reportNumber}</div>
                            <p style="color: #666; margin-top: 10px;">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'})}</p>
                        </div>
                        
                        <button class="print-btn" onclick="window.print()">
                            🖨️ طباعة التقرير
                        </button>
                        
                        <div class="summary">
                            <div class="summary-item">
                                <div class="summary-value">${groupedData.length}</div>
                                <div class="summary-label">إجمالي المخالفات</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${this.data.length}</div>
                                <div class="summary-label">إجمالي الصور</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${new Set(groupedData.map(d => d.plateNumber)).size}</div>
                                <div class="summary-label">سيارات مختلفة</div>
                            </div>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 50px;">م</th>
                                    <th style="width: 120px;">الصورة</th>
                                    <th>رقم اللوحة</th>
                                    <th>نوع المركبة</th>
                                    <th>اللون</th>
                                    <th style="width: 100px;">عدد التكرار</th>
                                    <th style="width: 120px;">التاريخ</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            groupedData.forEach((item, index) => {
                const imageData = this.images[index] || '';
                html += `
                    <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        <td style="text-align: center; padding: 5px;">
                            ${imageData ? `<img src="${imageData}" style="width: 90px; height: 67px; object-fit: cover; border-radius: 5px; border: 2px solid #1a5f3f;" />` : '-'}
                        </td>
                        <td class="plate-number">${item.plateNumber || '-'}</td>
                        <td>${item.vehicleType || '-'}</td>
                        <td>${item.color || '-'}</td>
                        <td style="text-align: center;">
                            <span class="image-count-badge">${item.imageCount || 1}</span>
                        </td>
                        <td style="text-align: center;">${new Date(item.timestamp || Date.now()).toLocaleDateString('ar-SA')}</td>
                    </tr>
                `;
            });

            html += `
                            </tbody>
                        </table>
                        
                        <div class="footer">
                            <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة المرور والإسكان</p>
                            <p>© ${new Date().getFullYear()} ${this.organizationName} - جميع الحقوق محفوظة</p>
                            <p style="margin-top: 8px; font-size: 11px;">رقم التقرير: ${this.reportNumber}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // تحميل كملف HTML
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
            this.downloadFile(blob, `تقرير_السيارات_${this.reportNumber}.html`);
            
            return true;
        } catch (error) {
            console.error('Error exporting to HTML:', error);
            return false;
        }
    }

    /**
     * تحويل صورة إلى Base64
     */
    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * تحميل ملف
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// إنشاء نسخة عامة
const professionalExporter = new ProfessionalExporter();
