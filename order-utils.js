/* =============================================
   FLUFFY PET SHOP — Shared Order Utilities
   Used by: cart.html, checkout.html, admin.html
   ============================================= */
(() => {
  'use strict';

  const CART_KEY = 'fluffyCart';
  const ADMIN_KEY = 'fluffyAdmin';
  const CHANNEL_NAME = 'fluffy-orders';

  /* -------------------------------------------
     CART FUNCTIONS (used by cart.html & checkout.html)
     ------------------------------------------- */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('fluffy-cart-updated'));
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += (product.qty || 1);
    } else {
      cart.push({ ...product, qty: product.qty || 1 });
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(productId) {
    const cart = getCart().filter(i => i.id !== productId);
    saveCart(cart);
    return cart;
  }

  function updateCartQty(productId, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.qty = Math.max(1, qty);
      saveCart(cart);
    }
    return cart;
  }

  function getCartTotal() {
    return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getCartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event('fluffy-cart-updated'));
  }

  /* -------------------------------------------
     ORDER FUNCTIONS (used by checkout.html & admin.html)
     ------------------------------------------- */
  function getOrders() {
    try {
      const stored = localStorage.getItem(ADMIN_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return data.orders || [];
      }
    } catch {}
    return [];
  }

  function getAllData() {
    try {
      const stored = localStorage.getItem(ADMIN_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { products: [], orders: [], customers: [], categories: [], coupons: [], reviews: [], activities: [], settings: {} };
  }

  function saveAllData(data) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(data));
  }

  function createOrder(orderInfo) {
    const data = getAllData();
    const cart = getCart();

    if (cart.length === 0) return { success: false, message: 'Cart is empty' };

    const orderId = 'ORD-' + (1000 + data.orders.length + 1);
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

    // Read shipping settings from admin
    var freeShippingThreshold = 50;
    var standardShipping = 5.99;
    try {
      var adminRaw = localStorage.getItem(ADMIN_KEY);
      if (adminRaw) {
        var adminData = JSON.parse(adminRaw);
        if (adminData.settings) {
          if (adminData.settings.freeShipping !== undefined) freeShippingThreshold = parseFloat(adminData.settings.freeShipping);
          if (adminData.settings.standardShipping !== undefined) standardShipping = parseFloat(adminData.settings.standardShipping);
        }
      }
    } catch (e) {}

    const tax = subtotal * 0.08;
    const shipping = subtotal >= freeShippingThreshold ? 0 : standardShipping;
    const total = subtotal + tax + shipping;

    const order = {
      id: orderId,
      customer: orderInfo.name,
      email: orderInfo.email || '',
      phone: orderInfo.phone,
      address: orderInfo.address,
      city: orderInfo.city || '',
      paymentMethod: orderInfo.payment || 'cod',
      items: totalItems,
      itemDetails: cart.map(i => ({
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image || '',
        variant: i.variant || ''
      })),
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total,
      status: 'pending',
      date: new Date().toISOString(),
      notes: orderInfo.notes || ''
    };

    data.orders.unshift(order);

    // Auto-add customer if not exists
    const existingCustomer = data.customers.find(c => c.email === orderInfo.email || c.phone === orderInfo.phone);
    if (existingCustomer) {
      existingCustomer.orders = (existingCustomer.orders || 0) + 1;
      existingCustomer.spent = (existingCustomer.spent || 0) + total;
    } else {
      data.customers.push({
        id: Date.now(),
        name: orderInfo.name,
        email: orderInfo.email || '',
        phone: orderInfo.phone,
        address: orderInfo.address,
        orders: 1,
        spent: total,
        joined: new Date().toISOString(),
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
      });
    }

    // Add activity
    data.activities = data.activities || [];
    data.activities.unshift({
      type: 'order',
      message: `New order <strong>#${orderId}</strong> from <strong>${orderInfo.name}</strong> — ${fmt(total)}`,
      time: new Date().toISOString()
    });
    if (data.activities.length > 50) data.activities = data.activities.slice(0, 50);

    saveAllData(data);
    clearCart();

    // Notify admin panel via BroadcastChannel
    notifyAdmin(order);

    return { success: true, orderId: orderId, total: total };
  }

  /* -------------------------------------------
     REAL-TIME SYNC — BroadcastChannel
     ------------------------------------------- */
  let channel = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch {}

  function notifyAdmin(order) {
    if (channel) {
      try { channel.postMessage({ type: 'new-order', order: order }); } catch {}
    }
    // Also fire a storage event as fallback
    try {
      localStorage.setItem(ADMIN_KEY + '_lastOrder', JSON.stringify(order));
    } catch {}
  }

  function onNewOrder(callback) {
    if (channel) {
      channel.onmessage = (e) => {
        if (e.data && e.data.type === 'new-order') {
          callback(e.data.order);
        }
      };
    }
    // Fallback: poll for new orders
    let lastCount = getOrders().length;
    setInterval(() => {
      const current = getOrders().length;
      if (current > lastCount) {
        const orders = getOrders();
        callback(orders[0]);
        lastCount = current;
      }
    }, 2000);
  }

  /* -------------------------------------------
     HELPERS
     ------------------------------------------- */
  function fmt(n) {
    return '৳' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }

  /* -------------------------------------------
     EXPOSE TO WINDOW
     ------------------------------------------- */
  window.FluffyCart = {
    get: getCart,
    save: saveCart,
    add: addToCart,
    remove: removeFromCart,
    updateQty: updateCartQty,
    total: getCartTotal,
    count: getCartCount,
    clear: clearCart
  };

  window.FluffyOrders = {
    get: getOrders,
    getAllData: getAllData,
    saveAllData: saveAllData,
    create: createOrder,
    onNew: onNewOrder,
    fmt: fmt,
    playSound: playNotificationSound
  };

})();
