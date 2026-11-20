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

  // Project the same section profiles used by the tokamak equilibrium lesson.
  const cad = window.TokamakCADData;
  const {vessel, tf, divertor, csSection} = cad.templates;
  const tau = Math.PI * 2;
  const cut = [1.48, 6.14];
  const faces = [];
  function project(r, z, a) {
    const h = 13 * r * Math.sin(a);
    return [284 + 13 * r * Math.cos(a), 221 + .43 * h - 11.74 * z, h + 6.17 * z];
  }
  function face(points, color, light, edge = false) {
    faces.push({points,color,light,edge});
  }
  function surface(section, a0, a1, steps, color, seams = 0) {
    for (let i = 0; i < steps; i++) {
      const a = a0 + (a1 - a0) * i / steps;
      const b = a0 + (a1 - a0) * (i + 1) / steps;
      for (let j = 0; j < (section.length === 2 ? 1 : section.length); j++) {
        const p = section[j], q = section[(j+1) % section.length];
        if (p[0] === q[0] && p[1] === q[1]) continue;
        const slope = Math.atan2(q[1]-p[1], q[0]-p[0]);
        const light = .91 + .20 * Math.cos(slope-.38) + .11 * Math.cos(a+1.4);
        face([project(...p,a),project(...p,b),project(...q,b),project(...q,a)],
          color,light,seams > 0 && (i % seams === 0 || i % seams === seams-1));
      }
    }
  }
  function rim(outer, inner, angle, color) {
    for (let j = 0; j < outer.length; j++) {
      const k = (j+1) % outer.length;
      face([project(...outer[j],angle),project(...outer[k],angle),
        project(...inner[k],angle),project(...inner[j],angle)],color,.99);
    }
  }
  const steel = [155,175,187], darkSteel = [88,109,125], copper = [184,123,75];
  for (let i = 0; i < cad.counts.tf; i++) {
    const a = tau*i/cad.counts.tf;
    if (a < cut[0] || a > cut[1]) continue;
    const halfBand = .064;
    surface(tf.outer,a-halfBand,a+halfBand,1,steel);
    surface(tf.inner,a-halfBand,a+halfBand,1,darkSteel);
    rim(tf.outer,tf.inner,a-halfBand,darkSteel);
    rim(tf.outer,tf.inner,a+halfBand,darkSteel);
    const winding = tf.inner.map(([r,z],j)=>[r*.60+tf.outer[j][0]*.40,z*.60+tf.outer[j][1]*.40]);
    surface(winding,a-halfBand-.007,a-halfBand+.008,1,copper);
    rim(winding,tf.inner,a-halfBand-.008,copper);
  }

  const sector = tau / cad.counts.vessel;
  for (let start = 0; start < tau; start += sector) {
    const a = Math.max(cut[0],start+.008), b = Math.min(cut[1],start+sector-.008);
    if (a >= b) continue;
    surface(vessel.outer,a,b,8,steel);
    surface(vessel.inner,a,b,8,[106,130,148]);
    rim(vessel.outer,vessel.inner,a,[109,135,150]);
    rim(vessel.outer,vessel.inner,b,[109,135,150]);
  }
  // The CAD has no blanket. Offset the lining into the CAD vessel aperture,
  // with the lower arc reserved for the original divertor section.
  const lining = vessel.inner.map(([r,z])=>[6.2+.88*(r-6.2),.88*z]);
  const panels = lining.map((p,i)=>[p,lining[(i+1)%lining.length]]).filter(([p,q])=>Math.min(p[1],q[1])>-2.9);
  for (let a = 1.01; a < 6.12; a += sector/2) {
    const b = Math.min(a+sector/2-.025,6.12);
    for (const panel of panels) surface(panel,a,b,4,[196,166,108],0);
  }
  for (const contour of divertor) surface(contour,-.23,1.55,18,[67,87,103],6);

  for (const part of cad.parts.filter(part=>part.part==='pf')) {
    const sections = part.sections.flat();
    const extent = index => [Math.min(...sections.map(p=>p[index])),Math.max(...sections.map(p=>p[index]))];
    const [r0,r1] = extent(0), [z0,z1] = extent(1);
    const r = (r0+r1)/2, z = (z0+z1)/2;
    const dr = Math.min((r1-r0)/2,.52), dz = Math.min((z1-z0)/2,.44);
    surface([[r-dr,z-dz],[r+dr,z-dz],[r+dr,z+dz],[r-dr,z+dz]],1.54,6.12,44,copper);
  }
  surface(csSection.structure,0,tau,56,[123,146,160]);
  const [,csRadius,csBottom,csTop] = csSection.bounds;
  const moduleHeight = (csTop-csBottom)/6;
  for (let i=0;i<6;i++) {
    const bottom = csBottom+i*moduleHeight+.07, top = bottom+moduleHeight-.15;
    surface([[csRadius-.24,bottom],[csRadius+.025,bottom],[csRadius+.025,top],[csRadius-.24,top]],
      0,tau,48,copper);
  }

  const plasma = Array.from({length:44},(_,j)=>{
    const t=tau*j/44;
    return [6.2 + 1.85*Math.cos(t+.39*Math.sin(t)), .18+3.02*Math.sin(t)];
  });
  surface(plasma,0,tau,88,[192,103,161]);
  const tokamak = document.getElementById('tokamak');
  const fragment = document.createDocumentFragment();
  const depth = f => f.points.reduce((sum, p) => sum + p[2], 0) / f.points.length;
  faces.sort((a, b) => depth(a) - depth(b));
  for (const {points, color, light, edge} of faces) {
    const fill = 'rgb(' + color.map(v => Math.min(255, Math.round(v * light))).join(',') + ')';
    add(fragment, 'polygon', {points:points.map(([x,y]) => x.toFixed(2)+','+y.toFixed(2)).join(' '),
      fill, stroke:edge ? '#728896' : fill, 'stroke-width':edge ? .48 : .52});
  }
  tokamak.append(fragment);

  const heat = '#c46a36', power = '#356ac3', gray = '#768691', water = '#628fa5';
  const routes = [
    ['neutrons','Neutronový výkon do blanketu',heat,'M369 221L401 210'],
    ['blanketGain','Přírůstek tepla v blanketu',heat,'M391 246Q403 230 402 217'],
    ['plasmaLoss','Teplo odvedené z plazmatu',heat,'M363 258L389 278Q413 259 414 227'],
    ['thermal','Tepelný výkon primárního okruhu',heat,'M419 218H492'],
    ['return','Návrat primárního chladiva',water,'M492 250H414'],
    ['steam','Tepelný výkon předaný do parního oběhu',heat,'M534 139V116H648Q660 116 660 128V178'],
    ['exhaust','Pára do kondenzátoru',water,'M698 286V305'],
    ['feed','Napájecí voda zpět do parogenerátoru',water,'M668 369V385H589Q577 385 577 373V264'],
    ['shaft','Mechanický výkon na hřídeli','#927156','M698 222H750'],
    ['gross','Hrubý elektrický výkon',power,'M806 175V123H883V227'],
    ['grid','Výměna výkonu se sítí',power,'M883 227H917'],
    ['own','Ostatní vlastní spotřeba',power,'M883 227V335H903V356'],
    ['recirc','Elektrický příkon ohřevu',power,'M883 227V333H827Q819 333 819 343V426H121Q103 426 103 408V363'],
    ['beamPower','Elektrický příkon NBI',power,'M103 363H12Q6 363 6 354V164H22'],
    ['wavePower','Elektrický příkon vlnového ohřevu',power,'M103 363V327H60V292'],
    ['beam','Výkon svazku za neutralizátorem','#b57825','M104 165L245 214'],
    ['wave','Mikrovlnný výkon do plazmatu','#16858a','M171 256L237 238'],
    ['alpha','Energie alfa částic předaná plazmatu','#8648a4','M331 230Q356 219 371 238Q378 255 360 265Q340 272 332 253'],
    ['conversionLoss','Teplo odváděné z kondenzátoru',gray,'M752 336H778Q791 336 791 347H817'],
    ['beamLoss','Ztráty systému NBI',gray,'M82 176V201H23'],
    ['waveLoss','Ztráty systému ECRH',gray,'M43 290V315H20'],
  ];
  const tracks = routes.map(([key, label, color, d]) => {
    const container = add(document.getElementById(['beamPower','wavePower','recirc','own','gross','steam','return','exhaust','feed','beamLoss','waveLoss'].includes(key) ? 'rear-flows' : 'front-flows'),
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
    engineering:['thermal','return','steam','exhaust','feed','shaft','gross','recirc','grid','own','beamPower','wavePower']
  };
  const circuitSymbols = new Set(['return','feed','exhaust']);
  const fields = document.getElementById('heating-fields');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let request;
  function draw(time) {
    for (const t of tracks) {
      if (!t.amount) continue;
      const circuit = circuitSymbols.has(t.key);
      const direction = Math.sign(t.amount);
      const width = t.width;
      const size = circuit ? 3.4 : Math.max(3.7, width * .54);
      for (const [i, tip] of t.tips.entries()) {
        const period = t.length / t.tips.length;
        const move = circuit || reduced.matches ? period * .54 : (time * .039) % period;
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
    const amounts = {...m, grid:m.net, return:m.thermal, steam:m.thermal, shaft:m.gross,
      feed:m.thermal, exhaust:m.thermal, beamLoss:m.beamPower-m.beam, waveLoss:m.wavePower-m.wave};
    fields.classList.toggle('beam-on', m.beam>0 && (!selected || selected==='science'));
    fields.classList.toggle('wave-on', m.wave>0 && (!selected || selected==='science'));
    for (const t of tracks) {
      const value = amounts[t.key];
      t.amount = Math.abs(value) < 1e-9 ? 0 : value;
      t.width = t.amount ? 1.6 + 12 * Math.sqrt(Math.min(1,Math.abs(t.amount)/1800)) : 0;
      t.current.style.strokeWidth = circuitSymbols.has(t.key) && t.amount ? '2px' : t.width+'px';
      t.arrows.style.visibility = t.amount ? 'visible' : 'hidden';
      t.container.classList.toggle('dim', !!selected && !focusGroups[selected].includes(t.key));
      t.title.textContent = circuitSymbols.has(t.key) ? t.label : t.label+' · '+format(Math.abs(t.amount))+' MW';
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
