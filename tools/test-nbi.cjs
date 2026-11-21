'use strict';
const assert=require('node:assert/strict');
const solve=require('../versions/vyvoj/m_files/fusion/nbi/model.js');
const norm=(a,b)=>Math.abs(a-b)/Math.max(Math.abs(b),1e-30);
const sample=solve(8,10),fine=solve(8,10,2),coarse=solve(8,10,.5);
assert.deepEqual(sample,solve(8,10));
const final=sample.energy.at(-1),ref=fine.energy.at(-1);
assert(sample.ion && !solve(1,10).ion && solve(15,10).stop<sample.stop);
assert(norm(final[0],ref[0])<.002 && norm(final[1],ref[1])<.002);
assert(Math.abs(sample.stop-fine.stop)<.003);
assert(Math.abs(sample.period-fine.period)<.025);
assert(Math.abs(coarse.stop-fine.stop)<.012);
const radius=(r,theta)=>6.2+r*Math.cos(theta);
const k=1.7,F=5.3*6.2;
function field(R,Z){
 const r=Math.hypot(R-6.2,Z/k),C=5.3*k/(1.2+2*(r/2)**2);
 return [-C*Z/(k*k*R),F/R,C*(R-6.2)/R];
}
const h=1e-4,R=6.8,Z=.4;
assert(Math.abs(((R+h)*field(R+h,Z)[0]-(R-h)*field(R-h,Z)[0])/(2*h*R)+(field(R,Z+h)[2]-field(R,Z-h)[2])/(2*h))<1e-8);
const first=sample.orbit[0];
function mu([theta,phi,u]){return (1-u*u)/Math.hypot(...field(radius(sample.r,theta),k*sample.r*Math.sin(theta)));}
for(const q of sample.orbit)assert(Math.abs(mu(q)-mu(first))<1e-7);
assert(sample.advance>0 && sample.orbit[1][0]>first[0] && sample.orbit[1][1]>first[1]);
for(const n of [1,4,8,15])for(const T of [2,10,20]){
 const s=solve(n,T);if(!s.ion){assert(Math.abs(Math.hypot(Math.hypot(s.rt,s.stop)-6.2,(-.131-s.stop*Math.tan(s.tilt))/k)-2.32)<1e-10);continue;}
 for(let i=1;i<s.energy.length;i++){const prev=s.energy[i-1],[t,l,E,e,j]=s.energy[i];assert(t>prev[0]&&l>prev[1]&&E<prev[2]&&e>prev[3]&&j>prev[4]);assert(Math.abs(E+e+j-1000)<1e-9);}
}
console.log('PASS NBI: repeatable penetration, transmission to vessel wall, field direction, magnetic moment, refinement and energy partition.',{birthY:sample.stop,seconds:final[0],residualKeV:final[2],electronKeV:final[3],ionKeV:final[4]});

 // Exercise the actual interface and the Blob worker program with a canvas adapter.
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
 const dir=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/nbi');
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),elements=new Map();
 const katex=require(path.join(dir,'../particles/vendor/katex.js'));
 function element(){return {style:{},dataset:{},attrs:{},value:0,clientWidth:840,clientHeight:500,offsetLeft:0,offsetTop:0,getBoundingClientRect:()=>({width:840}),setAttribute(name,value){this.attrs[name]=value;}};}
 for(const match of html.matchAll(/\bid="([^"]+)"/g))elements.set(match[1],element());
 const el=id=>elements.get(id);
 Object.assign(el('density'),{value:8});el('temp').value=10;el('speed').value=1;el('trace').checked=true;
 const drawing=key=>['createRadialGradient','createLinearGradient'].includes(key)?()=>({addColorStop(){}}):()=>{};
 const sceneArcs=[];
 el('scene').getContext=()=>new Proxy({},{get:(_,key)=>key==='arc'?(...args)=>sceneArcs.push(args):drawing(key)});
 Object.assign(el('profile'),{clientWidth:540,clientHeight:65});
 const microArcs=[],microSprites=[],microColors=new Set(),microDashes=new Set(),microPathPoints=[];
 el('micro').getContext=()=>{
   let ox=0,oy=0;
   const stack=[];
   return new Proxy({},{
     get:(_,key)=>{
       if(key==='save')return ()=>stack.push([ox,oy]);
       if(key==='restore')return ()=>{[ox,oy]=stack.pop();};
       if(key==='translate')return (x,y)=>{ox+=x;oy+=y;};
       if(key==='moveTo'||key==='lineTo')return (x,y)=>microPathPoints.push([x+ox,y+oy]);
       if(key==='arc')return (x,y,...args)=>microArcs.push([x+ox,y+oy,...args]);
       if(key==='drawImage')return (sprite,x,y,w,h)=>microSprites.push({sprite,x:x+ox+w/2,y:y+oy+h/2});
       if(key==='setLineDash')return pattern=>microDashes.add(pattern.join(','));
       return drawing(key);
     },
     set:(_,key,value)=>{if(key==='strokeStyle')microColors.add(value);return true;}
   });
 };
 let blob,worker,callback,timerId=0;
 const timers=new Map();
 function runTimers(){
   for(const [id,callback] of [...timers]){timers.delete(id);callback();}
 }
 const env={document:{createElement:()=>({getContext:()=>new Proxy({},{get:(_,key)=>drawing(key)})}),getElementById:el,querySelectorAll:()=>[]},computeNBI:solve,computeBeam:solve.computeBeam,scatteringExample:solve.scatteringExample,devicePixelRatio:1,performance:{now:()=>0},
   addEventListener(){},removeEventListener(){},setTimeout(fn){timers.set(++timerId,fn);return timerId;},clearTimeout(id){timers.delete(id);},cancelAnimationFrame(){},requestAnimationFrame:f=>(callback=f,1),
   katex:{renderToString:katex.renderToString,render:(tex,node)=>{node.rendered=katex.renderToString(tex,{throwOnError:true});}},
   Blob:class{constructor(parts){blob=parts.join('');}},URL:{createObjectURL:()=>'blob:test',revokeObjectURL(){}},
   Worker:class{constructor(){worker=this;}terminate(){this.closed=true;}postMessage(values){this.values=values;}}};
 vm.runInNewContext(fs.readFileSync(path.join(dir,'../plasma/field-view.js'),'utf8'),Object.assign(env,{window:env}));
 env.window=env;env.createConfinementRenderer=()=>null;env.HiFyzikoParticleStyle=require(path.join(dir,'../particles/style.js'));
 for(const script of ['cad-parameters.js','cad.js'])vm.runInNewContext(fs.readFileSync(path.join(dir,'../equilibrium',script),'utf8'),env);
 const probes=`window.probe=()=>{const f=frame();return {...f,...(!f.neutral&&kinematics(f.row))};};
 window.probeOverview=focus=>({...overviewCamera(840,500,focus),bounds:projectedBounds});
 window.probeGyro=(p,omegaD,dt)=>{
   const gyro=backgroundGyro(p,omegaD,-omegaD*dt);
   return {...gyro,point:gyroDisplacement(p,gyro.omega,gyro.phase)};
 };
 window.probeThermal=(g,p,pos,trail)=>drawThermalParticle(g,p,pos,trail,100,100,1,null);`;
 vm.runInNewContext(fs.readFileSync(path.join(dir,'app.js'),'utf8').replace('  queueCalculation();\n})();',probes+'\n  queueCalculation();\n})();'),env);
 function finishCalculation(){const w=worker,context={postMessage:data=>w.onmessage({data})};vm.runInNewContext(blob,context);context.onmessage({data:w.values});assert(w.closed);assert(!el('play').disabled);}
 assert(!elements.has('calc'));assert(el('play').disabled);assert.deepEqual([...worker.values],[8,10]);
 worker.onerror();assert(!el('retry').hidden&&!el('busy').hidden&&el('beamProgress').hidden);
 el('retry').onclick();assert(el('retry').hidden);
 finishCalculation();el('play').onclick();callback(10);el('play').onclick();assert.equal(el('play').textContent,'Přehrát');
 assert.equal(el('profile').attrs.viewBox,'0 0 540 65');
 el('profile').clientWidth=580;el('mapMode').onchange();
 assert.equal(el('profile').attrs.viewBox,'0 0 580 65');
 assert.match(el('mapScale').dataset.rendered,/kW\/m\^3/);
 assert(el('lens').hidden);el('showMicro').checked=true;el('showMicro').onchange();
 function seek(u){microArcs.length=0;microSprites.length=0;microPathPoints.length=0;sceneArcs.length=0;el('seek').value=u;el('seek').oninput();return JSON.stringify(microArcs);}
 seek(0);assert(el('lens').hidden);
 assert.doesNotMatch(html,/<section id="transfer"[^>]*\bhidden\b/);
 for(const id of ['give','gainE','gainI'])assert.equal(el(id).dataset.rendered,'\\text{—}');
 seek(.0275);assert.equal(el('lens').style.opacity,.5);
 const beforePlasma=microSprites.length;
 const wide=env.probeOverview(0),compact=env.probeOverview(1);
 assert(compact.width<wide.width/2&&compact.ratio<wide.ratio);
 for(const camera of [wide,compact]){
   const {left,right,top,bottom}=camera.bounds;
   const scale=camera.plateScale*camera.ratio;
   assert(Math.abs(camera.originX+scale*(left+right)/2-camera.width/2)<1e-10);
   assert(Math.abs(camera.originY+scale*(top+bottom)/2-250)<1e-10);
 }
 seek(.1999999);const neutral=env.probe();
 assert.equal(el('lens').style.opacity,1);
 assert(microSprites.length>beforePlasma*2);
 const sprites=new Set(microSprites.map(particle=>particle.sprite));
 assert.equal(sprites.size,4);
 assert.equal(parseFloat(el('lensParticle').style.top)+24,el('micro').clientHeight/2);
 seek(.20);const birth=env.probe();
 assert(neutral.neutral&&!birth.neutral&&birth.t>neutral.t);
 for(const color of ['#4de4ee','#ff9c52','#e093ff','#ffe459','#edf7ff'])assert(microColors.has(color));
 for(const trail of ['#849da8','#a59387','#9a8ea9','#a6a08a'])assert(microColors.has(trail));
 for(const dash of ['','9,4','5,3,1,3','1,4'])assert(microDashes.has(dash));
 assert(Math.hypot(...birth.point.map((v,i)=>v-neutral.point[i]))<1e-5);
 seek(.23);assert.match(el('phase').textContent,/Ionizace/);
 assert(!el('lensShares').hidden);
 for(const id of ['give','gainE','gainI'])assert.match(el(id).dataset.rendered,/mathrm\{(?:m|k)?eV\}/);
 const released=microSprites.at(-1),during=env.probe();
 seek(.24);const continued=env.probe();
 assert(continued.t>during.t&&continued.row[2]<during.row[2]);
 assert(Math.hypot(...continued.point.map((v,i)=>v-during.point[i]))>0);
 assert(microSprites.at(-1).x>released.x&&microSprites.at(-1).y<released.y);
 assert(microSprites.every(particle=>sprites.has(particle.sprite)));
 seek(.29);assert(env.probe().t-continued.t>5*(continued.t-during.t));
 const regularTime=env.probe().t;
 seek(.30);const regularStep=env.probe().t-regularTime;
 assert(regularStep>continued.t-during.t);
 // A positive ion rotates clockwise about +B. Equal presentation intervals use
 // equal slowing-time increments, and both axial travel and phase are seekable.
 let prior,dt;
 for(let j=0;j<32;j++){
   seek(.30+j*.021);const f=env.probe();
   assert(Math.abs(.5*3.3435838e-27*f.v*f.v/1.602176634e-16-f.row[2])<1e-10);
   assert(Math.abs(f.radius*f.omega-f.perp)<1e-8);
   assert(Math.abs(f.parallel*f.parallel+f.perp*f.perp-f.v*f.v)<.1);
   if(prior){
     const step=f.t-prior.t;
     if(dt)assert(Math.abs(step-dt)<1e-14);
     assert(f.row[2]<prior.row[2] && f.v<prior.v && f.row[5]<prior.row[5]);
     assert(f.row[3]>prior.row[3] && f.row[4]>prior.row[4]);
     assert(Math.abs((prior.row[2]-f.row[2])-(f.row[3]-prior.row[3])-(f.row[4]-prior.row[4]))<1e-9);
     const microDt=-(f.row[5]-prior.row[5])/((prior.omega+f.omega)/2);
     assert(Math.abs((f.row[6]-prior.row[6])/microDt-(prior.parallel+f.parallel)/2)<.035*f.v);
     dt=step;
   }
   prior=f;
 }
 seek(.30);const initialGyro=env.probe();
 assert(!el('lensShares').hidden);
 assert(parseFloat(el('lensElectronBar').style.width)>50);
 assert.match(el('flightTitle').dataset.rendered,/v=.*Mm\/s/);
 assert.equal(el('plot').innerHTML.match(/<polyline /g).length,3);
 assert.match(el('plot').innerHTML,/viewBox="0 0 840 500"/);
 Object.assign(el('plot'),{clientWidth:490,clientHeight:415});
 seek(.30);
 assert.match(el('plot').innerHTML,/viewBox="0 0 490 415"/);
 assert(!elements.has('follow'));
 assert.deepEqual(sceneArcs.map(arc=>arc[2]),[7,6]);
 seek(.93);
 assert(parseFloat(el('lensIonBar').style.width)>50);
 seek(1);const finalGyro=env.probe();
 assert(el('lensShares').hidden);
 assert(finalGyro.radius<initialGyro.radius);
 console.log('Reference gyro: initial/final [m/s, m]',[initialGyro.v,initialGyro.radius],[finalGyro.v,finalGyro.radius]);
 const shapes=seek(.69),totals=el('beamTotals').textContent;
 assert(!el('lens').hidden && microArcs.length>=7);assert.match(el('flightTitle').dataset.rendered,/keV/);
 assert.notEqual(seek(.8),shapes);assert.equal(seek(.69),shapes);assert.equal(el('beamTotals').textContent,totals);
 const timeline=solve.computeBeam(8,10);
 const background=timeline.bundle.thermal;
 microSprites.length=0;microPathPoints.length=0;
 env.probeThermal(el('micro').getContext(),background[0],{x:103,y:50,depth:0},[{x:95,y:50},{x:103,y:50}]);
 assert.deepEqual(microPathPoints,[[-5,50],[3,50],[95,50],[103,50]]);
 assert.deepEqual(microSprites.map(particle=>Math.round(particle.x)),[3,103]);
 assert.deepEqual(
   Object.fromEntries(['electron','deuteron','triton','alpha'].map(species=>[species,background.filter(p=>p.species===species).length])),
   {electron:30,deuteron:12,triton:15,alpha:3}
 );
 const signs=[];
 const ionOmega=2.5e8;
 for(const species of ['electron','deuteron','triton','alpha']){
   const particle={...background.find(p=>p.species===species),vy:1e6,vz:0};
   const a=env.probeGyro(particle,ionOmega,.4/ionOmega),b=env.probeGyro(particle,ionOmega,.8/ionOmega);
   const center=-particle.vy/a.omega;
   signs.push(Math.sign(a.point[0]*(b.point[1]-center)-b.point[0]*(a.point[1]-center)));
   assert.equal(Math.sign(a.omega),Math.sign(a.displayOmega));
   assert(Math.abs(a.phase)<1);
   assert(Math.abs(a.displayOmega)<=1.6*ionOmega);
   if(species!=='electron')assert.equal(a.displayOmega,a.omega);
 }
 assert(signs[0]!==0&&signs[0]===-signs[1]&&signs[1]===signs[2]&&signs[1]===signs[3]);
 const encounters=timeline.bundle.encounters;
 const encounterInterval=timeline.energy.at(-1)[0]/encounters.length*.23;
 const firstEncounter=encounters.find(encounter=>encounter.time>regularTime+4*encounterInterval);
 function seekEncounter(age){
   const time=firstEncounter.time+age*encounterInterval;
   seek(.29+.01*(time-regularTime)/regularStep);
 }
 const displayedDistance=()=>{
   const [x,y]=microArcs.findLast(arc=>arc[2]===10);
   return Math.hypot(x-parseFloat(el('lensParticle').style.left)-10,y-parseFloat(el('lensParticle').style.top)-24);
 };
 seekEncounter(-3.9);assert(!microArcs.some(arc=>arc[2]===10));
 seekEncounter(-1);const arrivalDistance=displayedDistance();
 assert(arrivalDistance>el('micro').clientHeight*.22);
 seekEncounter(0);assert(arrivalDistance>2*displayedDistance());
 seekEncounter(1);const departureDistance=displayedDistance();
 assert(departureDistance/arrivalDistance>.9&&departureDistance/arrivalDistance<1.1);
 assert(!elements.has('lensTarget'));
 seekEncounter(3.9);
 const states=firstEncounter.pairs[firstEncounter.selected],entry=states[79];
 const localTime=-3.9*entry.time,hi=states.findIndex(state=>state.time>=localTime);
 const a=states[hi-1],b=states[hi],u=(localTime-a.time)/(b.time-a.time);
 const dx=(a.p.x-a.d.x)*(1-u)+(b.p.x-b.d.x)*u,dy=(a.p.y-a.d.y)*(1-u)+(b.p.y-b.d.y)*u;
 const width=el('micro').clientWidth,height=el('micro').clientHeight;
 const factor=Math.min(width*.27,height*.34)/Math.hypot(entry.p.x-entry.d.x,entry.p.y-entry.d.y);
 const cos=Math.cos(firstEncounter.rotation),sin=Math.sin(firstEncounter.rotation);
 const x=parseFloat(el('lensParticle').style.left)+10+factor*(cos*dx+sin*dy);
 const y=parseFloat(el('lensParticle').style.top)+24+factor*(sin*dx-cos*dy);
 assert(x<-18||x>width+18||y<-18||y>height+18);
 assert(!microArcs.some(arc=>arc[2]===10&&Math.hypot(arc[0]-x,arc[1]-y)<2));
 seek(.69);
 assert.match(el('profileElectrons').attrs.d,/^M/);assert.match(el('profileIons').attrs.d,/^M/);
 el('mapMode').value='ions';el('mapMode').onchange();assert.equal(el('beamTotals').textContent,totals);
 assert.equal(el('profileElectrons').attrs.d,'');assert.match(el('profileIons').attrs.d,/^M/);
 el('mapMode').value='e';el('mapMode').onchange();assert.equal(el('beamTotals').textContent,totals);
 assert.match(el('profileElectrons').attrs.d,/^M/);assert.equal(el('profileIons').attrs.d,'');
 for(const electron of [true,false]){
   const ex=solve.scatteringExample(electron),a=ex.states[0],b=ex.states.at(-1);
   const energy=s=>s.d.E+s.p.E+s.U,total=energy(a),momentum=s=>[ex.m*s.d.vx+ex.target*s.p.vx,ex.m*s.d.vy+ex.target*s.p.vy];
   const [px,py]=momentum(a);let energyError=0,momentumError=0;
   for(const s of ex.states){
     energyError=Math.max(energyError,Math.abs(energy(s)-total)/total);
     const [qx,qy]=momentum(s);momentumError=Math.max(momentumError,Math.hypot(px-qx,py-qy)/Math.hypot(px,py));
     assert(Math.sign(s.fx*(s.d.x-s.p.x)+s.fy*(s.d.y-s.p.y))===(electron?-1:1));
   }
   assert(energyError<1e-12 && momentumError<1e-12);
   assert(Math.abs((a.d.E-b.d.E)-(b.p.E-a.p.E))<1e-8 && b.p.E>a.p.E);
   console.log({electron,transferEV:b.p.E-a.p.E,energyError,momentumError});
 }
 seek(.4);el('play').onclick();
 callback(15625);assert.match(el('flightTitle').dataset.rendered,/keV/);
 assert(Math.abs(el('seek').value-.4008)<1e-12);
 seek(.9999);el('play').onclick();
 callback(16);assert.match(el('phase').textContent,/zbytková/);
 assert.equal(el('play').textContent,'Přehrát');
 el('density').value=2;el('density').oninput();runTimers();
 const abandoned=worker;
 el('density').value=1.25;el('density').oninput();
 el('density').value=1;el('density').oninput();
 assert(abandoned.closed&&el('play').disabled&&el('seek').disabled&&timers.size===1);runTimers();
 assert.deepEqual([...worker.values],[1,10]);
 abandoned.onmessage({data:{progress:.9}});assert.equal(el('beamProgress').value,0);
 finishCalculation();
 el('seek').value=1;el('seek').oninput();assert.match(el('phase').textContent,/dopad na stěnu/);
 assert(!el('lens').hidden);assert.match(el('flightTitle').dataset.rendered,/v=0/);
 for(const id of ['give','gainE','gainI'])assert.equal(el(id).dataset.rendered,'\\text{—}');
 assert(el('loss').dataset.rendered.startsWith('1000'));env.HiFyzikoFusionDispose();
 for(const match of html.matchAll(/data-tex="([^"]+)"/g))katex.renderToString(match[1],{throwOnError:true});
 console.log('PASS NBI controls, worker dispatch, pause, seek, invalidation, shine-through loss and formula rendering (mock DOM).');

const sum=arr=>arr.reduce((a,b)=>a+b,0);
let maxBalance=0,maxPairEnergy=0,maxPairMomentum=0;
const counts=[];
for(const [density,temperature] of [[1,10],[8,10],[15,10],[1,2],[15,20]]){
 const beam=solve.computeBeam(density,temperature),{bundle}=beam;
 if(temperature===10)counts.push(bundle.births);
 const last=bundle.frames.at(-1);
 assert(Math.abs(sum(bundle.volumes)-2*Math.PI**2*6.2*1.7*2**2)<1e-10);
 assert(Math.abs(bundle.peakDensity-Math.max(...last.e.map((v,i)=>(v+last.ions[i])/bundle.volumes[i])))<1e-12);
 assert.equal(last.neutral,0);assert.equal(last.fast,0);
 assert.equal(last.wall,(128-bundle.births)*16.5/128);
 for(const f of bundle.frames){
   assert(f.e.length===16 && f.ions.length===16);
   assert([...f.e,...f.ions,f.fast,f.residual,f.neutral,f.wall].every(v=>Number.isFinite(v)&&v>=-1e-12));
   maxBalance=Math.max(maxBalance,Math.abs(sum(f.e)+sum(f.ions)+f.fast+f.residual+f.neutral+f.wall-16.5));
 }
 for(const local of bundle.encounters)for(const [j,pair] of local.pairs.entries()){
   const mass=3.3435838e-27,target=j?mass:9.1093837e-31;
   const momentum=s=>['vx','vy','vz'].map(k=>mass*s.d[k]+target*s.p[k]);
   const energy=s=>s.p.E+s.d.E+s.U,E=energy(pair[0]),P=momentum(pair[0]);
   for(const s of pair){
     maxPairEnergy=Math.max(maxPairEnergy,Math.abs(energy(s)-E)/E);
     maxPairMomentum=Math.max(maxPairMomentum,Math.hypot(...momentum(s).map((v,i)=>v-P[i]))/Math.hypot(...P));
   }
 }
 if(density===8 && temperature===10){
   const repeated=solve.computeBeam(density,temperature).bundle;
   assert.deepEqual(bundle.frames,repeated.frames);
   assert.deepEqual(bundle.encounters,repeated.encounters);
   assert(new Set(bundle.encounters.map(e=>e.rotation)).size===bundle.encounters.length);
   assert(bundle.encounters.some((e,i)=>i>0&&e.selected===bundle.encounters[i-1].selected));
   assert.equal(new Set(bundle.encounters.map(e=>e.selected)).size,2);
   assert(new Set(bundle.encounters.slice(1).map((e,i)=>e.time-bundle.encounters[i].time)).size>1);
   const rates=(a,b)=>(b[3]-a[3])/(a[2]-b[2]);
   const initial=rates(beam.energy[0],beam.energy[1]),late=rates(beam.energy.at(-2),beam.energy.at(-1));
   assert(initial>.5 && late<.5);
   console.log('Default beam MW and instantaneous electron fractions',{electrons:sum(last.e),ions:sum(last.ions),wall:last.wall,residual:last.residual,initial,late});
 }
}
assert(counts[0]<counts[1] && counts[1]<counts[2]);
assert(maxBalance<1e-10 && maxPairEnergy<1e-12 && maxPairMomentum<1e-12);
console.log('Beam and sampled pair checks',{counts,maxBalance,maxPairEnergy,maxPairMomentum});
