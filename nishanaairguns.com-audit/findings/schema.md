# Schema / Structured Data — Findings (v2, 2026-07-20)

**Score:** 78 / 100 (⬇ 6 from 84)

## Coverage matrix (fresh)

| Page | Blocks | Types (unique) |
|---|---:|---|
| `product-rx-gen3.html` | 3 | Product, Brand, Offer, FAQPage, BreadcrumbList, ListItem, Organization, Answer, Question |
| Every new blog (5) | 3 | Article, FAQPage, Speakable, WebPage |
| `blog-rx-gen3-price-india` | 2 | Article, FAQPage, WebPage |
| `blog-rx-gen3-running-cost` | 2 | Article, FAQPage, WebPage |
| `blog-star-rx-gen3-review` | 2 | Article, FAQPage |
| `blog-airgun-maintenance` | 2 | Article, FAQPage |
| `blog-home-range-setup` | 2 | Article, FAQPage |
| `blog.html` | 1 | Blog, BlogPosting[10] |
| `index.html` | 2 | Organization, WebSite, ContactPoint |
| `about.html` | 1 | AboutPage, Organization, WebSite, ContactPoint |
| `contact.html` | 1 | ContactPage, Organization, WebSite, ContactPoint |
| `air-pistols.html` | 1 | ItemList (1 item) |
| **`accessories.html`** | **0** | **—** |
| **`products.html`** | **0** | **—** |
| **`spare-parts.html`** | **0** | **—** |
| **10 new /product-*.html** | **0** | **—** |

## Positive since 19‑Jul

- 3 new blogs each ship with 3 JSON-LD blocks (Article + FAQ + WebPage/Speakable)
- 3 older blogs got 2 blocks (were 0 in prior audit)
- PDP for RX Gen 3 unchanged — still full 9-type coverage

## High

### 10 new stub PDPs have zero JSON-LD in HTML source

Verified for all 10 (`product-aerosoft-x1` through `product-rx-gen3-magazine`). Empty of `<script type="application/ld+json">` in the shipped HTML. `product-detail.js` presumably injects Product schema after render.

**Fix — minimum viable static block per PDP:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "<Full product name>",
  "brand": {"@type": "Brand", "name": "<Brand>"},
  "image": ["https://nishanaairguns.com/img/products/<slug>/1.webp"],
  "description": "<200-char description>",
  "sku": "<slug>",
  "offers": {
    "@type": "Offer",
    "url": "https://nishanaairguns.com/product-<slug>.html",
    "priceCurrency": "INR",
    "price": "<price>",
    "availability": "https://schema.org/InStock",
    "seller": {"@type": "Organization", "name": "Nishana Airguns"}
  }
}
</script>
```

Plus `BreadcrumbList`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://nishanaairguns.com/"},
    {"@type": "ListItem", "position": 2, "name": "Air Pistols", "item": "https://nishanaairguns.com/air-pistols.html"},
    {"@type": "ListItem", "position": 3, "name": "<Product Name>"}
  ]
}
</script>
```

### 3 category pages still have zero schema (unchanged from 19‑Jul)

Fix template per page:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "<Category Name>",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://nishanaairguns.com/product-<slug>.html",
      "name": "<Product Name>"
    }
    // repeat for each SKU in category
  ]
}
</script>
```

## Medium

### No `Person` schema anywhere

Same as 19‑Jul. Create `/authors/ramayana-singh.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ramayana Singh",
  "url": "https://nishanaairguns.com/authors/ramayana-singh.html",
  "jobTitle": "Founder, Nishana Airguns",
  "sameAs": [
    "https://www.linkedin.com/in/...",
    "https://instagram.com/nishanaairguns"
  ]
}
</script>
```

Then update every blog's `Article.author` to reference this Person URL.
