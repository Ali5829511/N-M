/**
 * مكتبة التصدير الأساسية - Base Exporter Library
 * فئة أساسية للتصدير مع وظائف مشتركة
 * Base class for exporters with shared functionality
 */

class BaseExporter {
    constructor() {
        this.data = [];
        this.images = [];
        this.title = 'تقرير تحليل السيارات';
    }

    /**
     * تعيين البيانات للتصدير
     * Set data for export
     */
    setData(data, images = []) {
        this.data = data;
        this.images = images;
    }

    /**
     * تحميل الملف - Download file
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
     * Convert image to Base64
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
     * Convert Canvas element to Base64
     */
    canvasToBase64(canvas) {
        return canvas.toDataURL('image/jpeg', 0.7);
    }

    /**
     * بناء رأس HTML للتقرير
     * Build HTML header for report
     */
    buildHeader(organizationName, departmentName, reportTitle, reportNumber = null) {
        const reportInfo = reportNumber 
            ? `<div class="report-number">${reportNumber}</div>
               <p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'})}</p>`
            : `<p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
               <p>${departmentName}</p>`;

        return `
            <div class="header">
                ${organizationName ? `<div class="org-name">${organizationName}</div>` : ''}
                ${departmentName && !reportNumber ? `<div class="dept-name">${departmentName}</div>` : ''}
                <div class="report-title">${reportTitle}</div>
                ${reportInfo}
            </div>
        `;
    }

    /**
     * بناء تذييل HTML للتقرير
     * Build HTML footer for report
     */
    buildFooter(organizationName, includeSignature = false) {
        const signatureSection = includeSignature ? `
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
        ` : '';

        return `
            <div class="footer">
                ${signatureSection}
                <div class="footer-text">
                    <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة المرور</p>
                    <p>© ${new Date().getFullYear()} ${organizationName} - جميع الحقوق محفوظة</p>
                </div>
            </div>
        `;
    }

    /**
     * بناء ملخص الإحصائيات
     * Build statistics summary
     */
    buildSummary(totalVehicles, uniqueVehicles, repeatedVehicles) {
        return `
            <div class="summary">
                <div class="summary-item">
                    <div class="summary-value">${totalVehicles}</div>
                    <div class="summary-label">إجمالي السيارات</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${uniqueVehicles}</div>
                    <div class="summary-label">سيارات فريدة</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${repeatedVehicles}</div>
                    <div class="summary-label">سيارات متكررة</div>
                </div>
            </div>
        `;
    }

    /**
     * بناء صف جدول للبيانات
     * Build table row for data
     */
    buildTableRow(item, index, imageData, showRowNumber = false) {
        const rowNumber = showRowNumber ? `<td style="text-align: center;">${index + 1}</td>` : '';
        const imageCell = imageData 
            ? `<img src="${imageData}" class="thumbnail" />` 
            : 'لا توجد صورة';

        return `
            <tr>
                ${rowNumber}
                <td style="text-align: center;">${imageCell}</td>
                <td class="plate-number">${item.plateNumber || '-'}</td>
                <td>${item.vehicleType || '-'}</td>
                <td>${item.color || '-'}</td>
                <td>${item.confidence || '-'}%</td>
                <td><strong>${item.repeatCount || 1}</strong></td>
                <td>${new Date(item.timestamp || Date.now()).toLocaleDateString('ar-SA')}</td>
            </tr>
        `;
    }

    /**
     * حساب إحصائيات البيانات
     * Calculate data statistics
     */
    calculateStatistics() {
        const totalVehicles = this.data.length;
        const uniqueVehicles = new Set(this.data.map(d => d.plateNumber)).size;
        const repeatedVehicles = this.data.filter(d => d.repeatCount > 1).length;
        
        return {
            totalVehicles,
            uniqueVehicles,
            repeatedVehicles
        };
    }
}
