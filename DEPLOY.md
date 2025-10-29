# GitHub Pages 部署指南

## 當前狀態 ✅

- [x] 專案 TypeScript 類型檢查通過
- [x] 專案成功 Build
- [x] Git 初始化完成
- [x] GitHub Actions workflow 已創建
- [x] 代碼已提交到本地 Git

## 部署步驟

### 步驟 1: 在 GitHub 創建 Repository

1. 前往 https://github.com/new
2. Repository 名稱輸入：`trickcal`
3. 選擇 **Public** 或 **Private**（建議 Public 以使用 GitHub Pages）
4. **不要**勾選 "Add a README file"（因為我們已經有代碼了）
5. 點擊 **Create repository**

### 步驟 2: 添加 Remote 並推送代碼

在終端執行以下命令（請將 `你的用戶名` 替換為您的 GitHub 用戶名）：

```bash
cd /Users/nos/Documents/GitHub/trickcal

# 添加 remote（替換成您的用戶名）
git remote add origin https://github.com/你的用戶名/trickcal.git

# 推送代碼
git push -u origin main
```

如果需要輸入認證，建議使用 Personal Access Token (PAT)：
- 前往 GitHub → Settings → Developer settings → Personal access tokens
- 創建一個有 `repo` 權限的 token
- 使用 token 作為密碼

### 步驟 3: 啟用 GitHub Pages

1. 前往您的 repository 頁面：`https://github.com/你的用戶名/trickcal`
2. 點擊 **Settings**（設置）
3. 在左側菜單找到 **Pages**
4. 在 **Build and deployment** 部分：
   - **Source** 選擇：**GitHub Actions**
5. 保存設置

### 步驟 4: 等待部署完成

1. 前往 **Actions** 標籤：`https://github.com/你的用戶名/trickcal/actions`
2. 您會看到一個名為 "Deploy to GitHub Pages" 的 workflow 正在運行
3. 等待綠色勾勾 ✓ 出現（通常需要 1-3 分鐘）
4. 如果出現紅色 ✗，點擊查看錯誤日誌

### 步驟 5: 訪問您的網站

部署成功後，您的網站將在以下地址可用：

```
https://你的用戶名.github.io/trickcal/
```

## 常見問題

### Q: 推送時要求輸入用戶名和密碼？

A: GitHub 已不再支持密碼認證，請使用以下方式之一：
1. **Personal Access Token (PAT)**：在 GitHub 創建 token 並用作密碼
2. **SSH Key**：配置 SSH 並使用 `git@github.com:用戶名/trickcal.git`

### Q: GitHub Actions 失敗了？

A: 常見原因：
1. 權限問題：確保 repository 的 Actions 有 Pages 寫入權限
   - Settings → Actions → General → Workflow permissions
   - 選擇 "Read and write permissions"
2. Pages 未啟用：確保在 Settings → Pages 選擇了 "GitHub Actions"

### Q: 網站顯示 404？

A: 檢查以下項目：
1. 確保 `vite.config.ts` 中的 `base` 設置為 `/trickcal/`
2. 確保 GitHub Pages 已啟用
3. 等待幾分鐘讓 CDN 更新

### Q: 想要自定義域名？

A: 在 Settings → Pages → Custom domain 輸入您的域名，並在 DNS 添加 CNAME 記錄。

## 後續更新

每次您修改代碼後，只需：

```bash
git add .
git commit -m "更新說明"
git push
```

GitHub Actions 會自動重新部署！

## 技術細節

- **框架**: Vue 3 + TypeScript + Vite
- **路由**: Vue Router 4
- **狀態管理**: Pinia
- **多語言**: Vue I18n
- **部署**: GitHub Actions + GitHub Pages
- **Base Path**: `/trickcal/` (在 `vite.config.ts` 中配置)

## 需要幫助？

如果遇到任何問題，請檢查：
1. GitHub Actions 的執行日誌
2. 瀏覽器的開發者工具控制台
3. 確保所有資源路徑正確（使用相對路徑）

