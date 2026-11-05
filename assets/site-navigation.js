/* Compact site navigation: keyboard and pointer accessible. */
(function () {
  'use strict';
  const header = document.querySelector('.site-header');
  const toggle = header && header.querySelector('[data-site-menu-toggle]');
  const panel = header && header.querySelector('[data-site-mobile-menu]');
  if (!toggle || !panel) return;

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('nav-open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('click', function (event) {
    if (event.target.closest('a[href]')) setOpen(false);
  });

  document.addEventListener('pointerdown', function (event) {
    if (!panel.hidden && !header.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1240 && !panel.hidden) setOpen(false);
  });
})();
