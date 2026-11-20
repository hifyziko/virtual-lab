'use strict';

((root) => {
  const alphaShare = 0.2;
  const defaults = Object.freeze({
    fusion: 100, plasmaLoss: 200, beamShare: 50,
    beamEfficiency: 60, waveEfficiency: 60, grossEfficiency: 40,
    ownShare: 17.5, multiplication: 1.1, heatingOff: false
  });
  const presets = Object.freeze({
    low: {}, science: {fusion: 250}, engineering: {fusion: 550},
    ignition: {fusion: 1000}, off: {fusion: 0, plasmaLoss: 0}
  });

  function solve(input, depositedHeating) {
    const {fusion, plasmaLoss, beamShare, beamEfficiency, waveEfficiency,
      grossEfficiency, ownShare, multiplication, heatingOff} = input;
    const alpha = alphaShare * fusion;
    const neutrons = (1 - alphaShare) * fusion;
    const blanketGain = (multiplication - 1) * fusion;
    const needed = Math.max(0, plasmaLoss - alpha);
    const heating = heatingOff ? 0 : depositedHeating ?? needed;
    const beam = heating * beamShare / 100;
    const wave = heating - beam;
    const heatingEfficiency = 1 / (beamShare / beamEfficiency + (100 - beamShare) / waveEfficiency);
    const beamPower = beam / (beamEfficiency / 100);
    const wavePower = wave / (waveEfficiency / 100);
    const recirc = beamPower + wavePower;
    const delta = heating + alpha - plasmaLoss;

    // Recover plasma losses as heat once. The instantaneous control volume also
    // accounts for energy currently accumulating in or leaving its inventory.
    const thermal = neutrons + blanketGain + plasmaLoss;
    const gross = grossEfficiency / 100 * thermal;
    const own = ownShare / 100 * gross;
    const net = gross - own - recirc;
    const etaRec = (grossEfficiency / 100) * (1 - ownShare / 100) * heatingEfficiency;
    const q = heating > 0 ? fusion / heating : fusion > 0 ? Infinity : null;
    const qBreak = (1 - etaRec) / (multiplication * etaRec);
    const eps = 1e-9;
    const steady = Math.abs(delta) < eps;
    return {fusion, plasmaLoss, alpha, neutrons, blanketGain, heating, needed,
      beam, wave, beamPower, wavePower, recirc, delta, thermal, gross, own, net,
      conversionLoss: thermal - gross, heatingLoss: recirc - heating,
      heatingEfficiency, etaRec, q, qBreak, steady,
      science: fusion > 0 && fusion - heating >= -eps,
      engineering: (gross > 0 || recirc > 0) && net >= -eps,
      ignition: fusion > 0 && alpha - plasmaLoss >= -eps};
  }

  const volume = 830;
  const maxTemperature = 100;
  const nbiShare = 60;
  const kevJ = 1.602176634e-16;
  // Bosch & Hale, Nuclear Fusion 32 (1992), eq. 12 and table VII.
  // https://doi.org/10.1088/0029-5515/32/4/i07
  // Maxwellian D–T fit, temperature in keV, valid from 0.2 to 100 keV.
  function reactivity(t) {
    if (t < .2) return 0;
    if (t > maxTemperature) throw new RangeError('D–T temperature exceeds fit range');
    const theta = t / (1 - t*(.0151361+t*(.00460643-.00010675*t)) /
      (1+t*(.0751886+t*(.0135+.00001366*t))));
    const xi = Math.cbrt(34.3827**2/(4*theta));
    return 1e-6*1.17302e-9*theta*Math.sqrt(xi/(1124656*t**3))*Math.exp(-3*xi);
  }
  // MJ per keV at fixed total fuel-ion density. Equal D:T and T_i=T_e.
  const heatCapacity = density => 3*density*1e20*volume*kevJ/1e6;
  function experiment(input, energy) {
    const temperature = energy/heatCapacity(input.density);
    const fusion = (input.density*1e20/2)**2 * volume * reactivity(Math.min(temperature,maxTemperature))*17600*kevJ/1e6;
    const balance = solve({...defaults,...input,fusion,plasmaLoss:energy/input.confinement,
      beamShare:nbiShare}, input.externalHeating);
    // Show milestones only for an energetically relevant plasma in this lab.
    const active = fusion >= 1;
    return {...balance,energy,temperature,
      science:active && balance.science,engineering:active && balance.engineering,
      ignition:active && balance.ignition};
  }
  const model = {defaults, presets, solve, volume, maxTemperature, reactivity, heatCapacity, experiment};
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.HiFyzikoMilestones = model;
})(globalThis);
