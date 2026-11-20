'use strict';
const assert = require('node:assert/strict');
const {defaults, presets, solve, experiment, heatCapacity, reactivity} = require('../versions/vyvoj/m_files/fusion/milniky/model.js');
const close = (a,b) => assert(Math.abs(a-b)<1e-8, a+' differs from '+b);
const at = (fusion, more) => solve({...defaults, fusion, ...more});
const reference = at(100);
close(reference.etaRec,.198);
close(reference.qBreak,3.682277318640955);
for (const [key, threshold] of [
  ['science',200/1.2],
  ['engineering',200/(.2+1/reference.qBreak)],
  ['ignition',1000]
]) {
  assert.equal(at(threshold-.01)[key],false);
  assert.equal(at(threshold)[key],true);
  assert.equal(at(threshold+.01)[key],true);
}
for (const [preset, reached] of Object.entries({
  low:[],science:['science'],engineering:['science','engineering'],
  ignition:['science','engineering','ignition'],off:[]
})) {
  const result = solve({...defaults,...presets[preset]});
  assert.deepEqual(['science','engineering','ignition'].filter(key=>result[key]),reached);
}
assert.equal(at(0,{plasmaLoss:0}).q,null);
assert.equal(at(1000).q,Infinity);
assert(at(1000).own>0);
assert(at(100,{heatingOff:true}).science && !at(100,{heatingOff:true}).steady);
assert(at(100).net<0 && at(550).net>0);
assert(at(400,{beamEfficiency:75,waveEfficiency:75,grossEfficiency:50,ownShare:0,multiplication:1.3}).engineering);
assert(!at(150).science);
for (const fusion of [0,100,550,1000,1500]) {
  for (const heatingOff of [false,true]) {
    for (const beamShare of [0,30,100]) {
      const v = at(fusion,{heatingOff,beamShare,beamEfficiency:35,waveEfficiency:68});
      close(v.heating,v.beam+v.wave);
      close(v.recirc,v.beamPower+v.wavePower);
      close(v.recirc,v.heating+v.heatingLoss);
      close(v.gross,v.own+v.recirc+v.net);
      close(v.thermal,v.gross+v.conversionLoss);
      close(v.thermal+v.delta,defaults.multiplication*fusion+v.heating);
      if (v.steady) close(v.thermal,defaults.multiplication*fusion+v.heating);
      if (v.heating>0) close(v.heatingEfficiency,v.heating/v.recirc);
    }
  }
}
console.log('PASS: exact milestone boundaries, reversed grid, zero powers, efficiency, recovered heat and transient conservation.');

assert(Math.abs(reactivity(10)/1.136e-22 - 1) < .003);
const controls = {density:.85, confinement:2, externalHeating:95};
const referenceControls = {...controls,confinement:1.65};
let referenceEnergy = 5*heatCapacity(controls.density);
for(let elapsed=0;elapsed<120;elapsed+=.02){
  const state=experiment(referenceControls,referenceEnergy);
  assert(!state.science && !state.engineering && !state.ignition);
  referenceEnergy+=.02*state.delta;
}
const energy = 6*heatCapacity(controls.density);
const referencePlasma = experiment(controls,energy);
assert(referencePlasma.science && !referencePlasma.engineering && !referencePlasma.ignition);
const efficient = experiment({...controls,grossEfficiency:50},energy);
close(efficient.fusion,referencePlasma.fusion);
assert(efficient.net > referencePlasma.net);
const split = experiment({...controls,externalHeating:120,beamEfficiency:60,waveEfficiency:40},energy);
close(split.beam,72);
close(split.wave,48);
close(split.recirc,240);
const cooling = experiment({...controls,heatingOff:true},energy);
const burning = experiment({...controls,density:.96,confinement:3,heatingOff:true},12*heatCapacity(.96));
assert(cooling.delta < 0 && !cooling.ignition);
assert(burning.delta > 0 && burning.ignition);
const idle = experiment({...controls,heatingOff:true},0);
assert(!idle.science && !idle.engineering && !idle.ignition);
for (const state of [referencePlasma,efficient,cooling,burning,idle]) {
  close(state.delta,state.heating+state.alpha-state.plasmaLoss);
  close(state.thermal+state.delta,1.1*state.fusion+state.heating);
  close(state.net,state.gross-state.recirc-state.own);
}
console.log('PASS: Bosch–Hale reactivity, experimental heating cutoff and transient power balances.');
const fs=require('node:fs');
const vm=require('node:vm');
class Element {
  constructor() {
    this.children=[];
    this.attrs={};
    this.style={};
    this.classes=new Set();
    this.classList={toggle:(name,on)=>on ? this.classes.add(name) : this.classes.delete(name)};
  }
  setAttribute(key,value) {this.attrs[key]=value;}
  append(child) {this.children.push(child);}
  getTotalLength() {return 100;}
  getPointAtLength(x) {return {x,y:0};}
}
const roots=Object.fromEntries(['plant','foundation','circuits','reactor','machines','heating','labels','import-guide'].map(id=>[id,new Element()]));
const context={window:{},document:{getElementById:id=>roots[id],createElementNS:()=>new Element()}};
vm.runInNewContext(fs.readFileSync(require.resolve('../versions/vyvoj/m_files/fusion/equilibrium/cad-parameters.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(require.resolve('../versions/vyvoj/m_files/fusion/milniky/scene.js'),'utf8'),context);
const paths=['circuits','machines','heating'].flatMap(id=>roots[id].children.map(el=>el.attrs['data-flow']).filter(Boolean));
assert.equal(paths.length,new Set(paths).size);
for(const id of ['primary-hot','primary-return','steam','exhaust','feedwater','shaft','grid','own-use','recirculation','alpha','ecrh','nbi','induced-current'])assert(paths.includes(id),id);
assert(roots.reactor.children.length>100);
console.log('PASS: CAD cutaway and separately addressable demonstration flows.');


// Exercise the actual UI integrator without opening a browser.
const {createAssessment}=require('../versions/vyvoj/m_files/fusion/milniky/model.js');
const html=fs.readFileSync('versions/vyvoj/m_files/fusion/milniky/index.html','utf8');
const advanceSource=html.match(/  function advance\(now\)\{[\s\S]*?\n  function updateControls/)[0].replace(/\n  function updateControls$/,'');
function trajectory(input, temperature, duration) {
  let deposited=0, recovered=0;
  const context={
    energy:temperature*heatCapacity(input.density),time:0,last:1,lastDraw:0,
    running:true,frame:0,atLimit:false,maxTemperature:100,heatCapacity,
    getInput:()=>input,assess:createAssessment(),render(){},
    requestAnimationFrame(){},setRunning(value){context.running=value;},
    experiment(i,u){
      const s=experiment(i,u);
      // The integrator calls endpoint then midpoint each substep.
      if(context.midpointCall) {
        deposited+=.02*(1.1*s.fusion+s.heating);
        recovered+=.02*s.thermal;
      }
      context.midpointCall=!context.midpointCall;
      return s;
    },midpointCall:false
  };
  vm.createContext(context);
  vm.runInContext(advanceSource,context);
  const start=context.energy;
  for(let k=1;k<=Math.round(duration/.02)&&context.running;k++){
    // Exact 20 ms frames preserve the integrator's original midpoint method.
    context.last=1;
    context.advance(21);
  }
  if(!context.atLimit)assert(Math.abs(context.energy-start-(deposited-recovered))<1e-6);
  return {...context,result:context.assess(input,context.energy,0,context.atLimit)};
}
const refRun=trajectory(referenceControls,5,120);
assert(refRun.result.sustained && !refRun.result.engineering);
const coolingInput={...controls,heatingOff:true};
const coolAssessment=createAssessment()(coolingInput,energy);
assert(coolAssessment.engineeringInstant && !coolAssessment.engineering);
assert.equal(coolAssessment.ignitionTrial,'failed');
assert(!trajectory(coolingInput,6,20).result.engineering);
const efficientInput={...controls,confinement:1.8,grossEfficiency:50,beamEfficiency:85,waveEfficiency:85,ownShare:5};
const stableRun=trajectory(efficientInput,5,120);
assert(stableRun.result.engineering && stableRun.result.sustained);
assert(stableRun.result.q>=stableRun.result.qBreak);
// Finite observation, pause and parameter changes cannot become instant success.
const monitor=createAssessment(), stableEnergy=stableRun.energy;
assert(!monitor(efficientInput,stableEnergy).engineering);
for(let i=0;i<100;i++)assert(!monitor(efficientInput,stableEnergy).engineering);
assert(monitor(efficientInput,stableEnergy,6).engineering);
assert(!monitor({...efficientInput,ownShare:6},stableEnergy).engineering);
const ignitionInput={...controls,density:.96,confinement:3,heatingOff:true};
assert(experiment(ignitionInput,12*heatCapacity(.96)).ignition);
const trial=trajectory(ignitionInput,12,16);
assert.equal(trial.result.ignitionTrial,'supported');
const limitTrial=trajectory(ignitionInput,12,120);
assert.equal(limitTrial.result.ignitionTrial,limitTrial.atLimit?'limit':'supported');
// An exact ignition boundary is still the book's instantaneous condition.
const ignitionEnergy=12*heatCapacity(.96);
const pf=experiment(ignitionInput,ignitionEnergy).fusion;
const boundary={...ignitionInput,confinement:ignitionEnergy/(.2*pf)};
assert(experiment(boundary,ignitionEnergy).ignition);
assert.equal(createAssessment()(boundary,ignitionEnergy).ignitionTrial,'observing');
// Inventory changes only initialize an experiment; pause never unlocks density.
assert(html.includes('if(running)form.elements.density.disabled=true'));
assert(html.includes('form.elements.density.disabled=false'));
assert(!html.includes('energy*='));
const densityHandler=html.match(/if\(event.target.name==='density'\)\{([\s\S]*?)\n    \}/)[1];
const densityContext={event:{target:{value:'1.1'}},form:{elements:{density:{disabled:false},initial:{value:'reference'}}},
  initial:{reference:{temperature:5}},heatCapacity,lastDensity:.85,energy:100};
vm.createContext(densityContext);
vm.runInContext('(function(){'+densityHandler+'})()',densityContext);
close(densityContext.energy,5*heatCapacity(1.1));
densityContext.form.elements.density.disabled=true;
densityContext.event.target.value='0.6';
vm.runInContext('(function(){'+densityHandler+'})()',densityContext);
close(densityContext.energy,5*heatCapacity(1.1));
assert.equal(densityContext.event.target.value,1.1);
console.log('PASS: actual midpoint integrator, integrated energy conservation, sustained engineering, ignition trial, pause and fixed density.');

const unstable=createAssessment()(boundary,ignitionEnergy,100);
assert(unstable.engineeringInstant && unstable.ignition && !unstable.sustained && !unstable.engineering);
const trialMonitor=createAssessment();
assert.equal(trialMonitor(ignitionInput,ignitionEnergy,16).ignitionTrial,'supported');
assert.equal(trialMonitor(ignitionInput,heatCapacity(.96),.02).ignitionTrial,'failed');
assert.equal(trialMonitor({...ignitionInput,heatingOff:false},ignitionEnergy).ignitionTrial,'pending');
assert.equal(trialMonitor(ignitionInput,ignitionEnergy).ignitionTrial,'observing');
assert.equal(trialMonitor(ignitionInput,100*heatCapacity(.96),0,true).ignitionTrial,'limit');
console.log('PASS: unstable equilibrium rejected; ignition success, loss, restart and range limit distinguished.');

// Run the actual presentation logic: mathematical science != didactic success.
function classFlags(){const values=new Set();return {toggle(key,on){on?values.add(key):values.delete(key);},contains:key=>values.has(key)};}
const names=['Vědecké vyrovnání','Inženýrské vyrovnání','Zapálení'];
const indicators=names.map(name=>{const small={textContent:''};return {small,classList:classFlags(),querySelector:selector=>selector==='small'?small:{textContent:name}};});
const feedback={textContent:'',classList:classFlags()};
const presentation={indicators,feedback,milestoneKeys:['science','engineering','ignition'],comparisons:[]};
vm.createContext(presentation);
const milestoneSource=html.slice(html.indexOf('  function showMilestones(state){'),html.indexOf('  function guide(state){'));
vm.runInContext('let previousMilestones=null;'+milestoneSource,presentation);
const display=state=>{const before=JSON.stringify(state);presentation.showMilestones(Object.freeze(state));assert.equal(JSON.stringify(state),before);};
const base={heating:95,science:false,engineering:false,engineeringInstant:false,ignition:false,ignitionTrial:'pending'};
display({...base});
display({...base,science:true});assert(feedback.textContent.includes(names[0]));
display({...base,heating:0,science:true,ignitionTrial:'failed'});
assert.equal(indicators[0].small.textContent,'Nehodnoceno – zkouška bez externího ohřevu');
assert(!indicators[0].classList.contains('active'));assert.equal(feedback.textContent,'');
display({...base,heating:0,science:true,engineering:true,engineeringInstant:true,ignition:true,ignitionTrial:'supported'});
assert(!feedback.textContent.includes(names[0]));
assert.equal(indicators[1].small.textContent,'Ustálené vyrovnání');
assert.equal(indicators[2].small.textContent,'Udrženo po dobu zkoušky');
assert(indicators[1].classList.contains('active') && indicators[2].classList.contains('active'));
display({...base});display({...base,heating:0,science:true,ignitionTrial:'failed'});
assert(!feedback.textContent.includes(names[0]));assert(!indicators[0].classList.contains('active'));
display({...base,heating:0,science:false,ignitionTrial:'failed'});
assert.equal(indicators[0].small.textContent,'Nehodnoceno – zkouška bez externího ohřevu');
display({...base,heating:.001,science:true});assert(indicators[0].classList.contains('active'));
assert(experiment({...controls,externalHeating:0},energy).science,'physical inequality is unchanged with a zero slider');
assert(experiment({...controls,heatingOff:true},energy).science,'physical inequality is unchanged with the cutoff switch');
const cautionSource=html.slice(html.indexOf('  function modelCaution(state){'),html.indexOf('  let energy,time'));
vm.runInContext(cautionSource,presentation);
assert.equal(presentation.modelCaution({temperature:39.99,fusion:2999.99}),'');
for(const state of [{temperature:40,fusion:100},{temperature:10,fusion:3000},{temperature:100,fusion:6000}]){
 const before=JSON.stringify(state);assert(presentation.modelCaution(Object.freeze(state)).includes('bez vyčerpávání paliva'));assert.equal(JSON.stringify(state),before);
}
console.log('PASS: no false science announcement at zero heating, no stale success, positive-heating recovery, unchanged engineering/ignition and informational extreme-state warning.');
