/* Fusion shares the catalog, hash routing, search and disposal of the other lessons. */
(()=>{'use strict';
 const entries=[
  {id:'fu01-reakce',group:'fusion',num:'01',title:'Fúzní reakce a Coulombova bariéra',description:'Přibližování jader, průchod bariérou a názorné ukázky jaderných reakcí.',page:'fuze-bariera/index.html',kind:'Interaktivní experiment'},
  {id:'fu02-galerie',group:'fusion',num:'02',title:'Galerie částic, jader a atomů',description:'Částice, složení jader a elektronové obaly na jednom místě. Vyberte model a otáčejte jím.',page:'fuze-seznam/index.html',kind:'Interaktivní galerie'}
 ];
 const aliases={"fu02-jadra":"nuclei","fu03-atomy":"atoms","fu04-castice":"particles"};
 const routes=[...entries,...Object.entries(aliases).map(([id,mode])=>({...entries[1],id,mode,sourceId:entries[1].id}))];
 for(const entry of routes)Lab.register({...entry,mount(app){
  // The responsive iframe owns its viewport; native canvas fitting would force
  // height:auto on its host and collapse the frame to the browser's 150px default.
  const shell=document.createElement('section');shell.className='fusion-module-shell imported-workspace';
  const loading=document.createElement('div');loading.className='lab-loading fusion-module-loading';loading.setAttribute('role','status');
  loading.innerHTML='<a class="back" href="#group-area-plasma">← Plazma a fúze</a><h1>'+entry.title+'</h1><p>Načítání modulu…</p><progress aria-label="Načítání modulu"></progress>';
  const frame=document.createElement('iframe');frame.className='fusion-module-frame';frame.title=entry.title;frame.setAttribute('allow','fullscreen');frame.setAttribute('allowfullscreen','');
  shell.append(loading,frame);app.classList.add('fusion-module-host');app.replaceChildren(shell);
  let disposed=false,loaded=false;
  const finish=()=>{if(disposed||loaded)return;loaded=true;clearTimeout(timer);loading.remove();frame.classList.add('is-ready');};
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
   const group=document.createElement('details');group.className='group-block topic-group fusion-topic';group.id='group-fusion';group.open=location.hash==='#group-area-plasma'||location.hash==='#group-fusion';
   group.innerHTML='<summary class="group-banner"><div><h2>Jádra, atomy a fúzní reakce</h2><p>Od stavby hmoty k překonání bariéry a produktům reakce.</p></div><span class="topic-count">Experiment a galerie</span></summary><div class="cards">'+entries.map(entry=>'<a class="card ready" href="#'+entry.id+'"><div class="cardfoot"><span class="num">'+entry.num+'</span><span class="badge">'+entry.kind+'</span></div><h3>'+entry.title+'</h3><p>'+entry.description+'</p><div class="cardfoot"><span>Otevřít modul</span><span aria-hidden="true">↗</span></div></a>').join('')+'</div>';
   area.querySelector('.physics-area-heading').after(group);
   const proposed=area.querySelector('.physics-proposals');
   if(proposed){const more=document.createElement('details');more.className='fusion-future';const summary=document.createElement('summary');summary.textContent='Další připravovaná témata';more.append(summary);proposed.before(more);more.append(proposed);const note=more.nextElementSibling;if(note?.textContent.includes('Interaktivní moduly zde ještě nejsou'))note.remove();}
  }
  const footer=template.content.querySelector('.homefooter');
  if(footer)footer.insertAdjacentHTML('beforeend','<br><a href="#fu01-reakce">Fúzní reakce a Coulombova bariéra</a> · <a href="#fu02-galerie">Galerie částic, jader a atomů</a>');
  return template.innerHTML;
 };
 const route=Lab.route;
 Lab.route=function(){route.call(this);if(document.readyState==='loading')return;if(location.hash==='#group-area-plasma'&&!document.querySelector('#module-search')?.value)document.querySelector('#group-fusion')?.setAttribute('open','');};
 Lab.route();
})();
