/* Slowed, reproducible close-up of two electron collisions and surface conversion.
   Coordinates belong to the teaching view, not a kinetic plasma solver. */
const InjectorSource = (() => {
  const tau=2*Math.PI, hit=.10, ionize=.18, contact=.254, bound=.27, exit=.34;
  const rfPhase=t=>3*Math.PI*t/hit+.55;
  const clamp=x=>Math.max(0,Math.min(1,x));
  const part=(t,a,b)=>clamp((t-a)/(b-a));
  const between=(a,b,u)=>a+(b-a)*u;
  const ease=u=>u*u*(3-2*u);
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
    const a=t*53+(other?2.6:-.4);
    return [nucleus[0]+25*Math.cos(a),nucleus[1]+17*Math.sin(a)];
  }
  function incident(t){
    if(t<=hit){
      const u=t/hit;
      // Positive drift plus RF velocity modulation. Local electric force is -e E.
      const displacement=v=>v-.74*(Math.sin(rfPhase(v*hit))-Math.sin(.55))/(3*Math.PI);
      const d=displacement(u)/displacement(1);
      return point([60,206],[356,162],d);
    }
    return point([356,162],[586,28],(t-hit)/.11);
  }
  function projectile(t){
    if(t<ionize)return point([53,292],[263,242],(t-.14)/.04);
    return point([263,242],[450,277],(t-ionize)/.065);
  }
  function ejected(t){
    const start=orbital([263,242],ionize,true);
    return point(start,[200,365],(t-ionize)/.055);
  }
  function acquired(t){
    const nucleus=nuclei(t)[0],a=(t-bound)*44-1.18;
    const destination=[nucleus[0]+36*Math.cos(a),nucleus[1]+22*Math.sin(a)];
    if(t<bound)return arc([781,142],destination,[0,-3],ease(part(t,contact,bound)));
    return destination;
  }
  function sourceFrame(t){
    const [tracked,sibling]=nuclei(t);
    return {tracked,sibling,incident:incident(t),projectile:projectile(t),
      ejected:t>=ionize?ejected(t):null,surface:t>=contact?acquired(t):null,
      molecular:t<hit,siblingBound:t<ionize,surfaceBound:t>=bound};
  }
  function draw(c,w,h,f,art){
    const {line,dot,circle,sphere,plate,arrow,label}=art,t=f.t;
    const {colors,fields}=HiFyzikoParticleStyle;
    const hex=n=>'#'+n.toString(16).padStart(6,'0');
    const elec=hex(colors.e),steel='#587784',violet='#685274';
    const state=sourceFrame(t);
    const s=Math.min(w/920,h/354);
    c.save();c.translate((w-920*s)/2,(h-354*s)/2);c.scale(s,s);
    const collision=ease(part(t,.04,.09)),close=ease(part(t,.202,.246));
    const zoom=between(1+.42*collision,2.38,close);
    const centerX=between(460-92*collision,688,close);
    const centerY=between(177+16*collision,145+66*ease(part(t,bound,.313)),close);
    c.beginPath();c.rect(0,0,920,354);c.clip();
    c.translate(460,177);c.scale(zoom,zoom);
    c.translate(-centerX,-centerY);
    function halo(x,y,rx,ry,color,strength){
      c.save();c.translate(x,y);c.scale(rx,ry);
      const g=c.createRadialGradient(0,0,0,0,0,1);
      g.addColorStop(0,color+strength);g.addColorStop(.62,color+'28');g.addColorStop(1,color+'00');
      dot(c,0,0,1,g);c.restore();
    }
    function cloud(p,r=43){
      halo(...p,r,r*.78,'#56a9c8','73');
    }
    function core(p){
      sphere(c,p[0]-4,p[1]-1,9,hex(colors.p));sphere(c,p[0]+5.5,p[1]+1.6,8.7,hex(colors.n));
    }
    function mark(p){sphere(c,...p,5.3,elec);}
    function flight(fn,start,col){
      const lo=Math.max(start,t-.011),pts=[];
      for(let i=0;i<=18;i++)pts.push(fn(between(lo,t,i/18)));
      line(c,pts,col,2.4);mark(pts.at(-1));
    }
    function callout(words,at,anchor,align='center'){
      const [x,y]=at;
      const start=anchor[1]<y?y-17/Math.sqrt(zoom):y+4;
      line(c,[[x,start],anchor],'#64818a',1);
      label(c,words,x,y,'#234953',15/Math.sqrt(zoom),align);
    }
    function flash(p,start){
      const u=(t-start)/.009;
      if(u<0||u>1)return;
      c.save();c.globalAlpha=1-u;halo(...p,21+32*u,18+28*u,'#eab967','c4');
      circle(c,...p,9+27*u,'#b77c395c',1.4);c.restore();
    }
    const wash=c.createLinearGradient(0,45,0,332);
    wash.addColorStop(0,'#e3eded');wash.addColorStop(.45,'#f9fbf8');wash.addColorStop(1,'#d1e1e3');
    c.fillStyle=wash;c.fillRect(10,51,900,271);
    // The driver is shown in a longitudinal cut; the two wall surfaces expose the turns.
    for(const y of [48,318]){
      plate(c,10,y,896,7,'#d8e7e7','#839da4');
      for(let x=29;x<425;x+=39){
        line(c,[[x,y-4],[x+7,y+9]],'#794d3c',9);
        line(c,[[x-1,y-4],[x+6,y+9]],'#d6a173',5);
        line(c,[[x-2,y-4],[x+5,y+9]],'#f1c494',1.7);
      }
    }
    if(zoom<1.13){
      label(c,'Vysokofrekvenční cívka',28,30,steel,16,'left');
      label(c,'Plazmová mřížka',805,30,steel,16);
    }
    const rf=Math.sin(rfPhase(t));
    c.save();
    for(let x=32;x<205;x+=39){
      c.beginPath();c.ellipse(x,186,16,135,-.012,-Math.PI/2,Math.PI/2);
      c.lineWidth=4;c.strokeStyle='#ae784b50';c.stroke();
      const a=1.2*Math.sin(rfPhase(t));
      const y=186+135*Math.sin(a);
      dot(c,x+16*Math.cos(a),y,3.5,'#d1a561');
    }
    c.restore();
    halo(235,177,230,118,'#bb92c5',Math.abs(rf)>.5?'6e':'42');
    // Dim, untracked gas and electrons give a moving background without obscuring either collision.
    for(let i=0;i<33;i++){
      const x=25+((i*131+t*(i%4===0?720:94))%668),y=70+((i*47)%220)+4*Math.sin(t*31+i);
      c.save();c.globalAlpha=t>=hit?.16:.32;
      if(i%4===0){
        const jitter=22*Math.sin(rfPhase(t)+i*.13);
        line(c,[[x+jitter-6*Math.cos(rfPhase(t)+i*.13),y],[x+jitter,y]],elec,1.2);
        dot(c,x+jitter,y,2.3,elec);
      }
      else{dot(c,x-1.9,y,2.9,'#887f96');dot(c,x+2,y+1,2.7,'#988ea3');}
      c.restore();
    }
    // Negative ions leave the caesiated upstream face and reach an extraction aperture.
    for(const [top,bottom] of [[54,174],[263,318]]){
      plate(c,748,top,96,bottom-top,'#a0b7be','#597784');
      for(let y=top+8;y<bottom-3;y+=14){
        for(let x=758;x<839;x+=17){
          const px=x+(Math.round((y-top)/14)%2)*4;
          sphere(c,px,y,4.7,'#97adb0');
        }
      }
      c.fillStyle='#b99356';c.fillRect(744,top,5,bottom-top);
      for(let y=top+5;y<bottom;y+=11)sphere(c,746,y,4.6,'#d5ad63');
    }
    if((zoom<1.04 || close>.72) && t<.282){
      label(c,'Vrstva cesia',653,109,'#82632e',14/Math.sqrt(zoom));line(c,[[681,106],[712,97],[744,97]],'#a48953');
    }
    if(zoom<1.04 || t>=bound)label(c,'Extrakční otvor',815,196,steel,13/Math.sqrt(zoom));
    if(t<hit){
      label(c,'Indukované elektrické pole',178,90,fields.electric,15);
      for(let j=0;j<3;j++){
        const x=100+j*75;
        if(Math.abs(rf)>.04)arrow(c,x+21*rf,109,-42*rf,6.3*rf,fields.electric);
      }
    }
    const {tracked,sibling}=state;
    if(state.molecular){
      halo((tracked[0]+sibling[0])/2,161,65,37,'#589ebe','90');
      line(c,[tracked,sibling],'#6e94a7',3);
    }else{
      cloud(tracked,state.surfaceBound?50:42);
      if(state.siblingBound)cloud(sibling);
    }
    if(!state.molecular)circle(c,...tracked,15,state.surfaceBound?'#6855a2':'#18786e',1.6);
    core(sibling);core(tracked);
    mark(orbital(tracked,t));
    if(state.siblingBound)mark(orbital(sibling,t,true));
    if(t<=.25){c.save();if(t>=.14)c.globalAlpha=.32;flight(incident,0,'#267db5');c.restore();}
    if(t>=.14 && t<.30)flight(projectile,.14,'#267db5');
    if(state.ejected)flight(ejected,ionize,'#1882ae');
    if(t>=.22 && t<contact)mark([781,142]);
    if(state.surface){
      if(!state.surfaceBound){
        halo(740,124,28,22,'#d8ad65','ac');
        line(c,[[781,142],state.surface],'#287e9c',2);
      }
      mark(state.surface);
    }
    flash([356,162],hit);flash([263,242],ionize);
    if(t<.1){
      callout('Molekula deuteria',[416,110],[tracked[0]+8,141]);
      callout('Volný elektron',[123,257],[state.incident[0],state.incident[1]+9]);
    }else if(t<.14){
      callout('Sledovaný atom',[467,98],[tracked[0]+4,tracked[1]-14]);
      callout('Druhý atom',[302,284],[sibling[0],sibling[1]+21]);
    }else if(t<.231){
      callout('Sledovaný neutrální atom',[539,90],[tracked[0],tracked[1]-21]);
      if(t>=ionize){
        callout('Kladný deuteron',[157,213],[sibling[0]-11,sibling[1]-5]);
        if(t<.21)callout('Vyražený elektron',[183,295],state.ejected);
      }else callout('Přilétající elektron',[140,289],state.projectile);
    }else if(t<bound){
      callout('Neutrální atom',[615,166],[tracked[0]-16,tracked[1]+12]);
      callout(t<contact?'Elektron v kovu':'Elektron z kovu',[801,191],state.surface||[781,142]);
    }else{
      callout('Iont se dvěma elektrony',[581,Math.max(139,centerY-177/zoom+18)],[tracked[0]-12,tracked[1]+13]);
      if(t>=.302){
        arrow(c,804,244,-41,0,fields.electric);
        label(c,'Elektrické pole',784,256,fields.electric,13/Math.sqrt(zoom));
      }
    }
    c.restore();
  }
  return {draw,sourceFrame};
})();
