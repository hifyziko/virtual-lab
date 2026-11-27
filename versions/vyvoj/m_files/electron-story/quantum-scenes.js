function drawOrbital({p,P,S,T,cache,read,plot,scale,fmt}){
  const v=cache.volume??=OrbitalVolume.make(S.state,S.mix,S.quality),{cells,extent,h,n}=v;
  const plane=OrbitalVolume.planes[S.plane],cutOffset=S.cut*extent;
  const time=T*.1,delta=P.energy(v.b[0])-P.energy(v.s[0]),phi=S.phase*Math.PI/180-delta*time/.65821196;
  const {cdf,density,angles}=cache.arrays??={cdf:new Float64Array(cells.length),density:new Float64Array(cells.length),angles:new Float64Array(cells.length)};
  const c=Math.cos(phi),s=Math.sin(phi),phaseNeeded=S.view===4||S.view===3,shapePhase=S.mix?phi:0;
  if(cache.orbitalField?.phase!==shapePhase||(phaseNeeded&&!cache.orbitalField.angles)){
    let sum=0,peak=0;
    for(let i=0;i<cells.length;i++){
      const a=cells[i],re=a.ar+a.br*c-a.bi*s,im=a.ai+a.bi*c+a.br*s;
      const w=re*re+im*im;density[i]=w;sum+=w;cdf[i]=sum;peak=Math.max(peak,w);
      if(phaseNeeded)angles[i]=Math.atan2(im,re);
    }
    cache.orbitalField={phase:shapePhase,angles:phaseNeeded,sum,peak};
  }
  const {sum,peak}=cache.orbitalField,pos=k=>cells[k].xyz.map(x=>x*.57/extent);
  const hue=angle=>'hsl('+(Math.round((angle*180/Math.PI+570)/15)*15%360)+' 64% 43%)';
  const globalPhase=-P.energy(v.s[0])*time/.65821196;
  const staticReal=!S.mix&&(v.s[2]===0||v.s[3]);
  if(S.view===0||S.view===1||S.view===4||S.view===5){
    const cloudSize=S.orbitalAdvanced?.57:.76;
    if(cache.orbitalSamples?.phase!==shapePhase||cache.orbitalSamples.view!==S.view||cache.orbitalSamples.size!==cloudSize){
      const rng=P.random(1926),points=[],indices=[];
      for(let i=0;i<(S.view===1?4800:2600);i++){
        const k=OrbitalVolume.sample(cdf,rng),xyz=cells[k].xyz.map(x=>(x+(rng()-.5)*h)*cloudSize/extent);
        if(S.view===5)xyz[0]+=.35;
        points.push(xyz);indices.push(k);
      }
      cache.orbitalSamples={phase:shapePhase,view:S.view,size:cloudSize,points,indices};
    }
    const {points,indices}=cache.orbitalSamples;
    if(S.view===4)p.marks(points.map((xyz,i)=>{const [x,y]=p.proj(xyz);return [x,y,hue(angles[indices[i]]+(staticReal?0:globalPhase))];}),1.65,.59,true);
    else p.depthCloud(points,{soft:S.view===1||S.view===5});
    if(S.view===5){const bohr=v.s[0]**2;
      for(const r of [.5,1,1.5])p.ring([.35,0,0],.57*r/extent,'#eab5688c','xz');
      p.ring([-.45,0,0],.57*bohr/extent,'#eab568','xy');p.dot([-.45,0,0],.012,'#dba17f',true);
      p.label([-.63,-.27,0],'Bohrův stav');p.label([.16,-.27,0],'Kvantová měření');}
  }else{
    const pixels=[];
    for(let i=0;i<cells.length;i++){
      const w=density[i]/peak;
      if(S.view===3){if(Math.abs(cells[i].xyz[plane.normal]-cutOffset)>h*.5||w<.0001)continue;}
      else if(S.view===2){if(w<S.level)continue;
        if([1,-1,n,-n,n*n,-n*n].every(d=>density[i+d]>=S.level*peak))continue;
      }else if(w<.003)continue;
      const [x,y,z]=p.proj(pos(i));pixels.push([x,y,z,w,i]);
    }
    const size=Math.max(1,p.scale*.57*h/extent*1.2);
    pixels.sort((a,b)=>a[2]-b[2]);
    const points=pixels.map(([x,y,z,w,i])=>[x,y,S.view===3?hue(angles[i]):'hsl(205 53% '+Math.max(28,Math.min(77,Math.round((49+44*z)/7)*7))+'%)']);
    p.marks(points,size,S.view===3?.69:.88,true);
  }
  if(S.view!==5&&(S.view!==3||Math.abs(cutOffset)<=h*.5)){
    p.glow([0,0,0],.072,electronInk.nucleus);p.dot([0,0,0],.019,electronInk.nucleus,true);
  }
  if(S.view===3&&S.orbitalAdvanced){
    const center=(n-1)/2,grid=[center,center,center],coordinates=['0','0','0'];
    grid[plane.normal]=Math.round((1+S.cut)*center);coordinates[plane.normal]=plane.coordinate;
    const cell=cells[(grid[0]*n+grid[1])*n+grid[2]];
    const re=cell.ar+cell.br*c-cell.bi*s,im=cell.ai+cell.br*s+cell.bi*c;
    read('w('+coordinates.join(',')+')a_\\mu^3',re*re+im*im);
    read('\\operatorname{Re}(\\Psi a_\\mu^{3/2})',re*Math.cos(globalPhase)-im*Math.sin(globalPhase));
  }
  if(S.orbitalAdvanced){
    read('t',time,'fs');read('a_\\mu',P.a*1e12,'pm');read('P_{\\rm okno}',sum*h**3,'',4);
  }
  if(S.view===3)scale('\\text{Řez }\\text{'+plane.name+'}\\quad '+plane.coordinate+'_{\\text{řezu}}='+fmt(cutOffset)+'\\,a_\\mu');
  else if(S.orbitalAdvanced)scale(S.view===4?'\\arg\\Psi:\\;0\\;\\text{modrá},\\;\\pi\\;\\text{oranžová}':'R_{\\rm okna}='+fmt(extent)+'\\,a_\\mu');
  else scale('\\text{'+['Nejhustší u jádra','Kulový uzel uvnitř oblaku','Uzlová rovina mezi laloky'][S.state]+'}');
  const pts=Array.from({length:161},(_,i)=>{const r=i*extent/160,A=P.radial(v.s[0],v.s[1],r),B=P.radial(v.b[0],v.b[1],r);
    const sameAngular=v.s[1]===v.b[1]&&v.s[2]===v.b[2];
    return [r,r*r*((1-S.mix)*A*A+S.mix*B*B+(sameAngular?2*Math.sqrt(S.mix*(1-S.mix))*A*B*c:0))];});
  const max=pts.reduce((best,a)=>a[1]>best[1]?a:best,pts[0]);read('r_{\\rm max}/a_\\mu',max[0]);
  const series=[{points:pts,color:'#238b7b',area:true},{points:[max],color:'#238b7b',marker:true}];
  if(!S.orbitalAdvanced&&S.state===1){
    series.push({points:[[2,0],[2,max[1]]],color:electronInk.level,dash:'4 4',label:'Kulový uzel'});
    read('r_{\\text{uzel}}/a_\\mu',2);
  }
  plot(S.orbitalAdvanced?'Pravděpodobnost v kulové slupce na jednotku poloměru':'Pravděpodobnost podle vzdálenosti od jádra',series,0,extent,0,max[1]*1.06,'r/a_\\mu','','P_r a_\\mu','',{xLabel:'Vzdálenost od jádra',yLabel:'Radiální hustota'});
}
function slitVectorBands(frame,n,signed){
  const values=signed?frame.re:frame.rho,bands=[];
  let max=0;
  for(const value of values)max=Math.max(max,Math.abs(value));
  if(!max)return bands;
  const width=n+2;
  for(const sign of signed?[1,-1]:[1]){
    const field=new Float32Array(width*width);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const v=values[y*n+x]/max;
      field[(y+1)*width+x+1]=signed?sign*v:Math.sqrt(Math.max(0,v));
    }
    const color=sign>0?electronInk.electron:electronInk.positive;
    for(const threshold of [.08,.15,.24,.36,.50,.66,.83])bands.push([electronContour(field,width,width,threshold),color]);
  }
  return bands;
}
function slitDetectorCurve(samples){
  const subdivisions=8;
  const slopes=samples.map(([,y],i)=>{
    if(i===0)return samples[1][1]-y;
    if(i===samples.length-1)return y-samples[i-1][1];
    const before=y-samples[i-1][1],after=samples[i+1][1]-y;
    return before*after>0?2*before*after/(before+after):0;
  });
  // Interpolate between bin centers without inserting extra extrema.
  const points=[];
  for(let i=0;i<samples.length-1;i++){
    const [x,y]=samples[i],[nextX,nextY]=samples[i+1];
    for(let j=0;j<subdivisions;j++){
      const t=j/subdivisions,blend=t*t*(3-2*t);
      const value=y+(nextY-y)*blend+t*(1-t)*((1-t)*slopes[i]-t*slopes[i+1]);
      points.push([x+(nextX-x)*t,value]);
    }
  }
  points.push(samples.at(-1));
  return points;
}

const protonChargeRadius=.84e-15;
function resolutionFade(start,end,value){
  const t=Math.max(0,Math.min(1,(value-start)/(end-start)));
  return t*t*(3-2*t);
}
const protonInteriorOpacity=field=>resolutionFade(.18,.59,protonChargeRadius/field);

function drawProtonInterior(p,radius,time,opacity){
  const scale=radius/p.scale,[cx,cy]=p.proj([0,0,0]);
  // Illustrative oscillations keep the center fixed.
  const deformation=(angle,phase)=>1+.13*Math.sin(2*angle-2.8*time+phase)+.079*Math.sin(3*angle+3.6*time+phase)+.04*Math.cos(5*angle-4.7*time);
  const contour=(size,phase)=>Array.from({length:145},(_,i)=>{
    const angle=i*Math.PI/72,r=radius*size*deformation(angle,phase);
    return [cx+r*Math.cos(angle),cy+.86*r*Math.sin(angle)];
  });
  const mist=p.gradient('radialGradient','cx=".48" cy=".46" r=".52"',[
    [0,'#b5d9f9d9'],[.34,'#5787bce3'],[.63,'#3d5a90c2'],[.86,'#6e80b286'],[1,'#7f94bc00']
  ]);
  const haze=p.gradient('radialGradient','',[[0,'#e9f9ffdf'],[.44,'#a1d4f377'],[1,'#91b9e600']]);
  p.layers.push('<g opacity="'+electronSvgNumber(opacity)+'">');
  p.polyline(contour(1.38,.5),'none',0,haze);
  p.polyline(contour(1.10,0),'none',0,mist);
  for(const [size,phase,color] of [[1.02,0,'#576f9c70'],[.92,.6,'#e9f9ff8f']]){
    p.polyline(contour(size,phase),color,1.3);
  }

  const offsets=Array.from({length:3},(_,i)=>{
    const angle=i*2*Math.PI/3+.36*Math.sin(.88*time)+.23*Math.sin((1.56+i*.32)*time+i);
    const r=.48+.086*Math.sin((1.35+i*.34)*time+2*i);
    return [r*Math.cos(angle),r*Math.sin(angle),.28*Math.sin((.99+i*.32)*time+i*1.9)];
  });
  const center=offsets[0].map((_,dimension)=>offsets.reduce((sum,point)=>sum+point[dimension],0)/3);
  const positions=offsets.map(point=>p.proj(point.map((value,i)=>(value-center[i])*scale)));
  const colors=['#62b1d4','#8b89d1','#c493a5'];
  for(let i=0;i<11;i++){
    const angle=i*Math.PI/11+.27*Math.sin(.83*time+i),tilt=.46+.42*Math.sin(.69*time+i*1.63);
    const ribbon=Array.from({length:109},(_,j)=>{
      const a=j*Math.PI/54,k=(.84+.077*Math.sin(3*a+i-.83*time)+.048*Math.sin(5*a+i+1.08*time))*deformation(a+angle,i*.19);
      const x=k*Math.cos(a),y=k*Math.sin(a);
      return p.proj([scale*(x*Math.cos(angle)-y*tilt*Math.sin(angle)),scale*(x*Math.sin(angle)+y*tilt*Math.cos(angle)),scale*y*Math.sqrt(1-tilt*tilt)]);
    });
    const color=colors[i%colors.length];
    p.polyline(ribbon,color+'40',4.2);
    p.polyline(ribbon,color+'b8',1.35);
    p.polyline(ribbon,'#edf7ffb0',.55);
  }
  const glint=p.gradient('radialGradient','',[[0,'#ffffff'],[.14,'#f4fdfff0'],[.34,'#c5ebffb5'],[.64,'#95c9fa42'],[1,'#9acbff00']]);
  for(let i=0;i<3;i++){
    const [x,y]=positions[i],[u,v]=positions[(i+1)%3],length=Math.hypot(u-x,v-y)||1;
    const nx=(y-v)/length,ny=(u-x)/length;
    for(let strand=-2;strand<=2;strand++){
      const arc=Array.from({length:43},(_,j)=>{
        const f=j/42;
        const bend=Math.sin(Math.PI*f)*radius*(.09+.075*Math.sin(9*f-2.4*time+i+strand*.7)+.096*strand);
        return [x+(u-x)*f+bend*nx,y+(v-y)*f+bend*ny];
      });
      p.polyline(arc,colors[i]+'38',strand===0?6.6:3.8);
      p.polyline(arc,strand===0?'#fbfdff':'#e3f1ff9b',strand===0?1.65:.78);
      if(strand===0){
        const [a,b]=arc[Math.floor((.5+.37*Math.sin(time*2+i*2))*42)];
        p.disk(a,b,radius*.13,glint);
      }
    }
  }
  const upHalo=p.gradient('radialGradient','',[[0,'#f8ffff'],[.18,'#e5fbffef'],[.38,'#a0d9ffd5'],[.75,'#79b8f234'],[1,'#94bafa00']]);
  const downHalo=p.gradient('radialGradient','',[[0,'#fffbff'],[.18,'#ffeef9e9'],[.38,'#e4b9ead1'],[.75,'#b98adc3a'],[1,'#b98adc00']]);
  const ordered=positions.map(([x,y,z],i)=>({x,y,z,i})).sort((a,b)=>a.z-b.z);
  for(const {x,y,z,i} of ordered){
    const r=radius*(.25+.06*z/scale+.022*Math.sin(4.2*time+i));
    p.disk(x,y,r*1.4,i===2?downHalo:upHalo);
    for(let k=0;k<5;k++){
      const angle=k*Math.PI/5+i*.45,timeShift=.90+.12*Math.sin(3.1*time+k+i);
      const dx=Math.cos(angle)*r*timeShift,dy=Math.sin(angle)*r*timeShift;
      p.polyline([[x-dx,y-dy],[x+dx,y+dy]],'#e6f6ff52',1.85);
      p.polyline([[x-dx*.53,y-dy*.53],[x+dx*.53,y+dy*.53]],'#f8fdffb3',.65);
    }
    p.disk(x,y,r*.29,glint);
  }
  p.layers.push('</g>');
}

function drawResolutionScene(p,P,cache,field,resolution){
  const {w,h,scale}=p,[cx,cy]=p.proj([0,0,0]);
  const orbital=P.a0/field,nuclear=protonChargeRadius/field,unresolved=resolution>=field;
  const interior=protonInteriorOpacity(field),time=cache.protonTime??0;
  const bound=x=>Math.max(0,Math.min(1,x));
  const alpha=(color,opacity)=>color+Math.round(255*bound(opacity)).toString(16).padStart(2,'0');
  const sky=p.gradient('radialGradient','cx=".46" cy=".44" r=".76"',[
    [0,'#fcfeff'],[.47,'#edf8ff'],[.78,'#cddfec'],[1,'#a1bbce']
  ]);
  p.rect(0,0,w,h,sky);
  const backdrop=p.gradient('linearGradient','x2="1" y2="1"',[[0,'#c2e1f200'],[.48,'#faffff42'],[1,'#6b8bab40']]);
  p.rect(0,0,w,h,backdrop);

  const cloudOpacity=resolutionFade(.014,.09,orbital)*(1-resolutionFade(2.2,11,orbital));
  if(cloudOpacity>0){
    const radius=scale*orbital;
    const fog=p.gradient('radialGradient','cx=".45" cy=".40" r=".56"',[
      [0,alpha('#ffffff',.88*cloudOpacity)],[.18,alpha('#8fcdeb',.43*cloudOpacity)],
      [.46,alpha('#73afd9',.27*cloudOpacity)],[.72,alpha('#6eaed7',.12*cloudOpacity)],[1,'#79bade00']
    ]);
    p.disk(cx,cy,2.95*radius,fog);
    const samples=cache.resolutionCloud??=(()=>{
      const rng=P.random(100);
      return Array.from({length:4200},()=>{
        // Hydrogen 1s radial law, a gamma distribution with shape three.
        const r=-.5*Math.log(Math.max(1e-30,rng()*rng()*rng())),u=2*rng()-1;
        const angle=P.tau*rng(),span=r*Math.sqrt(1-u*u);
        return [span*Math.cos(angle),r*u,span*Math.sin(angle)];
      });
    })();
    const palette=['#89b7d9','#5b9bd0','#3a84be','#286b9f','#185584'],layers=palette.map(()=>[]);
    for(const [index,[x,y,z]] of samples.entries()){
      const [u,v,depth]=p.proj([x*orbital,y*orbital,z*orbital]);
      const cameraDepth=Math.tanh(depth*1.2),perspective=1/(1-.26*cameraDepth);
      const px=cx+(u-cx)*perspective,py=cy+(v-cy)*perspective;
      if(px<0||px>w||py<0||py>h)continue;
      const i=Math.min(4,Math.floor(2.5*(cameraDepth+1))),color=palette[i];
      layers[i].push([px,py,color]);
      if(cache.resolutionFlight&&index%31===0&&i>2){
        const trail=.018+.012*i;
        p.polyline([[px,py],[px+(px-cx)*trail,py+(py-cy)*trail]],alpha(color,.36*cloudOpacity),1.2);
      }
    }
    for(const [i,points] of layers.entries())p.marks(points,1.1+.34*i,cloudOpacity*(.29+.10*i),true);
    const ringOpacity=.53*resolutionFade(.09,.2,orbital)*(1-resolutionFade(.65,1.15,orbital));
    if(ringOpacity>0)p.ring([0,0,0],orbital,alpha('#3c80a5',ringOpacity),'xy',null,'4 5');
  }

  const pulse=1+interior*(.080*Math.sin(2.7*time)+.037*Math.sin(4.1*time));
  const protonRadius=Math.min(Math.max(w,h)*1.25,scale*nuclear)*pulse;
  const bodyOpacity=resolutionFade(1.5,8,protonRadius);
  if(bodyOpacity>0){
    p.layers.push('<g opacity="'+electronSvgNumber(bodyOpacity*(1-.72*interior))+'">');
    const halo=p.gradient('radialGradient','',[[0,'#fffae4e9'],[.35,'#eeb36da8'],[.63,'#f4c9953f'],[.83,'#d4b6b81f'],[1,'#d4b6b800']]);
    p.disk(cx,cy,protonRadius*2.05,halo);
    const body=p.gradient('radialGradient','cx=".49" cy=".48" r=".49" fx=".33" fy=".28"',[
      [0,'#fff9dc'],[.25,'#ffdfa7'],[.48,'#e6a46a'],[.67,'#b96b49d9'],[.84,'#824e6370'],[1,'#584a7900']
    ]);
    p.disk(cx,cy,protonRadius*1.28,body);
    const sheen=p.gradient('radialGradient','',[[0,'#fffffce8'],[.32,'#fff4bcb1'],[.69,'#fff0b92e'],[1,'#fff7e400']]);
    p.disk(cx-protonRadius*.24,cy-protonRadius*.24,protonRadius*.60,sheen);
    p.layers.push('</g>');
  }
  if(bodyOpacity<1)p.disk(cx,cy,2.4,alpha('#bf744b',1-bodyOpacity),alpha('#fff8e9',1-bodyOpacity),.8);

  const compton=P.hb/(P.m*P.c*field),comptonRadius=scale*compton;
  const comptonOpacity=resolutionFade(12,25,comptonRadius)*(1-resolutionFade(h*.20,h*.30,comptonRadius))*(1-bodyOpacity);
  if(comptonOpacity>0){
    p.layers.push('<g opacity="'+electronSvgNumber(comptonOpacity)+'">');
    p.ring([0,0,0],compton,'#416e979e','xy',null,'5 5');
    p.text(cx,cy+comptonRadius+16,'Comptonova délka','middle');
    p.layers.push('</g>');
  }
  const veilOpacity=resolutionFade(0,.58,Math.log10(resolution/field));
  if(veilOpacity>0){
    const veil=p.gradient('radialGradient','',[[0,alpha('#fff8e9',.17*veilOpacity)],[.62,alpha('#fff4df',.32*veilOpacity)],[1,alpha('#e5c4a6',.56*veilOpacity)]]);
    p.rect(0,0,w,h,veil);
  }
  if(interior>0)drawProtonInterior(p,Math.min(protonRadius,h*.46,w*.42),time,interior);
  const labels=[
    ['Elektronový oblak vodíku',1-resolutionFade(.90,1.13,orbital)],
    ['Okolí jádra',resolutionFade(1.13,1.41,orbital)*(1-resolutionFade(.016,.025,nuclear))],
    ['Jádro vodíku · proton',resolutionFade(.025,.044,nuclear)]
  ];
  for(const [name,opacity] of labels)if(opacity>0){
    p.layers.push('<g opacity="'+electronSvgNumber(opacity)+'">');
    p.text(w/2,24,name,'middle');
    p.layers.push('</g>');
  }
  if(interior>0){
    p.layers.push('<g opacity="'+electronSvgNumber(interior)+'">');
    p.text(w/2,44,'Názorný model · dva kvarky u a jeden d','middle');
    p.text(w/2,h-66,'Gluonové pole','middle');
    p.layers.push('</g>');
  }
  const y=h-33,span=Math.min(w-38,scale*resolution/field);
  p.rect(12,h-54,w-24,46,'#f9fcf4c9','#d1bd9ba8',7);
  const gold=electronInk.positive;
  p.polyline([[w/2-span/2,y],[w/2+span/2,y]],gold,2,'none',unresolved?'5 4':'');
  for(const x of [w/2-span/2,w/2+span/2])p.polyline([[x,y-4],[x,y+4]],gold,1.5);
  p.text(w/2,h-16,unresolved?'Za mezí rozlišení sondy':'Rozlišení sondy','middle');
}

function drawSlits({p,S,T,cache,read,plot,scale}){
  const frames=cache.frames,lastFrame=frames?frames.length-1:0,showHits=S.view===2&&!cache.flight;
  const frameIndex=cache.flight?cache.flight.progress*lastFrame:showHits?lastFrame:Math.min(lastFrame,T*3);
  const frameLow=Math.floor(frameIndex),fraction=frameIndex-frameLow,frame=frames?.[frameLow],next=frames?.[Math.min(lastFrame,frameLow+1)];
  const n=frame?Math.sqrt(frame.rho.length):S.quality?128:96;
  const L=Math.min(p.w*.75,p.h*.73)*Math.min(1.4,p.scale/Math.min(.43*p.w,.78*p.h));
  const x0=(p.w-L)/2,y0=(p.h-L)*.58;
  const chamber=p.gradient('linearGradient','x2="1" y2="1"',[[0,'#f8fcff'],[.58,'#eff8fc'],[1,'#e2f0f7']]);
  p.rect(x0,y0,L,L,chamber,'#adcadb',6);
  if(frame&&!showHits&&!cache.slitPreview){
    const signed=S.view===1&&!!frame.re;
    if(cache.field?.signed!==signed)cache.field={signed,bands:new Map()};
    const bands=cache.field.bands;
    for(const source of bands.keys())if(source!==frame&&source!==next)bands.delete(source);
    p.layers.push('<g transform="translate('+x0+' '+y0+') scale('+L/(n+1)+')">');
    function drawField(source,opacity){
      if(!bands.has(source))bands.set(source,slitVectorBands(source,n,signed));
      p.layers.push('<g opacity="'+opacity+'">');
      for(const [band,color] of bands.get(source))if(band)p.layers.push('<path d="'+band+'" fill="'+color+'" fill-rule="evenodd" fill-opacity=".19"/>');
      p.layers.push('</g>');
    }
    drawField(frame,1-fraction);
    if(fraction)drawField(next,fraction);
    p.layers.push('</g>');
  }
  const sourceX=x0+6/32*L,sourceY=y0+L/2;
  const housing=p.gradient('linearGradient','x2="0" y2="1"',[[0,'#eff8fc'],[.45,'#afc9d9'],[1,'#5d8095']]);
  p.rect(sourceX-L*.14,sourceY-L*.045,L*.085,L*.09,housing,electronInk.frame,3);
  p.polyline([[sourceX-L*.055,sourceY-L*.03],[sourceX,sourceY-.012*L],[sourceX,sourceY+.012*L],[sourceX-L*.055,sourceY+.03*L]],electronInk.frame,1.2,housing);
  const barrier=p.gradient('linearGradient','x2="1" y2="0"',[[0,'#b28650'],[.5,'#efdbb3'],[1,'#b58850']]);
  const edges=[-16];
  if(S.mode!==1)edges.push((-S.gap-S.width)/2,(-S.gap+S.width)/2);
  if(S.mode!==2)edges.push((S.gap-S.width)/2,(S.gap+S.width)/2);
  edges.push(16);
  for(let i=0;i<edges.length;i+=2){
    p.rect(x0+11.5/32*L,y0+(edges[i]+16)*L/32,L/32,(edges[i+1]-edges[i])*L/32,barrier,electronInk.positive,1.6);
  }
  const detX=x0+26/32*L;
  p.rect(detX-3,y0,6,L,'#c6e3ea','#8cabb5',1.4);
  if(!cache.slitPreview)p.marks(cache.hits.map(([y,jitter])=>[detX+(jitter-.5)*14,y0+y*L,electronInk.electron]),2,.85);
  p.text(x0,y0+L+17,'Zdroj');p.text(x0+.37*L,y0+L+17,'Štěrbiny','middle');p.text(detX,y0+L+17,'Detektor','middle');
  if(!frame)return;
  read('t',frame.time+fraction*(next.time-frame.time),'fs');read('N_{\\text{zdroj}}',cache.fired,'',9);read('N_{\\text{det}}',cache.hits.length,'',9);
  scale('L_{\\rm okna}=32\\,\\mathrm{nm}');
  const det=ElectronPhysics.mixSamples(frame.det,next.det,fraction),pts=Array.from(det,(v,i)=>[(i+.5)*32/n-16,v*n/32]),sum=det.reduce((a,b)=>a+b,0);
  read('P_{\\rm det}',sum);
  let peak=Math.max(1e-12,...pts.map(([,y])=>y));
  const series=[{points:slitDetectorCurve(pts),color:'#258a79',area:true,label:showHits?'Výpočet':''}];
  if(showHits&&cache.fired){const hist=new Float64Array(n);for(const hit of cache.hits)hist[Math.min(n-1,Math.floor(hit[0]*n))]++;
    const bins=pts.map(([x],i)=>[x,hist[i]*n/(32*cache.fired)]);
    peak=Math.max(peak,...bins.map(([,y])=>y));
    series.push({points:bins,color:'#b57825',bar:true,binWidth:32/n,label:'Jednotlivé zásahy'});}
  plot(cache.slitPreview?'Záchyt při předchozím nastavení':'Pravděpodobnost záchytu podél stínítka',series,-16,16,0,1.15*peak,'y','nm','P_y','nm^{-1}',{xLabel:'Poloha na stínítku',yLabel:'Hustota záchytu'});
}
