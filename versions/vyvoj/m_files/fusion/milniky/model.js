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

  function solve(input) {
    const {fusion, plasmaLoss, beamShare, beamEfficiency, waveEfficiency,
      grossEfficiency, ownShare, multiplication, heatingOff} = input;
    const alpha = alphaShare * fusion;
    const neutrons = (1 - alphaShare) * fusion;
    const blanketGain = (multiplication - 1) * fusion;
    const needed = Math.max(0, plasmaLoss - alpha);
    const heating = heatingOff ? 0 : needed;
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

  const model = {defaults, presets, solve};
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.HiFyzikoMilestones = model;
})(globalThis);
