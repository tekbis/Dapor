const Stripe = require("stripe");
const catalog = require("./catalog");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500).json({ error: "Stripe is not configured" });
    return;
  }

  const { items, customer = {} } = req.body || {};
  if (!Array.isArray(items) || !items.length) {
    res.status(400).json({ error: "Your bag is empty" });
    return;
  }

  const lines = [];
  for (const item of items) {
    const product = catalog.find((entry) => entry.id === Number(item.id));
    const qty = Number(item.qty);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      res.status(400).json({ error: "Invalid bag items" });
      return;
    }
    lines.push({
      id: product.id,
      title: product.title,
      qty,
      price: product.price
    });
  }

  const amount = lines.reduce((sum, line) => sum + line.price * line.qty * 100, 0);
  if (amount < 50) {
    res.status(400).json({ error: "Order total is too small" });
    return;
  }

  const email = String(customer.email || "").trim();
  const firstName = String(customer.firstName || "").trim();
  const lastName = String(customer.lastName || "").trim();
  const name = `${firstName} ${lastName}`.trim();
  const address = String(customer.address || "").trim();
  const city = String(customer.city || "").trim();
  const zip = String(customer.zip || "").trim();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never"
      },
      receipt_email: email.includes("@") ? email : undefined,
      description: lines.map((line) => `${line.qty}x ${line.title}`).join(", ").slice(0, 999),
      metadata: {
        items: lines.map((line) => `${line.id}:${line.qty}`).join(","),
        email,
        name,
        city,
        zip
      },
      shipping: name && address && city
        ? {
            name,
            address: {
              line1: address,
              city,
              postal_code: zip,
              country: "US"
            }
          }
        : undefined
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(400).json({ error: err.message || "Unable to start payment" });
  }
};
