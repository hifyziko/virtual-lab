'use strict';
const C=require('./common.cjs'),{fs,path,root}=C;
const data=C.json(path.join(root,'_handoff/state.json')),manifest=C.json(path.join(root,'_handoff/manifest.json'));
if(fs.existsSync(path.join(root,'.git')))throw Error('Git already exists here. Restore only into a freshly extracted handoff.');
if(!/^[a-f0-9]{40,64}$/.test(data.commit)||data.remote!=='https://github.com/hifyziko/virtual-lab.git')throw Error('Unexpected handoff metadata');
C.git(['check-ref-format','--branch',data.branch]);
for(const f of manifest.files){const p=C.inside(root,f.path),b=fs.readFileSync(p);if(b.length!==f.bytes||C.sha(b)!==f.sha256)throw Error('Handoff checksum mismatch: '+f.path);}
C.git(['lfs','version']);
C.git(['init','-b',data.branch]);
C.git(['config','--local','core.autocrlf','false']);C.git(['config','--local','pull.ff','only']);
C.git(['lfs','install','--local']);C.git(['remote','add','origin',data.remote]);
C.git(['fetch','_handoff/history.bundle','refs/heads/*:refs/remotes/handoff/*','refs/remotes/origin/*:refs/remotes/origin/*','refs/tags/*:refs/tags/*']);
C.git(['update-ref','refs/heads/'+data.branch,data.commit]);C.git(['read-tree',data.commit]);
for(const rel of data.lfs){const from=C.inside(path.join(root,'_handoff/lfs'),rel);if(C.sha(fs.readFileSync(from))!==path.basename(rel))throw Error('Invalid LFS payload');C.copy(from,C.inside(path.join(root,'.git/lfs/objects'),rel));}
C.git(['config','branch.'+data.branch+'.remote','origin']);C.git(['config','branch.'+data.branch+'.merge','refs/heads/'+data.branch]);
if(C.git(['status','--porcelain']).length)throw Error('Restored worktree differs from the handoff commit; inspect git status.');
console.log('Verified and restored '+data.commit+'. No credentials imported. Configure your Git author, authenticate, then fetch origin before continuing.');
