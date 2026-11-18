/* Saha equilibrium follows Entler–Kindl, box 2.1, p.31.
 * Dynamics is an explicitly scaled educational model, not a hydrogen MD solver. */
(function(root){'use strict';
const density=1e20, width=18*Math.SQRT2,height=10*Math.SQRT2,soft=.14,coupling=.55;
function saha(T,n=density){const r=3.02e27*T**1.5*Math.exp(-13.6/T)/n;return r===0?0:2/(1+Math.sqrt(1+4/r));}
function rotate(vx,vy,q,m,B,dt){const a=q*B*dt/m,c=Math.cos(a),s=Math.sin(a);return [c*vx+s*vy,-s*vx+c*vy];}
class Model{
 constructor(){this.seed=42;this.T=.2;this.B=0;this.mutual=true;this.collisions=true;this.time=0;this.clock=0;this.atoms=[];this.setCount(1);}
 random(){this.seed=(1664525*this.seed+1013904223)>>>0;return this.seed/4294967296;}
 velocity(m){const a=2*Math.PI*this.random(),v=Math.sqrt(-2*Math.log(Math.max(1e-9,this.random()))*this.T/m)*1.7;return [v*Math.cos(a),v*Math.sin(a)];}
 particle(x,y,q,m){const [vx,vy]=this.velocity(m);return {x,y,q,m,vx,vy,trail:[]};}
 setCount(n){while(this.atoms.length<n){const first=this.atoms.length===0;this.atoms.push({ion:this.particle(first?width/2:1+(width-2)*this.random(),first?height/2:1+(height-2)*this.random(),0,25),electron:null});}this.atoms.length=n;}
 setTemperature(T){const scale=Math.sqrt(T/this.T);for(const p of this.particles()){p.vx*=scale;p.vy*=scale;}this.T=T;}
 particles(){return this.atoms.flatMap(a=>a.electron?[a.ion,a.electron]:[a.ion]);}
 get ionCount(){return this.atoms.filter(a=>a.electron).length;}
 get target(){return Math.round(saha(this.T)*this.atoms.length);}
 equilibrate(){const count=this.ionCount;if(count<this.target){const a=this.atoms.find(a=>!a.electron),angle=this.random()*Math.PI*2;a.ion.q=1;a.electron=this.particle(a.ion.x+.25*Math.cos(angle),a.ion.y+.25*Math.sin(angle),-1,1);}else if(count>this.target){const a=this.atoms.find(a=>a.electron);a.electron=null;a.ion.q=0;a.ion.trail=[];}}
 field(x,y,parts=this.particles()){let ex=0,ey=0;for(const p of parts){if(!p.q)continue;const dx=x-p.x,dy=y-p.y,f=coupling*p.q/(dx*dx+dy*dy+soft*soft)**1.5;ex+=f*dx;ey+=f*dy;}return [ex,ey];}
 accelerations(ps){const acc=ps.map(()=>[0,0]);if(!this.mutual)return acc;for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];if(!a.q||!b.q)continue;const dx=a.x-b.x,dy=a.y-b.y,f=coupling*a.q*b.q/(dx*dx+dy*dy+soft*soft)**1.5;acc[i][0]+=f*dx/a.m;acc[i][1]+=f*dy/a.m;acc[j][0]-=f*dx/b.m;acc[j][1]-=f*dy/b.m;}return acc;}
 collide(ps){if(!this.collisions)return;for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),radius=(a.q<0?.055:.10)+(b.q<0?.055:.10);if(d>=radius)continue;const nx=d>1e-12?dx/d:1,ny=d>1e-12?dy/d:0,invA=1/a.m,invB=1/b.m,sum=invA+invB,overlap=radius-d; a.x-=nx*overlap*invA/sum;a.y-=ny*overlap*invA/sum;b.x+=nx*overlap*invB/sum;b.y+=ny*overlap*invB/sum;const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(relative>=0)continue;const impulse=-2*relative/sum;a.vx-=impulse*nx*invA;a.vy-=impulse*ny*invA;b.vx+=impulse*nx*invB;b.vy+=impulse*ny*invB;}}
 magneticAt(){return this.B;}
 reflect(p){const radius=p.q<0?.055:.10;for(const [key,velocity,max]of [['x','vx',width],['y','vy',height]]){const span=max-2*radius,offset=p[key]-radius;if(offset>=0&&offset<=span)continue;const period=2*span,wrapped=((offset%period)+period)%period;p[key]=radius+(wrapped<=span?wrapped:period-wrapped);if(Math.abs(Math.floor(offset/span)%2)===1)p[velocity]*=-1;}}
 step(dt){this.time+=dt;this.clock+=dt;if(this.clock>=.09){this.clock%=.09;const batch=Math.max(1,Math.ceil(Math.abs(this.target-this.ionCount)*.15));for(let i=0;i<batch;i++)this.equilibrate();}const ps=this.particles(),a=this.accelerations(ps);for(let i=0;i<ps.length;i++){const p=ps[i];p.vx+=a[i][0]*dt/2;p.vy+=a[i][1]*dt/2;[p.vx,p.vy]=rotate(p.vx,p.vy,p.q,p.m,this.magneticAt(p.x+p.vx*dt/2,p.y+p.vy*dt/2),dt);p.x+=p.vx*dt;p.y+=p.vy*dt;this.reflect(p);}this.collide(ps);for(const p of ps)this.reflect(p);const b=this.accelerations(ps);for(let i=0;i<ps.length;i++){ps[i].vx+=b[i][0]*dt/2;ps[i].vy+=b[i][1]*dt/2;}}
 displace(){for(const a of this.atoms)if(a.electron){a.electron.x=a.electron.x+.65;a.electron.trail=[];}}
 separation(){const ions=this.atoms.filter(a=>a.electron);return ions.length?ions.reduce((s,a)=>s+a.electron.x-a.ion.x,0)/ions.length:0;}
}
/* Cold electron-fluid displacement against a fixed, uniform ion background.
 * Gauss: E=ne*e*xi/epsilon0; electron equation xi''=-omega_pe^2*xi.
 * time = omega_pe*t, positions in an illustrative common length unit.
 * MIT Hutchinson, ch.5, eqs.(5.47)-(5.50), not pairwise disk dynamics. */
class CollectiveModel{
 constructor(){this.collective=true;this.time=0;this.T=0;this.B=0;this.mutual=true;this.collisions=false;this.xi=1.2;this.velocity=0;this.atoms=[];
  for(let row=0;row<4;row++)for(let col=0;col<6;col++){const x=width*(.24+col*.104),y=height*(.26+row*.16),ion={x,y,vx:0,vy:0,q:1,m:25,trail:[]},electron={x:x+this.xi,y,vx:0,vy:0,q:-1,m:1,trail:[]};this.atoms.push({ion,electron});}
 }
 get ionCount(){return this.atoms.length;}
 get target(){return this.ionCount;}
 get electric(){return this.mutual?this.xi:0;}
 particles(){return this.atoms.flatMap(a=>[a.ion,a.electron]);}
 separation(){return this.xi;}
 magneticAt(){return 0;}
 sync(){for(const a of this.atoms){a.electron.x=a.ion.x+this.xi;a.electron.vx=this.velocity;}}
 step(dt){if(this.mutual){const c=Math.cos(dt),s=Math.sin(dt),xi=this.xi;this.xi=c*xi+s*this.velocity;this.velocity=-s*xi+c*this.velocity;}else this.xi+=this.velocity*dt;this.time+=dt;this.sync();}
 displace(){this.xi=1.2;this.velocity=0;this.sync();for(const p of this.particles())p.trail=[];}
}
const api={Model,CollectiveModel,saha,rotate,density,width,height};root.HiFyzikoPlasma=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
