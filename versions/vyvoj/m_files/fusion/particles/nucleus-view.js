/* Transparent instances of the approved shared nuclear surface. */
(function(root){
class NucleusView{
 constructor(canvas){
 this.canvas=canvas;const gl=this.gl=canvas.getContext('webgl2',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)throw Error('WebGL 2 není dostupné.');
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const p=this.program=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,'#version 300 es\nin vec2 aPosition;out vec2 vUV;void main(){vUV=aPosition;gl_Position=vec4(aPosition,0.,1.);}'));
 const source=root.HiFyzikoNuclearShader.replace('uAtoms[4]','uAtoms[8]').replaceAll('i<4','i<8').replace('uniform float uTime','uniform float uOpacity;\nuniform float uTime').replace('fragColor=vec4(col+grain,1.);','fragColor=vec4(col+grain,surfaceT<999.?uOpacity:0.);');
 if(source===root.HiFyzikoNuclearShader)throw Error('Neznámé rozhraní shaderu.');gl.attachShader(p,compile(gl.FRAGMENT_SHADER,source));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));gl.useProgram(p);
 this.geometry=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.geometry);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(p,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 this.u={};for(const key of ['uOpacity','uResolution','uOrigin','uTime','uYaw','uPitch','uZoom','uVib','uCount','uAtoms[0]','uNeutrino','uNeutrinoOutline','uProton','uNeutron','uElectron','uBackground','uElectronCount'])this.u[key]=gl.getUniformLocation(p,key);
 const S=root.HiFyzikoParticleStyle;for(const [key,col]of [['uNeutrino',S.colors.neutrino],['uNeutrinoOutline',S.colors.neutrinoOutline],['uProton',S.colors.p],['uNeutron',S.colors.n],['uElectron',S.colors.e],['uBackground',S.background]])gl.uniform3f(this.u[key],(col>>16&255)/255,(col>>8&255)/255,(col&255)/255);
 this.lastDraw=-Infinity;this.pending=null;this.disposed=false;root.HiFyzikoFusionDispose=()=>this.dispose();
 root.addEventListener('pagehide',event=>{if(!event.persisted)this.dispose();});
 }
 draw(width,height,time,items){
 const gl=this.gl,now=performance.now();if(this.disposed||width<=0||height<=0)return;
 if(this.pending){const state=gl.clientWaitSync(this.pending,0,0);if(state===gl.TIMEOUT_EXPIRED)return;if(state===gl.WAIT_FAILED){this.dispose();return;}gl.deleteSync(this.pending);this.pending=null;}
 this.lastDraw=now;
 const bounds=this.canvas.getBoundingClientRect(),fit=Math.min(bounds.width/width,bounds.height/height);
 const u=this.u,S=root.HiFyzikoParticleStyle,d=Math.min(Math.min(devicePixelRatio||1,2)*fit,Math.sqrt(8000000/(width*height))),cw=Math.max(1,Math.floor(width*d)),ch=Math.max(1,Math.floor(height*d));if(this.canvas.width!==cw||this.canvas.height!==ch){this.canvas.width=cw;this.canvas.height=ch;}gl.useProgram(this.program);gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.SCISSOR_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uVib,S.connected.vibration);gl.uniform1i(u.uElectronCount,0);gl.uniform1f(u.uYaw,0);gl.uniform1f(u.uPitch,0);
 for(const item of items){const leptonColor=item.id==='positron'?S.colors.positron:S.colors.e;gl.uniform3f(u.uElectron,(leptonColor>>16&255)/255,(leptonColor>>8&255)/255,(leptonColor&255)/255);gl.uniform1f(u.uVib,item.vibration??S.connected.vibration);gl.uniform1f(u.uOpacity,item.opacity??1);const size=item.radius*8,zoom=6.2/(1.72*8),xx=Math.round((item.x-size/2)*d),yy=Math.round((height-item.y-size/2)*d),ss=Math.round(size*d),atoms=item.atoms||S.connected.atoms[item.id],buffer=new Float32Array(32);atoms.forEach((a,i)=>buffer.set(a,i*4));gl.viewport(xx,yy,ss,ss);const clip=item.clipY;gl.scissor(xx,yy+(clip?Math.floor(ss*clip[0]):0),ss,clip?Math.ceil(ss*(clip[1]-clip[0])):ss);gl.uniform2f(u.uResolution,ss,ss);gl.uniform2f(u.uOrigin,xx,yy);gl.uniform1f(u.uZoom,zoom);gl.uniform1i(u.uCount,atoms.length);gl.uniform4fv(u['uAtoms[0]'],buffer);gl.drawArrays(gl.TRIANGLES,0,6);}
 this.pending=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
 }
 dispose(){if(this.disposed)return;this.disposed=true;const gl=this.gl;if(this.pending)gl.deleteSync(this.pending);gl.deleteBuffer(this.geometry);for(const shader of gl.getAttachedShaders(this.program)||[])gl.deleteShader(shader);gl.deleteProgram(this.program);gl.getExtension('WEBGL_lose_context')?.loseContext();}
}
root.HiFyzikoNucleusView=NucleusView;
})(globalThis);
