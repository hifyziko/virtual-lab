/* Circular, divergence-free teaching equilibrium; fixed COMPASS-U geometry.
   Not an MHD equilibrium/stability solver. Used offline for all playback data. */
(function(root){'use strict';
const R=.89,a=.27,B0=.5,e=1.602176634e-19,m=3.3435837768e-27,energy=1000,pitch=30*Math.PI/180;
const radius=i=>a*(.1+.045*i),angle=u=>Math.PI/2*u*u;
const profile=s=>s<=1?2*s-s*s*s:1/s;
function q(u,r){if(u<=0)return Infinity;if(u>=1)return 0;return r/(profile(r/a)*Math.sqrt(R*R-r*r)*Math.tan(angle(u)));}
function snap(q,r){return Math.sqrt(2/Math.PI*Math.atan(r/(q*profile(r/a)*Math.sqrt(R*R-r*r))));}
function field(u,x,y,z){const rr=Math.max(1e-8,Math.hypot(x,y)),dr=rr-R,r=Math.hypot(dr,z),p=B0*Math.sin(angle(u))*R/rr*profile(r/a),t=B0*Math.cos(angle(u))*R/rr,br=r?-p*z/r:0;return [br*x/rr-t*y/rr,br*y/rr+t*x/rr,r?p*dr/r:0];}
function potential(u,x,y,z){const rr=Math.hypot(x,y),s=Math.hypot(rr-R,z)/a,psi=B0*Math.sin(angle(u))*R*a*(s<=1?s*s-s**4/4:.75+Math.log(s)),ap=psi/rr;return [-ap*y/rr,ap*x/rr,-B0*Math.cos(angle(u))*R*Math.log(rr/R)];}
const point=(r,t,p)=>[(R+r*Math.cos(t))*Math.cos(p),(R+r*Math.cos(t))*Math.sin(p),r*Math.sin(t)];
function line(u,r,closure=0){const Q=q(u,r),n=closure===1.5?2:1,turns=closure?n:Math.min(3,3/Math.max(Q,1e-9)),end=2*Math.PI*turns,N=768,out=[];
 for(let i=0;i<=N;i++){let t=end*i/N,p;if(u===0){t=0;p=2*Math.PI*i/N;}else{const loops=Math.floor(t/(2*Math.PI)),v=t-loops*2*Math.PI,phase=2*Math.atan2(Math.sqrt(R-r)*Math.sin(v/2),Math.sqrt(R+r)*Math.cos(v/2));p=Q*(2*Math.PI*loops+phase);}out.push(...point(r,t,p));}return new Float32Array(out);}
function trajectory(u,r,{frames=1920,dt=4e-8,substeps=64}={}){
 let x=R+r,y=0,z=0;const b=field(u,x,y,z),bn=Math.hypot(...b),v=Math.sqrt(2*energy*e/m),vp=v*Math.cos(pitch),vt=v*Math.sin(pitch);let vx=0,vy=vp*b[1]/bn-vt*b[2]/bn,vz=vp*b[2]/bn+vt*b[1]/bn,t=0,escaped=-1,maxEnergyError=0;const positions=new Float32Array((frames+1)*6),h=dt/substeps;
 for(let i=0;i<=frames;i++){
  const B=field(u,x,y,z),b2=B[0]**2+B[1]**2+B[2]**2,k=m/(e*b2),j=i*6;positions.set([x,y,z,x+(vy*B[2]-vz*B[1])*k,y+(vz*B[0]-vx*B[2])*k,z+(vx*B[1]-vy*B[0])*k],j);
  if(escaped<0&&Math.hypot(Math.hypot(x,y)-R,z)>a)escaped=i;
  maxEnergyError=Math.max(maxEnergyError,Math.abs((vx*vx+vy*vy+vz*vz)/(v*v)-1));
  if(i===frames)break;
  for(let step=0;step<substeps;step++){
   const hx=x+vx*h/2,hy=y+vy*h/2,hz=z+vz*h/2,B=field(u,hx,hy,hz),f=e*h/(2*m),tx=B[0]*f,ty=B[1]*f,tz=B[2]*f,w=2/(1+tx*tx+ty*ty+tz*tz),px=vx+vy*tz-vz*ty,py=vy+vz*tx-vx*tz,pz=vz+vx*ty-vy*tx;
   vx+=(py*tz-pz*ty)*w;vy+=(pz*tx-px*tz)*w;vz+=(px*ty-py*tx)*w;x=hx+vx*h/2;y=hy+vy*h/2;z=hz+vz*h/2;t+=h;
  }
 }
 return {positions,dt,escaped,maxEnergyError};
}
const mixes=[...Array.from({length:61},(_,i)=>i/60),...Array.from({length:21},(_,i)=>[1,1.5,2,3].map(Q=>snap(Q,radius(i)))).flat()].sort((a,b)=>a-b).filter((v,i,all)=>i===0||v-all[i-1]>1e-12);
function states(i){const r=radius(i);return mixes.map((u,j)=>({id:i+':'+j,i,u,r,closure:[1,1.5,2,3].find(Q=>Math.abs(q(u,r)-Q)<1e-9)||0}));}

root.HelicityModel={R,a,B0,energy,pitch,radius,angle,profile,q,snap,field,potential,point,line,trajectory,states,mixes};if(typeof module!=='undefined')module.exports=root.HelicityModel;
})(typeof globalThis!=='undefined'?globalThis:this);
