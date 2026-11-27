function electronPacketProfile(S,T,cache){
  const time=T*1.5;
  if(cache.packetProfile?.time!==time)cache.packetProfile=ElectronPhysics.packetProfile(S.p,S.width,time);
  return cache.packetProfile;
}

function drawElectronExperiment(env){
  const {p,P,S,T,cache,scale,chapter,read,plot}=env;
  const {line,dot,ring,tube,label,arrow}=p,{electron,path:teal,positive:gold,nucleus:red}=electronInk,blue='#356ac3',glass='#a7cee52e';
  const seq=(n,fn)=>Array.from({length:n},(_,i)=>fn(i/(n-1),i));
  const curve=(points,color=teal,bar=false)=>({points,color,bar});
  const cycle=t=>t-Math.floor(t);
  const value=(sym,num,unit='',digits=3)=>read(sym,num,unit,digits);
  if(chapter===0){
    const data=cache.beam??=P.tube(S.U,S.E*1000,S.B*.001),arr=data.path;
    const normalized=s=>[s[0]*10,s[1]*10,0],track=arr.map(normalized);
    tube(-.94,.94,.29,'#6995ab',glass);tube(-.94,-.87,.12,'#6c8c9d','#71899555');tube(-.76,-.72,.16,'#6c8c9d','#7d899850');
    ring([.91,0,0],.265,teal,'yz','#70ae8d35');
    for(let j=-3;j<=3;j++){const y=j*.065,z=Math.sqrt(.255**2-y*y);
      line([[.912,y,-z],[.912,y,z]],'#8fdac147');line([[.912,-z,y],[.912,z,y]],'#8fdac147');}
    ring([.914,0,0],.047,'#475f6d','yz',null,'3 2');
    for(const x of [-.80,.79]){ring([x,0,0],.292,'#d4e2d582','yz');tube(x-.012,x+.012,.296,'#7899a5','#748d9926');
      line([[x,-.27,-.07],[x,-.36,-.07],[x,-.36,.07],[x,-.27,.07]],'#8da4a8',2,'#6279856b');}
    line(seq(180,f=>[-.91+.08*f,.042*Math.cos(f*31),.042*Math.sin(f*31)]),gold,1.8);
    for(const z of [-.34,.34])line(seq(320,f=>[.225*Math.cos(f*P.tau*5),.225*Math.sin(f*P.tau*5),z+(f-.5)*.055]),'#96a8d2',1.4);
    line([[-.86,.192,-.20],[.83,.192,-.20]],'#d7f8ee4a',1.4);
    for(const sign of [-1,1]){
      const y=sign*.25;line([[-.35,y,-.15],[.35,y,-.15],[.35,y,.15],[-.35,y,.15]],'#d5b377',1,'#bd925b88');
      ring([0,0,.34*sign],.22,blue,'xy');
    }
    if(!S.vectors){for(const x of [-.25,0,.25]){
      if(S.E)arrow([x,-.17,-.08],[x,.17,-.08],'#b57825');
      if(S.B)arrow([x,-.08,-.15],[x,-.08,.15],'#356ac3');
    }}
    p.trace(track,teal,2.15);
    const t=cycle(T/4),idx=t*(arr.length-1),motion=P.samplePath(arr,idx),particle=normalized(motion),particleRadius=.021;
    const end=track.at(-1);
    if(end[0]>=.9){const [x,y]=p.proj(end),fill=p.gradient('radialGradient','',[[0,'#a6f1c7'],[.36,'#85d6ad82'],[1,'#85d6ad00']]);p.disk(x,y,13,fill);}
    dot(end,.014,teal,true);
    if(!S.vectors&&Math.abs(motion[0])<.035){
      const [x,y]=particle,ux=motion[2],uy=motion[3];
      const gamma=Math.hypot(1,ux/P.c,uy/P.c),speed=Math.hypot(ux,uy);
      if(speed>0)arrow(particle,[x+.12*ux/speed,y+.12*uy/speed,0],teal,particleRadius);
      arrow(particle,[x,y-.13*S.E/10,0],gold,particleRadius);
      const magneticScale=.13*S.B/(1e7*gamma);
      arrow(particle,[x-magneticScale*uy,y+magneticScale*ux,0],blue,particleRadius);
    }
    p.glow(particle,.087,electron);dot(particle,particleRadius,electron,true);
    p.callout([-.89,-.10,0],[-.86,-.42,0],'Katoda');
    p.callout([-.74,.10,0],[-.67,.42,0],'Anoda');
    p.callout([.91,-.12,0],[.84,-.43,0],'Stínítko','end');
    const yMm=arr.at(-1)[1]*1000;
    value('v_0',P.speed(S.U),'m/s');value('t',idx*data.dt*1e9,'ns');value('y',Math.abs(yMm)<.0005?0:yMm,'mm');
    if(env.balance){value('v_{\\text{ulož}}',env.balance,'m/s');if(S.E===0&&S.B>0){
      const inside=arr.filter(s=>Math.abs(s[0])<.034);
      if(inside.length>=3){const a=inside[0],b=inside[Math.floor(inside.length/2)],c=inside.at(-1),dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
        const r=dist(a,b)*dist(b,c)*dist(a,c)/(2*Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])));
        value('r',r*1e3,'mm');value('e/m_e',env.balance/(S.B*.001*r),'C/kg');}}}
    scale('18\\,\\mathrm{cm}\\quad\\text{od katody ke stínítku}');
    plot('Výchylka svazku podél trubice',[
      {points:[[-9,0],[9,0]],color:'#7e9ca9',strokeWidth:1.2,dash:'4 4'},
      curve(arr.map(s=>[s[0]*100,s[1]*1000]))
    ],-9,9,-27,27,'x','cm','y','mm',{xLabel:'Poloha v trubici',yLabel:'Výchylka svazku'});
  }else if(chapter===1){
    const count=600,dt=.013,idx=Math.min(count,T*45),t0=Math.sqrt(P.m*(S.R*1e-12)**3/P.k);
    if(!cache.states){const states=[P.ring(S.N,S.kick)];for(let i=0;i<count;i++)states.push(P.verlet(...states[i],dt,P.sphereForce));cache.states=states;}
    const a=P.sampleRing(cache.states,T),r=.64;
    const particleRadius=.035,forces=P.sphereForce(a),particles=[];
    p.sphere(r);
    for(let i=0;i<S.N;i++){
      const pos=a.slice(i*3,i*3+3),xyz=pos.map(x=>x*r),factor=-S.N/Math.max(1,Math.hypot(...pos)**3);
      const bg=pos.map(x=>factor*x),f=forces.slice(i*3,i*3+3);
      arrow(xyz,xyz.map((x,j)=>x+.055*bg[j]),gold,particleRadius);
      arrow(xyz,xyz.map((x,j)=>x+.055*(f[j]-bg[j])),blue,particleRadius);
      particles.push(xyz);
    }
    particles.sort((a,b)=>p.proj(a)[2]-p.proj(b)[2]);
    for(const particle of particles){p.glow(particle,.072,electron);dot(particle,particleRadius,electron,true);}
    value('t',idx*dt*t0*1e15,'fs');value('\\omega_0',Math.sqrt(S.N)/t0,'s^{-1}');scale('R='+S.R+'\\,\\mathrm{pm}');
    if(S.N===1&&S.kick>0&&!S.field)value('T',P.tau*t0*1e15,'fs');
    if(S.field){const R=S.R*1e-12,f=S.N*P.k/P.e/R,amplitude=S.field===1?f/R:f;
      const pts=seq(151,x=>{const u=x*2;return [u*S.R,amplitude*(S.field===1?(u<1?u:1/u**2):(u<1?(3-u*u)/2:1/u))];});
      plot(S.field===1?'Radiální elektrické pole kladné koule':'Potenciál kladné koule vzhledem k nekonečnu',[curve(pts)],0,2*S.R,0,Math.max(...pts.map(a=>a[1])),'r','pm',S.field===1?'E_r':'\\Phi',S.field===1?'V/m':'V',{xLabel:'Vzdálenost od středu',yLabel:S.field===1?'Radiální pole':'Potenciál'});
    }else {
      const end=count*dt*t0*1e15;
      const span=S.N===1&&S.kick>0?S.R*S.kick*1.25:S.R;
      const position=curve(cache.states.map(([p],i)=>[i*dt*t0*1e15,p[0]*S.R]));
      const cursor={points:[[idx*dt*t0*1e15,a[0]*S.R]],color:teal,marker:true};
      const center={points:[[0,0],[end,0]],color:'#7e9ca9',strokeWidth:1.2,dash:'4 4'};
      plot('Poloha prvního elektronu • netlumený pohyb',[center,position,cursor],0,end,-span,span,'t','fs','x','pm',{xLabel:'Čas',yLabel:'Poloha elektronu'});
    }
  }else if(chapter===2){
    const s=cache.scat??=P.scatter(S.E,S.Z,S.b,!!S.target),view=S.target?2e5:Math.max(100,6*s.length,S.b*2),indices=s.path.map(([x,y],i)=>Math.hypot(x,y)<view*1.3?i:-1).filter(i=>i>=0),coords=indices.map(i=>[s.path[i][0]/view*.48,s.path[i][1]/view*.48,0]);
    if(!S.view){
      if(S.target)p.sphere(.48*1e5/view);else {p.glow([0,0,0],.13,red);dot([0,0,0],.032,red,true);}
      const b=S.b/view*.48;
      line([[-.66,b,0],[.66,b,0]],'#9db3bf',1,null,'4 4');p.trace(coords,teal);
      const t0=s.times[indices[0]],duration=s.times[indices.at(-1)]-t0,t=cycle(T/5)*duration;
      const upper=indices.findIndex(i=>s.times[i]>=t+t0),lower=Math.max(0,upper-1);
      const part=upper>lower?(t+t0-s.times[indices[lower]])/(s.times[indices[upper]]-s.times[indices[lower]]):0;
      const position=P.mixSamples(coords[lower],coords[upper<0?coords.length-1:upper],upper<0?1:part);
      value('t',t*s.length*1e-15/Math.sqrt(2*S.E*1e6*P.e/6.64465734e-27)*1e21,'zs');
      p.glow(position,.083,gold);dot(position,.026,gold,true);p.callout([0,0,0],[.15,-.35,0],S.target?'Náboj v objemu atomu':'Náboj v jádře');
    }
    else{
      const hit=[.65*Math.cos(s.angle),.65*Math.sin(s.angle),0];
      ring([0,0,0],.65,'#77a2b1','xy','#ddedf33a');ring([0,0,0],.674,'#bdd6e1','xy');
      tube(-.86,-.62,.13,'#5983a0',glass);tube(-.53,-.43,.08,'#5983a0',glass);
      const foil=p.gradient('linearGradient','x2="1" y2="1"',[[0,'#fff5d5'],[.52,'#e9bf79'],[1,'#ad793c']]);
      line([[0,-.23,-.2],[0,.23,-.2],[0,.23,.2],[0,-.23,.2]],gold,1,foil);
      p.trace([[-.8,0,0],[0,0,0],hit],teal);
      p.glow(hit,.12,gold);dot(hit,.035,gold,true);
      label([-.85,-.18,0],'Zdroj');label([-.51,-.13,0],'Kolimátor');label([0,-.27,0],S.Z===79?'Zlatá fólie':'Fólie terče');
    }
    value('\\theta',s.angle*180/Math.PI,'{}^\\circ');value('\\theta_{\\text{jádro}}',s.theory*180/Math.PI,'{}^\\circ');scale(S.view?'\\text{Schéma aparatury}':'r_{\\text{okna}}='+Math.round(view)+'\\,\\mathrm{fm}');
    if(!cache.hist){const bins=Array(18).fill(0),rng=P.random();const table=S.target?Array.from({length:33},(_,i)=>P.scatter(S.E,S.Z,i*5,true).angle):null;for(let i=0;i<5000;i++){const b=160*Math.sqrt(rng()),j=Math.floor(b/5),f=b/5-j,th=S.target?table[j]*(1-f)+table[j+1]*f:2*Math.atan2(s.length,b);bins[Math.min(17,Math.floor(th*18/Math.PI))]++;}
      // Diffuse sphere: all permitted b are far below R and deflect into the first bin.
      const area=th=>Math.min(160,s.length/Math.tan(th/2))**2;
      cache.hist=[{...curve(bins.map((n,i)=>[5+10*i,n]),teal,true),binWidth:10,label:'Zvolený model'},
        {...curve(bins.map((_,i)=>[5+i*10,5000*(area(i*Math.PI/18)-area((i+1)*Math.PI/18))/160**2]),'#b57825'),label:'Výpočet pro jádro'}];}
    const [bins]=cache.hist,yMax=Math.max(...cache.hist.flatMap(s=>s.points.map(a=>a[1])));
    const backwards=bins.points.slice(9).reduce((sum,[,count])=>sum+count,0);
    value('N_{\\text{zpět}}',backwards);
    const boundary={points:[[90,0],[90,yMax]],color:'#7e9ca9',dash:'4 4',strokeWidth:1.1};
    plot('Zásahy podle úhlu odklonu',[boundary,...cache.hist],0,180,0,yMax,'\\theta','{}^\\circ','N','',{xLabel:'Úhel odklonu',yLabel:'Počet zásahů'});
  }else if(chapter===3){
    const r0=S.R*P.a0,viewAt=t=>P.collapseView(r0,t,S.rad),{end,time,state:s}=viewAt(T);
    drawClassicalOrbit(p,viewAt,T,r0,S.rad,{radiation:true});
    value('r',s.r*1e12,'pm');value('E',s.E/P.e,'eV');value('v',s.v,'m/s');value('P_{\\rm rad}',S.rad?s.P:0,'W');value('t',time*1e12,'ps');scale('r_0='+env.fmt(r0*1e12)+'\\,\\mathrm{pm}');
    const radiusCurve={...curve(seq(200,f=>[f*end*1e12,(S.rad?P.collapse(r0,end*f).r:r0)*1e12])),area:true};
    const cursor={points:[[time*1e12,s.r*1e12]],color:teal,marker:true};
    plot('Poloměr při energetické ztrátě',[radiusCurve,cursor],0,end*1e12,0,r0*1e12*1.05,'t','ps','r','pm',{xLabel:'Čas',yLabel:'Poloměr dráhy'});
  }else if(chapter===4){
    const setup=cache.bohrTrial??S,{ni,nf,ion}=setup,Z=ion+1,energy=n=>P.energy(n,Z);
    const view=P.bohrScene(S,cache,T),{wavelength,transfer}=view,active=transfer>=.5?view.final:ni;
    drawBohrAtom(p,view,true);
    if(wavelength&&Z===1&&Math.min(ni,nf)===2&&Math.max(ni,nf)>=3){const balmer=[656.28,486.13,434.05,410.17];value('\\lambda_{\\rm vzduch}',wavelength/1.00028,'nm',5);value('\\lambda_{\\rm NIST}',balmer[Math.max(ni,nf)-3],'nm',5);}
    value('n',active);value('r_n',P.bohrLength(Z)*active**2*1e12,'pm');value('E_i',energy(ni),'eV');value('E_f',energy(nf),'eV');if(wavelength)value('\\lambda_{\\text{čára}}',wavelength,'nm');
    scale('\\text{'+view.status+'}');
    const spectrum=P.bohrSpectrum(S),graphZ=S.ion+1,lines=[];
    if(spectrum.balmer||!spectrum.reference){
      for(const [i,n] of [3,4,5,6].entries()){
        const selected=spectrum.balmer&&Math.max(S.ni,S.nf)===n;
        const position=P.h*P.c/((P.energy(n,graphZ)-P.energy(2,graphZ))*P.e)*1e9;
        const color=graphZ===1?['#db4942','#258c99','#5959c1','#71449f'][i]:'#72758b';
        lines.push({...curve([[position,1]],color,true),width:selected?7:3,label:selected?'Zvolený přechod':''});
      }
    }else lines.push({...curve([[spectrum.reference,1]],'#287f9e',true),width:7,label:'Zvolený přechod'});
    const tune=P.bohrGap(S)>0;
    if(tune){
      const x=spectrum.incident;
      lines.push({points:[[x,0],[x,1.16]],color:'#383d78',strokeWidth:2.25,dash:'5 4',label:'Laděný foton'});
    }
    const title=spectrum.reference&&!spectrum.balmer?'Okolí zvolené spektrální čáry':graphZ===1?'Balmerova série ve vakuu':'Přechody na druhou hladinu';
    plot(title,lines,spectrum.min,spectrum.max,0,1.22,'\\lambda','nm','\\text{Poloha čáry}','',{showY:false,xLabel:'Vlnová délka',tune});
  }else if(chapter===5){
    const wave=P.hydrogenRing(S.r,S.lambda,T*.1),{turns,whole,required,closed,allowed,kineticEv,circularKineticEv}=wave;
    const reference=S.reference+1;
    const waveColor=closed?electronInk.match:teal,joinColor=closed?waveColor:gold;
    const normalizeRadius=radius=>.78*radius/500;
    const targetRadius=P.a*1e12*reference*reference;
    drawHydrogenRing(p,normalizeRadius(S.r),wave,closed,{
      radius:normalizeRadius(targetRadius),color:hydrogenLevelColors[reference-1]+'79'
    });
    value('\\lambda_{\\text{pro oběh}}',required,'nm',4);
    value('E_{\\text{k, zkoušená}}',kineticEv,'eV',4);
    value('E_{\\text{k, pro oběh}}',circularKineticEv,'eV',4);
    if(reference>1)value('\\nu_{1\\to '+reference+'}',(P.energy(reference)-P.energy(1))*P.e/P.h/1e12,'THz',4);
    value('2\\pi r/\\lambda',turns,'',4);
    value('\\Delta\\varphi_{\\text{spoj}}',(closed?0:turns-whole)*360,'{}^\\circ');
    const status=allowed?'Povolená dráha vodíku':closed?'Fáze navazuje, energie pro oběh nesedí':'Fáze ve spoji nenavazuje';
    scale('\\text{'+status+'}'+(allowed?'\\quad n='+whole:''));
    plot('Fázový posun podél obvodu',[
      {...curve([[0,0],[1,turns]],waveColor),strokeWidth:3,label:'Zkoušená vlna'},
      {points:[[0,0],[1,reference]],color:hydrogenLevelColors[reference-1],dash:'6 4',label:'Cílová hladina'},
      {points:[[1,turns]],color:joinColor,marker:true}
    ],0,1,0,Math.max(3.35,Math.ceil(turns)+.35),'s/(2\\pi r)','','\\Delta\\varphi/(2\\pi)','',{xLabel:'Část obvodu',yLabel:'Počet period fáze'});
  }else if(chapter===6){drawOrbital(env);}
  else if(chapter===7){
    const {lambda,peak,points,signal}=cache.dif??=electronCrystal.diffraction(S.U);
    const intensity=signal(S.det),color=S.det===peak?electronInk.match:gold;
    const origin=[-.39,-.40,0],at=(angle,r)=>{const a=angle*Math.PI/180;return [origin[0]+r*Math.sin(a),origin[1]+r*Math.cos(a),0];};
    const det=at(S.det,.82),source=at(0,1.02),normal='#799aaa';
    const block=[[-.66,-.56,0],[-.12,-.56,0],[-.12,-.40,0],[-.66,-.40,0]];
    const metal=p.gradient('linearGradient','x2="0" y2="1"',[[0,'#c0dfed'],[1,'#517f9b']]);
    line(block,'#547c93',1.3,metal);
    for(let i=1;i<8;i++)dot([-.66+i*.0675,-.45,0],.014,'#397799',true);
    line(seq(64,f=>at(f*85,.82)),normal,1.2,null,'4 4');
    line([origin,at(0,1.08)],normal,1,null,'4 4');
    if(S.det>0)line(seq(24,f=>at(f*S.det,.28)),color,1.8);
    line([origin,at(0,.96)],teal,2.1);
    arrow(at(0,.32),at(0,.04),teal);
    for(let j=0;j<4;j++)dot(at(0,.07+.85*cycle(j/4-T*.42)),.011,electron,true);
    p.trace([origin,det],color,1.25+2.6*intensity);
    const head=(r,d)=>{const a=S.det*Math.PI/180,[x,y]=at(S.det,r);return [x+d*Math.cos(a),y-d*Math.sin(a),0];};
    line([head(.82,-.047),head(.82,.047),head(.925,.047),head(.925,-.047)],color,1.4,'#fff9ed');
    dot(det,.023,color,true);
    const [sx,sy]=p.proj(source);
    const sourceLabelOnLeft=sx>=123;
    p.rect(sx-11,sy-8,22,16,'#deeff2',teal,4);
    p.text(sx+(sourceLabelOnLeft?-16:16),sy+4,'Zdroj elektronů',sourceLabelOnLeft?'end':'start');
    const [nx,ny]=p.proj(at(0,.48));
    p.text(nx-10,ny+4,'Kolmice','end');
    const [dx,dy]=p.proj(det);
    const detectorLabelOnRight=dx+75<=p.w&&(sourceLabelOnLeft||dy-sy>=25||dx-sx>=105||dx<75);
    p.text(dx+(detectorLabelOnRight?16:-16),dy-11,'Detektor',detectorLabelOnRight?'start':'end');
    const [cx,cy]=p.proj([origin[0],-.63,0]);
    p.text(cx,Math.min(cy+8,p.h-6),'Krystal niklu','middle');
    value('\\lambda',lambda,'nm');value('I/I_{\\max}',intensity);
    scale('\\theta=' + env.fmt(S.det,4) + '{}^\\circ');
    const reference=S.U===54?[]:[{
      points:(cache.difReference??=electronCrystal.diffraction(54)).points,
      color:electronInk.level,dash:'5 4',label:'Výchozí napětí'
    }];
    plot('Změní napětí směr nejsilnějšího signálu?',[
      {...curve(points),area:true,label:reference.length?'Zvolené napětí':''},
      ...reference,
      {points:[[peak,0],[peak,1]],color:electronInk.match,dash:'3 4',label:'Nejsilnější směr'},
      {points:[[S.det,0],[S.det,intensity]],color,dash:'6 4',label:'Poloha detektoru'},
      {points:[[S.det,intensity]],color,marker:true}
    ],0,85,0,1.04,'\\theta','{}^\\circ','I/I_{\\max}','',{xLabel:'Úhel detektoru od kolmice',yLabel:'Relativní intenzita',tune:true,updateKey:S.U+'|'+S.det});
  }else if(chapter===8){
    const radius=.62*S.p,turn=radius?Math.min(1.12,1/radius):0;
    const chamber=[[-.60,-.58,0],[.76,-.58,0],[.76,.58,0],[-.60,.58,0]];
    line(chamber,'#8cb0c6',1.4,'#eaf3fbc7');
    for(let i=0;i<7;i++)for(let j=0;j<5;j++){
      const [x,y]=p.proj([-.49+.19*i,-.45+.225*j,0]);
      p.disk(x,y,4,'#f7fbff','#a3bdd8',.7);
      if(S.field)p.disk(x,y,1.45,blue);
      else{
        p.polyline([[x-1.5,y-1.5],[x+1.5,y+1.5]],blue,.9);
        p.polyline([[x-1.5,y+1.5],[x+1.5,y-1.5]],blue,.9);
      }
    }
    if(turn)arrow([-.83,0,0],[-.59,0,0],electronInk.frame);
    for(const [charge,color,name] of [[-1,electron,'Elektron'],[1,electronInk.level,'Pozitron']]){
      const entry=turn?0:charge*.075,bend=S.field?-charge:charge;
      const at=f=>[-.59+radius*Math.sin(turn*f),entry+bend*radius*(1-Math.cos(turn*f)),0];
      if(turn)p.trace(seq(90,at),color,2.6);
      const particle=at(.62);
      p.glow(particle,.065,color);dot(particle,.023,color,true);
      const side=turn?bend:charge;
      const [x,y]=p.proj([.50,side*.49,0]);
      p.disk(x-29,y,3.5,color,'#f7fbff',1);
      p.text(x,y+5,name,'middle');
    }
    const relativistic=q=>P.dirac(q).kinetic/1e6,classic=q=>q*q*P.rest/2e6;
    const actual=relativistic(S.p),estimate=classic(S.p),yMax=classic(4)*1.05;
    const series=cache.diracCurves??=[
      {...curve(seq(321,f=>[4*f,relativistic(4*f)])),label:'Relativistická'},
      {...curve(seq(321,f=>[4*f,classic(4*f)]),gold),label:'Klasická'}
    ];
    value('v/c',S.p/Math.hypot(1,S.p));
    value('E_{\\text{k, rel}}',actual,'MeV');
    value('E_{\\text{k, klas}}',estimate,'MeV');
    scale('r=\\frac{p}{eB}');
    plot('Jak se s hybností mění kinetická energie?',[
      ...series,{points:[[S.p,0],[S.p,yMax]],color:'#809eaf',dash:'4 4'},
      {points:[[S.p,estimate]],color:gold,marker:true},{points:[[S.p,actual]],color:teal,marker:true}
    ],0,4,0,yMax,'p/(m_ec)','','E_k','MeV',{xLabel:'Velikost hybnosti',yLabel:'Kinetická energie'});
  }else if(chapter===9){drawSlits(env);}
  else if(chapter===10){
    const {time,min,max,points,mean,deviation}=electronPacketProfile(S,T,cache),shots=cache.packetShots??[];
    const reference=!T&&S.width!==.25?(cache.packetReference??=P.packetProfile(S.p,.25,0)):null;
    const baselineShots=reference?cache.packetBaseline?.shots:null;
    const x=position=>-.86+(position-min)*1.72/(max-min);
    const strip=(low,high)=>[[x(min),low,0],[x(max),low,0],[x(max),high,0],[x(min),high,0]];
    function measureRow(samples,low,high,color,caption){
      line(strip(low,high),'#c3d5df',1,'#f2f8fc');
      const middle=(low+high)/2;
      if(caption){
        const [u,v]=p.proj([-.82,middle,0]);p.text(u,v+4,caption);
      }
      if(!samples.length){
        const [u,v]=p.proj([.13,middle,0]);p.text(u,v+4,'Změř polohu elektronu','middle');
      }
      p.marks(samples.map(([position,jitter])=>{
        const [u,v]=p.proj([x(position),low+(high-low)*(.12+.76*jitter),0]);
        return [u,v,color];
      }),4.2,.73,true);
    }
    const [markX,markY]=p.proj([0,.56,0]);p.text(markX,markY,'Výsledky měření polohy','middle');
    if(baselineShots){
      measureRow(baselineShots,.26,.45,electronInk.level,'Výchozí série');
      measureRow(shots,.03,.22,electron,'Nová série');
    }else{
      measureRow(shots,.03,.45,electron,'');
    }
    const [bandX,bandY]=p.proj([0,-.09,0]);p.text(bandX,bandY,'Předpověď pravděpodobnosti','middle');
    const density=p.gradient('linearGradient','x2="1" y2="0"',points.filter((_,i)=>i%5===0).map(([position,y])=>{
      const opacity=Math.min(255,Math.round(255*y/.5));
      return [(position-min)/(max-min),electron+opacity.toString(16).padStart(2,'0')];
    }));
    line(strip(-.32,-.17),'#a5c3d3',1,'#eaf3f7');
    line(strip(-.32,-.17),'none',0,density);
    function showInterval(center,width,y,color){
      line([[x(center-width),y,0],[x(center+width),y,0]],color,2);
      for(const edge of [center-width,center+width])line([[x(edge),y-.017,0],[x(edge),y+.017,0]],color,1.4);
    }
    showInterval(mean,deviation,-.37,teal);
    if(reference)showInterval(reference.mean,reference.deviation,-.44,electronInk.level);
    const [spreadX,spreadY]=p.proj([0,-.53,0]);p.text(spreadX,spreadY,'Nejistota polohy','middle');
    value('t',time*P.hb/(P.m*P.c**2)*1e21,'zs');
    value('\\Delta x/\\bar\\lambda_C',deviation);
    value('N_{\\text{měření}}',shots.length,'',9);
    scale('\\bar\\lambda_C='+env.fmt(P.hb/(P.m*P.c)*1e15)+'\\,\\mathrm{fm}');
    const series=[{...curve(points),area:true,label:'Zvolené nastavení'}];
    if(reference)series.push({points:reference.points,color:electronInk.level,dash:'5 4',label:'Výchozí nejistota hybnosti'});
    plot('Jak přesně lze určit polohu elektronu?',series,min,max,0,.54,'x/\\bar\\lambda_C','','w\\bar\\lambda_C','',{xLabel:'Poloha podél osy letu',yLabel:'Hustota pravděpodobnosti'});
  }else{
    const field=10**S.zoom,dx=P.hb*P.c/(10**S.q*P.e);
    drawResolutionScene(p,P,cache,field,dx);
    value('\\Delta x',dx,'m');value('qc',10**S.q,'eV');scale('L='+env.fmt(field)+'\\,\\mathrm m');
    plot('Rozlišení při změně přenosu hybnosti • logaritmické osy',[curve(seq(100,f=>{const q=2+12*f;return [q,Math.log10(P.hb*P.c/P.e)-q];})),{points:[[S.q,Math.log10(dx)]],color:gold,marker:true}],2,14,-21,-8,'\\log_{10}(qc/\\mathrm{eV})','','\\log_{10}(\\Delta x/\\mathrm m)','',{xLabel:'Přenesená hybnost',yLabel:'Délkové rozlišení',updateKey:S.q});
  }
}
