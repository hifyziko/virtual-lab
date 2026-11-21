'use strict';
const el=id=>document.getElementById(id);
const tau=2*Math.PI, per=240, last=8*per;
const resonantFrequency=112,frequencyInput=el('freq');
const {fields,colors,labels}=window.HiFyzikoParticleStyle;
const gold=fields.electric, blue=fields.magnetic, violet='#8c4b9d', green='#187767';
const electronColor='#'+colors.e.toString(16).padStart(6,'0');
let samples=[],cursor=0,playing=true,previous=0;
function drive(t){
  const phase=t*Number(frequencyInput.value)/resonantFrequency, mode=el('mode').value;
  return [0.036*Math.cos(phase)*(mode==='linear'?2:1),0.036*Math.sin(phase)*(mode==='plus'?1:mode==='minus'?-1:0)];
}
function slope(t,[x,y,u,v]){
  const [a,b]=drive(t);
  return [u,v,a-v,b+u];
}
function restart(){
  const dt=tau/per;
  let state=[0,-1,1,0];
  samples=[];
  for(let i=0;i<=last;i++){
    const t=i*dt,[a,b]=drive(t),[x,y,u,v]=state;
    samples.push({x,y,u,v,a,b,w:u*u+v*v,p:2*(a*u+b*v)});
    const shift=(s,k)=>state.map((n,j)=>n+k*s[j]);
    const k1=slope(t,state),k2=slope(t+dt/2,shift(k1,dt/2)),k3=slope(t+dt/2,shift(k2,dt/2)),k4=slope(t+dt,shift(k3,dt));
    state=state.map((n,j)=>n+dt*(k1[j]+2*k2[j]+2*k3[j]+k4[j])/6);
  }
  for(const chart of charts)fitChartAxis(chart);
  cursor=0;previous=0;
  const wavelength=(299.792458/Number(el('freq').value)).toFixed(2).replace('.','{,}');
  katex.render('\\lambda='+wavelength+'\\,\\mathrm{mm}',el('wavelength'));
  updateTuning();
  katex.render('f='+frequencyInput.value+'\\,\\mathrm{GHz}',el('reading'));
  render();
}
const {node,line,dot,label,gradient,drawLauncher,drawVessel}=window.HiFyzikoWaveArt;
const vessel=el('vessel'),orbit=el('orbit'),plot=el('plot');
const {layer,wave,apertureX}=drawVessel(vessel);
const profile=el('field-profile'),profileLeft=41,profileBottom=228;
const profileX=r=>profileLeft+(r-4.4)*37;
const fieldLevel=r=>6.2/r;
const levelY=value=>profileBottom-186*(value-.65)/.8;
const profileY=r=>levelY(fieldLevel(r));
label(profile,41,20,'Radiální průběh pole');
sceneMath(profile,41,27,205,String.raw`\frac{f_{\mathrm{ce}}}{f_{\mathrm{ce},0}}=\frac{B}{B_0}=\frac{R_0}{R}`);
line(profile,'M41 52V228H228','#8399a6');
for(const value of [.8,1,1.2,1.4]){
  const y=levelY(value);
  line(profile,'M41 '+y+'H228','#e3ebef');
  sceneMath(profile,8,y-9,31,String(value).replace('.','{,}'));
}
for(const radius of [5,6,7,8,9]){
  const x=profileX(radius);
  line(profile,'M'+x+' 228v4','#8399a6');
  sceneMath(profile,x-4,234,20,String(radius));
}
sceneMath(profile,168,258,83,String.raw`R\,(\mathrm m)`);
let fieldProfile='';
for(let j=0;j<=100;j++){
  const r=4.4+.05*j;
  fieldProfile+=(j?'L':'M')+profileX(r).toFixed(2)+' '+profileY(r).toFixed(2);
}
line(profile,fieldProfile,blue,2.6);
const profileGuide=line(profile,'',violet,1.25);
profileGuide.setAttribute('stroke-dasharray','3 4');
const profileMarker=dot(profile,0,0,4.6,violet);
dot(profile,profileX(6.2),profileY(6.2),2.4,blue);
const centerX=377,centerY=195,waveEnd=740;
line(orbit,'M20 195H740','#a5b4bc');
for(const x of [92,166,240,314,388,462,536,610,684]){
  for(const y of [94,148,242,296]){
    const symbol=dot(orbit,x,y,4.5,'none');
    symbol.setAttribute('stroke',blue);symbol.setAttribute('opacity',.24);
    dot(orbit,x,y,1.25,blue).setAttribute('opacity',.37);
  }
}
const fieldStems=node(orbit,'path',{fill:gold,opacity:.48});
const fieldEnvelope=line(orbit,'',gold,3.4);
node(orbit,'circle',{cx:centerX,cy:centerY,r:52,fill:'none',stroke:'#8598a6','stroke-dasharray':'4 5'});
dot(orbit,centerX,centerY,9,blue);dot(orbit,centerX,centerY,6,'white');dot(orbit,centerX,centerY,2.5,blue);
label(orbit,30,40,'Magnetické pole míří k pozorovateli');
const trails=Array.from({length:30},(_,j)=>{
  const weight=((j+1)/30)**2;
  const trail=line(orbit,'',electronColor,.3+6*weight);
  trail.setAttribute('stroke-linecap','round');
  trail.setAttribute('opacity',.8*weight);
  return trail;
});
const particle=node(orbit,'g');
const arrows=[gold,violet,green].map(fill=>node(particle,'path',{fill}));
const orbitDefs=node(orbit,'defs');
gradient(orbitDefs,'radialGradient','electron-body',{cx:'32%',cy:'26%',r:'79%'},[[0,'#effaff'],[.28,'#74bafb'],[.66,electronColor],[1,'#083767']]);
gradient(orbitDefs,'radialGradient','electron-halo',{},[[0,electronColor,.28],[.45,electronColor,.13],[1,electronColor,0]]);
dot(particle,0,0,21,'url(#electron-halo)');
dot(particle,0,0,10,'url(#electron-body)').setAttribute('stroke','#104f8d');
sceneMath(particle,12,-27,40,labels.e);
function arrow(n,dx,dy){
  const len=Math.hypot(dx,dy),base=len-Math.min(10,len*.45);
  n.setAttribute('d',len<1?'':'M0 -1.5H'+base+'v-2.5L'+len+' 0 '+base+' 4v-2.5H0Z');
  n.setAttribute('transform','rotate('+Math.atan2(dy,dx)*180/Math.PI+')');
}
const polarization=el('polarization');
node(polarization,'rect',{x:552,y:31,width:277,height:84,rx:7,fill:'#fff',stroke:'#d2dfe6'});
label(polarization,564,54,'Polarizace vlny');
const rotationLabel=node(polarization,'text',{x:564,y:77});
const polarizationFrame=node(polarization,'g',{transform:'translate(736 65)'});
line(polarizationFrame,'M-25 0H25M0-25V25','#d0dce4');
const polarizationTrack=line(polarizationFrame,'','#d9ac70',1.1);
polarizationTrack.setAttribute('stroke-dasharray','2 2');
const polarizationArrow=node(polarizationFrame,'path',{fill:gold});
dot(polarizationFrame,0,0,2.3,gold);
const comparisonFrame=node(polarization,'g',{transform:'translate(795 65)'});
node(comparisonFrame,'circle',{cx:0,cy:0,r:22,fill:'none',stroke:'#d0dce4'});
const comparisonVelocity=node(comparisonFrame,'path',{fill:green});
const comparisonForce=node(comparisonFrame,'path',{fill:violet});
sceneMath(polarization,728,89,30,String.raw`\mathbf E`);
sceneMath(polarization,770,89,58,String.raw`q\mathbf E,\ \mathbf v`);
const gauges=node(orbit,'g',{transform:'translate(20 300)'});
node(gauges,'rect',{width:120,height:64,rx:7,fill:'#fff',stroke:'#d2dfe6'});
const column=(x,title,color)=>{
  line(gauges,'M'+x+' 6v39','#a9bac4',1.2);
  line(gauges,'M'+(x-6)+' 25h12','#536b79',1.5);
  node(gauges,'text',{x,y:58,'text-anchor':'middle',style:'font-size:12px;font-weight:700;fill:'+color},title);
  return node(node(gauges,'g',{transform:'translate('+x+' 25)'}),'path',{fill:color});
};
const verticalForce=column(29,'Síla',violet);
const verticalVelocity=column(87,'Rychlost',green);
function sceneMath(root,x,y,width,tex){
  const box=node(root,'foreignObject',{x,y,width,height:root===profile?35:24});
  const text=document.createElement('span');
  box.appendChild(text);
  katex.render(tex,text);
}
const plotMath=(x,y,width,tex)=>sceneMath(plot,x,y,width,tex);
const chartTop=43,chartBottom=168,chartWidth=528;
const charts=[
  {key:'p',title:'Okamžitý výkon vlny',tex:String.raw`P/(W_0\omega_{\mathrm{ce}})`,x:64,color:violet},
  {key:'w',title:'Kolmá kinetická energie elektronu',tex:String.raw`W_\perp/W_0`,x:688,color:green}
].map(chart=>{
  const {title,tex,x,color}=chart;
  const atX=i=>x+chartWidth*i/last;
  const atY=value=>chartBottom-(value-chart.min)/(chart.max-chart.min)*(chartBottom-chartTop);
  label(plot,x,25,title);
  if(chart.key==='p')plotMath(x+370,9,152,tex);
  else plotMath(x+455,9,72,tex);
  node(plot,'rect',{x,y:chartTop,width:chartWidth,height:chartBottom-chartTop,fill:'#f7fafb',stroke:'#bdccd5'});
  const ticks=node(plot,'g');
  for(let cycle=0;cycle<=8;cycle++){
    const tick=atX(cycle*per);
    line(plot,'M'+tick+' '+chartTop+'V'+(chartBottom+4),'#d4dfe6');
    plotMath(tick-4,chartBottom+7,18,String(cycle));
  }
  plotMath(x+chartWidth-62,194,80,String.raw`t/T_{\mathrm{ce}}`);
  return Object.assign(chart,{ticks,atX,atY,cursor:line(plot,'','#8fa6b4'),curve:line(plot,'',color,2.5),tip:dot(plot,x,chartBottom,3.7,color)});
});
function fitChartAxis(chart){
  const values=samples.map(sample=>sample[chart.key]);
  const reference=chart.key==='p'?0:1;
  const low=Math.min(reference,...values),high=Math.max(reference,...values);
  const margin=Math.max((high-low)*.035,1e-5);
  const target=(high-low+2*margin)/4;
  const decade=10**Math.floor(Math.log10(target));
  const step=[1,2,2.5,5,10].find(factor=>factor*decade>=target)*decade;
  const first=Math.floor((chart.key==='w'?Math.max(0,low-margin):low-margin)/step);
  const lastTick=Math.ceil((high+margin)/step);
  chart.min=first*step;
  chart.max=lastTick*step;
  chart.ticks.replaceChildren();
  for(let i=first;i<=lastTick;i++){
    const value=i*step,y=chart.atY(value);
    line(chart.ticks,'M'+(chart.x-4)+' '+y+'H'+(chart.x+chartWidth),i===0?'#8599a7':'#d4dfe6');
    sceneMath(chart.ticks,chart.x-55,y-9,50,String(Number(value.toPrecision(8))).replace('.','{,}'));
  }
}
function seriesPath(chart,i,key){
  const point=j=>chart.atX(j).toFixed(2)+' '+chart.atY(samples[j][key]).toFixed(2);
  let d='M'+point(0);
  for(let j=4;j<i;j+=4)d+='L'+point(j);
  return d+'L'+point(i);
}
drawLauncher(orbit,waveEnd,centerY,.96,'orbit-launcher');
function drawWave(phase,ratio){
  const wavelength=294/ratio;
  const amplitude=el('mode').value==='linear'?83:41.5;
  const displacement=x=>amplitude*Math.cos(phase+tau*(x-centerX)/wavelength);
  let envelope='',stems='';
  for(let x=20;x<=waveEnd;x+=2){
    envelope+=(x===20?'M':'L')+x+' '+(centerY+displacement(x)).toFixed(2);
  }
  for(let x=20;x<=waveEnd;x+=14){
    const dy=displacement(x);
    if(Math.abs(dy)<2)continue;
    const tip=centerY+dy,base=tip-Math.sign(dy)*Math.min(6,Math.abs(dy)*.45);
    stems+='M'+(x-.8)+' '+centerY+'V'+base+'H'+(x-3)+'L'+x+' '+tip+' '+(x+3)+' '+base+'H'+(x+.8)+'V'+centerY+'Z';
  }
  fieldEnvelope.setAttribute('d',envelope);
  fieldStems.setAttribute('d',stems);
}
function render(){
  const i=Math.floor(cursor),fraction=cursor-i;
  const current=samples[i],next=samples[Math.min(i+1,last)];
  const s=Object.fromEntries(Object.entries(current).map(([key,value])=>[
    key,value+(next[key]-value)*fraction
  ]));
  const ratio=Number(frequencyInput.value)/resonantFrequency;
  const resonantRadius=6.2/ratio;
  layer.setAttribute('transform','translate('+(280+20*(resonantRadius-6.2))+' 0)');
  const fieldX=profileX(resonantRadius),fieldY=profileY(resonantRadius);
  profileMarker.setAttribute('cx',fieldX);
  profileMarker.setAttribute('cy',fieldY);
  profileGuide.setAttribute('d','M'+profileLeft+' '+fieldY+'H'+fieldX+'V'+profileBottom);
  // Negative electron charge: the electric field is opposite to the drive acceleration.
  // Positive spatial and temporal phase gradients give propagation toward decreasing x.
  const phase=cursor*tau/per*ratio,amplitude=el('mode').value==='linear'?7:3.5;
  drawWave(phase,ratio);
  let d='';
  for(let x=234;x<=apertureX;x++){const y=197+amplitude*Math.cos(phase+tau*(x-280)*ratio/24);d+=(x===234?'M':'L')+x+' '+y.toFixed(2)}
  wave.setAttribute('d',d);
  const start=Math.max(0,i-Math.round(2.5*per));
  trails.forEach((trail,k)=>{
    const a=start+Math.floor((i-start)*k/trails.length),b=start+Math.floor((i-start)*(k+1)/trails.length);
    let d='';
    for(let j=a;j<=b;j++){const v=samples[j];d+=(j===a?'M':'L')+(centerX-52*v.y).toFixed(2)+' '+(centerY-52*v.x).toFixed(2)}
    if(k===trails.length-1)d+='L'+(centerX-52*s.y).toFixed(2)+' '+(centerY-52*s.x).toFixed(2);
    trail.setAttribute('d',d);
  });
  particle.setAttribute('transform','translate('+(centerX-52*s.y)+' '+(centerY-52*s.x)+')');
  const polarizationMode=el('mode').value;
  const linear=polarizationMode==='linear';
  const fieldScale=22/(linear ? .072 : .036);
  arrow(polarizationArrow,s.b*fieldScale,s.a*fieldScale);
  // Use different arrow lengths so alignment remains visible when the vectors coincide.
  arrow(comparisonForce,-s.b*fieldScale*.68,-s.a*fieldScale*.68);
  const velocityScale=22/Math.max(Math.sqrt(s.w),1e-9);
  arrow(comparisonVelocity,-s.v*velocityScale,-s.u*velocityScale);
  polarizationTrack.setAttribute('d',linear?'M0-22V22':'M0-22a22 22 0 1 1 0 44a22 22 0 1 1 0-44');
  rotationLabel.textContent=linear?'Kmitá po přímce':polarizationMode==='plus'?'Otáčí se jako elektron':'Otáčí se opačně';
  arrow(arrows[0],s.b*740,s.a*740);arrow(arrows[1],-s.b*740,-s.a*740);arrow(arrows[2],-22*s.v,-22*s.u);
  arrow(verticalForce,0,-19*Math.tanh(s.a*28));
  arrow(verticalVelocity,0,-19*Math.tanh(s.u*.9));
  el('exchange').textContent=Math.abs(s.p)<.002?'Téměř nulová práce':s.p>0?'Vlna urychluje':'Vlna brzdí';
  const speed=(Math.sqrt(s.w)*1000).toFixed(0);
  if(el('electron-speed').dataset.value!==speed){
    katex.render('v_\\perp='+speed+'\\,\\mathrm{km/s}',el('electron-speed'));
    el('electron-speed').dataset.value=speed;
  }
  for(const chart of charts){
    const x=chart.atX(cursor),y=chart.atY(s[chart.key]);
    chart.cursor.setAttribute('d','M'+x+' '+chartTop+'V'+chartBottom);
    chart.curve.setAttribute('d',seriesPath(chart,i,chart.key)+'L'+x.toFixed(2)+' '+y.toFixed(2));
    chart.tip.setAttribute('cx',x);
    chart.tip.setAttribute('cy',y);
  }
  el('play').textContent=playing?'Pozastavit':'Spustit';
}
function frame(now){
  if(playing){if(previous)cursor=Math.min(last,cursor+Math.min(now-previous,80)*per*Number(el('speed').value)/1350);if(cursor===last)playing=false;render()}
  previous=now;requestAnimationFrame(frame);
}
el('play').onclick=()=>{if(cursor===last)cursor=0;playing=!playing;previous=0;render()};
function updateTuning(){
  const resonant=Number(frequencyInput.value)===resonantFrequency;
  const tuning=el('tuning'),status=resonant?'V rezonanci':'Mimo rezonanci';
  if(tuning.textContent!==status)tuning.textContent=status;
  tuning.dataset.resonant=String(resonant);
  el('tune-resonance').dataset.resonant=String(resonant);
}
function tuneResonance(){
  if(Number(frequencyInput.value)===resonantFrequency)return;
  frequencyInput.value=String(resonantFrequency);
  restart();
}
let tuningPointer=null;
frequencyInput.addEventListener('pointerdown',event=>{
  if(event.isPrimary&&event.button===0)tuningPointer=event.pointerId;
});
window.addEventListener('pointerup',event=>{
  if(event.pointerId!==tuningPointer)return;
  tuningPointer=null;
  if(Math.abs(Number(frequencyInput.value)-resonantFrequency)<=1)tuneResonance();
});
window.addEventListener('pointercancel',event=>{
  if(event.pointerId===tuningPointer)tuningPointer=null;
});
el('tune-resonance').onclick=tuneResonance;
el('reset').onclick=restart;frequencyInput.oninput=restart;el('mode').onchange=restart;
el('help').onclick=()=>document.querySelector('dialog').showModal();
document.querySelectorAll('[data-tex]').forEach(n=>katex.render(n.dataset.tex,n));restart();requestAnimationFrame(frame);
