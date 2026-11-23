(()=>{'use strict';
const $=id=>document.getElementById(id),M=Conductivity,S=HiFyzikoParticleStyle;
let model=new M.Model(),playing=true,disposed=false,last=0,raf=0;
const reference=M.trajectory(1),referenceEnd=reference.findIndex(M.flightEnded);
const referencePoints=reference.slice(0,referenceEnd<0?undefined:referenceEnd+1).map(p=>[p.x,p.y]);
const heating=$('heating');
const color=n=>'#'+n.toString(16).padStart(6,'0');
function tex(node,value){if(node.dataset.rendered===value)return;node.dataset.rendered=value;katex.render(value,node,{throwOnError:true});}
const dec=(v,d=2)=>v.toFixed(d).replace('.', '{,}');
document.querySelectorAll('[data-tex]').forEach(n=>tex(n,n.dataset.tex));
// Same radial sphere shading as the existing Plyn a plazma canvas renderer.
function sphere(ctx,x,y,r,c,edge){const fill=ctx.createRadialGradient(x-r*.3,y-r*.4,0,x,y,r);fill.addColorStop(0,'#ffffff');fill.addColorStop(.3,c);fill.addColorStop(1,edge);ctx.save();ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();ctx.restore();}
function surface(id){const canvas=$(id),w=canvas.clientWidth||640,h=canvas.clientHeight||240,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);return {ctx,w,h};}
function line(ctx,points,X,Y,color,width=1.2){
 if(points.length<2)return;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=width;
 ctx.beginPath();ctx.moveTo(X(points[0][0]),Y(points[0][1]));
 const stride=Math.max(1,Math.floor(points.length/600));
 for(let i=1;i<points.length-1;i+=stride)ctx.lineTo(X(points[i][0]),Y(points[i][1]));
 const end=points.at(-1);
 ctx.lineTo(X(end[0]),Y(end[1]));ctx.stroke();ctx.restore();
}
function arrow(ctx,x,y,dx,dy,c){const l=Math.hypot(dx,dy);if(l<.1)return;const head=Math.min(8,l*.45),half=Math.min(4,l*.2);ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,-1);ctx.lineTo(l-head,-1);ctx.lineTo(l-head,-half);ctx.lineTo(l,0);ctx.lineTo(l-head,half);ctx.lineTo(l-head,1);ctx.lineTo(0,1);ctx.closePath();ctx.fill();ctx.restore();}
// Retain samples at scattering turns and taper the stroke without bending its centerline.
function tailPieces(points,X,Y){
 if(points.length<2)return [];
 const now=points.at(-1)[2],parts=[];
 let start=points.length-1;
 while(start>0&&points[start][2]>now-.72)start--;
 let from=[X(points[start][0]),Y(points[start][1])];
 for(let i=start+1;i<points.length;i++){
  const p=points[i],q=points[i+1];
  if(q&&i%4!==0){
   const before=points[i-1],ax=p[0]-before[0],ay=p[1]-before[1],bx=q[0]-p[0],by=q[1]-p[1];
   if(ax*bx+ay*by>=.997*Math.hypot(ax,ay)*Math.hypot(bx,by))continue;
  }
  const to=[X(p[0]),Y(p[1])],weight=Math.max(0,1-(now-p[2])/.72)**2;
  parts.push({from,to,width:.3+4.6*weight,alpha:.8*weight});
  from=to;
 }
 return parts;
}

function fitFlight(w,h,[minX,maxX,minY,maxY],upward=false){
 const padX=Math.min(20,w/5),padY=Math.min(22,h/5);
 const scale=Math.min((w-2*padX)/(maxX-minX),(h-2*padY)/(maxY-minY));
 const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2;
 const X=x=>w/2+(x-centerX)*scale;
 const direction=upward?-1:1;
 const Y=y=>h/2+direction*(y-centerY)*scale;
 return {X,Y,scale};
}

function vectorArrow(x,y,dx,dy,color){const l=Math.hypot(dx,dy);if(l<.1)return '';const head=Math.min(8,l*.45);return '<path d="M0 -1 L'+(l-head)+' -1 L'+(l-head)+' -4 L'+l+' 0 L'+(l-head)+' 4 L'+(l-head)+' 1 L0 1Z" fill="'+color+'" transform="translate('+x+' '+y+') rotate('+(Math.atan2(dy,dx)*180/Math.PI)+')"/>';}

const ELECTRON_RADIUS=2.6, SELECTED_RADIUS=4.4;
const ELECTRON_FILL='#126bc3',ELECTRON_EDGE='#154776';
function particleGradient(id,fill,edge){
 return '<radialGradient id="'+id+'" cx="35%" cy="30%" r="70%"><stop stop-color="#fff"/>'+
  '<stop offset=".3" stop-color="'+fill+'"/><stop offset="1" stop-color="'+edge+'"/></radialGradient>';
}
function metalConnections(lattice,X,Y){
 const {width,height,columns,rows}=M.metalCell,nodes=lattice.nodes;
 let path='';
 for(let i=0;i<nodes.length;i++){
  const n=nodes[i],row=Math.floor(i/columns),col=i%columns;
  const right=nodes[row*columns+(col+1)%columns],down=nodes[((row+1)%rows)*columns+col];
  const start='M'+X(n.x)+' '+Y(n.y)+'L';
  const nextX=right.x+(col===columns-1?width:0),nextY=down.y+(row===rows-1?height:0);
  path+=start+X(nextX)+' '+Y(right.y)+start+X(down.x)+' '+Y(nextY);
 }
 return path;
}

function repeatedCells(id,tileWidth,tileHeight,left,top,w,h,margin){
 let copies='';
 const firstCol=Math.floor((-margin-left)/tileWidth),lastCol=Math.floor((w+margin-left)/tileWidth);
 const firstRow=Math.floor((-margin-top)/tileHeight),lastRow=Math.floor((h+margin-top)/tileHeight);
 for(let row=firstRow;row<=lastRow;row++)for(let col=firstCol;col<=lastCol;col++){
  copies+='<use href="#'+id+'" x="'+col*tileWidth+'" y="'+row*tileHeight+'"/>';
 }
 return copies;
}
const metalZones=$('metalZones');
function metalVelocity(e){
 return [e.vx+model.drift.metal,e.vy];
}

function tailSvg(parts,id){
 if(!parts.length)return '';
 const left=[],right=[];
 const point=(x,y)=>x.toFixed(2)+' '+y.toFixed(2);
 for(let i=0;i<parts.length;i++){
  const {from,to,width}=parts[i],previousWidth=i?parts[i-1].width:.3;
  const dx=to[0]-from[0],dy=to[1]-from[1],diameter=2*(Math.hypot(dx,dy)||1);
  for(const [x,y,thickness] of [[...from,previousWidth],[...to,width]]){
   const halfWidth=thickness/diameter;
   left.push(point(x-dy*halfWidth,y+dx*halfWidth));
   right.push(point(x+dy*halfWidth,y-dx*halfWidth));
  }
 }
 const first=parts[0].from,last=parts.at(-1).to;
 const stops=[0,.25,.5,.75,1].map(t=>'<stop offset="'+t+'" stop-color="#b97939" stop-opacity="'+(.8*t*t)+'"/>').join('');
 return '<defs><linearGradient id="'+id+'" gradientUnits="userSpaceOnUse" x1="'+first[0]+'" y1="'+first[1]+'" x2="'+(last[0]+.001)+'" y2="'+last[1]+'">'+stops+'</linearGradient></defs><path d="M'+left.concat(right.reverse()).join('L')+'Z" fill="url(#'+id+')"/>';
}

// Kov: kratší a tlumenější stopy; žádné kreslené "rybičky" ani grafické vyhýbání.
function metalTail(points,X,Y,selected){
 if(points.length<2)return '';
 const duration=selected?.72:.40,now=points.at(-1)[2],skip=selected?3:8;
 let start=points.length-1,out='';
 while(start>0&&points[start][2]>now-duration)start--;
 for(let i=start+1;i<points.length;){
  const a=points[i-1],last=Math.min(i+skip-1,points.length-1),b=points[last];
  const alpha=Math.max(0,1-(now-b[2])/duration)**2*(selected?.72:.11);
  out+='<path d="M'+X(a[0]).toFixed(2)+' '+Y(a[1]).toFixed(2)+'L'+X(b[0]).toFixed(2)+' '+Y(b[1]).toFixed(2)+'" fill="none" stroke="#b97939" stroke-opacity="'+alpha.toFixed(3)+'" stroke-width="'+(selected?2:1.25)+'" stroke-linecap="round"/>';
  i=last+1;
 }
 return out;
}
function micro(kind){
 const svg=$(kind),w=svg.clientWidth||640,h=svg.clientHeight||240,sceneH=Math.max(40,h-64);
 const metal=kind==='metal',width=metal?M.metalCell.width:12,height=metal?M.metalCell.height:7;
 const scale=Math.min(w/width,sceneH/height);
 const sx=metal?scale:w/width,sy=metal?scale:sceneH/height;
 const tileWidth=width*sx,tileHeight=height*sy;
 const left=(w-tileWidth)/2,top=(sceneH-tileHeight)/2,X=x=>left+x*sx,Y=y=>top+y*sy;
 const defs=particleGradient(kind+'-e',ELECTRON_FILL,ELECTRON_EDGE)+
  particleGradient(kind+'-ion','#eb3026','#942b35')+particleGradient(kind+'-metal','#9d90b7','#6e6285');
 const ball=(x,y,r,id)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="url(#'+kind+'-'+id+')"/>';
 const center=(x,y,r,id,stroke)=>'<circle cx="'+x+'" cy="'+y+'" r="'+(r+2)+'" fill="none" stroke="'+stroke+'" stroke-opacity=".32"/>'+ball(x,y,r,id);
 let mesh='',particles='';
 if(metal){
  for(const n of model.metalLattice.nodes){
   const ex=X(n.equilibriumX),ey=Y(n.equilibriumY);
   particles+='<circle cx="'+ex+'" cy="'+ey+'" r="1.4" fill="#a99ab9" fill-opacity=".28"/>';
   if(metalZones.checked&&n.range>0)mesh+='<circle class="scattering-zone" cx="'+X(n.x)+'" cy="'+Y(n.y)+'" r="'+(n.range*scale)+'" fill="none" stroke="#b57825" stroke-opacity=".28"/>';
   particles+=center(X(n.x),Y(n.y),2.6,'metal','#6e6285');
  }
 }else{
  for(const ion of model.ions)particles+=center(X(ion.x),Y(ion.y),3.2,'ion','#942b35');
 }

 const electrons=model.groups[kind].map((e,i)=>{
  const x=X(e.x),y=Y(e.y);
  const trail=metal?metalTail(e.trail,X,Y,i===0):tailSvg(tailPieces(e.trail,X,Y),kind+'-tail-'+i);
  return trail+ball(x,y,ELECTRON_RADIUS,'e');
 }).join('');
 const selected=model.groups[kind][0],x=X(selected.x),y=Y(selected.y);
 const [vx,vy]=kind==='metal'?metalVelocity(selected):[selected.vx,selected.vy];
 const vxScreen=vx*sx,vyScreen=vy*sy,vlen=Math.hypot(vxScreen,vyScreen)||1;
 let events='<circle cx="'+x+'" cy="'+y+'" r="'+SELECTED_RADIUS+'" fill="none" stroke="#126bc3" stroke-width=".8"/>'+
  vectorArrow(x,y,32*vxScreen/vlen,32*vyScreen/vlen,'#187767');
 if(kind==='metal'){
  const f=M.metalDisturbance(selected.x,selected.y,model.metalLattice);
  const fx=f.fx*sx,fy=f.fy*sy,flen=Math.hypot(fx,fy);
  if(flen>.1)events+=vectorArrow(x,y,Math.min(29,10+flen*.12)*fx/flen,Math.min(29,10+flen*.12)*fy/flen,'#b57825');
 }
 if(kind==='plasma'){
  const force=M.plasmaForce(selected,model.ions,model.groups.plasma),fx=force.ax*sx,fy=force.ay*sy,flen=Math.hypot(fx,fy);
  if(flen>1e-12)events+=vectorArrow(x,y,24*fx/flen,24*fy/flen,S.fields.electric);
 }
 const phase=((model.driftDistance[kind]*500)%80+80)%80;let drift='';
 for(let x=-80+phase;x<w+80;x+=80)drift+=vectorArrow(x+12,h-16,-24,0,color(S.colors.e));
 let scene=mesh+particles+electrons,tile='';
 if(metal){
  const links=metalConnections(model.metalLattice,X,Y);
  tile='<g id="metal-cell"><path class="metal-lattice-links" d="'+links+'" fill="none" stroke="#8f829d" stroke-opacity=".24" stroke-width=".95"/>'+scene+'</g>';
  const margin=Math.max(...model.metalLattice.nodes.map(n=>n.range*scale))+6;
  // Reuse the periodic cell on each side. Only the viewport clips the copies.
  scene=repeatedCells('metal-cell',tileWidth,tileHeight,left,top,w,sceneH,margin);
 }
 svg.setAttribute('viewBox','0 0 '+w+' '+h);
 svg.innerHTML='<defs>'+defs+tile+'<clipPath id="'+kind+'-clip"><rect width="'+w+'" height="'+sceneH+'"/></clipPath></defs><g clip-path="url(#'+kind+'-clip)">'+scene+events+'</g><g>'+drift+'</g>';
 tex($(kind+'Drift'),String.raw`|\mathbf v_d|/v_{d0}=`+dec(Math.abs(model.drift[kind])/.014));
}

function detail(){
 const svg=$('metalDetail'),w=svg.clientWidth||640,h=svg.clientHeight||180;
 const e=model.metalProbe.e,lattice=model.metalLattice,x=w/2,y=h/2;
 const length=.39*Math.min(w,h);
 const scale=Math.min(48,Math.min(w,h)/3.5),{width,height}=M.metalCell;
 const left=x-e.x*scale,top=y-e.y*scale;
 const links=metalConnections(lattice,px=>left+px*scale,py=>top+py*scale);
 const background='<path id="probe-lattice-links" d="'+links+'" fill="none" stroke="#8f829d" stroke-opacity=".18" stroke-width="1"/>';
 const copies=repeatedCells('probe-lattice-links',width*scale,height*scale,left,top,w,h,scale);
 const f=M.metalDisturbance(e.x,e.y,lattice);
 const speed=Math.hypot(e.vx,e.vy),fl=Math.hypot(f.fx,f.fy);
 const velocity=speed?vectorArrow(x,y,length*e.vx/speed,length*e.vy/speed,'#187767'):'';
 const force=fl>0?vectorArrow(x,y,.72*length*f.fx/fl,.72*length*f.fy/fl,S.fields.electric):'';
 let arc='',readout=fl===0?String.raw`\mathbf F_m=\mathbf 0`:String.raw`\text{—}`;
 if(velocity&&force){
  const angle=Math.atan2(e.vx*f.fy-e.vy*f.fx,e.vx*f.fx+e.vy*f.fy);
  const degrees=Math.round(Math.abs(angle)*180/Math.PI);
  readout=degrees+String.raw`^\circ`;
  if(degrees>0){
   const radius=Math.min(34,.48*length);
   arc='<path class="probe-angle" d="M '+(x+radius*e.vx/speed)+' '+(y+radius*e.vy/speed)+
    ' A '+radius+' '+radius+' 0 0 '+(angle>0?1:0)+' '+(x+radius*f.fx/fl)+' '+(y+radius*f.fy/fl)+
    '" fill="none" stroke="#617784" stroke-width="1.4"/>';
  }
 }
 svg.setAttribute('viewBox','0 0 '+w+' '+h);
 svg.innerHTML='<defs>'+particleGradient('probe-e',ELECTRON_FILL,ELECTRON_EDGE)+background+'</defs>'+copies+arc+velocity+force+
  '<circle class="probe-electron" cx="'+x+'" cy="'+y+'" r="9" fill="url(#probe-e)"/>';
 const label=$('probeAngleLabel'),caption=fl===0?'Síla od mřížky':'Úhel mezi směry';
 if(label.textContent!==caption)label.textContent=caption;
 tex($('probeAngle'),readout);
}
function flight(){
 const {ctx,w,h}=surface('flight');
 const {X,Y}=fitFlight(w,h,[-12,12.1,-5.1,1.5],true);
 const p=model.flight,x=X(p.x),y=Y(p.y);
 ctx.save();
 ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
 ctx.setLineDash([4,4]);line(ctx,referencePoints,X,Y,'#a7adb4');ctx.setLineDash([]);
 sphere(ctx,X(0),Y(0),3.2,color(S.colors.p),'#942b35');
 line(ctx,model.flightTrail,X,Y,'#b97939',2.4);
 sphere(ctx,x,y,ELECTRON_RADIUS,color(S.colors.e),'#154776');
 const r=Math.hypot(p.x,p.y);
 if(r>0&&r<4)arrow(ctx,x,y,-p.x/r*25,p.y/r*25,S.fields.electric);
 ctx.restore();
 tex($('flightLabel'),String.raw`T_{e,\text{vstup}}=${dec(model.flightT,1)}\,\mathrm{keV}`);
}
function readouts(){const p=model.p;heating.style.setProperty('--heating-progress',(p.s*100)+'%');tex($('heatingValue'),String.raw`${Math.round(p.s*100)}\,\%`);tex($('metalT'),String.raw`T_m=${dec(p.metalK,0)}\,\mathrm K=${dec(p.metalC)}\,{}^\circ\mathrm C`);tex($('plasmaT'),String.raw`T_e=${dec(p.plasmaKeV,2)}\,\mathrm{keV}\approx${dec(p.plasmaK/1e6,1)}\times10^6\,\mathrm K`);
 for(const kind of ['metal','plasma']){const r=kind==='metal'?p.metalR:p.plasmaR;tex($(kind+'R'),String.raw`${kind==='metal'?'r_m':'r_p'}=${dec(r,r<.1?4:2)}`);tex($(kind+'J'),String.raw`J/J_0=${dec(1/r)}`);$(kind+'Bar').style.width=(r/2.5*100)+'%';}
}
function draw(){micro('metal');micro('plasma');detail();flight();}
metalZones.onchange=draw;
heating.oninput=()=>{model.setHeating(Number(heating.value)/100);readouts();draw();};
$('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Pozastavit':'Pokračovat';};
$('reset').onclick=()=>{model=new M.Model();heating.value='0';playing=true;$('play').textContent='Pozastavit';readouts();draw();};
$('help').onclick=()=>$('guide').showModal();
function frame(now){if(disposed)return;if(last&&playing&&!document.hidden)model.step(Math.min((now-last)/1000,.05));last=now;draw();raf=requestAnimationFrame(frame);}
window.HiFyzikoFusionDispose=()=>{disposed=true;cancelAnimationFrame(raf);};
readouts();draw();raf=requestAnimationFrame(frame);
})();
