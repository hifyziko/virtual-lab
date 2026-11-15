const fs=require('fs'),path=require('path');
module.exports=function(file){
 let html=fs.readFileSync(file,'utf8').replace(/<!-- direct-current:start -->[\s\S]*?<!-- direct-current:end -->\s*/g,'').replace(/<style id="direct-current-style">[\s\S]*?<\/style>/g,'');
 if(!html.includes("['dc','Stejnosměrné stroje'")){
  const anchor="['drive','Elektrické pohony vozidel'";
  if(!html.includes(anchor))throw Error('Missing home group anchor');
  html=html.replace(anchor,"['dc','Stejnosměrné stroje','Od mechanické komutace přes charakteristiky a řízení k BLDC. Pracovní moduly pro postupné dopracování.'],"+anchor);
 }
 html=html.replace('<span>Otevřít animaci</span>',"<span>${item.group==='dc'&&item.draft?'Otevřít rozpracovaný modul':'Otevřít animaci'}</span>");
 const css=fs.readFileSync(path.join(__dirname,'style.css'),'utf8'),js='window.DCCompensation='+fs.readFileSync(path.join(__dirname,'compensation.json'),'utf8')+';\n'+['../machine-sound.js','geometry.js','field-basis.js','bldc-field-basis.js','coil-field-basis.js','brush-field-basis.js','simple-field-basis.js','visuals.js','composition.js','operating.js','drive.js','commutation.js','winding-commutation.js','bldc.js','armature-winding.js','armature.js','ui.js','lessons.js'].map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n');
 html=html.replace('</head>',()=>'<style id="direct-current-style">'+css+'</style></head>');
 html=html.replace('</body>',()=>`<!-- direct-current:start --><script>${js}</script><!-- direct-current:end -->\n</body>`);
 fs.writeFileSync(file,html);
};

