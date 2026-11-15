(()=>{'use strict';
 const $=id=>document.getElementById(id),TAU=Math.PI*2,rad=Math.PI/180;
 // Keep all teaching steps inside one fixed-height stage.
 const panel=document.querySelector('.analysis-card');panel.querySelector('.card-head').after($('waveCard'));$('sourceControls').after($('reactanceCard'));
 const model=SyncDQ.create(SyncFieldBasis),state={type:'salient',angle:0,amp:1,step:1,source:'total',playing:false,direction:1,speed:15};
 const colors={f:'#007e6c',d:'#a76914',q:'#346fc0',b:'#8661b1',ink:'#19313b'},fmt=(v,n=2)=>(Math.abs(v)<.00001?0:v).toFixed(n).replace('.',',');
 const mathCache=new Map(),tex=t=>{if(!mathCache.has(t))mathCache.set(t,katex.renderToString(t,{throwOnError:false}));return mathCache.get(t);};
 for(const el of document.querySelectorAll('[data-math]'))el.innerHTML=tex(el.dataset.math);
 const arrow=(x,y,dx,dy,c,w=2.4)=>{const l=Math.hypot(dx,dy);if(l<.5)return '';w=Math.min(w,l*.25);const a=Math.atan2(dy,dx),head=Math.min(8,l*.4),ex=x+dx,ey=y+dy;return `<path d="M${x} ${y}L${ex-head*Math.cos(.45)*Math.cos(a)} ${ey-head*Math.cos(.45)*Math.sin(a)}" stroke="${c}" stroke-width="${w}" stroke-linecap="butt" fill="none"/><path d="M${ex} ${ey}l${-head*Math.cos(a-.45)} ${-head*Math.sin(a-.45)}L${ex-head*Math.cos(a+.45)} ${ey-head*Math.sin(a+.45)}Z" fill="${c}"/>`;};
 const text=(x,y,s,color=colors.ink,size=12,anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${s}</text>`;
 const label=(x,y,t,color,size=14)=>`<foreignObject x="${x-28}" y="${y-12}" width="56" height="30" style="overflow:visible;pointer-events:none"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;color:${color};font-size:${size}px">${tex(t)}</div></foreignObject>`;
 const axis=(x,y,r,outside=false)=>`<path d="M${x-r} ${y}H${x+r}M${x} ${y-r}V${y+r}" stroke="#b9c9c3" stroke-dasharray="4 5"/>`+(outside?label(x+r+14,y,'d',colors.d,14)+label(x,y-r-15,'q',colors.q,14):text(x+r+10,y+4,'d',colors.d,14)+text(x+12,y-r+14,'q',colors.q,14));
 let fieldKey='',fieldArt='',frame=0,lastTime=0,lastPaint=0,dirty=true;
 const comparisonCache=new Map();
 function gapOverlay(){return '';}
 function drawMechanism(a){
  const key=[state.type,Math.round(state.amp*100)].join(':');
  if(!comparisonCache.has(key)){
   let h='';for(const [index,angle] of [0,Math.PI/2].entries()){
    const s=SyncPrinciple.create();Object.assign(s,{type:state.type,field:angle,rotor:0,excitation:false,excitationLevel:0});
    const f=MagneticContours(model.field(state.type,angle,state.amp),model.N,model.R,colors.f);
    let art=SyncMachineArt(s,false,{axes:false,forces:false,currentScale:state.amp,driveLabel:'F',salientPath:SyncFieldBasis.salientPath},f.paths+f.arrows)+gapOverlay(state.type);
    art=art.replaceAll('lab-iron','comparison-'+index+'-iron');
    const x=index*280;h+=text(x+140,21,index?'Mezi póly · q':'Podél pólu · d',index?colors.q:colors.d,16);
    h+=`<g transform="translate(${x} 25) scale(.5)">${art}</g>`;
    h+=text(x+140,299,state.type==='smooth'?'Stejná mezera':index?'Velký vzduchový prostor':'Krátká vzduchová mezera','#bf4930',14);
    h+=text(x+140,320,state.type==='smooth'?'Stejná reluktance':index?'Větší reluktance':'Menší reluktance',colors.ink,14);
    const response=model.at(state.type,angle,state.amp).b;
    h+=`<rect x="${x+35}" y="334" width="210" height="14" rx="4" fill="#e9eeeb"/><rect x="${x+35}" y="334" width="${210*response/1.5}" height="14" rx="4" fill="${colors.f}"/>`;
    h+=text(x+140,366,'B₁ / B₀ = '+fmt(response),colors.f,15);
   }if(comparisonCache.size>160)comparisonCache.clear();comparisonCache.set(key,h);
  }
  $('paths').innerHTML=comparisonCache.get(key);$('sameF').textContent='F / F₀ = '+fmt(state.amp);
  $('mechanism').querySelector('.cause-chain').innerHTML=state.type==='smooth'?'<b>Stejná mezera v obou směrech</b><span>↓</span><b>Stejná reluktance</b><span>↓</span><b>Stejná odezva na proud</b>':'<b>Vzduch vede tok hůře než železo</b><span>↓</span><b>V příčném směru větší reluktance</b><span>↓</span><b>Při stejném buzení menší tok</b>';
 }
 function lines(){const a=Math.round(state.angle/rad),amp=Math.round(state.amp*100)/100,key=[state.type,a,amp,state.source].join(':');if(key!==fieldKey){const color=state.source==='d'?colors.d:state.source==='q'?colors.q:colors.f;const field=model.field(state.type,a*rad,amp,state.source);const c=MagneticContours(field,model.N,model.R,color);fieldArt=c.paths+c.arrows;fieldKey=key;}return fieldArt;}
 function drawMachine(a){
  const s=SyncPrinciple.create();Object.assign(s,{type:state.type,field:state.angle,rotor:0,excitation:false,excitationLevel:0,damper:false});
  let art=SyncMachineArt(s,false,{axes:false,forces:false,currentScale:state.amp,driveLabel:'F',salientPath:SyncFieldBasis.salientPath},lines());
  art+=gapOverlay(state.type);
  // Place axis names beyond the stator (radius 211), on the positive axes.
  // They must not sit among the winding slots or inside the field drawing.
  if(state.step>=3)art+=axis(280,267,254,true);
  art+=arrow(280,267,120*a.fd,-120*a.fq,colors.f,3);
  if(state.step>=3){art+=arrow(280,267,120*a.fd,0,colors.d,2.6)+arrow(280,267,0,-120*a.fq,colors.q,2.6);art+=`<path d="M${280+120*a.fd} 267V${267-120*a.fq}H280" fill="none" stroke="#93aaa2" stroke-dasharray="4 4"/>`;}
  const marker=art.match(/<g class="drive-marker">[\s\S]*?<\/g>/)?.[0]||'';
  if(marker)art=art.replace(marker,'')+marker;
  $('machine').setAttribute('viewBox','-20 -30 600 590');
  $('machine').innerHTML=art;
  $('gapNote').textContent=state.type==='smooth'?'Červeně: stejně krátká mezera ve všech směrech.':'Červeně: krátká mezera pod póly a velký prostor mezi póly. Pole se stáčí k železu pólových nástavců.';
 }
 function drawVectors(a){
  const x=125,y=126,r=69,fx=r*a.fd,fy=-r*a.fq,bx=r*a.bd,by=-r*a.bq,split=state.step>=3;
  let h=text(125,19,'Magnetické napětí',colors.f,13)+text(375,19,'Základní harmonická pole',colors.b,13);
  h+=axis(x,y,105)+axis(375,y,105);
  if(split&&state.source==='total')h+=`<g opacity=".7" stroke-dasharray="5 4">${arrow(375,y,r*a.ld*a.fd,-r*a.ld*a.fq,'#89949b',2)}</g>`;
  if(split){h+=`<path d="M${x+fx} ${y}V${y+fy}H${x}" fill="none" stroke="#9ab0a7" stroke-dasharray="4 4"/>`;h+=arrow(x,y,fx,0,colors.d)+arrow(x,y,0,fy,colors.q);h+=label(x+fx/2,y+16,'F_d',colors.d,12)+label(x-19,y+fy/2,'F_q',colors.q,12);}
  h+=arrow(x,y,fx,fy,colors.f,3)+`<circle cx="${x+fx}" cy="${y+fy}" r="9" fill="${colors.f}" stroke="white" stroke-width="2"/>`;
  h+=arrow(375,y,bx,by,colors.b,3);
  if(split){h+=arrow(375,y,bx,0,colors.d,2)+arrow(375,y,0,by,colors.q,2);}
  if(a.b>.005)h+=label(375+bx+(bx>=0?15:-15),y+by-8,'B_1',colors.b,13);
  h+=text(125,247,'Táhněte bod: směr i velikost',colors.f,11)+text(375,247,state.source==='total'?'Fialově skutečná odezva':state.source==='d'?'Pouze příspěvek d':'Pouze příspěvek q',colors.b,11);
  $('vectors').innerHTML=h;
 }
 // Reuse the original vector pole contour, rotated as a clean pole-face cutout.
 function developedIron(width=440){
  if(state.type==='smooth')return '<rect x="58" y="478" width="440" height="34" fill="#f3eee3" stroke="#b9781c" stroke-width="1.2"/>';
  const source=$('machine').querySelector('clipPath path');if(!source)return '';
  const contour=source.getAttribute('d'),scale=440*SyncFieldBasis.poleCoverage/(4*147*Math.sin(SyncFieldBasis.poleCoverage*Math.PI/2)),base=478+147*scale;let h='<g class="original-pole-cutouts" clip-path="url(#pole-strip-clip)">';
  for(const deg of [0,180,360]){const x=58+width*deg/360;h+='<g transform="translate('+x+' '+base+') scale('+scale+') rotate(-90)"><path d="'+contour+'" fill="#f3eee3" stroke="#b9781c" stroke-width="1.2" vector-effect="non-scaling-stroke"/></g>';}
  return h+'</g>';
 }
 function drawWaves(a){
  const svg=$('waves'),chartWidth=svg.clientHeight>0?Math.max(520,svg.clientWidth*560/svg.clientHeight):520,left=58,width=chartWidth-80,centers=[115,305],height=82,max=Math.max(1.15,state.amp*1.22);
  $('waves').setAttribute('viewBox','0 0 '+chartWidth+' 560');let h='';
  if(state.type==='salient')for(let k=0;k<360;k++){if(Math.abs(Math.cos(k*rad))>Math.cos(SyncFieldBasis.poleCoverage*Math.PI/2))h+=`<rect x="${left+width*k/360}" y="28" width="${width/360+.1}" height="385" fill="#f3ead7"/>`;}
  for(let j=0;j<2;j++){const y=centers[j];const tick=max>1.7?2:1;for(const v of [-tick,0,tick]){const yy=y-v*height/max;h+=`<path d="M${left} ${yy}H${left+width}" stroke="${v===0?'#b8c8c1':'#e2e9e5'}"/>`+text(left-9,yy+4,String(v),'#60747b',12,'end');}h+=label(15,y,j===0?'F/F_0':'B/B_0',j===0?colors.f:colors.ink,13);}
  for(const v of [0,90,180,270,360]){const x=left+width*v/360;h+=`<path d="M${x} 28V413" stroke="#cfdbd5" stroke-dasharray="3 4"/>`+text(x,437,v+'°','#60747b',12);}
  const curve=(w,y,color,dash='')=>{const N=w.length,pt=k=>[left+width*k/N,y-height*w[(k%N+N)%N]/max],p0=pt(0);let d='M'+p0.join(' ');for(let k=0;k<N;k++){const p=pt(k),q=pt(k+1),before=pt(k-1),after=pt(k+2);d+='C'+[p[0]+(q[0]-before[0])/6,p[1]+(q[1]-before[1])/6,q[0]-(after[0]-p[0])/6,q[1]-(after[1]-p[1])/6,q[0],q[1]].join(' ');}return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;};
  h+=curve(a.mmf,centers[0],colors.f)+curve(a.teachingWave,centers[1],colors.ink);
  if($('fundamental').checked)h+=curve(a.fundamental,centers[1],colors.b);
  // A small developed cross-section ties the shaded columns to real pole shoes.
  h+='<defs><clipPath id="pole-strip-clip"><rect x="58" y="466" width="'+width+'" height="72"/></clipPath></defs>';
  h+=text(58,552,'Pólové nástavce rotoru','#946013',12,'start');
  h+='<rect x="58" y="450" width="'+width+'" height="16" fill="#e7eeec"/><path d="M58 466H'+(left+width)+'" stroke="#819b96" stroke-width="2"/>';h+=text(left+width/2,461,'Povrch statoru','#60747b',10);
  h+=developedIron(width);
  h+=text(left+width,448,'Poloha po obvodu θ','#60747b',11,'end');$('waves').innerHTML=h;
 }
 function render(){
  document.querySelector('main').dataset.teachingStep=state.step;
  dirty=false;const a=model.at(state.type,state.angle,state.amp,state.source),full=model.at(state.type,state.angle,state.amp),ratio=a.lq/a.ld;
  $('angle').value=state.angle/rad;$('angleOut').textContent=fmt(state.angle/rad,0)+'°';$('amplitude').value=state.amp;$('amplitudeOut').textContent=fmt(state.amp);$('speedOut').textContent=state.speed+' °/s';$('type').value=state.type;
  $('play').textContent=state.playing?'Ⅱ Pozastavit':'▶ Animovat';$('play').setAttribute('aria-pressed',state.playing);$('motionState').textContent=state.playing?'Animace · táhnutím převezmete řízení':'Ruční pokus';
  document.querySelector('[data-preset=compare]').textContent=state.type==='smooth'?'Vrátit vyniklé póly':'Porovnat hladký rotor';
  $('fValue').textContent=fmt(Math.hypot(a.cd,a.cq));$('bValue').textContent=fmt(a.b);$('ratioValue').textContent=fmt(ratio);
  $('waveCard').hidden=state.step!==2;$('sourceControls').hidden=state.step<3;$('reactanceCard').hidden=state.step<4;
  $('mechanism').hidden=state.step!==1;$('vectors').style.display=state.step<3?'none':'';$('singleFailure').hidden=state.step!==3;$('branchFlow').hidden=state.step<3;
  if(state.step<3)drawMechanism(full);
  $('singleFailure').innerHTML='<b>Šedě: předpověď s jediným přepočtem z osy d.</b><p>'+(state.type==='smooth'?'Obě odezvy jsou stejné. Šedá a fialová šipka se překrývají.':Math.abs(full.fq)<.025?'V ose d předpověď sedí. Teď táhněte k ose q: stejný přepočet začne selhávat.':'Stejný přepočet by v obou směrech dal stejně silné pole. Příčný příspěvek ale nadhodnotí '+fmt(a.ld/a.lq,1)+'×. '+(Math.abs(full.fd)<.025?'V ose q má skutečná šipka stejný směr, ale menší délku.':'U šikmého buzení se změní i směr výsledného pole.'))+'</p>';
  $('branchFlow').innerHTML='<div class="branch d"><b>Podélně d</b><span>'+tex('F_d/F_0='+fmt(full.fd).replace(',','{,}'))+'</span><span>→ menší reluktance →</span><b>'+tex('B_{1d}/B_0='+fmt(a.ld*full.fd).replace(',','{,}'))+'</b></div><div class="branch q"><b>Příčně q</b><span>'+tex('F_q/F_0='+fmt(full.fq).replace(',','{,}'))+'</span><span>→ '+(state.type==='smooth'?'stejná':'větší')+' reluktance →</span><b>'+tex('B_{1q}/B_0='+fmt(a.lq*full.fq).replace(',','{,}'))+'</b></div>';
  if(state.type==='smooth')$('branchFlow').innerHTML=$('branchFlow').innerHTML.replace('menší reluktance','stejná reluktance');
  document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.step===state.step));document.querySelectorAll('[data-source]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.source===state.source));
  const titles=['Dvě polohy stejného buzení','Jak pólové nástavce tvarují pole','Dva příspěvky vytvoří celé pole','Od pole k reaktancím'];
  $('panelTitle').textContent=state.type==='smooth'&&state.step>=3?'Hladký rotor: jeden přepočet stačí':titles[state.step-1];$('panelSubtitle').textContent=state.step>=3?'d: osa pólu · q: mezi póly · prostorové šipky':'Při stejném proudu porovnejte oba směry.';
  let title,explanation,equation='';
  if(state.amp<.005){title='Bez proudu není reakční pole.';explanation='Buzení rotoru je vypnuté. Zvětšete proud posuvníkem nebo vytáhněte zelený bod ze středu diagramu.';}
  else if(state.source!=='total'){title=state.source==='d'?'Jen podélný příspěvek':'Jen příčný příspěvek';explanation='Proudové buzení zůstává stejné. Siločáry, graf a fialová šipka nyní ukazují pouze vybraný příspěvek; tlačítkem Součet d + q je znovu složíte.';}
  else if(state.type==='smooth'){title='Hladký rotor: všechny směry jsou rovnocenné.';explanation='Při stejném proudu zůstává amplituda základní harmonické téměř stejná. Osy d–q můžeme dál používat; v ideálním modelu však mají stejnou magnetickou odezvu.';}
  else if(state.step===1){title='Stejný proud nemusí vytvořit stejně silné pole.';explanation='Podél pólu vede tok snazší magnetická cesta. Mezi póly je magnetický odpor větší. Zkuste 0° a 90° bez změny proudu.';}
  else if(state.step===2){title='Sinusové magnetické napětí, deformovaná indukce.';explanation='Proměnlivá vzduchová mezera mění prostorový průběh B. Fialová křivka vybírá jeho základní harmonickou pro další popis stroje.';}
  else if(state.step===3){title='Proto volíme právě osy d a q.';explanation='Jsou to osy symetrie magnetického obvodu: buzení v každé z nich vytvoří základní harmonickou pole ve stejném směru. Šikmé buzení rozložíme, každou složku přepočteme její vlastní odezvou a pole vektorově sečteme.';}
  else{title='Dvě magnetické odezvy → dvě reaktance.';explanation='U tohoto vyniklého rotoru má podélná složka silnější magnetizační účinek. K reaktanci reakce kotvy v každé ose přidáme společný rozptyl.';}
  if(state.step>=3)equation=tex('B_{1d}=k_d F_d,\\quad B_{1q}=k_q F_q');
  $('explanationTitle').textContent=title;$('explanation').textContent=explanation;$('equation').innerHTML=equation;
  $('hint').textContent=state.step===1?'Neměňte proud. Natočte magnetické napětí z osy pólu do směru mezi póly.':state.step===2?'Spusťte animaci a sledujte, jak se při stálém proudu mění tvar B i jeho základní harmonická.':state.step===3?'Nastavte 45°. Přepínejte Jen d → Jen q → Součet. V pravém diagramu lze tažením měnit i velikost proudu.':'Přepněte na hladký rotor. Dvě magnetické odezvy splynou a stačí jediná reaktance.';
  drawMachine(full);drawVectors(a);if(state.step>=2)drawWaves(a);
 }
 function update(){dirty=true;}
 function stop(){state.playing=false;update();}
 function reset(){Object.assign(state,{type:'salient',angle:35*rad,amp:1,step:1,source:'total',playing:false,direction:1,speed:15});$('speed').value=15;$('fundamental').checked=true;update();}
 $('angle').addEventListener('input',()=>{stop();state.angle=+$('angle').value*rad;});$('amplitude').addEventListener('input',()=>{state.amp=+$('amplitude').value;update();});$('type').addEventListener('input',()=>{state.type=$('type').value;update();});$('speed').addEventListener('input',()=>{state.speed=+$('speed').value;update();});$('fundamental').onchange=update;
 $('play').onclick=()=>{state.playing=!state.playing;lastTime=0;update();};$('reverse').onclick=()=>{state.direction*=-1;$('reverse').textContent=state.direction===1?'↺ Obrátit směr':'↻ Obrátit směr';update();};$('reset').onclick=()=>{reset();$('reverse').textContent='↺ Obrátit směr';};
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{state.step=+b.dataset.step;if(state.step<3)state.source='total';update();fitSoon();});
 document.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{state.source=b.dataset.source;update();});
 document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{const p=b.dataset.preset;stop();state.source='total';if(p==='compare')state.type=state.type==='smooth'?'salient':'smooth';else if(p==='why'){state.step=3;state.angle=45*rad;state.type='salient';state.amp=1;}else state.angle=({d:0,q:90,diagonal:45}[p])*rad;update();});
 function bindDrag(id,cx,cy,scale,changeSize){const el=$(id);let active=null;const position=e=>{const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(el.getScreenCTM().inverse()),x=p.x-cx,y=cy-p.y;if(changeSize&&p.x>250)return;const r=Math.hypot(x,y);if(r>2)state.angle=SyncDQ.wrap(Math.atan2(y,x));if(changeSize)state.amp=Math.max(0,Math.min(1.5,r/scale));update();};el.addEventListener('pointerdown',e=>{if(e.button!==0)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(el.getScreenCTM().inverse());if(changeSize&&p.x>250)return;stop();active=e.pointerId;el.setPointerCapture(active);el.classList.add('dragging');position(e);e.preventDefault();});el.addEventListener('pointermove',e=>{if(e.pointerId===active)position(e);});const release=()=>{active=null;el.classList.remove('dragging');};el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);}
 bindDrag('machine',280,267,120,false);bindDrag('vectors',125,126,69,true);
 $('openSchema').onclick=()=>{if(window.parent!==window)window.parent.location.hash='sm02-schema';else location.href='schema.html';};
 let fitFrame=0;
 function fitSoon(){if(fitFrame)return;fitFrame=requestAnimationFrame(()=>{fitFrame=0;if(window.parent!==window)return;const main=document.querySelector('main');if(innerWidth<=850){main.style.removeProperty('zoom');main.style.removeProperty('width');return;}main.style.width=Math.min(1180,innerWidth)+'px';const size=Math.min(innerWidth/main.offsetWidth,(innerHeight-8)/main.offsetHeight);const zoom=String(Math.round(size*10000)/10000);if(main.style.zoom!==zoom)main.style.zoom=zoom;});}
 addEventListener('resize',()=>{fitSoon();update();});document.querySelector('details').addEventListener('toggle',fitSoon);document.fonts.ready.then(fitSoon);
 function tick(now){if(!document.hidden){if(state.playing){const dt=lastTime?Math.min(.1,(now-lastTime)/1000):0;state.angle=SyncDQ.wrap(state.angle+state.direction*state.speed*rad*dt);dirty=true;}if(dirty&&now-lastPaint>65){render();lastPaint=now;fitSoon();}}lastTime=now;frame=requestAnimationFrame(tick);}
 document.addEventListener('visibilitychange',()=>{lastTime=0;});addEventListener('pagehide',()=>cancelAnimationFrame(frame));
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>update()).observe($('waves'));
 window.syncDQState=()=>({...state,...model.at(state.type,state.angle,state.amp,state.source),playing:state.playing});
 render();fitSoon();frame=requestAnimationFrame(tick);
})();
