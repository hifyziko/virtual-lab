'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=path.join(root,'versions/vyvoj/m_files/electromagnetic-wave');
function build(web){const manifestPath=path.join(web,'../manifest.json'),m=JSON.parse(fs.readFileSync(manifestPath)),entries=[];
 for(const name of ['index.html','style.css','model.js','field-renderer.js','lw-model.js','field-gpu.js','lw-renderer.js','app.js']){let data=fs.readFileSync(path.join(source,name));if(name==='index.html')data=Buffer.from(data.toString().replaceAll('../fusion/particles/','../shared/particles/').replaceAll('../fusion/confinement/','../fuze-udrzeni/').replaceAll('../fusion/navigation/','../shared/fusion/'));const rel='em-vlna/'+name,out=path.join(web,rel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,data);entries.push({path:rel,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});}
 const index=path.join(web,'index.html');let html=fs.readFileSync(index,'utf8').replace(/<!-- em-wave:start -->[\s\S]*?<!-- em-wave:end -->\s*/g,'');const anchor=html.includes('<script id="progressive-web-install">')?'<script id="progressive-web-install">':'</body>';
 html=html.replace(/<script id="module-guide-data">[\s\S]*?<\/script>/g,()=>'<script id="module-guide-data">'+fs.readFileSync(path.join(__dirname,'module-guide-data.js'),'utf8')+'</script>');
 html=html.replace(anchor,()=>'<'+ '!-- em-wave:start --><script>'+fs.readFileSync(path.join(__dirname,'em-wave-navigation.js'),'utf8')+'</script><!-- em-wave:end -->\n'+anchor);fs.writeFileSync(index,html);
 m.files=m.files.filter(f=>!f.path.startsWith('em-vlna/')).concat(entries);const i=m.files.find(f=>f.path==='index.html');i.bytes=Buffer.byteLength(html);i.sha256=crypto.createHash('sha256').update(html).digest('hex');if(m.progressive)m.progressive.shellBytes=i.bytes;m.bytes=m.files.reduce((a,f)=>a+f.bytes,0);fs.writeFileSync(manifestPath,JSON.stringify(m,null,2)+'\n');
}
if(require.main===module)for(const dir of ['versions/aktualni/web','versions/vyvoj/versions/aktualni/web']){const web=path.join(root,dir);build(web);require('./build-progressive-web.cjs').build(web);}
module.exports={build};
