
'use strict';document.getElementById('help').onclick=()=>document.getElementById('guide').showModal();document.getElementById('closeHelp').onclick=()=>document.getElementById('guide').close();
const TAU=2*Math.PI, RS=.59, CAMERA_CUT=Math.PI/2, TRACK_H=.00140;
const slider=document.querySelector('#timeline'), play=document.querySelector('#play'), reset=document.querySelector('#reset');
const story=[
{title:'1. Mimo rezonanci',body:'Začni stejně jako v pokusu s bezpečnostním faktorem. Fialová siločára kříží hřebeny předepsané výchylky. Dole proto její výchylka kolísá a červené šipky míří zpět k rovnováze.',key:'Sleduj stále stejný mód a amplitudu. Přepni na Rezonance a porovnej sklon fialové čáry.'},
{title:'2. Rezonance',body:'Na téže mapě změníme jen bezpečnostní faktor. Fialová siločára nyní vede podél hřebene. Výchylka je podél ní konstantní a vratná síla od dodatečného ohybu mizí.',key:'Rezonance určuje plochu, na kterou se zaměříme. Vznik ostrova vyžaduje také změnu propojení magnetických ploch.'},
{title:'3. Proudová porucha',body:'Nyní v okolí vyznačené rezonanční plochy předepíšeme malou odchylku proudu. Vpravo nahoře sleduj, jak její přídavné pole vychýlí původní siločáru. Dole vidíš dvě oddělené větve vybrané hladiny toku.',key:'Pokračuj k proudové vrstvě a sleduj, ve kterém kroku se větve skutečně přepojí.'},
{title:'4. Mění se celé magnetické uspořádání',body:'Malé příčné pole změní směry výsledného pole. Porovnej sklon siločáry v místním pohledu s původním směrem. Na jedné vrstvě tokamaku má porucha stejný prostorový rytmus jako původní šroubovicové pole — tam je odezva nejsilnější.',key:'Není potřeba znát čísla módu. Důležité je, že tytéž siločáry reagují na stále stejnou fázi poruchy. Ještě se nic nepřepojilo.'},
{title:'5. V úzké vrstvě se blíží změna propojení',body:'Když je rovnováha nestabilní, může deformace růst. U určité vrstvy se zesílí gradient rekonektující složky pole a vzniknou podmínky pro neideální změnu propojení. Obě větve jsou ještě otevřené.',key:'Oranžové značky označují budoucí místa změny propojení. Hlavní toroidální pole zůstává přítomné.'},
{title:'6. Původní větve se k sobě přiblíží a propojí',body:'Sleduj výhradně silné fialové křivky. Jsou zde už od začátku: dvě oddělené větve téže hodnoty helikálního toku. V místě neideální vrstvy se jejich mezera zmenšuje. Když růst poruchy dosáhne této vybrané hladiny toku, její návaznost se změní a sledovaná hladina toku vytvoří uvnitř magnetického ostrova uzavřenou křivku.',key:'Neobjevuje se nová čára: fialově pořád sleduješ STEJNOU hodnotu helikálního toku, nikoli stejnou materiální siločáru. V proudu dochází k neideálnímu přepojení; jde o názorný model, ne časové řešení MHD.'},
{title:'7. Ostrov v řezu a jeho skutečný prostorový tvar',body:'Fialově vyplněná oblast vznikla z uzavřené magnetické topologie kolem rezonanční plochy. Při dojetí posuvníkem doprava se velký řez změní v prostorový torus. Otevřená přední 90° výseč ukazuje vnitřní průřez šroubovicovou ostrovní oblastí. Ta se může otáčet; zde ukazujeme předepsanou rotaci jedné poruchové fáze.',key:'Ostrov není samostatný pevný předmět. Jde o prostorové uspořádání magnetických ploch. 3D zobrazení je schematické, jeho poloha je však určena stejnou helikální fází 2θ − φ jako v řezu.'}
];
let active=false, raf=0,last=0,playhead=0,sliderDrag=false;
// The slider has perceptual rather than linear time resolution: long static phases
// are compact, whereas the narrowly spaced reconnection threshold gets extra space.
// KNOTS are (slider coordinate, teaching model time); strictly monotone both ways.
const TIMELINE_KNOTS=[[0,0],[70,1],[185,2],[315,3],[440,4],[555,5],[720,5.62],[835,5.95],[915,6.32],[1000,7]];
function betweenKnot(v,forward=true){
 const list=forward?TIMELINE_KNOTS:TIMELINE_KNOTS.map(p=>[p[1],p[0]]);
 const v0=Math.max(list[0][0],Math.min(list[list.length-1][0],v));
 for(let i=1;i<list.length;i++)if(v0<=list[i][0]){
  const [a,b]=list[i-1],[c,d]=list[i];return b+(v0-a)/(c-a)*(d-b);
 }
 return list[list.length-1][1];
}
function stageValue(){return betweenKnot(parseFloat(slider.value))}
function seekStage(t){slider.value=betweenKnot(t,false).toFixed(1)}

function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v));}
function smooth(v){v=clamp(v);return v*v*(3-2*v)}
function parameters(t){
  // Content is progressively revealed, not a time-accurate MHD evolution.
  let seed=smooth((t-2)*2), field=smooth(t-2), b=0, e=0;
  if(t>=2 && t<3)b=.012*field;
  if(t>=3 && t<4)b=.012+.020*smooth(t-3);
  if(t>=4)b=.032+.006*smooth(t-4);
  // Ease the visible gap and then the angular position of each new tip.
  if(t>=5){
   const gap=1-smooth((t-5)/.78);
   const tip=Math.acos(TRACK_H/.0049)*smooth((t-5.94)/1.06);
   e=TRACK_H*(1-gap*gap)/Math.cos(tip);
  }
  return {t,seed,field,b,e,q:1.5+.5*smooth((t-.1)/.9),intro:1-smooth((t-1.8)/.8),phi:CAMERA_CUT,layer:smooth(t-4),rec:smooth(t-5)};
}
const blue='#356ac3', violet='#8743b1', reference='#879bab';
const element=id=>document.getElementById(id);
const num=n=>Number(n.toFixed(2));
const point=p=>p.map(num).join(' ');
function path(d,stroke,width=1,fill='none',extra=''){
 return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
}
function line(points,color,width=1,fill='none',closed=false){
 return path('M'+points.map(point).join('L')+(closed?'Z':''),color,width,fill);
}
function samples(n,fn){return Array.from({length:n+1},(_,i)=>fn(i/n));}
function circle(x,y,r,stroke,fill='none',width=1){
 return `<circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}" stroke="${stroke}" fill="${fill}" stroke-width="${width}"/>`;
}
function label(x,y,text,anchor='start',color='#385064'){
 return `<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-size="15" paint-order="stroke" stroke="white" stroke-width="3" stroke-linejoin="round">${text}</text>`;
}
const typeset=new Map();
function mathAt(x,y,w,tex){
 if(!typeset.has(tex))typeset.set(tex,katex.renderToString(tex));
 return `<foreignObject x="${x}" y="${y}" width="${w}" height="30"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;color:#294463">${typeset.get(tex)}</div></foreignObject>`;
}
function arrow(x,y,dx,dy,color,width=2.6){
 const length=Math.hypot(dx,dy);if(length<.05)return '';
 const head=Math.min(10,length),half=Math.min(width/2,head/2),base=length-head;
 return path(`M0 ${-half}H${base}V${-head/2}L${length} 0 ${base} ${head/2}V${half}H0Z`,'none',0,color,`transform="translate(${x} ${y}) rotate(${Math.atan2(dy,dx)*180/Math.PI})"`);
}
function source(x,y,positive){
 return circle(x,y,9,'#a16547','#fff',1.8)+(positive?circle(x,y,2.8,'none','#a16547'):path(`M${x-4} ${y-4}l8 8m0 -8l-8 8`,'#a16547',1.8));
}
// One prescribed m/n=2/1 current mode in the circular plasma. For downward
// screen y, a positive Laplacian of psi means current towards the observer.
// F solves (Frr+Fr/r-4F/r²)=-4u exp(-u)/rs², u=(r/rs)².
const sectionScale=226,resonantRadius=sectionScale*RS;
const initialOffset=sectionScale*Math.sqrt(2*TRACK_H);
const probeRadius=resonantRadius-initialOffset,outerRadius=resonantRadius+initialOffset;
const gain=0.55*probeRadius;
function harmonicRadial(u){
 if(u<.0001)return [u/2-u*u/3,.5-2*u/3];
 const exp=Math.exp(-u),f=(-Math.expm1(-u)-u*exp)/u;
 return [f,exp-f/u];
}
function localField(x,y,strength){
 const r=Math.hypot(x,y);
 if(!r)return [0,0];
 const u=(r/resonantRadius)**2,[f,du]=harmonicRadial(u);
 const xi=2*Math.atan2(-y,x)-CAMERA_CUT;
 const radial=-r/probeRadius+gain*strength*du*2*r/resonantRadius**2*Math.cos(xi);
 const angular=2*gain*strength*f*Math.sin(xi)/r;
 return [(radial*y+angular*x)/r,(-radial*x+angular*y)/r];
}
function poloidalFlux(x,y,strength){
 const u=(x*x+y*y)/resonantRadius**2;
 return -(x*x+y*y)/(2*probeRadius)+gain*strength*harmonicRadial(u)[0]*Math.cos(2*Math.atan2(-y,x)-CAMERA_CUT);
}
function currentPattern(id){
 const stops=samples(24,t=>{
  const u=(sectionScale*t/resonantRadius)**2;
  return [t,u*Math.exp(1-u)];
 });
 let svg='<defs>';
 for(const [sign,color] of [['pos','#c47837'],['neg','#697da9']]){
  svg+=`<radialGradient id="${id}-${sign}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${sectionScale}">`+
   stops.map(([t,v])=>`<stop offset="${t}" stop-color="${color}" stop-opacity="${num(v*.49)}"/>`).join('')+'</radialGradient>';
 }
 svg+='</defs>';
 for(let i=0;i<96;i++){
  const a=TAU*i/96,b=TAU*(i+1)/96,value=-Math.cos(a+b-CAMERA_CUT);
  const xy=t=>point([sectionScale*Math.cos(t),-sectionScale*Math.sin(t)]);
  svg+=path(`M0 0L${xy(a)}A226 226 0 0 0 ${xy(b)}Z`,'none',0,`url(#${id}-${value>0?'pos':'neg'})`,`opacity="${num(Math.abs(value))}"`);
 }
 for(let i=0;i<4;i++){
  const xi=i*Math.PI,a=(xi+CAMERA_CUT)/2;
  svg+=source(resonantRadius*Math.cos(a),-resonantRadius*Math.sin(a),i%2===1);
 }
 return svg;
}
function directionMark(x,y,b,size,color){
 const angle=Math.atan2(b[1],b[0])*180/Math.PI;
 return path(`M${size} 0L${-size*.72} ${size*.64}V${-size*.64}Z`,'none',0,color,
  `transform="translate(${num(x)} ${num(y)}) rotate(${num(angle)})"`);
}
// Follow a fixed flux value; the cubic endpoint tangents and arrowheads both
// come from B=(dPsi/dy,-dPsi/dx). Equal polar angles do not imply equal radii.
let cachedStrength=-1,cachedCurves=[];
function fieldRadius(radius,theta,strength){
 const c=Math.cos(theta),s=Math.sin(theta),level=-(radius**2)/(2*probeRadius);
 let r=radius;
 for(let n=0;n<5;n++){
  const x=r*c,y=r*s,[bx,by]=localField(x,y,strength);
  r-=(poloidalFlux(x,y,strength)-level)/(-by*c+bx*s);
 }
 return r;
}
function fieldCurves(strength){
 if(strength===cachedStrength)return cachedCurves;
 cachedStrength=strength;
 cachedCurves=[58,89,probeRadius,outerRadius,190].map(radius=>{
  const points=samples(80,u=>{
   const theta=TAU*u,c=Math.cos(theta),s=Math.sin(theta);
   const r=fieldRadius(radius,theta,strength);
   const x=r*c,y=r*s,b=localField(x,y,strength),length=Math.hypot(...b);
   return {x,y,b,tx:b[0]/length,ty:b[1]/length};
  });
  let d='M'+point([points[0].x,points[0].y]);
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],h=Math.hypot(b.x-a.x,b.y-a.y)/3;
   d+='C'+point([a.x+h*a.tx,a.y+h*a.ty])+' '+point([b.x-h*b.tx,b.y-h*b.ty])+' '+point([b.x,b.y]);
  }
  return {radius,d:d+'Z',points};
 });
 return cachedCurves;
}
function fieldDrawing(s,detail){
 let svg=circle(0,0,probeRadius,reference,'none',detail?1:1.8).replace('/>',' stroke-dasharray="4 4"/>');
 for(const curve of fieldCurves(s.field)){
  const selected=curve.radius===probeRadius,color=selected?blue:'#7098c9';
  svg+=path(curve.d,color,selected?(detail?1.7:3):(detail?.85:1.5));
  const marks=detail?(selected?[41]:[37,43]):[8,28,48,68];
  for(const i of marks){const p=curve.points[i];svg+=directionMark(p.x,p.y,p.b,detail?2.8:5.2,color);}
 }
 return svg;
}
// Unroll the neighbourhood of the left side of the section. Equal-radius
// equilibrium lines become parallel; the perturbed radii use the same flux.
function parallelLines(strength){
 const scale=3,centreX=190,centreY=111;
 let out=strength?path('M190 32V190',reference,1.4,'none','stroke-dasharray="4 5"'):'';
 for(const delta of [-36,-18,0,18,36]){
  const points=samples(42,u=>{
   const y=32+158*u,theta=Math.PI+(centreY-y)/(scale*probeRadius);
   return [centreX+scale*(probeRadius-fieldRadius(probeRadius+delta,theta,strength)),y];
  });
  const color=delta===0?blue:'#749ac7';
  out+=line(points,color,delta===0?2.8:1.7);
  const i=delta===0?15:25,p=points[i],next=points[i-1];
  out+=directionMark(...p,[next[0]-p[0],next[1]-p[1]],5,color);
 }
 return out;
}
// Same prescribed 2/1 displacement as the preceding safety-factor lesson.
function stabilityMap(q){
 const x=76,y=25,w=540,h=148,bottom=y+h;
 // Phase in screen coordinates: 2 theta - phi, with two toroidal turns.
 const ax=2*TAU/w,ay=2*TAU/h,k=ax*ax+ay*ay;
 let stops='';
 for(let i=0;i<=64;i++){
  const wave=Math.cos(TAU*i/64),end=wave>=0?[232,190,145]:[157,193,231];
  const color=[244,247,248].map((v,j)=>Math.round(v+.65*Math.abs(wave)*(end[j]-v)));
  stops+='<stop offset="'+i/64+'" stop-color="rgb('+color.join(',')+')"/>';
 }
 let plot='<defs><linearGradient id="phaseBands" gradientUnits="userSpaceOnUse" x1="'+x+'" y1="'+y+'" x2="'+(x+TAU*ax/k)+'" y2="'+(y+TAU*ay/k)+'" spreadMethod="repeat">'+stops+'</linearGradient><clipPath id="resonanceMapClip"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"/></clipPath></defs>';
 plot+='<g clip-path="url(#resonanceMapClip)"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#phaseBands)"/>';
 for(let j=-2;j<=2;j++){
  const start=bottom+j*h/2;
  plot+=path('M'+x+' '+start+'l'+w+' '+(-h),'#a45c25',2,'none','stroke-dasharray="5 4"');
 }
 for(let wrap=0;wrap<=2;wrap++){
  const start=bottom+wrap*h;
  plot+=line([[x,start],[x+w,start-2*h/q]],violet,3.5);
 }
 return plot+'</g>'+mathAt(5,16,64,'2\\pi')+mathAt(14,155,50,'0')+mathAt(47,177,58,'0')+mathAt(580,177,70,'4\\pi')+mathAt(7,84,54,'\\theta')+mathAt(315,200,60,'\\varphi')+mathAt(292,0,100,'q='+String(num(q)).replace('.', '{,}'));
}
function stabilityTrace(q){
 const detuning=2/q-1, amplitude=.65, x=t=>70+545*t;
 const displacement=t=>amplitude*Math.cos(2*TAU*detuning*t),y=t=>90-66*displacement(t);
 let plot=path('M70 90H615',reference,1,'none','stroke-dasharray="4 4"')+line(samples(200,t=>[x(t),y(t)]),violet,3);
 for(let i=1;i<14;i++){
  const t=i/14;plot+=arrow(x(t),y(t),0,190*detuning*detuning*displacement(t),'#ba354b',2);
 }
 return plot+mathAt(0,69,70,'\\xi_r/A_{\\max}')+mathAt(45,139,50,'0')+mathAt(584,139,63,'4\\pi')+mathAt(315,151,60,'\\varphi')+mathAt(432,4,200,'|\\hat f_{\\mathrm v}|'+(q===2?'=0':'\\approx '+(amplitude*detuning*detuning).toFixed(3).replace('.', '{,}')));
}
element('micro').innerHTML='<g id="resonanceMap"></g><g id="microPlane"><g id="parallelField"></g><g id="localProbe">'+
 circle(190,111,4,'white',blue,1.5)+label(179,115,'P','end')+'</g>'+
 source(70,219,false)+label(87,224,'Proud plazmatu do roviny řezu')+
 path('M389 14V230','#dce4eb')+label(519,27,'Směr poloidálního pole','middle')+'<g id="microTriangle"></g></g><g id="connectionView"></g>';
function renderMicro(s){
 element('localProbe').setAttribute('opacity',s.field);
 if(!changed('microField',s.field))return;
 element('parallelField').innerHTML=parallelLines(s.field);
 const [bx,by]=localField(-probeRadius,0,s.field);
 const x=466,y=184,scale=102;
 let triangle=arrow(x,y,0,-scale,reference);
 triangle+=arrow(x,y-scale,bx*scale,(by+1)*scale,'#6c90bc');
 triangle+=arrow(x,y,bx*scale,by*scale,blue);
 triangle+=mathAt(x-62,y-65,56,String.raw`\mathbf B_0`);
 if(s.field>.05)triangle+=mathAt(x+bx*scale/2-29,y-scale-29,58,String.raw`\Delta\mathbf B`)+mathAt(x+bx*scale*.55+6,y-48,34,String.raw`\mathbf B`);
 const degrees=(Math.atan2(bx,-by)*180/Math.PI).toFixed(1).replace('.','{,}');
 element('microTriangle').innerHTML=triangle+layer(s.field,()=>mathAt(435,204,180,String.raw`\delta=${degrees}^\circ`));
}
// At the saddle the exact tracked level satisfies
// (x-b cos xi)^2 = 2(H* - epsilon cos q), q=xi-pi.
// Parameterise from the turning points so branches meet exactly at each tip.
const detailSpan=1.65;
function connectionPreview(s){
 // Use the same coordinates as the boxed patch of the unrolled layer.
 const span=detailSpan,cx=340,cy=118;
 const xy=(q,sign)=>[cx+140*q,cy-730*(s.b*(1-Math.cos(q))+sign*Math.sqrt(Math.max(0,2*(TRACK_H-s.e*Math.cos(q)))))];
 const secondary='#ad9bb6';
 let drawing=label(17,21,'Vně','start','#657782')+label(17,200,'K ose','start','#657782')+label(cx+12,cy+19,'X','start','#92591b')+path(`M${cx-6} ${cy}h12m-6 -6v12`,'#a8682c',1.5);
 // During contact, gradually transfer the highlight from A–B to A–D.
 const transfer=smooth((s.t-5.78)/.16);
 const tip=s.e>TRACK_H?Math.acos(TRACK_H/s.e):0;
 for(const side of [-1,1]){
  for(const sign of [-1,1]){
   const weight=sign>0?(side<0?1:1-transfer):(side<0?transfer:0);
   const points=samples(84,u=>xy(side*(tip+(span-tip)*u*u),sign));
   drawing+=line(points,secondary,2.5)+layer(weight,()=>line(points,violet,3.5));
  }
 }
 for(const [side,sign,name] of [[-1,1,'A'],[1,1,'B'],[1,-1,'C'],[-1,-1,'D']]){
  const [x,y]=xy(side*span,sign);
  const weight=name==='A'?1:name==='B'?1-transfer:name==='D'?transfer:0;
  drawing+=circle(x,y,5,secondary,'white',2)+layer(weight,()=>circle(x,y,5,violet,name==='A'?violet:'white',2))+label(x+side*18,y+5,name,'middle');
 }
 drawing+=layer(smooth((s.t-5.68)/.10)*(1-smooth((s.t-5.94)/.12)),()=>circle(cx,cy,5,'#a8682c','white',2));
 return drawing;
}
function updateDetail(s){
 const detail=smooth((s.t-4.65)/.4);
 const intro=s.intro;
 if(intro && changed('stabilityMap',s.q))element('resonanceMap').innerHTML=stabilityMap(s.q);
 element('resonanceMap').setAttribute('opacity',intro);
 element('microPlane').setAttribute('opacity',(1-detail)*(1-intro));
 element('connectionView').setAttribute('opacity',detail);
 if(detail && changed('connectionGeometry',[s.b,s.e,clamp((s.t-5.68)/.38)].join()))
  element('connectionView').innerHTML=connectionPreview(s);
 const caption=intro>.5?4:detail<.5?0:s.e<TRACK_H?1:s.e===TRACK_H?2:3;
 if(changed('detailCaption',caption)){
  element('detailTitle').textContent=caption===4?'Siločára na rozvinuté ploše':caption===0?'Siločáry před poruchou a při ní':'U bodu X · řez fialovou magnetickou plochou';
  element('micro').setAttribute('aria-label',element('detailTitle').textContent);
  element('detailLegend').innerHTML=[
   'Levý okraj poloidálního řezu je zde rozvinutý naplocho. Trojúhelníky ukazují směr magnetického pole.',
   'Najdi A v orámované výseči vlevo. Tady je výseč rozvinutá naplocho. Fialový obrys vede z A do B.',
   'V X se setkají čtyři ramena řezu magnetickou plochou. Prostorové siločáry zde mají společný směr podél prstence.',
   'Začni znovu v A. Tmavá větev se stáčí zpět doleva do D. Světlá spojuje B s C.',
   'Čárkovaně hřebeny výchylky, fialově sledovaná siločára.'
  ][caption];
 }
}
function fluxContour(value,s,project){
 const closed=s.e>value;
 const limit=closed?Math.acos(-value/s.e):Math.PI;
 // Sinusoidal sampling resolves the vertical tangent at both tips of a lens.
 const side=sign=>samples(140,u=>{
  const xi=limit*Math.sin(Math.PI*(u-.5));
  const x=s.b*Math.cos(xi)+sign*Math.sqrt(Math.max(0,2*(value+s.e*Math.cos(xi))));
  return project(xi,x);
 });
 const a=side(1),b=side(-1);
 if(closed)return 'M'+a.concat(b.reverse()).map(point).join('L')+'Z';
 return 'M'+a.map(point).join('L')+'M'+b.map(point).join('L');
}
function backgroundContours(s,project){
 return [.009,.022,.043].map(value=>path(fluxContour(value,s,project),'#a8c4e8',1.45)).join('');
}
function trackedContour(s,project){
 const fill=0.11*smooth((s.e/TRACK_H-1)/.18);
 return path(fluxContour(TRACK_H,s,project),violet,3,`rgba(135,67,177,${fill})`);
}
// Follow the two intersections of H=H* with the same radial line. After
// contact there is no intersection there: follow the actual lens tip instead.
function gapMarks(s,project){
 if(s.t<=4.65)return '';
 if(s.e>TRACK_H){
  const tip=Math.acos(-TRACK_H/s.e);
  return circle(...project(tip,s.b*Math.cos(tip)),3.5,violet,'white',1.8);
 }
 const half=Math.sqrt(2*(TRACK_H-s.e));
 const a=project(Math.PI,-s.b-half),b=project(Math.PI,-s.b+half);
 // Leave short traces from each pre-reconnection position to its current
 // position. The two filled endpoints stay on the actual flux contour.
 const originalHalf=Math.sqrt(2*TRACK_H);
 let trails='';
 if(s.e>0){
  for(const [sign,end] of [[-1,a],[1,b]]){
   const start=project(Math.PI,-s.b+sign*originalHalf);
   trails+=line([start,end],'#b699c6',2)+circle(...start,2,'#b699c6','white',1);
  }
 }
 return layer(clamp(half/(originalHalf*.25)),()=>trails)+line([a,b],'#a8682c',2)+circle(...a,3.5,violet,'white',1.8)+circle(...b,3.5,violet,'white',1.8);
}
function plasmaCurrentRow(s,project){
 const y=181,color='#384f60';
 let row=label(18,y+4,'Proud plazmatu','start',color);
 for(const xi of [-Math.PI,0,Math.PI]){
  const [x]=project(xi,0);
  const relative=1+s.seed*(2*gain*probeRadius/(Math.E*resonantRadius**2))*Math.cos(xi);
  const r=7*Math.sqrt(relative),arm=r*.46;
  row+=`<g transform="translate(${x} ${y})"><title>Celkový proud plazmatu míří do řezu</title>`+
   circle(0,0,r,color,'white',1.5)+path(`M${-arm} ${-arm}L${arm} ${arm}M${arm} ${-arm}L${-arm} ${arm}`,color,1.6)+'</g>';
  if(s.seed>0)row+=layer(s.seed,()=>label(x+14,y+4,xi===0?'silnější':'slabší','start',color));
 }
 return row;
}
element('local').innerHTML='<g id="tracePlot"></g><g id="layerPlot"></g>';
function renderLocal(s){
 // Keep 28% of a neighbouring period visible beyond each end of the main one.
 const halfPeriod=200,centre=340;
 const project=(xi,x)=>[centre+xi*halfPeriod/Math.PI,85-x*240];
 const period=backgroundContours(s,project)+trackedContour(s,project);
 let plot=path('M28 85H652','#bfcdd8',1,'none','stroke-dasharray="3 5"');
 for(const offset of [-2,2])plot+=`<g transform="translate(${offset*halfPeriod} 0)">${period}</g>`;
 plot+=period+gapMarks(s,project);
 const xCentre=centre+halfPeriod,halfWidth=detailSpan*halfPeriod/Math.PI;
 const yCentre=85+240*s.b,halfHeight=118*240/730;
 const box=path(`M${xCentre-halfWidth} ${yCentre-halfHeight}h${2*halfWidth}v${2*halfHeight}h${-2*halfWidth}Z`,'#936e48',1.5,'none','stroke-dasharray="5 4"');
 plot+=layer(smooth((s.t-4.65)/.4),()=>box);
 element('layerPlot').innerHTML='<defs><clipPath id="layer-window"><rect x="28" y="0" width="624" height="170"/></clipPath></defs>'+
  '<g clip-path="url(#layer-window)">'+plot+'</g>'+layer(currentVisibility(s),()=>label(28,21,'Odchylky','start','#805135')+modeMarkers(s,project,true))+plasmaCurrentRow(s,project);
 element('fluxStatus').textContent=s.e>TRACK_H?'U ⊙ se větve propojily. Fialová křivka teď v řezu obepíná střed magnetického ostrova.':s.t>=5?'U ⊙ se mezera zavírá, u ⊗ se otevírá. Úsečka měří rozestup větví.':s.b>0?'Obě větve se zatím vychylují společně a jejich rozestup zůstává stejný.':'Fialové větve mají po celé délce stejný rozestup.';
}
function sectionPoint(xi,x,k=0){
 const theta=(xi+CAMERA_CUT)/2+k*Math.PI,r=226*(RS+x);
 return [280+r*Math.cos(theta),270-r*Math.sin(theta)];
}
// Map the exact bounds of the rectangular detail back to the poloidal plane.
function detailFootprint(s){
 const project=(q,h)=>sectionPoint(Math.PI+q,-s.b+h);
 const halfHeight=118/730;
 const rim=sign=>samples(80,u=>project(detailSpan*(2*u-1),sign*halfHeight));
 let out=path('M'+rim(1).concat(rim(-1).reverse()).map(point).join('L')+'Z','#a8682c',1.5,'#b5782510','stroke-dasharray="5 4"');
 const x=project(0,0);
 out=layer(smooth((s.t-4.65)/.4),()=>out+label(x[0]-16,x[1]-11,'X','end','#92591b'));
 for(const [side,sign,name] of [[-1,1,'A'],[1,1,'B'],[1,-1,'C'],[-1,-1,'D']]){
  const q=side*detailSpan;
  const offset=s.b*(1-Math.cos(q))+sign*Math.sqrt(2*(TRACK_H-s.e*Math.cos(q)));
  const [px,py]=project(q,offset);
  out+=layer(smooth((s.t-4.65)/.4),()=>circle(px,py,2.8,violet,'white',1.3))+label(px+side*10,py+(sign>0?-7:15),name,'middle',violet);
 }
 return out;
}
function section(s){
 let out='';
 for(let k=0;k<2;k++){
  const project=(xi,x)=>sectionPoint(xi,x,k);
  out+=trackedContour(s,project);
  if(k===0)out+=gapMarks(s,project);
 }
 out+=detailFootprint(s);
 return out;
}
// The resonant current perturbation varies continuously as -epsilon*cos(xi).
// Place the symbols outside the contours and point to the two extrema.
function modeMarkers(s,project,local){
 let out='';
 for(const [xi,positive] of [[-Math.PI,true],[0,false],[Math.PI,true]]){
  const target=project(xi,s.b*Math.cos(xi));
  const marker=local?[target[0],17]:[280+(target[0]-280)*1.48,270+(target[1]-270)*1.48];
  out+=path('M'+point(marker)+'L'+point(target),'#ac856c',1,'none','stroke-dasharray="3 4"');
  out+=source(...marker,positive);
 }
 return out;
}
// The quiet outer envelope gives the island a spatial reference. Its apparent
// contours satisfy n · view = 0 on the circular tube at each toroidal angle.
function torus(s){
 const start=Math.PI/4,end=TAU-start,cp=Math.cos(viewPitch),sp=Math.sin(viewPitch);
 const scale=85,major=2.05,items=[];
 function project(phi,theta,r){
  const a=phi+viewYaw,rho=major+r*Math.cos(theta),y=rho*Math.sin(a),z=r*Math.sin(theta);
  return [280+scale*rho*Math.cos(a),270-scale*(y*sp+z*cp),-y*cp+z*sp];
 }
 function outline(points,close=false){
  return 'M'+points.map(p=>point(p.slice(0,2))).join('L')+(close?'Z':'');
 }
 function silhouette(phi,side){
  const theta=Math.atan2(cp*Math.sin(phi+viewYaw),sp)+side*Math.PI;
  return project(phi,theta,1);
 }
 const outer=samples(128,u=>silhouette(start+(end-start)*u,0));
 const inner=samples(128,u=>silhouette(start+(end-start)*u,1));
 const defs='<defs><linearGradient id="torus-shell" x2=".18" y2="1"><stop stop-color="#dcebf1"/><stop offset=".48" stop-color="#f5fafc"/><stop offset="1" stop-color="#bfd5e0"/></linearGradient><radialGradient id="torus-cut"><stop stop-color="#fcfaf5"/><stop offset="1" stop-color="#e9e0d3"/></radialGradient></defs>';
 // Fill each swept interval as one continuous silhouette, including its
 // rounded end boundaries. The end disks themselves show the physical cut.
 let scene=defs+path(outline(outer.concat(inner.slice().reverse()),true),'none',0,'url(#torus-shell)');
 for(const rim of [outer,inner])scene+=path(outline(rim),'#9cb9c9',1.25);
 // Show an interior flux surface around each O-line. A negative flux level
 // isolates two lobes; the separatrix itself meets at the X-lines.
 const level=-.55*s.e,limit=Math.acos(-level/s.e);
 function surface(phi,t,k){
  const xi=limit*Math.sin(t),theta=(phi+phase3d+xi)/2+k*Math.PI;
  const r=RS+s.b*Math.cos(xi)+Math.sign(Math.cos(t))*Math.sqrt(Math.max(0,2*(level+s.e*Math.cos(xi))));
  return project(phi,theta,r);
 }
 // Draw each short sweep as a single silhouette. A shared, scene-fixed
 // gradient continues across adjacent sweeps while their depth sets overlap.
 for(let k=0;k<2;k++){
  const id='island-light-'+k;
  scene+=`<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="155" y1="90" x2="345" y2="430"><stop stop-color="${k?'#cdb3e0':'#e2c9ed'}"/><stop offset=".37" stop-color="${k?'#a077bb':'#c396d4'}"/><stop offset=".67" stop-color="${k?'#80579e':'#a775be'}"/><stop offset="1" stop-color="#684688"/></linearGradient></defs>`;
  const paint='url(#'+id+')';
  let last;
  for(let i=0;i<=96;i++){
   const phi=start+(end-start)*i/96;
   const mid=(phi+phase3d)/2+k*Math.PI;
   const a=project(phi,mid,RS+s.b),b=project(phi+.001,mid+.0005,RS+s.b);
   const nx=b[1]-a[1],ny=a[0]-b[0];
   const section=samples(40,u=>surface(phi,TAU*u,k));
   const dot=p=>nx*p[0]+ny*p[1];
   let low=section[0],high=low;
   for(const p of section){if(dot(p)<dot(low))low=p;if(dot(p)>dot(high))high=p;}
   const row={low,high,a};
   if(last){
    const points=[last.low,low,high,last.high];
    const ridge=(l,h)=>[l[0]*.2+h[0]*.8,l[1]*.2+h[1]*.8];
    const highlight=line([ridge(last.low,last.high),ridge(low,high)],'#f5e7ff66',1.2);
    items.push({depth:(a[2]+last.a[2])/2,markup:path(outline(points,true),paint,.8,paint)+highlight});
   }
   last=row;
  }
 }
 // A cut facing the viewer conceals surfaces behind its disk. A back-facing
 // cut belongs behind the ribbons. Draw each face and its contours together.
 function cap(phi){
  let svg=path(outline(samples(100,u=>project(phi,TAU*u,1)),true),'#b78248',1.8,'url(#torus-cut)');
  for(const r of [.32,.83])svg+=path(outline(samples(80,u=>project(phi,TAU*u,r)),true),'#cfc7ba',.85);
  for(let k=0;k<2;k++){
   const map=(xi,r)=>project(phi,(phi+phase3d+xi)/2+k*Math.PI,RS+r).slice(0,2);
   svg+=path(fluxContour(s.e,s,map), '#9157a8',1.1,'none');
   svg+=path(outline(samples(96,u=>surface(phi,TAU*u,k)),true),'#733e8f',1.2,'#b884c6');
  }
  return svg;
 }
 let front='';
 for(const [phi,sign] of [[start,-1],[end,1]]){
  if(-sign*Math.cos(phi+viewYaw)*cp>0)front+=cap(phi);else scene+=cap(phi);
 }
 return scene+items.sort((a,b)=>a.depth-b.depth).map(item=>item.markup).join('')+front;
}
const probeX=280-probeRadius;
element('fieldNotes').innerHTML='<g id="resonantBand">'+circle(280,270,226*RS,'#8743b140','none',14)+circle(280,270,226*RS,violet,'none',1.6)+'</g>'+source(280,270,false)+label(297,275,'proud plazmatu')+ '<g id="mainProbe" opacity="0">'+circle(probeX,270,4,'white',blue,1.5)+label(probeX-10,276,'P','end')+'</g>';
element('seedSites').innerHTML='<g transform="translate(280 270)">'+currentPattern('whole-current')+'</g>';
let fieldOverride=null;
const drawKeys=new Map();
function changed(id,key){
 if(drawKeys.get(id)===key)return false;
 drawKeys.set(id,key);return true;
}
function currentVisibility(s){return s.seed;}
function surfaceMix(t){
 return smooth((t-3)/1.15);
}
function layer(opacity,render){
 if(opacity<=0)return '';
 const markup=render();
 return opacity>=1?markup:`<g opacity="${opacity}">${markup}</g>`;
}
function renderSection(s){

 const mix=fieldOverride===null?surfaceMix(s.t):Number(!fieldOverride);
 const depthMix=smooth((s.t-6.25)/(threeDStart()-6.25));
 const spatial=s.t>=threeDStart(),showField=mix<.5;
 const toggle=element('sectionToggle');toggle.hidden=spatial;
 toggle.textContent=showField?'Ukázat tokové plochy':'Ukázat siločáry';
 element('cut').classList.toggle('is-3d',spatial);
 const opacity=(id,v)=>element(id).setAttribute('opacity',v.toFixed(3));
 opacity('flatView',1-depthMix);opacity('resonantBand',1-smooth(s.t-2));
 opacity('spaceView',depthMix);
 if(depthMix<1){
  if(changed('baseField',s.field))element('baseField').innerHTML=fieldDrawing(s,false);
  if(changed('fluxPair',[s.b,s.e,smooth((s.t-4.65)/.4)].join()))element('fluxPair').innerHTML=section(s);
  opacity('baseField',1-.76*mix);
  opacity('fieldNotes',1-.85*mix);opacity('mainProbe',s.field);
  opacity('seedSites',s.seed);
 }
 if(depthMix>0 && changed('spaceView',[s.b,s.e,phase3d,viewYaw,viewPitch].join()))
  element('spaceView').innerHTML=torus(s);
 element('sectionTitle').textContent=spatial?'Prostorový výřez tokamaku':showField?'Poloidální magnetické pole':'Řez helikálními tokovými plochami';
 element('cutHint').textContent=spatial?'Tažením otoč pohled. Oranžové obrysy vymezují otevřenou výseč.':s.t>=1 && s.t<2?'Když elektrické pole místně urychlí elektrony podél prstence, za sekundu projde průřezem víc náboje. Tam proud zesílí. Oranžově vidíš místa, kde zeslábl.':showField?'Proud plazmatu míří do řezu ⊗. Oranžová ⊙ značí zeslabení, modrošedá ⊗ zesílení. Vpravo sleduj odklon od původního směru.':'Čtyři maxima patří téže proudové poruše. Stejné fáze ⊙ a ⊗ najdeš v rozvinuté vrstvě.';
}
element('sectionToggle').onclick=()=>{
 const s=parameters(stageValue());
 fieldOverride=!(fieldOverride??(surfaceMix(s.t)<.5));renderSection(s);
};
function draw(){
 const s=parameters(stageValue()),idx=Math.min(6,Math.floor(s.t));
 element('inject').textContent=idx===0?'Nastavit rezonanci':'Vnést poruchu proudu';
 document.querySelectorAll('.stage').forEach((b,i)=>b.classList.toggle('active',i===idx));
 element('txtTitle').textContent=story[idx].title;element('txtBody').textContent=story[idx].body;element('pointBody').textContent=story[idx].key;
 element('stepName').textContent=story[idx].title.split(' · ')[0];
 if(changed('micro',[s.field,s.seed].join()))renderMicro(s);
 updateDetail(s);
 const showTrace=s.intro>=.5;
 element('localTitle').textContent=showTrace?'Výchylka podél siločáry':'Rozvinutá rezonanční vrstva';
 element('fluxFormula').hidden=showTrace;
 element('tracePlot').setAttribute('opacity',s.intro);
 element('layerPlot').setAttribute('opacity',1-s.intro);
 if(s.intro && changed('traceQ',s.q))element('tracePlot').innerHTML=stabilityTrace(s.q);
 if(s.intro<1 && changed('local',[showTrace,idx,s.seed,s.b,s.e,smooth((s.t-4.65)/.4)].join()))renderLocal(s);
 if(showTrace)element('fluxStatus').textContent=s.q<2?'Červené šipky ukazují vratnou sílu od ohybu.':'Výchylka je konstantní. Příspěvek podélného ohybu k vratné síle je nulový.';
 renderSection(s);ensureSpin();
}
let phase3d=0,spinEnabled=true,spinFrameID=0,spinPrevious=0,viewYaw=-1.43,viewPitch=.58,dragStart=null;
function threeDStart(){return 6.72}
function shouldSpin(){return stageValue()>=threeDStart() && spinEnabled && !document.hidden && !sliderDrag}
function animate3d(t){spinFrameID=0;
 if(!shouldSpin()){spinPrevious=0;return}
 if(spinPrevious && t-spinPrevious<40){spinFrameID=requestAnimationFrame(animate3d);return;}
 if(spinPrevious)phase3d+=(Math.min(.08,(t-spinPrevious)/1000))*.38;
 spinPrevious=t;
 renderSection(parameters(stageValue()));
 spinFrameID=requestAnimationFrame(animate3d);
}
function ensureSpin(){
 document.getElementById('spinToggle').hidden=stageValue()<threeDStart();
 if(shouldSpin()&&!spinFrameID){spinPrevious=0;spinFrameID=requestAnimationFrame(animate3d)}
 if(!shouldSpin()&&spinFrameID){cancelAnimationFrame(spinFrameID);spinFrameID=0;spinPrevious=0}
}
let stepFrame=0;
function stop(){cancelAnimationFrame(stepFrame);stepFrame=0;active=false;cancelAnimationFrame(raf);play.textContent='▶ Spustit'}
function tick(time){
 if(!active)return;
 if(!last)last=time;
 const dt=Math.min(.07,(time-last)/1000);last=time;
 // Progress distributed uniformly over visual changes; slightly slower close to reconnection.
 const vel=38-21*smooth((playhead-665)/75)*(1-smooth((playhead-875)/70));
 playhead+=dt*vel;
 if(playhead>=1000){playhead=1000;slider.value='1000.0';draw();stop();return;}
 slider.value=playhead.toFixed(1);draw();raf=requestAnimationFrame(tick);
}
play.addEventListener('click',()=>{if(active){stop();return;}stop();if(parseFloat(slider.value)>=1000)slider.value='0.0';playhead=parseFloat(slider.value);last=0;active=true;play.textContent='❚❚ Pozastavit';raf=requestAnimationFrame(tick)});
reset.addEventListener('click',()=>{stop();fieldOverride=null;slider.value='0.0';draw()});document.getElementById('replay').addEventListener('click',()=>{stop();seekStage(5.30);playhead=parseFloat(slider.value);draw();last=0;active=true;play.textContent='❚❚ Pozastavit';raf=requestAnimationFrame(tick)});slider.addEventListener('pointerdown',()=>{sliderDrag=true;stop();ensureSpin()});slider.addEventListener('pointerup',()=>{sliderDrag=false;draw();ensureSpin()});slider.addEventListener('input',()=>{stop();playhead=parseFloat(slider.value);draw()});
document.getElementById('expandDetail').addEventListener('click',()=>{const el=document.querySelector('.workspace'),btn=document.getElementById('expandDetail');const focused=el.classList.toggle('focus-local');btn.setAttribute('aria-pressed',String(focused));btn.textContent=focused?'⤡ Vrátit zobrazení':'⤢ Rozšířit detail';draw();});
document.getElementById('inject').addEventListener('click',()=>animateToStage(stageValue()<1?1.5:2.6));document.getElementById('spinToggle').addEventListener('click',()=>{spinEnabled=!spinEnabled;document.getElementById('spinToggle').textContent=spinEnabled?'❚❚ Zastavit rotaci':'▶ Roztočit ostrov';draw()});
const cutView=document.getElementById('cut');
cutView.addEventListener('pointerdown',e=>{if(stageValue()<threeDStart())return;dragStart={x:e.clientX,y:e.clientY,yaw:viewYaw,pitch:viewPitch};cutView.classList.add('dragging');cutView.setPointerCapture(e.pointerId)});
cutView.addEventListener('pointermove',e=>{if(!dragStart)return;viewYaw=dragStart.yaw+(e.clientX-dragStart.x)*.007;viewPitch=clamp(dragStart.pitch-(e.clientY-dragStart.y)*.006,-1.25,1.25);renderSection(parameters(stageValue()))});
for(const ev of ['pointerup','pointercancel'])cutView.addEventListener(ev,()=>{dragStart=null;cutView.classList.remove('dragging')});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)ensureSpin()});

function animateToStage(stage){
 stop();
 const from=Number(slider.value),target=betweenKnot(stage,false);
 const crossesContact=Math.min(stage,stageValue())<5.94 && Math.max(stage,stageValue())>5.78;
 const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:
  Math.min(crossesContact?6500:2200,(crossesContact?1800:900)+Math.abs(target-from)*(crossesContact?7:3));
 const start=performance.now();
 function advance(now){
  const progress=duration?clamp((now-start)/duration):1;
  slider.value=from+(target-from)*smooth(progress);draw();
  if(progress<1)stepFrame=requestAnimationFrame(advance);else stepFrame=0;
 }
 advance(start);
}
document.querySelectorAll('.stage').forEach(button=>button.addEventListener('click',()=>animateToStage([0,1.5,2.9,3.8,4.8,5.68,6.4][Number(button.dataset.step)])));
draw();
for(const label of document.querySelectorAll('[data-tex]')){
 katex.render(label.dataset.tex,label);
}