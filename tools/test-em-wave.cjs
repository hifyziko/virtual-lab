'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'versions/vyvoj/m_files/electromagnetic-wave'),LW=require(dir+'/lw-model.js'),LWR=require(dir+'/lw-renderer.js'),GPU=require(dir+'/field-gpu.js'),R=require(dir+'/field-renderer.js'),M=require(dir+'/model.js'),katex=require(dir+'/../fusion/particles/vendor/katex.js');
const near=(a,b,tol=1e-6)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
// Actual moving-charge model: derivatives, subluminal motion, retardation,
// Coulomb limit and independent source-free Maxwell identities.
for(const config of [{kind:'kick'},{kind:'dipole',frequency:.6},{kind:'dipole',frequency:1.4},{kind:'dipole',frequency:1.4,stopTime:2.27}]){
 for(let t=-.1;t<8;t+=.031){const h=1e-5,m=LW.motion(t,config),a=LW.motion(t-h,config),b=LW.motion(t+h,config);assert(Math.abs(m[1])<1,'Subluminal charge');near((b[0]-a[0])/(2*h),m[1],2e-6);near((b[1]-a[1])/(2*h),m[2],2e-5);for(const sign of [1,-1]){const tr=LW.retarded(.47,.63,t,config,sign);near(tr+Math.hypot(.47,.63-sign*LW.motion(tr,config)[0]),t,1e-9);}}
 for(const time of [.8,1.4,2.3,3.1]){const p=[.71,.43,.32],h=2e-5,F=(q,t)=>LW.field(...q,t,config),d=[];for(let j=0;j<3;j++){const a=p.slice(),b=p.slice();a[j]-=h;b[j]+=h;const fa=F(a,time),fb=F(b,time);d[j]={E:fb.E.map((v,i)=>(v-fa.E[i])/(2*h)),B:fb.B.map((v,i)=>(v-fa.B[i])/(2*h))};}for(const k of ['E','B'])near(d[0][k][0]+d[1][k][1]+d[2][k][2],0,2e-4);const curl=k=>[d[1][k][2]-d[2][k][1],d[2][k][0]-d[0][k][2],d[0][k][1]-d[1][k][0]],a=F(p,time-h),b=F(p,time+h);for(let i=0;i<3;i++){near(curl('E')[i],-(b.B[i]-a.B[i])/(2*h),2e-4);near(curl('B')[i],(b.E[i]-a.E[i])/(2*h),2e-4);}}
}
for(const frequency of [.6,1,1.4]){const c={kind:'dipole',burst:true,frequency};assert(Math.abs(LW.motion(LW.start+1.2/frequency,c)[2])>.001);for(const t of [LW.start+2/frequency,LW.start+3/frequency]){const m=LW.motion(t,c);near(m[0],LW.amplitude);near(m[1],0);near(m[2],0);}}
const kick={kind:'kick'},staticField=LW.field(1,0,1,0,kick);near(staticField.E[0],1/Math.sqrt(8));near(staticField.E[2],1/Math.sqrt(8));near(Math.hypot(...staticField.B),0);
assert.deepEqual(LW.field(2,0,0,1,kick),LW.field(2,0,0,0,kick),'Outside the causal front the field is unchanged');
assert(Math.hypot(...LW.field(.7,0,.1,1.8,kick).B)>.01,'Magnetic field appears with delayed motion');
near(Math.hypot(...LW.field(.3,0,0,3,kick).B),0,1e-9);
// Causality and smooth transitions, checked against independent finite differences.
for(const frequency of [.6,1,1.4])for(const config of [{frequency},{frequency,burst:true},{frequency,stopTime:2.27}]){
 for(let t=-.1;t<9;t+=.037){const h=1e-5,s=M.source(t,config),a=M.source(t-h,config),b=M.source(t+h,config);near((b.p-a.p)/(2*h),s.dp,2e-6);near((b.dp-a.dp)/(2*h),s.ddp,2e-5);}
 for(const t of [0,1/frequency,config.stopTime??4/frequency,(config.stopTime??4/frequency)+1/frequency]){const a=M.source(t-1e-8,config),b=M.source(t+1e-8,config);for(const k of ['p','dp','ddp'])near(a[k],b[k],3e-5);}
 near(Math.hypot(...M.field(2,0,0,1,config).E),0);
}
const off={stopTime:3};near(M.source(4.5,off).p,0);assert(Math.hypot(...M.field(2,0,0,4.37,off,'radiation').E)>1);near(Math.hypot(...M.field(2,0,0,6.1,off).E),0);
for(const r of [.5,1,4]){const a=M.field(r,0,0,8.23+r,{},'radiation'),b=M.field(2*r,0,0,8.23+2*r,{},'radiation');for(let i=0;i<3;i++)near(a.E[i],2*b.E[i]);}
for(const xyz of [[2,0,1],[-1,2,-3],[0,0,2]]){const f=M.field(...xyz,7.23,{},'radiation'),n=xyz.map(v=>v/Math.hypot(...xyz));near(dot(n,f.E),0);near(dot(n,f.B),0);near(dot(f.E,f.B),0);near(Math.hypot(...f.E),Math.hypot(...f.B));assert(dot(n,f.S)>=-1e-9);}
near(Math.hypot(...M.field(0,0,2,7.23,{},'radiation').E),0);
// Source-free Maxwell curl/divergence identities, including near-field terms.
const p=[.71,.43,.92],t=3.14,h=1e-5,F=(q,u)=>M.field(...q,u),base=F(p,t),der=[];
for(let j=0;j<3;j++){const a=p.slice(),b=p.slice();a[j]-=h;b[j]+=h;const fa=F(a,t),fb=F(b,t);der[j]={E:fb.E.map((v,i)=>(v-fa.E[i])/(2*h)),B:fb.B.map((v,i)=>(v-fa.B[i])/(2*h))};}
for(const key of ['E','B'])near(der[0][key][0]+der[1][key][1]+der[2][key][2],0,1e-5);
const curl=key=>[der[1][key][2]-der[2][key][1],der[2][key][0]-der[0][key][2],der[0][key][1]-der[1][key][0]],prev=F(p,t-h),next=F(p,t+h);
for(let i=0;i<3;i++){near(curl('E')[i],-(next.B[i]-prev.B[i])/(2*h),2e-5);near(curl('B')[i],(next.E[i]-prev.E[i])/(2*h),2e-5);}
const html=fs.readFileSync(dir+'/index.html','utf8');for(const m of html.matchAll(/data-tex="([^"]+)"/g))katex.renderToString(m[1],{throwOnError:true});
// Technical renderer: explicit fixed scales, fast sampler equivalence and actual field tangency.
for(const mode of ['linear','log'])for(const signed of [false,true])for(const v of signed?[-3,-.4,0,.3,3]:[0,.02,.3,3])near(R.inverse(R.normalize(v,3,mode,signed),3,mode,signed),v);
assert.deepEqual(R.color(.5,true),[241,245,248]);assert.deepEqual(R.color(-2),R.color(0));assert.deepEqual(R.color(2),R.color(1));
for(const part of ['total','radiation'])for(let t=.1;t<6;t+=.37)for(const p of [[.3,.2],[1.1,-.9],[-2,1.7]]){const a=M.field(p[0],0,p[1],t,{},part),b=M.section(...p,t,{},part);near(a.E[0],b[0]);near(a.E[2],b[1]);near(a.B[1],b[2]);const s=R.sample(M,...p,t,{},part);near(s.E,Math.hypot(...a.E)/R.REF);}
for(const part of ['total','radiation'])for(const seed of [[1,.5],[-1.8,.7],[.4,.2]]){const curve=R.trace(M,seed,4.4,{},part);assert(curve.length>20);let checked=0;for(let i=2;i<curve.length-2;i++){const p=curve[i],f=M.section(...p,4.4,{},part),d=[curve[i+1][0]-curve[i-1][0],curve[i+1][1]-curve[i-1][1]],n=Math.hypot(f[0],f[1])*Math.hypot(...d);assert(p.every(Number.isFinite));if(n>.01&&Math.hypot(...p)>.3){assert((f[0]*d[0]+f[1]*d[1])/n>.97,'Field line follows E');checked++;}if(part==='radiation')near(Math.hypot(...p),Math.hypot(...seed),.001);}assert(checked>10);}
// Execute the real app, including handlers and KaTeX, without opening a browser.
const napi=process.env.EM_CANVAS_MODULE?require(process.env.EM_CANVAS_MODULE):null,nodes=new Map(),buttons=[],moments=[],labels=[];let raf,frameCount=0;
const noop=()=>{},size={scene:[1080,503],graph:[1080,145],antenna:[244,200]},fake=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:noop});
function element(tag='div',id=''){const el=napi&&tag==='canvas'?napi.createCanvas(100,100):{};Object.assign(el,{id,dataset:{},style:{},children:[],value:'',checked:false,open:false,parentElement:{dataset:{}},setAttribute(k,v){this[k]=v;},append(q){this.children.push(q);},replaceChildren(){this.children=[];},querySelector(q){const key=q.match(/data-key="([^"]+)"/)?.[1];return this.children.find(e=>e.dataset.key===key)||null;},getBoundingClientRect(){const [width,height]=size[id]||[200,100];return {width,height};},setPointerCapture:noop,showModal(){this.open=true;},close(){this.open=false;}});if(!napi||tag!=='canvas')el.getContext=()=>fake;return el;}
for(const m of html.matchAll(/<(\w+)\b[^>]*\bid="([^"]+)"[^>]*>/g)){const e=element(m[1],m[2]);e.value=m[0].match(/\bvalue="([^"]+)"/)?.[1]||'';e.checked=/\bchecked\b/.test(m[0]);nodes.set(m[2],e);}
nodes.get('extent').value='1.4';nodes.get('baseline').checked=true;nodes.get('quantity').value='delta';nodes.get('overlay').value='lines';nodes.get('scaleMode').value='log';nodes.get('mapRange').value='3';nodes.get('bands').value='smooth';nodes.get('part').value='total';nodes.get('speed').value='.5';
for(const v of [0,.95,2.25]){const b=element();b.dataset.moment=String(v);moments.push(b);}
for(const v of ['antenna','wave']){const b=element();b.dataset.view=v;buttons.push(b);}
const sandbox={console,Math,EMWaveModel:M,EMFieldRenderer:R,EMLWModel:LW,EMLWRenderer:LWR,EMFieldGPU:GPU,HiFyzikoParticleStyle:{fields:{electric:'#b57825',magnetic:'#356ac3'}},devicePixelRatio:1,getComputedStyle:()=>({getPropertyValue:()=>1}),katex:{render(s,el){assert(!/[\x00-\x1f]/.test(s),'Invalid escaped TeX');el.tex=s;katex.renderToString(s,{throwOnError:true});}},document:{hidden:false,documentElement:{},getElementById:id=>nodes.get(id),createElement:tag=>element(tag),querySelectorAll:q=>q==='[data-view]'?buttons:q==='[data-moment]'?moments:[]},requestAnimationFrame:f=>{raf=f;return ++frameCount;},cancelAnimationFrame:()=>raf=null,addEventListener:noop,removeEventListener:noop};sandbox.window=sandbox;
vm.runInNewContext(fs.readFileSync(dir+'/app.js','utf8'),sandbox);const click=id=>nodes.get(id).onclick();
function save(name){if(!napi||!process.env.EM_RENDER_DIR)return;fs.mkdirSync(process.env.EM_RENDER_DIR,{recursive:true});for(const id of ['scene','graph','antenna']){const src=nodes.get(id),out=napi.createCanvas(src.width,src.height),ctx=out.getContext('2d');ctx.fillStyle='#f8fafb';ctx.fillRect(0,0,out.width,out.height);ctx.drawImage(src,0,0);fs.writeFileSync(path.join(process.env.EM_RENDER_DIR,name+'-'+id+'.png'),out.toBuffer('image/png'));}}
save('static');moments[1].onclick();assert.equal(nodes.get('time').value,.95);save('bend');moments[2].onclick();assert.equal(nodes.get('extent').value,'2.4');save('departure');nodes.get('quantity').value='Ez';nodes.get('quantity').onchange();save('signed');nodes.get('quantity').value='E';nodes.get('quantity').onchange();buttons[1].onclick();save('wave');
const clock=nodes.get('time').value;click('theory');raf(100);assert.equal(nodes.get('time').value,clock,'Guide must not advance time');click('closeHelp');
nodes.get('excitation').value='continuous';nodes.get('excitation').onchange();nodes.get('time').value=3.8;nodes.get('time').oninput();assert.equal(nodes.get('play').textContent,'Pokračovat');click('stop');assert(nodes.get('stop').disabled);click('reset');assert.equal(nodes.get('time').value,0);assert(!nodes.get('stop').disabled);
for(const f of [60,100,140]){nodes.get('frequency').value=f;nodes.get('frequency').oninput();for(const probe of [.3,1.3,2.7]){nodes.get('probe').value=probe;nodes.get('probe').oninput();for(const v of buttons)v.onclick();}}
nodes.get('excitation').value='burst';nodes.get('excitation').onchange();assert(nodes.get('stop').disabled);nodes.get('scene').onpointerdown({clientX:0,clientY:0,pointerId:1});nodes.get('scene').onpointermove({clientX:200,clientY:100});nodes.get('scene').onpointerup();click('camera');
for(const id of ['showE','showB','showS']){nodes.get(id).checked=!nodes.get(id).checked;nodes.get(id).onchange();}nodes.get('part').value='radiation';nodes.get('part').onchange();buttons[0].onclick();for(const [id,values] of [['quantity',['E','Ez','B']],['overlay',['lines','vectors','none']],['scaleMode',['linear','log']],['mapRange',['1','3','10']],['bands',['smooth','bands']]])for(const v of values){nodes.get(id).value=v;nodes.get(id).onchange();}sandbox.HiFyzikoFusionDispose();assert.equal(raf,null);
console.log('PASS: Moving-charge LW and dipole physics, retardation, Maxwell equations, subluminal motion, presets, controls, KaTeX and disposal. No browser opened.');
