'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/injector');
const M=require(path.join(dir,'model.js'));
for(const voltage of [200,500,1000]){
  for(const gas of [false,true]){
    let prev=0;
    for(let i=0;i<=1000;i++){
      const f=M.sample(i/1000,voltage,gas);
      assert(Number.isFinite(f.x) && Number.isFinite(f.y));
      if(!f.impact){assert(f.kinetic>=prev-1e-9);prev=f.kinetic;}
      if(f.t>=.57 && !f.impact)assert(Math.abs(f.kinetic-voltage)<1e-9);
    }
    assert.equal(M.sample(.29,voltage,gas).electrons,2);
    const last=M.sample(1,voltage,gas);
    assert.equal(last.impact,!gas);
    if(gas){assert.equal(last.electrons,0);assert.equal(M.sample(.76,voltage,true).electrons,1);}
    else{assert.equal(last.x,M.dumpX);assert.equal(last.kinetic,0);assert.equal(last.electrons,2);}
  }
}
assert(Math.abs(M.sample(.8,1000,true).speed/M.sample(.8,500,true).speed-Math.SQRT2)<1e-12);
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),nodes=new Map(),noop=()=>{};
const katex=require(path.join(dir,'../particles/vendor/katex.js'));
const pen=new Proxy({}, {get:(_,key)=>key==='createRadialGradient'||key==='createLinearGradient'?()=>({addColorStop:noop}):noop});
const element=()=>({style:{},dataset:{},append:noop,clientWidth:1338,clientHeight:270,getBoundingClientRect:()=>({width:1338}),getContext:()=>pen});
for(const match of html.matchAll(/\bid="([^"]+)"/g))nodes.set(match[1],element());
const get=id=>nodes.get(id);
get('voltage').value=1000;get('gas').checked=true;get('speed').value=1;
let advance;
const c={document:{getElementById:get,querySelectorAll:()=>[],createElement:element,addEventListener:noop},
  addEventListener:noop,devicePixelRatio:1,requestAnimationFrame:fn=>{advance=fn;return 1;},cancelAnimationFrame:noop,
  ResizeObserver:class{observe(){}},katex:{render:tex=>katex.renderToString(tex,{throwOnError:true})}};
c.window=c;vm.createContext(c);
for(const file of ['../particles/style.js','../equilibrium/cad-parameters.js','../equilibrium/cad.js','model.js','source-detail.js','scene.js','app.js'])
  vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),c,{filename:file});
const source=vm.runInContext('InjectorSource',c);
const gap=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
for(const t of [.10,.18,.254,.27,.302]){
  const a=source.sourceFrame(t-1e-8),b=source.sourceFrame(t);
  assert(gap(a.tracked,b.tracked)<.01 && gap(a.sibling,b.sibling)<.01,'Nuclei move continuously across each event');
}
const split=source.sourceFrame(.10),separate=source.sourceFrame(.14);
assert(gap(split.tracked,split.sibling)<gap(separate.tracked,separate.sibling));
const knock=source.sourceFrame(.18);
assert.equal(gap(knock.projectile,knock.sibling),0);
assert(!knock.siblingBound && knock.ejected && source.sourceFrame(.179).siblingBound);
assert(gap(source.sourceFrame(.20).ejected,source.sourceFrame(.20).projectile)>30);
assert.equal(source.sourceFrame(.253).surface,null);
assert(!source.sourceFrame(.269).surfaceBound && source.sourceFrame(.27).surfaceBound);
assert(gap(source.sourceFrame(.26999999).surface,source.sourceFrame(.27).surface)<.01);
assert(source.sourceFrame(.302).tracked[0]<source.sourceFrame(.27).tracked[0]);
assert(source.sourceFrame(.34).tracked[0]>800);
for(const gas of [true,false]){
  const last=gas?1:.84;
  for(const [i,[start,seconds]] of M.cues.entries()){
    if(start>=last)break;
    assert(seconds>=3 && M.sample(start,1000,gas).caption.length>25);
    const next=M.sample(start,1000,gas).next;
    assert(Math.abs(M.advance(start,seconds,gas)-next)<1e-12);
    assert(M.advance(start,seconds*.5,gas)<next);
    assert.equal(M.cues[i+1][0],next);
  }
  assert.equal(M.advance(0,1000,gas),last);
}
function toEnd(){for(let i=0;i<=M.cues.length&&!get('step').disabled;i++)get('step').onclick();assert(get('step').disabled);}
toEnd();assert.equal(get('stage').textContent,'Rychlý deuteron');
get('gas').checked=false;get('gas').onchange();assert.equal(get('seek').value,.57);
toEnd();assert.equal(get('stage').textContent,'Dopad na sběrnou desku');assert.match(get('action-caption').textContent,/dopadl/);
get('play').onclick();advance(100);advance(200);assert(get('seek').value>0 && get('seek').value<.1);
get('seek').value=.8;get('seek').oninput();assert.equal(get('play').textContent,'Přehrát');
get('voltage').value=500;get('voltage').oninput();assert(get('kinetic').dataset.rendered.startsWith('500'));
for(const m of html.matchAll(/data-tex="([^"]+)"/g))katex.renderToString(m[1],{throwOnError:true});
console.log('PASS injector: voltage and energy, charge states, dump and plasma endpoints, step, playback, scrub, controls and math.');
