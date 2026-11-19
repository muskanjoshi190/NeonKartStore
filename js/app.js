/* NeonKart storefront logic
   - the catalogue is rendered from the `products` array (js/data.js)
   - the cart is an object keyed by product id with quantities, e.g. { "3": 2, "7": 1 }
   - cart, coupon and saved items live in localStorage so they survive a reload */

(function () {
  "use strict";

  var CART_KEY = "neonkart_cart_v1";
  var COUPON_KEY = "neonkart_coupon_v1";
  var WISH_KEY = "neonkart_wish_v1";
  var FREE_DELIVERY_AT = 999;   // free delivery once the amount after discount reaches this
  var DELIVERY_FEE = 49;
  var MAX_QTY = 10;

  var COUPONS = {
    NEON10: { type: "percent", value: 10, min: 0, label: "10% off your order" },
    WELCOME100: { type: "flat", value: 100, min: 1500, label: "₹100 off" }
  };

  var HERO = [
    { id: 1, pill: "Bestseller", title: "Studio-grade sound for every commute", text: "40-hour battery, hybrid noise cancelling and cushions that stay comfortable all day." },
    { id: 3, pill: "Top rated", title: "Type faster. Game harder.", text: "A compact hot-swappable keyboard with a gasket-mount feel and per-key RGB lighting." },
    { id: 2, pill: "New arrival", title: "Your day, tracked on your wrist", text: "AMOLED display, heart rate and sleep tracking, and a battery that lasts a full week." }
  ];

  var INFO = {
    shipping: { title: "Shipping and delivery", body: "<p>We pack and dispatch every order within 24 hours. Most addresses across India receive their parcel in 3 to 5 working days.</p><ul><li>Free delivery on orders above ₹999</li><li>A flat ₹49 delivery fee on smaller orders</li><li>You will see an estimated delivery window on every product page</li></ul>" },
    returns: { title: "Returns and refunds", body: "<p>Not happy with your purchase? Return it within 7 days of delivery.</p><ul><li>Items must be unused and in the original packaging</li><li>Refunds are issued to your original payment method in 3 to 5 working days</li><li>Pick-up from your address is arranged for you</li></ul>" },
    warranty: { title: "Warranty", body: "<p>Every electronic product sold on NeonKart carries a one-year manufacturer warranty against manufacturing defects.</p><ul><li>Keep your order confirmation as proof of purchase</li><li>Physical damage and water damage are not covered</li><li>We will repair or replace faulty items at no cost</li></ul>" },
    about: { title: "About NeonKart", body: "<p>NeonKart started with a simple idea: good gadgets should be easy to find and fairly priced. Our small team tests every product before it goes on the shelf, and we stand behind everything we sell.</p><p>We ship across India and our support team is happy to help you choose.</p>" },
    privacy: { title: "Privacy policy", body: "<p>We only collect the details needed to process your order, such as your name, phone number and delivery address. We never sell your personal data.</p><p>Your cart and saved items are stored in your own browser and can be cleared at any time.</p>" },
    terms: { title: "Terms of use", body: "<p>By using this store you agree to shop responsibly and to provide accurate details when ordering. Prices and availability may change without notice.</p><p>This is a demonstration store. Orders are not shipped and no payment is processed.</p>" }
  };

  var cart = loadJSON(CART_KEY, {});
  var couponCode = loadJSON(COUPON_KEY, "");
  var wish = loadJSON(WISH_KEY, []);
  var state = { category: "All", search: "", sort: "featured", price: "all", wishOnly: false };
  var toastTimer = null;
  var heroIndex = 0;
  var heroTimer = null;
  var detailQty = 1;

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function loadJSON(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v === null || v === undefined ? fallback : v;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked: ignore */ }
  }
  function money(n) {
    return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function findProduct(id) {
    return products.find(function (p) { return p.id === Number(id); });
  }
  function percentOff(p) { return Math.round((1 - p.price / p.mrp) * 100); }
  function ratingText(p) {
    return '<span class="star">★ ' + p.rating.toFixed(1) + "</span> (" + p.reviews.toLocaleString("en-IN") + ")";
  }
  function fmtDate(d) { return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }); }
  function deliveryWindow() {
    var a = new Date(), b = new Date();
    a.setDate(a.getDate() + 3);
    b.setDate(b.getDate() + 5);
    return fmtDate(a) + " to " + fmtDate(b);
  }
  var HEART = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.9 3.6 5 6.6 5c1.9 0 3.5 1 4.4 2.5h2C13.9 6 15.5 5 17.4 5c3 0 4.9 2.9 3.8 6.1C19.5 15.9 12 20.5 12 20.5z"/></svg>';

  // clean up anything saved earlier that no longer makes sense
  Object.keys(cart).forEach(function (id) {
    var q = Number(cart[id]);
    if (!findProduct(id) || !(q > 0)) delete cart[id];
    else cart[id] = Math.min(Math.floor(q), MAX_QTY);
  });
  if (typeof couponCode !== "string" || !COUPONS[couponCode]) couponCode = "";
  if (!Array.isArray(wish)) wish = [];
  wish = wish.filter(function (id) { return !!findProduct(id); });

  /* ---------- cart state ---------- */
  function persist() {
    saveJSON(CART_KEY, cart);
    saveJSON(COUPON_KEY, couponCode);
  }
  function addToCart(id, qty) {
    qty = qty || 1;
    var next = (cart[id] || 0) + qty;
    if (next > MAX_QTY) {
      cart[id] = MAX_QTY;
      toast("You can buy up to " + MAX_QTY + " of one item");
    } else {
      cart[id] = next;
    }
    afterCartChange(true);
  }
  function changeQuantity(id, delta) {
    var next = (cart[id] || 0) + delta;
    if (next > MAX_QTY) { toast("You can buy up to " + MAX_QTY + " of one item"); return; }
    if (next <= 0) delete cart[id]; else cart[id] = next;
    afterCartChange(false);
  }
  function removeItem(id) {
    delete cart[id];
    afterCartChange(false);
  }
  function clearCart() {
    cart = {};
    couponCode = "";
    afterCartChange(false);
  }
  function afterCartChange(bump) {
    persist();
    renderCart();
    updateBadge(bump);
  }
  function countItems() {
    return Object.keys(cart).reduce(function (n, id) { return n + cart[id]; }, 0);
  }

  function totals() {
    var subtotal = Object.keys(cart).reduce(function (sum, id) {
      var p = findProduct(id);
      return p ? sum + p.price * cart[id] : sum;
    }, 0);
    var discount = 0, couponOk = false;
    var c = COUPONS[couponCode];
    if (c && subtotal > 0 && subtotal >= c.min) {
      couponOk = true;
      discount = c.type === "percent" ? Math.round(subtotal * c.value / 100) : Math.min(c.value, subtotal);
    }
    var afterDiscount = subtotal - discount;
    var delivery = subtotal > 0 && afterDiscount < FREE_DELIVERY_AT ? DELIVERY_FEE : 0;
    return { items: countItems(), subtotal: subtotal, discount: discount, couponOk: couponOk, delivery: delivery, afterDiscount: afterDiscount, total: afterDiscount + delivery };
  }

  /* ---------- wishlist ---------- */
  function isWished(id) { return wish.indexOf(Number(id)) !== -1; }
  function updateWishUI() {
    $("#wishCount").textContent = wish.length;
    $$(".wish").forEach(function (b) { b.classList.toggle("on", isWished(b.dataset.wish)); b.setAttribute("aria-pressed", isWished(b.dataset.wish)); });
    $$("[data-wish-detail]").forEach(function (b) {
      var on = isWished(b.dataset.wishDetail);
      b.classList.toggle("on", on);
      b.textContent = on ? "Saved" : "Save for later";
    });
  }
  function toggleWish(id) {
    id = Number(id);
    var i = wish.indexOf(id);
    if (i === -1) { wish.push(id); toast("Saved to your list"); }
    else { wish.splice(i, 1); toast("Removed from your list"); }
    saveJSON(WISH_KEY, wish);
    updateWishUI();
    if (state.wishOnly) renderGrid();
  }

  /* ---------- carousel ---------- */
  function carouselHTML(p, withThumbs) {
    var slides = p.images.map(function (src, i) {
      return '<div class="slide"><img src="' + src + '" alt="' + esc(p.name) + ", photo " + (i + 1) + " of " + p.images.length +
        '" loading="' + (i === 0 ? "eager" : "lazy") + '" draggable="false"></div>';
    }).join("");
    var dots = p.images.map(function (src, i) {
      if (withThumbs) {
        return '<button class="dot thumb' + (i === 0 ? " on" : "") + '" data-goto="' + i + '" aria-label="Show photo ' + (i + 1) + '"><img src="' + src + '" alt=""></button>';
      }
      return '<button class="dot' + (i === 0 ? " on" : "") + '" data-goto="' + i + '" aria-label="Show photo ' + (i + 1) + '"></button>';
    }).join("");
    return '<div class="carousel' + (withThumbs ? " has-thumbs" : "") + '" style="--accent:' + p.accent + '">' +
      '<div class="track" tabindex="0" aria-label="' + esc(p.name) + ' photos">' + slides + "</div>" +
      '<button class="arrow prev" data-slide="-1" aria-label="Previous photo">‹</button>' +
      '<button class="arrow next" data-slide="1" aria-label="Next photo">›</button>' +
      '<div class="dots">' + dots + "</div></div>";
  }
  function goToSlide(car, index) {
    var t = $(".track", car);
    t.scrollTo({ left: index * t.clientWidth, behavior: "smooth" });
  }
  function slideBy(car, dir) {
    var t = $(".track", car);
    var n = t.children.length;
    var idx = Math.round(t.scrollLeft / t.clientWidth);
    goToSlide(car, (idx + dir + n) % n);
  }
  function syncDots(track) {
    var car = track.closest(".carousel");
    if (!car) return;
    var idx = Math.round(track.scrollLeft / track.clientWidth);
    $$(".dot", car).forEach(function (d, i) { d.classList.toggle("on", i === idx); });
  }

  /* ---------- hero slider ---------- */
  function renderHero() {
    var slides = HERO.map(function (h, i) {
      var p = findProduct(h.id);
      return '<div class="hslide' + (i === 0 ? " active" : "") + '" style="--a:' + p.accent + '" aria-hidden="' + (i !== 0) + '">' +
        '<div class="hcopy"><span class="pill">' + esc(h.pill) + '</span><h2 class="ht">' + esc(h.title) + "</h2><p>" + esc(h.text) + "</p>" +
        '<div class="hprice"><b>' + money(p.price) + "</b><s>" + money(p.mrp) + '</s><span class="save">' + percentOff(p) + "% off</span></div>" +
        '<div class="hcta"><button class="btn primary big" data-details="' + p.id + '">Shop ' + esc(p.name.split(" ").slice(0, 2).join(" ")) + '</button>' +
        '<a class="btn ghost big" href="#shop">Browse all products</a></div></div>' +
        '<div class="hart"><img src="' + p.images[1] + '" alt="' + esc(p.name) + '"></div></div>';
    }).join("");
    var dots = HERO.map(function (h, i) {
      return '<button class="hdot' + (i === 0 ? " on" : "") + '" data-hgo="' + i + '" aria-label="Go to offer ' + (i + 1) + '"></button>';
    }).join("");
    $("#heroSlider").innerHTML = slides +
      '<button class="harrow prev" data-hstep="-1" aria-label="Previous offer">‹</button><button class="harrow next" data-hstep="1" aria-label="Next offer">›</button>' +
      '<div class="hdots">' + dots + "</div>";
  }
  function showHero(i) {
    heroIndex = (i + HERO.length) % HERO.length;
    $$(".hslide").forEach(function (s, n) {
      s.classList.toggle("active", n === heroIndex);
      s.setAttribute("aria-hidden", n !== heroIndex);
    });
    $$(".hdot").forEach(function (d, n) { d.classList.toggle("on", n === heroIndex); });
  }
  function startHero() {
    stopHero();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroTimer = setInterval(function () { showHero(heroIndex + 1); }, 6000);
  }
  function stopHero() { clearInterval(heroTimer); }

  /* ---------- catalogue ---------- */
  function visibleProducts() {
    var q = state.search.trim().toLowerCase();
    var list = products.filter(function (p) {
      var inCat = state.category === "All" || p.category === state.category;
      var inSearch = !q || (p.name + " " + p.category + " " + p.short + " " + p.tag).toLowerCase().indexOf(q) !== -1;
      var inPrice = state.price === "all" ||
        (state.price === "u1000" && p.price < 1000) ||
        (state.price === "1000-2000" && p.price >= 1000 && p.price <= 2000) ||
        (state.price === "o2000" && p.price > 2000);
      var inWish = !state.wishOnly || isWished(p.id);
      return inCat && inSearch && inPrice && inWish;
    });
    var sorters = {
      featured: function () { return 0; },
      low: function (a, b) { return a.price - b.price; },
      high: function (a, b) { return b.price - a.price; },
      rating: function (a, b) { return b.rating - a.rating; },
      discount: function (a, b) { return percentOff(b) - percentOff(a); }
    };
    return list.slice().sort(sorters[state.sort]);
  }

  function cardHTML(p) {
    return '<article class="card" style="--accent:' + p.accent + '" data-id="' + p.id + '">' +
      '<div class="media"><span class="tag">' + esc(p.tag) + "</span>" +
      '<button class="wish' + (isWished(p.id) ? " on" : "") + '" data-wish="' + p.id + '" aria-label="Save ' + esc(p.name) + ' for later" aria-pressed="' + isWished(p.id) + '">' + HEART + "</button>" +
      carouselHTML(p, false) + "</div>" +
      '<div class="info"><span class="cat">' + esc(p.category) + "</span>" +
      "<h3>" + esc(p.name) + "</h3>" +
      '<p class="short">' + esc(p.short) + "</p>" +
      '<p class="rating">' + ratingText(p) + "</p>" +
      '<div class="price-row"><span class="price">' + money(p.price) + '</span><span class="mrp">' + money(p.mrp) + '</span><span class="save">' + percentOff(p) + "% off</span></div>" +
      '<div class="actions"><button class="btn ghost" data-details="' + p.id + '">Details</button>' +
      '<button class="btn primary" data-add="' + p.id + '">Add to cart</button></div></div></article>';
  }

  function categories() {
    var cats = [];
    products.forEach(function (p) { if (cats.indexOf(p.category) === -1) cats.push(p.category); });
    return cats;
  }

  function renderChips() {
    var cats = ["All"].concat(categories());
    $("#chips").innerHTML = cats.map(function (c) {
      var n = c === "All" ? products.length : products.filter(function (p) { return p.category === c; }).length;
      return '<button class="chip" role="tab" data-cat="' + esc(c) + '" aria-selected="' + (state.category === c) + '">' + esc(c) + " (" + n + ")</button>";
    }).join("");
  }

  function renderCategoryTiles() {
    $("#catGrid").innerHTML = categories().map(function (c) {
      var list = products.filter(function (p) { return p.category === c; });
      var first = list[0];
      return '<button class="cat-tile" style="--c:' + first.accent + '" data-jump-cat="' + esc(c) + '"><img src="' + first.images[0] + '" alt="" loading="lazy"><div><b>' + esc(c) + "</b><span>" + list.length + (list.length > 1 ? " products" : " product") + "</span></div></button>";
    }).join("");
    $("#footCats").innerHTML = categories().map(function (c) {
      return '<li><button class="link" data-jump-cat="' + esc(c) + '">' + esc(c) + "</button></li>";
    }).join("");
  }

  function renderDeals() {
    var top = products.slice().sort(function (a, b) { return percentOff(b) - percentOff(a); }).slice(0, 4);
    $("#dealsGrid").innerHTML = top.map(cardHTML).join("");
  }

  function renderGrid() {
    var list = visibleProducts();
    $("#grid").innerHTML = list.map(cardHTML).join("");
    $("#noResults").hidden = list.length > 0;
    var info = "Showing " + list.length + " of " + products.length + " products";
    if (state.wishOnly) info = "Showing your saved items (" + list.length + ")";
    $("#resultInfo").textContent = info;
  }

  function setCategory(cat, scroll) {
    state.category = cat;
    state.wishOnly = false;
    $("#wishBtn").setAttribute("aria-pressed", "false");
    renderChips();
    renderGrid();
    if (scroll) $("#shop").scrollIntoView({ behavior: "smooth" });
  }

  /* ---------- cart drawer ---------- */
  function updateBadge(bump) {
    var b = $("#cartCount");
    b.textContent = countItems();
    if (bump) {
      b.classList.remove("bump");
      void b.offsetWidth;
      b.classList.add("bump");
    }
  }

  function emptyCartHTML() {
    return '<div class="empty-cart">' +
      '<svg viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="ec" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d8d"/><stop offset="1" stop-color="#ff9f43"/></linearGradient></defs>' +
      '<rect x="30" y="58" width="100" height="80" rx="18" fill="url(#ec)"/><path d="M58 70 V52 a22 22 0 0 1 44 0 V70" fill="none" stroke="#f4f5ff" stroke-width="8" stroke-linecap="round"/>' +
      '<circle cx="64" cy="92" r="6" fill="#090911"/><circle cx="96" cy="92" r="6" fill="#090911"/><path d="M62 112 Q80 126 98 112" fill="none" stroke="#090911" stroke-width="6" stroke-linecap="round"/></svg>' +
      "<h3>Your cart is empty</h3>" +
      '<p class="muted">Add something you like and it will show up here.</p>' +
      '<button class="btn primary" data-close-cart>Continue shopping</button></div>';
  }

  function renderCart() {
    var ids = Object.keys(cart);
    var body = $("#drawerBody");
    $("#drawerCount").textContent = ids.length ? "(" + countItems() + (countItems() > 1 ? " items)" : " item)") : "";
    if (!ids.length) { body.innerHTML = emptyCartHTML(); return; }

    var t = totals();
    var rows = ids.map(function (id) {
      var p = findProduct(id);
      return '<tr data-id="' + p.id + '">' +
        '<td class="ci"><img src="' + p.images[0] + '" alt=""><div><b>' + esc(p.name) + "</b><small>" + money(p.price) + " each</small></div></td>" +
        '<td class="q"><div class="qty"><button data-qty="-1" aria-label="Decrease quantity of ' + esc(p.name) + '">−</button><span aria-live="polite">' + cart[id] +
        '</span><button data-qty="1" aria-label="Increase quantity of ' + esc(p.name) + '">+</button></div></td>' +
        '<td class="lt">' + money(p.price * cart[id]) + "</td>" +
        '<td class="rmv"><button class="rm" data-remove aria-label="Remove ' + esc(p.name) + ' from cart">✕</button></td></tr>';
    }).join("");

    var toFree = Math.max(0, FREE_DELIVERY_AT - t.afterDiscount);
    var pct = Math.min(100, Math.round(t.afterDiscount / FREE_DELIVERY_AT * 100));
    var ship = toFree > 0 ? "Add <b>" + money(toFree) + "</b> more to get free delivery" : "<b>You have unlocked free delivery</b>";

    var c = COUPONS[couponCode];
    var couponMsg;
    if (couponCode && t.couponOk) couponMsg = '<p class="coupon-msg ok">' + couponCode + " applied: " + c.label + "</p>";
    else if (couponCode && c) couponMsg = '<p class="coupon-msg bad">' + couponCode + " works on orders of " + money(c.min) + " or more</p>";
    else couponMsg = '<p class="coupon-msg"></p>';

    body.innerHTML =
      '<table class="cart-table"><thead><tr><th>Item</th><th>Quantity</th><th>Total</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<p class="ship-note">' + ship + '</p><div class="progress"><i style="width:' + pct + '%"></i></div>' +
      '<form class="coupon" id="couponForm"><input id="couponInput" placeholder="Coupon code" value="' + esc(couponCode) + '" aria-label="Coupon code" maxlength="20" autocomplete="off">' +
      '<button class="btn ghost" type="submit">Apply</button></form>' + couponMsg +
      '<div class="sum">' +
      "<div><span>Subtotal (" + t.items + (t.items > 1 ? " items" : " item") + ")</span><span>" + money(t.subtotal) + "</span></div>" +
      (t.discount ? '<div class="discount"><span>Discount</span><span>− ' + money(t.discount) + "</span></div>" : "") +
      "<div><span>Delivery</span><span>" + (t.delivery ? money(t.delivery) : "Free") + "</span></div>" +
      '<div class="grand"><span>Total</span><span>' + money(t.total) + "</span></div></div>" +
      '<div class="drawer-actions"><button class="btn primary" data-checkout>Proceed to checkout</button>' +
      '<span class="secure">Taxes included. Secure checkout.</span>' +
      '<button class="btn text" data-clear>Empty cart</button></div>';
  }

  function openCart() {
    renderCart();
    $("#overlay").hidden = false;
    var d = $("#drawer");
    d.classList.add("open");
    d.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    $("#overlay").hidden = true;
    var d = $("#drawer");
    d.classList.remove("open");
    d.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function applyCoupon(raw) {
    var code = String(raw || "").trim().toUpperCase();
    if (!code) { couponCode = ""; persist(); renderCart(); return; }
    if (!COUPONS[code]) {
      couponCode = "";
      persist();
      renderCart();
      var m = $(".coupon-msg");
      if (m) { m.className = "coupon-msg bad"; m.textContent = "That code is not valid. Check the spelling and try again."; }
      return;
    }
    couponCode = code;
    persist();
    renderCart();
    toast(totals().couponOk ? "Coupon applied" : "Coupon saved. Add more items to use it");
  }

  /* ---------- product details ---------- */
  function openDetails(id) {
    var p = findProduct(id);
    if (!p) return;
    detailQty = 1;
    var dlg = $("#detail");
    dlg.innerHTML =
      '<button class="icon-btn modal-close" data-close-dialog aria-label="Close">&times;</button>' +
      '<div class="detail-grid"><div class="detail-media">' + carouselHTML(p, true) + "</div>" +
      '<div class="detail-info" style="--accent:' + p.accent + '">' +
      '<span class="cat" style="color:' + p.accent + '">' + esc(p.category) + "</span>" +
      "<h2>" + esc(p.name) + "</h2>" +
      '<p class="rating">' + ratingText(p) + " reviews</p>" +
      '<div class="price-row"><span class="price">' + money(p.price) + '</span><span class="mrp">' + money(p.mrp) + '</span><span class="save">' + percentOff(p) + "% off</span></div>" +
      '<span class="stock">In stock</span>' +
      '<p class="desc">' + esc(p.description) + "</p>" +
      '<ul class="features">' + p.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
      '<div class="delivery-box"><span><b>Delivery:</b> ' + deliveryWindow() + "</span><span>" +
      (p.price >= FREE_DELIVERY_AT ? "Free delivery on this item" : "Free delivery above " + money(FREE_DELIVERY_AT) + ", otherwise " + money(DELIVERY_FEE)) + "</span><span>7-day returns and 1-year warranty</span></div>" +
      '<div class="buy-row"><div class="qty"><button data-dq="-1" aria-label="Decrease quantity">−</button><span id="dq">1</span><button data-dq="1" aria-label="Increase quantity">+</button></div>' +
      '<button class="btn primary" data-add-detail="' + p.id + '">Add to cart</button>' +
      '<button class="btn ghost" data-wish-detail="' + p.id + '"></button></div>' +
      "</div></div>";
    updateWishUI();
    if (!dlg.open) dlg.showModal();
  }

  /* ---------- checkout ---------- */
  function openCheckout() {
    var t = totals();
    if (!t.items) { toast("Your cart is empty"); return; }
    var rows = Object.keys(cart).map(function (id) {
      var p = findProduct(id);
      return "<tr><td>" + esc(p.name) + "</td><td>" + cart[id] + " × " + money(p.price) + "</td><td>" + money(p.price * cart[id]) + "</td></tr>";
    }).join("");
    var dlg = $("#checkout");
    dlg.innerHTML =
      '<button class="icon-btn modal-close" data-close-dialog aria-label="Close checkout">&times;</button>' +
      '<div class="co-body" id="coBody"><h2>Review and place order</h2>' +
      '<div class="demo-banner">Demo checkout: no payment is taken and no card details are needed.</div>' +
      '<table class="co-table"><thead><tr><th>Item</th><th>Qty × price</th><th>Amount</th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<div class="sum"><div><span>Subtotal</span><span>' + money(t.subtotal) + "</span></div>" +
      (t.discount ? '<div class="discount"><span>Discount (' + couponCode + ")</span><span>− " + money(t.discount) + "</span></div>" : "") +
      "<div><span>Delivery</span><span>" + (t.delivery ? money(t.delivery) : "Free") + "</span></div>" +
      '<div class="grand"><span>Total</span><span>' + money(t.total) + "</span></div></div>" +
      '<form class="form" id="coForm">' +
      '<label>Full name<input name="name" required maxlength="40" autocomplete="name"></label>' +
      '<label>Mobile number<input name="phone" required inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10-digit number" autocomplete="tel"></label>' +
      '<label class="full">Address<input name="address" required maxlength="90" autocomplete="street-address"></label>' +
      '<label>City<input name="city" required maxlength="40" autocomplete="address-level2"></label>' +
      '<label>PIN code<input name="pin" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="6 digits" autocomplete="postal-code"></label>' +
      '<div class="pay"><label><input type="radio" name="pay" value="Cash on delivery" checked> Cash on delivery</label><label><input type="radio" name="pay" value="UPI"> UPI</label></div>' +
      "</form>" +
      '<div class="co-actions"><button class="btn ghost" data-close-dialog>Back to shopping</button>' +
      '<button class="btn primary" form="coForm" type="submit">Place order</button></div></div>';
    closeCart();
    if (!dlg.open) dlg.showModal();
  }

  function placeOrder(form) {
    var f = form.elements;
    var t = totals();
    var orderId = "NK" + Math.floor(1000000 + Math.random() * 9000000);
    var pay = f.pay.value;
    var name = f.name.value.trim().split(" ")[0];
    $("#coBody").innerHTML =
      '<div class="success"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="none" stroke="#b8ff5a" stroke-width="6"/>' +
      '<path d="M36 62 L54 80 L86 42" fill="none" stroke="#b8ff5a" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "<h2>Order placed, " + esc(name) + "!</h2>" +
      '<p class="order-id">Order ' + orderId + "</p>" +
      '<p class="muted">' + t.items + (t.items > 1 ? " items" : " item") + " worth " + money(t.total) + ". Payment: " + esc(pay) + ".<br>Expected delivery: " + deliveryWindow() + ".</p>" +
      '<p class="muted">This is a demo store, so nothing was charged and nothing will be shipped.</p>' +
      '<button class="btn primary" data-close-dialog>Continue shopping</button></div>';
    clearCart();
  }

  /* ---------- info dialogs ---------- */
  function openInfo(key) {
    var dlg = $("#info");
    var body;
    if (key === "contact") {
      body = "<h2>Contact us</h2><p>Our support team replies within one working day, Monday to Saturday, 10 am to 7 pm.</p>" +
        '<form class="form" id="contactForm"><label>Name<input name="name" required maxlength="40"></label><label>Email<input name="email" type="email" required maxlength="60"></label>' +
        '<label class="full">How can we help?<textarea name="msg" required rows="4" maxlength="400"></textarea></label>' +
        '<div class="co-actions full"><button class="btn primary" type="submit">Send message</button></div></form>';
    } else {
      body = "<h2>" + INFO[key].title + "</h2>" + INFO[key].body;
    }
    dlg.innerHTML = '<button class="icon-btn modal-close" data-close-dialog aria-label="Close">&times;</button><div class="info-body">' + body + "</div>";
    if (!dlg.open) dlg.showModal();
  }

  /* ---------- toast + countdown ---------- */
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tickCountdown() {
    var now = new Date(), end = new Date(now);
    end.setHours(24, 0, 0, 0);
    var s = Math.max(0, Math.floor((end - now) / 1000));
    $("#countdown").textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s % 3600 / 60)) + ":" + pad(s % 60);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target;

    var arrow = el.closest("[data-slide]");
    if (arrow) { slideBy(arrow.closest(".carousel"), Number(arrow.dataset.slide)); return; }
    var dot = el.closest("[data-goto]");
    if (dot) { goToSlide(dot.closest(".carousel"), Number(dot.dataset.goto)); return; }
    var hstep = el.closest("[data-hstep]");
    if (hstep) { showHero(heroIndex + Number(hstep.dataset.hstep)); startHero(); return; }
    var hgo = el.closest("[data-hgo]");
    if (hgo) { showHero(Number(hgo.dataset.hgo)); startHero(); return; }

    var btn = el.closest("button, a");
    if (!btn) {
      var media = el.closest(".card .carousel");
      if (media) openDetails(media.closest(".card").dataset.id);
      return;
    }

    if (btn.dataset.add) {
      addToCart(btn.dataset.add, 1);
      toast(findProduct(btn.dataset.add).name + " added to cart");
    } else if (btn.dataset.wish) {
      toggleWish(btn.dataset.wish);
    } else if (btn.dataset.wishDetail) {
      toggleWish(btn.dataset.wishDetail);
    } else if (btn.dataset.details) {
      openDetails(btn.dataset.details);
    } else if (btn.dataset.dq) {
      detailQty = Math.max(1, Math.min(MAX_QTY, detailQty + Number(btn.dataset.dq)));
      $("#dq").textContent = detailQty;
    } else if (btn.dataset.addDetail) {
      addToCart(btn.dataset.addDetail, detailQty);
      toast(detailQty + " × " + findProduct(btn.dataset.addDetail).name + " added to cart");
      $("#detail").close();
    } else if (btn.dataset.qty) {
      changeQuantity(btn.closest("tr").dataset.id, Number(btn.dataset.qty));
    } else if (btn.hasAttribute("data-remove")) {
      var rid = btn.closest("tr").dataset.id;
      var rp = findProduct(rid);
      removeItem(rid);
      toast(rp.name + " removed");
    } else if (btn.hasAttribute("data-clear")) {
      clearCart();
      toast("Cart emptied");
    } else if (btn.hasAttribute("data-checkout")) {
      openCheckout();
    } else if (btn.hasAttribute("data-close-cart")) {
      closeCart();
      $("#shop").scrollIntoView({ behavior: "smooth" });
    } else if (btn.hasAttribute("data-close-dialog")) {
      var dlg = btn.closest("dialog");
      if (dlg) dlg.close();
    } else if (btn.dataset.cat) {
      setCategory(btn.dataset.cat, false);
    } else if (btn.dataset.jumpCat) {
      setCategory(btn.dataset.jumpCat, true);
    } else if (btn.dataset.info) {
      openInfo(btn.dataset.info);
    }
    // product details opened from the hero should sit on top of everything
    if (btn.dataset.details) closeCart();
  });

  document.addEventListener("scroll", function (e) {
    if (e.target.classList && e.target.classList.contains("track")) syncDots(e.target);
  }, true);

  document.addEventListener("submit", function (e) {
    var id = e.target.id;
    if (id === "couponForm") {
      e.preventDefault();
      applyCoupon($("#couponInput").value);
    } else if (id === "coForm") {
      e.preventDefault();
      placeOrder(e.target);
    } else if (id === "contactForm") {
      e.preventDefault();
      $("#info").close();
      toast("Thanks! We will reply within one working day.");
    } else if (id === "newsForm") {
      e.preventDefault();
      var v = $("#newsEmail").value.trim();
      var msg = $("#newsMsg");
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        msg.className = "news-msg ok";
        msg.textContent = "You are on the list. Watch your inbox for a welcome coupon.";
        $("#newsEmail").value = "";
      } else {
        msg.className = "news-msg bad";
        msg.textContent = "Please enter a valid email address.";
      }
    }
  });

  ["detail", "checkout", "info"].forEach(function (id) {
    $("#" + id).addEventListener("click", function (e) { if (e.target === this) this.close(); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $("#drawer").classList.contains("open")) closeCart();
    var track = e.target.closest && e.target.closest(".track");
    if (track && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      slideBy(track.closest(".carousel"), e.key === "ArrowRight" ? 1 : -1);
    }
  });

  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  $("#searchInput").addEventListener("input", function (e) {
    state.search = e.target.value;
    renderGrid();
    if (state.search && window.scrollY < $("#shop").offsetTop - 200) $("#shop").scrollIntoView({ behavior: "smooth" });
  });
  $("#sortSelect").addEventListener("change", function (e) { state.sort = e.target.value; renderGrid(); });
  $("#priceSelect").addEventListener("change", function (e) { state.price = e.target.value; renderGrid(); });
  $("#clearFilters").addEventListener("click", function () {
    state = { category: "All", search: "", sort: "featured", price: "all", wishOnly: false };
    $("#searchInput").value = "";
    $("#sortSelect").value = "featured";
    $("#priceSelect").value = "all";
    $("#wishBtn").setAttribute("aria-pressed", "false");
    renderChips();
    renderGrid();
  });
  $("#wishBtn").addEventListener("click", function () {
    state.wishOnly = !state.wishOnly;
    this.setAttribute("aria-pressed", state.wishOnly);
    if (state.wishOnly && !wish.length) toast("Nothing saved yet. Tap the heart on any product.");
    renderGrid();
    $("#shop").scrollIntoView({ behavior: "smooth" });
  });
  var hs = $("#heroSlider");
  hs.addEventListener("mouseenter", stopHero);
  hs.addEventListener("mouseleave", startHero);
  hs.addEventListener("focusin", stopHero);
  hs.addEventListener("focusout", startHero);
  document.addEventListener("visibilitychange", function () { if (document.hidden) stopHero(); else startHero(); });

  window.addEventListener("storage", function (e) {
    if (e.key === CART_KEY || e.key === COUPON_KEY) {
      cart = loadJSON(CART_KEY, {});
      couponCode = loadJSON(COUPON_KEY, "");
      renderCart();
      updateBadge(false);
    }
  });

  /* ---------- start ---------- */
  renderHero();
  renderCategoryTiles();
  renderDeals();
  renderChips();
  renderGrid();
  renderCart();
  updateBadge(false);
  updateWishUI();
  tickCountdown();
  setInterval(tickCountdown, 1000);
  startHero();
})();
