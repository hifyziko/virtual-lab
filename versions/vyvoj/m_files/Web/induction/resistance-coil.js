/* Cross-section of one long rectangular turn in a prescribed uniform field.
 * Coordinates and vector potential use the same dimensionless length scale. */
(function(root){
 'use strict';
 const half=75,radius=10,R=215,N=65;
 const wires=[[half,1],[-half,-1]];
 const excitationColor='#007e6c',reactionColor='#8661b1',forceColor='#ad365d';
 // For d >> a, L' ≈ mu0/pi * (log(d/a)+1/4), including internal inductance.
 // With Iref = d B0/L', mu0 Iref/(2 pi B0) = half/(log(d/a)+1/4).
 const coupling=half/(Math.log(2*half/radius)+.25);

 function wirePotential(x,y,c){
  const r2=(x-c)**2+y*y;
  return r2>=radius**2?-.5*Math.log(r2):-Math.log(radius)-(r2-radius**2)/(2*radius**2);
 }

 function potential(x,y,angle,current,source='total'){
  const excitation=source==='reaction'?0:Math.cos(angle)*y-Math.sin(angle)*x;
  const reaction=source==='external'?0:coupling*current*(wirePotential(x,y,half)-wirePotential(x,y,-half));
  return excitation+reaction;
 }

 function fieldAt(x,y,angle,current,source='total'){
  let bx=source==='reaction'?0:Math.cos(angle),by=source==='reaction'?0:Math.sin(angle);
  if(source!=='external'){
   for(const [center,sign] of wires){
    const dx=x-center,k=coupling*current*sign/Math.max(radius**2,dx**2+y**2);
    bx-=k*y;
    by+=k*dx;
   }
  }
  return {x:bx,y:by};
 }

 function response(r,slip,relative){
  const den=Math.hypot(r,slip),phase=Math.atan2(slip,r),amp=den?slip/den:0;
  const i=amp*Math.cos(relative-phase);
  return {amp,phase,i,instantTorque:2*i*Math.cos(relative),meanTorque:den?(r/den)*(slip/den):0};
 }

 function barForces(theta,rotor,current){
  // Average B over each circular cross-section. The bar's own field integrates
  // to zero and the other bar's field is harmonic there, so its center suffices.
  const relative=theta-rotor,cos=Math.cos(rotor),sin=Math.sin(rotor);
  return wires.map(([center,sign])=>{
   const field=fieldAt(center,0,relative,current),i=sign*current;
   const radial=-i*field.y,tangential=i*field.x;
   return {x:radial*cos-tangential*sin,y:radial*sin+tangential*cos};
  });
 }

 const xs=new Float64Array(N*N),ys=new Float64Array(N*N),reaction=new Float64Array(N*N);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const k=j*N+i,x=-R+2*R*i/(N-1),y=-R+2*R*j/(N-1);
  xs[k]=x;ys[k]=y;reaction[k]=potential(x,y,0,1,'reaction');
 }

 const cache=new Map();
 function fieldLines(angle,current,source){
  const key=[source,angle,current].join(':');
  if(cache.has(key))return cache.get(key);
  const cos=source==='reaction'?0:Math.cos(angle),sin=source==='reaction'?0:Math.sin(angle);
  const i=source==='external'?0:current;
  const grid=Float64Array.from(reaction,(a,k)=>cos*ys[k]-sin*xs[k]+i*a);
  const color=source==='reaction'?reactionColor:excitationColor;
  const levels=Array.from({length:17},(_,k)=>(k-8)*(source==='reaction'?8:26));
  const {paths,arrows}=root.MagneticContours(grid,N,R,color,[],levels,{arrowStride:2,traceOpenContoursFromEnds:true,arrowFilter:p=>Math.hypot(p.x,p.y)<R-9});
  const lines='<g class="coil-field-lines">'+paths+arrows+'</g>';
  if(cache.size>=8)cache.clear();
  cache.set(key,lines);
  return lines;
 }

 function arrow(x,y,u,v,color){
  const length=Math.hypot(u,v);
  if(length<.5)return '';
  const nx=u/length,ny=v/length,h=Math.min(12,length*.4),w=Math.min(2.4,length*.1),b=h*.45;
  const ex=x+u,ey=y+v,bx=ex-h*nx,by=ey-h*ny;
  return `<path d="M${x-ny*w} ${y+nx*w}L${bx-ny*w} ${by+nx*w}L${bx-ny*b} ${by+nx*b}L${ex} ${ey}L${bx+ny*b} ${by-nx*b}L${bx+ny*w} ${by-nx*w}L${x+ny*w} ${y-nx*w}Z" fill="${color}"/>`;
 }

 function label(x,y,tex,color){
  return `<foreignObject x="${x-90}" y="${y-13}" width="180" height="27"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;white-space:nowrap;font-size:18px;color:${color}">${root.katex.renderToString(tex,{throwOnError:false})}</div></foreignObject>`;
 }

 function scene({r,slip,theta,rotor=0,id='coil',source='total',showMMF=false}){
  const relative=theta-rotor,q=response(r,slip,relative),angle=rotor*180/Math.PI;
  const lines=fieldLines(relative,q.i,source);
  let h=`<g class="coil-scene" data-current="${q.i}" data-field-display="${source}"><defs><clipPath id="${id}-clip"><circle r="${R}"/></clipPath></defs><circle cx="320" cy="260" r="${R}" fill="#fbfdfc" stroke="#d3e1dc" stroke-dasharray="5 5"/><g transform="translate(320 260) rotate(${-angle})"><g clip-path="url(#${id}-clip)">${lines}</g><path d="M${-half} 0H${half}" stroke="#b8c8c1" stroke-dasharray="4 5"/></g>`;

  if(showMMF){
   const vectors=[
    ['s',theta,155,excitationColor],
    ['r',rotor-Math.PI/2+(q.i<0?Math.PI:0),135*Math.sqrt(Math.abs(q.i)),reactionColor]
   ];
   for(const [tag,t,length,color] of vectors){
    if(length<.5)continue;
    h+=`<g data-coil-mmf="${tag}">`+arrow(320,260,length*Math.cos(t),-length*Math.sin(t),color)
      +label(320+(length+28)*Math.cos(t),260-(length+28)*Math.sin(t),'\\mathbf{F}_{'+tag+'}',color)+'</g>';
   }
  }

  const forces=barForces(relative,0,q.i);
  const rotorCos=Math.cos(rotor),rotorSin=Math.sin(rotor);
  for(let k=0;k<wires.length;k++){
   const [center]=wires[k],x=320+center*rotorCos,y=260-center*rotorSin;
   const {y:tangential}=forces[k];
   const fx=-tangential*rotorSin,fy=tangential*rotorCos,length=Math.abs(tangential);
   if(length<.005)continue;
   const offset=(radius+1)/length;
   const forceArrow=arrow(x+offset*fx,y-offset*fy,106*fx,-106*fy,forceColor);
   if(forceArrow)h+=`<g data-coil-force="${k+1}">${forceArrow}</g>`;
  }
  for(const [center,sign] of wires){
   const x=320+center*Math.cos(rotor),y=260-center*Math.sin(rotor),i=sign*q.i;
   h+=`<circle class="coil-conductor" cx="${x}" cy="${y}" r="${radius}" fill="#fff7e7" stroke="#b47e29" stroke-width="2"/>`;
   if(Math.abs(i)>.003){
    h+=i>0?`<circle cx="${x}" cy="${y}" r="3" fill="${reactionColor}"/>`
     :`<path d="M${x-4} ${y-4}l8 8m-8 0l8 -8" stroke="${reactionColor}" stroke-width="2"/>`;
   }
  }
  const bx=320+196*Math.cos(theta),by=260-196*Math.sin(theta);
  return h+`<circle cx="${bx}" cy="${by}" r="4" fill="${excitationColor}"/>`
   +label(320,496,'i/I_{\\mathrm{ref}}='+q.i.toFixed(2).replace('.', '{,}'),reactionColor)+'</g>';
 }

 const sceneBounds={x:320,y:260,radius:R};
 const api={half,radius,coupling,potential,fieldAt,response,barForces,scene,sceneBounds};
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.AMCoil=api;
})(typeof window==='object'?window:globalThis);
