(()=>{'use strict';
 const $=id=>document.getElementById(id),M=SyncStability,K=SyncMath,deg=180/Math.PI,colors={blue:'#346fc0',gold:'#a76914',green:'#007e6c',red:'#b94730',grid:'#d9e2e1'},fmt=(x,n=2)=>x.toFixed(n).replace('.','{,}');
 let run,t=0,playing=false,last=0,lastDraw=0,graphView=false;
 const tex=(id,s)=>K.set($(id),s),label=(x,y,s,c='#19313b',size=15,w=160)=>K.label(x,y,s,c,size,w);
 const line=(x,y,u,v,c=colors.grid,dash='')=>`<path d="M${x} ${y}L${u} ${v}" fill="none" stroke="${c}" stroke-width="1.4" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
 const path=(points,c,width=2.4)=>`<path d="${points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join('')}" fill="none" stroke="${c}" stroke-width="${width}"/>`;
 function prepare(){const p=Object.fromEntries(['p1','dp','H','D'].map(id=>[id,+$(id).value]));p.damper=$('damper').checked;if(!p.damper)p.D=0;$('D').disabled=!p.damper;run=M.simulate(p);t=0;playing=false;for(const id of ['p1','dp','H','D'])tex(id+'Out',fmt(p[id],id==='D'?0:2)+(id==='H'?'\\,\\mathrm{s}':''));$('time').max=run.end;$('time').value=0;draw();}
 function machine(q){const s={...SyncPrinciple.create(),type:'smooth',rotor:q.b,field:0,fieldOmega:0,omega:M.ws*q.v,damper:run.p.damper};let svg=SyncMachineArt(s,false,{axes:false,forces:false,driveLabel:'ref.'},'');
  const C=280,Y=267,r=159,end=Math.min(Math.PI,q.b),x=C+r*Math.cos(end),y=Y-r*Math.sin(end);
  svg+=line(C,Y,C+170,Y,colors.green)+line(C,Y,C+113*Math.cos(q.b),Y-113*Math.sin(q.b),colors.gold);
  if(q.b>0&&q.b<Math.PI)svg+=`<path d="M${C+r} ${Y}A${r} ${r} 0 0 0 ${x} ${y}" fill="none" stroke="${colors.gold}" stroke-width="2"/>`+label(C+180*Math.cos(end/2),Y-180*Math.sin(end/2),'\\beta',colors.gold,19,60);
  $('machine').innerHTML=svg;K.svg($('machine'));
 }
 function power(q){const el=$('power'),width=el.clientWidth||860,height=el.clientHeight||340;el.setAttribute('viewBox',`0 0 ${width} ${height}`);const a=run.a,left=68,right=width-68,top=28,bottom=height-77,ymax=Math.max(1.15,a.p2+.15),X=b=>left+b/Math.PI*(right-left),Y=p=>bottom-p/ymax*(bottom-top);let out='';
  for(const b of [0,Math.PI/4,Math.PI/2,3*Math.PI/4,Math.PI])out+=line(X(b),top,X(b),bottom)+label(X(b),bottom+28,fmt(b*deg,0)+'^{\\circ}');
  for(const p of [0,.5,1])out+=line(left,Y(p),right,Y(p))+label(29,Y(p)+7,fmt(p,1),'#60747b',14,50);
  out+=label(90,15,'P/P_{\\max}')+label(width-30,bottom+28,'\\beta','#19313b',17,50);
  function fill(lo,hi,color,opacity=.25,preview=false){if(hi<=lo)return '';const ps=Array.from({length:65},(_,i)=>lo+(hi-lo)*i/64);return `<path ${preview?'data-area-preview="true"':''} d="M${X(lo)} ${Y(a.p2)}L${ps.map(b=>X(b)+' '+Y(Math.sin(b))).join('L')}L${X(hi)} ${Y(a.p2)}Z" fill="${color}" opacity="${opacity}" ${preview?'stroke="'+color+'" stroke-dasharray="4 4"':''}/>`;}
  // Static, undamped equal-area reference remains visible before the step.
  out+=fill(a.b1,a.b2??Math.PI,colors.gold,graphView?.18:.09,true);
  if(!a.noEquilibrium){out+=fill(a.b2,a.bu,colors.green,graphView?.14:.07,true);
   if(a.b3!==null)out+=line(X(a.b3),top,X(a.b3),bottom,colors.gold,'2 5')+label(X(a.b3),top+18,'\\beta_3',colors.gold,14,55);
   if(graphView&&run.p.dp>=.05){const brake=(a.b2+a.bu)/2;let weight=0,momentX=0,momentY=0;for(let i=0;i<128;i++){const b=a.b1+(a.b2-a.b1)*(i+.5)/128,lower=Math.sin(b),w=a.p2-lower;weight+=w;momentX+=b*w;momentY+=(a.p2+lower)*.5*w;}const cx=momentX/weight,cy=momentY/weight;out+=label(X(cx),Y(cy)-3,'S_1',colors.gold,20,80).replace('text-align:center;','display:flex;align-items:center;justify-content:center;height:100%;text-align:center;')+label(X(brake),Y((a.p2+Math.sin(brake))/2),'S_{2,\\max}',colors.green,20,140);}
  }
  if(t>=M.stepTime&&!graphView){const peak=run.peak&&t>=run.peak.t?run.peak.b:q.b,end=Math.min(Math.PI,Math.max(a.b1,peak));
   out+=fill(a.b1,Math.min(end,a.b2??Math.PI),colors.gold);if(a.b2)out+=fill(a.b2,end,colors.green);
  }
  out+=path(Array.from({length:181},(_,i)=>[X(i*Math.PI/180),Y(Math.sin(i*Math.PI/180))]),colors.blue);
  out+=line(left,Y(a.p1),right,Y(a.p1),'#60747b','5 4')+label(width-36,Y(a.p1),'P_1','#60747b',14,65);
  out+=line(left,Y(a.p2),right,Y(a.p2),colors.red,'5 4')+label(width-36,Y(a.p2),'P_2',colors.red,14,65);
  if(a.b2)out+=line(X(a.b2),top,X(a.b2),bottom,colors.green,'3 4')+label(X(a.b2),bottom+62,'\\beta_2',colors.green);
  if(a.bu)out+=line(X(a.bu),top,X(a.bu),bottom,colors.red,'3 4')+label(X(a.bu),bottom+62,'\\beta_u',colors.red);
  if(q.b<=Math.PI)out+=`<circle cx="${X(q.b)}" cy="${Y(q.pe)}" r="6" fill="${colors.gold}" stroke="white" stroke-width="2"/>`;
  else out+=label(width/2,(top+bottom)/2,'\\text{Pracovní bod již opustil první půlvlnu}',colors.red,17,500);
  $('power').innerHTML=out;
  const text=a.noEquilibrium?'Nový výkon nemá stabilní rovnováhu.':run.p.D>0?'Světlé plochy: předpověď bez tlumení. Tlumený pokus může dopadnout jinak.':a.stable?'Světlé plochy: brzdná rezerva postačuje. Syté plochy: probíhající první výkyv.':'Světlé plochy: brzdná rezerva nestačí. Bez tlumení dojde ke ztrátě synchronismu.';
  $('areaNote').innerHTML=text+(a.noEquilibrium?'':'<br>'+K.html('S_1='+fmt(a.S1,3)+',\\quad S_{2,\\max}='+fmt(a.Smax,3)+(a.b3!==null?',\\quad\\beta_3='+fmt(a.b3*deg,1)+'^{\\circ}':'')));
  $('areaVerdict').textContent=a.noEquilibrium?'Stabilní rovnováha chybí; brzdnou rezervu mezi rovnovážnými body nelze vymezit.':a.stable?'Bez tlumení: rotor se zastaví vůči poli dříve, než vyčerpá brzdnou rezervu. Potom se vrací.':'Bez tlumení: brzdná rezerva nestačí k odebrání získané energie.';
 }
 function history(q){const el=$('history'),width=el.clientWidth||860,height=el.clientHeight||330;el.setAttribute('viewBox',`0 0 ${width} ${height}`);const left=78,right=width-62,X=s=>left+s/12*(right-left),shown=run.samples.filter(s=>s.t<t);shown.push(q);let out='';
  const maxB=run.lossTime!==null?420:Math.max(60,Math.ceil(Math.max(...run.samples.map(s=>s.b*deg))/30)*30),maxV=Math.max(10,Math.ceil(Math.max(...run.samples.map(s=>Math.abs(s.v*3000)))/10)*10);
  for(const [top,bottom,max,min,value,name,color] of [[26,height*.41,maxB,0,s=>s.b*deg,'\\beta\\;[{}^{\\circ}]',colors.gold],[height*.59,height-39,maxV,-maxV,s=>s.v*3000,'\\Delta n\\;[\\mathrm{min}^{-1}]',colors.blue]]){
   const Y=v=>bottom-(v-min)/(max-min)*(bottom-top);out+=label(100,top-10,name,color,15,190);
   for(const v of [min,(max+min)/2,max])out+=line(left,Y(v),right,Y(v))+label(35,Y(v)+7,fmt(v,0),'#60747b',13,65);
   for(const time of [0,2,4,6,8,10,12]){out+=line(X(time),top,X(time),bottom);if(min<0)out+=label(X(time),bottom+25,fmt(time,0),'#60747b',14,45);}
   out+=line(X(M.stepTime),top,X(M.stepTime),bottom,colors.red,'4 4')+line(X(t),top,X(t),bottom,'#19313b')+path(shown.map(s=>[X(s.t),Y(value(s))]),color);
   if(min===0&&run.a.b2)out+=line(left,Y(run.a.b2*deg),right,Y(run.a.b2*deg),colors.green,'4 4');
  }
  out+=label(width-36,height-14,'t\\,[\\mathrm{s}]','#19313b',15,70);$('history').innerHTML=out;
 }
 function draw(){const q=M.at(run,t),lost=run.lossTime!==null&&t>=run.lossTime;machine(q);power(q);history(q);
  tex('betaValue',fmt(q.b*deg,1)+'^{\\circ}');tex('speedValue',fmt(q.v*3000,1)+'\\,\\mathrm{min}^{-1}');tex('pmValue',fmt(q.pm)+'\\,P_{\\max}');tex('peValue',fmt(q.pe)+'\\,P_{\\max}');tex('timeOut',fmt(t)+'\\,\\mathrm{s}');$('time').value=t;
  $('pause').disabled=t===0||t>=run.end;$('pause').textContent=playing?'Pozastavit':'Pokračovat';$('start').textContent=t>0?'Opakovat skok':'Provést skok';
  let status,explanation;if(t<M.stepTime){status=t===0?'Připraveno · ustálený chod':'Ustálený chod před skokem';explanation='Rotor má synchronní rychlost. Mechanický a elektrický výkon jsou stejné.';}
  else if(lost){status='Ztráta synchronismu';explanation='Rotor překročil mez návratu a předbíhá synchronní pole. Nový synchronní chod se neustaví.';}
  else if(run.a.noEquilibrium){status='Bez stabilní rovnováhy';explanation='Požadovaný výkon dosáhl maxima charakteristiky nebo jej překročil. Rotor pokračuje vpřed.';}
  else if(Math.abs(q.v)<.00004&&Math.abs(q.b-run.a.b2)<.001){status='Ustálený synchronní chod';explanation=run.p.dp===0?'Při nulovém skoku zůstává původní rovnováha zachována.':'Tlumení odebralo energii kývání. Rotor opět běží synchronní rychlostí.';}
  else {const accel=q.pm-q.pe-run.p.D*q.v;status=q.v>=0?(accel>=0?'Rotor zrychluje a předbíhá pole':'Rotor brzdí, ale stále předbíhá pole'):'Rotor se vrací vůči poli';explanation=q.v>=0&&accel<0?'Elektrický výkon a tlumení rotor brzdí. Krajní polohy dosáhne až po zániku odchylky otáček.':run.p.D===0?'Setrvačnost přenese rotor přes rovnováhu. Bez tlumení se kývání neztratí.':'Tlumení postupně odebírá energii kývání a rotor se blíží nové rovnováze.';}
  if(t>=run.end)explanation+=(lost?' Pokus zastaven po prokluzu.':' Konec záznamu; průběh lze projít časovým posuvníkem.');
  $('status').textContent=status;$('status').classList.toggle('loss',lost);$('explanation').textContent=explanation;
 }
 for(const id of ['p1','dp','H','D'])$(id).addEventListener('input',prepare);
 $('damper').onchange=prepare;
 $('start').onclick=()=>{t=0;playing=true;last=0;draw();};$('pause').onclick=()=>{playing=!playing;last=0;draw();};$('reset').onclick=()=>{t=0;playing=false;draw();};$('time').oninput=()=>{playing=false;t=+$('time').value;draw();};
 for(const button of document.querySelectorAll('[data-preset]'))button.onclick=()=>{const name=button.dataset.preset;$('p1').value=.2;$('dp').value=name==='loss'?.7:.35;$('H').value=4;$('D').value=20;$('damper').checked=name==='damped';prepare();};
 $('help').onclick=()=>{$('theory').showModal();playing=false;draw();};$('closeHelp').onclick=()=>$('theory').close();
 $('graphView').onclick=()=>{graphView=!graphView;playing=false;$('experiment').classList.toggle('graph-view',graphView);$('graphView').setAttribute('aria-pressed',String(graphView));$('graphView').textContent=graphView?'Zpět k rotoru':'Výklad ploch';draw();};
 document.addEventListener('visibilitychange',()=>{last=0;});
 function frame(now){if(playing&&last&&!document.hidden){t=Math.min(run.end,t+Math.min(.05,(now-last)/1000)*($('slow').checked?.35:1));if(t>=run.end){if(run.lossTime!=null&&Number.isFinite(run.lossTime))window.MachineSound?.play('slip');playing=false;}}last=now;if(now-lastDraw>50&&playing||t>=run.end&&lastDraw!==Infinity){draw();lastDraw=t>=run.end?Infinity:now;}if(playing&&lastDraw===Infinity)lastDraw=0;requestAnimationFrame(frame);}
 if(typeof ResizeObserver!=='undefined'){let resizePending=false;const observer=new ResizeObserver(()=>{if(resizePending)return;resizePending=true;requestAnimationFrame(()=>{resizePending=false;if(run)draw();});});observer.observe($('power'));observer.observe($('history'));}
 window.syncStabilityState=()=>({t,playing,graphView,...M.at(run,t),parameters:{...run.p},lossTime:run.lossTime,peak:run.peak});window.MachineSound?.mount(document);prepare();requestAnimationFrame(frame);
})();
