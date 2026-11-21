const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=path.join(root,'versions/vyvoj/m_files/fusion');
require('./build-atom-preview.cjs');
for(const folder of ['versions/aktualni','versions/vyvoj/versions/aktualni']){
 const release=require('./project/release-output.cjs'),dest=folder==='versions/aktualni'?release.current():release.mirror(),web=path.join(dest,'web'),entries=[];
 function write(rel,data){const out=path.join(web,rel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,data);entries.push({path:rel,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});}
 function copy(dir,prefix,base=dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){if(p===path.join(source,'confinement','helicity-data'))continue;copy(p,prefix,base);}else{const rel=prefix+path.relative(base,p).replaceAll('\\','/');let data=fs.readFileSync(p);if(rel.endsWith('.html'))data=Buffer.from(data.toString().replaceAll('../particles/','../shared/particles/').replaceAll('../navigation/','../shared/fusion/').replaceAll('../confinement/','../fuze-udrzeni/').replaceAll('../equilibrium/','../fuze-rovnovaha/'));write(rel,data);}}}
 copy(path.join(source,'particles'),'shared/particles/');copy(path.join(source,'particle-list'),'fuze-seznam/');copy(path.join(source,'barrier'),'fuze-bariera/');
 copy(path.join(source,'navigation'),'shared/fusion/');copy(path.join(source,'drift'),'fuze-drift/');copy(path.join(source,'confinement'),'fuze-udrzeni/');
 require('./pack-helicity.cjs').pack(path.join(source,'confinement/helicity-data'),(name,raw)=>{
  const rel='fuze-udrzeni/helicity-chunks/'+name+'.js',data=Buffer.from('window.HiFyzikoHelicityData=window.HiFyzikoHelicityData||{};window.HiFyzikoHelicityData['+JSON.stringify(name)+']='+JSON.stringify(raw)+';\n');
  const out=path.join(web,rel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,data);entries.push({path:rel,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});
 });
 copy(path.join(source,'heating'),'fuze-ohrev/');
 copy(path.join(source,'nbi'),'fuze-nbi/');
 copy(path.join(source,'lawson'),'fuze-lawson/');
 copy(path.join(source,'milniky'),'fuze-milniky/');
 copy(path.join(source,'equilibrium'),'fuze-rovnovaha/');copy(path.join(source,'plasma'),'fuze-plazma/');copy(path.join(source,'compass-u'),'compass-u/');
 // Only the current island lesson is shipped. Keep the former direct URL usable.
 for(const name of ['vznik.html','vznik.js','layout.js']){
  let data=fs.readFileSync(path.join(source,'islands',name));
  if(name.endsWith('.html'))data=Buffer.from(data.toString().replaceAll('../particles/','../shared/particles/').replaceAll('../navigation/','../shared/fusion/'));
  write('fuze-ostrovy/'+name,data);
 }
 write('fuze-ostrovy/index.html',Buffer.from('<!doctype html><html lang="cs"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=vznik.html"><title>Magnetické přepojení a vznik ostrova</title><a href="vznik.html">Magnetické přepojení a vznik ostrova</a></html>'));
 const index=path.join(web,'index.html');let html=fs.readFileSync(index,'utf8').replace(/<!-- particle-library:start -->[\s\S]*?<!-- particle-library:end -->\s*/g,'').replace(/<style id="fusion-navigation-style">[\s\S]*?<\/style>/g,'');
 html=html.replace('</head>',()=>'<style id="fusion-navigation-style">'+fs.readFileSync(path.join(source,'navigation/style.css'),'utf8')+'</style></head>');
 html=html.replace(/<script id="module-guide-data">[\s\S]*?<\/script>/g,()=>'<script id="module-guide-data">'+fs.readFileSync(path.join(__dirname,'module-guide-data.js'),'utf8')+'</script>');
 const js=fs.readFileSync(path.join(__dirname,'particle-library-navigation.js'),'utf8');
 const anchor=html.includes('<script id="progressive-web-install">')?'<script id="progressive-web-install">':'</body>';
 html=html.replace(anchor,()=>`<!-- particle-library:start --><script>${js}</script><!-- particle-library:end -->\n`+anchor);fs.writeFileSync(index,html);
 const file=path.join(dest,'manifest.json'),m=JSON.parse(fs.readFileSync(file,'utf8'));m.files=m.files.filter(f=>!['fuze-nbi/','fuze-milniky/','fuze-ohrev/','fuze-lawson/','compass-u/','fuze-ostrovy/','fuze-plazma/','fuze-galerie/','fuze-castice/','fuze-seznam/','fuze-bariera/','fuze-drift/','fuze-udrzeni/','fuze-rovnovaha/','shared/particles/','shared/fusion/'].some(p=>f.path.startsWith(p))).concat(entries);const item=m.files.find(f=>f.path==='index.html');if(item){item.bytes=Buffer.byteLength(html);item.sha256=crypto.createHash('sha256').update(html).digest('hex');}if(m.progressive)m.progressive.shellBytes=Buffer.byteLength(html);m.bytes=m.files.reduce((n,f)=>n+f.bytes,0);fs.writeFileSync(file,JSON.stringify(m,null,2)+'\n');
 require('./build-em-wave.cjs').build(web);
 if(m.progressive)require('./build-progressive-web.cjs').build(web);
}
console.log('Built retained particle database; no fusion concept modules or alternate entry generated.');
