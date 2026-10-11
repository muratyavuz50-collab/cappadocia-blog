import assets from "site-assets";
import { site as seedSite } from "./content.mjs";
import { createRenderer } from "./render.mjs";
import { gettingTherePage } from "./getting-there.mjs";
import { faqPage } from "./faq-pages.mjs";
import { adminPage } from "./admin-pages.mjs";
import { HttpError, database, authenticatedUser, administrator, rows, combineArticles, articleList, saveArticle, csrfToken, assertWrite } from "./db.mjs";
import { topicHubs } from "./editorial.mjs";
import { recordMetric,analyticsReport,siteSettings,saveSettings,publicPaths } from "./analytics.mjs";
import { businessShortlist } from "./business-guides.mjs";

const signIn=(path)=>`/signin-with-chatgpt?return_to=${encodeURIComponent(path)}`;
const headers={"cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"strict-origin-when-cross-origin","permissions-policy":"camera=(), microphone=(), geolocation=()"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,"content-type":"application/json; charset=utf-8"}});
const html=(body,status=200,secure=false)=>new Response(body,{status,headers:{...headers,"content-type":"text/html; charset=utf-8",...(secure||status>=400?{"x-robots-tag":"noindex, nofollow"}:{}),...(secure?{"content-security-policy":"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}: {})}});
function canonicalOrigin(env){try{const u=new URL(env.CANONICAL_ORIGIN||env.PUBLIC_ORIGIN||"https://cappadocia-blog.kelebek-grou-7963.chatgpt.site");if(u.protocol==="https:")return u.origin;}catch{}return "https://cappadocia-blog.kelebek-grou-7963.chatgpt.site";}

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
    return new Response(request.method==="HEAD"?null:bytes,{headers:{"content-type":asset.type,"cache-control":"public, max-age=300","x-content-type-options":"nosniff"}});
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
    return html(renderer.layout({title:`Taslak: ${article.title}`,description:article.dek,body:banner+renderer.articlePage(article),noindex:true}),200);
  }
  if(path==="/api/metrics")return recordMetric(request,env,{...seedSite,articles:combineArticles(seedSite.articles,await rows(env))});
  if(request.method!=="GET" && request.method!=="HEAD")throw new HttpError(405,"Method not allowed.");
  const records=await rows(env);
  const settings=await siteSettings(env);
  const site={...seedSite,domain:canonicalOrigin(env),googleVerification:settings.googleVerification,articles:combineArticles(seedSite.articles,records)};
  const r=createRenderer(site);
  if(path==="/robots.txt")return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /api/\nDisallow: /signin-with-chatgpt\nDisallow: /signout-with-chatgpt\nSitemap: ${site.domain}/sitemap.xml\n`,{headers:{"content-type":"text/plain"}});
  if(path==="/sitemap.xml")return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/","/guides/","/faq/","/about/","/getting-there/",...topicHubs.map(h=>`/topics/${h.slug}/`),...site.articles.map((a)=>r.articleUrl(a))].map((p)=>{const article=site.articles.find(a=>r.articleUrl(a)===p);return `<url><loc>${site.domain}${p}</loc>${p==="/getting-there/"?"<lastmod>2026-10-07</lastmod>":""}${article?.updatedAt?`<lastmod>${r.escapeHtml(article.updatedAt)}</lastmod>`:""}</url>`;}).join("")}</urlset>`,{headers:{...headers,"content-type":"application/xml"}});
  if(path==="/site-manifest.json")return json({name:site.name,publishedArticles:site.articles.length});
  const fullPath=path==="/"?"/":path+"/";
  if(publicPaths(site).has(fullPath)&&url.pathname!==fullPath){const target=new URL(request.url);target.pathname=fullPath;return Response.redirect(target,308);}
  if(publicPaths(site).has(fullPath)&&new URL(request.url).origin!==site.domain&&env.CUSTOM_DOMAIN_STATUS==="active"){return Response.redirect(site.domain+url.pathname+url.search,308);}
  let output;
  if(path==="/")output={title:`${site.name} | ${site.tagline}`,description:site.description,body:site.variant==="practical"?r.practicalHome():r.editorialHome(),active:"Home"};
  if(path==="/guides")output={title:`${site.guideLabel} | ${site.name}`,description:site.guidesIntro,body:r.guidesPage(),path:"/guides/",noindex:url.searchParams.has("q")||url.searchParams.has("category")};
  if(path==="/getting-there")output={title:`Getting to Cappadocia: ASR / NAV Flights & Transfers | ${site.name}`,description:"European flights to Kayseri, Istanbul connections to ASR and NAV, an arrival calendar, airport transfers and car rental planning for Cappadocia.",body:gettingTherePage(),path:"/getting-there/",active:"Getting There"};
  if(path==="/faq")output={title:`Cappadocia FAQ: 500 Questions Answered | ${site.name}`,description:"500 Cappadocia questions answered: balloons, airports, transfers, hotels, museums, valley walks, food, families and practical travel planning.",body:faqPage(),path:"/faq/",active:"FAQ"};
  const articleMatch=path.match(/^\/articles\/([a-z0-9-]+)$/);
  if(articleMatch){const article=site.articles.find((a)=>a.slug===articleMatch[1]);if(article)output={title:article.seoTitle||`${article.title} | ${site.name}`,description:article.metaDescription||article.dek,body:r.articlePage(article),path:r.articleUrl(article),type:"article",article};}
  const topicMatch=path.match(/^\/topics\/([a-z0-9-]+)$/);
  if(topicMatch){const hub=topicHubs.find(h=>h.slug===topicMatch[1]);if(hub)output={title:`${hub.title} | ${site.name}`,description:hub.description,body:r.topicPage(hub),path:`/topics/${hub.slug}/`};}
  const simple={"/about":"about","/advertise":"advertise","/privacy":"privacy","/terms":"terms"};
  if(simple[path])output={title:`${simple[path]} | ${site.name}`,description:site.description,body:r.simplePage(simple[path]),path:`${path}/`};
  if(!output)return html(r.layout({title:`Page not found | ${site.name}`,description:"This page is unavailable.",noindex:true,body:'<section class="page-hero"><div class="shell"><h1>This guide is not available.</h1><p>It may have moved or been unpublished.</p><a class="button button-green" href="/guides/">Browse published guides</a></div></section>'}),404);
  return html(r.layout(output));
}

export default {
  async fetch(request,env) {
    try{
      const response=await handle(request,env);
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
      return html(r.layout({title:"Access / service notice",description:message,noindex:true,body:`<section class="page-hero"><div class="shell"><h1>${status===403?"Yetkisiz erişim":"İşlem tamamlanamadı"}</h1><p>${r.escapeHtml(message)}</p><a class="button button-green" href="/">Ana sayfaya dön</a></div></section>`}),status);
    }
  }
};
