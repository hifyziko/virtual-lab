const fs=require('fs'),path=require('path'),dir=path.join(__dirname,'synchronous');
let html=fs.readFileSync(path.join(dir,'schema-template.html'),'utf8');
const ref=fs.readFileSync(path.join(__dirname,'../HiFyziko_TR04_pricna_vetev_v8.html'),'utf8');
const css=ref.match(/<style id="katex-typesetting">([\s\S]*?)<\/style>/)[1];
const lib=[...ref.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].trim().startsWith('!function')&&m[1].includes('ParseError'))[1];
html=html.replace('</head>',()=>'<style>'+css+'</style><script>'+lib+'</script></head>');
for(const [tag,file] of [['STYLE','schema.css'],['PRINCIPLE','princip-model.js'],['ART','machine-art.js'],['MODEL','schema-model.js'],['CONSTRUCTION','schema-geometry.js'],['DRAWING','schema-drawing.js'],['PARAMETERS','reactance-controls.js'],['UI','schema.js']])html=html.replace('/*'+tag+'*/',()=>fs.readFileSync(path.join(dir,file),'utf8'));
fs.writeFileSync(path.join(dir,'schema.html'),html);console.log('Built synchronous equivalent circuit');

require('./synchronous/build-torque.cjs')(html,css,lib);

require('./synchronous/build-explorers.cjs')(css,lib);

require('./synchronous/build-transients.cjs')(css,lib);
