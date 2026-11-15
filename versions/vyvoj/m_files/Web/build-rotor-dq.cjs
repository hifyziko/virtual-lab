const fs=require('fs'),path=require('path'),vm=require('vm'),dir=path.join(__dirname,'synchronous');
const ref=fs.readFileSync(path.join(dir,'schema.html'),'utf8');
const css=[...ref.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).find(s=>s.includes('@font-face')&&s.includes('KaTeX'));
const lib=[...ref.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].trim().startsWith('!function')&&m[1].includes('ParseError'))?.[1];
if(!css||!lib)throw Error('Offline math dependencies unavailable');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'dq-field-basis.js'),'utf8'),ctx);const geometry={salientPath:ctx.window.SyncDQFieldBasis.salientPath};
let html=fs.readFileSync(path.join(dir,'rotor-dq-template.html'),'utf8').replace('<!--KATEX-->',()=>'<style>'+css+'</style><script>'+lib+'</script>');
for(const [tag,file] of [['STYLE','rotor-dq.css'],['PRINCIPLE','princip-model.js'],['ART','machine-art.js'],['MODEL','rotor-dq-model.js'],['UI','rotor-dq.js']]){let s=fs.readFileSync(path.join(dir,file),'utf8');if(tag==='ART')s=s.replaceAll('${salient}','${opts.salientPath||salient}').replace('for(const x of [-74,74])','for(const x of [-68,68])').replaceAll('${x-22}','${x-11}').replaceAll('width="44" height="23"','width="22" height="23"').replace('[-13,0,13]','[-6,0,6]');html=html.replace('/*'+tag+'*/',()=>s);}
html=html.replace('/*GEOMETRY*/',()=> 'window.SyncRotorGeometry='+JSON.stringify(geometry)+';');fs.writeFileSync(path.join(dir,'rotor-dq.html'),html);console.log('Built rotor-coordinate transformation module');
