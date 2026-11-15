(function(root){
'use strict';
const nuclei={deuteron:{name:'Deuterium',Z:1,A:2},triton:{name:'Tritium',Z:1,A:3},helium3:{name:'Helium-3',Z:2,A:3},proton:{name:'Proton',Z:1,A:1},alpha:{name:'Helium-4',Z:2,A:4},neutron:{name:'Neutron',Z:0,A:1}};
function pair(a,b){a=nuclei[a];b=nuclei[b];return {a,b,C:1439.96448*a.Z*b.Z,R:1.4*(Math.cbrt(a.A)+Math.cbrt(b.A)),mu:a.A*b.A/(a.A+b.A)};}
function potential(p,r){return p.C/r;}
function force(p,x,y){const r=Math.hypot(x,y);return r?[p.C*x/r**3,p.C*y/r**3]:[0,0];}
function turning(p,energy){return p.C/energy;}

const kB=.08617333262; // keV per million kelvin
function thermalMean(temperature){return 1.5*kB*temperature;}
function sampleEnergy(temperature,rng=Math.random){let sum=0;for(let i=0;i<3;i++){const z=Math.sqrt(-2*Math.log(Math.max(1e-15,rng())))*Math.cos(2*Math.PI*rng());sum+=z*z;}return .5*kB*temperature*sum;}
function shot(p,energy,angle=0){
 const start=Math.max(24,4*p.C/energy),speed=Math.sqrt(2*(energy-potential(p,start))/p.mu),vx=-speed*Math.cos(angle),vy=speed*Math.sin(angle),L=p.mu*start*vy,B=L*L/(2*p.mu),rmin=(p.C+Math.sqrt(p.C*p.C+4*energy*B))/(2*energy);
 return {x:start,y:0,vx,vy,start,energy,angle,L,B,rmin,dt:.0015*start/Math.max(speed,1)};
}
function effective(p,s,r){return potential(p,r)+s.B/(r*r);}
function penetration(p,s){
 if(s.rmin<=p.R)return 1;
 // Radial WKB through Coulomb + centrifugal barrier to the schematic nuclear boundary.
 const N=400,h=(s.rmin-p.R)/N,f=r=>Math.sqrt(Math.max(0,2*p.mu*931494.10242*(effective(p,s,r)-s.energy)))/197326.9804;
 let sum=f(p.R)+f(s.rmin);for(let i=1;i<N;i++)sum+=(i%2?4:2)*f(p.R+i*h);
 return Math.exp(-2*sum*h/3);
}
function advance(p,s,dt){const a=force(p,s.x,s.y);s.vx+=a[0]/p.mu*dt/2;s.vy+=a[1]/p.mu*dt/2;s.x+=s.vx*dt;s.y+=s.vy*dt;const b=force(p,s.x,s.y);s.vx+=b[0]/p.mu*dt/2;s.vy+=b[1]/p.mu*dt/2;return s;}
function trajectory(p,initial){const s={...initial},points=[[s.x,s.y]];for(let i=0;i<4000;i++){advance(p,s,s.dt*2);if(i%5===0)points.push([s.x,s.y]);if(Math.hypot(s.x,s.y)<=p.R||Math.hypot(s.x,s.y)>s.start*1.35)break;}return points;}

function targets(count,span,seed=1){let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;},points=[{x:0,y:0}];for(let i=1;i<count;i++){let best=null,clearance=-1;for(let j=0;j<160;j++){const point={x:-2.2+random()*1.7,y:-.75+random()*1.5},d=Math.min(...points.map(p=>Math.hypot(p.x-point.x,p.y-point.y)));if(d>clearance){best=point;clearance=d;}}points.push(best);}return points.map(p=>({x:p.x*span,y:p.y*span}));}
function multiPotential(p,targets,x,y){return targets.reduce((sum,t)=>sum+p.C/Math.max(1e-8,Math.hypot(x-t.x,y-t.y)),0);}
function multiForce(p,targets,x,y){return targets.reduce((sum,t)=>{const f=force(p,x-t.x,y-t.y);return [sum[0]+f[0],sum[1]+f[1]];},[0,0]);}
function nearest(targets,x,y){let index=0,distance=Infinity;targets.forEach((t,i)=>{const d=Math.hypot(x-t.x,y-t.y);if(d<distance){distance=d;index=i;}});return {index,distance,target:targets[index]};}
function multiAdvance(p,targets,s,dt){const a=multiForce(p,targets,s.x,s.y);s.vx+=a[0]/p.mu*dt/2;s.vy+=a[1]/p.mu*dt/2;s.x+=s.vx*dt;s.y+=s.vy*dt;const b=multiForce(p,targets,s.x,s.y);s.vx+=b[0]/p.mu*dt/2;s.vy+=b[1]/p.mu*dt/2;return s;}
function multiShot(p,energy,angle,count,seed=1){const start=Math.max(24,Math.max(6,count*3)*p.C/energy),centers=targets(count,start,seed),speed=Math.sqrt(2*Math.max(.001,energy-multiPotential(p,centers,start,0))/p.mu),base=shot(p,energy,angle);return {...base,start,x:start,y:0,vx:-speed*Math.cos(angle),vy:speed*Math.sin(angle),dt:.0015*start/Math.max(speed,1),centers};}
function multiTrajectory(p,initial,maxRadius=initial.start*1.5){const s={...initial},points=[[s.x,s.y]];for(let i=0;i<30000;i++){multiAdvance(p,s.centers,s,s.dt*2);if(i%5===0)points.push([s.x,s.y]);if(nearest(s.centers,s.x,s.y).distance<=p.R||Math.hypot(s.x,s.y)>maxRadius)break;}return points;}
function dragTowards(p,centers,from,to,energy,dt,contactRadius=p.R){
 const u=multiPotential(p,centers,from.x,from.y),f=multiForce(p,centers,from.x,from.y),dx=to[0]-from.x,dy=to[1]-from.y,outward=dx*f[0]+dy*f[1]>0;
 // Energy-based resistance tends continuously to zero at the classical limit.
 // Bound inward cursor displacement so a distant pointer cannot defeat the easing.
 const distance=nearest(centers,from.x,from.y).distance,mobility=outward?1:Math.max(0,1-u/Math.max(energy,1e-12)),fraction=1-Math.exp(-14*mobility*dt),reach=outward?1:Math.min(1,.5*distance/Math.max(1e-12,Math.hypot(dx,dy)));
 const end={x:from.x+dx*reach*fraction,y:from.y+dy*reach*fraction};
 const allowed=q=>multiPotential(p,centers,q.x,q.y)<=energy*(1+1e-10)&&nearest(centers,q.x,q.y).distance>=contactRadius;
 // A changed energy or explicit contact radius can invalidate a held point.
 // Permit retreat, never deeper penetration, instead of locking the pointer there.
 if(!allowed(from)){let previous={...from},oldU=u,oldDistance=nearest(centers,from.x,from.y).distance;for(let i=1;i<=64;i++){const t=i/64,q={x:from.x+(end.x-from.x)*t,y:from.y+(end.y-from.y)*t},nextU=multiPotential(p,centers,q.x,q.y),nextDistance=nearest(centers,q.x,q.y).distance;if(nextU>oldU+1e-10||nextDistance<oldDistance-1e-10)break;previous=q;oldU=nextU;oldDistance=nextDistance;}return previous;}
 // Scan the segment so a large cursor movement cannot jump across a repulsive region.
 let last=0;for(let i=1;i<=64;i++){const t=i/64,q={x:from.x+(end.x-from.x)*t,y:from.y+(end.y-from.y)*t};if(!allowed(q)){let lo=last,hi=t;for(let j=0;j<35;j++){const mid=(lo+hi)/2,m={x:from.x+(end.x-from.x)*mid,y:from.y+(end.y-from.y)*mid};if(allowed(m))lo=mid;else hi=mid;}return {x:from.x+(end.x-from.x)*lo,y:from.y+(end.y-from.y)*lo};}last=t;}
 return end;
}

function closestAimTarget(centers,origin,heading){let index=0,error=Infinity,distance=Infinity;centers.forEach((t,i)=>{const dx=t.x-origin[0],dy=t.y-origin[1],bearing=Math.atan2(dy,dx),diff=Math.abs(Math.atan2(Math.sin(bearing-heading),Math.cos(bearing-heading))),d=Math.hypot(dx,dy);if(diff<error-1e-10||(Math.abs(diff-error)<1e-10&&d<distance)){index=i;error=diff;distance=d;}});return index;}
const api={closestAimTarget,targets,multiPotential,multiForce,nearest,multiAdvance,multiShot,multiTrajectory,dragTowards,nuclei,pair,potential,force,turning,kB,thermalMean,sampleEnergy,shot,effective,penetration,advance,trajectory};root.CoulombModel=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
