(function(root){'use strict';
 const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
 function at(theta,rho,amp=1){
  const abc=[0,2*Math.PI/3,-2*Math.PI/3].map(phase=>amp*Math.cos(theta-phase));
  const alpha=2/3*(abc[0]-.5*abc[1]-.5*abc[2]),beta=(abc[1]-abc[2])/Math.sqrt(3);
  const d=alpha*Math.cos(rho)+beta*Math.sin(rho),q=-alpha*Math.sin(rho)+beta*Math.cos(rho);
  return {theta,rho,amp,abc,alpha,beta,d,q,relative:wrap(theta-rho),norm:Math.hypot(d,q)};
 }
 function create(){return {theta:35*Math.PI/180,rho:0,amp:1,speed:30,ratio:0,playing:false,time:0,step:1,history:[]};}
 function advance(s,dt){dt=Math.min(.1,Math.max(0,dt));if(!s.playing)return s;s.theta+=s.speed*Math.PI/180*dt;s.rho+=s.ratio*s.speed*Math.PI/180*dt;s.time+=dt;const a=at(s.theta,s.rho,s.amp);s.history.push({t:s.time,...a});while(s.history.length&&s.history[0].t<s.time-12)s.history.shift();return s;}
 const api={at,create,advance,wrap};if(typeof module!=='undefined')module.exports=api;root.RotorDQ=api;
})(typeof window==='undefined'?globalThis:window);
