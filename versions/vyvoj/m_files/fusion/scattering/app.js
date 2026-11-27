(() => {
  'use strict';

  const model = window.HiFyzikoScattering;
  const particles = window.HiFyzikoParticleStyle;
  const $ = id => document.getElementById(id);
  const series = ['#287597', '#7856ab'];
  const names = ['slow', 'fast'];
  const forceColor = particles.fields.electric;
  const momentumColor = '#315d78';
  const referenceColor = '#718693';
  const speed = $('speed'), time = $('time');
  const particleViews = new Map();
  for (const name of [...names, 'meetings']) {
    try {
      particleViews.set(name, new window.HiFyzikoNucleusView($(name + '-particles'), { supersample: 2 }));
    } catch {
      // The particle labels and shared-color markers also work without WebGL.
    }
  }
  let faster, orbits, timeMarks, fastRowDuration, endTime, sceneBottom, clock = 0, pixelRatio = 1;
  let animation = 0, previousTime = null;

  const decimal = (value, places = 1) => value.toFixed(places).replace('.', '{,}');
  function math(element, latex) {
    if (element.dataset.rendered === latex) return;
    katex.render(latex, element, { throwOnError: true });
    element.dataset.rendered = latex;
  }

  function surface(id) {
    const canvas = $(id);
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return null;
    const pixelsWide = Math.round(width * pixelRatio), pixelsHigh = Math.round(height * pixelRatio);
    if (canvas.width !== pixelsWide) canvas.width = pixelsWide;
    if (canvas.height !== pixelsHigh) canvas.height = pixelsHigh;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function label(id, field, x, y, visible, marginX = 12) {
    const element = $(id);
    element.hidden = !visible;
    if (!visible) return;
    element.style.left = Math.max(marginX, Math.min(field.width - marginX, x)) + 'px';
    element.style.top = Math.max(10, Math.min(field.height - 10, y)) + 'px';
  }

  function line(ctx, x, y, toX, toY, color, width = 1, dash = []) {
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.moveTo(x, y);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function arrow(ctx, x, y, dx, dy, color, width = 2, head = 8) {
    const length = Math.hypot(dx, dy);
    if (length < 1) return;
    const tip = Math.min(head, length * 0.72);
    const halfHead = tip * 0.45, halfShaft = Math.min(width / 2, halfHead);
    const base = length - tip;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -halfShaft);
    ctx.lineTo(base, -halfShaft);
    ctx.lineTo(base, -halfHead);
    ctx.lineTo(length, 0);
    ctx.lineTo(base, halfHead);
    ctx.lineTo(base, halfShaft);
    ctx.lineTo(0, halfShaft);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function disk(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawParticles(name, field, items) {
    const view = particleViews.get(name);
    if (view && !view.disposed) {
      view.draw(field.width, field.height, clock, items);
      return;
    }
    for (const item of items) {
      for (const [x, y, , type] of particles.connected.atoms[item.id]) {
        const kind = type < 0 ? 'e' : type > 0 ? 'p' : 'n';
        const color = '#' + particles.colors[kind].toString(16).padStart(6, '0');
        disk(field.ctx, item.x + x * item.radius, item.y + y * item.radius, particles.radii[kind] * item.radius, color);
      }
    }
  }

  function trajectory(ctx, orbit, last, interval, mapX, mapY, position, color, width) {
    const [startX, startY] = orbit.samples[0].state;
    ctx.beginPath();
    ctx.moveTo(mapX(startX), mapY(startY));
    for (let i = interval; i < last; i += interval) {
      const [x, y] = orbit.samples[i].state;
      ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.lineTo(mapX(position[0]), mapY(position[1]));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  let showRadiation = false, showPlots = false;
  let histories, powerReference, energyReference, plotEnd;
  function selectAnalysis(visible) {
    showPlots = visible;
    document.querySelector('.analysis').hidden = visible;
    $('radiation-analysis').hidden = !visible;
  }
  $('view-radiation').onclick = () => { selectAnalysis(true); render(); };
  $('view-relaxation').onclick = () => { selectAnalysis(false); render(); };
  const maps = [];
  const fluxColor = [174, 83, 18];
  const fluxLimit = 0.05;
  const logRange = Math.log1p(40000 * fluxLimit);
  const fluxIntensity = flux => Math.min(1, Math.log1p(40000 * flux) / logRange);

  for (const name of names) {
    const ramp = $(name + '-scale').querySelector('.flux-ramp');
    ramp.style.setProperty('--flux-color', 'rgb(' + fluxColor.join(',') + ')');
    for (const [flux, tex] of [[0, '0'], [0.0001, '10^{-4}'], [0.001, '10^{-3}'], [0.01, '10^{-2}'], [fluxLimit, '\\geq 0{,}05']]) {
      const tick = document.createElement('span');
      tick.className = 'flux-tick';
      tick.style.left = (100 * fluxIntensity(flux)) + '%';
      math(tick, tex);
      ramp.appendChild(tick);
    }
  }

  function drawRadiation(index, field, unit, centerX, centerY) {
    const {ctx, width, height} = field;
    const cols = Math.max(2, Math.ceil(width / 5)), rows = Math.max(2, Math.ceil(height / 5));
    let map = maps[index];
    if (!map || map.canvas.width !== cols || map.canvas.height !== rows) {
      const canvas = document.createElement('canvas');
      canvas.width = cols; canvas.height = rows;
      const brush = canvas.getContext('2d');
      map = maps[index] = { canvas, brush, image: brush.createImageData(cols, rows) };
    }
    const orbit = orbits[index], pixels = map.image.data;

    for (let row = 0, p = 0; row < rows; row++) {
      const y = (centerY - (row + .5) * height / rows) / unit;
      for (let col = 0; col < cols; col++, p += 4) {
        const x = ((col + .5) * width / cols - centerX) / unit;
        const fieldValue = model.radiationAt(orbit, x, y, clock);
        // In the outgoing radiation field the Poynting magnitude is proportional to B².
        const relativeFlux = fieldValue * fieldValue;
        const intensity = fluxIntensity(relativeFlux);
        for (let channel = 0; channel < 3; channel++)
          pixels[p + channel] = 255 + (fluxColor[channel] - 255) * intensity;
        pixels[p + 3] = 255;
      }
    }
    map.brush.putImageData(map.image, 0, 0);
    ctx.drawImage(map.canvas, 0, 0, width, height);
  }

  $('radiation-toggle').onclick = () => {
    showRadiation = !showRadiation;
    $('radiation-toggle').setAttribute('aria-pressed', String(showRadiation));
    for (const name of names) $(name + '-scale').hidden = !showRadiation;
    selectAnalysis(showRadiation);
    render();
  };

  $('coulomb-layer').onchange = () => render();
  const coulombViews = [];

  function drawFlight(index, current) {
    const name = names[index], orbit = orbits[index];
    const [x, y, vx, vy] = current.state;
    math($('angle-' + name), decimal(Math.abs(Math.atan2(vy, vx)) * 180 / Math.PI) + '\\,^{\\circ}');
    math($('duration-' + name), decimal(current.near) + '\\,t_0');
    const field = surface(name);
    if (!field) return;
    const { ctx, width, height } = field, color = series[index];
    const unit = Math.min(width / 14.6, height / (2.5 - sceneBottom));
    const mapX = position => width / 2 + (position + 0.25) * unit;
    const mapY = position => height / 2 - (position - (2.5 + sceneBottom) / 2) * unit;
    const px = mapX(x), py = mapY(y), centerX = mapX(0), centerY = mapY(0);
    const radius = Math.max(10, Math.min(20, unit * 0.4));
    const bandLeft = mapX(-model.zone), bandRight = mapX(model.zone);

    const sceneWash = ctx.createLinearGradient(0, 0, 0, height);
    sceneWash.addColorStop(0, '#f8fbfc');
    sceneWash.addColorStop(1, '#eaf2f6');
    ctx.fillStyle = sceneWash;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#d7eaf38c';
    ctx.fillRect(bandLeft, 0, bandRight - bandLeft, height);
    if (showRadiation) drawRadiation(index, field, unit, centerX, centerY);
    ctx.beginPath();
    for (let gridX = centerX % unit; gridX < width; gridX += unit) {
      ctx.moveTo(gridX, 0);
      ctx.lineTo(gridX, height);
    }
    for (let gridY = centerY % unit; gridY < height; gridY += unit) {
      ctx.moveTo(0, gridY);
      ctx.lineTo(width, gridY);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#c4d6de65';
    ctx.stroke();
    for (const edge of [bandLeft, bandRight]) line(ctx, edge, 0, edge, height, '#8facbb', 1, [4, 5]);
    for (const ring of (showRadiation ? [] : [0.42, 0.8, 1.22])) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, ring * unit, 0, 2 * Math.PI);
      ctx.strokeStyle = '#d3b4a4';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    if ($('coulomb-layer').checked) {
      const view = coulombViews[index] ??= new window.HiFyzikoPlasmaField.SyncFieldView();
      view.draw(ctx, width, height, [{ x: centerX, y: centerY, q: 1 }, { x: px, y: py, q: -1 }], unit, false);
    }
    line(ctx, 0, mapY(model.impact), width, mapY(model.impact), '#839ba6', 1, [5, 5]);
    const last = orbit.samples.length - 1;
    trajectory(ctx, orbit, last, 5, mapX, mapY, orbit.samples[last].state, color + '77', 2);
    trajectory(ctx, orbit, current.index, 3, mapX, mapY, current.state, '#fff', 5);
    trajectory(ctx, orbit, current.index, 3, mapX, mapY, current.state, color, 3);
    for (const mark of timeMarks[index]) {
      if (mark.time > clock) break;
      disk(ctx, mapX(mark.x), mapY(mark.y), 3.2, '#fff');
      disk(ctx, mapX(mark.x), mapY(mark.y), 2.2, color);
    }

    const vectorScale = Math.min(unit, 44);
    const momentumX = vx * vectorScale * 0.7, momentumY = -vy * vectorScale * 0.7;
    const [fx, fy] = model.acceleration(x, y);
    const forceX = fx * vectorScale * 7, forceY = -fy * vectorScale * 7;
    const forceExtendsBeyondElectron = Math.hypot(forceX, forceY) > radius * particles.radii.e + 3;
    arrow(ctx, px, py, momentumX, momentumY, momentumColor, 2.6);
    arrow(ctx, px, py, forceX, forceY, forceColor, 2.8);
    label(name + '-momentum', field, px + momentumX * 0.7, py + momentumY * 0.7 - 14, true);
    label(name + '-force', field, px + forceX * 0.8 + 9 * Math.sign(forceX), py + forceY * 0.8 + 13, forceExtendsBeyondElectron);
    drawParticles(name, field, [
      { id: 'deuteron', x: centerX, y: centerY, radius },
      { id: 'electron', x: px, y: py, radius, vibration: 0 }
    ]);
    label(name + '-ion', field, centerX, centerY + radius + 13, true, 17);
    label(name + '-electron', field, px - 14, py - radius * 0.45 - 10, true, 15);
  }

  function drawImpulse(current) {
    const timeScale = Math.max(orbits[0].totalNear, orbits[1].totalNear);
    const impulseScale = Math.max(orbits[0].peakImpulse, orbits[1].peakImpulse);
    names.forEach((name, i) => {
      const near = current[i].near, impulse = Math.abs(current[i].state[3]);
      $('time-bar-' + name).style.width = (100 * near / timeScale) + '%';
      $('impulse-bar-' + name).style.width = (100 * impulse / impulseScale) + '%';
      math($('time-graph-' + name), decimal(near) + '\\,t_0');
      math($('impulse-graph-' + name), decimal(impulse, 2) + '\\,p_0');
    });
  }

  function drawComposition(impulse) {
    const field = surface('momentum');
    if (!field) return;
    const { ctx, width, height } = field;
    const x = 76;
    const scale = Math.min((width - x - 63) / 2.4, height * 0.76);
    orbits.forEach((orbit, i) => {
      const y = height * (i === 0 ? 0.17 : 0.67), dx = orbit.speed * scale, dy = impulse * scale;
      ctx.fillStyle = series[i] + '0c';
      ctx.fillRect(0, i * height / 2, width, height / 2);
      ctx.font = '600 13px "Segoe UI", sans-serif';
      ctx.fillStyle = series[i];
      ctx.fillText(i === 0 ? 'Pomalejší' : 'Rychlejší', 7, y + 4);
      line(ctx, x, y, width - 8, y, '#c5d4dc', 1, [4, 4]);
      arrow(ctx, x, y, dx, 0, referenceColor, 2.5);
      const hasKick = dy > 3;
      if (hasKick) {
        arrow(ctx, x + dx, y, 0, dy, forceColor, 2.5);
        arrow(ctx, x, y, dx, dy, momentumColor, 2.5);
      }
      const name = names[i];
      label('vst-' + name, field, x + dx * 0.52, y - 12, true, 25);
      label('kick-' + name, field, x + dx + 24, y + dy * 0.55, hasKick, 24);
      label('sum-' + name, field, x + dx * 0.6, y + dy * 0.6 + 13, hasKick, 26);
      disk(ctx, x, y, 5, series[i]);
    });
  }

  function drawEncounters() {
    const rows = orbits.map(orbit => model.encounters(clock / fastRowDuration, orbit.speed, faster));
    names.forEach((name, i) => math($('count-' + name), 'N=' + rows[i].count));
    const scene = surface('meetings'), plot = surface('directions');
    if (!scene || !plot) return;
    const witnessElectrons = [];
    for (const [i, row] of rows.entries()) {
      const y = scene.height * (i === 0 ? 0.25 : 0.75), left = 14;
      const spacing = (scene.width - 31) / model.maxEncounters;
      const tint = series[i] + '12';
      scene.ctx.fillStyle = tint;
      scene.ctx.fillRect(0, i * scene.height / 2, scene.width, scene.height / 2);
      line(scene.ctx, left, y, scene.width - 10, y, '#c4d3db', 1, [3, 4]);
      for (let j = 1; j <= model.maxEncounters; j++) {
        disk(scene.ctx, left + j * spacing, y - Math.min(8, scene.height * 0.1), j <= row.count ? 2.6 : 1.8, j <= row.count ? '#b94a38' : '#bdcdd5');
      }
      const reached = left + row.distance * spacing;
      line(scene.ctx, left, y, reached, y, series[i], 2);
      witnessElectrons.push({ id: 'electron', x: reached, y, radius: 14, vibration: 0 });

      const columns = 7, half = plot.height / 2;
      const stride = plot.width / columns, length = Math.min(stride * 0.55, half * 0.17, 22);
      plot.ctx.fillStyle = tint;
      plot.ctx.fillRect(0, i * half, plot.width, half);
      if (i > 0) line(plot.ctx, 0, half, plot.width, half, '#cbdbe3');
      row.angles.forEach((angle, j) => {
        const ax = (j % columns + 0.33) * stride;
        const ay = (i + (Math.floor(j / columns) + 0.5) / 4) * half;
        arrow(plot.ctx, ax, ay, length * Math.cos(angle), -length * Math.sin(angle), series[i], 1.5, 4.5);
      });
    }
    drawParticles('meetings', scene, witnessElectrons);
  }

  function drawRadiationPlot(key, reference) {
    const field = surface(key + '-plot');
    if (!field) return;
    const {ctx, width, height} = field;
    const left = 43, right = width - 25, bottom = height - 28, top = 18;
    const px = t => left + (right - left) * t / plotEnd;
    const ceiling = key === 'power' ? powerCeiling : energyCeiling;
    const py = value => bottom - (bottom - top) * value / (reference * ceiling);
    for (const fraction of [0.5, 1]) {
      const y = py(reference * fraction);
      line(ctx, left, y, right, y, '#d0dfe4', 1, [3, 3]);
    }
    arrow(ctx, left, bottom, right - left + 7, 0, referenceColor, 1, 5);
    arrow(ctx, left, bottom, 0, top - bottom - 7, referenceColor, 1, 5);
    const elapsed = Math.min(clock, plotEnd);
    histories.forEach((history, i) => {
      function curve(until, color, thickness, shade = false) {
        const end = Math.min(until, history[history.length - 1].time);
        const step = history[1].time;
        const index = Math.min(history.length - 1, Math.floor(end / step));
        ctx.beginPath();
        ctx.moveTo(px(0), py(history[0][key]));
        for (let n = 1; n <= index; n += 3) ctx.lineTo(px(history[n].time), py(history[n][key]));
        const a = history[index], b = history[Math.min(index + 1, history.length - 1)];
        const value = a[key] + (b[key] - a[key]) * (end - a.time) / step;
        ctx.lineTo(px(end), py(value));
        if (key === 'energy' && until > end) ctx.lineTo(px(until), py(value));
        if (shade && end > 0) {
          const gradient = ctx.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, color + '3d');
          gradient.addColorStop(1, color + '03');
          ctx.save();
          ctx.lineTo(px(key === 'energy' ? until : end), bottom);
          ctx.lineTo(left, bottom);
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.restore();
          return;
        }
        ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.stroke();
      }
      if (elapsed > 0) curve(elapsed, series[i], 2.6, true);
      curve(plotEnd, series[i] + '46', 1.4);
      curve(elapsed, series[i], 2.6);
    });
    const cursor = px(Math.min(clock, plotEnd));
    line(ctx, cursor, top, cursor, bottom, '#627782', 1, [3, 3]);
    $('axis-' + key).style.top = (py(reference) - 8) + 'px';
  }

  let powerCeiling, energyCeiling;
  function render() {
    const scale = Number(document.documentElement.style.getPropertyValue('--fusion-fit')) || 1;
    pixelRatio = Math.max(1, Math.min((window.devicePixelRatio || 1) * scale, 3));
    const current = orbits.map(orbit => model.at(orbit, clock));
    current.forEach((sample, i) => drawFlight(i, sample));
    if (showPlots) {
      drawRadiationPlot('power', powerReference);
      drawRadiationPlot('energy', energyReference);
    } else {
      drawImpulse(current);
      drawComposition(Math.abs(current[0].state[3]));
      drawEncounters();
    }
    math($('time-value'), decimal(clock) + '\\,t_0');
    time.value = clock;
  }

  function refresh() {
    faster = Number(speed.value);
    orbits = [model.integrate(1), model.integrate(faster)];
    histories = orbits.map(model.radiationHistory);
    const energies = histories.map(history => history[history.length - 1].energy);
    const peaks = histories.map(history => Math.max(...history.map(sample => sample.power)));
    powerReference = peaks[0];
    energyReference = energies[0];
    powerCeiling = 1.06 * Math.max(...peaks) / powerReference;
    energyCeiling = 1.06 * Math.max(...energies) / energyReference;
    plotEnd = Math.ceil(Math.max(...orbits.map(orbit => orbit.end)));
    for (const key of ['power', 'energy']) math($('end-' + key), decimal(plotEnd, 0) + '\\,t_0');
    names.forEach((name, index) => {
      const percent = 100 * energies[index] / energies[0];
      math($('energy-' + name), decimal(percent, 1) + '\\,\\%');

    });
    timeMarks = orbits.map(orbit => {
      const marks = [];
      for (let instant = 0; instant < orbit.end; instant += 0.65) {
        const [x, y] = model.at(orbit, instant).state;
        marks.push({ time: instant, x, y });
      }
      return marks;
    });
    fastRowDuration = orbits[0].end + 1.2;
    endTime = fastRowDuration * faster;
    clock = Math.min(clock, endTime);
    sceneBottom = Math.min(-0.95, ...orbits[0].samples.map(({ state }) => state[1] - 0.6));
    math($('speed-value'), decimal(faster) + '\\times');
    math($('speed-fast'), decimal(faster) + '\\,v_0');
    time.max = endTime;
    render();
  }

  function stopPlayback() {
    cancelAnimationFrame(animation);
    animation = 0;
    previousTime = null;
  }

  function shoot() {
    stopPlayback();
    clock = 0;
    $('shoot').textContent = 'Vystřelit znovu';
    render();
    animation = requestAnimationFrame(frame);
  }

  function frame(timestamp) {
    if (previousTime !== null) {
      clock += Math.min((timestamp - previousTime) / 1000, 0.06) * 1.3;
      clock = Math.min(clock, endTime);
      render();
    }
    if (clock >= endTime) {
      animation = 0;
      $('shoot').textContent = 'Vystřelit znovu';
      return;
    }
    previousTime = timestamp;
    animation = requestAnimationFrame(frame);
  }

  document.querySelectorAll('[data-tex]').forEach(node => math(node, node.dataset.tex));
  $('help').onclick = () => $('guide').showModal();
  speed.oninput = () => {
    clock = 0;
    previousTime = null;
    refresh();
  };
  $('reset-speed').onclick = () => {
    speed.value = speed.defaultValue;
    speed.oninput();
  };
  time.oninput = () => {
    stopPlayback();
    clock = Math.min(endTime, Number(time.value));
    render();
  };

  refresh();
  $('shoot').onclick = shoot;
  const resize = new ResizeObserver(render);
  resize.observe(document.querySelector('main'));
  resize.observe(document.querySelector('.panels'));
  addEventListener('resize', render);
  window.HiFyzikoFusionDispose = () => {
    cancelAnimationFrame(animation);
    resize.disconnect();
    removeEventListener('resize', render);
    for (const view of particleViews.values()) view.dispose();
  };
})();
