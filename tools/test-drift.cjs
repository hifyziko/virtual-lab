'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/drift'),M=require(path.join(base,'model.js'));
const relative=(a,b,tol,message)=>assert(Math.abs(a-b)<=tol*Math.max(Math.abs(b),1e-30),message+': '+a+' / '+b);
for(const species of Object.keys(M.species))for(const B of [-.05,.05]){
 const c=M.setup({mode:'gyration',species,B,pitch:30}),a=M.simulate(c,{turns:3}),s=a.at(-1);
 relative(s.energy,c.energy,1e-10,'Static B preserves energy');relative(s.r[2],c.initial.v[2]*s.t,1e-10,'Parallel free motion');
 assert(Math.hypot(s.r[0],s.r[1])<c.length*2e-5,'Analytic integer-period orbit');
 const first=a[2];assert(Math.sign(first.r[1])===-Math.sign(c.q*B),'Charge and field set rotation');
}
for(const species of ['electron','proton','deuteron'])for(const B of [-.05,.05])for(const electric of [-1500,0,1500]){
 const c=M.setup({mode:'electric',species,B,electric}),a=M.simulate(c,{turns:4}),s=a.at(-1),first=a[0];
 const shift=(s.center[0]-first.center[0])/s.t;if(electric)relative(shift,-c.electric/c.B,1e-9,'Charge-independent ExB drift');else assert(Math.abs(shift)<c.speed*1e-10,'Zero E disables drift');
 assert.deepEqual(M.fields(c,[0,0,0]).E,[0,-electric,0],'Positive E points downward');
 for(const point of a)relative(point.energy+c.q*c.electric*point.r[1]/M.e,c.energy,1e-9,'Electric work and energy');
}
for(const species of ['proton','electron']){
 const c=M.setup({mode:'gradient',species,gradient:.03}),a=M.simulate(c,{turns:10}),s=a.at(-1),expected=a[0].drift[1];
 relative((s.center[1]-a[0].center[1])/s.t,expected,.02,'Gradient drift magnitude and sign');
 relative(s.energy,c.energy,1e-10,'Gradient field does no work');
 const k=M.setup({mode:'curvature',species,pitch:80,radius:12}),b=M.simulate(k,{turns:12}),end=b.at(-1);
 relative((end.center[2]-b[0].center[2])/end.t,b[0].drift[2],.08,'Curvature drift magnitude and sign');
}
const c=M.setup(),a=M.simulate(c,{turns:2}),inside=a.find(s=>s.r[0]>0),exit=a.find(s=>s.t>c.period*.5&&s.r[0]<0&&s.v[0]<0);
assert(inside&&exit,'Entry and subsequent exit across the boundary');
for(const s of a.filter(s=>s.r[0]<-.05*c.length&&s.v[0]>0)){relative(s.v[0],c.speed,1e-12,'Straight flight before boundary');assert.equal(s.r[1],0);assert.equal(s.center,null);}
relative(exit.r[1],-2*c.length,.003,'Semicircle diameter');relative(exit.v[0],-c.speed,.001,'Tangential exit');
const tail=a.at(-1);relative(tail.v[0],exit.v[0],1e-12,'Free flight after exit');relative(tail.energy,c.energy,1e-10,'Boundary does no work');
const finer=M.simulate(c,{turns:2,substeps:24}).at(-1);assert(M.norm(tail.r.map((x,i)=>x-finer.r[i]))<.01*c.length,'Boundary convergence');
for(const B of [-.05,.05]){
 const insideConfig=M.setup({start:[2,0],B}),orbit=M.simulate(insideConfig,{turns:5});assert(orbit.every(s=>s.r[0]>0&&s.center),'Orbit placed wholly inside the field stays inside');
 const edgeConfig=M.setup({start:[.2,0],B}),escape=M.simulate(edgeConfig,{turns:5});assert(escape.some(s=>s.r[0]<0&&!s.center),'Orbit near the boundary can escape');
}
// B=0 is free flight, with finite integration timing and no cyclotron orbit.
for(const mode of ['entry','gyration','electric','gradient','curvature'])for(const species of Object.keys(M.species)){
 const c=M.setup({mode,species,B:0,electric:0}),history=M.simulate(c,{turns:2});assert.equal(c.period,Infinity);assert(Number.isFinite(c.timePeriod));
 for(const state of history){assert(state.r.every(Number.isFinite)&&state.v.every(Number.isFinite));relative(state.energy,c.energy,1e-12,'Zero field preserves energy');assert.equal(state.center,null);for(let k=0;k<3;k++)assert(Math.abs(state.r[k]-c.initial.r[k]-c.initial.v[k]*state.t)<c.length*1e-9,'Zero field gives straight motion');}
}

// Run real controls and rendering with a deterministic DOM/canvas fixture.
const html=fs.readFileSync(path.join(base,'index.html'),'utf8'),nodes=new Map(),noop=()=>{};let lastItems,lastGlyph,renderCalls=0,disposed=false;
let canvasPath=[],orbitWidths=[],lastGraphPath=[],electricArrow,lastPhysics,integratedTime=0,scaleCards=0,magneticMarks=[],magneticLines=[],magneticArrows=[],fieldTints=[],radialGlows=[];
const context=new Proxy({arc(x,y,r){if(/^rgba\(53,106,195,/.test(this.strokeStyle)&&r>2.5&&r<8)magneticMarks.push({x,y,r,color:this.strokeStyle});},beginPath(){canvasPath=[];},moveTo(x,y){canvasPath.push([x,y]);},lineTo(x,y){canvasPath.push([x,y]);},stroke(){if(/^rgba\(53,106,195,/.test(this.strokeStyle)&&canvasPath.length>1)magneticLines.push({color:this.strokeStyle,width:this.lineWidth});if(this.strokeStyle==='#bd7030'&&canvasPath.length>2)lastGraphPath=canvasPath.slice();if(this.strokeStyle==='rgba(22,125,115,.24)'&&canvasPath.length===121)orbitWidths.push(Math.max(...canvasPath.map(p=>p[0]))-Math.min(...canvasPath.map(p=>p[0])));},fillRect(x,y,w,h){if(h===630&&(typeof this.fillStyle==='object'||/^rgba\(53,106,195,/.test(this.fillStyle)))fieldTints.push({x,y,w,h,color:this.fillStyle});if(this.fillStyle==='#ffffff'&&x===16&&h===61)scaleCards++;},fill(){if(/^rgba\(53,106,195,/.test(this.fillStyle)&&canvasPath.length===7)magneticArrows.push({color:this.fillStyle,length:Math.hypot(canvasPath[3][0]-canvasPath[0][0],canvasPath[3][1]-canvasPath[0][1])});if(this.fillStyle==='#b57825')electricArrow=canvasPath.slice();},createRadialGradient:(...args)=>{const gradient={args,stops:[],addColorStop(position,color){this.stops.push({position,color});}};radialGlows.push(gradient);return gradient;},createLinearGradient:()=>({stops:[],addColorStop(position,color){this.stops.push({position,color});}})},{get:(o,k)=>o[k]||noop});
function element(tag='div'){return {tagName:tag,children:[],dataset:{},style:{},value:'',textContent:'',checked:false,hidden:false,clientWidth:tag==='canvas'?880:400,clientHeight:tag==='canvas'?630:40,scrollHeight:20,scrollWidth:200,getContext:()=>context,getBoundingClientRect:()=>({left:0,top:0,width:880,height:630}),append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},querySelector(selector){return this.children.find(c=>selector==='[data-key="'+c.dataset.key+'"]')||null;},remove(){},setPointerCapture:noop,showModal(){this.open=true;},close(){this.open=false;}};}
for(const [,tag,id,attrs]of html.matchAll(/<(\w+)\b[^>]*\bid="([^"]+)"([^>]*)>/g)){const el=element(tag);el.value=attrs.match(/value="([^"]*)"/)?.[1]||'';el.checked=/\bchecked\b/.test(attrs);nodes.set(id,el);}
let insetPath=[],insetVectors=[],insetFrames=0;
const insetContext=new Proxy({clearRect(){insetVectors=[];insetFrames++;},beginPath(){insetPath=[];},moveTo(x,y){insetPath.push([x,y]);},lineTo(x,y){insetPath.push([x,y]);},fill(){if(insetPath.length===7)insetVectors.push({color:this.fillStyle,origin:insetPath[0].map((v,k)=>(v+insetPath[6][k])/2),tip:insetPath[3]});}},{get:(o,k)=>o[k]||noop});
nodes.get('lorentzCanvas').getContext=()=>insetContext;
nodes.get('lorentzPanel').open=true;nodes.get('lorentzCanvas').clientWidth=322;nodes.get('lorentzCanvas').clientHeight=230;nodes.get('mode').value='entry';nodes.get('species').value='deuteron';nodes.get('graph').clientWidth=400;nodes.get('graph').clientHeight=200;
let testNow=0,animation;const env={Date:{now:()=>testNow},console,DriftModel:{...M,step(c,state,dt){integratedTime+=dt;return M.step(c,state,dt);},diagnostics(c,state){lastPhysics={config:c,state,...M.diagnostics(c,state)};return M.diagnostics(c,state);}},HiFyzikoParticleStyle:{fields:{electric:"#b57825",magnetic:"#356ac3"}},document:{getElementById:id=>nodes.get(id),querySelectorAll:()=>[],createElement:element},katex:{render(t,el){assert(!/NaN|Infinity|undefined/.test(t),t);require('../versions/vyvoj/m_files/fusion/particles/vendor/katex.js').renderToString(t,{throwOnError:true});el.tex=t;}},HiFyzikoNucleusView:class{draw(w,h,t,items){renderCalls++;lastGlyph=items[0];lastItems=items.filter(p=>!p.detail);}dispose(){disposed=true;}},ResizeObserver:class{observe(){}disconnect(){}},devicePixelRatio:1,addEventListener:noop,removeEventListener:noop,requestAnimationFrame:fn=>{animation=fn;return 1;},cancelAnimationFrame:noop};env.window=env;
vm.runInNewContext(fs.readFileSync(path.join(base,'app.js'),'utf8'),env);
for(const mode of ['entry','gyration','electric','gradient','curvature']){const cards=scaleCards;nodes.get('mode').value=mode;nodes.get('mode').onchange();assert(scaleCards>cards,'White scale card in '+mode);nodes.get('play').onclick();animation(100);nodes.get('play').onclick();nodes.get('reverse').onclick();nodes.get('reset').onclick();}
nodes.get('species').value='electron';nodes.get('species').onchange();nodes.get('help').onclick();assert(nodes.get('guide').open);nodes.get('closeHelp').onclick();assert(!nodes.get('guide').open);assert(renderCalls>20);nodes.get('play').onclick();animation(200);const before=nodes.get('timeValue').tex;nodes.get('energy').value='1000';nodes.get('energy').oninput();assert.equal(nodes.get('timeValue').tex,before,'Energy change preserves time');assert(nodes.get('readouts').children[0].tex.includes('1000'),'Live energy update');nodes.get('b').value='750';nodes.get('b').oninput();assert.equal(nodes.get('timeValue').tex,before,'B change preserves time');animation(100000);assert.notEqual(nodes.get('timeValue').tex,before,'Animation continues');nodes.get('reset').onclick();nodes.get('play').onclick();
nodes.get('species').value='deuteron';nodes.get('b').value='500';nodes.get('energy').value='500';nodes.get('mode').value='entry';nodes.get('mode').onchange();
const scene=nodes.get('scene'),scale=Math.min((880-90)/12,(630-135)/10),origin=880*.27;
scene.onpointerdown({clientX:origin-3*scale,clientY:333,pointerId:1});scene.onpointermove({clientX:origin+2*scale,clientY:333});scene.onpointerup();
assert(nodes.get('readouts').children[1].tex.startsWith('r_L='),'Dragging into the field sets an inside-field initial state');
scene.onpointerdown({clientX:origin+2*scale,clientY:333,pointerId:1});scene.onpointermove({clientX:origin-2*scale,clientY:333});scene.onpointerup();
assert.equal(nodes.get('readouts').children[1].tex,'B=0','Dragging back outside restores free-flight initial state');
nodes.get('mode').onchange();nodes.get('play').onclick();
let respawned=false,previousX=lastGlyph.x;
for(let j=0;j<600;j++){animation(101000+j*80);if(previousX<0&&lastGlyph.x>40)respawned=true;previousX=lastGlyph.x;}
assert(respawned,'Offscreen particle returns to its prepared start');assert(Math.abs(lastGlyph.x-(origin-3*scale))<1e-7,'Respawn restores visible prepared coordinates');assert(!nodes.get('play').disabled,'Respawn allows another launch');assert.equal(nodes.get('play').textContent,'Spustit','Respawn waits at start');
const finishTime=nodes.get('timeValue').tex;animation(300000);assert.equal(nodes.get('timeValue').tex,finishTime,'Pause remains available after respawn');
scene.onpointerdown({clientX:lastGlyph.x,clientY:lastGlyph.y,pointerId:2});scene.onpointermove({clientX:origin+2*scale,clientY:333});scene.onpointerup();assert(nodes.get('readouts').children[1].tex.startsWith('r_L='),'Paused particle can be placed inside the field');
nodes.get('reset').onclick();animation(300080);assert.notEqual(nodes.get('timeValue').tex,finishTime);
nodes.get('species').value='deuteron';nodes.get('mode').value='gyration';nodes.get('mode').onchange();assert(nodes.get('speciesRow').hidden);nodes.get('showProton').checked=true;nodes.get('showProton').onchange();nodes.get('showElectron').checked=true;nodes.get('showElectron').onchange();assert.equal(lastItems.length,3,'Three independently rendered particles');assert.equal(lastItems[1].id,'proton');assert.equal(lastItems[2].id,'electron');assert(nodes.get('sceneMath').querySelector('[data-key="electronZoomRadius"]'),'Electron orbit has a magnified detail with physical radius');assert.equal(lastItems[2].radius,12,'Electron glyph remains legible');nodes.get('showAlpha').checked=true;nodes.get('showAlpha').onchange();assert.equal(lastItems.length,4,'All four species including electron can be selected');nodes.get('showAlpha').checked=false;nodes.get('showAlpha').onchange();const untouched=lastItems.map(p=>({...p}));scene.onpointerdown({clientX:lastItems[1].x,clientY:lastItems[1].y,pointerId:3});scene.onpointermove({clientX:330,clientY:260});scene.onpointerup();assert(Math.abs(lastItems[1].x-330)<1e-8);assert(Math.abs(lastItems[1].y-260)<1e-8);assert.equal(lastItems[0].x,untouched[0].x,'Main particle stays put while arranging companion');assert.equal(lastItems[2].x,untouched[2].x,'Other companion stays put');nodes.get('reset').onclick();nodes.get('play').onclick();assert(Math.abs(lastItems[1].x-330)<1e-8,'Restart retains placement');const mainBefore={...lastItems[0]},extraBefore={...lastItems[1]};nodes.get('play').onclick();animation(300160);assert.notEqual(lastItems[0].x,mainBefore.x);assert.notEqual(lastItems[1].x,extraBefore.x);nodes.get('energy').value='1000';nodes.get('energy').oninput();nodes.get('b').value='700';nodes.get('b').oninput();animation(300240);assert(lastItems.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));for(const id of ['showProton','showElectron']){nodes.get(id).checked=false;nodes.get(id).onchange();}assert.equal(lastItems.length,1,'Uncheck companions');nodes.get('showDeuteron').checked=false;nodes.get('showDeuteron').onchange();assert(nodes.get('showDeuteron').checked,'Keep at least one particle');
nodes.get('mode').value='entry';nodes.get('mode').onchange();nodes.get('play').onclick();animation(300320);const switchPosition={...lastGlyph},switchTime=nodes.get('timeValue').tex;nodes.get('species').value='alpha';nodes.get('species').onchange();assert.equal(lastGlyph.id,'alpha');assert.equal(lastGlyph.x,switchPosition.x,'Species switch preserves position');assert.equal(lastGlyph.y,switchPosition.y);assert.equal(nodes.get('timeValue').tex,switchTime);assert.equal(nodes.get('play').textContent,'Pozastavit','Species switch preserves running state');animation(300400);assert.notEqual(nodes.get('timeValue').tex,switchTime);nodes.get('play').onclick();nodes.get('species').value='proton';nodes.get('species').onchange();assert.equal(nodes.get('play').textContent,'Spustit','Species switch preserves pause');
nodes.get('species').value='deuteron';nodes.get('mode').value='gradient';nodes.get('mode').onchange();assert(nodes.get('axisNotice').hidden,'Normal range has no notice');nodes.get('b').value='100';nodes.get('b').oninput();assert(!nodes.get('axisNotice').hidden,'Out-of-range center expands graph axes and announces it');const enlargedTick=nodes.get('graphMath').querySelector('[data-key="y0"]').tex;testNow+=2000;animation(300480);assert(nodes.get('axisNotice').hidden,'Scale notice disappears');assert.equal(nodes.get('graphMath').querySelector('[data-key="y0"]').tex,enlargedTick,'Expanded scale stays fixed');
for(const species of ['electron','proton','deuteron','alpha']){nodes.get('species').value=species;nodes.get('mode').value='electric';nodes.get('mode').onchange();const labels=nodes.get('graphMath'),ys=Array.from({length:5},(_,i)=>labels.querySelector('[data-key="y'+i+'"]').tex),xs=['zero','xtick1','xtick2','xtick3','end'].map(key=>labels.querySelector('[data-key="'+key+'"]').tex);assert.equal(new Set(ys).size,5,'All y ticks are distinct for '+species);assert.equal(new Set(xs).size,5,'All time ticks are distinct for '+species);assert(!ys.includes('-0'),'No negative zero');}
nodes.get('species').value='deuteron';nodes.get('mode').value='gyration';nodes.get('mode').onchange();for(const id of ['showProton','showAlpha','showElectron'])if(nodes.get(id).checked){nodes.get(id).checked=false;nodes.get(id).onchange();}nodes.get('play').onclick();animation(500000);const ionTime=nodes.get('timeValue').tex,ionPosition={...lastItems[0]};nodes.get('showElectron').checked=true;nodes.get('showElectron').onchange();assert.equal(nodes.get('timeValue').tex,ionTime,'Adding electron preserves time');assert.equal(lastItems[0].x,ionPosition.x,'Adding electron preserves ion position');assert.equal(nodes.get('play').textContent,'Pozastavit','Checkbox preserves running');assert(!nodes.get('speedNotice').hidden);animation(500080);assert(Math.abs(lastItems[0].x-ionPosition.x)<.2,'Common time slows the ion when electron is present');testNow+=3000;animation(500160);assert(nodes.get('speedNotice').hidden);nodes.get('showElectron').checked=false;nodes.get('showElectron').onchange();assert.equal(nodes.get('play').textContent,'Pozastavit','Removing electron keeps running');
nodes.get('showElectron').checked=true;nodes.get('showElectron').onchange();const ionSlow={...lastItems[0]};nodes.get('rate').value='4';nodes.get('rate').oninput();assert(nodes.get('rateValue').tex.includes('10000'));animation(500240);assert(Math.hypot(lastItems[0].x-ionSlow.x,lastItems[0].y-ionSlow.y)>2,'Maximum speed makes ion motion visible with electron enabled');assert(lastItems.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
// Compare actual canvas orbit diameters after separate preparations, not only model radii.
nodes.get('b').value='500';nodes.get('energy').value='500';nodes.get('pitch').value='0';nodes.get('centers').checked=true;
const widths={};for(const species of ['deuteron','alpha']){nodes.get('species').value=species;orbitWidths=[];nodes.get('mode').onchange();widths[species]=orbitWidths[0];}
assert(widths.deuteron>0&&widths.alpha>0,'Orbit paths rendered');
relative(widths.alpha/widths.deuteron,Math.sqrt(M.species.alpha.m/M.species.deuteron.m)/2,1e-10,'Rendered orbits share a species-independent physical scale');
assert(!nodes.get('comparison').hidden&&nodes.get('graph').hidden,'Gyration replaces graph with comparison');
nodes.get('showDeuteron').checked=true;nodes.get('showDeuteron').onchange();nodes.get('showAlpha').checked=true;nodes.get('showAlpha').onchange();
relative(parseFloat(nodes.get('bar-alpha').style.width)/parseFloat(nodes.get('bar-deuteron').style.width),Math.sqrt(M.species.alpha.m/M.species.deuteron.m)/2,1e-10,'Comparison bars share a linear scale');
const radiusBefore=nodes.get('rho-alpha').tex;nodes.get('energy').value='1000';nodes.get('energy').oninput();assert.notEqual(nodes.get('rho-alpha').tex,radiusBefore,'Comparison updates live');
nodes.get('species').value='deuteron';nodes.get('energy').value='500';nodes.get('b').value='1000';nodes.get('rate').value='0';nodes.get('mode').value='entry';nodes.get('mode').onchange();
assert(nodes.get('comparison').hidden&&!nodes.get('graph').hidden,'Entry retains time graph');
scene.onpointerdown({clientX:lastGlyph.x,clientY:lastGlyph.y,pointerId:9});scene.onpointermove({clientX:origin+2*scale,clientY:333});scene.onpointerup();nodes.get('play').onclick();
for(let j=0;j<400;j++)animation(600000+j*80);
assert(lastGraphPath.length>1440,'History covers full time window beyond old sample cap');assert(lastGraphPath[0][0]<=62,'History reaches the left edge of the displayed time window');
const entryPosition={...lastGlyph},entryTime=nodes.get('timeValue').tex;nodes.get('species').value='electron';orbitWidths=[];nodes.get('species').onchange();
assert.equal(nodes.get('timeValue').tex,entryTime);relative(lastGlyph.x,entryPosition.x,1e-12,'Entry magnification preserves screen position');relative(lastGlyph.y,entryPosition.y,1e-12,'Entry magnification preserves screen height');assert.equal(nodes.get('play').textContent,'Pozastavit');assert(orbitWidths.at(-1)>40,'Electron entry orbit is visibly magnified');
let driftTick=700000;for(const mode of ['electric','gradient','curvature']){
 nodes.get('species').value='electron';nodes.get('b').value='500';nodes.get('energy').value='500';nodes.get('mode').value=mode;orbitWidths=[];nodes.get('mode').onchange();
 assert(orbitWidths[0]>15,'Electron orbit visible in '+mode);
 const scaleLabel=nodes.get('sceneMath').querySelector('[data-key="scale"]')?.tex,position={...lastGlyph};
 nodes.get('play').onclick();animation(driftTick+=80);animation(driftTick+=80);assert(Math.hypot(lastGlyph.x-position.x,lastGlyph.y-position.y)>1,'Visible electron motion in '+mode);
 nodes.get('energy').value='1000';nodes.get('energy').oninput();nodes.get('b').value='700';nodes.get('b').oninput();assert.equal(nodes.get('sceneMath').querySelector('[data-key="scale"]')?.tex,scaleLabel,'Live controls keep spatial scale fixed in '+mode);
}
nodes.get('species').value='deuteron';nodes.get('mode').value='gyration';nodes.get('mode').onchange();
const zoomStart={...lastGlyph},zoomScale=nodes.get('sceneMath').querySelector('[data-key="scale"]').tex,zoomTime=nodes.get('timeValue').tex;let prevented=false;
scene.onwheel({clientX:zoomStart.x,clientY:zoomStart.y,deltaY:-400,deltaMode:0,preventDefault(){prevented=true;}});
assert(prevented);relative(lastGlyph.x,zoomStart.x,1e-12,'Zoom anchors the cursor');relative(lastGlyph.y,zoomStart.y,1e-12,'Zoom anchors cursor height');assert.notEqual(nodes.get('sceneMath').querySelector('[data-key="scale"]').tex,zoomScale);assert.equal(nodes.get('timeValue').tex,zoomTime);
scene.onpointerdown({clientX:lastGlyph.x,clientY:lastGlyph.y,pointerId:10});scene.onpointermove({clientX:410,clientY:290});scene.onpointerup();relative(lastGlyph.x,410,1e-12,'Dragging respects zoom and camera');relative(lastGlyph.y,290,1e-12,'Dragging respects zoom height');
scene.ondblclick();assert.equal(nodes.get('sceneMath').querySelector('[data-key="scale"]').tex,zoomScale,'Double click restores scale');nodes.get('play').onclick();scene.onwheel({clientX:440,clientY:333,deltaY:-500,deltaMode:0,preventDefault:noop});animation(driftTick+=80);assert.equal(nodes.get('play').textContent,'Pozastavit','Zoom preserves running state');
scene.ondblclick();nodes.get('pitch').value='45';nodes.get('pitch').oninput();if(nodes.get('play').textContent==='Spustit')nodes.get('play').onclick();animation(driftTick+=80);const rotateTime=nodes.get('timeValue').tex,rotateEnergy=nodes.get('readouts').children[0].tex;
scene.onpointerdown({clientX:800,clientY:100,pointerId:11});scene.onpointermove({clientX:850,clientY:200});scene.onpointerup();assert.equal(nodes.get('timeValue').tex,rotateTime,'Rotation preserves simulation time');assert.equal(nodes.get('readouts').children[0].tex,rotateEnergy,'Rotation preserves physics');assert.equal(nodes.get('play').textContent,'Pozastavit','Rotation does not pause');assert(nodes.get('sceneMath').querySelector('[data-key="b"]'),'Tilted view labels field direction');
const tiltAnchor={...lastGlyph};scene.onwheel({clientX:tiltAnchor.x,clientY:tiltAnchor.y,deltaY:-100,deltaMode:0,preventDefault:noop});relative(lastGlyph.x,tiltAnchor.x,1e-12,'Tilted zoom anchors x');relative(lastGlyph.y,tiltAnchor.y,1e-12,'Tilted zoom anchors y');nodes.get('play').onclick();scene.onpointerdown({clientX:lastGlyph.x,clientY:lastGlyph.y,pointerId:12});scene.onpointermove({clientX:420,clientY:280});scene.onpointerup();relative(lastGlyph.x,420,1e-12,'Tilted dragging follows cursor x');relative(lastGlyph.y,280,1e-12,'Tilted dragging follows cursor y');
for(const pitch of [-90,90]){const setup=M.setup({mode:'gyration',pitch});assert.equal(Math.sign(setup.initial.v[2]),Math.sign(pitch),'Signed pitch selects parallel direction');relative(M.norm(setup.initial.v),setup.speed,1e-12,'Pitch preserves speed');}
for(const id of ['showElectron','showAlpha','showProton'])if(nodes.get(id).checked){nodes.get(id).checked=false;nodes.get(id).onchange();}
for(const pitch of [90,-90]){
 nodes.get('mode').value='gyration';nodes.get('mode').onchange();scene.ondblclick();nodes.get('b').value='500';nodes.get('b').oninput();nodes.get('rate').value='0';nodes.get('pitch').value=String(pitch);nodes.get('pitch').oninput();
 scene.onpointerdown({clientX:800,clientY:100,pointerId:14});scene.onpointermove({clientX:800,clientY:300});scene.onpointerup();nodes.get('play').onclick();let jumped=false,previous=lastGlyph.y;
 for(let j=0;j<220;j++){animation(driftTick+=80);if((lastGlyph.y-previous)*Math.sign(pitch)>200)jumped=true;previous=lastGlyph.y;assert(lastItems.every(item=>item.y>=80-1e-7&&item.y<=530+1e-7),'All particles wrap within view');}
 assert(jumped,'Particle wraps to opposite edge for pitch '+pitch);assert.equal(nodes.get('play').textContent,'Pozastavit');
 const beforeControlTime=nodes.get('timeValue').tex,beforeControl={...lastGlyph};nodes.get('pitch').value='30';nodes.get('pitch').oninput();assert.equal(nodes.get('timeValue').tex,beforeControlTime,'Pitch preserves time');assert.equal(lastGlyph.x,beforeControl.x);assert.equal(lastGlyph.y,beforeControl.y);assert.equal(nodes.get('play').textContent,'Pozastavit');
}
nodes.get('mode').onchange();scene.ondblclick();nodes.get('pitch').value='0';nodes.get('pitch').oninput();scene.onpointerdown({clientX:lastGlyph.x,clientY:lastGlyph.y,pointerId:16});scene.onpointermove({clientX:440,clientY:90});scene.onpointerup();nodes.get('play').onclick();let edgeY=lastGlyph.y;for(let j=0;j<100;j++){animation(driftTick+=80);assert(Math.abs(lastGlyph.y-edgeY)<80,'Transverse orbit never teleports across screen');edgeY=lastGlyph.y;}
// Verify the real E control, field arrow, graph axis and live integration together.
const defaultElectric=Number(html.match(/id="electric"[^>]*value="([^"]+)"/)[1]);
const defaultB=Number(html.match(/id="b"[^>]*value="([^"]+)"/)[1])/1000;
assert(defaultElectric/(defaultB*M.setup({species:'deuteron',energy:500}).speed)>.02,'Default E keeps a moderate visible drift');
const maxElectric=Number(html.match(/id="electric"[^>]*max="([^"]+)"/)[1]);
assert(maxElectric<300000,'Static E range no longer permits extreme intensities');
for(const species of ['deuteron','electron'])for(const fieldSign of [-1,1])for(const electric of [-defaultElectric,0,defaultElectric]){
 nodes.get('species').value=species;nodes.get('b').value='500';nodes.get('energy').value='500';nodes.get('pitch').value='0';nodes.get('rate').value='0';nodes.get('mode').value='electric';nodes.get('mode').onchange();
 if(Math.sign(lastPhysics.config.B)!==fieldSign){nodes.get('reverse').onclick();}
 nodes.get('electric').value=String(electric);nodes.get('electric').oninput();
 assert.equal(lastPhysics.config.electric,electric,'E input reaches solver');
 assert(nodes.get('graphMath').querySelector('[data-key="axis"]').tex.startsWith('x'),'E drift graph uses horizontal displacement');
 if(electric)assert.equal(Math.sign(electricArrow[3][1]-electricArrow[0][1]),Math.sign(electric),'E arrow follows actual vertical field');
 const initial=lastPhysics,startTime=integratedTime;nodes.get('play').onclick();for(let j=0;j<5;j++)animation(driftTick+=80);
 const elapsed=integratedTime-startTime,shift=lastPhysics.center[0]-initial.center[0],expected=-electric/lastPhysics.config.B*elapsed;
 if(electric)relative(shift,expected,1e-8,'Real controls produce correct drift independent of charge');else assert(Math.abs(shift)<lastPhysics.config.length*1e-8,'E=0 has no center drift');
 const beforeLiveTime=nodes.get('timeValue').tex,beforeLiveGlyph={...lastGlyph};nodes.get('electric').value=String(-electric);nodes.get('electric').oninput();
 assert.equal(nodes.get('timeValue').tex,beforeLiveTime,'Live E change keeps time');assert.equal(lastGlyph.x,beforeLiveGlyph.x,'Live E change keeps position');assert.equal(lastGlyph.y,beforeLiveGlyph.y);
 assert.equal(nodes.get('play').textContent,'Pozastavit','Changing E preserves continued playback');
 const afterChange=lastPhysics,changedAt=integratedTime;for(let j=0;j<5;j++)animation(driftTick+=80);
 if(electric)relative(lastPhysics.center[0]-afterChange.center[0],electric/lastPhysics.config.B*(integratedTime-changedAt),1e-8,'Moving E control reverses drift during playback');
}

// Every experiment zooms around the cursor without touching physics or playback.
for(const mode of ['entry','gyration','electric','gradient','curvature']){
 nodes.get('mode').value=mode;nodes.get('mode').onchange();scene.ondblclick();
 const before={...lastGlyph},time=nodes.get('timeValue').tex,energy=nodes.get('readouts').children[0].tex,measure=nodes.get('sceneMath').querySelector('[data-key="scale"]').tex;
 scene.onwheel({clientX:before.x,clientY:before.y,deltaY:-200,deltaMode:0,preventDefault:noop});
 relative(lastGlyph.x,before.x,1e-12,'Zoom-in anchor x in '+mode);relative(lastGlyph.y,before.y,1e-12,'Zoom-in anchor y in '+mode);assert.notEqual(nodes.get('sceneMath').querySelector('[data-key="scale"]').tex,measure);
 scene.onwheel({clientX:before.x,clientY:before.y,deltaY:200,deltaMode:0,preventDefault:noop});
 relative(lastGlyph.x,before.x,1e-12,'Zoom-out anchor x in '+mode);relative(lastGlyph.y,before.y,1e-12,'Zoom-out anchor y in '+mode);assert.equal(nodes.get('timeValue').tex,time);assert.equal(nodes.get('readouts').children[0].tex,energy);
 nodes.get('play').onclick();scene.onwheel({clientX:400,clientY:300,deltaY:2,deltaMode:1,preventDefault:noop});assert.equal(nodes.get('play').textContent,'Pozastavit','Zoom preserves playing in '+mode);scene.ondblclick();
 assert.equal(nodes.get('timeValue').tex,time,'Reset view does not reset time');
}
// Stress all E extremes at both ends of B/energy, for all selectable species.
for(const species of Object.keys(M.species))for(const b of [100,6000])for(const energy of [50,1000])for(const fieldSign of [-1,1])for(const electricSign of [-1,1]){
 nodes.get('species').value=species;nodes.get('b').value=String(b);nodes.get('energy').value=String(energy);nodes.get('mode').value='electric';nodes.get('mode').onchange();if(Math.sign(lastPhysics.config.B)!==fieldSign){nodes.get('reverse').onclick();}
 nodes.get('electric').value=String(electricSign*Number(nodes.get('electric').max)*100);nodes.get('electric').oninput();
 assert(Math.abs(lastPhysics.config.electric)<=.08*Math.abs(lastPhysics.config.B)*lastPhysics.config.speed,'E is capped to a moderate drift for '+species);
 assert.equal(Math.sign(lastPhysics.config.electric),electricSign);nodes.get('rate').value=String(Math.log10(3));nodes.get('play').onclick();const started=integratedTime;
 for(let j=0;j<60;j++){animation(driftTick+=80);assert(lastGlyph.x>=59.99&&lastGlyph.x<=820.01&&lastGlyph.y>=164.99&&lastGlyph.y<=505.01,'E extreme stays visible for '+species);assert.equal(nodes.get('play').textContent,'Pozastavit','No offscreen reset at E limit');}
 assert(integratedTime>started,'Physics keeps advancing at E limit');
 const before=nodes.get('timeValue').tex;nodes.get('b').value='100';nodes.get('b').oninput();nodes.get('energy').value='50';nodes.get('energy').oninput();assert(Math.abs(lastPhysics.config.electric)<=.08*Math.abs(lastPhysics.config.B)*lastPhysics.config.speed,'Parameter changes recalculate cap');assert.equal(nodes.get('timeValue').tex,before,'Limiting E keeps time');
}
const css=fs.readFileSync(path.join(base,'style.css'),'utf8');
assert(/#electricRow\{[^}]*grid-column:1\/-1[^}]*height:42px[^}]*white-space:nowrap/.test(css),'E instrument row has fixed geometry');
assert(/#electricValue\{[^}]*width:220px[^}]*height:20px[^}]*white-space:nowrap/.test(css),'Minus sign has reserved space');
assert(!/body:not[^}]*scale[^}]*background:transparent/.test(css),'Scale stays white outside gyration');
assert(html.includes('E×B drift')&&html.includes('Grad-B drift')&&html.includes('Drift zakřivení')&&!html.includes('Elektrický drift')&&!html.includes('Gradientní drift'),'Names match chapter 7.4');

// Reversal changes only direction and preserves playback and the scene.
assert(html.includes('id="reverse">Obrátit B pole'),'Reversal button is restored');
assert(/id="b"[^>]*min="0"[^>]*max="6000"/.test(html),'Entry magnitude slider includes zero');
for(const mode of ['entry','gyration','electric','gradient','curvature'])for(const species of Object.keys(M.species)){
 nodes.get('species').value=species;nodes.get('b').value='100';nodes.get('mode').value=mode;nodes.get('mode').onchange();nodes.get('rate').value='-1';nodes.get('play').onclick();
 for(let j=0;j<4;j++){
  const time=nodes.get('timeValue').tex,position={...lastGlyph},B=lastPhysics.config.B,velocity=[...lastPhysics.state.v],E=lastPhysics.config.electric;
  nodes.get('reverse').onclick();assert.equal(lastPhysics.config.B,-B);assert.equal(nodes.get('b').value,'100');assert.equal(lastPhysics.config.electric,E);
  assert.equal(nodes.get('timeValue').tex,time);assert.equal(lastGlyph.x,position.x);assert.equal(lastGlyph.y,position.y);assert.deepEqual(Array.from(lastPhysics.state.v),velocity);
  animation(driftTick+=80);assert(lastItems.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));assert.equal(nodes.get('play').textContent,'Pozastavit','Reversal keeps playback in '+mode);
 }
}
nodes.get('species').value='deuteron';nodes.get('mode').value='electric';nodes.get('b').value='500';nodes.get('mode').onchange();
nodes.get('electric').value=nodes.get('electric').max;nodes.get('electric').oninput();const fullArrow=Math.abs(electricArrow[3][1]-electricArrow[0][1]);
nodes.get('electric').value=String(Number(nodes.get('electric').max)/2);nodes.get('electric').oninput();relative(Math.abs(electricArrow[3][1]-electricArrow[0][1]),fullArrow/2,.002,'E arrow length follows control magnitude');
const fraction=Number(nodes.get('electric').value)/Number(nodes.get('electric').max);for(const value of ['100','200','500']){nodes.get('b').value=value;nodes.get('b').oninput();if(value!=='0'){relative(Number(nodes.get('electric').value)/Number(nodes.get('electric').max),fraction,.004,'E selection survives changing |B| and crossing zero');assert(!nodes.get('electric').disabled);}}
// Multiple species remain finite when a zero request is clamped in gyration.
nodes.get('mode').value='gyration';nodes.get('mode').onchange();for(const id of ['showProton','showAlpha','showElectron']){nodes.get(id).checked=true;nodes.get(id).onchange();}nodes.get('b').value='0';nodes.get('b').oninput();assert.equal(Math.abs(lastPhysics.config.B),.1,'Gyration clamps B away from zero');nodes.get('rate').value='-1';nodes.get('play').onclick();for(let j=0;j<5;j++)animation(driftTick+=80);assert.equal(lastItems.length,4);assert(lastItems.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));

// Zero B is available only for entry, where it produces straight flight.
for(const mode of ['gyration','electric','gradient','curvature']){
 nodes.get('mode').value=mode;nodes.get('b').value='0';nodes.get('mode').onchange();assert.equal(nodes.get('b').min,'100');assert.equal(Math.abs(lastPhysics.config.B),.1);nodes.get('b').value='0';nodes.get('b').oninput();assert.equal(Math.abs(lastPhysics.config.B),.1,'Live input also respects the nonzero minimum');
}
nodes.get('species').value='deuteron';nodes.get('energy').value='500';nodes.get('mode').value='entry';nodes.get('b').value='0';nodes.get('mode').onchange();assert.equal(nodes.get('b').min,'0');assert.equal(lastPhysics.config.B,0);nodes.get('rate').value='-1';nodes.get('play').onclick();const entryY=lastGlyph.y;for(let j=0;j<5;j++){animation(driftTick+=80);assert.equal(lastGlyph.y,entryY,'Without B the projectile flies straight');}
const alpha=color=>Number(color.match(/,([.0-9]+)\)$/)[1]);
for(const mode of ['entry','gyration','electric','gradient']){
 nodes.get('mode').value=mode;nodes.get('b').value='100';nodes.get('mode').onchange();scene.ondblclick();nodes.get('gradient').value='0';nodes.get('gradient').oninput();magneticMarks=[];nodes.get('b').oninput();const weak=magneticMarks[0];
 magneticMarks=[];nodes.get('b').value='6000';nodes.get('b').oninput();const strong=magneticMarks[0];assert(weak&&strong,'Field markers in '+mode);assert(strong.r/weak.r>2&&strong.r/weak.r<2.5,'Marker size clearly distinguishes weak and strong B');assert(alpha(strong.color)>alpha(weak.color),'Blue strength grows with B');
 magneticMarks=[];nodes.get('reverse').onclick();assert.equal(magneticMarks[0].r,strong.r);assert.equal(magneticMarks[0].color,strong.color,'Reversing B preserves strength encoding');
}
nodes.get('mode').value='gradient';nodes.get('b').value='500';nodes.get('mode').onchange();nodes.get('gradient').value='12';magneticMarks=[];nodes.get('gradient').oninput();const left=magneticMarks.find(p=>p.x===40),right=magneticMarks.find(p=>p.x===808);assert(left&&right);assert(right.r>left.r&&alpha(right.color)>alpha(left.color),'Grad-B uses local field strength');
for(const mode of ['gyration','curvature']){
 nodes.get('mode').value=mode;nodes.get('b').value='100';nodes.get('mode').onchange();if(mode==='gyration'){scene.onpointerdown({clientX:800,clientY:100,pointerId:90});scene.onpointermove({clientX:800,clientY:250});scene.onpointerup();}
 magneticLines=[];magneticArrows=[];nodes.get('b').oninput();const weakLine=magneticLines[0],weakArrow=magneticArrows[0];magneticLines=[];magneticArrows=[];nodes.get('b').value='6000';nodes.get('b').oninput();assert(weakLine&&weakArrow&&magneticLines[0]&&magneticArrows[0]);assert(alpha(magneticLines[0].color)>alpha(weakLine.color));assert(magneticLines[0].width>weakLine.width);assert(magneticArrows[0].length>weakArrow.length,'3D field arrows also reflect strength');
}

// Blue shading stays local to each marker and fades completely to transparency.
for(const mode of ['entry','gyration','electric','gradient']){
 nodes.get('species').value='deuteron';nodes.get('mode').value=mode;nodes.get('b').value='6000';nodes.get('mode').onchange();scene.ondblclick();fieldTints=[];radialGlows=[];nodes.get('b').oninput();
 const glows=radialGlows.filter(g=>g.stops[0]?.color.startsWith('rgba(53,106,195,'));assert(glows.length>10,'Individual marker glows in '+mode);assert.equal(fieldTints.length,0,'No full-scene tint in '+mode);
 for(const glow of glows){assert(glow.args[5]<=22.41,'Glow stays near its marker');assert.equal(glow.stops.at(-1).position,1);assert.equal(alpha(glow.stops.at(-1).color),0,'Glow edge is fully transparent');assert(alpha(glow.stops[0].color)>alpha(glow.stops[1].color)&&alpha(glow.stops[1].color)>alpha(glow.stops[2].color),'Glow fades smoothly');if(mode==='entry')assert(glow.args[0]-glow.args[5]>=880*.27-1e-8,'Entry glow stays inside the field');}
}
nodes.get('mode').value='gradient';nodes.get('b').value='500';nodes.get('mode').onchange();nodes.get('gradient').value='12';radialGlows=[];nodes.get('gradient').oninput();const local=radialGlows.filter(g=>g.stops[0]?.color.startsWith('rgba(53,106,195,')),leftGlow=local.find(g=>g.args[0]===40),rightGlow=local.find(g=>g.args[0]===808);assert(alpha(rightGlow.stops[0].color)>alpha(leftGlow.stops[0].color),'Marker glow follows local B');
nodes.get('mode').value='entry';nodes.get('b').value='0';nodes.get('mode').onchange();fieldTints=[];radialGlows=[];nodes.get('b').oninput();assert.equal(fieldTints.length,0);assert.equal(radialGlows.length,0,'B=0 has no marker glow');

// The collapsible Lorentz reminder uses actual local fields and signed charge.
const viewRight=[Math.cos(.7),-Math.sin(.7),0],viewUp=[-Math.sin(.7)*Math.sin(.55),-Math.cos(.7)*Math.sin(.55),Math.cos(.55)];
function expectInsetArrow(color,vector,message){const arrow=insetVectors.find(a=>a.color===color);assert(arrow,message+' arrow');const n=M.norm(vector),dx=M.dot(vector,viewRight)/n,dy=-M.dot(vector,viewUp)/n,actual=arrow.tip.map((v,k)=>v-arrow.origin[k]),projected=Math.hypot(dx,dy),length=Math.hypot(...actual);assert(length>0,message+' visible length');assert(Math.abs(actual[0]/length-dx/projected)<1e-10,message+' horizontal direction');assert(Math.abs(actual[1]/length-dy/projected)<1e-10,message+' vertical direction');}
for(const species of ['proton','electron','alpha']){
 nodes.get('species').value=species;nodes.get('b').value='500';nodes.get('mode').value='electric';nodes.get('mode').onchange();nodes.get('electric').value=String(Number(nodes.get('electric').max)/2);nodes.get('electric').oninput();
 const current=lastPhysics,fields=M.fields(current.config,current.state.r);assert(nodes.get('lorentzFormula').tex.includes('mathbf E+'),'Full Lorentz formula with E');assert(nodes.get('lorentzCharge').tex.includes(species==='electron'?'-':'+'));if(species==='alpha')assert(nodes.get('lorentzCharge').tex.includes('2e'));
 for(const axis of ['x','y','z'])assert(!nodes.get('lorentzMath').querySelector('[data-key="axis-'+axis+'"]').hidden,'Cartesian axes are shown');expectInsetArrow('#198476',M.cross(current.state.v,fields.B),'Vector cross product');expectInsetArrow('#b17b2c',current.state.v,'Velocity');expectInsetArrow('#356ac3',fields.B,'Magnetic field');expectInsetArrow('#925daa',M.cross(current.state.v,fields.B).map(v=>v*current.config.q),'Signed magnetic force');expectInsetArrow('#b57825',fields.E,'Electric field');expectInsetArrow('#ad6528',fields.E.map(v=>v*current.config.q),'Signed electric force');expectInsetArrow('#314c59',M.cross(current.state.v,fields.B).map((v,k)=>current.config.q*(v+fields.E[k])),'Total Lorentz force');
 nodes.get('electric').value='0';nodes.get('electric').oninput();assert(!nodes.get('lorentzFormula').tex.includes('mathbf E+'),'E=0 selects magnetic-only formula');assert(nodes.get('lorentzMath').querySelector('[data-key="e"]').hidden&&nodes.get('lorentzMath').querySelector('[data-key="fe"]').hidden,'No stale electric vectors');
}
nodes.get('species').value='proton';nodes.get('mode').value='gyration';nodes.get('mode').onchange();nodes.get('pitch').value='90';nodes.get('pitch').oninput();assert(nodes.get('lorentzKey-fb').tex.endsWith('=0'),'Parallel motion has no magnetic force');
nodes.get('mode').value='entry';nodes.get('b').value='0';nodes.get('mode').onchange();assert(nodes.get('lorentzKey-b').tex.endsWith('=0'));assert(nodes.get('lorentzKey-fb').tex.endsWith('=0'),'Outside field has no magnetic force');
nodes.get('mode').value='electric';nodes.get('b').value='500';nodes.get('mode').onchange();nodes.get('rate').value='-1';nodes.get('play').onclick();const beforeCollapseTime=nodes.get('timeValue').tex,closedAt=insetFrames;nodes.get('lorentzPanel').open=false;nodes.get('lorentzPanel').ontoggle();assert.equal(nodes.get('timeValue').tex,beforeCollapseTime);animation(driftTick+=80);assert.notEqual(nodes.get('timeValue').tex,beforeCollapseTime,'Simulation continues while minimized');assert.equal(insetFrames,closedAt,'Minimized panel skips its rendering');const reopenTime=nodes.get('timeValue').tex,reopenPosition={...lastGlyph};nodes.get('lorentzPanel').open=true;nodes.get('lorentzPanel').ontoggle();assert(insetFrames>closedAt);assert.equal(nodes.get('timeValue').tex,reopenTime);assert.equal(lastGlyph.x,reopenPosition.x);assert.equal(lastGlyph.y,reopenPosition.y);assert.equal(nodes.get('play').textContent,'Pozastavit','Panel toggle preserves playback');
assert(/#lorentzPanel\{[^}]*position:absolute/.test(css),'Force reminder does not reflow the module');assert(html.includes('<details id="lorentzPanel" open>')&&html.includes('<summary>Lorentzova síla'),'Accessible native disclosure');

// Zero values belong to the fixed legend, never over the Cartesian origin.
nodes.get('mode').value='entry';nodes.get('b').value='0';nodes.get('mode').onchange();for(const key of ['b','fb','c']){const el=nodes.get('lorentzMath').querySelector('[data-key="'+key+'"]');assert(!el||el.hidden,'No floating zero label for '+key);}assert(nodes.get('lorentzKey-b').tex.includes('=0'));assert(nodes.get('lorentzKey-c').tex.endsWith('=0'));assert(/#lorentzPanel\{[^}]*background:#fff/.test(css),'Opaque card separates it from field markers');
// Rotating this view changes only projection, never the experiment.
nodes.get('mode').value='electric';nodes.get('b').value='500';nodes.get('mode').onchange();const forceCanvas=nodes.get('lorentzCanvas'),timeBeforeView=nodes.get('timeValue').tex,positionBeforeView={...lastGlyph},oldInset=JSON.stringify(insetVectors);forceCanvas.onpointerdown({clientX:100,clientY:100,pointerId:99,preventDefault:noop});forceCanvas.onpointermove({clientX:210,clientY:145});forceCanvas.onpointerup();assert.notEqual(JSON.stringify(insetVectors),oldInset,'Pictogram can be rotated');assert.equal(nodes.get('timeValue').tex,timeBeforeView);assert.equal(lastGlyph.x,positionBeforeView.x);assert.equal(lastGlyph.y,positionBeforeView.y);forceCanvas.ondblclick();assert.equal(JSON.stringify(insetVectors),oldInset,'Double click restores default pictogram view');

// Short labels must not cover arrowheads in the zero-field case from the screenshot.
nodes.get('mode').value='entry';nodes.get('b').value='0';nodes.get('mode').onchange();const vArrow=insetVectors.find(a=>a.color==='#b17b2c'),vLabel=nodes.get('lorentzMath').querySelector('[data-key="v"]');assert(Math.abs(parseFloat(vLabel.style.left)-vArrow.tip[0])>=14||Math.abs(parseFloat(vLabel.style.top)-vArrow.tip[1])>=14,'Velocity label leaves the arrowhead clear');

assert(!html.includes('id="lorentzState"')&&!html.includes('id="lorentzRelation"')&&!html.includes('Zelená: vektorový součin'),'Pictogram contains symbols rather than prose');
// Magnitudes are wired to controls even before the projectile enters the field.
const lengthOf=color=>{const a=insetVectors.find(v=>v.color===color);return a?Math.hypot(...a.tip.map((v,k)=>v-a.origin[k])):0;};
nodes.get('species').value='proton';nodes.get('mode').value='entry';nodes.get('b').value='100';nodes.get('energy').value='500';nodes.get('mode').onchange();assert(!nodes.get('lorentzPreview').hidden,'Outside-field diagram is explicitly marked as a field preview');assert.equal(M.norm(M.fields(lastPhysics.config,lastPhysics.state.r).B),0,'Preview does not change actual local field');const weak={b:lengthOf('#356ac3'),c:lengthOf('#198476'),f:lengthOf('#925daa')};nodes.get('b').value='6000';nodes.get('b').oninput();assert(lengthOf('#356ac3')>weak.b*2,'B length grows visibly with magnitude');assert(lengthOf('#198476')>weak.c&&lengthOf('#925daa')>weak.f,'Product and magnetic force react to B');nodes.get('energy').value='50';nodes.get('energy').oninput();const slow=[lengthOf('#b17b2c'),lengthOf('#198476'),lengthOf('#925daa')];nodes.get('energy').value='1000';nodes.get('energy').oninput();assert(lengthOf('#b17b2c')>slow[0]&&lengthOf('#198476')>slow[1]&&lengthOf('#925daa')>slow[2],'Velocity, product and force react to energy');
nodes.get('mode').value='electric';nodes.get('b').value='500';nodes.get('mode').onchange();assert(nodes.get('lorentzPreview').hidden,'Inside-field modes use actual fields');nodes.get('electric').value=String(Number(nodes.get('electric').max)/4);nodes.get('electric').oninput();const smallE=[lengthOf('#b57825'),lengthOf('#ad6528'),lengthOf('#314c59')];nodes.get('electric').value=nodes.get('electric').max;nodes.get('electric').oninput();assert(lengthOf('#b57825')>smallE[0]&&lengthOf('#ad6528')>smallE[1],'E and electric force lengths react to E');assert.notEqual(lengthOf('#314c59'),smallE[2],'Total force reacts to E');

// E and both force contributions share the Cartesian origin; forces add geometrically.
for(const species of ['proton','electron','alpha'])for(const direction of [-1,1]){
 nodes.get('species').value=species;nodes.get('mode').value='electric';nodes.get('b').value='500';nodes.get('mode').onchange();if(Math.sign(lastPhysics.config.B)!==direction)nodes.get('reverse').onclick();nodes.get('electric').value=nodes.get('electric').max;nodes.get('electric').oninput();
 const find=color=>insetVectors.find(a=>a.color===color),B=find('#356ac3'),E=find('#b57825'),FB=find('#925daa'),FE=find('#ad6528'),F=find('#314c59');assert(B&&E&&FB&&FE&&F);
 for(const arrow of [E,FB,FE,F])for(let k=0;k<2;k++)assert(Math.abs(arrow.origin[k]-B.origin[k])<1e-10,'All Lorentz vectors share one origin');
 for(let k=0;k<2;k++)assert(Math.abs((F.tip[k]-F.origin[k])-(FB.tip[k]-FB.origin[k])-(FE.tip[k]-FE.origin[k]))<1e-9,'Force arrow is the actual vector sum');
}

// E changes its own contribution without re-scaling an unchanged magnetic force.
nodes.get('species').value='proton';nodes.get('mode').value='electric';nodes.get('b').value='500';nodes.get('mode').onchange();nodes.get('electric').value=String(Number(nodes.get('electric').max)/4);nodes.get('electric').oninput();const magneticBeforeE=lengthOf('#925daa');nodes.get('electric').value=nodes.get('electric').max;nodes.get('electric').oninput();assert(Math.abs(lengthOf('#925daa')-magneticBeforeE)<1e-10,'Magnetic force scale remains fixed while E changes');

env.HiFyzikoFusionDispose();assert(disposed,'GPU lifecycle');
console.log('PASS: analytic gyration, entry/exit, energy/work, all drift signs and magnitudes, boundary convergence, controls, rendering math and disposal.');
