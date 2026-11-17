/* SI test-particle model. Static prescribed fields; no collisions or self-field. */
(function(root){'use strict';
 const e=1.602176634e-19, species={electron:{m:9.1093837139e-31,q:-e},proton:{m:1.67262192595e-27,q:e},deuteron:{m:3.3435837768e-27,q:e},alpha:{m:6.644657345e-27,q:2*e}};
 const add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,s)=>a.map(v=>v*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>Math.hypot(...a);
 function setup(p={}){
  const c={mode:'entry',species:'deuteron',B:.05,energy:500,pitch:0,electric:1500,gradient:.12,radius:6,angle:0,start:[-3,0],...p};
  Object.assign(c,species[c.species]);c.speed=Math.sqrt(2*c.energy*e/c.m);c.length=c.m*c.speed/(Math.abs(c.q)*.05);c.period=2*Math.PI*c.m/(Math.abs(c.q)*Math.abs(c.B));c.R=c.radius*c.length;
  const a=c.pitch*Math.PI/180,az=c.angle*Math.PI/180,vp=c.speed*Math.cos(a),vl=c.speed*Math.sin(a);
  c.initial={r:c.mode==='curvature'?[c.R,0,0]:c.mode==='entry'?[c.start[0]*c.length,c.start[1]*c.length,0]:[0,0,0],v:c.mode==='curvature'?[vp,vl,0]:[vp*Math.cos(az),vp*Math.sin(az),vl]};return c;
 }
 function fields(c,r){
  if(c.mode==='entry'&&r[0]<0)return {B:[0,0,0],E:[0,0,0]};
  if(c.mode==='curvature'){const R=Math.hypot(r[0],r[1]);return {B:[-c.B*r[1]/R,c.B*r[0]/R,0],E:[0,0,0]};}
  return {B:[0,0,c.B*(c.mode==='gradient'?Math.exp(c.gradient*r[0]/c.length):1)],E:[0,c.mode==='electric'?-c.electric:0,0]};
 }
 // Symmetric drift-kick-rotate-kick-drift Boris step; midpoint field sample.
 function step(c,s,dt){
  const half=add(s.r,mul(s.v,dt/2)),f=fields(c,half),h=c.q*dt/(2*c.m),vminus=add(s.v,mul(f.E,h)),t=mul(f.B,h),u=mul(t,2/(1+dot(t,t))),prime=add(vminus,cross(vminus,t)),v=add(add(vminus,cross(prime,u)),mul(f.E,h));
  return {r:add(half,mul(v,dt/2)),v};
 }
 function diagnostics(c,s){
  const {B,E}=fields(c,s.r),b=norm(B),energy=c.m*dot(s.v,s.v)/(2*e);if(!b)return {center:null,drift:[0,0,0],rho:0,energy,force:[0,0,0]};
  const unit=mul(B,1/b),parallel=dot(s.v,unit),exb=mul(cross(E,B),1/(b*b)),w=add(s.v,mul(exb,-1)),perp=add(w,mul(unit,-dot(w,unit))),rho=c.m*norm(perp)/(Math.abs(c.q)*b);
  let drift=exb;
  if(c.mode==='gradient')drift=add(drift,mul(cross(B,[b*c.gradient/c.length,0,0]),c.m*dot(perp,perp)/(2*c.q*b*b*b)));
  if(c.mode==='curvature'){const R=Math.hypot(s.r[0],s.r[1]),out=[s.r[0]/R,s.r[1]/R,0];drift=add(drift,mul(cross(out,B),c.m*parallel*parallel/(c.q*b*b*R)));}
  return {center:add(s.r,mul(cross(w,B),c.m/(c.q*b*b))),drift,rho,energy,force:mul(add(E,cross(s.v,B)),c.q)};
 }
 function simulate(c,{frames=1440,turns=8,substeps=12}={}){
  let s={r:[...c.initial.r],v:[...c.initial.v]},time=0;const samples=[],duration=turns*c.period,dt=duration/frames;
  for(let i=0;i<=frames;i++){
   samples.push({...s,t:time,...diagnostics(c,s)});
   if(i===frames)break;
   // Refine in stronger regions so the cyclotron angle stays below 0.025 rad.
   const localB=norm(fields(c,s.r).B),n=Math.max(substeps,Math.ceil(dt*Math.abs(c.q)*localB/c.m/.025));
   for(let j=0;j<n;j++)s=step(c,s,dt/n);time+=dt;
   if(!s.r.every(Number.isFinite)||norm(s.r)>80*c.length)break;
  }
  return samples;
 }
 const api={e,species,setup,fields,step,diagnostics,simulate,cross,norm,dot};root.DriftModel=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
