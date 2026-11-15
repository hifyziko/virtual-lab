(()=>{
'use strict';
const $=id=>document.getElementById(id),M=SyncVCurves,T=SyncMath;
const C={ink:'#19313b',axis:'#516a64',grid:'#dfe7e6',blue:'#346fc0',gold:'#ad701b',green:'#007e6c',red:'#b94730',muted:'#81969b',mu:'#bd4c6c'};
const defaults={p:.6,ik:1.5,iaMax:1,ikMax:2.2,r:.03,type:'smooth',xq:.75};
let state={...defaults},mode=1,expanded=null,animation=0,startTime=null,lastFrame=-Infinity,cacheKey='',cache=null,phasorKey='',manualScale=null;
const fmt=(v,n=2)=>Number(v).toFixed(n).replace('-0.00','0.00').replace('.','{,}');
const label=(x,y,t,c=C.ink,size=16,w=130)=>T.label(x,y,t,c,Math.max(18,size),w);
const line=(x1,y1,x2,y2,c=C.grid,width=1,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const dot=(x,y,c=C.blue,r=6)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="white" stroke-width="1.5"/>`;
const text=(x,y,value,c=C.muted,anchor='middle')=>`<text x="${x}" y="${y}" fill="${c}" font-size="18" text-anchor="${anchor}">${value}</text>`;
// Axis captions share one distance from the arrow tip and its centre line.
const axisLabel=(tip,direction,tex)=>label(tip[0]+26*direction[0],tip[1]+26*direction[1],tex,C.axis,20,42);
function path(points,c,width=2,dash=''){
 let d='',prev=null;for(const p of points){if(!p){prev=null;continue;}d+=(prev?'L':'M')+p.join(',');prev=p;}
 return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
}
function arrow(a,b,c,width=1.5){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.2)return '';const h=Math.min(8,len*.6),nx=dx/len,ny=dy/len;return line(...a,...b,c,width)+`<path d="M${b} L${b[0]-h*nx+3*ny},${b[1]-h*ny-3*nx} M${b} L${b[0]-h*nx-3*ny},${b[1]-h*ny+3*nx}" fill="none" stroke="${c}" stroke-width="${width}"/>`;}
function data(){
 const key=JSON.stringify([state.p,state.r,state.type,state.xq,state.iaMax,state.ikMax,mode]);if(cache&&key===cacheKey)return cache;
 cacheKey=key;const curves=[];
 for(const p of [...[0,.3,.6,.9,1.2,1.5].map(v=>v*mode),state.p]){
  const samples=[];let previous=null;for(let n=0;n<=150;n++){
   const s=M.solve({...state,p,ik:n/50});
   if(!s.exists){samples.push(null);previous=null;continue;}
   if(previous&&Math.abs(previous.beta-s.beta)>12)samples.push(null);
   samples.push(s);previous=s;
  }curves.push(samples);
 }
 const boundary=[];
 for(let n=0;n<=150;n++)for(const b of M.boundary(n/50,state)){const selected=M.solve({...state,p:b.p,ik:b.ik});b.selected=selected.exists&&Math.abs(selected.beta-b.beta)<.2;boundary.push(b);}
 const region=M.admissibleRegion(state);
 const limit=[];for(let b=-180;b<=180;b+=1)limit.push(M.atAngle(b,state.ikMax,state));
 cache={curves,boundary,region,limit};return cache;
}
function current(s){
 const key=JSON.stringify([s.exists,s.p,s.ik,state.r,state.type,state.xq,!!s.reference,!!window.syncLabelsMoving]);if(key===phasorKey)return;phasorKey=key;
 if(!s.exists){$('current').innerHTML=arrow([320,500],[320,40],C.muted)+arrow([590,280],[40,280],C.muted)+text(320,190,'Bez stabilního ustáleného řešení',C.red);$('scaleNote').textContent='Zvyšte buzení nebo snižte požadovaný výkon.';return;}
 // Hold both scales for the entire excitation sweep at the selected power.
 const originY=mode>0?340:280;
 const sweep=data().curves[6].filter(Boolean);
 let currentScale=245/Math.max(.3,...sweep.flatMap(v=>[Math.hypot(...v.I),Math.hypot(...v.Imu)]));
 let voltage=250/Math.max(1,...sweep.flatMap(v=>SyncSchemaGeometry.build(v.raw).chain.flatMap(t=>[Math.hypot(...t.start),Math.hypot(...t.end)])));
 if(manualScale?.key===JSON.stringify([state.p,state.r,state.type,state.xq])){currentScale=manualScale.current;voltage=manualScale.voltage;}
 const result=SyncSchemaDrawing.phasor(s.raw,{showMMF:true,showDQ:state.type==='salient',labelSearchWidth:6,labelAngleSteps:36,labelFontSize:18,imaginaryAxisStart:70,rotorSize:76,rotorLetterSize:40,axisLabelsInside:true,fixedScales:{origin:[320,originY],voltage,current:currentScale}});
 const zones=`<g data-current-regimes="true"><rect x="90" y="42" width="230" height="${originY-42}" fill="#e8f2fa"/><rect x="320" y="42" width="295" height="${originY-42}" fill="#fff3df"/><rect x="90" y="${originY}" width="230" height="${540-originY}" fill="#e6f4ed"/><rect x="320" y="${originY}" width="295" height="${540-originY}" fill="#f5eaf3"/>`+text(104,30,'Přebuzený motor','#4e7089','start')+text(601,30,'Podbuzený motor','#96733b','end')+text(104,555,'Přebuzený generátor','#4b8063','start')+text(601,555,'Podbuzený generátor','#8a6480','end')+'</g>';
 const trajectory=data().curves[6].map(v=>v?[320-v.I[1]*currentScale,originY-v.I[0]*currentScale]:null);
 const trail='<defs><clipPath id="current-trail-clip"><rect x="70" y="42" width="545" height="498"/></clipPath></defs><g clip-path="url(#current-trail-clip)" data-current-trajectory="true">'+path(trajectory,'#813ba0',1.8,'6 4')+dot(320-s.I[1]*currentScale,originY-s.I[0]*currentScale,C.blue,5)+'</g>';
 $('current').innerHTML=zones+(s.reference?'<g opacity=".65">'+trail+result.html+'</g>':trail+result.html);
 $('scaleNote').textContent=s.reference?'Mezní referenční stav — neřeší aktuálně zadané buzení.':'Fialová: dráha proudu při stálém svorkovém výkonu. Oblasti podle znamének P a Q.';
}
function vPlot(s,d,reference){
 const width=expanded==='v'?1000:600,right=width-70,span=right-65;
 $('plot').setAttribute('viewBox','0 0 '+(width-25)+' 560');
 const ymax=Math.max(2.2,Math.ceil((s.ia||0)*5.1)/5,Math.ceil((reference?.ia||0)*5.1)/5,state.iaMax+.1),X=k=>65+k*span/3,Y=i=>515-i*445/ymax;let a='';
 for(let k=0;k<=3.01;k+=.5)a+=line(X(k),70,X(k),515)+label(X(k),543,fmt(k,1),C.muted,14,55);
 for(let i=0;i<=ymax+.001;i+=ymax/6)a+=line(65,Y(i),right,Y(i))+label(30,Y(i)+3,fmt(i,1),C.muted,14,55);
 a+='<defs><clipPath id="vClip"><rect x="65" y="70" width="'+span+'" height="445"/></clipPath></defs><g clip-path="url(#vClip)">';
 a+=`<rect x="65" y="70" width="${span}" height="${Math.max(0,Y(state.iaMax)-70)}" fill="${C.red}" opacity=".05"/><rect x="${X(state.ikMax)}" y="70" width="${right-X(state.ikMax)}" height="445" fill="${C.gold}" opacity=".08"/>`;
 const curve=(samples,c,w,end=3)=>path(samples.map(s=>s&&s.ik<=end?[X(s.ik),Y(s.ia)]:null),c,w);
 for(const samples of d.curves.slice(0,6))a+=curve(samples,'#a7bbc1',1.5);
 const tracing=animation!==0||startTime!==null;a+=curve(d.curves[6],tracing?'#a7bbc1':C.blue,tracing?1.2:2.1);
 if(tracing)a+=curve(d.curves[6],C.blue,2.1,state.ik);
 const stability=d.boundary.filter(b=>b.p*mode>=-.001&&Math.abs(b.p)<=1.5&&b.selected).map(b=>[X(b.ik),Y(b.ia)]);
 a+='<g data-stability-boundary="true">'+path(stability,'#e0e4e9',5)+path(stability,'#374151',2,'7 4')+'</g>';
 const pfLine=M.equalPowerFactor(s,state);if(pfLine.length)a+='<g data-equal-pf="true">'+path(pfLine.map(v=>v?[X(v.ik),Y(v.ia)]:null),'#813ba0',2.1,'7 4')+'</g>';
 const minima=[];for(let p=0;p<=1.5001;p+=.025){const m=M.minimum(mode*p,state);minima.push(m.stable?[X(m.ik),Y(m.ia)]:null);}a+=path(minima,C.green,2,'4 4');
 a+=line(65,Y(state.iaMax),right,Y(state.iaMax),C.red,2,'6 4')+line(X(state.ikMax),70,X(state.ikMax),515,C.gold,2,'6 4')+line(X(state.ik),70,X(state.ik),515,C.blue,1,'3 4');
 if(reference){a+='<g data-limit-reference="true">'+line(X(state.ik),Y(reference.ia),X(reference.ik),Y(reference.ia),C.red,2,'5 4')+dot(X(reference.ik),Y(reference.ia),C.red,10)+'</g>';}
 if(s.exists)a+=dot(X(s.ik),Y(s.ia),s.nearStability?'#b15a12':s.allowed?C.blue:C.red,s.stable?7:11);
 a+='</g>'+arrow([65,515],[right+22,515],C.axis)+arrow([65,515],[65,48],C.axis);
 a+=axisLabel([right+22,515],[0,-1],'I_k')+axisLabel([65,48],[0,-1],'I_a')+label(width/2,24,'P='+fmt(state.p),C.blue,18,250);
 a+=label(right-60,Y(state.iaMax)-13,'I_{a,\\max}',C.red,16,100)+label(X(state.ikMax),52,'I_{k,\\max}',C.gold,16,110);
 const m=M.minimum(state.p,state);if(m.stable)a+=dot(X(m.ik),Y(m.ia),C.green,4);
 if(stability.length){
  const visible=stability.filter(p=>p[0]>=65&&p[0]<=right&&p[1]>=70&&p[1]<=515);
  if(visible.length){
   const target=visible.reduce((best,p)=>Math.hypot(p[0]-160,p[1]-137)<Math.hypot(best[0]-160,best[1]-137)?p:best);
   a+='<g data-stability-caption="true">'+line(160,137,...target,'#374151',1,'3 3')+'<rect x="85" y="86" width="150" height="51" rx="4" fill="white" fill-opacity=".92"/>'+text(160,107,'Mez statické','#374151')+text(160,128,'stability','#374151')+'<circle cx="'+target[0]+'" cy="'+target[1]+'" r="2.5" fill="#374151"/></g>';
  }
 }
 if(reference)a+=label(Math.min(right-80,Math.max(170,X(reference.ik))),Math.max(135,Y(reference.ia)-26),'I_{k,\\rm mez}='+fmt(reference.ik),C.red,20,220);
 $('plot').innerHTML=a;$('plotTitle').textContent=(mode>0?'Motorové':'Generátorové')+' V-křivky';
 $('plotSubtitle').innerHTML='Stálý svorkový výkon · '+T.html('|P|=0;\\,0{,}3;\\,0{,}6;\\,0{,}9;\\,1{,}2;\\,1{,}5');
 $('plotLegend').innerHTML='<span class="blue">Pracovní křivka</span><span class="green">'+T.html('Q=0')+'</span><span style="color:#813ba0">'+(s.exists&&s.pf!==null?T.html('|\\cos\\varphi|='+fmt(s.pf)):'Účiník nedefinován')+'</span>';
 $('plotNote').innerHTML=!s.stable?'Červený bod: mezní reference, nikoli aktuální provoz.':'Fialová: stejný účiník. Tmavá přerušovaná: mez stability.';
}
function pqPlot(s,d,reference){
 const X=q=>300+q*95,Y=p=>290-p*95;
 let a='<defs><clipPath id="pqClip"><rect x="72" y="62" width="456" height="456"/></clipPath></defs><g clip-path="url(#pqClip)">';
 a+='<rect x="72" y="62" width="456" height="456" fill="#fafcfb"/>';
 const fill=d.region.map(loop=>'M'+loop.map(([q,p])=>X(q)+','+Y(p)).join(' L')+' Z').join(' ');
 a+='<path data-admissible-region="true" d="'+fill+'" fill="'+C.green+'" fill-opacity=".15" fill-rule="evenodd"/>';
 for(let v=-2;v<=2.01;v+=.5)a+=line(X(v),62,X(v),518)+line(72,Y(v),528,Y(v));
 a+=`<circle cx="300" cy="290" r="${state.iaMax*95}" fill="none" stroke="${C.red}" stroke-width="1.8"/>`;
 a+=path(d.limit.map(b=>[X(b.q),Y(b.p)]),C.gold,1.8);
 for(const sign of [-1,1]){
  const pts=[];let prev=null;
  for(const b of d.boundary.filter(b=>b.selected&&Math.sign(b.beta)===sign)){
   if(prev&&(Math.hypot(b.q-prev.q,b.p-prev.p)>.3||Math.abs(b.beta-prev.beta)>12))pts.push(null);
   pts.push([X(b.q),Y(b.p)]);prev=b;
  }
  a+='<g data-pq-stability="true">'+path(pts,'#e0e4e9',5)+path(pts,'#374151',2,'7 4')+'</g>';
 }
 const locus=[];for(let b=-180;b<=180;b+=2){const point=M.atAngle(b,state.ik,state);locus.push([X(point.q),Y(point.p)]);}a+=path(locus,C.blue,1.5,'3 5');
 a+='<g data-requested-power="true">'+line(72,Y(state.p),528,Y(state.p),s.stable?C.blue:C.red,s.stable?2:4,'9 5')+'</g>';
 if(reference)a+='<g data-limit-reference="true">'+dot(X(reference.q),Y(reference.p),C.red,10)+'</g>';
 if(s.exists)a+=dot(X(s.q),Y(s.p),s.nearStability?'#b15a12':s.allowed?C.blue:C.red,s.stable?7:11);
 a+='</g>'+arrow([65,290],[548,290],C.axis)+arrow([300,525],[300,44],C.axis);
 for(const v of [-2,-1,1,2])a+=label(X(v),314,fmt(v,0),C.muted,18,40)+label(273,Y(v)+4,fmt(v,0),C.muted,18,40);
 a+=axisLabel([548,290],[0,-1],'Q')+axisLabel([300,44],[0,-1],'P');
 a+=text(435,40,'Odběr činného výkonu')+text(300,541,'Dodávka činného výkonu');
 if(!s.stable){
  a+='<g data-no-stable-warning="true"><rect x="45" y="550" width="510" height="48" rx="6" fill="#fff0e9" stroke="#b94730" stroke-width="1.5"/>'+text(300,570,'Bez stabilního pracovního bodu',C.red)+text(300,590,'Červená čára: požadovaný výkon',C.red)+'</g>';
 }else a+=label(300,576,'K_s=0\\quad\\text{mez statické stability}', '#374151',18,420);
 $('pqPlot').innerHTML=a;$('pqTitle').textContent='PQ diagram';
 $('pqSubtitle').textContent='Průnik mezí · stejné měřítko obou výkonových os';
 $('pqLegend').innerHTML='<span class="red">Proud kotvy</span><span class="gold">Buzení</span><span class="stability">Statická stabilita</span>';
 $('pqNote').textContent=!s.stable?'Požadovaný výkon nemá stabilní pracovní bod. Červený bod ukazuje mezní referenci.':'Zelená plocha: přípustný provoz. Průsečíky barevných mezí určují, které omezení rozhoduje.';
}
function equations(){
 const reaction=state.type==='smooth'?String.raw`{\color{#50898a}\mathrm jX_{ad}\overline I_a}`:String.raw`{\color{#50898a}\mathrm jX_{aq}\overline I_a}+{\color{#8661b1}\mathrm j(X_{ad}-X_{aq})\overline I_d}`;
 T.set($('currentEquation'),String.raw`\begin{aligned}{\color{#bd4c6c}\overline I_\mu}&={\color{#346fc0}\overline I_a}+{\color{#ad701b}\overline I_k}\\[3pt]{\color{#243b91}\overline U_i}&={\color{#ad701b}\overline U_{ib}}+`+reaction+String.raw`\\[3pt]{\color{#007e6c}\overline U_a}&={\color{#243b91}\overline U_i}+{\color{#b35e44}R_a\overline I_a}+{\color{#687cad}\mathrm jX_{a\sigma}\overline I_a}\end{aligned}`);
}
let previousLimits=new Set(),noticeTimer=0;
function clearNotices(){clearTimeout(noticeTimer);noticeTimer=0;for(const id of ['currentAlert','vAlert','pqAlert'])$(id).hidden=true;}
function localNotices(s){
 const limits=new Map();
 if(s.armatureLimit)limits.set('armature','Překročena mez proudu kotvy.');
 if(s.excitationLimit)limits.set('excitation','Překročena mez buzení.');
 if(!s.stable)limits.set('stability','Není k dispozici stabilní pracovní bod.');
 const entered=[...limits.keys()].some(key=>!previousLimits.has(key)),left=[...previousLimits].some(key=>!limits.has(key));
 previousLimits=new Set(limits.keys());
 if(entered){clearNotices();for(const id of ['currentAlert','vAlert','pqAlert']){$(id).textContent=[...limits.values()].join(' ');$(id).hidden=false;}noticeTimer=setTimeout(clearNotices,4000);}
 else if(left)clearNotices();
}
function render(){
 const s=M.solve(state),d=data(),reference=!s.stable?M.limitingReference(state):null;
 s.nearStability=s.stable&&M.boundary(state.ik,state).some(b=>Math.abs((b.beta-s.beta+540)%360-180)<5);
 for(const id of ['p','ik','iaMax','ikMax','r','xq']){const v=id==='xq'&&state.type==='smooth'?1.2:state[id];T.set($(id+'Out'),fmt(v));$(id).value=id==='p'?Math.abs(v):v;$(id).setAttribute('aria-valuetext',String(v).replace('.',','));}
 $('xq').disabled=state.type==='smooth';$('type').value=state.type;
 $('motor').setAttribute('aria-pressed',mode>0);$('generator').setAttribute('aria-pressed',mode<0);
 for(const [id,v]of [['iaValue',s.ia],['qValue',s.q],['pfValue',s.pf],['maxValue',s.loss]])T.set($(id),s.exists&&v!==null?fmt(v):'\\text{—}');
 T.set($('betaValue'),s.exists?fmt(s.beta,1)+'^\\circ':'\\text{—}');T.set($('eValue'),fmt(s.e));
 const errors=[];if(!s.exists)errors.push('POZOR — není stabilní ustálený stav. Zvyšte buzení nebo snižte výkon.');else if(!s.stable)errors.push('Mez stability: nulová synchronizační tuhost.');
 if(s.nearStability)errors.push('Blížíte se mezi statické stability. Synchronizační tuhost klesá k nule.');
 if(s.armatureLimit)errors.push('Překročena mez proudu kotvy.');if(s.excitationLimit)errors.push('Překročena mez buzení.');
 const regime=s.exists?(s.Pem>1e-7?'Motor':s.Pem< -1e-7?'Generátor':'Bez elektromagnetického výkonu'):'';
 $('status').className=errors.length?'warning':'';$('status').textContent=errors.length?errors.join(' '):regime+' · '+(Math.abs(s.q)<1e-6?'nulový jalový výkon':s.q>0?'odběr jalového výkonu':'dodávka jalového výkonu')+' · uvnitř mezí.';
 $('phasorNote').textContent=!s.stable?(reference?'Za mezí: zobrazen mezní referenční stav, nikoli aktuální provoz.':'Mez stability: synchronizační tuhost je nulová.'):'Proudy mají společné měřítko. Napětí mají vlastní měřítko.';
 $('phasorNote').className=!s.stable?'muted stability-warning':'muted';
 $('modelNote').innerHTML=(state.type==='smooth'?'Hladký':'Vyniklý')+' rotor · tvrdá síť · poměrné jednotky · '+T.html('R_a='+fmt(state.r)+',\\quad X_d=1{,}20,\\quad X_q='+fmt(M.parameters(state).xq))+'.';
 $('unity').disabled=!M.minimum(state.p,state).stable;
 localNotices(s);equations();current(!s.exists&&reference?reference:s);vPlot(s,d,reference);pqPlot(s,d,reference);
}
function stop(){window.syncLabelsMoving=false;cancelAnimationFrame(animation);animation=0;startTime=null;lastFrame=-Infinity;$('sweep').textContent='Projeď buzení';$('sweep').setAttribute('aria-pressed','false');}
function tick(time){if(startTime===null)startTime=time;if(time-lastFrame>=90){lastFrame=time;state.ik=Math.min(3,(time-startTime)/4500);render();}if(state.ik<3)animation=requestAnimationFrame(tick);else{stop();render();}}
for(const id of ['p','ik','iaMax','ikMax','r','xq'])$(id).addEventListener('input',()=>{stop();window.syncLabelsMoving=true;state[id]=Number($(id).value)*(id==='p'?mode:1);render();});
for(const id of ['p','ik','iaMax','ikMax','r','xq'])$(id).addEventListener('change',()=>{stop();render();});
$('type').addEventListener('change',()=>{stop();state.type=$('type').value;render();});
for(const [id,sign]of [['motor',1],['generator',-1]])$(id).addEventListener('click',()=>{stop();mode=sign;state.p=Math.abs(state.p)*mode;render();});

$('sweep').addEventListener('click',()=>{if(animation){stop();render();return;}state.ik=0;startTime=null;window.syncLabelsMoving=true;$('sweep').textContent='Zastavit buzení';$('sweep').setAttribute('aria-pressed','true');render();animation=requestAnimationFrame(tick);});
$('unity').addEventListener('click',()=>{stop();const m=M.minimum(state.p,state);if(m.stable)state.ik=m.ik;render();});
$('reset').addEventListener('click',()=>{stop();state={...defaults};mode=1;manualScale=null;phasorKey='';render();});
function toggleExpanded(target){
 expanded=expanded===target?null:target;
 $('diagrams').setAttribute('data-expanded',expanded||'');
 $('vPanel').hidden=expanded==='pq';$('pqPanel').hidden=expanded==='v';
 for(const [id,value]of [['expandV','v']]){const active=expanded===value;$(id).setAttribute('aria-expanded',active);$(id).textContent=active?'Vrátit':'Zvětšit';$(id).setAttribute('title',active?'Vrátit oba grafy vedle sebe':'Zvětšit přes oba pravé panely');}
 render();
}
for(const [panel,button,target]of [['vPanel','expandV','v']]){
 $(panel).addEventListener('click',event=>{if(event?.target?.closest?.('button'))return;toggleExpanded(target);});
 $(button).addEventListener('click',event=>{event?.stopPropagation?.();toggleExpanded(target);});
}
$('rescale').addEventListener('click',()=>{
 stop();const point=M.solve(state),s=point.exists?point:M.limitingReference(state);if(!s)return;
 const g=SyncSchemaGeometry.build(s.raw);
 manualScale={key:JSON.stringify([state.p,state.r,state.type,state.xq]),current:220/Math.max(.3,Math.hypot(...s.I),Math.hypot(...s.Imu)),voltage:220/Math.max(1,...g.chain.flatMap(t=>[Math.hypot(...t.start),Math.hypot(...t.end)]))};
 phasorKey='';render();
});
$('help').addEventListener('click',()=>{stop();$('theory').showModal();});$('closeHelp').addEventListener('click',()=>$('theory').close());
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',()=>{stop();clearNotices();});
render();
})();
