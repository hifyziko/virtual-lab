(function(root){'use strict';
 const TAU=2*Math.PI,wrap=a=>((a+Math.PI)%TAU+TAU)%TAU-Math.PI;
 function create(basis){
  const N=basis.N,R=basis.R,h=2*R/(N-1),radius=151,samples=360;
  const sample=(a,x,y)=>{const u=(x+R)/h,v=(y+R)/h,i=Math.floor(u),j=Math.floor(v),dx=u-i,dy=v-j,k=j*N+i;return (1-dy)*((1-dx)*a[k]+dx*a[k+1])+dy*((1-dx)*a[k+N]+dx*a[k+N+1]);};
  // Recover the independent normalizations of the existing linear solutions
  // from -laplacian(A)=J at air-only stencil nodes inside the stator source.
  // Both rotors must represent the SAME source current, including on switching.
  function sourceScale(a){let xy=0,xx=0;for(let j=1;j<N-1;j++)for(let i=1;i<N-1;i++){const x=-R+i*h,y=-R+j*h,r=Math.hypot(x,y);if(r<153+1.05*h||r>160-1.05*h)continue;const k=j*N+i,J=y/r,res=-(a[k+1]+a[k-1]+a[k+N]+a[k-N]-4*a[k])/(h*h);xy+=J*res;xx+=J*J;}return xy/xx;}
  const commonScale=sourceScale(basis.smooth.fields[0]),data={};
  function harmonic(w){let d=0,q=0;w.forEach((b,k)=>{const t=k*TAU/samples;d+=2*b*Math.cos(t)/samples;q+=2*b*Math.sin(t)/samples;});return {d,q};}
  for(const type of ['smooth','salient']){
   const factor=commonScale/sourceScale(basis[type].fields[0]);
   const fields=basis[type].fields.slice(0,2).map(a=>Float32Array.from(a,v=>v*factor));
   const waves=fields.map(a=>Array.from({length:samples},(_,k)=>{const t=k*TAU/samples,eps=TAU/samples;return (sample(a,radius*Math.cos(t+eps),radius*Math.sin(t+eps))-sample(a,radius*Math.cos(t-eps),radius*Math.sin(t-eps)))/(2*eps*radius);}));
   data[type]={fields,waves,factor};
  }
  const reference=harmonic(data.smooth.waves[0]).d;
  for(const type of Object.keys(data)){const d=data[type];d.waves=d.waves.map(w=>w.map(v=>v/reference));
   // The reference is an IDEAL isotropic smooth rotor. Its exact sinusoidal
   // ring field avoids presenting Cartesian-grid ripple as rotor saliency.
   if(type==='smooth')d.waves=[Array.from({length:samples},(_,k)=>Math.cos(k*TAU/samples)),Array.from({length:samples},(_,k)=>Math.sin(k*TAU/samples))];
   d.harmonics=d.waves.map(harmonic);}
  // Teaching air-gap model: a smooth periodic permeance, highest at the pole
  // centre, acts on sinusoidal MMF. Chmelik fig. 5.5: d has its maximum at
  // the pole centre; q has opposite signs at the two edges of a pole.
  // Fit only the two fundamental responses to the numerical field. This is
  // explicitly a reduced air-gap model, not a new FEM solution.
  const target=data.salient.harmonics[1].q/data.salient.harmonics[0].d;
  function teachingBasis(sharpness){const gain=Array.from({length:samples},(_,k)=>.035+.965*Math.exp(-sharpness*Math.sin(k*TAU/samples)**2));return [gain.map((v,k)=>v*Math.cos(k*TAU/samples)),gain.map((v,k)=>v*Math.sin(k*TAU/samples))];}
  let lo=0,hi=12;for(let i=0;i<48;i++){const mid=(lo+hi)/2,w=teachingBasis(mid),ratio=harmonic(w[1]).q/harmonic(w[0]).d;if(ratio>target)lo=mid;else hi=mid;}
  const teaching=teachingBasis((lo+hi)/2),scale=data.salient.harmonics[0].d/harmonic(teaching[0]).d;
  data.salient.teachingWaves=teaching.map(w=>w.map(v=>v*scale));
  data.smooth.teachingWaves=data.smooth.waves;
  function at(type,angle,amp=1,source='total'){
   const d=data[type],fd=amp*Math.cos(angle),fq=amp*Math.sin(angle),cd=source==='q'?0:fd,cq=source==='d'?0:fq;
   const wave=d.waves[0].map((v,k)=>cd*v+cq*d.waves[1][k]),bd=cd*d.harmonics[0].d+cq*d.harmonics[1].d,bq=cd*d.harmonics[0].q+cq*d.harmonics[1].q;
   const teachingWave=d.teachingWaves[0].map((v,k)=>cd*v+cq*d.teachingWaves[1][k]);
   return {type,angle,amp,fd,fq,cd,cq,bd,bq,wave,teachingWave,b:Math.hypot(bd,bq),fluxAngle:Math.atan2(bq,bd),ld:d.harmonics[0].d,lq:d.harmonics[1].q,mmf:Array.from({length:samples},(_,k)=>cd*Math.cos(k*TAU/samples)+cq*Math.sin(k*TAU/samples)),fundamental:Array.from({length:samples},(_,k)=>bd*Math.cos(k*TAU/samples)+bq*Math.sin(k*TAU/samples))};
  }
  function field(type,angle,amp=1,source='total'){const a=at(type,angle,amp,source),f=data[type].fields;return Float32Array.from(f[0],(v,k)=>a.cd*v+a.cq*f[1][k]);}
  return {at,field,data,N,R,reference,samples};
 }
 const api={create,wrap};if(typeof module!=='undefined')module.exports=api;root.SyncDQ=api;
})(typeof window==='undefined'?globalThis:window);
