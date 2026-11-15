const fs=require('fs'),path=require('path');
const dir=__dirname,ui=fs.readFileSync(path.join(dir,'ui.js'),'utf8').replace('DENSE_LINES',fs.readFileSync(path.join(dir,'field-lines.json'),'utf8')),css=fs.readFileSync(path.join(dir,'style.css'),'utf8');
for(const [id,name] of [['EM01','EM01_indukovane_napeti.html'],['EM02','EM02_vlastni_vzajemna_indukcnost.html']]){
 const file=path.join(dir,'..',name);let s=fs.readFileSync(file,'utf8');const start=s.indexOf('const C=DATA.config'),end=s.indexOf('</script>',start);if(start<0||end<0)throw Error('Missing app script');s=s.slice(0,start)+ui+s.slice(end);
 s=s.replace(/<style id="em-refinement">[\s\S]*?<\/style>/,'').replace('</head>',()=>'<style id="em-refinement">'+css+'</style></head>');
 s=s.replace(/<linearGradient id="copper"[\s\S]*?<\/linearGradient>/,'<linearGradient id="copper" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#8c3615"/><stop offset=".15" stop-color="#f7ad40"/><stop offset=".35" stop-color="#ffe2a2"/><stop offset=".60" stop-color="#e77527"/><stop offset=".86" stop-color="#aa4219"/><stop offset="1" stop-color="#6e301d"/></linearGradient>');
 if(!s.includes('id="coilEnd"'))s=s.replace('<clipPath id="sceneClip">','<radialGradient id="coilEnd"><stop stop-color="#ffe9a7"/><stop offset=".65" stop-color="#e58936"/><stop offset="1" stop-color="#883d20"/></radialGradient><clipPath id="sceneClip">');
 if(!s.includes('id="fieldVisibility"'))s=s.replace('<div class="sceneBox">','<div class="viewControls"><label><input id="fieldVisibility" type="checkbox" checked> Siločáry</label></div><div class="sceneBox">');
 if(!s.includes('id="referenceInfo"'))s=s.replace('<div class="chartBox">','<div class="presets" aria-label="Význačné polohy">'+[0,90,180, ...(id==='EM01'?[270]:[])].map(a=>'<button data-angle="'+a+'">'+a+'°</button>').join('')+'</div><div class="chartBox">').replace('<g id="chartPointer"></g></svg></div>','<g id="chartPointer"></g></svg></div><p class="referenceInfo" id="referenceInfo"></p>');
 // The view shows two representative turns; numerical N remains explicitly effective.
 s=s.replace('min="20" max="250" step="10"','min="2" max="250" step="1"').replace('min="20" max="180" step="10"','min="2" max="180" step="1"').replaceAll('<span>20</span>','<span>2</span>');
 if(id==='EM02')s=s.replace(/<button[^>]*data-mode="(?:self|mutual)"[^>]*>[\s\S]*?<\/button>/g,'');
 s=s.replace('Časové průběhy jsou normalizovány; skutečné hodnoty jsou vpravo.','Modrá: levá osa · červená: pravá osa. Měřítka se změnou N₁ ani N₂ nemění.').replace('Skutečně integrovaná vazba · bez předpokladu M₀ cos α','Modrá: levá osa · červená: pravá osa. Pevná měřítka pro změny N₁ a N₂.').replace('L₁/L₁,₀ (stálá)','L₁ · vlastní indukčnost').replace('M₂₁/M₂₁(0)','M₂₁ · vzájemná indukčnost');
 if(id==='EM01'&&!s.includes('id="voltageAmplitude"'))s=s.replace('<div class="chartBox">','<div class="amplitudeReadout" id="voltageAmplitude"></div><div class="scaleControls"><label><input type="checkbox" id="autoScale"> Automatické měřítko</label><button id="fitScale" type="button">Přizpůsobit měřítko</button></div><p id="scaleWarning" class="scaleWarning" role="status"></p><div class="chartBox">');
 if(id==='EM01')s=s.replace('Modrá: levá osa · červená: pravá osa. Měřítka se změnou N₁ ani N₂ nemění.','Modrá: toková vazba · červená: napětí. Výchozí měřítko je pevné.');
 if(id==='EM01'){
 s=s.replaceAll('<b>B</b>','<span data-tex="\\mathbf B"></span>').replaceAll('<b>B·n₂</b>','<span data-tex="\\mathbf B\\cdot\\mathbf n_2"></span>').replaceAll('<b>n₂</b>','<span data-tex="\\mathbf n_2"></span>');

 for(const [plain,tex] of [['Toková vazba Ψ₂₁','Toková vazba <span data-tex="\\Psi_{21}"></span>'],['Indukované napětí uᵢ','Indukované napětí <span data-tex="u_i"></span>'],['Budicí proud i₁','Budicí proud <span data-tex="i_1"></span>'],['Natočení α','Natočení <span data-tex="\\alpha"></span>']])s=s.replaceAll(plain,tex);

 s=s.replace(/<label><input type="checkbox" id="autoScale"> Automatické měřítko<\/label>/g,'').replace('Modrá: toková vazba · červená: napětí. Výchozí měřítko je pevné.','Modrá: toková vazba · červená: napětí. Rozsah se rozšíří při překročení osy.');
 if(!s.includes('id="currentPreview"'))s=s.replace('<div class="phasebox">','<div class="currentPreviewBox"><h3>Jak se mění budicí proud</h3><svg id="currentPreview" viewBox="0 0 560 195" role="img" aria-label="Názorná sinusovka: amplituda proudu a hustota vln"></svg><p>Výška odpovídá proudu, osa ±3 A je pevná. Čas je schematický; hustota vln ukazuje změnu frekvence, neslouží k jejímu odečtu.</p></div><div class="phasebox">');
 }
 if(id==='EM02'){
 s=s.replaceAll('M₂₁','M').replaceAll('M_{21}','M');
 s=s.replace('Modrá: levá osa · červená: pravá osa. Rozsah se rozšíří při překročení osy.','Modrá: levá osa · červená: pravá osa. Pevná měřítka pro celý rozsah závitů.');
 s=s.replace(/<div class="scaleControls">[\s\S]*?<\/div><p class="scaleWarning">[\s\S]*?<\/p>/g,'');
 }
 s=s.replace(/<label>Pohled <select id="viewMode">[\s\S]*?<\/select><\/label>/g,'');
 fs.writeFileSync(file,s);fs.writeFileSync(file.replace('.html','_rez.html'),s);console.log(id,Buffer.byteLength(s),'bytes');
}
