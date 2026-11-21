'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const fusion = path.join(__dirname, '../versions/vyvoj/m_files/fusion');
const model = require(path.join(fusion, 'eccd/model.js'));
const katex = require(path.join(fusion, 'particles/vendor/katex.js'));
const close = (a,b,tol=1e-10) => assert(Math.abs(a-b) <= tol, a+' vs '+b);

for (const f of [108, 112, 115, 116]) {
  const normal = model.experiment(90,f);
  assert(normal.heated > 0);
  assert.equal(normal.resonantU, null);
  for (const t of [0,1,4,30]) assert.equal(normal.current(t), 0);
  if (f === model.cyclotron) close(normal.heated, .6);
  for (const a of [50,65,89]) {
    const forward = model.experiment(a,f), reverse = model.experiment(180-a,f);
    close(forward.heated, reverse.heated);
    close(forward.resonantU, -reverse.resonantU);
    for (const t of [0,1,4,30]) {
      const j = forward.current(t), data = forward.distribution(t);
      close(j, -reverse.current(t));
      if (!t || f === model.cyclotron) assert.equal(j,0);
      else assert.equal(Math.sign(j), -Math.sign(forward.resonantU));
      let density = 0, moment = 0, heated = 0;
      const du = data[1].u - data[0].u;
      data.forEach((p,i) => {
        const weight = du * (i && i < data.length-1 ? 1 : .5);
        assert(p.total >= 0 && p.selected <= p.equilibrium);
        close(p.delta, -data[data.length-1-i].delta);
        density += weight*p.total; moment += weight*p.u*p.total; heated += weight*p.selected;
      });
      close(density,1); close(moment,-j); close(heated,forward.heated);
      close(model.experiment(a,f,200).current(t),j);
    }
  }
}
const shot = model.experiment(65,115);
close(shot.resonantU,.9866659957013666);
const duration=2*Math.PI*model.pulseCycles;
for(const [i,u] of shot.comparison.entries()){
  const response=shot.pulseState(u,model.pulseCycles);
  close(response.gain,[2.076453687,.108516103][i],1e-8);
  // Independent laboratory-frame Lorentz integration with the work as a third state.
  const w=(115-115*Math.cos(65*Math.PI/180)*model.thermalOverC*u)/112;
  function rhs(t,[vx,vy]){
    const ax=model.acceleration*Math.cos(w*t), ay=model.acceleration*Math.sin(w*t);
    return [-vy+ax,vx+ay,2*(ax*vx+ay*vy)];
  }
  let state=[1,0,0];
  const steps=10000, dt=duration/steps;
  for(let k=0;k<steps;k++){
    const t=k*dt, add=(s,h)=>state.map((v,j)=>v+h*s[j]);
    const a=rhs(t,state), b=rhs(t+dt/2,add(a,dt/2));
    const c=rhs(t+dt/2,add(b,dt/2)), d=rhs(t+dt,add(c,dt));
    state=state.map((v,j)=>v+dt*(a[j]+2*b[j]+2*c[j]+d[j])/6);
    if((k+1)%1000===0){
      const time=(k+1)*dt, micro=shot.pulseState(u,time/(2*Math.PI));
      close(micro.perp,Math.hypot(state[0],state[1]),2e-8);
      close(micro.gain,state[2],2e-8);
      close(micro.power,rhs(time,state)[2],2e-8);
    }
  }
}
for(const f of [100,112,124]){
  const normal=model.experiment(90,f);
  close(normal.pulseState(1,20).gain,normal.pulseState(-2,20).gain);
  for(const angle of [50,89,91,130]){
    const m=model.experiment(angle,f);
    assert(m.comparison.every(u=>Math.abs(u)<=3));
    assert(m.comparison.every(u=>Number.isFinite(m.pulseState(u,20).perp)));
  }
}
const imbalance = g=>Math.abs(g.left-g.right)/(g.left+g.right);
for(const g of shot.populations(20000)) close(imbalance(g),0);
const start=shot.populations(0),later=shot.populations(4);
assert(imbalance(later[0])/imbalance(start[0]) > imbalance(later[1])/imbalance(start[1]));
for(const angle of [65,90,115]) for(const time of [0,4,30]){
  const trial=model.experiment(angle,115), [hot,cold]=trial.populations(time);
  close(hot.left+hot.right,trial.heated);
  close(cold.left+cold.right,1-trial.heated);
  close(-hot.mean-cold.mean,trial.current(time));
  if(angle===90){close(hot.left,hot.right);close(cold.left,cold.right);}
  if(time===0)close(hot.mean,-cold.mean);
}
close(shot.current(10000),0);
assert(Math.abs(shot.current(4)) > Math.abs(shot.current(30)));

// Run the supplied scripts in page order, including shared artwork, KaTeX, and controls.
class Element {
  constructor() {
    this.attributes = {}; this.children = []; this.style = {}; this.dataset = {};
    this.clientWidth = 660; this.clientHeight = 265;
  }
  setAttribute(k,v) { this.attributes[k] = String(v); }
  appendChild(n) { this.children.push(n); return n; }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener() {}
  showModal() { this.open = true; }
}
function loadLesson(folder) {
  const dir = path.join(fusion,folder), html = fs.readFileSync(path.join(dir,'index.html'),'utf8');
  const nodes = new Map(), staticMath = [], frames = new Map();
  for (const [tag] of html.matchAll(/<[^<>]+>/g)) {
    const id = tag.match(/\bid="([^"]+)"/)?.[1], tex = tag.match(/\bdata-tex="([^"]+)"/)?.[1];
    const element = new Element();
    element.value = tag.match(/\bvalue="([^"]+)"/)?.[1] || '';
    if (id) nodes.set(id,element);
    if (tex) { element.dataset.tex = tex; staticMath.push(element); }
  }
  const get = id => nodes.get(id);
  if (folder === 'heating') { get('mode').value='linear'; get('speed').value='.25'; }
  let serial = 0;
  const context = {document:{getElementById:get,createElementNS:()=>new Element(),createElement:()=>new Element(),
      querySelectorAll:()=>staticMath,querySelector:()=>get('guide')},addEventListener(){},
    requestAnimationFrame:fn=>{ frames.set(++serial,fn); return serial; },cancelAnimationFrame:id=>frames.delete(id),
    ResizeObserver:class {observe(){} disconnect(){}},
    katex:{render(tex,element){katex.renderToString(tex,{throwOnError:true}); element.tex=tex;}}};
  context.window = context;
  vm.createContext(context);
  for (const [,src] of html.matchAll(/<script defer src="([^"]+)"/g)) {
    if (src.endsWith('katex.js') || src.endsWith('navigation/page.js')) continue;
    vm.runInContext(fs.readFileSync(path.resolve(dir,src),'utf8'),context,{filename:src});
  }
  return {get, frames, tick(now) {
    const next = frames.entries().next().value;
    assert(next); frames.delete(next[0]); next[1](now);
  }};
}
const {get, frames, tick} = loadLesson('eccd');
const cloud=get('ensemble');
const glyphs=node=>[node,...node.children.flatMap(glyphs)];
const dots=glyphs(cloud).filter(n=>['#85510e','#316796'].includes(n.attributes.stroke));
assert.equal(dots.length,1440);
const selected=()=>dots.map(n=>n.attributes.stroke==='#85510e');
const zoomUse=glyphs(cloud).find(n=>n.attributes.href==='#eccd-plasma-scene');
const zoom=glyphs(cloud).find(n=>n.children.includes(zoomUse));
assert(zoom && zoom.attributes.overflow==='hidden');
const source=glyphs(cloud).find(n=>n.attributes.id==='eccd-plasma-scene');
assert(source && glyphs(source).includes(dots[0]),'Inset reuses actual particles in the torus');
const [zx,zy,zw,zh]=zoom.attributes.viewBox.split(' ').map(Number);
assert(glyphs(cloud).some(n=>+n.attributes.x===zx && +n.attributes.y===zy && +n.attributes.width===zw && +n.attributes.height===zh),'Outline matches the exact sampled area');
assert.equal(zoom.attributes.width/zw,zoom.attributes.height/zh);
const beamEdge=glyphs(source).find(n=>n.attributes['stroke-width']==='.35' || Number(n.attributes['stroke-width'])===.35);
const beamWidths=()=>beamEdge.attributes.d.slice(1).split('L').map(point=>Math.abs(Number(point.split(' ')[1])));
const initialWidths=beamWidths();
assert(initialWidths[31]>initialWidths[10]);
get('angle').value=90;get('angle').oninput();
assert(beamWidths()[31]<initialWidths[31]);
get('angle').value=115;get('angle').oninput();
close(beamWidths()[31],initialWidths[31]);
get('angle').value=65;get('angle').oninput();
const before=selected();
const currentArc=glyphs(cloud).find(n=>n.attributes.fill==='#187767' && n.attributes.d!==undefined);
assert(currentArc.attributes.d.endsWith('Z'));
const tintCount=color=>dots.filter(p=>p.attributes.fill===color).length;
assert(tintCount('#ffc351')>tintCount('#db8ce1'),'Forward launch highlights predominantly positive velocities');
for(const p of dots.filter(p=>p.attributes.visibility!=='hidden')){
  const dx=Number(p.attributes.cx)-218, dy=Number(p.attributes.cy)-119;
  assert(Math.abs(Math.hypot(dx,dy)-86)<24,'Particle remains in the plasma column');
  if(p.attributes.stroke==='#85510e'){
    const angle=65*Math.PI/180;
    const along=62+dx*Math.cos(angle)-(dy-86)*Math.sin(angle);
    const transverse=Math.abs(-dx*Math.sin(angle)-(dy-86)*Math.cos(angle));
    const edge=62+86*Math.sin(angle)-Math.sqrt((86*Math.sin(angle))**2+110**2-86**2);
    // Displayed gyrophase offsets the guiding centre by up to 1.6 scene units.
    assert(along>=edge-1.6 && along<=81.6);
    const width=Math.hypot(4.8,.055*(along+1.6),.36*Math.max(0,along+1.6-edge));
    assert(transverse<2*width+1.6,'Selected electron lies in the broadened incident beam');
  }
}
assert(before.some(Boolean)&&before.some(s=>!s));
const positions=dots.map(n=>n.attributes.cx);
get('frequency').value=124;get('frequency').oninput();
assert(selected().filter(Boolean).length<before.filter(Boolean).length);
get('frequency').value=115;get('frequency').oninput();
assert.deepEqual(selected(),before);
tick(10);tick(65);
assert(dots.some((n,i)=>n.attributes.cx!==positions[i]),'Thermal cloud moves while aiming');
const grip=glyphs(cloud).find(n=>n.attributes.class==='launcher-grip');
const overview=glyphs(cloud).find(n=>n.children.includes(source));
overview.getScreenCTM=()=>({inverse:()=>({})});
cloud.createSVGPoint=()=>({matrixTransform(){return this;}});
cloud.classList={add(){},remove(){}};
let captured;
cloud.setPointerCapture=id=>{captured=id;};
cloud.hasPointerCapture=id=>captured===id;
cloud.releasePointerCapture=()=>{captured=null;};
Object.assign(get('angle'),{min:50,max:130});
const pointer=(angle)=>({button:0,pointerId:7,clientX:218-80*Math.cos(angle*Math.PI/180),
  clientY:205+80*Math.sin(angle*Math.PI/180),preventDefault(){}});
grip.onpointerdown(pointer(65));
cloud.onpointermove(pointer(85));
assert.equal(Number(get('angle').value),90);
cloud.onpointermove(pointer(100));
assert.equal(Number(get('angle').value),90);
cloud.onpointermove(pointer(106));
assert(Number(get('angle').value)>90&&Number(get('angle').value)<106);
cloud.onpointermove(pointer(115));
assert.equal(Number(get('angle').value),115);
assert(tintCount('#db8ce1')>tintCount('#ffc351'));
cloud.onpointermove(pointer(155));
assert.equal(Number(get('angle').value),130);
cloud.onpointercancel(pointer(155));
cloud.onpointermove(pointer(80));
assert.equal(Number(get('angle').value),130);
assert.equal(captured,null);
get('reset').onclick();
const vel=get('parallel-profile');
const profile=color=>glyphs(vel).find(n=>n.attributes.stroke===color).attributes.d;
const steady=profile('#bd4745');
assert.notEqual(steady,profile('#28343d'));
get('mirror').onclick();
assert.notEqual(steady,profile('#bd4745'));
get('normal').onclick(); assert.equal(profile('#28343d'),profile('#bd4745'));
assert.equal(get('play'),undefined);
for(let k=0;k<100;k++)tick(30000+k*100);
assert.equal(frames.size,1);
get('angle').value=65;get('angle').oninput();
get('frequency').value=124;get('frequency').oninput();
assert(get('tuning-state').textContent.includes('ocasu'));
get('tune').onclick();
assert.equal(Number(get('frequency').value),115);
assert(get('tuning-state').textContent.includes('obsazené části'));
get('angle').value=90;get('angle').oninput();get('tune').onclick();
assert.equal(Number(get('frequency').value),112);
assert.equal(get('current-value').tex,'J_\\parallel/J_0=0');
get('reset').onclick();
get('doppler-help').onclick();
assert.equal(get('doppler-scene').style.display,'block');
assert.equal(get('energy-detail').style.display,'none');
const dopplerColumns=get('doppler-scene').children;
assert.deepEqual(dopplerColumns.map(column=>column.attributes.transform),['translate(12 12)','translate(304 12)']);
assert.deepEqual(dopplerColumns.map(column=>glyphs(column).find(n=>n.attributes.viewBox).attributes.viewBox),['0 0 266 140','0 0 266 140']);
const readings=()=>glyphs(get('doppler-scene')).filter(n=>n.tex?.startsWith("f'=")).map(n=>n.tex);
const at65=readings();
assert.equal(at65.length,2);
assert.notEqual(at65[0],at65[1]);
get('mirror').onclick();tick(45000);
assert.deepEqual(readings(),at65.reverse());
get('normal').onclick();tick(45100);
assert.equal(readings()[0],readings()[1]);
const tangent=glyphs(cloud).find(n=>n.attributes['aria-label']==='Směry na tečně v místě zásahu');
get('reset').onclick();
const headings=()=>tangent.children.filter(n=>n.attributes.transform).map(n=>n.attributes.transform.match(/rotate\(([^)]+)/)[1]).map(Number);
assert.deepEqual(headings(),[0,180]);
get('mirror').onclick();
assert.deepEqual(headings(),[180,0]);
get('normal').onclick();
assert.deepEqual(headings(),[]);
const heating = loadLesson('heating');
heating.get('freq').value=120; heating.get('freq').oninput();
assert.equal(heating.get('reading').tex,'f=120\\,\\mathrm{GHz}');
console.log('PASS: ECCD resonance, symmetry, density, first moment, relaxation, rendered math, controls, and shared heating artwork.');
