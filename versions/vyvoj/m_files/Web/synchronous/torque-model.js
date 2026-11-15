(function(root){
const M=typeof module==='object'?require('./schema-model.js'):root.SyncSchema;
function point(s,axis='outer'){
 const a=M.solve(s),r=M.solve({...s,e:0}),u=Math.hypot(...a.Ui),b=a.internalBeta*Math.PI/180,ad=a.xd-a.xsigma,aq=a.xq-a.xsigma;
 const innerExcitation=-u*a.e/ad*Math.sin(b),innerReluctance=-u*u/2*(1/aq-1/ad)*Math.sin(2*b);
 return {...a,total:a.Pem,reluctance:axis==='inner'?innerReluctance:r.Pem,excitation:axis==='inner'?innerExcitation:a.Pem-r.Pem,innerDefined:u>1e-7,axis};
}
function curve(s,axis='outer'){return Array.from({length:721},(_,i)=>point({...s,beta:-180+i*.5},axis));}
// Local static stiffness is differentiated with respect to the EXTERNAL angle
// in radians, even when the chart is reparameterized by the internal angle.
function stability(s,samples=curve(s)){
const stiffness=M.slope(s),turningPoints=[];
for(let i=1;i<samples.length-1;i++){
const before=samples[i].total-samples[i-1].total,after=samples[i+1].total-samples[i].total;
if(before*after>0||Math.abs(before)+Math.abs(after)<1e-10)continue;
let lo=samples[i-1].beta,hi=samples[i+1].beta,flo=M.slope({...s,beta:lo});
if(flo*M.slope({...s,beta:hi})>0)continue;
for(let k=0;k<30;k++){const mid=(lo+hi)/2,f=M.slope({...s,beta:mid});if(flo*f<=0)hi=mid;else{lo=mid;flo=f;}}
const beta=(lo+hi)/2;
if(!turningPoints.some(p=>Math.abs(p.beta-beta)<.01))turningPoints.push(point({...s,beta}));
}
return {stiffness,condition:Math.abs(stiffness)<1e-6?'neutral':stiffness>0?'restoring':'diverging',turningPoints};
}
const api={point,curve,stability};if(typeof module==='object')module.exports=api;else root.SyncTorque=api;
})(typeof window==='object'?window:globalThis);
