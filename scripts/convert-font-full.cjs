#!/usr/bin/env node
/**
 * 完整字體轉換腳本 - 將 TTF 轉換為 WOFF2
 * 不進行字體子集化，保留所有字符以支持多語言
 */

const Fontmin = require('fontmin');
const fs = require('fs');
const path = require('path');

// 字體文件路徑
const fontPath = 'clearup/assets/fonts/荆南波波黑-BOLD.ttf';
const outputDir = 'public/assets/fonts/';

// 確保輸出目錄存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🚀 開始完整字體轉換 (TTF → WOFF2)\n');

// 檢查源文件是否存在
if (!fs.existsSync(fontPath)) {
  console.error(`❌ 字體文件不存在: ${fontPath}`);
  process.exit(1);
}

const stats = fs.statSync(fontPath);
const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`📦 原始字體大小: ${fileSizeInMB} MB`);
console.log('🔄 開始轉換為 WOFF2 格式...\n');

// 創建 Fontmin 實例 - 不使用 text() 方法，直接轉換
const fontmin = new Fontmin()
  .src(fontPath)
  .dest(outputDir)
  .use(Fontmin.otf2ttf())
  .use(Fontmin.ttf2woff2());

// 執行轉換
fontmin.run((err, files) => {
  if (err) {
    console.error('❌ 字體轉換失敗:', err);
    process.exit(1);
  }

  console.log('✅ 字體轉換完成！\n');

  // 獲取輸出文件大小
  const outputFile = path.join(outputDir, '荆南波波黑-BOLD.woff2');
  if (fs.existsSync(outputFile)) {
    const outputStats = fs.statSync(outputFile);
    const outputSizeKB = (outputStats.size / 1024).toFixed(2);
    const outputSizeMB = (outputStats.size / (1024 * 1024)).toFixed(2);
    const savings = ((1 - outputStats.size / stats.size) * 100).toFixed(1);

    console.log('============================================================');
    console.log('📊 字體轉換統計：');
    console.log('============================================================');
    console.log(`📦 原始大小: ${fileSizeInMB} MB`);
    console.log(`📦 WOFF2 大小: ${outputSizeMB} MB (${outputSizeKB} KB)`);
    console.log(`💾 節省空間: ${((stats.size - outputStats.size) / (1024 * 1024)).toFixed(2)} MB (${savings}%)`);
    console.log(`📁 輸出文件: ${outputFile}`);
    console.log(`✨ 支持所有語言字符`);
    console.log('============================================================\n');
  }

  console.log('💡 下一步：');
  console.log('1. 字體已轉換為 WOFF2 格式');
  console.log('2. CSS 已配置使用 WOFF2');
  console.log('3. 重新構建項目即可\n');
});

