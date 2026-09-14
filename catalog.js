(function () {
  const path = decodeURIComponent(String(window.location.pathname || "").replace(/\\/g, "/"));
  const siteBase = /\/products\/[^/]+/i.test(path) ? "../../" : "./";
  const asset = (name) => `${siteBase}assets/${name}`;
  const productUrl = (slug) => `${siteBase}products/${slug}/index.html`;
  const homeUrl = (hash = "") => `${siteBase}index.html${hash}`;

  window.DAPOR_PATHS = { base: siteBase, asset, productUrl, homeUrl };

  const BLACK = asset("dapor-black-tracksuit.webp");
  const IVORY = asset("dapor-ivory-tracksuit.webp");
  const CAMPAIGN = asset("dapor-hero-campaign.webp");

  const imageSet = (primary, tone) => [
    { src: primary, alt: `${tone} full look`, position: "center top", zoom: 1 },
    { src: primary, alt: `${tone} crest and upper-body detail`, position: "center 18%", zoom: 1.42 },
    { src: primary, alt: `${tone} trouser and fabric detail`, position: "center 78%", zoom: 1.36 },
    { src: CAMPAIGN, alt: "DA’POR collection styling", position: "center center", zoom: 1 },
  ];

  const color = (name, value, image) => ({ name, value, image });
  const blackColors = [
    color("Onyx Black", "#111111", BLACK),
    color("Ivory", "#e8e0cf", IVORY),
  ];
  const ivoryColors = [
    color("Heritage Ivory", "#e8e0cf", IVORY),
    color("Onyx Black", "#111111", BLACK),
  ];

  const reviewPair = (title, tone) => [
    {
      name: "Marcus T.",
      rating: 5,
      date: "Verified purchase",
      text: `The ${tone} finish on the ${title} looks even better in person. The weight feels premium and the crest detail is exceptionally clean.`,
    },
    {
      name: "Aaliyah R.",
      rating: 5,
      date: "Verified purchase",
      text: "The fit is polished without feeling restrictive. It arrived beautifully packed and holds its shape after wearing it all day.",
    },
  ];

  const defaults = {
    edition: "DA’POR Edition 01",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: "In stock — ready to ship",
    shipping:
      "Complimentary U.S. shipping on orders $150+. Orders are prepared within 1–2 business days. Unworn pieces may be returned within 30 days in their original condition.",
    care: "Machine wash cold with like colors. Wash inside out. Do not bleach. Tumble dry low or air dry to preserve embroidery.",
  };

  const shot = (src, alt, position = "center center", zoom = 1, fit) => ({
    src,
    alt,
    position,
    zoom,
    ...(fit ? { fit } : {}),
  });

  const mockupViews = (src, name) => [
    shot(src, `${name} full look`, "center center", 1),
    shot(src, `${name} hoodie front`, "22% 18%", 2.08, "cover"),
    shot(src, `${name} hoodie back`, "78% 18%", 2.08, "cover"),
    shot(src, `${name} shorts`, "22% 82%", 2.08, "cover"),
  ];

  const HOODIE_FRONT = asset("dapor-district-hoodie-front.jpg");
  const HOODIE_BACK = asset("dapor-district-hoodie-back.jpg");
  const HOODIE_FRONT_MODEL = asset("dapor-district-hoodie-front-on-model.png");
  const HOODIE_BACK_MODEL = asset("dapor-district-hoodie-back-on-model.png");
  const SHORTS_FRONT = asset("dapor-district-shorts-front.jpg");
  const SHORTS_FRONT_MODEL = asset("dapor-district-shorts-front-on-model.png");
  const SHORTS_BACK = asset("dapor-district-shorts-back.jpg");
  const SHORTS_DETAIL = asset("dapor-district-shorts-detail.jpg");
  const SET_LOOK = asset("dapor-district-set-look.jpg");
  const SET_DETAIL = asset("dapor-district-set-detail.jpg");
  const SET_CAMPAIGN = asset("dapor-district-set-campaign.jpg");
  const ONYX_GOLD = asset("dapor-onyx-gold-set.jpg");
  const ONYX_SCARLET = asset("dapor-onyx-scarlet-set.jpg");

  const heather = (image) => [color("Athletic Heather", "#d4cfc4", image)];
  const goldSet = [color("Onyx Gold", "#0d7a7a", ONYX_GOLD)];
  const scarletSet = [color("Onyx Scarlet", "#b91c1c", ONYX_SCARLET)];

  const makeProduct = (data) => {
    const primary = data.img || (data.tone === "ivory" ? IVORY : BLACK);
    const colors = data.colors || (data.tone === "ivory" ? ivoryColors : blackColors);
    return {
      ...defaults,
      ...data,
      img: primary,
      images: data.images || imageSet(primary, data.tone === "ivory" ? "Ivory" : "Onyx"),
      colors,
      reviews: data.reviews || reviewPair(data.title, data.tone === "ivory" ? "ivory" : "black"),
      url: productUrl(data.slug),
    };
  };

  const products = [
    makeProduct({
      id: 1,
      slug: "black-legacy-tracksuit",
      title: "Black Legacy Tracksuit",
      desc: "Zip hoodie · Crest trouser",
      price: 168,
      category: "Tracksuits",
      cat: "black sets",
      badge: "Limited",
      tone: "black",
      description:
        "A coordinated black uniform built around clean structure and signature gold crest embroidery. The zip hoodie and tapered trouser are balanced for everyday movement with a refined, after-dark finish.",
      material: "420gsm cotton-rich brushed fleece with reinforced rib trims, smooth metal zip hardware and high-density crest embroidery.",
      fit: "Regular tailored fit. The hoodie sits clean through the shoulders; trousers taper from the knee. Choose your usual size or size up for a relaxed streetwear fit.",
      info: ["Two-piece hoodie and trouser set", "Embroidered chest and thigh crests", "Drawcord waist", "Side-entry pockets"],
      related: [3, 5, 7, 13],
    }),
    makeProduct({
      id: 2,
      slug: "ivory-heritage-tracksuit",
      title: "Ivory Heritage Tracksuit",
      desc: "Bomber · Hoodie · Relaxed trouser",
      price: 178,
      category: "Tracksuits",
      cat: "ivory sets",
      badge: "New",
      tone: "ivory",
      sizes: ["XS", "S", "M", "L", "XL"],
      description:
        "A tonal ivory tracksuit with warm beige undertones and restrained gold branding. Designed as a complete look, it layers easily while keeping a sharp, monochrome silhouette.",
      material: "Premium cotton-blend fleece with a soft brushed interior, ribbed cuffs and durable gold-tone hardware.",
      fit: "Relaxed through the body with a softly tapered trouser. Choose your regular size for the intended fit.",
      info: ["Two-piece hoodie and trouser set", "Gold embroidered crests", "Elasticated drawcord waist", "Soft brushed interior"],
      related: [4, 6, 8, 12],
    }),
    makeProduct({
      id: 3,
      slug: "onyx-crest-hoodie",
      title: "Onyx Crest Hoodie",
      desc: "Premium heavyweight cotton",
      price: 98,
      category: "Hoodies",
      cat: "black",
      badge: "Bestseller",
      tone: "black",
      description:
        "A substantial pullover hoodie finished with the DA’POR eagle crest at the chest. Minimal from a distance, richly detailed up close.",
      material: "460gsm heavyweight cotton fleece with a double-layer hood and high-density embroidery.",
      fit: "Structured regular fit with dropped shoulders. Size up once for an oversized silhouette.",
      info: ["Double-layer hood", "Kangaroo pocket", "Embroidered crest", "Ribbed cuff and hem"],
      related: [1, 5, 7, 9],
    }),
    makeProduct({
      id: 4,
      slug: "ivory-signature-hoodie",
      title: "Ivory Signature Hoodie",
      desc: "Warm beige · Gold crest",
      price: 108,
      category: "Hoodies",
      cat: "ivory",
      tone: "ivory",
      sizes: ["XS", "S", "M", "L", "XL"],
      description:
        "The signature hoodie in a warm ivory shade, designed to pair seamlessly with every piece in the Heritage collection.",
      material: "450gsm cotton-rich fleece, brushed for softness and finished with tonal stitching and gold crest embroidery.",
      fit: "Relaxed unisex fit. Choose your usual size for an easy silhouette or size down for a closer fit.",
      info: ["Double-layer hood", "Gold embroidered crest", "Tonal drawcords", "Kangaroo pocket"],
      related: [2, 6, 8, 10],
    }),
    makeProduct({
      id: 5,
      slug: "founders-crest-trousers",
      title: "Founders Crest Trousers",
      desc: "Tapered fit · Embroidered thigh",
      price: 88,
      category: "Trousers",
      cat: "black sets",
      badge: "Bestseller",
      tone: "black",
      description:
        "A clean tapered trouser with a comfortable rise and the house crest placed at the thigh. Built to complete the black uniform or stand alone.",
      material: "400gsm cotton-blend fleece with a soft loopback interior and embroidered gold crest.",
      fit: "Regular rise with room through the seat and a tapered ankle. Use your usual waist size.",
      info: ["Elasticated drawcord waist", "Tapered ankle", "Two side pockets", "Embroidered thigh crest"],
      related: [1, 3, 7, 11],
    }),
    makeProduct({
      id: 6,
      slug: "heritage-bomber-set",
      title: "Heritage Bomber Set",
      desc: "Layered bomber · Hoodie · Trouser",
      price: 198,
      category: "Matching Sets",
      cat: "ivory sets accessories",
      badge: "New",
      tone: "ivory",
      sizes: ["XS", "S", "M", "L", "XL"],
      description:
        "The complete Heritage look pairs a lightweight bomber layer with a soft hoodie and coordinated trouser for a refined tonal statement.",
      material: "Cotton-rich fleece base layers with a smooth twill bomber shell, rib trims and embroidered crest details.",
      fit: "Relaxed coordinated fit. The bomber is cut slightly boxy while the trouser tapers gently at the ankle.",
      info: ["Three-piece coordinated set", "Lightweight bomber layer", "Gold-tone zip hardware", "Embroidered house crests"],
      related: [2, 4, 8, 12],
    }),
    makeProduct({
      id: 7,
      slug: "legacy-crest-zip-jacket",
      title: "Legacy Crest Zip Jacket",
      desc: "Structured zip layer · Gold hardware",
      price: 128,
      category: "Jackets",
      cat: "black",
      tone: "black",
      description:
        "A versatile black zip jacket cut with the structure of a bomber and the comfort of premium fleece. Gold hardware and crest embroidery complete the house signature.",
      material: "Dense cotton interlock with satin lining at the hood, premium zip hardware and ribbed trims.",
      fit: "Regular jacket fit with a clean shoulder and fitted hem. Size up to layer over a heavyweight hoodie.",
      info: ["Full zip closure", "Internal chest pocket", "Embroidered crest", "Ribbed collar, cuff and hem"],
      related: [1, 3, 5, 11],
    }),
    makeProduct({
      id: 8,
      slug: "signature-relaxed-trousers",
      title: "Signature Relaxed Trousers",
      desc: "Warm ivory · Relaxed taper",
      price: 92,
      category: "Trousers",
      cat: "ivory sets",
      tone: "ivory",
      sizes: ["XS", "S", "M", "L", "XL"],
      description:
        "Warm ivory trousers with a softly relaxed line and precise crest placement. Designed for travel, weekends and elevated everyday dressing.",
      material: "400gsm brushed cotton fleece with ribbed cuffs, tonal drawcord and gold embroidery.",
      fit: "Relaxed through the thigh with a tapered ankle. Choose your usual size.",
      info: ["Elasticated waistband", "Deep side pockets", "Ribbed cuffs", "Embroidered thigh crest"],
      related: [2, 4, 6, 12],
    }),
    makeProduct({
      id: 9,
      slug: "founders-heavyweight-tee",
      title: "Founders Heavyweight Tee",
      desc: "Oversized cotton · Chest crest",
      price: 68,
      category: "Tees",
      cat: "black",
      tone: "black",
      description:
        "A substantial black tee with a refined oversized shape and a compact embroidered crest. A foundation piece for the DA’POR uniform.",
      material: "280gsm combed cotton jersey with a durable rib neckline and soft garment wash.",
      fit: "Oversized unisex fit with dropped shoulders. Size down for a regular fit.",
      info: ["Heavyweight jersey", "Dropped shoulder", "Embroidered chest crest", "Pre-shrunk finish"],
      related: [3, 5, 10, 13],
    }),
    makeProduct({
      id: 10,
      slug: "eagle-crest-tee",
      title: "Eagle Crest Tee",
      desc: "Ivory jersey · Gold emblem",
      price: 72,
      category: "Tees",
      cat: "ivory",
      tone: "ivory",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      description:
        "A warm ivory heavyweight tee centered on the DA’POR eagle emblem. Clean enough to layer, strong enough to wear alone.",
      material: "280gsm premium combed cotton with gold embroidery and a soft garment-washed hand feel.",
      fit: "Relaxed unisex fit. Choose your usual size for an easy shape.",
      info: ["Heavyweight cotton", "Gold embroidered emblem", "Reinforced neckline", "Pre-shrunk finish"],
      related: [4, 8, 9, 12],
    }),
    makeProduct({
      id: 11,
      slug: "onyx-heritage-bomber",
      title: "Onyx Heritage Bomber",
      desc: "Satin-touch shell · Crest lining",
      price: 138,
      category: "Jackets",
      cat: "black accessories",
      badge: "Limited",
      tone: "black",
      description:
        "A clean bomber silhouette in deep onyx, finished with subtle gold details and a smooth lining designed for effortless layering.",
      material: "Matte satin-touch twill shell with lightweight quilted lining, rib trims and metal zip hardware.",
      fit: "Classic bomber fit with a slightly cropped hem. Size up if layering over heavyweight fleece.",
      info: ["Quilted lining", "Two-way metal zip", "Internal pocket", "Embroidered chest crest"],
      related: [1, 5, 7, 13],
    }),
    makeProduct({
      id: 12,
      slug: "ivory-crest-joggers",
      title: "Ivory Crest Joggers",
      desc: "Soft fleece · Gold thigh crest",
      price: 88,
      category: "Trousers",
      cat: "ivory sets",
      tone: "ivory",
      sizes: ["XS", "S", "M", "L", "XL"],
      description:
        "A softer take on the house trouser, finished in warm ivory with a comfortable cuffed ankle and signature embroidered crest.",
      material: "390gsm brushed cotton-blend fleece with tonal rib cuffs and high-density embroidery.",
      fit: "Relaxed through the seat and thigh with a softly cuffed ankle. Choose your regular size.",
      info: ["Drawcord waist", "Cuffed ankle", "Two side pockets", "Embroidered thigh crest"],
      related: [2, 4, 6, 8],
    }),
    makeProduct({
      id: 13,
      slug: "millionaires-founders-set",
      title: "Millionaires Founders Set",
      desc: "Statement hoodie · Coordinated trouser",
      price: 188,
      category: "Matching Sets",
      cat: "black ivory sets",
      badge: "Exclusive",
      tone: "black",
      description:
        "The definitive two-piece DA’POR uniform. A statement hoodie and coordinated trouser bring the full eagle crest language into one limited set.",
      material: "460gsm heavyweight cotton fleece with brushed interior, premium trims and multi-density gold embroidery.",
      fit: "Relaxed statement fit. Choose your regular size or size down for a closer silhouette.",
      info: ["Two-piece coordinated set", "Multi-density crest embroidery", "Double-layer hood", "Numbered edition label"],
      related: [1, 3, 6, 11],
    }),
    makeProduct({
      id: 14,
      slug: "district-26-zip-hoodie",
      title: "District 26 Zip Hoodie",
      desc: "Heather zip · American Legacy",
      price: 118,
      category: "Hoodies",
      cat: "ivory",
      badge: "New",
      tone: "ivory",
      photo: "hoodie",
      edition: "District 26",
      img: HOODIE_FRONT_MODEL,
      images: [
        shot(HOODIE_FRONT_MODEL, "District 26 zip hoodie on model", "center 18%", 1.05, "cover"),
        shot(HOODIE_BACK_MODEL, "District 26 zip hoodie back on model", "center 18%", 1.05, "cover"),
        shot(HOODIE_FRONT, "District 26 zip hoodie front detail", "center center", 1),
        shot(HOODIE_BACK, "District 26 zip hoodie back crest detail", "center center", 1),
      ],
      colors: heather(HOODIE_FRONT_MODEL),
      description:
        "A cropped zip hoodie in athletic heather, built around the District 26 varsity language. Front lockup, rear eagle crest, and the 26 sleeve mark make it the signature layer of the new drop.",
      material: "Heavyweight cotton-blend fleece with a washed heather face, contrast navy waistband, metal zip hardware and distressed athletic prints.",
      fit: "Cropped zip fit with a clean shoulder and ribbed hem. Choose your usual size, or size up to layer over a tee.",
      info: ["Full zip closure", "Rear eagle crest print", "Athletic 26 sleeve mark", "Kangaroo pocket"],
      related: [15, 16, 17, 4],
    }),
    makeProduct({
      id: 15,
      slug: "district-26-shorts",
      title: "District 26 Shorts",
      desc: "Heather fleece · Crest 26",
      price: 78,
      category: "Shorts",
      cat: "ivory accessories",
      badge: "New",
      tone: "ivory",
      photo: "shorts",
      edition: "District 26",
      img: SHORTS_FRONT_MODEL,
      images: [
        shot(SHORTS_FRONT_MODEL, "District 26 shorts on model", "center 58%", 1.08, "cover"),
        shot(HOODIE_BACK_MODEL, "District 26 set back on model", "center 62%", 1.08, "cover"),
        shot(SHORTS_FRONT, "District 26 shorts front print detail", "center center", 1),
        shot(SHORTS_BACK, "District 26 shorts back crest detail", "center center", 1),
      ],
      colors: heather(SHORTS_FRONT_MODEL),
      description:
        "Fleece shorts cut for movement, with the District crest and 26 mark across the leg and a clean back-print eagle. Navy inner waistband and white drawcords finish the athletic uniform.",
      material: "Washed cotton-blend fleece with a contrast navy waistband, white drawcords, back patch pocket and distressed District prints.",
      fit: "Relaxed athletic short with a comfortable rise. Use your usual size.",
      info: ["Elasticated drawcord waist", "Back patch pocket", "District crest and 26 print", "Navy contrast waistband"],
      related: [14, 16, 18, 8],
    }),
    makeProduct({
      id: 16,
      slug: "district-26-set",
      title: "District 26 Set",
      desc: "Zip hoodie · Matching shorts",
      price: 178,
      category: "Matching Sets",
      cat: "ivory sets",
      badge: "New",
      tone: "ivory",
      photo: "hoodie",
      edition: "District 26",
      img: HOODIE_FRONT_MODEL,
      images: [
        shot(HOODIE_FRONT_MODEL, "District 26 set on model", "center 22%", 1.04, "cover"),
        shot(HOODIE_BACK_MODEL, "District 26 set back on model", "center 18%", 1.04, "cover"),
        shot(SHORTS_FRONT_MODEL, "District 26 shorts on model", "center 58%", 1.06, "cover"),
        shot(SET_LOOK, "District 26 campaign look", "center 28%", 1.08, "cover"),
      ],
      colors: heather(HOODIE_FRONT_MODEL),
      description:
        "The complete Athletic Heather uniform: cropped zip hoodie and matching District shorts, photographed as a full set. Varsity lockup, eagle crest and 26 marks run through both pieces.",
      material: "Coordinated heavyweight cotton-blend fleece with washed heather face, contrast navy trims, metal zip hardware and distressed athletic prints.",
      fit: "Cropped hoodie with relaxed athletic shorts. Choose your usual size for both pieces.",
      info: ["Two-piece zip hoodie and shorts set", "Matching District 26 graphics", "Contrast navy trims", "White drawcords"],
      related: [14, 15, 17, 18],
    }),
    makeProduct({
      id: 17,
      slug: "onyx-gold-district-set",
      title: "Onyx Gold District Set",
      desc: "Black hoodie · Teal and gold shorts",
      price: 188,
      category: "Matching Sets",
      cat: "black sets",
      badge: "New",
      tone: "black",
      photo: "pack",
      edition: "District 26",
      img: ONYX_GOLD,
      images: mockupViews(ONYX_GOLD, "Onyx Gold District set"),
      colors: goldSet,
      description:
        "The District uniform in onyx, finished with gold lockup type and teal lining. Zip hoodie and shorts share the eagle crest, 26 marks and Millionaires District banner.",
      material: "Heavyweight cotton fleece with teal contrast lining, gold and teal athletic prints, drawcord shorts and metal zip hardware.",
      fit: "Relaxed coordinated set. Choose your usual size, or size up for an easier streetwear silhouette.",
      info: ["Two-piece hoodie and shorts set", "Gold and teal District graphics", "Contrast teal lining", "Rear eagle crest"],
      related: [18, 16, 1, 13],
    }),
    makeProduct({
      id: 18,
      slug: "onyx-scarlet-district-set",
      title: "Onyx Scarlet District Set",
      desc: "Black hoodie · Scarlet and white shorts",
      price: 188,
      category: "Matching Sets",
      cat: "black sets",
      badge: "New",
      tone: "black",
      photo: "pack",
      edition: "District 26",
      img: ONYX_SCARLET,
      images: mockupViews(ONYX_SCARLET, "Onyx Scarlet District set"),
      colors: scarletSet,
      description:
        "Onyx fleece with scarlet varsity type, white sleeve stripes and a red-lined hood. The matching shorts carry the 26 mark, crest language and contrast side stripe.",
      material: "Heavyweight cotton fleece with scarlet contrast lining, red and white athletic prints, drawcord shorts and metal zip hardware.",
      fit: "Relaxed coordinated set. Choose your usual size, or size up for an easier streetwear silhouette.",
      info: ["Two-piece hoodie and shorts set", "Scarlet District graphics", "Contrast red lining", "White side stripe"],
      related: [17, 16, 1, 13],
    }),
  ];

  window.DAPOR_PRODUCTS = products;
})();
