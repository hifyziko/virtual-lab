(function(root){'use strict';
class WavePreview{
 constructor(){
  this.canvas=document.getElementById('waveScene');this.plot=document.getElementById('waveDensity');this.ctx=this.canvas.getContext('2d');this.g=this.plot.getContext('2d');this.slider=document.getElementById('waveTime');this.readout=document.getElementById('waveReadout');this.toggle=document.getElementById('wavePlay');this.message=document.getElementById('waveLoading');this.yaw=-.55;this.pitch=.32;this.zoom=1;this.time=0;this.running=true;this.active=false;this.data=null;this.frame=0;this.worker=null;
  this.slider.oninput=()=>{this.time=Number(this.slider.value)*3.15;this.running=false;this.toggle.textContent='Přehrát';this.draw();};
  this.toggle.onclick=()=>{if(this.time>=3.15)this.time=0;this.running=!this.running;this.toggle.textContent=this.running?'Pozastavit':'Přehrát';};
  document.getElementById('waveViewReset').onclick=()=>{this.yaw=-.55;this.pitch=.32;this.zoom=1;this.draw();};
  this.canvas.onpointerdown=e=>{if(e.button!==0)return;this.drag={x:e.clientX,y:e.clientY,yaw:this.yaw,pitch:this.pitch};this.canvas.setPointerCapture(e.pointerId);e.preventDefault();};
  this.canvas.onpointermove=e=>{if(!this.drag)return;this.yaw=this.drag.yaw-(e.clientX-this.drag.x)*.006;this.pitch=Math.max(-1.3,Math.min(1.3,this.drag.pitch-(e.clientY-this.drag.y)*.006));this.draw();};
  this.canvas.onpointerup=this.canvas.onpointercancel=this.canvas.onlostpointercapture=()=>{this.drag=null;};
  this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=Math.max(.55,Math.min(2,this.zoom*Math.exp(-e.deltaY*.001)));this.draw();},{passive:false});
 }
 open(){this.active=true;this.last=0;if(!this.data&&!this.worker)this.load();this.loop();}
 close(){this.active=false;cancelAnimationFrame(this.frame);this.frame=0;this.drag=null;}
 dispose(){this.close();this.worker?.terminate();this.worker=null;}
 load(){
  this.message.hidden=false;this.message.textContent='Počítám vlnový balík…';
  const ready=d=>{this.data=d;this.message.hidden=true;this.slider.disabled=this.toggle.disabled=false;this.draw();};
  try{const script='const compute='+HiFyzikoWavePacket.compute.toString()+';onmessage=()=>{try{const d=compute();postMessage(d,[d.xs.buffer,d.real.buffer,d.imag.buffer]);}catch(e){postMessage({error:e.message});}};',url=URL.createObjectURL(new Blob([script],{type:'text/javascript'}));this.worker=new Worker(url);URL.revokeObjectURL(url);this.worker.onmessage=({data})=>{this.worker.terminate();this.worker=null;if(data.error){this.message.textContent='Výpočet se nezdařil: '+data.error;return;}ready(data);};this.worker.onerror=()=>{this.worker?.terminate();this.worker=null;this.message.textContent='Výpočet nelze spustit v tomto prohlížeči.';};this.worker.postMessage({});}
  catch(error){this.message.textContent='Výpočet vyžaduje podporu Web Worker v prohlížeči.';}
 }
 loop(t=0){if(!this.active)return;const dt=this.last?Math.min(.05,(t-this.last)/1000):0;this.last=t;if(this.data&&this.running&&!document.hidden){this.time=Math.min(this.data.tMax,this.time+dt*this.data.tMax/18);if(this.time>=this.data.tMax){this.running=false;this.toggle.textContent='Přehrát znovu';}}this.draw();this.frame=requestAnimationFrame(v=>this.loop(v));}
 size(canvas,ctx){const rect=canvas.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height),dpr=Math.min(2,devicePixelRatio||1);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);return [w,h];}
 samples(){const d=this.data,f=this.time/d.tMax*(d.nt-1),lo=Math.floor(f),hi=Math.min(d.nt-1,lo+1),u=f-lo,out=[];for(let i=0;i<d.nx;i++){const re=d.real[lo*d.nx+i]*(1-u)+d.real[hi*d.nx+i]*u,im=d.imag[lo*d.nx+i]*(1-u)+d.imag[hi*d.nx+i]*u;out.push([d.xs[i],3.05*re,3.05*im,re*re+im*im]);}return out;}
 draw(){if(!this.active||!this.data)return;const d=this.data,points=this.samples(),[w,h]=this.size(this.canvas,this.ctx),ctx=this.ctx,scale=Math.min(w/29,h/10)*this.zoom,cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);
  const project=([x,y,z])=>{const px=x*cy-y*sy,depth=x*sy+y*cy,py=z*cp-depth*sp,q=z*sp+depth*cp,perspective=45/(45-q);return [w/2+px*scale*perspective,h/2-py*scale*perspective,q];};
  ctx.fillStyle='#091522';ctx.fillRect(0,0,w,h);
  const stroke=(world,color,width)=>{ctx.beginPath();world.forEach((q,i)=>{const p=project(q);if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1]);});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
  stroke([[-12,0,0],[12,0,0]],'#607d9366',1);
  const faces=[],R=Math.max(2.65,1.45*(3.05*Math.sqrt(d.rhoMax)+.105)),corners=[];for(const x of [0,d.a])for(const y of [-R,R])for(const z of [-R,R])corners.push([x,y,z]);
  for(const ids of [[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]])faces.push({p:ids.map(i=>project(corners[i])),color:'rgba(60,135,225,.12)',edge:'rgba(125,193,255,.35)'});
  const rings=24,stride=Math.max(1,Math.ceil(points.length/Math.max(180,Math.min(420,w*this.zoom*.45))));for(let i=0;i<points.length-1;i+=stride){const a=points[i],b=points[Math.min(i+stride,points.length-1)],ra=Math.hypot(a[1],a[2]),rb=Math.hypot(b[1],b[2]),visibility=Math.pow(Math.max(a[3],b[3])/d.rhoMax,.36);if(visibility<.025)continue;for(let j=0;j<rings;j++){const t=j*2*Math.PI/rings,u=(j+1)*2*Math.PI/rings;faces.push({p:[[a[0],ra*Math.cos(t),ra*Math.sin(t)],[b[0],rb*Math.cos(t),rb*Math.sin(t)],[b[0],rb*Math.cos(u),rb*Math.sin(u)],[a[0],ra*Math.cos(u),ra*Math.sin(u)]].map(project),color:'rgba(45,195,245,'+(.075*visibility)+')'});}}
  faces.forEach(f=>f.z=f.p.reduce((n,p)=>n+p[2],0)/f.p.length);faces.sort((a,b)=>a.z-b.z);for(const face of faces){ctx.beginPath();face.p.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=face.color;ctx.fill();if(face.edge){ctx.strokeStyle=face.edge;ctx.lineWidth=.8;ctx.stroke();}}
  const segments=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],alpha=Math.min(1,Math.pow(Math.max(a[3],b[3])/d.rhoMax,.21));if(alpha>.025)segments.push({a,b,alpha});}
  ctx.lineCap='round';for(const [width,opacity,color]of [[8,.05,'50,180,255'],[3,.9,'148,231,255'],[1,1,'233,252,255']])for(const s of segments)stroke([s.a,s.b],'rgba('+color+','+opacity*s.alpha+')',width);
  ctx.font='14px Segoe UI, sans-serif';ctx.fillStyle='#c5dbea';ctx.fillText('x',...project([12,0,0]).slice(0,2));ctx.fillStyle='#92b1c8';ctx.fillText('Táhni myší pro otočení 3D pohledu',16,h-16);
  this.drawDensity(points);this.slider.value=String(this.time/d.tMax);this.readout.textContent='t = '+this.time.toFixed(2).replace('.',',')+' · E₀/V₀ = 0,694';
 }
 drawDensity(points){const [w,h]=this.size(this.plot,this.g),g=this.g,d=this.data,left=48,right=w-20,top=24,bottom=h-30,X=x=>left+(x+12)/24*(right-left),Y=r=>bottom-r/(d.rhoMax*1.08)*(bottom-top);g.fillStyle='#091522';g.fillRect(0,0,w,h);g.fillStyle='#367fc74d';g.fillRect(X(0),top,Math.max(2,X(d.a)-X(0)),bottom-top);g.strokeStyle='#8198aa';g.lineWidth=1;g.beginPath();g.moveTo(left,top);g.lineTo(left,bottom);g.lineTo(right,bottom);g.stroke();g.font='13px Segoe UI, sans-serif';g.fillStyle='#c5dbea';for(const x of [-12,-6,0,6,12]){g.textAlign='center';g.fillText(String(x),X(x),bottom+18);}g.textAlign='left';g.fillText('ρ(x,t) = |ψ|²',left+8,17);g.fillText('x',right+7,bottom+5);g.fillStyle='#36b9ef26';g.beginPath();g.moveTo(left,bottom);for(const p of points)g.lineTo(X(p[0]),Y(p[3]));g.lineTo(right,bottom);g.closePath();g.fill();g.beginPath();points.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[3])):g.moveTo(X(p[0]),Y(p[3])));g.strokeStyle='#58d5ff';g.lineWidth=2;g.stroke();g.textAlign='right';for(const value of [0,d.rhoMax/2,d.rhoMax])g.fillText(value.toFixed(2).replace('.',','),left-7,Y(value)+4);}
}
root.HiFyzikoWavePreview=WavePreview;
})(window);
