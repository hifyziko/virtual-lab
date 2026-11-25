(()=>{'use strict';const $=id=>document.getElementById(id),B=SyncTransientBasis,M=SyncTransients.create(B),math=s=>katex.renderToString(s.replaceAll('@',String.fromCharCode(92)),{throwOnError:false}),fmt=x=>x.toFixed(3).replace('.',','),limitsD=M.limits(0),limitsQ=M.limits(90);
const timeSlider=$('time'),timeOffset=.0002,maxTime=5,logSpan=Math.log1p(maxTime/timeOffset);
const timeAt=value=>timeOffset*Math.expm1(value/100*logSpan);
// At this reference time the cage response has weakened and field-winding current persists.
const sliderStep=+timeSlider.getAttribute('step');
const transitionPosition=Math.round(100*Math.log1p(.16/timeOffset)/(logSpan*sliderStep))*sliderStep;
const presets={sub:0,trans:transitionPosition,steady:100},presetRadius=1.2;
const viewSwitch=document.querySelector('.transient-view-switch'),viewButtons=Array.from(viewSwitch.querySelectorAll('button'));
$('transitionTick').value=transitionPosition;
let damper=true,playing=false,raf=0,previous=0,queued=false,pointerOnTime=false;
const barsOf=c=>{const b=c.slice(1);return [...b,-b.reduce((a,v)=>a+v,0)];},maxF=Math.abs(limitsD.initial[0]),maxK=Math.max(...barsOf(limitsD.initial).map(Math.abs),...barsOf(limitsQ.initial).map(Math.abs));
const historyPlot=$('history');
const historySteps=120;
const histories=[true,false].map(withCage=>Array.from({length:historySteps+1},(_,i)=>{
 const t=timeAt(100*i/historySteps);
 return {t,d:M.at(0,'time',t,withCage).x,q:M.at(90,'time',t,withCage).x};
}));
const historyMarks=[[0,'0^+'],[.001,'1@, @mathrm{ms}'],[.01,'10@, @mathrm{ms}'],[.1,'100@, @mathrm{ms}'],[1,'1@, @mathrm{s}'],[maxTime,'5@, @mathrm{s}']];
const historyColors={d:'#985b1d',q:'#007c77'};
function historyLabel(x,y,w,tex,align='center'){
 return '<foreignObject x="'+x+'" y="'+y+'" width="'+w+'" height="22"><div xmlns="http://www.w3.org/1999/xhtml" class="history-label" style="justify-content:'+align+'">'+math(tex)+'</div></foreignObject>';
}
let plotKey='',marker='';
function chart(){
 const width=Math.max(280,historyPlot.clientWidth||640),height=Math.max(240,historyPlot.clientHeight||400);
 const left=52,right=width-34,top=29,bottom=height-56;
 const x=t=>left+Math.log1p(t/timeOffset)/logSpan*(right-left);
 const y=v=>bottom-v/1.28*(bottom-top);
 const historyIndex=damper?0:1;
 const key=[width,height,historyIndex].join(':');
 if(plotKey!==key){
  plotKey=key;
  historyPlot.setAttribute('viewBox','0 0 '+width+' '+height);
  let svg='<rect x="'+left+'" y="'+top+'" width="'+(right-left)+'" height="'+(bottom-top)+'" rx="4" fill="#f6faf8"/>';
  svg+=historyLabel(left,1,125,'X@;[@mathrm{p.@,j.}]','start');
  for(let i=0;i<=6;i++){
   const v=i/5,py=y(v);
   svg+='<path d="M'+left+' '+py+'H'+right+'" stroke="#d8e4df"/>';
   svg+=historyLabel(0,py-11,left-9,v.toFixed(1).replace('.','{,}'),'end');
  }
  for(const [t,label] of historyMarks){
   const px=x(t);
   svg+='<path d="M'+px+' '+top+'V'+bottom+'" stroke="#d8e4df"/>';
   svg+=historyLabel(px-29,bottom+4,58,label);
  }
  svg+='<path d="M'+left+' '+top+'V'+bottom+'H'+right+'" fill="none" stroke="#657b82"/>';
  svg+=historyLabel((left+right)/2-24,bottom+30,48,'t');
  for(const [axis,color] of Object.entries(historyColors)){
   const d=histories[historyIndex].map((p,i)=>(i?'L':'M')+x(p.t).toFixed(2)+','+y(p[axis]).toFixed(2)).join('');
   svg+='<path data-history-axis="'+axis+'" d="'+d+'" fill="none" stroke="'+color+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"'+(axis==='q'?' stroke-dasharray="8 5"':'')+'/>';
  }
  historyPlot.innerHTML=svg+'<g data-history-cursor></g>';
  marker=null;
 }
 const sliderPosition=+timeSlider.value;
 const px=left+sliderPosition/100*(right-left);
 const position=sliderPosition/100*historySteps;
 const index=Math.min(historySteps-1,Math.floor(position)),weight=position-index;
 const history=histories[historyIndex],readings=[];
 let next='<path d="M'+px+' '+top+'V'+bottom+'" stroke="#435f58" stroke-width="1.6" stroke-dasharray="6 5"/>';
 for(const [axis,color] of Object.entries(historyColors)){
  const from=history[index][axis],to=history[index+1][axis],value=from+weight*(to-from);
  readings.push([axis,value]);
  next+='<circle data-cursor-axis="'+axis+'" cx="'+px+'" cy="'+y(value)+'" r="5.5" fill="'+color+'" stroke="white" stroke-width="2"/>';
 }
 if(next!==marker){
  historyPlot.querySelector('[data-history-cursor]').innerHTML=next;
  for(const [axis,value] of readings)$('history'+axis.toUpperCase()).innerHTML=math('X_'+axis+'='+value.toFixed(4).replace('.','{,}'));
  marker=next;
 }
}
function draw(){const angle=+$('angle').value,position=+timeSlider.value,t=timeAt(position),a=M.at(angle,'time',t,damper),field=new Float32Array(B.N*B.N);let max=0;for(let i=0;i<field.length;i++){let v=0;for(let j=0;j<a.coefficients.length;j++)v+=a.coefficients[j]*B.fields[j][i];field[i]=v;max=Math.max(max,Math.abs(v));}if(max>0)for(let i=0;i<field.length;i++)field[i]*=1.48/max;
const contours=MagneticContours(field,B.N,B.R,'#007e6c'),s={...SyncPrinciple.create(),type:'salient',rotor:angle*Math.PI/180,field:0,excitation:true,excitationLevel:0,damper,omega:0,fieldOmega:0},bars=barsOf(a.currents),rotorCurrents={field:a.currents[0]/maxF,bars:bars.map(v=>v/maxK)};let art=SyncMachineArt(s,false,{axes:false,forces:false,rotorCurrents},contours.paths+contours.arrows).replace(/<circle cx="512" cy="267" r="14"[\s\S]*?>Bₛ<\/text>/, '');
art+='<g class="delta-b-axis" opacity=".6"><path d="M32 267H528" fill="none" stroke="#007e6c" stroke-width=".9" stroke-dasharray="4 6"/><path d="M38 264L32 267L38 270M522 264L528 267L522 270" fill="none" stroke="#007e6c" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></g>';
for(const [delta,label] of [[0,'d'],[Math.PI/2,'q']]){const theta=s.rotor+delta,c=Math.cos(theta),sn=Math.sin(theta),x1=280+164*c,y1=267-164*sn,x2=280+234*c,y2=267-234*sn,lx=280+260*c,ly=267-242*sn;art+=`<path d="M${x1},${y1}L${x2},${y2}" fill="none" stroke="#5c6f70" stroke-width="1" stroke-dasharray="5 5"/><foreignObject class="rotor-axis-label" data-axis="${label}" x="${lx-13}" y="${ly-14}" width="26" height="28"><div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;height:100%;font-size:19px;color:#304648">${katex.renderToString(label,{throwOnError:true})}</div></foreignObject>`;}
art+='<g class="delta-b-marker"><circle cx="512" cy="267" r="14" fill="#007e6c" stroke="white" stroke-width="2"/><foreignObject x="498" y="253" width="28" height="28"><div xmlns="http://www.w3.org/1999/xhtml" style="display:grid;place-items:center;height:100%;color:white;font-size:10px">'+math('@Delta@mathbf{B}')+'</div></foreignObject></g>';$('machine').innerHTML=art;$('angleOut').textContent=angle+'°';$('axisD').setAttribute('aria-pressed',angle===0);$('axisQ').setAttribute('aria-pressed',angle===90);
const timeLabel=t<1?(t*1000).toFixed(t>0&&t<.01?1:0)+'@,@mathrm{ms}':t.toFixed(2)+'@,@mathrm{s}';
$('timeOut').innerHTML=math(timeLabel.replace('.','{,}'));
$('xValue').textContent=fmt(a.x);$('fieldCurrent').textContent=String(Math.round(100*a.currents[0]/maxF))+' %';const peak=Math.max(...bars.map(Math.abs))/maxK;$('cageCurrent').textContent=(100*peak).toFixed(0)+' %';$('fieldMeter').value=Math.min(1,Math.abs(a.currents[0])/maxF);$('cageMeter').value=Math.min(1,peak);
viewButtons.forEach(button=>button.setAttribute('aria-pressed',Math.abs(position-presets[button.dataset.timePreset])<=(playing?presetRadius:1e-6)));
if(!playing)updatePlayLabel();
chart();window.transientState={angle,mode:'time',t,damper,...a,maxField:max};}
function updatePlayLabel(){$('play').textContent=+timeSlider.value>0&&+timeSlider.value<100?'▶ Pokračovat':'▶ Přehrát od začátku';}
function stop(){playing=false;cancelAnimationFrame(raf);updatePlayLabel();}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;draw();});}
$('angle').oninput=schedule;$('axisD').onclick=()=>{$('angle').value=0;schedule();};$('axisQ').onclick=()=>{$('angle').value=90;schedule();};
timeSlider.onpointerdown=()=>{pointerOnTime=true;};
window.addEventListener('pointerup',()=>{pointerOnTime=false;});
window.addEventListener('pointercancel',()=>{pointerOnTime=false;});
timeSlider.oninput=()=>{
 if(pointerOnTime){
  const near=Object.values(presets).find(value=>Math.abs(+timeSlider.value-value)<=presetRadius);
  if(near!==undefined)timeSlider.value=near;
 }
 stop();schedule();
};
$('play').onclick=()=>{
 if(playing){stop();return;}
 if(+timeSlider.value>=100)timeSlider.value=0;
 playing=true;previous=performance.now();$('play').textContent='❚❚ Pozastavit';
 function tick(now){
  if(!playing)return;
  const dt=now-previous;
  if(dt>=65){timeSlider.value=Math.min(100,+timeSlider.value+dt/100);previous=now;draw();}
  if(+timeSlider.value>=100){stop();return;}
  raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
};
viewButtons.forEach(button=>button.onclick=()=>{timeSlider.value=presets[button.dataset.timePreset];stop();schedule();});
const headerActions=window.frameElement?.closest('.imported-workspace')?.querySelector('.modulehead > .actions');
if(headerActions)headerActions.prepend(viewSwitch);
else document.querySelector('main > header')?.append(viewSwitch);
$('damper').onchange=()=>{damper=$('damper').checked;stop();schedule();};
$('xName').innerHTML=math('X(t)');
$('eqD').innerHTML=math("X_d''<X_d'<X_d");$('eqQ').innerHTML=math("X_q''<X_q'=X_q");$('valuesD').textContent=[limitsD.sub,limitsD.trans,limitsD.steady].map(fmt).join(' → ')+' p. j.';$('valuesQ').textContent=[limitsQ.sub,limitsQ.trans,limitsQ.steady].map(fmt).join(' → ')+' p. j.';$('eqContinuity').innerHTML=math('@Delta u_r=R_r@Delta i_r+{d@Delta@psi_r@over dt}=0,@qquad@Delta@psi_r(0^+)=0');$('eqPhysics').innerHTML=math("@Delta@boldsymbol@psi_r=L_{rs}@Delta@boldsymbol i_s+L_{rr}@Delta@boldsymbol i_r,@qquad L_{rr}{d@Delta@boldsymbol i_r@over dt}+R_r@Delta@boldsymbol i_r=0")+'<br>'+math("X=@omega{@Delta@psi_s@over@Delta i_s},@qquad L_s''=L_{ss}-L_{sr}L_{rr}^{-1}L_{rs}");draw();new ResizeObserver(()=>chart()).observe(historyPlot);document.fonts.ready.then(schedule);window.addEventListener('pagehide',stop);
})();
