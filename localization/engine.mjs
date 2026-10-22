// Shared, dependency-free HTML localization. Links, forms and inline markup stay intact.
export const languages=['en','tr','es','zh'];
export const localeNames={en:'English',tr:'Türkçe',es:'Español',zh:'简体中文'};
export const ogLocales={en:'en_US',tr:'tr_TR',es:'es_ES',zh:'zh_CN'};
export const normalize=s=>s.replace(/\s+/g,' ').trim();
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',hellip:'…',copy:'©',rarr:'→',euro:'€',rsquo:'’',lsquo:'‘',ldquo:'“',rdquo:'”'};
export const decode=s=>String(s).replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(all,key)=>key[0]==='#'?String.fromCodePoint(parseInt(key.slice(key[1]?.toLowerCase()==='x'?2:1),key[1]?.toLowerCase()==='x'?16:10)):(entities[key]??all));
export const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const voidTags=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const skipped=new Set(['script','style','svg','code','pre','textarea','iframe']);
const inline=new Set(['a','em','strong','b','i','small','span','sup','sub','br','s','u','abbr','time','mark']);
const groups=new Set(['h1','h2','h3','h4','h5','h6','p','summary','li','button','a','span','label','figcaption','option','strong','em','small','td','th','dt','dd','legend','title']);
const attrNames=new Set(['alt','title','placeholder','aria-label','aria-description']);
const textNode=value=>({type:'text',value});
export function parse(html){
 const root={type:'root',children:[]},stack=[root];let cursor=0;
 while(cursor<html.length){
  const begin=html.indexOf('<',cursor);if(begin<0){stack.at(-1).children.push(textNode(decode(html.slice(cursor))));break;}
  if(begin>cursor)stack.at(-1).children.push(textNode(decode(html.slice(cursor,begin))));
  if(html.startsWith('<!--',begin)){const end=html.indexOf('-->',begin);const stop=end<0?html.length:end+3;stack.at(-1).children.push({type:'raw',value:html.slice(begin,stop)});cursor=stop;continue;}
  let end=begin+1,quote='';for(;end<html.length;end++){const c=html[end];if(quote){if(c===quote)quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='>')break;}
  const raw=html.slice(begin,end+1);cursor=end+1;
  if(/^<!|^<\?/.test(raw)){stack.at(-1).children.push({type:'raw',value:raw});continue;}
  const close=raw.match(/^<\/([\w:-]+)/);if(close){const tag=close[1].toLowerCase();let index=stack.length-1;while(index>0&&stack[index].tag!==tag)index--;if(index>0)stack.length=index;continue;}
  const open=raw.match(/^<([\w:-]+)/);if(!open){stack.at(-1).children.push(textNode(raw));continue;}
  const tag=open[1].toLowerCase(),attrs=[];
  const attributes=raw.slice(open[0].length).replace(/\/?\s*>$/,'');
  for(const match of attributes.matchAll(/([^\s=/'">]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s'"=<>`]+)))?/g))attrs.push([match[1],match[2]!==undefined?decode(match[2]):match[3]!==undefined?decode(match[3]):match[4]!==undefined?decode(match[4]):null]);
  const node={type:'element',tag,attrs,children:[]};stack.at(-1).children.push(node);
  if(voidTags.has(tag)||/\/\s*>$/.test(raw))continue;
  if(['script','style','textarea','svg'].includes(tag)){const re=new RegExp('</'+tag+'\\s*>','ig');re.lastIndex=cursor;const m=re.exec(html);node.children.push({type:'raw',value:html.slice(cursor,m?.index??html.length)});cursor=m?re.lastIndex:html.length;continue;}
  stack.push(node);
 }
 return root;
}
export const get=(node,key)=>node.attrs?.find(([name])=>name===key)?.[1];
export function set(node,key,value){const entry=node.attrs.find(([name])=>name===key);if(entry)entry[1]=String(value);else node.attrs.push([key,String(value)]);}
export function opening(node){return '<'+node.tag+node.attrs.map(([key,value])=>' '+key+(value===null?'':'="'+escape(value)+'"')).join('')+'>';}
export function serialize(node){if(node.type==='raw')return node.value;if(node.type==='text')return escape(node.value);if(node.type==='root')return node.children.map(serialize).join('');return opening(node)+node.children.map(serialize).join('')+(voidTags.has(node.tag)?'':'</'+node.tag+'>');}
function canGroup(node){return node.children.every(child=>child.type==='text'||child.type==='element'&&inline.has(child.tag)&&canGroup(child));}
export function unit(node){let count=0;const markup={};const walk=children=>children.map(child=>{if(child.type==='text')return child.value;const id=count++;if(voidTags.has(child.tag)){markup['{'+id+'/}']=opening(child);return '{'+id+'/}';}markup['{'+id+'}']=opening(child);markup['{/'+id+'}']='</'+child.tag+'>';return '{'+id+'}'+walk(child.children)+'{/'+id+'}';}).join('');return {key:normalize(walk(node.children)),markup};}
const meaningful=key=>key&&/[\p{L}]/u.test(key)&&!/^https?:|^www\.|^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
export function collect(html,source,catalog={}){
 const tree=parse(html);const add=(key,context)=>{key=normalize(key);if(!meaningful(key))return;const row=catalog[key]??={sources:[],contexts:[],count:0};row.count++;if(!row.sources.includes(source))row.sources.push(source);if(!row.contexts.includes(context))row.contexts.push(context);};
 const visit=node=>{if(node.type==='text'){add(node.value,'text');return;}if(node.type!=='element'&&node.type!=='root')return;
  for(const [key,value] of node.attrs||[])if(attrNames.has(key)&&value)add(value,node.tag+'@'+key);
  if(node.tag==='meta'&&['description','og:title','og:description','twitter:title','twitter:description'].includes(get(node,'name')||get(node,'property')))add(get(node,'content'),node.tag+'@content');
  if(skipped.has(node.tag)||/(?:^|\s)locale-switcher(?:\s|$)/.test(get(node,'class')||''))return;
  if(groups.has(node.tag)&&canGroup(node)&&node.children.length){add(unit(node).key,node.tag);return;}
  node.children?.forEach(visit);
 };visit(tree);return catalog;
}
export function barePath(path){return path.replace(/^\/(tr|es|zh)(?=\/|$)/,'')||'/';}
export function localePath(path,lang){const plain=barePath(path);return lang==='en'?plain:'/'+lang+(plain.startsWith('/')?plain:'/'+plain);}
const ownAsset=path=>/^\/(?:assets|images|api|admin|signin|signout|\.well-known)(?:\/|[-.])/.test(path)||/\.(?:css|js|mjs|json|svg|png|jpe?g|webp|gif|avif|ico|mp4|woff2?|txt|xml)$/i.test(path);
export function localizeUrl(value,lang,origin){if(!value||value.startsWith('#')||/^(?:mailto|tel|data|javascript):/.test(value))return value;try{const url=new URL(value,origin);if(url.origin!==new URL(origin).origin||ownAsset(url.pathname))return value;url.pathname=localePath(url.pathname,lang);return value.startsWith('/')?url.pathname+url.search+url.hash:url.href;}catch{return value;}}
export function localizeHTML(html,{lang='en',origin,path='/',dictionary={},interfaceCopy={},catalog={},navigation=true,onMissing=()=>{}}){
 const map={...dictionary,...interfaceCopy};const tree=parse(html);const lookup=key=>{key=normalize(key);if(lang==='en'||!meaningful(key))return key;if(Object.hasOwn(map,key))return map[key];if(catalog[key])onMissing(key);return key;};
 const withoutMarkup=value=>normalize(value.replace(/\{\d+\/\}/g,' ').replace(/\{\/?\d+\}/g,''));
 const plains=new Map(Object.entries(map).map(([key,value])=>[withoutMarkup(key),withoutMarkup(value)]));
 const plain=value=>{if(typeof value!=='string')return value;return map[normalize(value)]??plains.get(normalize(value))??value;};
 const schema=(value,key='')=>{if(Array.isArray(value))return value.map(item=>schema(item,key));if(value&&typeof value==='object'){const result={};for(const [name,child]of Object.entries(value)){if(name==='inLanguage')result[name]=value['@type']==='WebSite'?languages.map(code=>code==='zh'?'zh-Hans':code):lang==='zh'?'zh-Hans':lang;else result[name]=schema(child,name);}if(value['@type']==='WebSite')result.inLanguage=languages.map(code=>code==='zh'?'zh-Hans':code);if(['WebPage','BlogPosting','Article','CollectionPage','FAQPage'].includes(value['@type']))result.inLanguage=lang==='zh'?'zh-Hans':lang;return result;}if(typeof value!=='string')return value;if(key==='@id'&&/#(?:organization|website|publisher)$/.test(value))return value;if(['url','@id','item','mainEntityOfPage'].includes(key))return localizeUrl(value,lang,origin);if(['name','headline','description','text','caption','articleSection','alternativeHeadline','servesCuisine'].includes(key))return plain(value);return value;};
 const prepare=node=>{if(node.type==='element'){for(const item of node.attrs){const [key,value]=item;if(attrNames.has(key)&&value&&lang!=='en')item[1]=plain(value);if(['href','action'].includes(key)&&value)item[1]=localizeUrl(value,lang,origin);}}node.children?.forEach(prepare);};prepare(tree);
 const visit=node=>{if(node.type==='text'){const key=normalize(node.value);if(meaningful(key)&&lang!=='en'){const prefix=node.value.match(/^\s*/)[0],suffix=node.value.match(/\s*$/)[0];node.value=prefix+lookup(key)+suffix;}return;}if(node.type!=='element'&&node.type!=='root')return;
  if(node.tag==='html')set(node,'lang',lang==='zh'?'zh-Hans':lang);
  for(const item of node.attrs||[]){const [key,value]=item;if(attrNames.has(key)&&value&&lang!=='en')item[1]=plain(value);if(['href','action'].includes(key)&&value)item[1]=localizeUrl(value,lang,origin);if(key==='data-gyg-locale-code')item[1]=({en:'en-US',tr:'tr-TR',es:'es-ES',zh:'zh-CN'})[lang];}
  if(node.tag==='meta'){const name=get(node,'name')||get(node,'property');if(['description','og:title','og:description','twitter:title','twitter:description','og:image:alt','twitter:image:alt','article:section'].includes(name))set(node,'content',plain(get(node,'content')));if(name==='og:url')set(node,'content',new URL(localePath(barePath(path),lang),origin).href);if(name==='og:locale')set(node,'content',ogLocales[lang]);}
  if(node.tag==='link'&&get(node,'rel')==='canonical')set(node,'href',new URL(localePath(barePath(path),lang),origin).href);
  if(node.tag==='script'&&get(node,'type')==='application/ld+json'){try{node.children=[{type:'raw',value:JSON.stringify(schema(JSON.parse(node.children.map(c=>c.value).join('')))).replaceAll('<','\\u003c')}];}catch{}return;}
  if(skipped.has(node.tag))return;
  if(/(?:^|\s)(?:brand|wordmark|brand-word)(?:\s|$)/.test(get(node,'class')||''))return;
  if(groups.has(node.tag)&&canGroup(node)&&node.children.length){const {key,markup}=unit(node);if(meaningful(key)&&lang!=='en'){const target=lookup(key);const tokens=Object.keys(markup).sort((a,b)=>b.length-a.length);let body=escape(target);for(const token of tokens)body=body.replaceAll(token,markup[token]);node.children=[{type:'raw',value:body}];}return;}
  node.children?.forEach(visit);
 };visit(tree);
 // Search indexes retain their original terms and also include the localized card text.
 const visible=node=>node.type==='text'?node.value:node.type==='raw'?decode(node.value.replace(/<[^>]*>/g,' ')):node.children?.map(visible).join(' ')||'';
 const indexes=node=>{if(node.type==='element'&&get(node,'data-search')!==undefined)set(node,'data-search',normalize(get(node,'data-search')+' '+visible(node)).toLocaleLowerCase(lang==='zh'?'zh-CN':lang));node.children?.forEach(indexes);};indexes(tree);
 let head,body,header;const find=node=>{if(node.tag==='head')head=node;if(node.tag==='body')body=node;if(node.tag==='header'&&!header)header=node;node.children?.forEach(find);};find(tree);
 if(head){head.children=head.children.filter(n=>!(n.tag==='link'&&get(n,'rel')==='alternate'&&get(n,'hreflang')));const add=markup=>head.children.push({type:'raw',value:markup});if(head.children.some(n=>n.tag==='link'&&get(n,'rel')==='canonical')){for(const code of languages)add('<link rel="alternate" hreflang="'+(code==='zh'?'zh-Hans':code)+'" href="'+escape(new URL(localePath(barePath(path),code),origin).href)+'">');add('<link rel="alternate" hreflang="x-default" href="'+escape(new URL(barePath(path),origin).href)+'">');}add('<link rel="stylesheet" href="/localization.css"><script defer src="/localization-client.js"></script>');add('<script type="application/json" id="locale-interface">'+JSON.stringify({lang,copy:interfaceCopy}).replaceAll('<','\\u003c')+'</script>');}
 if(navigation&&header){const label=({en:'Language',tr:'Dil',es:'Idioma',zh:'语言'})[lang];const nav='<nav class="locale-switcher" aria-label="'+label+'">'+languages.map(code=>'<a href="'+escape(localePath(barePath(path),code))+'" lang="'+(code==='zh'?'zh-Hans':code)+'" aria-label="'+localeNames[code]+'"'+(code===lang?' aria-current="page"':'')+'>'+(code==='zh'?'中文':code.toUpperCase())+'</a>').join('')+'</nav>';header.children.push({type:'raw',value:nav});}
 return serialize(tree);
}
