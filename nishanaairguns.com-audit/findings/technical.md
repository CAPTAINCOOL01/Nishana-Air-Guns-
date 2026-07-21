# Technical SEO — Findings (v2, 2026-07-20)

**Score:** 72 / 100 (⬇ 6 from 78)

## What's working (unchanged from prior audit + additions)

- `http://` → `https://` returns `308`
- HSTS present (`max-age=63072000`)
- `robots.txt` clean, 17 AI answer engines allowlisted, `/api/` blocked
- 11 retired URLs still 308 to correct replacements
- `sitemap.xml` uses `xmlns:image` extension — **32 image entries across 29 URLs** (was 21/19)
- Every page has `hreflang="en-IN"` + `x-default`; Hindi guide uses `hi-IN`
- Every page has robots meta with `max-image-preview:large`

## Critical

### www subdomain STILL unreachable (7-day-old regression)

`curl -I https://www.nishanaairguns.com/` returns `000`. Same finding as 19‑Jul.

**Fix:** Vercel → Project → Settings → Domains → Add `www.nishanaairguns.com` → Redirect to apex.

## High

### 10 new product PDPs are SPA stubs advertised in the sitemap

Verified via `curl` — all 10 are ~2 KB HTML shells:

| PDP | Bytes |
|---|---:|
| `product-aerosoft-x1.html` | 2,116 |
| `product-asg-x9-classic.html` | 2,064 |
| `product-beretta-84fs.html` | 2,067 |
| `product-beretta-m92-a1.html` | 2,093 |
| `product-kwc-k18.html` | 2,084 |
| `product-kwc-m92.html` | 2,099 |
| `product-hn-hornet-pellets.html` | 2,149 |
| `product-co2-cylinders-5.html` | 2,016 |
| `product-star-match-pellets.html` | 2,001 |
| `product-rx-gen3-magazine.html` | 2,067 |

Content is: title + meta + OG + `<main data-product-detail="<slug>">` + JS. `product-detail.js` renders content client-side.

**Impact:** These 10 URLs are in `sitemap.xml` at priority 0.9, changefreq weekly. Google will crawl them. If Googlebot renders JS reliably, they render OK — but:
- Googlebot's render queue is slow for new low-authority domains
- Bing + LLM crawlers rarely render JS
- Client-injected JSON-LD carries less weight than HTML-source JSON-LD
- Too many low-content URLs can trigger a domain-wide thin-content quality signal

**Fix:** either server-render at build time (recommended long-term) OR hand-write static HTML per PDP (fastest). See `ACTION-PLAN.md` Phase 0 for both approaches.

## Medium

### Security headers minimal

Only HSTS. Missing `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=()" }
      ]
    }
  ]
}
```

## Low

### No video sitemap

Not urgent — zero video content exists.
