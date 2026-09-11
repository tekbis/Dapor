const products = window.DAPOR_PRODUCTS || [];
const reviewData = [
  {
    q: "The weight and finish feel exceptional. It has the presence of a luxury piece, but I can actually live in it.",
    name: "Marcus T.",
    item: "Black Legacy Tracksuit",
  },
  {
    q: "The ivory set looks even better in person. Clean fit, beautiful detail, and it arrived like a genuine luxury purchase.",
    name: "Aaliyah R.",
    item: "Ivory Heritage Tracksuit",
  },
  {
    q: "I bought the hoodie for a trip and ended up wearing it the whole weekend. Compliments every time.",
    name: "Jordan C.",
    item: "Onyx Crest Hoodie",
  },
];

const CART_KEY = "dapor_cart_v2";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let reviewIndex = 0;
let cart = loadCart();

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

function productCard(product) {
  return `
    <article class="product-card reveal" data-cat="${product.cat}" data-url="${product.url}" tabindex="0" aria-label="View ${product.title}">
      <div class="product-image">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
        <button class="wishlist" aria-label="Add ${product.title} to wishlist" type="button">♡</button>
        <a href="${product.url}" aria-label="View ${product.title}"><img src="${product.img}" alt="${product.title}" loading="lazy" onerror="this.onerror=null;this.src=this.src.replace('.webp','.png')"></a>
      </div>
      <div class="product-info">
        <span class="product-kicker">${product.edition}</span>
        <h3><a href="${product.url}">${product.title}</a></h3>
        <p>${product.desc}</p>
        <div class="product-bottom"><span class="price">${money(product.price)}</span><span class="rating">★★★★★ 4.9</span></div>
        <a class="add-to-cart" href="${product.url}">Choose options</a>
      </div>
    </article>`;
}

function renderProducts(filter = "all") {
  const list = filter === "all" ? products : products.filter((product) => product.cat.includes(filter));
  $(".product-grid").innerHTML = list.map(productCard).join("");
  $(".product-total").textContent = `${list.length} pieces`;
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
}

function updateCart() {
  saveCart();
  const count = cart.reduce((total, item) => total + item.qty, 0);
  $(".cart-count").textContent = count;
  const wrap = $(".cart-items");
  const summary = $(".cart-summary");

  if (!cart.length) {
    wrap.innerHTML = `<div class="empty-cart"><span>0</span><h3>Your bag is waiting.</h3><p>Explore the first DA’POR edition.</p><a href="${(window.DAPOR_PATHS && window.DAPOR_PATHS.homeUrl("#new")) || "./index.html#new"}" class="button black close-and-shop">Shop the drop</a></div>`;
    summary.hidden = true;
    $(".close-and-shop").onclick = closePanels;
    return;
  }

  wrap.innerHTML = cart
    .map(
      (item, index) => `<div class="cart-line">
        <a href="${item.url || (window.DAPOR_PATHS && window.DAPOR_PATHS.productUrl(item.slug)) || `./products/${item.slug}/index.html`}"><img src="${item.img}" alt="${item.title}"></a>
        <div><span class="product-kicker">Qty ${item.qty}</span><h3><a href="${item.url || (window.DAPOR_PATHS && window.DAPOR_PATHS.productUrl(item.slug)) || `./products/${item.slug}/index.html`}">${item.title}</a></h3>
        <p>${[item.color, item.size].filter(Boolean).join(" · ") || item.desc}</p><button data-remove="${index}" type="button">Remove</button></div>
        <strong>${money(item.price * item.qty)}</strong>
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

function openCheckout() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  $(".checkout-items").innerHTML = cart
    .map(
      (item) => `<div class="checkout-line"><img src="${item.img}" alt=""><span>${item.title}<br>${[item.color, item.size, `Qty ${item.qty}`].filter(Boolean).join(" · ")}</span><strong>${money(item.price * item.qty)}</strong></div>`,
    )
    .join("");
  $(".order-total strong").textContent = money(total);
  closePanels();
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

function renderReview() {
  const review = reviewData[reviewIndex];
  $(".review-card blockquote").textContent = `“${review.q}”`;
  $(".review-card p strong").textContent = review.name;
  $(".review-card p span").textContent = `Verified buyer · ${review.item}`;
  $$(".review-avatars img").forEach((avatar, index) => {
    avatar.style.transform = index === reviewIndex ? "scale(1.12)" : "scale(1)";
    avatar.style.borderColor = index === reviewIndex ? "#b58834" : "#111";
  });
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
  const style = document.createElement("style");
  style.textContent = corridorFrames(1, "daporRight") + corridorFrames(-1, "daporLeft");
  document.head.appendChild(style);
  const images = products.map((product) => product.img);
  [".stream-right", ".stream-left"].forEach((selector, side) => {
    const stream = $(selector);
    stream.innerHTML = Array.from(
      { length: 9 },
      (_, index) => `<div class="stream-card" style="animation:${side ? "daporLeft" : "daporRight"} 18s linear infinite;animation-delay:${-(index * 18) / 9}s"><img src="${images[index % images.length]}" alt=""></div>`,
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

$$(".filter").forEach((button) => {
  button.onclick = () => {
    $$(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProducts(button.dataset.filter);
  };
});

$(".cart-button").onclick = openCart;
$(".cart-close").onclick = closePanels;
$(".overlay").onclick = () => ($(".checkout-modal").classList.contains("open") ? closeCheckout() : closePanels());
$(".search-button").onclick = () => {
  closePanels();
  $(".search-panel").classList.add("open");
  $(".search-panel").setAttribute("aria-hidden", "false");
  $(".overlay").classList.add("open");
  $(".search-panel input").focus();
};
$(".panel-close").onclick = closePanels;
$(".search-panel button:not(.panel-close)").onclick = () => {
  const query = $(".search-panel input").value.toLowerCase().trim();
  const list = query
    ? products.filter((product) => `${product.title} ${product.desc} ${product.cat} ${product.category}`.toLowerCase().includes(query))
    : products;
  $(".product-grid").innerHTML = list.map(productCard).join("");
  $(".product-total").textContent = `${list.length} pieces`;
  bindCards();
  closePanels();
  $("#new").scrollIntoView({ behavior: "smooth" });
  observeReveals();
};
$(".account-button").onclick = () => showToast("Member accounts will connect at launch");
$(".menu-button").onclick = () => {
  $(".mobile-menu").classList.add("open");
  $(".mobile-menu").setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
};
$(".menu-close").onclick = closePanels;
$$(".mobile-menu a").forEach((anchor) => (anchor.onclick = closePanels));
$(".checkout-button").onclick = openCheckout;
$(".checkout-close").onclick = closeCheckout;
$(".review-arrow.next").onclick = () => {
  reviewIndex = (reviewIndex + 1) % reviewData.length;
  renderReview();
};
$(".review-arrow.prev").onclick = () => {
  reviewIndex = (reviewIndex - 1 + reviewData.length) % reviewData.length;
  renderReview();
};
$("#newsletter-form").onsubmit = (event) => {
  event.preventDefault();
  showToast("Welcome to the DA’POR circle");
  event.target.reset();
};
$("#checkout-form").onsubmit = (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector(".stripe-pay-button");
  const email = event.currentTarget.email?.value.trim() || "";
  window.DAPOR_STRIPE.startStripeCheckout(cart, { email, button }).catch((error) => showToast(error.message));
};
$$("[data-shop-filter]").forEach((anchor) =>
  anchor.addEventListener("click", () => {
    const filter = $(`.filter[data-filter="${anchor.dataset.shopFilter}"]`);
    if (filter) filter.click();
  }),
);
window.addEventListener("scroll", () => {
  $(".site-header").style.background = window.scrollY > 80 ? "rgba(5,5,5,.97)" : "rgba(5,5,5,.92)";
});

if (new URLSearchParams(window.location.search).get("checkout") === "canceled") {
  showToast("Checkout canceled — your bag is still waiting");
  window.history.replaceState({}, "", window.location.pathname);
}

renderProducts();
buildCorridor();
updateCart();
observeReveals();
