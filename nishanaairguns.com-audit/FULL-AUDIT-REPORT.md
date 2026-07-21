# nishanaairguns.com — Full SEO Audit (v2)

**Audit date:** 2026-07-20
**Previous audit:** 2026-07-19 (score 75 → this audit 71, **-4 points**)
**Auditor:** Claude Code, `seo-audit` skill (inline analysis; no subagents spawned)
**URLs analyzed:** 29 (full current sitemap.xml + robots.txt + `/llms.txt` probe + 10 new stub-PDP content probes + host variants + 3 retired-URL redirect tests)

---

## Executive Summary

**SEO Health Score: 71 / 100**  ⬇ down 4 points from 75 last audit

**Codex shipped genuine improvements** since the 19‑Jul audit — Hindi guide, safety + first‑100‑shots blogs, older‑blog schema upgrades, self‑hosted images for 7 new SKUs, PDP superlative fix. But two forms of drift dragged the score down:

1. **10 new product PDPs shipped as ~2 KB SPA stubs** — sitemap advertises them at priority 0.9 but Google's raw HTML view sees near-empty pages. Real thin-content risk for the whole domain.
2. **Both of my previous audit's Critical items are STILL open** — `www` subdomain unreachable, `/llms.txt` still 404.

The good news: everything below is fixable in a single-day sprint. Nothing here is a design-time architecture problem.

### Top 5 findings ordered by urgency

1. **`/product-<slug>.html` PDPs for 10 SKUs are 2 KB SPA shells.** Verified: `product-aerosoft-x1.html` (2116 B), `-asg-x9-classic` (2064 B), `-beretta-84fs` (2067 B), `-beretta-m92-a1` (2093 B), `-kwc-k18` (2084 B), `-kwc-m92` (2099 B), `-hn-hornet-pellets` (2149 B), `-co2-cylinders-5` (2016 B), `-star-match-pellets` (2001 B), `-rx-gen3-magazine` (2067 B). All rely on `product-detail.js` for content injection.
2. **`www.nishanaairguns.com` STILL returns HTTP 000** (unchanged from 19‑Jul).
3. **`/llms.txt` STILL 404** (unchanged from 19‑Jul).
4. **4 category pages still <150 words** with zero JSON-LD.
5. **Homepage still no answer-block** for AI Overview eligibility (unchanged from 19‑Jul).

### What's improved since 19‑Jul (credit where due)

- **PDP title superlative retired** — `<title>` is now *"Camstar Star RX Gen 3 .177 CO₂ Air Pistol Price ₹25,000 | Nishana Airguns"*. The "India's First Semi-Auto CO₂ Air Pistol" wording is gone. Well done.
- **3 new blogs live**, each 1750–2000 words with full schema + Speakable:
  - `blog-airgun-safety-india.html`
  - `blog-rx-gen3-first-100-shots.html`
  - `blog-rx-gen3-hindi-guide.html` (Hindi — competitors are English-only in this niche)
- **3 older blogs upgraded** — `star-rx-gen3-review`, `airgun-maintenance`, `home-range-setup` now have `en-IN` + `hreflang` + robots meta + 2 JSON-LD blocks each (they were bare in the prior audit)
- **Sitemap** grew from 19 → 29 URLs; image entries 21 → 32
- **Product images self-hosted** under `/img/products/<slug>/` for the 7 new SKUs — Codex committed the folder. The Camstar-branded SKUs still hotlink from camstarsports.com, though.

### What's regressed / new since 19‑Jul

- **10 stub PDPs** (details above) — added to sitemap without adequate content
- **7 new SKUs added** to `products.js` (Aerosoft, ASG, 2× Beretta, 2× KWC, H&N) with prices exactly matching airpistolindia.com — noted in `PROVENANCE.md` as enquiry-only listings. Legal risk assessment is your call; the SEO impact is neutral.

---

## Scoring Breakdown

| Category | 19‑Jul | 20‑Jul | Δ | Weight | 20‑Jul contribution |
|---|---:|---:|---:|---:|---:|
| Technical SEO | 78 | 72 | ⬇6 | 22% | 15.84 |
| Content Quality | 72 | 62 | ⬇10 | 23% | 14.26 |
| On-Page SEO | 82 | 78 | ⬇4 | 20% | 15.60 |
| Schema / Structured Data | 84 | 78 | ⬇6 | 10% | 7.80 |
| Performance (CWV) | 70 | 70 | — | 10% | 7.00 |
| AI Search Readiness (GEO) | 68 | 72 | ⬆4 | 10% | 7.20 |
| Images | 45 | 60 | ⬆15 | 5% | 3.00 |
| **Total** | **75** | **71** | ⬇4 | | **70.7 → 71** |

Movement explained:
- **Technical drop (-6):** 10 stub PDPs in the sitemap without adequate content
- **Content drop (-10):** same 10 PDPs at HTML-source level average ~50 words each
- **On-Page drop (-4):** stub PDPs have OG tags but no JSON-LD in source
- **Schema drop (-6):** stub PDPs 0 JSON-LD in HTML source (relies on JS)
- **GEO gain (+4):** 3 new blogs shipped with full Speakable + FAQ + answer-box coverage; Hindi content
- **Images gain (+15):** 7 SKUs' images now self-hosted (were all cross-origin last audit)

---

## 1. Technical SEO — 72 / 100  ⬇6

### What's working
- `http://` → `https://` returns `308`
- HSTS (`max-age=63072000`)
- `robots.txt` allowlists 17 AI answer engines explicitly
- All 11 retired product/rifle/blog URLs still 308 to correct replacements (verified live: `air-rifles.html`, `product-mauser-x-matte.html`, `blog-airgun-laws-india.html`)
- `sitemap.xml` uses `xmlns:image` — **32 `image:image` entries across 29 URLs** (up from 21/19)
- Every page has `hreflang="en-IN"` + `x-default` self-alternates; Hindi guide correctly declares `hi-IN`
- Every page has robots meta with `max-image-preview:large, max-snippet:-1`

### Critical

**www subdomain STILL unreachable (unchanged from 19‑Jul).** `curl -I https://www.nishanaairguns.com/` returns `000` (no response). Not a 404, not a redirect — hostname not routed on Vercel. **This has been open for a week.** Fix in Vercel → Project → Settings → Domains → Add `www.nishanaairguns.com` → configure as Redirect to apex. Verify: `curl -I https://www.nishanaairguns.com/` should return `HTTP/2 308` with `Location: https://nishanaairguns.com/`.

### High

**10 new PDPs are SPA stubs in sitemap.xml at high priority.** Verified content of `product-aerosoft-x1.html` (representative sample of all 10):

```html
<!doctype html>
<html lang="en-IN">
<head>
  <title>Aerosoft X1 CO₂ Air Pistol Price ₹36,000 | Nishana Airguns</title>
  <meta name="description" content="..." />
  <!-- canonical, robots, OG, fonts -->
</head>
<body data-page="products">
  <div data-nishana-header></div>
  <main data-product-detail="aerosoft-x1">
    <section class="n-hero">
      <div class="wrap">
        <p class="eyebrow">Aerosoft · Product details</p>
        <h1>Aerosoft <span class="accent">X1</span></h1>
        <p class="lede">Compact .177 CO₂ BB pistol with inventory-backed specifications and clear verification notes.</p>
      </div>
    </section>
  </main>
  <div data-nishana-footer></div>
  <script src="auth.js"></script><script src="products.js"></script><script src="cart.js"></script>
  <script src="layout.js"></script><script src="product-detail.js"></script>
</body>
```

~50 words visible. No specs, no gallery, no schema. `product-detail.js` presumably fetches Supabase and renders content into `<main data-product-detail="...">`.

**Impact.** Google renders JS these days, but:
- Googlebot's render queue is slow for new low-authority domains (weeks vs seconds)
- Bing and most LLM crawlers do NOT render JS reliably
- Even after render, client-injected JSON-LD carries less weight than HTML-source JSON-LD
- All 10 URLs are in the sitemap at `priority=0.9, changefreq=weekly` — Google will crawl them repeatedly
- Google can classify pages en masse as "thin content" for the entire domain if too many low-content URLs are surfaced

**Fix — two options:**

1. **Best (server-render at build time):** Add a Vercel build hook + Node script that reads `public.products` + `public.product_photos` from Supabase and writes real `product-<slug>.html` files at deploy time. Each file has real spec tables, real gallery, real Product/Offer JSON-LD in the HTML source. Rebuild triggered by admin changes to the DB via a Vercel deploy hook.

2. **Fastest (hand-write like RX Gen 3):** Copy the pattern from `product-rx-gen3.html` (26 KB, fully static, real content) for each of the 10 SKUs. Time budget: ~1 hour per PDP with the specs from `Products/SPECS-CHEAT-SHEET.md`. Total: ~8 hours to fix all 10.

### Medium

**Security headers still minimal.** Only HSTS is present. Missing `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. Not urgent; small trust signal for browsers.

---

## 2. Content Quality — 62 / 100  ⬇10

### Word counts (fresh sample)

| Page | Words | H2 | Answer-box | FAQ Qs | Modified |
|---|---:|---:|---:|---:|---:|
| **10 stub PDPs** (each) | **~50** | **0-1** | **0** | **0** | — |
| `blog-rx-gen3-running-cost.html` | 1,984 | 9 | 1 | 5 | 2026-07-18 |
| `blog-airgun-safety-india.html` | 1,998 | 12 | 1 | 4 | 2026-07-18 |
| `blog-rx-gen3-first-100-shots.html` | 1,982 | 12 | 1 | 4 | 2026-07-18 |
| `blog-rx-gen3-buying-guide.html` | 1,913 | 14 | 1 | 4 | 2026-07-18 |
| `blog-legal-no-licence-airguns-india.html` | 1,913 | 9 | 1 | 6 | 2026-07-18 |
| `blog-rx-gen3-price-india.html` | 1,801 | 9 | 1 | 4 | 2026-07-18 |
| `blog-rx-gen3-hindi-guide.html` | 1,748 | 11 | 1 | 4 | 2026-07-18 |
| `product-rx-gen3.html` | 1,449 | 6 | 0 | 6 | — |
| `blog-star-rx-gen3-review.html` | 902 | 8 | 0 | 3 | — |
| `blog-home-range-setup.html` | 859 | 6 | 0 | 3 | — |
| `blog-airgun-maintenance.html` | 782 | 7 | 0 | 3 | — |
| `blog.html` | 564 | 0 | 0 | 0 | — |
| `about.html` | 506 | 2 | 0 | 0 | — |
| `contact.html` | 308 | 1 | 0 | 0 | — |
| `products.html` | 138 | 0 | 0 | 0 | — |
| `spare-parts.html` | 91 | 2 | 0 | 0 | — |
| `air-pistols.html` | 77 | 0 | 0 | 0 | — |
| `accessories.html` | 68 | 1 | 0 | 0 | — |
| `index.html` | 2,755 | 5 | 0 | 0 | — |

### High findings

**Stub PDPs are the primary content quality problem.** Every one of the 10 new PDPs has ~50 words of visible text. Google's threshold for "sufficient main content" is usually 300+ words, and quality-signal-conscious sites publish 500+. See Technical §High for the fix.

**Category pages still <150 words.** Unchanged since 19‑Jul. Fix template per page: 500–800 words = category intro + buyer FAQ (3–5 Qs) + safety block + delivery block + dealer-verification block.

### Medium findings

**3 older blogs still lack `modified_time` + answer-box + Speakable.** `blog-star-rx-gen3-review`, `blog-airgun-maintenance`, `blog-home-range-setup` — Codex upgraded them structurally (en-IN + hreflang + 2 JSON-LD blocks) but didn't add the editorial polish. ~15 min per post.

**No author byline.** Same as prior audit — `Person` schema missing everywhere.

---

## 3. On-Page SEO — 78 / 100  ⬇4

### What's working (unchanged from 19‑Jul)
- Every page has unique title, meta description, canonical, hreflang, robots meta
- Every page has one `<h1>`
- OG `article:published_time` + `modified_time` on new blogs

### High

**10 stub PDPs have OG tags but no JSON-LD in HTML source.** Duplicate of Schema §High. Even without server-rendering, adding a static `<script type="application/ld+json">` Product block per PDP in the HTML source gives Google enough to treat these as products before JS runs.

### Medium

**Homepage still lacks an answer-block.** Unchanged from 19‑Jul.

---

## 4. Schema / Structured Data — 78 / 100  ⬇6

### Coverage matrix (fresh)

| Page | Blocks | Types (unique) |
|---|---:|---|
| `product-rx-gen3.html` | 3 | Product, Brand, Offer, FAQPage, BreadcrumbList, ListItem, Organization, Answer, Question |
| Every new blog | 3 | Article, FAQPage, Speakable, WebPage |
| `index.html` | 2 | Organization, WebSite, ContactPoint |
| `about.html` | 1 | AboutPage, Organization, WebSite, ContactPoint |
| `contact.html` | 1 | ContactPage, Organization, WebSite, ContactPoint |
| `blog.html` | 1 | Blog, BlogPosting[10] |
| `air-pistols.html` | 1 | ItemList |
| **`accessories.html`** | **0** | **—** |
| **`products.html`** | **0** | **—** |
| **`spare-parts.html`** | **0** | **—** |
| **10 new /product-*.html** | **0** | **—** |

### High

**10 new stub PDPs have ZERO JSON-LD in HTML source.** Verified for all 10. Fix: static Product JSON-LD in each template. Minimum viable block:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Aerosoft X1 CO₂ Air Pistol",
  "brand": {"@type": "Brand", "name": "Aerosoft"},
  "image": ["https://nishanaairguns.com/img/products/aerosoft-x1/1.webp"],
  "description": "Compact .177 CO₂ BB pistol...",
  "offers": {
    "@type": "Offer",
    "url": "https://nishanaairguns.com/product-aerosoft-x1.html",
    "priceCurrency": "INR",
    "price": "36000",
    "availability": "https://schema.org/InStock",
    "seller": {"@type": "Organization", "name": "Nishana Airguns"}
  }
}
</script>
```

**3 category pages still have zero schema.** Unchanged from 19‑Jul. Add `ItemList` + `BreadcrumbList`.

### Medium

**No `Person` schema anywhere.** Same as prior audit.

---

## 5. Performance — 70 / 100  (unchanged)

Cannot measure field CWV — site is still too new for CrUX. Improvements will show over the next 30-60 days as GA4 accumulates real users.

### Medium

**Camstar SKU images still cross-origin.** 7 new SKUs self-hosted; 4 Camstar SKUs (star-rx-gen3, co2-cylinders, star-match-pellets, rx-gen3-magazine) still hotlink camstarsports.com.

**10 new PDPs don't include `<img>` in HTML source.** Same crawlability concern as JSON-LD.

### Low

**No responsive `srcset`.** All `<img>` uses default sizing.

---

## 6. AI Search Readiness (GEO) — 72 / 100  ⬆4

### What's working (gains since 19‑Jul)
- 17 AI crawlers allowlisted (unchanged)
- Speakable JSON-LD now on 5+ blogs — added to first-100-shots + safety-india + hindi-guide (was on 5 blogs before; now on 7)
- Hindi guide expands language coverage
- 3 new answer-block-heavy blogs since 19‑Jul

### High

**`/llms.txt` STILL 404 (7-day-old regression).** Nothing to add — same finding as 19‑Jul audit. The content template is in the previous `findings/geo.md`. Trivial ship.

### Medium

**Homepage no answer-block.** Unchanged.

**No original data assets published yet.** State-by-state Arms Rules tracker (highest-AI-citation asset) hasn't shipped.

---

## 7. Images — 60 / 100  ⬆15

### Wins since 19‑Jul
- 7 new SKUs have self-hosted images under `/img/products/<slug>/` — Codex committed the folder
- Sitemap image entries 21 → 32

### Medium

**Camstar SKUs still cross-origin hotlink.** 4 SKUs remain on camstarsports.com — star-rx-gen3, co2-cylinders, star-match-pellets, rx-gen3-magazine.

**10 new PDPs don't include `<img>` in HTML source.** Client-side render only. Bots without JS see 0 images per PDP.

**No responsive `srcset`.**

---

See `ACTION-PLAN.md` for phased priorities.
