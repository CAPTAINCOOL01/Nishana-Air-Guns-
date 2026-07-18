/* ============================================================
   NISHANA — Supabase auth config + shared client loader
   Loaded (as a plain script) on every page BEFORE cart.js/layout.js.
   ============================================================
   Roles are enforced by Supabase RLS + the app_staff table
   (see supabase-schema.sql). This file holds the client keys,
   a resilient loader that gives every page ONE shared Supabase
   client, and a helper that reads the caller's role.
   ============================================================ */

window.NISHANA_AUTH = {
  SUPABASE_URL:      "https://qmxgzocrfioxwvxhdtda.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteGd6b2NyZmlveHd2eGhkdGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMTA5MzAsImV4cCI6MjA5OTY4NjkzMH0.OeUGSR1eHESGILAtLrRI53bHGd_Tw8rFHvnn7DkJ9Hc",

  // Fallback (used only if the DB lookup fails or you haven't
  // run supabase-schema.sql yet). Once the schema is loaded,
  // roles are read from the public.app_staff table.
  ADMIN_EMAILS:  ["ramayanaprav@gmail.com", "pubxplode@gmail.com"],
  DEALER_EMAILS: [],  // add dealer Gmail addresses here when you invite dealers
};

/* ------------------------------------------------------------
   Shared Supabase client.
   Tries three CDNs in order so one flaky/blocked CDN can never
   leave a page stuck on a spinner. Every page shares ONE client
   (one auth session, one token refresher).
   ------------------------------------------------------------ */
(() => {
  let clientPromise = null;

  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = resolve;
    s.onerror = () => { s.remove(); reject(new Error("Failed to load " + src)); };
    document.head.appendChild(s);
  });

  async function loadLib() {
    if (window.supabase?.createClient) return window.supabase;
    const cdns = [
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js",
      "https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js",
    ];
    let lastErr;
    for (const src of cdns) {
      try {
        await loadScript(src);
        if (window.supabase?.createClient) return window.supabase;
      } catch (e) { lastErr = e; }
    }
    try { return await import("https://esm.sh/@supabase/supabase-js@2"); }
    catch (e) { lastErr = e; }
    throw lastErr || new Error("Could not load the Supabase library from any CDN.");
  }

  window.getNishanaSupabase = function () {
    if (!clientPromise) {
      clientPromise = (async () => {
        const cfg = window.NISHANA_AUTH;
        const { createClient } = await loadLib();
        return createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      })().catch((e) => { clientPromise = null; throw e; });
    }
    return clientPromise;
  };
})();

// Convenience helper — resolves the current user's role.
// Returns one of: "admin" | "dealer" | "customer" | null (not signed in)
window.getNishanaRole = async function (supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const email = (user.email || "").toLowerCase();

  // 1) Ask the database (authoritative — respects the app_staff table)
  try {
    const { data, error } = await supabase
      .from("app_staff")
      .select("role")
      .eq("email", email)
      .maybeSingle();
    if (error) console.warn("[nishana role lookup]", error.message);
    if (data?.role) return data.role;
  } catch { /* table may not exist yet; fall through */ }

  // 2) Fallback to the constants above
  const cfg = window.NISHANA_AUTH;
  if ((cfg.ADMIN_EMAILS  || []).map(s => s.toLowerCase()).includes(email)) return "admin";
  if ((cfg.DEALER_EMAILS || []).map(s => s.toLowerCase()).includes(email)) return "dealer";
  return "customer";
};
