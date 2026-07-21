/* ============================================================
   NISHANA — shared product catalog + card renderer
   ============================================================
   ONE place to edit products & prices. Used by:
   - category pages (air-pistols, spare-parts, accessories)
   - products.html (all products)
   - index.html (featured)
   - cart.js (cart line items are built from this catalog)
   - product detail pages (related products strip)

   To change a price: edit it here AND regenerate/edit the matching
   product-*.html page price block (they are static for SEO).
   ============================================================ */

window.NISHANA_PRODUCTS = [
  /* ---------------- AIR PISTOLS ---------------- */
  {
    id: "star-rx-gen3", brand: "Camstar", name: "Star RX Gen 3",
    category: "air-pistols", price: 25000, mrp: 29000, badge: "Semi-auto CO₂",
    chips: [".177 CAL", "400 FPS", "CO₂ SEMI-AUTO", "32 RND MAG"],
    desc: "India's first semi-automatic CO₂ air pistol. Black ₹25,000; Coyote Tan ₹26,000. Ships with four 8-round magazines, hard case + holster.",
    image: "https://camstarsports.com/products/star-rx-gen3-1.webp",
    href: "product-rx-gen3.html", buy: true,
  },
  /* Dealer-backed listings: enquiry-only until each order's stock,
     documentation, and applicable legal requirements are confirmed. */
  {
    id: "aerosoft-x1", brand: "Aerosoft", name: "Aerosoft X1 CO₂ Air Pistol",
    category: "air-pistols", price: 36000, mrp: 45000, badge: "Enquiry only",
    chips: ["CO₂", "84FS STYLE", "DEALER SUPPLY"],
    desc: "Dealer-backed CO₂ air-pistol listing. Ask our sales team to confirm the current price, availability and order requirements.",
    image: "img/products/aerosoft-x1/1.webp",
    href: null, buy: false,
  },
  {
    id: "asg-x9-classic", brand: "ASG", name: "ASG X9 Classic CO₂ Air Pistol",
    category: "air-pistols", price: 57000, mrp: 65000, badge: "Enquiry only",
    chips: ["4.5 MM", ".177 STEEL BB", "BLOWBACK"],
    desc: "Full-metal blowback CO₂ air-pistol configuration. Ask our sales team to confirm current availability and order requirements.",
    image: "img/products/asg-x9-classic/1.webp",
    href: null, buy: false,
  },
  {
    id: "beretta-84fs", brand: "Beretta", name: "Beretta Mod. 84 FS CO₂ Air Pistol",
    category: "air-pistols", price: 72000, mrp: 85000, badge: "Enquiry only",
    chips: ["4.5 MM", "BB", "CO₂"],
    desc: "4.5 mm BB CO₂ air-pistol listing. Ask our sales team to confirm the current price, availability and order requirements.",
    image: "img/products/beretta-84fs/1.webp",
    href: null, buy: false,
  },
  {
    id: "beretta-m92-a1", brand: "Beretta", name: "Beretta M92 A1 CO₂ Air Pistol",
    category: "air-pistols", price: 73000, mrp: 85000, badge: "Enquiry only",
    chips: ["4.5 MM", ".177 BB", "CO₂"],
    desc: "4.5 mm .177 BB CO₂ air-pistol listing. Ask our sales team to confirm the current price, availability and order requirements.",
    image: "img/products/beretta-m92-a1/1.webp",
    href: null, buy: false,
  },
  {
    id: "kwc-k18", brand: "KWC", name: "KWC K18 4.5 mm BB CO₂ Pistol",
    category: "air-pistols", price: 58000, mrp: 64000, badge: "Enquiry only",
    chips: ["4.5 MM", "BB", "CO₂"],
    desc: "Dealer-backed K18 CO₂ BB-pistol listing. Availability and all order requirements are confirmed by our sales team before any sale.",
    image: "img/products/kwc-k18/FullSizeRender_5f838eab-803d-45e7-bfcf-87367fd94b79.webp",
    href: null, buy: false,
  },
  {
    id: "kwc-m92", brand: "KWC", name: "KWC M92 4.5 mm BB CO₂ Pistol",
    category: "air-pistols", price: 62000, mrp: 65000, badge: "Enquiry only",
    chips: ["4.5 MM", "BB", "CO₂"],
    desc: "Dealer-backed M92 CO₂ BB-pistol listing. Availability and all order requirements are confirmed by our sales team before any sale.",
    image: "img/products/kwc-m92/FullSizeRender_b28aaf22-b99f-4a33-8ccb-8990e03e7c92.webp",
    href: null, buy: false,
  },
  /* ---------------- ACCESSORIES ---------------- */
  {
    id: "co2-cylinders-5", brand: "Camstar", name: "CO₂ Cylinders — Pack of 5",
    category: "accessories", price: 550,
    chips: ["12 G", "PACK OF 5", "RX GEN 3 READY"],
    desc: "Standard 12 g CO₂ cylinders, pack of five, selected for the Star RX Gen 3.",
    image: "https://camstarsports.com/products/co2-cylinders.jpg",
    href: null, buy: true,
  },
  {
    id: "star-match-pellets", brand: "Camstar", name: "Star Match Diabolo Pellets",
    category: "accessories", price: 450,
    chips: [".177 CAL", "0.524 G", "300 PCS/TIN"],
    desc: "Match-grade .177 (4.5 mm) diabolo pellets, 300 per tin, suited to the Star RX Gen 3.",
    image: "https://camstarsports.com/products/star-match-diabolo.png",
    href: null, buy: true,
  },
  {
    id: "hn-hornet-pellets", brand: "H&N", name: "H&N Hornet Pellets",
    category: "accessories", price: 1750, mrp: 1850, badge: "Enquiry only",
    chips: [".177 CAL", "9.57 GR", "225 CT", "POINTED"],
    desc: "Pointed .177-calibre pellets, 225 per tin. Ask our sales team to confirm the current price and availability.",
    image: "img/products/hn-hornet-pellets/FullSizeRender_301a35f3-1d50-4557-97be-1cbd2492cab8.webp",
    href: null, buy: false,
  },

  /* ---------------- SPARE PARTS (WhatsApp order) ---------------- */
  {
    id: "rx-gen3-magazine", brand: "Camstar", name: "Star RX Gen 3 CO₂ Magazine",
    category: "spare-parts", price: 6499,
    chips: ["GENUINE", "FITS RX GEN 3"],
    desc: "Genuine replacement CO₂ rotary magazine for the Star RX Gen 3 semi-automatic pistol.",
    image: "https://camstarsports.com/products/star-rx-gen3-1.webp",
    href: null, buy: false,
  },
];

/* Additional RX Gen 3 parts are confirmed directly with the sales team. */
window.NISHANA_SMALL_PARTS = [];

/* ------------------------------------------------------------
   Card renderer
   ------------------------------------------------------------ */
(() => {
  const WA = "918329618409";
  const inr = n => "₹" + Number(n).toLocaleString("en-IN");
  const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
  const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2Zm4.4 12c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.3 5.3 0 0 0 1.1 2.7 12 12 0 0 0 4.6 4c2.1.9 2.1.6 2.5.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>';
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  window.nishanaInr = inr;
  window.nishanaWa = wa;

  window.nishanaProductCard = function (p) {
    const off = p.mrp && p.mrp > p.price ? Math.round(100 * (p.mrp - p.price) / p.mrp) : 0;
    const imgWrap = p.href
      ? `<a href="${p.href}" class="shot" aria-label="${p.name} details">`
      : `<div class="shot">`;
    const imgWrapClose = p.href ? `</a>` : `</div>`;
    const title = p.href
      ? `<a href="${p.href}" class="tlink"><h3>${p.name}</h3></a>`
      : `<h3>${p.name}</h3>`;
    const cta = p.buy
      ? `<button class="buy" data-add-to-cart="${p.id}">Buy now ${ARROW}</button>
         <a class="wa" href="${wa(`Hi Nishana! I'd like to talk to your sales team about the ${p.name} (${inr(p.price)}). Please confirm live stock.`)}" target="_blank" rel="noopener">${WA_SVG} Sales team</a>`
      : `<a class="wa wa-wide" href="${wa(`Hi Nishana! I'd like to talk to your sales team about ${p.name} (${inr(p.price)}). Please confirm availability.`)}" target="_blank" rel="noopener">${WA_SVG} Talk to our sales team</a>`;
    return `
    <article class="n-card">
      ${imgWrap}
        ${p.badge ? `<span class="badge-corner">${p.badge}</span>` : ""}
        <img src="${p.image}" alt="${p.brand} ${p.name} — buy online in India" referrerpolicy="no-referrer" loading="lazy">
        ${p.href ? `<span class="view-hint">View details ${ARROW}</span>` : ""}
      ${imgWrapClose}
      <div class="b">
        <div class="brand">${p.brand}</div>
        ${title}
        <div class="chips">${(p.chips || []).map(c => `<span>${c}</span>`).join("")}</div>
        <p class="desc">${p.desc}</p>
        <div class="foot">
          <div class="row">
            <div class="price">${inr(p.price)} ${p.mrp ? `<span class="mrp">${inr(p.mrp)}</span>` : ""}</div>
            ${off ? `<span class="save">Save ${off}%</span>` : ""}
          </div>
          <div class="trust">${p.badge === "Enquiry only" ? "Price & availability confirmed by sales" : "GST invoice · Warranty · Pan-India delivery"}</div>
          <div class="cta-row ${p.buy ? "" : "single"}">${cta}</div>
        </div>
      </div>
    </article>`;
  };

  /* Render every product matching `filter` into `el` */
  window.nishanaRenderGrid = function (el, filter) {
    if (typeof el === "string") el = document.querySelector(el);
    if (!el) return;
    // Remember what to redraw so the async Supabase merge (below) can re-render.
    el._nishanaFilter = filter || (() => true);
    const list = window.NISHANA_PRODUCTS.filter(el._nishanaFilter);
    el.innerHTML = list.map(window.nishanaProductCard).join("");
    _grids.add(el);
  };

  /* ------------------------------------------------------------
     Supabase merge — pulls published rows from public.products and
     merges them into window.NISHANA_PRODUCTS, then re-draws every
     grid that has already been rendered. Safe to fail silently:
     if Supabase is unreachable we fall back to the hardcoded list.
     Non-blocking — grids paint from the hardcoded list first, then
     upgrade when the API returns.
     ------------------------------------------------------------ */
  const _grids = new Set();

  async function mergeSupabaseProducts() {
    if (!window.NISHANA_AUTH?.SUPABASE_URL || window.NISHANA_AUTH.SUPABASE_URL.startsWith("PASTE_")) return;
    try {
      const supabase = await window.getNishanaSupabase();
      const { data, error } = await supabase
        .from("products")
        .select("slug,name,brand,category,price,mrp,badge,chips,short_desc,pdp_url,hero_photo_url,buy_enabled,sort_order,is_published")
        .eq("is_published", true)
        .order("category").order("sort_order").order("name");
      if (error || !data) return;
      // Convert DB rows to the products.js shape the card renderer expects.
      const dbShaped = data.map(r => ({
        id:       r.slug,
        brand:    r.brand || "",
        name:     r.name,
        category: r.category,
        price:    Number(r.price) || 0,
        mrp:      r.mrp ? Number(r.mrp) : undefined,
        badge:    r.badge || undefined,
        chips:    Array.isArray(r.chips) ? r.chips : [],
        desc:     r.short_desc || "",
        image:    r.hero_photo_url || "",
        href:     r.pdp_url || null,
        buy:      r.buy_enabled !== false,
      }));
      // Merge: Supabase supplies live catalogue metadata, but Git-defined
      // price/MRP remain authoritative for known products. This keeps routine
      // price changes deployable through Git without an admin-password prompt.
      const bySlug = new Map(window.NISHANA_PRODUCTS.map(p => [p.id, p]));
      dbShaped.forEach(r => {
        const local = bySlug.get(r.id);
        bySlug.set(r.id, local ? { ...r, price: local.price, mrp: local.mrp } : r);
      });
      window.NISHANA_PRODUCTS = Array.from(bySlug.values());
      // Re-render every grid that was drawn from the hardcoded list.
      _grids.forEach(el => {
        if (!document.body.contains(el)) { _grids.delete(el); return; }
        const list = window.NISHANA_PRODUCTS.filter(el._nishanaFilter);
        el.innerHTML = list.map(window.nishanaProductCard).join("");
      });
    } catch (e) {
      console.debug("[nishana products] Supabase merge skipped:", e?.message || e);
    }
  }
  // Fire the merge on next tick so hardcoded content paints first.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mergeSupabaseProducts);
  else setTimeout(mergeSupabaseProducts, 0);

  /* Compact spare-parts price list */
  window.nishanaRenderParts = function (el) {
    if (typeof el === "string") el = document.querySelector(el);
    if (!el) return;
    el.innerHTML = window.NISHANA_SMALL_PARTS.map(pt => `
      <div class="part-row">
        <div class="pl"><b>${pt.name}</b><small>Fits: ${pt.fits}</small></div>
        <div class="pr">
          <span class="pp">${inr(pt.price)}</span>
          <a class="enq" target="_blank" rel="noopener" href="${wa(`Hi Nishana! I need a spare part: ${pt.name} (${inr(pt.price)}). Model: `)}">${WA_SVG} Enquire</a>
        </div>
      </div>`).join("");
  };
})();
