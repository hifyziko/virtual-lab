/* DC drive lesson: lecture coordinates and shared electrical/mechanical state. */
(()=>{'use strict';
const C={u:'#007e6c',phi:'#ac741f',i:'#356fbe',m:'#293e47',load:'#b47e24',env:'#8c609d',saved:'#95a49e',r:'#be594b'},clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),f=x=>(Math.abs(x)<1e-9?0:x).toFixed(2).replace('.','{,}');
const initial={method:'voltage',u:1,phi:1,r:.18,extra:0,w:.85,load:.6,inertia:1,limit:1,wk:2,axis:'m',family:true,running:false,fit:false};
function parameters(s){return {u:['voltage','brake'].includes(s.method)?s.u:1,phi:['field','brake'].includes(s.method)?s.phi:1,r:s.r+(s.method==='resistance'?s.extra:0)};}
function point(s,w=s.w){const a=parameters(s),i=(a.u-a.phi*w)/a.r,m=a.phi*i,loss=.04*w;return {...a,w,i,m,ui:a.phi*w,p:m*w,cu:a.r*i*i,reserve:m-s.load-loss,load:s.load+loss};}

function applyBrake(s){const a=parameters(s);return {...s,method:'brake',phi:a.phi,u:clamp(a.phi*s.w-.4*s.r,0,1)};}
function controlEquation(s){const active=(v,c)=>'\\textcolor{'+c+'}{\\boldsymbol{'+v+'}}',u=['voltage','brake'].includes(s.method)?active('u_a',C.u):'u_a',phi=s.method==='field'?active('\\Phi',C.phi):'\\Phi',r=s.method==='resistance'?'(R_a+'+active('R_p',C.r)+')':'R_a';return '\\displaystyle \\omega=\\frac{'+u+'-'+r+'\\,i_a}{k\\,'+phi+'}';}
function equationAnnotation(s,saved,X,Y,ymax,val){
 // Choose a corner clear of the characteristic family, load and limit curves.
 const samples=[],add=(x,y)=>samples.push([X(x),Y(y)]),family=s.method==='field'?[1,.8,.6,.4]:s.method==='resistance'?[0,.2,.5,.8]:[.25,.5,.75,1];
 for(let j=0;j<=80;j++){const w=ymax*j/80;add(val(point(s,w)),w);add(val(point(saved,w)),w);const e=envelope(s,w);add(s.axis==='i'?e.i:e.m,w);add((s.load+.04*w)/(s.axis==='i'?parameters(s).phi:1),w);if(s.family)for(const n of family)add(val(point({...s,[s.method==='field'?'phi':s.method==='resistance'?'extra':'u']:n},w)),w);}
 const width=258,height=90,corners=[[412,77],[90,77],[412,338],[90,338]],score=([x,y])=>samples.filter(([px,py])=>px>=x-8&&px<=x+width+8&&py>=y-8&&py<=y+height+8).length;
 const [x,y]=corners.reduce((best,next)=>score(next)<score(best)?next:best);
 return '<foreignObject id="dd-active-equation" x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'"><div xmlns="http://www.w3.org/1999/xhtml" class="dd-graph-equation">'+DCVisual.tex(controlEquation(s))+'</div></foreignObject>';
}
function compactCircuit(s){const q=point(s);
 return line(75,68,145,68,C.m,2)+line(199,68,290,68,C.m,2)+line(75,68,75,86,C.m,2)+line(75,126,75,144,C.m,2)+line(75,144,290,144,C.m,2)
  +'<circle cx="75" cy="106" r="20" fill="#fff7e8" stroke="'+C.phi+'" stroke-width="2"/>'+arr(75,94,0,24,C.phi)+circuitLabel(25,106,'u_i',C.phi,18,40)
  +'<rect x="145" y="58" width="54" height="20" fill="#faede7" stroke="'+C.r+'" stroke-width="2"/>'+circuitLabel(172,36,s.method==='resistance'?'R_a+R_p':'R_a',C.r,18,100)
  +terminals(290,68,144)+currentArrow(250,44,52,q.i)+voltageArrow(315,74,138,'u_a',C.u)
  +circuitLabel(184,116,'u_i=k\\Phi\\omega',C.phi,18,180);
}

function equilibrium(s){const a=parameters(s);return Math.max(0,(a.phi*a.u-a.r*s.load)/(a.phi*a.phi+.04*a.r));}
function advance(s,dt){let left=Math.min(.1,Math.max(0,dt));while(left>0){const h=Math.min(.002,left);s.w=clamp(s.w+h*point(s).reserve/s.inertia,0,3.2);left-=h;}return s.w;}
function envelope(s,w){const i=s.limit*Math.min(1,s.wk/Math.max(w,1e-9)),base=1-s.r*s.limit,phi=w<=base?1:(1-s.r*i)/Math.max(w,1e-9),u=Math.min(1,w*phi+s.r*i);return {i,phi,u,m:phi*i,p:phi*i*w,base,region:w<=base?0:w<=s.wk?1:2};}
const line=(x,y,X,Y,c='#dce6e0',width=1,dash='')=>`<path d="M${x} ${y}L${X} ${Y}" fill="none" stroke="${c}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const path=(pts,c,width=2,dash='')=>`<path d="${pts.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ')}" fill="none" stroke="${c}" stroke-width="${width}" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const dot=(x,y,c,r=5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="white" stroke-width="2"/>`;
const math=(x,y,s,c=C.m,size=18,w=160)=>DCVisual.math(x,y,s,c,size,w),txt=(x,y,s,c=C.m,size=14)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${c}" font-size="${size}">${s}</text>`,arr=(x,y,dx,dy,c)=>DCVisual.arrow(x,y,dx,dy,c,2);
// Keep the existing KaTeX renderer; center its fixed math box on the label anchor.
const circuitLabel=(x,y,s,c=C.m,size=20,w=100)=>'<g class="dd-schematic-label">'+math(x,y-2,s,c,size,w)+'</g>';
const terminals=(x,top,bottom)=>[top,bottom].map(y=>`<circle data-terminal="armature" cx="${x}" cy="${y}" r="4" fill="white" stroke="${C.u}" stroke-width="2"/>`).join('');
const currentArrow=(x,y,length,current)=>arr(x+(current>=0?length/2:-length/2),y,current>=0?-length:length,0,C.i)+circuitLabel(x,y-24,'i_a',C.i,20,50);
const voltageArrow=(x,top,bottom,label,color)=>arr(x,top,0,bottom-top,color)+circuitLabel(x+30,(top+bottom)/2,label,color,20,40);
function circuit(s){const a=point(s);let h='';
 h+=line(195,84,270,84,C.m,2)+line(326,84,374,84,C.m,2)+line(422,84,488,84,C.m,2)+line(195,84,195,135,C.m,2)+line(195,191,195,242,C.m,2)+line(195,242,488,242,C.m,2);
 h+='<circle cx="195" cy="163" r="28" fill="#fff7e8" stroke="'+C.phi+'" stroke-width="2"/>'+arr(195,147,0,32,C.phi)+circuitLabel(137,163,'u_i',C.phi,20,40);
 h+='<rect x="270" y="74" width="56" height="20" fill="#faede7" stroke="'+C.r+'" stroke-width="2"/>'+circuitLabel(298,52,s.extra>0&&s.method==='resistance'?'R_a+R_p':'R_a',C.r,20,110);
 h+='<path d="M374 84c0 -18 12 -18 12 0c0 -18 12 -18 12 0c0 -18 12 -18 12 0c0 -18 12 -18 12 0" fill="none" stroke="'+C.i+'" stroke-width="2"/>'+circuitLabel(398,48,'L_a',C.i,20,60);
 h+=terminals(488,84,242)+voltageArrow(532,90,236,'u_a',C.u)+currentArrow(459,54,38,a.i);
 h+=circuitLabel(347,148,'u_i=k\\Phi\\omega='+f(a.ui),C.phi,21,260)+circuitLabel(347,194,'R_\\Sigma i_a='+f(a.r*a.i),C.r,20,240);
 h+='<path d="M32 238V190c18 0 18 -18 0 -18c18 0 18 -18 0 -18c18 0 18 -18 0 -18V88" fill="none" stroke="'+C.phi+'" stroke-width="2"/>'+voltageArrow(61,98,228,'u_b',C.phi)+circuitLabel(71,273,'\\Phi='+f(a.phi),C.phi,20,120);
 return h;
}
function axes(s,saved){const a=point(s),old=point(saved,s.w),isI=s.axis==='i',value=v=>isI?v.i:v.m;const xmax=s.fit?Math.max(1.5,Math.ceil(Math.max(value(a),value(old),s.load)*1.25*2)/2):2,xmin=s.fit?Math.min(-.5,Math.floor(Math.min(value(a),value(old)) *1.2*2)/2):-1.5,ymax=s.fit?Math.min(4,Math.max(1.2,Math.ceil(Math.max(s.w,a.u/a.phi,parameters(saved).u/parameters(saved).phi)*1.15*4)/4)):3.2;return {xmin,xmax,ymax};}
function pointerSpeed(rect,clientY,ymax){const scale=Math.min(rect.width/740,rect.height/530),offset=(rect.height-530*scale)/2;const y=(clientY-rect.top-offset)/scale;return clamp((440-y)/375*ymax,0,3.2);}
function characteristic(s,saved){const ax=axes(s,saved),{xmin,xmax,ymax}=ax,X=x=>80+(x-xmin)/(xmax-xmin)*600,Y=y=>440-y/ymax*375,a=point(s),old=point(saved,s.w),isI=s.axis==='i',val=p=>isI?p.i:p.m;let h='<defs><clipPath id="dd-main-clip"><rect x="80" y="65" width="600" height="375"/></clipPath></defs>';
 h+=`<rect x="80" y="65" width="${X(0)-80}" height="375" fill="#fcf3ef"/><rect x="${X(0)}" y="65" width="${680-X(0)}" height="375" fill="#f0f7f3"/>`;
 for(let j=0;j<=5;j++){const v=ymax*j/5;h+=line(80,Y(v),680,Y(v))+math(38,Y(v)+4,f(v),'#6e857b',18,70);}
 for(let j=0;j<=7;j++){const v=xmin+(xmax-xmin)*j/7;h+=line(X(v),65,X(v),440)+math(X(v),467,f(v),'#6e857b',18,85);}
 h+=line(X(0),65,X(0),440,'#9bb1a5',1.4)+arr(80,440,610,0,'#718780')+arr(80,440,0,-385,'#718780')+math(385,501,isI?'i_a/i_{aN}':'M/M_N',C.m,19,220)+math(80,29,'\\omega/\\omega_\\mathrm{ref}',C.m,18,155)+txt(X(xmin/2),50,'Brzdění','#a16c56')+txt(X(xmax/2),50,'Motor',C.u);
 h+='<g clip-path="url(#dd-main-clip)">';
 const curve=(state,c,w=2)=>path(Array.from({length:241},(_,j)=>{const speed=j*ymax/240;return [X(val(point(state,speed))),Y(speed)];}),c,w);
 if(s.family){const list=s.method==='field'?[1,.8,.6,.4]:s.method==='resistance'?[0,.2,.5,.8]:[.25,.5,.75,1];for(const n of list)h+=curve({...s,[s.method==='field'?'phi':s.method==='resistance'?'extra':'u']:n},'#c4d4cb',1.5);}
 const env=Array.from({length:201},(_,j)=>{const w=j*ymax/200,e=envelope(s,w);return [X(isI?e.i:e.m),Y(w)];});h+=path(env,C.env,2,'6 4');
 h+=curve(saved,C.saved,2)+curve(s,C.u,3);
 h+=path(Array.from({length:101},(_,j)=>{const w=j*ymax/100;return[X((s.load+.04*w)/(isI?a.phi:1)),Y(w)];}),C.load,2,'5 4');
 h+=line(80,Y(s.w),680,Y(s.w),'#b2c2ba',1,'3 5')+line(X(val(old)),Y(s.w),X(val(a)),Y(s.w),C.m,2)+dot(X(val(old)),Y(s.w),C.saved,6)+dot(X(val(a)),Y(s.w),a.m<0?C.r:C.u,7);
 const eq=equilibrium(s),qp=point(s,eq);if(qp.reserve>=-.0001)h+=`<circle cx="${X(val(qp))}" cy="${Y(eq)}" r="9" fill="none" stroke="${C.env}" stroke-width="2"/>`;
 h+='</g>';h+=math(550,Math.max(85,Math.min(415,Y(s.w)-18)),'\\omega='+f(s.w),C.u,18,170);h+=equationAnnotation(s,saved,X,Y,ymax,val);return h;
}
function overview(s){const X=w=>80+w/3.2*600,Y=v=>440-v/1.3*375,base=envelope(s,0).base;let h='';
 for(const [l,r,c]of [[0,base,'#eef6ef'],[base,s.wk,'#eef2fb'],[s.wk,3.2,'#fcf1e7']])h+=`<rect x="${X(l)}" y="65" width="${X(r)-X(l)}" height="375" fill="${c}"/>`;
 for(const v of [0,.25,.5,.75,1,1.25])h+=line(80,Y(v),680,Y(v))+math(40,Y(v)+3,f(v),'#718780',18,70);
 for(const w of [0,base,s.wk,3.2])h+=line(X(w),65,X(w),440,'#bdcec4',1,'3 4')+math(X(w),467,f(w),'#718780',18,85);
 for(const [key,c]of [['u',C.u],['m',C.m],['p',C.r],['i',C.i]]){h+=path(Array.from({length:201},(_,j)=>{const w=j*3.2/200;return[X(w),Y(envelope(s,w)[key])];}),c,3);const e=envelope(s,s.w);h+=dot(X(s.w),Y(e[key]),c,5);}
 h+=line(X(s.w),65,X(s.w),440,'#81988c',1.5,'3 4')+txt(X(base/2),49,'Plný tok',C.u,17)+txt(X((base+s.wk)/2),49,'Plný výkon',C.i,17)+txt(X((s.wk+3.2)/2),49,'Komutace',C.r,17)+math(385,501,'\\omega/\\omega_\\mathrm{ref}',C.m,20,240)+math(90,22,'u_a,\\ i_a,\\ M,\\ P',C.m,18,170)+arr(80,440,610,0,'#718780')+arr(80,440,0,-385,'#718780');return h;
}

function mount(app,entry,restored){let s={...initial,...restored},saved={...s},last=0,paint=0,raf,disposed=false;const tex=DCVisual.tex;
 const slider=(k,title,min,max,step)=>`<label id="dd-wrap-${k}"><span>${title}<output id="dd-${k}-out"></output></span><input id="dd-${k}" type="range" min="${min}" max="${max}" step="${step}"></label>`;
 app.classList.add('module-window-host');app.innerHTML=`<div class="workspace learning-workspace uniform-module-layout dc-workspace dc-drive"><div class="modulehead"><a class="back" href="#group-dc">← Stejnosměrné stroje</a><span class="num">${entry.num}</span><h1>Náhradní schéma a řízení otáček</h1><div class="actions"><button id="dd-reset">Výchozí stav</button><button id="dd-full">Celá obrazovka</button></div></div><section class="learning-panel dd-control-panel"><div class="dd-methods">${[['voltage','Řízení napětím'],['field','Odbuzování'],['resistance','Přídavný odpor']].map(([k,t])=>`<button data-dd-method="${k}">${t}</button>`).join('')}<button id="dd-details">Samokompenzace malých motorů →</button><button id="dd-theory-toggle" aria-expanded="false" aria-controls="dd-theory-panel">Schéma a rovnice</button></div><div class="dd-controls">${slider('u','Napětí kotvy',0,1,.01)}${slider('phi','Budicí tok',.3,1,.01)}${slider('extra','Přídavný odpor',0,.8,.01)}${slider('w','Otáčky rotoru',0,3.2,.01)}${slider('load','Zátěžný moment',0,1.5,.01)}</div><div class="dd-advanced-controls" aria-label="Parametry stroje a zobrazení">${slider("r","Odpor kotvy",0.02,0.4,0.01)}${slider("limit","Dovolený proud",0.5,1.5,0.05)}${slider("wk","Komutační mez otáček",1.2,2.8,0.1)}<label>Vodorovná osa <select id="dd-axis"><option value="m">Moment vodorovně</option><option value="i">Proud vodorovně</option></select></label><label>Setrvačnost <select id="dd-inertia"><option value=".5">Malá</option><option value="1">Střední</option><option value="3">Velká</option></select></label><label><input id="dd-family" type="checkbox" checked> Rodina charakteristik</label></div><div class="dd-toolbar"><button id="dd-run">Spustit pohyb</button><button id="dd-brake">Brzdit</button><button id="dd-save">Zapamatovat křivku</button><button id="dd-fit">Přizpůsobit graf</button><button id="dd-up">Zvýšit napětí</button><button id="dd-down">Snížit napětí</button><button id="dd-standard">Celý rozsah grafu</button><span id="dd-held"></span></div></section><div class="dd-layout"><section class="learning-panel dd-envelope"><h2>Oblasti řízení</h2><div class="dd-legend"><span style="--c:${C.u}">${tex('u_a')}</span><span style="--c:${C.i}">${tex('i_a')}</span><span style="--c:${C.m}">${tex('M')}</span><span style="--c:${C.r}">${tex('P')}</span></div><svg id="dd-envelope" data-plain-svg viewBox="0 0 740 530" role="img" aria-label="Napětí proud moment a výkon v oblastech řízení"></svg><p id="dd-region"></p></section><section class="learning-panel dd-chart-panel"><div class="dd-chart-heading"><h2>Pracovní bod</h2></div><div class="dd-legend"><span style="--c:${C.u}">Aktuální</span><span style="--c:${C.saved}">Zapamatovaná</span><span style="--c:${C.load}">Zátěž</span><span style="--c:${C.env}">Dovolené meze</span></div><svg id="dd-plot" data-plain-svg viewBox="0 0 740 530" role="img" aria-label="Otáčky svisle, moment nebo proud vodorovně"></svg></section></div><div class="dd-support"><section id="dd-theory-panel" class="learning-panel dd-theory" hidden><h2>Od schématu k otáčkám <button id="dd-theory-close">Zavřít ×</button></h2><div class="dd-theory-summary"><svg id="dd-compact-circuit" data-plain-svg viewBox="0 0 380 164" role="img" aria-label="Ustálený obvod kotvy"></svg><div id="dd-equation-values"></div><p id="dd-control-note"></p></div><svg id="dd-circuit" data-plain-svg viewBox="0 0 600 300" role="img" aria-label="Obvod kotvy s indukovaným napětím vlevo a cizím buzením"></svg><div class="dd-derive">${tex('u_a=R_\\Sigma i_a+L_a\\frac{\\mathrm di_a}{\\mathrm dt}+u_i')}<small>Ustálený proud · indukované napětí</small>${tex('u_a-R_\\Sigma i_a=k\\Phi\\omega')}<div class="dd-key-equation">${tex('\\omega=\\omega_0-\\frac{R_\\Sigma i_a}{k\\Phi},\\qquad\\omega_0=\\frac{u_a}{k\\Phi}')}</div>${tex('M=k\\Phi i_a\\quad\\Longrightarrow\\quad\\omega=\\omega_0-\\frac{R_\\Sigma M}{(k\\Phi)^2}')}</div><p class="dd-model-note">Obálka vyznačuje dovolené meze; model proud automaticky neomezuje. Pohyb podle ${tex("J\\dot\\omega=M-M_z-M_\\mathrm{ztr}")}.</p></section><section class="learning-panel dd-feedback"><p id="dd-status" class="dd-status" aria-live="polite"></p><div id="dd-readouts" class="dd-readouts"></div><p id="dd-warning" class="dd-warning"></p></section></div></div>`;
 const $=id=>app.querySelector('#dd-'+id);
 function render(){const a=point(s),old=point(saved,s.w),e=envelope(s,s.w);
 $('compact-circuit').innerHTML=compactCircuit(s);$('equation-values').innerHTML=tex('u_a='+f(a.u)+',\\quad u_i='+f(a.ui))+'<br>'+tex('i_a='+f(a.i)+',\\quad \\omega='+f(s.w));
 $('control-note').innerHTML=s.method==='brake'?(a.i<-.00001?'Brzdění napětím: '+tex('u_a<u_i\\Rightarrow i_a<0,\\ M<0')+'. Rekuperace vyžaduje zdroj schopný přijmout energii.':'Indukované napětí už není vyšší než svorkové; elektrické brzdění skončilo. Pro další brzdění znovu snižte napětí.') :s.method==='field'?'Měníme tok při stálém napětí. Menší tok zvýší otáčky naprázdno a sníží moment na ampér.':s.method==='resistance'?'Měníme přídavný odpor: roste odporový úbytek a charakteristika měkne.':'Měníme napětí při stálém toku: charakteristiky se rovnoběžně posouvají.';
 $('brake').disabled=s.w<.00001;$('brake').setAttribute('aria-pressed',String(s.method==='brake'));
for(const k of ['u','phi','extra','w','load','r','limit','wk']){$(k).value=s[k];$(k+'-out').innerHTML=tex(f(s[k]));}
 for(const k of ['u','phi','extra'])$('wrap-'+k).hidden=k!==(s.method==='field'?'phi':s.method==='resistance'?'extra':'u');
 $('w').disabled=s.running;$('inertia').value=s.inertia;$('axis').value=s.axis;$('family').checked=s.family;$('run').textContent=s.running?'Pozastavit pohyb':'Spustit pohyb';$('run').setAttribute('aria-pressed',String(s.running));$('held').textContent=s.running?'Otáčky se mění podle zátěže.':'Otáčky nastavte posuvníkem nebo kliknutím do grafu.';
 const label=s.method==='field'?'tok':s.method==='resistance'?'odpor':'napětí';$('up').textContent='Zvýšit '+label;$('down').textContent='Snížit '+label;
 app.querySelectorAll('[data-dd-method]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ddMethod===s.method)));
 $('circuit').innerHTML=circuit(s);$('plot').innerHTML=characteristic(s,saved);$('envelope').innerHTML=overview(s);
 $('region').textContent=['Plný tok · konstantní dovolený moment.','Odbuzování · konstantní výkon, moment klesá.','Komutační mez · proud i výkon klesají.'][e.region];
 $('status').textContent=Math.abs(a.reserve)<.015?'Rovnováha: moment motoru vyrovnává zátěž a ztráty.':a.m<0?'Stroj brzdí: indukované napětí převyšuje svorkové.':a.reserve>0?'Moment převyšuje zátěž → rotor po spuštění zrychluje.':'Moment nestačí na zátěž → rotor po spuštění zpomaluje.';
 $('readouts').innerHTML=[['Proud kotvy','i_a='+f(a.i)],['Moment motoru','M='+f(a.m)],['Rovnovážné otáčky','\\omega_\\mathrm{eq}='+f(equilibrium(s))],['Přeměněný výkon','P_\\mathrm{em}='+f(a.p)]].map(([t,v])=>`<div><span>${t}</span><strong>${tex(v)}</strong></div>`).join('');
 const ax=axes(s,saved),value=s.axis==='i'?a.i:a.m;$('warning').textContent=value<ax.xmin||value>ax.xmax||s.w>ax.ymax?'Bod je mimo graf. Zvolte Přizpůsobit graf.':Math.abs(a.i)>e.i+.01?'Překročen dovolený proud; skutečný měnič ho musí omezit.':'';
 }
 function stop(){s.running=false;}
 for(const k of ['u','phi','extra','w','load','r','limit','wk'])$(k).oninput=()=>{s[k]=+$(k).value;if(k==='w')stop();render();};
 $('inertia').onchange=()=>{s.inertia=+$('inertia').value;render();};$('axis').onchange=()=>{s.axis=$('axis').value;render();};$('family').onchange=()=>{s.family=$('family').checked;render();};
 app.querySelectorAll('[data-dd-method]').forEach(b=>b.onclick=()=>{saved={...s};s.method=b.dataset.ddMethod;render();});
 for(const [id,delta]of [['up',.1],['down',-.1]])$(id).onclick=()=>{saved={...s};const k=s.method==='field'?'phi':s.method==='resistance'?'extra':'u';s[k]=clamp(s[k]+delta,k==='phi'?.3:0,k==='extra'?.8:1);render();};
 $('brake').onclick=()=>{saved={...s};s=applyBrake(s);render();};
 $('save').onclick=()=>{saved={...s};render();};$('run').onclick=()=>{s.running=!s.running;last=0;render();};$('fit').onclick=()=>{s.fit=true;render();};$('standard').onclick=()=>{s.fit=false;render();};$('reset').onclick=()=>{s={...initial};saved={...s};last=0;render();};$('full').onclick=()=>{document.body.classList.toggle('fullscreen');window.dispatchEvent(new Event('resize'));};
 $('plot').onpointerdown=ev=>{const rect=$('plot').getBoundingClientRect();s.w=pointerSpeed(rect,ev.clientY,axes(s,saved).ymax);stop();render();};
 function theory(open){$('theory-panel').hidden=!open;$('theory-toggle').setAttribute('aria-expanded',String(open));}
 $('theory-toggle').onclick=()=>theory($('theory-panel').hidden);
 $('theory-close').onclick=()=>{theory(false);$('theory-toggle').focus?.();};
 app.onkeydown=ev=>{if(ev.key==='Escape'&&!$('theory-panel').hidden){theory(false);$('theory-toggle').focus?.();}};
 $('details').onclick=()=>{const state={...s,running:false};Lab.dispose();DCOperating.mount(app,{...entry,driveDetails:true,driveReturn:state},'schema');};
 function tick(now){if(disposed)return;if(s.running&&!document.hidden){if(last)advance(s,(now-last)/1000);if(now-paint>65){render();paint=now;}}last=now;raf=requestAnimationFrame(tick);}
 render();raf=requestAnimationFrame(tick);window.dcDriveState=()=>({...s,saved:{...saved},point:point(s)});Lab.dispose=()=>{disposed=true;app.onkeydown=null;cancelAnimationFrame(raf);delete window.dcDriveState;document.body.classList.remove('fullscreen');};
}
window.DCDrive={applyBrake,controlEquation,compactCircuit,pointerSpeed,initial,parameters,point,equilibrium,advance,envelope,axes,circuit,characteristic,overview,mount};
})();
