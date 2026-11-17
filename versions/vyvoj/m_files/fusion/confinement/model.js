/* Prescribed divergence-free fields in SI. No collisions or self-consistent MHD. */
(function confinementModel(root){'use strict';
const e=1.602176634e-19,m=3.3435837768e-27,R0=.65,a=.18,L=.65;
const add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>Math.hypot(...a),unit=a=>mul(a,1/(norm(a)||1));
// Elliptic integrals by AGM (parameter m=k²). Loop field is the analytic
// curl of its azimuthal vector potential; no differencing in particle steps.
function elliptic(t){let a=1,b=Math.sqrt(1-t),sum=t/2,w=1;for(let i=0;i<16;i++){const c=(a-b)/2;if(Math.abs(c)<1e-15)break;sum+=w*c*c;w*=2;const next=(a+b)/2;b=Math.sqrt(a*b);a=next;}const K=Math.PI/(2*a);return {K,E:K*(1-sum)};}
function loop(radius,z0,rho,z){const h=z-z0,A=radius,d=Math.hypot(A+rho,h),delta=(A-rho)**2+h*h;
 if(rho<1e-6)return {br:3*A*A*h*rho/(4*(A*A+h*h)**2.5),bz:A*A/(2*(A*A+h*h)**1.5),ap:A*A*rho/(4*(A*A+h*h)**1.5)};
 if(delta<1e-10)return {br:0,bz:0,ap:0}; // conductor centre excluded from traces
 const t=4*A*rho/(d*d),{K,E}=elliptic(t),f=1/(2*Math.PI*d);
 return {br:f*h/rho*(-K+(A*A+rho*rho+h*h)/delta*E),bz:f*(K+(A*A-rho*rho-h*h)/delta*E),ap:d/(4*Math.PI*rho)*((2-t)*K-2*E)};
}
const baseLoops=Array.from({length:16},(_,i)=>({radius:.24,z:(i/15*2-1)*L})),endLoops=[{radius:.24,z:-L},{radius:.24,z:L}];
function axial(loops,z){return loops.reduce((n,l)=>n+loop(l.radius,l.z,0,z).bz,0);}
const base0=axial(baseLoops,0),baseEnd=axial(baseLoops,L),end0=axial(endLoops,0),endEnd=axial(endLoops,L);
function config(p={}){const c={mode:'mirror',ideal:false,R0,a,B:.5,mirror:4,ratio:.15,r:.12,energy:1000,pitch:55,bend:0,seed:0,compose:0,...p};c.endWeight=c.mode==='mirror'?(c.mirror*base0-baseEnd)/(endEnd-c.mirror*end0):0;c.current=c.B/(base0+c.endWeight*end0);if(c.mode==='bend'){c.bendCoils=Array.from({length:20},(_,j)=>{const s=(j/20-.475)*2*Math.PI*c.R0,u=c.bend*s/c.R0;return {center:bent(s,0,0,c.bend,c.R0),axis:[Math.cos(u),Math.sin(u),0],radius:.201*c.a/a};});c.bendCurrent=1;if(!c.ideal)c.bendCurrent=c.B/bendField(c,bent(0,0,0,c.bend,c.R0))[0];}return c;}
function bendField(c,p,wantA=false){if(c.ideal){const k=c.bend/c.R0;if(k<1e-8)return wantA?[0,0,c.B*p[1]]:[c.B,0,0];const x=p[0],y=p[1]-(1/k-c.R0*c.bend),rr=Math.max(1e-16,x*x+y*y);return wantA?[0,0,-c.B/k*Math.log(k*Math.sqrt(rr))]:[-c.B*y/(k*rr),c.B*x/(k*rr),0];}let bx=0,by=0,bz=0;for(const coil of c.bendCoils){const dx=p[0]-coil.center[0],dy=p[1]-coil.center[1],dz=p[2]-coil.center[2],ax=coil.axis[0],ay=coil.axis[1],az=coil.axis[2],z=dx*ax+dy*ay+dz*az,rx=dx-z*ax,ry=dy-z*ay,rz=dz-z*az,rho=Math.hypot(rx,ry,rz),v=loop(coil.radius,0,rho,z);if(wantA){const f=rho?v.ap/rho:0;bx+=(ay*rz-az*ry)*f;by+=(az*rx-ax*rz)*f;bz+=(ax*ry-ay*rx)*f;}else{const f=rho?v.br/rho:0;bx+=ax*v.bz+rx*f;by+=ay*v.bz+ry*f;bz+=az*v.bz+rz*f;}}return [bx*c.bendCurrent,by*c.bendCurrent,bz*c.bendCurrent];}

function coils(c){return baseLoops.map(l=>({...l,weight:c.current})).concat(c.mode==='mirror'?endLoops.map(l=>({...l,weight:c.current*c.endWeight})):[]);}
function coilSum(c,rho,z){let br=0,bz=0,ap=0;for(const l of baseLoops){const b=loop(l.radius,l.z,rho,z);br+=b.br;bz+=b.bz;ap+=b.ap;}if(c.mode==='mirror')for(const l of endLoops){const b=loop(l.radius,l.z,rho,z);br+=c.endWeight*b.br;bz+=c.endWeight*b.bz;ap+=c.endWeight*b.ap;}return {br:br*c.current,bz:bz*c.current,ap:ap*c.current};}
function potential(c,p){if(c.mode==='bend')return bendField(c,p,true);const [x,y,z]=p,R=Math.hypot(x,y);if(c.mode==='solenoid'||c.mode==='mirror'){const ap=coilSum(c,R,z).ap;return R?[ -ap*y/R,ap*x/R,0]:[0,0,0];}const C=c.B*c.R0*c.ratio/c.r,ap=C*((R-c.R0)**2+z*z)/(2*R);return [-ap*y/R,ap*x/R,-c.B*c.R0*Math.log(R/c.R0)];}
function field(c,p){
 if(c.mode==='bend')return bendField(c,p);
 const [x,y,z]=p;
 if(c.mode==='solenoid'||c.mode==='mirror'){
  const rho=Math.hypot(x,y),b=coilSum(c,rho,z);
  return [rho?b.br*x/rho:0,rho?b.br*y/rho:0,b.bz];
 }
 const R=Math.max(1e-8,Math.hypot(x,y)),co=x/R,si=y/R,C=c.B*c.R0*c.ratio/c.r;
 // B_phi = B0 R0/R; B_theta = C r/R. Exactly divergence-free circular flux surfaces.
 return [-c.B*c.R0/R*si-C*z/R*co,c.B*c.R0/R*co-C*z/R*si,C*(R-c.R0)/R];
}
function initial(c){const r=c.mode==='mirror'||c.mode==='solenoid'?[.035,0,0]:torus(c.r,c.seed,0,c.R0),b=unit(field(c,r)),n=unit(cross(b,Math.abs(b[2])>.9?[0,1,0]:[0,0,1])),v=Math.sqrt(2*c.energy*e/m),angle=c.pitch*Math.PI/180;return {r,v:add(mul(b,v*Math.cos(angle)),mul(n,v*Math.sin(angle))),t:0};}
function step(c,s,dt){const h=add(s.r,mul(s.v,dt/2)),t=mul(field(c,h),e*dt/(2*m)),u=mul(t,2/(1+dot(t,t))),v=add(s.v,cross(add(s.v,cross(s.v,t)),u));return {r:add(h,mul(v,dt/2)),v,t:s.t+dt};}
function diagnostic(c,s){const B=field(c,s.r),b=norm(B),bh=unit(B),parallel=dot(s.v,bh),perp=add(s.v,mul(bh,-parallel));return {B:b,parallel,rho:m*norm(perp)/(e*b),center:add(s.r,mul(cross(s.v,B),m/(e*b*b))),energy:m*dot(s.v,s.v)/(2*e)};}
function escaped(c,s){return c.mode==='mirror'||c.mode==='solenoid'?Math.abs(s.r[2])>L||Math.hypot(s.r[0],s.r[1])>a:Math.hypot(Math.hypot(s.r[0],s.r[1])-c.R0,s.r[2])>c.a;}
function torus(r,theta,phi,R=R0){return [(R+r*Math.cos(theta))*Math.cos(phi),(R+r*Math.cos(theta))*Math.sin(phi),r*Math.sin(theta)];}
function line(c,theta=0,turns=6){const points=[],N=Math.ceil(turns*240),h=turns*2*Math.PI/N;let t=theta;const f=t=>c.ratio/c.r*(c.R0+c.r*Math.cos(t));for(let i=0;i<=N;i++){const phi=i*h;points.push({p:torus(c.r,t,phi,c.R0),theta:t,phi});const k1=f(t),k2=f(t+h*k1/2),k3=f(t+h*k2/2),k4=f(t+h*k3);t+=h*(k1+2*k2+2*k3+k4)/6;}return points;}
function safety(c){return c.ratio===0?Infinity:c.r/(c.ratio*Math.sqrt(c.R0*c.R0-c.r*c.r));}
function fluxRadius(c,r,z){const flux=r*coilSum(c,r,0).ap;let lo=0,hi=.235;for(let i=0;i<42;i++){const mid=(lo+hi)/2;if(mid*coilSum(c,mid,z).ap<flux)lo=mid;else hi=mid;}return (lo+hi)/2;}
// Constant arc length bend; continuous straight limit, ends meet at bend=1.
function bent(s,r,theta,bend,R=R0){const k=bend/R,u=k*s,center=k<1e-7?[s,0,0]:[Math.sin(u)/k,(1-Math.cos(u))/k-R*bend,0];return add(center,[r*Math.cos(theta)*Math.sin(u),-r*Math.cos(theta)*Math.cos(u),r*Math.sin(theta)]);}
// Arclength tracing works both inside and outside coils, including return flux.
function trace(c,start,ds=.012,steps=950){const result=[];for(const sign of [-1,1]){let p=start.slice(),part=[];for(let i=0;i<steps;i++){part.push(p);if(Math.abs(p[2])>1.45||Math.hypot(p[0],p[1])>1.05)break;if(coils(c).some(l=>Math.hypot(Math.hypot(p[0],p[1])-l.radius,p[2]-l.z)<.014))break;const h=ds*sign,k1=unit(field(c,p)),k2=unit(field(c,add(p,mul(k1,h/2)))),k3=unit(field(c,add(p,mul(k2,h/2)))),k4=unit(field(c,add(p,mul(k3,h))));p=add(p,mul(add(add(k1,mul(k2,2)),add(mul(k3,2),k4)),h/6));if(i>40&&norm(add(p,mul(start,-1)))<ds)break;}result.push(sign<0?part.reverse():part);}return result[0].concat(result[1].slice(1));}
function bendTrace(c,start,ds=.024,steps=360){if(c.ideal){const z=start[2],offset=-(start[1]+c.R0*c.bend),r=Math.hypot(offset,z),theta=Math.atan2(z,offset);return Array.from({length:385},(_,i)=>bent((i/384-.5)*2*Math.PI*c.R0,r,theta,c.bend,c.R0));}ds*=c.R0/R0;const halves=[];for(const sign of [-1,1]){let p=start.slice(),part=[];for(let i=0;i<steps;i++){part.push(p);if(norm(p)>3.4*c.R0/R0)break;if(c.bendCoils.some(coil=>{const d=add(p,mul(coil.center,-1)),z=dot(d,coil.axis);return Math.hypot(norm(add(d,mul(coil.axis,-z)))-coil.radius,z)<.012*c.a/a;}))break;const h=ds*sign,k1=unit(field(c,p)),k2=unit(field(c,add(p,mul(k1,h/2)))),k3=unit(field(c,add(p,mul(k2,h/2)))),k4=unit(field(c,add(p,mul(k3,h))));p=add(p,mul(add(add(k1,mul(k2,2)),add(mul(k3,2),k4)),h/6));if(i>40&&norm(add(p,mul(start,-1)))<ds*.65)break;}halves.push(sign<0?part.reverse():part);}return halves[0].concat(halves[1].slice(1));}
function bendData(params){const c=config({...params,B:1}),lines=Array.from({length:24},(_,i)=>bendTrace(c,bent(0,.76*c.a,i*Math.PI/12,c.bend,c.R0))),profile=Array.from({length:161},(_,i)=>{const x=(i/80-1)*c.a;return {x,B:norm(field(c,bent(0,x,0,c.bend,c.R0)))};});let surface=null;if(c.bend===1){const N=192,K=64,values=[];let min=Infinity,max=0;for(let i=0;i<=N;i++)for(let j=0;j<=K;j++){const B=norm(field(c,bent((i/N-.5)*2*Math.PI*c.R0,.72*c.a,j*2*Math.PI/K,1,c.R0)));values.push(B);min=Math.min(min,B);max=Math.max(max,B);}surface={N,K,values,min,max};}return {lines,profile,surface};}
function installBendWorker(scope){const cache=new Map();scope.onmessage=({data:{id,params}})=>{const key=[params.ideal,params.bend,params.R0,params.a].join(':');let result=cache.get(key);if(!result){result=bendData(params);cache.set(key,result);if(cache.size>12)cache.delete(cache.keys().next().value);}scope.postMessage({id,key,...result});};}
root.ConfinementModel={installBendWorker,bendData,config,field,potential,loop,coils,trace,bendTrace,fluxRadius,initial,step,diagnostic,escaped,torus,line,safety,bent,e,m,R0,a,L,add,mul,dot,cross,norm,unit};root.ConfinementModel.workerSource='('+confinementModel.toString()+')(self);';if(typeof module!=='undefined')module.exports=root.ConfinementModel;
})(typeof globalThis!=='undefined'?globalThis:this);
