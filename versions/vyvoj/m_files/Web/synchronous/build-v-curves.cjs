const fs=require('node:fs'),path=require('node:path'),dir=__dirname;
const ref=fs.readFileSync(path.join(dir,'../../HiFyziko_TR04_pricna_vetev_v8.html'),'utf8');
const css=ref.match(/<style id="katex-typesetting">([\s\S]*?)<\/style>/)[1];
const lib=[...ref.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].trim().startsWith('!function')&&m[1].includes('ParseError'))[1];
let html=fs.readFileSync(path.join(dir,'v-curves-template.html'),'utf8').replace('<!--KATEX-->',()=>'<style>'+css+'</style><script>'+lib+'</script>');
for(const [tag,file]of [['STYLE','v-curves.css'],['MATH','math-typesetting.js'],['SCHEMA','schema-model.js'],['GEOMETRY','schema-geometry.js'],['PRINCIPLE','princip-model.js'],['ART','machine-art.js'],['DRAWING','schema-drawing.js'],['MODEL','v-curves-model.js'],['UI','v-curves.js']])html=html.replace('/*'+tag+'*/',()=>fs.readFileSync(path.join(dir,file),'utf8'));
fs.writeFileSync(path.join(dir,'v-curves.html'),html);
console.log('Built V-curves and PQ lesson');
