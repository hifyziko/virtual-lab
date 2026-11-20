'use strict';

(() => {
  const {defaults, presets, solve} = window.HiFyzikoMilestones;
  const scene = window.HiFyzikoMilestoneScene;
  const byId = id => document.getElementById(id);
  const format = new Intl.NumberFormat('cs-CZ', {maximumFractionDigits: 2, useGrouping:false});
  const number = value => format.format(value).replace(',', '{,}');
  const mw = value => number(value) + String.raw`\,\mathrm{MW}`;
  const tex = (el, value) => {
    if (el.dataset.rendered === value) return;
    el.dataset.rendered = value;
    window.katex.render(value, el, {throwOnError:true});
  };
  const formula = value => {
    const el = document.createElement('span');
    tex(el, value);
    return el;
  };
  const powerText = (el, text, value, suffix = '') => {
    el.replaceChildren(text, formula(mw(value)), suffix);
  };
  document.querySelectorAll('[data-tex]').forEach(el => tex(el,el.dataset.tex));
  byId('book-pages').textContent = 'kap. 9, s. 181 a násl.; kap. 12.6–12.7 a 12.9–12.11, s. 330–339; kap. 13.9–13.12, s. 366–373';
  const explanations = [
    [String.raw`P_{\mathrm{ch}}=0{,}2P_{\mathrm F},\quad \frac{\mathrm dU}{\mathrm dt}=P_{\mathrm H}+P_{\mathrm{ch}}-P_{\mathrm L}`, 'Předepsaný fúzní výkon a ztráty plazmatu nastavuješ posuvníky. Pětina fúzního výkonu se předá plazmatu částicemi alfa. Zbytek nesou neutrony do blanketu. U je vnitřní energie plazmatu. Zapnutý ohřev doplňuje jen schodek.'],
    [String.raw`P_{\mathrm{TH}}=M_{\mathrm R}P_{\mathrm F}+P_{\mathrm H}`, 'V ustáleném knižním modelu se tepelný výkon reaktoru skládá z jaderného výkonu a tepla dodaného ohřevem. Faktor multiplikace blanketu se vztahuje k celému fúznímu výkonu.'],
    [String.raw`P_{\mathrm{TH}}=(M_{\mathrm R}-0{,}2)P_{\mathrm F}+P_{\mathrm L}`, 'Rozšíření pro okamžitý snímek modelu. Teplo do výměníku zahrnuje neutronový výkon, přírůstek v blanketu a veškeré teplo odvedené z plazmatu. Část výkonu může právě měnit vnitřní energii plazmatu. Teplota, fúzní výkon ani ztráty se v čase nepřepočítávají.'],
    [String.raw`P_{\mathrm{HC}}=\frac{P_{\mathrm{NBI}}}{\eta_{\mathrm{NBI}}}+\frac{P_{\text{vlny}}}{\eta_{\text{vlny}}},\quad \eta_{\mathrm H}=\frac{P_{\mathrm H}}{P_{\mathrm{HC}}}`, 'Výkon NBI a vln představuje teplo skutečně předané plazmatu. Účinnosti udávají, jaká část příkonu každého zařízení se do plazmatu dostane. Efektivní účinnost vychází z jejich nastaveného podílu i při nulovém ohřevu. Proudový pohon je samostatný jev. Rozběh solenoidem má pouze názorné zvýraznění.'],
    [String.raw`P_{\mathrm{GR}}=\eta_{\mathrm{GR}}P_{\mathrm{TH}},\quad P_{\mathrm{NET}}=P_{\mathrm{GR}}-P_{\mathrm{SC}}^{\mathrm{NH}}-P_{\mathrm{HC}}`, 'Hrubá účinnost zahrnuje celý pracovní oběh včetně výroby elektřiny. V kresbě odpovídá mechanický výkon hrubému elektrickému výkonu, protože ztráty generátoru nerozlišujeme. Od hrubého výkonu odečti ostatní vlastní spotřebu a příkon ohřevu. Všechny technologické parametry jsou modelové.'],
    [String.raw`Q=\frac{P_{\mathrm F}}{P_{\mathrm H}},\quad \eta_{\mathrm{REC}}=\eta_{\mathrm{GR}}\eta_{\mathrm{SC}}^{\mathrm{NH}}\eta_{\mathrm H},\quad Q_{\mathrm B}=\frac{1-\eta_{\mathrm{REC}}}{M_{\mathrm R}\eta_{\mathrm{REC}}}`, 'Faktor zesílení porovnává fúzní výkon s teplem z vnějšího ohřevu. Při kladném fúzním výkonu a nulovém ohřevu má nekonečnou limitu. Faktor ostatní vlastní spotřeby je část hrubého výkonu zbývající po jejím odpočtu. Součin účinností určuje účinnost recirkulace. Mezní zesílení pro inženýrské vyrovnání platí pro ustálenou bilanci. Pořadí dosažení milníků závisí na nastavení.']
  ];
  for (const [value, prose] of explanations) {
    const p = document.createElement('p');
    p.append(formula(value), prose);
    byId('equations').append(p);
  }

  const settings = [
    ['plasma','fusion','Fúzní výkon',0,1500,1,mw],
    ['plasma','plasmaLoss','Ztráty plazmatu',0,500,1,mw],
    ['heating','beamShare','Podíl NBI',0,100,1,value => number(value)+String.raw`\,\%`],
    ['heating','beamEfficiency','Účinnost NBI',20,75,1,value => number(value)+String.raw`\,\%`],
    ['heating','waveEfficiency','Účinnost vln',20,75,1,value => number(value)+String.raw`\,\%`],
    ['tech','grossEfficiency','Hrubá účinnost',25,50,.5,value => number(value)+String.raw`\,\%`],
    ['tech','ownShare','Ostatní vlastní spotřeba',0,40,.5,value => number(value)+String.raw`\,\%`],
    ['tech','multiplication','Multiplikace blanketu',1,1.3,.01,number]
  ];
  const ranges = new Map();
  let state = {...defaults};
  let selected = null;
  let ohmic = false;
  for (const [group,key,label,min,max,step,valueTex] of settings) {
    const row = document.createElement('div');
    const heading = document.createElement('label');
    heading.htmlFor = 'milestone-' + key;
    const output = document.createElement('output');
    output.setAttribute('for', heading.htmlFor);
    heading.append(label,output);
    const input = document.createElement('input');
    Object.assign(input,{id:heading.htmlFor,type:'range',min,max,step});
    input.addEventListener('input', () => {
      state[key] = input.valueAsNumber;
      byId('scenario').value = 'custom';
      update();
    });
    row.append(heading,input);
    byId(group+'-controls').append(row);
    ranges.set(key,{input,output,valueTex});
  }

  const milestones = [...document.querySelectorAll('[data-milestone]')];
  const captions = {
    science:'Porovnej fúzní výkon s teplem skutečně předaným vnějším ohřevem. Elektrický příkon zařízení je vyšší než dodané teplo.',
    engineering:'Sleduj rozdělení hrubého elektrického výkonu na vlastní spotřebu, ohřev a síť. Odběr ze sítě míří k elektrárně.',
    ignition:'Porovnej samoohřev částicemi alfa s tepelným výkonem, který opouští plazma.'
  };

  function update() {
    const result = solve(state);
    const {fusion,plasmaLoss,heating,alpha,net,delta,steady} = result;
    for (const [key,{input,output,valueTex}] of ranges) {
      input.value = state[key];
      const value = valueTex(state[key]);
      tex(output,value);
      input.setAttribute('aria-valuetext',output.textContent);
    }
    for (const button of milestones) {
      const key = button.dataset.milestone;
      const status = button.querySelector('small');
      const margin = {science:fusion-heating,engineering:net,ignition:alpha-plasmaLoss}[key];
      button.dataset.done = result[key];
      button.setAttribute('aria-pressed',String(selected === key));
      if (result[key]) status.textContent = steady ? 'Splněno' : 'Podmínka splněna v tomto okamžiku';
      else if (margin < 0) powerText(status,'Chybí ', -margin);
      else status.textContent = 'Bez aktivního výkonu';
    }

    document.querySelectorAll('[data-tag]').forEach(el => {
      el.classList.toggle('selected',selected === 'engineering' && el.dataset.tag !== 'alpha' ||
        selected === 'ignition' && el.dataset.tag === 'alpha');
    });
    for (const id of ['thermal','recirc','alpha']) tex(byId(id),mw(result[id]));
    const grid = Math.abs(net) < 1e-9 ? 0 : net;
    byId('grid-label').textContent = grid < 0 ? 'Odběr ze sítě' : grid > 0 ? 'Dodávka do sítě' : 'Výměna se sítí';
    tex(byId('grid'),mw(Math.abs(grid)));
    byId('regime').textContent = fusion === 0 && heating === 0 && plasmaLoss === 0 ?
      'Bez výkonu' : steady ? 'Vyrovnaná bilance plazmatu' : 'Okamžitá bilance mimo rovnováhu';
    const comment = byId('comment');
    const comparisons = {
      science:[['P_{\\mathrm F}',fusion],['P_{\\mathrm H}',heating]],
      ignition:[['P_{\\mathrm{ch}}',alpha],['P_{\\mathrm L}',plasmaLoss]],
      engineering:[['P_{\\mathrm{GR}}',result.gross],['P_{\\mathrm{SC}}^{\\mathrm{NH}}',result.own],['P_{\\mathrm{HC}}',result.recirc]]
    };
    if (selected) {
      const values = comparisons[selected].map(([symbol,value]) => formula(symbol+'='+mw(value)));
      if (!steady) values.push(formula('\\mathrm dU/\\mathrm dt='+mw(delta)));
      comment.replaceChildren(...values, captions[selected]);
    } else if (!steady) {
      powerText(comment,delta < 0 ? 'Vnitřní energie plazmatu ubývá výkonem ' : 'Vnitřní energie plazmatu přibývá výkonem ',
        Math.abs(delta), '. Porovnej okamžité toky ve scéně.');
    } else if (result.ignition) comment.textContent = 'Samoohřev pokrývá ztráty. Ostatní systémy elektrárny mají stále vlastní spotřebu podle nastavení.';
    else if (result.engineering) comment.textContent = grid > 0 ? 'Elektrárna dodává do sítě, plazma přitom stále potřebuje vnější ohřev.' : 'Elektrárna právě pokrývá vlastní spotřebu.';
    else if (result.science) comment.textContent = 'Fúze dodává více výkonu, než dostává plazma z ohřevu. Elektrárna přesto odebírá elektřinu ze sítě.';
    else if (grid < 0) comment.textContent = 'Sleduj modrý tok od sítě k elektrárně a zpět k NBI a vlnovému ohřevu.';
    else comment.textContent = 'Zvol scénář nebo nastav fúzní výkon a ztráty plazmatu.';
    const heat = byId('heating-readout');
    heat.replaceChildren('Do plazmatu ',formula(mw(heating)),'. NBI ',formula(mw(result.beam)),
      ' (příkon ',formula(mw(result.beamPower)),'). Vlny ',formula(mw(result.wave)),
      ' (příkon ',formula(mw(result.wavePower)),').');
    const q = result.q === null ? String.raw`\text{neurčeno}` : result.q === Infinity ? String.raw`\infty` : number(result.q);
    byId('tech-readout').replaceChildren('Hrubý výkon ',formula(mw(result.gross)),'. Ostatní spotřeba ',
      formula(mw(result.own)),'. ',formula('Q='+q),steady && result.q !== null ? ' · ' : '',
      ...(steady && result.q !== null ? [formula(String.raw`Q_{\mathrm B}=`+number(result.qBreak))] : []));
    byId('heating').textContent = state.heatingOff ? 'Zapnout vnější ohřev' : 'Vypnout vnější ohřev';
    byId('heating').setAttribute('aria-pressed',String(state.heatingOff));
    byId('ohmic').setAttribute('aria-pressed',String(ohmic));
    byId('ohmic-note').hidden = !ohmic;
    scene.update(result, selected, ohmic, value => format.format(value));
  }

  function loadPreset(name) {
    state = {...defaults,...presets[name]};
    selected = null;
    ohmic = false;
    byId('scenario').value = name;
    update();
  }
  byId('scenario').onchange = event => loadPreset(event.target.value);
  byId('heating').onclick = () => {
    state.heatingOff = !state.heatingOff;
    byId('scenario').value = 'custom';
    update();
  };
  byId('ohmic').onclick = () => {
    ohmic = !ohmic;
    update();
  };
  byId('reset').onclick = () => loadPreset('low');
  byId('guide-open').onclick = () => byId('guide').showModal();
  for (const button of milestones) button.onclick = () => {
    selected = selected === button.dataset.milestone ? null : button.dataset.milestone;
    update();
  };
  loadPreset('low');
})();
