#!/usr/bin/env node
/* ============================================================
   Nishana Airguns · bulk-publish
   ------------------------------------------------------------
   Reads Products/<folder>/*.{jpg,png,webp} + scripts/bulk-config.json
   Prompts for your admin email + password once (hidden, never logged)
   Signs in to Supabase → uploads every image to Storage →
   upserts one product row per SKU → publishes with your
   provenance attestation.

   Zero dependencies. Requires Node 18+ (uses built-in fetch).

   Run from the repo root:
     node scripts/bulk-publish.mjs                     (normal)
     node scripts/bulk-publish.mjs --replace           (delete existing
                                                       photos + re-upload)
     node scripts/bulk-publish.mjs --dry-run           (print plan only,
                                                       don't write anything)
   ============================================================ */

import { readFile, readdir } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin, stdout, exit, argv, env } from "node:process";
import { extname, join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

// ---- Paths ----
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PRODUCTS_DIR = join(ROOT, "Products");
const CONFIG_PATH = join(__dirname, "bulk-config.json");
const AUTH_JS = join(ROOT, "auth.js");
const BUCKET = "product-photos";
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

// ---- Args ----
const flags = new Set(argv.slice(2));
const FORCE_REPLACE = flags.has("--replace");
const DRY_RUN = flags.has("--dry-run");

// ---- Colours (optional pretty output; degrades on Windows cmd) ----
const c = {
  dim:   s => `\x1b[2m${s}\x1b[0m`,
  bold:  s => `\x1b[1m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`,
  red:   s => `\x1b[31m${s}\x1b[0m`,
  yell:  s => `\x1b[33m${s}\x1b[0m`,
  brass: s => `\x1b[38;5;179m${s}\x1b[0m`,
};

// ---- Parse SUPABASE_URL + anon key from auth.js ----
async function loadSupabaseConfig() {
  const src = await readFile(AUTH_JS, "utf8");
  const url = /SUPABASE_URL:\s*"([^"]+)"/.exec(src)?.[1];
  const key = /SUPABASE_ANON_KEY:\s*"([^"]+)"/.exec(src)?.[1];
  if (!url || !key) throw new Error("Couldn't parse SUPABASE_URL / SUPABASE_ANON_KEY from auth.js");
  return { url, key };
}

// ---- Prompt for admin credentials (password hidden via raw mode) ----
async function promptCredentials() {
  const rl = createInterface({ input: stdin, output: stdout });
  let email = env.SUPABASE_ADMIN_EMAIL;
  if (!email) email = (await rl.question("Admin email: ")).trim();
  rl.close();

  let password = env.SUPABASE_ADMIN_PASSWORD;
  if (!password) {
    stdout.write("Admin password (hidden, press Enter when done): ");
    password = await new Promise((res) => {
      let pw = "";
      const onData = (chunk) => {
        const s = chunk.toString();
        if (s === "\r" || s === "\n" || s === "\r\n") {
          stdin.removeListener("data", onData);
          stdin.setRawMode?.(false);
          stdin.pause();
          stdout.write("\n");
          res(pw);
        } else if (s === "") { // Ctrl+C
          stdout.write("\n");
          exit(130);
        } else if (s === "" || s === "\b") { // backspace
          pw = pw.slice(0, -1);
        } else {
          pw += s;
        }
      };
      stdin.setRawMode?.(true);
      stdin.resume();
      stdin.on("data", onData);
    });
  }
  return { email, password };
}

// ---- Supabase REST client ----
class SB {
  constructor(url, anonKey) {
    this.url = url.replace(/\/$/, "");
    this.anonKey = anonKey;
    this.accessToken = null;
    this.user = null;
  }
  async signIn(email, password) {
    const r = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: this.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Sign-in failed (${r.status}): ${t.slice(0, 200)}`);
    }
    const j = await r.json();
    this.accessToken = j.access_token;
    this.user = j.user;
  }
  h(extra = {}) {
    return { apikey: this.anonKey, Authorization: `Bearer ${this.accessToken}`, ...extra };
  }
  async uploadFile(bucket, path, bytes, contentType) {
    // Delete existing at same path first if replacing
    const r = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: this.h({ "Content-Type": contentType, "x-upsert": "false" }),
      body: bytes,
    });
    if (!r.ok) throw new Error(`Storage upload ${path}: ${r.status} ${(await r.text()).slice(0, 200)}`);
    return r.json();
  }
  publicUrl(bucket, path) {
    return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
  }
  async upsertProduct(row) {
    const r = await fetch(`${this.url}/rest/v1/products?on_conflict=slug`, {
      method: "POST",
      headers: this.h({
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      }),
      body: JSON.stringify(row),
    });
    if (!r.ok) throw new Error(`Upsert product ${row.slug}: ${r.status} ${(await r.text()).slice(0, 200)}`);
    const rows = await r.json();
    return rows[0];
  }
  async listPhotos(slug) {
    const r = await fetch(
      `${this.url}/rest/v1/product_photos?product_slug=eq.${encodeURIComponent(slug)}&select=id,storage_path,is_primary,public_url&order=created_at.asc`,
      { headers: this.h() }
    );
    if (!r.ok) return [];
    return r.json();
  }
  async deletePhotos(slug) {
    const existing = await this.listPhotos(slug);
    if (!existing.length) return 0;
    // Delete from storage
    const paths = existing.map(p => p.storage_path);
    await fetch(`${this.url}/storage/v1/object/${BUCKET}`, {
      method: "DELETE",
      headers: this.h({ "Content-Type": "application/json" }),
      body: JSON.stringify({ prefixes: paths }),
    }).catch(() => {});
    // Delete from DB
    await fetch(`${this.url}/rest/v1/product_photos?product_slug=eq.${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: this.h(),
    });
    return existing.length;
  }
  async insertPhoto(row) {
    const r = await fetch(`${this.url}/rest/v1/product_photos`, {
      method: "POST",
      headers: this.h({ "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify(row),
    });
    if (!r.ok) throw new Error(`Insert photo: ${r.status} ${(await r.text()).slice(0, 200)}`);
    return (await r.json())[0];
  }
  async setPrimary(slug, photoId) {
    await fetch(`${this.url}/rest/v1/product_photos?product_slug=eq.${encodeURIComponent(slug)}`, {
      method: "PATCH", headers: this.h({ "Content-Type": "application/json" }),
      body: JSON.stringify({ is_primary: false }),
    });
    await fetch(`${this.url}/rest/v1/product_photos?id=eq.${photoId}`, {
      method: "PATCH", headers: this.h({ "Content-Type": "application/json" }),
      body: JSON.stringify({ is_primary: true }),
    });
  }
  async updateProductHero(slug, url) {
    await fetch(`${this.url}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}`, {
      method: "PATCH", headers: this.h({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        hero_photo_url: url,
        updated_at: new Date().toISOString(),
        updated_by: this.user.email,
      }),
    });
  }
}

// ---- File helpers ----
async function listImages(folder) {
  try {
    const files = await readdir(folder, { withFileTypes: true });
    return files
      .filter(f => f.isFile() && IMAGE_EXTS.has(extname(f.name).toLowerCase()))
      .map(f => join(folder, f.name))
      .sort();
  } catch { return []; }
}
function mimeFor(ext) {
  const m = { ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png",
              ".webp":"image/webp", ".gif":"image/gif", ".avif":"image/avif" };
  return m[ext.toLowerCase()] || "application/octet-stream";
}

// ---- Main ----
async function main() {
  console.log(c.brass("\n  Nishana Airguns · Bulk product upload"));
  console.log(c.dim("  " + "─".repeat(45)));
  if (DRY_RUN) console.log(c.yell("  ⚠  DRY RUN — no changes will be written\n"));

  const { url, key } = await loadSupabaseConfig();
  console.log(c.dim(`  Supabase: ${url}`));

  let config;
  try { config = JSON.parse(await readFile(CONFIG_PATH, "utf8")); }
  catch {
    console.error(c.red(`\n✗ Couldn't read ${CONFIG_PATH}.`));
    console.error(c.dim("  Copy scripts/bulk-config.example.json to scripts/bulk-config.json,"));
    console.error(c.dim("  fill in prices + provenance, then re-run this script.\n"));
    exit(1);
  }
  const defaultProv = config.$default_provenance;
  const defaultProvBy = config.$default_provenance_by;
  const skus = Object.entries(config).filter(([k]) => !k.startsWith("$"));
  console.log(c.dim(`  Config: ${skus.length} SKU${skus.length===1?"":"s"} in scripts/bulk-config.json\n`));

  const client = new SB(url, key);
  if (!DRY_RUN) {
    const { email, password } = await promptCredentials();
    try { await client.signIn(email, password); }
    catch (e) { console.error(c.red("\n" + e.message)); exit(1); }
    console.log(c.green(`\n✓ Signed in as ${client.user.email}\n`));
  } else {
    client.user = { email: "dry-run@local" };
  }

  let created=0, updated=0, photosUp=0, photosSkip=0, skipped=0, errors=0;

  for (const [slug, sku] of skus) {
    console.log(c.brass(`── ${slug} ${c.dim("(" + (sku.name||slug) + ")")}`));

    if (!sku.folder) {
      console.log(c.yell(`  ⚠  No 'folder' set — skipping.`)); skipped++; continue;
    }
    const folder = join(PRODUCTS_DIR, sku.folder);
    const images = await listImages(folder);
    if (!images.length) console.log(c.yell(`  ⚠  No images found in Products/${sku.folder}/`));

    const provenance = sku.provenance_attestation || defaultProv;
    let publish = sku.publish === true;
    if (publish && (!provenance || provenance.trim().length < 10)) {
      console.log(c.yell(`  ⚠  Publish=true but no provenance attestation (min 10 chars). Forcing to draft.`));
      publish = false;
    }

    const productRow = {
      slug,
      name: sku.name || slug,
      brand: sku.brand || null,
      category: sku.category || null,
      price: sku.price ?? null,
      mrp: sku.mrp ?? null,
      badge: sku.badge || null,
      chips: Array.isArray(sku.chips) ? sku.chips : [],
      short_desc: sku.short_desc || null,
      long_desc: sku.long_desc || null,
      pdp_url: sku.pdp_url || null,
      buy_enabled: sku.buy_enabled === true,
      is_published: publish,
      sort_order: sku.sort_order ?? 100,
      legal_muzzle_energy_j: sku.legal_muzzle_energy_j ?? null,
      legal_calibre_mm: sku.legal_calibre_mm || null,
      legal_projectile: sku.legal_projectile || null,
      legal_action: sku.legal_action || null,
      legal_licence_exempt: sku.legal_licence_exempt ?? null,
      legal_notes: sku.legal_notes || null,
      provenance_attestation: provenance || null,
      provenance_by: publish ? (defaultProvBy || client.user.email) : (sku.provenance_by || null),
      provenance_at: publish ? new Date().toISOString() : null,
      updated_by: client.user.email,
    };

    if (DRY_RUN) {
      console.log(c.dim(`  [dry] Would ${publish ? "PUBLISH" : "draft"}: ${sku.name || slug}`));
      console.log(c.dim(`  [dry] Would upload ${images.length} image(s) from Products/${sku.folder}/`));
      continue;
    }

    // Upsert product
    try {
      const existing = await client.listPhotos(slug);
      const isNew = existing.length === 0;
      await client.upsertProduct(productRow);
      const label = publish ? c.green("PUBLISHED") : c.yell("draft");
      console.log(`  ${c.green(isNew ? "✓ Created" : "✓ Updated")} product · ${label}`);
      if (isNew) created++; else updated++;
    } catch (e) {
      console.log(c.red(`  ✗ ${e.message}`));
      errors++; continue;
    }

    if (!images.length) continue;

    // Photos: check existing
    const existingPhotos = await client.listPhotos(slug);
    if (existingPhotos.length > 0 && !FORCE_REPLACE) {
      console.log(c.dim(`  ↷ ${existingPhotos.length} photo(s) already attached — skipping upload. Pass --replace to re-upload.`));
      photosSkip += existingPhotos.length;
      continue;
    }
    if (existingPhotos.length > 0 && FORCE_REPLACE) {
      const n = await client.deletePhotos(slug);
      console.log(c.yell(`  ⌫  Deleted ${n} existing photo(s) (--replace)`));
    }

    let firstUrl = null, firstId = null;
    for (const imgPath of images) {
      try {
        const bytes = await readFile(imgPath);
        const ext = extname(imgPath).toLowerCase();
        const storagePath = `${slug}/${randomUUID()}${ext}`;
        await client.uploadFile(BUCKET, storagePath, bytes, mimeFor(ext));
        const publicUrl = client.publicUrl(BUCKET, storagePath);
        const photo = await client.insertPhoto({
          product_slug: slug,
          storage_path: storagePath,
          public_url: publicUrl,
          alt_text: sku.name || slug,
          bytes: bytes.length,
          uploaded_by: client.user.email,
        });
        if (!firstUrl) { firstUrl = publicUrl; firstId = photo.id; }
        console.log(c.green(`  ✓ ${basename(imgPath)}`) + c.dim(` (${(bytes.length/1024).toFixed(0)} KB)`));
        photosUp++;
      } catch (e) {
        console.log(c.red(`  ✗ ${basename(imgPath)}: ${e.message}`));
        errors++;
      }
    }

    if (firstUrl && firstId) {
      await client.setPrimary(slug, firstId);
      await client.updateProductHero(slug, firstUrl);
      console.log(c.brass(`  ★ Set primary photo`));
    }
    console.log("");
  }

  console.log(c.dim("  " + "─".repeat(45)));
  console.log(c.bold(`  Done:`));
  console.log(`    ${c.green(created + " created")} · ${c.green(updated + " updated")} · ${c.brass(photosUp + " photos uploaded")}${photosSkip?" · " + c.dim(photosSkip + " existing skipped"):""}${skipped?" · " + c.yell(skipped + " skipped"):""}${errors?" · " + c.red(errors + " errors"):""}`);
  if (!DRY_RUN && (created + updated + photosUp) > 0) {
    console.log(c.dim(`\n  Verify: open https://nishanaairguns.com/dashboard.html#/products in your browser.`));
    console.log(c.dim(`  Live storefront: https://nishanaairguns.com/air-pistols.html\n`));
  }
  if (errors > 0) exit(1);
}

main().catch(e => { console.error(c.red("\n✗ Fatal: " + (e?.message || e))); exit(1); });
