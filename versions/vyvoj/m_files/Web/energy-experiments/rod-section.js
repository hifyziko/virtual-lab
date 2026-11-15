/* Side projection of the SAME moving rod. Only radial distances are magnified;
 * its screen x coordinate is identical to the upper projection. */
(function(root){'use strict';
 const scale=67500,cy=665;
 const xOf=s=>root.EnergyRodScene.xOf(s.x);
 // A centred arrowhead only: no shaft can project through its triangle.
 function triangle(x,y,dx,dy,color,size=10){const n=Math.hypot(dx,dy);if(n<1e-12)return '';const u=dx/n,v=dy/n;return '<path data-field-tip="true" d="M'+(x+u*size*.6)+' '+(y+v*size*.6)+'L'+(x-u*size*.4-v*size*.36)+' '+(y-v*size*.4+u*size*.36)+'L'+(x-u*size*.4+v*size*.36)+' '+(y-v*size*.4-u*size*.36)+'Z" fill="'+color+'"/>';}
 function flow(s,arrow){
  const cx=xOf(s),field=root.EnergyCircuitField,f=field.prepare(s),p=[0,0,0],b=[0,0,0];
  const direction=(px,py)=>{
   p[0]=s.x+(px-cx)/scale;p[2]=-(py-cy)/scale;field.displayAt(f,p,b);
   const n=Math.hypot(b[0],b[2]);return n>1e-12?[b[0]/n,-b[2]/n]:[0,0];
  };
  let h='';
  for(let seed=230;seed<=806;seed+=32){
   let x=seed,y=cy+(s.B>=0?-110:110),path=[[x,y]];
   for(let i=0;i<190;i++){
    const a=direction(x,y),b=direction(x+a[0],y+a[1]);if(Math.hypot(...b)<.5)break;
    x+=2*b[0];y+=2*b[1];if(x<210||x>818||Math.abs(y-cy)>112)break;path.push([x,y]);
   }
   if(path.length<3)continue;
   h+='<path d="M'+path.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join('L')+'" fill="none" stroke="#298d94" stroke-width="1.35" opacity=".8"/>';
   let j=0;for(let k=1;k<path.length-1;k++)if(Math.abs(path[k][1]-(cy-56))<Math.abs(path[j][1]-(cy-56)))j=k;
   const a=path[j],b=path[j+1];h+=triangle(a[0],a[1],b[0]-a[0],b[1]-a[1],'#298d94',11);
  }return h;
 }
 function guides(s){const x=xOf(s);return '<path d="M'+(x-12)+' 354L'+(x-27)+' '+cy+'M'+(x+12)+' 354L'+(x+27)+' '+cy+'" fill="none" stroke="#819894" stroke-width="1" stroke-dasharray="5 6" opacity=".35"/>';}
 function pictogram(s,label){
  const I=root.EnergyExperiments.electrical(s).I,cx=105,y=665,teal='#298d94',orange='#cf8137';
  let h='<g aria-label="Složky pole: homogenní vnější pole a kruhové vlastní pole vodiče, schematicky"><rect x="4" y="507" width="190" height="276" rx="12" fill="#f8faf9" stroke="#dce6e2"/>'+label(5,515,190,String.raw`\text{Složky pole}`)+label(5,552,190,String.raw`\mathbf B_0+\mathbf B_i`);
  if(Math.abs(s.B)>1e-6){h+='<g opacity="'+(.25+.65*Math.min(1,Math.abs(s.B)/1.5))+'">';for(const x of [40,105,170])h+='<path d="M'+x+' 587V740" stroke="'+teal+'" stroke-width="1.4"/>'+triangle(x,609,0,s.B,teal,11);h+='</g>';}
  if(Math.abs(I)>1e-6){h+='<g opacity="'+(.3+.65*Math.tanh(Math.abs(I)/2))+'">';for(const r of [29,46,63]){h+='<circle cx="'+cx+'" cy="'+y+'" r="'+r+'" fill="none" stroke="'+orange+'" stroke-width="1.5"/>';const a=-Math.PI/4,sign=Math.sign(I);h+=triangle(cx+r*Math.cos(a),y+r*Math.sin(a),-sign*Math.sin(a),sign*Math.cos(a),orange,10);}h+='</g>';}
  h+='<circle cx="'+cx+'" cy="'+y+'" r="12" fill="#fffaf0" stroke="#a58a61" stroke-width="1.5"/>';
  if(I>1e-6)h+='<path d="M100 660l10 10m-10 0 10-10" stroke="'+orange+'" stroke-width="2"/>';else if(I< -1e-6)h+='<circle cx="105" cy="665" r="3.5" fill="'+orange+'"/>';
  return h+label(5,749,190,String.raw`\text{schematicky}`)+'</g><g aria-label="Složením polí vlevo vzniká výsledné pole vpravo"><rect x="177" y="645" width="49" height="38" rx="6" fill="#fff"/>'+label(176,645,54,String.raw`\Longrightarrow`,'#617d77')+'</g>';
 }
 function section(s,{label,arrow,num}){
  const field=root.EnergyCircuitField,d=root.EnergyExperiments.electrical(s),cx=xOf(s),I=d.I;
  const badge=(x,y,w,t,c)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="36" rx="7" fill="#fff" fill-opacity=".97"/>'+label(x,y,w,t,c);
  let h=label(210,515,608,s.closed?String.raw`\text{Výsledné pole: uzavřeno}`:String.raw`\text{Výsledné pole: rozpojeno}`);
  h+=pictogram(s,label)+flow(s,arrow);
  h+='<circle cx="'+cx+'" cy="'+cy+'" r="27" fill="#fffaf0" stroke="#a58a61" stroke-width="1.8"/>';
  const a=markerSize(I);
  if(I>1e-6)h+='<path data-current-marker="in" d="M'+(cx-a)+' '+(cy-a)+'l'+(2*a)+' '+(2*a)+'m'+(-2*a)+' 0 '+(2*a)+' '+(-2*a)+'" stroke="#cf8137" stroke-width="'+Math.max(.8,a*.22)+'"/>';
  else if(I< -1e-6)h+='<circle data-current-marker="out" cx="'+cx+'" cy="'+cy+'" r="'+(a*.75)+'" fill="#cf8137" stroke="#fffaf0" stroke-width=".7"/>';
  const labelX=cx>615?cx-195:cx+55;
  h+=badge(labelX,644,150,'i='+num(I)+String.raw`\,\mathrm A`,'#a97435');
  const own=field.sample(s,[s.x+field.radius,0,0]).own,BI=Math.hypot(...own)*1e6;
  h+=badge(210,790,305,'u_i='+num(d.e)+String.raw`\,\mathrm V`,'#2a6ab3');
  h+=badge(515,790,303,'B_i(a)='+num(BI,0)+String.raw`\,\mathrm{\mu T}`,'#a97435');
  return h;
 }
 function markerSize(i){return i===0?0:2.8+13.2*Math.sqrt(Math.abs(i)/(4+Math.abs(i)));}
 root.EnergyRodSection=section;
 root.EnergyRodSection.markerSize=markerSize;
 root.EnergyRodSection.guides=guides;
 root.EnergyRodSection.projectionX=xOf;
})(typeof window==='undefined'?globalThis:window);
