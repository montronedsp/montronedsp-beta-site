/* MX2-only in-page navigation preserves the product-selection URL hash. */
(function () {
  document.querySelectorAll('[data-mx2-jump]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const target = document.getElementById(link.dataset.mx2Jump);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();
