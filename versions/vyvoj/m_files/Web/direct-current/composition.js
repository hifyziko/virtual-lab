/* NPTEL Electrical Machines I, fig.23: MMF sources; shared linear teaching transfer to B. */
(()=>{'use strict';
const T=2*Math.PI,colors=['#a76914','#346fc0','#bf5849','#ad365d'],names=['Buzení','Kotva','Kompenzace','Pomocné póly'],symbols=['B_b','B_a','B_{\\mathrm{komp}}','B_{\\mathrm{pp}}'];
const text=(x,y,t,c='#536972',size=16)=>`<text x="${x}" y="${y}" fill="${c}" font-family="Segoe UI,sans-serif" font-size="${size}">${t}</text>`;
const line=(x,y,X,Y,c,d='')=>`<path d="M${x} ${y}L${X} ${Y}" fill="none" stroke="${c}" stroke-width="1.3" stroke-dasharray="${d}"/>`;
let INTERPOLE_GAIN=1;
const INTERPOLE_HALF_WIDTH=DCGeometry.interpoleHalfArc+DCGeometry.interpoleFringeAngle;
// Balance the fixed, compensated machine at its geometric neutral. Do not
// silently retune with brush shift or disabled windings.
const NUMERICAL_INTERPOLE_GAIN=(()=>{const at=c=>DCVisual.gapCurve(c)(Math.PI/4);return -(at([0,1,0,0])+at([0,0,DCCompensation.comp,0]))/at([0,0,0,DCCompensation.inter]);})();
const num=x=>x.toFixed(Math.abs(x)>0&&Math.abs(x)<.1?4:2).replace('.','{,}');
// Integrate the current sheets before converting MMF to induction (NPTEL fig.23).
// Armature conductors occupy the whole circumference. Compensation conductors
// occupy only the pole arc: its MMF is flat, NOT zero, between the pole shoes.
// One rotor-slot pitch is the illustrative commutation interval (not a measured brush width).
const COMMUTATION_HALF_WIDTH=Math.PI/DCGeometry.slots;
const COMMUTATION_FRACTION=COMMUTATION_HALF_WIDTH/(Math.PI/4);
function armatureTriangle(a){
 const q=2/Math.PI*Math.asin(Math.sin(2*a)),u=Math.abs(q),h=COMMUTATION_FRACTION;
 // Integral of a current-free commutation belt: constant MMF plateau.
 return Math.sign(q)*Math.min(u,1-h);
}
function armatureCurrent(a){
 const k=Math.round((a-Math.PI/4)/(Math.PI/2)),delta=a-(Math.PI/4+k*Math.PI/2);
 return Math.abs(delta)<=COMMUTATION_HALF_WIDTH?0:(k%2?-1:1)*Math.sign(-delta);
}
function idealMMF(a,brush=0){
 const triangle=x=>2/Math.PI*Math.asin(Math.sin(2*x)),q=triangle(a),alpha=DCGeometry.poleArcRatio;
 return [-armatureTriangle(a-brush),Math.max(-alpha,Math.min(alpha,q))];
}
function interpoleProfile(a){
 const k=Math.round((a-Math.PI/4)/DCGeometry.polePitch),distance=Math.abs(a-(Math.PI/4+k*DCGeometry.polePitch));
 const inner=Math.max(0,DCGeometry.interpoleHalfArc-DCGeometry.interpoleFringeAngle),outer=INTERPOLE_HALF_WIDTH;
 const t=Math.max(0,Math.min(1,(distance-inner)/(outer-inner)));
 return (k%2?-1:1)*.5*(1+Math.cos(Math.PI*t));
}
// Effective gap permeance, common to every winding. Dimensions come from geometry.
const FRINGE_WIDTH=DCGeometry.interpoleFringeAngle;
function poleCoverage(a){
 const distance=Math.abs(a-Math.round(a/DCGeometry.polePitch)*DCGeometry.polePitch);
 const t=Math.max(0,Math.min(1,(distance-DCGeometry.poleHalfArc)/FRINGE_WIDTH));
 return 1-t*t*(3-2*t);
}
function gapPermeance(a){
 const G=DCGeometry,background=G.gap/(G.yoke-G.rotor);
 return background+(1-background)*poleCoverage(a)
  +(G.gap/(G.interpoleFaceRadius-G.rotor)-background)*Math.abs(interpoleProfile(a));
}
// Same positive, normalized compact kernel for all sources; no winding-specific B curves.
// Averaging represents fringing, not a finite-element solution.
const transferCache=new Map();
function sampledParts(a,brush=0){
 const key=a+':'+brush;if(transferCache.has(key))return transferCache.get(key);
 const out=[0,0,0,0],left=a-FRINGE_WIDTH,right=a+FRINGE_WIDTH;
 // Split integration at MMF jumps: moving a quadrature node across a pole edge
 // must not add a finite step to B. Integrate each smooth segment separately.
 const edges=[left,right],pitch=DCGeometry.polePitch;
 for(let k=Math.floor(left/pitch)-1;k<=Math.ceil(right/pitch)+1;k++){
  for(const edge of [k*pitch-DCGeometry.poleHalfArc,k*pitch+DCGeometry.poleHalfArc,
   k*pitch+Math.PI/4-DCGeometry.interpoleHalfArc,k*pitch+Math.PI/4+DCGeometry.interpoleHalfArc])
   if(edge>left&&edge<right)edges.push(edge);
 }
 edges.sort((x,y)=>x-y);
 const nodes=[.1834346424956498,.525532409916329,.7966664774136267,.9602898564975363];
 const weights=[.362683783378362,.3137066458778873,.2223810344533745,.1012285362903763];
 for(let i=1;i<edges.length;i++){
  const mid=(edges[i]+edges[i-1])/2,half=(edges[i]-edges[i-1])/2;
  for(let j=0;j<4;j++)for(const sign of [-1,1]){
   const x=mid+sign*half*nodes[j];
   const weight=half*weights[j]*(1+Math.cos(Math.PI*(x-a)/FRINGE_WIDTH))/(2*FRINGE_WIDTH);
   const f=mmfParts(x,brush),lambda=gapPermeance(x);
   for(let k=0;k<4;k++)out[k]+=weight*lambda*f[k];
  }
 }
 if(transferCache.size>24000)transferCache.clear();transferCache.set(key,out);return out;
}
// Interpolate a fixed angular grid so moving probes and root finding see continuous B.
function idealParts(a,brush=0){
 const step=Math.PI/720,u=((a%T)+T)%T/step,i=Math.floor(u),t=u-i;
 const lo=sampledParts(i*step,brush),hi=sampledParts(((i+1)%1440)*step,brush);
 return lo.map((v,k)=>v+(hi[k]-v)*t);
}
// Ideal concentrated interpole excitation: rectangular MMF over the pole face.
// Fringing belongs to the induction profile, not to this MMF teaching shape.
function interpoleMMFProfile(a){
 const k=Math.round((a-Math.PI/4)/DCGeometry.polePitch),distance=Math.abs(a-(Math.PI/4+k*DCGeometry.polePitch));
 return distance<=DCGeometry.interpoleHalfArc+1e-12?(k%2?-1:1):0;
}
function mmfParts(a,brush=0){
 const [arm,comp]=idealMMF(a,brush);
 // NPTEL fig.23: main MMF is supported on the main pole face.
 const distance=Math.abs(a-Math.round(a/DCGeometry.polePitch)*DCGeometry.polePitch);
 const main=distance<=DCGeometry.poleHalfArc+1e-12?-Math.sign(Math.cos(2*a)):0;
 return [main,.6*arm,.6*comp,(.6*(1-COMMUTATION_FRACTION-DCGeometry.poleArcRatio))*interpoleMMFProfile(a)*INTERPOLE_GAIN];
}
// Calibrate once in the fixed geometry, using the same B transfer as the graph.
// This lesson cancels armature reaction, without an invented reactance-voltage excess.
{
 const p=idealParts(Math.PI/4,0);
 INTERPOLE_GAIN=-(p[1]+p[2])/p[3];
 transferCache.clear();
}
const quantitySymbol=s=>s.quantity==='mmf'?'F':'B';
function model(s){
 const weights=[s.flux,s.current,s.current,s.current].map((v,k)=>v*s.gains[k]);
 const brush=(s.brush||0)*Math.PI/180;
 const mmf=s.quantity==='mmf',shape=mmf?mmfParts:idealParts;
 const parts=weights.map((v,k)=>a=>v*shape(a,brush)[k]),linear=a=>parts.reduce((v,fn)=>v+fn(a),0);
 const knee=Math.abs(weights[0]),headroom=Math.max(.08,knee*.18);
 // Illustrative saturation of reinforced pole tips, not a material B(H) curve.
 const total=a=>{const b=linear(a);return !mmf&&s.saturation&&knee>1e-9&&Math.abs(b)>knee?Math.sign(b)*(knee+headroom*(1-Math.exp(-(Math.abs(b)-knee)/headroom))):b;};
 const neutralTotal=mmf?a=>weights.reduce((sum,v,k)=>sum+v*idealParts(a,brush)[k],0):total;
 const roots=[],samples=Array.from({length:720},(_,i)=>neutralTotal(i*T/720));
 const neutralPeak=Math.max(...samples.map(Math.abs)),peak=mmf?Math.max(...Array.from({length:720},(_,i)=>Math.abs(total(i*T/720)))):neutralPeak,epsilon=Math.max(1e-12,neutralPeak*1e-9),step=T/720;
 const add=a=>{a=(a+T)%T;if(!roots.some(v=>Math.abs(Math.atan2(Math.sin(v-a),Math.cos(v-a)))<.002))roots.push(a);};
 if(peak>1e-9)for(let i=0;i<720;i++){
  const a=samples[i],b=samples[(i+1)%720],previous=samples[(i+719)%720];
  // An isolated sign-changing zero is a neutral; a zero interval is not an axis.
  if(Math.abs(a)<=epsilon&&Math.abs(previous)>epsilon&&Math.abs(b)>epsilon&&previous*b<0)add(i*step);
  if(Math.abs(a)>epsilon&&Math.abs(b)>epsilon&&a*b<0){let lo=i*step,hi=(i+1)*step;for(let j=0;j<28;j++){const mid=(lo+hi)/2;if(neutralTotal(lo)*neutralTotal(mid)<=0)hi=mid;else lo=mid;}add((lo+hi)/2);}
 }
 const near=roots.filter(a=>a>0&&a<Math.PI/2).sort((a,b)=>Math.abs(a-Math.PI/4)-Math.abs(b-Math.PI/4))[0];
 return {weights,brush,saturation:!mmf&&!!s.saturation,parts,linear,total,roots,neutral:near,peak};
}
// Same numerical field bases and contour renderer as Principle. Brush-angle
// bases keep the iron fixed and change only the armature current sheet.
const sketchCache=new Map();
function fieldSketch(m){
 const key=m.weights.join(':')+':'+m.brush;if(sketchCache.has(key))return sketchCache.get(key);
 const basis=DCFieldBasis,brush=DCBrushFieldBasis,position=Math.max(0,Math.min(10,(m.brush*180/Math.PI+25)/5)),lo=Math.floor(position),hi=Math.min(10,lo+1),t=position-lo;
 const coeff=[m.weights[0],m.weights[1],m.weights[2]*DCCompensation.comp,m.weights[3]*DCCompensation.inter*NUMERICAL_INTERPOLE_GAIN],grid=new Float32Array(basis.N*basis.N);
 let peak=0;for(let k=0;k<grid.length;k++){grid[k]=coeff[0]*basis.fields[0][k]+coeff[1]*((1-t)*brush.fields[lo][k]+t*brush.fields[hi][k])+coeff[2]*basis.fields[2][k]+coeff[3]*basis.fields[3][k];peak=Math.max(peak,Math.abs(grid[k]));}
 const levels=peak>1e-10&&peak<.14?Array.from({length:16},(_,i)=>(i<8?-1:1)*peak*((i%8)+1)/9):[];
 const contours=MagneticContours(grid,basis.N,basis.R,'#007e6c',levels);let n=0;
 const result=contours.paths+contours.arrows.replace(/<path\b[^>]*\/>/g,p=>Math.floor(n++/2)%2?'':p);
 if(sketchCache.size>24)sketchCache.delete(sketchCache.keys().next().value);sketchCache.set(key,result);return result;
}
function fieldExtent(m,s){let extent=0;for(let i=0;i<720;i++){const a=i*T/720;let sum=0;extent=Math.max(extent,Math.abs(m.total(a)));if(s?.saturation)extent=Math.max(extent,Math.abs(m.linear(a)));for(const fn of m.parts){const v=fn(a);sum+=v;if(!s||s.components)extent=Math.max(extent,Math.abs(v));}}return extent;}
function fitRange(m,s){const extent=fieldExtent(m,s);return extent>1e-10?extent*1.06:1;}
function displayGain(s,m){return 2/(s.range||3);}
function detailHalfWidth(s){return DCGeometry.interpoleHalfArc*180/Math.PI*(s.detailWidth||1);}
function detailAnglesFor(s){
 const center=45+(s.brush||0),half=detailHalfWidth(s);
 const angles=Array.from({length:241},(_,i)=>center-half+2*half*i/240);
 if(s.quantity==='mmf')for(let k=-1;k<3;k++)for(const edge of [90*k-30,90*k+30,45+90*k-DCGeometry.interpoleHalfArc*180/Math.PI,45+90*k+DCGeometry.interpoleHalfArc*180/Math.PI])if(edge>center-half&&edge<center+half)angles.push(edge-1e-7,edge+1e-7);
 return angles.sort((a,b)=>a-b);
}
function detailBounds(s,m){
 let low=0,high=0;
 for(const degree of detailAnglesFor(s)){const a=degree*Math.PI/180;for(const value of [m.total(a),m.linear(a),m.parts[0](a)]){low=Math.min(low,value);high=Math.max(high,value);}}
 const span=high-low;if(span<1e-10)return [-.01,.01];
 const margin=span*.06;return [low-margin,high+margin];
}
function commutationDetail(s){
 const m=model(s),center=45+(s.brush||0),half=detailHalfWidth(s),bounds=detailBounds(s,m),detailAngles=detailAnglesFor(s);
 let svg='<rect x="64" y="43" width="412" height="138" fill="#fff1ca"/><rect x="256" y="43" width="28" height="138" fill="#ffd987" opacity=".7"/>'+DCVisual.plot({curves:[{fn:x=>m.parts[0](x*Math.PI/180),color:colors[0],dash:true},{fn:x=>m.linear(x*Math.PI/180),color:'#9eaab0',dash:true},{fn:x=>m.total(x*Math.PI/180),color:'#007e6c'}].map(c=>({...c,points:detailAngles.map(a=>[a,c.fn(a)])})),x:[center-half,center+half],y:bounds,cursor:center,xt:'\\theta/{}^{\\circ}',yt:quantitySymbol(s)+'_r'});
 for(const [a,color] of [[45,'#87949d'],...m.roots.map(a=>[a*180/Math.PI,'#ad365d'])])if(a>=center-half&&a<=center+half){const x=64+(a-center+half)/30*412;svg+=line(x,43,x,181,color,'5 4');}
 return svg;
}
function scene(s){
 const V=DCVisual,m=model(s),physical=s.quantity==='mmf'?model({...s,quantity:'b'}):m,math=V.math,left=620,right=1410,start=-Math.PI/4,end=3*Math.PI/4,X=a=>left+(a-start)/Math.PI*(right-left),zero=390,gain=displayGain(s,m),scale=75*gain,Y=b=>zero-b*scale;
 const sum=s.quantity==='mmf'?'F_r=F_b+F_a+F_{\\mathrm{komp}}+F_{\\mathrm{pp}}':s.saturation?'B_r=\\mathcal{S}(B_b+B_a+B_{\\mathrm{komp}}+B_{\\mathrm{pp}})':'B_r=B_b+B_a+B_{\\mathrm{komp}}+B_{\\mathrm{pp}}';
 let out=math(1215,22,sum,'#006c5d',20,372)+text(26,28,'Řez · lineární model pole jako v Principu','#233f49',20)+text(left,28,'Jeden pólpár · vinutí a směry proudů','#233f49',20);
 let machine=DCMachineArt.machine({theta:0,current:s.current*s.gains[1],flux:s.flux*s.gains[0],brush:m.brush},s.lines?fieldSketch(m):'',{compensation:true,compensationCurrent:s.current*s.gains[2],interpoles:true,interpoleExcitation:m.weights[3]*DCCompensation.inter*NUMERICAL_INTERPOLE_GAIN,showCurrents:true,neutral:false});
 // Soft signed induction band outside the rotor, tied to the plotted radial component.
 if(s.wash)for(let i=0;i<180;i++){const a=i*T/180,b=(i+1)*T/180,v=physical.total((a+b)/2),p=r=>`${r*Math.cos(a)} ${-r*Math.sin(a)}`,q=r=>`${r*Math.cos(b)} ${-r*Math.sin(b)}`;machine+=`<path d="M${p(128)}A128 128 0 0 0 ${q(128)}L${q(136)}A136 136 0 0 1 ${p(136)}Z" fill="${v>=0?'#d17b36':'#347cc2'}" opacity="${Math.min(.8,Math.abs(v)*.42)}"/>`;}
 if(s.neutrals){for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;machine+=line(0,0,226*Math.cos(a),-226*Math.sin(a),'#87949d','4 5');}for(const a of m.roots)machine+=line(0,0,226*Math.cos(a),-226*Math.sin(a),'#ad365d','8 3');}
 if(s.neutrals)for(let k=0;k<4;k++){const a=Math.PI/4+m.brush+k*Math.PI/2;machine+=line(0,0,215*Math.cos(a),-215*Math.sin(a),'#c56a13','2 4');}
 if(s.detail){const a=Math.PI/4+m.brush-detailHalfWidth(s)*Math.PI/180,b=a+2*detailHalfWidth(s)*Math.PI/180,r=150;machine+='<path d="M0 0L'+r*Math.cos(a)+' '+(-r*Math.sin(a))+'A'+r+' '+r+' 0 0 0 '+r*Math.cos(b)+' '+(-r*Math.sin(b))+'Z" fill="#ffd987" opacity=".3" stroke="#c58520" stroke-width="1.2"/>';}
 const probeAngle=s.probe*Math.PI/180;machine+=line(0,0,146*Math.cos(probeAngle),-146*Math.sin(probeAngle),'#233f49')+`<circle cx="${132*Math.cos(probeAngle)}" cy="${-132*Math.sin(probeAngle)}" r="4" fill="#233f49" stroke="white"/>`;
 out+=`<g transform="translate(277 282) scale(.98)">${machine}</g>`;
 out+=text(25,540,'Drážkovaná kotva · pólové nástavce · budicí cívky', '#536972',15);
 out+=text(25,565,'Kompenzace: vodiče jen pod nástavci; kotva: po celém obvodu.','#536972',14);
 // Physical interpole footprint, clipped at both edges of the unrolled pole pair.
 if(s.wash)for(let k=-1;k<2;k++){const center=Math.PI/4+k*Math.PI/2,lo=Math.max(start,center-DCGeometry.interpoleHalfArc),hi=Math.min(end,center+DCGeometry.interpoleHalfArc);if(hi>lo)out+='<rect data-interpole-zone="true" x="'+X(lo)+'" y="110" width="'+(X(hi)-X(lo))+'" height="435" fill="#ad365d" opacity=".08"/>';}
 // A single complete pole pair; winding geometry comes from the shared renderer.
 out+='<defs><clipPath id="dc-winding-detail"><rect x="620" y="40" width="790" height="130"/></clipPath></defs><g clip-path="url(#dc-winding-detail)">';
 for(let i=0;i<2;i++){
  const center=i*Math.PI/2,sign=i%2?-1:1,w=(right-left)*2*DCGeometry.poleHalfArc/Math.PI;
  out+='<rect x="'+X(center-DCGeometry.poleHalfArc)+'" y="110" width="'+w+'" height="435" fill="#b8c6cf" opacity="'+(s.wash?.12:0)+'"/>';
  out+=DCMachineArt.unrolledPole({x:X(center),width:w,polarity:sign*s.flux>0?'S':'J',excitation:sign*s.flux*s.gains[0],compensation:-sign*s.current*s.gains[2]});
 }
 for(let i=-1;i<2;i++)out+=DCMachineArt.unrolledPole({x:X(Math.PI/4+i*Math.PI/2),width:(right-left)*2*DCGeometry.interpoleHalfArc/Math.PI,excitation:(i%2?-1:1)*s.current*s.gains[3]*DCCompensation.inter*NUMERICAL_INTERPOLE_GAIN,interpole:true});
 for(let i=0;i<25;i++){const a=start+(i+.5)*Math.PI/25,x=X(a),v=s.current*s.gains[1]*armatureCurrent(a-m.brush);out+='<rect x="'+(x-7)+'" y="143" width="14" height="22" fill="#f3eee3" stroke="#b6a07a"/>'+DCMachineArt.unrolledCurrent(x,154,v,'#346fc0',5);}
 out+='</g>';
 // Extend zone shading below the detail clip.
 if(s.wash)for(let i=0;i<2;i++)out+='<rect x="'+X(i*Math.PI/2-DCGeometry.poleHalfArc)+'" y="170" width="'+((right-left)*2*DCGeometry.poleHalfArc/Math.PI)+'" height="375" fill="#b8c6cf" opacity=".12"/>';


 for(let k=-2;k<=2;k++){const b=k/gain;out+=line(left,Y(b),right,Y(b),k?'#dce4e8':'#879ba5')+math(left-34,Y(b),b.toFixed(4).replace(/\.?0+$/,'').replace('.', '{,}')||'0','#536972',12,65);}
 out+=math(left-24,205,quantitySymbol(s)+'_r\\,/\\,\\mathrm{p.u.}','#233f49',15,110);
 out+='<defs><clipPath id="dc-compose-clip"><rect x="620" y="230" width="790" height="320"/></clipPath></defs><g clip-path="url(#dc-compose-clip)">';
 if(s.detail){const a=Math.PI/4+m.brush-detailHalfWidth(s)*Math.PI/180,b=a+2*detailHalfWidth(s)*Math.PI/180;out+='<rect x="'+X(a)+'" y="230" width="'+(X(b)-X(a))+'" height="318" fill="#ffe6a4" opacity=".52"/>';}
 const angles=Array.from({length:721},(_,i)=>start+i*Math.PI/720);
 if(s.quantity==='mmf')for(let k=-1;k<3;k++){const center=Math.PI/4+k*Math.PI/2;for(const edge of [k*Math.PI/2-DCGeometry.poleHalfArc,k*Math.PI/2+DCGeometry.poleHalfArc,center-DCGeometry.interpoleHalfArc,center+DCGeometry.interpoleHalfArc])if(edge>start&&edge<end)angles.push(edge-1e-9,edge+1e-9);}
 angles.sort((a,b)=>a-b);
 const points=fn=>angles.map(a=>[X(a),Y(fn(a))]);
 const path=ps=>ps.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join('');
 // Shade only the final result; intermediate sums leave a false overload ghost.
 if(s.wash)out+='<path data-result-wash="true" d="'+path(points(m.total))+path(points(()=>0).reverse()).replace('M','L')+'Z" fill="#007e6c" opacity=".12"/>';
 m.parts.forEach((fn,k)=>{if(s.components&&s.gains[k])out+='<path d="'+path(points(fn))+'" fill="none" stroke="'+colors[k]+'" stroke-width="1.5" opacity=".75"/>';});

 if(m.saturation){out+='<path data-saturation-loss="true" d="'+path(points(m.linear))+path(points(m.total).reverse()).replace('M','L')+'Z" fill="#ffe030" opacity=".85"/>';out+='<path d="'+path(points(m.linear))+'" fill="none" stroke="#8f9da5" stroke-width="1.4" stroke-dasharray="5 4"/>';}
 out+=`<path d="${path(points(m.total))}" fill="none" stroke="#007e6c" stroke-width="3"/>`;
 if(s.neutrals){for(let i=-1;i<2;i++){const a=Math.PI/4+i*Math.PI/2;out+=line(X(a),230,X(a),548,'#87949d','4 5');}for(const r of m.roots){const a=r>Math.PI?r-T:r;if(a>=start&&a<=end)out+=line(X(a),230,X(a),548,'#ad365d','8 3');}}
 if(s.neutrals)for(let i=-1;i<2;i++){const a=Math.PI/4+m.brush+i*Math.PI/2;if(a>=start&&a<=end)out+=line(X(a),230,X(a),548,'#c56a13','2 4');}
 const probe=s.probe*Math.PI/180;out+=line(X(probe),230,X(probe),548,'#233f49')+`<circle cx="${X(probe)}" cy="${Y(m.total(probe))}" r="4" fill="#007e6c"/>`;out+='</g>';
 if(s.detail)out+=text(X(Math.PI/4+m.brush)-68,216,'Komutační oblast','#a26710',14);
 for(let k=0;k<=4;k++)out+=math(X(start+k*Math.PI/4),573,String(-45+k*45)+'^{\\circ}','#536972',12,65);
 out+=math(277,608,m.neutral===undefined?'\\text{Neutrála není jednoznačná}':'\\Delta\\theta_n='+num((m.neutral-Math.PI/4)*180/Math.PI)+'^{\\circ}','#ad365d',19,480);
 out+=text(25,641,'Šedá: geometrická · růžová: magnetická neutrála','#536972',14);
 out+=text(25,665,s.quantity==='mmf'?'Oranžová: osa kartáčů · řez a neutrály podle indukce':'Oranžová: osa kartáčů · žlutá plocha: úbytek toku sycením','#a56c0c',14);
 out+=math(1015,616,symbols.map((v,k)=>(s.quantity==='mmf'?v.replace('B','F'):v)+'='+num(m.parts[k](probe))).join('\\quad '),'#233f49',16,800);
 out+=math(1015,648,quantitySymbol(s)+'_r('+num(s.probe)+'^{\\circ})='+num(m.total(probe))+'\\,\\mathrm{p.u.}','#007e6c',19,800);
 return out;
}
function mount(app,entry){
 const defaults={quantity:'mmf',flux:1,current:1,probe:45,brush:0,range:3,detail:false,detailWidth:1,saturation:false,gains:[1,0,0,0],wash:true,lines:true,components:false,neutrals:true};let s={...defaults,gains:[...defaults.gains]};
 app.classList.add('module-window-host');
 app.innerHTML=`<div class="workspace learning-workspace uniform-module-layout dc-workspace dc-compose"><div class="modulehead"><a class="back" href="#group-dc">← Stejnosměrné stroje</a><span class="num">${entry.num}</span><h1>Skládání polí stejnosměrného stroje</h1><div class="actions"><button id="compose-reset">Výchozí stav</button><button id="compose-full">Celá obrazovka</button></div></div><div class="compose-toolbar"><label class="compose-quantity-label">Zobrazená veličina<select id="compose-quantity" aria-label="Zobrazená veličina"><option value="mmf" selected>Magnetické napětí</option><option value="b">Magnetická indukce</option></select></label><label>Natočení osy kartáčů <output id="compose-brush-value"></output><input id="compose-brush" type="range" aria-label="Natočení osy kartáčů" min="-25" max="25" step=".5" value="0"></label><label>Odečet na obvodu <output id="compose-probe-value"></output><input id="compose-probe" type="range" aria-label="Odečet na obvodu" min="-45" max="135" step="1"></label><button id="compose-reverse" title="Obrátí proud kotvy, kompenzace a pomocných pólů; buzení zůstane stejné">⇄ Obrátit směr</button><button id="compose-fit">Přizpůsobit graf</button><button id="compose-scale-reset">Základní měřítko</button><span id="compose-range-value"></span><button id="compose-detail" aria-pressed="false"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12l6 6M5 8h6M8 5v6" stroke="currentColor" stroke-width="2"/></svg>Detail komutace</button></div><div class="compose-controls compose-integrated-controls"><div class="compose-current-card" style="--field-color:${colors[0]}"><label class="compose-winding-toggle"><input type="checkbox" data-enable="0" aria-label="Buzení">Buzení</label><label class="compose-current-slider" for="compose-flux">Budicí proud <output id="compose-flux-value"></output></label><input id="compose-flux" type="range" aria-label="Budicí proud" min="-1.5" max="1.5" step=".05"></div><div class="compose-current-card compose-series-card"><div class="compose-series-toggles">${names.slice(1).map((v,j)=>`<label class="compose-winding-toggle" style="--field-color:${colors[j+1]}"><input type="checkbox" data-enable="${j+1}" aria-label="${v}">${v}</label>`).join('')} </div><label class="compose-current-slider" for="compose-current">Společný proud kotvy a sériových vinutí <output id="compose-current-value"></output></label><input id="compose-current" type="range" aria-label="Proud kotvy, kompenzace a pomocných pólů" min="-1.5" max="1.5" step=".05"></div><div class="compose-options">${[['wash','Podbarvení součtu'],['components','Jednotlivá pole'],['lines','Siločáry v řezu'],['neutrals','Neutrály'],['saturation','Ukázka sycení']].map(([k,v])=>`<label><input type="checkbox" id="compose-${k}">${v}</label>`).join('')}</div></div><section class="learning-panel compose-panel"><svg id="compose-scene" data-plain-svg viewBox="0 0 1460 680" role="img" aria-label="Řez strojem, rozvinuté vinutí, složky indukce a magnetické neutrály"></svg><section id="compose-detail-panel" class="compose-detail-panel" hidden><div><strong>Komutační oblast kolem kartáčů</strong><button id="compose-detail-close" aria-label="Zavřít detail komutace">Zavřít</button></div><label class="compose-detail-width">Šířka záběru <output id="compose-detail-width-value"></output><input id="compose-detail-width" type="range" min="0.25" max="3" step="0.05" value="1" aria-label="Šířka záběru komutační oblasti"></label><svg id="compose-detail-scene" data-plain-svg viewBox="0 0 540 234" role="img" aria-label="Detail pole v okolí komutace"></svg><p>Oranžový kurzor: osa kartáčů · růžová: magnetická neutrála<br>Šedá křivka: bez sycení · zelená: výsledné pole</p></section></section><p id="compose-explanation"></p><p class="compose-note">Zeleně: výsledné pole · žlutě: úbytek toku při sycení. Příspěvky zapnete volbou Jednotlivá pole. </p></div>`;
 const $=id=>app.querySelector('#compose-'+id);
 function render(){
  const m=model(s);if(fieldExtent(m,s)>s.range){s.range=fitRange(m,s);}
  $('scene').innerHTML=scene(s);$('detail-panel').hidden=!s.detail;$('detail').setAttribute('aria-pressed',String(s.detail));
  if(s.detail)$('detail-scene').innerHTML=commutationDetail(s);
  $('detail-width').value=s.detailWidth;$('detail-width-value').textContent=(2*detailHalfWidth(s)).toFixed(1).replace('.',',')+'°';
  $('quantity').value=s.quantity;$('saturation').disabled=s.quantity==='mmf';
  $('explanation').textContent=s.quantity==='mmf'?'Magnetické napětí: kotva má trojúhelníkový průběh přes celou rozteč, kompenzace mezi nástavci zůstává konstantní. Hodnoty jsou relativní; sycení nemění ampérzávity vinutí. Řez a neutrály nadále ukazují indukci.':s.saturation?'Žlutý oblouček ukazuje úbytek toku proti lineárnímu součtu při sycení zesíleného okraje pólu. Jde o názornou aproximaci, nikoli materiálovou charakteristiku.':'Natočení kartáčů posouvá rozhraní proudů kotvy. Póly i kompenzační vinutí zůstávají na místě; magnetická neutrála vychází z výsledného pole.';
  $('range-value').innerHTML=DCVisual.tex(quantitySymbol(s)+'_r: \\pm '+num(s.range)+'\\,\\mathrm{p.u.}');
  for(let k=0;k<4;k++)app.querySelector('[data-enable="'+k+'"]').checked=s.gains[k]!==0;
  for(const key of ['flux','current','probe','brush']){$(key).value=s[key];$(key+'-value').innerHTML=DCVisual.tex(num(s[key])+(['probe','brush'].includes(key)?'^{\\circ}':'\\,\\mathrm{p.u.}'));}
  for(const key of ['wash','components','lines','neutrals','saturation'])$(key).checked=s[key];

 }
 app.querySelectorAll('[data-enable]').forEach(e=>e.onchange=()=>{s.gains[+e.dataset.enable]=e.checked?1:0;render();});
 for(const key of ['flux','current','probe','brush'])$(key).oninput=()=>{s[key]=+$(key).value;render();};for(const key of ['wash','components','lines','neutrals','saturation'])$(key).onchange=()=>{s[key]=$(key).checked;render();};
 $('quantity').onchange=()=>{s.quantity=$('quantity').value;s.range=fitRange(model(s),s);render();};
 $('reverse').onclick=()=>{s.current=-s.current;render();};
 $('fit').onclick=()=>{const m=model(s);s.range=fitRange(m,s);render();};
 $('scale-reset').onclick=()=>{s.range=3;render();};
 $('detail-width').oninput=()=>{s.detailWidth=+$('detail-width').value;render();};
 $('detail').onclick=()=>{s.detail=!s.detail;render();};$('detail-close').onclick=()=>{s.detail=false;render();};
 $('reset').onclick=()=>{s={...defaults,gains:[...defaults.gains]};render();};$('full').onclick=()=>{document.body.classList.toggle('fullscreen');window.dispatchEvent(new Event('resize'));};
 render();window.dcCompositionState=()=>({...s,gains:[...s.gains]});Lab.dispose=()=>{delete window.dcCompositionState;document.body.classList.remove('fullscreen');};
}
window.DCComposition={NUMERICAL_INTERPOLE_GAIN,INTERPOLE_GAIN,INTERPOLE_HALF_WIDTH,gapPermeance,FRINGE_WIDTH,poleCoverage,COMMUTATION_HALF_WIDTH,armatureTriangle,armatureCurrent,interpoleProfile,interpoleMMFProfile,idealMMF,mmfParts,idealParts,model,fieldExtent,fitRange,displayGain,fieldSketch,detailHalfWidth,detailAnglesFor,detailBounds,commutationDetail,scene,mount};
})();







