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
assert(!/STEJNOSMERNE|SYNCHRONNI_|prezentac|TEs|TES kni/i.test(Object.values(sources).join(' ')),'no presentation or working scan-folder citations in the guide');
assert(Object.values(sources).some(s=>s.includes('Bartoš: Teorie elektrických strojů')),'use the correct book identity');
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
 constructor(tag){this.tagName=tag;this.nodes={};this.events={};this.attributes={};this.dataset={};this.open=false;this.children=[];this._html='';}
 set innerHTML(value){this._html=value;this.children=[];}
 get innerHTML(){return this._html+this.children.map(n=>n.outerHTML).join('');}
 get outerHTML(){return '<'+this.tagName+'>'+ (this.textContent||'')+this.innerHTML+'</'+this.tagName+'>';}
 get firstChild(){return this.children[0]||null;}
 append(...nodes){for(const n of nodes){n.remove();n.parentElement=this;this.children.push(n);}}
 remove(){if(this.parentElement){const a=this.parentElement.children;a.splice(a.indexOf(this),1);this.parentElement=null;}}
 hasAttribute(k){return k in this.attributes;}
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
 c.location.hash='#'+id;events.hashchange();assert(launch.hidden,id+' no duplicate floating launcher');
 launch.events.click();assert(dialog.open,id+' guide did not open');
 assert.equal(dialog.querySelector('#module-guide-title').textContent,Lab.catalog.find(m=>m.id===(aliases[id]||id)).title);
 const content=dialog.querySelector('#module-guide-content').innerHTML;
 assert(content.includes('Ovládání a pokusy')&&content.includes('Co si odnést')&&content.includes('Podklad:'));
 let stopped=false;docEvents.keydown({key:'Escape',preventDefault(){},stopImmediatePropagation(){stopped=true;}});
 assert(stopped&&!dialog.open,'Escape closes guide before fullscreen handler');
 launch.events.click();dialog.querySelector('[data-guide-close]').events.click();assert(!dialog.open);
 launch.events.click();events.hashchange();assert(!dialog.open,'routing closes stale guide');
}
c.location.hash='#group-sync';events.hashchange();assert(launch.hidden);
assert.equal(Lab.route,originalRoute);assert.equal(Lab.dispose,originalDispose);assert.deepEqual(state,{time:7,speed:-.01});
const ui=fs.readFileSync('tools/module-guide.js','utf8'),css=fs.readFileSync('tools/module-guide.css','utf8');
assert(!/querySelector\(['"]#app|\.mount\(|\.dispose\(|Lab\.route\s*=(?!=)|resize|fitWindingModule/.test(ui),'guide must not invoke lesson lifecycle or resize on open');
assert(css.includes('#module-guide-launch{position:fixed')&&css.includes('#module-guide-dialog{box-sizing:border-box;position:fixed'));
assert(!/(?:^|[}\n])\s*(?:body|main|\.workspace|\.modulehead|#app)\b/.test(css),'no changes to lesson geometry');
for(const [id,file] of [['module-guide','module-guide.js'],['module-guide-data','module-guide-data.js']])assert(html.includes('<script id="'+id+'">'+fs.readFileSync('tools/'+file,'utf8')));
assert(html.includes('<style id="module-guide-style">'+css));
assert(!/\.pdf(?:["']|<)|TEs knizka|data:application\/pdf/.test(ui),'no private book payload or links in UI');
console.log(`PASS: ${Lab.catalog.length} module guides, ${Object.keys(aliases).length} historical routes, all formulas and related links, dialog/close/Escape/routing, unchanged lesson lifecycle, isolated fixed-position styles and complete offline build.`);

// Consolidated AM guide: retain the complete theory, render all math, and leave
// the running module untouched when opening/closing the document-level dialog.
const manifest=JSON.parse(fs.readFileSync('versions/aktualni/manifest.json','utf8'));
const asset=manifest.progressive.assets['lesson-am02-momentova-charakteristika'];let lesson;
vm.runInNewContext(fs.readFileSync('versions/aktualni/web/'+asset.path,'utf8'),{LabProgress:{accept(key,value){lesson=value;}}});
const content=lesson.match(/<template id="lesson-guide-content">([\s\S]*?)<\/template>/)[1];
const displayed=lesson.replace(/<template\b[^>]*>[\s\S]*?<\/template>/g,'');
assert(!/<summary>(?:Výpočet momentu|Vrstvený model rotorové tyče)<\/summary>/.test(displayed));
for(const title of ['Ovládání','Co vyzkoušet','Výpočet momentu','Vrstvený model rotorové tyče'])assert(content.includes('<h3>'+title+'</h3>'));
const source=fs.readFileSync('versions/vyvoj/m_files/Web/induction/momentova-charakteristika.html','utf8');
for(const match of source.matchAll(/<details(?: class="equations")?><summary>[^<]+<\/summary>([\s\S]*?)<\/details>/g)){
 for(const tex of match[1].matchAll(/data-tex="([^"]+)"/g))assert(content.includes(tex[0].replace(/\\mathrm\{(tyč|ostatní)\}/g,'\\text{$1}')),'preserve original equation '+tex[1]);
 for(const link of match[1].matchAll(/href="([^"]+)"/g))assert(content.includes(link[0]),'preserve source link');
}
for(const tex of content.matchAll(/data-tex="([^"]+)"/g))katex.renderToString(tex[1],{throwOnError:true,strict:'error'});
c.location.hash='#am02-momentova-charakteristika';events.hashchange();
c.ModuleGuide.open(content);assert(dialog.open);assert.equal(dialog.querySelector('#module-guide-content').innerHTML,content);
dialog.querySelector('[data-guide-close]').events.click();assert(!dialog.open);
assert.equal(Lab.route,originalRoute);assert.equal(Lab.dispose,originalDispose);assert.deepEqual(state,{time:7,speed:-.01});
assert(html.includes('id="import-guide"')&&html.includes('window.ModuleGuide.open(content.innerHTML)'));
console.log('PASS: consolidated AM controls/theory, preserved equations and sources, valid KaTeX, hidden source outside layout, unchanged lesson lifecycle.');

// DOM adapter for migration policy and on-demand snapshots. Original nodes stay
// in place, so closures/renderers can keep writing to their existing references.
function sourceNode(tag,title,{classes=[],interactive=false}={}){
 const n=new Element(tag);n.value='initial value';n.isConnected=true;
 n.style={writes:0,setProperty(key,value){this[key]=value;this.writes++;}};
 const summary=new Element('summary');summary.textContent=title;
 n.matches=s=>s.split(',').some(x=>x===tag||classes.includes(x));
 n.closest=()=>n.hasAttribute('data-guide-source')?n:null;
 n.querySelector=s=>s.includes('summary')?summary:interactive&&s.includes('input')?{}:null;
 n.cloneNode=()=>{
  const copy=new Element(tag),heading=new Element('summary'),p=new Element('p');heading.textContent=title;p.textContent=n.value;
  if(tag==='details')copy.append(heading);copy.append(p);
  copy.querySelector=s=>s.includes('summary')&&tag==='details'?heading:null;
  return copy;
 };
 return n;
}
const fieldNote=sourceNode('details','Reálnější zobrazení · vypočtené pole');
const theory=sourceNode('details','Jak číst graf a co model zahrnuje');
const learning=sourceNode('details','Proč jedna drážková rozteč nestačí?',{classes:['.learning-explanation']});
const controls=sourceNode('details','Pokročilé nastavení',{interactive:true});
const positions=sourceNode('details','Přesné polohy vodičů',{classes:['.precisePositions']});
const live=sourceNode('details','Lorentzova síla',{interactive:true});
const modal=sourceNode('dialog','Od sil k momentu');
const root={ownerDocument:c.document,isConnected:true,querySelector:()=>null,querySelectorAll:selector=>selector==='.statusline'?[]:[theory,learning,controls,positions,live,modal,fieldNote]};
c.location.hash='#dc02-kotva';c.ModuleGuide.collect(root);
for(const n of [theory,learning,modal,fieldNote])assert.equal(n.style.display,'none','theory removed from scene flow');
for(const n of [controls,positions,live])assert.equal(n.style.display,undefined,'interactive/settings/scene content retained');
c.ModuleGuide.collect(root);assert.equal(theory.style.writes,1,'repeated fitting does not keep mutating layout');
theory.value='current snapshot 17';c.ModuleGuide.open();
assert(dialog.querySelector('#module-guide-content').innerHTML.includes('current snapshot 17'),'opening snapshots the current renderer output');
theory.value='next snapshot 29';assert(!dialog.querySelector('#module-guide-content').innerHTML.includes('next snapshot 29'),'open document is a stable snapshot');
c.ModuleGuide.open();assert(dialog.querySelector('#module-guide-content').innerHTML.includes('next snapshot 29'));
c.location.hash='#dc01-princip';c.ModuleGuide.open();assert(!dialog.querySelector('#module-guide-content').innerHTML.includes('next snapshot 29'),'no stale theory from previous route');
let headerButton,insertions=0;
const heading={querySelector:()=>headerButton},full={before(button){headerButton=button;insertions++;}};
c.ModuleGuide.prepareHeading(heading,full);c.ModuleGuide.prepareHeading(heading,full);
assert.equal(insertions,1,'exactly one entry immediately before fullscreen');
assert.equal(headerButton.textContent,'Ovládání a výklad');headerButton.onclick();assert(dialog.open);
assert.equal(Lab.route,originalRoute);assert.equal(Lab.dispose,originalDispose);
// The fullscreen element of a fusion iframe covers the parent's document.
// Adopt the same dialog into that document, retaining the common stylesheet.
const childDoc={fullscreenElement:{},querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,createElement:tag=>new Element(tag),head:{append(style){this.injected=style;}},body:{append(node){node.ownerDocument=childDoc;}}};
const childRoot={isConnected:true,ownerDocument:childDoc,querySelector:()=>null};
const oldGet=c.document.getElementById,oldAppend=c.document.body.append;
c.document.getElementById=()=>({textContent:css});c.document.body.append=node=>{node.ownerDocument=c.document;};dialog.ownerDocument=c.document;
c.ModuleGuide.collect(childRoot);c.ModuleGuide.open();
assert.equal(dialog.ownerDocument,childDoc);assert.equal(childDoc.head.injected.textContent,css);assert(dialog.open);
dialog.events.cancel({preventDefault(){}});assert(!dialog.open);assert.equal(dialog.ownerDocument,c.document);
c.document.getElementById=oldGet;c.document.body.append=oldAppend;
console.log('PASS: consolidated static theory, retained interactive controls, live snapshots, route isolation, idempotent collection and single header entry. DOM mocked.');

let equations=0;
for(const [key,item]of Object.entries(manifest.progressive.assets)){
 if(!key.startsWith('lesson-'))continue;
 let documentSource;vm.runInNewContext(fs.readFileSync('versions/aktualni/web/'+item.path,'utf8'),{LabProgress:{accept(k,v){documentSource=v;}}});
 documentSource=documentSource.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 for(const block of documentSource.matchAll(/<(?:details|dialog)\b[^>]*>[\s\S]*?<\/(?:details|dialog)>/g)){
  for(const tex of block[0].matchAll(/data-(?:tex|math)="([^"]*)"/g)){
   katex.renderToString(tex[1].replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'),{throwOnError:true,strict:'error'});equations++;
  }
 }
}
assert(equations>80);console.log('PASS: '+equations+' original theory equations across the delivered imported lessons pass strict KaTeX.');

// Imported prose must not inherit the scene's p.explain grid or .formula flex.
const prose={classList:['explain','note'],attributes:{class:'explain note',style:'display:grid'},closest:()=>null,removeAttribute(k){delete this.attributes[k];},setAttribute(k,v){this.attributes[k]=v;}};
const inline={...prose,classList:['formula'],attributes:{class:'formula','data-tex':'i_1'}};
const formula={closest:()=>true};
const guideContent=dialog.querySelector('#module-guide-content'),oldQuery=guideContent.querySelectorAll;
guideContent.querySelectorAll=selector=>selector==='*'?[prose,inline,formula]:[];
c.location.hash='#tr01-matematicky';c.ModuleGuide.open('<p>Regression fixture</p>');
assert(!('class'in prose.attributes)&&!('style'in prose.attributes));
assert('data-guide-prose'in prose.attributes);assert('data-guide-prose'in inline.attributes);assert.equal(inline.attributes['data-tex'],'i_1');
assert(css.includes('[data-guide-prose]{all:revert'));
assert(css.includes(':is(span,b,strong,i,em,a)[data-guide-prose]{display:inline'));
guideContent.querySelectorAll=oldQuery;
console.log('PASS: source layout classes/styles removed from prose; inline math and existing KaTeX preserved.');
const chapters=['Ovládání a pokusy','Podrobný model'].map(text=>({querySelector:()=>({textContent:text,classList:{add(){}}})}));
let contents;guideContent.querySelectorAll=selector=>selector===':scope > section'?chapters:[];guideContent.prepend=node=>{contents=node;};
c.ModuleGuide.open('<p>Study template</p>');
assert.equal(contents.attributes['aria-label'],'Obsah výkladu');
assert.equal(contents.children[1].children.length,2);
const chapterButton=contents.children[1].children[1].children[0];
assert.equal(chapterButton.textContent,'Podrobný model');
let scrolled=false;dialog.nodes['#module-guide-chapter-1']={scrollIntoView(){scrolled=true;}};
dialog.events.click({target:{closest:selector=>selector==='[data-guide-target]'?{getAttribute:()=>chapterButton.attributes['data-guide-target']}:null}});
assert(scrolled&&dialog.open);assert.equal(c.location.hash,'#tr01-matematicky','contents must not navigate away from the running lesson');
guideContent.querySelectorAll=oldQuery;
console.log('PASS: study contents lists chapters and scrolls within the dialog without routing or closing the lesson.');

for(const file of ['princip-template.html','princip.html']){const source=fs.readFileSync('versions/vyvoj/m_files/Web/induction/'+file,'utf8');assert(!source.includes('fieldExplanation'),'Redundant field accordion removed');assert(source.includes('id="showNumericalField"'),'Numerical field toggle retained');}
