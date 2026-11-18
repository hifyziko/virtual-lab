(()=>{'use strict';
const $=id=>document.getElementById(id),P=HiFyzikoPlasma,style=HiFyzikoParticleStyle;
let model=new P.Model(),running=true,sign=1,disposed=false,last=0,raf=0,lastReadout='';
const canvas=$('scene'),ctx=canvas.getContext('2d'),fieldView=new HiFyzikoPlasmaField.FieldView();
const cameraExtent=1.36;
let zoom=1,viewX=P.width/2,viewY=P.height/2,pan=null;
function tex(node,value){if(node.dataset.rendered===value)return;node.dataset.rendered=value;katex.render(value,node,{throwOnError:false});}
const decimal=(v,d=2)=>v.toFixed(d).replace('.', '{,}');
document.querySelectorAll('[data-tex]').forEach(node=>tex(node,node.dataset.tex));
function readouts(){tex($('lineDensityValue'),decimal(Number($('lineDensity').value),1)+'\\,\\times');tex($('countValue'),String(model.atoms.length));tex($('temperatureValue'),decimal(model.T)+'\\,\\mathrm{eV}');tex($('bValue'),'B^{*}='+($('magnet').checked?decimal(sign*Number($('b').value),1):'0'));const k=model.ionCount,n=model.atoms.length,key=[k,n,model.target,model.mutual].join(':');if(key!==lastReadout){lastReadout=key;tex($('fractionValue'),decimal(100*k/n,0)+'\\,\\%');$('fractionBar').style.width=(100*k/n)+'%';tex($('counts'),'N_{\\text{atomů}}='+ (n-k)+'\\quad N_i='+k+'\\quad N_e='+k);$('state').textContent=n===1?(k?'Iont a volný elektron':'Jeden neutrální atom'):(k===0?'Neutrální plyn':k===n?'Plně ionizovaný soubor':'Částečně ionizovaný plyn');$('hint').textContent=k?(model.mutual?'Náboje vytvářejí pole a vzájemně na sebe působí.':'Srovnání: náboje se nyní navzájem neovlivňují.'):'Jádro a elektronový obal: z dálky se náboje vyruší.';}
tex($('playbackValue'),decimal(Number($('playback').value),2)+'\\,\\times');
 $('fieldState').textContent=!model.B?'Magnetické pole vypnuté':model.B>0?'Magnetické pole k tobě':'Magnetické pole od tebe';
}
function magnetic(){model.B=$('magnet').checked?sign*Number($('b').value):0;readouts();draw();}
$('count').oninput=()=>{model.setCount(Number($('count').value));readouts();draw();};
$('temperature').oninput=()=>{model.setTemperature(Number($('temperature').value));readouts();};
function preset(T){if(model.atoms.length<12){model.setCount(24);$('count').value=24;}model.setTemperature(T);$('temperature').value=T;for(let i=0;i<model.atoms.length;i++)model.equilibrate();readouts();draw();}
$('presetGas').onclick=()=>preset(.2);$('presetPartial').onclick=()=>preset(.75);$('presetFull').onclick=()=>preset(1.2);
$('magnet').onchange=magnetic;$('b').oninput=magnetic;$('reverse').onclick=()=>{sign*=-1;magnetic();};
$('mutual').onchange=()=>{model.mutual=$('mutual').checked;readouts();};
$('collisions').onchange=()=>{model.collisions=$('collisions').checked;};
$('playback').oninput=readouts;
$('play').onclick=()=>{running=!running;$('play').textContent=running?'Pozastavit':'Spustit';};
$('reset').onclick=()=>{model=new P.Model();$('playback').value=1;zoom=1;viewX=P.width/2;viewY=P.height/2;sign=1;running=true;$('count').value=1;$('temperature').value=.2;$('magnet').checked=false;$('b').value=6;$('mutual').checked=true;$('fields').checked=true;$('trails').checked=true;$('collisions').checked=true;$('lines').checked=true;$('lineDensity').value=1;$('centers').checked=false;$('play').textContent='Pozastavit';readouts();draw();};
$('help').onclick=()=>$('guide').showModal();$('closeHelp').onclick=()=>$('guide').close();
function surface(c,context){const w=c.clientWidth,h=c.clientHeight,d=Math.min((devicePixelRatio||1)*c.getBoundingClientRect().width/w,Math.sqrt(8000000/(w*h)));if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d);}context.setTransform(d,0,0,d,0,0);context.clearRect(0,0,w,h);return [w,h];}
function sphere(x,y,r,color,edge){const fill=ctx.createRadialGradient(x-r*.3,y-r*.4,0,x,y,r);fill.addColorStop(0,'#ffffff');fill.addColorStop(.3,color);fill.addColorStop(1,edge);ctx.save();ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();ctx.restore();}
function draw(){const [w,h]=surface(canvas,ctx),scale=Math.min(w/(P.width*cameraExtent),h/(P.height*cameraExtent))*zoom,ox=w/2-viewX*scale,oy=h/2-(P.height-viewY)*scale,X=x=>ox+x*scale,Y=y=>oy+(P.height-y)*scale,ps=model.particles();
 const radius=model.boundRadius*scale/1.575;
 if($('fields').checked){ctx.save();fieldView.draw(ctx,w,h,ps.map(p=>({x:X(p.x),y:Y(p.y),q:p.q,cloud:0})),scale,running,[viewX,viewY].join('/'),{x:ox,y:oy,width:P.width*scale,height:P.height*scale},$('lines').checked,Number($('lineDensity').value));ctx.restore();}
 $('fieldScale').hidden=!$('fields').checked;
 ctx.save();
 if(model.B){ctx.save();ctx.shadowColor='#ffffff';ctx.shadowBlur=4;ctx.strokeStyle='#37434b';ctx.fillStyle='#37434b';ctx.globalAlpha=.65+.3*Math.abs(model.B)/12;for(let x=-P.width*.16;x<P.width*1.16;x+=.85)for(let y=-P.height*.16;y<P.height*1.16;y+=.85){const edge=Math.max(Math.max(0,-x,x-P.width)/(P.width*.16),Math.max(0,-y,y-P.height)/(P.height*.16));ctx.globalAlpha=(.65+.3*Math.abs(model.B)/12)*(1-edge)*(1-edge)*Math.abs(model.magneticAt(x,y)/model.B);const a=X(x),b=Y(y);ctx.beginPath();ctx.arc(a,b,5,0,2*Math.PI);ctx.stroke();ctx.beginPath();if(model.B>0){ctx.arc(a,b,1.5,0,2*Math.PI);ctx.fill();}else{ctx.moveTo(a-3,b-3);ctx.lineTo(a+3,b+3);ctx.moveTo(a-3,b+3);ctx.lineTo(a+3,b-3);ctx.stroke();}}ctx.restore();}
 for(const p of ps){const x=X(p.x),y=Y(p.y),color=p.q<0?'#126bc3':p.q>0?'#eb3026':'#9d90b7';if($('trails').checked&&p.trail.length>1){ctx.strokeStyle=color;ctx.lineWidth=p.q<0?1.2:1.8;ctx.globalAlpha=.3;ctx.beginPath();p.trail.forEach((a,i)=>i?ctx.lineTo(X(a[0]),Y(a[1])):ctx.moveTo(X(a[0]),Y(a[1])));ctx.stroke();ctx.globalAlpha=1;}
 if(!p.q){const r=radius*2.1,outline=r*.75;
  // A pale backing and a two-tone contour keep the neutral cloud legible on E maps.
  const halo=ctx.createRadialGradient(x,y,outline*.6,x,y,r);halo.addColorStop(0,'rgba(255,255,255,.94)');halo.addColorStop(.65,'rgba(255,255,255,.8)');halo.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();
  const cloud=ctx.createRadialGradient(x,y,0,x,y,outline);cloud.addColorStop(0,'#ede8f5');cloud.addColorStop(.65,'#d9cdebbf');cloud.addColorStop(1,'#b6a2ce85');ctx.fillStyle=cloud;ctx.beginPath();ctx.arc(x,y,outline,0,2*Math.PI);ctx.fill();ctx.strokeStyle='#fffffff2';ctx.lineWidth=3.5;ctx.stroke();ctx.strokeStyle='#74608e';ctx.lineWidth=1.3;ctx.stroke();
 }
 const r=p.q<0?radius*.52:p.q>0?radius*.7:radius*.38;sphere(x,y,r,p.q===0?'#eb746c':color,p.q<0?'#154776':'#942b35');
 }
 for(const a of model.atoms)if(!a.electron){const e=model.boundElectron(a);sphere(X(e.x),Y(e.y),radius*.52,'#126bc3','#154776');}
 const ions=model.atoms.filter(a=>a.electron);if($('centers').checked&&ions.length){ctx.save();ctx.setLineDash([5,6]);ctx.lineWidth=1.8;for(const [key,color] of [['ion','#b43128'],['electron','#126bc3']]){const x=X(ions.reduce((sum,a)=>sum+a[key].x,0)/ions.length);ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(x,Y(P.height));ctx.lineTo(x,Y(0));ctx.stroke();}ctx.restore();}
 ctx.restore();}
function cameraScale(){return Math.min(canvas.clientWidth/(P.width*cameraExtent),canvas.clientHeight/(P.height*cameraExtent))*zoom;}
function mouse(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.clientWidth/r.width,(e.clientY-r.top)*canvas.clientHeight/r.height];}
canvas.addEventListener('wheel',e=>{e.preventDefault();const [x,y]=mouse(e),before=cameraScale(),wx=viewX+(x-canvas.clientWidth/2)/before,wy=viewY-(y-canvas.clientHeight/2)/before;zoom=Math.max(.5,Math.min(8,zoom*Math.exp(-e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1)*.0015)));const after=cameraScale();viewX=wx-(x-canvas.clientWidth/2)/after;viewY=wy+(y-canvas.clientHeight/2)/after;draw();},{passive:false});
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;pan={at:mouse(e),x:viewX,y:viewY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!pan)return;const [x,y]=mouse(e),scale=cameraScale();viewX=pan.x-(x-pan.at[0])/scale;viewY=pan.y+(y-pan.at[1])/scale;draw();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{pan=null;});
canvas.addEventListener('dblclick',()=>{zoom=1;viewX=P.width/2;viewY=P.height/2;draw();});
$('lineDensity').oninput=()=>{readouts();draw();};$('centers').onchange=draw;$('fields').onchange=draw;$('lines').onchange=draw;
function frame(t){if(disposed)return;const elapsed=last?Math.min(.04,(t-last)/1000):0,dt=elapsed*Number($('playback').value);last=t;if(running&&!document.hidden){const steps=Math.max(4,Math.ceil(dt/.003));for(let i=0;i<steps;i++){model.step(dt/steps);for(const p of model.particles()){p.trail.push([p.x,p.y]);if(p.trail.length>600)p.trail.shift();}}readouts();}draw();raf=requestAnimationFrame(frame);}
window.HiFyzikoFusionDispose=()=>{disposed=true;cancelAnimationFrame(raf);fieldView.dispose();};readouts();draw();raf=requestAnimationFrame(frame);
})();
