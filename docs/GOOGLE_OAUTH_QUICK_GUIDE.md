# Google OAuth 正式發布快速指南

## 🎯 目標

將 TrickCal 的 Google OAuth 應用程式從測試模式切換到正式發布，讓所有用戶都能正常登入使用。

---

## ✅ 前置準備（已完成）

- [x] 隱私權政策：https://trickcal.nossite.com/privacy-policy.html
- [x] 服務條款：https://trickcal.nossite.com/terms-of-service.html
- [x] 網站正式上線：https://trickcal.nossite.com

---

## 📝 設定步驟

### **步驟 1：前往 Google Cloud Console**

1. 開啟 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案（TrickCal）
3. 側邊欄點擊：**API 和服務** → **OAuth 同意畫面**

---

### **步驟 2：填寫應用程式資訊**

找到以下欄位並填寫：

#### **應用程式資訊**
```
應用程式名稱：TrickCal
使用者支援電子郵件：[你的 Google 帳號電子郵件]
應用程式標誌：(選填，可跳過)
```

#### **應用程式網域**
```
應用程式首頁：
https://trickcal.nossite.com

隱私權政策：
https://trickcal.nossite.com/privacy-policy.html

服務條款：
https://trickcal.nossite.com/terms-of-service.html
```

#### **授權網域**

點擊「新增網域」，輸入：
```
nossite.com
```

**注意：** 只填入根網域，不要加 `https://` 或 `www.`

---

### **步驟 3：確認授權範圍**

往下捲動到「範圍」區段，確認以下三個範圍存在：

- ✅ `.../auth/userinfo.profile` - 查看您的個人資料
- ✅ `.../auth/userinfo.email` - 查看您的電子郵件地址  
- ✅ `.../auth/drive.file` - 查看和管理本應用程式建立的 Google Drive 檔案

如果沒有看到，點擊「新增或移除範圍」來添加。

---

### **步驟 4：驗證測試用戶**

在「測試使用者」區段：

1. 確認至少有 1-2 位測試用戶
2. 測試用戶應該已經成功測試過登入和同步功能
3. 如果需要，可以點擊「+ 新增使用者」添加更多測試用戶

---

### **步驟 5：儲存變更**

1. 確認所有必填欄位都已填寫
2. 點擊頁面底部的 **「儲存並繼續」** 按鈕
3. 如果有錯誤，根據提示修正

---

### **步驟 6：提交發布申請**

1. 回到 **OAuth 同意畫面** 首頁
2. 找到「發布狀態」區段（應該顯示 🟡 **測試中**）
3. 點擊 **「發布應用程式」** 按鈕
4. 閱讀 Google 的警告和說明
5. 點擊 **「確認」** 提交審核

---

## ⏰ 審核流程

### 提交後會發生什麼？

| 階段 | 時間 | 說明 |
|------|------|------|
| **提交完成** | 立即 | 收到提交確認 |
| **Google 審核** | 3-7 天 | Google 團隊人工審核 |
| **審核結果** | - | 透過電子郵件通知 |
| **正式發布** | 立即 | 所有用戶可使用 |

### 審核期間

- ✅ 測試用戶仍可正常使用
- ✅ 應用程式功能不受影響
- ⚠️ 新用戶登入會看到「未驗證」警告

---

## ✅ 審核通過後

收到 Google 的通過通知後：

1. ✅ 登入 Google Cloud Console 確認狀態變為 🟢 **已發布**
2. ✅ 使用一個全新的 Google 帳號測試登入
3. ✅ 確認不再顯示「未驗證」警告
4. ✅ 測試完整的同步功能

---

## ❌ 如果審核失敗

Google 可能會要求：

1. **修改隱私權政策**
   - 可能需要更詳細的資料使用說明
   - 修改後重新提交

2. **提供更多資訊**
   - 解釋為何需要 Google Drive 權限
   - 說明應用程式如何使用資料

3. **提供操作影片**
   - 錄製登入和同步的操作過程
   - 上傳到 YouTube（可設為不公開）

### 處理方式

1. 根據 Google 的回饋修改相關文件
2. 在 Google Cloud Console 中重新提交
3. 測試模式仍可繼續使用（最多 100 人）

---

## 🔍 檢查部署狀態

### 1. 確認文件已部署

在瀏覽器中訪問以下 URL，確認可以正常顯示：

- ✅ https://trickcal.nossite.com/privacy-policy.html
- ✅ https://trickcal.nossite.com/terms-of-service.html

### 2. 測試登入流程

使用測試帳號測試：
1. 前往 https://trickcal.nossite.com
2. 點擊「Google 登入」
3. 完成授權
4. 確認頭像和同步功能正常

---

## 📞 需要協助？

### Google 官方資源

- [OAuth 2.0 文件](https://developers.google.com/identity/protocols/oauth2)
- [應用程式驗證指南](https://support.google.com/cloud/answer/9110914)
- [Google Cloud Console](https://console.cloud.google.com/)

### TrickCal 支援

- GitHub Issues：https://github.com/nos/trickcal/issues
- 網站：https://trickcal.nossite.com

---

## 💡 常見問題

### Q: 審核需要多久？
A: 通常 3-7 個工作天，複雜情況可能更久。

### Q: 審核期間用戶能用嗎？
A: 測試用戶（最多 100 人）可以正常使用，新用戶會看到警告。

### Q: 通過後還能修改嗎？
A: 可以，但重大修改可能需要重新審核。

### Q: 失敗會怎樣？
A: 退回測試模式，可以修改後重新提交，不影響現有功能。

### Q: 能改回測試模式嗎？
A: 可以隨時改回，但會有 100 人限制。

---

## 🎉 完成後

恭喜！你的應用程式現在可以供所有人使用了！

**記得：**
- 監控用戶登入情況
- 定期更新隱私權政策（如有變更）
- 關注 Google API 的更新通知
- 備份重要的 OAuth 設定

---

**祝你申請順利！** 🚀

如有任何問題，歡迎在 [GitHub Issues](https://github.com/nos/trickcal/issues) 提出。

