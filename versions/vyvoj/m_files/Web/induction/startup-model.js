(function(root){'use strict';
const target=.8;
function torque(ratio,f){const sf=(1-ratio)*f/50;return sf/(1+4*sf*sf);}
function step(ratio,f,dt){if(f<=0)return 0;const drag=torque(target,f)/target,n=Math.max(1,Math.ceil(dt/.005)),h=dt/n;for(let k=0;k<n;k++){ratio+=h*(torque(ratio,f)-drag*ratio)/.45;ratio=Math.max(0,Math.min(target,ratio));}return ratio;}
const api={target,torque,step};root.AMPrincipStartup=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
