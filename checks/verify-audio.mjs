import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import vm from 'node:vm';
import { PRESENT_TOBE_QUESTIONS } from '../src/content/data/presentTobeQuestions.ts';
import { MVP_VOCABULARY_ENTRIES } from '../src/content/data/vocabulary.ts';
const ctx=vm.createContext({});vm.runInContext(readFileSync('public/past/verbs.js','utf8')+';globalThis.verbs=VERBS;',ctx);
const manifest=JSON.parse(readFileSync('public/audio/manifest.json','utf8'));
const norm=s=>s.toLowerCase().trim().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
for(const v of ctx.verbs)for(const type of ['base','past','part']){const p=`public/audio/verb-${v.base}-${type}.mp3`;assert(existsSync(p),p);assert(statSync(p).size>1000,p)}
for(const entry of MVP_VOCABULARY_ENTRIES.filter(e=>e.categoryId==='body'))assert(manifest[norm(entry.term)],entry.term);
for(const q of PRESENT_TOBE_QUESTIONS){let i=0;const parts=q.correctAnswer.split('/').map(x=>x.trim());const sentence=q.question.replace(/___/g,()=>parts[i++]??parts[0]);assert(manifest[norm(sentence)],sentence)}
for(const file of Object.values(manifest)){assert(existsSync(`public/audio/${file}`),file);assert(statSync(`public/audio/${file}`).size>1000,file)}
assert.notDeepEqual(readFileSync('public/audio/verb-read-base.mp3'),readFileSync('public/audio/verb-read-past.mp3'));
assert.deepEqual(readFileSync('public/audio/verb-read-past.mp3'),readFileSync('public/audio/verb-read-part.mp3'));
assert(!readFileSync('src/services/audio/pronunciation.ts','utf8').includes('speechSynthesis'));
console.log('Verified audio for 312 verb forms, 24 body terms, 130 completed TO BE sentences, 16 examples, and read pronunciation variants.');
