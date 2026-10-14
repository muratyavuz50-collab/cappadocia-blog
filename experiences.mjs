export const partnerId = "GTS1OZ5";
export const researchDate = "2026-10-06";
// Review counts are research snapshots used for selection, never represented as live sales figures.
export const experiences = {
  privateCar: {id:"450201",name:"Cappadocia Private Car & Driver",label:"Chauffeured service · not self-drive rental",path:"/nevsehir-l121020/cappadocia-private-car-driver-service-t450201/",description:"A private vehicle with a driver for a Cappadocia outing. Compare the selected duration, distance allowance and meeting point.",note:"Confirm pickup and extra costs. Do not assume airport collection, guiding, meals or entrance tickets are included."},
  pottery: {id:"800405",name:"Avanos Pottery Workshop",label:"Hands-on craft experience",path:"/en-gb/avanos-l983/avanos-pottery-workshop-with-clay-making-experience-t800405/",description:"Compare a hands-on Avanos clay workshop with a demonstration stop on a sightseeing tour.",note:"Confirm pickup, workshop time and whether your creation is unfired or can be finished and transported."},
  horse: {id:"403933",name:"Cappadocia Sunset Horse Riding",label:"Valley riding experience",path:"/en-gb/cavusin-l120995/cappadocia-sunset-horse-riding-tour-t403933/",description:"Compare the selected riding route, start time and pickup arrangements.",note:"Ask about helmets, rider suitability, participant limits and how horses are cared for before booking."},
  hamam: {id:"752633",name:"Cappadocia Turkish Bath & Spa",label:"Bathing and treatment options",path:"/cappadocia-l1400/cappadocia-turkish-bathhamam-massage-t752633/",description:"Compare the specific bath or treatment option rather than assuming every service in the title is included.",note:"Confirm the venue, treatment list, pickup arrangements, privacy preferences and additional charges."},
  cooking: {id:"428144",name:"Evening Turkish Cooking Class",label:"Cooking and a shared meal",path:"/central-anatolia-l161/cappadocia-evening-cooking-class-with-hotel-transfer-t428144/",description:"A Cappadocia cooking experience with a meal and transfers from selected hotel areas.",note:"Confirm dietary arrangements, pickup coverage and current availability. This activity has a smaller review history than the regional sightseeing tours."},
  wine: {id:"1016813",name:"Cappadocia Wine Tasting",label:"A local wine experience",path:"/cappadocia-l1400/cappadocia-wine-tasting-experience-t1016813/",description:"Compare the current tasting format, location and wines in your selected option.",note:"Check participation requirements and arrange transport that does not require you to drive after drinking."},
  coffee: {id:"559306",name:"Sand-Brewed Turkish Coffee Workshop",label:"A food and drink stop",path:"/cappadocia-l1400/cappadocia-sand-brewed-turkish-coffee-workshop-wdesserts-t559306/",description:"A short coffee-making experience to compare alongside your food itinerary.",note:"Confirm the meeting point, ingredients and any dietary needs directly; this is not a restaurant table reservation."},
  turquaz: { id:"409126", name:"Turquaz Balloons", label:"Featured balloon experience", path:"/goreme-l984/cappadocia-hot-air-balloon-ride-t409126/", description:"Explore the flight listed by Cappadocia Turquaz Balloons. The current listing describes a second flight operated by a sister company; check the selected option and operator before booking.", reviews:991 },
  discovery: { id:"26992", name:"Discovery Balloons", label:"Göreme balloon experience", path:"/cappadocia-l1400/cappadocia-goreme-hot-air-balloon-flight-at-sunrise-t26992/", description:"Check dates and current booking terms for a Göreme balloon experience." },
  airport: { id:"440381", name:"Private & Shared Airport Transfers", label:"Kayseri and Nevşehir airports", path:"/goreme-l984/roundtrip-transfers-from-hotels-to-kayserinevsehir-airports-t440381/", description:"Compare private and shared options for your airport and hotel. Confirm the direction and selected vehicle option.", note:"Provide your arrival flight number and, when available, your return flight number, together with both dates and your hotel address.", reviews:8882 },
  airportAlternative: { id:"748485", name:"Nevşehir or Kayseri Airport Transfer", label:"Private or shared transport", path:"/nevsehir-l121020/nevsehir-airport-or-kayseri-airport-fromto-shuttle-service-t748485/", description:"An alternative airport transfer to compare by pickup area, waiting arrangements and vehicle option.", note:"Always send your arriving flight number; include the return flight number when available. Confirm your hotel pickup time separately.", reviews:4907 },
  green: { id:"503272", name:"Green Tour: Derinkuyu, Nar Lake & Ihlara", label:"Underground city and southern route", path:"/cappadocia-l1400/cappadocia-green-tour-with-derinkuyu-selime-and-ihlara-t503272/", description:"A route combining Derinkuyu Underground City with Nar Lake, Ihlara and Selime. Compare walking demands and the selected option's inclusions.", note:"Check museum admission, lunch and optional stops on the current product page; do not assume all fees are included.", reviews:67 },
  greenPopular: { id:"480053", name:"Guided Green Tour with Optional Lunch & Tickets", label:"Derinkuyu, Ihlara Valley and Selime", path:"/en-gb/goreme-l984/cappadocia-guided-green-tour-with-lunch-and-tickets-t480053/", description:"A widely reviewed southern route with Derinkuyu Underground City, an Ihlara Valley walk and Selime Monastery. Hotel transfers and a guide are listed.", note:"Lunch and museum tickets depend on the selected option. The itinerary also lists shopping stops; check the full route and walking demands.", reviews:2670 },
  museum: { id:"723947", name:"Cappadocia Highlights: Red Tour & Underground City", label:"Includes a Göreme Open-Air Museum visit", path:"/avanos-l983/cappadocia-highlights-tour-red-tour-underground-city--t723947/", description:"A guided regional day with Göreme Open-Air Museum and an underground-city visit. Useful when you want museum context and transport together.", note:"Museum entry fees are shown separately in the itinerary. Review the selected option and total cost before paying.", reviews:1400 },
  kaymakli: { id:"529985", name:"Kaymaklı Underground City & Uçhisar Panorama", label:"A specific Kaymaklı option", path:"/kaymakli-l190217/discover-underground-city-and-hike-in-pigeon-valley-t529985/", description:"Compare this Kaymaklı-focused outing with a longer Derinkuyu route. Check the current itinerary and pickup arrangements.", note:"Chosen for its specific Kaymaklı itinerary; it has a smaller review history than the broader regional tours.", reviews:14 },
  atv: { id:"527311", name:"Cappadocia Sunset ATV Tour", label:"Valley adventure", path:"/goreme-l984/cappadocia-sunset-atv-tour-t527311/", description:"Compare the selected ride duration, pickup area and current sunset schedule.", note:"Check the provider's driving-licence, age and participation requirements before booking.", reviews:4083 },
  atvAlternative: { id:"572177", name:"Sunset ATV Tour with Hotel Transfer", label:"Another ATV option to compare", path:"/goreme-l984/cappadocia-atv-adventure-tour-with-transfer-t572177/", description:"Compare ride options and hotel-transfer arrangements with the other sunset ATV experience.", note:"Review participant requirements and the exact duration of your selected option.", reviews:1832 }
};

const articleSelections = {
  "cappadocia-car-rental":["privateCar","airport"],
  "ultimate-cappadocia-travel-guide":["turquaz","airport","museum"],
  "perfect-3-day-cappadocia-itinerary":["turquaz","museum","greenPopular"],
  "cappadocia-hot-air-balloon-guide":["turquaz","discovery"],
  "how-many-days-in-cappadocia":["museum","greenPopular"],
  "best-time-to-visit-cappadocia":["turquaz","museum"],
  "cappadocia-trip-cost":["airport","museum"],
  "cappadocia-without-a-car":["airport","museum"],
  "istanbul-to-cappadocia":["airport","airportAlternative"],
  "kayseri-vs-nevsehir-airport":["airport","airportAlternative"],
  "cappadocia-airport-transfers":["airport","airportAlternative"],
  "where-to-stay-in-cappadocia":["airport","museum"],
  "best-cave-hotels-in-goreme":["airport","museum"],
  "cappadocia-balloon-price":["turquaz","discovery"],
  "cappadocia-balloon-cancelled":["turquaz","museum","greenPopular"],
  "where-to-watch-cappadocia-balloons":["turquaz","discovery"],
  "best-balloon-companies-cappadocia":["turquaz","discovery"],
  "best-atv-tours-cappadocia":["atv","atvAlternative"],
  "best-horseback-riding-cappadocia":["horse"],
  "cappadocia-green-tour":["greenPopular","green","kaymakli"],
  "cappadocia-atv-tour":["atv","atvAlternative"],
  "derinkuyu-vs-kaymakli":["greenPopular","kaymakli"],
  "goreme-open-air-museum-guide":["museum"]
};

export function selectExperiences(article) {
  if (articleSelections[article.slug]) return articleSelections[article.slug];
  const topic=`${article.title} ${article.category}`.toLowerCase();
  if (/pottery|avanos/.test(topic)) return ["pottery"];
  if (/horse riding/.test(topic)) return ["horse"];
  if (/hamam|hammam/.test(topic)) return ["hamam"];
  if (/cooking class/.test(topic)) return ["cooking"];
  if (/wine tasting/.test(topic)) return ["wine"];
  if (article.category==="Food & Restaurants") return ["cooking","coffee"];
  if (/photography|pigeon valley|rose and red valley|love valley|walk|hike/.test(topic)) return [];
  if (/transfer|airport|getting there/.test(topic)) return ["airport","airportAlternative"];
  if (/derinkuyu|kaymakl|underground|green tour/.test(topic)) return ["greenPopular","kaymakli"];
  if (/museum|church|heritage|red tour/.test(topic)) return ["museum"];
  if (/atv|quad/.test(topic)) return ["atv","atvAlternative"];
  if (/balloon/.test(topic)) return ["turquaz","discovery"];
  if (/hotel|stay|getting around/.test(topic)) return ["airport","museum"];
  return ["museum","greenPopular"];
}

export function contextualBrowse(article,placement){
 const photo=/photography/.test(article.title.toLowerCase());
 const url=new URL(photo?"/cappadocia-l1400/photography-tours-tc19/":"/cappadocia-l1400/walking-tours-tc3/","https://www.getyourguide.com");
 url.searchParams.set("partner_id",partnerId);url.searchParams.set("cmp",placement.replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,150));
 return {href:url.href,label:photo?"Compare photography experiences":"Compare guided walking experiences"};
}

export function trackedUrl(key,placement) {
  const product=experiences[key];
  if (!product) throw new Error("Unknown experience");
  const code=`${placement}_${key}`.replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,150);
  const url=new URL(product.path,"https://www.getyourguide.com");
  url.searchParams.set("partner_id",partnerId);
  url.searchParams.set("cmp",code);
  return {href:url.href,code};
}

// Replace an individual slot with mode:"banner", title, imageUrl, href, alt when an advertiser is booked.
// Placements remain separate from editorial selections and preserve their inventory names.
export const advertisingSlots = {
  wide: {mode:"browse"},
  native: {mode:"gyg",product:"discovery"},
  inline: {mode:"gyg",product:"turquaz"},
  tall: {mode:"gyg",product:"discovery"}
};
