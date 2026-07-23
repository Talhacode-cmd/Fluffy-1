/* =============================================
   FLUFFY — Shared Badge Updater
   Keeps cart & wishlist badge counts accurate on every page
   ============================================= */
(() => {
  'use strict';

  const CART_KEY = 'fluffyCart';
  const WISH_KEY = 'fluffyWishlist';

  function getCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
      return cart.reduce((sum, i) => sum + (i.qty || 1), 0);
    } catch { return 0; }
  }

  function getWishCount() {
    try {
      return JSON.parse(localStorage.getItem(WISH_KEY)) || [];
    } catch { return []; }
  }

  function updateBadges() {
    const cartCount = getCartCount();
    const wishCount = getWishCount().length;

    document.querySelectorAll('.header-icon-btn[aria-label="Cart"] .badge').forEach(b => {
      b.textContent = cartCount;
    });
    document.querySelectorAll('.header-icon-btn[aria-label="Wishlist"] .badge').forEach(b => {
      b.textContent = wishCount;
    });
  }

  updateBadges();
  window.addEventListener('fluffy-cart-updated', updateBadges);
  window.addEventListener('fluffy-wishlist-updated', updateBadges);
})();
