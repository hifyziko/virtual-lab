window.SkewCompactLayout=app=>{
 const root=app.querySelector('.learning-workspace');root.classList.add('sk-blocks');
 const grid=root.querySelector('.learning-grid'),panels=[...grid.children],main=panels[0],phasors=panels[1],spectrum=panels[2];
 main.classList.add('sk-main-scene');phasors.classList.add('sk-phasor-panel');
 const wave=document.createElement('section');wave.className='sk-wave-panel';
 const comparison=phasors.querySelector('.sk-linked-comparison');wave.append(...comparison.childNodes);comparison.remove();
 const results=document.createElement('div');results.className='sk-vector-results';
 results.append(phasors.querySelector('.learning-stats'),phasors.querySelector('#sk-result'));
 phasors.append(results,wave,spectrum);
 const caption=document.createElement('p');caption.className='sk-wave-caption';caption.textContent='Dvě periody vybrané prostorové harmonické · amplituda vztažená ke stavu bez zešikmení';wave.querySelector('svg').after(caption);
 const settings=document.createElement('details');settings.className='sk-settings';settings.innerHTML='<summary>Parametry stroje a harmonické</summary>';
 const controls=root.querySelector('.learning-controls');settings.append(controls);grid.before(settings);
 const pitch=app.querySelector('#sk-pitch').closest('label');pitch.className='sk-live-pitch';
 root.querySelector('.learning-presets').append(pitch,settings);
 settings.append(...main.querySelectorAll(':scope>.learning-stats,:scope>.learning-equation'));
 const footer=document.createElement('div');footer.className='sk-scene-footer';
 const bottom=main.querySelector('.sk-cancel-bottom');
 bottom.before(footer);footer.append(bottom);

 app.querySelector('#sk-signed').previousElementSibling.textContent='Činitel zešikmení';
 const explanation=root.querySelector('.learning-explanation'),formula=app.querySelector('#sk-formula');
 const math=tex=>katex.renderToString(tex,{throwOnError:false});
 explanation.innerHTML='<summary>Vztahy a vysvětlení · proč jedna drážková rozteč?</summary>';
 const theory=document.createElement('div');theory.className='sk-theory';
 theory.innerHTML='<h3>Jak zešikmení zeslabí harmonickou</h3><p>Každý řez po délce stroje přispívá stejnou harmonickou s jinou fází. Výsledný činitel je jejich průměr. Pro rovnoměrné zešikmení platí:</p>';
 theory.append(formula);
 const text=document.createElement('div');
 text.innerHTML='<p>'+math(String.raw`a`)+' je zešikmení v drážkových roztečích, '+math(String.raw`Q`)+' počet drážek, '+math(String.raw`p`)+' počet pólových dvojic a '+math(String.raw`\nu`)+' řád prostorové harmonické. Mechanický úhel '+math(String.raw`\alpha=2\pi a/Q`)+' se převádí na elektrický úhel '+math(String.raw`\beta=p\alpha`)+'.</p>'+
 '<p>Pro zvolenou harmonickou je celkové rozpětí fáze '+math(String.raw`\nu\beta`)+'. Její amplituda po zprůměrování je '+math(String.raw`A_{\nu,\mathrm{sk}}=|k_{\mathrm{sk},\nu}|A_{\nu,0}`)+'. Záporný činitel znamená obrácení fáze o '+math(String.raw`180^{\circ}`)+'. Bez zešikmení se používá limita '+math(String.raw`k_{\mathrm{sk},\nu}=1`)+'.</p>'+
 '<h3>Proč právě jedna drážková rozteč?</h3><p>Drážková periodicita má mechanický řád '+math(String.raw`Q`)+', tedy elektrický řád '+math(String.raw`\nu=Q/p`)+'. Při zešikmení o jednu drážkovou rozteč, '+math(String.raw`a=1`)+', dostaneme '+math(String.raw`\nu\beta=2\pi`)+'. Příspěvky pokryjí celou periodu a v tomto ideálním modelu se vyruší: '+math(String.raw`k_{\mathrm{sk},Q/p}=\sin\pi/\pi=0`)+'.</p>'+
 '<h3>Proč nezmizí všechny drážkové harmonické?</h3><p>Typické sousední harmonické vinutí mají řády '+math(String.raw`\nu=Q/p-1`)+' a '+math(String.raw`\nu=Q/p+1`)+'. Jejich rozpětí fáze není přesně '+math(String.raw`2\pi`)+', takže se silně zeslabí, ale obecně nezaniknou. Základní vlna '+math(String.raw`\nu=1`)+' se také zeslabí; pro jednu rozteč má činitel '+math(String.raw`k_{\mathrm{sk},1}=\frac{\sin(\pi p/Q)}{\pi p/Q}`)+'.</p>'+
 '<p>Model předpokládá rovnoměrné zešikmení a stejné buzení po celé délce. Zanedbává čelní a mezityčové efekty. Skutečné momentové zvlnění závisí také na kombinaci statorových a rotorových drážek, vinutí a zatížení.</p>';
 theory.append(text);explanation.append(theory);
 root.querySelector('.learning-lead').remove();

};
