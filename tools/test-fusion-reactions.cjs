const assert=require('node:assert/strict'),F=require('../versions/vyvoj/m_files/fusion/barrier/fusion.js'),R=require('../versions/vyvoj/m_files/fusion/barrier/reactions.js');
for(const ch of Object.values(R.channels))for(const energy of [1.2926,12.926,64.63]){
 const state=R.create({channel:ch,x:0,y:0,energy,angle:.73});
 const before=ch.input.map(k=>R.species[k]);assert.equal(state.products.reduce((s,b)=>s+b.A,0),before.reduce((s,b)=>s+b.A,0));assert.equal(state.products.reduce((s,b)=>s+b.Z,0),before.reduce((s,b)=>s+b.Z,0));
 assert.ok(Math.hypot(...F.totalMomentum(state))<1e-7,ch.id+' momentum');assert.ok(Math.abs(F.totalEnergy(state)-(ch.Q+energy))<1e-6,ch.id+' energy');
 const E=F.totalEnergy(state);for(let i=0;i<300;i++)F.advance(state,.2);assert.equal(state.collision,null,ch.id+' outgoing channel');assert.ok(Math.abs(F.totalEnergy(state)-E)<.05,ch.id+' propagation energy');
 for(const b of state.products)assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.y));
 console.log(ch.id,'Q=',(ch.Q/1000).toFixed(6),'products',state.products.map(b=>b.kind).join(','));
}
console.log('PASS: all channels conserve nucleon count, charge, energy and momentum; finite propagation.');
for(const energy of [1.2926,12.926,64.63]){const state=R.create({channel:'pp',energy,minimumExitRadius:500,angle:.7}),a=state.products[0],b=state.products[1];assert.equal(state.products.map(p=>p.kind).join(','),'proton,proton');assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=999.999999);assert.ok(Math.abs(F.totalEnergy(state)-energy)<1e-6);assert.ok(Math.hypot(...F.totalMomentum(state))<1e-7);}
console.log('PASS: resolved p-p exit separation preserves Q=0, total energy and momentum.');
