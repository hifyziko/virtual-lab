// Geometry/observer contract. Does not substitute for real-browser visual QA.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let footerTop=724,frameTop=80,width=1334;
const style=()=>({zoom:'',removeProperty(name){delete this[name];},setProperty(name,value){this[name]=value;},getPropertyValue(name){return this[name]||'';}});
const classList={add(){},remove(){},contains(){return false;}};
const app={get clientWidth(){return width;},classList:{toggle(){}},firstElementChild:null},footer={getBoundingClientRect:()=>({top:footerTop})};
const ctx={console,innerHeight:1200,scrollY:120,location:{hash:'#am05-odpor-rotoru'},document:{getElementById:id=>id==='app'?app:footer,body:{},addEventListener(){}},matchMedia:()=>({matches:true}),getComputedStyle:element=>({paddingLeft:'0',paddingRight:'0',...element.metrics}),ResizeObserver:class{observe(){}disconnect(){}},MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame(fn){ctx.pending=fn;return 1;},addEventListener(){}};ctx.window=ctx;
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/module-window-fit.js','utf8'),ctx);
const host={get clientWidth(){return width;},querySelector:()=>null};
const stage={style:style(),classList:{contains:name=>name==='module-frame-stage'},parentElement:host};
const frame={style:style(),classList,parentElement:stage,getBoundingClientRect:()=>({top:frameTop-(ctx.scrollY||0)})};
let cssWrites=0,css='@font-face{src:url(data:font/woff2;base64,A19vh/25dvhEND)}.test{height:24vh;max-height:calc(100dvh - 40px)}.note:after{content:"123vh"}@media(min-height:900px){.test{height:490px}}';
const cssNode={get textContent(){return css;},set textContent(s){css=s;cssWrites++;}};
const content={dataset:{},offsetWidth:800,children:[],querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0})};
const doc={documentElement:{style:style()},querySelectorAll:()=>[cssNode]};
for(const [w,h,natural]of [[1334,724,950],[1888,1036,1100],[1000,724,1300]]){
 width=w;footerTop=h;
 const snapshots=[];
 for(let i=0;i<30;i++){
  ctx.prepareImportedViewport(frame,doc,h);ctx.fitImportedModule(frame,content,natural);
  snapshots.push(JSON.stringify({...frame.style}));
 }
 assert(snapshots.every(s=>s===snapshots[0]),'fitting must be idempotent across observer callbacks');
 assert.equal(frame.style.width,w+'px','viewport width comes from parent, not repeatedly shrinking child main');
 assert(!frame.style.zoom,'iframe must never use zoom');assert(frame.style.transform.includes('scale('));
 assert(css.includes('A19vh/25dvhEND'),'embedded font URLs must be byte-preserved');assert(css.includes('content:"123vh"'));
 assert(css.includes(h>=900?'@media(min-width:0px)':'@media(min-width:1000000px)'));
 assert(css.includes('calc(var(--module-host-height) * 0.24)'));
}
assert.equal(cssWrites,3,'unchanged host height must not rewrite CSS every observer notification');
const before=frame.style.transform;ctx.scrollY=0;ctx.fitImportedModule(frame,content,1300);assert.equal(frame.style.transform,before,'viewport-coordinate measurement must not count scroll twice');
console.log('PASS: 90 repeated fits across desktop/compact-window geometries, fixed viewport width, host-based vh and height media queries, no iframe zoom, font preservation, CSS idempotence and scroll invariance.');

const html=fs.readFileSync(__dirname+'/interaktivni-elektricke-stroje.html','utf8');
const payload=html.match(/const entries=(\[.*?\]);\nfor\(const entry of entries\)/s);assert(payload,'embedded module catalog');
const entries=JSON.parse(payload[1]);let tested=0;
for(const entry of entries){const styles=[...entry.source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>({textContent:m[1]}));const fonts=styles.map(s=>[...s.textContent.matchAll(/url\([^)]*\)/g)].map(m=>m[0]));const moduleDoc={documentElement:{style:style()},querySelectorAll:()=>styles};for(const h of [724,1036,724]){ctx.prepareImportedViewport(frame,moduleDoc,h);styles.forEach((s,i)=>assert.deepEqual([...s.textContent.matchAll(/url\([^)]*\)/g)].map(m=>m[0]),fonts[i],entry.id+' embedded assets'));}tested++;}
console.log('PASS: stable viewport preparation and exact embedded font/asset preservation for all '+tested+' imported modules.');

// Restore enlargement while keeping the iframe layout independent of the scale.
content.metrics={maxWidth:'1000px',boxSizing:'border-box'};doc.querySelector=()=>content;
for(const [w,h]of [[1334,724],[1888,1036],[1888,800]]){
 width=w;footerTop=h;const available=h-frameTop-4,expected=Math.round(Math.min(w/1000,available/500)*10000)/10000;
 const states=[];for(let i=0;i<40;i++){ctx.prepareImportedViewport(frame,doc,h);ctx.fitImportedModule(frame,content,500);states.push(JSON.stringify({...frame.style}));}
 assert(states.every(s=>s===states[0]),'enlargement must not oscillate');assert.equal(frame.style.width,'1000px');assert(frame.style.transform.includes('scale('+expected+')'));assert(expected>1);
 assert(Math.abs(Math.min(w-1000*expected,available-500*expected))<.1,'enlargement must fill at least one available dimension');
}
width=1888;footerTop=1036;const native={...content,style:style(),classList,offsetHeight:500,scrollHeight:500,getBoundingClientRect:()=>({top:frameTop-(ctx.scrollY||0)})};app.firstElementChild=native;
const nativeStates=[];for(let i=0;i<40;i++){ctx.pending();nativeStates.push(JSON.stringify({...native.style}));}
assert(nativeStates.every(s=>s===nativeStates[0]),'native enlargement must remain stable');assert.equal(native.style.zoom,'1.888');assert.equal(native.style.width,'1000px');
console.log('PASS: automatic enlargement up to the width/height limit at laptop and Full HD sizes; 120 stable iframe fits and 40 stable native fits.');

// Emulate viewport-dependent native content whose layout changes under CSS zoom.
const dependent={...native,style:style(),get offsetHeight(){return 500+Math.round((Number(this.style.zoom)||1)*100)},get scrollHeight(){return this.offsetHeight;}};
app.firstElementChild=dependent;
const repeated=[];for(let i=0;i<60;i++){ctx.pending();repeated.push(dependent.style.zoom);}
assert(repeated.every(z=>z===repeated[0]),'zoom-dependent natural height must settle on the first fit');
console.log('PASS: 60 stable native fits with zoom-dependent layout height.');


// Uniform lessons must obey both viewport bounds, including very tall content.
content.classList={contains:name=>name==='uniform-module-layout'};
content.metrics={maxWidth:'1600px',boxSizing:'border-box'};
for(const w of [900,1334,1888]){
 width=w;footerTop=724;
 for(const height of [420,900,1324,6000]){
  const states=[];
  for(let i=0;i<20;i++){ctx.prepareImportedViewport(frame,doc,724);ctx.fitImportedModule(frame,content,height);states.push(frame.style.transform);}
  assert(states.every(t=>t===states[0]),'fitting stays stable');
  const scale=Number(frame.style.transform.match(/scale\(([^)]+)\)/)[1]);
  assert.equal(frame.style.width,'1600px');assert(parseFloat(frame.style.width)*scale<=w+.5,'lesson fits width');
  assert(height*scale<=724-frameTop-4+.5,'lesson fits height, even below the previous minimum zoom');
 }
}
console.log('PASS: uniform lessons remain inside BOTH viewport dimensions, 240 repeated fits including 6000 px content.');


// Simulate scrollbars left over from the previous layout: neither their width
// nor the temporary fixed-footer position may feed back into the fit.
ctx.innerWidth=1366;ctx.innerHeight=2000;ctx.scrollY=0;host.parentElement=app;
let temporaryFooterTop=1941;
footer.getBoundingClientRect=()=>({top:temporaryFooterTop,height:44});
width=1351;ctx.prepareImportedViewport(frame,doc,1956);ctx.fitImportedModule(frame,content,1000);
const stableWidth=frame.style.transform;width=1366;temporaryFooterTop=1956;
ctx.prepareImportedViewport(frame,doc,1956);ctx.fitImportedModule(frame,content,1000);
assert.equal(frame.style.transform,stableWidth,'previous vertical scrollbar must not change the fitted width');
ctx.innerHeight=768;temporaryFooterTop=709;ctx.fitImportedModule(frame,content,1000);
const stableHeight=frame.style.transform;temporaryFooterTop=724;ctx.fitImportedModule(frame,content,1000);
assert.equal(frame.style.transform,stableHeight,'previous horizontal scrollbar must not change available height');
console.log('PASS: transient vertical/horizontal scrollbars cannot alter viewport inputs or cause resize drift.');

// Fullscreen enter/exit also works when the browser API is unavailable or rejected.
(async()=>{
 const source=fs.readFileSync(__dirname+'/fullscreen-navigation.js','utf8');
 const toggle=source.slice(source.indexOf('async function toggle()'),source.indexOf('window.toggleModuleFullscreen'));
 for(const capability of ['native','missing','rejected']){
  let full=false,exits=0,resizes=0,requests=0;
  const env={active:()=>full,exit:async()=>{full=false;exits++;},update(){},Event:class{},window:{dispatchEvent(){resizes++;}},document:{body:{classList:{add(){full=true;}}},documentElement:{}}};
  if(capability!=='missing')env.document.documentElement.requestFullscreen=async()=>{requests++;if(capability==='rejected')throw Error('denied');};
  vm.runInNewContext(toggle+';this.run=toggle;',env);await env.run();assert(full);await env.run();assert(!full);assert.equal(exits,1);assert.equal(resizes,1);assert.equal(requests,capability==='missing'?0:1);
 }
 assert(source.includes("e.stopImmediatePropagation();toggle();"),'one central capture handler prevents double toggles');
 console.log('PASS: fullscreen toggle with native API, missing API and rejected request; exit remains available.');
})().catch(error=>{console.error(error);process.exitCode=1;});
