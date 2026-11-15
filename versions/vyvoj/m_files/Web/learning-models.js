/* SI units; steady-state teaching models, independent of presentation. */
(function(root){
  const sinc = x => Math.abs(x) < 1e-9 ? 1 : Math.sin(x)/x;
  const skew = (order,slots,pairs,pitches) => sinc(order*Math.PI*pairs*pitches/slots);
  function motor(s,{E20=100,R2=1,X20=4,f=50,p=2}={}){
    const current=s*E20/Math.hypot(R2,s*X20),omegaS=2*Math.PI*f/p;
    const gap=s===0?0:3*current*current*R2/s;
    return {current,gap,copper:s*gap,mechanical:(1-s)*gap,omega:(1-s)*omegaS,torque:gap/omegaS,rotorFrequency:s*f};
  }
  function rod(B,l,v,i){return {emf:B*l*v,force:B*l*i,power:B*l*v*i};}
  const api={sinc,skew,motor,rod};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.LearningModels=api;
})(globalThis);
