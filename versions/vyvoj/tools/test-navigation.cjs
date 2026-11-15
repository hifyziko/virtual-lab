const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const file=process.argv[2]||path.join(__dirname,'../versions/aktualni/web/index.html');
const html=fs.readFileSync(file,'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
for(const script of scripts)new vm.Script(script);
const base=JSON.parse(html.match(/Lab\.catalog=(\[[\s\S]*?\]);/)[1]);
const entries=JSON.parse(html.match(/const entries=(\[.*?\]);\nfor\(const entry of entries\)/s)[1]);
const catalog=[...entries.map(({source,...entry})=>entry),...base.filter(m=>!entries.some(e=>e.id===m.id))];
for(const match of html.matchAll(/const entry=\{id:'(sm[^']+)'/g))if(!catalog.some(m=>m.id===match[1]))catalog.push({id:match[1],group:'sync'});
const ordering=html.match(/<script id="sync-module-order">([\s\S]*?)<\/script>/)[1];
for(const extra of [false,true]){
 const before=catalog.map(m=>({...m}));if(extra)before.push({id:'future-sync-test',group:'sync'});
 const context={Lab:{catalog:before,route(){}}};vm.runInNewContext(ordering,context);
 assert(context.Lab.catalog.every(Boolean),'Ordering inserted undefined entries');
 assert.deepEqual([...context.Lab.catalog.map(m=>m.id)].sort(),before.map(m=>m.id).sort(),'Ordering lost modules');
}
const listeners={},app={innerHTML:'',scrollIntoView(){}};
const context={console,document:{readyState:'loading',getElementById:()=>app,addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn)}},location:{hash:'#test'},requestAnimationFrame:()=>0,addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn)}};
context.window=context;
vm.runInNewContext(scripts.find(s=>s.includes('/* Shared shell')),context);
// Exercise the actual home-routing wrapper, with DOM rendering replaced by a string sink.
const homeWrapper=html.match(/const originalRoute=Lab\.route;[\s\S]*?(?=<\/script>)/)[0];
context.Lab.home=()=>{assert(context.Lab.catalog.every(Boolean));return 'home';};
context.Lab.catalog=catalog;
vm.runInNewContext(homeWrapper,context);
let mounts=0,disposals=0;
context.Lab.register({id:'test',title:'Test',mount(){mounts++;app.innerHTML='module';context.Lab.dispose=()=>disposals++;}});
for(let i=0;i<8;i++)context.Lab.route();
assert.equal(mounts,0);assert.equal(listeners.DOMContentLoaded.length,1);
context.document.readyState='interactive';listeners.DOMContentLoaded[0]();assert.equal(mounts,1);
for(const hash of ['#group-transformer','','#group-sync']){
 context.location.hash=hash;context.Lab.route();assert.equal(app.innerHTML,'home');assert.equal(context.Lab.dispose,null);
 context.location.hash='#test';context.Lab.route();assert.equal(app.innerHTML,'module');
}
assert.equal(disposals,3);
console.log('PASS: script syntax, complete catalog including future modules, one initial mount, three module/home round trips and disposal.');
