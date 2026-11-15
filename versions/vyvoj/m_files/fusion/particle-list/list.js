(function(){
'use strict';
const S=window.HiFyzikoParticleStyle,canvas=document.getElementById('gl'),host=document.getElementById('views'),views=[];
let atomMode=false,nucleusMode=false,dirty=true,selected=0;
const picker=document.getElementById('galleryModel');
let electronPositions=S.electronCloud.markers;
function orbitPositions(t){
 const c=S.electronCloud,angle=t*c.orbitSpeed+.3;
 return [0,1].map(i=>{const a=angle+i*Math.PI;return [c.orbitRadius*Math.cos(a),c.orbitRadius*Math.sin(a)*Math.cos(c.orbitTilt),c.orbitRadius*Math.sin(a)*Math.sin(c.orbitTilt)];});
}
document.documentElement.style.setProperty('--ui-font',S.fontSize);
document.documentElement.style.setProperty('--particle-font',S.particleLabels.fontSize+'px');
document.documentElement.style.setProperty('--scene-background','#'+S.background.toString(16).padStart(6,'0'));
const counts={proton:'q=+e',neutron:'q=0',electron:'q=-e',positron:'q=+e',neutrino:'q=0',deuteron:'1\\mathrm p+1\\mathrm n',triton:'1\\mathrm p+2\\mathrm n',helium3:'2\\mathrm p+1\\mathrm n',alpha:'2\\mathrm p+2\\mathrm n'};
function math(el,tex){el.innerHTML=katex.renderToString(tex,{throwOnError:true,output:'htmlAndMathml'});}
function setMode(mode){
 atomMode=mode==='atoms';nucleusMode=mode==='nuclei';document.body.dataset.mode=mode;
 host.replaceChildren();views.length=0;
 const catalog=mode==='all'?{...S.species,...S.atomViews}:atomMode?S.atomViews:nucleusMode?Object.fromEntries(S.nucleusIds.map(id=>[id,S.species[id]])):Object.fromEntries(Object.entries(S.species).filter(([,s])=>s.kinds.length===1));
Object.entries(catalog).forEach(([id,s])=>{
 const el=document.createElement('section');el.className='view';el.tabIndex=0;el.setAttribute('aria-label',s.name+'; tažením nebo šipkami lze otočit');
 const h=document.createElement('h2');h.textContent=nucleusMode&&id==='proton'?'Jádro vodíku · proton':s.name;const desc=document.createElement('div');desc.className='composition';math(desc,s.electrons?s.electrons+'\\mathrm e^{-}\\quad q_{\\mathrm{atom}}=0':counts[id]);el.append(h,desc);
 const atoms=S.connected.atoms[s.nucleus||id],marks=atoms.map(a=>{const mark=document.createElement('span');mark.className='mark';math(mark,S.labels[id==='neutrino'?'neutrino':id==='positron'?'positron':a[3]<0?'e':a[3]?'p':'n']);if(id==='neutrino'){mark.style.color='#294a53';mark.style.textShadow='none';}el.append(mark);return mark;});
 const electronMarks=Array.from({length:s.electrons||0},()=>{const mark=document.createElement('span');mark.className='mark electron-label';math(mark,S.labels.e);el.append(mark);return mark;});
 const v={id,el,atoms,marks,electronMarks,electrons:s.electrons||0,yaw:S.connected.yaw,pitch:S.connected.pitch,zoom:1,maxZoom:(s.electrons?.57:atoms.length>1?.82:1.02)*.8,bound:HiFyzikoParticleFraming.radius(atoms,s.electrons?Math.max(1.2*S.electronCloud.radius,S.electronCloud.orbitRadius+S.electronCloud.markerRadius):0)};views.push(v);host.append(el);
 let drag=null;
 el.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();el.focus({preventScroll:true});drag=[e.pointerId,e.clientX,e.clientY];el.setPointerCapture(e.pointerId);});
 el.addEventListener('dragstart',e=>e.preventDefault());
 el.addEventListener('pointermove',e=>{if(!drag||drag[0]!==e.pointerId)return;v.yaw+=(e.clientX-drag[1])*.007;v.pitch=Math.max(-1.3,Math.min(1.3,v.pitch+(e.clientY-drag[2])*.007));drag=[e.pointerId,e.clientX,e.clientY];dirty=true;});
 el.addEventListener('pointerup',()=>drag=null);el.addEventListener('pointercancel',()=>drag=null);
 el.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();if(e.key==='ArrowLeft')v.yaw-=.1;if(e.key==='ArrowRight')v.yaw+=.1;if(e.key==='ArrowUp')v.pitch=Math.max(-1.3,v.pitch-.1);if(e.key==='ArrowDown')v.pitch=Math.min(1.3,v.pitch+.1);dirty=true;});
});
picker.replaceChildren();
for(const v of views){const option=document.createElement('option');option.value=v.id;option.textContent=v.el.querySelector('h2').textContent;picker.append(option);}
select(0);
for(const button of document.querySelectorAll('[data-gallery-mode]'))button.setAttribute('aria-pressed',String(button.dataset.galleryMode===mode));
document.querySelector('[data-gallery-legend]').textContent=atomMode?'Oběh a měkká dráha jsou názorné schéma, nikoli skutečná trajektorie.':nucleusMode?'Červený proton · šedý neutron · bez elektronového obalu':'Červený proton · šedý neutron · modrý elektron · fialový pozitron · světlé neutrino';
document.querySelector('[data-gallery-note]').textContent=atomMode?'Obal a modré body znázorňují tytéž elektrony · 1.0':'Ilustrativní povrchy a měřítko · 1.0';
}
function select(index){selected=(index+views.length)%views.length;views.forEach((v,i)=>v.el.classList.toggle('is-selected',i===selected));picker.value=views[selected].id;dirty=true;}
picker.onchange=()=>select(views.findIndex(v=>v.id===picker.value));
document.getElementById('galleryPrevious').onclick=()=>select(selected-1);document.getElementById('galleryNext').onclick=()=>select(selected+1);
for(const button of document.querySelectorAll('[data-gallery-mode]'))button.onclick=()=>setMode(button.dataset.galleryMode);
setMode(document.body.dataset.galleryInitial||'all');
const gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false});
function fail(){document.getElementById('error').hidden=false;}
if(!gl){fail();return;}
let program;
try{
 function shader(type,text){const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,'#version 300 es\nin vec2 aPosition;out vec2 vUV;void main(){vUV=aPosition;gl_Position=vec4(aPosition,0.,1.);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,window.HiFyzikoNuclearShader));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
}catch(e){console.error(e);fail();return;}
gl.useProgram(program);
const geometry=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,geometry);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),gl.STATIC_DRAW);
const attr=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
const uniforms={};for(const name of ['uResolution','uOrigin','uTime','uYaw','uPitch','uZoom','uVib','uCount','uAtoms[0]','uNeutrino','uNeutrinoOutline','uProton','uNeutron','uElectron','uBackground','uElectronCount','uElectronPositions[0]','uCloudRadius','uCloudOpacity','uMarkerRadius','uOrbitRadius','uOrbitTilt','uOrbitOpacity'])uniforms[name]=gl.getUniformLocation(program,name);
gl.uniform3fv(uniforms['uElectronPositions[0]'],new Float32Array(S.electronCloud.markers.flat()));
gl.uniform1f(uniforms.uCloudRadius,S.electronCloud.radius);gl.uniform1f(uniforms.uCloudOpacity,S.electronCloud.opacity);gl.uniform1f(uniforms.uMarkerRadius,S.electronCloud.markerRadius);
gl.uniform1f(uniforms.uOrbitRadius,S.electronCloud.orbitRadius);gl.uniform1f(uniforms.uOrbitTilt,S.electronCloud.orbitTilt);gl.uniform1f(uniforms.uOrbitOpacity,S.electronCloud.orbitOpacity);
for(const [key,c] of [['uNeutrino',S.colors.neutrino],['uNeutrinoOutline',S.colors.neutrinoOutline],['uProton',S.colors.p],['uNeutron',S.colors.n],['uElectron',S.colors.e],['uBackground',S.background]]){gl.uniform3f(uniforms[key],((c>>16)&255)/255,((c>>8)&255)/255,(c&255)/255);}
function labels(v,w,h){
 const cy=Math.cos(v.yaw),sy=Math.sin(v.yaw),cp=Math.cos(v.pitch),sp=Math.sin(v.pitch),cz=6.2/v.zoom;
 // Scale from the resting projected diameter, never from surface vibration.
 const labelSize=S.particleLabels.fontSize*(3.44*h/cz)/S.particleLabels.referenceDiameter;
 const centers=v.atoms.map(a=>{const x=cy*a[0]-sy*a[2],z=sy*a[0]+cy*a[2];return [x,cp*a[1]+sp*z,-sp*a[1]+cp*z];});
 centers.forEach((c,i)=>{
  const r=v.atoms[i][3]<0?.55:1,len=Math.hypot(c[0],c[1],cz-c[2]),p=[c[0]-r*c[0]/len,c[1]-r*c[1]/len,c[2]+r*(cz-c[2])/len];
  const mark=v.marks[i];mark.style.fontSize=labelSize*r+'px';mark.hidden=centers.some((o,j)=>j!==i&&Math.hypot(...p.map((x,k)=>x-o[k]))<.98);
  mark.style.left=w*.5+1.72*p[0]/(cz-p[2])*h+'px';mark.style.top=h*.5-1.72*p[1]/(cz-p[2])*h+'px';
 });
 v.electronMarks.forEach((mark,i)=>{
  const a=electronPositions[i],x=cy*a[0]-sy*a[2],z=sy*a[0]+cy*a[2],p=[x,cp*a[1]+sp*z,-sp*a[1]+cp*z];
  const fontSize=labelSize*S.particleLabels.orbitScale;mark.style.fontSize=fontSize+'px';
  const offset=1.72*S.electronCloud.markerRadius*h/cz+fontSize*.65;
  // Marker labels are outside the small blue point; never ride its surface.
  mark.hidden=centers.some(c=>Math.hypot(p[0]-c[0],p[1]-c[1])<1&&p[2]<c[2]+1);
  mark.style.left=w*.5+1.72*p[0]/(cz-p[2])*h+'px';mark.style.top=h*.5-1.72*p[1]/(cz-p[2])*h-offset+'px';
 });
}
let last=0,time=0,stopped=false,raf=0,fence=null;const reduced=matchMedia('(prefers-reduced-motion: reduce)'),buffer=new Float32Array(16);
// All overview tiles share one bounded drawing buffer and one graphics context.
let resolutionScale=Math.min(devicePixelRatio||1,2),averageFrameMs=33.3,qualitySince=0,samples=0;
function frame(now){
 if(stopped)return;raf=requestAnimationFrame(frame);
 if(document.hidden){last=0;qualitySince=now;samples=0;return;}if(last&&now-last<1000/30)return;
 if(reduced.matches&&!dirty)return;
 if(fence){const state=gl.clientWaitSync(fence,0,0);if(state===gl.TIMEOUT_EXPIRED)return;if(state===gl.WAIT_FAILED){fail();dispose();return;}gl.deleteSync(fence);fence=null;}
 if(last){
  const dt=now-last;time+=Math.min(.07,dt/1000);
  if(!reduced.matches){averageFrameMs=.94*averageFrameMs+.06*Math.min(dt,100);samples++;}
 }
 last=now;
 if(reduced.matches&&!dirty)return;
 // Use sustained frame pacing, not a single slow frame, to adapt raster quality.
 if(samples>45&&now-qualitySince>2500){
  if(averageFrameMs>48)resolutionScale=Math.max(1,resolutionScale*.9);
  else if(averageFrameMs<38)resolutionScale=Math.min(Math.min(devicePixelRatio||1,2),resolutionScale+.1);
  samples=0;qualitySince=now;
 }
 const rect=canvas.getBoundingClientRect();if(rect.width<=0||rect.height<=0)return;
 const ratio=Math.min(resolutionScale,4096/Math.max(rect.width,rect.height),Math.sqrt(6000000/(rect.width*rect.height))),w=Math.max(1,Math.floor(rect.width*ratio)),h=Math.max(1,Math.floor(rect.height*ratio));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;dirty=true;}
 // Clear outside tile scissors too: incomplete rows must use the scene background.
 gl.disable(gl.SCISSOR_TEST);
 gl.clearColor((S.background>>16&255)/255,(S.background>>8&255)/255,(S.background&255)/255,1);
 gl.clear(gl.COLOR_BUFFER_BIT);
 gl.enable(gl.SCISSOR_TEST);
 electronPositions=orbitPositions(reduced.matches?0:time);
 gl.uniform3fv(uniforms['uElectronPositions[0]'],new Float32Array(electronPositions.flat()));
 views.forEach(v=>{
  const r=v.el.getBoundingClientRect();if(r.width<=0||r.height<=0)return;
  const x=Math.round((r.left-rect.left)*ratio),y=Math.round((rect.bottom-r.bottom)*ratio),vw=Math.round(r.width*ratio),vh=Math.round(r.height*ratio);
  const zoom=HiFyzikoParticleFraming.fit(r.width,r.height,v.bound,v.maxZoom,document.body.dataset.mode==='all'?60:100)*.85;
  if(Math.abs(v.zoom-zoom)>1e-8){v.zoom=zoom;dirty=true;}
  gl.viewport(x,y,vw,vh);gl.scissor(x,y,vw,vh);
  gl.uniform2f(uniforms.uResolution,vw,vh);gl.uniform2f(uniforms.uOrigin,x,y);gl.uniform1f(uniforms.uTime,reduced.matches?0:time);
  gl.uniform1f(uniforms.uYaw,v.yaw);gl.uniform1f(uniforms.uPitch,v.pitch);gl.uniform1f(uniforms.uZoom,v.zoom);gl.uniform1f(uniforms.uVib,S.connected.vibration);
  const leptonColor=v.id==='positron'?S.colors.positron:S.colors.e;gl.uniform3f(uniforms.uElectron,(leptonColor>>16&255)/255,(leptonColor>>8&255)/255,(leptonColor&255)/255);gl.uniform1i(uniforms.uElectronCount,v.electrons);
  buffer.fill(0);v.atoms.forEach((a,i)=>buffer.set(a,i*4));gl.uniform1i(uniforms.uCount,v.atoms.length);gl.uniform4fv(uniforms['uAtoms[0]'],buffer);gl.drawArrays(gl.TRIANGLES,0,6);
  if(dirty||v.electrons)labels(v,r.width,r.height);
 });
 fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
 dirty=false;
}
const observer=new ResizeObserver(()=>dirty=true),invalidate=()=>dirty=true;observer.observe(canvas);reduced.addEventListener('change',invalidate);
function dispose(){if(stopped)return;stopped=true;cancelAnimationFrame(raf);observer.disconnect();reduced.removeEventListener('change',invalidate);if(fence)gl.deleteSync(fence);gl.deleteBuffer(geometry);for(const shader of gl.getAttachedShaders(program)||[])gl.deleteShader(shader);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}
window.HiFyzikoFusionDispose=dispose;
window.addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!stopped){fail();dispose();}});
raf=requestAnimationFrame(frame);
})();
