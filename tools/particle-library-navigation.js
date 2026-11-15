(()=>{
 const home=Lab.home;
 Lab.home=function(...args){
 const template=document.createElement('template');template.innerHTML=home.apply(this,args);
 const area=template.content.querySelector('#group-area-plasma');
 if(area){const proposed=area.querySelector('.physics-proposals');const card=document.createElement('article');card.className='physics-proposal';card.innerHTML='<span class="badge">01 · Interaktivní experiment</span><h3>Coulombova bariéra</h3><p>Přibližuj jádra proti odpudivé síle. Sleduj pole, energii a klasický odraz.</p><p><a class="button" href="fuze-bariera/index.html">Otevřít experiment →</a></p><p><a href="fuze-seznam/jadra.html">Samotná jádra</a> · <a href="fuze-seznam/atomy.html">Atomy</a> · <a href="fuze-seznam/index.html">Databáze částic</a></p>';
 if(proposed){proposed.prepend(card);const note=proposed.nextElementSibling;if(note&&note.textContent.includes('Interaktivní moduly zde ještě nejsou'))note.textContent='První experiment je dostupný. Další témata oblasti připravujeme.';}else area.append(card);
 }
 const footer=template.content.querySelector('footer');if(footer)footer.insertAdjacentHTML('beforeend','<p><a href="fuze-seznam/index.html">Databáze částic a jader</a> · <a href="fuze-bariera/index.html">Coulombova bariéra</a></p>');
 return template.innerHTML;
 };Lab.route();
})();