const fs=require('fs'),path=require('path');
const root=__dirname,dest=path.join(root,'nahled-usporna-vyuka');
let html=fs.readFileSync(path.join(root,'interaktivni-elektricke-stroje.html'),'utf8');
if(!html.includes('machines/startup-live/index.html'))throw Error('Live viewer link not found');
html=html.replaceAll('machines/startup-live/index.html','machines/startup-compact-live/index.html');
const liveTransformer=path.join(root,'transformator/pole-transformatoru-live.html');
if(fs.existsSync(liveTransformer)){
 const source=fs.readFileSync(liveTransformer,'utf8');let updated=false;
 html=html.replace(/<!-- fem-field:start -->[\s\S]*?<!-- fem-field:end -->/,block=>block.replace(/const source=[\s\S]*?;const home=Lab\.home;/,()=>{updated=true;return 'const source='+JSON.stringify(source).replace(/</g,'\\u003c')+';const home=Lab.home;'}));
 if(!updated)throw Error('Transformer field source not found');
}
const models=['startup'],readySync=[];
for(const slug of ['salient','pm','smooth']){
 const folder=path.join(root,'machines','sync-'+slug+'-compact-live');
 if(['compression-report.json','manifest.js','viewer.js','index.html'].every(name=>fs.existsSync(path.join(folder,name)))){models.push('sync-'+slug);readySync.push(slug);}
}
if(readySync.length){let updated=false;
 html=html.replace(/<!-- machine-fields:start -->[\s\S]*?<!-- machine-fields:end -->/,block=>{
  block=block.replace(/const sources=([\s\S]*?);const home=Lab\.home;/,(_,json)=>{
   const sources=JSON.parse(json);
   for(const slug of readySync){const title={salient:'Vyniklé póly',pm:'Permanentní magnety',smooth:'Hladký rotor'}[slug];sources[slug]=`<!doctype html><html lang="cs"><meta charset="utf-8"><title>${title}</title><style>html,body,iframe{width:100%;height:100%;margin:0;border:0;display:block}</style><iframe title="${title}: pole FEM a detail"></iframe><script>document.querySelector('iframe').src=new URL('machines/sync-${slug}-compact-live/index.html',document.baseURI).href;</script></html>`;}
   updated=true;return 'const sources='+JSON.stringify(sources).replace(/</g,'\\u003c')+';const home=Lab.home;';
  });
  if(readySync.includes('smooth')&&!block.includes('data-machine-variant="smooth"'))block=block.replace('<button type="button" data-machine-variant="pm" aria-pressed="false">Permanentní magnety</button>','<button type="button" data-machine-variant="pm" aria-pressed="false">Permanentní magnety</button><button type="button" data-machine-variant="smooth" aria-pressed="false">Hladký rotor</button>');
  return block;
 });if(!updated)throw Error('Machine field sources not found');
}
for(const slug of ['dc','bldc'])if(['ready.json','compression-report.json','manifest.js','viewer.js','index.html'].every(name=>fs.existsSync(path.join(root,'machines',slug+'-compact-live',name))))models.push(slug);
const assets=[],reports={},stale=[];
for(const model of models){
 const relative='machines/'+model+'-compact-live',source=path.join(root,relative),target=path.join(dest,relative),report=JSON.parse(fs.readFileSync(path.join(source,'compression-report.json'),'utf8')),blocks=Math.ceil(report.frames/report.block_size);reports[model]=report;
 for(let k=0;k<blocks;k++)if(!fs.existsSync(path.join(source,'b'+String(k).padStart(4,'0')+'.js')))throw Error('Missing compact block '+model+' '+k);
 for(const name of fs.readdirSync(source))if(/^(b\d+\.js|manifest\.js|viewer\.js|index\.html|fallback\.html|viewer-canvas\.js|compression-report\.json)$/.test(name)&&(!/^b\d+\.js$/.test(name)||+name.slice(1,-3)<blocks))assets.push({source:path.join(source,name),relative:relative+'/'+name});
 if(fs.existsSync(target))for(const name of fs.readdirSync(target))if(/^b\d+\.js$/.test(name)&&+name.slice(1,-3)>=blocks)stale.push(path.join(target,name));
}
const credit='sources/VEJKON_auta_zdroje.txt';if(fs.existsSync(path.join(root,credit)))assets.push({source:path.join(root,credit),relative:credit});
function files(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(path.join(dir,f.name)):[path.join(dir,f.name)]):[];}
for(const file of stale){if(!path.resolve(file).startsWith(path.resolve(dest)+path.sep))throw Error('Unsafe delivery path');fs.unlinkSync(file);}
const loadingTools=path.resolve(root,'../../../../tools'),loadingStyle=fs.readFileSync(path.join(loadingTools,'progressive-loader.css'),'utf8'),loadingScript=fs.readFileSync(path.join(loadingTools,'scene-loading.js'),'utf8');
for(const a of assets){const target=path.join(dest,a.relative);fs.mkdirSync(path.dirname(target),{recursive:true});if(/\/(index|fallback)\.html$/.test(a.relative)){const source=fs.readFileSync(a.source,'utf8'),addition='<style id="scene-loading-style">'+loadingStyle+'</style><script id="scene-loading-runtime">'+loadingScript+'</script>';fs.writeFileSync(target,source.replace('</html>',addition+'</html>'));}else fs.copyFileSync(a.source,target);}
fs.writeFileSync(path.join(dest,'index.html'),html);
const report={bytes:0,limit_bytes:null,entry:'index.html',frames:reports.startup.frames,time_step_ms:.2,end_ms:reports.startup.end_ms,compact_synchronous:readySync,compact_direct_current:models.filter(s=>s==='dc'||s==='bldc'),pending_synchronous:['salient','pm','smooth'].filter(s=>!readySync.includes(s)||reports['sync-'+s]?.complete_period===false),ansys_included:false};
const size=()=>files(dest).reduce((sum,f)=>sum+fs.statSync(f).size,0);fs.writeFileSync(path.join(dest,'velikost.json'),JSON.stringify(report,null,2));report.bytes=size();fs.writeFileSync(path.join(dest,'velikost.json'),JSON.stringify(report,null,2));report.bytes=size();
console.log('Delivery size:',report.bytes,'bytes; compact sync:',readySync.join(',')||'pending');
