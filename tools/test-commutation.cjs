const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const base=path.resolve(__dirname,'../versions/vyvoj/m_files/Web');
let frame;const classes={add(){},remove(){},toggle(){}};
const c={window:null,console,document:{hidden:false,body:{classList:classes}},Lab:{},requestAnimationFrame:f=>(frame=f,1),cancelAnimationFrame(){}};c.window=c;vm.createContext(c);
const html=fs.readFileSync(path.join(base,'interaktivni-elektricke-stroje.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
vm.runInContext(scripts.find(s=>s.startsWith('!function')&&s.includes('renderToString')),c);
for(const f of ['synchronous/machine-art.js','direct-current/visuals.js','direct-current/commutation.js'])vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),c);
const node=dataset=>({dataset,innerHTML:'',value:0,setAttribute(){}}),nodes={};
const modes=['linear','delayed','assisted'].map(cmMode=>node({cmMode})),steps=[0,1,2,3].map(cmStep=>node({cmStep})),graphs=['coil','currents','density'].map(cmGraph=>node({cmGraph}));
const app={classList:classes,innerHTML:'',querySelector:id=>nodes[id]??=node({}),querySelectorAll:s=>s.includes('mode')?modes:s.includes('step')?steps:graphs};
c.DCCommutation.mount(app,{num:'06',title:'Komutace pod kartáčem'});
for(const mode of modes){mode.onclick();for(const step of steps){nodes['#cm-t'].value=[0,.5,.85,1][step.dataset.cmStep];nodes['#cm-t'].oninput();for(const graph of graphs){graph.onclick();for(const id of ['#cm-scene','#cm-diagram','#cm-story-text'])assert(!/NaN|undefined|Infinity|katex-error/.test(nodes[id].innerHTML),id);}}}
for(const mode of ['linear','delayed','assisted'])for(let k=0;k<=100;k++){const q=c.DCCommutation.sample(k/100,mode);assert(Math.abs(q.i1+q.i2-2)<1e-10);assert(Math.abs(q.a1+q.a2-1)<1e-10);}
assert.equal(c.DCCommutation.sample(1).j1,null);assert.equal(c.DCCommutation.sample(0).j2,null);assert(c.DCCommutation.sample(1,'delayed').i1>0);
// Check the reduced differential equation against a numerical derivative.
for(const mode of ['delayed','assisted'])for(const lambda of [.05,.35,1])for(const t of [.01,.2,.5,.99]){
 const q=c.DCCommutation.sample(t,mode,lambda),h=1e-6;
 const derivative=(c.DCCommutation.sample(t+h,mode,lambda).i-c.DCCommutation.sample(t-h,mode,lambda).i)/(2*h);
 assert(Math.abs(lambda*derivative+q.i-q.reference-q.uk)<1e-7);
}
assert.equal(c.DCCommutation.sample(0,'delayed').di,0);
for(const mode of ['linear','delayed','assisted'])for(const time of [.1,.4,.8]){
 const h=1e-6,rate=(c.DCCommutation.currentTravel(time+h,mode,.35)-c.DCCommutation.currentTravel(time-h,mode,.35))/(2*h);
 assert(Math.abs(rate-3.6*c.DCCommutation.sample(time,mode,.35).i)<1e-7);
}

for(const lambda of [.05,.35,1])for(let k=1;k<100;k++){
 const q=c.DCCommutation.sample(k/100,'assisted',lambda);
 assert(q.i<q.reference,'Interpole curve must lie below the linear reference');
 assert(q.i>-1.25,'Curve must fit the reserved overshoot region');
}
assert(c.DCCommutation.sample(.9,'assisted',.35).i < -1,'Default interpole mode must show overcommutation');

assert(c.DCCommutation.sample(1,'delayed',1).i1>c.DCCommutation.sample(1,'delayed',.05).i1);
assert(Math.abs(c.DCCommutation.sample(1,'assisted').i1)<1e-10);
assert(c.DCCommutation.diagram({t:1,mode:'delayed',amount:.35}).includes('data-residual-current'));
nodes['#cm-reset'].onclick();nodes['#cm-play'].onclick();frame(100);for(let t=140;t<1000;t+=40)frame(t);assert(c.dcCommutationState().t>0);assert(nodes['#cm-scene'].innerHTML.includes('cm-flow-dot'));nodes['#cm-play'].onclick();const paused=c.dcCommutationState().t;frame(1040);assert.equal(c.dcCommutationState().t,paused);
nodes['#cm-reset'].onclick();nodes['#cm-t'].value=1;nodes['#cm-t'].oninput();assert.equal(c.dcCommutationState().t,1);c.Lab.dispose();assert.equal(c.dcCommutationState,undefined);
console.log('PASS: three modes, four time positions, three graphs, real KaTeX/SVG, current balance, zero-area limits, playback, pause, slider and disposal.');
