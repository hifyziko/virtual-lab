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
    const Z=S.ion+1,energy=n=>P.energy(n,Z),ni=S.ni,nf=S.nf;
    const view=P.bohrView(S,T),{wavelength,transition,progress}=view,active=progress>=0?view.final:ni;
    drawBohrAtom(p,view,true);
    if(wavelength&&Z===1&&Math.min(ni,nf)===2&&Math.max(ni,nf)>=3){const balmer=[656.28,486.13,434.05,410.17];value('\\lambda_{\\rm vzduch}',wavelength/1.00028,'nm',5);value('\\lambda_{\\rm NIST}',balmer[Math.max(ni,nf)-3],'nm',5);}
    value('n',active);value('r_n',P.bohrLength(Z)*active**2*1e12,'pm');value('E_i',energy(ni),'eV');value('E_f',energy(nf),'eV');if(wavelength)value('\\lambda_{\\rm vak}',wavelength,'nm');
    const status=ni===nf?'Stejná hladina':transition==='emission'?(progress<0?'Před emisí':'Foton emitován'):transition?(progress<0?'Foton přilétá':'Foton absorbován'):'Foton mimo rezonanci';
    scale('\\text{'+status+'}');
    const lines=[3,4,5,6].map((n,i)=>{
      const selected=Math.min(ni,nf)===2&&Math.max(ni,nf)===n;
      const position=P.h*P.c/((energy(n)-energy(2))*P.e)*1e9;
      const color=Z===1?['#db4942','#258c99','#5959c1','#71449f'][i]:'#72758b';
      return {...curve([[position,1]],color,true),width:selected?8:3};
    });
    plot(Z===1?'Balmerova série ve vakuu':'Přechody na druhou hladinu · ultrafialová oblast',lines,380/Z**2,700/Z**2,0,1.06,'\\lambda','nm','\\text{Poloha čáry}','',{showY:false,xLabel:'Vlnová délka'});
  }else if(chapter===5){
    const lambda=P.h/P.momentum(S.U)*1e9,r=S.r*.001,turns=P.tau*r/lambda,k=P.tau/lambda,v=P.momentum(S.U)/P.m*1e-6,time=T*.1;
    const packet=x=>{const q=P.hb/P.m*1e3*time/(2*S.sigma**2),z=x-v*time;
      const density=Math.exp(-z*z/(2*S.sigma**2*(1+q*q)))/(Math.sqrt(2*Math.PI)*S.sigma*Math.hypot(1,q));
      return [density,Math.sqrt(density)*Math.cos(k*x-k*v*time/2+q*z*z/(4*S.sigma**2*(1+q*q))-.5*Math.atan(q))];};
    if(!S.view){
      const rView=.66,points=seq(420,f=>[rView*Math.cos(P.tau*f),.13*Math.cos(P.tau*(turns*f-S.U*P.e/P.h*time*1e-15)),rView*Math.sin(P.tau*f)]);
      ring([0,0,0],rView,'#96b0bf','xz',null,'4 4');p.trace(points,teal);
      line([points[0],points.at(-1)],gold,2);
      dot(points[0],.015,gold,true);dot(points.at(-1),.015,gold,true);label([rView,.20,0],'Spoj');
    }else{
      const samples=seq(300,f=>{const x=(f-.5)*6+v*time;return [(f-.5)*1.7,...packet(x)];});
      const envelope=samples.map(([x,density])=>[x,.32*Math.sqrt(density),0]);
      p.waveEnvelope(envelope,envelope.map(([x,y,z])=>[x,-y,z]),teal);
      line([[-.85,0,0],[.85,0,0]],'#8ca9ba',.9,null,'4 4');
      p.trace(samples.map(([x,,amplitude])=>[x,.32*amplitude,0]),teal,2);
    }
    value('\\lambda',lambda,'nm');value('\\Delta\\varphi/(2\\pi)',turns);value('v_{\\rm g}',v*1e6,'m/s');value('v_{\\rm f}',v*5e5,'m/s');scale(S.view?'t='+env.fmt(time)+'\\,\\mathrm{fs}':'r='+S.r+'\\,\\mathrm{pm}');
    plot('Volný balík • hustota v soustavě laboratoře',[{...curve(seq(160,f=>{const x=(f-.5)*6+v*time;return [x,packet(x)[0]];})),area:true}],v*time-3,v*time+3,0,1/(2.5066*S.sigma),'x','nm','w','nm^{-1}',{xLabel:'Poloha',yLabel:'Hustota pravděpodobnosti'});
  }else if(chapter===6){drawOrbital(env);}
  else if(chapter===7){
    const wl=P.h/P.momentum(S.U)*1e9,toRad=Math.PI/180;
    const source=[-.85*Math.sin(S.inc*toRad),.85*Math.cos(S.inc*toRad),0],det=[.83*Math.sin(S.det*toRad),.83*Math.cos(S.det*toRad),0];
    drawNickelCrystal(p);
    arrow(source,[0,0,0],teal);p.trace([[0,0,0],det],gold,2.3);p.glow(det,.10,gold);dot(det,.034,gold,true);label(det,'Detektor');
    for(let j=0;j<5;j++){
      const f=cycle(T*.32+j/5),[x,y]=source.map(v=>v*f);
      const u=.115*Math.cos(S.inc*toRad),v=.115*Math.sin(S.inc*toRad);
      line([[x-u,y-v,-.11],[x+u,y+v,-.11],[x+u,y+v,.11],[x-u,y-v,.11]],'#3a9c9c72',1,'#43c5bc29');
    }
    const I=electronCrystal.intensity(wl,S.inc,S.det);value('\\lambda',wl,'nm');value('I/N^2',I);scale('a_{\\rm Ni}=0{,}3524\\,\\mathrm{nm}');
    const pts=cache.dif??=seq(180,f=>[f*85,electronCrystal.intensity(wl,S.inc,f*85)]);
    plot('Úhlové rozdělení difraktované intenzity',[{...curve(pts),area:true},{points:[[S.det,I]],color:'#b57825',marker:true}],0,85,0,Math.max(...pts.map(v=>v[1]),I)*1.05,'\\theta','{}^\\circ','I/N^2','',{xLabel:'Úhel detektoru',yLabel:'Normalizovaná intenzita'});
  }else if(chapter===8){
    const r=P.dirac(S.p),xNow=.21*S.p;
    line([[-.9,0,0],[.9,0,0]],'#8ea9b7',1,null,'4 4');line([[0,-.44,0],[0,.44,0]],'#b3c7d2');
    line([[xNow,-.43,0],[xNow,.43,0]],'#9cb4c1',1,null,'3 4');
    for(const sign of [-1,1]){
      const color=sign===1?teal:electronInk.level;
      const branch=seq(161,f=>{const x=(f-.5)*8;return [x*.21,sign*Math.hypot(1,x)*.1,0];});
      p.waveEnvelope(branch,branch.map(([x,,z])=>[x,0,z]),color);p.trace(branch,color);
      const point=[xNow,sign*Math.hypot(1,S.p)*.1,0];p.glow(point,.085,color);dot(point,.026,color,true);
    }
    label([-.84,.40,0],'Kladná energie');label([-.84,-.43,0],'Záporná energie');
    value('E_+',r.total/1e6,'MeV');value('E_-',-r.total/1e6,'MeV');value('E_k',r.kinetic/1e6,'MeV');scale('p/(m_ec)\\in[-4,4]');
    plot('Kinetická energie • zeleně relativistická, okrově klasická',[curve(seq(180,f=>[4*f,P.dirac(4*f).kinetic/1e6])),curve(seq(180,f=>[4*f,(4*f)**2*P.rest/2e6]),'#b57825')],0,4,0,8*P.rest/1e6,'p/(m_ec)','','E_k','MeV',{xLabel:'Relativní hybnost',yLabel:'Kinetická energie'});
  }else if(chapter===9){drawSlits(env);}
  else if(chapter===10){
    const time=T*1.5,center=S.p/Math.hypot(1,S.p)*time,range=10/S.width;
    const pts=seq(160,f=>{const x=center+(f-.5)*range;return [x,P.packet(S.p,S.width,x,time)];}),peak=S.width*Math.sqrt(2/Math.PI);
    const profile=pts.map(([x,y])=>[(x-center)/range*1.78,y/peak*.61-.24,0]);
    p.waveEnvelope(profile,profile.map(([x,,z])=>[x,-.24,z]),teal);p.trace(profile,teal);
    value('t',time*P.hb/(P.m*P.c**2)*1e21,'zs');value('v(p_0)/c',S.p/Math.hypot(1,S.p));scale('\\bar\\lambda_C='+env.fmt(P.hb/(P.m*P.c)*1e15)+'\\,\\mathrm{fm}');
    plot('Prostorová hustota jednočásticového stavu',[{...curve(pts),area:true}],center-range/2,center+range/2,0,peak,'x/\\bar\\lambda_C','','w\\bar\\lambda_C','',{xLabel:'Poloha',yLabel:'Hustota pravděpodobnosti'});
  }else{
    const field=10**S.zoom,dx=P.hb*P.c/(10**S.q*P.e),scales=[['Atom vodíku',P.a0],['Comptonova délka',P.hb/(P.m*P.c)],['Jádro • řád',5e-15],['Klasický poloměr',P.k/(P.m*P.c**2)],['Proton • řád',.84e-15]];
    const orbitalScale=P.a0/field;
    if(orbitalScale>.003&&orbitalScale<3){
      // Exact radial law for hydrogen 1s: Gamma(shape=3, scale=a0/2).
      const rng=P.random(100),points=[];
      for(let i=0;i<6400;i++){
        const r=-.5*orbitalScale*Math.log(Math.max(1e-30,rng()*rng()*rng())),u=2*rng()-1,phi=P.tau*rng(),s=Math.sqrt(1-u*u);
        const [x,y]=p.proj([r*s*Math.cos(phi),r*u,r*s*Math.sin(phi)]);points.push([x,y,electron]);
      }
      p.marks(points,1.6,.37);
    }
    for(const [i,[name,len]] of scales.entries()){const r=len/field;if(r>.012&&r<1.25){ring([0,0,0],r,[teal,blue,gold,red,'#b7a0d3'][i]);label([r*.707,r*.707,0],name);}}
    const probe=Math.min(1,dx/field),y=-.32;
    p.trace([[-probe*.5,y,0],[probe*.5,y,0]],gold,2);
    for(const side of [-1,1])line([[side*probe*.5,y-.035,0],[side*probe*.5,y+.035,0]],gold,1.6);
    label([-.42,-.39,0],dx>field?'Rozlišení přesahuje zorné pole':'Rozlišení sondy');
    value('\\Delta x',dx,'m');value('qc',10**S.q,'eV');scale('L='+env.fmt(field)+'\\,\\mathrm m');
    plot('Rozlišení při změně přenosu hybnosti • logaritmické osy',[curve(seq(100,f=>{const q=2+12*f;return [q,Math.log10(P.hb*P.c/P.e)-q];})),curve([[S.q,Math.log10(dx)]],gold,true)],2,14,-21,-8,'\\log_{10}(qc/\\mathrm{eV})','','\\log_{10}(\\Delta x/\\mathrm m)','',{xLabel:'Přenos hybnosti',yLabel:'Délkové rozlišení'});
  }
}
