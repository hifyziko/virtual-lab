// Independent test electrons, B along +z. Length v0/omega, time 1/omega.
(function(root){
  const charge=1.602176634e-19, mass=9.1093837e-31, k=8.98755179e9;
  const omega=charge*5/mass, v0=2.5e5, length=v0/omega;
  const coupling=k*charge**2/(mass*length*v0**2);
  const dt=.008, steps=2500, ps=1e12/omega;
  function derivative([x,y,z,vx,vy,vz]){
    const c=-coupling/Math.hypot(x,y,z)**3;
    return [vx,vy,vz,c*x-vy,c*y+vx,c*z];
  }
  function advance(s,d,h){return s.map((v,i)=>v+h*d[i]);}
  function orbit(radius,offset,phase,pitch,pass,h=dt,count=steps){
    const angle=phase-pass;
    let s=[radius*Math.cos(angle)-(radius+offset)*Math.cos(phase),
      radius*Math.sin(angle)-(radius+offset)*Math.sin(phase),-pitch*pass,
      -radius*Math.sin(angle),radius*Math.cos(angle),pitch];
    const samples=[];
    for(let i=0;i<=count;i++){
      const r=Math.hypot(s[0],s[1],s[2]);
      const acceleration=k*charge**2/(mass*(length*r)**2);
      const power=2*k*charge**2*acceleration**2/(3*299792458**3);
      samples.push({x:s[0],y:s[1],z:s[2],r,power});
      const a=derivative(s),b=derivative(advance(s,a,h/2)),c=derivative(advance(s,b,h/2)),d=derivative(advance(s,c,h));
      s=s.map((v,j)=>v+h*(a[j]+2*b[j]+2*c[j]+d[j])/6);
    }
    return samples;
  }
  const cases=[[.72,.15,.4,.055,10]];
  // Uniform-B helix with exactly the initial position and velocity of orbit().
  function reference(radius,offset,phase,pitch,pass){
    return Array.from({length:steps+1},(_,i)=>{
      const t=i*dt-pass;
      return {x:radius*Math.cos(phase+t)-(radius+offset)*Math.cos(phase),
        y:radius*Math.sin(phase+t)-(radius+offset)*Math.sin(phase),z:pitch*t};
    });
  }
  const api={dt,steps,ps,v0,length,orbit,reference,cases};
  if(typeof module!=='undefined')module.exports=api;else root.MagnetizedEncounter=api;
})(globalThis);
