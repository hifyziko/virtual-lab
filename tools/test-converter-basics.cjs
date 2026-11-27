'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const dir = path.resolve(__dirname,'../versions/vyvoj/m_files/menice');
const {simulate} = require(path.join(dir,'model.js'));
const katex = require(path.join(dir,'../fusion/particles/vendor/katex.js'));
const lessons = vm.runInNewContext(fs.readFileSync(path.join(dir,'lessons.js'),'utf8')+';ConverterLessons');
const Inverter=require(path.join(dir,'../stridac/model.js'));
const diagram = vm.runInNewContext(fs.readFileSync(path.join(dir,'diagram.js'),'utf8')+';ConverterDiagram',{katex,Inverter});
const near = (a,b,tolerance) => assert.ok(Math.abs(a-b)<tolerance, a+' vs '+b);
for(const [id,lesson] of Object.entries(lessons)){
  const p=Object.fromEntries(lesson.controls.map(c=>[c.key,c.items?c.items[0][0]:c.value]));
  assert.ok(lesson.theory && lesson.task && lesson.assumptions && lesson.source,id);
  if(lesson.formula)katex.renderToString(lesson.formula);
  for(const mode of lesson.controls.find(c=>c.key==='mode')?.items || [[undefined]]){
    const params={...p,mode:mode[0]};
    const result=simulate(id,params);
    assert.ok(result.samples.every(s=>s.values.length===lesson.signals.length && s.values.every(Number.isFinite)),id);
    for(const sample of result.samples.filter((_,i)=>i%61===0)){
      assert.ok(diagram.draw(id,sample.state,params).includes('<path'),id);
    }
  }
}
const mean = (id,p) => simulate(id,p).result;
for(const duty of [10,25,50,90]) {
  near(mean('pwm',{mode:'fixed',carrier:500,duty}),30*duty/100,.12);
  near(mean('pulzni',{mode:'buck',duty}),24*duty/100,.05);
  near(mean('pulzni',{mode:'boost',duty}),24/(1-duty/100),.008*24/(1-duty/100));
}
const ud0=36*Math.sqrt(3)/Math.PI;
for(const angle of [0,45,90,150])near(mean('tyristory',{angle,load:'motor',emf:-24,inductance:100}),ud0*Math.cos(angle*Math.PI/180),.05);
near(mean('diody',{mode:'three'}),2*ud0,.001);
near(mean('diody',{mode:'single'}),48/Math.PI,.001);
near(mean('aktivni',{mode:'active',resistance:10}),52**2/30,.001);
near(mean('pwm',{mode:'fixed',supply:'drive',duty:50,carrier:500}),162.5,.01);
const generating=simulate('kmitocet',{mode:'vf',freq:35,supply:'drive',load:'motor',emf:330});
assert.equal(generating.result,null);
assert.ok(generating.samples.every(s=>s.state[0]===-1&&s.state[5]===-1));
near(mean('stridavy',{angle:90,load:'r'}),12,.03);
const params={mode:'fixed',load:'motor',duty:30,carrier:500,resistance:10,inductance:25,emf:14};
const pwm=simulate('pwm',params);
const toothCount=m=>m.samples.slice(1).filter((sample,n)=>sample.values[1]<m.samples[n].values[1]-.5).length;
for(const mode of ['fixed','sine']){
  for(const carrier of [250,500,1000]){
    const wave=simulate('pwm',{...params,mode,carrier});
    near(wave.period,.02,1e-8);
    assert.equal(toothCount(wave),carrier*.02);
  }
}
for(const duty of [10,90]){
  const wave=simulate('pwm',{...params,carrier:2000,duty});
  const gates=wave.samples.map(s=>s.values[2]);
  assert.ok(gates.length-1>=40*256);
  assert.equal(gates.slice(1).filter((v,i)=>v>gates[i]).length,40);
  near(wave.result,30*duty/100,30/256);
}
for(const carrier of [2010,20000,99500,100000]){
  for(const mode of ['fixed','sine']){
    const wave=simulate('pwm',{...params,carrier,mode,duty:10,depth:100});
    const samples=wave.samples;
    assert.equal(samples[0].time,0);
    assert.equal(samples.at(-1).time,.02);
    assert.ok(samples.every((s,i)=>s.values.every(Number.isFinite)&&(!i||s.time>=samples[i-1].time)));
    let area=0;
    for(let i=1;i<samples.length;i++)area+=samples[i-1].values[3]*(samples[i].time-samples[i-1].time);
    near(area/.02,wave.result,1e-8);
    if(mode==='fixed'&&carrier===100000){
      near(wave.result,3,1e-8);
      near(samples.find(s=>s.values[2]===0).time,1e-6,1e-13);
      assert.equal(samples.filter((s,i)=>i&&s.values[2]>samples[i-1].values[2]).length,2000);
    }
  }
}
const averageCurrent=series=>series.samples.slice(0,-1).reduce((n,s)=>n+s.values[4],0)/(series.samples.length-1);
near(averageCurrent(pwm),(9-14)/10,.008);
near(averageCurrent(simulate('pwm',{...params,resistance:20})),(9-14)/20,.008);
const ripple=m=>Math.max(...m.samples.map(s=>s.values[4]))-Math.min(...m.samples.map(s=>s.values[4]));
assert.ok(ripple(simulate('pwm',{...params,inductance:75}))<ripple(pwm));
assert.ok(pwm.samples.some(s=>s.state[1]<0));
const compared=simulate('pwm',{...params,supply:'drive',carrier:500,duty:50,emf:100}).samples.slice(0,-1);
for(const [channel,expected] of [[3,162.5],[4,6.25],[5,100],[6,16.25]]){
  const average=compared.reduce((sum,s)=>sum+s.values[channel],0)/compared.length;
  near(average,expected,.001);
}
for(const id of ['diody','tyristory']){
  const m=simulate(id,{mode:'star',load:'motor',emf:24});
  assert.ok(m.samples.every(s=>s.values[4]===0&&s.state[0]===-1));
}
console.log('PASS converter lessons, circuit states, PWM, rectifier mean voltages, AC RMS and input power.');
