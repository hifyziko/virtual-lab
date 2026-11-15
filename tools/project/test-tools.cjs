'use strict';
const C=require('./common.cjs'),ZIP=require('./zip.cjs'),assert=require('node:assert/strict'),{fs,path,root}=C;
fs.mkdirSync(path.join(root,'tmp'),{recursive:true});
const dir=fs.mkdtempSync(path.join(root,'tmp/project-tools-test-'));
assert.throws(()=>C.inside(dir,'../private'));assert.throws(()=>C.inside(dir,'/absolute'));
for(const p of ['literatura.pdf','tmp/test.txt','versions/archiv/data.js','.env','key.pem'])assert.throws(()=>C.assertPublic(p));
const samples=[['příliš žluťoučký.txt',Buffer.from('Přenos pravidel\r\n')],['data/model.bin',Buffer.from(Array.from({length:3000},(_,i)=>i%256))],['empty.txt',Buffer.alloc(0)]];
const manifest=[];for(const [rel,b] of samples){const p=C.inside(dir,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b);manifest.push({path:rel,bytes:b.length,sha256:C.sha(b)});}
ZIP.create(dir,path.join(dir,'test.zip'),manifest.map(f=>f.path));ZIP.verify(path.join(dir,'test.zip'),manifest);
assert.throws(()=>ZIP.verify(path.join(dir,'test.zip'),manifest.map((f,i)=>i?f:{...f,sha256:'0'.repeat(64)})));
console.log('PASS: path boundaries, publication exclusions, UTF-8/empty/binary ZIP roundtrip and hash failure detection.');
