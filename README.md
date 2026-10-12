# CappadociaBlog.com

An English-language Cappadocia travel publication with 55 guides, 500 FAQ entries, travel planning, GetYourGuide recommendations, image credits, SEO metadata and an owner-only editorial CMS.

## Vercel deployment

The site can be deployed as a public, read-only preview before its database and Google sign-in are configured. In that mode, seeded articles and site pages work; analytics are not stored; CMS access and edits remain unavailable. Add the database and OAuth settings before using `/admin/`.

1. Import this repository into Vercel. Keep the project root at the repository root and use the default Node.js build settings. The build command is `npm run build`.
2. Add a Neon Postgres database from Vercel Marketplace and copy its `DATABASE_URL` into the Vercel project environment variables.
3. The Vercel function creates the required tables automatically on its first database request. `npm run db:migrate` remains available for explicit migrations, and `npm run db:check` verifies connectivity and required tables.
4. Create a Google OAuth web client. Add the production callback URL `https://cappadociablog.com/auth/google/callback` as an authorized redirect URI. Configure:

   - `ADMIN_OWNER_EMAIL`: the one Google account allowed to use the CMS
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - `AUTH_SECRET` and `CSRF_SECRET`: independent random values of at least 32 characters
   - `PUBLIC_ORIGIN=https://cappadociablog.com`
   - `CANONICAL_ORIGIN=https://cappadociablog.com`

   Generate secrets locally with `openssl rand -base64 48`. Set production and preview values separately; use the corresponding Vercel preview URL in Google OAuth only if preview sign-in is needed.
5. Deploy to a Vercel preview URL and verify the home page, `/guides/`, `/faq/`, `/getting-there/`, `/sitemap.xml`, Google owner sign-in and CMS draft/publish workflow.
6. Add `cappadociablog.com` to the Vercel project and apply the exact DNS records Vercel displays at the registrar. Confirm the domain is verified and HTTPS works before treating it as live.

Do not commit `.env`, `.env.local`, OAuth credentials, database URLs, signing keys or exported CMS data. The `.openai/hosting.json` file is intentionally excluded from GitHub.

## Content and data migration

The 55 seeded guides, FAQ and experience recommendations are versioned in this repository. CMS edits made on the existing hosted site are stored separately in its Cloudflare D1 database and are not included in GitHub. Before moving the editorial CMS to production, export its `articles`, `article_revisions`, `administrators`, `site_settings` and `site_metrics` data and import that export into Neon. Keep the existing hosted site available until the import has been checked. Do not initialize Neon as the sole source of truth if there are unpublished edits to preserve.

Database schema changes are defined in `db/postgres-schema.sql`; run `npm run db:migrate` after a change and inspect the diff. Keep migration credentials local.

## Local checks

```sh
npm install
npm run build
npm run test:vercel
node test-cms.mjs
```

`test-cms.mjs` checks seeded content, CMS validation and publication workflows. `tests/vercel-handler.test.mjs` checks route rewrites, owner login setup and unauthenticated admin protection.

## Editorial notes

- `/admin/` is restricted to the single configured owner Google account. Reader accounts are not part of this site.
- All 19 experience-mapped guides include topic-related GetYourGuide links/widgets with partner ID `GTS1OZ5`; other guides use related activity links where relevant.
- Affiliate and paid-ad disclosure appears in the footer. Banner placements are replaceable through `advertisingSlots` in `experiences.mjs`.
- Article photographs are licensed images with source and attribution metadata; CC BY-SA derivatives retain their applicable license.
- The FAQ contains 500 English questions in 25 topics. It is source-managed in `faq-data.mjs`.
- `GETTING THERE` content and flight/transfer details should be refreshed against current airline schedules before making time-sensitive claims.
