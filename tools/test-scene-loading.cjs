'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const element=()=>({hidden:false,style:{},children:[],attrs:{},append(...children){this.children.push(...children);},setAttribute(k,v){this.attrs[k]=v;}});
const scene=element(),status={...element(),textContent:'Načítání dat…'},timers=new Map();let notify,dispose,next=0,disconnected=false,reloaded=false;
vm.runInNewContext(fs.readFileSync(__dirname+'/scene-loading.js','utf8'),{document:{querySelector:()=>scene,getElementById:()=>status,createElement:element},MutationObserver:class{constructor(f){notify=f;}observe(){}disconnect(){disconnected=true;}},setTimeout(f){timers.set(++next,f);return next;},clearTimeout(k){timers.delete(k);},addEventListener(k,f){if(k==='pagehide')dispose=f;},location:{reload(){reloaded=true;}}});
const layer=scene.children[0],card=layer.children[0],[caption,bar,retry]=card.children;
assert(!layer.hidden,'Initial loading covers the main scene immediately');assert(!bar.hidden);assert(retry.hidden);assert.equal(status.style.visibility,'hidden');
status.textContent='Přehrávání';notify();assert(layer.hidden);assert.equal(status.style.visibility,'');
status.textContent='Načítání dalšího kroku…';for(let i=0;i<20;i++)notify();assert.equal(timers.size,1,'Repeated frame requests cannot postpone the loading panel indefinitely');assert(layer.hidden);
for(const f of timers.values())f();timers.clear();assert(!layer.hidden);
status.textContent='Chyba dat: soubor chybí';notify();assert(bar.hidden);assert(!retry.hidden);assert(!layer.hidden);retry.onclick();assert(reloaded);
status.textContent='Připraveno';notify();assert(layer.hidden);assert.equal(scene.attrs['aria-busy'],'false');
status.textContent='Načítání vybraného okamžiku…';notify();assert.equal(timers.size,1);dispose();assert.equal(timers.size,0);assert(disconnected);assert.equal(retry.onclick,null);
const root=__dirname+'/../versions/vyvoj/m_files/fusion/confinement/',html=fs.readFileSync(root+'index.html','utf8'),sceneStart=html.indexOf('<section class="sceneWrap">'),controlsEnd=html.indexOf('</aside>');
for(const id of ['hLoad','atlasStatus']){assert(html.indexOf('id="'+id+'"')>sceneStart,'Data loader is inside the main scene: '+id);assert(html.indexOf('id="'+id+'"')>controlsEnd);}
assert(html.includes('id="hProgress" max="18"'));
console.log('PASS: main-scene loading, buffering delay, errors, retry, disposal and fusion loader placement.');
