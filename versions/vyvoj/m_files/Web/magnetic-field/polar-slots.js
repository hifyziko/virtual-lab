/* Linear finite-volume magnetostatics on a periodic polar mesh.
 * Same equation as linear-solver.cjs: -div(nu grad Az)=Jz.
 * Slot sources are normalized to their actual signed ampere-turns. */
(function(root){'use strict';
function system(Q,layers){
 const nt=Q*Math.max(6,Math.ceil(192/Q)),dt=2*Math.PI/nt,edges=[0];
 for(const [end,step]of [[140,4],[155,.75],[185,1.5],[224,3]])while(edges.at(-1)<end-1e-8)edges.push(Math.min(end,edges.at(-1)+step));
 const nr=edges.length-1,r=edges.slice(1).map((v,i)=>(v+edges[i])/2),size=nt*nr;
 const nu=new Float64Array(size),area=new Float64Array(size),slot=new Int32Array(size).fill(-1),layer=new Int8Array(size),totals=new Float64Array(Q*layers);
 for(let j=0;j<nr;j++)for(let i=0;i<nt;i++){
  const k=j*nt+i,a=(i+.5)*dt,rr=r[j],pitch=2*Math.PI/Q,ss=Math.floor(a/pitch),off=Math.abs(a-(ss+.5)*pitch),cavity=off<Math.min(10/172,.32*pitch),neck=off<Math.min(3/153,.16*pitch),airSlot=(rr>=153&&rr<160&&neck)||(rr>=160&&rr<183&&cavity);
  nu[k]=(rr<147||(rr>=153&&rr<211&&!airSlot))?1/350:1;
  area[k]=.5*(edges[j+1]**2-edges[j]**2)*dt;
  if(rr>=162&&rr<181&&cavity){slot[k]=ss;layer[k]=layers===2?+(rr<171.5):0;totals[ss*layers+layer[k]]+=area[k];}
 }
 const diag=new Float64Array(size),east=new Float64Array(size),north=new Float64Array(size);
 const harmonic=(a,b)=>2*a*b/(a+b);
 for(let j=0;j<nr;j++)for(let i=0;i<nt;i++){
  const k=j*nt+i,e=j*nt+(i+1)%nt;
  east[k]=harmonic(nu[k],nu[e])*(edges[j+1]-edges[j])/(r[j]*dt);diag[k]+=east[k];diag[e]+=east[k];
  if(j<nr-1){const n=k+nt;north[k]=harmonic(nu[k],nu[n])*edges[j+1]*dt/(r[j+1]-r[j]);diag[k]+=north[k];diag[n]+=north[k];}
  else diag[k]+=nu[k]*edges[j+1]*dt/(edges[j+1]-r[j]);
 }
 return {Q,layers,nt,nr,r,edges,size,diag,east,north,slot,layer,totals,area};
}
// IC(0)-preconditioned conjugate gradients; periodic angular edges are retained.
function solve(g,currents){
 const {nt,nr,size,diag,east,north,slot,layer,totals,area,layers}=g,b=new Float64Array(size);
 for(let k=0;k<size;k++)if(slot[k]>=0)b[k]=currents[slot[k]*layers+layer[k]]*area[k]/totals[slot[k]*layers+layer[k]];
 let b2=0;for(const v of b)b2+=v*v;if(b2<1e-24)return {a:new Float64Array(size),residual:0,iterations:0};
 const ld=new Float64Array(size),lr=new Float64Array(size),la=new Float64Array(size),lw=new Float64Array(size);
 for(let k=0;k<size;k++){
  const i=k%nt;let d=diag[k];if(k>=nt){lr[k]=-north[k-nt]/ld[k-nt];d-=lr[k]**2;}if(i){la[k]=-east[k-1]/ld[k-1];d-=la[k]**2;}if(i===nt-1){lw[k]=-east[k]/ld[k-i];d-=lw[k]**2;}ld[k]=Math.sqrt(Math.max(d,diag[k]*1e-12));
 }
 const x=new Float64Array(size),r=b.slice(),z=new Float64Array(size),p=new Float64Array(size),ap=new Float64Array(size),tmp=new Float64Array(size);
 function pre(){for(let k=0;k<size;k++){const i=k%nt;tmp[k]=(r[k]-(k>=nt?lr[k]*tmp[k-nt]:0)-(i?la[k]*tmp[k-1]:0)-(i===nt-1?lw[k]*tmp[k-i]:0))/ld[k];}for(let k=size-1;k>=0;k--){const i=k%nt;z[k]=(tmp[k]-(k<size-nt?lr[k+nt]*z[k+nt]:0)-(i<nt-1?la[k+1]*z[k+1]:0)-(i===0?lw[k+nt-1]*z[k+nt-1]:0))/ld[k];}}
 pre();p.set(z);let rz=0;for(let k=0;k<size;k++)rz+=r[k]*z[k];let residual=1,iterations=0;
 for(;iterations<6000&&residual>2e-7;iterations++){
  for(let k=0;k<size;k++){const i=k%nt,e=i===nt-1?k-nt+1:k+1,w=i===0?k+nt-1:k-1;ap[k]=diag[k]*p[k]-east[k]*p[e]-east[w]*p[w]-(k>=nt?north[k-nt]*p[k-nt]:0)-(k<size-nt?north[k]*p[k+nt]:0);}
  let pap=0;for(let k=0;k<size;k++)pap+=p[k]*ap[k];const alpha=rz/pap;let rr=0;for(let k=0;k<size;k++){x[k]+=alpha*p[k];r[k]-=alpha*ap[k];rr+=r[k]*r[k];}residual=Math.sqrt(rr/b2);if(residual<=2e-7)break;pre();let next=0;for(let k=0;k<size;k++)next+=r[k]*z[k];const beta=next/rz;for(let k=0;k<size;k++)p[k]=z[k]+beta*p[k];rz=next;
 }
 if(!Number.isFinite(residual)||residual>2e-6)throw Error('Výpočet pole nekonvergoval: '+residual);
 return {a:x,residual,iterations};
}
function cartesian(g,a,N=169,R=224){
 const out=new Float32Array(N*N),dr=2*R/(N-1),T=2*Math.PI;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const x=-R+i*dr,y=-R+j*dr,rr=Math.hypot(x,y);if(rr>=R)continue;
  const af=((Math.atan2(y,x)+T)%T)/T*g.nt-.5,lo=Math.floor(af),u=af-lo,aa=(lo%g.nt+g.nt)%g.nt,bb=(aa+1)%g.nt;
  let k=0;while(k<g.nr-1&&g.r[k+1]<rr)k++;const upper=k===g.nr-1?R:g.r[k+1],v=Math.max(0,Math.min(1,(rr-g.r[k])/(upper-g.r[k])));
  out[j*N+i]=(1-v)*((1-u)*a[k*g.nt+aa]+u*a[k*g.nt+bb])+(k===g.nr-1?0:v*((1-u)*a[(k+1)*g.nt+aa]+u*a[(k+1)*g.nt+bb]));
 }return out;
}
const api={system,solve,cartesian};if(typeof module!=='undefined')module.exports=api;else root.PolarSlotField=api;
})(globalThis);
