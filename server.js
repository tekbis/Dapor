require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const Stripe = require("stripe");
const catalog = require("./catalog-data");

const app = express();
const PORT = Number(process.env.PORT) || 4242;
const ordersFile = path.join(__dirname, "orders.json");
const newsletterFile = path.join(__dirname, "newsletter.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const newsletterHits = new Map();

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
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return `http://localhost:${PORT}`;
      }
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return `http://localhost:${PORT}`;
    }
  }
  const host = String(req.get("host") || "");
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) {
    return `http://localhost:${PORT}`;
  }
  const proto = req.protocol === "https" ? "https" : "http";
  return `${proto}://${host}`;
}

function sanitizeCancelPath(value) {
  const fallback = "/index.html";
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://") || value.includes("..")) {
    return fallback;
  }
  if (!/^\/[A-Za-z0-9/_.?=&#%-]{0,200}$/.test(value)) return fallback;
  return value.slice(0, 200);
}

function readJsonArray(file) {
  try {
    if (!fs.existsSync(file)) return [];
    const data = JSON.parse(fs.readFileSync(file, "utf8") || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeJsonArray(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function recordOrder(session) {
  const orders = readJsonArray(ordersFile);
  if (orders.some((order) => order.id === session.id)) return;
  orders.unshift({
    id: session.id,
    created: new Date().toISOString(),
    email: session.customer_details?.email || session.customer_email || "",
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    items: String(session.metadata?.items || "").slice(0, 500),
  });
  writeJsonArray(ordersFile, orders.slice(0, 200));
}

function checkoutProduct(id) {
  return catalog.find((item) => Number(item.id) === Number(id)) || null;
}

function colorNames(product) {
  if (!product) return [];
  if (Array.isArray(product.colors) && product.colors.length && typeof product.colors[0] === "object") {
    return product.colors.map((item) => item.name);
  }
  return product.colors || [];
}

function imageUrl(product, origin) {
  const src = String(product.image || product.img || "");
  if (/^https:\/\//i.test(src)) return src;
  if (src.startsWith("/assets/") && !src.includes("..")) return `${origin}${src}`;
  if (/^[A-Za-z0-9._-]+\.(png|jpe?g|webp|gif|svg)$/i.test(src)) return `${origin}/assets/${src}`;
  return "";
}

function clientIp(req) {
  return String(req.ip || req.socket?.remoteAddress || "unknown").slice(0, 64);
}

function tooManyNewsletter(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const stamps = (newsletterHits.get(ip) || []).filter((time) => now - time < windowMs);
  if (stamps.length >= 8) {
    newsletterHits.set(ip, stamps);
    return true;
  }
  stamps.push(now);
  newsletterHits.set(ip, stamps);
  return false;
}

function publicSlug(value) {
  return /^[a-z0-9-]+$/i.test(String(value || ""));
}

function blockedStaticPath(urlPath) {
  let clean;
  try {
    clean = decodeURIComponent(String(urlPath || "").split("?")[0]).replace(/\\/g, "/").toLowerCase();
  } catch {
    return true;
  }
  if (
    clean === "/server.js" ||
    clean === "/catalog-data.js" ||
    clean === "/package.json" ||
    clean === "/package-lock.json" ||
    clean === "/orders.json" ||
    clean === "/newsletter.json" ||
    clean === "/.env" ||
    clean === "/.env.example" ||
    clean === "/.gitignore"
  ) {
    return true;
  }
  return (
    clean.startsWith("/node_modules") ||
    clean.startsWith("/.git") ||
    clean.startsWith("/data/") ||
    clean.startsWith("/uploads") ||
    clean.startsWith("/.")
  );
}

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use((req, res, next) => {
  if (blockedStaticPath(req.path)) return res.status(404).end();
  next();
});

app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.includes("your_webhook_secret")) {
    return res.status(503).send("Webhook secret is not configured.");
  }

  let event;
  try {
    event = stripeClient().webhooks.constructEvent(req.body, req.headers["stripe-signature"], secret);
  } catch {
    return res.status(400).send("Webhook Error");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      try {
        recordOrder(session);
      } catch {
        // Keep Stripe's retry loop from hanging on a local write failure.
      }
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "32kb" }));

app.post("/api/newsletter", (req, res) => {
  if (tooManyNewsletter(clientIp(req))) {
    return res.status(429).json({ error: "Please wait before joining again." });
  }
  const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 254);
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Enter a valid email." });
  }
  try {
    const list = readJsonArray(newsletterFile);
    if (!list.some((entry) => entry.email === email)) {
      list.unshift({ email, created: new Date().toISOString() });
      writeJsonArray(newsletterFile, list.slice(0, 2000));
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Could not join right now." });
  }
});

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items.slice(0, 20) : [];
    if (!items.length) {
      return res.status(400).json({ error: "Your bag is empty." });
    }

    const lineItems = [];
    const summary = [];
    let subtotalCents = 0;

    for (const item of items) {
      const product = checkoutProduct(item.id);
      const qty = Math.max(1, Math.min(10, Number(item.qty) || 0));
      if (!product || !qty || product.comingSoon) {
        return res.status(400).json({ error: "One of the items in your bag is no longer available." });
      }
      const sizes = product.sizes || [];
      const colors = colorNames(product);
      if (item.size && sizes.length && !sizes.includes(item.size)) {
        return res.status(400).json({ error: `Choose a valid size for ${product.title}.` });
      }
      if (item.color && colors.length && !colors.includes(item.color)) {
        return res.status(400).json({ error: `Choose a valid color for ${product.title}.` });
      }

      const unitAmount = Math.round(Number(product.price) * 100);
      if (!Number.isFinite(unitAmount) || unitAmount < 50) {
        return res.status(400).json({ error: "One of the items in your bag is no longer available." });
      }
      subtotalCents += unitAmount * qty;
      const details = [item.color, item.size].filter(Boolean).join(" · ");
      const origin = originFrom(req);
      const photo = imageUrl(product, origin);
      lineItems.push({
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: product.title,
            description: details || product.slug,
            images: photo ? [photo] : [],
            metadata: {
              product_id: String(product.id),
              size: String(item.size || "").slice(0, 40),
              color: String(item.color || "").slice(0, 80),
            },
          },
        },
      });
      summary.push(`${qty}× ${product.title}${details ? ` (${details})` : ""}`);
    }

    const shippingCents = subtotalCents >= 15000 ? 0 : 800;
    const origin = originFrom(req);
    const rawEmail = typeof req.body?.email === "string" ? req.body.email.trim().slice(0, 254) : "";
    const email = EMAIL_RE.test(rawEmail) ? rawEmail : "";
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

    if (!session.url || !/^https:\/\/checkout\.stripe\.com\//i.test(session.url)) {
      return res.status(500).json({ error: "Unable to start Stripe checkout." });
    }

    res.json({ url: session.url });
  } catch (error) {
    const message = error.status === 503 ? error.message : "Unable to start Stripe checkout.";
    res.status(error.status || 500).json({ error: message });
  }
});

app.get("/api/checkout-session", async (req, res) => {
  try {
    const sessionId = String(req.query.session_id || "");
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId) || sessionId.length > 200) {
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
    const message = error.status === 503 ? error.message : "Unable to load this order.";
    res.status(error.status || 500).json({ error: message });
  }
});

app.get(["/products/:slug", "/products/:slug/"], (req, res, next) => {
  if (!publicSlug(req.params.slug)) return next();
  const productsRoot = path.resolve(__dirname, "products");
  const file = path.resolve(productsRoot, req.params.slug, "index.html");
  const relative = path.relative(productsRoot, file);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(file)) return next();
  return res.sendFile(file);
});

["men", "women", "kids", "accessories"].forEach((slug) => {
  app.get([`/${slug}`, `/${slug}/`], (req, res, next) => {
    const file = path.join(__dirname, slug, "index.html");
    if (fs.existsSync(file)) return res.sendFile(file);
    next();
  });
});

app.use(express.static(__dirname, {
  dotfiles: "deny",
  index: ["index.html"],
  fallthrough: true,
  setHeaders(res, filePath) {
    if (/\.(js|css|json|svg|png|jpe?g|webp|gif|ico)$/i.test(filePath)) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    }
  },
}));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid request." });
  }
  if (req.path.startsWith("/api/")) {
    return res.status(error.status || 500).json({ error: "Request failed." });
  }
  next(error);
});

app.listen(PORT, () => {
  console.log(`DA’POR store running at http://localhost:${PORT}`);
});
