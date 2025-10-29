import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// 樣式
import './styles/main.css'

// GitHub Pages SPA 重定向處理
if (sessionStorage.redirect) {
  const redirect = sessionStorage.redirect
  sessionStorage.removeItem('redirect')
  router.replace(redirect)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

