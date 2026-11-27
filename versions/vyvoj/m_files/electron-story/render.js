const electronInk={electron:'#2279b6',positive:'#ad6b33',nucleus:'#ba5146',path:'#197c77',level:'#77629a',frame:'#53788c',grid:'#becfd9',match:'#087e50'};
const hydrogenLevelColors=['#316b9c','#76529f','#9d4c72'];
const atomGlyphRadius={nucleus:.042,electron:.023};
const electronSvgNumber=value=>Math.round(value*100)/100;
const electronSvgText=value=>String(value).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

// Marching squares with a shared edge ID closes contour paths across adjacent cells.
function electronContour(values,cols,rows,level){
  const nodes=new Map(),format=electronSvgNumber;
  function addEdge(a,b){if(a!==b){nodes.get(a).next.push(b);nodes.get(b).next.push(a);}}
  function crossing(i,j,horizontal){
    const at=j*cols+i,id=2*at+Number(horizontal);
    if(!nodes.has(id)){
      const a=values[at],b=values[at+(horizontal?1:cols)],fraction=(level-a)/(b-a);
      nodes.set(id,{x:i+(horizontal?fraction:0),y:j+(horizontal?0:fraction),next:[]});
    }
    return id;
  }
  for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){
    const k=j*cols+i,a=values[k],b=values[k+1],c=values[k+cols+1],d=values[k+cols];
    const code=Number(a>=level)+2*Number(b>=level)+4*Number(c>=level)+8*Number(d>=level);
    if(!code||code===15)continue;
    const cut=[];
    if((a>=level)!==(b>=level))cut.push(crossing(i,j,true));
    if((b>=level)!==(c>=level))cut.push(crossing(i+1,j,false));
    if((c>=level)!==(d>=level))cut.push(crossing(i,j+1,true));
    if((d>=level)!==(a>=level))cut.push(crossing(i,j,false));
    if(cut.length===2)addEdge(cut[0],cut[1]);
    else if(((a+b+c+d)*.25>=level)===(code===5)){addEdge(cut[0],cut[1]);addEdge(cut[2],cut[3]);}
    else{addEdge(cut[0],cut[3]);addEdge(cut[1],cut[2]);}
  }
  let path='';
  const visited=new Set();
  for(const [id] of nodes){
    if(visited.has(id))continue;
    let next=id,previous,first=true;
    while(next!==undefined&&!visited.has(next)){
      const point=nodes.get(next);
      path+=(first?'M':'L')+format(point.x)+' '+format(point.y);first=false;
      visited.add(next);
      const alternate=point.next.find(link=>link!==previous);
      previous=next;next=alternate;
    }
    path+='Z';
  }
  return path;
}

function electronVector(svg){
  const w=Math.max(1,svg.clientWidth),h=Math.max(1,svg.clientHeight),layers=[],defs=[];
  let id=0;
  function definition(tag,attrs,content){
    const name=svg.id+'-shape-'+id++;
    defs.push('<'+tag+' id="'+name+'" '+attrs+'>'+content+'</'+tag+'>');
    return name;
  }
  const num=electronSvgNumber,xy=(x,y)=>num(x)+' '+num(y);
  const stop=([offset,color])=>{
    const alpha=color.length===9?num(parseInt(color.slice(7),16)/255):1;
    return '<stop offset="'+offset+'" stop-color="'+color.slice(0,7)+'" stop-opacity="'+alpha+'"/>';
  };
  function gradient(tag,attrs,stops){return 'url(#'+definition(tag,attrs,stops.map(stop).join(''))+')';}
  function path(d,stroke='none',width=1,fill='none',dash=''){
    if(d)layers.push('<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linejoin="round" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>');
  }
  function polyline(points,stroke,width=1,fill='none',dash=''){
    if(points.length)path('M'+points.map(([x,y])=>xy(x,y)).join('L')+(fill!=='none'?'Z':''),stroke,width,fill,dash);
  }
  function disk(x,y,r,fill,stroke='none',width=1){
    if(r>0)layers.push('<circle cx="'+num(x)+'" cy="'+num(y)+'" r="'+num(r)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'"/>');
  }
  function text(x,y,label,anchor='start'){
    layers.push('<text x="'+num(x)+'" y="'+num(y)+'" text-anchor="'+anchor+'" class="vector-label">'+electronSvgText(label)+'</text>');
  }
  function rect(x,y,width,height,fill,stroke='none',radius=0){
    if(width>0&&height>0)layers.push('<rect x="'+num(x)+'" y="'+num(y)+'" width="'+num(width)+'" height="'+num(height)+'" rx="'+radius+'" fill="'+fill+'" stroke="'+stroke+'"/>');
  }
  function marks(points,size=1.6,opacity=.55,round=false){
    const groups=new Map(),s=num(size),r=num(size/2),arc='a'+r+' '+r+' 0 1 0 ';
    for(const [x,y,color] of points){
      if(x<-size||x>w+size||y<-size||y>h+size)continue;
      const commands=groups.get(color)||[];
      commands.push(round?'M'+xy(x-r,y)+arc+s+' 0'+arc+'-'+s+' 0Z':'M'+xy(x-size/2,y-size/2)+'h'+s+'v'+s+'h-'+s+'Z');
      groups.set(color,commands);
    }
    for(const [color,commands] of groups)layers.push('<path d="'+commands.join('')+'" fill="'+color+'" opacity="'+opacity+'"/>');
  }
  function finish(){
    svg.setAttribute('viewBox','0 0 '+w+' '+h);
    svg.innerHTML='<defs>'+defs.join('')+'</defs>'+layers.join('');
  }
  return {w,h,path,polyline,disk,rect,text,marks,gradient,definition,layers,finish};
}

function electronPainter(svg,camera,model=false){
  const surface=electronVector(svg),{w,h,gradient,polyline,disk,rect,text}=surface;
  const num=electronSvgNumber;
  const scale=Math.min((model?.56:.43)*w,(model?.73:.78)*h)*camera.zoom;
  const cy=Math.cos(camera.yaw),sy=Math.sin(camera.yaw),ce=Math.cos(camera.pitch),se=Math.sin(camera.pitch);
  function proj([x,y,z=0]){
    const a=x*cy-z*sy,b=x*sy+z*cy;
    return [w/2+scale*a,h*.49-scale*(y*ce-b*se),b*ce+y*se];
  }
  function depthCloud(points,{section=false,soft=true}={}){
    const cloud=[],layers=8,groups=Array.from({length:layers},()=>[]);
    for(const [index,point] of points.entries()){
      const [x,y,z]=proj(point);
      if(section&&Math.abs(z)>.076)continue;
      const perspective=2.55/(2.55-z);
      const u=w/2+(x-w/2)*perspective,v=h*.49+(y-h*.49)*perspective;
      if(u<0||u>w||v<0||v>h)continue;
      cloud.push({index,u,v,z,perspective});
    }
    if(soft){
      const back=gradient('radialGradient','',[[0,'#4f7dc474'],[.42,'#719bdb36'],[1,'#719bdb00']]);
      const front=gradient('radialGradient','',[[0,'#1575bb88'],[.40,'#409bd447'],[1,'#65ace000']]);
      const spacing=section?4:Math.max(1,Math.ceil(points.length/420));
      const haze=cloud.filter(({index})=>index%spacing===0).sort((a,b)=>a.z-b.z);
      const radius=Math.max(section?3.0:6.6,scale*(section?.018:.048));
      for(const {u,v,z,perspective,index} of haze)disk(u,v,radius*perspective*(.80+.52*((index*37)%101)/100),z<0?back:front);
    }
    const spacing=Math.max(1,Math.ceil(points.length/(section?4200:soft?1250:2300)));
    for(const {index,u,v,z,perspective} of cloud){
      if(index%spacing)continue;
      const band=Math.max(0,Math.min(layers-1,Math.floor((z+.7)/1.4*layers)));
      const r=num(perspective*(.48+.55*band/(layers-1))),d=num(2*r),arc='a'+r+' '+r+' 0 1 0 ';
      groups[band].push('M'+num(u-r)+' '+num(v)+arc+d+' 0'+arc+'-'+d+' 0Z');
    }
    for(const [i,group] of groups.entries())if(group.length){
      const t=i/(layers-1),color='hsl(205 65% '+num(60-24*t)+'%)',opacity=num(section?.58:.17+.53*t);
      surface.layers.push('<path d="'+group.join('')+'" fill="'+color+'" fill-opacity="'+opacity+'"/>');
    }
  }
  function orientationAxes(){
    const x=30,y=h-30,[ux,uy]=proj([0,0,0]);
    disk(x,y,22,'#f8fcfe','#c7dce8',.9);
    const axes=[[[1,0,0],'#ad6b52'],[[0,1,0],'#287d79'],[[0,0,1],'#336fa0']].map(([direction,color])=>[proj(direction),color]);
    axes.sort(([a],[b])=>a[2]-b[2]);
    for(const [[u,v],color] of axes){
      const end=[x+(u-ux)/scale*16,y+(v-uy)/scale*16];
      polyline([[x,y],end],color,1.35);disk(...end,2.1,color);
    }
    disk(x,y,2.1,'#526a7b');
  }
  function line(points,color,width=1,fill=null,dash=''){
    polyline(points.filter(Boolean).map(proj),color||'none',width,fill||'none',dash);
  }
  function trace(points,color,width=2.2){
    line(points,color+'29',width+6);
    line(points,color,width);
  }
  function glow(position,r,color){
    const [x,y]=proj(position),R=r*scale;
    const fill=gradient('radialGradient','',[[0,color+'66'],[.38,color+'2e'],[1,color+'00']]);
    rect(x-R,y-R,2*R,2*R,fill);
  }
  function waveEnvelope(top,bottom,color){
    line([...top,...bottom.slice().reverse()],null,0,color+'16');
    line(top,color+'6b',1.1);line(bottom,color+'6b',1.1);
  }
  const materialIds=new Map();
  function dot(position,r,color,light=false){
    if(!position)return;
    const [x,y]=proj(position),R=Math.max(.7,r*scale);
    let fill=color;
    if(light&&R>2){
      if(!materialIds.has(color))materialIds.set(color,gradient('radialGradient','cx=".38" cy=".34" r=".73" fx=".29" fy=".24"',[[0,'#fff'],[.18,'#e9f8ff'],[.44,color],[.78,color],[1,'#244d65']]));
      fill=materialIds.get(color);
    }
    disk(x,y,R,fill,light&&R>2?'#254964':'none',.65);
  }
  function ring([x,y,z=0],r,color,plane='xy',fill=null,dash=''){
    if(r<.0005)return;
    line(Array.from({length:73},(_,i)=>{
      const t=i*Math.PI/36,a=r*Math.cos(t),b=r*Math.sin(t);
      return [x+(plane==='yz'?0:a),y+(plane==='xz'?0:plane==='yz'?a:b),z+(plane==='xy'?0:b)];
    }),color,1.25,fill,dash);
  }
  function sphere(radius,center=[0,0,0],{negative=false}={}){
    const [x,y]=proj(center),r=radius*scale;
    if(negative){
      const fill=gradient('radialGradient','cx=".33" cy=".27" r=".87"',[[0,'#ffffff'],[.40,'#e8f5ff'],[.78,'#c1ddec'],[.93,'#a6cce3'],[1,'#d0e7f4']]);
      disk(x,y,r,fill,'#729eb6',1);
      return;
    }
    const fill=gradient('radialGradient','cx=".34" cy=".28" r=".87"',[[0,'#fffef9'],[.45,'#fff3d9'],[.76,'#f3d3a0'],[.93,'#dea671'],[1,'#f1cf9c']]);
    disk(x,y,r,fill,'#b9855e',1);
    const [cx,cy,cz]=center;
    for(const f of [-.60,0,.60])ring([cx,cy+radius*f,cz],radius*Math.sqrt(1-f*f),'#a9744936','xz');
    for(let n=0;n<4;n++){
      const a=n*Math.PI/4;
      line(Array.from({length:73},(_,i)=>{const t=i*Math.PI/36;return [cx+radius*Math.cos(a)*Math.sin(t),cy+radius*Math.cos(t),cz+radius*Math.sin(a)*Math.sin(t)];}),'#a9744930',.85);
    }
  }
  function tube(x1,x2,r,color,fill){
    const [ax,ay,z1]=proj([x1,0,0]),[bx,by,z2]=proj([x2,0,0]),length=Math.hypot(bx-ax,by-ay);
    const [back,front]=z1<z2?[x1,x2]:[x2,x1];
    ring([back,0,0],r,color,'yz',fill);
    if(length>.1){
      const across=[(ay-by)/length,(bx-ax)/length];
      const edges=Array.from({length:48},(_,i)=>{
        const t=i*Math.PI/24,p=[r*Math.cos(t),r*Math.sin(t)],[x,y]=proj([x1,...p]);
        return {p,d:(x-ax)*across[0]+(y-ay)*across[1]};
      }).sort((a,b)=>a.d-b.d);
      const top=edges[0].p,bottom=edges.at(-1).p,mid=(x1+x2)/2;
      const wall=[[x1,...top],[x2,...top],[x2,...bottom],[x1,...bottom]];
      const [u,v]=proj([mid,...top]),[s,t]=proj([mid,...bottom]);
      const glass=gradient('linearGradient','gradientUnits="userSpaceOnUse" x1="'+num(u)+'" y1="'+num(v)+'" x2="'+num(s)+'" y2="'+num(t)+'"',[[0,'#5485a065'],[.14,'#e4f4fbe8'],[.23,'#fff'],[.39,'#eaf5f833'],[.66,'#edf8fc06'],[1,'#678fa77c']]);
      line(wall,'none',0,fill);line(wall,color,1.15,glass);
      const glint=top.map((y,i)=>.82*y+.18*bottom[i]);
      line([[x1,...glint],[x2,...glint]],'#ffffffd9',1.5);
    }
    ring([front,0,0],r,color,'yz',fill);
    ring([front,0,0],r*.93,'#deeff8','yz');
  }
  function label(position,s){const [x,y]=proj(position);text(x+5,y-6,s);}
  function callout(position,end,s,anchor='start'){
    const [x,y]=proj(position),[u,v]=proj(end),direction=anchor==='end'?-1:1;
    polyline([[x,y],[u,v],[u+direction*16,v]],'#7d9baa',.9);disk(x,y,2.1,'#688a9a');
    text(u+direction*20,v+4,s,anchor);
  }
  function arrow(a,b,color,particleRadius=0){
    const [x,y]=proj(a),[u,v]=proj(b),d=Math.hypot(u-x,v-y);
    if(d<1)return;
    const c=(u-x)/d,s=(v-y)/d,k=Math.min(8,d*.48),width=Math.min(1,d*.18);
    const start=particleRadius?Math.max(.7,particleRadius*scale)-.3:0;
    polyline([[0,-width],[d-k,-width],[d-k,-k/2],[d,0],[d-k,k/2],[d-k,width],[0,width]].map(([i,j])=>[x+(start+i)*c-j*s,y+(start+i)*s+j*c]),'none',0,color);
  }
  return {...surface,proj,line,trace,glow,waveEnvelope,dot,ring,sphere,tube,label,callout,arrow,depthCloud,orientationAxes,scale};
}
function drawBohrAtom(p,{initial,final,shownFinal,highest,angle,eventAngle,transfer=0,photon,photonColor,showAllLevels=false},showPhoton=false){
  const {line,dot,proj,polyline,gradient,rect,scale}=p;
  const {nucleus,electron}=electronInk;
  const radius=n=>showAllLevels?.67*n/6:.67*(n/highest)**2;
  const orbit=(r,a)=>[r*Math.cos(a),0,r*Math.sin(a)];
  const levels=showAllLevels?[1,2,3,4,5,6]:initial===shownFinal?[initial]:[initial,shownFinal];
  const drawRings=front=>{
    for(const n of levels){
      const selected=n===initial||n===shownFinal;
      const occupancy=initial===final?Number(n===initial):n===initial?1-transfer:n===final?transfer:0;
      let arc=[];
      const paintArc=()=>{
        if(showAllLevels&&selected)line(arc,front?'#6686a5':'#90a9be',1.6,null,'5 4');
        else line(arc,showAllLevels?(front?'#c6d6e0':'#d2dfe7'):(front?'#9ea9c2':'#c3ccdb'),1.1);
        if(occupancy>0){
          p.layers.push('<g opacity="'+occupancy+'">');
          if(front)line(arc,'#56acdd44',6);
          line(arc,front?'#3b8bb8':'#7cb7d2',2.15);
          p.layers.push('</g>');
        }
      };
      for(let i=0;i<80;i++){
        const a=orbit(radius(n),i*Math.PI/40),b=orbit(radius(n),(i+1)*Math.PI/40);
        if((proj(a)[2]+proj(b)[2]>=0)===front){if(!arc.length)arc.push(a);arc.push(b);}
        else if(arc.length){paintArc();arc=[];}
      }
      if(arc.length)paintArc();
    }
  };
  drawRings(false);
  const smallest=radius(Math.min(initial,final));
  const glyphScale=Math.min(1,smallest/.092);
  const [cx,cy]=proj([0,0,0]),halo=scale*.127*glyphScale;
  const glow=gradient('radialGradient','',[[0,'#e7997788'],[.45,'#ecb19939'],[1,'#f3d4c400']]);
  rect(cx-halo,cy-halo,2*halo,2*halo,glow);
  dot([0,0,0],atomGlyphRadius.nucleus*1.22*glyphScale,nucleus,true);
  drawRings(true);
  const radiusGlyph=atomGlyphRadius.electron*1.22*glyphScale;
  const from=orbit(radius(initial),angle),to=orbit(radius(final),angle);
  if(transfer>0&&transfer<1){
    const glowStrength=Math.sin(Math.PI*transfer);
    p.layers.push('<g opacity="'+glowStrength+'">');
    p.trace([from,to],photonColor,1.5);p.glow(from,.16,photonColor);p.glow(to,.13,photonColor);
    p.layers.push('</g><g opacity="'+(1-transfer)+'">');dot(from,radiusGlyph,electron,true);
    p.layers.push('</g><g opacity="'+transfer+'">');dot(to,radiusGlyph,electron,true);p.layers.push('</g>');
  }else dot(transfer===1?to:from,radiusGlyph,electron,true);
  if(!showPhoton||!photon)return;
  const {travel,offset}=photon;
  const origin=orbit(radius(initial),eventAngle),direction=[.52*Math.cos(eventAngle),.57,.52*Math.sin(eventAngle)];
  origin[1]+=offset;
  const [ox,oy]=proj(origin),[dx,dy]=proj(origin.map((v,j)=>v+direction[j]));
  const length=Math.hypot(dx-ox,dy-oy)||1;
  const extent=offset?1:Math.abs(travel),width=Math.min(.32,extent*2),amplitude=scale*.038*Math.min(1,extent*6);
  const points=Array.from({length:94},(_,i)=>{
    const q=i/93,along=travel+(q-.5)*width;
    const wave=amplitude*Math.sin(q*6*Math.PI)*Math.sin(q*Math.PI)**2;
    return [ox+(dx-ox)*along+(oy-dy)*wave/length,oy+(dy-oy)*along+(dx-ox)*wave/length];
  });
  if(extent>0){
    polyline(points,photonColor+'36',Math.max(5,scale*.04));
    polyline(points,photonColor,2.6);
  }
}

function drawClassicalOrbit(p,viewAt,T,r0,radiating,{radiation=false}={}){
  const extent=.69,{nucleus,electron,path}=electronInk;
  const orbit=t=>{
    const {angle,state}=viewAt(t),r=state.r/r0*extent;
    return [r*Math.cos(angle),0,r*Math.sin(angle)];
  };
  p.ring([0,0,0],extent,'#9fb7c8','xz',null,'5 4');
  const span=radiating?T:Math.min(3,T);
  if(span>0){
    const pathPoints=Array.from({length:145},(_,i)=>orbit(T-span*(1-i/144)));
    p.trace(pathPoints,path);
  }
  p.glow([0,0,0],.135,nucleus);
  p.dot([0,0,0],atomGlyphRadius.nucleus,nucleus,true);
  p.dot(orbit(T),atomGlyphRadius.electron*1.22,electron,true);
  if(radiating&&radiation){
    for(let i=0;i<2;i++){
      const phase=(T*.56+i*.5)%1;
      p.ring([0,0,0],.72+.15*phase,'rgba(174,106,49,'+(.46*(1-phase))+')','xz');
    }
    p.label([-.70,-.26,0],'Vyzařování');
  }
}

function hydrogenDiagramScale(height){
  const P=ElectronPhysics,limit=-P.k/(2*25e-12*P.e),top=height*.14,bottom=height*.89;
  return {top,bottom,y:energy=>top+(bottom-top)*energy/limit,
    radiusAt:y=>25*(bottom-top)/Math.max(Number.EPSILON,y-top)};
}

function drawHydrogenLevels(p,reference,radius){
  const P=ElectronPhysics,{w,h}=p;
  const trial=-P.k/(2*radius*1e-12*P.e);
  const {top,bottom,y}=hydrogenDiagramScale(h);
  const left=w*.25,right=w*.74,xAxis=w*.93;
  const target=P.energy(reference),targetY=y(target);
  const match=Math.abs(target-trial)<1e-8;
  const trialY=match?targetY:y(trial);
  p.rect(left-6,targetY-9,right-left+12,18,hydrogenLevelColors[reference-1]+'20','none',5);
  p.polyline([[xAxis,bottom],[xAxis,top]],'#96adbc',1.15);
  p.text(xAxis,top-8,'Energie','middle');
  p.polyline([[left,top],[right,top]],'#a9bcc9',1,'none','3 4');
  p.text(left,top-8,'Mez vazby');
  for(const [i,label] of ['První','Druhá','Třetí'].entries()){
    const n=i+1,lineY=y(P.energy(n)),chosen=n===reference,color=hydrogenLevelColors[i];
    p.polyline([[left,lineY],[right,lineY]],chosen?color:color+'80',chosen?3.3:1.45);
    p.text(right+8,lineY+4,chosen?label+' · cíl':label);
  }
  const trialColor=match?electronInk.match:'#657581';
  p.polyline([[match?left:left*.77,trialY],[match?right:right+4,trialY]],trialColor,2.2,'none','6 4');
  p.disk(match?left:left*.77,trialY,3.5,trialColor,'#ffffff',1);
  p.text(left*.68,trialY+4,match?'Přichyceno':'Zkouška','end');
}

function drawHydrogenRing(p,radius,{turns,phase},closed,target){
  const {nucleus,path,positive}=electronInk,tau=ElectronPhysics.tau;
  const circle=(r,count)=>Array.from({length:count+1},(_,i)=>[r*Math.cos(tau*i/count),0,r*Math.sin(tau*i/count)]);
  const orbit=circle(radius,420);
  const amplitude=Math.min(.11,.22*radius);
  const wave=orbit.map(([x,,z],i)=>[x,amplitude*Math.cos(tau*turns*i/420+phase),z]);
  const waveColor=closed?electronInk.match:path;
  const join=[wave[0],wave.at(-1)],joinColor=closed?waveColor:positive;
  const center=[0,0,0],centerDepth=p.proj(center)[2];
  const depth=point=>p.proj(point)[2]-centerDepth;
  function split(points){
    const halves=[[],[]];
    let previous=points[0],priorDepth=depth(previous),segment=[previous];
    for(let i=1;i<points.length;i++){
      const point=points[i],nextDepth=depth(point);
      if((priorDepth>=0)!==(nextDepth>=0)){
        const f=priorDepth/(priorDepth-nextDepth);
        const edge=previous.map((v,j)=>v+f*(point[j]-v));
        segment.push(edge);halves[Number(priorDepth>=0)].push(segment);segment=[edge];
      }
      segment.push(point);previous=point;priorDepth=nextDepth;
    }
    halves[Number(priorDepth>=0)].push(segment);
    return halves;
  }
  const orbitHalves=split(orbit),waveHalves=split(wave),joinHalves=split(join);
  const targetHalves=target?split(circle(target.radius,420)):null;
  function drawHalf(front){
    if(targetHalves)for(const points of targetHalves[front])p.line(points,target.color,1.8);
    for(const points of orbitHalves[front])p.line(points,'#96b0bf',1.25,null,'4 4');
    for(const points of waveHalves[front])p.trace(points,waveColor);
    for(const points of joinHalves[front])p.line(points,joinColor,2);
    for(const point of join)if(Number(depth(point)>=0)===front)p.dot(point,.019,joinColor,true);
  }
  drawHalf(0);
  p.glow(center,.087,nucleus);p.dot(center,.026,nucleus,true);
  drawHalf(1);
  p.label([radius,amplitude+.08,0],'Spoj');
}

function drawNickelCrystal(p){
  const atoms=electronCrystal.atoms.map(atom=>{
    const xyz=atom.map(value=>value*.43);
    return {xyz,depth:p.proj(xyz)[2]};
  }).sort((a,b)=>a.depth-b.depth);
  const colors=['#8fb7cc','#6b9fb9','#4d8dad','#2c789f','#1f638d'];
  const min=atoms[0].depth,range=atoms.at(-1).depth-min||1;
  for(const {xyz,depth} of atoms){
    const band=Math.min(4,Math.floor(5*(depth-min)/range));
    p.dot(xyz,.014+.0025*band,colors[band],band>1);
  }
}

function electronChart(svg,series,min,max,ymin,ymax){
  const p=electronVector(svg),{w,h,polyline,rect,disk,gradient}=p;
  const left=85,right=Math.max(left+1,w-23),top=24,bottom=Math.max(top+1,h-40);
  const X=x=>left+(right-left)*(x-min)/(max-min||1),Y=y=>bottom-(bottom-top)*(y-ymin)/(ymax-ymin||1);
  const paper=gradient('linearGradient','x2="0" y2="1"',[[0,'#ffffff'],[1,'#f0f7fb']]);
  rect(left,top,right-left,bottom-top,paper,'none',4);
  for(let j=0;j<=4;j++){
    const x=left+(right-left)*j/4,y=top+(bottom-top)*j/4;
    polyline([[left,y],[right,y]],'#dae6ee',1);polyline([[x,top],[x,bottom]],'#dae6ee',1);
  }
  polyline([[left,top],[left,bottom],[right,bottom]],'#809eaf',1.1);
  const clip=p.definition('clipPath','', '<rect x="'+left+'" y="'+top+'" width="'+(right-left)+'" height="'+(bottom-top)+'"/>');
  p.layers.push('<g clip-path="url(#'+clip+')">');
  for(const {points,color,bar,width=4,binWidth,area=false,marker=false,strokeWidth=2.1,dash=''} of series){
    const zero=Y(Math.max(ymin,Math.min(ymax,0)));
    if(bar){
      const barWidth=binWidth?Math.max(1,X(min+binWidth)-X(min)-2):width;
      for(const [x,y] of points){const py=Y(y);rect(X(x)-barWidth/2,Math.min(py,zero),barWidth,Math.abs(zero-py),color);}
    }
    else if(marker){
      for(const [x,y] of points)disk(X(x),Y(y),4.3,color,'#ffffff',1.4);
    }else if(points.length>1){
      const vertices=points.map(([x,y])=>[X(x),Y(y)]);
      if(area){
        const fill=gradient('linearGradient','x2="0" y2="1"',[[0,color+'3d'],[1,color+'03']]);
        polyline([[vertices[0][0],zero],...vertices,[vertices.at(-1)[0],zero]],'none',0,fill);
      }
      polyline(vertices,color,strokeWidth,'none',dash);
    }
  }
  p.layers.push('</g>');p.finish();
  return {left,right,top,bottom};
}

const electronCrystal=(()=>{
  const atoms=[],a=.3524;
  for(let i=-2;i<2;i++)for(let j=-2;j<2;j++)for(let k=-2;k<2;k++)for(const [u,v,w] of [[0,0,0],[.5,.5,0],[.5,0,.5],[0,.5,.5]]){
    const x=i+u,y=j+v,z=k+w;
    atoms.push([a*(x-y)/Math.sqrt(2),a*(x+y+z)/Math.sqrt(3),a*(x+y-2*z)/Math.sqrt(6)]);
  }
  function intensity(lambda,det){
    const rad=det*Math.PI/180,K=2*Math.PI/lambda,qx=K*Math.sin(rad),qy=K*(Math.cos(rad)+1);
    let re=0,im=0;for(const [x,y] of atoms){const phase=qx*x+qy*y;re+=Math.cos(phase);im+=Math.sin(phase);}return (re*re+im*im)/atoms.length**2;
  }
  function diffraction(voltage){
    const lambda=ElectronPhysics.h/ElectronPhysics.momentum(voltage)*1e9;
    const samples=Array.from({length:1701},(_,i)=>[i/20,intensity(lambda,i/20)]);
    const [peak,maximum]=samples.reduce((best,point)=>point[1]>best[1]?point:best);
    const points=samples.map(([angle,signal])=>[angle,signal/maximum]);
    const targets=[peak,...points.filter(([,y],i)=>i>0&&i<points.length-1&&y>.08&&y>points[i-1][1]&&y>=points[i+1][1]).map(([angle])=>angle)];
    return {lambda,peak,points,targets,signal:angle=>intensity(lambda,angle)/maximum};
  }
  return {atoms,diffraction};
})();
