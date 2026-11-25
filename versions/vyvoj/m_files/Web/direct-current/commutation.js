/* Lecture-style commutation diagram with a reduced, analytically solved RL model. */
(()=>{'use strict';
const C={coil:'#008372',one:'#bf5849',two:'#346fc0',muted:'#91a298'},fmt=n=>(Math.abs(n)<1e-10?0:n).toFixed(2).replace('.','{,}');
// Reduced RL model: lambda di/dtau + i = (1-2tau) + uk/(R ia).
// The ramp represents the transfer of contact; R is an effective constant,
// not the separately varying resistance of each brush contact.
function sample(t,mode='linear',amount=.35){
 t=Math.max(0,Math.min(1,t));const lambda=Math.max(.05,amount),lag=mode==='delayed',e=Math.exp(-t/lambda);
 const reference=1-2*t,assisted=mode==='assisted';
 // A spatially varying interpole voltage, sampled along the contact passage.
 // Its offset c makes the added current return to zero at detachment.
 const c=1/(-Math.expm1(-1/lambda))-lambda,U=6*lambda/(lambda+.35);
 const extra=assisted?U*(t-(lambda+c)*(1-e)):0;
 const i=reference+(lag?2*lambda*(1-e):extra),di=lag?-2+2*e:assisted?-2+U*(1-(lambda+c)*e/lambda):-2;
 const i1=1+i,i2=1-i,uk=assisted?-2*lambda+U*(t-c):0,ur=mode==='linear'?0:lambda*di;
 return {t,i,i1,i2,di,reference,lambda,uk,ur,a1:1-t,a2:t,j1:t===1?null:i1/(2*(1-t)),j2:t===0?null:i2/(2*t)};
}
// Integral of signed current: identical marker phase for playback and scrubbing.
function currentTravel(t,mode,amount){
 const lambda=Math.max(.05,amount),e=Math.exp(-t/lambda),c=1/(-Math.expm1(-1/lambda))-lambda,U=6*lambda/(lambda+.35);
 const base=t-t*t,lag=2*lambda*(t-lambda*(1-e)),assist=U*(t*t/2-(lambda+c)*(t-lambda*(1-e)));
 return 3.6*(base+(mode==='delayed'?lag:mode==='assisted'?assist:0));
}
const names={linear:'Ideální přímková',delayed:'S indukčností cívky',assisted:'S pomocnými póly'};
// Lecture-style shared ordinate: coil current about zero, departing current
// measured upwards from the lower baseline, entering current down from the top.
function diagram(s){
 const V=DCVisual,X=t=>75+405*t,Y=i=>175-110*i,q=sample(s.t,s.mode,s.amount),end=sample(1,s.mode,s.amount);
 const line=(x,y,xx,yy,color,width=1,dash='')=>'<path d="M'+x+' '+y+'L'+xx+' '+yy+'" fill="none" stroke="'+color+'" stroke-width="'+width+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
 const curve=(to,color,width,opacity=1)=>'<path d="'+Array.from({length:101},(_,k)=>{const t=to*k/100;return (k?'L':'M')+X(t)+' '+Y(sample(t,s.mode,s.amount).i);}).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" opacity="'+opacity+'"/>';
 let h=V.arrow(75,312,0,-270,'#546c62',1.2)+V.arrow(65,285,537,0,'#546c62',1.2);
 h+=line(75,175,510,175,'#adbbb4',1,'3 4')+line(75,65,480,285,C.muted,1.8,'6 4');
 h+=line(65,65,75,65,C.coil,2.5)+curve(1,C.coil,1.7,.22)+curve(s.t,C.coil,3);
 h+=line(X(s.t),48,X(s.t),315,'#b0bdb6',1,'3 4')+'<circle cx="'+X(s.t)+'" cy="'+Y(q.i)+'" r="5" fill="'+C.coil+'" stroke="white" stroke-width="2"/>';
 if(s.mode!=='linear'&&s.t>0){
  h+=line(X(s.t),Y(q.i),X(s.t),Y(q.reference),'#b17e28',4);
  h+='<circle cx="'+X(s.t)+'" cy="'+Y(q.reference)+'" r="3" fill="'+C.muted+'"/>';
 }
 const ta=Math.max(0,s.t-.075),tb=Math.min(1,s.t+.075);
 h+=line(X(ta),Y(q.i+q.di*(ta-s.t)),X(tb),Y(q.i+q.di*(tb-s.t)),'#ae7955',1.5);
 // Axis labels occupy a fixed gutter; lamella currents have their own tab.
 h+=V.math(43,66,'+i_a','#284747',18,50)+V.math(43,176,'0','#284747',18,30)+V.math(43,286,'-i_a','#284747',18,50);
 h+=V.math(75,25,'i','#284747',20,30)+V.math(75,330,'0','#284747',18,30)+V.math(480,330,'T_k','#284747',18,50)+V.math(618,286,'t','#284747',20,30);
 if(s.t>=.999&&end.i1>.001){
  h+='<g data-residual-current="'+end.i1+'">'+line(480,Y(end.i),530,Y(end.i),C.one,1,'3 3')+line(526,Y(end.i),526,285,C.one,3)+line(518,285,534,285,C.one,2);
  h+=V.math(570,(Y(end.i)+285)/2,'i_{\\mathrm{zb}}',C.one,15,70)+'</g>';
 }
 return h;
}
function mount(app,entry){
 const initial={t:0,mode:'delayed',amount:.35,playing:false,graph:'coil'};let s={...initial},raf,last=0,paint=0,disposed=false;
 app.classList.add('module-window-host');app.innerHTML=`<div class="workspace learning-workspace uniform-module-layout dc-workspace dc-commutation"><div class="modulehead"><a class="back" href="#group-dc">← Stejnosměrné stroje</a><span class="num">${entry.num}</span><h1>${entry.title}</h1><div class="actions"><button id="cm-reset">Výchozí stav</button><button id="cm-full">Celá obrazovka</button></div></div><div class="cm-controls"><button id="cm-play">▶ Spustit pomalu</button><label>Průběh komutace <output id="cm-time"></output><input id="cm-t" type="range" min="0" max="1" step=".002" value="0"></label><label><span><span id="cm-amount-label"></span> <button type="button" id="cm-help" class="cm-help" aria-label="Vysvětlení nastavení průběhu" aria-expanded="false" aria-controls="cm-amount-help">?</button></span> <output id="cm-amount-value"></output><input id="cm-amount" aria-describedby="cm-amount-help" type="range" min=".05" max="1" step=".05" value=".35"></label></div><div class="cm-tabs">${Object.entries(names).map(([k,v])=>`<button data-cm-mode="${k}">${v}</button>`).join('')}</div><div id="cm-amount-help" class="cm-amount-help" hidden role="note"></div><div class="cm-story"><strong id="cm-story-title"></strong><p id="cm-story-text"></p></div><div class="cm-main"><section class="learning-panel"><div class="dc-panel-heading"><h2>Komutující cívka a lamely</h2><div id="cm-overlap" class="dc-panel-equation"></div></div><svg id="cm-scene" data-plain-svg viewBox="0 0 640 430" role="img" aria-label="Dvě lamely překryté kartáčem a proud v cívce"></svg></section><section class="learning-panel"><div class="cm-graph-tabs"><button data-cm-graph="coil">Komutační diagram</button><button data-cm-graph="currents">Proudy lamel</button><button data-cm-graph="density">Proudová hustota</button></div><div id="cm-legend" class="cm-legend"></div><svg id="cm-diagram" data-plain-svg viewBox="0 0 540 234" role="img" aria-label="Proud cívky v době komutace"></svg><div id="cm-cause" class="cm-cause"></div><div id="cm-identity" class="cm-equations"></div><div id="cm-values" class="cm-values"></div></section></div><p id="cm-insight" class="op-insight"></p><p class="op-note">Sledujte zelenou cívku; lamely se pohybují doprava. Jedna komutující cívka · lamelové krytí ${DCVisual.tex('\\beta=1')} · izolace zanedbána. Zjednodušený model s indukčností a konstantním náhradním odporem; nepočítá zákmit kontaktu ani oblouk po rozpojení.</p></div>`;
 let sparkArmed=true;window.MachineSound?.mount(app);
 const $=id=>app.querySelector('#cm-'+id),tex=DCVisual.tex;
 const plot=(curves,y,yt,t=s.t,x=[0,1])=>DCVisual.plot({curves,x,y,xt:'t/T_k',yt,cursor:t===null?undefined:t});
 function render(){const q=sample(s.t,s.mode,s.amount),fn=t=>sample(t,s.mode,s.amount);
 $('t').value=s.t;$('time').innerHTML=tex('t/T_k='+fmt(s.t));$('amount').value=s.amount;$('amount').disabled=s.mode==='linear';$('amount-value').innerHTML=s.mode==='linear'?'—':tex('L_\\sigma/(R T_k)='+fmt(s.amount));
 $('amount-label').textContent=s.mode==='linear'?'Indukčnost zanedbána':'Vliv indukčnosti';
 $('amount-help').innerHTML=tex('L_\\sigma')+' je rozptylová indukčnost komutující cívky. Její indukované napětí brání rychlé změně proudu, a tím zpožďuje jeho obrácení pod kartáčem. Posuvník mění poměr časové konstanty cívky k době komutace: '+tex('\\lambda=L_\\sigma/(R T_k)')+'. Větší indukčnost nebo kratší doba komutace znamená větší zpoždění. Použitý výukový model: '+tex('L_\\sigma\\,\\mathrm di/\\mathrm dt+Ri=R i_{\\mathrm{ref}}+u_k')+', '+tex('i_{\\mathrm{ref}}=i_a(1-2t/T_k)')+'. Náhradní odpor je konstantní; model nenahrazuje výpočet proměnných odporů obou kontaktů. V režimu pomocných pólů se napětí během průchodu mění. Zvolený výukový profil způsobuje předbíhání přímky a při výchozím nastavení i překomutování; není měřením konkrétního stroje.';
 $('play').textContent=s.playing?'Ⅱ Pozastavit':'▶ Spustit pomalu';
 app.querySelectorAll('[data-cm-mode]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.cmMode===s.mode)));
 const stage=s.t<.25?0:s.t<.65?1:s.t<.999?2:3;
 app.querySelectorAll('[data-cm-graph]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.cmGraph===s.graph)));
 const delayed=s.mode==='delayed';
 $('story-title').textContent=(delayed?['Proč je křivka na začátku téměř vodorovná?','Kontakt se mění, proud za ním zaostává','Stihne se proud obrátit včas?','Při rozpojení zbývá proud']:s.mode==='assisted'?['Pomocné póly urychlují obracení proudu','Proud předbíhá přímkový průběh','Proud může překročit cílovou zápornou hodnotu','Proud odbíhající lamely dosáhl nuly']:['Bez indukčnosti proud sleduje změnu kontaktu','Proud se mění přímkově','Modrá lamela přebírá proud','Proud odbíhající lamely dosáhl nuly'])[stage];
 $('story-text').innerHTML=delayed?[
 'Proud cívky nemůže skočit. Na začátku má ještě původní hodnotu a malou rychlost změny. Spusťte animaci: zelený bod začne za šedou přímkou zaostávat.',
 'Červený kontakt ubývá, modrý přibývá. Indukované napětí brání poklesu proudu; zlatá úsečka ukazuje rozdíl proti přímce. Sklon křivky se postupně mění.',
 (q.i>0?'Proud stále teče původním směrem. ':'Proud se již obrátil, ale nestačil dosáhnout cílové hodnoty. ')+'Zmenšující se červenou plochou stále teče proud. Sledujte proudovou hustotu.',
 'Červená závorka ukazuje proud, který by se při opuštění kartáče musel přerušit. Hrozí jiskření. Přepněte na pomocné póly a porovnejte konec děje.'
 ][stage]:s.mode==='assisted'?'Silnější účinek pomocných pólů obrací proud rychleji: zelená křivka leží pod šedou přímkou. Při překomutování proud krátce překročí cílovou zápornou hodnotu a před rozpojením se vrací.':'Bez indukčnosti je proud úměrný měnícím se kontaktním plochám. Červená šipka se zkracuje, modrá prodlužuje; zelený bod kreslí přímku.';
  $('scene').innerHTML=DCMachineArt.commutationDetail({teachingPhase:s.t,travel:currentTravel(s.t,s.mode,s.amount),...q});
 if(s.t<.99)sparkArmed=true;
 if(s.t>=.999&&Math.abs(q.i1)>.01&&sparkArmed){sparkArmed=false;window.MachineSound?.play();$('scene').innerHTML+='<g stroke="#e8a026" stroke-width="2.5" fill="none"><path d="M400 220l-13 -10 7 -4 -14 -11M400 220l10 -13 -4 -6 9 -9M400 220l16 3 -3 7 13 5"/><animate attributeName="opacity" values="1;0.25;1;0" dur=".3s" fill="freeze"/></g>';}
 $('overlap').innerHTML=tex('A_1/A_0=1-t/T_k='+fmt(q.a1))+tex('A_2/A_0=t/T_k='+fmt(q.a2));
 $('diagram').setAttribute('viewBox',s.graph==='coil'?'0 0 640 355':'0 0 540 234');
 $('legend').innerHTML=(s.graph==='coil'?[['#008372','Proud cívky'],['#91a298','Přímková reference']]:[['#bf5849','Odbíhající lamela'],['#346fc0','Nabíhající lamela']]).map(([color,label])=>'<span><i style="background:'+color+'"></i>'+label+'</span>').join('');
 if(s.graph==='coil')$('diagram').innerHTML=diagram(s);
 $('identity').innerHTML=tex('i_1=i_a+i,\\quad i_2=i_a-i');
 $('values').innerHTML=[['i',q.i,C.coil,'Cívka'],['i_1',q.i1,C.one,'Odbíhající lamela'],['i_2',q.i2,C.two,'Nabíhající lamela']].map(([v,n,c,label])=>`<span style="color:${c}"><small>${label}</small>${tex(v+'/i_a='+fmt(n))}</span>`).join('');
 if(s.graph==='currents')$('diagram').innerHTML=plot([{fn:t=>fn(t).i1,color:C.one},{fn:t=>fn(t).i2,color:C.two}],[-.35,2.35],'i_1/i_a,\\;i_2/i_a');
 // Density is not defined on a detached (zero area) contact. Never clamp the denominator.
 const ymax=Math.max(3,fn(.98).j1*1.05);
 if(s.graph==='density')$('diagram').innerHTML=plot([{fn:t=>fn(t).j1,color:C.one},{fn:t=>fn(t).j2,color:C.two}],[-.6,ymax],'J/J_0',s.t>=.02&&s.t<=.98?s.t:null,[.02,.98]);
 $('cause').innerHTML='<div><small>Indukované napětí</small>'+tex('u_{\\mathrm{ind}}/(R i_a)='+fmt(-q.ur))+'</div><div><small>Rychlost změny proudu</small>'+tex('\\frac{\\mathrm d(i/i_a)}{\\mathrm d(t/T_k)}='+fmt(q.di))+'</div>';
 $('insight').innerHTML=delayed?'Zvětšete vliv indukčnosti: křivka se více opozdí a při rozpojení zbude větší proud. Znaménko indukovaného napětí vyjadřuje Lenzův zákon: '+tex('u_{\\mathrm{ind}}=-L_\\sigma\\,\\mathrm di/\\mathrm dt')+'. Model končí těsně před ztrátou kontaktu; následný oblouk není simulován.':s.mode==='assisted'?'Pomocné póly mohou způsobit překomutování. Při proudu pod cílovou hodnotou se proud odbíhající lamely krátce obrátí; před rozpojením se vrací k nule. Zde používáme názorný proměnný profil komutačního napětí, nikoli přesnou kompenzaci.':'Přímkový průběh zde předpokládá zanedbanou indukčnost. Samotná přímka neznamená nulové reaktanční napětí, pokud je indukčnost nenulová. Proudová hustota je '+tex('J_1=i_1/A_1,\\quad J_2=i_2/A_2')+'.';

 }
 $('help').onclick=()=>{const open=$('amount-help').hidden;$('amount-help').hidden=!open;$('help').setAttribute('aria-expanded',String(open));};
 $('t').oninput=()=>{s.t=+$('t').value;s.playing=false;render();};$('amount').oninput=()=>{s.amount=+$('amount').value;render();};
 app.querySelectorAll('[data-cm-graph]').forEach(e=>e.onclick=()=>{s.graph=e.dataset.cmGraph;render();});
 app.querySelectorAll('[data-cm-mode]').forEach(e=>e.onclick=()=>{s.mode=e.dataset.cmMode;s.t=0;s.playing=false;render();});
 $('play').onclick=()=>{if(s.t>=1)s.t=0;s.playing=!s.playing;render();};$('reset').onclick=()=>{s={...initial};$('amount-help').hidden=true;$('help').setAttribute('aria-expanded','false');render();};$('full').onclick=()=>{document.body.classList.toggle('fullscreen');window.dispatchEvent(new Event('resize'));};
 function tick(now){if(disposed)return;if(s.playing&&!document.hidden){if(last)s.t=Math.min(1,s.t+Math.min(.06,(now-last)/1000)/8);if(s.t===1)s.playing=false;if(now-paint>40||s.t===1){render();paint=now;}}last=now;raf=requestAnimationFrame(tick);}
 render();raf=requestAnimationFrame(tick);window.dcCommutationState=()=>({...s});Lab.dispose=()=>{disposed=true;cancelAnimationFrame(raf);delete window.dcCommutationState;document.body.classList.remove('fullscreen');};
}
window.DCCommutation={sample,currentTravel,diagram,mount};
})();
