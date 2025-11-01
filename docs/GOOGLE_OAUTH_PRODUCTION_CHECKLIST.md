# Google OAuth 正式發布檢查清單

## 📋 概述

本文件提供將 TrickCal 的 Google OAuth 應用程式從測試模式切換到正式發布的完整步驟。

---

## ✅ 階段一：準備必要文件

### 1. 隱私權政策 ✓

- [x] 已建立：`public/privacy-policy.html`
- [x] 網址：`https://trickcal.nossite.com/privacy-policy.html`
- [ ] 已部署到正式環境
- [ ] 確認可以公開訪問

### 2. 服務條款 ✓

- [x] 已建立：`public/terms-of-service.html`
- [x] 網址：`https://trickcal.nossite.com/terms-of-service.html`
- [ ] 已部署到正式環境
- [ ] 確認可以公開訪問

### 3. 應用程式首頁

- [x] 網址：`https://trickcal.nossite.com`
- [ ] 確認網站正常運作
- [ ] 確認 HTTPS 連線正常

---

## ✅ 階段二：部署文件到正式環境

### 部署步驟

```bash
# 1. 建置專案
npm run build

# 2. 部署到 GitHub Pages
npm run deploy

# 3. 等待幾分鐘讓變更生效
```

### 驗證

訪問以下 URL 確認可以正常訪問：
- [ ] https://trickcal.nossite.com/privacy-policy.html
- [ ] https://trickcal.nossite.com/terms-of-service.html

---

## ✅ 階段三：設定 Google Cloud Console

### 3.1 前往 OAuth 同意畫面

1. 開啟 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇專案：`TrickCal`
3. 側邊欄選擇：**API 和服務** → **OAuth 同意畫面**

---

### 3.2 填寫必要資訊

#### 📝 **應用程式資訊**

| 欄位 | 內容 | 狀態 |
|------|------|------|
| 應用程式名稱 | `TrickCal` | ✓ |
| 使用者支援電子郵件 | [請填入您的電子郵件] | ⚠️ |
| 應用程式標誌 | (選填) | - |

#### 🌐 **應用程式網域**

| 欄位 | 內容 | 狀態 |
|------|------|------|
| 應用程式首頁 | `https://trickcal.nossite.com` | ✓ |
| 隱私權政策 | `https://trickcal.nossite.com/privacy-policy.html` | ✓ |
| 服務條款 | `https://trickcal.nossite.com/terms-of-service.html` | ✓ |

#### 🔐 **授權網域**

新增以下網域：
- [ ] `nossite.com`
- [ ] `github.io` (如果使用 GitHub Pages 的預設網域)

**重要：** 只需要填入根網域，不需要 `https://` 或子網域

---

### 3.3 設定授權範圍 (Scopes)

確認以下範圍已正確設定：

- [ ] `.../auth/userinfo.profile` - 查看您的個人資料
- [ ] `.../auth/userinfo.email` - 查看您的電子郵件地址
- [ ] `.../auth/drive.file` - 查看和管理本應用程式建立的 Google Drive 檔案

**檢查方法：**
1. 在 OAuth 同意畫面頁面往下捲動
2. 找到「範圍」區段
3. 確認上述三個範圍都已列出
4. 如果沒有，點擊「新增或移除範圍」來添加

---

### 3.4 測試使用者

在正式發布之前，確認測試使用者設定：

目前的測試使用者：
- [ ] [列出您的測試用戶電子郵件]

**建議：** 在正式發布前，請至少 2-3 位測試用戶測試完整的登入和同步流程。

---

## ✅ 階段四：提交發布申請

### 4.1 檢查驗證狀態

在提交之前，確認：

- [ ] 所有必填欄位都已填寫
- [ ] 隱私權政策和服務條款可以公開訪問
- [ ] 授權範圍正確設定
- [ ] 應用程式在測試環境運作正常

### 4.2 提交發布

1. 在 **OAuth 同意畫面** 頁面
2. 找到「發布狀態」區段
3. 點擊 **「發布應用程式」** 按鈕
4. 閱讀並確認 Google 的要求
5. 點擊 **「確認」** 提交

### 4.3 審核流程

| 階段 | 預計時間 | 說明 |
|------|---------|------|
| 提交申請 | - | 確認提交成功 |
| Google 審核 | 3-7 天 | Google 團隊人工審核 |
| 審核通過 | - | 收到電子郵件通知 |
| 正式發布 | 立即 | 應用程式可供所有人使用 |

**審核期間：**
- ✅ 測試用戶仍可正常使用
- ✅ 應用程式功能不受影響
- ⚠️ 非測試用戶會看到「未驗證」警告

---

## ✅ 階段五：監控和維護

### 5.1 審核通過後

- [ ] 確認收到 Google 的通過通知電子郵件
- [ ] 登入 Google Cloud Console 確認狀態為「已發布」(In Production)
- [ ] 測試新用戶登入（應該不會看到「未驗證」警告）
- [ ] 監控錯誤日誌

### 5.2 如果審核失敗

Google 可能會要求：
1. 修改隱私權政策內容
2. 提供更多應用程式資訊
3. 解釋為何需要特定的授權範圍
4. 提供應用程式操作影片

**處理方式：**
- 根據 Google 的回饋修改相關文件
- 重新提交審核
- 在審核期間，測試模式仍可繼續使用

---

## 📊 目前狀態檢查

### 完成度總覽

- [x] 隱私權政策已建立
- [x] 服務條款已建立
- [ ] 文件已部署到正式環境
- [ ] Google Cloud Console 資訊已填寫
- [ ] 測試用戶測試完成
- [ ] 提交正式發布申請
- [ ] Google 審核通過

---

## 🔍 常見問題

### Q1: 提交審核後還能修改嗎？

**A:** 可以，但是：
- 修改後可能需要重新審核
- 建議在提交前確保所有資訊正確
- 輕微的文字修改通常不需要重新審核

### Q2: 審核失敗會怎樣？

**A:** 
- 應用程式會退回測試模式
- 測試用戶（最多 100 人）仍可使用
- 可以根據 Google 的回饋修改後重新提交
- 不會影響現有功能

### Q3: 正式發布後能改回測試模式嗎？

**A:** 
- 可以，隨時可以改回
- 改回後會有 100 人的測試用戶限制
- 已登入的用戶可能需要重新授權

### Q4: 需要驗證網域所有權嗎？

**A:** 
- 如果使用自己的網域（如 `nossite.com`），可能需要驗證
- GitHub Pages 網域通常不需要驗證
- 驗證方法：在 Google Search Console 中添加網域

### Q5: 審核需要多久？

**A:** 
- 一般情況：3-7 個工作天
- 複雜情況（如敏感權限）：可能更久
- 可以在 Google Cloud Console 中查看審核狀態

---

## 📞 需要協助？

如果遇到問題：

1. **Google 官方文件**
   - [OAuth 2.0 概述](https://developers.google.com/identity/protocols/oauth2)
   - [驗證應用程式](https://support.google.com/cloud/answer/9110914)

2. **Google Cloud Support**
   - 在 Google Cloud Console 中提交支援請求
   - [Google Cloud 社群論壇](https://www.googlecloudcommunity.com/)

3. **TrickCal 專案**
   - [GitHub Issues](https://github.com/nos/trickcal/issues)

---

## 📝 檢查清單總結

在提交正式發布之前，請確認：

- [ ] ✅ 隱私權政策已建立並可公開訪問
- [ ] ✅ 服務條款已建立並可公開訪問
- [ ] ✅ 應用程式首頁正常運作（HTTPS）
- [ ] ✅ OAuth 同意畫面資訊完整填寫
- [ ] ✅ 授權範圍正確設定
- [ ] ✅ 授權網域已添加
- [ ] ✅ 測試用戶測試完成，無重大問題
- [ ] ✅ 準備好回應 Google 可能的問題

**一切就緒後，點擊「發布應用程式」按鈕！** 🚀

---

**最後更新：** 2025 年 11 月 1 日

