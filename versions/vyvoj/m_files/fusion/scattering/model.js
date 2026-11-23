/* Dimensionless parameters and fourth-order Runge–Kutta from the two-flight experiment. */
((root) => {
  'use strict';

  const coupling = 0.255, impact = 1.45, start = -6.2, exit = 5.2, zone = 2, step = 0.008;
  const maxEncounters = 25;
  function acceleration(x, y) {
    const factor = -coupling / Math.max(0.12, Math.hypot(x, y)) ** 3;
    return [factor * x, factor * y];
  }
  function derivative([x, y, vx, vy]) {
    return [vx, vy, ...acceleration(x, y)];
  }
  function advance(state, rate, interval) {
    return state.map((value, index) => value + interval * rate[index]);
  }
  function integrate(speed) {
    let state = [start, impact, speed, 0], near = 0, peakImpulse = 0;
    const samples = [{ state, near }];
    for (let i = 1; i < 7000; i++) {
      const first = derivative(state);
      const second = derivative(advance(state, first, step / 2));
      const third = derivative(advance(state, second, step / 2));
      const fourth = derivative(advance(state, third, step));
      state = state.map((value, j) => value + (step / 6) * (first[j] + 2 * second[j] + 2 * third[j] + fourth[j]));
      if (Math.abs(state[0]) <= zone) near += step;
      peakImpulse = Math.max(peakImpulse, Math.abs(state[3]));
      samples.push({ state, near });
      if (state[0] >= exit && state[2] > 0) break;
    }
    return { speed, samples, end: (samples.length - 1) * step, totalNear: near, peakImpulse };
  }
  function at(orbit, time) {
    const position = Math.min(orbit.end, Math.max(0, time)) / step;
    const index = Math.min(orbit.samples.length - 2, Math.floor(position));
    const blend = position - index;
    const { state, near } = orbit.samples[index], next = orbit.samples[index + 1];
    return {
      index,
      state: state.map((value, i) => value + blend * (next.state[i] - value)),
      near: near + blend * (next.near - near)
    };
  }

  // Reproducible angular random walks. Store cumulative sums for every encounter.
  let seed = 20261121;
  const walks = Array.from({ length: 28 }, () => {
    const sums = [0];
    // Keep the original 27 draws per electron for the reproducible comparison.
    for (let j = 0; j < 27; j++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      sums.push(sums[j] + (seed < 0x80000000 ? -1 : 1));
    }
    return sums;
  });
  function encounters(phase, speed, fastest) {
    const distance = maxEncounters * phase * (speed / fastest);
    const count = Math.floor(distance);
    return { distance, count, angles: walks.map(sums => sums[count] * 0.09 / speed ** 2) };
  }

  const model = { acceleration, integrate, at, encounters, impact, start, exit, zone, maxEncounters };
  root.HiFyzikoScattering = model;
  if (typeof module !== 'undefined') module.exports = model;
})(typeof window === 'undefined' ? globalThis : window);
