'use strict';
const C=require('./common.cjs'),ZIP=require('./zip.cjs'),assert=require('node:assert/strict'),{fs,path,root}=C;
fs.mkdirSync(path.join(root,'tmp'),{recursive:true});
const dir=fs.mkdtempSync(path.join(root,'tmp/project-tools-test-'));
assert.throws(()=>C.inside(dir,'../private'));assert.throws(()=>C.inside(dir,'/absolute'));
for(const p of ['literatura.pdf','tmp/test.txt','versions/archiv/data.js','.env','key.pem'])assert.throws(()=>C.assertPublic(p));
assert.throws(()=>C.webFiles({progressiveFiles:['../literatura.pdf']}));
assert.throws(()=>C.webFiles({progressiveFiles:['lazy/secrets.txt']}));
assert(C.webFiles({progressiveFiles:['lazy/lesson-test-0123456789abcdef.js']}).includes('lazy/lesson-test-0123456789abcdef.js'));
const samples=[['příliš žluťoučký.txt',Buffer.from('Přenos pravidel\r\n')],['data/model.bin',Buffer.from(Array.from({length:3000},(_,i)=>i%256))],['empty.txt',Buffer.alloc(0)]];
const manifest=[];for(const [rel,b] of samples){const p=C.inside(dir,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b);manifest.push({path:rel,bytes:b.length,sha256:C.sha(b)});}
ZIP.create(dir,path.join(dir,'test.zip'),manifest.map(f=>f.path));ZIP.verify(path.join(dir,'test.zip'),manifest);
assert.throws(()=>ZIP.verify(path.join(dir,'test.zip'),manifest.map((f,i)=>i?f:{...f,sha256:'0'.repeat(64)})));
console.log('PASS: path boundaries, publication exclusions, UTF-8/empty/binary ZIP roundtrip and hash failure detection.');
// A failed or partial build must leave the last complete hub usable.
const release=require('./release-output.cjs'),source=path.join(dir,'staged'),live=path.join(dir,'live');
fs.mkdirSync(path.join(source,'web/lazy'),{recursive:true});fs.mkdirSync(path.join(live,'web/lazy'),{recursive:true});
const routes=[...fs.readFileSync(path.join(root,'tools/particle-library-navigation.js'),'utf8').matchAll(/id:'(fu\d+-[a-z]+)'[^\n]+?page:'([^']+)'/g)].map(m=>m[1]);
const hub='<script id="physics-preview"></script><script id="physics-visual"></script><!-- particle-library:start --><script>const entries=['+routes.map(id=>"{id:'"+id+"'}").join(',')+'];</script><script id="progressive-web-install"></script>',assets={},dependencies={},records=[];
for(const id of routes){const key='fusion-'+id,rel='lazy/'+key+'.js',bytes=Buffer.from('payload '+id);fs.writeFileSync(path.join(source,'web',rel),bytes);const record={path:rel,bytes:bytes.length,sha256:C.sha(bytes)};records.push(record);assets[key]=record;dependencies[id]=[key];}
fs.writeFileSync(path.join(source,'web/index.html'),hub);records.push({path:'index.html',bytes:Buffer.byteLength(hub),sha256:C.sha(Buffer.from(hub))});C.writeJSON(path.join(source,'manifest.json'),{files:records,progressive:{assets,dependencies}});
fs.writeFileSync(path.join(live,'web/index.html'),'previous complete hub');fs.writeFileSync(path.join(live,'web/lazy/previous.js'),'previous payload');
const copy=fs.copyFileSync;let copies=0;
try{fs.copyFileSync=(from,to,...args)=>{assert.equal(fs.readFileSync(path.join(live,'web/index.html'),'utf8'),'previous complete hub','New assets are prepared before the live entry changes');if(++copies===2)throw Error('Simulated copy failure');return copy(from,to,...args);};assert.throws(()=>release.publishOne(source,live),/Simulated copy failure/);}finally{fs.copyFileSync=copy;}
assert.equal(fs.readFileSync(path.join(live,'web/index.html'),'utf8'),'previous complete hub');release.publishOne(source,live);assert.equal(fs.readFileSync(path.join(live,'web/index.html'),'utf8'),hub);assert.equal(fs.readFileSync(path.join(live,'web/lazy/previous.js'),'utf8'),'previous payload','Already open pages retain their old lazy payloads');
fs.writeFileSync(path.join(source,'web/index.html'),'incomplete machine-only hub');assert.throws(()=>release.publishOne(source,live),/incomplete hub/);assert.equal(fs.readFileSync(path.join(live,'web/index.html'),'utf8'),hub);
fs.writeFileSync(path.join(source,'web/index.html'),hub.replace("id:'"+routes[0]+"'","id:'missing'"));assert.throws(()=>release.verify(source),/Missing fusion route/);
fs.writeFileSync(path.join(source,'web/index.html'),hub.replace('<script id="physics-visual"></script>','')+'<script id="physics-visual"></script>');assert.throws(()=>release.verify(source),/replaces the fusion home/);
fs.writeFileSync(path.join(source,'web/index.html'),hub);fs.writeFileSync(path.join(source,'web',records[0].path),'corrupt asset');assert.throws(()=>release.verify(source),/asset mismatch/);
console.log('PASS: complete fusion publication gate, assets before atomic entry swap, preserved live hub on failure, retained old lazy payloads and corrupt asset rejection.');
