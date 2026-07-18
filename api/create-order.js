// =============================================================
// Nishana Airguns — Razorpay: create order
// POST /api/create-order  body: { amount, receipt?, notes? }
//   amount is in PAISE (100 paise = ₹1). Minimum 100.
// Returns: { order_id, amount, currency, key_id }
// key_id is safe to send to the browser — Razorpay's public key.
// =============================================================
const Razorpay = require("razorpay");

module.exports = async (req, res) => {
  // CORS — the storefront is same-origin on Vercel, but be safe if someone
  // calls this from a custom domain or a preview URL.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay credentials not configured on server" });
  }

  try {
    // Vercel parses JSON automatically when Content-Type is application/json.
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const amount   = Number(body.amount);
    const receipt  = String(body.receipt || `nishana_${Date.now()}`).slice(0, 40);
    const notes    = body.notes && typeof body.notes === "object" ? body.notes : {};

    if (!Number.isFinite(amount) || amount < 100) {
      return res.status(400).json({ error: "amount must be a positive integer in paise (min 100)" });
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({
      amount: Math.round(amount),
      currency: "INR",
      receipt,
      notes,
    });

    return res.status(200).json({
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency,
      key_id:   keyId,   // safe: this is Razorpay's public key
    });
  } catch (err) {
    // Razorpay SDK errors include statusCode on the error object.
    const status = err?.statusCode === 401 ? 401 : 500;
    return res.status(status).json({
      error: err?.error?.description || err?.message || "Could not create order",
    });
  }
};
