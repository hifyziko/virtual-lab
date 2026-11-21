'use strict';

const assert=require('node:assert/strict');
global.window={katex:{renderToString:()=>''}};
require('../versions/vyvoj/m_files/Web/magnetic-field/contours.js');
const coil=require('../versions/vyvoj/m_files/Web/induction/resistance-coil.js');
const near=(actual,expected,tolerance=1e-10)=>assert(Math.abs(actual-expected)<tolerance,`${actual} ≠ ${expected}`);

for(const resistance of [0,.1,.5,1,5])for(const slip of [0,.1,.6,1]){
 let mean=0;
 for(let k=0;k<256;k++){
  const rotor=.6,theta=rotor+2*Math.PI*k/256;
  const q=coil.response(resistance,slip,theta-rotor);
  const [positive,negative]=coil.barForces(theta,rotor,q.i);
  near(positive.x+negative.x,0);
  near(positive.y+negative.y,0);
  const torque=(positive.y-negative.y)*Math.cos(rotor)-(positive.x-negative.x)*Math.sin(rotor);
  near(torque,q.instantTorque);
  mean+=torque/256;
 }
 near(mean,coil.response(resistance,slip,0).meanTorque);
}

near(coil.response(0,1,0).i,0);
near(coil.response(0,1,Math.PI/2).i,1);
near(coil.response(.5,0,2).i,0);
near(coil.response(0,0,2).i,0);

const [outerBar,innerBar]=coil.barForces(0,0,1);
assert(outerBar.x>0 && innerBar.x<0,'Opposite currents repel radially');
near(outerBar.y,1);
near(innerBar.y,-1);

for(const [x,y] of [[0,0],[40,30],[110,-45],[77,3],[-71,-2]]){
 const angle=.7,current=.6,epsilon=1e-4;
 const potential=(x,y)=>coil.potential(x,y,angle,current);
 const total=coil.fieldAt(x,y,angle,current);
 const excitation=coil.fieldAt(x,y,angle,current,'external');
 const reaction=coil.fieldAt(x,y,angle,current,'reaction');
 near(total.x,(potential(x,y+epsilon)-potential(x,y-epsilon))/(2*epsilon),1e-7);
 near(total.y,-(potential(x+epsilon,y)-potential(x-epsilon,y))/(2*epsilon),1e-7);
 near(total.x,excitation.x+reaction.x);
 near(total.y,excitation.y+reaction.y);
}

for(const sign of [-1,1]){
 const boundary=sign*coil.half+coil.radius;
 const inside=coil.fieldAt(boundary-1e-6,0,0,1,'reaction');
 const outside=coil.fieldAt(boundary+1e-6,0,0,1,'reaction');
 near(inside.y,outside.y,1e-6);
}

const fieldNear=coil.fieldAt(10000,0,0,1,'reaction').y;
const fieldFar=coil.fieldAt(20000,0,0,1,'reaction').y;
near(fieldNear/fieldFar,4,.001);

for(const r of [0,.5]){
 for(let degrees=0;degrees<=360;degrees+=5){
  const scene=coil.scene({r,slip:1,theta:degrees*Math.PI/180});
  const lines=scene.match(/<g class="coil-field-lines"><g[^>]*>(.*?)<\/g>/)[1];
  const visiblePaths=[...lines.matchAll(/<path d="([^"]+)"/g)].filter(([,path])=>
   [...path.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].some(([,x,y])=>Math.hypot(+x,+y)<207)
  );
  assert(visiblePaths.length>=15,'Resultant flux contours dropped out at '+degrees+'°');
  assert(!scene.includes('data-coil-mmf'),'Magnetomotive forces are hidden by default');
 }
}
const horizontal=coil.scene({r:0,slip:1,theta:0});
assert.match(horizontal,/M215\.0,0\.0Q[^"]*L-215\.0,0\.0|M-215\.0,0\.0Q[^"]*L215\.0,0\.0/,
 'Open horizontal contour must reach both grid edges');
const withMMF=coil.scene({r:.5,slip:1,theta:0,showMMF:true});
assert.match(withMMF,/data-coil-mmf="s"/);
assert.match(withMMF,/data-coil-mmf="r"/);
assert.match(withMMF,/class="coil-field-lines"/);
assert.match(withMMF,/data-coil-force="1"/);
assert.match(withMMF,/data-coil-force="2"/);
const transverseField=Math.PI/2;
const radialCurrent=coil.response(0,1,transverseField).i;
assert(Math.abs(coil.barForces(transverseField,0,radialCurrent)[0].x)>.5);
assert.doesNotMatch(coil.scene({r:0,slip:1,theta:transverseField}),/data-coil-force/,
 'A purely radial force must not produce tangential arrows on the bars');
assert.doesNotMatch(coil.scene({r:0,slip:1,theta:.4+transverseField,rotor:.4}),/data-coil-force/,
 'The tangential projection must also work on a rotated coil');
assert.match(withMMF,/<foreignObject x="230" y="483" width="180"[^>]*><div[^>]*white-space:nowrap/,
 'Keep the instantaneous-current readout on one line');

console.log('PASS: one-turn field, full-turn flux contours, bar forces, zero slip and instantaneous/mean torque.');
