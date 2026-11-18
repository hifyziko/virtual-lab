/* Retarded Lienard–Wiechert fields, c=1, q/(4*pi*epsilon0)=1.
   Charge motion is prescribed, never inferred from a field-line animation. */
(function(root){'use strict';
 const start=.4,duration=1.4,shift=.32,amplitude=.065;
 function smooth(u){if(u<=0)return [0,0,0];if(u>=1)return [1,0,0];return [u**3*(10-15*u+6*u*u),30*u*u*(1-u)**2,60*u*(1-3*u+2*u*u)];}
 function motion(t,c={}){
  if(c.kind==='kick'){const a=smooth((t-start)/duration);return [shift*a[0],shift*a[1]/duration,shift*a[2]/duration**2];}
  const f=c.frequency||1,T=1/f,w=2*Math.PI*f,stop=c.stopTime??(c.burst?start+T:1e9),a=smooth((t-start)/T),b=smooth((t-stop)/T),g=a[0]*(1-b[0]),d=(a[1]*(1-b[0])-a[0]*b[1])/T,dd=(a[2]*(1-b[0])-2*a[1]*b[1]-a[0]*b[2])/T**2,cs=Math.cos(w*(t-start)),sn=Math.sin(w*(t-start));
  return [amplitude*(1+g*(cs-1)),amplitude*(d*(cs-1)-g*w*sn),amplitude*(dd*(cs-1)-2*d*w*sn-g*w*w*cs)];
 }
 function charges(t,c){const m=motion(t,c);return c.kind==='kick'?[{q:1,z:m[0],v:m[1],a:m[2]}]:[{q:1,z:m[0],v:m[1],a:m[2]},{q:-1,z:-m[0],v:-m[1],a:-m[2]}];}
 function retarded(x,z,t,c,sign=1){let tr=t-Math.hypot(x,z-sign*motion(t,c)[0]);for(let i=0;i<12;i++){const m=motion(tr,c),dz=z-sign*m[0],r=Math.hypot(x,dz),k=1-dz/Math.max(r,1e-12)*sign*m[1],d=(tr+r-t)/k;tr-=d;if(Math.abs(d)<1e-11)break;}return tr;}
 function section(x,z,t,c={},part='total'){
  const out=[0,0,0,0,0,0],count=c.kind==='kick'?1:2,now=motion(t,c);
  for(let j=0;j<count;j++){const sign=j?-1:1,q=sign;if(Math.hypot(x,z-sign*now[0])<.022)return out.map(()=>0);const tr=retarded(x,z,t,c,sign),m=motion(tr,c),dz=z-sign*m[0],r=Math.max(Math.hypot(x,dz),1e-10),nx=x/r,nz=dz/r,v=sign*m[1],a=sign*m[2],k=1-nz*v,den=k*k*k,rx=q*nz*nx*a/(den*r),rz=-q*nx*nx*a/(den*r),b=nz*rx-nx*rz;
   const vx=part==='radiation'?0:q*(1-v*v)*nx/(den*r*r),vz=part==='radiation'?0:q*(1-v*v)*(nz-v)/(den*r*r),ex=vx+rx,ez=vz+rz;
   out[0]+=ex;out[1]+=ez;out[2]+=nz*ex-nx*ez;out[3]+=rx;out[4]+=rz;out[5]+=b;
  }return out;
 }
 function field(x,y,z,t,c={},part='total'){const rho=Math.hypot(x,y),s=section(rho,z,t,c,part),nx=rho?x/rho:1,ny=rho?y/rho:0,E=[s[0]*nx,s[0]*ny,s[1]],B=[-s[2]*ny,s[2]*nx,0];return {E,B,S:[-E[2]*B[1],E[2]*B[0],E[0]*B[1]-E[1]*B[0]]};}
 function reference(c){return c.kind==='kick'?1:2*amplitude*(2*Math.PI)**2;}
 const api={motion,charges,retarded,section,field,reference,start,duration,shift,amplitude};if(typeof module==='object')module.exports=api;else root.EMLWModel=api;
})(typeof window==='object'?window:globalThis);
