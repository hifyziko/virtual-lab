/* Reaction-module palette and continuous, two-tone streamlines.
 * Raster interpolation affects display only; particle forces stay in model.js. */
(function install(root){'use strict';
const palette=[[255,242,209],[246,213,134],[236,178,74],[219,137,46],[196,87,50],[161,44,40]];
function vector(x,y,sources,soft){let ex=0,ey=0;for(const s of sources){const dx=x-s.x,dy=y-s.y,r2=dx*dx+dy*dy;const q=s.q;if(Math.abs(q)<1e-8)continue;const f=q/(r2+soft*soft)**1.5;ex+=dx*f;ey+=dy*f;}return [ex,ey];}
function step(F,x,y,sign=1,maxStep=3){const f=F(x,y);if(!f)return null;for(let h=maxStep;h>=.046875;h/=2){const mid=F(x+sign*h*.5*f[0],y+sign*h*.5*f[1]);if(!mid)continue;const nx=x+sign*h*mid[0],ny=y+sign*h*mid[1],end=F(nx,ny);if(!end||f[0]*mid[0]+f[1]*mid[1]<.985||mid[0]*end[0]+mid[1]*end[1]<.985)continue;return [nx,ny,Math.atan2(end[1],end[0])];}return null;}
class FieldView{
 constructor(){this.raster=document.createElement('canvas');this.ctx=this.raster.getContext('2d');this.key='';this.layer=document.createElement('canvas');this.layerContext=this.layer.getContext('2d');}
 draw(ctx,W,H,sources,scale,moving){
  sources=sources.filter(s=>s.q);
  const nx=1,ny=1,key=[W,H,scale,...sources.flatMap(s=>[s.x,s.y,s.q])].join('/');
  if(key!==this.key){this.key=key;this.raster.width=nx;this.raster.height=ny;this.nx=nx;this.ny=ny;this.W=W;this.H=H;this.sources=sources;this.soft=scale*.14;this.grid=new Float32Array(2);this.ctx.putImageData(this.ctx.createImageData(1,1),0,0);
   this.lines=[];const F=(x,y)=>this.direction(x,y),charged=sources.filter(s=>s.q),positive=charged.some(s=>s.q>0),budget=Math.max(2,Math.min(8,Math.floor(48/Math.max(1,charged.filter(s=>s.q>0).length))));
   // Source-seeded integration as in reactions; no raster-derived directions.
   for(const source of sources){const neutral=!source.q;if(neutral&&!source.cloud)continue;if(source.q<0&&positive)continue;const sign=source.q<0?-1:1,count=neutral?(sources.length>4?4:12):budget,start=neutral?Math.max(2,source.cloud*.28):Math.max(3,this.soft*.55);
    for(let j=0;j<count;j++){const angle=j*2*Math.PI/count;let x=source.x+start*Math.cos(angle),y=source.y+start*Math.sin(angle);const points=[[x,y]];
     for(let k=0;k<400;k++){const next=step(F,x,y,sign,3);if(!next)break;[x,y]=next;if(x<0||y<0||x>W||y>H)break;if(neutral&&Math.hypot(x-source.x,y-source.y)>source.cloud*1.8)break;if(charged.some(other=>other!==source&&Math.hypot(x-other.x,y-other.y)<start))break;points.push([x,y]);}
     if(points.length>3)this.lines.push(sign<0?points.reverse():points);
    }
   }
  }
  this.render(ctx,W,H);
 }
 render(target,W,H){
  const ratio=target.getTransform?.()?.a||1,w=Math.round(W*ratio),h=Math.round(H*ratio);if(this.layer.width!==w||this.layer.height!==h){this.layer.width=w;this.layer.height=h;}const ctx=this.layerContext;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,W,H);
  // Charge markers follow current positions every frame, independently of worker results.
  const scale=this.currentScale||this.soft/.14||1;
  for(const source of this.currentSources||this.sources||[]){if(!source.q)continue;const radius=scale*1.25,rgb=source.q<0?'18,107,195':'235,48,38',glow=ctx.createRadialGradient(source.x,source.y,0,source.x,source.y,radius);glow.addColorStop(0,'rgba('+rgb+',.28)');glow.addColorStop(.25,'rgba('+rgb+',.17)');glow.addColorStop(.6,'rgba('+rgb+',.055)');glow.addColorStop(1,'rgba('+rgb+',0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(source.x,source.y,radius,0,2*Math.PI);ctx.fill();}

  if(this.showLines!==false){ctx.save();ctx.globalAlpha=.58;ctx.lineCap=ctx.lineJoin='round';ctx.beginPath();for(const points of this.lines)points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle='rgba(23,39,49,.86)';ctx.lineWidth=1.6;ctx.stroke();ctx.strokeStyle='rgba(255,249,233,.98)';ctx.lineWidth=.65;ctx.stroke();
  // Direction markers on continuous field lines, as in the reaction module.
  for(const points of this.lines)for(let i=45;i<points.length-2;i+=170){const [x,y]=points[i],f=this.direction(x,y);if(!f)continue;const [dx,dy]=f;ctx.beginPath();ctx.moveTo(x+3*dx,y+3*dy);ctx.lineTo(x-3*dx-1.8*dy,y-3*dy+1.8*dx);ctx.lineTo(x-3*dx+2.5*dy,y-3*dy-2.5*dx);ctx.closePath();ctx.fillStyle='#fff9e9';ctx.fill();ctx.strokeStyle='rgba(23,39,49,.9)';ctx.lineWidth=.8;ctx.stroke();}ctx.restore();}
  ctx.save();ctx.globalCompositeOperation='destination-in';
  const bounds=this.bounds||{x:0,y:0,width:W,height:H},left=bounds.x,top=bounds.y,right=left+bounds.width,bottom=top+bounds.height;
  // Full opacity throughout the playground. Soft transition only outside it.
  for(const [start,end,size,horizontal]of [[left,right,bounds.width,true],[top,bottom,bounds.height,false]]){const pad=size*.16,fade=ctx.createLinearGradient(horizontal?start-pad:0,horizontal?0:start-pad,horizontal?end+pad:0,horizontal?0:end+pad),inner=pad/(size+2*pad);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(inner*.5,'rgba(0,0,0,.5)');fade.addColorStop(inner,'rgba(0,0,0,1)');fade.addColorStop(1-inner,'rgba(0,0,0,1)');fade.addColorStop(1-inner*.5,'rgba(0,0,0,.5)');fade.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=fade;ctx.fillRect(0,0,W,H);}ctx.restore();target.drawImage(this.layer,0,0,W,H);
 }
 direction(x,y){const v=vector(x,y,this.sources||[],this.soft||1),n=Math.hypot(...v);return n>1e-15?v.map(a=>a/n):null;}
}
class AsyncFieldView{
 constructor(){this.base=new FieldView();this.worker=null;this.busy=false;this.sent='';this.readyView='';this.view='';
  try{if(typeof Worker==='function'){const workerBody=function(){const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(image){this.image=image;}};globalThis.document={createElement:()=>({getContext:()=>context})};const renderer=new HiFyzikoPlasmaField.SyncFieldView();renderer.render=()=>{};onmessage=({data:d})=>{renderer.key='';renderer.draw(null,d.W,d.H,d.sources,d.scale,d.moving);const pixels=context.image.data,grid=renderer.grid;postMessage({W:d.W,H:d.H,view:d.view,nx:renderer.nx,ny:renderer.ny,sources:d.sources,soft:renderer.soft,pixels,grid,lines:renderer.lines},[pixels.buffer,grid.buffer]);};};const url=URL.createObjectURL(new Blob(['('+install.toString()+')(globalThis);('+workerBody.toString()+')();'],{type:'text/javascript'}));this.worker=new Worker(url);URL.revokeObjectURL(url);this.worker.onmessage=({data:d})=>{this.busy=false;if(d.view!==this.view)return;Object.assign(this.base,{W:d.W,H:d.H,nx:d.nx,ny:d.ny,grid:d.grid,sources:d.sources,soft:d.soft,lines:d.lines});this.base.raster.width=d.nx;this.base.raster.height=d.ny;this.base.ctx.putImageData(new ImageData(d.pixels,d.nx,d.ny),0,0);this.readyView=d.view;};this.worker.onerror=()=>{this.worker.terminate();this.worker=null;this.busy=false;this.base.key='';};}}
  catch(e){this.worker=null;}
 }
 draw(ctx,W,H,sources,scale,moving,view='',bounds,showLines=true){this.base.bounds=bounds;this.base.showLines=showLines;this.base.currentSources=sources.filter(s=>s.q);this.base.currentScale=scale;sources=sources.filter(s=>s.q);if(!showLines){this.base.render(ctx,W,H);return;}if(!this.worker){this.base.draw(ctx,W,H,sources,scale,moving);return;}this.view=[W,H,scale,view].join('/');const key=[this.view,moving,...sources.flatMap(s=>[s.x,s.y,s.q,s.cloud||0])].join('/');if(!this.busy&&key!==this.sent){this.busy=true;this.sent=key;this.worker.postMessage({W,H,sources,scale,moving,view:this.view});}if(this.readyView===this.view)this.base.render(ctx,W,H);else{const old=this.base.showLines;this.base.showLines=false;this.base.render(ctx,W,H);this.base.showLines=old;}}
 dispose(){this.worker?.terminate();this.worker=null;}
}
root.HiFyzikoPlasmaField={FieldView:AsyncFieldView,SyncFieldView:FieldView,vector,step,palette};if(typeof module!=='undefined')module.exports=root.HiFyzikoPlasmaField;
})(typeof window==='undefined'?globalThis:window);
