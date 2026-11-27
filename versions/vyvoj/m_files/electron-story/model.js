/* SI except where the function names or documentation specify scaled coordinates. */
const ElectronPhysics = (() => {
  const e=1.602176634e-19, m=9.1093837139e-31, c=299792458, h=6.62607015e-34;
  const hb=h/(2*Math.PI), k=8.9875517923e9*e*e, mp=1.67262192595e-27;
  const mu=m*mp/(m+mp), a=hb*hb/(mu*k), a0=hb*hb/(m*k), rest=m*c*c/e;
  const tau=2*Math.PI;
  const nuclei=[mp,6.64465734e-27,1.1650348e-26]; // proton, helium-4 and lithium-7 nuclei, kg
  const bohrLength=(Z=1)=>hb*hb/(k*(m*nuclei[Z-1]/(m+nuclei[Z-1])))/Z;
  const energy=(n,Z=1)=>-k*Z/(2*bohrLength(Z)*n*n*e);
  const momentum=U=>e*Math.sqrt(U*(U+2*rest))/c;
  const speed=U=>momentum(U)/(m*(1+U/rest));
  function random(seed=1897){return ()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
  // Relativistic Boris push, with the specific momentum u=p/m.
  function boris(s,E,B,dt){
    const kick=-e/m*E*dt/2, ux=s[2], uy=s[3]+kick;
    const t=-e/m*B*dt/(2*Math.hypot(1,ux/c,uy/c)), rot=2*t/(1+t*t);
    const vx=ux+(uy-ux*t)*rot, vy=uy-(ux+uy*t)*rot+kick;
    const gamma=Math.hypot(1,vx/c,vy/c);
    return [s[0]+dt*vx/gamma,s[1]+dt*vy/gamma,vx,vy];
  }
  function tube(U,E,B){
    const dt=0.00015/speed(U), path=[];
    let s=[-.09,0,momentum(U)/m,0];
    for(let i=0;i<2200;i++){
      path.push(s);if(s[0]>=.09||Math.abs(s[1])>.026||s[0]<-.091)break;
      const active=Math.abs(s[0])<=.035;
      s=boris(s,active?E:0,active?B:0,dt);
    }
    return {path,dt};
  }
  function verlet(p,v,dt,force){
    const old=force(p), next=p.map((x,i)=>x+dt*v[i]+dt*dt*old[i]/2);
    const acc=force(next);
    return [next,v.map((x,i)=>x+dt*(old[i]+acc[i])/2)];
  }
  // Positions in R, time in sqrt(m R³/k); neutral background Q=N e.
  function sphereForce(p){
    const n=p.length/3, f=p.map((x,i)=>-n*x/Math.max(1,Math.hypot(...p.slice(i-i%3,i-i%3+3))**3));
    for(let i=0;i<p.length;i+=3)for(let j=0;j<i;j+=3){
      const d=p.slice(i,i+3).map((x,k)=>x-p[j+k]), r=Math.hypot(...d);
      for(let k=0;k<3;k++){const value=d[k]/r**3;f[i+k]+=value;f[j+k]-=value;}
    }
    return f;
  }
  function ring(n,shift){
    const radius=n===1?0:Math.cbrt(Array.from({length:n-1},(_,i)=>1/Math.sin(Math.PI*(i+1)/n)).reduce((a,b)=>a+b,0)/(4*n));
    const p=[],v=[];for(let i=0;i<n;i++){p.push(radius*Math.cos(tau*i/n)+(i===0?shift:0),radius*Math.sin(tau*i/n),0);v.push(0,0,0);}
    return [p,v];
  }
  // Scale length by k*zZ/(2K); incoming asymptotic speed by v_inf.
  function scatter(E,Z,b,diffuse=false){
    const length=k*Z/(E*1e6*e)*1e15, impact=b/length, R=1e5/length;
    const start=diffuse?2*R:Math.max(40000,2000*impact);
    const force=p=>{const r=Math.hypot(...p),den=Math.max(diffuse?R:0,r)**3;return p.map(x=>x/den);};
    let p=[-start,impact], v=[Math.sqrt(1-2/Math.hypot(...p)),0],path=[],times=[],clock=0;
    for(let i=0;i<5000;i++){
      path.push(p.map(x=>x*length));times.push(clock);const dt=.012*Math.max(diffuse?R:1,Math.hypot(...p));
      [p,v]=verlet(p,v,dt,force);clock+=dt;if(Math.hypot(...p)>start*1.05&&p[0]*v[0]+p[1]*v[1]>0)break;
    }
    return {path,times,angle:Math.atan2(v[1],v[0]),theory:2*Math.atan2(length,b),length};
  }
  function collapse(r0,t){
    const rate=4*k*k/(m*m*c**3),end=(r0**3-(Math.max(.03*r0,k/(m*(.1*c)**2)))**3)/rate;
    const r=Math.cbrt(r0**3-rate*Math.min(t,end));
    return {r,end,v:Math.sqrt(k/(m*r)),E:-k/(2*r),P:2*k**3/(3*m*m*c**3*r**4)};
  }
  const mixSamples=(a,b,f)=>a.map((value,i)=>value+f*(b[i]-value));
  function samplePath(values,index){
    const low=Math.floor(index);
    return mixSamples(values[low],values[Math.min(values.length-1,low+1)],index-low);
  }
  function sampleRing(states,time){
    const last=states.length-1,index=Math.min(last,time*45),low=Math.floor(index);
    return mixSamples(states[low][0],states[Math.min(last,low+1)][0],index-low);
  }
  const collapseDuration=9;
  function collapseView(r0,animationTime,radiating){
    const end=collapse(r0,0).end;
    const progress=Math.min(1,animationTime/collapseDuration);
    const time=radiating?end*(1-(1-progress)**3):animationTime*Math.sqrt(m*r0**3/k);
    return {time,end,angle:2.1*(radiating?progress*collapseDuration:animationTime),state:collapse(r0,radiating?time:0)};
  }
  const bohrDuration=7.2,bohrOrbitRate=.90;
  const bohrGap=S=>energy(S.nf,S.ion+1)-energy(S.ni,S.ion+1);
  const bohrResonant=S=>Math.abs(bohrGap(S)-S.photon)<.005;
  const photonNmEv=h*c/e*1e9;
  const photonEnergy=wavelength=>photonNmEv/wavelength;
  function bohrSpectrum(S){
    const Z=S.ion+1,gap=Math.abs(bohrGap(S)),reference=gap?photonNmEv/gap:0;
    const balmer=Math.min(S.ni,S.nf)===2&&Math.max(S.ni,S.nf)>2;
    const min=reference&&!balmer?.74*reference:380/Z**2;
    const max=reference&&!balmer?1.35*reference:Math.max(700/Z**2,1.15*reference);
    return {min,max,reference,balmer,photonMin:photonEnergy(max),photonMax:Math.min(photonEnergy(min),-energy(S.ni,Z)),incident:photonNmEv/S.photon};
  }
  function bohrView(S,time=null,freeAngle=-1.66){
    const initial=S.ni,shownFinal=S.nf,delta=bohrGap(S),impact=2.6,endTransfer=4;
    const emission=delta<0,resonant=delta>0&&bohrResonant(S);
    const ease=x=>{const u=Math.min(1,Math.max(0,x));return u*u*(3-2*u);};
    const final=emission||resonant?shownFinal:initial;
    const transfer=final!==initial&&time!==null?ease((time-impact)/(endTransfer-impact)):0;
    const wavelength=delta?photonNmEv/Math.abs(delta):0;
    const wave=emission?wavelength:photonNmEv/S.photon;
    const photonColor=wave<380?'#8a60c8':wave<455?'#674cc4':wave<495?'#2677ba':wave<570?'#268463':wave<625?'#c67722':'#d34f4c';
    const t=time??0,slowRate=.10,slowSpan=1.25,slowStart=impact-slowSpan;
    const extraRate=bohrOrbitRate-slowRate;
    const approach=Math.min(1,Math.max(0,(t-slowStart)/slowSpan));
    const departure=Math.min(1,Math.max(0,(t-endTransfer)/slowSpan));
    const eventAngle=(S.angle??freeAngle)+slowRate*impact+extraRate*(slowStart+.5*slowSpan);
    const elapsedOrbit=Math.min(t,slowStart)+slowSpan*(approach-.5*approach**2)+
      slowSpan*(departure**3-.5*departure**4)+Math.max(0,t-endTransfer-slowSpan);
    const angle=time===null?freeAngle:(S.angle??freeAngle)+slowRate*t+extraRate*elapsedOrbit;
    let photon=null,status=emission?'Připraveno k emisi':delta>0?'Připraveno k vyslání':'Stejná hladina';
    if(time!==null&&delta!==0){
      if(emission){
        status=t<impact?'Před emisí':t<endTransfer?'Přechod na nižší hladinu':t<bohrDuration?'Foton opouští atom':'Foton emitován';
        if(t>=impact&&t<bohrDuration)photon={travel:ease((t-impact)/(bohrDuration-impact)),offset:0};
      }else{
        status=t<impact?'Foton přilétá':resonant?t<endTransfer?'Rezonanční přechod':'Foton absorbován':'Průlet mimo rezonanci';
        if(t<impact||(!resonant&&t<bohrDuration))photon={travel:t<impact?1-ease(t/impact):-ease((t-impact)/(bohrDuration-impact)),offset:resonant?0:.17};
      }
    }
    return {initial,final,shownFinal,highest:Math.max(initial,shownFinal),angle,eventAngle,transfer,photon,photonColor,wavelength,status};
  }
  function bohrScene(S,cache,time){
    const trial=cache.bohrTrial,angle=cache.bohrAngle??-1.66;
    const view=bohrView(trial??S,trial?time:null,angle);
    view.showAllLevels=true;
    if(trial&&time>=bohrDuration)view.angle=angle;
    return view;
  }
  function hydrogenRing(radius,wavelength,time){
    const r=radius*1e-12,p=h/(wavelength*1e-9),required=h/Math.sqrt(mu*k/r)*1e9;
    const turns=tau*r/(wavelength*1e-9),whole=Math.max(1,Math.round(turns));
    const kinetic=p*p/(2*mu),circularKinetic=k/(2*r);
    const phase=(2*circularKinetic-kinetic)*time*1e-15/hb;
    const closed=Math.abs(turns-whole)<1e-8;
    return {required,turns,whole,phase,kineticEv:kinetic/e,circularKineticEv:circularKinetic/e,
      closed,allowed:closed&&Math.abs(wavelength-required)<1e-8};
  }
  function factorial(n){let f=1;for(let i=2;i<=n;i++)f*=i;return f;}
  function laguerre(n,alpha,x){let prev=0,cur=1;for(let i=1;i<=n;i++)[prev,cur]=[cur,((2*i-1+alpha-x)*cur-(i-1+alpha)*prev)/i];return cur;}
  function radial(n,l,r){const x=2*r/n;return Math.sqrt((2/n)**3*factorial(n-l-1)/(2*n*factorial(n+l)))*Math.exp(-x/2)*x**l*laguerre(n-l-1,2*l+1,x);}
  function angular(l,mag,u,phi,real){
    const j=Math.abs(mag);let p=1;
    for(let i=1;i<=j;i++)p*=-(2*i-1)*Math.sqrt(Math.max(0,1-u*u));
    let prev=0;
    for(let i=j+1;i<=l;i++)[prev,p]=[p,((2*i-1)*u*p-(i+j-1)*prev)/(i-j)];
    p*=Math.sqrt((2*l+1)/(4*Math.PI)*factorial(l-j)/factorial(l+j));
    if(real&&j)return [Math.sqrt(2)*p*(mag>0?Math.cos(j*phi):Math.sin(j*phi)),0];
    if(mag<0)p*=(-1)**j;
    return [p*Math.cos(mag*phi),p*Math.sin(mag*phi)];
  }
  function orbital(n,l,mag,x,y,z,real){
    const r=Math.hypot(x,y,z),R=radial(n,l,r);
    return angular(l,mag,r?z/r:1,Math.atan2(y,x),real).map(a=>a*R);
  }
  function dirac(p){const gamma=Math.hypot(1,p);return {total:gamma*rest,kinetic:p*p/(gamma+1)*rest};}
  // One-dimensional positive-energy spin-up sector; q=p/(mc), x in reduced Compton lengths.
  function packet(q0,width,x,t){
    let ur=0,ui=0,lr=0,li=0,norm=0;
    const dq=width/9;
    for(let j=-45;j<=45;j++){const q=q0+j*dq,g=Math.hypot(1,q),amp=Math.exp(-.25*(j/9)**2),u=Math.sqrt((g+1)/(2*g)),phase=q*x-(g-1)*t;
      const re=amp*u*Math.cos(phase),im=amp*u*Math.sin(phase);ur+=re;ui+=im;lr+=re*q/(g+1);li+=im*q/(g+1);norm+=amp*amp;}
    return (ur*ur+ui*ui+lr*lr+li*li)*dq/(tau*norm);
  }
  function packetProfile(q0,width,time){
    const min=-16,max=28,segments=320,dx=(max-min)/segments;
    const points=Array.from({length:segments+1},(_,i)=>{
      const x=min+i*dx;
      return [x,packet(q0,width,x,time)];
    });
    const cumulative=[0];
    let mass=0,first=0,second=0;
    for(let i=1;i<points.length;i++){
      const [x1,y1]=points[i-1],[x2,y2]=points[i],weight=(y1+y2)*dx/2;
      const x=(x1+x2)/2;
      mass+=weight;first+=weight*x;second+=weight*x*x;
      cumulative.push(mass);
    }
    const mean=first/mass;
    return {time,min,max,points,cumulative,mass,mean,deviation:Math.sqrt(Math.max(0,second/mass-mean*mean))};
  }
  return {e,m,c,h,hb,k,mu,a,a0,rest,tau,energy,bohrLength,momentum,speed,random,boris,tube,verlet,sphereForce,ring,scatter,mixSamples,samplePath,sampleRing,collapse,collapseView,collapseDuration,bohrView,bohrScene,bohrGap,bohrResonant,bohrSpectrum,bohrDuration,bohrOrbitRate,photonEnergy,hydrogenRing,radial,angular,orbital,dirac,packet,packetProfile};
})();
if(typeof module!=='undefined')module.exports=ElectronPhysics;
