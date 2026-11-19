/* Separate proposal entry only; the regular index never loads this code. */
(() => {
 'use strict';
 const root=document.documentElement;
 const isScope=()=>{
  const id=location.hash.slice(1),entry=Lab.catalog.find(item=>item.id===id);
  return !id||id==='group-area-electricity'||id==='group-electromagnetism'||entry?.group==='electromagnetism';
 };
 const home=Lab.home;
 Lab.home=function(){
  const template=document.createElement('template');template.innerHTML=home.call(this);
  const container=template.content.querySelector('.home');
  if(container&&isScope()){
   const note=document.createElement('aside');note.className='visual-proposal-note';note.setAttribute('aria-label','Vizuální návrh');
   note.innerHTML='<strong>Vizuální návrh · k posouzení</strong><a href="#group-electromagnetism">Základní elektromagnetické principy</a><a data-original-view>Porovnat se současným vzhledem</a>';
   const original=new URL('index.html',location.href);original.hash=location.hash;
   note.querySelector('[data-original-view]').href=original.href;
   container.prepend(note);
  }
  return template.innerHTML;
 };
 const route=Lab.route;
 Lab.route=function(){
  root.toggleAttribute('data-visual-proposal',isScope());
  return route.call(this);
 };
 window.HiFyzikoVisualProposalPaint.refresh();
 Lab.route();
})();
