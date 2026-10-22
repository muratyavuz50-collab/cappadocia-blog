# CappadociaBlog.com

An English-language Cappadocia travel publication with 65 guides, 500 FAQ entries, travel planning, GetYourGuide recommendations, image credits, SEO metadata and an owner-only editorial CMS.

## Vercel deployment

The site can be deployed as a public, read-only preview before its database and Google sign-in are configured. In that mode, seeded articles and site pages work; analytics are not stored; CMS access and edits remain unavailable. Add the database and OAuth settings before using `/admin/`.

1. Import this repository into Vercel. Keep the project root at the repository root and use the default Node.js build settings. The build command is `npm run build`.
2. Add a Neon Postgres database from Vercel Marketplace and copy its `DATABASE_URL` into the Vercel project environment variables.
3. The Vercel function creates the required tables automatically on its first database request. `npm run db:migrate` remains available for explicit migrations, and `npm run db:check` verifies connectivity and required tables.
4. Create a Google OAuth web client. Add the production callback URL `https://www.cappadociablog.com/auth/google/callback` as an authorized redirect URI. Configure:

   - `ADMIN_OWNER_EMAIL`: the one Google account allowed to use the CMS
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - `AUTH_SECRET` and `CSRF_SECRET`: independent random values of at least 32 characters
   - `PUBLIC_ORIGIN=https://www.cappadociablog.com`
   - `CANONICAL_ORIGIN=https://www.cappadociablog.com`

   Generate secrets locally with `openssl rand -base64 48`. Set production and preview values separately; use the corresponding Vercel preview URL in Google OAuth only if preview sign-in is needed.
5. Deploy to a Vercel preview URL and verify the home page, `/guides/`, `/faq/`, `/getting-there/`, `/sitemap.xml`, Google owner sign-in and CMS draft/publish workflow.
6. Add `cappadociablog.com` and `www.cappadociablog.com` to the Vercel project, then make `www.cappadociablog.com` the primary domain. Apply the exact DNS records Vercel displays at the registrar and confirm HTTPS before treating the site as live.

Do not commit `.env`, `.env.local`, OAuth credentials, database URLs, signing keys or exported CMS data. The `.openai/hosting.json` file is intentionally excluded from GitHub.

## Content and data migration

The 65 seeded guides, FAQ and experience recommendations are versioned in this repository. CMS edits made on the existing hosted site are stored separately in its Cloudflare D1 database and are not included in GitHub. Before moving the editorial CMS to production, export its `articles`, `article_revisions`, `administrators`, `site_settings` and `site_metrics` data and import that export into Neon. Keep the existing hosted site available until the import has been checked. Do not initialize Neon as the sole source of truth if there are unpublished edits to preserve.

Database schema changes are defined in `db/postgres-schema.sql`; run `npm run db:migrate` after a change and inspect the diff. Keep migration credentials local.

## Local checks

```sh
npm install
npm run build
npm run test:vercel
npm run test:seo
node test-cms.mjs
npm run test:locales
```

`test-cms.mjs` checks seeded content, CMS validation and publication workflows. `scripts/seo-audit.mjs` checks unique metadata, canonical URLs, image semantics, structured data, crawlable internal links and sponsored affiliate links across every seeded article. `tests/vercel-handler.test.mjs` checks route rewrites, owner login setup and unauthenticated admin protection.

## Editorial notes

- `/admin/` is restricted to the single configured owner Google account. Reader accounts are not part of this site.
- All 19 experience-mapped guides include topic-related GetYourGuide links/widgets with partner ID `GTS1OZ5`; other guides use related activity links where relevant.
- Affiliate and paid-ad disclosure appears in the footer. Banner placements are replaceable through `advertisingSlots` in `experiences.mjs`.
- Article photographs are licensed images with source and attribution metadata; CC BY-SA derivatives retain their applicable license.
- The FAQ contains 500 questions and answers in 25 topics, available in all four site languages. Its English source is managed in `faq-data.mjs`.
- `GETTING THERE` content and flight/transfer details should be refreshed against current airline schedules before making time-sensitive claims.

## Language editing

English uses the original page URLs. Turkish, Spanish and Simplified Chinese use `/tr/`, `/es/` and `/zh/` followed by the same path. The server renders translated content directly, including article bodies, headings, metadata, image descriptions, navigation and FAQ answers. Page canonicals, reciprocal `hreflang` links, Open Graph locale and structured data follow the selected language. The sitemap includes all 324 seeded public URLs.

Reviewed dictionaries in `localization/tr.json`, `es.json` and `zh.json` map exact English strings to original native-language wording. Numbered placeholders retain the original inline links and formatting. Each language's `research-*.json` records the writing sources and terminology decisions. `localization/interface.json` covers dynamic messages, localized calendars, transfer validation and client-side status text.

After an English source or published CMS article changes, run `npm run build` and `node scripts/extract-localization.mjs` to update the source catalog, then translate every new or changed key in all three dictionaries. Rebuild and run `npm run test:locales` before deployment. New CMS text without a reviewed dictionary entry falls back to its English source; it is not automatically machine-translated. Drafts, revision history and existing database content remain managed by the protected CMS and are not overwritten by language deployment.

`test:locales` checks exact dictionary coverage and inline nesting, all language routes, translated article/schema headings, 500 expandable questions and answers per language, same-page language switching, private-route isolation, localized analytics, canonical URLs and sitemap language links. Existing SEO, CMS and Vercel handler tests remain separate.

For internal browser QA only, `node scripts/export-localized-preview.mjs` exports the actual built Worker responses into the ignored `.sites-runtime/locale-preview` directory. This uses an empty test database and does not contact or replace production storage.
