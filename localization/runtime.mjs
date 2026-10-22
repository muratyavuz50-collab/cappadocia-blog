import {languages,localizeHTML,localePath,barePath} from './engine.mjs';
import tr from './tr.json';
import es from './es.json';
import zh from './zh.json';
import catalog from './catalog.json';
import interfaceCopy from './interface.json';

const dictionaries={tr,es,zh};
const privatePath=path=>/^\/(admin|account|api|signin-with-chatgpt|signout-with-chatgpt)(\/|$)/.test(path);

export async function localizedResponse(request,env,handle,canonicalOrigin){
  const original=new URL(request.url);
  const match=original.pathname.match(/^\/(tr|es|zh)(?=\/|$)/);
  const lang=match?.[1]||'en';
  const plain=barePath(original.pathname);
  // Authentication and editorial APIs remain on their original protected URLs.
  if(match&&privatePath(plain))return new Response('Not found',{status:404,headers:{'content-type':'text/plain; charset=utf-8','x-robots-tag':'noindex, nofollow'}});
  if(match&&original.pathname==='/'+lang){const target=new URL(request.url);target.pathname='/'+lang+'/';return Response.redirect(target,308);}
  const internal=new URL(request.url);internal.pathname=plain;
  const forwarded=match?new Request(internal,request):request;
  const response=await handle(forwarded,env);
  if(privatePath(plain))return response;
  const headers=new Headers(response.headers);
  const location=headers.get('location');
  if(location&&match){const target=new URL(location,request.url);if(target.origin===original.origin||target.origin===canonicalOrigin(env)){target.pathname=localePath(target.pathname,lang);headers.set('location',target.href);return new Response(null,{status:response.status,headers});}}
  if(!headers.get('content-type')?.startsWith('text/html'))return response;
  const document=await response.text();
  const body=localizeHTML(document,{lang,origin:canonicalOrigin(env),path:plain,dictionary:dictionaries[lang]||{},interfaceCopy:interfaceCopy[lang]||{},catalog});
  headers.set('content-language',lang==='zh'?'zh-Hans':lang);
  headers.delete('content-length');headers.delete('etag');
  return new Response(body,{status:response.status,headers});
}

export function sitemapAlternates(origin,path,xmlEscape){
  return languages.map(lang=>`<xhtml:link rel="alternate" hreflang="${lang==='zh'?'zh-Hans':lang}" href="${xmlEscape(origin+localePath(path,lang))}"/>`).join('')+`<xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(origin+path)}"/>`;
}
