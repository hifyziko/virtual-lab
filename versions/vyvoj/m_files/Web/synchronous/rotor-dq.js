(()=>{'use strict';const $=id=>document.getElementById(id),state=Object.assign(RotorDQ.create(),{step:2}),rad=Math.PI/180;
 const C={current:'#007e6c',d:'#a76914',q:'#346fc0',muted:'#748a89',a:'#bf5849',b:'#527fb8',c:'#9e9237'};
 const fmt=(v,n=2)=>(Math.abs(v)<.0001?0:v).toFixed(n).replace('.',','),cache=new Map();
 const tex=t=>{if(!cache.has(t)){if(cache.size>1500)cache.clear();cache.set(t,katex.renderToString(t,{throwOnError:false}));}return cache.get(t);};
 for(const el of document.querySelectorAll('[data-math]'))el.innerHTML=tex(el.dataset.math.replaceAll('&amp;','&'));
 const text=(x,y,t,color=C.muted,size=13,anchor='middle')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}">${t}</text>`;
 const math=(x,y,t,color,size=15,centered=false)=>`<foreignObject x="${x-35}" y="${y-(centered?17:14)}" width="70" height="34" style="overflow:visible;pointer-events:none"><div xmlns="http://www.w3.org/1999/xhtml" style="${centered?'display:flex;align-items:center;justify-content:center;height:100%;':''}text-align:center;color:${color};font-size:${size}px">${tex(t)}</div></foreignObject>`;
 function arrow(x,y,dx,dy,color,width=3){const len=Math.hypot(dx,dy);if(len<.6)return '';const ux=dx/len,uy=dy/len,head=Math.min(10,len*.6),endx=x+dx,endy=y+dy;return `<path d="M${x} ${y}L${endx-head*.85*ux} ${endy-head*.85*uy}" fill="none" stroke="${color}" stroke-width="${Math.min(width,len*.2)}"/><path d="M${endx} ${endy}L${endx-head*ux+head*.45*uy} ${endy-head*uy-head*.45*ux}L${endx-head*ux-head*.45*uy} ${endy-head*uy+head*.45*ux}Z" fill="${color}"/>`;}
 function scene(relative,a){
  const s=SyncPrinciple.create();Object.assign(s,{type:'salient',rotor:state.rho,field:state.theta,excitation:false,excitationLevel:0});
  let h=SyncMachineArt(s,relative,{axes:false,forces:false,currentScale:state.amp,driveLabel:'i',salientPath:SyncRotorGeometry.salientPath},'');
  h='<g opacity=".3">'+h+'</g>';
  const rho=relative?0:state.rho,theta=relative?a.relative:state.theta,scale=100,d=[Math.cos(rho),-Math.sin(rho)],q=[-Math.sin(rho),-Math.cos(rho)];
  // Spatial stator axes remain fixed on the left and turn past the observer on the right.
  const stator=-relative*state.rho,sa=[Math.cos(stator),-Math.sin(stator)],sb=[-Math.sin(stator),-Math.cos(stator)];
  for(const [v,t] of [[sa,'α'],[sb,'β']]){h+=`<path d="M${280-165*v[0]} ${267-165*v[1]}L${280+165*v[0]} ${267+165*v[1]}" stroke="#a9bcb7" stroke-dasharray="4 6"/>`+(state.step===4?text(280+203*v[0],272+203*v[1],t,C.muted,13):'');}
  for(const [v,name,color] of (relative?[[d,'d',C.d],[q,'q',C.q]]:[])){h+=`<path d="M${280-160*v[0]} ${267-160*v[1]}L${280+160*v[0]} ${267+160*v[1]}" stroke="${color}" stroke-width="1.4" opacity=".8"/>`+text(280+174*v[0],272+174*v[1],name,color,18);}
  if(relative){const px=280+scale*state.amp*Math.cos(theta),py=267-scale*state.amp*Math.sin(theta),dx=scale*a.d*d[0],dy=scale*a.d*d[1],qx=scale*a.q*q[0],qy=scale*a.q*q[1];h+=`<path d="M${280+dx} ${267+dy}L${px} ${py}L${280+qx} ${267+qy}" fill="none" stroke="${C.d}" stroke-width="2" stroke-dasharray="6 4"/>`+`<path d="M${px} ${py}L${280+qx} ${267+qy}" fill="none" stroke="${C.q}" stroke-width="2" stroke-dasharray="6 4"/>`;h+=arrow(280,267,dx,dy,C.d,4)+arrow(280,267,qx,qy,C.q,4);h+=math(280+dx*.55+q[0]*15,267+dy*.55+q[1]*15,'i_d',C.d)+math(280+qx*.55-d[0]*19,267+qy*.55-d[1]*19,'i_q',C.q);}
  if(!relative){const tip=[280+scale*state.amp*Math.cos(theta),267-scale*state.amp*Math.sin(theta)];for(let k=0;k<3;k++){const ang=k*2*Math.PI/3,v=[Math.cos(ang),-Math.sin(ang)],color=[C.a,C.b,C.c][k],x=280+scale*a.abc[k]*v[0],y=267+scale*a.abc[k]*v[1];h+='<path d="M'+(280-160*v[0])+' '+(267-160*v[1])+'L'+(280+160*v[0])+' '+(267+160*v[1])+'" stroke="'+color+'" stroke-width="1.2"/>';h+='<path class="phase-projection" d="M'+tip[0]+' '+tip[1]+'L'+x+' '+y+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-dasharray="6 4"/>';h+=arrow(280,267,x-280,y-267,color,3)+math(280+187*v[0],267+187*v[1],'i_'+['a','b','c'][k],color,18,true);}}
  h+=arrow(280,267,scale*state.amp*Math.cos(theta),-scale*state.amp*Math.sin(theta),C.current,4.3);
  const gx=280+178*d[0],gy=267+178*d[1];h+=`<g class="rotor-grip"><circle cx="${gx}" cy="${gy}" r="15" fill="${C.d}" stroke="white" stroke-width="2"/>${text(gx,gy+5,'d','white',16)}</g>`;
  h+=math(280+(scale*state.amp+24)*Math.cos(theta),267-(scale*state.amp+24)*Math.sin(theta),'\\mathbf i_s',C.current,17,true);
  return h;
 }
 function graph(id,keys,colors){
  const svg=$(id),W=Math.max(320,svg.clientWidth),H=Math.max(100,svg.clientHeight),left=58,right=W-24,center=(H-40+18)/2,half=(H-62)/2,limit=1.6,start=Math.max(0,state.time-12),end=Math.max(12,state.time);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  let h='';const cursor=left+(right-left)*(state.time-start)/(end-start);h+=`<path d="M${cursor} 14V${H-40}" stroke="#748a89" stroke-dasharray="4 4"/>`;for(const v of [-1,0,1]){const y=center-v*half/limit;h+=`<path d="M${left} ${y}H${right}" stroke="${v===0?'#afc2ba':'#e3eae6'}"/>`+math(left-24,y+2,String(v),C.muted,17,true);}h+=math(left,H-17,fmt(start,0)+'\\,\\mathrm{s}',C.muted,16,true)+math(right-10,H-17,fmt(end,0)+'\\,\\mathrm{s}',C.muted,16,true);
  for(let n=0;n<keys.length;n++){const key=keys[n],rows=state.history.length?state.history:[{t:state.time,...RotorDQ.at(state.theta,state.rho,state.amp)}];let d='';for(const [j,row] of rows.entries()){const v=typeof key==='number'?row.abc[key]:row[key];d+=(j?'L':'M')+(left+(right-left)*(row.t-start)/(end-start)).toFixed(2)+' '+(center-v*half/limit).toFixed(2);}h+=`<path d="${d}" fill="none" stroke="${colors[n]}" stroke-width="2.2" stroke-linejoin="round"/>`;const row=rows[rows.length-1],v=typeof key==='number'?row.abc[key]:row[key];h+=`<circle cx="${left+(right-left)*(row.t-start)/(end-start)}" cy="${center-v*half/limit}" r="3.1" fill="${colors[n]}"/>`;}
  $(id).innerHTML=h;
 }
 let dirty=true,lastTime=0,lastPaint=0,raf=0,fitFrame=0;
 function render(){
  dirty=false;const a=RotorDQ.at(state.theta,state.rho,state.amp);
  $('statorView').innerHTML=scene(false,a);$('rotorView').innerHTML=scene(true,a);
  $('theta').value=RotorDQ.wrap(state.theta)/rad;$('rho').value=RotorDQ.wrap(state.rho)/rad;$('amp').value=state.amp;
  $('thetaOut').textContent=fmt(RotorDQ.wrap(state.theta)/rad,0)+'°';$('rhoOut').textContent=fmt(RotorDQ.wrap(state.rho)/rad,0)+'°';$('ampOut').textContent=fmt(state.amp);$('speedOut').textContent=state.speed+' °/s';
  $('play').textContent=state.playing?'Ⅱ Pozastavit':'▶ Animovat';$('play').setAttribute('aria-pressed',state.playing);
  for(const b of document.querySelectorAll('[data-drive]'))b.setAttribute('aria-pressed',+b.dataset.drive===state.ratio);
  for(const b of document.querySelectorAll('[data-step]'))b.setAttribute('aria-pressed',+b.dataset.step===state.step);
  $('dValue').textContent=fmt(a.d);$('qValue').textContent=fmt(a.q);$('normValue').textContent=fmt(a.norm);
  $('relativeNote').textContent='Úhel šipky vůči rotoru: '+fmt(a.relative/rad,0)+'° · rotorové složky v grafu vpravo';
  const explanations={2:['Jeden proudový vektor, dva souřadnicové systémy.',state.playing?(state.ratio===1?'Rotor a proudový vektor se otáčejí stejně rychle. Rotorové průměty jsou konstantní; porovnejte oba časové grafy. Zkuste nyní Pomalejší rotor.':'Proudový vektor se vůči rotoru pohybuje, proto jeho rotorové průměty kmitají. Přepněte na Stejnou rychlost a porovnejte grafy.'):'Otočte pouze zlatými osami: proud ve statoru se nezmění, ale jeho průměty ano. Pak spusťte Stejnou rychlost a porovnejte oba grafy.'],4:['Z fázových proudů do rotorových souřadnic.','Výpočet dole nejprve složí tři fázové proudy do prostorového vektoru a pak jej promítne na osy rotoru. Změňte proud nebo natočení rotoru a sledujte číselný převod.']};
  if(state.step===2)explanations[2]=['Průměty a okamžité hodnoty','Čárkované kolmice ukazují průměty zelené šipky. Jejich barvy odpovídají průběhům: nahoře a, b, c; dole d, q.'];const info=explanations[state.step];$('insightTitle').textContent=info[0];$('insightText').textContent=info[1];
  $('recipeLive').innerHTML='<b>Teď:</b>'+a.abc.map((v,i)=>'<span class="phase-'+['a','b','c'][i]+'">'+tex('i_'+['a','b','c'][i]+'='+fmt(v).replace(',','{,}'))+'</span>').join('')+'<span>→</span><span class="gold">'+tex('i_d='+fmt(a.d).replace(',','{,}'))+'</span><span class="blue">'+tex('i_q='+fmt(a.q).replace(',','{,}'))+'</span>';
  $('recipe').hidden=false;document.querySelector('.charts').hidden=false;
  $('traceNote').textContent=state.ratio===1?'Zlatý a modrý průmět → stejně barevné průběhy':state.ratio===0?'Rotor stojí → průměty kmitají':'Rozdílné rychlosti → průměty pomalu kmitají';
  graph('abcChart',[0,1,2],[C.a,C.b,C.c]);graph('dqChart',['d','q'],[C.d,C.q]);
 }
 function mark(){dirty=true;}
 function clearTrace(){state.history=[];state.time=0;mark();}
 for(const id of ['theta','rho','amp'])$(id).addEventListener('input',()=>{if(id!=='amp')state.playing=false;state[id==='theta'?'theta':id==='rho'?'rho':'amp']=+$(id).value*(id==='amp'?1:rad);clearTrace();});
 $('speed').addEventListener('input',()=>{state.speed=+$('speed').value;mark();});
 $('play').onclick=()=>{state.playing=!state.playing;lastTime=0;mark();};
 $('reset').onclick=()=>{Object.assign(state,RotorDQ.create(),{step:2});$('speed').value=30;lastTime=0;mark();};
 for(const b of document.querySelectorAll('[data-drive]'))b.onclick=()=>{state.ratio=+b.dataset.drive;if(state.ratio===1&&Math.abs(RotorDQ.wrap(state.theta-state.rho))<.1)state.rho=state.theta-Math.PI/6;state.playing=true;lastTime=0;clearTrace();};
 for(const b of document.querySelectorAll('[data-step]'))b.onclick=()=>{state.step=+b.dataset.step;mark();fitSoon();};
 let pointer=null,dragKind='rotor';const view=$('statorView');
 function move(e){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(view.getScreenCTM().inverse()),angle=Math.atan2(267-p.y,p.x-280);if(dragKind==='rotor')state.rho=angle;else state.theta=angle;clearTrace();}
 view.addEventListener('pointerdown',e=>{if(e.button!==0)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(view.getScreenCTM().inverse()),gx=280+178*Math.cos(state.rho),gy=267-178*Math.sin(state.rho),ix=280+232*Math.cos(state.theta),iy=267-232*Math.sin(state.theta);dragKind=Math.hypot(p.x-gx,p.y-gy)<Math.hypot(p.x-ix,p.y-iy)?'rotor':'current';state.playing=false;pointer=e.pointerId;view.setPointerCapture(pointer);view.classList.add('dragging');move(e);e.preventDefault();});view.addEventListener('pointermove',e=>{if(e.pointerId===pointer)move(e);});const release=()=>{pointer=null;view.classList.remove('dragging');};for(const name of ['pointerup','pointercancel','lostpointercapture'])view.addEventListener(name,release);
 function fitSoon(){if(fitFrame)return;fitFrame=requestAnimationFrame(()=>{fitFrame=0;if(parent!==window)return;const main=document.querySelector('main');if(innerWidth<=850){main.style.removeProperty('zoom');main.style.removeProperty('width');return;}main.style.width=Math.min(1180,innerWidth)+'px';const scale=Math.min(innerWidth/main.offsetWidth,(innerHeight-8)/main.offsetHeight);main.style.zoom=String(Math.round(scale*10000)/10000);});}
 addEventListener('resize',()=>{mark();fitSoon();});document.fonts.ready.then(fitSoon);document.querySelector('details').addEventListener('toggle',fitSoon);
 function tick(now){if(!document.hidden){if(state.playing){RotorDQ.advance(state,lastTime?(now-lastTime)/1000:0);dirty=true;}if(dirty&&now-lastPaint>40){render();fitSoon();lastPaint=now;}}lastTime=now;raf=requestAnimationFrame(tick);}
 document.addEventListener('visibilitychange',()=>{lastTime=0;});addEventListener('pagehide',()=>cancelAnimationFrame(raf));
 window.rotorDQState=()=>({...state,...RotorDQ.at(state.theta,state.rho,state.amp)});
 render();fitSoon();raf=requestAnimationFrame(tick);
})();
