(()=>{'use strict';
 const M=DriftModel,$=id=>document.getElementById(id),canvas=$('scene'),graph=$('graph'),ctx=canvas.getContext('2d'),gc=graph.getContext('2d');
 const names={entry:'Z přímky na kružnici',gyration:'Kroužení kolem siločáry',electric:'E×B drift',gradient:'Grad-B drift',curvature:'Drift zakřivení'};
 const tex=(el,s)=>{if(el.dataset.texValue===s)return;el.dataset.texValue=s;katex.render(s,el,{throwOnError:false});};
 const num=(n,d=2)=>(Object.is(Number(n.toFixed(d)),-0)?0:Number(n.toFixed(d))).toLocaleString('cs-CZ',{maximumFractionDigits:d,useGrouping:false}).replace(',','{,}');
 const quantity=(n,unit)=>{const a=Math.abs(n);if(!a)return '0\\,\\mathrm{'+unit+'}';const exp=Math.floor(Math.log10(a));return (exp<-2||exp>3?num(n/10**exp)+'\\cdot10^{'+exp+'}':num(n))+'\\,\\mathrm{'+unit+'}';};
 function label(parent,key,s,x,y){let el=parent.querySelector('[data-key="'+key+'"]');if(!el){el=document.createElement('span');el.className='mathlabel';el.dataset.key=key;parent.append(el);}tex(el,s);el.style.left=x+'px';el.style.top=y+'px';return el;}
 let graphMin=0,graphMax=0,axisNoticeUntil=0,speedNoticeUntil=0;let companions=[],companionIds=[],companionStarts={};let ended=false,entered=false,camera=[0,0,0],config,samples,frame=0,playing=false,fieldSign=1,electricFraction=.4,last=0,raf=0,disposed=false,view=null,gyaw=0,gtilt=0,yaw=-.65,tilt=.65,drag=null,lorentzYaw=.7,lorentzTilt=.55,lorentzDrag=null,width=900,height=650,extent=1;
 try{view=new HiFyzikoNucleusView($('nuclei'));}catch{/* A labeled marker remains available without WebGL. */}
 for(const el of document.querySelectorAll('[data-tex]'))tex(el,el.dataset.tex);
 function makeCompanion(id,index){const c=M.setup({...parameters(),species:id});c.length=config.length;const initial={r:[...(companionStarts[id]||[[-3,0],[3,0],[0,2.5]][index].map(v=>v*config.length).concat(0))],v:[...c.initial.v]};return {config:c,initial,samples:[{...initial,t:0,...M.diagnostics(c,initial)}]};}
 // Exact homogeneous-field orbit, with the same physical dt for all species.
 function advanceCompanion(item,dt,time){const c=item.config,old=item.samples.at(-1),omega=c.q*c.B/c.m,a=omega*dt,co=Math.cos(a),si=Math.sin(a),sinc=a===0?1:si/a,cosc=a===0?0:2*Math.sin(a/2)**2/a,v=old.v,r=old.r;const state={v:[v[0]*co+v[1]*si,v[1]*co-v[0]*si,v[2]],r:[r[0]+dt*(v[0]*sinc+v[1]*cosc),r[1]+dt*(v[1]*sinc-v[0]*cosc),r[2]+v[2]*dt]};item.samples.push({...state,t:time,...M.diagnostics(c,state)});if(item.samples.length>1440)item.samples.shift();}
 const animationRate=()=>10**Number($('rate').value);
 function parameters(){return {mode:$('mode').value,species:$('species').value,B:fieldSign*Number($('b').value)/1000,energy:Number($('energy').value),pitch:Number($('pitch').value),electric:Number($('electric').value),gradient:Number($('gradient').value)/100,radius:Number($('radius').value),angle:Number($('angle').value),start:config?.start||[-3,0]};}
 function syncMagneticRange(){
  const input=$('b'),minimum=$('mode').value==='entry'?0:100;input.min=String(minimum);input.value=String(Math.max(minimum,Math.min(6000,Number(input.value))));
 }
 function syncElectricLimits(keepFraction=false){
  if($('mode').value!=='electric')return;
  const c=M.setup(parameters()),input=$('electric'),previous=Number(input.max),limit=.08*Math.abs(c.B)*c.speed;
  if(previous>0&&!input.disabled)electricFraction=Math.max(-1,Math.min(1,Number(input.value)/previous));
  if(!limit){input.min='0';input.max='0';input.step='1';input.value='0';input.disabled=true;return;}
  const step=10**(Math.floor(Math.log10(limit))-3),maximum=Math.floor(limit/step)*step,value=keepFraction||previous===0||Math.abs(c.B)!==Math.abs(config?.B??c.B)?electricFraction*maximum:Number(input.value);
  input.disabled=false;input.min=String(-maximum);input.max=String(maximum);input.step=String(step);input.value=String(Math.max(-maximum,Math.min(maximum,Math.round(value/step)*step)));
 }
 function prepare(keepView=false){
  const savedView={extent,camera:[...camera]};syncMagneticRange();syncElectricLimits();
  playing=false;ended=false;entered=false;$('play').disabled=false;$('play').textContent='Spustit';config=M.setup(parameters());config.length=M.setup({species:config.mode!=='gyration'&&config.species==='electron'?'electron':'deuteron',energy:500,B:.5}).length/10;config.R=config.radius*config.length;config.initial.r=config.mode==='curvature'?[config.R,0,0]:[config.start[0]*config.length,config.start[1]*config.length,(config.start[2]||0)*config.length];samples=[{r:[...config.initial.r],v:[...config.initial.v],t:0,...M.diagnostics(config,config.initial)}];camera=[0,0,0];
  extent=keepView?savedView.extent:1;if(keepView)camera=savedView.camera;
  graphMin=-4*config.length;graphMax=4*config.length;axisNoticeUntil=0;$('axisNotice').hidden=true;
  $('rate').max=config.mode==='gyration'?'4':String(Math.log10(3));$('rate').value=String(Math.min(Number($('rate').value),Number($('rate').max)));
  frame=0;companions=config.mode==='gyration'?companionIds.map((id,j)=>makeCompanion(id,j)):[];$('compareRow').hidden=config.mode!=='gyration';$('speciesRow').hidden=config.mode==='gyration';for(const [id,node]of particleChoices)$(node).checked=id===config.species||companionIds.includes(id);$('graphTitle').textContent=config.mode==='gyration'?'Příčný pohyb · '+{proton:'proton',deuteron:'deuteron',alpha:'alfa částice',electron:'elektron'}[config.species]:'Příčný pohyb';
  $('electricRow').hidden=config.mode!=='electric';$('gradientRow').hidden=config.mode!=='gradient';$('radiusRow').hidden=config.mode!=='curvature';$('angleRow').hidden=config.mode!=='entry';$('pitchRow').hidden=config.mode==='entry';
  $('sceneTitle').textContent=names[config.mode];$('sceneHint').textContent=config.mode==='entry'?'Přetáhni částici dovnitř nebo ven z pole a spusť pokus.':config.mode==='curvature'?'Tažení: otáčení · kolečko: zoom · dvojklik: výchozí pohled.':config.mode==='gyration'?'Tažení pozadí: otáčení · kolečko: zoom · dvojklik: kolmý pohled.':'Kolečko: zoom · dvojklik: výchozí pohled · při pauze lze částici přetáhnout.';
  $('geometry').textContent=config.mode==='curvature'?'Prostorový pohled · kruhové siločáry konstantní velikosti pole':config.mode==='gyration'?'Prostorový pohled · magnetické pole podél siločar':'Příčný průmět · magnetické pole kolmo k ploše';
  tex($('bValue'),quantity(config.B,'T'));tex($('energyValue'),quantity(config.energy,'eV'));tex($('pitchValue'),num(config.pitch,0)+'^\\circ');tex($('angleValue'),num(config.angle,0)+'^\\circ');tex($('electricValue'),quantity(config.electric,'V\\,m^{-1}'));tex($('gradientValue'),quantity(config.gradient/config.length,'m^{-1}'));tex($('radiusValue'),quantity(config.R,'m'));
  $('sceneMath').replaceChildren();$('graphMath').replaceChildren();render();
 }
 function size(c){const w=c.clientWidth,h=c.clientHeight,d=Math.min(devicePixelRatio||1,2)*Math.min(2,c.getBoundingClientRect().width/w);const nw=Math.max(1,Math.round(w*d)),nh=Math.max(1,Math.round(h*d));if(c.width!==nw||c.height!==nh){c.width=nw;c.height=nh;}const g=c.getContext('2d');g.setTransform(nw/w,0,0,nh/h,0,0);g.clearRect(0,0,w,h);return [w,h];}
 function viewBasis(){return {right:[Math.cos(gyaw),-Math.sin(gyaw),0],up:[Math.sin(gyaw)*Math.cos(gtilt),Math.cos(gyaw)*Math.cos(gtilt),Math.sin(gtilt)]};}
 function projectionFrame(){
  const curved=config.mode==='curvature',basis=curved?{right:[Math.cos(yaw),-Math.sin(yaw),0],up:[-Math.sin(yaw)*Math.sin(tilt),-Math.cos(yaw)*Math.sin(tilt),Math.cos(tilt)]}:config.mode==='gyration'?viewBasis():{right:[1,0,0],up:[0,1,0]};
  return {...basis,origin:[config.mode==='entry'?width*.27:width/2,height/2+(curved?25:18)],scale:(curved?Math.min(width-110,height-150)/(2.8*6):Math.min((width-90)/12,(height-135)/10))/extent};
 }
 function project(r){
  const {right,up,origin,scale}=projectionFrame(),v=r.map((a,k)=>a-camera[k]);return [origin[0]+M.dot(v,right)/config.length*scale,origin[1]-M.dot(v,up)/config.length*scale];
 }
 function keepElectricVisible(state){
  const p=project(state.r),scale=projectionFrame().scale,dx=p[0]-Math.max(60,Math.min(width-60,p[0])),dy=p[1]-Math.max(165,Math.min(height-125,p[1]));
  camera[0]+=dx*config.length/scale;camera[1]-=dy*config.length/scale;
 }

 function line(g,a,b,color,width=1,dash=[]){g.beginPath();g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash);g.moveTo(...a);g.lineTo(...b);g.stroke();g.setLineDash([]);}
 function arrow(a,b,color,g=ctx,shaftWidth=1){
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<.01)return;
  const ux=dx/length,uy=dy/length,head=Math.min(9*Math.cos(.4),length*.65),wing=head*Math.tan(.4),shaft=Math.min(shaftWidth,wing*.5),base=[b[0]-head*ux,b[1]-head*uy];
  // One filled silhouette: the shaft ends at the head base, never at its tip.
  const offset=(p,w)=>[p[0]-uy*w,p[1]+ux*w];
  const points=[offset(a,shaft),offset(base,shaft),offset(base,wing),b,offset(base,-wing),offset(base,-shaft),offset(a,-shaft)];
  g.beginPath();g.fillStyle=color;g.moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);g.closePath();g.fill();
 }
 function path(points,color,lw=1.5,dash=[]){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.setLineDash(dash);let started=false;for(const p of points){if(!p){started=false;continue;}const xy=project(p);if(started)ctx.lineTo(...xy);else ctx.moveTo(...xy);started=true;}ctx.stroke();ctx.setLineDash([]);}
 function magneticAppearance(B){
  const level=Math.sqrt(Math.max(0,Math.min(1,Math.abs(B)/6))),hex=HiFyzikoParticleStyle.fields.magnetic,rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',');
  return {color:'rgba('+rgb+','+(.24+.66*level).toFixed(3)+')',lineColor:'rgba('+rgb+','+(.12+.32*level).toFixed(3)+')',rgb,glowAlpha:.06+.12*level,radius:2.4+4.6*level,width:.75+level,arrowLength:.55+level};
 }
 function drawMagneticGlow(x,y,style,radius){
  const glow=ctx.createRadialGradient(x,y,0,x,y,radius),color=a=>'rgba('+style.rgb+','+a.toFixed(3)+')';
  glow.addColorStop(0,color(style.glowAlpha));glow.addColorStop(.35,color(style.glowAlpha*.65));glow.addColorStop(.7,color(style.glowAlpha*.15));glow.addColorStop(1,color(0));
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,radius,0,2*Math.PI);ctx.fill();
 }
 function magneticArrow(a,b,style){
  ctx.save();ctx.shadowColor='rgba('+style.rgb+','+style.glowAlpha.toFixed(3)+')';ctx.shadowBlur=style.radius*1.6;ctx.shadowOffsetX=ctx.shadowOffsetY=0;arrow(a,b,style.color);ctx.restore();
 }
 function drawField(){
  const boundary=Math.max(0,Math.min(width,project([0,0,0])[0])),L=config.length,sign=Math.sign(config.B),style=magneticAppearance(config.B);
  if(!sign){for(const key of ['inside','outside','external'])$('sceneMath').querySelector('[data-key="'+key+'"]')?.remove();label($('sceneMath'),'b','B=0',width-65,110);return;}
  if($('sceneMath').querySelector('[data-key="b"]')?.dataset.texValue==='B=0')$('sceneMath').querySelector('[data-key="b"]').remove();
  if(config.mode==='curvature'){
   for(const z of [-1,0,1])for(const r of [.8,1,1.2]){const points=Array.from({length:121},(_,i)=>{const t=2*Math.PI*i/120;return [config.R*r*Math.cos(t),config.R*r*Math.sin(t),z*L];});path(points,style.lineColor,style.width*.8);}
   const p=project([config.R,0,0]),q=project([config.R,sign*L*style.arrowLength,0]);magneticArrow(p,q,style);label($('sceneMath'),'b','\\mathbf B',q[0]+15,q[1]);return;
  }
  if(config.mode==='gyration'&&Math.abs(gtilt)>.02){
   for(const x of [-4.5,-3,-1.5,0,1.5,3,4.5])for(const y of [-4.5,-3,-1.5,0,1.5,3,4.5]){const a=[x*L,y*L,-2.5*L],b=[x*L,y*L,2.5*L];path([a,b],style.lineColor,style.width*.65);const mid=[x*L,y*L,0],tip=[x*L,y*L,sign*L*style.arrowLength];magneticArrow(project(mid),project(tip),style);}
   const tip=project([4.5*L,4.5*L,sign*L*style.arrowLength]);label($('sceneMath'),'b','\\mathbf B',tip[0]+16,tip[1]-12);
  }else{
   if(config.mode==='gyration')$('sceneMath').querySelector('[data-key="b"]')?.remove();
   const frame=projectionFrame();
   for(let x=40;x<width-20;x+=48)for(let y=100;y<height-55;y+=48){
    if(config.mode==='entry'&&(x<boundary+12||(Math.abs(x-(boundary+90))<54&&Math.abs(y-100)<23)))continue;
    if(config.mode==='electric'&&Math.abs(x-(width-65))<50&&y<165||config.mode==='gradient'&&Math.abs(x-width/2)<65&&y<130)continue;
    const r=[camera[0]+(x-frame.origin[0])*L/frame.scale,camera[1]+(frame.origin[1]-y)*L/frame.scale,0],B=M.norm(M.fields(config,r).B),mark=magneticAppearance(B);if(!B)continue;
    drawMagneticGlow(x,y,mark,config.mode==='entry'?Math.min(mark.radius*3.2,x-boundary):mark.radius*3.2);
    ctx.strokeStyle=mark.color;ctx.lineWidth=mark.width;ctx.beginPath();ctx.arc(x,y,mark.radius,0,2*Math.PI);ctx.stroke();
    if(sign>0){ctx.fillStyle=mark.color;ctx.beginPath();ctx.arc(x,y,mark.radius*.35,0,2*Math.PI);ctx.fill();}else{const d=mark.radius*.72;line(ctx,[x-d,y-d],[x+d,y+d],mark.color,mark.width);line(ctx,[x-d,y+d],[x+d,y-d],mark.color,mark.width);}
   }
  }
  if(config.mode==='entry'){line(ctx,[boundary,74],[boundary,height-40],style.color,style.width+.5);label($('sceneMath'),'outside','B=0',boundary-80,100);label($('sceneMath'),'inside','\\mathbf B'+(sign>0?'\\;\\odot':'\\;\\otimes'),boundary+90,100);}
  if(config.mode==='electric'||config.mode==='gradient'){const direction=config.mode==='electric'?Math.sign(config.electric):Math.sign(config.gradient),half=35*Math.min(1,Math.abs(config.electric)/(Number($('electric').max)||1)),a=config.mode==='electric'?[width-65,110-half*direction]:[width/2-45*direction,110],b=config.mode==='electric'?[width-65,110+half*direction]:[width/2+45*direction,110];if(direction)arrow(a,b,config.mode==='electric'?HiFyzikoParticleStyle.fields.electric:style.color);label($('sceneMath'),'external',config.mode==='electric'?'\\mathbf E':'\\nabla B',config.mode==='electric'?width-88:width/2,config.mode==='electric'?110:91);}
 }
 function drawScale(){
  const barLength=projectionFrame().scale*extent,a=[30,height-83],b=[30+barLength,height-83],cardWidth=Math.max(125,barLength+32);
  ctx.fillStyle='#ffffff';ctx.fillRect(16,height-104,cardWidth,61);ctx.strokeStyle='#dbe2e6';ctx.lineWidth=.8;ctx.strokeRect(16,height-104,cardWidth,61);
  line(ctx,a,b,'#344c59',2);line(ctx,[a[0],a[1]-4],[a[0],a[1]+4],'#344c59');line(ctx,[b[0],b[1]-4],[b[0],b[1]+4],'#344c59');label($('sceneMath'),'scale',quantity(config.length*extent,'m'),16+cardWidth/2,height-61);
 }
 function drawTail(index,history=samples,period=config.timePeriod){
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
  const x=18,y=height-300,c=[x+88,y+86],radius=42;
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
   $('bar-'+id).style.width=(100*state.rho/maximum)+'%';tex($('rho-'+id),item.config.B?num(state.rho*1000,state.rho*1000<.01?5:3):'\\text{—}');tex($('period-'+id),Number.isFinite(item.config.period)?num(item.config.period*1e9,item.config.period*1e9<.1?4:2):'\\infty');
  }
 }
 function drawGraph(index){
  const [w,h]=size(graph),axis=config.mode==='curvature'?2:config.mode==='electric'?0:1,windowTime=8*2*Math.PI*config.m/(Math.abs(config.q)*.5),tmax=Math.max(windowTime,samples.at(-1).t),tmin=Math.max(0,tmax-windowTime);
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
 function drawLorentz(state){
  const panel=$('lorentzPanel');tex($('lorentzCharge'),'q='+(config.q<0?'-':'+')+(Math.abs(config.q/M.e)>1.5?'2':'')+'e');
  if(panel.open===false)return;
  const localFields=M.fields(config,state.r),preview=config.mode==='entry'&&M.norm(localFields.B)===0&&config.B!==0,fields=preview?{B:[0,0,config.B],E:[0,0,0]}:localFields;
  $('lorentzPreview').hidden=!preview;
  const electric=M.norm(fields.E)>0,product=M.cross(state.v,fields.B),magneticForce=product.map(v=>v*config.q),electricForce=fields.E.map(v=>v*config.q),magneticTolerance=Math.abs(config.q)*M.norm(state.v)*M.norm(fields.B)*1e-10;
  tex($('lorentzFormula'),electric?'\\mathbf F=q(\\mathbf E+\\mathbf v\\times\\mathbf B)':'\\mathbf F=\\mathbf F_B=q(\\mathbf v\\times\\mathbf B)');
  const c=$('lorentzCanvas'),g=c.getContext('2d'),[w,h]=size(c),parent=$('lorentzMath'),right=[Math.cos(lorentzYaw),-Math.sin(lorentzYaw),0],up=[-Math.sin(lorentzYaw)*Math.sin(lorentzTilt),-Math.cos(lorentzYaw)*Math.sin(lorentzTilt),Math.cos(lorentzTilt)],depth=M.cross(right,up),diagramScale=Math.min(w/342,h/280)*1.22;
  for(const el of parent.children)el.hidden=true;const placed=[],segments=[];
  // Fixed SI references preserve magnitude changes; a shared fit prevents clipping.
  const visualLength=(key,norm)=>{const scales={v:[82,1e4,2e7],b:[88,.1,6],c:[128,100,1.5e8],fb:[54,1e-17,3e-11],e:[64,1,1e7],fe:[28,1e-17,3e-11],f:[28,1e-17,3e-11]},[maximum,reference,range]=scales[key];return key==='b'?maximum*Math.sqrt(norm/range):maximum*Math.log1p(norm/reference)/Math.log1p(range/reference);};
  const mainFit=Math.min(1,100/Math.max(visualLength('v',M.norm(state.v)),visualLength('b',M.norm(fields.B)),visualLength('c',M.norm(product)),visualLength('fb',M.norm(magneticForce)),1));
  const totalForce=magneticForce.map((v,k)=>v+electricForce[k]),forceMaximum=M.norm(magneticForce)+Math.max(M.norm(electricForce),config.mode==='electric'?Math.abs(config.q)*Number($('electric').max):0),forceGain=forceMaximum?90*Math.log1p(forceMaximum/1e-18)/Math.log1p(3e-11/1e-18)/forceMaximum:0;

  function vector(key,value,origin,color,zeroTolerance=0){
   const norm=M.norm(value),zero=norm<=zeroTolerance,length=(['fb','fe','f'].includes(key)?norm*forceGain:visualLength(key,norm))*mainFit*diagramScale,unit=zero?[0,0,0]:value.map(v=>v/norm),dx=M.dot(unit,right),dy=-M.dot(unit,up),projected=Math.hypot(dx,dy);
   let tip=[origin[0]+length*dx,origin[1]+length*dy],labelPoint;
   if(zero)return;
   else if(projected<.12){g.strokeStyle=color;g.lineWidth=1.3;g.beginPath();g.arc(...origin,4,0,2*Math.PI);g.stroke();if(M.dot(unit,depth)>0){g.fillStyle=color;g.beginPath();g.arc(...origin,1.5,0,2*Math.PI);g.fill();}else{line(g,[origin[0]-3,origin[1]-3],[origin[0]+3,origin[1]+3],color);line(g,[origin[0]-3,origin[1]+3],[origin[0]+3,origin[1]-3],color);}labelPoint=[origin[0]+12,origin[1]-12];}
   else{arrow(origin,tip,color,g,1.8);const gap=key==='fb'||key==='fe'?26:22;labelPoint=[tip[0]+gap*dx/projected,tip[1]+gap*dy/projected];}
   segments.push([origin,tip]);
   const symbol={v:'\\mathbf v',b:'\\mathbf B',fb:'\\mathbf F_B',e:'\\mathbf E',fe:'\\mathbf F_E',f:'\\mathbf F',c:'\\mathbf c'}[key],el=label(parent,key,symbol+(zero?'=0':''),Math.max(17,Math.min(w-17,labelPoint[0])),Math.max(12,Math.min(h-12,labelPoint[1])));el.style.color=color;el.hidden=false;
   if(electric&&['c','fb','fe','f'].includes(key)){el.hidden=true;return;}
   const hw=key==='fb'||key==='fe'?15:10,hh=10,preferred=[parseFloat(el.style.left),parseFloat(el.style.top)],offsets=[[0,0],[-12,0],[12,0],[0,-22],[0,22],[-24,0],[24,0],[-12,-22],[12,22]];
   let point=preferred;for(const offset of offsets){const candidate=[Math.max(hw+2,Math.min(w-hw-2,preferred[0]+offset[0])),Math.max(hh+2,Math.min(h-hh-2,preferred[1]+offset[1]))];const hitsArrow=segments.some(([a,b])=>[.15,.3,.5,.7,.9,1].some(t=>Math.abs(a[0]+(b[0]-a[0])*t-candidate[0])<hw+3&&Math.abs(a[1]+(b[1]-a[1])*t-candidate[1])<hh+3));if(!hitsArrow&&!placed.some(p=>Math.abs(p.x-candidate[0])<p.hw+hw+2&&Math.abs(p.y-candidate[1])<p.hh+hh+2)){point=candidate;break;}}
   el.style.left=point[0]+'px';el.style.top=point[1]+'px';placed.push({x:point[0],y:point[1],hw,hh});
  }
  const origin=[w*.5,h*.5],point=v=>[origin[0]+M.dot(v,right)*diagramScale,origin[1]-M.dot(v,up)*diagramScale];
  // A quiet Cartesian ground grid and full x/y/z axes make handedness visible.
  for(const coordinate of [-60,-30,0,30,60]){line(g,point([-60,coordinate,0]),point([60,coordinate,0]),'#e7ecef',.7);line(g,point([coordinate,-60,0]),point([coordinate,60,0]),'#e7ecef',.7);}
  if(M.norm(fields.B)&&M.norm(state.v)){const vu=state.v.map(v=>v/M.norm(state.v)*64),bu=fields.B.map(v=>v/M.norm(fields.B)*64),plane=[[0,0,0],vu,vu.map((v,k)=>v+bu[k]),bu].map(point);g.fillStyle='rgba(53,106,195,.055)';g.beginPath();g.moveTo(...plane[0]);for(const p of plane.slice(1))g.lineTo(...p);g.closePath();g.fill();}
  for(const [axis,key]of [[[1,0,0],'x'],[[0,1,0],'y'],[[0,0,1],'z']]){line(g,point(axis.map(v=>-v*64)),origin,'#c6d0d6',.8,[3,4]);const end=point(axis.map(v=>v*94));line(g,origin,end,'#b1bec6',.9);arrow(point(axis.map(v=>v*88)),end,'#b1bec6',g);const p=point(axis.map(v=>v*(key==='z'?113:125))),el=label(parent,'axis-'+key,key,Math.max(12,Math.min(w-12,p[0])),Math.max(12,Math.min(h-12,p[1])));el.style.color='#788a95';el.hidden=false;placed.push({x:p[0],y:p[1],hw:9,hh:10});}
  g.fillStyle='#596e78';g.beginPath();g.arc(...origin,2.5,0,2*Math.PI);g.fill();
  vector('v',state.v,origin,'#b17b2c');vector('b',fields.B,origin,HiFyzikoParticleStyle.fields.magnetic,0,62);
  vector('c',product,origin,'#198476',M.norm(state.v)*M.norm(fields.B)*1e-10,90);vector('fb',magneticForce,origin,'#925daa',magneticTolerance,58);
  if(electric){
   const bEnd=point(magneticForce.map(v=>v*forceGain*mainFit)),eEnd=point(electricForce.map(v=>v*forceGain*mainFit)),fEnd=point(totalForce.map(v=>v*forceGain*mainFit));
   line(g,bEnd,fEnd,'#ad6528',1.3,[3,3]);line(g,eEnd,fEnd,'#925daa',1.1,[3,3]);
   vector('e',fields.E,origin,HiFyzikoParticleStyle.fields.electric);vector('fe',electricForce,origin,'#ad6528');vector('f',totalForce,origin,'#314c59',magneticTolerance);
  }
    const noB=M.norm(fields.B)===0,noMag=M.norm(magneticForce)<=magneticTolerance;
  const legend={b:['\\mathbf B'+(noB?'=0':''),HiFyzikoParticleStyle.fields.magnetic],c:['\\mathbf c=\\mathbf v\\times\\mathbf B'+(noMag?'=0':''),'#198476'],fb:['\\mathbf F_B'+(noMag?'=0':'=q\\mathbf c'),'#925daa'],fe:['\\mathbf F_E=q\\mathbf E','#ad6528'],f:['\\mathbf F=\\mathbf F_E+\\mathbf F_B','#314c59']};
  for(const [key,[formula,color]]of Object.entries(legend)){tex($('lorentzKey-'+key),formula);$('lorentzKey-'+key).style.color=color;}
  $('lorentzItem-fe').hidden=$('lorentzItem-f').hidden=!electric;
 }
 function render(){
  if(disposed||!config)return;[width,height]=size(canvas);const i=Math.min(samples.length-1,Math.max(0,Math.floor(frame))),s=samples[i];drawField();
  drawTail(i);
  const centerOn=$('centers').checked;if(centerOn)drawGyrationCircle(s);
  const p=project(s.r);if(centerOn&&s.center){const c=project(s.center);line(ctx,p,c,'rgba(22,125,115,.2)',.7,[3,6]);ctx.beginPath();ctx.arc(...c,3,0,2*Math.PI);ctx.strokeStyle='rgba(22,125,115,.5)';ctx.lineWidth=1;ctx.stroke();}
  const velScale=config.length*.95/config.speed,tip=project(s.r.map((r,k)=>r+s.v[k]*velScale));
  if($('vectors').checked){arrow(p,tip,'#b17b2c');label($('sceneMath'),'v','\\mathbf v',tip[0]+12,tip[1]-12);const f=M.norm(s.force);const old=$('sceneMath').querySelector('[data-key="f"]');if(f){const fp=project(s.r.map((r,k)=>r+s.force[k]/f*config.length*.7));arrow(p,fp,'#925daa');label($('sceneMath'),'f','\\mathbf F',fp[0]+12,fp[1]-10);}else old?.remove();}else{for(const key of ['v','f'])$('sceneMath').querySelector('[data-key="'+key+'"]')?.remove();}
  const glyphs=[{id:config.species,x:p[0],y:p[1],radius:12,vibration:0}];
  for(let j=0;j<companions.length;j++){const item=companions[j],state=item.samples.at(-1),xy=project(state.r);drawTail(item.samples.length-1,item.samples,item.config.timePeriod);if(centerOn)drawGyrationCircle(state);if(!view){ctx.beginPath();ctx.fillStyle=item.config.q>0?'#d74732':'#126bc3';ctx.arc(...xy,7,0,2*Math.PI);ctx.fill();}glyphs.push({id:item.config.species,x:xy[0],y:xy[1],radius:12,vibration:0});label($('sceneMath'),'companion'+j,{electron:'\\mathrm e^-',proton:'\\mathrm p^+',deuteron:'\\mathrm D^+',alpha:'{}^4\\mathrm{He}^{2+}'}[item.config.species],xy[0],xy[1]-25);}
  const electron=config.species==='electron'?s:companions.find(item=>item.config.species==='electron')?.samples.at(-1);if(electron)electronDetail(electron,glyphs);else for(const key of ['electronZoomTitle','electronZoomRadius'])$('sceneMath').querySelector('[data-key="'+key+'"]')?.remove();
  if(view)view.draw(width,height,s.t/config.timePeriod,glyphs);else{ctx.beginPath();ctx.fillStyle=config.q>0?'#d74732':'#126bc3';ctx.arc(...p,7,0,2*Math.PI);ctx.fill();}
  label($('sceneMath'),'particle',{electron:'\\mathrm e^-',proton:'\\mathrm p^+',deuteron:'\\mathrm D^+',alpha:'{}^4\\mathrm{He}^{2+}'}[config.species],p[0],p[1]-25);
  const comparing=config.mode==='gyration';$('comparison').hidden=!comparing;graph.hidden=comparing;$('graphMath').hidden=comparing;$('graphLegend').hidden=comparing;$('graphTitle').textContent=comparing?'Porovnání částic':'Příčný pohyb';if(comparing){$('axisNotice').hidden=true;drawComparison();}else drawGraph(i);tex($('timeValue'),quantity(s.t*1e6,'\\mu s'));tex($('rateValue'),num(animationRate())+'\\times');
  if(!$('readouts').children.length)for(let j=0;j<4;j++)$('readouts').append(document.createElement('div'));
  drawScale();drawLorentz(s);
  const values=['E_k='+quantity(s.energy,'eV'),s.center?'r_L='+quantity(s.rho,'m'):'B=0','|\\mathbf v_d|='+quantity(M.norm(s.drift),'m\\,s^{-1}'),'T_c='+(Number.isFinite(config.period)?quantity(config.period*1e6,'\\mu s'):'\\infty')];values.forEach((t,j)=>tex($('readouts').children[j],t));
  const status=!config.B?'Magnetické pole je vypnuté. Částice se pohybuje přímo.':ended?'Částice opustila pole. Pokus skončil.':config.mode==='entry'?(s.center?'Částice se stáčí; magnetické pole nekoná práci.':i?'Mimo pole pokračuje částice přímo.':'Připraveno k vletu do magnetického pole.'):config.mode==='electric'?'Směr elektrického driftu nezávisí na náboji.':config.mode==='gradient'?'Změna znaménka náboje obrací směr driftu.':config.mode==='curvature'?'Drift směřuje kolmo k rovině kruhových siločar.':'Bez příčného driftu. Podélný pohyb se zachovává.';
  $('status').textContent=status;if($('status').scrollHeight>$('status').clientHeight||$('status').scrollWidth>$('status').clientWidth)$('status').textContent='';
 }
 function wrapGyration(c,state){
  const {up}=viewBasis();if(Math.abs(up[2])<.02||Math.abs(state.v[2])<c.speed*1e-10)return false;
  const scale=Math.min((width-90)/12,(height-135)/10)/(config.length*extent),margin=Math.min((height-180)*.3,state.rho*scale*Math.abs(Math.cos(gtilt))),top=80+margin,bottom=height-100-margin,span=bottom-top,xy=project(state.center||state.r);
  if(xy[1]>=top&&xy[1]<=bottom)return false;
  const target=top+((xy[1]-top)%span+span)%span;state.r=[state.r[0],state.r[1],state.r[2]+(xy[1]-target)/(scale*up[2])];state.breakBefore=true;Object.assign(state,M.diagnostics(c,state));return true;
 }
 function advance(seconds){
  const total=Math.min(config.timePeriod,...companions.map(item=>item.config.timePeriod))*seconds*animationRate()/2,steps=Math.max(1,Math.min(180,Math.ceil(seconds*90*animationRate()))),dt=total/steps;
  for(let k=0;k<steps;k++){const old=samples.at(-1);let state={r:old.r,v:old.v};if(config.mode==='gyration'){const exact={config,samples:[old]};advanceCompanion(exact,dt,old.t+dt);state=exact.samples.at(-1);}else{const n=Math.max(12,Math.ceil(dt*Math.abs(config.q)*M.norm(M.fields(config,state.r).B)/config.m/.025));for(let j=0;j<n;j++)state=M.step(config,state,dt/n);}let elapsed=dt;
   const wrapped=config.mode==='gyration'&&wrapGyration(config,state);if(config.mode==='electric')keepElectricVisible(state);const screen=project(state.r);
   let respawn=false;
   if(config.mode!=='gyration'&&(screen[0]<-16||screen[0]>width+16||screen[1]<58||screen[1]>height-24)){const initial=M.setup(parameters()).initial;state={r:[...config.initial.r],v:[...initial.v]};respawn=true;entered=false;playing=false;$('play').textContent='Spustit';}
   for(const item of companions){advanceCompanion(item,elapsed,old.t+elapsed);wrapGyration(item.config,item.samples.at(-1));}
   samples.push({...state,t:old.t+elapsed,breakBefore:respawn||wrapped,...M.diagnostics(config,state)});if(ended||respawn)break;}
  if(config.mode==='gyration'){if(samples.length>1440)samples.splice(0,samples.length-1440);}else{const cutoff=samples.at(-1).t-8*2*Math.PI*config.m/(Math.abs(config.q)*.5);let first=0;while(first+1<samples.length&&samples[first+1].t<cutoff)first++;if(first)samples.splice(0,first);}frame=samples.length-1;
 }
 function tick(now){if(disposed)return;if(speedNoticeUntil&&Date.now()>speedNoticeUntil){$('speedNotice').hidden=true;speedNoticeUntil=0;}if(axisNoticeUntil&&Date.now()>axisNoticeUntil){$('axisNotice').hidden=true;axisNoticeUntil=0;}const dt=Math.min((now-last)/1000,.08);last=now;if(playing){advance(dt);render();}raf=requestAnimationFrame(tick);}
 $('play').onclick=()=>{if(ended)return;playing=!playing;$('play').textContent=playing?'Pozastavit':'Spustit';};
 $('reset').onclick=()=>{prepare();playing=true;$('play').textContent='Pozastavit';};$('rate').oninput=render;
 function liveVelocity(v,old,next){
  const factor=Math.sqrt(next.energy*old.m/(old.energy*next.m));if(next.pitch===old.pitch&&next.angle===old.angle)return v.map(x=>x*factor);
  const speed=M.norm(v)*factor,pitch=next.pitch*Math.PI/180,phase=next.angle!==old.angle?next.angle*Math.PI/180:Math.atan2(v[1],v[0]);return [speed*Math.cos(pitch)*Math.cos(phase),speed*Math.cos(pitch)*Math.sin(phase),speed*Math.sin(pitch)];
 }
 function liveChange(){syncMagneticRange();syncElectricLimits();for(const item of companions){const old=item.config,state=item.samples.at(-1),next=M.setup({...parameters(),species:old.species});next.length=old.length;next.R=next.radius*next.length;state.v=liveVelocity(state.v,old,next);item.config=next;Object.assign(state,M.diagnostics(next,state));}const wasPlaying=playing,old=config,next=M.setup(parameters()),state=samples.at(-1),factor=Math.sqrt(next.energy*old.m/(old.energy*next.m));next.length=old.length;const entryScaleChange=next.mode==='entry'&&next.species!==old.species&&(next.species==='electron'||old.species==='electron');if(entryScaleChange)next.length=M.setup({species:next.species==='electron'?'electron':'deuteron',energy:500,B:.5}).length/10;const positionScale=next.length/old.length;next.R=next.radius*next.length;next.initial.r=old.initial.r.map(v=>v*positionScale);config=next;const current={r:state.r.map(v=>v*positionScale),v:liveVelocity(state.v,old,next)};samples.push({...current,t:state.t,breakBefore:entryScaleChange,...M.diagnostics(config,current)});frame=samples.length-1;tex($('bValue'),quantity(config.B,'T'));tex($('energyValue'),quantity(config.energy,'eV'));tex($('pitchValue'),num(config.pitch,0)+'^\\circ');tex($('angleValue'),num(config.angle,0)+'^\\circ');tex($('electricValue'),quantity(config.electric,'V\\,m^{-1}'));tex($('gradientValue'),quantity(config.gradient/config.length,'m^{-1}'));tex($('radiusValue'),quantity(config.R,'m'));playing=wasPlaying;render();}
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
 $('species').onchange=()=>{if(config.mode==='entry')liveChange();else{syncElectricLimits(true);prepare();}};$('mode').onchange=()=>{config.start=$('mode').value==='entry'?[-3,0]:[0,0];$('pitch').value=$('mode').value==='curvature'?'65':'0';syncMagneticRange();syncElectricLimits(true);prepare();};$('reverse').onclick=()=>{fieldSign=-fieldSign;liveChange();};$('vectors').onchange=render;$('centers').onchange=render;
 const forceCanvas=$('lorentzCanvas');
 forceCanvas.onpointerdown=event=>{lorentzDrag={x:event.clientX,y:event.clientY,yaw:lorentzYaw,tilt:lorentzTilt};forceCanvas.setPointerCapture(event.pointerId);event.preventDefault?.();};
 forceCanvas.onpointermove=event=>{if(!lorentzDrag)return;const scale=forceCanvas.clientWidth/forceCanvas.getBoundingClientRect().width;lorentzYaw=lorentzDrag.yaw-(event.clientX-lorentzDrag.x)*scale*.008;lorentzTilt=Math.max(.18,Math.min(1.25,lorentzDrag.tilt+(event.clientY-lorentzDrag.y)*scale*.006));render();};
 forceCanvas.onpointerup=forceCanvas.onpointercancel=()=>{lorentzDrag=null;};
 forceCanvas.ondblclick=()=>{lorentzYaw=.7;lorentzTilt=.55;render();};
 $('lorentzPanel').ontoggle=()=>{if($('lorentzPanel').open)render();};
 $('help').onclick=()=>{playing=false;$('play').textContent='Spustit';$('guide').showModal();};$('closeHelp').onclick=()=>$('guide').close();
 const point=event=>{const r=canvas.getBoundingClientRect();return [(event.clientX-r.left)*width/r.width,(event.clientY-r.top)*height/r.height];};
 canvas.onwheel=event=>{if(drag)return;event.preventDefault();const p=point(event),{right,up,origin,scale}=projectionFrame(),old=extent,delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height:1);extent=Math.max(.01,Math.min(40,extent*Math.exp(Math.max(-500,Math.min(500,delta))*.002)));const dx=(p[0]-origin[0])*config.length*(old-extent)/(scale*old),dy=(origin[1]-p[1])*config.length*(old-extent)/(scale*old);camera=camera.map((v,k)=>v+right[k]*dx+up[k]*dy);render();};
 canvas.ondblclick=()=>{extent=1;camera=config.mode==='electric'?[...samples.at(-1).r]:[0,0,0];if(config.mode==='gyration'){gyaw=0;gtilt=0;}if(config.mode==='curvature'){yaw=-.65;tilt=.65;}render();};
 canvas.onpointerdown=event=>{const p=point(event);if(config.mode==='gyration'){if(!playing){const states=[samples.at(-1),...companions.map(item=>item.samples.at(-1))];for(let j=states.length-1;j>=0;j--){const xy=project(states[j].r);if(Math.hypot(p[0]-xy[0],p[1]-xy[1])<25){drag={type:'arrange',index:j-1};break;}}}if(!drag)drag={type:'orbitView',p,gyaw,gtilt};}else if(config.mode==='curvature'){drag={type:'view',p,yaw,tilt};}else if(config.mode!=='curvature'&&(!playing||(config.mode==='entry'&&samples.at(-1).r[0]<0))){const state=samples.at(-1),c=project(state.r),tip=project(state.r.map((r,k)=>r+state.v[k]*config.length*.95/config.speed));if(Math.hypot(p[0]-c[0],p[1]-c[1])<25)drag={type:'position'};else if(Math.hypot(p[0]-tip[0],p[1]-tip[1])<25)drag={type:'angle'};}if(drag){if(drag.type!=='view'&&drag.type!=='orbitView'){playing=false;$('play').textContent='Spustit';}canvas.setPointerCapture(event.pointerId);}};
 canvas.onpointermove=event=>{if(!drag)return;const p=point(event);if(drag.type==='orbitView'){gyaw=drag.gyaw+(p[0]-drag.p[0])*.008;gtilt=Math.max(-Math.PI/2,Math.min(Math.PI/2,drag.gtilt+(p[1]-drag.p[1])*.008));render();return;}if(drag.type==='arrange'){const scale=Math.min((width-90)/12,(height-135)/10)/extent,item=drag.index<0?null:companions[drag.index],history=item?item.samples:samples,c=item?item.config:config,old=history.at(-1),xy=project(old.r),{right,up}=viewBasis(),dx=(Math.max(20,Math.min(width-20,p[0]))-xy[0])*config.length/scale,dy=(xy[1]-Math.max(80,Math.min(height-100,p[1])))*config.length/scale,r=old.r.map((v,k)=>v+right[k]*dx+up[k]*dy),state={r,v:[...old.v]};history.push({...state,t:old.t,breakBefore:true,...M.diagnostics(c,state)});if(item){item.initial.r=[...r];companionStarts[item.config.species]=[...r];}else{config.initial.r=[...r];config.start=r.map(v=>v/config.length);frame=samples.length-1;}render();return;}if(drag.type==='view'){yaw=drag.yaw+(p[0]-drag.p[0])*.008;tilt=Math.max(.1,Math.min(1.4,drag.tilt+(p[1]-drag.p[1])*.006));render();return;}
  const scale=Math.min((width-90)/12,(height-135)/10)/extent;if(drag.type==='position'){const x=camera[0]/config.length+(p[0]-(config.mode==='entry'?width*.27:width/2))/scale,y=camera[1]/config.length+(height/2+18-p[1])/scale;config.start=config.mode==='electric'?[x,y]:[Math.max(-3.8,Math.min(config.mode==='entry'?7:4.7,x)),Math.max(-2.5,Math.min(2.5,y))];}else{const c=project(config.initial.r);$('angle').value=String(Math.max(-65,Math.min(65,Math.atan2(c[1]-p[1],p[0]-c[0])*180/Math.PI)));}prepare(true);};
 canvas.onpointerup=canvas.onpointercancel=()=>{const placed=drag&&drag.type!=='view'&&drag.type!=='orbitView'&&drag.type!=='arrange';drag=null;if(placed)prepare(true);};
 const resize=()=>render();addEventListener('resize',resize);const observer=new ResizeObserver(resize);observer.observe(canvas);
 window.HiFyzikoFusionDispose=()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();removeEventListener('resize',resize);view?.dispose();};
 prepare();raf=requestAnimationFrame(tick);
})();
