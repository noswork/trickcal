/**
 * Trickcal 共用語言選擇器模組
 * 提供跨頁面一致的語言切換下拉選單行為
 */
(function () {
  if (window.TrickcalLanguageSelector) return;

  const {
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    getSavedLanguage,
    setSavedLanguage,
    isSupported
  } = window.TrickcalLocales;

  const SELECTOR_CLASS = 'language-selector';

  function resolveLanguage(lang) {
    return isSupported(lang) ? lang : DEFAULT_LANGUAGE;
  }

  function render(containers, config = {}) {
    if (!containers) return;

    const elements = toArray(containers);
    if (!elements.length) return;

    const currentLang = resolveLanguage(config.currentLang || getSavedLanguage());

    elements.forEach((container) => {
      if (!container) return;

      container.innerHTML = buildTemplate(currentLang);
      const selector = container.querySelector(`.${SELECTOR_CLASS}`);
      if (!selector) return;

      selector.dataset.currentLang = currentLang;
      bindEvents(selector, {
        persistSelection: config.persistSelection !== false,
        onChange: config.onChange
      });
    });
  }

  function buildTemplate(lang) {
    const displayLang = resolveLanguage(lang);
    return `
      <div class="${SELECTOR_CLASS}" data-open="false" data-current-lang="${displayLang}">
        <button class="language-toggle" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span class="language-label">${SUPPORTED_LANGUAGES[displayLang]}</span>
          <span class="language-caret">▾</span>
        </button>
        <ul class="language-menu" role="listbox">
          ${Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => `
            <li role="option" data-lang="${code}" aria-selected="${code === displayLang}">${name}</li>
          `).join('')}
        </ul>
      </div>`;
  }

  function bindEvents(selector, config) {
    const toggle = selector.querySelector('.language-toggle');
    const menu = selector.querySelector('.language-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = selector.getAttribute('data-open') === 'true';
      setOpen(selector, !isOpen);
    });

    menu.querySelectorAll('[data-lang]').forEach((option) => {
      option.addEventListener('click', (event) => {
        event.stopPropagation();
        const lang = option.dataset.lang;
        handleSelect(selector, lang, config);
      });
    });
  }

  function handleSelect(selector, lang, config) {
    const normalized = resolveLanguage(lang);
    const current = selector.dataset.currentLang;
    if (normalized === current) {
      setOpen(selector, false);
      return;
    }

    selector.dataset.currentLang = normalized;

    if (config.persistSelection) {
      setSavedLanguage(normalized);
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: normalized } }));
    }

    if (typeof config.onChange === 'function') {
      config.onChange(normalized);
    }

    updateDisplay(selector, normalized);
    setOpen(selector, false);
  }

  function updateDisplay(selector, lang) {
    const label = selector.querySelector('.language-label');
    if (label) {
      label.textContent = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
    }

    selector.querySelectorAll('[data-lang]').forEach((option) => {
      option.setAttribute('aria-selected', option.dataset.lang === lang ? 'true' : 'false');
    });
  }

  function setOpen(selector, open) {
    selector.setAttribute('data-open', open.toString());
    const toggle = selector.querySelector('.language-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', open.toString());
    }
  }

  function toArray(containers) {
    if (Array.isArray(containers)) return containers;
    if (containers instanceof NodeList || containers instanceof HTMLCollection) {
      return Array.from(containers);
    }
    return [containers];
  }

  function closeAllExcept(target) {
    document.querySelectorAll(`.${SELECTOR_CLASS}[data-open="true"]`).forEach((selector) => {
      if (target && selector.contains(target)) return;
      setOpen(selector, false);
    });
  }

  document.addEventListener('click', (event) => {
    closeAllExcept(event.target);
  });

  window.addEventListener('languageChanged', (event) => {
    const lang = resolveLanguage(event.detail?.language || getSavedLanguage());
    document.querySelectorAll(`.${SELECTOR_CLASS}`).forEach((selector) => {
      selector.dataset.currentLang = lang;
      updateDisplay(selector, lang);
    });
  });

  window.TrickcalLanguageSelector = {
    render
  };
})();


