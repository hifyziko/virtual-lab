const fs=require('node:fs'),path=require('node:path'),dir=__dirname;
let html=fs.readFileSync(path.join(dir,'stability-template.html'),'utf8');
const ref=fs.readFileSync(path.join(dir,'../../HiFyziko_TR04_pricna_vetev_v8.html'),'utf8'),css=ref.match(/<style id="katex-typesetting">([\s\S]*?)<\/style>/)[1],lib=[...ref.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].trim().startsWith('!function')&&m[1].includes('ParseError'))[1];
html=html.replace('/*KATEX*/',()=>'<style>'+css+'</style><script>'+lib+'</script>');
for(const [tag,file] of [['STYLE','stability.css'],['PRINCIPLE','princip-model.js'],['ART','machine-art.js'],['MATH','math-typesetting.js'],['MODEL','stability-model.js'],['UI','stability.js']])html=html.replace('/*'+tag+'*/',()=>(tag==='UI'?fs.readFileSync(path.join(dir,'../machine-sound.js'),'utf8')+'\n':'')+fs.readFileSync(path.join(dir,file),'utf8'));
fs.writeFileSync(path.join(dir,'stability.html'),html);console.log('Built dynamic stability experiment');
