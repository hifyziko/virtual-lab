(() => {
  'use strict';
  const $=id=>document.getElementById(id), canvas=$('scene'),ctx=canvas.getContext('2d');
  const fmt=(n,d=2)=>n.toFixed(d).replace('.', '{,}');
  function math(node,tex){if(node.dataset.rendered!==tex){katex.render(tex,node);node.dataset.rendered=tex;}}
  function setText(node,value){if(node.textContent!==value)node.textContent=value;}
  document.querySelectorAll('[data-tex]').forEach(el=>math(el,el.dataset.tex));
  $('import-guide').onclick=()=>$('guide').showModal();$('close').onclick=()=>$('guide').close();
  let data=null,worker=null,workerURL='',progress=0,playing=false,raf=0,last=0,busyTimer=0,calculateTimer=0;
  let yaw=.65,elev=.48,zoom=1,drag=null;
  const lerp=(a,b,u)=>a+(b-a)*u;
  let peakPower=0,initialElectronForce=0;
  function energyAt(t){
    const rows=data.energy;
    let lo=0,hi=rows.length-1;
    while(hi-lo>1){const mid=(hi+lo)>>1;if(rows[mid][0]>t)hi=mid;else lo=mid;}
    const a=rows[lo],b=rows[hi],u=Math.min(1,Math.max(0,(t-a[0])/(b[0]-a[0])));
    const dt=b[0]-a[0];
    return {row:a.map((v,i)=>lerp(v,b[i],u)), electronPower:(b[3]-a[3])/dt, ionPower:(b[4]-a[4])/dt};
  }
  // Interpolate the stored poloidal cycle, retaining its toroidal advance.
  function orbitState(length){
    const m=data;
    const cycles=Math.floor(length/m.period),local=length-cycles*m.period;
    const i=Math.min(Math.floor(local/m.dl),m.orbit.length-2),a=m.orbit[i],b=m.orbit[i+1];
    const u=(local-i*m.dl)/(Math.min((i+1)*m.dl,m.period)-i*m.dl);
    const angle=lerp(a[0],b[0],u),phi=lerp(a[1],b[1],u)+cycles*m.advance;
    const R=6.2+m.r*Math.cos(angle);
    const C=5.3*1.7/(1.2+2*(m.r/2)**2);
    const B=Math.hypot(5.3*6.2,C*m.r*Math.sin(angle)/1.7,C*m.r*Math.cos(angle))/R;
    return {point:[R*Math.cos(phi),R*Math.sin(phi),1.7*m.r*Math.sin(angle)],pitch:lerp(a[2],b[2],u),B};
  }
  const orbitScale=1e-5;
  function ionPoint(length){return orbitState(length).point;}
  function speedAt(energy){return Math.sqrt(2*energy*1.602176634e-16/3.3435838e-27);}
  function kinematics(row){
    const local=orbitState(row[1]*orbitScale),mass=3.3435838e-27;
    const v=speedAt(row[2]),omega=1.602176634e-19*local.B/mass;
    const parallel=v*local.pitch,perp=v*Math.sqrt(Math.max(0,1-local.pitch**2));
    return {v,parallel,perp,omega,radius:perp/omega};
  }
  function prepareGyro(){
    // Integrate at one fixed microscopic clock rate, independent of energy.
    const microRate=3.2e-7/(data.bundle.end-data.flight);
    let angle=0,travel=0,previous;
    for(const row of data.energy){
      const state=kinematics(row);
      if(previous){
        const dt=(row[0]-previous.t)*microRate;
        angle-=dt*(previous.omega+state.omega)/2;
        travel+=dt*(previous.parallel+state.parallel)/2;
      }
      row.push(angle,travel);
      previous={...state,t:row[0]};
    }
  }
  function energyLabel(keV){
    const eV=Math.max(0,keV*1000);
    if(eV>0 && eV<1)return fmt(eV*1000,2)+'\\,\\mathrm{meV}';
    return eV<1000?fmt(eV,2)+'\\,\\mathrm{eV}':fmt(keV,2)+'\\,\\mathrm{keV}';
  }
  const beam=y=>[5.31,y,-.131-y*Math.tan(.0492)];
  const ionizationAt=.20,ionizationDuration=.09,approachDuration=.055;
  function easedDistance(distance,width){
    const u=Math.min(1,distance/width);
    return distance-.65*width*u*(1-u+u*u/3);
  }
  function slowingTime(u){
    const end=data.bundle.end-data.flight;
    return u*end;
  }
  function frame(){
    const neutral=!data||!data.ion||progress<ionizationAt;
    const afterFlight=easedDistance(Math.max(0,progress-ionizationAt),ionizationDuration)/
      easedDistance(1-ionizationAt,ionizationDuration);
    if(neutral){
      const flight=1-easedDistance(Math.max(0,ionizationAt-progress),approachDuration)/
        easedDistance(ionizationAt,approachDuration);
      return {neutral,flight,t:(data?.flight||0)*flight+(data?slowingTime(afterFlight):0),
        point:beam(lerp(data?.start??-6.64,data?.stop??-6.64,flight)),row:[0,0,1000,0,0]};
    }
    const t=slowingTime(afterFlight),sample=energyAt(t);
    if(t>=data.energy.at(-1)[0])sample.electronPower=sample.ionPower=0;
    const block=Math.min(19,Math.floor(afterFlight*20));
    const before=energyAt(slowingTime(block/20)).row;
    const pulse=(progress-ionizationAt)/ionizationDuration;
    return {neutral,ionization:pulse<1?pulse:null,t:data.flight+t,point:ionPoint(sample.row[1]*orbitScale),...sample,
      gains:[sample.row[3]-before[3],sample.row[4]-before[4]],debit:before[2]-sample.row[2]};
  }
  function drawIonizationPulse(g,x,y,t){
    g.save();
    g.globalAlpha=Math.min(1,t/.12)*(1-t)**2;
    g.strokeStyle='#ffd58b';g.lineWidth=2;
    g.beginPath();g.arc(x,y,7+25*t,0,2*Math.PI);g.stroke();
    g.restore();
  }
  const speciesStyles={
    electron:{color:'#4de4ee',trail:'#849da8',dash:[],stride:7},
    deuteron:{color:'#ff9c52',trail:'#a59387',dash:[9,4],stride:5},
    triton:{color:'#e093ff',trail:'#9a8ea9',dash:[5,3,1,3],stride:5},
    alpha:{color:'#ffe459',trail:'#a6a08a',dash:[1,4],stride:2}
  };
  const particleSprites=new Map();
  function particleSprite(species){
    const style=window.HiFyzikoParticleStyle;
    const atoms=style.connected.atoms[species];
    const sprite=document.createElement('canvas'),x=64,y=64,r=16;
    sprite.width=sprite.height=128;
    const g=sprite.getContext('2d');
    const halo=g.createRadialGradient(x,y,r*.4,x,y,r*3.6);
    halo.addColorStop(0,speciesStyles[species].color+'70');halo.addColorStop(1,'#accfff00');
    g.fillStyle=halo;g.fillRect(x-r*3.6,y-r*3.6,r*7.2,r*7.2);
    for(const [dx,dy,,type] of atoms){
      const px=x+dx*r,py=y+(dy+dx*.18)*r;
      const base='#'+style.colors[type<0?'e':type?'p':'n'].toString(16).padStart(6,'0');
      const coat=g.createRadialGradient(px-r*.37,py-r*.43,0,px,py,r);
      coat.addColorStop(0,'#fff');coat.addColorStop(.32,base);coat.addColorStop(1,'#29334c');
      g.beginPath();g.arc(px,py,r,0,2*Math.PI);g.fillStyle=coat;g.fill();
    }
    particleSprites.set(species,sprite);
    return sprite;
  }
  function shadedParticle(g,x,y,species,r){
    const sprite=particleSprites.get(species)??particleSprite(species),halfSize=4*r;
    g.drawImage(sprite,x-halfSize,y-halfSize,2*halfSize,2*halfSize);
  }
  const number=(v,d=2)=>v.toLocaleString('cs',{minimumFractionDigits:d,maximumFractionDigits:d});
  function arrow(g,x,y,ux,uy,length,color){
    const head=Math.min(5,length*.45),halfWidth=Math.min(4.5,head);
    g.save();g.translate(x,y);g.transform(ux,uy,-uy,ux,0,0);
    g.fillStyle=color;g.beginPath();
    g.moveTo(0,-1.15);g.lineTo(length-head,-1.15);g.lineTo(length-head,-halfWidth);
    g.lineTo(length,0);g.lineTo(length-head,halfWidth);g.lineTo(length-head,1.15);
    g.lineTo(0,1.15);g.closePath();g.fill();g.restore();
  }
  function lensLabel(id,tex,x,y){
    const node=$(id);
    node.hidden=false;node.style.left=x+'px';node.style.top=y+'px';
    math(node,tex);
  }
  function backgroundGyro(p,omegaD,phaseD){
    const chargeMassRatio=p.charge*3.3435838e-27/p.mass;
    const displayRatio=p.species==='electron'?-1.6:chargeMassRatio;
    return {
      omega:omegaD*chargeMassRatio,
      displayOmega:omegaD*displayRatio,
      phase:phaseD*displayRatio
    };
  }
  function gyroDisplacement(p,omega,phase){
    const sine=Math.sin(-phase),oneMinusCosine=1-Math.cos(phase);
    return [
      (p.vy*sine+p.vz*oneMinusCosine)/omega,
      (p.vz*sine-p.vy*oneMinusCosine)/omega
    ];
  }
  function encounterState(states,time){
    let lo=0,hi=states.length-1;
    while(hi-lo>1){
      const mid=(lo+hi)>>1;
      if(states[mid].time<=time)lo=mid;else hi=mid;
    }
    const a=states[lo],b=states[hi],u=Math.max(0,Math.min(1,(time-a.time)/(b.time-a.time)));
    return {
      x:lerp(a.p.x-a.d.x,b.p.x-b.d.x,u),
      y:lerp(a.p.y-a.d.y,b.p.y-b.d.y,u),
      fx:lerp(a.fx,b.fx,u),fy:lerp(a.fy,b.fy,u),energy:lerp(a.p.E,b.p.E,u)
    };
  }
  function drawEncounters(g,x,y,w,h,time){
    const cases=data.bundle.encounters;
    const end=data.flight+data.energy.at(-1)[0];
    const interval=(end-data.flight)/cases.length*.23;
    const ready=data.flight+slowingTime(easedDistance(ionizationDuration,ionizationDuration)/
      easedDistance(1-ionizationAt,ionizationDuration));
    let focus;
    for(const sample of cases){
      if(sample.time<ready+4*interval||sample.time>end-4*interval)continue;
      const age=(time-sample.time)/interval;
      const ion=sample.selected===1,states=sample.pairs[sample.selected];
      const incoming=states[79],closest=states[120];
      const separation=Math.hypot(incoming.p.x-incoming.d.x,incoming.p.y-incoming.d.y);
      const factor=Math.min(w*.27,h*.34)/separation;
      const cos=Math.cos(sample.rotation),sin=Math.sin(sample.rotation);
      const rotate=(dx,dy)=>[cos*dx+sin*dy,sin*dx-cos*dy];
      const project=(dx,dy)=>{
        const [rx,ry]=rotate(dx,dy);
        return [x+rx*factor,y+ry*factor];
      };
      // Use one clock and one magnification for the whole relative trajectory.
      const timeScale=-incoming.time;
      const pose=encounterState(states,age*timeScale);
      const [tx,ty]=project(pose.x,pose.y);
      if(tx<-18||tx>w+18||ty<-18||ty>h+18)continue;
      const color=speciesStyles[ion?'deuteron':'electron'].color;
      g.save();
      if(ion){
        const [rx,ry]=[incoming.p.x-incoming.d.x,incoming.p.y-incoming.d.y];
        const vx=incoming.p.vx-incoming.d.vx,vy=incoming.p.vy-incoming.d.vy;
        g.setLineDash([4,5]);g.strokeStyle='rgba(194,204,218,.58)';g.lineWidth=1.2;
        g.beginPath();g.moveTo(...project(rx-3*timeScale*vx,ry-3*timeScale*vy));
        g.lineTo(...project(rx+5*timeScale*vx,ry+5*timeScale*vy));g.stroke();g.setLineDash([]);
      }
      g.strokeStyle=color;g.lineWidth=1.7;g.beginPath();
      for(let i=0;i<=16;i++){
        const tail=encounterState(states,(age-.42*(1-i/16))*timeScale);
        g[i?'lineTo':'moveTo'](...project(tail.x,tail.y));
      }
      g.stroke();
      shadedParticle(g,tx,ty,ion?'deuteron':'electron',ion?5.4:4.7);
      g.strokeStyle=color;g.lineWidth=1.5;
      g.beginPath();g.arc(tx,ty,10,0,2*Math.PI);g.stroke();
      const [fx,fy]=rotate(pose.fx,pose.fy),force=Math.hypot(fx,fy);
      const length=27*Math.sqrt(Math.min(1,force/Math.hypot(closest.fx,closest.fy)));
      if(length>3){
        for(const [ox,oy,sign] of [[x,y,1],[tx,ty,-1]]){
          const ux=sign*fx/force,uy=sign*fy/force;
          arrow(g,ox+ux*8,oy+uy*8,ux,uy,length,'#ff958a');
        }
      }
      g.restore();
      const distance=Math.hypot(tx-x,ty-y);
      if(tx>=0&&tx<=w&&ty>=0&&ty<=h&&(!focus||distance<focus.distance)){
        focus={distance,ion,pose,sample,initialEnergy:states[0].p.E};
      }
    }
    if(!focus)return;
    const {ion,pose,sample,initialEnergy}=focus;
    const delta=pose.energy-initialEnergy;
    return ion
      ? ['Odpuzování · odklon iontu',fmt(sample.ionDeflectionDeg,1)+'^{\\circ}']
      : ['Přitažlivost · změna energie elektronu','\\Delta E_k='+(delta>0?'+':'')+fmt(delta,1)+'\\,\\mathrm{eV}'];
  }
  function drawThermalParticle(g,p,pos,trail,w,h,alpha,powerShare){
    const {x,y,depth}=pos;
    const electron=p.species==='electron',style=speciesStyles[p.species];
    const margin=20;
    let minX=x-margin,maxX=x+margin,minY=y-margin,maxY=y+margin;
    for(const pt of trail){
      minX=Math.min(minX,pt.x);maxX=Math.max(maxX,pt.x);
      minY=Math.min(minY,pt.y);maxY=Math.max(maxY,pt.y);
    }
    // Clip periodic copies to the view. The visible part of a trail keeps moving at the edge.
    for(let col=Math.ceil(-maxX/w);col<=Math.floor((w-minX)/w);col++){
      for(let row=Math.ceil(-maxY/h);row<=Math.floor((h-minY)/h);row++){
        g.save();g.translate(col*w,row*h);g.globalAlpha=alpha;
        if(powerShare!==null){
          const breath=.79+.21*Math.sin(2*Math.PI*(progress*(2+4*p.depth)+p.x));
          const intensity=(.055+.43*Math.pow(powerShare,.8))*breath;
          const r=(electron?13:16)*(.8+.25*powerShare);
          const glow=g.createRadialGradient(x,y,0,x,y,r);
          const rgb=electron?'77,237,222':'255,172,97';
          glow.addColorStop(0,`rgba(${rgb},${intensity.toFixed(3)})`);
          glow.addColorStop(.4,`rgba(${rgb},${(intensity*.4).toFixed(3)})`);
          glow.addColorStop(1,`rgba(${rgb},0)`);
          g.fillStyle=glow;g.fillRect(x-r,y-r,2*r,2*r);
        }
        if(trail.length){
          g.save();g.globalAlpha=alpha*.72;
          g.strokeStyle=style.trail;g.lineWidth=1.45;g.lineCap='round';g.setLineDash(style.dash);
          g.beginPath();
          trail.forEach((pt,i)=>g[i?'lineTo':'moveTo'](pt.x,pt.y));
          g.stroke();g.restore();
        }
        const perspective=.72+.48*p.depth+Math.max(-.14,Math.min(.14,depth));
        shadedParticle(g,x,y,p.species,(electron?2.2:3.1)*perspective);
        g.strokeStyle=style.color;g.lineWidth=p.species==='alpha'?1.1:.7;
        g.beginPath();g.arc(x,y,electron?3.2:4.7,0,Math.PI*2);g.stroke();g.restore();
      }
    }
  }
  function drawLens(f,dpr){
    for(const [id,power] of [['electronPower',f.electronPower],['ionPower',f.ionPower]])
      $(id).style.width=(f.neutral?0:100*power/peakPower)+'%';
    if($('lens').hidden)return;
    const view=$('micro'),g=view.getContext('2d'),w=view.clientWidth,h=view.clientHeight;
    if(w<=0||h<=0)return;
    if(view.width!==Math.round(w*dpr)||view.height!==Math.round(h*dpr)){view.width=Math.round(w*dpr);view.height=Math.round(h*dpr);}
    g.setTransform(dpr,0,0,dpr,0,0);
    const background=g.createRadialGradient(w*.55,h*.48,0,w*.5,h*.5,w*.8);
    background.addColorStop(0,'#34465c');background.addColorStop(.54,'#222e47');background.addColorStop(1,'#101f30');
    g.fillStyle=background;g.fillRect(0,0,w,h);
    const ion=!f.neutral,first=data.ion?kinematics(data.energy[0]):null;
    const k=ion?kinematics(f.row):null;
    const scale=Math.min(w*.21,h*.19)/Math.max(.002,first?.radius??.015);
    const axial=.085,transverse=.84;
    const center=w/2,mid=h/2,axisY=mid,initialAngle=-Math.PI/2;
    const birthX=center-transverse*(first?.radius??0)*scale;
    const angle=f.row[5]??0,travel=f.row[6]??0;
    const duration=data.bundle.end-data.flight;
    const localTime=ion?f.row[0]*3.2e-7/duration:0;
    const flight=f.neutral?f.flight:1,approach=(data.stop-data.start)*.035;
    const clamp=value=>Math.max(0,Math.min(1,value));
    const ingress=clamp((f.point[1]-data.entry)/Math.max(.001,data.ion?data.stop-data.entry:.75));
    const exitOpacity=data.ion?1:clamp((data.exit-f.point[1])/.75);
    const ePower=ion?f.electronPower:0;
    const iPower=ion?f.ionPower:0;
    const powerSum=ePower+iPower;
    const eShare=powerSum>0?ePower/powerSum:0;
    const iShare=powerSum>0?iPower/powerSum:0;
    const electronDragRatio=ePower>0?Math.min(1,ePower/(k.v*initialElectronForce)):0;
    const electronOpticalScale=20;
    const thermalTime=localTime+flight*2e-9;
    const omegaD=k?.omega??first?.omega??2.5e8;
    const thermalPhase=angle-(first?.omega??omegaD)*flight*2e-9;
    const drift=ion?travel:approach*(flight-1);
    // Use the physical frequency for orbit size and a slower clock for the electron display.
    const thermalPose=(p,gyro,atTime=thermalTime,phase=gyro.phase)=>{
      const [yOrbit,zOrbit]=gyroDisplacement(p,gyro.omega,phase);
      const electron=p.species==='electron';
      const optical=electron?electronOpticalScale:1;
      const parallelScale=electron?.035:1;
      const depth=zOrbit*optical*scale/h;
      return {
        x:w*p.x+((parallelScale*p.vx*atTime-drift)*axial+transverse*zOrbit*optical)*scale,
        y:h*p.y-yOrbit*optical*scale,
        depth
      };
    };
    const population={electron:0,deuteron:0,triton:0,alpha:0};
    for(let j=0;j<data.bundle.thermal.length;j++){
      const p=data.bundle.thermal[j],gyro=backgroundGyro(p,omegaD,thermalPhase);
      const showTrail=population[p.species]++%speciesStyles[p.species].stride===0;
      const reveal=ion?1:clamp((ingress-.60*(1-p.x))/.40)*exitOpacity;
      if(reveal<=0)continue;
      const pos=thermalPose(p,gyro),trail=[];
      if(showTrail){
        const steps=40,phaseSpan=Math.PI*2.6;
        for(let n=0;n<=steps;n++){
          const theta=gyro.phase+Math.sign(gyro.displayOmega)*phaseSpan*(1-n/steps);
          const prevTime=thermalTime-(theta-gyro.phase)/gyro.displayOmega;
          trail.push(thermalPose(p,gyro,prevTime,theta));
        }
      }
      const share=powerSum>0&&j%3===0?(p.species==='electron'?eShare:iShare):null;
      drawThermalParticle(g,p,pos,trail,w,h,reveal*(.52+.44*p.depth),share);
    }
    const renderPoint=(row,state)=>[center+scale*(axial*(row[6]-travel)+transverse*state.radius*Math.sin(row[5]+initialAngle)),
      axisY-scale*state.radius*Math.cos(row[5]+initialAngle)];
    let x=center,y=mid,encounter;
    const ionizing=ion&&f.ionization!==null;
    $('lensField').hidden=true;
    if(ion){
      [x,y]=renderPoint(f.row,k);
      g.strokeStyle='#648ac2';g.lineWidth=1.1;g.beginPath();g.moveTo(12,axisY);g.lineTo(w-25,axisY);g.stroke();
      g.fillStyle='#648ac2';g.beginPath();g.moveTo(w-25,axisY-3);g.lineTo(w-17,axisY);g.lineTo(w-25,axisY+3);g.fill();
      lensLabel('lensField','\\mathbf{B}',w-31,axisY-19);
      const span=Math.min(f.row[0],2*Math.PI/k.omega*duration/3.2e-7*1.25);
      g.strokeStyle='#edf7ff';g.lineWidth=2.35;g.beginPath();
      for(let n=0;n<=64;n++){
        const row=energyAt(f.row[0]-span*(1-n/64)).row,pt=renderPoint(row,kinematics(row));
        if(n)g.lineTo(...pt);else g.moveTo(...pt);
      }
      g.stroke();
      if(powerSum>0){
        if(electronDragRatio>.015){
          const dragLength=8+38*electronDragRatio;
          const dragAlpha=.22+.58*electronDragRatio;
          const dragDirection=k.parallel>=0?-1:1;
          arrow(g,x+dragDirection*12,y-8,dragDirection,0,dragLength,`rgba(75,230,219,${dragAlpha})`);
        }
        if(!ionizing)encounter=drawEncounters(g,x,y,w,h,f.t);
      }
    }else{x=lerp(w*.14,first?birthX:w*.86,flight);}
    if(ionizing)drawIonizationPulse(g,birthX,mid,f.ionization);
    shadedParticle(g,x,y,'deuteron',6);
    if(!ion)shadedParticle(g,x+8,y-4,'electron',2.8);
    if(ionizing){
      const t=f.ionization;
      const departure=u=>u*u*(2-u);
      const electronX=u=>birthX+8+w*.43*departure(u);
      const electronY=u=>mid-4-h*(.22*departure(u)+.18*u*u);
      const tail=Math.max(0,t-.2);
      g.save();
      g.globalAlpha=Math.min(1,(1-t)/.26);
      const glow=g.createLinearGradient(electronX(tail),electronY(tail),electronX(t),electronY(t));
      glow.addColorStop(0,'#9af5e600');glow.addColorStop(1,'#9af5e6');
      g.strokeStyle=glow;g.lineWidth=1.6;g.beginPath();
      g.moveTo(electronX(tail),electronY(tail));g.lineTo(electronX(t),electronY(t));g.stroke();
      shadedParticle(g,electronX(t),electronY(t),'electron',2.8);g.restore();
    }
    lensLabel('lensParticle',ion?'\\mathrm{D}^{+}':'\\mathrm{D}^{0}',x-10,y-24);
    const lost=!data.ion&&f.t>=data.flight;
    const speed=k?.v??speedAt(f.row[2]);
    math($('flightTitle'),fmt(lost?0:f.row[2],1)+'\\,\\mathrm{keV}\\quad v='+
      fmt(lost?0:speed/1e6)+'\\,\\mathrm{Mm/s}'+(k?'\\quad r_{\\mathrm L}='+fmt(k.radius*1000)+'\\,\\mathrm{mm}':''));
    $('lensShares').hidden=powerSum<=0;
    for(const [bar,value,fraction] of [['lensElectronBar','lensElectronShare',eShare],['lensIonBar','lensIonShare',iShare]]){
      $(bar).style.width=(fraction*100)+'%';
      math($(value),Math.round(fraction*100)+'\\,\\%');
    }
    setText($('exchangeNote'),encounter?.[0]??(ionizing?'Ionizace · elektron se uvolňuje':
      lost?'Neutrální atom dopadl na stěnu':!ion?'Vstřik neutrálního deuteria':
      powerSum>0?'Zpomalování coulombovskými srážkami':'Konec vypočteného zpomalování'));
    $('exchangeValue').hidden=!encounter;
    if(encounter)math($('exchangeValue'),encounter[1]);
  }
  function drawBeam(f,project){
    const profile=$('profile'),w=profile.clientWidth,h=profile.clientHeight;
    const eBars=$('profileElectrons'),iBars=$('profileIons');
    profile.setAttribute('viewBox','0 0 '+w+' '+h);
    $('profileLabels').hidden=!data;
    $('mapScale').hidden=!data;
    if(!data){
      eBars.setAttribute('d','');iBars.setAttribute('d','');
      $('beamTotals').textContent='Výsledky se zobrazí po výpočtu.';
      return;
    }
    const {frames,bins,mapMax,volumes,peakDensity}=data.bundle;
    math($('mapScale'),'\\text{Řez }0\\text{–}'+fmt(peakDensity*1000,1)+'\\,\\mathrm{kW/m^3}');
    math($('profilePeak'),fmt(mapMax,1));
    let lo=0,hi=frames.length-1;
    while(hi-lo>1){const mid=(hi+lo)>>1;if(frames[mid].time>f.t)hi=mid;else lo=mid;}
    const a=frames[lo],b=frames[hi],u=Math.max(0,Math.min(1,(f.t-a.time)/(b.time-a.time)));
    const mode=$('mapMode').value,step=(w-96)/bins;
    const bar=(x,base,height)=>'M'+x+' '+base+'h'+(step-1)+'v'+(-height)+'h'+(1-step)+'Z';
    let ePath='',iPath='';
    let electrons=0,ions=0;
    for(let i=0;i<bins;i++){
      const e=lerp(a.e[i],b.e[i],u),p=lerp(a.ions[i],b.ions[i],u);
      electrons+=e;ions+=p;
      const eShown=mode==='ions'?0:e,pShown=mode==='e'?0:p,v=eShown+pShown;
      const x=38+i*step,base=h-19;
      const eHeight=eShown/mapMax*(h-25),iHeight=pShown/mapMax*(h-25);
      if(eHeight>0)ePath+=bar(x,base,eHeight);
      if(iHeight>0)iPath+=bar(x,base-eHeight,iHeight);
      if(v<=0)continue;
      const mix=pShown/v;
      ctx.fillStyle='rgba('+Math.round(31+188*mix)+','+Math.round(183-45*mix)+','+Math.round(181-108*mix)+','+(.9*Math.sqrt(v/(volumes[i]*peakDensity)))+')';
      // Surface-averaged deposition displayed in one meridional section.
      ctx.beginPath();
      for(const edge of [i+1,i]){
        const r=2*edge/bins;
        for(let n=0;n<=64;n++){const t=n*Math.PI/32,R=6.2+r*Math.cos(t);
          const [px,py]=project([R,0,1.7*r*Math.sin(t)]);
          if(!n)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
        ctx.closePath();
      }
      ctx.fill('evenodd');
    }
    eBars.setAttribute('d',ePath);
    iBars.setAttribute('d',iPath);
    const val=key=>number(lerp(a[key],b[key],u),3);
    setText($('beamTotals'),'Elektrony '+number(electrons,3)+' · ionty '+number(ions,3)+' · průlet na stěnu '+val('wall')+' MW. Neutrální atomy v letu '+val('neutral')+' · zpomalující ionty '+val('fast')+' · zbytek při 5Tᵢ '+val('residual')+' MW.');
  }
  const hardware=window.TokamakCAD;
  let gpu=null,assembly=null;
  const tokamakSection=['tf','pf','cs','vessel'].flatMap(part=>hardware.sections(part).flat());
  const injectorEnvelope=[3.9,6.72].flatMap(x=>[-17.9,-8.7].flatMap(y=>[-1.2,2.4].map(z=>[x,y,z])));
  let projectedBounds;
  function overviewCamera(w,h,focus){
    const cy=Math.cos(yaw),sy=Math.sin(yaw),se=Math.sin(elev),ce=Math.cos(elev);
    const rotate=([x,y,z])=>[x*cy-y*sy,(x*sy+y*cy)*se-z*ce];
    if(projectedBounds?.yaw!==yaw||projectedBounds.elev!==elev){
      // The radial sections bound the vessel and coils. Include the off-axis injector.
      const radialExtent=Math.max(...tokamakSection.map(([r])=>r));
      const top=Math.min(...tokamakSection.map(([r,z])=>-r*Math.abs(se)-z*ce));
      const bottom=Math.max(...tokamakSection.map(([r,z])=>r*Math.abs(se)-z*ce));
      const injector=injectorEnvelope.map(rotate);
      projectedBounds={yaw,elev,
        left:Math.min(-radialExtent,...injector.map(p=>p[0])),
        right:Math.max(radialExtent,...injector.map(p=>p[0])),
        top:Math.min(top,...injector.map(p=>p[1])),
        bottom:Math.max(bottom,...injector.map(p=>p[1]))};
    }
    const {left,right,top,bottom}=projectedBounds;
    const width=w*(1-.62*focus);
    const scale=Math.min((width-24)/(right-left),(h-32)/(bottom-top))*zoom;
    const plateScale=Math.min(w/(2*Math.max(-left,right)+2),h/(2*Math.max(-top,bottom)+2));
    const originX=width/2-(left+right)*scale/2,originY=h/2-(top+bottom)*scale/2;
    const project=point=>{
      const [x,y]=rotate(point);
      return [originX+x*scale,originY+y*scale];
    };
    const plateProject=point=>{
      const [x,y]=rotate(point);
      return [w/2+x*plateScale,h/2+y*plateScale];
    };
    return {width,project,plateScale,plateProject,ratio:scale/plateScale,originX,originY};
  }
  const lightMix=document.createElement('canvas');
  const plates=Array.from({length:5}).map(()=>({canvas:document.createElement('canvas'),key:''}));
  // The pedagogical injector envelope shares the centreline and inclination of the beam.
  function buildInterior(phase){
    const faces=[];
    function face(points,baseColor,alpha=1,material='case'){
      faces.push({face:true,points,baseColor,alpha,material});
    }
    function sleeve(y0,y1,x0,z0,x1,z1,color,count=12){
      function rim(y,rx,rz,i){const t=2*Math.PI*i/count,c=beam(y);return [c[0]+rx*Math.cos(t),c[1],c[2]+rz*Math.sin(t)];}
      for(let i=0;i<count;i++)face([rim(y0,x0,z0,i),rim(y0,x0,z0,i+1),rim(y1,x1,z1,i+1),rim(y1,x1,z1,i)],color);
    }
    function housing(x,y,z,dx,dy,dz,color){
      const corners=Array.from({length:8},(_,i)=>[x+(i&1?dx:-dx),y+(i&2?dy:-dy),z+(i&4?dz:-dz)]);
      for(const ids of [[0,2,3,1],[4,5,7,6],[0,1,5,4],[2,6,7,3],[0,4,6,2],[1,3,7,5]])face(ids.map(i=>corners[i]),color);
    }
    // Vacuum enclosure, service skids, removable covers and two pump housings.
    const source=beam(-16.3);
    housing(source[0],source[1],source[2],1.3,1.6,1.32,'#607c90');
    for(const side of [-1,1]){
      housing(source[0]+side*.98,-15.1,source[2]-1.6,.14,2.85,.13,'#4a6070');
      for(const y of [-17.3,-15.9,-14.8])housing(source[0]+side*1.31,y,source[2],.07,.43,1.0,'#a8bbc1');
      housing(source[0]+side*.69,-16.5,source[2]+1.55,.42,.65,.23,'#829ca8');
    }
    sleeve(-17,-16.8,.94,1.12,1.14,1.32,'#426175');
    sleeve(-16.8,-13.1,1.14,1.32,1.14,1.32,'#7894a0');
    sleeve(-13.1,-11.8,1.14,1.32,.70,.78,'#abc0c5');
    sleeve(-11.8,-8.7,.70,.78,.42,.48,'#597788');
    for(const y of [-16.8,-16.4,-15.8,-15.2,-14.6,-14,-13.4])sleeve(y,y+.14,1.21,1.40,1.21,1.40,'#ad815a');
    for(const y of [-11.7,-10.9,-10.1,-9.3]){const r=.44+(-y-8.7)*.095;sleeve(y,y+.10,r+.07,r+.15,r+.07,r+.15,'#b7bfc2');}
    // Nested emissive flux surfaces share the vessel's 3D frame and depth buffer.
    const point=(r,p,t)=>[(6.2+r*Math.cos(t))*Math.cos(p),(6.2+r*Math.cos(t))*Math.sin(p),1.7*r*Math.sin(t)];
    for(const [r,alpha] of [[.44,.74],[.78,.42],[1.14,.26],[1.54,.16],[1.79,.09],[1.97,.055]]){
      for(let j=0;j<64;j++)for(let k=0;k<20;k++){
        const p=j*Math.PI/32,t=k*Math.PI/10;
        const ribbon=Math.cos(t-.8+.35*Math.sin(3*p));
        const shimmer=Math.cos(2*p-t+phase+.45*Math.sin(t+p));
        const light=.5+.36*ribbon+.14*shimmer;
        const rgb=r<1?[240+14*light,135+93*light,184+58*light]:[127+85*light,93+66*light,174+63*light];
        const color='#'+rgb.map(n=>Math.round(n).toString(16).padStart(2,'0')).join('');
        face([point(r,p,t),point(r,p+Math.PI/32,t),point(r,p+Math.PI/32,t+Math.PI/10),point(r,p,t+Math.PI/10)],color,alpha,'matte');
      }
    }
    // On an elliptical flux surface dθ/dφ = R/(R0 q), from the same B as computeNBI.
    // Each short ribbon is a segment of a distinct magnetic field line.
    for(let seed=0;seed<7;seed++){
      const r=.95+.14*seed,q=1.2+2*(r/2)**2;
      const slope=t=>(6.2+r*Math.cos(t))/(6.2*q);
      const start=seed*2.39996,step=2*Math.PI/180,halfWidth=.027/r;
      let theta=seed*Math.PI*2/7;
      for(let j=0;j<180;j++){
        const p=start+j*step,next=theta+step*slope(theta+.5*step*slope(theta));
        const pulse=((1+Math.cos(j*step-phase+seed))*.5)**5;
        const rgb=[53+75*pulse,106+67*pulse,195+43*pulse];
        const tint='#'+rgb.map(n=>Math.round(n).toString(16).padStart(2,'0')).join('');
        face([point(r,p,theta-halfWidth),point(r,p+step,next-halfWidth),
          point(r,p+step,next+halfWidth),point(r,p,theta+halfWidth)],tint,.54,'matte');
        theta=next;
      }
    }
    return faces;
  }
  const interiors=Array.from({length:4},(_,i)=>buildInterior(i*Math.PI/2));
  function scenePlate(w,h,dpr,scale,project,fired,phase){
    const interior=interiors[phase],cached=plates[fired?1+phase:0],plate=cached.canvas;
    const key=[w,h,dpr,scale,yaw,elev,fired].join('/');
    if(key!==cached.key){
      if(!assembly){
        gpu=window.createConfinementRenderer({technical:true,cadExposure:1.22});
        assembly=gpu?hardware.objects({visible:{tf:true,pf:true,cs:true,vessel:true,divertor:true,blanket:true},active:[],focus:'all',cut:true}):[];
      }
      plate.width=Math.round(w*dpr);plate.height=Math.round(h*dpr);
      const out=plate.getContext('2d'),alpha=fired?.19:1;
      if(gpu){
        const objects=assembly.map(o=>({...o,alpha})).concat(interior);
        out.drawImage(gpu.render(objects,w,h,scale,dpr,{world:true,key:'nbi-cut-'+fired+'-'+phase,yaw,pitch:elev,centerZ:0,centerY:.5}),0,0,plate.width,plate.height);
      }else{
        const polygons=interior.map(o=>({loops:[o.points],color:o.baseColor,alpha:o.alpha}));
        for(let i=0;i<=9;i++){
          const phi=Math.PI+i*Math.PI/9;
          for(const [part,color] of [['tf','#768c9b'],['vessel','#a8bac2'],['pf','#b18d70']]){
            const loops=hardware.sections(part).map(path=>path.map(([r,z])=>[r*Math.cos(phi),r*Math.sin(phi),z]));
            if(loops.length)polygons.push({loops,color,alpha});
          }
        }
        const depth=p=>(p[0]*Math.sin(yaw)+p[1]*Math.cos(yaw))*Math.cos(elev)+p[2]*Math.sin(elev);
        for(const poly of polygons)poly.depth=poly.loops[0].reduce((n,p)=>n+depth(p),0)/poly.loops[0].length;
        polygons.sort((a,b)=>a.depth-b.depth);
        out.setTransform(dpr,0,0,dpr,0,0);const origin=project([0,0,0]);out.translate(w/2-origin[0],h/2-origin[1]);
        for(const poly of polygons){
          out.beginPath();for(const loop of poly.loops){loop.forEach((p,i)=>out[i?'lineTo':'moveTo'](...project(p)));out.closePath();}
          out.globalAlpha=poly.alpha;out.fillStyle=poly.color;out.fill('evenodd');
        }
      }
      cached.key=key;
    }
    return plate;
  }
  function draw(){
    const f=frame(),lens=$('lens');
    const reveal=data&&$('showMicro').checked?Math.min(1,progress/.055):0;
    const focus=reveal*reveal*(3-2*reveal);
    if(lens.hidden!==(focus===0))lens.hidden=focus===0;
    if(Number(lens.style.opacity)!==focus){
      lens.style.opacity=focus;
      lens.style.clipPath='inset(0 0 0 '+((1-focus)*100)+'%)';
    }
    const plot=graph();
    const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.max(1,devicePixelRatio*canvas.getBoundingClientRect().width/w);
    const W=Math.round(w*dpr),H=Math.round(h*dpr);
    if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const camera=overviewCamera(w,h,focus),{project}=camera;
    function line(points,color,width=1){
      ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...project(p)));
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
    }

    const backdrop=ctx.createRadialGradient(w*.48,h*.45,0,w*.52,h*.55,Math.max(w,h)*.69);
    backdrop.addColorStop(0,'#fffdfa');backdrop.addColorStop(.66,'#f1f4f5');backdrop.addColorStop(1,'#dae3e8');
    ctx.fillStyle=backdrop;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.beginPath();ctx.rect(0,0,camera.width,h);ctx.clip();
    const shot=data?Math.min(1,progress/.035):0;
    // Blend depth-tested exposures, including coverage at the edges of the CAD cut.
    const phase=progress*68,idx=Math.floor(phase)%4;
    const fraction=phase-Math.floor(phase);
    if(lightMix.width!==W||lightMix.height!==H){lightMix.width=W;lightMix.height=H;}
    const mixer=lightMix.getContext('2d');mixer.clearRect(0,0,W,H);mixer.globalCompositeOperation='lighter';
    for(const [fired,index,weight] of [[false,0,1-shot],[true,idx,shot*(1-fraction)],[true,(idx+1)%4,shot*fraction]]){
      if(weight<=0)continue;
      mixer.globalAlpha=weight;mixer.drawImage(scenePlate(w,h,dpr,camera.plateScale,camera.plateProject,fired,index),0,0);
    }
    mixer.globalAlpha=1;
    const drawW=w*camera.ratio,drawH=h*camera.ratio;
    ctx.drawImage(lightMix,camera.originX-drawW/2,camera.originY-drawH/2,drawW,drawH);
    line([beam(-8.7),beam(data?.stop??6.64)],'rgba(158,111,44,.56)',1.1);
    if(shot){
      const head=f.neutral?f.point:beam(data.stop);
      for(const [width,color] of [[9,'rgba(255,168,46,.22)'],[4,'#f4aa35'],[1.2,'#fff5bc']])line([beam(-8.7),head],color,width);
    }
    const [ax,ay]=project(beam(-7.6)),[bx,by]=project(beam(-7.1));
    const arrowLength=Math.hypot(bx-ax,by-ay);
    if(arrowLength>1){
      const ux=(bx-ax)/arrowLength,uy=(by-ay)/arrowLength,head=Math.min(10,arrowLength);
      ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx-head*ux-4*uy,by-head*uy+4*ux);
      ctx.lineTo(bx-head*ux+4*uy,by-head*uy-4*ux);ctx.fillStyle='#b67d32';ctx.fill();
    }
    if(data&&!f.neutral){
      const [bx,by]=project(beam(data.stop));
      ctx.beginPath();ctx.arc(bx,by,7,0,2*Math.PI);
      ctx.strokeStyle='#af7122';ctx.lineWidth=1.6;ctx.stroke();
      if(f.ionization!==null)drawIonizationPulse(ctx,bx,by,f.ionization);
    }
    if(data&&!f.neutral&&$('trace').checked){
      const distance=f.row[1]*orbitScale,tail=Math.min(48,distance);
      const pts=Array.from({length:145},(_,i)=>ionPoint(distance-tail*(1-i/144)));
      line(pts.slice(0,95),'#669fbb',1.2);line(pts.slice(94),'#176187',2.3);
    }
    const [x,y]=project(f.point);ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);
    ctx.fillStyle=f.neutral?'#ae741f':'#176187';ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();
    const tag=$('particle');tag.hidden=x<12||x>camera.width-12||y<26||y>h;
    tag.style.left=(canvas.offsetLeft+x)+'px';tag.style.top=(canvas.offsetTop+y-25)+'px';math(tag,f.neutral?'\\mathrm D^0':'\\mathrm D^+');
    // Show both recipients of the energy removed in the same time bin as the graph.
    for(const [id,value] of [['give',f.debit],['gainE',f.gains?.[0]],['gainI',f.gains?.[1]]]){
      math($(id),f.neutral?'\\text{—}':energyLabel(value));
    }
    drawBeam(f,project);ctx.restore();drawLens(f,dpr);
    const lost=data&&!data.ion&&f.t>=data.flight;
    $('electronBar').style.width=(f.row[3]/10)+'%';
    $('ionBar').style.width=(f.row[4]/10)+'%';
    if(data){
      const unit=f.t<.001?[1e6,'\\mu s']:[1e3,'ms'];
      math($('time'),fmt(f.t*unit[0])+'\\,\\mathrm{'+unit[1]+'}');
      for(const [id,value] of [['kin',lost?0:f.row[2]],['elec',f.row[3]],['ions',f.row[4]],['loss',lost?1000:0]])math($(id),fmt(value,1)+'\\,\\mathrm{keV}');
      setText($('phase'),lost?'Průlet bez ionizace · dopad na stěnu':f.neutral?(f.point[1]>=data.entry&&f.point[1]<=data.exit?'Neutrální atom proniká plazmatem':'Přímý let neutrálního atomu'):f.ionization!==null?'Ionizace uvnitř plazmatu · vznik rychlého deuteronu':f.t>=data.flight+data.energy.at(-1)[0]?'Konec modelu rychlého iontu · zbytková energie částice':'Trajektorie gyračního středu deuteronu');
      for(let i=0;i<3;i++){
        const dot=$('energy-marker-'+i);
        if(!dot)continue;
        dot.setAttribute('cx',plot.x(f.t));
        dot.setAttribute('cy',plot.y(i===0&&lost?0:f.row[i+2]));
      }
    }
  }
  let graphLayout;
  function graph(){
    const area=$('plot'),w=area.clientWidth,h=area.clientHeight;
    if(graphLayout?.w===w&&graphLayout.h===h&&graphLayout.data===data)return graphLayout;
    const left=53,top=14,right=w-25,bottom=h-29;
    const end=data?data.flight+(data.energy.at(-1)?.[0]||0):0;
    const x=time=>left+(right-left)*Math.min(1,time/end);
    const y=energy=>bottom-(bottom-top)*energy/1000;
    let curves='';
    if(data){
      const rows=data.energy.filter((_,i)=>i%16===0||i===data.energy.length-1);
      curves=['#216985','#177380','#9b6236'].map((color,i)=>{
        const start=y(i===0?1000:0);
        const points=[left+','+start,...rows.map(row=>x(data.flight+row[0])+','+y(row[i+2]))];
        if(!data.ion){
          points.push(right+','+start);
          if(i===0)points.push(right+','+bottom);
        }
        const fill=i===0?'<defs><linearGradient id="nbi-energy-fill" x2="0" y2="1"><stop stop-color="'+color+'" stop-opacity=".24"/><stop offset="1" stop-color="'+color+'" stop-opacity=".012"/></linearGradient></defs>'+
          '<polygon points="'+left+','+bottom+' '+points.join(' ')+' '+right+','+bottom+'" fill="url(#nbi-energy-fill)"/>':'';
        return fill+'<polyline fill="none" stroke="'+color+'" stroke-width="2.5" points="'+points.join(' ')+'"/>'+
          '<circle id="energy-marker-'+i+'" r="4" fill="'+color+'" stroke="#fff"/>';
      }).join('');
    }
    const tick=(tx,ty,label,align)=>'<foreignObject x="'+tx+'" y="'+ty+'" width="48" height="19">'+
      '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:13px;text-align:'+align+';color:#38505a">'+
      katex.renderToString(label)+'</div></foreignObject>';
    const levels=[0,250,500,750,1000];
    const grid='M'+left+' '+top+'V'+bottom+levels.map(energy=>'M'+left+' '+y(energy)+'H'+right).join('');
    const labels=levels.map(energy=>tick(0,y(energy)-9,String(energy),'right')).join('')+
      tick(left-24,bottom+6,'0','center')+
      (end?tick(right-24,bottom+6,fmt(Number((end*(data.ion?1:1e6)).toPrecision(3)),data.ion?3:2),'center'):'');
    area.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Kinetická a předaná energie podle fyzikálního času"><path d="'+grid+'" fill="none" stroke="#bacbd1"/>'+curves+labels+'</svg>';
    math($('axisY'),'E\\;(\\mathrm{keV})');math($('axisX'),'t\\;(\\mathrm{'+(data&&!data.ion?'\\mu s':'s')+'})');
    graphLayout={w,h,data,x,y};
    return graphLayout;
  }
  function stop(){playing=false;cancelAnimationFrame(raf);$('play').textContent='Přehrát';}
  function terminate(){clearTimeout(busyTimer);if(worker)worker.terminate();worker=null;if(workerURL)URL.revokeObjectURL(workerURL);workerURL='';$('busy').hidden=true;}
  function queueCalculation(delay){
    clearTimeout(calculateTimer);terminate();stop();
    data=null;progress=0;$('seek').value=0;$('play').disabled=$('seek').disabled=true;
    math($('nv'),fmt(+$('density').value)+'\\times10^{19}\\,\\mathrm{m^{-3}}');math($('tv'),fmt(+$('temp').value,1)+'\\,\\mathrm{keV}');
    for(const id of ['time','kin','elec','ions','loss']){$(id).textContent='—';delete $(id).dataset.rendered;}
    $('phase').textContent='';draw();
    if(delay)calculateTimer=setTimeout(calculate,delay);
    else calculate();
  }
  function calculate(){
    const busy=$('busy'),message=$('busyMessage'),bar=$('beamProgress'),retry=$('retry');
    message.textContent='Počítám dráhy a energetickou bilanci svazku…';
    retry.hidden=true;bar.hidden=false;bar.value=0;
    function fail(){
      terminate();
      message.textContent='Výpočet se nezdařil.';
      bar.hidden=true;retry.hidden=false;busy.hidden=false;
    }
    try{
      workerURL=URL.createObjectURL(new Blob([computeNBI.toString(),'\n',scatteringExample.toString(),'\n',computeBeam.toString(),'\nonmessage=e=>postMessage(computeBeam(...e.data,(n,total)=>postMessage({progress:n/total})));'],{type:'text/javascript'}));
      const activeWorker=worker=new Worker(workerURL);
      activeWorker.onerror=()=>{if(worker===activeWorker)fail();};
      activeWorker.onmessage=e=>{
        if(worker!==activeWorker)return;
        if(e.data.progress!=null){bar.value=e.data.progress;return;}
        data=e.data;
        peakPower=0;
        initialElectronForce=data.ion?energyAt(0).electronPower/speedAt(data.energy[0][2]):0;
        for(let i=1;i<data.energy.length;i++){
          const a=data.energy[i-1],b=data.energy[i];
          peakPower=Math.max(peakPower,(a[2]-b[2])/(b[0]-a[0]));
        }
        prepareGyro();const final=data.bundle.frames.at(-1);data.bundle.mapMax=Math.max(.01,...final.e.map((v,i)=>v+final.ions[i]));
        terminate();$('play').disabled=$('seek').disabled=false;draw();
      };
      busyTimer=setTimeout(()=>busy.hidden=false,120);
      activeWorker.postMessage([+$('density').value,+$('temp').value]);
    }catch{fail();}
  }
  $('retry').onclick=()=>queueCalculation();
  $('density').oninput=$('temp').oninput=()=>queueCalculation(120);
  function tick(now){
    // A delayed frame must not jump the particle ahead by a large step.
    const elapsed=Math.min(50,Math.max(0,now-last));
    progress=Math.min(1,progress+elapsed*.000016*Number($('speed').value));
    last=now;$('seek').value=progress;draw();
    if(progress<1)raf=requestAnimationFrame(tick);else stop();
  }
  $('play').onclick=()=>{if(playing){stop();return;}if(progress===1)progress=0;playing=true;$('play').textContent='Pozastavit';last=performance.now();raf=requestAnimationFrame(tick);};
  $('seek').oninput=()=>{stop();progress=Number($('seek').value);draw();};
  $('trace').onchange=draw;
  $('showMicro').onchange=$('mapMode').onchange=draw;
  canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);drag=[e.clientX,e.clientY];};
  canvas.onpointermove=e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.008;elev=Math.max(-1.45,Math.min(1.45,elev+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];draw();};
  canvas.onlostpointercapture=()=>drag=null;
  canvas.onwheel=e=>{e.preventDefault();zoom=Math.max(.55,Math.min(3,zoom*Math.exp(-e.deltaY*.001)));draw();};
  addEventListener('resize',draw);window.HiFyzikoFusionDispose=()=>{clearTimeout(calculateTimer);stop();terminate();gpu?.dispose();removeEventListener('resize',draw);};
  queueCalculation();
})();
