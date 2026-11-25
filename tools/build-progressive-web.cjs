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
 'dc15-bldc':['dc-bldc-fields'],
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
 // The transformer field dialog is optional too: its embedded FEM document
 // must not travel with every visit to the hub. Preserve the document verbatim.
 const fieldStart=html.indexOf('<!-- fem-field:start -->'),fieldEnd=html.indexOf('<!-- fem-field:end -->',fieldStart);
 if(fieldStart<0||fieldEnd<0)throw Error('Missing transformer field dialog');
 let field=html.slice(fieldStart,fieldEnd);
 const fieldA=field.indexOf('const source=')+'const source='.length,fieldB=stringEnd(field,fieldA);
 const fieldLiteral=field.slice(fieldA,fieldB),fieldKey='dialog-transformer-field';
 add(fieldKey,'LabProgress.accept('+encode(fieldKey)+','+fieldLiteral+');\n');
 preserved.push({key:fieldKey,kind:'html',sha256:sha(Buffer.from(JSON.parse(fieldLiteral)))});
 field=field.slice(0,fieldA-'const source='.length)+field.slice(fieldB+1);
 const open="dialog.querySelector('iframe').srcdoc=source;dialog.showModal();",close="dialog.querySelector('iframe').srcdoc=''";
 if(!field.includes(open)||!field.includes(close))throw Error('Transformer dialog lifecycle changed');
 field=field.replace(open,"dialog.showModal();LabProgress.mountFrame(dialog.querySelector('iframe'),"+encode(fieldKey)+");")
  .replace(close,"LabProgress.clearFrame(dialog.querySelector('iframe'))");
 html=html.slice(0,fieldStart)+field+html.slice(fieldEnd);
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
// Package runtime assets in an on-demand document, like the imported machine
// lessons, without depending on navigation to another file:// page in a frame.
function addFusionPages(output,web){
 const navigation=fs.readFileSync(path.join(__dirname,'particle-library-navigation.js'),'utf8');
 const pages=[...navigation.matchAll(/id:'(fu\d+-[a-z]+)'[^\n]+?page:'([^']+)'/g)];
 const ids=new Set(pages.map(p=>p[1]));if(ids.size!==pages.length||!['fu01-reakce','fu02-galerie','fu03-drift','fu04-udrzeni','fu06-divertor'].every(id=>ids.has(id)))throw Error('Incomplete or duplicate fusion module routes');
 const waveNavigation=fs.readFileSync(path.join(__dirname,'em-wave-navigation.js'),'utf8');
 pages.push(...waveNavigation.matchAll(/id:'(em06-vlna)'[^\n]+?page:'([^']+)'/g));
 const published=new Set(require('./project/common.cjs').policy().webFiles);
 output.preserved=output.preserved.filter(item=>!item.key.startsWith('fusion-'));
 for(const key of Object.keys(output.assets))if(key.startsWith('fusion-'))delete output.assets[key];
 for(const id of Object.keys(output.dependencies))if(id.startsWith('fu'))delete output.dependencies[id];
 for(const [,id,page] of pages){
  const read=ref=>{
   const url=new URL(ref,'https://bundle.invalid/'+page),rel=url.pathname.slice(1);
   if(url.origin!=='https://bundle.invalid'||url.search||url.hash||!published.has(rel))throw Error('Unexpected fusion runtime asset: '+ref);
   return {rel,text:fs.readFileSync(path.join(web,rel),'utf8')};
  };
  let html=read('../'+page).text;
  html=html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,(_,ref)=>{
   const {rel,text}=read(ref);
   if(/@import|url\((?!["']?data:)/i.test(text)||/<\/style/i.test(text))throw Error('Stylesheet is not self-contained: '+rel);
   return '<style data-fusion-source="'+rel+'">'+text+'</style>';
  });
  // Media stays lazy and external; srcdoc inherits the hub base URL.
  html=html.replace(/(data-(?:video-src|video-poster))="([^"]+)"/g,(_,attribute,ref)=>{const url=new URL(ref,'https://bundle.invalid/'+page),rel=url.pathname.slice(1);if(url.origin!=='https://bundle.invalid'||!published.has(rel))throw Error('Unexpected fusion media: '+ref);return attribute+'="'+rel+'"';});
  const scripts=[];
  html=html.replace(/<script\b[^>]*src="([^"]+)"[^>]*>\s*<\/script>/g,(_,ref)=>{
   const {rel,text}=read(ref);new vm.Script(text);
   scripts.push('<script data-fusion-source="'+rel+'">'+text.replace(/<\/script/gi,'<\\/script')+'</script>');return '';
  });
  // Deferred scripts originally run after parsing the body; preserve that order.
  html=html.replace('</body>',()=>scripts.join('\n')+'\n</body>');
  html=html.replaceAll('href="../index.html#','href="index.html#');
  const key='fusion-'+id,code='LabProgress.accept('+encode(key)+','+encode(html)+');\n';
  new vm.Script(code);const bytes=Buffer.from(code),hash=sha(bytes),rel='lazy/'+key+'-'+hash.slice(0,16)+'.js';
  output.assets[key]={path:rel,bytes:bytes.length,sha256:hash};output.chunks.set(rel,bytes);output.dependencies[id]=[key];
  output.preserved.push({key,kind:'html',sha256:sha(Buffer.from(html))});
 }
 const aliases=JSON.parse(navigation.match(/const aliases=(\{[^\n]+\});/)[1]);
 for(const id of Object.keys(aliases))output.dependencies[id]=['fusion-fu02-galerie'];
 output.dependencies['fu08-ostrovy']=['fusion-fu11-rekonexe'];
 output.dependencies['fu05-rovnovaha']=['fusion-fu06-divertor'];
 const install='<script id="progressive-web-install">LabProgress.install('+encode(output.assets)+','+encode(output.dependencies)+');</script>';
 output.html=output.html.replace(/<script id="progressive-web-install">[\s\S]*?<\/script>/,()=>install);
}
function build(directory){
 const web=path.resolve(directory),index=path.join(web,'index.html'),manifestPath=path.join(web,'../manifest.json');
 const original=fs.readFileSync(index,'utf8'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 let output;
 if(original.includes('id="progressive-web-install"')){
  for(const rel of manifest.progressiveFiles||[]){const expected=manifest.files.find(f=>f.path===rel);if(!expected||sha(fs.readFileSync(path.join(web,rel)))!==expected.sha256)throw Error('Lazy asset mismatch: '+rel);}
  const p=manifest.progressive;output={html:original,chunks:new Map(),assets:{...p.assets},dependencies:{...p.dependencies},preserved:[...p.preserved],originalBytes:p.originalBytes};
 }else output=transform(original);
 addFusionPages(output,web);const shell=Buffer.from(output.html);
 for(const [rel,bytes] of output.chunks){
  const dest=path.join(web,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});
  if(fs.existsSync(dest)){if(sha(fs.readFileSync(dest))!==sha(bytes))throw Error('Existing lazy asset differs: '+rel);}else fs.writeFileSync(dest,bytes,{flag:'wx'});
 }
 manifest.files=manifest.files.filter(f=>f.path!=='index.html'&&!f.path.startsWith('lazy/'));
 manifest.files.push({path:'index.html',bytes:shell.length,sha256:sha(shell)},...Object.values(output.assets));
 manifest.files.sort((a,b)=>a.path.localeCompare(b.path));manifest.bytes=manifest.files.reduce((n,f)=>n+f.bytes,0);
 manifest.progressiveFiles=Object.values(output.assets).map(asset=>asset.path).sort();
 manifest.progressive={schema:1,originalBytes:output.originalBytes,shellBytes:shell.length,assets:output.assets,dependencies:output.dependencies,preserved:output.preserved};
 fs.writeFileSync(index,shell);fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 // Only obsolete content-addressed payloads may be removed, after publishing the new manifest.
 const retained=new Set(manifest.progressiveFiles),lazy=path.join(web,'lazy');
 if(fs.existsSync(lazy))for(const entry of fs.readdirSync(lazy,{withFileTypes:true})){
  if(entry.isFile()&&/^[a-z0-9-]+-[a-f0-9]{16}\.js$/.test(entry.name)&&!retained.has('lazy/'+entry.name))fs.unlinkSync(path.join(lazy,entry.name));
 }
 console.log(JSON.stringify({web,originalBytes:output.originalBytes,shellBytes:shell.length,deferredFiles:manifest.progressiveFiles.length,reductionPercent:+(100*(1-shell.length/output.originalBytes)).toFixed(1)}));
 return output;
}
if(require.main===module){
 const targets=process.argv.slice(2);
 const release=require('./project/release-output.cjs');
 for(const directory of targets.length?targets:[path.join(release.current(),'web')])build(path.resolve(root,directory));
}
module.exports={transform,build,dataModules,stringEnd};
