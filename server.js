require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const Stripe = require("stripe");
const catalog = require("./catalog-data");

const app = express();
const PORT = Number(process.env.PORT) || 4242;
const catalogById = new Map(catalog.map((product) => [Number(product.id), product]));
const ordersFile = path.join(__dirname, "orders.json");

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("your_secret_key")) {
    const error = new Error("Add your Stripe secret key to the .env file.");
    error.status = 503;
    throw error;
  }
  return new Stripe(key);
}

function originFrom(req) {
  const configured = String(process.env.DOMAIN || "").replace(/\/$/, "");
  if (configured) return configured;
  return `${req.protocol}://${req.get("host")}`;
}

function sanitizeCancelPath(value) {
  const fallback = "/index.html";
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.includes("://")) return fallback;
  return value.slice(0, 300);
}

function recordOrder(session) {
  const orders = fs.existsSync(ordersFile) ? JSON.parse(fs.readFileSync(ordersFile, "utf8") || "[]") : [];
  if (orders.some((order) => order.id === session.id)) return;
  orders.unshift({
    id: session.id,
    created: new Date().toISOString(),
    email: session.customer_details?.email || session.customer_email || "",
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    items: session.metadata?.items || "",
  });
  fs.writeFileSync(ordersFile, JSON.stringify(orders.slice(0, 200), null, 2));
}

app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.includes("your_webhook_secret")) {
    return res.status(503).send("Webhook secret is not configured.");
  }

  let event;
  try {
    event = stripeClient().webhooks.constructEvent(req.body, req.headers["stripe-signature"], secret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") recordOrder(session);
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "32kb" }));
app.use(express.static(__dirname));

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) {
      return res.status(400).json({ error: "Your bag is empty." });
    }

    const lineItems = [];
    const summary = [];
    let subtotalCents = 0;

    for (const item of items) {
      const product = catalogById.get(Number(item.id));
      const qty = Math.max(1, Math.min(10, Number(item.qty) || 0));
      if (!product || !qty) {
        return res.status(400).json({ error: "One of the items in your bag is no longer available." });
      }
      if (item.size && !product.sizes.includes(item.size)) {
        return res.status(400).json({ error: `Choose a valid size for ${product.title}.` });
      }
      if (item.color && !product.colors.includes(item.color)) {
        return res.status(400).json({ error: `Choose a valid color for ${product.title}.` });
      }

      const unitAmount = Math.round(product.price * 100);
      subtotalCents += unitAmount * qty;
      const details = [item.color, item.size].filter(Boolean).join(" · ");
      const origin = originFrom(req);
      lineItems.push({
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: product.title,
            description: details || product.slug,
            images: [`${origin}/assets/${product.image}`],
            metadata: {
              product_id: String(product.id),
              size: item.size || "",
              color: item.color || "",
            },
          },
        },
      });
      summary.push(`${qty}× ${product.title}${details ? ` (${details})` : ""}`);
    }

    const shippingCents = subtotalCents >= 15000 ? 0 : 800;
    const origin = originFrom(req);
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const cancelPath = sanitizeCancelPath(req.body?.cancelPath);
    const stripe = stripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}${cancelPath.includes("?") ? "&" : "?"}checkout=canceled`,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingCents, currency: "usd" },
            display_name: shippingCents ? "Standard U.S. shipping" : "Complimentary U.S. shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      allow_promotion_codes: true,
      customer_email: email || undefined,
      metadata: { items: summary.join(" | ").slice(0, 500) },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Unable to start Stripe checkout." });
  }
});

app.get("/api/checkout-session", async (req, res) => {
  try {
    const sessionId = String(req.query.session_id || "");
    if (!sessionId.startsWith("cs_")) {
      return res.status(400).json({ error: "Missing checkout session." });
    }
    const session = await stripeClient().checkout.sessions.retrieve(sessionId);
    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      email: session.customer_details?.email || session.customer_email || "",
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Unable to load this order." });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid checkout request." });
  }
  next(error);
});

app.listen(PORT, () => {
  console.log(`DA’POR store running at http://localhost:${PORT}`);
});
