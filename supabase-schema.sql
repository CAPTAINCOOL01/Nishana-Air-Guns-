-- =============================================================
-- NISHANA AIRGUNS  —  Supabase schema
-- =============================================================
-- HOW TO USE:
--   1. Open Supabase dashboard → SQL Editor → New query
--   2. Paste this ENTIRE file
--   3. Click "Run"
-- Safe to re-run; every statement uses IF NOT EXISTS or CREATE OR REPLACE.
-- =============================================================

-- -------- ROLES --------------------------------------------------
-- We identify admins/dealers by email inside a small allow-list table.
-- (Simple, easy to edit from the Supabase table editor.)
create table if not exists public.app_staff (
  email text primary key,
  role  text not null check (role in ('admin','dealer')),
  created_at timestamptz not null default now()
);

-- Seed the admins (idempotent).
insert into public.app_staff (email, role) values
  ('ramayanaprav@gmail.com','admin'),
  ('pubxplode@gmail.com','admin')
on conflict (email) do update set role = excluded.role;

-- Helper functions used by RLS policies.
create or replace function public.current_email() returns text
language sql stable security definer set search_path = public
as $$ select lower(coalesce(auth.jwt()->>'email','')) $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.app_staff where email = public.current_email() and role='admin') $$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.app_staff where email = public.current_email()) $$;

-- -------- ORDERS ------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  -- Customer
  user_id           uuid references auth.users(id) on delete set null,
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text not null,
  shipping_address  jsonb not null,   -- { address, city, state, pincode }

  -- Line items (denormalised snapshot at time of order)
  items             jsonb not null,   -- [{ id, name, price, qty, image }]

  -- Money
  subtotal          numeric(10,2) not null,
  shipping          numeric(10,2) not null default 0,
  discount          numeric(10,2) not null default 0,
  cod_fee           numeric(10,2) not null default 0,
  total             numeric(10,2) not null,

  -- Payment / status
  payment_method    text not null check (payment_method in ('upi','cod','whatsapp','razorpay')),
  payment_status    text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  order_status      text not null default 'new' check (order_status in ('new','confirmed','shipped','delivered','cancelled')),
  notes             text
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx     on public.orders (order_status);
create index if not exists orders_user_idx       on public.orders (user_id);

-- Add razorpay-related columns + widen payment_method to include 'razorpay'
-- (idempotent — safe on new tables too).
alter table public.orders add column if not exists razorpay_order_id   text;
alter table public.orders add column if not exists razorpay_payment_id text;

do $$ begin
  alter table public.orders drop constraint if exists orders_payment_method_check;
  alter table public.orders add  constraint orders_payment_method_check
    check (payment_method in ('upi','cod','whatsapp','razorpay'));
exception when others then null; end $$;

alter table public.orders enable row level security;

-- Anyone (even guests) can create an order — the checkout is public.
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public" on public.orders
  for insert with check (true);

-- Admins read ALL orders. Dealers read ONLY orders the admin has confirmed
-- (confirmed / shipped / delivered) — never 'new' or 'cancelled'.
drop policy if exists "orders_select_staff" on public.orders;
create policy "orders_select_staff" on public.orders
  for select using (
    public.is_admin()
    or (public.is_staff() and order_status in ('confirmed','shipped','delivered'))
  );

-- Logged-in customers can read their own orders (matched by user_id OR email).
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (
    (auth.uid() is not null and user_id = auth.uid())
    or (auth.uid() is not null and lower(customer_email) = public.current_email())
  );

-- Only ADMIN can change status / delete.
drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin" on public.orders
  for delete using (public.is_admin());


-- -------- LEADS (abandoned checkout / enquiry captures) ---------
-- Populated by the checkout page as soon as the customer fills in a phone
-- number and (part of) an address. Lets the admin follow up if the customer
-- never completes the order.
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  session_id  text,             -- browser fingerprint so we UPSERT one row per session
  name        text,
  phone       text,
  email       text,
  address     text,
  city        text,
  state       text,
  pincode     text,
  product_id  text,             -- e.g. "star-rx-gen3"
  product_name text,
  cart_value  numeric(10,2),
  source      text default 'checkout_abandoned',
  status      text default 'new' check (status in ('new','contacted','converted','junk')),
  notes       text
);

-- Add missing columns on re-runs of the schema (safe on new tables too)
alter table public.leads add column if not exists updated_at   timestamptz not null default now();
alter table public.leads add column if not exists session_id   text;
alter table public.leads add column if not exists address      text;
alter table public.leads add column if not exists city         text;
alter table public.leads add column if not exists state        text;
alter table public.leads add column if not exists pincode      text;
alter table public.leads add column if not exists product_id   text;
alter table public.leads add column if not exists product_name text;
alter table public.leads add column if not exists cart_value   numeric(10,2);
alter table public.leads add column if not exists status       text default 'new';
alter table public.leads add column if not exists notes        text;

create unique index if not exists leads_session_idx on public.leads (session_id) where session_id is not null;
create index if not exists leads_created_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- Anyone (even guests) can create/update their own lead row via UPSERT on session_id.
drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public" on public.leads
  for insert with check (true);

drop policy if exists "leads_update_public" on public.leads;
create policy "leads_update_public" on public.leads
  for update using (true) with check (true);

-- Only ADMIN can see the leads list (dealers see only orders).
drop policy if exists "leads_select_staff"  on public.leads;
drop policy if exists "leads_select_admin"  on public.leads;
create policy "leads_select_admin"  on public.leads
  for select using (public.is_admin());

drop policy if exists "leads_write_admin"   on public.leads;
create policy "leads_write_admin"   on public.leads
  for all using (public.is_admin()) with check (public.is_admin());


-- -------- APP_STAFF RLS -----------------------------------------
-- Staff can read THEIR OWN row (needed so dealers can resolve their
-- role at login). Admins can read and modify everything.
alter table public.app_staff enable row level security;

drop policy if exists "staff_select_admin" on public.app_staff;
drop policy if exists "staff_select_self_or_admin" on public.app_staff;
create policy "staff_select_self_or_admin" on public.app_staff
  for select using (email = public.current_email() or public.is_admin());

drop policy if exists "staff_all_admin" on public.app_staff;
create policy "staff_all_admin" on public.app_staff
  for all using (public.is_admin()) with check (public.is_admin());


-- -------- REALTIME ----------------------------------------------
-- The admin dashboard and dealer page subscribe to live changes on
-- orders and leads. Tables must be in the supabase_realtime
-- publication for those subscriptions to fire.
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.leads;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;


-- -------- COUPONS -----------------------------------------------
-- Admin-created discount codes. Kept minimal on purpose: flat ₹
-- discount only, no expiry, no per-use cap. `min_cart_value` and
-- `max_uses` columns exist so we can lock things down later without
-- another migration.
create table if not exists public.coupons (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  code           text not null,
  discount_amount numeric(10,2) not null check (discount_amount > 0),
  active         boolean not null default true,
  min_cart_value numeric(10,2),                 -- reserved; null = no minimum
  max_uses       int,                           -- reserved; null = unlimited
  uses_count     int not null default 0,        -- incremented by apply_coupon on redemption
  notes          text,
  created_by     text
);

-- Case-insensitive uniqueness so "PARVI500" and "parvi500" can't both exist.
create unique index if not exists coupons_code_upper_idx on public.coupons (upper(code));
create index if not exists coupons_active_idx on public.coupons (active) where active = true;

-- Restricted-email list (idempotent add for existing DBs). Null = coupon is
-- valid for everyone. Non-empty array = only these emails can redeem.
alter table public.coupons add column if not exists restricted_emails text[];

alter table public.coupons enable row level security;

-- Anonymous SELECT is BLOCKED — checkout must go through the RPC below.
drop policy if exists "coupons_select_admin" on public.coupons;
create policy "coupons_select_admin" on public.coupons
  for select using (public.is_admin());

drop policy if exists "coupons_write_admin" on public.coupons;
create policy "coupons_write_admin" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- Public RPC — takes a coupon code + cart subtotal + optional customer
-- email, returns the effective discount if valid, or a diagnostic error.
-- Runs as SECURITY DEFINER so guests can call it without READ access to
-- the table (no enumeration).
-- Does NOT increment uses_count — validation must not burn a redemption
-- if the customer abandons checkout. When we later enforce max_uses,
-- add a separate redeem_coupon(code) RPC that increments and is called
-- from api/create-order.js right after the order INSERT succeeds.
--
-- Older 2-arg overload dropped so callers migrate cleanly. Checkout code
-- should always pass the customer's email (even for guest checkouts, it
-- collects one during the form) so email-restricted coupons work.
drop function if exists public.apply_coupon(text, numeric);
create or replace function public.apply_coupon(p_code text, p_subtotal numeric, p_email text default null)
returns table (ok boolean, discount numeric, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
  norm_email text := lower(coalesce(trim(p_email), ''));
begin
  if p_code is null or length(trim(p_code)) = 0 then
    return query select false, 0::numeric, 'Please enter a coupon code.';
    return;
  end if;

  select * into c from public.coupons
    where upper(code) = upper(trim(p_code))
    limit 1;

  if not found then
    return query select false, 0::numeric, 'Coupon not found.';
    return;
  end if;

  if not c.active then
    return query select false, 0::numeric, 'This coupon is no longer active.';
    return;
  end if;

  if c.min_cart_value is not null and p_subtotal < c.min_cart_value then
    return query select false, 0::numeric,
      'Add more to your cart to use this coupon (minimum ₹' || c.min_cart_value::text || ').';
    return;
  end if;

  if c.max_uses is not null and c.uses_count >= c.max_uses then
    return query select false, 0::numeric, 'This coupon has been fully redeemed.';
    return;
  end if;

  if c.restricted_emails is not null and array_length(c.restricted_emails, 1) > 0 then
    if norm_email = '' or not (
      exists (select 1 from unnest(c.restricted_emails) e where lower(trim(e)) = norm_email)
    ) then
      return query select false, 0::numeric, 'This coupon is not available for your account.';
      return;
    end if;
  end if;

  -- Never let the discount exceed the cart subtotal.
  return query select true,
                      least(c.discount_amount, p_subtotal),
                      'Coupon applied.';
end;
$$;

-- Anyone (including guests) can CALL the RPC (but not read the table).
grant execute on function public.apply_coupon(text, numeric, text) to anon, authenticated;


-- =============================================================
-- PRODUCT CATALOGUE (admin-editable, storefront-visible)
-- -------------------------------------------------------------
-- Two tables + one Storage bucket. The storefront (products.js)
-- merges published rows into window.NISHANA_PRODUCTS on load, so
-- new SKUs added here appear as cards on the correct category
-- page automatically. Existing hardcoded products.js entries are
-- also seeded here so the storefront never regresses.
-- =============================================================

create table if not exists public.products (
  slug              text primary key,           -- 'star-rx-gen3', URL-safe
  name              text not null,              -- 'Star RX Gen 3'
  brand             text,                       -- 'Camstar'
  category          text check (category in ('air-pistols','air-rifles','accessories','spare-parts')),
  price             numeric(10,2),              -- selling price on Nishana
  mrp               numeric(10,2),              -- crossed-out MRP if present
  badge             text,                       -- 'Semi-auto CO₂' etc. (max ~24 chars)
  chips             jsonb default '[]'::jsonb,  -- ['.177 CAL','400 FPS',...]
  short_desc        text,                       -- 1-3 sentence teaser
  long_desc         text,                       -- optional multi-paragraph
  specs             jsonb default '{}'::jsonb,  -- {calibre:'.177',velocity:'400 FPS',...}
  pdp_url           text,                       -- 'product-<slug>.html' if a dedicated PDP exists; null = card links to WhatsApp enquire
  hero_photo_url    text,                       -- convenience cache of the primary photo's public URL
  buy_enabled       boolean default true,       -- false = Enquire on WhatsApp, no Buy Now button
  is_published      boolean default false,      -- master switch; only published rows leak to storefront
  sort_order        int default 100,            -- lower = earlier
  -- Legal / compliance metadata (nullable, but strongly encouraged before publish)
  legal_muzzle_energy_j     numeric(4,1),       -- ≤ 20 J to claim licence-exempt
  legal_calibre_mm          text,               -- '4.5' etc.
  legal_projectile          text check (legal_projectile in ('lead-diabolo','steel-bb','other') or legal_projectile is null),
  legal_action              text check (legal_action in ('spring','co2','pcp','other') or legal_action is null),
  legal_licence_exempt      boolean,            -- explicit admin attestation
  legal_notes               text,
  -- Provenance attestation — MANDATORY before is_published can flip to true.
  -- This is the DMCA / trademark paper trail.
  provenance_attestation    text,
  provenance_by             text,               -- admin email
  provenance_at             timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  updated_by        text
);

create index if not exists products_category_sort_idx on public.products (category, sort_order) where is_published = true;

create table if not exists public.product_photos (
  id            uuid primary key default gen_random_uuid(),
  product_slug  text references public.products(slug) on delete cascade,
  storage_path  text not null,                            -- e.g. 'star-rx-gen3/abcdef.webp'
  public_url    text not null,
  alt_text      text,
  is_primary    boolean default false,
  sort_order    int default 100,
  width         int,
  height        int,
  bytes         int,
  created_at    timestamptz default now(),
  uploaded_by   text
);

create index if not exists product_photos_slug_idx on public.product_photos (product_slug, sort_order);

-- One primary per product (enforced at app level; add UI guardrails in dashboard.html).

-- ---- Publish gate: enforce provenance_attestation before is_published = true ----
create or replace function public.enforce_publish_provenance()
returns trigger
language plpgsql
as $$
begin
  if new.is_published = true and (new.provenance_attestation is null or length(trim(new.provenance_attestation)) < 10) then
    raise exception 'products.is_published cannot be true without provenance_attestation (minimum 10 chars). Attesting admin: %', coalesce(new.provenance_by, '(unknown)');
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_publish_gate on public.products;
create trigger products_publish_gate
  before insert or update on public.products
  for each row execute function public.enforce_publish_provenance();

-- ---- RLS ----
alter table public.products enable row level security;
alter table public.product_photos enable row level security;

-- Storefront (anon or authenticated customer) reads only published products
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (is_published = true);

-- Admin can see everything, do everything
drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Photos: public read (photos are attached to public products anyway; simplifies storefront)
drop policy if exists photos_public_read on public.product_photos;
create policy photos_public_read on public.product_photos
  for select using (true);

drop policy if exists photos_admin_all on public.product_photos;
create policy photos_admin_all on public.product_photos
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- Storage bucket + policies (requires postgres role — Supabase SQL Editor runs as postgres) ----
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

drop policy if exists "product_photos_public_read" on storage.objects;
create policy "product_photos_public_read" on storage.objects
  for select using (bucket_id = 'product-photos');

drop policy if exists "product_photos_admin_insert" on storage.objects;
create policy "product_photos_admin_insert" on storage.objects
  for insert with check (bucket_id = 'product-photos' and public.is_admin());

drop policy if exists "product_photos_admin_update" on storage.objects;
create policy "product_photos_admin_update" on storage.objects
  for update using (bucket_id = 'product-photos' and public.is_admin());

drop policy if exists "product_photos_admin_delete" on storage.objects;
create policy "product_photos_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-photos' and public.is_admin());

-- ---- Seed existing and dealer-backed catalogue SKUs so the storefront never regresses ----
-- Uses the existing hero_photo_url on camstarsports.com as the initial photo;
-- admin can replace with own uploads via the Products tab.
insert into public.products (
  slug, name, brand, category, price, mrp, badge, chips, short_desc,
  pdp_url, hero_photo_url, buy_enabled, is_published, sort_order,
  legal_calibre_mm, legal_projectile, legal_action, legal_licence_exempt,
  provenance_attestation, provenance_by, provenance_at
) values
  ('star-rx-gen3', 'Star RX Gen 3', 'Camstar', 'air-pistols', 24000, 27500, 'Semi-auto CO₂',
   '[".177 CAL","400 FPS","CO₂ SEMI-AUTO","32 RND MAG"]'::jsonb,
   'India''s first semi-automatic CO₂ air pistol. 32-round rotary magazine, five colourways, ships with hard case + holster.',
   'product-rx-gen3.html', 'https://camstarsports.com/products/star-rx-gen3-1.webp', true, true, 1,
   '4.5', 'lead-diabolo', 'co2', true,
   'Existing SKU migrated from products.js on 2026-07-20; Camstar manufacturer marketing material.', 'ramayanaprav@gmail.com', now()),
  ('co2-cylinders-5', 'CO₂ Cylinders — Pack of 5', 'Camstar', 'accessories', 550, null, null,
   '["12 G","PACK OF 5","RX GEN 3 READY"]'::jsonb,
   'Standard 12 g CO₂ cylinders, pack of five, selected for the Star RX Gen 3.',
   null, 'https://camstarsports.com/products/co2-cylinders.jpg', true, true, 10,
   null, null, null, null,
   'Existing SKU migrated from products.js; consumable accessory (not an airgun).', 'ramayanaprav@gmail.com', now()),
  ('star-match-pellets', 'Star Match Diabolo Pellets', 'Camstar', 'accessories', 450, null, null,
   '[".177 CAL","0.524 G","300 PCS/TIN"]'::jsonb,
   'Match-grade .177 (4.5 mm) diabolo pellets, 300 per tin, suited to the Star RX Gen 3.',
   null, 'https://camstarsports.com/products/star-match-diabolo.png', true, true, 11,
   '4.5', 'lead-diabolo', null, null,
   'Existing SKU migrated from products.js; consumable ammunition (not an airgun).', 'ramayanaprav@gmail.com', now()),
  ('rx-gen3-magazine', 'Star RX Gen 3 CO₂ Magazine', 'Camstar', 'spare-parts', 6499, null, null,
   '["GENUINE","FITS RX GEN 3"]'::jsonb,
   'Genuine replacement CO₂ rotary magazine for the Star RX Gen 3 semi-automatic pistol.',
   null, 'https://camstarsports.com/products/star-rx-gen3-1.webp', false, true, 20,
   null, null, null, null,
   'Existing SKU migrated from products.js; spare part (not an airgun).', 'ramayanaprav@gmail.com', now()),
  ('aerosoft-x1', 'Aerosoft X1 CO₂ Air Pistol', 'Aerosoft', 'air-pistols', 36000, 45000, 'Enquiry only',
   '["CO₂","84FS STYLE","DEALER SUPPLY"]'::jsonb,
   'Dealer-backed CO₂ air-pistol listing. Ask our sales team to confirm the current price, availability and order requirements.',
   null, '/img/products/aerosoft-x1/1.webp', false, true, 2,
   null, null, null, null,
   'Owner-attested photo and dealer availability recorded on 2026-07-20; enquiry-only catalogue listing.', 'ramayanaprav@gmail.com', now()),
  ('asg-x9-classic', 'ASG X9 Classic CO₂ Air Pistol', 'ASG', 'air-pistols', 57000, 65000, 'Enquiry only',
   '["4.5 MM",".177 STEEL BB","BLOWBACK"]'::jsonb,
   'Full-metal blowback CO₂ air-pistol configuration. Ask our sales team to confirm current availability and order requirements.',
   null, '/img/products/asg-x9-classic/1.webp', false, true, 3,
   '4.5', 'steel-bb', 'co2', null,
   'Owner-attested photo and dealer availability recorded on 2026-07-20; enquiry-only catalogue listing.', 'ramayanaprav@gmail.com', now()),
  ('beretta-84fs', 'Beretta Mod. 84 FS CO₂ Air Pistol', 'Beretta', 'air-pistols', 72000, 85000, 'Enquiry only',
   '["4.5 MM","BB","CO₂"]'::jsonb,
   '4.5 mm BB CO₂ air-pistol listing. Ask our sales team to confirm the current price, availability and order requirements.',
   null, '/img/products/beretta-84fs/1.webp', false, true, 4,
   '4.5', 'steel-bb', 'co2', null,
   'Owner-attested photo and dealer availability recorded on 2026-07-20; enquiry-only catalogue listing.', 'ramayanaprav@gmail.com', now()),
  ('beretta-m92-a1', 'Beretta M92 A1 CO₂ Air Pistol', 'Beretta', 'air-pistols', 73000, 85000, 'Enquiry only',
   '["4.5 MM",".177 BB","CO₂"]'::jsonb,
   '4.5 mm .177 BB CO₂ air-pistol listing. Ask our sales team to confirm the current price, availability and order requirements.',
   null, '/img/products/beretta-m92-a1/1.webp', false, true, 5,
   '4.5', 'steel-bb', 'co2', null,
   'Owner-attested photo and dealer availability recorded on 2026-07-20; enquiry-only catalogue listing.', 'ramayanaprav@gmail.com', now()),
  ('kwc-k18', 'KWC K18 4.5 mm BB CO₂ Pistol', 'KWC', 'air-pistols', 58000, 64000, 'Enquiry only',
   '["4.5 MM","BB","CO₂"]'::jsonb,
   'Dealer-backed K18 CO₂ BB-pistol listing. Availability and all order requirements are confirmed by our sales team before any sale.',
   null, '/img/products/kwc-k18/FullSizeRender_5f838eab-803d-45e7-bfcf-87367fd94b79.webp', false, true, 6,
   '4.5', 'steel-bb', 'co2', null,
   'Dealer availability recorded on 2026-07-20; enquiry-only listing with no in-stock claim.', 'ramayanaprav@gmail.com', now()),
  ('kwc-m92', 'KWC M92 4.5 mm BB CO₂ Pistol', 'KWC', 'air-pistols', 62000, 65000, 'Enquiry only',
   '["4.5 MM","BB","CO₂"]'::jsonb,
   'Dealer-backed M92 CO₂ BB-pistol listing. Availability and all order requirements are confirmed by our sales team before any sale.',
   null, '/img/products/kwc-m92/FullSizeRender_b28aaf22-b99f-4a33-8ccb-8990e03e7c92.webp', false, true, 7,
   '4.5', 'steel-bb', 'co2', null,
   'Dealer availability recorded on 2026-07-20; enquiry-only listing with no in-stock claim.', 'ramayanaprav@gmail.com', now()),
  ('hn-hornet-pellets', 'H&N Hornet Pellets', 'H&N', 'accessories', 1750, 1850, 'Enquiry only',
   '[".177 CAL","9.57 GR","225 CT","POINTED"]'::jsonb,
   'Pointed .177-calibre pellets, 225 per tin. Ask our sales team to confirm the current price and availability.',
   null, '/img/products/hn-hornet-pellets/FullSizeRender_301a35f3-1d50-4557-97be-1cbd2492cab8.webp', false, true, 12,
   '4.5', null, null, null,
   'Dealer availability recorded on 2026-07-20; enquiry-only listing with no in-stock claim.', 'ramayanaprav@gmail.com', now())
on conflict (slug) do update set
  updated_at = now();


-- =============================================================
-- SEO + GEO admin domain
-- -------------------------------------------------------------
-- Everything below powers the "SEO + GEO" tab in the admin
-- dashboard. All tables are admin-only via is_admin(); dealers
-- must never see SEO data. Safe to re-run.
-- =============================================================

-- -------- SETTINGS (weights, thresholds, formula versions) ------
create table if not exists public.seo_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

-- -------- MASTER KEYWORD DATABASE -------------------------------
create table if not exists public.seo_keywords (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  keyword               text not null,
  cluster               text,                                       -- C1..C17
  intent                text check (intent in ('informational','commercial','transactional','navigational')),
  funnel_stage          text check (funnel_stage in ('tofu','mofu','bofu','retention')),
  volume_min            int,
  volume_max            int,
  volume_source         text,                                       -- 'gsc'|'semrush'|'planner'|'estimate'
  difficulty            numeric(4,1),                               -- 0..100
  target_url            text,
  competitor_url        text,
  business_relevance    smallint check (business_relevance   between 0 and 5),
  conversion_potential  smallint check (conversion_potential between 0 and 5),
  content_usefulness    smallint check (content_usefulness   between 0 and 5),
  authority_value       smallint check (authority_value      between 0 and 5),
  priority_score        numeric(6,2),                               -- computed via seo_settings weights
  status                text default 'active' check (status in ('active','done','avoid','legal_review','archived')),
  notes                 text,
  assigned_to           text,                                       -- admin email
  last_checked          date,
  unique (keyword, target_url)
);
create index if not exists seo_keywords_cluster_idx  on public.seo_keywords (cluster);
create index if not exists seo_keywords_priority_idx on public.seo_keywords (priority_score desc);

-- -------- KEYWORD DAILY RANKINGS --------------------------------
create table if not exists public.seo_keyword_rankings (
  id             uuid primary key default gen_random_uuid(),
  keyword_id     uuid references public.seo_keywords(id) on delete cascade,
  snapshot_date  date not null,
  position       numeric(5,1),
  impressions    int,
  clicks         int,
  ctr            numeric(5,4),
  source         text not null default 'gsc',
  ranking_url    text,
  unique (keyword_id, snapshot_date, source)
);
create index if not exists seo_kwr_date_idx on public.seo_keyword_rankings (snapshot_date desc);

-- -------- PAGE INVENTORY (indexable URLs) -----------------------
create table if not exists public.seo_pages (
  id                    uuid primary key default gen_random_uuid(),
  url                   text unique not null,
  page_type             text,   -- home|category|pdp|guide|review|comparison|brand|dealer|trust|legal|about|author|blog
  title                 text,
  meta_description      text,
  primary_keyword_id    uuid references public.seo_keywords(id) on delete set null,
  secondary_keywords    jsonb,
  canonical             text,
  robots                text,
  og_title              text,
  og_description        text,
  og_image              text,
  twitter_card          text,
  content_score         smallint,
  technical_score       smallint,
  geo_score             smallint,
  word_count            int,
  internal_links_in     int,
  internal_links_out    int,
  schema_status         text,   -- 'valid'|'warn'|'invalid'|'missing'
  indexation_status     text,   -- 'indexed'|'crawled_not_indexed'|'excluded'|'not_submitted'|'unknown'
  brief_json            jsonb,
  last_reviewed_at      timestamptz,
  reviewer_email        text,
  updated_at            timestamptz not null default now(),
  created_at            timestamptz not null default now()
);
create index if not exists seo_pages_type_idx on public.seo_pages (page_type);

-- -------- DAILY PAGE METRICS (GSC + GA4 + PSI) ------------------
create table if not exists public.seo_page_metrics (
  id                uuid primary key default gen_random_uuid(),
  page_id           uuid references public.seo_pages(id) on delete cascade,
  snapshot_date     date not null,
  clicks            int,
  impressions       int,
  ctr               numeric(5,4),
  position          numeric(5,1),
  sessions          int,
  engaged_sessions  int,
  revenue           numeric(12,2),
  enquiries         int,
  lcp_ms            int,
  inp_ms            int,
  cls               numeric(6,4),
  unique (page_id, snapshot_date)
);
create index if not exists seo_pm_date_idx on public.seo_page_metrics (snapshot_date desc);

-- -------- TECHNICAL ISSUES --------------------------------------
create table if not exists public.seo_issues (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  category           text not null check (category in
    ('indexation','broken_link','redirect_chain','canonical','duplicate_title',
     'duplicate_description','missing_h1','orphan','schema','sitemap','robots',
     'slow','cwv','image','crawl_depth','oos','variant_dup','security','other')),
  severity           text not null check (severity in ('critical','high','medium','low')),
  title              text not null,
  detail             text,
  affected_url       text,
  affected_urls      jsonb,
  evidence_url       text,
  status             text not null default 'open' check (status in ('open','in_progress','resolved','wont_fix','reopened')),
  owner_email        text,
  expected_impact    text,
  fix_recommendation text,
  validation_method  text,
  target_date        date,
  resolved_at        timestamptz
);
create index if not exists seo_issues_status_idx on public.seo_issues (status, severity);

-- -------- CONTENT PLANNER ---------------------------------------
create table if not exists public.seo_content_tasks (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  topic                     text not null,
  cluster                   text,
  intent                    text,
  content_type              text,                    -- guide|review|comparison|category|pdp|trust|legal
  writer_email              text,
  reviewer_email            text,
  status                    text not null default 'idea' check (status in
    ('idea','researching','brief_ready','writing','expert_review',
     'compliance_review','editing','scheduled','published','refresh_required')),
  due_date                  date,
  publish_date              date,
  priority                  smallint,
  brief_json                jsonb,
  target_url                text,
  internal_links            jsonb,
  compliance_review_status  text check (compliance_review_status in ('not_required','pending','cleared','changes_requested')),
  page_id                   uuid references public.seo_pages(id) on delete set null
);
create index if not exists seo_tasks_status_idx on public.seo_content_tasks (status, priority desc);

-- -------- INTERNAL-LINK SUGGESTIONS -----------------------------
create table if not exists public.seo_internal_links (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  source_page_id     uuid references public.seo_pages(id) on delete cascade,
  target_page_id     uuid references public.seo_pages(id) on delete cascade,
  suggested_anchor   text,
  context_snippet    text,
  status             text not null default 'proposed' check (status in ('proposed','approved','implemented','rejected')),
  implemented_at     timestamptz
);

-- -------- STRUCTURED-DATA RESULTS -------------------------------
create table if not exists public.seo_schema_results (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid references public.seo_pages(id) on delete cascade,
  schema_type   text not null,   -- Product, FAQPage, Article, ...
  validated_at  timestamptz not null default now(),
  status        text check (status in ('valid','warn','invalid','missing')),
  errors        jsonb,
  warnings      jsonb,
  raw_jsonld    jsonb
);

-- -------- CANONICAL GEO/AEO QUESTIONS ---------------------------
create table if not exists public.geo_queries (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  question            text unique not null,
  topic_cluster       text,
  our_url             text,               -- the one canonical URL
  our_answer_passage  text,
  next_review_date    date,
  active              boolean default true,
  priority            smallint
);

-- -------- INDIVIDUAL GEO/AEO OBSERVATIONS -----------------------
create table if not exists public.geo_observations (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  query_id              uuid references public.geo_queries(id) on delete cascade,
  platform              text not null check (platform in
    ('chatgpt','perplexity','google_ai_overview','gemini','bing_copilot','claude','other')),
  checked_at            timestamptz not null default now(),
  cited                 boolean not null default false,
  cited_url             text,
  position              smallint,          -- prominence 1..N in the cited list
  competitors_mentioned jsonb,
  answer_accuracy       smallint check (answer_accuracy between 1 and 5),
  sentiment             smallint check (sentiment       between 1 and 5),
  missing_info          text,
  recommended_action    text,
  screenshot_url        text,
  observer_email        text,
  next_review_date      date
);
create index if not exists geo_obs_query_idx on public.geo_observations (query_id, checked_at desc);

-- -------- PERSISTENT CITATIONS ROLLUP ---------------------------
create table if not exists public.geo_citations (
  id                 uuid primary key default gen_random_uuid(),
  our_url            text not null,
  platform           text not null,
  first_seen_at      timestamptz not null default now(),
  last_seen_at       timestamptz not null default now(),
  observation_count  int not null default 1,
  unique (our_url, platform)
);

-- -------- COMPETITOR TRACKING -----------------------------------
create table if not exists public.competitors (
  id      uuid primary key default gen_random_uuid(),
  domain  text unique not null,
  type    text,        -- ecommerce|manufacturer|marketplace|forum|publisher|youtube|instagram
  active  boolean default true,
  notes   text
);

create table if not exists public.competitor_metrics (
  id                     uuid primary key default gen_random_uuid(),
  competitor_id          uuid references public.competitors(id) on delete cascade,
  snapshot_date          date not null,
  organic_keywords       int,
  estimated_visibility   numeric(10,2),
  top_pages              jsonb,
  new_pages              int,
  lost_pages             int,
  new_backlinks          int,
  content_updates        int,
  keyword_overlap        int,
  ai_citations           int,
  source                 text,    -- 'semrush'|'ahrefs'|'manual'
  unique (competitor_id, snapshot_date, source)
);

-- -------- BACKLINKS + BRAND MENTIONS ----------------------------
create table if not exists public.backlinks (
  id                   uuid primary key default gen_random_uuid(),
  first_seen           date,
  last_seen            date,
  referring_domain     text not null,
  source_url           text not null,
  destination_url      text not null,
  anchor_text          text,
  link_type            text,                -- editorial|directory|forum|social|comment|other
  follow               boolean,
  authority_estimate   smallint,
  relevance            smallint,
  risk                 smallint,
  status               text default 'seen' check (status in ('seen','outreach','earned','lost','disavow')),
  source               text                 -- 'bing'|'semrush'|'ahrefs'|'manual'
);

create table if not exists public.brand_mentions (
  id                uuid primary key default gen_random_uuid(),
  first_seen        date,
  referring_domain  text,
  source_url        text,
  context           text,
  sentiment         smallint,
  has_link          boolean,
  status            text default 'seen' check (status in ('seen','outreach','link_earned','ignored'))
);

-- -------- INTEGRATION SYNC LOG ----------------------------------
create table if not exists public.integration_sync_logs (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  integration    text not null,   -- 'gsc'|'ga4'|'bing'|'psi'|'semrush'|'indexnow'
  started_at     timestamptz not null,
  finished_at    timestamptz,
  status         text not null check (status in ('ok','error','partial')),
  rows_written   int,
  error_text     text
);
create index if not exists sync_logs_integration_idx on public.integration_sync_logs (integration, created_at desc);

-- -------- ACTION CENTRE -----------------------------------------
create table if not exists public.seo_action_items (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  problem            text not null,
  evidence_url       text,
  recommendation     text,
  owner_email        text,
  priority           text check (priority in ('P0','P1','P2','P3')),
  due_date           date,
  status             text default 'open' check (status in ('open','in_progress','resolved','wont_fix')),
  expected_impact    text,
  validation_method  text,
  source_table       text,        -- e.g. 'seo_issues','geo_observations'
  source_id          uuid
);

-- -------- ADMIN-ONLY RLS ON EVERY SEO/GEO TABLE -----------------
alter table public.seo_settings          enable row level security;
alter table public.seo_keywords          enable row level security;
alter table public.seo_keyword_rankings  enable row level security;
alter table public.seo_pages             enable row level security;
alter table public.seo_page_metrics      enable row level security;
alter table public.seo_issues            enable row level security;
alter table public.seo_content_tasks     enable row level security;
alter table public.seo_internal_links    enable row level security;
alter table public.seo_schema_results    enable row level security;
alter table public.geo_queries           enable row level security;
alter table public.geo_observations      enable row level security;
alter table public.geo_citations         enable row level security;
alter table public.competitors           enable row level security;
alter table public.competitor_metrics    enable row level security;
alter table public.backlinks             enable row level security;
alter table public.brand_mentions        enable row level security;
alter table public.integration_sync_logs enable row level security;
alter table public.seo_action_items      enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'seo_settings','seo_keywords','seo_keyword_rankings','seo_pages','seo_page_metrics',
    'seo_issues','seo_content_tasks','seo_internal_links','seo_schema_results',
    'geo_queries','geo_observations','geo_citations','competitors','competitor_metrics',
    'backlinks','brand_mentions','integration_sync_logs','seo_action_items'
  ]
  loop
    execute format('drop policy if exists "%s_admin_all" on public.%I', t, t);
    execute format('create policy "%s_admin_all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- -------- REALTIME (subscribed by admin dashboard) --------------
do $$ begin alter publication supabase_realtime add table public.seo_action_items;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.seo_issues;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.geo_observations;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- -------- DEFAULT SETTINGS --------------------------------------
insert into public.seo_settings (key, value) values
  ('priority_weights',              '{"business_relevance":0.20,"search_demand":0.15,"ranking_opportunity":0.20,"conversion_potential":0.20,"content_usefulness":0.10,"available_inventory":0.10,"authority_value":0.05}'),
  ('geo_score_formula',             '{"cited_pct":60,"accuracy":25,"sentiment":15}'),
  ('content_score_min_to_publish',  '70')
on conflict (key) do nothing;
