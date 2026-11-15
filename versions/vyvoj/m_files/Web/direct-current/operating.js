/* DC operating lessons: one signed steady-state model, separate field supply. */
(()=>{'use strict';
const C={u:'#007e6c',i:'#346fc0',e:'#a76914',r:'#bf5849',p:'#ad365d',muted:'#718780',ink:'#233f49'},T=2*Math.PI;
const fmt=x=>(Math.abs(x)<1e-9?0:x).toFixed(2).replace('.','{,}');
function balance({u=1,w=.8,phi=1,r=.18,b=.04,fieldLoss=.04}={}){
 const e=phi*w,i=(u-e)/r,m=phi*i,pe=u*i,cu=r*i*i,pem=e*i,rot=b*w*w,pb=fieldLoss*phi*phi,shaft=pem-rot;
 const eta=shaft>1e-9&&pe+pb>0?shaft/(pe+pb):pe< -1e-9&&shaft<0?-pe/(-shaft+pb):null;
 return {u,w,phi,r,b,e,i,m,pe,cu,pem,rot,pb,shaft,eta};
}
function brake(s){
 const e=s.phi*s.w,sign=Math.sign(s.w),r=s.r+s.rb;
 const u=s.mode==='resistor'?0:s.mode==='plugging'?-sign*s.u:sign*s.u;
 const i=(u-e)/(s.mode==='regen'?s.r:r),m=s.phi*i;
 return {...balance({...s,u,r:s.mode==='regen'?s.r:r}),r:s.r,u,e,i,m,pe:u*i,cu:s.r*i*i,pem:e*i,external:s.mode==='regen'?0:s.rb*i*i,mode:s.mode};
}
function control(s){
 const phi=s.method==='field'?s.phi:1,u=s.method==='voltage'?s.u:1,r=s.r+(s.method==='resistance'?s.extra:0);
 const current=w=>Math.max(0,Math.min(s.limit,(u-phi*w)/r));
 const motor=w=>phi*current(w),load=w=>s.load*(s.loadType==='fan'?w*w:1)+.04*w;
 const upper=u/phi;let lo=0,hi=upper,stalled=motor(0)<load(0);
 if(!stalled)for(let j=0;j<60;j++){const mid=(lo+hi)/2;if(motor(mid)>load(mid))lo=mid;else hi=mid;}
 const w=stalled?0:(lo+hi)/2,i=current(w),actualU=phi*w+r*i;
 return {phi,u,r,w,i,m:phi*i,motor,load,stalled,limited:Math.abs(i-s.limit)<1e-6,actualU,extraLoss:(r-s.r)*i*i};
}
// Slide 25: ideal normalized drive envelope; resistance neglected only here.
function driveEnvelope(w,wk=2){const phi=w<=1?1:1/w,i=w<=wk?1:wk/w;return {phi,i,u:Math.min(w,1),m:phi*i,p:phi*i*w};}
function envelope(w,limit=1,r=.18){const phi=Math.max(.35,Math.min(1,(1-r*limit)/Math.max(w,1e-9))),i=Math.max(0,Math.min(limit,(1-phi*w)/r));return {phi,i,m:phi*i,p:phi*i*w};}
const txt=(x,y,t,c=C.ink,size=17)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" text-anchor="middle">${t}</text>`;
const math=(x,y,t,c=C.ink,size=20,w=160)=>DCVisual.math(x,y,t,c,size,w);
const line=(x,y,X,Y,c='#8aa39a',width=2)=>`<path d="M${x} ${y}L${X} ${Y}" fill="none" stroke="${c}" stroke-width="${width}"/>`;
const arr=(x,y,dx,dy,c=C.i)=>DCVisual.arrow(x,y,dx,dy,c,2.5);
function circuit(v,{mode='supply',losses=false}={}){
 let h='';const passive=mode==='resistor';
 h+=`<rect x="20" y="20" width="750" height="345" rx="15" fill="#f8faf9" stroke="#d9e4de"/>`;
 h+=line(110,100,190,100)+line(250,100,325,100)+line(397,100,520,100)+line(520,100,520,165)+line(520,235,520,290)+line(520,290,110,290)+line(110,290,110,230)+line(110,170,110,100);
 h+='<rect x="190" y="88" width="60" height="24" rx="3" fill="#faeae3" stroke="'+C.r+'" stroke-width="2.5"/>'+math(220,61,'R_a',C.r);
 h+='<path d="M325 100c0 -25 18 -25 18 0c0 -25 18 -25 18 0c0 -25 18 -25 18 0c0 -25 18 -25 18 0" fill="none" stroke="#687cad" stroke-width="2.5"/>'+math(361,61,'L_a', '#687cad');
 h+='<circle cx="520" cy="200" r="35" fill="#fff7e9" stroke="'+C.e+'" stroke-width="2.5"/>'+arr(520,180,0,40,C.e)+math(605,195,'u_i='+fmt(v.e),C.e,20,170);
 if(passive){h+='<rect x="98" y="170" width="24" height="60" rx="3" fill="#faeae3" stroke="'+C.r+'" stroke-width="2.5"/>'+math(57,200,'R_b',C.r,18,70);}
 else h+='<circle cx="110" cy="200" r="30" fill="#e6f3ef" stroke="'+C.u+'" stroke-width="2.5"/>'+math(110,190,v.u<0?'-':'+',C.u,20,40)+math(110,215,v.u<0?'+':'-',C.u,20,40)+math(53,143,'u_a',C.u,20,70);
 h+=arr(v.i>=0?145:185,135,v.i>=0?40:-40,0,C.i)+math(220,154,'i_a='+fmt(v.i),C.i,20,170);
 h+=math(360,151,'u_L=0', '#687cad',18)+txt(361,177,'ustálený stav',C.muted,13);
 h+=txt(640,260,'Elektromagnetická přeměna',C.ink,14)+math(640,292,'M=k\\Phi i_a',C.p,19,230);
 h+=arr(v.pem>=0?560:650,222,v.pem>=0?90:-90,0,v.pem>=0?C.u:C.p);
 h+=math(220,210,'R_ai_a='+fmt(v.r*v.i),C.r,18,180);
 h+=math(335,332,(mode==='plugging'||passive)?'u_s=(R_a+R_b)i_a+u_i':'u_a=R_ai_a+L_a\\frac{\\mathrm d i_a}{\\mathrm dt}+u_i',C.ink,20,590);
 if(mode==='plugging')h+='<rect x="430" y="88" width="55" height="24" rx="3" fill="#faeae3" stroke="'+C.r+'" stroke-width="2.5"/>'+math(455,61,'R_b',C.r,18,70);
 // Independent excitation circuit: same coil and resistor vocabulary as the synchronous lesson.
 h+='<rect x="800" y="20" width="340" height="345" rx="15" fill="#fffbf2" stroke="#e4d6b8"/>'+txt(970,53,'Cizí buzení',C.e,19);
 h+=line(855,100,925,100)+line(985,100,1080,100)+line(1080,100,1080,290)+line(1080,290,855,290)+line(855,290,855,230)+line(855,170,855,100);
 h+='<circle cx="855" cy="200" r="30" fill="white" stroke="'+C.e+'" stroke-width="2"/>'+math(855,194,'+',C.e)+math(855,215,'-',C.e);
 h+='<path d="M925 100c0 -22 15 -22 15 0c0 -22 15 -22 15 0c0 -22 15 -22 15 0c0 -22 15 -22 15 0" fill="none" stroke="'+C.e+'" stroke-width="2.5"/>';
 h+=math(969,148,'\\Phi='+fmt(v.phi),C.e,20,230)+math(969,200,'u_i=k\\Phi\\omega',C.e,20,230)+math(969,250,losses?'P_b='+fmt(v.pb):'i_b\\;\\longrightarrow\\;\\Phi',C.e,20,230);
 return h;
}
// Armature-reaction comparison: illustrative local flux law, not a measured machine.
function reactionSpeed({u,phi,r,reaction},i){return (u-r*i)/(phi*(1-reaction*i));}
function schemaCircuit(v,total=false){
 const m=(x,y,t,c=C.ink,size=20,w=160)=>'<g class="op-schematic-label">'+math(x,y-2,total?t.replaceAll('R_a','R_{\\Sigma}'):t,c,size,w)+'</g>';
 let h='<rect x="18" y="18" width="790" height="394" rx="12" fill="#fbfcfb" stroke="#d8e4de"/>';
 h+=txt(414,52,'Obvod kotvy',C.ink,18);
 // Ui on the left, motor current entering from the right, external terminals open.
 h+=line(190,135,345,135)+line(411,135,500,135)+line(572,135,700,135)+line(190,135,190,186)+line(190,258,190,310)+line(190,310,700,310);
 h+='<circle data-induced-source="left" cx="190" cy="222" r="36" fill="#fff7e9" stroke="'+C.e+'" stroke-width="2.5"/>'+arr(190,202,0,40,C.e)+m(112,222,'u_i',C.e,23,40);
 h+='<rect x="345" y="123" width="66" height="24" rx="2" fill="#faeae3" stroke="'+C.r+'" stroke-width="2.4"/>'+m(378,81,'R_a',C.r,21,100);
 h+='<path d="M500 135c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0" fill="none" stroke="#687cad" stroke-width="2.5"/>'+m(536,81,'L_a','#687cad',21,80);
 for(const y of [135,310])h+='<circle cx="700" cy="'+y+'" r="5" fill="white" stroke="'+C.u+'" stroke-width="2"/>';
 h+=arr(736,143,0,159,C.u)+m(778,222,'u_a',C.u,23,40);
 h+=arr(v.i>=0?670:610,83,v.i>=0?-60:60,0,C.i)+m(640,43,'i_a',C.i,23,60);
 h+=m(365,194,'R_ai_a='+fmt(v.r*v.i),C.r,21,190)+m(550,194,'u_L=0','#687cad',21,130);
 h+=m(435,264,'u_i=k\\Phi\\omega='+fmt(v.e),C.e,23,350);
 h+=m(414,367,'u_a=R_ai_a+L_a\\frac{\\mathrm d i_a}{\\mathrm dt}+u_i',C.ink,21,670);
 h+='<rect x="828" y="18" width="394" height="394" rx="12" fill="#edf6f1" stroke="#c8dfd3"/>'+txt(1025,52,'Z napěťové bilance k otáčkám',C.u,17);
 h+=m(1025,105,'u_a-R_ai_a=k\\Phi\\omega',C.ink,22,360);
 h+=m(1025,183,'\\boxed{\\displaystyle\\omega=\\frac{u_a-R_ai_a}{k\\Phi}}',C.u,26,360);
 h+=m(1025,274,'\\displaystyle\\omega_0=\\frac{u_a}{k\\Phi}',C.ink,23,360);
 h+=m(1025,362,'\\displaystyle\\omega=\\omega_0-\\frac{R_a M}{(k\\Phi)^2}',C.u,22,360);
 return h;
}
function power(v){
 const max=Math.max(.05,...[v.pe,v.pem,v.shaft,v.cu,v.rot,v.pb,v.external||0].map(Math.abs));
 const bars=[['Elektrické svorky','P_a',v.pe,C.u],['Měď kotvy','P_{\\mathrm{Cu}}',v.cu,C.r],['Elektromagnetická přeměna','P_{\\mathrm{em}}',v.pem,C.e],['Mechanické ztráty','P_{\\mathrm{rot}}',v.rot,C.r],['Hřídel','P_{\\mathrm{h}}',v.shaft,C.p],['Samostatné buzení','P_b',v.pb,C.e]];
 let h='';bars.forEach(([name,symbol,value,color],j)=>{const y=35+j*45;h+=txt(132,y,name,C.ink,14)+line(280,y-8,610,y-8,'#e4ebe7',15)+line(280,y-8,280+330*Math.abs(value)/max,y-8,color,15)+math(710,y,symbol+'='+fmt(value),color,17,180);});
 return h+math(400,325,'P_a=P_{\\mathrm{Cu}}+P_{\\mathrm{em}},\\qquad P_{\\mathrm h}=P_{\\mathrm{em}}-P_{\\mathrm{rot}}',C.ink,18,760);
}
function graph(curves,{x=[0,2],y=[0,2],xt='\\omega',yt='M',point}={}){return DCVisual.plot({curves,x,y,xt,yt,point});}
function valueCards(items){return items.map(([title,formula,color])=>`<div style="--dc-accent:${color||C.u}"><span>${title}</span><strong>${DCVisual.tex(formula)}</strong></div>`).join('');}
const slider=(key,title,min,max,step,value)=>`<label id="op-wrap-${key}">${title}<output id="op-${key}-value"></output><input id="op-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
const select=(key,title,options)=>`<label id="op-wrap-${key}">${title}<select id="op-${key}">${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;
function mount(app,entry,kind){
 const defaults={u:1,w:.8,phi:1,r:.18,b:.04,fieldLoss:.04,load:.55,limit:1.2,extra:.3,rb:.6,method:'voltage',loadType:'constant',mode:'regen',tab:'voltage',reaction:.12,testCurrent:1,wk:2};let s={...defaults,tab:entry.driveDetails?'reaction':'voltage'};
 if(entry.driveDetails&&entry.driveReturn){const d=entry.driveReturn,a=DCDrive.parameters(d);Object.assign(s,{u:a.u,phi:a.phi,w:d.w,r:a.r});defaults.u=s.u;defaults.phi=s.phi;defaults.w=s.w;defaults.r=s.r;} 
 const header=`<div class="modulehead"><a class="back" href="#group-dc">← Stejnosměrné stroje</a><span class="num">${entry.num}</span><h1>${entry.driveDetails?'Samokompenzace malých motorů':entry.title}</h1><div class="actions">${entry.driveDetails?'<button id="op-drive-back">← Schéma a řízení</button>':''}<button id="op-reset">Výchozí stav</button><button id="op-full">Celá obrazovka</button></div></div>`;
 let controls=slider('u','Napětí kotvy',.1,1.4,.02,s.u)+slider('w','Úhlová rychlost',0,1.8,.02,s.w)+slider('phi','Budicí tok',.35,1.2,.01,s.phi)+slider('r','Odpor kotvy',.02,.5,.01,s.r);
 if(kind==='rizeni')controls=select('method','Způsob řízení',[['voltage','Napětí kotvy'],['field','Odbuzování'],['resistance','Přídavný odpor']])+slider('u','Napětí kotvy',.1,1,.02,s.u)+slider('phi','Budicí tok',.35,1,.01,s.phi)+slider('extra','Přídavný odpor',0,1,.02,s.extra)+slider('load','Zatížení',0,1.5,.02,s.load)+slider('limit','Proudový limit',.3,1.5,.05,s.limit)+select('loadType','Zátěž',[['constant','Konstantní moment'],['fan','Ventilátor']]);
 if(kind==='brzdeni')controls=select('mode','Zapojení',[['regen','Zdroj / rekuperace'],['resistor','Odporové brzdění'],['plugging','Protiproudé brzdění']])+slider('w','Úhlová rychlost',-1.8,1.8,.02,1.2)+slider('u','Velikost napětí zdroje',.1,1.4,.02,.8)+slider('rb','Brzdný odpor',.1,1.5,.02,s.rb)+slider('phi','Budicí tok',.35,1,.01,s.phi);
 if(kind==='schema')controls+=select('method','Způsob řízení',[['voltage','Napětí kotvy'],['field','Odbuzování'],['resistance','Přídavný odpor']])+slider('extra','Přídavný odpor',0,1,.02,s.extra)+slider('load','Zatížení',0,1.5,.02,s.load)+slider('limit','Proudový limit',.3,1.5,.05,s.limit)+select('loadType','Zátěž',[['constant','Konstantní moment'],['fan','Ventilátor']])+slider('wk','Komutační mez otáček',1.2,3,.1,s.wk)+slider('b','Mechanické ztráty',0,.15,.01,s.b)+slider('fieldLoss','Ztráty buzení',0,.12,.01,s.fieldLoss);
 if(kind==='brzdeni'){s.w=1.2;s.u=.8;}
 app.classList.add('module-window-host');app.innerHTML=`<div class="workspace learning-workspace uniform-module-layout dc-workspace dc-operating${entry.driveDetails?' op-details-workspace':''}">${header}<div class="op-controls">${controls}</div>${kind==='schema'?'<div class="op-tabs"><button data-op-tab="voltage">Napěťová bilance</button><button data-op-tab="control">Řízení otáček</button><button data-op-tab="limits">Meze řízení</button><button data-op-tab="reaction">Odpor a reakce kotvy</button><button data-op-tab="power">Ztráty a účinnost</button></div>':''}${kind==='schema'?'<div id="op-reaction-controls" class="op-reaction-controls" hidden>'+slider('reaction','Zeslabení toku při jednotkovém proudu',0,.2,.01,s.reaction)+slider('testCurrent','Proud pro porovnání',0,1.5,.05,s.testCurrent)+'<button id="op-resistance-high">Větší relativní odpor</button><button id="op-resistance-low">Menší relativní odpor</button></div>':''}${entry.driveDetails?'':'<div id="op-cards" class="op-cards"></div>'}<section class="learning-panel${entry.driveDetails?' op-overview':''}"><svg id="op-scheme" data-plain-svg viewBox="0 0 1160 380" role="img" aria-label="Zapojení stroje a budicího obvodu"></svg>${entry.driveDetails?'<aside id="op-cards" class="op-cards" aria-label="Pracovní bod stroje"></aside>':''}</section><div class="op-plots"><section class="learning-panel"><h2 id="op-title-a"></h2><svg id="op-plot-a" data-plain-svg viewBox="0 0 540 234" role="img" aria-label="Charakteristika stroje"></svg></section><section class="learning-panel"><h2 id="op-title-b"></h2><svg id="op-plot-b" data-plain-svg viewBox="0 0 540 234" role="img" aria-label="Výkonová nebo napěťová bilance"></svg></section></div><p id="op-insight" class="op-insight"></p><p class="op-note">Poměrné veličiny · ustálený stav · lineární buzení. Ztráty v železe a úbytek na kartáčích nejsou zahrnuté.</p></div>`;
 const $=id=>app.querySelector('#op-'+id);
 if(entry.driveDetails){app.querySelectorAll('[data-op-tab]').forEach(b=>b.hidden=true);$('drive-back').onclick=()=>{Lab.dispose();DCDrive.mount(app,entry,entry.driveReturn);};}
 function render(){
  let v=balance(s);if(kind==='brzdeni')v=brake(s);
  for(const key of ['u','w','phi','r','load','limit','extra','rb','b','fieldLoss','reaction','testCurrent','wk'])if($(key)){$(key).value=s[key];$(key+'-value').innerHTML=DCVisual.tex(fmt(s[key])+'\\,\\mathrm{p.u.}');}
  for(const key of ['method','loadType','mode'])if($(key))$(key).value=s[key];
  if(kind==='schema'){
   const controlled=s.tab==='control',limits=s.tab==='limits';
   const visible=limits?['wk']:controlled?['method','u','phi','r','extra','load','limit','loadType']:s.tab==='reaction'?['u','phi','r']:s.tab==='power'?['u','w','phi','r','b','fieldLoss']:['u','w','phi','r'];
   for(const key of ['u','w','phi','r','b','fieldLoss','method','extra','load','limit','loadType','wk'])$('wrap-'+key).hidden=!visible.includes(key);
   $('u').disabled=controlled&&s.method!=='voltage';$('phi').disabled=controlled&&s.method!=='field';$('extra').disabled=s.method!=='resistance';
   $('reaction-controls').hidden=s.tab!=='reaction';$('w').disabled=s.tab==='reaction';
   if(s.tab==='reaction')v=balance({...s,w:reactionSpeed(s,s.testCurrent),phi:s.phi*(1-s.reaction*s.testCurrent)});
   $('b').disabled=s.tab!=='power';$('fieldLoss').disabled=s.tab!=='power';
   const motor=v.shaft>0,generator=v.pe<0;const regime=motor?'Motor':generator?'Generátor':v.pem<0?'Brzdění':'Ztrátový provoz';
   $('cards').innerHTML=valueCards([[regime,'i_a='+fmt(v.i),C.i],['Vnitřní napětí','u_i='+fmt(v.e),C.e],['Moment','M='+fmt(v.m),C.p],['Účinnost',v.eta===null?'\\eta\\;\\text{—}':'\\eta='+fmt(100*v.eta)+'\\,\\%',C.u]]);
   $('scheme').setAttribute('viewBox',s.tab==='power'?'0 0 800 360':s.tab==='limits'?'0 0 1160 380':'0 0 1240 430');$('scheme').innerHTML=s.tab==='power'?power(v).replace('Měď kotvy',entry.driveDetails&&entry.driveReturn?.method==='resistance'?'Kotva a přídavný odpor':'Měď kotvy'):schemaCircuit(v);
   app.querySelectorAll('[data-op-tab]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.opTab===s.tab)));
   $('title-a').textContent='Napětí: svorkové (zeleně), vnitřní (zlatě), odporový úbytek (červeně)';$('plot-a').innerHTML=graph([{fn:i=>s.u,color:C.u},{fn:i=>s.u-s.r*i,color:C.e},{fn:i=>s.r*i,color:C.r}],{x:[-2,2],y:[-.6,2.5],xt:'i_a',yt:'u',point:[v.i,v.e]});
   $('title-b').textContent=s.tab==='power'?'Účinnost podle rychlosti':'Moment podle rychlosti';
   $('plot-b').innerHTML=graph([{fn:w=>{const m=balance({...s,w});return s.tab==='power'?(m.eta??0):m.m;},color:s.tab==='power'?C.u:C.p}],{x:[0,1.8],y:s.tab==='power'?[0,1]:[-8,8],yt:s.tab==='power'?'\\eta':'M',point:[s.w,s.tab==='power'?(v.eta??0):v.m]});
   $('insight').innerHTML=DCVisual.tex('u_a='+fmt(v.u)+'='+fmt(v.e)+'+('+fmt(v.r*v.i)+')')+' — '+(generator?'Vnitřní napětí převyšuje svorkové, proud se obrací a stroj vrací energii do zdroje.':'Rozdíl svorkového a vnitřního napětí určuje proud. Indukčnost je ve schématu zachována; v ustálení na ní není úbytek.')+' Účinnost zahrnuje samostatné buzení.';
   if(s.tab==='reaction'){
    const w0=s.u/s.phi,upper=Math.max(w0,reactionSpeed({...s,r:0},1.5))*1.08;
    $('title-a').textContent='Odpor snižuje otáčky · zeslabení toku je zvyšuje';
    $('plot-a').innerHTML=graph([{fn:i=>reactionSpeed({...s,reaction:0},i),color:C.r},{fn:i=>reactionSpeed({...s,r:0},i),color:C.e},{fn:i=>reactionSpeed(s,i),color:C.u}],{x:[0,1.5],y:[0,upper],xt:'i_a',yt:'\\omega',point:[s.testCurrent,v.w]});
    $('title-b').textContent='Stejné zeslabení toku, různý odpor kotvy';
    $('plot-b').innerHTML=graph([{fn:i=>reactionSpeed({...s,r:.18},i),color:C.r},{fn:i=>reactionSpeed({...s,r:.04},i),color:C.i}],{x:[0,1.5],y:[0,upper],xt:'i_a',yt:'\\omega'});
    $('insight').innerHTML='Červeně: odporový pokles. Zlatě: samotné zeslabení toku. Zeleně: oba účinky současně. U menších strojů bývá relativní odpor kotvy větší a může vyrovnat růst otáček způsobený demagnetizací. Kompenzační vinutí proto nemusí být kvůli průběhu otáček nutné. <strong>Odpor neruší pole reakce kotvy ani nenahrazuje pomocné póly.</strong> Vpravo: '+DCVisual.tex('R_a=0{,}18')+' červeně, '+DCVisual.tex('R_a=0{,}04')+' modře. Ilustrativní zákon '+DCVisual.tex('\\Phi=\\Phi_0(1-a i_a)')+'.';
   }

   if(controlled){
    const q=control(s);v=balance({...s,u:q.actualU,w:q.w,phi:q.phi,r:q.r});
    $('scheme').innerHTML=schemaCircuit(v,true);
    $('cards').innerHTML=valueCards([['Pracovní bod','\\omega='+fmt(q.w),C.u],['Proud kotvy','i_a='+fmt(q.i),C.i],['Moment','M='+fmt(q.m),C.p],['Ztráta přídavného odporu','P_{R_p}='+fmt(q.extraLoss),C.r]]);
    const variants=[.45,.7,1].map((n,k)=>({q:control({...s,[s.method==='field'?'phi':s.method==='resistance'?'extra':'u']:n}),color:['#cad9d3','#99bdae','#6b9f8e'][k]}));
    const speed=(a,i)=>(a.u-a.r*i)/a.phi;
    $('title-a').textContent='Otáčková charakteristika · rychlost podle proudu';
    $('plot-a').innerHTML=graph([...variants.map(a=>({fn:i=>speed(a.q,i),color:a.color})),{fn:i=>speed(q,i),color:C.u}],{x:[0,1.6],y:[0,4],xt:'i_a',yt:'\\omega',point:[q.i,q.w]});
    $('title-b').textContent='Mechanická charakteristika · rychlost podle momentu';
    $('plot-b').innerHTML=graph([...variants.map(a=>({fn:m=>speed(a.q,m/a.q.phi),color:a.color})),{fn:m=>speed(q,m/q.phi),color:C.u}],{x:[0,1.6],y:[0,4],xt:'M',yt:'\\omega',point:[q.m,q.w]});
    $('insight').innerHTML=DCVisual.tex('\\omega=\\frac{u_a}{k\\Phi}-\\frac{R_\\Sigma M}{(k\\Phi)^2},\\qquad R_\\Sigma=R_a+R_p')+' — '+(q.stalled?'Zátěž překračuje dostupný moment: motor stojí.':q.limited?'Proudový limit snižuje skutečné napětí kotvy; pracovní bod proto neleží na neomezené charakteristice.':s.method==='field'?'Odbuzování zvyšuje otáčky naprázdno a změkčuje charakteristiku.':s.method==='resistance'?'Přídavný odpor zvětšuje pokles otáček se zatížením a ztráty.':'Změnou napětí se charakteristiky rovnoběžně posouvají.')+' Bod odpovídá zvolenému zatížení.';
   }
   if(limits){
    $('scheme').innerHTML=txt(580,55,'Řízení napětím → odbuzování → omezení komutací',C.ink,24)+math(580,122,'\\omega=\\omega_0-\\frac{R_a M}{(k\\Phi)^2}',C.u,29,900)+math(580,205,'M=k\\Phi i_a,\\qquad P_{\\mathrm{em}}=M\\omega',C.e,26,1000)+math(580,293,'u_r\\sim\\omega i_a,\\qquad \\omega>\\omega_k:\\;i_a\\sim\\omega^{-1}',C.r,25,1000);
    $('cards').innerHTML=valueCards([['Do základních otáček','\\Phi=\\Phi_n,\\ M=\\mathrm{konst.}',C.e],['Odbuzování','P=\\mathrm{konst.}',C.u],['Komutační mez','\\omega_k='+fmt(s.wk),C.r],['Za komutační mezí','M\\sim\\omega^{-2}',C.p]]);
    $('title-a').textContent='Napětí zeleně · tok zlatě · proud modře';
    $('plot-a').innerHTML=graph([{fn:w=>driveEnvelope(w,s.wk).u,color:C.u},{fn:w=>driveEnvelope(w,s.wk).phi,color:C.e},{fn:w=>driveEnvelope(w,s.wk).i,color:C.i}],{x:[0,4],y:[0,1.15],xt:'\\omega/\\omega_n',yt:'u,\\Phi,i_a'});
    $('title-b').textContent='Moment růžově · výkon zeleně';
    $('plot-b').innerHTML=graph([{fn:w=>driveEnvelope(w,s.wk).m,color:C.p},{fn:w=>driveEnvelope(w,s.wk).p,color:C.u}],{x:[0,4],y:[0,1.15],xt:'\\omega/\\omega_n',yt:'M,P'});
    $('insight').innerHTML='Do základních otáček roste napětí při plném toku a konstantním proudu. Potom klesá tok: moment klesá, výkon zůstává konstantní. Za komutační mezí musí klesat také proud: '+DCVisual.tex('P\\sim1/\\omega,\\quad M\\sim1/\\omega^2')+'. Idealizovaná obálka zanedbává odporový úbytek a ztráty; mez je ilustrativní, nikoli limit konkrétního stroje.';
   }


  }else if(kind==='rizeni'){
   const q=control(s);v=balance({...s,u:q.actualU,w:q.w,phi:q.phi,r:s.r});
   $('u').disabled=s.method!=='voltage';$('phi').disabled=s.method!=='field';$('extra').disabled=s.method!=='resistance';
   $('cards').innerHTML=valueCards([[q.stalled?'Nedostatečný moment':'Pracovní bod','\\omega='+fmt(q.w),C.u],['Proud kotvy','i_a='+fmt(q.i),C.i],['Moment','M='+fmt(q.m),C.p],['Ztráta přídavného odporu','P_{R_p}='+fmt(q.extraLoss),C.r]]);
   $('scheme').setAttribute('viewBox','0 0 1160 380');
   const curves=[.45,.7,1].map((n,k)=>{const variant={...s,[s.method==='field'?'phi':s.method==='resistance'?'extra':'u']:n};return {fn:control(variant).motor,color:['#cad9d3','#99bdae','#6b9f8e'][k]};});
   $('scheme').innerHTML=`<g transform="translate(0 5) scale(1.5)">${graph([...curves,{fn:q.motor,color:C.u},{fn:q.load,color:C.r}],{x:[0,3],y:[0,1.7],point:[q.w,q.m]})}</g>`+txt(980,95,'Pracovní bod = rovnováha momentů',C.ink,17)+math(980,145,'M=M_z+M_{\\mathrm{ztr}}',C.u,23,330)+math(980,210,'\\omega=\\frac{u_a-R_\\Sigma i_a}{k\\Phi}',C.e,23,330)+txt(980,280,q.limited?'Aktivní proudové omezení':'Bez zásahu proudového omezení',q.limited?C.r:C.muted,16);
   $('title-a').textContent='Dostupný moment při mezích napětí a proudu';$('plot-a').innerHTML=graph([{fn:w=>envelope(w,s.limit,s.r).m,color:C.p}],{x:[0,3],y:[0,1.7]});
   $('title-b').textContent='Výkon (zeleně) a tok (zlatě) při stejných mezích';$('plot-b').innerHTML=graph([{fn:w=>envelope(w,s.limit,s.r).p,color:C.u},{fn:w=>envelope(w,s.limit,s.r).phi,color:C.e}],{x:[0,3],y:[0,1.7],yt:'P,\\;\\Phi'});
   $('insight').textContent=q.stalled?'Zátěž vyžaduje větší moment, než dovoluje proudový limit. Motor se z tohoto stavu nerozběhne.':s.method==='field'?'Odbuzování zvyšuje dosažitelnou rychlost, ale snižuje moment na ampér. Obálka zahrnuje minimální tok; komutační a mechanické meze konkrétního stroje zde nejsou určeny.':s.method==='resistance'?'Přídavný odpor změkčuje charakteristiku a mění část příkonu na teplo. Proudové omezení představuje samostatnou ochranu zdroje.':'Napětí posouvá charakteristiku při zachovaném buzení. Červeně je zátěž, zeleně motor; bod jejich průsečíku je ustálený chod.';
  }else{
   $('rb').disabled=s.mode==='regen';$('u').disabled=s.mode==='resistor';
   const regenerative=v.pe< -1e-9,braking=v.pem< -1e-9;
   $('cards').innerHTML=valueCards([[braking?'Brzdný moment':'Motorický / klidový stav','M='+fmt(v.m),C.p],['Proud kotvy','i_a='+fmt(v.i),C.i],[regenerative?'Energie do zdroje':'Příkon ze zdroje','P_a='+fmt(v.pe),C.u],['Teplo v odporech','P_R='+fmt(v.cu+v.external),C.r]]);
   $('scheme').setAttribute('viewBox','0 0 1160 380');$('scheme').innerHTML=circuit(v,{mode:s.mode})+ (s.mode==='plugging'?txt(400,18,'Zdroj přepólován · v sérii přídavný brzdný odpor',C.r,14):'');
   $('title-a').textContent='Čtyři kvadranty: moment a rychlost';$('plot-a').innerHTML=graph([{fn:w=>brake({...s,w}).m,color:C.p}],{x:[-1.8,1.8],y:[-Math.max(2,Math.abs(v.m)*1.15),Math.max(2,Math.abs(v.m)*1.15)],xt:'\\omega',yt:'M',point:[s.w,v.m]});
   $('title-b').textContent='Příkon (zeleně), přeměna (zlatě), teplo (červeně)';$('plot-b').innerHTML=graph([{fn:w=>brake({...s,w}).pe,color:C.u},{fn:w=>brake({...s,w}).pem,color:C.e},{fn:w=>{const m=brake({...s,w});return m.cu+m.external;},color:C.r}],{x:[-1.8,1.8],y:[-15,20],xt:'\\omega',yt:'P'});
   $('insight').innerHTML=DCVisual.tex('P_a-P_{\\mathrm{em}}=P_{\\mathrm{Cu}}+P_{R_b}='+fmt(v.cu+v.external))+' — '+(s.mode==='resistor'?'Zdroj kotvy je odpojen. Energie pohybu se mění na teplo v kotvě a brzdném odporu; buzení zůstává napájené.':s.mode==='plugging'?'Zdroj dodává energii současně s brzděným pohybem; obojí se mění na teplo. Při zastavení se musí odpojit, jinak následuje rozběh opačným směrem.':regenerative?'Stroj vrací energii do zdroje. Zdroj nebo měnič musí umět tuto energii přijmout.':'Při této rychlosti je vnitřní napětí příliš malé pro rekuperaci: stroj odebírá energii ze zdroje.');
  }
 }
 for(const key of ['u','w','phi','r','load','limit','extra','rb','b','fieldLoss','reaction','testCurrent','wk'])if($(key))$(key).oninput=()=>{s[key]=+$(key).value;render();};
 for(const key of ['method','loadType','mode'])if($(key))$(key).onchange=()=>{s[key]=$(key).value;render();};
 app.querySelectorAll('[data-op-tab]').forEach(e=>e.onclick=()=>{s.tab=e.dataset.opTab;render();});
 if(kind==='schema'){ $('resistance-high').onclick=()=>{s.r=.18;render();};$('resistance-low').onclick=()=>{s.r=.04;render();}; }
 $('reset').onclick=()=>{s={...defaults,tab:entry.driveDetails?'reaction':'voltage',...(kind==='brzdeni'?{w:1.2,u:.8}:{})};render();};$('full').onclick=()=>{document.body.classList.toggle('fullscreen');window.dispatchEvent(new Event('resize'));};
 render();window.dcOperatingState=()=>({...s});Lab.dispose=()=>{delete window.dcOperatingState;document.body.classList.remove('fullscreen');};
}
window.DCOperating={driveEnvelope,balance,brake,control,envelope,circuit,schemaCircuit,reactionSpeed,power,mount};
})();

