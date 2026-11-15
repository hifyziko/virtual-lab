/* Circuit scenery built around the SAME conductor, charges, field and instrument
 * primitives as em-core/motional-rod.js. */
(function(root){'use strict';
 const xOf=x=>240+280*x;
 root.EnergyRodScene=function(s,{drag,arrow,label,num}){
  const badge=(x,y,w,t,c)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="34" rx="7" fill="#fff" fill-opacity=".96"/>'+label(x,y,w,t,c);
  const art=root.MotionalRodArt,d=root.EnergyExperiments.electrical(s),x=xOf(s.x),fieldState=root.EnergyCircuitField.prepare(s),point=[0,0,0],vector=[0,0,0];
  let h=art.defs()+'<defs><linearGradient id="rail-metal" x2="0" y2="1"><stop stop-color="#eef3f1"/><stop offset=".5" stop-color="#a7bbb5"/><stop offset="1" stop-color="#e9efec"/></linearGradient></defs>';
  for(let px=240;px<810;px+=30)for(let py=140;py<350;py+=38){point[0]=(px-240)/280;point[1]=(.5-(py-116)/238)*root.EnergyExperiments.P.l;root.EnergyCircuitField.displayAt(fieldState,point,vector);h+=art.fieldMark(px,py,-vector[2]/1.5);}
  h+='<path d="M130 178V116H810M130 276V354H810" fill="none" stroke="#819894" stroke-width="7" stroke-linecap="round"/><path d="M230 116H810M230 354H810" stroke="#e4eeea" stroke-width="3" stroke-linecap="round"/>';
  // Load resistor, with a restrained warm indication of actual dissipated power.
  h+='<rect x="92" y="172" width="76" height="110" rx="14" fill="#fffaf0" stroke="#e5d7be"/><rect x="114" y="184" width="32" height="86" rx="3" fill="#fffaf0" stroke="#a97435" stroke-width="2"/><rect x="116" y="186" width="28" height="82" rx="2" fill="#df9a43" opacity="'+(.12+.5*Math.tanh(d.power/2))+'"/><path d="M130 178V184M130 270V276" stroke="#819894" stroke-width="4"/>';
  h+='<g role="button" aria-label="'+(s.closed?'Otevřít obvod':'Zavřít obvod')+'" style="cursor:pointer"><title>Kliknutím '+(s.closed?'rozepnout':'sepnout')+' obvod</title><path d="M176 116H222" stroke="#fff" stroke-width="12"/><path d="M176 116L222 '+(s.closed?116:88)+'" stroke="#36505b" stroke-width="3.5" stroke-linecap="round"/><circle cx="176" cy="116" r="4" fill="#fff" stroke="#36505b" stroke-width="2"/><circle cx="222" cy="116" r="4" fill="#fff" stroke="#36505b" stroke-width="2"/><rect x="158" y="72" width="82" height="66" fill="transparent"/></g>';
  h+=label(15,64,230,String.raw`\text{Zátěž}`, '#a97435')+label(15,360,230,'R='+num(s.R,2)+String.raw`\,\Omega`,'#a97435');
  // Existing moving-voltage artwork, including its exact ion/electron geometry.
  h+=art.conductor(x)+'<g>'+art.charges(x,18*Math.tanh(d.e/1.5))+'</g>';
  for(const y of [116,354])h+='<circle cx="'+x+'" cy="'+y+'" r="6" fill="#fffaf0" stroke="#a58a61" stroke-width="1.5"/>';
  if(Math.abs(d.e)>.005){const upper=d.e>0?'+':'-';h+=label(x-50,122,40,upper,d.e>0?'#b87420':'#316fcb')+label(x-50,309,40,d.e>0?'-':'+',d.e>0?'#316fcb':'#b87420');}
  h+=arrow(x,59,100*Math.tanh(s.v),0,'#2a6ab3')+label(x-45,19,90,'v','#2a6ab3');
  h+=arrow(x,395,125*Math.tanh(d.F),0,'#007c69')+badge(Math.max(150,x-65),403,130,String.raw`F_\mathrm{em}`,'#007c69');

  h+=badge(380,76,270,'B_0='+num(s.B)+String.raw`\,\mathrm T`,'#298d94');
  // The original voltmeter face; new mathematical labels use the KaTeX overlay.
  h+='<path d="M810 116H852V183M810 354H852V287" fill="none" stroke="#819894" stroke-width="1.7" stroke-dasharray="5 4"/><g transform="translate(852 235) scale(.8) translate(0 -405)"><circle cy="405" r="53" fill="white" stroke="#36505b" stroke-width="2"/>'+art.meter(0,d.e,3,{labels:false})+'</g>'+label(828,245,48,String.raw`\mathrm V`,'#36505b');
  if(drag){
   const hand=xOf(drag.target),dx=hand-x;
   h+='<path d="M'+x+' 235H'+hand+'" stroke="#c58d42" stroke-width="3" stroke-dasharray="5 4"/><circle cx="'+hand+'" cy="235" r="15" fill="#fffaf0" stroke="#b9781c" stroke-width="2"/><path d="M'+(hand-4)+' 229v12m4-14v14m4-12v12" stroke="#b9781c" stroke-width="1.5" stroke-linecap="round"/>';
   h+=arrow(x,450,110*Math.tanh(s.handForce/2),0,'#b9781c')+badge(Math.max(150,x-70),456,140,String.raw`F_\mathrm{ruka}`,'#b9781c');
  }
  // Keep the current indicator above field/hand artwork, with a readable tip for either sign.
  const currentLength=Math.abs(d.I)>1e-6?Math.sign(d.I)*(14+56*Math.tanh(Math.abs(d.I))):0;
  h+='<g data-current-arrow="'+Math.sign(d.I)+'">'+arrow(x+42,235,0,-currentLength,'#cf8137')+'</g>'+badge((x>615?x-195:x+56),166,150,'i='+num(d.I)+String.raw`\,\mathrm A`,'#a97435');
  return h;
 };
 root.EnergyRodScene.xOf=xOf;
})(typeof window==='undefined'?globalThis:window);
