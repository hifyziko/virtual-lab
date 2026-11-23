(function(root){
'use strict';
const KEV_K=11604518.12155008;
function parameters(s){s=Math.max(0,Math.min(1,s));const metalK=300+400*s,plasmaKeV=1+9*s;
 return {s,metalK,metalC:metalK-273.15,plasmaKeV,plasmaK:plasmaKeV*KEV_K,metalR:(.1+metalK/300)/1.1,plasmaR:plasmaKeV**-1.5,amplitude:.045*Math.sqrt(metalK/300),thermal:Math.sqrt(plasmaKeV)};
}
function rng(seed){return ()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};}
// Dimensionless attractive Coulomb problem: r0, v0 and r0/v0; k/(m r0 v0²)=1.
function acceleration(x,y){const r=Math.hypot(x,y);return [-x/r**3,-y/r**3];}
function flightStep(p,dt){const a=acceleration(p.x,p.y),x=p.x+p.vx*dt+.5*a[0]*dt*dt,y=p.y+p.vy*dt+.5*a[1]*dt*dt,b=acceleration(x,y);
 return {x,y,vx:p.vx+.5*(a[0]+b[0])*dt,vy:p.vy+.5*(a[1]+b[1])*dt};}
function flightStart(T){return {x:-12,y:1.5,vx:Math.sqrt(T),vy:0};}
function flightEnded(p){return p.x>12||Math.abs(p.y)>5;}
function trajectory(T,dt=.004){let p=flightStart(T),points=[p];for(let i=0;i<30000&&p.x<12;i++){p=flightStep(p,dt);if(i%8===0)points.push(p);}points.push(p);return points;}
// Illustrative screened Coulomb potential with a smoothed core.
const WIDTH=12, HEIGHT=7, FIELD=.028, BATH_TIME=2;
const plasmaField=Object.freeze({strength:.12,screen:.55,core:.04});
// Illustrative 2D lattice scattering, inspired by Lee, Yuge and Shimizu (2012).
const METAL_SPEED=1.2, METAL_RANGE=4.8, METAL_BARRIER=.75;
const METAL_PHONON_WIDTH=.52, METAL_PHONON_RATE=3.3, METAL_KICK_ANGLE=.72;
const MIN_METAL_RANGE=.01, METAL_START_Y=3.2, METAL_START_X=.45;
const metalCell=Object.freeze({width:WIDTH,height:HEIGHT,columns:8,rows:4});

function metalLattice(time,amplitude){
 const nodes=[];
 const dx=metalCell.width/metalCell.columns,dy=metalCell.height/metalCell.rows;
 for(let row=0;row<metalCell.rows;row++)for(let col=0;col<metalCell.columns;col++){
  const equilibriumX=.65+col*dx,equilibriumY=.7+row*dy;
  const x=equilibriumX+amplitude*(Math.sin(time*6-col*.7)+.4*Math.sin(time*9-row));
  const y=equilibriumY+amplitude*(Math.cos(time*6-col*.7)+.4*Math.cos(time*9-row));
  const displacementSquared=(x-equilibriumX)**2+(y-equilibriumY)**2;
  const range=METAL_RANGE*displacementSquared/1.52;
  nodes.push({x,y,equilibriumX,equilibriumY,displacementSquared,range:range>=MIN_METAL_RANGE?range:0});
 }
 return {nodes,vibrating:amplitude>0};
}

// Finite-range repulsion with a softened direction in the innermost core.
function metalDisturbance(x,y,lattice){
 let fx=0,fy=0;
 for(const node of lattice.nodes){
  const dx=nearest(x-node.x,metalCell.width),dy=nearest(y-node.y,metalCell.height),radius=node.range;
  if(dx*dx+dy*dy>=radius**2)continue;
  const r=Math.hypot(dx,dy);
  const force=4*METAL_BARRIER*(1-r/radius)**3/radius;
  fx+=force*dx/Math.max(r,.025);
  fy+=force*dy/Math.max(r,.025);
 }
 return {fx,fy};
}

function metalPhononRate(x,y,lattice){
 if(!lattice.vibrating)return 0;
 let activity=0;
 for(const node of lattice.nodes){
  const d2=nearest(x-node.x,metalCell.width)**2+nearest(y-node.y,metalCell.height)**2;
  if(d2<=2)activity+=node.displacementSquared*Math.exp(-d2/(2*METAL_PHONON_WIDTH**2));
 }
 return Math.min(14,METAL_PHONON_RATE*activity/.11);
}

function metalAdvance(e,dt,before,after,drift,random){
 const a=metalDisturbance(e.x,e.y,before);
 const x=e.x+(e.vx+drift)*dt+.5*a.fx*dt*dt;
 const y=e.y+e.vy*dt+.5*a.fy*dt*dt;
 const b=metalDisturbance(x,y,after);
 e.vx+=.5*(a.fx+b.fx)*dt;
 e.vy+=.5*(a.fy+b.fy)*dt;
 e.x=x;
 e.y=y;
 const probability=-Math.expm1(-metalPhononRate(x,y,after)*dt);
 if(probability>0&&random()<probability){
  // Quasielastic events rotate the velocity without rescaling its magnitude.
  const angle=Math.max(-.65,Math.min(.65,METAL_KICK_ANGLE*(random()+random()+random()-1.5)));
  const ca=Math.cos(angle),sa=Math.sin(angle),vx=e.vx,vy=e.vy;
  e.vx=ca*vx-sa*vy;
  e.vy=sa*vx+ca*vy;
  e.phononEvents++;
 }
}

function wrap(x,length){return x-length*Math.floor(x/length);}
function nearest(delta,length){return delta-length*Math.round(delta/length);}

function accumulateForce(first,second,sign,periodic,field,ax,ay,i,j){
 let dx=first.x-second.x,dy=first.y-second.y;
 if(periodic){dx=nearest(dx,WIDTH);dy=nearest(dy,HEIGHT);}
 const radius=Math.sqrt(dx*dx+dy*dy+field.core**2);
 const potential=sign*field.strength*Math.exp(-radius/field.screen)/radius;
 const factor=potential*(1/radius+1/field.screen)/radius;
 const fx=factor*dx,fy=factor*dy;
 ax[i]+=fx;
 ay[i]+=fy;
 if(j>=0){ax[j]-=fx;ay[j]-=fy;}
 return radius;
}

function plasmaForce(e,ions,electrons){
 const ax=[-FIELD],ay=[0];
 for(const ion of ions)accumulateForce(e,ion,-1,true,plasmaField,ax,ay,0,-1);
 for(const other of electrons)if(other!==e)accumulateForce(e,other,1,true,plasmaField,ax,ay,0,-1);
 return {ax:ax[0],ay:ay[0]};
}

function plasmaForces(electrons,ions,ax,ay,field,periodic,electronRepulsion,strength){
 ax.fill(-field);
 ay.fill(0);
 let radius=Infinity;
 for(let i=0;i<electrons.length;i++){
  for(const ion of ions){
   radius=Math.min(radius,accumulateForce(electrons[i],ion,-1,periodic,strength,ax,ay,i,-1));
  }
  if(electronRepulsion)for(let j=i+1;j<electrons.length;j++){
   radius=Math.min(radius,accumulateForce(electrons[i],electrons[j],1,periodic,strength,ax,ay,i,j));
  }
 }
 return radius;
}

// All electrons share the same velocity-Verlet step and each pair contributes
// equal and opposite kicks. Ions follow their prescribed motion during the step.
function plasmaStep(electrons,ions,dt,{field=FIELD,periodic=true,electronRepulsion=true,potential=plasmaField}={}){
 const n=electrons.length;
 let ax=new Float64Array(n),ay=new Float64Array(n);
 let nextX=new Float64Array(n),nextY=new Float64Array(n);
 let radius=plasmaForces(electrons,ions,ax,ay,field,periodic,electronRepulsion,potential);
 const ionSpeed=Math.sqrt(ions.reduce((max,ion)=>Math.max(max,ion.vx**2+ion.vy**2),0));
 for(let remaining=dt;remaining>1e-12;){
  const speed=Math.sqrt(electrons.reduce((max,e)=>Math.max(max,e.vx**2+e.vy**2),0));
  const relativeSpeed=speed+Math.max(speed,ionSpeed);
  const crossing=.08*radius/Math.max(relativeSpeed,1e-8);
  const turning=.08*Math.sqrt(radius**3/potential.strength);
  const h=Math.min(remaining,.004,crossing,turning);
  for(let i=0;i<n;i++){
   const e=electrons[i];
   e.x+=(e.vx+.5*ax[i]*h)*h;
   e.y+=(e.vy+.5*ay[i]*h)*h;
  }
  for(const ion of ions){
   ion.x+=ion.vx*h;
   ion.y+=ion.vy*h;
   if(periodic){ion.x=wrap(ion.x,WIDTH);ion.y=wrap(ion.y,HEIGHT);}
  }
  radius=plasmaForces(electrons,ions,nextX,nextY,field,periodic,electronRepulsion,potential);
  for(let i=0;i<n;i++){
   electrons[i].vx+=.5*(ax[i]+nextX[i])*h;
   electrons[i].vy+=.5*(ay[i]+nextY[i])*h;
  }
  [ax,nextX]=[nextX,ax];
  [ay,nextY]=[nextY,ay];
  remaining-=h;
 }
}

function plasmaMoments(particles){
 let vx=0,vy=0;
 for(const e of particles){vx+=e.vx;vy+=e.vy;}
 vx/=particles.length;
 vy/=particles.length;
 let variance=0;
 for(const e of particles)variance+=(e.vx-vx)**2+(e.vy-vy)**2;
 return {vx,vy,rms:Math.sqrt(variance/particles.length)};
}

// A separate, gradual bath keeps the small driven scene near thermal motion.
// Damping the mean models a reservoir at rest, with no Spitzer input.
function relaxPlasma(particles,thermal,dt){
 const {vx,vy,rms}=plasmaMoments(particles),keep=Math.exp(-dt/BATH_TIME);
 const scale=rms>0?keep+(1-keep)*thermal/rms:1;
 for(const e of particles){
  e.vx=(e.vx-vx)*scale+vx*keep;
  e.vy=(e.vy-vy)*scale+vy*keep;
 }
}
class Model{
 constructor(seed=93){this.random=rng(seed);this.s=0;this.time=0;this.p=parameters(0);this.drift={metal:-.014,plasma:-.014};this.driftDistance={metal:0,plasma:0};this.groups={};
  for(const kind of ['metal','plasma'])this.groups[kind]=Array.from({length:32},()=>({x:this.random()*12,y:this.random()*7,angle:this.random()*Math.PI*2,trail:[],flash:0}));
  // Schematic monovalent metal: 8 x 4 positive ionic cores and 32 mobile
  // conduction electrons in the visible cell (one conduction electron/core).
  // The lattice includes periodic continuation outside the viewport; these
  // extra loop nodes are NOT additional ions inside the depicted sample.
  // A separate seeded RNG preserves the original plasma motion exactly.
  this.metalRandom=rng(seed+7819);
  for(let i=0;i<this.groups.metal.length;i++){
   const e=this.groups.metal[i];
   const row=Math.floor(i/8), col=i%8;
   const angle=i===0?.12:2*Math.PI*((i*.61803398875+.025*(this.metalRandom()-.5))%1);
   // One electron per cell, but jittered so the electrons don't look attached
   // to individual ions or form a second rigid crystal lattice.
   e.x=i===0?.40:(col+.12+.76*this.metalRandom())*1.5;
   e.y=i===0?.95:(row+.12+.76*this.metalRandom())*1.75;
   // Reprezentativni rozdeleni rychlosti kolem charakteristicke rychlosti.
   // Nejde o klasicke Maxwellovo rozdeleni ani o presnou Fermiho plochu.
   // Zvyseni teploty mrizky rychlosti automaticky nenasobí.
   const speedScale=i===0?1:.82+.36*this.metalRandom();
   e.vx=METAL_SPEED*speedScale*Math.cos(angle);
   e.vy=METAL_SPEED*speedScale*Math.sin(angle);
   e.phononEvents=0;
  }
  const ionRandom=rng(17);this.ions=Array.from({length:32},()=>{const x=ionRandom()*12,y=ionRandom()*7,angle=ionRandom()*2*Math.PI,speed=6*1.2/Math.sqrt(1836);return {x,y,vx:speed*Math.cos(angle),vy:speed*Math.sin(angle)};});
  for(const e of this.groups.plasma){e.vx=1.2*Math.cos(e.angle);e.vy=1.2*Math.sin(e.angle);}
  const {vx,vy,rms}=plasmaMoments(this.groups.plasma);
  for(const e of this.groups.plasma){
   e.vx=(e.vx-vx)*1.2/rms;
   e.vy=(e.vy-vy)*1.2/rms;
   e.angle=Math.atan2(e.vy,e.vx);
  }
  this.metalLattice=metalLattice(0,this.p.amplitude*6);
  this.metalProbe={random:rng(10873),e:{x:METAL_START_X,y:METAL_START_Y,vx:METAL_SPEED,vy:0,phononEvents:0}};
  this.flight=flightStart(1);this.flightTrail=[];this.flightT=1;this.flightWait=0;
 }
 setHeating(s){
  const previous=this.p.thermal;
  this.p=parameters(s);
  this.s=this.p.s;
  this.metalLattice=metalLattice(this.time,this.p.amplitude*6);
  const ratio=this.p.thermal/previous;
  const {vx,vy}=plasmaMoments(this.groups.plasma);
  for(const e of this.groups.plasma){
   e.vx=vx+(e.vx-vx)*ratio;
   e.vy=vy+(e.vy-vy)*ratio;
   e.angle=Math.atan2(e.vy,e.vx);
  }
 }
 step(dt){if(!(dt>0))return;const steps=Math.ceil(dt/.004),h=dt/steps;for(let i=0;i<steps;i++)this.advance(h);}
 advance(dt){this.time+=dt;const p=this.p;
  const previousLattice=this.metalLattice;
  this.metalLattice=metalLattice(this.time,p.amplitude*6);
  const probe=this.metalProbe;
  metalAdvance(probe.e,dt,previousLattice,this.metalLattice,0,probe.random);
  probe.e.x=wrap(probe.e.x,metalCell.width);
  probe.e.y=wrap(probe.e.y,metalCell.height);
  plasmaStep(this.groups.plasma,this.ions,dt);
  relaxPlasma(this.groups.plasma,1.2*p.thermal,dt);
  for(const kind of ['metal','plasma']){const rate=2*(kind==='metal'?p.metalR:p.plasmaR);
   // Exact first moment of the relaxation equation, driven by constant E.
   const target=-.028/rate;const previous=this.drift[kind];this.drift[kind]=target+(previous-target)*Math.exp(-rate*dt);this.driftDistance[kind]+=target*dt+(previous-target)*(1-Math.exp(-rate*dt))/rate;
   for(const e of this.groups[kind]){
    if(kind==='metal')metalAdvance(e,dt,previousLattice,this.metalLattice,this.drift.metal,this.metalRandom);
    else e.angle=Math.atan2(e.vy,e.vx);
    e.flash=Math.max(0,e.flash-dt);
    if(e.x<0||e.x>=WIDTH||e.y<0||e.y>=HEIGHT){e.x=wrap(e.x,WIDTH);e.y=wrap(e.y,HEIGHT);e.trail=[];}
    e.trail.push([e.x,e.y,this.time]);if(e.trail.length>180)e.trail.shift();
   }
  }
  // The ongoing isolated pass retains its injection energy; heating affects the next pass.
  if(this.flightWait>0){this.flightWait-=dt;if(this.flightWait<=0){this.flightT=p.plasmaKeV;this.flight=flightStart(this.flightT);this.flightTrail=[];}}
  else {for(let k=0;k<4;k++)this.flight=flightStep(this.flight,dt*1.5/4);this.flightTrail.push([this.flight.x,this.flight.y,this.time]);if(flightEnded(this.flight))this.flightWait=.45;}
 }
}
const api={parameters,Model,acceleration,flightStep,flightStart,flightEnded,trajectory,plasmaForce,plasmaStep,plasmaField,plasmaMoments,relaxPlasma,metalCell,metalLattice,metalDisturbance,metalPhononRate,metalAdvance,KEV_K};if(typeof module!=='undefined')module.exports=api;root.Conductivity=api;
})(typeof window==='undefined'?globalThis:window);
