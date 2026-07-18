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
    category: "air-pistols", price: 24000, mrp: 27500, badge: "Semi-auto CO₂",
    chips: [".177 CAL", "400 FPS", "CO₂ SEMI-AUTO", "32 RND MAG"],
    desc: "India's first semi-automatic CO₂ air pistol. 32-round rotary magazine, five colourways, ships with hard case + holster.",
    image: "https://camstarsports.com/products/star-rx-gen3-1.webp",
    href: "product-rx-gen3.html", buy: true,
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
          <div class="trust">GST invoice · Warranty · Pan-India delivery</div>
          <div class="cta-row ${p.buy ? "" : "single"}">${cta}</div>
        </div>
      </div>
    </article>`;
  };

  /* Render every product matching `filter` into `el` */
  window.nishanaRenderGrid = function (el, filter) {
    if (typeof el === "string") el = document.querySelector(el);
    if (!el) return;
    const list = window.NISHANA_PRODUCTS.filter(filter || (() => true));
    el.innerHTML = list.map(window.nishanaProductCard).join("");
  };

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
