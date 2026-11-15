const assert=require('node:assert/strict'),M=require('./synchronizing-model.js');
function run(o,dt=.001,time=.5){const s=M.create(o);M.close(s,true);for(let t=0;t<time-1e-10;t+=dt)M.step(s,dt);return s;}
const ideal=run({delta:0,df:0});assert.equal(ideal.peak,0);assert.equal(ideal.df,0);
for(const o of [{voltage:460},{df:.8},{sequence:-1},{delta:Math.PI/3}]){const s=M.create(o);assert.equal(M.close(s),false);assert.equal(M.close(s,true),true);assert.deepEqual(s.i,[0,0,0]);assert.equal(M.close(s,true),false);}
const s=M.create({delta:0,df:.1});M.step(s,.1);assert.ok(Math.abs(s.delta-.02*Math.PI)<1e-10);assert.deepEqual(s.i,[0,0,0]);
const positive=run({delta:Math.PI/6,df:0},.001,.02);assert.ok(M.values(positive).pe>0);assert.ok(positive.df<0,'Generating torque decelerates a leading rotor');assert.ok(Math.abs(positive.i.reduce((a,b)=>a+b,0))<1e-10);
const wrong=run({delta:0,df:0,sequence:-1});assert.ok(wrong.peak>10);assert.ok(wrong.i.every(Number.isFinite));
const voltage=run({delta:0,df:0,voltage:460});assert.ok(voltage.peak>1);assert.ok(voltage.peak<3);
const coarse=run({delta:.4,df:.1},.001),fine=run({delta:.4,df:.1},.00005);assert.ok(Math.abs(coarse.df-fine.df)<1e-6);assert.ok(Math.abs(coarse.i[0]-fine.i[0])<1e-5);
const record=M.simulate(M.create({delta:0,df:0}),.05);assert.equal(record.end,.05);assert.equal(record.samples.length,101);assert.ok(record.samples.every(q=>q.current===0&&q.moment===0));assert.equal(M.at(record,.02).t,.02);assert.equal(M.at(record,100).t,.05);
const wrongRecord=M.simulate(M.create({delta:Math.PI/3,df:0}),.1);assert.equal(wrongRecord.checks[3],false);assert.ok(wrongRecord.samples.some(q=>q.current>1));assert.ok(wrongRecord.samples.some(q=>q.moment<0));assert.equal(M.at(wrongRecord,0).current,0);assert.equal(M.at(wrongRecord,0).moment,0);
const undamped=M.simulate(M.create({delta:Math.PI/3,df:0,damper:false})),damped=M.simulate(M.create({delta:Math.PI/3,df:0,damper:true,damping:20}));
const tailAmplitude=r=>Math.max(...r.samples.filter(q=>q.t>3).map(q=>Math.abs(q.delta)));
assert.ok(tailAmplitude(damped)<tailAmplitude(undamped)*.05,'Damper must remove oscillation energy');
const disabled=M.simulate(M.create({delta:.3,df:0,damper:false,damping:40}),.1),zero=M.simulate(M.create({delta:.3,df:0,damper:true,damping:0}),.1);assert.equal(M.at(disabled,.1).delta,M.at(zero,.1).delta);
console.log('PASS: exact match, interlock API, phase drift, continuous current, torque sign, phase sum, reversed sequence, voltage mismatch, convergence, replay, averaged quantities, damping decay and disabled-damper equivalence.');

const reversed=M.simulate(M.create({delta:0,df:0,sequence:-1}));assert.equal(reversed.end,.12);assert.equal(reversed.endReason,'sequence-window');assert.equal(reversed.lost,false);assert.ok(reversed.samples.every(q=>50+q.df>0));assert.ok(reversed.samples.at(-1).current>1);console.log('PASS: reversed sequence limited to first periods; true rotor speed stays forward.');
