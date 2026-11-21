(()=>{'use strict';const $=id=>document.getElementById(id);let theta=0,playing=true,coilPlaying=false,released=false,speed=0,rotor=0,manualSlip=false,coilView=true;
const BRAKE=.5*.15/(.25+.15*.15);
const turn=2*Math.PI;
const coilFields={total:'Výsledné pole',external:'Pole buzení',reaction:'Pole závitu'};
const num=x=>(Math.abs(x)<.0005?0:x).toFixed(2).replace('.', '{,}');const tex=(el,t)=>{if(el.dataset.last!==t){katex.render(t,el,{throwOnError:false});el.dataset.last=t}};
function point(r,t,slip=1){const den=r*r+slip*slip,phi=Math.atan2(slip,r),delta=Math.PI/2+phi,amp=den?slip/Math.sqrt(den):0,mean=den?r*slip/den:0;return{i:amp*Math.cos(t-phi),m:mean,mean,phi,delta,amp,beta:t-delta}}
window.rotorResistancePoint=point;window.resistanceDynamicsState=()=>({theta,speed,released,playing:coilView?coilPlaying:playing,manualSlip,coilView,brake:BRAKE});
function arrow(x,y,u,v,c,w=4,maxHead=12){const len=Math.hypot(u,v);if(len<1)return '';const a=u/len,b=v/len,h=Math.min(maxHead,len*.45),X=x+u,Y=y+v;return `<path d="M${x} ${y}L${X-h*a} ${Y-h*b}" stroke="${c}" stroke-width="${w}"/><path d="M${X} ${Y}L${X-h*a+h*.45*b} ${Y-h*b-h*.45*a}L${X-h*a-h*.45*b} ${Y-h*b+h*.45*a}Z" fill="${c}"/>`}
function scene(r,slip){
 if(coilView)return AMCoil.scene({
  r,slip,theta,rotor,
  source:$('coilDisplay').value,showMMF:$('showCoilMMF').checked
 });
 const a=point(r,theta,slip),showBarEffects=$('showMachineBars').checked;
 return AMResistanceMachine({current:a.amp,phase:a.phi,s:slip,omega2:slip,f:1},theta,rotor,{
  fieldLines:$('showFieldLines').checked,rotorField:$('showRotorLines').checked,
  currents:showBarEffects,forces:showBarEffects
 });
}
function angleIcon(a){const cx=72,cy=63,r=27,end=-a.delta,ex=cx+r*Math.cos(end),ey=cy-r*Math.sin(end);let h='<circle cx="72" cy="63" r="47" fill="white" stroke="#d7e2dd"/>';h+=arrow(cx,cy,53,0,'#007e6c',3);h+=arrow(cx,cy,47*Math.sqrt(a.amp)*Math.cos(end),-47*Math.sqrt(a.amp)*Math.sin(end),'#8661b1',3);h+=`<path d="M${cx+r} ${cy}A${r} ${r} 0 0 1 ${ex} ${ey}" fill="none" stroke="#b28027" stroke-width="2"/><circle cx="72" cy="63" r="3" fill="#37534a"/>`;const tag=(x,y,t,c)=>`<foreignObject x="${x-25}" y="${y-12}" width="50" height="26"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:17px;text-align:center;color:${c}">${katex.renderToString(t,{throwOnError:false})}</div></foreignObject>`;h+=tag(136,63,String.raw`\mathbf{F}_s`,'#007e6c');const tx=cx+47*Math.sqrt(a.amp)*Math.cos(end),ty=cy-47*Math.sqrt(a.amp)*Math.sin(end);h+=tag(tx,ty+20,String.raw`\mathbf{F}_r`,'#8661b1');return h}
function emphasize(a){
 tex($('phiLargeR'),String.raw`\varphi_2=`+num(a.phi*180/Math.PI)+String.raw`^{\circ}`);
 tex($('deltaLargeR'),String.raw`\delta=`+num(a.delta*180/Math.PI)+String.raw`^{\circ}`);
 $('angleIconR').innerHTML=angleIcon(a);
 tex($('angleEffect'),String.raw`\sin\delta=`+num(Math.sin(a.delta)));
}
const plotMathCache=new Map();function plotLabel(x,y,t,size=15,color='#526a70'){const key=t+'|'+size+'|'+color;let h=plotMathCache.get(key);if(!h){h='<div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;white-space:nowrap;font-size:'+size+'px;color:'+color+'">'+katex.renderToString(t,{throwOnError:false})+'</div>';plotMathCache.set(key,h)}return '<foreignObject x="'+(x-45)+'" y="'+(y-12)+'" width="90" height="26">'+h+'</foreignObject>'}
function drawCoilPhasors(slip,response,relative){
 const voltage=52*slip*Math.cos(relative);
 const diagram=$('coilPhasorDiagram'),key=slip+'|'+response.amp+'|'+response.phase+'|'+voltage;
 if(diagram.dataset.last===key)return;
 diagram.dataset.last=key;
 const x=70,y=70,axisColor='#829991',voltageColor='#007e6c',currentColor='#8661b1';
 let h='<g data-phasor-axes>'
   +arrow(x,130,0,-116,axisColor,1,6)+arrow(130,y,-116,0,axisColor,1,6)
   +plotLabel(83,12,String.raw`\mathrm{Re}`,11)
   +plotLabel(16,85,String.raw`\mathrm{Im}`,11)+'</g>';

 $('coilPhasorZero').hidden=slip>0;
 $('coilPhasorAngle').hidden=slip===0;
 if(slip>0){
  const phase=response.phase,sin=Math.sin(phase),cos=Math.cos(phase);
  const current=52*response.amp,arcRadius=Math.min(22,current);
  if(phase>0&&arcRadius>4){
   h+=`<path d="M${x} ${y-arcRadius}A${arcRadius} ${arcRadius} 0 0 1 ${x+arcRadius*sin} ${y-arcRadius*cos}" fill="none" stroke="#956b20"/>`;
  }
  const currentX=current*sin,currentY=-current*cos;
  h+='<g data-instant-voltage>'+arrow(x,y,0,-voltage,voltageColor,2.5)
    +plotLabel(x-14,y-voltage,'u_i',14,voltageColor)+'</g>';
  h+='<g data-phasor="current">'+arrow(x,y,currentX,currentY,currentColor,2.5)
    +plotLabel(Math.min(128,x+currentX+12),y+currentY-7,String.raw`\overline{I_2}`,14,currentColor)+'</g>';
  tex($('coilPhasorAngle'),String.raw`\varphi_2=`+num(phase*180/Math.PI)+String.raw`^{\circ}`);
 }
 diagram.innerHTML=h;
}
function fitCoilPhasors(){
 const scene=$('res'),width=scene.clientWidth,height=scene.clientHeight;
 if(!width||!height)return;
 const [left,top,viewWidth,viewHeight]=scene.getAttribute('viewBox').split(/\s+/).map(Number);
 const scale=Math.min(width/viewWidth,height/viewHeight);
 const {x,y,radius}=AMCoil.sceneBounds;
 const centerX=(width-viewWidth*scale)/2+(x-left)*scale;
 const centerY=(height-viewHeight*scale)/2+(y-top)*scale;
 const phasors=$('coilPhasorDiagram').closest('figure');
 const captionHeight=phasors.querySelector('figcaption').offsetHeight||18;
 const clearance=radius*scale+8,extraHeight=captionHeight+8;
 // Find the largest square diagram whose caption and frame also clear the field circle.
 let low=0,high=Math.min(width,Math.max(0,height-extraHeight));
 while(high-low>1){
  const size=(low+high)/2;
  const dx=Math.max(0,centerX-size),dy=Math.max(0,centerY-size-extraHeight);
  if(Math.hypot(dx,dy)>=clearance)low=size;
  else high=size;
 }
 phasors.style.width=Math.floor(low)+'px';
}
function torquePlot(r,a){const plot=$('resistanceTorquePlot'),width=Math.max(180,plot.clientWidth||340),height=Math.max(110,plot.clientHeight||(coilView?160:275));
const left=48,right=width-(coilView?57:32),top=coilView?23:28,bottom=height-(coilView?35:59);
plot.setAttribute('viewBox',`0 0 ${width} ${height}`);
const X=n=>left+(right-left)*n,Y=m=>bottom-(bottom-top)*m/.56;let h='';for(const n of [0,.5,1]){h+=`<path d="M${X(n)} ${top}V${bottom}" stroke="#e1e9e5"/>`+plotLabel(X(n),bottom+(coilView?14:19),num(n),coilView?13:15);}for(const m of [0,.25,.5]){h+=`<path d="M${left} ${Y(m)}H${right}" stroke="#e1e9e5"/>`+plotLabel(23,Y(m),num(m),coilView?13:15);}h+=`<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="#829991"/>`+plotLabel(62,12,'M/M_b',coilView?14:16)+plotLabel(coilView?width-24:right-11,coilView?bottom+14:height-17,'n/n_s',coilView?14:16);
let d='';for(let k=0;k<=500;k++){const n=k/500;d+=(k?'L':'M')+X(n)+' '+Y(point(r,0,1-n).mean)}h+=`<path d="${d}" fill="none" stroke="#007e6c" stroke-width="2.5"/><path d="M${left} ${Y(BRAKE)}H${right}" stroke="#bb7925" stroke-width="2"/>`+plotLabel(X(.79),Y(BRAKE)-16,'M_z/M_b',15,'#9d6621');
h+=`<path d="M${X(speed)} ${bottom}V${Y(a.mean)}" stroke="#8661b1" stroke-dasharray="3 4"/><circle data-working-point cx="${X(speed)}" cy="${Y(a.mean)}" r="5" fill="#8661b1" stroke="white" stroke-width="1.5"/>`;
const slip=r*2*BRAKE/(1+Math.sqrt(1-4*BRAKE*BRAKE)),eq=r>0&&slip<=1?1-slip:null;if(eq!==null)h+=`<circle cx="${X(eq)}" cy="${Y(BRAKE)}" r="5" fill="white" stroke="#bb7925" stroke-width="2"/>`;$('resistanceTorquePlot').innerHTML=h;tex($('equilibrium'),eq===null?String.raw`M<M_z\quad(n=0)`:String.raw`n_{\mathrm{ust}}/n_s=`+num(eq));}
function forcePlot(r,slip,relative,response){
 const plot=$('forcePlot'),width=Math.max(180,plot.clientWidth||340),height=Math.max(110,plot.clientHeight||160);
 const left=39,right=width-23,top=21,bottom=height-37;
 const X=angle=>left+(right-left)*angle/turn;
 const Y=force=>bottom-(bottom-top)*(force+1)/2;
 const key=[r,slip,width,height].join(':');
 if(plot.dataset.last!==key){
  plot.dataset.last=key;
  plot.setAttribute('viewBox',`0 0 ${width} ${height}`);
  let h='';
  for(const degrees of [0,90,180,270,360]){
   const x=X(degrees*Math.PI/180);
   h+=`<path d="M${x} ${top}V${bottom}" stroke="#e1e9e5"/>`+plotLabel(x,bottom+13,degrees+String.raw`^{\circ}`,12);
  }
  for(const force of [-1,0,1])h+=plotLabel(20,Y(force),String(force),13);
  h+=`<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="#829991"/>`
    +plotLabel(47,10,'F/F_b',14)+plotLabel(right-4,height-9,String.raw`\beta`,14);
  let tangentialCurve='',magnitudeCurve='';
  for(let k=0;k<=180;k++){
   const angle=turn*k/180,current=AMCoil.response(r,slip,angle).i;
   const {x:radial,y:tangential}=AMCoil.barForces(angle,0,current)[0];
   const segment=(k?'L':'M')+X(angle).toFixed(2)+' ';
   tangentialCurve+=segment+Y(tangential).toFixed(2);
   magnitudeCurve+=segment+Y(Math.hypot(radial,tangential)).toFixed(2);
  }
  h+=`<path data-bar-force-magnitude d="${magnitudeCurve}" fill="none" stroke="#356ac3" stroke-width="1.8"/>`
    +`<path data-bar-force d="${tangentialCurve}" fill="none" stroke="#ad365d" stroke-width="2"/>`
    +`<path data-net-force d="M${left} ${Y(0)}H${right}" stroke="#496764" stroke-width="1.5" stroke-dasharray="4 3"/>`
    +`<path data-force-cursor stroke="#829991" stroke-dasharray="3 3"/>`
    +`<circle data-force-magnitude-point r="4" fill="#356ac3" stroke="white"/><circle data-force-point r="4" fill="#ad365d" stroke="white"/>`;
  plot.innerHTML=h;
 }
 const angle=relative<0?relative+turn:relative,x=X(angle);
 plot.querySelector('[data-force-cursor]').setAttribute('d',`M${x} ${top}V${bottom}`);
 const {x:radial,y:tangential}=AMCoil.barForces(relative,0,response.i)[0];
 for(const [selector,value] of [['[data-force-point]',tangential],['[data-force-magnitude-point]',Math.hypot(radial,tangential)]]){
  const marker=plot.querySelector(selector);
  marker.setAttribute('cx',x);
  marker.setAttribute('cy',Y(value));
 }
}
function draw(updatePlot=true){
 document.body.classList.toggle('coil-view',coilView);
 $('viewToggle').textContent=coilView?'Řez strojem':'Řez závitem';
 $('viewToggle').setAttribute('aria-pressed',String(!coilView));
 $('mechanics').hidden=coilView;
 $('coilDisplay').hidden=!coilView;
 $('showCoilMMF').closest('label').hidden=!coilView;
 if(coilView){
  const source=$('coilDisplay').value;
  for(const caption of document.querySelectorAll('[data-coil-field]')){
   caption.textContent=coilFields[source];
   caption.classList.toggle('green',source!=='reaction');
   caption.classList.toggle('purple',source==='reaction');
  }
 }
 $('slipControl').value=100*(1-speed);
 const slip=1-speed,r=+$('resistance').value,a=point(r,theta,slip);
 const response=coilView?AMCoil.response(r,slip,theta-rotor):a;

 $('res').innerHTML=scene(r,slip);
 if(updatePlot)torquePlot(r,a);
 tex($('resOut'),String.raw`R_2/(\omega_1 L_2)=`+num(r));
 tex($('phaseOut'),String.raw`\theta=`+num(theta*180/Math.PI)+String.raw`^{\circ}`);
 tex($('slipOut'),String.raw`s=`+num(100*slip)+String.raw`\,\%`);
 tex($('speedR'),String.raw`n/n_s=`+num(speed));
 tex($('mean'),String.raw`M/M_b=`+num(a.mean));
 $('meanBar').style.width=a.mean*200+'%';

 const currentSymbol=coilView?String.raw`\hat I/I_{\mathrm{ref}}`:'B_{i_r}/B_{i_r0}';
 const momentSymbol=coilView?'M(t)/M_b':'M/M_b';
 tex($('iR'),currentSymbol+'='+num(response.amp));
 tex($('mR'),momentSymbol+'='+num(coilView?response.instantTorque:response.mean));
 if(coilView){
  drawCoilPhasors(slip,response,theta-rotor);
  forcePlot(r,slip,theta-rotor,response);
  tex($('angleEffect'),String.raw`\langle M\rangle/M_b=`+num(response.meanTorque));
  tex($('angle'),String.raw`M(t)\propto i(t)B_s\cos\beta`);
 }else{
  emphasize(a);
  tex($('angle'),String.raw`\delta=90^{\circ}+\varphi_2`);
 }
 for(const e of document.querySelectorAll('[data-current-caption]'))
  e.textContent=coilView?'Amplituda proudu závitu':'Velikost rotorového pole';
 for(const e of document.querySelectorAll('[data-moment-caption]'))
  e.textContent=coilView?'Okamžitý moment':'Elektromagnetický moment';

 $('mechanics').textContent=manualSlip?'Spustit rozběh':released?'Zabrzdit rotor':'Uvolnit rotor';
 $('mechanics').setAttribute('aria-pressed',String(released));
 $('play').textContent=(coilView?coilPlaying:playing)?'Pozastavit pole':'Spustit pole';
 document.querySelectorAll('[data-r]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.r===r)));
}

function syncControl(){
 const slip=$('controlMode').value==='slip';
 $('phase').hidden=$('phaseOut').hidden=slip;
 $('slipControl').hidden=$('slipOut').hidden=!slip;
}

$('viewToggle').onclick=()=>{
 coilView=!coilView;
 draw();
 if(coilView)fitCoilPhasors();
};
$('coilDisplay').onchange=()=>draw(false);
$('controlMode').onchange=syncControl;
for(const id of ['showCoilMMF','showFieldLines','showRotorLines','showMachineBars'])$(id).onchange=()=>draw(false);
$('slipControl').oninput=()=>{
 speed=1-Number($('slipControl').value)/100;
 manualSlip=true;
 released=false;
 draw();
};
$('mechanics').onclick=()=>{
 if(manualSlip){manualSlip=false;released=false;}
 released=!released;
 if(released)playing=true;
 else speed=0;
 draw();
};
$('play').onclick=()=>{
 if(coilView)coilPlaying=!coilPlaying;
 else playing=!playing;
 draw(false);
};
$('resistance').oninput=draw;
const phaseControl=$('phase');
let draggingPhase=false;
phaseControl.onpointerdown=()=>{draggingPhase=true};
phaseControl.onpointerup=phaseControl.onpointercancel=phaseControl.onlostpointercapture=phaseControl.onkeydown=()=>{draggingPhase=false};
phaseControl.oninput=()=>{
 if(coilView)coilPlaying=false;
 else playing=false;
 const degrees=+phaseControl.value,quarterTurn=Math.round(degrees/90)*90;
 const snapped=draggingPhase&&Math.abs(degrees-quarterTurn)<=3?quarterTurn:degrees;
 if(snapped!==degrees)phaseControl.value=snapped;
 theta=snapped*Math.PI/180;
 draw(false);
};
document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{
 $('resistance').value=b.dataset.r;
 draw();
});
$('reset').onclick=()=>{
 theta=0;
 $('phase').value=0;
 $('resistance').value=.5;
 playing=true;
 coilPlaying=false;
 released=false;
 manualSlip=false;
 coilView=true;
 $('controlMode').value='phase';
 $('coilDisplay').value='total';
 for(const id of ['showCoilMMF','showFieldLines','showRotorLines','showMachineBars'])$(id).checked=false;
 speed=rotor=0;
 syncControl();
 draw();
};
document.querySelectorAll('[data-tex]').forEach(e=>katex.render(e.dataset.tex,e,{throwOnError:false}));

let lastFrame=0;
function tick(t){
 const dt=lastFrame?Math.min((t-lastFrame)/1000,.05):0;
 lastFrame=t;
 if(coilView?coilPlaying:playing){
  if(!coilView&&released){
   const m=point(+$('resistance').value,theta,1-speed).mean;
   speed=Math.min(.999,Math.max(0,speed+dt*.7*(m-BRAKE)));
  }
  rotor=(rotor+dt*.65*speed)%turn;
  theta=(theta+dt*.65)%turn;
  $('phase').value=theta*180/Math.PI;
  draw(!coilView);
 }
 requestAnimationFrame(tick);
}
new ResizeObserver(()=>torquePlot(+$('resistance').value,point(+$('resistance').value,theta,1-speed))).observe($('resistanceTorquePlot'));
new ResizeObserver(()=>{
 if(!coilView)return;
 const r=+$('resistance').value,slip=1-speed,relative=theta-rotor;
 forcePlot(r,slip,relative,AMCoil.response(r,slip,relative));
}).observe($('forcePlot'));
new ResizeObserver(fitCoilPhasors).observe($('res'));
draw();
fitCoilPhasors();
requestAnimationFrame(tick);
})();
