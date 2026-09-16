const products = window.DAPOR_PRODUCTS || [];
const CART_KEY = "dapor_cart_v2";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let cart = loadCart();
let currentProduct = null;
let selectedSize = "";
let selectedColor = "";
let selectedColorImage = "";
let quantity = 1;
let activeImage = 0;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

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

function productSlug() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const productIndex = parts.indexOf("products");
  return productIndex >= 0 ? parts[productIndex + 1] : "";
}

const homeUrl = window.DAPOR_home || "../../index.html";

function galleryImages(product) { return product.images; }

function productMarkup(product) {
  const related = product.related
    .map((id) => products.find((item) => item.id === id))
    .filter(Boolean);

  return `
    <div class="product-shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="${homeUrl}">Home</a><span aria-hidden="true">/</span><a href="${homeUrl}#collection">Collection</a><span aria-hidden="true">/</span><span>${escapeHTML(product.title)}</span>
      </nav>

      <section class="product-layout" aria-labelledby="product-title">
        <div class="product-gallery" aria-label="${escapeHTML(product.title)} image gallery">
          <div class="gallery-thumbnails"></div>
          <div class="gallery-main">
            <img src="${product.images[0].src}" alt="${escapeHTML(product.images[0].alt)}">
            <span class="gallery-count">1 / ${product.images.length}</span>
          </div>
        </div>

        <div class="product-details">
          <div class="product-meta"><span class="product-category">${escapeHTML(product.category)}</span><span class="stock-status">${escapeHTML(product.stock)}</span></div>
          <p class="eyebrow dark">${escapeHTML(product.edition)}</p>
          <h1 id="product-title">${escapeHTML(product.title)}</h1>
          <a class="product-rating-link" href="#product-reviews"><span></span><span class="rating-copy">Read reviews</span></a>
          <p class="product-price">${money(product.price)}</p>
          <p class="product-lead">${escapeHTML(product.description)}</p>

          <div class="product-options">
            <fieldset class="option-group size-group" aria-labelledby="size-option-label">
              <div class="option-head"><span class="option-label" id="size-option-label">Choose size <span aria-hidden="true">*</span></span><button class="size-guide-button" type="button">Size guide</button></div>
              <div class="size-choices">${product.sizes.map((size) => `<button class="size-choice" type="button" data-size="${escapeHTML(size)}" aria-pressed="false">${escapeHTML(size)}</button>`).join("")}</div>
            </fieldset>

            <fieldset class="option-group color-group" aria-labelledby="color-option-label">
              <div class="option-head"><span class="option-label" id="color-option-label">Choose color <span aria-hidden="true">*</span></span><span class="selected-color-label" aria-live="polite"></span></div>
              <div class="color-choices">${product.colors.map((item) => `<button class="color-choice" type="button" data-color="${escapeHTML(item.name)}" data-image="${item.image}" aria-pressed="false"><i style="--swatch:${item.value}"></i>${escapeHTML(item.name)}</button>`).join("")}</div>
            </fieldset>

            <div class="purchase-row">
              <div class="quantity-control" aria-label="Quantity selector">
                <button type="button" class="quantity-minus" aria-label="Decrease quantity">−</button>
                <input class="quantity-input" type="number" min="1" max="10" value="1" aria-label="Quantity">
                <button type="button" class="quantity-plus" aria-label="Increase quantity">+</button>
              </div>
              <button class="product-add-button" type="button">Add to cart · ${money(product.price)}</button>
            </div>
            <p class="pricing-note">$120 per piece. Complimentary U.S. shipping on orders $150+.</p>
            <p class="option-error" role="alert" aria-live="polite"></p>
          </div>

          <div class="product-accordions">
            <details open><summary>Product description</summary><div>${escapeHTML(product.description)}</div></details>
            <details><summary>Product information</summary><div><ul>${product.info.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul><p><strong>Category:</strong> ${escapeHTML(product.category)}</p></div></details>
            <details><summary>Materials & care</summary><div><p>${escapeHTML(product.material)}</p><p>${escapeHTML(product.care)}</p></div></details>
            <details><summary>Fit & sizing</summary><div><p>${escapeHTML(product.fit)}</p><button class="size-guide-button inline-size-guide" type="button">Open ${product.category === "Graphic shorts" ? "shorts" : "hoodie"} size guide</button></div></details>
            <details><summary>Design references</summary><div><p>Original supplied print artwork is shown here for design detail. The modeled gallery above shows how the item is worn; styling pieces are sold separately.</p><div class="reference-grid">${(product.artwork || []).map((image) => `<a href="${escapeHTML(image.src)}" target="_blank" rel="noopener"><img src="${escapeHTML(image.src)}" alt="${escapeHTML(image.alt)}" loading="lazy"><span>${escapeHTML(image.alt)} ↗</span></a>`).join("")}</div></div></details>
            <details id="shipping-returns"><summary>Shipping & returns</summary><div>${escapeHTML(product.shipping)}</div></details>
          </div>
        </div>
      </section>
    </div>

    <section class="product-reviews" id="product-reviews" aria-labelledby="reviews-title">
      <div class="reviews-wrap">
        <div class="reviews-heading">
          <div><p class="eyebrow dark">Worn with conviction</p><h2 id="reviews-title">Customer reviews</h2></div>
          <div class="rating-overview"><strong>—</strong><div><span class="overview-stars"></span><small class="review-count">No reviews yet</small></div></div>
        </div>
        <div class="reviews-content">
          <div class="review-list"></div>
          <form class="review-form">
            <h3>Leave a review</h3>
            <p>Share your experience with this piece.</p>
            <span class="option-label">Your rating</span>
            <div class="star-picker" role="radiogroup" aria-label="Star rating">
              ${[5, 4, 3, 2, 1].map((rating) => `<label class="star-option" aria-label="${rating} star${rating === 1 ? "" : "s"}"><input type="radio" name="rating" value="${rating}" required><span aria-hidden="true">★</span></label>`).join("")}
            </div>
            <label>Your name<input type="text" name="name" maxlength="60" required autocomplete="name"></label>
            <label>Your review<textarea name="review" maxlength="800" required placeholder="Tell us about the quality, fit and finish."></textarea></label>
            <button class="review-submit" type="submit">Submit review</button>
            <small class="review-form-note">Your review will appear on this device after submission.</small>
          </form>
        </div>
      </div>
    </section>

    <section class="related-products" aria-labelledby="related-title">
      <div class="related-wrap">
        <div class="related-heading"><div><p class="eyebrow dark">Continue the uniform</p><h2 id="related-title">You may also like</h2></div><a href="${homeUrl}#collection">View all pieces</a></div>
        <div class="related-grid">${related.map(relatedCard).join("")}</div>
      </div>
    </section>`;
}

function relatedCard(product) {
  return `<a class="related-card" href="${product.url}" aria-label="View ${escapeHTML(product.title)}">
    <div class="related-image"><img src="${product.img}" alt="${escapeHTML(product.title)}" loading="lazy"></div>
    <div><span>${escapeHTML(product.category)}</span><h3>${escapeHTML(product.title)}</h3><strong>${money(product.price)}</strong></div>
  </a>`;
}

function renderGallery() {
  const images = galleryImages(currentProduct);
  const thumbnails = $(".gallery-thumbnails");
  thumbnails.innerHTML = images.map((image, index) => `<button class="gallery-thumb${index === activeImage ? " active" : ""}" type="button" data-gallery-index="${index}" aria-label="View image ${index + 1}" aria-pressed="${index === activeImage}"><img src="${image.src}" alt="" style="object-position:${image.position};transform:scale(${Math.min(image.zoom, 1.18)})"></button>`).join("");
  const active = images[activeImage];
  const mainImage = $(".gallery-main img");
  mainImage.style.opacity = "0";
  window.setTimeout(() => {
    mainImage.src = active.src;
    mainImage.alt = active.alt;
    mainImage.style.objectPosition = active.position;
    mainImage.style.transform = `scale(${active.zoom})`;
    mainImage.style.opacity = "1";
  }, 90);
  $(".gallery-count").textContent = `${activeImage + 1} / ${images.length}`;
  $$(".gallery-thumb").forEach((button) => {
    button.onclick = () => {
      activeImage = Number(button.dataset.galleryIndex);
      renderGallery();
    };
  });
}

function bindProductOptions() {
  $$(".size-choice").forEach((button) => {
    button.onclick = () => {
      selectedSize = button.dataset.size;
      $$(".size-choice").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      $(".option-error").textContent = "";
    };
  });

  $$(".color-choice").forEach((button) => {
    button.onclick = () => {
      selectedColor = button.dataset.color;
      selectedColorImage = button.dataset.image;
      activeImage = 0;
      $$(".color-choice").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      $(".selected-color-label").textContent = selectedColor;
      $(".option-error").textContent = "";
      renderGallery();
    };
  });

  const quantityInput = $(".quantity-input");
  const setQuantity = (value) => {
    quantity = Math.max(1, Math.min(10, Number(value) || 1));
    quantityInput.value = quantity;
  };
  $(".quantity-minus").onclick = () => setQuantity(quantity - 1);
  $(".quantity-plus").onclick = () => setQuantity(quantity + 1);
  quantityInput.onchange = () => setQuantity(quantityInput.value);
  $(".product-add-button").onclick = addSelectedProduct;
}

function addSelectedProduct() {
  const missing = [!selectedSize && "a size", !selectedColor && "a color"].filter(Boolean);
  if (missing.length) {
    $(".option-error").textContent = `Please select ${missing.join(" and ")} before adding this item.`;
    const target = !selectedSize ? $(".size-group") : $(".color-group");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const key = `${currentProduct.id}:${selectedSize}:${selectedColor}`;
  const existing = cart.find((item) => item.key === key);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      key,
      id: currentProduct.id,
      slug: currentProduct.slug,
      url: currentProduct.url,
      title: currentProduct.title,
      desc: currentProduct.desc,
      price: currentProduct.price,
      img: currentProduct.img,
      size: selectedSize,
      color: selectedColor,
      qty: quantity,
    });
  }
  saveCart();
  updateCart();
  const button = $(".product-add-button");
  button.classList.add("added");
  button.textContent = "✓ Added to cart";
  showToast(`${currentProduct.title} added to your bag`);
  window.setTimeout(() => {
    button.classList.remove("added");
    button.textContent = `Add to cart · ${money(currentProduct.price)}`;
  }, 1500);
}

function storedReviews() {
  try {
    const stored = JSON.parse(localStorage.getItem(`dapor_reviews_${currentProduct.slug}`) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function renderReviews() {
  const reviews = [...storedReviews(), ...currentProduct.reviews];
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
    : null;
  $(".review-list").innerHTML = reviews.length
    ? reviews.map((review) => `<article class="customer-review">
    <div class="review-author"><strong>${escapeHTML(review.name)}</strong><span>${escapeHTML(review.date)}</span></div>
    <div class="review-body"><div class="stars" aria-label="${review.rating} out of 5 stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div><p>${escapeHTML(review.text)}</p></div>
  </article>`).join("")
    : '<p class="empty-reviews">No reviews for this design yet. Be the first to share your experience.</p>';
  $(".rating-overview strong").textContent = average === null ? "—" : average.toFixed(1);
  $(".overview-stars").textContent = reviews.length ? "★★★★★" : "";
  $(".product-rating-link span:first-child").textContent = reviews.length ? "★★★★★" : "";
  $(".rating-copy").textContent = reviews.length
    ? `${average.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
    : "Be the first to review";
  $(".review-count").textContent = reviews.length
    ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}`
    : "No reviews yet";
}

function bindReviewForm() {
  $(".review-form").onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const review = {
      name: String(data.get("name") || "").trim(),
      rating: Number(data.get("rating")),
      text: String(data.get("review") || "").trim(),
      date: "Submitted today",
    };
    if (!review.name || !review.text || !review.rating) return;
    const reviews = storedReviews();
    reviews.unshift(review);
    localStorage.setItem(`dapor_reviews_${currentProduct.slug}`, JSON.stringify(reviews.slice(0, 20)));
    event.currentTarget.reset();
    renderReviews();
    showToast("Thank you — your review has been added");
  };
}

function updateCart() {
  saveCart();
  const count = cart.reduce((total, item) => total + item.qty, 0);
  $(".cart-count").textContent = count;
  const wrap = $(".cart-items");
  const summary = $(".cart-summary");
  if (!cart.length) {
    wrap.innerHTML = `<div class="empty-cart"><span>0</span><h3>Your bag is waiting.</h3><p>Explore the first DA’POR edition.</p><a href="${homeUrl}#new" class="button black close-and-shop">Shop the drop</a></div>`;
    summary.hidden = true;
    return;
  }
  wrap.innerHTML = cart.map((item, index) => `<div class="cart-line">
    <a href="${escapeHTML(item.url || `/products/${item.slug}/`)}"><img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.title)}"></a>
    <div><span class="product-kicker">Qty ${item.qty}</span><h3><a href="${escapeHTML(item.url || `/products/${item.slug}/`)}">${escapeHTML(item.title)}</a></h3><p>${escapeHTML([item.color, item.size].filter(Boolean).join(" · ") || item.desc)}</p><button data-remove="${index}" type="button">Remove</button></div>
    <strong>${Number.isFinite(item.price) ? money(item.price * item.qty) : money(null)}</strong>
  </div>`).join("");
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
        <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.title)}">
        <span>${item.qty}× ${escapeHTML(item.title)}<br>${escapeHTML([item.color, item.size].filter(Boolean).join(" · "))}</span>
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
  window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function openSearch() {
  closePanels();
  $(".search-panel").classList.add("open");
  $(".search-panel").setAttribute("aria-hidden", "false");
  $(".overlay").classList.add("open");
  $(".search-panel input").focus();
}

function runSearch() {
  const query = $(".search-panel input").value.toLowerCase().trim();
  const matches = query
    ? products.filter((product) => `${product.title} ${product.desc} ${product.category}`.toLowerCase().includes(query))
    : products.slice(0, 4);
  $(".search-results").innerHTML = matches.length
    ? matches.slice(0, 8).map((product) => `<a class="search-result" href="${product.url}"><img src="${product.img}" alt=""><span><strong>${escapeHTML(product.title)}</strong><br>${money(product.price)}</span></a>`).join("")
    : `<p>No pieces match “${escapeHTML(query)}”.</p>`;
}

function bindSharedUI() {
  $(".cart-button").onclick = openCart;
  $(".cart-close").onclick = closePanels;
  $(".overlay").onclick = () => ($(".checkout-modal").classList.contains("open") ? closeCheckout() : closePanels());
  $(".checkout-button").onclick = openCheckout;
  $(".checkout-close").onclick = closeCheckout;
  $("#checkout-form").onsubmit = (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector(".stripe-pay-button");
    const email = event.currentTarget.email?.value.trim() || "";
    window.DAPOR_STRIPE.startStripeCheckout(cart, { email, button }).catch((error) => showToast(error.message));
  };
  $(".search-button").onclick = openSearch;
  $(".panel-close").onclick = closePanels;
  $(".run-search").onclick = runSearch;
  $(".search-panel input").onkeydown = (event) => {
    if (event.key === "Enter") runSearch();
  };
  $(".account-button").onclick = () => showToast("Member accounts will connect at launch");
  $(".menu-button").onclick = () => {
    $(".mobile-menu").classList.add("open");
    $(".mobile-menu").setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");
  };
  $(".menu-close").onclick = closePanels;
  $$(".mobile-menu a").forEach((link) => { link.onclick = closePanels; });
  window.addEventListener("scroll", () => {
    $(".site-header").style.background = window.scrollY > 80 ? "rgba(5,5,5,.97)" : "rgba(5,5,5,.92)";
  });
}

function bindSizeGuide() {
  const modal = $(".size-guide-modal");
  const sections = $$(".size-guide-section");
  // Each item receives a focused chart, not the entire supplier spreadsheet.
  const isShorts = currentProduct?.category === "Graphic shorts";
  const focused = isShorts ? sections[2] : sections[1];
  if (focused) {
    focused.classList.add("focused-chart");
    sections.forEach((section, index) => { if (index === 1 || index === 2) section.hidden = section !== focused; });
    const heading = focused.querySelector("h3");
    heading.textContent = isShorts ? "2. Graphic shorts" : "2. Zip hoodie";
    sections[3].querySelector("h3").textContent = "3. How to measure";
    $("#size-guide-title").textContent = isShorts ? "Shorts size guide" : "Hoodie size guide";
    const table = focused.querySelector("table");
    if (table && isShorts) {
      const rows = [["S",28,34,19,7],["M",30,37,19.5,7.25],["L",32,40,20,7.5],["XL",34,43,20.5,7.75],["2XL",36,47,21,8],["3XL",39,51,21.5,8.25],["4XL",42,55,22,8.5],["5XL",45,59,22.5,8.75]];
      table.innerHTML = `<thead><tr><th>Size</th><th>Waist relaxed</th><th>Waist stretched</th><th>Outseam</th><th>Inseam</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>`;
    } else if (table) {
      const rows = [["S",22,27],["M",23.5,28],["L",25,29],["XL",26.5,30],["2XL",28,31],["3XL",30,32],["4XL",32,33],["5XL",34,34]];
      table.innerHTML = `<thead><tr><th>Size</th><th>Chest width (flat)</th><th>Hoodie length</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>`;
    }
  }
  const open = () => {
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  };
  $$(".size-guide-button,.footer-size-guide").forEach((button) => { button.onclick = open; });
  $(".size-guide-close").onclick = () => modal.close();
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
}

function init() {
  currentProduct = products.find((product) => product.slug === productSlug());
  if (!currentProduct) {
    $("#product-root").innerHTML = `<section class="product-not-found"><p class="eyebrow dark">Collection</p><h1>Piece not found</h1><p>This item may have moved or is no longer part of the current edition.</p><a class="button black" href="${homeUrl}#collection">Return to the collection</a></section>`;
    updateCart();
    bindSharedUI();
    bindSizeGuide();
    return;
  }

  document.title = `${currentProduct.title} — DA’POR Millionaires`;
  const description = document.querySelector('meta[name="description"]');
  description.setAttribute("content", currentProduct.description);
  $("#product-root").innerHTML = productMarkup(currentProduct);
  renderGallery();
  bindProductOptions();
  renderReviews();
  bindReviewForm();
  updateCart();
  bindSharedUI();
  bindSizeGuide();
  if (new URLSearchParams(window.location.search).get("checkout") === "canceled") {
    showToast("Checkout canceled — your bag is still waiting");
    window.history.replaceState({}, "", window.location.pathname);
  }
}

init();
