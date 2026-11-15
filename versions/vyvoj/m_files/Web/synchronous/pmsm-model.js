/* Linear PMSM, amplitude-invariant Park transform; phase peak A/V, SI. */
(function(root){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function parameters(type='ipm',extra={}){return {type,p:2,R:.08,Ld:.003,Lq:type==='spm'?.003:.006,psi:.18,Imax:100,Udc:300,...extra};}
function point(s,d,q,n=0){const wm=n*Math.PI/30,w=s.p*wm,fd=s.psi+s.Ld*d,fq=s.Lq*q,ud=s.R*d-w*fq,uq=s.R*q+w*fd,mag=1.5*s.p*s.psi*q,rel=1.5*s.p*(s.Ld-s.Lq)*d*q;
return {d,q,n,wm,w,fd,fq,ud,uq,I:Math.hypot(d,q),U:Math.hypot(ud,uq),Umax:s.Udc/Math.sqrt(3),mag,rel,M:mag+rel,P:(mag+rel)*wm,Pin:1.5*(ud*d+uq*q),loss:1.5*s.R*(d*d+q*q)};}
function mtpa(s,I){const delta=s.Lq-s.Ld,d=Math.abs(delta)<1e-12?0:-2*delta*I*I/(s.psi+Math.sqrt(s.psi*s.psi+8*delta*delta*I*I));return point(s,d,Math.sqrt(Math.max(0,I*I-d*d)));}
function golden(f,a,b){const k=(Math.sqrt(5)-1)/2;let c=b-k*(b-a),d=a+k*(b-a),fc=f(c),fd=f(d);for(let i=0;i<50;i++){if(fc<fd){b=d;d=c;fd=fc;c=b-k*(b-a);fc=f(c);}else{a=c;c=d;fc=fd;d=a+k*(b-a);fd=f(d);}}return (a+b)/2;}
// Exact voltage conic, including stator resistance. Return allowable positive q interval.
function qRange(s,d,n,limitCurrent=true){const w=s.p*n*Math.PI/30,U=s.Udc/Math.sqrt(3),A=(w*s.Lq)**2+s.R*s.R,B=2*s.R*w*(s.psi+(s.Ld-s.Lq)*d),C=(s.R*d)**2+(w*(s.psi+s.Ld*d))**2-U*U;
let lo=0,hi=Infinity;if(A>1e-20){const disc=B*B-4*A*C;if(disc<0)return null;lo=Math.max(0,(-B-Math.sqrt(disc))/(2*A));hi=(-B+Math.sqrt(disc))/(2*A);}else if(C>0)return null;
if(limitCurrent){if(Math.abs(d)>s.Imax+1e-9)return null;hi=Math.min(hi,Math.sqrt(Math.max(0,s.Imax*s.Imax-d*d)));}return hi>=lo&&hi>=0?[lo,hi]:null;}
function maximum(s,n){
 // Search the voltage ellipse's d projection, not a fixed coarse current grid.
 // At high speed the feasible interval collapses around -psi/Ld.
 const w=s.p*n*Math.PI/30,det=s.R*s.R+w*w*s.Ld*s.Lq;
 let lo=-s.Imax,hi=0;
 if(det>1e-15){const center=-w*w*s.Lq*s.psi/det,radius=s.Udc/Math.sqrt(3)*Math.hypot(s.R,w*s.Lq)/det;lo=Math.max(lo,center-radius);hi=Math.min(hi,center+radius);}
 const at=d=>{const r=qRange(s,d,n);return r?point(s,d,r[1],n):null;},N=320;let best=null,index=0;
 if(lo<=hi)for(let i=0;i<=N;i++){const v=at(lo+i*(hi-lo)/N);if(v&&(!best||v.M>best.M)){best=v;index=i;}}
 if(!best)return {...point(s,0,0,n),feasible:false,regime:'unavailable'};
 const d=golden(x=>{const v=at(x);return v?-v.M:Infinity;},lo+Math.max(0,index-1)*(hi-lo)/N,lo+Math.min(N,index+1)*(hi-lo)/N),v=at(d);if(v&&v.M>best.M)best=v;
 const a=mtpa(s,best.I),voltage=best.U>best.Umax*(1-1e-5),current=best.I>s.Imax*(1-1e-5);
 return {...best,feasible:true,regime:!voltage||Math.abs(best.d-a.d)<1e-3?'mtpa':current?'fw':'mtpv'};
}
function requested(s,n,M,cap=maximum(s,n)){
 M=Math.max(0,M);if(!cap.feasible)return {...cap,requested:M,limited:true};
 if(M>=cap.M-1e-7)return {...cap,requested:M,limited:M>cap.M+1e-5};
 const at=d=>point(s,d,M/(1.5*s.p*(s.psi+(s.Ld-s.Lq)*d)),n);
 const allowed=d=>{const a=at(d);return a.I<=s.Imax+1e-8&&a.U<=a.Umax+1e-8;};
 // Feasible torque section is convex in the normal motoring sector. Locate its edges,
 // then minimize copper loss/current along the section (not a scaled maximum point).
 const N=400,positions=Array.from({length:N+1},(_,i)=>-s.Imax+i*s.Imax/N).concat(cap.d).sort((a,b)=>a-b);let first=-1,last=-1;for(let i=0;i<positions.length;i++){if(allowed(positions[i])){if(first<0)first=i;last=i;}}
 if(first<0)return {...cap,requested:M,limited:true};
 let a=positions[first],b=positions[last];
 if(first>0){let l=positions[first-1],r=a;for(let j=0;j<40;j++){const m=(l+r)/2;if(allowed(m))r=m;else l=m;}a=r;}
 if(last<positions.length-1){let l=b,r=positions[last+1];for(let j=0;j<40;j++){const m=(l+r)/2;if(allowed(m))l=m;else r=m;}b=l;}
 const d=golden(x=>at(x).I,a,b),v=at(d),opt=mtpa(s,v.I);
 return {...v,feasible:true,requested:M,limited:false,regime:Math.abs(d-opt.d)<.01?'mtpa':'fw'};
}
function voltageCurve(s,n,count=240){const w=s.p*n*Math.PI/30,det=s.R*s.R+w*w*s.Ld*s.Lq;if(det<1e-15)return [];const U=s.Udc/Math.sqrt(3);return Array.from({length:count+1},(_,i)=>{const a=i/count*2*Math.PI,ud=U*Math.cos(a),uq=U*Math.sin(a)-w*s.psi;return {d:(s.R*ud+w*s.Lq*uq)/det,q:(-w*s.Ld*ud+s.R*uq)/det};});}
function envelope(s,maxN=9000,count=90){return Array.from({length:count+1},(_,i)=>maximum(s,i/count*maxN));}
// Limit along the maximum motoring trajectory, not a finite-speed operating point.
// Although M -> 0, M*omega_m -> 3/2 Ic (Umax - R Ic).
function fieldWeakeningLimit(s){const I=s.psi/s.Ld,Umax=s.Udc/Math.sqrt(3),currentOK=I<=s.Imax+1e-9,voltageOK=s.R*I<=Umax+1e-9;return {d:-I,q:0,I,fd:0,fq:0,M:0,mag:0,rel:0,n:null,limit:true,U:Umax,Umax,ud:-Umax,uq:0,P:1.5*I*Math.max(0,Umax-s.R*I),feasible:currentOK&&voltageOK,currentOK,voltageOK,regime:'limit'};}
function loadTorque(n,load,kind){return kind==='fan'?load*(n/3000)**2:load;}
function createRun(){return {t:0,n:0,ref:0,torqueRef:0,integral:0,history:[],a:null,finished:false};}
// Motoric FOC abstraction: PI speed loop -> torque limits -> optimal dq references.
// Current loops are ideal. No load-torque feedforward: load acts only on mechanics.
function advance(s,r,dt,c){
 if(c.mode==='maximum'&&r.finished)return r;
 if(c.mode!=='maximum')r.finished=false;
 dt=clamp(dt,0,.05);const steps=Math.ceil(dt/.005),h=steps?dt/steps:0;
 const torqueMode=c.mode==='torque',demo=c.mode==='maximum',J=Math.max(.001,c.J),wn=12,kp=2*J*wn,ki=J*wn*wn,kaw=2*wn;
 const slew=(v,to,rate,h)=>v+clamp(to-v,-rate*h,rate*h);
 function operatingPoint(){
  const cap=maximum(s,r.n),ref=demo||torqueMode?c.target:r.ref,load=loadTorque(r.n,c.load,c.kind),friction=.002*r.n*Math.PI/30;
  const error=(ref-r.n)*Math.PI/30,raw=kp*error+r.integral;
  const command=demo?Math.max(0,cap.M):torqueMode?r.torqueRef:clamp(raw,0,c.torqueLimit??140);
  // In torque mode the speed PI acts only as a positive-speed ceiling override.
  const desired=torqueMode?Math.min(command,Math.max(0,raw)):command;
  const a=requested(s,r.n,desired,cap);
  return {...a,load,ref,command,available:cap.feasible?cap.M:0,raw,error,
   speedLimited:torqueMode&&desired<command-1e-3,
   torqueLimited:!demo&&(a.M<command-1e-3||!torqueMode&&raw>(c.torqueLimit??140)+1e-3),
   accel:(a.M-load-friction)/J};
 }
 for(let i=0;i<steps;i++){
  if(demo&&r.n>=c.target){r.finished=true;break;}
  if(!demo&&!torqueMode)r.ref=slew(r.ref,c.target,c.ramp,h);
  if(torqueMode)r.torqueRef=slew(r.torqueRef,Math.max(0,c.torque??60),c.torqueRamp??400,h);
  const a=operatingPoint();if(!a.feasible){r.a=a;break;}
  const next=Math.max(0,r.n+a.accel*30/Math.PI*h);
  if(demo&&next>=c.target&&next>r.n){r.t+=h*(c.target-r.n)/(next-r.n);r.n=c.target;r.finished=true;break;}
  // Tracking anti-windup uses achieved torque, including the electrical limiter.
  if(!demo)r.integral+=h*(ki*a.error+kaw*(a.M-a.raw));
  r.n=next;r.t+=h;
 }
 // Re-sample all electrical quantities at the displayed mechanical speed.
 r.a=operatingPoint();
 if(r.a.feasible){
  const row={t:r.t,n:r.n,ref:r.a.ref,M:r.a.M,command:r.a.command,available:r.a.available,load:r.a.load,I:r.a.I,U:r.a.U,d:r.a.d,q:r.a.q};
  if(r.history.length>1&&r.history.at(-1).t-r.history.at(-2).t<.04)r.history[r.history.length-1]=row;else r.history.push(row);
  while(r.history.length>800)r.history.shift();
 }return r;
}
const api={parameters,point,mtpa,maximum,requested,qRange,voltageCurve,envelope,fieldWeakeningLimit,loadTorque,createRun,advance,clamp};if(typeof module!=='undefined')module.exports=api;root.PMSM=api;
})(typeof window==='undefined'?globalThis:window);
