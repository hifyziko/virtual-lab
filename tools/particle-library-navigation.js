/* Fusion shares the catalog, hash routing, search and disposal of the other lessons. */
(()=>{'use strict';
 const entries=[
  {id:'fu07-plazma',group:'fusion',topic:'basics',num:'01',title:'Plyn, ionizovaný plyn a plazma',description:'Od jediného atomu k souboru částic: teplota, ionizace, vlastní elektrické pole a odezva na magnetické pole.',page:'fuze-plazma/index.html',kind:'Interaktivní experiment'},
  {id:'fu01-reakce',group:'fusion',topic:'basics',num:'02',title:'Fúzní reakce a Coulombova bariéra',description:'Přibližování jader, průchod bariérou a názorné ukázky jaderných reakcí.',page:'fuze-bariera/index.html',kind:'Interaktivní experiment'},
  {id:'fu03-drift',group:'fusion',topic:'basics',num:'03',title:'Drift částic v poli',description:'Vlet do magnetického pole, gyrace a E×B drift, grad-B drift i drift zakřivení.',page:'fuze-drift/index.html',kind:'Interaktivní experiment'},
  {id:'fu09-princip',group:'fusion',topic:'tokamak',num:'01',title:'Princip tokamaku',description:'Sestavte tokamak a změnou proudu solenoidem stočte magnetické siločáry.',page:'fuze-rovnovaha/princip.html',kind:'Interaktivní experiment'},
  {id:'fu04-udrzeni',group:'fusion',topic:'tokamak',num:'02',title:'Magnetické udržení',description:'Solenoid, magnetické zrcadlo, uzavření do toroidu a skládání helikálního magnetického pole.',page:'fuze-udrzeni/index.html',kind:'Interaktivní experiment'},
  {id:'fu06-divertor',group:'fusion',topic:'tokamak',num:'03',title:'Tokamak: pole a plazma',description:'Cívky a konstrukce tokamaku, rovnováha plazmatu, magnetické povrchy a divertor.',page:'fuze-rovnovaha/divertor.html',kind:'Interaktivní experiment'},
  {id:'fu11-rekonexe',group:'fusion',topic:'tokamak',num:'04',title:'Magnetické přepojení a vznik ostrova',description:'Od poruchy proudu přes přepojení magnetických ploch až k prostorovému ostrovu.',page:'fuze-ostrovy/vznik.html',kind:'Interaktivní experiment'},
  {id:'fu10-compass',group:'fusion',topic:'tokamak',num:'05',title:'COMPASS-U',description:'Sestavení celého tokamaku, průlet vnitřní sestavou a plánované parametry pražského zařízení.',page:'compass-u/index.html',kind:'Animace a parametry'},
  {id:'fu13-ohrev',group:'fusion',topic:'tokamak',num:'06',title:'Vlnový ohřev plazmatu',description:'Nalaď mikrovlnný svazek na rezonanci a sleduj přenos energie do gyrace elektronu.',page:'fuze-ohrev/index.html',kind:'Interaktivní experiment'},
  {id:'fu12-lawson',group:'fusion',topic:'basics',num:'04',title:'Lawsonovo kritérium',description:'Změř dobu chladnutí plazmatu a zjisti, jak hustota a teplota paliva ovlivňují podmínku zapálení.',page:'fuze-lawson/index.html',kind:'Interaktivní experiment'},
  {id:'fu14-milniky',group:'fusion',topic:'basics',num:'05',title:'Energetické milníky fúze',description:'Měň bilanci plazmatu a účinnosti elektrárny. Sleduj, kdy se tok elektřiny v síti obrátí.',page:'fuze-milniky/index.html',kind:'Interaktivní experiment'},
  {id:'fu02-galerie',group:'fusion',topic:'basics',num:'06',title:'Galerie částic, jader a atomů',description:'Částice, složení jader a elektronové obaly na jednom místě. Vyberte model a otáčejte jím.',page:'fuze-seznam/index.html',kind:'Interaktivní galerie'}
 ];
 const topics=[
  {id:'basics',title:'Základy plazmatu a fúze',label:'Základy',description:'Částice, plazma, pohyb v poli a principy fúzních reakcí.'},
  {id:'tokamak',title:'Magnetické udržení a tokamak',label:'Tokamak',description:'Magnetické konfigurace, rovnováha plazmatu a nestability.'}
 ];
 function topicMarkup(topic){const items=entries.filter(entry=>entry.topic===topic.id);return '<details class="group-block topic-group fusion-topic" data-fusion-subgroup="'+topic.id+'" data-fusion-theme="'+topic.id+'" id="fusion-'+topic.id+'"'+(['#group-area-plasma','#group-fusion'].includes(location.hash)?' open':'')+'><summary class="group-banner"><div><h2>'+topic.title+'</h2><p>'+topic.description+'</p></div><span class="topic-count">'+items.length+(items.length<5?' moduly':' modulů')+'</span></summary><div class="cards">'+items.map(entry=>'<a class="card ready fusion-card" data-fusion-theme="'+topic.id+'" href="#'+entry.id+'"><div class="cardfoot"><span class="num">'+entry.num+'</span><span class="badge fusion-theme-label">'+topic.label+'</span></div><h3>'+entry.title+'</h3><p>'+entry.description+'</p><div class="cardfoot"><span>'+(entry.kind==='Interaktivní galerie'?'Otevřít galerii':entry.kind==='Animace a parametry'?'Otevřít ukázku':'Otevřít experiment')+'</span><span aria-hidden="true">↗</span></div></a>').join('')+'</div></details>';}
 const aliases={"fu02-jadra":"nuclei","fu03-atomy":"atoms","fu04-castice":"particles"};
 const routes=[...entries,{...entries.find(e=>e.id==='fu11-rekonexe'),id:'fu08-ostrovy',sourceId:'fu11-rekonexe'},{...entries.find(e=>e.id==='fu06-divertor'),id:'fu05-rovnovaha',sourceId:'fu06-divertor'},...Object.entries(aliases).map(([id,mode])=>({...entries.find(entry=>entry.id==='fu02-galerie'),id,mode,sourceId:'fu02-galerie'}))];
 for(const entry of routes)Lab.register({...entry,mount(app){
  // The responsive iframe owns its viewport; native canvas fitting would force
  // height:auto on its host and collapse the frame to the browser's 150px default.
  const shell=document.createElement('section');shell.className='fusion-module-shell imported-workspace';
  const loading=document.createElement('div');loading.className='lab-loading fusion-module-loading';loading.setAttribute('role','status');
  loading.innerHTML='<a class="back" href="#group-area-plasma">← Jaderná fúze a tokamaky</a><h1>'+entry.title+'</h1><p>Načítání modulu…</p><progress aria-label="Načítání modulu"></progress>';
  const frame=document.createElement('iframe');frame.className='fusion-module-frame';frame.title=entry.title;frame.setAttribute('allow','fullscreen');frame.setAttribute('allowfullscreen','');
  shell.append(loading,frame);app.classList.add('fusion-module-host');app.replaceChildren(shell);
  let disposed=false,loaded=false;
  const finish=()=>{if(disposed||loaded)return;loaded=true;clearTimeout(timer);loading.remove();frame.classList.add('is-ready');
   const doc=frame.contentDocument,full=doc?.querySelector('[data-fusion-full]');
   if(full&&window.ModuleGuide){window.ModuleGuide.collect(doc.body);window.ModuleGuide.prepareHeading(full.parentElement,full);}
  };
  const failed=()=>{
   if(disposed||loaded)return;
   loading.querySelector('p').textContent='Modul se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.';loading.querySelector('progress')?.remove();
   if(!loading.querySelector('button')){const retry=document.createElement('button');retry.textContent='Zkusit znovu';retry.onclick=()=>Lab.route();loading.append(retry);}
  };
  const ready=event=>{if(event.source===frame.contentWindow&&event.data?.type==='virtual-lab:fusion-ready'&&event.data.id===entry.id)finish();};
  const timer=setTimeout(failed,120000);window.addEventListener('message',ready);frame.onerror=failed;
  let source=LabProgress.value('fusion-'+(entry.sourceId||entry.id));
  if(entry.sourceId)source=source.replace('data-fusion-page="'+entry.sourceId+'"','data-fusion-page="'+entry.id+'"').replace('data-gallery-initial="all"','data-gallery-initial="'+entry.mode+'"');
  frame.srcdoc=source;
  Lab.dispose=()=>{disposed=true;clearTimeout(timer);window.removeEventListener('message',ready);frame.onload=frame.onerror=null;try{frame.contentWindow.HiFyzikoFusionDispose?.();}catch{}frame.remove();app.classList.remove('fusion-module-host');};
 }});
 Lab.catalog=Lab.catalog.filter(item=>!routes.some(entry=>entry.id===item.id));Lab.catalog.push(...entries);
 const home=Lab.home;
 Lab.home=function(...args){
  const template=document.createElement('template');template.innerHTML=home.apply(this,args);
  const area=template.content.querySelector('#group-area-plasma');
  if(area){
   const group=document.createElement('section');group.className='fusion-topic-groups';group.id='group-fusion';group.setAttribute('aria-label','Témata plazmatu a fúze');group.innerHTML=topics.map(topicMarkup).join('');
   area.querySelector('.physics-area-heading').after(group);
   const proposed=area.querySelector('.physics-proposals');
   if(proposed){const more=document.createElement('details');more.className='fusion-future';const summary=document.createElement('summary');summary.textContent='Další připravovaná témata';more.append(summary);proposed.before(more);more.append(proposed);const note=more.nextElementSibling;if(note?.textContent.includes('Interaktivní moduly zde ještě nejsou'))note.remove();}
  }
  const footer=template.content.querySelector('.homefooter');
  if(footer)footer.insertAdjacentHTML('beforeend','<br><a href="#fu01-reakce">Fúzní reakce a Coulombova bariéra</a> · <a href="#fu02-galerie">Galerie částic, jader a atomů</a>');
  return template.innerHTML;
 };
 const route=Lab.route;
 Lab.route=function(){route.call(this);if(document.readyState==='loading')return;if(['#group-area-plasma','#group-fusion'].includes(location.hash)&&!document.querySelector('#module-search')?.value)for(const topic of document.querySelectorAll('[data-fusion-subgroup]'))topic.setAttribute('open','');};
 Lab.route();
})();
