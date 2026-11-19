/* The input is a piecewise-linear current trajectory in monotonic clock time.
   A short playback buffer lets rendering interpolate between measured samples. */
function rlStep(ip, voltage, seconds, tau) {
 const loss = -Math.expm1(-seconds / tau);
 return ip * (1 - loss) + voltage * tau / 5e-6 * loss;
}
if(typeof module !== 'undefined') module.exports = {rlStep};
else {
const initialize=()=>{
'use strict';
const el=id=>document.getElementById(id), math=(node,tex)=>{
 if(node.dataset.last!==tex){katex.render(tex,node,{throwOnError:false});node.dataset.last=tex;}
};
const formatted=(v,unit,digits=1)=>v.toFixed(digits).replace('.', '{,}')+'\\,\\mathrm{'+unit+'}';
document.querySelectorAll('[data-math]').forEach(n=>math(n,n.dataset.math));
el('help').onclick=()=>el('guide').showModal();el('close').onclick=()=>el('guide').close();
try{
let view=el('view'),renderer;
function bindView(){
 view.onpointerdown=e=>{drag=[e.clientX,e.clientY];view.setPointerCapture(e.pointerId);};
 view.onpointermove=e=>{if(drag){yaw-=(e.clientX-drag[0])*.008;pitch=Math.max(-1.45,Math.min(1.45,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];}};
 view.onlostpointercapture=()=>drag=null;
}
try{renderer=new THREE.WebGLRenderer({canvas:view,antialias:true});}
catch(error){console.warn('WebGL unavailable; using the wireframe view.',error);renderer=wireframeRenderer(view);}

renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0xf9faf6);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-16,16,12,-12,.1,150);
camera.up.set(0,0,1);scene.add(new THREE.HemisphereLight(0xffffff,0x899ba4,1.9));
const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(10,-18,26);scene.add(light);
const cutPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);renderer.localClippingEnabled=true;
// A neutral studio panorama gives curved metals readable reflections offline.
const skyW=192,skyH=96,sky=new Uint8Array(skyW*skyH*4);
for(let y=0;y<skyH;y++)for(let x=0;x<skyW;x++){
 const u=x/skyW,v=y/skyH;
 const strip=(cx,cy,w,h)=>Math.exp(-(((u-cx)/w)**4)-((v-cy)/h)**4);
 const radiance=.26+.25*v+2.5*strip(.27,.64,.035,.24)+2*strip(.70,.73,.17,.045)+1.6*strip(.90,.4,.05,.16);
 const level=Math.round(255*Math.min(1,radiance/3));
 sky.set([level,level,level,255],4*(x+y*skyW));
}
const reflection=new THREE.DataTexture(sky,skyW,skyH,THREE.RGBAFormat,THREE.UnsignedByteType);
reflection.mapping=THREE.EquirectangularReflectionMapping;reflection.needsUpdate=true;scene.environment=reflection;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
const groups={},items=[],colors={cs:0xc2673e,pf:0xb87656,tf:0xe29b6c,vessel:0xb5c1c8,wall:0x858784,blanket:0x9aa8b0,divertor:0x99a7ae,tungsten:0x858784,steel:0xb4c1c9};
function addMesh(data,key,angle,finish=key){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(data.positions,3));
 geometry.setIndex(new THREE.BufferAttribute(data.indices,1));if(data.normals)geometry.setAttribute('normal',new THREE.BufferAttribute(data.normals,3));else geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({color:colors[finish],metalness:.86,roughness:['wall','tungsten'].includes(finish)?.39:.24,polygonOffset:finish!==key,polygonOffsetFactor:-1,polygonOffsetUnits:-1,side:THREE.DoubleSide});
 const group=groups[key]||=new THREE.Group();scene.add(group);
 for(const a of angle){const mesh=new THREE.Mesh(geometry,material);mesh.rotation.z=a;group.add(mesh);items.push({mesh,key,a});}
}
const seen=new Map();
for(const p of TokamakCADData.parts){
 const key=p.part==='vessel'||p.part==='tf'?p.part:p.id;
 if(!seen.has(key))seen.set(key,{p,angles:[]});
 seen.get(key).angles.push(...p.rotations.map(a=>(a+(p.nativeAngle||0))*Math.PI/180));
}
for(const {p,angles} of seen.values()){
 addMesh(TokamakCAD.mesh(p),p.part,angles);
 if(['tf','cs','divertor'].includes(p.part))for(const d of TokamakParametricMesh.details(p,TokamakCADData)){
  if(['rim','tie-rods','module-seams'].includes(d.id))addMesh(d.mesh,p.part,angles,'steel');
  if(d.id==='plasma-facing-targets')addMesh(d.mesh,p.part,angles,'tungsten');
 }
}
for(const m of TokamakCAD.objects({visible:{blanket:true},focus:'all',active:[],cut:false}))
 addMesh(m.cadMesh,m.cadId.includes('-fw-')?'wall':'blanket',m.rotations);
let last=performance.now(),yaw=-1,pitch=.38,drag;
const componentControls={pf:el('coils'),cs:el('csCoils'),tf:el('tfCoils'),vessel:el('hardware'),blanket:el('blanket'),wall:el('blanket'),divertor:el('showDivertor')};
bindView();
let t=performance.now()/1000-.09,cs=20000,ip=0,voltage=0,tau=3,queue=[],previous={t,i:cs};
const coilLimit=50000,omega=2*Math.PI/8;
let rampRate=0;
let wave='hold',startTime=t,startCurrent=cs,startPhase=0,limited=false;
function chooseWave(next){
 advance(performance.now()/1000-.09);queue=[];previous={t,i:cs};
 wave=next;startTime=t;startCurrent=cs;startPhase=Math.asin(Math.max(-1,Math.min(1,cs/coilLimit)));limited=false;voltage=0;
}
const presetButtons=[...document.querySelectorAll('[data-wave]')];
let selectedPreset=null;
function selectPreset(next){
 selectedPreset=next;
 for(const button of presetButtons)button.setAttribute('aria-pressed',String(button.dataset.wave===next));
}
for(const button of presetButtons)button.onclick=()=>{
 const next=button.dataset.wave;selectPreset(next);
 if(next==='ramp')restartWave();else chooseWave(next);
};
function restartWave(){const next=selectedPreset??'hold';chooseWave(next);cs=next==='hold'?20000:next==='ramp'?-coilLimit:0;rampRate=2*coilLimit/(8*tau);startCurrent=cs;startPhase=next==='hold'?Math.asin(.4):0;ip=0;previous={t,i:cs};history.length=0;}
el('restartWave').onclick=restartWave;
el('cs').oninput=()=>{const requested=el('cs').value;if(wave!=='hold')chooseWave('hold');selectPreset(null);const end=performance.now()/1000,i=+requested*1000;if(end<=previous.t)return;const start=Math.max(previous.t,end-.08);queue.push({start,end,a:previous.i,b:i});previous={t:end,i};};
function advance(end){
 if(end<=t)return;
 if(wave==='sine'){
  const a=startPhase+omega*(t-startTime),b=startPhase+omega*(end-startTime),decay=Math.exp(-(end-t)/tau);
  const k=1/tau,scale=-.001*coilLimit*omega/(5e-6*(k*k+omega*omega));
  const response=x=>scale*(k*Math.cos(x)+omega*Math.sin(x));
  ip=response(b)+(ip-response(a))*decay;cs=coilLimit*Math.sin(b);voltage=-.001*coilLimit*omega*Math.cos(b);t=end;return;
 }
 if(wave==='ramp'){
  const rate=rampRate,limitTime=startTime+(coilLimit-startCurrent)/rate;
  const rampSeconds=Math.max(0,Math.min(end,limitTime)-t);
  ip=rlStep(ip,-.001*rate,rampSeconds,tau);ip=rlStep(ip,0,end-t-rampSeconds,tau);
  cs=Math.min(coilLimit,startCurrent+rate*(end-startTime));limited=end>=limitTime;voltage=limited?0:-.001*rate;t=end;return;
 }
 while(t<end){const s=queue[0],initialCS=cs;let next=end;voltage=0;
 if(s&&t<s.start)next=Math.min(end,s.start);
 else if(s){next=Math.min(end,s.end);voltage=-.001*(s.b-s.a)/(s.end-s.start);cs=s.a+(s.b-s.a)*(next-s.start)/(s.end-s.start);}
 if(s&&t>=s.start&&t===s.start)history.push([t,initialCS/1000,voltage,ip/1e6]);
 ip=rlStep(ip,voltage,next-t,tau);t=next;
 if(s&&t===s.end)history.push([t,cs/1000,voltage,ip/1e6],[t,cs/1000,0,ip/1e6]);if(s&&t>=s.end){queue.shift();}
 }
}
el('tau').oninput=()=>{advance(performance.now()/1000-.09);tau=+el('tau').value;};
// Single-coil FreeGS scans from equilibrium/data.js: current deviation (kA), axis displacement (cm).
const scans=[{"turns":248.6,"points":[[-2.4135,-1.4635,4.3178],[-1.8101,-1.1014,3.2066],[-1.2068,-0.7309,2.1198],[-0.6034,-0.363,1.0355],[0,0,0],[0.6034,0.3578,-1.0814],[1.2068,0.712,-2.1542],[1.8101,1.0629,-3.2193],[2.4135,1.4108,-4.277]]},{"turns":115.2,"points":[[-5.2083,-8.9905,12.3745],[-3.9063,-6.6722,9.3079],[-2.6042,-4.4056,6.2322],[-1.3021,-2.177,3.1281],[0,0,0],[1.3021,2.134,-3.1769],[2.6042,4.2105,-6.3345],[3.9063,6.2433,-9.4926],[5.2083,8.2309,-12.6956]]},{"turns":185.9,"points":[[-3.2275,-17.5064,8.6487],[-2.4207,-13.2242,6.6777],[-1.6138,-8.8731,4.5745],[-0.8069,-4.4539,2.3589],[0,0,0],[0.8069,4.5193,-2.544],[1.6138,9.0717,-5.1941],[2.4207,13.6922,-8.0201],[3.2275,18.3441,-11.0281]]},{"turns":169.9,"points":[[-3.5315,-17.7073,-3.4322],[-2.6486,-13.396,-2.6905],[-1.7657,-9.017,-1.8548],[-0.8829,-4.5363,-0.9887],[0,0,0],[0.8829,4.6457,1.0248],[1.7657,9.3435,2.1318],[2.6486,14.1559,3.3711],[3.5315,19.037,4.6805]]},{"turns":216.8,"points":[[-2.7675,-7.9889,-7.5876],[-2.0756,-5.9748,-5.735],[-1.3838,-3.9735,-3.8616],[-0.6919,-1.978,-1.9598],[0,0,0],[0.6919,1.9763,1.9268],[1.3838,3.9251,3.8987],[2.0756,5.8572,5.8747],[2.7675,7.7771,7.863]]},{"turns":459.4,"points":[[-1.3061,-2.3718,-3.3979],[-0.9795,-1.7727,-2.5564],[-0.653,-1.1749,-1.714],[-0.3265,-0.5948,-0.8418],[0,0,0],[0.3265,0.5899,0.8055],[0.653,1.1724,1.6532],[0.9795,1.7501,2.4968],[1.3061,2.3237,3.3366]]}];
const pf=TokamakCADData.parts.filter(p=>p.part==='pf').map((p,i)=>{el('pf').add(new Option('PF'+(i+1)));const [a,b,c,d]=p.box;return {r:(a+b)/2,z:(c+d)/2,box:p.box,turns:scans[i].turns,on:false,i:0};});
function referenceShift(index,current){
 const points=scans[index].points,low=points[0][0],high=points.at(-1)[0];
 const sampled=Math.min(high,Math.max(low,current));
 const j=Math.max(1,points.findIndex(point=>point[0]>=sampled));
 const a=points[j-1],b=points[j],f=(sampled-a[0])/(b[0]-a[0]);
 return {dr:a[1]+f*(b[1]-a[1]),dz:a[2]+f*(b[2]-a[2]),outside:current<low||current>high};
}
function pfControls(){
 const index=el('pf').selectedIndex,p=pf[index],panel=el('axis');
 el('enabled').checked=p.on;el('pfI').value=p.i;math(el('pfOut'),formatted(p.i,'kA',1));
 const {dr,dz,outside}=referenceShift(index,p.on?p.i:0);
 if(outside){delete panel.dataset.last;panel.textContent='Mimo rozsah uložených rovnováh.';}
 else math(panel,'\\Delta R='+formatted(dr,'cm')+'\\quad\\Delta z='+formatted(dz,'cm'));
}
el('pf').onchange=pfControls;el('enabled').onchange=()=>{pf[el('pf').selectedIndex].on=el('enabled').checked;pfControls();};el('pfI').oninput=()=>{pf[el('pf').selectedIndex].i=+el('pfI').value;pfControls();};pfControls();
const fieldColor=0x356ac3, curves=new THREE.Group();scene.add(curves);
const lineBuffers=[];
function allocateLine(){
 const positions=new Float32Array(3*560),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));const line=new THREE.Line(g,new THREE.LineBasicMaterial({color:fieldColor,visible:false}));line.frustumCulled=false;
 const arrow=new THREE.Mesh(new THREE.ConeGeometry(.17,.47,9),new THREE.MeshBasicMaterial({color:fieldColor,transparent:true,depthWrite:false,toneMapped:false}));arrow.renderOrder=8;curves.add(line,arrow);return {positions,g,line,arrow};
}
const surfaceLines=12;
for(let i=0;i<surfaceLines+6;i++)lineBuffers.push(allocateLine());
const winding=TokamakCADData.templates.tf,profile=winding.inner.map((p,i)=>[(p[0]+winding.outer[i][0])/2,(p[1]+winding.outer[i][1])/2]);
const coilAngle=0, windingPoints=profile.map(([r,z])=>new THREE.Vector3(r*Math.cos(coilAngle),r*Math.sin(coilAngle)-.61,z));
const copper=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(windingPoints),new THREE.LineBasicMaterial({color:0xad6528}));scene.add(copper);
const innerLeg=windingPoints.reduce((best,p)=>Math.abs(p.z)<1.5&&p.x<best.x?p:best,windingPoints[0]);
const tfArrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(),2.6,0xad6528,.65,.36);scene.add(tfArrow);
/* The current channel is retained when the loop voltage vanishes. */
const plasma=new THREE.Group();scene.add(plasma);
const envelope=new THREE.Mesh(new THREE.TorusGeometry(6.2,2,32,144),new THREE.MeshBasicMaterial({color:0xdc73bd,transparent:true,opacity:.44,depthWrite:false,toneMapped:false}));envelope.renderOrder=3;plasma.add(envelope);
const surfaceGrid=new THREE.Group();plasma.add(surfaceGrid);
const gridInk=new THREE.LineBasicMaterial({color:0x6488bd,transparent:true,opacity:.34,depthWrite:false});
function surfacePoint(theta,phi){const r=6.2+2*Math.cos(theta);return new THREE.Vector3(r*Math.cos(phi),r*Math.sin(phi),2*Math.sin(theta));}
function gridLoop(point){const points=Array.from({length:120},(_,i)=>point(i*2*Math.PI/120));surfaceGrid.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),gridInk));}
for(let i=0;i<20;i++)gridLoop(theta=>surfacePoint(theta,i*Math.PI/10));
for(let i=0;i<6;i++)gridLoop(phi=>surfacePoint(i*Math.PI/3,phi));
const core=new THREE.Mesh(new THREE.TorusGeometry(6.2,.44,16,144),new THREE.MeshBasicMaterial({color:0xb650a6,transparent:true,opacity:.28,depthWrite:false}));plasma.add(core);
const markers=new THREE.Group();plasma.add(markers);
const tip=new THREE.ConeGeometry(.25,.78,16);
const rimInk=new THREE.MeshBasicMaterial({color:0xdca0c1,transparent:true,opacity:.7,depthWrite:false,toneMapped:false});
const ink=new THREE.MeshBasicMaterial({color:0x70194e,transparent:true,depthWrite:false,toneMapped:false});
for(let j=0;j<16;j++){
 const marker=new THREE.Mesh(tip,ink);marker.renderOrder=2;
 const rim=new THREE.Mesh(tip,rimInk);rim.scale.setScalar(1.12);rim.renderOrder=1;
 marker.add(rim);markers.add(marker);
}
let phase=0;
const vectorColors={tf:0x3e6fb4,ip:0x124b96,pf:0x207489,total:0x23579c};
const diagramColors={tf:'#245caa',ip:'#88205a',pf:'#216c42',total:'#29343e'};
const probePhi=-1.2,probeRadius=8.2,probe=new THREE.Vector3(probeRadius*Math.cos(probePhi),probeRadius*Math.sin(probePhi),0);
const probeDot=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),new THREE.MeshBasicMaterial({color:0x153b75}));scene.add(probeDot);
// Cache each circular coil's unit-current field on a regular R,z grid.
function coilGrid(p){const grid=new Float64Array(49*49*2);
 for(let j=0;j<49;j++)for(let i=0;i<49;i++){const r=2+i/6,z=-4+j/6;let br=0,bz=0;
 for(let k=0;k<40;k++){const c=Math.cos((k+.5)*2*Math.PI/40),dz=z-p.z,dist=(r*r+p.r*p.r-2*r*p.r*c+dz*dz)**1.5;
 br+=p.r*c*dz/dist;bz+=p.r*(p.r-r*c)/dist;}
 const n=2*(j*49+i),factor=1e-7*2*Math.PI/40*p.turns*1000;grid[n]=br*factor;grid[n+1]=bz*factor;
 }return grid;}
function components(r,z,kind){
 const x=r-6.2,f=kind==='total'||kind==='ip'?2e-7*ip/Math.max(4,x*x+z*z):0;
 let br=f*z,bz=-f*x;
 if(kind==='total'||kind==='pf')for(const p of pf){if(!p.on||!p.i)continue;p.grid||=coilGrid(p);
 const u=(r-2)*6,v=(z+4)*6,i=Math.max(0,Math.min(47,Math.floor(u))),j=Math.max(0,Math.min(47,Math.floor(v)));
 for(let b=0;b<2;b++)for(let a=0;a<2;a++){const w=(a?u-i:1-u+i)*(b?v-j:1-v+j)*p.i,n=2*((j+b)*49+i+a);br+=w*p.grid[n];bz+=w*p.grid[n+1];}}
 const bt=kind==='total'||kind==='tf'?2e-7*18*140*(+el('tf').value)*1000/r:0;
 return [br,bz,bt];
}
function field(r,z,kind){
 const [br,bz,bt]=components(r,z,kind);const norm=Math.hypot(br,bz,bt);return norm>1e-9?[br/norm,bz/norm,bt/(r*norm)]:null;
}
const up=new THREE.Vector3(0,1,0),direction=new THREE.Vector3();
// Wide strips keep all four field choices visible through the translucent plasma.
const linePatterns={total:[1,1],tf:[12,8],ip:[6,3],pf:[14,5]};
const stripIndices=Object.fromEntries(Object.entries(linePatterns).map(([kind,[period,on]])=>{
 const indices=[],counts=[0];
 for(let j=0;j<559;j++){
  if(j%period<on){const k=j*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
  counts.push(indices.length);
 }
 return [kind,{indices:new THREE.Uint16BufferAttribute(indices,1),counts}];
}));
const ribbons=lineBuffers.map(buf=>{
 const ribbonData=new Float32Array(560*6),ribbonGeometry=new THREE.BufferGeometry();
 ribbonGeometry.setAttribute('position',new THREE.BufferAttribute(ribbonData,3));
 const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,toneMapped:false});
 const ribbon=new THREE.Mesh(ribbonGeometry,material);
 ribbon.frustumCulled=false;ribbon.renderOrder=7;curves.add(ribbon);
 buf.ribbon={ribbonData,ribbonGeometry,ribbon};return buf.ribbon;
});
function updateRibbon({ribbonData,ribbonGeometry,ribbon},points,n,kind){
 const pos=new THREE.Vector3(),normal=new THREE.Vector3(),side=new THREE.Vector3(),tangent=new THREE.Vector3();
 const width=kind==='total'?.047:.055;
 for(let j=0;j<n;j++){
  pos.fromArray(points,3*j);const r=Math.hypot(pos.x,pos.y);
  normal.set(pos.x*(1-6.2/r),pos.y*(1-6.2/r),pos.z).normalize();
  tangent.fromArray(points,3*Math.min(n-1,j+1)).sub(side.fromArray(points,3*Math.max(0,j-1)));
  side.crossVectors(normal,tangent);
  if(side.lengthSq()<1e-10)side.set(-tangent.y,tangent.x,0);
  side.normalize().multiplyScalar(width);
  pos.addScaledVector(normal,.013).add(side).toArray(ribbonData,6*j);
  pos.addScaledVector(side,-2).toArray(ribbonData,6*j+3);
 }
 const pattern=stripIndices[kind];
 ribbonGeometry.setIndex(pattern.indices);ribbonGeometry.setDrawRange(0,pattern.counts[n-1]);ribbonGeometry.attributes.position.needsUpdate=true;
 ribbon.material.color.setHex(vectorColors[kind]);ribbon.visible=true;
}
// Integrated toroidal advance on a circular surface is proportional to the integral of 1/R².
const phiTable=[0];for(let j=1;j<=1024;j++){const theta=(j-.5)*2*Math.PI/1024;phiTable.push(phiTable[j-1]+1/(6.2+2*Math.cos(theta))**2);}
function toroidalPhase(theta){
 const turns=theta/(2*Math.PI),whole=Math.floor(turns),u=(turns-whole)*1024,i=Math.min(1023,Math.floor(u));
 return 2*Math.PI*(whole+(phiTable[i]+(u-i)*(phiTable[i+1]-phiTable[i]))/phiTable[1024]);
}
function inversePhase(phase){
 const turns=phase/(2*Math.PI),whole=Math.floor(turns),target=(turns-whole)*phiTable[1024];
 let lo=0,hi=1024;while(hi-lo>1){const mid=(lo+hi)>>1;if(phiTable[mid]<=target)lo=mid;else hi=mid;}
 return 2*Math.PI*(whole+(lo+(target-phiTable[lo])/(phiTable[hi]-phiTable[lo]))/1024);
}
function trace(buf,kind,seed,surfaceIndex=null){
 const initialTheta=surfaceIndex===null?0:surfaceIndex*2*Math.PI/surfaceLines;
 let r=6.2+seed*Math.cos(initialTheta),z=seed*Math.sin(initialTheta),phi=-1.2,n=0;const ds=.16;
 if(surfaceIndex!==null){
  const [,bz,bt]=components(8.2,0,'total'),rear=yaw+Math.PI;
  const ratio=bt?bz*(6.2**2-4)**1.5/(2*bt*8.2*6.2):0;
  const phase0=toroidalPhase(initialTheta);
  if(bt||bz)for(n=0;n<560;n++){
   const sweep=2*Math.PI*n/559;
   const az=bt?rear+Math.sign(bt)*sweep:rear+initialTheta;
   // Center the traced interval on the visible meridian. A change in pitch
   // then shifts the two ends behind the torus by equal and opposite flux phases.
   const theta=bt?inversePhase(phase0+ratio*Math.sign(bt)*(sweep-Math.PI)):Math.PI+Math.sign(bz)*sweep;
   const radius=6.2+2*Math.cos(theta);
   buf.positions.set([radius*Math.cos(az),radius*Math.sin(az),2*Math.sin(theta)],3*n);
  }
 }else for(;n<560;n++){if(r<2.2||r>9.8||Math.abs(z)>3.8)break;const a=field(r,z,kind);if(!a)break;
 buf.positions.set([r*Math.cos(phi),r*Math.sin(phi),z],3*n);
 const b=field(r+ds*a[0]/2,z+ds*a[1]/2,kind);if(!b)break;r+=ds*b[0];z+=ds*b[1];phi+=ds*b[2];
 if(kind==='total'&&surfaceGrid.visible){const theta=Math.atan2(z,r-6.2);r=6.2+seed*Math.cos(theta);z=seed*Math.sin(theta); }}
 if(n>2)updateRibbon(buf.ribbon,buf.positions,n,kind);
 buf.line.visible=buf.arrow.visible=n>2;if(n<3)return;buf.line.material.color.setHex(vectorColors[kind]);buf.arrow.material.color.setHex(vectorColors[kind]);buf.g.setDrawRange(0,n);buf.g.attributes.position.needsUpdate=true;
 const idx=Math.min(surfaceIndex===null?24:279,n-2)*3;buf.arrow.position.fromArray(buf.positions,idx);direction.fromArray(buf.positions,idx+3).sub(buf.arrow.position).normalize();buf.arrow.quaternion.setFromUnitVectors(up,direction);
}
const history=[],plotWindow=30;
const plotSeries=[
 {id:'plotCS',label:'I_{\\rm CS}',limit:50,unit:'kA',color:'#865129'},
 {id:'plotVoltage',label:'U_{\\rm ind}',limit:50,unit:'V',color:'#bb711d'},
 {id:'plotPlasma',label:'I_{\\rm p}',limit:10,unit:'MA',color:'#285eae'}
];
for(const series of plotSeries){
 const label=el(series.id);
 label.style.color=series.color;
 math(label,series.label+'\\enspace(\\pm '+formatted(series.limit,series.unit,0)+')');
}
function plot(now){
 history.push([now,cs/1000,voltage,ip/1e6]);while(history[0][0]<now-plotWindow)history.shift();
 const canvas=el('timePlot'),w=canvas.clientWidth,h=canvas.clientHeight;
 if(!w||!h)return;
 const rect=canvas.getBoundingClientRect();
 const pixelWidth=Math.max(w,Math.round(rect.width*devicePixelRatio)),pixelHeight=Math.max(h,Math.round(rect.height*devicePixelRatio));
 if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
 const c=canvas.getContext('2d'),mid=h/2,span=mid-3;
 c.setTransform(pixelWidth/w,0,0,pixelHeight/h,0,0);c.clearRect(0,0,w,h);
 c.lineWidth=1;c.strokeStyle='#e2e8e6';c.beginPath();
 for(let j=0;j<=6;j++){const x=.5+(w-1)*j/6;c.moveTo(x,3);c.lineTo(x,h-3);}
 for(const y of [3,h-3]){c.moveTo(0,y);c.lineTo(w,y);}
 c.stroke();
 c.strokeStyle='#aebdca';c.beginPath();c.moveTo(0,mid);c.lineTo(w,mid);c.stroke();
 c.save();c.beginPath();c.rect(0,3,w,2*span);c.clip();
 let overflow=false;
 plotSeries.forEach(({limit,color},i)=>{
  c.strokeStyle=color;c.lineWidth=1.8;c.beginPath();
  history.forEach((sample,j)=>{
   const value=sample[i+1]/limit;
   if(Math.abs(value)>1)overflow=true;
   c[j===0?'moveTo':'lineTo'](w*(1+(sample[0]-now)/plotWindow),mid-span*value);
  });
  c.stroke();
 });
 c.restore();el('plotOverflow').hidden=!overflow;
}
let plotted=-1,disposed=false,previousField='';
window.HiFyzikoFusionDispose=()=>{disposed=true;scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});reflection.dispose();renderer.dispose();};
// Draw the same geometry and field traces when the browser cannot create WebGL.
function wireframeRenderer(canvas){
 const fallback=canvas.cloneNode(false);canvas.replaceWith(fallback);view=fallback;
 const ctx=fallback.getContext('2d');
 const point=new THREE.Vector3();
 let pixelRatio=1;
 return {
  setPixelRatio(ratio){pixelRatio=ratio;},getPixelRatio(){return pixelRatio;},setClearColor(){},
  setSize(w,h){fallback.width=Math.floor(w*pixelRatio);fallback.height=Math.floor(h*pixelRatio);},
  render(world,camera){
   const w=fallback.width,h=fallback.height;
   ctx.fillStyle='#f9faf6';ctx.fillRect(0,0,w,h);
   world.updateMatrixWorld();camera.updateMatrixWorld();
   world.traverseVisible(object=>{
    const g=object.geometry,position=g?.attributes.position;
    if(!position||(!object.isLine&&!object.isMesh)||ribbons.some(item=>item.ribbon===object))return;
    const material=object.material;
    const xy=(index,move)=>{
     point.fromBufferAttribute(position,index).applyMatrix4(object.matrixWorld).project(camera);
     ctx[move?'moveTo':'lineTo']((point.x+1)*w/2,(1-point.y)*h/2);
    };
    ctx.strokeStyle='#'+material.color.getHexString();ctx.globalAlpha=object.isLine?.95:.53;ctx.lineWidth=object.isLine?2.2:.65;
    ctx.beginPath();
    if(object.isLine){
     const count=Math.min(position.count,g.drawRange.count);
     for(let i=0;i<count;i++)xy(i,i===0||object.isLineSegments&&i%2===0);
     if(object.isLineLoop)ctx.closePath();
    }else{
     const indices=g.index,count=indices?.count??position.count,step=3*Math.max(1,Math.ceil(count/300));
     for(let i=0;i+2<count;i+=step){
      const a=indices?indices.getX(i):i,b=indices?indices.getX(i+1):i+1,c=indices?indices.getX(i+2):i+2;
      if(material.clippingPlanes&&[a,b,c].every(index=>point.fromBufferAttribute(position,index).applyMatrix4(object.matrixWorld).y<0))continue;
      xy(a,true);xy(b,false);xy(c,false);xy(a,false);
     }
    }
    ctx.stroke();
   });
   ctx.globalAlpha=1;
  },dispose(){}
 };
}
const sectionX=r=>19+8.2*r,sectionY=z=>82-8.2*z;
const profiles=TokamakCAD.data.templates.vessel;
const vesselPath=[profiles.outer,profiles.inner].map(profile=>profile.map(([r,z],i)=>
 (i?'L':'M')+sectionX(r).toFixed(2)+' '+sectionY(z).toFixed(2)).join(' ')+' Z').join(' ');
let sectionSignature='';
function drawPFSection(){
 const section=el('pfSection');
 const active=pf.map((coil,i)=>coil.on?'PF'+(i+1):'').filter(Boolean);
 section.toggleAttribute('hidden',!active.length);
 if(!active.length){sectionSignature='';return;}
 const selected=el('pf').selectedIndex;
 const reference=pf[selected].on?selected:pf.findIndex(coil=>coil.on);
 const current=pf[reference].i,signature=[selected,current,...active].join('|');
 if(signature===sectionSignature)return;
 sectionSignature=signature;
 section.setAttribute('aria-label','Poloidální řez. Zapnuté cívky '+active.join(', '));
 const vessel='<path d="'+vesselPath+'" fill="#dce6e6" fill-rule="evenodd" stroke="#627f83" stroke-width=".7" stroke-linejoin="round"/>';
 const coils=pf.map((coil,i)=>{
  const [r0,r1,z0,z1]=coil.box,left=sectionX(r0),top=sectionY(z1),width=sectionX(r1)-left,height=sectionY(z0)-top;
  const fill=coil.on?'#d39a62':'#e9eeee',stroke=coil.on?'#9c572c':'#83999e';
  const weight=i===selected&&coil.on?1.2:.75,labelY=i<3?top-3:top+height+11;
  const box='<rect x="'+left+'" y="'+top+'" width="'+width+'" height="'+height+'" rx="1.2" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+weight+'"/>';
  const label='<text x="'+(left+width/2)+'" y="'+labelY+'" fill="'+(coil.on?'#713e1b':'#526975')+'">PF'+(i+1)+'</text>';
  return box+label;
 }).join('');
 const {dr,dz,outside}=referenceShift(reference,current);
 const axisX=sectionX(6.2),axisY=82,displacementScale=8.2*8/100;
 const shiftedX=axisX+displacementScale*dr,shiftedY=axisY-displacementScale*dz;
 const plasmaDisk='<circle cx="'+shiftedX+'" cy="'+shiftedY+'" r="16.4" fill="#edd3e4" stroke="#c081a9" stroke-width=".65"/>';
 const referenceDisk='<circle cx="'+axisX+'" cy="'+axisY+'" r="16.4" fill="none" stroke="#805169" stroke-width=".8" stroke-dasharray="3 2"/>';
 const legend='<text x="151" y="77">'+(outside?'Posun na mezi':'Zvětšený posun')+'</text><text x="151" y="87">PF'+(reference+1)+'</text>';
 section.innerHTML=vessel+plasmaDisk+referenceDisk+'<g text-anchor="middle" font-family="system-ui" font-size="8.5" font-weight="500">'+coils+'<g fill="#66374f" font-size="7.2">'+legend+'</g></g>';
}
function drawFieldDiagram(w,h,pixels){
 const canvas=el('fieldDiagram'),bw=266,bh=148,x=14,y=h-bh-12;
 const pixelW=Math.round(w*pixels),pixelH=Math.round(h*pixels);
 if(canvas.width!==pixelW||canvas.height!==pixelH){canvas.width=pixelW;canvas.height=pixelH;}
 const c=canvas.getContext('2d');c.setTransform(pixelW/w,0,0,pixelH/h,0,0);c.clearRect(0,0,w,h);
 camera.updateMatrixWorld();
 const sample=probe.clone().project(camera);
 const sx=(1+sample.x)*w/2,sy=(1-sample.y)*h/2;
 const displacements=['tf','ip','pf'].map(key=>{
  const [br,bz,bt]=components(probeRadius,0,key);
  return {x:bt+.46*br,y:-bz+.30*br,color:diagramColors[key]};
 });
 const vertices=[[0,0]];
 for(const d of displacements){const [a,b]=vertices.at(-1);vertices.push([a+d.x,b+d.y]);}
 const xs=vertices.map(v=>v[0]),ys=vertices.map(v=>v[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
 const scale=Math.min((bw-42)/Math.max(right-left,.01),(bh-42)/Math.max(bottom-top,.01),95);
 const usedLabels=[];
 const map=([a,b])=>[x+bw/2+(a-(left+right)/2)*scale,y+bh/2+(b-(top+bottom)/2)*scale];
 c.strokeStyle='#607995';c.lineWidth=1.2;c.setLineDash([4,3]);c.beginPath();c.moveTo(sx,sy);c.lineTo(...map(vertices[0]));c.stroke();c.setLineDash([]);
 c.fillStyle='#153b75';c.beginPath();c.arc(sx,sy,3.5,0,Math.PI*2);c.fill();
 function arrow(start,end,color,width,id,preferAbove){
  const [x0,y0]=map(start),[x1,y1]=map(end),dx=x1-x0,dy=y1-y0,length=Math.hypot(dx,dy);
  const label=el(id);label.hidden=length<1;
  if(label.hidden)return;
  label.style.color=color;
  const head=Math.min(10,length*.42),ux=dx/length,uy=dy/length,hx=x1-ux*head,hy=y1-uy*head;
  const labelWidth=Math.ceil(label.offsetWidth||42),labelHeight=Math.ceil(label.offsetHeight||18);
  const side=preferAbove?-1:1;
  const spots=[[0,16],[0,-16],[-16,16],[-16,-16],[-34,22],[-34,-22]];
  const boxes=spots.map(([back,offset])=>[
   Math.min(w-labelWidth-4,Math.max(4,x1+back*ux-side*offset*uy-labelWidth/2)),
   Math.min(h-labelHeight-4,Math.max(4,y1+back*uy+side*offset*ux-labelHeight/2))
  ]);
  const [lx,ly]=boxes.find(([x,y])=>!usedLabels.some(([a,b,aw,bh])=>x<a+aw+3&&x+labelWidth+3>a&&y<b+bh+3&&y+labelHeight+3>b))??boxes[0];
  label.style.left=lx+'px';label.style.top=ly+'px';usedLabels.push([lx,ly,labelWidth,labelHeight]);
  c.beginPath();c.moveTo(x0,y0);c.lineTo(hx,hy);c.strokeStyle='#fffcf8';c.lineWidth=width+2;c.stroke();
  c.strokeStyle=c.fillStyle=color;c.lineWidth=width;c.stroke();
  c.beginPath();c.moveTo(x1,y1);c.lineTo(hx-uy*head*.44,hy+ux*head*.44);c.lineTo(hx+uy*head*.44,hy-ux*head*.44);c.fill();
 }
 arrow(vertices[0],vertices.at(-1),diagramColors.total,5,'fieldTotal',true);
 displacements.forEach((d,i)=>arrow(vertices[i],vertices[i+1],d.color,3,['fieldTF','fieldPlasma','fieldPF'][i],false));
 if(displacements.every(d=>Math.hypot(d.x,d.y)*scale<1)){c.beginPath();c.arc(x+bw/2,y+bh/2,3,0,Math.PI*2);c.fill();}
}
function frame(ms){
 if(disposed)return;
 const dt=(ms-last)/1000;last=ms;advance(ms/1000-.09);
 const cut=el('cut').checked;
 for(const {mesh,key} of items){
  mesh.visible=componentControls[key].checked;
  const clip=cut&&key!=='cs';
  if(Boolean(mesh.material.clippingPlanes)!==clip){mesh.material.clippingPlanes=clip?[cutPlane]:null;mesh.material.needsUpdate=true;}
 }
 tfArrow.visible=componentControls.tf.checked&&+el('tf').value!==0;
 markers.visible=Math.abs(ip)>1000;
 const strength=Math.min(1,Math.abs(ip)/2e6);core.material.opacity=.36+.34*strength;phase=(phase+dt*1.8*Math.tanh(ip/2e6))%(2*Math.PI);
 if(plasma.visible&&markers.visible)markers.children.forEach((m,j)=>{const a=phase+j*2*Math.PI/markers.children.length;m.position.set(6.2*Math.cos(a),6.2*Math.sin(a),0);m.quaternion.setFromUnitVectors(up,direction.set(-Math.sin(a)*Math.sign(ip),Math.cos(a)*Math.sign(ip),0));});
 probeDot.position.copy(probe);
 copper.visible=tfArrow.visible;
 const sign=Math.sign(+el('tf').value);tfArrow.position.set(innerLeg.x,innerLeg.y,-1.3*sign);tfArrow.setDirection(direction.set(0,0,sign||1));
 surfaceGrid.visible=!pf.some(p=>p.on&&p.i);envelope.material.opacity=surfaceGrid.visible?.43:.36;
 const layers=[...document.querySelectorAll('#layers input:checked')];const signature=[yaw,ip.toFixed(1),el('tf').value,...pf.map(p=>p.on?p.i:0),...layers.map(b=>b.value)].join('|');if(signature!==previousField){previousField=signature;for(const item of ribbons)item.ribbon.visible=false;let i=0;
 for(const box of layers){
  if(box.value==='total'&&surfaceGrid.visible){for(let j=0;j<surfaceLines;j++)trace(lineBuffers[i++],'total',2,j);}
  else for(const seed of [.85,1.65])trace(lineBuffers[i++],box.value,seed);
 }
 for(;i<lineBuffers.length;i++)lineBuffers[i].line.visible=lineBuffers[i].arrow.visible=false;}
 if(ms-plotted>48){plotted=ms;if(!queue.length)el('cs').value=cs/1000;
 el('actionHint').textContent=wave==='sine'?'Ve vrcholech proudu je indukované napětí nulové. Sledujte změnu směru stáčení.':wave==='ramp'?(limited?'Proud CS dosáhl meze. Proud plazmatem a stáčení doznívají.':'Proud CS roste rovnoměrně. Proud plazmatem se blíží stálé hodnotě a sklon siločar se ustaluje.'):'Při stálém proudu CS indukované napětí zaniká. Zvolte sinusový nebo rostoucí průběh.';
 math(el('coilState'),'I_{\\rm CS}='+formatted(cs/1000,'kA')+'\\quad(|I|_{\\max}=50\\,\\mathrm{kA})');
 const [br,bz,bt]=components(probeRadius,0,'total');const slope=Math.atan2(bz,Math.hypot(bt,br))*180/Math.PI;
 math(el('angle'),'\\alpha='+ (Math.hypot(br,bz,bt)>1e-9?slope.toFixed(1).replace('.','{,}')+'^\\circ':'\\text{neurčen}'));math(el('bp'),'B_{\\rm p}(a)='+formatted(Math.abs(ip)*1e-7,'T',2));math(el('readout'),'U_{\\rm ind}='+formatted(voltage,'V')+'\\quad I_{\\rm p}='+formatted(ip/1e6,'MA',2));math(el('tfOut'),formatted(+el('tf').value,'kA',0));math(el('bt'), 'B_{\\rm t}(R_0)='+formatted(2e-7*18*140*el('tf').value*1000/6.2,'T',2));math(el('csOut'),formatted(+el('cs').value,'kA'));math(el('tauOut'),formatted(tau,'s'));plot(t);}
 const viewport=view.parentElement??view;
 const w=viewport.clientWidth,h=viewport.clientHeight;if(w&&h){
 const screenWidth=viewport.getBoundingClientRect?.().width??w;
 const pixels=Math.max(1,Math.min(4,devicePixelRatio*screenWidth/w));
 if(renderer.getPixelRatio()!==pixels)renderer.setPixelRatio(pixels);
 if(view.width!==Math.floor(w*pixels)||view.height!==Math.floor(h*pixels))renderer.setSize(w,h,false);const half=Math.max(11.3,14*h/w);camera.left=-half*w/h;camera.right=-camera.left;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();camera.position.set(45*Math.cos(pitch)*Math.cos(yaw),45*Math.cos(pitch)*Math.sin(yaw),45*Math.sin(pitch));camera.lookAt(0,0,0);try{renderer.render(scene,camera);if(renderer.getContext?.().isContextLost())throw Error('WebGL context lost');}catch(error){
   console.warn('Using the wireframe view after a WebGL error.',error);
   renderer.dispose();renderer=wireframeRenderer(view);bindView();
   renderer.setPixelRatio(pixels);renderer.setSize(w,h,false);renderer.render(scene,camera);
  }
  drawPFSection();
  drawFieldDiagram(w,h,pixels);
  el('busy').hidden=true;
 }
 requestAnimationFrame(draw);
}
function draw(now){try{frame(now);}catch(error){showRenderError(error);}}
draw(performance.now());
 }catch(error){showRenderError(error);}
 function showRenderError(error){
  console.error(error);
  const busy=el('busy');busy.hidden=false;busy.textContent='Scénu se nepodařilo vykreslit. ';
  const retry=document.createElement('button');retry.textContent='Opakovat';retry.onclick=()=>location.reload();busy.append(retry);
 }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
else initialize();
}
