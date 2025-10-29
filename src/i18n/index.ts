import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW.json'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'

export type Locale = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko'

const STORAGE_KEY = 'trickcal_language'

// 從 localStorage 讀取語言設定
function getSavedLanguage(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY)
  const supportedLocales: Locale[] = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko']
  return saved && supportedLocales.includes(saved as Locale) 
    ? (saved as Locale) 
    : 'zh-TW'
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLanguage(),
  fallbackLocale: 'zh-TW',
  messages: {
    'zh-TW': zhTW,
    'zh-CN': zhCN,
    en,
    ja,
    ko
  },
  globalInjection: true
})

export default i18n

// 導出語言切換函數
export function setLanguage(locale: Locale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

export function getCurrentLanguage(): Locale {
  return i18n.global.locale.value as Locale
}

