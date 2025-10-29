const DATA_URL = "data.json";
const LANG_PATH = "../assets/lang/sweep";
const GEARS_PATH = "../assets/gears";
const PLACEHOLDER_IMG = "../assets/gears/placeholder.svg";

// 使用計數器現在由 common/usage-counter.js 統一管理

// 根据材料名称生成图片路径
function getMaterialImagePath(materialName) {
  return `${GEARS_PATH}/${materialName}.png`;
}

const LANG_MAP = {
  "zh-TW": "zh-TW.json",
  "zh-CN": "zh-CN.json",
  en: "en.json",
  ja: "ja.json",
  ko: "ko.json",
};

const DEFAULT_LANG = "zh-TW";
const STORAGE_KEYS = {
  theme: "trickcal_theme",
  lang: "trickcal_language",
  selected: "trickcal_sweep_selected_materials",
};

const state = {
  data: {},
  stages: {},
  materials: [],
  translations: {},
  language: DEFAULT_LANG,
  theme: "light",
  selectedMaterials: new Set(),
};

const refs = {
  body: document.body,
  catalogGrid: document.querySelector(".catalog-grid"),
  searchInput: document.querySelector("#material-search"),
  planSummary: document.querySelector(".plan-summary"),
  stageList: document.querySelector(".stage-list"),
  planWarning: document.querySelector(".plan-warning"),
  pageIndicator: document.querySelector(".page-indicator"),
  catalogPrev: document.querySelector(".catalog-nav.prev"),
  catalogNext: document.querySelector(".catalog-nav.next"),
  clearSelection: document.querySelector(".clear-selection"),
  modal: document.querySelector(".modal"),
  modalClose: document.querySelector(".modal-close"),
  tooltip: null, // 將在初始化時創建
};

const catalogState = {
  page: 1,
  pageSize: 24,
  filteredMaterials: [],
};

async function init() {
  // 主題由 common/site.js 統一處理，此處僅同步狀態
  state.theme = refs.body.dataset.theme || "dark";
  
  // 顯示頁面
  document.body.style.visibility = "visible";
  
  // 檢測移動設備並優化背景視頻
  optimizeBackgroundVideo();
  
  // 創建 tooltip 元素（僅在非觸控設備）
  if (!isTouchDevice()) {
    createTooltip();
  }
  
  await loadData();
  hydrateStages();
  restorePreferences();
  await loadTranslations(state.language);
  
  // 初始化語言選擇器（等待 sweepI18n 可用）
  if (window.sweepI18n) {
    await window.sweepI18n.init();
  }
  
  bindEvents();
  renderMaterials();
  updatePlan();
  
  // 使用計數器由 common/usage-counter.js 和 common/site.js 統一管理
}

// 檢測是否為觸控設備
function isTouchDevice() {
  return ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0) || 
         (navigator.msMaxTouchPoints > 0);
}

// 優化背景視頻性能
function optimizeBackgroundVideo() {
  const video = document.querySelector('.background-video');
  if (!video) return;
  
  // 在移動設備上禁用背景視頻以節省性能和數據
  if (isTouchDevice() || window.innerWidth <= 768) {
    video.style.display = 'none';
    // 使用靜態背景圖片替代
    document.body.style.backgroundImage = 'var(--background-image)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    // 桌面設備上保持視頻
    video.load();
  }
}

function createTooltip() {
  const tooltip = document.createElement("div");
  tooltip.className = "material-tooltip";
  tooltip.dataset.visible = "false";
  document.body.appendChild(tooltip);
  refs.tooltip = tooltip;
}

function showTooltip(text, x, y) {
  if (!refs.tooltip) return;
  refs.tooltip.textContent = text;
  refs.tooltip.style.left = `${x}px`;
  refs.tooltip.style.top = `${y}px`;
  refs.tooltip.dataset.visible = "true";
}

function hideTooltip() {
  if (!refs.tooltip) return;
  refs.tooltip.dataset.visible = "false";
}

async function loadData() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  parseData(data);
}

function parseData(data) {
  const materials = [];
  const stagesMap = {};
  const materialMap = {};

  // Process JSON data
  for (const [materialName, stages] of Object.entries(data)) {
    if (!materialName || !Array.isArray(stages) || stages.length === 0) {
      continue;
    }

    materials.push(materialName);
    materialMap[materialName] = stages;

    // Build reverse mapping: stage -> materials
    for (const stage of stages) {
      if (!stagesMap[stage]) {
        stagesMap[stage] = new Set();
      }
      stagesMap[stage].add(materialName);
    }
  }

  state.materials = materials;
  state.data = materialMap;
  state.stages = Object.fromEntries(
    Object.entries(stagesMap)
      .map(([stage, materialSet]) => [stage, [...materialSet]])
      .sort((a, b) => stageComparator(a[0], b[0]))
  );

  catalogState.filteredMaterials = [...state.materials];
}

function hydrateStages() {
  // Already constructed during parseData.
}

function restorePreferences() {
  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  const storedLang = localStorage.getItem(STORAGE_KEYS.lang);
  const storedSelected = localStorage.getItem(STORAGE_KEYS.selected);

  if (storedTheme === "dark" || storedTheme === "light") {
    state.theme = storedTheme;
  }

  if (storedLang && LANG_MAP[storedLang]) {
    state.language = storedLang;
  }

  if (storedSelected) {
    try {
      const parsed = JSON.parse(storedSelected);
      state.selectedMaterials = new Set(parsed.filter((name) => state.data[name]));
    } catch {
      state.selectedMaterials = new Set();
    }
  }
}

// 主題切換由 common/site.js 統一處理

async function loadTranslations(lang) {
  try {
    const response = await fetch(`${LANG_PATH}/${LANG_MAP[lang]}`);
    state.translations = await response.json();
    state.language = lang;
    localStorage.setItem(STORAGE_KEYS.lang, lang);
    
    // 設置 window.i18n 以供 site.js 的 tFallback 使用
    window.i18n = { t: t };
    applyTranslations();
  } catch (error) {
    console.error("Failed to load translations", error);
  }
}

function applyTranslations() {
  const translatable = document.querySelectorAll("[data-i18n]");
  translatable.forEach((element) => {
    const key = element.dataset.i18n;
    const value = t(key);
    if (value) {
      element.textContent = value;
    }
  });

  const placeholderNodes = document.querySelectorAll("[data-i18n-placeholder]");
  placeholderNodes.forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    const value = t(key);
    if (value) {
      element.setAttribute("placeholder", value);
    }
  });

  // 更新頁面標題
  const pageTitle = t("nav.title");
  if (pageTitle) {
    document.title = pageTitle;
  }

  // 更新頁面切換器的文字（如果存在）
  if (window.TrickcalCommon && typeof window.TrickcalCommon.updatePageSwitcherText === 'function') {
    window.TrickcalCommon.updatePageSwitcherText();
  }

  updateCatalogPageIndicator();
  renderMaterials();
  updatePlan();
}

const translate = (key, def) => window.TrickcalCommon?.translate?.(key, def) ?? def ?? key;

function updateLanguageContent() {
  document.title = translate('nav.title', document.title);

  window.TrickcalCommon?.updatePageSwitcherText?.();

  updateCatalogPageIndicator();
  renderMaterials();
  updatePlan();
}

function t(key) {
  const segments = key.split(".");
  let current = state.translations;

  for (const segment of segments) {
    if (current && segment in current) {
      current = current[segment];
    } else {
      return translate(key);
    }
  }
  if (typeof current === "string") return current;
  return translate(key);
}

function getMaterialName(materialKey) {
  const translated = t(`materials.${materialKey}`);
  return translated === `materials.${materialKey}` ? materialKey : translated;
}

function bindEvents() {
  // 主題切換由 common/site.js 統一處理
  // 語言選擇器也由 common/site.js 統一處理
  // 監聽語言變更事件來更新翻譯
  window.addEventListener('languageChanged', async (event) => {
    const lang = event.detail.language;
    await loadTranslations(lang);
    // 延遲更新 page-switcher，確保翻譯已完全載入
    setTimeout(() => {
      window.TrickcalCommon?.updatePageSwitcherText?.();
    }, 50);
  });

  refs.catalogPrev.addEventListener("click", () => changeCatalogPage(-1));
  refs.catalogNext.addEventListener("click", () => changeCatalogPage(1));

  refs.searchInput.addEventListener("input", () => {
    filterMaterials(refs.searchInput.value);
  });

  refs.clearSelection.addEventListener("click", () => {
    state.selectedMaterials.clear();
    persistSelection();
    renderMaterials();
    updatePlan();
    // 全局按鈕追蹤已由 site.js 處理，無需手動調用
  });
}

// updateLanguageLabel 已移除，語言選擇器現由 sweep/i18n.js 管理

function renderMaterials() {
  const start = (catalogState.page - 1) * catalogState.pageSize;
  const pageItems = catalogState.filteredMaterials.slice(start, start + catalogState.pageSize);

  // Clear existing content safely
  while (refs.catalogGrid.firstChild) {
    refs.catalogGrid.removeChild(refs.catalogGrid.firstChild);
  }

  for (const name of pageItems) {
    const card = document.createElement("button");
    card.className = "catalog-card";
    card.type = "button";
    card.dataset.name = name;
    card.setAttribute("data-selected", state.selectedMaterials.has(name));

    const img = document.createElement("img");
    // 使用懶加載圖片
    if ('loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
    }
    img.src = getMaterialImagePath(name);
    img.alt = getMaterialName(name);
    // 如果图片加载失败，使用占位符
    img.onerror = () => {
      img.src = PLACEHOLDER_IMG;
    };

    const label = document.createElement("span");
    label.textContent = getMaterialName(name);

    card.appendChild(img);
    card.appendChild(label);
    card.addEventListener("click", () => toggleMaterial(name));
    
    // 只在非觸控設備上添加 tooltip 事件
    if (!isTouchDevice() && refs.tooltip) {
      card.addEventListener("mouseenter", (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        showTooltip(getMaterialName(name), x, y);
      });
      
      card.addEventListener("mousemove", (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        showTooltip(getMaterialName(name), x, y);
      });
      
      card.addEventListener("mouseleave", () => {
        hideTooltip();
      });
    } else {
      // 觸控設備：添加長按顯示名稱的功能
      let touchTimer;
      card.addEventListener("touchstart", (e) => {
        touchTimer = setTimeout(() => {
          // 可以使用原生alert或toast顯示名稱
          // 這裡使用簡單的方式在卡片上顯示文字
          card.setAttribute('title', getMaterialName(name));
        }, 500);
      });
      
      card.addEventListener("touchend", () => {
        if (touchTimer) clearTimeout(touchTimer);
      });
      
      card.addEventListener("touchcancel", () => {
        if (touchTimer) clearTimeout(touchTimer);
      });
    }

    refs.catalogGrid.appendChild(card);
  }

  updateCatalogPageIndicator();
}

function changeCatalogPage(delta) {
  const total = Math.max(1, Math.ceil(catalogState.filteredMaterials.length / catalogState.pageSize));
  catalogState.page = Math.min(total, Math.max(1, catalogState.page + delta));
  renderMaterials();
}

function updateCatalogPageIndicator() {
  const total = Math.max(1, Math.ceil(catalogState.filteredMaterials.length / catalogState.pageSize));
  const text = t("catalog.page")
    .replace("{current}", catalogState.page)
    .replace("{total}", total);
  refs.pageIndicator.textContent = text;
  refs.catalogPrev.disabled = catalogState.page === 1;
  refs.catalogNext.disabled = catalogState.page === total;
}

function filterMaterials(keyword) {
  const term = keyword.trim().toLowerCase();
  if (!term) {
    catalogState.filteredMaterials = [...state.materials];
  } else {
    catalogState.filteredMaterials = state.materials.filter((name) => {
      // 搜索原始名称和翻译名称
      const originalName = name.toLowerCase();
      const translatedName = getMaterialName(name).toLowerCase();
      return originalName.includes(term) || translatedName.includes(term);
    });
  }
  catalogState.page = 1;
  renderMaterials();
}

function toggleMaterial(name) {
  if (state.selectedMaterials.has(name)) {
    state.selectedMaterials.delete(name);
  } else {
    state.selectedMaterials.add(name);
  }
  persistSelection();
  renderMaterials();
  updatePlan();
  
  // 全局按鈕追蹤已由 site.js 處理，無需手動調用
}

function persistSelection() {
  localStorage.setItem(STORAGE_KEYS.selected, JSON.stringify([...state.selectedMaterials]));
  refs.clearSelection.disabled = state.selectedMaterials.size === 0;
}

function updatePlan() {
  if (state.selectedMaterials.size === 0) {
    refs.planSummary.textContent = t("plan.empty");
    refs.stageList.innerHTML = "";
    refs.planWarning.hidden = true;
    return;
  }

  const selected = [...state.selectedMaterials];
  const plan = computeMinimumStages(selected);

  const totalStages = plan.length;

  const summaryTemplate = t("plan.summary");
  refs.planSummary.textContent = summaryTemplate.replace("{stages}", totalStages);

  const warning = t("plan.warning");
  const missing = selected.filter((material) => !plan.some((stage) => (state.stages[stage] || []).includes(material)));
  if (missing.length > 0) {
    refs.planWarning.hidden = false;
    refs.planWarning.textContent = warning.replace("{count}", missing.length);
  } else {
    refs.planWarning.hidden = true;
  }

  // 按關卡順序排序
  const sortedPlan = [...plan].sort((a, b) => stageComparator(a, b));

  // Clear existing content safely
  while (refs.stageList.firstChild) {
    refs.stageList.removeChild(refs.stageList.firstChild);
  }
  
  for (const stage of sortedPlan) {
    const li = document.createElement("li");

    const header = document.createElement("div");
    header.className = "stage-header";
    
    // Create stage name span
    const stageNameSpan = document.createElement("span");
    stageNameSpan.textContent = stage;
    header.appendChild(stageNameSpan);
    
    // Create energy info span
    const energySpan = document.createElement("span");
    energySpan.textContent = t("plan.energyPerStage").replace("{energy}", "10");
    header.appendChild(energySpan);

    const materials = document.createElement("div");
    materials.className = "stage-materials";

    const drops = state.stages[stage] || [];
    for (const material of drops) {
      if (!state.selectedMaterials.has(material)) continue;
      const chip = document.createElement("div");
      chip.className = "material-chip";
      
      const chipImg = document.createElement("img");
      // 使用懶加載圖片
      if ('loading' in HTMLImageElement.prototype) {
        chipImg.loading = 'lazy';
      }
      chipImg.src = getMaterialImagePath(material);
      chipImg.alt = getMaterialName(material);
      // 如果图片加载失败，使用占位符
      chipImg.onerror = () => {
        chipImg.src = PLACEHOLDER_IMG;
      };
      
      const chipLabel = document.createElement("span");
      chipLabel.textContent = getMaterialName(material);
      
      chip.appendChild(chipImg);
      chip.appendChild(chipLabel);
      chip.addEventListener("click", () => {
        toggleMaterial(material);
      });
      
      // 只在非觸控設備上添加 tooltip 事件
      if (!isTouchDevice() && refs.tooltip) {
        chip.addEventListener("mouseenter", (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top;
          showTooltip(getMaterialName(material), x, y);
        });
        
        chip.addEventListener("mousemove", (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top;
          showTooltip(getMaterialName(material), x, y);
        });
        
        chip.addEventListener("mouseleave", () => {
          hideTooltip();
        });
      }
      
      materials.appendChild(chip);
    }

    li.appendChild(header);
    li.appendChild(materials);
    refs.stageList.appendChild(li);
  }
}

function computeMinimumStages(selected) {
  const remaining = new Set(selected);
  const chosenStages = [];

  const stagesEntries = Object.entries(state.stages).sort(([a], [b]) => stageComparator(a, b));

  while (remaining.size > 0) {
    let bestStage = null;
    let bestCover = 0;

    for (const [stage, materials] of stagesEntries) {
      const cover = materials.filter((m) => remaining.has(m)).length;
      if (cover > bestCover) {
        bestCover = cover;
        bestStage = stage;
      }
    }

    if (!bestStage) break;

    chosenStages.push(bestStage);

    for (const material of state.stages[bestStage]) {
      remaining.delete(material);
    }
  }

  return chosenStages;
}

function stageComparator(a, b) {
  const [aChapter, aStage] = a.split("-").map(Number);
  const [bChapter, bStage] = b.split("-").map(Number);
  if (aChapter !== bChapter) return aChapter - bChapter;
  return aStage - bStage;
}

// ========== 使用計數器功能已移至 common/usage-counter.js ==========

window.addEventListener("DOMContentLoaded", init);

