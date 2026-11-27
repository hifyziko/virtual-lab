'use strict';
const assert=require('node:assert/strict');
const inverter=require('../versions/vyvoj/m_files/stridac/model.js');
const p={mode:'bench',loadType:'rl',frequency:50,switching:1201,duty:.35,depth:.8,
  resistance:10,inductance:.04,emf:8,lag:20};
const near=(a,b,tolerance)=>assert(Math.abs(a-b)<tolerance,`${a} differs from ${b}`);

// At t=0 the triangular carrier is at its valley, halfway through the on pulse.
const decay=p.resistance/(p.inductance*p.switching);
const target=2*inverter.dc/(3*p.resistance);
const low=target*Math.expm1(-decay*p.duty)*Math.exp(-decay*(1-p.duty))/Math.expm1(-decay);
const expected=target+(low-target)*Math.exp(-decay*p.duty/2);
near(inverter.build(p).segments[0].initial,expected,1e-8);

for(const switching of [200,201,1200,1201,3000]){
  for(const mode of ['bench','six','pwm']) {
    for(const loadType of ['r','rl','motor']){
      const model=inverter.build({...p,switching,mode,loadType});
      let previous;
      for(const s of model.segments){
        const t=(s.start+s.end)/2;
        const i=model.current(s,t);
        if(loadType==='r')near(i,s.load[0]/p.resistance,1e-12);
        else {
          if(previous)near(model.current(previous,s.start),s.initial,1e-10);
          const h=Math.min(1e-6,(s.end-s.start)/4);
          const slope=(model.current(s,t+h)-model.current(s,t-h))/(2*h);
          near(p.inductance*p.frequency*slope+p.resistance*i+model.emf(t),s.load[0],1e-5);
        }
        previous=s;
      }
      assert.equal(previous.end,1);
    }
  }
}
console.log('PASS inverter: asynchronous PWM history, R, RL and induced voltage, current continuity.');
for(const upper of [0,1]){
  assert.equal(inverter.conductingDevice(upper,0),'off');
  assert.equal(inverter.conductingDevice(upper,1),upper?'transistor':'diode');
  assert.equal(inverter.conductingDevice(upper,-1),upper?'diode':'transistor');
}
for(const mode of ['bench','six','pwm'])for(const loadType of ['r','rl','motor']){
  const m=inverter.build({...p,mode,loadType});
  for(const s of m.segments)for(const fraction of [.01,.5,.99]){
    const x=s.start+(s.end-s.start)*fraction;
    const i=[0,1,2].map(k=>m.current(s,x,k));
    near(i.reduce((a,b)=>a+b),0,1e-9);
    const dcCurrent=i.reduce((sum,v,k)=>sum+s.bits[k]*v,0);
    near(inverter.dc*dcCurrent,i.reduce((sum,v,k)=>sum+v*s.load[k],0),1e-8);
    if(s.bits.every(bit=>bit===s.bits[0]))near(dcCurrent,0,1e-9);
  }
}
console.log('PASS inverter conduction across all three phases, neutral and DC power balance.');
