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
