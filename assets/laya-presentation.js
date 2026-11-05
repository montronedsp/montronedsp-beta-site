/* Preserve the selected product while navigating its editorial chapters. */
(function () {
  document.querySelectorAll('[data-laya-jump]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const target = document.getElementById(link.dataset.layaJump);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();
