/* SWARA-only in-page navigation preserves the product-selection URL hash. */
(function () {
  document.querySelectorAll('[data-swara-jump]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const target = document.getElementById(link.dataset.swaraJump);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
  const gallery = document.querySelector('[data-swara-skins]');
  if (!gallery) return;
  const tabs = Array.from(gallery.querySelectorAll('[data-skin-tab]'));
  tabs.forEach(function (tab, index) {
    tab.id = 'swara-finish-tab-' + tab.dataset.skinTab;
    const slide = gallery.querySelector('[data-skin="' + tab.dataset.skinTab + '"]');
    if (slide) {
      slide.id = 'swara-finish-panel-' + tab.dataset.skinTab;
      slide.setAttribute('role', 'tabpanel');
      slide.setAttribute('aria-labelledby', tab.id);
      tab.setAttribute('aria-controls', slide.id);
    }
    tab.addEventListener('keydown', function (event) {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      tabs[next].click();
    });
  });
})();
