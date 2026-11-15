/* Same numerical contour renderer and rotor coordinates as the synchronous machine.
 * Interpolate A_z, never finished SVGs. The field is magnetostatic, without easing
 * or delayed tracking of the mechanical angle. */
(function(root){'use strict';
 const basis=root.ArmatureFields,{N,R}=basis,h=2*R/(N-1),size=N*N;
 const rotorR=365,rotorN=189,rotorH=2*rotorR/(rotorN-1);
 const world=new Float32Array(size),rotor=new Float32Array(rotorN*rotorN);
 const xy=Float32Array.from({length:rotorN},(_,i)=>-rotorR+i*rotorH);
 let lastTheta=NaN,lastSign=0,last='';
 function sample(x,y){
  const u=(x+R)/h,v=(y+R)/h,i=Math.floor(u),j=Math.floor(v);
  if(i<0||j<0||i>=N-1||j>=N-1)return 0;
  const a=u-i,b=v-j,k=j*N+i;
  return (world[k]*(1-a)+world[k+1]*a)*(1-b)+(world[k+N]*(1-a)+world[k+N+1]*a)*b;
 }
 function lines(theta,current){
  if(!current)return '';
  const sign=Math.sign(current),angle=((theta%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
  if(angle===lastTheta&&sign===lastSign)return last;
  const period=((theta%Math.PI)+Math.PI)%Math.PI,index=period/Math.PI*(basis.frames.length-1),lo=Math.floor(index),mix=index-lo;
  const a=basis.frames[lo],b=basis.frames[lo+1];
  for(let k=0;k<size;k++)world[k]=sign*(a[k]+(b[k]-a[k])*mix);
  const c=Math.cos(angle),s=Math.sin(angle);
  for(let j=0;j<rotorN;j++)for(let i=0;i<rotorN;i++)rotor[j*rotorN+i]=sample(c*xy[i]-s*xy[j],s*xy[i]+c*xy[j]);
  const art=root.MagneticContours(rotor,rotorN,rotorR,'#007c69');
  last=art.paths+art.arrows;lastTheta=angle;lastSign=sign;return last;
 }
 root.ArmatureFieldLines=lines;
})(typeof window==='undefined'?globalThis:window);
