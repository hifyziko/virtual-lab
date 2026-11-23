'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const dir='versions/vyvoj/m_files/fusion/conductivity/',M=require('../'+dir+'model.js');
const a=M.parameters(0),b=M.parameters(1);assert.equal(a.metalR,1);assert.equal(a.plasmaR,1);assert(Math.abs(b.metalR-2.212121212121212)<1e-12);assert(Math.abs(b.plasmaR-.03162277660168379)<1e-12);assert(Math.abs(a.metalC-26.85)<1e-10);assert(Math.abs(a.plasmaK-11604518.12)<.01);
let prev=a;for(let i=1;i<=100;i++){const p=M.parameters(i/100);assert(p.metalR>prev.metalR&&p.plasmaR<prev.plasmaR&&p.amplitude>prev.amplitude&&p.thermal>prev.thermal);prev=p;}
function energy(p){return .5*(p.vx*p.vx+p.vy*p.vy)-1/Math.hypot(p.x,p.y);}
function angular(p){return p.x*p.vy-p.y*p.vx;}
let angle=Infinity;for(const T of [1,2,4,7,10]){const points=M.trajectory(T),first=points[0],last=points.at(-1),theta=Math.abs(Math.atan2(last.vy,last.vx));assert(theta<angle);angle=theta;assert(last.vy<0,'electron bends toward proton');for(const p of points){assert(Math.abs(energy(p)-energy(first))<2e-5);assert(Math.abs(angular(p)-angular(first))<1e-10);}const fine=M.trajectory(T,.002).at(-1);assert(Math.abs(Math.atan2(fine.vy,fine.vx)-Math.atan2(last.vy,last.vx))<2e-5);}
assert.deepEqual(M.acceleration(1,0),[-1,-0]);assert.deepEqual(M.acceleration(0,-2),[-0,.25]);
// The arrow uses the sum of applied field, ion attraction and electron repulsion.
const proton={x:0,y:0,vx:0,vy:0};
const testElectron={x:1,y:0,vx:0,vy:0};
const fieldOnly=M.plasmaForce(testElectron,[],[]);
assert(fieldOnly.ax<0);
assert.equal(fieldOnly.ay,0);
assert.deepEqual(M.plasmaForce(testElectron,[],[testElectron]),fieldOnly);
const attraction=M.plasmaForce(testElectron,[proton],[]).ax-fieldOnly.ax;
const repulsion=M.plasmaForce(testElectron,[],[proton]).ax-fieldOnly.ax;
assert(attraction<0 && repulsion>0);
assert(Math.abs(attraction+repulsion)<1e-15);
const acrossBoundary=M.plasmaForce({x:11,y:0},[proton],[]).ax-fieldOnly.ax;
assert(Math.abs(acrossBoundary+attraction)<1e-15);

function potential(dx,dy,sign,field=M.plasmaField){
 const radius=Math.hypot(dx,dy,field.core);
 return sign*field.strength*Math.exp(-radius/field.screen)/radius;
}
const epsilon=1e-5;
const gradient=(potential(1+epsilon,0,-1)-potential(1-epsilon,0,-1))/(2*epsilon);
assert(Math.abs(gradient+attraction)<1e-10);
const withoutField={field:0,periodic:false};
const velocityAngle=e=>Math.atan2(e.vy,e.vx);
const degrees=radians=>radians*180/Math.PI;

function scatter(temperature,impact,dt,field=M.plasmaField){
 const v=1.2*Math.sqrt(temperature);
 const electron={x:-2,y:impact,vx:v,vy:0};
 const ion={...proton};
 const initialEnergy=.5*v*v+potential(electron.x,electron.y,-1,field);
 let maxError=0;
 for(let t=0,end=5/v;t<end;){
  const step=Math.min(dt,end-t);
  M.plasmaStep([electron],[ion],step,{...withoutField,potential:field});
  const energy=.5*(electron.vx**2+electron.vy**2)+potential(electron.x,electron.y,-1,field);
  maxError=Math.max(maxError,Math.abs(energy-initialEnergy)/Math.abs(initialEnergy));
  t+=step;
 }
 return {angle:degrees(velocityAngle(electron)),maxError};
}

// Compare the packaged potential and the candidate at the same injection speed and impact.
const original={strength:.04,screen:.55,core:.01};
for(const temperature of [1,10]){
 const before=scatter(temperature,.18,.004,original);
 const after=scatter(temperature,.18,.004);
 assert(after.angle<before.angle*2.5,'representative pass bends more visibly');
 for(const impact of [0,.01,.03,.08,.18,.3]){
  const result=scatter(temperature,impact,.004);
  const fine=scatter(temperature,impact,.00025);
  assert(Number.isFinite(result.angle) && result.maxError<.008,'finite close pass with bounded energy error');
  assert(Math.abs(result.angle-fine.angle)<.3,'outgoing angle converges on step refinement');
  assert(Math.abs(result.angle)<70,'no sharp reversal in the sampled passes');
  if(impact>0)assert(result.angle<0,'electron bends toward the ion');
 }
}
const coldPass=scatter(1,.18,.004),hotPass=scatter(10,.18,.004);
assert(coldPass.angle<-40 && hotPass.angle>-6);

// The same pair receives opposite impulses even across the periodic boundary.
const pairStart=[{x:11.85,y:3,vx:.8,vy:.34},{x:.12,y:3.05,vx:-.5,vy:-.24}];
const pair=pairStart.map(e=>({...e})),disabled=pairStart.map(e=>({...e}));
const options={field:0};
const mean=M.plasmaMoments(pair);
M.plasmaStep(disabled,[],.04,{...options,electronRepulsion:false});
M.plasmaStep(pair,[],.04,options);
assert(pair[0].vx<disabled[0].vx && pair[1].vx>disabled[1].vx);
for(let i=0;i<250;i++)M.plasmaStep(pair,[],.004,options);
const afterPair=M.plasmaMoments(pair);
assert(Math.hypot(afterPair.vx-mean.vx,afterPair.vy-mean.vy)<1e-14);

// Compare the old exact projection and the gradual bath after the same force step.
const raw=[{x:0,y:0,vx:1.2,vy:.4},{x:1,y:1,vx:-.3,vy:.2},{x:2,y:1,vx:.5,vy:-1.1}];
const step=.004,drift=-.014;
M.plasmaStep(raw,[{x:.09,y:.02,vx:.12,vy:.03}],step);
const moments=M.plasmaMoments(raw);
const projected=raw.map(e=>({vx:drift+(e.vx-moments.vx)*1.2/moments.rms,vy:(e.vy-moments.vy)*1.2/moments.rms}));
const relaxed=raw.map(e=>({...e}));
M.relaxPlasma(relaxed,1.2,step);
const newMoments=M.plasmaMoments(relaxed),oldMoments=M.plasmaMoments(projected);
assert(Math.abs(oldMoments.vx-drift)<1e-15 && Math.abs(oldMoments.rms-1.2)<1e-15);
assert(Math.abs(newMoments.vx-moments.vx)<.001 && Math.abs(newMoments.vy-moments.vy)<.001);
assert(Math.abs(newMoments.rms-moments.rms)<Math.abs(oldMoments.rms-moments.rms)/100);
const change=particles=>Math.max(...particles.map((e,i)=>Math.hypot(e.vx-raw[i].vx,e.vy-raw[i].vy)));
assert(change(relaxed)<change(projected)/100,'brief force-induced velocity changes survive the bath');

const moving=new M.Model(),ionStart=moving.ions.map(p=>[p.x,p.y]),ionSpeed=moving.ions.map(p=>Math.hypot(p.vx,p.vy));moving.setHeating(1);moving.step(1);assert(moving.ions.some((p,i)=>p.x!==ionStart[i][0]));assert.deepEqual(moving.ions.map(p=>Math.hypot(p.vx,p.vy)),ionSpeed,'electron heating does not heat the ion background');
const cold=new M.Model(),hot=new M.Model();hot.setHeating(1);for(let i=0;i<2400;i++){cold.step(.025);hot.step(.025);}
const events=model=>model.groups.metal.reduce((total,e)=>total+e.phononEvents,0);
assert(events(cold)>0 && events(hot)>events(cold)*1.8);
const stationary=M.metalLattice(0,0),stationaryElectron={x:1,y:1,vx:1.2,vy:0,phononEvents:0};
M.metalAdvance(stationaryElectron,.004,stationary,stationary,0,()=>{throw Error('No phonon event for stationary lattice');});
assert.equal(stationaryElectron.vy,0);
assert.equal(stationaryElectron.vx,1.2);
assert.equal(stationaryElectron.phononEvents,0);
const vibratingNode=M.metalLattice(0,a.amplitude*6).nodes.find(node=>node.range>.05);
const isolatedNode={nodes:[vibratingNode]};
const midForce=M.metalDisturbance(vibratingNode.x+vibratingNode.range/2,vibratingNode.y,isolatedNode);
assert(midForce.fx>0 && midForce.fy===0,'the disturbance deflects electrons outward');
assert.deepEqual(M.metalDisturbance(vibratingNode.x+1.01*vibratingNode.range,vibratingNode.y,isolatedNode),{fx:0,fy:0});
const periodicLattice=M.metalLattice(.3,b.amplitude*6);
const {width:metalWidth,height:metalHeight}=M.metalCell;
const edgeNode={...vibratingNode,x:.15,y:2,range:.5};
const edgeLattice={nodes:[edgeNode],vibrating:true};
assert(M.metalDisturbance(metalWidth-.1,2,edgeLattice).fx<0,'the nearest image exerts force across the edge');
assert(M.metalPhononRate(metalWidth-.1,2,edgeLattice)>0,'scattering also crosses the edge');
for(const [x,y] of [[.03,4],[metalWidth-.03,2],[2,.03],[2,metalHeight-.03]]){
 const f=M.metalDisturbance(x,y,periodicLattice);
 const rate=M.metalPhononRate(x,y,periodicLattice);
 for(const [dx,dy] of [[metalWidth,0],[-metalWidth,0],[0,metalHeight],[0,-metalHeight]]){
  const copy=M.metalDisturbance(x+dx,y+dy,periodicLattice);
  assert(Math.hypot(copy.fx-f.fx,copy.fy-f.fy)<1e-12);
  assert(Math.abs(M.metalPhononRate(x+dx,y+dy,periodicLattice)-rate)<1e-12);
 }
}
for(const model of [cold,hot]){
 assert.equal(model.metalLattice.nodes.length,32);
 assert.equal(model.groups.metal.length,32);
 assert.equal(model.groups.plasma.length,model.ions.length);
 assert(model.groups.metal.every(e=>Number.isFinite(e.vx+e.vy)&&e.x>=0&&e.x<12&&e.y>=0&&e.y<7));
}
const metalSpeeds=hot.groups.metal.map(e=>Math.hypot(e.vx,e.vy));
hot.setHeating(0);
assert.deepEqual(hot.groups.metal.map(e=>Math.hypot(e.vx,e.vy)),metalSpeeds);
hot.setHeating(1);
assert(Math.abs(hot.drift.metal/-.014-1/b.metalR)<1e-9);assert(Math.abs(hot.drift.plasma/-.014-1/b.plasmaR)<.7);assert(hot.groups.plasma.every(p=>[p.x,p.y,p.angle].every(Number.isFinite)));
assert(Math.abs(cold.driftDistance.metal+.014*60)<1e-10,'drift strip integrates the actual drift, independently of thermal motion');assert(hot.driftDistance.metal>cold.driftDistance.metal);assert(hot.driftDistance.plasma<cold.driftDistance.plasma);
// Long-running animation stays thermal with mobile ions, while transport is independent.
for(const model of [cold,hot]){
 const electrons=model.groups.plasma,{vx,vy,rms}=M.plasmaMoments(electrons);
 const target=1.2*model.p.thermal;
 assert(Math.hypot(vx,vy)<.2*target);
 assert(Math.abs(rms-target)<.15*target);
 assert(electrons.filter(e=>e.vx>0).length>=6 && electrons.filter(e=>e.vx<0).length>=6);
 assert(Math.abs(vx-model.drift.plasma)>1e-4,'micro mean is not imposed by transport');
 assert(electrons.every(e=>e.x>=0 && e.x<12 && e.y>=0 && e.y<7 && Number.isFinite(e.vx+e.vy)));
}
const heated=new M.Model(),coldMoments=M.plasmaMoments(heated.groups.plasma);
const electronPositions=heated.groups.plasma.map(e=>[e.x,e.y]);
heated.setHeating(1);
assert(Math.abs(M.plasmaMoments(heated.groups.plasma).rms/coldMoments.rms-Math.sqrt(10))<1e-14);
assert.deepEqual(heated.groups.plasma.map(e=>[e.x,e.y]),electronPositions);

const positions=hot.groups.metal.map(p=>[p.x,p.y]);hot.setHeating(0);assert.deepEqual(hot.groups.metal.map(p=>[p.x,p.y]),positions,'slider never teleports particles');
// Real UI plus real KaTeX; canvas calls are checked for finite arguments.
const html=fs.readFileSync(dir+'index.html','utf8'),nodes=new Map(),noop=()=>{},katex=require('../versions/vyvoj/m_files/fusion/particles/vendor/katex.js');let callbacks=[],draws=0,liveModel;
assert.match(html,/<svg id="metalDetail"\s/);
assert.match(html,/> iontů<\/span>/);
assert.match(html,/> volných elektronů v buňce<\/span>/);
const header=html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)[1];
for(const id of ['heating','heatingValue','play','reset','help'])assert(header.includes('id="'+id+'"'));
const canvasFrames=new Map();
function canvasContext(id){
 const frame={arcs:[],lines:[]};
 canvasFrames.set(id,frame);
 const state={createRadialGradient:()=>({addColorStop:noop})};
 let path=[];
 return new Proxy(state,{get:(o,k)=>o[k]||((...args)=>{
  for(const a of args)if(typeof a==='number')assert(Number.isFinite(a));
  draws++;
  if(k==='clearRect'){frame.arcs=[];frame.lines=[];}
  if(k==='arc')frame.arcs.push(args.slice(0,3));
  if(k==='beginPath')path=[];
  if(k==='moveTo'||k==='lineTo')path.push(args);
  if(k==='stroke'&&['#a7adb4','#929da6','#b97939'].includes(o.strokeStyle))frame.lines.push(path);
 })});
}
for(const [,id] of html.matchAll(/id="([^"]+)"/g)){
 const ctx=canvasContext(id);
 nodes.set(id,{dataset:{},style:{setProperty(k,v){this[k]=v;}},checked:id==='metalZones',value:'0',clientWidth:640,clientHeight:240,getContext:()=>ctx,setAttribute(k,v){this[k]=v;},showModal(){this.open=true;}});
}
const formulas=[...html.matchAll(/data-tex="([^"]+)"/g)].map(m=>({dataset:{tex:m[1]}}));
const c={Conductivity:{...M,Model:class extends M.Model{constructor(){super();liveModel=this;}}},HiFyzikoParticleStyle:require('../versions/vyvoj/m_files/fusion/particles/style.js'),document:{hidden:false,getElementById:id=>nodes.get(id),querySelectorAll:()=>formulas},devicePixelRatio:1,katex:{render:(t,n)=>{n.html=katex.renderToString(t,{throwOnError:true});}},requestAnimationFrame:fn=>{callbacks.push(fn);return callbacks.length;},cancelAnimationFrame:noop};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(dir+'app.js','utf8'),c);
function verifyProjection(kind){
 const node=nodes.get(kind),markup=node.innerHTML;
 const points=id=>[...markup.matchAll(new RegExp('<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)" fill="url\\(#'+kind+'-'+id+'\\)"','g'))]
  .map(match=>match.slice(1).map(Number));
 const h=Math.max(40,node.clientHeight-64),w=node.clientWidth,scale=Math.min(w/12,h/7);
 const sx=kind==='metal'?scale:w/12,sy=kind==='metal'?scale:h/7;
 const X=x=>(w-12*sx)/2+x*sx,Y=y=>(h-7*sy)/2+y*sy;
 const electrons=points('e');
 assert.deepEqual(electrons.map(([x,y])=>[x,y]),liveModel.groups[kind].map(e=>[X(e.x),Y(e.y)]),
  'every electron is drawn at its actual numerical position');
 assert(!markup.includes('<mask'),'close approaches do not hide or reroute trajectories');
 if(kind==='plasma')assert.deepEqual(points('ion').map(([x,y])=>[x,y]),liveModel.ions.map(ion=>[X(ion.x),Y(ion.y)]));
 else {
  const lattice=liveModel.metalLattice.nodes;
  assert.deepEqual(points('metal').map(([x,y])=>[x,y]),lattice.map(n=>[X(n.x),Y(n.y)]));
  const links=markup.match(/class="metal-lattice-links" d="([^"]+)"/)[1];
  assert.equal((links.match(/M/g)||[]).length,2*lattice.length);
  const {columns,width,height}=M.metalCell,lastColumn=lattice[columns-1],lastRow=lattice.at(-columns);
  assert(links.includes('M'+X(lastColumn.x)+' '+Y(lastColumn.y)+'L'+X(lattice[0].x+width)+' '+Y(lattice[0].y)));
  assert(links.includes('M'+X(lastRow.x)+' '+Y(lastRow.y)+'L'+X(lattice[0].x)+' '+Y(lattice[0].y+height)));
  const circles=[...markup.matchAll(/class="scattering-zone" cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)].map(m=>m.slice(1).map(Number));
  if(nodes.get('metalZones').checked)assert.deepEqual(circles,lattice.filter(n=>n.range>0).map(n=>[X(n.x),Y(n.y),n.range*scale]));
  else assert.equal(circles.length,0);
  const copies=[...markup.matchAll(/<use href="#metal-cell" x="([^"]+)" y="([^"]+)"/g)].map(m=>m.slice(1).map(Number));
  for(const [dx,dy] of [[-12*scale,0],[12*scale,0],[0,-7*scale],[0,7*scale]]){
   assert(copies.some(([x,y])=>x===dx&&y===dy),'periodic cell is drawn beyond each edge');
  }
 }
 const e=liveModel.groups[kind][0];
 const [vx,vy]=kind==='plasma'?[e.vx,e.vy]:[e.vx+liveModel.drift.metal,e.vy];
 const arrow=markup.match(/fill="#187767" transform="translate\(([^ ]+) ([^)]+)\) rotate\(([^)]+)\)"/);
 assert.deepEqual(arrow.slice(1,3).map(Number),[X(e.x),Y(e.y)]);
 assert(Math.abs(Number(arrow[3])-180*Math.atan2(vy*sy,vx*sx)/Math.PI)<1e-10,
  'velocity arrow follows model velocity even during scattering');
}

for(const value of ['0','100']){
 nodes.get('heating').value=value;
 nodes.get('heating').oninput();
 for(let i=1;i<=8;i++){
  callbacks.shift()((value==='0'?0:128)+i*16);
  verifyProjection('metal');
  verifyProjection('plasma');
 }
}
const zones=nodes.get('metalZones'),timeBeforeToggle=liveModel.time;
zones.checked=false;
zones.onchange();
verifyProjection('metal');
assert.equal(liveModel.time,timeBeforeToggle);
zones.checked=true;
zones.onchange();
verifyProjection('metal');
const nearestIon=liveModel.ions[0],selected=liveModel.groups.plasma[0];
selected.x=nearestIon.x;
selected.y=nearestIon.y;
nodes.get('heating').oninput();
verifyProjection('plasma');
// Check the centered direction diagram and the full proton trajectory.
for(const [w,h] of [[660,180],[430,130],[760,125]]){
 for(const id of ['metalDetail','flight'])Object.assign(nodes.get(id),{clientWidth:w,clientHeight:h});
 const metal=liveModel.metalProbe.e;
 const node=liveModel.metalLattice.nodes.find(n=>n.range>.1);
 Object.assign(metal,{x:node.x+node.range/2,y:node.y,vx:0,vy:1});
 for(const T of [1,2,3,5,10]){
  const path=M.trajectory(T),end=path.findIndex(M.flightEnded);
  liveModel.flight=path[end];
  liveModel.flightTrail=path.slice(0,end+1).map(p=>[p.x,p.y]);
  zones.onchange();
  const frame=canvasFrames.get('flight'),[x,y,r]=frame.arcs.at(-1);
  assert(x>=r&&x<=w-r&&y>=r&&y<=h-r,'proton experiment marker fits');
  assert(frame.lines.length>=2,'proton experiment shows actual and reference trajectories');
  for(const line of frame.lines)for(const [x,y] of line)assert(x>=0&&x<=w&&y>=0&&y<=h,'entire proton trajectory fits');
  const svg=nodes.get('metalDetail'),markup=svg.innerHTML;
  assert.equal(svg.viewBox,'0 0 '+w+' '+h);
  const circles=[...markup.matchAll(/<circle class="probe-electron" cx="([^"]+)" cy="([^"]+)"/g)];
  assert.equal(circles.length,1);
  assert.deepEqual(circles[0].slice(1).map(Number),[w/2,h/2]);
  assert.match(markup,/<circle class="probe-electron"[^>]+fill="url\(#probe-e\)"/);
  const gradient=markup.match(/<radialGradient id="probe-e"([^<]*>(?:.|\n)*?)<\/radialGradient>/)[1];
  assert(nodes.get('metal').innerHTML.includes('<radialGradient id="metal-e"'+gradient+'</radialGradient>'));
  const arrows=[...markup.matchAll(/fill="(#[^"]+)" transform="translate\(([^ ]+) ([^)]+)\) rotate\(([^)]+)\)"/g)];
  assert.deepEqual(arrows.find(m=>m[1]==='#187767').slice(2).map(Number),[w/2,h/2,90]);
  const force=M.metalDisturbance(metal.x,metal.y,liveModel.metalLattice);
  const [fx,fy,angle]=arrows.find(m=>m[1]==='#b57825').slice(2).map(Number);
  assert.deepEqual([fx,fy],[w/2,h/2]);
  assert(Math.abs(angle-Math.atan2(force.fy,force.fx)*180/Math.PI)<1e-10);
  const relative=Math.atan2(-force.fx,force.fy);
  assert.equal(nodes.get('probeAngle').dataset.rendered,Math.round(Math.abs(relative)*180/Math.PI)+'^\\circ');
  assert.match(markup,/class="probe-angle"/);
  assert.match(markup,/<use href="#probe-lattice-links"/);
  assert(!/<(?:image|foreignObject|canvas|polyline)\b/i.test(markup));
 }
}
const probe=liveModel.metalProbe;
const visibleLattice=liveModel.metalLattice;
liveModel.metalLattice=M.metalLattice(liveModel.time,0);
zones.onchange();
assert.equal(nodes.get('probeAngle').dataset.rendered,'\\mathbf F_m=\\mathbf 0');
assert(!nodes.get('metalDetail').innerHTML.includes('class="probe-angle"'));
assert(!nodes.get('metalDetail').innerHTML.includes('fill="#b57825" transform='));
const index=visibleLattice.nodes.findIndex(n=>n.range>.1),weakNode=visibleLattice.nodes[index];
liveModel.metalLattice={...visibleLattice,nodes:visibleLattice.nodes.map((n,i)=>i===index?n:{...n,range:0})};
Object.assign(probe.e,{x:weakNode.x+.99*weakNode.range,y:weakNode.y,vx:0,vy:1});
const weakForce=M.metalDisturbance(probe.e.x,probe.e.y,liveModel.metalLattice).fx;
assert(weakForce>0&&weakForce<.015);
zones.onchange();
assert.match(nodes.get('metalDetail').innerHTML,/fill="#b57825" transform=/);
assert.equal(nodes.get('probeAngle').dataset.rendered,'90^\\circ');
liveModel.metalLattice=visibleLattice;
liveModel.step(4.15);
const electron=probe.e,previousPosition=[electron.x,electron.y];
liveModel.step(.2);
assert.equal(probe.e,electron);
assert.notDeepEqual([electron.x,electron.y],previousPosition);
assert(electron.x>=0&&electron.x<metalWidth&&electron.y>=0&&electron.y<metalHeight);
nodes.get('reset').onclick();
assert(draws>100);assert(nodes.get('metal').innerHTML.includes('<clipPath'));assert(nodes.get('metal').innerHTML.includes('<radialGradient'));assert(nodes.get('metal').innerHTML.includes('#187767'),'velocity arrow exists between scattering events');assert(nodes.get('plasma').innerHTML.includes('#b57825'),'force direction is continuously rendered');assert(!nodes.get('metal').innerHTML.includes('fill-opacity=".12"'),'no blinking cell');assert(!html.includes('Změna hybnosti v kmitající mřížce; bez odrazu od kuličky.'));nodes.get('heating').value='100';nodes.get('heating').oninput();assert(nodes.get('plasmaR').dataset.rendered.includes('0{,}0316'));nodes.get('play').onclick();assert.equal(nodes.get('play').textContent,'Pokračovat');nodes.get('help').onclick();assert(nodes.get('guide').open);nodes.get('reset').onclick();assert.equal(nodes.get('heating').value,'0');for(let i=1;i<=10;i++)callbacks.shift()(i*16);assert.equal(nodes.get('heating').style['--heating-progress'],'0%');assert(nodes.get('metalDrift').dataset.rendered.includes('v_{d0}'));if(process.env.HIFYZIKO_CONDUCTIVITY_PREVIEW){nodes.get('heating').value='65';nodes.get('heating').oninput();for(let i=11;i<=240;i++)callbacks.shift()(i*16);fs.mkdirSync('tmp/conductivity-review',{recursive:true});for(const kind of ['metal','plasma'])fs.writeFileSync('tmp/conductivity-review/'+kind+'.svg','<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240"><rect width="640" height="240" fill="#f9faf6"/>'+nodes.get(kind).innerHTML+'</svg>');}c.HiFyzikoFusionDispose();const before=draws;callbacks.shift()(500);assert.equal(draws,before);
console.log('PASS conductivity: force signs, momentum, endpoint scattering, separate transport, rendered positions and velocity match the numerical model, UI and KaTeX. Browser appearance not tested.');
