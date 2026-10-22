import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const tokens=text=>text.match(/\{\/?\d+\/?\}/g)||[];
export async function checkDictionaries(directory){
  const catalog=JSON.parse(await readFile(new URL('catalog.json',directory),'utf8'));
  const counts={};
  for(const lang of ['tr','es','zh']){
    const dictionary=JSON.parse(await readFile(new URL(lang+'.json',directory),'utf8'));
    const missing=Object.keys(catalog).filter(key=>!Object.hasOwn(dictionary,key));
    assert.equal(missing.length,0,`${lang}: ${missing.length} missing translations, first: ${missing.slice(0,3).join(' | ')}`);
    for(const [key,value]of Object.entries(dictionary)){
      assert.ok(catalog[key],`${lang}: unexpected source key ${key.slice(0,120)}`);
      assert.equal(typeof value,'string',`${lang}: translation must be text`);
      assert.ok(value.trim(),`${lang}: empty translation for ${key.slice(0,100)}`);
      assert.deepEqual(tokens(value).sort(),tokens(key).sort(),`${lang}: changed inline-markup tokens for ${key.slice(0,120)}`);
      const stack=[];
      for(const token of tokens(value)){
        if(token.endsWith('/}'))continue;
        if(token.startsWith('{/'))assert.equal(stack.pop(),token.slice(2,-1),`${lang}: invalid inline nesting for ${key.slice(0,120)}`);
        else stack.push(token.slice(1,-1));
      }
      assert.equal(stack.length,0,`${lang}: unclosed inline markup for ${key.slice(0,120)}`);
    }
    counts[lang]=Object.keys(dictionary).length;
  }
  return {catalog,counts};
}
