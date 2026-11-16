/* A document-level overlay: never insert into the measured lesson or its heading. */
(() => {
 'use strict';
 if(document.getElementById('module-guide-launch')) return;
 const data=window.ModuleGuideData;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const launch=document.createElement('button');
 launch.id='module-guide-launch';launch.type='button';launch.hidden=true;
 launch.setAttribute('aria-label','Ovládání a stručný výklad aktuálního modulu');
 launch.setAttribute('aria-haspopup','dialog');launch.setAttribute('aria-controls','module-guide-dialog');
 launch.title='Ovládání a stručný výklad';
 launch.innerHTML='<span aria-hidden="true">?</span><span class="module-guide-launch-label"> Ovládání a výklad</span>';
 const dialog=document.createElement('dialog');
 dialog.id='module-guide-dialog';dialog.setAttribute('aria-labelledby','module-guide-title');
 dialog.setAttribute('data-plain-text','');
 dialog.innerHTML='<div class="module-guide-header"><div><p class="module-guide-eyebrow">Ovládání a souvislosti</p><h2 id="module-guide-title"></h2></div><button type="button" data-guide-close aria-label="Zavřít nápovědu">Zavřít</button></div><div id="module-guide-content"></div>';
 document.body.append(launch,dialog);
 function current(){
  const id=location.hash.slice(1),entry=window.Lab?.catalog.find(m=>m.id===id);
  const canonical=data.aliases[id]||id;
  // Historical gallery routes are registered but deliberately absent from the catalog.
  const module=entry||(data.aliases[id]&&window.Lab?.catalog.find(m=>m.id===canonical));
  return module&&data.entries[canonical]?{module,guide:data.entries[canonical]}:null;
 }
 function close(){
  if(dialog.open)dialog.close();
 }
 function sync(){close();launch.hidden=!current();}
 function show(){
  const value=current();if(!value)return;
  const {module,guide}=value;
  dialog.querySelector('#module-guide-title').textContent=module.title;
  const related=guide.related.map(id=>window.Lab.catalog.find(m=>m.id===id)).filter(Boolean);
  dialog.querySelector('#module-guide-content').innerHTML=
   '<section><h3>Jak postupovat</h3><ol>'+guide.controls.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol></section>'+
   '<section><h3>Co si odnést</h3><ul>'+guide.points.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>'+
   (guide.equation?'<div class="module-guide-equation" data-tex="'+esc(guide.equation)+'"></div>':'')+
   (related.length?'<nav class="module-guide-related" aria-label="Navazující pokusy"><h3>Navazuje na</h3>'+related.map(m=>'<a href="#'+esc(m.id)+'">'+esc(m.title)+' →</a>').join('')+'</nav>':'')+
   '<p class="module-guide-source">Podklad: '+esc(data.sources[guide.source])+'</p>'+
   '<p class="module-guide-footnote">Další vztahy a omezení najdete ve výkladu přímo v modulu. Zavření nápovědy vrací stejný pokus bez změny nastavení.</p>';
  for(const node of dialog.querySelectorAll('[data-tex]'))window.katex.render(node.dataset.tex,node,{throwOnError:true});
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;
 }
 launch.addEventListener('click',show);
 dialog.querySelector('[data-guide-close]').addEventListener('click',close);
 dialog.addEventListener('click',event=>{if(event.target.closest('a'))close();});
 document.addEventListener('keydown',event=>{
  if(dialog.open&&event.key==='Escape'){
   event.preventDefault();event.stopImmediatePropagation();close();
  }
 },true);
 addEventListener('hashchange',sync);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
 else sync();
})();
