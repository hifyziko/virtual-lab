/* Also usable when a gallery or experiment is opened directly. */
(()=>{'use strict';
 const id=document.body.dataset.fusionPage;
 for(const link of document.querySelectorAll('[data-lab-route]')){
  if(link.dataset.labRoute===id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
 }
 const button=document.querySelector('[data-fusion-full]');
 if(button){
  button.onclick=()=>{const action=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();action?.catch(()=>{});};
  document.addEventListener('fullscreenchange',()=>{button.textContent=document.fullscreenElement?'Zmenšit okno':'Celá obrazovka';});
 }
 const ready=()=>{if(window.parent!==window)window.parent.postMessage({type:'virtual-lab:fusion-ready',id},'*');};
 if(document.readyState==='complete')ready();else document.addEventListener('DOMContentLoaded',ready,{once:true});
})();
