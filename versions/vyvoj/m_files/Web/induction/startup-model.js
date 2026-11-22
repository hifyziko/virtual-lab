(function(root){'use strict';
// Constant brake from the locked-rotor resistance experiment.
const brake=.5*.15/(.5**2+.15**2);
const leakage=1-.9; // 1 - k² in the normalized flux-linkage model.
function response(ratio,f,resistance=.5){
 const slipFrequency=(1-ratio)*f/50;
 const impedance=Math.hypot(resistance,slipFrequency);
 const current=impedance?slipFrequency/impedance:0;
 const phase=Math.atan2(slipFrequency,resistance);
 const fluxAngle=resistance===0&&slipFrequency!==0?null:Math.atan2(leakage*slipFrequency,resistance);
 return {current,phase,fluxAngle,moment:impedance?current*resistance/impedance:0};
}
function torque(ratio,f,resistance=.5){return response(ratio,f,resistance).moment}
function step(ratio,f,dt,resistance=.5){
 if(f<=0)return 0;
 const steps=Math.max(1,Math.ceil(dt/.005));
 for(let k=0;k<steps;k++)ratio=Math.max(0,Math.min(1,ratio+dt/steps*(torque(ratio,f,resistance)-brake)/.9));
 return ratio;
}
const api={brake,leakage,response,torque,step};root.AMPrincipStartup=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
