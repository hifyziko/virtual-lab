(()=>{
  const M=window.MagnetizedEncounter,$=id=>document.getElementById(id);
  const tracks=M.cases.map(params=>M.orbit(...params)),colors=['#266fa5','#a24b34','#008070'];
  // The displayed clock starts during the flight. Distant pixels receive radiation
  // emitted earlier, so integrate the same initial state backwards for the field.
  const past=M.orbit(...M.cases[0],-M.dt,8*M.steps);
  const priorSteps=past.length-1;
  const fieldTrack=past.slice(1).reverse().concat(tracks[0]);
  const reference=M.reference(...M.cases[0]);
  const peak=Math.max(...tracks.map(track=>Math.max(...track.map(p=>p.power))));
  const fullDuration=M.steps*M.dt*M.ps;
  const filmDuration=26;
  let simple=true,duration=filmDuration;
  let time=0,frame=0,last=null;
  let azimuth=Math.PI/2,elevation=0;
  let detector=[1,0,0], signals=[];
  const style=window.HiFyzikoParticleStyle;
  let particles;
  try{particles=new window.HiFyzikoNucleusView($('particles'),{supersample:2});}catch{}
  function updateDetector(){
    signals=tracks.map(track=>track.map((p,k)=>{
      const along=p.x*detector[0]+p.y*detector[1]+p.z*detector[2];
      // Reduced arrival time at a distant detector, t_obs - R/c, in ps.
      return {t:M.ps*(k*M.dt-along*M.v0/299792458),s:p.power/peak*Math.max(0,1-(along/p.r)**2)};
    }));
  }
  updateDetector();
  // Both views sample a plane through the moving electron, so retarded wave fronts stay resolved.
  const slices=Array.from({length:2},()=>{
    const canvas=document.createElement('canvas');
    return {canvas,ctx:canvas.getContext('2d'),image:null,key:''};
  });
  const minRadius=Math.min(...tracks[0].map(p=>p.r));
  // Locations and emission times illustrate separate encounters in a poloidal section.
  let seed=21471;
  function random(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;}
  function sectionPoint(angle,r){
    return [r*Math.cos(angle+.32*r*Math.sin(angle)),1.48*r*Math.sin(angle)];
  }
  const flashes=Array.from({length:115},(_,n)=>({
    point:sectionPoint(random()*2*Math.PI,Math.sqrt(random())*.96),
    start:12+n*.12+.45*random(), angle:random()*2*Math.PI, strength:.55+.45*random()
  }));
  function render(){
    const c=$('scene'),w=c.clientWidth,h=c.clientHeight;
    if(!w||!h)return;
    const dpr=Math.min(3,c.getBoundingClientRect().width/w*devicePixelRatio);
    const cw=Math.round(w*dpr),ch=Math.round(h*dpr);
    if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}
    const g=c.getContext('2d');g.setTransform(cw/w,0,0,ch/h,0,0);
    g.fillStyle='#fff';g.fillRect(0,0,w,h);
    const items=[];
    function line(x,y,X,Y,color){g.strokeStyle=color;g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke();}
    function dot(x,y,r,color){g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,2*Math.PI);g.fill();}
    const i=Math.min(M.steps,Math.round(time/duration*M.steps));
    if(simple){
      const t=Math.min(9,time*1.125),track=tracks[0],n=Math.round(t/(M.dt*M.ps));
      // Stop the microscopic clock while the camera turns around the vertical axis.
      const turn=Math.min(1,Math.max(0,(time-8)/3));
      const angle=Math.PI*.5*(1-turn*turn*(3-2*turn));
      const side=Math.sin(angle),front=Math.cos(angle);
      const u=Math.min(1,Math.max(0,(time-12)/4)),zoom=u*u*(3-2*u);
      const ox=w*.5,oy=h*.49;
      g.font='16px Segoe UI';g.fillStyle='#24454c';
      g.fillText(zoom<.5?(turn===0?'Průlet elektronu · boční pohled':turn<1?'Natáčení do poloidálního řezu':'Průlet elektronu · čelní pohled'):'Poloidální průřez plazmatu',16,26);
      g.fillStyle='#356ac3';
      const bx=21,by=77,length=39*side;
      if(length>2){
        const tip=Math.min(8,length*.42);
        g.beginPath();g.moveTo(bx,by-1.3);g.lineTo(bx+length-tip,by-1.3);
        g.lineTo(bx+length-tip,by-tip*.5);g.lineTo(bx+length,by);
        g.lineTo(bx+length-tip,by+tip*.5);g.lineTo(bx+length-tip,by+1.3);
        g.lineTo(bx,by+1.3);g.closePath();g.fill();
      }
      if(front>.02){g.save();g.globalAlpha=front;g.beginPath();g.arc(bx,by,5,0,2*Math.PI);g.strokeStyle='#356ac3';g.lineWidth=1.4;g.stroke();dot(bx,by,1.7,'#356ac3');g.restore();}
      g.fillText(turn===1?'B   k pozorovateli':'B',bx+length+10,by+5);
      if(zoom>0){
        g.save();g.globalAlpha=zoom;
        const scale=Math.min(w*.43,h*.27)/Math.max(.015,zoom);
        const pos=([x,y])=>[ox+(x+.22)*scale,oy-(y-.08)*scale];
        g.beginPath();
        for(let k=0;k<=180;k++){
          const [x,y]=pos(sectionPoint(k*Math.PI/90,1));
          if(k)g.lineTo(x,y);else g.moveTo(x,y);
        }
        g.closePath();g.fillStyle='#eef6f3';g.fill();g.strokeStyle='#549086';g.lineWidth=2;g.stroke();
        for(const event of flashes){
          const age=time-event.start;if(age<0||age>1.4)continue;
          const [x,y]=pos(event.point),radius=scale*(.008+age*.34);
          g.globalAlpha=zoom*(1-age/1.4)*event.strength;
          dot(x,y,2.5,'#b57825');
          g.strokeStyle='#b57825';g.lineWidth=2;
          for(const angle of [event.angle,event.angle+Math.PI]){
            g.beginPath();g.arc(x,y,radius,angle-.55,angle+.55);g.stroke();
          }
        }
        g.restore();
        g.save();g.globalAlpha=zoom;g.strokeStyle='#287399';g.lineWidth=2;
        g.beginPath();g.arc(ox,oy,6,0,Math.PI*2);g.stroke();
        g.fillStyle='#245c78';g.fillText('Místo prvního průletu',ox+10,oy-8);
        g.fillStyle='#385453';g.fillText('Oblouky znázorňují šíření záření z jednotlivých průletů.',16,h-14);g.restore();
      }
      const pair=[];
      if(zoom<1){
        const scale=Math.min(w*.29,h*.31)*Math.pow(.014,zoom);
        // Model z follows the toroidal field toward the viewer. Model x and y span R and Z.
        const project=p=>[ox+scale*(front*p.x+side*p.z),oy-scale*p.y];
        g.save();g.globalAlpha=1-zoom;
        for(const [samples,color,dashed] of [[reference,'#78817c',true],[track,'#266fa5',false]]){
          g.setLineDash(dashed?[6,4]:[]);g.beginPath();g.strokeStyle=color;g.lineWidth=dashed?1.7:2.6;
          for(let k=0;k<=n;k++){const [x,y]=project(samples[k]);if(k)g.lineTo(x,y);else g.moveTo(x,y);}
          g.stroke();
        }
        g.setLineDash([]);
        const [x,y]=project(track[n]),size=1-zoom;
        pair.push({id:'deuteron',x:ox,y:oy,radius:15*size},{id:'electron',x,y,radius:12*size});
        g.fillStyle='#29434b';g.fillText('D⁺',ox-22,oy+22);g.fillText('e⁻',x+12,y-8);
        g.fillText('Plná čára – dráha elektronu u deuteronu',16,h-38);
        g.fillText('Přerušovaná čára – dráha pouze v magnetickém poli',16,h-15);
        g.fillText('Čas průletu '+t.toFixed(1).replace('.',',')+' ps',16,51);
        const graphWidth=Math.min(255,w*.34),left=w-graphWidth-20,base=113;
        g.fillStyle='#29434b';g.fillText('Výkon záření · rel. j.',left,27);
        g.lineWidth=1;
        for(const level of [0,.5,1])line(left,base-63*level,w-20,base-63*level,'#dce6e3');
        g.fillText('1',left-14,54);g.fillText('0',left-14,base+4);
        g.fillText('0',left,base+18);g.fillText('9 ps',w-50,base+18);
        g.beginPath();g.strokeStyle='#b57825';g.lineWidth=2;
        for(let k=0;k<=n;k++){
          const gx=left+graphWidth*k*M.dt*M.ps/9,gy=base-63*track[k].power/peak;
          if(k)g.lineTo(gx,gy);else g.moveTo(gx,gy);
        }
        g.stroke();dot(left+graphWidth*t/9,base-63*track[n].power/peak,3,'#b57825');
        const distance=100e-9/M.length*scale;
        if(zoom===0){line(w-30-distance,h-22,w-30,h-22,'#365763');g.fillText('100 nm',w-85,h-30);}
        if(!particles||particles.disposed)for(const item of pair)for(const [dx,dy,,type] of style.connected.atoms[item.id]){
          const kind=type<0?'e':type>0?'p':'n';
          dot(item.x+dx*item.radius,item.y+dy*item.radius,item.radius*style.radii[kind],'#'+style.colors[kind].toString(16).padStart(6,'0'));
        }
        g.restore();
      }
      if(particles&&!particles.disposed)particles.draw(w,h,t,pair);
      $('time').value=time;$('micro-value').textContent=Math.floor(time)+' s';
      $('play').textContent=frame?'Pozastavit':time>=duration?'Znovu přehrát':'Pokračovat';
      return;
    }
    for(const side of [true,false]){
      const offset=side?0:w/2;
      g.save();g.translate(offset,0);g.beginPath();g.rect(0,0,w/2,h*.66);g.clip();
      const azimuth=side?Math.PI/2:0;
    const ox=w*.25,oy=h*.35,mm=M.length*1000;
    const spanMm=10**(-Number($('zoom').value)),fieldScale=w*.5/spanMm,size=fieldScale*mm;
    const ca=Math.cos(azimuth),sa=Math.sin(azimuth),ce=Math.cos(elevation),se=Math.sin(elevation);
    const project=p=>[ox+size*(ca*p.x+sa*p.z),oy-size*(ce*p.y-se*(sa*p.x-ca*p.z))];
    g.font='15px Segoe UI';
    function directionArrow(v,color,name){
      const [x,y]=project({x:.48*v[0],y:.48*v[1],z:.48*v[2]});
      const dx=x-ox,dy=y-oy,len=Math.hypot(dx,dy);g.fillStyle=color;
      if(len>5){g.save();g.translate(ox,oy);g.rotate(Math.atan2(dy,dx));g.beginPath();
        g.moveTo(0,-1);g.lineTo(len-5,-1);g.lineTo(len-5,-3);g.lineTo(len,0);
        g.lineTo(len-5,3);g.lineTo(len-5,1);g.lineTo(0,1);g.closePath();g.fill();g.restore();}
      g.fillText(name,x+5,y+(len>5?-5:22));
    }

    // Nonrelativistic acceleration field at the retarded position of the electron.
    // Keep only the acceleration caused by the deuteron, as in the detector plot.
    function radiation(nx,ny,nz,r,intensity){
      const X=nx*r,Y=ny*r,Z=nz*r;
      let distance=r,dx,dy,dz,p;
      for(let j=0;j<3;j++){
        const k=(time-distance/.299792458)/(M.dt*M.ps);
        if(k < -priorSteps || k>M.steps)return 0;
        const t=k+priorSteps,n=Math.floor(t),f=t-n,a=fieldTrack[n],b=fieldTrack[Math.min(fieldTrack.length-1,n+1)];
        p={x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,z:a.z+(b.z-a.z)*f};
        dx=X-mm*p.x;dy=Y-mm*p.y;dz=Z-mm*p.z;
        distance=Math.sqrt(dx*dx+dy*dy+dz*dz);
      }
      if(distance===0)return 0;
      nx=dx/distance;ny=dy/distance;nz=dz/distance;
      const dot=nx*p.x+ny*p.y+nz*p.z,rr=p.x*p.x+p.y*p.y+p.z*p.z;
      const factor=minRadius**2/(distance*rr*Math.sqrt(rr));
      return intensity?Math.max(0,rr-dot*dot)*factor*factor:(ny*dot-p.y)*factor;
    }

    const slice=slices[side?0:1];
    const width=w/2,height=h*.66;
    const density=Math.min(1,360/Math.max(width,height));
    const cols=Math.max(1,Math.round(width*density)),rows=Math.max(1,Math.round(height*density));
    const key=[time,width,height,fieldScale].join(',');
    if(slice.key!==key){
      if(!slice.image||slice.canvas.width!==cols||slice.canvas.height!==rows){
        slice.canvas.width=cols;slice.canvas.height=rows;slice.image=slice.ctx.createImageData(cols,rows);
      }
      const rgba=slice.image.data;

      for(let j=0;j<rows;j++)for(let k=0;k<cols;k++){
        const dx=(k+.5)*width/cols-ox,dy=oy-(j+.5)*height/rows;
        const pixels=Math.hypot(dx,dy),r=pixels/fieldScale;

        const u=pixels?dx/pixels:0,v=pixels?dy/pixels:0;
        const field=radiation(side?0:u,v,side?u:0,r,false);
        // E_rad varies as 1/R. Use the same gain in both panels at each zoom.
        const gain=350*Math.min(1,spanMm/2);
        const amplitude=Math.asinh(gain*Math.abs(field));
        const contrast=amplitude/(amplitude+1.5);
        const end=field<0?[22,65,173]:[189,37,31],index=4*(j*cols+k);
        for(let channel=0;channel<3;channel++)rgba[index+channel]=255+(end[channel]-255)*contrast;
        rgba[index+3]=255;
      }
      slice.ctx.putImageData(slice.image,0,0);slice.key=key;
    }
    const opacity=1-Number($('opacity').value)/100;
    g.save();g.globalAlpha=opacity;g.drawImage(slice.canvas,0,0,width,height);g.restore();
    for(let j=0;j<12;j++){
      const angle=2*Math.PI*j/12,ny=Math.sin(angle);
      const nx=side?0:Math.cos(angle),nz=side?Math.cos(angle):0;
      let strongest=0,rr=1;
      for(let r=.16;r<=time*.299793+.02;r+=.12){
        const q=radiation(nx,ny,nz,r,true);if(q>strongest){strongest=q;rr=r;}
      }
      if(strongest<1e-5)continue;
      const dx=ca*nx+sa*nz,dy=-(ce*ny-se*(sa*nx-ca*nz)),len=Math.hypot(dx,dy)*8;
      if(len<3)continue;
      const ax=ox+rr*fieldScale*dx,ay=oy+rr*fieldScale*dy;g.save();g.translate(ax,ay);g.rotate(Math.atan2(dy,dx));
      g.globalAlpha=.46*opacity;g.fillStyle='#34555a';g.beginPath();g.moveTo(0,-.55);g.lineTo(len-2.7,-.55);g.lineTo(len-2.7,-1.7);
      g.lineTo(len,0);g.lineTo(len-2.7,1.7);g.lineTo(len-2.7,.55);g.lineTo(0,.55);g.closePath();g.fill();g.restore();
    }
    g.fillStyle='#183741';g.font='600 17px Segoe UI';g.fillText(side?'Pohled kolmo k poli':'Pohled podél pole',12,24);
    g.font='13px Segoe UI';g.fillStyle='#475965';const emitter=tracks[0][i];
    const [sx,sy]=project(emitter),resolved=Math.hypot(sx-ox,sy-oy)>16;
    const units=spanMm>=1?1:spanMm>=.001?1000:1e6,target=w*.07/fieldScale*units;
    const decade=10**Math.floor(Math.log10(target)),n=decade*(target/decade>=5?5:target/decade>=2?2:1);
    g.fillRect(w*.5-12-n/units*fieldScale,37,n/units*fieldScale,2);g.textAlign='right';
    g.fillText(Number(n.toPrecision(2)).toLocaleString('cs-CZ')+' '+(units===1?'mm':units===1000?'µm':'nm'),w*.5-12,32);g.textAlign='left';
    if(side && size>20)directionArrow([0,0,1],style.fields.magnetic,'B');
    else{g.fillStyle=style.fields.magnetic;g.fillText(side?'B →':'⊙ B',12,46);}
    if(resolved)items.push({id:'deuteron',x:ox+offset,y:oy,radius:15,depth:0});
    g.fillStyle='#34464a';if(resolved)g.fillText('D⁺',ox-14,oy+24);
    tracks.forEach((track,j)=>{
      g.save();g.beginPath();g.rect(0,40,w/2,h*.65-40);g.clip();
      const first=Math.max(0,i-1600);
      g.setLineDash([6,4]);g.strokeStyle='#707575';g.lineWidth=1.7;g.beginPath();
      for(let k=first;k<=i;k++){const [x,y]=project(reference[k]);if(k===first)g.moveTo(x,y);else g.lineTo(x,y);}
      g.stroke();g.setLineDash([]);
      const [rx,ry]=project(reference[i]),[ex,ey]=project(track[i]);
      line(rx,ry,ex,ey,'#a96923');
      g.beginPath();g.arc(rx,ry,3.5,0,2*Math.PI);g.fillStyle='white';g.fill();g.strokeStyle='#656b70';g.stroke();
      const color=colors[j];g.lineWidth=2;g.strokeStyle=color;g.beginPath();
      for(let k=Math.max(0,i-1600);k<=i;k++){const [x,y]=project(track[k]);if(k===Math.max(0,i-1600))g.moveTo(x,y);else g.lineTo(x,y);}
      g.stroke();const [x,y]=project(track[i]);if(x>8&&x<w/2-8&&y>40&&y<h*.65-8)items.push({id:'electron',x:x+offset,y,radius:14,depth:track[i].x*sa*ce+track[i].y*se-track[i].z*ca*ce});g.fillStyle=color;g.fillText(resolved?'e⁻':'e⁻ a D⁺',x+8,y-8);g.restore();
    });
    const ref=reference[i];const delta=Math.hypot(ref.x-emitter.x,ref.y-emitter.y,ref.z-emitter.z)*M.length*1e9;
    if(side){g.fillStyle="#87581c";g.fillText("Vychýlení oproti pohybu bez deuteronu: "+delta.toFixed(1).replace(".",",")+" nm",12,h*.64);}
    g.restore();
    }
    g.font='14px Segoe UI';g.fillStyle='#264651';
    const legendY=h*.682;
    line(12,legendY,42,legendY,'#266fa5');g.fillText('Dráha s deuteronem',49,legendY+4);
    g.setLineDash([6,4]);line(w*.32,legendY,w*.32+30,legendY,'#707575');g.setLineDash([]);
    g.fillText('Dráha pouze v magnetickém poli',w*.32+37,legendY+4);
    g.fillStyle='#1641ad';g.fillText('−',w*.76,legendY+4);g.fillStyle='#304751';g.fillText('Eᵧ',w*.76+15,legendY+4);
    g.fillStyle='#bd251f';g.fillText('+',w*.76+39,legendY+4);
    g.lineWidth=1;line(w/2,10,w/2,h*.65,'#d4dedb');
    const left=54,right=w-18,top=h*.78,bottom=h-32;
    g.fillStyle='#29434b';
    for(const q of [0,.5,1]){
      g.setLineDash([3,3]);const y=bottom-q*(bottom-top);line(left,y,right,y,'#cfddd8');
      g.setLineDash([]);g.fillStyle='#36515a';g.fillText(String(q).replace('.',','),left-32,y+4);
    }
    for(let t=0;t<duration;t+=5){
      const x=left+(right-left)*t/duration;g.setLineDash([3,3]);line(x,top,x,bottom,'#d0dfe4');
      g.setLineDash([]);g.fillText(String(t),x-4,bottom+18);
    }
    line(left,bottom,right+5,bottom,'#59717c');line(left,bottom,left,top-5,'#59717c');
    for(const [x,y,a] of [[right+6,bottom,0],[left,top-7,-Math.PI/2]]){
      g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#59717c';g.beginPath();g.moveTo(0,0);g.lineTo(-6,-3);g.lineTo(-6,3);g.closePath();g.fill();g.restore();
    }
    tracks.forEach((track,j)=>{const color=colors[j];
      g.lineWidth=1.5;g.strokeStyle="#9eb9cb";g.beginPath();signals[j].forEach((p,k)=>{const x=left+(right-left)*p.t/duration,y=bottom-(bottom-top)*p.s;if(k)g.lineTo(x,y);else g.moveTo(x,y);});g.stroke();
      g.save();g.beginPath();g.rect(left,top,(right-left)*time/duration,bottom-top+2);g.clip();g.beginPath();signals[j].forEach((p,k)=>{const x=left+(right-left)*p.t/duration,y=bottom-(bottom-top)*p.s;if(k)g.lineTo(x,y);else g.moveTo(x,y);});g.lineWidth=2.5;g.strokeStyle=color;g.stroke();g.restore();const data=signals[j];let lo=0,hi=M.steps;
      while(hi-lo>1){const mid=(lo+hi)>>1;if(data[mid].t<time)lo=mid;else hi=mid;}
      if(time>=data[0].t && time<=data[hi].t){
        const f=(time-data[lo].t)/(data[hi].t-data[lo].t);
        dot(left+(right-left)*time/duration,bottom-(bottom-top)*(data[lo].s+f*(data[hi].s-data[lo].s)),4,color);
      }
    });
    items.sort((a,b)=>a.depth-b.depth);
    if(particles&&!particles.disposed)particles.draw(w,h,time,items);
    else for(const item of items)for(const [dx,dy,,type] of style.connected.atoms[item.id]){
      const kind=type<0?'e':type>0?'p':'n';
      dot(item.x+dx*item.radius,item.y+dy*item.radius,item.radius*style.radii[kind],'#'+style.colors[kind].toString(16).padStart(6,'0'));
    }
    g.lineWidth=1;const cursor=left+(right-left)*i/M.steps;g.setLineDash([3,3]);line(cursor,top,cursor,bottom,'#627782');g.setLineDash([]);
    g.fillStyle='#36515a';g.fillText('t [ps]',right-24,bottom+20);
    $('time').value=time;$('micro-value').textContent=time.toFixed(2).replace('.',',')+' ps';
    $('play').textContent=frame?'Pozastavit':time>=duration?'Znovu přehrát':'Přehrát průlet';
  }
  function pause(){cancelAnimationFrame(frame);frame=0;last=null;}
  function tick(stamp){if(last!==null)time=Math.min(duration,time+Math.min(100,stamp-last)*(simple ? .001 : .002));last=stamp;
    if(time>=duration)pause();else frame=requestAnimationFrame(tick);render();}
  $('play').onclick=()=>{if(frame)pause();else{if(time>=duration)time=0;frame=requestAnimationFrame(tick);}render();};
  $('step').onclick=()=>{pause();time=time>=duration?0:Math.min(duration,time+.1);render();};
  $('time').min=0;$('time').max=duration;$('time').oninput=()=>{pause();time=Number($('time').value);render();};
  $('zoom').oninput=render;
  function wheelZoom(event){
    const rect=$('scene').getBoundingClientRect();
    if(simple||event.clientY>rect.top+rect.height*.66||!event.deltaY)return;
    event.preventDefault();
    const zoom=$('zoom'),unit=event.deltaMode===1?16:event.deltaMode===2?rect.height:1;
    zoom.value=Math.max(Number(zoom.min),Math.min(Number(zoom.max),Number(zoom.value)-event.deltaY*unit*.0018));
    render();
  }
  $('scene').addEventListener('wheel',wheelZoom,{passive:false});
  $('opacity').oninput=render;
  $('detail').onclick=()=>{
    pause();simple=!simple;duration=simple?filmDuration:fullDuration;time=0;
    $('time').max=duration;$('detail').textContent=simple?'Zobrazit pole':'Zpět k ukázce';
    for(const id of ['zoom','opacity'])$(id).parentElement.style.display=simple?'none':'';
    $('timeline-label').textContent=simple?'Průběh ukázky':'Čas průletu';$('step').hidden=simple;
    $('field-caption').hidden=simple;if(simple)frame=requestAnimationFrame(tick);
    render();
  };
  $('help').onclick=()=>$('guide').showModal();
  document.querySelectorAll('[data-tex]').forEach(n=>katex.render(n.dataset.tex,n));
  const observer=new ResizeObserver(render);observer.observe($('scene'));addEventListener('resize',render);
  window.HiFyzikoFusionDispose=()=>{pause();$('scene').removeEventListener('wheel',wheelZoom);particles?.dispose();observer.disconnect();removeEventListener('resize',render);};frame=requestAnimationFrame(tick);render();
})();
