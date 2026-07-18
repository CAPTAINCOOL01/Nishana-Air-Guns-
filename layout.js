/* ============================================================
   NISHANA — shared header + footer renderer
   Put <div data-nishana-header></div> and <div data-nishana-footer></div>
   in your page, and this script will inject the site chrome.
   Uses auth.js and cart.js for interactive bits.
   ============================================================ */

/* ============================================================
   TRACKING CONFIG  —  paste IDs here, deploy, done.
   ------------------------------------------------------------
   Where to get each ID:
     GA4_MEASUREMENT_ID  → analytics.google.com → Admin → Data
                           Streams → Web → Measurement ID (G-XXXXXXXXXX)
     GSC_VERIFICATION    → search.google.com/search-console → Add
                           property (URL prefix) → HTML tag method →
                           copy the content=""  value (only the token,
                           NOT the whole <meta> tag). Leave blank if
                           you verify via DNS TXT instead (preferred).
     CLARITY_PROJECT_ID  → clarity.microsoft.com (optional heatmaps)
     BING_UET_TAG_ID     → ads.microsoft.com (optional Bing UET)

   Nothing fires on admin / dashboard / dealer / login / checkout /
   order-success / my-orders because those pages don't include
   layout.js. Consent-mode defaults to DENIED — the banner below
   flips it to granted only after the user clicks "Accept".
   ============================================================ */
window.NISHANA_TRACKING = {
  GA4_MEASUREMENT_ID: "G-JHG79FYL48",
  GSC_VERIFICATION:   "",              // GSC verified via DNS/domain property — no meta needed
  CLARITY_PROJECT_ID: "",
  BING_UET_TAG_ID:    "",
};

/* ------------------------------------------------------------
   Injector — runs immediately (before DOMContentLoaded) so the
   GSC meta lands in <head> before Google's bot inspects it, and
   so gtag.js starts loading in parallel with the rest of the
   page. Every load is guarded so pasting an empty ID = no-op.
   ------------------------------------------------------------ */
(() => {
  const cfg = window.NISHANA_TRACKING || {};
  const head = document.head || document.documentElement;
  const CONSENT_KEY = "nishana_consent_v1";
  const consent = (() => {
    try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
  })();

  // 1. GSC verification META (safe: if you also verify via DNS, this is redundant but harmless)
  if (cfg.GSC_VERIFICATION && !document.querySelector('meta[name="google-site-verification"]')) {
    const m = document.createElement("meta");
    m.name = "google-site-verification";
    m.content = cfg.GSC_VERIFICATION;
    head.appendChild(m);
  }

  // 2. Google Consent Mode v2 — MUST be set BEFORE gtag.js loads.
  //    Defaults everything to "denied" so no cookies/pixels fire without opt-in.
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  const granted = consent === "granted";
  gtag("consent", "default", {
    ad_storage:          granted ? "granted" : "denied",
    ad_user_data:        granted ? "granted" : "denied",
    ad_personalization:  granted ? "granted" : "denied",
    analytics_storage:   granted ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage:      "granted",
    wait_for_update: 500,
  });
  gtag("js", new Date());

  // 3. GA4 gtag.js
  if (cfg.GA4_MEASUREMENT_ID && /^G-[A-Z0-9]+$/i.test(cfg.GA4_MEASUREMENT_ID)) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.GA4_MEASUREMENT_ID);
    head.appendChild(s);
    gtag("config", cfg.GA4_MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,      // no ad-personalisation until consent
      transport_type: "beacon",
    });
    // Fire a synthetic organic_landing event so we can slice traffic by
    // first-touch source in GA4 exploration reports (falls back to referrer).
    try {
      const ref = document.referrer || "";
      const src = /google\./i.test(ref) ? "google"
                : /bing\./i.test(ref)   ? "bing"
                : /duckduckgo\./i.test(ref) ? "duckduckgo"
                : /perplexity\.ai/i.test(ref) ? "perplexity"
                : /chat\.openai\.com|chatgpt\.com/i.test(ref) ? "chatgpt"
                : "";
      if (src) gtag("event", "organic_landing", { engine: src, page_path: location.pathname });
    } catch {}
  }

  // 4. Microsoft Clarity (optional)
  if (cfg.CLARITY_PROJECT_ID) {
    (function(c,l,a,r,i){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      const t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      const y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script",cfg.CLARITY_PROJECT_ID);
  }

  // 5. Bing UET (optional)
  if (cfg.BING_UET_TAG_ID) {
    (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:cfg.BING_UET_TAG_ID,enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},
      n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},
      i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i);
    })(window,document,"script","//bat.bing.com/bat.js","uetq");
  }

  // 6. Public helper — call from cart.js / checkout to fire GA4 events.
  //    Safe no-op if GA4 isn't configured.
  window.nishanaTrack = function(name, params){ try { gtag("event", name, params || {}); } catch {} };

  // 7. Consent banner (renders only if consent is unset AND any tracking ID is configured).
  //    Minimal by design — one line + Accept / Decline. Legal-review recommended before launch.
  if (consent === null && (cfg.GA4_MEASUREMENT_ID || cfg.CLARITY_PROJECT_ID || cfg.BING_UET_TAG_ID)) {
    const mount = () => {
      if (document.getElementById("nishana-consent")) return;
      const bar = document.createElement("div");
      bar.id = "nishana-consent";
      bar.setAttribute("role", "dialog");
      bar.setAttribute("aria-label", "Cookie consent");
      bar.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:9998;background:#141b26;color:#efe9db;border:1px solid #2c3646;border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;box-shadow:0 24px 60px -12px rgba(0,0,0,.7);font-family:'IBM Plex Sans',system-ui,sans-serif;font-size:13.5px;line-height:1.5;max-width:900px;margin-left:auto;margin-right:auto";
      bar.innerHTML = `
        <div style="flex:1;min-width:220px">
          <b style="font-family:'Big Shoulders Display',Impact,sans-serif;text-transform:uppercase;letter-spacing:.03em;color:#c9a227">Cookies</b><br>
          We use analytics cookies to understand how the site is used. Reject and only strictly-necessary cookies run.
          <a href="about.html" style="color:#c9a227;text-decoration:underline">Learn more</a>
        </div>
        <button data-consent="denied"  style="background:transparent;border:1px solid #2c3646;color:#cdc7ba;padding:9px 14px;border-radius:8px;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer">Reject</button>
        <button data-consent="granted" style="background:#c9a227;border:1px solid #c9a227;color:#0b0e13;padding:9px 14px;border-radius:8px;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;cursor:pointer">Accept</button>
      `;
      bar.addEventListener("click", (e) => {
        const b = e.target.closest("[data-consent]");
        if (!b) return;
        const decision = b.dataset.consent;
        try { localStorage.setItem(CONSENT_KEY, decision); } catch {}
        gtag("consent", "update", {
          ad_storage:         decision === "granted" ? "granted" : "denied",
          ad_user_data:       decision === "granted" ? "granted" : "denied",
          ad_personalization: decision === "granted" ? "granted" : "denied",
          analytics_storage:  decision === "granted" ? "granted" : "denied",
        });
        bar.remove();
      });
      document.body.appendChild(bar);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
    else mount();
  }
})();

(() => {
  const LOGO_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.4" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="5.6" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/></svg>`;
  const WA_LOCAL_NUMBER = "8329618409";
  const WA_NUMBER = `91${WA_LOCAL_NUMBER}`;
  const WA_DISPLAY_NUMBER = "+91 83296 18409";
  const wa = t => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;

  const CATEGORIES = [
    { id:"air-pistols",  label:"Air Pistols",  href:"air-pistols.html",  count:"3 models", icon:'<path d="M4 12c0-1 .5-2 2-2h10l4-3v9h-4v3l-4-3H6c-1 0-2-.5-2-2z"/>' },
    { id:"air-rifles",   label:"Air Rifles",   href:"air-rifles.html",   count:"5 models", icon:'<path d="M2 12l4-2h9l3-2 5 2v3l-5 2-3-2H6l-4-1z"/>' },
    { id:"spare-parts",  label:"Spare Parts",  href:"spare-parts.html",  count:"Genuine Camstar", icon:'<circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.2 4.2l4.3 4.3M15.5 15.5l4.3 4.3M1 12h6M17 12h6M4.2 19.8l4.3-4.3M15.5 8.5l4.3-4.3"/>' },
    { id:"accessories",  label:"Accessories",  href:"accessories.html",  count:"Pellets & CO₂", icon:'<path d="M4 7l8-4 8 4-8 4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/>' },
  ];

  const NAV = [
    { label:"Home",     href:"index.html",   id:"home" },
    { label:"About",    href:"about.html",   id:"about" },
    { label:"Products", href:"products.html", id:"products", dropdown:true },
    { label:"Blog",     href:"blog.html",    id:"blog" },
    { label:"Contact",  href:"contact.html", id:"contact" },
  ];

  const currentPage = (document.body.dataset.page || "").toLowerCase();

  // ---------- WHATSAPP LEAD CAPTURE ----------
  // Keep every public WhatsApp CTA on the same business number while
  // preserving the page-specific pre-filled message.
  function normalizeWhatsAppLinks() {
    document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
      try {
        const url = new URL(link.href, location.href);
        if (url.hostname === "wa.me") {
          url.pathname = `/${WA_NUMBER}`;
          link.href = url.toString();
        }
      } catch {}
    });
  }

  function wireWhatsAppLeadTracking() {
    if (document.documentElement.dataset.nishanaWaTracking === "on") return;
    document.documentElement.dataset.nishanaWaTracking = "on";
    document.addEventListener("click", event => {
      const link = event.target.closest('a[href*="wa.me/"]');
      if (!link) return;
      window.nishanaTrack?.("generate_lead", {
        method: "whatsapp",
        placement: link.closest(".n-wa-lead") ? "floating_banner" : "site_cta",
        link_text: (link.textContent || "WhatsApp").trim().slice(0, 80),
        page_path: location.pathname,
      });
    });
  }

  function renderWhatsAppLead() {
    if (document.getElementById("nWaLead")) return;
    try {
      if (sessionStorage.getItem("nishana_wa_lead_dismissed") === "1") return;
    } catch {}

    if (!document.getElementById("nWaLeadStyle")) {
      const style = document.createElement("style");
      style.id = "nWaLeadStyle";
      style.textContent = `
        .n-wa-lead{position:fixed;right:18px;bottom:18px;z-index:65;width:min(520px,calc(100vw - 36px));display:grid;grid-template-columns:56px minmax(0,1fr) auto;align-items:center;gap:14px;padding:16px 16px 16px 14px;background:linear-gradient(125deg,rgba(20,27,38,.98),rgba(11,14,19,.98));border:1px solid #2c3646;border-radius:14px;box-shadow:0 24px 70px -18px rgba(0,0,0,.9),0 0 0 1px rgba(201,162,39,.06);font-family:var(--font-b,'IBM Plex Sans',system-ui,sans-serif);color:#efe9db;opacity:0;transform:translateY(18px);transition:opacity .35s ease,transform .35s ease;overflow:hidden}
        .n-wa-lead::before{content:"";position:absolute;inset:0 0 auto;height:2px;background:linear-gradient(90deg,#c9a227 0 45%,#25d366 80%,transparent)}
        .n-wa-lead.is-visible{opacity:1;transform:translateY(0)}
        .n-wa-lead__signal{position:relative;width:52px;height:52px;display:grid;place-items:center;border-radius:50%;color:#25d366;background:#0e1515;border:1px solid rgba(37,211,102,.36);isolation:isolate}
        .n-wa-lead__signal::before,.n-wa-lead__signal::after{content:"";position:absolute;border:1px solid rgba(201,162,39,.23);border-radius:50%;z-index:-1}
        .n-wa-lead__signal::before{inset:5px}.n-wa-lead__signal::after{inset:11px}
        .n-wa-lead__signal svg{width:24px;height:24px}
        .n-wa-lead__eyebrow{display:flex;align-items:center;gap:7px;margin-bottom:3px;font-family:var(--font-m,'IBM Plex Mono',monospace);font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:#8b94a3;white-space:nowrap}
        .n-wa-lead__live{width:6px;height:6px;border-radius:50%;background:#25d366;box-shadow:0 0 0 4px rgba(37,211,102,.11);animation:n-wa-pulse 2s ease-in-out infinite}
        .n-wa-lead__copy strong{display:block;font-family:var(--font-d,'Big Shoulders Display',Impact,sans-serif);font-size:20px;line-height:1.05;letter-spacing:.025em;text-transform:uppercase;color:#efe9db}
        .n-wa-lead__copy p{margin:4px 0 0;color:#8b94a3;font-size:12.5px;line-height:1.35}
        .n-wa-lead__cta{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:0 14px;border-radius:9px;background:#25d366;color:#07130b;font-family:var(--font-m,'IBM Plex Mono',monospace);font-size:10px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;text-decoration:none;white-space:nowrap;transition:background .18s ease,transform .18s ease}
        .n-wa-lead__cta:hover{background:#31e371;transform:translateY(-1px)}
        .n-wa-lead__cta svg{width:15px;height:15px}
        .n-wa-lead__close{position:absolute;top:4px;right:5px;width:25px;height:25px;display:grid;place-items:center;padding:0;border:0;background:transparent;color:#6b7482;font-size:18px;line-height:1;cursor:pointer;border-radius:6px}
        .n-wa-lead__close:hover{background:#1a222f;color:#efe9db}
        @keyframes n-wa-pulse{50%{box-shadow:0 0 0 7px rgba(37,211,102,0)}}
        @media(max-width:640px){.n-wa-lead{left:12px;right:12px;bottom:12px;width:auto;grid-template-columns:48px minmax(0,1fr);gap:11px;padding:13px}.n-wa-lead__signal{width:44px;height:44px}.n-wa-lead__copy strong{font-size:18px}.n-wa-lead__copy p{font-size:11.5px}.n-wa-lead__cta{grid-column:1/-1;width:100%;box-sizing:border-box}.n-wa-lead__close{top:3px;right:4px}}
        @media(prefers-reduced-motion:reduce){.n-wa-lead,.n-wa-lead__cta{transition:none}.n-wa-lead__live{animation:none}}
      `;
      document.head.appendChild(style);
    }

    const lead = document.createElement("aside");
    lead.id = "nWaLead";
    lead.className = "n-wa-lead";
    lead.setAttribute("aria-label", "WhatsApp support");
    lead.innerHTML = `
      <button class="n-wa-lead__close" type="button" aria-label="Dismiss WhatsApp support banner">×</button>
      <div class="n-wa-lead__signal" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2Zm4.4 12c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.3 5.3 0 0 0 1.1 2.7 12 12 0 0 0 4.6 4c2.1.9 2.1.6 2.5.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>
      </div>
      <div class="n-wa-lead__copy">
        <span class="n-wa-lead__eyebrow"><i class="n-wa-lead__live"></i> Open line · ${WA_DISPLAY_NUMBER}</span>
        <strong>Got a doubt? Talk to a human.</strong>
        <p>Licence rules, live stock, delivery or the right model — ask us directly.</p>
      </div>
      <a class="n-wa-lead__cta" href="${wa("Hi Nishana! I have a question and would like some help.")}" target="_blank" rel="noopener" aria-label="Chat with Nishana on WhatsApp at ${WA_DISPLAY_NUMBER}">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2Zm4.4 12c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.3 5.3 0 0 0 1.1 2.7 12 12 0 0 0 4.6 4c2.1.9 2.1.6 2.5.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>
        Chat on WhatsApp
      </a>`;

    lead.querySelector(".n-wa-lead__close").addEventListener("click", () => {
      try { sessionStorage.setItem("nishana_wa_lead_dismissed", "1"); } catch {}
      lead.classList.remove("is-visible");
      setTimeout(() => lead.remove(), 360);
    });
    document.body.appendChild(lead);
    requestAnimationFrame(() => setTimeout(() => lead.classList.add("is-visible"), 700));
  }

  // ---------- HEADER ----------
  function renderHeader(host) {
    const navHtml = NAV.map(item => {
      const active = item.id === currentPage ? " on" : "";
      if (item.dropdown) {
        return `
          <div class="dd" data-dd>
            <button aria-haspopup="true"${item.id === currentPage ? ' class="on"' : ''}>
              ${item.label}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="dd-panel" role="menu">
              <a href="products.html"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg></span><span><b>All products</b><small>Browse everything</small></span></a>
              ${CATEGORIES.map(c => `
                <a href="${c.href}" class="${c.soon?'soon':''}">
                  <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${c.icon}</svg></span>
                  <span><b>${c.label}</b><small>${c.soon?'Arriving soon':(c.count||'In stock')}</small></span>
                </a>`).join("")}
            </div>
          </div>`;
      }
      return `<a href="${item.href}" class="${active.trim()}">${item.label}</a>`;
    }).join("");

    host.outerHTML = `
      <header class="n-hdr" data-nishana-header>
        <div class="in">
          <a class="brand" href="index.html">
            ${LOGO_SVG}
            <div><div class="name">NISHANA</div><span class="tag">AIRGUNS · INDIA</span></div>
          </a>
          <nav class="nav" aria-label="Primary">${navHtml}</nav>
          <div class="spacer"></div>
          <div class="right">
            <a class="icon-a" id="nStaffLink" href="dashboard.html" title="Admin dashboard" style="display:none">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
            </a>
            <button class="icon-a" data-cart-btn title="View cart" aria-label="Open cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 3h3l2.6 13H19l2-9H6"/></svg>
              <span class="cart-badge" data-cart-count>0</span>
            </button>
            <button class="user-chip" id="nUserChip" data-login-btn>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span id="nUserChipText">Sign in</span>
            </button>
            <a class="wa-btn" href="${wa("Hi Nishana! I'd like to enquire about an airgun.")}" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2Zm4.4 12c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.3 5.3 0 0 0 1.1 2.7 12 12 0 0 0 4.6 4c2.1.9 2.1.6 2.5.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>
              <span>WhatsApp</span>
            </a>
            <button class="burger" id="nBurger" aria-label="Open menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </div>
      </header>`;

    // Dropdown behaviour
    const dd = document.querySelector(".n-hdr .dd");
    if (dd) {
      const btn = dd.querySelector("button");
      const close = (e) => { if (!dd.contains(e.target)) dd.classList.remove("open"); };
      btn.addEventListener("click", (e) => { e.stopPropagation(); dd.classList.toggle("open"); });
      document.addEventListener("click", close);
      dd.querySelectorAll(".dd-panel a").forEach(a => a.addEventListener("click", () => dd.classList.remove("open")));
    }

    // Mobile burger + drawer
    const burger = document.getElementById("nBurger");
    if (burger) {
      const scrim = document.createElement("div"); scrim.className = "n-mscrim";
      const mnav = document.createElement("aside"); mnav.className = "n-mnav";
      mnav.innerHTML = `
        <button class="close" aria-label="Close">×</button>
        <h4>Menu</h4>
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <h4>Products</h4>
        <a href="products.html">All products</a>
        ${CATEGORIES.map(c => `<a href="${c.href}">${c.label}</a>`).join("")}
        <h4>Learn</h4>
        <a href="blog.html">Blog &amp; guides</a>
        <h4>Support</h4>
        <a href="contact.html">Contact</a>
        <a href="${wa("Hi Nishana! I'd like to enquire.")}" target="_blank" rel="noopener">WhatsApp us</a>
        <h4>Your account</h4>
        <a href="my-orders.html">My orders</a>
        <a href="#" data-login-btn>Sign in / register</a>
      `;
      document.body.appendChild(scrim); document.body.appendChild(mnav);
      const open  = () => { mnav.classList.add("on"); scrim.classList.add("on"); };
      const closeMnav = () => { mnav.classList.remove("on"); scrim.classList.remove("on"); };
      burger.addEventListener("click", open);
      scrim.addEventListener("click", closeMnav);
      mnav.querySelector(".close").addEventListener("click", closeMnav);
      mnav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMnav));
    }

    // Auth wiring — paints the header chip based on current auth state, and
    // RE-paints whenever Supabase reports a change (SIGNED_IN / SIGNED_OUT /
    // TOKEN_REFRESHED). This fixes the bug where the chip stayed on "Sign in"
    // after a successful sign-in from the modal.
    (async () => {
      try {
        const supabase = await window.getNishanaSupabase();

        // Handlers kept outside so they can be cleanly detached on repaint.
        let openTimer = null, closeTimer = null;
        let hoverEnterChip = null, hoverLeaveChip = null;
        let clickChip = null, hoverEnterMenu = null, hoverLeaveMenu = null;

        function killMenu() {
          document.getElementById("nUserMenu")?.remove();
          clearTimeout(openTimer); clearTimeout(closeTimer);
          openTimer = closeTimer = null;
        }

        function detachChipHandlers(chip) {
          if (!chip) return;
          if (hoverEnterChip) chip.removeEventListener("mouseenter", hoverEnterChip);
          if (hoverLeaveChip) chip.removeEventListener("mouseleave", hoverLeaveChip);
          if (clickChip)      chip.removeEventListener("click",      clickChip);
          hoverEnterChip = hoverLeaveChip = clickChip = null;
        }

        async function paintChip(session) {
          const chip     = document.getElementById("nUserChip");
          const chipText = document.getElementById("nUserChipText");
          const staff    = document.getElementById("nStaffLink");
          if (!chip || !chipText) return;

          killMenu();
          detachChipHandlers(chip);

          if (!session) {
            // Signed OUT — chip becomes the "Sign in" trigger; cart.js's
            // delegated [data-login-btn] handler opens the modal.
            chipText.textContent = "Sign in";
            chip.title = "Sign in";
            chip.setAttribute("data-login-btn", "");
            if (staff) staff.style.display = "none";
            return;
          }

          // Signed IN — show name + a HOVER menu (also opens on click for touch)
          const u = session.user;
          const displayName =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            (u.email ? u.email.split("@")[0] : "Account");
          const short = displayName.length > 18 ? displayName.slice(0,16) + "…" : displayName;
          chipText.textContent = short;
          chip.title = u.email || displayName;
          chip.removeAttribute("data-login-btn");

          // Resolve role so the menu can conditionally show Admin / Dealer
          const role = await window.getNishanaRole(supabase);

          // Keep the top-right staff icon in sync too
          if (staff) {
            if (role === "admin")       { staff.style.display = "inline-flex"; staff.href = "dashboard.html"; staff.title = "Admin dashboard"; }
            else if (role === "dealer") { staff.style.display = "inline-flex"; staff.href = "dealer.html";    staff.title = "Dealer view"; }
            else                        { staff.style.display = "none"; }
          }

          // Build the menu (returns element; NOT yet in the DOM)
          function buildMenu() {
            const menu = document.createElement("div");
            menu.id = "nUserMenu";
            const rect = chip.getBoundingClientRect();
            const top  = Math.round(rect.bottom + 8);
            const right = Math.max(12, Math.round(window.innerWidth - rect.right));
            menu.style.cssText = `position:fixed;top:${top}px;right:${right}px;background-color:#141b26;background:rgba(20,27,38,.98);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid #2c3646;border-radius:12px;min-width:230px;max-width:calc(100vw - 24px);z-index:150;box-shadow:0 24px 60px -12px rgba(0,0,0,.85),0 0 0 1px rgba(201,162,39,.06);padding:6px;font-family:var(--font-b,'IBM Plex Sans',system-ui,sans-serif);animation:n-menu-in .15s ease`;

            const isAdmin  = role === "admin";
            const isDealer = role === "dealer";
            // Explicit colours (no CSS-var reliance) so the menu is always solid + readable.
            const C = { bone:"#efe9db", boneDim:"#cdc7ba", smoke:"#8b94a3", brass:"#c9a227", signal:"#e4572e", edge:"#232b38", steel:"#1a222f" };
            const rowBase = `display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:8px;font-size:14px;text-decoration:none;background:transparent;transition:background .12s ease`;
            const staffRow = isAdmin
              ? `<a href="dashboard.html" data-menu-row style="${rowBase};color:${C.brass};font-weight:600">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
                    Admin dashboard
                 </a>
                 <a href="dealer.html" data-menu-row style="${rowBase};color:${C.boneDim}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
                    Dealer view
                 </a>`
              : isDealer
                ? `<a href="dealer.html" data-menu-row style="${rowBase};color:${C.brass};font-weight:600">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
                      Dealer view
                   </a>`
                : "";

            menu.innerHTML = `
              <div style="padding:12px 14px;border-bottom:1px solid ${C.edge}">
                <div style="font-family:'Big Shoulders Display',Impact,sans-serif;font-weight:800;text-transform:uppercase;font-size:14px;color:${C.bone};line-height:1.1">${displayName}</div>
                <small style="color:${C.smoke};font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px">${u.email||""}${isAdmin?` · <span style="color:${C.brass}">ADMIN</span>`:isDealer?` · <span style="color:${C.brass}">DEALER</span>`:''}</small>
              </div>
              <a href="my-orders.html" data-menu-row style="${rowBase};color:${C.boneDim}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                My orders
              </a>
              ${staffRow}
              <div style="height:1px;background:${C.edge};margin:4px 6px"></div>
              <button id="nSignOut" data-menu-row style="width:100%;${rowBase};color:${C.signal};border:none;cursor:pointer;text-align:left;font-family:inherit">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>
                Sign out
              </button>`;

            // Row hover highlight
            menu.querySelectorAll("[data-menu-row]").forEach(row => {
              const isSignout = row.id === "nSignOut";
              row.addEventListener("mouseenter", () => row.style.background = isSignout ? "rgba(228,87,46,.14)" : C.steel);
              row.addEventListener("mouseleave", () => row.style.background = "transparent");
            });

            menu.querySelector("#nSignOut").addEventListener("click", async () => {
              await supabase.auth.signOut(); // onAuthStateChange will repaint
            });

            // Keep menu open while cursor is inside it; close on leave (with grace period)
            hoverEnterMenu = () => { clearTimeout(closeTimer); closeTimer = null; };
            hoverLeaveMenu = () => { closeTimer = setTimeout(killMenu, 220); };
            menu.addEventListener("mouseenter", hoverEnterMenu);
            menu.addEventListener("mouseleave", hoverLeaveMenu);
            return menu;
          }

          function openMenu() {
            clearTimeout(closeTimer); closeTimer = null;
            if (document.getElementById("nUserMenu")) return;
            document.body.appendChild(buildMenu());
          }
          function scheduleOpen()  { clearTimeout(openTimer);  openTimer  = setTimeout(openMenu, 80);  }
          function scheduleClose() { clearTimeout(closeTimer); closeTimer = setTimeout(killMenu, 220); }

          // Attach handlers. Hover only on devices that truly support it —
          // on touch, a tap fires mouseenter THEN click which would open and
          // instantly close the menu. Touch devices get click-only.
          const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
          clickChip = (e) => { e.stopPropagation(); e.preventDefault(); if (document.getElementById("nUserMenu")) killMenu(); else openMenu(); };
          chip.addEventListener("click", clickChip);
          if (canHover) {
            hoverEnterChip = scheduleOpen;
            hoverLeaveChip = scheduleClose;
            chip.addEventListener("mouseenter", hoverEnterChip);
            chip.addEventListener("mouseleave", hoverLeaveChip);
          }

          // Click-outside dismisses the menu (for touch users)
          document.addEventListener("click", (ev) => {
            const menu = document.getElementById("nUserMenu");
            if (menu && !menu.contains(ev.target) && ev.target !== chip && !chip.contains(ev.target)) killMenu();
          });
        }

        // Initial paint from the current session
        const { data: { session: initial } } = await supabase.auth.getSession();
        await paintChip(initial);

        // Repaint on every auth-state change (SIGNED_IN after modal, SIGNED_OUT,
        // TOKEN_REFRESHED, USER_UPDATED). This is what fixes the "Sign in stays
        // visible after logging in" bug.
        supabase.auth.onAuthStateChange((_evt, session) => { paintChip(session); });
      } catch (e) { console.warn("[nishana layout auth]", e); }
    })();
  }

  // ---------- FOOTER ----------
  function renderFooter(host) {
    host.outerHTML = `
      <footer class="n-ftr">
        <div class="grid">
          <div class="col">
            <div class="brand">
              ${LOGO_SVG}
              <div><div class="name">NISHANA</div><small>AIRGUNS · INDIA</small></div>
            </div>
            <p class="about">Multi-brand airgun retailer for India. Genuine stock, GST invoice, manufacturer warranty, pan-India delivery. Everything sold here is licence-exempt under Arms Rules 2016.</p>
            <a class="n-btn n-btn--wa" href="${wa("Hi Nishana! I'd like to enquire about an airgun.")}" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2Zm4.4 12c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.3 5.3 0 0 0 1.1 2.7 12 12 0 0 0 4.6 4c2.1.9 2.1.6 2.5.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>
              Chat on WhatsApp
            </a>
          </div>
          <div class="col">
            <h5>Shop</h5>
            <a href="products.html">All products</a>
            <a href="air-pistols.html">Air pistols</a>
            <a href="air-rifles.html">Air rifles</a>
            <a href="spare-parts.html">Spare parts</a>
            <a href="accessories.html">Accessories</a>
          </div>
          <div class="col">
            <h5>Company</h5>
            <a href="about.html">About Nishana</a>
            <a href="blog.html">Blog &amp; guides</a>
            <a href="contact.html">Contact</a>
          </div>
          <div class="col">
            <h5>Your account</h5>
            <a href="my-orders.html">My orders</a>
            <a href="login.html">Sign in / register</a>
          </div>
          <div class="col">
            <h5>Legal</h5>
            <p style="color:var(--smoke);font-size:13px;line-height:1.55">All airguns sold are .177 cal, ≤20 J, licence-exempt under India's Arms Rules 2016.</p>
          </div>
        </div>
        <div class="bot">
          <span>© ${new Date().getFullYear()} Nishana Airguns</span>
          <span>Made in India · Genuine · GST invoice</span>
        </div>
      </footer>`;
  }

  // ---------- MOUNT ----------
  function mount() {
    const h = document.querySelector("[data-nishana-header]");
    if (h) renderHeader(h);
    const f = document.querySelector("[data-nishana-footer]");
    if (f) renderFooter(f);
    normalizeWhatsAppLinks();
    wireWhatsAppLeadTracking();
    renderWhatsAppLead();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
