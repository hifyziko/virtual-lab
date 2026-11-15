/* SI, linear coenergy model and a quasi-static passive resistive circuit. */
(function(root){'use strict';
 const P={J:.08,L0:.3,L2:.12,m:.5,l:.5};
 function torque(theta,I){return -I*I*P.L2*Math.sin(2*theta);}
 function potential(theta,I){return -.5*I*I*P.L2*Math.cos(2*theta);}
 function energy(s){return .5*P.J*s.omega*s.omega+potential(s.theta,s.I);}
 function rotor(){return {theta:Math.PI/4,omega:0,I:1.5,b:.04,heat:0};}
 // Discrete gradient: the finite potential difference gives exactly the work
 // of the conservative torque. Symmetric exact damping half-steps dissipate heat.
 function rotorStep(s,dt){
  if(dt<=0)return s;
  const n=Math.max(1,Math.ceil(dt/.004)),h=dt/n;
  for(let k=0;k<n;k++){
   const damp=()=>{const before=.5*P.J*s.omega*s.omega;s.omega*=Math.exp(-s.b*h/(2*P.J));s.heat+=before-.5*P.J*s.omega*s.omega;};damp();
   const a=s.theta,w=s.omega,C=s.I*s.I*P.L2;
   let d=h*w;
   for(let j=0;j<12;j++){
    const sinc=Math.abs(d)<1e-7?1-d*d/6:Math.sin(d)/d;
    const ds=Math.abs(d)<1e-7?-d/3:(d*Math.cos(d)-Math.sin(d))/(d*d);
    const force=-C*Math.sin(2*a+d)*sinc;
    const derivative=-C*(Math.cos(2*a+d)*sinc+Math.sin(2*a+d)*ds);
    const correction=(d-h*w-h*h*force/(2*P.J))/(1-h*h*derivative/(2*P.J));
    d-=correction;if(Math.abs(correction)<1e-14)break;
   }
   s.theta+=d;s.omega=2*d/h-w;damp();
  }return s;
 }
 function rod(){return {x:1,v:0,B:1.2,R:.15,closed:false,heat:0,stopHeat:0,handForce:0,handWork:0};}
 // Spring/damper grip: the hand is an external force, never a position override.
 // Implicit midpoint preserves the rod's discrete work balance even during fast drags.
 function rodDrag(s,dt,target,handVelocity=0){
  if(!(s.R>0))throw Error('Resistance must be positive');if(dt<=0)return s;
  const K=2,C=1.4,em=s.closed?(s.B*P.l)**2/s.R:0;
  const n=Math.max(1,Math.ceil(dt/.004)),h=dt/n;
  for(let k=0;k<n;k++){
   const old=s.v,A=K*h/4+(C+em)/2;
   const next=(P.m*old/h+K*(target-s.x)+C*handVelocity-A*old)/(P.m/h+A);
   const mid=(old+next)/2,xmid=s.x+h*mid/2,F=K*(target-xmid)+C*(handVelocity-mid);
   s.x+=h*mid;s.v=next;s.handForce=F;s.handWork+=F*mid*h;s.heat+=em*mid*mid*h;
   if(s.x<.15||s.x>1.85){s.x=Math.max(.15,Math.min(1.85,s.x));s.stopHeat+=.5*P.m*s.v*s.v;s.v=0;}
  }return s;
 }
 function electrical(s){if(!(s.R>0))throw Error('Resistance must be positive');const e=s.B*P.l*s.v,I=s.closed?e/s.R:0,F=-s.B*P.l*I;return {e,I,F,power:I*I*s.R,kinetic:.5*P.m*s.v*s.v};}
 function rodStep(s,dt){
  if(!(s.R>0))throw Error("Resistance must be positive");if(dt<=0)return s;
  s.handForce=0;
  const k=s.closed?(s.B*P.l)**2/(P.m*s.R):0,old=s.v;
  const dx=k?old*(-Math.expm1(-k*dt))/k:old*dt;
  let elapsed=dt,hit=false;
  if(s.x+dx<.15||s.x+dx>1.85){const edge=old<0?.15:1.85,travel=edge-s.x;elapsed=k?-Math.log1p(-k*travel/old)/k:travel/old;s.x=edge;hit=true;}else s.x+=dx;
  s.v=old*Math.exp(-k*elapsed);s.heat+=.5*P.m*(old*old-s.v*s.v);
  if(hit){s.stopHeat+=.5*P.m*s.v*s.v;s.v=0;}return s;
 }
 const api={P,torque,potential,energy,rotor,rotorStep,rod,electrical,rodStep,rodDrag};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.EnergyExperiments=api;
})(globalThis);
