import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import vm from 'node:vm';
import { PRESENT_TOBE_QUESTIONS } from '../src/content/data/presentTobeQuestions.ts';
import { MVP_VOCABULARY_ENTRIES } from '../src/content/data/vocabulary.ts';
const out = new URL('../public/audio/',import.meta.url);
await mkdir(out,{recursive:true});
const tmp = new URL('../.sites-runtime/audio/',import.meta.url);await mkdir(tmp,{recursive:true});
const key = s=>s.toLowerCase().trim().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
const jobs = new Map();const manifest={};
function add(text,name,spoken=text){manifest[key(text)]=name; jobs.set(name,spoken);}
for(const entry of MVP_VOCABULARY_ENTRIES.filter(e=>e.categoryId==='body'))add(entry.term,'term-'+createHash('sha256').update(key(entry.term)).digest('hex').slice(0,16)+'.mp3');
for(const q of PRESENT_TOBE_QUESTIONS){let i=0;const parts=q.correctAnswer.split('/').map(s=>s.trim());const sentence=q.question.replace(/___/g,()=>parts[i++]??parts[0]);add(sentence,'sentence-'+q.id+'.mp3');}
for(const text of ['I am calm.','They are at school.','Laura is a teacher.','The notebooks are new.','I am not sleepy.',"The rooms aren't empty.",'Is your cousin here?','Where are the tickets?','Is Leo ready? Yes, he is.',"Are the lights on? No, they aren't.",'Is this chair free?','The keys are here, but the bag is outside.',"We're ready.","The store isn't open.",'The classroom is quiet.','My cousins are busy.'])add(text,'example-'+createHash('sha256').update(key(text)).digest('hex').slice(0,16)+'.mp3');
const vctx=vm.createContext({});vm.runInContext(await readFile(new URL('../public/past/verbs.js',import.meta.url),'utf8')+';globalThis.verbs=VERBS;',vctx);
for(const v of vctx.verbs){for(const [form,value]of [['base',v.base],['past',v.past],['part',v.part]]){let spoken=value.replaceAll('/',' or ');if(v.base==='read')spoken=form==='base'?'reed':'red';if(v.base==='lead'&&form==='base')spoken='leed';jobs.set('verb-'+v.base+'-'+form+'.mp3',spoken)}}
let completed=0;const list=[...jobs];
async function worker(){while(list.length){const [name,text]=list.shift();const output=new URL(name,out);try{await access(output)}catch{const textfile=new URL(name+'.txt',tmp);await writeFile(textfile,text);await new Promise((resolve,reject)=>{const p=spawn('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i',`flite=textfile=${textfile.pathname}:voice=slt`,'-af','apad=pad_dur=0.12','-ar','22050','-codec:a','libmp3lame','-b:a','64k','-y',output.pathname],{stdio:['ignore','ignore','pipe']});let err='';p.stderr.on('data',b=>err+=b);p.on('close',code=>code===0?resolve():reject(Error(err)));p.on('error',reject)})}completed++;}}
await Promise.all([worker(),worker(),worker(),worker()]);
await writeFile(new URL('manifest.json',out),JSON.stringify(manifest,null,2));
await writeFile(new URL('../src/services/audio/audioManifest.json',import.meta.url),JSON.stringify(manifest,null,2));
console.log(`Generated/verified ${completed} local English audio files. read: base /riːd/, past and participle /red/.`);
