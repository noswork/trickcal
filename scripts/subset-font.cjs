#!/usr/bin/env node
/**
 * 字體子集化腳本 - 只保留網站使用的字符
 * 預計可將 5MB 字體縮減至 500KB-1MB
 */

const Fontmin = require('fontmin');
const fs = require('fs');
const path = require('path');

// 字體文件路徑
const fontPath = 'public/assets/fonts/荆南波波黑-BOLD.ttf';
const outputDir = 'public/assets/fonts/subset/';

// 網站使用的文字集合（從數據文件和界面文本中提取）
const websiteText = `
  金蠟筆記錄本 掃蕩工具 Trickcal
  層級選擇 統計資訊 設置 首頁 看板 掃蕩
  第一層 第二層 第三層
  攻擊 暴擊 生命 抗暴 防禦
  已激活 總數 擁有 未擁有
  冷靜 狂亂 天真 活潑 憂鬱
  物理 魔法 前排 中排 後排
  五星 四星 三星 二星 一星
  素材圖鑑 方案 搜索 清除選擇 頁
  關卡 體力 已選擇 未找到
  Alice Allet Amelia Arco Arnet Ashur Aya Bana Barie Barong
  Belita Beni BigWood Blanchet Butter Canna Canta Carren Chloe Chopi
  Daya Diana Ed Eisia Elena Epica Erpin Espi Festa Fricle
  Gabia Guin Haley Hilde Ifrit Jade Joanne Jubee Kathy Kidian
  Kommy Kyarot Kyuri Laika Layze Leets Lethe Levi Lion Maestro
  Mago Maison Makasha Marie Mayo Meluna Momo Mynx Naia Ner
  Neti Opal Orr Patula Picora Pira Polan Posher Ran Renewa
  Ricota Rim Risty Rohne Rollett Rudd Rufo Sari Selline Shadi
  Shasha Sherum Shoupan Silphir Sist Snorky Speaki Suro Sylla Taida
  Tig Ui Vela Velvet Veroo Vivi Xion Yomi Yumimi
  星 級 性格 攻擊類型 部署位置
  關閉 確認 取消 保存 重置
  語言 繁體中文 简体中文 English 日本語
  明亮 深色 主題
  導出 導入 數據 進度
  0123456789
  ，。、！？；：「」『』（）【】
  ～－＋×÷＝＜＞％＄＃＠＆
  abcdefghijklmnopqrstuvwxyz
  ABCDEFGHIJKLMNOPQRSTUVWXYZ
`;

// 從數據文件中提取角色名稱等
function extractTextFromDataFiles() {
  const dataFiles = [
    'public/board/data.json',
    'public/sweep/data.json',
  ];
  
  let extractedText = websiteText;
  
  for (const file of dataFiles) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const data = JSON.parse(content);
        
        // 提取所有字符串值
        const jsonText = JSON.stringify(data, null, 2);
        extractedText += '\n' + jsonText;
      } catch (error) {
        console.warn(`⚠️  無法讀取文件: ${file}`);
      }
    }
  }
  
  return extractedText;
}

// 獲取唯一字符
function getUniqueCharacters(text) {
  // 移除英文字母和數字（使用系統字體）
  const chars = new Set(text.split(''));
  
  // 只保留中文字符和特殊符號
  const chineseAndSymbols = Array.from(chars).filter(char => {
    const code = char.charCodeAt(0);
    // 中文字符範圍 + 常用標點
    return (code >= 0x4E00 && code <= 0x9FFF) || // CJK 統一漢字
           (code >= 0x3000 && code <= 0x303F) || // CJK 符號和標點
           (code >= 0xFF00 && code <= 0xFFEF);   // 全形字符
  });
  
  return chineseAndSymbols.join('');
}

/**
 * 主函數
 */
async function main() {
  console.log('🚀 開始字體子集化\n');
  
  // 檢查字體文件
  if (!fs.existsSync(fontPath)) {
    console.error(`❌ 字體文件不存在: ${fontPath}`);
    return;
  }
  
  // 獲取原始文件大小
  const originalStat = fs.statSync(fontPath);
  console.log(`📦 原始字體大小: ${(originalStat.size / 1024 / 1024).toFixed(2)} MB`);
  
  // 提取網站使用的文字
  console.log('📝 提取網站使用的文字...');
  const fullText = extractTextFromDataFiles();
  const uniqueChars = getUniqueCharacters(fullText);
  console.log(`📊 找到 ${uniqueChars.length} 個唯一字符\n`);
  
  // 創建輸出目錄
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 配置 fontmin
  const fontmin = new Fontmin()
    .src(fontPath)
    .use(Fontmin.glyph({
      text: uniqueChars,
      hinting: false // 移除 hinting 以減小文件大小
    }))
    .use(Fontmin.ttf2woff2()) // 轉換為 WOFF2 格式（最佳壓縮）
    .dest(outputDir);
  
  // 執行轉換
  console.log('🔄 開始字體子集化和壓縮...\n');
  
  fontmin.run((err, files) => {
    if (err) {
      console.error('❌ 字體處理失敗:', err);
      return;
    }
    
    console.log('✅ 字體處理完成！\n');
    
    // 統計結果
    files.forEach(file => {
      if (file.path.endsWith('.woff2')) {
        const subsetSize = file.contents.length;
        const reduction = ((1 - subsetSize / originalStat.size) * 100).toFixed(1);
        
        console.log('='.repeat(60));
        console.log('📊 字體優化統計：');
        console.log('='.repeat(60));
        console.log(`📦 原始大小: ${(originalStat.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📦 子集大小: ${(subsetSize / 1024).toFixed(2)} KB`);
        console.log(`💾 節省空間: ${((originalStat.size - subsetSize) / 1024 / 1024).toFixed(2)} MB (${reduction}%)`);
        console.log(`📁 輸出文件: ${outputDir}${path.basename(file.path)}`);
        console.log('='.repeat(60));
        
        console.log('\n💡 下一步：');
        console.log('1. 更新 src/styles/main.css 中的字體引用');
        console.log('2. 將 .ttf 改為 .woff2 格式');
        console.log('3. 重新構建項目');
      }
    });
  });
}

// 執行
main().catch(console.error);

