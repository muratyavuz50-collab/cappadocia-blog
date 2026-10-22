import {mkdir,writeFile,cp,rm,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import worker from '../dist/server/index.js';
import {site} from '../content.mjs';
import {publicPaths} from '../analytics.mjs';
import {languages,localePath} from '../localization/engine.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const preview=path.join(root,'.sites-runtime/locale-preview');
const output=path.join(preview,'dist');
// Keep the managed preview server's working directory alive across refreshes.
await mkdir(output,{recursive:true});
for(const entry of await readdir(output))await rm(path.join(output,entry),{recursive:true,force:true});
await mkdir(path.join(preview,'.openai'),{recursive:true});
await writeFile(path.join(preview,'.openai/hosting.json'),JSON.stringify({project_id:'appgprj_6ac238cdc8408191bed1bfcf0fd08bec',static:{directory:'dist'}}));
const DB={prepare(){return{bind(){return this},async all(){return{results:[]}},async first(){return null},async run(){return{meta:{changes:0}}}}},async batch(statements){return Promise.all(statements.map(s=>s.run()))}};
const env={DB,PUBLIC_ORIGIN:site.domain,CANONICAL_ORIGIN:site.domain,CUSTOM_DOMAIN_STATUS:'active'};
let count=0;
for(const route of publicPaths(site))for(const lang of languages){
  const localized=localePath(route,lang);const response=await worker.fetch(new Request(site.domain+localized),env,{});
  if(response.status!==200)throw new Error(localized+': '+response.status);
  const file=path.join(output,localized,'index.html');await mkdir(path.dirname(file),{recursive:true});await writeFile(file,await response.text());count++;
}
for(const file of ['/styles.css','/site.js','/localization.css','/localization-client.js','/favicon.svg']){
  const response=await worker.fetch(new Request(site.domain+file),env,{});await writeFile(path.join(output,file),Buffer.from(await response.arrayBuffer()));
}
await cp(path.join(root,'assets'),path.join(output,'assets'),{recursive:true});
const wrapper=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Internal mobile language review</title><style>body{margin:16px;background:#ddd;font:14px system-ui}.frames{display:flex;gap:14px}iframe{width:390px;height:850px;border:0;background:white}h1{font-size:16px}</style></head><body><h1>Türkçe · Español · 简体中文 — 390px</h1><div class="frames"><iframe id="tr" title="Turkish mobile" src="/tr/"></iframe><iframe id="es" title="Spanish mobile" src="/es/"></iframe><iframe id="zh" title="Chinese mobile" src="/zh/"></iframe></div></body></html>`;
await writeFile(path.join(output,'qa-languages.html'),wrapper);
console.log(JSON.stringify({preview,pages:count}));
