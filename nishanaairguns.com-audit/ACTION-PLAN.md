# nishanaairguns.com — Action Plan (v2)

**Generated:** 2026-07-20 from `FULL-AUDIT-REPORT.md`
**Current score:** 71/100 (⬇ 4 from 19‑Jul audit)
**Ceiling after Phase 1+2:** ~88/100

Two failure modes since the last audit:
1. **Old critical items still open** — `www.` unreachable, `/llms.txt` 404
2. **New critical items introduced** — 10 stub PDPs shipped in the sitemap

---

## Phase 0 — Undo the score drop (2–4 hours, do first)

The 4‑point regression is 100% attributable to the 10 new stub PDPs. Fix them before anything else.

### 0.1 — 10 stub PDPs need real content

**Files affected** (all ~2 KB, sitemap priority 0.9):
- `product-aerosoft-x1.html`
- `product-asg-x9-classic.html`
- `product-beretta-84fs.html`
- `product-beretta-m92-a1.html`
- `product-kwc-k18.html`
- `product-kwc-m92.html`
- `product-hn-hornet-pellets.html`
- `product-co2-cylinders-5.html`
- `product-star-match-pellets.html`
- `product-rx-gen3-magazine.html`

Each currently contains: title + meta + OG + a `<main data-product-detail="<slug>">` hook + `product-detail.js` script. That's it. `product-detail.js` fetches from Supabase and renders client-side.

**Two paths — pick one:**

**Path A — Server-render at build time (best long-term):**
1. Add `scripts/build-pdps.mjs` — reads `public.products` + `public.product_photos` from Supabase (uses the admin API key at build time, not runtime) and writes real `product-<slug>.html` files with:
   - Real spec table from `products.chips` + `products.specs`
   - Real gallery from `product_photos`
   - Static `<script type="application/ld+json">` Product block with price, availability, images
   - Full body copy from `products.long_desc` (or fallback to `short_desc`)
2. Add build step to `vercel.json` `buildCommand`: `node scripts/build-pdps.mjs && ...`
3. Add Vercel deploy hook that triggers a redeploy when admin edits `products` via the dashboard

Advantages: PDPs stay in sync with admin edits, no double maintenance, real HTML for Google.
Disadvantage: needs a service role key in Vercel env vars.

**Path B — Hand-write 10 static HTMLs (fastest, no infra):**
1. Copy `product-rx-gen3.html` (26 KB, fully static, proven pattern) as template
2. For each of the 10 SKUs, create a real HTML file with specs from `Products/SPECS-CHEAT-SHEET.md`
3. Time estimate: ~40 min per PDP × 10 = ~7 hours total. Split across 2 days.

Advantages: no build infra, no admin↔PDP sync complexity, works today.
Disadvantage: manual sync each time admin edits.

**Recommendation:** Path B for the 10 existing SKUs (ship in 2 days), Path A later when the admin gets more churn.

---

## Phase 1 — Critical fixes still open from 19‑Jul (30 min total)

| # | Action | Effort | Notes |
|---|---|---|---|
| 1.1 | **Fix `www` subdomain** — Vercel domain alias with 308 to apex | 5 min | Unchanged from 19‑Jul. Codex hasn't done this. |
| 1.2 | **Ship `/llms.txt`** at site root | 10 min | Unchanged from 19‑Jul. Content template in previous `findings/geo.md`. |
| 1.3 | **Add ItemList + BreadcrumbList JSON-LD** to `accessories.html`, `products.html`, `spare-parts.html` | 15 min | Unchanged from 19‑Jul. |

Phase 1 estimated score impact: +3 points (71 → 74).

---

## Phase 2 — High-impact improvements (1 week)

| # | Action | Effort | Notes |
|---|---|---|---|
| 2.1 | **Expand 4 category pages to 500–800 words** with H2 structure + FAQ + safety/delivery/dealer-verification blocks | 2 hr each × 4 = 1 day | Reuse content from `blog-rx-gen3-buying-guide.html` with fresh angles. |
| 2.2 | **Self-host 4 remaining Camstar images** under `/img/products/` and update `products.js` references | 30 min | 4 SKUs: star-rx-gen3, co2-cylinders, star-match-pellets, rx-gen3-magazine. |
| 2.3 | **Add answer-box + Speakable JSON-LD to homepage** | 30 min | 60–100 word factual block near hero. |
| 2.4 | **Retrofit 3 older blogs** with `article:modified_time` + `.answer-box` + Speakable JSON-LD | 45 min | `blog-star-rx-gen3-review`, `blog-airgun-maintenance`, `blog-home-range-setup`. |
| 2.5 | **Add security headers to `vercel.json`** — X-Content-Type-Options, Referrer-Policy, Permissions-Policy | 10 min | Trust signal. |
| 2.6 | **Add responsive `srcset`** to `<img>` tags on self-hosted images | 20 min per template | Cuts mobile bytes ~60%. |

Phase 2 estimated score impact: +8 points (74 → 82).

---

## Phase 3 — Content & authority (month 2)

| # | Action | Effort | Notes |
|---|---|---|---|
| 3.1 | Create `/authors/ramayana-singh.html` with `Person` JSON-LD; switch every Article `author` to reference it | 1 hr | E-E-A-T lift. |
| 3.2 | Publish first original data asset — **state-by-state Arms Rules 2016 airgun tracker** (counsel-reviewed) | 1 week (counsel + design) | Highest single AI-citation asset for this niche. |
| 3.3 | Publish 2 more Hindi guides — safety + purchase-decision | Half day each | Hindi long-tail has near-zero competition. |
| 3.4 | Start weekly AI-citation observation log — 12 canonical prompts across ChatGPT + Perplexity + Google AI Overview, logged in `geo_observations` | 30 min/week | Baseline citation-rate data in 4 weeks. |

Phase 3 estimated score impact: +3 points (82 → ~85). Real value: compounding traffic + citations, not the score.

---

## Phase 4 — Monitoring & iteration (ongoing)

- Weekly manual AI-citation checks (12 baseline prompts, per prior `findings/geo.md`)
- Monthly refresh of dated price research (`blog-rx-gen3-price-india`)
- Quarterly rerun of this audit (`/seo-audit`) to catch drift
- GSC + Bing WMT weekly review once traffic data appears (~day 21 from GSC verification)

---

## Recap of what's not in this plan (deliberately)

- **Backlink acquisition** — tracked separately; human outreach not code
- **Paid ads / Merchant Center** — airguns policy-restricted; needs its own compliance review
- **Multi-brand expansion** — happening organically through Codex-added SKUs; storefront positioning is drifting from "One airgun. Chosen well." — a positioning decision, not a technical decision
- **Rebuild to Next.js / bundler** — do not touch; static HTML architecture is a strength

---

## Immediate next single commit (recommended)

Combine Phase 1 items 1.1, 1.2, 1.3 (Vercel-dashboard aside) into one commit:

- **New file:** `llms.txt` at site root (~30 lines, content template in prior audit)
- **`accessories.html`, `products.html`, `spare-parts.html`:** add ItemList + BreadcrumbList JSON-LD

That single commit raises the health score from 71 to 74 in under 30 minutes of work. **The 10 stub PDPs (Phase 0) is the bigger job** and worth a dedicated 2-day sprint.

Reply "**ship Phase 1**" and I'll produce the diffs (I still won't touch the protected files: `layout.js` + Codex-touched HTML unless you say otherwise).
