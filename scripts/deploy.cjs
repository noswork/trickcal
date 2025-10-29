#!/usr/bin/env node
/**
 * Trickcal 部署管理工具
 * 提供簡單的互動式界面來管理 Git 操作和部署
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, silent = false) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve);
  });
}

async function showMenu() {
  console.clear();
  log('\n╔════════════════════════════════════════════╗', 'bright');
  log('║     🚀 Trickcal 部署管理工具 v1.0       ║', 'bright');
  log('╚════════════════════════════════════════════╝\n', 'bright');
  
  log('請選擇操作：\n', 'yellow');
  log('  1. 📊 查看當前狀態', 'cyan');
  log('  2. ➕ 添加並提交更改', 'cyan');
  log('  3. 🚀 推送到 GitHub', 'cyan');
  log('  4. 🔨 構建項目', 'cyan');
  log('  5. 🎯 快速部署 (構建 + 提交 + 推送)', 'green');
  log('  6. 📜 查看提交歷史', 'cyan');
  log('  7. ↩️  撤銷最後一次提交', 'yellow');
  log('  8. 🗑️  刪除遠程分支', 'red');
  log('  9. ℹ️  查看幫助', 'cyan');
  log('  0. 👋 退出\n', 'magenta');
  
  const choice = await question('請輸入選項 (0-9): ');
  return choice.trim();
}

async function showStatus() {
  log('\n📊 Git 狀態：\n', 'bright');
  execCommand('git status --short');
  log('\n📌 當前分支：', 'bright');
  execCommand('git branch --show-current');
  await question('\n按 Enter 繼續...');
}

async function commitChanges() {
  log('\n➕ 添加並提交更改\n', 'bright');
  
  // 顯示當前更改
  log('📝 當前更改：\n', 'yellow');
  execCommand('git status --short');
  
  const addAll = await question('\n是否添加所有更改？(Y/n): ');
  if (addAll.toLowerCase() !== 'n') {
    log('\n📦 添加所有更改...', 'cyan');
    const result = execCommand('git add -A', true);
    if (result.success) {
      log('✅ 已添加所有更改', 'green');
    } else {
      log('❌ 添加失敗', 'red');
      await question('\n按 Enter 繼續...');
      return;
    }
  }
  
  const message = await question('\n💬 請輸入提交信息: ');
  if (!message.trim()) {
    log('❌ 提交信息不能為空', 'red');
    await question('\n按 Enter 繼續...');
    return;
  }
  
  log('\n📝 正在提交...', 'cyan');
  const result = execCommand(`git commit -m "${message}"`, true);
  
  if (result.success) {
    log('✅ 提交成功！', 'green');
  } else {
    log('❌ 提交失敗', 'red');
  }
  
  await question('\n按 Enter 繼續...');
}

async function pushToGitHub() {
  log('\n🚀 推送到 GitHub\n', 'bright');
  
  const branch = execCommand('git branch --show-current', true).output.trim();
  log(`📌 當前分支: ${branch}\n`, 'yellow');
  
  const confirm = await question(`確認推送到 origin/${branch}？(Y/n): `);
  if (confirm.toLowerCase() === 'n') {
    log('❌ 已取消推送', 'yellow');
    await question('\n按 Enter 繼續...');
    return;
  }
  
  log('\n🚀 正在推送...', 'cyan');
  const result = execCommand(`git push origin ${branch}`);
  
  if (result.success) {
    log('\n✅ 推送成功！', 'green');
    log('🌐 GitHub Actions 將自動部署', 'cyan');
    log('⏱️  預計 2-3 分鐘後生效\n', 'cyan');
  } else {
    log('\n❌ 推送失敗', 'red');
  }
  
  await question('\n按 Enter 繼續...');
}

async function buildProject() {
  log('\n🔨 構建項目\n', 'bright');
  
  const confirm = await question('確認開始構建？這可能需要幾秒鐘 (Y/n): ');
  if (confirm.toLowerCase() === 'n') {
    log('❌ 已取消構建', 'yellow');
    await question('\n按 Enter 繼續...');
    return;
  }
  
  log('\n🔨 正在構建...', 'cyan');
  const result = execCommand('npm run build');
  
  if (result.success) {
    log('\n✅ 構建成功！', 'green');
  } else {
    log('\n❌ 構建失敗', 'red');
  }
  
  await question('\n按 Enter 繼續...');
}

async function quickDeploy() {
  log('\n🎯 快速部署\n', 'bright');
  log('這將執行以下步驟：', 'yellow');
  log('  1. 構建項目', 'cyan');
  log('  2. 添加所有更改', 'cyan');
  log('  3. 提交更改', 'cyan');
  log('  4. 推送到 GitHub\n', 'cyan');
  
  const confirm = await question('確認開始快速部署？(Y/n): ');
  if (confirm.toLowerCase() === 'n') {
    log('❌ 已取消部署', 'yellow');
    await question('\n按 Enter 繼續...');
    return;
  }
  
  // 步驟 1: 構建
  log('\n🔨 [1/4] 構建項目...', 'cyan');
  let result = execCommand('npm run build');
  if (!result.success) {
    log('❌ 構建失敗，已停止部署', 'red');
    await question('\n按 Enter 繼續...');
    return;
  }
  log('✅ 構建完成', 'green');
  
  // 步驟 2: 添加更改
  log('\n📦 [2/4] 添加更改...', 'cyan');
  execCommand('git add -A', true);
  log('✅ 已添加所有更改', 'green');
  
  // 步驟 3: 提交
  const message = await question('\n💬 請輸入提交信息: ');
  if (!message.trim()) {
    log('❌ 提交信息不能為空，已停止部署', 'red');
    await question('\n按 Enter 繼續...');
    return;
  }
  
  log('\n📝 [3/4] 提交更改...', 'cyan');
  result = execCommand(`git commit -m "${message}"`, true);
  if (!result.success) {
    log('⚠️  沒有新的更改需要提交', 'yellow');
  } else {
    log('✅ 提交完成', 'green');
  }
  
  // 步驟 4: 推送
  const branch = execCommand('git branch --show-current', true).output.trim();
  log(`\n🚀 [4/4] 推送到 origin/${branch}...`, 'cyan');
  result = execCommand(`git push origin ${branch}`);
  
  if (result.success) {
    log('\n🎉 快速部署完成！', 'green');
    log('🌐 GitHub Actions 正在自動部署', 'cyan');
    log('⏱️  預計 2-3 分鐘後生效', 'cyan');
    log('🔗 https://noswork.github.io/trickcal/\n', 'blue');
  } else {
    log('\n❌ 推送失敗', 'red');
  }
  
  await question('\n按 Enter 繼續...');
}

async function showHistory() {
  log('\n📜 最近 10 次提交歷史：\n', 'bright');
  execCommand('git log --oneline --graph --decorate -10');
  await question('\n按 Enter 繼續...');
}

async function undoLastCommit() {
  log('\n↩️  撤銷最後一次提交\n', 'bright');
  
  log('⚠️  注意：這將撤銷最後一次提交，但保留更改', 'yellow');
  log('💡 更改將回到暫存區，可以重新提交\n', 'cyan');
  
  const confirm = await question('確認撤銷最後一次提交？(y/N): ');
  if (confirm.toLowerCase() !== 'y') {
    log('❌ 已取消操作', 'yellow');
    await question('\n按 Enter 繼續...');
    return;
  }
  
  log('\n↩️  正在撤銷...', 'cyan');
  const result = execCommand('git reset --soft HEAD~1', true);
  
  if (result.success) {
    log('✅ 已撤銷最後一次提交', 'green');
    log('📝 更改已保留在暫存區', 'cyan');
  } else {
    log('❌ 撤銷失敗', 'red');
  }
  
  await question('\n按 Enter 繼續...');
}

async function deleteBranch() {
  log('\n🗑️  刪除遠程分支\n', 'bright');
  
  log('⚠️  警告：這是危險操作！', 'red');
  log('💡 請確保你知道你在做什麼\n', 'yellow');
  
  const branchName = await question('請輸入要刪除的遠程分支名稱: ');
  if (!branchName.trim()) {
    log('❌ 分支名稱不能為空', 'red');
    await question('\n按 Enter 繼續...');
    return;
  }
  
  const confirm = await question(`\n⚠️  確認刪除遠程分支 "${branchName}"？(y/N): `);
  if (confirm.toLowerCase() !== 'y') {
    log('❌ 已取消刪除', 'yellow');
    await question('\n按 Enter 繼續...');
    return;
  }
  
  log('\n🗑️  正在刪除...', 'cyan');
  const result = execCommand(`git push origin --delete ${branchName}`);
  
  if (result.success) {
    log(`\n✅ 已刪除遠程分支 "${branchName}"`, 'green');
  } else {
    log('\n❌ 刪除失敗', 'red');
  }
  
  await question('\n按 Enter 繼續...');
}

async function showHelp() {
  console.clear();
  log('\n╔════════════════════════════════════════════╗', 'bright');
  log('║        📖 使用說明                        ║', 'bright');
  log('╚════════════════════════════════════════════╝\n', 'bright');
  
  log('🎯 快速開始：', 'yellow');
  log('  1. 選擇 "5" 快速部署，一鍵完成所有操作\n', 'cyan');
  
  log('📝 常用操作：', 'yellow');
  log('  • 修改代碼後想要部署：', 'cyan');
  log('    選擇 5 → 輸入提交信息 → 完成！\n', 'green');
  
  log('  • 只想查看狀態：', 'cyan');
  log('    選擇 1 → 查看當前更改\n', 'green');
  
  log('  • 分步操作：', 'cyan');
  log('    選擇 4 (構建) → 2 (提交) → 3 (推送)\n', 'green');
  
  log('⚠️  注意事項：', 'yellow');
  log('  • 提交前請確認更改內容', 'cyan');
  log('  • 推送後 GitHub Actions 會自動部署', 'cyan');
  log('  • 部署需要 2-3 分鐘生效', 'cyan');
  log('  • 危險操作會有二次確認\n', 'cyan');
  
  log('💡 小技巧：', 'yellow');
  log('  • 提交信息建議使用 emoji 前綴', 'cyan');
  log('    🎨 UI改進  ✨ 新功能  🐛 修復  📝 文檔', 'cyan');
  log('  • 可以隨時按 Ctrl+C 退出程式\n', 'cyan');
  
  log('🔗 相關連結：', 'yellow');
  log('  • 網站：https://noswork.github.io/trickcal/', 'blue');
  log('  • Actions：https://github.com/noswork/trickcal/actions\n', 'blue');
  
  await question('按 Enter 返回主選單...');
}

async function main() {
  while (true) {
    const choice = await showMenu();
    
    switch (choice) {
      case '1':
        await showStatus();
        break;
      case '2':
        await commitChanges();
        break;
      case '3':
        await pushToGitHub();
        break;
      case '4':
        await buildProject();
        break;
      case '5':
        await quickDeploy();
        break;
      case '6':
        await showHistory();
        break;
      case '7':
        await undoLastCommit();
        break;
      case '8':
        await deleteBranch();
        break;
      case '9':
        await showHelp();
        break;
      case '0':
        log('\n👋 再見！', 'green');
        rl.close();
        process.exit(0);
        break;
      default:
        log('\n❌ 無效選項，請重新選擇', 'red');
        await question('按 Enter 繼續...');
    }
  }
}

// 啟動程式
log('\n🚀 正在啟動 Trickcal 部署管理工具...', 'cyan');
setTimeout(() => {
  main().catch(error => {
    log(`\n❌ 發生錯誤: ${error.message}`, 'red');
    rl.close();
    process.exit(1);
  });
}, 500);

