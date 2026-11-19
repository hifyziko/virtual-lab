/* The original home renderer retains the approved branding and FEM launchers. */
(() => {
  const renderHome = Lab.home;
  let opened = '';
  try { opened = sessionStorage.getItem('powerlab-open-group-v2') || ''; } catch (_) {}
  const save = () => { try { sessionStorage.setItem('powerlab-open-group-v2', opened); } catch (_) {} };
  Lab.home = function () {
    // Czech pole labels stay upright while the rotor itself is tilted.
    Lab.groupArt.sync = `<svg data-plain-svg viewBox="0 0 180 120" aria-hidden="true"><circle cx="90" cy="60" r="48" fill="none" stroke="#9aacc8" stroke-width="10"/><g transform="rotate(-30 90 60)"><path d="M61 45H90V75H61Q46 60 61 45" fill="#c34d28"/><path d="M90 45H119Q134 60 119 75H90Z" fill="#426ed4"/></g><g fill="white" style="font:700 14px system-ui,sans-serif;font-style:normal" text-anchor="middle" dominant-baseline="central"><text x="70" y="71">S</text><text x="110" y="49">J</text></g><circle cx="90" cy="60" r="7" fill="#142b35"/><path d="M122 17A53 53 0 0 1 143 54M143 54L135 45M143 54L150 43" fill="none" stroke="#426ed4" stroke-width="2"/></svg>`;
    const template = document.createElement('template');
    template.innerHTML = renderHome.call(this);
    const home = template.content.querySelector('.home');
    home.classList.add('discovery-home');
    home.querySelector('.hero h1').textContent='Virtuální laboratoř elektrických strojů';
    home.querySelector('.eyebrow').textContent='Interaktivní výuka · od pole k pohonu';
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
      details.name = 'home-topic';
      const target = home.querySelector(location.hash.startsWith('#group-') ? location.hash : '#no-selected-group');
      details.open = section.id === (target ? location.hash.slice(1) : opened);
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
    const groups = [...home.querySelectorAll('.topic-group')].filter(group => !group.dataset.fusionSubgroup);
    function remember() { opened = groups.find(group => group.open)?.id || ''; save(); }
    for (const group of groups) group.addEventListener('toggle', () => {
      if (group.open) for (const other of groups) if (other !== group) other.open = false;
      remember();
    });
    home.querySelectorAll('.group-nav a').forEach(a => a.addEventListener('click', () => {
      opened = a.hash.slice(1); save();
      for (const group of groups) group.open = group.id === opened;
      if (location.hash === a.hash) document.getElementById(opened)?.scrollIntoView({block:'start'});
    }));
  }

  const route = Lab.route;
  Lab.route = function () { route.call(this); initHome(); const active=Lab.catalog.find(m=>m.id===location.hash.slice(1));document.title=(active?active.title+' · ':'')+'Virtuální laboratoř elektrických strojů'; };
  Lab.route();
})();

