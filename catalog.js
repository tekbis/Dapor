(function () {
  const catalogBase = (() => {
    try {
      const script = document.currentScript;
      return new URL(".", script && script.src ? script.src : location.href);
    } catch {
      return null;
    }
  })();
  const fromProductPage = /\/products\//i.test(decodeURIComponent(String(location.pathname || "").replace(/\\/g, "/")));
  const asset = (name) => {
    if (catalogBase) return new URL(`assets/${name}`, catalogBase).href;
    return `${fromProductPage ? "../../assets/" : "assets/"}${name}`;
  };
  const productHref = (slug) => {
    const filePage = location.protocol === "file:";
    if (catalogBase) return new URL(`products/${slug}/${filePage ? "index.html" : ""}`, catalogBase).href;
    if (fromProductPage) return filePage ? `../${slug}/index.html` : `../${slug}/`;
    return filePage ? `products/${slug}/index.html` : `products/${slug}/`;
  };
  window.DAPOR_asset = asset;
  window.DAPOR_home = catalogBase
    ? new URL(location.protocol === "file:" ? "index.html" : "./", catalogBase).href
    : (fromProductPage ? "../../index.html" : "index.html");
  const GREY_MODEL = asset("district-grey-editorial.png");
  const GREY_REAR = asset("district-grey-rear-editorial.png");
  const RED_MODEL = asset("district-red-editorial.png");
  const RED_REAR = asset("district-red-rear-editorial.png");
  const TEAL_MODEL = asset("district-teal-solo-editorial.png");
  const TEAL_REAR = asset("district-teal-editorial.png");
  const GREY_HOODIE_FRONT = asset("district-grey-hoodie-front.jpg");
  const GREY_HOODIE_BACK = asset("district-grey-hoodie-back.jpg");
  const GREY_SHOTS_FRONT = asset("district-grey-shorts-front.jpg");
  const GREY_SHOTS_BACK = asset("district-grey-shorts-back.jpg");
  const RED_ART = asset("district-red-hoodie-shorts-artwork.jpg");
  const TEAL_ART = asset("district-teal-hoodie-shorts-artwork.jpg");

  const frame = (src, alt) => ({ src, alt, position: "center center", zoom: 1 });
  const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  const common = {
    edition: "DA’POR District · 2026",
    sizes,
    price: 120,
    reviews: [],
    material: "Fabric composition and garment-care instructions have not yet been confirmed by DA’POR.",
    care: "Please follow the care label on the finished garment once confirmed.",
    comingSoon: true,
    stock: "Coming soon",
    shipping: "Complimentary U.S. shipping on orders $150+. Orders are prepared within 1–2 business days. Unworn pieces may be returned within 30 days in their original condition.",
  };

  const product = (details) => ({
    ...common,
    ...details,
    url: productHref(details.slug),
  });

  const products = [
    product({
      id: 101,
      slug: "district-heather-grey-zip-hoodie",
      title: "District Heather Grey Zip Hoodie",
      desc: "Navy and red typography · zip-front layer",
      category: "Zip hoodies",
      cat: "hoodies grey",
      badge: "New artwork",
      img: GREY_MODEL,
      images: [
        frame(GREY_MODEL, "Full-length styled model wearing the heather-grey DA’POR hoodie and matching shorts"),
        frame(GREY_REAR, "Styled model showing the heather-grey hoodie crest and matching shorts from behind"),
      ],
      artwork: [frame(GREY_HOODIE_FRONT, "Supplied front artwork for heather-grey zip hoodie"), frame(GREY_HOODIE_BACK, "Supplied back artwork for heather-grey zip hoodie")],
      colors: [{ name: "Heather Grey / Navy / Red", value: "#c9c9c9", image: GREY_HOODIE_FRONT }],
      description: "A heather-grey zip hoodie featuring DA’POR Millionaires District graphics in navy and red. A large wordmark spans the front, the back carries an eagle crest, and striped sleeves and the 26 artwork finish the look. Styled images show the hoodie with matching shorts, sold separately; original artwork is available in Design references.",
      fit: "Consult the supplied preliminary DA’POR master size chart for S–5XL. The chart lists hoodie chest widths from 22 to 34 inches and hoodie lengths from 27 to 34 inches. Chest width is measured flat; double it for approximate garment circumference. The chart is a starting specification pending finished-sample approval.",
      info: ["Heather-grey zip hoodie", "DA’POR Millionaires District front lettering", "Large eagle-crest back print", "Navy and red sleeve stripes", "S–5XL size guide available on the product page"],
      related: [102, 103, 105],
    }),
    product({
      id: 102,
      slug: "district-heather-grey-graphic-shorts",
      title: "District Heather Grey Graphic Shorts",
      desc: "Matching 26 artwork · drawcord waist",
      category: "Graphic shorts",
      cat: "shorts grey",
      img: GREY_MODEL,
      images: [
        frame(GREY_MODEL, "Full-length styled model wearing heather-grey DA’POR shorts with matching hoodie"),
        frame(GREY_REAR, "Styled model showing the heather-grey DA’POR shorts from behind"),
      ],
      artwork: [frame(GREY_SHOTS_FRONT, "Supplied front artwork for heather-grey graphic shorts"), frame(GREY_SHOTS_BACK, "Supplied back artwork for heather-grey graphic shorts")],
      colors: [{ name: "Heather Grey / Navy / Red", value: "#c9c9c9", image: GREY_SHOTS_FRONT }],
      description: "Heather-grey shorts with DA’POR District marks, an oversized 26 graphic, a drawcord waist and printed eagle artwork. They pair with the heather-grey zip hoodie, sold separately. The modeled photographs are styling previews; original front and back artwork is available in Design references.",
      fit: "Use the preliminary DA’POR bottoms chart for S–5XL. Shorts finished outseams range from 19 inches (S) to 22.5 inches (5XL); relaxed waist measurements range from 28 to 45 inches. These are starting specifications and should be verified against approved production samples.",
      info: ["Heather-grey knee-length shorts", "Drawcord waist", "DA’POR eagle and 26 graphics", "Original front and back artwork under Design references", "Matching heather-grey hoodie available separately"],
      related: [101, 104, 106],
    }),
    product({
      id: 103,
      slug: "district-onyx-red-zip-hoodie",
      title: "District Onyx / Red Zip Hoodie",
      desc: "Black base · red-and-white District graphics",
      category: "Zip hoodies",
      cat: "hoodies black red",
      badge: "New artwork",
      img: RED_MODEL,
      images: [
        frame(RED_MODEL, "Full-length styled model wearing onyx-red DA’POR hoodie and shorts"),
        frame(RED_REAR, "Styled model showing onyx-red hoodie eagle-crest print from behind"),
      ],
      artwork: [frame(RED_ART, "Original combined front and back artwork for the onyx-red hoodie and shorts")],
      colors: [{ name: "Onyx Black / Red", value: "#121212", image: RED_ART }],
      description: "A black DA’POR District zip hoodie with red hood lining, red-and-white sleeve bands, bold front lettering and a large eagle-crest back graphic. Styled images include matching shorts, sold separately; the supplied print artwork is available in Design references.",
      fit: "See the preliminary master chart for S–5XL. Finished hoodie chest widths are listed from 22 to 34 inches and lengths from 27 to 34 inches. Width is measured flat, not around the chest; confirm final fit against the production sample.",
      info: ["Black zip hoodie with red hood lining", "Red-and-white District lettering", "Striped sleeves", "Large eagle-crest back print", "Matching graphic shorts pictured separately"],
      related: [104, 101, 105],
    }),
    product({
      id: 104,
      slug: "district-onyx-red-graphic-shorts",
      title: "District Onyx / Red Graphic Shorts",
      desc: "Eagle and 26 graphics · red accents",
      category: "Graphic shorts",
      cat: "shorts black red",
      img: RED_MODEL,
      images: [
        frame(RED_MODEL, "Full-length styled model wearing onyx-red DA’POR graphic shorts"),
        frame(RED_REAR, "Styled model showing the onyx-red DA’POR shorts artwork from behind"),
      ],
      artwork: [frame(RED_ART, "Original combined front and back artwork for the onyx-red hoodie and shorts")],
      colors: [{ name: "Onyx Black / Red", value: "#121212", image: RED_ART }],
      description: "Black knee-length graphic shorts with red drawcords, DA’POR eagle and 26 prints, and side accents in red and white. Modeled photographs also show the matching zip hoodie, sold separately; original print artwork is in Design references.",
      fit: "The preliminary bottoms chart lists sizes S–5XL, relaxed waists from 28 to 45 inches and shorts outseams from 19 to 22.5 inches. Please confirm measurements on approved finished garments before selling.",
      info: ["Black graphic shorts", "Red waistband and drawcord detail", "DA’POR eagle and 26 prints", "Front and back shown in supplied composite artwork", "Hoodie available separately"],
      related: [103, 102, 106],
    }),
    product({
      id: 105,
      slug: "district-onyx-turquoise-zip-hoodie",
      title: "District Onyx / Turquoise Zip Hoodie",
      desc: "Gold lettering · turquoise crest details",
      category: "Zip hoodies",
      cat: "hoodies black turquoise",
      badge: "New artwork",
      img: TEAL_MODEL,
      images: [
        frame(TEAL_MODEL, "Full-length styled model wearing onyx-turquoise DA’POR hoodie and shorts"),
        frame(TEAL_REAR, "Styled front and back views of onyx-turquoise DA’POR hoodie and shorts"),
      ],
      artwork: [frame(TEAL_ART, "Original combined front and back artwork for the onyx-turquoise hoodie and shorts")],
      colors: [{ name: "Onyx Black / Turquoise / Gold", value: "#111111", image: TEAL_ART }],
      description: "A black zip hoodie with a turquoise-lined hood, yellow-and-turquoise sleeve bands, gold DA’POR lettering and a turquoise eagle-crest back graphic. Styled photographs show matching shorts, sold separately; supplier artwork is available in Design references.",
      fit: "Refer to the preliminary DA’POR master size chart for S–5XL. The hoodie finished chest widths are 22–34 inches, flat, with lengths of 27–34 inches. Final production fit and fabric behavior still require confirmation.",
      info: ["Black zip hoodie", "Turquoise-lined hood", "Gold DA’POR front wordmark", "Yellow-and-turquoise sleeves", "Large turquoise-and-gold eagle artwork"],
      related: [106, 103, 101],
    }),
    product({
      id: 106,
      slug: "district-onyx-turquoise-graphic-shorts",
      title: "District Onyx / Turquoise Graphic Shorts",
      desc: "Turquoise eagle · gold 26 print",
      category: "Graphic shorts",
      cat: "shorts black turquoise",
      img: TEAL_MODEL,
      images: [
        frame(TEAL_MODEL, "Full-length styled model wearing onyx-turquoise DA’POR graphic shorts"),
        frame(TEAL_REAR, "Styled front and back views showing onyx-turquoise DA’POR shorts"),
      ],
      artwork: [frame(TEAL_ART, "Original combined front and back artwork for the onyx-turquoise hoodie and shorts")],
      colors: [{ name: "Onyx Black / Turquoise / Gold", value: "#111111", image: TEAL_ART }],
      description: "Black graphic shorts with turquoise-and-gold eagle artwork, a 26 motif, yellow drawcords and a turquoise waistband detail. Styled photographs show the matching hoodie, sold separately. Original front-and-back artwork is available in Design references.",
      fit: "Sizes S–5XL appear on the preliminary DA’POR bottoms chart. Relaxed waist measurements are 28–45 inches and shorts outseams 19–22.5 inches. These values are a starting specification, not a verified final production size claim.",
      info: ["Black knee-length graphic shorts", "Turquoise waistband and gold drawcord detail", "Eagle and 26 printed graphics", "Original supplier artwork under Design references", "Hoodie available separately"],
      related: [105, 104, 102],
    }),
  ];

  window.DAPOR_PRODUCTS = products;
})();
