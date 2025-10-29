# Board 樣式統一 - Settings 按鈕與 Mode Switcher

## 📋 變更摘要

將 board 頁面中的 `.btn-icon`（settings 按鈕）樣式與導航欄中的 `.mode-toggle`（主題切換按鈕）統一，提供一致的視覺體驗和交互效果。

## 🎨 修改前後對比

### 修改前的 `.btn-icon` 樣式

```css
.btn-icon {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    /* ... */
}

.btn-icon:hover {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
}
```

**問題：**
- ❌ 使用不透明的背景色 `var(--bg-tertiary)`
- ❌ 使用主題變數邊框 `var(--border-color)`
- ❌ hover 時變成實心的 accent 色
- ❌ 與導航欄的 mode-toggle 樣式不一致

### 修改後的 `.btn-icon` 樣式

```css
.btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.6);
    color: var(--text-primary);
    cursor: var(--cursor-pointer);
    transition: all 0.2s ease;
}

/* 深色模式下的 btn-icon */
body[data-theme="dark"] .btn-icon {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
}

.btn-icon:hover {
    border-color: var(--accent, #ff5f72);
    background: rgba(255, 255, 255, 0.7);
}

body[data-theme="dark"] .btn-icon:hover {
    border-color: var(--accent-dark, #ff8f9f);
    background: rgba(255, 255, 255, 0.18);
}
```

**改進：**
- ✅ 使用半透明背景 `rgba(255, 255, 255, 0.6)`，提供玻璃毛邊效果
- ✅ 使用 rgba 固定值邊框，確保亮暗模式都正確顯示
- ✅ hover 時只改變邊框顏色和背景透明度，不是實心填充
- ✅ 完全匹配 `site.css` 中的 `.mode-toggle` 樣式
- ✅ 明確定義深色模式樣式

## 🎯 統一的視覺效果

### 亮色模式
- **預設狀態：**
  - 背景：`rgba(255, 255, 255, 0.6)` - 半透明白色
  - 邊框：`rgba(0, 0, 0, 0.12)` - 淺灰色
  
- **Hover 狀態：**
  - 背景：`rgba(255, 255, 255, 0.7)` - 稍微更不透明
  - 邊框：`var(--accent, #ff5f72)` - Accent 色

### 深色模式
- **預設狀態：**
  - 背景：`rgba(255, 255, 255, 0.08)` - 非常淺的白色覆蓋
  - 邊框：`rgba(255, 255, 255, 0.2)` - 半透明白色
  
- **Hover 狀態：**
  - 背景：`rgba(255, 255, 255, 0.18)` - 稍微增強的白色覆蓋
  - 邊框：`var(--accent-dark, #ff8f9f)` - 深色模式 Accent 色

## 📝 影響範圍

### 受影響的按鈕
所有使用 `.btn-icon` class 的按鈕，包括：
- Settings 按鈕（設置面板觸發按鈕）
- 其他圖標按鈕

### 與之統一的元素
- 導航欄中的 `.mode-toggle`（主題切換按鈕）
- 導航欄中的 `.page-switcher-toggle`（頁面切換按鈕）
- 導航欄中的 `.language-toggle`（語言選擇按鈕）

## ✅ 設計原則

1. **玻璃毛邊效果（Glassmorphism）：**
   - 使用半透明背景
   - 讓背景圖片可以透過按鈕顯示

2. **一致性（Consistency）：**
   - 所有圖標按鈕使用相同的樣式
   - 亮暗模式都有明確定義

3. **微妙的交互（Subtle Interaction）：**
   - hover 不是完全改變顏色
   - 只是強調邊框和稍微增加不透明度

4. **可訪問性（Accessibility）：**
   - 保持足夠的對比度
   - 清晰的視覺反饋

## 🔍 技術細節

### 為什麼使用 rgba 而不是 CSS 變數？

```css
/* ✅ 好 - 使用固定的 rgba 值 */
border: 1px solid rgba(0, 0, 0, 0.12);

/* ❌ 不好 - 使用主題變數 */
border: 1px solid var(--border-color);
```

**原因：**
1. **一致性**：確保在所有主題下都有相同的透明度效果
2. **玻璃效果**：固定的 rgba 值能確保玻璃毛邊效果正確顯示
3. **可預測性**：不會因為 CSS 變數的改變而影響視覺效果

### 為什麼區分 `--accent` 和 `--accent-dark`？

```css
/* 亮色模式 */
.btn-icon:hover {
    border-color: var(--accent, #ff5f72);
}

/* 深色模式 */
body[data-theme="dark"] .btn-icon:hover {
    border-color: var(--accent-dark, #ff8f9f);
}
```

**原因：**
1. **視覺對比**：深色模式需要更亮的 accent 色才能有足夠對比度
2. **和諧配色**：確保在不同背景下都能和諧搭配
3. **回退值**：提供 fallback 值確保沒有定義變數時也能正常顯示

## 📅 修改日期
2025-10-27

## 🔗 相關檔案
- `board/styles.css` - 主要修改檔案
- `common/site.css` - 參考的統一樣式來源（`.mode-toggle` 定義）

