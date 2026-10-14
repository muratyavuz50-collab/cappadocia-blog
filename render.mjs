import { faqPreview } from "./faq-pages.mjs";
import { experiences, partnerId, selectExperiences, trackedUrl, advertisingSlots, contextualBrowse } from "./experiences.mjs";
import { articleImages,articleExtras } from "./article-images.mjs";
import { topicHubs,topicArticles,articleHub } from "./editorial.mjs";
import { hotels,restaurants,michelinHotels } from "./business-guides.mjs";

export function createRenderer(site) {
const updated = "October 6, 2026";
const reviewDate = (article) => article.updatedAt ? new Intl.DateTimeFormat("en-US",{month:"long",day:"numeric",year:"numeric"}).format(new Date(article.updatedAt)) : updated;

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const articleUrl = (article) => `/articles/${article.slug}/`;
const imageFor = (article) => {
  const topic = `${article.title} ${article.category}`.toLowerCase();
  const fallback = /transfer/.test(topic) ? "cappadocia-airport-transfers" : /airport|getting there/.test(topic) ? "kayseri-vs-nevsehir-airport" : /derinkuyu|kaymakl|underground/.test(topic) ? "derinkuyu-vs-kaymakli" : /museum|church/.test(topic) ? "goreme-open-air-museum-guide" : /atv|quad/.test(topic) ? "cappadocia-atv-tour" : /hotel|stay/.test(topic) ? "where-to-stay-in-cappadocia" : /balloon/.test(topic) ? "cappadocia-hot-air-balloon-guide" : "ultimate-cappadocia-travel-guide";
  return articleImages[article.slug] || articleImages[article.imageKey] || articleImages[fallback] || { src:"/assets/cappadocia-sunrise.webp", alt:"Hot-air balloons over Cappadocia", width:2048, height:768 };
};
const imageCredit = (image) => image.source ? `${image.illustrative ? `${escapeHtml(image.title)}. ` : ""}Photo: <a href="${escapeHtml(image.source)}" title="${escapeHtml(image.title)}" target="_blank" rel="noopener">${escapeHtml(image.author)}</a> · <a href="${escapeHtml(image.licenseUrl)}" target="_blank" rel="noopener">${escapeHtml(image.license)}</a>. ${image.modified ? "Resized to WebP; cropped for display." : ""}` : "";
let adContext = `${site.shortCode}_page`;
let adSequence = 0;

function icon(name) {
  const icons = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.4-3.4"></path></svg>',
    compass: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"></path></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v3M18 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"></path></svg>',
    balloon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c4 0 7 3.2 7 7 0 4.3-3.3 7.8-5.2 9.4h-3.6C8.3 16.8 5 13.3 5 9c0-3.8 3-7 7-7Z"></path><path d="M10 18.5h4L13 22h-2l-1-3.5ZM8 4.2C9.4 7 9.4 12.5 11 18M16 4.2C14.6 7 14.6 12.5 13 18"></path></svg>',
    bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 19V8M21 19v-7H8a3 3 0 0 0-3 3v1h16M7 12V8h5a3 3 0 0 1 3 3v1"></path></svg>',
    route: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2"></circle><circle cx="18" cy="6" r="2"></circle><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3h-1"></path></svg>',
    plane: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 18-7-7 18-3-8-8-3Z"></path><path d="m11 14 4-4"></path></svg>',
    museum: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5M5 10v7M9 10v7M15 10v7M19 10v7M3 20h18M4 17h16"></path></svg>',
    utensils: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4"></path></svg>',
    sparkles: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 13l.7 1.8 1.8.7-1.8.7L5 18l-.7-1.8-1.8-.7 1.8-.7L5 13Z"></path></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"></path><path d="m8.5 12 2.2 2.2 4.8-5"></path></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg>'
  };
  return icons[name] || icons.compass;
}

// Shared visual language for topic discovery and article-level editorial cues.
const topicIcons = {
  "plan-your-trip": "calendar",
  itineraries: "route",
  balloons: "balloon",
  transport: "plane",
  "where-to-stay": "bed",
  "museums-and-heritage": "museum",
  "valleys-and-experiences": "sparkles",
  "food-and-restaurants": "utensils"
};

const planningCues = {
  "plan-your-trip": ["Trip shape", "Your usable days and priorities", "Dates, margins and cancellation terms"],
  itineraries: ["Daily rhythm", "A realistic route with breathing room", "Arrival times and one flexible morning"],
  balloons: ["Flight choice", "The exact operator and flight option", "Pickup, participation and weather terms"],
  transport: ["Door-to-door route", "Airport, flight number and hotel", "Arrival and return transfer details"],
  "where-to-stay": ["Your base", "Town, room type and daily routine", "Stairs, access, views and pickup zone"],
  "museums-and-heritage": ["Meaningful visit", "One site explored with enough time", "Opening, access and photography rules"],
  "valleys-and-experiences": ["Time outdoors", "Route, pace and return plan", "Weather, footwear and meeting point"],
  "food-and-restaurants": ["A memorable meal", "Cuisine, town and occasion", "Reservation, menu and dietary needs"]
};

function guideSnapshot(article) {
  const hub = articleHub(article);
  const [focus, plan, confirm] = planningCues[hub.slug] || planningCues["plan-your-trip"];
  const mark = topicIcons[hub.slug] || "compass";
  return `<section class="guide-snapshot" aria-labelledby="snapshot-title"><div class="snapshot-mark">${icon(mark)}</div><div class="snapshot-heading"><span class="eyebrow">Guide snapshot</span><h2 id="snapshot-title">Know what matters before you decide.</h2></div><div class="snapshot-grid"><div><span>${icon("compass")}</span><small>Focus</small><strong>${escapeHtml(focus)}</strong></div><div><span>${icon("clock")}</span><small>Plan for</small><strong>${escapeHtml(plan)}</strong></div><div><span>${icon("check")}</span><small>Confirm</small><strong>${escapeHtml(confirm)}</strong></div></div></section>`;
}

function editorialIllustration(article) {
  const hub = articleHub(article);
  const mark = topicIcons[hub.slug] || "compass";
  const seed = [...article.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const palettes = [
    ["#dceccf", "#f6c778", "#d7603c"],
    ["#d9ece6", "#f2a957", "#2e7450"],
    ["#eadfcb", "#efbd6d", "#b9563a"],
    ["#dce7c8", "#f7d28a", "#386b50"]
  ];
  const [sky, sun, land] = palettes[seed % palettes.length];
  const feature = article.sections[Math.min(article.sections.length - 1, Math.floor(article.sections.length / 2))]?.heading || hub.title;
  const balloons = hub.slug === "balloons" || hub.slug === "plan-your-trip" || hub.slug === "itineraries";
  return `<figure class="editorial-illustration"><div class="illustration-art" role="img" aria-label="Illustrated Cappadocia field note for ${escapeHtml(article.title)}" style="--art-sky:${sky};--art-sun:${sun};--art-land:${land}"><span class="art-sun"></span><span class="art-rock art-rock-one"></span><span class="art-rock art-rock-two"></span><span class="art-rock art-rock-three"></span>${balloons?'<span class="art-balloon art-balloon-one"></span><span class="art-balloon art-balloon-two"></span>':`<span class="art-emblem">${icon(mark)}</span>`}<div class="art-copy"><small>Cappadocia field note</small><strong>${escapeHtml(feature)}</strong></div></div><figcaption>A visual pause created for this guide · ${escapeHtml(hub.title)}</figcaption></figure>`;
}

function brand() {
  const [first, second] = site.brandParts;
  return `<span class="brand-mark" aria-hidden="true"><i></i><b></b><em></em></span><span class="brand-word"><strong>${first}</strong>${second}<small>.com</small></span>`;
}

function header(active = "") {
  const nav = site.nav.map((item) => `<a ${active === item.label ? 'aria-current="page"' : ""} href="${item.href}">${item.label}</a>`).join("");
  return `<div class="utility"><div class="shell utility-inner"><span>${site.utility}</span></div></div>
  <header class="site-header">
    <div class="shell nav-wrap">
      <a class="brand" href="/" aria-label="${site.name} home">${brand()}</a>
      <nav class="desktop-nav" aria-label="Primary navigation">${nav}</nav>
      <a class="header-cta" href="${site.headerCta.href}"${site.headerCta.external ? ' target="_blank" rel="sponsored noopener"' : ""}>${site.headerCta.label}</a>
      <button class="menu-button" type="button" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">${icon("menu")}</button>
    </div>
    <div id="mobile-menu" class="mobile-menu" hidden><nav aria-label="Mobile navigation">${nav}<a class="mobile-cta" href="${site.headerCta.href}">${site.headerCta.label}</a></nav></div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="shell footer-grid">
      <div><a class="brand footer-brand" href="/">${brand()}</a><p>${site.footerBlurb}</p><span class="independent">Independent editorial · Cappadocia, Türkiye</span></div>
      <div><h2>Explore</h2><a href="/guides/">${site.guideLabel}</a><a href="/faq/">Cappadocia FAQ</a>${site.nav.slice(0,4).map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}</div>
      <div><h2>About</h2><a href="/about/">Our editorial standard</a><a href="/advertise/">Advertise with us</a><a href="/admin/">Editorial admin</a></div>
      <div><h2>Legal</h2><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></div>
    </div>
    <div class="shell footer-note" id="affiliate-disclosure"><p>Some links and placements on this site are commercial. We may earn a commission from bookings, at no extra cost to you. Booking, payment and customer support are handled by GetYourGuide or the named provider.</p></div>
    <div class="shell copyright"><span>© 2026 ${site.name}. All rights reserved.</span><span>Built for curious, respectful travellers.</span></div>
  </footer>`;
}

function adSlot(format = "wide") {
  const config = advertisingSlots[format] || advertisingSlots.wide;
  const placement = `${adContext}_ad_${format}_${++adSequence}`;
  if (config.mode === "banner") {
    const safeUrl = (value) => {
      try { const url = new URL(value); return url.protocol === "https:" ? url.href : ""; }
      catch { return ""; }
    };
    const image = safeUrl(config.imageUrl);
    const href = safeUrl(config.href);
    if (!image || !href) return "";
    return `<aside class="ad-slot ad-${format} ad-paid" aria-label="Partner experience" data-ad-slot="${format}"><a href="${escapeHtml(href)}" target="_blank" rel="sponsored noopener"><img src="${escapeHtml(image)}" alt="${escapeHtml(config.alt || config.title || "Sponsored partner")}" loading="lazy"></a></aside>`;
  }
  if (config.mode === "browse") {
    const image = articleImages["extra-pasabag"];
    const url = new URL("https://www.getyourguide.com/cappadocia-l1400/");
    url.searchParams.set("partner_id", partnerId);
    url.searchParams.set("cmp", `${placement}_experiences`);
    return `<aside class="ad-slot ad-${format} ad-experience" aria-label="Explore Cappadocia experiences" data-ad-slot="${format}"><div class="ad-experience-body"><div><a class="ad-balloon-image" href="${escapeHtml(url.href)}" target="_blank" rel="sponsored noopener" aria-label="Explore Cappadocia experiences"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy"></a><p class="card-credit">${imageCredit(image)}</p></div><div class="ad-experience-copy"><span class="eyebrow">Cappadocia experiences</span><strong>Make room for something memorable.</strong><p>Balloon flights, valley tours, ATV rides, pottery workshops and airport transfers. Find the experiences that fit your trip.</p><a class="button button-terracotta" href="${escapeHtml(url.href)}" target="_blank" rel="sponsored noopener">Explore Cappadocia experiences</a></div></div></aside>`;
  }
  const product = experiences[config.product];
  const {href} = trackedUrl(config.product, placement);
  return `<aside class="ad-slot ad-${format} ad-experience" aria-label="Experience: ${escapeHtml(product.name)}" data-ad-slot="${format}" data-ad-product="${product.id}"><div class="ad-experience-body"><a class="ad-balloon-image" href="${escapeHtml(href)}" target="_blank" rel="sponsored noopener" aria-label="Explore ${escapeHtml(product.name)}"><img src="/assets/cappadocia-sunrise.webp" alt="Balloons over Cappadocia; destination photograph" loading="lazy"></a><div class="ad-experience-copy"><span class="eyebrow">Cappadocia balloon experience</span><strong>${escapeHtml(product.name)}</strong><p>Check your dates, flight options and booking terms.</p><a class="button button-terracotta" href="${escapeHtml(href)}" target="_blank" rel="sponsored noopener">View on GetYourGuide</a></div></div>${format === "tall" ? availabilityWidget(config.product, placement, true) : ""}</aside>`;
}

function articleCard(article, options = {}) {
  const accent = options.featured ? " featured-card" : "";
  const image = imageFor(article);
  return `<article class="article-card${accent}" data-article-card data-category="${escapeHtml(article.category)}" data-search="${escapeHtml(`${article.title} ${article.dek} ${article.category}`.toLowerCase())}">
    <a class="card-image" href="${articleUrl(article)}" aria-label="Read ${escapeHtml(article.title)}"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy"><span>${escapeHtml(article.category)}</span></a>
    ${image.source ? `<p class="card-credit">${imageCredit(image)}</p>` : ""}<div class="card-body"><div class="card-meta"><span>${article.readTime} min read</span><span>Updated ${reviewDate(article)}</span></div><h3><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h3><p>${escapeHtml(article.dek)}</p><a class="text-link" href="${articleUrl(article)}">Read guide ${icon("arrow")}</a></div>
  </article>`;
}

function gygLink(cmp, label = "See Cappadocia experiences") {
  const code = cmp || `${site.shortCode}_homepage_experiences`;
  return `<a class="button button-terracotta" href="https://www.getyourguide.com/cappadocia-l1400/?partner_id=GTS1OZ5&amp;cmp=${encodeURIComponent(code)}" target="_blank" rel="sponsored noopener">${label}</a>`;
}

function availabilityWidget(key, placement, narrow = false) {
  const product = experiences[key];
  if (product.browseOnly || !product.id) return "";
  const { href, code } = trackedUrl(key, placement);
  return `<div class="experience-widget" data-experience-widget><p class="widget-status" role="status">Loading dates and availability…</p><div data-gyg-href="https://widget.getyourguide.com/default/availability.frame" data-gyg-tour-id="${product.id}" data-gyg-locale-code="en-US" data-gyg-currency="EUR" data-gyg-widget="availability" ${narrow ? "" : 'data-gyg-variant="horizontal"'} data-gyg-partner-id="${partnerId}" data-gyg-cmp="${escapeHtml(code)}"><span>Powered by <a target="_blank" rel="sponsored noopener" href="${escapeHtml(href)}">GetYourGuide</a></span></div></div>`;
}

function experienceCard(key, index, placement) {
  const product = experiences[key];
  const { href } = trackedUrl(key, placement);
  const action = product.browseOnly ? "Browse on GetYourGuide" : "Check dates & details";
  return `<article class="flight-card" data-recommended-product="${product.id || "browse"}"><div class="flight-card-heading"><span class="flight-number" aria-hidden="true">${String(index + 1).padStart(2,"0")}</span><div><span class="flight-label">${escapeHtml(product.label)}</span><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description)}</p></div><a class="button button-green" href="${escapeHtml(href)}" target="_blank" rel="sponsored noopener" aria-label="View ${escapeHtml(product.name)} options on GetYourGuide">${action}</a></div>${product.note ? `<p class="product-note">${escapeHtml(product.note)}</p>` : ""}${availabilityWidget(key, placement)}</article>`;
}

function gygModule(cmp, compact = false, article) {
  const code = cmp || `${site.shortCode}_experiences`;
  const selections = article ? selectExperiences(article) : ["turquaz","discovery"];
  if (!selections.length && article) {
    const browse=contextualBrowse(article,`${code}_browse`);
    return `<section class="experience-module experience-compact" id="recommended-experiences"><div class="experience-content"><span class="eyebrow">Explore options for this guide</span><h2>${escapeHtml(browse.label)}</h2><p>Compare the current route, meeting point, participant requirements and your dates. This category link is a way to browse; it does not imply that we reviewed every listed provider.</p><a class="button button-green" href="${escapeHtml(browse.href)}" target="_blank" rel="sponsored noopener">${escapeHtml(browse.label)}</a></div></section>`;
  }
  const hasBalloons = selections.some((key) => ["turquaz","discovery","royal","butterfly"].includes(key));
  const title = article ? "Experiences for this guide." : "Find your Cappadocia balloon flight.";
  const cards = selections.map((key,index) => experienceCard(key,index,`${code}_recommendation`)).join("");
  const more = !article ? `<div class="city-experiences"><div class="city-experiences-heading"><div><span class="eyebrow">Beyond the balloons</span><h3>Popular ways to explore Cappadocia</h3><p>Selected for relevant itineraries and substantial review histories.</p></div>${gygLink(`${code}_browse`, "Browse all experiences")}</div><div class="flight-list">${["airport","museum","atv"].map((key,index) => experienceCard(key,index,`${code}_popular`)).join("")}</div></div>` : "";
  return `<section class="experience-module${compact ? " experience-compact" : ""}" id="recommended-experiences" aria-labelledby="experience-title"><div class="experience-banner"><div class="experience-banner-copy"><span class="eyebrow light">Recommended experiences</span><h2 id="experience-title">${title}</h2><p>${article ? "Bookable options chosen to match this article. Compare the itinerary, inclusions and your dates before booking." : "Fly with confidence. Over 15 years of ballooning expertise, with your satisfaction guaranteed."}</p><span class="experience-assurance">${icon("shield")} Booking through GetYourGuide</span></div>${hasBalloons ? '<div class="experience-banner-image"><img src="/assets/cappadocia-sunrise.webp" alt="Hot-air balloons above the Cappadocia landscape" width="2048" height="768" loading="lazy"><span>Explore Cappadocia from above</span></div>' : ""}</div><div class="experience-content"><div class="flight-list">${cards}</div>${hasBalloons ? '<p class="flight-weather-note">Balloon flights depend on weather and operational approval. Review the selected option, actual operator, pickup details and cancellation terms.</p>' : ""}${more}</div></section>`;
}
function stayModule() {
  return `<section class="stay-module"><div class="stay-copy"><span class="eyebrow">Where to stay</span><h2>Choose the right town before the right room.</h2><p>Compare Göreme, Uçhisar, Ürgüp and Ortahisar by walkability, views, atmosphere and transport. Shortlist the rooms that fit your trip, then confirm the current offer with the property.</p><a class="button button-green" href="/guides/?category=Where%20to%20Stay">Read the stay guides</a></div><div class="stay-status"><span>${icon("bed")}</span><strong>Find your Cappadocia base</strong><p>Practical advice for cave rooms, locations and hotel transfers.</p><a href="/articles/cappadocia-hotel-guide/">Explore the hotel guide →</a></div></section>`;
}

function layout({ title, description, body, active = "", path = "/", type = "website", article, noindex=false }) {
  const canonical = `${site.domain}${path}`;
  const base={"@context":"https://schema.org"};
  const data=article?[{...base,"@type":"BlogPosting",headline:article.title,description:article.dek,image:site.domain+imageFor(article).src,datePublished:article.datePublished||article.updatedAt,dateModified:article.updatedAt||article.datePublished,author:{"@type":"Organization",name:site.editorialName,url:site.domain+"/about/"},publisher:{"@type":"Organization",name:site.name,url:site.domain},mainEntityOfPage:{"@type":"WebPage","@id":canonical}},{...base,"@type":"BreadcrumbList",itemListElement:[{name:"Home",item:site.domain+"/"},{name:articleHub(article).title,item:site.domain+`/topics/${articleHub(article).slug}/`},{name:article.title,item:canonical}].map((p,i)=>({"@type":"ListItem",position:i+1,...p}))}]:[{...base,"@type":path==="/"?"WebSite":"WebPage",name:title,description,url:canonical,publisher:{"@type":"Organization",name:site.name,url:site.domain+"/about/"}}];
  const schema=`<script type="application/ld+json">${JSON.stringify(data).replaceAll("<","\\u003c")}</script>`;
  return `<!doctype html>
<html lang="en" class="${site.variant}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${noindex?"noindex,nofollow":"index,follow,max-image-preview:large"}">
  ${site.googleVerification?`<meta name="google-site-verification" content="${escapeHtml(site.googleVerification)}">`:""}
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta name="theme-color" content="#256447">
  <link rel="stylesheet" href="/styles.css">
  ${schema}
</head>
<body data-public-page="${noindex?"false":"true"}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(active)}
  <main id="main">${body}</main>
  ${footer()}
  <script src="/site.js" defer></script>
</body>
</html>`;
}

function practicalHome() {
  adContext = `${site.shortCode}_homepage`; adSequence = 0;
  const featured = site.articles.filter((a) => a.featured).slice(0, 3);
  const latest = site.articles.filter((a) => !a.featured).sort((a,b)=>new Date(b.datePublished||b.updatedAt)-new Date(a.datePublished||a.updatedAt)).slice(0, 6);
  return `<section class="hero hero-practical">
    <div class="hero-photo" aria-hidden="true"><img src="${escapeHtml(articleImages["homepage-hero"].src)}" alt="" width="${articleImages["homepage-hero"].width}" height="${articleImages["homepage-hero"].height}" fetchpriority="high"></div>
    <div class="shell hero-inner"><div class="hero-copy"><span class="eyebrow light">Independent Cappadocia travel guide</span><h1>Plan less.<br><em>Experience more.</em></h1><p>Clear answers for balloons, stays, transfers and day-by-day itineraries—then live bookable options when you are ready.</p>
      <form class="hero-search" action="/guides/" method="get"><label class="sr-only" for="home-search">Search Cappadocia guides</label>${icon("search")}<input id="home-search" name="q" type="search" placeholder="Try “balloons”, “3 days” or “airport transfer”"><button type="submit">Search guides</button></form>
      <div class="quick-links"><a href="/getting-there/">${icon("calendar")} Flights & transfers</a><a href="/guides/?category=Itineraries">Itineraries</a><a href="/guides/?category=Hot-Air%20Balloons">${icon("balloon")} Balloons</a><a href="/guides/?category=Where%20to%20Stay">${icon("bed")} Where to stay</a></div>
    </div>
    <aside class="decision-card"><span>Start here</span><h2>Build the essentials in the right order.</h2><ol><li><b>1</b><div><strong>Choose your dates</strong><small>Weather, crowds and seasonal rhythm</small></div></li><li><b>2</b><div><strong>Pick your base</strong><small>Göreme, Uçhisar, Ürgüp or Ortahisar</small></div></li><li><b>3</b><div><strong>Book the anchors</strong><small>Balloon, transfer and one full-day route</small></div></li></ol><a href="/articles/ultimate-cappadocia-travel-guide/">Open the first-time guide</a></aside></div>
    <div class="shell hero-image-credit">${imageCredit(articleImages["homepage-hero"])}</div>
  </section>
  <div class="shell over-hero-ad">${adSlot("wide")}</div>
  <section class="section shell"><div class="section-heading"><div><span class="eyebrow">${site.articles.length} practical guides</span><h2>Find the part of the trip you need.</h2></div><a href="/topics/food-and-restaurants/">Restaurants & the Michelin guide</a></div>${topicNavigation()}<div class="section-heading"><div><span class="eyebrow">Plan with confidence</span><h2>Three decisions. One easier trip.</h2></div><p>Independent editorial first; clearly marked booking links second.</p></div>
    <div class="journey-grid"><a href="/guides/?category=Trip%20Planning"><span>${icon("compass")}</span><small>01</small><h3>Shape your trip</h3><p>Trip length, timing, budget and realistic pacing.</p></a><a href="/guides/?category=Getting%20There"><span>${icon("route")}</span><small>02</small><h3>Sort the logistics</h3><p>Airports, flight-number-aware transfers and getting around.</p></a><a href="/guides/?category=Hot-Air%20Balloons"><span>${icon("balloon")}</span><small>03</small><h3>Book key experiences</h3><p>Compare options only after you understand the trade-offs.</p></a></div>
  </section>
  <section class="section section-paper"><div class="shell"><div class="section-heading"><div><span class="eyebrow">Essential guides</span><h2>Start with the questions every visitor asks.</h2></div><a class="section-link" href="/guides/">View all guides ${icon("arrow")}</a></div><div class="card-grid">${featured.map((a) => articleCard(a, {featured:true})).join("")}</div></div></section>
  <section class="section shell">${gygModule("cb_homepage_experiences")}</section>
  <section class="section shell">${stayModule()}</section>
  <section class="section section-green"><div class="shell"><div class="section-heading light-heading"><div><span class="eyebrow light">Latest field notes</span><h2>Practical advice, without the guesswork.</h2></div><a class="section-link light-link" href="/guides/">Browse every guide ${icon("arrow")}</a></div><div class="card-grid compact-grid">${latest.map((a) => articleCard(a)).join("")}</div></div></section>
  ${faqPreview()}
  <div class="shell final-ad">${adSlot("native", "Your brand, presented beside useful travel guidance")}</div>`;
}

function editorialHome() {
  const lead = site.articles.find((a) => a.featured) || site.articles[0];
  if (!lead) return guidesPage();
  const more = site.articles.filter((a) => a.slug !== lead.slug).slice(0, 6);
  return `<section class="editorial-hero shell"><div class="editorial-photo"><img src="/assets/cappadocia-sunrise.webp" alt="Balloons drifting above Cappadocia at first light"><span>Field note · Landscape</span></div><div class="editorial-lead"><span class="issue-label">The living landscape issue</span><p class="edition">Vol. 01 · Cappadocia</p><h1>${escapeHtml(lead.title)}</h1><p>${escapeHtml(lead.dek)}</p><a class="button button-terracotta" href="${articleUrl(lead)}">Read the cover story</a><div class="lead-meta"><span>${lead.readTime} min read</span><span>Independent editorial</span></div></div></section>
  <div class="shell over-hero-ad">${adSlot("wide", "Reserved for a cultural or regional partner")}</div>
  <section class="section shell"><div class="section-heading editorial-heading"><div><span class="eyebrow">Stories from the plateau</span><h2>Read the place, not just the map.</h2></div><p>Landscape, memory, craft and food—reported with care and connected to responsible ways to experience them.</p></div><div class="editorial-grid">${more.slice(0,3).map((a,i) => articleCard(a,{featured:i===0})).join("")}</div></section>
  <section class="quote-band"><div class="shell"><span>Our editorial promise</span><blockquote>Paid visibility is always labelled. It never purchases a place in an independent recommendation.</blockquote><a href="/about/">Read our standard</a></div></section>
  <section class="section shell"><div class="topic-ribbon">${site.categories.slice(0,6).map((c,i)=>`<a href="/guides/?category=${encodeURIComponent(c)}"><small>0${i+1}</small><span>${escapeHtml(c)}</span></a>`).join("")}</div></section>
  <section class="section section-paper"><div class="shell"><div class="section-heading"><div><span class="eyebrow">From the journal</span><h2>Food, craft, heritage and quiet corners.</h2></div><a class="section-link" href="/guides/">All stories ${icon("arrow")}</a></div><div class="card-grid compact-grid">${more.slice(3).concat(site.articles.slice(7,10)).slice(0,6).map((a)=>articleCard(a)).join("")}</div></div></section>
  <section class="section shell">${gygModule("bc_homepage_contextual", true)}</section>
  <div class="shell final-ad">${adSlot("native", "Tell a clearly labelled local story with us")}</div>`;
}

function topicNavigation(){return `<nav class="topic-grid" aria-label="Browse Cappadocia topics">${topicHubs.map((h,index)=>`<a href="/topics/${h.slug}/"><span class="topic-card-top"><i>${icon(topicIcons[h.slug]||"compass")}</i><small>${String(index+1).padStart(2,"0")}</small></span><strong>${escapeHtml(h.title)}</strong><span class="topic-card-meta">${topicArticles(site,h).length} guides</span></a>`).join("")}</nav>`;}
function topicPage(hub){
 const pieces=topicArticles(site,hub),start=hub.start.map(slug=>pieces.find(a=>a.slug===slug)).filter(Boolean);
 const remaining=pieces.filter(a=>!start.some(s=>s.slug===a.slug));
 return `<section class="page-hero"><div class="shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/guides/">Travel guides</a></nav><span class="eyebrow">${pieces.length} practical guides</span><h1>${escapeHtml(hub.title)}</h1><p>${escapeHtml(hub.intro)}</p></div></section><section class="section shell"><ol class="topic-steps">${hub.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join("")}</ol>${hub.slug==="transport"?'<p class="topic-backlink"><a href="/getting-there/">Compare flights and open the ASR / NAV arrival calendar →</a></p>':""}<h2>Start with these guides</h2><div class="card-grid">${start.map(a=>articleCard(a)).join("")}</div>${remaining.length?`<div class="section-heading"><h2>Explore the topic</h2></div><div class="card-grid">${remaining.map(a=>articleCard(a)).join("")}</div>`:""}<h2>Other parts of your trip</h2>${topicNavigation()}</section>`;
}
function directoryFor(article){
 let entries=article.directory==="michelin-hotels"?michelinHotels:article.directory==="hotels"?hotels:article.directory==="restaurant-shortlist"?restaurants.filter(r=>["Revithia","Lil'a Restaurant","Seki Restaurant","Nahita Cappadocia","Moniq Restaurant","Seten Restaurant","Happena","Babayan Evi Restaurant"].includes(r.name)):article.directory==="michelin"?restaurants:null;
 if(!entries)return "";
 return `<section class="article-section" id="business-directory"><h2>${article.directory==="michelin-hotels"?"All 18 hotels in the checked selection":article.directory==="michelin"?"All 18 restaurants in the 2026 selection":"Places to compare"}</h2><p class="helper">Verified source links · Checked October 6, 2026 · No personal review or measured Google ranking is implied.</p><div class="directory-grid">${entries.map(r=>`<article class="directory-card"><span class="eyebrow">${escapeHtml(r.area)}</span><h3>${escapeHtml(r.name)}</h3>${r.distinction?`<strong class="directory-distinction">${escapeHtml(r.distinction)}</strong>`:""}<p>${escapeHtml(r.angle)}</p><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${article.directory==="hotels"?"Property information":"Official Michelin profile"}</a></article>`).join("")}</div></section>`;
}
function routeFor(article){return article.route?.length?`<section class="article-section route-card"><h2>Find the places on a map</h2><p>Open each named stop to plan your journey. These are location searches, not a verified walking trail or a guaranteed timetable.</p><ol>${article.route.map(place=>`<li><a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(place+", Cappadocia, Türkiye")}" target="_blank" rel="noopener">${escapeHtml(place)}</a></li>`).join("")}</ol></section>`:"";}
function sourceBlock(article){return article.sources?.length?`<section class="article-section article-sources"><h2>Sources and editorial review</h2><p>Source information checked ${escapeHtml(article.sourceCheckedAt||"2026-10-06")}. Routes and planning choices are editorial suggestions; live access and booking conditions remain provider-dependent.</p><ul>${article.sources.map(s=>`<li><a href="${escapeHtml(s.url)}" target="_blank" rel="${s.url.includes("getyourguide.com/")?"sponsored ":""}noopener">${escapeHtml(s.label)}</a></li>`).join("")}</ul><a href="/about/">Our editorial and correction standards</a></section>`:"";}
function guidesPage() {
  adContext = `${site.shortCode}_guides`; adSequence = 0;
  const categories = [...new Set(site.articles.map((a) => a.category))];
  return `<section class="page-hero"><div class="shell"><span class="eyebrow">${site.guideLabel}</span><h1>${site.guidesTitle}</h1><p>${site.guidesIntro}</p><form class="guide-search" role="search"><label for="guide-search">Search by question or topic</label><div>${icon("search")}<input id="guide-search" type="search" placeholder="Search ${site.articles.length} published ${site.variant === "practical" ? "guides" : "stories"}…"></div></form></div></section>
  <section class="section shell guide-browser">${topicNavigation()}<div class="filter-row" aria-label="Filter by category"><button class="filter-chip active" data-filter="all" type="button">All</button>${categories.map((c)=>`<button class="filter-chip" data-filter="${escapeHtml(c)}" type="button">${escapeHtml(c)}</button>`).join("")}</div><p class="results-count" aria-live="polite"><strong>${site.articles.length}</strong> published pieces</p><div class="card-grid" id="guide-grid">${site.articles.map((a)=>articleCard(a)).join("")}</div><div class="empty-state" hidden><span>${icon("search")}</span><h2>No exact match yet.</h2><p>Try a broader term or browse every category.</p><button class="button button-green" type="button" data-clear-search>Clear filters</button></div></section>
  <div class="shell final-ad">${adSlot("wide")}</div>`;
}

function articlePage(article) {
  const image = imageFor(article);
  adContext = `${site.shortCode}_${article.slug}`; adSequence = 0;
  const keys = selectExperiences(article);
  const topicPattern = keys.includes("airport") ? /transfer|airport|arrival|flight number/i : keys.includes("atv") ? /atv|ride|route|book/i : keys.includes("greenPopular") ? /underground|derinkuyu|kaymakl|tour|route/i : keys.includes("turquaz") ? /flight|balloon|book|operator/i : /museum|tour|visit|transport/i;
  const matchingSection = article.sections.findIndex((section) => topicPattern.test(section.heading));
  const recommendationIndex = matchingSection >= 0 ? matchingSection : Math.max(0, middleIndex(article.sections.length));
  const relatedCandidates=[...(article.relatedSlugs||[]).map(slug=>site.articles.find(a=>a.slug===slug)).filter(Boolean),...site.articles.filter(a=>a.category===article.category),...site.articles];
  const related=[...new Map(relatedCandidates.filter(a=>a.slug!==article.slug).map(a=>[a.slug,a])).values()].slice(0,3);
  const middle = Math.ceil(article.sections.length / 2);
  const sectionIcon = topicIcons[articleHub(article).slug] || "compass";
  const extraImages=articleExtras[article.slug]||[];
  const supportingImage=(index)=>extraImages[index]?`<figure class="article-supporting-image"><img src="${escapeHtml(extraImages[index].src)}" alt="${escapeHtml(extraImages[index].alt)}" width="${extraImages[index].width}" height="${extraImages[index].height}" loading="lazy"><figcaption>${imageCredit(extraImages[index])}</figcaption></figure>`:"";
  const sectionHtml = article.sections.map((section, index) => `${index === middle ? `${editorialIllustration(article)}${adSlot("inline", "A considered placement within this guide")}` : ""}<section class="article-section" id="${slugify(section.heading)}"><div class="article-section-heading"><span>${icon(sectionIcon)}</span><div><small>${String(index+1).padStart(2,"0")}</small><h2>${escapeHtml(section.heading)}</h2></div></div>${section.paragraphs.map((p)=>`<p>${escapeHtml(p)}</p>`).join("")}${index<2?supportingImage(index):""}${section.list ? `<ul>${section.list.map((item)=>`<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</section>${index === recommendationIndex ? gygModule(article.cmp || `${site.shortCode}_${article.slug}`, true, article) : ""}`).join("");
  const faq = article.faq || [
    ["Should I book ahead?", "For limited-capacity experiences and peak travel periods, compare availability early. Keep weather-sensitive plans flexible and read the current cancellation terms before paying."],
    ["How current is this guide?", `This article was reviewed on ${updated}. Operational details can change, so confirm live schedules, access rules and inclusions with the provider before travel.`]
  ];
  return `<article class="article"><header class="article-header shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/guides/">${site.guideLabel}</a><span>/</span><span>${escapeHtml(article.category)}</span></nav><span class="eyebrow">${escapeHtml(article.category)}</span><h1>${escapeHtml(article.title)}</h1><p class="article-dek">${escapeHtml(article.dek)}</p><div class="article-byline"><span>By ${site.editorialName}</span><span>${article.readTime} min read</span><span>Updated ${reviewDate(article)}</span></div></header>
  <figure class="article-hero"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" fetchpriority="high"><figcaption>${imageCredit(image)}</figcaption></figure>
  <div class="shell article-layout"><div class="article-main"><p class="article-intro">${escapeHtml(article.intro)}</p>${guideSnapshot(article)}${routeFor(article)}${directoryFor(article)}<p class="topic-backlink"><a href="/topics/${articleHub(article).slug}/">Explore ${escapeHtml(articleHub(article).title)}</a></p>${adSlot("inline", "A selected Cappadocia partner can appear here")}${sectionHtml}${["Getting There","Getting Around"].includes(article.category)?'<section class="article-section route-card"><h2>Plan your airport arrival</h2><p>Compare ASR and NAV, search flights for your dates and prepare a transfer checklist with your arrival and return flight numbers.</p><a href="/getting-there/">Open the Getting There calendar →</a></section>':""}${sourceBlock(article)}<div class="article-actions"><button type="button" data-share>${icon("arrow")} Share this guide</button><a href="/guides/">Explore more ${site.variant === "practical" ? "guides" : "stories"}</a></div>${adSlot("inline", "Reserved before reader questions")}<section class="faq"><span class="eyebrow">Useful to know</span><h2>Reader questions</h2>${faq.map(([q,a])=>`<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join("")}</section></div>
  <aside class="article-sidebar"><div class="sidebar-topic-mark"><span>${icon(sectionIcon)}</span><small>${escapeHtml(article.category)}</small></div><div class="sidebar-card"><span>In this guide</span>${article.sections.map((s)=>`<a href="#${slugify(s.heading)}">${escapeHtml(s.heading)}</a>`).join("")}</div>${adSlot("tall", "A high-visibility local partner position")}</aside></div>
  <section class="section section-paper"><div class="shell"><div class="section-heading"><div><span class="eyebrow">Continue exploring</span><h2>Related reading</h2></div></div><div class="card-grid">${related.map((a)=>articleCard(a)).join("")}</div></div></section></article>`;
}

function middleIndex(count) { return Math.floor((count - 1) / 2); }

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function simplePage(kind) {
  const pages = {
    about: {
      eyebrow: "About us", title: site.aboutTitle, intro: site.aboutIntro,
      content: `<div class="principles"><article><span>01</span><h2>Useful before commercial</h2><p>Every article must answer the reader's question before presenting a booking or advertising opportunity.</p></article><article><span>02</span><h2>Clear commercial information</h2><p>Our footer explains commercial links and placements. Payment does not purchase an organic ranking.</p></article><article><span>03</span><h2>Local context matters</h2><p>We favour practical accuracy, respectful travel and clear distinctions between evidence, editorial judgement and promotion.</p></article></div><section class="prose-block"><h2>How the network works</h2><p><strong>CappadociaBlog.com</strong> owns practical travel-planning intent. <strong>BlogCappadocia.com</strong> publishes culture, food, craft, heritage and landscape stories. This division avoids duplicated articles and gives each reader a clearer experience.</p><h2>Corrections and updates</h2><p>Travel details change. Every guide displays a review date, and commercial details should be confirmed on the provider's live page. Material corrections are made without allowing a commercial partner to rewrite independent conclusions.</p></section>`
    },
    advertise: {
      eyebrow: "Work with us", title: "Reach travellers while they are making real decisions.", intro: "Thoughtful placements for hotels, restaurants, guides, transfers, makers and regional brands—always clearly labelled.",
      content: `<div class="media-grid"><article><span>Display</span><h2>Banner placements</h2><p>Homepage, category, article, sidebar and pre-FAQ inventory designed to stay visible without interrupting the reading experience.</p><strong>970×90 · 300×250 · 300×600 · native</strong></article><article><span>Story</span><h2>Sponsored features</h2><p>A clearly labelled format for a real local story. Sponsored publication never changes independent rankings elsewhere on the site.</p><strong>Photography and fact review required</strong></article><article><span>Partner</span><h2>Category partnership</h2><p>Own a relevant context for a defined period, with frequency limits and transparent labelling across the chosen section.</p><strong>Quarterly and seasonal options</strong></article></div><section class="contact-panel"><div><span class="eyebrow light">Launch inventory</span><h2>Request the media kit.</h2><p>Advertising enquiries will be handled through the verified business contact published when the custom domain and email are activated.</p></div><a class="button button-cream" href="/about/">Review our standards</a></section>`
    },
    privacy: {
      eyebrow: "Legal", title: "Privacy notice", intro: "A concise launch-stage notice explaining what this publication measures and what it does not collect.",
      content: `<section class="prose-block"><h2>Site measurement</h2><p>We count page views, broad referral categories and clicks on our own GetYourGuide affiliate links in daily aggregates retained for 90 days. We do not store IP addresses, full referrer URLs, search queries or visitor identifiers in these aggregates, and do not set analytics cookies. Around 20% of eligible visits send real page-performance measurements (LCP, CLS and INP); only performance bands are retained. Our measurement honours Do Not Track and Global Privacy Control. Counts are not unique visitors, confirmed bookings or Google search impressions.</p><h2>External services</h2><p>GetYourGuide widgets and its integration analyser load when a widget area approaches the viewport. They contact GetYourGuide, whose own privacy and cookie policies apply; our Do Not Track setting does not control an external service. When you follow an external booking link, that service's policies also apply. This site does not receive your payment-card details or complete your booking.</p><h2>Your travel checklist</h2><p>The Getting There planner processes flight numbers and hotel details in your browser. It does not submit them to this site or reserve transport. Downloaded calendar notes remain on your device; send your booking details to the chosen provider yourself.</p><h2>Reader access</h2><p>No reader account or membership is required or offered. Reading guides and following booking links does not create a profile. If you joined before reader membership was retired, previously supplied profile information remains in the protected editorial records; it is not used for marketing.</p><h2>Editorial records</h2><p>Authorised edits and publication changes are recorded with a timestamp and editor identity to protect the integrity of the publication.</p></section>`
    },
    terms: {
      eyebrow: "Legal", title: "Terms of use", intro: "These guides support trip research; they are not a guarantee of availability, weather, price, access or provider performance.",
      content: `<section class="prose-block"><h2>Travel information</h2><p>Conditions, schedules, entrance rules and commercial terms can change. Confirm critical details with the relevant official authority or provider before travel.</p><h2>External bookings</h2><p>Bookings opened through a partner link are transactions between the reader and the external service or provider. Their terms, cancellation rules and support processes apply.</p><h2>Responsible use</h2><p>Do not use general editorial guidance as a substitute for professional safety, medical, legal or accessibility advice. Respect closures, signed routes, protected heritage and local communities.</p></section>`
    }
  };
  const p = pages[kind];
  return `<section class="page-hero simple-hero"><div class="shell"><span class="eyebrow">${p.eyebrow}</span><h1>${p.title}</h1><p>${p.intro}</p></div></section><section class="section shell simple-content">${p.content}</section>`;
}

return { layout, practicalHome, editorialHome, guidesPage, topicPage, articlePage, simplePage, escapeHtml, articleUrl };
}
