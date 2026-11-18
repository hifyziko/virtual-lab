'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),temporary=path.join(root,'tmp'),lock=path.join(temporary,'release-build.lock');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function stage(){const value=process.env.HIFYZIKO_RELEASE_STAGE;if(!value)return null;const resolved=path.resolve(value);if(!resolved.startsWith(temporary+path.sep))throw Error('Release stage must stay inside project tmp');return resolved;}
function current(version='aktualni'){const dir=version==='aktualni'&&stage();return dir?path.join(dir,'current'):path.join(root,'versions',version);}
function mirror(version='aktualni'){const dir=version==='aktualni'&&stage();return dir?path.join(dir,'mirror'):path.join(root,'versions/vyvoj/versions',version);}
function begin(){
 if(stage())throw Error('A release build cannot start inside another release build');
 fs.mkdirSync(temporary,{recursive:true});
 if(fs.existsSync(lock)){const owner=JSON.parse(fs.readFileSync(lock,'utf8'));let alive=true;try{process.kill(owner.pid,0);}catch(e){if(e.code==='ESRCH')alive=false;}if(alive)throw Error('Another complete release build is already running; wait for it to finish.');fs.unlinkSync(lock);}
 const fd=fs.openSync(lock,'wx');fs.writeFileSync(fd,JSON.stringify({pid:process.pid}));fs.closeSync(fd);
 process.once('exit',()=>{try{if(JSON.parse(fs.readFileSync(lock,'utf8')).pid===process.pid)fs.unlinkSync(lock);}catch{}});
 const dir=fs.mkdtempSync(path.join(temporary,'release-build-'));process.env.HIFYZIKO_RELEASE_STAGE=dir;return dir;
}
function verify(directory){
 const m=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8')),web=path.join(directory,'web'),html=fs.readFileSync(path.join(web,'index.html'),'utf8');
 if(!m.progressive||!html.includes('<!-- particle-library:start -->')||!html.includes('id="progressive-web-install"'))throw Error('Refusing to publish an incomplete hub without fusion navigation and lazy loading');
 const fusion=html.indexOf('<!-- particle-library:start -->'),physics=html.indexOf('<script id="physics-preview">'),visual=html.indexOf('<script id="physics-visual">');
 if(physics<0||visual<0||fusion<physics||fusion<visual)throw Error('Refusing to publish a hub that replaces the fusion home after registration');
 const navigation=fs.readFileSync(path.join(root,'tools/particle-library-navigation.js'),'utf8');
 for(const [,id]of navigation.matchAll(/id:'(fu\d+-[a-z]+)'[^\n]+?page:'([^']+)'/g)){const key='fusion-'+id;if(!html.includes("id:'"+id+"'")||!m.progressive.assets[key]||m.progressive.dependencies[id]?.[0]!==key)throw Error('Missing fusion route in completed release: '+id);}
 for(const item of m.files){const file=path.resolve(web,item.path);if(!file.startsWith(web+path.sep))throw Error('Invalid release asset path');const bytes=fs.readFileSync(file);if(bytes.length!==item.bytes||hash(bytes)!==item.sha256)throw Error('Release asset mismatch: '+item.path);}
 return m;
}
function atomicWrite(file,bytes){const pending=file+'.pending-'+process.pid;fs.writeFileSync(pending,bytes);const delay=new Int32Array(new SharedArrayBuffer(4));for(let n=0;;n++){try{fs.renameSync(pending,file);return;}catch(e){if(process.platform!=='win32'||!['EPERM','EBUSY','UNKNOWN'].includes(e.code)||n>=20)throw e;Atomics.wait(delay,0,0,100);}}}
function publishOne(source,target,manifest=verify(source)){
 const web=path.join(target,'web');fs.mkdirSync(web,{recursive:true});
 // Keep the old hub and its hashed lazy files usable while new assets are copied.
 for(const item of manifest.files){if(item.path==='index.html')continue;const to=path.join(web,item.path);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(path.join(source,'web',item.path),to);}
 for(const name of ['CTETE.md','CTETE.txt','COPYRIGHT.md','CHANGELOG.md','SPUSTIT.cmd'])if(fs.existsSync(path.join(source,name)))fs.copyFileSync(path.join(source,name),path.join(target,name));
 atomicWrite(path.join(web,'index.html'),fs.readFileSync(path.join(source,'web/index.html')));
 atomicWrite(path.join(target,'manifest.json'),fs.readFileSync(path.join(source,'manifest.json')));
}
function publish(){const dir=stage();if(!dir)throw Error('No staged release');const main=verify(current()),secondary=verify(mirror());publishOne(current(),path.join(root,'versions/aktualni'),main);publishOne(mirror(),path.join(root,'versions/vyvoj/versions/aktualni'),secondary);delete process.env.HIFYZIKO_RELEASE_STAGE;if(!path.basename(dir).startsWith('release-build-')||path.dirname(dir)!==temporary)throw Error('Unexpected stage cleanup path');fs.rmSync(dir,{recursive:true,force:true});return dir;}
module.exports={current,mirror,begin,verify,publishOne,publish};
