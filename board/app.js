const translate = (key, def) => window.TrickcalCommon?.translate?.(key, def) ?? def ?? key;

// 全局狀態
let gameData = null;
let userProgress = {
    ownedCharacters: new Set(),
    activatedCells: {}
};
let currentLayer = 'layer1';
let currentCellType = 'attack'; // 當前顯示的格子類型
// 設置面板的排序配置
let sortConfig = {
    field: 'default',  // 排序字段
    order: 'asc'       // 排序順序：'asc' 升序, 'desc' 降序
};
// Board grid 的排序配置
let boardSortConfig = {
    field: 'default',
    order: 'asc'
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化語言系統
    if (typeof i18n !== 'undefined') {
        await i18n.init();
        // 立即更新頁面靜態文字（標題、導航等）
        updatePageLanguage();
        // 監聽語言切換事件
        window.addEventListener('languageChanged', () => {
            updatePageLanguage();
        });
    }
    
    await loadGameData();
    loadUserProgress();
    initializeEventListeners();
    renderBoard();
    updateLayerSummary();
    renderInsightPanels();
    
    // 數據載入完成後，再次更新頁面語言以包含動態內容
    if (typeof i18n !== 'undefined') {
        updatePageLanguage();
    }
    
    // 通用 nav 注入後無需控制原 navbar 顯示
    
    // 監聽跨頁面的 localStorage 變化（從編輯器觸發）
    window.addEventListener('storage', async (e) => {
        // 當 trickcal_board_data_timestamp 改變時，表示編輯器更新了數據
        if (e.key === 'trickcal_board_data_timestamp') {
            console.log('檢測到編輯器數據更新，正在重新載入...');
            await loadGameData();
            updateAllData();
        }
    });
    
    // 定期檢查 data.json 是否有更新（每30秒檢查一次）
    setInterval(async () => {
        try {
            const response = await fetch('data.json');
            const latestData = await response.json();
            const currentCharCount = gameData.characters ? gameData.characters.length : 0;
            const latestCharCount = latestData.characters ? latestData.characters.length : 0;
            
            // 如果角色數量有變化，重新載入數據
            if (latestCharCount !== currentCharCount) {
                console.log('檢測到 data.json 更新，正在重新載入...');
                await loadGameData();
                updateAllData();
            }
        } catch (error) {
            // 靜默處理錯誤，避免影響用戶體驗
            console.debug('檢查數據更新時發生錯誤:', error);
        }
    }, 30000); // 30秒檢查一次
});

// 載入遊戲數據
async function loadGameData() {
    let loadingId;
    try {
        // 顯示載入指示器
        if (typeof window.TrickcalNotification !== 'undefined') {
            const message = translate('loading.data', '載入遊戲數據...');
            loadingId = window.TrickcalNotification.showLoading(message);
        }
        
        // 先從 data.json 讀取最新數據
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const latestData = await response.json();
        
        // 檢查 localStorage 中的數據版本
        const savedData = localStorage.getItem('trickcal_board_data');
        const savedTimestamp = localStorage.getItem('trickcal_board_data_timestamp');
        
        if (savedData && savedTimestamp) {
            try {
                const localData = JSON.parse(savedData);
                const localTimestamp = parseInt(savedTimestamp);
                
                // 比較數據版本（使用角色數量作為簡單的版本檢查）
                const localCharCount = localData.characters ? localData.characters.length : 0;
                const latestCharCount = latestData.characters ? latestData.characters.length : 0;
                
                // 如果本地數據與最新數據相同，使用本地數據（保留用戶進度）
                if (localCharCount === latestCharCount && 
                    JSON.stringify(localData.characters) === JSON.stringify(latestData.characters)) {
                    gameData = localData;
                    console.log('使用 localStorage 中的數據（版本一致）');
                    
                    // 隱藏載入指示器
                    if (loadingId && typeof window.TrickcalNotification !== 'undefined') {
                        window.TrickcalNotification.hideLoading(loadingId);
                    }
                    
                    return;
                }
            } catch (error) {
                console.error('解析 localStorage 數據失敗:', error);
            }
        }
        
        // 使用最新的 data.json 數據，但保留用戶進度
        gameData = latestData;
        normalizeAssetPaths(gameData);
        console.log('從 data.json 載入最新數據');
        
        // 智能合併用戶進度：保留現有用戶進度，但清理已刪除角色的進度
        if (savedData) {
            try {
                const localData = JSON.parse(savedData);
                const currentCharNames = new Set(latestData.characters.map(char => char.name));
                
                // 清理已刪除角色的用戶進度
                const validOwnedChars = Array.from(userProgress.ownedCharacters).filter(name => 
                    currentCharNames.has(name)
                );
                userProgress.ownedCharacters = new Set(validOwnedChars);
                
                // 清理已刪除角色的啟動格子
                const validActivatedCells = {};
                Object.keys(userProgress.activatedCells).forEach(key => {
                    const [charName] = key.split('_');
                    if (currentCharNames.has(charName)) {
                        validActivatedCells[key] = userProgress.activatedCells[key];
                    }
                });
                userProgress.activatedCells = validActivatedCells;
                
                // 保存清理後的用戶進度
                saveUserProgress();
                
                console.log('已清理無效的用戶進度數據');
            } catch (error) {
                console.error('合併用戶進度時發生錯誤:', error);
            }
        }
        
        // 保存到 localStorage 並更新時間戳
        localStorage.setItem('trickcal_board_data', JSON.stringify(gameData));
        localStorage.setItem('trickcal_board_data_timestamp', Date.now().toString());
        
        // 隱藏載入指示器
        if (loadingId && typeof window.TrickcalNotification !== 'undefined') {
            window.TrickcalNotification.hideLoading(loadingId);
        }
        
    } catch (error) {
        console.error('載入 data.json 失敗:', error);
        
        // 隱藏載入指示器
        if (loadingId && typeof window.TrickcalNotification !== 'undefined') {
            window.TrickcalNotification.hideLoading(loadingId);
        }
        
        // 如果 data.json 載入失敗，嘗試從 localStorage 讀取
        const savedData = localStorage.getItem('trickcal_board_data');
        if (savedData) {
            try {
                gameData = JSON.parse(savedData);
                normalizeAssetPaths(gameData);
                console.log('從 localStorage 載入備用數據');
                
                // 顯示警告通知
                if (typeof window.TrickcalNotification !== 'undefined') {
                    window.TrickcalNotification.warning(
                        translate('errors.usingCachedData', '無法載入最新數據，正在使用緩存資料'),
                        translate('warning', '警告')
                    );
                }
                return;
            } catch (parseError) {
                console.error('解析 localStorage 數據失敗:', parseError);
            }
        }
        
        // 最後的備用方案
        gameData = createDefaultData();
        
        // 顯示錯誤通知
        if (typeof window.TrickcalNotification !== 'undefined') {
            window.TrickcalNotification.error(
                typeof i18n !== 'undefined' 
                    ? i18n.t('errors.loadFailed') 
                    : '載入數據失敗，請檢查網絡連接後重試',
                typeof i18n !== 'undefined' ? i18n.t('error') : '錯誤'
            );
        }
    }
}

// 將 data.json 或 localStorage 中的資源路徑正規化到 ../assets 前綴（適用於 board 子頁）
function normalizeAssetPaths(data) {
    const prefix = '../assets/';
    const fix = (p) => {
        if (!p || typeof p !== 'string') return p;
        if (p.startsWith('../assets/')) return p;
        if (p.startsWith('assets/')) return p.replace(/^assets\//, prefix);
        if (p.startsWith('/assets/')) return p.replace(/^\/assets\//, prefix);
        return p;
    };

    if (data.boardConfig) {
        Object.values(data.boardConfig).forEach(cfg => {
            if (cfg && cfg.background) cfg.background = fix(cfg.background);
        });
    }
    if (data.cellTypes) {
        Object.values(data.cellTypes).forEach(ct => {
            if (ct && ct.icon) ct.icon = fix(ct.icon);
        });
    }
    if (data.personalities) {
        Object.values(data.personalities).forEach(p => {
            if (p && p.icon) p.icon = fix(p.icon);
        });
    }
    if (data.attackTypes) {
        Object.values(data.attackTypes).forEach(a => {
            if (a && a.icon) a.icon = fix(a.icon);
        });
    }
    if (data.deployRows) {
        Object.values(data.deployRows).forEach(d => {
            if (d && d.icon) d.icon = fix(d.icon);
        });
    }
}

// 創建默認數據
function createDefaultData() {
    return {
        characters: [],
        boardConfig: {
            layer1: { name: "第一層", bonusPerCell: 3, background: null },
            layer2: { name: "第二層", bonusPerCell: 4, background: "../assets/icons/board_base_2.png" },
            layer3: { name: "第三層", bonusPerCell: 5, background: "../assets/icons/board_base_3.png" }
        },
        cellTypes: {
            attack: { name: "攻擊力", color: "#ff6b6b", icon: "../assets/icons/board_atk.png" },
            crit: { name: "暴擊", color: "#fab005", icon: "../assets/icons/board_crit.png" },
            hp: { name: "HP", color: "#ff8787", icon: "../assets/icons/board_hp.png" },
            critResist: { name: "暴擊抵抗", color: "#74c0fc", icon: "../assets/icons/board_critResist.png" },
            defense: { name: "防禦力", color: "#da77f2", icon: "../assets/icons/board_def.png" }
        },
        personalities: {
            "天真": { icon: "../assets/icons/unit_personality_naive.png" },
            "冷靜": { icon: "../assets/icons/unit_personality_cool.png" },
            "狂亂": { icon: "../assets/icons/unit_personality_mad.png" },
            "活潑": { icon: "../assets/icons/unit_personality_jolly.png" },
            "憂鬱": { icon: "../assets/icons/unit_personality_gloomy.png" }
        },
        races: ["龍族", "精靈", "妖精", "獸人", "幽靈", "魔靈", "魔女", "???"],
        attackTypes: {
            "魔法": { icon: "../assets/icons/unit_attack_magic.png" },
            "物理": { icon: "../assets/icons/unit_attack_physic.png" }
        },
        deployRows: {
            "前排": { icon: "../assets/icons/unit_position_front.png" },
            "中排": { icon: "../assets/icons/unit_position_middle.png" },
            "後排": { icon: "../assets/icons/unit_position_back.png" }
        },
        roles: ["輸出", "肉盾", "輔助"]
    };
}

// 載入用戶進度
function loadUserProgress() {
    const saved = localStorage.getItem('trickcal_board_progress');
    if (saved) {
        const data = JSON.parse(saved);
        userProgress.ownedCharacters = new Set(data.ownedCharacters || []);
        userProgress.activatedCells = data.activatedCells || {};
    }
}

// 保存用戶進度
function saveUserProgress() {
    const data = {
        ownedCharacters: Array.from(userProgress.ownedCharacters),
        activatedCells: userProgress.activatedCells
    };
    localStorage.setItem('trickcal_board_progress', JSON.stringify(data));
}

// 初始化事件監聽器
function initializeEventListeners() {
    // 主題切換由 common/site.js 統一處理，此處不再綁定
    
    // 設置面板
    const openSettings = () => {
        document.getElementById('settingsPanel').classList.add('active');
        renderSettingsCharacters();
    };
    const settingsBtnEl = document.getElementById('settingsBtn');
    if (settingsBtnEl) settingsBtnEl.addEventListener('click', openSettings);
    const manageCharactersBtn = document.getElementById('manageCharactersBtn');
    if (manageCharactersBtn) {
        manageCharactersBtn.addEventListener('click', openSettings);
    }
    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
        document.getElementById('settingsPanel').classList.remove('active');
    });
    
    // 設定面板的排序控制
    const sortSelect = document.getElementById('sortSelect');
    const sortOrderBtn = document.getElementById('sortOrderBtn');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortConfig.field = e.target.value;
            renderSettingsCharacters();
        });
    }
    
    if (sortOrderBtn) {
        sortOrderBtn.addEventListener('click', () => {
            sortConfig.order = sortConfig.order === 'asc' ? 'desc' : 'asc';
            sortOrderBtn.classList.toggle('desc');
            // 更新 title
            const isDesc = sortOrderBtn.classList.contains('desc');
            if (typeof i18n !== 'undefined') {
                sortOrderBtn.title = i18n.t(isDesc ? 'settings.sortOrderDesc' : 'settings.sortOrderAsc');
            }
            renderSettingsCharacters();
        });
    }
    
    // Board 頁面的自訂排序控制
    initBoardSortControls();
    
    // 層級標籤
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentLayer = e.target.dataset.layer;
            // 切換層級時更新所有相關數據
            renderBoard();
            updateLayerSummary();
            renderInsightPanels();
        });
    });
    
    // 分頁按鈕
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCellType = e.target.dataset.cellType;
            // 切換格子類型時只需更新棋盤
            renderBoard();
        });
    });
    
    // 重置
    document.getElementById('resetAllBtn').addEventListener('click', () => {
        const t = (key) => typeof i18n !== 'undefined' ? i18n.t(key) : key;
        if (confirm(t('settings.confirmReset'))) {
            userProgress.ownedCharacters.clear();
            userProgress.activatedCells = {};
            saveUserProgress();
            // 同步更新所有相關數據
            updateAllData();
        }
    });
    
    
    // 返回按鈕（可選）
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }
}

// 初始化 Board 頁面的自訂排序控制
function initBoardSortControls() {
    const boardSortSelect = document.getElementById('boardSortSelect');
    const boardSortOrderBtn = document.getElementById('boardSortOrderBtn');
    
    if (!boardSortSelect || !boardSortOrderBtn) return;
    
    // 自訂下拉選單邏輯
    const selectTrigger = boardSortSelect.querySelector('.select-trigger');
    const selectOptions = boardSortSelect.querySelector('.select-options');
    const selectLabel = boardSortSelect.querySelector('.select-label');
    const options = boardSortSelect.querySelectorAll('.select-option');
    
    // 設置當前值
    const currentOption = boardSortSelect.querySelector(`[data-value="${boardSortConfig.field}"]`);
    if (currentOption) {
        options.forEach(opt => opt.classList.remove('active'));
        currentOption.classList.add('active');
        selectLabel.textContent = currentOption.querySelector('span').textContent;
    }
    
    // 點擊觸發器開關下拉選單
    selectTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        boardSortSelect.classList.toggle('open');
    });
    
    // 點擊選項
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = option.getAttribute('data-value');
            
            // 更新 UI
            options.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectLabel.textContent = option.querySelector('span').textContent;
            
            // 更新配置並重新渲染
            boardSortConfig.field = value;
            boardSortSelect.classList.remove('open');
            renderBoard();
        });
    });
    
    // 點擊外部關閉下拉選單
    document.addEventListener('click', (e) => {
        if (!boardSortSelect.contains(e.target)) {
            boardSortSelect.classList.remove('open');
        }
    });
    
    // 排序方向按鈕
    // 設置當前狀態
    if (boardSortConfig.order === 'desc') {
        boardSortOrderBtn.classList.add('desc');
    }
    
    boardSortOrderBtn.addEventListener('click', () => {
        boardSortConfig.order = boardSortConfig.order === 'asc' ? 'desc' : 'asc';
        boardSortOrderBtn.classList.toggle('desc');
        // 更新 title
        const isDesc = boardSortOrderBtn.classList.contains('desc');
        if (typeof i18n !== 'undefined') {
            boardSortOrderBtn.title = i18n.t(isDesc ? 'settings.sortOrderDesc' : 'settings.sortOrderAsc');
        }
        renderBoard();
    });
}

// 主題切換和載入由 common/site.js 統一處理

// 渲染棋盤
function renderBoard() {
    const container = document.getElementById('boardContent');
    if (!container) return;
    
    // 保存當前滾動位置（角色列表）
    const charGrid = document.querySelector('.character-grid');
    const scrollPosition = charGrid ? charGrid.scrollTop : 0;
    
    container.innerHTML = '';
    
    const t = (key) => (typeof i18n !== 'undefined' ? i18n.t(key) : translate(key));
    
    if (!gameData || !gameData.cellTypes) {
        container.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">${t('errors.noData')}</p>`;
        return;
    }
    
    // 只顯示當前選中的格子類型
    const cellInfo = gameData.cellTypes[currentCellType];
    if (!cellInfo) {
        container.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">${t('errors.noCellType')}</p>`;
        return;
    }
    
    const category = createCellCategory(currentCellType, cellInfo);
    container.appendChild(category);
    
    // 恢復滾動位置（角色列表）
    if (scrollPosition > 0) {
        requestAnimationFrame(() => {
            const newCharGrid = document.querySelector('.character-grid');
            if (newCharGrid) {
                newCharGrid.scrollTop = scrollPosition;
            }
        });
    }
}

// 創建格子分類
function createCellCategory(cellType, cellInfo) {
    // 定義翻譯函數（必須在最前面）
    const translate = (key, def) => window.TrickcalCommon?.translate?.(key, def) ?? def ?? key;
    const t = (key) => (typeof i18n !== 'undefined' ? i18n.t(key) : translate(key));
    
    const section = document.createElement('div');
    section.className = 'cell-category';
    
    // 計算統計數據
    const stats = calculateCellStats(cellType);
    
    // 標題區
    const header = document.createElement('div');
    header.className = 'cell-header';
    
    // 取得金蠟筆需求和加成數值
    const cost = cellInfo.costPerLayer ? cellInfo.costPerLayer[currentLayer] : 0;
    const bonus = gameData.boardConfig[currentLayer].bonusPerCell;
    
    header.innerHTML = `
        <div class="cell-title">
            <div class="cell-icon ${cellType}">
                <img src="${cellInfo.icon}" alt="${t(`cellTypes.${cellType}`)}" onerror="this.style.display='none'">
            </div>
            <div>
                <h3>${t(`cellTypes.${cellType}`)}</h3>
                <span class="cell-total">${t(`layers.${currentLayer}`)}</span>
            </div>
        </div>
        <div class="cell-stats">
            <div class="cell-count">${stats.activated} / ${stats.total}</div>
            <div class="cell-sub">${t('panel.activated')}</div>
        </div>
    `;
    section.appendChild(header);
    
    // 角色網格
    const grid = document.createElement('div');
    grid.className = 'character-grid';
    
    let characters = gameData.characters.filter(char => {
        // 檢查角色是否有這個層級的這個格子類型
        if (!char.boardTypes || !char.boardTypes[currentLayer]) {
            return false;
        }
        return char.boardTypes[currentLayer].includes(cellType);
    });
    
    // 應用排序
    characters = sortCharacters(characters, boardSortConfig.field, boardSortConfig.order);
    
    if (characters.length === 0) {
        grid.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 1rem; grid-column: 1 / -1;">${t('footer.noCellsYet')}</p>`;
    } else {
        characters.forEach(char => {
            const card = createCharacterCard(char, cellType);
            grid.appendChild(card);
        });
    }
    
    section.appendChild(grid);
    
    // 統計區 - 融入原本 board-stage-footer 的資訊
    const costMap = { 'layer1': 2, 'layer2': 4, 'layer3': 6 };
    const layerCost = costMap[currentLayer] || 2;
    const bonusPerCell = gameData.boardConfig[currentLayer].bonusPerCell;
    
    const footer = document.createElement('div');
    footer.className = 'cell-footer';
    footer.innerHTML = `
        <div class="footer-left">
            <div class="footer-item">
                <img src="../assets/icons/gold_crayon.png" alt="金蠟筆" class="footer-icon">
                <span class="footer-label">${t('footer.costPerCell')}</span>
                <span class="footer-value">${layerCost}</span>
            </div>
            <div class="footer-item">
                <span class="footer-label">${t('footer.bonusPerCell')}</span>
                <span class="footer-value bonus">+${bonusPerCell}%</span>
            </div>
        </div>
        <div class="footer-right">
            <div class="bonus-stat">
                ${t('footer.totalBonus')} <span class="bonus-value">+${stats.totalBonus.toFixed(1)}%</span>
            </div>
            <div class="crayon-needed">
                <img src="../assets/icons/gold_crayon.png" alt="金蠟筆" class="crayon-icon">
                ${t('footer.crayonsNeeded')} <span class="crayon-count">${stats.crayonsNeeded}</span>
            </div>
        </div>
    `;
    section.appendChild(footer);
    
    return section;
}

// 創建角色卡片
function createCharacterCard(char, cellType) {
    const card = document.createElement('div');
    card.className = 'character-card';
    
    const cellKey = `${char.name}_${currentLayer}_${cellType}`;
    const isOwned = userProgress.ownedCharacters.has(char.name);
    const isActivated = userProgress.activatedCells[cellKey] === true;
    
    if (isOwned) card.classList.add('owned');
    if (isActivated) card.classList.add('activated');
    
    // 添加性格背景類別（使用輔助函數）
    if (typeof addPersonalityClass === 'function') {
        addPersonalityClass(card, char.personality);
    }
    
    // 使用輔助函數創建卡片內容
    if (typeof createBoardCharacterCardContent === 'function') {
        card.innerHTML = createBoardCharacterCardContent(char, gameData);
    } else {
        // 降級處理：如果輔助函數不可用，使用簡化版本
        card.innerHTML = `<div class="character-name">${char.name}</div>`;
    }
    
    // 嘗試載入圖片
    const img = card.querySelector('img');
    if (img) {
        img.onload = function() {
            this.style.display = 'block';
            this.nextElementSibling.style.display = 'none';
        };
        img.src = `../assets/characters/${char.en}.png`;
    }
    
    card.addEventListener('click', () => {
        handleCharacterClick(char, cellType);
    });
    
    return card;
}

// 處理角色點擊
function handleCharacterClick(char, cellType) {
    const cellKey = `${char.name}_${currentLayer}_${cellType}`;
    const isOwned = userProgress.ownedCharacters.has(char.name);
    
    if (!isOwned) {
        // 第一次點擊：設為已擁有
        userProgress.ownedCharacters.add(char.name);
    } else if (!userProgress.activatedCells[cellKey]) {
        // 第二次點擊：啟動格子
        userProgress.activatedCells[cellKey] = true;
    } else {
        // 第三次點擊：取消啟動（回到已擁有狀態）
        userProgress.activatedCells[cellKey] = false;
    }
    
    saveUserProgress();
    // 同步更新所有相關數據
    updateAllData();
}

// 統一更新所有數據的函數
function updateAllData() {
    renderBoard();
    renderInsightPanels();
    updateLayerSummary();
    renderSettingsCharacters();
}

// 更新頁面語言
function updatePageLanguage() {
    if (typeof i18n === 'undefined') return;
    
    // 使用 i18n 的 updatePageTranslations 來更新所有帶有 data-i18n 屬性的元素
    i18n.updatePageTranslations();
    
    // 更新 HTML lang 屬性
    const htmlRoot = document.getElementById('htmlRoot');
    if (htmlRoot) {
        htmlRoot.setAttribute('lang', i18n.currentLang);
    }
    
    // 更新瀏覽器標題
    document.title = i18n.t('pageTitle');
    
    // 更新層級標籤（這些沒有 data-i18n 屬性，需要手動更新）
    document.querySelectorAll('.tab-btn[data-layer]').forEach(btn => {
        const layer = btn.dataset.layer;
        btn.textContent = i18n.t(`layers.${layer}`);
    });
    
    // 更新排序 select 的 options（這些也需要手動更新）
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.options[0].textContent = i18n.t('settings.sortDefault');
        sortSelect.options[1].textContent = i18n.t('settings.sortStars');
        sortSelect.options[2].textContent = i18n.t('settings.sortRole');
        sortSelect.options[3].textContent = i18n.t('settings.sortPersonality');
        sortSelect.options[4].textContent = i18n.t('settings.sortAttackType');
        sortSelect.options[5].textContent = i18n.t('settings.sortDeployRow');
        sortSelect.options[6].textContent = i18n.t('settings.sortRace');
    }
    
    // 更新自定義 select 的 options
    document.querySelectorAll('.select-option span[data-i18n]').forEach(span => {
        const key = span.getAttribute('data-i18n');
        span.textContent = i18n.t(key);
    });
    
    // 更新自定義 select 的當前選中標籤
    const selectLabel = document.querySelector('.select-trigger .select-label[data-i18n]');
    if (selectLabel) {
        const key = selectLabel.getAttribute('data-i18n');
        selectLabel.textContent = i18n.t(key);
    }
    
    // 更新排序按鈕的 title（根據當前狀態）
    const sortOrderBtn = document.getElementById('sortOrderBtn');
    if (sortOrderBtn) {
        const isDesc = sortOrderBtn.classList.contains('desc');
        sortOrderBtn.title = i18n.t(isDesc ? 'settings.sortOrderDesc' : 'settings.sortOrderAsc');
    }
    
    const boardSortOrderBtn = document.getElementById('boardSortOrderBtn');
    if (boardSortOrderBtn) {
        const isDesc = boardSortOrderBtn.classList.contains('desc');
        boardSortOrderBtn.title = i18n.t(isDesc ? 'settings.sortOrderDesc' : 'settings.sortOrderAsc');
    }
    
    // 重新渲染頁面以更新動態內容（僅在數據已載入時）
    if (gameData) {
        renderBoard();
        updateLayerSummary();
        renderInsightPanels();
    }
}

// 計算格子統計
function calculateCellStats(cellType) {
    const characters = gameData.characters.filter(char => {
        if (!char.boardTypes || !char.boardTypes[currentLayer]) {
            return false;
        }
        return char.boardTypes[currentLayer].includes(cellType);
    });
    
    const total = characters.length;
    let activated = 0;
    
    characters.forEach(char => {
        const cellKey = `${char.name}_${currentLayer}_${cellType}`;
        if (userProgress.activatedCells[cellKey]) {
            activated++;
        }
    });
    
    const bonusPerCell = gameData.boardConfig[currentLayer].bonusPerCell;
    const totalBonus = activated * bonusPerCell;
    
    // 計算金蠟筆需求（每層成本不同）
    const costMap = { 'layer1': 2, 'layer2': 4, 'layer3': 6 };
    const layerCost = costMap[currentLayer] || 2;
    const crayonsNeeded = (total - activated) * layerCost;
    
    return { total, activated, totalBonus, crayonsNeeded };
}

function calculateLayerStats(layer) {
    const layerKey = layer || currentLayer;
    const characters = gameData.characters;
    let totalSlots = 0;
    let activatedSlots = 0;

    characters.forEach(char => {
        const boardTypes = char.boardTypes?.[layerKey];
        if (boardTypes && Array.isArray(boardTypes)) {
            totalSlots += boardTypes.length;
            boardTypes.forEach(type => {
                const key = `${char.name}_${layerKey}_${type}`;
                if (userProgress.activatedCells[key]) {
                    activatedSlots += 1;
                }
            });
        }
    });

    return {
        totalSlots,
        activatedSlots,
        completionRate: totalSlots ? Math.round((activatedSlots / totalSlots) * 100) : 0,
        bonusPerCell: gameData.boardConfig[layerKey]?.bonusPerCell || 0,
        totalBonus: (gameData.boardConfig[layerKey]?.bonusPerCell || 0) * activatedSlots
    };
}

function updateLayerSummary() {
    const summaryEl = document.getElementById('layerSummary');
    if (!summaryEl) return;
    const stats = calculateLayerStats();
    const config = gameData.boardConfig[currentLayer];
    const titleEl = document.getElementById('currentLayerTitle');

    const t = (key) => (typeof i18n !== 'undefined' ? i18n.t(key) : translate(key));
    const layerName = t(`layers.${currentLayer}`);

    summaryEl.innerHTML = `
        <div class="summary-title">${layerName}</div>
        <div class="summary-progress">
            <div class="progress-ring">
                <svg viewBox="0 0 120 120">
                    <defs>
                        <linearGradient id="layerProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"></stop>
                            <stop offset="100%"></stop>
                        </linearGradient>
                    </defs>
                    <circle class="ring-bg" cx="60" cy="60" r="52"></circle>
                    <circle class="ring-progress" cx="60" cy="60" r="52" stroke-dasharray="${Math.PI * 104}" stroke-dashoffset="${Math.PI * 104 * (1 - stats.completionRate / 100)}"></circle>
                </svg>
                <span>${stats.completionRate}%</span>
            </div>
            <div class="summary-details">
                <p>${t('panel.activated')} <strong>${stats.activatedSlots}</strong> / ${stats.totalSlots}</p>
                <p>${t('panel.totalBonus')} <strong>+${stats.totalBonus.toFixed(1)}%</strong></p>
            </div>
        </div>
    `;

    if (titleEl) titleEl.textContent = layerName;
}

function renderInsightPanels() {
    renderOwnershipStats();
    renderResourceSummary();
}

function renderOwnershipStats() {
    const container = document.getElementById('ownershipStats');
    if (!container) return;

    const totalCharacters = gameData.characters.length;
    const ownedCharacters = userProgress.ownedCharacters.size;
    const ownedRate = totalCharacters ? Math.round((ownedCharacters / totalCharacters) * 100) : 0;

    const activatedCells = Object.values(userProgress.activatedCells).filter(Boolean).length;
    const totalCells = gameData.characters.reduce((sum, char) => {
        const boards = char.boardTypes || {};
        return sum + Object.values(boards).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    }, 0);
    const activationRate = totalCells ? Math.round((activatedCells / totalCells) * 100) : 0;

    const t = (key) => (typeof i18n !== 'undefined' ? i18n.t(key) : translate(key));

    container.innerHTML = `
        <h3>${t('panel.ownershipStats')}</h3>
        <div class="stat-row">
            <span class="stat-label">${t('panel.ownedCharacters')}</span>
            <span class="stat-value count">${ownedCharacters} / ${totalCharacters}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">${t('panel.ownershipRate')}</span>
            <span class="stat-value percent">${ownedRate}%</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">${t('panel.activatedCells')}</span>
            <span class="stat-value count">${activatedCells} / ${totalCells}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">${t('panel.cellCompletionRate')}</span>
            <span class="stat-value percent">${activationRate}%</span>
        </div>
    `;
}

function renderResourceSummary() {
    const container = document.getElementById('resourceSummary');
    if (!container) return;

    const stats = calculateLayerStats();
    const globalStats = calculateLayerStats('layer1');
    const layerKeys = Object.keys(gameData.boardConfig || {});
    const costMap = { 'layer1': 2, 'layer2': 4, 'layer3': 6 };
    
    // 計算當前層級金蠟筆需求
    const currentLayerCost = costMap[currentLayer] || 2;
    const currentLayerCrayons = (stats.totalSlots - stats.activatedSlots) * currentLayerCost;
    
    // 計算所有層級的金蠟筆需求
    const totalCrayonsNeeded = layerKeys.reduce((sum, key) => {
        const layerStats = calculateLayerStats(key);
        const layerCost = costMap[key] || 2;
        return sum + ((layerStats.totalSlots - layerStats.activatedSlots) * layerCost);
    }, 0);
    
    // 計算所有層級的總加成
    const allLayersBonus = layerKeys.reduce((sum, key) => {
        const layerStats = calculateLayerStats(key);
        return sum + layerStats.totalBonus;
    }, 0);

    const t = (key) => (typeof i18n !== 'undefined' ? i18n.t(key) : translate(key));

    container.innerHTML = `
        <h3>${t('panel.resourceSummary')}</h3>
        <div class="stat-row">
            <img src="../assets/icons/gold_crayon.png" alt="金蠟筆" class="stat-icon">
            <span class="stat-label">${t('panel.currentLayerNeed')}</span>
            <span class="stat-value resource">${currentLayerCrayons}</span>
        </div>
        <div class="stat-row">
            <img src="../assets/icons/gold_crayon.png" alt="金蠟筆" class="stat-icon">
            <span class="stat-label">${t('panel.allLayersNeed')}</span>
            <span class="stat-value resource">${totalCrayonsNeeded}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">${t('panel.currentLayerBonus')}</span>
            <span class="stat-value percent">+${stats.totalBonus.toFixed(1)}%</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">${t('panel.allLayersBonus')}</span>
            <span class="stat-value percent">+${allLayersBonus.toFixed(1)}%</span>
        </div>
    `;
}

// 角色排序函數
function sortCharacters(characters, field, order) {
    if (field === 'default') {
        return [...characters]; // 返回原始順序的副本
    }
    
    const sorted = [...characters].sort((a, b) => {
        let valA, valB;
        
        switch(field) {
            case 'stars':
                valA = a.stars || 0;
                valB = b.stars || 0;
                return order === 'asc' ? valA - valB : valB - valA;
                
            case 'role':
                valA = a.role || '';
                valB = b.role || '';
                break;
                
            case 'personality':
                valA = a.personality || '';
                valB = b.personality || '';
                break;
                
            case 'attackType':
                valA = a.attackType || '';
                valB = b.attackType || '';
                break;
                
            case 'deployRow':
                valA = a.deployRow || '';
                valB = b.deployRow || '';
                break;
                
            case 'race':
                valA = a.race || '';
                valB = b.race || '';
                break;
                
            default:
                return 0;
        }
        
        // 字符串比較
        if (order === 'asc') {
            return valA.localeCompare(valB, 'zh-TW');
        } else {
            return valB.localeCompare(valA, 'zh-TW');
        }
    });
    
    return sorted;
}

// 渲染設置面板角色
function renderSettingsCharacters() {
    const grid = document.getElementById('settingsCharacterGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // 應用排序
    const characters = sortCharacters(gameData.characters, sortConfig.field, sortConfig.order);
    
    if (characters.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem; grid-column: 1 / -1;">無角色數據</p>';
        return;
    }
    
    characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        const isOwned = userProgress.ownedCharacters.has(char.name);
        if (isOwned) card.classList.add('owned');
        
        // 添加性格背景類別（使用輔助函數）
        if (typeof addPersonalityClass === 'function') {
            addPersonalityClass(card, char.personality);
        }
        
        // 使用輔助函數創建卡片內容
        if (typeof createSettingsCharacterCardContent === 'function') {
            card.innerHTML = createSettingsCharacterCardContent(char, gameData);
        } else {
            // 降級處理：如果輔助函數不可用，使用簡化版本
            card.innerHTML = `<div class="character-name">${char.name}</div>`;
        }
        
        card.addEventListener('click', () => {
            if (userProgress.ownedCharacters.has(char.name)) {
                // 移除角色擁有狀態
                userProgress.ownedCharacters.delete(char.name);
                // 同時移除所有相關的啟動格子
                Object.keys(userProgress.activatedCells).forEach(key => {
                    if (key.startsWith(char.name + '_')) {
                        delete userProgress.activatedCells[key];
                    }
                });
            } else {
                // 添加角色擁有狀態
                userProgress.ownedCharacters.add(char.name);
            }
            saveUserProgress();
            // 同步更新所有相關數據
            updateAllData();
        });
        
        grid.appendChild(card);
    });
}

