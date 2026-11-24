const xy=p=>p.slice(0,2).map(x=>x.toFixed(2)).join(',');const path=(ps,stroke=blue,w=2,fill='none',close=false,extra='')=>`<path d="M${ps.map(xy).join('L')}${close?'Z':''}" stroke="${stroke}" stroke-width="${w}" fill="${fill}" ${extra}/>`;const sample=(N,fn)=>Array.from({length:N+1},(_,i)=>fn(i/N));function arrow(a,b,color=orange,w=2){let dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<1)return '';let ux=dx/l,uy=dy/l,h=Math.min(9,l*.5);const side=(back,width)=>[b[0]-back*ux-width*uy,b[1]-back*uy+width*ux];const width=Math.min(4,h*.7);return path([side(l,w/2),side(h,w/2),side(h,width),b,side(h,-width),side(h,-w/2),side(l,-w/2)],'none',0,color,true)}
function mix(v){let a=clamp(Math.abs(v),0,1),c=v>=0?[232,190,145]:[157,193,231],b=[244,247,248];return `rgb(${b.map((x,i)=>Math.round(x+(c[i]-x)*a)).join(',')})`}
function sheet(id,along){
 const A=amp(),p=(u,v,h)=>[104+412*u+92*(v-.5),158-112*(v-.5)+20*(u-.5)-h], phase=(u,v)=>along?v:u,z=(u,v)=>A*49*Math.cos(TAU*phase(u,v));let out='';
 const P=(u,v)=>p(u,v,z(u,v)),track=t=>[t,.5];
 const reference=sample(100,t=>p(t,.5,0));
 const base=[p(0,0,0),p(1,0,0),p(1,1,0),p(0,1,0)];
 out+=path(base,ref,1,'#f4f7f9',true,'opacity=".55" stroke-dasharray="5 5"');
 // Identical local field and camera, with the displacement pattern rotated by 90 degrees.
 for(let i=99;i>=0;i--){let a=i/100,b=(i+1)/100;let pts=along?[P(0,a),P(1,a),P(1,b),P(0,b)]:[P(a,0),P(b,0),P(b,1),P(a,1)];out+=path(pts,'none',0,mix(.4*A*Math.cos(TAU*(a+b)/2)),true)}
 for(let v of [0,1])out+=path(sample(120,u=>P(u,v)),'#9db2bf',1.2);for(let u of [0,1])out+=path(sample(120,v=>P(u,v)),'#9db2bf',1.2);
 if(A>.015)out+=path(base,ref,1,'none',true,'stroke-dasharray="5 5" opacity=".62"');
 for(let j=0;j<=6;j++){if(j===3)continue;let v=j/6;out+=path(sample(120,u=>P(u,v)),blue,1.8,'none',false,'opacity=".82"');out+=arrow(P(.53,v),P(.60,v),blue,1.3)}
 if(A>.015)out+=path(reference,ref,1.6,'none',false,'stroke-dasharray="5 5" opacity=".95"');
 out+=path(sample(120,t=>P(t,.5)),purple,3.8);
 // Two additional material points expose how neighbouring field lines move.
 if(A>.015)for(const v of [1/6,5/6]){let old=p(.5,v,0),now=P(.5,v);out+=`<circle cx="${old[0]}" cy="${old[1]}" r="3.5" fill="white" stroke="${ref}" stroke-width="1.3"/>`+arrow(old,now,orange,1.9)+`<circle cx="${now[0]}" cy="${now[1]}" r="4" fill="${blue}" stroke="white" stroke-width="1.4"/>`;}
 const marks=[.12,.5,.88].map((t,i)=>({i,old:p(t,.5,0),now:P(t,.5),d:z(t,.5)}));
 for(const {i,old,now} of marks){if(A>.015){out+=`<circle cx="${old[0]}" cy="${old[1]}" r="4" fill="white" stroke="${ref}" stroke-width="1.4"/>`+arrow(old,now,orange,2.5)}out+=`<circle cx="${now[0]}" cy="${now[1]}" r="5" fill="${purple}" stroke="white" stroke-width="1.8"/>`+txt(now[0],now[1]-10,String(i+1),'middle','style="fill:#8743b1;font-weight:700;paint-order:stroke;stroke:white;stroke-width:4px"');}
 out+=txt(320,24,'Stejný směr původního magnetického pole','middle','font-weight="600"');
 out+=txt(320,44,along?'Zkušební posun se mění NAPŘÍČ siločárami.':'Zkušební posun se mění PODÉL siločar.','middle');
 out+=arrow([103,263],[194,267],blue,2)+txt(203,272,'Směr původního pole','start','style="font-size:12px"');
 out+=arrow([450,272],[450,248],orange,2)+txt(459,264,'Výchylka','start','style="font-size:12px"');
 out+=`<rect x="24" y="292" width="592" height="97" rx="8" fill="#f8fafc" stroke="#d7dfe4"/>`;
 out+=txt(40,311,'Fialová siločára z boku: původní a nová poloha','start','font-weight="600"');
 const Y=346,X=t=>66+508*t,YY=t=>Y-z(t,.5)*.36;
 out+=path([[X(0),Y],[X(1),Y]],ref,1.4,'none',false,'stroke-dasharray="4 4"');
 out+=path(sample(100,t=>[X(t),YY(t)]),purple,2.4);
 for(const {i,d} of marks){let x=X([.12,.5,.88][i]),yy=Y-d*.36;out+=`<circle cx="${x}" cy="${Y}" r="3.8" fill="white" stroke="${ref}" stroke-width="1.4"/>`;if(A>.015)out+=arrow([x,Y],[x,yy],orange,2.3);out+=`<circle cx="${x}" cy="${yy}" r="5" fill="${purple}" stroke="white" stroke-width="1.5"/>`+txt(x+11,yy-4,String(i+1),'start','style="fill:#8743b1;font-weight:700;paint-order:stroke;stroke:white;stroke-width:3px"');}
 out+=txt(320,381,A<.015?'Všechny body jsou zatím v rovnovážné poloze.':along?'Všechny tři body se posunuly stejně.':'Body 1 a 3 nahoru, bod 2 dolů.','middle','font-weight="600"');
 $(id).innerHTML=out;
}

function plasmaPreview(id,along){
 const A=amp(),R=2.30,r=.83,S=40,ya=-.55,pi=.60,cy=Math.cos(ya),sy=Math.sin(ya),cp=Math.cos(pi),sp=Math.sin(pi),q0=2.2,phi0=-.98,theta0=.95,du=1.48,dv=1.50;
 const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
 const taper=x=>{let d=Math.abs(x-.5);return d<=.5?1:d>=.85?0:.5*(1+Math.cos(Math.PI*(d-.5)/.35))};
 const uv=(th,ph)=>{let f=wrap(ph-phi0);return [.5+f/du,.5+wrap(th-theta0-f/q0)/dv]};
 const disp=(th,ph)=>{let [u,v]=uv(th,ph);return .31*A*taper(u)*taper(v)*Math.cos(TAU*(along?v:u))};
 const p=(th,ph,dr=0)=>{let rr=r+dr,X=(R+rr*Math.cos(th))*Math.cos(ph),Y=(R+rr*Math.cos(th))*Math.sin(ph),Z=rr*Math.sin(th),x=X*cy-Y*sy,y=X*sy+Y*cy;return [175+S*x,87-S*(y*sp+Z*cp),-y*cp+Z*sp]};
 const coords=(u,v)=>[theta0+du*(u-.5)/q0+dv*(v-.5),phi0+du*(u-.5)];
 const pp=(u,v,old=false,lift=0)=>{let [th,ph]=coords(u,v);return p(th,ph,(old?0:disp(th,ph))+lift)};
 const pieces=[];
 function tile(points,color){
  pieces.push({z:points.reduce((sum,p)=>sum+p[2],0)/points.length,markup:path(points,color,.5,color,true)});
 }
 const shade=(th,base)=>'rgb('+base.map(c=>Math.round(c*(.83+.17*Math.cos(th-.85)))).join(',')+')';
 const U=88,V=56;
 for(let i=0;i<U;i++)for(let j=0;j<V;j++){
  const f=TAU*i/U,g=TAU*(i+1)/U,t=TAU*j/V,h=TAU*(j+1)/V;
  tile([[t,f],[t,g],[h,g],[h,f]].map(([th,ph])=>p(th,ph,disp(th,ph))),shade((t+h)/2,[218,232,240]));
 }
 let out=pieces.sort((a,b)=>a.z-b.z).map(a=>a.markup).join('');
 pieces.length=0;
 // Align the coloured surface mesh with the four edges of the selected patch.
 for(let i=0;i<48;i++)for(let j=0;j<24;j++){
  const u=i/48,v=j/24,u1=(i+1)/48,v1=(j+1)/24;
  const th=coords((u+u1)/2,(v+v1)/2)[0];
  const w=.35*A*Math.cos(Math.PI*(along?v+v1:u+u1)),tint=w>=0?[234,189,151]:[151,183,224];
  const color=shade(th,[196,164,222].map((c,k)=>c+(tint[k]-c)*Math.abs(w)));
  tile([pp(u,v),pp(u1,v),pp(u1,v1),pp(u,v1)],color);
 }
 out+=pieces.sort((a,b)=>a.z-b.z).map(a=>a.markup).join('');
 if(A>.01){
  const dashed='stroke-dasharray="3 3" opacity=".85"';
  for(const v of [0,.5,1])out+=path(sample(96,u=>pp(u,v,true)),ref,1.2,'none',false,dashed);
  for(const u of [0,1])out+=path(sample(72,v=>pp(u,v,true)),ref,1.2,'none',false,dashed);
 }
 // The fixed front view shows the patch. Stroke each curve once over its surface.
 for(const v of [0,1/6,2/6,.5,4/6,5/6,1])out+=path(sample(120,u=>pp(u,v)),v===.5?purple:'#7c69a1',v===.5?2.5:1.05);
 for(const u of [0,1])out+=path(sample(96,v=>pp(u,v)),purple,1.2);
 for(let [i,u] of [.12,.5,.88].entries()){
  let a=pp(u,.5,true),b=pp(u,.5);if(A>.01)out+=`<circle cx="${a[0]}" cy="${a[1]}" r="3" fill="white" stroke="${ref}" stroke-width="1"/>`+arrow(a,b,orange,2.2);
  out+=`<circle cx="${b[0]}" cy="${b[1]}" r="3.5" fill="${purple}" stroke="white" stroke-width="1.4"/>`+txt(b[0]+(i===0?-9:i===2?9:0),b[1]-9,String(i+1),'middle','style="font-size:11px;fill:#8743b1;font-weight:700;paint-order:stroke;stroke:white;stroke-width:3px"');
 }
 out+=txt(9,13,A<.01?'Rovnovážná poloha':'Zkušební radiální výchylka','start','style="font-size:11px;font-weight:600"');
 $(id).innerHTML=out;
}

function renderSlice(id,Q,turns){
 const A=amp(),f=probeAngle(turns),t=f/Q,phase=((f%TAU)+TAU)%TAU,r=.89,scale=83,disp=th=>.19*A*Math.cos(m*th-n*f),P=(th,d=0)=>[110+scale*(r+d)*Math.cos(th),110-scale*(r+d)*Math.sin(th)];
 let out='';
 out+=path([[15,110],[205,110]],'#e4eaf0',1)+path([[110,15],[110,205]],'#e4eaf0',1);
 out+=path(sample(180,u=>P(u*TAU,disp(u*TAU))),'#31856e',2.1,'#eef5f3',true);
 for(let i=0;i<160;i++){let a=i*TAU/160,b=(i+1)*TAU/160,v=disp((a+b)/2);if(Math.abs(v)>1e-7)out+=path([P(a),P(a,disp(a)),P(b,disp(b)),P(b)],'none',0,v>0?'#e8be91':'#9dc1e7',true,'opacity=".8"');}
 out+=path(sample(140,u=>P(u*TAU)),ref,1.5,'none',true,'stroke-dasharray="4 4"');
 out+=path(sample(180,u=>P(u*TAU,disp(u*TAU))),'#31856e',2,'none',true);
 out+=`<circle cx="110" cy="110" r="2.6" fill="#536b7d"/>`;
 const old=P(t),pt=P(t,disp(t));out+=`<circle cx="${old[0]}" cy="${old[1]}" r="3" fill="white" stroke="${ref}" stroke-width="1.3"/>`+arrow(old,pt,orange,2.2)+`<circle cx="${pt[0]}" cy="${pt[1]}" r="5" class="probeDot"/>`;
 if(A===0)out+=path(sample(180,u=>P(u*TAU)),ref,1.3,'none',true,'stroke-dasharray="4 4"');
 const radialForce=-A*(m/Q-n)**2*Math.cos(m*t-n*f);
 showSliceForce('sliceForce',Math.abs(radialForce));
 const arrowLength=19*radialForce/Math.max(1,(m/Q-n)**2);
 out+=arrow(pt,[pt[0]+arrowLength*Math.cos(t),pt[1]-arrowLength*Math.sin(t)],'#ba354b',2);
 const label=P(t,.19+.085);out+=txt(Math.max(9,Math.min(211,label[0])),Math.max(12,Math.min(215,label[1]+4)),'P','middle','class="probeLabel"');
 $(id+'Slice').innerHTML=out;setMath($(id+'SliceAngle'), String.raw`\varphi=${numberTex(phase*180/Math.PI,0)}^\circ`);
}
function toroidalTick(index,turns){
 const multiples=index*turns/Math.min(turns,2);
 if(!multiples)return '0';
 return multiples===1?'π':multiples+'π';
}
function map(id="map",Q=q(),turns=2){const bounds=$(id).getBoundingClientRect();
 const width=640, height=bounds.width>0?Math.max(160,Math.round(width*bounds.height/bounds.width)):235;
 let A=amp(),L=58,T=18,W=548,H=height-T-43,X=f=>L+W*f/(turns*TAU),Y=t=>T+H*(1-t/TAU),out=`<defs><clipPath id="${id}Clip"><rect x="${L}" y="${T}" width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#${id}Clip)"><rect x="${L}" y="${T}" width="${W}" height="${H}" fill="#f4f7f8"/>`;
// Exact phase direction in screen coordinates. Continuous periodic SVG gradient.
const ax=turns*TAU*n/W,ay=TAU*m/H,k2=ax*ax+ay*ay;
const stops=Array.from({length:129},(_,i)=>`<stop offset="${i/128}" stop-color="${mix(A*Math.cos(TAU*i/128))}"/>`).join('');
out+=`<defs><linearGradient id="${id}Phase" gradientUnits="userSpaceOnUse" x1="${L}" y1="${T}" x2="${L+TAU*ax/k2}" y2="${T+TAU*ay/k2}" spreadMethod="repeat" color-interpolation="sRGB">${stops}</linearGradient></defs><rect x="${L}" y="${T}" width="${W}" height="${H}" fill="url(#${id}Phase)"/>`;
for(let i=0;i<=4;i++){let x=L+i*W/4;out+=path([[x,T],[x,T+H]],'#fff',1,'none',false,'opacity=".8"')}
if(A>0)for(let k=-turns*n;k<=m;k++){const th=f=>(n*f+TAU*k)/m;out+=path([[X(0),Y(th(0))],[X(turns*TAU),Y(th(turns*TAU))]],'#a45c25',2,'none',false,'stroke-dasharray="5 4" opacity=".95"');}
for(let j=0;j<5;j++){let t0=TAU*j/5;for(let k=-1;k<=Math.ceil(turns/Q)+1;k++){let a=Math.max(0,Q*(k*TAU-t0)),b=Math.min(turns*TAU,Q*((k+1)*TAU-t0));if(b<=a)continue;let ps=[[X(a),Y(t0+a/Q-k*TAU)],[X(b),Y(t0+b/Q-k*TAU)]];out+=path(ps,j===0?purple:'#6885ae',j===0?3:1.1,'none',false,j===0?'':'opacity=".6"');if(j===0&&b-a>.55){let f=(a+b)/2;out+=arrow([X(f-.12),Y(t0+(f-.12)/Q-k*TAU)],[X(f+.12),Y(t0+(f+.12)/Q-k*TAU)],purple,2)}}}
let f=turns*TAU*(+$('probe').value/100),t=((f/Q)%TAU+TAU)%TAU;out+=`<circle cx="${X(f)}" cy="${Y(t)}" r="5.5" class="probeDot"/>`;out+='</g>'+txt(X(f)+9,Math.max(T+12,Y(t)-9),'P','start','class="probeLabel"')+path([[L,T],[L+W,T],[L+W,T+H],[L,T+H]],'#9db2bf',1,'none',true);for(let i=0;i<=Math.min(2*turns,4);i++)out+=txt(L+i*W/Math.min(2*turns,4),T+H+17,toroidalTick(i,turns),'middle','class="axis"');for(let j=0;j<=2;j++)out+=txt(L-9,Y(j*Math.PI)+4,['0','π','2π'][j],'end','class="axis"');out+=txt(332,T+H+38,'Toroidální úhel φ','middle','class="axis"')+txt(16,T+H/2,'Poloidální úhel θ','middle',`transform="rotate(-90 16 ${T+H/2})" class="axis"`);$(id).setAttribute('viewBox',`0 0 640 ${T+H+43}`);$(id).innerHTML=out;}
function trace(id="trace",Q=q(),turns=2){
 const svg=$(id), bounds=svg.getBoundingClientRect();
 const height=bounds.width && bounds.height ? Math.max(115,Math.round(640*bounds.height/bounds.width)) : 150;
 const left=58,width=548,top=24,bottom=height-39,half=(bottom-top)/2,center=top+half;
 const amplitude=amp(),detuning=m/Q-n,intervals=Math.min(2*turns,4);
 const displacement=t=>amplitude*Math.cos(detuning*turns*TAU*t);
 const X=t=>left+width*t, Y=xi=>center-half*xi;
 let out=txt(left,15,'Relativní radiální výchylka ξᵣ/Amax','start','class="axis"');
 for(const [value,label] of [[1,'+1'],[0,'0'],[-1,'−1']]){
  out+=path([[left,Y(value)],[left+width,Y(value)]],'#b9c8d2',1,'none',false,'stroke-dasharray="4 4"');
  out+=txt(left-8,Y(value)+4,label,'end','class="axis"');
 }
 for(let i=0;i<=intervals;i++){
  const x=X(i/intervals);
  out+=path([[x,top],[x,bottom]],'#e4eaf0',1)+txt(x,bottom+17,toroidalTick(i,turns),'middle','class="axis"');
 }
 out+=path(sample(400,t=>[X(t),Y(displacement(t))]),purple,3);
 const f=Number($('probe').value)/100,px=X(f),py=Y(displacement(f));
 out+=path([[px,top],[px,bottom]],purple,1,'none',false,'stroke-dasharray="3 4" opacity=".6"')+
  `<circle cx="${px}" cy="${py}" r="5.5" class="probeDot"/>`+txt(px+9,Math.max(top+12,py-9),'P','start','class="probeLabel"');
 if(id==='trace'||id==='traceB'){
  const scale=20/Math.max(1,(m/q()-n)**2);
  for(let i=1;i<16;i++){
   const t=i/16,xi=displacement(t),dy=detuning*detuning*xi*scale;
   if(Math.abs(dy)>1.2)out+=arrow([X(t),Y(xi)],[X(t),Y(xi)+dy],'#ba354b',2.1);
  }
 }
 out+=txt(X(.5),height-5,'Toroidální úhel podél siločáry φ','middle','class="axis"');
 svg.setAttribute('viewBox','0 0 640 '+height);svg.innerHTML=out;
}
// Local straight-field model: x=l/R0≈phi, y=xi/R0. The same section and
// graphical scaling are used on both sides. T is a prescribed constant tension.
function segmentForces(Q,A,h){
 const D=m/Q-n,a=.19/2.55*A;
 const slope=a*D*Math.sin(D*h), norm=Math.hypot(1,slope);
 // Screen coordinates: +y points towards the equilibrium plane at the crest.
 const left=[-1/norm,slope/norm],right=[1/norm,slope/norm];
 return {D,a,left,right,sum:[left[0]+right[0],left[1]+right[1]],fhat:A*D*D};
}
function forceDetail(id,Q){
 const A=amp(),other=Math.abs(m/q()-n),h=Math.min(1.5,.8/Math.max(other,1e-9));
 const refF=segmentForces(q(),A,h), F=segmentForces(Q,A,h);
 const magn=Math.min(40,.25/Math.max(Math.abs(refF.left[1]),1e-9));
 const red='#ba354b',teal='#27776f', ink='#273e49';
 const iszero=Math.abs(F.sum[1])<1e-12;
 const xscale=91/h, yscale=xscale*magn;
 const P=u=>[157+xscale*u,52+yscale*F.a*(1-Math.cos(F.D*u))];
 const l=P(-h),r=P(h),mid=P(0);
 const vec=(p,v,S)=>[p[0]+S*v[0],p[1]+S*magn*v[1]];
 const label=(x,y,t,col=ink,anchor='middle')=>txt(x,y,t,anchor,`style="fill:${col};font-size:12px;font-weight:600"`);
 const va=(p,v,S,col,w=2.3)=>{let e=vec(p,v,S),d=Math.hypot(e[0]-p[0],e[1]-p[1]);return d<.8?'':arrow(p,e,col,w)};
 let out=txt(157,15,'Magnetický tah na koncích úseku','middle','font-weight="600"')+txt(480,15,'Vektorový součet: T₁ + T₂','middle','font-weight="600"');
 out+=path([[320,25],[320,151]],'#dce5ec',1);
 out+=path(sample(100,t=>P((2*t-1)*1.34*h)),purple,2.1)+path(sample(80,t=>P((2*t-1)*h)),purple,4.4);
 for(const [p,v,k] of [[l,F.left,'T₁'],[r,F.right,'T₂']]){
  const e=vec(p,v,39);out+=va(p,v,39,teal)+`<circle cx="${p[0]}" cy="${p[1]}" r="3.3" fill="white" stroke="${purple}" stroke-width="1.5"/>`+label(e[0],e[1]+17,k,teal);
 }
 out+=`<circle cx="${mid[0]}" cy="${mid[1]}" r="3.5" fill="${purple}"/>`;
 if(!iszero)out+=va(mid,F.sum,39,red,3)+label(mid[0]+11,mid[1]+Math.max(17,39*magn*F.sum[1]+13),'F',red,'start');
 else out+=label(157,82,'F = 0',red);
 out+=txt(157,126,'T₁ na levém konci, T₂ na pravém','middle','style="font-size:12px"')+txt(157,143,'Červeně výsledná síla F','middle','style="font-size:12px"');
 // Head-to-tail triangle: one affine scale for ALL vectors, both cases.
 const o=[535,40],v1=vec(o,F.left,126),v2=vec(v1,F.right,126);
 out+=path([[390,40],[566,40]],ref,1,'none',false,'stroke-dasharray="4 4"');
 if(iszero){out+=va(o,F.left,126,teal,3)+va([v1[0],v1[1]+.01],F.right,126,teal,1.7);out+=label(473,30,'T₁ ←',teal)+label(473,60,'→ T₂',teal)+label(535,83,'F = 0',red);}
 else{
  out+=va(o,F.left,126,teal)+va(v1,F.right,126,teal)+va(o,F.sum,126,red,3);
  out+=label((o[0]+v1[0])/2,(o[1]+v1[1])/2-10,'T₁',teal)+label((v1[0]+v2[0])/2,(v1[1]+v2[1])/2+16,'T₂',teal)+label(546,(o[1]+v2[1])/2+4,'F',red,'start');
 }
 out+=`<circle cx="${o[0]}" cy="${o[1]}" r="3" fill="${ink}"/>`;
 out+=txt(480,126,'Příčné měřítko zvětšeno '+fmt(magn,1)+'×','middle','style="font-size:12px"')+txt(480,143,'Stejné měřítko pro A i B','middle','style="font-size:12px"');
 $(id).innerHTML=out;
 setMath($('forceVal'+id.slice(-1)), String.raw`F/T=${numberTex(Math.abs(F.sum[1]),4)}`);
}
function galleryDrawing(M,A){let out=txt(155,181,'Poloidální řez při φ = 0','middle','font-weight="600"');const C=[155,235],p=(t,dr)=>[C[0]+(38+dr)*Math.cos(t),C[1]-(38+dr)*Math.sin(t)];out+=path(sample(120,t=>p(TAU*t,0)),ref,1.4,'none',true,'stroke-dasharray="4 3"');out+=path(sample(160,t=>p(TAU*t,(38*.19/.89)*A*Math.cos(M*TAU*t))),purple,2.2,'#8743b10b',true);if(A>0)for(let k=0;k<M;k++){let t=TAU*k/M,pt=p(t,(38*.19/.89)*A);out+=`<circle cx="${pt[0]}" cy="${pt[1]}" r="3.5" fill="#a45c25" stroke="white" stroke-width="1"/>`;}
 if(A===0)out+=path(sample(160,t=>p(TAU*t,0)),ref,1.1,'none',true,'stroke-dasharray="4 3"');out+=txt(155,290,A===0?'Bez výchylky':`${M} ${M===1?'maximum':M<5?'maxima':'maxim'} výchylky v řezu`,'middle');return out;}
