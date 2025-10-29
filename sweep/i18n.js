// Sweep 頁面的 i18n 整合層
// 此模組整合 common/site.js 的統一語言選擇器與 sweep/app.js 的翻譯系統

class SweepI18n {
    constructor() {
        const { getSavedLanguage } = window.TrickcalLocales;
        this.currentLang = getSavedLanguage();
    }

    // 初始化語言系統
    async init() {
        window.TrickcalCommon?.setLanguage(this.currentLang, { silent: true });
        this.setupLanguageChangeListener();
        window.TrickcalCommon?.updatePageSwitcherText?.();
    }

    // 渲染語言選擇器
    renderLanguageSelector(persistSelection = false) {
        if (persistSelection) {
            window.TrickcalCommon?.setLanguage(this.currentLang);
        }
    }

    // 更新選擇器顯示
    updateSelectorDisplay() {
        // 語言選擇器已由共用模組管理
    }

    // 監聽語言變更事件
    setupLanguageChangeListener() {
        window.addEventListener('languageChanged', (event) => {
            const newLang = event.detail?.language;
            if (newLang && newLang !== this.currentLang) {
                this.currentLang = newLang;
                // 延遲更新，確保翻譯已完全載入
                setTimeout(() => {
                    window.TrickcalCommon?.updatePageSwitcherText?.();
                }, 50);
            }
        });

        window.addEventListener('storage', (event) => {
            if (event.key === 'trickcal_language' && event.newValue) {
                const newLang = event.newValue;
                if (newLang !== this.currentLang && window.TrickcalLocales.isSupported(newLang)) {
                    this.currentLang = newLang;
                    setTimeout(() => {
                        window.TrickcalCommon?.updatePageSwitcherText?.();
                    }, 50);
                    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLang } }));
                }
            }
        });
    }
}

// 創建全局實例
window.sweepI18n = new SweepI18n();

