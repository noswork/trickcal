# Trickcal Tools - Vue 3 版本

這是 Trickcal 工具集的 Vue 3 + TypeScript + Vite 重構版本。

## 技術棧

- **前端框架**: Vue 3 (Composition API)
- **開發語言**: TypeScript
- **構建工具**: Vite
- **路由**: Vue Router 4
- **狀態管理**: Pinia
- **多語言**: Vue I18n
- **後端服務**: Supabase (使用計數器)

## 專案結構

```
trickcal/
├── src/
│   ├── components/          # 組件
│   │   ├── Layout/         # 布局組件
│   │   ├── Board/          # 金蠟筆記錄本組件
│   │   └── Sweep/          # 掃蕩工具組件
│   ├── views/              # 頁面
│   │   ├── Home.vue        # 首頁
│   │   ├── Board.vue       # 金蠟筆記錄本
│   │   └── Sweep.vue       # 掃蕩工具
│   ├── stores/             # Pinia stores
│   │   ├── theme.ts        # 主題管理
│   │   ├── board.ts        # 棋盤數據
│   │   └── sweep.ts        # 掃蕩數據
│   ├── i18n/               # 多語言配置
│   │   ├── index.ts        # i18n 設定
│   │   └── locales/        # 語言文件
│   ├── router/             # 路由配置
│   ├── styles/             # 全局樣式
│   ├── App.vue             # 根組件
│   └── main.ts             # 入口文件
├── public/                 # 靜態資源
├── assets/                 # 遊戲資源
│   ├── backgrounds/        # 背景圖片/影片
│   ├── characters/         # 角色圖片
│   ├── gears/              # 裝備素材圖片
│   └── icons/              # 圖標
├── board/                  # Board 數據文件
│   └── data.json
├── sweep/                  # Sweep 數據文件
│   └── data.json
├── index-new.html          # HTML 入口
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 依賴配置
```

## 安裝與運行

### 1. 安裝依賴

```bash
npm install
```

### 2. 開發環境運行

```bash
npm run dev
```

應用將在 `http://localhost:3000` 啟動。

### 3. 類型檢查

```bash
npm run type-check
```

### 4. 構建生產版本

```bash
npm run build
```

構建結果將輸出到 `dist/` 目錄。

### 5. 預覽生產版本

```bash
npm run preview
```

## 環境變數

創建 `.env` 文件（參考 `.env.example`）：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 主要功能

### 金蠟筆記錄本 (Board)

- 角色收藏管理
- 著色版進度追蹤
- 多層級系統 (第一層、第二層、第三層)
- 格子類型篩選 (攻擊力、暴擊、HP、暴擊抵抗、防禦力)
- 資源統計與需求計算
- 數據本地持久化

### 掃蕩工具 (Sweep)

- 素材圖鑑瀏覽
- 素材搜索與篩選
- 最省體力方案計算
- 關卡詳情展示
- 選擇狀態持久化

### 通用功能

- 🌓 明亮/深色主題切換
- 🌍 多語言支援 (繁中、簡中、英文、日文、韓文)
- 📱 響應式設計
- 💾 本地數據持久化
- 🎨 現代化 UI 設計

## 開發指南

### 添加新語言

1. 在 `src/i18n/locales/` 添加新的語言文件 (如 `fr.json`)
2. 在 `src/i18n/index.ts` 中導入並註冊
3. 在 `AppHeader.vue` 的語言選擇器添加選項

### 添加新組件

1. 在對應目錄創建 `.vue` 文件
2. 使用 Composition API 和 TypeScript
3. 遵循現有的樣式規範
4. 使用 Pinia stores 管理狀態

### 修改樣式

全局樣式變數定義在 `src/styles/main.css` 中，包含：
- 顏色系統
- 主題變數
- 工具類
- 動畫效果

## 部署

### GitHub Pages

1. 更新 `vite.config.ts` 中的 `base` 路徑
2. 運行 `npm run build`
3. 將 `dist/` 目錄推送到 gh-pages 分支

### 其他平台

構建後的 `dist/` 目錄可以部署到任何靜態網站託管平台：
- Vercel
- Netlify
- Cloudflare Pages
- etc.

## 瀏覽器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 授權

MIT License

## 作者

nos

## 更新記錄

### v2.0.0 (Vue 3 重構版)
- 全面重構為 Vue 3 + TypeScript + Vite
- 使用 Composition API
- 改用 Pinia 狀態管理
- 整合 Vue I18n 多語言系統
- 優化性能與用戶體驗
- 改進響應式設計

