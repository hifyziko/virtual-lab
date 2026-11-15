const fs=require('node:fs'),path=require('node:path'),dir=__dirname;
const ref=fs.readFileSync(path.join(dir,'../../HiFyziko_TR04_pricna_vetev_v8.html'),'utf8');
const css=ref.match(/<style id="katex-typesetting">([\s\S]*?)<\/style>/)[1];
const lib=[...ref.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].trim().startsWith('!function')&&m[1].includes('ParseError'))[1];
let html=fs.readFileSync(path.join(dir,'synchronizing-template.html'),'utf8').replace('<!--KATEX-->',()=>'<style>'+css+'</style><script>'+lib+'</script>');
for(const [tag,file]of [['STYLE','synchronizing.css'],['MODEL','synchronizing-model.js'],['PRINCIPLE','princip-model.js'],['BASIS','field-basis.js'],['CONTOURS','../magnetic-field/contours.js'],['FIELD','field-lines.js'],['ART','machine-art.js'],['MATH','math-typesetting.js'],['UI','synchronizing.js']])html=html.replace('/*'+tag+'*/',()=>(tag==='UI'?fs.readFileSync(path.join(dir,'../machine-sound.js'),'utf8')+'\n':'')+fs.readFileSync(path.join(dir,file),'utf8'));
fs.writeFileSync(path.join(dir,'synchronizing.html'),html);
console.log('Built generator synchronizing lesson');
