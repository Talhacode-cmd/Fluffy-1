/* =============================================
   FLUFFY PET SHARED SEARCH UTILITIES
   Handles search toggle (mobile) + redirect to shop
   ============================================= */
(() => {
  'use strict';

  /* Toggle search bar on mobile */
  document.querySelectorAll('.search-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var bar = btn.closest('.header-actions').querySelector('.search-bar');
      if (!bar) return;
      var isVisible = bar.style.display === 'flex';
      bar.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        bar.querySelector('.search-input').focus();
      }
    });
  });

  /* Search bar visibility: desktop = visible, mobile = hidden by default */
  function applySearchVisibility() {
    document.querySelectorAll('.search-bar').forEach(function(bar) {
      if (window.innerWidth > 900) {
        bar.style.display = 'flex';
      } else {
        bar.style.display = 'none';
      }
    });
  }
  applySearchVisibility();
  window.addEventListener('resize', applySearchVisibility);

  /* On non-shop pages: search submits redirect to shop.html?q=... */
  var isShop = location.pathname.indexOf('shop.html') !== -1;
  if (!isShop) {
    document.querySelectorAll('.search-bar .search-input').forEach(function(input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var q = this.value.trim();
          if (q) {
            location.href = 'shop.html?q=' + encodeURIComponent(q);
          }
        }
      });
    });
    document.querySelectorAll('.search-bar .search-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var input = this.closest('.search-bar').querySelector('.search-input');
        var q = input.value.trim();
        if (q) {
          location.href = 'shop.html?q=' + encodeURIComponent(q);
        }
      });
    });
  }

  /* On shop.html: also handle URL ?q= param on load */
  if (isShop) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      var searchInput = document.querySelector('.search-bar .search-input');
      if (searchInput) {
        searchInput.value = q;
        searchInput.dispatchEvent(new Event('input'));
      }
    }
  }
})();
