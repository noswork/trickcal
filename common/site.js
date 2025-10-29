// Common site helpers: sweep-style navbar and footer injection
(function(){
  const {
    getSavedLanguage
  } = window.TrickcalLocales;

  function createEl(tag, className, html){
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
  }

  function getPageKind(){
    const href = location.pathname;
    if (href.includes('/board/')) return 'board';
    if (href.includes('/sweep/')) return 'sweep';
    return 'root';
  }

  function tFallback(key, def) {
    const originalWarn = console.warn;
    console.warn = () => {};

    try {
      if (window.i18n && typeof window.i18n.t === 'function') {
        try {
          const result = window.i18n.t(key);
          if (result !== key) {
            return result;
          }
        } catch {}
      }
      return def ?? key;
    } finally {
      console.warn = originalWarn;
    }
  }

  function getPageName(){
    const kind = getPageKind();
    if (kind === 'board') return tFallback('nav.title', '金蠟筆筆記本');
    if (kind === 'sweep') return tFallback('nav.title', '掃蕩工具');
    return tFallback('nav.title', 'Trickcal Tools');
  }

  function getPathMap() {
    const kind = getPageKind();
    if (kind === 'board') {
      return {
        assets: '../assets',
        toBoard: './index.html',
        toSweep: '../sweep/index.html',
        toHome: '../index.html'
      };
    }
    if (kind === 'sweep') {
      return {
        assets: '../assets',
        toBoard: '../board/index.html',
        toSweep: './index.html',
        toHome: '../index.html'
      };
    }
    return {
      assets: 'assets',
      toBoard: 'board/index.html',
      toSweep: 'sweep/index.html',
      toHome: 'index.html'
    };
  }

  function buildPageSwitcher(){
    // 使用當前語言獲取頁面名稱
    const boardName = tFallback('nav.boardTool', '金蠟筆筆記本');
    const sweepName = tFallback('nav.sweepTool', '掃蕩工具');
    const paths = getPathMap();
    
    return `
      <div class="page-switcher" data-open="false">
        <button class="page-switcher-toggle" type="button" aria-haspopup="listbox" aria-expanded="false" title="切換分頁">
          <span class="page-name">${getPageName()}</span>
          <span class="caret">▾</span>
        </button>
        <ul class="page-switcher-menu" role="listbox">
          <li role="option">
            <a data-page="board" href="${paths.toBoard}">
              <img src="${paths.assets}/icons/gold_crayon.png" alt="board" width="16" height="16" />
              <span class="menu-item-board">${boardName}</span>
            </a>
          </li>
          <li role="option">
            <a data-page="sweep" href="${paths.toSweep}">
              <img src="${paths.assets}/favicons/favicon.png" alt="sweep" width="16" height="16" />
              <span class="menu-item-sweep">${sweepName}</span>
            </a>
          </li>
        </ul>
      </div>`;
  }

  function createUseCounter(){
    const counter = document.createElement('div');
    counter.className = 'use-counter';
    counter.title = '全球總使用次數';
    counter.innerHTML = `
      <svg class="counter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4"/>
        <path d="M12 18v4"/>
        <path d="m4.93 4.93 2.83 2.83"/>
        <path d="m16.24 16.24 2.83 2.83"/>
        <path d="M2 12h4"/>
        <path d="M18 12h4"/>
        <path d="m4.93 19.07 2.83-2.83"/>
        <path d="m16.24 7.76 2.83-2.83"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span class="counter-value">...</span>`;
    return counter;
  }

  function buildNavbar(){
    const kind = getPageKind();
    const hasExistingSweepNav = document.querySelector('nav.top-nav');
    const paths = getPathMap();
    if (kind === 'sweep' && hasExistingSweepNav) {
      // 若是 sweep，插入 page-switcher 到其 brand 區域右側
    const brand = hasExistingSweepNav.querySelector('.brand');
    const pageSwitcher = hasExistingSweepNav.querySelector('.page-switcher');
    if (brand && !pageSwitcher) {
        const container = document.createElement('div');
        container.innerHTML = buildPageSwitcher();
        const switcher = container.firstElementChild;
        brand.appendChild(switcher);
        
        // 綁定 page-switcher 事件
        const toggle = switcher.querySelector('.page-switcher-toggle');
        const clickHandler = (e) => {
          e.stopPropagation();
          const open = switcher.getAttribute('data-open') === 'true';
          switcher.setAttribute('data-open', (!open).toString());
          toggle.setAttribute('aria-expanded', (!open).toString());
        };
        toggle.addEventListener('click', clickHandler);
        
        const closeHandler = (e) => {
          if (!switcher.contains(e.target)) {
            switcher.setAttribute('data-open', 'false');
            toggle.setAttribute('aria-expanded', 'false');
          }
        };
        document.addEventListener('click', closeHandler);
    } else if (pageSwitcher) {
      // 如果 page-switcher 已存在（可能由模板直接定義），確保仍有事件綁定
      const toggle = pageSwitcher.querySelector('.page-switcher-toggle');
      if (toggle && !toggle.dataset.switcherBound) {
        const clickHandler = (e) => {
          e.stopPropagation();
          const open = pageSwitcher.getAttribute('data-open') === 'true';
          pageSwitcher.setAttribute('data-open', (!open).toString());
          toggle.setAttribute('aria-expanded', (!open).toString());
        };
        toggle.addEventListener('click', clickHandler);
        toggle.dataset.switcherBound = 'true';
        
        const closeHandler = (e) => {
          if (!pageSwitcher.contains(e.target)) {
            pageSwitcher.setAttribute('data-open', 'false');
            toggle.setAttribute('aria-expanded', 'false');
          }
        };
        document.addEventListener('click', closeHandler);
      }
    }

    // 調整使用計數器位置：移動到 page-switcher-toggle 右側
    const switcherForCounter = hasExistingSweepNav.querySelector('.page-switcher');
    if (switcherForCounter) {
      const existingCounter = hasExistingSweepNav.querySelector('.use-counter');
      const counterNode = existingCounter || createUseCounter();
      switcherForCounter.insertAdjacentElement('afterend', counterNode);
    }

    // 品牌可點擊返回首頁
    if (brand && !brand.dataset.homebound) {
      brand.addEventListener('click', (e) => {
        if (e.target.closest('.page-switcher')) return; // 避免點擊分頁切換時跳轉
        location.href = paths.toHome;
      });
      brand.dataset.homebound = 'true';
    }
      return; // 避免重複整個 nav
    }

    const headerMount = document.getElementById('siteHeader');
    if (!headerMount || headerMount.dataset.mounted) return;

    const nav = createEl('nav', 'top-nav');
    nav.dataset.pageKind = kind;
    document.body.dataset.pageKind = kind;
    const brandHtml = `
      <div class="brand">
        <img src="${paths.assets}/favicons/favicon.png" alt="Trickcal" width="20" height="20" />
        <span class="site">Trickcal</span>
        ${buildPageSwitcher()}
      </div>`;

    const controlsHtml = `
      <div class="nav-controls">
        ${kind === 'board' ? `
          <button class="btn-icon settings-btn" id="settingsBtn" title="${tFallback('nav.settings','設置')}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v10M1 12h6m6 0h10"/>
              <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24M4.93 19.07l4.24-4.24m5.66-5.66 4.24-4.24"/>
            </svg>
          </button>` : ''}
        <button class="mode-toggle" id="themeBtn" type="button" aria-label="切換顯示模式">
          <svg class="icon icon-sun" viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
              </radialGradient>
            </defs>
            <circle cx="12" cy="12" r="4.5" fill="url(#sunGradient)" stroke="none"/>
            <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="12" y1="1" x2="12" y2="3.5" />
              <line x1="12" y1="20.5" x2="12" y2="23" />
              <line x1="3.5" y1="4.93" x2="5.34" y2="6.77" />
              <line x1="18.66" y1="17.23" x2="20.5" y2="19.07" />
              <line x1="1" y1="12" x2="3.5" y2="12" />
              <line x1="20.5" y1="12" x2="23" y2="12" />
              <line x1="3.5" y1="19.07" x2="5.34" y2="17.23" />
              <line x1="18.66" y1="6.77" x2="20.5" y2="4.93" />
            </g>
            <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
          </svg>
          <svg class="icon icon-moon" viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <radialGradient id="moonGradient" cx="30%" cy="30%">
                <stop offset="0%" style="stop-color:#E8E8E8;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#B0B0B0;stop-opacity:1" />
              </radialGradient>
            </defs>
            <path d="M21.5 13.5A9.5 9.5 0 0 1 11 3.5a7.5 7.5 0 1 0 10.5 10Z" fill="url(#moonGradient)" stroke="none"/>
            <path d="M21.5 13.5A9.5 9.5 0 0 1 11 3.5a7.5 7.5 0 1 0 10.5 10Z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
            <circle cx="16" cy="8" r="0.8" fill="currentColor" opacity="0.6"/>
            <circle cx="14" cy="11" r="0.5" fill="currentColor" opacity="0.5"/>
            <circle cx="18" cy="13" r="0.6" fill="currentColor" opacity="0.5"/>
          </svg>
        </button>
        <div class="language-selector-container"></div>
      </div>`;

    nav.innerHTML = brandHtml + controlsHtml;
    headerMount.appendChild(nav);
    headerMount.dataset.mounted = 'true';

    const switcherForCounter = nav.querySelector('.page-switcher');
    if (switcherForCounter) {
      const existingCounter = nav.querySelector('.use-counter');
      if (!existingCounter) {
        switcherForCounter.insertAdjacentElement('afterend', createUseCounter());
      } else if (existingCounter.previousElementSibling !== switcherForCounter) {
        switcherForCounter.insertAdjacentElement('afterend', existingCounter);
      }
    }

    // Page switcher behavior
    const switcher = nav.querySelector('.page-switcher');
    if (switcher) {
      const toggle = switcher.querySelector('.page-switcher-toggle');
      const clickHandler = (e) => {
        e.stopPropagation();
        const open = switcher.getAttribute('data-open') === 'true';
        switcher.setAttribute('data-open', (!open).toString());
        toggle.setAttribute('aria-expanded', (!open).toString());
      };
      toggle.addEventListener('click', clickHandler);
      
      const closeHandler = (e) => {
        if (!switcher.contains(e.target)) {
          switcher.setAttribute('data-open', 'false');
          toggle.setAttribute('aria-expanded', 'false');
        }
      };
      document.addEventListener('click', closeHandler);
    }

    // 品牌可點擊返回首頁（root 不跳轉）
    const brand = nav.querySelector('.brand');
    if (brand && !brand.dataset.homebound) {
      brand.addEventListener('click', (e) => {
        if (e.target.closest('.page-switcher')) return;
        const kindNow = getPageKind();
        if (kindNow === 'root') return;
        location.href = paths.toHome;
      });
      brand.dataset.homebound = 'true';
    }
  }

  function buildFooter(){
    const footerMount = document.getElementById('siteFooter');
    if (!footerMount || footerMount.dataset.mounted) return;

    const footer = createEl('footer', 'site-footer');
    footer.innerHTML = `
      <div class="footer-content">
        <div class="footer-main">
          <span class="footer-text" data-i18n="footer.description">此工具由 nos 創作</span>
          <span class="footer-separator">•</span>
          <span class="footer-license" data-i18n="footer.license">MIT License</span>
          <span class="footer-separator">•</span>
          <span class="footer-copyright-inline">&copy; 2025 nos</span>
        </div>
        <div class="footer-contact">
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer" class="discord-link" title="Discord: nos1130">
            <svg class="discord-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span class="discord-id">nos1130</span>
          </a>
        </div>
      </div>`;
    footerMount.appendChild(footer);
    // 同步主題：沿用 body 的 data-theme，樣式由 CSS 控制
    footerMount.dataset.mounted = 'true';
  }

  // 統一主題管理
  function initTheme() {
    // 統一的主題儲存鍵名
    const THEME_KEY = 'trickcal_theme';
    
    // 從 localStorage 讀取主題，預設為 dark
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.body.dataset.theme = savedTheme;
    
    // 綁定主題切換按鈕
    function bindThemeToggle() {
      const themeBtn = document.getElementById('themeBtn') || document.querySelector('.mode-toggle');
      if (themeBtn && !themeBtn.dataset.themeBound) {
        themeBtn.addEventListener('click', () => {
          const current = document.body.dataset.theme || 'dark';
          const next = current === 'light' ? 'dark' : 'light';
          document.body.dataset.theme = next;
          localStorage.setItem(THEME_KEY, next);
        });
        themeBtn.dataset.themeBound = 'true';
      }
    }
    
    // 立即綁定（如果已經存在）
    bindThemeToggle();
    
    // 導航欄建立後再次綁定
    setTimeout(bindThemeToggle, 100);
  }

  // 更新頁面切換器的文字（在語言變更時調用）
  function updatePageSwitcherText() {
    const pageNameEl = document.querySelector('.page-switcher .page-name');
    if (pageNameEl) {
      pageNameEl.textContent = getPageName();
    }

    const boardMenuItem = document.querySelector('.page-switcher .menu-item-board');
    if (boardMenuItem) {
      boardMenuItem.textContent = tFallback('nav.boardTool', boardMenuItem.textContent);
    }

    const sweepMenuItem = document.querySelector('.page-switcher .menu-item-sweep');
    if (sweepMenuItem) {
      sweepMenuItem.textContent = tFallback('nav.sweepTool', sweepMenuItem.textContent);
    }
  }

  // 語言選擇器管理
  function renderLanguageSelector() {
    const mounts = document.querySelectorAll('.language-selector-container');
    if (!mounts.length || !window.TrickcalLanguageSelector) return;

    window.TrickcalLanguageSelector.render(mounts, {
      currentLang: getSavedLanguage(),
      onChange: () => {
        // 延遲更新，確保 i18n 已完成翻譯載入
        setTimeout(updatePageSwitcherText, 150);
      }
    });
  }

  // 監聽全局語言變更事件，確保 page-name 同步更新
  window.addEventListener('languageChanged', (event) => {
    // 延遲更新，確保 i18n 已完成翻譯載入
    setTimeout(updatePageSwitcherText, 150);
  });

  // 初始化使用計數器
  function initUsageCounter() {
    // 等待 TrickcalUsageCounter 可用
    if (typeof window.TrickcalUsageCounter !== 'undefined') {
      const pageType = getPageKind();
      window.TrickcalUsageCounter.init({ 
        pageType: pageType,
        element: document.querySelector('.counter-value')
      });
      
      // 初始化成功後，設置全局按鈕追蹤
      setupGlobalButtonTracking();
    } else {
      // 如果 usage-counter.js 未載入，稍後再試
      setTimeout(initUsageCounter, 100);
    }
  }

  // 設置全局按鈕點擊追蹤
  function setupGlobalButtonTracking() {
    if (typeof window.TrickcalUsageCounter === 'undefined') {
      console.warn('TrickcalUsageCounter 未載入，無法設置全局按鈕追蹤');
      return;
    }

    // 使用事件委託，在 document 層級監聽所有點擊
    document.addEventListener('click', function(event) {
      // 獲取被點擊的元素
      let target = event.target;
      
      // 往上查找，找到實際的可點擊元素（button, a, [role="button"] 等）
      while (target && target !== document) {
        const tagName = target.tagName.toLowerCase();
        const role = target.getAttribute('role');
        
        // 檢查是否為可點擊元素
        if (tagName === 'button' || 
            tagName === 'a' || 
            role === 'button' || 
            role === 'option' ||
            target.classList.contains('catalog-card') ||
            target.classList.contains('character-card') ||
            target.classList.contains('material-chip') ||
            target.classList.contains('page-btn') ||
            target.classList.contains('tab-btn')) {
          
          // 追蹤點擊事件
          const actionType = getActionType(target);
          window.TrickcalUsageCounter.track(actionType);
          
          // 只追蹤一次，然後停止
          break;
        }
        
        target = target.parentElement;
      }
    }, { passive: true }); // 使用 passive 選項提升性能
    
    console.log('全局按鈕追蹤已啟用');
  }

  // 根據元素類型決定動作類型
  function getActionType(element) {
    const tagName = element.tagName.toLowerCase();
    const classList = element.classList;
    const id = element.id;
    
    // 根據元素的類別或 ID 決定動作類型
    if (classList.contains('mode-toggle') || id === 'themeBtn') {
      return 'theme_toggle';
    }
    if (classList.contains('language-toggle') || classList.contains('language-selector')) {
      return 'language_change';
    }
    if (classList.contains('page-switcher-toggle')) {
      return 'page_switch';
    }
    if (classList.contains('catalog-card')) {
      return 'material_select';
    }
    if (classList.contains('character-card')) {
      return 'character_select';
    }
    if (classList.contains('material-chip')) {
      return 'material_remove';
    }
    if (classList.contains('clear-selection')) {
      return 'clear_all';
    }
    if (classList.contains('page-btn') || classList.contains('catalog-nav')) {
      return 'navigation';
    }
    if (classList.contains('tab-btn')) {
      return 'tab_switch';
    }
    if (id === 'settingsBtn' || classList.contains('settings-btn')) {
      return 'open_settings';
    }
    if (id === 'resetAllBtn') {
      return 'reset_all';
    }
    if (tagName === 'a') {
      return 'link_click';
    }
    
    // 默認為普通按鈕點擊
    return 'button_click';
  }

  function mountCommon(){
    initTheme();
    document.body.dataset.pageKind = getPageKind();
    buildNavbar();
    buildFooter();
    renderLanguageSelector();
    setTimeout(initUsageCounter, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCommon);
  } else {
    mountCommon();
  }

  // 暴露給外部使用的 API
  window.TrickcalCommon = {
    // 獲取當前語言
    getCurrentLanguage() {
      return localStorage.getItem('trickcal_language') || 'zh-TW';
    },
    
    // 設置語言
    setLanguage(lang, options = {}) {
      const validLangs = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko'];
      if (!validLangs.includes(lang)) return;
      const prev = localStorage.getItem('trickcal_language');
      if (prev === lang) return;
      localStorage.setItem('trickcal_language', lang);
      const { silent = false } = options;
      if (!silent) {
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
      }
    },
    
    // 獲取當前主題
    getCurrentTheme() {
      return document.body.dataset.theme || 'dark';
    },
    
    // 設置主題
    setTheme(theme) {
      if (theme === 'light' || theme === 'dark') {
        document.body.dataset.theme = theme;
        localStorage.setItem('trickcal_theme', theme);
      }
    },
    
    // 提供共用 page kind 判斷
    getPageKind,
    
    // 暴露回退翻譯器
    translate(key, def) {
      return tFallback(key, def);
    },
    
    // 更新頁面切換器文字
    updatePageSwitcherText
  };
})();



