import fs from 'node:fs';
import path from 'node:path';
import worker from '../dist/server/index.js';
import {site} from '../content.mjs';
import {publicPaths} from '../analytics.mjs';
import {collect} from '../localization/engine.mjs';
const DB={prepare(){return{bind(){return this},async all(){return{results:[]}},async first(){return null},async run(){return{meta:{changes:0}}}}},async batch(statements){return Promise.all(statements.map(s=>s.run()))}};
const env={DB,PUBLIC_ORIGIN:site.domain,CANONICAL_ORIGIN:site.domain,CUSTOM_DOMAIN_STATUS:'active'};
const catalog={};fs.mkdirSync('localization/source-pages',{recursive:true});
for(const route of [...publicPaths(site)].sort()){
 const response=await worker.fetch(new Request(site.domain+route),env,{});
 if(response.status!==200)throw new Error(route+': '+response.status);
 const html=await response.text();collect(html,route,catalog);
 const file=path.join('localization/source-pages',route,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html);
}
fs.writeFileSync('localization/catalog.json',JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({pages:publicPaths(site).size,entries:Object.keys(catalog).length,words:Object.keys(catalog).join(' ').split(/\s+/).length,faqCount:500}));
