function drawOrbital({p,P,S,T,cache,read,plot,scale,fmt}){
  const v=cache.volume??=OrbitalVolume.make(S.state,S.mix,S.quality),{cells,extent,h,n}=v;
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
    if(cache.orbitalSamples?.phase!==shapePhase||cache.orbitalSamples.view!==S.view){
      const rng=P.random(1926),points=[],indices=[];
      for(let i=0;i<(S.view===1?4800:2600);i++){
        const k=OrbitalVolume.sample(cdf,rng),xyz=cells[k].xyz.map(x=>(x+(rng()-.5)*h)*.57/extent);
        if(S.view===5)xyz[0]+=.35;
        points.push(xyz);indices.push(k);
      }
      cache.orbitalSamples={phase:shapePhase,view:S.view,points,indices};
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
      if(S.view===3){if(Math.abs(cells[i].xyz[2]-S.cut*extent)>h*.5||w<.0001)continue;}
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
  if(S.view!==5&&(S.view!==3||Math.abs(S.cut*extent)<=h*.5)){
    p.glow([0,0,0],.072,electronInk.nucleus);p.dot([0,0,0],.019,electronInk.nucleus,true);
  }
  if(S.view===3){const cell=cells[((n-1)/2*n+(n-1)/2)*n+Math.round((1+S.cut)*(n-1)/2)],re=cell.ar+cell.br*c-cell.bi*s,im=cell.ai+cell.br*s+cell.bi*c;read('w(0,0,z)a_\\mu^3',re*re+im*im);read('\\operatorname{Re}(\\Psi a_\\mu^{3/2})',re*Math.cos(globalPhase)-im*Math.sin(globalPhase));}
  read('t',time,'fs');read('a_\\mu',P.a*1e12,'pm');read('P_{\\rm okno}',sum*h**3,'',4);
  scale(S.view===4?'\\arg\\Psi:\\;0\\;\\text{modrá},\\;\\pi\\;\\text{oranžová}':'R_{\\rm okna}='+fmt(extent)+'\\,a_\\mu');
  const pts=Array.from({length:161},(_,i)=>{const r=i*extent/160,A=P.radial(v.s[0],v.s[1],r),B=P.radial(v.b[0],v.b[1],r);
    const sameAngular=v.s[1]===v.b[1]&&v.s[2]===v.b[2];
    return [r,r*r*((1-S.mix)*A*A+S.mix*B*B+(sameAngular?2*Math.sqrt(S.mix*(1-S.mix))*A*B*c:0))];});
  const max=pts.reduce((best,a)=>a[1]>best[1]?a:best,pts[0]);read('r_{\\rm max}/a_\\mu',max[0]);
  plot('Pravděpodobnost v kulové slupce na jednotku poloměru',[{points:pts,color:'#238b7b',area:true},{points:[max],color:'#238b7b',marker:true}],0,extent,0,max[1]*1.06,'r/a_\\mu','','P_r a_\\mu','',{xLabel:'Vzdálenost od jádra',yLabel:'Radiální hustota'});
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
function drawSlits({p,S,T,cache,read,plot,scale}){
  if(!cache.frames)return;
  const lastFrame=cache.frames.length-1,showHits=S.view===2&&!cache.flight;
  const frameIndex=cache.flight?cache.flight.progress*lastFrame:showHits?lastFrame:Math.min(lastFrame,T*3);
  const frameLow=Math.floor(frameIndex),fraction=frameIndex-frameLow,frame=cache.frames[frameLow],next=cache.frames[Math.min(lastFrame,frameLow+1)],n=Math.sqrt(frame.rho.length);
  const L=Math.min(p.w*.75,p.h*.73)*Math.min(1.4,p.scale/Math.min(.43*p.w,.78*p.h));
  const x0=(p.w-L)/2,y0=(p.h-L)*.58;
  const chamber=p.gradient('linearGradient','x2="1" y2="1"',[[0,'#f8fcff'],[.58,'#eff8fc'],[1,'#e2f0f7']]);
  p.rect(x0,y0,L,L,chamber,'#adcadb',6);
  if(!showHits){
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
  let start=-1;
  for(let i=0;i<n;i++){const y=(i+.5)*32/n-16;
    const closed=!((S.mode!==2&&Math.abs(y-S.gap/2)<S.width/2)||(S.mode!==1&&Math.abs(y+S.gap/2)<S.width/2));
    if(closed&&start<0)start=i;
    if(start>=0&&(!closed||i===n-1)){
      p.rect(x0+11.5/32*L,y0+start*L/n,L/32,(i-start+(closed?1:0))*L/n,barrier,electronInk.positive,1.6);start=-1;
    }
  }
  const detX=x0+26/32*L;
  p.rect(detX-3,y0,6,L,'#c6e3ea','#8cabb5',1.4);
  p.marks(cache.hits.map(([y,jitter])=>[detX+(jitter-.5)*14,y0+y*L,electronInk.electron]),2,.85);
  p.text(x0,y0+L+17,'Zdroj');p.text(x0+.37*L,y0+L+17,'Štěrbiny','middle');p.text(detX,y0+L+17,'Detektor','middle');
  read('t',frame.time+fraction*(next.time-frame.time),'fs');read('N_{\\text{zdroj}}',cache.fired,'',9);read('N_{\\text{det}}',cache.hits.length,'',9);
  scale('L_{\\rm okna}=32\\,\\mathrm{nm}');
  const det=ElectronPhysics.mixSamples(frame.det,next.det,fraction),pts=Array.from(det,(v,i)=>[(i+.5)*32/n-16,v*n/32]),sum=det.reduce((a,b)=>a+b,0);
  read('P_{\\rm det}',sum);
  const series=[{points:pts,color:'#258a79',area:true,label:showHits?'Výpočet':''}];
  if(showHits&&cache.fired){const hist=new Float64Array(n);for(const hit of cache.hits)hist[Math.min(n-1,Math.floor(hit[0]*n))]++;
    series.push({points:pts.map(([x],i)=>[x,hist[i]*n/(32*cache.fired)]),color:'#b57825',bar:true,binWidth:32/n,label:'Jednotlivé zásahy'});}
  plot('Pravděpodobnost záchytu podél stínítka',series,-16,16,0,Math.max(1e-12,...series.flatMap(s=>s.points.map(v=>v[1]))),'y','nm','P_y','nm^{-1}',{xLabel:'Poloha na stínítku',yLabel:'Hustota záchytu'});
}
