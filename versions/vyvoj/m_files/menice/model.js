/* Ideal educational circuits; time in seconds, voltage in volts, current in amperes. */
const ConverterModel = (() => {
  const tau = 2 * Math.PI;
  const phase = (x, k) => Math.sin(tau * (x - k / 3));
  const mod = (x, n) => ((x % n) + n) % n;
  const pairs = [[0,1],[0,2],[1,2],[1,0],[2,0],[2,1]];
  function bridge(x, delay = 0) {
    const sector = mod(Math.floor(6 * (x - delay / 360 - 1 / 12) + 1e-10), 6);
    const [hi, lo] = pairs[sector];
    const volts = [0,1,2].map(k => 24 * phase(x,k));
    return {hi, lo, volts, out:volts[hi] - volts[lo]};
  }
  function voltageScale(id,supply){
    if(supply!=='drive')return 1;
    if(id==='pulzni')return 220/24;
    if(id==='pwm'||id==='jednofazovy')return 325/30;
    return 230*Math.SQRT2/24;
  }
  function solve(id, settings) {
    const scale=voltageScale(id,settings.supply);
    // The ideal circuits are linear for fixed switching states. Solve at the
    // bench base voltage and refer volts, amps and watts to the selected source.
    const p={...settings,emf:(settings.emf??6)/scale};
    const resistance=p.resistance??10, inductance=(p.inductance??5)/1000;
    const lagEmf=(p.lag??0)*Math.PI/180;
    const freq = p.freq || 50, carrier = p.carrier || 500, duty = (p.duty ?? 50) / 100;
    const period = id === 'kmitocet' ? 1 / freq : .02;
    const switching = id==='pwm' || id==='pulzni' || (id==='jednofazovy' && p.mode==='pwm');
    const count = switching ? Math.max(2400,Math.ceil(period*carrier*400)) : 2400;
    const dt = period / count;
    const decay = Math.exp(-dt * resistance / inductance);
    const samples = [];
    const hasEmf = p.load === 'motor';
    const emfAmplitude = hasEmf ? (p.emf ?? 6) : 0;
    const boost = p.mode === 'boost', nominal = boost ? 24/(1-duty) : 24*duty;
    let capacitor = Math.max(nominal,emfAmplitude), current = 0, thyristor = 0;
    let inductor = Math.max(0,(capacitor-emfAmplitude)/resistance)/(boost?1-duty:1);
    if(id==='pulzni')current=(capacitor-emfAmplitude)/resistance;
    const direction = i => Math.abs(i)<1e-7 ? 0 : Math.sign(i);
    // Warm up the dynamic loads, including the intervals before the displayed window.
    for (let n = -Math.ceil((id==='pulzni'?.24:Math.max(.06,10*inductance/resistance)) / dt); n <= count; n++) {
      const t = n * dt, x = t * 50, theta = tau * x;
      const cycle = mod(t * carrier + 1e-12,1);
      const tri = id === 'pwm' ? cycle : 1 - Math.abs(2 * cycle - 1);
      const sine = Math.sin(theta);
      const grid = bridge(x), delay = p.angle || 0;
      let values, state, metric;
      const loadCurrent = (voltage,emf=0) => {
        const target = (voltage-emf)/resistance;
        current = p.load === 'r' ? target : current * decay + target * (1 - decay);
        return current;
      };
      if (id === 'diody' || id === 'tyristory') {
        const single = p.mode === 'single';
        const b = id === 'diody' ? grid : bridge(x, delay);
        const midpoint = p.mode === 'star' || id === 'tyristory';
        let v = single ? Math.abs(24*sine) : midpoint ? b.volts[b.hi] : b.out;
        current = Math.max(0,loadCurrent(v,emfAmplitude));
        const i=current;
        if(!i)v=emfAmplitude;
        state = single ? (sine >= 0 ? [0,1] : [1,0]) : [b.hi,b.lo];
        if(!i)state=[-1,-1];
        values = [single ? 24*sine : b.volts[0], single ? 0 : b.volts[1], single ? 0 : b.volts[2], v, i];
        metric = v;
      } else if (id === 'pwm' || id === 'jednofazovy') {
        const half = id === 'pwm';
        const ref = half && p.mode === 'fixed' ? duty : .5 + .5*(p.depth ?? 80)/100*sine;
        const gate = half || p.mode === 'pwm' ? ref > tri : sine >= 0;
        const v = half ? 30 * Number(gate) : gate ? 30 : -30;
        const emf = half && p.mode==='fixed' ? emfAmplitude : emfAmplitude*Math.sin(theta-lagEmf);
        const i = loadCurrent(v,emf);
        values = [ref, tri, Number(gate), v, i]; state = [Number(gate),Math.sign(i)]; metric = v;
      } else if (id === 'pulzni') {
        const on = cycle < duty;
        let vl = boost ? (on?24:24-capacitor) : (on?24:0)-capacitor;
        if(inductor<=0 && vl<0)vl=0;
        const i=loadCurrent(capacitor,emfAmplitude);
        const ic=(boost&&on?0:inductor)-i;
        capacitor+=dt*ic/.0022;
        inductor=Math.max(0,inductor+dt*vl/.05);
        values = [Number(on),vl,inductor,i]; state = [Number(on),direction(inductor),direction(ic),direction(i)]; metric = capacitor;
      } else if (id === 'stridavy') {
        const polarity = sine >= 0 ? 1 : -1;
        // Sustained firing command from alpha to the end of each half-cycle.
        const emf=emfAmplitude*Math.sin(theta-lagEmf);
        if (!thyristor && polarity*(24*sine-emf)>0 && mod(x, .5)*360+1e-9 >= delay) thyristor = polarity;
        let v = thyristor ? 24*sine : emf;
        let i = loadCurrent(v,emf);
        if (thyristor && i*thyristor <= 0) {
          current = 0; i = 0; thyristor = 0; v = emf;
        }
        values = [24*sine,v,i]; state = [thyristor]; metric = v*v;
      } else if (id === 'kmitocet') {
        const link = 1.5*Math.sqrt(3)*48/Math.PI;
        const amplitude = link/2*(p.mode === 'vf' ? freq/50 : 1);
        const u = amplitude*phase(t*freq,0);
        const reactance=p.load==='r'?0:tau*freq*inductance;
        const lag=Math.atan2(reactance,resistance);
        const currents=[0,1,2].map(k=>{
          const angle=tau*(t*freq-k/3)-lag;
          return (amplitude*Math.sin(angle)-emfAmplitude*Math.sin(angle-lagEmf))/Math.hypot(resistance,reactance);
        });
        values = [grid.out,link,u,amplitude*phase(t*freq,1),amplitude*phase(t*freq,2),currents[0]];
        const power=currents.reduce((sum,i,k)=>sum+i*amplitude*phase(t*freq,k),0);
        state = [power>1e-7?grid.hi:-1,power>1e-7?grid.lo:-1,...currents.map(direction),direction(power)];
      } else {
        // Three-phase six-pulse bridge, constant DC current. Match the PWM input's
        // sinusoidal current to the diode input's mean three-phase active power.
        const dcCurrent = Math.max(0,loadCurrent(grid.out,emfAmplitude));
        const rect = dcCurrent*(Number(grid.hi === 0)-Number(grid.lo === 0));
        values = [24*sine,rect,0,24*sine*rect]; state=[grid.hi,grid.lo]; metric=24*sine*rect;
      }
      if (n >= 0) samples.push({values,state,metric});
    }
    let result = id==='kmitocet' ? null : samples.slice(0,count).reduce((sum,s) => sum+s.metric,0)/count;
    if(id==='aktivni'){
      const dcBus=52, activePower=dcBus*(dcBus-emfAmplitude)/resistance/3;
      for(let n=0;n<=count;n++){
        const s=samples[n],x=n/count;
        s.values[2]=2*activePower/24*phase(x,0);
        if(p.mode==='active'){
          s.values[3]=s.values[0]*s.values[2];
          s.state=[...([0,1,2].map(k=>direction(activePower*phase(x,k)))),direction(activePower)];
        }
      }
      if(p.mode==='active')result=activePower;
    }
    if (id === 'stridavy') result = Math.sqrt(result);
    if(scale!==1){
      const normalized=id==='pwm'||id==='jednofazovy'?3:id==='pulzni'?1:0;
      for(const s of samples){
        for(let k=normalized;k<s.values.length;k++)s.values[k]*=id==='aktivni'&&k===3?scale*scale:scale;
        if(s.metric!==undefined)s.metric*=id==='aktivni'||id==='stridavy'?scale*scale:scale;
      }
      if(result!==null)result*=id==='aktivni'?scale*scale:scale;
    }
    return {samples,period,result};
  }
  // Integrate the RL response between comparator crossings. The two sides of
  // each switching edge share a timestamp, including at the reset of the ramp.
  function fastPwm(p){
    const period=.02, fs=p.carrier, ud=30*voltageScale('pwm',p.supply);
    const r=p.resistance??10, l=(p.inductance??5)/1000, resistive=p.load==='r';
    const fixed=p.mode==='fixed', emf=p.load==='motor'?(p.emf??6):0;
    const omega=tau*50, lag=(p.lag??0)*Math.PI/180;
    const z=resistive?r:Math.hypot(r,omega*l), loadLag=resistive?0:Math.atan2(omega*l,r);
    const ref=t=>fixed?(p.duty??50)/100:.5+.005*(p.depth??80)*Math.sin(omega*t);
    const samples=[];
    let base=0, onTime=0;
    // The homogeneous transient has decayed by exp(-24) at the start of the record.
    const first=resistive?0:-Math.ceil(24*l/r*fs);
    for(let j=first;j<=Math.floor(period*fs);j++){
      const t0=j/fs;
      let duty=ref(t0);
      if(!fixed){
        // The slope of the reference is much smaller than the carrier slope.
        for(let k=0;k<10;k++)duty=ref((j+duty)/fs);
      }
      const split=(j+duty)/fs;
      if(j>=0)onTime+=Math.max(0,Math.min(period,split)-t0);
      for(const on of [true,false]){
        const from=on?t0:split,to=on?split:(j+1)/fs;
        if(to<=from)continue;
        const target=on?ud/r:0;
        const response=t=>resistive?target:base+(target-base)*(-Math.expm1(-(t-from)*r/l));
        if(j>=0&&from<=period){
          const last=Math.min(to,period);
          const divisions=Math.max(1,Math.ceil((last-from)*Math.max(600000,4*fs)));
          for(let k=0;k<=(last===from?0:divisions);k++){
            const t=k===divisions?last:from+(last-from)*k/divisions;
            const ui=fixed?emf:emf*Math.sin(omega*t-lag);
            const i0=response(t),i=i0-(fixed?emf/r:emf*Math.sin(omega*t-lag-loadLag)/z);
            samples.push({time:t,values:[ref(t),Math.max(0,Math.min(1,(t-t0)*fs)),+on,on?ud:0,i,ui,i0],state:[+on,Math.sign(i)]});
          }
        }
        base=response(to);
      }
    }
    return {samples,period,result:ud*onTime/period};
  }
  function simulate(id,p){
    if(id==='pwm'&&p.carrier>2000)return fastPwm(p);
    const result=solve(id,p),motor=p.load==='motor';
    // A matched second experiment isolates the effect of the induced voltage.
    const baseline=motor&&p.emf!==0?solve(id,{...p,emf:0}):result;
    const currentIndex={diody:4,tyristory:4,pwm:4,pulzni:3,jednofazovy:4,stridavy:2,kmitocet:5,aktivni:p.mode==='active'?2:1}[id];
    const ac=id==='jednofazovy'||id==='stridavy'||id==='kmitocet'||(id==='pwm'&&p.mode==='sine');
    const frequency=id==='kmitocet'?(p.freq||50):50;
    const count=result.samples.length-1;
    for(let n=0;n<=count;n++){
      const sample=result.samples[n],time=result.period*n/count;
      const ui=motor?(p.emf??6)*(ac?Math.sin(tau*frequency*time-(p.lag??0)*Math.PI/180):1):0;
      sample.values.push(ui,baseline.samples[n].values[currentIndex]);
    }
    return result;
  }
  return {simulate,bridge,voltageScale};
})();
if (typeof module !== 'undefined') module.exports = ConverterModel;
