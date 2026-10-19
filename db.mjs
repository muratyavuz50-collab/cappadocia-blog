import { readingMinutes } from "./editorial.mjs";
import { brandedTitle } from "./seo-helpers.mjs";
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function database(env) {
  if (!env.DB?.prepare) throw new HttpError(503, "İçerik veritabanı şu anda kullanılamıyor. Biraz sonra yeniden deneyin.");
  return env.DB;
}

export function authenticatedUser(request) {
  const id = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");
  if (!id || !email) return null;
  let name = email;
  if (request.headers.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8") {
    try { name = decodeURIComponent(request.headers.get("oai-authenticated-user-full-name") || email); } catch { /* fall back to email */ }
  }
  return { id, email, name };
}

export async function administrator(request, env) {
  const user = authenticatedUser(request);
  if (!user) throw new HttpError(401, "Giriş yapmanız gerekiyor.");
  const db = database(env);
  let owner = await db.prepare("SELECT user_id FROM administrators WHERE slot = ?").bind("owner").first();
  if (!owner && env.ADMIN_OWNER_EMAIL && user.email.toLowerCase() === env.ADMIN_OWNER_EMAIL.trim().toLowerCase()) {
    // One-time binding from the configured, platform-verified owner email to a stable Site user ID.
    // An ordinary visitor or the first registrant can never claim administrator access.
    await db.prepare("INSERT OR IGNORE INTO administrators (slot, user_id, bound_at) VALUES (?, ?, ?)")
      .bind("owner", user.id, new Date().toISOString()).run();
    owner = await db.prepare("SELECT user_id FROM administrators WHERE slot = ?").bind("owner").first();
  }
  if (!owner || owner.user_id !== user.id) throw new HttpError(403, "Bu bölüm yalnızca site yöneticisine açıktır.");
  return user;
}

export async function rows(env) {
  const result = await database(env).prepare("SELECT slug, draft_json, published_json, status, revision, updated_at FROM articles").all();
  return result.results || [];
}

export function combineArticles(seed, records, draft = false) {
  const merged = new Map(seed.map((a) => [a.slug, { ...a }]));
  for (const row of records) {
    const value = draft ? row.draft_json : (row.status === "published" ? row.published_json : null);
    if (value) merged.set(row.slug, { ...seed.find(a=>a.slug===row.slug), ...JSON.parse(value) });
    else merged.delete(row.slug);
  }
  return [...merged.values()].map(a=>({...a,readTime:readingMinutes(a)}));
}

export function articleList(seed, records) {
  const bySlug = new Map(records.map((r) => [r.slug,r]));
  const slugs = [...new Set([...seed.map((s) => s.slug),...records.map((r)=>r.slug)])];
  return slugs.map((slug) => {
    const row=bySlug.get(slug);
    const article=row?JSON.parse(row.draft_json):seed.find((s)=>s.slug===slug);
    return { slug, title: article.title, category:article.category, status:row?.status || "published",
      revision:row?.revision || 0, updatedAt:row?.updated_at || article.updatedAt || "2026-10-04T00:00:00Z",
      hasDraft: Boolean(row && row.published_json !== row.draft_json), featured:Boolean(article.featured) };
  });
}

function plain(value, max, required = false) {
  if (typeof value !== "string") throw new HttpError(400,"Lütfen metin alanlarını kontrol edin.");
  const text=value.trim();
  if (text.length>max || (required && !text)) throw new HttpError(400,"Bir alan boş veya izin verilen uzunluğu aşıyor.");
  return text;
}

export function validateArticle(input, slug) {
  if (!input || typeof input!=="object" || !Array.isArray(input.sections) || input.sections.length<1 || input.sections.length>30) throw new HttpError(400,"En az bir, en fazla 30 yazı bölümü ekleyin.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length>120) throw new HttpError(400,"Yazı adresi geçersiz.");
  const sections=input.sections.map((s)=>{
    if (!s || !Array.isArray(s.paragraphs) || s.paragraphs.length<1 || s.paragraphs.length>50) throw new HttpError(400,"Her bölümde en az bir paragraf olmalı.");
    return { heading:plain(s.heading,220,true), paragraphs:s.paragraphs.map((p)=>plain(p,12000,true)),
      list:Array.isArray(s.list) ? s.list.slice(0,40).map((i)=>plain(i,2000,true)) : [] };
  });
  const cmp=plain(input.cmp || "",160);
  if(cmp && !/^[a-zA-Z0-9_-]+$/.test(cmp)) throw new HttpError(400,"Takip kodunda yalnızca harf, rakam, alt çizgi ve tire kullanın.");
  const readTime=Number(input.readTime);
  if(!Number.isInteger(readTime)||readTime<1||readTime>120) throw new HttpError(400,"Okuma süresi 1–120 dakika arasında olmalı.");
  return { slug, title:plain(input.title,220,true), dek:plain(input.dek,600,true), category:plain(input.category,80,true),
    intro:plain(input.intro,12000,true), readTime, featured:Boolean(input.featured), cmp, sections,
    seoTitle:plain(input.seoTitle||"",220),metaDescription:plain(input.metaDescription||"",600),
    faq:Array.isArray(input.faq)&&input.faq.length ? input.faq.slice(0,12).map((pair)=>[plain(pair?.[0],300,true),plain(pair?.[1],5000,true)]) : undefined };
}

function normalizedSeo(value) { return value.trim().replace(/\s+/g," ").toLocaleLowerCase("en"); }
function publicationSeo(article) {
  return { title:(article.seoTitle||brandedTitle(article.title)).trim(),description:(article.metaDescription||article.dek).trim() };
}
async function assertPublicationSeo(env,seed,content,slug) {
  const candidate=publicationSeo(content);
  if(candidate.title.length<20||candidate.title.length>80)throw new HttpError(400,"Arama sonucu başlığı 20–80 karakter arasında olmalı.");
  if(candidate.description.length<50||candidate.description.length>200)throw new HttpError(400,"Arama sonucu açıklaması 50–200 karakter arasında olmalı.");
  const title=normalizedSeo(candidate.title),description=normalizedSeo(candidate.description);
  const published=combineArticles(seed,await rows(env)).filter((article)=>article.slug!==slug);
  if(published.some((article)=>normalizedSeo(publicationSeo(article).title)===title))throw new HttpError(400,"Bu arama sonucu başlığı başka bir yayında kullanılıyor.");
  if(published.some((article)=>normalizedSeo(publicationSeo(article).description)===description))throw new HttpError(400,"Bu arama sonucu açıklaması başka bir yayında kullanılıyor.");
}

export async function saveArticle(env, seed, user, slug, input, expectedRevision, action) {
  const db=database(env);
  if(!["draft","publish","unpublish"].includes(action)) throw new HttpError(400,"Geçersiz işlem.");
  const validated=validateArticle(input,slug);
  const existing=await db.prepare("SELECT * FROM articles WHERE slug = ?").bind(slug).first();
  if(Number(expectedRevision)!==(existing?.revision || 0)) throw new HttpError(409,"Bu yazı başka bir sekmede değişti. Çalışmanızı kopyalayıp sayfayı yenileyin.");
  const now=new Date().toISOString();
  const original=seed.find((a)=>a.slug===slug);
  const prior=existing?JSON.parse(existing.draft_json):original;
  const content={...prior,...validated,datePublished:prior?.datePublished||(action==="publish"?now:undefined)};
  content.updatedAt=now;
  content.readTime=readingMinutes(content);
  if(action==="publish")await assertPublicationSeo(env,seed,content,slug);
  const snapshot=JSON.stringify(content);
  let published=existing?.published_json ?? (original?JSON.stringify(original):null);
  let status=existing?.status || (original?"published":"draft");
  if(action==="publish"){published=snapshot;status="published";}
  if(action==="unpublish"){published=null;status="draft";}
  const revision=(existing?.revision || 0)+1;
  const statement=existing
    ? db.prepare("UPDATE articles SET draft_json = ?, published_json = ?, status = ?, revision = ?, updated_at = ?, updated_by = ? WHERE slug = ? AND revision = ?")
      .bind(snapshot,published,status,revision,now,user.id,slug,existing.revision)
    : db.prepare("INSERT OR IGNORE INTO articles (slug, draft_json, published_json, status, revision, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(slug,snapshot,published,status,revision,now,user.id);
  const results=await db.batch([
    statement,
    db.prepare("INSERT INTO article_revisions (id, slug, snapshot_json, action, revision, saved_at, saved_by) SELECT ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1")
      .bind(crypto.randomUUID(),slug,snapshot,action,revision,now,user.id)
  ]);
  if(results[0]?.meta?.changes!==1) throw new HttpError(409,"Yazı aynı anda değiştirildi. Kaydınız uygulanmadı; sayfayı yenileyin.");
  return { slug,revision,status,updatedAt:now,hasDraft:published!==snapshot };
}

function tokenBytes(text) { return new TextEncoder().encode(text); }
function hex(bytes){return Array.from(new Uint8Array(bytes)).map((b)=>b.toString(16).padStart(2,"0")).join("");}
async function hmac(secret,value){
  if(!secret || secret.length<32) throw new HttpError(503,"Güvenli kayıt yapılandırması henüz hazır değil.");
  const key=await crypto.subtle.importKey("raw",tokenBytes(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return hex(await crypto.subtle.sign("HMAC",key,tokenBytes(value)));
}
export async function csrfToken(env,user){
  const expiry=Math.floor(Date.now()/1000)+7200;
  return `${expiry}.${await hmac(env.CSRF_SECRET,`${user.id}:${expiry}`)}`;
}
export async function assertWrite(request,env,user){
  const origin=request.headers.get("origin");
  const allowed=[new URL(request.url).origin,env.PUBLIC_ORIGIN].filter(Boolean);
  if(!origin || !allowed.includes(origin)) throw new HttpError(403,"Kayıt isteğinin kaynağı doğrulanamadı.");
  const token=request.headers.get("x-csrf-token")||"";
  const [expiry,sig]=token.split(".");
  const n=Number(expiry);
  if(!n || n<Math.floor(Date.now()/1000) || n>Math.floor(Date.now()/1000)+7500) throw new HttpError(403,"Oturum süresi doldu. Çalışmanızı kopyalayıp sayfayı yenileyin.");
  const expected=await hmac(env.CSRF_SECRET,`${user.id}:${expiry}`);
  if(sig?.length!==expected.length)throw new HttpError(403,"Güvenlik doğrulaması başarısız.");
  let difference=0;for(let i=0;i<expected.length;i++)difference|=expected.charCodeAt(i)^sig.charCodeAt(i);
  if(difference)throw new HttpError(403,"Güvenlik doğrulaması başarısız.");
}
