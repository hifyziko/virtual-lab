(function(root){
'use strict';
const nuclei={deuteron:{name:'Deuteron',Z:1,A:2},triton:{name:'Triton',Z:1,A:3},helium3:{name:'Jádro helia-3',Z:2,A:3},proton:{name:'Proton',Z:1,A:1},alpha:{name:'Alfa částice',Z:2,A:4},neutron:{name:'Neutron',Z:0,A:1}};
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
function multiPotential(p,targets,x,y){return targets.reduce((sum,t)=>sum+1439.96448*p.b.Z*(t.Z??p.a.Z)/Math.max(1e-8,Math.hypot(x-t.x,y-t.y)),0);}
function multiForce(p,targets,x,y){return targets.reduce((sum,t)=>{const f=force({...p,C:1439.96448*p.b.Z*(t.Z??p.a.Z)},x-t.x,y-t.y);return [sum[0]+f[0],sum[1]+f[1]];},[0,0]);}
function nearest(targets,x,y){let index=0,distance=Infinity;targets.forEach((t,i)=>{const d=Math.hypot(x-t.x,y-t.y);if(d<distance){distance=d;index=i;}});return {index,distance,target:targets[index]};}
function multiAdvance(p,targets,s,dt){const a=multiForce(p,targets,s.x,s.y);s.vx+=a[0]/p.mu*dt/2;s.vy+=a[1]/p.mu*dt/2;s.x+=s.vx*dt;s.y+=s.vy*dt;const b=multiForce(p,targets,s.x,s.y);s.vx+=b[0]/p.mu*dt/2;s.vy+=b[1]/p.mu*dt/2;return s;}
function multiShot(p,energy,angle,count,seed=1){const start=Math.max(24,Math.max(6,count*3)*(4*1439.96448)/energy),centers=targets(count,start,seed),speed=Math.sqrt(2*Math.max(.001,energy-multiPotential(p,centers,start,0))/p.mu),base=shot(p,energy,angle);return {...base,start,x:start,y:0,vx:-speed*Math.cos(angle),vy:speed*Math.sin(angle),dt:.0015*start/Math.max(speed,1),centers};}
function multiTrajectory(p,initial,maxRadius=initial.start*1.5){const s={...initial},points=[[s.x,s.y]];for(let i=0;i<30000;i++){multiAdvance(p,s.centers,s,s.dt*2);if(i%5===0)points.push([s.x,s.y]);if(nearest(s.centers,s.x,s.y).distance<=p.R||Math.hypot(s.x,s.y)>maxRadius)break;}return points;}
// Quasi-static mouse spring: cursor travel = nuclear travel + compliance *
// gained potential energy. Its local resistance is 1 + compliance * dU/ds.
// No elapsed time enters this mapping. The first U=E crossing is a hard limit.
function manualResistancePoint(p,centers,anchor,to,energy){
 const dx=to[0]-anchor.x,dy=to[1]-anchor.y,length=Math.hypot(dx,dy);if(length<1e-12)return {...anchor};
 const ux=dx/length,uy=dy/length,u0=multiPotential(p,centers,anchor.x,anchor.y),compliance=.5*p.C/Math.max(energy*energy,1e-12),point=s=>({x:anchor.x+ux*s,y:anchor.y+uy*s});
 const end=limitSeparation(centers,anchor,point(length),p.R),limit=Math.hypot(end.x-anchor.x,end.y-anchor.y);
 const allowed=s=>{const q=point(s),u=multiPotential(p,centers,q.x,q.y);return u<=energy*(1+1e-10)&&s+compliance*Math.max(0,u-u0)<=length;};
 if(u0>energy*(1+1e-10))return dragTowards(p,centers,anchor,to,energy,1,p.R);
 let previous=0;for(let i=0;i<4096&&previous<limit;i++){const q=point(previous),step=Math.min(limit-previous,.08*Math.max(p.R,nearest(centers,q.x,q.y).distance)),next=previous+step;if(!allowed(next)){let lo=previous,hi=next;for(let j=0;j<45;j++){const mid=(lo+hi)/2;if(allowed(mid))lo=mid;else hi=mid;}return point(lo);}previous=next;}
 return point(previous);
}

function dragTowards(p,centers,from,to,energy,dt,contactRadius=p.R){
 const contact=t=>typeof contactRadius==='function'?contactRadius(t):contactRadius,clearance=q=>Math.min(...centers.map(t=>Math.hypot(q.x-t.x,q.y-t.y)-contact(t)));
 const u=multiPotential(p,centers,from.x,from.y),f=multiForce(p,centers,from.x,from.y),dx=to[0]-from.x,dy=to[1]-from.y,outward=dx*f[0]+dy*f[1]>0||(!p.b.Z&&clearance({x:from.x+dx*1e-6,y:from.y+dy*1e-6})>clearance(from));
 // Square-root easing reaches the classical limit in finite time.
 // The segment guard below lands exactly on U=E instead of asymptotically
 // creeping toward it after the pointer has stopped.
 // Bound inward cursor displacement so a distant pointer cannot defeat the easing.
 const distance=nearest(centers,from.x,from.y).distance,surfaceMobility=Math.min(...centers.map(t=>{const d=Math.hypot(from.x-t.x,from.y-t.y),r=contact(t);return Math.max(0,Math.min(1,(d-r)/Math.max(r*.5,1e-9)));})),mobility=outward?1:Math.sqrt(Math.max(0,1-u/Math.max(energy,1e-12))*surfaceMobility),fraction=1-Math.exp(-14*mobility*dt),reach=outward?1:Math.min(1,.5*distance/Math.max(1e-12,Math.hypot(dx,dy)));
 // Analytic swept-circle guard also catches a cursor jump past a small target.
 const end=limitSeparation(centers,from,{x:from.x+dx*reach*fraction,y:from.y+dy*reach*fraction},contact);
 const allowed=q=>multiPotential(p,centers,q.x,q.y)<=energy*(1+1e-10)&&clearance(q)>=-1e-10;
 // A changed energy or explicit contact radius can invalidate a held point.
 // Permit retreat, never deeper penetration, instead of locking the pointer there.
 if(!allowed(from)){let previous={...from},oldU=u,oldDistance=clearance(from);for(let i=1;i<=64;i++){const t=i/64,q={x:from.x+(end.x-from.x)*t,y:from.y+(end.y-from.y)*t},nextU=multiPotential(p,centers,q.x,q.y),nextDistance=clearance(q);if(nextU>oldU+1e-10||nextDistance<oldDistance-1e-10)break;previous=q;oldU=nextU;oldDistance=nextDistance;}return previous;}
 // Scan the segment so a large cursor movement cannot jump across a repulsive region.
 let last=0;for(let i=1;i<=64;i++){const t=i/64,q={x:from.x+(end.x-from.x)*t,y:from.y+(end.y-from.y)*t};if(!allowed(q)){let lo=last,hi=t;for(let j=0;j<35;j++){const mid=(lo+hi)/2,m={x:from.x+(end.x-from.x)*mid,y:from.y+(end.y-from.y)*mid};if(allowed(m))lo=mid;else hi=mid;}return {x:from.x+(end.x-from.x)*lo,y:from.y+(end.y-from.y)*lo};}last=t;}
 return end;
}


// Model observation cell: flat interior, smooth conservative wall for charged bodies.
// This external constraint is not a model of magnetic confinement.
function cellField(cell,x,y,Z=1){
 if(!cell||!Z)return {fx:0,fy:0,U:0,gap:Infinity};
 let fx=0,fy=0,U=0,gap=Infinity;
 for(const [axis,position]of [['x',x],['y',y]]){
  const d=position-cell[axis],a=Math.abs(d),inner=cell[axis==='x'?'rx':'ry'],width=cell.width;
  gap=Math.min(gap,inner+width-a);if(a<=inner)continue;
  const q=Math.min(.999999,(a-inner)/width),one=1-q;
  U+=cell.energy*q**4/one**2;
  const f=-Math.sign(d)*cell.energy/width*(4*q**3/one**2+2*q**4/one**3);
  if(axis==='x')fx=f;else fy=f;
 }
 return {fx,fy,U,gap};
}
function makeCell(points,span,energy=26){
 const xs=points.map(q=>q.x),ys=points.map(q=>q.y),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
 return {x:(xmin+xmax)/2,y:(ymin+ymax)/2,rx:(xmax-xmin)/2+span*1.6,ry:Math.max((ymax-ymin)/2+span*1.6,span*1.8),width:span*.8,energy};
}
// Optional conservative near-surface repulsion for the enlarged gun scene only.
function surfaceField(a,b,r){
 const radius=(a.core||0)+(b.core||0),strength=Math.max(a.surfaceStrength||0,b.surfaceStrength||0);
 if(!a.Z||!b.Z||!radius||!strength||r>=2*radius||a.surfaceGroup&&a.surfaceGroup===b.surfaceGroup)return {U:0,F:0};
 const d=Math.max(r,1e-9),q=2*radius/d-1;return {U:strength*q**4,F:8*strength*radius*q**3/(d*d)};
}
function mobileAdvance(p,centers,s,dt,cell=null,held=false){
 const all=[s,...centers],mass=[p.b.A,...centers.map(t=>t.A??p.a.A)],charge=[p.b.Z,...centers.map(t=>t.Z??p.a.Z)];
 for(const b of all){b.vx=b.vx||0;b.vy=b.vy||0;}
 const forces=()=>{const f=all.map((b,i)=>{const w=cellField(cell,b.x,b.y,charge[i]);return [w.fx,w.fy];});
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
   const dx=all[i].x-all[j].x,dy=all[i].y-all[j].y,r=Math.max(1e-9,Math.hypot(dx,dy)),v=1439.96448*charge[i]*charge[j]/r**3+surfaceField({...all[i],Z:charge[i]},{...all[j],Z:charge[j]},r).F/r;
   f[i][0]+=v*dx;f[i][1]+=v*dy;f[j][0]-=v*dx;f[j][1]-=v*dy;
  }return f;
 };
 let remaining=dt;
 for(let k=0;k<256&&remaining>1e-12;k++){
  let h=remaining;const f=forces();
  for(let i=0;i<all.length;i++){
   const b=all[i],speed=Math.hypot(b.vx,b.vy),acc=Math.hypot(...f[i])/mass[i],wall=cellField(cell,b.x,b.y,charge[i]);
   if(wall.gap<=0){s.integrationLimited=true;return s;}
   if(Number.isFinite(wall.gap))h=Math.min(h,.05*Math.max(1e-7,wall.gap)/(speed+Math.sqrt(acc*Math.max(wall.gap,1e-7))+1e-9));
   for(let j=0;j<i;j++){
    const nuclearR=1.4*(Math.cbrt(mass[i])+Math.cbrt(mass[j])),coreR=charge[i]&&charge[j]?(b.core||0)+(all[j].core||0):0,gap=Math.hypot(b.x-all[j].x,b.y-all[j].y)-Math.max(nuclearR,coreR);
    if(gap<1e-3){s.collision=[j,i];return s;}
    const relative=Math.hypot(b.vx-all[j].vx,b.vy-all[j].vy);
    h=Math.min(h,.04*gap/(relative+Math.sqrt(acc*gap)+1e-9));
   }
  }
  for(let i=held?1:0;i<all.length;i++){const b=all[i];b.vx+=f[i][0]*h/(2*mass[i]);b.vy+=f[i][1]*h/(2*mass[i]);b.x+=b.vx*h;b.y+=b.vy*h;}
  const after=forces();for(let i=held?1:0;i<all.length;i++){all[i].vx+=after[i][0]*h/(2*mass[i]);all[i].vy+=after[i][1]*h/(2*mass[i]);}
  remaining-=h;
 }
 if(remaining>1e-12)s.integrationLimited=true;
 return s;
}
function* trajectoryChunks(p,initial,cell,steps=6000){
 const s={...initial},centers=initial.centers.map(t=>({...t})),points=[[s.x,s.y]],targetPaths=centers.map(t=>[[t.x,t.y]]);points.closest=nearest(centers,s.x,s.y).distance;points.targetPaths=targetPaths;
 const saveNodes=()=>[{x:s.x,y:s.y,kind:initial.projectileKind},...centers.map(t=>({x:t.x,y:t.y,kind:t.kind}))];points[0].nodes=saveNodes();targetPaths.forEach((path,j)=>{path[0].nodes=points[0].nodes;path[0].nodeIndex=j+1;});
 for(let i=0;i<steps;i++){
  mobileAdvance(p,centers,s,initial.dt,cell);points.closest=Math.min(points.closest,nearest(centers,s.x,s.y).distance);
  if(i%4===0){const nodes=saveNodes(),q=[s.x,s.y];q.nodes=nodes;points.push(q);centers.forEach((t,j)=>{const point=[t.x,t.y];point.nodes=nodes;point.nodeIndex=j+1;targetPaths[j].push(point);});}
  if(s.collision||s.integrationLimited||cellField(cell,s.x,s.y,p.b.Z).U>initial.energy*.1&&i>20)break;
  if(i%32===31)yield points;
 }
 return points;
}
function mobileTrajectory(p,initial,cell,steps=6000){const it=trajectoryChunks(p,initial,cell,steps);let result;do{result=it.next();}while(!result.done);return result.value;}

// Interaction-only clearance for enlarged glyphs. Never used by the flight integrator.
// Earliest segment/circle intersection prevents even a single long pointer jump.
function limitSeparation(centers,from,to,radius){
 const dx=to.x-from.x,dy=to.y-from.y,a=dx*dx+dy*dy;if(a<1e-24)return {...from};let fraction=1;
 for(const t of centers){const R=typeof radius==='function'?radius(t):radius,rx=from.x-t.x,ry=from.y-t.y,b=rx*dx+ry*dy,c=rx*rx+ry*ry-R*R;
  if(c<0){if(b<0)fraction=0;continue;} // Already overlapping: allow separation, never deeper entry.
  if(b>=0)continue;const discriminant=b*b-a*c;if(discriminant<0)continue;
  const hit=(-b-Math.sqrt(discriminant))/a;if(hit>=0&&hit<=fraction)fraction=Math.max(0,hit-1e-9);
 }
 return {x:from.x+dx*fraction,y:from.y+dy*fraction};
}


// Aiming with fixed sources: end just after the first closest approach.
function aimPreview(p,centers,initial){
 const state={...initial},points=[[state.x,state.y]],speed0=Math.hypot(state.vx,state.vy),distance=nearest(centers,state.x,state.y).distance;
 points.closest=distance;if(speed0<1e-10)return points;
 const frozen=centers.map(t=>({...t})),dt=distance/(speed0*500);let travel=0,encounter=null;
 for(let i=0;i<3500;i++){
  const near=nearest(frozen,state.x,state.y);if(near.distance<=p.R*1.1)break;
  const before=frozen.map(t=>(state.x-t.x)*state.vx+(state.y-t.y)*state.vy),speed=Math.hypot(state.vx,state.vy),h=Math.min(dt,.015*near.distance/Math.max(speed,speed0*.01)),old=[state.x,state.y];
  const advanceAim=()=>{const forceAt=()=>{const force=multiForce(p,frozen,state.x,state.y);for(const t of frozen){const dx=state.x-t.x,dy=state.y-t.y,r=Math.max(1e-9,Math.hypot(dx,dy)),f=surfaceField({...state,Z:p.b.Z},{...t,Z:t.Z??p.a.Z},r).F;force[0]+=f*dx/r;force[1]+=f*dy/r;}return force;};const f=forceAt();state.vx+=f[0]/p.b.A*h/2;state.vy+=f[1]/p.b.A*h/2;state.x+=state.vx*h;state.y+=state.vy*h;const next=forceAt();state.vx+=next[0]/p.b.A*h/2;state.vy+=next[1]/p.b.A*h/2;};advanceAim();travel+=Math.hypot(state.x-old[0],state.y-old[1]);const next=nearest(frozen,state.x,state.y);points.closest=Math.min(points.closest,next.distance);points.push([state.x,state.y]);
  const radial=(state.x-next.target.x)*state.vx+(state.y-next.target.y)*state.vy;
  if(!encounter&&before[next.index]<0&&radial>=0){encounter={index:next.index,r:next.distance,travel};points.encounter=next.index;}
  if(encounter&&(next.index!==encounter.index||next.distance>encounter.r*1.2||travel-encounter.travel>encounter.r*.65))break;
  if(travel>distance*3)break;
 }return points;
}

function closestAimTarget(centers,origin,heading){let index=0,error=Infinity,distance=Infinity;centers.forEach((t,i)=>{const dx=t.x-origin[0],dy=t.y-origin[1],bearing=Math.atan2(dy,dx),diff=Math.abs(Math.atan2(Math.sin(bearing-heading),Math.cos(bearing-heading))),d=Math.hypot(dx,dy);if(diff<error-1e-10||(Math.abs(diff-error)<1e-10&&d<distance)){index=i;error=diff;distance=d;}});return index;}
const api={manualResistancePoint,surfaceField,aimPreview,trajectoryChunks,limitSeparation,cellField,makeCell,mobileAdvance,mobileTrajectory,closestAimTarget,targets,multiPotential,multiForce,nearest,multiAdvance,multiShot,multiTrajectory,dragTowards,nuclei,pair,potential,force,turning,kB,thermalMean,sampleEnergy,shot,effective,penetration,advance,trajectory};root.CoulombModel=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
