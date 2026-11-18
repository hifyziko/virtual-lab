/* Original schematic context. The torus locates the local slab approximation;
 * it is not a toroidal MHD equilibrium or a reconstruction of a discharge. */
(function(root){'use strict';
function line(ctx,points,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
function arrow(ctx,x,y,dx,dy,color){const len=Math.hypot(dx,dy);if(len<1)return;const ux=dx/len,uy=dy/len,head=Math.min(9,len*.4),neck=len-head;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x-uy*1.5,y+ux*1.5);ctx.lineTo(x+ux*neck-uy*1.5,y+uy*neck+ux*1.5);ctx.lineTo(x+ux*neck-uy*4,y+uy*neck+ux*4);ctx.lineTo(x+dx,y+dy);ctx.lineTo(x+ux*neck+uy*4,y+uy*neck-ux*4);ctx.lineTo(x+ux*neck+uy*1.5,y+uy*neck-ux*1.5);ctx.lineTo(x+uy*1.5,y-ux*1.5);ctx.closePath();ctx.fill();}
function draw(ctx,w,h){const cx=w*.37,cy=h*.37,scale=Math.min(w/620,h/440),R=130*scale,a=47*scale;
 const project=(phi,theta,r=a)=>{const x=(R+r*Math.cos(theta))*Math.cos(phi),y=(R+r*Math.cos(theta))*Math.sin(phi),z=r*Math.sin(theta);return [cx+x,cy+.40*y-.91*z];};
 // Transparent flux surfaces with clear nested poloidal sections.
 for(const radius of [a*.35,a*.65,a])for(let j=0;j<12;j++){const phi=j*Math.PI/6,pts=[];for(let i=0;i<=80;i++)pts.push(project(phi,2*Math.PI*i/80,radius));line(ctx,pts,'#b9c9df',.8);}
 for(const theta of [0,Math.PI/2,Math.PI,3*Math.PI/2]){const pts=[];for(let i=0;i<=180;i++)pts.push(project(2*Math.PI*i/180,theta));line(ctx,pts,'#7e9dc7',1);}
 const field=[];for(let i=0;i<=600;i++){const phi=i/600*4*Math.PI;field.push(project(phi,phi/2,a*.65));}line(ctx,field,'#356ac3',2.3);
 // A fixed cross-section is drawn to the right, not mistaken for a new device.
 const sx=w*.80,sy=cy,rad=63*scale;for(const f of [.3,.55,.8,1]){ctx.strokeStyle=f===.8?'#356ac3':'#b9c9df';ctx.lineWidth=f===.8?2.5:1;ctx.beginPath();ctx.arc(sx,sy,rad*f,0,2*Math.PI);ctx.stroke();}
 const src=project(0,0,a*.65);line(ctx,[src,[sx-rad-12,sy]],'#8392a3',1);const box={x:sx-14*scale,y:sy-rad*.8-10*scale,w:28*scale,h:20*scale};ctx.strokeStyle='#805193';ctx.lineWidth=2;ctx.strokeRect(box.x,box.y,box.w,box.h);
 // Magnified local region shown under the section, with opposite helical components.
 const l=w*.18,r=w*.85,t=h*.68,b=h*.89;ctx.fillStyle='#f2f6fc';ctx.fillRect(l,t,r-l,b-t);line(ctx,[[box.x,box.y+box.h],[l,t]],'#9caab8');line(ctx,[[box.x+box.w,box.y+box.h],[r,t]],'#9caab8');
 for(let j=0;j<6;j++){const yy=t+(b-t)*(j+.5)/6;line(ctx,[[l,yy],[r,yy]],'#356ac3',1.2);arrow(ctx,(l+r)/2,yy,j<3?28:-28,0,'#356ac3');}
 ctx.fillStyle='#805193';for(let x=l+12;x<r;x+=26){ctx.beginPath();ctx.arc(x,(t+b)/2,2.3,0,2*Math.PI);ctx.fill();}
}
root.IslandContext={draw,arrow};
})(typeof window==='undefined'?globalThis:window);
