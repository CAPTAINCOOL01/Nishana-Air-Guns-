# Nishana Airguns

Multi-brand airgun store for India — storefront + operations dashboard.
Live at **https://nishanaairguns.com** (Vercel, project `nishana-airguns`).

## Structure

| File | What it is |
|---|---|
| `index.html` | Public storefront — dark "range card" theme, 3D rotating featured product (Star RX Gen 3), catalogue slider, testimonials, FAQ, legal section. Self-contained (inline CSS/JS, Google Fonts only external dep). |
| `dashboard.html` | Admin dashboard — KPIs, revenue/orders charts (hand-built SVG, zero libraries), traffic donut, order pipeline, leads feed, recent orders with loading/empty/error states, working 7D/30D/90D/12M filter. **Demo data** — not wired to a real backend yet. |
| `assets/` | Local images (currently empty — see HANDOFF.md). |

## Deploy

Static site, no build step. Deploys to Vercel by drag-and-drop or `vercel --prod`.
Domain `nishanaairguns.com` → A `76.76.21.21`, CNAME www → `cname.vercel-dns.com` (already configured in GoDaddy).

## Config

- WhatsApp number for all CTAs: `918329618409` (search `WA_NUMBER` in `index.html`).
- Brand text: search `NISHANA` / `Nishana`.

See `HANDOFF.md` for the open task list.
