(()=>{'use strict';
const $=id=>document.getElementById(id),F=PMSM,math=SyncMath.html,label=SyncMath.label,drive=document.querySelector('main').dataset.pmsm==='drive';
const C={i:'#007e6c',d:'#a76914',q:'#346fc0',u:'#8754a0',limit:'#c45e48',muted:'#7b8d8c',ink:'#19313b'};
const fmt=(x,n=1)=>(Math.abs(x)<1e-8?0:x).toFixed(n).replace('.','{,}'),val=(x,unit,n=1)=>fmt(x,n)+(unit?'\\,\\mathrm{'+unit+'}':''),put=(id,t)=>SyncMath.set($(id),t);
let s=F.parameters(),step=drive?2:0,amp=80,angle=25,speed=1000,demand=60,target=9000,load=5,J=.5,ramp=800,torque=60,torqueLimit=100,torqueRamp=400,run=F.createRun(),playing=false,history=[],curves=[],extendedCurves=[],last=0,paint=0,dirty=true,incoming=null,mapStep=0;
try{const saved=parent.__pmsmTransfer;if(saved){s=F.parameters(saved.s.type,saved.s);incoming=saved.a;if(drive)step=0;amp=Math.min(s.Imax,saved.a.I);angle=Math.atan2(-saved.a.d,saved.a.q)*180/Math.PI;speed=saved.a.n;demand=Math.max(0,saved.a.M);delete parent.__pmsmTransfer;}}catch{}
const path=(pts,color,width=2,dash='')=>pts.length?`<path d="${pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(2)+' '+p[1].toFixed(2)).join('')}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="'+dash+'"':''} stroke-linejoin="round"/>`:'';
const dot=(x,y,color,r=5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="white" stroke-width="2"/>`;
function arrow(a,b,color,width=3){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.1)return '';const ux=dx/len,uy=dy/len,h=Math.min(10,len*.5);return path([a,[b[0]-h*.65*ux,b[1]-h*.65*uy]],color,width)+`<path d="M${b[0]} ${b[1]}L${b[0]-h*ux+h*.45*uy} ${b[1]-h*uy-h*.45*ux}L${b[0]-h*ux-h*.45*uy} ${b[1]-h*uy+h*.45*ux}Z" fill="${color}"/>`;}
function legend(id,rows){$(id).innerHTML=rows.map(([color,t])=>`<span><i style="--c:${color}"></i>${t}</span>`).join('');}
const selected=id=>$(id)?.checked;
function rebuild(){curves=F.envelope(s);extendedCurves=curves.concat(Array.from({length:81},(_,i)=>F.maximum(s,9000*Math.pow(1000000/9000,(i+1)/81))));history=curves.map(a=>F.requested(s,a.n,demand,a));dirty=true;}
function stop(reset=true){playing=false;if(reset)run=F.createRun();$('play').textContent='Spustit rozjezd';dirty=true;}
const runMode=()=>$('startMode').value;
function runConfig(){return {target,load,J,ramp,torque,torqueLimit,torqueRamp,kind:$('loadKind').value,mode:runMode()};}
let preview=null,previewKey='';
function preparePreview(){
 if(!drive||step!==2)return;
 const config=runConfig(),key=JSON.stringify([s,config,run.t===0]);
 if(key===previewKey)return;previewKey=key;
 // A separate state preserves the live controller and history during slider edits.
 const state={...run,history:[],a:run.a?{...run.a}:null,finished:false};
 preview={state,config,rows:[],start:state.t,settled:0,done:false,equilibrium:false};
}
function advancePreview(){
 if(!drive||step!==2||!preview||preview.done)return;
 // Bounded work per animation frame keeps sliders responsive; edits replace this job.
 for(let i=0;i<4&&!preview.done;i++){
  const p=preview,r=p.state;F.advance(s,r,.05,p.config);
  if(r.a?.feasible)p.rows.push({n:r.n,M:r.a.M});
  const referenceReady=p.config.mode==='torque'?Math.abs(r.torqueRef-p.config.torque)<.01:p.config.mode==='ramp'?Math.abs(r.ref-p.config.target)<.01:true;
  const stationary=r.a?.feasible&&(Math.abs(r.a.accel)<.03||r.n===0&&r.a.accel<=0);
  p.settled=stationary&&referenceReady?p.settled+.05:0;
  p.equilibrium=p.settled>=1;
  p.done=p.equilibrium||r.finished||!r.a?.feasible||r.t-p.start>=60;
 }dirty=true;
}
function startProblem(){if(target<=0)return 'Nastavte kladné otáčky.';const cap=F.maximum(s,0).M,available=runMode()==='torque'?Math.min(cap,torque):runMode()==='ramp'?Math.min(cap,torqueLimit):cap;if(run.t===0&&available<=F.loadTorque(0,load,$('loadKind').value))return 'Moment nestačí na rozjezd. Zvyšte jej nebo snižte zátěž.';return '';}
function slider(id,min,max,inc,value){Object.assign($(id),{min,max,step:inc,value});}
function configure(){
 const mode=runMode(),torqueMode=drive&&step===2&&mode==='torque',runView=drive&&step===2;document.querySelector('main').dataset.runControls=runView&&mode!=='maximum'?'true':'false';
 $('type').value=s.type;
 $('intro').textContent=drive?'Tentýž pracovní bod v proudové mapě, momentu a výkonu.':'Táhněte proudovou šipkou. Pozorujte moment, potom přidejte tok a napětí.';
 const tabs=drive?['Rozjezd','Proudová mapa','Mez odbuzení']:['Proud a moment','Najít MTPA','Napětí a odbuzování'];const steps=drive?[2,0,3]:[0,2,3];
 if(!$('tabs').children.length)$('tabs').innerHTML=tabs.map((t,i)=>`<button data-step="${steps[i]}" aria-pressed="${steps[i]===step}">${t}</button>`).join('');
 $('tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{stop(false);step=drive&&+b.dataset.step===0?mapStep:+b.dataset.step;incoming=null;configure();render();});
 $('tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.step===step||(drive&&step===1&&+b.dataset.step===0)));
 $('simulation').hidden=!drive||step!==2;$('mapActions').hidden=!drive||step>1;$('limitActions').hidden=!drive||step!==3;$('mapTask').value=String(step===1?1:0);$('viewOptions').hidden=!drive;$('speedLabel').textContent=drive&&step===2?'Skutečné otáčky':'Otáčky';
 $('controlALabel').textContent=drive?(step===2?(torqueMode?'Žádaný moment motoru':mode==='maximum'?'Konec ukázky při otáčkách':'Žádané otáčky'):step===3?'Proud úplného odbuzení':step===1?'Dosažitelný moment':'Požadovaný moment'):'Velikost proudu';
 $('controlBLabel').textContent=drive?(step===2?($('loadKind').value==='fan'?'Zátěž při referenčních otáčkách':'Moment zátěže'):'Proudový limit měniče'):'Úhel proudu od příčné osy';
 slider('controlA',0,drive?(step===2&&!torqueMode?9000:140):s.Imax,drive?(step===2&&!torqueMode?50:.5):1,drive?(step===2?(torqueMode?torque:target):demand):amp);
 slider('controlB',drive?(step===2?0:40):-75,drive?(step===2?140:150):90,drive?1:.5,drive?(step===2?load:s.Imax):angle);
 $('controlA').disabled=drive&&(step===1||step===3);if(drive&&step===3)slider('controlA',0,Math.max(s.Imax,s.psi/s.Ld),1,s.psi/s.Ld);$('speed').disabled=drive&&(step===2||step===3);$('speed').value=speed;$('speed').hidden=drive&&(step===2||step===3);$('controlA').hidden=drive&&(step===1||step===3);
 $('runLimitControl').hidden=!runView||mode==='maximum';$('runLimitLabel').textContent=torqueMode?'Mez otáček':'Momentový limit';slider('runLimit',0,torqueMode?9000:140,torqueMode?50:1,torqueMode?target:torqueLimit);
 $('rampControl').hidden=!runView||mode==='maximum';$('rampLabel').textContent=torqueMode?'Rampa momentu':'Rampa otáček';slider('runRamp',torqueMode?50:200,torqueMode?2000:2000,50,torqueMode?torqueRamp:ramp);
 if(!drive||!$('layers').children.length)$('layers').innerHTML=drive?'<label><input id="family" type="checkbox"> Další otáčky</label><label><input id="iso" type="checkbox" checked> Stejný moment</label><label><input id="optimal" type="checkbox" checked> MTPA / MTPV</label><label><input id="overview" type="checkbox"> Celé elipsy</label>':`<label><input id="lock" type="checkbox" checked> Držet velikost proudu</label><label><input id="flux" type="checkbox" ${step===4?'checked':''}> Tok</label><label><input id="voltage" type="checkbox" ${step>=3?'checked':''}> Napěťový polygon</label><button id="optimum">Nastavit MTPA</button>`;
 $('layers').querySelectorAll('input').forEach(el=>el.onchange=()=>{dirty=true;render();});
 if(!drive)$('optimum').onclick=()=>{const a=F.mtpa(s,amp);angle=Math.atan2(-a.d,a.q)*180/Math.PI;$('controlB').value=angle;render();};
 $('mapTitle').textContent=drive?'Co dovolí proud a napětí?':'Proud v rotorových souřadnicích';
 $('mapMode').innerHTML=drive?'Proudové souřadnice d/q':math(String.raw`d=\operatorname{Re},\quad q=\operatorname{Im}`);
 $('machinePanel').hidden=drive;$('lower').hidden=!drive;
 if(!drive){
  const explanation=$('machinePanel').querySelector('.explain');
  const moments=$('lowerLegend');
  if(moments.parentElement!==explanation)explanation.append(moments);
 }
 $('lowerTitle').textContent=drive?(step===3?'Proud zůstává, moment se blíží nule':step===2?'Rozjezd: moment podle otáček':'Výkon a stejné otáčky'):'Rotor a vznik momentu';
 $('upperTitle').textContent=drive?(step===3?'Podélný tok: úplná kompenzace':step===2?(torqueMode?'Otáčky a nastavená mez':'Skutečné a požadované otáčky'):'Dosažitelný a požadovaný moment'):'Stejný proud, různý moment';
 if(drive){legend('mapLegend',[[C.limit,'Proudová mez'],[C.u,'Napěťová mez'],[C.i,'Pracovní bod'],[C.d,'MTPA'],[C.ink,'MTPV']]);}
 else legend('mapLegend',[[C.i,'Proud'],[C.d,'Podélná složka'],[C.q,'Příčná složka'],[C.u,'Napětí']]);
 dirty=true;
}
function getPoint(){if(!drive){const t=angle*Math.PI/180;return {...F.point(s,-amp*Math.sin(t),amp*Math.cos(t),speed),feasible:true};}if(step===2)return run.a||F.requested(s,run.n,0);if(step===3)return F.fieldWeakeningLimit(s);return step===1?F.maximum(s,speed):F.requested(s,speed,demand);}
let mapTransform;
function drawDriveMap(a){
 const full=selected('overview'),Ic=s.psi/s.Ld;
 const relevant=!a.limit&&Array.from({length:120},(_,i)=>{const t=i*Math.PI/60;return F.point(s,s.Imax*Math.cos(t),s.Imax*Math.sin(t),a.n).U;}).some(u=>u>a.Umax);
 const voltage=relevant?F.voltageCurve(s,a.n,480):[];
 const family=selected('family')?[1000,3000,6000,9000].map((n,i)=>({n,color:['#9ab2bc','#7893ad','#53718d','#344f68'][i],points:F.voltageCurve(s,n,480)})):[];
 let minD=-1.2*Math.max(s.Imax,Ic),maxD=.18*s.Imax,minQ=-.12*s.Imax,maxQ=1.15*s.Imax;
 if(full){const all=[{d:-s.Imax,q:-s.Imax},{d:s.Imax,q:s.Imax},{d:-Ic,q:0},...voltage,...family.flatMap(r=>r.points)];minD=Math.min(...all.map(p=>p.d));maxD=Math.max(...all.map(p=>p.d));minQ=Math.min(...all.map(p=>p.q));maxQ=Math.max(...all.map(p=>p.q));}
 const L=65,R=675,T=48,B=440,k=Math.min((R-L)/(maxD-minD),(B-T)/(maxQ-minQ)),ox=(L+R)/2-(maxD+minD)*k/2,oy=(T+B)/2+(maxQ+minQ)*k/2,xy=(d,q)=>[ox+k*d,oy-k*q];
 mapTransform={k,ox,oy,orientation:'d-right-q-up',overview:!!full};
 let h=`<defs><clipPath id="drive-clip"><rect x="${L}" y="${T}" width="${R-L}" height="${B-T}"/></clipPath></defs>`;
 for(const v of [-s.Imax,-s.Imax/2,0,s.Imax/2,s.Imax]){const [x,y]=xy(v,v);if(x>=L&&x<=R)h+=path([[x,T],[x,B]],'#edf1ef',1);if(y>=T&&y<=B)h+=path([[L,y],[R,y]],'#edf1ef',1);}
 h+=arrow([L,oy],[R+12,oy],'#91a8a0',1.2)+arrow([ox,B],[ox,T-12],'#91a8a0',1.2);
 h+=label(R-22,oy+27,'i_d\\;[\\mathrm A]',C.d,15,110)+label(ox+30,T-22,'i_q\\;[\\mathrm A]',C.q,15,110);
 for(const v of [-s.Imax,-s.Imax/2,0]){const p=xy(v,0);if(p[0]>L&&p[0]<R)h+=label(p[0],oy+22,fmt(v,0),C.muted,13,70);}
 for(const v of [s.Imax/2,s.Imax]){const p=xy(0,v);if(p[1]>T&&p[1]<B)h+=label(ox+29,p[1]+4,fmt(v,0),C.muted,13,55);}
 h+='<g clip-path="url(#drive-clip)">';
 let upper=[],lower=[];for(let i=0;!a.limit&&i<=320;i++){const d=-s.Imax+2*s.Imax*i/320,r=F.qRange(s,d,a.n);if(r){upper.push(xy(d,r[1]));lower.push(xy(d,r[0]));}}
 if(upper.length)h+=`<path d="${[...upper,...lower.reverse()].map((p,i)=>(i?'L':'M')+p.join(' ')).join('')}Z" fill="#edf6f1"/>`;
 h+=`<circle cx="${ox}" cy="${oy}" r="${s.Imax*k}" fill="none" stroke="${C.limit}" stroke-width="2" stroke-dasharray="6 4"/>`;
 const torqueCurve=m=>{let pts=[];for(let i=0;i<=400;i++){const d=minD+(maxD-minD)*i/400,den=1.5*s.p*(s.psi+(s.Ld-s.Lq)*d);pts.push(den>1e-9?xy(d,m/den):null);}return pts.filter(Boolean);};
 if(selected('iso'))for(const m of [20,40,60,80]){
  h+=path(torqueCurve(m),'#c3d3e0',1.2);
  const p=xy(0,m/(1.5*s.p*s.psi));if(!full&&p[1]>T+24&&p[1]<B-20)h+=label(p[0]+90,p[1]-8,val(m,'N\\,m',0),'#7492ac',13,100);
 }
 for(const row of family)h+=path(row.points.map(p=>xy(p.d,p.q)),row.color,1.2,'3 5');
 if(step===0)h+=path(torqueCurve(demand),C.q,2,'5 4');
 if(selected('optimal')){
  h+=path(Array.from({length:101},(_,i)=>F.mtpa(s,i*s.Imax/100)).map(p=>xy(p.d,p.q)),C.d,3);
  const branch=extendedCurves.filter(p=>p.feasible&&p.regime==='mtpv');h+=path(branch.map(p=>xy(p.d,p.q)),C.ink,3).replace('<path','<path data-mtpv-curve="true"');if(branch.length&&F.fieldWeakeningLimit(s).feasible)h+=path([xy(branch.at(-1).d,branch.at(-1).q),xy(-Ic,0)],C.ink,2,'2 3');
 }
 h+=path(voltage.map(p=>xy(p.d,p.q)),C.u,3);
 const trail=step===3?extendedCurves:step===2?run.history:step===1?curves:history;
 h+=`<g data-trajectory="${step===2?'actual-run':step===1?'maximum':'requested'}">`+path(trail.filter(p=>p.feasible!==false&&Number.isFinite(p.d)&&Number.isFinite(p.q)).map(p=>xy(p.d,p.q)),C.i,2.5,'6 4')+'</g>';
 h+=path([xy(a.d,0),xy(a.d,a.q),xy(0,a.q)],'#89aaa0',1,'3 4');
 if(a.feasible||a.limit)h+=arrow(xy(0,0),xy(a.d,a.q),a.feasible?C.i:C.limit,3.2)+`<circle class="current-dot" cx="${xy(a.d,a.q)[0]}" cy="${xy(a.d,a.q)[1]}" r="7" fill="${a.feasible?C.i:C.limit}" stroke="white" stroke-width="2.5"/>`;
 if(incoming)h+=`<circle cx="${xy(incoming.d,incoming.q)[0]}" cy="${xy(incoming.d,incoming.q)[1]}" r="9" fill="white" stroke="${C.muted}" stroke-width="2"/>`;
 h+='</g>';
 if(selected('optimal')&&!full){const b=F.mtpa(s,s.Imax*.8),p=xy(b.d,b.q);h+=label(p[0]+55,p[1]-8,'\\mathrm{MTPA}',C.d,16,100);const branch=curves.filter(p=>p.feasible&&p.regime==='mtpv'),v=branch[Math.floor(branch.length/2)];if(v){const p=xy(v.d,v.q);h+=label(p[0]-65,p[1]+22,'\\mathrm{MTPV}',C.ink,16,105);}}
 const center=xy(-Ic,0);h+=dot(...center,C.ink,4)+label(center[0]-24,oy-17,'D_{\\infty}',C.ink,16,65)+label(center[0],oy+50,'-\\Psi_{\\mathrm{PM}}/L_d',C.ink,14,150);
 h+=label(170,25,a.limit?'n\\to\\infty':'n='+val(a.n,'min^{-1}',0),C.u,16,240)+label(590,490,'I_{\\max}='+val(s.Imax,'A',0),C.limit,16,240);
 $('map').innerHTML=h;
 legend('mapLegend',[[C.limit,'Proudová mez'],...(a.limit?[[C.ink,'Mezní bod úplného odbuzení']]:[[C.u,'Mez při aktuálních otáčkách']]),[C.i,step===2?'Bod a stopa rozjezdu':'Bod a trajektorie'],...(step===0?[[C.q,'Požadovaný moment']]:[]),...(full&&selected('optimal')?[[C.d,'MTPA'],[C.ink,'MTPV']]:[]),...family.map(r=>[r.color,math('n='+val(r.n,'min^{-1}',0))])]);
 $('mapHint').textContent=a.limit?'Mez ideálního elektrického modelu. Proud míří do bodu úplné kompenzace toku; simulace neroztáčí rotor do nekonečna.':full?'Celé elipsy: přehled automaticky přizpůsobuje měřítko.':(relevant?'Pevné měřítko · motorický výřez. Zelená plocha splňuje oba limity.':'Pevné měřítko · napěťová mez zatím neomezuje proudový kruh.')+(step===2?($('startMode').value==='maximum'?' Výuková ukázka maxima; v cíli se pozastaví.':runMode()==='torque'?' Žádaný moment → proudové a napěťové meze → motor. Zátěž působí proti motoru.':' Otáčková rampa → PI regulátor → momentový požadavek → motor.'):' Zvyšujte otáčky: napěťová mez se zmenšuje, proudový kruh zůstává.');
}
function drawMap(a){
 if(drive){drawDriveMap(a);return;}
 const voltageRelevant=drive&&Array.from({length:120},(_,i)=>{const t=i*Math.PI/60;return F.point(s,s.Imax*Math.cos(t),s.Imax*Math.sin(t),a.n).U;}).some(u=>u>a.Umax);
 const voltagePoints=voltageRelevant?F.voltageCurve(s,a.n):[],family=drive&&selected('family')?[1000,3000,6000,9000].map(n=>({n,points:F.voltageCurve(s,n)})):[];
 const bounds=[{d:s.Imax,q:s.Imax},{d:-s.Imax,q:-s.Imax},{d:a.d,q:a.q},...(drive?[{d:-s.psi/s.Ld,q:0}]:[]),...voltagePoints,...family.flatMap(row=>row.points)];
 const minD=Math.min(...bounds.map(v=>v.d)),maxD=Math.max(...bounds.map(v=>v.d)),minQ=Math.min(...bounds.map(v=>v.q)),maxQ=Math.max(...bounds.map(v=>v.q)),k=Math.min(550/(maxQ-minQ),350/(maxD-minD)),ox=350+(maxQ+minQ)*k/2,oy=250+(maxD+minD)*k/2,xy=(d,q)=>[ox-k*q,oy-k*d],extent=Math.max(Math.abs(minD),Math.abs(maxD));mapTransform={k,ox,oy};
 let h='<defs><clipPath id="plot-clip"><rect x="30" y="25" width="680" height="470"/></clipPath></defs>';
 h+=arrow([ox,485],[ox,35],'#a8bab3',1)+arrow([695,oy],[40,oy],'#a8bab3',1)+label(ox+26,42,'+d',C.d)+label(50,oy-20,'+q',C.q);
 h+=`<g clip-path="url(#plot-clip)">`;
 h+=`<circle cx="${ox}" cy="${oy}" r="${s.Imax*k}" fill="none" stroke="${drive?C.limit:'#c9d8d1'}" stroke-width="${drive?2:1}" stroke-dasharray="6 4"/>`;
 {
   if(step>=2)h+=path(Array.from({length:81},(_,i)=>F.mtpa(s,i/80*s.Imax)).map(v=>xy(v.d,v.q)),C.d,2,'5 4');
   if(selected('flux')){const z=155/Math.max(.01,s.psi+s.Lq*s.Imax),fxy=(d,q)=>[ox-z*q,oy-z*d];h+=arrow([ox,oy],fxy(s.psi,0),C.d,3)+arrow([ox,oy],fxy(a.fd,a.fq),'#af708e',3)+label(...fxy(a.fd,a.fq),'\\overline{\\psi}', '#af708e',16);}
   if(selected('voltage')){const z=150/Math.max(a.U,a.Umax,Math.abs(a.w*s.psi),1),vxy=(d,q)=>[ox-z*q,oy-z*d];let d=0,q=0;for(const [dd,qq,c]of [[0,a.w*s.psi,C.d],[0,a.w*s.Ld*a.d,C.q],[-a.w*s.Lq*a.q,0,C.q],[s.R*a.d,s.R*a.q,C.limit]]){h+=arrow(vxy(d,q),vxy(d+dd,q+qq),c,2);d+=dd;q+=qq;}
    h+=arrow([ox,oy],vxy(a.ud,a.uq),C.u,3)+label(...vxy(a.ud,a.uq),'\\overline U_a',C.u,17)+label(ox-25,oy-z*a.w*s.psi-17,'\\overline U_{ib}',C.d,15);
   }
 }
 h+=path([xy(a.d,0),xy(a.d,a.q),xy(0,a.q)],'#a9bcb4',1,'4 4');h+=arrow([ox,oy],xy(a.d,0),C.d,3)+arrow([ox,oy],xy(0,a.q),C.q,3)+arrow([ox,oy],xy(a.d,a.q),C.i,3.5);
 h+=label(ox+28,oy-k*a.d*.65,'i_d',C.d)+label(ox-k*a.q*.6,oy-22,'i_q',C.q);
 if(!drive&&a.I>1e-6){const e=angle*Math.PI/180,arc=Array.from({length:31},(_,i)=>[ox-43*Math.cos(e*i/30),oy+43*Math.sin(e*i/30)]);h+=path(arc,C.muted,1.5)+label(ox-67*Math.cos(e/2),oy+67*Math.sin(e/2),'\\varepsilon',C.muted,15);h+=label(xy(a.d,a.q)[0]-16,xy(a.d,a.q)[1]+23,'\\overline i',C.i,16);}
 if(drive&&incoming){const pos=xy(incoming.d,incoming.q);h+=`<circle cx="${pos[0]}" cy="${pos[1]}" r="9" fill="white" stroke="${C.muted}" stroke-width="2"/>`;}
 if(a.feasible)h+=`<circle class="current-dot" cx="${xy(a.d,a.q)[0]}" cy="${xy(a.d,a.q)[1]}" r="8" fill="${C.i}" stroke="white" stroke-width="3"/>`;
 h+='</g>';
 if(drive&&selected('family'))[1000,3000,6000,9000].forEach((n,i)=>{h+=label(105+175*i,505,val(n,'min^{-1}',0),['#9ab2bc','#7893ad','#53718d','#344f68'][i],12,155);});
 h+=label(630,480,val(s.Imax,'A',0),C.limit,15);$('map').innerHTML=h;
 $('mapHint').textContent=drive?(incoming?'Dutý bod je převzatý proud; plný bod je optimalizovaný.':!voltageRelevant?'Napěťová mez nyní neomezuje proudový kruh. Je mimo zobrazení; při jejím dosažení se objeví celá elipsa.':'Zelená plocha splňuje oba limity. Měřítko zahrnuje celou napěťovou mez; čárkovaně trajektorie režimu.'):'Táhněte proudem nebo použijte posuvníky. Proud, tok a napětí mají vlastní měřítka.';
}
function graph(id,{xmin=0,xmax=9000,ymin=0,ymax=100,xtex='n\\;[\\mathrm{min}^{-1}]',ytex='M\\;[\\mathrm{N\\,m}]',series=[],dots=[],vertical=null}){
 const L=75,R=662,T=38,B=214,X=x=>L+(x-xmin)/(xmax-xmin)*(R-L),Y=y=>B-(y-ymin)/(ymax-ymin)*(B-T),clip=id+'-clip';let h=`<defs><clipPath id="${clip}"><rect x="${L}" y="${T}" width="${R-L}" height="${B-T}"/></clipPath></defs>`;
 for(let i=0;i<=4;i++){const v=ymin+(ymax-ymin)*i/4,y=Y(v);h+=path([[L,y],[R,y]],'#e5ece8',1)+label(L-34,y+4,fmt(v,Math.abs(ymax)<10?1:0),C.muted,12,62);}
 for(let i=0;i<=3;i++){const v=xmin+(xmax-xmin)*i/3,x=X(v);h+=path([[x,T],[x,B]],'#e5ece8',1)+label(x,B+19,fmt(v,0),C.muted,12);}
 h+=path([[L,T],[L,B],[R,B]],'#9ab1a7',1)+label(125,16,ytex,C.ink,14,225)+label(570,250,xtex,C.ink,14,245);
 h+=`<g clip-path="url(#${clip})">`;if(vertical!==null)h+=path([[X(vertical),T],[X(vertical),B]],'#bdc9c2',1,'4 3');
 let fills='',curves='';
 for(const row of series){let part=[];const flush=()=>{
  const points=part.map(([x,y])=>[X(x),Y(y)]);
  if(row.area&&points.length>1){
   const base=Y(0),gradient=id+'-area';
   fills+=`<polygon points="${points[0][0]},${base} ${points.join(' ')} ${points.at(-1)[0]},${base}" fill="url(#${gradient})"/>`;
  }
  curves+=path(points,row.color,row.width||2,row.dash||'');part=[];
 };for(const p of row.points){if(!p||!p.every(Number.isFinite)){flush();continue;}part.push(p);}flush();}
 if(fills){
  const color=series.find(row=>row.area).color;
  h+=`<defs><linearGradient id="${id}-area" x2="0" y2="1"><stop stop-color="${color}" stop-opacity=".24"/><stop offset="1" stop-color="${color}" stop-opacity=".012"/></linearGradient></defs>`+fills;
 }
 h+=curves;
 for(const p of dots)h+=dot(X(p.x),Y(p.y),p.color||C.i);h+='</g>';$(id).innerHTML=h;
}
function limitPlots(a){
 const base=[170,210],top=[170,50];let h='';
 h+=arrow([170,225],[170,25],'#a8bab3',1)+label(195,26,'+d',C.d,15,50);
 h+=arrow(base,top,C.d,4)+arrow([220,50],[220,210],C.q,4);
 h+=label(90,115,'\\Psi_{\\mathrm{PM}}',C.d,20,120)+label(275,115,'L_di_d',C.q,20,100);
 h+=label(475,65,'\\psi_d=\\Psi_{\\mathrm{PM}}+L_di_d\\to0',C.ink,19,390);
 h+=label(470,115,'L_di_d\\to-'+val(s.psi,'Wb',3),C.q,19,320);
 h+=label(470,165,'\\psi_q=L_qi_q\\to0',C.ink,19,320);
 h+='<text x="350" y="220" fill="#617779" font-size="16">Tok magnetů se sám neztrácí.</text>';
 $('upper').innerHTML=h;
 h=arrow([170,220],[170,25],'#a8bab3',1)+arrow([210,50],[80,50],'#a8bab3',1)+label(195,26,'+d',C.d,15,50)+label(75,35,'+q',C.q,15,50);
 h+=arrow([170,50],[170,205],a.feasible?C.i:C.limit,4)+label(105,135,'\\overline i',C.i,22,80);
 h+=label(465,48,'i_d\\to-\\frac{\\Psi_{\\mathrm{PM}}}{L_d}=-'+val(a.I,'A'),C.i,19,410);
 h+=label(460,104,'i_q\\to0,\\qquad M\\to0',C.ink,19,360);
 h+=label(460,158,a.feasible?'P_{\\infty}='+val(a.P/1000,'kW'):'\\text{Mezní stav není přípustný}',a.feasible?C.ink:C.limit,19,410);
 h+=label(430,215,'|\\overline i|\\to I_c=\\Psi_{\\mathrm{PM}}/L_d',C.i,18,430);
 $('lower').innerHTML=h;
 legend('upperLegend',[[C.d,'Magnety'],[C.q,'Účinek podélného proudu']]);
 $('lowerLegend').textContent=a.feasible?'Elektrická limita maximálního momentu; mechanické ztráty zde nejsou zahrnuty.':'Změňte parametry nebo proudový limit; tento bod nelze s danými mezemi dosáhnout.';
}
function plots(a){
 if(drive&&a.limit){limitPlots(a);return;}
 if(!drive){const pts=Array.from({length:166},(_,i)=>{const e=(-75+i)*Math.PI/180;return {e:-75+i,...F.point(s,-amp*Math.sin(e),amp*Math.cos(e),speed)};}),max=Math.max(10,...pts.flatMap(v=>[v.M,v.mag,v.rel])),min=Math.min(0,...pts.flatMap(v=>[v.M,v.mag,v.rel]));
 graph('upper',{xmin:-75,xmax:90,ymin:Math.floor(min/10)*10,ymax:Math.ceil(max/10)*10,xtex:'\\varepsilon\\;[{}^\\circ]',series:[['mag',C.d],['rel',C.u],['M',C.i]].map(([key,color])=>({color,points:pts.map(v=>[v.e,v[key]])})),dots:[{x:angle,y:a.M}],vertical:angle});
 legend('upperLegend',[[C.i,'Celkový moment'],[C.d,'Magnetický'],[C.u,'Reluktanční']]);
 const st=SyncPrinciple.create();Object.assign(st,{type:s.type==='spm'?'spm4':'ipm4',rotor:Math.PI/2,field:Math.PI/2+Math.atan2(a.q,a.d)/s.p,excitation:false,damper:false});
 $('machine').innerHTML=SyncMachineArt(st,false,{axes:false,forces:false,currentScale:a.I/s.Imax,driveLabel:''},'').replace(/<g class="drive-marker">[\s\S]*?<\/g>/,'');
 $('machineNote').textContent=s.type==='spm'?'Povrchové magnety: v tomto lineárním modelu jsou indukčnosti shodné, reluktanční moment je nulový.':'Vnořené magnety: rozdílné indukčnosti dovolují využít také reluktanční moment.';
 put('machineParams','L_d='+val(s.Ld*1000,'mH')+String.raw`,\quad L_q=`+val(s.Lq*1000,'mH')+String.raw`\quad p=`+s.p);
 $('lowerLegend').innerHTML=math('M_{\\mathrm{PM}}='+val(a.mag,'N\\,m')+'\\qquad M_{\\mathrm{rel}}='+val(a.rel,'N\\,m'));
 }else if(step===2){const rows=run.history,xmax=Math.max(12,Math.ceil(run.t/6)*6),xmin=Math.max(0,xmax-30);
 graph('upper',{xmin,xmax,ymax:Math.max(3000,target*1.15,run.n*1.1),xtex:'t\\;[\\mathrm{s}]',ytex:'n\\;[\\mathrm{min}^{-1}]',series:[{color:C.muted,dash:'5 4',points:rows.map(r=>[r.t,r.ref])},{color:C.i,area:true,points:rows.map(r=>[r.t,r.n])}]});
 const forecast=preview?.rows||[],maxTorque=Math.max(100,...curves.map(p=>p.M),...curves.map(p=>F.loadTorque(p.n,load,$('loadKind').value)+.002*p.n*Math.PI/30));
 graph('lower',{ymax:maxTorque*1.12,series:[
  {color:C.muted,dash:'3 5',points:curves.map(p=>p.feasible?[p.n,p.M]:null)},
  {color:C.limit,points:curves.map(p=>[p.n,F.loadTorque(p.n,load,$('loadKind').value)])},
  {color:C.limit,dash:'3 4',points:curves.map(p=>[p.n,F.loadTorque(p.n,load,$('loadKind').value)+.002*p.n*Math.PI/30])},
  {color:C.q,dash:'6 4',points:forecast.map(p=>[p.n,p.M])},
  {color:C.i,width:3,points:rows.map(p=>[p.n,p.M])}
 ],dots:[...(a.feasible?[{x:run.n,y:a.M}]:[]),...(preview?.equilibrium&&forecast.length?[{x:forecast.at(-1).n,y:forecast.at(-1).M,color:C.q}]:[])],vertical:target});
 legend('upperLegend',[[C.i,'Skutečné otáčky'],[C.muted,runMode()==='torque'?'Mez otáček':'Otáčkový požadavek']]);
 legend('lowerLegend',[[C.muted,'Maximum motoru'],[C.limit,'Zátěž · čárkovaně včetně tření'],[C.q,preview?.done?(preview.equilibrium?(preview.state.n<1?'Náhled: motor zůstane stát':'Náhled a ustálený bod'):preview.state.finished?'Náhled do konce ukázky':'Náhled: omezený časový horizont'):'Náhled se dopočítává'],[C.i,'Skutečný rozjezd']]);
 }else{
 const trail=step===1?curves:history,maxM=Math.ceil(Math.max(50,...curves.map(v=>v.M))*1.15/20)*20,maxP=Math.ceil(Math.max(5,...curves.filter(v=>v.feasible).map(v=>v.P/1000))*1.2/5)*5;
 graph('upper',{ymax:maxM,series:[{color:C.muted,dash:'6 4',points:curves.map(v=>v.feasible?[v.n,v.M]:null)},{color:C.i,points:trail.map(v=>v.feasible?[v.n,v.M]:null)},...(step===0?[{color:C.q,dash:'3 4',points:[[0,demand],[9000,demand]]}]:[])],dots:a.feasible?[{x:a.n,y:a.M}]:[],vertical:a.n});
 graph('lower',{ymax:maxP,ytex:'P\\;[\\mathrm{kW}]',series:[{color:C.muted,dash:'6 4',points:curves.map(v=>v.feasible?[v.n,v.P/1000]:null)},{color:C.i,points:trail.map(v=>v.feasible?[v.n,v.P/1000]:null)}],dots:a.feasible?[{x:a.n,y:a.P/1000}]:[],vertical:a.n});
 legend('upperLegend',[[C.muted,'Dovolená obálka'],[C.i,step===1?'Maximum pohonu':'Dosažený moment'],...(step===0?[[C.q,'Požadavek']]:[])]);legend('lowerLegend',[[C.muted,'Dovolený výkon'],[C.i,'Pracovní výkon']]);
 }
}
function render(){
 preparePreview();
 const a=getPoint();$('transfer').disabled=a.limit||!drive&&a.M<0;$('transfer').title=a.limit?'Mez pro nekonečné otáčky není konečný pracovní bod.':!drive&&a.M<0?'Druhý modul řeší motorický provoz. Zvolte kladný moment.':'';drawMap(a);plots(a);put('controlAOut',drive?(step===3?val(a.I,'A'):step===2?(runMode()==='torque'?val(torque,'N\\,m'):val(target,'min^{-1}',0)):val(step===1?a.M:demand,'N\\,m')):val(amp,'A',0));put('controlBOut',drive?val(step===2?load:s.Imax,step===2?'N\\,m':'A',0):fmt(angle,1)+'^\\circ');put('speedOut',a.limit?'n\\to\\infty':val(drive&&step===2?run.n:speed,'min^{-1}',0));
 if(drive&&step===2){put('runLimitOut',runMode()==='torque'?val(target,'min^{-1}',0):val(torqueLimit,'N\\,m',0));put('runRampOut',runMode()==='torque'?val(torqueRamp,'N\\,m\\,s^{-1}',0):val(ramp,'min^{-1}\\,s^{-1}',0));}
 if(drive&&step===1)$('controlA').value=a.M;
 const rows=[['i_d',a.d,'A'],['i_q',a.q,'A'],['M',a.M,'N\\,m'],['|\\overline i|',a.I,'A'],['|\\overline U_a|',a.U,'V'],['P',a.P/1000,'kW']];$('values').innerHTML=rows.map(([t,v,u])=>'<div><span>'+math(t)+'</span><strong>'+math(a.limit&&!a.feasible&&t==='P'?'\\text{nedosažitelné}':(a.limit?'\\to ':'')+val(v,u))+'</strong></div>').join('');
 put('currentUse','I/I_{\\max}='+fmt(100*a.I/s.Imax,0)+'\\,\\%');put('voltageUse','U/U_{\\max}='+fmt(100*a.U/a.Umax,0)+'\\,\\%');$('voltageUse').className=a.U>a.Umax*1.001?'warning':'';$('currentUse').className=a.I>s.Imax*1.001?'warning':'';
 let title='',message='';if(!drive){const opt=F.mtpa(s,amp);title=a.U>a.Umax?'Tento proud už měnič při daných otáčkách neudrží':step>=2?'Najděte nejvyšší moment na kružnici proudu':'Proud rozdělujeme podle rotoru';message=a.U>a.Umax?'Zkuste zápornější podélnou složku nebo nižší otáčky. Ruční diagram požadavek neomezuje; dosažitelnost ověří druhý modul.':step===4?'Odbuzování mění výsledný tok, nikoli vlastní tok permanentních magnetů. Sledujte, kolik proudu zbude pro moment.':s.type==='spm'?'U povrchových magnetů vytváří moment příčná složka. Podélný proud zde pomáhá až při omezení napětí.':'Záporný podélný proud může přidat reluktanční moment. Maximum pro stejnou velikost proudu ukáže tlačítko MTPA.';
 if(step===2)message+=' '+ 'Zlatá křivka spojuje proudová optima.';
 }else{title={mtpa:'MTPA · proud využíváme pro moment',fw:'Odbuzování · napětí dosáhlo meze',mtpv:'MTPV · maximum při napěťové mezi',unavailable:'Pro tyto otáčky není přípustný pracovní bod'}[a.regime]||'Rozjezd připraven';message=!a.feasible?'Zvyšte napětí nebo změňte parametry stroje. Samotné zvýšení požadovaného momentu nepomůže.':a.limited?'Požadovaný moment přesahuje možnosti měniče. Zelený bod i graf ukazují skutečně dosažitelné maximum.':a.regime==='fw'?'Záporná podélná složka uvolňuje napěťovou rezervu. Pokud ještě zbývá proudová rezerva, požadovaný moment lze zachovat.':a.regime==='mtpv'?'Napětí je vyčerpané, proud již nemusí být na maximu. Další proud by v tomto bodě nepřinesl větší přípustný moment.':'Momentový požadavek splníme s nejmenší velikostí proudu. Zvyšujte otáčky a sledujte napěťovou mez.';
 if(step===2&&run.a?.feasible)message=Math.abs(run.n-target)<15&&Math.abs(run.a.accel)<.5?'Cílové otáčky dosaženy. Moment nyní kryje zátěž a ztráty; proud proto už nemusí ležet na MTPV.':run.a.accel>.5?'Moment motoru překonává zátěž i mechanické ztráty: rotor zrychluje. Sledujte průchod oblastmi v proudové mapě.':run.a.accel<-.5?'Moment motoru nestačí na zátěž a mechanické ztráty. Rotor zpomaluje nebo zůstává stát.':'Motor udržuje přibližně stálé otáčky; moment kryje zátěž a mechanické ztráty.';
 }
 if(drive&&step===2&&!run.t)message=runMode()==='torque'?'Nastavte žádaný moment motoru, samostatně zátěž a mez otáček. Po spuštění lze tyto hodnoty měnit za běhu.':runMode()==='ramp'?'Zadejte otáčky, rampu a momentový limit. Moment určuje PI regulátor; zátěž je samostatný mechanický účinek.':'Výuková ukázka žádá maximum a pozastaví se v cíli. Běžný pohon tímto způsobem otáčky neudržuje.';
 if(drive&&step===2&&run.a?.speedLimited)message='Omezovač otáček snížil moment pod požadavek. Motor kryje zátěž a ztráty; proto může opustit MTPV.';
 else if(drive&&step===2&&run.a?.torqueLimited)message='Momentový požadavek je omezen limitem nebo možnostmi měniče. Modrá křivka je požadavek, zelená skutečný moment.';
 if(drive&&step===2&&run.finished)message='Ukázka je pozastavena na maximální obálce. Toto není ustálený chod: bez pozastavení by rotor dál zrychloval.';
 if(a.limit){title=a.feasible?'Mez odbuzení · tok je kompenzován':!a.currentOK?'Úplné odbuzení leží mimo proudovou mez':'Napětí nestačí ani na odporový úbytek';message=a.feasible?'Podélný proud ruší tokovou vazbu magnetů, příčný proud a moment míří k nule. Výkon podél maximální obálky má konečnou limitu.':'Zobrazený bod je geometrický cíl, nikoli dovolený pracovní stav. Při těchto parametrech není neomezený rozsah otáček elektricky možný.';}
 if(drive&&step===2){const reason=startProblem();$('play').disabled=!!reason&&!playing;$('play').textContent=run.finished?'Spustit znovu':playing?'Pozastavit':run.t>0?'Pokračovat':'Spustit';$('runState').textContent=reason|| (run.finished?'Dokončeno · bod na obálce':playing?(a.speedLimited?'Omezení otáček':a.torqueLimited?'Moment omezen':'Probíhá'):run.t>0?'Pozastaveno':'Připraveno · stiskněte Spustit');}
 $('statusTitle').textContent=title;$('statusText').textContent=message;dirty=false;window.pmsmState=()=>({s:{...s},step,drive,config:runConfig(),point:getPoint(),run:{t:run.t,n:run.n,finished:run.finished},playing,preview:preview?{done:preview.done,equilibrium:preview.equilibrium,points:preview.rows.length,end:preview.rows.at(-1)}:null,map:{...mapTransform}});
}
const specs=[['Imax','Proudový limit',40,150,1,'A',0],['Udc','Napětí meziobvodu',120,450,5,'V',0],['psi','Toková vazba magnetů',.08,.3,.005,'Wb',3],['Ld','Podélná indukčnost',.0015,.006,.0001,'mH',1],['Lq','Příčná indukčnost',.0015,.009,.0001,'mH',1],['R','Odpor fáze',0,.3,.01,'\\Omega',2],['J','Setrvačnost',.04,.6,.01,'kg\\,m^2',2]].filter(([key])=>drive||key!=='J');
function refreshSettings(){for(const [key,,,,,unit,n]of specs){const v=key==='J'?J:key==='ramp'?ramp:s[key],el=$('param-'+key);if(!el)continue;el.value=v;put('param-'+key+'-out',key==='R'?fmt(v,n)+'\\,\\Omega':val(v*(key==='Ld'||key==='Lq'?1000:1),unit,n));}put('characteristic','I_c=\\Psi_{\\mathrm{PM}}/L_d='+val(s.psi/s.Ld,'A')+'\\qquad I_{\\max}='+val(s.Imax,'A',0));}
function settings(){ $('parameterControls').innerHTML=specs.map(([key,title,min,max,inc,unit,n])=>`<label class="control"><span>${title}<output id="param-${key}-out"></output></span><input id="param-${key}" type="range" min="${min}" max="${max}" step="${inc}" value="${key==='J'?J:key==='ramp'?ramp:s[key]}"></label>`).join('');
 for(const [key,, , , ,unit,n] of specs){const input=$('param-'+key);input.disabled=key==='Lq'&&s.type==='spm';const show=()=>{const v=key==='J'?J:key==='ramp'?ramp:s[key];put('param-'+key+'-out',key==='R'?fmt(v,n)+'\\,\\Omega':val(v*(key==='Ld'||key==='Lq'?1000:1),unit,n));};show();input.oninput=()=>{incoming=null;if(key==='J')J=+input.value;else if(key==='ramp')ramp=+input.value;else{s[key]=+input.value;if(s.type==='spm')s.Lq=s.Ld;else if(s.Lq<s.Ld)s.Lq=s.Ld;stop();amp=Math.min(amp,s.Imax);}stop();show();refreshSettings();rebuild();configure();render();};}
 put('characteristic','I_c=\\Psi_{\\mathrm{PM}}/L_d='+val(s.psi/s.Ld,'A')+'\\qquad I_{\\max}='+val(s.Imax,'A',0));
}
for(const el of document.querySelectorAll('[data-tex]'))SyncMath.set(el,el.dataset.tex);
$('parameters').onclick=()=>{stop(false);render();settings();$('settings').showModal();};$('theory').onclick=()=>{stop(false);render();$('explanation').showModal();};$('viewOptions').onclick=()=>{stop(false);render();$('plotSettings').showModal();};$('mapTask').onchange=()=>{stop(false);step=mapStep=+$('mapTask').value;configure();render();};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('stronger').onclick=()=>{incoming=null;s.psi=Math.min(.3,s.psi+.04);stop();rebuild();settings();configure();render();};
$('type').onchange=()=>{incoming=null;const next=$('type').value;s=F.parameters(next,{Imax:s.Imax,Udc:s.Udc,psi:s.psi,R:s.R});stop();rebuild();configure();render();};
$('controlA').oninput=()=>{incoming=null;const v=+$('controlA').value;if(drive){if(step===2){if(runMode()==='torque')torque=v;else target=v;}else{demand=v;history=curves.map(a=>F.requested(s,a.n,demand,a));}}else amp=v;render();};
$('controlB').oninput=()=>{incoming=null;const v=+$('controlB').value;if(drive){if(step===2){load=v;}else{s.Imax=v;stop();rebuild();}}else angle=v;render();};
$('speed').oninput=()=>{incoming=null;speed=+$('speed').value;render();};
$('reset').onclick=()=>{incoming=null;s=F.parameters();step=drive?2:0;amp=80;angle=25;speed=1000;demand=60;target=9000;load=5;J=.5;ramp=800;torque=60;torqueLimit=100;torqueRamp=400;$('startMode').value='torque';$('loadKind').value='constant';mapStep=0;stop();rebuild();configure();if($('settings').open)settings();render();};
$('mtpvDemo').hidden=!drive;$('mtpvDemo').onclick=()=>{incoming=null;s=F.parameters('ipm');target=9000;load=5;J=.5;ramp=800;step=2;$('startMode').value='maximum';$('loadKind').value='constant';stop();rebuild();configure();render();};
$('play').onclick=()=>{if(!playing&&startProblem())return;if(run.finished)run=F.createRun();playing=!playing;last=0;render();};$('restart').onclick=()=>{stop();render();};
$('startMode').onchange=()=>{stop();configure();render();};$('loadKind').onchange=()=>{stop();configure();render();};
$('runLimit').oninput=()=>{if(runMode()==='torque')target=+$('runLimit').value;else torqueLimit=+$('runLimit').value;render();};$('runRamp').oninput=()=>{if(runMode()==='torque')torqueRamp=+$('runRamp').value;else ramp=+$('runRamp').value;render();};
$('transfer').onclick=()=>{const dest=drive?'sm09-pmsm-phasor':'sm10-pmsm-drive';try{parent.__pmsmTransfer={s:{...s},a:getPoint()};if(parent!==window){parent.location.hash=dest;return;}}catch{}location.href=(drive?'pmsm-phasor':'pmsm-drive')+'.html';};
let dragging=false;
function drag(e){if(drive||!mapTransform)return;const p=$('map').createSVGPoint();p.x=e.clientX;p.y=e.clientY;const v=p.matrixTransform($('map').getScreenCTM().inverse()),{k,ox,oy}=mapTransform,d=(oy-v.y)/k,q=Math.max(0,(ox-v.x)/k);angle=F.clamp(Math.atan2(-d,q)*180/Math.PI,-75,90);if(!selected('lock'))amp=F.clamp(Math.hypot(d,q),0,s.Imax);$('controlA').value=amp;$('controlB').value=angle;render();}
$('map').onpointerdown=e=>{if(drive)return;dragging=true;$('map').setPointerCapture(e.pointerId);drag(e);};$('map').onpointermove=e=>{if(dragging)drag(e);};$('map').onpointerup=$('map').onpointercancel=()=>{dragging=false;};
function tick(now){if(!document.hidden)advancePreview();if(!document.hidden&&playing&&drive&&step===2){const dt=last?Math.min(.05,(now-last)/1000):0;F.advance(s,run,dt,runConfig());if(run.a&&!run.a.feasible)stop(false);if(run.finished)playing=false;dirty=true;}last=now;if(dirty&&now-paint>70){render();paint=now;}requestAnimationFrame(tick);}
$('startMode').value='torque';rebuild();configure();render();requestAnimationFrame(tick);
})();
