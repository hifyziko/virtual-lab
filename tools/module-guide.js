/* Shared document-level guide; the entry sits in the existing lesson heading. */
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
  const subpage=data.subpages?.[id];
  if(subpage)return {module:{title:subpage.title},guide:subpage};
  const canonical=data.aliases[id]||id;
  // Historical gallery routes are registered but deliberately absent from the catalog.
  const module=entry||(data.aliases[id]&&window.Lab?.catalog.find(m=>m.id===canonical));
  return module&&data.entries[canonical]?{module,guide:data.entries[canonical]}:null;
 }
 function close(){
  if(dialog.open)dialog.close();
  if(dialog.ownerDocument&&dialog.ownerDocument!==document)document.body.append(dialog);
 }
 function sync(){close();launch.hidden=true;}
 const roots=new WeakMap();
 const experimentNotes={
  'mag01-magnetizace':'main > .heading .hint,main > .foot,.controls > .status',
  'mag02-hystereze':'.controls > .referenceNotice',
  'em01-indukovane-napeti':'main .modelnote',
  'em02-vzajemna-indukcnost':'main .modelnote,.toolbar .tabs,.toolbar .control > .note',
  'em03-silove-ucinky':'main > .modelNote,.mapPanel > .help',
  'mag03-hysterezni-ztraty':'main > .equations > .card,.controls .hint',
  'mag04-virive-proudy':'main > .sources,.controls .button-note',
  'hf-skin-proximity':'main > .modelNotes,#hfMatrix > .matrix-note',
  'em04-premena':'.energy-grid .energy-caption:not([id]),.energy-section-note',
  'em04-pohybove-napeti':'.sp-rod-demo p,.sp-cause p',
  'em05-reluktance':'.energy-grid .energy-caption:not([id]),.energy-bottom > p'
 };
 let active=null;
 // Keep original nodes and IDs alive for the lesson's renderers. Only the
 // explanatory document is copied, on demand, with its current values.
 function collect(root){
  if(!root||root.isConnected===false||!current())return;
  const scope=root.ownerDocument===document?root:root.ownerDocument;
  let nodes=roots.get(root);if(!nodes){nodes=[];roots.set(root,nodes);}
  active={route:location.hash,root,nodes};
  const wall=scope.querySelector('#zoomWall');if(wall)wall.closest('main')?.style.setProperty('grid-template-rows','100px minmax(0,1fr)');
  const settings=scope.querySelector('.settingsPanel');
  if(settings&&!settings.querySelector('[data-guide-fusion-theory]')){
   const paragraphs=[...settings.querySelectorAll(':scope > p')];
   if(paragraphs.length){
    const theory=settings.ownerDocument.createElement('div');theory.setAttribute('data-guide-fusion-theory','');
    settings.append(theory);for(const p of paragraphs)theory.append(p);
    const summary=settings.parentElement.querySelector('summary');if(summary)summary.textContent='Další nastavení';
   }
  }
  for(const row of scope.querySelectorAll('.statusline')){if(!row.querySelector('button,input,select,canvas,svg'))row.style.setProperty('display','none','important');}
  const lessonNotes=experimentNotes[location.hash.slice(1)];
  const candidates=scope.querySelectorAll('.dc-workspace .op-note,.dc-workspace #op-insight,.dc-workspace #cm-insight,.dc-workspace .cm-story,.dc-workspace #wc-insight,.dc-workspace #wc-text,.dc-workspace #wc-caption,.dc-workspace .dc-simple-caption,.dc-workspace .dc-intro,.dc-workspace .dc-controls-note,.dc-workspace #dc-step-title,.dc-workspace #dc-step-text,.dc-workspace #dc-model-note,.dc-workspace .arm-foot>span,.dc-workspace #arm-insight,.dc-workspace #compose-explanation,.dc-workspace .compose-note,main > .footer,main > .footnote,main > .footerbar,main > .mathnote,.sceneFoot,details,dialog#theory,dialog#explanation,dialog#guide,dialog.arm-explanation,dialog.energy-help,section.explain#help,#dd-theory-panel,#eddy-model-notes,[data-guide-fusion-theory]'+(lessonNotes?','+lessonNotes:''));
  for(const node of candidates){
   if(nodes.includes(node)||node.closest('[data-guide-source]'))continue;
   if(node.matches('details')){
    if(node.matches('.precisePositions,.matrix-advanced,.experiment'))continue;
    if(node.querySelector('input,select,textarea,button,canvas,[contenteditable]'))continue;
    if(!node.matches('.learning-explanation')&&!/výklad|vysvětlení|model|vztah|předpoklad|jak |pole uvnitř|v praxi|podrobnosti pokusu|reálnější zobrazení|vypočtené pole/i.test(node.querySelector('summary')?.textContent||''))continue;
   }
   node.setAttribute('data-guide-source','');
   node.style.setProperty('display','none','important');
   nodes.push(node);
  }
  for(const [content,button]of [['dialog#theory','#help'],['dialog#guide','#help'],['dialog#explanation','button#theory'],['dialog.arm-explanation','#arm-explain'],['dialog.energy-help','.energy-bottom'],['section.explain#help','#explain'],['#dd-theory-panel','#dd-theory-toggle']]){
   const trigger=scope.querySelector(button);
   if(scope.querySelector(content)?.hasAttribute('data-guide-source')&&trigger&&trigger.style.display!=='none')trigger.style.setProperty('display','none','important');
  }
 }
 function prepareHeading(heading,fullscreen){
  if(!heading||!fullscreen)return;
  let button=heading.querySelector('[data-module-guide],#import-guide');
  if(button?.hasAttribute('data-module-guide'))return;
  if(!button){button=document.createElement('button');button.type='button';fullscreen.before(button);}
  button.setAttribute('data-module-guide','');button.textContent='Ovládání a výklad';
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','module-guide-dialog');
  button.onclick=()=>show();
 }
 function appendTheory(target){
  if(!active||active.route!==location.hash||!active.root.isConnected)return;
  const template=active.root.querySelector('#lesson-guide-content');
  if(template){target.innerHTML=template.innerHTML;return;}
  let serial=0;
  for(const original of active.nodes){
   if(!original.isConnected)continue;
   const copy=original.cloneNode(true),section=document.createElement('section');section.className='module-guide-theory';
   const drawings=original.querySelectorAll('svg,svg *'),copies=copy.querySelectorAll('svg,svg *');
   drawings.forEach((node,i)=>{
    const style=node.ownerDocument.defaultView.getComputedStyle(node);
    for(const name of ['fill','stroke','stroke-width','stroke-dasharray','stroke-linecap','stroke-linejoin','marker-start','marker-mid','marker-end','opacity','font-family','font-size','font-weight','text-anchor','dominant-baseline'])copies[i].style.setProperty(name,style.getPropertyValue(name));
   });
   const summary=copy.querySelector(':scope > summary');
   if(summary){const title=document.createElement('h3');title.textContent=summary.textContent.replace(/[⌄▾]/g,'').trim();section.append(title);summary.remove();}
   copy.querySelectorAll('button,script,style').forEach(n=>n.remove());
   // Namespaced SVG references preserve illustrations without duplicate IDs.
   const ids=new Map();
   copy.querySelectorAll('[id]').forEach(n=>{const id='guide-copy-'+(++serial);ids.set(n.id,id);n.id=id;});
   copy.querySelectorAll('*').forEach(n=>{for(const a of [...n.attributes]){
    if(a.name.startsWith('on'))n.removeAttribute(a.name);
    else if(/url\(/.test(a.value))n.setAttribute(a.name,a.value.replace(/url\(["']?[^#)]*#([^)'"\s]+)["']?\)/g,(all,id)=>ids.has(id)?'url(#'+ids.get(id)+')':all));
    else if(['href','xlink:href'].includes(a.name)&&ids.has(a.value.slice(1)))n.setAttribute(a.name,'#'+ids.get(a.value.slice(1)));
    else if(['aria-labelledby','aria-describedby','for'].includes(a.name))n.setAttribute(a.name,a.value.split(/\s+/).map(id=>ids.get(id)||id).join(' '));
   }});
   while(copy.firstChild)section.append(copy.firstChild);
   target.append(section);
  }
 }
 function show(content){
  dialog.dataset.lesson=location.hash.slice(1);
  const value=current();if(!value)return;
  const child=active?.route===location.hash?active.root.ownerDocument:null;
  const host=child?.fullscreenElement?child:document;
  if(dialog.ownerDocument&&dialog.ownerDocument!==host){
   if(dialog.open)dialog.close();
   if(host!==document&&!host.getElementById('shared-module-guide-style')){
    const style=host.createElement('style');style.id='shared-module-guide-style';style.textContent=document.getElementById('module-guide-style').textContent;host.head.append(style);
   }
   host.body.append(dialog);
  }
  const {module,guide}=value;
  dialog.querySelector('#module-guide-title').textContent=module.title;
  const related=guide.related.map(id=>window.Lab.catalog.find(m=>m.id===id)).filter(Boolean);
  dialog.querySelector('#module-guide-content').innerHTML=
   '<section><h3>Ovládání a pokusy</h3><ol>'+guide.controls.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol></section>'+
   '<section><h3>Co si odnést</h3><ul>'+guide.points.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>'+
   (guide.equation?'<div class="module-guide-equation" data-tex="'+esc(guide.equation)+'"></div>':'')+'</section>'+
   (guide.model?'<section><h3>'+esc(guide.model.title)+'</h3><div class="module-guide-equation" data-tex="'+esc(guide.model.equation)+'"></div>'+
    guide.model.paragraphs.map(s=>'<p>'+esc(s)+'</p>').join('')+'</section>':'');
  appendTheory(dialog.querySelector('#module-guide-content'));
  if(typeof content==='string')dialog.querySelector('#module-guide-content').innerHTML=content;
  else{
   const references=document.createElement('section');references.className='module-guide-references';
   references.innerHTML='<h3>Zdroje a další studium</h3><p class="module-guide-source">Podklad: '+esc(data.sources[guide.source])+'</p>'+
    (related.length?'<nav class="module-guide-related" aria-label="Navazující pokusy">'+related.map(m=>'<a href="#'+esc(m.id)+'">'+esc(m.title)+' →</a>').join('')+'</nav>':'')+
    '<p class="module-guide-footnote">Zavření výkladu vrací stejný pokus bez změny nastavení. Provozní hodnoty v tomto výkladu jsou snímkem okamžiku otevření.</p>';
   dialog.querySelector('#module-guide-content').append(references);
  }
  // Lesson class names (explain, formula, note, etc.) describe scene layouts,
  // not a reading document. Never carry their grids/flexboxes into prose.
  for(const node of dialog.querySelector('#module-guide-content').querySelectorAll('*')){
   if(node.closest('svg,.katex,.katex-display,.pl-math'))continue;
   const local=[...node.classList].filter(name=>name.startsWith('module-guide-'));
   node.removeAttribute('class');if(local.length)node.setAttribute('class',local.join(' '));
   node.removeAttribute('style');node.setAttribute('data-guide-prose','');
  }
  for(const node of dialog.querySelectorAll('[data-tex],[data-math]')){
   // Detached formula spans in a formula group are display equations; symbols
   // embedded in prose, headings, tables and illustrations stay inline.
   if(!node.closest('svg')&&(node.matches('div,p')||!node.parentElement.closest('p,li,td,th,h2,h3,h4,a,button'))){
    node.setAttribute('data-guide-equation','');
   }
   window.katex.render(node.dataset.tex??node.dataset.math,node,{throwOnError:true});
  }
  const reading=dialog.querySelector('#module-guide-content');
  const chapters=[...reading.querySelectorAll(':scope > section')].map(section=>({section,title:section.querySelector('h3,h2')})).filter(item=>item.title?.textContent?.trim());
  if(chapters.length>1){
   const contents=document.createElement('nav');contents.className='module-guide-contents';contents.setAttribute('aria-label','Obsah výkladu');
   const label=document.createElement('strong');label.textContent='Obsah výkladu';contents.append(label);
   const list=document.createElement('ol');
   chapters.forEach(({section,title},index)=>{
    section.id='module-guide-chapter-'+index;title.classList.add('module-guide-chapter');
    const item=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=title.textContent;button.setAttribute('data-guide-target',section.id);item.append(button);list.append(item);
   });
   contents.append(list);reading.prepend(contents);
  }
  // Use the project's existing math tokenizer also for prose and units. Do not
  // reinterpret already typeset formulas or technical SVG illustrations.
  if(document.createTreeWalker&&window.PowerLabMath?.richQuantities){
   const walker=document.createTreeWalker(dialog.querySelector('#module-guide-content'),4),texts=[];
   while(walker.nextNode())texts.push(walker.currentNode);
   for(const node of texts){
    if(node.parentElement.closest('.katex,.pl-math,[data-tex],[data-math],svg,code,pre'))continue;
    const html=window.PowerLabMath.richQuantities(node.nodeValue);
    if(html){const span=document.createElement('span');span.innerHTML=html;node.replaceWith(span);}
   }
  }
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;
 }
 window.ModuleGuide={open:show,collect,prepareHeading};
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 launch.addEventListener('click',show);
 dialog.querySelector('[data-guide-close]').addEventListener('click',close);
 dialog.addEventListener('click',event=>{
  const target=event.target.closest('[data-guide-target]');
  if(target){dialog.querySelector('#'+target.getAttribute('data-guide-target'))?.scrollIntoView({block:'start'});return;}
  if(event.target.closest('a'))close();
 });
 document.addEventListener('keydown',event=>{
  if(dialog.open&&event.key==='Escape'){
   event.preventDefault();event.stopImmediatePropagation();close();
  }
 },true);
 addEventListener('hashchange',sync);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
 else sync();
})();
