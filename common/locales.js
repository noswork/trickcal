/**
 * Trickcal 語言設定共用模組
 * - 定義支援語言
 * - 提供讀寫共用語言設定的工具方法
 */
(function () {
  const SUPPORTED_LANGUAGES = {
    'zh-TW': '繁體中文',
    'zh-CN': '简体中文',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어'
  };

  const DEFAULT_LANGUAGE = 'zh-TW';
  const STORAGE_KEY = 'trickcal_language';

  function safeGetLocalStorage() {
    try {
      return window.localStorage;
    } catch (_error) {
      return null;
    }
  }

  function getSavedLanguage() {
    const storage = safeGetLocalStorage();
    if (!storage) return DEFAULT_LANGUAGE;

    const saved = storage.getItem(STORAGE_KEY);
    return saved && Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, saved)
      ? saved
      : DEFAULT_LANGUAGE;
  }

  function setSavedLanguage(lang) {
    if (!Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, lang)) return;
    const storage = safeGetLocalStorage();
    if (!storage) return;

    storage.setItem(STORAGE_KEY, lang);
  }

  function isSupported(lang) {
    return Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, lang);
  }

  window.TrickcalLocales = {
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    STORAGE_KEY,
    getSavedLanguage,
    setSavedLanguage,
    isSupported
  };
})();


