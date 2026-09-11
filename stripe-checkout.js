(function () {
  const CART_KEY = "dapor_cart_v2";

  async function startStripeCheckout(cart, options = {}) {
    if (!Array.isArray(cart) || !cart.length) {
      throw new Error("Your bag is empty.");
    }

    const button = options.button;
    const original = button ? button.textContent : "";
    if (button) {
      button.disabled = true;
      button.textContent = "Redirecting to Stripe…";
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: options.email || "",
          cancelPath: `${window.location.pathname}${window.location.search}`,
          items: cart.map((item) => ({
            id: item.id,
            qty: item.qty,
            size: item.size || "",
            color: item.color || "",
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Stripe checkout could not start.");
      }
      window.location.href = data.url;
    } catch (error) {
      if (button) {
        button.disabled = false;
        button.textContent = original || "Pay securely with Stripe";
      }
      if (error && error.name === "TypeError") {
        throw new Error("Open the store with npm start, then use http://localhost:4242");
      }
      throw error;
    }
  }

  function clearPaidCart() {
    localStorage.removeItem(CART_KEY);
  }

  window.DAPOR_STRIPE = { startStripeCheckout, clearPaidCart };
})();
