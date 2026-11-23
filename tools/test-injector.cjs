'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/injector');
const M=require(path.join(dir,'model.js'));
for(const voltage of [200,500,1000]){
  for(const gas of [false,true]){
    let prev=0;
    for(let i=0;i<=1000;i++){
      const f=M.sample(i/1000,voltage,gas);
      assert(Number.isFinite(f.x) && Number.isFinite(f.y));
      if(!f.impact){assert(f.kinetic>=prev-1e-9);prev=f.kinetic;}
      if(f.t>=.57 && !f.impact)assert(Math.abs(f.kinetic-voltage)<1e-9);
    }
    assert.equal(M.sample(.29,voltage,gas).electrons,2);
    const last=M.sample(1,voltage,gas);
    assert.equal(last.impact,!gas);
    if(gas){assert.equal(last.electrons,0);assert.equal(M.sample(.76,voltage,true).electrons,1);}
    else{assert.equal(last.x,M.dumpX);assert.equal(last.kinetic,0);assert.equal(last.electrons,2);}
  }
}
assert(Math.abs(M.sample(.8,1000,true).speed/M.sample(.8,500,true).speed-Math.SQRT2)<1e-12);
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),nodes=new Map(),noop=()=>{};
const katex=require(path.join(dir,'../particles/vendor/katex.js'));
const pen=new Proxy({}, {get:(_,key)=>key==='createRadialGradient'||key==='createLinearGradient'?()=>({addColorStop:noop}):noop});
const element=()=>({style:{},dataset:{},append:noop,clientWidth:1338,clientHeight:270,getBoundingClientRect:()=>({width:1338}),getContext:()=>pen});
for(const match of html.matchAll(/\bid="([^"]+)"/g))nodes.set(match[1],element());
const get=id=>nodes.get(id);
get('voltage').value=1000;get('gas').checked=true;get('speed').value=1;
let advance;
const c={document:{getElementById:get,querySelectorAll:()=>[],createElement:element,addEventListener:noop},
  addEventListener:noop,devicePixelRatio:1,requestAnimationFrame:fn=>{advance=fn;return 1;},cancelAnimationFrame:noop,
  ResizeObserver:class{observe(){}},katex:{render:tex=>katex.renderToString(tex,{throwOnError:true})}};
c.window=c;vm.createContext(c);
for(const file of ['../particles/style.js','../equilibrium/cad-parameters.js','../equilibrium/cad.js','model.js','source-detail.js','scene.js','app.js'])
  vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),c,{filename:file});
const source=vm.runInContext('InjectorSource',c);
const gap=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
// Reconstruct the angle from the oblique screen coordinates of one electron.
// Tangential acceleration has the opposite sign to the local RF field.
function ringAngle(t){
  const [,y,z]=source.ambientWorld(0,t);
  assert(Math.abs(Math.hypot(z,y-184)-77)<1e-8);
  return Math.atan2(z,y-184);
}
for(const t of [.012,.044,.42,.45]){
  const h=.00001;
  const acceleration=(ringAngle(t+h)-2*ringAngle(t)+ringAngle(t-h))/(h*h);
  assert(acceleration*Math.sin(30*Math.PI*t+.55)<0);
}
// In the held frontal view the outer reference electron brakes, then retraces
// its arc after the first field reversal. Velocity stays continuous at reversal.
const turn=source.lastReferenceTurn(.05), reversal=turn-1/60;
const angularVelocity=t=>(ringAngle(t+.00001)-ringAngle(t-.00001))/.00002;
assert(Math.abs(Math.sin(source.rfPhase(reversal)))<1e-9);
assert(angularVelocity(reversal)<angularVelocity(turn-.003) && angularVelocity(turn-.003)<0);
assert(Math.abs(angularVelocity(turn))<1e-6 && angularVelocity(turn+.003)>0);
assert(Math.abs(ringAngle(turn-.006)-ringAngle(turn+.006))<1e-8);
assert.equal(vm.runInContext('InjectorScene.frontView(.052)',c),1);
// Check the actual 3D collision trajectory against the field in both RF directions.
for(const t of [.027,.038,.074,.087]){
  const h=.00002,p=source.incidentWorld(t),l=source.incidentWorld(t-h),r=source.incidentWorld(t+h);
  const e=source.electricField(p,t),a=p.map((v,k)=>(l[k]-2*v+r[k])/(h*h));
  a[1]-=610*.004**2/Math.hypot(t-.053,.004)**3;
  assert(Math.hypot(a[1]+2100*e[1],a[2]+2100*e[2])<.02*2100*Math.hypot(...e));
}
assert(source.sourceFrame(.019999).donorBound && !source.sourceFrame(.020).donorBound);
assert(gap(source.sourceFrame(.020-1e-8).incident,source.sourceFrame(.020).incident)<.01);
const pairGap=t=>{const f=source.sourceFrame(t);return gap(f.incident,f.neighbour);};
assert(pairGap(.042)>pairGap(.053) && pairGap(.053)>0 && pairGap(.065)>pairGap(.053));
const lists=[...html.matchAll(/<ol start="(\d+)">([\s\S]*?)<\/ol>/g)];
let described=0;
for(const list of lists){assert.equal(Number(list[1]),described+1);described+=list[2].match(/<li>/g).length;}
assert.equal(described,M.cues.length,'One numbered explanation per playback step');
for(const t of [.10,.18,.254,.27,.302]){
  const a=source.sourceFrame(t-1e-8),b=source.sourceFrame(t);
  assert(gap(a.tracked,b.tracked)<.01 && gap(a.sibling,b.sibling)<.01,'Nuclei move continuously across each event');
}
const split=source.sourceFrame(.10),separate=source.sourceFrame(.14);
assert(gap(split.tracked,split.sibling)<gap(separate.tracked,separate.sibling));
const knock=source.sourceFrame(.18);
for(const t of [.15,.17]){
  const h=1e-5,y=v=>source.sourceFrame(v).projectile[1];
  assert(Math.abs(y(t+h)-2*y(t)+y(t-h))>1e-9,
    'Oblique projection makes the RF deflection visible during approach');
}
assert.equal(gap(knock.projectile,knock.ejected),0);
assert(gap(knock.projectile,knock.sibling)>16,'Ionization takes place in the electron cloud');
assert(gap(source.sourceFrame(.18-1e-8).projectile,knock.ejected)<.01);
assert(!knock.siblingBound && knock.ejected && source.sourceFrame(.179).siblingBound);
assert(gap(source.sourceFrame(.20).ejected,source.sourceFrame(.20).projectile)>30);
const releaseAngle=.18*53-1;
assert(gap(knock.ejected,[knock.sibling[0]+25*Math.cos(releaseAngle),knock.sibling[1]+17*Math.sin(releaseAngle)])<1e-8);
for(let i=1;i<=200;i++){
  const t=.18+i*.001,[x,y]=source.ejected(t);
  assert(x>source.ejected(t-.001)[0]);
  if(x>=744 && x<=844)assert(y-5>source.aperture.top && y+5<source.aperture.bottom,'Free electron passes through the aperture');
}
assert(gap(source.ejected(.34-1e-8),source.ejected(.34+1e-8))<.01);
const [gridX,gridY]=source.ejected(.38);
assert(Math.abs(gridX+4.8-990)<1e-8 && gridY>=source.aperture.top-source.aperture.lip && gridY<=source.aperture.top);
assert(218-48>source.aperture.top && 218+48<source.aperture.bottom,'The full ion cloud clears both acceleration-grid lips');
assert.equal(source.sourceFrame(.253).surface,null);
assert(!source.sourceFrame(.269).surfaceBound && source.sourceFrame(.27).surfaceBound);
assert(gap(source.sourceFrame(.26999999).surface,source.sourceFrame(.27).surface)<.01);
assert(source.sourceFrame(.302).tracked[0]<source.sourceFrame(.27).tracked[0]);
assert(source.sourceFrame(.34).tracked[0]>800);
for(const gas of [true,false]){
  const last=gas?1:.84;
  for(const [i,[start,seconds]] of M.cues.entries()){
    if(start>=last)break;
    assert(seconds>=3 && M.sample(start,1000,gas).caption.length>25);
    const next=M.sample(start,1000,gas).next;
    assert(Math.abs(M.advance(start,seconds,gas)-next)<1e-12);
    assert(M.advance(start,seconds*.5,gas)<next);
    assert.equal(M.cues[i+1][0],next);
  }
  assert.equal(M.advance(0,1000,gas),last);
}
function toEnd(){for(let i=0;i<=M.cues.length&&!get('step').disabled;i++)get('step').onclick();assert(get('step').disabled);}
toEnd();assert.equal(get('stage').textContent,'Rychlý deuteron');
get('gas').checked=false;get('gas').onchange();assert.equal(get('seek').value,.57);
toEnd();assert.equal(get('stage').textContent,'Dopad na terč iontové pasti');assert.match(get('action-caption').textContent,/dopadl/);
get('play').onclick();advance(100);advance(200);assert(get('seek').value>0 && get('seek').value<.1);
get('seek').value=.8;get('seek').oninput();assert.equal(get('play').textContent,'Přehrát');
get('voltage').value=500;get('voltage').oninput();assert(get('kinetic').dataset.rendered.startsWith('500'));
const camera=vm.runInContext('InjectorScene.camera',c);
for(const gas of [true,false]){
  for(const t of [.34,.38,.57,.65,.73,.84,.90,.94,1]){
    const a=camera(M.sample(t-1e-8,500,gas)),b=camera(M.sample(t,500,gas));
    assert(Math.abs(a.x-b.x)<.01 && Math.abs(a.y-b.y)<.01);
    assert(Math.abs(a.zoom-b.zoom)<.00001);
  }
}
assert.equal(vm.runInContext('InjectorScene.frontView(0)',c),0);
assert(camera(M.sample(0,500,true)).zoom<.35);
assert(camera(M.sample(.005,500,true)).zoom>camera(M.sample(0,500,true)).zoom);
assert.equal(vm.runInContext('InjectorScene.frontView(.009)',c),1);
assert.equal(camera(M.sample(.09,500,true)).zoom,camera(M.sample(.105,500,true)).zoom);
assert.equal(camera(M.sample(.09,500,true)).x,camera(M.sample(.105,500,true)).x);
assert.equal(camera(M.sample(.009,500,true)).zoom,camera(M.sample(.017,500,true)).zoom);
assert.equal(camera(M.sample(.009,500,true)).x,camera(M.sample(.017,500,true)).x);
const frontProjection=vm.runInContext('InjectorScene.shellProjector(1,1,InjectorScene.frontView(.03))',c);
const centre=frontProjection([200,184,0]);
assert(Math.abs(gap(frontProjection([200,261,0]),centre)-gap(frontProjection([200,184,77]),centre))<1e-7);
assert.equal(camera(M.sample(.021,500,true)).zoom,camera(M.sample(.041,500,true)).zoom);
assert.equal(vm.runInContext('InjectorScene.frontView(.08)',c),0);
const pausedTime=get('seek').value;
get('cameraZoom').value=.4;get('cameraZoom').oninput();
assert.equal(get('cameraAuto').checked,false);
// At the widest view the separator is visible already during source events.
// Its neighbours must keep advancing before the reference particle arrives.
const scene=vm.runInContext('InjectorScene',c);
const lossLocations=new Set();
let neutralCount=0;
for(let i=0;i<scene.beamCount;i++){
  let bound=2;
  for(let x=548;x<=765;x++){
    const seconds=((x-295-i*805/scene.beamCount+805)%805)/24.6;
    const {electrons}=scene.neighbour(i,seconds,true);
    assert.equal(scene.neighbour(i,seconds,false).electrons,2);
    if(electrons!==bound){
      assert(x>=552 && x<=759);
      assert.equal(electrons,bound-1);
      if(bound===2)lossLocations.add(x);
      bound=electrons;
    }
  }
  if(bound===1)neutralCount++;
}
assert(lossLocations.size>=10,'Neutralization occurs at different depths in the gas');
assert(Math.abs(neutralCount/scene.beamCount-.5)<.08);
function separatorNeighbours(t,gas){
  const seconds=M.sample(t,500,gas).playSeconds;
  return Array.from({length:scene.beamCount},(_,i)=>scene.neighbour(i,seconds,gas))
    .filter(p=>p.x>=793 && p.x<M.dumpX);
}
for(let i=0;i<=300;i++){
  const visible=separatorNeighbours(i/300,true);
  assert.deepEqual([...new Set(visible.map(p=>p.branch))].sort(),[-1,0,1]);
  assert(visible.every(p=>p.electrons===1+p.branch));
  assert(separatorNeighbours(i/300,false).every(p=>p.branch===1 && p.electrons===2));
}
assert.notDeepEqual(separatorNeighbours(.18,true),separatorNeighbours(.181,true));
for(let now=1000;now<3500;now+=25)advance(now);
get('micro').onwheel({deltaY:-100,deltaMode:0,preventDefault:noop});
assert(get('cameraZoom').value>.4);
get('cameraAuto').checked=true;get('cameraAuto').onchange();advance(3500);
assert(get('cameraZoom').value<1,'Auto resumes from the current view');
for(let now=3525;now<=6500;now+=25)advance(now);
assert.equal(get('cameraZoom').value,camera(M.sample(pausedTime,500,false)).zoom);
assert.equal(get('seek').value,pausedTime,'Camera handoff preserves paused time');
// Capture the actual camera transform, including the clamped centre, across
// a seek and a manual pan. Changing the stage must not resume automatic follow.
const move=[];
const probePen=new Proxy(pen,{get:(p,key)=>key==='translate'?((x,y)=>move.push([x,y])):p[key]});
get('micro').getContext=()=>probePen;
const transform=()=>{move.length=0;get('voltage').oninput();return move[1];};
get('cameraAuto').checked=false;get('cameraAuto').onchange();
const held=transform();
get('seek').value=.18;get('seek').oninput();assert.deepEqual(transform(),held);
get('micro').setPointerCapture=noop;
get('micro').onpointerdown({button:0,pointerId:1,clientX:100,clientY:100});
get('micro').onpointermove({pointerId:1,clientX:140,clientY:125});
get('micro').onlostpointercapture();const panned=transform();
assert.notDeepEqual(panned,held);get('step').onclick();assert.deepEqual(transform(),panned);
assert.equal(get('cameraAuto').checked,false);
// At playback speed the same distant manual view stays put throughout a drag.
get('seek').value=.78;get('seek').oninput();
const lens=get('micro');
lens.onpointerdown({button:0,pointerId:2,clientX:10,clientY:10});
lens.onpointermove({pointerId:2,clientX:3010,clientY:10});
get('play').onclick();
for(let now=7000;now<=8000;now+=25)advance(now);
assert.equal(get('cameraAuto').checked,false);
lens.onlostpointercapture();
const beforeRescue=transform();
for(let now=8025;now<=9000;now+=25){
  advance(now);
  if(get('cameraAuto').checked)break;
}
assert.equal(get('cameraAuto').checked,true);
assert(gap(transform(),beforeRescue)<5,'Camera eases into the rescue from the manual view');
for(let now=9025;now<=11500;now+=25)advance(now);
assert(gap(transform(),beforeRescue)>50);
get('seek').value=.65;get('seek').oninput();
get('cameraAuto').checked=false;get('cameraAuto').onchange();
get('play').onclick();
for(let now=12000;now<=13000;now+=25)advance(now);
assert.equal(get('cameraAuto').checked,false,'Manual view stays selected while the particle is safely in frame');
get('play').onclick();
for(const m of html.matchAll(/data-tex="([^"]+)"/g))katex.renderToString(m[1],{throwOnError:true});
const heard=[];
c.AudioContext=class{
  sampleRate=44100;currentTime=0;state='running';
  createBuffer(_,size){const data=new Float32Array(size);return {getChannelData:()=>data};}
  createGain(){return {gain:{setTargetAtTime:noop},connect:noop,disconnect:noop};}
  createBufferSource(){return {start(){heard.push(this.buffer);},connect:noop,disconnect:noop,stop:noop};}
  close(){return Promise.resolve();}
};
get('sound').checked=true;get('sound').onchange();
assert.equal(heard.length,0,'Enabling sound is silent');
for(const gas of [true,false]){
  get('gas').checked=gas;get('gas').onchange();get('seek').value=0;get('seek').oninput();
  while(!get('step').disabled){
    const before=heard.length;get('step').onclick();
    const t=get('seek').value;
    const expected=[.020,.053,.10,.18,.254,.27,.38,...(gas?[.65,.94]:[.84])].includes(t);
    assert.equal(heard.length-before,Number(expected),'Sound at step '+t+' gas='+gas);
  }
}
for(const buffer of new Set(heard)){
  const data=buffer.getChannelData(0),peak=data.reduce((m,v)=>Math.max(m,Math.abs(v)),0);
  assert(peak>.025 && peak<.07 && data.length<=44100*.53);
  assert(Math.abs(data[0])+Math.abs(data.at(-1))<1e-8,'Soft onset and silent ending');
}
get('sound').checked=false;get('sound').onchange();
get('seek').value=.07;get('seek').oninput();const mutedCount=heard.length;get('step').onclick();
assert.equal(heard.length,mutedCount,'Disabling sound mutes collisions too');
console.log('PASS injector: voltage and energy, charge states, dump and plasma endpoints, step, playback, scrub, controls and math.');
