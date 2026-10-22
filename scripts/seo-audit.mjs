import assert from "node:assert/strict";
import worker from "../dist/server/index.js";
import { site } from "../content.mjs";
import { publicPaths } from "../analytics.mjs";
import { createRenderer } from "../render.mjs";
import {languages,localePath,barePath} from '../localization/engine.mjs';

const DB = {
  prepare() {
    return {
      bind() { return this; },
      async all() { return { results: [] }; },
      async first() { return null; },
      async run() { return { meta: { changes: 0 } }; }
    };
  },
  async batch(statements) { return Promise.all(statements.map((statement) => statement.run())); }
};
const env = {
  DB,
  PUBLIC_ORIGIN: site.domain,
  CANONICAL_ORIGIN: site.domain,
  CUSTOM_DOMAIN_STATUS: "active"
};
const renderer = createRenderer(site);
const expectedPaths = publicPaths(site);
const titles = new Map();
const descriptions = new Map();
const documents = new Map();
const incoming = new Map([...expectedPaths].map((path) => [path, new Set()]));
const now = Date.now() + 60_000;

const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function one(document, pattern, label) {
  const match = document.match(pattern);
  assert.ok(match, label);
  return decode(match[1]);
}

function unique(map, value, path, label) {
  const normalized = value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
  assert.ok(!map.has(normalized), `${label} duplicated on ${map.get(normalized)} and ${path}`);
  map.set(normalized, path);
}

async function request(path, origin = site.domain) {
  return worker.fetch(new Request(`${origin}${path}`), env, {});
}

function normalizeInternal(href) {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const path = new URL(decode(href), site.domain).pathname;
  return path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;
}

function validateHeadingOrder(document, path) {
  const levels = [...document.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
  assert.equal(levels.filter((level) => level === 1).length, 1, `${path}: exactly one H1`);
  for (let index = 1; index < levels.length; index += 1) {
    assert.ok(levels[index] <= levels[index - 1] + 1, `${path}: heading jumps H${levels[index - 1]} to H${levels[index]}`);
  }
}

function validateLinks(document, path) {
  for (const match of document.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gi)) {
    const tag = match[0];
    const href = decode(match[1]);
    if (/\btarget="_blank"/i.test(tag)) {
      assert.match(tag, /\brel="[^"]*\bnoopener\b[^"]*"/i, `${path}: target=_blank link needs noopener: ${href}`);
    }
    if (/getyourguide\.com/i.test(href)) {
      assert.match(tag, /\brel="[^"]*\bsponsored\b[^"]*"/i, `${path}: GetYourGuide link needs rel=sponsored: ${href}`);
    }
    if (/^https?:\/\//i.test(href)) assert.doesNotThrow(() => new URL(href), `${path}: malformed external URL ${href}`);
    const internal = normalizeInternal(href);
    if (!internal || /^\/(admin|account|api|signin-with-chatgpt|signout-with-chatgpt)\//.test(internal)) continue;
    if (internal === "/affiliate-disclosure/") continue;
    assert.ok(expectedPaths.has(barePath(internal)), `${path}: unresolved internal link ${href}`);
    incoming.get(barePath(internal)).add(path);
  }
}

function validateImages(document, path) {
  const tags = [...document.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  for (const tag of tags) {
    assert.match(tag, /\balt="[^"]*"/i, `${path}: image missing alt`);
    assert.match(tag, /\bwidth="\d+"/i, `${path}: image missing width`);
    assert.match(tag, /\bheight="\d+"/i, `${path}: image missing height`);
    if (tag.includes("commons.wikimedia.org/wiki/Special:FilePath/")) {
      assert.match(tag, /\bsrcset="[^"]*\s640w[^"]*"/i, `${path}: remote Commons image missing responsive srcset`);
      assert.match(tag, /\bsizes="[^"]+"/i, `${path}: remote Commons image missing sizes`);
    }
  }
  assert.doesNotMatch(document, /<link\s+rel="preload"[^>]+commons\.wikimedia\.org/i, `${path}: remote redirecting image must not be preloaded`);
}

for (const path of expectedPaths) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path}: expected 200`);
  assert.match(response.headers.get("content-type") || "", /^text\/html/i, `${path}: HTML content type`);
  assert.match(response.headers.get("cache-control") || "", /s-maxage=/, `${path}: CDN cache policy`);
  assert.equal(response.headers.get("x-robots-tag"), null, `${path}: no header-level noindex`);
  const document = await response.text();
  documents.set(path, document);

  assert.equal((document.match(/<title>/g) || []).length, 1, `${path}: exactly one title`);
  const title = one(document, /<title>([^<]+)<\/title>/i, `${path}: title`);
  const description = one(document, /<meta name="description" content="([^"]+)">/i, `${path}: meta description`);
  assert.ok(title.length >= 20 && title.length <= 80, `${path}: title length ${title.length}`);
  assert.ok(description.length >= 50 && description.length <= 200, `${path}: description length ${description.length}`);
  unique(titles, title, path, "Title");
  unique(descriptions, description, path, "Description");

  const canonical = one(document, /<link rel="canonical" href="([^"]+)">/i, `${path}: canonical`);
  assert.equal(canonical, `${site.domain}${path}`, `${path}: canonical target`);
  assert.equal(one(document, /<meta property="og:url" content="([^"]+)">/i, `${path}: og:url`), canonical, `${path}: og:url matches canonical`);
  assert.ok(document.includes('content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"'), `${path}: rich-preview robots policy`);
  assert.ok(document.includes('<meta property="og:site_name"'), `${path}: Open Graph site name`);
  assert.ok(document.includes('<meta property="og:image"'), `${path}: Open Graph image`);
  assert.ok(document.includes('<meta name="twitter:card" content="summary_large_image">'), `${path}: Twitter card`);
  assert.ok(document.includes('<link rel="alternate" type="application/rss+xml"'), `${path}: RSS discovery`);
  assert.equal((document.match(/<script type="application\/ld\+json">/g) || []).length, 1, `${path}: one JSON-LD graph`);

  validateHeadingOrder(document, path);
  validateLinks(document, path);
  validateImages(document, path);
}

for (const path of expectedPaths) {
  if (path === "/") continue;
  assert.ok(incoming.get(path).size > 0, `${path}: orphaned from all public HTML pages`);
}

for (const article of site.articles) {
  const path = renderer.articleUrl(article);
  const document = documents.get(path);
  const graph = JSON.parse(one(document, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i, `${path}: JSON-LD`));
  const posting = graph.find((entry) => entry["@type"] === "BlogPosting");
  assert.ok(posting, `${path}: BlogPosting schema`);
  assert.equal(posting.mainEntityOfPage["@id"], `${site.domain}${path}`, `${path}: schema canonical`);
  assert.equal(posting.author["@type"], "Organization", `${path}: truthful organizational author type`);
  assert.equal(posting.author.url, `${site.domain}/about/`, `${path}: author profile`);
  assert.equal(posting.image.url.startsWith("https://"), true, `${path}: absolute schema image`);
  assert.ok(Number(posting.image.width) > 0 && Number(posting.image.height) > 0, `${path}: schema image dimensions`);
  assert.equal(posting.datePublished, article.datePublished || article.updatedAt, `${path}: publication date truth`);
  assert.equal(posting.dateModified, article.updatedAt || article.datePublished, `${path}: modification date truth`);
  assert.ok(new Date(posting.datePublished).valueOf() <= now, `${path}: publication date is not future`);
  assert.ok(new Date(posting.dateModified).valueOf() <= now, `${path}: modification date is not future`);
  assert.ok(!graph.some((entry) => "aggregateRating" in entry || "review" in entry), `${path}: no invented review/rating schema`);
  assert.equal(one(document, /<meta property="article:published_time" content="([^"]+)">/i, `${path}: published time`), posting.datePublished);
  assert.equal(one(document, /<meta property="article:modified_time" content="([^"]+)">/i, `${path}: modified time`), posting.dateModified);
  assert.ok(document.includes(`<time datetime="${posting.dateModified}"`), `${path}: visible updated date matches schema`);
}

const allEditorialImages = site.articles.flatMap((article) => renderer.imagesFor(article));
assert.equal(new Set(allEditorialImages.map((image) => image.src)).size, allEditorialImages.length, "Every article hero/supporting image is unique");
for (const image of allEditorialImages) {
  assert.ok(image.alt && image.width > 0 && image.height > 0, `${image.src}: complete image attributes`);
  assert.ok(image.source && image.author && image.license && image.licenseUrl, `${image.src}: complete attribution metadata`);
  assert.doesNotMatch(image.author, /creator credited|unknown/i, `${image.src}: exact creator required`);
  assert.doesNotMatch(image.license, /reusable|unknown/i, `${image.src}: exact licence required`);
  assert.match(image.source, /^https:\/\//, `${image.src}: HTTPS source`);
  assert.match(image.licenseUrl, /^https:\/\/creativecommons\.org\//, `${image.src}: exact Creative Commons licence URL`);
}

const filteredGuides = await request("/guides/?category=Food");
assert.equal(filteredGuides.status, 200);
const filteredHtml = await filteredGuides.text();
assert.ok(filteredHtml.includes('content="noindex,follow"'), "Filtered guide results remain crawlable but are not indexed");
assert.ok(filteredHtml.includes(`rel="canonical" href="${site.domain}/guides/"`), "Filtered guide canonical strips query");

const notFound = await request("/does-not-exist/");
assert.equal(notFound.status, 404);
assert.match(notFound.headers.get("x-robots-tag") || "", /noindex, nofollow/);
const notFoundHtml = await notFound.text();
assert.ok(notFoundHtml.includes('content="noindex,nofollow"'), "404 has meta noindex,nofollow");
assert.doesNotMatch(notFoundHtml, /rel="canonical"|property="og:url"|application\/ld\+json/, "404 has no canonical or structured data");

const slashRedirect = await request("/guides");
assert.equal(slashRedirect.status, 308, "Missing trailing slash redirects");
assert.equal(slashRedirect.headers.get("location"), `${site.domain}/guides/`);
const hostRedirect = await request("/guides/?q=balloon", "https://preview.example.test");
assert.equal(hostRedirect.status, 308, "Non-canonical host redirects");
assert.equal(hostRedirect.headers.get("location"), `${site.domain}/guides/?q=balloon`);
const combinedRedirect = await request("/guides?q=balloon", "https://preview.example.test");
assert.equal(combinedRedirect.status, 308, "Host and slash normalization use one redirect");
assert.equal(combinedRedirect.headers.get("location"), `${site.domain}/guides/?q=balloon`);

const sitemapResponse = await request("/sitemap.xml");
assert.equal(sitemapResponse.status, 200);
assert.match(sitemapResponse.headers.get("content-type") || "", /application\/xml/);
const sitemap = await sitemapResponse.text();
assert.ok(sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'));
assert.doesNotMatch(sitemap, /<image:caption>|\/admin|\/account/, "Sitemap omits deprecated tags and private routes");
const sitemapBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
const sitemapPaths = new Set(sitemapBlocks.map((block) => new URL(decode(one(block, /<loc>([^<]+)<\/loc>/, "sitemap loc"))).pathname));
assert.deepEqual(sitemapPaths, new Set([...expectedPaths].flatMap(path=>languages.map(lang=>localePath(path,lang)))), "Sitemap exactly matches indexable public paths in every language");
for (const block of sitemapBlocks) {
  const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  if (lastmod) {
    assert.ok(Number.isFinite(new Date(lastmod).valueOf()), `Invalid sitemap lastmod: ${lastmod}`);
    assert.ok(new Date(lastmod).valueOf() <= now, `Future sitemap lastmod: ${lastmod}`);
  }
}
const sitemapImages = [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((match) => decode(match[1]));
const expectedImageUrls = allEditorialImages.map((image) => new URL(image.src, site.domain).href);
assert.equal(sitemapImages.length, expectedImageUrls.length*languages.length, "Sitemap includes every hero and supporting image in every language");
assert.deepEqual(new Set(sitemapImages), new Set(expectedImageUrls), "Sitemap image URLs exactly match editorial images");

const feedResponse = await request("/feed.xml");
assert.equal(feedResponse.status, 200);
assert.match(feedResponse.headers.get("content-type") || "", /application\/rss\+xml/);
const feed = await feedResponse.text();
assert.equal((feed.match(/<item>/g) || []).length, Math.min(50, site.articles.length), "RSS item limit");
assert.ok(feed.includes(`<atom:link href="${site.domain}/feed.xml" rel="self" type="application/rss+xml"/>`), "RSS self link");
const expectedFeedArticles = [...site.articles]
  .sort((a, b) => new Date(b.updatedAt || b.datePublished) - new Date(a.updatedAt || a.datePublished))
  .slice(0, 50);
const feedItems = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
for (const article of expectedFeedArticles) {
  const link = `${site.domain}${renderer.articleUrl(article)}`;
  const item = feedItems.find((candidate) => new RegExp(`<link>${escapeRegExp(link)}</link>`).test(candidate));
  assert.ok(item, `${article.slug}: RSS item`);
  assert.equal(one(item, /<pubDate>([^<]+)<\/pubDate>/, `${article.slug}: RSS date`), new Date(article.datePublished || article.updatedAt).toUTCString(), `${article.slug}: RSS uses publication date`);
}

const robotsResponse = await request("/robots.txt");
assert.equal(robotsResponse.status, 200);
const robots = await robotsResponse.text();
assert.match(robots, /User-agent: \*\nAllow: \//);
for (const privatePath of ["/admin", "/account", "/api/", "/signin-with-chatgpt", "/signout-with-chatgpt"]) {
  assert.ok(robots.includes(`Disallow: ${privatePath}`), `robots blocks ${privatePath}`);
}
assert.ok(robots.includes(`Sitemap: ${site.domain}/sitemap.xml`), "robots advertises sitemap");

console.log(`SEO audit passed: ${expectedPaths.size} live routes, ${site.articles.length} articles, ${titles.size} unique titles/descriptions, ${allEditorialImages.length} uniquely attributed images, complete canonical/link/schema/sitemap/feed/robots checks.`);
