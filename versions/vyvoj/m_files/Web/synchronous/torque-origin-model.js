/* RMS phasors, generator beta positive; dimensional bases are phase RMS values. */
(function(root){'use strict';
const S=typeof module==='object'?require('./schema-model.js'):root.SyncSchema;
function calculate(s,{voltage=230,current=10,frequency=50,polePairs=2}={}){
 const a=S.solve(s),b=a.beta*Math.PI/180,D=Math.hypot(1-a.E[0],a.E[1]),cosineD2=Math.max(0,1+a.e*a.e-2*a.e*Math.cos(b)),smooth=a.type==='smooth',lossless=smooth&&Math.abs(a.r)<1e-10;
 const cosPhi=a.amp>1e-10?a.I[0]/a.amp:null,u=Math.hypot(...a.Ui),parallel=u>1e-10?a.Pem/u:0;
 const omega1=2*Math.PI*frequency,omega=omega1/polePairs,powerBase=3*voltage*current,power=a.Pem*powerBase,torque=power/omega;
 return {a,beta:a.beta,internalBeta:a.internalBeta,D,cosineD2,smooth,lossless,cosPhi,parallel,powerBase,power,torque,omega,omega1,voltage,current,frequency,polePairs,actualCurrent:a.amp*current,sineCurrent:-a.e/a.xd*Math.sin(b),cosineCurrent:smooth?Math.sqrt(cosineD2)/Math.hypot(a.r,a.xd):null};
}
const api={calculate};if(typeof module==='object')module.exports=api;else root.SyncTorqueOriginModel=api;
})(typeof window==='object'?window:globalThis);
