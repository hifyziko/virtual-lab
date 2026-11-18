(()=>{'use strict';
 const $=id=>document.getElementById(id),M=EMWaveModel,LW=EMLWModel,C=HiFyzikoParticleStyle.fields,E=C.electric,B=C.magnetic,S='#278571',ink='#536f7b';
 const state={t:0,running:false,kind:'kick',view:'antenna',yaw:-.35,pitch:.28,frequency:1,burst:false,stopTime:undefined,probe:.9};
 let frame=0,last=0,disposed=false,drag=null;const contexts={};
 const num=(v,d=1)=>v.toFixed(d).replace('.', '{,}');
 function tex(el,s){if(el.dataset.texRendered!==s){katex.render(s,el,{throwOnError:true});el.dataset.texRendered=s;}}
 for(const el of document.querySelectorAll('[data-tex]'))tex(el,el.dataset.tex);
 // Same KaTeX overlay convention as the particle/drift modules.
 function label(parent,key,s,x,y,color=ink){let el=parent.querySelector('[data-key="'+key+'"]');if(!el){el=document.createElement('span');el.className='mathlabel';el.dataset.key=key;parent.append(el);}tex(el,s);el.style.left=x+'px';el.style.top=y+'px';el.style.color=color;}
 function pixelDensity(){const fit=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fusion-fit'))||1;return Math.min(4,Math.max(1.5,fit*(devicePixelRatio||1)*1.25));}
 function setup(id){const canvas=$(id),rect=canvas.getBoundingClientRect(),scale=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fusion-fit'))||1,w=rect.width/scale,h=rect.height/scale,d=pixelDensity();if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}const ctx=canvas.getContext('2d');ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);contexts[id]={ctx,w,h};return contexts[id];}
 function line(c,a,b,color=ink,width=1){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 function path(c,points,color,width=1,fill=false){if(!points.length)return;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));if(fill){c.closePath();c.fillStyle=color;c.fill();}else{c.strokeStyle=color;c.lineWidth=width;c.stroke();}}
 function arrow(c,a,b,color,width=2){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L<.25)return;const ux=dx/L,uy=dy/L,head=Math.min(9,L*.5),shaft=Math.min(width/2,L*.12),wing=Math.min(4.5,L*.28),at=(s,v)=>[a[0]+ux*s-uy*v,a[1]+uy*s+ux*v];path(c,[at(0,-shaft),at(L-head,-shaft),at(L-head,-wing),b,at(L-head,wing),at(L-head,shaft),at(0,shaft)],color,1,true);}
 function dot(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();}
 function text(c,s,x,y,color=ink,size=12){c.font=size+'px Segoe UI';c.fillStyle=color;c.fillText(s,x,y);}
 function circle(c,x,y,r,color,width=1){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 function antenna(){const {ctx:c,w,h}=setup('antenna'),cx=w*.5,cy=h*.52,len=h*.27,m=LW.motion(state.t,state),kick=state.kind==='kick',scale=kick?len/.22:len/.075,layer=$('antennaMath');
  line(c,[cx,cy-len],[cx,cy+len],'#9aadc0',3);for(const [i,q]of LW.charges(state.t,state).entries()){const y=cy-(q.z-(kick?.16:0))*scale;dot(c,cx,y,12,q.q>0?'#eb6845':'#4598e4');label(layer,'charge'+i,q.q>0?'+q':'-q',cx,y,'white');}const v=m[1];arrow(c,[cx+34,cy],[cx+34,cy-v*70],S,3);label(layer,'velocity','\\mathbf v',cx+50,cy+24,S);label(layer,'position','z_q/\\lambda_0='+num(m[0],2),cx,12,E);label(layer,'speed','v_q/c='+num(v,2),cx,h-10,S);
 }
 const technical=EMLWRenderer.create(LW,EMFieldRenderer,EMFieldGPU,()=>document.createElement('canvas'));
 function fieldScene(c,w,h){technical.draw(c,w,h,state,{layer:$('sceneMath'),extent:+$('extent').value,baseline:$('baseline').checked,part:$('part').value,quantity:$('quantity').value,overlay:$('overlay').value,scale:$('scaleMode').value,range:+$('mapRange').value,bands:$('bands').value==='bands',showE:$('showE').checked,showB:$('showB').checked,showS:$('showS').checked,pixelRatio:pixelDensity()},{label,line,arrow,dot,circle,text,path});}
 function waveValue(x,t){return -LW.motion(t-x,state)[2]/(state.kind==='kick'?1:LW.amplitude*(2*Math.PI*state.frequency)**2);}
 function waveScene(c,w,h){const scale=Math.min(w/5.4,h/2.6),co=Math.cos(state.yaw),si=Math.sin(state.yaw),cp=Math.cos(state.pitch),sp=Math.sin(state.pitch);
  const project=p=>{const x=(p[0]-1.5)*1.5,z=p[2],y=p[1],a=co*x-si*y,b=si*x+co*y;return [w*.48+a*scale,h*.55-(cp*z-sp*b)*scale];};
  const L=$('sceneMath'),amplitude=.55;const plane=(p,color)=>path(c,p.map(project),color,1,true);
  if($('showE').checked)plane([[0,0,-.72],[3,0,-.72],[3,0,.72],[0,0,.72]],'#b578250a');
  if($('showB').checked)plane([[0,-.72,0],[3,-.72,0],[3,.72,0],[0,.72,0]],'#356ac309');
  for(let x=0;x<=3.01;x+=.25){line(c,project([x,-.72,0]),project([x,.72,0]),'#a2b9c129');line(c,project([x,0,-.72]),project([x,0,.72]),'#a2b9c129');}
  arrow(c,project([0,0,0]),project([3.3,0,0]),'#849ca8',1.5);arrow(c,project([0,0,-.75]),project([0,0,.85]),'#849ca8',1.5);arrow(c,project([0,.75,0]),project([0,-.85,0]),'#849ca8',1.5);
  const ec=[],bc=[];for(let i=0;i<=240;i++){const x=i/80,e=waveValue(x,state.t)*amplitude;ec.push(project([x,0,e]));bc.push(project([x,-e,0]));}
  if($('showE').checked)path(c,ec,E,2.5);if($('showB').checked)path(c,bc,B,2.5);
  for(let i=0;i<=48;i++){const x=i/16,e=waveValue(x,state.t)*amplitude,p=project([x,0,0]);if($('showE').checked)arrow(c,p,project([x,0,e]),E,1.8);if($('showB').checked)arrow(c,p,project([x,-e,0]),B,1.8);if($('showS').checked&&i%4===0)arrow(c,p,project([x+e*e*.9,0,0]),S,3);}
  const x=state.probe,e=waveValue(x,state.t)*amplitude,p=project([x,0,0]);circle(c,...p,8,'#263f4c',2);if($('showE').checked)dot(c,...project([x,0,e]),5,E);if($('showB').checked)dot(c,...project([x,-e,0]),5,B);
  label(L,'probe','\\text{Pevná sonda}',p[0],p[1]+28);label(L,'x','x',...project([3.4,0,0]));label(L,'ez','\\mathbf E/E_0',...project([0,0,.98]),E);label(L,'by','c\\mathbf B/E_0',...project([0,-1,0]),B);
  const direction=project([2.75,0,-.9]);arrow(c,project([2.1,0,-.9]),direction,S,3);label(L,'flow','\\text{Šíření}',direction[0]-48,direction[1]+17,S);
  const la=project([.1,0,-.9]),lb=project([.1+(state.kind==='kick'?LW.duration:1/state.frequency),0,-.9]);line(c,la,lb,ink,1.2);for(const p of [la,lb])line(c,[p[0],p[1]-4],[p[0],p[1]+4],ink);label(L,'wavelengthSpan',state.kind==='kick'?'c\\Delta t':'\\lambda',(la[0]+lb[0])/2,(la[1]+lb[1])/2+16);
  label(L,'lambda',state.kind==='kick'?'\\Delta t=14\\,\\mathrm{ns}':'\\lambda='+num(2.99792458/state.frequency,2)+'\\,\\mathrm m',w-120,38);
 }
 function graph(){const {ctx:c,w,h}=setup('graph'),L=$('graphMath'),a=55,b=w-25,mid=(h+24)/2,amp=(h-86)/2,start=Math.max(0,state.t-4.4),end=start+4.4;
  for(let i=0;i<=4;i++){const x=a+(b-a)*i/4;line(c,[x,47],[x,h-29],'#e5ecef');label(L,'tick'+i,num((start+(end-start)*i/4)*10,1),x,h-15);}
  line(c,[a,mid],[b,mid],'#c4d3d9');label(L,'t','t\\;(\\mathrm{ns})',w-42,38);label(L,'zero','0',a-15,mid);
  const src=[],el=[],bl=[],isWave=state.view==='wave',norm=LW.reference(state);
  for(let i=0;i<=360;i++){const t=start+(end-start)*i/360,x=a+(b-a)*i/360,source=waveValue(0,t),f=LW.field(state.probe,0,0,t,state,$('part').value),e=isWave?waveValue(state.probe,t):f.E[2]/norm,bb=isWave?e:-f.B[1]/norm;
   src.push([x,mid-source*amp]);el.push([x,mid-e*amp]);bl.push([x,mid-bb*amp]);}
  const max=Math.max(1.25,...el.map(p=>Math.abs((p[1]-mid)/amp)),...bl.map(p=>Math.abs((p[1]-mid)/amp)),...src.map(p=>Math.abs((p[1]-mid)/amp)));for(const points of [src,el,bl])for(const p of points)p[1]=mid+(p[1]-mid)/max;label(L,'max',num(max,1),a-20,mid-amp);c.save();c.beginPath();c.rect(a,42,b-a,h-65);c.clip();if(!isWave){c.setLineDash([5,4]);path(c,src,'#849ca8',1.5);c.setLineDash([]);}if($('showB').checked){c.setLineDash([6,5]);path(c,bl,B,3.5);c.setLineDash([]);}if($('showE').checked)path(c,el,E,1.8);c.restore();
  const now=a+(state.t-start)/(end-start)*(b-a);line(c,[now,43],[now,h-29],'#243f4b',1);
  label(L,'curve',isWave?'E_z/E_0=-cB_y/E_0':'E_z/E_*,\\;-cB_y/E_*',w*.67,37,E);
  if(!isWave)label(L,'source','-a_q/a_*\\;\\text{u zdroje}',w*.34,37,'#849ca8');
 }
 function readouts(){tex($('frequencyValue'),num(state.frequency*100,0)+'\\,\\mathrm{MHz}');tex($('wavelength'),(state.kind==='kick'?'\\lambda_0='+num(2.99792458,2):'\\lambda='+num(2.99792458/state.frequency,2))+'\\,\\mathrm m');tex($('probeValue'),num(state.probe*2.99792458,2)+'\\,\\mathrm m');tex($('timeValue'),'t='+num(state.t*10,1)+'\\,\\mathrm{ns}');$('time').value=state.t;$('play').textContent=state.running?'Pozastavit':state.t===0?'Spustit':'Pokračovat';$('play').setAttribute('aria-pressed',String(state.running));}
 function render(){if(disposed)return;readouts();antenna();const {ctx,w,h}=setup('scene');if(state.view==='antenna')fieldScene(ctx,w,h);else waveScene(ctx,w,h);graph();}
 function view(v){state.view=v;for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===v));$('partRow').hidden=v==='wave';$('fieldOptions').hidden=v==='wave';$('camera').disabled=v!=='wave';$('scene').parentElement.dataset.mode=v;$('sceneMath').replaceChildren();$('graphMath').replaceChildren();$('sceneTitle').textContent=v==='wave'?'Dvě kolmá pole, jeden směr šíření':state.kind==='kick'?'Rozběh náboje a šíření ohybu pole':'Kmitající náboje a vyzařování';$('sceneHint').textContent=v==='wave'?'Místní rovinné přiblížení daleko od zdroje · tažením otáčejte prostor':'Vlevo elektrické siločáry · vpravo magnetické pole · zeleně čelo změny';$('sceneScale').textContent=v==='wave'?'Délka vektorů: lineární normalizovaná škála':'Bílé křivky: elektrické siločáry · kroužek: sonda';$('graphTitle').textContent=v==='wave'?'Obě pole v pevném bodě kmitají ve fázi':'Zdroj nyní a pole u sondy';render();}
 function restart(){state.t=0;state.stopTime=undefined;state.running=true;$('stop').disabled=state.burst||state.kind==='kick';render();}
 $('play').onclick=()=>{state.running=!state.running;render();};$('reset').onclick=restart;
 $('stop').onclick=()=>{state.stopTime=state.t;$('stop').disabled=true;render();};
 $('frequency').oninput=()=>{state.frequency=+$('frequency').value/100;restart();};$('excitation').onchange=()=>{state.kind=$('excitation').value==='kick'?'kick':'dipole';state.burst=$('excitation').value==='burst';$('frequencyRow').hidden=state.kind==='kick';$('antennaMath').replaceChildren();restart();view(state.view);};
 $('probe').oninput=()=>{state.probe=Math.min(+$('probe').value,+$('extent').value*.9);$('probe').value=state.probe;render();};$('time').oninput=()=>{state.running=false;state.t=+$('time').value;render();};
 for(const id of ['showE','showB','showS','part','quantity','overlay','scaleMode','mapRange','bands','extent','baseline'])$(id).onchange=()=>{if(id==='extent'){state.probe=Math.min(state.probe,+$('extent').value*.9);$('probe').max=+$('extent').value*.9;$('probe').value=state.probe;}$('sceneMath').replaceChildren();render();};
 for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>view(b.dataset.view);
 $('camera').onclick=()=>{state.yaw=-.35;state.pitch=.28;render();};
 $('theory').onclick=()=>$('explanation').showModal();$('closeHelp').onclick=()=>$('explanation').close();
 const scene=$('scene');scene.onpointerdown=e=>{if(state.view!=='wave')return;drag=[e.clientX,e.clientY,state.yaw,state.pitch];scene.setPointerCapture(e.pointerId);};scene.onpointermove=e=>{if(!drag)return;const fit=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fusion-fit'))||1;state.yaw=drag[2]-(e.clientX-drag[0])*.006/fit;state.pitch=Math.max(-1.1,Math.min(1.1,drag[3]+(e.clientY-drag[1])*.006/fit));render();};scene.onpointerup=scene.onpointercancel=()=>drag=null;
 function animate(now){if(disposed)return;const dt=Math.min(.05,(now-last)/1000);last=now;if(state.running&&!$('explanation').open&&!document.hidden){state.t=Math.min(20,state.t+dt*+$('speed').value);if(state.t>=20)state.running=false;render();}frame=requestAnimationFrame(animate);}
 // Opening the guide leaves time and playback state unchanged; no hidden progression.
 window.HiFyzikoFusionDispose=()=>{technical.dispose();disposed=true;cancelAnimationFrame(frame);window.removeEventListener('resize',render);};window.addEventListener('resize',render);for(const b of document.querySelectorAll('[data-moment]'))b.onclick=()=>{state.t=+b.dataset.moment;state.running=false;$('extent').value=state.t>2?'2.4':'1.4';$('extent').onchange();};$('probe').max=1.26;$('frequencyRow').hidden=true;$('stop').disabled=true;view('antenna');frame=requestAnimationFrame(animate);
})();
