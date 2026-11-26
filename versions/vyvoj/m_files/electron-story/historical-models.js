const electronMilestones = [
  ['Katodové paprsky', 'Záporná částice', 'Katoda → stínítko'],
  ['Thomsonův atom', 'Elektrony v kladné kouli', 'Kladný objem · záporné částice'],
  ['Rozptyl', 'Atom s jádrem', 'Kladný náboj soustředěný v jádře'],
  ['Stabilita', 'Klasická oběžná dráha', 'Pohyb elektronu v poli jádra'],
  ['Bohrův atom', 'Povolené dráhy', 'Pevné poloměry a energie'],
  ['Vlna hmoty', 'Vlna na kružnici', 'Fáze vlny podél obvodu'],
  ['Orbitaly', 'Kvantový stav', 'Bod značí možný výsledek měření'],
  ['Difrakce', 'Vlna v krystalu', 'Vlnoplochy · niklová mřížka'],
  ['Dirac', 'Elektron a pozitron', 'Záporný a kladný náboj'],
  ['Dvojštěrbina', 'Amplitudy ze dvou otvorů', 'Příprava · clona · detekce'],
  ['Kvantové pole', 'Jednočásticový stav', 'Model hustoty podél směru pohybu'],
  ['Rozlišení', 'Elektron a sonda', 'Dosah rozlišení sondy']
];

const electronModelTransitions = [
  'Vychýlení a měrný náboj vypovídají o částici ve svazku. Další otázka zněla, jak se taková částice vejde do elektricky neutrálního atomu.',
  'Rozprostřený kladný náboj dává slabé pole i při průletu velmi blízko středu. Velký odklon v dalším pokusu vyžaduje náboj soustředěný do malého prostoru.',
  'Jádro vysvětluje prudký odklon částic alfa. Kdyby se ale elektron pohyboval po klasické kružnici, při oběhu by vyzařoval a rychle ztratil energii.',
  'Zapni záření a sleduj, jak klesá poloměr. Stabilní atom vyžaduje stav, ve kterém elektron průběžně energii neztrácí. To Bohr zavedl jako postulát.',
  'Přesné frekvence hlavních čar podpořily kvantování energie. Samotné povolené kružnice však nevysvětlují intenzity čar ani původ kvantovací podmínky.',
  'Uzavření fáze dává názornou podmínku pro jednu kružnici. Kvantová mechanika hledá stav v celém prostoru a dovoluje určit pravděpodobnosti měření.',
  'Přepni srovnání s Bohrem a sleduj kružnici vedle rozložení možných poloh. Měřitelným projevem vlnové fáze je také difrakce v následující etapě.',
  'Slabě odchýlené a silně odchýlené svazky závisejí na fázi a vlnové délce. Vlnová povaha sama neřeší chování elektronu při relativistických rychlostech.',
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
  drawBohrAtom(p,{initial:active,final:active,shownFinal:3-active,highest:2,angle:.62,progress:0});
}


// Orthographic cutaways use the same camera convention as the experiment.
function drawHistoricalElectron(p, chapter, S, T, cache) {
  const {electron:blue,path:aqua,positive:amber,nucleus:coral,level:purple}=electronInk;
  const tau=ElectronPhysics.tau;
  const {proj,line,dot,ring,sphere,tube,arrow}=p;
  const sample=(count,fn)=>Array.from({length:count},(_,i)=>fn(i/(count-1),i));
  const orbit=(r,theta)=>[r*Math.cos(theta),0,r*Math.sin(theta)];
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
    case 4:drawBohrAtom(p,ElectronPhysics.bohrView(S,T));break;
    case 5:{
      if(S.view){
        const width=S.sigma*1.8;
        const envelope=sample(161,f=>{const x=(f-.5)*1.7;return [x,.32*Math.exp(-x*x/(width*width)),0];});
        p.waveEnvelope(envelope,envelope.map(([x,y,z])=>[x,-y,z]),aqua);
        line([[-.85,0,0],[.85,0,0]],'#90a9b5',1,null,'4 4');
        p.trace(envelope.map(([x,y,z])=>[x,y*Math.cos(50*x-6*T),z]),aqua);
      }else{
        const P=ElectronPhysics,turns=tau*S.r*1e-12/(P.h/P.momentum(S.U));
        ring([0,0,0],.66,'#8faab6','xz',null,'4 4');
        p.trace(sample(300,f=>{const [x,,z]=orbit(.66,f*tau);return [x,.15*Math.cos(tau*turns*f-T*3),z];}),aqua);
      }
      break;
    }
    case 6:{
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
      p.glow([0,0,0],.07,coral);dot([0,0,0],.023,coral,true);
      break;
    }
    case 7:{
      drawNickelCrystal(p);
      const angle=S.inc*Math.PI/180;
      for(let j=0;j<4;j++){
        const y=.37+.31*((j/4-T*.35+100)%1);
        line([[-.44-Math.sin(angle)*y,y,-.28],[.44-Math.sin(angle)*y,y,-.28],[.44-Math.sin(angle)*y,y,.28],[-.44-Math.sin(angle)*y,y,.28]],'#2b899f87',1,'#75b8c423');
      }
      break;
    }
    case 8:
      for(const [x,color,label] of [[-.36,blue,'Elektron'],[.36,purple,'Pozitron']]){
        p.glow([x,.04,0],.32,color);dot([x,.04,0],.175,color,true);
        const [u,v]=proj([x,-.26,0]);p.text(u,v+12,label,'middle');
      }
      break;
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
      const P=ElectronPhysics,time=T*1.5,center=S.p/Math.hypot(1,S.p)*time,range=10/S.width,peak=S.width*Math.sqrt(2/Math.PI);
      drawPacketBody(p,sample(111,f=>{const u=f-.5;return [1.7*u,.41*Math.sqrt(P.packet(S.p,S.width,center+u*range,time)/peak)];}));
      arrow([-.72,-.49,0],[.72,-.49,0],blue);
      break;
    }
    default:{
      const P=ElectronPhysics,field=10**S.zoom,resolution=P.hb*P.c/(10**S.q*P.e);
      const r=Math.min(.65,resolution/field*.58);
      if(r>.03)p.glow([0,0,0],r,amber);
      for(const plane of ['xy','xz','yz'])ring([0,0,0],Math.max(.013,r),'#bc925a',plane,null,'4 3');
      p.glow([0,0,0],.097,blue);dot([0,0,0],.028,blue,true);
    }
  }
}
