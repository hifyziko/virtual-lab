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
assert.equal(created,0,'The home page must not load fusion frames');assert.equal(Lab.modules.size,5);assert.equal(Lab.catalog[0].id,'existing');assert.equal(Lab.catalog.length,3,'Only one gallery is listed');
const ids=new Set(Lab.modules.keys()),expectedPages=new Set(['fuze-bariera/index.html','fuze-seznam/index.html']);
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
 checkViewport(app,shell,entry.id);
 assert.equal(frame.src,undefined,'Embedded fusion must not navigate to a local file');assert.equal(frame.srcdoc,c.LabProgress.value('fusion-'+(entry.sourceId||entry.id)));assert.equal(frame.title,entry.title);assert.equal(frame.attributes.allow,'fullscreen');
 assert.equal(frame.onload,undefined,'An empty frame load must not hide the loading indicator');
 listeners.get('message')({source:{},data:{type:'virtual-lab:fusion-ready',id:entry.id}});assert(!loading.removed,'Unrelated frame must not mark the lesson ready');
 listeners.get('message')({source:frame.contentWindow,data:{type:'virtual-lab:fusion-ready',id:entry.id}});assert(loading.removed);assert(frame.classList.contains('is-ready'));
 let released=false;frame.contentWindow.HiFyzikoFusionDispose=()=>released=true;
 Lab.dispose();assert(released,'Release the child GPU resources before detaching it');assert(frame.removed);assert.equal(listeners.size,0);assert.equal(timers.size,0);assert(!app.classList.contains('fusion-module-host'));
 entry.mount(app);const lateMessage=listeners.get('message'),lateFrame=app.children[0].children[1];Lab.dispose();lateMessage({source:lateFrame.contentWindow,data:{type:'virtual-lab:fusion-ready',id:entry.id}});assert.equal(timers.size,0);
}
assert.equal(expectedPages.size,0);
for(const folder of ['versions/aktualni','versions/vyvoj/versions/aktualni']){
 const web=path.join(root,folder,'web'),manifest=JSON.parse(fs.readFileSync(path.join(root,folder,'manifest.json'),'utf8'));
 const published=new Set(require('./project/common.cjs').webFiles(manifest));
 for(const entry of Lab.modules.values()){
  if(entry.sourceId){assert.deepEqual(manifest.progressive.dependencies[entry.id],['fusion-'+entry.sourceId]);assert(!manifest.progressive.assets['fusion-'+entry.id],'Aliases must share the gallery payload');continue;}
  const file=path.join(web,entry.page),html=fs.readFileSync(file,'utf8');assert(html.includes('data-fusion-page="'+entry.id+'"'));assert(html.includes('target="_top">← Plazma a fúze'));
  for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   const url=new URL(ref,'https://lab.invalid/'+entry.page),rel=decodeURIComponent(url.pathname.slice(1));
   assert(published.has(rel),'Runtime dependency missing from public list: '+rel);assert(fs.existsSync(path.join(web,rel)),rel);
   if(url.hash)assert(url.hash==='#group-area-plasma'||ids.has(url.hash.slice(1)),'Unknown parent route: '+url.hash);
  }
  const item=manifest.files.find(item=>item.path===entry.page);assert.equal(item.sha256,crypto.createHash('sha256').update(html).digest('hex'));
  const key='fusion-'+entry.id,asset=manifest.progressive.assets[key];assert(asset);assert.deepEqual(manifest.progressive.dependencies[entry.id],[key]);
  let embedded;vm.runInNewContext(fs.readFileSync(path.join(web,asset.path),'utf8'),{LabProgress:{accept(received,value){assert.equal(received,key);embedded=value;}}});
  assert(!/<script\b[^>]*\bsrc=|<link\b[^>]*\bhref=|href="\.\.\/index.html#/i.test(embedded),'Embedded gallery must need no additional file loads and must link to its parent index');
  for(const [,ref] of html.matchAll(/data-video-src="([^"]+)"/g)){const rel=new URL(ref,'https://lab.invalid/'+entry.page).pathname.slice(1);assert(embedded.includes('data-video-src="'+rel+'"'),'Video path must resolve from the hub in srcdoc');assert(!/<video[^>]*\ssrc=/.test(embedded),'Do not load video before opening it');const video=manifest.files.find(item=>item.path===rel);assert(video);assert.equal(video.sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(web,rel))).digest('hex'));}
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
