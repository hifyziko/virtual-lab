(()=>{'use strict';
const resistanceControl=rotorResistanceControl(document.getElementById('resistance'));
const $=id=>document.getElementById(id),svg=$('machine');let field=0,rotor=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,startup=null;
const fmt=x=>x.toLocaleString('cs-CZ',{maximumFractionDigits:1});
function state(){const f=+$('frequency').value,ratio=startup?startup.ratio:+$('speed').value/100,s=1-ratio,ns=60*f;return{starting:!!startup,omega1:2*Math.PI*f,omegar:2*Math.PI*f*ratio,omega2:2*Math.PI*f*s,f,ratio,s:f===0?null:s,ns,n:ns*ratio,f2:Math.abs(s)*f,...AMPrincipStartup.response(ratio,f,resistanceControl.read())}}
window.amPrincipState=state;
const point=(r,a)=>[320+r*Math.cos(a),260-r*Math.sin(a)];
function line(x,y,u,v,color,width=2){const length=Math.hypot(u,v);if(length<1)return '';const h=Math.min(10,length*.45),nx=u/length,ny=v/length,ex=x+u,ey=y+v,w=Math.min(width/2,length*.12),b=Math.max(w,h*.45);return `<path d="M${x-ny*w} ${y+nx*w}L${ex-h*nx-ny*w} ${ey-h*ny+nx*w}L${ex-h*nx-ny*b} ${ey-h*ny+nx*b}L${ex} ${ey}L${ex-h*nx+ny*b} ${ey-h*ny-nx*b}L${ex-h*nx+ny*w} ${ey-h*ny-nx*w}L${x+ny*w} ${y-nx*w}Z" fill="${color}"/>`}
function fieldVectors(a,angle){
 const mode=$('vectorMode').value;
 if(mode==='none')return '';
 const offset=-a.phase-Math.PI/2,rx=a.current*Math.cos(offset),ry=a.current*Math.sin(offset);
 let h='';
 for(const [id,color] of [['s','#007e6c'],['r','#8661b1']]){
  const flux=mode==='flux',weight=id==='s'?1-AMPrincipStartup.leakage:1;
  const x=flux?1+weight*rx:id==='s'?1:rx,y=flux?weight*ry:id==='s'?0:ry;
  const amp=Math.hypot(x,y),t=angle+Math.atan2(y,x);
  if(amp<1e-6)continue;
  const length=145*(flux?amp:Math.sqrt(amp)),cx=Math.cos(t),cy=-Math.sin(t);
  const labelDistance=length+(flux&&id==='s'?40:15);
  const symbol=flux?'\\Psi':'F';
  h+=line(320,260,length*cx,length*cy,color,flux&&id==='s'?9:4)
    +'<foreignObject x="'+(293+labelDistance*cx)+'" y="'+(244+labelDistance*cy)+'" width="54" height="32"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;color:'+color+'">'+katex.renderToString('\\mathbf{'+symbol+'}_{'+id+'}')+'</div></foreignObject>';
 }
 return h;
}
function drawScene(relative){const a=state(),fv=field-(relative?rotor:0),rv=relative?0:rotor;let h=window.InductionMachineArt.svg(rv,relative?-rotor:0);
for(let k=0;k<20;k++){const t=rv+k*Math.PI/10,[x,y]=point(129,t),i=a.current*Math.cos(t-fv+a.phase),force=i*Math.cos(t-fv);h+=`<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="#b9781c" stroke-width="2"/>`;if($('currents').checked&&Math.abs(i)>.002){const r=2+4*Math.sqrt(Math.abs(i));h+=i>0?`<circle cx="${x}" cy="${y}" r="${r*.65}" fill="#2367c4"/>`:`<path d="M${x-r},${y-r} l${2*r},${2*r} m${-2*r},0 l${2*r},${-2*r}" stroke="#2367c4" stroke-width="2"/>`;}if(k===0&&$("trackBar").checked){h+=`<circle class="tracked-bar" cx="${x}" cy="${y}" r="17" fill="none" stroke="#d34c19" stroke-width="3"/><foreignObject x="180" y="475" width="280" height="34"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;background:white;font-size:17px">${katex.renderToString(String.raw`i_{\mathrm{tyč}}/I_{\mathrm{ref}}=`+num(i),{throwOnError:false})}</div></foreignObject>`;}if($('forces').checked)h+=line(x,y,-85*force*Math.sin(t),-85*force*Math.cos(t),'#ad365d',2.5)}
const [rx,ry]=point(100,rv);h+=line(320,260,rx-320,ry-260,'#b9781c',4);h+='<circle cx="320" cy="260" r="25" fill="#d6dedb" stroke="#8caaa3"/><circle cx="320" cy="260" r="8" fill="#fff"/>';
const [fx,fy]=point(229,fv);h+=`<circle cx="${fx}" cy="${fy}" r="15" fill="#007e6c"/><text x="${fx}" y="${fy+5}" text-anchor="middle" style="fill:white;font-size:13px">S</text>`;const [sx,sy]=point(229,fv+Math.PI);h+=`<circle cx="${sx}" cy="${sy}" r="15" fill="#007e6c"/><text x="${sx}" y="${sy+5}" text-anchor="middle" style="fill:white;font-size:13px">J</text>`;
h+=`<text x="320" y="-12" text-anchor="middle" font-size="14">${relative?(a.omega2===0?'Pole vůči rotoru stojí':a.s>0?'Pole vůči rotoru ↺':'Pole vůči rotoru ↻'):(a.f===0?'Stojaté pole vůči statoru':'Pole vůči statoru ↺')}</text>`+'<text x="320" y="518" text-anchor="middle" font-size="14">Stator · vzduchová mezera · rotorová klec</text>';if(relative)h+='<circle cx="449" cy="260" r="14" fill="none" stroke="#b9781c" stroke-width="2" stroke-dasharray="3 3"/>';h+=fieldVectors(a,fv);return h}
function draw(){
 const a=state(),source=$('numericalSource').value;
 for(const [relative,el] of [[false,svg],[true,$('relativeMachine')]]){
  el.innerHTML=window.AMRealisticScene(drawScene(relative),a,field,rotor,relative,source);
 }
}
window.amPrincipView=()=>({mode:'numerical',source:$('numericalSource').value});
const support=document.querySelector('.layout>aside');support.hidden=false;$('supportContent').append(support);
// Embedded lessons use the flexible host canvas; standalone pages fit remaining height.
const helpSummary=document.querySelector('.support > summary');
window.fitAMPrincip=function(availableHeight){
  if(document.querySelector('main.uniform-module-layout'))return;
  if(!matchMedia('(min-width:851px)').matches)return;
  const support=helpSummary.parentElement;
  const bounds=window.moduleWindowFlowRect?moduleWindowFlowRect(support):support.getBoundingClientRect();
  const reservedHeight=bounds.bottom+scrollY-svg.getBoundingClientRect().height;
  const height=Math.floor(availableHeight-reservedHeight-12)+'px';
  const style=document.documentElement.style;
  if(style.getPropertyValue('--fitted-machine-height')!==height)style.setProperty('--fitted-machine-height',height);
};
if(!frameElement){
  const fit=()=>window.fitAMPrincip(innerHeight);
  new ResizeObserver(fit).observe(document.querySelector('main'));
  addEventListener('resize',fit);
  document.fonts.ready.then(fit);
}
function math(el,tex){if(el.dataset.lastTex!==tex||!el.querySelector(".katex")){katex.render(tex,el,{throwOnError:false});el.dataset.lastTex=tex}}
const num=x=>fmt(x).replace(/\s/g,'').replace(',', '{,}');
function inlineMath(root){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode()){const n=walker.currentNode;if(!n.parentElement.closest('.katex,script,style,[data-tex],svg'))nodes.push(n)}const re=/(?:Ωₛ − Ωᵣ|ωᵣ \+ ω₂ = ω₁|Ωₛ = 2πf₁\/p|f₂ = p\|Ωₛ − Ωᵣ\|\/\(2π\)|nₛ = 0|p = 1|200×|0\/0|\d+(?:[,.]\d+)? Hz|ω₁|ω₂|ωᵣ|Ωₛ|Ωᵣ|f₁|f₂|nₛ|⊙|⊗)/g;const map={'ω₁':'\\omega_1','ω₂':'\\omega_2','ωᵣ':'\\omega_r','Ωₛ':'\\Omega_s','Ωᵣ':'\\Omega_r','f₁':'f_1','f₂':'f_2','nₛ':'n_s','⊙':'\\odot','⊗':'\\otimes','nₛ = 0':'n_s=0','p = 1':'p=1','200×':'200\\times','0/0':'0/0','Ωₛ − Ωᵣ':'\\Omega_s-\\Omega_r','ωᵣ + ω₂ = ω₁':'\\omega_r+\\omega_2=\\omega_1','Ωₛ = 2πf₁/p':'\\Omega_s=2\\pi f_1/p','f₂ = p|Ωₛ − Ωᵣ|/(2π)':'f_2=p|\\Omega_s-\\Omega_r|/(2\\pi)'};
for(const n of nodes){const text=n.textContent;let last=0,match,frag=document.createDocumentFragment();re.lastIndex=0;while((match=re.exec(text))){frag.append(text.slice(last,match.index));const span=document.createElement('span');katex.render(map[match[0]]||match[0].replace(' Hz','\\,\\mathrm{Hz}'),span,{throwOnError:false});frag.append(span);last=re.lastIndex}if(last){frag.append(text.slice(last));n.replaceWith(frag)}}}

function angularArrows(a){for(const [id,symbol,color,r]of [['omega1','\\omega_1','#007e6c',42],['omegar','\\omega_r','#a76914',31],['omega2','\\omega_2','#2567bf',20]]){const value=a[id],span=Math.abs(value)/(2*Math.PI*60)*Math.PI*1.5,start=-Math.PI/4,end=start+span,pt=t=>[50+r*Math.cos(t),50-r*Math.sin(t)];let h='';if(Math.abs(value)<1e-9){h='<circle cx="50" cy="50" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-dasharray="3 4" opacity=".3"/>'}else{const [x,y]=pt(start),[ex,ey]=pt(end),tx=-Math.sin(end),ty=-Math.cos(end);h='<path d="M '+x+' '+y+' A '+r+' '+r+' 0 '+(span>Math.PI?1:0)+' 0 '+ex+' '+ey+'" fill="none" stroke="'+color+'" stroke-width="3"/>';h+='<path d="M '+(ex+2*tx)+' '+(ey+2*ty)+' L '+(ex-6*tx+4*ty)+' '+(ey-6*ty-4*tx)+' L '+(ex-6*tx-4*ty)+' '+(ey-6*ty+4*tx)+' Z" fill="'+color+'"/>'}document.querySelectorAll('[data-omega-arc="'+id+'"]').forEach(el=>el.innerHTML=h);document.querySelectorAll('[data-omega-value="'+id+'"]').forEach(el=>math(el,symbol+'='+num(value)+String.raw`\,\mathrm{rad/s}`))}}
function liveMath(a){angularArrows(a);for(const id of ['omega1','omegar','omega2'])math($(id),num(a[id])+String.raw`\,\mathrm{rad/s}`);math($('omegaSum'),num(a.omega1)+'='+num(a.omegar)+'+('+num(a.omega2)+')'+String.raw`\,\mathrm{rad/s}`);for(const [id,value]of Object.entries({ns:a.ns,n:a.n,difference:a.ns-a.n}))math($(id),num(value)+String.raw`\,\mathrm{min}^{-1}`);math($('f2'),num(a.f2)+String.raw`\,\mathrm{Hz}`);if(a.f)math($('slip'),num(a.s*100)+String.raw`\,\%`);math($('frequencyOut'),num(a.f)+String.raw`\,\mathrm{Hz}`);math($('speedOut'),num(a.n)+String.raw`\,\mathrm{min}^{-1}`+(a.f?String.raw`\quad (`+num(a.ratio*100)+String.raw`\,\%\,n_s)`:''));for(const id of ['relativeText','rotorFrequency','status','slip'])inlineMath($(id))}

function update(){const a=state(),flux=$('vectorMode').value==='flux',vectors=$('vectorMode').value!=='none';
for(const el of document.querySelectorAll('[data-rotor-field-legend]'))el.style.visibility=vectors?'visible':'hidden';
for(const [selector,id] of [['[data-stator-field-legend]','s'],['[data-rotor-label]','r']])for(const el of document.querySelectorAll(selector))math(el,vectors?'\\mathbf{'+(flux?'\\Psi':'F')+'}_{'+id+'}':'\\text{'+(id==='s'?'Značka pole':'Rotor')+'}');
math($('rOut'),'r='+resistanceControl.formatted().replace(',', '{,}'));
const decimal=x=>x.toFixed(2).replace('.', '{,}');
const angleReadout=!flux?'':a.fluxAngle===null?String.raw`\quad \delta_{\Psi}\;\text{neurčen}`:String.raw`\quad \delta_{\Psi}=`+decimal(a.fluxAngle*180/Math.PI)+String.raw`^{\circ}`;
math($('operatingValues'),'\\hat I_2/I_{\\mathrm{ref}}='+decimal(Math.abs(a.current))+'\\quad \\varphi_2='+num(a.phase*180/Math.PI)+'^{\\circ}\\quad M/M_b='+decimal(a.moment)+angleReadout);
for(const id of ['omega1','omegar','omega2'])$(id).textContent=fmt(a[id])+' rad/s';$('omegaSum').textContent=': '+fmt(a.omega1)+' = '+fmt(a.omegar)+' + ('+fmt(a.omega2)+') rad/s';$('relativeText').textContent=a.s===0?'Pole i rotor jsou zde nehybné. Žádná změna toku → žádný indukovaný proud.':a.s>0?'Pole obíhá rotor dopředu rychlostí ω₂. Čím menší rozdíl otáček, tím pomaleji se mění rotorový proud.':'Pole obíhá vůči rotoru opačně: ω₂ < 0. Rotor je rychlejší než pole a moment ho brzdí.';$('rotorFrequency').textContent='f₂ = '+fmt(a.f2)+' Hz · '+(a.s===0?'proud v kleci zaniká.':'v jedné rotorové tyči proběhne '+fmt(a.f2)+' celých period proudu za skutečnou sekundu.');$('speedOut').textContent=fmt(a.n)+' min⁻¹ · '+fmt(a.ratio*100)+' % nₛ';$('frequencyOut').textContent=a.f+' Hz';for(const [id,value] of Object.entries({ns:fmt(a.ns)+' min⁻¹',n:fmt(a.n)+' min⁻¹',difference:fmt(a.ns-a.n)+' min⁻¹',slip:fmt(a.s*100)+' %',f2:fmt(a.f2)+' Hz',moment:Math.abs(a.moment)<1e-9?'nulový':a.s>0?'↺ pohání rotor':'↻ brzdí rotor'}))$(id).textContent=value;$('status').textContent=a.s===0?'Synchronní otáčky: pole a rotor se pohybují společně. Proud ani elektromagnetický moment nevznikají.':a.s<0?'Generátor: rotor předbíhá pole. Moment rotor brzdí; k udržení otáček je nutný vnější pohon.':a.ratio===0?'Stojící rotor: pole protíná klec, f₂ = f₁. Moment působí ve směru otáčení pole.':'Motor: pole předbíhá rotor. Proud v kleci vytváří moment ve směru otáčení pole.';$('speed').disabled=a.f===0;if(!a.moment&&a.s>0)$('status').textContent='Při nulovém odporu je střední moment nulový.';if(a.starting)$('status').textContent='Rotor se pohybuje podle rozdílu elektromagnetického a zatěžovacího momentu.';if(a.f===0){$('speedOut').textContent='0 min⁻¹';$('slip').textContent='nedefinován (nₛ = 0)';$('moment').textContent='nulový';$('relativeText').textContent='Pole i rotor stojí. Ustálené pole nemění tok rotorových obvodů.';$('rotorFrequency').textContent='f₂ = 0 Hz · žádný indukovaný rotorový proud.';$('status').textContent='Nulová frekvence: stojaté pole při stejnosměrném buzení. Rotor v tomto modelu také stojí, proud v kleci a moment jsou nulové. Skluz 0/0 není definován.';}$('play').textContent=playing?'Pozastavit':'Spustit';liveMath(a);$('slipControl').value=100*(1-a.ratio);$('slipControl').disabled=a.f===0;math($('slipControlOut'),a.f?'s='+num(100*a.s)+String.raw`\,\%`:String.raw`s\;\text{nedefinován}`);draw()}
$('numericalSource').oninput=draw;
$('speedMode').onchange=()=>{const slip=$('speedMode').value==='slip';$('speed').hidden=slip;$('speedOut').hidden=slip;$('slipControl').hidden=!slip;$('slipControlOut').hidden=!slip;};
$('slipControl').oninput=()=>{startup=null;$('speed').value=100-Number($('slipControl').value);update()};
for(const id of ['speed','frequency','vectorMode','resistance','currents','forces','trackBar'])$(id).addEventListener('input',update);$('releaseRotor').onclick=()=>{
 if(+$('frequency').value===0)$('frequency').value=50;
 startup={ratio:0};field=rotor=0;playing=true;$('speed').value=0;
 update();
};$('play').onclick=()=>{playing=!playing;update()};$('speed').addEventListener('input',()=>{startup=null;update()});$('frequency').addEventListener('input',()=>{if(+$('frequency').value===0){startup=null;$('speed').value=0;}update()});$('reset').onclick=()=>{startup=null;$('speed').value=80;$('frequency').value=50;$('vectorMode').value='mmf';$('numericalSource').value='none';resistanceControl.set(.5);$('speedMode').value='slip';$('speedMode').onchange();$('currents').checked=$('forces').checked=true;$('trackBar').checked=false;field=rotor=0;update()};document.querySelectorAll('[data-tex]').forEach(e=>katex.render(e.dataset.tex,e,{throwOnError:false}));inlineMath(document.querySelector('main'));let lastScene=0;function tick(t){const dt=Math.min((t-last)/1000,.05);last=t;if(playing){const wasStarting=!!startup;if(startup){startup.ratio=window.AMPrincipStartup.step(startup.ratio,+$('frequency').value,dt,resistanceControl.read());$('speed').value=100*startup.ratio;}const a=state(),w=2*Math.PI*a.f/200;field=(field+w*dt)%(2*Math.PI);rotor=(rotor+w*a.ratio*dt)%(2*Math.PI);if(t-lastScene>45){if(wasStarting)update();else draw();lastScene=t;}}requestAnimationFrame(tick)}$('speedMode').onchange();update();requestAnimationFrame(tick);
})();
