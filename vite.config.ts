import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    // Gzip 壓縮
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 大於 10KB 才壓縮
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli 壓縮（更高壓縮率）
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 提高 chunk 大小警告閾值
    chunkSizeWarningLimit: 1000,
    // 優化構建
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // 更細緻的代碼分割
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'i18n-vendor': ['vue-i18n'],
        },
        // 優化文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 圖片資源保持原始路徑結構
          if (assetInfo.name?.match(/\.(png|jpe?g|svg|gif|webp)$/)) {
            return 'assets/[name]-[hash][extname]'
          }
          // 字體文件
          if (assetInfo.name?.match(/\.(woff2?|eot|ttf|otf)$/)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true, // 允許從網絡訪問
    open: true,
    headers: {
      // 允許 Google OAuth 彈出視窗通訊
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  }
})

