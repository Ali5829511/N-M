/**
 * Print Template Utility
 * Provides functions to add standardized print headers and formatting to reports
 * Based on template from commit 4c6eb987 (صفحة.pdf)
 */

class PrintTemplate {
    /**
     * Initialize print template for the current page
     * @param {Object} config - Configuration object
     * @param {string} config.reportTitle - Title of the report
     * @param {string} config.reportSubtitle - Optional subtitle
     * @param {boolean} config.showDate - Show current date (default: true)
     * @param {boolean} config.showLogo - Show university logo (default: true)
     */
    static init(config = {}) {
        const {
            reportTitle = 'تقرير النظام',
            reportSubtitle = '',
            showDate = true,
            showLogo = true
        } = config;

        // Add print header if it doesn't exist
        if (!document.querySelector('.print-header')) {
            this.addPrintHeader(reportTitle, reportSubtitle, showDate, showLogo);
        }

        // Add print footer if it doesn't exist
        if (!document.querySelector('.print-footer')) {
            this.addPrintFooter();
        }

        // Add print-only class to body
        document.body.classList.add('print-enabled');

        // Setup print event listeners
        this.setupPrintListeners();
    }

    /**
     * Add standardized print header to the page
     */
    static addPrintHeader(reportTitle, reportSubtitle, showDate, showLogo) {
        const header = document.createElement('div');
        header.className = 'print-header print-only';
        header.style.display = 'none'; // Hide on screen, show on print

        let headerHTML = '';

        if (showLogo) {
            headerHTML += `
                <img src="../assets/شعار.jpg" alt="شعار الجامعة" class="logo" 
                     onerror="this.src='../assets/university_logo.png'">
            `;
        }

        headerHTML += `
            <div class="university-name">جامعة الإمام محمد بن سعود الإسلامية</div>
            <div class="department-name">نظام إدارة إسكان أعضاء هيئة التدريس</div>
            <div class="report-title">${reportTitle}</div>
        `;

        if (reportSubtitle) {
            headerHTML += `<div class="report-subtitle">${reportSubtitle}</div>`;
        }

        if (showDate) {
            const currentDate = this.formatDate(new Date());
            headerHTML += `<div class="report-date">تاريخ الطباعة: ${currentDate}</div>`;
        }

        header.innerHTML = headerHTML;

        // Insert at the beginning of body
        if (document.body.firstChild) {
            document.body.insertBefore(header, document.body.firstChild);
        } else {
            document.body.appendChild(header);
        }
    }

    /**
     * Add standardized print footer to the page
     */
    static addPrintFooter() {
        const footer = document.createElement('div');
        footer.className = 'print-footer print-only';
        footer.style.display = 'none'; // Hide on screen, show on print

        const currentDateTime = this.formatDateTime(new Date());
        
        footer.innerHTML = `
            <div>جامعة الإمام محمد بن سعود الإسلامية - نظام إدارة الإسكان</div>
            <div>تم إنشاء التقرير: ${currentDateTime} | صفحة <span class="page-number"></span></div>
        `;

        document.body.appendChild(footer);
    }

    /**
     * Setup print event listeners
     */
    static setupPrintListeners() {
        // Before print event
        window.addEventListener('beforeprint', () => {
            this.onBeforePrint();
        });

        // After print event
        window.addEventListener('afterprint', () => {
            this.onAfterPrint();
        });
    }

    /**
     * Handle before print event
     */
    static onBeforePrint() {
        console.log('Preparing document for printing...');
        
        // Show print-only elements
        document.querySelectorAll('.print-only').forEach(el => {
            el.style.display = 'block';
        });

        // Expand collapsed sections
        document.querySelectorAll('.collapsed').forEach(el => {
            el.classList.add('print-expanded');
            el.classList.remove('collapsed');
        });

        // Ensure all data is loaded
        this.ensureDataLoaded();
    }

    /**
     * Handle after print event
     */
    static onAfterPrint() {
        console.log('Print completed or cancelled');
        
        // Hide print-only elements
        document.querySelectorAll('.print-only').forEach(el => {
            el.style.display = 'none';
        });

        // Restore collapsed sections
        document.querySelectorAll('.print-expanded').forEach(el => {
            el.classList.remove('print-expanded');
            el.classList.add('collapsed');
        });
    }

    /**
     * Ensure all lazy-loaded data is rendered before printing
     */
    static ensureDataLoaded() {
        // Trigger any lazy-loading mechanisms
        const event = new Event('beforeprint-dataload');
        window.dispatchEvent(event);
    }

    /**
     * Format date in Arabic format
     */
    static formatDate(date) {
        // First, get the Gregorian date
        const gregorianDate = date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Try to get Hijri date with feature detection
        try {
            // Check if Intl.DateTimeFormat supports islamic calendar
            const supportsIslamic = typeof Intl !== 'undefined' && 
                                   typeof Intl.DateTimeFormat !== 'undefined';
            
            if (supportsIslamic) {
                const hijriDate = date.toLocaleDateString('ar-SA-u-ca-islamic', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                return `${gregorianDate} (${hijriDate})`;
            } else {
                return gregorianDate;
            }
        } catch (e) {
            // Fallback if Islamic calendar is not supported
            console.warn('Islamic calendar not supported, using Gregorian only');
            return gregorianDate;
        }
    }

    /**
     * Format date and time
     */
    static formatDateTime(date) {
        const dateStr = date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        const timeStr = date.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        return `${dateStr} ${timeStr}`;
    }

    /**
     * Trigger print dialog
     */
    static print() {
        window.print();
    }

    /**
     * Add no-print class to specific elements
     */
    static hideOnPrint(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('no-print');
        });
    }

    /**
     * Add print-only class to specific elements
     */
    static showOnlyOnPrint(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('print-only');
            el.style.display = 'none';
        });
    }

    /**
     * Prepare a table for better printing
     */
    static prepareTable(tableSelector) {
        const table = document.querySelector(tableSelector);
        if (!table) return;

        // Add print-friendly classes
        table.classList.add('print-table');

        // Ensure thead exists
        if (!table.querySelector('thead')) {
            const tbody = table.querySelector('tbody');
            if (tbody && tbody.firstChild) {
                const thead = document.createElement('thead');
                const firstRow = tbody.firstChild;
                if (firstRow.tagName === 'TR') {
                    thead.appendChild(firstRow.cloneNode(true));
                    table.insertBefore(thead, tbody);
                }
            }
        }
    }

    /**
     * Add page break before an element
     */
    static addPageBreakBefore(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('page-break-before');
        });
    }

    /**
     * Add page break after an element
     */
    static addPageBreakAfter(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('page-break-after');
        });
    }

    /**
     * Prevent page break inside an element
     */
    static preventPageBreak(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('no-page-break');
        });
    }

    /**
     * Add signature section at the end of the document
     */
    static addSignatureSection(container = 'body') {
        const signatureHTML = `
            <div class="signature-section print-only" style="display: none;">
                <div class="signature-box">
                    <div style="margin-bottom: 50px;">المعد</div>
                    <div>التوقيع: _______________</div>
                    <div>التاريخ: _______________</div>
                </div>
                <div class="signature-box">
                    <div style="margin-bottom: 50px;">المعتمد</div>
                    <div>التوقيع: _______________</div>
                    <div>التاريخ: _______________</div>
                </div>
            </div>
        `;

        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (containerEl) {
            containerEl.insertAdjacentHTML('beforeend', signatureHTML);
        }
    }

    /**
     * Generate a print preview URL (for debugging)
     */
    static getPreviewUrl() {
        return window.location.href + '?print-preview=true';
    }

    /**
     * Check if in print preview mode
     */
    static isPrintPreview() {
        const params = new URLSearchParams(window.location.search);
        return params.get('print-preview') === 'true';
    }

    /**
     * Apply print preview mode styles
     */
    static enablePrintPreview() {
        document.body.classList.add('print-preview-mode');
        
        // Show print-only elements
        document.querySelectorAll('.print-only').forEach(el => {
            el.style.display = 'block';
        });

        // Add a close preview button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'إغلاق المعاينة';
        closeBtn.className = 'close-preview-btn';
        closeBtn.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 9999;
            padding: 10px 20px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => {
            window.location.href = window.location.pathname;
        };
        document.body.appendChild(closeBtn);
    }
}

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    
    if (body.hasAttribute('data-print-template')) {
        const config = {
            reportTitle: body.getAttribute('data-report-title') || 'تقرير النظام',
            reportSubtitle: body.getAttribute('data-report-subtitle') || '',
            showDate: body.getAttribute('data-show-date') !== 'false',
            showLogo: body.getAttribute('data-show-logo') !== 'false'
        };
        
        PrintTemplate.init(config);
    }

    // Check for print preview mode
    if (PrintTemplate.isPrintPreview()) {
        PrintTemplate.enablePrintPreview();
    }
});

// Make available globally
window.PrintTemplate = PrintTemplate;
