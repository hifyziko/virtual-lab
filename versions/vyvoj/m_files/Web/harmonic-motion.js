Lab.register({id:'03-pohyb',title:'Prostorové a časové harmonické magnetického napětí',mount(app){
 const C=Lab,W=WMath,rad=Math.PI/180;
 const math=tex=>katex.renderToString(tex,{throwOnError:true});
 const defaults={mode:0,q:4,p:1,y:10,orders:[1,5,7,11,13],normal:true,t:0,periods:0};
 const pitches=q=>Array.from({length:3*q},(_,i)=>3*q-i);
 const phaseColors=['#b34339','#305fa9','#93801a'];
 let winding;
 const controls=s=>C.control('Harmonické','mode',C.select('mode',[[0,'Prostorové'],[1,'Časové']],s.mode))
  +C.control(math('q'),'q',C.select('q',[1,2,3,4,5,6,8],s.q))
  +C.control('Póly '+math('2p'),'p',C.select('p',[[1,2],[2,4],[3,6],[4,8]],s.p))
  +C.control('Krok '+math('y_d'),'y',C.select('y',pitches(s.q),s.y))
  +C.control('Řády','orders','<input id="orders" type="text" value="1 5 7 11 13">')
  +C.check('normal','Stejné výšky složek',s.normal);
 function setPitch(ctx){const s=ctx.state;ctx.$('y').innerHTML=pitches(s.q).map(v=>'<option>'+v+'</option>').join('');ctx.$('y').value=s.y}
 function components(s){
  const beta=s.y/(3*s.q);
  return s.orders.map(order=>{
   const nu=s.mode?1:order,mu=s.mode?order:1,dir=W.seq(order);
   const amp=dir?W.kw(s.q,beta,nu)/(s.mode?mu:nu):0;
   return {nu,mu,order,amp,dir,speed:Math.abs(amp)>1e-10?dir*3000*mu/(s.p*nu):0};
  });
 }
 function field(h,p,angle,time){return h.amp*Math.cos(h.nu*p*angle-h.dir*h.mu*time)}
 function trackedCrest(term,s){
  const elapsed=s.t*rad+s.periods*W.T;
  return (term.dir*term.mu*elapsed+(term.amp<0?Math.PI:0))/(term.nu*s.p);
 }
 function section(ctx,terms,time,limit){
  const plot=C.chart(ctx.canvases[0],[-1,1],[-1,1],'','',{bare:true});
  if(!plot)return;
  const {c,w,h}=plot,ink='#294650',paper='#fbfcfa';
  const s=ctx.state;
  if(!winding||winding.q!==s.q||winding.p!==s.p||winding.y!==s.y)winding=W.winding(s.q,s.p,s.y);
  const pair=ctx.$('motion-coil-pair'),pairText='Cívka mezi drážkami 1 a '+(winding.coils[0].end+1);
  if(pair.textContent!==pairText)pair.textContent=pairText;
  const slotPitch=W.T/winding.Q,slotOffset=slotPitch/2,slotScale=Math.min(1,24/winding.Q);
  const supply=s.mode?terms.filter(h=>h.dir).map(h=>h.mu):[1];
  const currentBound=supply.reduce((sum,mu)=>sum+1/mu,0)||1;
  const currents=[0,-W.T/3,W.T/3].map(shift=>supply.reduce((sum,mu)=>sum+Math.cos(mu*(time+shift))/mu,0));
  const r=Math.min(h*.42,w*.241),cx=w*.257,cy=h*.50;
  const left=w*.553,width=w*.425,top=h*.16,height=h*.66;
  const zoom=width*1.86,probeX=left+width*.52,probeY=top+height*.5;
  function path(points,stroke,fill){
   c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
   if(fill){c.closePath();c.fillStyle=fill;c.fill()}
   if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}
  }
  function caption(text,x,y,align='center'){
   c.fillStyle=ink;c.font='600 13px "Segoe UI", Arial, sans-serif';c.textAlign=align;c.fillText(text,x,y);
  }
  function machine(x,y,radius){
   // The zero-angle probe faces iron between adjacent slot mouths.
   c.save();c.translate(x,y);c.rotate(slotOffset);
   InductionMachineArt.canvas({c,X:v=>radius*v,Y:v=>-radius*v},slotOffset-W.T/48,winding.Q);
   c.scale(radius/211,radius/211);
   for(let k=0;k<winding.Q;k++){
    c.save();c.rotate(-k*slotPitch);
    for(let layer=0;layer<2;layer++){
     const radialStart=183+9*layer,phase=winding.phase[k][layer],current=winding.sign[k][layer]*currents[phase];
     c.fillStyle=phaseColors[phase];c.globalAlpha=.24+.76*Math.min(1,Math.abs(current)/currentBound);
     c.fillRect(radialStart,-7*slotScale,7,14*slotScale);c.globalAlpha=1;
     if(Math.abs(current)>1e-8 && 7*slotScale*radius/211>=2){
      const mx=radialStart+3.5,mark=Math.min(2,4*slotScale);
      c.beginPath();
      if(current>0){c.arc(mx,0,mark*.8,0,W.T);c.fillStyle='#192c36';c.fill()}
      else{c.moveTo(mx-mark,-mark);c.lineTo(mx+mark,mark);c.moveTo(mx+mark,-mark);c.lineTo(mx-mark,mark);c.strokeStyle='#192c36';c.lineWidth=1;c.stroke()}
     }
    }
    c.restore();
   }
   c.rotate(W.T/48-slotOffset);
   for(let k=0;k<20;k++){
    c.save();c.rotate(-k*W.T/20);c.fillStyle='#bfa578';
    c.beginPath();c.roundRect(121,-6,15,12,3);c.fill();c.restore();
   }
   c.restore();
   const gap=radius*160/211,steps=Math.max(360,8*Math.max(...terms.map(h=>h.nu))*ctx.state.p);
   for(let i=0;i<steps;i++){
    const a=(i+.5)*W.T/steps;
    const v=terms.reduce((sum,h)=>sum+field(h,ctx.state.p,a,time),0)/limit;
    const neutral=[245,245,235],pole=v<0?[36,86,168]:[189,61,39];
    const rgb=pole.map((p,k)=>Math.round(neutral[k]+Math.min(1,Math.abs(v))*(p-neutral[k])));
    c.beginPath();c.arc(x,y,gap,-(i+1)*W.T/steps,-i*W.T/steps+1/gap);
    c.strokeStyle='rgb('+rgb.join(',')+')';c.lineWidth=radius*24/211;c.stroke();
   }
   terms.forEach((term,j)=>{
    if(Math.abs(term.amp)<1e-10)return;
    const a=trackedCrest(term,s),px=x+gap*Math.cos(a),py=y-gap*Math.sin(a);
    const dx=-term.dir*Math.sin(a),dy=-term.dir*Math.cos(a),size=Math.min(8,Math.max(4,radius*.04));
    path([[px+dx*size,py+dy*size],[px-dx*size*.7-dy*size*.65,py-dy*size*.7+dx*size*.65],[px-dx*size*.7+dy*size*.65,py-dy*size*.7-dx*size*.65]],'white',C.palette[j]);
   });
  }
  machine(cx,cy,r);
  // End connection of the coil whose first side is in slot 1.
  const coil=winding.coils[0],first=slotOffset,last=slotOffset-slotPitch*coil.end,bridge=r*1.065;
  c.beginPath();c.moveTo(cx+r*(186.5/211)*Math.cos(first),cy+r*(186.5/211)*Math.sin(first));
  c.arc(cx,cy,bridge,first,last,true);
  c.lineTo(cx+r*(195.5/211)*Math.cos(last),cy+r*(195.5/211)*Math.sin(last));
  c.strokeStyle=phaseColors[coil.ph];c.lineWidth=2.4;c.stroke();
  const sensor=cx+r*160/211,boxW=r*.39,boxH=r*.56;
  c.setLineDash([3,3]);
  path([[sensor+boxW/2,cy-boxH/2],[left,top]],'#82979e');
  path([[sensor+boxW/2,cy+boxH/2],[left,top+height]],'#82979e');
  c.strokeStyle='#506c77';c.strokeRect(sensor-boxW/2,cy-boxH/2,boxW,boxH);c.setLineDash([]);
  function probe(x,y){
   c.beginPath();c.arc(x,y,3.6,0,W.T);c.fillStyle='#162c38';c.fill();c.strokeStyle='white';c.lineWidth=1;c.stroke();
  }
  probe(sensor,cy);
  c.save();c.beginPath();c.roundRect(left,top,width,height,6);c.clip();
  c.fillStyle=paper;c.fillRect(left,top,width,height);
  machine(probeX-zoom*160/211,probeY,zoom);
  probe(probeX,probeY);
  c.restore();c.beginPath();c.roundRect(left,top,width,height,6);c.strokeStyle='#849aa2';c.lineWidth=1;c.stroke();
  caption('Detail u pevné sondy',left+width/2,top-7);
  caption('Rotor',left+width*.18,top+height+17);
  caption('Stator',left+width*.86,top+height+17);
  const labelRight=left+width*.29;
  c.save();c.textBaseline='middle';
  caption('Sonda',labelRight,probeY,'right');
  c.restore();
  path([[labelRight+4,probeY],[probeX-4,probeY]],ink);
  caption('Vzduchová mezera',cx,h*.965);
  path([[cx+r*.64,cy+r*.41],[cx+r*.79,h*.89],[cx+r*.4,h*.89]],ink);
 }
 C.mount(app,{num:'07',title:'Prostorové a časové harmonické magnetického napětí',defaults,controls,
 help:'<div><h3>Pokus s pátou harmonickou</h3><p>Zadejte jediný řád 5 a jeden pólový pár. V prostorovém režimu spočítejte pět kladných oblastí po obvodu. V časovém režimu je po obvodu jen jedna, ale během jedné základní periody projde kolem sondy pětkrát. V obou případech postupuje pátá vlna zpětně.</p><p>Každá barevná šipka sleduje jeden kladný vrchol příslušné harmonické a ukazuje směr jejího pohybu. Jejich barvy odpovídají křivkám v grafu po obvodu. Černý bod je pevná sonda. Barva vodiče označuje fázi, sytost velikost okamžitého proudu. Tečka značí proud k pozorovateli, křížek proud od pozorovatele. Barevný oblouk spojuje obě strany jedné cívky. Změňte krok a sledujte, do které drážky se přesune druhá strana. Přidejte řády 1 a 7. Stejné výšky usnadní počítání vln. Součet i barvy mezery používají skutečné poměry amplitud. Sytost barvy se vztahuje k součtu amplitud vybraných vln.</p></div>'
 +'<div><h3>Model magnetického napětí</h3><p>'+math(String.raw`F=A\cos(\nu p\alpha-d\mu\omega t)`)+'. Mechanický úhel '+math(String.raw`\alpha`)+' roste od sondy proti směru hodinových ručiček. '+math('p')+' je počet pólových dvojic základní vlny, '+math(String.raw`\omega=2\pi f`)+' a '+math(String.raw`f=50\,\mathrm{Hz}`)+'. Znaménko '+math('d')+' určuje směr. Rychlost v otáčkách za minutu je '+math(String.raw`d\,60f\mu/(p\nu)`)+'.</p><p>Prostorový režim používá sinusové proudy a amplitudy '+math(String.raw`A=k_{\mathrm v,\nu}/\nu`)+'. Časový režim ponechává základní prostorovou vlnu vinutí a předepisuje modelové amplitudy proudů '+math(String.raw`I_\mu/I_1=1/\mu`)+'. Činitel vinutí závisí na počtu drážek na pól a fázi a na kroku cívky. Uvažujeme symetrické třífázové buzení s půlvlnovou symetrií. V modelu se uplatní řády '+math(String.raw`6k\pm1`)+'. Řez má názornou geometrii a zvětšenou mezeru.</p></div>',
 layout:'harmonic-motion',
 advance(ctx,dt,rate){
  const s=ctx.state,next=s.t+rate*dt;
  s.periods+=Math.floor(next/360);
  s.t=next%360;
 },
 init(ctx){
  const tempo=ctx.$('tempo').closest('.control');
  tempo.classList.add('harmonic-header-tempo');
  ctx.app.querySelector('.modulehead .actions').prepend(tempo,ctx.$('reset'));
 },
 panels:[{title:'Příčný řez strojem',legend:phaseColors.map((color,i)=>C.legend('Fáze '+['A','B','C'][i],color)).join('')+C.legend('Kladná MMF','#b8482b')+C.legend('Záporná MMF','#2860b3')+'<span id="motion-coil-pair"></span>'},{title:'Postup jednotlivých vln po obvodu mezery'},{title:'Výsledné magnetické napětí',legend:C.legend('Součet','#142b35')+C.legend('Základní vlna','#007c69')},{title:'Mechanická rychlost vln při '+math(String.raw`50\,\mathrm{Hz}`),legend:'Kladná hodnota označuje pohyb proti směru hodinových ručiček.'}],
 change(ctx,id,el){
  const s=ctx.state;
  if(id==='orders'){
   const values=[...new Set(el.value.trim().split(/[\s,;]+/).map(Number))];
   if(!values.length||values.length>8||values.some(v=>!Number.isInteger(v)||v<1||v>49))throw Error('Zadejte 1 až 8 celých řádů v rozmezí 1–49.');
   s.orders=values;
  }else if(id==='normal')s.normal=el.checked;
  else if(id==='q'){s.y=Math.max(1,Math.min(3*el.value,Math.round(s.y*el.value/s.q)));s.q=+el.value;setPitch(ctx)}
  else s[id]=+el.value;
 },
 reset(ctx){for(const id of ['mode','p','q'])ctx.$(id).value=ctx.state[id];setPitch(ctx);ctx.$('orders').value=ctx.state.orders.join(' ');ctx.$('normal').checked=ctx.state.normal},
 draw(ctx){
  const s=ctx.state,terms=components(s),time=s.t*rad,beta=s.y/(3*s.q);
  const amplitudeBound=terms.reduce((sum,h)=>sum+Math.abs(h.amp),0);
  const limit=Math.max(.01,amplitudeBound,Math.abs(W.kw(s.q,beta,1)));
  const end=s.mode?20:360,axis=s.mode?'Čas u sondy [ms]':'Úhel od sondy [°]';
  const x=C.linspace(0,end,Math.max(721,16*Math.max(...terms.map(h=>s.mode?h.mu:s.p*h.nu))+1));
  const at=(h,v)=>s.mode?field(h,s.p,0,W.T*v/end):field(h,s.p,v*rad,time);
  const angles=s.mode?C.linspace(0,360,721):x;
  const lines=ctx.chart(1,[0,360],[-1.2,2.4*(terms.length-1)+1.2],'Úhel od sondy [°]','');
  const sumPlot=ctx.chart(2,[0,end],[-1.1*limit,1.1*limit],axis,'Relativní MMF');
  const total=x.map(()=>0),probe=s.mode?s.t/360*end:0;
  terms.forEach((h,j)=>{
   const wave=x.map(v=>at(h,v)),offset=2.4*(terms.length-1-j);
   wave.forEach((v,k)=>total[k]+=v);
   if(lines){
    const scale=s.normal&&Math.abs(h.amp)>1e-10?1/Math.abs(h.amp):1;
    const spatial=s.mode?angles.map(v=>field(h,s.p,v*rad,time)):wave;
    lines.line(angles,spatial.map(v=>offset+scale*v),C.palette[j]);
    if(Math.abs(h.amp)>1e-10){
     const crest=W.mod(trackedCrest(h,s),W.T);
     lines.dot(crest/rad,offset+scale*Math.abs(h.amp),C.palette[j],3);
    }else lines.dot(0,offset+scale*spatial[0],C.palette[j],3);
   }
  });
  if(sumPlot){
   sumPlot.line(x,x.map(v=>at({nu:1,mu:1,dir:1,amp:W.kw(s.q,beta,1)},v)),'#007c69',1.5,[5,4]);
   sumPlot.line(x,total,'#142b35',2);
   sumPlot.dot(probe,terms.reduce((a,h)=>a+at(h,probe),0),'#142b35',4);
  }
  section(ctx,terms,time,Math.max(1e-10,amplitudeBound));
  const speeds=terms.map(h=>h.speed),extent=1.22*Math.max(3000/s.p,...speeds.map(Math.abs));
  const bars=ctx.chart(3,[.4,terms.length+.6],[-extent,extent],'Pozice ve výběru řádů','ot/min');
  if(bars){C.bar(bars,speeds,C.palette);terms.forEach((h,j)=>C.text(bars,j+1,h.speed+extent*(h.speed>=0?.06:-.10),(s.mode?'μ':'ν')+' = '+h.order,C.palette[j]))}
  const status=s.mode?'Časový průběh v pevné sondě · základní prostorová vlna vinutí':'Rozložení po obvodu v jednom okamžiku · sinusové napájení';
  if(ctx.$('status').textContent!==status)ctx.$('status').textContent=status;
 }});
}});
