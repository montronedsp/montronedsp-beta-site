(function () {
  const MOBILE_WHEEL_PRODUCTS = ['martello', 'aurashimmer', 'swara'];
  const DESKTOP_PUBLIC_PRODUCTS = ['martello', 'aurashimmer', 'swara'];
  const LOCALHOST_PRODUCTS = ['martello', 'membrana', 'aurashimmer', 'swara', 'laya', 'galleria'];
  const isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const VALID_PRODUCTS = isLocalHost ? LOCALHOST_PRODUCTS.slice() : DESKTOP_PUBLIC_PRODUCTS.slice();
  const WHEEL_PRODUCTS = isLocalHost ? LOCALHOST_PRODUCTS.slice() : MOBILE_WHEEL_PRODUCTS.slice();
  const DESKTOP_PRODUCTS = isLocalHost ? LOCALHOST_PRODUCTS.slice() : DESKTOP_PUBLIC_PRODUCTS.slice();
  const PRODUCT_ORDER = VALID_PRODUCTS.slice();
  const DEFAULT_PRODUCT = 'aurashimmer';
  const SWITCH_OUT_MS = 160;
  const REVEAL_MS = 220;
  const MOBILE_WHEEL_QUERY = '(max-width: 768px)';
  const root = document.documentElement;
  const body = document.body;
  const controls = Array.from(document.querySelectorAll('[data-product-control]'));
  const panels = Array.from(document.querySelectorAll('[data-hero-panel]'));
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const wheel = document.getElementById('product-wheel');
  const wheelTrigger = document.getElementById('product-wheel-trigger');
  const wheelStage = wheel ? wheel.querySelector('.product-wheel-stage') : null;
  const wheelBackdrop = wheel ? wheel.querySelector('.product-wheel-backdrop') : null;
  const wheelSegments = wheel ? Array.from(wheel.querySelectorAll('.product-wheel-segment')) : [];
  const wheelWedges = wheel ? Array.from(wheel.querySelectorAll('[data-wheel-wedge]')) : [];
  const wheelHubName = wheel ? wheel.querySelector('[data-wheel-hub-name]') : null;
  const wheelHubType = wheel ? wheel.querySelector('[data-wheel-hub-type]') : null;
  const wheelTriggerName = document.querySelector('[data-wheel-trigger-name]');
  const desktopSelector = document.querySelector('[data-product-selector-desktop]');
  const desktopSelectorTrigger = document.querySelector('[data-desktop-selector-trigger]');
  const desktopSelectorPanel = desktopSelector ? desktopSelector.querySelector('.product-selector-desktop-panel') : null;
  const desktopSelectorName = document.querySelector('[data-desktop-selector-name]');
  const desktopSelectorType = document.querySelector('[data-desktop-selector-type]');
  const mobileWheelQuery = window.matchMedia(MOBILE_WHEEL_QUERY);
  let switching = false;
  let pendingRequest = null;
  let switchTimers = [];
  let wheelOpen = false;
  let desktopSelectorOpen = false;
  let wheelPreviewProduct = null;
  let suppressBackdropClose = false;
  let wheelRestoreFocus = null;

  const isHubPage = Boolean(document.getElementById('hero-panel-martello'));

  if (!controls.length && !wheel) return;

  if (isLocalHost) {
    root.classList.add('is-local-host');
  }

  controls.forEach(function (control) {
    const surface = control.dataset.productSurface || 'desktop';
    const products = surface === 'wheel' ? WHEEL_PRODUCTS : DESKTOP_PRODUCTS;
    control.hidden = !products.includes(control.dataset.product);
  });

  wheelSegments.forEach(function (segment) {
    segment.hidden = !WHEEL_PRODUCTS.includes(segment.dataset.product);
  });

  wheelWedges.forEach(function (wedge) {
    if (wedge.dataset.wheelWedge) {
      wedge.hidden = !WHEEL_PRODUCTS.includes(wedge.dataset.wheelWedge);
    }
  });

  const productMeta = {
    martello: { name: 'Martello', type: 'Drum Synthesizer' },
    aurashimmer: { name: 'Aura Shimmer', type: 'Reverb' },
    swara: { name: 'Swara XT', type: 'Hybrid Monosynth' },
    galleria: { name: 'Galleria', type: 'Environmental Processor' },
    membrana: { name: 'Membrana', type: 'Multimodal Synth' },
    laya: { name: 'Laya', type: 'Performance Drum' }
  };

  function refreshProductMetaFromI18n() {
    const i18n = window.MontroneI18n;
    if (!i18n || typeof i18n.t !== 'function') return;
    const martelloType = i18n.t('products.martello.type');
    const aurashimmerType = i18n.t('products.aurashimmer.type');
    const swaraType = i18n.t('products.swara.type');
    const galleriaType = i18n.t('products.galleria.type');
    const membranaType = i18n.t('products.membrana.type');
    const layaType = i18n.t('products.laya.type');
    if (martelloType) productMeta.martello.type = martelloType;
    if (aurashimmerType) productMeta.aurashimmer.type = aurashimmerType;
    if (swaraType) productMeta.swara.type = swaraType;
    if (galleriaType) productMeta.galleria.type = galleriaType;
    if (membranaType) productMeta.membrana.type = membranaType;
    if (layaType) productMeta.laya.type = layaType;
  }

  refreshProductMetaFromI18n();
  if (window.MontroneI18n && typeof window.MontroneI18n.onChange === 'function') {
    window.MontroneI18n.onChange(function () {
      refreshProductMetaFromI18n();
      updateWheelChrome(getCurrentProduct(), wheelPreviewProduct);
      updateDesktopChrome(getCurrentProduct());
    });
  }

  function normalizeProduct(product) {
    return VALID_PRODUCTS.includes(product) ? product : DEFAULT_PRODUCT;
  }

  function getCurrentProduct() {
    if (isHubPage) {
      return normalizeProduct(root.dataset.product || DEFAULT_PRODUCT);
    }

    const standalone = root.dataset.product;
    return productMeta[standalone] ? standalone : DEFAULT_PRODUCT;
  }

  function productDestination(product) {
    if (!isHubPage) {
      const destination = new URL('./', window.location.href);
      destination.search = window.location.search;
      destination.hash = product;
      return destination.href;
    }
    return null;
  }

  function updateHistory(product, mode) {
    if (mode === 'push') history.pushState({ product: product }, '', '#' + product);
    if (mode === 'replace') history.replaceState({ product: product }, '', '#' + product);
  }

  function requestProduct(product, options) {
    const opts = options || {};
    const nextProduct = normalizeProduct(product);

    const destination = productDestination(nextProduct);
    if (destination) {
      window.location.href = destination;
      return;
    }

    if (nextProduct === getCurrentProduct() && !switching) return;
    if (switching) {
      pendingRequest = { product: nextProduct, options: opts };
      return;
    }
    applyProduct(nextProduct, opts);
  }

  function switchDirection(fromProduct, toProduct) {
    const from = normalizeProduct(fromProduct);
    const to = normalizeProduct(toProduct);
    if (from === to) return 'forward';
    const fromIndex = PRODUCT_ORDER.indexOf(from);
    const toIndex = PRODUCT_ORDER.indexOf(to);
    return toIndex > fromIndex ? 'forward' : 'backward';
  }

  function setThemeColor(product) {
    if (!themeMeta) return;
    const colors = {
      martello: '#12080a',
      aurashimmer: '#120818',
      swara: '#080c12',
      galleria: '#080808',
      membrana: '#0a0812',
      laya: '#080c12'
    };
    themeMeta.setAttribute('content', colors[product] || colors.martello);
  }

  function updateDesktopChrome(currentProduct) {
    if (!desktopSelector) return;
    const meta = productMeta[currentProduct] || productMeta.martello;
    if (desktopSelectorName) desktopSelectorName.textContent = meta.name;
    if (desktopSelectorType) desktopSelectorType.textContent = meta.type;
  }

  function updateWheelChrome(currentProduct, previewProduct) {
    if (!wheel) return;

    const preview = previewProduct || currentProduct;
    const currentMeta = productMeta[currentProduct] || productMeta.martello;
    const previewMeta = productMeta[preview] || productMeta.martello;

    wheelSegments.forEach(function (segment) {
      const segmentProduct = segment.dataset.product;
      segment.classList.toggle('is-active', segmentProduct === currentProduct);
      segment.classList.toggle('is-highlighted', segmentProduct === preview);
    });

    wheelWedges.forEach(function (wedge) {
      wedge.classList.toggle('is-highlighted', wedge.dataset.wheelWedge === preview);
    });

    if (wheelHubName) wheelHubName.textContent = previewMeta.name;
    if (wheelHubType) wheelHubType.textContent = previewMeta.type;
    if (wheelTriggerName) wheelTriggerName.textContent = currentMeta.name;
  }

  function updateTabs(product) {
    controls.forEach(function (control) {
      const isActive = control.dataset.product === product;
      control.classList.toggle('is-active', isActive);
      if (control.getAttribute('role') === 'tab' || control.getAttribute('role') === 'option') {
        control.setAttribute('aria-selected', isActive ? 'true' : 'false');
        control.tabIndex = isActive ? 0 : -1;
      }
    });
    updateWheelChrome(product);
    updateDesktopChrome(product);
  }

  function updatePanels(product) {
    panels.forEach(function (panel) {
      const isActive = panel.dataset.heroPanel === product;
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  window.matchMedia('(min-width: 769px)').addEventListener('change', function () {
    setThemeColor(getCurrentProduct());
  });

  function updateLogos(product) {
    const nextProduct = normalizeProduct(product);
    const useCrispLockup = root.classList.contains('is-linux') || window.matchMedia('(max-width: 960px)').matches;
    const hasMobileVariant = Array.from(document.querySelectorAll('.brand-logo-variant[data-logo]')).some(function (logo) {
      return logo.dataset.logo === nextProduct && logo.classList.contains('brand-logo--mobile');
    });

    document.querySelectorAll('.brand-logo-variant[data-logo]').forEach(function (logo) {
      const isCurrentProduct = logo.dataset.logo === nextProduct;
      const isMobileVariant = logo.classList.contains('brand-logo--mobile');
      const isActive = isCurrentProduct && (useCrispLockup ? (hasMobileVariant ? isMobileVariant : !isMobileVariant) : !isMobileVariant);

      logo.classList.toggle('is-active', isActive);
      logo.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  function clearSwitchClasses() {
    switchTimers.forEach(function (timer) { window.clearTimeout(timer); });
    switchTimers = [];
    root.classList.remove(
      'theme-animating',
      'product-switch-out',
      'product-switch-in',
      'product-reveal'
    );
    body.classList.remove('product-switching');
    root.removeAttribute('data-switch-direction');
    switching = false;
  }

  function finishProductSwitch() {
    root.classList.remove('product-reveal', 'theme-animating');
    body.classList.remove('product-switching');
    root.removeAttribute('data-switch-direction');
    switching = false;
    restoreMobileViewport();
    if (pendingRequest) {
      const nextRequest = pendingRequest;
      pendingRequest = null;
      if (nextRequest.product !== getCurrentProduct()) requestProduct(nextRequest.product, nextRequest.options);
    }
  }

  function applyProductImmediate(product) {
    const nextProduct = normalizeProduct(product);
    const previousProduct = getCurrentProduct();
    clearSwitchClasses();
    root.dataset.product = nextProduct;
    if (isHubPage && previousProduct !== nextProduct) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    updateTabs(nextProduct);
    updatePanels(nextProduct);
    updateLogos(nextProduct);
    setThemeColor(nextProduct);
    restoreMobileViewport();
    root.classList.add('product-booted');
  }

  function applyProduct(product, options) {
    const opts = options || {};
    const nextProduct = normalizeProduct(product);
    const currentProduct = getCurrentProduct();

    if (!isHubPage) {
      requestProduct(product, opts);
      return;
    }

    if (nextProduct === currentProduct && !opts.force) return;

    if (opts.skipAnimation) {
      updateHistory(nextProduct, opts.historyMode);
      applyProductImmediate(nextProduct);
      return;
    }

    updateHistory(nextProduct, opts.historyMode);
    if (isHubPage && nextProduct !== currentProduct) {
      window.scrollTo({ top: 0, behavior: opts.skipAnimation ? 'auto' : 'smooth' });
    }
    switching = true;

    const direction = switchDirection(currentProduct, nextProduct);
    root.dataset.switchDirection = direction;
    body.classList.add('product-switching');
    root.classList.add('theme-animating', 'product-switch-out');

    switchTimers.push(window.setTimeout(function () {
      root.dataset.product = nextProduct;
      updateTabs(nextProduct);
      updatePanels(nextProduct);
      updateLogos(nextProduct);
      setThemeColor(nextProduct);
      restoreMobileViewport();

      root.classList.remove('product-switch-out');
      root.classList.add('product-switch-in');

      switchTimers.push(window.setTimeout(function () {
        root.classList.remove('product-switch-in');
        root.classList.add('product-reveal');

        switchTimers.push(window.setTimeout(finishProductSwitch, REVEAL_MS));
      }, 32));
    }, SWITCH_OUT_MS));
  }

  function restoreMobileViewport() {
    if (!mobileWheelQuery.matches) return;
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    const base = 'width=device-width, initial-scale=1';
    meta.setAttribute('content', base + ', maximum-scale=1');
    window.requestAnimationFrame(function () {
      meta.setAttribute('content', base);
    });
  }

  function pointerCoords(event) {
    if (event.touches && event.touches.length) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    if (event.changedTouches && event.changedTouches.length) {
      return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }

  function segmentFromPoint(clientX, clientY) {
    if (!wheelStage) return null;

    const rect = wheelStage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const distance = Math.hypot(dx, dy);

    if (distance < rect.width * 0.12) {
      return wheelPreviewProduct || getCurrentProduct();
    }

    if (distance > rect.width * 0.78) return null;

    /* Top-half fan: Membrana TL, Martello ML, Aura TR, Swara MR. Galleria top-center / Laya upper-right (localhost). */
    if (WHEEL_PRODUCTS.includes('galleria') && dy <= -rect.height * 0.34 && Math.abs(dx) <= rect.width * 0.18) {
      return 'galleria';
    }

    if (dx < 0) {
      if (WHEEL_PRODUCTS.includes('membrana') && dy <= -rect.height * 0.06) return 'membrana';
      return 'martello';
    }

    if (WHEEL_PRODUCTS.includes('laya') && dy <= -rect.height * 0.18 && dx >= rect.width * 0.08 && dx <= rect.width * 0.34) {
      return 'laya';
    }

    if (dy <= -rect.height * 0.06) return 'aurashimmer';
    if (WHEEL_PRODUCTS.includes('swara')) return 'swara';
    return 'aurashimmer';
  }

  function previewAt(event) {
    const coords = pointerCoords(event);
    const preview = segmentFromPoint(coords.x, coords.y);
    if (preview) setWheelPreview(preview);
  }

  function selectSegment(product) {
    setWheelPreview(product);
    closeWheel(true);
  }

  function setWheelPreview(product) {
    wheelPreviewProduct = product;
    updateWheelChrome(getCurrentProduct(), product);
  }

  function openWheel() {
    if (!wheel || !mobileWheelQuery.matches || wheelOpen) return;

    wheelOpen = true;
    wheelRestoreFocus = document.activeElement;
    wheel.classList.add('is-open');
    wheel.setAttribute('aria-hidden', 'false');
    body.classList.add('product-wheel-open');
    const site = document.querySelector('.site');
    if (site) site.inert = true;
    suppressBackdropClose = true;

    window.setTimeout(function () {
      suppressBackdropClose = false;
    }, 350);

    if (wheelTrigger) {
      wheelTrigger.setAttribute('aria-expanded', 'true');
    }

    setWheelPreview(getCurrentProduct());
    const activeSegment = wheelSegments.find(function (segment) {
      return segment.dataset.product === getCurrentProduct() && !segment.hidden;
    });
    if (activeSegment) activeSegment.focus();
  }

  function closeWheel(applySelection) {
    if (!wheel || !wheelOpen) return;

    const currentProduct = getCurrentProduct();
    const chosenProduct = applySelection ? (wheelPreviewProduct || currentProduct) : currentProduct;

    wheelOpen = false;
    wheel.classList.remove('is-open');
    wheel.setAttribute('aria-hidden', 'true');
    body.classList.remove('product-wheel-open');
    const site = document.querySelector('.site');
    if (site) site.inert = false;

    if (wheelTrigger) {
      wheelTrigger.setAttribute('aria-expanded', 'false');
    }

    wheelPreviewProduct = null;
    updateWheelChrome(currentProduct);

    if (applySelection && chosenProduct !== currentProduct) {
      requestProduct(chosenProduct, { historyMode: 'push' });
    }

    const focusTarget = wheelRestoreFocus || wheelTrigger;
    wheelRestoreFocus = null;
    if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
  }

  function closeDesktopSelector() {
    if (!desktopSelector || !desktopSelectorOpen) return;
    desktopSelectorOpen = false;
    desktopSelector.classList.remove('is-open');
    if (desktopSelectorTrigger) desktopSelectorTrigger.setAttribute('aria-expanded', 'false');
    if (desktopSelectorPanel) desktopSelectorPanel.hidden = true;
  }

  function openDesktopSelector() {
    if (!desktopSelector || !desktopSelectorTrigger || !desktopSelectorPanel || desktopSelectorOpen) return;
    if (mobileWheelQuery.matches) return;
    desktopSelectorOpen = true;
    desktopSelector.classList.add('is-open');
    desktopSelectorTrigger.setAttribute('aria-expanded', 'true');
    desktopSelectorPanel.hidden = false;
    const activeOption = Array.from(desktopSelectorPanel.querySelectorAll('[data-product-control]')).find(function (option) {
      return option.dataset.product === getCurrentProduct() && !option.hidden;
    });
    if (activeOption) activeOption.focus();
  }

  function toggleDesktopSelector() {
    if (desktopSelectorOpen) closeDesktopSelector();
    else openDesktopSelector();
  }

  function bindDesktopSelector() {
    if (!desktopSelector || !desktopSelectorTrigger || !desktopSelectorPanel) return;

    desktopSelectorTrigger.addEventListener('click', function (event) {
      if (mobileWheelQuery.matches) return;
      event.preventDefault();
      event.stopPropagation();
      toggleDesktopSelector();
    });

    document.addEventListener('click', function (event) {
      if (!desktopSelectorOpen || !desktopSelector.contains(event.target)) closeDesktopSelector();
    });

    document.addEventListener('keydown', function (event) {
      if (!desktopSelectorOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDesktopSelector();
        desktopSelectorTrigger.focus();
      }
    });

    mobileWheelQuery.addEventListener('change', function (event) {
      if (event.matches) closeDesktopSelector();
    });
  }

  function bindWheel() {
    if (!wheel || !wheelTrigger || !wheelStage || !wheelBackdrop) return;

    function openFromTrigger(event) {
      if (!mobileWheelQuery.matches || wheelOpen) return;
      event.preventDefault();
      event.stopPropagation();
      openWheel();
    }

    wheelTrigger.addEventListener('click', openFromTrigger);

    function closeFromBackdrop(event) {
      if (!wheelOpen || suppressBackdropClose) return;
      event.preventDefault();
      closeWheel(false);
    }

    wheelBackdrop.addEventListener('click', closeFromBackdrop);

    wheelStage.addEventListener('touchstart', function (event) {
      if (!wheelOpen) return;
      previewAt(event);
    }, { passive: true });

    wheelStage.addEventListener('touchmove', function (event) {
      if (!wheelOpen) return;
      previewAt(event);
    }, { passive: true });

    wheelStage.addEventListener('pointermove', function (event) {
      if (!wheelOpen) return;
      previewAt(event);
    });

    wheelSegments.forEach(function (segment) {
      function chooseSegment(event) {
        if (!wheelOpen || !mobileWheelQuery.matches) return;
        event.preventDefault();
        event.stopPropagation();
        suppressBackdropClose = true;
        selectSegment(segment.dataset.product);
      }

      segment.addEventListener('click', chooseSegment);
    });

    document.addEventListener('keydown', function (event) {
      if (!wheelOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWheel(false);
        return;
      }
      if (event.key === 'Tab') {
        const focusableSegments = wheelSegments.filter(function (segment) { return !segment.hidden; });
        if (!focusableSegments.length) return;
        const index = focusableSegments.indexOf(document.activeElement);
        const nextIndex = event.shiftKey
          ? (index <= 0 ? focusableSegments.length - 1 : index - 1)
          : (index === focusableSegments.length - 1 ? 0 : index + 1);
        event.preventDefault();
        focusableSegments[nextIndex].focus();
      }
    });

    mobileWheelQuery.addEventListener('change', function (event) {
      if (!event.matches && wheelOpen) closeWheel(false);
    });
  }

  controls.forEach(function (control) {
    control.addEventListener('click', function () {
      if (wheelOpen && mobileWheelQuery.matches) return;
      if (control.dataset.productSurface === 'desktop') closeDesktopSelector();
      requestProduct(control.dataset.product, { historyMode: 'push' });
    });

    control.addEventListener('keydown', function (event) {
      if (control.getAttribute('role') !== 'tab') return;

      const tabControls = controls.filter(function (item) {
        return item.getAttribute('role') === 'tab' && !item.hidden;
      });
      const index = tabControls.indexOf(control);
      if (index < 0) return;

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + direction + tabControls.length) % tabControls.length;
        tabControls[nextIndex].focus();
        requestProduct(tabControls[nextIndex].dataset.product, { historyMode: 'push' });
      }
    });
  });

  bindWheel();
  bindDesktopSelector();

  function productFromLocalQuery() {
    if (!isLocalHost) return null;
    const local = new URLSearchParams(window.location.search).get('local');
    return VALID_PRODUCTS.includes(local) ? local : null;
  }

  function productFromHash() {
    const hash = window.location.hash.replace(/^#/, '');
    if (VALID_PRODUCTS.includes(hash)) return hash;
    return productFromLocalQuery();
  }

  function syncProductFromLocation() {
    const product = productFromHash();
    if (!product) {
      if (window.location.hash) updateHistory(DEFAULT_PRODUCT, 'replace');
      if (getCurrentProduct() !== DEFAULT_PRODUCT) requestProduct(DEFAULT_PRODUCT, { skipAnimation: true });
      return;
    }
    if (product !== getCurrentProduct()) requestProduct(product, { skipAnimation: true });
  }

  if (isHubPage) {
    const requestedProduct = productFromHash();
    const initialProduct = requestedProduct || DEFAULT_PRODUCT;
    if (!requestedProduct && window.location.hash) {
      history.replaceState({ product: initialProduct }, '', '#' + initialProduct);
    }
    applyProduct(initialProduct, { skipAnimation: true, force: true });
    window.addEventListener('popstate', syncProductFromLocation);
    window.addEventListener('hashchange', syncProductFromLocation);
    return;
  }

  const currentProduct = getCurrentProduct();
  setThemeColor(currentProduct);
  updateLogos(currentProduct);
  updateWheelChrome(currentProduct);
  updateDesktopChrome(currentProduct);
  root.classList.add('product-booted');
})();
