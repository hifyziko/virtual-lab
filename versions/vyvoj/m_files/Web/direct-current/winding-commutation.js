/* STEJNOSMERNE_1, slides 72–97: simplex progressive lap winding.
   Ring below is a circuit diagram, not a replacement machine cross-section. */
(()=>{'use strict';
// Opposite branches carry the same signed current; their paths and arrows share a color.
const N=16,T=2*Math.PI,colors=['#008372','#346fc0','#008372','#346fc0'],mod=(x,n=16)=>(x%n+n)%n;
function model(position){
 const brushes=Array.from({length:4},(_,b)=>Array.from({length:N},(_,k)=>k).filter(k=>Math.abs(mod(k-position-4*b+8)-8)<.86-1e-9));
 const coils=Array.from({length:N},(_,k)=>{
  const a=mod(k+.5-position),branch=Math.floor(a/4),short=brushes.some(v=>v.includes(k)&&v.includes(mod(k+1)));
  const d=Math.min(mod(a,4),4-mod(a,4)),current=(branch%2?-1:1)*Math.min(1,d/.36);
  return {k,slot:k,back:mod(k+4),from:k,to:mod(k+1),branch,short,current};
 });return {brushes,coils};
}
function developed(count,selected){
 const V=DCVisual,x=k=>60+52*k;let out='<defs><clipPath id="wc-clip"><rect x="34" y="45" width="858" height="348"/></clipPath></defs>';
 out+='<rect x="34" y="166" width="858" height="112" fill="#e7eeec" stroke="#8caaa3" stroke-width="1"/><path d="M34 171H892M34 273H892" stroke="#ced9d2"/>';
 for(let k=0;k<N;k++)out+='<path d="M'+(x(k)-10)+' 166v112h20V166" fill="#fffdf7" stroke="#baa986" stroke-width=".8"/>';
 out+='<g clip-path="url(#wc-clip)">';
 for(let k=-16;k<32;k++){const c=mod(k);if(c>=count)continue;const color=c===selected?'#ad365d':'#9cae9f',w=c===selected?2.7:1.1;
  out+=`<path d="M${x(k+1.5)} 352 L${x(k)-4} 270 V155 L${x(k+2)} 75 L${x(k+4)+4} 155 V270 L${x(k+2.5)} 352" fill="none" stroke="${color}" stroke-width="${w}"/>`;
 }
 out+='</g>';
 for(let k=0;k<N;k++){
  out+=`<rect x="${x(k)-10}" y="174" width="20" height="67" rx="3" fill="none" stroke="#c9d8d1"/><circle cx="${x(k)-4}" cy="194" r="4" fill="#fff" stroke="#546f63"/><circle cx="${x(k)+4}" cy="222" r="4" fill="#fff" stroke="#546f63"/>`;
  out+=V.math(x(k),142,String(k+1),'#233f49',14,42)+V.math(x(k)+17,196,String(2*k+1),'#346fc0',11,35)+V.math(x(k)+17,224,String(2*k+2),'#008372',11,35);
 }
 // Half-pitch shift centers the terminal pair on the coil axis; repeat the edge lamella.
 for(let k=0;k<=N;k++){
  const l=mod(k-2),lx=x(k-.5);out+=`<rect x="${lx-21}" y="352" width="42" height="32" rx="0" fill="${l===selected||l===mod(selected+1)?'#dbb87b':'#ead5ae'}" stroke="#a78245"/>`+V.math(lx,371,String(l+1),'#6e5028',14,40);
 }
 out+=V.math(472,420,'y_{1d}=Q/(2p)=4,\\qquad y_1=2u y_{1d}+1=9','#233f49',20,850);
 return out;
}
function ring(position,selected){
 const V=DCVisual,m=model(position),theta=Math.PI/4+T/(2*N)-position*T/N,point=(a,r)=>[r*Math.sin(a),-r*Math.cos(a)];
 const selectedColor='#ad365d',conductors=m.coils.flatMap(c=>{const angle=theta+c.k*T/N;return [{angle,radius:120,current:c.current,color:c.k===selected?selectedColor:null,selected:c.k===selected},{angle:angle+Math.PI/2,radius:110,current:-c.current,color:c.k===selected?selectedColor:null,selected:c.k===selected}];});
 let machine=DCMachineArt.machine({theta,current:1,flux:1},'',{geometry:{...DCGeometry,slots:16},conductors,enlargedSlots:true,showCurrents:true});
 const ca=theta+selected*T/N,cb=ca+Math.PI/2;
 machine+='<path d="M'+[120*Math.cos(ca),-120*Math.sin(ca)]+'L'+[110*Math.cos(cb),-110*Math.sin(cb)]+'" fill="none" stroke="'+selectedColor+'" stroke-width="1.7" stroke-dasharray="5 4"/>';
 let out='<text x="260" y="35" text-anchor="middle" fill="#233f49" font-size="18">Vodiče sledované cívky v drážkách</text><g transform="translate(260 290) scale(.98)">'+machine+'</g>';
 out+='<path d="M525 70V505" stroke="#dde6e0" stroke-width="1"/><text x="755" y="35" text-anchor="middle" fill="#233f49" font-size="18">Zapojení cívek ke komutátoru</text><g transform="translate(755 285)">';
 out+='<circle r="103" fill="#eee9dd" stroke="#b6a385" stroke-width="1"/><circle r="70" fill="#e7eeec" stroke="#8caaa3"/><circle r="24" fill="#d6dedb" stroke="#8caaa3"/><circle r="7" fill="white" stroke="#8caaa3"/>';
 for(const c of m.coils){const a=(c.k-position)*T/N,b=a+T/N,r=174,p=point(a,104),q=point(b,104),u=point(a+.025,r),v=point(b-.025,r),color=c.short?'#ad365d':colors[c.branch];
  const d='M'+p+'L'+point(a,160)+'Q'+point(a,174)+' '+u+'A174 174 0 0 1 '+v+'Q'+point(b,174)+' '+point(b,160)+'L'+q;
  out+='<path d="'+d+'" fill="none" stroke="'+(c.k===selected?'#ead5dd':'#f7faf7')+'" stroke-width="'+(c.k===selected?7:4)+'"/><path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+(c.k===selected?2.5:1.35)+'"/>';
  const start=point(a-.46*T/N,98),end=point(a+.46*T/N,98),innerEnd=point(a+.46*T/N,74),innerStart=point(a-.46*T/N,74),contact=m.brushes.some(v=>v.includes(c.k));
  out+='<path d="M'+start+'A98 98 0 0 1 '+end+'L'+innerEnd+'A74 74 0 0 0 '+innerStart+'Z" fill="'+(contact?'#d9ae68':'#ead5ae')+'" stroke="#ae8a52" stroke-width=".7"/>';
  const number=point(a,124);out+=V.math(number[0],number[1]+4,String(c.k+1),'#657b79',12,32);
  const mid=point((a+b)/2,174),sgn=Math.sign(c.current);if(Math.abs(c.current)>.03)out+=V.arrow(mid[0]-sgn*6*Math.cos((a+b)/2),mid[1]-sgn*6*Math.sin((a+b)/2),sgn*12*Math.cos((a+b)/2),sgn*12*Math.sin((a+b)/2),color,1.5);
 }
 for(let b=0;b<4;b++){
  out+='<g transform="rotate('+b*90+')"><path d="M-18 -74V-39H18V-74" fill="none" stroke="#a1b1a9" stroke-width="4"/><rect x="-15" y="-74" width="30" height="24" fill="#566963" stroke="#30483f" stroke-width="1"/><path d="M-11 -70H11" stroke="#a9b7af"/><path d="M0 -50v5l-5 3 10 4-10 4 5 3" fill="none" stroke="#71877d" stroke-width="1"/><path d="M10 -51Q24 -35 18 -25" fill="none" stroke="#b58a4f" stroke-width="2"/></g>';
  out+=V.math(...point(b*T/4,41),b%2?'-':'+','#233f49',19,25);
 }
 // Outer arcs show conventional current from each positive brush to its two negative neighbours.
 for(let b=0;b<4;b++){
  const forward=b%2===0,a=b*T/4+(forward?.48:T/4-.48),z=b*T/4+(forward?T/4-.48:.48),color=colors[b],id='wc-branch-arrow-'+b;
  out+='<defs><marker id="'+id+'" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L8 4L0 8Z" fill="'+color+'"/></marker></defs>';
  out+='<path d="M'+point(a,205)+'A205 205 0 0 '+(forward?1:0)+' '+point(z,205)+'" fill="none" stroke="'+color+'" stroke-width="2.2" stroke-linecap="round" marker-end="url(#'+id+')"/>';
 }
 out+='</g>'+V.math(260,553,'Q=16,\\quad y_{1d}=4', '#233f49',20,400)+V.math(755,500,'2a=4,\\qquad i_{\\mathrm v}=i_a/4','#233f49',20,410);
 out+='<text x="755" y="535" text-anchor="middle" fill="#657b79" font-size="14">Šipky mezi kartáči: směr proudu od kladného k zápornému</text>';
 return out;
}
// A spatial current map, not another machine silhouette. Angles and signs are
// identical to the conductor sides in ring(); background sectors stay fixed.
function spatialCurrents(position,selected){
 const theta=Math.PI/4+T/(2*N)-position*T/N,pt=(a,r)=>[270+r*Math.cos(a),122-r*Math.sin(a)];
 const symbol=(x,y,current,chosen=false)=>{const color=Math.abs(current)<.03?'#718780':current>0?'#008372':'#346fc0';
  return `<g data-spatial-current="${current}" opacity="${.35+.65*Math.abs(current)}"><circle cx="${x}" cy="${y}" r="6" fill="white" stroke="${color}" stroke-width="1.4"/>`+(Math.abs(current)<.03?'':current>0?`<circle cx="${x}" cy="${y}" r="2.2" fill="${color}"/>`:`<path d="M${x-3} ${y-3}l6 6m-6 0l6 -6" stroke="${color}" stroke-width="1.5"/>`)+(chosen?`<circle cx="${x}" cy="${y}" r="8.5" fill="none" stroke="#ad365d" stroke-width="1.8"/>`:'')+'</g>';
 };
 let out='';
 for(let b=0;b<4;b++){const a=Math.PI/4+b*T/4,p=pt(a,105),q=pt(a+T/4,105);out+=`<path d="M270 122L${p}A105 105 0 0 0 ${q}Z" fill="${b%2?'#edf2fb':'#e6f3ed'}"/>`;}
 for(const c of model(position).coils){const a=theta+c.k*T/N;out+=symbol(...pt(a,85),c.current,c.k===selected)+symbol(...pt(a+Math.PI/2,69),-c.current,c.k===selected);}
 out+='<text x="270" y="118" text-anchor="middle" fill="#233f49" font-size="14">Pevné oblasti</text><text x="270" y="138" text-anchor="middle" fill="#233f49" font-size="14">směru proudu</text>';
 out+=symbol(30,72,1)+'<text x="45" y="77" fill="#233f49" font-size="15">K pozorovateli</text>'+symbol(30,103,-1)+'<text x="45" y="108" fill="#233f49" font-size="15">Od pozorovatele</text>';
 out+='<path d="M397 149h22" stroke="#ad365d" stroke-width="2"/><text x="397" y="172" fill="#ad365d" font-size="14">Sledovaná cívka</text><text x="270" y="252" text-anchor="middle" fill="#657b79" font-size="14">Vodiče se otáčejí, oblasti směrů zůstávají vůči statoru.</text>';
 return out;
}
function mount(app,entry){
 let s={stage:'run',count:16,selected:0,position:0,playing:false},raf,last=0,paint=0,disposed=false;const V=DCVisual;
 app.classList.add('module-window-host');app.innerHTML=`<div class="workspace learning-workspace uniform-module-layout dc-workspace dc-winding"><div class="modulehead"><a class="back" href="#group-dc">← Stejnosměrné stroje</a><span class="num">${entry.num}</span><h1>${entry.title}</h1><div class="actions"><div class="wc-modes" role="group" aria-label="Režim vinutí"><button id="wc-build">Sestavení vinutí</button><button id="wc-run">Proudové cesty a komutace</button></div><button id="wc-reset">Výchozí stav</button><button id="wc-full">Celá obrazovka</button></div></div><div class="wc-controls"><label id="wc-count-label">Zapojené cívky <output id="wc-count-value"></output><input id="wc-count" type="range" min="1" max="16" value="1"></label><label>Sledovaná cívka <output id="wc-selected-value"></output><input id="wc-selected" aria-label="Sledovaná cívka" type="range" min="1" max="16" step="1" value="1"></label><label>Poloha kotvy <output id="wc-position-value"></output><input id="wc-position" type="range" min="0" max="16" step=".01" value="0"></label><button id="wc-prev">← Půlkrok</button><button id="wc-next">Půlkrok →</button><button id="wc-play">▶ Spustit pomalu</button></div><div class="wc-main"><section class="learning-panel"><h2 id="wc-heading"></h2><svg id="wc-scene" data-plain-svg role="img" aria-label="Zapojení smyčkového vinutí"></svg></section><section class="learning-panel wc-explain"><h2 id="wc-title"></h2><p id="wc-text"></p><div class="wc-readouts"><div class="wc-parameters">${V.tex('2p=4,\\quad Q=16,\\quad 2u=2,\\quad K=uQ=16')}</div><div id="wc-facts"></div><div id="wc-equation"></div></div><h2 id="wc-spatial-heading">Směry proudů v prostoru</h2><svg id="wc-spatial" data-plain-svg viewBox="0 0 540 270" role="img" aria-label="Směry proudů v obou stranách cívek vůči pevnému statoru"></svg><svg id="wc-detail" data-plain-svg viewBox="0 0 540 234" role="img" aria-label="Proud sledované cívky při otáčení"></svg><p id="wc-caption"></p></section></div><p class="op-insight" id="wc-insight"></p><p class="op-note">Jednoduché smyčkové vinutí; idealizované lineární obracení proudu během kontaktu. Bez indukčnosti, jiskření a výpočtu magnetického pole.</p></div>`;
 const $=id=>app.querySelector('#wc-'+id);
 function render(){const build=s.stage==='build',m=model(s.position),c=m.coils[s.selected];
  $('count').value=s.count;$('count').disabled=!build;$('count-value').innerHTML=V.tex('N_c='+s.count);$('position').disabled=build;$('position').value=s.position;$('selected').value=s.selected+1;$('selected-value').innerHTML=V.tex(String(s.selected+1));
  for(const id of ['prev','next','play'])$(id).disabled=build;$('position-value').innerHTML=V.tex('\\theta='+String((s.position*22.5).toFixed(1)).replace('.','{,}')+'^{\\circ}');$('play').textContent=s.playing?'Ⅱ Pozastavit':'▶ Spustit pomalu';
  $('build').setAttribute('aria-pressed',build);$('run').setAttribute('aria-pressed',!build);
  $('heading').textContent=build?'Dvě vrstvy v drážkách a připojení lamel':'Čtyři kartáče rozdělují uzavřené vinutí';$('scene').setAttribute('viewBox',build?'0 0 940 455':'0 0 1000 580');$('scene').innerHTML=build?developed(s.count,s.selected):ring(s.position,s.selected);
  $('title').textContent=build?'Od jedné cívky k uzavřenému vinutí':c.short?'Sledovaná cívka právě komutuje':'Cívka je součástí proudové větve';
  $('text').textContent=build?'Cívka spojuje horní stranu jedné drážky s dolní stranou o čtyři drážky dále. Její konce vedou na sousední lamely. Přidávejte cívky: poslední uzavře celý obvod. Vínově je sledovaná cívka; průchody přes okraj pokračují na druhé straně.':'Dva kladné a dva záporné kartáče jsou střídavě rozmístěné po obvodu. Barevné cesty vedou od kladného k zápornému kartáči. Vínová komutující cívka má oba konce pod týmž kartáčem a je dočasně zkratovaná.';
  $('facts').innerHTML=[`\\text{Drážky: }${c.slot+1}\\longrightarrow ${c.back+1}`,`\\text{Lamely: }${c.from+1}\\longleftrightarrow ${c.to+1}`,build?'y_2=7,\\quad y=y_1-y_2=2':'i_{\\mathrm{v}}=i_a/(2a)=i_a/4'].map(t=>'<div>'+V.tex(t)+'</div>').join('');
  $('spatial').innerHTML=spatialCurrents(s.position,s.selected);$('spatial').hidden=build;$('spatial-heading').hidden=build;
  $('detail').innerHTML=V.plot({curves:[{fn:x=>model(x/22.5).coils[s.selected].current,color:'#008372'}],x:[0,360],y:[-1.25,1.25],xt:'\\theta/{}^{\\circ}',yt:'i_c/i_{\\mathrm{v}}',cursor:s.position*22.5});
  $('caption').textContent='Proud sledované cívky při jedné otáčce. Znaménko se vztahuje k průchodu od první lamely ke druhé.';
  $('equation').innerHTML=V.tex(build?'K=Q=16,\\quad y_k=+1':'i_c/i_{\\mathrm{v}}='+c.current.toFixed(2).replace('.','{,}'));
  $('insight').textContent=build?(s.count===16?'Vinutí je uzavřené. Přepněte na proudové cesty a sledujte, jak kartáče vytvářejí čtyři paralelní větve.':'Přidejte další cívku posuvníkem. Křížení čar není elektrický spoj; spojení je pouze na lamele.'):(m.coils.some(c=>c.short)?'Čtyři cívky současně komutují. Kartáče přemosťují sousední lamely; proud těchto cívek se obrací a cívky přecházejí do sousedních větví.':'Každý kartáč se dotýká jedné lamely. Mezi sousedními kartáči jsou čtyři cívky v sérii; všechny čtyři větve jsou paralelně připojeny ke svorkám.');
 }
 $('count').oninput=()=>{s.count=+$('count').value;s.selected=s.count-1;render();};$('selected').oninput=()=>{s.selected=+$('selected').value-1;if(s.stage==='build')s.count=Math.max(s.count,s.selected+1);render();};$('position').oninput=()=>{s.position=+$('position').value;s.playing=false;render();};
 $('build').onclick=()=>{s.stage='build';s.playing=false;render();};$('run').onclick=()=>{s.stage='run';s.count=16;render();};
 for(const [id,d]of [['prev',-.5],['next',.5]])$(id).onclick=()=>{s.position=mod(s.position+d);s.playing=false;render();};
 $('play').onclick=()=>{s.playing=!s.playing;render();};$('reset').onclick=()=>{s={stage:'run',count:16,selected:0,position:0,playing:false};render();};$('full').onclick=()=>{document.body.classList.toggle('fullscreen');window.dispatchEvent(new Event('resize'));};
 function tick(now){if(disposed)return;if(s.playing&&!document.hidden){if(last)s.position=mod(s.position+Math.min(.08,(now-last)/1000)*.4);if(now-paint>70){render();paint=now;}}last=now;raf=requestAnimationFrame(tick);}
 render();raf=requestAnimationFrame(tick);window.dcWindingState=()=>({...s});Lab.dispose=()=>{disposed=true;cancelAnimationFrame(raf);delete window.dcWindingState;document.body.classList.remove('fullscreen');};
}
window.DCWindingCommutation={model,developed,ring,spatialCurrents,mount};
})();
