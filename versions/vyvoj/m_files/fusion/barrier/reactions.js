/* Selected low-energy reaction channels. Energies/rest masses in keV, positions fm.
   Kinematics conserve energy and momentum; angular/three-body distributions are illustrative. */
(function(root){'use strict';
const species={proton:{A:1,Z:1,mass:938272.08816,tex:'\\mathrm p'},neutron:{A:1,Z:0,mass:939565.4205,tex:'\\mathrm n'},deuteron:{A:2,Z:1,mass:1875612.94257,tex:'\\mathrm D'},triton:{A:3,Z:1,mass:2808921.13298,tex:'\\mathrm T'},helium3:{A:3,Z:2,mass:2808391.60743,tex:'{}^3\\mathrm{He}'},alpha:{A:4,Z:2,mass:3727379.4066,tex:'\\alpha'},positron:{A:0,Z:1,mass:510.99895,tex:'\\mathrm e^+'},neutrino:{A:0,Z:0,mass:0,tex:'\\nu_{\\mathrm e}'},gamma:{A:0,Z:0,mass:0,tex:'\\gamma'}};
const channels={
 dt:{input:['deuteron','triton'],output:['alpha','neutron'],name:'D–T',compound:'{}^5\\mathrm{He}^{*}'},
 ddp:{input:['deuteron','deuteron'],output:['triton','proton'],name:'D–D: triton + proton',compound:'{}^4\\mathrm{He}^{*}'},
 ddn:{input:['deuteron','deuteron'],output:['helium3','neutron'],name:'D–D: helium-3 + neutron',compound:'{}^4\\mathrm{He}^{*}'},
 dhe3:{input:['deuteron','helium3'],output:['alpha','proton'],name:'D–helium-3',compound:'{}^5\\mathrm{Li}^{*}'},
 he3he3:{input:['helium3','helium3'],output:['alpha','proton','proton'],name:'Helium-3 + helium-3',compound:'{}^6\\mathrm{Be}^{*}'},
 pp:{input:['proton','proton'],output:['proton','proton'],name:'p–p bez slabé přeměny',compound:'\\mathrm{p+p}',elastic:true},
 ppbeta:{input:['proton','proton'],output:['deuteron','positron','neutrino'],name:'p–p se slabou přeměnou',compound:'\\mathrm{p+p}\\to\\mathrm D',weak:true},
 pt:{input:['proton','triton'],output:['alpha','gamma'],name:'p–T: radiační záchyt',compound:'{}^4\\mathrm{He}^{*}'}
};
for(const [id,ch]of Object.entries(channels)){ch.id=id;ch.Q=ch.input.reduce((s,k)=>s+species[k].mass,0)-ch.output.reduce((s,k)=>s+species[k].mass,0);ch.tex=ch.input.map(k=>species[k].tex).join('+')+'\\to'+ch.output.map(k=>species[k].tex).join('+');}
function find(a,b,branch){const key=[a,b].sort().join('|');if(key==='deuteron|deuteron')return channels[branch==='ddn'?'ddn':'ddp'];if(key==='proton|proton')return channels[branch==='ppbeta'?'ppbeta':'pp'];return Object.values(channels).find(c=>c.input.slice().sort().join('|')===key)||null;}
function boost(body,beta){const b2=beta[0]**2+beta[1]**2;if(!b2)return;const g=1/Math.sqrt(1-b2),E=Math.hypot(body.mass,body.px,body.py),dot=body.px*beta[0]+body.py*beta[1],factor=(g-1)*dot/b2+g*E;body.px+=factor*beta[0];body.py+=factor*beta[1];}
function create({channel='dt',x=0,y=0,energy=0,angle=0,sources=[],cell=null,boost:beta=[0,0],minimumExitRadius=20}){
 const ch=typeof channel==='string'?channels[channel]:channel,kinds=ch.output,total=ch.Q+Math.max(0,energy),n=kinds.length;
 const vectors=n===2?[[-Math.cos(angle),-Math.sin(angle)],[Math.cos(angle),Math.sin(angle)]]:[[Math.cos(angle),Math.sin(angle)],[.8*Math.cos(angle+2.1),.8*Math.sin(angle+2.1)]];if(n===3)vectors.push([-vectors[0][0]-vectors[1][0],-vectors[0][1]-vectors[1][1]]);
 let chargePairs=0;for(let i=0;i<n;i++)for(let j=0;j<i;j++)chargePairs+=species[kinds[i]].Z*species[kinds[j]].Z;const exitRadius=Math.max(20,minimumExitRadius,.7*1439.96448*chargePairs/Math.max(total,.001));
 const products=kinds.map((kind,i)=>{const v=vectors[i],length=Math.hypot(...v);return {...species[kind],kind,id:kind+'-'+i,x:x+exitRadius*v[0]/length,y:y+exitRadius*v[1]/length,px:0,py:0};});
 // Include mutual Coulomb energy at the finite exit separation, avoiding a point-source singularity.
 let U=0;for(let i=0;i<n;i++)for(let j=0;j<i;j++)U+=1439.96448*products[i].Z*products[j].Z/Math.hypot(products[i].x-products[j].x,products[i].y-products[j].y);
 const target=Math.max(0,total-U),kinetic=scale=>products.reduce((sum,b,i)=>{const p=scale*Math.hypot(...vectors[i]);return sum+(p?p*p/(Math.hypot(b.mass,p)+b.mass):0);},0);
 let lo=0,hi=Math.max(1,Math.sqrt(2*Math.max(...products.map(b=>b.mass))*Math.max(target,1))+target);while(kinetic(hi)<target)hi*=2;for(let i=0;i<90;i++){const mid=(lo+hi)/2;if(kinetic(mid)<target)lo=mid;else hi=mid;}
 products.forEach((b,i)=>{b.px=hi*vectors[i][0];b.py=hi*vectors[i][1];boost(b,beta);});
 if(cell&&products.some(b=>Math.abs(b.x-cell.x)>cell.rx||Math.abs(b.y-cell.y)>cell.ry)){const model=root.CoulombModel||(typeof require==='function'?require('./model.js'):null);cell=model.makeCell([...products,...sources],Math.max(100,exitRadius),cell.energy);}
 const state={channel:ch,products,sources:sources.map(t=>({...t,mass:t.mass||species[t.kind]?.mass||t.A*931494.10242,px:t.px||0,py:t.py||0})),cell,time:0,energy:total,collision:null,generic:true};
 state.initialEnergy=root.HiFyzikoDT.totalEnergy(state);state.initialMomentum=root.HiFyzikoDT.totalMomentum(state);return state;
}
root.FusionReactions={species,channels,find,create};if(typeof module!=='undefined')module.exports=root.FusionReactions;
})(globalThis);
