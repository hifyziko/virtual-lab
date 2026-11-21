/* Both lessons share the coil model and its precomputed field. */
module.exports = function voltageLesson(source, entry) {
  const motion = entry.id === 'em01-pohybove-napeti';
  const mode = motion ? 'motion' : 'transform';
  const picker = motion ? `<div class="motion-picker rod-view-switch" role="group" aria-label="Pokus">
    <button type="button" data-experiment="coil" aria-pressed="true">Pohyb tyče</button>
    <button type="button" data-experiment="field" aria-pressed="false">Posuv pole</button>
    <button type="button" data-experiment="rotation" aria-pressed="false">Otáčení cívky</button>
  </div>` : '';
  const equation = motion ? String.raw`u_i=-i_1\frac{\mathrm dM}{\mathrm d\alpha}\,\omega`
                          : String.raw`u_i=-M(\alpha)\frac{\mathrm di_1}{\mathrm dt}`;
  const readouts = source.match(/<div class="readouts">[\s\S]*?<\/strong><\/div><\/div>/)[0];
  source = source.replace('<body>', '<body data-voltage="'+mode+'"'+(motion?' class="rod-view-active"':'')+'>')
    .replace(/<title>[^<]+<\/title>/, '<title>'+entry.title+'</title>')
    .replace(/<div class="toolbar"><div class="tabs">[\s\S]*?(?=<button class="tab playbtn")/, picker+'<div class="toolbar"><div class="tabs">')
    .replace('Dva závity a toková vazba',motion?'Otáčení cívky v poli':'Budicí a snímací cívka')
    .replace('<div class="sub">Vypočtené pole B₁ · integrace přes plochu druhé cívky</div>', '')
    .replace(/<section class="card"><h2>Faradayův indukční zákon[\s\S]*?<\/section>/, '')
    .replace('<div class="carddesc" id="sceneExplain">', readouts+'<div class="carddesc" id="sceneExplain">')
    .replace('<div class="phasebox">','<div class="voltage-law" data-tex="'+equation+'"></div><div class="phasebox">');
  const derivation = String.raw`<details class="voltage-theory"><summary>Model dvou cívek a totální diferenciál tokové vazby</summary>
    <p>Toková vazba druhé cívky <span data-tex="\Psi_{21}"></span> závisí na proudu první cívky <span data-tex="i_1"></span> a na úhlu mezi cívkami <span data-tex="\alpha"></span>. Pro pevně zvolené počty závitů platí</p>
    <p data-tex="\Psi_{21}(i_1,\alpha)=M(\alpha)\,i_1"></p>
    <p>Vzájemná indukčnost <span data-tex="M"></span> se mění s natočením. Totální diferenciál vyjadřuje, jak k malé změně vazby přispívá změna proudu a změna úhlu.</p>
    <p data-tex="\mathrm d\Psi_{21}=\frac{\partial\Psi_{21}}{\partial i_1}\,\mathrm di_1+\frac{\partial\Psi_{21}}{\partial\alpha}\,\mathrm d\alpha"></p>
    <p>Podle Faradayova zákona určuje napětí záporná časová derivace tokové vazby. První člen je transformační, druhý pohybový.</p>
    <p data-tex="u_i=-\frac{\mathrm d\Psi_{21}}{\mathrm dt}=-M(\alpha)\frac{\mathrm di_1}{\mathrm dt}-i_1\frac{\mathrm dM}{\mathrm d\alpha}\frac{\mathrm d\alpha}{\mathrm dt}"></p>
    <p>${motion ? 'Při otáčení cívky je budicí proud stálý. Transformační člen je nulový. Napětí závisí na úhlové rychlosti a na tom, jak rychle se s úhlem mění vzájemná indukčnost.' : 'Posuvníkem nebo tažením kolem středu snímací cívky nastavte její natočení. Každý zobrazený průběh platí pro zvolený pevný úhel, při kterém je pohybový člen nulový. Při stejném buzení porovnejte velikost i polaritu napětí.'}</p>
    <p data-tex="${equation}"></p>
    ${motion ? String.raw`<p>Úhlová rychlost je <span data-tex="\omega=\mathrm d\alpha/\mathrm dt"></span>.</p>` : ''}
    <p>Model cívek počítá pole kruhových smyček Biotovým–Savartovým zákonem a tok integrací přes přijímací plochu. Znaménko napětí odpovídá orientaci druhého vinutí.</p>
    </details>`;
  source = source.replace('</main>', derivation+'</main>');
  if (motion) {
    source = source.replace(/<div class="rod-experiment-switch"[^>]*>[\s\S]*?<\/div>/, '')
      .replace('Amplituda i₁','Budicí proud');
  } else {
    source = source.replace(/(<div class="control) hidden(" id="offsetWrap">)[\s\S]*?<\/div><\/div>/, block=>block
      .replace('control hidden','control').replace('Počáteční natočení','Natočení snímací cívky').replace('max="180"','max="360"').replace('180°','360°'))
      .replace(/<!-- motional-rod-(style|panel|script):start -->[\s\S]*?<!-- motional-rod-\1:end -->/g,'');
  }
  return source.replace('</head>', `<style>
    body[data-voltage] .toolbar{display:flex;align-items:flex-start;gap:10px}
    body[data-voltage] .toolbar>.tabs{order:1;margin:0}
    body[data-voltage] .toolbar>.controls{flex:1;display:flex;align-items:flex-start;flex-wrap:wrap}
    body[data-voltage] .controls>.control{flex:1 1 140px;max-width:310px}
    body[data-voltage] .readouts{display:flex;flex-wrap:wrap;gap:5px;margin:3px 0}
    body[data-voltage] .readout{flex:1;padding:4px 7px}
    body[data-voltage] .voltage-theory{display:none}
    body[data-voltage].rod-view-active .rod-relations>span{display:none}
    body[data-voltage].rod-view-active .rod-relations>span[data-primary-law]{display:inline}
    body[data-voltage] .voltage-law{text-align:center;margin:2px}
    body[data-voltage] #sceneExplain,body[data-voltage] main>.foot,
    body[data-voltage="motion"] .currentPreviewBox,
    body[data-voltage="transform"] .presets,body[data-voltage="transform"] .readout:last-child,
    body[data-voltage].rod-view-active .toolbar{display:none!important}
    body[data-voltage] .motion-picker{margin:0 0 5px;padding:0}
    @media(min-width:900px){
      body[data-voltage].em-lesson:not(.rod-view-active) main>.layout{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)!important;gap:7px}
      body[data-voltage].rod-view-active main>.motional-rod-panel{grid-template-rows:auto auto minmax(0,1fr) auto}
      body[data-voltage] .rod-relations{min-height:0;margin:0;padding:4px 8px}
    }
    @media(max-width:899px){body[data-voltage] .layout{grid-template-columns:1fr}body[data-voltage] .layout>.card{grid-column:1;min-height:0}}
  </style></head>`);
};
