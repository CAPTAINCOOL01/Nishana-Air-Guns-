# scripts/bulk-publish.mjs

**Do a one-shot bulk publish of every product in `Products/` to the live storefront.** Zero clicks in the admin, no manual photo upload, no per-SKU form filling.

## What it does

1. Reads `Products/<folder>/*.{jpg,png,webp}` for each SKU in `scripts/bulk-config.json`.
2. Prompts you at the terminal for your Supabase admin email + password. **Password is hidden and never logged.**
3. Signs in via `supabase.auth.signInWithPassword`.
4. For each SKU:
   - Uploads every image to Supabase Storage under `product-photos/<slug>/<uuid>.<ext>`
   - Inserts a `product_photos` row per image
   - Upserts the `products` row with everything from your config (price, description, chips, legal metadata, provenance)
   - Sets the first image as primary and caches the URL onto `products.hero_photo_url`
   - Publishes if `publish: true` **and** you filled a `provenance_attestation` of ≥ 10 chars (either per-SKU or via `$default_provenance`)
5. Prints a summary.

## Zero dependencies

Node 18+ (uses built-in `fetch`). No `npm install`. Just:

```bash
node scripts/bulk-publish.mjs
```

## First-time setup (~2 minutes)

1. Copy the template:
   ```bash
   cp scripts/bulk-config.example.json scripts/bulk-config.json
   ```
   *(On Windows PowerShell: `Copy-Item scripts/bulk-config.example.json scripts/bulk-config.json`)*

2. Open `scripts/bulk-config.json` in your editor.

3. Fill in the following:
   - **`$default_provenance`** — a sentence attesting the photos are yours (already pre-filled — edit if needed)
   - **`price`** for each SKU you want to sell — leave `null` if you're publishing as enquiry-only
   - **`publish: true`** for SKUs you want live now — leave `false` for drafts

   Everything else (chips, spec fields, descriptions, category, badge) is already filled in from `Products/SPECS-CHEAT-SHEET.md`. Edit if you want to change wording.

4. Run:
   ```bash
   node scripts/bulk-publish.mjs
   ```

   You'll be prompted for admin email + password. Enter them. Watch it work.

## Flags

| Flag | What it does |
|---|---|
| *(none)* | Uploads photos only where the SKU doesn't already have photos in the DB |
| `--replace` | Deletes existing photos for each SKU first, then uploads fresh |
| `--dry-run` | Prints the plan (what would happen) without writing anything or asking for credentials |

## Verify before running

```bash
node scripts/bulk-publish.mjs --dry-run
```

Prints exactly what will be published, without signing in or touching the DB.

## After it runs

- Admin: `https://nishanaairguns.com/dashboard.html#/products` — check each SKU's card and photos
- Storefront: `https://nishanaairguns.com/air-pistols.html` — see the live cards

Every SKU where `publish: true` is now on the live site. Cards with `buy_enabled: false` will show "Enquire on WhatsApp" instead of a Buy button.

## Security notes

- **`scripts/bulk-config.json` is gitignored.** Your provenance attestations and any pricing decisions live only on your machine.
- **Credentials never touch the config file.** They're prompted at runtime, held in memory only.
- **Anon key (from `auth.js`) is used** to build the sign-in request. That key is public — safe to be in the repo.
- **Optional env-var overrides:** `SUPABASE_ADMIN_EMAIL` / `SUPABASE_ADMIN_PASSWORD` — if set, the prompt is skipped. Use only in trusted local shells.

## Troubleshooting

**`Sign-in failed (400): {"error":"invalid_grant"...}`** — wrong email or password. Try again.

**`Sign-in failed (401): ...`** — you can sign in but your JWT doesn't have admin role. Check that your email is in `public.app_staff` with `role='admin'`.

**`Storage upload ...: 403 ...`** — RLS on the `product-photos` bucket is blocking your admin. This shouldn't happen if the migration ran cleanly; verify by running this in Supabase SQL Editor:
```sql
select * from storage.buckets where id='product-photos';
```

**`Upsert product ...: 400 ...products.is_published cannot be true without provenance_attestation ...`** — publish trigger fired. Fill in `$default_provenance` (min 10 chars) or add `provenance_attestation` per SKU.

**`No images found in Products/<folder>/`** — the `folder` value in the config doesn't match a real folder inside `Products/`. Fix the folder name.

**Windows password field shows characters instead of hiding them** — some Windows terminals don't support raw-mode stdin. Set the password via env var instead:
```powershell
$env:SUPABASE_ADMIN_PASSWORD = "your-password"
node scripts/bulk-publish.mjs
Remove-Item Env:\SUPABASE_ADMIN_PASSWORD
```

## What this script will NOT do

- Set prices (you type these into the config)
- Invent provenance attestations (you type these)
- Bypass the Postgres publish trigger (that trigger is your DMCA / trademark paper trail)
- Delete products (only add or update)
