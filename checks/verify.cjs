const fs=require('fs'),vm=require('vm'),assert=require('assert');
const el={innerHTML:'',addEventListener(){},classList:{add(){},remove(){},toggle(){}},textContent:'',value:'',focus(){}};
const ctx=vm.createContext({console,localStorage:{getItem(){return null},setItem(){}},document:{querySelector(){return el},addEventListener(){}},window:{scrollTo(){},setTimeout},setTimeout,clearTimeout});
for(const p of ['verbs.js','content.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+p,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.equal(run('VERBS.length'),104);assert.equal(run('new Set(VERBS.map(v=>v.base)).size'),104);
assert.equal(run('EXERCISES.length'),60);
for(let n=0;n<5;n++){
 assert.equal(run(`MEMORY_SETS[${n}].pairs.length`),4+n*2);
 assert(run(`MEMORY_SETS[${n}].pairs.every(b=>VERBS.some(v=>v.base===b))`));
 run(`testLevel=${n+1}; makeTest()`);assert.equal(run('test.questions.length'),10);assert.equal(run('new Set(test.questions.map(q=>q.id)).size'),10);
 assert(run('test.questions.every(q=>q.answers.length && q.explain)'));
 run('newGame()');assert.equal(run('game.cards.length'),8);
}
assert.equal(run('new Set(MEMORY_SETS.flatMap(x=>x.pairs)).size'),40);
const cases=[
 ['I went to the park yesterday.','good'],["She didn't went to school yesterday.",'bad'],['Did you watched the film last night?','bad'],['They was tired last week.','bad'],['I were tired.','bad'],['Were she tired yesterday?','bad'],['I goed to the park yesterday.','bad'],['She studyed English yesterday.','bad'],['He stoped the car yesterday.','bad'],['I have seen the film.','unknown'],['The purple elephant contemplates infinity.','unknown'],['I worked yesterday.','good'],["They didn't work yesterday.",'good'],['Did she buy the book yesterday?','good'],['We were happy last week.','good'],['She eaten a sandwich yesterday.','bad'],['I went to the cinema yesterday night.','bad'],['I went home in last week.','bad'],['I saw her ago two days.','bad'],['I went home tomorrow.','bad'],['I was go to school yesterday.','bad'],['He is happy yesterday.','bad'],['She goes to school yesterday.','bad']
];
let failed=0;for(const [s,status]of cases){ctx.testInput=s;const r=run('analyzeSentence(testInput)');if(r.status!==status){console.log('FAIL',s,'expected',status,'got',r);failed++}}
for(const r of ['home','flash','memory','gaps','time','writing','test']){run(`route='${r}';render()`);assert(el.innerHTML.length>500)}
console.log('Verified 104 verbs, 60 exercises, 5 distinct memory sets, 5 ten-question tests, 7 rendered routes. Sentence checks:',cases.length-failed,'/',cases.length);
if(failed)process.exitCode=1;
for(let n=0;n<5;n++){
 run(`memoryLevel=${n};newGame()`);
 for(const base of run('MEMORY_SETS[memoryLevel].pairs')){
 ctx.currentBase=base;
 const positions=run('game.cards.map((v,i)=>v.id===currentBase?i:-1).filter(i=>i>=0)');
 for(const i of positions)run(`openMemory(${i})`);
 }
 assert.equal(run('game.done'),true);assert.equal(run('game.moves'),4+n*2);
 run(`testLevel=${n+1};makeTest();test.questions.forEach(q=>test.responses[q.id]=q.answers[0]);finishTest()`);
 assert.equal(run('test.score'),100);
 run(`testLevel=${n+1};makeTest();test.questions.forEach(q=>test.responses[q.id]='incorrect answer');finishTest()`);
 assert.equal(run('test.score'),0);assert.equal(run(`progress.tests[${n+1}]`),100);
}
console.log('Verified completion of all 5 memory games; 100% and 0% grading in all 5 tests; best scores retained.');
