/* Optional wider subject taxonomy. Existing module IDs and renderers stay intact. */
(() => {
  const originalHome = Lab.home;
  const areas = [
    {id:'electricity', title:'Elektřina a magnetismus', intro:'Od základních zákonů k elektrickému a magnetickému poli.', groups:['electromagnetism','materials'], topics:'Elektromagnetická indukce · silové účinky · materiály'},
    {id:'machines', title:'Elektrické stroje', intro:'Využití elektromagnetických principů ve strojích a pohonech.', groups:['transformer','common','induction','sync','dc','drive'], topics:'Transformátory · vinutí · motory · generátory · pohony'},
    {id:'plasma', title:'Jaderná fúze a tokamaky', intro:'Od částic a fúzních reakcí k magnetickému udržení a tokamaku.', groups:['fusion'], topics:'Plazma a fúzní reakce · magnetické udržení · tokamak'}
  ];
  const groupTitles = {electromagnetism:'Základní elektromagnetické principy',materials:'Materiály',transformer:'Transformátory',common:'Vinutí',induction:'Asynchronní stroje',sync:'Synchronní stroje',dc:'Stejnosměrné stroje',drive:'Elektrické pohony vozidel',fusion:'Jaderná fúze a tokamaky'};
  const areaForGroup = group => areas.find(a => a.groups.includes(group)) || areas[0];
  const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function context() {
    const id = location.hash.slice(1);
    const module = Lab.catalog.find(m => m.id === id);
    const group = module?.group || (id.startsWith('group-') && !id.startsWith('group-area-') ? id.slice(6) : null);
    const area = areas.find(a => id === 'group-area-' + a.id) || (group ? areaForGroup(group) : null);
    return {module,group,area};
  }
  function navigation({module,group,area}) {
    return `<nav class="physics-navigation" aria-label="Navigace laboratoře"><div class="physics-breadcrumb"><a href="#">Laboratoř</a>${area ? `<span aria-hidden="true">/</span><a href="#group-area-${area.id}" ${!group?'aria-current="page"':''}>${area.title}</a>` : ''}${group ? `<span aria-hidden="true">/</span><a href="#group-${esc(group)}" ${!module?'aria-current="page"':''}>${esc(groupTitles[group] || group)}</a>` : ''}${module ? `<span aria-hidden="true">/</span><span aria-current="page">${esc(module.title)}</span>` : ''}</div><div class="physics-shortcuts"><span class="physics-switch-label">Přejít do oblasti:</span>${areas.map(a => `<a href="#group-area-${a.id}" ${a===area?'aria-current="true"':''}>${a.title}</a>`).join('')}</div></nav>`;
  }
  Lab.home = function () {
    const template = document.createElement('template');
    template.innerHTML = originalHome.call(this);
    const home = template.content.querySelector('.home');
    home.classList.add('physics-home');
    const current = context();
    home.dataset.physicsArea = current.area?.id || '';
    home.insertAdjacentHTML('afterbegin', navigation(current));
    home.querySelector('.hero h1').textContent = 'Virtuální laboratoř fyziky';
    home.querySelector('.eyebrow').textContent = 'Interaktivní principy a technické aplikace';
    home.querySelector('.hero p').textContent = 'Objevujte fyzikální zákony a jejich využití. Měňte parametry, sledujte děje a propojujte základní principy s technikou.';
    if (current.area) {
      home.querySelector('.hero h1').textContent = current.area.title;
      home.querySelector('.hero p').textContent = current.area.intro;
      home.querySelector('.eyebrow').textContent = 'Virtuální laboratoř fyziky';
      home.querySelector('.hero').classList.add('physics-section-hero');
    }
    home.querySelector('.group-nav')?.remove();
    const nav = document.createElement('nav');
    nav.className = 'physics-areas';
    nav.setAttribute('aria-label', 'Oblasti fyziky');
    nav.innerHTML = areas.map(area => `<a class="physics-area-link area-${area.id}" href="#group-area-${area.id}"><span class="eyebrow">Dostupné moduly</span><h2>${area.title}</h2><p>${area.topics}</p><strong>Prozkoumat oblast →</strong></a>`).join('');
    home.querySelector('.hero').after(nav);
    nav.hidden = !!current.area;
    if (current.area) {
      home.querySelector('.hero').insertAdjacentHTML('afterend', '<nav class="physics-level-navigation" aria-label="Návrat do hlavního rozcestníku"><a class="physics-up physics-up-primary" href="#"><span aria-hidden="true">↑</span> O úroveň výš</a></nav>');
    }
    home.querySelector('.sectionline h2').textContent = 'Témata a moduly';
    const groups = [...home.querySelectorAll('.topic-group')];
    const footer = home.querySelector('.homefooter');
    for (const area of areas) {
      const section = document.createElement('section');
      section.className = 'physics-area area-' + area.id;
      section.hidden = current.area !== area;
      section.id = 'group-area-' + area.id;
      section.setAttribute('aria-labelledby', 'heading-' + area.id);
      section.innerHTML = `<header class="physics-area-heading"><div><h2 id="heading-${area.id}">${area.title}</h2><p>${area.intro}</p></div><a href="#">↑ Všechny oblasti</a></header>`;
      for (const group of groups) {
        const id = group.id.replace(/^group-/, '');
        // Unknown future groups remain visible in the fundamentals area.
        const known = areas.some(a => a.groups.includes(id));
        if (area.groups.includes(id) || (!known && area.id === 'electricity')) section.append(group);
      }
      if (area.id === 'electricity') section.insertAdjacentHTML('beforeend', '<aside class="physics-proposal"><span class="badge">Námět k doplnění</span><h3>Elektrostatika</h3><p>Elektrický náboj, Coulombův zákon, elektrické pole, potenciál a kondenzátor. Tato část zatím neobsahuje interaktivní moduly.</p></aside>');
      if (area.id === 'machines') section.insertAdjacentHTML('beforeend', '<p class="physics-connection">Potřebujete si připomenout principy? <a href="#group-electromagnetism">Přejít k základům elektromagnetismu →</a></p>');
      if (area.id === 'plasma') section.insertAdjacentHTML('beforeend', '<div class="physics-proposals"><article class="physics-proposal"><h3>Tepelný oběh fúzní elektrárny</h3><p>Přenos tepla z blanketu chladivem do parního oběhu a pohon turbíny.</p></article></div>');
      footer.before(section);
    }
    footer.innerHTML = 'Zkušební verze 1.8.0-fyzika-preview · Interaktivní výuka v češtině · Dostupná také offline<br>Číselné modely jsou výukové idealizace. <a href="../../aktualni/web/index.html">Otevřít původní laboratoř elektrických strojů →</a>';
    home.querySelector('.sectionline h2').textContent = current.area ? 'Témata oblasti' : 'Vyberte oblast';
    // Keep only the selected area's groups in its topic view.
    if (current.area) for (const section of home.querySelectorAll('.physics-area')) if (section.hidden) section.remove();
    return template.innerHTML;
  };
  const route = Lab.route;
  Lab.route = function () {
    route.call(this);
    if (document.readyState === 'loading') return;
    const current = context();
    document.title = (current.module?.title || current.area?.title || '') + (current.area ? ' · ' : '') + 'Virtuální laboratoř fyziky';
    if (current.module && current.group) {
      for (const back of document.querySelectorAll('#app .modulehead a.back, #app .error a')) {
        back.setAttribute('href', '#group-' + current.group);
        back.textContent = '← ' + (groupTitles[current.group] || current.group);
      }
    }
    // Fullscreen group links are maintained by the original shell.
  };
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const up = event.target.closest?.('a.physics-up-primary');
    if (!up) return;

    const oldURL = location.href;
    const nextURL = new URL(oldURL);
    nextURL.hash = up.hash;
    event.preventDefault();
    if (nextURL.href === oldURL) {
      Lab.route();
      return;
    }
    // An area fragment also identifies an element below the heading. Let the
    // router set the scroll position without native fragment scrolling.
    history.pushState(null, '', nextURL.href);
    window.dispatchEvent(new HashChangeEvent('hashchange', {oldURL, newURL:nextURL.href}));
  });
  Lab.route();
})();
