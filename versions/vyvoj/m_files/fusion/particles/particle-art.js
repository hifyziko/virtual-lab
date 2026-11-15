(function(root){
'use strict';
const T=root.THREE,S=root.HiFyzikoParticleStyle,M=root.ParticleMotion;
function createNucleus(speciesId,{scale=1,seed=1}={}){
 const species=S.species[speciesId];if(!species)throw Error('Unknown particle species: '+speciesId);
 const group=new T.Group(),particles=[];
 species.kinds.forEach((kind,i)=>{
  const r=S.radii[kind]*scale,geometry=new T.SphereGeometry(r,...S.segments),base=geometry.attributes.position.array.slice();
  const mesh=new T.Mesh(geometry,new T.MeshLambertMaterial({color:S.colors[kind]}));
  const offset=M.layouts[species.kinds.length][i].map(v=>v*scale),particleSeed=seed+i;
  mesh.position.set(...offset);mesh.name=speciesId+'-'+kind+'-'+i;group.add(mesh);
  particles.push({mesh,base,r,offset,kind,seed:particleSeed,surface:kind==='e'?null:M.surfaceWeights(base,r,particleSeed),tex:S.labels[kind],anchor:new T.Vector3(offset[0],offset[1],offset[2]+r)});
 });
 function update(t){
  const shifts=particles.map(p=>p.kind==='e'?[0,0,0]:M.drift(t,p.seed).map(v=>v*p.r));
  const mean=[0,1,2].map(axis=>shifts.reduce((sum,d)=>sum+d[axis],0)/particles.length);
  particles.forEach((p,index)=>{
   const {mesh,base,seed,kind,surface}=p,pos=mesh.geometry.attributes.position;
   if(kind!=='e'){
    const pulses=M.surfacePulses(t,seed),breathing=S.motion.breathingAmplitude*Math.sin(t*10.3+seed*2.399963);
    for(let i=0;i<pos.count;i++){
     let local=0;for(let j=0;j<pulses.length;j++)local+=surface[i*pulses.length+j]*pulses[j];
     const q=1+breathing+S.motion.lobeAmplitude*local;pos.setXYZ(i,base[i*3]*q,base[i*3+1]*q,base[i*3+2]*q);
    }
    pos.needsUpdate=true;mesh.geometry.computeVertexNormals();
   }
   mesh.position.set(...p.offset.map((v,axis)=>v+shifts[index][axis]-mean[axis]));
  });
 }
 function dispose(){particles.forEach(p=>{p.mesh.geometry.dispose();p.mesh.material.dispose();});group.removeFromParent();}
 return {group,particles,update,dispose,speciesId};
}
function addLighting(scene){
 scene.add(new T.HemisphereLight(0xffffff,0x65767a,S.light.hemisphere));
 const key=new T.DirectionalLight(0xffeee0,S.light.key);key.position.set(-7,9,12);scene.add(key);
 const fill=new T.DirectionalLight(0xdaeeee,S.light.fill);fill.position.set(9,-1,5);scene.add(fill);
}
root.HiFyzikoParticles={style:S,createNucleus,addLighting};
})(window);
