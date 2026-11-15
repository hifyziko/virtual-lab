/* The original home renderer retains the approved branding and FEM launchers. */
(() => {
  const renderHome = Lab.home;
  const state = { open: new Set(), query: '' };
  try { JSON.parse(sessionStorage.getItem('powerlab-open-groups-v1') || '[]').forEach(id => state.open.add(id)); } catch (_) {}
  const save = () => { try { sessionStorage.setItem('powerlab-open-groups-v1', JSON.stringify([...state.open])); } catch (_) {} };
  const fold = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('cs');
  Lab.home = function () {
    // Czech pole labels stay upright while the rotor itself is tilted.
    Lab.groupArt.sync = `<svg data-plain-svg viewBox="0 0 180 120" aria-hidden="true"><circle cx="90" cy="60" r="48" fill="none" stroke="#9aacc8" stroke-width="10"/><g transform="rotate(-30 90 60)"><path d="M61 45H90V75H61Q46 60 61 45" fill="#c34d28"/><path d="M90 45H119Q134 60 119 75H90Z" fill="#426ed4"/></g><g fill="white" style="font:700 14px system-ui,sans-serif;font-style:normal" text-anchor="middle" dominant-baseline="central"><text x="70" y="71">S</text><text x="110" y="49">J</text></g><circle cx="90" cy="60" r="7" fill="#142b35"/><path d="M122 17A53 53 0 0 1 143 54M143 54L135 45M143 54L150 43" fill="none" stroke="#426ed4" stroke-width="2"/></svg>`;
    const template = document.createElement('template');
    template.innerHTML = renderHome.call(this);
    const home = template.content.querySelector('.home');
    home.classList.add('discovery-home');
    home.querySelector('.hero h1').textContent='Virtuální laboratoř elektrických strojů';
    home.querySelector('.eyebrow').textContent='Interaktivní výuka · od pole k pohonu';
    const toolbar = document.createElement('div');
    toolbar.className = 'discovery-toolbar';
    toolbar.innerHTML = '<label class="discovery-search"><span>Najít téma</span><input type="search" id="module-search" placeholder="Např. vinutí, moment, indukce…" autocomplete="off"></label><div class="discovery-actions"><button type="button" data-expand="all">Rozbalit vše</button><button type="button" data-expand="none">Sbalit vše</button></div><p id="search-status" role="status" aria-live="polite"></p>';
    home.querySelector('.sectionline').after(toolbar);
    for (const section of home.querySelectorAll('.group-block')) {
      const banner = section.querySelector('.group-banner');
      const details = document.createElement('details');
      details.className = section.className + ' topic-group';
      details.id = section.id;
      const summary = document.createElement('summary');
      summary.className = banner.className;
      const launches = [...banner.querySelectorAll('button')];
      launches.forEach(b => b.remove());
      summary.innerHTML = banner.innerHTML;
      const count = document.createElement('span');
      count.className = 'topic-count';
      const n = section.querySelectorAll('.card').length;
      count.textContent = n + (n === 1 ? ' modul' : n < 5 ? ' moduly' : ' modulů');
      summary.append(count);
      details.append(summary);
      if (launches.length) {
        const tools = document.createElement('div'); tools.className = 'topic-tools';
        tools.append(...launches); details.append(tools);
      }
      details.append(section.querySelector('.cards'));
      details.open = state.open.has(section.id) || location.hash === '#' + section.id;
      section.replaceWith(details);
    }
    const foot = home.querySelector('.homefooter');
    foot.innerHTML = 'Verze 1.5.1 · Interaktivní výuka v češtině · Dostupná také offline<br>Číselné modely jsou výukové idealizace.';
    return template.innerHTML;
  };
  function initHome() {
    const home = document.querySelector('.discovery-home');
    if (!home || home.dataset.ready) return;
    home.dataset.ready = 'true';
    const input = home.querySelector('#module-search');
    const groups = [...home.querySelectorAll('.topic-group')];
    let filtering = false;
    function filter() {
      const query = fold(input.value.trim()); state.query = input.value;
      filtering = !!query;
      let found = 0;
      for (const group of groups) {
        const heading = fold(group.querySelector('summary').textContent);
        let count = 0;
        for (const card of group.querySelectorAll('.card')) {
          const matches = !query || fold(card.textContent + ' ' + heading).includes(query);
          card.hidden = !matches; if (matches) count++;
        }
        group.hidden = !count;
        group.open = query ? count > 0 : state.open.has(group.id);
        found += count;
      }
      home.querySelector('#search-status').textContent = query ? (found ? 'Nalezené moduly: ' + found : 'Žádný modul neodpovídá hledání. Zkuste kratší výraz.') : 'Vyberte téma a rozbalte jeho moduly.';
    }
    for (const group of groups) {
      if (location.hash === '#' + group.id) state.open.add(group.id);
      group.addEventListener('toggle', () => {
        if (filtering) return;
        group.open ? state.open.add(group.id) : state.open.delete(group.id); save();
      });
    }
    input.value = state.query; input.addEventListener('input', filter);
    home.querySelectorAll('[data-expand]').forEach(button => button.onclick = () => {
      input.value = ''; state.query = ''; filtering = false;
      groups.forEach(group => button.dataset.expand === 'all' ? state.open.add(group.id) : state.open.delete(group.id));
      save(); filter();
    });
    home.querySelectorAll('.group-nav a').forEach(a => a.addEventListener('click', () => {
      state.query = ''; state.open.add(a.hash.slice(1)); save();
      if (location.hash === a.hash) { input.value = ''; filter(); document.getElementById(a.hash.slice(1))?.scrollIntoView({block:'start'}); }
    }));
    filter();
  }
  const route = Lab.route;
  Lab.route = function () { route.call(this); initHome(); const active=Lab.catalog.find(m=>m.id===location.hash.slice(1));document.title=(active?active.title+' · ':'')+'Virtuální laboratoř elektrických strojů'; };
  Lab.route();
})();

