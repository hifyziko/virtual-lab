const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');require('../versions/vyvoj/m_files/fusion/barrier/model.js');require('../versions/vyvoj/m_files/fusion/barrier/fusion.js');const R=require('../versions/vyvoj/m_files/fusion/barrier/reactions.js'),source=fs.readFileSync('versions/vyvoj/m_files/fusion/barrier/app.js','utf8'),start=source.indexOf('function schematicItems('),end=source.indexOf('function currentGlyphs()',start),ctx={R,zoom:1,visualBound:()=>1};vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
const pair=[{id:'proton',x:0,y:0,radius:25},{id:'proton',x:130,y:0,radius:25}],baseline=ctx.schematicItems(pair);
for(const id of ['neutrino','gamma','neutron'])for(let x=-80;x<210;x+=2){const result=ctx.schematicItems([...pair,{id,x,y:3,radius:25}]);for(let i=0;i<2;i++){assert.equal(result[i].x,baseline[i].x);assert.equal(result[i].y,baseline[i].y);}assert.equal(result[2].x,x);assert.equal(result[2].y,3);}
const close=ctx.schematicItems([{id:'proton',x:0,y:0,radius:25},{id:'proton',x:1,y:0,radius:25}]);assert.equal(close[0].x,0);assert.equal(close[1].x,1);
console.log('PASS: no glyph displacement from neutral or charged neighbours; physical positions retained.');

for(const T of [10,100,500])for(const angle of [0,.08,.2]){const M=globalThis.CoulombModel,p=M.pair('triton','deuteron'),shot=M.multiShot(p,M.thermalMean(T),angle,1,7),before=JSON.stringify(shot.centers),points=M.aimPreview(p,shot.centers,shot);assert.equal(JSON.stringify(shot.centers),before);assert.equal(points.encounter,0);const distances=points.map(q=>Math.hypot(...q)),min=Math.min(...distances);assert.ok(distances.indexOf(min)<points.length-2);assert.ok(distances.at(-1)>min&&distances.at(-1)<min*1.23);}
const F=globalThis.HiFyzikoDT;for(const kind of ['neutrino','gamma']){const neutral={...R.species[kind],id:kind,x:-10,y:0,px:1,py:0},proton={...R.species.proton,id:'proton',x:0,y:0,px:0,py:0},state={products:[neutral],sources:[proton],time:0,cell:null,generic:true,collision:null};for(let i=0;i<100;i++)F.advance(state,.2);assert.ok(Math.abs(neutral.x-10)<1e-8);assert.equal(neutral.y,0);assert.equal(proton.x,0);assert.equal(proton.px,0);assert.equal(state.collision,null);}
assert.ok(Math.abs(F.Q-R.channels.dt.Q)<1e-9);
console.log('PASS: first bend, no neutral electromagnetic or nuclear collision, identical D-T energy source.');

for(const T of [10,100,500])for(const count of [1,3,5]){let reference;for(const ch of Object.values(R.channels)){const M=globalThis.CoulombModel,p=M.pair(ch.input[1],ch.input[0]),shot=M.multiShot(p,M.thermalMean(T),0,count,42),layout=JSON.stringify({start:shot.start,centers:shot.centers,cell:M.makeCell([...shot.centers,{x:shot.x,y:shot.y}],shot.start)});if(reference)assert.equal(layout,reference);reference=layout;}}
console.log('PASS: identical initial geometry and confinement across all reactions for each temperature/count.');
const M=globalThis.CoulombModel;
const a={Z:1,core:10,surfaceStrength:100},b={Z:1,core:10,surfaceStrength:100};
for(const r of [21,25,35,41]){const e=1e-4,numerical=-(M.surfaceField(a,b,r+e).U-M.surfaceField(a,b,r-e).U)/(2*e);assert.ok(Math.abs(numerical-M.surfaceField(a,b,r).F)<1e-5);assert.deepEqual(M.surfaceField({...a,Z:0},b,r),{U:0,F:0});}
const p=M.pair('proton','proton'),targets=[{x:0,y:0,vx:0,vy:0,A:1,...b}],projectile={x:80,y:2,vx:-7,vy:0,...a};
const energy=()=>.5*(projectile.vx**2+projectile.vy**2+targets[0].vx**2+targets[0].vy**2)+p.C/Math.hypot(projectile.x-targets[0].x,projectile.y-targets[0].y)+M.surfaceField(projectile,targets[0],Math.hypot(projectile.x-targets[0].x,projectile.y-targets[0].y)).U;
const initial=energy();let closest=Infinity;for(let i=0;i<15000;i++){M.mobileAdvance(p,targets,projectile,.002);assert.ok(!projectile.collision&&!projectile.integrationLimited);closest=Math.min(closest,Math.hypot(projectile.x-targets[0].x,projectile.y-targets[0].y));}
assert.ok(closest>20);assert.ok(Math.abs(energy()-initial)<.002);assert.ok(Math.abs(projectile.vx+targets[0].vx+7)<1e-8);assert.ok(targets[0].vx<0);
console.log('PASS: gun surface potential gradient, no neutral force, no overlap, conserved energy/momentum and persistent recoil.');
// Exercise the actual app adapter: physical manual motion reaches U=E while
// its drawing remains outside enlarged glyphs. Do not reintroduce a visual stop
// into the physics just to prevent overlap.
{
 const begin=source.indexOf('let manualDisplay=false'),end=source.indexOf('// Nuclear glyphs',begin),code=source.slice(begin,end);
 for(const [target,projectile] of [['proton','proton'],['triton','deuteron'],['deuteron','deuteron'],['helium3','deuteron'],['helium3','helium3'],['triton','proton'],['triton','neutron']])for(const T of [10,100,500]){
  const pair=M.pair(target,projectile),E=M.thermalMean(T),start=Math.max(2000,6*pair.C/E),centers=[{x:0,y:0,kind:target}],context={M,p:pair,x:start,y:0,energy:E,centers,drag:[-start*5,0],fusion:null,$:()=>({value:projectile}),glyphClearance:()=>300,targetKind:t=>t.kind,gunOrigin:[]};
  vm.createContext(context);vm.runInContext(code,context);const fixed=JSON.stringify(centers);
  for(let i=0;i<1200;i++){const next=context.manualApproach(1/60);context.x=next.x;context.y=next.y;const drawn=context.manualDisplayPosition();assert.ok(Math.hypot(drawn.x,drawn.y)>=300-1e-8);}
  if(pair.C)assert.ok(Math.abs(M.multiPotential(pair,centers,context.x,context.y)/E-1)<1e-5,'marker reaches energy intersection');
  assert.equal(JSON.stringify(centers),fixed,'manual targets remain fixed');
  const drawn=context.manualDisplayPosition();context.materializeManual();assert.equal(context.x,drawn.x);assert.equal(context.y,drawn.y);
 }
}
console.log('PASS: actual manual adapter reaches U=E, keeps glyphs apart and preserves displayed gun start for every pair.');
// The excavated graph tunnel must stay between intersections of the displayed
// curve and E; never use the visually enlarged encounter distance as its end.
{
 const a=source.indexOf('function graphBarrierInterval('),b=source.indexOf('function graph(){',a),context={};vm.createContext(context);vm.runInContext(source.slice(a,b),context);
 for(const E of [.003,.03,.2]){
  const curve=q=>Math.exp(-1.5*(q-1))-20/(1+Math.exp((q-1)/.04));
  const band=context.graphBarrierInterval(curve,E);assert.ok(band&&band.inner<band.outer);assert.ok(Math.abs(curve(band.inner)-E)<1e-10);assert.ok(Math.abs(curve(band.outer)-E)<1e-10);
  for(let i=1;i<100;i++)assert.ok(curve(band.inner+(band.outer-band.inner)*i/100)>E);
 }
 assert.equal(context.graphBarrierInterval(()=>0,1),null,'no barrier means no tunnel');
 const bumps=q=>q<3?1-(q-1.5)**2:1-(q-5)**2,band=context.graphBarrierInterval(bumps,.5);assert.ok(band.outer<3,'do not bridge the allowed gap to another barrier');
}
console.log('PASS: graph tunnel endpoints solve U=E and span only the connected forbidden interval.');
// Same time conversion before/after reaction; no reaction-specific speed boost.
{
 const a=source.indexOf('function playbackRate('),b=source.indexOf('function showReactionEnergy()',a),context={M,shot:{start:1000},playbackSpeed:.1};vm.createContext(context);vm.runInContext(source.slice(a,b),context);
 for(const speed of [.02,.1,.25,1])for(const start of [100,1000,10000]){context.playbackSpeed=speed;context.shot.start=start;for(const v of [.1,1,10])assert.ok(Math.abs(v*context.playbackRate()-(v/Math.sqrt(931494.10242))*context.playbackRate(true))<1e-10);}
 assert.ok(source.includes('fusion.timeScale=playbackRate(true)'));
 const lo=source.indexOf('function graphSurroundingEnergy('),hi=source.indexOf('function graphBarrierInterval(',lo),graphContext={};vm.createContext(graphContext);vm.runInContext(source.slice(lo,hi),graphContext);
 const pair=M.pair('proton','proton'),targets=[{x:0,y:0,Z:1},{x:-100,y:0,Z:1},{x:0,y:200,Z:1}];
 const expected=1439.96448/150+1439.96448/Math.hypot(50,200),value=graphContext.graphSurroundingEnergy(pair,targets,0,50,0);assert.ok(Math.abs(value-expected)<1e-12);
 assert.equal(graphContext.graphSurroundingEnergy(pair,[targets[0]],0,50,0),0);
 assert.ok(Math.abs(M.multiPotential(pair,targets,50,0)-pair.C/50-value)<1e-12,'p-p total includes all surrounding proton contributions');
}
console.log('PASS: common incoming/product clock with unit conversion; p-p graph includes all surrounding proton potentials.');
// Scene entry and graph share the exact barrier profile, including neighbours.
{
 const a=source.indexOf('function barrierProfile('),b=source.indexOf('function graph(){',a),context={};vm.createContext(context);vm.runInContext(source.slice(a,b),context);
 for(const names of [['triton','deuteron'],['proton','proton']])for(const T of [10,100,500]){
  const pair=M.pair(...names),energy=M.thermalMean(T),start=100*pair.C/energy,targets=[{x:0,y:0,Z:pair.a.Z},{x:-start,y:start,Z:1}];
  const profile=context.barrierProfile({pair,centers:targets,targetIndex:0,x:start,y:0,energy}),band=context.graphBarrierInterval(profile.total,energy/(pair.C/pair.R));assert.ok(band);
  const entry=pair.R*Math.exp(1.5*(band.outer-1));assert.ok(Math.abs(profile.total(profile.qOf(entry))*pair.C/pair.R-energy)<1e-8,'scene entry lies on plotted energy intersection');
 }
 const start=source.indexOf('function tunnelBlend(){'),end=source.indexOf('function targetScreen(',start),animation={tunnelApproachLength:()=>.18,tunnelTime:0,tunnelDuration:.9,reduced:{matches:false}};vm.createContext(animation);vm.runInContext(source.slice(start,end),animation);
 for(const time of [0,.05,.17,.18]){animation.tunnelTime=time;const blend=animation.tunnelBlend();assert.equal(blend.travel,0);assert.equal(blend.glitch,false);}
 animation.tunnelTime=.3;assert.ok(animation.tunnelBlend().t>0);
}
console.log('PASS: scene tunnel entry matches graph U=E with neighbours; quantum flicker waits until arrival.');
// Reversible playback restores recorded states and interpolates only positions
// within a phase. It must never integrate the physical equations backwards.
{
 const start=source.indexOf('let playbackFrames='),end=source.indexOf('let tunnelGraph=null',start),element={textContent:'recording',dataset:{},hidden:false,replaceChildren(){}};
 const context={$:()=>element,stopSound(){},showReactionEnergy(){},status(){},playbackSpeed:1,paused:false,manualDisplay:false,lastPair:'',fieldKey:''};
 for(const name of 'x y vx vy renderTime tunnelTime dtLocalEnergy probability attempts passes classical flightAccumulator targetIndex'.split(' '))context[name]=0;
 for(const name of 'tunnelFrom tunnelTo tunnelDisplayFrom tunnelApproachFrom tunnelGraph tunnelGlyphs tunnelSoundStarted chosenOutcome demoActive demoPending rareEncounter fusion cell'.split(' '))context[name]=null;
 Object.assign(context,{centers:[],p:{},shot:{},mode:'flight',dtBoost:[0,0],tried:new Set(),anticipated:new Map(),trail:[]});vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 context.beginRecording();context.x=10;context.recordPlayback(.1);context.x=20;context.recordPlayback(.1);context.playbackSpeed=-.5;context.replayPlayback(.1);assert.ok(Math.abs(context.x-15)<1e-10);
 context.playbackSpeed=0;context.replayPlayback(1);assert.ok(Math.abs(context.x-15)<1e-10);
 context.playbackSpeed=.5;context.replayPlayback(.1);assert.equal(context.x,20);assert.equal(vm.runInContext('playbackCursor',context),null);
 context.playbackSpeed=-1;context.replayPlayback(2);assert.equal(context.x,0);context.clearPlayback();assert.equal(vm.runInContext('playbackFrames.length',context),0);
}
console.log('PASS: signed shuttle interpolates recorded positions, pauses at zero, replays identical endpoints and clamps at the start.');
// User playback input owns the speed until a new manual setup explicitly
// resets it. Automatic phase transitions must never overwrite that choice.

{
 const a=source.indexOf('let playbackSpeed=.1,'),b=source.indexOf('function playbackRate(',a),elements={playbackSpeed:{value:'1',setAttribute(){}},playbackSpeedValue:{textContent:''}},context={$:id=>elements[id],stopSound(){}};vm.createContext(context);vm.runInContext(source.slice(a,b),context);
 const speed=()=>vm.runInContext('playbackSpeed',context),input=v=>{elements.playbackSpeed.value=String(context.speedToSlider(v));elements.playbackSpeed.oninput();};
 context.resetManualSpeed();context.slowFusionPlayback();assert.equal(speed(),.1);context.slowFusionPlayback(.01);assert.equal(speed(),.01);assert.equal(elements.playbackSpeed.value,'0.1');
 for(const v of [.023,0,-.2,.0001]){input(v);context.slowFusionPlayback();context.slowFusionPlayback(.01);assert.ok(Math.abs(speed()-v)<1e-12);}
 context.resetManualSpeed();context.slowFusionPlayback();input(.04);context.slowFusionPlayback(.01);assert.ok(Math.abs(speed()-.04)<1e-12);
 for(const v of [-1,-.1,-.01,-.000001,0,.000001,.01,.1,1])assert.ok(Math.abs(context.sliderToSpeed(context.speedToSlider(v))-v)<1e-12);
 assert.ok(Math.abs(context.sliderToSpeed(.101)-context.sliderToSpeed(.1))<.00021);
 assert.ok(!source.includes('productPresentationScale'));
 assert.equal(R.find('neutron','triton'),null);
 console.log('PASS: visible automatic 0.01x at emission, user ownership, fine nonlinear bidirectional slider and no hidden time multiplier.');
}
{
 const a=source.indexOf('function productSpeedTex('),b=source.indexOf('function fusionGraphics()',a),context={HiFyzikoDT:global.HiFyzikoDT};vm.createContext(context);vm.runInContext(source.slice(a,b),context);
 assert.ok(context.incomingSpeedTex(.01*Math.sqrt(931494.10242),0).includes('2\\,998'));
 assert.ok(context.incomingSpeedTex(0,0).includes('0'));
 const katex=require('../versions/vyvoj/m_files/fusion/particles/vendor/katex.js');
 for(const [body,expected]of [[{mass:4,px:3,py:0},'179\\,875'],[{mass:0,px:1,py:0},'299\\,792'],[{mass:1,px:0,py:0},'0']]){
  const text=context.productSpeedTex(body);assert.ok(text.includes(expected));katex.renderToString(String.raw`\begin{gathered}E=1\,\mathrm{MeV}\\`+text+String.raw`\end{gathered}`,{throwOnError:true});
 }
 console.log('PASS: relativistic product speed in km/s and two-line KaTeX labels, including massless and stationary particles.');
}
