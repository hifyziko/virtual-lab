/* Fusion shares the catalog, hash routing, search and disposal of the other lessons. */
(()=>{'use strict';
 const entries=[
  {id:'fu02-galerie',group:'fusion',topic:'basics',num:'01',title:'Galerie částic, jader a atomů',description:'Částice, složení jader a elektronové obaly na jednom místě. Vyberte model a otáčejte jím.',page:'fuze-seznam/index.html',kind:'Interaktivní galerie'},
  {id:'fu01-reakce',group:'fusion',topic:'basics',num:'02',title:'Fúzní reakce a coulombovská bariéra',description:'Přibližování jader, průchod bariérou a názorné ukázky jaderných reakcí.',page:'fuze-bariera/index.html',kind:'Interaktivní experiment'},
  {id:'fu12-lawson',group:'fusion',topic:'basics',num:'03',title:'Lawsonovo kritérium',description:'Změř dobu chladnutí plazmatu a zjisti, jak hustota a teplota paliva ovlivňují podmínku zapálení.',page:'fuze-lawson/index.html',kind:'Interaktivní experiment'},
  {id:'fu07-plazma',group:'fusion',topic:'basics',num:'04',title:'Plyn, ionizovaný plyn a plazma',description:'Od jediného atomu k souboru částic: teplota, ionizace, vlastní elektrické pole a odezva na magnetické pole.',page:'fuze-plazma/index.html',kind:'Interaktivní experiment'},
  {id:'fu03-drift',group:'fusion',topic:'basics',num:'05',title:'Drift částic v poli',description:'Vlet do magnetického pole, gyrace a E×B drift, grad-B drift i drift zakřivení.',page:'fuze-drift/index.html',kind:'Interaktivní experiment'},
  {id:'fu17-rozptyl',group:'fusion',topic:'basics',num:'06',title:'Coulombovský rozptyl a kolizní relaxace',description:'Porovnej dva průlety kolem deuteronu a sleduj, proč rychlejší elektrony mění svůj směr pomaleji.',page:'fuze-rozptyl/index.html',kind:'Interaktivní experiment'},
  {id:'fu14-milniky',group:'fusion',topic:'basics',num:'07',title:'Energetické milníky fúze',description:'Měň bilanci plazmatu a účinnosti elektrárny. Sleduj, kdy se tok elektřiny v síti obrátí.',page:'fuze-milniky/index.html',kind:'Interaktivní experiment'},
  {id:'fu15-vodivost',group:'fusion',topic:'basics',num:'08',title:'Teplotní závislost měrného odporu kovu a plazmatu',description:'Zahřej kov i plazma a porovnej kmity mřížky, rozptyl elektronů a měrný elektrický odpor.',page:'fuze-vodivost/index.html',kind:'Interaktivní experiment'},
  {id:'fu04-udrzeni',group:'fusion',topic:'tokamak',num:'01',title:'Magnetické udržení',description:'Solenoid, magnetické zrcadlo, uzavření do toroidu a skládání helikálního magnetického pole.',page:'fuze-udrzeni/index.html',kind:'Interaktivní experiment'},
  {id:'fu09-princip',group:'fusion',topic:'tokamak',num:'02',title:'Princip tokamaku',description:'Sestavte tokamak a změnou proudu solenoidem stočte magnetické siločáry.',page:'fuze-rovnovaha/princip.html',kind:'Interaktivní experiment'},
  {id:'fu10-compass',group:'fusion',topic:'tokamak',num:'03',title:'COMPASS-U',description:'Sestavení celého tokamaku, průlet vnitřní sestavou a plánované parametry pražského zařízení.',page:'compass-u/index.html',kind:'Animace a parametry'},
  {id:'fu06-divertor',group:'fusion',topic:'tokamak',num:'04',title:'Tokamak: pole a plazma',description:'Cívky a konstrukce tokamaku, rovnováha plazmatu, magnetické povrchy a divertor.',page:'fuze-rovnovaha/divertor.html',kind:'Interaktivní experiment'},
  {id:'fu20-rezonance',group:'fusion',topic:'tokamak',num:'05',title:'Bezpečnostní faktor a ohyb siločar',description:'Vyber tvar deformace a změnou bezpečnostního faktoru najdi siločáru, podél které výchylka zůstává stejná.',page:'fuze-rezonance/index.html',kind:'Interaktivní experiment'},
  {id:'fu11-rekonexe',group:'fusion',topic:'tokamak',num:'06',title:'Magnetické přepojení a vznik ostrova',description:'Od poruchy proudu přes přepojení magnetických ploch až k prostorovému ostrovu.',page:'fuze-ostrovy/vznik.html',kind:'Interaktivní experiment'},
  {id:'fu18-injektor',group:'fusion',topic:'tokamak',num:'07',title:'NBI – injektor neutrálního svazku',description:'Sleduj vznik záporného iontu, jeho urychlení a neutralizaci. Porovnej dráhy svazku s plynem a bez něj.',page:'fuze-injektor/index.html',kind:'Interaktivní experiment'},
  {id:'fu15-nbi',group:'fusion',topic:'tokamak',num:'08',title:'NBI – ohřev plazmatu',description:'Sleduj průnik neutrálního deuteria, dráhu iontu a předávání energie elektronům a iontům.',page:'fuze-nbi/index.html',kind:'Interaktivní experiment'},
  {id:'fu13-ohrev',group:'fusion',topic:'tokamak',num:'09',title:'Vlnový ohřev plazmatu',description:'Nalaď mikrovlnný svazek na rezonanci a sleduj přenos energie do gyrace elektronu.',page:'fuze-ohrev/index.html',kind:'Interaktivní experiment'},
  {id:'fu16-eccd',group:'fusion',topic:'tokamak',num:'10',title:'ECCD – neindukční vlečení proudu',description:'Obrať náklon mikrovlnného svazku a sleduj, které elektrony získají energii a kam poteče proud.',page:'fuze-eccd/index.html',kind:'Interaktivní experiment'},
  {id:'fu19-tvar',group:'fusion',topic:'tokamak',num:'11',title:'Proč má plazma v tokamaku tvar D?',description:'Zvětši elongaci plazmatu a najdi proud, při kterém siločára znovu vykoná tři toroidální oběhy na jeden poloidální oběh.',page:'fuze-tvar/index.html',kind:'Interaktivní experiment'}
 ];
 const topics=[
  {id:'basics',title:'Základy plazmatu a fúze',label:'Základy',description:'Částice, plazma, pohyb v poli a principy fúzních reakcí.'},
  {id:'tokamak',title:'Magnetické udržení a tokamak',label:'Tokamak',description:'Magnetické konfigurace, rovnováha plazmatu a nestability.'}
 ];
 function topicMarkup(topic,openTopic){const items=entries.filter(entry=>entry.topic===topic.id);return '<details name="fusion-directory-topic" class="group-block topic-group fusion-topic" data-fusion-subgroup="'+topic.id+'" data-fusion-theme="'+topic.id+'" id="fusion-'+topic.id+'"'+(topic.id===openTopic?' open':'')+'><summary class="group-banner"><div><h2>'+topic.title+'</h2><p>'+topic.description+'</p></div><span class="topic-count">'+items.length+(items.length<5?' moduly':' modulů')+'</span></summary><div class="cards">'+items.map(entry=>'<a class="card ready fusion-card" data-fusion-theme="'+topic.id+'" href="#'+entry.id+'"><div class="cardfoot"><span class="num">'+entry.num+'</span><span class="badge fusion-theme-label">'+topic.label+'</span></div><h3'+(entry.id==='fu19-tvar'?' data-plain-text':'')+'>'+entry.title+'</h3><p>'+entry.description+'</p><div class="cardfoot"><span>'+(entry.kind==='Interaktivní galerie'?'Otevřít galerii':entry.kind==='Animace a parametry'?'Otevřít ukázku':'Otevřít experiment')+'</span><span aria-hidden="true">↗</span></div></a>').join('')+'</div></details>';}
 const aliases={"fu02-jadra":"nuclei","fu03-atomy":"atoms","fu04-castice":"particles"};
 const routes=[...entries,{...entries.find(e=>e.id==='fu11-rekonexe'),id:'fu08-ostrovy',sourceId:'fu11-rekonexe'},{...entries.find(e=>e.id==='fu06-divertor'),id:'fu05-rovnovaha',sourceId:'fu06-divertor'},...Object.entries(aliases).map(([id,mode])=>({...entries.find(entry=>entry.id==='fu02-galerie'),id,mode,sourceId:'fu02-galerie'}))];
 let returnTopic=location.search ? routes.find(entry=>entry.id===new URLSearchParams(location.search).get('fromFusion'))?.topic : null;
 for(const entry of routes)Lab.register({...entry,mount(app){
  returnTopic=entry.topic;
  // The responsive iframe owns its viewport; native canvas fitting would force
  // height:auto on its host and collapse the frame to the browser's 150px default.
  const shell=document.createElement('section');shell.className='fusion-module-shell imported-workspace';shell.setAttribute('data-fusion-lesson',entry.id);
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
  const tile=template.content.querySelector('.physics-area-link[href="#group-area-plasma"]');
  if(tile){
   const notice=document.createElement('span');
   notice.className='fusion-review-notice';
   notice.textContent='Pracovní verze – odborná revize dosud neproběhla.';
   tile.append(notice);
  }
  const area=template.content.querySelector('#group-area-plasma');
  if(area){
   const group=document.createElement('section');group.className='fusion-topic-groups';group.id='group-fusion';group.setAttribute('aria-label','Témata plazmatu a fúze');const openTopic=['','#group-area-plasma','#group-fusion','#home'].includes(location.hash)?returnTopic:null;group.innerHTML=topics.map(topic=>topicMarkup(topic,openTopic)).join('');
   area.querySelector('.physics-area-heading').after(group);
   const proposed=area.querySelector('.physics-proposals');
   if(proposed){const more=document.createElement('details');more.className='fusion-future';more.setAttribute('name','fusion-directory-topic');const summary=document.createElement('summary');summary.textContent='Další připravovaná témata';more.append(summary);proposed.before(more);more.append(proposed);const note=more.nextElementSibling;if(note?.textContent.includes('Interaktivní moduly zde ještě nejsou'))note.remove();}
  }
  const footer=template.content.querySelector('.homefooter');
  if(footer)footer.insertAdjacentHTML('beforeend','<br><a href="#fu01-reakce">Fúzní reakce a coulombovská bariéra</a> · <a href="#fu02-galerie">Galerie částic, jader a atomů</a>');
  return template.innerHTML;
 };
 Lab.route();
})();
