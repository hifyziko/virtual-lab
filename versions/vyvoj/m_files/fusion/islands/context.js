/* Analytic embedding of the computed local small-island amplitude, not global MHD. */
(function(root){'use strict';
const TAU=2*Math.PI,B='#356ac3';
function line(c,p,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();p.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.stroke();}
function arrow(c,x,y,dx,dy,color){const n=Math.hypot(dx,dy);if(n<1)return;const u=dx/n,v=dy/n,h=Math.min(8,n*.4),s=n-h;c.fillStyle=color;c.beginPath();for(const [a,b]of [[0,-1.3],[s,-1.3],[s,-4],[n,0],[s,4],[s,1.3],[0,1.3]]){const xx=x+a*u-b*v,yy=y+a*v+b*u;if(a===0&&b===-1.3)c.moveTo(xx,yy);else c.lineTo(xx,yy);}c.closePath();c.fill();}
function point(phi,theta,r){return [(2.6+r*Math.cos(theta))*Math.cos(phi),(2.6+r*Math.cos(theta))*Math.sin(phi),r*Math.sin(theta)];}
function boundary(phi,u,sign,amp,a){return point(phi,(phi+Math.PI+u)/2,.65+sign*8*Math.sqrt(Math.abs(amp)/a)*Math.cos(u/2));}
function draw(c,w,h,s,camera,opts){const scale=Math.min(w/8.2,h/6.5)*camera.zoom,cy=Math.cos(camera.yaw),sy=Math.sin(camera.yaw),cp=Math.cos(camera.pitch),sp=Math.sin(camera.pitch);
 const project=p=>{const x=p[0]*cy-p[1]*sy,y=p[0]*sy+p[1]*cy;return [w/2+x*scale,h/2+(y*sp-p[2]*cp)*scale,y*cp+p[2]*sp];};
 const curve=(phi,r,color,width)=>{const p=[];for(let j=0;j<=96;j++)p.push(project(point(phi,TAU*j/96,r)));line(c,p,color,width);};
 if(opts.surfaces){for(let j=0;j<16;j++)curve(TAU*j/16,1,'#d8dfe4',.8);for(const r of [.35,.65,1])for(const theta of [0,Math.PI]){const p=[];for(let j=0;j<=120;j++)p.push(project(point(TAU*j/120,theta,r)));line(c,p,r===.65?'#9fb6d6':'#c4cfd9');}}
 if(opts.island){const faces=[];for(let i=0;i<80;i++)for(let j=0;j<20;j++)for(const sign of [-1,1]){const ph=i/80*2*TAU,u=-Math.PI+j/20*TAU,p=[[ph,u],[ph+2*TAU/80,u],[ph+2*TAU/80,u+TAU/20],[ph,u+TAU/20]].map(([f,v])=>project(boundary(f,v,sign,s.amplitude,s.c.a)));faces.push({p,z:p.reduce((a,b)=>a+b[2],0)/4});}faces.sort((a,b)=>a.z-b.z);for(const f of faces){c.beginPath();f.p.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle='rgba(137,79,163,.12)';c.fill();}}
 // Geometric outlines of the resonant surface and separatrix extrema (not traced field lines).
 for(const u of [-Math.PI,0,Math.PI])for(const sign of u===0?[-1,1]:[1]){const p=[];for(let i=0;i<=320;i++)p.push(project(boundary(i/320*2*TAU,u,sign,s.amplitude,s.c.a)));line(c,p,B,u===0?1.7:1);}
 curve(opts.slice,1,'#805193',2.4);const center=project(point(opts.slice,0,0));const rim=project(point(opts.slice,0,1));line(c,[center,rim],'#805193',1.2);
 return {cut:rim};
}
function section(c,w,h,s,phi,opts){const r=Math.min(w/2-18,h/2-10),cx=w/2,cy=h/2;const xy=(theta,radius)=>[cx+r*radius*Math.cos(theta),cy-r*radius*Math.sin(theta)];
 for(const radius of opts.surfaces?[.35,.65,1]:[1]){c.beginPath();c.arc(cx,cy,r*radius,0,TAU);c.strokeStyle=radius===1?'#aebcc7':'#b9c9df';c.lineWidth=1;c.stroke();}
 c.beginPath();c.arc(cx,cy,r*.65,0,TAU);c.strokeStyle='#80519355';c.lineWidth=r*.12;c.stroke();
 for(let k=0;k<2;k++){const pts=[];for(const sign of [1,-1])for(let j=0;j<=100;j++){const u=-Math.PI+TAU*(sign===1?j:100-j)/100,theta=(phi+Math.PI+u)/2+k*Math.PI,rad=.65+sign*8*Math.sqrt(Math.abs(s.amplitude)/s.c.a)*Math.cos(u/2);pts.push(xy(theta,rad));}if(opts.island){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#8950a34d';c.fill();}line(c,pts,B,1.8);if(opts.marks){const p=xy((phi+Math.PI)/2+k*Math.PI,.65);c.fillStyle='#263d48';c.beginPath();c.arc(...p,2.5,0,TAU);c.fill();c.font='12px Segoe UI';c.fillText('O',p[0]+5,p[1]-4);}}
}
root.IslandContext={draw,section,arrow,point,boundary};
})(typeof window!=='undefined'?window:globalThis);
