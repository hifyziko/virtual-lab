'use strict';
const $ = id => document.getElementById(id);
const TAU = 2 * Math.PI, blue = '#356ac3', purple = '#8743b1', ref = '#879bab', orange = '#c47837';
const amp = () => Number($('amp').value) / 100, q = () => Number($('q').value);
const fmt = (x, digits=2) => x.toLocaleString('cs-CZ', {minimumFractionDigits:digits, maximumFractionDigits:digits,useGrouping:false});
const numberTex = (x, digits=2) => fmt(x,digits).replace(',', '{,}');
const clamp = (x,min,max) => Math.max(min,Math.min(x,max));
let view=1, m=2, n=1, animation=0, queued=0;
const markup = new Map();
function math(tex){
 if(!markup.has(tex)) markup.set(tex,katex.renderToString(tex,{output:'htmlAndMathml',throwOnError:true}));
 return markup.get(tex);
}
function setMath(node,tex){
 if(node.dataset.formula===tex)return;
 node.innerHTML=math(tex);
 node.dataset.formula=tex;
}
const symbols={'ξᵣ/Amax':'\\xi_r/A_{\\max}','φ':'\\varphi','θ':'\\theta','π':'\\pi','T₁':'\\mathbf T_1','T₂':'\\mathbf T_2','F = 0':'F=0','F':'\\mathbf F','P':'P'};
function txt(x,y,label,anchor='start',extra=''){
 const labelHtml=String(label).replace(/ξᵣ\/Amax|F = 0|T₁|T₂|[φθπFP]/g,(token,offset,whole)=>{
  if((token==='F'||token==='P') && /[a-zA-ZÀ-ž]/.test(whole[offset+1]||' ')) return token;
  return math(symbols[token]);
 });
 if(labelHtml===String(label))return '<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" '+extra+'>'+label+'</text>';
 const dx=anchor==='middle'? -160:anchor==='end'? -320:0;
 const align=anchor==='middle'?'center':anchor==='end'?'right':'left';
 return '<g '+extra+'><foreignObject x="'+(x+dx)+'" y="'+(y-17)+'" width="320" height="26"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:'+align+'">'+labelHtml+'</div></foreignObject></g>';
}
const lineTurns=()=>m;
const probeAngle=turns=>TAU*turns*Number($('probe').value)/100;
const cameras=new Map();
function showSliceForce(id,value){
 let reading=numberTex(value,3);
 if(value>0 && value<.001){
  const [mantissa,exponent]=value.toExponential(2).split('e');
  reading=mantissa.replace('.','{,}')+'\\cdot10^{'+Number(exponent)+'}';
 }
 setMath($(id),'|\\hat f_{\\mathrm v}|='+reading);
}
const views=['gallery','line','compare','bend'];
const viewButtons=[...document.querySelectorAll('[data-view]')], modeButtons=[...document.querySelectorAll('[data-mode]')];
function render(){
 const A=amp(),Q=q();

 setMath($('ampVal'),numberTex(A*100,0)+'\\,\\%');
 const resonance=m/n;
 $('qControl').style.setProperty('--resonance-position',((resonance-Number($('q').min))/(Number($('q').max)-Number($('q').min))*100)+'%');
 $('qControl').dataset.locked=String(Math.abs(Q-resonance)<1e-9);
 setMath($('qVal'),numberTex(Q));setMath($('probeVal'),numberTex(probeAngle(view===1?lineTurns():2)*180/Math.PI,0)+'^\\circ');
 if(view===0){
  for(const k of [1,2,4]){drawSurface($('shape'+k),cameras.get('shape'+k),k,A);$('gallery'+k).innerHTML=galleryDrawing(k,1,A);}
 }else if(view===1){
  const turns=lineTurns(), transparency=Number($('transparency').value);
  setMath($('transparencyVal'),numberTex(transparency,0)+'\\,\\%');
  const closes=Math.abs(turns/Q-Math.round(turns/Q))<1e-9;
  $('closure').textContent=closes?'Konec splývá se začátkem':'Konec je mimo začátek';
  drawSurface($('singleTorus'),cameras.get('singleTorus'),m,A,Q,turns,transparency/100);
  renderSlice('singleTorus',Q,turns);map('singleMap',Q,turns);trace('singleTrace',Q,turns);
 }else if(view===2){
  for(const side of ['A','B']){
   const value=side==='A'?Q:m/n;
   setMath($('q'+side),'q='+numberTex(value));map('map'+side,value);
   trace(side==='A'?'trace':'traceB',value);forceDetail('force'+side,value);
   setMath($('energy'+side),'\\widehat W='+numberTex(A*A*(m/value-n)**2,3));
  }
 }else{
  for(const side of ['A','B']){
   const across=side==='B';
   plasmaPreview('plasma'+side,across);sheet('sheet'+side,across);
   
   setMath($('bendEnergy'+side),'\\widehat W='+numberTex(across?0:A*A,3));
  }
 }
}
function schedule(){if(!queued)queued=requestAnimationFrame(()=>{queued=0;render();});}
function stop(){cancelAnimationFrame(animation);animation=0;$('scan').textContent='Sledovat bod P';}
function selectView(index){
 stop();view=index;views.forEach((id,i)=>$(id).hidden=i!==view);
 viewButtons.forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.view)===view));
 modeButtons.forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.mode)===m));
 $('shapes').hidden=view===3;
 $('transparencyControl').hidden=view!==1;
 $('qControl').hidden=view===0||view===3;
 for(const id of ['probeControl','scan'])$(id).hidden=view===0||view===3;
 render();
}
viewButtons.forEach(b=>b.onclick=()=>selectView(Number(b.dataset.view)));
modeButtons.forEach(b=>b.onclick=()=>{m=Number(b.dataset.mode);selectView(view===0?1:view);});
const amplitude=$('amp');
function updateAmplitude(){
 stop();
 setMath($('ampVal'),numberTex(Number(amplitude.value),0)+'\\,\\%');
 schedule();
}
amplitude.oninput=amplitude.onchange=updateAmplitude;
for(const [id,delta] of [['ampDown',-5],['ampUp',5]]){
 $(id).onclick=()=>{amplitude.value=clamp(Number(amplitude.value)+delta,0,100);updateAmplitude();};
}
const qSlider=$('q');
let draggingQ=false;
function releaseQ(){draggingQ=false;}
qSlider.onpointerdown=()=>{draggingQ=true;};
qSlider.onkeydown=qSlider.onblur=releaseQ;
window.addEventListener('pointerup',releaseQ);
window.addEventListener('pointercancel',releaseQ);
qSlider.oninput=()=>{
 const target=m/n;
 if(draggingQ && Math.abs(q()-target)<=.07+1e-9)qSlider.value=String(target);
 stop();schedule();
};
$('transparency').oninput=schedule;
$('probe').oninput=()=>{stop();schedule();};
$('scan').onclick=()=>{
 if(animation){stop();return;}
 let initial=Number($('probe').value);if(initial>=100)initial=0;
 const start=performance.now();
 function advance(now){
  const value=Math.min(100,initial+Math.floor((now-start)/100));
  if(Number($('probe').value)!==value){$('probe').value=value;render();}
  if(value<100)animation=requestAnimationFrame(advance);else stop();
 }
 $('scan').textContent='Zastavit bod P';animation=requestAnimationFrame(advance);
};
for(const id of ['singleTorus','shape1','shape2','shape4']){
const toroid=$(id),camera={yaw:-.6,pitch:.65};
 cameras.set(id,camera);
 let drag=null;
toroid.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,...camera};toroid.setPointerCapture(e.pointerId);};
toroid.onpointermove=e=>{
 if(!drag)return;
 camera.yaw=drag.yaw+(e.clientX-drag.x)*.009;camera.pitch=clamp(drag.pitch+(e.clientY-drag.y)*.008,-1.25,1.25);schedule();
};
toroid.onlostpointercapture=()=>{drag=null;};
}
$('help').onclick=()=>$('guide').showModal();$('closeHelp').onclick=()=>$('guide').close();
window.addEventListener('resize',schedule);
window.HiFyzikoFusionDispose=()=>{stop();cancelAnimationFrame(queued);window.removeEventListener('resize',schedule);window.removeEventListener('pointerup',releaseQ);window.removeEventListener('pointercancel',releaseQ);};
document.querySelectorAll('[data-tex]').forEach(node=>setMath(node,node.dataset.tex));
selectView(1);
