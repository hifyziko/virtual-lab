'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=path.join(root,'versions/vyvoj/m_files/Web');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const encode=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const dataModules={
 'em05-reluktance':['armature-fields'],
 'dc18-dve-pole':['dc-simple-fields'],
 'dc01-princip':['dc-fields'],
 'dc02-kotva':['dc-fields','dc-coil-fields'],
 'dc17-rozvinuti':['dc-fields','dc-brush-fields'],
 'dc16-bldc-poloha':['dc-fields','dc-bldc-fields']
};
// Find a JSON string without a recursive regular expression over multi-megabyte literals.
function stringEnd(text,start){
 if(text[start]!=='"')throw Error('Expected an embedded JSON string');
 for(let i=start+1;i<text.length;i++){if(text[i]==='\\'){i++;continue;}if(text[i]==='"')return i+1;}
 throw Error('Unterminated embedded lesson');
}
function transform(original){
 if(original.includes('id="progressive-web-install"'))throw Error('Web is already progressive');
 let html=original;const chunks=new Map(),assets={},dependencies={...dataModules},preserved=[];
 function add(key,code){
  if(assets[key])throw Error('Duplicate lazy asset: '+key);
  new vm.Script(code);const bytes=Buffer.from(code),hash=sha(bytes),rel='lazy/'+key+'-'+hash.slice(0,16)+'.js';
  assets[key]={path:rel,bytes:bytes.length,sha256:hash};chunks.set(rel,bytes);
 }
 const prefix='const entries=[',suffix=';\nfor(const entry of entries)';
 const start=html.indexOf(prefix),end=html.indexOf(suffix,start);
 if(start<0||end<0)throw Error('Imported lesson catalog not found');
 const entries=JSON.parse(html.slice(start+'const entries='.length,end));
 for(const entry of entries){
  if(typeof entry.source!=='string')throw Error('Missing source: '+entry.id);
  const key='lesson-'+entry.id;add(key,'LabProgress.accept('+encode(key)+','+encode(entry.source)+');\n');
  preserved.push({key,kind:'html',sha256:sha(Buffer.from(entry.source))});delete entry.source;dependencies[entry.id]=[key];
 }
 const getters='\nfor(const entry of entries)Object.defineProperty(entry,"source",{get:()=>LabProgress.ready("lesson-"+entry.id)?LabProgress.value("lesson-"+entry.id):undefined});';
 html=html.slice(0,start)+'const entries='+encode(entries)+';'+getters+html.slice(end);
 for(const id of ['sm07-dq','sm08-rotor-dq']){
  const anchor=html.indexOf("const entry={id:'"+id+"'");
  if(anchor<0)throw Error('Missing lesson: '+id);
  const a=html.indexOf('const source=',anchor)+'const source='.length,b=stringEnd(html,a);
  const literal=html.slice(a,b),key='lesson-'+id;
  preserved.push({key,kind:'html',sha256:sha(Buffer.from(JSON.parse(literal)))});
  add(key,'LabProgress.accept('+encode(key)+','+literal+');\n');dependencies[id]=[key];
  const scriptEnd=html.indexOf('</script>',b),tail=html.slice(b,scriptEnd);
  if(!tail.includes('frame.srcdoc=source'))throw Error('Missing frame source: '+id);
  html=html.slice(0,a-'const source='.length)+'const sourceKey='+encode(key)+tail.replace('frame.srcdoc=source','frame.srcdoc=LabProgress.value(sourceKey)')+html.slice(scriptEnd);
 }
 const data=[
  ['armature-fields','ArmatureFields',['energy-experiments/fields.js','energy-experiments/field-lines.js']],
  // Composition calibrates its field as soon as the script runs; keep it with its basis.
  ['dc-fields','DCFieldBasis',['direct-current/field-basis.js','direct-current/composition.js']],
  ['dc-bldc-fields','DCBLDCFieldBasis',['direct-current/bldc-field-basis.js']],
  ['dc-coil-fields','DCCoilFieldBasis',['direct-current/coil-field-basis.js']],
  ['dc-brush-fields','DCBrushFieldBasis',['direct-current/brush-field-basis.js']],
  ['dc-simple-fields','DCSimpleFieldBasis',['direct-current/simple-field-basis.js']]
 ];
 for(const [key,global,files] of data){
  const parts=files.map(file=>{
   const content=fs.readFileSync(path.join(source,file),'utf8'),at=html.indexOf(content);
   if(at<0||html.indexOf(content,at+content.length)>=0)throw Error('Expected one unchanged data block: '+file);
   html=html.slice(0,at)+'/* Loaded on demand: '+key+' */'+html.slice(at+content.length);
   preserved.push({key,kind:'js',file,sha256:sha(Buffer.from(content))});return content;
  });
  add(key,parts.join('\n')+'\nLabProgress.accept('+encode(key)+',window.'+global+');\n');
 }
 const runtime=fs.readFileSync(path.join(__dirname,'progressive-loader.js'),'utf8'),css=fs.readFileSync(path.join(__dirname,'progressive-loader.css'),'utf8');
 html=html.replace('</head>','<style id="progressive-web-style">'+css+'</style><script id="progressive-web-runtime">'+runtime+'</script></head>');
 html=html.replace('<main id="app"></main>','<main id="app"><section class="lab-loading" aria-busy="true"><h1>Virtuální laboratoř</h1><p role="status">Načítání rozcestníku…</p><progress aria-label="Načítání rozcestníku"></progress><noscript>Pro otevření animací povolte JavaScript.</noscript></section></main>');
 html=html.replace('</body>','<script id="progressive-web-install">LabProgress.install('+encode(assets)+','+encode(dependencies)+');</script>\n</body>');
 for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
 return {html,chunks,assets,dependencies,preserved,originalBytes:Buffer.byteLength(original)};
}
function build(directory){
 const web=path.resolve(directory),index=path.join(web,'index.html'),manifestPath=path.join(web,'../manifest.json');
 const original=fs.readFileSync(index,'utf8'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 if(original.includes('id="progressive-web-install"')){
  for(const rel of manifest.progressiveFiles||[]){const expected=manifest.files.find(f=>f.path===rel);if(!expected||sha(fs.readFileSync(path.join(web,rel)))!==expected.sha256)throw Error('Lazy asset mismatch: '+rel);}
  console.log('Progressive web already current: '+web);return;
 }
 const output=transform(original),shell=Buffer.from(output.html);
 for(const [rel,bytes] of output.chunks){
  const dest=path.join(web,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});
  if(fs.existsSync(dest)){if(sha(fs.readFileSync(dest))!==sha(bytes))throw Error('Existing lazy asset differs: '+rel);}else fs.writeFileSync(dest,bytes,{flag:'wx'});
 }
 manifest.files=manifest.files.filter(f=>f.path!=='index.html'&&!f.path.startsWith('lazy/'));
 manifest.files.push({path:'index.html',bytes:shell.length,sha256:sha(shell)},...Object.values(output.assets));
 manifest.files.sort((a,b)=>a.path.localeCompare(b.path));manifest.bytes=manifest.files.reduce((n,f)=>n+f.bytes,0);
 manifest.progressiveFiles=[...output.chunks.keys()].sort();
 manifest.progressive={schema:1,originalBytes:output.originalBytes,shellBytes:shell.length,assets:output.assets,dependencies:output.dependencies,preserved:output.preserved};
 fs.writeFileSync(index,shell);fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({web,originalBytes:output.originalBytes,shellBytes:shell.length,deferredFiles:output.chunks.size,reductionPercent:+(100*(1-shell.length/output.originalBytes)).toFixed(1)}));
 return output;
}
if(require.main===module){
 const targets=process.argv.slice(2);
 for(const directory of targets.length?targets:['versions/aktualni/web','versions/vyvoj/versions/aktualni/web'])build(path.resolve(root,directory));
}
module.exports={transform,build,dataModules,stringEnd};
