/* Aura-only in-page navigation preserves the product-selection URL hash. */
(function () {
  document.querySelectorAll('[data-aura-jump]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const target = document.getElementById(link.dataset.auraJump);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();