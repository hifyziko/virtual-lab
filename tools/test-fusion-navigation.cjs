'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),listeners=new Map(),timers=new Set();let created=0;
class Element{
 constructor(tag){created++;this.tagName=tag;this.children=[];this.attributes={};this.classes=new Set();this.classList={add:(...names)=>names.forEach(name=>this.classes.add(name)),remove:name=>this.classes.delete(name),contains:name=>this.classes.has(name),toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};if(tag==='iframe')this.contentWindow={};}
 set className(value){this.classes=new Set(value.split(/\s+/).filter(Boolean));}
 get className(){return [...this.classes].join(' ');}
 setAttribute(key,value){this.attributes[key]=value;}
 set innerHTML(value){this.markup=value;this.replaceChildren(new Element('p'),new Element('progress'));}
 append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 querySelector(tag){return this.children.find(node=>node.tagName===tag)||null;}
 remove(){this.removed=true;if(this.parent)this.parent.children=this.parent.children.filter(node=>node!==this);}
}
const Lab={catalog:[{id:'existing',group:'sync'}],modules:new Map(),home(){},route(){},register(module){this.modules.set(module.id,module);}};
const c={Lab,LabProgress:{value:key=>'<html>'+key+'</html>'},document:{readyState:'loading',createElement:tag=>new Element(tag)},location:{hash:''},setTimeout:fn=>{timers.add(fn);return fn;},clearTimeout:fn=>timers.delete(fn),addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name);}};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(__dirname,'particle-library-navigation.js'),'utf8'),c);
assert.equal(created,0,'The home page must not load fusion frames');assert.equal(Lab.modules.size,16);assert.equal(Lab.catalog[0].id,'existing');assert.equal(Lab.catalog.length,12,'Eleven fusion modules are listed');
assert.equal(Lab.catalog.at(-1).id,'fu02-galerie','Gallery retains its catalog route');assert.equal(Lab.catalog.find(e=>e.id==='fu03-drift').num,'03');assert.equal(Lab.catalog.at(-1).num,'05');
assert.deepEqual(Lab.catalog.filter(e=>e.topic==='basics').map(e=>e.id),['fu07-plazma','fu01-reakce','fu03-drift','fu12-lawson','fu02-galerie']);
assert.deepEqual(Lab.catalog.filter(e=>e.topic==='tokamak').map(e=>e.id),['fu09-princip','fu04-udrzeni','fu06-divertor','fu11-rekonexe','fu10-compass','fu13-ohrev']);
for(const topic of ['basics','tokamak'])assert.deepEqual(Lab.catalog.filter(e=>e.topic===topic).map(e=>e.num),topic==='basics'?['01','02','03','04','05']:['01','02','03','04','05','06']);
assert.equal(Lab.catalog.find(e=>e.id==='fu06-divertor').title,'Tokamak: pole a plazma');
{
 const create=c.document.createElement;let injected;const area={querySelector:selector=>selector==='.physics-area-heading'?{after(group){injected=group;}}:null};
 c.document.createElement=tag=>tag==='template'?{content:{querySelector:selector=>selector==='#group-area-plasma'?area:null},set innerHTML(value){},get innerHTML(){return injected?.markup||'';}}:new Element(tag);
 c.location.hash='#group-area-plasma';let markup;try{markup=Lab.home();}finally{c.document.createElement=create;c.location.hash='';}
 assert.equal(injected.id,'group-fusion','Keep historical group links');assert.equal(injected.tagName,'section');
 const topics=[...markup.matchAll(/<details\b([^>]+)>([\s\S]*?)<\/details>/g)];assert.equal(topics.length,2);
 for(const [attributes,body]of topics.map(m=>[m[1],m[2]])){const topic=attributes.match(/data-fusion-subgroup="([^"]+)"/)[1],items=Lab.catalog.filter(e=>e.topic===topic);assert(/\bopen\b/.test(attributes),'Both independent topics open in the plasma directory');assert.equal((body.match(/class="card ready fusion-card"/g)||[]).length,items.length);for(const entry of items)assert(body.includes('href="#'+entry.id+'"'));assert(body.includes(topic==='basics'?'Základy plazmatu a fúze':'Magnetické udržení a tokamak'));assert(body.includes('fusion-theme-label'));}
 for(const entry of Lab.catalog.filter(e=>e.group==='fusion'))assert.equal(markup.split('href="#'+entry.id+'"').length-1,1,'Each module has one tile');
}
assert(!Lab.catalog.some(e=>e.id==='fu08-ostrovy'));assert.equal(Lab.modules.get('fu08-ostrovy').sourceId,'fu11-rekonexe');assert(!Lab.catalog.some(e=>e.id==='fu05-rovnovaha'));assert.equal(Lab.modules.get('fu05-rovnovaha').sourceId,'fu06-divertor');
for(const alias of ['fu02-jadra','fu03-atomy','fu04-castice'])assert.equal(Lab.modules.get(alias).sourceId,'fu02-galerie','Historical aliases keep the gallery');
const ids=new Set(Lab.modules.keys()),expectedPages=new Set(['fuze-ohrev/index.html','fuze-lawson/index.html','fuze-ostrovy/vznik.html','compass-u/index.html','fuze-plazma/index.html','fuze-bariera/index.html','fuze-seznam/index.html','fuze-drift/index.html','fuze-udrzeni/index.html','fuze-rovnovaha/divertor.html','fuze-rovnovaha/princip.html']);
let guideRoot,guideHeading;
c.ModuleGuide={collect(root){guideRoot=root;},prepareHeading(heading,full){guideHeading=heading;assert.equal(full.parentElement,heading);}};
const windowFit=fs.readFileSync(path.join(root,'versions/vyvoj/m_files/Web/module-window-fit.js'),'utf8');
function checkViewport(app,shell,id){
 const noop=()=>{},f={Lab,location:{hash:'#'+id},document:{body:{},getElementById:name=>name==='app'?app:null,addEventListener:noop},
  matchMedia:()=>({matches:true}),requestAnimationFrame:()=>0,addEventListener:noop,
  ResizeObserver:class{observe(node){assert.notEqual(node,shell,'A responsive iframe host must not enter native lesson fitting');}disconnect(){}},
  MutationObserver:class{observe(){}disconnect(){}}};
 f.window=f;vm.createContext(f);vm.runInContext(windowFit,f);
 for(let i=0;i<3;i++)f.fitWindingModule();
 assert(!shell.classList.contains('uniform-module-layout'));assert(!app.classList.contains('module-window-host'));
}
for(const entry of Lab.modules.values()){
 if(!entry.sourceId)assert(expectedPages.delete(entry.page));assert.equal(entry.group,'fusion');
 const app=new Element('main');entry.mount(app);const shell=app.children[0],frame=shell.children[1],loading=shell.children[0];
 const header={},full={parentElement:header},body={};frame.contentDocument={body,querySelector:selector=>selector==='[data-fusion-full]'?full:null};
 checkViewport(app,shell,entry.id);
 assert.equal(frame.src,undefined,'Embedded fusion must not navigate to a local file');assert.equal(frame.srcdoc,c.LabProgress.value('fusion-'+(entry.sourceId||entry.id)));assert.equal(frame.title,entry.title);assert.equal(frame.attributes.allow,'fullscreen');
 assert.equal(frame.onload,undefined,'An empty frame load must not hide the loading indicator');
 listeners.get('message')({source:{},data:{type:'virtual-lab:fusion-ready',id:entry.id}});assert(!loading.removed,'Unrelated frame must not mark the lesson ready');
 listeners.get('message')({source:frame.contentWindow,data:{type:'virtual-lab:fusion-ready',id:entry.id}});assert(loading.removed);assert(frame.classList.contains('is-ready'));
 assert.equal(guideRoot,body);assert.equal(guideHeading,header,'guide is installed in every fusion header, including aliases');
 let released=false;frame.contentWindow.HiFyzikoFusionDispose=()=>released=true;
 Lab.dispose();assert(released,'Release the child GPU resources before detaching it');assert(frame.removed);assert.equal(listeners.size,0);assert.equal(timers.size,0);assert(!app.classList.contains('fusion-module-host'));
 entry.mount(app);const lateMessage=listeners.get('message'),lateFrame=app.children[0].children[1];Lab.dispose();lateMessage({source:lateFrame.contentWindow,data:{type:'virtual-lab:fusion-ready',id:entry.id}});assert.equal(timers.size,0);
}
assert.equal(expectedPages.size,0);
for(const folder of ['versions/aktualni','versions/vyvoj/versions/aktualni']){
 const web=path.join(root,folder,'web'),manifest=JSON.parse(fs.readFileSync(path.join(root,folder,'manifest.json'),'utf8'));
 const hub=fs.readFileSync(path.join(web,'index.html'),'utf8'),navigationOffset=hub.indexOf('<!-- particle-library:start -->');
 assert(navigationOffset>=0,'Delivered hub includes the fusion navigation, not only its data files');
 assert(navigationOffset>hub.indexOf('<script id="physics-visual">'),'Fusion home extension is installed after the base physics hub');
 assert(manifest.progressive&&hub.includes('id="progressive-web-install"'),'Delivered hub is complete before it becomes current');
 assert(hub.includes('Základy plazmatu a fúze')&&hub.includes('Magnetické udržení a tokamak'),'Delivered hub contains both fusion topics');
 assert(hub.includes('fusion-card-fill:#fbf7ed')&&hub.includes('fusion-card-fill:#f0f5fa'),'Both quiet topic palettes are included');
 for(const entry of Lab.catalog.filter(e=>e.group==='fusion'))assert(hub.includes("id:'"+entry.id+"'"),'Delivered hub registers '+entry.id);
 const published=new Set(require('./project/common.cjs').webFiles(manifest));
 for(const entry of Lab.modules.values()){
  if(entry.sourceId){assert.deepEqual(manifest.progressive.dependencies[entry.id],['fusion-'+entry.sourceId]);assert(!manifest.progressive.assets['fusion-'+entry.id],'Aliases must share the gallery payload');continue;}
  const file=path.join(web,entry.page),html=fs.readFileSync(file,'utf8');assert(html.includes('data-fusion-page="'+entry.id+'"'));assert(html.includes('aria-label="Zpět do skupiny Jaderná fúze a tokamaky"><span aria-hidden="true">←</span> Zpět</a>'));assert(html.includes('<header data-fusion-heading'));assert(html.includes('<h1 data-module-number="'+entry.num+'">'));
  if(entry.id==='fu06-divertor')assert(html.includes('<h1 data-module-number="03">Tokamak: pole a plazma</h1>'),'The renamed lesson heading is delivered under its existing route');
  for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   const url=new URL(ref,'https://lab.invalid/'+entry.page),rel=decodeURIComponent(url.pathname.slice(1));
   if(url.origin!=='https://lab.invalid'){assert.equal(url.protocol,'https:','External references must use HTTPS');continue;}
   assert(published.has(rel),'Runtime dependency missing from public list: '+rel);assert(fs.existsSync(path.join(web,rel)),rel);
   if(url.hash)assert(url.hash==='#group-area-plasma'||ids.has(url.hash.slice(1)),'Unknown parent route: '+url.hash);
  }
  const item=manifest.files.find(item=>item.path===entry.page);assert.equal(item.sha256,crypto.createHash('sha256').update(html).digest('hex'));
  const key='fusion-'+entry.id,asset=manifest.progressive.assets[key];assert(asset);assert.deepEqual(manifest.progressive.dependencies[entry.id],[key]);
  let embedded;vm.runInNewContext(fs.readFileSync(path.join(web,asset.path),'utf8'),{LabProgress:{accept(received,value){assert.equal(received,key);embedded=value;}}});
  assert(!/<script\b[^>]*\bsrc=|<link\b[^>]*\bhref=|href="\.\.\/index.html#/i.test(embedded),'Embedded gallery must need no additional file loads and must link to its parent index');
  for(const [,attribute,ref] of html.matchAll(/(data-(?:video-src|video-poster))="([^"]+)"/g)){const rel=new URL(ref,'https://lab.invalid/'+entry.page).pathname.slice(1);assert(embedded.includes(attribute+'="'+rel+'"'),'Media path must resolve from the hub in srcdoc');assert(!/<video[^>]*\ssrc=/.test(embedded),'Do not load video before opening it');const media=manifest.files.find(item=>item.path===rel);assert(media);assert.equal(media.sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(web,rel))).digest('hex'));}
  const originalScripts=[...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>\s*<\/script>/g)].map(m=>new URL(m[1],'https://lab.invalid/'+entry.page).pathname.slice(1));
  const embeddedScripts=[...embedded.matchAll(/<script data-fusion-source="([^"]+)">([\s\S]*?)<\/script>/g)];
  assert.deepEqual(embeddedScripts.map(m=>m[1]),originalScripts,'Preserve deferred script order');
  for(const [,rel,code] of embeddedScripts){assert.equal(code.replace(/<\\\/script/gi,'</script'),fs.readFileSync(path.join(web,rel),'utf8'),'Renderer or model changed: '+rel);new vm.Script(code);}
  assert(embedded.indexOf('<script data-fusion-source=')>embedded.indexOf('<footer>'),'Run scripts after the complete page body');
  for(const [,rel,css] of embedded.matchAll(/<style data-fusion-source="([^"]+)">([\s\S]*?)<\/style>/g))assert.equal(css,fs.readFileSync(path.join(web,rel),'utf8'),'Styles changed: '+rel);
 }
 for(const rel of ['shared/fusion/page.js','shared/fusion/style.css'])assert(manifest.files.some(item=>item.path===rel)&&published.has(rel));
}
console.log('PASS: fusion routes, deferred self-contained documents, unchanged script/style assets and order, readiness source checks, disposal/late events, return links and delivery hashes.');
