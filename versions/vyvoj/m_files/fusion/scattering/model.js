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
    const distance = maxEncounters * Math.min(1, phase * speed / fastest);
    const count = Math.floor(distance);
    return { distance, count, angles: walks.map(sums => sums[count] * 0.09 / speed ** 2) };
  }

  // Acceleration term of the Liénard–Wiechert field in the orbital plane.
  // Return c³ Bz in common relative units for an electron (negative charge).
  // In the radiation field |E| = c |B|. Both layers share the same solver.
  const lightSpeed = 8;
  function radiationAt(orbit, x, y, time) {
    const samples = orbit.samples, last = samples.length - 1;
    const firstState = samples[0].state, lastState = samples[last].state;
    if (time < Math.hypot(x - firstState[0], y - firstState[1]) / lightSpeed ||
        time > orbit.end + Math.hypot(x - lastState[0], y - lastState[1]) / lightSpeed) return 0;
    let emission = Math.min(orbit.end, time);
    for (let pass = 0; pass < 7; pass++) {
      const pos = emission / step, i = Math.min(last - 1, Math.floor(pos)), blend = pos - i;
      const u = samples[i].state, v = samples[i + 1].state;
      const sx = u[0] + blend * (v[0] - u[0]), sy = u[1] + blend * (v[1] - u[1]);
      const dx = x - sx, dy = y - sy, radius = Math.hypot(dx, dy);
      if (radius < 1e-7) return 0;
      const nx = dx / radius, ny = dy / radius;
      const bx = (u[2] + blend * (v[2] - u[2])) / lightSpeed;
      const by = (u[3] + blend * (v[3] - u[3])) / lightSpeed;
      const k = 1 - nx * bx - ny * by;
      const residual = emission + radius / lightSpeed - time;
      if (Math.abs(residual) < 1e-6 || pass === 6) {
        const [ax, ay] = acceleration(sx, sy);
        return ((nx - bx) * ay - (ny - by) * ax) / (k * k * k * radius);
      }
      emission = Math.max(0, Math.min(orbit.end, emission - residual / k));
    }
  }

  // Liénard power integrated over the prescribed orbit. The common
  // dimensional coefficient cancels in the two-flight energy comparison.
  function radiationHistory(orbit) {
    let previous = 0, sum = 0;
    return orbit.samples.map(({ state: [x, y, vx, vy] }, index) => {
      const [ax, ay] = acceleration(x, y);
      const betaSquared = (vx * vx + vy * vy) / lightSpeed ** 2;
      const cross = (vx * ay - vy * ax) / lightSpeed;
      const power = (ax * ax + ay * ay - cross * cross) / (1 - betaSquared) ** 3;
      if (index) sum += step * (power + previous) / 2;
      previous = power;
      return {time: index * step, power, energy: sum};
    });
  }

  const model = { radiationHistory, radiationAt, lightSpeed, acceleration, integrate, at, encounters, impact, start, exit, zone, maxEncounters };
  root.HiFyzikoScattering = model;
  if (typeof module !== 'undefined') module.exports = model;
})(typeof window === 'undefined' ? globalThis : window);
