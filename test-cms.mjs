import {referenceFor,monthGrid,arrivalCalendar,flightSearch} from "./travel-planner.mjs";
import {visitorMarkets,marketEvidence,directRoutes} from "./transport-data.mjs";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFile, readdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import worker from "./dist/server/index.js";
import { site } from "./content.mjs";
import { topicHubs } from "./editorial.mjs";
import { restaurants,michelinHotels } from "./business-guides.mjs";
import { experiences,selectExperiences,trackedUrl } from "./experiences.mjs";

const sqlite=new DatabaseSync(":memory:");
for(const file of (await readdir("./drizzle")).filter((f)=>f.endsWith(".sql")))sqlite.exec(await readFile(`./drizzle/${file}`,"utf8"));
const DB={
  prepare(sql){const statement=sqlite.prepare(sql);let values=[];return {bind(...v){values=v;return this;},async first(){return statement.get(...values)||null;},async all(){return {results:statement.all(...values)};},async run(){const result=statement.run(...values);return {meta:{changes:Number(result.changes)}};}};},
  async batch(statements){sqlite.exec("BEGIN");try{const results=[];for(const statement of statements)results.push(await statement.run());sqlite.exec("COMMIT");return results;}catch(e){sqlite.exec("ROLLBACK");throw e;}}
};
const env={DB,ADMIN_OWNER_EMAIL:"owner@example.test",CSRF_SECRET:randomBytes(32).toString("hex"),PUBLIC_ORIGIN:"https://cms.example.test"};
const identities={owner:{"oai-authenticated-user-id":"site-owner","oai-authenticated-user-email":"owner@example.test"},reader:{"oai-authenticated-user-id":"site-reader","oai-authenticated-user-email":"reader@example.test"}};
async function request(path,who,options={}){
 return worker.fetch(new Request(`https://cms.example.test${path}`,{...options,headers:{...(identities[who]||{}),...(options.headers||{})}}),env,{});
}
assert.equal((await request("/api/admin/articles")).status,401);
assert.equal((await request("/admin/","reader")).status,403);
assert.equal((await request("/admin/")).status,302);
const admin=await request("/admin/","owner");assert.equal(admin.status,200);
const adminHtml=await admin.text();const token=adminHtml.match(/name="csrf-token" content="([^"]+)"/)[1];
assert.ok(adminHtml.includes("Yazı yönetimi"));
assert.ok(admin.headers.get("content-security-policy").includes("frame-ancestors 'none'"));
const list=await (await request("/api/admin/articles","owner")).json();assert.equal(list.articles.length,site.articles.length);
assert.equal(site.articles.length,55);
assert.equal(new Set(site.articles.map(a=>a.slug)).size,55);
assert.equal(restaurants.length,18);assert.equal(michelinHotels.length,18);
assert.equal(michelinHotels.filter(h=>h.distinction.includes("2 MICHELIN Keys")).length,2);
assert.equal(michelinHotels.filter(h=>h.distinction.includes("1 MICHELIN Key")).length,1);
assert.equal((await request("/api/admin/seo")).status,401);
assert.equal((await request("/api/admin/seo","reader")).status,403);
const ownerSeo=await (await request("/api/admin/seo","owner")).json();
assert.equal(ownerSeo.publishedArticles,55);assert.equal(ownerSeo.topicCount,8);assert.equal(ownerSeo.report.pageviews,0);
const publicPages=["/","/guides/","/faq/","/about/","/privacy/","/terms/","/getting-there/","/advertise/",...topicHubs.map(h=>`/topics/${h.slug}/`),...site.articles.map(a=>`/articles/${a.slug}/`)];
const seenLinks=new Set();
for(const path of publicPages){
 const response=await request(path);assert.equal(response.status,200,path);
 const document=await response.text();
 assert.ok(document.includes('content="index,follow,max-image-preview:large"'),path);
 assert.ok(document.includes(`rel="canonical" href="${env.PUBLIC_ORIGIN}${path}"`),path);
 assert.equal(response.headers.get("x-robots-tag"),null,path);
 assert.equal((document.match(/We may earn a commission from bookings/g)||[]).length,1,path+": footer disclosure appears once");
 const beforeFooter=document.split('<footer class="site-footer">')[0];
 assert.ok(!/we may earn|earn us a commission|ad-label|Advertisement|How we fund our guides|href="\/account/i.test(beforeFooter),path+": removed public labels and accounts");
 assert.ok(!document.includes("Booking.com module reserved"));
 assert.ok(!document.includes('src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"'),"partner script must be deferred by client");
 for(const match of document.matchAll(/href="([^"]+)"/g)){
  const href=match[1].replaceAll("&amp;","&");
  if(href.startsWith("/")&&!href.startsWith("//"))seenLinks.add(new URL(href,env.PUBLIC_ORIGIN).pathname);
  if(href.startsWith("#")&&href.length>1)assert.ok(document.includes(`id="${href.slice(1)}"`),`${path}: missing anchor ${href}`);
 }
 if(path.startsWith("/articles/")){
  const schema=JSON.parse(document.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema[0]["@type"],"BlogPosting");assert.equal(schema[1]["@type"],"BreadcrumbList");
  assert.ok(schema[0].datePublished&&schema[0].dateModified&&schema[0].image);
  assert.equal(schema[0].mainEntityOfPage["@id"],env.PUBLIC_ORIGIN+path);
 }
}
for(const path of seenLinks){if(!path.startsWith("/signin-with-chatgpt")&&!path.startsWith("/signout-with-chatgpt"))assert.ok((await request(path)).status<400,`broken reader link: ${path}`);}
const hotelsHtml=await (await request("/articles/michelin-hotels-cappadocia/")).text();
assert.equal((hotelsHtml.match(/class="directory-card"/g)||[]).length,18);
assert.ok(hotelsHtml.includes("2 MICHELIN Keys")&&hotelsHtml.includes("1 MICHELIN Key"));
const fullSitemap=await (await request("/sitemap.xml")).text();
assert.equal((fullSitemap.match(/<loc>/g)||[]).length,68);
assert.ok(!fullSitemap.includes("/admin")&&!fullSitemap.includes("/account"));
assert.ok(fullSitemap.includes(`${env.PUBLIC_ORIGIN}/articles/michelin-hotels-cappadocia/`));
const robots=await (await request("/robots.txt")).text();assert.ok(robots.includes("Allow: /")&&robots.includes("Disallow: /admin")&&robots.includes(env.PUBLIC_ORIGIN+"/sitemap.xml"));
assert.ok((await (await request("/guides/?category=Food")).text()).includes('content="noindex,nofollow"'));
assert.equal((await request("/guides")).status,308);
assert.equal((await request("/",undefined,{method:"HEAD"})).status,200);
assert.equal(await (await request("/",undefined,{method:"HEAD"})).text(),"");
const canonicalTest=await worker.fetch(new Request("https://cms.example.test/guides/"),{...env,CANONICAL_ORIGIN:"https://cappadociablog.com",CUSTOM_DOMAIN_STATUS:"active"},{});
assert.equal(canonicalTest.status,308);assert.equal(canonicalTest.headers.get("location"),"https://cappadociablog.com/guides/");
for(const key of Object.keys(experiences))assert.equal(new URL(trackedUrl(key,"test").href).searchParams.get("partner_id"),"GTS1OZ5");
assert.deepEqual(selectExperiences(site.articles.find(a=>a.slug==="cappadocia-cooking-class-guide")),["cooking"]);
assert.deepEqual(selectExperiences(site.articles.find(a=>a.slug==="avanos-pottery-guide")),["pottery"]);
assert.deepEqual(selectExperiences(site.articles.find(a=>a.slug==="cappadocia-hamam-guide")),["hamam"]);
const metric=(payload,origin=env.PUBLIC_ORIGIN,ua="Mozilla/5.0")=>request("/api/metrics",undefined,{method:"POST",headers:{"content-type":"application/json",origin,"user-agent":ua},body:JSON.stringify(payload)});
assert.equal((await metric({kind:"view",path:"/",source:"google"},"https://evil.example.test")).status,403);
assert.equal((await metric({kind:"view",path:"/admin/",source:"google"})).status,400);
assert.equal((await metric({kind:"affiliate",path:"/",product:"fake"})).status,400);
assert.equal((await metric({kind:"vital",path:"/",metric:"CLS",value:-1})).status,400);
assert.equal((await metric({kind:"view",path:"/",source:"google"},env.PUBLIC_ORIGIN,"Googlebot")).status,204);
assert.equal((await metric({kind:"view",path:"/",source:"google"})).status,204);
assert.equal((await metric({kind:"affiliate",path:"/",product:"409126"})).status,204);
assert.equal((await metric({kind:"vital",path:"/",metric:"LCP",value:2000})).status,204);
const measured=await (await request("/api/admin/seo","owner")).json();
assert.equal(measured.report.pageviews,1);assert.equal(measured.report.searchReferrals,1);assert.equal(measured.report.clicks,1);assert.equal(measured.report.vitals[0].p75Band,"good");
const seoWrite=(googleVerification,csrf=token)=>request("/api/admin/seo","owner",{method:"PUT",headers:{"content-type":"application/json",origin:env.PUBLIC_ORIGIN,"x-csrf-token":csrf},body:JSON.stringify({googleVerification})});
assert.equal((await seoWrite("Verification_token_123","bad")).status,403);
assert.equal((await seoWrite('<script>alert(1)</script>')).status,400);
assert.equal((await seoWrite("Verification_token_123")).status,200);
assert.ok((await (await request("/")).text()).includes('name="google-site-verification" content="Verification_token_123"'));
const slug=site.articles[0].slug;
const draft=structuredClone(site.articles[0]);draft.title="CMS TEST TITLE";draft.intro='<script>alert("xss")</script>';
const write=(article,revision,action,origin="https://cms.example.test",csrf=token)=>request(`/api/admin/articles/${article.slug}`,"owner",{method:"PUT",headers:{"content-type":"application/json","origin":origin,"x-csrf-token":csrf},body:JSON.stringify({article,revision,action})});
assert.equal((await write(draft,0,"draft","https://evil.example.test")).status,403);
assert.equal((await write(draft,0,"draft",env.PUBLIC_ORIGIN,"bad")).status,403);
const saved=await (await write(draft,0,"draft")).json();assert.equal(saved.revision,1);assert.equal(saved.status,"published");
assert.ok(!(await (await request(`/articles/${slug}/`)).text()).includes("CMS TEST TITLE"));
assert.ok((await (await request(`/admin/preview/${slug}/`,"owner")).text()).includes("CMS TEST TITLE"));
assert.equal((await write(draft,0,"publish")).status,409);
const published=await (await write(draft,1,"publish")).json();assert.equal(published.revision,2);
const publicHtml=await (await request(`/articles/${slug}/`)).text();
assert.ok(publicHtml.includes("CMS TEST TITLE"));assert.ok(!publicHtml.includes('<script>alert("xss")</script>'));assert.ok(publicHtml.includes("&lt;script&gt;"));
assert.equal((await write(draft,2,"unpublish")).status,200);
assert.equal((await request(`/articles/${slug}/`)).status,404);
assert.ok(!(await (await request("/sitemap.xml")).text()).includes(`/articles/${slug}/`));
assert.equal((await request(`/api/admin/articles/${slug}`,"reader")).status,403);
const fresh={...structuredClone(draft),slug:"new-cms-article"};
assert.equal((await write(fresh,0,"draft")).status,200);
assert.equal((await request("/articles/new-cms-article/")).status,404);
assert.ok(!(await (await request("/sitemap.xml")).text()).includes("/articles/new-cms-article/"));
assert.equal((await write(fresh,1,"publish")).status,200);
assert.equal((await request("/articles/new-cms-article/")).status,200);
const record=await (await request(`/api/admin/articles/${slug}`,"owner")).json();assert.equal(record.history.length,3);
assert.equal((await request("/account/","reader")).status,301);
assert.equal((await request("/account/")).headers.get("location"),env.PUBLIC_ORIGIN+"/");
for(const method of ["GET","POST","PUT","DELETE"])assert.equal((await request("/api/account","reader",{method})).status,410);
assert.equal((await (await request("/api/admin/members","owner")).json()).total,0);
assert.equal((await request("/api/admin/members","reader")).status,403);
const retired=await request("/affiliate-disclosure/");assert.equal(retired.status,301);assert.equal(retired.headers.get("location"),env.PUBLIC_ORIGIN+"/#affiliate-disclosure");
assert.equal(visitorMarkets.length,20);assert.equal(new Set(visitorMarkets.map(m=>m.country)).size,20);
assert.deepEqual(visitorMarkets.map(m=>m.country),[...visitorMarkets.map(m=>m.country)].sort());
assert.ok(visitorMarkets.every(m=>['rank','arrivals','share','annualRank','annualArrivals','annualShare'].every(k=>!(k in m))));
assert.ok(marketEvidence.note.includes('not a visitor ranking'));
assert.ok(visitorMarkets.some(m=>m.country==='Brazil')&&visitorMarkets.some(m=>m.country==='China'));
assert.ok(!visitorMarkets.some(m=>['Bulgaria','Iran','Georgia'].includes(m.country)));
assert.equal(directRoutes.filter(r=>r.days).length,6);
assert.ok(referenceFor("FRA","ASR","2026-10-07").startsWith("This weekday appears"));
assert.ok(referenceFor("FRA","ASR","2026-10-08").startsWith("This weekday is not"));
assert.ok(referenceFor("FRA","ASR","2027-04-07").includes("outside"));
assert.ok(referenceFor("FRA","NAV","2026-10-07").includes("No regular European"));
assert.ok(referenceFor("STN","ASR","2026-10-07").includes("summer 2026"));
const leap=monthGrid(2028,1);assert.equal(leap.filter(Boolean).length,29);assert.ok(leap.includes("2028-02-29"));assert.equal(monthGrid(2026,11).filter(Boolean).length,31);
const flightUrl=new URL(flightSearch("New York JFK","NAV","2026-10-20","2026-10-25"));assert.equal(flightUrl.hostname,"www.google.com");assert.ok(flightUrl.searchParams.get("q").includes("Nevsehir NAV"));
const calendar=arrivalCalendar({arrival:"2026-10-20",departure:"2026-10-25",airport:"NAV",returnAirport:"ASR",flight:"TK 2006",returnFlight:"PC 2733",hotel:"Hotel, Goreme; test\nBEGIN:VEVENT"});
assert.equal((calendar.match(/BEGIN:VEVENT/g)||[]).length,3); // escaped hotel text remains within DESCRIPTION
assert.equal(calendar.split("\r\n").filter(l=>l==="BEGIN:VEVENT").length,2);
assert.ok(calendar.includes("DTSTART;VALUE=DATE:20261020")&&calendar.includes("DTSTART;VALUE=DATE:20261025"));assert.ok(calendar.includes("Departure from ASR"));
const arrivalHtml=await (await request("/getting-there/")).text();assert.ok(arrivalHtml.includes('id="flight-planner"')&&arrivalHtml.includes('name="flight" required')&&arrivalHtml.includes('id="transfer-checklist"'));assert.ok(arrivalHtml.includes('alphabetical list'));assert.ok(arrivalHtml.includes('not a ranking of visitor volumes'));assert.ok(!arrivalHtml.includes('January–May 2026'));assert.ok(arrivalHtml.includes('data-market-country="China"'));assert.ok(!arrivalHtml.includes('border-arrival'));assert.ok(!arrivalHtml.includes('2025 Türkiye'));assert.ok(!arrivalHtml.includes('libfile_'));assert.ok(arrivalHtml.includes('value="ICN"')&&arrivalHtml.includes('value="GRU"'));assert.ok(arrivalHtml.includes('id="market-20"'));
for(const path of ["/","/guides/","/about/","/advertise/","/getting-there/","/privacy/","/terms/","/styles.css","/admin.css","/admin.js","/favicon.svg","/assets/cappadocia-sunrise.webp","/sitemap.xml"]){assert.equal((await request(path)).status,200,path);}
const otherId=new Request("https://cms.example.test/admin/",{headers:{"oai-authenticated-user-id":"different-id","oai-authenticated-user-email":"owner@example.test"}});
assert.equal((await worker.fetch(otherId,env,{})).status,403);
console.log(`${site.name}: 55 guides, arrival planning, 8 hubs, all reader links, schema, canonical/robots/sitemap, private SEO controls, real aggregate metrics, auth, CSRF, draft separation, publication conflicts, XSS, retired membership, travel calendars and route-reference checks passed.`);
