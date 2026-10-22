import { database,HttpError } from "./db.mjs";
import { topicHubs } from "./editorial.mjs";
import { experiences } from "./experiences.mjs";
import {barePath} from './localization/engine.mjs';
export const publicPaths=site=>new Set(["/","/getting-there/","/guides/","/faq/","/about/","/advertise/","/privacy/","/terms/",...topicHubs.map(h=>`/topics/${h.slug}/`),...site.articles.map(a=>`/articles/${a.slug}/`)]);
const sourceNames=new Set(["direct","google","bing","social","referral","internal"]);
const products=new Set(["browse",...Object.values(experiences).map(p=>p.id)]);
export async function recordMetric(request,env,site){
 if(request.method!=="POST")throw new HttpError(405,"Method not allowed.");
 if(request.headers.get("origin")!==new URL(request.url).origin)throw new HttpError(403,"Invalid measurement origin.");
 if(!request.headers.get("content-type")?.startsWith("application/json"))throw new HttpError(415,"JSON required.");
 const text=await request.text();if(text.length>1500)throw new HttpError(413,"Measurement too large.");
 let input;try{input=JSON.parse(text);}catch{throw new HttpError(400,"Invalid measurement.");}
 if(!input||typeof input.path!=='string'||!publicPaths(site).has(barePath(input.path)))throw new HttpError(400,"Unknown public page.");
 if(/bot|crawler|spider|headless/i.test(request.headers.get("user-agent")||""))return new Response(null,{status:204});
 let label="",bucket="",source="";
 if(input.kind==="view"){
  if(!sourceNames.has(input.source))throw new HttpError(400,"Invalid source.");source=input.source;
 }else if(input.kind==="affiliate"){
  if(!products.has(input.product))throw new HttpError(400,"Unknown product.");label=input.product;
 }else if(input.kind==="vital"){
  if(!["LCP","CLS","INP"].includes(input.metric)||!Number.isFinite(input.value)||input.value<0||input.value>180000)throw new HttpError(400,"Invalid performance measurement.");
  label=input.metric;const thresholds={LCP:[2500,4000],CLS:[0.1,0.25],INP:[200,500]}[label];
  bucket=input.value<=thresholds[0]?"good":input.value<=thresholds[1]?"needs-improvement":"poor";
 }else throw new HttpError(400,"Invalid measurement kind.");
 const day=new Date().toISOString().slice(0,10);
 const db=database(env),cutoff=new Date(Date.now()-90*86400000).toISOString().slice(0,10);
 await db.batch([db.prepare("INSERT INTO site_metrics (day,kind,path,source,label,bucket,count) VALUES (?,?,?,?,?,?,1) ON CONFLICT(day,kind,path,source,label,bucket) DO UPDATE SET count=count+1").bind(day,input.kind,input.path,source,label,bucket),db.prepare("DELETE FROM site_metrics WHERE day < ?").bind(cutoff)]);
 return new Response(null,{status:204,headers:{"cache-control":"no-store"}});
}
export async function siteSettings(env){const result=await database(env).prepare("SELECT key,value FROM site_settings").all();return Object.fromEntries((result.results||[]).map(r=>[r.key,r.value]));}
export async function saveSettings(env,input){
 const verification=String(input.googleVerification||"").trim();
 if(verification&&!/^[a-zA-Z0-9_-]{10,200}$/.test(verification))throw new HttpError(400,"Google doğrulama alanına yalnızca meta etiketinin content değerini girin.");
 await database(env).prepare("INSERT INTO site_settings (key,value) VALUES ('googleVerification',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(verification).run();
 return {ok:true};
}
export async function analyticsReport(env){
 const cutoff=new Date(Date.now()-29*86400000).toISOString().slice(0,10);
 const results=await database(env).prepare("SELECT day,kind,path,source,label,bucket,count FROM site_metrics WHERE day>=? ORDER BY day DESC").bind(cutoff).all();
 const entries=results.results||[];
 const pageviews=entries.filter(e=>e.kind==="view").reduce((n,e)=>n+e.count,0);
 const clicks=entries.filter(e=>e.kind==="affiliate").reduce((n,e)=>n+e.count,0);
 const searchReferrals=entries.filter(e=>e.kind==="view"&&["google","bing"].includes(e.source)).reduce((n,e)=>n+e.count,0);
 const pages=new Map();for(const e of entries){if(!pages.has(e.path))pages.set(e.path,{path:e.path,views:0,search:0,clicks:0});const p=pages.get(e.path);if(e.kind==="view"){p.views+=e.count;if(["google","bing"].includes(e.source))p.search+=e.count;}if(e.kind==="affiliate")p.clicks+=e.count;}
 const vitals=["LCP","CLS","INP"].map(metric=>{
  const counts=Object.fromEntries(["good","needs-improvement","poor"].map(b=>[b,entries.filter(e=>e.kind==="vital"&&e.label===metric&&e.bucket===b).reduce((n,e)=>n+e.count,0)]));
  const total=Object.values(counts).reduce((a,b)=>a+b,0);
  return {metric,total,counts,p75Band:total?(counts.good/total>=.75?"good":(counts.good+counts["needs-improvement"])/total>=.75?"needs-improvement":"poor"):null};
 });
 return {since:cutoff,pageviews,clicks,searchReferrals,pages:[...pages.values()].sort((a,b)=>b.views-a.views).slice(0,30),vitals,updatedAt:new Date().toISOString()};
}
