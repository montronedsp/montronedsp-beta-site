(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const martelloAudioPlayers = document.querySelectorAll('.martello-audio-examples .martello-audio-player');
  martelloAudioPlayers.forEach(function (player) {
    player.addEventListener('play', function () {
      martelloAudioPlayers.forEach(function (other) {
        if (other !== player) {
          other.pause();
        }
      });
    });
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealRoots = document.querySelectorAll('.plugin-story[data-product-only="martello"] > section, .plugin-story[data-product-only="martello"] > div');
  if (!reduceMotion && 'IntersectionObserver' in window && revealRoots.length) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealRoots.forEach(function (node, index) {
      node.classList.add('js-reveal');
      node.style.transitionDelay = Math.min(index * 40, 160) + 'ms';
      revealObserver.observe(node);
    });
  }

  const feedbackCarousels = document.querySelectorAll('[data-feedback-carousel]');
  feedbackCarousels.forEach(function (carousel) {
    const track = carousel.querySelector('[data-feedback-track]');
    const slides = carousel.querySelectorAll('[data-feedback-slide]');
    const prevBtn = carousel.querySelector('[data-feedback-prev]');
    const nextBtn = carousel.querySelector('[data-feedback-next]');
    const dotsContainer = carousel.querySelector('[data-feedback-dots]');
    const controls = carousel.querySelector('[data-feedback-controls]');

    if (!track || !slides.length) return;

    if (controls) controls.hidden = true;

    slides.forEach(function (slide) {
      slide.setAttribute('aria-hidden', 'false');
      slide.removeAttribute('aria-roledescription');
    });
    return;
  });

  function initProductSkinCarousel(root, productId, slideSelector, tabSelector) {
    if (!root) return;
    const slides = Array.from(root.querySelectorAll(slideSelector));
    const tabs = Array.from(root.querySelectorAll(tabSelector));
    if (!slides.length || !tabs.length) return;

    const AUTO_MS = 4200;
    let index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));
    let timer = null;
    let paused = false;

    function isProductActive() {
      return document.documentElement.dataset.product === productId;
    }

    function showSkin(nextIndex, userDriven) {
      if (!slides.length) return;
      index = ((nextIndex % slides.length) + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      tabs.forEach(function (tab, i) {
        const active = i === index;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
      });

      if (userDriven) restartTimer();
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function restartTimer() {
      stopTimer();
      if (reduceMotion || paused || !isProductActive() || slides.length < 2) return;
      timer = window.setInterval(function () {
        showSkin(index + 1, false);
      }, AUTO_MS);
    }

    function syncPlayback() {
      if (isProductActive() && !paused) restartTimer();
      else stopTimer();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        showSkin(i, true);
      });
    });

    root.addEventListener('mouseenter', function () {
      paused = true;
      stopTimer();
    });
    root.addEventListener('mouseleave', function () {
      paused = false;
      syncPlayback();
    });
    root.addEventListener('focusin', function () {
      paused = true;
      stopTimer();
    });
    root.addEventListener('focusout', function (event) {
      if (root.contains(event.relatedTarget)) return;
      paused = false;
      syncPlayback();
    });

    const productObserver = new MutationObserver(syncPlayback);
    productObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-product']
    });

    showSkin(index, false);
    syncPlayback();
  }

  initProductSkinCarousel(
    document.querySelector('[data-swara-skins]'),
    'swara',
    '.swara-skin-slide',
    '[data-skin-tab]'
  );
  initProductSkinCarousel(
    document.querySelector('[data-martello-skins]'),
    'martello',
    '.martello-skin-slide',
    '[data-skin-tab]'
  );
})();

(function initSwaraLicenseAcceptance() {
  const STORAGE_KEY = 'montronedsp.swara.gpl3.accepted';
  const checkboxes = Array.from(document.querySelectorAll('[data-swara-license-accept]'));
  const downloads = Array.from(document.querySelectorAll('[data-swara-linux-download]'));
  if (!checkboxes.length || !downloads.length) return;

  function setEnabled(enabled) {
    downloads.forEach(function (link) {
      if (enabled) {
        link.classList.remove('btn-disabled');
        link.removeAttribute('aria-disabled');
        link.removeAttribute('tabindex');
      } else {
        link.classList.add('btn-disabled');
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('tabindex', '-1');
      }
    });
  }

  function syncFromCheckboxes(source) {
    const accepted = checkboxes.some(function (cb) { return cb.checked; });
    setEnabled(accepted);
    checkboxes.forEach(function (cb) {
      if (cb !== source) cb.checked = accepted;
    });
    try {
      if (accepted) sessionStorage.setItem(STORAGE_KEY, '1');
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }

  let restored = false;
  try {
    restored = sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch (_) {}
  if (restored) {
    checkboxes.forEach(function (cb) { cb.checked = true; });
    setEnabled(true);
  } else {
    setEnabled(false);
  }

  checkboxes.forEach(function (cb) {
    cb.addEventListener('change', function () {
      syncFromCheckboxes(cb);
    });
  });
})();

(function initSwaraLicensePage() {
  if (document.documentElement.getAttribute('data-i18n-page') !== 'swaraLicense') return;
  const blocks = document.querySelectorAll('[data-license-src]');
  blocks.forEach(function (el) {
    const src = el.getAttribute('data-license-src');
    if (!src) return;
    fetch(src)
      .then(function (res) {
        if (!res.ok) throw new Error('fetch failed');
        return res.text();
      })
      .then(function (text) {
        el.textContent = text;
        el.removeAttribute('aria-busy');
      })
      .catch(function () {
        el.textContent = '';
        el.removeAttribute('aria-busy');
        const fallback = document.createElement('p');
        fallback.className = 'license-fetch-fallback';
        fallback.innerHTML = 'Could not load this document. <a href="' + src + '">Open the text file</a>.';
        el.parentNode.insertBefore(fallback, el.nextSibling);
      });
  });
})();
