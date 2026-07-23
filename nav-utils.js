/* =============================================
   FLUFFY — Shared Mobile Nav Toggle
   ============================================= */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.querySelector('.mobile-nav');
    const closeBtn = document.querySelector('.mobile-nav-close, .mobile-close');
    const overlay = document.getElementById('mobileOverlay');

    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        nav.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    function closeNav() {
      if (nav) nav.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (overlay) overlay.addEventListener('click', closeNav);
  });
})();
