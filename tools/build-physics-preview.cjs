/* Build a preview, or apply the approved design with --activate. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const visual=process.argv.includes('--visual');
const activate=process.argv.includes('--activate');
const root=path.resolve(__dirname,'..'),version=activate?'aktualni':visual?'1.8.0-fyzika-vizual':'1.8.0-fyzika-preview';
const source=path.join(root,'versions/aktualni'),dest=path.join(root,'versions',version);
if(fs.existsSync(dest)&&!activate&&!process.argv.includes('--update-preview'))throw Error('Preview already exists; pass --update-preview to update this experimental preview only.');
let html=fs.readFileSync(path.join(source,'web/index.html'),'utf8');
html=html.replace(/<style id="physics-(?:preview|visual)-style">[\s\S]*?<\/style>/g,'').replace(/<script id="physics-(?:preview|visual)">[\s\S]*?<\/script>/g,'');
let js=fs.readFileSync(path.join(__dirname,'physics-preview.js'),'utf8');
if(activate)js=js.replace(/footer\.innerHTML = '[^']*';/,"footer.innerHTML = 'Virtuální laboratoř fyziky · Verze 1.0 · Interaktivní výuka v češtině · Dostupná také offline<br>Číselné modely jsou výukové idealizace.';");
new vm.Script(js);
const css=fs.readFileSync(path.join(__dirname,'physics-preview.css'),'utf8');
html=html.replaceAll('Virtuální laboratoř elektrických strojů','Virtuální laboratoř fyziky');
html=html.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="Interaktivní principy a technické aplikace. Elektřina a magnetismus, elektrické stroje a návrh oblasti plazmatu a fúze.">');
html=html.replace('</head>',()=>'<style id="physics-preview-style">'+css+'</style></head>');
html=html.replace('</body>',()=>'<script id="physics-preview">'+js+'</script></body>');
if(visual){
 let visualJS=fs.readFileSync(path.join(__dirname,'physics-visual.js'),'utf8');
 if(activate)visualJS=visualJS.replace("root.querySelector('.homefooter').prepend(comparison);",'');
 new vm.Script(visualJS);
 html=html.replace('</head>',()=>'<style id="physics-visual-style">'+fs.readFileSync(path.join(__dirname,'physics-visual.css'),'utf8')+'</style></head>');
 html=html.replace('</body>',()=>'<script id="physics-visual">'+visualJS+'</script></body>');
}
fs.mkdirSync(dest,{recursive:true});
if(!activate)fs.cpSync(path.join(source,'web'),path.join(dest,'web'),{recursive:true});
fs.writeFileSync(path.join(dest,'web/index.html'),html);
fs.mkdirSync(path.join(dest,'preview-source'),{recursive:true});
for(const name of ['physics-preview.js','physics-preview.css','build-physics-preview.cjs',...(visual?['physics-visual.js','physics-visual.css']:[])])fs.copyFileSync(path.join(__dirname,name),path.join(dest,'preview-source',name));
const files=[];
function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())scan(f);else{const data=fs.readFileSync(f);files.push({path:path.relative(path.join(dest,'web'),f).replaceAll('\\','/'),bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});}}}
scan(path.join(dest,'web'));
fs.writeFileSync(path.join(dest,'manifest.json'),JSON.stringify({version:activate?'1.0':version,channel:version,date:'2026-11-12',entry:'web/index.html',bytes:files.reduce((n,f)=>n+f.bytes,0),files},null,2));
if(!activate)fs.copyFileSync(path.join(source,'COPYRIGHT.md'),path.join(dest,'COPYRIGHT.md'));
fs.writeFileSync(path.join(dest,'CTETE.txt'),'Zkušební členění Virtuální laboratoře fyziky. Otevřete web/index.html. Aktuální aplikace zůstává beze změny. Elektrostatika a plazma/fúze jsou náměty, nikoli hotové simulace. Pro přenos použijte celou složku web. Zdroj úprav: tools/physics-preview.*; vytvoření: node tools/build-physics-preview.cjs (z aktuální dodávky, bez přepsání existujícího náhledu).');
console.log(JSON.stringify({version,files:files.length,entry:path.join(dest,'web/index.html')}));
if(activate){
 fs.writeFileSync(path.join(dest,'CTETE.txt'),'Virtuální laboratoř fyziky — verze 1.0. Otevřete web/index.html. Sestavení z kořene projektu: node tools/build-release.cjs. Schválený vizuální rozcestník se přidává automaticky. Elektrostatika a plazma/fúze jsou zatím náměty.');
 const mirror=path.join(root,'versions/vyvoj/versions/aktualni');
 fs.cpSync(path.join(dest,'web'),path.join(mirror,'web'),{recursive:true});
 for(const name of ['manifest.json','CTETE.txt'])fs.copyFileSync(path.join(dest,name),path.join(mirror,name));
}
