/* Ideal point electric dipole in vacuum. Internal units: c=1, 4*pi*epsilon0=1.
   Length lambda0=c/f0, time 1/f0; p0 is arbitrary. No finite-wire solver. */
(function(root){'use strict';
 const tau=2*Math.PI;
 function ramp(u){if(u<=0)return [0,0,0];if(u>=1)return [1,0,0];return [u*u*u*(10+u*(-15+6*u)),30*u*u*(1-u)*(1-u),60*u*(1-3*u+2*u*u)];}
 function source(t,config={}){
  const f=config.frequency||1,w=tau*f,T=1/f,stop=config.stopTime??(config.burst?4*T:Infinity);
  if(t<=0||t>=stop+T)return {p:0,dp:0,ddp:0,envelope:0};
  if(t>=T&&t<=stop){const s=Math.sin(w*t);return {p:s,dp:w*Math.cos(w*t),ddp:-w*w*s,envelope:1};}
  const a=ramp(t/T),b=ramp((t-stop)/T);
  const g=a[0]*(1-b[0]),gd=(a[1]*(1-b[0])-a[0]*b[1])/T,gdd=(a[2]*(1-b[0])-2*a[1]*b[1]-a[0]*b[2])/(T*T);
  const s=Math.sin(w*t),c=Math.cos(w*t);
  return {p:g*s,dp:gd*s+g*w*c,ddp:gdd*s+2*gd*w*c-g*w*w*s,envelope:g};
 }
 function field(x,y,z,t,config={},part='total'){
  const r=Math.hypot(x,y,z);if(r<.09)return {E:[0,0,0],B:[0,0,0],S:[0,0,0],masked:true};
  const n=[x/r,y/r,z/r],s=source(t-r,config),a=part==='radiation'?0:s.p/r**3+s.dp/r**2,b=s.ddp/r;
  const E=n.map((v,i)=>(3*v*n[2]-(i===2?1:0))*a+(v*n[2]-(i===2?1:0))*b);
  const h=(part==='radiation'?0:s.dp/r**2)+b,B=[-n[1]*h,n[0]*h,0];
  return {E,B,S:cross(E,B),masked:false};
 }
 function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
 // Far-field waveform with geometric dilution removed for a local plane-wave detail.
 function wave(x,t,config={}){return -source(t-x,config).ddp/(tau*(config.frequency||1))**2;}
 // Allocation-light meridional sampler, identical to field(x,0,z).
 function section(x,z,t,config={},part='total'){
  const r=Math.hypot(x,z);if(r<.09)return [0,0,0,0,0,0];const nx=x/r,nz=z/r,s=source(t-r,config),a=part==='radiation'?0:s.p/r**3+s.dp/r**2,b=s.ddp/r,rx=nx*nz*b,rz=(nz*nz-1)*b,rb=nx*b;
  return [3*nx*nz*a+rx,(3*nz*nz-1)*a+rz,nx*(part==='radiation'?b:s.dp/r**2+b),rx,rz,rb];
 }
 const api={source,field,section,wave,cross,ramp};if(typeof module==='object')module.exports=api;else root.EMWaveModel=api;
})(typeof window==='object'?window:globalThis);
