/**
 * 角色卡片共用輔助函數
 * 避免在 createCharacterCard 和 renderSettingsCharacters 中重複代碼
 */

/**
 * 創建角色頭像 HTML
 * @param {Object} char - 角色對象
 * @returns {string} 頭像 HTML
 */
function createCharacterAvatar(char) {
    return `<div class="character-avatar">
        <img src="../assets/characters/${char.en}.png" 
             alt="${char.name}"
             loading="lazy"
             decoding="async"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="character-fallback" style="display: none;">
            ${char.name.charAt(0)}
        </div>
    </div>`;
}

/**
 * 創建星級圖標 HTML
 * @param {number} stars - 星級數量
 * @returns {string} 星級 HTML
 */
function createStarsHtml(stars) {
    return `
        <div class="character-stars">
            ${Array(stars).fill('<img src="../assets/icons/unit_star.png" alt="★" class="star-icon" loading="lazy" decoding="async">').join('')}
        </div>
    `;
}

/**
 * 創建角色圖標 HTML
 * @param {Object} char - 角色對象
 * @param {Object} gameData - 遊戲數據
 * @returns {Object} 包含左側和右側圖標的 HTML
 */
function createCharacterIcons(char, gameData) {
    const personalityIcon = gameData.personalities[char.personality]?.icon;
    const attackIcon = gameData.attackTypes[char.attackType]?.icon;
    const deployIcon = gameData.deployRows[char.deployRow]?.icon;
    
    const leftIconsHtml = `
        <div class="character-icons-left">
            ${personalityIcon ? `<img src="${personalityIcon}" alt="${char.personality}" title="${char.personality}" class="char-icon" loading="lazy" decoding="async">` : ''}
            ${attackIcon ? `<img src="${attackIcon}" alt="${char.attackType}" title="${char.attackType}" class="char-icon" loading="lazy" decoding="async">` : ''}
        </div>
    `;
    
    const rightIconsHtml = `
        <div class="character-icons-right">
            ${deployIcon ? `<img src="${deployIcon}" alt="${char.deployRow}" title="${char.deployRow}" class="char-icon" loading="lazy" decoding="async">` : ''}
        </div>
    `;
    
    return { leftIconsHtml, rightIconsHtml };
}

/**
 * 添加性格背景類別
 * @param {HTMLElement} card - 卡片元素
 * @param {string} personality - 性格
 */
function addPersonalityClass(card, personality) {
    const personalityClassMap = {
        '冷靜': 'personality-cool',
        '狂亂': 'personality-mad',
        '天真': 'personality-naive',
        '活潑': 'personality-jolly',
        '憂鬱': 'personality-gloomy'
    };
    
    const personalityClass = personalityClassMap[personality];
    if (personalityClass) {
        card.classList.add(personalityClass);
    }
}

/**
 * 創建完整的角色卡片內容（用於棋盤）
 * @param {Object} char - 角色對象
 * @param {Object} gameData - 遊戲數據
 * @returns {string} 卡片 HTML 內容
 */
function createBoardCharacterCardContent(char, gameData) {
    const avatarHtml = createCharacterAvatar(char);
    const starsHtml = createStarsHtml(char.stars);
    const { leftIconsHtml, rightIconsHtml } = createCharacterIcons(char, gameData);
    
    return `
        ${avatarHtml}
        ${starsHtml}
        ${leftIconsHtml}
        ${rightIconsHtml}
        <div class="character-name">${char.name}</div>
        ${char.en ? `<div class="character-info" style="font-size: 0.75rem; opacity: 0.7; margin-top: -0.25rem;">${char.en}</div>` : ''}
        <div class="character-info">${char.personality} · ${'★'.repeat(char.stars)}</div>
        <div class="character-badges">
            <span class="badge">${char.attackType}</span>
            <span class="badge">${char.role}</span>
        </div>
    `;
}

/**
 * 創建簡化的角色卡片內容（用於設置面板）
 * @param {Object} char - 角色對象
 * @param {Object} gameData - 遊戲數據
 * @returns {string} 卡片 HTML 內容
 */
function createSettingsCharacterCardContent(char, gameData) {
    const avatarHtml = createCharacterAvatar(char);
    const starsHtml = createStarsHtml(char.stars);
    const { leftIconsHtml, rightIconsHtml } = createCharacterIcons(char, gameData);
    
    return `
        ${avatarHtml}
        ${starsHtml}
        ${leftIconsHtml}
        ${rightIconsHtml}
    `;
}

