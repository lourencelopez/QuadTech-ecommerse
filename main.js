/* ============================================
   QUADTECH — Main JavaScript
   Cart, Filters, Search, Toast, UI Interactions
   ============================================ */

(function () {
  'use strict';

  /* ── STATE ── */
  let cart = [];

  /* ── DOM REFS ── */
  const cartBtn     = document.getElementById('cartBtn');
  const cartClose   = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartItems   = document.getElementById('cartItems');
  const cartFooter  = document.getElementById('cartFooter');
  const cartTotal   = document.getElementById('cartTotal');
  const cartCount   = document.getElementById('cartCount');
  const toast       = document.getElementById('toast');
  const toastTitle  = document.getElementById('toastTitle');
  const toastSub    = document.getElementById('toastSub');
  const searchInput = document.getElementById('searchInput');
  const productsGrid= document.getElementById('productsGrid');
  const filterChips = document.querySelectorAll('.chip');
  const sortSelect  = document.querySelector('.sort-select');
  const subscribeBtn= document.getElementById('subscribeBtn');
  const emailInput  = document.getElementById('emailInput');

  /* ── CART OPEN / CLOSE ── */
  function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    cartSidebar.setAttribute('aria-hidden', 'false');
    cartClose.focus();
  }

  function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
    cartSidebar.setAttribute('aria-hidden', 'true');
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  /* Close cart on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartSidebar.classList.contains('open')) closeCart();
  });

  /* ── RENDER CART ── */
  function renderCart() {
    /* Count badge */
    const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'grid' : 'none';

    /* Empty state */
    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="cart-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <p>Your cart is empty</p>
        </div>`;
      cartFooter.style.display = 'none';
      return;
    }

    /* Items */
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__img">
          <img src="${item.img}" alt="${item.name}" loading="lazy" />
        </div>
        <div>
          <p class="cart-item__cat">${item.category}</p>
          <p class="cart-item__name">${item.name}</p>
          <div class="cart-item__qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div>
          <p class="cart-item__price">₱${(item.price * item.qty).toLocaleString()}</p>
          <button class="cart-item__remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">Remove</button>
        </div>
      </div>
    `).join('');

    /* Total */
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    cartTotal.textContent = '₱' + total.toLocaleString();
    cartFooter.style.display = 'block';

    /* Quantity / remove listeners */
    cartItems.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', handleCartAction);
    });
  }

  function handleCartAction(e) {
    const { action, id } = e.currentTarget.dataset;
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;

    if (action === 'inc') {
      cart[idx].qty++;
    } else if (action === 'dec') {
      cart[idx].qty--;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    } else if (action === 'remove') {
      cart.splice(idx, 1);
    }
    renderCart();
  }

  /* ── ADD TO CART ── */
  function addToCart(btn) {
    const { name, price, category, img } = btn.dataset;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const existing = cart.find(i => i.id === id);

    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price: parseInt(price, 10), category, img, qty: 1 });
    }

    renderCart();
    showToast(name, category);

    /* Button feedback */
    btn.textContent = '✓ Added!';
    btn.style.background = 'rgba(0,200,100,0.15)';
    btn.style.borderColor = '#00C864';
    btn.style.color = '#00C864';
    setTimeout(() => {
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Add to Cart`;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 1800);
  }

  /* Attach add-to-cart listeners */
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn));
  });

  /* ── TOAST ── */
  let toastTimer;
  function showToast(name, cat) {
    clearTimeout(toastTimer);
    toastTitle.textContent = 'Added to cart!';
    toastSub.textContent = name + ' · ' + cat;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ── FILTER CHIPS ── */
  let activeFilter = 'all';

  function applyFilter() {
    const cards = productsGrid.querySelectorAll('.product-card');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    cards.forEach(card => {
      const cat = card.dataset.category;
      const name = card.querySelector('.product-card__name').textContent.toLowerCase();
      const desc = card.querySelector('.product-card__desc').textContent.toLowerCase();

      const catMatch = activeFilter === 'all' || cat === activeFilter;
      const queryMatch = !query || name.includes(query) || desc.includes(query) || cat.includes(query);

      card.style.display = (catMatch && queryMatch) ? '' : 'none';
    });
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      applyFilter();
    });
  });

  /* ── SEARCH ── */
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilter, 220);
    });
  }

  /* ── SORT ── */
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const val = sortSelect.value;
      const cards = Array.from(productsGrid.querySelectorAll('.product-card'));

      cards.sort((a, b) => {
        if (val === 'price-asc') return parseInt(a.dataset.price) - parseInt(b.dataset.price);
        if (val === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
        if (val === 'name') {
          return a.querySelector('.product-card__name').textContent
            .localeCompare(b.querySelector('.product-card__name').textContent);
        }
        return 0;
      });

      cards.forEach(card => productsGrid.appendChild(card));
    });
  }

  /* ── NEWSLETTER ── */
  if (subscribeBtn && emailInput) {
    subscribeBtn.addEventListener('click', () => {
      const email = emailInput.value.trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRe.test(email)) {
        emailInput.style.borderColor = '#FF3D3D';
        emailInput.placeholder = 'Enter a valid email';
        setTimeout(() => {
          emailInput.style.borderColor = '';
          emailInput.placeholder = 'your@email.com';
        }, 2000);
        return;
      }

      showToast('QuadTech Newsletter', 'You\'re subscribed! 🎉');
      emailInput.value = '';
      subscribeBtn.textContent = 'Subscribed ✓';
      subscribeBtn.style.background = '#00C864';
      setTimeout(() => {
        subscribeBtn.innerHTML = 'Subscribe <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
        subscribeBtn.style.background = '';
      }, 2500);
    });

    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') subscribeBtn.click();
    });
  }

  /* ── SCROLL-BASED HEADER ── */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header.style.borderBottomColor = window.scrollY > 20 ? 'var(--yellow)' : '';
  }, { passive: true });

  /* ── INIT ── */
  renderCart();

})();
