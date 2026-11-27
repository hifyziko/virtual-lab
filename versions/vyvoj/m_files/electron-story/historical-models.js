const electronMilestones = [
  ['Katodové paprsky', 'Záporná částice', 'Katoda → stínítko'],
  ['Thomsonův atom', 'Elektrony v kladné kouli', 'Kladný objem · záporné částice'],
  ['Rozptyl', 'Atom s jádrem', 'Kladný náboj soustředěný v jádře'],
  ['Stabilita', 'Klasická oběžná dráha', 'Pohyb elektronu v poli jádra'],
  ['Bohrův atom', 'Povolené dráhy', 'Pevné poloměry a energie'],
  ['Vlna hmoty', 'Energetické hladiny vodíku', 'Energie vodíku'],
  ['Orbitaly', 'Kvantový stav', 'Bod značí možný výsledek měření'],
  ['Difrakce', 'Uspořádání atomů v niklu', 'Každá kulička představuje atom niklu'],
  ['Dirac', 'Dvě větve Diracovy rovnice', 'Celková energie podle velikosti hybnosti'],
  ['Dvojštěrbina', 'Amplitudy ze dvou otvorů', 'Příprava · clona · detekce'],
  ['Kvantové pole', 'Rozdělení hybnosti', 'Hybnost při přípravě elektronu'],
  ['Rozlišení', 'Rozptyl fotonu na elektronu', 'Příklad přenosu hybnosti']
];

const electronModelTransitions = [
  'Vychýlení a měrný náboj vypovídají o částici ve svazku. Další otázka zněla, jak se taková částice vejde do elektricky neutrálního atomu.',
  'Rozprostřený kladný náboj dává slabé pole i při průletu velmi blízko středu. Velký odklon v dalším pokusu vyžaduje náboj soustředěný do malého prostoru.',
  'Jádro vysvětluje prudký odklon částic alfa. Kdyby se ale elektron pohyboval po klasické kružnici, při oběhu by vyzařoval a rychle ztratil energii.',
  'Zapni záření a sleduj, jak klesá poloměr. Stabilní atom vyžaduje stav, ve kterém elektron průběžně energii neztrácí. To Bohr zavedl jako postulát.',
  'Přesné frekvence hlavních čar podpořily kvantování energie. Samotné povolené kružnice však nevysvětlují intenzity čar ani původ kvantovací podmínky.',
  'Uzavření fáze dává názornou podmínku pro jednu kružnici. Kvantová mechanika hledá stav v celém prostoru a dovoluje určit pravděpodobnosti měření.',
  'Přepni srovnání s Bohrem a sleduj kružnici vedle rozložení možných poloh. Měřitelným projevem vlnové fáze je také difrakce v následující etapě.',
  'Směry silného rozptylu závisejí na vlnové délce elektronu. Další otázka je, jak se mění energie elektronu při rychlostech blízkých rychlosti světla.',
  'Relativita mění závislost energie na hybnosti. Diracova rovnice otevřela cestu k předpovědi antičástice. V teorii pole lze popsat také vznik či zánik párů.',
  'Při koherentní přípravě se skládají amplitudy a v detektoru vznikají minima. Směs samostatných příprav sčítá pravděpodobnosti a tutéž strukturu obecně nedá.',
  'Šířka balíku se mění podle přípravy. Pro otázku vnitřní struktury elektronu je rozhodující rozlišovací schopnost sondy, kterou nastavíš v poslední etapě.',
  'Vrať se ke katodové trubici. Tehdy byla měřitelná stopa svazku. Dnešní rozptylové pokusy mohou testovat strukturu elektronu až do mezí rozlišení sondy.'
];

const atomColors=electronInk;
const atomGallery=[
  {year:'1904',name:'Thomsonův atom',legend:[['positive','Rozložený kladný náboj'],['electron','Elektrony v prstenci']]},
  {year:'1911',name:'Rutherfordův atom',legend:[['nucleus','Kladný náboj ve středu'],['electron','Rovnoměrně rozložený záporný náboj']]},
  {year:'1913',name:'Bohrův atom',legend:[['nucleus','Jádro'],['electron','Obsazená dráha'],['level','Další povolená dráha']]},
  {year:'1926',name:'Kvantový model vodíku',legend:[['nucleus','Jádro'],['electron','Hustota pravděpodobnosti']]}
];
const atomGalleryPairs=[
  {
    experiment:2,action:'Vyzkoušet rozptyl částic alfa',
    motivation:'Po objevu elektronu zbývalo zjistit, kde se nachází kladný náboj neutrálního atomu. Nečekané velké odklony částic alfa při průletu fólií umožnily obě představy přímo porovnat.',
    goal:'Porovnej, kde oba modely umisťují kladný náboj a který umožní rozptyl částice alfa zpět ke straně zdroje.',
    scene:'Vlevo jsou modré elektrony uvnitř kladné koule. Vpravo je kladný náboj soustředěný uprostřed. Modrá koule ukazuje rovnoměrné rozložení záporného náboje, které Rutherford použil ve výpočtu rozptylu. Její stínování znázorňuje objem.',
    reason:'Částice alfa je kladně nabité jádro helia. Kladný náboj atomu ji odpuzuje. Při těsném průletu kolem soustředěného jádra může být síla dost velká, aby částici odklonila až zpět. Takový odklon je důkazem pro soustředění náboje v malé oblasti atomu.',
    step:'Pootoč modely a najdi, kde v každém z nich sídlí kladný náboj. V pokusu s rozptylem na zlaté fólii přepínej mezi volbami V malém jádře a V objemu atomu při stejné energii.',
    calculation:{
      formula:String.raw`E_{\text{koule}}=\frac{Qr}{4\pi\varepsilon_0R^3}\ (r<R),\qquad E_{\text{jádro}}=\frac{Q}{4\pi\varepsilon_0r^2}`,
      explanation:'Pro stejný kladný náboj $Q$ se směrem ke středu pole koule zmenšuje a pole bodového jádra roste. Značka $r$ je vzdálenost od středu, $R$ poloměr koule a $\\varepsilon_0$ permitivita vakua.'
    },
    clue:'V pokusu hledej odklon větší než $90^\\circ$. Znamená, že částice odletěla zpět na stranu zdroje.',
    conclusion:'Rozptýlený kladný náboj v Thomsonově kouli při daném nastavení částici téměř neodchýlí. Soustředěný kladný náboj ji může odklonit i zpět. Právě takové zásahy pomohly rozlišit oba modely.'
  },
  {
    experiment:3,action:'Vyzkoušet stabilitu klasické dráhy',
    motivation:'Rutherfordův rozptyl ukázal, že v atomu je náboj soustředěný ve středu. Otázku uspořádání a pohybu jednotlivých elektronů jeho výpočet ponechal otevřenou. Pokud by elektron klasicky obíhal kolem jádra, vyzařoval by a ztrácel energii. Bohr potřeboval model, který vysvětlí stabilní vodík a jeho spektrum.',
    goal:'Zjisti, co přidává Bohrův model, aby vysvětlil stabilitu atomu.',
    scene:'V obou modelech je červené jádro. Vlevo je kulově symetrické rozložení záporného náboje z Rutherfordova výpočtu. Vpravo jsou dvě ukázky Bohrových povolených drah vodíku.',
    reason:'Hledáš, co musí model přidat, aby atom vydržel a jeho elektron neztrácel energii při každém oběhu.',
    step:'Otevři pokus se stabilitou, kde elektron necháme obíhat kolem jádra podle klasické fyziky. Přepni Vyzařování na Larmorův výkon a sleduj poloměr.',
    calculation:{
      formula:String.raw`P_{\text{rad}}\propto a^2,\qquad r_n=a_\mu n^2`,
      explanation:'Klasický vyzařovaný výkon $P_{\\text{rad}}$ závisí na zrychlení $a$. Bohr pro vodík připustil jen poloměry $r_n$ určené hlavním kvantovým číslem $n$ a délkou $a_\\mu$. Jeho stacionární stavy podle předpokladu průběžně nezáří.'
    },
    clue:'V klasickém pokusu při zapnutém vyzařování poloměr klesá. V Bohrově nákresu zůstávají zobrazované poloměry pevné a druhá dráha má čtyřikrát větší poloměr než první.',
    conclusion:'Jádro objasní rozptyl, ale samo stabilitu vodíku nevysvětlí. Bohr ji do modelu zavedl předpokladem stacionárních stavů, které průběžně nezáří. Jejich energie pak můžeš prověřit ve spektru vodíku.'
  },
  {
    experiment:6,action:'Prozkoumat vodíkové orbitaly',
    motivation:'Bohrova pravidla dala vodíku diskrétní energie. Kvantová mechanika umožnila předpovědět také výsledky měření polohy a rozlišit prostorové tvary stavů se stejným hlavním kvantovým číslem.',
    goal:'Porovnej dva stavy vodíku se stejným hlavním kvantovým číslem a najdi rozdíl v prostorovém rozložení pravděpodobnosti.',
    scene:'Vlevo ukazuje Bohrův model možnou dráhu. Vpravo každá modrá tečka představuje jeden možný výsledek měření polohy.',
    reason:'Srovnáš, co dokáže o elektronových stavech říct samotný poloměr Bohrovy dráhy a co navíc ukáže prostorové rozložení pravděpodobnosti.',
    step:'Ve Stavu vodíku přepínej mezi kulově symetrickým a dvoulaločným excitovaným stavem. Zapni Prostorový řez.',
    calculation:{
      formula:String.raw`r_n=a_\mu n^2,\qquad w(\mathbf r)=|\psi(\mathbf r)|^2`,
      explanation:'Bohrovu dráhu určuje hlavní kvantové číslo $n$ a Bohrova délka $a_\\mu$ s korekcí na pohyb jádra. V kvantovém modelu určuje vlnová funkce $\\psi$ hustotu pravděpodobnosti $w$ v poloze $\\mathbf r$.'
    },
    clue:'Bohrova kružnice se mezi excitovanými stavy nezmění. Orbital $2\\mathrm{s}$ má kulový uzel, zatímco $2\\mathrm{p}$ má uzlovou rovinu mezi laloky.',
    conclusion:'Stejné hlavní kvantové číslo připouští různé prostorové stavy. Z jediného poloměru kružnice jejich tvar neodvodíš. Kvantový model ukazuje, kde lze elektron s větší pravděpodobností naměřit a kde je hustota nulová.'
  }
];

function sampleGalleryOrbital(state){
  const [n,l]=OrbitalVolume.states[state],dr=.0125,zoom=n===1?.24:.081;
  const P=ElectronPhysics,random=P.random(1926+state),cdf=new Float64Array(Math.ceil(.67/(zoom*dr)));
  let sum=0;
  for(let i=0;i<cdf.length;i++){
    const r=(i+.5)*dr;
    sum+=r*r*P.radial(n,l,r)**2;cdf[i]=sum;
  }
  // Drawing from r²|R|² and the angular distribution gives fixed samples in world space.
  const samples=Array.from({length:8400},()=>{
    const r=(OrbitalVolume.sample(cdf,random)+random())*dr*zoom;
    const u=2*random()-1,z=l?Math.cbrt(u):u;
    const azimuth=P.tau*random(),side=r*Math.sqrt(1-z*z);
    return [side*Math.cos(azimuth),side*Math.sin(azimuth),r*z];
  });
  return {volume:samples.slice(0,4200),section:samples};
}

function drawAtomGallery(p,index,galleryCache,state=0,section=false){
  const {proj,dot,ring,sphere}=p;
  const {electron,nucleus}=atomColors;
  if(index===0){
    const r=.63,[positions]=ElectronPhysics.ring(5,0);
    sphere(r);
    ring([0,0,0],positions[0]*r,electron,'xz',null,'4 3');
    const electrons=Array.from({length:5},(_,i)=>[positions[3*i]*r,0,positions[3*i+1]*r]);
    electrons.sort((a,b)=>proj(a)[2]-proj(b)[2]);
    for(const position of electrons){p.glow(position,.10,electron);dot(position,.047,electron,true);}
    return;
  }
  if(index===3){
    const sampling=galleryCache[state]??=sampleGalleryOrbital(state);
    p.depthCloud(section?sampling.section:sampling.volume,{section});
    dot([0,0,0],atomGlyphRadius.nucleus,nucleus,true);
    p.orientationAxes();
    return;
  }
  if(index===1){
    sphere(.63,[0,0,0],{negative:true});
    p.glow([0,0,0],.14,nucleus);
    dot([0,0,0],atomGlyphRadius.nucleus,nucleus,true);
    return;
  }
  const active=state?2:1;
  drawBohrAtom(p,{initial:active,final:active,shownFinal:3-active,highest:2,angle:.62});
}


// Orthographic cutaways use the same camera convention as the experiment.
function drawHistoricalElectron(p, chapter, S, T, cache) {
  const {electron:blue,path:aqua,positive:amber,nucleus:coral,level:purple}=electronInk;
  const {proj,line,dot,ring,sphere,tube,arrow}=p;
  const sample=(count,fn)=>Array.from({length:count},(_,i)=>fn(i/(count-1),i));
  const points=(positions,r)=>positions.map(([pos,color])=>[pos,color,proj(pos)[2]])
    .sort((a,b)=>a[2]-b[2]).forEach(([pos,color])=>dot(pos,r,color,true));
  switch(chapter){
    case 0:{
      tube(-.76,.75,.28,'#60859e','#8fc2d23a');
      tube(-.80,-.68,.105,'#5983a0','#a0c8dd88');
      ring([-.63,0,0],.19,'#708e9e','yz','#95abb977');
      ring([.65,0,0],.23,'#559a8a','yz','#7bc7ac65');
      const x=-.54+1.12*(T*.33%1),r=.053;
      p.trace([[-.56,0,0],[.64,0,0]],aqua,1.85);
      arrow([x,0,0],[x+.18,0,0],aqua,r);
      p.glow([x,0,0],.13,blue);
      dot([x,0,0],r,blue,true);
      break;
    }
    case 1:{
      sphere(.65);
      const P=ElectronPhysics,positions=cache.states?P.sampleRing(cache.states,T):P.ring(S.N,S.kick)[0];
      points(Array.from({length:S.N},(_,i)=>[positions.slice(i*3,i*3+3).map(v=>v*.65),blue]),.058);
      break;
    }
    case 2:
      if(S.target)sphere(.63);
      else{
        sphere(.63,[0,0,0],{negative:true});p.glow([0,0,0],.16,coral);
        dot([0,0,0],atomGlyphRadius.nucleus,coral,true);
      }
      break;
    case 3:{
      const P=ElectronPhysics,r0=S.R*P.a0;
      drawClassicalOrbit(p,t=>P.collapseView(r0,t,S.rad),T,r0,S.rad);
      break;
    }
    case 4:drawBohrAtom(p,ElectronPhysics.bohrScene(S,cache,T));break;
    case 5:drawHydrogenLevels(p,S.reference+1,S.r);break;
    case 6:{
      if(!S.orbitalAdvanced&&S.view!==3){
        drawAtomGallery(p,3,cache.orbitalReference??={},0);
        break;
      }
      const volume=cache.volume;
      if(!volume)break;
      const {cells,h,extent,s,b}=volume,R=.73/extent;
      const {cdf}=cache.arrays;
      if(!cache.modelSamples||S.mix){
        const rng=ElectronPhysics.random(1926);
        const phi=S.phase*Math.PI/180-(ElectronPhysics.energy(b[0])-ElectronPhysics.energy(s[0]))*T*.1/.65821196;
        cache.modelSamples=sample(3600,()=>{
          const cell=cells[OrbitalVolume.sample(cdf,rng)];
          const [,phase]=OrbitalVolume.evaluate(cell,phi);
          return {pos:cell.xyz.map(v=>(v+(rng()-.5)*h)*R),color:S.view===4&&Math.cos(phase)<0?amber:blue};
        });
      }
      if(S.view===4)p.marks(cache.modelSamples.map(({pos,color})=>{const [x,y]=proj(pos);return [x,y,color];}),1.9,.55,true);
      else p.depthCloud(cache.modelSamples.map(({pos})=>pos));
      if(S.view===3){
        const plane=OrbitalVolume.planes[S.plane],offset=S.cut*.73,side=.65;
        const corners=[[-side,-side],[side,-side],[side,side],[-side,side]];
        line(corners.map(([u,v])=>OrbitalVolume.planePoint(plane,offset,u,v)),'#ad7845',1.5,'#eeb97929');
      }
      p.glow([0,0,0],.07,coral);dot([0,0,0],.023,coral,true);
      break;
    }
    case 7:
      drawNickelCrystal(p);
      break;
    case 8:{
      const x=q=>-.68+.34*q,y=q=>.115*Math.hypot(1,q),selected=x(S.p);
      line([[x(0),-.55,0],[x(0),.55,0]],'#809eaf');
      line([[x(0),0,0],[x(4),0,0]],'#809eaf');
      line([[selected,-.51,0],[selected,.51,0]],'#90a8b5',1,null,'4 4');
      for(const [sign,color,caption] of [[1,aqua,'Kladná větev'],[-1,'#657e90','Záporná větev']]){
        p.trace(sample(200,f=>[x(f*4),sign*y(f*4),0]),color,2.5);
        dot([selected,sign*y(S.p),0],.023,color,true);
        p.label([x(.15),sign*.34,0],caption);
      }
      p.label([x(0),.54,0],'Energie');
      p.label([x(3),-.11,0],'Hybnost');
      break;
    }
    case 9:{
      const shape=(x,y0,y1)=>[[x,y0,-.38],[x,y1,-.38],[x,y1,.38],[x,y0,.38]];
      const g=S.gap*.05,w=S.width*.05;
      const edges=[-.50,...[-1,1].filter(side=>S.mode!==(side>0?2:1)).flatMap(side=>[side*g-w,side*g+w]),.50];
      const barrier=p.gradient('linearGradient','x2="1" y2="1"',[[0,'#f2ead6'],[.4,'#e5cb99'],[1,'#ad8655']]);
      for(let j=0;j<edges.length;j+=2){
        line(shape(.025,edges[j],edges[j+1]),'#9b855f',1,'#b79e71');
        line(shape(0,edges[j],edges[j+1]),'#a88c65',1,barrier);
      }
      line(shape(.65,-.50,.50),'#5e9b9d',1.25,'#a7d5d475');
      p.glow([-.67,0,0],.16,blue);dot([-.67,0,0],.053,blue,true);
      for(const side of [-1,1]){
        if(S.mode===(side>0?2:1))continue;
        p.trace([[-.67,0,0],[0,side*g,0]],blue,1.6);
        for(let k=1;k<=4;k++){
          const r=.094*k+.07*((T*.4)%1);
          line(sample(64,f=>{const a=(f-.5)*Math.PI;return [r*Math.cos(a),side*g+r*Math.sin(a),0];}),S.mode===3&&side<0?'#ba7c2d8a':'#2878b893');
        }
      }
      break;
    }
    case 10:{
      const x=q=>-.82+(q+2)*1.64/7,base=-.28;
      const profile=sample(320,f=>{
        const q=-2+7*f;
        return [x(q),base+.68*Math.exp(-.5*((q-S.p)/S.width)**2),0];
      });
      const left=x(S.p-S.width),right=x(S.p+S.width);
      line([[left,base,0],[right,base,0],[right,.44,0],[left,.44,0]],'none',0,'#2279b61f');
      p.waveEnvelope(profile,profile.map(([u])=>[u,base,0]),blue);p.trace(profile,blue,2.4);
      line([[x(S.p),base,0],[x(S.p),.46,0]],blue,1,null,'4 4');
      line([[-.82,base,0],[.82,base,0]],'#7897a9',1.1);
      const [u,v]=proj([0,.53,0]);p.text(u,v,'Rozdělení v okamžiku přípravy','middle');
      const [a,b]=proj([0,-.42,0]);p.text(a,b,'Hybnost podél osy letu','middle');
      break;
    }
    default:{
      const target=[-.18,0,0],source=[-.83,0,0],scattered=[.22,.37,0],recoil=[.07,-.37,0];
      p.trace([source,target,scattered],aqua,1.7);
      arrow(source,[target[0]-.08,0,0],aqua);
      arrow(target,scattered,aqua,.031);
      arrow(target,recoil,blue,.031);
      p.glow(target,.10,blue);dot(target,.031,blue,true);
      const [sx,sy]=proj([-.75,.14,0]);p.text(sx,sy,'Příchozí foton');
      const [fx,fy]=proj([.29,.47,0]);p.text(fx,fy,'Rozptýlený foton','middle');
      const [qx,qy]=proj([.30,-.41,0]);p.text(qx,qy,'Předaná hybnost','middle');
      p.callout(target,[-.26,-.30,0],'Cílový elektron','end');
    }
  }
}
