(function(root){'use strict';
 const TAU=2*Math.PI,wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
 function create(){return {t:0,field:Math.PI/6,target:Math.PI/6,rotor:Math.PI/6,omega:0,fieldOmega:0,drive:'hand',autoSpeed:.65,type:'salient',excitation:true,excitationLevel:1,damper:false,inertia:1.8,friction:.65,load:0,slips:0,history:[],lastWell:0};}
 function polePairs(s){return s.type==='ipm4'||s.type==='spm4'?2:1;}
 function coefficients(s){return {A:s.type.startsWith('ipm')?1.45:s.excitation?1.45*s.excitationLevel:0,B:s.type.startsWith('ipm')?-.6:s.type==='salient'?.52:0};}
 function values(s){const beta=wrap(polePairs(s)*(s.rotor-s.field)),slip=s.fieldOmega-s.omega,exc=-coefficients(s).A*Math.sin(beta),rel=-coefficients(s).B*Math.sin(2*beta),cage=s.damper&&!s.type.startsWith('ipm')?1.5*slip/(1+(slip/3)**2):0,shaftLoad=s.drive==='auto'?s.load:0,co=coefficients(s),damping=s.friction*((co.A||co.B)?(s.omega-s.fieldOmega)/(1+((s.omega-s.fieldOmega)/.6)**2):s.omega);return {beta,exc,rel,cage,shaftLoad,damping,total:exc+rel+cage,force:(exc+rel+cage)/2,power:(exc+rel+cage)*s.omega,slip,acceleration:(exc+rel+cage-damping-shaftLoad)/s.inertia};}
 function step(s,dt){dt=Math.min(.06,Math.max(0,dt));if(!dt)return s;const advance=s.drive==='auto'?s.autoSpeed*dt:Math.max(-18*dt,Math.min(18*dt,s.target-s.field));s.fieldOmega=advance/dt;const n=Math.ceil(dt/.003),h=dt/n;
 for(let i=0;i<n;i++){const a=values(s);s.omega+=a.acceleration*h;s.rotor+=s.omega*h;s.field+=advance/n;s.t+=h;}
 if(s.drive==='auto')s.target=s.field;
 const period=(s.type.startsWith('ipm')||s.excitation?TAU:Math.PI)/polePairs(s),well=Math.floor((s.field-s.rotor+period/2)/period);if(well!==s.lastWell){s.slips+=Math.abs(well-s.lastWell);s.lastWell=well;}
 const a=values(s);s.history.push({t:s.t,beta:a.beta,omega:s.omega,fieldOmega:s.fieldOmega,total:a.total,exc:a.exc,rel:a.rel,cage:a.cage,force:a.force});while(s.history.length&&s.history[0].t<s.t-12)s.history.shift();return s;}
 function energy(s){const p=polePairs(s),beta=p*(s.field-s.rotor);return .5*s.inertia*s.omega*s.omega-coefficients(s).A/p*Math.cos(beta)-coefficients(s).B/(2*p)*Math.cos(2*beta);}
 function loadLimits(s){const {A,B}=coefficients(s),c=B?(-A+Math.sqrt(A*A+32*B*B))/(8*B):0,capacity=B?(A+2*B*c)*Math.sqrt(1-c*c):A,loss=0;return {capacity,min:-capacity,max:capacity,required:s.load};}
 const api={create,step,values,energy,wrap,loadLimits,coefficients,polePairs};if(typeof module!=='undefined')module.exports=api;root.SyncPrinciple=api;
})(typeof window==='undefined'?globalThis:window);

