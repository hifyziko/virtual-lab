(()=>{'use strict';
const $=id=>document.getElementById(id),M=SyncIsolated,fmt=(v,n=2)=>v===null?'∞':v.toFixed(n).replace('.',','),math=s=>katex.renderToString(s,{throwOnError:false}),C={R:'#c55d50',L:'#3273b8',C:'#007e6c',selected:'#8661b1',gold:'#ad701b',flux:'#007e6c'};
let loadType='RL',mixedAngle=30,limits={x:1.25,y:2.1},voltageScale=90,currentScale=60;
const lab=(x,y,s,color='#657b82',size=16,w=100)=>'<foreignObject x="'+(x-w/2)+'" y="'+(y-17)+'" width="'+w+'" height="38"><div xmlns="http://www.w3.org/1999/xhtml" class="math-label" style="font-size:'+size+'px;color:'+color+'">'+math(s)+'</div></foreignObject>';
const txt=(x,y,s,color='#657b82',size=12,anchor='middle')=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-family="system-ui" font-size="'+size+'" text-anchor="'+anchor+'">'+s+'</text>';
const path=(d,color,width=1.5,dash='')=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
function arrow(a,b,c,width=1.6){const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy);if(n<.5)return '';const x=dx/n,y=dy/n,h=Math.min(7,n*.4);return path('M'+a+'L'+b+'m'+(-h*x-h*.38*y)+','+(-h*y+h*.38*x)+'L'+b+'l'+(-h*x+h*.38*y)+','+(-h*y-h*.38*x),c,width);}
function params(){const s={};for(const id of ['e','speed','x','r','phi','load']){s[id]=+$(id).value;$(id+'Out').textContent=fmt(s[id],id==='phi'?0:2)+(id==='phi'?'°':'');}s.phi=loadType==='L'?90:loadType==='C'?-90:loadType==='R'?0:loadType==='RC'?-s.phi:s.phi;$('phiOut').textContent=fmt(s.phi,0)+'°';return s;}
function characteristic(s,phi){
 const a=M.solve(s,0,phi),t=phi*Math.PI/180,A=(a.r*Math.cos(t)+a.X*Math.sin(t))/Math.hypot(a.r,a.X),B=Math.abs((a.X*Math.cos(t)-a.r*Math.sin(t))/Math.hypot(a.r,a.X)),pts=[];
 if(B<1e-7){for(let k=0;k<=250;k++){const i=limits.x*k/250,u=1-A*i;if(u>=0)pts.push([i,u]);}return pts;}
 // Circle parametrization includes both branches of the capacitive ellipse.
 const end=A>=0?Math.atan2(B,A):Math.PI-Math.atan2(B,-A);
 for(let k=0;k<=300;k++){const t=end*k/300,i=Math.sin(t)/B,u=Math.cos(t)-A*i;pts.push([i,Math.max(0,u)]);}return pts;
}
function graph(s,a){
 const x=v=>65+480*v/limits.x,y=v=>535-480*v/limits.y;
 const draw=pts=>pts.map((p,i)=>(i?'L':'M')+x(p[0])+','+y(p[1])).join('');
 const resistance=characteristic(s,0),inductive=characteristic(s,90);
 // Shade only the ranges bounded by the ideal load families, with the resistive curve as boundary.
 const base=Array.from({length:181},(_,k)=>{const b=M.solve(s,k/180,0);return [k/180,b.U/b.Eabs];});
 const lower=Array.from({length:181},(_,k)=>{const b=M.solve(s,k/180,90);return [k/180,b.U/b.Eabs];});
 const upper=Array.from({length:181},(_,k)=>{const b=M.solve(s,k/180,-90);return [k/180,b.U/b.Eabs];});
 let h='<defs><clipPath id="chartClip"><rect x="65" y="55" width="480" height="480"/></clipPath></defs><g clip-path="url(#chartClip)">';
 h+='<path d="'+draw(base)+draw([...lower].reverse()).replace(/^M/,'L')+'Z" fill="#e9f1fb"/><path d="'+draw(base)+draw([...upper].reverse()).replace(/^M/,'L')+'Z" fill="#e8f5ef"/>';
 for(let k=0;k<=8;k++){const i=limits.x*k/8,u=limits.y*k/8;h+=path('M'+x(i)+',55V535','#e3eae7',.7)+path('M65,'+y(u)+'H545','#e3eae7',.7);}
 h+=path('M65,'+y(1)+'H545','#94a5a0',1,'5 5');
 for(const [phi,color] of [[90,C.L],[0,C.R],[-90,C.C]])h+=path(draw(characteristic(s,phi)),color,1.7);
 h+=path(draw(characteristic(s,s.phi)),C.selected,2.5);
 h+=path('M'+x(s.load)+',535V'+y(a.U/a.Eabs)+'H65',C.selected,1,'3 5');
 h+='<circle cx="'+x(s.load)+'" cy="'+y(a.U/a.Eabs)+'" r="5.5" fill="'+C.selected+'" stroke="white" stroke-width="2"/></g>';
 h+=arrow([65,535],[558,535],'#748884',1.1)+arrow([65,535],[65,40],'#748884',1.1);
 for(let i=0;i<=1.25;i+=.25)h+=txt(x(i),558,fmt(i),undefined,12);for(let u=0;u<=2;u+=.5)h+=txt(53,y(u)+4,fmt(u),undefined,12,'end');
 h+=lab(554,580,'|I_a|/I_k','#19313b',18,90)+lab(66,20,'U_a/U_{ib}','#19313b',18,115);
 h+=lab(x(.37),y(.36),'R\\! -\\! L','#5984a8',20)+lab(x(.43),y(1.12),'R\\! -\\! C','#5c997f',20);
 h+=lab(x(.98),y(.3),'R',C.R,17,30)+lab(x(.82),y(.10),'L',C.L,17,30)+lab(x(.83),y(1.9),'C',C.C,17,30);
 $('plot').innerHTML=h;
 $('legend').innerHTML=[['R',C.R],['L',C.L],['C',C.C],['Zvolená '+loadType.replace('RL','R–L').replace('RC','R–C'),C.selected]].map(([n,c])=>'<span style="color:'+c+'">'+n+'</span>').join('');
 $('plotNote').textContent='Pevné normalizované osy. Buzení mění skutečné napětí a proud; jejich poměry mohou zůstat stejné. Čárkovaně napětí naprázdno.';
}
function phasor(s,a){
 const o=[167,232],p=(v,k=voltageScale)=>[o[0]-v[1]*k,o[1]-v[0]*k],Ia=a.Ig.map(v=>-v),afterR=[a.E[0]+s.r*Ia[0],a.E[1]+s.r*Ia[1]],zero=[0,0],Ua=[a.U,0];
 let h=arrow([167,296],[167,18],'#a5b4b1',.8)+arrow([316,232],[12,232],'#a5b4b1',.8)+lab(167,10,'\\mathrm{Re}',undefined,14,45)+lab(17,213,'\\mathrm{Im}',undefined,14,45);
 const vectors=[[zero,Ua,'\\overline U_a',C.C,voltageScale],[zero,a.Ui,'\\overline U_i','#243b91',voltageScale],[zero,a.E,'\\overline U_{ib}',C.gold,voltageScale],[zero,Ia,'\\overline I_a',C.L,currentScale],[a.E,afterR,'R_a\\overline I_a','#b56a53',voltageScale],[afterR,Ua,'jX_s\\overline I_a','#7d78ba',voltageScale]];
 const occupied=[],segments=vectors.map(([v,w,,,k])=>[p(v,k),p(w,k)]);
 for(const [from,to,name,color,k] of vectors){
  const start=p(from,k),end=p(to,k),length=Math.hypot(end[0]-start[0],end[1]-start[1]);if(length<1)continue;
  h+=arrow(start,end,color,name.includes('X_s')?1.45:1.8);
  const mid=name.startsWith('j')||name.startsWith('R_')?[(start[0]+end[0])/2,(start[1]+end[1])/2]:end;
  let best;
  for(let j=0;j<24;j++){const ang=j*Math.PI/12,lx=Math.max(40,Math.min(290,mid[0]+31*Math.cos(ang))),ly=Math.max(30,Math.min(288,mid[1]+25*Math.sin(ang)));
   let score=occupied.reduce((v,z)=>v+Math.max(0,67-Math.abs(lx-z[0]))*Math.max(0,29-Math.abs(ly-z[1])),0);
   for(const [v,w] of segments){const dx=w[0]-v[0],dy=w[1]-v[1],t=Math.max(0,Math.min(1,((lx-v[0])*dx+(ly-v[1])*dy)/(dx*dx+dy*dy||1))),dist=Math.hypot(lx-v[0]-t*dx,ly-v[1]-t*dy);score+=Math.max(0,15-dist)**2*6;}score+=j*.05;
   if(!best||score<best.score)best={lx,ly,score};
  }occupied.push([best.lx,best.ly]);h+=lab(best.lx,best.ly,name,color,17,84);
 }
 $('phasor').innerHTML=h;
}
function machine(s,a){
 const theta=Math.atan2(a.E[1],a.E[0]),fa=Math.atan2(-a.Ig[1],-a.Ig[0])-theta+Math.PI/2,Xa=a.X-.15*s.speed;
 const faLength=Xa*a.I/a.Eabs,faVec=[faLength*Math.cos(fa),faLength*Math.sin(fa)],result=[1+faVec[0],faVec[1]];
 const state={...SyncPrinciple.create(),type:'smooth',rotor:0,field:fa,excitation:true,excitationLevel:s.e,damper:false};
 const holder=document.createElementNS('http://www.w3.org/2000/svg','svg');holder.innerHTML=SyncMachineArt(state,false,{axes:false,forces:false},'');
 for(const el of [...holder.children]){if(el.tagName.toLowerCase()==='circle'&&[232,14].includes(+el.getAttribute('r'))||el.tagName.toLowerCase()==='text'&&['523'].includes(el.getAttribute('y')))el.remove();}
 for(const group of holder.querySelectorAll('g'))if(group.querySelector('rect[width="16"]')){for(const el of [...group.children])if(el.tagName.toLowerCase()!=='rect'&&a.I<1e-8)el.remove();}
 let h=holder.innerHTML;
 const center=[280,267],v=(q,k)=>[center[0]+q[0]*k,center[1]-q[1]*k],unit=103;
 // Lengths are in a common flux scale referenced to the present rotor field.
 h+=arrow(center,v([1,0],unit),C.gold,3)+arrow(center,v(faVec,unit),C.L,3)+arrow(center,v(result,unit),C.flux,3);
 // All electrical phasors use the same rotation (pi/2 - angle(Uib)).
 // This preserves the upper diagram phase angles; armature MMF is parallel to current.
 const voltageUnit=82,currentUnit=155;
 const current=[Math.cos(fa)*a.I/a.Ik,Math.sin(fa)*a.I/a.Ik];
 const electrical=[{q:[0,1],scale:voltageUnit,name:'\\overline U_{ib}',color:C.gold,dash:'6 4'},
  {q:[-result[1],result[0]],scale:voltageUnit,name:'\\overline U_i',color:C.flux,dash:'6 4'},
  ...(a.I>1e-8?[{q:current,scale:currentUnit,name:'\\overline I_a',color:C.L,dash:'2 3'}]:[])];
 for(const item of electrical){const tip=v(item.q,item.scale),dx=tip[0]-center[0],dy=tip[1]-center[1],length=Math.hypot(dx,dy);if(length>.5){
  const neck=[tip[0]-dx/length*Math.min(9,length),tip[1]-dy/length*Math.min(9,length)];
  h+='<g data-machine-vector="'+(item.name.includes('I_a')?'current':item.name.includes('ib')?'excitation-voltage':'internal-voltage')+'">'+path('M'+center+'L'+neck,item.color,2.4,item.dash)+arrow(neck,tip,item.color,2.4)+'</g>';
 }}
 const fluxLabels=[{q:[1,0],scale:unit,name:'\\Phi_b',color:C.gold},
  ...(a.I>1e-8?[{q:faVec,scale:unit,name:'\\Phi_a',color:C.L}]:[]),
  {q:result,scale:unit,name:'\\Phi',color:C.flux},...electrical];
 const occupied=[],segments=fluxLabels.map(item=>v(item.q,item.scale));
 for(const item of fluxLabels){
  const tip=v(item.q,item.scale);let best;
  for(const radius of [27,44,64,86])for(let j=0;j<24;j++){
   const angle=j*Math.PI/12,x=Math.max(110,Math.min(450,tip[0]+radius*Math.cos(angle))),y=Math.max(130,Math.min(410,tip[1]+radius*Math.sin(angle)));
   let score=Math.hypot(x-tip[0],y-tip[1]);
   for(const box of occupied)score+=Math.max(0,66-Math.abs(x-box[0]))*Math.max(0,37-Math.abs(y-box[1]))*20;
   for(const b of segments){const dx=b[0]-center[0],dy=b[1]-center[1],t=Math.max(0,Math.min(1,((x-center[0])*dx+(y-center[1])*dy)/(dx*dx+dy*dy||1))),px=center[0]+t*dx,py=center[1]+t*dy;score+=Math.max(0,33-Math.abs(x-px))*Math.max(0,20-Math.abs(y-py))*4;}
   if(!best||score<best.score)best={x,y,score};
  }
  occupied.push([best.x,best.y]);h+=lab(best.x,best.y,item.name,item.color,24,66);
 }
 h+=path('M212,73A206,206 0 0 0 154,105','#6b807a',2)+arrow([162,98],[154,105],'#6b807a',2)+lab(187,68,'\\omega','#6b807a',23,45);
 $('machine').setAttribute('viewBox','25 10 510 510');
 $('machine').innerHTML=h;
 $('reaction').textContent=a.I<1e-8?'Naprázdno: reakce kotvy je nulová.':loadType==='L'?'Induktivní proud působí proti budicímu toku.':loadType==='C'?'Kapacitní proud posiluje budicí tok.':loadType==='R'?'Činná zátěž: reakce kotvy má příčnou i podélnou složku.':loadType==='RL'?'Induktivní složka proudu působí odbuzujícím směrem.':'Kapacitní složka proudu působí přibuzujícím směrem.';
}
function draw(){
 const s=params(),a=M.solve(s);
 $('metrics').innerHTML=[['U_a',a.U],['|I_a|',a.I],['f',a.f],['P_z',a.P],['Q_z',a.Q],['I_k',a.Ik]].map(([n,v])=>'<span>'+math(n)+' <strong>'+fmt(v,n==='f'?1:2)+'</strong>'+(n==='f'?' Hz':'')+'</span>').join('');
 $('loadValues').innerHTML=a.I<1e-8?'Rozpojená zátěž · '+math('|Z_z|\\to\\infty'):math('R_z='+fmt(a.Rload))+'<br>'+math((s.phi<0?'X_C=':'X_L=')+fmt(Math.abs(a.Xload)))+' <span class="small">(p. j.)</span>';
 $('status').textContent=a.I<1e-8?'Naprázdno':Math.abs(s.phi)<1e-8?'Čistě odporová zátěž':s.phi>0?'Induktivní zátěž · jalový výkon ze stroje':'Kapacitní zátěž · jalový výkon do stroje';
 $('equation').innerHTML=math('\\textcolor{'+C.gold+'}{\\overline U_{ib}}=\\textcolor{'+C.C+'}{\\overline U_a}-(R_a+jX_s)\\textcolor{'+C.L+'}{\\overline I_a}');
 $('powerEquation').innerHTML=math(s.r<1e-8?'1=i^2+u^2+2iu\\sin\\varphi':'1=i^2+u^2+2iu\\,{R_a\\cos\\varphi+X_s\\sin\\varphi\\over\\sqrt{R_a^2+X_s^2}}');
 graph(s,a);phasor(s,a);machine(s,a);
 window.isolatedState={params:s,state:a,loadType,limits:{...limits},voltageScale,currentScale};window.explorerState={kind:'isolated',params:s,state:a};
}
function choose(type){if(['RL','RC'].includes(loadType))mixedAngle=+$('phi').value;loadType=type;$('phi').value=type==='R'?0:['L','C'].includes(type)?90:mixedAngle;for(const b of document.querySelectorAll('[data-load]'))b.setAttribute('aria-pressed',String(b.dataset.load===type));$('phi').disabled=['R','L','C'].includes(type);draw();}
document.querySelectorAll('[data-load]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.load)));
document.querySelectorAll('input').forEach(el=>el.addEventListener('input',draw));
$('reset').onclick=()=>{for(const [id,v] of Object.entries({e:1.15,speed:1,x:1,r:0,phi:30,load:.5}))$(id).value=v;limits={x:1.25,y:2.1};voltageScale=90;currentScale=60;choose('RL');};
$('rescale').onclick=()=>{const s=params(),a=M.solve(s);const ext=[a.E,a.Ui,[a.U,0]];voltageScale=Math.min(90,125/Math.max(.1,...ext.map(v=>Math.abs(v[1]))),190/Math.max(.1,...ext.map(v=>Math.abs(v[0]))));currentScale=Math.min(60,60/Math.max(a.I,.1));limits={x:1.25,y:2.1};draw();};
document.querySelectorAll('[data-math]').forEach(el=>el.innerHTML=math(el.dataset.math));
draw();
})();
