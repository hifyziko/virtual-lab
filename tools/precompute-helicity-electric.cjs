'use strict';
// Offline prescribed-E comparison, not a self-consistent plasma polarization solver.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),root=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/confinement'),M=require(root+'/helicity-model.js');
function trajectory(r,{electricZ=-500,mix=0,fieldScale=1,pitch=M.pitch,frames=1920,dt=4e-8,substeps=64,diagnostics=false}={}){
 const e=1.602176634e-19,m=3.3435837768e-27,v=Math.sqrt(2*M.energy*e/m),h=dt/substeps;
 const field=(x,y,z)=>M.field(mix,x,y,z).map(b=>b*fieldScale),initialB=field(M.R+r,0,0),bn=Math.hypot(...initialB),vp=v*Math.cos(pitch),vt=v*Math.sin(pitch);
 let x=M.R+r,y=0,z=0,vx=0,vy=vp*initialB[1]/bn-vt*initialB[2]/bn,vz=vp*initialB[2]/bn+vt*initialB[1]/bn,escaped=-1,error=0;
 const positions=new Float32Array((frames+1)*6),bounces=[],detail=diagnostics?[]:null;let lastParallel=0;
 for(let i=0;i<=frames;i++){
  const B=field(x,y,z),b2=B.reduce((s,v)=>s+v*v,0),k=m/(e*b2),j=i*6;
  const parallel=vx*B[0]+vy*B[1]+vz*B[2];if(lastParallel*parallel<0&&(!bounces.length||i-bounces.at(-1)>10))bounces.push(i);lastParallel=parallel;
  if(detail){const bn=Math.sqrt(b2),vp=parallel/bn;detail.push(bn,vp,Math.sqrt(Math.max(0,vx*vx+vy*vy+vz*vz-vp*vp)),...B.map(b=>b/bn));}
  // Remove local E×B velocity before estimating the gyration centre.
  const ex=-electricZ*B[1]/b2,ey=electricZ*B[0]/b2,wx=vx-ex,wy=vy-ey;
  positions.set([x,y,z,x+(wy*B[2]-vz*B[1])*k,y+(vz*B[0]-wx*B[2])*k,z+(wx*B[1]-wy*B[0])*k],j);
  if(escaped<0&&Math.hypot(Math.hypot(x,y)-M.R,z)>M.a)escaped=i;
  error=Math.max(error,Math.abs(m*(vx*vx+vy*vy+vz*vz)/(2*e)-electricZ*z-M.energy)/M.energy);
  if(i===frames)break;
  for(let step=0;step<substeps;step++){
   const hx=x+vx*h/2,hy=y+vy*h/2,hz=z+vz*h/2,B=field(hx,hy,hz),f=e*h/(2*m),tx=B[0]*f,ty=B[1]*f,tz=B[2]*f,w=2/(1+tx*tx+ty*ty+tz*tz);
   vz+=electricZ*f;const px=vx+vy*tz-vz*ty,py=vy+vz*tx-vx*tz,pz=vz+vx*ty-vy*tx;
   vx+=(py*tz-pz*ty)*w;vy+=(pz*tx-px*tz)*w;vz+=(px*ty-py*tx)*w;vz+=electricZ*f;
   x=hx+vx*h/2;y=hy+vy*h/2;z=hz+vz*h/2;
  }
 }
 return {positions,dt,escaped,error,bounces,detail};
}
module.exports={trajectory};
// One return to the launch poloidal phase, with the same direction of motion.
// Escaping particles retain a short physical departure; no artificial closure.
function cycleEnd(t,r){const p=t.positions,n=p.length/6-1;let negative=false,phase=0,last=0;
 for(let j=1;j<=n;j++){const k=j*6,R=Math.hypot(p[k+3],p[k+4])-M.R,z=p[k+5],angle=Math.atan2(z,R);let delta=angle-last;if(delta>Math.PI)delta-=2*Math.PI;if(delta<-Math.PI)delta+=2*Math.PI;phase+=delta;last=angle;if(z<-.05*r)negative=true;
  if(t.escaped>=0&&j>=t.escaped+600)return {endFrame:j,endReason:'escape'};
  if(t.escaped<0&&negative&&R>0&&p[k-1]<0&&z>=0&&t.detail[k+1]>0&&(t.bounces.filter(b=>b<=j).length>=2||phase>5.5)){const f=-p[k-1]/(z-p[k-1]);return {endFrame:j-1+f,endReason:'cycle'};}
 }return {endFrame:n,endReason:t.escaped>=0?'escape':'limit'};
}
if(require.main===module){
 const sourceSha=crypto.createHash('sha256').update(fs.readFileSync(__filename)).update(fs.readFileSync(root+'/helicity-model.js')).digest('hex');
 function save(part,configs){const states=[],parts=[];let offset=0;for(const c of configs){const line=M.line(c.u,c.r,c.closure),t=trajectory(c.r,{mix:c.u,electricZ:c.electricZ,fieldScale:c.fieldScale||1,pitch:c.banana?c.pitchDeg*Math.PI/180:M.pitch,frames:c.banana?10000:1920,diagnostics:!!c.banana});if(c.banana){Object.assign(c,cycleEnd(t,c.r));const count=Math.ceil(c.endFrame)+1;t.positions=t.positions.slice(0,count*6);t.detail=t.detail.slice(0,count*6);t.bounces=t.bounces.filter(j=>j<count);}const all=new Float32Array(line.length+t.positions.length);all.set(line);all.set(t.positions,line.length);let peak=0;for(const x of all)peak=Math.max(peak,Math.abs(x));const scale=peak/32760,packed=Int16Array.from(all,x=>Math.round(x/scale));states.push({...c,q:Number.isFinite(M.q(c.u,c.r))?M.q(c.u,c.r):null,dataPart:part,scale,offset,lineLength:line.length,pathLength:t.positions.length,dt:t.dt,escaped:t.escaped,workError:t.error,bounces:t.bounces,detail:t.detail});parts.push(Buffer.from(packed.buffer));offset+=all.length;}
 const data={schema:1,sourceSha,states,data:Buffer.concat(parts).toString('base64')};fs.writeFileSync(root+'/helicity-data/'+part+'.js','window.HiFyzikoHelicityData=window.HiFyzikoHelicityData||{};window.HiFyzikoHelicityData['+part+']='+JSON.stringify(data)+';\n');console.log('Prepared part '+part+': '+states.length+' trajectories; work error '+Math.max(...states.map(s=>s.workError)));}
 for(let part=7;part<14;part++){const configs=[];for(let i=(part-7)*3;i<(part-6)*3;i++)for(const state of M.states(i))configs.push({...state,id:'electric:'+state.id,electricZ:-500});save(part,configs);}
 const u=M.snap(2,M.radius(12)),configs=[];for(const i of [2,4,6,8,10,12,14,16,18,20])for(const pitchDeg of [35,40,45,50,55,60,65,70,75,80])for(const electricZ of [0,-500])configs.push({id:`banana:${electricZ}:${i}:${pitchDeg}`,i,r:M.radius(i),u,closure:i===12?2:0,banana:true,pitchDeg,fieldScale:2,electricZ});for(let part=14;part<18;part++)save(part,configs.slice((part-14)*50,(part-13)*50));
}
