'use strict';
const assert = require('node:assert/strict');
const {defaults, presets, solve} = require('../versions/vyvoj/m_files/fusion/milniky/model.js');
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
const fs=require('node:fs');
const vm=require('node:vm');
class Element {
  constructor() {
    this.children=[];
    this.attrs={};
    this.style={};
    this.classList={toggle(){}};
  }
  setAttribute(key,value) {this.attrs[key]=value;}
  append(child) {this.children.push(child);}
  getTotalLength() {return 100;}
  getPointAtLength(x) {return {x,y:0};}
}
const roots=Object.fromEntries(['plant','tokamak','rear-flows','front-flows'].map(id=>[id,new Element()]));
const window={};
const context={window,document:{getElementById:id=>roots[id],createDocumentFragment:()=>new Element(),
  createElementNS:()=>new Element()},matchMedia:()=>({matches:true,addEventListener(){}}),cancelAnimationFrame(){}};
vm.runInNewContext(fs.readFileSync(require.resolve('../versions/vyvoj/m_files/fusion/milniky/scene.js'),'utf8'),context);
const grid=roots['front-flows'].children.find(node=>node.attrs['data-flow']==='grid');
const gridView=v=>{
  window.HiFyzikoMilestoneScene.update(v,null,false,String);
  const [, ,line,arrows]=grid.children;
  return {width:line.style.strokeWidth,rotation:arrows.children[0].attrs.transform};
};
assert.match(gridView(at(100)).rotation,/rotate\(180\)$/,'Grid import reverses the rendered arrows');
assert.match(gridView(at(550)).rotation,/rotate\(0\)$/,'Grid export points out of the plant');
assert.equal(gridView(at(0,{plasmaLoss:0})).width,'0px');
console.log('PASS: grid import, export and zero flow in the SVG renderer.');
