# 快速開始指南

## 🚀 開始使用

### 1. 安裝 Node.js

確保你已安裝 Node.js (建議版本 18 或以上)：
```bash
node --version
npm --version
```

### 2. 安裝專案依賴

```bash
cd /Users/nos/Documents/GitHub/noswork.github.io/trickcal
npm install
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

瀏覽器會自動打開 `http://localhost:3000`

## 📋 可用指令

- `npm run dev` - 啟動開發伺服器
- `npm run build` - 構建生產版本
- `npm run preview` - 預覽生產版本
- `npm run type-check` - TypeScript 類型檢查

## 🏗️ 專案架構

```
src/
├── components/       # Vue 組件
│   ├── Layout/      # 通用布局（Header, Footer）
│   ├── Board/       # 金蠟筆記錄本組件
│   └── Sweep/       # 掃蕩工具組件
├── views/           # 頁面組件
│   ├── Home.vue     # 首頁
│   ├── Board.vue    # 金蠟筆記錄本頁面
│   └── Sweep.vue    # 掃蕩工具頁面
├── stores/          # Pinia 狀態管理
│   ├── theme.ts     # 主題切換
│   ├── board.ts     # 棋盤數據管理
│   └── sweep.ts     # 掃蕩數據管理
├── i18n/            # 多語言配置
│   ├── index.ts     # i18n 設定
│   └── locales/     # 語言文件（繁中、簡中、英、日、韓）
├── router/          # Vue Router 配置
├── styles/          # 全局樣式
└── main.ts          # 應用入口
```

## ✨ 主要特性

### 1. 響應式設計
- 支援桌面和移動設備
- 自適應布局

### 2. 主題切換
- 明亮模式 / 深色模式
- 自動保存用戶偏好

### 3. 多語言支援
- 繁體中文 (預設)
- 簡體中文
- English
- 日本語
- 한국어

### 4. 數據持久化
- localStorage 自動保存
- 頁面刷新數據不丟失

## 🔧 環境配置

如需使用 Supabase 功能，創建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 使用說明

### 金蠟筆記錄本
1. 點擊角色卡片設置為「已擁有」
2. 再次點擊啟動格子
3. 第三次點擊取消啟動
4. 查看統計面板了解進度

### 掃蕩工具
1. 在素材圖鑑中選擇需要的素材
2. 系統自動計算最省體力方案
3. 查看關卡詳情和所需素材

## 🐛 問題排查

### 依賴安裝失敗
```bash
# 清除 npm 緩存
npm cache clean --force
# 刪除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json
# 重新安裝
npm install
```

### TypeScript 錯誤
```bash
# 運行類型檢查
npm run type-check
```

### 開發伺服器無法啟動
```bash
# 檢查端口是否被占用
lsof -i :3000
# 或使用其他端口
npm run dev -- --port 3001
```

## 📚 下一步

- 閱讀 [README-VUE.md](./README-VUE.md) 了解完整文檔
- 查看 [src/](./src/) 目錄了解代碼結構
- 自定義樣式：編輯 [src/styles/main.css](./src/styles/main.css)
- 添加新功能：參考現有組件結構

## 💬 需要幫助？

如有問題，請檢查：
1. Node.js 版本是否正確
2. 依賴是否完整安裝
3. 控制台是否有錯誤訊息

祝使用愉快！🎉

