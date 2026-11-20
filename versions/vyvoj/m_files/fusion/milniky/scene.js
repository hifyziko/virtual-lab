'use strict';

(() => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('plant');

  function add(parent, tag, attrs = {}) {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    parent.append(el);
    return el;
  }

  // Revolve shaped poloidal cross sections around the central solenoid and
  // project into an inclined orthographic view. Open a sector to expose layers.
  const tau = Math.PI * 2;
  const faces = [];
  function project(r, z, a) {
    return [281 + r * Math.cos(a), 217 + .39 * r * Math.sin(a) - .92 * z,
      .92 * r * Math.sin(a) + .39 * z];
  }
  function profile(radial, vertical, center, shaping) {
    return t => [center + radial * Math.cos(t + shaping * Math.sin(t)), vertical * Math.sin(t)];
  }
  function surface(section, a0, a1, count, color, segments = 32, seams = false) {
    for (let i = 0; i < count; i++) {
      const a = a0 + (a1 - a0) * i / count;
      const b = a0 + (a1 - a0) * (i + 1) / count;
      for (let j = 0; j < segments; j++) {
        const t = tau * j / segments;
        const u = tau * (j + 1) / segments;
        const points = [project(...section(t), a), project(...section(t), b),
          project(...section(u), b), project(...section(u), a)];
        const light = .83 + .13 * Math.sin(t + .48) + .14 * Math.cos(a + .8);
        faces.push({points, color, light, seam: seams && i % 4 === 0});
      }
    }
  }

  const coil = profile(62, 105, 104, .48);
  for (let i = 0; i < 18; i++) {
    const a = tau * i / 18;
    if (a < 1.42 || a > 6.04) continue;
    // A toroidal-field coil is a solid band around the vessel cross section.
    surface(t => {
      const outer = coil(t);
      return [outer[0] - 5, outer[1] * .96];
    }, a - .036, a + .036, 1, [158, 111, 68], 36);
    surface(coil, a - .045, a + .045, 1, [192, 149, 103], 36);
    for (const edge of [a - .045, a + .045]) {
      for (let j = 0; j < 36; j++) {
        const t = tau * j / 36;
        const u = tau * (j + 1) / 36;
        const inner = v => [104 + (coil(v)[0] - 104) * .88, coil(v)[1] * .90];
        const points = [project(...coil(t), edge), project(...coil(u), edge),
          project(...inner(u), edge), project(...inner(t), edge)];
        faces.push({points, color:[139, 101, 70], light: 1 + .16 * Math.sin(t)});
      }
    }
  }
  const vessel = profile(53, 91, 104, .39);
  const blanket = profile(44, 79, 105, .36);
  surface(vessel, 1.44, 6.05, 64, [145, 167, 180], 32, true);
  surface(blanket, 1.12, 6.17, 64, [219, 166, 102], 32, true);
  for (const [angle, outer] of [[1.44, vessel], [1.12, blanket], [6.05, vessel]]) {
    for (let j = 0; j < 32; j++) {
      const a = tau * j / 32, b = tau * (j + 1) / 32;
      const inner = t => [104 + (outer(t)[0] - 104) * .9, outer(t)[1] * .91];
      faces.push({points:[project(...outer(a), angle), project(...outer(b), angle),
        project(...inner(b), angle), project(...inner(a), angle)], color:[105, 92, 90], light:1.15});
    }
  }
  surface(profile(29, 55, 105, .39), 0, tau, 80, [182, 101, 183]);
  surface(profile(11, 7, 106, .2), -.2, 1.50, 28, [67, 86, 99], 14);
  for (let i = 0; i < 7; i++) {
    const z = -95 + i * 29;
    surface(t => [23 + 2 * Math.cos(t), z + 13 * Math.sin(t)], 0, tau, 36, [150, 109, 79], 12);
  }
  const tokamak = document.getElementById('tokamak');
  const fragment = document.createDocumentFragment();
  const depth = f => f.points.reduce((sum, p) => sum + p[2], 0) / f.points.length;
  faces.sort((a, b) => depth(a) - depth(b));
  for (const {points, color, light, seam} of faces) {
    const fill = 'rgb(' + color.map(v => Math.min(255, Math.round(v * light))).join(',') + ')';
    add(fragment, 'polygon', {points:points.map(([x,y]) => x.toFixed(2)+','+y.toFixed(2)).join(' '),
      fill, stroke:seam ? '#526474' : fill, 'stroke-width':seam ? .38 : .65});
  }
  tokamak.append(fragment);

  const heat = '#c46a36', power = '#356ac3', gray = '#768691';
  const routes = [
    ['neutrons','Neutronový výkon do blanketu',heat,'M367 219 Q393 217 419 210'],
    ['blanketGain','Přírůstek tepla v blanketu',heat,'M417 252 Q429 236 426 217'],
    ['plasmaLoss','Teplo odvedené z plazmatu',heat,'M356 258 Q389 272 426 259V210'],
    ['thermal','Teplo do výměníku',heat,'M426 210H489Q498 210 498 220'],
    ['return','Návrat chladiva – značka okruhu',gray,'M500 249H486Q477 249 477 274H429'],
    ['steam','Teplo pracovního oběhu',heat,'M532 145V113H648Q660 113 660 125V178'],
    ['shaft','Mechanický výkon na hřídeli','#927156','M698 222H750'],
    ['gross','Hrubý elektrický výkon',power,'M806 175V123H883V227'],
    ['grid','Výměna výkonu se sítí',power,'M883 227H917'],
    ['own','Ostatní vlastní spotřeba',power,'M883 227V335H903V356'],
    ['recirc','Elektrický příkon ohřevu',power,'M883 227V333H827Q819 333 819 343V426H121Q103 426 103 408V363'],
    ['beamPower','Elektrický příkon NBI',power,'M103 363H12Q6 363 6 354V173H29'],
    ['wavePower','Elektrický příkon vlnového ohřevu',power,'M103 363V331H65V297'],
    ['beam','Výkon neutrálního svazku','#b57825','M116 171L217 210Q236 216 251 214'],
    ['wave','Výkon elektromagnetických vln','#16858a','M119 275Q126 259 135 272T152 269T169 265T186 261L211 250'],
    ['alpha','Energie alfa částic předaná plazmatu','#8648a4','M329 240Q353 233 369 250Q377 270 349 273Q325 269 329 250'],
    ['conversionLoss','Odpadní teplo pracovního oběhu',gray,'M699 287V341Q699 346 709 346H789'],
    ['heatingLoss','Odpadní teplo zdrojů ohřevu',gray,'M48 298V321H20'],
  ];
  const tracks = routes.map(([key, label, color, d]) => {
    const container = add(document.getElementById(['beamPower','wavePower','recirc','own','gross','steam','return'].includes(key) ? 'rear-flows' : 'front-flows'),
      'g', {class:'flow','data-flow':key,style:'--flow:'+color});
    const title = add(container, 'title');
    add(container,'path',{d,class:'pipe'});
    const current = add(container,'path',{d,class:'current'});
    const arrows = add(container,'g',{class:'arrows'});
    const length = current.getTotalLength();
    const tips = Array.from({length:Math.max(1,Math.floor(length/82))}, () => add(arrows,'path'));
    return {key,label,container,title,current,arrows,length,tips,amount:0};
  });
  const ohmic = add(svg, 'g', {class:'annotation',id:'ohmic-scene'});
  add(ohmic,'path',{d:'M256 94V264M304 94V170M316 250Q352 267 387 247',fill:'none',stroke:'#725198',
    'stroke-width':3,'stroke-dasharray':'6 4'});
  add(ohmic,'path',{d:'M377 244L390 245L384 256Z',fill:'#725198'});
  add(ohmic,'text',{x:292,y:312,fill:'#604477','font-size':14,'font-weight':700}).textContent='Indukovaný proud · rozběh';

  const focusGroups = {
    science:['neutrons','alpha','beam','wave'],
    ignition:['alpha','plasmaLoss'],
    engineering:['thermal','steam','shaft','gross','recirc','grid','own','beamPower','wavePower']
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let request;
  function draw(time) {
    for (const t of tracks) {
      if (!t.amount || t.key === 'return') continue;
      const direction = Math.sign(t.amount);
      const width = t.width;
      const size = Math.max(3.7, width * .54);
      for (const [i, tip] of t.tips.entries()) {
        const period = t.length / t.tips.length;
        const move = reduced.matches ? period * .54 : (time * .039) % period;
        const position = (i * period + move) % t.length;
        const s = direction > 0 ? position : t.length - position;
        const p = t.current.getPointAtLength(s);
        const lo = t.current.getPointAtLength(Math.max(0,s-1));
        const hi = t.current.getPointAtLength(Math.min(t.length,s+1));
        const angle = Math.atan2(hi.y-lo.y,hi.x-lo.x) * 180 / Math.PI + (direction < 0 ? 180 : 0);
        tip.setAttribute('transform','translate('+p.x+' '+p.y+') rotate('+angle+')');
        tip.setAttribute('d','M'+size+' 0L'+(-size)+' '+(-size*.73)+'V'+(size*.73)+'Z');
      }
    }
    if (!reduced.matches) request = requestAnimationFrame(draw);
  }
  function update(m, selected, showOhmic, format) {
    const amounts = {...m, grid:m.net, return:m.thermal, steam:m.thermal, shaft:m.gross};
    for (const t of tracks) {
      const value = amounts[t.key];
      t.amount = Math.abs(value) < 1e-9 ? 0 : value;
      t.width = t.amount ? 1.6 + 12 * Math.sqrt(Math.min(1,Math.abs(t.amount)/1800)) : 0;
      t.current.style.strokeWidth = t.key === 'return' && t.amount ? '1.5px' : t.width+'px';
      t.arrows.style.visibility = t.amount ? 'visible' : 'hidden';
      t.container.classList.toggle('dim', !!selected && !focusGroups[selected].includes(t.key));
      t.title.textContent = t.key === 'return' ? t.label : t.label+' · '+format(Math.abs(t.amount))+' MW';
    }
    ohmic.classList.toggle('active',showOhmic);
    if (reduced.matches) draw(0);
  }
  function motionChange() {
    cancelAnimationFrame(request);
    draw(0);
  }
  reduced.addEventListener('change',motionChange);
  motionChange();
  window.HiFyzikoMilestoneScene = {update};
  window.HiFyzikoFusionDispose = () => {
    cancelAnimationFrame(request);
    reduced.removeEventListener('change',motionChange);
  };
})();
