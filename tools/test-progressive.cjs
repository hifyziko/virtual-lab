'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),web=path.resolve(root,process.argv[2]||'versions/aktualni/web');
const manifest=JSON.parse(fs.readFileSync(path.join(web,'../manifest.json'),'utf8')),p=manifest.progressive;
assert(p,'Build the progressive delivery before testing');
const html=fs.readFileSync(path.join(web,'index.html'),'utf8'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(Buffer.byteLength(html),p.shellBytes);assert(p.shellBytes<p.originalBytes*.1,'Initial shell must exclude the large lesson data');
const chunks=new Map();
for(const [key,asset] of Object.entries(p.assets)){
 assert.match(asset.path,/^lazy\/[a-z0-9-]+-[a-f0-9]{16}\.js$/);
 const bytes=fs.readFileSync(path.join(web,asset.path));assert.equal(bytes.length,asset.bytes);assert.equal(sha(bytes),asset.sha256);
 assert(manifest.progressiveFiles.includes(asset.path));new vm.Script(bytes.toString());chunks.set(key,bytes.toString());
}
for(const record of p.preserved){
 if(record.kind==='html'){
  let source;vm.runInNewContext(chunks.get(record.key),{LabProgress:{accept(key,value){assert.equal(key,record.key);source=value;}}});
  assert.equal(sha(Buffer.from(source)),record.sha256,'Embedded lesson changed: '+record.key);
 }else{
  const original=fs.readFileSync(path.join(root,'versions/vyvoj/m_files/Web',record.file),'utf8');
  assert.equal(sha(Buffer.from(original)),record.sha256);assert(chunks.get(record.key).includes(original),'Numerical data or renderer changed');
  assert(!html.includes(original),'Numerical data remains in startup HTML');
 }
}
assert.deepEqual(p.dependencies['dc18-dve-pole'],['dc-simple-fields']);
assert.deepEqual(p.dependencies['em05-reluktance'],['armature-fields']);
// Registering DC lessons must work before any field payload is available.
const startup={console,Lab:{catalog:[],groupArt:{},register(){},route(){}}};startup.window=startup;
vm.runInNewContext(html.match(/<!-- direct-current:start --><script>([\s\S]*?)<\/script>/)[1],startup);
assert.equal(startup.DCFieldBasis,undefined);assert.equal(startup.DCLessons.length,9);
const runtime=fs.readFileSync(path.join(__dirname,'progressive-loader.js'),'utf8');
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.attributes={};this.hidden=false;}
 append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 contains(node){return this.children.includes(node)||this.children.some(child=>child.contains(node));}
 setAttribute(key,value){this.attributes[key]=String(value);}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(node=>node!==this);}
}
function fixture(protocol='https:'){
 const app=new Element('main'),head=new Element('head'),requests=[],mounted=[],warnings=[],context={};
 const sampleCode='LabProgress.accept("shared",{answer:42});',bytes=Buffer.from(sampleCode);
 const definitions={shared:{path:'lazy/shared.js',bytes:bytes.length,sha256:sha(bytes)}};
 let fail=false,gate=null,corrupt=false,streamCount=0;
 Object.assign(context,{console:{warn:(...args)=>warnings.push(args)},Uint8Array,TextDecoder,AbortController,crypto:crypto.webcrypto,
  setTimeout,clearTimeout,requestAnimationFrame:fn=>setImmediate(fn),location:{protocol,hash:''},
  document:{head,createElement:tag=>new Element(tag)},
  fetch:async rel=>{
   requests.push(rel);if(gate)await gate.promise;
   if(fail){fail=false;return {ok:false,status:503};}
   const actual=corrupt?Buffer.from(sampleCode.replace('42','43')):bytes;
   let i=0;const pieces=[actual.subarray(0,7),actual.subarray(7)];
   return {ok:true,body:{getReader:()=>({read:async()=>{streamCount++;return i<pieces.length?{done:false,value:pieces[i++]}:{done:true};}})}};
  }});
 context.window=context;vm.createContext(context);
 head.append=node=>{
  if(node.src){requests.push(node.src);setImmediate(()=>{try{if(fail){fail=false;node.onerror();}else{vm.runInContext(sampleCode,context);node.onload();}}catch{node.onerror();}});}
  else vm.runInContext(node.textContent,context);
 };
 context.Lab={modules:new Map(),catalog:[{id:'first',title:'První modul',group:'dc'},{id:'second',title:'Druhý modul',group:'sync'}],dispose:null,
  route(){if(this.dispose){this.dispose();this.dispose=null;}const module=this.modules.get(context.location.hash.slice(1));if(module)module.mount(app);else app.replaceChildren(new Element('home'));}};
 for(const entry of context.Lab.catalog)context.Lab.modules.set(entry.id,{...entry,mount(){mounted.push(entry.id);app.replaceChildren(new Element('lesson'));}});
 vm.runInContext(runtime,context);context.LabProgress.install(definitions,{first:['shared'],second:['shared']});
 return {context,app,requests,mounted,warnings,get streamCount(){return streamCount;},navigate(hash){context.location.hash=hash;context.Lab.route();},fail(){fail=true;},corrupt(){corrupt=true;},
  hold(){let resolve;const promise=new Promise(r=>resolve=r);gate={promise,resolve};},release(){gate.resolve();gate=null;}};
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,5));
async function until(fn){for(let i=0;i<200;i++){if(fn())return;await tick();}assert.fail('Timed out waiting for lazy loader');}
async function run(){
 const f=fixture();assert.equal(f.requests.length,0,'Home must not download lesson payloads');
 f.hold();f.navigate('#first');assert.equal(f.app.children[0].className,'lab-loading');assert.equal(f.requests.length,0,'Loading feedback precedes network work');
 await until(()=>f.requests.length===1);
 f.navigate('#group-dc');f.release();await until(()=>f.context.LabProgress.ready('shared'));
 assert.equal(f.mounted.length,0,'Completed background download must not reopen a module after leaving');
 f.navigate('#second');assert.deepEqual(f.mounted,['second']);assert.equal(f.requests.length,1,'Shared data must be cached');assert(f.streamCount>=3);
 const direct=fixture();direct.navigate('#first');await until(()=>direct.mounted.length===1);assert.equal(direct.context.LabProgress.value('shared').answer,42);
 const retry=fixture();retry.fail();retry.navigate('#first');await until(()=>retry.warnings.length===1);
 const button=retry.app.children[0].children.find(node=>node.tagName==='button');assert.equal(button.hidden,false);button.onclick();
 await until(()=>retry.mounted.length===1);assert.equal(retry.requests.length,2,'A failed request must be retryable');
 const damaged=fixture();damaged.corrupt();damaged.navigate('#first');await until(()=>damaged.warnings.length===1);
 assert.equal(damaged.context.LabProgress.ready('shared'),false,'Corrupt payload must not execute');assert.equal(damaged.mounted.length,0);
 const shared=fixture();shared.hold();shared.navigate('#first');await until(()=>shared.requests.length===1);shared.navigate('#second');await tick();shared.release();
 await until(()=>shared.mounted.length===1);assert.deepEqual(shared.mounted,['second']);assert.equal(shared.requests.length,1,'Concurrent routes must share the download');
 const offline=fixture('file:');offline.navigate('#first');await until(()=>offline.mounted.length===1);assert.equal(offline.context.LabProgress.value('shared').answer,42);
 // Execute every actual payload, including the field renderer that captures its basis at initialization.
 const c={console,setTimeout,clearTimeout,location:{protocol:'file:'},Lab:{modules:new Map(Object.keys(p.dependencies).map(id=>[id,{id,mount(){}}]))}};
 c.window=c;vm.createContext(c);
 c.DCCompensation=JSON.parse(fs.readFileSync(path.join(root,'versions/vyvoj/m_files/Web/direct-current/compensation.json'),'utf8'));
 for(const rel of ['direct-current/geometry.js','direct-current/visuals.js'])vm.runInContext(fs.readFileSync(path.join(root,'versions/vyvoj/m_files/Web',rel),'utf8'),c);
 c.document={createElement:()=>({remove(){}}),head:{append(script){try{vm.runInContext(fs.readFileSync(path.join(web,script.src),'utf8'),c);script.onload();}catch(error){script.onerror();throw error;}}}};
 vm.runInContext(runtime,c);c.LabProgress.install(p.assets,p.dependencies);
 for(const key of Object.keys(p.assets))await c.LabProgress.load(key);
 assert.equal(typeof c.ArmatureFieldLines,'function');
 assert.equal(Object.keys(p.assets).length,manifest.progressiveFiles.length);
 console.log('PASS: all original lesson/data hashes, all lazy payloads, startup without downloads, direct links, streaming, route cancellation, shared cache, retry, checksum rejection and file:// loading.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
