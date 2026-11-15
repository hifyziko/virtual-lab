const assert=require('node:assert/strict');const M=require('../versions/vyvoj/m_files/fusion/barrier/model.js'),F=require('../versions/vyvoj/m_files/fusion/barrier/fusion.js');
function energy(p,s,centers,cell){const all=[{...s,A:p.b.A,Z:p.b.Z},...centers.map(t=>({...t,A:p.a.A,Z:p.a.Z}))];let e=0;for(let i=0;i<all.length;i++){const b=all[i];e+=.5*b.A*(b.vx**2+b.vy**2)+M.cellField(cell,b.x,b.y,b.Z).U;for(let j=0;j<i;j++)e+=1439.96448*b.Z*all[j].Z/Math.hypot(b.x-all[j].x,b.y-all[j].y);}return e;}
for(const pair of [['triton','deuteron'],['proton','proton'],['helium3','deuteron']])for(const count of [1,3]){
 const p=M.pair(...pair),initial=M.multiShot(p,20,.17,count,25);initial.centers.forEach(t=>{t.vx=t.vy=0;});
 const original=JSON.stringify(initial),preview=M.mobileTrajectory(p,initial,null,1200);assert.equal(JSON.stringify(initial),original,'prediction must not mutate live state');
 const s={...initial},centers=initial.centers.map(t=>({...t})),E=energy(p,s,centers),Px=p.b.A*s.vx,Py=p.b.A*s.vy;
 for(let i=0;i<1200;i++){M.mobileAdvance(p,centers,s,initial.dt);if(i%4===0){const q=preview[1+i/4];assert.ok(Math.hypot(q[0]-s.x,q[1]-s.y)<1e-10,'preview and actual trajectory coincide');}}
 assert.ok(Math.abs(energy(p,s,centers)-E)<.003,'pairwise energy');assert.ok(Math.abs(p.b.A*s.vx+centers.reduce((v,t)=>v+p.a.A*t.vx,0)-Px)<1e-8,'momentum x');assert.ok(Math.abs(p.b.A*s.vy+centers.reduce((v,t)=>v+p.a.A*t.vy,0)-Py)<1e-8,'momentum y');assert.ok(centers.some(t=>Math.hypot(t.vx,t.vy)>0),'target recoil');
}
const cell={x:0,y:0,rx:100,ry:100,width:80,energy:26};
for(const x of [50,110,145,170]){const eps=1e-4,a=M.cellField(cell,x,0),grad=(M.cellField(cell,x+eps,0).U-M.cellField(cell,x-eps,0).U)/(2*eps);assert.ok(Math.abs(a.fx+grad)<1e-4);}
assert.equal(M.cellField(cell,500,0,0).U,0);assert.equal(M.cellField(cell,50,0).fx,0);
const p=M.pair('triton','deuteron'),s={x:0,y:0,vx:5,vy:0},E=energy(p,s,[],cell);let reversed=false;for(let i=0;i<8000;i++){M.mobileAdvance(p,[],s,.02,cell);assert.ok(Math.abs(s.x)<180);if(s.vx<0)reversed=true;}assert.ok(reversed);assert.ok(Math.abs(energy(p,s,[],cell)-E)<.003,'smooth wall energy');
// MeV alpha is also retained; neutral product remains a straight free trajectory.
const f=F.create({x:0,y:0,cell,angle:0});let changed=false;for(let i=0;i<7000;i++){F.advance(f,1);if(f.products[0].px>0)changed=true;assert.ok(Math.abs(f.products[0].x)<180);assert.equal(f.products[1].y,0);}assert.ok(changed);assert.ok(Math.abs(F.totalEnergy(f)-f.initialEnergy)<2,'relativistic wall energy');
console.log('PASS: mobile recoil and conservation; identical prediction/live integration; conservative cell, alpha retention, straight neutral neutron.');

// Switching the active body leaves heterogeneous targets with their own A and Z.
{
 const p=M.pair('triton','triton'),initial={x:600,y:80,vx:-3,vy:.2,dt:.01,energy:20,centers:[{kind:'deuteron',A:2,Z:1,x:0,y:0,vx:0,vy:0},{kind:'alpha',A:4,Z:2,x:-300,y:170,vx:0,vy:0},{kind:'neutron',A:1,Z:0,x:200,y:-200,vx:0,vy:0}]};
 const targets=initial.centers.map(t=>({...t})),body={...initial},preview=M.mobileTrajectory(p,initial,null,1000);
 const total=()=>{const all=[{...body,A:3,Z:1},...targets];return all.reduce((sum,b)=>sum+.5*b.A*(b.vx*b.vx+b.vy*b.vy),0)+all.reduce((sum,b,i)=>sum+all.slice(0,i).reduce((v,a)=>v+1439.96448*a.Z*b.Z/Math.hypot(a.x-b.x,a.y-b.y),0),0);};
 const E=total();for(let i=0;i<1000;i++){M.mobileAdvance(p,targets,body,initial.dt);if(i%4===0)assert.ok(Math.hypot(body.x-preview[1+i/4][0],body.y-preview[1+i/4][1])<1e-10);}
 assert.ok(Math.abs(total()-E)<1e-5);assert.ok(Math.abs(3*body.vx+targets.reduce((v,t)=>v+t.A*t.vx,0)+9)<1e-9);assert.equal(targets[2].x,200);assert.equal(targets[2].y,-200);
 const q={x:120,y:70},eps=.001,pot=x=>M.multiPotential(p,targets,x,q.y),force=M.multiForce(p,targets,q.x,q.y);assert.ok(Math.abs((pot(q.x+eps)-pot(q.x-eps))/(2*eps)+force[0])<1e-8);
 console.log('PASS: mixed isotope/charge targets retain mass, charge, energy and momentum; neutral target exerts no Coulomb force.');
}

// Pointer constraints must not tunnel through enlarged glyphs on long jumps.
{const hit=M.limitSeparation([{x:0,y:0}],{x:100,y:0},{x:-10000,y:0},30);assert.ok(hit.x>=30);const retreat=M.limitSeparation([{x:0,y:0}],{x:20,y:0},{x:50,y:0},30);assert.equal(retreat.x,50);assert.equal(M.limitSeparation([{x:0,y:0}],{x:20,y:0},{x:0,y:0},30).x,20);}
