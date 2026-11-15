/* One finite circuit and one instantaneous current for BOTH projections. */
(function(root){'use strict';
 const radius=.0004,displayGain=1000,returnX=(130-240)/280;
 let cachedX=NaN,wires=[];
 function geometry(x){
  if(x!==cachedX){const y=root.EnergyExperiments.P.l/2,points=[[x,-y,0],[x,y,0],[returnX,y,0],[returnX,-y,0]];
   wires=points.map((a,i)=>root.BiotSavart.prepare(a,points[(i+1)%4],radius));cachedX=x;
  }return wires;
 }
 function sample(s,p){
  const I=root.EnergyExperiments.electrical(s).I,own=root.BiotSavart.field(geometry(s.x),p,I),external=[0,0,-s.B];
  return {I,own,external,total:own.map((v,i)=>v+external[i]),display:own.map((v,i)=>displayGain*v+external[i])};
 }
 function prepare(s){return {wires:geometry(s.x),I:root.EnergyExperiments.electrical(s).I,B:s.B};}
 function displayAt(f,p,b=[0,0,0]){root.BiotSavart.field(f.wires,p,f.I,b);for(let i=0;i<3;i++)b[i]*=displayGain;b[2]-=f.B;return b;}
 root.EnergyCircuitField={sample,prepare,displayAt,geometry,radius,displayGain,returnX};
})(typeof window==='undefined'?globalThis:window);
