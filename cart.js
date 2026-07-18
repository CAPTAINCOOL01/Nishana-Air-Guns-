/* ============================================================
   NISHANA — cart state, cart drawer, and auth modal
   ============================================================
   Loaded on any page that needs cart / login UI. Pure vanilla,
   no build step. Talks to Supabase via window.NISHANA_AUTH.
   ============================================================ */

(() => {
  const STORAGE_KEY = "nishana_cart_v1";
  // Catalog is built from products.js (load products.js BEFORE cart.js).
  // Falls back to the RX Gen 3 so old pages can't break the cart.
  const CATALOG = {};
  (window.NISHANA_PRODUCTS || [{
    id:"star-rx-gen3", brand:"Camstar", name:"Star RX Gen 3",
    price:24000, mrp:27500,
    image:"https://camstarsports.com/products/star-rx-gen3-1.webp",
  }]).forEach(p => {
    if (p.buy === false) return; // WhatsApp-only items never enter the cart
    CATALOG[p.id] = { id:p.id, brand:p.brand, name:p.name, price:p.price, mrp:p.mrp || null, image:p.image, shipping:0 };
  });
  window.NISHANA_CATALOG = CATALOG;

  // ---------- STATE ----------
  const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
  const save = (items) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); emit(); };

  let items = load();
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => { try { fn(items); } catch (_) {} });

  const inr = n => "₹" + Number(n||0).toLocaleString("en-IN");

  const cart = {
    items: () => items,
    subtotal: () => items.reduce((s,i) => s + i.price * i.qty, 0),
    count:    () => items.reduce((s,i) => s + i.qty, 0),
    add(productId, qty = 1) {
      const p = CATALOG[productId]; if (!p) return;
      const found = items.find(i => i.id === productId);
      if (found) found.qty += qty; else items = [...items, { ...p, qty }];
      save(items);
    },
    updateQty(id, qty) {
      qty = Math.max(0, Math.min(9, qty));
      if (qty === 0) items = items.filter(i => i.id !== id);
      else items = items.map(i => i.id === id ? { ...i, qty } : i);
      save(items);
    },
    remove(id) { items = items.filter(i => i.id !== id); save(items); },
    clear() { items = []; save(items); },
    onChange(fn) { listeners.add(fn); fn(items); return () => listeners.delete(fn); },
  };
  window.NishanaCart = cart;

  // ---------- STYLES (injected once) ----------
  if (!document.getElementById("nishana-cart-css")) {
    const st = document.createElement("style"); st.id = "nishana-cart-css";
    st.textContent = `
    :root{
      --n-ink:#0b0e13; --n-steel:#131923; --n-steel-2:#161d28; --n-panel:#141b26;
      --n-edge:#232b38; --n-edge-2:#2c3646;
      --n-brass:#c9a227; --n-brass-hi:#e6c453;
      --n-bone:#efe9db; --n-bone-dim:#cdc7ba; --n-smoke:#8b94a3; --n-smoke-2:#6b7482;
      --n-ok:#4bb381; --n-signal:#e4572e;
      --n-fd:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;
      --n-fb:"IBM Plex Sans",ui-sans-serif,system-ui,sans-serif;
      --n-fm:"IBM Plex Mono",ui-monospace,SFMono-Regular,monospace;
    }
    /* Cart drawer */
    .n-scrim{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;opacity:0;pointer-events:none;transition:opacity .28s ease}
    .n-scrim.on{opacity:1;pointer-events:auto}
    .n-drawer{
      position:fixed;top:0;right:0;bottom:0;width:min(420px,100%);
      background:var(--n-panel);border-left:1px solid var(--n-edge);
      color:var(--n-bone);font-family:var(--n-fb);
      transform:translateX(105%);transition:transform .32s cubic-bezier(.22,.61,.36,1);
      z-index:210;display:flex;flex-direction:column;
    }
    .n-drawer.on{transform:translateX(0)}
    .n-drawer .h{display:flex;align-items:center;gap:10px;padding:18px 20px;border-bottom:1px solid var(--n-edge)}
    .n-drawer .h h2{font-family:var(--n-fd);font-weight:800;text-transform:uppercase;letter-spacing:.03em;font-size:22px;margin:0}
    .n-drawer .h .n-count{margin-left:6px;background:var(--n-brass);color:var(--n-ink);border-radius:20px;padding:2px 9px;font-family:var(--n-fm);font-size:11px;font-weight:600}
    .n-drawer .h .n-close{margin-left:auto;background:transparent;border:none;color:var(--n-smoke);font-size:24px;line-height:1;cursor:pointer;padding:4px 6px}
    .n-drawer .h .n-close:hover{color:var(--n-bone)}
    .n-drawer .b{flex:1;overflow-y:auto;padding:18px 20px}
    .n-drawer .empty{text-align:center;color:var(--n-smoke);padding:40px 20px;font-family:var(--n-fm);font-size:12.5px;letter-spacing:.08em}
    .n-drawer .empty .ico{font-size:44px;margin-bottom:10px;opacity:.5}
    .n-drawer .row{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--n-edge)}
    .n-drawer .row img{width:64px;height:64px;object-fit:contain;background:var(--n-steel);border:1px solid var(--n-edge);border-radius:9px;padding:6px;flex:none}
    .n-drawer .row .info{flex:1;min-width:0}
    .n-drawer .row .info b{display:block;font-family:var(--n-fd);font-weight:700;text-transform:uppercase;font-size:15px;color:var(--n-bone);letter-spacing:.02em;line-height:1.15}
    .n-drawer .row .info small{color:var(--n-smoke);font-family:var(--n-fm);font-size:11px;letter-spacing:.06em}
    .n-drawer .row .foot{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
    .n-drawer .qty{display:inline-flex;align-items:center;background:var(--n-steel);border:1px solid var(--n-edge);border-radius:6px;overflow:hidden}
    .n-drawer .qty button{background:transparent;border:none;color:var(--n-bone);width:26px;height:26px;cursor:pointer;font-size:14px;line-height:1}
    .n-drawer .qty button:hover{background:var(--n-steel-2);color:var(--n-brass)}
    .n-drawer .qty span{padding:0 10px;font-family:var(--n-fm);font-size:13px;min-width:22px;text-align:center}
    .n-drawer .price{font-family:var(--n-fm);color:var(--n-bone);font-size:13.5px}
    .n-drawer .rm{background:transparent;border:none;color:var(--n-smoke);cursor:pointer;padding:2px 6px;font-size:14px;align-self:flex-start}
    .n-drawer .rm:hover{color:var(--n-signal)}
    .n-drawer .f{padding:18px 20px;border-top:1px solid var(--n-edge);background:var(--n-steel-2)}
    .n-drawer .f .sub{display:flex;justify-content:space-between;font-family:var(--n-fd);font-weight:800;text-transform:uppercase;letter-spacing:.03em;font-size:20px;margin-bottom:6px}
    .n-drawer .f .sub span:last-child{color:var(--n-brass)}
    .n-drawer .f .note{font-family:var(--n-fm);font-size:10.5px;letter-spacing:.08em;color:var(--n-smoke);margin:0 0 12px}
    .n-drawer .f .cta{display:block;text-align:center;background:var(--n-brass);color:var(--n-ink);border:1px solid var(--n-brass);
      padding:13px;border-radius:9px;font-family:var(--n-fd);font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-size:14px;cursor:pointer;text-decoration:none;transition:.2s ease}
    .n-drawer .f .cta:hover{background:var(--n-brass-hi);border-color:var(--n-brass-hi)}
    .n-drawer .f .cont{display:block;width:100%;text-align:center;background:transparent;color:var(--n-bone-dim);border:1px solid var(--n-edge);
      padding:11px;border-radius:9px;font-family:var(--n-fm);font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin-top:8px;cursor:pointer;transition:.2s ease}
    .n-drawer .f .cont:hover{border-color:var(--n-brass);color:var(--n-brass)}

    /* Auth modal */
    .n-modal{position:fixed;inset:0;background:rgba(11,14,19,.85);z-index:300;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
    .n-modal.on{display:flex;animation:n-fade .18s ease}
    @keyframes n-fade{from{opacity:0}to{opacity:1}}
    .n-modal .card{background:var(--n-panel);border:1px solid var(--n-edge);border-radius:14px;max-width:400px;width:100%;padding:28px;position:relative;overflow:hidden;color:var(--n-bone);font-family:var(--n-fb)}
    .n-modal .card::before{content:"";position:absolute;inset:0 0 auto 0;height:2px;background:linear-gradient(90deg,var(--n-brass),transparent)}
    .n-modal .card .x{position:absolute;top:14px;right:16px;background:transparent;border:none;color:var(--n-smoke);font-size:22px;cursor:pointer;line-height:1}
    .n-modal .card .x:hover{color:var(--n-bone)}
    .n-modal h1{font-family:var(--n-fd);font-weight:800;text-transform:uppercase;letter-spacing:.02em;font-size:26px;margin:0 0 6px;line-height:1.05}
    .n-modal .sub{color:var(--n-smoke);font-size:13px;margin:0 0 20px}
    .n-modal .goog{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:var(--n-bone);color:#1f1f1f;border:1px solid var(--n-bone);padding:11px 14px;border-radius:9px;cursor:pointer;font-family:var(--n-fb);font-weight:600;font-size:14px;transition:.18s ease}
    .n-modal .goog:hover{background:var(--n-bone-dim);border-color:var(--n-bone-dim)}
    .n-modal .goog:disabled{opacity:.6;cursor:not-allowed}
    .n-modal .goog svg{width:17px;height:17px}
    .n-modal .div{display:flex;align-items:center;gap:12px;margin:18px 0 16px;color:var(--n-smoke-2);font-family:var(--n-fm);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase}
    .n-modal .div::before,.n-modal .div::after{content:"";flex:1;height:1px;background:var(--n-edge)}
    .n-modal form{display:flex;flex-direction:column;gap:12px}
    .n-modal label{font-family:var(--n-fm);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--n-smoke);display:block;margin-bottom:5px}
    .n-modal input{width:100%;background:var(--n-steel);border:1px solid var(--n-edge);border-radius:9px;padding:11px 13px;color:var(--n-bone);font-family:var(--n-fb);font-size:14px;outline:none;transition:.18s ease}
    .n-modal input:focus{border-color:var(--n-brass)}
    .n-modal .primary{width:100%;background:var(--n-brass);color:var(--n-ink);border:1px solid var(--n-brass);padding:12px;border-radius:9px;cursor:pointer;font-family:var(--n-fd);font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-size:14px;transition:.18s ease;margin-top:4px}
    .n-modal .primary:hover{background:var(--n-brass-hi);border-color:var(--n-brass-hi)}
    .n-modal .primary:disabled{opacity:.6;cursor:not-allowed}
    .n-modal .row-l{display:flex;justify-content:space-between;font-size:12.5px;color:var(--n-smoke);margin-top:4px}
    .n-modal .row-l button{background:transparent;border:none;color:var(--n-brass);cursor:pointer;font-family:inherit;font-size:inherit;padding:0}
    .n-modal .row-l button:hover{text-decoration:underline}
    .n-modal .msg{margin-top:12px;padding:9px 12px;border-radius:8px;font-family:var(--n-fm);font-size:12px;line-height:1.4;display:none}
    .n-modal .msg.err{display:block;background:rgba(228,87,46,.12);border:1px solid rgba(228,87,46,.35);color:#f7b7a0}
    .n-modal .msg.ok {display:block;background:rgba(75,179,129,.12);border:1px solid rgba(75,179,129,.35);color:#a9e4c6}
    `;
    document.head.appendChild(st);
  }

  // ---------- CART DRAWER ----------
  const scrim = document.createElement("div"); scrim.className = "n-scrim";
  const drawer = document.createElement("aside"); drawer.className = "n-drawer";
  drawer.setAttribute("aria-hidden","true");
  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(scrim); document.body.appendChild(drawer); renderDrawer();
  });
  if (document.readyState !== "loading") { document.body.appendChild(scrim); document.body.appendChild(drawer); renderDrawer(); }

  function openDrawer(){ drawer.classList.add("on"); scrim.classList.add("on"); drawer.setAttribute("aria-hidden","false"); }
  function closeDrawer(){ drawer.classList.remove("on"); scrim.classList.remove("on"); drawer.setAttribute("aria-hidden","true"); }
  scrim.addEventListener("click", closeDrawer);
  window.openNishanaCart  = openDrawer;
  window.closeNishanaCart = closeDrawer;

  function renderDrawer() {
    const total = cart.subtotal();
    if (!items.length) {
      drawer.innerHTML = `
        <div class="h">
          <h2>Cart</h2>
          <button class="n-close" aria-label="Close">×</button>
        </div>
        <div class="b">
          <div class="empty">
            <div class="ico">🛒</div>
            <p>Your cart is empty</p>
            <button class="cont">← Continue shopping</button>
          </div>
        </div>`;
    } else {
      drawer.innerHTML = `
        <div class="h">
          <h2>Cart <span class="n-count">${cart.count()}</span></h2>
          <button class="n-close" aria-label="Close">×</button>
        </div>
        <div class="b">
          ${items.map(i => `
            <div class="row" data-id="${i.id}">
              <img src="${i.image}" alt="${i.name}" referrerpolicy="no-referrer">
              <div class="info">
                <b>${i.name}</b>
                <small>${i.brand}</small>
                <div class="foot">
                  <div class="qty">
                    <button data-q="dec" aria-label="Decrease">−</button>
                    <span>${i.qty}</span>
                    <button data-q="inc" aria-label="Increase">+</button>
                  </div>
                  <div class="price">${inr(i.price * i.qty)}</div>
                </div>
              </div>
              <button class="rm" aria-label="Remove">×</button>
            </div>`).join("")}
        </div>
        <div class="f">
          <div class="sub"><span>Subtotal</span><span>${inr(total)}</span></div>
          <p class="note">Free shipping pan-India · GST invoice · Manufacturer warranty</p>
          <a class="cta" href="checkout.html">Proceed to checkout →</a>
          <button class="cont">Continue shopping</button>
        </div>`;
    }
    drawer.querySelector(".n-close").addEventListener("click", closeDrawer);
    drawer.querySelectorAll(".cont").forEach(b => b.addEventListener("click", closeDrawer));
    drawer.querySelectorAll(".row").forEach(row => {
      const id = row.dataset.id;
      row.querySelector('[data-q="dec"]')?.addEventListener("click", () => cart.updateQty(id, (items.find(i=>i.id===id)?.qty||1) - 1));
      row.querySelector('[data-q="inc"]')?.addEventListener("click", () => cart.updateQty(id, (items.find(i=>i.id===id)?.qty||1) + 1));
      row.querySelector(".rm")?.addEventListener("click", () => cart.remove(id));
    });
  }
  cart.onChange(renderDrawer);
  cart.onChange(() => {
    // Update every element that has data-cart-count
    document.querySelectorAll("[data-cart-count]").forEach(el => {
      const n = cart.count();
      el.textContent = n;
      el.style.display = n > 0 ? "" : "none";
    });
  });

  // ---------- AUTH MODAL ----------
  const modal = document.createElement("div"); modal.className = "n-modal";
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(modal));
  if (document.readyState !== "loading") document.body.appendChild(modal);

  // Shared client comes from auth.js (window.getNishanaSupabase).
  const sb = () => window.getNishanaSupabase();

  // Public API: showLogin({ reason, onSuccess }). Returns a promise resolving with the user, or null if closed.
  window.showNishanaLogin = function(opts = {}) {
    return new Promise((resolve) => {
      let mode = opts.mode === "signup" ? "signup" : "signin";
      const reason = opts.reason || "Sign in to continue.";
      function render() {
        const isSignup = mode === "signup";
        modal.innerHTML = `
          <div class="card" role="dialog" aria-modal="true" aria-label="Sign in">
            <button class="x" aria-label="Close">×</button>
            <h1>${isSignup ? "Create account" : "Sign in"}</h1>
            <p class="sub">${reason}</p>
            <button class="goog" type="button" id="nGoog">
              <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>
            <div class="div">or</div>
            <form id="nAuthForm">
              ${isSignup ? `
                <div><label>Full name</label><input id="nName" type="text" required autocomplete="name" placeholder="As on your ID"></div>
                <div><label>Mobile (10 digits)</label><input id="nPhone" type="tel" required inputmode="numeric" pattern="[0-9]{10}" autocomplete="tel" placeholder="98XXXXXXXX"></div>` : ""}
              <div><label>Email</label><input id="nEmail" type="email" required autocomplete="email" placeholder="you@gmail.com"></div>
              <div><label>Password</label><input id="nPw" type="password" required minlength="8" placeholder="Minimum 8 characters" autocomplete="${isSignup?"new-password":"current-password"}"></div>
              <button class="primary" type="submit" id="nSubmit">${isSignup ? "Create account" : "Sign in"}</button>
              <div class="row-l">
                <button type="button" id="nToggle">${isSignup ? "Have an account? Sign in" : "Create an account"}</button>
                ${isSignup ? "" : '<button type="button" id="nForgot">Forgot password?</button>'}
              </div>
            </form>
            <div class="msg" id="nMsg" aria-live="polite"></div>
          </div>`;
        wire();
      }
      function close(user = null) {
        modal.classList.remove("on"); modal.innerHTML = "";
        resolve(user);
      }
      function show(kind, text) {
        const m = modal.querySelector("#nMsg"); if (!m) return;
        m.className = "msg " + kind; m.textContent = text;
      }
      async function wire() {
        modal.querySelector(".x").addEventListener("click", () => close(null));
        modal.querySelector("#nToggle").addEventListener("click", () => { mode = mode === "signin" ? "signup" : "signin"; render(); });
        modal.querySelector("#nGoog").addEventListener("click", async () => {
          const s = await sb();
          const { error } = await s.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: location.href } // come back to this exact page
          });
          if (error) show("err", error.message);
        });
        const forgot = modal.querySelector("#nForgot");
        if (forgot) forgot.addEventListener("click", async () => {
          const email = modal.querySelector("#nEmail").value.trim();
          if (!email) return show("err", "Enter your email above first.");
          const s = await sb();
          const { error } = await s.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/login.html" });
          if (error) return show("err", error.message);
          show("ok", "Password reset email sent.");
        });
        modal.querySelector("#nAuthForm").addEventListener("submit", async (e) => {
          e.preventDefault();
          const submit = modal.querySelector("#nSubmit"); submit.disabled = true; submit.textContent = "Please wait…";
          const email = modal.querySelector("#nEmail").value.trim();
          const pw = modal.querySelector("#nPw").value;
          try {
            const s = await sb();
            if (mode === "signin") {
              const { data, error } = await s.auth.signInWithPassword({ email, password: pw });
              if (error) throw error;
              close(data.user);
            } else {
              const name  = modal.querySelector("#nName").value.trim();
              const phone = modal.querySelector("#nPhone").value.trim();
              if (!/^[0-9]{10}$/.test(phone)) throw new Error("Enter a valid 10-digit mobile number.");
              const { data, error } = await s.auth.signUp({
                email, password: pw,
                options: {
                  emailRedirectTo: location.href,
                  data: { full_name: name, phone }   // saved to user_metadata
                }
              });
              if (error) throw error;
              // If email-confirmation is enabled in Supabase, session is null.
              if (data.session) close(data.user);
              else {
                show("ok", "Account created. Check your inbox to confirm your email, then sign in.");
                mode = "signin"; setTimeout(render, 1200);
              }
            }
          } catch (err) {
            show("err", err?.message || "Something went wrong.");
            submit.disabled = false; submit.textContent = mode === "signin" ? "Sign in" : "Create account";
          }
        });
      }
      modal.classList.add("on"); render();
    });
  };

  // ---------- HEADER WIDGETS (cart button + login/user chip) ----------
  // Any element with [data-cart-btn] becomes an "open cart" trigger.
  document.addEventListener("click", (e) => {
    const cartBtn = e.target.closest("[data-cart-btn]");
    if (cartBtn) { e.preventDefault(); openDrawer(); }
    const addBtn = e.target.closest("[data-add-to-cart]");
    if (addBtn) {
      e.preventDefault();
      cart.add(addBtn.dataset.addToCart, 1);
      openDrawer();
    }
    const loginBtn = e.target.closest("[data-login-btn]");
    if (loginBtn) {
      e.preventDefault();
      // Whenever the header/nav "Sign in" button opens the modal, a successful
      // login should trigger a full page refresh so every part of the page
      // (header chip, cart, checkout banner, etc.) reflects the new state.
      window.showNishanaLogin({ reason: "Sign in to your Nishana account." }).then((user) => {
        if (user) location.reload();
      });
    }
  });

  // Auto-hydrate cart badge on any element with [data-cart-count] once DOM is up
  const paint = () => document.querySelectorAll("[data-cart-count]").forEach(el => {
    const n = cart.count(); el.textContent = n; el.style.display = n > 0 ? "" : "none";
  });
  if (document.readyState !== "loading") paint(); else document.addEventListener("DOMContentLoaded", paint);
})();
