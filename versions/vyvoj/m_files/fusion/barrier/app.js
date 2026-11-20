(()=>{'use strict';
const R=FusionReactions;
const $=id=>document.getElementById(id),M=CoulombModel,S=HiFyzikoParticleStyle,c=$('scene'),g=$('graph'),ctx=c.getContext('2d'),gc=g.getContext('2d');
const fmt=n=>n.toFixed(1).replace('.', '{,}'),tex=(el,s)=>{if(el.dataset.texValue!==s){el.innerHTML=katex.renderToString(s,{throwOnError:true});el.dataset.texValue=s;}};
for(const id of ['target','projectile'])for(const [key,n]of Object.entries(M.nuclei)){const o=document.createElement('option');o.value=key;o.textContent=n.name;$(id).append(o);}
let painter;try{painter=new HiFyzikoNucleusView($('nuclei'));}catch(e){$('renderError').hidden=false;$('renderError').textContent=e.message;}
let waveWasPaused=false,wavePreview=null;
$('tunnelVideoOpen').onclick=()=>{waveWasPaused=paused;paused=true;stopSound();$('tunnelVideoDialog').showModal();if(!wavePreview)wavePreview=new HiFyzikoWavePreview();wavePreview.open();};
$('tunnelVideoClose').onclick=()=>$('tunnelVideoDialog').close();
$('tunnelVideoDialog').addEventListener('close',()=>{wavePreview?.close();paused=waveWasPaused;$('tunnelVideoOpen').focus();});
window.addEventListener('pagehide',()=>wavePreview?.dispose());
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let p,shot,x=24,y=0,vx=0,vy=0,drag=null,aiming=false,mode='ready',energy=12.926,temperature=100,angle=0,paused=false,renderTime=0,old=0,W=0,H=0,scale=1,ox=0,oy=0,extent=36,preview=[],trail=[],probability=0,attempted=false,chosenOutcome=null,tunnelTime=0,tunnelFrom=null,attempts=0,passes=0,classical=0,batchNote='',zoom=1,panX=0,panY=0,activePointer=null,lastPointer=null,grabOffset=[0,0],aimAnchor=null,panning=false,centers=[],targetIndex=0,tunnelTo=null,recoil=null,tried=new Set(),layoutSeed=1,gunOrigin=[24,0],gunHeading=Math.PI,previewLimit=0,releaseBounds=null,aimTarget=0;
let lastShotSetup=null;
let previewJob=null,launchPending=false,tunnelGlyphs=null;
let cell=null,layoutPoints=[],layoutDrag=null,gripMoved=false,flightAccumulator=0;
let dtBoost=[0,0];
let fitPending=true,fusion=null,dtLocalEnergy=0,fusionExampleCount=0;let collisionZoom=1,collisionFocus=null;
let rareEncounter=null,demoActive=false,demoPending=false,tunnelDisplayFrom=null,anticipated=new Map();
let preparationJob=null;

let playbackFrames=[],playbackHead=0,playbackCursor=null,recording=false,playbackHasProducts=false;
const copyPlayback=value=>JSON.parse(JSON.stringify(value));
function clearPlayback(){playbackFrames=[];playbackHead=0;playbackCursor=null;recording=false;playbackHasProducts=false;}
function playbackSnapshot(){
 const f=fusion?{...fusion,trail:[],sourceTrails:{}}:null;
 return copyPlayback({x,y,vx,vy,centers,p,shot,cell,mode,targetIndex,renderTime,fusion:f,tunnelTime,tunnelFrom,tunnelTo,tunnelDisplayFrom,tunnelApproachFrom,tunnelGraph,tunnelGlyphs,tunnelSoundStarted,dtLocalEnergy,dtBoost,probability,attempts,passes,classical,chosenOutcome,demoActive,demoPending,rareEncounter,flightAccumulator,tried:[...tried],anticipated:[...anticipated],status:$('status').dataset.fullText||$('status').textContent,statusBlocking:$('status').dataset.blocking==='true'});
}
function beginRecording(){playbackAutoSlowed=false,playbackProductsSlowed=false;clearPlayback();recording=true;playbackFrames.push({time:0,state:playbackSnapshot()});}
function recordPlayback(dt){
 if(!recording)return;if(fusion?.products)playbackHasProducts=true;playbackHead+=dt*Math.max(0,playbackSpeed);playbackFrames.push({time:playbackHead,state:playbackSnapshot()});
 // Keep the complete history, reducing old sampling density rather than
 // cutting off its beginning. Positions are interpolated during replay.
 if(playbackFrames.length>12000)playbackFrames=playbackFrames.filter((_,i,a)=>i%2===0||i===a.length-1);
 if(['productsDone','done','nuclear'].includes(mode))recording=false;
}
function restorePlayback(time){
 let lo=0,hi=playbackFrames.length-1;while(lo+1<hi){const mid=(lo+hi)>>1;if(playbackFrames[mid].time<=time)lo=mid;else hi=mid;}
 if(time>=playbackFrames[hi].time)lo=hi;
 const a=playbackFrames[lo],b=playbackFrames[Math.min(lo+1,playbackFrames.length-1)],q=b.time>a.time?Math.max(0,Math.min(1,(time-a.time)/(b.time-a.time))):0,state=copyPlayback(a.state);
 const mix=(u,v,keys)=>{for(const k of keys)if(Number.isFinite(u?.[k])&&Number.isFinite(v?.[k]))u[k]+=(v[k]-u[k])*q;};
 if(state.mode===b.state.mode){mix(state,b.state,['x','y','vx','vy','renderTime','tunnelTime']);state.centers.forEach((t,i)=>mix(t,b.state.centers[i],['x','y','vx','vy']));if(state.fusion&&b.state.fusion){mix(state.fusion,b.state.fusion,['time','flightTime','playbackElapsed']);if(state.fusion.products&&b.state.fusion.products)for(const group of ['products','sources'])state.fusion.products[group].forEach((t,i)=>mix(t,b.state.fusion.products[group][i],['x','y','px','py']));}}
 const changed=mode!==state.mode||!!fusion!==!!state.fusion,enteringFusion=playbackSpeed>0&&((!fusion&&!!state.fusion)||(mode!=='tunnel'&&state.mode==='tunnel'));
 ({x,y,vx,vy,centers,p,shot,cell,mode,targetIndex,renderTime,fusion,tunnelTime,tunnelFrom,tunnelTo,tunnelDisplayFrom,tunnelApproachFrom,tunnelGraph,tunnelGlyphs,tunnelSoundStarted,dtLocalEnergy,dtBoost,probability,attempts,passes,classical,chosenOutcome,demoActive,demoPending,rareEncounter,flightAccumulator}=state);
 tried=new Set(state.tried);anticipated=new Map(state.anticipated);manualDisplay=false;
 const recent=playbackFrames.slice(Math.max(0,lo-150),lo+1).map(f=>f.state);
 trail=recent.filter(t=>t.mode==='flight').map(t=>[t.x,t.y]);
 if(fusion)fusion.trail=(fusion.products?.products||[]).map((_,i)=>recent.filter(t=>t.fusion?.products?.products[i]).map(t=>{const b=t.fusion.products.products[i];return [b.x,b.y];}));
 if(changed){$('labels').replaceChildren();lastPair='';if(fusion?.products)showReactionEnergy();else $('reactionEnergy').hidden=true;}
 if(enteringFusion)slowFusionPlayback();status(state.status,state.statusBlocking===true);fieldKey='';
}
function replayPlayback(dt){
 if(playbackSpeed<0&&playbackFrames.length){if(playbackCursor===null){playbackCursor=playbackHead;stopSound();}}
 if(playbackCursor===null)return false;
 if(!paused&&playbackSpeed!==0)playbackCursor=Math.max(0,Math.min(playbackHead,playbackCursor+dt*playbackSpeed));
 restorePlayback(playbackCursor);
 if(playbackSpeed>0&&playbackCursor>=playbackHead){playbackCursor=null;}
 return true;
}

let tunnelGraph=null,tunnelApproachFrom=null,tunnelSoundStarted=false;
function clearEncounter(){preparationJob=null;clearPlayback();tunnelGraph=null;tunnelApproachFrom=null;tunnelSoundStarted=false;collisionZoom=1;collisionFocus=null;$('reactionEnergy').hidden=true;tunnelGlyphs=null;previewJob=null;launchPending=false;if(fusion){$('labels').replaceChildren();lastPair='';}fusion=null;tunnelDisplayFrom=null;anticipated.clear();rareEncounter=null;demoActive=false;demoPending=false;batchNote='';updateRareButton();}
function preferredProjectile(){return $('pairPreset').value.split('|')[1];}
function hasProjectile(){const kind=preferredProjectile();return $('projectile').value===kind||centers.some(t=>targetKind(t)===kind);}
function activeReaction(){return R.find($('projectile').value,centers[targetIndex]?targetKind(centers[targetIndex]):$('target').value,$('reactionBranch').value);}
function configureBranches(){const preset=$('pairPreset').value,select=$('reactionBranch');select.replaceChildren();const options=preset==='proton|proton'?[['pp','Bez slabé přeměny — dva protony'],['ppbeta','Se slabou přeměnou — deuteron a záření']]:preset==='deuteron|deuteron'?[['ddp','Triton + proton'],['ddn','Helium-3 + neutron']]:[];for(const [value,text]of options){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}$('branchControl').hidden=!options.length||preset==='proton|proton';}
$('reactionBranch').onchange=()=>{clearEncounter();if($('interaction').value==='gun')armGun(true);};
function isDT(){return p&&p.a.Z===1&&p.b.Z===1&&p.a.A+p.b.A===5&&p.a.A!==p.b.A;}
function updateRareButton(){const reaction=activeReaction(),busy=!!fusion&&fusion.phase!=='done',pp=$('pairPreset').value==='proton|proton';$('ppActions').hidden=!pp;$('showRare').hidden=pp;$('fusionControl').hidden=pp||!reaction;$('temperature').disabled=busy;$('fusionEnabled').disabled=busy;$('reactionBranch').disabled=busy;
 const unavailable=!p||(!p.C&&!reaction?.noBarrier)||!hasProjectile();$('showRare').disabled=unavailable;$('launch').disabled=$('interaction').value!=='gun'||!!preparationJob||mode==='recoil'||!!fusion||!hasProjectile()||shot?.canLaunch===false;
 const action=reaction?.elastic?'Připravit srážku':reaction&&$('fusionEnabled').checked?'Připravit reakci':'Připravit tunelování';$('showRare').setAttribute('aria-busy',String(!!preparationJob));$('showRare').textContent=preparationJob?'Hledám směr… Zrušit':(fusion||mode==='tunnel'||mode==='recoil')?'Připravit nový pokus':demoPending?'Zrušit ukázku':action;$('showRare').setAttribute('aria-pressed',String(demoPending));for(const [id,branch] of [['ppWithoutBeta','pp'],['ppWithBeta','ppbeta']]){$(id).disabled=$('showRare').disabled;$(id).setAttribute('aria-busy',String(!!preparationJob&&$('reactionBranch').value===branch));$(id).setAttribute('aria-pressed',String((demoPending||preparationJob)&&$('reactionBranch').value===branch));}$('showRare').title=unavailable?'Ve scéně chybí projektil vybrané reakce. Zvol dvojici nebo obnov výchozí stav.':(fusion||mode==='tunnel')?'Ukončí probíhající ukázku, obnoví původní jádra a připraví nový pokus.':'Připraví vybraný názorný výsledek z aktuální polohy. Spustí jej Vystřelit; nejde o četnost reakcí.';
}
function fitStatus(){
 const node=$('status');node.textContent=node.dataset.fullText||'';
 if(node.clientWidth<=0||node.clientHeight<=0||node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1)node.textContent='';
}
function status(text,blocking=false){
 const node=$('status');if(node.dataset.fullText===text&&node.dataset.blocking===String(blocking))return;
 node.dataset.fullText=text;node.dataset.blocking=String(blocking);
 $('statusDetails').hidden=!blocking;$('statusPopup').hidden=!blocking;$('statusPopupText').textContent=blocking?text:'';
 fitStatus();
}
$('statusClose').onclick=()=>{$('statusPopup').hidden=true;};
$('statusDetails').onclick=()=>{if($('status').dataset.blocking==='true')$('statusPopup').hidden=false;};
if(typeof ResizeObserver==='function')new ResizeObserver(fitStatus).observe($('status').parentElement);
window.addEventListener('resize',fitStatus);
function startTunnel(encounter,demo=false){
 slowFusionPlayback();
 unpause();unlockSound();stopSound();tunnelGlyphs=currentGlyphs().map(item=>unproject(item.x,item.y));tunnelDisplayFrom=tunnelGlyphs[0];targetIndex=encounter.index;probability=encounter.probability;
 const hit=centers[encounter.index],rvx=vx-(hit.vx||0),rvy=vy-(hit.vy||0),r=Math.hypot(encounter.from[0]-hit.x,encounter.from[1]-hit.y);
 dtLocalEnergy=.5*p.mu*(rvx*rvx+rvy*rvy)+p.C/r+M.surfaceField({...shot,Z:p.b.Z},{...hit,Z:p.a.Z},r).U;
 dtBoost=[(p.b.A*vx+p.a.A*(hit.vx||0))/(p.a.A+p.b.A)/Math.sqrt(931494.10242),(p.b.A*vy+p.a.A*(hit.vy||0))/(p.a.A+p.b.A)/Math.sqrt(931494.10242)];
 [x,y]=encounter.from;vx=vy=0;tunnelFrom=[...encounter.from];tunnelTo=[...encounter.to];tunnelTime=0;mode='tunnel';demoActive=demo;tunnelGraph={pair:p,centers:centers.map(t=>({...t})),targetIndex,x,y,energy,graphRadius:shot.start*6};
 const profile=barrierProfile(tunnelGraph),band=graphBarrierInterval(profile.total,energy/Math.max(1,p.C/p.R));tunnelApproachFrom=[...tunnelDisplayFrom];tunnelSoundStarted=false;
 if(band){const radius=p.R*Math.exp(1.5*(band.outer-1)),target=centers[targetIndex],dx=x-target.x,dy=y-target.y,d=Math.max(1e-12,Math.hypot(dx,dy)),gap=glyphClearance($('projectile').value,targetKind(target)),shown=radius<2*gap?gap+radius*radius/(4*gap):radius;tunnelDisplayFrom=[target.x+dx/d*shown,target.y+dy/d*shown];tunnelGraph.entryRadius=radius;}
 const span=Math.hypot(tunnelDisplayFrom[0]-tunnelApproachFrom[0],tunnelDisplayFrom[1]-tunnelApproachFrom[1]),incomingRate=shot.start*.025/Math.sqrt(2*M.thermalMean(100)/1.2),incomingSpeed=Math.max(.01,Math.hypot(shot.vx,shot.vy));tunnelGraph.approachDuration=Math.max(1.8,1.5*span/(incomingSpeed*incomingRate));

 batchNote=demo?'Ukázka vzácného průchodu dokončena. Pravděpodobnost ani statistika pokusů se nezměnily.':'';
 $('showRare').disabled=true;status(demo?'UKÁZKA VZÁCNÉHO PRŮCHODU · vybraný úspěšný případ, nikoli výsledek losování.':'Průchod bariérou: úspěšný pravděpodobnostní pokus.');
}
function beginFusion(){
 const reaction=activeReaction();if(!reaction){mode='nuclear';status('Tato dvojice má zatím jen model přiblížení.');return;}
 slowFusionPlayback();
 const target=centers[targetIndex],ratio=p.b.A/(p.a.A+p.b.A),origin={x:target.x+(x-target.x)*ratio,y:target.y+(y-target.y)*ratio},center=project(origin.x,origin.y),targetPoint=targetScreen(target,targetIndex),incoming=tunnelContactPoint(),rad=displayRadius();
 const initial=[];for(const [id,point]of [[$('target').value,targetPoint],[$('projectile').value,incoming]])for(const atom of S.connected.atoms[id])initial.push([atom[0]+(point[0]-center[0])/rad,atom[1]-(point[1]-center[1])/rad,atom[2],atom[3]]);initial.sort((a,b)=>b[3]-a[3]);
 const neighbours=centers.map((t,i)=>({...t,id:i,A:t.A,Z:t.Z,px:(t.vx||0)*t.A*Math.sqrt(931494.10242),py:(t.vy||0)*t.A*Math.sqrt(931494.10242)})).filter(t=>t.id!==targetIndex),guided=reaction.id==='dt'&&neighbours.length&&(fusionExampleCount++%2===0),plan=guided?HiFyzikoDT.planEncounter({...origin,energy:dtLocalEnergy,sources:neighbours,cell,boost:dtBoost},fusionExampleCount%4===1?1:-1):null,focus=plan?{x:(origin.x+plan.target.x)*.5,y:(origin.y+plan.target.y)*.5}:origin,focusScreen=project(focus.x,focus.y);
 fusion={reaction,phase:'compound',time:0,screenOrigin:[focusScreen[0]/W,focusScreen[1]/H],origin,focus,plan,duration:18,initial,angle:plan?plan.angle:Math.random()*Math.PI*2,products:null,trail:[[],[]],sourceTrails:{},flightTime:0};mode='compound';$('labels').replaceChildren();lastPair='';fieldKey='';status(reaction.elastic?'Blízké setkání: jádro se trvale nesloučí.':'Přechodný útvar. Vnitřní pohyb je zpomalená ilustrace.');
}
function ppExitRadius(){return Math.max(20,(displayRadius()*visualBound('proton')+5*zoom)/Math.max(scale,1e-9));}
function compoundAtoms(){const u=Math.min(1,fusion.time/.65),blend=Math.min(1,u/.28),e=blend*blend*(3-2*blend),count=fusion.initial.length;
 if(fusion.reaction.id==='pp'){const split=Math.max(0,(u-.4)/.6),smooth=split*split*(3-2*split),reach=.65+(ppExitRadius()*scale/displayRadius()-.65)*smooth;return fusion.initial.map((atom,i)=>{const sign=i===0?-1:1,target=[sign*reach*Math.cos(fusion.angle),-sign*reach*Math.sin(fusion.angle),0];return target.map((v,k)=>atom[k]*(1-e)+v*e).concat(1);});}
 return fusion.initial.map((atom,i)=>{const a=i*2*Math.PI/count+(reduced.matches?0:u*.9),amp=reduced.matches?0:.15*Math.sin(Math.PI*u),target=[.85*Math.cos(a)+amp*Math.sin(23*u+i),.85*Math.sin(a)+amp*Math.cos(29*u+i),.1*Math.sin(19*u+i)],charge=fusion.reaction.weak&&u>.7&&i===1?0:atom[3];return [0,1,2].map(k=>atom[k]*(1-e)+target[k]*e).concat(charge);});
}
// Incoming solver: fm * sqrt(u/keV); product solver: fm/c.
// One physical playback clock, with only the unit conversion between solvers.
let playbackSpeed=.1,playbackUserOverride=false,playbackAutoSlowed=false,playbackProductsSlowed=false;
function sliderToSpeed(value){return Math.sign(value)*value*value;}
function speedToSlider(value){return Math.sign(value)*Math.sqrt(Math.abs(value));}
function setPlaybackSpeed(value){playbackSpeed=Number.isFinite(value)?Math.max(-1,Math.min(1,value)):0;if(Math.abs(playbackSpeed)<.000001)playbackSpeed=0;$('playbackSpeed').value=String(speedToSlider(playbackSpeed));const text=playbackSpeed===0?'Stojí':Math.abs(playbackSpeed).toFixed(Math.abs(playbackSpeed)<.001?6:Math.abs(playbackSpeed)<.01?4:3).replace('.', ',')+'× '+(playbackSpeed<0?'zpět':'vpřed');$('playbackSpeedValue').textContent=text;$('playbackSpeed').setAttribute('aria-valuetext',text);if(playbackSpeed<=0)stopSound();}
$('playbackSpeed').oninput=$('playbackSpeed').onchange=()=>{playbackUserOverride=true;setPlaybackSpeed(sliderToSpeed(Number($('playbackSpeed').value)));};
function slowFusionPlayback(value=.1){if(playbackUserOverride||(value===.01?playbackProductsSlowed:playbackAutoSlowed))return;if(value===.01)playbackProductsSlowed=true;else playbackAutoSlowed=true;setPlaybackSpeed(value);}
function resetManualSpeed(){playbackUserOverride=false;playbackAutoSlowed=false,playbackProductsSlowed=false;setPlaybackSpeed(1);}
function playbackRate(products=false){const rate=Math.abs(playbackSpeed)*shot.start*.25/Math.sqrt(2*M.thermalMean(100)/1.2);return rate*(products?Math.sqrt(931494.10242):1);}
// Aim for roughly seven seconds across the shorter scene dimension.
// All bodies retain one clock; only the visible playback control changes.
function automaticPlaybackTarget(){
 if(mode==='tunnel'||fusion?.phase==='compound')return .1;
 if(mode!=='flight'&&fusion?.phase!=='products')return null;
 if(!(scale>0&&W>0&&H>0&&shot?.start>0))return null;
 const products=fusion?.phase==='products';
 const bodies=products?[...fusion.products.products,...fusion.products.sources]:[{x,y,vx,vy},...centers];
 const visible=bodies.filter(b=>{const [sx,sy]=project(b.x,b.y);return sx>=0&&sx<=W&&sy>=0&&sy<=H;});
 let fastest=0;
 for(const body of visible){const velocity=products?HiFyzikoDT.velocity(body):[body.vx||0,body.vy||0];fastest=Math.max(fastest,Math.hypot(...velocity));}
 const unitRate=shot.start*.25/Math.sqrt(2*M.thermalMean(100)/1.2)*(products?Math.sqrt(931494.10242):1);
 const pixelsPerSecond=fastest*unitRate*scale/Math.max(1,collisionZoom);
 return Math.max(.000001,Math.min(1,Math.min(W,H)*.14/Math.max(pixelsPerSecond,1e-9)));
}
function updateAutomaticPlayback(dt=0,immediate=false){
 if(playbackUserOverride)return;
 const target=automaticPlaybackTarget();if(target===null)return;
 const value=immediate||target<=playbackSpeed?target:playbackSpeed+(target-playbackSpeed)*(1-Math.exp(-dt/.5));
 setPlaybackSpeed(value);
}
function showReactionEnergy(){
 const Q=fusion.reaction.Q,positive=Q>0,box=$('reactionEnergy');box.hidden=false;box.classList.toggle('noRelease',!positive);
 $('reactionEnergyTitle').textContent=positive?'Uvolněná energie':'Bez uvolnění fúzní energie';
 tex($('reactionEnergyValue'),(positive?'+':'')+(Q/1000).toFixed(3).replace('.', '{,}')+String.raw`\,\mathrm{MeV}`);
 $('reactionEnergyNote').textContent=(positive?'':'Q = 0 · ')+'Automatika přizpůsobuje rychlost částicím v záběru. Ruční nastavení má přednost.';
}
function emitProducts(){
 const sources=centers.map((t,i)=>({...t,id:i,A:t.A,Z:t.Z,px:(t.vx||0)*t.A*Math.sqrt(931494.10242),py:(t.vy||0)*t.A*Math.sqrt(931494.10242)})).filter(t=>t.id!==targetIndex);
 fusion.products=(fusion.reaction.id==='dt'?HiFyzikoDT.create:R.create)({channel:fusion.reaction,...fusion.origin,energy:dtLocalEnergy,angle:fusion.angle,sources,cell,boost:dtBoost,minimumExitRadius:fusion.reaction.id==='pp'?ppExitRadius():20});cell=fusion.products.cell;const strength=Math.max(energy+fusion.reaction.Q,energy)*16,unit=displayRadius()/Math.max(scale,1e-9);fusion.products.products.forEach(b=>{b.core=unit*visualBound(b.kind||b.id)+4*zoom/Math.max(scale,1e-9);b.surfaceStrength=strength;b.surfaceGroup='exit';});fusion.products.sources.forEach(b=>{b.core=unit*visualBound(targetKind(centers[b.id]))+4*zoom/Math.max(scale,1e-9);b.surfaceStrength=b.surfaceStrength||energy*16;});fusion.trail=fusion.products.products.map(()=>[]);fusion.phase='products';mode='products';updateAutomaticPlayback(0,true);showReactionEnergy();playFusionSound();view();fusion.timeScale=playbackRate(true);fieldKey='';$('labels').replaceChildren();lastPair='';status(fusion.reaction.id==='pp'?'Bez β⁺ přeměny: přechodný útvar se rozpadl zpět na dva protony. Energie fúze se neuvolnila.':fusion.reaction.elastic?'Pružný rozptyl: odlet vstupních částic, bez uvolnění energie fúze.':'Produkty reakce: zachování energie, náboje a hybnosti; směry jsou vybraný názorný případ.');
}
function advanceFusion(dt){
 if(fusion.phase==='compound'){fusion.time+=dt*Math.max(0,playbackSpeed)/.1;if(fusion.time>=.65)emitProducts();return;}
 if(fusion.phase!=='products')return;const outgoing=fusion.products.products;if(outgoing.every((a,i)=>outgoing.every((b,j)=>i===j||!a.Z||!b.Z||Math.hypot(a.x-b.x,a.y-b.y)>2*((a.core||0)+(b.core||0)))))outgoing.forEach(b=>{b.surfaceGroup=null;});
 // Keep the camera fixed while the particles move.
 fusion.timeScale=playbackRate(true);const clockRate=fusion.timeScale/Math.max(1,collisionZoom);
 fusion.accumulator=(fusion.accumulator||0)+dt*clockRate;for(let i=0;i<2000&&fusion.accumulator>1e-8;i++){const h=HiFyzikoDT.advance(fusion.products,fusion.accumulator);if(!h)break;fusion.accumulator-=h;}
 fusion.flightTime+=dt;fusion.playbackElapsed=(fusion.playbackElapsed||0)+dt*playbackSpeed;const productNodes=[...fusion.products.products,...fusion.products.sources].map(b=>({x:b.x,y:b.y,kind:b.kind||(typeof b.id==='string'?b.id:targetKind(centers[b.id]))}));fusion.products.products.forEach((b,i)=>{fusion.trail[i].push(tracePoint(productNodes,i));if(fusion.trail[i].length>1500)fusion.trail[i].shift();});
 if(fusion.products.collision||fusion.playbackElapsed>=fusion.duration){fusion.phase='done';mode='productsDone';status(fusion.products.collision?'Další jaderný střet: zde ukázka končí, následné reakce zatím nepočítáme.':'Pokus dokončen. Nabité produkty reagují na okolní jádra; neutrální záření se elektricky neodklání.');}
}
function productSpeedTex(body){
 const fraction=Math.min(1,Math.hypot(...HiFyzikoDT.velocity(body))),km=Math.round(fraction*299792.458).toString().replace(/\B(?=(\d{3})+(?!\d))/g,String.raw`\,`);
 return String.raw`v\approx `+(body.mass===0?String.raw`c\approx`:'')+km+String.raw`\,\mathrm{km/s}`;
}
function incomingSpeedTex(vx,vy){
 const km=Math.round(Math.hypot(vx,vy)/Math.sqrt(931494.10242)*299792.458).toString().replace(/\B(?=(\d{3})+(?!\d))/g,String.raw`\,`);
 return String.raw`v\approx `+km+String.raw`\,\mathrm{km/s}`;
}
function incomingSpeedLabel(){
 const visible=!fusion&&['flight','free','done'].includes(mode);
 if(!visible){const oldLabel=$('labels').querySelector('[data-key="incomingSpeed"]');if(oldLabel)oldLabel.hidden=true;return;}
 const point=projectilePoint(),radius=displayRadius(),outside=point[0]<15||point[0]>W-15||point[1]<75||point[1]>H-55;
 const info=label($('labels'),'incomingSpeed',incomingSpeedTex(vx,vy)+(outside?String.raw`\;\text{mimo záběr}`:''),Math.max(130,Math.min(W-130,point[0])),Math.max(90,Math.min(H-55,point[1]+radius*2.6)));
 info.hidden=false;info.title='Okamžitá rychlost vystřeleného jádra ve vztažné soustavě scény; nezávisí na rychlosti přehrávání.';
}
function fusionGraphics(){
 const items=[],radius=displayRadius();centers.forEach((fixed,i)=>{if(i===targetIndex)return;const t=fusion.products?fusion.products.sources.find(b=>b.id===i):fixed;const point=project(t.x,t.y);items.push({id:targetKind(fixed),x:point[0],y:point[1],radius,labelKey:'a'+i+'-'});nucleus(targetKind(fixed),...point,'a'+i+'-');});
 if(fusion.phase==='compound'){const point=project(fusion.origin.x,fusion.origin.y),atoms=compoundAtoms();items.push({atoms,x:point[0],y:point[1],radius,vibration:1.8});nucleus('alpha',...point,'compound-',atoms);label($('labels'),'reaction',fusion.reaction.compound,point[0],point[1]-radius*3.2);}
 else {fusion.products.products.forEach((b,i)=>{const point=project(b.x,b.y),outside=point[0]<15||point[0]>W-15||point[1]<75||point[1]>H-55;
 const kind=b.kind||b.id;if(!outside&&S.connected.atoms[kind]){items.push({id:kind,x:point[0],y:point[1],radius,labelKey:'product'+i+'-'});nucleus(kind,...point,'product'+i+'-');}
 if(!S.connected.atoms[kind]){const marker=label($('labels'),'product'+i+'-symbol',R.species[kind]?.tex||kind,point[0],point[1]);marker.style.fontSize='26px';}
 for(const el of $('labels').querySelectorAll('[data-key^="product'+i+'-"]'))el.hidden=outside;
 const energyMeV=HiFyzikoDT.kinetic(b)/1000,text=(R.species[kind]?.tex||kind)+String.raw`:\ `+(energyMeV<.1?fmt(energyMeV*1000)+String.raw`\,\mathrm{keV}`:fmt(energyMeV)+String.raw`\,\mathrm{MeV}`)+(outside?String.raw`\;\text{mimo záběr}`:'');
 const info=String.raw`\begin{gathered}`+text+String.raw`\\`+productSpeedTex(b)+String.raw`\end{gathered}`;
 const speedLabel=label($('labels'),'energy'+i,info,outside?Math.max(115,Math.min(W-115,point[0])):point[0],outside?Math.max(90,Math.min(H-60,point[1])):point[1]+radius*2.6+10);speedLabel.title='Okamžitá rychlost ve vztažné soustavě scény; nezávisí na rychlosti přehrávání. Neutrino je v modelu aproximováno jako nehmotné.';
 });}

 for(const el of $('labels').querySelectorAll('.nucleon')){const px=parseFloat(el.style.left),py=parseFloat(el.style.top);el.hidden=px<0||px>W||py<65||py>H-45;}
 return items;
}
function* optimalHeading(index){
 const target=centers[index],base=Math.atan2(target.y-y,target.x-x),speed=Math.sqrt(2*Math.max(0,energy-M.multiPotential(p,centers,x,y))/p.mu);
 const score=function*(heading){const moving=centers.map(q=>({...q})),state={x,y,core:shot.core,surfaceStrength:shot.surfaceStrength,vx:speed*Math.cos(heading),vy:speed*Math.sin(heading)};let previous=Infinity;
 for(let i=0;i<14000;i++){
  if(i%64===0)yield;
  M.mobileAdvance(p,moving,state,shot.dt,cell);const t=moving[index],rx=state.x-t.x,ry=state.y-t.y,r=Math.hypot(rx,ry);
  if(state.collision)return p.C?1e8:0;if(state.integrationLimited)return 1e9;
  if(r>previous&&i>5){if(M.nearest(moving,state.x,state.y).index!==index)return 1e8+r;const ux=state.vx-(t.vx||0),uy=state.vy-(t.vy||0),local=.5*p.mu*(ux*ux+uy*uy)+p.C/r+M.surfaceField({...state,Z:p.b.Z},{...t,Z:p.a.Z},r).U,L=p.mu*(rx*uy-ry*ux),B=L*L/(2*p.mu);
   if(!p.C)return r;
   const rmin=(p.C+Math.sqrt(p.C*p.C+4*local*B))/(2*local),P=M.penetration(p,{energy:local,B,rmin}),head=M.penetration(p,{energy:local,B:0,rmin:p.C/local});return -Math.log(Math.max(1e-300,P)/Math.max(1e-300,head))+r/Math.max(shot.start,1)*1e-4;
  }previous=r;
 }return 1e9;};
 let bestAngle=base,best=yield* score(base),step=Math.PI/24;for(let i=-12;i<=12;i++){const candidate=base+i*step,value=yield* score(candidate);if(value<best){best=value;bestAngle=candidate;}}
 for(let i=0;i<24;i++){const left=yield* score(bestAngle-step),right=yield* score(bestAngle+step);if(left<best&&left<=right){bestAngle-=step;best=left;}else if(right<best){bestAngle+=step;best=right;}step*=.5;}return {heading:bestAngle,score:best};
}
function* preparedHeading(){
 let index=M.nearest(centers,x,y).index,solution=yield* optimalHeading(index);
 if(solution.score>Math.log(10))for(const candidate of centers.map((t,i)=>({i,d:Math.hypot(t.x-x,t.y-y)})).sort((a,b)=>a.d-b.d)){
  if(candidate.i===index)continue;const alternative=yield* optimalHeading(candidate.i);
  if(alternative.score<solution.score){solution=alternative;index=candidate.i;}if(solution.score<=Math.log(10))break;
 }
 return {index,solution};
}
function advancePreparation(job,repeat){
 if(preparationJob!==job)return;
 const until=performance.now()+4;let next;
 try{do{next=job.next();}while(!next.done&&performance.now()<until);}
 catch(error){preparationJob=null;updateRareButton();status('Příprava selhala. Vrať částici a opakuj.',true);console.warn('Fusion preparation failed',error);return;}
 if(!next.done){requestAnimationFrame(()=>advancePreparation(job,repeat));return;}
 preparationJob=null;const {index,solution}=next.value;
 if(p.C&&solution.score>Math.log(10)){updateRareButton();status('Nenalezen směr ukázky. Posuň částici či změň teplotu.',true);return;}
 aimTarget=index;gunHeading=visualHeading(solution.heading);angle=0;$('angle').value=0;armGun(false);targetIndex=index;demoPending=true;updateRareButton();
 status(repeat?'Další pokus připraven. Stiskni Vystřelit.':'Ukázka připravena. Stiskni Vystřelit.');
}
$('fusionEnabled').onchange=()=>{clearEncounter();updateRareButton();};
$('showRare').onclick=()=>{
 if(preparationJob){preparationJob=null;updateRareButton();status('Příprava zrušena.');return;}
 const repeat=!!fusion||mode==='tunnel'||mode==='recoil'||playbackHasProducts;
 if(mode==='recoil')home();else if(repeat)resetAfterFusion(true);
 if((!p.C&&!activeReaction()?.noBarrier)||!hasProjectile())return;
 if(demoPending){demoPending=false;status('Běžný výstřel: výsledek určí fyzikální pravděpodobnost.');return;}
 $('interaction').value='gun';$('quantum').checked=true;armGun(true);
 if(!shot.canLaunch)return;
 const job=preparationJob=preparedHeading();updateRareButton();status('Hledám směr… Kliknutím přípravu zrušíš.');
 requestAnimationFrame(()=>advancePreparation(job,repeat));
};
for(const [id,branch] of [['ppWithoutBeta','pp'],['ppWithBeta','ppbeta']])$(id).onclick=()=>{if($(id).disabled)return;if(preparationJob&&$('reactionBranch').value===branch){$('showRare').onclick();return;}resetAfterFusion(true);$('reactionBranch').value=branch;$('fusionEnabled').checked=true;clearEncounter();$('showRare').onclick();updateRareButton();};
function unpause(){paused=false;}
function home(){playbackUserOverride=false;playbackAutoSlowed=false,playbackProductsSlowed=false;manualAnchor=null;manualDisplay=false;fitPending=true;clearEncounter();unpause();updateMode();shot=M.multiShot(p,energy,angle,Math.max(1,Math.min(5,+$('targetCount').value||3)),layoutSeed);centers=shot.centers.map(t=>({...t,kind:$('target').value,A:p.a.A,Z:p.a.Z,vx:0,vy:0}));shot.centers=centers;cell=M.makeCell([...centers,{x:shot.x,y:shot.y}],shot.start);shot.cell=cell;layoutPoints=[...centers.map(t=>({x:t.x,y:t.y})),{x:shot.x,y:shot.y}];flightAccumulator=0;targetIndex=0;aimTarget=0;tried=new Set();recoil=null;({x,y,vx,vy}=shot);vx=vy=0;gunOrigin=[x,y];gunHeading=Math.atan2(centers[0].y-y,centers[0].x-x);extent=shot.start*1.4;previewLimit=0;probability=centers.length>1?null:M.penetration(p,shot);preview=M.aimPreview(p,centers,shot);trail=[];drag=null;attempted=false;chosenOutcome=null;mode='ready';tunnelTime=0;tunnelFrom=null;tunnelTo=null;stopSound();updateRareButton();status($('interaction').value==='gun'?'Tažením zamiř a vystřel.':'Táhni částici k jádru.');if($('interaction').value==='gun')armGun(false);}
function flightLimit(){if(!W||!H)return extent;const corners=[[0,0],[W,0],[0,H],[W,H]].map(([px,py])=>Math.hypot((px-ox)/scale,(py-oy)/scale));return Math.max(extent,Math.hypot(...gunOrigin)*1.15,...corners.map(r=>r*1.15));}
function prepareSurface(){const unit=displayRadius()/Math.max(scale,1e-9);shot.core=unit*visualBound($('projectile').value)+4*zoom/Math.max(scale,1e-9);shot.surfaceStrength=energy*16;for(const t of centers){t.core=unit*visualBound(targetKind(t))+4*zoom/Math.max(scale,1e-9);t.surfaceStrength=energy*16;}shot.canLaunch=energy-M.multiPotential(p,centers,x,y)>1e-8&&!(p.b.Z&&centers.some(t=>t.Z&&Math.hypot(x-t.x,y-t.y)<=shot.core+t.core));}
function refreshPreview(){if(preparationJob){preparationJob=null;updateRareButton();status('Pohled změněn. Připrav ukázku znovu.');}prepareSurface();preview=M.aimPreview(p,centers,shot);previewJob=null;previewLimit=flightLimit();updateRareButton();}
function advancePreview(){if(!previewJob)return;if(mode!=='ready'){previewJob=null;return;}const until=performance.now()+3;do{const next=previewJob.next();preview=next.value;shot.closest=preview.closest;if(next.done){previewJob=null;if(launchPending){launchPending=false;launch();}break;}}while(performance.now()<until);}
function displayJacobian(){
 const epsilon=Math.max(.001,shot.start*1e-5),at=(dx,dy)=>{const q=project(x+dx,y+dy),items=schematicItems([{id:$('projectile').value,x:q[0],y:q[1],radius:displayRadius()},...centers.map(t=>({id:targetKind(t),x:project(t.x,t.y)[0],y:project(t.x,t.y)[1],radius:displayRadius()}))]);return [items[0].x,items[0].y];},origin=at(0,0),a=at(epsilon,0),b=at(0,epsilon);return [(a[0]-origin[0])/epsilon,(b[0]-origin[0])/epsilon,(a[1]-origin[1])/epsilon,(b[1]-origin[1])/epsilon];
}
function physicalHeading(heading){const [a,b,c,d]=displayJacobian(),det=a*d-b*c;if(Math.abs(det)<1e-12)return heading;const ux=Math.cos(heading),uy=Math.sin(heading);return Math.atan2((a*uy-c*ux)/det,(d*ux-b*uy)/det);}
function visualHeading(heading){const [a,b,c,d]=displayJacobian(),ux=Math.cos(heading),uy=Math.sin(heading);return Math.atan2(c*ux+d*uy,a*ux+b*uy);}
function armGun(capture=true){materializeManual();if(!hasProjectile()){clearEncounter();mode='ready';shot.canLaunch=false;preview=[];vx=vy=0;updateMode();updateRareButton();status('Ve scéně chybí projektil zvolené reakce.',true);return;}if($('projectile').value!==preferredProjectile()){const index=centers.findIndex(t=>targetKind(t)===preferredProjectile());if(index>=0){selectNucleus(index);capture=true;}}syncActivePair();clearEncounter();unpause();stopSound();updateMode();if(capture){gunOrigin=[x,y];}x=gunOrigin[0];y=gunOrigin[1];vx=vy=0;drag=null;recoil=null;mode='ready';tunnelFrom=tunnelTo=null;tunnelTime=0;trail=[];tried=new Set();if(cell&&[...centers,{x,y}].some(t=>Math.abs(t.x-cell.x)>cell.rx||Math.abs(t.y-cell.y)>cell.ry))cell=M.makeCell([...centers,{x,y}],shot.start);const span=Math.max(shot.start,2*M.nearest(centers,x,y).distance);shot.start=span;shot.dt=.0015*span/Math.max(.1,Math.sqrt(2*energy/p.mu));const potential=M.multiPotential(p,centers,x,y),kinetic=Math.max(0,energy-potential),speed=Math.sqrt(2*kinetic/p.mu),heading=physicalHeading(gunHeading-angle);shot={...shot,x,y,vx:speed*Math.cos(heading),vy:speed*Math.sin(heading),angle,aimTarget,energy,referenceMu:p.mu,projectileKind:$('projectile').value,canLaunch:kinetic>1e-8,centers};shot.L=p.mu*(shot.x*shot.vy-shot.y*shot.vx);shot.B=shot.L**2/(2*p.mu);shot.rmin=(p.C+Math.sqrt(p.C**2+4*energy*shot.B))/(2*energy);probability=centers.length===1?M.penetration(p,shot):null;syncView();if(shot.canLaunch)refreshPreview();else{preview=[[x,y]];shot.closest=M.nearest(centers,x,y).distance;}status(shot.canLaunch?'Zamiř a vystřel.':'Před výstřelem částici oddal nebo přibliž pohled.',!shot.canLaunch);updateRareButton();}

function syncChoices(){document.querySelectorAll('[name="interactionChoice"]').forEach(input=>input.checked=input.value===$('interaction').value);document.querySelectorAll('[name="countChoice"]').forEach(input=>input.checked=input.value===$('targetCount').value);}
for(const input of document.querySelectorAll('[name="interactionChoice"]'))input.addEventListener('change',()=>{if(input.checked){$('interaction').value=input.value;$('interaction').onchange();}});
for(const input of document.querySelectorAll('[name="countChoice"]'))input.addEventListener('change',()=>{if(input.checked){$('targetCount').value=input.value;$('targetCount').onchange();}});
function updateMode(){syncChoices();const gun=$('interaction').value==='gun';document.querySelector('.sceneTitle h2').textContent=gun?'Zamiř. Vystřel. Sleduj odklon.':'Přibliž jádra proti odpudivé síle';document.querySelector('.sceneTitle p').textContent=gun?'Střelba: měkké odpuzování povrchů. Náhled končí za prvním vychýlením. Mimo jádra: míření.':'Uchop libovolné jádro a ovládej je. Ostatní stojí. Shift + tažení mění jen rozmístění.';$('launch').hidden=false;$('angle').closest('label').hidden=!gun;}
function clearStats(){attempts=passes=classical=0;batchNote='';}
function pair(){configureBranches();p=M.pair($('target').value,$('projectile').value);clearStats();home();}
function reset(){layoutSeed=(Math.random()*4294967296)>>>0;$('targetCount').value='3';$('pairPreset').value='triton|deuteron';$('target').value='triton';$('projectile').value='deuteron';$('temperature').value=100;$('lineStyle').value='source';$('angle').value=0;$('interaction').value='drag';zoom=1;panX=panY=0;$('quantum').checked=$('field').checked=$('arrows').checked=true;temperature=100;energy=1.5*M.kB*temperature;angle=0;pair();}
function updateEnergy(){manualAnchor=null;
 temperature=+$('temperature').value;energy=M.thermalMean(temperature);clearStats();clearEncounter();unpause();stopSound();
 if(mode==='nuclear'){shot.energy=energy;return;}
 const held=drag;vx=vy=0;trail=[];tried=new Set();tunnelFrom=tunnelTo=null;tunnelTime=0;recoil=null;
 if($('interaction').value==='gun')armGun(true);
 else {mode=held?'drag':'ready';shot={...shot,energy,B:0,rmin:Math.max(p.R,M.turning(p,energy)),closest:Math.max(p.R,M.turning(p,energy))};probability=centers.length===1?M.penetration(p,shot):null;}
 // Changing the selected energy is an interaction adjustment, not a new shot/layout.
 if(p.C&&M.multiPotential(p,centers,x,y)>energy){
  const points=[[x,y]],goal=energy*.995;let q={x,y};
  for(let i=0;i<3000&&M.multiPotential(p,centers,q.x,q.y)>goal;i++){
   const f=M.multiForce(p,centers,q.x,q.y),n=Math.hypot(...f);if(n<1e-15)break;
   let step=Math.max(p.R*.01,M.nearest(centers,q.x,q.y).distance*.06),next;
   for(let j=0;j<30;j++){next={x:q.x+f[0]/n*step,y:q.y+f[1]/n*step};if(M.multiPotential(p,centers,next.x,next.y)<M.multiPotential(p,centers,q.x,q.y))break;step*=.5;}
   if(M.multiPotential(p,centers,next.x,next.y)<=goal){let lo=0,hi=1;for(let j=0;j<35;j++){const mid=(lo+hi)/2;if(M.multiPotential(p,centers,q.x+(next.x-q.x)*mid,q.y+(next.y-q.y)*mid)>goal)lo=mid;else hi=mid;}next={x:q.x+(next.x-q.x)*hi,y:q.y+(next.y-q.y)*hi};}
   q=next;points.push([q.x,q.y]);
  }
  recoil={points,time:0};mode='recoil';status('Nižší energie: jádro ustupuje.');
 }else status('Teplota změněna; mění se mez přiblížení.');
 fieldKey='';updateRareButton();
}
$('temperature').oninput=updateEnergy;
document.querySelector('.settingsPanel').addEventListener('pointerdown',event=>{if(event.target.closest('#angle,[name="countChoice"],#fusionEnabled'))resetAfterFusion(true);},true);
document.querySelector('.controlRail').addEventListener('pointerdown',event=>{if(event.target.closest('button,input,select')&&!event.target.closest('#sound'))resetAfterFusion(true);},true);
$('pairPreset').onchange=()=>{const [target,projectile]=$('pairPreset').value.split('|');$('target').value=target;$('projectile').value=projectile;pair();};
function snapAngle(degrees){return Math.round((((degrees+180)%360+360)%360-180)*1000)/1000;}
$('angle').oninput=()=>{angle=snapAngle(+$('angle').value)*Math.PI/180;$('angle').value=angle*180/Math.PI;clearStats();armGun(false);};
$('target').onchange=$('projectile').onchange=$('targetCount').onchange=pair;$('home').onclick=()=>{batchNote='';home();};$('interaction').onchange=()=>{resetAfterFusion(true);if($('interaction').value==='gun'){if($('projectile').value!==preferredProjectile()){const index=centers.findIndex(t=>targetKind(t)===preferredProjectile());if(index>=0)selectNucleus(index);}armGun(true);}else{resetManualSpeed();release();clearEncounter();vx=vy=0;centers.forEach(t=>{t.vx=t.vy=0;});mode='ready';updateMode();}};
$('quantum').onchange=()=>{clearStats();if($('interaction').value==='gun')armGun(mode!=='ready');else home();};
function launch(outcome=null){
 if(preparationJob){status('Hledám směr… Vyčkej nebo přípravu zruš.');return;}
 if(!hasProjectile()){status('Vyber dvojici s dostupným projektilem.',true);return;}
 if(($('projectile').value!==preferredProjectile()&&centers.some(t=>targetKind(t)===preferredProjectile()))||mode!=='ready')armGun(true);
 if(!shot.canLaunch){status('Před výstřelem částici oddal nebo přibliž pohled.',true);updateRareButton();return;}if(previewJob){launchPending=true;status('Dokončuji předpověď dráhy; výstřel je připraven.');return;}
 lastShotSetup={x:shot.x,y:shot.y,kind:$('projectile').value,heading:gunHeading,angle,centers:centers.map(t=>({...t})),cell:{...cell},shot:{...shot,centers:undefined}};unlockSound();unpause();demoActive=demoPending;demoPending=false;chosenOutcome=outcome;({x,y,vx,vy}=shot);flightAccumulator=0;trail=[];tried=new Set();mode='flight';beginRecording();status(demoActive?(activeReaction()?.noBarrier?'PŘIPRAVENÁ SRÁŽKA · neutron nemá Coulombovu bariéru.':'UKÁZKA VZÁCNÉHO STŘETU · přiblížení, tunelování a zvolená reakce.'):'Běžný výstřel: částice sleduje vypočtenou dráhu.');
}
$('launch').onclick=()=>{batchNote='';launch();};
function syncView(){const rect=c.getBoundingClientRect();W=c.clientWidth||rect.width;H=c.clientHeight||rect.height;view();}
function baseView(){const points=layoutPoints.length?layoutPoints:[...centers,{x:shot.start,y:0}],minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y)),padding=Math.max(35,Math.min(W,H)*.22),width=Math.max(1,W-padding*2),height=Math.max(1,H-110-padding*2),base=Math.min(width/Math.max(shot.start*.5,maxX-minX),height/Math.max(shot.start*.55,maxY-minY));scale=Math.max(.00001,base)*zoom;ox=W/2-(minX+maxX)/2*scale+panX*W;oy=65+padding+height/2-(minY+maxY)/2*scale+panY*H;}
function fitAllParticles(){
 const rect=c.getBoundingClientRect();W=c.clientWidth||rect.width;H=c.clientHeight||rect.height;if(W<1||H<120)return;
 zoom=1;panX=panY=0;view();
 const bounds=()=>{const items=currentGlyphs(),edges=items.map(t=>{const radius=t.radius*visualBound(t.id)+10;return {left:t.x-radius,right:t.x+radius,top:t.y-radius,bottom:t.y+radius};});return {left:Math.min(...edges.map(e=>e.left)),right:Math.max(...edges.map(e=>e.right)),top:Math.min(...edges.map(e=>e.top)),bottom:Math.max(...edges.map(e=>e.bottom))};};
 const left=20,right=W-20,top=76,bottom=H-55;
 for(let i=0;i<3;i++){let b=bounds();zoom*=Math.min(1,(right-left)/Math.max(1,b.right-b.left),(bottom-top)/Math.max(1,b.bottom-b.top))*.98;view();b=bounds();panX+=((left+right-b.left-b.right)/2)/W;panY+=((top+bottom-b.top-b.bottom)/2)/H;view();}
 fitPending=false;fieldKey='';
}
function fusionWarp(){if(!fusion)return 1;if(fusion.phase!=='compound')return 0;const u=Math.min(1,fusion.time/.65);return 1-u*u*(3-2*u);}
function view(){baseView();collisionZoom=1;collisionFocus=null;if($('cameraScale'))$('cameraScale').hidden=true;}
c.closest('.scene').addEventListener('wheel',e=>{e.preventDefault();syncView();if(!W||!H)return;const [px,py]=canvasPoint(e),[wx,wy]=unproject(px,py),delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?H:1);zoom=Math.max(.08,Math.min(40,zoom*Math.exp(-delta*.0015)));view();const anchor=project(wx,wy);panX+=(px-anchor[0])/W;panY+=(py-anchor[1])/H;view();if(drag&&lastPointer){const q=position(lastPointer);drag=[q[0]-grabOffset[0],q[1]-grabOffset[1]];}fieldKey='';if($('interaction').value==='gun'&&mode==='ready'&&!fusion&&playbackCursor===null)refreshPreview();},{passive:false});
function canvasPoint(e){const r=c.getBoundingClientRect();return [(e.clientX-r.left)*(c.clientWidth||r.width)/r.width,(e.clientY-r.top)*(c.clientHeight||r.height)/r.height];}
function position(e){syncView();return unproject(...canvasPoint(e));}
function aimAtPointer(e){syncView();const [px,py]=canvasPoint(e),origin=[currentGlyphs()[0].x,currentGlyphs()[0].y],dx=px-origin[0],dy=py-origin[1];if(Math.hypot(dx,dy)<16)return;const heading=Math.atan2(dy,dx);angle=snapAngle((gunHeading-heading)*180/Math.PI)*Math.PI/180;$('angle').value=angle*180/Math.PI;clearStats();armGun(false);}
function visualBound(id){if(!S.connected.atoms[id])return .35;const bound=Math.max(...S.connected.atoms[id].map(a=>Math.hypot(...a.slice(0,3))+1.16));return 13.76*bound/Math.sqrt(13.76**2-bound**2);}
function baseRadius(){return Math.min(W,H)*.028*zoom;}
function contactRadius(){return (displayRadius()*(visualBound($('target').value)+visualBound($('projectile').value))*1.08+8*zoom)/Math.max(scale,.00001);}
function displayRadius(){return baseRadius();}
function glyphClearance(a,b){return (displayRadius()*(visualBound(a)+visualBound(b))+8*zoom)/Math.max(scale,1e-9);}
let manualDisplay=false,manualAnchor=null;
function manualDisplayPosition(){
 // A local, smooth magnification of small separations. Physical coordinates,
 // energy and the barrier marker are never changed by this drawing transform.
 let point={x,y};if(!manualDisplay||fusion||!centers.length)return point;
 const near=M.nearest(centers,x,y).target,dx=x-near.x,dy=y-near.y,r=Math.hypot(dx,dy),gap=glyphClearance($('projectile').value,targetKind(near));
 if(r<2*gap){const shown=gap+r*r/(4*gap);point={x:near.x+(r?dx/r:1)*shown,y:near.y+(r?dy/r:0)*shown};}
 // Other fixed targets may be close after a user rearranges them.
 for(let pass=0;pass<16;pass++){let moved=false;for(const t of centers){const dx=point.x-t.x,dy=point.y-t.y,d=Math.hypot(dx,dy),limit=glyphClearance($('projectile').value,targetKind(t));if(d<limit){point={x:t.x+(d?dx/d:1)*limit,y:t.y+(d?dy/d:0)*limit};moved=true;}}if(!moved)break;}
 return point;
}
function materializeManual(){if(!manualDisplay)return;const point=manualDisplayPosition();x=point.x;y=point.y;gunOrigin=[x,y];manualDisplay=false;}
function manualApproach(dt){manualDisplay=true;if(!manualAnchor)manualAnchor={x,y};return M.manualResistancePoint(p,centers,manualAnchor,drag,energy);}
// Nuclear glyphs are enlarged; positions and paths share one affine projection.
function project(wx,wy){return [ox+wx*scale,oy+wy*scale];}
function unproject(X,Y){return [(X-ox)/scale,(Y-oy)/scale];}

function targetKind(t){return t.kind||$('target').value;}
function syncActivePair(index=M.nearest(centers,x,y).index){
 targetIndex=index;const kind=targetKind(centers[index]);$('target').value=kind;p=M.pair(kind,$('projectile').value);
}
function pickNucleus(q){
 const displayed=currentGlyphs(),point=project(...q),choices=[{index:-1,x,y,kind:$('projectile').value},...centers.map((t,index)=>({...t,index,kind:targetKind(t)}))];
 return choices.map(t=>({...t,distance:Math.hypot(...[displayed[t.index+1].x,displayed[t.index+1].y].map((v,i)=>v-point[i]))})).filter(t=>t.distance<displayRadius()*visualBound(t.kind)+10).sort((a,b)=>a.distance-b.distance)[0];
}
function selectNucleus(index){manualAnchor=null;if(index>=0)materializeManual();
 clearEncounter();stopSound();recoil=null;trail=[];preview=[];tunnelFrom=tunnelTo=null;tried=new Set();vx=vy=0;
 if(index>=0){const selected=centers[index],kind=targetKind(selected),previous={x,y,kind:$('projectile').value,...M.nuclei[$('projectile').value],vx:0,vy:0};x=selected.x;y=selected.y;centers[index]=previous;$('projectile').value=kind;}
 centers.forEach(t=>{t.vx=t.vy=0;});syncActivePair();gunOrigin=[x,y];aimTarget=targetIndex;gunHeading=Math.atan2(centers[targetIndex].y-y,centers[targetIndex].x-x);angle=0;$('angle').value=0;
 shot={...shot,x,y,centers,energy};mode='ready';$('labels').replaceChildren();lastPair='';fieldKey='';flightAccumulator=0;clearStats();updateMode();updateRareButton();
}
function hitParticle(q){const pointer=project(...q),center=projectilePoint();return Math.hypot(pointer[0]-center[0],pointer[1]-center[1])<=displayRadius()*visualBound($('projectile').value)+8;}
function resetAfterFusion(force=false){
 if((!fusion&&!playbackHasProducts&&!(force&&mode==='tunnel'))||(!force&&fusion?.phase!=='done')||!lastShotSetup)return false;
 const saved=lastShotSetup;clearEncounter();resetManualSpeed();centers=saved.centers.map(t=>({...t,vx:0,vy:0}));x=saved.x;y=saved.y;vx=vy=0;$('projectile').value=saved.kind;cell={...saved.cell};shot={...saved.shot,centers};gunOrigin=[x,y];gunHeading=saved.heading??gunHeading;angle=saved.angle??0;$('angle').value=angle*180/Math.PI;
 trail=[];preview=[];drag=null;layoutDrag=null;recoil=null;activePointer=null;lastPointer=null;panning=aiming=false;aimAnchor=null;releaseBounds=null;tunnelFrom=tunnelTo=null;tunnelTime=0;flightAccumulator=0;mode='ready';syncActivePair();unpause();stopSound();fieldKey='';updateMode();
 if($('interaction').value==='gun')armGun(true);else updateRareButton();status('Jádra obnovena. Připrav další pokus.');return true;
}
c.onpointerdown=e=>{if(resetAfterFusion(true)){$('interaction').value='drag';updateMode();e.preventDefault();return;}if(mode==='recoil'||fusion)return;if(![0,1,2].includes(e.button)||e.isPrimary===false)return;if(activePointer!==null)release();unlockSound();const q=position(e);gripMoved=false;activePointer=e.pointerId;lastPointer={clientX:e.clientX,clientY:e.clientY};aimAnchor={clientX:e.clientX,clientY:e.clientY,angle,panX,panY};
if(e.shiftKey&&e.button===0){
 const picked=pickNucleus(q);
 if(picked){resetManualSpeed();materializeManual();$('interaction').value='drag';updateMode();layoutDrag=picked.index;grabOffset=[q[0]-picked.x,q[1]-picked.y];drag=null;vx=vy=0;mode='ready';centers.forEach(t=>{t.vx=t.vy=0;});clearEncounter();}else panning=true;
}
else if(e.button!==0){panning=true;}
else if(pickNucleus(q)){resetManualSpeed();$('interaction').value='drag';selectNucleus(pickNucleus(q).index);updateMode();releaseBounds=null;grabOffset=[q[0]-x,q[1]-y];manualAnchor={x,y};drag=[x,y];mode='drag';unpause();}
else if($('interaction').value==='gun'){if(mode!=='ready')armGun(true);aiming=true;aimAtPointer(e);}
else panning=true;
e.preventDefault();c.focus({preventScroll:true});c.setPointerCapture(e.pointerId);};
c.onpointermove=e=>{if(activePointer===null||(e.pointerId!==undefined&&e.pointerId!==activePointer))return;lastPointer={clientX:e.clientX,clientY:e.clientY};
if(layoutDrag!==null){
 const q=position(e),next={x:q[0]-grabOffset[0],y:q[1]-grabOffset[1]},id=layoutDrag<0?$('projectile').value:targetKind(centers[layoutDrag]),others=centers.filter((_,i)=>i!==layoutDrag).map(t=>({...t,id:targetKind(t)}));if(layoutDrag>=0)others.push({x,y,id:$('projectile').value});
 const body=layoutDrag<0?{x,y}:centers[layoutDrag],safe=M.limitSeparation(others,body,next,t=>glyphClearance(id,t.id));
 if(layoutDrag<0){x=safe.x;y=safe.y;gunOrigin=[x,y];}else Object.assign(centers[layoutDrag],safe);fieldKey='';preview=[];
}
else if(panning){syncView();const at=canvasPoint(e),start=canvasPoint(aimAnchor);panX=aimAnchor.panX+(at[0]-start[0])/W;panY=aimAnchor.panY+(at[1]-start[1])/H;view();fieldKey='';}
else if(aiming){aimAtPointer(e);}
else if(drag){if(Math.hypot(e.clientX-aimAnchor.clientX,e.clientY-aimAnchor.clientY)>3)gripMoved=true;const q=position(e);drag=[q[0]-grabOffset[0],q[1]-grabOffset[1]];}};
function release(e){manualAnchor=null;if(e&&e.pointerId!==undefined&&activePointer!==null&&e.pointerId!==activePointer)return;if(layoutDrag!==null){layoutDrag=null;cell=M.makeCell([...centers,{x,y}],shot.start);shot.cell=cell;gunOrigin=[x,y];if($('interaction').value==='gun')armGun(true);else{mode='ready';status('Rozmístění upraveno. Okolní jádra stojí.');}fieldKey='';}
 const held=drag!==null;activePointer=null;lastPointer=null;panning=false;aiming=false;aimAnchor=null;stopHum();if(!held)return;drag=null;vx=vy=0;recoil=null;if($('interaction').value==='gun'){armGun(true);return;}if(!gripMoved){mode='ready';gunOrigin=[x,y];status('Jádro vybráno. Táhni nebo zapni dělo.');return;}syncView();const margin=Math.min(W*.25,H*.2,Math.max(28,displayRadius()*visualBound($('projectile').value)+12));releaseBounds={left:(margin-ox)/scale,right:(W-margin-ox)/scale,top:(65+margin-oy)/scale,bottom:(H-45-margin-oy)/scale};mode='free';status('Částici nyní odpuzuje pole.');}
c.onpointerup=release;c.onpointercancel=release;c.onlostpointercapture=e=>{if(activePointer!==null&&(!c.hasPointerCapture||!c.hasPointerCapture(activePointer)))release(e);};
window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',()=>release());
c.addEventListener('contextmenu',e=>e.preventDefault());
c.onkeydown=e=>{if(e.key.startsWith('Arrow')&&resetAfterFusion(true)){e.preventDefault();return;}if(mode==='recoil')return;if(!e.key.startsWith('Arrow'))return;unlockSound();e.preventDefault();if($('interaction').value==='gun'){angle=snapAngle(angle*180/Math.PI+(e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:1)*(e.shiftKey?.001:.01))*Math.PI/180;$('angle').value=angle*180/Math.PI;clearStats();armGun(false);}else{resetManualSpeed();const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];manualAnchor={x,y};drag=[x+extent*.04*d[0],y+extent*.04*d[1]];mode='drag';}};c.onkeyup=release;
function step(dt){
 if(!['flight','free'].includes(mode))return;
 const before=centers.map(t=>(x-t.x)*(vx-(t.vx||0))+(y-t.y)*(vy-(t.vy||0))),state={x,y,vx,vy,core:shot.core,surfaceStrength:shot.surfaceStrength};
 if(mode==='flight')M.mobileAdvance(p,centers,state,dt,cell);else M.multiAdvance(p,centers,state,dt);
 ({x,y,vx,vy}=state);if(state.integrationLimited){mode='done';status('Výpočet zastaven při příliš těsném přiblížení. Částici můžeš znovu uchopit.',true);return;}if(state.collision&&activeReaction()?.noBarrier&&$('fusionEnabled').checked){const hitIndex=state.collision.includes(0)?state.collision.find(i=>i!==0)-1:-1;if(hitIndex>=0){syncActivePair(hitIndex);const t=centers[hitIndex],rvx=vx-(t.vx||0),rvy=vy-(t.vy||0);dtLocalEnergy=.5*p.mu*(rvx*rvx+rvy*rvy);dtBoost=[(p.b.A*vx+p.a.A*(t.vx||0))/(p.a.A+p.b.A)/Math.sqrt(931494.10242),(p.b.A*vy+p.a.A*(t.vy||0))/(p.a.A+p.b.A)/Math.sqrt(931494.10242)];beginFusion();return;}}if(state.collision){mode='nuclear';status('Dosažena jaderná oblast; další jaderný střet zde nepočítáme.');return;}
 if(mode==='free'&&releaseBounds){const b=releaseBounds,screen=projectilePoint(),left=ox+b.left*scale,right=ox+b.right*scale,top=oy+b.top*scale,bottom=oy+b.bottom*scale;if(screen[0]<left||screen[0]>right||screen[1]<top||screen[1]>bottom){[x,y]=unproject(Math.max(left,Math.min(right,screen[0])),Math.max(top,Math.min(bottom,screen[1])));vx=vy=0;mode='ready';status('Okraj scény. Uchop částici znovu.',true);return;}}
 const near=M.nearest(centers,x,y);syncActivePair(near.index);
 if(near.distance<=p.R){const demonstration=demoActive;clearEncounter();if(!demonstration){attempts++;classical++;}mode='nuclear';vx=vy=0;status('Dosažena jaderná oblast. Výsledek reakce zatím nepočítáme.');return;}
 if(mode==='flight'){const t=near.target,rvx=vx-(t.vx||0),rvy=vy-(t.vy||0),radial=(x-t.x)*rvx+(y-t.y)*rvy;if(!tried.has(near.index)&&before[near.index]<0&&radial>=0&&(near.distance<shot.start*.7||demoActive)){tried.add(near.index);if(!demoActive)attempts++;
 const localEnergy=Math.max(.001,.5*p.mu*(rvx*rvx+rvy*rvy)+p.C/near.distance+M.surfaceField({...shot,Z:p.b.Z},{...t,Z:p.a.Z},near.distance).U),L=p.mu*((x-t.x)*rvy-(y-t.y)*rvx),B=L*L/(2*p.mu),rmin=(p.C+Math.sqrt(p.C*p.C+4*localEnergy*B))/(2*localEnergy);probability=M.penetration(p,{energy:localEnergy,B,rmin});
 // Eligibility is a presentation rule, not a new physical tunnelling threshold.
 // Never force a long sideways jump: prefer a near-head-on, genuinely accessible encounter.
 const headOnProbability=M.penetration(p,{energy:localEnergy,B:0,rmin:p.C/localEnergy}),credible=probability>0&&probability>=.1*headOnProbability;
 const success=p.C>0&&$('quantum').checked&&(demoActive?credible:Math.random()<probability);
 const encounter={index:near.index,probability,from:[x,y],to:[t.x+(x-t.x)*p.R/near.distance,t.y+(y-t.y)*p.R/near.distance]};
 if(success){if(!demoActive)passes++;else aimTarget=near.index;rareEncounter=null;startTunnel(encounter,demoActive);}else{
 rareEncounter=$('quantum').checked&&p.C>0&&probability>0?encounter:null;updateRareButton();
 status(demoActive?'Toto přiblížení je příliš tečné pro připravenou ukázku. Dráha pokračuje bez vynuceného tunelu.':!$('quantum').checked?'Tunelování je vypnuté: klasický odraz.':probability<1e-6?'Průchod je při této energii a geometrii mimořádně vzácný. Částice se odráží.':'Průchod tentokrát nenastal. Částice se odklání.');
 }
 }}
 if(mode==='flight'&&demoActive&&Math.hypot(x-gunOrigin[0],y-gunOrigin[1])>shot.start*6){mode='done';vx=vy=0;status('Ukázka nenašla vhodné přiblížení. Připrav ji znovu; vzdálený tunel se nevynucuje.',true);}
 if(mode==='flight'&&Math.hypot(x-gunOrigin[0],y-gunOrigin[1])>shot.start*6){mode='done';status('Ukázka zastavena u hranice scény. Jádra můžeš znovu rozmístit nebo vystřelit.',true);}

}

// Audio starts only after the user interacts; no audio files or network requests.
let audio=null,soundEnabled=true,sounding=[],hum=[];
function unlockSound(){if(!soundEnabled)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audio)audio=new Audio();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch(_){}}
function stopSound(){stopHum();if(!audio)return;for(const item of sounding){try{item.gain.gain.cancelScheduledValues(audio.currentTime);item.gain.gain.setTargetAtTime(0,audio.currentTime,.025);item.osc.stop(audio.currentTime+.12);}catch(_){}}sounding=[];}
function stopHum(){if(!audio)return;for(const h of hum){try{h.gain.gain.cancelScheduledValues(audio.currentTime);h.gain.gain.setTargetAtTime(0,audio.currentTime,.035);h.osc.stop(audio.currentTime+.18);}catch(_){}}hum=[];}
function updateHum(){if(!soundEnabled||!audio||audio.state!=='running'||!p.C||paused)return;const level=Math.min(1,Math.max(M.multiPotential(p,centers,x,y)/energy,contactRadius()/Math.max(.001,M.nearest(centers,x,y).distance)));if(!hum.length){for(const offset of [0,2.5]){const osc=audio.createOscillator(),gain=audio.createGain();gain.gain.setValueAtTime(0,audio.currentTime);osc.type='sine';osc.connect(gain);gain.connect(audio.destination);osc.start();osc.onended=()=>{osc.disconnect();gain.disconnect();};hum.push({osc,gain,offset});}}for(const h of hum){h.osc.frequency.setTargetAtTime(52+38*level+h.offset,audio.currentTime,.09);h.gain.gain.setTargetAtTime(.025*level**2,audio.currentTime,.09);}}
function playTunnelSound(){
 if(!soundEnabled||!audio||audio.state!=='running')return;stopSound();const t=audio.currentTime;
 const master=audio.createGain(),compressor=audio.createDynamicsCompressor(),delay=audio.createDelay(.5),feedback=audio.createGain(),wet=audio.createGain(),tone=audio.createBiquadFilter();
 master.gain.value=.65;compressor.threshold.value=-19;compressor.knee.value=18;compressor.ratio.value=4;compressor.attack.value=.006;compressor.release.value=.16;
 delay.delayTime.value=.105;feedback.gain.value=.24;wet.gain.value=.2;tone.type='lowpass';tone.frequency.value=2200;
 master.connect(compressor);master.connect(delay);delay.connect(tone);tone.connect(feedback);feedback.connect(delay);tone.connect(wet);wet.connect(compressor);compressor.connect(audio.destination);
 const shared=[master,compressor,delay,feedback,wet,tone];let active=0;
 const register=(osc,gain,nodes,begin,end)=>{active++;osc.start(t+begin);osc.stop(t+end);const item={osc,gain};sounding.push(item);osc.onended=()=>{osc.disconnect();gain.disconnect();for(const node of nodes)node.disconnect();sounding=sounding.filter(q=>q!==item);if(--active===0)shared.forEach(node=>node.disconnect());};};
 const voice=(type,f0,f1,begin,duration,volume,pan=0)=>{const osc=audio.createOscillator(),gain=audio.createGain(),panner=audio.createStereoPanner();osc.type=type;osc.frequency.setValueAtTime(f0,t+begin);osc.frequency.exponentialRampToValueAtTime(f1,t+begin+duration);gain.gain.setValueAtTime(0,t+begin);gain.gain.linearRampToValueAtTime(volume,t+begin+Math.min(.035,duration*.2));gain.gain.exponentialRampToValueAtTime(.0001,t+begin+duration);panner.pan.setValueAtTime(pan,t+begin);panner.pan.linearRampToValueAtTime(-pan,t+begin+duration);osc.connect(gain);gain.connect(panner);panner.connect(master);register(osc,gain,[panner],begin,begin+duration+.1);};
 voice('sine',46,82,0,.58,.12);
 for(let i=0;i<5;i++)voice('sine',210+i*34,520+i*47,.035+i*.115,.105,.043,i%2?.65:-.65);
 voice('sine',112,36,.64,.65,.19);voice('triangle',680,165,.66,.38,.028);
 const noise=audio.createBufferSource(),buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*1.45),audio.sampleRate),data=buffer.getChannelData(0);let seed=9137;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}noise.buffer=buffer;
 const filter=audio.createBiquadFilter(),gain=audio.createGain();filter.type='bandpass';filter.Q.value=.7;filter.frequency.setValueAtTime(450,t);filter.frequency.exponentialRampToValueAtTime(2400,t+.58);filter.frequency.exponentialRampToValueAtTime(650,t+1.15);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.016,t+.15);gain.gain.linearRampToValueAtTime(.05,t+.58);gain.gain.linearRampToValueAtTime(.018,t+.63);gain.gain.linearRampToValueAtTime(.085,t+.67);gain.gain.exponentialRampToValueAtTime(.0001,t+1.35);noise.connect(filter);filter.connect(gain);gain.connect(master);register(noise,gain,[filter],0,1.5);
}
function playFusionSound(){if(!soundEnabled||!audio||audio.state!=='running')return;const t=audio.currentTime;for(const [frequency,volume]of [[94,.1],[188,.025]]){const osc=audio.createOscillator(),gain=audio.createGain();osc.frequency.setValueAtTime(frequency,t);osc.frequency.exponentialRampToValueAtTime(frequency*.4,t+.36);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+.4);osc.connect(gain);gain.connect(audio.destination);const item={osc,gain};sounding.push(item);osc.start(t);osc.stop(t+.45);osc.onended=()=>{osc.disconnect();gain.disconnect();sounding=sounding.filter(q=>q!==item);};}}
$('sound').onclick=()=>{soundEnabled=!soundEnabled;$('sound').textContent=soundEnabled?'Zvuk zapnutý':'Zvuk vypnutý';$('sound').setAttribute('aria-pressed',String(soundEnabled));if(soundEnabled)unlockSound();else stopSound();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSound();});window.addEventListener('pagehide',stopSound);
const tunnelDuration=.9;
function tunnelApproachLength(){return tunnelGraph?.approachDuration??tunnelDuration*.2;}
function tunnelBlend(){
 const t=Math.max(0,Math.min(1,(tunnelTime-tunnelApproachLength())/(tunnelDuration*.8))),smooth=t*t*(3-2*t),hopEnd=.64,snapEnd=.73,phase=Math.min(1,t/hopEnd)*5,cycle=phase-Math.floor(phase);
 let travel=smooth;
 if(!reduced.matches){if(t<hopEnd){const v=cycle<.5?cycle*2:(1-cycle)*2,e=v*v*(3-2*v);travel=.17*e-.025*Math.sin(Math.PI*cycle);}else{const q=Math.min(1,(t-hopEnd)/(snapEnd-hopEnd));travel=q*q*(3-2*q);}}
 const glitch=!reduced.matches&&t<hopEnd&&(cycle>.32&&cycle<.64),breakup=reduced.matches?0:Math.sin(Math.PI*t),shimmer=glitch?.52:1;
 return {t,smooth,travel,shimmer,breakup,glitch};
}
function targetScreen(t,i){return tunnelGlyphs&&['tunnel','nuclear','compound'].includes(mode)?project(...tunnelGlyphs[i+1]):project(t.x,t.y);}
function tunnelContactPoint(){const target=centers[targetIndex],center=targetScreen(target,targetIndex),start=project(...(tunnelDisplayFrom||tunnelFrom||[x,y])),dx=start[0]-center[0],dy=start[1]-center[1],n=Math.max(.001,Math.hypot(dx,dy)),offset=displayRadius()*(visualBound($('target').value)+visualBound($('projectile').value))*.42;return [center[0]+dx/n*offset,center[1]+dy/n*offset];}
function projectilePoint(){if(mode==='tunnel'){const f=tunnelBlend();return tunnelVisualPoint(f.travel,f.t);}if(mode==='nuclear'&&tunnelTo)return tunnelContactPoint();const q=manualDisplayPosition();return project(q.x,q.y);}
function tunnelVisualPoint(travel,t){
 if(tunnelApproachFrom&&tunnelTime<tunnelApproachLength()){const u=Math.max(0,tunnelTime/tunnelApproachLength()),ease=u*u*(3-2*u),a=project(...tunnelApproachFrom),b=project(...tunnelDisplayFrom);return [a[0]+(b[0]-a[0])*ease,a[1]+(b[1]-a[1])*ease];}
 const start=project(...(tunnelDisplayFrom||tunnelFrom)),end=tunnelContactPoint();
 return [start[0]+(end[0]-start[0])*travel,start[1]+(end[1]-start[1])*travel];
}
function tunnelRibbon(context,from,to,width,progress,finished=false){
 if(finished)return;if(reduced.matches){line(context,from,to,'#806aa355',2);return;}
 const f=tunnelBlend(),dx=to[0]-from[0],dy=to[1]-from[1],cx=from[0]+dx*f.travel,cy=from[1]+dy*f.travel,age=Math.max(0,progress-.72),burst=progress<.72?(f.glitch?.15:0):Math.exp(-age*9)*(1-Math.exp(-age*120)),radius=width*(.32+Math.min(1,age*3)*1.2);
 const hash=i=>{const n=Math.sin(i*127.1+43.7)*43758.5453;return n-Math.floor(n);};
 context.save();
 const halo=context.createRadialGradient(cx,cy,0,cx,cy,radius);
 halo.addColorStop(0,'rgba(240,248,255,'+(.07+.8*burst)+')');halo.addColorStop(.28,'rgba(155,195,255,'+(.04+.65*burst)+')');halo.addColorStop(1,'rgba(95,147,245,0)');context.fillStyle=halo;context.fillRect(cx-radius,cy-radius,radius*2,radius*2);
 // Irregular expanding filaments, not concentric rings. No simulation RNG is consumed.
 if(burst>.002){for(let k=0;k<34;k++){const angle=hash(k+1)*Math.PI*2,reach=radius*(.55+hash(k+91)*.7);context.beginPath();for(let j=0;j<=22;j++){const u=j/22,r=reach*(.25+.75*u),a=angle+Math.sin(u*12+k*3+age*9)*.10+Math.sin(u*27+k)*.035,xx=cx+Math.cos(a)*r,yy=cy+Math.sin(a)*r;if(j)context.lineTo(xx,yy);else context.moveTo(xx,yy);}context.strokeStyle='rgba(105,153,232,'+burst*(.14+.3*hash(k+43))+')';context.lineWidth=3;context.stroke();context.strokeStyle='rgba(225,238,255,'+burst*(.4+.5*hash(k+52))+')';context.lineWidth=.8;context.stroke();}
 for(let i=0;i<85;i++){const a=hash(i+200)*Math.PI*2,r=radius*Math.sqrt(hash(i+420)),size=.6+hash(i+540)*1.3;context.globalAlpha=burst*(.15+.7*hash(i+710));context.fillStyle='#d7e8ff';context.beginPath();context.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,size,0,Math.PI*2);context.fill();}context.globalAlpha=1;}
 if(f.glitch)for(let i=0;i<5;i++){const yy=cy+(i-2)*width*.09,offset=Math.sin(i*13+progress*53)*width*.2;line(context,[cx-width*.4+offset,yy],[cx+width*.4+offset,yy],'rgba(186,210,237,.22)',1);}
 context.restore();
}

function resize(canvas,context){const bounds=canvas.getBoundingClientRect(),r={width:canvas.clientWidth||bounds.width,height:canvas.clientHeight||bounds.height},fit=Math.min(bounds.width/r.width,bounds.height/r.height),d=Math.min((devicePixelRatio||1)*fit,Math.sqrt(8000000/(r.width*r.height)));if(canvas.width!==Math.round(r.width*d)||canvas.height!==Math.round(r.height*d)){canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);}context.setTransform(d,0,0,d,0,0);return [r.width,r.height];}
function line(context,a,b,color,width=1){context.strokeStyle=color;context.lineWidth=width;context.beginPath();context.moveTo(...a);context.lineTo(...b);context.stroke();}
function arrow(a,b,color){line(ctx,a,b,color,2);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...b);ctx.lineTo(b[0]-6*Math.cos(ang-.5),b[1]-6*Math.sin(ang-.5));ctx.lineTo(b[0]-6*Math.cos(ang+.5),b[1]-6*Math.sin(ang+.5));ctx.fill();}
function label(host,key,s,left,top,cls=''){let el=host.querySelector('[data-key="'+key+'"]');if(!el){el=document.createElement('span');el.dataset.key=key;el.className='mathlabel '+cls;host.append(el);}tex(el,s);el.style.left=left+'px';el.style.top=top+'px';return el;}
function nucleus(id,X,Y,key,customAtoms,rad=displayRadius()){const atoms=customAtoms||S.connected.atoms[id],cz=13.76;atoms.forEach((a,i)=>{const len=Math.hypot(a[0],a[1],cz-a[2]),depth=cz-a[2]-(cz-a[2])/len,px=X+rad*cz*(a[0]-a[0]/len)/depth,py=Y-rad*cz*(a[1]-a[1]/len)/depth;const el=label($('labels'),key+i,S.labels[id==='neutrino'?'neutrino':id==='positron'?'positron':a[3]<0?'e':a[3]===1?'p':'n'],px,py,'nucleon');if(id==='neutrino'){el.style.color='#294a53';el.style.textShadow='none';}el.style.fontSize=S.particleLabels.fontSize*2*rad/S.particleLabels.referenceDiameter+'px';});}

const potentialCanvas=document.createElement('canvas'),potentialContext=potentialCanvas.getContext('2d');
// Two-tone lines remain readable over every colour of the field-magnitude map.
function strokeFieldLines(context,light=false){
 context.lineCap=context.lineJoin='round';context.strokeStyle=light?'rgba(23,39,49,.52)':'rgba(23,39,49,.86)';context.lineWidth=light?1.7:2.3;context.stroke();
 context.strokeStyle=light?'rgba(255,249,233,.78)':'rgba(255,249,233,.98)';context.lineWidth=light?.7:1.05;context.stroke();
}
function fillFieldHeads(context){context.closePath();context.fillStyle='#fff9e9';context.fill();context.strokeStyle='rgba(23,39,49,.9)';context.lineWidth=.8;context.stroke();}
const fieldCanvas=document.createElement('canvas'),fc=fieldCanvas.getContext('2d');let fieldKey='',lastPair='',gridKey='',worldGrid=[];

// Pure numeric field work runs outside the animation/UI thread.
// Refine near field nulls instead of stepping repeatedly across a separatrix.
function fieldLineStep(F,x,y,sign=1,maxStep=3){
 const f=F(x,y);if(!f)return null;
 for(let h=maxStep;h>=.046875;h/=2){
  const mid=F(x+sign*h*.5*f[0],y+sign*h*.5*f[1]);if(!mid)continue;
  const nx=x+sign*h*mid[0],ny=y+sign*h*mid[1],end=F(nx,ny);
  if(!end||f[0]*mid[0]+f[1]*mid[1]<.985||mid[0]*end[0]+mid[1]*end[1]<.985)continue;
  return [nx,ny,Math.atan2(end[1],end[0])];
 }
 return null;
}
function fieldWorkerMain(port=self){
 port.onmessage=({data:d})=>{
 const {W,H,ox,oy,scale,sources,R,reference,arrows,style,viewKey}=d,width=d.synchronous?128:d.moving?256:Math.min(768,Math.max(384,Math.round(W*(d.renderScale||1)/3))),height=Math.max(1,Math.round(width*H/W)),pixels=new Uint8ClampedArray(width*height*4),palette=[[42,91,184],[30,172,195],[83,190,158],[179,206,90],[240,172,57],[222,91,63]],charged=sources.filter(s=>s[2]);
 for(let iy=0;iy<height;iy++)for(let ix=0;ix<width;ix++){const px=(ix+.5)*W/width,py=(iy+.5)*H/height;let ex=0,ey=0;for(const [sx,sy,z]of charged){const dx=px-sx,dy=py-sy,r2=Math.max((d.radius*.7)**2,dx*dx+dy*dy),weight=z/(r2*Math.sqrt(r2));ex+=dx*weight;ey+=dy*weight;}const strength=Math.hypot(ex,ey)*((d.referenceRadius||d.radius)*4)**2,part=Math.min(1,Math.log1p(strength)/Math.log(17))*5,index=Math.min(4,Math.floor(part)),t=part-index,k=(iy*width+ix)*4;for(let j=0;j<3;j++)pixels[k+j]=Math.round(palette[index][j]+(palette[index+1][j]-palette[index][j])*t);pixels[k+3]=255;}
 const step=d.synchronous?6:3,lines=[],heads=[],F=(x,y)=>{let fx=0,fy=0;for(const [sx,sy,z]of charged){const dx=x-sx,dy=y-sy,r2=dx*dx+dy*dy;if(r2>1){const f=z/(r2*Math.sqrt(r2));fx+=dx*f;fy+=dy*f;}}const n=Math.hypot(fx,fy);return n>1e-12?[fx/n,fy/n]:null;};
 if(arrows&&style==='source'){for(const [sx,sy,z]of charged)for(let j=0;j<24*z;j++){const a=j*Math.PI*2/(24*z);let x=sx+10*Math.cos(a),y=sy+10*Math.sin(a);const points=[x,y];for(let k=0;k<1350/step;k++){const next=fieldLineStep(F,x,y,1,step);if(!next)break;[x,y]=next;points.push(x,y);if(j%2===0&&k%50===25)heads.push([x,y,next[2]]);if(x<0||x>W||y<62||y>H-40)break;}lines.push({points,light:!!(j%2)});}}
 else if(arrows){const occupied=new Set(),cell=(x,y)=>Math.floor(x/16)+','+Math.floor(y/16);const trace=(sx,sy,sign)=>{let x=sx,y=sy;const points=[];for(let i=0;i<650;i++){const next=fieldLineStep(F,x,y,sign);if(!next)break;[x,y]=next;if(x<0||x>W||y<62||y>H-40||occupied.has(cell(x,y))||charged.some(s=>Math.hypot(x-s[0],y-s[1])<d.radius*1.4))break;points.push([x,y]);}return points;};for(let y=70;y<H-40;y+=38)for(let x=18;x<W;x+=38){if(occupied.has(cell(x,y)))continue;const points=[...trace(x,y,-1).reverse(),[x,y],...trace(x,y,1)];if(points.length<10)continue;points.forEach(q=>occupied.add(cell(...q)));const sampled=points;lines.push({points:sampled.flat(),light:false});for(let i=28;i<points.length-2;i+=100){const q=points[i],f=F(...q);if(f)heads.push([...q,Math.atan2(f[1],f[0])]);}}}
 port.postMessage({width,height,pixels,lines,heads,sources:charged,W,H,viewKey,requestId:d.requestId,radius:d.radius},[pixels.buffer]);
 };
}
let fieldWorker=null,fieldWorkerBusy=false,fieldWorkerView='',fieldWorkerReady=false,fieldRequestAt=-Infinity,fieldSourceKey='',fieldMotionKey='',fieldMotionAt=-Infinity,fieldRequestId=0;
const immediateField={postMessage:d=>fieldWorker.onmessage({data:d})};fieldWorkerMain(immediateField);
try{if(typeof Worker==='function'){const url=URL.createObjectURL(new Blob([fieldLineStep.toString()+';('+fieldWorkerMain.toString()+')()'],{type:'text/javascript'}));fieldWorker=new Worker(url);URL.revokeObjectURL(url);fieldWorker.onerror=()=>{fieldWorker.terminate();fieldWorker=null;fieldKey='';};fieldWorker.onmessage=({data:d})=>{if(d.requestId!==fieldRequestId)return;fieldWorkerBusy=false;if(d.viewKey!==fieldWorkerView)return;const renderScale=c.width/W;fieldCanvas.width=Math.round(d.W*renderScale);fieldCanvas.height=Math.round(d.H*renderScale);fc.setTransform(renderScale,0,0,renderScale,0,0);potentialCanvas.width=d.width;potentialCanvas.height=d.height;potentialContext.putImageData(new ImageData(d.pixels,d.width,d.height),0,0);fc.save();fc.globalAlpha=.82;fc.imageSmoothingEnabled=true;fc.imageSmoothingQuality='high';fc.drawImage(potentialCanvas,0,0,d.W,d.H);fc.restore();fc.save();fc.beginPath();fc.rect(0,62,d.W,Math.max(1,d.H-102));fc.clip();for(const light of [true,false]){fc.beginPath();for(const line of d.lines){if(line.light!==light)continue;for(let i=0;i<line.points.length;i+=2){if(i)fc.lineTo(line.points[i],line.points[i+1]);else fc.moveTo(line.points[i],line.points[i+1]);}}strokeFieldLines(fc,light);}fc.beginPath();for(const [x,y,a]of d.heads){fc.moveTo(x+3*Math.cos(a),y+3*Math.sin(a));fc.lineTo(x-3*Math.cos(a-.55),y-3*Math.sin(a-.55));fc.lineTo(x-3*Math.cos(a+.55),y-3*Math.sin(a+.55));fc.closePath();}fillFieldHeads(fc);fc.restore();fc.save();fc.globalCompositeOperation='destination-in';const fade=fc.createLinearGradient(0,0,0,d.H);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(.12,'rgba(0,0,0,1)');fade.addColorStop(.87,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,0)');fc.fillStyle=fade;fc.fillRect(0,0,d.W,d.H);fc.restore();fieldWorkerReady=true;};window.addEventListener('pagehide',event=>{if(!event.persisted)fieldWorker?.terminate();});}}
catch(e){fieldWorker=null;}
function threadedFieldLayer(){
 const sources=fusion?(fusion.products?[...fusion.products.sources,...fusion.products.products].map(b=>[...project(b.x,b.y),b.Z]):[...centers.filter((_,i)=>i!==targetIndex).map(t=>[...project(t.x,t.y),t.Z??p.a.Z]),[...project(fusion.origin.x,fusion.origin.y),fusion.reaction.input.reduce((z,k)=>z+R.species[k].Z,0)]]):[...centers.map(t=>[...project(t.x,t.y),t.Z??p.a.Z]),[...projectilePoint(),p.b.Z]],viewKey=[W,H,c.width,c.height,ox,oy,scale,$('arrows').checked,$('lineStyle').value].join('/'),now=performance.now();
 if(viewKey!==fieldWorkerView){fieldWorkerView=viewKey;fieldWorkerReady=false;fieldRequestAt=-Infinity;fieldSourceKey='';}
 const motionKey=viewKey+'/'+p.R+'/'+sources.map(s=>[Math.round(s[0]),Math.round(s[1]),s[2]].join(',')).join(';');if(motionKey!==fieldMotionKey){fieldMotionKey=motionKey;fieldMotionAt=now;}const moving=now-fieldMotionAt<100,sourceKey=motionKey+'/'+moving;
 if(sourceKey!==fieldSourceKey&&(moving||!fieldWorkerBusy)){
  const request={moving,synchronous:moving,requestId:++fieldRequestId,renderScale:c.width/W,W,H,ox,oy,scale,sources,R:p.R,reference:M.thermalMean(100),arrows:$('arrows').checked,style:$('lineStyle').value,viewKey,referenceRadius:displayRadius()*zoom,radius:displayRadius()};
  fieldSourceKey=sourceKey;fieldRequestAt=now;
  // During interaction, render the field from this frame's exact particle positions.
  // A delayed refinement must never overwrite a newer interactive frame.
  if(moving)immediateField.onmessage({data:request});
  else{fieldWorkerBusy=true;fieldWorker.postMessage(request);}
 }

 if(fieldWorkerReady)ctx.drawImage(fieldCanvas,0,0,W,H);
}

function fieldLayer(X,Y){
 if(fieldWorker){threadedFieldLayer();return;}
 const key=[Math.round(W),Math.round(H),Math.round(ox),Math.round(oy),zoom,Math.round(X/2),Math.round(Y/2),Math.round(x*scale),Math.round(y*scale),layoutSeed,centers.map(t=>Math.round(t.x*scale)+','+Math.round(t.y*scale)).join(';'),centers.length,shot.start,energy,scale,fusion?fusion.phase+'-'+Math.round(fusion.flightTime*30)+'-'+Math.round(fusionWarp()*50)+'-'+(fusion.detail?fusion.detail.stage+Math.round(fusion.detail.age*60):''):'',p.a.Z,p.b.Z,$('arrows').checked,$('lineStyle').value].join('/');
 if(key!==fieldKey){fieldKey=key;const renderScale=c.width/W;fieldCanvas.width=c.width;fieldCanvas.height=c.height;fc.setTransform(renderScale,0,0,renderScale,0,0);fc.clearRect(0,0,W,H);
 const physicalSources=fusion?[...(fusion.products?fusion.products.sources.map(b=>[b.x,b.y,b.Z]):centers.filter((t,i)=>i!==targetIndex).map(t=>[t.x,t.y,t.Z??p.a.Z])),...(fusion.products?fusion.products.products.map(b=>[b.x,b.y,b.Z]):[[fusion.origin.x,fusion.origin.y,fusion.reaction.input.reduce((z,k)=>z+R.species[k].Z,0)]])]:[...centers.map(t=>[t.x,t.y,t.Z??p.a.Z]),[x,y,p.b.Z]];const sourceKinds=fusion?(fusion.products?[...fusion.products.sources.map(b=>targetKind(centers[b.id])),...fusion.products.products.map(b=>b.kind||b.id)]:[...centers.filter((_,i)=>i!==targetIndex).map(targetKind),'alpha']):[...centers.map(targetKind),$('projectile').value],displayedSources=schematicItems(physicalSources.map(([wx,wy],i)=>({id:sourceKinds[i],x:project(wx,wy)[0],y:project(wx,wy)[1],radius:displayRadius()}))),sources=displayedSources.map((q,i)=>!fusion&&i===physicalSources.length-1?[...projectilePoint(),physicalSources[i][2]]:[q.x,q.y,physicalSources[i][2]]),mapSources=sources.map(([sx,sy,z])=>[...unproject(sx,sy),z]);
 // Magnitude of the vector sum of electric fields, in schematic scene geometry.
 const mapWidth=192,mapHeight=Math.max(1,Math.round(mapWidth*H/W));potentialCanvas.width=mapWidth;potentialCanvas.height=mapHeight;
 const currentGridKey=[W,H,ox,oy,scale,zoom,layoutSeed,centers.length,p.C,p.R,fusionWarp()].join('/');
 if(gridKey!==currentGridKey){gridKey=currentGridKey;worldGrid=[];for(let iy=0;iy<mapHeight;iy++)for(let ix=0;ix<mapWidth;ix++)worldGrid.push(unproject((ix+.5)/mapWidth*W,(iy+.5)/mapHeight*H));}

 const palette=[[42,91,184],[30,172,195],[83,190,158],[179,206,90],[240,172,57],[222,91,63]],reference=M.thermalMean(100);
 for(let iy=0;iy<mapHeight;iy++)for(let ix=0;ix<mapWidth;ix++){
 const px=(ix+.5)*W/mapWidth,py=(iy+.5)*H/mapHeight;let ex=0,ey=0;
 for(const [sx,sy,z]of sources){const dx=px-sx,dy=py-sy,r=Math.max(displayRadius()*.7,Math.hypot(dx,dy));ex+=z*dx/r**3;ey+=z*dy/r**3;}
 const strength=Math.hypot(ex,ey)*(displayRadius()*zoom*4)**2,value=Math.min(1,Math.log1p(strength)/Math.log(17)),part=value*(palette.length-1),index=Math.min(palette.length-2,Math.floor(part)),t=part-index,col=palette[index].map((c,j)=>Math.round(c+(palette[index+1][j]-c)*t));
 potentialContext.fillStyle='rgb('+col.join(',')+')';potentialContext.fillRect(ix,iy,1,1);
 }
 fc.save();fc.globalAlpha=.82;fc.imageSmoothingEnabled=true;fc.imageSmoothingQuality='high';fc.drawImage(potentialCanvas,0,0,W,H);fc.restore();
 if($('arrows').checked&&$('lineStyle').value==='spread'){
  fc.save();fc.beginPath();fc.rect(0,0,W,H);fc.clip();
  // Spaced streamlines, inspired by force-core; direction comes from the electric field.
  const occupied=new Set(),directions=new Map(),cell=(px,py)=>Math.floor(px/16)+','+Math.floor(py/16);
  const F=(px,py)=>{
   
   const gx=Math.max(0,Math.min(mapWidth-1,px/W*mapWidth-.5)),gy=Math.max(0,Math.min(mapHeight-1,py/H*mapHeight-.5)),ix=Math.floor(gx),iy=Math.floor(gy),jx=Math.min(mapWidth-1,ix+1),jy=Math.min(mapHeight-1,iy+1),tx=gx-ix,ty=gy-iy;
   const q=[0,1].map(k=>(worldGrid[iy*mapWidth+ix][k]*(1-tx)+worldGrid[iy*mapWidth+jx][k]*tx)*(1-ty)+(worldGrid[jy*mapWidth+ix][k]*(1-tx)+worldGrid[jy*mapWidth+jx][k]*tx)*ty);
   let fx=0,fy=0;for(const [sx,sy,z]of mapSources){const dx=q[0]-sx,dy=q[1]-sy,r=Math.max(p.R*.3,Math.hypot(dx,dy));fx+=z*dx/r**3;fy+=z*dy/r**3;}
   const n=Math.hypot(fx,fy);let result=null;if(n>1e-15){const start=project(...q),end=project(q[0]+fx/n*.2/scale,q[1]+fy/n*.2/scale),dx=end[0]-start[0],dy=end[1]-start[1],length=Math.hypot(dx,dy);if(length>1e-9)result=[dx/length,dy/length];}return result;
  };
  const trace=(seed,sign)=>{let point=seed;const points=[];for(let i=0;i<650;i++){const next=fieldLineStep(F,...point,sign);if(!next)break;point=next.slice(0,2);if(point[0]<0||point[0]>W||point[1]<0||point[1]>H||occupied.has(cell(...point))||sources.some(([sx,sy,z])=>z&&Math.hypot(point[0]-sx,point[1]-sy)<displayRadius()*1.4))break;points.push(point);}return points;};
  for(let sy=18;sy<H;sy+=38)for(let sx=18;sx<W;sx+=38){if(occupied.has(cell(sx,sy)))continue;const seed=[sx,sy],points=[...trace(seed,-1).reverse(),seed,...trace(seed,1)];if(points.length<10)continue;points.forEach(q=>occupied.add(cell(...q)));fc.beginPath();points.forEach((q,i)=>i?fc.lineTo(...q):fc.moveTo(...q));strokeFieldLines(fc);for(let i=28;i<points.length-2;i+=100){const q=points[i],d=F(...q);if(!d)continue;const angle=Math.atan2(d[1],d[0]);fc.beginPath();fc.moveTo(q[0]+3*Math.cos(angle),q[1]+3*Math.sin(angle));fc.lineTo(q[0]-3*Math.cos(angle-.55),q[1]-3*Math.sin(angle-.55));fc.lineTo(q[0]-3*Math.cos(angle+.55),q[1]-3*Math.sin(angle+.55));fillFieldHeads(fc);}}
  fc.restore();
 }
 else if($('arrows').checked){fc.save();fc.beginPath();fc.rect(0,62,W,Math.max(1,H-102));fc.clip();
 // Restore the original source-seeded, continuous schematic field lines.
 const F=(a,b)=>{let fx=0,fy=0;for(const [sx,sy,z]of sources){const dx=a-sx,dy=b-sy,r=Math.hypot(dx,dy);if(r>1){fx+=z*dx/r**3;fy+=z*dy/r**3;}}const n=Math.hypot(fx,fy);return n>1e-12?[fx/n,fy/n]:null;};
 for(const [sx,sy,z]of sources){for(let j=0;j<24*z;j++){const a=j*Math.PI*2/(24*z);let px=sx+10*Math.cos(a),py=sy+10*Math.sin(a);fc.beginPath();fc.moveTo(px,py);const arrows=[];
 for(let k=0;k<450;k++){const next=fieldLineStep(F,px,py);if(!next)break;[px,py]=next;fc.lineTo(px,py);if(j%2===0&&k%50===25)arrows.push([px,py,next[2]]);if(px<0||px>W||py<62||py>H-40)break;}
 strokeFieldLines(fc,!!(j%2));for(const [ax,ay,angle]of arrows){fc.beginPath();fc.moveTo(ax+3*Math.cos(angle),ay+3*Math.sin(angle));fc.lineTo(ax-3*Math.cos(angle-.55),ay-3*Math.sin(angle-.55));fc.lineTo(ax-3*Math.cos(angle+.55),ay-3*Math.sin(angle+.55));fillFieldHeads(fc);}
 }}fc.restore();}
 // Soft fade into the scene edges, rather than an isolated rectangular patch.
 fc.save();fc.globalCompositeOperation='destination-in';const fade=fc.createLinearGradient(0,0,0,H);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(.12,'rgba(0,0,0,1)');fade.addColorStop(.87,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,0)');fc.fillStyle=fade;fc.fillRect(0,0,W,H);fc.restore();

 }
 ctx.drawImage(fieldCanvas,0,0,W,H);
}
function tracePoint(nodes,index=0){const q=[nodes[index].x,nodes[index].y];q.nodes=nodes;q.nodeIndex=index;return q;}
const traceCache=new WeakMap();
function tracePosition(q){if(!q.nodes)return project(q[0],q[1]);const key=[scale,ox,oy,zoom,temperature,W,H].join('/'),cached=traceCache.get(q);if(cached?.key===key)return cached.point;const items=schematicItems(q.nodes.map(t=>({id:t.kind||$('target').value,x:project(t.x,t.y)[0],y:project(t.x,t.y)[1],radius:displayRadius()}))),item=items[q.nodeIndex||0],point=[item.x,item.y];traceCache.set(q,{key,point});return point;}
function drawAimPreview(){
 if(preview.length<2)return;const glyphs=currentGlyphs(),origin=glyphs[0],[a,b,c,d]=displayJacobian(),start=preview[0],points=[];let interrupted=false;
 // One fixed linear map preserves the initial heading; no per-point collision-avoidance warp.
 for(const q of preview){const dx=q[0]-start[0],dy=q[1]-start[1],px=origin.x+a*dx+b*dy,py=origin.y+c*dx+d*dy;
 if(glyphs.slice(1).some(t=>Math.hypot(px-t.x,py-t.y)<t.radius*visualBound(t.id)+3)){interrupted=true;continue;}
 const point=unproject(px,py);point.move=interrupted;interrupted=false;points.push(point);
 }path(points,'#753bb3',true);
}
function path(points,color,dashed=false){if(points.length<2)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash(dashed?[10,6]:[]);ctx.beginPath();points.forEach((q,i)=>{const [X,Y]=tracePosition(q);if(i&&!q.move)ctx.lineTo(X,Y);else ctx.moveTo(X,Y);});if(dashed){ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineWidth=6;ctx.stroke();}ctx.strokeStyle=color;ctx.lineWidth=dashed?3:2.4;ctx.stroke();ctx.restore();}
function drawCell(){
 if(!cell||!(['flight','products','productsDone'].includes(mode)))return;const a=project(cell.x-cell.rx,cell.y-cell.ry),b=project(cell.x+cell.rx,cell.y+cell.ry),w=cell.width*scale;
 ctx.save();ctx.fillStyle='rgba(137,108,171,.045)';ctx.fillRect(a[0]-w,a[1]-w,b[0]-a[0]+2*w,w);ctx.fillRect(a[0]-w,b[1],b[0]-a[0]+2*w,w);ctx.fillRect(a[0]-w,a[1],w,b[1]-a[1]);ctx.fillRect(b[0],a[1],w,b[1]-a[1]);ctx.strokeStyle='#9d8cb466';ctx.lineWidth=1.2;ctx.setLineDash([5,7]);ctx.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);ctx.setLineDash([]);ctx.strokeStyle='#9d8cb433';ctx.strokeRect(a[0]-w,a[1]-w,b[0]-a[0]+2*w,b[1]-a[1]+2*w);ctx.restore();
}
function scene(){
 document.querySelector('.fieldLegend').hidden=!$('field').checked;
 [W,H]=resize(c,ctx);view();if(fitPending)fitAllParticles();ctx.clearRect(0,0,W,H);const [X,Y]=projectilePoint();
 if($('field').checked)fieldLayer(X,Y);drawCell();
 if(fusion&&fusion.phase!=='compound'&&fusion.reaction.Q>0){const point=project(fusion.origin.x,fusion.origin.y),radius=Math.min(W,H)*(.32+.045*Math.min(1,fusion.flightTime/.7)),alpha=.16+.5*Math.exp(-Math.pow((fusion.flightTime-.22)/.48,2)),wash=ctx.createRadialGradient(...point,0,...point,radius);wash.addColorStop(0,'rgba(243,183,62,'+alpha+')');wash.addColorStop(.22,'rgba(255,211,91,'+(alpha*.82)+')');wash.addColorStop(.6,'rgba(243,166,34,'+(alpha*.48)+')');wash.addColorStop(1,'rgba(243,183,62,0)');ctx.fillStyle=wash;ctx.fillRect(point[0]-radius,point[1]-radius,radius*2,radius*2);}
if(fusion&&fusion.phase==='compound'){const point=project(fusion.origin.x,fusion.origin.y),pulse=displayRadius()*(2.4+.3*Math.sin(fusion.time*19));const glow=ctx.createRadialGradient(...point,0,...point,pulse*1.7);glow.addColorStop(0,'rgba(255,184,81,.2)');glow.addColorStop(1,'rgba(255,184,81,0)');ctx.fillStyle=glow;ctx.fillRect(point[0]-pulse*1.7,point[1]-pulse*1.7,pulse*3.4,pulse*3.4);}
 if(!fusion){const heat=Math.max(0,Math.min(1,(temperature-10)/490)),haloRadius=displayRadius()*(3.3+heat),halo=ctx.createRadialGradient(X,Y,displayRadius(),X,Y,haloRadius);
 halo.addColorStop(0,'rgba(231,134,40,'+(.04+.17*heat)+')');halo.addColorStop(1,'rgba(231,134,40,0)');ctx.fillStyle=halo;ctx.fillRect(X-haloRadius,Y-haloRadius,haloRadius*2,haloRadius*2);}
 ctx.save();ctx.beginPath();ctx.rect(0,65,W,Math.max(1,H-110));ctx.clip();
 if(fusion&&fusion.phase!=='compound'){fusion.trail.forEach((points,i)=>path(points,i===0?'#bd5b12':'#506b87'));const origin=project(fusion.origin.x,fusion.origin.y);ctx.beginPath();ctx.arc(...origin,4,0,Math.PI*2);ctx.strokeStyle='#7b8382';ctx.lineWidth=1.3;ctx.stroke();}
 if(!fusion&&$('interaction').value==='gun'){
 if(mode==='ready'&&$('interaction').value==='gun'){drawAimPreview();}path(trail,'#087f79');
 const gunGlyph=mode==='ready'?currentGlyphs()[0]:null,[gx,gy]=gunGlyph?[gunGlyph.x,gunGlyph.y]:project(...gunOrigin);ctx.save();ctx.translate(gx,gy);ctx.rotate(gunHeading-angle);ctx.scale(zoom,zoom);ctx.fillStyle='#244f55';ctx.strokeStyle='#dce9e6';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-21,-11,46,22,5);ctx.fill();ctx.stroke();ctx.fillStyle='#79b9aa';ctx.fillRect(20,-7,8,14);ctx.restore();
 const heading=gunHeading-angle,guideLength=aiming&&lastPointer?Math.hypot(canvasPoint(lastPointer)[0]-gx,canvasPoint(lastPointer)[1]-gy):Math.min(W,H)*.38;arrow([gx+Math.cos(heading)*30*zoom,gy+Math.sin(heading)*30*zoom],[gx+Math.cos(heading)*Math.max(guideLength,50*zoom),gy+Math.sin(heading)*Math.max(guideLength,50*zoom)],'#b37a32');
 }
 if(!fusion){ctx.strokeStyle='#b58bb666';ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(...project(centers[targetIndex].x,centers[targetIndex].y),Math.min(W,H)*.13*zoom,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
 if(drag){const [tx,ty]=project(...drag),dx=tx-X,dy=ty-Y,len=Math.hypot(dx,dy),r=M.nearest(centers,x,y).distance,limit=Math.max(p.R,M.turning(p,energy)),resistance=p.C?Math.min(1,M.multiPotential(p,centers,x,y)/energy):0,color=resistance>.8?'#c1533b':'#bc8b4e';
ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X,Y);for(let i=1;i<=40;i++){const t=i/40,wiggle=Math.sin(t*Math.PI*12)*Math.sin(t*Math.PI)*Math.min(6,len*.08);ctx.lineTo(X+dx*t-dy/Math.max(1,len)*wiggle,Y+dy*t+dx/Math.max(1,len)*wiggle);}ctx.stroke();ctx.beginPath();ctx.arc(tx,ty,8,0,Math.PI*2);ctx.stroke();
if(p.C){arrow([X,Y+Math.min(W,H)*.13*zoom],[X+(x-centers[targetIndex].x)/r*(20+65*resistance),Y+Math.min(W,H)*.13*zoom+(y-centers[targetIndex].y)/r*(20+65*resistance)],color);ctx.setLineDash([3,7]);ctx.strokeStyle='#bd725b66';ctx.beginPath();for(let i=0;i<=96;i++){const angle=i*Math.PI/48,point=project(centers[targetIndex].x+limit*Math.cos(angle),centers[targetIndex].y+limit*Math.sin(angle));if(i)ctx.lineTo(...point);else ctx.moveTo(...point);}ctx.stroke();ctx.setLineDash([]);}
status(!p.C?'Neutron nemá Coulombův odpor.':resistance>.995?'Dosažena mez přiblížení.':resistance>.35?'Odpor roste. Spojnice ukazuje tah.':'Táhni blíž; odpor poroste.');}
 if(mode==='tunnel'&&tunnelTime>=tunnelApproachLength()){const f=tunnelBlend(),dest=tunnelContactPoint();tunnelRibbon(ctx,tunnelVisualPoint(0,f.t),dest,Math.min(W,H)*.11*zoom,f.t);for(const [xx,yy,weight]of [[X,Y,1-f.smooth],[...dest,f.smooth]]){const rad=Math.min(W,H)*.14*zoom,gr=ctx.createRadialGradient(xx,yy,0,xx,yy,rad);gr.addColorStop(0,'rgba(145,130,204,'+(.27*weight*f.shimmer)+')');gr.addColorStop(1,'rgba(145,130,204,0)');ctx.fillStyle=gr;ctx.fillRect(xx-rad,yy-rad,rad*2,rad*2);}}
 ctx.restore();
 const pk=centers.map(targetKind).join(',')+$('projectile').value;if(pk!==lastPair){$('labels').replaceChildren();lastPair=pk;}
 if(!fusion)centers.forEach((t,i)=>nucleus(targetKind(t),...targetScreen(t,i),'a'+i+'-'));if(!fusion)nucleus($('projectile').value,X,Y,'b');if(!fusion)for(const el of $('labels').querySelectorAll('.nucleon'))el.hidden=false;
 for(const el of $('labels').children)if(el.dataset.key.startsWith('b'))el.style.opacity=mode==='tunnel'?0:1;
}
function excavatedTunnel(context,from,to){
 const dx=to[0]-from[0],length=Math.max(1,Math.abs(dx)),steps=Math.max(24,Math.ceil(length/3)),edge=(u,side)=>side*(5.5+1.15*Math.sin(u*73+side)+.65*Math.sin(u*157+side*3)+.45*Math.sin(u*311));
 context.save();context.beginPath();for(let i=0;i<=steps;i++){const u=i/steps,x=from[0]+dx*u,y=from[1]+edge(u,-1);if(i)context.lineTo(x,y);else context.moveTo(x,y);}for(let i=steps;i>=0;i--){const u=i/steps;context.lineTo(from[0]+dx*u,from[1]+edge(u,1));}context.closePath();context.fillStyle='rgba(241,235,250,.94)';context.fill();context.strokeStyle='rgba(119,82,160,.85)';context.lineWidth=1.2;context.stroke();
 // Small excavated facets on both edges, not a varying energy trajectory.
 for(let i=2;i<steps;i+=4){const u=i/steps,px=from[0]+dx*u;for(const side of [-1,1])line(context,[px,from[1]+edge(u,side)],[px+2,from[1]+side*3],'rgba(134,103,173,.32)',.8);}
 context.setLineDash([2,5]);line(context,from,to,'rgba(119,82,160,.38)',.8);context.restore();
}
// Connected classically forbidden interval adjacent to the nuclear well.
// The two ends solve the same U(q)=E that is drawn in the graph.
function barrierProfile(snapshot){
 const gp=snapshot.pair,targets=snapshot.centers,index=snapshot.targetIndex,target=targets[index],distance=Math.hypot(snapshot.x-target.x,snapshot.y-target.y),norm=Math.max(1e-12,distance),nx=distance?(snapshot.x-target.x)/norm:1,ny=distance?(snapshot.y-target.y)/norm:0;
 const qOf=r=>1+Math.log(Math.max(.01,r/gp.R))/1.5,nuclear=q=>gp.C?-20/(1+Math.exp((q-1)/.04)):0,repulsion=q=>gp.C?Math.exp(-1.5*(q-1)):0;
 const background=q=>{const r=gp.R*Math.exp(1.5*(q-1));return graphSurroundingEnergy(gp,targets,index,target.x+nx*r,target.y+ny*r)/Math.max(1,gp.C/gp.R);},total=q=>repulsion(q)+nuclear(q)+background(q);
 return {target,distance,qOf,nuclear,repulsion,background,total};
}
function graphSurroundingEnergy(pair,targets,selected,x,y){return targets.reduce((sum,t,i)=>i===selected?sum:sum+1439.96448*pair.b.Z*(t.Z??pair.a.Z)/Math.max(pair.R*.3,Math.hypot(x-t.x,y-t.y)),0);}
function graphBarrierInterval(total,energy){
 const root=(a,b)=>{const sign=total(a)>energy;for(let i=0;i<45;i++){const m=(a+b)/2;if((total(m)>energy)===sign)a=m;else b=m;}return (a+b)/2;};
 let inner=null,previous=.3,above=total(previous)>energy;
 for(let i=1;i<=2400;i++){const q=.3+i*.005,next=total(q)>energy;if(!above&&next&&inner===null)inner=root(previous,q);if(above&&!next&&inner!==null)return {inner,outer:root(previous,q)};previous=q;above=next;}
 return null;
}
// Use the same radius range for one through five targets at a given energy.
function graphRange(pair,energy){const radius=6*Math.max(24,60*1439.96448/Math.max(.001,energy));return Math.max(6,1+Math.log(Math.max(1,radius/pair.R))/1.5);}
function graph(){
 const snapshot=tunnelGraph||{pair:p,centers,targetIndex,x,y,energy,graphRadius:shot.start*6},gp=snapshot.pair,graphCenters=snapshot.centers,graphTarget=snapshot.targetIndex,graphEnergy=snapshot.energy;

 const [w,h]=resize(g,gc),left=60,right=w-25,top=38,bottom=h-42,zero=top+(bottom-top)*.72;
 if(h<100||w<150)return;gc.clearRect(0,0,w,h);
 // Quantified logarithmic radius and linear model graphEnergy; the deep nuclear well is clipped.
 const qMax=graphRange(gp,graphEnergy),sx=q=>left+q/qMax*(right-left),sy=u=>zero-u*(zero-top)/yMax;
 const {target,distance,qOf,nuclear,repulsion,background,total}=barrierProfile(snapshot);
 const energyUnit=Math.max(1,gp.C/gp.R),tickText=v=>Math.abs(v)>=100?Math.round(v).toString():fmt(v);let peak=.01;for(let i=0;i<=500;i++)peak=Math.max(peak,repulsion(.3+(qMax-.3)*i/500)+nuclear(.3+(qMax-.3)*i/500));const yMax=Math.max(peak,M.thermalMean(Number($('temperature').max))/energyUnit)*1.12;
 for(let i=0;i<=2;i++){const value=yMax*i/2,yy=sy(value);label($('graphLabels'),'ytick'+i,tickText(value*energyUnit),left-30,yy);line(gc,[left-4,yy],[left,yy],'#718280');if(i){gc.setLineDash([2,5]);line(gc,[left,yy],[right,yy],'#dce6e4',.7);gc.setLineDash([]);}}
 const negative=-yMax*(bottom-zero)/(zero-top);label($('graphLabels'),'yneg',tickText(negative*energyUnit),left-30,bottom);
 for(let exponent=0;exponent<=8;exponent++){const r=10**exponent,q=qOf(r),tick=label($('graphLabels'),'xtick'+exponent,String(r),sx(q),bottom+16);tick.hidden=q<0||q>qMax;if(!tick.hidden)line(gc,[sx(q),bottom],[sx(q),bottom+4],'#718280');}
 line(gc,[left,bottom],[right,bottom],'#b8c7c2');
 label($('graphLabels'),'axisU',String.raw`U/\mathrm{keV}`,left+8,top-16);label($('graphLabels'),'axisR',String.raw`r/\mathrm{fm}`,right-24,bottom+30);
 line(gc,[left,top],[left,bottom],'#718280');line(gc,[left,zero],[right,zero],'#718280');
 gc.save();gc.beginPath();gc.rect(left,top,right-left,bottom-top);gc.clip();gc.fillStyle='#e0eef155';gc.fillRect(left,top,sx(1.4)-left,bottom-top);
 const curve=(fn,color,dash)=>{gc.beginPath();for(let i=0;i<=500;i++){const q=.3+(qMax-.3)*i/500;if(i)gc.lineTo(sx(q),sy(fn(q)));else gc.moveTo(sx(q),sy(fn(q)));}gc.strokeStyle=color;gc.lineWidth=2;gc.setLineDash(dash);gc.stroke();gc.setLineDash([]);};
 if(graphCenters.length>1){gc.beginPath();for(let i=0;i<=400;i++){const q=.3+(qMax-.3)*i/400;if(i)gc.lineTo(sx(q),sy(total(q)));else gc.moveTo(sx(q),sy(total(q)));}for(let i=400;i>=0;i--){const q=.3+(qMax-.3)*i/400;gc.lineTo(sx(q),sy(repulsion(q)+nuclear(q)));}gc.closePath();gc.fillStyle='#487eb570';gc.fill();}
 curve(q=>repulsion(q)+nuclear(q),'#a7aaa5',[5,4]);curve(total,'#146e70',[]);
 let overflowStart=null,overflow=false;for(let i=0;i<=501;i++){const q=.3+(qMax-.3)*Math.min(i,500)/500,above=i<=500&&total(q)>yMax;if(above&&overflowStart===null)overflowStart=q;if(!above&&overflowStart!==null){const px=sx((overflowStart+q)/2);line(gc,[px-4,top+7],[px,top+2],'#146e70',1.7);line(gc,[px,top+2],[px+4,top+7],'#146e70',1.7);overflowStart=null;overflow=true;}}
 const graphNote=document.querySelector('.graphNote'),note=overflow?'Pevná osa · log. vzdálenost · přesah ↑':'Pevná osa · logaritmická vzdálenost';if(graphNote.textContent!==note)graphNote.textContent=note;

 const energyRatio=gp.C?graphEnergy/(gp.C/gp.R):0,energyY=sy(energyRatio),band=gp.C?graphBarrierInterval(total,energyRatio):null;
 const active=tunnelFrom&&(mode==='tunnel'||mode==='nuclear'||!!fusion),phase=active?Math.max(0,Math.min(1,(tunnelTime-tunnelApproachLength())/(tunnelDuration*.8))):0,tunneled=!!(active&&band&&tunnelTime>=tunnelApproachLength()),entryQ=band?band.outer:qOf(distance),exitQ=band?band.inner:entryQ;
 const radiusOf=q=>gp.R*Math.exp(1.5*(q-1)),entry=radiusOf(entryQ),exit=radiusOf(exitQ);
 gc.setLineDash([6,4]);line(gc,[left,energyY],[right,energyY],'#af7830',1.5);gc.setLineDash([]);
 const progress=tunneled?phase:0,approachLinear=active&&band?Math.min(1,tunnelTime/tunnelApproachLength()):0,approach=approachLinear*approachLinear*(3-2*approachLinear),q=tunneled?entryQ+(exitQ-entryQ)*progress:qOf(distance)+(entryQ-qOf(distance))*approach,mx=sx(q),my=tunneled?energyY:sy(total(q));
 if(!tunneled&&graphCenters.length>1){const baseY=sy(repulsion(q)+nuclear(q));line(gc,[mx,baseY],[mx,my],'#376daf',3);line(gc,[mx-4,baseY],[mx+4,baseY],'#376daf',1.5);}
 if(tunneled){
  const startX=sx(entryQ),endX=sx(exitQ);
  gc.beginPath();gc.moveTo(endX,energyY);for(let i=0;i<=160;i++){const q=exitQ+(entryQ-exitQ)*i/160;gc.lineTo(sx(q),Math.min(energyY,sy(total(q))));}gc.lineTo(startX,energyY);gc.closePath();gc.fillStyle='rgba(123,91,170,.10)';gc.fill();
  excavatedTunnel(gc,[startX,energyY],[endX,energyY]);
  for(const px of [startX,endX]){gc.beginPath();gc.arc(px,energyY,4.5,0,Math.PI*2);gc.fillStyle='#fff';gc.fill();gc.strokeStyle='#8054a6';gc.lineWidth=2;gc.stroke();line(gc,[px,energyY+7],[px,energyY+17],'#8054a6',1);}
  line(gc,[endX+7,energyY-4],[endX,energyY],'#8054a6',2);line(gc,[endX+7,energyY+4],[endX,energyY],'#8054a6',2);
  tunnelRibbon(gc,[startX,energyY],[endX,energyY],14,progress,mode==='nuclear'||!!fusion);
 }
 const tunnelLabel=label($('graphLabels'),'tunnelSpan',tunneled?String.raw`\Delta r=`+fmt(Math.max(0,entry-exit))+String.raw`\,\mathrm{fm}`:'',Math.max(left+60,Math.min(right-60,(sx(entryQ)+sx(exitQ))/2)),energyY+29);tunnelLabel.hidden=!tunneled;

 gc.save();gc.setLineDash([3,5]);line(gc,[mx,bottom],[mx,my],'rgba(190,128,34,.65)',1.1);gc.setLineDash([]);line(gc,[mx,bottom-5],[mx,bottom+1],'#b57825',2);gc.restore();
 gc.beginPath();gc.arc(Math.max(left+6,Math.min(right-6,mx)),Math.max(top+6,Math.min(bottom-6,my)),6,0,Math.PI*2);gc.fillStyle='#efaa3e';gc.fill();gc.strokeStyle='#603e18';gc.stroke();gc.restore();
 tex($('surroundingValue'),String.raw`U_{\mathrm{okolí}}=`+(background(q)*energyUnit).toFixed(3).replace('.', '{,}')+String.raw`\,\mathrm{keV}`);
 label($('graphLabels'),'well',String.raw`\text{Potenciálová jáma}`,sx(3.8),zero+(bottom-zero)*.6).hidden=!gp.C;

}

function scientific(n){if(n===0)return p.C?String.raw`\text{pod rozlišením výpočtu}`:'0';if(n>=.001)return fmt(n*100)+'\\,\\%';const e=Math.floor(Math.log10(n));return fmt(n/10**e)+'\\cdot10^{'+e+'}';}
function ui(){
 updateRareButton();
 $('lesson').textContent=fusion?(fusion.plan?'Vybraný směr odletu; nejde o náhodný vzorek úhlů reakce.':'Vybraný výstupní kanál, nikoli výpočet četnosti reakcí. Směry a rozdělení energie tří produktů jsou názorný příklad se zachováním energie a hybnosti.'):demoActive?'Vybraný úspěšný případ. Pohyb a délka efektu nejsou skutečnou dráhou ani dobou tunelování.':$('interaction').value==='drag'?'Ruční tah vybírá polohy dostupné při zvolené energii; další energii nepřidává. Volný pohyb ukazuje dělo.':'Nižší energie znamená širší bariéru a vzácnější průchod, nikoli ostrý práh. Prostupnost není pravděpodobnost fúze.';tex($('temperatureValue'),'T='+fmt(temperature)+'\\,\\mathrm{MK}');tex($('angleValue'),(angle*180/Math.PI).toFixed(3).replace('.', '{,}')+'^{\\circ}');const pair=null,r=M.nearest(centers,x,y).distance;tex($('distance'),(pair?'r_{\\mathrm{detail}}=':'r=')+fmt(r)+'\\,\\mathrm{fm}');tex($('values'),'\\langle E\\rangle='+fmt(M.thermalMean(temperature))+'\\,\\mathrm{keV}');delete $('turning').dataset.texValue;delete $('probability').dataset.texValue;$('reactionFormula').hidden=!fusion;const closest=shot.closest;
 if(Number.isFinite(closest)){tex($('turning'),String.raw`r_{\min,\mathrm{klas.}}=`+fmt(Math.max(p.R,closest))+String.raw`\,\mathrm{fm}`);}else{$('turning').textContent='Bod obratu: —';}
 if(probability===null||!Number.isFinite(probability)){$('probability').textContent='';}
 else if(centers.length===1&&shot.rmin<=p.R){$('probability').textContent='Klasický průchod';}
 else{tex($('probability'),String.raw`P_{\mathrm{WKB}}\approx `+scientific(probability));}
 tex($('statistics'),'N='+attempts+'\\quad N_{\\mathrm{tunel}}='+passes+'\\quad N_{\\mathrm{klas.}}='+classical);if(fusion){tex($('reactionFormula'),fusion.reaction.tex);tex($('probability'),'Q='+fmt(fusion.reaction.Q/1000)+String.raw`\,\mathrm{MeV}`);tex($('turning'),fusion.reaction.elastic?String.raw`\text{Pružný rozptyl; bez trvalého sloučení}`:fusion.reaction.weak?String.raw`\text{Vybraná vzácná slabá přeměna}`:String.raw`\text{Vybraný výstupní kanál reakce}`);} graph();}


function schematicItems(items){return items.map((item,layoutIndex)=>({...item,layoutIndex}));}
function currentGlyphs(){return schematicItems([{id:$('projectile').value,x:projectilePoint()[0],y:projectilePoint()[1],radius:displayRadius()},...centers.map(t=>({id:targetKind(t),x:project(t.x,t.y)[0],y:project(t.x,t.y)[1],radius:displayRadius()}))]);}
function legibleMainGlyphs(items){
 if(mode==='tunnel'||fusion?.phase==='compound')return items;
 const result=schematicItems(items);
 result.forEach(item=>{if(item.labelKey){nucleus(item.id,item.x,item.y,item.labelKey,null,item.radius);for(const el of $('labels').querySelectorAll('[data-key^="'+item.labelKey+'"]'))el.hidden=false;}
 if(item.labelKey==='b'){ctx.save();ctx.strokeStyle='#8050b8';ctx.lineWidth=1.5;ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(item.x,item.y,item.radius*visualBound(item.id)+3,0,Math.PI*2);ctx.stroke();ctx.restore();}});return result;
}
let uiSince=0;
function frame(t){const dt=old?Math.min(.05,(t-old)/1000):0;old=t;if(document.hidden){requestAnimationFrame(frame);return;}
 if(!paused&&playbackCursor===null)updateAutomaticPlayback(dt);
 const replaying=replayPlayback(dt);
 if(!paused&&!replaying&&(playbackSpeed>0||mode==='drag'||mode==='recoil'||mode==='free')){if(!reduced.matches)renderTime+=dt*Math.abs(playbackSpeed)/.1;if(fusion){advanceFusion(dt);}else if(mode==='tunnel'){tunnelTime+=dt*Math.max(0,playbackSpeed)/.1;if(tunnelTime>=tunnelApproachLength()&&!tunnelSoundStarted){tunnelSoundStarted=true;playTunnelSound();}if(tunnelTime>=tunnelApproachLength()+tunnelDuration*.8){x=tunnelTo[0];y=tunnelTo[1];vx=vy=0;mode='nuclear';if(activeReaction()&&$('fusionEnabled').checked)beginFusion();else status($('pairPreset').value==='proton|proton'?'Průchod bariérou p–p. Slabou přeměnu potřebnou pro fúzi tento model nepočítá.':batchNote||'Průchod do jaderné oblasti. Fúzi a její produkty přidáme v dalším kroku.');}}
 else if(mode==='recoil'&&recoil){recoil.time+=dt;const f=Math.min(1,recoil.time/.55),ease=1-(1-f)**3,points=recoil.points,index=ease*(points.length-1),i=Math.min(points.length-2,Math.floor(index));if(i>=0){const t=index-i;x=points[i][0]+(points[i+1][0]-points[i][0])*t;y=points[i][1]+(points[i+1][1]-points[i][1])*t;}if(f===1){recoil=null;mode=drag?'drag':'ready';const point=currentGlyphs()[0];if(point.x<35||point.x>W-35||point.y<100||point.y>H-70)fitAllParticles();if($('interaction').value==='gun')armGun(true);else status('Mez přiblížení aktualizována.');}}

 else if(mode==='drag'&&drag){syncActivePair();const next=manualApproach(dt);x=next.x;y=next.y;targetIndex=M.nearest(centers,x,y).index;updateHum();}
 else if(['flight','free'].includes(mode)){const rate=mode==='free'?shot.start*.025/Math.sqrt(2*M.thermalMean(100)/1.2):playbackRate(),duration=dt*rate/Math.max(1,collisionZoom);flightAccumulator+=duration;let ticks=0;while(flightAccumulator>1e-10&&ticks++<2000&&['flight','free'].includes(mode)){const h=Math.min(shot.dt,flightAccumulator);step(h);flightAccumulator-=h;}if(mode==='flight'||mode==='done'){trail.push(tracePoint([{x,y,kind:$('projectile').value},...centers.map(t=>({x:t.x,y:t.y,kind:targetKind(t)}))]));if(trail.length>1200)trail.shift();}}
 }
 if(!paused&&!replaying&&playbackSpeed>0)recordPlayback(dt);
 if(!paused&&!replaying&&(playbackSpeed>0||mode==='free')&&['flight','free'].includes(mode))updateHum();else if(mode!=='drag')stopHum();
 view();advancePreview();scene();if(fusion&&painter){painter.draw(W,H,renderTime,legibleMainGlyphs(fusionGraphics()));}else if(painter){const radius=displayRadius(),items=centers.map((t,i)=>({id:targetKind(t),x:targetScreen(t,i)[0],y:targetScreen(t,i)[1],radius,labelKey:'a'+i+'-'}));if(mode==='tunnel'){const f=tunnelBlend(),point=tunnelVisualPoint(f.travel,f.t),smear=!reduced.matches&&f.t>.04&&f.t<.75;
 if(smear)for(let i=5;i>=1;i--){const ghost=tunnelVisualPoint(Math.max(0,f.travel-i*.06),f.t),spread=Math.sin(i*2.4+f.t*19)*radius*.10;items.push({id:$('projectile').value,x:ghost[0]+spread,y:ghost[1]+Math.cos(i*3.1)*radius*.08,radius,opacity:.17*(1-i/6)});}
 if(f.glitch){for(let i=0;i<10;i++)items.push({id:$('projectile').value,x:point[0]+Math.sin(i*17+Math.floor(f.t*70))*radius*.34,y:point[1],radius,opacity:.65+.25*(i%2),clipY:[i/10,(i+1)/10]});}
 else items.push({id:$('projectile').value,x:point[0],y:point[1],radius,opacity:reduced.matches?1:smear?.62:.96});
 }else items.push({id:$('projectile').value,x:projectilePoint()[0],y:projectilePoint()[1],radius,labelKey:'b'});painter.draw(W,H,renderTime,legibleMainGlyphs(items));}
 incomingSpeedLabel();
 if(mode==='tunnel'||t-uiSince>70){ui();uiSince=t;}requestAnimationFrame(frame);
}
window.coulombGlyphs=currentGlyphs;window.coulombProjectilePoint=projectilePoint;window.coulombTunnelContact=tunnelContactPoint;window.coulombProject=project;window.coulombUnproject=unproject;
window.coulombState=()=>({preparing:!!preparationJob,playbackSpeed,playbackUserOverride,playbackAutoSlowed,playbackHasProducts,playbackCursor,playbackHead,playbackFrameCount:playbackFrames.length,manualDisplay,tunnelGraph,tunnelApproachFrom,tunnelSoundStarted,collisionZoom,cell,preview,layoutDrag,fusion,x,y,vx,vy,mode,energy,temperature,angle,paused,zoom,scale,ox,oy,pair:p,shot,demoActive,demoPending,probability,attempts,passes,classical,tunnelTime,tunnelFrom,tunnelDisplayFrom,tunnelTo,centers,targetIndex,activePointer,layoutSeed,gunOrigin,gunHeading,aimTarget,previewLimit,releaseBounds,flightLimit:flightLimit(),displayRadius:displayRadius(),contactRadius:contactRadius(),targetBound:visualBound($('target').value),projectileBound:visualBound($('projectile').value)});
reset();requestAnimationFrame(frame);
})();
