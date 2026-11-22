(()=>{'use strict';const $=id=>document.getElementById(id);let theta=0,coilPlaying=false;
const resistanceControl=rotorResistanceControl(document.getElementById('resistance'));
const turn=2*Math.PI;
const statorFlux=relative=>-Math.sin(relative);
const coilFields={total:'Výsledné pole',external:'Pole statoru',reaction:'Pole závitu'};
const num=x=>(Math.abs(x)<.0005?0:x).toFixed(2).replace('.', '{,}');const tex=(el,t)=>{if(el.dataset.last!==t){katex.render(t,el,{throwOnError:false});el.dataset.last=t}};
window.resistanceDynamicsState=()=>({theta,speed:0,playing:coilPlaying,coilView:true});
function arrow(x,y,u,v,c,w=4,maxHead=12){const len=Math.hypot(u,v);if(len<1)return '';const a=u/len,b=v/len,h=Math.min(maxHead,len*.45),X=x+u,Y=y+v;return `<path d="M${x} ${y}L${X-h*a} ${Y-h*b}" stroke="${c}" stroke-width="${w}"/><path d="M${X} ${Y}L${X-h*a+h*.45*b} ${Y-h*b-h*.45*a}L${X-h*a-h*.45*b} ${Y-h*b+h*.45*a}Z" fill="${c}"/>`}
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
function wavePlot(r,slip,relative,flux){
 const plot=$('wavePlot'),width=Math.max(180,plot.clientWidth||340),height=Math.max(110,plot.clientHeight||160);
 const left=36,right=width-18,top=12,bottom=height-28;
 const X=t=>left+(right-left)*t/turn,Y=v=>(top+bottom)/2-v*(bottom-top)/(flux?2.3:4);
 const key=[r,slip,flux,width,height].join('|');
 if(plot.dataset.last!==key){
  plot.dataset.last=key;
  plot.setAttribute('viewBox','0 0 '+width+' '+height);
  $('waveTitle').textContent=flux?'Tok, napětí a proud závitu':'Moment závitu za periodu';
  const curves=flux?[
   ['Tok statoru smyčkou','#356ac3',statorFlux],
   ['Indukované napětí','#007e6c',t=>slip*Math.cos(t)],
   ['Proud','#8661b1',t=>AMCoil.response(r,slip,t).i]
  ]:[
   ['Okamžitý moment','#ad365d',t=>AMCoil.response(r,slip,t).instantTorque],
   ['Střední moment','#007e6c',()=>AMCoil.response(r,slip,0).meanTorque]
  ];
  $('waveLegend').innerHTML=curves.map(([name,color])=>'<span style="--curve:'+color+'">'+name+'</span>').join('');
  let h='<path d="M'+left+' '+top+'V'+bottom+'M'+left+' '+Y(0)+'H'+right+'" fill="none" stroke="#849791"/>';
  for(const v of [-1,0,1])h+=plotLabel(16,Y(v),String(v),12);
  for(const deg of [0,90,180,270,360])h+=plotLabel(X(deg*Math.PI/180),bottom+12,deg+'^{\\circ}',12);
  for(const [,color,value] of curves){
   let d='';
   for(let k=0;k<=180;k++){const t=turn*k/180;d+=(k?'L':'M')+X(t).toFixed(2)+' '+Y(value(t)).toFixed(2);}
   h+='<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="2"/>';
  }
  plot.innerHTML=h+'<path data-cursor stroke="#526a70" stroke-dasharray="3 3"/>';
 }
 const x=X((relative%turn+turn)%turn);
 plot.querySelector('[data-cursor]').setAttribute('d','M'+x+' '+top+'V'+bottom);
}
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
function draw(){
 const r=resistanceControl.read(),slip=1,relative=theta;
 const response=AMCoil.response(r,slip,relative),mode=$('coilVectors').value,source=$('coilDisplay').value;
 $('res').innerHTML=AMCoil.scene({r,slip,theta,source,showMMF:mode==='mmf',showFlux:mode==='flux'});
 for(const caption of document.querySelectorAll('[data-coil-field]')){
  caption.textContent=coilFields[source];caption.classList.toggle('green',source!=='reaction');caption.classList.toggle('purple',source==='reaction');
 }
 tex($('resOut'),'R_2/(\\omega_1 L_2)='+resistanceControl.formatted().replace(',', '{,}'));
 tex($('phaseOut'),'\\theta='+num(theta*180/Math.PI)+'^{\\circ}');
 tex($('iR'),'\\hat I/I_{\\mathrm{ref}}='+num(response.amp));
 tex($('mR'),'M(t)/M_b='+num(response.instantTorque));
 tex($('angleEffect'),'\\langle M\\rangle/M_b='+num(response.meanTorque));
 tex($('angle'),mode==='flux'?'\\Phi_s/\\hat\\Phi_s='+num(statorFlux(relative)):'M(t)\\propto i(t)B_s\\cos\\beta');
 wavePlot(r,slip,relative,mode==='flux');
 drawCoilPhasors(slip,response,relative);
 forcePlot(r,slip,relative,response);
 $('play').textContent=coilPlaying?'Pozastavit pole':'Spustit pole';
}


$('coilDisplay').onchange=$('coilVectors').onchange=draw;
$('play').onclick=()=>{coilPlaying=!coilPlaying;draw()};
$('resistance').oninput=draw;
const phaseControl=$('phase');
let draggingPhase=false;
phaseControl.onpointerdown=()=>{draggingPhase=true};
phaseControl.onpointerup=phaseControl.onpointercancel=phaseControl.onlostpointercapture=phaseControl.onkeydown=()=>{draggingPhase=false};
phaseControl.oninput=()=>{
 coilPlaying=false;
 const degrees=+phaseControl.value,quarterTurn=Math.round(degrees/90)*90;
 const snapped=draggingPhase&&Math.abs(degrees-quarterTurn)<=3?quarterTurn:degrees;
 if(snapped!==degrees)phaseControl.value=snapped;
 theta=snapped*Math.PI/180;
 draw(false);
};
$('reset').onclick=()=>{
 theta=0;
 $('phase').value=0;
 resistanceControl.set(.5);
 coilPlaying=false;
 $('coilDisplay').value='total';
 $('coilVectors').value='none';
 draw();
};
document.querySelectorAll('[data-tex]').forEach(e=>katex.render(e.dataset.tex,e,{throwOnError:false}));

let lastFrame=0;
function tick(t){
 const dt=lastFrame?Math.min((t-lastFrame)/1000,.05):0;
 lastFrame=t;
 if(coilPlaying){
  theta=(theta+dt*.65)%turn;
  $('phase').value=theta*180/Math.PI;
  draw();
 }
 requestAnimationFrame(tick);
}
new ResizeObserver(draw).observe($('wavePlot'));
new ResizeObserver(draw).observe($('forcePlot'));
new ResizeObserver(fitCoilPhasors).observe($('res'));
draw();
fitCoilPhasors();
requestAnimationFrame(tick);
})();
