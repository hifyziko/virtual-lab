// Numerical DOM contract test. Does not open a browser or claim visual QA.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const style=()=>({setProperty(k,v){this[k]=v},getPropertyValue(k){return this[k]||''},removeProperty(k){delete this[k]}});
let width=1334,height=900;
const cls={contains:n=>n==='uniform-module-layout',add(){},remove(){}};
const heading={style:style(),get offsetHeight(){return parseFloat(this.style.width)<600?90:64},getBoundingClientRect:()=>({top:80})};
const host={get clientWidth(){return width},querySelector:()=>heading};
const stage={style:style(),classList:{contains:n=>n==='machine-frame-stage'},parentElement:host};
const frame={style:style(),classList:cls,parentElement:stage,getBoundingClientRect:()=>({top:156})};
const main={style:style(),classList:cls,dataset:{machineViewport:'sm01-princip'},offsetLeft:0,scrollWidth:1600,querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0})};
const doc={querySelector:()=>main,querySelectorAll:()=>[],documentElement:{style:style()}};
const ctx={console,innerHeight:1800,document:{addEventListener(){},body:{},getElementById:id=>id==='app'?{}:{getBoundingClientRect:()=>({top:height})}},matchMedia:()=>({matches:true}),getComputedStyle:()=>({paddingLeft:'22',paddingRight:'22',marginTop:'0',marginBottom:'12'}),ResizeObserver:class{observe(){}disconnect(){}},MutationObserver:class{observe(){}},requestAnimationFrame(){},addEventListener(){}};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/module-window-fit.js','utf8'),ctx);
let count=0,enlarged=false;
for(const id of ['am01-princip','sm01-princip','sm02-schema','sm03-torque','sm04-transients','sm05-isolated','sm06-torque-origin','sm07-dq','sm08-rotor-dq','sm09-pmsm-phasor','sm10-pmsm-drive','sm11-v-curves','sm12-synchronizing']){
 main.dataset.machineViewport=id;
 for(const [w,h]of [[900,650],[1366,768],[1920,1080],[2560,1800],[768,1024]])for(const extent of [1600,1624,1760]){
  width=w;height=h;main.scrollWidth=extent;let prior;
  for(let i=0;i<20;i++){
   ctx.prepareImportedViewport(frame,doc,h);ctx.fitImportedModule(frame,main,1000);
   assert.equal(parseFloat(frame.style.width),extent);
   const scale=+frame.style.transform.match(/scale\(([^)]+)/)[1];enlarged ||= scale>1;
   assert(Math.abs(+main.style.getPropertyValue('--module-scene-scale')-scale)<.00011,'Text correction uses the fitted scene scale');
   assert(extent*scale<=w-44+.01,'no right clipping');
   const headZoom=Number(heading.style.zoom),headHeight=heading.offsetHeight+12;
   assert(Math.abs(headZoom-Math.min(1,scale/.8))<.0002,'heading uses fusion scale');
   assert(1000*scale+headHeight*headZoom<=h-80-4+.1,'navigation, lesson and credit fit vertically');
   assert(Math.abs(parseFloat(heading.style.width)*Number(heading.style.zoom)-extent*scale)<.01,'heading follows complete lesson width');
   assert(Math.abs(parseFloat(stage.style.height)-1000*scale)<.01,'stage reserves only the displayed height');
   assert.equal(frame.style.position,'absolute','unscaled iframe does not enlarge page layout');
   const available=h-80-4;
   const heightLimit=available>=800+headHeight?(available-headHeight)/1000:available/(1000+headHeight/.8);
   const ideal=Math.min((w-44)/extent,heightLimit);
   assert(Math.abs(scale-ideal)<.0002,'scale uses the actual lesson width and wrapped heading height');
   const snapshot=JSON.stringify([frame.style,heading.style]);if(prior)assert.equal(snapshot,prior,'repeated fitting stable');prior=snapshot;count++;
  }
 }
}
assert(enlarged,'automatic enlargement preserved');console.log('PASS synchronous window contract:',count,'fits across 13 lessons, 5 viewport sizes, 3 content widths; header alignment, no clipping, stable scale, enlargement preserved');

const computedStyle=ctx.getComputedStyle;
ctx.getComputedStyle=element=>({...computedStyle(element),getPropertyValue:name=>name==='--module-flexible-height'&&element===main?'1':''});
main.scrollWidth=1600;
for(const [w,h] of [[900,650],[1366,768],[1366,1600],[768,1024]]){
 width=w;height=h;
 let previous;
 for(let i=0;i<10;i++){
  ctx.prepareImportedViewport(frame,doc,h);
  const logicalHeight=parseFloat(doc.documentElement.style.getPropertyValue('--module-host-height'));
  ctx.fitImportedModule(frame,main,logicalHeight);
  const visibleHeight=parseFloat(stage.style.height)+(heading.offsetHeight+12)*Number(heading.style.zoom);
  assert(Math.abs(visibleHeight-(h-80-4))<1,'flexible lesson fills the available window height');
  if(h>=1024)assert(logicalHeight>1400,'tall windows can exceed the old height limit');
  if(previous!==undefined)assert.equal(logicalHeight,previous,'height remains stable after fitting');
  previous=logicalHeight;
 }
}

// Verify real embedded payloads, including the two independently registered lessons.
const page=fs.readFileSync(__dirname+'/interaktivni-elektricke-stroje.html','utf8');
const entries=JSON.parse(page.match(/const entries=(\[.*?\]);\nfor\(const entry of entries\)/s)[1]);
const lessons=entries.filter(e=>e.id.startsWith('sm'));
for(const [marker,id] of [['sync-dq','sm07-dq'],['sync-rotor-dq','sm08-rotor-dq']]){
 const block=page.match(new RegExp('<!-- '+marker+':start -->[\\s\\S]*?<!-- '+marker+':end -->'))?.[0];
 assert(block,id+' registration exists');
 lessons.push({id,source:JSON.parse(block.match(/const source=("(?:\\.|[^"\\])*");/)[1])});
 assert(!block.includes("head?.style.removeProperty('width')"),id+' keeps the fitted header on narrow screens');
}
assert.equal(lessons.length,12,'all synchronous iframe lessons, including drafts');
for(const {id,source} of lessons){
 assert(source.includes('data-machine-viewport="'+id+'"'),id+' logical viewport');
 assert(source.includes('<style id="machine-window-layout">'),id+' shared machine layout');
 assert(source.indexOf('<style id="machine-window-layout">')<source.indexOf('</head>'),id+' layout available before first paint');
 assert(source.includes('uniform-module-layout'),id+' shared scaling contract');
 assert(source.includes('katex'),id+' math renderer retained');
}
assert(page.includes('data-module="09-synchronni"')||page.includes('id:"09-synchronni"'),'native synchronous module retained');
console.log('PASS: all 12 real synchronous lesson payloads share the viewport and initial styles; d–q headers and KaTeX retained.');


const am=entries.find(e=>e.id==='am01-princip');assert(am.source.includes('data-machine-viewport="am01-princip"'));assert(am.source.includes('.machine-view{flex:1 1 0;min-height:0}'),'Released height belongs to the machine drawings');
