const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const source=fs.readFileSync('versions/vyvoj/m_files/Web/synchronous/pmsm.js','utf8');const a=source.indexOf('const specs='),b=source.indexOf('for(const el of document.querySelectorAll',a),code=source.slice(a,b);
for(const drive of [false,true]){
 const nodes={},get=id=>nodes[id]??={value:'',disabled:false,innerHTML:''};
 const context={drive,$:get,s:{type:'spm',Ld:.003,Lq:.003,R:.08,Imax:100,Udc:300,psi:.18},J:.5,ramp:800,put(){},val:()=>'',fmt:()=>'',stop(){},rebuild(){},configure(){},render(){}};
 vm.runInNewContext(code+';settings();',context);assert.equal(get('parameterControls').innerHTML.includes('id="param-J"'),drive);assert.equal(get('param-Lq').disabled,true);
 context.s.type='ipm';vm.runInNewContext('settings();',context);assert.equal(get('param-Lq').disabled,false);
 if(drive){get('param-J').value='.2';vm.runInNewContext("$('param-J').oninput();",context);assert.equal(context.J,.2);}
}
const M=require('../versions/vyvoj/m_files/Web/synchronous/pmsm-model.js'),s=M.parameters(),c={mode:'maximum',target:9000,load:5,kind:'constant'};
const light=M.createRun(),heavy=M.createRun();M.advance(s,light,.02,{...c,J:.1});M.advance(s,heavy,.02,{...c,J:.5});assert(light.n>heavy.n*4.9);assert(heavy.n>0);
assert.deepEqual(M.point({...s,J:.1},-20,60,1000),M.point({...s,J:.5},-20,60,1000));
console.log('PASS: static PMSM settings omit inertia; drive keeps it and changes acceleration; static phasors independent of inertia; SPM/IPM inductance gating preserved.');
