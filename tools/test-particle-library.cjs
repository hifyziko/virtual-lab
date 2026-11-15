const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),src=path.join(root,'versions/vyvoj/m_files/fusion'),context={console};
context.window=context;vm.createContext(context);
for(const f of ['particles/vendor/three.js','particles/style.js','particles/motion.js','particles/particle-art.js'])vm.runInContext(fs.readFileSync(path.join(src,f),'utf8'),context);
const A=context.HiFyzikoParticles,S=A.style;
for(const [id,s] of Object.entries(S.species)){
 const a=A.createNucleus(id,{seed:31}),b=A.createNucleus(id,{seed:31});
 assert.equal(a.particles.map(p=>p.kind).join(','),s.kinds.join(','));
 const anchors=a.particles.map(p=>p.anchor.toArray().join(','));
 for(const t of [0,.17,.9,3.1]){
  a.update(t);b.update(t);
  a.particles.forEach((p,i)=>{
   assert.equal(p.anchor.toArray().join(','),anchors[i]);
   assert.deepEqual(p.mesh.geometry.attributes.position.array,b.particles[i].mesh.geometry.attributes.position.array);
   const xyz=p.mesh.geometry.attributes.position.array;
   for(let j=0;j<xyz.length;j+=3){
    const ratio=Math.hypot(xyz[j],xyz[j+1],xyz[j+2])/p.r;
    assert.ok(Math.abs(ratio-1)<=S.motion.lobeAmplitude+S.motion.breathingAmplitude+1e-6);
   }
  });
  for(let axis=0;axis<3;axis++)assert.ok(Math.abs(a.particles.reduce((sum,p)=>sum+p.mesh.position.toArray()[axis]-p.offset[axis],0))<1e-10);
 }
 a.dispose();b.dispose();
}
const old=S.colors.p;S.colors.p=0x123456;
const p=A.createNucleus('proton'),d=A.createNucleus('deuteron');
assert.equal(p.particles[0].mesh.material.color.getHex(),0x123456);
assert.equal(d.particles[0].mesh.material.color.getHex(),0x123456);
p.dispose();d.dispose();S.colors.p=old;
for(const folder of ['versions/aktualni','versions/vyvoj/versions/aktualni']){
 const base=path.join(root,folder,'web'),html=fs.readFileSync(path.join(base,'fuze-seznam/index.html'),'utf8');
 for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const ref=match[1].split(/[?#]/)[0];assert.ok(fs.existsSync(path.resolve(base,'fuze-seznam',ref)),ref);
 }
 for(const file of ['style.js','motion.js','particle-art.js'])assert.ok(fs.readFileSync(path.join(base,'shared/particles',file)).equals(fs.readFileSync(path.join(src,'particles',file))));
}
console.log('PASS: species, shared settings, repeatable geometry, deformation bounds, fixed anchors, centered motion and both deliveries.');
