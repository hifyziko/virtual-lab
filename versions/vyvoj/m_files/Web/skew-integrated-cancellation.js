/* The cancellation demonstration shares the stator's circumferential coordinate. */
window.SkewCancellation={mount(app,read){
 const svg=app.querySelector('#sk-geometry'),slice=app.querySelector('.sk-slice-control'),panel=svg.closest('.learning-panel');
 const box=document.createElement('div');box.className='sk-cancel sk-cancel-inline';
 box.innerHTML='<div class="sk-cancel-tools"><button id="sk-demo-whole" aria-pressed="false">Celá tyč A–C</button><button id="sk-demo-play">Přehrát skládání</button><button id="sk-demo-inspect" aria-pressed="false">Prohlédnout jeden řez</button><label><input id="sk-demo-pair" type="checkbox" checked> Zvýraznit dvojici vzdálenou L/2</label></div>';
 slice.before(box);
 const bottom=document.createElement('div');bottom.className='sk-cancel-bottom';
 bottom.innerHTML='<label>Řezy na statoru <input id="sk-demo-blend" type="range" min="0" max="1" step=".01" value="1" aria-label="Přenesení příspěvků ze statoru na společnou osu"> Společná osa</label><p id="sk-demo-status" role="status" aria-live="polite"></p>';
 svg.after(bottom);
 const $=s=>panel.querySelector(s);let frame=0,start=0,lastDraw=0,playing=false,disposed=false,inspect=false,wholeRod=false,savedBlend=1,blend=1,shownA=read().a;
 app.querySelector('[data-sk-preset="zero"]').dataset.cancelState='zero';app.querySelector('[data-sk-preset="slot"]').dataset.cancelState='slot';
 panel.querySelector('h2').textContent='Ze statorových drážek ke společné vlně';
 panel.querySelector('h2+p').textContent='Barevné vlny vycházejí z řezů přímo na statoru. Přeneste je na společnou osu pod ním: vrchol jednoho příspěvku se potká s dolíkem druhého.';
 const note=panel.querySelector('.sk-scene-note');
 function draw(probe=.5){
  const state=read(),a=inspect?state.a:shownA,k=LearningModels.skew(state.nu,state.Q,state.p,a);
  svg.innerHTML=wholeRod?SkewWholeRod.render({...state,position:blend}):SkewStator.render({...state,a,k,t:+app.querySelector('#sk-slice').value,compact:document.documentElement.clientWidth<600,mechanism:inspect?null:{blend,probe,pair:$('#sk-demo-pair').checked}});
  svg.setAttribute('viewBox','0 0 680 720');
  panel.querySelector('h2').textContent=wholeRod?'Napětí celé zešikmené tyče':'Ze statorových drážek ke společné vlně';panel.querySelector('h2+p').textContent=wholeRod?'Stejné svorky A a C. Každý úsek tyče přidává svůj příspěvek k výslednému napětí.':'Příspěvky řezů přesuneme na společnou osu a sledujeme jejich vyrušení.';$('#sk-demo-whole').setAttribute('aria-pressed',String(wholeRod));$('#sk-demo-play').hidden=wholeRod;$('#sk-demo-inspect').hidden=wholeRod;$('#sk-demo-pair').closest('label').hidden=wholeRod;const label=bottom.querySelector('label');label.firstChild.textContent=wholeRod?'Poloha po obvodu ':'Řezy na statoru ';label.lastChild.textContent=wholeRod?' Jedna perioda':' Společná osa';$('#sk-demo-blend').setAttribute('aria-label',wholeRod?'Obvodová poloha sledované tyče':'Přenesení příspěvků na společnou osu');slice.hidden=!inspect;bottom.hidden=inspect;panel.querySelector('.sk-slice-legend').hidden=!inspect;
  $('#sk-demo-inspect').setAttribute('aria-pressed',String(inspect));$('#sk-demo-inspect').textContent=inspect?'Zpět ke skládání':'Prohlédnout jeden řez';
  note.textContent=wholeRod?'Barevné úseky a šipky: místní příspěvky k napětí. Zelená křivka: součet od A. Voltmetr měří celý vodič A–C; zobrazen je příspěvek vybrané harmonické.':inspect?'Zlatá čára sleduje jednu drážku. Křivky pod statorem porovnávají krajní a vybraný řez s průměrem celé délky.':'Zelená vlna: začátek. Červená vlna: polovina délky. Při rozpětí fáze 360° jsou tyto příspěvky opačné. Výsledná spodní křivka je průměr všech řezů po celé délce. Čárkovaná šedá vlna ukazuje stav bez zešikmení; zlatá čára sleduje jednu drážku.';
  box.dataset.amplitude=String(Math.abs(k));box.dataset.shownSkew=String(a);box.dataset.blend=String(blend);
 }
 function stop(){playing=false;cancelAnimationFrame(frame);$('#sk-demo-play').textContent='Přehrát skládání';}
 function current(){stop();shownA=read().a;blend=+$('#sk-demo-blend').value;draw();$('#sk-demo-status').textContent=wholeRod?'Příspěvky se po délce přičítají i odečítají. Konečná hodnota u C je napětí celé tyče.':'Vlny z jednotlivých řezů zůstávají. Zelená křivka ukazuje jejich společný účinek.';}
 function tick(time){if(disposed)return;if(!start)start=time;const elapsed=(time-start)/1000,target=read().a;
  const ramp=Math.max(0,Math.min(1,(elapsed-1)/2));shownA=target*ramp*ramp*(3-2*ramp);
  let mix=Math.max(0,Math.min(1,(elapsed-3)/2));blend=mix*mix*(3-2*mix);$('#sk-demo-blend').value=blend;
  if(time-lastDraw>40||elapsed>=7){draw(.5+.025*Math.sin(elapsed));lastDraw=time;}
  const stage=elapsed<1?0:elapsed<3?1:elapsed<5?2:3;
  if(box.dataset.stage!==String(stage)){box.dataset.stage=stage;$('#sk-demo-status').textContent=['1 · Přímé drážky: vlny všech řezů mají stejnou fázi.','2 · Drážky zešikmíme: fáze vln se posouvá po délce statoru.','3 · Vlny z řezů přeneseme dolů na společnou obvodovou osu.','4 · Opačné příspěvky se odečítají. Zeleně vidíte výslednou vlnu.'][stage];}
  if(elapsed<7)frame=requestAnimationFrame(tick);else{stop();shownA=target;blend=1;$('#sk-demo-blend').value=1;draw();}
 }
 $('#sk-demo-whole').onclick=()=>{stop();if(!wholeRod)savedBlend=blend;wholeRod=!wholeRod;inspect=false;$('#sk-demo-blend').value=wholeRod?0:savedBlend;current()};$('#sk-demo-play').onclick=()=>{if(playing){current();return;}inspect=false;playing=true;start=0;lastDraw=0;box.dataset.stage='';$('#sk-demo-play').textContent='Přejít na výsledek';frame=requestAnimationFrame(tick);};
 $('#sk-demo-inspect').onclick=()=>{inspect=!inspect;current();};
 $('#sk-demo-blend').oninput=current;$('#sk-demo-pair').onchange=current;
 current();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('#sk-demo-play').click();
 return {update(){current();},relayout(){draw();},dispose(){disposed=true;stop();}};
}};
