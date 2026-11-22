/* Horizontal coordinates are shared by the cutaway and the energy plot. */
const InjectorModel = (() => {
  const grids = [285, 295, 341, 387, 433, 479, 525];
  const axis = {y: 192, tokamakX: 1174, scale: 11, tangentRadius: 5.31};
  const dumpX = 888, birthX = 1140;
  const stages = [
    [0, 39, 'Elektrony ve vysokofrekvenčním výboji', 'Indukované pole působí na volné elektrony ve výboji.'],
    [.07, 77, 'Přílet elektronu k molekule', 'Obě jádra molekuly sdílejí elektronový obal.'],
    [.10, 100, 'Disociace molekuly', 'Po rozpadu molekuly sledujeme atom, který míří k mřížce.'],
    [.14, 142, 'Dva neutrální atomy', 'Kroužek označuje atom, jehož náboj a energii zde odečítáš.'],
    [.18, 177, 'Ionizace levého atomu', 'Zakroužkovaný atom vpravo se srážky neúčastní. Jeho náboj se proto nemění.'],
    [.231, 239, 'Atom přilétá k mřížce', 'Na povrch dopadá neutrální atom s jedním vázaným elektronem.'],
    [.254, 279, 'Přenos elektronu z povrchu', 'Cesium snižuje výstupní práci povrchu. Elektron proto snáze přejde z kovu na atom.'],
    [.27, 285, 'Vznik záporného iontu', 'Jeden kladný náboj jádra a dva elektrony dávají záporný iont.'],
    [.306, 285, 'Let k extrakčnímu otvoru', 'Na záporný iont působí elektrická síla proti směru pole.'],
    [0.34, 295, 'Extrakce', 'Volný elektron má mnohem menší hmotnost než iont. Jeho dráha se v magnetickém poli stáčí výrazněji.'],
    [0.38, 310, 'Urychlování mezi mřížkami', 'Práce elektrické síly v každé mezeře zvětšuje kinetickou energii iontu.'],
    [0.57, 525, 'Výstup z urychlovače', 'Konečnou energii určuje napětí mezi zdrojem a poslední mřížkou.'],
    [0.65, 661, 'Neutralizace v plynu', 'Odtržení slabě vázaného elektronu vyžaduje málo energie. Téměř všechnu kinetickou energii nese těžké jádro.'],
    [0.73, 793, 'Separace zbylých iontů', 'Směr elektrické síly určuje znaménko náboje. Na neutrální atom v tomto poli vychází síla nulová.'],
    [0.84, 980, 'Výstupní kanál', 'Do vstupního portu míří neutrální složka svazku.'],
    [0.90, 1111, 'Průnik do plazmatu', 'Atom před srážkou nemá výsledný náboj. Magnetické pole jeho dráhu nezakřivuje.'],
    [0.94, birthX, 'Ionizace v plazmatu', 'Po ztrátě elektronu má částice kladný náboj. Magnetické pole proto zakřivuje její dráhu.'],
    [1, birthX + 26, 'Rychlý deuteron', 'Sleduj první závit dráhy. Předávání energie plazmatu prozkoumej v navazujícím modulu.']
  ];
  const noGas = [
    ...stages.filter(([t])=>t<.65),
    [0.65, 661, 'Průlet prázdnou komorou', 'Plyn je vypnutý. Iont si ponechá oba elektrony i energii.'],
    [0.73, 793, 'Odklon záporného iontu', 'Elektrická síla působí proti směru pole. Záporný iont míří ke kladné sběrné desce.'],
    [0.84, dumpX, 'Dopad na sběrnou desku', 'Iont odevzdal svou kinetickou energii sběrné desce. Do tokamaku tento svazek nedoletí.']
  ];
  // Each interval has its own screen time. Short physical transitions can be read
  // without stretching the slow drift through an empty beam duct.
  const cues = [
    [0,4,'Proud v cívce střídá směr. V plynu se mění směr indukovaného elektrického pole.'],
    [.042,4,'Sleduj modrou stopu volného elektronu. Pole během letu mění jeho rychlost.'],
    [.07,3.8,'Elektron se blíží k molekule. Její dvě jádra zatím sdílejí elektronový obal.'],
    [.10,4,'Elektron předá molekule energii, která stačí k rozštěpení vazby. Sám odlétá šikmo vzhůru.'],
    [.117,3.8,'Jádra se rozestupují. Každý vzniklý atom si odnáší jeden elektron.'],
    [.14,4,'Zakroužkovaný atom letí k mřížce. K druhému atomu přilétá zleva další elektron.'],
    [.18,4.5,'Při nárazu získá elektron levého atomu dost energie k úniku z obalu.'],
    [.196,4,'Od místa srážky odlétají dva elektrony. Na místě levého atomu zůstal kladný deuteron.'],
    [.211,3.8,'Vrať se pohledem k pravému atomu. Přibližuje se k povrchu stále s jedním elektronem.'],
    [.231,4,'Zlatá vrstva na povrchu mřížky je cesium. Modrý bod v kovu označuje elektron, který sleduješ.'],
    [.254,4.5,'Atom se dostal k povrchu. Elektron z kovu začíná přecházet do jeho obalu.'],
    [.263,4,'Elektron z kovu vstupuje do obalu. Původní elektron zůstává u jádra.'],
    [.27,4.5,'Přenos je dokončený. S jádrem teď odcházejí dva elektrony a částice má záporný náboj.'],
    [.29,3.5,'Záporný iont se po odrazu vrací od kovu do plazmatu před mřížkou.'],
    [.306,3.8,'Pole v otvoru míří doleva. Záporný iont proto získává rychlost doprava.'],
    [.34,4,'Mřížka vytahuje záporné ionty. Společně vytažený volný elektron se v magnetickém poli stáčí stranou.'],
    [.38,5,'Každá další mřížka má vyšší potenciál. Při průletu mezerou stoupá bod v grafu.'],
    [.57,3.5,'Iont opouští poslední mřížku s plnou energií. V neutralizátoru se blíží k molekule plynu.','Iont opouští poslední mřížku s plnou energií. Před ním je vyčerpaná komora.'],
    [.65,4.5,'Srážka s molekulou uvolňuje slabě vázaný elektron. Rychlý atom pokračuje téměř původní rychlostí.','V prázdné komoře iont pokračuje se dvěma vázanými elektrony.'],
    [.73,4,'Záporné a kladné ionty míří k opačným deskám. Sledovaný neutrální atom letí přímo.','Záporný iont se stáčí proti směru elektrického pole ke kladné sběrné desce.'],
    [.84,3,'Neutrální atom prolétá výstupním kanálem směrem k tokamaku.','Iont dopadl na kladnou desku a předal jí svou kinetickou energii.'],
    [.90,3.5,'Atom protíná magnetické siločáry. V plazmatu se k němu blíží elektron.'],
    [.94,4.5,'Elektron z plazmatu předá při srážce dost energie k vyražení posledního vázaného elektronu.'],
    [.959,4,'Dráha rychlého deuteronu se zakřivuje. V detailu sleduj první závit kolem magnetické siločáry.'],
    [1,0,'Deuteron dokončil první závit. Jeho další let a předávání energie ukazuje navazující modul.']
  ];
  function cueIndex(t){return cues.findLastIndex(([start])=>t>=start);}
  function advance(t,seconds,gas){
    const limit=gas?1:.84;
    t=Math.min(t,limit);
    for(let i=cueIndex(t);seconds>0 && t<limit;i++){
      const [start,duration]=cues[i],end=cues[i+1][0];
      const rate=(end-start)/duration,remaining=(end-t)/rate;
      if(seconds<remaining)return t+seconds*rate;
      seconds-=remaining;t=end;
    }
    return t;
  }
  function energy(x, voltage) {
    // Reserve one percent of the total potential rise for extraction.
    const through = (a,b) => Math.max(0, Math.min(1, (x-a)/(b-a)));
    let fraction = 0.01 * through(grids[0], grids[1]);
    for (let i=1; i<grids.length-1; i++) {
      fraction += 0.198 * through(grids[i]+2, grids[i+1]-2);
    }
    return fraction * voltage; // kV applied to a singly charged ion gives keV.
  }
  function deflection(x) {
    return 37 * Math.min(1, Math.max(0, (x-793)/(dumpX-793))) ** 2;
  }
  function sample(time, voltage, gas) {
    const events = gas ? stages : noGas;
    const t = Math.max(0, Math.min(time, events.at(-1)[0]));
    const i = events.findLastIndex(([start]) => t >= start);
    const [start, left, title, description] = events[i];
    const [end, right] = events[i+1] || events[i];
    const local = end > start ? (t-start)/(end-start) : 0;
    let distanceFraction=local;
    if(t>=.306 && t<.57){
      const v0=Math.sqrt(energy(left,voltage)),v1=Math.sqrt(energy(right,voltage));
      distanceFraction=local*(2*v0+(v1-v0)*local)/(v0+v1);
    }
    const x = left+(right-left)*distanceFraction;
    const impact = !gas && x >= dumpX;
    const electrons = t < .10 ? 2 : t < .27 ? 1 : t < .65 || !gas ? 2 : t < .94 ? 1 : 0;
    const angle = Math.max(0,(t-.94)/.06)*2*Math.PI;
    const y = axis.y + (gas ? 5*Math.sin(angle) : deflection(x));
    const kinetic = impact ? 0 : energy(x, voltage);
    const cue=cueIndex(t);
    return {t, x, y, i, local, title, description, impact, electrons, kinetic,
      caption:(!gas && cues[cue][3])||cues[cue][2],
      symbol: t < .10 ? '\\mathrm{D}_2' : ['\\mathrm{D}^{+}','\\mathrm{D}^{0}','\\mathrm{D}^{-}'][electrons],
      speed: Math.sqrt(2*kinetic*1.602176634e-16/3.3435838e-27),
      endTime:events.at(-1)[0], next: Math.min(events.at(-1)[0],cues[cue+1]?.[0]??1)};
  }
  return {grids, axis, dumpX, birthX, stages, cues, advance, energy, deflection, sample};
})();
if (typeof module !== 'undefined') module.exports = InjectorModel;
