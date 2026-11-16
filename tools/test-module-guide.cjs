'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('versions/aktualni/web/index.html','utf8');
const catalog=JSON.parse(html.match(/Lab\.catalog=(\[[\s\S]*?\]);/)[1]);
const imported=JSON.parse(html.match(/const entries=(\[.*?\]);\nfor\(const entry of entries\)/s)[1]);
const Lab={catalog:[...imported,...catalog.filter(m=>!imported.some(e=>e.id===m.id))],groupArt:{},register(){},route(){},home(){}};
for(const m of html.matchAll(/const entry=\{id:'([^']+)',group:'([^']+)'[^;]*?title:'([^']+)'/g)){
 if(!Lab.catalog.some(e=>e.id===m[1]))Lab.catalog.push({id:m[1],group:m[2],title:m[3]});
}
const c={Lab,document:{readyState:'loading'}};c.window=c;vm.createContext(c);
for(const file of ['versions/vyvoj/m_files/Web/direct-current/lessons.js','tools/particle-library-navigation.js','tools/module-guide-data.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
const {entries,sources,aliases}=c.ModuleGuideData;
assert(Lab.catalog.length>50);
assert.deepEqual(Lab.catalog.map(e=>e.id).sort(),Object.keys(entries).sort(),'guide must cover the real final catalog, without phantom modules');
const katex=require('../versions/vyvoj/m_files/fusion/particles/vendor/katex.js');
for(const m of Lab.catalog){
 const g=entries[m.id];assert(g.controls.length===2&&g.points.length===2,m.id);
 assert(sources[g.source],m.id+' source');
 assert(g.controls.every(s=>s.length>25)&&g.points.every(s=>s.length>25),m.id+' empty prose');
 assert([...g.controls,...g.points].join(' ').length<950,m.id+' should stay concise');
 for(const id of g.related)assert(entries[id],m.id+' broken teaching link '+id);
 if(g.equation)katex.renderToString(g.equation,{throwOnError:true});
}
// Minimal dialog adapter, following the pattern of the project's navigation tests.
// Check UI lifecycle without mounting, resetting or touching a lesson's DOM/state.
class Element{
 constructor(tag){this.tagName=tag;this.nodes={};this.events={};this.attributes={};this.open=false;}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
 querySelector(k){return this.nodes[k]||(this.nodes[k]=new Element('div'));}
 querySelectorAll(){return [];}
 showModal(){this.open=true;}
 close(){this.open=false;}
}
const nodes=[],events={},docEvents={};
c.location={hash:''};
c.document={readyState:'complete',body:{append(...els){nodes.push(...els);}},getElementById:()=>null,createElement:tag=>new Element(tag),addEventListener:(name,fn)=>{docEvents[name]=fn;}};
c.addEventListener=(name,fn)=>{events[name]=fn;};
c.katex=katex;
const originalRoute=Lab.route,originalDispose=()=>{},state={time:7,speed:-.01};Lab.dispose=originalDispose;
vm.runInContext(fs.readFileSync('tools/module-guide.js','utf8'),c);
const [launch,dialog]=nodes;
assert(launch.hidden,'directory must not offer a guide for an absent lesson');
for(const id of [...Object.keys(entries),...Object.keys(aliases)]){
 c.location.hash='#'+id;events.hashchange();assert(!launch.hidden,id+' no launcher');
 launch.events.click();assert(dialog.open,id+' guide did not open');
 assert.equal(dialog.querySelector('#module-guide-title').textContent,Lab.catalog.find(m=>m.id===(aliases[id]||id)).title);
 const content=dialog.querySelector('#module-guide-content').innerHTML;
 assert(content.includes('Jak postupovat')&&content.includes('Co si odnést')&&content.includes('Podklad:'));
 let stopped=false;docEvents.keydown({key:'Escape',preventDefault(){},stopImmediatePropagation(){stopped=true;}});
 assert(stopped&&!dialog.open,'Escape closes guide before fullscreen handler');
 launch.events.click();dialog.querySelector('[data-guide-close]').events.click();assert(!dialog.open);
 launch.events.click();events.hashchange();assert(!dialog.open,'routing closes stale guide');
}
c.location.hash='#group-sync';events.hashchange();assert(launch.hidden);
assert.equal(Lab.route,originalRoute);assert.equal(Lab.dispose,originalDispose);assert.deepEqual(state,{time:7,speed:-.01});
const ui=fs.readFileSync('tools/module-guide.js','utf8'),css=fs.readFileSync('tools/module-guide.css','utf8');
assert(!/querySelector\(['"]#app|\.mount\(|\.dispose\(|\.route\s*=|resize|fitWindingModule/.test(ui),'guide must not manipulate measured lesson or lifecycle');
assert(css.includes('#module-guide-launch{position:fixed')&&css.includes('#module-guide-dialog{box-sizing:border-box;position:fixed'));
assert(!/(?:^|[}\n])\s*(?:body|main|\.workspace|\.modulehead|#app)\b/.test(css),'no changes to lesson geometry');
for(const [id,file] of [['module-guide','module-guide.js'],['module-guide-data','module-guide-data.js']])assert(html.includes('<script id="'+id+'">'+fs.readFileSync('tools/'+file,'utf8')));
assert(html.includes('<style id="module-guide-style">'+css));
assert(!/\.pdf(?:["']|<)|TEs knizka|data:application\/pdf/.test(ui),'no private book payload or links in UI');
console.log(`PASS: ${Lab.catalog.length} module guides, ${Object.keys(aliases).length} historical routes, all formulas and related links, dialog/close/Escape/routing, unchanged lesson lifecycle, isolated fixed-position styles and complete offline build.`);
