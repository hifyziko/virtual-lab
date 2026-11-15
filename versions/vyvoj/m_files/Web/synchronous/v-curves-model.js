/* Shared two-reaction model; terminal power and passive current convention. */
(function(root){
'use strict';
const S=typeof module==='object'?require('./schema-model.js'):root.SyncSchema;
const constants=Object.freeze({u:1,xd:1.2,xsigma:.15,xad:1.05});
function parameters(s={}){return {type:s.type||'smooth',xd:1.2,xq:s.type==='salient'?(s.xq??.75):1.2,xsigma:.15,r:s.r??0};}
function values(beta,e,a){
 const b=beta*Math.PI/180,c=Math.cos(b),s=Math.sin(b),{r,xd,xq}=a,D=r*r+xd*xq;
 const p=(r-r*e*c+(xq-xd)*s*c-xq*e*s)/D;
 const im=(-r*e*s-xd*s*s-xq*c*c+xq*e*c)/D;
 const dp=(r*e*s+(xq-xd)*(c*c-s*s)-xq*e*c)/D;
 const di=(-r*e*c+2*(xq-xd)*s*c-xq*e*s)/D;
 return {p,q:-im,ia:Math.hypot(p,im),powerDerivative:dp,stiffness:-(dp*(1-2*r*p)-2*r*im*di)};
}
function bisect(fn,a,b){let fa=fn(a);for(let i=0;i<38;i++){const m=(a+b)/2,fm=fn(m);if(fa*fm<=0)b=m;else{a=m;fa=fm;}}return (a+b)/2;}
function roots(fn,step=3){const out=[];let a=-180,fa=fn(a);for(let b=a+step;b<=180+.001;b+=step){const fb=fn(b);if(Math.abs(fa)<1e-10)out.push(a);if(fa*fb<0)out.push(bisect(fn,a,b));a=b;fa=fb;}return out.filter((b,i)=>i===0||Math.abs(b-out[i-1])>1e-6);}
function decorate(raw,state){
 const ik=raw.e/constants.xad,Ik=raw.d.map(v=>v*ik),Imu=raw.I.map((v,i)=>v+Ik[i]),stiffness=values(raw.beta,raw.e,parameters(state)).stiffness;
 const stable=stiffness>1e-8,iaMax=state.iaMax??1,ikMax=state.ikMax??2.2;
 const armatureLimit=raw.amp>iaMax+1e-9,excitationLimit=ik>ikMax+1e-9;
 return {raw,p:raw.P,q:raw.Q,ik,e:raw.e,ia:raw.amp,I:raw.I,E:raw.E,Ui:raw.Ui,Ik,Imu,beta:raw.beta,pf:raw.pf,loss:raw.loss,Pem:raw.Pem,stiffness,stable,exists:true,iaMax,ikMax,armatureLimit,excitationLimit,allowed:stable&&!armatureLimit&&!excitationLimit,pMax:raw.e/1.2};
}
function solve(state={}){
 const p=state.p??-.6,ik=state.ik??1.5,a=parameters(state),e=constants.xad*ik;
 if(![p,ik,a.r,a.xq,state.iaMax??1,state.ikMax??2.2].every(Number.isFinite)||ik<0||a.r<0||a.xq<=a.xsigma)throw Error('Invalid parameters');
 const empty={p,ik,e,pMax:e/a.xd,exists:false,stable:false,allowed:false,excitationLimit:ik>(state.ikMax??2.2)+1e-9};
 if(e<1e-12&&Math.abs(a.xd-a.xq)<1e-12)return empty;
 if(a.type==='smooth'&&a.r===0){
  const disc=e*e-(a.xd*p)**2;if(disc< -1e-10||e<1e-12)return empty;
  return decorate(S.solve({...a,e,beta:Math.atan2(-a.xd*p,Math.sqrt(Math.max(0,disc)))*180/Math.PI}),state);
 }
 const fn=b=>values(b,e,a).p-p;
 // Split at extrema first: two nearby roots at pull-out can fall inside one
 // angular sample interval, so a scan of P-target alone is insufficient.
 const cuts=[-180,...roots(b=>values(b,e,a).powerDerivative),180],found=[];
 for(let i=0;i<cuts.length-1;i++){const lo=cuts[i],hi=cuts[i+1],fa=fn(lo),fb=fn(hi);if(Math.abs(fa)<1e-10)found.push(lo);if(fa*fb<0)found.push(bisect(fn,lo,hi));if(i===cuts.length-2&&Math.abs(fb)<1e-10)found.push(hi);}
 let candidates=found.filter(b=>values(b,e,a).stiffness>=-1e-8);
 candidates.sort((a,b)=>Math.abs(a)-Math.abs(b));
 return candidates.length?decorate(S.solve({...a,e,beta:candidates[0]}),state):empty;
}
function fromPQ(p,q,state={}){
 const a=parameters(state),w=[1-a.r*p-a.xq*q,a.r*q-a.xq*p],angle=Math.atan2(w[1],w[0]);
 let e=Math.hypot(...w)-(a.xd-a.xq)*(p*Math.sin(angle)+q*Math.cos(angle)),beta=angle*180/Math.PI;
 if(e<0){e=-e;beta+=180;}beta=(beta+540)%360-180;
 return decorate(S.solve({...a,e,beta}),state);
}
function atPQ(p,q,state={}){return fromPQ(p,q,state).ik;}
function minimum(p,state={}){const s=fromPQ(p,0,state);return {ik:s.ik,ia:Math.abs(p),stable:s.stable};}
function allowedPQ(p,q,iaMax,ikMax,state={}){return fromPQ(p,q,{...state,iaMax,ikMax}).allowed;}
function atAngle(beta,ik,state={}){return decorate(S.solve({...parameters(state),beta,e:constants.xad*ik}),state);}
function boundary(ik,state={}){const a=parameters(state),e=constants.xad*ik;return roots(b=>values(b,e,a).stiffness).map(b=>atAngle(b,ik,state));}
// A reference at the edge of the selected fixed-terminal-power branch, never
// presented as an operating solution for the requested (infeasible) excitation.
function limitingReference(state){
 if(solve(state).stable)return null;
 for(const direction of [1,-1])for(let n=1;n<=120;n++){
  const ik=state.ik+direction*n*.025;if(ik<0||ik>3)break;
  const candidate=solve({...state,ik});if(!candidate.stable)continue;
  let bad=state.ik,good=ik;
  for(let j=0;j<36;j++){const mid=(bad+good)/2;if(solve({...state,ik:mid}).stable)good=mid;else bad=mid;}
  return {...solve({...state,ik:good}),reference:true};
 }
 return null;
}
function equalPowerFactor(point,state={}){
 if(!point?.exists||point.pf===null)return [];
 const angle=Math.atan2(point.q,Math.abs(point.p)),sign=point.p<0?-1:1,result=[];
 // Parameterize by apparent power, so zero power factor is well-defined too.
 const levels=[...Array.from({length:181},(_,n)=>Math.max(2.5,point.ia)*n/180),point.ia].sort((a,b)=>a-b);
 for(const apparent of levels){
  const p=sign*apparent*Math.cos(angle),q=apparent*Math.sin(angle);
  if(Math.abs(p)>1.500001){result.push(null);continue;}
  const v=fromPQ(p,q,state);
  result.push(v.stable&&v.pf!==null&&v.ik<=3?v:null);
 }
 return result;
}
// Interpolated marching-squares contours, stitched into closed SVG polygons.
// Sampling determines the boundary only; no individual grid cells are painted.
function admissibleRegion(state={},resolution=160){
 const n=resolution,step=4.8/n,margin=(q,p)=>{
  const s=fromPQ(p,q,state);
  return Math.min((state.iaMax??1)**2-p*p-q*q,(state.ikMax??2.2)-s.ik,s.stiffness);
 };
 const grid=Array.from({length:n+1},(_,j)=>Array.from({length:n+1},(_,i)=>margin(-2.4+i*step,2.4-j*step)));
 const vertices=new Map(),links=new Map();
 const connect=(a,b)=>{if(!links.has(a))links.set(a,[]);if(!links.has(b))links.set(b,[]);links.get(a).push(b);links.get(b).push(a);};
 const pairs={1:[[3,0]],2:[[0,1]],3:[[3,1]],4:[[1,2]],6:[[0,2]],7:[[3,2]],8:[[2,3]],9:[[0,2]],11:[[1,2]],12:[[3,1]],13:[[0,1]],14:[[3,0]]};
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
  const values=[grid[j][i],grid[j][i+1],grid[j+1][i+1],grid[j+1][i]],mask=values.reduce((v,x,k)=>v+(x>=0?1<<k:0),0);
  if(mask===0||mask===15)continue;
  const keys=['h'+i+','+j,'v'+(i+1)+','+j,'h'+i+','+(j+1),'v'+i+','+j];
  const corners=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],edges=[[0,1],[1,2],[3,2],[0,3]];
  const point=edge=>{const key=keys[edge];if(!vertices.has(key)){const [a,b]=edges[edge],t=values[a]/(values[a]-values[b]);vertices.set(key,[-2.4+(corners[a][0]+t*(corners[b][0]-corners[a][0]))*step,2.4-(corners[a][1]+t*(corners[b][1]-corners[a][1]))*step]);}return key;};
  let segments=pairs[mask];
  if(mask===5||mask===10){const inside=margin(-2.4+(i+.5)*step,2.4-(j+.5)*step)>=0;segments=(mask===5)===inside?[[0,1],[2,3]]:[[3,0],[1,2]];}
  for(const [a,b]of segments)connect(point(a),point(b));
 }
 const visited=new Set(),loops=[];
 for(const start of links.keys()){
  if(visited.has(start))continue;const polygon=[];let current=start,previous=null;
  do{visited.add(current);polygon.push(vertices.get(current));const next=links.get(current).find(v=>v!==previous);previous=current;current=next;}while(current&&current!==start&&!visited.has(current));
  if(current!==start)throw Error('Admissible contour did not close');
  if(polygon.length>=3)loops.push(polygon);
 }
 return loops;
}
const api={constants,parameters,solve,atPQ,minimum,allowedPQ,fromPQ,atAngle,boundary,values,limitingReference,equalPowerFactor,admissibleRegion};
if(typeof module==='object')module.exports=api;else root.SyncVCurves=api;
})(typeof window==='object'?window:globalThis);
