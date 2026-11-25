/* Same slotted machine, brush current and pole-field shape as the Principle lesson.
   Adding coils compares a fixed current per coil; it is not a fixed-copper redesign. */
(()=>{'use strict';
const T=2*Math.PI,C={ink:'#233f49',muted:'#657b79',sum:'#007e6c',selected:'#ad365d'},palette=['#ad365d','#346fc0','#ad741b','#7355b5','#338e96','#bb5c3c','#637f30','#9b66a0'];
const num=(n,d=2)=>n.toFixed(d).replace('.','{,}');
const wrap=x=>(x%1+1)%1;
const scaleTop=x=>{const top=Math.max(.1,x)*1.03,p=10**Math.floor(Math.log10(top));return [1,1.2,1.6,2,2.4,3.2,4,6,8,10].find(v=>v*p>=top)*p;};
function poleField(angle){return DCMachineArt.mainFieldShape(angle);}
function model(s){
 const slots=DCArmatureWinding.slots,n=Math.max(1,Math.min(slots,Math.round(s.count))),selected=Math.max(0,Math.min(n-1,Math.round(s.selected)-1)),pitch=T*DCArmatureWinding.pitch/slots;
 // Coil starts occupy real slots. The two sides are in different winding layers;
 // one coil always carries equal, opposite axial currents on its two sides.
 const coils=DCArmatureWinding.coils.slice(0,n).map(c=>({...c,color:palette[c.k%palette.length]}));
 function at(position){
  const theta=-T*position;
  const parts=coils.map(coil=>{const a=theta+coil.phase,b=a+pitch,i=s.current*DCMachineArt.coilCurrent(a),f1=-.5*s.flux*i*poleField(a),f2=.5*s.flux*i*poleField(b);return {...coil,a,b,i,f1,f2,m:f1+f2};});
  return {parts,total:parts.reduce((sum,c)=>sum+c.m,0)};
 }
 const samples=Array.from({length:721},(_,k)=>{const v=at(k/720);return {angle:k/2,...v};});
 const values=samples.slice(0,-1).map(v=>v.total),mean=values.reduce((a,b)=>a+b,0)/values.length,min=Math.min(...values),max=Math.max(...values),ripple=Math.abs(mean)>1e-8?(max-min)/Math.abs(mean):null;
 return {coils,n,selected,pitch,at,samples,mean,min,max,ripple,now:at(s.position)};
}
function plots(s,m){
 const V=DCVisual,theta=s.position*360,amp=scaleTop(Math.max(.1,Math.abs(s.current*s.flux))),sign=s.current*s.flux;
 const individual=m.coils.filter(c=>c.k!==m.selected).map(c=>({points:m.samples.map(p=>[p.angle,p.parts[c.k].m]),color:m.n<=8?c.color:'#9aafa3',width:1.3,opacity:m.n<=8?.65:.28}));
 const chosen=m.coils[m.selected],selected={points:m.samples.map(p=>[p.angle,p.parts[m.selected].m]),color:chosen.color,width:3};
 const one=V.plot({curves:[...individual,selected],x:[0,360],y:sign<0?[-amp,amp*.04]:[-amp*.04,amp],yTicks:Array.from({length:5},(_,k)=>(sign<0?-1:1)*amp*k/4),roomy:true,xt:'\\theta/{}^{\\circ}',yt:'M_k/\\mathrm{p.u.}',cursor:theta,point:[theta,m.now.parts[m.selected].m],pointColor:chosen.color});
 const limit=scaleTop(Math.max(.1,Math.abs(m.min),Math.abs(m.max)));
 const total=V.plot({curves:[{points:m.samples.map(p=>[p.angle,p.total]),color:C.sum,width:3},{fn:()=>m.mean,color:'#a47c36',dash:true,width:1.4}],x:[0,360],y:sign<0?[-limit,limit*.04]:[-limit*.04,limit],yTicks:Array.from({length:5},(_,k)=>(sign<0?-1:1)*limit*k/4),roomy:true,xt:'\\theta/{}^{\\circ}',yt:'M_\\Sigma/\\mathrm{p.u.}',cursor:theta,point:[theta,m.now.total],pointColor:C.sum});
 const swatch=(color,label)=>`<span><i style="background:${color}"></i>${label}</span>`;
 return [{svg:one,legend:swatch(chosen.color,V.tex('M_{'+(m.selected+1)+'}'))+swatch('#9aafa3','ostatní zobrazené cívky')},{svg:total,legend:swatch(C.sum,V.tex('M_\\Sigma=\\sum_{k=1}^{N_c}M_k'))+swatch('#a47c36','střední moment')}];
}
function fieldGrid(s,m){const b=DCCoilFieldBasis,size=b.N*b.N,weights=new Float64Array(b.steps*2),out=Float32Array.from(DCFieldBasis.fields[0],v=>v*s.flux);for(const coil of m.now.parts){const u=wrap(coil.a/T)*2*b.steps,i=Math.floor(u),t=u-i;weights[i]+=coil.i*(1-t);weights[(i+1)%weights.length]+=coil.i*t;}for(let n=0;n<weights.length;n++){if(Math.abs(weights[n])<1e-12)continue;const f=b.fields[n%b.steps],flip=n>=b.steps,w=weights[n];for(let k=0;k<size;k++)out[k]+=w*f[flip?size-1-k:k];}return out;}
const coilFieldCache=new Map();
function fieldScene(s,m){const key=[s.count,s.position,s.current,s.flux].join(':');if(coilFieldCache.has(key))return coilFieldCache.get(key);const b=DCCoilFieldBasis,grid=fieldGrid(s,m),peak=grid.reduce((a,v)=>Math.max(a,Math.abs(v)),0);if(peak<1e-8)return '';const levels=peak<.35?Array.from({length:16},(_,k)=>peak*(-.95+1.9*(k+.5)/16)):null,lines=MagneticContours(grid,b.N,b.R,C.sum,[],levels),svg=lines.paths+lines.arrows;if(coilFieldCache.size>16)coilFieldCache.delete(coilFieldCache.keys().next().value);coilFieldCache.set(key,svg);return svg;}
function scene(s,m){
 const V=DCVisual,chosen=m.now.parts[m.selected],conductors=m.now.parts.flatMap(c=>[{angle:c.a,radius:120,current:c.i,color:c.color,selected:c.k===m.selected},{angle:c.b,radius:110,current:-c.i,color:c.color,selected:c.k===m.selected}]);
 let machine=DCMachineArt.machine({theta:-s.position*T,current:s.current,flux:s.flux},s.field?fieldScene(s,m):'',{geometry:{...DCGeometry,slots:DCArmatureWinding.slots},enlargedSlots:true,showCurrents:true,conductors,compensation:true,compensationCurrent:0,interpoles:true,interpoleExcitation:0});
 for(const c of m.now.parts){
  const selected=c.k===m.selected;
  if(selected||m.n<=8){const x=120*Math.cos(c.a),y=-120*Math.sin(c.a),xx=110*Math.cos(c.b),yy=-110*Math.sin(c.b);machine+=`<path data-coil="${c.k+1}" d="M${x} ${y}L${xx} ${yy}" fill="none" stroke="${c.color}" stroke-width="${selected?2.2:1.1}" stroke-dasharray="5 4" opacity="${selected?1:.4}"/>`;}
  if(s.forces&&(selected||m.n<=4))for(const [a,r,f]of [[c.a,120,c.f1],[c.b,110,c.f2]]){const len=42*Math.abs(f)/Math.max(.15,.5*Math.abs(s.current*s.flux));if(len<.5)continue;const dir=Math.sign(f),dx=dir*Math.sin(a),dy=dir*Math.cos(a),x=r*Math.cos(a)+9*dx,y=-r*Math.sin(a)+9*dy;machine+=V.arrow(x,y,len*dx,len*dy,'#fffaf5',6)+V.arrow(x,y,len*dx,len*dy,c.color,selected?3.2:2);}
 }
 machine+='<circle r="146" fill="transparent" class="dc-rotor-hit"><title>Táhněte rotorem pro změnu natočení</title></circle>';
 let out=`<g transform="translate(278 280) scale(1.12)">${machine}</g>`;
 out+='<rect x="626" y="35" width="250" height="225" rx="12" fill="#f7faf7" stroke="#dce6df"/><text x="751" y="65" text-anchor="middle" font-size="17" fill="#233f49">Komutátor sledované cívky</text>';
 out+=`<g transform="translate(751 157) scale(.84)">${DCMachineArt.commutator(-s.position*T,s.current,48,true,{coilIndex:chosen.k})}</g>`;
 out+='<text x="751" y="243" text-anchor="middle" font-size="13" fill="#657b79">48 lamel · zvýrazněné konce cívky</text>';

 out+='<rect x="626" y="280" width="250" height="226" rx="12" fill="#f7faf7" stroke="#dce6df"/><text x="751" y="309" text-anchor="middle" font-size="17" fill="#233f49">Zapojení sledované cívky</text>';
 out+=`<path d="M693 427V350Q751 326 809 350V427" fill="none" stroke="${chosen.color}" stroke-width="4"/><path d="M809 418H855V350" fill="none" stroke="#8da39d" stroke-width="2" stroke-dasharray="4 3"/><rect x="678" y="427" width="30" height="27" rx="2" fill="#dfa24a" stroke="#9c702f"/><rect x="794" y="427" width="30" height="27" rx="2" fill="#dfa24a" stroke="#9c702f"/><text x="751" y="373" text-anchor="middle" font-size="13" fill="#233f49">Drážky ${chosen.slot+1} → ${chosen.returnSlot+1}</text><text x="751" y="390" text-anchor="middle" font-size="12" fill="#657b79">horní vrstva</text><text x="751" y="405" text-anchor="middle" font-size="12" fill="#657b79">↓ dolní vrstva</text><text x="751" y="421" text-anchor="middle" font-size="12" fill="#657b79">krok 12 drážek</text><text x="693" y="473" text-anchor="middle" font-size="13" fill="#233f49">L${chosen.fromLamella+1}</text><text x="809" y="473" text-anchor="middle" font-size="13" fill="#233f49">L${chosen.toLamella+1}</text><text x="751" y="494" text-anchor="middle" font-size="12" fill="#657b79">Čárkovaně navazující cívka</text>`;
 out+=V.math(278,587,'F_t\\propto B_r i_c,\\qquad M_k=r(F_{t,k,1}+F_{t,k,2})',C.ink,19,540);
 return out;
}
function mount(app,entry){
 const defaults={position:.1,count:1,selected:1,current:.75,flux:1,forces:true,field:true,playing:false},s={...defaults};let raf=0,last=0,paint=0,dirty=true,disposed=false,cached=null,cachedKey='';
 const V=DCVisual;
 const armTotal=`<span class="dc-panel-equation">${V.tex('M_\\Sigma=\\sum_{k=1}^{N_c}M_k')}</span><span id="arm-ripple" class="dc-panel-equation"></span>`;
 app.classList.add('module-window-host');
 app.innerHTML=`<div class="workspace learning-workspace uniform-module-layout dc-workspace dc-armature-workspace"><div class="modulehead"><a class="back" href="#group-dc">← Stejnosměrné stroje</a><span class="num">${entry.num}</span><h1>${entry.title}</h1><div class="actions"><button id="arm-play" aria-pressed="false">▶ Spustit pomalu</button><button id="arm-reset">Výchozí stav</button><button id="arm-full">Celá obrazovka</button></div></div><div class="dc-controls arm-controls">${[['position','Natočení rotoru',0,1,.001],['count','Počet zobrazených cívek',1,48,1],['selected','Sledovaná cívka',1,1,1],['current','Proud větve',-1.4,1.4,.05],['flux','Buzení',-1.5,1.5,.05]].map(([key,label,min,max,step])=>`<label>${label}<output id="arm-${key}-value"></output><input id="arm-${key}" aria-label="${label}" type="range" min="${min}" max="${max}" step="${step}" value="${s[key]}"></label>`).join('')}<div class="arm-options"><label><input id="arm-forces" type="checkbox" checked>Síly</label><label><input id="arm-field" type="checkbox" checked>Siločáry</label></div></div><div class="dc-visual-grid"><section class="learning-panel dc-scene-panel"><h2>Síly ve vodičích a moment cívky</h2><svg id="arm-scene" data-plain-svg viewBox="0 0 900 615" role="img" aria-label="Drážkovaná kotva se zobrazenými cívkami, silami a komutátorem"></svg></section><div class="dc-charts">${['Momenty jednotlivých cívek','Součet momentů a jeho zvlnění'].map((title,k)=>`<section class="learning-panel dc-chart-panel"><div class="dc-panel-heading"><h2>${title}</h2>${k===1?armTotal:""}</div><svg id="arm-chart-${k}" data-plain-svg viewBox="0 0 540 234" role="img" aria-label="${title}"></svg><div id="arm-legend-${k}" class="dc-chart-legend"></div></section>`).join('')}</div></div><div id="arm-insight"></div><div class="arm-foot"><span>Idealizované momenty · numerické pole buzení a zobrazených cívek · pomalé otáčení</span><button id="arm-explain">Vztahy a předpoklady</button></div><dialog class="arm-explanation"><button id="arm-close">Zavřít ×</button><h2>Od sil vodičů k momentu kotvy</h2><p>Tažením rotoru nastavíte jeho polohu.</p><p>Dvěma stranami jedné cívky protéká stejný proud opačným směrem. Jejich tečné síly vytvářejí moment na hřídeli; u více cívek se sčítají momenty.</p><div>${V.tex('F_{t,k,j}=B_{r,k,j}\\,i_{c,k,j}\\,l,\\qquad M_k=r\\sum_{j=1}^{2}F_{t,k,j}')}</div><div>${V.tex('M_\\Sigma(\\theta)=\\sum_{k=1}^{N_c}M_k(\\theta),\\qquad \\varepsilon_M=\\frac{M_{\\max}-M_{\\min}}{|M_{\\mathrm{str}}|}\\,100\\,\\%')}</div><p>Moment, síly a proudové značky používají stejnou polohu a proud cívky. Síly a momenty používají idealizovanou indukci s plochým průběhem pod pólem a hladkými přechody v mezipólové oblasti. Numerické nerovnosti pole se do grafů nepřenášejí. Komutační přechod zůstává stejný jako v Principu. Každá přidaná cívka má stejný proud a počet závitů: roste také střední moment. Nejde o srovnání při stejné spotřebě mědi či stejném celkovém příkonu.</p><p>Pevné dvouvrstvé smyčkové vinutí: 48 drážek, 48 cívek, 48 lamel, čtyři póly a čtyři paralelní větve. Krok každé cívky je 12 drážek (jedna pólová rozteč). Její konce vedou na sousední lamely; na společné lamele navazuje další cívka. Posuvník pouze odkrývá příspěvky tohoto uzavřeného vinutí, nikoli napájení neúplné otevřené kotvy.</p><p>Siločáry ukazují součet buzení a polí všech zobrazených cívek. Každá cívka přispívá podle polohy obou vodičů a jejich opačných proudů, včetně přepnutí komutátorem. Pole respektuje železo stroje v lineárním modelu. Grafy momentů a šipky sil nadále ukazují příspěvek cívek v hlavním budicím poli; nepočítají vzájemné síly cívek, sycení ani reaktanční napětí komutace. Maximum radiální indukce při jednotkovém buzení je normalizované na jedničku; poloměr i společná silová konstanta jsou zahrnuté v poměrných jednotkách.</p></dialog></div>`;
 const $=key=>app.querySelector('#arm-'+key),svg=$('scene');
 function render(){
  const key=[s.count,s.selected,s.current,s.flux].join(':');if(key!==cachedKey){cached=model(s);cachedKey=key;}const m=cached;m.now=m.at(s.position);
  svg.innerHTML=scene(s,m);plots(s,m).forEach((p,k)=>{$('chart-'+k).innerHTML=p.svg;$('legend-'+k).innerHTML=p.legend;});
  for(const key of ['position','count','selected','current','flux']){$(key).value=s[key];$(''+key+'-value').innerHTML=V.tex(key==='position'?num(s.position*360,0)+'^{\\circ}':['count','selected'].includes(key)?String(s[key]):num(s[key])+'\\,\\mathrm{p.u.}');}
  $('selected').max=s.count;$('selected').disabled=s.count===1;
  $('play').textContent=s.playing?'Ⅱ Pozastavit':'▶ Spustit pomalu';$('play').setAttribute('aria-pressed',String(s.playing));
  $('insight').textContent=s.count===48?'Celé uzavřené vinutí · 4 paralelní větve.':'Zobrazeny příspěvky '+s.count+' z 48 cívek uzavřeného vinutí.';
  $('ripple').innerHTML=V.tex(m.ripple===null?'\\Delta M=0':('\\varepsilon_M='+num(m.ripple*100,1)+'\\,\\%'));
  dirty=false;
 }
 function count(value){s.count=Math.max(1,Math.min(48,Math.round(value)));s.selected=Math.min(s.selected,s.count);dirty=true;}
 for(const key of ['position','count','selected','current','flux'])$(key).oninput=()=>{if(key==='count')count(+$(key).value);else s[key]=+$(key).value;if(key==='position')s.playing=false;dirty=true;};
 for(const key of ['field','forces'])$(key).onchange=()=>{s[key]=$(key).checked;dirty=true;};
 $('play').onclick=()=>{s.playing=!s.playing;last=0;dirty=true;};
 $('reset').onclick=()=>{Object.assign(s,defaults);$('field').checked=true;$('forces').checked=true;dirty=true;};
 $('full').onclick=()=>{document.body.classList.toggle('fullscreen');window.dispatchEvent(new Event('resize'));};
 const dialog=app.querySelector('.arm-explanation');$('explain').onclick=()=>dialog.showModal();$('close').onclick=()=>dialog.close();
 let drag=null;const point=e=>{const matrix=svg.getScreenCTM();if(!matrix)return null;const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(matrix.inverse());};
 svg.onpointerdown=e=>{if(e.button!==0)return;const p=point(e);if(!p||Math.hypot(p.x-278,p.y-280)>164)return;e.preventDefault();drag={id:e.pointerId,a:Math.atan2(280-p.y,p.x-278)};s.playing=false;svg.setPointerCapture(e.pointerId);dirty=true;};
 svg.onpointermove=e=>{if(drag?.id!==e.pointerId)return;const p=point(e);if(!p||Math.hypot(p.x-278,p.y-280)<15)return;const a=Math.atan2(280-p.y,p.x-278),d=Math.atan2(Math.sin(a-drag.a),Math.cos(a-drag.a));s.position=wrap(s.position-d/T);drag.a=a;dirty=true;};
 const end=e=>{if(drag?.id!==e.pointerId)return;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);};svg.onpointerup=end;svg.onpointercancel=end;svg.onlostpointercapture=()=>{drag=null;};
 render();function tick(now){if(disposed)return;if(!document.hidden){if(s.playing){s.position=wrap(s.position+(last?Math.min(.06,(now-last)/1000):0)/20);dirty=true;}if(dirty&&now-paint>70){render();paint=now;}}last=now;raf=requestAnimationFrame(tick);}raf=requestAnimationFrame(tick);
 window.dcArmatureState=()=>({...s});Lab.dispose=()=>{disposed=true;cancelAnimationFrame(raf);delete window.dcArmatureState;document.body.classList.remove('fullscreen');};
}
window.DCArmature={model,scene,plots,mount,poleField,fieldGrid,fieldScene};
})();
