(()=>{'use strict';
const $=id=>document.getElementById(id),M=CoulombModel,S=HiFyzikoParticleStyle,c=$('scene'),g=$('graph'),ctx=c.getContext('2d'),gc=g.getContext('2d');
const fmt=n=>n.toFixed(1).replace('.', '{,}'),tex=(el,s)=>{if(el.dataset.texValue!==s){el.innerHTML=katex.renderToString(s,{throwOnError:true});el.dataset.texValue=s;}};
for(const id of ['target','projectile'])for(const [key,n]of Object.entries(M.nuclei)){if(id==='target'&&key==='neutron')continue;const o=document.createElement('option');o.value=key;o.textContent=n.name;$(id).append(o);}
let painter;try{painter=new HiFyzikoNucleusView($('nuclei'));}catch(e){$('renderError').hidden=false;$('renderError').textContent=e.message;}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let p,shot,x=24,y=0,vx=0,vy=0,drag=null,aiming=false,mode='ready',energy=12.926,temperature=100,angle=0,paused=false,renderTime=0,old=0,W=0,H=0,scale=1,ox=0,oy=0,extent=36,preview=[],trail=[],probability=0,attempted=false,chosenOutcome=null,tunnelTime=0,tunnelFrom=null,attempts=0,passes=0,classical=0,batchNote='',zoom=1,panX=0,panY=0,activePointer=null,lastPointer=null,grabOffset=[0,0],aimAnchor=null,panning=false,centers=[],targetIndex=0,tunnelTo=null,recoil=null,tried=new Set(),layoutSeed=1,gunOrigin=[24,0],gunHeading=Math.PI,previewLimit=0,releaseBounds=null,aimTarget=0;
let fitPending=true,fusion=null,dtLocalEnergy=0,fusionExampleCount=0;
let rareEncounter=null,demoActive=false,demoPending=false,tunnelDisplayFrom=null,anticipated=new Map();
function clearEncounter(){if(fusion){$('labels').replaceChildren();lastPair='';}fusion=null;tunnelDisplayFrom=null;anticipated.clear();rareEncounter=null;demoActive=false;demoPending=false;batchNote='';updateRareButton();}
function isDT(){return p&&p.a.Z===1&&p.b.Z===1&&p.a.A+p.b.A===5&&p.a.A!==p.b.A;}
function updateRareButton(){const dt=isDT();$('fusionControl').hidden=!dt;$('temperature').disabled=!!fusion;$('fusionEnabled').disabled=!!fusion;const unavailable=!p||!p.C||!$('quantum').checked; $('showRare').disabled=unavailable||mode==='tunnel'||mode==='flight'||mode==='recoil'||!!fusion;$('launch').disabled=mode==='recoil'||!!fusion;$('showRare').textContent=demoPending?'Zrušit ukázku':isDT()&&$('fusionEnabled').checked?'Připravit fúzi D–T':'Připravit tunelování';$('showRare').setAttribute('aria-pressed',String(demoPending));$('showRare').title=unavailable?'Ukázka vyžaduje nabitou dvojici a zapnuté tunelování.':'Nastaví směr z aktuální polohy. Celou ukázku spustí tlačítko Vystřelit.';}
function status(text){if($('status').textContent!==text)$('status').textContent=text;}
function startTunnel(encounter,demo=false){
 unpause();unlockSound();stopSound();tunnelDisplayFrom=encounter.displayFrom||encounter.from;targetIndex=encounter.index;probability=encounter.probability;
 dtLocalEnergy=Math.max(0,energy-(M.multiPotential(p,centers,...encounter.from)-p.C/Math.hypot(encounter.from[0]-centers[encounter.index].x,encounter.from[1]-centers[encounter.index].y)));
 [x,y]=encounter.from;vx=vy=0;tunnelFrom=[...encounter.from];tunnelTo=[...encounter.to];tunnelTime=0;mode='tunnel';demoActive=demo;
 batchNote=demo?'Ukázka vzácného průchodu dokončena. Pravděpodobnost ani statistika pokusů se nezměnily.':'';
 $('showRare').disabled=true;playTunnelSound();status(demo?'UKÁZKA VZÁCNÉHO PRŮCHODU · vybraný úspěšný případ, nikoli výsledek losování.':'Průchod bariérou: úspěšný pravděpodobnostní pokus.');
}
function beginFusion(){
 const target=centers[targetIndex],ratio=p.b.A/(p.a.A+p.b.A),origin={x:target.x+(x-target.x)*ratio,y:target.y+(y-target.y)*ratio},center=project(origin.x,origin.y),targetPoint=project(target.x,target.y),incoming=tunnelContactPoint(),rad=displayRadius();
 const initial=[];for(const [id,point]of [[$('target').value,targetPoint],[$('projectile').value,incoming]])for(const atom of S.connected.atoms[id])initial.push([atom[0]+(point[0]-center[0])/rad,atom[1]-(point[1]-center[1])/rad,atom[2],atom[3]]);initial.sort((a,b)=>b[3]-a[3]);
 const neighbours=centers.map((t,i)=>({...t,id:i,A:p.a.A,Z:p.a.Z})).filter(t=>t.id!==targetIndex),guided=neighbours.length&&(fusionExampleCount++%2===0),plan=guided?HiFyzikoDT.planEncounter({...origin,energy:dtLocalEnergy,sources:neighbours},fusionExampleCount%4===1?1:-1):null,focus=plan?{x:(origin.x+plan.target.x)*.5,y:(origin.y+plan.target.y)*.5}:origin,focusScreen=project(focus.x,focus.y);
 fusion={phase:'compound',time:0,screenOrigin:[focusScreen[0]/W,focusScreen[1]/H],origin,focus,plan,duration:9,initial,angle:plan?plan.angle:Math.random()*Math.PI*2,products:null,trail:[[],[]],sourceTrails:{},flightTime:0};mode='compound';$('labels').replaceChildren();lastPair='';fieldKey='';status('D–T: přechodné jádro helia-5. Vnitřní pohyb je zpomalená ilustrace.');
}
function compoundAtoms(){
 const u=Math.min(1,fusion.time/.65),gather=Math.min(1,u/.24),blend=gather*gather*(3-2*gather),split=Math.max(0,(u-.74)/.26),e=split*split*(3-2*split),a=fusion.angle,dx=Math.cos(a),dy=-Math.sin(a);
 const atoms=fusion.initial.map((atom,i)=>{const angle=i*Math.PI*2/5+(reduced.matches?0:u*1.2),amp=reduced.matches?0:.16*Math.sin(Math.PI*u),ring=[.88*Math.cos(angle)+amp*Math.sin(23*u+i*2.7),.88*Math.sin(angle)+amp*Math.cos(29*u+i*1.9),(reduced.matches?0:.12*Math.sin(19*u+i*2)),atom[3]],end=i<4?[S.connected.atoms.alpha[i][0],S.connected.atoms.alpha[i][1],0,atom[3]]:[0,0,0,0];return [0,1,2].map(k=>(atom[k]*(1-blend)+ring[k]*blend)*(1-e)+end[k]*e).concat(atom[3]);});
 return atoms;
}
function emitProducts(){
 const sources=centers.map((t,i)=>({...t,id:i,A:p.a.A,Z:p.a.Z})).filter(t=>t.id!==targetIndex);
 fusion.products=HiFyzikoDT.create({...fusion.origin,energy:dtLocalEnergy,angle:fusion.angle,sources});fusion.phase='products';mode='products';playFusionSound();view();const neutron=fusion.products.products[1],v=HiFyzikoDT.velocity(neutron),speed=Math.hypot(...v),margin=displayRadius()*visualBound('alpha')+35,rx=Math.max(30,W/2-margin-20),ry=Math.max(25,(H-130)/2-margin),travel=.9*Math.min(rx/Math.max(.001,Math.abs(v[0]/speed)),ry/Math.max(.001,Math.abs(v[1]/speed)));fusion.timeScale=fusion.plan?fusion.plan.time*1.8/fusion.duration:travel/(scale*speed*3.4);fieldKey='';$('labels').replaceChildren();lastPair='';status(fusion.plan?'Vybraný směr: alfa částice míjí okolní iont. Odklon a zpětný ráz určuje výpočet.':'Fúze D–T: alfa částice a neutron. Prodloužené sledování produktů ve společném měřítku času.');
}
function detailPair(){if(!fusion?.detail||!fusion.products)return null;const all=[...fusion.products.products,...fusion.products.sources];return fusion.detail.ids.map(id=>all.find(b=>b.id===id));}
function updateEncounterDetail(dt){
 if(!fusion.products)return false;
 if(fusion.detail){const d=fusion.detail,pair=detailPair();d.age+=dt;
  if(d.stage==='enter'){if(d.age>=.28){d.stage='active';d.age=0;}return true;}
  if(d.stage==='exit'){if(d.age>=.28){fusion.detail=null;}return true;}
  const [a,b]=pair,r=Math.hypot(a.x-b.x,a.y-b.y),va=HiFyzikoDT.velocity(a),vb=HiFyzikoDT.velocity(b),radial=(a.x-b.x)*(va[0]-vb[0])+(a.y-b.y)*(va[1]-vb[1]);
  if(radial>0&&r>d.R*8){d.stage='exit';d.age=0;d.from=[scale,ox,oy];return true;}
  return false;
 }
 const all=[...fusion.products.products,...fusion.products.sources];let choice=null;
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){if(i===0&&j===1)continue;const a=all[i],b=all[j],r=Math.hypot(a.x-b.x,a.y-b.y),va=HiFyzikoDT.velocity(a),vb=HiFyzikoDT.velocity(b),approach=(a.x-b.x)*(va[0]-vb[0])+(a.y-b.y)*(va[1]-vb[1])<0,extent=displayRadius()*(visualBound(typeof a.id==='string'?a.id:$('target').value)+visualBound(typeof b.id==='string'?b.id:$('target').value));if(approach&&r*scale<extent*2.5&&(!choice||r/extent<choice.r/choice.extent))choice={a,b,r,extent};}
 if(choice){const {a,b}=choice;fusion.detail={ids:[a.id,b.id],R:1.4*(Math.cbrt(a.A)+Math.cbrt(b.A)),stage:'enter',age:0,from:[scale,ox,oy]};status('Detail setkání: zvětšené vzdálenosti, stejné fyzikální síly.');return true;}return false;
}
function encounterView(){
 if(!fusion?.detail)return;const d=fusion.detail,pair=detailPair();if(!pair?.[0]||!pair[1])return;const [a,b]=pair,r=Math.hypot(a.x-b.x,a.y-b.y),extent=displayRadius()*(visualBound(typeof a.id==='string'?a.id:$('target').value)+visualBound(typeof b.id==='string'?b.id:$('target').value)),desired=Math.max(scale,Math.min(extent/d.R,extent*2/Math.max(r,.001))),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,goal=[desired,W/2-cx*desired,75+(H-130)/2-cy*desired];
 if(d.stage==='active'){[scale,ox,oy]=goal;return;}const u=Math.min(1,d.age/.28),ease=u*u*(3-2*u),end=d.stage==='exit'?[scale,ox,oy]:goal;[scale,ox,oy]=d.from.map((value,i)=>value+(end[i]-value)*ease);
}
function advanceFusion(dt){
 if(fusion.phase==='compound'){fusion.time+=dt;if(fusion.time>=.65)emitProducts();return;}
 if(fusion.phase!=='products')return;
 if(updateEncounterDetail(dt))return;
 const pair=detailPair(),relativeSpeed=pair?Math.hypot(...HiFyzikoDT.velocity(pair[0]).map((v,i)=>v-HiFyzikoDT.velocity(pair[1])[i])):0,clockRate=pair?Math.min(fusion.timeScale,95/(scale*Math.max(relativeSpeed,1e-8))):fusion.timeScale;
 let remaining=dt*clockRate;for(let i=0;i<2000&&remaining>1e-8;i++){const h=HiFyzikoDT.advance(fusion.products,Math.min(remaining,1));if(!h)break;remaining-=h;}
 fusion.flightTime+=dt;fusion.products.products.forEach((b,i)=>{fusion.trail[i].push([b.x,b.y]);if(fusion.trail[i].length>1500)fusion.trail[i].shift();});
 for(const b of fusion.products.sources){const points=fusion.sourceTrails[b.id]||(fusion.sourceTrails[b.id]=[]);points.push([b.x,b.y]);if(points.length>1500)points.shift();}
 if(fusion.products.collision||fusion.products.time>=fusion.timeScale*fusion.duration){fusion.phase='done';mode='productsDone';status(fusion.products.collision?'Další jaderný střet: zde ukázka končí, následné reakce zatím nepočítáme.':'Zastavený náhled produktů. Nabitá jádra se vzájemně odpuzují; neutron se elektricky neodklání.');}
}
function fusionGraphics(){
 const items=[],radius=displayRadius();centers.forEach((fixed,i)=>{if(i===targetIndex)return;const t=fusion.products?fusion.products.sources.find(b=>b.id===i):fixed;const point=project(t.x,t.y);items.push({id:$('target').value,x:point[0],y:point[1],radius});nucleus($('target').value,...point,'a'+i+'-');});
 if(fusion.phase==='compound'){const point=project(fusion.origin.x,fusion.origin.y),atoms=compoundAtoms();items.push({atoms,x:point[0],y:point[1],radius,vibration:1.8});nucleus('alpha',...point,'compound-',atoms);label($('labels'),'reaction',String.raw`{}^{5}\mathrm{He}^{*}`,point[0],point[1]-radius*3.2);}
 else {fusion.products.products.forEach((b,i)=>{const point=project(b.x,b.y),outside=point[0]<15||point[0]>W-15||point[1]<75||point[1]>H-55;
 if(!outside){items.push({id:b.id,x:point[0],y:point[1],radius});nucleus(b.id,...point,'product'+i+'-');}
 for(const el of $('labels').querySelectorAll('[data-key^="product'+i+'-"]'))el.hidden=outside;
 const energyMeV=HiFyzikoDT.kinetic(b)/1000,text=(i===0?String.raw`\alpha:\ `:String.raw`\mathrm n:\ `)+fmt(energyMeV)+String.raw`\,\mathrm{MeV}`+(outside?String.raw`\;\text{mimo záběr}`:'');
 label($('labels'),'energy'+i,text,outside?Math.max(115,Math.min(W-115,point[0])):point[0],outside?Math.max(90,Math.min(H-60,point[1])):point[1]+radius*2.6);
 });}

 for(const el of $('labels').querySelectorAll('.nucleon')){const px=parseFloat(el.style.left),py=parseFloat(el.style.top);el.hidden=px<0||px>W||py<65||py>H-45;}
 return items;
}
function optimalHeading(index){
 const t=centers[index],base=Math.atan2(t.y-y,t.x-x),speed=Math.sqrt(2*Math.max(0,energy-M.multiPotential(p,centers,x,y))/p.mu);
 const score=heading=>{const state={x,y,vx:speed*Math.cos(heading),vy:speed*Math.sin(heading)};let best=Infinity;for(let i=0;i<14000;i++){M.multiAdvance(p,centers,state,shot.dt*2);const distance=Math.hypot(state.x-t.x,state.y-t.y);if(distance<best)best=distance;else if(i>5)break;if(distance<=p.R)break;}return best;};
 let angleBest=base,best=score(base),step=.04;
 for(let i=-12;i<=12;i++){const candidate=base+i*step,value=score(candidate);if(value<best){best=value;angleBest=candidate;}}
 for(let i=0;i<19;i++){const l=score(angleBest-step),r=score(angleBest+step);if(l<best&&l<=r){angleBest-=step;best=l;}else if(r<best){angleBest+=step;best=r;}step*=.5;}return angleBest;
}
$('fusionEnabled').onchange=()=>{clearEncounter();updateRareButton();};
$('showRare').onclick=()=>{
 if(!p.C||mode==='tunnel')return;
 if(demoPending){demoPending=false;status('Běžný výstřel: výsledek určí fyzikální pravděpodobnost.');return;}
 const index=M.nearest(centers,x,y).index;
 $('interaction').value='gun';$('quantum').checked=true;armGun(true);
 if(!shot.canLaunch)return;
 aimTarget=index;gunHeading=optimalHeading(index);angle=0;$('angle').value=0;armGun(false);targetIndex=index;demoPending=true;
 status('UKÁZKA PŘIPRAVENA · směr je nastaven. Stiskni Vystřelit: uvidíš celý vybraný úspěšný střet.');
};
function unpause(){paused=false;$('pause').textContent='Pozastavit';$('pause').setAttribute('aria-pressed','false');}
function home(){fitPending=true;clearEncounter();unpause();updateMode();shot=M.multiShot(p,energy,angle,Math.max(1,Math.min(3,+$('targetCount').value||3)),layoutSeed);centers=shot.centers;targetIndex=0;aimTarget=0;tried=new Set();recoil=null;({x,y,vx,vy}=shot);vx=vy=0;gunOrigin=[x,y];gunHeading=Math.atan2(centers[0].y-y,centers[0].x-x);extent=shot.start*1.4;previewLimit=0;probability=centers.length>1?null:M.penetration(p,shot);preview=M.multiTrajectory(p,shot);shot.closest=Math.min(...preview.map(q=>M.nearest(centers,...q).distance));trail=[];drag=null;attempted=false;chosenOutcome=null;mode='ready';tunnelTime=0;tunnelFrom=null;tunnelTo=null;stopSound();updateRareButton();status($('interaction').value==='gun'?'Zamiř tažením ve scéně, potom vystřel.':'Uchop částici. Dostupná energie omezuje přiblížení.');}
function flightLimit(){if(!W||!H)return extent;const corners=[[0,0],[W,0],[0,H],[W,H]].map(([px,py])=>Math.hypot((px-ox)/scale,(py-oy)/scale));return Math.max(extent,Math.hypot(...gunOrigin)*1.15,...corners.map(r=>r*1.15));}
function refreshPreview(){const limit=flightLimit();preview=M.multiTrajectory(p,shot,limit);shot.closest=Math.min(...preview.map(q=>M.nearest(centers,...q).distance));previewLimit=limit;}
function armGun(capture=true){clearEncounter();unpause();stopSound();updateMode();if(capture){gunOrigin=[x,y];}x=gunOrigin[0];y=gunOrigin[1];vx=vy=0;drag=null;recoil=null;mode='ready';tunnelFrom=tunnelTo=null;tunnelTime=0;trail=[];tried=new Set();const potential=M.multiPotential(p,centers,x,y),kinetic=Math.max(0,energy-potential),speed=Math.sqrt(2*kinetic/p.mu),heading=gunHeading-angle;shot={...shot,x,y,vx:speed*Math.cos(heading),vy:speed*Math.sin(heading),angle,aimTarget,energy,canLaunch:kinetic>1e-8,centers};shot.L=p.mu*(shot.x*shot.vy-shot.y*shot.vx);shot.B=shot.L**2/(2*p.mu);shot.rmin=(p.C+Math.sqrt(p.C**2+4*energy*shot.B))/(2*energy);probability=centers.length===1?M.penetration(p,shot):null;syncView();if(shot.canLaunch)refreshPreview();else{preview=[[x,y]];shot.closest=M.nearest(centers,x,y).distance;}status(shot.canLaunch?'Dělo je v aktuální poloze částice. Zamiř a vystřel.':'V tomto místě nezbývá pohybová energie. Zvyš teplotu nebo částici oddal.');}

function syncChoices(){document.querySelectorAll('[name="interactionChoice"]').forEach(input=>input.checked=input.value===$('interaction').value);document.querySelectorAll('[name="countChoice"]').forEach(input=>input.checked=input.value===$('targetCount').value);}
for(const input of document.querySelectorAll('[name="interactionChoice"]'))input.addEventListener('change',()=>{if(input.checked){$('interaction').value=input.value;$('interaction').onchange();}});
for(const input of document.querySelectorAll('[name="countChoice"]'))input.addEventListener('change',()=>{if(input.checked){$('targetCount').value=input.value;$('targetCount').onchange();}});
function updateMode(){syncChoices();const gun=$('interaction').value==='gun';document.querySelector('.sceneTitle h2').textContent=gun?'Zamiř. Vystřel. Sleduj odklon.':'Přibliž jádra proti odpudivé síle';document.querySelector('.sceneTitle p').textContent=gun?'Hlaveň míří přímo ke kurzoru. Rovně: výstřel · přerušovaně: dráha v poli.':'Uchop částici. Čím blíž k jádru, tím více zaostává za kurzorem. Kolečko mění zoom; tažením prázdného místa posuneš pohled.';$('launch').hidden=!gun;$('pause').hidden=!gun;$('angle').closest('label').hidden=!gun;}
function clearStats(){attempts=passes=classical=0;batchNote='';}
function pair(){p=M.pair($('target').value,$('projectile').value);clearStats();home();}
function reset(){layoutSeed=(Math.random()*4294967296)>>>0;$('targetCount').value='3';$('pairPreset').value='triton|deuteron';$('target').value='triton';$('projectile').value='deuteron';$('temperature').value=100;$('lineStyle').value='source';$('angle').value=0;$('interaction').value='drag';zoom=1;panX=panY=0;$('quantum').checked=$('field').checked=$('arrows').checked=true;temperature=100;energy=1.5*M.kB*temperature;angle=0;pair();}
function updateEnergy(){
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
  recoil={points,time:0};mode='recoil';status('Nižší energie: jádro se plynule vzdaluje k nové hranici přiblížení.');
 }else status('Teplota změněna. Polohy zůstávají; nová energie mění dostupné přiblížení.');
 fieldKey='';updateRareButton();
}
$('temperature').oninput=updateEnergy;
$('shuffle').onclick=()=>{layoutSeed=(Math.random()*4294967296)>>>0;zoom=1;panX=panY=0;home();};
$('pairPreset').onchange=()=>{const [target,projectile]=$('pairPreset').value.split('|');$('target').value=target;$('projectile').value=projectile;pair();};
function snapAngle(degrees){return Math.round((((degrees+180)%360+360)%360-180)*1000)/1000;}
$('angle').oninput=()=>{angle=snapAngle(+$('angle').value)*Math.PI/180;$('angle').value=angle*180/Math.PI;clearStats();armGun(false);};
$('target').onchange=$('projectile').onchange=$('targetCount').onchange=pair;$('reset').onclick=reset;$('home').onclick=()=>{batchNote='';home();};$('interaction').onchange=()=>{if($('interaction').value==='gun')armGun(true);else{release();clearEncounter();vx=vy=0;mode='ready';updateMode();}};
$('quantum').onchange=()=>{clearStats();if($('interaction').value==='gun')armGun(mode!=='ready');else home();};
function launch(outcome=null){const demonstration=demoPending;unlockSound();armGun(true);if(!shot.canLaunch)return;demoActive=demonstration;if(demonstration){fitAllParticles();}chosenOutcome=outcome;({x,y,vx,vy}=shot);mode='flight';status(demoActive?'UKÁZKA VZÁCNÉHO STŘETU · přiblížení a zpomalení před vybraným průchodem.':'Běžný výstřel: částice letí, výsledek průchodu není zaručen.');}
$('launch').onclick=()=>{batchNote='';launch();};
$('pause').onclick=()=>{paused=!paused;if(paused)stopSound();$('pause').textContent=paused?'Pokračovat':'Pozastavit';$('pause').setAttribute('aria-pressed',String(paused));};
$('full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});};
function syncView(){const rect=c.getBoundingClientRect();W=rect.width;H=rect.height;view();}
function baseView(){const points=[...centers,{x:shot.start,y:0}],minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y)),padding=Math.max(35,Math.min(W,H)*.22),width=Math.max(1,W-padding*2),height=Math.max(1,H-110-padding*2),base=Math.min(width/Math.max(shot.start*.5,maxX-minX),height/Math.max(shot.start*.55,maxY-minY));scale=Math.max(.00001,base)*zoom;ox=W/2-(minX+maxX)/2*scale+panX*W;oy=65+padding+height/2-(minY+maxY)/2*scale+panY*H;}
function fitAllParticles(){
 const rect=c.getBoundingClientRect();W=rect.width;H=rect.height;if(W<1||H<120)return;
 zoom=1;panX=panY=0;view();
 const bounds=()=>{const items=[...centers.map(t=>({x:t.x,y:t.y,id:$('target').value})),{x,y,id:$('projectile').value}],edges=items.map(t=>{const q=project(t.x,t.y),radius=displayRadius()*visualBound(t.id)+10;return {left:q[0]-radius,right:q[0]+radius,top:q[1]-radius,bottom:q[1]+radius};});return {left:Math.min(...edges.map(e=>e.left)),right:Math.max(...edges.map(e=>e.right)),top:Math.min(...edges.map(e=>e.top)),bottom:Math.max(...edges.map(e=>e.bottom))};};
 const left=20,right=W-20,top=76,bottom=H-55;
 for(let i=0;i<3;i++){let b=bounds();zoom*=Math.min(1,(right-left)/Math.max(1,b.right-b.left),(bottom-top)/Math.max(1,b.bottom-b.top))*.98;view();b=bounds();panX+=((left+right-b.left-b.right)/2)/W;panY+=((top+bottom-b.top-b.bottom)/2)/H;view();}
 fitPending=false;fieldKey='';
}
function fusionWarp(){if(!fusion)return 1;if(fusion.phase!=='compound')return 0;const u=Math.min(1,fusion.time/.65);return 1-u*u*(3-2*u);}
function view(){baseView();if(fusion){const u=1-fusionWarp(),start=fusion.screenOrigin,desired=[start[0]*W*(1-u)+W*.5*u,start[1]*H*(1-u)+(75+(H-130)/2)*u],point=project((fusion.focus||fusion.origin).x,(fusion.focus||fusion.origin).y);ox+=desired[0]-point[0];oy+=desired[1]-point[1];encounterView();}}
$('viewReset').onclick=fitAllParticles;
c.closest('.scene').addEventListener('wheel',e=>{e.preventDefault();syncView();if(!W||!H)return;const rect=c.getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top,[wx,wy]=unproject(px,py),delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?H:1);zoom=Math.max(.08,Math.min(40,zoom*Math.exp(-delta*.0015)));view();const anchor=project(wx,wy);panX+=(px-anchor[0])/W;panY+=(py-anchor[1])/H;view();if(drag&&lastPointer){const q=position(lastPointer);drag=[q[0]-grabOffset[0],q[1]-grabOffset[1]];}fieldKey='';if($('interaction').value==='gun'&&shot.canLaunch!==false)refreshPreview();},{passive:false});
function position(e){syncView();const r=c.getBoundingClientRect();return unproject(e.clientX-r.left,e.clientY-r.top);}
function aimAtPointer(e){syncView();const rect=c.getBoundingClientRect(),origin=project(...gunOrigin),dx=e.clientX-rect.left-origin[0],dy=e.clientY-rect.top-origin[1];if(Math.hypot(dx,dy)<16)return;const heading=Math.atan2(dy,dx);angle=snapAngle((gunHeading-heading)*180/Math.PI)*Math.PI/180;$('angle').value=angle*180/Math.PI;clearStats();armGun(false);}
function visualBound(id){const bound=Math.max(...S.connected.atoms[id].map(a=>Math.hypot(...a.slice(0,3))+1.16));return 13.76*bound/Math.sqrt(13.76**2-bound**2);}
function baseRadius(){return Math.min(W,H)*.028*zoom;}
function contactRadius(){return (displayRadius()*(visualBound($('target').value)+visualBound($('projectile').value))*1.08+8*zoom)/Math.max(scale,.00001);}
function displayRadius(){return baseRadius();}
// Smooth, invertible schematic enlargement around every fixed nucleus.
// Its Jacobian is positive definite; physical coordinates and energies are untouched.
function project(wx,wy){
 if(fusion&&fusion.phase!=='compound')return [ox+wx*scale,oy+wy*scale];
 const u=wx*scale,v=wy*scale,A=displayRadius()*(visualBound($('target').value)+visualBound($('projectile').value))*1.55*fusionWarp(),soft=Math.max(.001,(p.C?p.C/M.thermalMean(200):p.R)*scale*.1);let X=ox+u,Y=oy+v;
 for(const t of centers){const dx=u-t.x*scale,dy=v-t.y*scale,r=Math.hypot(dx,dy,soft);X+=A*dx/r;Y+=A*dy/r;}return [X,Y];
}
function unproject(X,Y){
 if(fusion&&fusion.phase!=='compound')return [(X-ox)/scale,(Y-oy)/scale];
 let u=(X-ox)/scale,v=(Y-oy)/scale;
 const A=displayRadius()*(visualBound($('target').value)+visualBound($('projectile').value))*1.55*fusionWarp(),soft=Math.max(.001,(p.C?p.C/M.thermalMean(200):p.R)*scale*.1);
 for(let k=0;k<35;k++){const q=project(u,v),ex=q[0]-X,ey=q[1]-Y;if(Math.hypot(ex,ey)<1e-6)break;let xx=1,yy=1,xy=0;for(const t of centers){const dx=(u-t.x)*scale,dy=(v-t.y)*scale,r=Math.hypot(dx,dy,soft),h=A/(r*r*r);xx+=h*(dy*dy+soft*soft);yy+=h*(dx*dx+soft*soft);xy-=h*dx*dy;}const det=xx*yy-xy*xy,du=(yy*ex-xy*ey)/det/scale,dv=(xx*ey-xy*ex)/det/scale;let step=1;const error=Math.hypot(ex,ey);for(let j=0;j<20;j++){const next=project(u-du*step,v-dv*step);if(Math.hypot(next[0]-X,next[1]-Y)<error)break;step*=.5;}u-=du*step;v-=dv*step;}return [u,v];
}

function hitParticle(q){const pointer=project(...q),center=project(x,y);return Math.hypot(pointer[0]-center[0],pointer[1]-center[1])<=displayRadius()*visualBound($('projectile').value)+8;}
c.onpointerdown=e=>{if(mode==='recoil'||fusion)return;if(![0,1,2].includes(e.button)||e.isPrimary===false)return;if(activePointer!==null)release();unlockSound();const q=position(e);activePointer=e.pointerId;lastPointer={clientX:e.clientX,clientY:e.clientY};aimAnchor={clientX:e.clientX,clientY:e.clientY,angle,panX,panY};
if(e.button!==0){panning=true;}
else if($('interaction').value==='gun'){if(mode!=='ready')armGun(true);aiming=true;aimAtPointer(e);}
else if(hitParticle(q)){releaseBounds=null;recoil=null;grabOffset=[q[0]-x,q[1]-y];drag=[x,y];mode='drag';vx=vy=0;unpause();}
else panning=true;
e.preventDefault();c.focus({preventScroll:true});c.setPointerCapture(e.pointerId);};
c.onpointermove=e=>{if(activePointer===null||(e.pointerId!==undefined&&e.pointerId!==activePointer))return;lastPointer={clientX:e.clientX,clientY:e.clientY};
if(panning){syncView();panX=aimAnchor.panX+(e.clientX-aimAnchor.clientX)/W;panY=aimAnchor.panY+(e.clientY-aimAnchor.clientY)/H;view();fieldKey='';}
else if(aiming){aimAtPointer(e);}
else if(drag){const q=position(e);drag=[q[0]-grabOffset[0],q[1]-grabOffset[1]];}};
function release(e){if(e&&e.pointerId!==undefined&&activePointer!==null&&e.pointerId!==activePointer)return;const held=drag!==null;activePointer=null;lastPointer=null;panning=false;aiming=false;aimAnchor=null;stopHum();if(!held)return;drag=null;vx=vy=0;recoil=null;syncView();const margin=Math.min(W*.25,H*.2,Math.max(28,displayRadius()*visualBound($('projectile').value)+12));releaseBounds={left:(margin-ox)/scale,right:(W-margin-ox)/scale,top:(65+margin-oy)/scale,bottom:(H-45-margin-oy)/scale};mode='free';status('Po puštění částici dál odpuzuje společné elektrické pole.');}
c.onpointerup=release;c.onpointercancel=release;c.onlostpointercapture=e=>{if(activePointer!==null&&(!c.hasPointerCapture||!c.hasPointerCapture(activePointer)))release(e);};
window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',()=>release());
c.addEventListener('contextmenu',e=>e.preventDefault());
c.onkeydown=e=>{if(mode==='recoil')return;if(!e.key.startsWith('Arrow'))return;unlockSound();e.preventDefault();if($('interaction').value==='gun'){angle=snapAngle(angle*180/Math.PI+(e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:1)*(e.shiftKey?.001:.01))*Math.PI/180;$('angle').value=angle*180/Math.PI;clearStats();armGun(false);}else{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];drag=[x+extent*.04*d[0],y+extent*.04*d[1]];mode='drag';}};c.onkeyup=release;
function predictCloseEncounter(index){
 const state={x,y,vx,vy},t=centers[index];let radial=(x-t.x)*vx+(y-t.y)*vy;
 for(let i=0;i<14000;i++){
 M.multiAdvance(p,centers,state,shot.dt*2);const near=M.nearest(centers,state.x,state.y),next=(state.x-t.x)*state.vx+(state.y-t.y)*state.vy;
 if(near.distance<=p.R)return null;
 if(radial<0&&next>=0){if(near.index!==index)return null;const localEnergy=Math.max(.001,energy-(M.multiPotential(p,centers,state.x,state.y)-p.C/near.distance)),L=p.mu*((state.x-t.x)*state.vy-(state.y-t.y)*state.vx),B=L*L/(2*p.mu),rmin=(p.C+Math.sqrt(p.C*p.C+4*localEnergy*B))/(2*localEnergy),prob=M.penetration(p,{energy:localEnergy,B,rmin}),head=M.penetration(p,{energy:localEnergy,B:0,rmin:p.C/localEnergy});
 if(!(prob>0&&prob>=.1*head))return null;
 return {index,probability:prob,from:[state.x,state.y],to:[t.x+(state.x-t.x)*p.R/near.distance,t.y+(state.y-t.y)*p.R/near.distance],displayFrom:[x,y]};}
 if(near.index!==index)return null;radial=next;
 }return null;
}
function step(dt){
 if(!['flight','free'].includes(mode))return;
 const before=centers.map(t=>(x-t.x)*vx+(y-t.y)*vy),state={x,y,vx,vy};M.multiAdvance(p,centers,state,dt);({x,y,vx,vy}=state);
 if(mode==='free'&&releaseBounds){const b=releaseBounds,screen=project(x,y),left=ox+b.left*scale,right=ox+b.right*scale,top=oy+b.top*scale,bottom=oy+b.bottom*scale;if(screen[0]<left||screen[0]>right||screen[1]<top||screen[1]>bottom){[x,y]=unproject(Math.max(left,Math.min(right,screen[0])),Math.max(top,Math.min(bottom,screen[1])));vx=vy=0;mode='ready';status('Částice je u okraje pracovní plochy. Můžeš ji znovu uchopit.');return;}}
 const near=M.nearest(centers,x,y);targetIndex=near.index;
 // A tiny visual lead-in to the actual turning point, independent of zoom and icon size.
 if(mode==='flight'&&demoActive&&!reduced.matches&&before[near.index]<0){
 if(!anticipated.has(near.index))anticipated.set(near.index,predictCloseEncounter(near.index));
 const predicted=anticipated.get(near.index);
 if(predicted){const turningDistance=Math.hypot(predicted.from[0]-near.target.x,predicted.from[1]-near.target.y);
 if(near.distance<=turningDistance*1.03){aimTarget=near.index;startTunnel({...predicted,displayFrom:[x,y]},true);return;}}
 }

 if(near.distance<=p.R){const demonstration=demoActive;clearEncounter();if(!demonstration){attempts++;classical++;}mode='nuclear';vx=vy=0;status('Dosažena jaderná oblast. Výsledek reakce zatím nepočítáme.');return;}
 if(mode==='flight'){const t=near.target,radial=(x-t.x)*vx+(y-t.y)*vy;if(!tried.has(near.index)&&before[near.index]<0&&radial>=0&&(near.distance<shot.start*.7||demoActive)){tried.add(near.index);if(!demoActive)attempts++;
 const localEnergy=Math.max(.001,energy-(M.multiPotential(p,centers,x,y)-M.potential(p,near.distance))),L=p.mu*((x-t.x)*vy-(y-t.y)*vx),B=L*L/(2*p.mu),rmin=(p.C+Math.sqrt(p.C*p.C+4*localEnergy*B))/(2*localEnergy);probability=M.penetration(p,{energy:localEnergy,B,rmin});
 // Eligibility is a presentation rule, not a new physical tunnelling threshold.
 // Never force a long sideways jump: prefer a near-head-on, genuinely accessible encounter.
 const headOnProbability=M.penetration(p,{energy:localEnergy,B:0,rmin:p.C/localEnergy}),credible=probability>0&&probability>=.1*headOnProbability;
 const success=$('quantum').checked&&(demoActive?credible:Math.random()<probability);
 const encounter={index:near.index,probability,from:[x,y],to:[t.x+(x-t.x)*p.R/near.distance,t.y+(y-t.y)*p.R/near.distance]};
 if(success){if(!demoActive)passes++;else aimTarget=near.index;rareEncounter=null;startTunnel(encounter,demoActive);}else{
 rareEncounter=$('quantum').checked&&p.C>0&&probability>0?encounter:null;$('showRare').disabled=!rareEncounter;
 status(demoActive?'Toto přiblížení je příliš tečné pro připravenou ukázku. Dráha pokračuje bez vynuceného tunelu.':!$('quantum').checked?'Tunelování je vypnuté: klasický odraz.':probability<1e-6?'Průchod je při této energii a geometrii mimořádně vzácný. Částice se odráží.':'Průchod tentokrát nenastal. Částice se odklání.');
 }
 }}
 if(mode==='flight'&&demoActive&&Math.hypot(x-gunOrigin[0],y-gunOrigin[1])>shot.start*6){mode='done';vx=vy=0;status('Ukázka nenašla vhodné přiblížení. Připrav ji znovu; vzdálený tunel se nevynucuje.');}
 if(mode==='flight'&&!demoActive){
 const margin=Math.min(W*.25,H*.2,Math.max(28,displayRadius()*visualBound($('projectile').value)+12)),bounds={left:(margin-ox)/scale,right:(W-margin-ox)/scale,top:(65+margin-oy)/scale,bottom:(H-45-margin-oy)/scale};
 // A display boundary, not a force or a reflecting physical wall. Follow current zoom.
 const screen=project(x,y);if(screen[0]<margin||screen[0]>W-margin||screen[1]<65+margin||screen[1]>H-45-margin){[x,y]=unproject(Math.max(margin,Math.min(W-margin,screen[0])),Math.max(65+margin,Math.min(H-45-margin,screen[1])));mode='done';vx=vy=0;status('Dolet ukončen u okraje scény. Částice zůstává k dispozici pro další výstřel.');}
 }
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
function tunnelBlend(){
 const t=Math.min(1,tunnelTime/tunnelDuration),smooth=t*t*(3-2*t),hopEnd=.64,snapEnd=.73,phase=Math.min(1,t/hopEnd)*5,cycle=phase-Math.floor(phase);
 let travel=smooth;
 if(!reduced.matches){if(t<hopEnd){const v=cycle<.5?cycle*2:(1-cycle)*2,e=v*v*(3-2*v);travel=.17*e-.025*Math.sin(Math.PI*cycle);}else{const q=Math.min(1,(t-hopEnd)/(snapEnd-hopEnd));travel=q*q*(3-2*q);}}
 const glitch=!reduced.matches&&t<hopEnd&&(cycle>.32&&cycle<.64),breakup=reduced.matches?0:Math.sin(Math.PI*t),shimmer=glitch?.52:1;
 return {t,smooth,travel,shimmer,breakup,glitch};
}
function tunnelContactPoint(){const target=centers[targetIndex],center=project(target.x,target.y),start=project(...(tunnelDisplayFrom||tunnelFrom||[x,y])),dx=start[0]-center[0],dy=start[1]-center[1],n=Math.max(.001,Math.hypot(dx,dy)),offset=displayRadius()*(visualBound($('target').value)+visualBound($('projectile').value))*.42;return [center[0]+dx/n*offset,center[1]+dy/n*offset];}
function projectilePoint(){return mode==='nuclear'&&tunnelTo?tunnelContactPoint():project(x,y);}
function tunnelVisualPoint(travel,t){
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

function resize(canvas,context){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(r.width*d)||canvas.height!==Math.round(r.height*d)){canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);}context.setTransform(d,0,0,d,0,0);return [r.width,r.height];}
function line(context,a,b,color,width=1){context.strokeStyle=color;context.lineWidth=width;context.beginPath();context.moveTo(...a);context.lineTo(...b);context.stroke();}
function arrow(a,b,color){line(ctx,a,b,color,2);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...b);ctx.lineTo(b[0]-6*Math.cos(ang-.5),b[1]-6*Math.sin(ang-.5));ctx.lineTo(b[0]-6*Math.cos(ang+.5),b[1]-6*Math.sin(ang+.5));ctx.fill();}
function label(host,key,s,left,top,cls=''){let el=host.querySelector('[data-key="'+key+'"]');if(!el){el=document.createElement('span');el.dataset.key=key;el.className='mathlabel '+cls;host.append(el);}tex(el,s);el.style.left=left+'px';el.style.top=top+'px';return el;}
function nucleus(id,X,Y,key,customAtoms){const atoms=customAtoms||S.connected.atoms[id],rad=displayRadius(),cz=13.76;atoms.forEach((a,i)=>{const len=Math.hypot(a[0],a[1],cz-a[2]),depth=cz-a[2]-(cz-a[2])/len,px=X+rad*cz*(a[0]-a[0]/len)/depth,py=Y-rad*cz*(a[1]-a[1]/len)/depth;const el=label($('labels'),key+i,S.labels[a[3]===1?'p':'n'],px,py,'nucleon');el.style.fontSize=S.particleLabels.fontSize*2*rad/S.particleLabels.referenceDiameter+'px';});}

const potentialCanvas=document.createElement('canvas'),potentialContext=potentialCanvas.getContext('2d');
const fieldCanvas=document.createElement('canvas'),fc=fieldCanvas.getContext('2d');let fieldKey='',lastPair='',gridKey='',worldGrid=[];
function fieldLayer(X,Y){
 const key=[Math.round(W),Math.round(H),Math.round(ox),Math.round(oy),zoom,Math.round(X/2),Math.round(Y/2),layoutSeed,centers.length,shot.start,energy,scale,fusion?fusion.phase+'-'+Math.round(fusion.flightTime*30)+'-'+Math.round(fusionWarp()*50)+'-'+(fusion.detail?fusion.detail.stage+Math.round(fusion.detail.age*60):''):'',p.a.Z,p.b.Z,$('arrows').checked,$('lineStyle').value].join('/');
 if(key!==fieldKey){fieldKey=key;fieldCanvas.width=Math.round(W);fieldCanvas.height=Math.round(H);fc.clearRect(0,0,W,H);
 const physicalSources=fusion?[...(fusion.products?fusion.products.sources.map(b=>[b.x,b.y,b.Z]):centers.filter((t,i)=>i!==targetIndex).map(t=>[t.x,t.y,p.a.Z])),...(fusion.products?fusion.products.products.map(b=>[b.x,b.y,b.Z]):[[fusion.origin.x,fusion.origin.y,2]])]:[...centers.map(t=>[t.x,t.y,p.a.Z]),[x,y,p.b.Z]];const sources=physicalSources.map(([wx,wy,z])=>[...project(wx,wy),z]);
 // Smooth FEM-style scalar potential map; fixed normalization for the current pair/energy.
 const mapWidth=fusion&&fusion.phase==='compound'?80:144,mapHeight=Math.max(1,Math.round(mapWidth*H/W));potentialCanvas.width=mapWidth;potentialCanvas.height=mapHeight;
 const currentGridKey=[W,H,ox,oy,scale,zoom,layoutSeed,centers.length,p.C,p.R,fusionWarp()].join('/');
 if(gridKey!==currentGridKey){gridKey=currentGridKey;worldGrid=[];for(let iy=0;iy<mapHeight;iy++)for(let ix=0;ix<mapWidth;ix++)worldGrid.push(unproject((ix+.5)/mapWidth*W,(iy+.5)/mapHeight*H));}

 const palette=[[42,91,184],[30,172,195],[83,190,158],[179,206,90],[240,172,57],[222,91,63]],reference=Math.max(.001,energy/Math.max(1,p.b.Z));
 for(let iy=0;iy<mapHeight;iy++)for(let ix=0;ix<mapWidth;ix++){
 const [px,py]=worldGrid[iy*mapWidth+ix];let potential=0;
 for(const [sx,sy,z]of physicalSources){const r=Math.max(p.R*.45,Math.hypot(px-sx,py-sy));potential+=1439.96448*z/r;}
 const value=1-Math.exp(-.6*Math.log1p(potential/reference)),part=value*(palette.length-1),index=Math.min(palette.length-2,Math.floor(part)),t=part-index,col=palette[index].map((c,j)=>Math.round(c+(palette[index+1][j]-c)*t));
 potentialContext.fillStyle='rgb('+col.join(',')+')';potentialContext.fillRect(ix,iy,1,1);
 }
 fc.save();fc.globalAlpha=.28;fc.imageSmoothingEnabled=true;fc.imageSmoothingQuality='high';fc.drawImage(potentialCanvas,0,0,W,H);fc.restore();
 // Concentrated, layered halos keep the source positions legible without washing the whole field.
 for(const [sx,sy,z]of sources){if(!z)continue;const radius=Math.max(32,displayRadius()*5),glow=fc.createRadialGradient(sx,sy,radius*.12,sx,sy,radius);glow.addColorStop(0,'rgba(255,144,42,.22)');glow.addColorStop(.3,'rgba(255,174,65,.12)');glow.addColorStop(.65,'rgba(255,201,96,.04)');glow.addColorStop(1,'rgba(255,192,77,0)');fc.fillStyle=glow;fc.fillRect(sx-radius,sy-radius,radius*2,radius*2);}
 if($('arrows').checked&&$('lineStyle').value==='spread'){
  fc.save();fc.beginPath();fc.rect(0,0,W,H);fc.clip();
  // Spaced streamlines, inspired by force-core; direction comes from the electric field.
  const occupied=new Set(),directions=new Map(),cell=(px,py)=>Math.floor(px/16)+','+Math.floor(py/16);
  const F=(px,py)=>{
   const key=Math.floor(px/5)+','+Math.floor(py/5);if(directions.has(key))return directions.get(key);
   const gx=Math.max(0,Math.min(mapWidth-1,px/W*mapWidth-.5)),gy=Math.max(0,Math.min(mapHeight-1,py/H*mapHeight-.5)),ix=Math.floor(gx),iy=Math.floor(gy),jx=Math.min(mapWidth-1,ix+1),jy=Math.min(mapHeight-1,iy+1),tx=gx-ix,ty=gy-iy;
   const q=[0,1].map(k=>(worldGrid[iy*mapWidth+ix][k]*(1-tx)+worldGrid[iy*mapWidth+jx][k]*tx)*(1-ty)+(worldGrid[jy*mapWidth+ix][k]*(1-tx)+worldGrid[jy*mapWidth+jx][k]*tx)*ty);
   let fx=0,fy=0;for(const [sx,sy,z]of physicalSources){const dx=q[0]-sx,dy=q[1]-sy,r=Math.max(p.R*.3,Math.hypot(dx,dy));fx+=z*dx/r**3;fy+=z*dy/r**3;}
   const n=Math.hypot(fx,fy);let result=null;if(n>1e-15){const start=project(...q),end=project(q[0]+fx/n*.2/scale,q[1]+fy/n*.2/scale),dx=end[0]-start[0],dy=end[1]-start[1],length=Math.hypot(dx,dy);if(length>1e-9)result=[dx/length,dy/length];}directions.set(key,result);return result;
  };
  const trace=(seed,sign)=>{let point=seed;const points=[];for(let i=0;i<650;i++){const d=F(...point);if(!d)break;const mid=F(point[0]+sign*1.5*d[0],point[1]+sign*1.5*d[1]);if(!mid)break;point=[point[0]+sign*3*mid[0],point[1]+sign*3*mid[1]];if(point[0]<0||point[0]>W||point[1]<0||point[1]>H||occupied.has(cell(...point))||sources.some(([sx,sy,z])=>z&&Math.hypot(point[0]-sx,point[1]-sy)<displayRadius()*1.4))break;points.push(point);}return points;};
  for(let sy=18;sy<H;sy+=38)for(let sx=18;sx<W;sx+=38){if(occupied.has(cell(sx,sy)))continue;const seed=[sx,sy],points=[...trace(seed,-1).reverse(),seed,...trace(seed,1)];if(points.length<10)continue;points.forEach(q=>occupied.add(cell(...q)));fc.beginPath();points.forEach((q,i)=>i?fc.lineTo(...q):fc.moveTo(...q));fc.strokeStyle='rgba(28,103,131,.42)';fc.lineWidth=1;fc.stroke();fc.fillStyle='rgba(27,99,127,.58)';for(let i=28;i<points.length-2;i+=100){const q=points[i],d=F(...q);if(!d)continue;const angle=Math.atan2(d[1],d[0]);fc.beginPath();fc.moveTo(q[0]+3*Math.cos(angle),q[1]+3*Math.sin(angle));fc.lineTo(q[0]-3*Math.cos(angle-.55),q[1]-3*Math.sin(angle-.55));fc.lineTo(q[0]-3*Math.cos(angle+.55),q[1]-3*Math.sin(angle+.55));fc.fill();}}
  fc.restore();
 }
 else if($('arrows').checked){fc.save();fc.beginPath();fc.rect(0,62,W,Math.max(1,H-102));fc.clip();
 // Restore the original source-seeded, continuous schematic field lines.
 const F=(a,b)=>{let fx=0,fy=0;for(const [sx,sy,z]of sources){const dx=a-sx,dy=b-sy,r=Math.hypot(dx,dy);if(r>1){fx+=z*dx/r**3;fy+=z*dy/r**3;}}const n=Math.hypot(fx,fy);return n>1e-12?[fx/n,fy/n]:null;};
 for(const [sx,sy,z]of sources){for(let j=0;j<24*z;j++){const a=j*Math.PI*2/(24*z);let px=sx+10*Math.cos(a),py=sy+10*Math.sin(a);fc.beginPath();fc.moveTo(px,py);const arrows=[];
 for(let k=0;k<450;k++){const d=F(px,py);if(!d)break;const mid=F(px+1.5*d[0],py+1.5*d[1]);if(!mid)break;px+=3*mid[0];py+=3*mid[1];fc.lineTo(px,py);if(j%2===0&&k%50===25)arrows.push([px,py,Math.atan2(mid[1],mid[0])]);if(px<0||px>W||py<62||py>H-40)break;}
 fc.strokeStyle=j%2?'rgba(24,112,117,.24)':'rgba(24,112,117,.46)';fc.lineWidth=j%2?.8:1.1;fc.stroke();fc.fillStyle='rgba(24,105,111,.58)';for(const [ax,ay,angle]of arrows){fc.beginPath();fc.moveTo(ax+3*Math.cos(angle),ay+3*Math.sin(angle));fc.lineTo(ax-3*Math.cos(angle-.55),ay-3*Math.sin(angle-.55));fc.lineTo(ax-3*Math.cos(angle+.55),ay-3*Math.sin(angle+.55));fc.fill();}
 }}fc.restore();}
 // Soft fade into the scene edges, rather than an isolated rectangular patch.
 fc.save();fc.globalCompositeOperation='destination-in';const fade=fc.createLinearGradient(0,0,0,H);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(.12,'rgba(0,0,0,1)');fade.addColorStop(.87,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,0)');fc.fillStyle=fade;fc.fillRect(0,0,W,H);fc.restore();

 }
 ctx.drawImage(fieldCanvas,0,0);
}
function path(points,color,dashed=false){if(points.length<2)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash(dashed?[10,6]:[]);ctx.beginPath();points.forEach((q,i)=>{const [X,Y]=project(q[0],q[1]);if(i)ctx.lineTo(X,Y);else ctx.moveTo(X,Y);});if(dashed){ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineWidth=6;ctx.stroke();}ctx.strokeStyle=color;ctx.lineWidth=dashed?3:2.4;ctx.stroke();ctx.restore();}
function scene(){
 document.querySelector('.fieldLegend').hidden=!$('field').checked;
 [W,H]=resize(c,ctx);view();if(fitPending)fitAllParticles();if(demoActive&&mode==='flight'){const margin=70,[px,py]=project(x,y);panX+=(Math.max(margin,Math.min(W-margin,px))-px)/W;panY+=(Math.max(margin,Math.min(H-margin,py))-py)/H;view();}ctx.clearRect(0,0,W,H);const [X,Y]=projectilePoint();
 if($('field').checked)fieldLayer(X,Y);if(fusion&&fusion.phase==='compound'){const point=project(fusion.origin.x,fusion.origin.y),pulse=displayRadius()*(2.4+.3*Math.sin(fusion.time*19));const glow=ctx.createRadialGradient(...point,0,...point,pulse*1.7);glow.addColorStop(0,'rgba(255,184,81,.2)');glow.addColorStop(1,'rgba(255,184,81,0)');ctx.fillStyle=glow;ctx.fillRect(point[0]-pulse*1.7,point[1]-pulse*1.7,pulse*3.4,pulse*3.4);}
 if(!fusion){const heat=Math.max(0,Math.min(1,(temperature-10)/490)),haloRadius=displayRadius()*(3.3+heat),halo=ctx.createRadialGradient(X,Y,displayRadius(),X,Y,haloRadius);
 halo.addColorStop(0,'rgba(231,134,40,'+(.04+.17*heat)+')');halo.addColorStop(1,'rgba(231,134,40,0)');ctx.fillStyle=halo;ctx.fillRect(X-haloRadius,Y-haloRadius,haloRadius*2,haloRadius*2);}
 ctx.save();ctx.beginPath();ctx.rect(0,65,W,Math.max(1,H-110));ctx.clip();
 if(fusion&&fusion.phase!=='compound'){fusion.trail.forEach((points,i)=>path(points,i===0?'#bd5b12':'#506b87'));Object.values(fusion.sourceTrails).forEach(points=>path(points,'#188c7b'));const origin=project(fusion.origin.x,fusion.origin.y);ctx.beginPath();ctx.arc(...origin,4,0,Math.PI*2);ctx.strokeStyle='#7b8382';ctx.lineWidth=1.3;ctx.stroke();}
 if(!fusion&&$('interaction').value==='gun'){
 path(preview,'#753bb3',true);path(trail,'#087f79');
 const [gx,gy]=project(...gunOrigin);ctx.save();ctx.translate(gx,gy);ctx.rotate(gunHeading-angle);ctx.scale(zoom,zoom);ctx.fillStyle='#244f55';ctx.strokeStyle='#dce9e6';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-21,-11,46,22,5);ctx.fill();ctx.stroke();ctx.fillStyle='#79b9aa';ctx.fillRect(20,-7,8,14);ctx.restore();
 const heading=gunHeading-angle,guideLength=aiming&&lastPointer?Math.hypot(lastPointer.clientX-c.getBoundingClientRect().left-gx,lastPointer.clientY-c.getBoundingClientRect().top-gy):Math.min(W,H)*.38;arrow([gx+Math.cos(heading)*30*zoom,gy+Math.sin(heading)*30*zoom],[gx+Math.cos(heading)*Math.max(guideLength,50*zoom),gy+Math.sin(heading)*Math.max(guideLength,50*zoom)],'#b37a32');
 }
 if(!fusion){ctx.strokeStyle='#b58bb666';ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(...project(centers[targetIndex].x,centers[targetIndex].y),Math.min(W,H)*.13*zoom,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
 if(drag){const [tx,ty]=project(...drag),dx=tx-X,dy=ty-Y,len=Math.hypot(dx,dy),r=M.nearest(centers,x,y).distance,limit=Math.max(p.R,M.turning(p,energy)),resistance=p.C?Math.min(1,M.multiPotential(p,centers,x,y)/energy):0,color=resistance>.8?'#c1533b':'#bc8b4e';
ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X,Y);for(let i=1;i<=40;i++){const t=i/40,wiggle=Math.sin(t*Math.PI*12)*Math.sin(t*Math.PI)*Math.min(6,len*.08);ctx.lineTo(X+dx*t-dy/Math.max(1,len)*wiggle,Y+dy*t+dx/Math.max(1,len)*wiggle);}ctx.stroke();ctx.beginPath();ctx.arc(tx,ty,8,0,Math.PI*2);ctx.stroke();
if(p.C){arrow([X,Y+Math.min(W,H)*.13*zoom],[X+(x-centers[targetIndex].x)/r*(20+65*resistance),Y+Math.min(W,H)*.13*zoom+(y-centers[targetIndex].y)/r*(20+65*resistance)],color);ctx.setLineDash([3,7]);ctx.strokeStyle='#bd725b66';ctx.beginPath();for(let i=0;i<=96;i++){const angle=i*Math.PI/48,point=project(centers[targetIndex].x+limit*Math.cos(angle),centers[targetIndex].y+limit*Math.sin(angle));if(i)ctx.lineTo(...point);else ctx.moveTo(...point);}ctx.stroke();ctx.setLineDash([]);}
status(!p.C?'Neutron nemá Coulombův odpor.':resistance>.995?'Bariéra: dál tě dostupná energie nepustí.':resistance>.35?'Odpor výrazně roste. Pružná spojnice ukazuje tah myši.':'Táhni blíž k jádru. Odpor při přibližování poroste.');}
 if(mode==='tunnel'){const f=tunnelBlend(),dest=tunnelContactPoint();tunnelRibbon(ctx,tunnelVisualPoint(0,f.t),dest,Math.min(W,H)*.11*zoom,f.t);for(const [xx,yy,weight]of [[X,Y,1-f.smooth],[...dest,f.smooth]]){const rad=Math.min(W,H)*.14*zoom,gr=ctx.createRadialGradient(xx,yy,0,xx,yy,rad);gr.addColorStop(0,'rgba(145,130,204,'+(.27*weight*f.shimmer)+')');gr.addColorStop(1,'rgba(145,130,204,0)');ctx.fillStyle=gr;ctx.fillRect(xx-rad,yy-rad,rad*2,rad*2);}}
 ctx.restore();
 const pk=$('target').value+$('projectile').value+centers.length;if(pk!==lastPair){$('labels').replaceChildren();lastPair=pk;}
 if(!fusion)centers.forEach((t,i)=>nucleus($('target').value,...project(t.x,t.y),'a'+i+'-'));if(!fusion)nucleus($('projectile').value,X,Y,'b');
 for(const el of $('labels').children)if(el.dataset.key.startsWith('b'))el.style.opacity=mode==='tunnel'?0:1;
}
function excavatedTunnel(context,from,to){
 const dx=to[0]-from[0],length=Math.max(1,Math.abs(dx)),steps=Math.max(24,Math.ceil(length/3)),edge=(u,side)=>side*(5.5+1.15*Math.sin(u*73+side)+.65*Math.sin(u*157+side*3)+.45*Math.sin(u*311));
 context.save();context.beginPath();for(let i=0;i<=steps;i++){const u=i/steps,x=from[0]+dx*u,y=from[1]+edge(u,-1);if(i)context.lineTo(x,y);else context.moveTo(x,y);}for(let i=steps;i>=0;i--){const u=i/steps;context.lineTo(from[0]+dx*u,from[1]+edge(u,1));}context.closePath();context.fillStyle='rgba(241,235,250,.94)';context.fill();context.strokeStyle='rgba(119,82,160,.85)';context.lineWidth=1.2;context.stroke();
 // Small excavated facets on both edges, not a varying energy trajectory.
 for(let i=2;i<steps;i+=4){const u=i/steps,px=from[0]+dx*u;for(const side of [-1,1])line(context,[px,from[1]+edge(u,side)],[px+2,from[1]+side*3],'rgba(134,103,173,.32)',.8);}
 context.setLineDash([2,5]);line(context,from,to,'rgba(119,82,160,.38)',.8);context.restore();
}
function graph(){
 const [w,h]=resize(g,gc),left=60,right=w-25,top=38,bottom=h-75,zero=top+(bottom-top)*.72;
 if(h<100||w<150)return;gc.clearRect(0,0,w,h);
 // Quantified logarithmic radius and linear model energy; the deep nuclear well is clipped.
 const sx=q=>left+q/6*(right-left),sy=u=>zero-u*(zero-top)/yMax,nuclear=q=>-20/(1+Math.exp((q-1)/.04)),repulsion=q=>p.C?Math.exp(-1.5*(q-1)):0,total=q=>repulsion(q)+nuclear(q)+background(q);
 const target=centers[targetIndex],distance=Math.hypot(x-target.x,y-target.y),qOf=r=>1+Math.log(Math.max(.01,r/p.R))/1.5;
 const norm=Math.max(.001,distance),nx=distance?(x-target.x)/norm:1,ny=distance?(y-target.y)/norm:0;
 const background=q=>{const r=p.R*Math.exp(1.5*(q-1)),px=target.x+nx*r,py=target.y+ny*r;return centers.reduce((sum,t,i)=>i===targetIndex?sum:sum+p.C/Math.max(p.R*.3,Math.hypot(px-t.x,py-t.y)),0)/Math.max(1,p.C/p.R);};
 const energyUnit=Math.max(1,p.C/p.R),tickText=v=>Math.abs(v)>=100?Math.round(v).toString():fmt(v);let peak=.01;for(let i=0;i<=500;i++)peak=Math.max(peak,repulsion(.3+5.7*i/500)+nuclear(.3+5.7*i/500));const yMax=Math.max(peak,p.C?M.thermalMean(200)/energyUnit:0)*1.12;
 for(let i=0;i<=2;i++){const value=yMax*i/2,yy=sy(value);label($('graphLabels'),'ytick'+i,tickText(value*energyUnit),left-30,yy);line(gc,[left-4,yy],[left,yy],'#718280');if(i){gc.setLineDash([2,5]);line(gc,[left,yy],[right,yy],'#dce6e4',.7);gc.setLineDash([]);}}
 const negative=-yMax*(bottom-zero)/(zero-top);label($('graphLabels'),'yneg',tickText(negative*energyUnit),left-30,bottom);
 for(let exponent=0;exponent<=4;exponent++){const r=10**exponent,q=qOf(r),tick=label($('graphLabels'),'xtick'+exponent,String(r),sx(q),bottom+16);tick.hidden=q<0||q>6;if(!tick.hidden)line(gc,[sx(q),bottom],[sx(q),bottom+4],'#718280');}
 line(gc,[left,bottom],[right,bottom],'#b8c7c2');
 label($('graphLabels'),'title',fusion?String.raw`\text{Bariéra před reakcí}`:String.raw`\text{Společný potenciál}`,w/2,12);
 label($('graphLabels'),'axisU',String.raw`U/\mathrm{keV}`,left+8,top-16);label($('graphLabels'),'axisR',String.raw`r/\mathrm{fm}`,right-24,bottom+35);
 line(gc,[left,top],[left,bottom],'#718280');line(gc,[left,zero],[right,zero],'#718280');
 gc.save();gc.beginPath();gc.rect(left,top,right-left,bottom-top);gc.clip();gc.fillStyle='#e0eef155';gc.fillRect(left,top,sx(1.4)-left,bottom-top);
 const curve=(fn,color,dash)=>{gc.beginPath();for(let i=0;i<=500;i++){const q=.3+5.7*i/500;if(i)gc.lineTo(sx(q),sy(fn(q)));else gc.moveTo(sx(q),sy(fn(q)));}gc.strokeStyle=color;gc.lineWidth=2;gc.setLineDash(dash);gc.stroke();gc.setLineDash([]);};
 if(centers.length>1){gc.beginPath();for(let i=0;i<=400;i++){const q=.3+5.7*i/400;if(i)gc.lineTo(sx(q),sy(total(q)));else gc.moveTo(sx(q),sy(total(q)));}for(let i=400;i>=0;i--){const q=.3+5.7*i/400;gc.lineTo(sx(q),sy(repulsion(q)+nuclear(q)));}gc.closePath();gc.fillStyle='#487eb521';gc.fill();}
 curve(q=>repulsion(q)+nuclear(q),'#a7aaa5',[5,4]);curve(total,'#146e70',[]);
 let overflowStart=null,overflow=false;for(let i=0;i<=501;i++){const q=.3+5.7*Math.min(i,500)/500,above=i<=500&&total(q)>yMax;if(above&&overflowStart===null)overflowStart=q;if(!above&&overflowStart!==null){const px=sx((overflowStart+q)/2);line(gc,[px-4,top+7],[px,top+2],'#146e70',1.7);line(gc,[px,top+2],[px+4,top+7],'#146e70',1.7);overflowStart=null;overflow=true;}}
 const graphNote=document.querySelector('.graphNote'),note=overflow?'Pevná osa pro dvojici · vyšší hrbol okolí přesahuje graf ↑':'Pevná osa pro dvojici · vzdálenost logaritmicky';if(graphNote.textContent!==note)graphNote.textContent=note;

 const tunneled=tunnelFrom&&(mode==='tunnel'||mode==='nuclear'||!!fusion),entry=tunneled?Math.hypot(tunnelFrom[0]-target.x,tunnelFrom[1]-target.y):Math.max(p.R,M.turning(p,energy)),entryQ=qOf(entry),energyRatio=p.C?energy/(p.C/p.R):0,energyY=sy(energyRatio);let innerLo=.8,innerHi=1.3;for(let i=0;i<40;i++){const mid=(innerLo+innerHi)/2;if(total(mid)<energyRatio)innerLo=mid;else innerHi=mid;}const exitQ=qOf(p.R);
 gc.setLineDash([6,4]);line(gc,[left,energyY],[right,energyY],'#af7830',1.5);gc.setLineDash([]);
 const progress=tunneled?Math.min(1,tunnelTime/tunnelDuration):0,q=tunneled?entryQ+(exitQ-entryQ)*progress:qOf(distance),mx=sx(q),my=tunneled?energyY:sy(total(q));
 if(tunneled){
  const startX=sx(entryQ),endX=sx(exitQ);
  gc.beginPath();gc.moveTo(endX,energyY);for(let i=0;i<=160;i++){const q=exitQ+(entryQ-exitQ)*i/160;gc.lineTo(sx(q),Math.min(energyY,sy(total(q))));}gc.lineTo(startX,energyY);gc.closePath();gc.fillStyle='rgba(123,91,170,.10)';gc.fill();
  excavatedTunnel(gc,[startX,energyY],[endX,energyY]);
  for(const px of [startX,endX]){gc.beginPath();gc.arc(px,energyY,4.5,0,Math.PI*2);gc.fillStyle='#fff';gc.fill();gc.strokeStyle='#8054a6';gc.lineWidth=2;gc.stroke();line(gc,[px,energyY+7],[px,energyY+17],'#8054a6',1);}
  line(gc,[endX+7,energyY-4],[endX,energyY],'#8054a6',2);line(gc,[endX+7,energyY+4],[endX,energyY],'#8054a6',2);
  tunnelRibbon(gc,[startX,energyY],[endX,energyY],14,progress,mode==='nuclear'||!!fusion);
 }
 const tunnelLabel=label($('graphLabels'),'tunnelSpan',tunneled?String.raw`\Delta r=`+fmt(Math.max(0,entry-p.R))+String.raw`\,\mathrm{fm}`:'',Math.max(left+60,Math.min(right-60,(sx(entryQ)+sx(exitQ))/2)),energyY+29);tunnelLabel.hidden=!tunneled;

 gc.beginPath();gc.arc(Math.max(left+6,Math.min(right-6,mx)),Math.max(top+6,Math.min(bottom-6,my)),6,0,Math.PI*2);gc.fillStyle='#efaa3e';gc.fill();gc.strokeStyle='#603e18';gc.stroke();gc.restore();
 label($('graphLabels'),'sum',String.raw`\text{Součet}`,sx(4.7),top+18);
 label($('graphLabels'),'others',String.raw`\text{Okolní jádra: }`+fmt(background(qOf(distance))*Math.max(1,p.C/p.R))+'\\,\\mathrm{keV}',w/2,h-15);
 label($('graphLabels'),'well',String.raw`\text{Jaderná jáma pokračuje dolů}`,sx(3.8),zero+(bottom-zero)*.6);
 label($('graphLabels'),'readout',p.C?'E/U_C(R)='+fmt(100*energy/(p.C/p.R))+'\\,\\%':String.raw`\text{Neutron nemá Coulombovu bariéru}`,w/2,h-38);
}

function scientific(n){if(n===0)return p.C?String.raw`\text{pod rozlišením výpočtu}`:'0';if(n>=.001)return fmt(n*100)+'\\,\\%';const e=Math.floor(Math.log10(n));return fmt(n/10**e)+'\\cdot10^{'+e+'}';}
function ui(){
 updateRareButton();
 $('lesson').textContent=fusion?(fusion.plan?'Názorně vybraný směr k okolnímu iontu; nejde o náhodný vzorek úhlů fúze. Síly a zpětný ráz jsou vypočtené.':'Ukázka D–T fúze po průchodu, nikoli výpočet četnosti reakcí. Po emisi se nabitá jádra vzájemně odpuzují včetně zpětného rázu; vnitřní pohyb je ilustrativní.'):demoActive?'Vybraný úspěšný případ. Pohyb a délka efektu nejsou skutečnou dráhou ani dobou tunelování.':'Nižší energie znamená širší bariéru a vzácnější průchod, nikoli ostrý práh. Prostupnost není pravděpodobnost fúze.';tex($('temperatureValue'),'T='+fmt(temperature)+'\\,\\mathrm{MK}');tex($('angleValue'),(angle*180/Math.PI).toFixed(3).replace('.', '{,}')+'^{\\circ}');const pair=detailPair(),r=pair?Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y):M.nearest(centers,x,y).distance;tex($('distance'),(pair?'r_{\\mathrm{detail}}=':'r=')+fmt(r)+'\\,\\mathrm{fm}');tex($('values'),'\\langle E\\rangle=\\tfrac32 k_B T='+fmt(M.thermalMean(temperature))+'\\,\\mathrm{keV}');tex($('turning'),'r_{\\min,\\,klas.}='+fmt(Math.max(p.R,shot.closest))+'\\,\\mathrm{fm}');tex($('probability'),centers.length>1?(probability===null?String.raw`\text{Odhad průchodu po přiblížení}`:String.raw`\text{Lokální WKB odhad: }`+scientific(probability)):shot.rmin<=p.R?'\\text{Klasický přístup bez tunelování}':'P_{\\mathrm{WKB}}\\approx '+scientific(probability));tex($('statistics'),'N='+attempts+'\\quad N_{\\mathrm{tunel}}='+passes+'\\quad N_{\\mathrm{klas.}}='+classical);if(fusion){tex($('values'),String.raw`\mathrm D+\mathrm T\to{}^{5}\mathrm{He}^{*}\to\alpha+\mathrm n`);tex($('probability'),String.raw`Q=17{,}59\,\mathrm{MeV}`);if(fusion.products){const speeds=fusion.products.products.map(b=>Math.hypot(...HiFyzikoDT.velocity(b))*299792.458);tex($('turning'),String.raw`\begin{aligned}v_\alpha&=`+Math.round(speeds[0])+String.raw`\,\mathrm{km/s}\\v_{\mathrm n}&=`+Math.round(speeds[1])+String.raw`\,\mathrm{km/s}\end{aligned}`);}else tex($('turning'),String.raw`\text{Přechodné jádro: }2\,\mathrm p+3\,\mathrm n`);}graph();}
let uiSince=0;
function frame(t){const dt=old?Math.min(.05,(t-old)/1000):0;old=t;if(document.hidden){requestAnimationFrame(frame);return;}
 if(!paused){if(!reduced.matches)renderTime+=dt;if(fusion){advanceFusion(dt);}else if(mode==='tunnel'){tunnelTime+=dt;if(tunnelTime>=tunnelDuration){x=tunnelTo[0];y=tunnelTo[1];vx=vy=0;mode='nuclear';if(isDT()&&$('fusionEnabled').checked)beginFusion();else status($('pairPreset').value==='proton|proton'?'Průchod bariérou p–p. Slabou přeměnu potřebnou pro fúzi tento model nepočítá.':batchNote||'Průchod do jaderné oblasti. Fúzi a její produkty přidáme v dalším kroku.');}}
 else if(mode==='recoil'&&recoil){recoil.time+=dt;const f=Math.min(1,recoil.time/.55),ease=1-(1-f)**3,points=recoil.points,index=ease*(points.length-1),i=Math.min(points.length-2,Math.floor(index));if(i>=0){const t=index-i;x=points[i][0]+(points[i+1][0]-points[i][0])*t;y=points[i][1]+(points[i+1][1]-points[i][1])*t;}if(f===1){recoil=null;mode=drag?'drag':'ready';if($('interaction').value==='gun')armGun(true);else status('Nová hranice přiblížení odpovídá zvolené teplotě.');}}

 else if(mode==='drag'&&drag){const next=M.dragTowards(p,centers,{x,y},drag,energy,dt,p.R);x=next.x;y=next.y;targetIndex=M.nearest(centers,x,y).index;updateHum();}
 else if(['flight','free'].includes(mode)){const speed=Math.sqrt(2*energy/p.mu),duration=dt*shot.start/Math.max(speed,.1)*.9*Math.sqrt(temperature/100),count=Math.max(1,Math.ceil(duration/shot.dt));for(let i=0;i<count;i++)step(duration/count);if(mode==='flight'||mode==='done'){trail.push([x,y]);if(trail.length>1200)trail.shift();}}
 }
 if(!paused&&['flight','free'].includes(mode))updateHum();else if(mode!=='drag')stopHum();
 scene();if(fusion&&painter){painter.draw(W,H,renderTime,fusionGraphics());}else if(painter){const radius=displayRadius(),items=centers.map(t=>({id:$('target').value,x:project(t.x,t.y)[0],y:project(t.x,t.y)[1],radius}));if(mode==='tunnel'){const f=tunnelBlend(),point=tunnelVisualPoint(f.travel,f.t),smear=!reduced.matches&&f.t>.04&&f.t<.75;
 if(smear)for(let i=5;i>=1;i--){const ghost=tunnelVisualPoint(Math.max(0,f.travel-i*.06),f.t),spread=Math.sin(i*2.4+f.t*19)*radius*.10;items.push({id:$('projectile').value,x:ghost[0]+spread,y:ghost[1]+Math.cos(i*3.1)*radius*.08,radius,opacity:.17*(1-i/6)});}
 if(f.glitch){for(let i=0;i<10;i++)items.push({id:$('projectile').value,x:point[0]+Math.sin(i*17+Math.floor(f.t*70))*radius*.34,y:point[1],radius,opacity:.65+.25*(i%2),clipY:[i/10,(i+1)/10]});}
 else items.push({id:$('projectile').value,x:point[0],y:point[1],radius,opacity:reduced.matches?1:smear?.62:.96});
 }else items.push({id:$('projectile').value,x:projectilePoint()[0],y:projectilePoint()[1],radius});painter.draw(W,H,renderTime,items);}
 if(mode==='tunnel'||t-uiSince>70){ui();uiSince=t;}requestAnimationFrame(frame);
}
window.coulombProjectilePoint=projectilePoint;window.coulombTunnelContact=tunnelContactPoint;window.coulombProject=project;window.coulombUnproject=unproject;
window.coulombState=()=>({fusion,x,y,vx,vy,mode,energy,temperature,angle,paused,zoom,scale,ox,oy,pair:p,shot,demoActive,demoPending,probability,attempts,passes,classical,tunnelTime,tunnelFrom,tunnelDisplayFrom,tunnelTo,centers,targetIndex,activePointer,layoutSeed,gunOrigin,gunHeading,aimTarget,previewLimit,releaseBounds,flightLimit:flightLimit(),displayRadius:displayRadius(),contactRadius:contactRadius(),targetBound:visualBound($('target').value),projectileBound:visualBound($('projectile').value)});
reset();requestAnimationFrame(frame);
})();
