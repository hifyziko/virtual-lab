'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir='versions/vyvoj/m_files/Web/',models=['Tesla Model 3','Škoda Enyaq','BMW i4','Volkswagen ID.4','Hyundai Ioniq 6','Vlastní vozidlo'];
let lesson,config,log=[],physics=[];
const noop=()=>{},Lab={register:m=>lesson=m,mount:(app,cfg)=>config=cfg,control:()=>'',range:()=>'',select:()=>'',number:()=>'',legend:()=>'',arrow:noop,text:noop,vehicleContributions:noop,linspace:()=>[1,90,200]};
const c={Lab,WMath:{vehicle(...args){physics.push(args);return {F:[100,200,50],P:[1,2,.5],E:[1.2,2.4,.6]};}}};vm.createContext(c);
for(const file of ['vehicle-art.js','vehicle-module.js'])vm.runInContext(fs.readFileSync(dir+file,'utf8'),c,{filename:file});
const paint={};for(const name of ['save','restore','beginPath','moveTo','lineTo','quadraticCurveTo','closePath','arc','fill','stroke','clearRect'])paint[name]=(...args)=>{assert(args.every(Number.isFinite),name+' finite coordinates');log.push([name,...args]);};
const plot={c:paint,w:600,h:350,X:x=>300+70*x,Y:y=>240-70*y,line:noop};
const signatures=new Set();
for(let i=0;i<models.length;i++){
 log=[];assert.equal(Lab.vehicleArt(plot,i,0),models[i]);signatures.add(JSON.stringify(log));
 for(const slope of [-20,0,20]){
  log=[];Lab.vehicleArt(plot,i,Math.atan(slope/100));
  const tyres=log.filter(a=>a[0]==='arc'&&a[3]>15&&a[3]<21);
  assert(tyres.length>=2,'two wheel tyres in '+models[i]);
  // All control points remain in the original scene and below the force arrows.
  for(const row of log.filter(a=>['moveTo','lineTo','quadraticCurveTo'].includes(a[0])))for(let j=1;j<row.length;j+=2){
   assert(row[j]>40&&row[j]<550,models[i]+' horizontal bounds');
   assert(row[j+1]>95&&row[j+1]<280,models[i]+' vertical bounds');
  }
 }
}
assert.equal(signatures.size,6,'each preset and custom mode needs a different silhouette');
assert.equal(Lab.vehicleArt(plot,99,0),'Vlastní vozidlo');
lesson.mount({});const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',setAttribute(k,v){this[k]=v;}});return nodes.get(id);};
const ctx={state:{...config.defaults},$:node,equal:()=>plot,canvases:[node('vehicle-canvas'),{}],chart:()=>null};
for(let i=0;i<5;i++){
 config.change(ctx,'car',{value:String(i)});const before=JSON.stringify(ctx.state);physics=[];config.draw(ctx);
 assert.equal(JSON.stringify(ctx.state),before,'drawing cannot alter physical parameters');
 assert(node('vehicle-canvas')['aria-label'].startsWith(models[i]));
 assert.deepEqual(physics[0],[ctx.state.t,ctx.state.grade,ctx.state.mass,ctx.state.temp,ctx.state.cr,ctx.state.cd,ctx.state.area]);
}
config.change(ctx,'mass',{value:'2000'});assert.equal(ctx.state.car,5);assert.equal(node('car').value,5);config.draw(ctx);assert(node('vehicle-canvas')['aria-label'].startsWith('Vlastní vozidlo'));
const build=fs.readFileSync(dir+'build-vehicle.cjs','utf8');assert(build.indexOf("'vehicle-art.js'")<build.indexOf("'vehicle-module.js'"),'renderer must load before the module');
console.log('PASS: five distinct vehicle silhouettes plus custom fallback, finite drawing on ±20% slopes within existing scene, selection/custom-parameter integration and unchanged physics inputs. No browser opened.');
