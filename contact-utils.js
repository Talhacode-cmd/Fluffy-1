(function() {
  var DB_KEY = 'fluffyAdmin';

  function applyContactInfo() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      var s = data.settings;
      if (!s) return;

      // --- Footer contact lists (index, blog, cart, contact, checkout, about, categories) ---
      var footerSelectors = ['.footer-contact li', '.contact-list li', '.contact-info li'];
      footerSelectors.forEach(function(sel) {
        document.querySelectorAll(sel).forEach(function(li) {
          if (li.querySelector('.fa-map-marker-alt') && s.storeAddress) {
            li.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + s.storeAddress;
          }
          if (li.querySelector('.fa-phone-alt') || li.querySelector('.fa-phone')) {
            var phoneIcon = li.querySelector('.fa-phone-alt') ? 'fa-phone-alt' : 'fa-phone';
            if (s.storePhones && s.storePhones.length) {
              li.innerHTML = '<i class="fas ' + phoneIcon + '"></i> ' + s.storePhones.join(' | ');
            } else if (s.storePhone) {
              li.innerHTML = '<i class="fas ' + phoneIcon + '"></i> ' + s.storePhone;
            }
          }
          if (li.querySelector('.fa-envelope') && s.storeEmail) {
            li.innerHTML = '<i class="fas fa-envelope"></i> ' + s.storeEmail;
          }
          if (li.querySelector('.fa-clock') && s.storeHours) {
            li.innerHTML = '<i class="fas fa-clock"></i> ' + s.storeHours;
          }
        });
      });

      // --- Contact page cards ---
      var addrEl = document.querySelector('.ci-address');
      if (addrEl && s.storeAddress) addrEl.textContent = s.storeAddress;

      var phoneEl = document.querySelector('.ci-phone');
      if (phoneEl) {
        if (s.storePhones && s.storePhones.length) {
          phoneEl.innerHTML = s.storePhones.map(function(p) { return '<p>' + p + '</p>'; }).join('');
        } else if (s.storePhone) {
          phoneEl.textContent = s.storePhone;
        }
      }

      var emailEl = document.querySelector('.ci-email');
      if (emailEl && s.storeEmail) emailEl.textContent = s.storeEmail;

      var hoursEl = document.querySelector('.ci-hours');
      if (hoursEl && s.storeHours) hoursEl.textContent = s.storeHours;

      // --- Header top bar phone ---
      document.querySelectorAll('.top-bar-left span').forEach(function(span) {
        if (span.querySelector('.fa-phone') || span.querySelector('.fa-phone-alt')) {
          var phoneIcon = span.querySelector('.fa-phone-alt') ? 'fa-phone-alt' : 'fa-phone';
          if (s.storePhones && s.storePhones.length) {
            span.innerHTML = '<i class="fas ' + phoneIcon + '"></i> ' + s.storePhones[0];
          } else if (s.storePhone) {
            span.innerHTML = '<i class="fas ' + phoneIcon + '"></i> ' + s.storePhone;
          }
        }
      });

    } catch (e) {}
  }

  applyContactInfo();
})();
