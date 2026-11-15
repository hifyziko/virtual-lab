/* D-T products and mobile neighbouring nuclei. Units: keV, fm, keV/c, fm/c.
   Pairwise electrostatic interaction; secondary nuclear reactions are not inferred. */
(function(root){'use strict';
const Q=17589.3,masses={alpha:3727379.4066,neutron:939565.4205},C=1439.96448;
const nuclearMass={1:938272.08816,2:1875612.94257,3:2808921.13298,4:masses.alpha};
function kinetic(b){const momentum=Math.hypot(b.px,b.py);return momentum*momentum/(Math.hypot(b.mass,momentum)+b.mass);}
function velocity(b){const e=Math.hypot(b.mass,b.px,b.py);return [b.px/e,b.py/e];}
function potential(b,sources){return sources.reduce((sum,t)=>t===b?sum:sum+C*b.Z*t.Z/Math.max(1e-9,Math.hypot(b.x-t.x,b.y-t.y)),0);}
function force(b,sources){let fx=0,fy=0;for(const t of sources){if(t===b||!b.Z||!t.Z)continue;const dx=b.x-t.x,dy=b.y-t.y,r=Math.max(1e-9,Math.hypot(dx,dy)),f=C*b.Z*t.Z/r**3;fx+=f*dx;fy+=f*dy;}return [fx,fy];}
function bodies(state){return [...state.products,...state.sources];}
function totalEnergy(state){const all=bodies(state);let value=all.reduce((sum,b)=>sum+kinetic(b),0);for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)value+=potential(all[i],[all[j]]);return value;}
function totalMomentum(state){return bodies(state).reduce((sum,b)=>[sum[0]+b.px,sum[1]+b.py],[0,0]);}
function create({x,y,energy=0,angle=0,sources=[]}){
 const ma=masses.alpha,mn=masses.neutron,W=ma+mn+Q+Math.max(0,energy),momentum=Math.sqrt((W*W-(ma+mn)**2)*(W*W-(ma-mn)**2))/(2*W),px=momentum*Math.cos(angle),py=momentum*Math.sin(angle);
 const products=[{id:'alpha',A:4,Z:2,mass:ma,x,y,px:-px,py:-py},{id:'neutron',A:1,Z:0,mass:mn,x,y,px,py}];
 const state={products,sources:sources.map(t=>({...t,mass:t.mass||nuclearMass[t.A]||t.A*931494.10242,px:t.px||0,py:t.py||0})),time:0,energy:Q+Math.max(0,energy),collision:null};state.initialEnergy=totalEnergy(state);state.initialMomentum=totalMomentum(state);return state;
}
function pairForces(all){const forces=all.map(()=>[0,0]);for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){if(!all[i].Z||!all[j].Z)continue;const dx=all[i].x-all[j].x,dy=all[i].y-all[j].y,r=Math.max(1e-9,Math.hypot(dx,dy)),coefficient=C*all[i].Z*all[j].Z/r**3,fx=coefficient*dx,fy=coefficient*dy;forces[i][0]+=fx;forces[i][1]+=fy;forces[j][0]-=fx;forces[j][1]-=fy;}return forces;}
function advance(state,dt){
 if(state.collision)return;const all=bodies(state),maxSpeed=Math.max(...all.map(b=>Math.hypot(...velocity(b))));let clearance=Infinity,closest=null;
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
  // Alpha and neutron are the already resolved exit channel, born at one point.
  if(i===0&&j===1)continue;
  const b=all[i],t=all[j],R=1.4*(Math.cbrt(b.A)+Math.cbrt(t.A)),gap=Math.hypot(b.x-t.x,b.y-t.y)-R;
  if(gap<clearance){clearance=gap;closest={product:b.id,target:t.id};}
 }
 if(clearance<=1e-6){state.collision=closest;return;}
 const h=Math.min(dt,.03*clearance/Math.max(2*maxSpeed,1e-8));if(h<1e-9){state.collision=closest;return;}
 const before=pairForces(all);all.forEach((b,i)=>{b.px+=before[i][0]*h/2;b.py+=before[i][1]*h/2;});
 for(const b of all){const v=velocity(b);b.x+=v[0]*h;b.y+=v[1]*h;}
 const after=pairForces(all);all.forEach((b,i)=>{b.px+=after[i][0]*h/2;b.py+=after[i][1]*h/2;});state.time+=h;return h;
}
// Select a demonstrative grazing orientation; never change forces or outcome probabilities.
function planEncounter(options,side=1){
 if(!options.sources.length)return null;const target=options.sources.reduce((best,t)=>Math.hypot(t.x-options.x,t.y-options.y)<Math.hypot(best.x-options.x,best.y-options.y)?t:best),distance=Math.hypot(target.x-options.x,target.y-options.y),bearing=Math.atan2(target.y-options.y,target.x-options.x),R=1.4*(Math.cbrt(4)+Math.cbrt(target.A)),goal=R*2.2;
 const evaluate=offset=>{const angle=bearing+Math.PI+side*offset,state=create({...options,angle}),alpha=state.products[0],speed=Math.hypot(...velocity(alpha)),limit=distance/speed*2;let closest=Infinity,time=0;for(let i=0;i<18000&&state.time<limit&&!state.collision;i++){const source=state.sources.find(t=>t.id===target.id),d=Math.hypot(alpha.x-source.x,alpha.y-source.y);if(d<closest){closest=d;time=state.time;}else if(state.time>distance/speed*.35)break;advance(state,30);}return {angle,closest,time,targetId:target.id,target:{...target},collision:state.collision};};
 let lo=0,hi=Math.atan2(Math.max(goal*8,80),distance),best=null;
 for(let i=0;i<13;i++){const mid=(lo+hi)/2,candidate=evaluate(mid);if(!candidate.collision&&(!best||Math.abs(candidate.closest-goal)<Math.abs(best.closest-goal)))best=candidate;if(candidate.closest<goal)lo=mid;else hi=mid;}
 return best&&best.closest>R*1.1&&best.closest<goal*1.7?best:null;
}
root.HiFyzikoDT={Q,masses,planEncounter,create,kinetic,velocity,potential,force,totalEnergy,totalMomentum,advance};if(typeof module!=='undefined')module.exports=root.HiFyzikoDT;
})(globalThis);
