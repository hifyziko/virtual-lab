'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=path.join(root,'versions/vyvoj/m_files/Web');
const release=require('./project/release-output.cjs');
const css=fs.readFileSync(path.join(source,'visual-proposal.css'),'utf8');
const js=fs.readFileSync(path.join(source,'visual-proposal.js'),'utf8');new vm.Script(js);
const painter=fs.readFileSync(path.join(source,'visual-proposal-paint.js'),'utf8');new vm.Script(painter);
const encode=value=>JSON.stringify(value).replace(/</g,'\\u003c');
for(const target of [release.current(),release.mirror()]){
 const web=path.join(target,'web'),original=fs.readFileSync(path.join(web,'index.html'),'utf8');
 const manifestPath=path.join(target,'manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 const a=original.indexOf('const entries=['),b=original.indexOf(';\nfor(const entry of entries)',a);
 if(a<0||b<0)throw Error('Missing progressive lesson catalog');
 const entries=JSON.parse(original.slice(a+'const entries='.length,b));
 const ids=entries.filter(e=>e.group==='electromagnetism').map(e=>e.id).concat(['em04-premena','em05-reluktance','em06-vlna']);
 const colours=new Set();
 const collect=text=>{for(const m of text.matchAll(/#(?:[\da-fA-F]{8}|[\da-fA-F]{6}|[\da-fA-F]{4}|[\da-fA-F]{3})\b/g))colours.add(m[0].toLowerCase());};
 collect(original);collect(css);
 for(const id of ids)for(const key of manifest.progressive.dependencies[id]||[]){
  if(key==='armature-fields')continue; // Numeric bases contain no UI theme tokens.
  const asset=manifest.progressive.assets[key];collect(fs.readFileSync(path.join(web,asset.path),'utf8'));
 }
 // Separate file shares the exact existing routes, renderers and lazy payloads.
 const early='if('+encode(['','group-area-electricity','group-electromagnetism',...ids])+'.includes(location.hash.slice(1)))document.documentElement.setAttribute("data-visual-proposal","laboratory");';
 const paintCode=painter+'\ninstallVisualProposalPaint(window,'+encode(css)+','+encode([...colours].sort())+');';new vm.Script(paintCode);
 const html=original.replace('<head>',()=>'<head><script>'+early+'</script>')
  .replace('</head>',()=>'<style id="visual-proposal-style">'+css+'</style><script id="visual-proposal-renderer">'+paintCode+'</script></head>')
  .replace('</body>',()=>'<script id="visual-proposal">'+js+'</script></body>');
 const bytes=Buffer.from(html),name='nahled-vzhledu.html';fs.writeFileSync(path.join(web,name),bytes);
 manifest.files=manifest.files.filter(item=>item.path!==name);
 manifest.files.push({path:name,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 manifest.files.sort((a,b)=>a.path.localeCompare(b.path));manifest.bytes=manifest.files.reduce((n,f)=>n+f.bytes,0);
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 console.log('Optional visual proposal: '+path.join(web,name));
}
