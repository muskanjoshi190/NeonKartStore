/* NeonKart product data
   To use real photos: put files named <slug>-1, <slug>-2, <slug>-3 in /images and set IMAGE_EXT to "jpg" (or "webp"/"png").
   Every card, carousel and cart line on the site is rendered from this array.
   Prices are plain numbers (INR); they are only formatted when displayed. */

var products = [
  {
    id: 1,
    name: "Aurora X1 Wireless Headphones",
    category: "Audio",
    price: 2499,
    mrp: 3999,
    rating: 4.6,
    reviews: 1284,
    accent: "#ff4d8d",
    tag: "Bestseller",
    short: "Over-ear, 40-hour battery, deep bass.",
    description:
      "Aurora X1 is built for long study nights and longer playlists. The 40 mm drivers give a warm, punchy sound, the memory-foam cushions stay comfortable for hours, and hybrid noise cancelling takes the edge off a noisy hostel corridor or a crowded bus.",
    features: ["40-hour playtime, 10 min charge = 5 hours", "Hybrid noise cancelling with transparency mode", "Bluetooth 5.3, dual-device pairing", "Foldable frame with hard travel pouch"],
    slug: "aurora-x1"
  },
  {
    id: 2,
    name: "Pulse Fit Smartwatch",
    category: "Wearables",
    price: 1799,
    mrp: 2999,
    rating: 4.4,
    reviews: 962,
    accent: "#27e1ff",
    tag: "New",
    short: "AMOLED screen, heart rate and sleep tracking.",
    description:
      "A bright 1.9 inch AMOLED display, 100+ sport modes and a week of battery in a body that is light enough to forget you are wearing it. Pulse Fit tracks steps, heart rate, SpO2 and sleep, and shows your phone notifications right on your wrist.",
    features: ["1.9 inch AMOLED, always-on option", "Heart rate, SpO2 and sleep tracking", "7-day battery, magnetic fast charger", "5 ATM water resistant"],
    slug: "pulse-fit"
  },
  {
    id: 3,
    name: "Blaze 75 Mechanical Keyboard",
    category: "Gaming",
    price: 3299,
    mrp: 4499,
    rating: 4.8,
    reviews: 2210,
    accent: "#b8ff5a",
    tag: "Top rated",
    short: "Hot-swappable switches with RGB edge lighting.",
    description:
      "A compact 75% layout that keeps the arrow keys and function row but saves desk space. Hot-swappable linear switches, PBT keycaps and a gasket-mounted plate make typing quiet, smooth and satisfying, whether you are coding or in a ranked match.",
    features: ["75% layout, 82 keys, hot-swappable", "Gasket mount with sound-dampening foam", "Per-key RGB plus edge glow", "USB-C wired and Bluetooth modes"],
    slug: "blaze-75"
  },
  {
    id: 4,
    name: "Nomad Commuter Backpack",
    category: "Lifestyle",
    price: 1299,
    mrp: 1999,
    rating: 4.5,
    reviews: 3140,
    accent: "#ff9f43",
    tag: "Value pick",
    short: "30 L, fits a 15.6 inch laptop, water resistant.",
    description:
      "Nomad has a padded laptop sleeve, a hidden anti-theft pocket and a front organiser for cables, pens and power banks. The fabric shrugs off monsoon drizzle, and the breathable back panel keeps long college commutes comfortable.",
    features: ["30 litre capacity, fits 15.6 inch laptop", "Water-resistant fabric with rain cover", "Hidden anti-theft back pocket", "Padded, breathable shoulder straps"],
    slug: "nomad-pack"
  },
  {
    id: 5,
    name: "Stride Runner Sneakers",
    category: "Lifestyle",
    price: 2199,
    mrp: 3299,
    rating: 4.3,
    reviews: 745,
    accent: "#ff6b6b",
    tag: "Trending",
    short: "Lightweight mesh runners with cushioned sole.",
    description:
      "Stride Runner pairs a breathable knit upper with a springy foam midsole, so it works for a morning jog and for a day on campus. The grippy outsole holds on wet floors and the heel counter keeps your foot locked in.",
    features: ["Breathable engineered-knit upper", "Responsive foam midsole", "Anti-slip rubber outsole", "Available in UK sizes 6 to 11"],
    slug: "stride-runner"
  },
  {
    id: 6,
    name: "Halo Study Desk Lamp",
    category: "Home",
    price: 899,
    mrp: 1399,
    rating: 4.7,
    reviews: 1530,
    accent: "#ffd166",
    tag: "Eye care",
    short: "Dimmable LED lamp with three colour modes.",
    description:
      "A flicker-free LED lamp that is gentle on the eyes during late-night revision. Pick warm, neutral or cool light, dim it to the exact level you want, and bend the two-joint arm to put the light exactly where your notebook is.",
    features: ["Flicker-free LED, 3 colour temperatures", "5 brightness levels with touch control", "Two-joint adjustable arm", "USB powered, 1.5 m cable"],
    slug: "halo-lamp"
  },
  {
    id: 7,
    name: "Boom Cube Bluetooth Speaker",
    category: "Audio",
    price: 1599,
    mrp: 2499,
    rating: 4.5,
    reviews: 1875,
    accent: "#8b5cf6",
    tag: "Party ready",
    short: "20 W portable speaker with 360 degree sound.",
    description:
      "Small enough for a backpack, loud enough for a terrace party. Boom Cube pushes 20 W of room-filling sound, survives splashes with its IPX6 rating, and two units can be paired together for true stereo.",
    features: ["20 W output with passive bass radiator", "IPX6 splash and dust resistant", "12-hour battery, USB-C charging", "Pair two speakers for stereo"],
    slug: "boom-cube"
  },
  {
    id: 8,
    name: "Vibe Shade Sunglasses",
    category: "Lifestyle",
    price: 699,
    mrp: 1299,
    rating: 4.2,
    reviews: 538,
    accent: "#ff4d8d",
    tag: "Summer",
    short: "Polarised gradient lenses, UV400 protection.",
    description:
      "Lightweight frames with polarised gradient lenses that cut glare on bright afternoons. They block 100% of UVA and UVB rays, and the flexible hinges survive being thrown into a bag without a case.",
    features: ["Polarised lenses with UV400 protection", "Lightweight flexible frame", "Scratch-resistant coating", "Includes soft case and cloth"],
    slug: "vibe-shade"
  },
  {
    id: 9,
    name: "Glacier Steel Water Bottle",
    category: "Home",
    price: 449,
    mrp: 799,
    rating: 4.6,
    reviews: 2764,
    accent: "#2dd4bf",
    tag: "Everyday",
    short: "750 ml insulated bottle, cold for 24 hours.",
    description:
      "Double-wall vacuum insulation keeps water ice cold for 24 hours or chai hot for 12. The leak-proof lid has a carry loop, the powder-coated body does not sweat, and the mouth is wide enough for ice cubes.",
    features: ["750 ml, food-grade 304 stainless steel", "Cold 24 h, hot 12 h", "Leak-proof lid with carry loop", "Fits most bag side pockets"],
    slug: "glacier-bottle"
  },
  {
    id: 10,
    name: "Viper RGB Gaming Mouse",
    category: "Gaming",
    price: 1199,
    mrp: 1899,
    rating: 4.4,
    reviews: 1102,
    accent: "#a3ff12",
    tag: "Esports",
    short: "16000 DPI sensor, 7 buttons, RGB glow.",
    description:
      "A comfortable ergonomic shell, a precise 16000 DPI optical sensor and seven programmable buttons. Switch DPI on the fly, set up macros in the software and let the RGB ring match your keyboard.",
    features: ["16000 DPI optical sensor", "7 programmable buttons with macros", "Braided cable, 1000 Hz polling", "Customisable RGB lighting"],
    slug: "viper-mouse"
  },
  {
    id: 11,
    name: "Volt 20000 mAh Power Bank",
    category: "Gadgets",
    price: 1399,
    mrp: 2199,
    rating: 4.5,
    reviews: 1967,
    accent: "#ff9f43",
    tag: "Fast charge",
    short: "22.5 W fast charging with a live battery display.",
    description:
      "Charge a phone four to five times on a single power bank charge. Volt has two USB-A ports and a USB-C port that supports 22.5 W fast charging, plus a digital display that shows the exact battery percentage.",
    features: ["20000 mAh capacity", "22.5 W fast charging, USB-C in and out", "Live digital percentage display", "Multi-layer safety protection"],
    slug: "volt-bank"
  },
  {
    id: 12,
    name: "Pod Mini True Wireless Earbuds",
    category: "Audio",
    price: 1299,
    mrp: 2299,
    rating: 4.3,
    reviews: 1420,
    accent: "#27e1ff",
    tag: "Pocket size",
    short: "Compact earbuds with 30 hours total playtime.",
    description:
      "Tiny earbuds in a pocket-friendly case. Pod Mini gives you 7 hours per charge and 30 hours with the case, a low-latency mode for gaming and a clear microphone that makes online classes much easier.",
    features: ["7 h earbuds + 23 h in the case", "Low-latency game mode", "Touch controls and voice assistant", "IPX5 sweat resistant"],
    slug: "pod-mini"
  }
];

var IMAGE_EXT = "svg";
products.forEach(function (p) {
  p.images = [1, 2, 3].map(function (n) { return "images/" + p.slug + "-" + n + "." + IMAGE_EXT; });
});
