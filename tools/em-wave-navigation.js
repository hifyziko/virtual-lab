(()=>{'use strict';
 const entries=[
  {id:'em06-vlna',group:'electromagnetism',num:'12',title:'Anténa a elektromagnetická vlna',description:'Od střídavého proudu v anténě k vyzařování a prostorové elektromagnetické vlně.',page:'em-vlna/index.html',kind:'Interaktivní experiment'},
  {id:'em07-elektron',group:'electromagnetism',num:'13',title:'Příběh elektronu',description:'Od katodové trubice ke kvantovému poli. Prostorové modely a pokusy, které měnily představu o elektronu.',page:'pribeh-elektronu/index.html',kind:'Interaktivní experiment'},
  {id:'em09-diody',group:'converters',num:'01',title:'Diodové usměrňovače',description:'Uzlové a můstkové spojení, komutace proudu a usměrněné napětí.',page:'menice/diody.html',kind:'Interaktivní experiment'},
  {id:'em10-tyristory',group:'converters',num:'02',title:'Řízený tyristorový usměrňovač',description:'Vliv úhlu řízení na střední hodnotu usměrněného napětí v trojfázovém uzlovém spojení.',page:'menice/tyristory.html',kind:'Interaktivní experiment'},
  {id:'em11-pwm',group:'converters',num:'03',title:'Princip pulzně šířkové modulace',description:'Porovnání řídicího a nosného signálu, poměrná doba sepnutí a proud zátěže.',page:'menice/pwm.html',kind:'Interaktivní experiment'},
  {id:'em12-pulzni',group:'converters',num:'04',title:'Stejnosměrné pulzní měniče',description:'Přenos energie tlumivkou ve snižujícím a zvyšujícím měniči.',page:'menice/pulzni.html',kind:'Interaktivní experiment'},
  {id:'em13-jednofazovy',group:'converters',num:'05',title:'Jednofázový napěťový střídač',description:'Napětí H-můstku a přechod proudu mezi tranzistory a diodami.',page:'menice/jednofazovy.html',kind:'Interaktivní experiment'},
  {id:'em08-stridac',group:'converters',num:'06',title:'Třífázový napěťový střídač',description:'Spínání můstku, měření fázových napětí a proudu při obdélníkovém řízení a sinusové PWM.',page:'stridac/index.html',kind:'Interaktivní experiment'},
  {id:'em14-stridavy',group:'converters',num:'07',title:'Střídavý měnič napětí',description:'Fázové řízení a zánik proudu odporové a induktivní zátěže.',page:'menice/stridavy.html',kind:'Interaktivní experiment'},
  {id:'em15-kmitocet',group:'converters',num:'08',title:'Nepřímý měnič kmitočtu',description:'Od síťového můstku přes meziobvod k výstupu s proměnným kmitočtem.',page:'menice/kmitocet.html',kind:'Interaktivní experiment'},
  {id:'em16-aktivni',group:'converters',num:'09',title:'Pulzní usměrňovač a síť',description:'Síťový proud neřízeného a pulzního usměrňovače při stejné zátěži.',page:'menice/aktivni.html',kind:'Interaktivní experiment'}
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
  for(const entry of entries){
   const cards=template.content.querySelector('#group-'+entry.group+' .cards');
   if(cards&&!cards.querySelector('[href="#'+entry.id+'"]'))cards.insertAdjacentHTML('beforeend','<a class="card ready" href="#'+entry.id+'"><div class="cardfoot"><span class="num">'+entry.num+'</span><span class="badge">'+entry.kind+'</span></div><h3>'+entry.title+'</h3><p>'+entry.description+'</p><div class="cardfoot"><span>Otevřít modul</span><span>↗</span></div></a>');
  }
  return template.innerHTML;
 };
 Lab.route();
})();
