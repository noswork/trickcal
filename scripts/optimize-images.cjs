#!/usr/bin/env node
/**
 * 圖片優化腳本 - 將 PNG 轉換為 WebP 格式
 * 預計可節省 25-35% 的圖片大小
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 需要轉換的目錄
const directories = [
  'public/assets/backgrounds',
  'public/assets/characters',
  'public/assets/gears',
  'public/assets/icons',
];

// 統計信息
let stats = {
  total: 0,
  converted: 0,
  failed: 0,
  originalSize: 0,
  webpSize: 0,
};

/**
 * 遞歸獲取目錄中的所有 PNG 文件
 */
function getAllPngFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  目錄不存在: ${dir}`);
    return files;
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllPngFiles(fullPath));
    } else if (item.toLowerCase().endsWith('.png')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * 轉換單個圖片為 WebP
 */
async function convertToWebP(pngPath) {
  const webpPath = pngPath.replace(/\.png$/i, '.webp');
  
  try {
    // 獲取原始文件大小
    const originalStat = fs.statSync(pngPath);
    stats.originalSize += originalStat.size;
    
    // 轉換為 WebP
    await sharp(pngPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);
    
    // 獲取 WebP 文件大小
    const webpStat = fs.statSync(webpPath);
    stats.webpSize += webpStat.size;
    
    const reduction = ((1 - webpStat.size / originalStat.size) * 100).toFixed(1);
    console.log(`✅ ${path.basename(pngPath)} → ${path.basename(webpPath)} (減少 ${reduction}%)`);
    
    stats.converted++;
  } catch (error) {
    console.error(`❌ 轉換失敗: ${pngPath}`, error.message);
    stats.failed++;
  }
}

/**
 * 主函數
 */
async function main() {
  console.log('🚀 開始圖片優化 - 轉換 PNG 為 WebP\n');
  
  // 收集所有 PNG 文件
  let allPngFiles = [];
  for (const dir of directories) {
    const files = getAllPngFiles(dir);
    console.log(`📁 ${dir}: 找到 ${files.length} 個 PNG 文件`);
    allPngFiles.push(...files);
  }
  
  stats.total = allPngFiles.length;
  console.log(`\n📊 總共找到 ${stats.total} 個 PNG 文件\n`);
  
  if (stats.total === 0) {
    console.log('⚠️  沒有找到需要轉換的文件');
    return;
  }
  
  // 轉換所有圖片
  console.log('🔄 開始轉換...\n');
  for (const pngFile of allPngFiles) {
    await convertToWebP(pngFile);
  }
  
  // 輸出統計
  console.log('\n' + '='.repeat(60));
  console.log('📊 轉換完成統計：');
  console.log('='.repeat(60));
  console.log(`✅ 成功轉換: ${stats.converted} 個文件`);
  console.log(`❌ 失敗: ${stats.failed} 個文件`);
  console.log(`📦 原始大小: ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 WebP 大小: ${(stats.webpSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`💾 節省空間: ${((stats.originalSize - stats.webpSize) / 1024 / 1024).toFixed(2)} MB (${((1 - stats.webpSize / stats.originalSize) * 100).toFixed(1)}%)`);
  console.log('='.repeat(60));
}

// 執行
main().catch(console.error);

