'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
function fixture(fit=1){
 const nodes=new Map(),callbacks=[],noop=()=>{};
 const context2d=new Proxy({},{get:()=>noop});
 function element(tag='div'){
  return {tagName:tag,style:{},dataset:{},attributes:{},children:[],value:'',checked:false,disabled:false,hidden:false,textContent:'',
   classList:{add:noop,remove:noop,toggle:noop},
   append(...children){this.children.push(...children);if(!this.value&&children[0]?.value)this.value=children[0].value;},
   replaceChildren(...children){this.children=children;this.value=children[0]?.value||'';},
   getContext:()=>context2d,clientWidth:850,clientHeight:620,
   getBoundingClientRect:()=>({left:20,top:30,width:850*fit,height:620*fit}),
   setAttribute(key,value){this.attributes[key]=value;},removeAttribute:noop,addEventListener:noop,closest:()=>element(),
   querySelector:()=>null,querySelectorAll:()=>[],focus:noop,setPointerCapture:noop,releasePointerCapture:noop};
 }
 for(const match of read('barrier/index.html').matchAll(/<(\w+)\b[^>]*\bid="([^"]+)"[^>]*>/g)){
  const node=element(match[1]);node.checked=/\bchecked\b/.test(match[0]);node.value=match[0].match(/\bvalue="([^"]*)"/)?.[1]||'';nodes.set(match[2],node);
 }
 const get=id=>nodes.get(id)||null;
 const c={console,performance,Math:Object.assign(Object.create(Math),{random:()=>.3}),
  document:{compatMode:'CSS1Compat',getElementById:get,querySelector:()=>element(),querySelectorAll:()=>[],createElement:element,addEventListener:noop},
  matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>{if(fn.name!=='frame')callbacks.push(fn);return 1;},cancelAnimationFrame:noop,
  addEventListener:noop,devicePixelRatio:1,HiFyzikoNucleusView:class{draw(){}},setTimeout,clearTimeout};
 c.window=c;vm.createContext(c);
 for(const file of ['particles/vendor/katex.js','particles/style.js','barrier/model.js','barrier/fusion.js','barrier/reactions.js','barrier/app.js']){
  let source=read(file);
  // Reproduce busy UI states with a real saved shot, without simulating minutes
  // of slowed playback or needing a GPU. This hook is never shipped.
  if(file==='barrier/app.js')source=source.replace('reset();requestAnimationFrame(frame);',
   "window.testBusy=phase=>{mode=phase;fusion=['compound','products'].includes(phase)?{phase}:null;x=0;y=0;updateRareButton();};reset();requestAnimationFrame(frame);");
  vm.runInContext(source,c,{filename:file});
 }
 return {c,get,state:()=>c.coulombState(),drain(){let steps=0;while(callbacks.length){assert(++steps<20000,'Preparation must finish');callbacks.shift()();}return steps;}};
}
// Initial fitting, shrink/grow and fullscreen are based only on the viewport.
{
 const properties={},listeners={},c={innerWidth:1366,innerHeight:768,addEventListener:(name,fn)=>listeners[name]=fn,
  document:{documentElement:{clientWidth:1366,style:{setProperty:(k,v)=>properties[k]=v}},addEventListener:(name,fn)=>listeners[name]=fn}};
 vm.runInNewContext(read('barrier/layout.js'),c);assert(properties['--fusion-fit'],'Fit must run synchronously before mounting');
 for(const [width,height] of [[2560,1440],[1920,1080],[1366,650],[1280,720],[1024,600],[800,600],[1366,650]]){
  c.innerWidth=c.document.documentElement.clientWidth=width;c.innerHeight=height;listeners.resize();
  const fit=+properties['--fusion-fit'];assert(1360*fit<=width-16+1e-8);assert(820*fit<=height-16+1e-8);
  listeners.fullscreenchange();assert.equal(+properties['--fusion-fit'],fit,'Fitting must not feed back on itself');
 }
}
for(const fit of [.65,1,1.5]){
 const f=fixture(fit),before=f.state();assert(!f.get('showRare').disabled);
 f.get('showRare').onclick();assert(f.state().preparing);assert(!f.state().demoPending);assert(f.get('launch').disabled);
 assert.match(f.get('status').textContent,/Hledám/);assert(f.drain()>1,'Search must yield to the UI');
 const ready=f.state();assert(ready.demoPending);assert(!ready.preparing);assert(!f.get('launch').disabled);
 // Golden result from the published synchronous solver, same seed and scene.
 assert(Math.abs(ready.gunHeading-3.141354888440202)<1e-10);assert.equal(ready.targetIndex,0);
 assert.deepEqual(JSON.parse(JSON.stringify(ready.centers.map(t=>[t.x,t.y]))),JSON.parse(JSON.stringify(before.centers.map(t=>[t.x,t.y]))));
 f.get('launch').onclick();assert.equal(f.state().mode,'flight');assert(f.state().demoActive);
}
{
 const f=fixture();f.get('showRare').onclick();f.get('launch').onclick();assert.equal(f.state().mode,'ready','Keyboard/programmatic launch cannot race the search');
 f.get('showRare').onclick();f.drain();assert(!f.state().preparing&&!f.state().demoPending);
 f.get('showRare').onclick();f.get('temperature').value='200';f.get('temperature').oninput();f.drain();assert(!f.state().demoPending,'Changed energy cancels a stale result');
 f.get('pairPreset').value='proton|proton';f.get('pairPreset').onchange();f.get('ppWithBeta').onclick();assert(f.state().preparing);
 f.get('ppWithBeta').onclick();f.drain();assert(!f.state().preparing&&!f.state().demoPending,'The selected p-p action must also cancel');
 f.get('ppWithoutBeta').onclick();f.drain();assert(f.state().demoPending,'p-p preparation remains functional');
}
// A grey preparation control must not trap a slow or paused encounter.
for(const phase of ['tunnel','compound','products','recoil']){
 const f=fixture();f.get('showRare').onclick();f.drain();f.get('launch').onclick();
 const start=f.state();f.c.testBusy(phase);
 assert(!f.get('showRare').disabled,'Preparation must remain available during '+phase);
 assert.match(f.get('showRare').textContent,/nový pokus/);
 f.get('showRare').onclick();f.drain();assert(f.state().demoPending,'New attempt from '+phase);
 if(phase!=='recoil'){assert.equal(f.state().x,start.x);assert.equal(f.state().y,start.y);}
}
// Pointer hit testing uses logical canvas coordinates at every layout scale.
for(const fit of [.65,1,1.5]){
 const f=fixture(fit);f.get('viewReset').onclick();const q=f.c.coulombProjectilePoint();
 f.get('scene').onpointerdown({clientX:20+q[0]*fit,clientY:30+q[1]*fit,button:0,pointerId:1,isPrimary:true,preventDefault(){}});
 assert.equal(f.state().activePointer,1);assert.equal(f.state().mode,'drag');
}
console.log('PASS: stable initial/resize/fullscreen fit, scaled pointer hits, asynchronous preparation, unchanged heading, launch, cancellation and p-p actions. DOM/canvas mocked; no browser opened.');
