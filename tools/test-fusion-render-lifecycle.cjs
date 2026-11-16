'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion');
function fixture(){
 let width=3840,height=2160,now=100,busy=false,contexts=0,programs=0,draws=0,released=0,serial=0;
 const jobs=new Map(),events=new Map(),uniforms=new Map(),buttons=[],clears=[];let scissor=false,clearColor;
 const noop=()=>{};
 class Element{
  constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.style={setProperty:noop};this.attributes={};this.classes=new Set();this.classList={toggle:(key,on)=>on?this.classes.add(key):this.classes.delete(key),contains:key=>this.classes.has(key)};}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];}
  setAttribute(key,value){this.attributes[key]=value;}
  addEventListener(key,value){this['on'+key]=value;}
  querySelector(tag){return this.children.find(child=>child.tagName===tag);}
  getBoundingClientRect(){return {left:0,top:0,right:width,bottom:height,width,height};}
 }
 const gl=new Proxy({TIMEOUT_EXPIRED:'busy',WAIT_FAILED:'failed',SCISSOR_TEST:'scissor',COLOR_BUFFER_BIT:'color',
  enable:key=>{if(key==='scissor')scissor=true;},disable:key=>{if(key==='scissor')scissor=false;},
  clearColor:(...color)=>clearColor=color,clear:()=>clears.push({scissor,color:clearColor}),
  createShader:()=>({}),createProgram:()=>{programs++;return {};},createBuffer:()=>({}),getShaderParameter:()=>true,getProgramParameter:()=>true,
  getAttribLocation:()=>0,getUniformLocation:(_,name)=>name,getAttachedShaders:()=>[{},{}],
  uniform1i:(name,value)=>uniforms.set(name,value),uniform4fv:(name,value)=>uniforms.set(name,[...value]),
  drawArrays:()=>draws++,fenceSync:()=>({}),clientWaitSync:()=>busy?'busy':'ready',getExtension:()=>({loseContext:()=>released++})
 },{get:(object,key)=>key in object?object[key]:noop});
 const nodes=Object.fromEntries(['gl','views','galleryModel','galleryPrevious','galleryNext','error','legend','note'].map(id=>[id,new Element()]));
 nodes.gl.getContext=()=>{contexts++;return gl;};
 for(const mode of ['particles','nuclei','atoms','all']){const button=new Element('button');button.dataset.galleryMode=mode;buttons.push(button);}
 const doc={body:{dataset:{galleryInitial:'particles'}},documentElement:new Element(),hidden:false,
  getElementById:id=>nodes[id],createElement:tag=>new Element(tag),querySelectorAll:()=>buttons,
  querySelector:selector=>nodes[selector==='[data-gallery-legend]'?'legend':'note']};
 const c={console,document:doc,performance:{now:()=>now},devicePixelRatio:2,
  katex:{renderToString:text=>{assert.equal(typeof text,'string');assert(!text.includes('undefined'));return text;}},
  requestAnimationFrame:fn=>{const id=++serial;jobs.set(id,fn);return id;},cancelAnimationFrame:id=>jobs.delete(id),
  addEventListener:(name,fn)=>events.set(name,fn),ResizeObserver:class{observe(){}disconnect(){}},
  matchMedia:()=>({matches:false,addEventListener:noop,removeEventListener:noop})};
 c.window=c;vm.createContext(c);
 const run=file=>vm.runInContext(fs.readFileSync(path.join(source,file),'utf8'),c,{filename:file});
 for(const file of ['particles/style.js','particles/framing.js','particles/nuclear-shader.js'])run(file);
 return {c,doc,nodes,buttons,uniforms,run,events,gl,jobs,clears,get contexts(){return contexts;},get programs(){return programs;},get draws(){return draws;},get released(){return released;},
  busy:value=>busy=value,resize:(w,h)=>{width=w;height=h;},time:value=>now=value,
  tick(value){now=value;const pending=[...jobs];jobs.clear();for(const [,fn] of pending)fn(value);},
  bounds(){assert(nodes.gl.width*nodes.gl.height<=6000000);assert(nodes.gl.width<=4096&&nodes.gl.height<=4096);assert(clears.length);assert(clears.every(item=>!item.scissor&&item.color[0]>.9&&item.color[3]===1),'Clear the entire canvas with the light background');}};
}
const f=fixture();f.run('particle-list/list.js');assert.equal(f.contexts,1);assert.equal(f.programs,1);
// The camera moves away to fit low viewports. An intersecting ray must reach the
// bounding volume even when it starts more than 20 scene units from the surface.
const cutoff=f.c.HiFyzikoNuclearShader.match(/for\(int step=0;step<(\d+);step\+\+\)\{\s*if\(([^)]+)\)break;/);
assert(cutoff);assert(Number(cutoff[1])<=128,'Ray marching must remain bounded');
const stops=vm.runInNewContext('(t,tmax)=>('+cutoff[2]+')');
for(const [width,height] of [[700,160],[1000,240],[1200,360]])for(const bound of [1.25,2.2,4.2]){
 const zoom=f.c.HiFyzikoParticleFraming.fit(width,height,bound,.57),camera=6.2/zoom,tmax=camera+3.5;
 assert(!stops(camera-3.5,tmax),'Low viewport clips an intersecting ray before it enters the model');
 assert(!stops(camera,tmax),'Camera distance must not clip the model center');assert(stops(tmax+.01,tmax),'Stop beyond the model bounds');
}
assert.equal(f.nodes.galleryModel.children.length,5);assert.equal(f.jobs.size,1);
f.tick(100);assert.equal(f.draws,5,'Render every model in the selected overview');f.bounds();
assert(f.nodes.gl.width>=3000,'Large displays must not render at thumbnail resolution');
f.tick(110);assert.equal(f.draws,5,'Limit frame rate');
f.busy(true);f.tick(200);assert.equal(f.draws,5,'Do not queue work behind a busy GPU');
f.busy(false);
let time=250;
for(let round=0;round<10;round++)for(const [i,count] of [[0,5],[1,5],[2,4],[3,13]]){
 f.buttons[i].onclick();assert.equal(f.nodes.galleryModel.children.length,count);assert.equal(f.doc.body.dataset.mode,f.buttons[i].dataset.galleryMode);
 const selected=()=>f.nodes.views.children.filter(view=>view.classList.contains('is-selected'));
 assert.equal(selected().length,1);f.nodes.galleryPrevious.onclick();assert.equal(selected()[0],f.nodes.views.children.at(-1));
 const before=f.draws;f.tick(time+=40);assert.equal(f.draws,before+count);assert.equal(f.jobs.size,1);f.bounds();
}
assert.equal(f.contexts,1,'Changing groups must reuse the graphics context');assert.equal(f.programs,1);
for(const [w,h] of [[320,240],[8000,6000],[100,20000]]){f.resize(w,h);f.tick(time+=40);f.bounds();}
f.doc.hidden=true;const beforeHidden=f.draws;f.tick(time+=40);assert.equal(f.draws,beforeHidden);f.doc.hidden=false;
f.events.get('pagehide')({persisted:true});assert.equal(f.released,0,'A cached page must remain usable on browser Back');
f.c.HiFyzikoFusionDispose();f.c.HiFyzikoFusionDispose();assert.equal(f.released,1);assert.equal(f.jobs.size,0);f.tick(time+=40);assert.equal(f.draws,beforeHidden);
const b=fixture();b.run('particles/nucleus-view.js');const painter=new b.c.HiFyzikoNucleusView(b.nodes.gl),items=[{id:'alpha',radius:50,x:100,y:100}];
painter.draw(3840,2160,0,items);assert.equal(b.draws,1);
const beforeBusy=b.draws;b.busy(true);b.time(200);painter.draw(3840,2160,2,items);assert.equal(b.draws,beforeBusy);
b.busy(false);b.time(240);painter.draw(8000,6000,3,items);assert.equal(b.draws,beforeBusy+1);
b.events.get('pagehide')({persisted:true});assert.equal(b.released,0);b.c.HiFyzikoFusionDispose();b.c.HiFyzikoFusionDispose();assert.equal(b.released,1);b.time(300);painter.draw(3840,2160,4,items);assert.equal(b.draws,beforeBusy+1);
const scaled=fixture();scaled.run('particles/nucleus-view.js');scaled.resize(425,310);
const fittedPainter=new scaled.c.HiFyzikoNucleusView(scaled.nodes.gl);fittedPainter.draw(850,620,0,items);
assert.equal(scaled.nodes.gl.width,850);assert.equal(scaled.nodes.gl.height,620,'Scaled desk uses its visible size at device pixel ratio 2');
fittedPainter.dispose();
console.log('PASS: unified gallery selection, low-viewport ray bounds, one reused context, gallery buffer/frame limits, busy GPU handling, hidden-page pause and gallery/experiment disposal. Graphics calls mocked.');
