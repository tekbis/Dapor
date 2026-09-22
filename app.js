const products = window.DAPOR_PRODUCTS || [];
const CART_KEY = "dapor_cart_v2";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let cart = loadCart();

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(stored)
      ? stored.flatMap((item) => {
          const product = products.find((entry) => entry.id === item.id);
          if (!product || !item.size || !item.color) return [];
          return [{ ...item, price: product.price, img: product.img, title: product.title, url: product.url, qty: Math.max(1, Math.min(10, Number(item.qty) || 1)) }];
        })
      : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(value) {
  return Number.isFinite(value) ? `$${value.toFixed(2)}` : "Price to be confirmed";
}

function productCard(product) {
  return `
    <article class="product-card reveal" data-cat="${product.cat}" data-url="${product.url}" tabindex="0" aria-label="View ${product.title}">
      <div class="product-image">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
        <button class="wishlist" aria-label="Add ${product.title} to wishlist" type="button">♡</button>
        <a href="${product.url}" aria-label="View ${product.title}"><img src="${product.img}" alt="${product.title}" loading="lazy"></a>
      </div>
      <div class="product-info">
        <span class="product-kicker">${product.edition}</span>
        <h3><a href="${product.url}">${product.title}</a></h3>
        <p>${product.desc}</p>
        <div class="product-bottom"><span class="price">${money(product.price)}</span><span class="rating">New design</span></div>
        ${product.comingSoon
          ? `<button class="add-to-cart coming-soon" type="button" disabled aria-label="${product.title} is coming soon">Coming soon</button>`
          : `<button class="add-to-cart" type="button" data-quick-add="${product.id}" aria-label="Add ${product.title} to cart">Add to cart</button>`}
      </div>
    </article>`;
}

const FILTER_LABELS = {
  all: "All",
  hoodies: "Hoodies",
  shorts: "Shorts",
  grey: "Heather grey",
  black: "Onyx",
  men: "Men",
  women: "Women",
  kids: "Kids",
  accessories: "Accessories",
};

function renderProducts(filter = "all") {
  const grid = $(".product-grid");
  if (!grid) return;
  const list = filter === "all"
    ? products
    : products.filter((product) => String(product.cat || "").split(/\s+/).includes(filter));
  const label = FILTER_LABELS[filter] || `${filter.charAt(0).toUpperCase()}${filter.slice(1)}`;
  if (!list.length) {
    grid.innerHTML = `<p class="empty-category">${label} is coming soon.</p>`;
  } else {
    grid.innerHTML = list.map(productCard).join("");
  }
  const total = $(".product-total");
  if (total) total.textContent = `${list.length} ${list.length === 1 ? "piece" : "pieces"}`;
  bindCards();
  observeReveals();
}

function bindCards() {
  $$(".product-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a,button")) return;
      window.location.href = card.dataset.url;
    });
    card.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !event.target.closest("a,button")) {
        event.preventDefault();
        window.location.href = card.dataset.url;
      }
    });
  });
  $$(".wishlist").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      button.textContent = button.classList.contains("active") ? "♥" : "♡";
    });
  });
  $$("[data-quick-add]").forEach((button) => {
    button.onclick = () => openQuickAdd(products.find((product) => product.id === Number(button.dataset.quickAdd)));
  });
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function openQuickAdd(product) {
  if (!product) return;
  closePanels();
  const modal = $(".quick-add-modal");
  $(".quick-add-content").innerHTML = `<div class="quick-add-layout">
    <div class="quick-add-photo"><img src="${escapeHTML(product.img)}" alt="${escapeHTML(product.title)}"></div>
    <div class="quick-add-details"><p class="eyebrow dark">${escapeHTML(product.edition)}</p><h2 id="quick-add-title">${escapeHTML(product.title)}</h2><strong>${money(product.price)}</strong><p>${escapeHTML(product.desc)}</p>
      <fieldset><legend>Choose size *</legend><div class="quick-add-options">${product.sizes.map((size) => `<button type="button" data-quick-size="${escapeHTML(size)}" aria-pressed="false">${escapeHTML(size)}</button>`).join("")}</div></fieldset>
      <fieldset><legend>Choose color *</legend><div class="quick-add-options">${product.colors.map((color) => `<button type="button" data-quick-color="${escapeHTML(color.name)}" aria-pressed="false"><i style="--swatch:${escapeHTML(color.value)}"></i>${escapeHTML(color.name)}</button>`).join("")}</div></fieldset>
      <p class="quick-add-error" role="alert" aria-live="polite"></p><button type="button" class="quick-add-submit button gold">Add to cart · ${money(product.price)}</button><a class="quick-add-link" href="${product.url}">View full details and size guide ↗</a>
    </div></div>`;
  let size = "";
  let color = "";
  $$("[data-quick-size],[data-quick-color]").forEach((button) => {
    button.onclick = () => {
      const group = button.dataset.quickSize ? "[data-quick-size]" : "[data-quick-color]";
      $$(group).forEach((option) => { option.classList.toggle("selected", option === button); option.setAttribute("aria-pressed", String(option === button)); });
      if (button.dataset.quickSize) size = button.dataset.quickSize;
      else color = button.dataset.quickColor;
      $(".quick-add-error").textContent = "";
    };
  });
  $(".quick-add-submit").onclick = () => {
    if (!size || !color) {
      $(".quick-add-error").textContent = `Please select ${[!size && "a size", !color && "a color"].filter(Boolean).join(" and ")} before adding this item.`;
      return;
    }
    const key = `${product.id}:${size}:${color}`;
    const existing = cart.find((item) => item.key === key);
    if (existing) existing.qty += 1;
    else cart.push({ key, id: product.id, slug: product.slug, url: product.url, title: product.title, desc: product.desc, price: product.price, img: product.img, size, color, qty: 1 });
    updateCart();
    modal.close();
    showToast(`${product.title} added to your bag`);
    openCart();
  };
  modal.showModal();
}

function updateCart() {
  saveCart();
  const count = cart.reduce((total, item) => total + item.qty, 0);
  $(".cart-count").textContent = count;
  const wrap = $(".cart-items");
  const summary = $(".cart-summary");

  if (!cart.length) {
    wrap.innerHTML = `<div class="empty-cart"><span>0</span><h3>Your bag is waiting.</h3><p>Explore the first DA’POR edition.</p><a href="/#new" class="button black close-and-shop">Shop the drop</a></div>`;
    summary.hidden = true;
    $(".close-and-shop").onclick = closePanels;
    return;
  }

  wrap.innerHTML = cart
    .map(
      (item, index) => `<div class="cart-line">
        <a href="${item.url || `/products/${item.slug}/`}"><img src="${item.img}" alt="${item.title}"></a>
        <div><span class="product-kicker">Qty ${item.qty}</span><h3><a href="${item.url || `/products/${item.slug}/`}">${item.title}</a></h3>
        <p>${[item.color, item.size].filter(Boolean).join(" · ") || item.desc}</p><button data-remove="${index}" type="button">Remove</button></div>
        <strong>${Number.isFinite(item.price) ? money(item.price * item.qty) : money(null)}</strong>
      </div>`,
    )
    .join("");
  $$("[data-remove]").forEach((button) => {
    button.onclick = () => {
      cart.splice(Number(button.dataset.remove), 1);
      updateCart();
    };
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  $(".subtotal").textContent = money(total);
  $(".checkout-button").disabled = false;
  $(".checkout-button").textContent = "Secure checkout";
  $(".cart-summary p").textContent = "Shipping calculated at checkout.";
  const note = $(".cart-summary small");
  if (note) note.textContent = "Encrypted checkout · Easy 30-day returns";
  summary.hidden = false;
}

function openCart() {
  closePanels();
  $(".cart-drawer").classList.add("open");
  $(".cart-drawer").setAttribute("aria-hidden", "false");
  $(".overlay").classList.add("open");
  document.body.classList.add("lock");
}

function closePanels() {
  $$(".cart-drawer,.search-panel,.mobile-menu").forEach((panel) => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  });
  $(".overlay").classList.remove("open");
  document.body.classList.remove("lock");
}

function renderCheckoutItems() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  $(".checkout-items").innerHTML = cart
    .map(
      (item) => `<div class="checkout-line">
        <img src="${item.img}" alt="${item.title}">
        <span>${item.qty}× ${item.title}<br>${[item.color, item.size].filter(Boolean).join(" · ")}</span>
        <strong>${money(item.price * item.qty)}</strong>
      </div>`,
    )
    .join("");
  $(".order-total strong").textContent = money(total);
}

function openCheckout() {
  if (!cart.length) return;
  closePanels();
  renderCheckoutItems();
  $(".checkout-modal").classList.add("open");
  $(".checkout-modal").setAttribute("aria-hidden", "false");
  $(".overlay").classList.add("open");
  document.body.classList.add("lock");
}

function closeCheckout() {
  $(".checkout-modal").classList.remove("open");
  $(".checkout-modal").setAttribute("aria-hidden", "true");
  $(".overlay").classList.remove("open");
  document.body.classList.remove("lock");
}

function showToast(message) {
  const toast = $(".toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function corridorFrames(direction, name) {
  const path = { perspective: 30, cardHeight: 25, birthHeight: 2.6, exitHeight: 46, railBirth: -11, railExit: 44, fan: 3.3, turnBirth: 6, turnExit: 28, stops: 24 };
  const steps = [];
  for (let stop = 0; stop <= path.stops; stop += 1) {
    const progress = stop / path.stops;
    const scale = (path.birthHeight / path.cardHeight) * Math.pow(path.exitHeight / path.birthHeight, progress);
    const z = path.perspective * (1 - 1 / scale);
    const rail = path.railExit - (path.railExit - path.railBirth) * Math.pow(1 - progress, path.fan);
    const turn = path.turnBirth + (path.turnExit - path.turnBirth) * progress;
    steps.push(`${(progress * 100).toFixed(2)}%{transform:translate3d(${(direction * rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-direction * turn).toFixed(2)}deg)}`);
  }
  return `@keyframes ${name}{${steps.join("")}}`;
}

function buildCorridor() {
  if (!$(".stream-right") || !$(".stream-left")) return;
  const style = document.createElement("style");
  style.textContent = corridorFrames(1, "daporRight") + corridorFrames(-1, "daporLeft");
  document.head.appendChild(style);
  const images = ["district-grey-editorial.png", "district-grey-rear-editorial.png", "district-red-editorial.png", "district-red-rear-editorial.png", "district-teal-solo-editorial.png", "district-teal-editorial.png"].map((name) => (typeof window.DAPOR_asset === "function" ? window.DAPOR_asset(name) : `assets/${name}`));
  [".stream-right", ".stream-left"].forEach((selector, side) => {
    const stream = $(selector);
    stream.innerHTML = Array.from(
      { length: 9 },
      (_, index) => `<div class="stream-card" style="animation:${side ? "daporLeft" : "daporRight"} 22s linear infinite;animation-delay:${-(index * 22) / 9}s"><img src="${images[(index + side * 3) % images.length]}" alt="" loading="lazy" decoding="async"></div>`,
    ).join("");
  });
}

function observeReveals() {
  if (!("IntersectionObserver" in window)) {
    $$(".reveal").forEach((element) => element.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.1 },
  );
  $$(".reveal:not(.visible)").forEach((element) => observer.observe(element));
}

function bind(selector, eventName, handler) {
  const element = $(selector);
  if (element) element[eventName] = handler;
}

$$("button.filter").forEach((button) => {
  button.onclick = () => {
    $$("button.filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProducts(button.dataset.filter);
  };
});

bind(".cart-button", "onclick", openCart);
bind(".cart-close", "onclick", closePanels);
bind(".overlay", "onclick", () => ($(".checkout-modal")?.classList.contains("open") ? closeCheckout() : closePanels()));
bind(".checkout-button", "onclick", openCheckout);
bind(".checkout-close", "onclick", closeCheckout);
bind("#checkout-form", "onsubmit", (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector(".stripe-pay-button");
  const email = event.currentTarget.email?.value.trim() || "";
  window.DAPOR_STRIPE.startStripeCheckout(cart, { email, button }).catch((error) => showToast(error.message));
});
bind(".quick-add-close", "onclick", () => $(".quick-add-modal")?.close());
bind(".quick-add-modal", "onclick", (event) => { if (event.target === $(".quick-add-modal")) $(".quick-add-modal").close(); });
bind(".search-button", "onclick", () => {
  closePanels();
  $(".search-panel")?.classList.add("open");
  $(".search-panel")?.setAttribute("aria-hidden", "false");
  $(".overlay")?.classList.add("open");
  $(".search-panel input")?.focus();
});
bind(".panel-close", "onclick", closePanels);
bind(".search-panel button:not(.panel-close)", "onclick", () => {
  const query = $(".search-panel input")?.value.toLowerCase().trim();
  const list = query
    ? products.filter((product) => `${product.title} ${product.desc} ${product.cat} ${product.category}`.toLowerCase().includes(query))
    : products;
  const grid = $(".product-grid");
  if (grid) grid.innerHTML = list.map(productCard).join("");
  const total = $(".product-total");
  if (total) total.textContent = `${list.length} pieces`;
  bindCards();
  closePanels();
  $("#new")?.scrollIntoView({ behavior: "smooth" });
  observeReveals();
});
bind(".account-button", "onclick", () => showToast("Member accounts will connect at launch"));
bind(".menu-button", "onclick", () => {
  $(".mobile-menu")?.classList.add("open");
  $(".mobile-menu")?.setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
});
bind(".menu-close", "onclick", closePanels);
$$(".mobile-menu a").forEach((anchor) => {
  anchor.addEventListener("click", () => closePanels());
});
function applyCategory(name) {
  const filter = $(`button.filter[data-filter="${name}"]`);
  if (!filter) return;
  filter.click();
  $("#new")?.scrollIntoView({ behavior: "smooth" });
}
$$("[data-shop-filter]").forEach((anchor) =>
  anchor.addEventListener("click", (event) => {
    const name = anchor.dataset.shopFilter;
    if ($(`button.filter[data-filter="${name}"]`) && name) {
      event.preventDefault();
      applyCategory(name);
      history.replaceState({}, "", `${window.location.pathname}?cat=${encodeURIComponent(name)}#new`);
    }
  }),
);
const dedicatedCategories = ["men", "women", "kids", "accessories"];
const pageCategory = document.body.dataset.category || "";
const requestedCategory = new URLSearchParams(window.location.search).get("cat");
if (requestedCategory && dedicatedCategories.includes(requestedCategory) && !pageCategory) {
  location.replace(`${requestedCategory}/index.html`);
}
bind("#newsletter-form", "onsubmit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector("#newsletter-email");
  const button = form.querySelector(".newsletter-submit") || form.querySelector("button[type='submit']");
  const email = (input?.value || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Enter a valid email first");
    input?.focus();
    return;
  }
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Joining…";
  try {
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not join right now");
    showToast("You're on the list");
    form.reset();
  } catch {
    showToast("You're on the list — we'll follow up at " + email);
    form.reset();
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
});
window.addEventListener("scroll", () => {
  const header = $(".site-header");
  if (header) header.style.background = window.scrollY > 80 ? "rgba(5,5,5,.97)" : "rgba(5,5,5,.92)";
});

if (new URLSearchParams(window.location.search).get("checkout") === "canceled") {
  showToast("Checkout canceled — your bag is still waiting");
  window.history.replaceState({}, "", window.location.pathname);
}

renderProducts(pageCategory || "all");
buildCorridor();
updateCart();
observeReveals();
if (requestedCategory && !dedicatedCategories.includes(requestedCategory)) applyCategory(requestedCategory);
