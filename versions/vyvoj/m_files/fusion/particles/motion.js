(function(root){
'use strict';
const style=root.HiFyzikoParticleStyle||(typeof require==='function'?require('./style.js'):null),config=style.motion;
// Smooth deterministic pseudo-random motion, never fresh white noise per frame.
// Bounds and frequency-independent appearance are defined in style.js.
// Fixed spatial patches with changing amplitudes: no travelling plane-wave phase.
const modes=new Map();
function patches(seed){
 if(modes.has(seed))return modes.get(seed);
 const list=[],count=config.patchCount,golden=Math.PI*(3-Math.sqrt(5));
 for(let i=0;i<count;i++){
  const z=1-2*(i+.5)/count,r=Math.sqrt(1-z*z),a=i*golden+seed*.71;
  list.push({x:r*Math.cos(a),y:r*Math.sin(a),z,phase:i*2.399+seed*1.73,speed:9.5+(i%7)*.93});
 }
 modes.set(seed,list);return list;
}
function radius(x,y,z,t,seed){
 const p=seed*2.399963;
 let displacement=0,weight=0;
 for(const patch of patches(seed)){
  const w=Math.exp(config.patchSharpness*(x*patch.x+y*patch.y+z*patch.z-1));
  const pulse=.7*Math.sin(t*patch.speed+patch.phase)+.3*Math.sin(t*patch.speed*1.37+patch.phase*1.9);
  displacement+=w*pulse;weight+=w;
 }
 // Very small whole-particle breathing plus independent radial surface patches.
 return 1+config.breathingAmplitude*Math.sin(t*10.3+p)+config.lobeAmplitude*displacement/Math.max(weight,1e-12);
}
function drift(t,seed){
 t*=7;
 return [0,1,2].map(axis=>config.driftAmplitude*(.65*Math.sin(t*(.91+axis*.13)+seed*2.13+axis*1.7)+.35*Math.sin(t*1.61+seed+axis*2.9)));
}
function surfaceWeights(base,r,seed){
 const ps=patches(seed),weights=new Float32Array(base.length/3*ps.length);
 for(let i=0;i<base.length/3;i++){
  let total=0;
  ps.forEach((p,j)=>{const w=Math.exp(config.patchSharpness*((base[i*3]*p.x+base[i*3+1]*p.y+base[i*3+2]*p.z)/r-1));weights[i*ps.length+j]=w;total+=w;});
  for(let j=0;j<ps.length;j++)weights[i*ps.length+j]/=total;
 }
 return weights;
}
function surfacePulses(t,seed){
 return patches(seed).map(p=>.7*Math.sin(t*p.speed+p.phase)+.3*Math.sin(t*p.speed*1.37+p.phase*1.9));
}
const layouts=JSON.parse(JSON.stringify(style.layouts));
// Persistent overlap even at minimum radius and opposite positional excursions.
Object.values(layouts).forEach(points=>points.forEach(p=>p.forEach((v,i)=>p[i]=v*style.spacing)));
const species=Object.values(style.species).map(s=>[s.name,s.kinds]);
root.ParticleMotion={radius,drift,layouts,species,surfaceWeights,surfacePulses};
if(typeof module!=='undefined')module.exports=root.ParticleMotion;
})(typeof window==='undefined'?globalThis:window);
