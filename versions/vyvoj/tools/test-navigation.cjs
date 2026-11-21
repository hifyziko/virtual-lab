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
const listeners={},app={innerHTML:''};
let scrollTop=0;
const topic={scrollIntoView(){scrollTop=600;}};
const context={console,document:{readyState:'loading',getElementById:id=>id==='app'?app:topic,addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn)}},location:{hash:'#test'},requestAnimationFrame:()=>0,addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn)},scrollTo({top,behavior}){assert.equal(behavior,'instant');scrollTop=top;}};
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
for(const hash of ['#group-electromagnetism','#group-area-electricity','']){
 scrollTop=400;
 context.location.hash=hash;
 listeners.hashchange[0]();
 assert.equal(app.innerHTML,'home');
 assert.equal(scrollTop,hash==='#group-electromagnetism'?600:0);
}
const physicsPreview=html.match(/<script id="physics-preview">([\s\S]*?)<\/script>/)?.[1];
if(physicsPreview){
 const home=context.Lab.home;
 const url='file:///D:/virtual-lab/index.html';
 context.URL=URL;
 context.location=new URL(url+'#group-electromagnetism');
 const history=[];
 context.history={pushState(_state,_title,href){history.push(href);context.location=new URL(href);}};
 context.HashChangeEvent=class {constructor(type,options){Object.assign(this,{type},options);}};
 context.dispatchEvent=event=>{for(const fn of listeners[event.type]||[])fn(event);};
 context.document.readyState='loading';
 vm.runInNewContext(physicsPreview,context);
 context.Lab.home=home;
 context.document.readyState='interactive';
 const parentHref=physicsPreview.match(/<a class="physics-up physics-up-primary" href="([^"]+)"/)[1];
 function clickUp(href,options={}){
  const event={button:0,target:{closest:selector=>selector==='a.physics-up-primary'?new URL(href,url):null},
   defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...options};
  listeners.click[0](event);
  return event.defaultPrevented;
 }
 assert.equal(clickUp('#group-area-electricity',{ctrlKey:true}),false);
 assert.deepEqual(history,[]);
 const overviews=[
  '#group-area-electricity','#group-electromagnetism','#group-materials',
  '#group-area-machines','#group-transformer','#group-common','#group-induction','#group-sync','#group-dc','#group-drive',
  '#group-area-plasma','#group-fusion'
 ];
 for(const start of overviews){
  context.location=new URL(url+start);
  scrollTop=400;
  assert.equal(clickUp(parentHref),true);
  assert.equal(context.location.href,url,start);
  assert.equal(context.document.title,'Virtuální laboratoř fyziky',start);
  assert.equal(scrollTop,0);
 }
 assert.deepEqual(history,overviews.map(()=>url));
}
console.log('PASS: script syntax, catalog, initial mount, module disposal and navigation from topic to area to main directory.');
