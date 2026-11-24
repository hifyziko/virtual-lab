// Orthographic torus with per-pixel displacement colour and a depth buffer shared by all curves.
const surfaceCache = new WeakMap();

function buildSurface(canvas, order, amplitude, width, height, {yaw,pitch}) {
 const cp=Math.cos(pitch), sp=Math.sin(pitch);
 function point(theta, phi) {
  const phase=order*theta-phi, wave=amplitude*Math.cos(phase), dr=-.19*amplitude*Math.sin(phase);
  const r=.89+.19*wave, ct=Math.cos(theta), st=Math.sin(theta), radial=2.55+r*ct;
  const ca=Math.cos(phi+yaw), sa=Math.sin(phi+yaw);
  // Normal of the radially displaced surface, including both angular derivatives.
  const nr=ct+st*order*dr/r, nz=st-ct*order*dr/r, nt=dr/radial;
  const length=Math.hypot(nr,nz,nt);
  const light=((nr*ca-nt*sa)*-.32+(nr*sa+nt*ca)*(-.48*cp+.60*sp)+nz*(.48*sp+.60*cp))/length;
  return [radial*ca,-(radial*sa*sp+r*st*cp),-radial*sa*cp+r*st*sp,wave,light,-(nr*sa+nt*ca)*cp+nz*sp];
 }
 const u=128,v=80,vertices=[];
 let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
 for(let i=0;i<=u;i++)for(let j=0;j<=v;j++){
  const p=point(TAU*j/v,TAU*i/u);vertices.push(p);
  xmin=Math.min(xmin,p[0]);xmax=Math.max(xmax,p[0]);ymin=Math.min(ymin,p[1]);ymax=Math.max(ymax,p[1]);
 }
 const pad=.025*Math.min(width,height);
 const scale=Math.min((width-2*pad)/(xmax-xmin),(height-2*pad)/(ymax-ymin));
 const ox=(width-scale*(xmin+xmax))/2, oy=(height-scale*(ymin+ymax))/2;
 for(const p of vertices){p[0]=ox+p[0]*scale;p[1]=oy+p[1]*scale;}
 const ctx=canvas.getContext('2d'),image=ctx.createImageData(width,height),rgba=image.data;
 const depth=new Float32Array(width*height).fill(-Infinity);
 function triangle(a,b,c){
  const bx=b[0]-a[0],by=b[1]-a[1],cx=c[0]-a[0],cy=c[1]-a[1],det=bx*cy-cx*by;
  if(Math.abs(det)<1e-8)return;
  const left=Math.max(0,Math.ceil(Math.min(a[0],b[0],c[0])-.5)),right=Math.min(width-1,Math.floor(Math.max(a[0],b[0],c[0])-.5));
  const top=Math.max(0,Math.ceil(Math.min(a[1],b[1],c[1])-.5)),bottom=Math.min(height-1,Math.floor(Math.max(a[1],b[1],c[1])-.5));
  for(let y=top;y<=bottom;y++){
   const dx=left+.5-a[0],dy=y+.5-a[1];let s=(dx*cy-dy*cx)/det,t=(dy*bx-dx*by)/det;
   for(let x=left;x<=right;x++,s+=cy/det,t-=by/det){
    if(s<-.000001||t<-.000001||s+t>1.000001)continue;
    const k=y*width+x,z=a[2]+s*(b[2]-a[2])+t*(c[2]-a[2]);
    if(z<depth[k])continue;
    depth[k]=z;
    const wave=a[3]+s*(b[3]-a[3])+t*(c[3]-a[3]), amount=Math.abs(wave);
    const lighting=.84+(.24-.09*amplitude)*(a[4]+s*(b[4]-a[4])+t*(c[4]-a[4]));
    const i=4*k;
    const neutralTint=1-amplitude;
    rgba[i]=(240-21*neutralTint+amount*(wave>=0?-6:-90))*lighting;
    rgba[i+1]=(245-12*neutralTint+amount*(wave>=0?-61:-58))*lighting;
    rgba[i+2]=(248-4*neutralTint+amount*(wave>=0?-113:-19))*lighting;rgba[i+3]=255;
   }
  }
 }
 for(let i=0;i<u;i++)for(let j=0;j<v;j++){
  const a=i*(v+1)+j,b=a+v+1;
  triangle(vertices[a],vertices[b],vertices[b+1]);triangle(vertices[a],vertices[b+1],vertices[a+1]);
 }
 function project(theta,phi){
  const p=point(theta,phi);return [ox+scale*p[0],oy+scale*p[1],p[2],p[5]];
 }
 function visible(p){
  const x=Math.floor(p[0]),y=Math.floor(p[1]);
  if(p[3]<0||x<0||x>=width||y<0||y>=height)return false;
  // Use the nearest surface on the viewing ray. Allow a subpixel margin at grazing incidence.
  // Four neighbouring rays straddle a subpixel stroke. At a tangent the
  // centre sample alone can alternate between visible and hidden.
  const left=Math.max(0,Math.min(width-2,Math.floor(p[0]-.5)));
  const top=Math.max(0,Math.min(height-2,Math.floor(p[1]-.5)));
  const i=top*width+left;
  const nearEdge=Math.min(depth[i],depth[i+1],depth[i+width],depth[i+width+1]);
  return p[2]>=nearEdge-.009-2/scale;
 }
 return {image,project,visible};
}

function drawSurface(canvas,camera,order,amplitude,fieldQ,turns=2,transparency=0){
 const bounds=canvas.getBoundingClientRect(),density=Math.max(1.5,window.devicePixelRatio||1);
 const width=Math.max(1,Math.round(bounds.width*density)),height=Math.max(1,Math.round(bounds.height*density));
 if(width<3||height<3)return;
 if(canvas.width!==width)canvas.width=width;
 if(canvas.height!==height)canvas.height=height;
 const key=[width,height,order,amplitude,camera.yaw,camera.pitch].join('/');
 let cached=surfaceCache.get(canvas);
 if(cached?.key!==key){cached={key,...buildSurface(canvas,order,amplitude,width,height,camera)};surfaceCache.set(canvas,cached);}
 const ctx=canvas.getContext('2d');
 ctx.putImageData(cached.image,0,0);
 if(fieldQ===undefined)return;
 if(transparency>0){
  ctx.save();ctx.globalCompositeOperation='destination-in';
  ctx.fillStyle='rgba(0,0,0,'+(1-transparency)+')';ctx.fillRect(0,0,width,height);
  ctx.restore();
 }
 const unit=width/470;
 ctx.lineJoin='round';ctx.lineCap='round';
 function curve(angles,turns,color,weight,dash=[],showBack=false){
  ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=weight*unit;ctx.setLineDash(dash.map(x=>x*unit));
  let drawing=false;
  const count=Math.ceil(Math.max(720,width)*turns);
  for(let i=0;i<=count;i++){
   const p=cached.project(...angles(TAU*turns*i/count));
   if(!showBack&&!cached.visible(p)){drawing=false;continue;}
   if(drawing)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1]);
   drawing=true;
  }
  ctx.stroke();
 }
 for(let j=1;j<5;j++)curve(f=>[TAU*j/5+f/fieldQ,f],turns,'#799dc7',1);
 if(amplitude>0)for(let j=0;j<order;j++)curve(f=>[(f+TAU*j)/order,f],1,'#ae612a',1.5,[5,4]);
 const phi=probeAngle(turns);
 curve(t=>[t,phi],1,'#31856e',1.7,[4,3]);
 if(transparency>0){
  ctx.globalAlpha=transparency;
  curve(f=>[f/fieldQ,f],turns,purple,2.7,[],true);
  ctx.globalAlpha=1;
 }
 curve(f=>[f/fieldQ,f],turns,purple,2.7);
 const start=cached.project(0,0);
 if(transparency>0||cached.visible(start)){
  ctx.setLineDash([]);ctx.strokeStyle=purple;ctx.lineWidth=1.5*unit;
  ctx.beginPath();ctx.arc(start[0],start[1],6*unit,0,TAU);ctx.stroke();
 }
 const p=cached.project(phi/fieldQ,phi);
 if(transparency>0||cached.visible(p)){
  ctx.setLineDash([]);ctx.beginPath();ctx.arc(p[0],p[1],4.1*unit,0,TAU);ctx.fillStyle='white';ctx.fill();
  ctx.strokeStyle=purple;ctx.lineWidth=1.8*unit;ctx.stroke();
  ctx.font='italic '+(14*unit)+'px Georgia';ctx.fillStyle=purple;ctx.fillText('P',p[0]+6*unit,p[1]-5*unit);
 }
}
