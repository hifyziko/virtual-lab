(function(root){'use strict';
 const ws=2*Math.PI*50,stepTime=1,duration=12;
 function areas(p1,dp){const p2=p1+dp,b1=Math.asin(p1);if(p2>=1)return {p1,p2,b1,noEquilibrium:true,stable:false};const b2=Math.asin(p2),bu=Math.PI-b2,S1=p2*(b2-b1)+Math.cos(b2)-Math.cos(b1),area=b=>Math.cos(b2)-Math.cos(b)-p2*(b-b2),Smax=area(bu),stable=Smax>S1+1e-10;let b3=null;if(stable){let lo=b2,hi=bu;for(let k=0;k<60;k++){const m=(lo+hi)/2;if(area(m)<S1)lo=m;else hi=m;}b3=(lo+hi)/2;}return {p1,p2,b1,b2,bu,S1,Smax,b3,stable,noEquilibrium:false};}
 // Classical swing equation: powers on Pmax base; H uses the same base.
 // v = (omega_r - omega_s)/omega_s, one pole pair. Fixed-step RK4.
 function simulate(p,dt=.001){
  if(!(p.p1>0&&p.p1<1&&p.dp>=0&&p.H>0&&p.D>=0&&dt>0&&dt<=.01))throw Error('Invalid swing parameters');
  const a=areas(p.p1,p.dp),samples=[];let b=a.b1,v=0,lossTime=null,peak=null;
  const derivative=(b,v,pm)=>[ws*v,(pm-Math.sin(b)-p.D*v)/(2*p.H)];
  const energy=(b,v)=>p.H*ws*v*v-a.p2*b-Math.cos(b);
  function sample(t){samples.push({t,b,v,pe:Math.sin(b),pm:t<stepTime?p.p1:a.p2,energy:energy(b,v)});}
  sample(0);const n=Math.ceil(duration/dt),h=duration/n,stride=Math.max(1,Math.round(.02/h));
  for(let i=0;i<n;i++){
   const t=i*h,pm=t+1e-9<stepTime?p.p1:a.p2,oldB=b,oldV=v;
   const k1=derivative(b,v,pm),k2=derivative(b+h*k1[0]/2,v+h*k1[1]/2,pm),k3=derivative(b+h*k2[0]/2,v+h*k2[1]/2,pm),k4=derivative(b+h*k3[0],v+h*k3[1],pm);
   b+=h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6;v+=h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6;
   if(!peak&&t>=stepTime&&oldV>0&&v<=0){const f=oldV/(oldV-v);peak={t:t+h*f,b:oldB+(b-oldB)*f};}
   if(lossTime===null&&v>0&&b>=(a.bu??Math.PI))lossTime=t+h;
   if((i+1)%stride===0||i===n-1)sample(t+h);
   if(lossTime!==null&&b>=a.b1+2*Math.PI){if(samples.at(-1).t<t+h)sample(t+h);break;}
  }
  return {p:{...p},a,samples,lossTime,peak,end:samples.at(-1).t};
 }
 function at(run,t){const s=run.samples;if(t<=0)return s[0];if(t>=run.end)return s.at(-1);let lo=0,hi=s.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(s[m].t>t)hi=m;else lo=m;}const x=s[lo],y=s[hi],f=(t-x.t)/(y.t-x.t),b=x.b+(y.b-x.b)*f,v=x.v+(y.v-x.v)*f;return {t,b,v,pe:Math.sin(b),pm:t<stepTime?run.p.p1:run.a.p2};}
 const api={ws,stepTime,duration,areas,simulate,at};if(typeof module!=='undefined')module.exports=api;root.SyncStability=api;
})(typeof window==='undefined'?globalThis:window);
