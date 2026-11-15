/* Six-step BLDC: 120 degree conduction, explicit electrical-angle convention. */
(()=>{'use strict';
const phases=['A','B','C'],colors=['#bf5849','#346fc0','#a58a19'],ink='#233f49',green='#007e6c',muted='#66747c';
const seq=[[1,-1,0],[1,0,-1],[0,1,-1],[-1,1,0],[-1,0,1],[0,-1,1]],hall=[5,1,3,2,6,4],top=[1,3,5],bottom=[4,6,2];
const wrap=x=>(x%360+360)%360;
function emf(a){a=wrap(a);return a<120?1:a<180?1-(a-120)/30:a<300?-1:-1+(a-300)/30;}
function state(s){const angle=wrap(s.angle),sector=Math.floor(angle/60),currents=seq[sector].map(i=>i*s.direction*s.current),shape=phases.map((_,k)=>emf(angle-120*k)),emfs=shape.map(e=>e*s.speed),gates=Array(6).fill(0);currents.forEach((i,k)=>{if(i>0)gates[top[k]-1]=1;if(i<0)gates[bottom[k]-1]=1;});const torque=shape.reduce((v,e,k)=>v+e*currents[k],0),power=torque*s.speed;return {angle,sector,currents,shape,emfs,gates,torque,power,hall:hall[sector].toString(2).padStart(3,'0')};}
const text=(x,y,t,c=ink,size=17)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${c}" font-size="${size}">${t}</text>`;
const math=(x,y,t,c=ink,size=20,w=150)=>DCVisual.math(x,y,t,c,size,w);
const line=(x,y,X,Y,c=muted,width=2)=>`<path d="M${x} ${y}L${X} ${Y}" fill="none" stroke="${c}" stroke-width="${width}" stroke-linecap="round"/>`;
const arr=(x,y,dx,dy,c)=>DCVisual.arrow(x,y,dx,dy,c,2.5);
function bridge(s){const q=state(s);let h='';
 h+=line(65,110,650,110)+line(65,350,650,350)+line(65,110,65,200)+line(65,260,65,350)+'<circle cx="65" cy="230" r="30" fill="white" stroke="'+green+'" stroke-width="2"/>'+math(65,220,'+',green,22,40)+math(65,245,'-',green,22,40)+math(-8,237,'U_{\\mathrm{DC}}',green,19,100);
 const plusPhase=q.currents.findIndex(i=>i>0),minusPhase=q.currents.findIndex(i=>i<0);
 if(plusPhase>=0&&minusPhase>=0){const xp=215+170*plusPhase,xm=215+170*minusPhase;h+=line(65,110,xp,110,colors[plusPhase],4)+line(65,110,65,200,colors[plusPhase],4)+line(65,260,65,350,colors[minusPhase],4)+line(65,350,xm,350,colors[minusPhase],4)+arr(105,110,55,0,colors[plusPhase])+arr(160,350,-55,0,colors[minusPhase]);}
 for(let k=0;k<3;k++){
  const x=215+k*170,c=colors[k],i=q.currents[k],upper=i>0,lower=i<0;
  for(const [y,on,number,isTop] of [[165,upper,top[k],true],[295,lower,bottom[k],false]]){
   h+=line(x,isTop?110:230,x,y-22,on?c:muted,on?4:1.3)+line(x,y+22,x,isTop?230:350,on?c:muted,on?4:1.3);
   const stroke=on?c:ink;
   h+=`<path d="M${x} ${y-22}V${y-14}H${x-6}M${x-6} ${y+14}H${x}V${y+22}M${x-6} ${y-17}V${y-7}M${x-6} ${y-4}V${y+4}M${x-6} ${y+7}V${y+17}M${x-14} ${y-17}V${y+17}M${x-30} ${y}H${x-14}" fill="none" stroke="${stroke}" stroke-width="1.8"/>`;
   h+=math(x-56,y+5,'T_'+number,on?c:ink,18,60);
   // Antiparallel diode points from low potential to high potential.
   h+=line(x+35,y-28,x+35,y+28,muted)+`<path d="M${x+27} ${y+7}L${x+43} ${y+7}L${x+35} ${y-7}Z M${x+26} ${y-7}H${x+44}" fill="white" stroke="${muted}" stroke-width="1.5"/>`+line(x,y-28,x+35,y-28,muted)+line(x,y+28,x+35,y+28,muted);
  }
  // Each phase leaves the bridge midpoint and enters a visible R-L-emf branch.
  const y=445+k*92;
  h+=`<path d="M${x} 230H${x+56}V${373+k*10}H${135+k*18}V${y}H245" fill="none" stroke="${i?c:muted}" stroke-width="${i?4:1.3}" stroke-linejoin="round" stroke-linecap="round"/>`;
  h+=`<circle cx="${x}" cy="230" r="4" fill="${c}"/>`+math(x+23,218,phases[k],c,20,50);
  h+=`<rect x="245" y="${y-11}" width="45" height="22" fill="white" stroke="${c}" stroke-width="2"/>`+line(290,y,325,y,c,i?4:1.3)+`<path d="M325 ${y}c0 -20 15 -20 15 0c0 -20 15 -20 15 0c0 -20 15 -20 15 0c0 -20 15 -20 15 0" fill="none" stroke="${c}" stroke-width="${i?4:1.3}"/>`+line(385,y,430,y,c,i?4:1.3)+`<circle cx="450" cy="${y}" r="20" fill="white" stroke="${c}" stroke-width="2"/>`+arr(450,y-12,0,24,c)+line(470,y,625,y,c,i?4:1.3)+line(625,445,625,629,muted,2);
  h+=math(267,y-24,'R_'+phases[k],c,16,65)+math(355,y-24,'L_'+phases[k],c,16,65)+math(450,y-28,'u_{i'+phases[k].toLowerCase()+'}',c,16,80)+math(550,y-26,'i_'+phases[k].toLowerCase()+'='+q.currents[k].toFixed(1).replace('.','{,}'),c,16,130);
  if(i)h+=arr(i>0?490:600,y+18,i>0?90:-90,0,c);
 }
 h+=math(650,550,'N',ink,19,40)+text(350,690,'Dvě fáze vedou proud · třetí fáze je odpojená',ink,18);
 if(plusPhase>=0&&minusPhase>=0){const yp=445+plusPhase*92,ym=445+minusPhase*92;h+=line(625,yp,625,ym,green,4)+arr(625,(yp+ym)/2-15*Math.sign(ym-yp),0,30*Math.sign(ym-yp),green);}
 const plus=q.currents.findIndex(i=>i>0),minus=q.currents.findIndex(i=>i<0);
 h+=text(350,44,plus<0?'Proud je nulový':`Proudová cesta: + → T${top[plus]} → ${phases[plus]} → N → ${phases[minus]} → T${bottom[minus]} → −`,green,18);
 return h;
}
function diagram(s){const q=state(s),left=95,right=720,w=(right-left)/6;let h='';
for(let k=0;k<=6;k++){const x=left+k*w;h+=line(x,30,x,415,'#ccd3d7',.8)+math(x,18,String(k*60)+'^{\\circ}',ink,13,70);}
for(let r=0;r<9;r++){const isGate=r>=3,y=isGate?218+(r-3)*32:66+r*48;h+=math(40,y+5,isGate?'T_'+(r-2):'i_'+phases[r].toLowerCase(),isGate?ink:colors[r],17,65)+line(left,y+10,right,y+10,'#dce1e4',.7);let d='';for(let k=0;k<6;k++){const v=isGate?state({...s,angle:k*60+30,current:1}).gates[r-3]:seq[k][r]*s.direction,Y=isGate?y+10-v*19:y-v*15;d+=(k?'V':'M')+(k?'':left+' ')+Y+'H'+(left+(k+1)*w);}h+='<path d="'+d+'" fill="none" stroke="'+(isGate?ink:colors[r])+'" stroke-width="1.8"/>';}
h+=line(left,192,right,192,ink,.8);
h+='<path d="M'+(left+q.angle/360*(right-left))+' 27V417" stroke="'+green+'" stroke-width="1.5" stroke-dasharray="5 3"/>';return h;}
function voltagePlot(angle,speed=1){const l=52,r=714,t=28,b=128,X=a=>l+(r-l)*a/360,Y=v=>(t+b)/2-v*(b-t)/2.4;let h='';
for(const v of [-1,0,1])h+=line(l,Y(v),r,Y(v),v?'#e1e6e8':'#a7b3b8',.8)+text(30,Y(v)+4,String(v),muted,12);
for(let k=0;k<=6;k++){const x=X(k*60);h+=line(x,t,x,b,'#e1e6e8',.7)+text(x,149,k*60+'°',muted,12);}
for(let k=0;k<3;k++){let d='';for(let a=0;a<=360;a++)d+=(a?'L':'M')+X(a)+','+Y(emf(a-k*120)*speed);h+='<path d="'+d+'" fill="none" stroke="'+colors[k]+'" stroke-width="1.8" stroke-linejoin="round"/>';h+=line(440+k*90,10,458+k*90,10,colors[k],2)+math(478+k*90,13,'u_{i'+phases[k].toLowerCase()+'}',colors[k],13,55);}
h+=math(55,13,'u_i/\\mathrm{p.u.}',muted,12,95)+'<path d="M'+X(angle)+' '+t+'V'+b+'" fill="none" stroke="'+green+'" stroke-width="1" stroke-dasharray="4 3"/>';return h;}
// Averaged two-phase circuit: L dI/dt = U - 2|omega| - RI.
// Ideal non-regenerative drive; negative current is blocked. Load opposes forward motion.
function advance(s,dt){for(let left=Math.min(dt,.05);left>1e-9;){const h=Math.min(left,.001);s.current=Math.max(0,s.current+h*(s.voltage-2*Math.abs(s.speed)-.8*s.current)/.12);s.speed=Math.max(0,s.speed+h*(2*s.current-.3*s.speed-(s.load||0)));s.angle=wrap(s.angle+180*s.speed*h);left-=h;}return s;}
function mount(app,entry){const initial={angle:43.2,current:0,voltage:1,load:.1,direction:1,speed:0,playing:false};let s={...initial},raf=0,last=0,paint=0,disposed=false;
 app.classList.add('module-window-host');app.innerHTML=`<div class="workspace learning-workspace uniform-module-layout dc-workspace dc-bldc"><div class="modulehead"><a class="back" href="#group-dc">← Stejnosměrné stroje</a><span class="num">${entry.num}</span><h1>BLDC · elektronická komutace</h1><div class="actions"><button id="bc-reset">Výchozí stav</button><button id="bc-full">Celá obrazovka</button></div></div><div class="bc-controls"><button id="bc-play">▶ Spustit</button><button id="bc-prev">← Stav</button><button id="bc-next">Stav →</button><label>Elektrický úhel <output id="bc-angle-value"></output><input id="bc-angle" type="range" min="0" max="359.9" step=".1"></label><label>Napětí <output id="bc-voltage-value"></output><input id="bc-voltage" type="range" min="0" max="1.5" step=".05"></label><label>Zatěžovací moment <output id="bc-load-value"></output><input id="bc-load" type="range" min="0" max="3" step=".05"></label></div><div class="bc-sectors">${seq.map((_,k)=>`<button data-bc-sector="${k}">${k+1}. stav</button>`).join('')}</div><div class="bc-layout"><section class="learning-panel"><svg id="bc-bridge" data-plain-svg viewBox="-65 0 765 720" role="img" aria-label="Můstek a proudové cesty třemi vinutími"></svg></section><div class="bc-right"><section class="learning-panel bc-machine-panel"><svg id="bc-machine" data-plain-svg viewBox="0 0 700 340" role="img" aria-label="Rotor, fázová vinutí a moment"></svg></section><section class="learning-panel"><svg id="bc-diagram" data-plain-svg viewBox="0 0 750 435" role="img" aria-label="Komutační diagram proudů a šesti tranzistorů"></svg></section></div></div><div class="bc-wave-row"><section class="learning-panel"><h2>Indukovaná napětí</h2><svg id="bc-wave" data-plain-svg viewBox="0 0 760 160" role="img" aria-label="Lichoběžníková indukovaná napětí"></svg></section><div id="bc-readout" class="op-insight"></div></div><p class="op-note">Ideální šestikroková komutace · vedení fáze po 120 elektrických stupních · Napětí řídí rozběh; proud a otáčky vycházejí ze středního R–L modelu s protinapětím a nastavitelným zatěžovacím momentem. Bez PWM zvlnění, rekuperace a překryvu komutace. Otáčení má výukové časové měřítko; délka okrové šipky označuje směr, nikoli velikost pole. Hallův kód odpovídá zde zvolené konvenci snímačů.</p></div>`;
 window.MachineSound?.mount(app);let previousSoundSector=null;
 const $=id=>app.querySelector('#bc-'+id);
 function render(){const q=state(s);if(previousSoundSector!==null&&previousSoundSector!==q.sector)window.MachineSound?.play('switch');previousSoundSector=q.sector;$('angle').value=s.angle;$('voltage').value=s.voltage;$('load').value=s.load;$('load-value').innerHTML=DCVisual.tex(s.load.toFixed(2).replace('.','{,}')+'\\,\\mathrm{p.u.}');$('angle-value').innerHTML=DCVisual.tex(q.angle.toFixed(1).replace('.','{,}')+'^{\\circ}');$('voltage-value').innerHTML=DCVisual.tex(s.voltage.toFixed(2).replace('.','{,}')+'\\,\\mathrm{p.u.}');$('play').textContent=s.playing?'❚❚ Pozastavit':'▶ Spustit';$('play').setAttribute('aria-pressed',String(s.playing));app.querySelectorAll('[data-bc-sector]').forEach(e=>e.setAttribute('aria-pressed',String(+e.dataset.bcSector===q.sector)));
 $('bridge').innerHTML=bridge(s);$('diagram').innerHTML=diagram(s);
 const rotor=q.angle*Math.PI/180-5*Math.PI/6;
 const fieldAngle=Math.atan2(Math.sqrt(3)/2*(q.currents[1]-q.currents[2]),q.currents[0]-.5*(q.currents[1]+q.currents[2]));
 const vectors=DCVisual.arrow(0,0,155*s.current*Math.cos(fieldAngle),-155*s.current*Math.sin(fieldAngle),green,3.5)+DCVisual.arrow(0,0,170*Math.cos(rotor),-170*Math.sin(rotor),'#a76914',3.5);
 $('machine').innerHTML='<g transform="translate(190 170) scale(.66)">'+DCMachineArt.bldc(rotor,q.currents,DCVisual.bldcField(q.currents,rotor))+vectors+'</g>'+text(500,28,'Zelená: pole statoru',green,16)+text(500,52,'Okrová: směr pole rotoru','#a76914',16)+math(520,95,'n='+s.speed.toFixed(2).replace('.','{,}')+'\\,\\mathrm{p.u.}',ink,21,260)+math(520,150,'M='+q.torque.toFixed(2).replace('.','{,}'),green,26,260)+math(520,205,'p_{\\mathrm{em}}=\\sum u_{ik}i_k',ink,19,320)+text(520,263,'Hallův kód: '+q.hall,muted,19)+text(520,300,'Aktivní stav '+(q.sector+1)+' ze 6',green,17);
 $('wave').innerHTML=voltagePlot(q.angle,s.speed);
 const active=q.gates.map((g,k)=>g?'T_'+(k+1):null).filter(Boolean).join(',\\;');$('readout').innerHTML='<strong>'+ (active?DCVisual.tex(active):'Nulový proud')+'</strong><p>Každý krok trvá '+DCVisual.tex('60^{\\circ}')+'. V komutačním diagramu se střídá horní a dolní tranzistor různých větví.</p><p>Spínací povely: horní úroveň znamená 1, dolní 0. Čárkovaná svislice označuje aktuální elektrický úhel. Kliknutím na stav lze zastavit děj a sledovat celou proudovou cestu.</p><p>'+DCVisual.tex('i_a+i_b+i_c=0')+'</p>';
 }
 $('angle').oninput=()=>{s.angle=+$('angle').value;s.playing=false;render();};$('voltage').oninput=()=>{s.voltage=+$('voltage').value;render();};
 app.querySelectorAll('[data-bc-sector]').forEach(e=>e.onclick=()=>{s.angle=+e.dataset.bcSector*60+30;s.playing=false;render();});
 $('next').onclick=()=>{s.angle=wrap((state(s).sector+1)*60+30);s.playing=false;render();};$('prev').onclick=()=>{s.angle=wrap((state(s).sector-1)*60+30);s.playing=false;render();};$('load').oninput=()=>{s.load=+$('load').value;render();};$('play').onclick=()=>{s.playing=!s.playing;last=0;render();};$('reset').onclick=()=>{s={...initial};render();};$('full').onclick=()=>{document.body.classList.toggle('fullscreen');window.dispatchEvent(new Event('resize'));};
 function tick(now){if(disposed)return;if(s.playing&&!document.hidden){if(last)advance(s,(now-last)/1000);if(now-paint>90){render();paint=now;}}last=now;raf=requestAnimationFrame(tick);}render();raf=requestAnimationFrame(tick);window.dcBLDCState=()=>({...s});Lab.dispose=()=>{disposed=true;cancelAnimationFrame(raf);delete window.dcBLDCState;document.body.classList.remove('fullscreen');};
}
window.DCBLDC={advance,state,emf,bridge,diagram,mount};
})();
