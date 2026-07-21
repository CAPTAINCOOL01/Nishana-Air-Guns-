/* ============================================================
   NISHANA — researched product-detail renderer
   Each dedicated product-*.html file selects one entry by ID.
   Prices stay in products.js; verified specifications live here.
   ============================================================ */
(() => {
  const DETAILS = {
    "aerosoft-x1": {
      brand: "Aerosoft",
      title: "Aerosoft X1 CO₂ Air Pistol",
      category: "Air Pistols",
      categoryHref: "air-pistols.html",
      badge: "Compact CO₂",
      images: [
        "img/products/aerosoft-x1/1.webp",
        "img/products/aerosoft-x1/2.webp",
        "img/products/aerosoft-x1/3.webp",
        "img/products/aerosoft-x1/4.webp"
      ],
      summary: "A compact .177 steel-BB CO₂ pistol with a semi-automatic action and an 84 FS-style silhouette. The photographed manual is labelled 350 FPS; exact output varies with BB mass, temperature, capsule pressure and firing pace.",
      facts: [["Calibre", ".177 / 4.5 mm BB"], ["Power", "12 g CO₂"], ["Action", "Semi-automatic"], ["Labelled velocity", "350 FPS"]],
      overview: [
        "The X1 is the smallest-format CO₂ pistol in Nishana’s current BB lineup. Its compact frame and familiar controls suit controlled recreational target practice where a shorter grip and slide profile are preferred.",
        "Aerosoft does not currently publish an authoritative model page that resolves every specification. Nishana’s inventory photos confirm the .177 marking, CO₂ system and a supplied manual labelled 350 FPS. A 15-round capacity appears in current retailer documentation, so it is identified below as retailer-stated until the exact magazine is physically counted."
      ],
      specs: [["Projectile", ".177 / 4.5 mm steel BB"], ["Power source", "Standard 12 g CO₂ capsule"], ["Action", "Semi-automatic"], ["Magazine", "15 rounds — retailer-stated; verify supplied magazine"], ["Velocity", "350 FPS printed on supplied manual; not a guaranteed measured output"], ["Construction", "Confirm from physical unit; no official material specification located"], ["Manufacturer / OEM", "Not independently verified"], ["Best use", "Controlled paper-target practice and recreational plinking"]],
      highlights: ["Compact 84 FS-style proportions", "Serial marking visible on inventory unit", "Foam presentation packaging pictured", "Manual supplied with photographed inventory"],
      notice: "Specification transparency: exact energy, dimensions, weight, construction and OEM identity are not claimed because no authoritative manufacturer sheet was located. Confirm the supplied manual and physical markings before dispatch.",
      care: ["Use only the projectile type stated on the supplied manual", "Wear eye protection and use a BB-rated backstop", "Install and remove CO₂ exactly as the manual directs", "Store unloaded, depressurised where instructed, and secured"],
      sources: [
        ["Eagle Airgun — current X1 retailer specification", "https://eagleairgun.com/products/aerosoft-x1-premium-air-pistol-15-round-bb-no-license"],
        ["Shooter Unknown — X1 retailer listing", "https://shooterunknown.in/products/aerosoft-x1-co2-pistol-177-no-licence-required"],
        ["Invincible One — X1 retailer listing", "https://www.invincibleone.in/product/aerosoft-compressed-ag-technologys-x1-co2-air-gun-beretta-84fs-made-in-india/"]
      ],
      airgun: true,
      availability: "LimitedAvailability"
    },
    "asg-x9-classic": {
      brand: "ActionSportGames",
      title: "ASG X9 Classic CO₂ Blowback Pistol",
      category: "Air Pistols",
      categoryHref: "air-pistols.html",
      badge: "Full-metal blowback",
      images: ["img/products/asg-x9-classic/1.webp", "img/products/asg-x9-classic/2.webp", "img/products/asg-x9-classic/3.webp", "img/products/asg-x9-classic/4.webp"],
      summary: "A full-metal, semi-automatic 4.5 mm steel-BB pistol with hard blowback, a full-size CO₂ magazine and slide hold-open after the final shot.",
      facts: [["Official ref.", "18526"], ["Capacity", "16 steel BBs"], ["Output", "95 m/s · 1.6 J"], ["Weight", "885 g"]],
      overview: [
        "The X9 Classic is built around handling feedback: its full-metal body and hard-blowback slide make each shot mechanically expressive, while the full-size drop-out magazine carries both the 12 g capsule and 16 steel BBs.",
        "ASG specifies a semi-automatic action, manual safety and a slide that locks back when the magazine is empty. It is an X9 Classic design; the familiar service-pistol silhouette does not make this an official Beretta-licensed model."
      ],
      specs: [["Manufacturer reference", "18526"], ["Calibre / projectile", ".177 / 4.5 mm steel BB"], ["Power source", "1 × 12 g CO₂ capsule in magazine"], ["Action", "Semi-automatic with hard blowback"], ["Capacity", "16 rounds"], ["Muzzle velocity", "Up to 95 m/s / 312 FPS"], ["Muzzle energy", "Up to 1.6 J"], ["Construction", "Full metal with textured grip panels"], ["Length", "213 mm"], ["Weight", "885 g"], ["Sights", "Fixed"], ["Features", "Manual safety, unique serial number, last-shot slide hold-open"]],
      highlights: ["Hard-blowback slide action", "Full-size CO₂ magazine", "Slide locks back after last shot", "Full-metal 885 g construction"],
      notice: "Steel BB only: this is not a pellet pistol and must not be loaded with lead diabolo pellets or 6 mm airsoft BBs. CO₂ capsules are not listed as included by ASG.",
      care: ["Use eye protection and a ricochet-resistant BB trap", "Never fire at hard flat surfaces or water", "Remove the CO₂ capsule for storage as the manual directs", "Keep unloaded, on safe and secured away from children"],
      sources: [
        ["ASG official 4.5 mm airgun catalogue — ref. 18526", "https://actionsportgames.com/Files/Files/Mediacenter/Airguns/4.5mm%20Airgun%20Catalogue%202024_web.pdf"],
        ["ASG X9 Classic operating manual", "https://airsoftpro.ro/import/soubory/ASG%20X9%20Classic%204.5mm%20airgun%20manual.pdf"],
        ["Balistas — package and specification cross-check", "https://www.balistas.com/asg-x9-classic-45mm-blow-back"]
      ],
      airgun: true,
      availability: "LimitedAvailability"
    },
    "beretta-84fs": {
      brand: "Umarex · Beretta",
      title: "Beretta Mod. 84 FS CO₂ Air Pistol",
      category: "Air Pistols",
      categoryHref: "air-pistols.html",
      badge: "Licensed replica",
      images: ["img/products/beretta-84fs/1.webp", "img/products/beretta-84fs/2.webp", "img/products/beretta-84fs/3.webp"],
      summary: "A compact, officially licensed Beretta 84 FS replica by Umarex with all-metal construction, realistic blowback and a removable 17-round steel-BB magazine.",
      facts: [["Item", "5.8181"], ["Capacity", "17 steel BBs"], ["Output", "110 m/s · 2.1 J"], ["Weight", "644 g"]],
      overview: [
        "This Umarex 5.8181 configuration recreates the compact proportions of the Beretta 84 FS in a 4.5 mm CO₂ format. The metal slide cycles with each shot, and the all-metal construction gives the 177 mm pistol a substantial 644 g handling weight.",
        "The power source is one standard 12 g CO₂ capsule. A removable 17-round magazine feeds .177 steel BBs, while fixed sights and an ambidextrous safety keep the control layout straightforward for supervised target practice."
      ],
      specs: [["Manufacturer item", "Umarex 5.8181"], ["Calibre / projectile", ".177 / 4.5 mm steel BB"], ["Power source", "1 × 12 g CO₂ capsule"], ["Action", "Semi-automatic; single-action trigger"], ["Capacity", "17 rounds"], ["Muzzle velocity", "Up to 110 m/s / 361 FPS"], ["Muzzle energy", "2.1 J manufacturer rating"], ["Construction", "All metal"], ["Blowback", "Yes"], ["Length", "177 mm"], ["Weight", "644 g"], ["Sights / safety", "Fixed sights; ambidextrous safety"]],
      highlights: ["Officially licensed Beretta replica", "Compact 177 mm overall length", "All-metal body and blowback slide", "Removable 17-round magazine"],
      notice: "Use .177 steel BBs only. Package contents can vary by market; the pistol and magazine are pictured, while CO₂ capsules and BBs should not be assumed included unless confirmed for the dispatched unit.",
      care: ["Read the supplied Umarex manual before first use", "Use eye protection and a steel-BB-rated backstop", "Never point at people, animals, hard surfaces or water", "Store unloaded, secured and without a pierced CO₂ capsule"],
      sources: [
        ["Umarex official Beretta 84 FS manual — 5.8181", "https://www.umarex.com/fileadmin/manuals/5.8181.pdf"],
        ["Umarex official classic catalogue", "https://www.umarex.com/fileadmin/catalogs/ux_classic_catalog_web_en.pdf"],
        ["Umarex USA — Beretta M84 FS product page", "https://www.umarexusa.com/beretta-m84fs-177-steel-bb-c02-blowback"]
      ],
      airgun: true,
      availability: "LimitedAvailability"
    },
    "beretta-m92-a1": {
      brand: "Umarex · Beretta",
      title: "Beretta M92 A1 CO₂ Air Pistol",
      category: "Air Pistols",
      categoryHref: "air-pistols.html",
      badge: "Full-metal blowback",
      images: ["img/products/beretta-m92-a1/1.webp", "img/products/beretta-m92-a1/2.webp", "img/products/beretta-m92-a1/3.webp", "img/products/beretta-m92-a1/4.webp"],
      summary: "The standard Umarex 5.8144 configuration: a full-metal, semi-automatic M92 A1 replica with blowback, an 18-round steel-BB magazine and single-/double-action trigger.",
      facts: [["Item", "5.8144"], ["Capacity", "18 steel BBs"], ["Output", "Up to 95 m/s · <3 J"], ["Weight", "1,061 g"]],
      overview: [
        "At 1,061 g, the M92 A1 is the heaviest Umarex pistol in this group and is designed around a realistic full-metal handling experience. Its CO₂-driven slide cycles during fire, and the single-/double-action trigger supports a familiar first-shot and follow-up rhythm.",
        "The photographed Nishana carton aligns with standard European item 5.8144, which Umarex documents as semi-automatic. Full-auto models 5.8144X and 2253017 are separate variants, so this listing does not claim select-fire capability."
      ],
      specs: [["Verified configuration", "Standard Umarex 5.8144"], ["Calibre / projectile", ".177 / 4.5 mm steel BB"], ["Power source", "1 × 12 g CO₂ capsule"], ["Action", "Semi-automatic blowback; single-/double-action"], ["Capacity", "18 rounds"], ["Muzzle velocity", "Up to 95 m/s; catalogue nominal 90 m/s"], ["Muzzle energy", "Below 3 J; catalogue nominal 1.4 J"], ["Construction", "Full metal"], ["Barrel / overall length", "112 mm / 215 mm"], ["Weight", "1,061 g"], ["Sights", "Fixed"], ["Safety", "Manual safety"]],
      highlights: ["Full-metal 1,061 g construction", "Realistic blowback action", "18-round drop-out magazine", "Standard semi-auto 5.8144 configuration"],
      notice: "Variant check: this page describes standard semi-auto item 5.8144. If the dispatched carton or pistol is marked 5.8144X or 2253017, stop and reconfirm its specifications before sale because those are different full-auto variants.",
      care: ["Use only .177 steel BBs", "Wear eye protection and use a BB-rated backstop", "Keep the muzzle safe and finger off the trigger until ready", "Store unloaded, secured and depressurised as instructed"],
      sources: [
        ["Umarex official M92 A1 manual — 5.8144", "https://www.umarex.com/fileadmin/manuals/5.8144.pdf"],
        ["Umarex official M92 A1 product page — 5.8144", "https://www.umarex.com/products/airguns/co2/5.8144.html"],
        ["Umarex France — separate 5.8144X full-auto variant", "https://www.umarex.fr/armes-a-co2/3427-m92-a1-full-auto.html"]
      ],
      airgun: true,
      availability: "LimitedAvailability"
    },
    "kwc-k18": {
      brand: "KWC",
      title: "KWC K18 CO₂ Blowback BB Pistol",
      category: "Air Pistols",
      categoryHref: "air-pistols.html",
      badge: "Select-fire blowback",
      images: [
        "img/products/kwc-k18/FullSizeRender_5f838eab-803d-45e7-bfcf-87367fd94b79.webp",
        "img/products/kwc-k18/FullSizeRender_6f93477b-9498-4d50-9f38-f9feb1781b65.webp",
        "img/products/kwc-k18/FullSizeRender_71088e58-2d84-4ed7-b2ba-cf813ecdc3f6.webp",
        "img/products/kwc-k18/IMG-1781.webp"
      ],
      summary: "A KWC Model 20-series 4.5 mm CO₂ pistol with a metal slide, full blowback, 18-round magazine, fixed hop-up and selectable semi-automatic or full-automatic fire.",
      facts: [["SKU", "AAKCMF202AZB"], ["Capacity", "18 steel BBs"], ["Output", "96 m/s · 1.6 J"], ["Weight", "755 g"]],
      overview: [
        "The K18 combines a polymer frame with a moving metal slide, keeping total weight to 755 g while retaining full blowback. A trigger safety, fixed hop-up and accessory rail round out the Model 20-series layout.",
        "KWC documents both semi-automatic and full-automatic modes. That capability makes deliberate handling essential: use it only for controlled recreational target shooting on a secure range with a reliable steel-BB backstop."
      ],
      specs: [["Manufacturer SKU", "AAKCMF202AZB"], ["Calibre / projectile", ".177 / 4.5 mm steel BB"], ["Power source", "1 × 12 g CO₂ capsule"], ["Fire modes", "Selectable semi-automatic / full-automatic"], ["Trigger", "Single action with trigger safety"], ["Capacity", "18 rounds"], ["Muzzle velocity", "Up to 96 m/s"], ["Muzzle energy", "Up to 1.6 J"], ["Construction", "Metal slide, polymer frame"], ["Blowback", "Full blowback"], ["Hop-up", "Fixed"], ["Length / weight", "205 mm / 755 g"], ["Accessory interface", "Weaver-style rail"]],
      highlights: ["Selectable semi/full-auto modes", "Metal blowback slide", "Fixed hop-up", "18-round CO₂ magazine"],
      notice: "This is a 4.5 mm steel-BB air pistol, not a 6 mm airsoft gun and not a pellet pistol. Sale and dispatch are subject to stock confirmation, KYC, dealer verification and applicable Indian law for the exact physical SKU.",
      care: ["Adult or directly supervised use only", "Use eye protection and a secure ricochet-resistant backstop", "Never point at people or animals and never display in public", "Keep CO₂ below 50°C; store the pistol unloaded in a locked case"],
      sources: [
        ["KWC official K18 product page", "https://www.kwcgun.com/product/k18-2/"],
        ["KWC official product catalogue", "https://www.kwcgun.com/wp-content/uploads/2022/12/2023DM.pdf"],
        ["KWC Model 20-series operating manual", "https://www.kwcgun.com/img/manuals/AAKCMF201AZB%20%28K08-00788-AA%29.pdf"]
      ],
      airgun: true,
      availability: "LimitedAvailability"
    },
    "kwc-m92": {
      brand: "KWC",
      title: "KWC M92 CO₂ Blowback BB Pistol",
      category: "Air Pistols",
      categoryHref: "air-pistols.html",
      badge: "Full-metal select-fire",
      images: [
        "img/products/kwc-m92/FullSizeRender_b28aaf22-b99f-4a33-8ccb-8990e03e7c92.webp",
        "img/products/kwc-m92/IMG-1767.webp",
        "img/products/kwc-m92/IMG-1769.webp",
        "img/products/kwc-m92/IMG-1771.webp"
      ],
      summary: "A full-metal KWC Model 23-series CO₂ pistol with full blowback, adjustable hop-up, an 18-round magazine and selectable semi-automatic or full-automatic fire.",
      facts: [["SKU", "AAKCMF230AZB"], ["Capacity", "18 steel BBs"], ["Output", "95 m/s · 1.5 J"], ["Weight", "1,077 g"]],
      overview: [
        "The KWC M92 is built for a substantial, mechanically active handling experience. Its 1,077 g full-metal frame and slide cycle under CO₂ blowback, while the double-/single-action trigger and ambidextrous safety/decocker echo the layout of an M92-pattern service pistol.",
        "KWC’s current documentation rates this Model 23-series version at up to 95 m/s and 1.5 J with 4.5 mm steel BBs. A full-size 18-round magazine houses the 12 g CO₂ capsule."
      ],
      specs: [["Manufacturer SKU", "AAKCMF230AZB"], ["Calibre / projectile", ".177 / 4.5 mm steel BB"], ["Power source", "1 × 12 g CO₂ capsule"], ["Fire modes", "Selectable semi-automatic / full-automatic"], ["Trigger", "Double / single action"], ["Capacity", "18 rounds"], ["Muzzle velocity", "Up to 95 m/s"], ["Muzzle energy", "Up to 1.5 J"], ["Construction", "Full metal"], ["Blowback", "Full blowback with slide hold-open"], ["Hop-up", "Adjustable"], ["Safety", "Ambidextrous safety / decocker"], ["Length / weight", "216 mm / 1,077 g"], ["Accessory interface", "Weaver-style rail"]],
      highlights: ["Full-metal 1,077 g build", "Selectable semi/full-auto modes", "Ambidextrous safety/decocker", "Adjustable hop-up and accessory rail"],
      notice: "M92-pattern is a shape description; this listing does not claim Beretta licensing. Sale and dispatch are subject to stock confirmation, KYC, dealer verification and applicable Indian law for the exact physical SKU.",
      care: ["Use .177 steel BBs only", "Wear eye protection and use a safe BB backstop", "Transport unloaded, on safe and inside a locked case", "Do not modify; store CO₂ below 50°C and away from children"],
      sources: [
        ["KWC official M92 product page", "https://www.kwcgun.com/product/92fs-4/"],
        ["KWC official product catalogue", "https://www.kwcgun.com/wp-content/uploads/2022/12/2023DM.pdf"],
        ["Evike — package-content cross-check", "https://www.evike.com/products/22186/KWC-4.5mm-.177-CO2-Blowback-Select-Fire-M92A1-Pistol/?products_id=22186"]
      ],
      airgun: true,
      availability: "LimitedAvailability"
    },
    "co2-cylinders-5": {
      brand: "Camstar",
      title: "12 g CO₂ Cylinders — Pack of 5",
      category: "Accessories",
      categoryHref: "accessories.html",
      badge: "Five-capsule pack",
      images: ["https://camstarsports.com/products/co2-cylinders.jpg"],
      summary: "A five-pack of standard single-use 12 g CO₂ capsules, listed by Camstar for its CO₂ airguns including the Star RX Gen 3.",
      facts: [["Capsule size", "12 g"], ["Pack size", "5 capsules"], ["Format", "Single use"], ["Compatibility", "Manual-dependent"]],
      overview: [
        "These compact steel capsules provide the gas charge used by compatible CO₂ air pistols. Camstar lists them across its own CO₂ range, including the Star RX Gen 3.",
        "For other brands, compatibility depends on the supplied manual explicitly specifying a standard 12 g capsule. Shot count is intentionally not promised because temperature, seals, valve design and shooting pace materially affect yield."
      ],
      specs: [["Contents", "5 × 12 g CO₂ capsules"], ["Use", "Single-use pressurised consumable"], ["Camstar compatibility", "Listed for Camstar CO₂ airguns including RX Gen 3"], ["Other-brand compatibility", "Only where the product manual specifies standard 12 g capsules"], ["Refillable", "No"], ["Storage", "Cool, dry place away from heat and direct sun"]],
      highlights: ["Five standard 12 g capsules", "Camstar RX Gen 3 compatible", "Compact session-ready pack", "No unverified shot-count promise"],
      notice: "Pressurised product: never heat, incinerate, refill or puncture a capsule outside the device. Escaping CO₂ can cause cold burns. Install, vent and remove it only as the airgun manual instructs.",
      care: ["Keep cool, dry and away from direct sunlight", "Do not leave a pierced capsule installed for long-term storage", "Use only lubricant specifically permitted by the airgun manual", "Keep unused capsules away from children"],
      sources: [
        ["Camstar official spare-parts catalogue", "https://camstarsports.com/products?cat=Spare+Parts"],
        ["Umarex — how 12 g CO₂ capsules work", "https://www.umarexusa.com/did-you-know-co2-is-a-liquid"],
        ["Umarex — air-pistol maintenance guidance", "https://www.umarexusa.com/air-pistol-maintenance"]
      ],
      airgun: false,
      availability: "InStock"
    },
    "star-match-pellets": {
      brand: "Star",
      title: "Star Match .177 Diabolo Pellets",
      category: "Accessories",
      categoryHref: "accessories.html",
      badge: "300-count tin",
      images: ["https://camstarsports.com/products/star-match-diabolo.png"],
      summary: "Flat-head .177 / 4.5 mm diabolo pellets for paper-target practice, supplied in a 300-count tin and labelled by the manufacturer at 0.524 g / 8.17 gr.",
      facts: [["Calibre", ".177 / 4.5 mm"], ["Count", "300 pellets"], ["Head", "Flat / wadcutter"], ["Labelled weight", "0.524 g / 8.17 gr"]],
      overview: [
        "The flat wadcutter head is designed to cut a clear circular hole in paper targets, making scores and group shapes easier to read during practice. The diabolo waist is for pellet-firing .177 barrels only.",
        "Camstar’s official tin image prints both 0.524 g and 8.17 gr. Those two figures are not an exact mathematical conversion, so Nishana reproduces them as manufacturer-labelled values rather than silently altering either one."
      ],
      specs: [["Calibre", ".177 / 4.5 mm"], ["Projectile type", "Lead diabolo pellet"], ["Head profile", "Flat / wadcutter"], ["Tin count", "300"], ["Manufacturer-labelled mass", "0.524 g / 8.17 gr"], ["Intended use", "Paper-target practice and training"], ["Compatibility", "Pellet-firing .177 airguns where the manual and magazine accept this shape"]],
      highlights: ["Clean-cutting flat head", "300-count practice tin", "Camstar-listed .177 compatibility", "Suitable for paper-target sessions"],
      notice: "Pellet only: do not use in a steel-BB-only pistol. Check your airgun manual and magazine fit. Handle lead responsibly, wash hands after use and keep pellets away from children.",
      care: ["Keep the tin closed and dry", "Discard deformed pellets", "Never reuse a fired pellet", "Wash hands after handling lead ammunition"],
      sources: [
        ["Camstar official spare-parts catalogue", "https://camstarsports.com/products?cat=Spare+Parts"],
        ["Camstar official Star Match tin image", "https://camstarsports.com/products/star-match-diabolo.png"]
      ],
      airgun: false,
      availability: "InStock"
    },
    "hn-hornet-pellets": {
      brand: "H&N Sport",
      title: "H&N Hornet .177 Pointed Pellets",
      category: "Accessories",
      categoryHref: "accessories.html",
      badge: "Brass-tip pellet",
      images: ["img/products/hn-hornet-pellets/FullSizeRender_301a35f3-1d50-4557-97be-1cbd2492cab8.webp"],
      summary: "A 225-count tin of medium-weight .177 pointed diabolo pellets with an embedded brass tip, weighing 0.620 g / 9.57 gr each.",
      facts: [["Calibre", ".177 / 4.5 mm"], ["Count", "225 pellets"], ["Weight", "0.620 g / 9.57 gr"], ["Minimum energy", "7.5 J stated by H&N"]],
      overview: [
        "The standard H&N Hornet combines a pointed lead body with an embedded brass tip. H&N positions it as a medium-weight pellet for airguns that can supply the required energy and whose loading system accepts its length.",
        "This is the standard Hornet, not the shorter Hornet Pistol variant. Calibre alone does not establish compatibility: power level, chamber and magazine depth all need to match the airgun manual."
      ],
      specs: [["Calibre", ".177 / 4.5 mm"], ["Projectile type", "Pointed lead diabolo with embedded brass tip"], ["Pellet weight", "0.620 g / 9.57 gr"], ["Tin count", "225"], ["Minimum muzzle energy", "5.5 ft-lb / approximately 7.5 J stated by H&N"], ["Maximum recommended distance", "30 m stated by H&N"], ["Ballistic coefficient", "0.016"], ["Compatibility", "Only where manual, power level and magazine depth accept the standard Hornet"]],
      highlights: ["Embedded brass tip", "Medium-weight 0.620 g pellet", "225-count original tin", "Official H&N specification documented"],
      notice: "Not recommended for the Star RX Gen 3: Camstar rates that pistol up to 3 J, while H&N specifies at least about 7.5 J for this standard Hornet. Also verify magazine depth before ordering.",
      care: ["Use only in a suitable .177 pellet airgun", "Keep dry and reject damaged pellets", "Use a safe backstop; never shoot at people or animals", "Wash hands after handling lead and keep away from children"],
      sources: [
        ["H&N official Hornet .177 product page", "https://www.hn-sport.de/en/air-gun-hunting/hornet-177"],
        ["H&N official shorter Hornet Pistol comparison", "https://www.hn-sport.de/en/air-gun-hunting/hornet-pistol-177"],
        ["H&N company and manufacturing information", "https://www.hn-sport.de/en/about-hn"]
      ],
      airgun: false,
      availability: "LimitedAvailability"
    },
    "rx-gen3-magazine": {
      brand: "Camstar",
      title: "Star RX Gen 3 CO₂ Magazine Assembly",
      category: "Spare Parts",
      categoryHref: "spare-parts.html",
      badge: "Genuine replacement",
      images: ["https://camstarsports.com/rx-gen3-co2-magazine.jpeg"],
      summary: "A genuine full-length replacement CO₂ magazine assembly made specifically for the Camstar Star RX Gen 3 air pistol.",
      facts: [["Product type", "CO₂ magazine assembly"], ["Compatibility", "RX Gen 3 only"], ["Quantity", "1 assembly"], ["Brand", "Camstar"]],
      overview: [
        "This is the long removable assembly that houses the RX Gen 3 CO₂ system. It is not being sold or described as one of the loose 8-shot rotary pellet inserts supplied with the pistol.",
        "Camstar lists it specifically for the Star RX Gen 3. Compatibility with earlier Star pistols, other generations or other brands is not claimed, so confirm the model marking before checkout."
      ],
      specs: [["Part", "Full-length CO₂ magazine assembly"], ["Compatibility", "Camstar Star RX Gen 3 only"], ["Listing quantity", "1 assembly; confirm sealed package before dispatch"], ["Not stated as included", "CO₂ capsule, loose rotary inserts, Allen key or pistol"], ["Installation", "Follow the RX Gen 3 manual; do not force or dismantle"]],
      highlights: ["Genuine Camstar replacement", "RX Gen 3-specific fit", "Complete CO₂-holding assembly", "Direct replacement format"],
      notice: "Compatibility check required: confirm that your pistol is the Star RX Gen 3 before ordering. The official listing does not say that loose rotary inserts, a CO₂ capsule or tools are included.",
      care: ["Unload and depressurise the pistol before removal", "Keep seals and mating surfaces clean", "Do not force, modify or disassemble the assembly", "Store clean, dry and away from heat"],
      sources: [
        ["Camstar official RX Gen 3 CO₂ magazine page", "https://camstarsports.com/product/rx-gen3-co2-magazine"],
        ["Camstar official RX Gen 3 product page", "https://camstarsports.com/product/star-rx-gen3"]
      ],
      airgun: false,
      availability: "InStock"
    }
  };

  const root = document.querySelector("[data-product-detail]");
  if (!root) return;
  const id = root.dataset.productDetail;
  const d = DETAILS[id];
  const product = (window.NISHANA_PRODUCTS || []).find(item => item.id === id);
  if (!d || !product) {
    root.innerHTML = '<section class="n-soon"><h2>Product details unavailable</h2><p>Please return to the catalogue or talk to our team.</p><a class="n-btn" href="products.html">View products</a></section>';
    return;
  }

  const inr = window.nishanaInr || (n => "₹" + Number(n).toLocaleString("en-IN"));
  const wa = window.nishanaWa || (text => `https://wa.me/918329618409?text=${encodeURIComponent(text)}`);
  const savePct = product.mrp && product.mrp > product.price ? Math.round((product.mrp - product.price) * 100 / product.mrp) : 0;
  const safe = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2Zm4.4 12c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.3 5.3 0 0 0 1.1 2.7 12 12 0 0 0 4.6 4c2.1.9 2.1.6 2.5.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>';
  const kycNote = d.airgun
    ? "Buy now adds this item to your cart. Air-weapon dispatch is completed only after stock, buyer identity, residence details and applicable dealer requirements are verified."
    : "Buy now adds this item to your cart. Stock and compatibility can also be checked with our team before checkout.";

  root.innerHTML = `
    <nav class="n-crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>›</span><a href="products.html">Products</a><span>›</span><a href="${safe(d.categoryHref)}">${safe(d.category)}</a><span>›</span>${safe(d.title)}</nav>
    <div class="pdp">
      <section class="pdp-hero" aria-labelledby="product-title">
        <div class="pdp-media">
          <div class="pdp-stage"><span class="pdp-badge">${safe(d.badge)}</span><img id="pdpMain" src="${safe(d.images[0])}" alt="${safe(d.title)} product view" referrerpolicy="no-referrer"></div>
          <div class="pdp-thumbs" id="pdpThumbs" aria-label="Product photos"></div>
        </div>
        <div class="pdp-info">
          <div class="pdp-kicker">${safe(d.brand)} · Verified product dossier</div>
          <h1 id="product-title">${safe(d.title)}</h1>
          <p class="pdp-subtitle">${safe(d.summary)}</p>
          <div class="pdp-price-row"><span class="pdp-price">${inr(product.price)}</span>${product.mrp ? `<span class="pdp-mrp">${inr(product.mrp)}</span>` : ""}${savePct ? `<span class="pdp-saving">Save ${savePct}%</span>` : ""}</div>
          <div class="pdp-actions">
            <button class="pdp-action buy" data-add-to-cart="${safe(id)}">Buy now ${arrow}</button>
            <a class="pdp-action talk" href="${wa(`Hi Nishana! I'd like to talk to you about the ${d.title} (${inr(product.price)}). Please confirm live stock, exact configuration and order requirements.`)}" target="_blank" rel="noopener">${waIcon} Talk to us</a>
            <div class="pdp-reply"><i aria-hidden="true"></i> Usually replies within 2 mins</div>
          </div>
          <p class="pdp-commerce-note">${safe(kycNote)}</p>
          <div class="pdp-facts">${d.facts.map(([k,v]) => `<div class="pdp-fact"><small>${safe(k)}</small><b>${safe(v)}</b></div>`).join("")}</div>
        </div>
      </section>

      <div class="pdp-body">
        <section class="pdp-section"><div class="pdp-section-label"><span class="pdp-index">01 / OVERVIEW</span><h2>Why this product</h2></div><div class="pdp-copy">${d.overview.map(p => `<p>${safe(p)}</p>`).join("")}</div></section>
        <section class="pdp-section"><div class="pdp-section-label"><span class="pdp-index">02 / DATA</span><h2>Specifications</h2></div><div class="pdp-copy"><dl class="pdp-specs">${d.specs.map(([k,v]) => `<div class="pdp-spec"><dt>${safe(k)}</dt><dd>${safe(v)}</dd></div>`).join("")}</dl></div></section>
        <section class="pdp-section"><div class="pdp-section-label"><span class="pdp-index">03 / FIT</span><h2>What stands out</h2></div><div class="pdp-copy"><ul class="pdp-list">${d.highlights.map(item => `<li>${safe(item)}</li>`).join("")}</ul><div class="pdp-notice" style="margin-top:16px"><strong>Before ordering:</strong> ${safe(d.notice)}</div></div></section>
        <section class="pdp-section"><div class="pdp-section-label"><span class="pdp-index">04 / CARE</span><h2>Use it responsibly</h2></div><div class="pdp-copy"><ul class="pdp-list">${d.care.map(item => `<li>${safe(item)}</li>`).join("")}</ul></div></section>
        <section class="pdp-section"><div class="pdp-section-label"><span class="pdp-index">05 / SOURCES</span><h2>How we checked it</h2></div><div class="pdp-copy"><p>Specifications were checked against manufacturer material where available, then compared with Nishana’s inventory photographs and clearly identified retailer documentation. Your supplied manual and physical product markings take precedence if a production batch differs.</p><ul class="pdp-sources">${d.sources.map(([label,url]) => `<li><a href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(label)}</a></li>`).join("")}</ul><span class="pdp-updated">Product research reviewed 21 July 2026</span></div></section>
      </div>

      <section class="pdp-related" aria-labelledby="related-title"><div class="pdp-related-head"><h2 id="related-title">You may also like</h2><a href="products.html">View all products →</a></div><div class="n-grid" id="pdpRelated"></div></section>
    </div>`;

  const main = document.getElementById("pdpMain");
  const thumbs = document.getElementById("pdpThumbs");
  d.images.forEach((src, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pdp-thumb";
    button.setAttribute("aria-label", `Show product photo ${index + 1}`);
    button.setAttribute("aria-current", index === 0 ? "true" : "false");
    button.innerHTML = `<img src="${safe(src)}" alt="" referrerpolicy="no-referrer" loading="lazy">`;
    button.addEventListener("click", () => {
      main.src = src;
      main.alt = `${d.title} product view ${index + 1}`;
      thumbs.querySelectorAll(".pdp-thumb").forEach(item => item.setAttribute("aria-current", item === button ? "true" : "false"));
    });
    button.querySelector("img").addEventListener("error", () => button.remove());
    thumbs.appendChild(button);
  });
  if (d.images.length < 2) thumbs.hidden = true;

  const related = (window.NISHANA_PRODUCTS || [])
    .filter(item => item.id !== id)
    .sort((a,b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0,3);
  document.getElementById("pdpRelated").innerHTML = related.map(window.nishanaProductCard).join("");

  const canonical = document.querySelector('link[rel="canonical"]')?.href || location.href;
  const absoluteImages = d.images.map(src => new URL(src, location.href).href);
  const structured = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: d.title,
    image: absoluteImages,
    description: d.summary,
    brand: {"@type":"Brand", name: d.brand},
    sku: id,
    category: d.category,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      price: product.price,
      availability: `https://schema.org/${d.availability}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: {"@type":"Organization", name:"Nishana Airguns"}
    }
  };
  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.textContent = JSON.stringify(structured).replace(/</g,"\\u003c");
  document.head.appendChild(schema);
})();
