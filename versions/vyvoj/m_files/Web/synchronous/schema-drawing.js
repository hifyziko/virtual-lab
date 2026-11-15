(()=>{'use strict';
const colors={u:'#007e6c',ui:'#243b91',e:'#ad701b',i:'#346fc0',x:'#50898a',d:'#8661b1',leak:'#687cad',r:'#b35e44',mu:'#bd4c6c',load:'#ba497d',axis:'#6b7f7d',machineAxis:'#8b9697'};
const labelMotion=new Map(),labelMetrics=new Map(),labelHeights=new Map();
function measuredWidth(t,fallback){if(labelMetrics.has(t))return labelMetrics.get(t);if(typeof document!=="object"||!document.createElement||!document.body)return fallback;const span=document.createElement("span");span.style.cssText="position:fixed;left:-10000px;top:0;visibility:hidden;white-space:nowrap;font-size:12px";span.innerHTML=katex.renderToString(t,{throwOnError:false});document.body.appendChild(span);const width=Math.ceil(span.getBoundingClientRect().width);const glyphs=[...span.querySelectorAll(".katex-html, .katex-html *")].map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height);if(glyphs.length)labelHeights.set(t,Math.ceil(Math.max(...glyphs.map(r=>r.bottom))-Math.min(...glyphs.map(r=>r.top))));span.remove();if(width>0)labelMetrics.set(t,width);return width||fallback;}
const tex=t=>katex.renderToString(t,{throwOnError:false}),mag=a=>Math.hypot(...a);
function label(x,y,t,k,w=90,h=32){return `<foreignObject x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" class="diagram-label"><div xmlns="http://www.w3.org/1999/xhtml" class="math-label" style="color:${colors[k]||k}">${tex(t)}</div></foreignObject>`}
const line=(a,b,k,width=1.4,dash='')=>`<path d="M${a.join(' ')}L${b.join(' ')}" fill="none" stroke="${colors[k]||k}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
function defs(prefix){return '<defs>'+Object.entries(colors).map(([k,c])=>`<marker id="${prefix}-${k}" viewBox="0 0 8 6" refX="7.5" refY="3" markerWidth="8" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L8 3L0 6Z" fill="${c}"/></marker>`).join('')+'</defs>';}
function arrow(a,b,k,prefix,width=2.4,dash='',name=''){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.05)return '';
 const ux=(b[0]-a[0])/length,uy=(b[1]-a[1])/length,head=Math.min(prefix==='phasor'?5.5:8,length*.35),wing=head*.36;
 const p=[b[0]-ux*head-uy*wing,b[1]-uy*head+ux*wing],q=[b[0]-ux*head+uy*wing,b[1]-uy*head-ux*wing];
 return line(a,b,k,Math.min(width,2.2)*(prefix==='phasor'?.6:1),dash).replace('/>', ' stroke-linecap="round" data-vector="'+name+'" data-start="'+a.join(',')+'" data-end="'+b.join(',')+'"/>')+'<path d="M'+p.join(' ')+'L'+b.join(' ')+'L'+q.join(' ')+'" fill="none" stroke="'+(colors[k]||k)+'" stroke-width="'+(prefix==='phasor'?.9:1.5)+'" stroke-linecap="round" stroke-linejoin="round"/>';
}
function circuit(a,{step=4,loadMode=false,merged=false,twoReaction=false}={}){
 if(twoReaction&&a.type==='salient')return twoReactionCircuit(a,{step,loadMode,merged});
 if(merged)return combinedCircuit(a,{loadMode});
 const pre='circuit',salient=a.type==='salient';let h=defs(pre);

 h+='<path d="M65 85V129M65 181V225H620M620 85H565M505 85H470M398 85H312M240 85H178M130 85H65" fill="none" stroke="#6d8981" stroke-width="2.2"/>';
 h+='<circle cx="65" cy="155" r="26" fill="#fffaf0" stroke="'+colors.e+'" stroke-width="2.6"/><path d="M48 155q8 -18 17 0t17 0" fill="none" stroke="'+colors.e+'" stroke-width="2"/>'+label(8,155,'\\overline U_{ib}','e',80);
 if(salient){h+='<g opacity="'+(step>=2?1:.25)+'"><path d="M130 85L154 64L178 85L154 106Z" fill="#f3eaf9" stroke="'+colors.d+'" stroke-width="2.2"/>'+arrow([167,85],[142,85],'d',pre,1.5)+label(154,43,'\\text{Vyniklost}','d',120)+'</g>';}else h+=line([130,85],[178,85],'axis',2.2);
 const coil=(x,k,t)=>'<path d="M'+x+' 85c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0" fill="none" stroke="'+colors[k]+'" stroke-width="2.8"/>'+label(x+36,43,t,k,110);
 h+='<g opacity="'+(step>=2?1:.25)+'">'+coil(240,'x',salient?'jX_{aq}':'jX_a')+'</g>';
 h+='<g opacity="'+(step>=3?1:.25)+'">'+coil(398,'leak','jX_{a\\sigma}');
 h+=a.r>0?'<rect x="505" y="74" width="60" height="22" rx="3" fill="#faeae3" stroke="'+colors.r+'" stroke-width="2.2"/>'+label(535,43,'R_a','r',65):line([505,85],[565,85],'axis',2.2)+label(535,43,'R_a=0','axis',95);h+='</g>';
 for(const y of [85,225])h+='<circle cx="350" cy="'+y+'" r="5" fill="#ecf3f0" stroke="'+colors.ui+'" stroke-width="1.8"/><circle data-terminal="true" cx="620" cy="'+y+'" r="5" fill="white" stroke="'+colors.u+'" stroke-width="2"/>';
 h+=arrow([350,100],[350,210],'ui',pre,2.2)+label(376,160,'\\overline U_i','ui',65)+arrow([654,98],[654,213],'u',pre,2.4)+label(681,160,'\\overline U_a','u',60);
 h+=arrow([616,62],[570,62],'i',pre,2.4)+label(665,62,'\\overline I_a','i',65);
 if(loadMode)h+=arrow([570,20],[616,20],'load',pre,2.4)+label(665,20,'\\overline I_g','load',65);
 h+=(salient?label(170,268,'j(X_d-X_q)\\overline I_d','d',260):'<text x="170" y="268" class="diagram-caption" text-anchor="middle">Buzení a reakce kotvy</text>')+'<text x="445" y="268" class="diagram-caption" text-anchor="middle">Rozptyl a odpor</text>';
 return h;
}
// One anisotropic machine block: not two independent electric branches.
function twoReactionCircuit(a,{step,loadMode,merged}){
 const pre='two-reaction',end=merged?435:312;let h=defs(pre);
 h+='<path d="M65 85V129M65 181V225H620M130 85H65" fill="none" stroke="#6d8981" stroke-width="2.2"/>';
 h+='<circle cx="65" cy="155" r="26" fill="#fffaf0" stroke="'+colors.e+'" stroke-width="2.6"/><path d="M48 155q8 -18 17 0t17 0" fill="none" stroke="'+colors.e+'" stroke-width="2"/>'+label(8,155,'\\overline U_{ib}','e',80);
 const mid=(130+end)/2,coilStart=mid-36;h+='<g data-two-reaction-model="true" data-reactances="'+(merged?'combined':'separate')+'" opacity="'+(step>=2?1:.3)+'">'+line([130,85],[coilStart,85],'axis',2.2)+'<path data-armature-coil="true" d="M'+coilStart+' 85c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0" fill="none" stroke="'+colors.x+'" stroke-width="2.8"/>'+line([coilStart+72,85],[end,85],'axis',2.2)+label(mid,37,merged?'X_d,\\;X_q':'X_{ad},\\;X_{aq}','x',180)+label(mid,120,merged?'jX_d\\overline I_d':'jX_{ad}\\overline I_d','d',200)+label(mid,156,merged?'{}+jX_q\\overline I_q':'{}+jX_{aq}\\overline I_q','x',200)+'</g>';
 if(merged){h+=line([end,85],[620,85],'axis',2.2)+label(490,137,'X_d=X_{ad}+X_{a\\sigma}','axis',295)+label(490,182,'X_q=X_{aq}+X_{a\\sigma}','axis',295);}
 else{
  h+=line([end,85],[398,85],'axis',2.2)+line([470,85],[505,85],'axis',2.2)+line([565,85],[620,85],'axis',2.2);
  h+='<path d="M398 85c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0" fill="none" stroke="'+colors.leak+'" stroke-width="2.8"/>'+label(434,43,'jX_{a\\sigma}','leak',110);
  h+=a.r>0?'<rect x="505" y="74" width="60" height="22" rx="3" fill="#faeae3" stroke="'+colors.r+'" stroke-width="2.2"/>'+label(535,43,'R_a','r',65):line([505,85],[565,85],'axis',2.2)+label(535,43,'R_a=0','r',90);
  for(const y of [85,225])h+='<circle cx="350" cy="'+y+'" r="4" fill="white" stroke="'+colors.ui+'" stroke-width="1.5"/>';
  h+=arrow([350,100],[350,210],'ui',pre,2)+label(376,160,'\\overline U_i','ui',65);
 }
 for(const y of [85,225])h+='<circle data-terminal="true" cx="620" cy="'+y+'" r="5" fill="white" stroke="'+colors.u+'" stroke-width="2"/>';
 h+=arrow([654,98],[654,213],'u',pre,2.4)+label(681,160,'\\overline U_a','u',60)+arrow([616,62],[570,62],'i',pre,2.4)+label(665,62,'\\overline I_a','i',65);
 if(loadMode)h+=arrow([570,20],[616,20],'load',pre,2.4)+label(665,20,'\\overline I_g','load',65);
 h+='<text x="'+mid+'" y="268" class="diagram-caption" text-anchor="middle">Dvoureaktanční model d/q</text>';return h;
}
function combinedCircuit(a,{loadMode}){
 const pre='combined',salient=a.type==='salient';let h=defs(pre);
 h+='<path d="M65 85V129M65 181V225H620M620 85H565M505 85H400M328 85H178M130 85H65" fill="none" stroke="#6d8981" stroke-width="2.2"/>';
 h+='<circle cx="65" cy="155" r="26" fill="#fffaf0" stroke="'+colors.e+'" stroke-width="2.6"/><path d="M48 155q8 -18 17 0t17 0" fill="none" stroke="'+colors.e+'" stroke-width="2"/>'+label(8,155,'\\overline U_{ib}','e',80);
 if(salient)h+='<path d="M130 85L154 64L178 85L154 106Z" fill="#f3eaf9" stroke="'+colors.d+'" stroke-width="2.2"/>'+arrow([167,85],[142,85],'d',pre,1.5)+label(154,43,'\\text{Vyniklost}','d',120);else h+=line([130,85],[178,85],'axis',2.2);
 h+='<path d="M328 85c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0c0 -24 18 -24 18 0" fill="none" stroke="'+colors.x+'" stroke-width="3"/>'+label(364,43,salient?'jX_q':'jX_s','x',110)+label(360,155,salient?'X_q=X_{aq}+X_{a\\sigma}':'X_s=X_a+X_{a\\sigma}','x',300);
 h+=a.r>0?'<rect x="505" y="74" width="60" height="22" rx="3" fill="#faeae3" stroke="'+colors.r+'" stroke-width="2.2"/>'+label(535,43,'R_a','r',65):line([505,85],[565,85],'axis',2.2);
 for(const y of [85,225])h+='<circle data-terminal="true" cx="620" cy="'+y+'" r="5" fill="white" stroke="'+colors.u+'" stroke-width="2"/>';
 h+=arrow([654,98],[654,213],'u',pre,2.4)+label(654,160,a.xsigma===0?'\\overline U_a=\\overline U_i':'\\overline U_a','u',110)+arrow([616,62],[570,62],'i',pre,2.4)+label(665,62,'\\overline I_a','i',65);
 if(loadMode)h+=arrow([570,20],[616,20],'load',pre,2.4)+label(665,20,'\\overline I_g','load',65);
 h+=(salient?label(170,268,'j(X_d-X_q)\\overline I_d','d',260):'')+'<text x="445" y="268" class="diagram-caption" text-anchor="middle">Včetně rozptylu</text>';return h;
}
function phasor(a,{merged=false,twoReaction=false,step=4,showDQ=false,showMMF=true,loadMode=false,phi=0,fixedScales=null,labelSearchWidth=96,labelAngleSteps=180,labelFontSize=12,imaginaryAxisStart=35,rotorSize=76,rotorLetterSize=25,axisLabelsInside=false}={}){
 const g=SyncSchemaGeometry.build(a,{merged,twoReaction}),{v,chain}=g,pre='phasor',o=fixedScales?.origin||[300,365],span=Math.max(1,...chain.flatMap(t=>[mag(t.start),mag(t.end)]),mag(v.E),mag(v.Ui));
 const sv=fixedScales?.voltage??255/span,si=fixedScales?.current??145/Math.max(1,mag(v.I),mag(v.Ik),showMMF?mag(v.Imu):0);
 const pos=(z,s=sv)=>[o[0]-s*z[1],o[1]-s*z[0]],current=z=>pos(z,si),unit=(z,r)=>pos(z,r);
 let h=defs(pre),labels=[],segments=[],axisSegments=[];
 const pl=(point,t,k,w=80,offset=[15,-14])=>labels.push({anchor:point,x:point[0]+offset[0],y:point[1]+offset[1],t,k,w:Math.ceil(w*.53),h:24});
 const vec=(start,end,k,width=2.5,dash='',name='')=>{segments.push([start,end]);return arrow(start,end,k,pre,width,dash,name)};
 h+='<path d="M'+o[0]+' 32V540M'+imaginaryAxisStart+' '+o[1]+'H615" fill="none" stroke="#dee7e3" stroke-width=".75"/>'+arrow(o,[o[0],32],'axis',pre,1.1)+arrow(o,[imaginaryAxisStart,o[1]],'axis',pre,1.1);
 h+=label(o[0],15,'\\mathrm{Re}','axis',55)+label(imaginaryAxisStart+(axisLabelsInside?12:-20),o[1]-(axisLabelsInside?24:0),'\\mathrm{Im}','axis',40);
 // Rotor axes are time-phasor axes: d = -j q. The icon follows positive d.
 const machineAxisBoxes=[];
 let dist=215;const dv=[-v.d[1],-v.d[0]];for(let n=0;n<20;n++){const x=o[0]+dv[0]*dist,y=o[1]+dv[1]*dist;if(x>105&&x<535&&y>110&&y<450)break;dist-=8;}
 for(const [z,t] of [[v.q,'q'],[v.d,'d']]){
  const projection=z=>Math.max(...[v.E,v.Ui,v.U,...chain.flatMap(t=>[t.start,t.end])].map(w=>(w[0]*z[0]+w[1]*z[1])*sv),...[v.I,v.Ik,v.Imu,v.Ig].map(w=>(w[0]*z[0]+w[1]*z[1])*si));
  let radius=Math.max(t==='d'?dist+65:235,projection(z)+35);
  while(radius>80){const p=unit(z,radius+16);if(p[0]>24&&p[0]<616&&p[1]>24&&p[1]<536)break;radius-=2;}
  const end=unit(z,radius),caption=unit(z,radius+16);
  const axisSegment=[unit(z,-165),end];segments.push(axisSegment);axisSegments.push(axisSegment);
  const base=unit(z,radius-8),dx=(end[0]-base[0])/8,dy=(end[1]-base[1])/8;
  h+=(t==='d'?line(unit(z,-165),unit(z,dist-39),'machineAxis',.75,'4 5')+(radius-8>dist+39?line(unit(z,dist+39),base,'machineAxis',.75,'4 5'):''):line(unit(z,-165),base,'machineAxis',.75,'4 5'))+'<path d="M'+end.join(' ')+'L'+(base[0]-dy*3)+' '+(base[1]+dx*3)+'L'+(base[0]+dy*3)+' '+(base[1]-dx*3)+'Z" fill="'+colors.machineAxis+'" data-vector="machine-axis-'+t+'"/>';
  h+=label(caption[0],caption[1],t,'machineAxis',28);
  machineAxisBoxes.push({x:caption[0]-17,y:caption[1]-17,w:34,h:34});
 }
 const dc=unit(v.d,dist),rotorHalf=rotorSize/2;
 const state=SyncPrinciple.create();Object.assign(state,{type:a.type,rotor:Math.atan2(v.d[0],-v.d[1]),field:0,excitation:a.e>0,excitationLevel:a.e,damper:false});state.field=state.rotor;
 const art=SyncMachineArt(state,false,{axes:false,forces:false},'').replaceAll('lab-','phasor-art-').replaceAll('r="10" fill="#fffaf0"','r="17" fill="#ffffff"').replaceAll('font-size="12" font-weight="600" style="fill:#976318"','font-size="25" font-weight="800" dominant-baseline="middle" style="fill:#593600;paint-order:stroke;stroke:white;stroke-width:1.5"');
 const visibleArt=rotorLetterSize===25?art:art.replaceAll('font-size="25"','font-size="'+rotorLetterSize+'"').replaceAll('r="17" fill="#ffffff"','r="24" fill="#ffffff"').replaceAll('fill:#593600','fill:#302400');
 h=`<svg x="${dc[0]-rotorHalf}" y="${dc[1]-rotorHalf}" width="${rotorSize}" height="${rotorSize}" viewBox="125 112 310 310"><defs><clipPath id="phasor-rotor-crop"><circle cx="280" cy="267" r="149"/></clipPath></defs><g clip-path="url(#phasor-rotor-crop)">${visibleArt}</g></svg>`+h;

 const E=pos(v.E),Ui=pos(v.Ui),U=pos(v.U);
 h+=vec(o,E,'e',3,'','Uib');pl(E,a.e>1e-10?'\\overline U_{ib}':'\\overline U_{ib}=0','e',a.e>1e-10?75:100,a.e>1e-10?[-22,-18]:[-55,30]);
 if(step>=2){h+=vec(o,Ui,'ui',merged?1.7:3,merged?'5 4':'','Ui');pl(Ui,'\\overline U_i','ui',60,[-30,-2]);}
 if(step>=3||(merged&&step>=2)){h+=vec(o,U,'u',2.7,'','Ua');pl(U,'\\overline U_a','u',60,[26,14]);}
 for(let i=0;i<chain.length;i++){const t=chain[i];if(step<(i<2?2:3)||mag(t.term)<1e-10)continue;const start=pos(t.start),end=pos(t.end);h+=vec(start,end,t.color,2.5,'',t.name);const mid=[(start[0]+end[0])/2,(start[1]+end[1])/2],len=Math.hypot(end[0]-start[0],end[1]-start[1]);pl(mid,t.tex,t.color,i===0?105:95,[len>0?-(end[1]-start[1])/len*65:50,len>0?(end[0]-start[0])/len*65:-50]);labels[labels.length-1].segmentLength=len;labels[labels.length-1].priority=50+i;labels[labels.length-1].dropLabel=true;}
 const arc=(start,end,r,t,k,lengths=[Infinity,Infinity])=>{let delta=end-start;while(delta>Math.PI)delta-=2*Math.PI;while(delta<-Math.PI)delta+=2*Math.PI;if(Math.abs(delta)<.015)return '';end=start+delta;const p=an=>[o[0]-r*Math.sin(an),o[1]-r*Math.cos(an)],f=p(start),l=p(end),m=(start+end)/2;pl(p(end),t,k,42,[-18*Math.sin(end),-18*Math.cos(end)]);labels[labels.length-1].angleLabel=true;labels[labels.length-1].segmentLength=-1;for(let n=0;n<24;n++)segments.push([p(start+delta*n/24),p(start+delta*(n+1)/24)]);let extensions='';for(const [angle,length] of [[start,lengths[0]],[end,lengths[1]]]){if(length<r+5){const pointAt=radius=>[o[0]-radius*Math.sin(angle),o[1]-radius*Math.cos(angle)],a=pointAt(Math.max(0,length)),b=pointAt(r+5);extensions+=line(a,b,'#222',1,'4 4');segments.push([a,b]);}}const tip=p(end),before=p(end-Math.sign(delta)*.1),ux=(tip[0]-before[0])/Math.hypot(tip[0]-before[0],tip[1]-before[1]),uy=(tip[1]-before[1])/Math.hypot(tip[0]-before[0],tip[1]-before[1]);const head='<path d="M'+(tip[0]-ux*6-uy*2.5)+' '+(tip[1]-uy*6+ux*2.5)+'L'+tip.join(' ')+'L'+(tip[0]-ux*6+uy*2.5)+' '+(tip[1]-uy*6-ux*2.5)+'" fill="none" stroke="#222" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>';return extensions+head+ `<path d="M${f.join(' ')}A${r} ${r} 0 0 ${delta<0?1:0} ${l.join(' ')}" fill="none" stroke="#222" stroke-width="1" data-angle="${t}" data-radians="${delta}"/>`;};
 h+=arc(Math.atan2(v.U[1],v.U[0]),Math.atan2(v.q[1],v.q[0]),55,'\\beta','e',[mag(v.U)*sv,mag(v.E)*sv]);
 if(step>=2){const I=current(v.I);h+=vec(o,I,'i',2.9,'','Ia');if(mag(v.I)>1e-8)pl(I,'\\overline I_a','i',60,[-18,18]);
 if(showMMF){const mu=current(v.Imu);h+=vec(I,mu,'e',2.2,'','Ik-translated')+vec(o,mu,'mu',2.5,'','Imu');if(mag(v.Ik)>1e-8)pl(mu,'\\overline I_k','e',60,[13,-6]);if(mag(v.Imu)>1e-8)pl(mu,'\\overline I_\\mu','mu',65,[6,10]);}
 if(showDQ){for(const [z,t,k]of [[v.Id,'\\overline I_d','d'],[v.Iq,'\\overline I_q','x']]){const end=current(z);h+=vec(o,end,k,1.6,'4 4',t)+line(end,I,k,1,'3 4');if(mag(z)>.03)pl(end,t,k,60,[-20,-15]);}}
 if(loadMode||a.P< -1e-8){const Ig=current(v.Ig);h+=vec(o,Ig,'load',2.7,'','Ig');pl(Ig,'\\overline I_g','load',60,[20,12]);if(mag(v.Ig)>1e-8)h+=arc(Math.atan2(v.U[1],v.U[0]),Math.atan2(v.Ig[1],v.Ig[0]),85,'\\varphi_z','load',[mag(v.U)*sv,mag(v.Ig)*si]);}else if(a.P>1e-8&&mag(v.I)>1e-8){h+=arc(Math.atan2(v.U[1],v.U[0]),Math.atan2(v.I[1],v.I[0]),85,'\\varphi','i',[mag(v.U)*sv,mag(v.I)*si]);}}
 // Place mathematical labels around their vectors, reserving the axis titles.
 const boxes=[{x:dc[0]-rotorHalf-4,y:dc[1]-rotorHalf-4,w:rotorSize+8,h:rotorSize+8},...machineAxisBoxes,{x:o[0]-31,y:0,w:62,h:32},{x:imaginaryAxisStart+(axisLabelsInside?-8:-40),y:o[1]-(axisLabelsInside?40:16),w:40,h:32}];

 // Clip a line segment against a padded label rectangle (Liang–Barsky).
 const hits=(a,b,r)=>{let lo=0,hi=1;const dx=b[0]-a[0],dy=b[1]-a[1],ps=[-dx,dx,-dy,dy],qs=[a[0]-r.x,r.x+r.w-a[0],a[1]-r.y,r.y+r.h-a[1]];for(let i=0;i<4;i++){if(Math.abs(ps[i])<1e-9){if(qs[i]<0)return false;}else{const t=qs[i]/ps[i];if(ps[i]<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}}return true;};
 const coordinateAxes=[[[o[0],32],[o[0],540]],[[imaginaryAxisStart,o[1]],[615,o[1]]]];segments.push(...coordinateAxes);axisSegments.push(...coordinateAxes);

 // Joint assignment: reserve actual text boxes and choose nearby positions for ALL labels.
 const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 const crossing=(a,b,c,d)=>{const t=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);return t(a,b,c)*t(a,b,d)<0&&t(c,d,a)*t(c,d,b)<0;};
 const distanceTo=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
 const shallow=(a,b,c,d)=>{const u=[b[0]-a[0],b[1]-a[1]],v=[d[0]-c[0],d[1]-c[1]],den=Math.hypot(...u)*Math.hypot(...v);return den>0&&Math.abs(u[0]*v[0]+u[1]*v[1])/den>Math.cos(25*Math.PI/180);};
 const ambiguous=leader=>segments.some(([a,b])=>(crossing(...leader,a,b)||Math.min(distanceTo(leader[0],a,b),distanceTo(leader[1],a,b),distanceTo(a,...leader),distanceTo(b,...leader))<10)&&shallow(...leader,a,b));
 const inTriangle=p=>{const turn=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),vertices=[o,pos(v.E),pos(v.Ui)],area=turn(...vertices);if(Math.abs(area)<30)return true;return vertices.every((a,i)=>turn(a,vertices[(i+1)%3],p)*Math.sign(area)>=0);};
 for(const l of labels){l.w=measuredWidth(l.t,l.w)*labelFontSize/12;l.h=(labelHeights.get(l.t)||22)*labelFontSize/12;}
 const active=labels.filter(l=>!(l.dropLabel&&window.syncLabelsMoving));
 let textScale=1;
 const options=(l,expanded,allowLine=false)=>{
  const primary=!l.dropLabel&&!l.angleLabel,own=primary?segments.filter(([a,b])=>!axisSegments.some(ax=>ax[0]===a&&ax[1]===b)&&Math.hypot(b[0]-l.anchor[0],b[1]-l.anchor[1])<.01):[],shaft=own.find(([start])=>l.t.endsWith('I_k')?Math.hypot(start[0]-o[0],start[1]-o[1])>.01:Math.hypot(start[0]-o[0],start[1]-o[1])<.01)||own[0],direction=shaft?Math.atan2(shaft[1][1]-shaft[0][1],shaft[1][0]-shaft[0][0]):null;
  const result=[],radii=l.dropLabel?[14,18,22,26,30,36,48,60,76,92]:l.angleLabel?(expanded?[13,16,20,24,28,34,42]:[13]):[13];
  if(labelFontSize>12&&!l.dropLabel)radii.push(20,28,36);
  for(const baseRadius of radii)for(let n=direction===null?0:-1;n<labelAngleSteps;n++){
   const radius=baseRadius*labelFontSize/12,angle=n===-1?direction:n*2*Math.PI/labelAngleSteps,x=l.anchor[0]+radius*Math.cos(angle),y=l.anchor[1]+radius*Math.sin(angle),box={x:x-l.w*textScale/2-1,y:y-l.h*textScale/2-2,w:l.w*textScale+2,h:l.h*textScale+4};
   if(box.x<5||box.x+box.w>635||box.y<42||box.y+box.h>550)continue;
   if((loadMode||a.P<0)&&l.dropLabel&&l.k==='x'&&y<l.anchor[1]+8)continue;
   const lineCollisions=segments.filter(segment=>hits(...segment,box)).length;
   if(boxes.some(b=>overlap(box,b))||(!allowLine&&lineCollisions))continue;
   const endpoint=[Math.max(box.x,Math.min(box.x+box.w,l.anchor[0])),Math.max(box.y,Math.min(box.y+box.h,l.anchor[1]))];
   const leader=l.dropLabel&&Math.hypot(endpoint[0]-l.anchor[0],endpoint[1]-l.anchor[1])>28?[l.anchor,endpoint]:null;
   if(leader&&(boxes.some(b=>hits(...leader,b))||ambiguous(leader)))continue;
   result.push({x,y,box,leader,label:l,shaftDirection:direction,fontScale:textScale,cost:lineCollisions*100000+radius*10+(primary&&direction!==null?((l.k==='mu'||l.t.endsWith('I_k'))?2*distanceTo([x,y],shaft[0],shaft[1])+20*Math.pow(Math.atan2(Math.sin(angle-direction),Math.cos(angle-direction)),2):40*Math.pow(Math.atan2(Math.sin(angle-direction),Math.cos(angle-direction)),2)):0)+Math.hypot(x-l.x,y-l.y)*.05});
  }
  return result.sort((a,b)=>a.cost-b.cost);
 };
 const sharedTipOK=(choice,p)=>{
  if(choice.shaftDirection==null||p.shaftDirection==null||choice.label.dropLabel||p.label.dropLabel||choice.label.angleLabel||p.label.angleLabel)return true;
  if(Math.hypot(choice.label.anchor[0]-p.label.anchor[0],choice.label.anchor[1]-p.label.anchor[1])>1)return true;
  const dx=Math.cos(p.shaftDirection)-Math.cos(choice.shaftDirection),dy=Math.sin(p.shaftDirection)-Math.sin(choice.shaftDirection);
  const px=p.center?p.center[0]:p.x,py=p.center?p.center[1]:p.y;
  return (choice.x-px)*dx+(choice.y-py)*dy>=-.01;
 };
 let solution=null;
 for(const scale of [1,.9,.8,.7]){textScale=scale;const expanded=scale<1;
  const jobs=active.map(l=>({l,choices:options(l,expanded),primary:!l.dropLabel&&!l.angleLabel})).sort((a,b)=>Number(b.primary)-Number(a.primary)||a.choices.length-b.choices.length);
  let beam=[{items:[],cost:0,primaryCost:0}];
  for(const job of jobs){const next=[];
   for(const state of beam)for(const choice of job.choices){
    if(state.items.some(p=>!sharedTipOK(choice,p)))continue;
    if(state.items.some(p=>overlap(choice.box,p.box)||(p.leader&&hits(...p.leader,choice.box))||(choice.leader&&hits(...choice.leader,p.box))||(choice.leader&&p.leader&&crossing(...choice.leader,...p.leader))))continue;
    next.push({items:[...state.items,choice],cost:state.cost+choice.cost,primaryCost:state.primaryCost+(job.primary?choice.cost:0)});
   }
   next.sort((a,b)=>a.primaryCost-b.primaryCost||a.cost-b.cost);if(!next.length&&!job.primary)continue;beam=next.slice(0,Math.max(1,labelSearchWidth));if(!beam.length)break;
  }
  if(beam.length){solution=beam[0];break;}
 }
 const placements=[];
 if(solution)for(const item of solution.items){const l=item.label;placements.push({...item.box,label:l,shaftDirection:item.shaftDirection,center:[item.x,item.y],from:[item.x,item.y]});h+=label(item.x,item.y,l.t,l.k,l.w*item.fontScale).replace('style="color:','style="font-size:'+(labelFontSize*item.fontScale)+'px;color:');}
 else {
  // No unchecked placement: text may only occupy a verified empty box.
  textScale=.7;
  for(const l of [...active].sort((a,b)=>Number(a.dropLabel||a.angleLabel)-Number(b.dropLabel||b.angleLabel))){const choice=options(l,true).find(p=>!placements.some(b=>overlap(p.box,b)||!sharedTipOK(p,b)));if(!choice)continue;placements.push({...choice.box,label:l,shaftDirection:choice.shaftDirection,center:[choice.x,choice.y],from:[choice.x,choice.y]});h+=label(choice.x,choice.y,l.t,l.k,l.w*.7).replace('style="color:','style="font-size:'+(labelFontSize*.7)+'px;color:');}
 }
 // Secondary labels cannot invalidate a complete current/voltage assignment.
 for(const l of active){if(placements.some(p=>p.label===l))continue;textScale=.7;
  let choice=options(l,true).find(p=>!placements.some(b=>overlap(p.box,b)||!sharedTipOK(p,b)));
  if(!choice&&l.dropLabel){
   for(let y=58;y<535&&!choice;y+=12)for(let x=l.w/2+8;x<632-l.w/2;x+=12){const box={x:x-l.w*.7/2-1,y:y-l.h*.7/2-2,w:l.w*.7+2,h:l.h*.7+4};if(boxes.some(b=>overlap(box,b))||placements.some(b=>overlap(box,b))||segments.some(seg=>hits(...seg,box)))continue;choice={x,y,box};break;}
  }
  if(choice){placements.push({...choice.box,label:l,shaftDirection:choice.shaftDirection,center:[choice.x,choice.y],from:[choice.x,choice.y]});h+=label(choice.x,choice.y,l.t,l.k,l.w*.7).replace('style="color:','style="font-size:'+(labelFontSize*.7)+'px;color:');}
 }
 // Primary quantities must never disappear, even in a degenerate shared-tip geometry.
 for(const l of active){if(l.dropLabel||placements.some(p=>p.label===l))continue;textScale=.7;
  const safe=options(l,true),emergency=options(l,true,true);
  const all=[...safe,...emergency];
  let chosen=all.find(p=>!placements.some(b=>overlap(p.box,b)));
  if(!chosen){
   const ranked=[];for(let n=0;n<180;n++){const angle=n*Math.PI/90,x=l.anchor[0]+13*Math.cos(angle),y=l.anchor[1]+13*Math.sin(angle),box={x:x-l.w*.7/2-1,y:y-l.h*.7/2-2,w:l.w*.7+2,h:l.h*.7+4};const score=placements.filter(b=>overlap(box,b)).length*10000+segments.filter(seg=>hits(...seg,box)).length*100+Math.hypot(x-l.x,y-l.y);ranked.push({x,y,box,score});}ranked.sort((a,b)=>a.score-b.score);chosen=ranked[0];
  }
  placements.push({...chosen.box,label:l,center:[chosen.x,chosen.y],from:[chosen.x,chosen.y]});h+=label(chosen.x,chosen.y,l.t,l.k,l.w*.7).replace('style="color:','style="font-size:'+(labelFontSize*.7)+'px;color:');
 }
 // Leader lines end at label borders and never run through another label.
 const leaderSegments=[];
 const cross=(a,b,c,d)=>{const turn=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);return turn(a,b,c)*turn(a,b,d)<0&&turn(c,d,a)*turn(c,d,b)<0;};
 let leaders='';for(const item of placements){if(!item.label.dropLabel)continue;const a=item.label.anchor,r=item,b=[Math.max(r.x,Math.min(r.x+r.w,a[0])),Math.max(r.y,Math.min(r.y+r.h,a[1]))];
  if(Math.hypot(a[0]-b[0],a[1]-b[1])<(item.label.dropLabel?28:item.label.angleLabel?8:42))continue;
  if(placements.some(other=>other!==item&&hits(a,b,other)))continue;
  if(hits(a,b,{x:dc[0]-rotorHalf-1,y:dc[1]-rotorHalf-1,w:rotorSize+2,h:rotorSize+2}))continue;
  if(ambiguous([a,b])||leaderSegments.some(([c,d])=>cross(a,b,c,d)))continue;
  leaderSegments.push([a,b]);
  const old=[b[0]+item.from[0]-item.center[0],b[1]+item.from[1]-item.center[1]];
  let leader=line(a,b,item.label.k,.75,'2 3').replace('/>',' opacity=".5" stroke-linecap="round"/>');
  if(Math.hypot(old[0]-b[0],old[1]-b[1])>1)leader=leader.replace('/>','><animate attributeName="d" from="M'+a.join(' ')+'L'+old.join(' ')+'" to="M'+a.join(' ')+'L'+b.join(' ')+'" dur=".22s"/></path>');
  leaders+=leader;
 }
 h=leaders+h;
 h+='<circle cx="'+o[0]+'" cy="'+o[1]+'" r="2" fill="#748780"/>';
 return {html:h,geometry:g,voltageScale:sv,currentScale:si,labelBoxes:placements,segments,layoutSolved:!!solution,missingPrimary:active.filter(l=>!l.dropLabel&&!l.angleLabel&&!placements.some(p=>p.label===l)).length,layoutOptions:solution?[]:active.map(l=>({text:l.t,count:options(l,true).length}))};
}
window.SyncSchemaDrawing={circuit,phasor};
})();
