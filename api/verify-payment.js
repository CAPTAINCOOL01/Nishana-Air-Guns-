// =============================================================
// Nishana Airguns — Razorpay: verify payment signature
// POST /api/verify-payment
//   body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Returns 200 { verified: true } only when the HMAC matches.
// =============================================================
const crypto = require("crypto");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return res.status(500).json({ error: "Razorpay secret not configured on server" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, error: "Missing required fields" });
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Constant-time comparison to avoid timing side-channels.
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(razorpay_signature, "hex");
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!ok) return res.status(400).json({ verified: false, error: "Signature mismatch" });

    return res.status(200).json({
      verified: true,
      razorpay_order_id,
      razorpay_payment_id,
    });
  } catch (err) {
    return res.status(500).json({ verified: false, error: err?.message || "Verification failed" });
  }
};
