import assert from 'node:assert/strict';
import {checkDictionaries} from '../localization/check.mjs';
import {languages,localePath,barePath,parse,get,unit,normalize,decode} from '../localization/engine.mjs';
import worker from '../dist/server/index.js';
import {site} from '../content.mjs';
import {publicPaths} from '../analytics.mjs';
import {faqGroups} from '../faq-data.mjs';
import {readFile} from 'node:fs/promises';

const {counts}=await checkDictionaries(new URL('../localization/',import.meta.url));
const dictionaries=Object.fromEntries(await Promise.all(['tr','es','zh'].map(async lang=>[lang,JSON.parse(await readFile(new URL('../localization/'+lang+'.json',import.meta.url),'utf8'))])));
const stored=[];
const DB={prepare(sql){let values=[];return{bind(...args){values=args;return this;},async all(){return{results:[]}},async first(){return null},async run(){if(sql.startsWith('INSERT INTO site_metrics'))stored.push(values);return{meta:{changes:1}}}}},async batch(statements){return Promise.all(statements.map(s=>s.run()))}};
const env={DB,PUBLIC_ORIGIN:site.domain,CANONICAL_ORIGIN:site.domain,CUSTOM_DOMAIN_STATUS:'active'};
const request=(path,options={})=>worker.fetch(new Request(site.domain+path,options),env,{});
const originalPaths=[...publicPaths(site)];
const paths=new Set(originalPaths.flatMap(path=>languages.map(lang=>localePath(path,lang))));
const walk=(node,callback)=>{callback(node);node.children?.forEach(child=>walk(child,callback));};
const text=node=>node.type==='text'?node.value:node.type==='raw'?decode(node.value.replace(/<[^>]*>/g,'')):node.children?.map(text).join('')||'';
let pages=0,partnerLinks=0,questions=0;
const titles=new Map();
for(const lang of languages){
  const seen=new Set();
  for(const path of originalPaths){
    const localized=localePath(path,lang),response=await request(localized);
    assert.equal(response.status,200,localized);
    assert.equal(response.headers.get('content-language'),lang==='zh'?'zh-Hans':lang,`${localized}: HTTP language`);
    const html=await response.text(),tree=parse(html);
    assert.match(html,new RegExp(`<html\\b[^>]*\\blang="${lang==='zh'?'zh-Hans':lang}"`),`${localized}: document language`);
    assert.ok(html.includes(`rel="canonical" href="${site.domain+localized}"`),`${localized}: canonical`);
    assert.equal((html.match(/hreflang=/g)||[]).length,5,`${localized}: reciprocal languages`);
    assert.equal((html.match(/class="locale-switcher"/g)||[]).length,1,`${localized}: language navigation`);
    const title=decode(html.match(/<title>([^<]+)<\/title>/)[1]);
    assert.ok(!seen.has(title),`${localized}: duplicate title ${title}`);seen.add(title);
    const h1=[];const switches=[];const summaries=[];const schemas=[];
    walk(tree,node=>{
      if(node.tag==='h1')h1.push(normalize(text(node)));
      if(node.tag==='summary')summaries.push(normalize(text(node)));
      if(node.tag==='nav'&&get(node,'class')==='locale-switcher')walk(node,child=>{if(child.tag==='a')switches.push(get(child,'href'));});
      if(node.tag==='script'&&get(node,'type')==='application/ld+json')schemas.push(JSON.parse(node.children.map(c=>c.value).join('')));
      if(node.tag!=='a')return;
      const href=get(node,'href');if(!href)return;
      const url=new URL(href,site.domain+localized);
      if(url.origin===site.domain&&(!href.startsWith('#'))&&!/\.(css|js|svg|xml)$/.test(url.pathname)&&!/^\/(api|admin|signin|signout)/.test(url.pathname))assert.ok(paths.has(url.pathname),`${localized}: broken internal link ${href}`);
      if(url.hostname.endsWith('getyourguide.com')){assert.equal(url.searchParams.get('partner_id'),'GTS1OZ5',`${localized}: affiliate partner`);partnerLinks++;}
    });
    assert.equal(h1.length,1,`${localized}: one H1`);
    assert.deepEqual(switches,languages.map(code=>localePath(path,code)),`${localized}: same-page language switches`);
    const article=path.startsWith('/articles/')?site.articles.find(a=>path===`/articles/${a.slug}/`):null;
    if(article){
      const graph=schemas.flatMap(value=>Array.isArray(value)?value:value['@graph']||[value]);const posting=graph.find(s=>s['@type']==='BlogPosting');
      assert.equal(posting.headline,h1[0],`${localized}: schema headline matches visible heading`);
      assert.equal(posting.inLanguage,lang==='zh'?'zh-Hans':lang,`${localized}: schema language`);
      assert.equal(posting.mainEntityOfPage['@id'],site.domain+localized,`${localized}: schema page URL`);
    }
    if(path==='/faq/'){
      assert.equal(summaries.length,500,`${localized}: 500 expandable FAQ questions`);
      const source=faqGroups.flatMap(group=>group.items);
      assert.deepEqual(summaries,source.map(row=>lang==='en'?row.question:dictionaries[lang][row.question]),`${localized}: exact translated questions`);
      for(const row of source){const answer=lang==='en'?row.answer:dictionaries[lang][row.answer];assert.ok(html.includes(answer.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')),`${localized}: translated answer ${row.question}`);}
      questions+=summaries.length;
    }
    pages++;
  }
  titles.set(lang,seen.size);
  const redirect=await request('/'+(lang==='en'?'':lang+'/')+'guides?q=test');
  assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),site.domain+localePath('/guides/',lang)+'?q=test');
  const filtered=await request(localePath('/guides/',lang)+'?q=test');assert.match(await filtered.text(),/content="noindex,follow"/);
  const head=await request(localePath('/',lang),{method:'HEAD'});assert.equal(await head.text(),'');assert.equal(head.status,200);
  if(lang!=='en'){
    for(const privatePath of ['/admin/','/api/admin/articles','/account/']){const protectedResponse=await request('/'+lang+privatePath);assert.equal(protectedResponse.status,404);assert.match(protectedResponse.headers.get('x-robots-tag'),/noindex/);}
    const metric=await request('/api/metrics',{method:'POST',headers:{origin:site.domain,'content-type':'application/json','user-agent':'Mozilla/5.0'},body:JSON.stringify({path:localePath('/',lang),kind:'view',source:'direct'})});assert.equal(metric.status,204,'Localized page analytics accepted');
  }
}
assert.equal(stored.length,3,'Localized page views persist with language-specific paths');
const sitemap=await(await request('/sitemap.xml')).text();
assert.deepEqual(new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(decode(match[1])).pathname)),paths);
assert.equal((sitemap.match(/xhtml:link/g)||[]).length,paths.size*5);
console.log(JSON.stringify({pages,articles:site.articles.length,translations:counts,questions,partnerLinks,uniqueTitles:Object.fromEntries(titles),checks:'public routing, private route isolation, analytics, 500 FAQ answers, schema, same-page language switching, canonical and hreflang'}));
