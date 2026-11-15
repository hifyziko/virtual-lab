(function(root){'use strict';const FN=50,NN=1500,SLIP=4,R1=.35,R2=.3,L1=.0032,L2=.0051,LM=.081;
const mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],div=(a,b)=>{const d=b[0]**2+b[1]**2;return[(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]};
function circuit(f){const w=2*Math.PI*f,u=400/Math.sqrt(3)*Math.min(1,f/FN),z1=[R1,w*L1],zm=[0,w*LM],sum=[R1,w*(L1+LM)],zth=div(mul(z1,zm),sum),eth=div([0,u*w*LM],sum),xeq=zth[1]+w*L2,zmag=Math.hypot(zth[0],xeq),ws=2*Math.PI*(30*f)/60;return{f,u,rth:zth[0],xeq,zmag,e2:eth[0]**2+eth[1]**2,ws,dfk:f*R2/zmag}}
const base=circuit(FN),normalizer=(3*base.e2/(2*base.ws*(base.zmag+base.rth)))/2;
function envelope(f){const c=circuit(f),x=f/FN,flux=Math.min(1,1/x),mk=3*c.e2/(2*c.ws*(c.zmag+c.rth))/normalizer,thermal=1/Math.max(1,x),limit=Math.min(thermal,.8*mk);return{x,flux,mk,limit,u:Math.min(x,1),power:limit*x,region:x<=1?0:thermal<=.8*mk?1:2}}
function point(f,n){const c=circuit(f),e=envelope(f),df=f-n/30,s=df/f,q=df/c.dfk,den=(R2+s*c.rth)**2+(s*c.xeq)**2,m=3*c.e2*R2*s/(c.ws*den)/normalizer,f2=Math.abs(df),x2=2*Math.PI*f2*L2;return{...e,n,ns:30*f,df,f2,q,m,stable:Math.abs(q)<=1,s,powerMechanical:m*n/NN,r2:R2,x2,z2:Math.hypot(R2,x2),phase:Math.atan2(x2,R2),dfk:c.dfk}}
let fkLo=FN,fkHi=400;for(let k=0;k<45;k++){const mid=(fkLo+fkHi)/2;if(envelope(mid).region<2)fkLo=mid;else fkHi=mid}const FK=(fkLo+fkHi)/2;
function equilibrium(f,load){const ns=30*f;if(load===0)return ns;let lo=Math.max(0,ns-30*circuit(f).dfk),hi=ns;if(point(f,lo).m<load)return null;for(let i=0;i<45;i++){const mid=(lo+hi)/2;if(point(f,mid).m>load)lo=mid;else hi=mid}return(lo+hi)/2}
const api={FN,NN,SLIP,FK,envelope,point,circuit,equilibrium};if(typeof module==='object')module.exports=api;root.Traction=api;
})(typeof window==='object'?window:globalThis);
