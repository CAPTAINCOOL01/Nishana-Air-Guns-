# Content Quality — Findings (v2, 2026-07-20)

**Score:** 62 / 100 (⬇ 10 from 72)

## Word counts (fresh sample)

| Page | Words | H2 | Answer-box | FAQ Q | Modified |
|---|---:|---:|---:|---:|---:|
| `index.html` | 2,755 | 5 | 0 | 0 | — |
| **10 new stub PDPs** (each) | **~50** | **0-1** | **0** | **0** | **—** |
| `blog-rx-gen3-running-cost.html` | 1,984 | 9 | 1 | 5 | 2026-07-18 |
| `blog-airgun-safety-india.html` (NEW) | 1,998 | 12 | 1 | 4 | 2026-07-18 |
| `blog-rx-gen3-first-100-shots.html` (NEW) | 1,982 | 12 | 1 | 4 | 2026-07-18 |
| `blog-rx-gen3-buying-guide.html` | 1,913 | 14 | 1 | 4 | 2026-07-18 |
| `blog-legal-no-licence-airguns-india.html` | 1,913 | 9 | 1 | 6 | 2026-07-18 |
| `blog-rx-gen3-price-india.html` | 1,801 | 9 | 1 | 4 | 2026-07-18 |
| `blog-rx-gen3-hindi-guide.html` (NEW) | 1,748 | 11 | 1 | 4 | 2026-07-18 |
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

## Positive signals since 19‑Jul

- **3 new blogs shipped**, each 1750–2000 words with full FAQ + answer-box + Speakable (safety-india, first-100-shots, hindi-guide)
- **PDP title superlative retired** — `product-rx-gen3.html` no longer contains "India's First"
- **Hindi coverage started** — Hindi guide is a competitive moat
- **Every price / legal claim still dated** ("as observed on 18 July 2026")

## High findings

### 10 new PDPs are the primary content quality problem

Every one of the 10 new PDPs has ~50 words of visible text in the HTML source. Google's threshold for "sufficient main content" is 300+ words. See Technical §High for the fix path.

### Category pages still <150 words

Bottom 4 pages remain unchanged since 19‑Jul: `accessories` (68 w), `air-pistols` (77 w), `spare-parts` (91 w), `products` (138 w). All rely on client-side JS to render the product grid. They will not rank for head terms.

**Fix template per page (~2 hrs each):**
- 200-word category intro above the grid
- Buyer FAQ block (3–5 questions) with FAQPage schema
- Safety block (150 words)
- Delivery + returns block (100 words)
- Dealer-verification block (100 words)
- Answer-box at top for AI Overview eligibility

## Medium findings

### 3 older blogs still missing editorial polish

`blog-star-rx-gen3-review.html`, `blog-airgun-maintenance.html`, `blog-home-range-setup.html`:
- No `article:modified_time` meta
- No `.answer-box`
- No Speakable JSON-LD

Codex upgraded them structurally (en-IN + hreflang + 2 JSON-LD blocks) but not editorially. ~15 min per post.

### No named author

Same as 19‑Jul — every `Article.author` still refers to `"Nishana Editorial Desk"` as an `Organization`. Zero `Person` schema exists on the site. Fix: `/authors/ramayana-singh.html` + Person JSON-LD.

### "India's first" scan hits — mostly editorial context, not misleading claims

Grep found "India's first" in:
- `blog-rx-gen3-first-100-shots.html` (1 hit)
- `blog-rx-gen3-running-cost.html` (2 hits)
- `blog-star-rx-gen3-review.html` (3 hits)
- `blog.html` (1 hit)

These are editorial descriptions of the RX Gen 3 as India's first semi-auto CO₂ air pistol — a factual, verifiable claim when contextualised. Not the same risk as the earlier `<title>` superlative (which was in SERPs and has been fixed).
