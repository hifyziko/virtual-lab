/* SI Biot–Savart primitives shared by coil sampling and finite wire circuits. */
(function(root){'use strict';
 const K=1e-7;
 function differential(a,dl,p,I=1){
  const x=p[0]-a[0],y=p[1]-a[1],z=p[2]-a[2],r2=x*x+y*y+z*z;
  if(!I||!r2)return [0,0,0];const k=K*I/(r2**1.5);
  return [(dl[1]*z-dl[2]*y)*k,(dl[2]*x-dl[0]*z)*k,(dl[0]*y-dl[1]*x)*k];
 }
 function prepare(a,b,radius=0){const d=b.map((v,i)=>v-a[i]),L=Math.hypot(...d);return {a,u:d.map(v=>v/(L||1)),L,radius};}
 // Exact line integral outside the thin wire. A finite-radius core regularizes
 // the interior; it is not a 3D volume-conductor solve.
 function add(w,p,I,b){
  if(!I||!w.L)return b;
  const x=p[0]-w.a[0],y=p[1]-w.a[1],z=p[2]-w.a[2],t=x*w.u[0]+y*w.u[1]+z*w.u[2];
  const qx=x-t*w.u[0],qy=y-t*w.u[1],qz=z-t*w.u[2];
  const rho2=Math.max(qx*qx+qy*qy+qz*qz,w.radius*w.radius,1e-24);
  const factor=K*I/rho2*(t/Math.sqrt(rho2+t*t)-(t-w.L)/Math.sqrt(rho2+(t-w.L)**2));
  b[0]+=(w.u[1]*qz-w.u[2]*qy)*factor;b[1]+=(w.u[2]*qx-w.u[0]*qz)*factor;b[2]+=(w.u[0]*qy-w.u[1]*qx)*factor;return b;
 }
 function segment(w,p,I=1){return add(w,p,I,[0,0,0]);}
 function field(wires,p,I=1,b=[0,0,0]){b[0]=b[1]=b[2]=0;if(!I)return b;for(const w of wires)add(w,p,I,b);return b;}
 const api={differential,prepare,segment,field};if(typeof module==='object'&&module.exports)module.exports=api;else root.BiotSavart=api;
})(typeof window==='undefined'?globalThis:window);
