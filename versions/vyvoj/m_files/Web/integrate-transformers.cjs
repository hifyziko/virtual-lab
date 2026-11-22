require('./build-am-resistance.cjs');
require('./build-am-princip.cjs');
require('./build-am-traction.cjs');
require('./build-sync-princip.cjs');
require('./synchronous/build-stability.cjs');
require('./synchronous/build-v-curves.cjs');
require('./synchronous/build-synchronizing.cjs');
require('./build-sync-schema.cjs');
require('./synchronous/build-pmsm.cjs');
require('../em-core/build.cjs');
require('../em-core/build-motional-rod.cjs');
require('./build-vehicle.cjs');
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,dir=path.join(root,'transformator'),file=path.join(root,'interaktivni-elektricke-stroje.html');
// Reappend the extension after all existing catalog and home wrappers on every build.
fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace(/<!-- learning-release:start -->[\s\S]*?<!-- learning-release:end -->\s*/g,''));
const modules=[
 {id:'sm12-synchronizing',group:'sync',num:'08',title:'Fázování generátoru k síti',file:'../synchronous/synchronizing.html',draft:false,description:'Napětí, frekvence, sled fází a okamžik sepnutí. Fázory, třípólový spínač a zpomalený proudový i mechanický přechod.'},
 {id:'sm11-v-curves',group:'sync',num:'07',title:'V-křivky a PQ diagram',file:'../synchronous/v-curves.html',draft:false,description:'Výkon a buzení přepočtené na kotvu. Proudový trojúhelník, V-křivky, PQ diagram, proudové meze a statická stabilita.'},
 {id:'09-synchronni',group:'sync',num:'11',title:'Dynamická stabilita synchronního generátoru',file:'../synchronous/stability.html',description:'Skok mechanického výkonu, kývání rotoru, setrvačnost a tlumení. Propojený pokus, časové průběhy a metoda stejných ploch.'},
 {id:'sm09-pmsm-phasor',group:'sync',num:'07',title:'PMSM: proud, tok a moment',file:'../synchronous/pmsm-phasor.html',draft:false,description:'Natočte proud, najděte maximum momentu a objevte odbuzování. Povrchové a vnořené magnety, napěťový polygon a MTPA.'},
 {id:'sm10-pmsm-drive',group:'sync',num:'08',title:'PMSM: limity měniče a rozjezd',file:'../synchronous/pmsm-drive.html',draft:false,description:'Proudová kružnice, napěťové meze, moment a výkon. MTPA, odbuzování, MTPV a rozjezd zatíženého pohonu.'},
 {id:'sm04-transients',draft:false,group:'sync',num:'04',title:'Přechodové a rázové reaktance',file:'../synchronous/transients.html',description:'Změnové pole vyniklého stroje, budicí obvod a tlumicí klec. Rázový, přechodný a ustálený stav v osách d a q.'},
 {id:'sm05-isolated',draft:false,group:'sync',num:'05',title:'Samostatně pracující generátor',file:'../synchronous/isolated.html',description:'Buzení, rychlost a zátěž: napětí a frekvence generátoru mimo tvrdou síť.'},
 {id:'sm06-torque-origin',draft:false,group:'sync',num:'06',title:'Vznik momentu z fázorového diagramu',file:'../synchronous/torque-origin.html',description:'Činná složka proudu vůči vnitřnímu napětí Ui a její vztah k elektromagnetickému momentu.'},
 {id:'sm03-torque',draft:false,group:'sync',num:'03',title:'Momentová charakteristika',file:'../synchronous/torque.html',description:'Moment od buzení, reluktanční moment a jejich součet. Vnější β a vnitřní β′, parametry a propojený fázorový diagram.'},
 {id:'sm02-schema',group:'sync',num:'01',title:'Náhradní schéma a fázory synchronního stroje',file:'../synchronous/schema.html',description:'Buzení, zátěžný úhel β a reakce kotvy. Propojené schéma a fázory, hladký rotor i vyniklé póly, činný a jalový výkon.'},
 {id:'sm01-princip',group:'sync',num:'02',title:'Princip synchronního stroje',file:'../synchronous/princip.html',description:'Veďte setrvačný rotor polem. Úhel β, zachycení a utržení, buzení, reluktanční moment a tlumicí klec. Vyniklé póly i hladký rotor.'},
 {id:'am05-odpor-rotoru',group:'induction',num:'02',title:'Proč rotor potřebuje odpor?',file:'../induction/resistance.html',description:'Natočte pole vůči jednomu závitu. Sledujte tok, napětí a proud a porovnejte okamžitý a střední moment při změně odporu.'},
 {id:'am04-trakcni',group:'induction',num:'05',title:'Trakční charakteristika AM',file:'../induction/traction.html',description:'Změna frekvence měniče, okamžitý moment, brzdění a oblasti plného toku, výkonu a omezení zvratem.'},
 {id:'am01-princip',group:'induction',num:'01',title:'Princip asynchronního motoru',file:'../induction/princip.html',description:'Porovnejte stejnou klec ze statoru i z rotoru. Měňte skluz a odpor, sledujte magnetická napětí, spřažené toky a rozběh.'},
 {id:'am02-momentova-charakteristika',group:'induction',num:'04',title:'Momentová charakteristika AM',file:'../induction/momentova-charakteristika.html',draft:false,description:'Vinutá kotva a klec, vrstvený model tyče, odpor rotoru a časové i prostorové harmonické.'},
 {id:'em01-indukovane-napeti',group:'electromagnetism',num:'01',title:'Transformační indukované napětí',file:'../../EM01_indukovane_napeti.html',description:'Dvě stojící cívky. Měňte budicí proud a sledujte napětí druhé cívky.'},
 {id:'em01-pohybove-napeti',group:'electromagnetism',num:'02',title:'Pohybové indukované napětí',file:'../../EM01_indukovane_napeti.html',description:'Pohyb tyče, posuv pole a otáčení cívky. Sledujte velikost a polaritu napětí.'},
 {id:'em02-vzajemna-indukcnost',group:'electromagnetism',num:'02',title:'Vlastní a vzájemná indukčnost',file:'../../EM02_vlastni_vzajemna_indukcnost.html',description:'Dvě cívky, jejich vlastní a vzájemná toková vazba. Vliv natočení, proudu a počtu závitů.'},
 {id:'em03-silove-ucinky',group:'electromagnetism',num:'03',title:'Silové účinky mezi vodiči',file:'../../EM03_silove_ucinky_vodicu.html',description:'Tři přesouvatelné vodiče, nezávislé proudy, společné magnetické pole a výsledné síly. Přitahování, odpuzování a rovnováha.'},
 {id:'mag01-magnetizace',group:'materials',num:'01',title:'Magnetizace feromagnetika',file:'../../MAG01_magnetizace_vektory_v5.html',description:'Magnetické domény, jejich růst a rotace, nasycení a vratná B–H charakteristika. Vliv polarity a natočení budicího pole.'},
 {id:'mag02-hystereze',group:'materials',num:'02',title:'Hystereze a pohyb doménové stěny',file:'../../H6_hystereze_stabilni_smycka.html',description:'Remanence, koercivita a ztráty za cyklus. Pružná doménová stěna zachytávaná poruchami materiálu.'},
 {id:'mag03-hysterezni-ztraty',group:'materials',num:'03',title:'Hysterezní ztráty',file:'../../MAG03_hysterezni_ztraty.html',description:'Plocha smyčky jako energie přeměněná na teplo. Magnetická tvrdost, rozkmit indukce a ztráty v jádře transformátoru.'},
 {id:'mag04-virive-proudy',group:'materials',num:'04',title:'Ztráty vířivými proudy',file:'../../H7_virive_proudy_3D_popisky_BE.html',description:'Indukované proudy v jádře a jejich tepelné ztráty. Vliv frekvence, indukce a dělení na izolované plechy.'},
 {id:'hf-skin-proximity',group:'materials',num:'05',title:'Skin a proximity efekt',file:'../../HF1_HF2_skinefekt a proximitiefekt.html',description:'Proudová hustota, pole uvnitř i vně vodičů, hloubka vniku a AC ztráty. Kruh i obdélník, jeden vodič, dvojice i číselně zadaná matice vodičů.'},
 {id:'tr01-matematicky',num:'01',title:'Matematický transformátor',file:'index.html',description:'Společný tok, převod napětí, proudy a ampérzávity při přenosu výkonu.'},
 {id:'tr04-pricna-vetev',num:'02',title:'Příčná magnetizační větev',file:'../../HiFyziko_TR04_pricna_vetev_v8.html',description:'Od ideálního jádra ke konečné permeabilitě: vznik magnetizační reaktance a rozdělení primárního proudu.'},
 {id:'tr05-rozptylova-reaktance',num:'03',title:'Rozptylová reaktance',file:'../../TR05_rozptylova_reaktance_navrh.html',description:'Společný a rozptylový tok obou vinutí, sériové úbytky napětí a zatížení transformátoru. Animované pole a provázané náhradní schéma.'},
 {id:'tr02-magnetizacni',num:'05',title:'Magnetizační proud',file:'TR02_magnetizacni_proud.html',description:'Od napětí a magnetické indukce přes B–H charakteristiku k proudu. Vliv vzduchové mezery.'},
 {id:'tr06-hodinove-cislo',num:'08',title:'Hodinové číslo transformátoru',file:'hodinove-cislo-navrh.html',description:'Od napětí jednotlivých vinutí přes sdružená napětí k hodinovému číslu. Zapojení Y/D/Z a postupná konstrukce fázorů.'},
 {id:'tr03-schema',num:'04',title:'Náhradní schéma transformátoru',file:'nahradni_schema.html',draft:false,description:'Samostatná kapitola: přesun ideálního transformátoru a přepočet impedancí.'},
 {id:'tr08-zkratovy-proud',num:'07',title:'Zkratový proud transformátoru',file:'zkratovy-proud.html',description:'Vznik zkratu, střídavá a stejnosměrná složka proudu, proudové obálky a první špička. Vliv okamžiku zkratu, napětí nakrátko a poměru X/R.'}
];
const foundationOrder=['mag01-magnetizace','mag02-hystereze','em01-indukovane-napeti','em01-pohybove-napeti','em02-vzajemna-indukcnost','em03-silove-ucinky','mag03-hysterezni-ztraty','mag04-virive-proudy','hf-skin-proximity'];
for(const m of modules){const i=foundationOrder.indexOf(m.id);if(i>=0){m.group='electromagnetism';m.num=String(i+1).padStart(2,'0')}}
modules.sort((a,b)=>(foundationOrder.indexOf(a.id)<0?99:foundationOrder.indexOf(a.id))-(foundationOrder.indexOf(b.id)<0?99:foundationOrder.indexOf(b.id)));
let html=fs.readFileSync(file,'utf8').replaceAll("id==='transformer'?Number(a.num)-Number(b.num):0","(id==='transformer'||id==='induction')?Number(a.num)-Number(b.num):0").replaceAll(/C\.mount\(app,\{num:'[^']*',title:'Asynchronní/g,"C.mount(app,{num:'02',title:'Asynchronní").replace(/<!-- transformer-modules:start -->[\s\S]*?<!-- transformer-modules:end -->\s*/,'');
if(!html.includes("['electromagnetism',"))html=html.replace('const groups=[',"const groups=[['electromagnetism','Elektromagnetická indukce','Od změny magnetického toku k indukovanému napětí a vazbě dvou cívek.'],");
html=html.replace(/\/\* induction-art:start \*\/[\s\S]*?\/\* induction-art:end \*\/[\r\n]*/,'');
html=html.replace('Lab.home=function()',()=> '/* induction-art:start */\nLab.groupArt.electromagnetism='+JSON.stringify(fs.readFileSync(path.join(__dirname,'electromagnetism-group.svg'),'utf8'))+';\n/* induction-art:end */\nLab.home=function()');
html=html.replace(/<!-- magnetization-module:start -->[\s\S]*?<!-- magnetization-module:end -->\s*/,'');

// Keep the material-science section and its artwork in the offline home page.
html=html.replaceAll('Magnetické materiály a ztráty','Elektrotechnické materiály a ztráty');
if(!html.includes("['materials',"))html=html.replace('const groups=[',"const groups=[['materials','Elektrotechnické materiály a ztráty','Magnetizace, hystereze, vířivé proudy, skin a proximity efekt.'],");
html=html.replace('Magnetizace, hystereze a vířivé proudy ve střídavém poli.','Magnetizace, hystereze, vířivé proudy, skin a proximity efekt.');
html=html.replace(/\d+ tematických skupin/g,'${groups.length} tematických skupin');
html=html.replace(/\/\* materials-art:start \*\/[\s\S]*?\/\* materials-art:end \*\/[\r\n]*/,'');
const materialArt=fs.readFileSync(path.join(root,'magneticke-materialy.svg'),'utf8');
html=html.replace('Lab.home=function()',()=> '/* materials-art:start */\nLab.groupArt.materials='+JSON.stringify(materialArt)+';\n/* materials-art:end */\nLab.home=function()');

// Merge the former materials and induction sections, including repeated builds.
html=html.replace(/\['materials','[^']*','[^']*'\],?/g,'');
html=html.replace(/\['electromagnetism','[^']*','[^']*'\]/g,"['electromagnetism','Účinky elektrického proudu a elektromagnetická indukce','Magnetizace, indukce, silové účinky a ztráty.']");
const css=fs.readFileSync(path.join(dir,'shared.css'),'utf8');
function cleanLegacyBanner(source){
 // The standalone schema needs its own heading; the embedded lesson uses
 // the host's module header and back button instead.
 source=source.replace(/<header\b[^>]*class=["']schema-header["'][^>]*>[\s\S]*?<\/header>/gi,'');
 source=source.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi,block=>/Hi!|Fyziko/i.test(block)?'':block);
 const match=/<div\b[^>]*class=["'][^"']*\btop\b[^"']*["'][^>]*>/i.exec(source);
 if(match){const tokens=/<\/?div\b[^>]*>/gi;tokens.lastIndex=match.index;let depth=0,m;while((m=tokens.exec(source))){depth+=m[0].startsWith('</')?-1:1;if(depth===0){const block=source.slice(match.index,tokens.lastIndex);if(/Hi!|Fyziko/i.test(block))source=source.slice(0,match.index)+source.slice(tokens.lastIndex);break;}}}
 return source;
}
const payload=modules.map(m=>{let source=cleanLegacyBanner(fs.readFileSync(path.join(dir,m.file),'utf8'));if(m.id.startsWith('em01-'))source=require('../em-core/voltage-lesson.cjs')(source,m);if(m.id==='am02-momentova-charakteristika'){
 const intro=source.match(/<template id="lesson-guide-controls">([\s\S]*?)<\/template>/);
 if(!intro)throw Error('Missing AM controls guide');
 const sections=[];source=source.replace(/<details(?: class="equations")?><summary>(Výpočet momentu|Vrstvený model rotorové tyče)<\/summary>([\s\S]*?)<\/details>/g,(_,title,body)=>{sections.push('<section><h3>'+title+'</h3>'+body+'</section>');return '';});
 if(sections.length!==2)throw Error('Expected both AM theory sections');
 let theory=sections.join('').replace(/\\mathrm\{(tyč|ostatní)\}/g,'\\text{$1}');
 const math=text=>'<span data-tex="'+text+'"></span>';
 for(const [text,tex] of [['384 nebo 416',String.raw`384\,\text{nebo}\,416`],['52',String.raw`52`],['136,5 mm',String.raw`136{,}5\,\mathrm{mm}`],['26,22 mm',String.raw`26{,}22\,\mathrm{mm}`],['5,63 mm',String.raw`5{,}63\,\mathrm{mm}`],['250 mm',String.raw`250\,\mathrm{mm}`],['11 kW',String.raw`11\,\mathrm{kW}`]])theory=theory.replace(text,math(tex));
 source=source.replace(intro[0],'<template id="lesson-guide-content">'+intro[1]+theory+'</template>');
} if(['tr04-pricna-vetev','tr05-rozptylova-reaktance'].includes(m.id))source=require('./energy-experiments/integrate-transformer.cjs')(source);source=source.replace(/<header>[\s\S]*?<\/header>/,'').replace(/<div class="actions"><a class="button primary" href="nahradni_schema.html">Náhradní schéma<\/a><\/div>/,'');let style=m.fem?'':m.group==='sync'?'main{padding:8px 0 16px}':m.group==='induction'?'.hero{display:none}.project-credit{display:none}main{padding:8px 0 16px}':m.id==='tr06-hodinove-cislo'?'.top,main>h1{display:none}main{padding:8px 0 16px}':m.id.startsWith('em')?'.top{display:none}main{padding-top:8px}.hero{display:none}':m.id==='hf-skin-proximity'?'.top{display:none}main{padding-top:8px}':(m.id==='mag02-hystereze'||m.id==='mag03-hysterezni-ztraty'||m.id==='mag04-virive-proudy')?'.hero h1{display:none}.hero p{max-width:none;text-align:left}main{padding:8px 0 20px}#launchInfo{display:none}':m.id==='mag01-magnetizace'?'.top{display:none}main{max-width:1440px;padding:8px 0 20px}.heading h1{display:none}.heading .hint{max-width:none;text-align:left}.heading{margin-bottom:12px}':css;if(m.id==='tr06-hodinove-cislo'||m.group==='electromagnetism')style+='\n'+css;source=source.replace('</head>',()=>'<style>'+style+'</style></head>');return {...m,group:m.group||'transformer',source};});
const script=`\n<!-- transformer-modules:start -->\n<style>
.am-torque-heading-choices,.am-torque-heading-choices label{display:flex;align-items:center;gap:7px}
.am-torque-heading-choices{flex-wrap:wrap}
.am-torque-heading-choices label{font-size:13px;font-weight:600;white-space:nowrap}
.am-torque-heading-choices label[hidden]{display:none}
.am-torque-heading-choices select{min-height:40px;padding:7px 11px;font:600 15px/1.25 system-ui,sans-serif;color:var(--ink);background:#ffdf9e;border:1px solid #a66c22;border-radius:8px;cursor:pointer}
.am-torque-heading-choices select:hover{background:#ffcf78;border-color:#875317}
.sync-schema-heading-controls,.sync-schema-heading-controls label{display:flex;align-items:center;gap:6px}
.sync-schema-heading-controls{flex-wrap:wrap;gap:6px 12px;font-size:13px}
.sync-schema-heading-controls label{white-space:nowrap}
.sync-schema-heading-controls select{font:inherit;padding:5px 8px;border:1px solid #a5c9ba;border-radius:6px;background:#f2f8f5;color:var(--ink)}
.sync-schema-heading-controls label:has(input:disabled){opacity:.55}
</style>\n<script>\n(function(){\nconst entries=${JSON.stringify(payload).replace(/</g,'\\u003c')};\nfor(const entry of entries){Lab.register({id:entry.id,title:entry.title,mount(app){\napp.innerHTML='<div class="workspace imported-workspace'+''+'"><div class="modulehead"><a class="back" href="#group-'+entry.group+'">← '+(entry.group==='induction'?'Asynchronní stroje':entry.group==='sync'?'Synchronní stroje':entry.group==='electromagnetism'?'Účinky elektrického proudu a elektromagnetická indukce':'Transformátory')+'</a><span class="num">'+(Lab.catalog.find(item=>item.id===entry.id)?.num||entry.num)+'</span><h1>'+entry.title+'</h1>'+(entry.draft?'<span class="badge">Rozpracováno</span>':'')+'<div class="actions">'+(entry.id==='am02-momentova-charakteristika'?'<button id="import-guide" type="button" aria-haspopup="dialog" aria-controls="module-guide-dialog">Ovládání a výklad</button>':'')+'<button id="import-fullscreen">Celá obrazovka</button></div></div><iframe id="transformer-frame" class="transformer-frame" title="'+entry.title+'"></iframe></div>';\nif(window.__schemaReturnTarget===entry.id){const back=document.createElement('a');back.className='back';back.href='#tr03-schema';back.textContent='← Zpět k náhradnímu schématu';app.querySelector('.modulehead').after(back);}
const frame=document.getElementById('transformer-frame');
let modeObserver=null;
if(entry.id==='am01-princip'){
 frame.addEventListener('load',()=>{
  const original=frame.contentDocument?.getElementById('releaseRotor');
  const actions=app.querySelector('.modulehead > .actions');
  if(!original||!actions)return;
  const button=document.createElement('button');
  button.type='button';button.textContent=original.textContent;
  button.onclick=()=>original.click();
  actions.prepend(button);original.hidden=true;
 },{once:true});
}
if(entry.id==='hf-skin-proximity'){
 frame.addEventListener('load',()=>{
  modeObserver?.disconnect();
  const tabs=frame.contentDocument?.querySelector('main > .tabs');
  const actions=app.querySelector('.imported-workspace > .modulehead > .actions');
  if(!tabs||!actions)return;
  actions.querySelector('.hf-heading-modes')?.remove();
  const modes=document.createElement('div');
  modes.className='hf-heading-modes';
  modes.setAttribute('role','group');
  modes.setAttribute('aria-label','Režim pokusu');
  const originals=Array.from(tabs.querySelectorAll('button'));
  const buttons=originals.map(original=>{
   const button=document.createElement('button');
   button.type='button';
   button.textContent=original.textContent;
   button.onclick=()=>original.click();
   modes.append(button);
   return button;
  });
  function syncModes(){
   originals.forEach((original,i)=>buttons[i].setAttribute('aria-pressed',
    String(original.getAttribute('aria-selected')==='true'||original.classList.contains('active'))));
  }
  modeObserver=new MutationObserver(syncModes);
  modeObserver.observe(tabs,{subtree:true,attributes:true,attributeFilter:['aria-selected','class']});
  tabs.hidden=true;
  frame.contentDocument.documentElement.classList.add('hf-host-modes');
  actions.prepend(modes);
  syncModes();
 },{once:true});
}
if(entry.id==='am02-momentova-charakteristika'){
 frame.addEventListener('load',()=>{
  const doc=frame.contentDocument;
  const originals=doc?.querySelectorAll('.rotor-choices select');
  if(originals?.length!==2)return;
  const choices=document.createElement('div');
  choices.className='am-torque-heading-choices';
  const fields=[...originals].map(original=>{
   const label=original.parentElement.cloneNode(true);
   const select=label.querySelector('select');
   select.removeAttribute('id');
   select.onchange=()=>{
    original.value=select.value;
    original.dispatchEvent(new Event('change',{bubbles:true}));
   };
   choices.append(label);
   return {original,label,select};
  });
  const sync=()=>{
   for(const {original,label,select} of fields){
    select.value=original.value;
    label.hidden=original.parentElement.hidden;
   }
  };
  frame.contentWindow.addEventListener('am-torque-rotor-change',sync);
  app.querySelector('.imported-workspace > .modulehead > .actions').prepend(choices);
  sync();
 },{once:true});
}
if(entry.id==='sm02-schema'){
 frame.addEventListener('load',()=>{
  const originals=frame.contentDocument?.querySelector('.schema-heading-controls');
  if(!originals)return;
  const toolbar=originals.cloneNode(true);
  toolbar.className='sync-schema-heading-controls';
  const sourceFields=originals.querySelectorAll('select,input');
  const fields=[...toolbar.querySelectorAll('select,input')];
  const sync=()=>{
   fields.forEach((field,i)=>{
    const source=sourceFields[i];
    field.value=source.value;
    if(field.type==='checkbox')field.checked=source.checked;
    field.disabled=source.disabled;
   });
  };
  fields.forEach((field,i)=>{
   const source=sourceFields[i];
   field.removeAttribute('id');
   field.onchange=()=>{
    if(field.type==='checkbox')source.checked=field.checked;
    else source.value=field.value;
    source.dispatchEvent(new Event('change',{bubbles:true}));
   };
  });
  frame.contentWindow.addEventListener('sync-schema-heading-update',sync);
  app.querySelector('.imported-workspace > .modulehead > .actions').prepend(toolbar);
  originals.hidden=true;
  sync();
 },{once:true});
}
if(entry.id==='sm06-torque-origin'){
 frame.addEventListener('load',()=>{
  const child=frame.contentDocument;
  const rotor=child?.getElementById('type'),example=child?.getElementById('losslessExample');
  if(!rotor||!example)return;
  const toolbar=document.createElement('div');
  toolbar.className='sync-schema-heading-controls';
  const label=rotor.closest('label').cloneNode(true);
  const select=label.querySelector('select');
  select.removeAttribute('id');
  select.value=rotor.value;
  select.onchange=()=>{
   rotor.value=select.value;
   rotor.dispatchEvent(new frame.contentWindow.Event('input',{bubbles:true}));
  };
  const button=document.createElement('button');
  button.type='button';
  button.textContent='Hladký rotor bez odporu';
  button.onclick=()=>{example.click();select.value=rotor.value;};
  toolbar.append(label,button);
  app.querySelector('.modulehead > .actions').prepend(toolbar);
  rotor.closest('label').hidden=true;
  example.hidden=true;
 },{once:true});
}
const guideButton=document.getElementById('import-guide');if(guideButton)guideButton.onclick=()=>{const content=frame.contentDocument?.getElementById('lesson-guide-content');if(content&&window.ModuleGuide)window.ModuleGuide.open(content.innerHTML);};
// Set the final logical viewport before the child parses responsive styles.
frame.style.width='1600px';
frame.style.position='relative';
frame.style.left='50%';
frame.style.marginLeft='0px';
frame.style.marginRight='0px';
frame.style.transformOrigin='top center';
frame.style.transform='translateX(-50%)';
const heading=frame.parentElement.querySelector('.modulehead');
heading.style.width='1600px';
heading.style.position='relative';
heading.style.left='50%';
heading.style.transform='translateX(-50%)';
heading.style.marginLeft='0px';
heading.style.marginRight='0px';
frame.style.visibility='hidden';
heading.style.visibility='hidden';
window.prepareModuleFrame?.(frame);
frame.srcdoc=entry.source;
let contentObserver=null,resizeModule=()=>{},resizeFrame=0,disposed=false,fontsReady=false;
if(true){
 frame.style.minHeight='0';
 const measureModule=()=>{\n  if(disposed)return;\n  const doc=frame.contentDocument,main=doc&&doc.querySelector('main');\n  if(!main)return;\n  const footerHeight=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--project-credit-space'))||0;\n  window.prepareImportedViewport?.(frame,doc,window.innerHeight-footerHeight);\n  const viewport=doc.documentElement.style.getPropertyValue('--module-host-height')||(window.innerHeight-footerHeight)+'px';\n  if(doc.documentElement.style.getPropertyValue('--window-height')!==viewport)doc.documentElement.style.setProperty('--window-height',viewport);\n  const frameBounds=frame.getBoundingClientRect();\n  frame.contentWindow.fitAMPrincip?.(window.innerHeight-frameBounds.top-footerHeight);\n  frame.contentWindow.fitSyncPrincip?.();\n  const height=Math.ceil(Math.max(main.getBoundingClientRect().bottom,main.getBoundingClientRect().top+main.scrollHeight)+(frame.contentWindow.scrollY||0)+parseFloat(getComputedStyle(doc.body).paddingBottom||0));\n  if(height<=0)return;\n  if(Math.abs((parseFloat(frame.style.height)||0)-height)>1)frame.style.height=height+'px';\n  window.fitImportedModule?.(frame,main,height);\n  if(fontsReady){frame.style.visibility='visible';heading.style.visibility='visible';}\n };\n resizeModule=()=>{if(!disposed&&!resizeFrame)resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;measureModule();});};
 frame.addEventListener('load',()=>{if(disposed||!frame.isConnected)return;if(contentObserver)contentObserver.disconnect();resizeModule();const main=frame.contentDocument.querySelector('main');if(main){contentObserver=new ResizeObserver(resizeModule);contentObserver.observe(main);}for(const event of ['input','change','click','toggle'])frame.contentDocument.addEventListener(event,resizeModule,true);frame.contentDocument.fonts.ready.then(()=>{fontsReady=true;resizeModule();});});
 window.addEventListener('resize',resizeModule);
}
\nconst framePositionObserver=new MutationObserver(resizeModule);\nframePositionObserver?.observe(document.body,{attributes:true,attributeFilter:['class']});\ndocument.getElementById('import-fullscreen').onclick=()=>{document.body.classList.toggle('fullscreen');resizeModule();};\nLab.dispose=()=>{disposed=true;cancelAnimationFrame(resizeFrame);window.removeEventListener('resize',resizeModule);framePositionObserver?.disconnect();modeObserver?.disconnect();if(contentObserver)contentObserver.disconnect();document.body.classList.remove('fullscreen')};\n}})}\nLab.catalog=Lab.catalog.filter(item=>!entries.some(entry=>entry.id===item.id));\nLab.catalog.unshift(...entries.map(({source,file,...entry})=>({...entry})));\nLab.catalog.find(item=>item.id==='11-transformator').num='06';\nLab.catalog.find(item=>item.id==='10-asynchronni').num='03';\nif(location.hash==='#group-materials')history.replaceState(null,'','#group-electromagnetism');\nLab.route();\n})();\n</script>\n<!-- transformer-modules:end -->\n`;
html=html.replace(/C\.mount\(app,\{num:'\d+',title:'Zapínací proud transformátoru'/,"C.mount(app,{num:'06',title:'Zapínací proud transformátoru'");
html=html.replace('Od integrace napětí k sycení jádra a zapínacímu proudu.','Od matematického modelu přes magnetizační proud a náhradní schéma k zapínání.');
html=html.replace('<span class="badge">Interaktivní modul</span>','<span class="badge">${item.draft?\'Rozpracováno\':\'Interaktivní modul\'}</span>');
const shellCss='\n.imported-workspace{padding-bottom:0}.transformer-frame{display:block;width:100%;height:calc(100dvh - 132px);min-height:560px;border:0;background:var(--bg)}.fullscreen .transformer-frame{height:calc(100dvh - 64px)}@media(max-width:650px){.transformer-frame{height:calc(100dvh - 170px);min-height:600px}}\n';
if(!html.includes('.imported-workspace{'))html=html.replace('</style>',shellCss+'</style>');
html=html.replace("Lab.catalog.filter(m=>m.group===id).map(card)","Lab.catalog.filter(m=>m.group===id).sort((a,b)=>(id==='transformer'||id==='induction')?Number(a.num)-Number(b.num):0).map(card)");
html=html.replace('</body>',()=>script+'</body>');{const mathStart=html.indexOf('/* Shared offline mathematical typesetting for DOM, SVG and canvas labels. */'),mathEnd=html.indexOf('</script>',mathStart);if(mathStart>=0&&mathEnd>mathStart)html=html.slice(0,mathStart)+fs.readFileSync(path.join(root,'powerlab-math.js'),'utf8')+html.slice(mathEnd);}html=html.replace(/"source":("(?:\\.|[^"\\])*")/g,(whole,json)=>{let source;try{source=JSON.parse(json)}catch{return whole}if(!source.includes('id="physics-preview-script"'))return whole;return '"source":'+JSON.stringify(require('./energy-experiments/integrate-transformer.cjs')(source)).replace(/</g,'\\u003c');});html=require('./motor-controls-layout.cjs')(html);html=require('./induction/teaching-build.cjs')(html);html=require('./fullscreen-navigation.cjs')(html);html=require('./project-credit.cjs')(html);fs.writeFileSync(file,html);console.log('Integrated',payload.length,'transformer modules; offline HTML',Buffer.byteLength(html),'bytes');



require('./integrate-machine-fields.cjs');
require('./build-learning-release.cjs');

// Keep the agreed teaching sequence in every rebuilt delivery.
{const page=fs.readFileSync(file,'utf8');fs.writeFileSync(file,page.replace(/<script id="sync-module-order">[\s\S]*?<\/script>/g,'').replace('</body>',()=>"\n<script id=\"sync-module-order\">(()=>{const order=[\"sm01-princip\",\"sm07-dq\",\"sm02-schema\",\"sm06-torque-origin\",\"sm03-torque\",\"sm11-v-curves\",\"sm05-isolated\",\"sm12-synchronizing\",\"sm04-transients\",\"09-synchronni\",\"sm08-rotor-dq\",\"sm09-pmsm-phasor\",\"sm10-pmsm-drive\"];for(const [i,id] of order.entries()){const item=Lab.catalog.find(m=>m.id===id);if(item)item.num=String(i+1).padStart(2,'0');}const items=order.map(id=>Lab.catalog.find(m=>m.id===id)).filter(Boolean);items.push(...Lab.catalog.filter(m=>m.group==='sync'&&!order.includes(m.id)));let i=0;Lab.catalog=Lab.catalog.map(m=>m.group==='sync'?items[i++]:m);Lab.route();})();</script>\n"+'</body>'));}

// Apply the common presentation after all lesson builders and integrations.
require('./unify-module-presentation.cjs').update(file);

// Preserve the shared home icon sizing in regenerated deliveries.
{const target=fs.readFileSync(file,'utf8').replace(/<style id="group-icon-sizing">[\s\S]*?<\/style>/g,'');fs.writeFileSync(file,target.replace('</head>',()=>'<style id="group-icon-sizing">'+fs.readFileSync(path.join(root,'group-icon-sizing.css'),'utf8')+'</style></head>'));}
