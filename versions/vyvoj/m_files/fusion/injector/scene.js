/* Fixed longitudinal section and equatorial view. Both share the graph's x axis. */
const InjectorScene = (() => {
  const {grids,axis,dumpX,birthX,deflection}=InjectorModel;
  const electric=HiFyzikoParticleStyle.fields.electric, magnetic=HiFyzikoParticleStyle.fields.magnetic;
  const ink='#345463', steel='#8096a0', negative='#6855a2', neutral='#18786e', positive='#c36e36';
  const beamY=axis.y, tau=2*Math.PI;
  function line(c,pts,color,width=1,dash=[]){
    c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
    c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);
  }
  function dot(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,tau);c.fill();}
  function circle(c,x,y,r,color,width=1){
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,tau);c.stroke();
  }
  function plate(c,x,y,w,h,a='#e2eaec',b=steel){
    const g=c.createLinearGradient(x,y,x+w*.25,y+h);g.addColorStop(0,a);g.addColorStop(.4,'#f8fbfa');g.addColorStop(1,b);
    c.fillStyle=g;c.fillRect(x,y,w,h);c.strokeStyle=b;c.lineWidth=1;c.strokeRect(x,y,w,h);
  }
  function arrow(c,x,y,dx,dy,color){
    const length=Math.hypot(dx,dy),tip=Math.min(9,length*.4);
    c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));c.fillStyle=color;c.beginPath();
    for(const [i,p] of [[0,-1.2],[length-tip,-1.2],[length-tip,-4],[length,0],[length-tip,4],[length-tip,1.2],[0,1.2]].entries())
      i?c.lineTo(...p):c.moveTo(...p);
    c.closePath();c.fill();c.restore();
  }
  function label(c,text,x,y,color=ink,size=15,align='center'){
    c.fillStyle=color;c.font='600 '+size+'px "Segoe UI",sans-serif';c.textAlign=align;c.fillText(text,x,y);
  }
  function sphere(c,x,y,r,color){
    const g=c.createRadialGradient(x-r*.35,y-r*.42,r*.05,x,y,r);
    g.addColorStop(0,'#f8fcff');g.addColorStop(.36,color);g.addColorStop(1,'#263744');
    dot(c,x,y,r,g);
  }
  // The horizontal median plane of the project's ITER CAD assembly.
  function radialLimits(part){
    const hits=[];
    for(const loop of TokamakCAD.sections(part)){
      for(let i=1;i<loop.length;i++){
        const [a,b]=loop[i-1], [r,z]=loop[i];
        if((b<0)!==(z<0))hits.push(a-b*(r-a)/(z-b));
      }
    }
    return [Math.min(...hits),Math.max(...hits)];
  }
  const [vesselIn,vesselOut]=radialLimits('vessel'),[coilIn,coilOut]=radialLimits('tf');
  const coilAngles=TokamakCAD.data.parts.filter(p=>p.part==='tf').flatMap(p=>p.rotations.map(a=>(a+(p.nativeAngle||0))*Math.PI/180));
  function tokamak(c){
    const x=axis.tokamakX,y=beamY-axis.tangentRadius*axis.scale,s=axis.scale;
    c.save();c.translate(x,y);
    const ring=(r,w,col)=>circle(c,0,0,r*s,col,w*s);
    ring((vesselIn+vesselOut)/2,vesselOut-vesselIn,'#d2dce0');
    ring(vesselIn,.18,steel);ring(vesselOut,.18,steel);
    ring(6.2,4,'#e5cfe4');ring(6.2,3,'#e7bfdc');ring(6.2,1.6,'#dfabcd');
    for(const r of [4.7,5.6,6.5,7.5])ring(r,.07,magnetic);
    for(const a of coilAngles){
      c.save();c.rotate(a);c.globalAlpha=.58;plate(c,coilIn*s,-2,(coilOut-coilIn)*s,4);c.restore();
    }
    dot(c,0,0,coilIn*s,'#a7b4ba');circle(c,0,0,coilIn*s,'#627b88',1.4);c.restore();
  }
  function path(c,x0,x1,fn,col,w=2,dash=[]){
    const pts=[];for(let x=x0;x<x1;x+=2)pts.push([x,fn(x)]);pts.push([x1,fn(x1)]);
    line(c,pts,col,w,dash);
  }
  function background(c,gas){
    const y=beamY;
    c.fillStyle='#f9fbfa';c.fillRect(0,0,1320,270);
    tokamak(c);
    const stations=[[125,'Zdroj iontů',230],[400,'Urychlovací mřížky',510],[655,'Neutralizátor',739],[849,'Separátor',930],[990,'Kanál',1044],[1176,'Tokamak ITER',1300]];
    let left=18;
    for(const [x,title,right] of stations){
      if(title==='Tokamak ITER'){c.fillStyle='#f9fbfaf2';c.fillRect(x-70,6,140,27);}
      line(c,[[left,35],[right,35]],'#c9d7da');label(c,title,x,27,ink,19);left=right+8;
    }
    c.fillStyle='#edeaf2';c.fillRect(58,y-45,225,90);
    const glow=c.createRadialGradient(130,y,3,130,y,85);
    glow.addColorStop(0,'#bd8fcc7d');glow.addColorStop(1,'#f7eefa00');
    c.fillStyle=glow;c.fillRect(58,y-45,222,90);
    for(let i=0;i<46;i++){
      const px=68+(i*71)%200,py=y-35+(i*39)%70;
      dot(c,px,py,1.9,i%4===0?'#8d92af':'#b79bbe');
      if(i%3===0)dot(c,px+3.1,py+.8,1.7,'#bea9c5');
    }
    for(let side of [-1,1]){
      const edge=y+side*48;
      plate(c,58,edge-3,225,6);plate(c,28,y+side*10-2,30,4);
      for(let x=84;x<159;x+=11)plate(c,x,edge-8,5,16,'#dab796','#aa774d');
      plate(c,282,edge-4,248,7);
      for(let i=0;i<grids.length;i++){
        const gx=grids[i];plate(c,gx-2,side<0?edge:y+5,5,43,i===0?'#d5ab68':'#c4d5de');
        if(i===0){c.fillStyle='#b9913c';c.fillRect(gx-4,side<0?edge:y+5,2,43);}
      }
      plate(c,552,y+side*27-2,208,5);
      plate(c,786,y+side*39-2,137,5,side<0?'#b6bfd8':'#d6ad92');
      plate(c,936,y+side*14-2,131,4);
      for(let j=0;j<4;j++)plate(c,941+4*j,y+side*18-2,2,6);
    }
    if(gas){
      for(let i=0;i<56;i++){
        const x=557+(i*67)%198,yy=y-21+(i*17)%43;
        dot(c,x,yy,1.8,'#94b4bc');dot(c,x+2.7,yy+1.5,1.6,'#b1c6c9');
      }
    }
    line(c,[[40,y],[285,y]],'#a58abd',2,[3,5]);line(c,[[285,y],[gas?661:793,y]],negative,3);
    if(gas)line(c,[[661,y],[birthX,y]],neutral,3);
    for(const sign of gas?[-1,1]:[1]){
      path(c,793,dumpX,x=>y+sign*deflection(x),sign>0?negative:positive,2.3,gas?[5,3]:[]);
    }
    if(gas){
      path(c,birthX,birthX+26,x=>y+5*Math.sin((x-birthX)/26*tau),positive,1.8);
      line(c,[[661,y-4],[793,y-4]],positive,1,[4,5]);
      line(c,[[661,y+4],[793,y+4]],negative,1,[4,5]);
    }
    for(let i=1;i<grids.length-1;i++)arrow(c,grids[i+1]-7,y-23,-21,0,electric);
    for(let x=805;x<920;x+=43)arrow(c,x,y+15,0,-26,electric);

  }
  // Underline the part enlarged below, using the existing station dividers.
  function tracked(c,f,gas){
    const region=f.t<.34?[18,230]:f.t<.57?[238,510]:f.t<.73?[518,739]:
      f.t<.84||f.impact?[747,930]:f.t<.90?[938,1044]:[1052,1300];
    line(c,region.map(x=>[x,35]),ink,3);
    // Faint neighbouring particles expose the three trajectories at the separator.
    for(let i=0;i<19;i++){
      const x=285+(i*46+f.t*1240)%855;
      if(x>dumpX && (!gas || i%3!==0))continue;
      const branch=gas?[0,-1,1][i%3]:1;
      const y=beamY+(x>793?branch*deflection(x):0)+(i%3-1)*1.5;
      dot(c,x,y,2.4,x<661 || !gas?negative:[neutral,positive,negative][i%3]);
    }
    const color=f.impact?'#bd7835':f.t<.10?'#67808c':[positive,neutral,negative][f.electrons];
    dot(c,f.x,f.y,11,'#ffffffb5');circle(c,f.x,f.y,10,color,2);dot(c,f.x,f.y,4.5,color);
    if(f.impact){for(let i=0;i<8;i++)arrow(c,f.x+12*Math.cos(i*tau/8),f.y+12*Math.sin(i*tau/8),6*Math.cos(i*tau/8),6*Math.sin(i*tau/8),'#be8235');}
  }
  function atom(c,x,y,n,t,scale=1){
    c.save();c.translate(x,y);c.scale(scale,scale);
    if(n){
      c.strokeStyle='#8eaab76b';c.lineWidth=1.4;
      c.beginPath();c.ellipse(0,0,34,22,-.27,0,tau);c.stroke();
    }
    sphere(c,-4,-1,9,'#df5348');sphere(c,5,1,8.4,'#a6a8a9');
    for(let i=0;i<n;i++){
      const angle=t*22+i*Math.PI;
      sphere(c,34*Math.cos(angle),22*Math.sin(angle)-8*Math.cos(angle),4.8,'#3992d0');
    }
    c.restore();
  }
  const sourceArt={line,dot,circle,sphere,plate,arrow,label};
  function micro(c,w,h,f,gas){
    if(f.t<.34){InjectorSource.draw(c,w,h,f,sourceArt);return;}
    const s=Math.min(w/610,h/158);c.save();c.translate(w/2,h/2);c.scale(s,s);
    const t=f.t,u=f.local, y=8;
    const beamColor=[positive,neutral,negative][f.electrons];
    if(t<.57){
      const extraction=t<.38;
      label(c,extraction?'Extrakce iontu a záchyt elektronů':'Průlet urychlovací mezerou',0,-54);
      const gridX=x=>-210+420*(x-grids[1])/(grids.at(-1)-grids[1]);
      const visibleGrids=extraction?[-164,164]:grids.slice(1).map(gridX);
      for(const x of visibleGrids)for(const py of [-37,28])plate(c,x,py,extraction?10:6,28);
      arrow(c,92,46,-111,0,electric);label(c,'Elektrické pole',33,68,electric,13);
      atom(c,extraction?-80+u*151:gridX(f.x),y,2,t,extraction?1:.74);
      if(extraction){
        const bent=v=>[-113+277*v,-1-31*v*v];const pts=Array.from({length:26},(_,i)=>bent(i/25));
        line(c,pts,magnetic,1.7);sphere(c,...bent(u),4.8,'#3992d0');
      }
    }else if(t<.73){
      label(c,t<.65?'Vstup rychlého iontu do komory':gas?'Odtržení slabě vázaného elektronu':'Průlet bez srážky',0,-53);
      line(c,[[-233,y],[231,y]],'#aac3c5',1,[4,5]);
      // The approach and departure cues last 3.5 and 4.5 seconds on screen.
      const x=t<.65?160*(3.5/4.5)*(t-.65)/.08:160*(t-.65)/.08;
      atom(c,x,y,f.electrons,t);
      if(gas){
        const after=Math.max(0,(t-.65)/.08),targetY=y-18-14*after;
        for(let i=0;i<8;i++){
          const gx=-232+(i*67)%459,gy=i%2?44:-30;
          dot(c,gx,gy,2.8,'#a8bcbf');dot(c,gx+4,gy+1,2.8,'#b1c5c7');
        }
        atom(c,3+9*after,targetY,1,t,.38);atom(c,14+9*after,targetY-2,1,t,.38);
        if(t>=.65){
          const angle=.65*22+Math.PI,bx=34*Math.cos(angle),by=y+22*Math.sin(angle)-8*Math.cos(angle);
          line(c,[[bx,by],[bx+95*after,by-56*after]],'#438fb39e',1.6);
          sphere(c,bx+95*after,by-56*after,4.8,'#3992d0');
        }
      }
    }else if(t<.84 || f.impact){
      label(c,f.impact?'Předání energie desce':'Odklon v příčném elektrickém poli',0,-57);
      plate(c,-180,-41,360,6);plate(c,-180,50,360,7,'#dfbc9c','#ac795e');
      for(const a of gas?[-1,0,1]:[1]){
        const color=a===0?neutral:a>0?negative:positive;
        path(c,-160,150,x=>5+a*43*((x+160)/310)**2,color,a===0||!gas?2.4:1.4);
        if(gas && a)dot(c,-160+310*u,5+a*43*u*u,3.7,color);
      }
      const v=f.impact?1:u;
      atom(c,-160+310*v,5+(gas?0:43*v*v),f.electrons,t,.65);
      arrow(c,203,29,0,-49,electric);
    }else{
      label(c,t<.90?'Výstupní kanál':t<.94?'Tangenciální vstřik do plazmatu':'První závit rychlého deuteronu',0,-54);
      if(t<.90){
        for(const edge of [-41,50])plate(c,-237,edge,211,5);
      }else for(let j=-2;j<=2;j++)line(c,[[-237,y+j*17+9],[235,y+j*17-9]],magnetic,1);
      if(t<.94){
        const approach=(t-.84)/.10;
        atom(c,-231+106*approach,y,1,t);
        if(t>=.90){
          const incoming=(t-.90)/.04;
          const x=-55-70*incoming,py=-37+(y+37)*incoming;
          line(c,[[x+10,py-6],[x,py]],'#438fb39e',1.6);
          sphere(c,x,py,4.8,'#3992d0');
        }
      }
      else{
        const phase=(t-.94)/.06;
        const pts=Array.from({length:65},(_,i)=>{const u=phase*i/64;return [-125+250*u,y+26*Math.sin(tau*u)-9*u];});
        line(c,pts,beamColor,2.5);atom(c,...pts.at(-1),0,t);
        const a=.94*22,bx=-125+34*Math.cos(a),by=y+22*Math.sin(a)-8*Math.cos(a);
        sphere(c,bx-78*phase,by+43*phase,4.8,'#3992d0');
        sphere(c,-125-81*phase,y-36*phase,4.8,'#3992d0');
      }
    }
    c.restore();
  }
  return {background,tracked,micro,line,dot,ink,neutral};
})();
