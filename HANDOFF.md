# HANDOFF — for the next session (Claude Code)

Context: this is a live site (nishanaairguns.com) for an Indian multi-brand
airgun dealer. Built as two self-contained HTML files (no framework, no build
step) and deployed on Vercel, project `nishana-airguns`, team
`captaincool01s-projects`. Domain DNS is already configured in GoDaddy.

## Priority tasks

1. **Fix the hero product image reliability.**
   `index.html` hotlinks product photos from camstarsports.com
   (e.g. `https://camstarsports.com/products/star-rx-gen3-1.webp`).
   The owner reported the hero RX Gen 3 not rendering; `referrerpolicy=
   "no-referrer"` has been added as a mitigation, but the correct fix is:
   - download each product image into `assets/`
   - update all `src` URLs in `index.html` (hero `#heroShot`, `.mirror`,
     and the `PRODUCTS` array in the inline script)
   - verify the hero 3D stage shows the pistol; there is an `onerror`
     fallback that swaps in a roundel SVG if the image 404s — if you see
     concentric circles instead of a pistol, the image path is broken.

2. **Push to GitHub.** Repo: https://github.com/CAPTAINCOOL01/Nishana-Air-Guns-
   ```
   git init && git remote add origin https://github.com/CAPTAINCOOL01/Nishana-Air-Guns-.git
   git add . && git commit -m "Nishana Airguns: storefront + dashboard"
   git branch -M main && git push -u origin main
   ```
   Then (optional, recommended): connect the repo to the Vercel project so
   every push auto-deploys — replaces the manual drag-and-drop flow.

3. **Redeploy and verify.** After changes: `vercel --prod` (or push, if Git
   is connected). Confirm on nishanaairguns.com with a hard refresh that:
   - hero shows the RX Gen 3 on the rotating 3D stage (not the old target,
     not fallback circles)
   - WhatsApp buttons open wa.me/918329618409

## Backlog (owner-approved direction, not yet done)

- Dashboard uses demo data; wire to real orders/leads when a backend exists.
- Confirm dealer legal details for the footer: GSTIN, dealer registration,
  business address (currently "pending" placeholders).
- Add non-Camstar brands (Precihole, SDB) with real SKUs/prices when the
  client confirms stock — `PRODUCTS` array in `index.html`.
- SEO: create intent pages ("air pistol price in india", "no licence airgun",
  per-model pages), submit sitemap in Google Search Console, cross-link from
  camstarsports.com (same owner-operator), set up Google Business Profile.
- Keep the compliance framing everywhere: strictly 18+, licence-exempt
  ≤20 J under Arms Rules 2016, target-sport positioning (no hunting copy —
  hunting is illegal in India).

## Design system (keep consistent)

Ink `#0b0e13` · Steel `#131923` · Edge `#232b38` · Brass `#c9a227` ·
Bone `#efe9db` · Smoke `#8b94a3` · Signal `#e4572e` (micro-accent only).
Display: Big Shoulders Display (caps). Body: IBM Plex Sans. Data/specs:
IBM Plex Mono. Motif: ten-ring target (now the "turntable" under the 3D
hero product). Deliberately NOT: neon-green-on-black, glassmorphism, or
Camstar's red.
