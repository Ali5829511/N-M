/**
 * مكتبة التصدير المتقدمة
 * تدعم التصدير إلى Excel, PDF, HTML مع الصور المصغرة
 */

class AdvancedExporter {
    constructor() {
        this.data = [];
        this.images = [];
        this.title = 'تقرير تحليل السيارات';
    }

    /**
     * تعيين البيانات للتصدير
     */
    setData(data, images = []) {
        this.data = data;
        this.images = images;
    }

    /**
     * تصدير إلى Excel مع صور مصغرة
     */
    async exportToExcel() {
        try {
            // إنشاء محتوى HTML للجدول
            let html = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                      xmlns:x="urn:schemas-microsoft-com:office:excel" 
                      xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        table { border-collapse: collapse; width: 100%; direction: rtl; font-family: Arial; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
                        th { background-color: #8B6F47; color: white; font-weight: bold; }
                        tr:nth-child(even) { background-color: #f8f5f0; }
                        img { width: 100px; height: 75px; object-fit: cover; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .header h1 { color: #8B6F47; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${this.title}</h1>
                        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
                        <p>وحدة إسكان هيئة التدريس - جامعة الإمام محمد بن سعود الإسلامية</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>رقم اللوحة</th>
                                <th>نوع المركبة</th>
                                <th>اللون</th>
                                <th>الدقة</th>
                                <th>عدد التكرار</th>
                                <th>التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // إضافة البيانات
            this.data.forEach((item, index) => {
                const imageData = this.images[index] || '';
                html += `
                    <tr>
                        <td>${imageData ? `<img src="${imageData}" />` : 'لا توجد صورة'}</td>
                        <td style="font-weight: bold; font-size: 16px;">${item.plateNumber || '-'}</td>
                        <td>${item.vehicleType || '-'}</td>
                        <td>${item.color || '-'}</td>
                        <td>${item.confidence || '-'}%</td>
                        <td>${item.repeatCount || 1}</td>
                        <td>${new Date(item.timestamp || Date.now()).toLocaleDateString('ar-SA')}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                    <div style="margin-top: 30px; text-align: center; color: #666;">
                        <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة المرور</p>
                        <p>© ${new Date().getFullYear()} جامعة الإمام محمد بن سعود الإسلامية</p>
                    </div>
                </body>
                </html>
            `;

            // تحويل إلى Blob وتحميل
            const blob = new Blob(['\ufeff' + html], { 
                type: 'application/vnd.ms-excel;charset=utf-8' 
            });
            
            this.downloadFile(blob, `vehicle_report_${Date.now()}.xls`);
            return true;
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            return false;
        }
    }

    /**
     * تصدير إلى PDF مع صور مصغرة
     */
    async exportToPDF() {
        try {
            // إنشاء نافذة جديدة للطباعة
            const printWindow = window.open('', '_blank');
            
            let html = `
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>${this.title}</title>
                    <style>
                        @page {
                            size: A4 landscape;
                            margin: 20mm;
                        }
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Arial', sans-serif;
                            direction: rtl;
                            padding: 20px;
                            background: white;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 3px solid #8B6F47;
                            padding-bottom: 20px;
                        }
                        
                        .header h1 {
                            color: #8B6F47;
                            font-size: 28px;
                            margin-bottom: 10px;
                        }
                        
                        .header p {
                            color: #666;
                            font-size: 14px;
                            margin: 5px 0;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        
                        th, td {
                            border: 1px solid #ddd;
                            padding: 12px;
                            text-align: right;
                            vertical-align: middle;
                        }
                        
                        th {
                            background-color: #8B6F47;
                            color: white;
                            font-weight: bold;
                            font-size: 14px;
                        }
                        
                        tr:nth-child(even) {
                            background-color: #f8f5f0;
                        }
                        
                        .plate-number {
                            font-weight: bold;
                            font-size: 16px;
                            color: #8B6F47;
                        }
                        
                        .thumbnail {
                            width: 80px;
                            height: 60px;
                            object-fit: cover;
                            border-radius: 5px;
                        }
                        
                        .footer {
                            margin-top: 30px;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            border-top: 2px solid #ddd;
                            padding-top: 20px;
                        }
                        
                        .summary {
                            display: flex;
                            justify-content: space-around;
                            margin: 20px 0;
                            padding: 15px;
                            background: #f8f5f0;
                            border-radius: 10px;
                        }
                        
                        .summary-item {
                            text-align: center;
                        }
                        
                        .summary-value {
                            font-size: 24px;
                            font-weight: bold;
                            color: #8B6F47;
                        }
                        
                        .summary-label {
                            font-size: 12px;
                            color: #666;
                            margin-top: 5px;
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
                        <h1>${this.title}</h1>
                        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}</p>
                        <p>وحدة إسكان هيئة التدريس - جامعة الإمام محمد بن سعود الإسلامية</p>
                    </div>
                    
                    <div class="summary">
                        <div class="summary-item">
                            <div class="summary-value">${this.data.length}</div>
                            <div class="summary-label">إجمالي السيارات</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${new Set(this.data.map(d => d.plateNumber)).size}</div>
                            <div class="summary-label">سيارات فريدة</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${this.data.filter(d => d.repeatCount > 1).length}</div>
                            <div class="summary-label">سيارات متكررة</div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 100px;">الصورة</th>
                                <th>رقم اللوحة</th>
                                <th>نوع المركبة</th>
                                <th>اللون</th>
                                <th>الدقة</th>
                                <th>التكرار</th>
                                <th>التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // إضافة البيانات
            this.data.forEach((item, index) => {
                const imageData = this.images[index] || '';
                html += `
                    <tr>
                        <td style="text-align: center;">
                            ${imageData ? `<img src="${imageData}" class="thumbnail" />` : 'لا توجد صورة'}
                        </td>
                        <td><span class="plate-number">${item.plateNumber || '-'}</span></td>
                        <td>${item.vehicleType || '-'}</td>
                        <td>${item.color || '-'}</td>
                        <td>${item.confidence || '-'}%</td>
                        <td><strong>${item.repeatCount || 1}</strong></td>
                        <td>${new Date(item.timestamp || Date.now()).toLocaleDateString('ar-SA')}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة المرور</p>
                        <p>© ${new Date().getFullYear()} جامعة الإمام محمد بن سعود الإسلامية - جميع الحقوق محفوظة</p>
                    </div>
                    
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
                </html>
            `;

            printWindow.document.write(html);
            printWindow.document.close();
            
            return true;
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            return false;
        }
    }

    /**
     * تصدير إلى HTML مع صور مصغرة
     */
    async exportToHTML() {
        try {
            let html = `
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${this.title}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Arial', sans-serif;
                            background: linear-gradient(135deg, #f8f5f0 0%, #e8e4dc 100%);
                            padding: 20px;
                            direction: rtl;
                        }
                        
                        .container {
                            max-width: 1400px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 20px;
                            padding: 30px;
                            box-shadow: 0 8px 24px rgba(139, 111, 71, 0.15);
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 3px solid #8B6F47;
                            padding-bottom: 20px;
                        }
                        
                        .header h1 {
                            color: #8B6F47;
                            font-size: 32px;
                            margin-bottom: 10px;
                        }
                        
                        .header p {
                            color: #666;
                            font-size: 16px;
                            margin: 5px 0;
                        }
                        
                        .stats {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 20px;
                            margin: 30px 0;
                        }
                        
                        .stat-card {
                            background: linear-gradient(135deg, #8B6F47, #A0826D);
                            color: white;
                            padding: 25px;
                            border-radius: 15px;
                            text-align: center;
                        }
                        
                        .stat-value {
                            font-size: 36px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        
                        .stat-label {
                            font-size: 14px;
                            opacity: 0.9;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        
                        th, td {
                            border: 1px solid #ddd;
                            padding: 15px;
                            text-align: right;
                        }
                        
                        th {
                            background-color: #8B6F47;
                            color: white;
                            font-weight: bold;
                        }
                        
                        tr:nth-child(even) {
                            background-color: #f8f5f0;
                        }
                        
                        tr:hover {
                            background-color: #e8e4dc;
                        }
                        
                        .plate-number {
                            font-weight: bold;
                            font-size: 18px;
                            color: #8B6F47;
                        }
                        
                        .thumbnail {
                            width: 100px;
                            height: 75px;
                            object-fit: cover;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            cursor: pointer;
                            transition: transform 0.3s ease;
                        }
                        
                        .thumbnail:hover {
                            transform: scale(1.5);
                            z-index: 10;
                        }
                        
                        .badge {
                            display: inline-block;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                        }
                        
                        .badge-success {
                            background: rgba(81, 207, 102, 0.2);
                            color: #2b8a3e;
                        }
                        
                        .badge-warning {
                            background: rgba(255, 169, 77, 0.2);
                            color: #e67700;
                        }
                        
                        .badge-danger {
                            background: rgba(255, 107, 107, 0.2);
                            color: #c92a2a;
                        }
                        
                        .footer {
                            margin-top: 30px;
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                            border-top: 2px solid #ddd;
                            padding-top: 20px;
                        }
                        
                        @media (max-width: 768px) {
                            .container {
                                padding: 15px;
                            }
                            
                            table {
                                font-size: 14px;
                            }
                            
                            th, td {
                                padding: 10px;
                            }
                            
                            .thumbnail {
                                width: 60px;
                                height: 45px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${this.title}</h1>
                            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}</p>
                            <p>وحدة إسكان هيئة التدريس - جامعة الإمام محمد بن سعود الإسلامية</p>
                        </div>
                        
                        <div class="stats">
                            <div class="stat-card">
                                <div class="stat-value">${this.data.length}</div>
                                <div class="stat-label">إجمالي السيارات</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${new Set(this.data.map(d => d.plateNumber)).size}</div>
                                <div class="stat-label">سيارات فريدة</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${this.data.filter(d => d.repeatCount > 1).length}</div>
                                <div class="stat-label">سيارات متكررة</div>
                            </div>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>رقم اللوحة</th>
                                    <th>نوع المركبة</th>
                                    <th>اللون</th>
                                    <th>الدقة</th>
                                    <th>التكرار</th>
                                    <th>التاريخ</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            // إضافة البيانات
            this.data.forEach((item, index) => {
                const imageData = this.images[index] || '';
                const badgeClass = item.repeatCount > 3 ? 'danger' : item.repeatCount > 1 ? 'warning' : 'success';
                
                html += `
                    <tr>
                        <td style="text-align: center;">
                            ${imageData ? `<img src="${imageData}" class="thumbnail" alt="صورة السيارة" />` : 'لا توجد صورة'}
                        </td>
                        <td><span class="plate-number">${item.plateNumber || '-'}</span></td>
                        <td>${item.vehicleType || '-'}</td>
                        <td>${item.color || '-'}</td>
                        <td>${item.confidence || '-'}%</td>
                        <td><span class="badge badge-${badgeClass}">${item.repeatCount || 1}</span></td>
                        <td>${new Date(item.timestamp || Date.now()).toLocaleDateString('ar-SA')}</td>
                    </tr>
                `;
            });

            html += `
                            </tbody>
                        </table>
                        
                        <div class="footer">
                            <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة المرور</p>
                            <p>© ${new Date().getFullYear()} جامعة الإمام محمد بن سعود الإسلامية - جميع الحقوق محفوظة</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // تحويل إلى Blob وتحميل
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
            this.downloadFile(blob, `vehicle_report_${Date.now()}.html`);
            
            return true;
        } catch (error) {
            console.error('Error exporting to HTML:', error);
            return false;
        }
    }

    /**
     * تحميل الملف
     */
    downloadFile(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    /**
     * تحويل الصورة إلى Base64
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
     * تحويل عنصر Canvas إلى Base64
     */
    canvasToBase64(canvas) {
        return canvas.toDataURL('image/jpeg', 0.7);
    }
}

// إنشاء نسخة عامة
const advancedExporter = new AdvancedExporter();
