/* Also usable when a gallery or experiment is opened directly. */
(()=>{'use strict';
 const id=document.body.dataset.fusionPage;
 for(const link of document.querySelectorAll('[data-lab-route]')){
  if(link.dataset.labRoute===id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
 }
 const button=document.querySelector('[data-fusion-full]');
 if(button){
  button.onclick=async()=>{if(window.parent!==window){try{if(window.parent.toggleModuleFullscreen){await window.parent.toggleModuleFullscreen();button.textContent=window.parent.document.fullscreenElement||window.parent.document.body.classList.contains('fullscreen')?'Zmenšit okno':'Celá obrazovka';return;}}catch(e){}}const active=document.fullscreenElement||document.body.classList.contains('fullscreen');document.body.classList.toggle('fullscreen',!active);try{if(active){if(document.fullscreenElement)await document.exitFullscreen?.();}else await document.documentElement.requestFullscreen?.();}catch(e){}button.textContent=active?'Celá obrazovka':'Zmenšit okno';window.dispatchEvent(new Event('resize'));};
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.body.classList.remove('fullscreen');button.textContent='Celá obrazovka';window.dispatchEvent(new Event('resize'));}});
  document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('fullscreen',!!document.fullscreenElement);button.textContent=document.fullscreenElement?'Zmenšit okno':'Celá obrazovka';});
 }
 const ready=()=>{if(window.parent!==window)window.parent.postMessage({type:'virtual-lab:fusion-ready',id},'*');};
 if(document.readyState==='complete')ready();else document.addEventListener('DOMContentLoaded',ready,{once:true});
})();
