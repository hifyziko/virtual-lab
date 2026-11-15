(()=>{'use strict';
const $=id=>document.getElementById(id),M=SyncSchema,C={u:'#007e6c',e:'#ad701b',i:'#346fc0',x:'#50898a',d:'#8661b1',ui:'#243b91',leak:'#687cad',load:'#ba497d',r:'#b35e44',gray:'#a8b9b7'},zero=[0,0];
const tex=s=>katex.renderToString(s,{throwOnError:false}),fmt=(n,d=2)=>(Math.abs(n)<.5*10**-d?0:n).toFixed(d).replace('.',','),math=(id,s)=>$(id).innerHTML=tex(s);
document.querySelectorAll('[data-math]').forEach(el=>el.innerHTML=tex(el.dataset.math));
let step=4,target=null,last=null,diagramFit=null;
function params(){window.SyncReactanceControls();const s={type:$('type').value,beta:+$('beta').value,e:+$('e').value,xd:+$('xd').value,xq:+$('xq').value,r:$('rEnabled').checked?+$('r').value:0,xsigma:+$('xsigma').value};return s;}

function label(x,y,s,color=C.u,w=100,h=34){return `<foreignObject x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" class="math-label" style="color:${color}">${tex(s)}</div></foreignObject>`}
function defs(){return `<defs>${Object.entries(C).map(([k,c])=>`<marker id="a-${k}" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="7" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 4L0 8Z" fill="${c}"/></marker>`).join('')}</defs>`}
const line=(a,b,color,width=2,dash='')=>`<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
function arrow(a,b,k,width=2.6,dash=''){if(Math.hypot(b[0]-a[0],b[1]-a[1])<1)return '';return line(a,b,C[k],width,dash).replace('/>',` marker-end="url(#a-${k})"/>`)}
function circuit(a){
 $('circuit').innerHTML=SyncSchemaDrawing.circuit(a,{step,loadMode:$('loadMode').checked,merged:a.r===0,twoReaction:a.type==='salient'});
 const equation=a.type==='salient'?'\\overline U_a-R_a\\overline I_a-jX_q\\overline I_a-j(X_d-X_q)\\overline I_d=\\overline U_{ib}':'\\overline U_a-R_a\\overline I_a-jX_s\\overline I_a=\\overline U_{ib}';
 $('equation').innerHTML='<div>'+tex(equation)+'</div><div>'+tex('\\overline U_a-R_a\\overline I_a-jX_{a\\sigma}\\overline I_a=\\overline U_i')+'</div>';
}

function rotor(a){const salient=a.type==='salient';
 const state=SyncPrinciple.create();Object.assign(state,{type:a.type,rotor:Math.PI/2,field:Math.PI/2,excitation:a.e>0,excitationLevel:a.e,damper:false});
 $('rotor').setAttribute('viewBox','25 12 510 510');
 $('rotor').innerHTML=SyncMachineArt(state,false,{axes:false,forces:false},'').replace(/<text x="280" y="523"[\s\S]*?<\/text>/,'').replace(/<circle cx="[^"]*" cy="[^"]*" r="14"[\s\S]*?<\/text>/,'')+ '<path d="M280 32V502M45 267H515" stroke="'+C.d+'" stroke-width="2" stroke-dasharray="6 6"/>'+label(303,34,'d',C.d,35)+label(512,248,'q',C.d,35);
 $('rotorTitle').textContent=salient?'Dva směry, dvě reaktance':'Stejná mezera v obou osách';
 $('rotorNote').textContent=salient?'Pod pólem je menší magnetický odpor než mezi póly. Stejný proud proto v ose d vyvolá větší tokovou vazbu než v ose q.':'Hladký rotor v tomto modelu nerozlišuje podélnou a příčnou reaktanci. Přídavný člen vyniklosti zmizí; zůstane jediná synchronní reaktance.';
 math('reactances',`X_d=${fmt(a.xd)}\\quad X_q=${fmt(a.xq)}\\;\\mathrm{p.j.}`);
}
function fitDiagram(a,detail=false){
 const voltage=[],current=[],include=state=>{const {v,chain}=SyncSchemaGeometry.build(state,{merged:state.r===0,twoReaction:state.type==='salient'});voltage.push(v.E,v.Ui,v.U,...chain.flatMap(t=>[t.start,t.end]));current.push(v.I,v.Id,v.Iq,v.Imu);if($('loadMode').checked||state.P<0)current.push(v.Ig);};
 include(a);
 if(!detail){if($('loadMode').checked){for(let p=+$('loadP').min;p<=+$('loadP').max+.001;p+=.05)for(let phi=+$('loadPhi').min;phi<=+$('loadPhi').max;phi+=2)include(M.fromLoad(a,p,phi));}else{for(const e of [+$('e').min,+$('e').max])for(let beta=+$('beta').min;beta<=+$('beta').max;beta+=.5)include(M.solve({...a,e,beta}));}}
 const bounds=points=>points.reduce((b,z)=>[Math.min(b[0],-z[1]),Math.max(b[1],-z[1]),Math.min(b[2],-z[0]),Math.max(b[3],-z[0])],[0,0,0,0]);
 const vb=bounds(voltage),ib=bounds(current),width=492,height=406;
 const fit=b=>Math.min(width/Math.max(.1,b[1]-b[0]),height/Math.max(.1,b[3]-b[2]));
 let sv=fit(vb),si=fit(ib);
 // Keep both families inside one fixed frame; use their separate physical units.
 const combined=()=>[Math.min(vb[0]*sv,ib[0]*si),Math.max(vb[1]*sv,ib[1]*si),Math.min(vb[2]*sv,ib[2]*si),Math.max(vb[3]*sv,ib[3]*si)];
 let b=combined(),shrink=Math.min(1,width/Math.max(.1,b[1]-b[0]),height/Math.max(.1,b[3]-b[2]));sv*=shrink;si*=shrink;b=combined();
 diagramFit={voltage:sv,current:si,origin:[330-(b[0]+b[1])/2,286-(b[2]+b[3])/2],detail};
 $('phasorScale').value='1';
}
function lockedScales(a){if(!diagramFit)fitDiagram(a,true);const zoom=+($('phasorScale')?.value||1);return {...diagramFit,voltage:diagramFit.voltage*zoom,current:diagramFit.current*zoom};}
function phasor(a){
 $('directLegend').hidden=a.type!=='salient';$('leakageLegend').hidden=a.r===0;
 const combined=a.r===0;
 $('directLegend').innerHTML='● '+tex(combined?'jX_d\\overline I_d':'jX_{ad}\\overline I_d');
 $('reactionLegend').innerHTML='● '+tex(a.type==='salient'?(combined?'jX_q\\overline I_q':'jX_{aq}\\overline I_q'):(combined?'jX_s\\overline I_a':'jX_a\\overline I_a'));
 const out=SyncSchemaDrawing.phasor(a,{merged:a.r===0,twoReaction:a.type==='salient',step,showDQ:$('axes').checked&&a.type==='salient',showMMF:$('mmf').checked,loadMode:$('loadMode').checked,phi:+$('loadPhi').value,fixedScales:lockedScales(a)});
 $('phasor').innerHTML=out.html;window.syncSchemaScales=()=>({voltage:out.voltageScale,current:out.currentScale,origin:diagramFit.origin.slice(),detail:diagramFit.detail});window.syncSchemaGeometry=()=>out.geometry;
 $('triangleNote').innerHTML=$('mmf').checked?tex('\\overline I_\\mu=\\overline I_a+\\overline I_k')+'<span>'+(a.type==='smooth'?'Budicí proud přepočtený na kotvu a proud kotvy vytvářejí výslednou magnetomotorickou sílu.':'Součet proudů vyjadřuje výslednou magnetomotorickou sílu. Při vyniklých pólech její směr obecně není směrem výsledného toku.')+'</span>':'<span>Osy d a q se otáčejí s rotorem. Svorkové napětí Ua leží na reálné ose.</span>';
 $('scaleNote').textContent='Měřítka i počátek zůstávají pevné. Pokud fázory přesáhnou plochu, použijte Přeškálovat osy.';
}

function power(a){
 const W=Math.max(260,$("power").clientWidth||420),H=Math.max(140,$("power").clientHeight||260),top=25,bottom=H-15,zero=(top+bottom)/2;$("power").setAttribute("viewBox",`0 0 ${W} ${H}`);
 const points=[];for(let beta=-180;beta<=180;beta+=2){const sample=M.solve({...a,beta}),unexcited=M.solve({...a,beta,e:0});points.push({beta:window.torqueInternal?sample.internalBeta:sample.beta,value:sample.Pem,excitation:sample.Pem-unexcited.Pem,reluctance:unexcited.Pem});}
 const limit=Math.max(.6,Math.abs(a.Pem),...points.flatMap(p=>[Math.abs(p.value),Math.abs(p.excitation),Math.abs(p.reluctance)]))*1.12;
 let h='';
 // At synchronous speed, matching per-unit power/torque bases give M* = Pem*.
 // Generator-positive beta increases to the right; motor torque remains positive.
 for(const [left,right,title,color,key] of [[26,W-38,'M',C.d,'torque']]){
  const x=beta=>left+(beta+180)/360*(right-left),y=value=>zero-value/limit*(bottom-top)/2;
  h+='<rect x="'+left+'" y="'+top+'" width="'+(right-left)/2+'" height="'+(bottom-top)+'" fill="#edf7f2"/><rect x="'+x(0)+'" y="'+top+'" width="'+(right-left)/2+'" height="'+(bottom-top)+'" fill="#f5f0f8"/>';
  h+=line([left,zero],[right,zero],C.gray,1)+line([x(0),top],[x(0),bottom],C.gray,1,'3 4')+label(x(0),11,title,color,40,22);
  h+='<g font-family="system-ui" font-size="11" fill="#657b82"><text x="'+(left+7)+'" y="'+(top+14)+'">Motor · β &lt; 0</text><text x="'+(right-145)+'" y="'+(top+14)+'">Generátor · β &gt; 0</text></g>';
  for(const tick of [180,90,0,-90,-180]){h+=line([x(tick),zero-3],[x(tick),zero+4],C.gray,1)+'<text x="'+x(tick)+'" y="'+(zero+19)+'" text-anchor="middle" font-family="system-ui" font-size="10" fill="#657b82">'+tick+'°</text>';}
  h+=line([x(0)-3,top+7],[x(0),top],C.gray,1)+line([x(0),top],[x(0)+3,top+7],C.gray,1)+line([right-7,zero-3],[right,zero],C.gray,1)+line([right,zero],[right-7,zero+3],C.gray,1)+label(right+18,zero,String.fromCharCode(92)+(window.torqueInternal?'beta'+String.fromCharCode(92)+'prime':'beta'),C.gray,24,24);
  if(key==='torque')for(const [component,stroke,dash] of [['excitation',C.e,'5 3'],['reluctance',C.x,'2 3']]){
   let curve='',prev=null;for(const point of points){curve+=(prev===null||Math.abs(point.beta-prev)>180?'M':'L')+x(point.beta)+' '+y(point[component]);prev=point.beta;}
   h+='<path data-torque-component="'+component+'" d="'+curve+'" fill="none" stroke="'+stroke+'" stroke-width="1.7" stroke-dasharray="'+dash+'"/>';
  }
  let path='',previous=null;for(const point of points){const jump=previous===null||Math.abs(point.beta-previous)>180;path+=(jump?'M':'L')+x(point.beta)+' '+y(point.value);previous=point.beta;}
  h+='<path data-characteristic="'+key+'" d="'+path+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linejoin="round"/>';
  h+='<circle data-working-point="'+key+'" data-beta="'+a.beta+'" data-value="'+a.Pem+'" cx="'+x(window.torqueInternal?a.internalBeta:a.beta)+'" cy="'+y(a.Pem)+'" r="7.5" fill="'+C.e+'" stroke="white" stroke-width="2.5" style="filter:drop-shadow(0 1px 2px rgba(25,49,59,.35))"/>';
 }
 $('power').innerHTML=h;

 const stiffness=M.slope(a),stable=stiffness>1e-6;$('stability').classList.toggle('warning',!stable);$('stability').textContent=stable?'Kladná synchronizační tuhost vůči natočení rotoru při pevném napětí sítě. Malé vychýlení může stroj vrátit k pracovnímu bodu.':'Záporná synchronizační tuhost vůči natočení rotoru při pevném napětí sítě. Tento bod není stabilním synchronním chodem; diagram pouze ukazuje algebraické řešení.';if(Math.abs(stiffness)<=1e-6)$('stability').textContent='Nulová synchronizační tuhost: mezní bod nebo stav bez synchronizačního účinku. Nelze jej označit za stabilní synchronní chod.';
}
function update(){
 $('r').disabled=!$('rEnabled').checked; $('xsigma').disabled=false; $('xsigma').max=Math.max(0,Math.min(+$('xq').value, +$('xd').value)-.05);

 const loadMode=$('loadMode').checked; $('excitationControls').hidden=loadMode; $('loadControls').hidden=!loadMode; $('lock').disabled=loadMode; let s=params(),unreachable=false,angleInvalid=false,resolved=null;if(!loadMode&&$('lock').checked){const b=M.atPower(s,target);if(b===null)unreachable=true;else{resolved=M.solve({...s,beta:b});$('beta').value=resolved.beta;}}if(!loadMode&&!resolved){resolved=M.solve(s);if(!resolved){angleInvalid=true;resolved=last||M.solve(s);}}
 $('beta').disabled=$('lock').checked;$('xq').disabled=s.type==='smooth';$('xqLabel').style.opacity=s.type==='smooth'?'.45':'1';
 const a=loadMode?M.fromLoad(s,+$('loadP').value,+$('loadPhi').value):resolved;last=a;window.redrawTorque=()=>power(last);window.syncSchemaState=()=>({...a,step,locked:$('lock').checked,target,unreachable,angleInvalid,loadMode,phi:+$('loadPhi').value});
 math('eValue',`${fmt(a.e)}\\;\\mathrm{p.j.}`);math('betaValue',`${fmt(a.beta,1)}^\\circ`);for(const key of ['xd','xq','r','xsigma'])$(key+'Value').textContent=fmt(a[key],key==='r'?3:2);
 $('controlNote').classList.toggle('warning',unreachable);$('controlNote').textContent=unreachable?`Pro P = ${fmt(target)} p. j. už není dostupný stabilní bod. Zobrazen je bod při posledním β; skutečný výkon se od požadavku liší. Přibuďte nebo vypněte držení výkonu.`:$('lock').checked?`Držíme P = ${fmt(target)} p. j. Změnu buzení vyrovnává nový úhel β; sledujte hlavně Q a velikost proudu.`:'Měníte buzení a úhel nezávisle. Proud i oba výkony se dopočítávají z napěťové rovnice.';
 if(loadMode){math('loadPValue',fmt(+$('loadP').value)+'\\;\\mathrm{p.j.}');math('loadPhiValue',fmt(+$('loadPhi').value,0)+'^\\circ');$('controlNote').textContent='Zátěž určuje výstupní proud I_g = −I. Pro U = 1 p. j. vychází buzení Uᵢᵦ = '+fmt(a.e)+' p. j. a β = '+fmt(a.beta,1)+'°. Záporné P a Q níže znamenají dodávku ze stroje.';}
 if(angleInvalid){$('controlNote').classList.add('warning');$('controlNote').textContent='Pro zadané buzení a vnitřní β neexistuje bod s kladným Ui při Ua = 1 p. j. Diagram ponechává poslední platný bod; upravte zadání.';}
 $('controlNote').textContent+=a.r===0?' Odpor je zanedbaný; reakce kotvy a rozptyl jsou sdružené v synchronních reaktancích.':'';
 circuit(a);rotor(a);phasor(a);power(a);
 const stiffness=M.slope(a),syn=stiffness>1e-6,mode=Math.abs(a.Pem)<.005?'Bez činné přeměny':a.Pem>0?'Motor':'Generátor';$('miniMode').textContent=mode;$('mode').textContent=mode+(syn?'':stiffness< -1e-6?' · nestabilní bod':' · nulová tuhost');$('flow').textContent=Math.abs(a.P)<.005?'Síť ↔ jalový výkon':a.P>0?'Síť → stroj':'Stroj → síť';
 $('stateNote').textContent=Math.abs(a.Q)<.005?'Jalový výkon je téměř nulový. Proud leží na ose svorkového napětí.':a.Q>0?'Stroj odebírá jalový výkon ze sítě. Kladné Q znamená induktivní složku odběru.':'Stroj dodává jalový výkon do sítě. Záporné Q znamená kapacitní složku odběru.';
 for(const [id,v] of [['pValue',a.P],['qValue',a.Q],['iValue',a.amp]])$(id).textContent=fmt(v);$('pfValue').textContent=a.pf===null?'—':fmt(a.pf,3);$('pfNote').textContent=a.pf===null?'Proud je nulový':Math.abs(a.Q)<.005?'Bez jalové složky':a.Q>0?'Odběr jalového výkonu':'Dodávka jalového výkonu';
 if(loadMode){const phi=+$('loadPhi').value;$('stateNote').textContent=Math.abs(phi)<.5?'Generátor napájí odporovou zátěž. Výstupní proud Iᵍ je ve fázi se svorkovým napětím.':phi>0?'Generátor napájí induktivní zátěž. Výstupní proud Iᵍ zaostává za svorkovým napětím.':'Generátor napájí kapacitní zátěž. Výstupní proud Iᵍ předbíhá svorkové napětí.';$('pfNote').textContent=Math.abs(phi)<.5?'Odporová zátěž':phi>0?'Induktivní zátěž':'Kapacitní zátěž';}
 math('lossNote',`P_{\\mathrm{Cu}}=${fmt(a.loss)}\\quad P_{\\mathrm{em}}=${fmt(a.Pem)}\\;\\mathrm{p.j.}`);
 const notes={1:'Buzení vytváří vnitřní napětí Uᵢᵦ. Síť drží U; vnější úhel β vede od Ua k Uib, vnitřní β′ od Ui k Uib. Kladný směr je proti směru hodinových ručiček.',2:a.type==='salient'?'Proud rozložte na I_d a I_q. Každé složce odpovídá vlastní reaktance a napěťový úbytek.':'Od budicího napětí přičtěte reakci kotvy jXₐIₐ. Dostanete vnitřní napětí Uᵢ.',3:a.r!==0?'Od Uᵢᵦ přičtěte reakci kotvy: dostanete vnitřní Uᵢ. Rozptylový a odporový úbytek uzavřou řetězec na Uₐ.':'Reakce kotvy a rozptyl jsou sdružené v synchronních reaktancích; napěťový řetězec končí na Uₐ.',4:a.type==='salient'?'Vyniklost je rozdíl podélné a příčné reaktance. Při přepnutí na hladký rotor zmizí a dvě reaktance se sjednotí. Zkuste také vypnout buzení: reluktanční výkon může zůstat.':'U hladkého rotoru platí jediná reaktance X_s. Po vypnutí buzení nezůstává reluktanční přeměna výkonu; proud naprázdno může být přesto značný.'};$('focusNote').innerHTML=(a.e<1e-10?'Buzení je vypnuté: β se vztahuje k rotorové ose q. Nulové budicí napětí nemá definovaný argument. ':notes[step]);
 document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.step===step));
}
let labelSettleTimer=null,labelDragging=false;
const settleLabels=()=>{clearTimeout(labelSettleTimer);window.syncLabelsMoving=false;update();};
for(const id of ['e','beta','xd','xq','r','type','axes','mmf','loadMode','loadP','loadPhi','xsigma','rEnabled','phasorScale']){
 const el=$(id);
 el.addEventListener('pointerdown',()=>{if(el.type==='range')labelDragging=true;});
 el.addEventListener('input',()=>{clearTimeout(labelSettleTimer);window.syncLabelsMoving=true;update();if(!labelDragging)labelSettleTimer=setTimeout(settleLabels,200);});
 el.addEventListener('change',()=>{labelDragging=false;settleLabels();});
}
if(typeof window.addEventListener==='function')for(const name of ['pointerup','pointercancel','blur'])window.addEventListener(name,()=>{if(labelDragging){labelDragging=false;settleLabels();}});
$('fitPoint').onclick=()=>{fitDiagram(last,true);update()};
$('lock').onchange=()=>{target=last.P;update()};
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{step=+b.dataset.step;update()});
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{const kind=b.dataset.preset;$('loadMode').checked=kind==='generator';$('lock').checked=false;const s=params();let beta=-25,e=1.15;
 if(kind==='generator')beta=25;if(kind==='compensator'){beta=0;e=1.4}if(kind==='reluctance'){e=0;beta=-35}
 if(['under','unity','over'].includes(kind)){target=.5;const unity=M.fromLoad(s,-target,0);beta=unity.beta;e=kind==='unity'?unity.e:kind==='under'?unity.e*.8:unity.e*1.35;$('lock').checked=true;}
 $('beta').value=beta;$('e').value=e;step=4;update();});
$('loadMode').checked=true;$('lock').checked=false;
update();
if(typeof ResizeObserver!=="undefined")new ResizeObserver(()=>{if(last)power(last)}).observe($("power"));
})();
