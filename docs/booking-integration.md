# Booking.com integration — CappadociaBlog

## Source and intent

Updated 15 November 2026 at the owner's request. The baseline is `muratyavuz50-collab/cappadocia-blog`, branch `main`, commit `4b52204c6caeb4878bae4355367902c616a64c5c`, confirmed against the active custom-domain Vercel deployment before editing. The production project is `prj_J2aEjGbDB0qmHIUSvxPjerdebcLF`.

Keep the existing editorial site, four languages, GetYourGuide placements and tracking, CaveTable content, admin isolation, analytics privacy choices, canonical URLs and infrastructure. No DNS, database, authentication or paid-service changes are needed.

## Placements and hotel priority

- Home: the first six preferred hotels, a link to the full hotel guide and one accommodation search.
- `/articles/cappadocia-hotel-guide/`, the existing best-hotels article and the stay topic: all twelve preferred hotels, in the owner's order. Localized equivalents preserve that order.
- Related stay articles: the first three hotels and accommodation search. Planning/itinerary articles: a compact first-three selection.
- Transport articles, transport topic and `/getting-there/`: the supplied flight widget and an always available flight link.
- Footer: the existing commercial disclosure now includes Booking.com and explains that the selection includes properties connected to the publisher. The privacy page describes external widgets, CJ tracking and aggregate click measurement. Disclosure is not repeated inside articles.

Order: Sultan Cave Suites; Aza Cave Hotel; Kelebek Special Cave Hotel; Artemis Cave Suites; Henna Hotel; Aydınlı Cave Hotel; Museum Hotel; Argos in Cappadocia; Taşkonaklar Hotel; Seki Cave Hotel; Cappadocia Cave Suites; Carus Cappadocia.

Property links were checked against Booking.com's own property records. Henna intentionally uses the legacy `phoenix-nevseha-r` slug. Seki is the Çavuşin hotel, distinct from Seki Restaurant at Argos. Cards contain no invented price, review score, availability or hotel photograph. The selection is identified as preferred, not as a score-based ranking.

## Affiliate configuration

- Publisher ID: `101906092`.
- Property and accommodation search links: `https://www.dpbolvw.net/click-101906092-17293139` with a URL-encoded HTTPS Booking.com destination and an ASCII `cb_` placement SID.
- The supplied example deep link pointed back to CappadociaBlog. Its destination is corrected to the relevant Booking.com property or Cappadocia search.
- Accommodation selector: `bookingAffiliateWidget_386d39d7-2d08-41b5-af0f-0fc2c536b862`, creative `17323528`.
- Flight selector: `bookingAffiliateWidget_39c24ef3-3091-43e9-a903-e1857048b61e`, creative `17323529`.
- Both widget click overrides preserve the supplied `www.jdoqocy.com` host and publisher/creative pair. Impression pixels use `www.awltovhc.com` with the matching creative.
- The SDK is `https://www.booking.com/affiliate/prelanding_sdk`. Accommodation defaults to Cappadocia, Türkiye and EUR. Language follows the current page. Visitors select dates; no fixed example dates are sent.
- No Booking `aid` is invented or hard-coded. CJ adds its own attribution parameters during redirection.

## Runtime and localization

`booking-client.js` loads the SDK once and starts widgets near the viewport. It validates selector/creative pairs, prevents duplicate UUID instances and keeps fallback links outside the widget mount. A widget is marked ready only after a `WasabiWidget:Load` message from its own iframe and Booking.com origin. Script errors and timeouts show a localized fallback. CSS isolates the provider's iframe stacking and adapts cards to narrow screens.

`booking.mjs` owns hotel targets, component rendering and the new four-language copy. A supplemental `localization/booking-catalog.json` preserves the original reviewed catalog while adding the new strings. Dynamic ready/fallback attributes are translated too. Existing analytics accept bounded hotel/search/flight click identifiers; these are click totals, not bookings or sales.

## Verification

- `npm run build`: passed.
- `npm run test:locales`: passed for 328 pages, 66 articles, 3,579 translation entries per language, 2,000 localized FAQ entries and 4,092 GetYourGuide links.
- `npm run test:vercel`: four tests passed.
- `node scripts/seo-audit.mjs`: passed for 82 routes, unique titles/descriptions, internal links, image attribution, canonical/hreflang, schema, sitemap, feeds and robots.
- Independent source review found no blocking issues in the hotel order, IDs, destinations, localization, fallback behavior, rel attributes or click measurement.
- `qa/booking-integration-audit.json` records a focused pass over every generated language route, including hotel order, HTTPS destinations, publisher/creative IDs, SIDs, rel attributes, duplicate widget prevention and translated status text.
- One controlled CJ redirect check reached the exact Sultan Booking.com property URL with network-added affiliate parameters. It stopped before fetching Booking.com and did not make a reservation. The sanitized chain is recorded in `qa/booking-redirect-check.json`.

Production publication and visual checks are recorded in the project work log after deployment. Conversion attribution and commission reporting must be confirmed in the real CJ/Booking dashboard; no tracked sale is claimed.
