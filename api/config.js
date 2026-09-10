module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || "";
  res.status(200).json({
    publishableKey,
    configured: Boolean(publishableKey && process.env.STRIPE_SECRET_KEY)
  });
};
