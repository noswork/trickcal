import { createI18n } from 'vue-i18n'
import { LanguageStorage } from '@/utils/storage'
import zhTW from './locales/zh-TW.json'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'

export type Locale = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko'

const i18n = createI18n({
  legacy: false,
  locale: LanguageStorage.get(),
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
  LanguageStorage.set(locale)
  document.documentElement.lang = locale
}

export function getCurrentLanguage(): Locale {
  return i18n.global.locale.value as Locale
}

