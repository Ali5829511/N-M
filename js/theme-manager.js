/**
 * نظام إدارة السمات (Theme Manager)
 * يدير الوضع الليلي وتخصيص الألوان
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.customColors = {};
        this.init();
    }

    init() {
        // تحميل التفضيلات المحفوظة
        this.loadPreferences();
        // تطبيق السمة
        this.applyTheme();
        // إضافة أزرار التحكم
        this.addThemeControls();
    }

    loadPreferences() {
        // تحميل السمة المحفوظة
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }

        // تحميل الألوان المخصصة
        const savedColors = localStorage.getItem('customColors');
        if (savedColors) {
            try {
                this.customColors = JSON.parse(savedColors);
            } catch (e) {
                console.error('Error loading custom colors:', e);
            }
        }
    }

    savePreferences() {
        // حفظ السمة
        localStorage.setItem('theme', this.currentTheme);
        // حفظ الألوان المخصصة
        localStorage.setItem('customColors', JSON.stringify(this.customColors));
    }

    applyTheme() {
        const root = document.documentElement;
        
        if (this.currentTheme === 'dark') {
            this.applyDarkMode();
        } else {
            this.applyLightMode();
        }

        // تطبيق الألوان المخصصة
        this.applyCustomColors();
    }

    applyDarkMode() {
        const root = document.documentElement;
        
        // الألوان الأساسية للوضع الليلي
        root.style.setProperty('--primary-blue', '#5a8ab8');
        root.style.setProperty('--primary-blue-light', '#7aa5cc');
        root.style.setProperty('--primary-blue-dark', '#2d4a62');
        
        // الألوان الذهبية
        root.style.setProperty('--gold', '#d4af6a');
        root.style.setProperty('--gold-dark', '#9b7e4f');
        root.style.setProperty('--gold-light', '#ebd4a8');
        
        // ألوان الخلفية
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--bg-secondary', '#2d2d2d');
        root.style.setProperty('--bg-tertiary', '#3a3a3a');
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1f1f1f 100%)');
        
        // ألوان النص
        root.style.setProperty('--text-primary', '#e0e0e0');
        root.style.setProperty('--text-secondary', '#b0b0b0');
        root.style.setProperty('--text-tertiary', '#808080');
        root.style.setProperty('--text-white', '#ffffff');
        
        // ألوان الحدود
        root.style.setProperty('--gray-50', '#3a3a3a');
        root.style.setProperty('--gray-100', '#2d2d2d');
        root.style.setProperty('--gray-200', '#404040');
        root.style.setProperty('--gray-300', '#555555');
        root.style.setProperty('--gray-400', '#707070');
        root.style.setProperty('--gray-500', '#909090');
        root.style.setProperty('--gray-600', '#b0b0b0');
        root.style.setProperty('--gray-700', '#d0d0d0');
        root.style.setProperty('--gray-800', '#e0e0e0');
        root.style.setProperty('--gray-900', '#f0f0f0');
        
        // إضافة class للـ body
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    }

    applyLightMode() {
        const root = document.documentElement;
        
        // إعادة الألوان الافتراضية للوضع النهاري (من الشعار)
        root.style.setProperty('--primary-blue', '#3a5a7a');
        root.style.setProperty('--primary-blue-light', '#bad8f2');
        root.style.setProperty('--primary-blue-dark', '#1c2a3a');
        
        root.style.setProperty('--gold', '#c9a961');
        root.style.setProperty('--gold-dark', '#7b6840');
        root.style.setProperty('--gold-light', '#e8d4a8');
        
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8f9fa');
        root.style.setProperty('--bg-tertiary', '#f0f4f8');
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 50%, #e0e7ef 100%)');
        
        root.style.setProperty('--text-primary', '#1a365d');
        root.style.setProperty('--text-secondary', '#4a5568');
        root.style.setProperty('--text-tertiary', '#718096');
        root.style.setProperty('--text-white', '#ffffff');
        
        root.style.setProperty('--gray-50', '#f9fafb');
        root.style.setProperty('--gray-100', '#f3f4f6');
        root.style.setProperty('--gray-200', '#e5e7eb');
        root.style.setProperty('--gray-300', '#d1d5db');
        root.style.setProperty('--gray-400', '#9ca3af');
        root.style.setProperty('--gray-500', '#6b7280');
        root.style.setProperty('--gray-600', '#4b5563');
        root.style.setProperty('--gray-700', '#374151');
        root.style.setProperty('--gray-800', '#1f2937');
        root.style.setProperty('--gray-900', '#111827');
        
        // إضافة class للـ body
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }

    applyCustomColors() {
        const root = document.documentElement;
        
        // تطبيق الألوان المخصصة إذا وُجدت
        for (const [key, value] of Object.entries(this.customColors)) {
            root.style.setProperty(`--${key}`, value);
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.savePreferences();
        this.updateThemeButton();
    }

    setCustomColor(colorName, colorValue) {
        this.customColors[colorName] = colorValue;
        this.applyCustomColors();
        this.savePreferences();
    }

    resetCustomColors() {
        this.customColors = {};
        this.applyTheme();
        this.savePreferences();
    }

    addThemeControls() {
        // إنشاء زر التبديل بين الأوضاع
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle-btn';
        themeToggle.innerHTML = this.currentTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        themeToggle.title = this.currentTheme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي';
        
        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // إضافة الزر إلى الصفحة
        document.body.appendChild(themeToggle);
    }

    updateThemeButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.currentTheme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
            themeToggle.title = this.currentTheme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي';
        }
    }

    openColorCustomizer() {
        // إنشاء نافذة تخصيص الألوان
        const modal = document.createElement('div');
        modal.id = 'color-customizer-modal';
        modal.className = 'color-customizer-modal';
        modal.innerHTML = `
            <div class="color-customizer-content">
                <div class="color-customizer-header">
                    <h2>تخصيص الألوان</h2>
                    <button class="close-modal" onclick="themeManager.closeColorCustomizer()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="color-customizer-body">
                    <div class="color-option">
                        <label>اللون الأساسي:</label>
                        <input type="color" id="custom-primary" value="${this.customColors['primary-blue'] || '#1a365d'}">
                    </div>
                    <div class="color-option">
                        <label>اللون الذهبي:</label>
                        <input type="color" id="custom-gold" value="${this.customColors['gold'] || '#d4af37'}">
                    </div>
                    <div class="color-option">
                        <label>لون الخلفية الأساسي:</label>
                        <input type="color" id="custom-bg-primary" value="${this.customColors['bg-primary'] || '#ffffff'}">
                    </div>
                    <div class="color-option">
                        <label>لون النص الأساسي:</label>
                        <input type="color" id="custom-text-primary" value="${this.customColors['text-primary'] || '#1a365d'}">
                    </div>
                </div>
                <div class="color-customizer-footer">
                    <button class="btn-apply" onclick="themeManager.applyColorCustomization()">تطبيق</button>
                    <button class="btn-reset" onclick="themeManager.resetCustomColors(); themeManager.closeColorCustomizer();">إعادة تعيين</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    closeColorCustomizer() {
        const modal = document.getElementById('color-customizer-modal');
        if (modal) {
            modal.remove();
        }
    }

    applyColorCustomization() {
        const primaryBlue = document.getElementById('custom-primary')?.value;
        const gold = document.getElementById('custom-gold')?.value;
        const bgPrimary = document.getElementById('custom-bg-primary')?.value;
        const textPrimary = document.getElementById('custom-text-primary')?.value;

        if (primaryBlue) this.setCustomColor('primary-blue', primaryBlue);
        if (gold) this.setCustomColor('gold', gold);
        if (bgPrimary) this.setCustomColor('bg-primary', bgPrimary);
        if (textPrimary) this.setCustomColor('text-primary', textPrimary);

        this.closeColorCustomizer();
    }
}

// تهيئة مدير السمات عند تحميل الصفحة
// يتم تنفيذ هذا الكود في بيئة المتصفح فقط
let themeManager;
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
});
