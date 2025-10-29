// 主頁國際化 (i18n) 語言管理模組
const {
    SUPPORTED_LANGUAGES,
    getSavedLanguage,
    setSavedLanguage,
    isSupported,
    DEFAULT_LANGUAGE
} = window.TrickcalLocales;

class HomeI18n {
    constructor() {
        this.currentLang = this.loadLanguage();
        this.translations = {};
    }

    // 載入已保存的語言設置（統一使用 trickcal_language）
    loadLanguage() {
        return getSavedLanguage();
    }

    // 異步載入語言檔案
    async loadTranslations(lang) {
        try {
            const response = await fetch(`assets/lang/home/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json`);
            }
            this.translations = await response.json();
            console.log(`語言檔案載入成功: ${lang}`);
            return true;
        } catch (error) {
            console.error('載入語言檔案失敗:', error);
            // 如果載入失敗，嘗試載入繁體中文
            if (lang !== 'zh-TW') {
                return this.loadTranslations('zh-TW');
            }
            return false;
        }
    }

    // 獲取翻譯文字（支援嵌套路徑，如 "nav.title"）
    t(key, replacements = {}) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`翻譯鍵值不存在: ${key}`);
                return key; // 如果找不到，返回 key 本身
            }
        }
        
        // 處理替換變數，如 {count}
        if (typeof value === 'string' && Object.keys(replacements).length > 0) {
            Object.keys(replacements).forEach(replaceKey => {
                value = value.replace(new RegExp(`\\{${replaceKey}\\}`, 'g'), replacements[replaceKey]);
            });
        }
        
        return value;
    }

    // 切換語言
    async switchLanguage(lang) {
        if (!isSupported(lang)) {
            console.error('不支援的語言:', lang);
            return false;
        }
        
        setSavedLanguage(lang);
        this.currentLang = lang;
        await this.loadTranslations(lang);
        
        // 先更新頁面翻譯
        this.updatePageTranslations();
        
        // 觸發自定義事件，通知頁面更新（統一使用 language 參數名）
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        
        return true;
    }

    // 初始化語言系統
    async init() {
        await this.loadTranslations(this.currentLang);
        document.documentElement.lang = this.currentLang;
        this.updatePageTranslations();
        window.TrickcalCommon?.setLanguage(this.currentLang, { silent: true });
        this.setupLanguageChangeListener();
        // 確保初始化時更新 page-switcher
        setTimeout(() => {
            window.TrickcalCommon?.updatePageSwitcherText?.();
        }, 100);
    }

    renderLanguageSelector(persistSelection = true) {
        // 共用語言選擇器已在 site.js 中管理
    }

    // 監聽語言變更事件（包括從其他頁面觸發的變更）
    setupLanguageChangeListener() {
        window.addEventListener('languageChanged', async (event) => {
            const newLang = event.detail?.language;
            if (newLang && newLang !== this.currentLang) {
                this.currentLang = newLang;
                await this.loadTranslations(newLang);
                this.updatePageTranslations();
                document.documentElement.lang = newLang;
                // 延遲更新，確保翻譯已完全載入
                setTimeout(() => {
                    window.TrickcalCommon?.updatePageSwitcherText?.();
                }, 50);
            }
        });

        window.addEventListener('storage', async (event) => {
            if (event.key === 'trickcal_language' && event.newValue) {
                const newLang = event.newValue;
                if (newLang !== this.currentLang && isSupported(newLang)) {
                    this.currentLang = newLang;
                    await this.loadTranslations(newLang);
                    this.updatePageTranslations();
                    document.documentElement.lang = newLang;
                    setTimeout(() => {
                        window.TrickcalCommon?.updatePageSwitcherText?.();
                    }, 50);
                }
            }
        });
    }

    // 更新頁面上所有帶有 data-i18n 屬性的元素
    updatePageTranslations() {
        // 更新頁面標題
        const pageTitle = this.t('nav.title');
        if (pageTitle) {
            document.title = pageTitle;
        }

        // 更新所有帶有 data-i18n 屬性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.value = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // 更新帶有 data-i18n-title 屬性的元素（用於 title 屬性）
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // 延遲更新，確保翻譯已完全載入
        setTimeout(() => {
            window.TrickcalCommon?.updatePageSwitcherText?.();
        }, 50);
    }

    // 獲取當前語言代碼
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 獲取當前語言名稱
    getCurrentLanguageName() {
        const lang = isSupported(this.currentLang) ? this.currentLang : DEFAULT_LANGUAGE;
        return SUPPORTED_LANGUAGES[lang] || lang;
    }
}

// 創建全局實例
const homeI18n = new HomeI18n();

// 將 homeI18n 附加到 window 對象，以便其他腳本可以訪問
if (typeof window !== 'undefined') {
    window.i18n = homeI18n;
    window.homeI18n = homeI18n;
}

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => homeI18n.init());
} else {
    homeI18n.init();
}

