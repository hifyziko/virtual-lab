const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=path.join(root,'versions/vyvoj/m_files/fusion');
require('./build-atom-preview.cjs');
for(const folder of ['versions/aktualni','versions/vyvoj/versions/aktualni']){
 const dest=path.join(root,folder),web=path.join(dest,'web'),entries=[];
 function copy(dir,prefix,base=dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())copy(p,prefix,base);else{const rel=prefix+path.relative(base,p).replaceAll('\\','/');let data=fs.readFileSync(p);if(rel.endsWith('.html'))data=Buffer.from(data.toString().replaceAll('../particles/','../shared/particles/'));const out=path.join(web,rel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,data);entries.push({path:rel,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});}}}
 copy(path.join(source,'particles'),'shared/particles/');copy(path.join(source,'particle-list'),'fuze-seznam/');copy(path.join(source,'barrier'),'fuze-bariera/');
 const index=path.join(web,'index.html');let html=fs.readFileSync(index,'utf8').replace(/<!-- particle-library:start -->[\s\S]*?<!-- particle-library:end -->\s*/g,'');
 const js=fs.readFileSync(path.join(__dirname,'particle-library-navigation.js'),'utf8');
 html=html.replace('</body>',()=>`<!-- particle-library:start --><script>${js}</script><!-- particle-library:end -->\n</body>`);fs.writeFileSync(index,html);
 const file=path.join(dest,'manifest.json'),m=JSON.parse(fs.readFileSync(file,'utf8'));m.files=m.files.filter(f=>!['fuze-galerie/','fuze-castice/','fuze-seznam/','fuze-bariera/','shared/particles/'].some(p=>f.path.startsWith(p))).concat(entries);const item=m.files.find(f=>f.path==='index.html');if(item){item.bytes=Buffer.byteLength(html);item.sha256=crypto.createHash('sha256').update(html).digest('hex');}m.bytes=m.files.reduce((n,f)=>n+f.bytes,0);fs.writeFileSync(file,JSON.stringify(m,null,2)+'\n');
}
console.log('Built retained particle database; no fusion concept modules or alternate entry generated.');
