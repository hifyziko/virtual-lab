/* Local impulsive Fisch–Boozer response for passing electrons. Frequencies in GHz. */
(function (root) {
  'use strict';
  const cyclotron = 112;
  const thermalOverC = Math.sqrt(2 / 510.99895); // Te = 1 keV
  const bandwidth = 1.5;
  const heatedFraction = 0.6;
  const perpendicularGain = 2; // increment of v_perp² / v_th²
  const maxTime = 30;
  const pulseCycles = 20;
  const acceleration = .006; // e E0 / (m_e Omega_e v_th)

  function experiment(angle, frequency, intervals = 400, continuous = false) {
    const parallel = angle === 90 ? 0 : Math.cos(angle * Math.PI / 180);
    const doppler = frequency * thermalOverC * parallel;
    const detuning = frequency - cyclotron;
    const selection = u => heatedFraction * Math.exp(-0.5 * ((detuning - doppler * u) / bandwidth) ** 2);
    // Integrate the ±u pairs together so density and parity are preserved.
    const step = 5 / intervals;
    const pairs = [];
    let heated = 0;
    for (let i = 0; i <= intervals; i++) {
      const u = i * step;
      const equilibrium = Math.exp(-u * u) / Math.sqrt(Math.PI);
      const weight = i === 0 || i === intervals ? step / 2 : step;
      const plus = selection(u), minus = selection(-u);
      heated += weight * equilibrium * (plus + minus);
      pairs.push({
        u, equilibrium, weight, plus, minus,
        bias: equilibrium * (plus - minus) / 2,
        coldRate: (1 + u * u) ** -1.5,
        hotRate: (1 + u * u + perpendicularGain) ** -1.5
      });
    }
    // Average the impulse response over exponentially distributed interaction ages.
    const memory=(rate,time)=>continuous ? 1/(1+5*rate) : Math.exp(-rate*time);
    const asymmetry = (pair, time) => pair.bias * (memory(pair.hotRate,time) - memory(pair.coldRate,time));
    function current(time) {
      let mean = 0;
      for (const pair of pairs) mean += 2 * pair.weight * pair.u * asymmetry(pair, time);
      return mean === 0 ? 0 : -mean; // J_parallel / (e n_e v_th)
    }
    function distribution(time) {
      const negative = [], positive = [];
      for (const pair of pairs) {
        const delta = asymmetry(pair, time);
        const point = (u, difference, fraction) => ({
          u, equilibrium: pair.equilibrium, delta: difference,
          total: pair.equilibrium + difference, selected: pair.equilibrium * fraction
        });
        if (pair.u) negative.push(point(-pair.u, -delta, pair.minus));
        positive.push(point(pair.u, delta, pair.plus));
      }
      return negative.reverse().concat(positive);
    }
    function populations(time) {
      const groups = [{}, {}];
      for (const group of groups) Object.assign(group,{left:0,right:0,mean:0});
      for (const p of pairs) {
        const hot = (p.plus+p.minus)*p.equilibrium/2;
        for (let i=0;i<2;i++) {
          const base = i===0 ? hot : p.equilibrium-hot;
          const bias = i===0 ? p.bias*memory(p.hotRate,time) : -p.bias*memory(p.coldRate,time);
          groups[i].left += p.weight*(base-bias);
          groups[i].right += p.weight*(base+bias);
          groups[i].mean += 2*p.weight*p.u*bias;
        }
      }
      return groups;
    }
    function displacement(time) {
      let sum = 0;
      for (const p of pairs) {
        const integral = rate => -Math.expm1(-rate*time)/rate;
        sum += 2*p.weight*p.u*p.bias*(integral(p.hotRate)-integral(p.coldRate));
      }
      return sum;
    }
    const resonantU = doppler === 0 ? null : detuning / doppler;
    // All particles enter at z=0. In the frame rotating at Omega_e the magnetic
    // term cancels; integrate a exp(i delta s) exactly, s = Omega_e t.
    function pulseState(u, cycles, initialPerp = 1, phase = 0) {
      const s = 2*Math.PI*Math.max(0,Math.min(pulseCycles,cycles));
      const slip = (detuning - doppler*u)/cyclotron*s;
      const half = slip/2;
      const kick = acceleration*s*(Math.abs(half)<1e-7 ? 1-half*half/6 : Math.sin(half)/half);
      const x = initialPerp*Math.cos(phase) + kick*Math.cos(half);
      const y = initialPerp*Math.sin(phase) + kick*Math.sin(half);
      const forceX = Math.cos(slip), forceY = Math.sin(slip);
      const perp = Math.hypot(x,y);
      return {u, x, y, forceX, forceY, perp, radius:perp, energy:u*u+perp*perp,
        gain:perp*perp-initialPerp*initialPerp, power:2*acceleration*(x*forceX+y*forceY)};
    }
    const firstU = resonantU === null ? 1 : Math.max(-3,Math.min(3,resonantU));
    const otherU = (firstU < 0 ? 1 : -1)*(Math.abs(firstU)<.5 ? 2 : 1);
    return {parallel, heated, selection, displacement, resonantU, comparison:[firstU,otherU],
      pulseState,current, distribution, populations};
  }

  const api = {experiment, cyclotron, thermalOverC, maxTime, pulseCycles, acceleration};
  if (typeof module !== 'undefined') module.exports = api;
  else root.ECCD = api;
})(globalThis);
