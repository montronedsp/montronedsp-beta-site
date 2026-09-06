(function () {
  try {
    var ua = navigator.userAgent || '';
    if (!/Android/i.test(ua) && (/Linux/i.test(navigator.platform || '') || /Linux/i.test(ua))) {
      document.documentElement.classList.add('is-linux');
    }
  } catch (e) {}

  var STORAGE_KEY = 'montronedsp.lang';
  var LOCALES = [
    { code: 'en', label: 'English' },
    { code: 'it', label: 'Italiano' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'ja', label: '日本語' },
    { code: 'zh-CN', label: '中文' },
    { code: 'ru', label: 'Русский' },
    { code: 'uk', label: 'Українська' }
  ];

  var MANUAL_HREF = {
    en: 'martello-manual.html',
    it: 'martello-manual-it.html',
    de: 'martello-manual-de.html',
    es: 'martello-manual-es.html',
    fr: 'martello-manual-fr.html',
    ja: 'martello-manual-ja.html',
    'zh-CN': 'martello-manual-zh-CN.html',
    ru: 'martello-manual-ru.html',
    uk: 'martello-manual-uk.html'
  };

  var SWARA_MANUAL_HREF = {
    en: 'swara-xt-manual.html',
    it: 'swara-xt-manual.html',
    de: 'swara-xt-manual.html',
    es: 'swara-xt-manual.html',
    fr: 'swara-xt-manual.html',
    ja: 'swara-xt-manual.html',
    'zh-CN': 'swara-xt-manual.html',
    ru: 'swara-xt-manual.html',
    uk: 'swara-xt-manual.html'
  };

  var cache = Object.create(null);
  var current = 'en';
  var catalog = null;
  var fallback = null;
  var listeners = [];

  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function withYear(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/\{year\}/g, String(new Date().getFullYear()));
  }

  function t(path) {
    var value = getByPath(catalog, path);
    if (value == null) value = getByPath(fallback, path);
    return typeof value === 'string' ? withYear(value) : '';
  }

  function supported(code) {
    return LOCALES.some(function (locale) {
      return locale.code === code;
    });
  }

  function normalize(code) {
    if (!code) return null;
    var raw = String(code).replace('_', '-');
    if (supported(raw)) return raw;
    var lower = raw.toLowerCase();
    if (lower === 'zh' || lower.indexOf('zh-cn') === 0 || lower.indexOf('zh-hans') === 0) {
      return 'zh-CN';
    }
    var base = lower.split('-')[0];
    for (var i = 0; i < LOCALES.length; i++) {
      if (LOCALES[i].code.toLowerCase() === base) return LOCALES[i].code;
      if (LOCALES[i].code.toLowerCase().split('-')[0] === base) return LOCALES[i].code;
    }
    return null;
  }

  function detect() {
    try {
      var params = new URLSearchParams(window.location.search);
      var fromQuery = normalize(params.get('lang'));
      if (fromQuery) return fromQuery;
    } catch (e) {}

    try {
      var stored = normalize(localStorage.getItem(STORAGE_KEY));
      if (stored) return stored;
    } catch (e2) {}

    var nav = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage];
    for (var i = 0; i < nav.length; i++) {
      var match = normalize(nav[i]);
      if (match) return match;
    }
    return 'en';
  }

  function loadLocale(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    return fetch('locales/' + code + '.json', { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('locale ' + code + ' missing');
        return res.arrayBuffer();
      })
      .then(function (buf) {
        var text = new TextDecoder('utf-8').decode(buf);
        return JSON.parse(text);
      })
      .then(function (json) {
        cache[code] = json;
        return json;
      });
  }

  function applyDocument() {
    document.documentElement.lang = current;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = t(key);
      if (!value) return;
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n-aria'));
      if (value) el.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n-alt'));
      if (value) el.setAttribute('alt', value);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n-title'));
      if (value) el.setAttribute('title', value);
    });

    document.querySelectorAll('[data-i18n-manual]').forEach(function (el) {
      el.setAttribute('href', MANUAL_HREF[current] || MANUAL_HREF.en);
    });

    document.querySelectorAll('[data-i18n-swara-manual]').forEach(function (el) {
      el.setAttribute('href', SWARA_MANUAL_HREF[current] || SWARA_MANUAL_HREF.en);
    });

    var page = document.documentElement.getAttribute('data-i18n-page');
    var pageMeta = page ? getByPath(catalog, page + '.meta') || getByPath(fallback, page + '.meta') : null;
    var meta = pageMeta || getByPath(catalog, 'meta') || getByPath(fallback, 'meta') || {};
    if (meta.title) document.title = meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc && meta.description) desc.setAttribute('content', meta.description);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && (meta.ogTitle || meta.title)) ogTitle.setAttribute('content', meta.ogTitle || meta.title);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && (meta.ogDescription || meta.description)) {
      ogDesc.setAttribute('content', meta.ogDescription || meta.description);
    }
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle && (meta.ogTitle || meta.title)) twTitle.setAttribute('content', meta.ogTitle || meta.title);
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && (meta.ogDescription || meta.description)) {
      twDesc.setAttribute('content', meta.ogDescription || meta.description);
    }

    var select = document.querySelector('.site-lang-select');
    if (select && select.value !== current) select.value = current;
  }

  function notify() {
    listeners.forEach(function (fn) {
      try {
        fn(current);
      } catch (e) {}
    });
    document.dispatchEvent(
      new CustomEvent('montronedsp:localechange', { detail: { lang: current } })
    );
  }

  function setLang(code, options) {
    var next = normalize(code) || 'en';
    var opts = options || {};
    var chain = Promise.resolve();

    if (!fallback) {
      chain = loadLocale('en').then(function (json) {
        fallback = json;
        cache.en = json;
      });
    }

    return chain
      .then(function () {
        return loadLocale(next).catch(function () {
          next = 'en';
          return loadLocale('en');
        });
      })
      .then(function (json) {
        catalog = json;
        current = next;
        try {
          localStorage.setItem(STORAGE_KEY, current);
        } catch (e) {}
        if (!opts.skipUrl) {
          try {
            var url = new URL(window.location.href);
            if (current === 'en') url.searchParams.delete('lang');
            else url.searchParams.set('lang', current);
            window.history.replaceState({}, '', url);
          } catch (e2) {}
        }
        applyDocument();
        notify();
        return current;
      });
  }

  function fillSelect(select) {
    if (!select) return;
    select.innerHTML = '';
    LOCALES.forEach(function (locale) {
      var option = document.createElement('option');
      option.value = locale.code;
      option.textContent = locale.label;
      select.appendChild(option);
    });
    select.value = current;
    select.addEventListener('change', function () {
      setLang(select.value);
    });
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  window.MontroneI18n = {
    locales: LOCALES,
    manualHref: MANUAL_HREF,
    swaraManualHref: SWARA_MANUAL_HREF,
    t: t,
    getLang: function () {
      return current;
    },
    setLang: setLang,
    onChange: onChange,
    ready: null
  };

  window.MontroneI18n.ready = setLang(detect(), { skipUrl: false }).then(function () {
    fillSelect(document.querySelector('.site-lang-select'));
    return current;
  });
})();
