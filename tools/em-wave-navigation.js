(()=>{'use strict';
 const entries=[
  {id:'em06-vlna',group:'electromagnetism',num:'12',title:'Anténa a elektromagnetická vlna',description:'Od střídavého proudu v anténě k vyzařování a prostorové elektromagnetické vlně.',page:'em-vlna/index.html',kind:'Interaktivní experiment'},
  {id:'em07-elektron',group:'electromagnetism',num:'13',title:'Příběh elektronu',description:'Od katodové trubice ke kvantovému poli. Prostorové modely a pokusy, které měnily představu o elektronu.',page:'pribeh-elektronu/index.html',kind:'Interaktivní experiment'}
 ];
 for(const entry of entries){
 Lab.register({...entry,mount(app){
  const shell=document.createElement('section');shell.className='fusion-module-shell imported-workspace';
  const loading=document.createElement('div');loading.className='lab-loading fusion-module-loading';loading.innerHTML='<h1>'+entry.title+'</h1><p role="status">Načítání modulu…</p><progress aria-label="Načítání modulu"></progress>';
  const frame=document.createElement('iframe');frame.className='fusion-module-frame';frame.title=entry.title;frame.setAttribute('allow','fullscreen');frame.setAttribute('allowfullscreen','');shell.append(loading,frame);app.classList.add('fusion-module-host');app.replaceChildren(shell);
  let disposed=false,loaded=false;const fail=()=>{if(disposed||loaded)return;loading.querySelector('p').textContent='Modul se nepodařilo načíst.';loading.querySelector('progress')?.remove();if(!loading.querySelector('button')){const b=document.createElement('button');b.textContent='Zkusit znovu';b.onclick=()=>Lab.route();loading.append(b);}};
  const ready=e=>{if(e.source!==frame.contentWindow||e.data?.type!=='virtual-lab:fusion-ready'||e.data.id!==entry.id||disposed)return;loaded=true;clearTimeout(timer);loading.remove();frame.classList.add('is-ready');};
  const timer=setTimeout(fail,30000);window.addEventListener('message',ready);frame.onerror=fail;frame.srcdoc=LabProgress.value('fusion-'+entry.id);
  Lab.dispose=()=>{disposed=true;clearTimeout(timer);window.removeEventListener('message',ready);try{frame.contentWindow.HiFyzikoFusionDispose?.();}catch{}frame.remove();app.classList.remove('fusion-module-host');};
 }});
 Lab.catalog=Lab.catalog.filter(e=>e.id!==entry.id);Lab.catalog.push(entry);
 }
 const home=Lab.home;
 Lab.home=function(...args){
  const template=document.createElement('template');template.innerHTML=home.apply(this,args);
  const cards=template.content.querySelector('#group-electromagnetism .cards');
  for(const entry of entries)if(cards&&!cards.querySelector('[href="#'+entry.id+'"]'))cards.insertAdjacentHTML('beforeend','<a class="card ready" href="#'+entry.id+'"><div class="cardfoot"><span class="num">'+entry.num+'</span><span class="badge">'+entry.kind+'</span></div><h3>'+entry.title+'</h3><p>'+entry.description+'</p><div class="cardfoot"><span>Otevřít modul</span><span>↗</span></div></a>');
  return template.innerHTML;
 };
 Lab.route();
})();
