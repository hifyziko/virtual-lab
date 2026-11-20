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
