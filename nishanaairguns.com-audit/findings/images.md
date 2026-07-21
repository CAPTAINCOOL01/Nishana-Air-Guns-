# Images — Findings (v2, 2026-07-20)

**Score:** 60 / 100 (⬆ 15 from 45)

## Positive since 19‑Jul

- **7 new SKUs' images are self-hosted** under `/img/products/<slug>/` — Codex committed the folder to git and Vercel deploys them
- **Sitemap image entries: 32** (was 21)
- PDP for RX Gen 3 still has 4-image JSON-LD gallery

## Medium

### Camstar SKU images still cross-origin hotlink (4 SKUs)

Not fully migrated. Still on `camstarsports.com`:
- `star-rx-gen3-*.webp/png` (4 hero images)
- `co2-cylinders.jpg`
- `star-match-diabolo.png`
- `rx-gen3-magazine` (uses `star-rx-gen3-1.webp` as placeholder)

**Fix:** copy these 6 files to `/img/products/` and update `products.js` references. Camstar URLs remain valid as fallbacks; keep as comments for reference.

### 10 new PDPs don't include `<img>` in HTML source

Same client-render concern as JSON-LD. Bots without JS see zero images per PDP.

**Fix:** in each PDP template, add the primary `<img>` (with `width`, `height`, `alt`) in the static HTML above the `data-product-detail` hook. Something like:

```html
<img src="/img/products/aerosoft-x1/1.webp"
     width="800" height="800"
     alt="Aerosoft X1 CO₂ Air Pistol — hero shot"
     loading="eager"
     fetchpriority="high" />
```

### No responsive `srcset`

All `<img>` uses default sizing. Once self-hosted images are complete:

```html
<img src="/img/products/aerosoft-x1/1-800.webp"
     srcset="/img/products/aerosoft-x1/1-400.webp 400w,
             /img/products/aerosoft-x1/1-800.webp 800w,
             /img/products/aerosoft-x1/1-1200.webp 1200w"
     sizes="(max-width: 640px) 90vw, (max-width: 1200px) 60vw, 800px"
     alt="Aerosoft X1 CO₂ Air Pistol"
     width="800" height="800" />
```

`width` + `height` prevent CLS. `loading="lazy"` for below-fold. `fetchpriority="high"` for the LCP hero.

## Positive

- Alt text present on all `<img>` I sampled
- `sitemap.xml` uses `xmlns:image` extension
- PDP JSON-LD `image` array correct on `product-rx-gen3.html`
