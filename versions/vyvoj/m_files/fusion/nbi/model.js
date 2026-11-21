/* SI internally, energy readouts in keV. Pure, serializable worker entry. */
function computeNBI(density, temperature, resolution = 1, seed = 1800, quantile, track = true) {
  const R0=6.2, a=2, k=1.7, wall=2.32, rt=5.31, tilt=.0492;
  const mass=3.3435838e-27, me=9.1093837e-31, keV=1.602176634e-16;
  const v0=Math.sqrt(2000*keV/mass), coulomb=2.30707755e-28;
  const beam=y=>[rt,y,-.131-y*Math.tan(tilt)];
  const radius=y=>Math.hypot(Math.hypot(rt,y)-R0,beam(y)[2]/k);
  function crossing(sign,boundary){
    let lo=0,hi=9;
    for(let j=0;j<48;j++){const mid=(lo+hi)/2;if(radius(sign*mid)<boundary)lo=mid;else hi=mid;}
    return sign*(lo+hi)/2;
  }
  const start=crossing(-1,wall), end=crossing(1,wall);
  const entry=crossing(-1,a),exit=crossing(1,a);
  const profile=r=>Math.max(0,1-(r/a)**2);
  const state=r=>({n:density*1e19*(.15+.85*profile(r)),T:temperature*(.1+.9*profile(r))});
  // Suzuki et al., eq. 28, high-energy D target; energy in keV/amu.
  function attenuation(r){
    if(r>=a)return 0;
    const {n,T}=state(r), E=1000/2.014, L=Math.log(E), U=Math.log(T);
    return n*14.1e-20/E*(1+1.11*L+.408*L*L)*
      (1+(-Math.expm1(-.0105*n/1e19))**.547*(-.0403+.345*L-.0288*L*L))*
      (1-.0971*U+.00474*U*U);
  }
  const uniform=((Math.imul(1664525,seed)+1013904223)>>>0)/4294967296;
  const threshold=-Math.log1p(-(quantile ?? uniform));
  let depth=0,birth=null;
  const cells=Math.ceil((exit-entry)*200*resolution), dy=(exit-entry)/cells;
  for(let i=0;i<cells;i++){
    const y=entry+i*dy, increment=attenuation(radius(y+dy/2))*dy/Math.cos(tilt);
    if(birth===null && depth+increment>=threshold && increment>0)birth=y+dy*(threshold-depth)/increment;
    depth+=increment;
  }
  const stop=birth??end, flight=(stop-start)/(v0*Math.cos(tilt));
  const result={start,entry,exit,stop,flight,depth,ion:birth!==null,energy:[],orbit:[],tilt,rt};
  if(birth===null)return result;
  const r=radius(birth),R=Math.hypot(rt,birth), theta=Math.atan2(beam(birth)[2]/k,R-R0);
  const F=5.3*R0, C=5.3*k/(1.2+2*(r/a)**2);
  // psi=C*r²/2 locally in the sense dpsi/dr=C(r)*r.
  function field(angle){
    const cs=Math.cos(angle),sn=Math.sin(angle),rad=R0+r*cs;
    const br=-C*r*sn/k,bz=C*r*cs, h=Math.hypot(F,br,bz);
    return {rad,br,bz,h,B:h/rad};
  }
  const f=field(theta),phi=Math.atan2(birth,rt);
  const pitch=(Math.cos(tilt)*(f.br*Math.sin(phi)+F*Math.cos(phi))-Math.sin(tilt)*f.bz)/f.h;
  const invariant=(1-pitch*pitch)/f.B;
  // Independent variable l = integral v dt. Mirror force remains regular at a bounce.
  function derivative([angle,az,u]){
    const f=field(angle), sn=Math.sin(angle),cs=Math.cos(angle);
    const dB=C*C*r*r*sn*cs*(1/(k*k)-1)/(f.h*f.rad)+f.B*r*sn/f.rad;
    const pol=C/(k*f.h);
    return [u*pol,u*F/(f.rad*f.h),-.5*invariant*pol*dB];
  }
  const plus=(v,d,s)=>v.map((x,i)=>x+d[i]*s);
  let q=[theta,phi,pitch], dl=.15/resolution;
  const orbit=result.orbit;
  orbit.push(q);
  for(let j=1;track && j<=100000;j++){
    const d1=derivative(q),d2=derivative(plus(q,d1,dl/2)),d3=derivative(plus(q,d2,dl/2)),d4=derivative(plus(q,d3,dl));
    const next=q.map((x,i)=>x+dl*(d1[i]+2*d2[i]+2*d3[i]+d4[i])/6);
    const target=next[0]>=theta+2*Math.PI?theta+2*Math.PI:theta;
    if(j>3 && q[0]<target && next[0]>=target && next[2]>0){
      const fraction=(target-q[0])/(next[0]-q[0]);
      orbit.push(q.map((x,i)=>x+fraction*(next[i]-x)));
      result.period=(j-1+fraction)*dl;
      break;
    }
    orbit.push(next);q=next;
  }
  if(track && !result.period)throw Error('Nepodařilo se uzavřít poloidální periodu.');
  Object.assign(result,{r,dl,advance:orbit.at(-1)[1]-phi});
  // Fast-ion classical energy drag, vTi << v << vTe, fixed Coulomb logarithm.
  // Integrate time, path length and energy partition with kinetic energy as coordinate.
  const {n,T}=state(r),floor=5*T, steps=Math.ceil(4096*resolution);
  result.localTemperature=T;
  const amplitude=4*Math.PI*n*coulomb*coulomb*17/keV;
  let elapsed=0,length=0,electrons=0;
  result.energy.push([0,0,1000,0,0]);
  for(let j=1;j<=steps;j++){
    const E=1000*(floor/1000)**(j/steps),prev=result.energy.at(-1)[2], mid=(prev+E)/2;
    const v=Math.sqrt(2*mid*keV/mass),x=v/Math.sqrt(2*T*keV/me);
    // Maxwellian drag function at x < 1.3; convergent integral series.
    let term=1,sum=1/3;
    for(let m=1;m<=24;m++){term*=-x*x/m;sum+=term/(2*m+3);}
    const pe=amplitude*4*x**3*sum/(Math.sqrt(Math.PI)*me*v),pi=amplitude/(mass*v);
    const dt=(prev-E)/(pe+pi);
    elapsed+=dt;length+=v*dt;electrons+=pe*dt;
    result.energy.push([elapsed,length,E,electrons,1000-E-electrons]);
  }
  return result;
}
if(typeof module!=='undefined')module.exports=computeNBI;

/* Relative Kepler hyperbola in units of a = |k q1 q2|/(mu vInf²).
   H is the hyperbolic anomaly. Both endpoints have the same separation. */
function scatteringExample(electron,impactScale=1, plasma=null){
  const m=3.3435838e-27, target=electron?9.1093837e-31:m, charge=1.602176634e-19;
  const sign=electron?-1:1;
  const R=5000;
  const v0=Math.sqrt(2*(plasma?.energy??1000)*1000*charge/m);
  // Lab basis: x along entering relative velocity, y along impact parameter.
  const thermal=plasma?.velocity??[(electron?-3:.08)*v0,0,0];
  const relative=[v0-thermal[0],-thermal[1],-thermal[2]],speed=Math.hypot(...relative);
  const axisX=relative.map(x=>x/speed);
  const perp=Math.hypot(axisX[0],axisX[1]);
  const normal=perp?[axisX[1]/perp,-axisX[0]/perp,0]:[1,0,0];
  const cross=(a,b)=>a.map((_,i)=>a[(i+1)%3]*b[(i+2)%3]-a[(i+2)%3]*b[(i+1)%3]);
  const second=cross(axisX,normal),az=plasma?.azimuth??0;
  const axisY=normal.map((v,i)=>v*Math.cos(az)+second[i]*Math.sin(az));
  const axisZ=cross(axisX,axisY);
  const centre=thermal.map((v,i)=>(m*(i===0?v0:0)+target*v)/(m+target));
  const dot=(axis)=>axis.reduce((sum,v,i)=>sum+v*centre[i],0);
  const cy=dot(axisY),cz=dot(axisZ);
  const vInf=speed/Math.sqrt(1-2*sign/R), mu=m*target/(m+target);
  const a=2.30707755e-28/(mu*vInf*vInf), cm=dot(axisX);
  // The caller may specify a physical impact parameter instead of a multiple of a.
  const b=(Number.isFinite(plasma?.impactMeters)&&plasma.impactMeters>0)
    ?plasma.impactMeters/a : (electron?2:6)*impactScale;
  const eccentricity=Math.hypot(1,b), Hmax=Math.acosh((R-sign)/eccentricity);
  const axis=Math.atan2(b*Math.cosh(Hmax),-sign*Math.sinh(Hmax));
  const rotate=(x,y)=>[x*Math.cos(axis)+y*Math.sin(axis),y*Math.cos(axis)-x*Math.sin(axis)];
  function at(i){
    const H=(i/120-1)*Hmax,c=Math.cosh(H),s=Math.sinh(H),r=eccentricity*c+sign;
    const time=(eccentricity*s+sign*H)*a/vInf;
    const [x,y]=rotate(a*(eccentricity+sign*c),a*b*s);
    const [vx,vy]=rotate(vInf*sign*s/r,vInf*b*c/r);
    function particle(fraction,mass){
      const ux=cm+fraction*vx,uy=cy+fraction*vy;
      return {x:cm*time+fraction*x,y:cy*time+fraction*y,vx:ux,vy:uy,vz:cz,E:.5*mass*(ux*ux+uy*uy+cz*cz)/charge};
    }
    const force=sign*2.30707755e-28/(a*r)**3;
    return {time,d:particle(target/(m+target),m),p:particle(-m/(m+target),target),
      fx:force*x,fy:force*y,U:sign*2.30707755e-28/(a*r*charge)};
  }
  return {states:Array.from({length:241},(_,i)=>at(i)),at,electron,v0,m,target,b:b*a,
    // Kladná klasická Rutherfordova úhlová odchylka izolovaného páru.
    deflectionDeg:2*Math.atan(1/b)*180/Math.PI};
}
if(typeof module!=='undefined')module.exports.scatteringExample=scatteringExample;

// Stratified optical-depth draws on the same ray, with equal particle weights.
function computeBeam(density,temperature,report){
  const count=128,bins=16,weight=16.5/(1000*count);
  let seed=90210;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)+.5)/4294967296;
  const reference=computeNBI(density,temperature);
  const uRef=((Math.imul(1664525,1800)+1013904223)>>>0)/4294967296;
  const members=[];
  for(let i=0;i<count;i++){
    const q=(i+random())/count;
    const m=i===Math.floor(uRef*count)?reference:computeNBI(density,temperature,.25,0,q,false);
    members.push(m);
    if(report && i%8===7)report(i+1,count);
  }
  const end=Math.max(...members.map(m=>m.flight+(m.energy.at(-1)?.[0]||0)));
  const epochs=[0,end,...members.flatMap(m=>[m.flight,m.flight+(m.energy.at(-1)?.[0]||0)])];
  for(const t of epochs.slice())if(t>0)epochs.push(t*(1-1e-12));
  for(let i=0;i<=480;i++)epochs.push(1e-8*Math.expm1(i/480*Math.log1p(end/1e-8)));
  const cursors=new Uint16Array(count);
  const frames=[...new Set(epochs)].sort((a,b)=>a-b).map(time=>{
    const e=new Float64Array(bins),ions=new Float64Array(bins);
    let neutral=0,wall=0,fast=0,residual=0;
    members.forEach((m,i)=>{
      if(time<m.flight){neutral+=1000*weight;return;}
      if(!m.ion){wall+=1000*weight;return;}
      const rows=m.energy,t=time-m.flight;
      while(cursors[i]<rows.length-2&&rows[cursors[i]+1][0]<t)cursors[i]++;
      const a=rows[cursors[i]],b=rows[cursors[i]+1],u=Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0])));
      const sample=j=>(a[j]+(b[j]-a[j])*u)*weight;
      const bin=Math.min(bins-1,Math.floor(m.r/2*bins));
      e[bin]+=sample(3);ions[bin]+=sample(4);
      if(time>=m.flight+rows.at(-1)[0])residual+=sample(2);else fast+=sample(2);
    });
    return {time,e,ions,neutral,wall,fast,residual};
  });
  // Vary the illustrative encounters independently of the deposition model.
  const local=reference.ion?reference:members.find(m=>m.ion);
  const normal=()=>Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());
  const encounters=[];
  const encounterCount=28;
  let previousKind,runLength=0;
  if(local)for(let j=0;j<encounterCount;j++){
    const targetTime=(j+random()*.45)/encounterCount*local.energy.at(-1)[0];
    const i=Math.max(1,local.energy.findIndex(row=>row[0]>=targetTime));
    const a=local.energy[i-1],b=local.energy[i],fraction=(targetTime-a[0])/(b[0]-a[0]);
    const energy=a[2]+fraction*(b[2]-a[2]);
    const selected=runLength===2?1-previousKind:Math.floor(random()*2);
    runLength=selected===previousKind?runLength+1:1;
    previousKind=selected;
    const rotation=2*Math.PI*random();
    let ionDeflectionDeg=0;
    const pairs=[true,false].map(electron=>{
      const mass=electron?9.1093837e-31:3.3435838e-27;
      const sigma=Math.sqrt(local.localTemperature*1.602176634e-16/mass);
      const velocity=[normal()*sigma,normal()*sigma,normal()*sigma];
      const ex=scatteringExample(electron,.8+.6*random(),{energy,velocity,
        impactMeters:electron?undefined:(5+4*random())*1e-14,
        azimuth:2*Math.PI*random()});
      if(!electron)ionDeflectionDeg=ex.deflectionDeg;
      return ex.states;
    });
    encounters.push({time:local.flight+targetTime,energy,pairs,selected,rotation,ionDeflectionDeg});
  }
  const thermal=Array.from({length:60},(_,i)=>{
    const electron=i%2===0,mass=electron?9.1093837e-31:3.3435838e-27;
    const sigma=Math.sqrt((reference.localTemperature??temperature)*1.602176634e-16/mass);
    return {electron,x:random(),y:random(),depth:random(),vx:sigma*normal(),vy:sigma*normal(),vz:sigma*normal()};
  });
  // Elliptical torus V(r) = 2 pi² R0 kappa r². Integrate between bin edges.
  const volumes=Array.from({length:bins},(_,i)=>2*Math.PI**2*6.2*1.7*(2/bins)**2*(2*i+1));
  const last=frames.at(-1);
  const peakDensity=Math.max(...last.e.map((v,i)=>(v+last.ions[i])/volumes[i]));
  reference.bundle={volumes,peakDensity,thermal,frames,end,bins,encounters,count,births:members.filter(m=>m.ion).length};
  return reference;
}
if(typeof module!=='undefined')module.exports.computeBeam=computeBeam;
