/* Slowed, reproducible close-up of two electron collisions and surface conversion.
   Coordinates belong to the teaching view, not a kinetic plasma solver. */
const InjectorSource = (() => {
  const tau=2*Math.PI, hit=.10, ionize=.18, contact=.254, bound=.27, exit=.34;
  const aperture={top:160,bottom:276,lip:22};
  const rfFrequency=3*Math.PI/hit, phaseOffset=.55;
  const rfPhase=t=>rfFrequency*t+phaseOffset;
  // For the reference electron the angular velocity is proportional to cos(phase).
  function lastReferenceTurn(t){
    const n=Math.floor((rfPhase(t)-Math.PI/2)/Math.PI);
    return (Math.PI/2+n*Math.PI-phaseOffset)/rfFrequency;
  }
  const clamp=x=>Math.max(0,Math.min(1,x));
  const part=(t,a,b)=>clamp((t-a)/(b-a));
  const between=(a,b,u)=>a+(b-a)*u;
  const ease=u=>u*u*(3-2*u);
  const axisY=184, loopRadius=77, loopStations=[150,250,350];
  function project(x,y,z){return [x+.48*z,y-.19*z];}
  function ring(x,r,a){return project(x,axisY+r*Math.cos(a),r*Math.sin(a));}
  // Double integration of tangential acceleration proportional to -sin(phase).
  // The affine term sets the incoming velocity for the selected encounter.
  const rfDisplacement=t=>1.05*Math.sin(rfPhase(t));
  const inPlane=(p,z)=>[p[0]-.48*z,p[1]+.19*z,z];
  function flightWorld(start,finish,t,a,b,depth=70){
    if(t<=a)return inPlane(start,depth);
    if(t>=b)return inPlane(finish,depth);
    const u=part(t,a,b);
    const polar=p=>Math.atan2(depth,p[1]+.19*depth-axisY);
    const radius=p=>Math.hypot(depth,p[1]+.19*depth-axisY);
    const angle=between(polar(start),polar(finish),u)+rfDisplacement(t)
      -between(rfDisplacement(a),rfDisplacement(b),u);
    return ringWorld(between(start[0],finish[0],u)-.48*depth,
      between(radius(start),radius(finish),u),angle);
  }
  function rfFlight(start,finish,t,a,b,depth=70){
    if(t<=a)return start.slice();
    if(t>=b)return finish.slice();
    return project(...flightWorld(start,finish,t,a,b,depth));
  }
  function ambientWorld(i,t){
    const n=Math.floor(i/4),station=loopStations[n%loopStations.length];
    if(n===0)return ringWorld(station,loopRadius,rfDisplacement(t));
    if(n%3===0)return ringWorld(station,loopRadius,n*2.4+rfDisplacement(t)+t*(n%2?.8:-.6));
    // Independent axial velocities and radii sample the volume between the drawn field lines.
    const x=station+36*Math.sin(t*(3+n*.12)+n);
    return ringWorld(x,34+(n*19)%68,n*2.4+rfDisplacement(t)+t*(n%2?1.3:-.9));
  }
  function ringWorld(x,r,a){return [x,axisY+r*Math.cos(a),r*Math.sin(a)];}
  function ambientElectron(i,t){return project(...ambientWorld(i,t));}
  function point(a,b,u){return [between(a[0],b[0],u),between(a[1],b[1],u)];}
  function arc(a,b,k,u){
    const mid=point(a,b,u),bend=4*u*(1-u);
    return [mid[0]+k[0]*bend,mid[1]+k[1]*bend];
  }
  function nuclei(t){
    if(t<hit){
      const center=between(321,356,t/hit),vibration=2*Math.sin(t*102);
      return [[center+17+vibration,157],[center-17-vibration,165]];
    }
    const [right,left]=nucleiAtHit;
    const first=t<contact?point(right,[717,116],part(t,hit,contact)):
      t<bound?[717,116]:t<.302?arc([717,116],[642,209],[-8,2],part(t,bound,.302)):
      arc([642,209],[868,218],[-17,21],part(t,.302,exit));
    const second=t<ionize?point(left,[263,242],part(t,hit,ionize)):
      point([263,242],[141,303],part(t,ionize,exit));
    return [first,second];
  }
  const nucleiAtHit=[[373+2*Math.sin(hit*102),157],[339-2*Math.sin(hit*102),165]];
  function orbital(nucleus,t,other=false){
    const a=t*53+(other?-1:-.4);
    return [nucleus[0]+25*Math.cos(a),nucleus[1]+17*Math.sin(a)];
  }
  const release=.020, encounter=.053, donor=[90,203];
  // A smooth, symmetric transverse deflection around closest approach.
  // The neighbouring electron receives the opposite change in velocity.
  const releasePoint=orbital(donor,release);
  function electricField(p,t){
    const rf=Math.sin(rfPhase(t));
    return [0,-p[2]*rf,(p[1]-axisY)*rf];
  }
  // Integrate the selected electron in Cartesian coordinates. Choose its
  // initial velocity once so the prescribed molecular collision occurs on cue.
  function incomingOrbit(){
    const steps=320,h=(hit-release)/steps,z0=60;
    const start=[releasePoint[0]-.48*z0,releasePoint[1]+.19*z0,z0];
    const end=[356-.48*z0,162+.19*z0,z0];
    function acceleration(p,t){
      const e=electricField(p,t);
      const spread=.004,dt=t-encounter;
      const scatter=610*spread**2/Math.hypot(dt,spread)**3;
      return [0,-2100*e[1]+scatter,-2100*e[2]];
    }
    function integrate(vy,vz,save=false){
      let p=start.slice(),v=[(end[0]-start[0])/(hit-release),vy,vz],a=acceleration(p,release);
      const samples=save?[[p,v]]:null;
      for(let i=1;i<=steps;i++){
        p=p.map((value,k)=>value+h*v[k]+.5*h*h*a[k]);
        const next=acceleration(p,release+i*h);
        v=v.map((value,k)=>value+.5*h*(a[k]+next[k]));a=next;
        if(save)samples.push([p,v]);
      }
      return save?samples:p;
    }
    const base=integrate(0,0),u=integrate(1,0),w=integrate(0,1);
    const a=u[1]-base[1],b=w[1]-base[1],c=u[2]-base[2],d=w[2]-base[2];
    const dy=end[1]-base[1],dz=end[2]-base[2],det=a*d-b*c;
    const samples=integrate((d*dy-b*dz)/det,(a*dz-c*dy)/det,true);
    return t=>{
      const tick=part(t,release,hit)*steps,i=Math.min(steps-1,Math.floor(tick)),u=tick-i;
      const [p,v]=samples[i],[q,w]=samples[i+1];
      return p.map((x,k)=>between(x,q[k],ease(u))+h*u*(1-u)*((1-u)*v[k]-u*w[k]));
    };
  }
  const incidentWorld=incomingOrbit();
  function incident(t){
    if(t<release)return orbital(donor,t);
    if(t<=hit)return project(...incidentWorld(t));
    return rfFlight([356,162],[535,60],Math.min(t,.188),hit,.188);
  }
  const ionizationPoint=orbital(nuclei(ionize)[1],ionize,true);
  function projectileWorld(t){return flightWorld([124,254],[137,272],t,0,.14,34);}
  function projectile(t){
    if(t<.14){

      return project(...projectileWorld(t));
    }
    if(t<ionize)return rfFlight([137,272],ionizationPoint,t,.14,ionize,34);
    return rfFlight(ionizationPoint,[170,313],Math.min(t,.226),ionize,.226,34);
  }
  function ejected(t){
    const start=ionizationPoint;
    if(t<exit){
      const u=part(t,ionize,exit),v=1-u;
      // The freed electron crosses the actual open part of the source grid.
      const p=[v*v*v*start[0]+3*v*v*u*432+3*v*u*u*744+u*u*u*898,
        v*v*v*start[1]+3*v*v*u*264+3*v*u*u*186+u*u*u*186];
      // The RF component fades at the downstream end of the winding.
      const strength=1-ease(part(p[0],350,439));
      if(!strength)return p;
      return rfFlight(p,p,t,ionize,exit,55*strength).map((v,i)=>between(p[i],v,strength));
    }
    const u=part(t,exit,.38);
    return [898+87.2*u,186+(aperture.top-8-186)*u*u]; // Contact with the near face at x=990.
  }
  function boundElectron(nucleus,t,index){
    if(index===0)return orbital(nucleus,t);
    // Choose the marker phase so the diffuse electron leads into the gas encounter.
    const a=(t-bound)*(3*tau-.85+1.18)/(.65-bound)-1.18;
    return [nucleus[0]+36*Math.cos(a),nucleus[1]+22*Math.sin(a)];
  }
  function acquired(t){
    const destination=boundElectron(nuclei(t)[0],t,1);
    if(t<bound)return arc([781,142],destination,[0,-3],ease(part(t,contact,bound)));
    return destination;
  }
  function neighbourWorld(t){
    const p=incident(encounter), target=[p[0],p[1]-15];
    if(t<=encounter)return flightWorld([354,147],target,t,0,encounter,incidentWorld(encounter)[2]);
    return flightWorld(target,[15,165],t,encounter,.124,incidentWorld(encounter)[2]);
  }
  const neighbourAt=t=>project(...neighbourWorld(t));
  function sourceFrame(t){
    const [tracked,sibling]=nuclei(t);
    const electron=incident(t);
    const neighbour=t<.124?neighbourAt(t):null;
    return {tracked,sibling,incident:electron,neighbour,donorBound:t<release,projectile:projectile(t),
      ejected:t>=ionize?ejected(t):null,surface:t>=contact?acquired(t):null,
      molecular:t<hit,siblingBound:t<ionize,surfaceBound:t>=bound};
  }
  function drawField(c,t,at,line,opacity=1,weight=1){
    const phase=rfPhase(t),rf=Math.sin(phase);
    c.save();c.globalAlpha*=opacity;
    for(const x of loopStations){
      const r=loopRadius;
      line(c,Array.from({length:65},(_,i)=>at(x,r,tau*i/64)),HiFyzikoParticleStyle.fields.electric+'c9',1.6*weight,[4*weight,5*weight]);
      for(const offset of [0,Math.PI]){
        const a=offset-.65*Math.cos(phase);
        const p=at(x,r,a),q=at(x,r,a+.015*Math.sign(rf));
        const dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy);
        if(len && Math.abs(rf)>.03){
          c.save();c.translate(...p);c.rotate(Math.atan2(dy,dx));c.scale(weight,weight);c.globalAlpha*=Math.abs(rf);
          c.beginPath();c.moveTo(5,0);c.lineTo(-4,-3.5);c.lineTo(-4,3.5);c.closePath();c.fillStyle=HiFyzikoParticleStyle.fields.electric;c.fill();c.restore();
        }
      }
    }
    c.restore();
  }
  function draw(c,f,art,zoom,centerY){
    const {line,dot,circle,sphere,plate,arrow,label}=art,t=Math.min(f.t,exit);
    const departed=f.t>=exit;
    const {colors,fields}=HiFyzikoParticleStyle;
    const hex=n=>'#'+n.toString(16).padStart(6,'0');
    const elec=hex(colors.e),steel='#587784',violet='#685274';
    const state=sourceFrame(t);
    const close=ease(part(t,.202,.246));
    c.save();
    function halo(x,y,rx,ry,color,strength){
      c.save();c.translate(x,y);c.scale(rx,ry);
      const g=c.createRadialGradient(0,0,0,0,0,1);
      g.addColorStop(0,color+strength);g.addColorStop(.62,color+'28');g.addColorStop(1,color+'00');
      dot(c,0,0,1,g);c.restore();
    }
    function core(p){
      art.nucleus(c,...p);
    }
    function mark(p){art.electron(c,...p);}
    function flight(fn,start,col){
      art.tail(c,fn,Math.max(start,t-.011),t,col,3.3);mark(fn(t));
    }
    function callout(words,at,anchor,align='center'){
      if(art.overview)return;
      const [x,y]=at;
      const baseline=label(c,words,x,y,'#234953',15/Math.sqrt(zoom),align);
      const start=anchor[1]<baseline?baseline-17/Math.sqrt(zoom):baseline+4;
      line(c,[[x,start],anchor],'#64818a',1);
    }
    function flash(p,start){
      const u=(t-start)/.009;
      if(u<0||u>1)return;
      c.save();c.globalAlpha=1-u;halo(...p,21+32*u,18+28*u,'#eab967','c4');
      circle(c,...p,9+27*u,'#b77c395c',1.4);c.restore();
    }
    // Open near side of the winding exposes the gas and the field inside it.

    const tilt=art.tilt;
    if(zoom<1.13){
      label(c,'Vysokofrekvenční cívka',28,18,steel,16,'left');
      label(c,'Plazmová mřížka',805,18,steel,16);
    }
    halo(235,177,230,118,'#bb92c5','48');
    if(!art.vectorRF)drawField(c,f.t,ring,line,tilt);
    // Dim, untracked gas and electrons give a moving background without obscuring either collision.
    for(let i=0;i<33;i++){
      const electron=i%4===0,now=f.t,drift=electron?720:94,offset=(i*131+now*drift)%668;
      if(electron && art.vectorRF)continue;
      const path=electron?v=>ambientElectron(i,v):
        v=>[25+(i*131+v*drift)%668,70+(i*47)%220+4*Math.sin(v*31+i)];
      const [x,y]=path(now);
      c.save();c.globalAlpha=electron?.54:(t>=hit?.16:.32);
      art.tail(c,path,(electron?Math.max(0,now-.012):Math.max(0,now-.016,now-offset/drift)),now,electron?elec:'#887f96',electron?2.6:1.8,9);
      if(electron)dot(c,x,y,2.8,elec);
      else{dot(c,x-1.9,y,2.9,'#887f96');dot(c,x+2,y+1,2.7,'#988ea3');}
      c.restore();
    }
    // Negative ions leave the caesiated upstream face and reach an extraction aperture.
    for(const [top,bottom] of [[54,aperture.top],[aperture.bottom,318]]){

      for(let y=top+8;y<bottom-3;y+=14){
        for(let x=758;x<839;x+=17){
          const px=x+(Math.round((y-top)/14)%2)*4;
          sphere(c,px,y,4.7,'#97adb0');
        }
      }

      for(let y=top+5;y<bottom;y+=11)sphere(c,746,y,4.6,'#d5ad63');
    }
    if((zoom<1.04 || close>.72) && t<.282){
      label(c,'Vrstva cesia',653,109,'#82632e',14/Math.sqrt(zoom));line(c,[[681,106],[712,97],[744,97]],'#a48953');
    }
    if(t>=bound || (zoom<1.04 && t<.231))label(c,'Extrakční otvor',815,196,steel,13/Math.sqrt(zoom));
    const ionizingApproach=t>=.14 && t<ionize;
    const {tracked,sibling}=state;
    if(!art.vectorRF && state.molecular){
      c.save();c.translate((tracked[0]+sibling[0])/2,161);c.scale(1.55,1);art.electronCloud(c,0,0,29);c.restore();
      line(c,[tracked,sibling],'#6e94a7',3);
    }else{
      if(!art.vectorRF && state.siblingBound)art.electronCloud(c,...sibling);
    }
    if(!state.molecular)art.tail(c,v=>nuclei(v)[1],Math.max(hit,t-.014),t,'#74858c',3.2);
    if(!art.vectorRF)core(sibling);
    if(!departed){
      if(!state.molecular)art.tail(c,v=>nuclei(v)[0],Math.max(hit,t-.012),t,state.surfaceBound?'#6855a2':'#18786e',4);
      if(!art.vectorRF && state.molecular){core(tracked);mark(orbital(tracked,t));}
      else art.atom(c,...tracked,state.surfaceBound?2:1,t,1,ease(part(t,contact,bound)));
    }
    if(!art.vectorRF && state.siblingBound)mark(orbital(sibling,t,true));
    if(t<.067){
      c.save();c.globalAlpha=1-ease(part(t,.032,.067));
      if(!art.vectorRF && state.donorBound)art.electronCloud(c,...donor);
      if(!art.vectorRF)core(donor);
      if(state.donorBound){
        const [px,py]=point([18,154],donor,part(t,.012,release));
        const wave=Array.from({length:25},(_,i)=>[px-18+i*.75,py-9+i*.375+3*Math.sin(i*Math.PI/4)]);
        line(c,wave,'#88528b',2.4);
        label(c,'Ionizující foton',72,141,'#794c79',13);
      }
      callout(state.donorBound?'Atom deuteria':'Kladný deuteron',[89,281],[donor[0],donor[1]+12]);
      c.restore();
    }
    if(state.neighbour && !art.vectorRF){
      c.save();c.globalAlpha=.32+.68*ease(part(t,.037,.042))*(1-ease(part(t,.070,.078)));
      art.tail(c,neighbourAt,Math.max(0,t-.011),t,'#478dac',3.3);mark(state.neighbour);
      c.restore();
    }
    if(t<.188){c.save();if(t>=.14)c.globalAlpha=.32;
      if(state.donorBound){if(!art.vectorRF)mark(state.incident);}else if(!art.vectorRF || t>=hit)flight(incident,release,'#267db5');
      c.restore();
    }
    if(t<.226 && !art.vectorRF){
      c.save();c.globalAlpha=.32+.68*ease(part(t,.13,.14));
      art.tail(c,projectile,Math.max(0,t-(ionizingApproach?.023:.011)),t,'#267db5',3.3);
      mark(state.projectile);c.restore();
    }
    if(state.ejected && !departed)flight(ejected,ionize,'#1882ae');
    if(t<contact)mark([781,142]);
    if(state.surface && !departed){
      if(!state.surfaceBound){
        halo(740,124,28,22,'#d8ad65','ac');
        art.tail(c,acquired,Math.max(contact,t-.006),t,'#287e9c',3.3);
      }
      if(!state.surfaceBound)mark(state.surface);
    }
    flash([356,162],hit);flash(ionizationPoint,ionize);
    if(t<.1){
      callout('Molekula deuteria',[416,110],[tracked[0]+8,141]);
      callout(state.donorBound?'Vázaný elektron':'Sledovaný elektron',[151,249],[state.incident[0],state.incident[1]+9]);
    }else if(t<.14){
      callout('Sledovaný atom',[467,98],[tracked[0]+4,tracked[1]-14]);
      callout('Druhý atom',[302,284],[sibling[0],sibling[1]+21]);
    }else if(t<.231){
      callout('Sledovaný neutrální atom',[539,90],[tracked[0],tracked[1]-21]);
      if(t>=ionize){
        callout('Kladný deuteron',[157,213],[sibling[0]-11,sibling[1]-5]);
        if(t<.21)callout('Vyražený elektron',[state.ejected[0]+36,295],state.ejected);
      }else callout('Přilétající elektron',[140,289],state.projectile);
    }else if(t<bound){
      callout('Neutrální atom',[615,166],[tracked[0]-16,tracked[1]+12]);
      callout(t<contact?'Elektron v kovu':'Elektron z kovu',[801,191],state.surface||[781,142]);
    }else if(!departed){
      callout('Iont D⁻',[tracked[0]-64,Math.max(139,centerY-177/zoom+18)],[tracked[0]-12,tracked[1]+13]);
      if(t>=.302){
        arrow(c,804,244,-41,0,fields.electric);
        label(c,'Elektrické pole',716,254,fields.electric,13/Math.sqrt(zoom));
      }
    }
    c.restore();
  }
  return {draw,drawField,project,inPlane,orbital,neighbourWorld,projectileWorld,incidentWorld,electricField,ambientWorld,ringWorld,loopStations,rfPhase,lastReferenceTurn,sourceFrame,boundElectron,ejected,ambientElectron,aperture};
})();
