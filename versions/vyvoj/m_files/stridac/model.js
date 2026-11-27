/* Time x is measured in periods of the output frequency. */
const Inverter = (() => {
  const dc = 30;
  const triangle = x => 1 - 4 * Math.abs(x - Math.floor(x) - 0.5);
  function reference(x, phase, p) {
    if (p.mode === 'bench') return phase === 0 ? 2 * p.duty - 1 : -1;
    return p.depth * Math.sin(2 * Math.PI * (x - phase / 3));
  }
  function intervals(p, first, last) {
    const ratio = p.switching / p.frequency;
    const edges = [first, last];
    if (p.mode === 'six') {
      for (let i = 1; i < 6; i++) edges.push(i / 6);
    } else {
      // Each half-carrier is monotone and steeper than every reference.
      for (let half = Math.floor(2*ratio*first); half < 2*ratio*last; half++) {
        for (let phase = 0; phase < (p.mode === 'bench' ? 1 : 3); phase++) {
          let lo = Math.max(first, half / (2 * ratio));
          let hi = Math.min(last, (half + 1) / (2 * ratio));
          const delta = x => reference(x, phase, p) - triangle(x * ratio);
          const positive = delta(lo) > 0;
          if (positive === (delta(hi) > 0)) continue;
          for (let i = 0; i < 36; i++) {
            const mid = (lo + hi) / 2;
            if ((delta(mid) > 0) === positive) lo = mid;
            else hi = mid;
          }
          edges.push((lo + hi) / 2);
        }
      }
    }
    edges.sort((a,b) => a-b);
    const times = edges.filter((v,i) => !i || v - edges[i-1] > 1e-10);
    return times.slice(0,-1).map((start,i) => {
      const end = times[i+1], mid = (start + end) / 2;
      const bits = [0,1,2].map(k => Number(p.mode === 'six'
        ? Math.sin(2*Math.PI*(mid-k/3)) > 0 : reference(mid,k,p) > triangle(mid*ratio)));
      const pole = bits.map(bit => dc * (bit - 0.5));
      const neutral = pole.reduce((a,b) => a+b,0) / 3;
      const load = pole.map(v => v-neutral);
      return {start,end,bits,pole,load};
    });
  }
  function build(p) {
    const resistance = p.resistance ?? 10;
    const inductance = p.inductance ?? 0.04;
    const segments = intervals(p, 0, 1);
    const rate = resistance / (inductance * p.frequency);
    const reactance = 2*Math.PI*p.frequency*inductance;
    const amplitude = p.loadType==='motor' ? p.emf : 0;
    const lag = (p.lag ?? 0)*Math.PI/180;
    const emf = (x,k=0) => amplitude*Math.sin(2*Math.PI*(x-k/3)-lag);
    // Particular solution driven by the opposing sinusoidal phase voltage.
    const ampI = -amplitude/Math.hypot(resistance,reactance);
    const angle = lag+Math.atan2(reactance,resistance);
    const inducedCurrent = (x,k) => ampI*Math.sin(2*Math.PI*(x-k/3)-angle);
    function advance(s,x,initial,k) {
      return initial+(s.load[k]/resistance-initial)*-Math.expm1(-rate*(x-s.start));
    }
    const resistive = p.loadType==='r';
    if (!resistive) {
      const repeating=p.mode==='six' || Number.isInteger(p.switching/p.frequency);
      const history=repeating?segments:intervals(p,-23/rate,0);
      for(let k=0;k<3;k++){
        let value=0;
        for(const s of history)value=advance(s,s.end,value,k);
        if(repeating)value/=-Math.expm1(-rate);
        for(const s of segments){
          (s.switchCurrent ??= [0,0,0])[k]=value;
          value=advance(s,s.end,value,k);
        }
      }
    }
    const current = (s,x,k=0) => resistive ? s.load[k]/resistance :
      advance(s,x,s.switchCurrent[k],k)+inducedCurrent(x,k);
    for (const s of segments) s.initial=current(s,s.start);
    function at(x) {
      let lo=0, hi=segments.length;
      while (lo+1<hi) {
        const mid=(lo+hi)>>1;
        if (segments[mid].start<=x) lo=mid; else hi=mid;
      }
      return segments[lo];
    }
    return {segments, at, current, emf};
  }
  function conductingDevice(upper,current){
    if(Math.abs(current)<1e-9)return 'off';
    return (current>0)===Boolean(upper)?'transistor':'diode';
  }
  return {build, reference, triangle, dc, conductingDevice};
})();
if (typeof module !== 'undefined') module.exports = Inverter;
