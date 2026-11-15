const assert=require('assert/strict'),M=require('./rotor-dq-model.js'),eps=1e-11;
for(let k=0;k<300;k++){const theta=k*.317,rho=k*.073,amp=(k%17)/10,a=M.at(theta,rho,amp);
 assert(Math.abs(a.abc.reduce((s,v)=>s+v,0))<eps);
 assert(Math.abs(a.norm-amp)<eps);
 assert(Math.abs(a.d-amp*Math.cos(theta-rho))<eps);assert(Math.abs(a.q-amp*Math.sin(theta-rho))<eps);
 const alpha=a.d*Math.cos(rho)-a.q*Math.sin(rho),beta=a.d*Math.sin(rho)+a.q*Math.cos(rho);
 for(let j=0;j<3;j++){const phase=[0,2*Math.PI/3,-2*Math.PI/3][j];assert(Math.abs(alpha*Math.cos(phase)+beta*Math.sin(phase)-a.abc[j])<eps);}
 assert(Math.abs(a.abc.reduce((sum,v)=>sum+v*v,0)*2/3-(a.d*a.d+a.q*a.q))<eps);
}
const s=M.create();Object.assign(s,{playing:true,ratio:1,rho:.1});const first=M.at(s.theta,s.rho);for(let k=0;k<600;k++)M.advance(s,.02);const last=M.at(s.theta,s.rho);assert(Math.abs(first.d-last.d)<eps);assert(Math.abs(first.q-last.q)<eps);assert(s.history.length<=602);assert(s.history.every(row=>row.t>=s.time-12));
const fixed=M.at(.8,.1),rotated=M.at(.8,1.1);assert.deepEqual(fixed.abc,rotated.abc);assert(Math.abs(fixed.d-rotated.d)>.1);
assert.equal(M.at(2,1,0).norm,0);
console.log('PASS abc↔dq reconstruction, amplitude normalization, geometric projections, balanced currents, rotation invariance, stationary currents in the synchronous frame, history window');
