(()=>{'use strict';
 const M=DriftModel,$=id=>document.getElementById(id),canvas=$('scene'),graph=$('graph'),ctx=canvas.getContext('2d'),gc=graph.getContext('2d');
 const names={entry:'Z přímky na kružnici',gyration:'Kroužení kolem siločáry',electric:'Společný drift obou znamének náboje',gradient:'Silnější pole, těsnější oblouk',curvature:'Zakřivená siločára a příčný drift'};
 const tex=(el,s)=>{if(el.dataset.texValue===s)return;el.dataset.texValue=s;katex.render(s,el,{throwOnError:false});};
 const num=(n,d=2)=>(Object.is(Number(n.toFixed(d)),-0)?0:Number(n.toFixed(d))).toLocaleString('cs-CZ',{maximumFractionDigits:d,useGrouping:false}).replace(',','{,}');
 const quantity=(n,unit)=>{const a=Math.abs(n);if(!a)return '0\\,\\mathrm{'+unit+'}';const exp=Math.floor(Math.log10(a));return (exp<-2||exp>3?num(n/10**exp)+'\\cdot10^{'+exp+'}':num(n))+'\\,\\mathrm{'+unit+'}';};
 function label(parent,key,s,x,y){let el=parent.querySelector('[data-key="'+key+'"]');if(!el){el=document.createElement('span');el.className='mathlabel';el.dataset.key=key;parent.append(el);}tex(el,s);el.style.left=x+'px';el.style.top=y+'px';return el;}
 let graphMin=0,graphMax=0,axisNoticeUntil=0,speedNoticeUntil=0;let companions=[],companionIds=[],companionStarts={};let ended=false,entered=false,camera=[0,0,0],config,samples,frame=0,playing=false,sign=1,last=0,raf=0,disposed=false,view=null,gyaw=0,gtilt=0,yaw=-.65,tilt=.65,drag=null,width=900,height=650,extent=1;
 try{view=new HiFyzikoNucleusView($('nuclei'));}catch{/* A labeled marker remains available without WebGL. */}
 for(const el of document.querySelectorAll('[data-tex]'))tex(el,el.dataset.tex);
 function makeCompanion(id,index){const c=M.setup({...parameters(),species:id});c.length=config.length;const initial={r:[...(companionStarts[id]||[[-3,0],[3,0],[0,2.5]][index].map(v=>v*config.length).concat(0))],v:[...c.initial.v]};return {config:c,initial,samples:[{...initial,t:0,...M.diagnostics(c,initial)}]};}
 // Exact homogeneous-field orbit, with the same physical dt for all species.
 function advanceCompanion(item,dt,time){const c=item.config,old=item.samples.at(-1),omega=c.q*c.B/c.m,a=omega*dt,co=Math.cos(a),si=Math.sin(a),v=old.v,r=old.r;const state={v:[v[0]*co+v[1]*si,v[1]*co-v[0]*si,v[2]],r:[r[0]+(v[0]*si+v[1]*(1-co))/omega,r[1]+(v[1]*si-v[0]*(1-co))/omega,r[2]+v[2]*dt]};item.samples.push({...state,t:time,...M.diagnostics(c,state)});if(item.samples.length>1440)item.samples.shift();}
 const animationRate=()=>10**Number($('rate').value);
 function parameters(){return {mode:$('mode').value,species:$('species').value,B:sign*Number($('b').value)/1000,energy:Number($('energy').value),pitch:Number($('pitch').value),electric:Number($('electric').value),gradient:Number($('gradient').value)/100,radius:Number($('radius').value),angle:Number($('angle').value),start:config?.start||[-3,0]};}
 function prepare(){
  playing=false;ended=false;entered=false;$('play').disabled=false;$('play').textContent='Spustit';config=M.setup(parameters());config.length=M.setup({species:config.mode!=='gyration'&&config.species==='electron'?'electron':'deuteron',energy:500,B:5}).length/100;config.R=config.radius*config.length;config.initial.r=config.mode==='curvature'?[config.R,0,0]:[config.start[0]*config.length,config.start[1]*config.length,(config.start[2]||0)*config.length];samples=[{r:[...config.initial.r],v:[...config.initial.v],t:0,...M.diagnostics(config,config.initial)}];camera=[0,0,0];
  extent=1;
  graphMin=-4*config.length;graphMax=4*config.length;axisNoticeUntil=0;$('axisNotice').hidden=true;
  $('rate').max=config.mode==='gyration'?'4':String(Math.log10(3));$('rate').value=String(Math.min(Number($('rate').value),Number($('rate').max)));
  frame=0;companions=config.mode==='gyration'?companionIds.map((id,j)=>makeCompanion(id,j)):[];$('compareRow').hidden=config.mode!=='gyration';$('speciesRow').hidden=config.mode==='gyration';for(const [id,node]of particleChoices)$(node).checked=id===config.species||companionIds.includes(id);$('graphTitle').textContent=config.mode==='gyration'?'Příčný pohyb · '+{proton:'proton',deuteron:'deuteron',alpha:'alfa částice',electron:'elektron'}[config.species]:'Příčný pohyb';
  $('electricRow').hidden=config.mode!=='electric';$('gradientRow').hidden=config.mode!=='gradient';$('radiusRow').hidden=config.mode!=='curvature';$('angleRow').hidden=config.mode!=='entry';$('pitchRow').hidden=config.mode==='entry';
  $('sceneTitle').textContent=names[config.mode];$('sceneHint').textContent=config.mode==='entry'?'Přetáhni částici dovnitř nebo ven z pole a spusť pokus.':config.mode==='curvature'?'Tažením otáčej prostorový pohled.':config.mode==='gyration'?'Tažení pozadí: otáčení · kolečko: zoom · dvojklik: kolmý pohled.':'Při pauze lze částici přetáhnout. Stopa ukazuje poslední pohyb.';
  $('geometry').textContent=config.mode==='curvature'?'Prostorový pohled · kruhové siločáry konstantní velikosti pole':config.mode==='gyration'?'Prostorový pohled · magnetické pole podél siločar':'Příčný průmět · magnetické pole kolmo k ploše';
  tex($('bValue'),quantity(config.B,'T'));tex($('energyValue'),quantity(config.energy,'eV'));tex($('pitchValue'),num(config.pitch,0)+'^\\circ');tex($('angleValue'),num(config.angle,0)+'^\\circ');tex($('electricValue'),quantity(config.electric,'V\\,m^{-1}'));tex($('gradientValue'),quantity(config.gradient/config.length,'m^{-1}'));tex($('radiusValue'),quantity(config.R,'m'));
  $('sceneMath').replaceChildren();$('graphMath').replaceChildren();render();
 }
 function size(c){const w=c.clientWidth,h=c.clientHeight,d=Math.min(devicePixelRatio||1,2)*Math.min(2,c.getBoundingClientRect().width/w);const nw=Math.max(1,Math.round(w*d)),nh=Math.max(1,Math.round(h*d));if(c.width!==nw||c.height!==nh){c.width=nw;c.height=nh;}const g=c.getContext('2d');g.setTransform(nw/w,0,0,nh/h,0,0);g.clearRect(0,0,w,h);return [w,h];}
 function viewBasis(){return {right:[Math.cos(gyaw),-Math.sin(gyaw),0],up:[Math.sin(gyaw)*Math.cos(gtilt),Math.cos(gyaw)*Math.cos(gtilt),Math.sin(gtilt)]};}
 function project(r){
  const L=config.length,scale=Math.min((width-90)/12,(height-135)/10)/extent;
  if(config.mode==='gyration'){const {right,up}=viewBasis(),v=r.map((a,k)=>a-camera[k]);return [width/2+v.reduce((a,b,k)=>a+b*right[k],0)/L*scale,height/2+18-v.reduce((a,b,k)=>a+b*up[k],0)/L*scale];}
  if(config.mode!=='curvature')return [(config.mode==='entry'?width*.27:width/2)+(r[0]-camera[0])/L*scale,height/2+18-(r[1]-camera[1])/L*scale];
  const k=Math.min((width-110),(height-150))/(2.8*6*config.length),x=r[0]*Math.cos(yaw)-r[1]*Math.sin(yaw),y=r[0]*Math.sin(yaw)+r[1]*Math.cos(yaw);return [width/2+x*k,height/2+25+(y*Math.sin(tilt)-(r[2]-camera[2])*Math.cos(tilt))*k];
 }
 function line(g,a,b,color,width=1,dash=[]){g.beginPath();g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash);g.moveTo(...a);g.lineTo(...b);g.stroke();g.setLineDash([]);}
 function arrow(a,b,color){
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<.01)return;
  const ux=dx/length,uy=dy/length,head=Math.min(9*Math.cos(.4),length*.65),wing=head*Math.tan(.4),shaft=Math.min(1,wing*.5),base=[b[0]-head*ux,b[1]-head*uy];
  // One filled silhouette: the shaft ends at the head base, never at its tip.
  const offset=(p,w)=>[p[0]-uy*w,p[1]+ux*w];
  const points=[offset(a,shaft),offset(base,shaft),offset(base,wing),b,offset(base,-wing),offset(base,-shaft),offset(a,-shaft)];
  ctx.beginPath();ctx.fillStyle=color;ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fill();
 }
 function path(points,color,lw=1.5,dash=[]){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.setLineDash(dash);let started=false;for(const p of points){if(!p){started=false;continue;}const xy=project(p);if(started)ctx.lineTo(...xy);else ctx.moveTo(...xy);started=true;}ctx.stroke();ctx.setLineDash([]);}
 function drawField(){
  const boundary=Math.max(0,Math.min(width,project([0,0,0])[0])),L=config.length;
  if(config.mode==='curvature'){
   for(const z of [-1,0,1])for(const r of [.8,1,1.2]){const points=Array.from({length:121},(_,i)=>{const t=2*Math.PI*i/120;return [config.R*r*Math.cos(t),config.R*r*Math.sin(t),z*L];});path(points,HiFyzikoParticleStyle.fields.magnetic,1);}
   const p=project([config.R,0,0]),q=project([config.R,sign*L,0]);arrow(p,q,HiFyzikoParticleStyle.fields.magnetic);label($('sceneMath'),'b','\\boldsymbol B',q[0]+15,q[1]);return;
  }
  if(config.mode==='gyration'&&Math.abs(gtilt)>.02){for(const x of [-4.5,-3,-1.5,0,1.5,3,4.5])for(const y of [-4.5,-3,-1.5,0,1.5,3,4.5]){const a=[x*L,y*L,-2.5*L],b=[x*L,y*L,2.5*L];path([a,b],'rgba(53,106,195,.3)',.8);const mid=[x*L,y*L,0],tip=[x*L,y*L,sign*L];arrow(project(mid),project(tip),HiFyzikoParticleStyle.fields.magnetic);}const tip=project([4.5*L,4.5*L,sign*L]);label($('sceneMath'),'b','\\boldsymbol B',tip[0]+16,tip[1]-12);}else{if(config.mode==='gyration')$('sceneMath').querySelector('[data-key="b"]')?.remove();
  for(let x=40;x<width-20;x+=48)for(let y=100;y<height-55;y+=48){if(config.mode==='entry'&&(x<boundary+12||(Math.abs(x-(boundary+90))<54&&Math.abs(y-100)<23)))continue;if(config.mode==='electric'&&Math.abs(x-(width-65))<50&&y<165||config.mode==='gradient'&&Math.abs(x-width/2)<65&&y<130)continue;ctx.strokeStyle=HiFyzikoParticleStyle.fields.magnetic;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,4,0,2*Math.PI);ctx.stroke();if(sign>0){ctx.fillStyle=HiFyzikoParticleStyle.fields.magnetic;ctx.beginPath();ctx.arc(x,y,1.6,0,2*Math.PI);ctx.fill();}else{line(ctx,[x-3,y-3],[x+3,y+3],HiFyzikoParticleStyle.fields.magnetic,1.2);line(ctx,[x-3,y+3],[x+3,y-3],HiFyzikoParticleStyle.fields.magnetic,1.2);}}
  }
  if(config.mode==='entry'){line(ctx,[boundary,74],[boundary,height-40],HiFyzikoParticleStyle.fields.magnetic,2);label($('sceneMath'),'outside','B=0',boundary-80,100);label($('sceneMath'),'inside','\\boldsymbol B'+(sign>0?'\\;\\odot':'\\;\\otimes'),boundary+90,100);}
  if(config.mode==='electric'||config.mode==='gradient'){const direction=config.mode==='electric'?Math.sign(config.electric):Math.sign(config.gradient),a=config.mode==='electric'?[width-65,110-35*direction]:[width/2-45*direction,110],b=config.mode==='electric'?[width-65,110+35*direction]:[width/2+45*direction,110];if(direction)arrow(a,b,config.mode==='electric'?HiFyzikoParticleStyle.fields.electric:HiFyzikoParticleStyle.fields.magnetic);label($('sceneMath'),'external',config.mode==='electric'?'\\boldsymbol E':'\\nabla B',config.mode==='electric'?width-88:width/2,config.mode==='electric'?110:91);}
  const barLength=Math.min((width-90)/12,(height-135)/10),a=[30,height-83],b=[30+barLength,height-83],cardWidth=Math.max(125,barLength+32);
  if(config.mode==='gyration'){ctx.fillStyle='#ffffff';ctx.fillRect(16,height-104,cardWidth,61);ctx.strokeStyle='#dbe2e6';ctx.lineWidth=.8;ctx.strokeRect(16,height-104,cardWidth,61);}
  line(ctx,a,b,'#344c59',2);line(ctx,[a[0],a[1]-4],[a[0],a[1]+4],'#344c59');line(ctx,[b[0],b[1]-4],[b[0],b[1]+4],'#344c59');label($('sceneMath'),'scale',quantity(L*extent,'m'),16+cardWidth/2,height-61);
 }
 function drawTail(index,history=samples,period=config.period){
  const now=history[index].t,duration=period*(config.mode==='gyration'?2.5:.85),first=Math.max(0,index-(config.mode==='gyration'?1200:360));ctx.save();ctx.lineCap='round';
  let start=first;for(let j=index;j>first;j--)if(history[j].breakBefore){start=j;break;}
  for(let j=start+1;j<=index;j++){const a=history[j-1],b=history[j],age=now-b.t;if(b.breakBefore)continue;if(age>duration||age<0)continue;const weight=1-age/duration;line(ctx,project(a.r),project(b.r),'rgba(185,121,57,'+(.8*weight*weight)+')',.3+6*weight*weight);}
  ctx.restore();
 }
 function drawGyrationCircle(state){
  if(!state.center||state.rho<=0)return;const field=M.fields(config,state.r).B,length=M.norm(field),normal=field.map(v=>v/length),axis=Math.abs(normal[2])<.9?[0,0,1]:[1,0,0],u=M.cross(normal,axis),ul=M.norm(u),first=u.map(v=>v/ul),second=M.cross(normal,first);
  const points=Array.from({length:121},(_,j)=>{const a=j*2*Math.PI/120;return state.center.map((v,k)=>v+state.rho*(Math.cos(a)*first[k]+Math.sin(a)*second[k]));});path(points,'rgba(22,125,115,.24)',.85,[3,6]);
 }
 function electronDetail(state,glyphs){
  const xy=project(state.r),glow=ctx.createRadialGradient(...xy,2,...xy,17);glow.addColorStop(0,'rgba(18,107,195,.22)');glow.addColorStop(.45,'rgba(18,107,195,.12)');glow.addColorStop(1,'rgba(18,107,195,0)');ctx.beginPath();ctx.arc(...xy,17,0,2*Math.PI);ctx.fillStyle=glow;ctx.fill();
  if(config.mode!=='gyration'||!state.center)return;
  const x=width-192,y=height-220,c=[x+88,y+86],radius=42;
  ctx.fillStyle='#f6f9fc';ctx.fillRect(x,y,176,168);ctx.strokeStyle='#b9cde0';ctx.lineWidth=1;ctx.strokeRect(x,y,176,168);
  ctx.beginPath();ctx.arc(...c,radius,0,2*Math.PI);ctx.setLineDash([3,5]);ctx.strokeStyle='#6a9ccc';ctx.stroke();ctx.setLineDash([]);
  line(ctx,[c[0]-5,c[1]],[c[0]+5,c[1]],'#6590b7');line(ctx,[c[0],c[1]-5],[c[0],c[1]+5],'#6590b7');
  const radial=state.r.map((v,k)=>v-state.center[k]),norm=Math.hypot(radial[0],radial[1]);if(norm>0){const dot=[c[0]+radius*radial[0]/norm,c[1]-radius*radial[1]/norm];line(ctx,c,dot,'#8aafd0',.7,[3,4]);glyphs.push({id:'electron',detail:true,x:dot[0],y:dot[1],radius:10,vibration:0});if(!view){ctx.beginPath();ctx.arc(...dot,6,0,2*Math.PI);ctx.fillStyle='#126bc3';ctx.fill();}}
  label($('sceneMath'),'electronZoomTitle','\\text{Detail elektronu}',x+88,y+18);label($('sceneMath'),'electronZoomRadius','r_L='+quantity(state.rho,'m'),x+88,y+143);
 }
 function drawComparison(){
  const items=[{config,samples},...companions],maximum=Math.max(...items.map(item=>item.samples.at(-1).rho),1e-30);
  tex($('radiusHeading'),'r_L\\,(\\mathrm{mm})');tex($('periodHeading'),'T_c\\,(\\mathrm{ns})');
  for(const id of ['proton','deuteron','alpha','electron']){const item=items.find(item=>item.config.species===id);$('compare-'+id).hidden=!item;if(!item)continue;
   const state=item.samples.at(-1);tex($('name-'+id),{proton:'\\mathrm p^+',deuteron:'\\mathrm D^+',alpha:'{}^4\\mathrm{He}^{2+}',electron:'\\mathrm e^-'}[id]);
   $('bar-'+id).style.width=(100*state.rho/maximum)+'%';tex($('rho-'+id),num(state.rho*1000,state.rho*1000<.01?5:3));tex($('period-'+id),num(item.config.period*1e9,item.config.period*1e9<.1?4:2));
  }
 }
 function drawGraph(index){
  const [w,h]=size(graph),axis=config.mode==='curvature'?2:config.mode==='electric'?0:1,windowTime=8*2*Math.PI*config.m/(Math.abs(config.q)*5),tmax=Math.max(windowTime,samples.at(-1).t),tmin=Math.max(0,tmax-windowTime);
  let low=graphMin,high=graphMax;for(const state of samples){if(state.t<tmin)continue;for(const point of [state.r,$('centers').checked?state.center:null])if(point){low=Math.min(low,point[axis]);high=Math.max(high,point[axis]);}}
  if(low<graphMin||high>graphMax){const span=Math.max(high-low,config.length),raw=span/4,power=10**Math.floor(Math.log10(raw)),step=[1,2,5,10].find(v=>v*power>=raw)*power;graphMin=Math.min(graphMin,Math.floor((low-span*.08)/step)*step);graphMax=Math.max(graphMax,Math.ceil((high+span*.08)/step)*step);axisNoticeUntil=Date.now()+1700;$('axisNotice').hidden=false;}
  const min=graphMin,max=graphMax,yFactor=(max-min)*1000<.1?1e6:1000,yUnit=yFactor===1e6?'\\mu m':'mm',tFactor=windowTime<1e-6?1e9:1e6,tUnit=tFactor===1e9?'ns':'\\mu s',digits=step=>Math.max(0,Math.min(10,1-Math.floor(Math.log10(Math.abs(step))))),yd=digits((max-min)*yFactor/4),td=digits(windowTime*tFactor/4);
  const left=62,right=w-18,top=42,bottom=h-58,px=t=>left+(t-tmin)/windowTime*(right-left),py=y=>bottom-(y-min)/(max-min)*(bottom-top);
  for(let i=0;i<5;i++){const v=min+(max-min)*i/4,y=py(v);line(gc,[left,y],[right,y],i===2?'#c5cdd2':'#e0e5e8',i===2?1:.7);line(gc,[left-4,y],[left,y],'#77858e',.8);label($('graphMath'),'y'+i,num(v*yFactor,yd),left-9,y);}
  for(let j=0;j<=4;j++){const x=left+(right-left)*j/4;line(gc,[x,top],[x,bottom],'#e0e5e8',.7);line(gc,[x,bottom],[x,bottom+4],'#77858e',.8);if(j>0&&j<4)label($('graphMath'),'xtick'+j,num((tmin+windowTime*j/4)*tFactor,td),x,bottom+17);}
  line(gc,[left,top],[left,bottom],'#667680',.9);line(gc,[left,bottom],[right,bottom],'#667680',.9);
  label($('graphMath'),'axis',(axis===2?'z':axis===0?'x':'y')+'\\,(\\mathrm{'+yUnit+'})',left,14);label($('graphMath'),'time','t\\,(\\mathrm{'+tUnit+'})',(left+right)/2,h-12);label($('graphMath'),'zero',num(tmin*tFactor,td),left,bottom+17);label($('graphMath'),'end',num(tmax*tFactor,td),right,bottom+17);
  gc.save();gc.beginPath();gc.rect(left,top,right-left,bottom-top);gc.clip();
  for(const [key,color]of [['r','#bd7030'],['center','#167d73']]){if(key==='center'&&!$('centers').checked)continue;gc.strokeStyle=color;gc.lineWidth=key==='r'?.9:1.8;gc.setLineDash(key==='center'?[5,4]:[]);gc.beginPath();let move=true;for(let i=0;i<=index;i++){const s=samples[i];if(!s[key]){move=true;continue;}if(s.breakBefore)move=true;const xy=[px(s.t),py(s[key][axis])];if(move)gc.moveTo(...xy);else gc.lineTo(...xy);move=false;}gc.stroke();gc.setLineDash([]);}
  line(gc,[px(samples[index].t),top],[px(samples[index].t),bottom],'#617c6e',1,[3,3]);gc.restore();
 }
 function render(){
  if(disposed||!config)return;[width,height]=size(canvas);const i=Math.min(samples.length-1,Math.max(0,Math.floor(frame))),s=samples[i];drawField();
  drawTail(i);
  const centerOn=$('centers').checked;if(centerOn)drawGyrationCircle(s);
  const p=project(s.r);if(centerOn&&s.center){const c=project(s.center);line(ctx,p,c,'rgba(22,125,115,.2)',.7,[3,6]);ctx.beginPath();ctx.arc(...c,3,0,2*Math.PI);ctx.strokeStyle='rgba(22,125,115,.5)';ctx.lineWidth=1;ctx.stroke();}
  const velScale=config.length*.95/config.speed,tip=project(s.r.map((r,k)=>r+s.v[k]*velScale));
  if($('vectors').checked){arrow(p,tip,'#b17b2c');label($('sceneMath'),'v','\\boldsymbol v',tip[0]+12,tip[1]-12);const f=M.norm(s.force);const old=$('sceneMath').querySelector('[data-key="f"]');if(f){const fp=project(s.r.map((r,k)=>r+s.force[k]/f*config.length*.7));arrow(p,fp,'#925daa');label($('sceneMath'),'f','\\boldsymbol F',fp[0]+12,fp[1]-10);}else old?.remove();}else{for(const key of ['v','f'])$('sceneMath').querySelector('[data-key="'+key+'"]')?.remove();}
  const glyphs=[{id:config.species,x:p[0],y:p[1],radius:12,vibration:0}];
  for(let j=0;j<companions.length;j++){const item=companions[j],state=item.samples.at(-1),xy=project(state.r);drawTail(item.samples.length-1,item.samples,item.config.period);if(centerOn)drawGyrationCircle(state);if(!view){ctx.beginPath();ctx.fillStyle=item.config.q>0?'#d74732':'#126bc3';ctx.arc(...xy,7,0,2*Math.PI);ctx.fill();}glyphs.push({id:item.config.species,x:xy[0],y:xy[1],radius:12,vibration:0});label($('sceneMath'),'companion'+j,{electron:'\\mathrm e^-',proton:'\\mathrm p^+',deuteron:'\\mathrm D^+',alpha:'{}^4\\mathrm{He}^{2+}'}[item.config.species],xy[0],xy[1]-25);}
  const electron=config.species==='electron'?s:companions.find(item=>item.config.species==='electron')?.samples.at(-1);if(electron)electronDetail(electron,glyphs);else for(const key of ['electronZoomTitle','electronZoomRadius'])$('sceneMath').querySelector('[data-key="'+key+'"]')?.remove();
  if(view)view.draw(width,height,s.t/config.period,glyphs);else{ctx.beginPath();ctx.fillStyle=config.q>0?'#d74732':'#126bc3';ctx.arc(...p,7,0,2*Math.PI);ctx.fill();}
  label($('sceneMath'),'particle',{electron:'\\mathrm e^-',proton:'\\mathrm p^+',deuteron:'\\mathrm D^+',alpha:'{}^4\\mathrm{He}^{2+}'}[config.species],p[0],p[1]-25);
  const comparing=config.mode==='gyration';$('comparison').hidden=!comparing;graph.hidden=comparing;$('graphMath').hidden=comparing;$('graphLegend').hidden=comparing;$('graphTitle').textContent=comparing?'Porovnání částic':'Příčný pohyb';if(comparing){$('axisNotice').hidden=true;drawComparison();}else drawGraph(i);tex($('timeValue'),quantity(s.t*1e6,'\\mu s'));tex($('rateValue'),num(animationRate())+'\\times');
  if(!$('readouts').children.length)for(let j=0;j<4;j++)$('readouts').append(document.createElement('div'));
  const values=['E_k='+quantity(s.energy,'eV'),s.center?'r_L='+quantity(s.rho,'m'):'B=0','|\\boldsymbol v_d|='+quantity(M.norm(s.drift),'m\\,s^{-1}'),'T_c='+quantity(config.period*1e6,'\\mu s')];values.forEach((t,j)=>tex($('readouts').children[j],t));
  const status=ended?'Částice opustila pole. Pokus skončil.':config.mode==='entry'?(s.center?'Částice se stáčí; magnetické pole nekoná práci.':i?'Mimo pole pokračuje částice přímo.':'Připraveno k vletu do magnetického pole.'):config.mode==='electric'?'Směr elektrického driftu nezávisí na náboji.':config.mode==='gradient'?'Změna znaménka náboje obrací směr driftu.':config.mode==='curvature'?'Drift směřuje kolmo k rovině kruhových siločar.':'Bez příčného driftu. Podélný pohyb se zachovává.';
  $('status').textContent=status;if($('status').scrollHeight>$('status').clientHeight||$('status').scrollWidth>$('status').clientWidth)$('status').textContent='';
 }
 function wrapGyration(c,state){
  const {up}=viewBasis();if(Math.abs(up[2])<.02||Math.abs(state.v[2])<c.speed*1e-10)return false;
  const scale=Math.min((width-90)/12,(height-135)/10)/(config.length*extent),margin=Math.min((height-180)*.3,state.rho*scale*Math.abs(Math.cos(gtilt))),top=80+margin,bottom=height-100-margin,span=bottom-top,xy=project(state.center||state.r);
  if(xy[1]>=top&&xy[1]<=bottom)return false;
  const target=top+((xy[1]-top)%span+span)%span;state.r=[state.r[0],state.r[1],state.r[2]+(xy[1]-target)/(scale*up[2])];state.breakBefore=true;Object.assign(state,M.diagnostics(c,state));return true;
 }
 function advance(seconds){
  const total=Math.min(config.period,...companions.map(item=>item.config.period))*seconds*animationRate()/2,steps=Math.max(1,Math.min(180,Math.ceil(seconds*90*animationRate()))),dt=total/steps;
  for(let k=0;k<steps;k++){const old=samples.at(-1);let state={r:old.r,v:old.v};if(config.mode==='gyration'){const exact={config,samples:[old]};advanceCompanion(exact,dt,old.t+dt);state=exact.samples.at(-1);}else{const n=Math.max(12,Math.ceil(dt*Math.abs(config.q)*M.norm(M.fields(config,state.r).B)/config.m/.025));for(let j=0;j<n;j++)state=M.step(config,state,dt/n);}let elapsed=dt;
   const wrapped=config.mode==='gyration'&&wrapGyration(config,state);const screen=project(state.r);
   let respawn=false;
   if(config.mode!=='gyration'&&(screen[0]<-16||screen[0]>width+16||screen[1]<58||screen[1]>height-24)){const initial=M.setup(parameters()).initial;state={r:[...config.initial.r],v:[...initial.v]};respawn=true;entered=false;playing=false;$('play').textContent='Spustit';}
   for(const item of companions){advanceCompanion(item,elapsed,old.t+elapsed);wrapGyration(item.config,item.samples.at(-1));}
   samples.push({...state,t:old.t+elapsed,breakBefore:respawn||wrapped,...M.diagnostics(config,state)});if(ended||respawn)break;}
  if(config.mode==='gyration'){if(samples.length>1440)samples.splice(0,samples.length-1440);}else{const cutoff=samples.at(-1).t-8*2*Math.PI*config.m/(Math.abs(config.q)*5);let first=0;while(first+1<samples.length&&samples[first+1].t<cutoff)first++;if(first)samples.splice(0,first);}frame=samples.length-1;
 }
 function tick(now){if(disposed)return;if(speedNoticeUntil&&Date.now()>speedNoticeUntil){$('speedNotice').hidden=true;speedNoticeUntil=0;}if(axisNoticeUntil&&Date.now()>axisNoticeUntil){$('axisNotice').hidden=true;axisNoticeUntil=0;}const dt=Math.min((now-last)/1000,.08);last=now;if(playing){advance(dt);render();}raf=requestAnimationFrame(tick);}
 $('play').onclick=()=>{if(ended)return;playing=!playing;$('play').textContent=playing?'Pozastavit':'Spustit';};
 $('reset').onclick=()=>{prepare();playing=true;$('play').textContent='Pozastavit';};$('rate').oninput=render;
 function liveVelocity(v,old,next){
  const factor=Math.sqrt(next.energy*old.m/(old.energy*next.m));if(next.pitch===old.pitch&&next.angle===old.angle)return v.map(x=>x*factor);
  const speed=M.norm(v)*factor,pitch=next.pitch*Math.PI/180,phase=next.angle!==old.angle?next.angle*Math.PI/180:Math.atan2(v[1],v[0]);return [speed*Math.cos(pitch)*Math.cos(phase),speed*Math.cos(pitch)*Math.sin(phase),speed*Math.sin(pitch)];
 }
 function liveChange(){for(const item of companions){const old=item.config,state=item.samples.at(-1),next=M.setup({...parameters(),species:old.species});next.length=old.length;next.R=next.radius*next.length;state.v=liveVelocity(state.v,old,next);item.config=next;Object.assign(state,M.diagnostics(next,state));}const wasPlaying=playing,old=config,next=M.setup(parameters()),state=samples.at(-1),factor=Math.sqrt(next.energy*old.m/(old.energy*next.m));next.length=old.length;const entryScaleChange=next.mode==='entry'&&next.species!==old.species&&(next.species==='electron'||old.species==='electron');if(entryScaleChange)next.length=M.setup({species:next.species==='electron'?'electron':'deuteron',energy:500,B:5}).length/100;const positionScale=next.length/old.length;next.R=next.radius*next.length;next.initial.r=old.initial.r.map(v=>v*positionScale);config=next;const current={r:state.r.map(v=>v*positionScale),v:liveVelocity(state.v,old,next)};samples.push({...current,t:state.t,breakBefore:entryScaleChange,...M.diagnostics(config,current)});frame=samples.length-1;tex($('bValue'),quantity(config.B,'T'));tex($('energyValue'),quantity(config.energy,'eV'));tex($('pitchValue'),num(config.pitch,0)+'^\\circ');tex($('angleValue'),num(config.angle,0)+'^\\circ');tex($('electricValue'),quantity(config.electric,'V\\,m^{-1}'));tex($('gradientValue'),quantity(config.gradient/config.length,'m^{-1}'));tex($('radiusValue'),quantity(config.R,'m'));playing=wasPlaying;render();}
 for(const id of ['pitch','electric','gradient','radius','angle','b','energy'])$(id).oninput=liveChange;
 const particleChoices=[['proton','showProton'],['deuteron','showDeuteron'],['alpha','showAlpha'],['electron','showElectron']];
 for(const [id,node]of particleChoices)$(node).onchange=()=>{
  const selected=particleChoices.filter(([,n])=>$(n).checked).map(([key])=>key);if(!selected.length){$(node).checked=true;return;}
  const hadElectron=config.species==='electron'||companionIds.includes('electron'),time=samples.at(-1).t,oldPrimary=config.species;
  const pool=new Map(companions.map(item=>[item.config.species,item]));pool.set(oldPrimary,{config,initial:config.initial,samples});
  const primary=selected.includes(oldPrimary)?oldPrimary:selected[0],active=pool.get(primary);config=active.config;samples=active.samples;config.initial=active.initial;$('species').value=primary;frame=samples.length-1;
  companionIds=selected.filter(key=>key!==primary);companions=companionIds.map((key,j)=>{if(pool.has(key))return pool.get(key);const item=makeCompanion(key,j);item.samples[0].t=time;return item;});
  for(const el of [...$('sceneMath').children])if(el.dataset.key?.startsWith('companion')||el.dataset.key?.startsWith('electronZoom'))el.remove();
  $('graphTitle').textContent='Příčný pohyb · '+{proton:'proton',deuteron:'deuteron',alpha:'alfa částice',electron:'elektron'}[primary];
  if(selected.includes('electron')!==hadElectron){$('speedNotice').textContent=selected.includes('electron')?'Zpomalení času pro elektron':'Obnovení času pro ionty';$('speedNotice').hidden=false;speedNoticeUntil=Date.now()+2400;}
  render();
 };
 $('species').onchange=()=>{if(config.mode==='entry')liveChange();else prepare();};$('mode').onchange=()=>{config.start=$('mode').value==='entry'?[-3,0]:[0,0];$('pitch').value=$('mode').value==='curvature'?'65':'0';prepare();};$('reverse').onclick=()=>{sign=-sign;liveChange();};$('vectors').onchange=render;$('centers').onchange=render;
 $('help').onclick=()=>{playing=false;$('play').textContent='Spustit';$('guide').showModal();};$('closeHelp').onclick=()=>$('guide').close();
 const point=event=>{const r=canvas.getBoundingClientRect();return [(event.clientX-r.left)*width/r.width,(event.clientY-r.top)*height/r.height];};
 canvas.onwheel=event=>{if(config.mode!=='gyration'||drag)return;event.preventDefault();const p=point(event),scale=Math.min((width-90)/12,(height-135)/10),old=extent,delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height:1);extent=Math.max(.01,Math.min(4,extent*Math.exp(Math.max(-500,Math.min(500,delta))*.002)));const {right,up}=viewBasis(),dx=(p[0]-width/2)*config.length*(old-extent)/scale,dy=(height/2+18-p[1])*config.length*(old-extent)/scale;camera=camera.map((v,k)=>v+right[k]*dx+up[k]*dy);render();};
 canvas.ondblclick=()=>{if(config.mode==='gyration'){extent=1;camera=[0,0,0];gyaw=0;gtilt=0;render();}};
 canvas.onpointerdown=event=>{const p=point(event);if(config.mode==='gyration'){if(!playing){const states=[samples.at(-1),...companions.map(item=>item.samples.at(-1))];for(let j=states.length-1;j>=0;j--){const xy=project(states[j].r);if(Math.hypot(p[0]-xy[0],p[1]-xy[1])<25){drag={type:'arrange',index:j-1};break;}}}if(!drag)drag={type:'orbitView',p,gyaw,gtilt};}else if(config.mode==='curvature'){drag={type:'view',p,yaw,tilt};}else if(config.mode!=='curvature'&&(!playing||(config.mode==='entry'&&samples.at(-1).r[0]<0))){const state=samples.at(-1),c=project(state.r),tip=project(state.r.map((r,k)=>r+state.v[k]*config.length*.95/config.speed));if(Math.hypot(p[0]-c[0],p[1]-c[1])<25)drag={type:'position'};else if(Math.hypot(p[0]-tip[0],p[1]-tip[1])<25)drag={type:'angle'};}if(drag){if(drag.type!=='view'&&drag.type!=='orbitView'){playing=false;$('play').textContent='Spustit';}canvas.setPointerCapture(event.pointerId);}};
 canvas.onpointermove=event=>{if(!drag)return;const p=point(event);if(drag.type==='orbitView'){gyaw=drag.gyaw+(p[0]-drag.p[0])*.008;gtilt=Math.max(-Math.PI/2,Math.min(Math.PI/2,drag.gtilt+(p[1]-drag.p[1])*.008));render();return;}if(drag.type==='arrange'){const scale=Math.min((width-90)/12,(height-135)/10)/extent,item=drag.index<0?null:companions[drag.index],history=item?item.samples:samples,c=item?item.config:config,old=history.at(-1),xy=project(old.r),{right,up}=viewBasis(),dx=(Math.max(20,Math.min(width-20,p[0]))-xy[0])*config.length/scale,dy=(xy[1]-Math.max(80,Math.min(height-100,p[1])))*config.length/scale,r=old.r.map((v,k)=>v+right[k]*dx+up[k]*dy),state={r,v:[...old.v]};history.push({...state,t:old.t,breakBefore:true,...M.diagnostics(c,state)});if(item){item.initial.r=[...r];companionStarts[item.config.species]=[...r];}else{config.initial.r=[...r];config.start=r.map(v=>v/config.length);frame=samples.length-1;}render();return;}if(drag.type==='view'){yaw=drag.yaw+(p[0]-drag.p[0])*.008;tilt=Math.max(.1,Math.min(1.4,drag.tilt+(p[1]-drag.p[1])*.006));render();return;}
  const scale=Math.min((width-90)/12,(height-135)/10)/extent;if(drag.type==='position'){config.start=[Math.max(-3.8,Math.min(config.mode==='entry'?7:4.7,(p[0]-(config.mode==='entry'?width*.27:width/2))/scale)),Math.max(-2.5,Math.min(2.5,(height/2+18-p[1])/scale))];}else{const c=project(config.initial.r);$('angle').value=String(Math.max(-65,Math.min(65,Math.atan2(c[1]-p[1],p[0]-c[0])*180/Math.PI)));}prepare();};
 canvas.onpointerup=canvas.onpointercancel=()=>{const placed=drag&&drag.type!=='view'&&drag.type!=='orbitView'&&drag.type!=='arrange';drag=null;if(placed)prepare();};
 const resize=()=>render();addEventListener('resize',resize);const observer=new ResizeObserver(resize);observer.observe(canvas);
 window.HiFyzikoFusionDispose=()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();removeEventListener('resize',resize);view?.dispose();};
 prepare();raf=requestAnimationFrame(tick);
})();
