(function() {
  var DB_KEY = 'fluffyAdmin';

  function applyContactInfo() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      var s = data.settings;
      if (!s) return;

      var address = (s.storeAddress || '').trim();
      var phones = (s.storePhones && s.storePhones.length) ? s.storePhones.filter(function(p) { return p.trim(); }) : (s.storePhone ? [s.storePhone.trim()] : []);
      var email = (s.storeEmail || '').trim();
      var hours = (s.storeHours || '').trim();

      var footerSelectors = ['.footer-contact li', '.contact-list li', '.contact-info li'];
      footerSelectors.forEach(function(sel) {
        document.querySelectorAll(sel).forEach(function(li) {
          if (li.querySelector('.fa-map-marker-alt') && address) {
            li.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + address;
          }
          if (li.querySelector('.fa-phone-alt') || li.querySelector('.fa-phone')) {
            var phoneIcon = li.querySelector('.fa-phone-alt') ? 'fa-phone-alt' : 'fa-phone';
            if (phones.length) {
              li.innerHTML = '<i class="fas ' + phoneIcon + '"></i> ' + phones.join(' | ');
            }
          }
          if (li.querySelector('.fa-envelope') && email) {
            li.innerHTML = '<i class="fas fa-envelope"></i> ' + email;
          }
          if (li.querySelector('.fa-clock') && hours) {
            li.innerHTML = '<i class="fas fa-clock"></i> ' + hours;
          }
        });
      });

      var addrEl = document.querySelector('.ci-address');
      if (addrEl && address) addrEl.textContent = address;

      var phoneEl = document.querySelector('.ci-phone');
      if (phoneEl && phones.length) {
        phoneEl.innerHTML = phones.map(function(p) { return '<p>' + p + '</p>'; }).join('');
      }

      var emailEl = document.querySelector('.ci-email');
      if (emailEl && email) emailEl.textContent = email;

      var hoursEl = document.querySelector('.ci-hours');
      if (hoursEl && hours) hoursEl.textContent = hours;

      document.querySelectorAll('.top-bar-left span').forEach(function(span) {
        if (span.querySelector('.fa-phone') || span.querySelector('.fa-phone-alt')) {
          var phoneIcon = span.querySelector('.fa-phone-alt') ? 'fa-phone-alt' : 'fa-phone';
          if (phones.length) {
            span.innerHTML = '<i class="fas ' + phoneIcon + '"></i> ' + phones[0];
          }
        }
      });

    } catch (e) {}
  }

  applyContactInfo();
})();
