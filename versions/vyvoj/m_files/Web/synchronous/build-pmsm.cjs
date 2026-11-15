const fs=require('fs'),path=require('path'),dir=__dirname;
const reference=fs.readFileSync(path.join(dir,'../../HiFyziko_TR04_pricna_vetev_v8.html'),'utf8');
const css=reference.match(/<style id="katex-typesetting">([\s\S]*?)<\/style>/)[1];
const lib=[...reference.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].trim().startsWith('!function')&&m[1].includes('ParseError'))[1];
for(const mode of ['phasor','drive']){
 let html=fs.readFileSync(path.join(dir,'pmsm-template.html'),'utf8').replace('/*MODE*/',mode).replace('/*TITLE*/',mode==='phasor'?'PMSM: proud, tok a moment':'PMSM: limity měniče a rozjezd').replace('/*TRANSFER*/',mode==='phasor'?'Ověřit bod v měniči →':'← Bod ve fázorovém diagramu').replace('<!--KATEX-->',()=>'<style>'+css+'</style><script>'+lib+'</script>');
 const layers='<div class="layerbar" id="layers"></div>',load='<select id="loadKind" aria-label="Typ zátěže"><option value="constant">Konstantní zátěž</option><option value="fan">Ventilátorová zátěž</option></select>';
 html=html.replace('/*LAYERS_INLINE*/',mode==='phasor'?layers:'').replace('/*LAYERS_DIALOG*/',mode==='drive'?layers:'').replace('/*RESET_INLINE*/',mode==='phasor'?'<button id="reset">Obnovit</button>':'').replace('/*RESET_SETTINGS*/',mode==='drive'?'<button id="reset">Obnovit výchozí nastavení</button>':'').replace('/*LOAD_KIND_INLINE*/',mode==='phasor'?load:'').replace('/*LOAD_KIND_SETTINGS*/',mode==='drive'?'<label class="load-kind-setting">Typ zátěže '+load+'</label>':'');
 for(const [tag,file]of [['STYLE','pmsm.css'],['PRINCIPLE','princip-model.js'],['GEOMETRY','ipm-geometry.js'],['ART','machine-art.js'],['MATH','math-typesetting.js'],['MODEL','pmsm-model.js'],['UI','pmsm.js']])html=html.replace('/*'+tag+'*/',()=>fs.readFileSync(path.join(dir,file),'utf8'));
 fs.writeFileSync(path.join(dir,'pmsm-'+mode+'.html'),html);
}
console.log('Built PMSM phasor and drive lessons');
