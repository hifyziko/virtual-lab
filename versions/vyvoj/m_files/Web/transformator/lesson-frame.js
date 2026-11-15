// Move existing explanation nodes, preserving controls, IDs and event listeners.
// The closed summary keeps its place so opening a theory section cannot rescale
// the teaching canvas. Escape and the explicit close button restore focus.
(()=>{
 const main=document.querySelector('main[data-transformer-lesson]');
 if(!main)return;
 if(main.dataset.transformerLesson==='tr04-pricna-vetev'){
  const duo=main.querySelector('.duo'),panels=duo?.querySelectorAll(':scope > .panel');
  if(panels?.length>=2){
   panels[0].classList.add('tr04-scene');panels[1].classList.add('tr04-circuit');
   const cause=document.getElementById('magneticCause'),results=document.getElementById('rmsOverview');
   if(cause){cause.classList.add('tr04-cause');duo.append(cause)}
   if(results){results.classList.add('tr04-results');duo.append(results)}
   const details=main.querySelector('#lessonDetails');
   for(const note of panels[1].querySelectorAll(':scope > .foot'))if(details)details.append(note);
  }
  const phase=main.querySelector('.phasecontrols'),controls=main.querySelector('.controlpanel');
  if(phase&&controls){const old=phase.parentElement;phase.classList.add('tr04-time');controls.insertBefore(phase,controls.querySelector('#reset'));if(!old.children.length)old.remove()}
 }
 if(main.dataset.transformerLesson==='tr05-rozptylova-reaktance'){
  const duo=main.querySelector('.duo'),results=document.getElementById('rmsOverview');
  const circuit=duo?.querySelector(':scope > .panel:nth-child(2)');
  duo?.querySelector(':scope > .panel:first-child')?.classList.add('tr05-scene');
  if(circuit)circuit.classList.add('tr05-circuit');
  if(duo&&results){results.classList.add('tr05-results');duo.append(results)}
  const details=main.querySelector('#lessonDetails');
  if(circuit&&details)for(const note of circuit.querySelectorAll(':scope > .foot, :scope > p:not([id])'))details.append(note);
 }
 for(const details of main.querySelectorAll(':scope > details')){
  const summary=details.querySelector(':scope > summary');
  if(!summary)continue;
  const dialog=document.createElement('dialog');dialog.className='transformer-explanation';
  dialog.setAttribute('aria-label',summary.textContent.trim());
  const close=document.createElement('button');close.className='explanation-close';close.textContent='Zavřít výklad ×';close.type='button';
  dialog.append(close);document.body.append(dialog);
  let moved=[];
  summary.addEventListener('click',event=>{
   event.preventDefault();
   if(dialog.open)return;
   moved=Array.from(details.childNodes).filter(node=>node!==summary);
   for(const node of moved)dialog.append(node);
   dialog.showModal();
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{for(const node of moved)details.append(node);moved=[];summary.focus()});
 }
})();
