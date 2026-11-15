(function(){
'use strict';
const S=window.HiFyzikoParticleStyle,canvas=document.getElementById('gl'),host=document.getElementById('views'),views=[];
const atomMode=document.body.dataset.mode==='atoms',nucleusMode=document.body.dataset.mode==='nuclei';
const currentPage=atomMode?'atomy.html':nucleusMode?'jadra.html':'index.html';
document.querySelectorAll('nav a').forEach(a=>{if(a.getAttribute('href')===currentPage)a.setAttribute('aria-current','page');});
let electronPositions=S.electronCloud.markers;
function orbitPositions(t){
 const c=S.electronCloud,angle=t*c.orbitSpeed+.3;
 return [0,1].map(i=>{const a=angle+i*Math.PI;return [c.orbitRadius*Math.cos(a),c.orbitRadius*Math.sin(a)*Math.cos(c.orbitTilt),c.orbitRadius*Math.sin(a)*Math.sin(c.orbitTilt)];});
}
document.documentElement.style.setProperty('--ui-font',S.fontSize);
document.documentElement.style.setProperty('--particle-font',S.particleLabels.fontSize+'px');
document.documentElement.style.setProperty('--scene-background','#'+S.background.toString(16).padStart(6,'0'));
const counts={proton:'q=+e',neutron:'q=0',electron:'q=-e',deuteron:'1\\mathrm p+1\\mathrm n',triton:'1\\mathrm p+2\\mathrm n',helium3:'2\\mathrm p+1\\mathrm n',alpha:'2\\mathrm p+2\\mathrm n'};
function math(el,tex){el.innerHTML=katex.renderToString(tex,{throwOnError:true,output:'htmlAndMathml'});}
const catalog=atomMode?S.atomViews:nucleusMode?Object.fromEntries(S.nucleusIds.map(id=>[id,S.species[id]])):S.species;
Object.entries(catalog).forEach(([id,s])=>{
 const el=document.createElement('section');el.className='view';el.tabIndex=0;el.setAttribute('aria-label',s.name+'; tažením nebo šipkami lze otočit');
 const h=document.createElement('h2');h.textContent=nucleusMode&&id==='proton'?'Jádro vodíku · proton':s.name;const desc=document.createElement('div');desc.className='composition';math(desc,atomMode?s.electrons+'\\mathrm e^{-}\\quad q_{\\mathrm{atom}}=0':counts[id]);el.append(h,desc);
 const atoms=S.connected.atoms[s.nucleus||id],marks=atoms.map(a=>{const mark=document.createElement('span');mark.className='mark';math(mark,S.labels[a[3]<0?'e':a[3]?'p':'n']);el.append(mark);return mark;});
 const electronMarks=Array.from({length:s.electrons||0},()=>{const mark=document.createElement('span');mark.className='mark electron-label';math(mark,S.labels.e);el.append(mark);return mark;});
 const v={id,el,atoms,marks,electronMarks,electrons:s.electrons||0,yaw:S.connected.yaw,pitch:S.connected.pitch,zoom:1,maxZoom:atomMode?.57:atoms.length>1?.82:1.02,bound:HiFyzikoParticleFraming.radius(atoms,s.electrons?Math.max(1.2*S.electronCloud.radius,S.electronCloud.orbitRadius+S.electronCloud.markerRadius):0)};views.push(v);host.append(el);
 let drag=null;
 el.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();el.focus({preventScroll:true});drag=[e.pointerId,e.clientX,e.clientY];el.setPointerCapture(e.pointerId);});
 el.addEventListener('dragstart',e=>e.preventDefault());
 el.addEventListener('pointermove',e=>{if(!drag||drag[0]!==e.pointerId)return;v.yaw+=(e.clientX-drag[1])*.007;v.pitch=Math.max(-1.3,Math.min(1.3,v.pitch+(e.clientY-drag[2])*.007));drag=[e.pointerId,e.clientX,e.clientY];dirty=true;});
 el.addEventListener('pointerup',()=>drag=null);el.addEventListener('pointercancel',()=>drag=null);
 el.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();if(e.key==='ArrowLeft')v.yaw-=.1;if(e.key==='ArrowRight')v.yaw+=.1;if(e.key==='ArrowUp')v.pitch=Math.max(-1.3,v.pitch-.1);if(e.key==='ArrowDown')v.pitch=Math.min(1.3,v.pitch+.1);dirty=true;});
});
const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,depth:false});
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
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),gl.STATIC_DRAW);
const attr=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
const uniforms={};for(const name of ['uResolution','uOrigin','uTime','uYaw','uPitch','uZoom','uVib','uCount','uAtoms[0]','uProton','uNeutron','uElectron','uBackground','uElectronCount','uElectronPositions[0]','uCloudRadius','uCloudOpacity','uMarkerRadius','uOrbitRadius','uOrbitTilt','uOrbitOpacity'])uniforms[name]=gl.getUniformLocation(program,name);
gl.uniform3fv(uniforms['uElectronPositions[0]'],new Float32Array(S.electronCloud.markers.flat()));
gl.uniform1f(uniforms.uCloudRadius,S.electronCloud.radius);gl.uniform1f(uniforms.uCloudOpacity,S.electronCloud.opacity);gl.uniform1f(uniforms.uMarkerRadius,S.electronCloud.markerRadius);
gl.uniform1f(uniforms.uOrbitRadius,S.electronCloud.orbitRadius);gl.uniform1f(uniforms.uOrbitTilt,S.electronCloud.orbitTilt);gl.uniform1f(uniforms.uOrbitOpacity,S.electronCloud.orbitOpacity);
for(const [key,c] of [['uProton',S.colors.p],['uNeutron',S.colors.n],['uElectron',S.colors.e],['uBackground',S.background]]){gl.uniform3f(uniforms[key],((c>>16)&255)/255,((c>>8)&255)/255,(c&255)/255);}
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
let dirty=true,last=0,time=0,stopped=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)'),buffer=new Float32Array(16);
let resolutionScale=S.render.initialScale,averageFrameMs=16.7,qualitySince=0,samples=0;
function frame(now){
 if(stopped)return;requestAnimationFrame(frame);
 if(document.hidden){last=0;qualitySince=now;samples=0;return;}if(now-last<8&&!dirty)return;
 if(last){
  const dt=now-last;time+=Math.min(.07,dt/1000);
  if(!reduced.matches){averageFrameMs=.94*averageFrameMs+.06*Math.min(dt,100);samples++;}
 }
 last=now;
 if(reduced.matches&&!dirty)return;
 // Use sustained frame pacing, not a single slow frame, to adapt raster quality.
 if(samples>45&&now-qualitySince>2500){
  if(averageFrameMs>24)resolutionScale=Math.max(S.render.minScale,resolutionScale*.85);
  else if(averageFrameMs<18)resolutionScale=Math.min(S.render.maxScale,resolutionScale+.08);
  samples=0;qualitySince=now;
 }
 const rect=canvas.getBoundingClientRect(),ratio=resolutionScale,w=Math.round(rect.width*ratio),h=Math.round(rect.height*ratio);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;dirty=true;}
 gl.enable(gl.SCISSOR_TEST);
 electronPositions=orbitPositions(reduced.matches?0:time);
 gl.uniform3fv(uniforms['uElectronPositions[0]'],new Float32Array(electronPositions.flat()));
 views.forEach(v=>{
  const r=v.el.getBoundingClientRect(),x=Math.round((r.left-rect.left)*ratio),y=Math.round((rect.bottom-r.bottom)*ratio),vw=Math.round(r.width*ratio),vh=Math.round(r.height*ratio);
  const zoom=HiFyzikoParticleFraming.fit(r.width,r.height,v.bound,v.maxZoom);
  if(Math.abs(v.zoom-zoom)>1e-8){v.zoom=zoom;dirty=true;}
  gl.viewport(x,y,vw,vh);gl.scissor(x,y,vw,vh);
  gl.uniform2f(uniforms.uResolution,vw,vh);gl.uniform2f(uniforms.uOrigin,x,y);gl.uniform1f(uniforms.uTime,reduced.matches?0:time);
  gl.uniform1f(uniforms.uYaw,v.yaw);gl.uniform1f(uniforms.uPitch,v.pitch);gl.uniform1f(uniforms.uZoom,v.zoom);gl.uniform1f(uniforms.uVib,S.connected.vibration);
  gl.uniform1i(uniforms.uElectronCount,v.electrons);
  buffer.fill(0);v.atoms.forEach((a,i)=>buffer.set(a,i*4));gl.uniform1i(uniforms.uCount,v.atoms.length);gl.uniform4fv(uniforms['uAtoms[0]'],buffer);gl.drawArrays(gl.TRIANGLES,0,6);
  if(dirty||v.electrons)labels(v,r.width,r.height);
 });
 dirty=false;
}
new ResizeObserver(()=>dirty=true).observe(canvas);reduced.addEventListener('change',()=>dirty=true);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stopped=true;fail();});
requestAnimationFrame(frame);
})();
