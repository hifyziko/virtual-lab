'use strict';
const C=require('./common.cjs'),ZIP=require('./zip.cjs'),{fs,path,root}=C;
if(C.git(['status','--porcelain']).length)throw Error('Commit the selected public changes before handoff. Never discard pending work.');
const commit=C.git(['rev-parse','HEAD']),branch=C.git(['branch','--show-current']);if(!branch)throw Error('Switch to a named branch before handoff.');
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
const folder=path.join(root,'handoffs','virtual-lab-'+stamp+'-'+commit.slice(0,8));
if(fs.existsSync(folder))throw Error('Handoff already exists');fs.mkdirSync(folder,{recursive:true});
const files=new Set(C.repositoryFiles());
// Private literature and small reproducible model inputs travel only in this archive.
for(const p of fs.readdirSync(root))if(p.endsWith('.pdf'))files.add(p);
for(const dir of ['TEs knizka','versions/vyvoj/m_files/reference','docs/fuze'])for(const p of C.walk(path.join(root,dir)))files.add(C.relative(p));
for(const dir of ['versions/vyvoj/m_files','tools','versions/vyvoj/tools'])for(const p of C.walk(path.join(root,dir))){const rel=C.relative(p);if(/\/(__pycache__|mpl-cache|review|nahled-usporna-vyuka|startup-live)\/|\.aedtresults\//.test(rel))continue;if(/\.(py|ps1|cjs|mjs|js|css|html|json|svg|png|jpe?g|woff2?|ttf|m|aedt|vbs|cfg|md|txt)$/.test(p))files.add(rel);}
for(const rel of ['tmp/sync-tests/linkedom.mjs'])if(fs.existsSync(C.inside(root,rel)))files.add(rel);
for(const p of C.walk(path.join(root,'versions/vyvoj/m_files/machines-fem/dc-bldc/recompute-inputs')))files.add(C.relative(p));
for(const rel of [...files].sort())C.copy(C.inside(root,rel),C.inside(folder,rel));
const release=[];for(const rel of C.policy().webFiles){const r='versions/aktualni/web/'+rel,p=C.inside(root,r),b=fs.readFileSync(p);C.copy(p,C.inside(folder,r));release.push({path:rel,bytes:b.length,sha256:C.sha(b)});}
C.writeJSON(path.join(folder,'versions/aktualni/manifest.json'),{version:'1.0',channel:'aktualni',entry:'web/index.html',bytes:release.reduce((s,f)=>s+f.bytes,0),files:release});
fs.mkdirSync(path.join(folder,'_handoff'),{recursive:true});
C.git(['bundle','create',path.join(folder,'_handoff/history.bundle'),'--all']);
C.git(['bundle','verify',path.join(folder,'_handoff/history.bundle')]);
const lfs=[];for(const line of C.git(['lfs','ls-files','--long']).split('\n')){const m=line.match(/^([a-f0-9]{64}) /);if(!m)continue;const oid=m[1],rel=oid.slice(0,2)+'/'+oid.slice(2,4)+'/'+oid,src=path.join(root,'.git/lfs/objects',rel);if(C.sha(fs.readFileSync(src))!==oid)throw Error('Invalid LFS object');C.copy(src,path.join(folder,'_handoff/lfs',rel));lfs.push(rel);}
let remoteCommit=null;try{remoteCommit=C.git(['rev-parse','@{upstream}']);}catch{}
const metadata={schema:1,created:new Date().toISOString(),commit,branch,remote:'https://github.com/hifyziko/virtual-lab.git',remoteCommit,pushPending:remoteCommit!==commit,lfs,applicationVersion:'1.0',private:true};
C.writeJSON(path.join(folder,'_handoff/state.json'),metadata);
fs.writeFileSync(path.join(folder,'ZACNETE-ZDE.txt'),`SOUKROMÉ PŘEDÁNÍ — obsahuje literaturu. Nenahrávat na GitHub ani Pages.\n\nStav: ${commit}\nVětev: ${branch}\n${metadata.pushPending?'Tento commit zatím není potvrzený na vzdálené větvi.':'Při balení odpovídal stav známé vzdálené větvi.'}\n\n1. Rozbalte ZIP do nové prázdné složky, nikdy přes rozpracovaný projekt.\n2. Nainstalujte Node.js 24, Git a Git LFS. Přihlašovací údaje se nepřenášejí.\n3. Spusťte: node tools/project/restore.cjs\n4. Přečtěte AGENTS.md, PREDANI_PROJEKTU.md a PREDANI-AKTUALNI.md.\n5. S internetem: git fetch origin, zkontrolujte stav; git pull --ff-only.\n6. Sestavení: node tools/build-release.cjs\n7. Kontrola: node tools/project/check.cjs\n\nHotový web: versions/aktualni/web/index.html. Verze aplikace zůstává 1.0.\nLiteratura a malé zdrojové modely jsou soukromé. Surové FEM výsledky nejsou přibalené; přepočet jen na požádání.\n`);
const manifest=C.walk(folder).map(p=>{const b=fs.readFileSync(p);return {path:path.relative(folder,p).replaceAll('\\','/'),bytes:b.length,sha256:C.sha(b)};});
C.writeJSON(path.join(folder,'_handoff/manifest.json'),{commit,files:manifest});
const b=fs.readFileSync(path.join(folder,'_handoff/manifest.json'));manifest.push({path:'_handoff/manifest.json',bytes:b.length,sha256:C.sha(b)});
const archive=folder+'.zip';ZIP.create(folder,archive,manifest.map(f=>f.path));ZIP.verify(archive,manifest);
fs.writeFileSync(archive+'.sha256',C.sha(fs.readFileSync(archive))+'  '+path.basename(archive)+'\n');
console.log(JSON.stringify({archive,private:true,files:manifest.length,MiB:Math.round(fs.statSync(archive).size/1024**2),commit,pushPending:metadata.pushPending,verified:true}));
