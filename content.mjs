import { expandArticles } from "./editorial.mjs";
export const site = {
  name: "CappadociaBlog.com",
  domain: "https://www.cappadociablog.com",
  variant: "practical",
  shortCode: "cb",
  brandParts: ["Cappadocia", "Blog"],
  tagline: "Practical guides for a better Cappadocia trip",
  description: "Independent, practical Cappadocia travel guides for itineraries, balloons, airports, transfers, towns, hotels and bookable experiences.",
  utility: "Independent planning guides · Affiliate-supported · No booking fee added by us",
  guideLabel: "Travel guides",
  guidesTitle: "Plan every part of your Cappadocia trip.",
  guidesIntro: "Start with the decision you need to make now: when to go, where to stay, how to arrive or which experiences deserve a place in your itinerary.",
  editorialName: "CappadociaBlog Editorial Desk",
  footerBlurb: "Practical, independent guidance for travellers who want fewer tabs, clearer choices and a better-planned Cappadocia trip.",
  aboutTitle: "Clear planning, honest recommendations.",
  aboutIntro: "CappadociaBlog.com turns a complicated trip into a sequence of understandable decisions, while keeping editorial advice separate from paid visibility.",
  headerCta: { label: "Browse experiences", href: "https://www.getyourguide.com/cappadocia-l1400/?partner_id=GTS1OZ5&cmp=cb_header", external: true },
  nav: [
    { label: "Home", href: "/" },
    { label: "Plan", href: "/topics/plan-your-trip/" },
    { label: "Balloons", href: "/topics/balloons/" },
    { label: "Stay", href: "/topics/where-to-stay/" },
    { label: "Getting There", href: "/getting-there/" },
    { label: "FAQ", href: "/faq/" }
  ],
  categories: ["Trip Planning", "Itineraries", "Getting There", "Getting Around", "Where to Stay", "Hot-Air Balloons", "Activities", "Seasons", "Food & Restaurants"],
  articles: [
    {
      slug: "ultimate-cappadocia-travel-guide",
      title: "The Ultimate Cappadocia Travel Guide for First-Time Visitors",
      category: "Trip Planning",
      dek: "A practical starting point for dates, transport, towns, balloons and the experiences worth anchoring first.",
      readTime: 9,
      featured: true,
      cmp: "cb_001_cappadocia_travel_guide",
      intro: "Cappadocia looks compact on a map, yet the trip quickly becomes a puzzle of airports, scattered towns, weather-sensitive balloon flights and day tours that cover very different ground. The simplest plan is to make four decisions in order: dates, base, transport and anchor experiences.",
      sections: [
        { heading: "Begin with the shape of the trip", paragraphs: ["Give Cappadocia at least two full mornings if a balloon flight matters to you. Wind can change the schedule, so placing the flight on the first available morning creates a useful backup window.", "A short trip works best when you choose one base and group nearby sights. Longer stays can add quieter towns, valley walks and unstructured time without turning every day into a tour."], list: ["Two days: one major route and one flexible morning", "Three days: the best balance for a first visit", "Four or more days: room for walks, food, craft and weather changes"] },
        { heading: "Choose a base that matches your rhythm", paragraphs: ["Göreme is the easiest all-round base for visitors without a car. Uçhisar trades some convenience for elevated views and a quieter evening. Ürgüp offers a more town-like feel, while Ortahisar can suit travellers who prefer a calmer central position.", "Do not choose only from a terrace photograph. Check stairs, room access, heating or cooling, breakfast timing and the pickup policy for early activities."], list: ["Prioritise walkability when you will not rent a car", "Ask whether luggage assistance is available", "Confirm the exact room type, not only the hotel category"] },
        { heading: "Book only the anchors first", paragraphs: ["A balloon flight, airport transfer and one high-priority full-day experience are the parts most likely to shape the rest of the itinerary. Book those first, then leave space for weather and energy levels.", "Compare inclusions and cancellation terms on the live product page. A lower headline price is not automatically better if pickup, entrance fees or the preferred time are excluded."] }
      ]
    },
    {
      slug: "perfect-3-day-cappadocia-itinerary",
      title: "The Perfect 3-Day Cappadocia Itinerary",
      category: "Itineraries",
      dek: "A balanced first trip with a balloon backup morning, one broad regional route and time to slow down.",
      readTime: 8,
      featured: true,
      cmp: "cb_004_3_day_cappadocia_itinerary",
      intro: "Three days is long enough to see Cappadocia's essential landscapes without making every hour transactional. The key is to put the weather-sensitive activity first and avoid pairing two long regional tours back to back.",
      sections: [
        { heading: "Day one: orient yourself", paragraphs: ["Use the arrival day to understand your base on foot. Walk to a safe, signed viewpoint before sunset, confirm the next morning's pickup and keep dinner close to the hotel.", "If you arrive early, choose a compact local experience rather than a distant route. The goal is to start rested, not to collect stops."], list: ["Check the balloon confirmation message", "Set out warm layers for the pre-dawn pickup", "Keep the evening flexible"] },
        { heading: "Day two: balloon and northern highlights", paragraphs: ["Schedule the balloon for the first morning. After breakfast and a short rest, explore the Göreme–Uçhisar–Avanos side of the region through a small-group route or a carefully planned independent day.", "Avoid assuming the balloon landing time will match a rigid second booking. Leave enough margin for hotel return, breakfast and traffic."] },
        { heading: "Day three: go deeper, not faster", paragraphs: ["Choose either the southern route—often centred on an underground city and the Ihlara direction—or a slower day of valleys, food and craft. Your choice should reflect walking ability and tolerance for driving.", "If the first balloon attempt was cancelled, preserve this morning as the backup. Move flexible activities later rather than abandoning the experience immediately."] }
      ]
    },
    {
      slug: "cappadocia-hot-air-balloon-guide",
      title: "Cappadocia Hot-Air Balloon Guide: Booking, Flight Day and Safety",
      category: "Hot-Air Balloons",
      dek: "How to compare operators, understand the morning and build a weather-smart plan around the flight.",
      readTime: 9,
      featured: true,
      cmp: "cb_040_cappadocia_hot_air_balloon_guide",
      intro: "A balloon flight is both an aviation activity and a major travel purchase. Treat it accordingly: compare the operator and conditions, understand what is included, and give the weather more than one chance.",
      sections: [
        { heading: "Compare what changes the experience", paragraphs: ["Look beyond the marketing name. Basket capacity, pickup area, approximate airborne time, insurance information, cancellation terms and the operating company all matter.", "Confirm whether the listing identifies the actual operator or a reseller. Read the latest inclusions on the checkout page rather than relying on an old screenshot."], list: ["Operator identity and licence information", "Basket capacity and flight format", "Pickup, breakfast and hotel return", "Weather cancellation and refund terms"] },
        { heading: "What happens on the morning", paragraphs: ["Pickup is normally before sunrise, followed by operational checks and transfer to the launch area. The exact launch field changes with wind, so a responsible provider cannot promise one fixed route or a particular photograph.", "Wear closed shoes and layers. The coldest part is often waiting before launch; the basket can feel warmer once the sun rises and the burners are operating."] },
        { heading: "Build a responsible backup plan", paragraphs: ["Put the flight on the first suitable morning and avoid non-refundable plans immediately afterward. If authorities or operators cancel because conditions are unsuitable, treat that as the safety system working.", "Use the spare morning for a ground viewpoint, a guided walk or rest. Never enter a launch or landing field without permission to chase a photograph."] }
      ]
    },
    {
      slug: "how-many-days-in-cappadocia",
      title: "How Many Days Do You Need in Cappadocia?",
      category: "Trip Planning",
      dek: "A clear comparison of two, three, four, five and seven-day stays, with the trade-offs made explicit.",
      readTime: 6,
      cmp: "cb_002_how_many_days_in_cappadocia",
      intro: "For most first-time visitors, three days is the useful middle ground. Two days can work with tight priorities; four or five days creates breathing room for weather, walking and experiences outside the standard circuit.",
      sections: [
        { heading: "Two or three days", paragraphs: ["Choose two days only when Cappadocia is one stop in a wider Türkiye itinerary and you accept a compressed pace. Stay centrally, arrange transfers and select one regional route.", "With three days, you can protect a second balloon morning and still experience both a broad landscape route and one slower half-day."] },
        { heading: "Four or five days", paragraphs: ["A fourth day reduces the pressure to combine distant sights. Add a valley walk, Avanos craft experience, hamam or food-focused afternoon.", "Five days suits travellers who want later starts, photography, wine, wellness or time to change plans when weather does not cooperate."] },
        { heading: "A full week", paragraphs: ["Seven days works when Cappadocia is the destination rather than a checklist stop. Use the extra time for quieter villages and repeat visits at different light, not seven consecutive tours.", "Longer stays are most rewarding with a clear base strategy and intentional rest days."] }
      ]
    },
    {
      slug: "best-time-to-visit-cappadocia",
      title: "Best Time to Visit Cappadocia: A Month-by-Month Planning Guide",
      category: "Seasons",
      dek: "Choose dates by walking weather, daylight, crowds and flexibility—not by a promise of perfect balloon conditions.",
      readTime: 7,
      cmp: "cb_008_best_time_to_visit_cappadocia",
      intro: "There is no single perfect month. Spring and autumn often feel comfortable for walking, summer rewards early starts, and winter can be visually striking. Balloon operations remain weather-dependent in every season.",
      sections: [
        { heading: "Spring and autumn", paragraphs: ["These shoulder seasons can offer a pleasant balance for walking and sightseeing, but daily conditions still vary. Pack layers and keep rain or wind alternatives ready.", "Demand can be high around holidays and popular travel weeks, so reserve limited-capacity activities with flexible terms."] },
        { heading: "Summer", paragraphs: ["Plan active outdoor time for early morning and later afternoon. Midday is better for museums, long lunches, shaded interiors or a rest at the hotel.", "Sun protection, water and realistic walking distances matter more than trying to maximise the number of stops."] },
        { heading: "Winter", paragraphs: ["Winter offers a quieter visual mood and the possibility of snow, but it also asks for warmer clothing and greater schedule flexibility.", "Choose accommodation carefully for access and comfort, and never build the trip around a guaranteed snow scene or guaranteed flight day."] }
      ]
    },
    {
      slug: "cappadocia-trip-cost",
      title: "How Much Does a Cappadocia Trip Cost?",
      category: "Trip Planning",
      dek: "Build a realistic budget around the choices that move most: balloon, room type, transport and private touring.",
      readTime: 7,
      cmp: "cb_013_cappadocia_trip_cost",
      intro: "A useful Cappadocia budget is a structure, not a fixed number. Prices change by season and availability, while two travellers can spend very differently depending on balloon choice, cave-room category and transport style.",
      sections: [
        { heading: "Separate fixed and flexible choices", paragraphs: ["Start with transport to the region, nights of accommodation and airport transfers. Then add one high-priority experience at a time.", "Keep meals, local taxis, entrance fees and a contingency line separate so the budget does not depend on every estimate being exact."] },
        { heading: "Know the expensive decisions", paragraphs: ["Balloon flights and premium cave rooms can dominate the total. Private touring increases control over pace, while small-group options can reduce cost without removing guidance.", "Compare total inclusions rather than headline prices. A cheap-looking option can cost more once transfers or entrance fees are added."] },
        { heading: "Protect the budget", paragraphs: ["Use clear cancellation terms for weather-sensitive activities and avoid paying twice for overlapping routes. Choose a walkable base if repeated taxi rides would erode the saving on a distant room.", "Treat current prices on booking pages as the source of truth; older articles should explain the variables, not promise a number."] }
      ]
    },
    {
      slug: "cappadocia-without-a-car",
      title: "Cappadocia Without a Car: A Practical Transport and Tour Plan",
      category: "Getting Around",
      dek: "A workable plan using a central base, airport transfer, selected tours and realistic walking distances.",
      readTime: 7,
      cmp: "cb_015_cappadocia_without_a_car",
      intro: "You can enjoy Cappadocia without renting a car, but the region is not one walkable town. Success depends on choosing the right base and combining walking with a few well-selected transfers or tours.",
      sections: [
        { heading: "Choose a practical base", paragraphs: ["Göreme generally offers the broadest concentration of restaurants, tour pickups and nearby walks for a car-free first trip. Other towns can work well when the hotel provides dependable transport or you prefer a quieter stay.", "Check the actual slope and route between the room and town centre. A short map distance can still involve steep surfaces or stairs."] },
        { heading: "Use tours for dispersed routes", paragraphs: ["A guided full-day route can be efficient for sights spread across the region, particularly when public transport does not connect them directly.", "Compare routes carefully so you do not book two products covering the same valleys and viewpoints under different names."] },
        { heading: "Plan the gaps", paragraphs: ["Pre-arrange airport transfers with your flight details, keep cash or another backup payment method for local transport, and ask the hotel to confirm pickup points.", "Walk only on suitable signed routes, carry water and avoid using the edge of a valley as an improvised shortcut after dark."] }
      ]
    },
    {
      slug: "istanbul-to-cappadocia",
      title: "How to Get From Istanbul to Cappadocia",
      category: "Getting There",
      dek: "Compare flying, overnight buses and driving by total journey—not only the time shown on the ticket.",
      readTime: 7,
      cmp: "cb_021_istanbul_to_cappadocia",
      intro: "The flight itself is short, but the complete journey includes reaching an Istanbul airport, check-in, baggage, arrival and a road transfer from Kayseri or Nevşehir. Compare door-to-door effort before deciding.",
      sections: [
        { heading: "Flying", paragraphs: ["Flights can preserve sightseeing time, especially on a short trip. Compare both Istanbul departure airports and both Cappadocia arrival airports against the schedules that actually fit your hotel check-in.", "Do not book the airport transfer from the flight's scheduled landing time alone. The provider needs the airline and flight number to track delays and coordinate the correct vehicle."] },
        { heading: "Bus or car", paragraphs: ["An overnight bus can save a hotel night but may reduce your energy the following day. Check the arrival terminal and onward plan before assuming it will be seamless.", "Driving offers flexibility within a larger road trip, yet city traffic, winter conditions and parking should be part of the decision."] },
        { heading: "Protect the first day", paragraphs: ["Avoid placing a strict, non-refundable activity too close to your expected arrival. Delays at any stage can turn an efficient itinerary into a stressful one.", "Use the arrival day for orientation and keep the first dawn activity for the next morning whenever possible."] }
      ]
    },
    {
      slug: "kayseri-vs-nevsehir-airport",
      title: "Kayseri or Nevşehir Airport: Which Is Better for Cappadocia?",
      category: "Getting There",
      dek: "ASR and NAV compared by useful flight schedule, transfer plan and total door-to-door journey.",
      readTime: 6,
      cmp: "cb_024_kayseri_vs_nevsehir_airport",
      intro: "Nevşehir is geographically closer to many popular bases, while Kayseri often offers a different range of flight times. The better airport is the one that produces the smoother complete journey on your date.",
      sections: [
        { heading: "Compare schedules first", paragraphs: ["A closer airport is not automatically better when the flight time creates a poor connection or an extra hotel night. Compare the real options from your origin.", "Include baggage rules and the airport you must use in Istanbul if connecting from another flight."] },
        { heading: "Then compare transfers", paragraphs: ["Check whether the hotel, shuttle or private transfer serves the chosen flight and town. Shared services may wait for grouped arrivals; private services can be more direct.", "Always provide the arrival flight number, airline and date. For the return, provide the departure flight number and desired airport arrival margin."] },
        { heading: "Use the door-to-door test", paragraphs: ["Add the full chain: departure airport travel, check-in, flight, baggage collection and hotel transfer. The best option is usually obvious only after this comparison.", "Keep a record of the transfer provider's contact channel in case the flight changes after booking."] }
      ]
    },
    {
      slug: "cappadocia-airport-transfers",
      title: "Cappadocia Airport Transfers: ASR and NAV to Your Hotel",
      category: "Getting There",
      dek: "What to send the transfer provider, how shared and private options differ, and why the flight number is essential.",
      readTime: 6,
      cmp: "cb_025_cappadocia_airport_transfer",
      intro: "A reliable transfer begins with the flight, not a guessed pickup time. The provider needs enough information to identify the correct arrival, track changes and map the vehicle route to your exact accommodation.",
      sections: [
        { heading: "Information to provide", paragraphs: ["Send the passenger name, mobile contact, airline, arrival flight number, date, airport and complete hotel name. If you already have a return flight, send that number and date too so both journeys can be planned together.", "Reconfirm when the airline changes the schedule or flight number. A screenshot without the written flight number can be easy to misread."], list: ["Arrival and return flight numbers", "ASR or NAV airport code", "Full hotel name and town", "Passenger count and luggage notes", "Reachable messaging number"] },
        { heading: "Shared or private", paragraphs: ["Shared transfers can be good value and normally group passengers from compatible flights. The route may include several hotel stops.", "Private transfers reduce waiting and suit families, late arrivals or travellers with unusual luggage, but compare the complete terms before paying."] },
        { heading: "On the travel day", paragraphs: ["Keep the provider's instructions offline, turn on your phone after landing and follow the agreed meeting-point process. Do not accept an unrelated driver who cannot verify the booking details.", "For departure, plan around the airline's required check-in window, road conditions and possible pickup stops—not only the map distance."] }
      ]
    },
    {
      slug: "where-to-stay-in-cappadocia",
      title: "Where to Stay in Cappadocia: Best Towns for Every Travel Style",
      category: "Where to Stay",
      dek: "Göreme, Uçhisar, Ürgüp and Ortahisar compared by convenience, views, atmosphere and transport.",
      readTime: 8,
      cmp: "",
      intro: "The room matters, but the town determines how the whole trip feels. Choose the base before choosing the hotel, particularly when you will not have a car.",
      sections: [
        { heading: "Göreme", paragraphs: ["Göreme is a practical first choice for walkability, tour pickups and a wide spread of traveller services. It feels busy in popular periods and some properties involve steep lanes.", "Choose it when convenience matters more than a quiet resort atmosphere."] },
        { heading: "Uçhisar and Ortahisar", paragraphs: ["Uçhisar is known for elevated views and a calmer feel, though a taxi or hotel transfer may be useful for some plans. Ortahisar can offer a quieter, locally textured base in a central position.", "In both towns, verify evening dining options, pickup coverage and the gradient between the hotel and main streets."] },
        { heading: "Ürgüp and the final room check", paragraphs: ["Ürgüp has a broader town rhythm and can suit travellers interested in restaurants, wine and a less backpacker-oriented base.", "Whichever town you choose, confirm the exact room, windows, stairs, ventilation, heating or cooling, terrace access and luggage support before booking."] }
      ]
    },
    {
      slug: "best-cave-hotels-in-goreme",
      title: "How to Choose a Cave Hotel in Göreme",
      category: "Hotels",
      dek: "A transparent room-first checklist for access, ventilation, views and authentic cave architecture.",
      readTime: 7,
      cmp: "",
      intro: "The phrase cave hotel covers very different buildings and room types. Choose with attention to the individual room and access route, not the most dramatic terrace photograph.",
      sections: [
        { heading: "Understand the room type", paragraphs: ["Some rooms are cut into rock, others use stone construction, and many properties combine both. Ask what the booked room actually is and whether it has an external window.", "A beautiful cave room can naturally feel darker or more humid than a conventional room. Ventilation and climate control deserve direct questions."] },
        { heading: "Check access", paragraphs: ["Göreme's slopes and historic buildings can involve uneven paths, narrow stairs and rooms spread across several levels. Confirm the route from the entrance to the exact room.", "Travellers with heavy luggage, young children or limited mobility should ask about assistance and vehicle access before payment."] },
        { heading: "Treat views honestly", paragraphs: ["A terrace can be excellent without guaranteeing balloons in one fixed direction. Launch fields and flight paths change with operations and wind.", "Choose the hotel for the complete stay—service, sleep, location and room comfort—then treat the sunrise view as a valuable extra."] }
      ]
    },
    {
      slug: "cappadocia-balloon-price",
      title: "How Much Does a Cappadocia Balloon Ride Cost?",
      category: "Hot-Air Balloons",
      dek: "Why prices move and how to compare flight format, basket size, inclusions and cancellation terms.",
      readTime: 6,
      cmp: "cb_041_cappadocia_balloon_price",
      intro: "A single fixed price becomes outdated quickly. Availability, demand, basket configuration and product format all affect the live amount, so a good comparison explains value rather than publishing a promise.",
      sections: [
        { heading: "Why the price changes", paragraphs: ["Travel period, remaining capacity, operating area and product type can all move the price. Limited supply after weather cancellations can also change availability.", "Use a live comparison for your exact date and passenger count."] },
        { heading: "Compare the same product", paragraphs: ["Check approximate flight format, basket capacity, pickup coverage, breakfast, insurance information and refund terms. Two listings with similar titles may not include the same service.", "Read the provider and product details before checkout rather than assuming every Cappadocia flight follows one standard package."] },
        { heading: "Make the purchase safer", paragraphs: ["Choose clear weather-cancellation terms, pay through a traceable booking channel and retain the confirmation. Avoid informal offers that cannot identify the operating company.", "Book early enough to preserve alternatives, while keeping a second morning open when the flight is a priority."] }
      ]
    },
    {
      slug: "cappadocia-balloon-cancelled",
      title: "What Happens if Your Cappadocia Balloon Flight Is Cancelled?",
      category: "Hot-Air Balloons",
      dek: "A calm backup plan for weather cancellations, rebooking, refunds and the rest of your morning.",
      readTime: 6,
      cmp: "cb_043_cappadocia_balloon_cancelled",
      intro: "A cancelled flight is disappointing, but it is not a reason to take an unsafe alternative. Balloon operations depend on suitable conditions and formal operational decisions; your itinerary should expect that possibility.",
      sections: [
        { heading: "Confirm the status through the provider", paragraphs: ["Use the contact channel in your booking confirmation. Do not rely only on rumours from another hotel or operator, because products and operating areas can differ.", "Keep written confirmation of cancellation, rebooking or refund steps."] },
        { heading: "Rebook before rebuilding the whole trip", paragraphs: ["If you have another morning, ask about the next suitable availability and the terms that apply. Do not cancel unrelated plans until the new option is confirmed.", "If no flight is possible, follow the platform's stated refund process rather than paying twice under pressure."] },
        { heading: "Use the morning well", paragraphs: ["A ground viewpoint, slow breakfast, museum visit or later valley walk can keep the day valuable. Weather that prevents flying may also affect exposed viewpoints, so follow local advice.", "The best prevention is simple: schedule the flight early in the stay and keep one morning flexible."] }
      ]
    },
    {
      slug: "where-to-watch-cappadocia-balloons",
      title: "Best Places to Watch Cappadocia Balloons From the Ground",
      category: "Hot-Air Balloons",
      dek: "How to choose a safe sunrise viewpoint without assuming a fixed launch field or flight path.",
      readTime: 6,
      cmp: "cb_046_where_to_watch_balloons_in_cappa",
      intro: "Ground viewing can be as memorable as flying, especially for photographers and families. The essential rule is that the balloons move with operations and wind, so no viewpoint can guarantee one composition every morning.",
      sections: [
        { heading: "Choose access over a famous pin", paragraphs: ["Use public, permitted viewpoints with a clear route in darkness. A location shared online may cross private land, become unsafe after rain or place visitors near a launch field.", "Ask your accommodation about current access and arrange transport if the route is not comfortably walkable before dawn."] },
        { heading: "Read the morning", paragraphs: ["Confirm whether flights are operating before committing to a distant viewpoint. Watch wind direction and be willing to enjoy the wider landscape rather than chasing the densest cluster.", "Bring warm layers and a small light, but avoid shining bright lights toward pilots, crews or other visitors."] },
        { heading: "Photograph responsibly", paragraphs: ["Stay back from vehicles, ropes, livestock and working crews. Do not enter a landing area or stand in the road for a frame.", "A guided sunrise photography experience can help with legal access and timing, but compare group size and transport details first."] }
      ]
    },
    {
      slug: "cappadocia-green-tour",
      title: "Cappadocia Green Tour: Route, Stops and Who It Suits",
      category: "Tours",
      dek: "Understand the long southern route, walking expectations and how it differs from a compact local sightseeing day.",
      readTime: 7,
      cmp: "cb_050_cappadocia_green_tour",
      intro: "The label Green Tour usually describes a long day reaching the southern side of the region, often combining an underground city with the Ihlara direction. Exact stops vary, so compare the current itinerary rather than the colour name alone.",
      sections: [
        { heading: "Expect distance", paragraphs: ["This route covers broad ground and can include significant driving. It suits visitors who want a guided overview without renting a car, but it is not a slow valley day.", "Check pickup time, return estimate and whether lunch and entrance fees are included."] },
        { heading: "Check the walking and enclosed spaces", paragraphs: ["Underground cities involve stairs, narrow passages and enclosed areas. Ihlara-style routes can involve steps and uneven walking.", "Travellers with mobility, breathing or claustrophobia concerns should discuss the exact plan with the provider before booking."] },
        { heading: "Decide if it fits your trip", paragraphs: ["Choose this tour when the southern sites are a priority and you have a full day. Pick a more local route if you prefer less driving or need a gentler pace.", "Avoid booking another product with the same main stops on the following day unless you intentionally want a deeper revisit."] }
      ]
    },
    {
      slug: "cappadocia-atv-tour",
      title: "Cappadocia ATV Tours: Routes, Safety and the Best Time to Ride",
      category: "Activities",
      dek: "What to compare before a sunrise, daytime or sunset ride, from route pressure to dust and protective equipment.",
      readTime: 6,
      cmp: "cb_053_cappadocia_atv_tour",
      intro: "ATV tours provide quick access to wide views, but the quality of the experience depends on route management, group size, instruction and respect for fragile terrain.",
      sections: [
        { heading: "Compare the operating format", paragraphs: ["Check whether the price is per vehicle or person, whether two riders are permitted, the approximate group size and the amount of instruction.", "Ask what protective equipment is supplied and whether the route changes for weather or trail conditions."] },
        { heading: "Prepare for dust and temperature", paragraphs: ["Closed shoes, practical clothing and eye protection are sensible. Sunset rides can finish cooler than they begin, while midday heat can make a longer tour tiring.", "People with back, neck or respiratory concerns should assess the activity carefully and seek appropriate advice."] },
        { heading: "Choose a responsible route", paragraphs: ["Stay with the guide and use permitted tracks. Driving off-route can damage soft terrain, disturb walkers and accelerate erosion.", "A smaller group and clear pace control can be worth more than an extra stop advertised in the title."] }
      ]
    },
    {
      slug: "derinkuyu-vs-kaymakli",
      title: "Derinkuyu or Kaymaklı: Which Underground City Should You Visit?",
      category: "Attractions",
      dek: "Choose by route, depth, crowd pattern and comfort with stairs and confined passages—not by a universal winner.",
      readTime: 7,
      cmp: "cb_057_derinkuyu_vs_kaymakli",
      intro: "Both sites reveal sophisticated underground planning, yet the visitor experience differs by route and conditions. The better choice is personal: itinerary geography, crowd tolerance and physical comfort matter.",
      sections: [
        { heading: "Think about the route", paragraphs: ["Derinkuyu is often associated with a deeper-feeling visit, while Kaymaklı can feel more horizontally spread. Visitor access and open sections may change, so use current official information.", "Choose the site that fits the rest of the day's route rather than adding unnecessary driving for a small perceived advantage."] },
        { heading: "Assess comfort honestly", paragraphs: ["Both can involve low ceilings, narrow passages and stairs. They may not suit every visitor with mobility, breathing or claustrophobia concerns.", "A knowledgeable guide can make ventilation shafts, storage spaces and defensive features understandable without rushing the group."] },
        { heading: "Visit with care", paragraphs: ["Follow the marked visitor route, allow faster groups to pass where safe and avoid touching vulnerable surfaces.", "Do not present speculation as certainty. The most rewarding visit distinguishes physical evidence, historical interpretation and later storytelling."] }
      ]
    },
    {
      slug: "goreme-open-air-museum-guide",
      title: "Göreme Open-Air Museum: Churches, Timing and Visiting Tips",
      category: "Attractions",
      dek: "A calm approach to the museum's rock-cut churches, frescoes, access and respectful viewing.",
      readTime: 7,
      cmp: "cb_058_goreme_open_air_museum_guide",
      intro: "Göreme Open-Air Museum is not simply a photo stop; it is a concentrated cultural landscape of rock-cut spaces and painted churches. A little context and an unhurried route make the visit far more meaningful.",
      sections: [
        { heading: "Plan for the site, not one doorway", paragraphs: ["Allow time for walking between spaces and for small interiors to control visitor flow. Early or later visits can feel calmer, but always check current opening and ticket information from official sources.", "Wear shoes suited to stone paths and steps, and bring water in warm weather."] },
        { heading: "Look before photographing", paragraphs: ["Photography restrictions protect sensitive interiors and the visitor experience. Follow the signs even when another visitor does not.", "A guide or well-researched audio resource can help distinguish periods, symbols and restoration without turning the visit into a checklist."] },
        { heading: "Connect it to the wider region", paragraphs: ["The museum is an excellent introduction, not the complete story of Cappadocia's religious landscape. Other valleys and towns contain related spaces with different contexts.", "Protect lesser-known places by staying on permitted routes and avoiding the publication of fragile off-trail locations."] }
      ]
    }
  ]
};
site.articles=expandArticles(site.articles);
