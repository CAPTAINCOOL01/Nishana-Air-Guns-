/* ============================================================
   NISHANA — shared product catalog + card renderer
   ============================================================
   ONE place to edit products & prices. Used by:
   - category pages (air-pistols, air-rifles, spare-parts, accessories)
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
    category: "air-pistols", price: 24000, mrp: 27500, badge: "India's №1",
    chips: [".177 CAL", "400 FPS", "CO₂ SEMI-AUTO", "32 RND MAG"],
    desc: "India's first semi-automatic CO₂ air pistol. 32-round rotary magazine, five colourways, ships with hard case + holster.",
    image: "https://camstarsports.com/products/star-rx-gen3-1.webp",
    href: "product-rx-gen3.html", buy: true,
  },
  {
    id: "mauser-x-matte", brand: "Camstar", name: "Mauser X Matte",
    category: "air-pistols", price: 7999, badge: "Gen 2 Bestseller",
    chips: [".177 CAL", "SPRING PISTON", "MATTE FINISH"],
    desc: "India's first Gen 2 air pistol — the best-selling spring pistol in a tough matte finish. Zero consumables, just pellets.",
    image: "https://camstarsports.com/products/star-mauser-x-1.png",
    href: "product-mauser-x-matte.html", buy: true,
  },
  {
    id: "star-leo", brand: "Camstar", name: "Star Leo",
    category: "air-pistols", price: 6900, badge: "Beginner pick",
    chips: [".177 CAL", "480 FPS", "SPRING PISTON"],
    desc: "The ideal first pistol — affordable, simple to cock and shoot, and built to survive thousands of plinking sessions.",
    image: "https://camstarsports.com/products/star-leo-1.webp",
    href: "product-star-leo.html", buy: true,
  },

  /* ---------------- AIR RIFLES ---------------- */
  {
    id: "star-zxi", brand: "Camstar", name: "Star ZXi",
    category: "air-rifles", price: 11999, mrp: 12999,
    chips: [".177 CAL", "870 FPS", "SPRING BREAK-BARREL", "6 COLOURS"],
    desc: "Spring-action break barrel with 870 FPS punch at an entry-friendly price. Six factory colours including Camo and Wooden.",
    image: "https://camstarsports.com/products/star-zxi-new-1.webp",
    href: "product-star-zxi.html", buy: true,
  },
  {
    id: "star-matrix-gold", brand: "Camstar", name: "Star Matrix Gold",
    category: "air-rifles", price: 12999, mrp: 14999, badge: "Best seller",
    chips: [".177 CAL", "870 FPS", "NITRO PISTON", "AUTO SAFETY"],
    desc: "Camstar's best-value nitro-piston rifle — 20 J of smooth, spring-free power with automatic trigger safety.",
    image: "https://camstarsports.com/products/star-matrix-gold-new-1.webp",
    href: "product-star-matrix-gold.html", buy: true,
  },
  {
    id: "star-hercules-rf", brand: "Camstar", name: "Star Hercules RF",
    category: "air-rifles", price: 13999, mrp: 14999,
    chips: [".177 CAL", "870 FPS", "SPRING BREAK-BARREL", "20 J"],
    desc: "A powerful spring rifle for demanding field and target use. Full-power 20 J platform with metallic rear sight.",
    image: "https://camstarsports.com/products/star-matrix-rf-new-1.webp",
    href: "product-star-hercules-rf.html", buy: true,
  },
  {
    id: "star-px", brand: "Camstar", name: "Star PX (PCP)",
    category: "air-rifles", price: 28999, mrp: 30999,
    chips: [".177 CAL", "PCP", "10-RND MAG", "90 SHOTS/FILL", "SUPPRESSED"],
    desc: "Pre-charged pneumatic with integrated suppressor, two-stage trigger and 90 consistent shots per fill. Spare magazine included.",
    image: "https://camstarsports.com/products/star-px-new-1.webp",
    href: "product-star-px.html", buy: true,
  },
  {
    id: "star-pxi-combo", brand: "Camstar", name: "Star PXi — Complete Combo",
    category: "air-rifles", price: 31000, badge: "Best value combo",
    chips: [".177 CAL", "PCP", "SCOPE + PUMP + BAG"],
    desc: "The everything-included PCP kit: Star PXi rifle + telescopic scope + PCP hand pump + padded rifle bag. Shoot the day it arrives.",
    image: "https://camstarsports.com/products/star-pxi-1.webp",
    href: "product-star-pxi-combo.html", buy: true,
  },

  /* ---------------- ACCESSORIES ---------------- */
  {
    id: "co2-cylinders-5", brand: "Camstar", name: "CO₂ Cylinders — Pack of 5",
    category: "accessories", price: 550,
    chips: ["12 G", "PACK OF 5", "FITS ALL CO₂ GUNS"],
    desc: "Standard 12 g CO₂ cylinders, pack of five. Compatible with the Star RX Gen 3 and every CO₂ airgun sold here.",
    image: "https://camstarsports.com/products/co2-cylinders.jpg",
    href: null, buy: true,
  },
  {
    id: "star-match-pellets", brand: "Camstar", name: "Star Match Diabolo Pellets",
    category: "accessories", price: 450,
    chips: [".177 CAL", "0.524 G", "300 PCS/TIN"],
    desc: "Match-grade .177 (4.5 mm) diabolo pellets, 300 per tin. Universal fit — feed them to any airgun on this site.",
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
  {
    id: "pcp-magazine-x", brand: "Camstar", name: "PCP Magazine — Star X Series",
    category: "spare-parts", price: 1099,
    chips: ["GENUINE", "10 RND", "FITS PX / PXi"],
    desc: "Genuine 10-round replacement magazine for the Star PX and Star PXi PCP rifles.",
    image: "https://camstarsports.com/products/star-px-new-1.webp",
    href: null, buy: false,
  },
];

/* Small parts ordered over WhatsApp (prices confirmed on chat with live stock) */
window.NISHANA_SMALL_PARTS = [
  { name: "Nitro Piston 40 Bar",        price: 2500, fits: "Spring-action models" },
  { name: "Nitro Piston 60 Bar",        price: 3000, fits: "Star Matrix Gold, Hercules RF" },
  { name: "PCP Suppressor",             price: 2000, fits: "Star PX / PXi" },
  { name: "PCP Lever",                  price: 1499, fits: "Star PX / PXi" },
  { name: "Metal Muzzle",               price: 599,  fits: "Camstar rifles" },
  { name: "Spring Piston",              price: 599,  fits: "Star Hercules models" },
  { name: "Rear Sight (adjustable)",    price: 499,  fits: "Camstar rifles" },
  { name: "Hercules Mainspring",        price: 249,  fits: "Star Hercules RF" },
  { name: "Spring 60 Bar",              price: 180,  fits: "Camstar spring rifles" },
  { name: "Spring 40 Bar",              price: 160,  fits: "Camstar spring rifles" },
  { name: "Front / Rifle Sight",        price: 99,   fits: "Camstar air rifles" },
  { name: "Butt O-Ring (Red/Black)",    price: 99,   fits: "Camstar rifles" },
  { name: "Rifle Muzzle",               price: 89,   fits: "Camstar air rifles" },
  { name: "Leo Lever / Leo Muzzle",     price: 79,   fits: "Star Leo pistol" },
];

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
         <a class="wa" href="${wa(`Hi Nishana! I'm interested in the ${p.name} (${inr(p.price)}). Please confirm live stock.`)}" target="_blank" rel="noopener">${WA_SVG} WhatsApp</a>`
      : `<a class="wa wa-wide" href="${wa(`Hi Nishana! I'd like to order: ${p.name} (${inr(p.price)}). Please confirm availability.`)}" target="_blank" rel="noopener">${WA_SVG} Order on WhatsApp</a>`;
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
