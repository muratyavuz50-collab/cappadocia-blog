import assets from "site-assets";
import { site as seedSite } from "./content.mjs";
import { createRenderer } from "./render.mjs";
import { gettingTherePage } from "./getting-there.mjs";
import { faqPage } from "./faq-pages.mjs";
import { adminPage } from "./admin-pages.mjs";
import { HttpError, database, authenticatedUser, administrator, rows, combineArticles, articleList, saveArticle, csrfToken, assertWrite } from "./db.mjs";
import { topicHubs,topicArticles } from "./editorial.mjs";
import { recordMetric,analyticsReport,siteSettings,saveSettings,publicPaths } from "./analytics.mjs";
import { businessShortlist } from "./business-guides.mjs";
import { absoluteUrl,brandedTitle,latestIsoDate,xmlEscape } from "./seo-helpers.mjs";
import { faqReviewed } from "./faq-data.mjs";
import {localizedResponse,sitemapAlternates} from "./localization/runtime.mjs";
import {languages,localePath} from "./localization/engine.mjs";

const signIn=(path)=>`/signin-with-chatgpt?return_to=${encodeURIComponent(path)}`;
const securityHeaders={"x-content-type-options":"nosniff","referrer-policy":"strict-origin-when-cross-origin","permissions-policy":"camera=(), microphone=(), geolocation=()"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...securityHeaders,"cache-control":"no-store","content-type":"application/json; charset=utf-8"}});
const html=(body,status=200,secure=false)=>new Response(body,{status,headers:{...securityHeaders,"cache-control":secure||status>=400?"no-store":"public, max-age=0, s-maxage=300, stale-while-revalidate=86400","content-type":"text/html; charset=utf-8",...(secure||status>=400?{"x-robots-tag":"noindex, nofollow"}:{}),...(secure?{"content-security-policy":"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}: {})}});
const productionOrigin="https://www.cappadociablog.com";
function canonicalOrigin(env){
  try{
    const u=new URL(env.CANONICAL_ORIGIN||env.PUBLIC_ORIGIN||productionOrigin);
    if(u.protocol!=="https:")return productionOrigin;
    if(u.hostname==="cappadociablog.com"||u.hostname==="www.cappadociablog.com")return productionOrigin;
    return u.origin;
  }catch{return productionOrigin;}
}

async function body(request){
  if(!request.headers.get("content-type")?.startsWith("application/json"))throw new HttpError(415,"JSON içerik bekleniyor.");
  if(Number(request.headers.get("content-length"))>180000)throw new HttpError(413,"Yazı çok büyük.");
  const text=await request.text();
  if(text.length>180000)throw new HttpError(413,"Yazı çok büyük.");
  try{return JSON.parse(text);}catch{throw new HttpError(400,"İstek okunamadı.");}
}

async function handle(request,env){
  const url=new URL(request.url);
  const path=url.pathname.replace(/\/$/,"") || "/";
  if(assets[url.pathname]){
    const asset=assets[url.pathname];
    const bytes=Uint8Array.from(atob(asset.base64),(char)=>char.charCodeAt(0));
    return new Response(request.method==="HEAD"?null:bytes,{headers:{"content-type":asset.type,"cache-control":"public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800","x-content-type-options":"nosniff"}});
  }
  if(path.startsWith("/api/admin")){
    const user=await administrator(request,env);
    const db=database(env);
    if(path==="/api/admin/seo"&&request.method==="GET")return json({report:await analyticsReport(env),settings:await siteSettings(env),origin:canonicalOrigin(env),sitemap:canonicalOrigin(env)+"/sitemap.xml",publishedArticles:combineArticles(seedSite.articles,await rows(env)).length,topicCount:topicHubs.length,businessShortlist,domainStatus:env.CUSTOM_DOMAIN_STATUS||"pending"});
    if(path==="/api/admin/seo"&&request.method==="PUT"){await assertWrite(request,env,user);return json(await saveSettings(env,await body(request)));}
    if(path==="/api/admin/articles" && request.method==="GET"){
      return json({articles:articleList(seedSite.articles,await rows(env))});
    }
    if(path==="/api/admin/members" && request.method==="GET"){
      const members=await db.prepare("SELECT email, name, joined_at FROM members ORDER BY joined_at DESC LIMIT 500").all();
      const total=await db.prepare("SELECT COUNT(*) AS count FROM members").first();
      return json({members:members.results || [],total:total.count});
    }
    const match=path.match(/^\/api\/admin\/articles\/([a-z0-9-]+)$/);
    if(match){
      const slug=match[1];
      if(request.method==="GET"){
        const record=await db.prepare("SELECT * FROM articles WHERE slug = ?").bind(slug).first();
        const article=record?JSON.parse(record.draft_json):seedSite.articles.find((a)=>a.slug===slug);
        if(!article)throw new HttpError(404,"Yazı bulunamadı.");
        const history=await db.prepare("SELECT action, revision, saved_at FROM article_revisions WHERE slug = ? ORDER BY saved_at DESC LIMIT 10").bind(slug).all();
        return json({article,revision:record?.revision || 0,status:record?.status || "published",hasDraft:Boolean(record && record.published_json!==record.draft_json),history:history.results || []});
      }
      if(request.method==="PUT"){
        await assertWrite(request,env,user);
        const input=await body(request);
        return json(await saveArticle(env,seedSite.articles,user,slug,input.article,input.revision,input.action));
      }
    }
    throw new HttpError(404,"İşlem bulunamadı.");
  }
  if(path==="/api/account")throw new HttpError(410,"Reader membership has been retired.");
  if(path==="/account")return Response.redirect(new URL("/",url),301);
  if(path==="/affiliate-disclosure")return Response.redirect(new URL("/#affiliate-disclosure",url),301);
  if(path==="/admin"){
    if(!authenticatedUser(request))return Response.redirect(new URL(signIn("/admin/"),url),302);
    const user=await administrator(request,env);
    return html(adminPage(seedSite,user,await csrfToken(env,user),url.searchParams.get("view")||"articles"),200,true);
  }
  const preview=path.match(/^\/admin\/preview\/([a-z0-9-]+)$/);
  if(preview){
    await administrator(request,env);
    const record=await database(env).prepare("SELECT draft_json FROM articles WHERE slug = ?").bind(preview[1]).first();
    const article=record?JSON.parse(record.draft_json):seedSite.articles.find((a)=>a.slug===preview[1]);
    if(!article)throw new HttpError(404,"Yazı bulunamadı.");
    const renderer=createRenderer(seedSite);
    const banner='<div class="draft-banner">Taslak önizlemesi · Bu sürüm okuyuculara gösterilmez. <a href="/admin/">Yönetim paneline dön</a></div>';
    return html(renderer.layout({title:`Taslak: ${article.title}`,description:article.dek,body:banner+renderer.articlePage(article),noindex:true,nofollow:true,canonicalize:false,structuredData:false}),200);
  }
  if(path==="/api/metrics")return recordMetric(request,env,{...seedSite,articles:combineArticles(seedSite.articles,await rows(env))});
  if(request.method!=="GET" && request.method!=="HEAD")throw new HttpError(405,"Method not allowed.");
  const records=await rows(env);
  const settings=await siteSettings(env);
  const site={...seedSite,domain:canonicalOrigin(env),googleVerification:settings.googleVerification,articles:combineArticles(seedSite.articles,records)};
  const r=createRenderer(site);
  const crawlHeaders={...securityHeaders,"cache-control":"public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"};
  if(path==="/robots.txt")return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /api/\nDisallow: /signin-with-chatgpt\nDisallow: /signout-with-chatgpt\nSitemap: ${site.domain}/sitemap.xml\nSitemap: ${site.domain}/feed.xml\n`,{headers:{...crawlHeaders,"content-type":"text/plain; charset=utf-8"}});
  if(path==="/sitemap.xml"){
    const articleDates=site.articles.map(a=>a.updatedAt||a.datePublished);
    const siteLastmod=latestIsoDate(articleDates);
    const faqLastmod=new Date(faqReviewed).toISOString();
    const staticEntries=[
      {path:"/",lastmod:siteLastmod},{path:"/guides/",lastmod:siteLastmod},{path:"/faq/",lastmod:faqLastmod},{path:"/about/"},{path:"/getting-there/",lastmod:"2026-10-07T09:00:00.000Z"},{path:"/advertise/"},{path:"/privacy/"},{path:"/terms/"},
      ...topicHubs.map(h=>({path:`/topics/${h.slug}/`,lastmod:latestIsoDate(topicArticles(site,h).map(a=>a.updatedAt||a.datePublished))}))
    ];
    // Image sitemaps may contain off-domain image URLs. Include every editorial hero and supporting image;
    // Search Console verification of the remote host is encouraged by Google, but is not a prerequisite.
    const articleEntries=site.articles.map(article=>({path:r.articleUrl(article),lastmod:article.updatedAt||article.datePublished,images:r.imagesFor(article)}));
    const entries=[...staticEntries,...articleEntries];
    const body=entries.flatMap(({path:entryPath,lastmod,images=[]})=>languages.map(lang=>`<url><loc>${xmlEscape(site.domain+localePath(entryPath,lang))}</loc>${lastmod?`<lastmod>${xmlEscape(lastmod)}</lastmod>`:""}${sitemapAlternates(site.domain,entryPath,xmlEscape)}${images.map(image=>`<image:image><image:loc>${xmlEscape(absoluteUrl(site.domain,image.src))}</image:loc></image:image>`).join("")}</url>`)).join("");
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`,{headers:{...crawlHeaders,"content-type":"application/xml; charset=utf-8"}});
  }
  if(path==="/feed.xml"){
    const articles=[...site.articles].sort((a,b)=>new Date(b.updatedAt||b.datePublished)-new Date(a.updatedAt||a.datePublished)).slice(0,50);
    const items=articles.map(article=>{const link=site.domain+r.articleUrl(article);return `<item><title>${xmlEscape(article.title)}</title><link>${xmlEscape(link)}</link><guid isPermaLink="true">${xmlEscape(link)}</guid><pubDate>${new Date(article.datePublished||article.updatedAt).toUTCString()}</pubDate><category>${xmlEscape(article.category)}</category><description>${xmlEscape(article.metaDescription||article.dek)}</description></item>`;}).join("");
    const buildDate=latestIsoDate(articles.map(a=>a.updatedAt||a.datePublished));
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xmlEscape(site.name)}</title><link>${xmlEscape(site.domain+"/")}</link><description>${xmlEscape(site.description)}</description><language>en</language><atom:link href="${xmlEscape(site.domain+"/feed.xml")}" rel="self" type="application/rss+xml"/>${buildDate?`<lastBuildDate>${new Date(buildDate).toUTCString()}</lastBuildDate>`:""}${items}</channel></rss>`,{headers:{...crawlHeaders,"content-type":"application/rss+xml; charset=utf-8"}});
  }
  if(path==="/site-manifest.json")return json({name:site.name,publishedArticles:site.articles.length});
  const fullPath=path==="/"?"/":path+"/";
  if(publicPaths(site).has(fullPath)&&(url.pathname!==fullPath||(url.origin!==site.domain&&env.CUSTOM_DOMAIN_STATUS==="active"))){
    const target=new URL(request.url);
    if(env.CUSTOM_DOMAIN_STATUS==="active"){const canonical=new URL(site.domain);target.protocol=canonical.protocol;target.host=canonical.host;}
    target.pathname=fullPath;
    return Response.redirect(target,308);
  }
  let output;
  if(path==="/")output={title:"Cappadocia Travel Guide: Plan Your Trip | CappadociaBlog",description:site.description,body:site.variant==="practical"?r.practicalHome():r.editorialHome(),active:"Home"};
  if(path==="/guides")output={title:"Cappadocia Travel Guides | CappadociaBlog",description:site.guidesIntro,body:r.guidesPage(),path:"/guides/",noindex:url.searchParams.has("q")||url.searchParams.has("category")};
  if(path==="/getting-there")output={title:"Getting to Cappadocia: Flights & Transfers | CappadociaBlog",description:"European flights to Kayseri, Istanbul connections to ASR and NAV, an arrival calendar, airport transfers and car rental planning for Cappadocia.",body:gettingTherePage(),path:"/getting-there/",active:"Getting There"};
  if(path==="/faq")output={title:"Cappadocia FAQ: 500 Travel Questions | CappadociaBlog",description:"500 Cappadocia questions answered: balloons, airports, transfers, hotels, museums, valley walks, food, families and practical travel planning.",body:faqPage(),path:"/faq/",active:"FAQ"};
  const articleMatch=path.match(/^\/articles\/([a-z0-9-]+)$/);
  if(articleMatch){const article=site.articles.find((a)=>a.slug===articleMatch[1]);if(article)output={title:article.seoTitle||brandedTitle(article.title),description:article.metaDescription||article.dek,body:r.articlePage(article),path:r.articleUrl(article),type:"article",article};}
  const topicMatch=path.match(/^\/topics\/([a-z0-9-]+)$/);
  if(topicMatch){const hub=topicHubs.find(h=>h.slug===topicMatch[1]);if(hub)output={title:brandedTitle(hub.title),description:hub.description,body:r.topicPage(hub),path:`/topics/${hub.slug}/`};}
  const simple={"/about":"about","/advertise":"advertise","/privacy":"privacy","/terms":"terms"};
  if(simple[path]){const titles={about:"About CappadociaBlog",advertise:"Advertise With CappadociaBlog",privacy:"Privacy Policy",terms:"Terms of Use"};const descriptions={about:"Meet the CappadociaBlog Editorial Desk and read our standards for sourcing, corrections, commercial transparency and independent travel guidance.",advertise:"Explore transparent advertising and partnership formats for Cappadocia hotels, restaurants, experiences and regional brands.",privacy:"Read how CappadociaBlog handles aggregate site measurement, external booking services, travel-planner data and protected editorial records.",terms:"Read the terms for using CappadociaBlog travel guidance, external booking links and information about changing conditions in Cappadocia."};output={title:brandedTitle(titles[simple[path]]),description:descriptions[simple[path]],body:r.simplePage(simple[path]),path:`${path}/`};}
  if(!output)return html(r.layout({title:`Page not found | ${site.name}`,description:"This page is unavailable.",noindex:true,nofollow:true,canonicalize:false,structuredData:false,body:'<section class="page-hero"><div class="shell"><h1>This guide is not available.</h1><p>It may have moved or been unpublished.</p><a class="button button-green" href="/guides/">Browse published guides</a></div></section>'}),404);
  return html(r.layout(output));
}

export default {
  async fetch(request,env) {
    try{
      const response=await localizedResponse(request,env,handle,canonicalOrigin);
      const privatePath=/^\/(admin|account|api)(\/|$)/.test(new URL(request.url).pathname);
      if(privatePath||request.method==="HEAD"){
        const responseHeaders=new Headers(response.headers);
        if(privatePath)responseHeaders.set("x-robots-tag","noindex, nofollow");
        return new Response(request.method==="HEAD"?null:response.body,{status:response.status,headers:responseHeaders});
      }
      return response;
    }
    catch(error){
      const status=error instanceof HttpError?error.status:503;
      const message=error instanceof HttpError?error.message:"Bu bölüm geçici olarak kullanılamıyor. Lütfen yeniden deneyin.";
      if(!(error instanceof HttpError))console.error("CMS request failed",error?.name);
      if(new URL(request.url).pathname.startsWith("/api/"))return json({error:message},status);
      const r=createRenderer(seedSite);
      return html(r.layout({title:"Access / service notice",description:message,noindex:true,nofollow:true,canonicalize:false,structuredData:false,body:`<section class="page-hero"><div class="shell"><h1>${status===403?"Yetkisiz erişim":"İşlem tamamlanamadı"}</h1><p>${r.escapeHtml(message)}</p><a class="button button-green" href="/">Ana sayfaya dön</a></div></section>`}),status);
    }
  }
};
