'use strict';
const C=require('./common.cjs'),{fs,path,root}=C;
const dest=path.resolve(root,process.argv[2]||'dist/pages');
if(!dest.startsWith(root+path.sep))throw Error('Publication must stay inside workspace');
if(fs.existsSync(dest))throw Error('Output already exists; choose a new empty directory: '+dest);
const base=path.join(root,'versions/aktualni/web');
const manifest=C.json(path.join(root,'versions/aktualni/manifest.json'));
const known=new Map(manifest.files.map(f=>[f.path,f]));
const report=[];
for(const rel of C.webFiles(manifest)){
 if(/\.(pdf|zip|npz|dat|tif)$/i.test(rel)||/TEs knizka|CTETE|README/.test(rel))throw Error('Non-presentation file in web list: '+rel);
 const from=C.inside(base,rel),b=fs.readFileSync(from),expected=known.get(rel);
 if(!expected||expected.bytes!==b.length||expected.sha256!==C.sha(b))throw Error('Delivery manifest mismatch: '+rel);
 C.copy(from,C.inside(dest,rel));report.push({path:rel,bytes:b.length,sha256:C.sha(b)});
}
fs.writeFileSync(path.join(dest,'.nojekyll'),'');
C.writeJSON(dest+'.manifest.json',{entry:'index.html',files:report,bytes:report.reduce((s,f)=>s+f.bytes,0)});
console.log(JSON.stringify({pages:dest,files:report.length,MiB:Math.round(report.reduce((s,f)=>s+f.bytes,0)/1024**2)}));
