const ElectronSources = ["https://doi.org/10.1080/14786449708621070","https://history.aip.org/exhibits/electron/","https://doi.org/10.1080/14786440409463107","https://doi.org/10.1002/andp.201300732","https://web.mit.edu/8.13/8.13c/references-fall/rutherford/rutherford-scattering-of-alpha-and-beta-particles.pdf","https://doi.org/10.1080/14786441308634955","https://openstax.org/books/university-physics-volume-3/pages/6-4-bohrs-model-of-the-hydrogen-atom","https://physics.nist.gov/PhysRefData/Handbook/Tables/hydrogentable2.htm","https://www.nobelprize.org/uploads/2016/04/broglie-lecture.pdf","https://openstax.org/books/university-physics-volume-3/pages/8-1-the-hydrogen-atom","https://books.physics.oregonstate.edu/GCF/hydroform.html","https://www.nobelprize.org/uploads/2018/06/born-lecture.pdf","https://doi.org/10.1103/PhysRev.30.705","https://www.math.ucsd.edu/~nwallach/Dirac1928.pdf","https://www.damtp.cam.ac.uk/user/tong/qft/qfthtml/S4.html","https://doi.org/10.1119/1.16104","https://doi.org/10.1088/1367-2630/15/3/033018","https://digitalcommons.unl.edu/physicsfacpub/105/","https://www.damtp.cam.ac.uk/user/tong/qft.htm","https://www.damtp.cam.ac.uk/user/tong/qft/qfthtml/S0.html","https://www.damtp.cam.ac.uk/user/tong/qft/qfthtml/S6.html","https://physics.nist.gov/cuu/Constants/","https://pdg.lbl.gov/","https://phet.colorado.edu/en/simulations/models-of-the-hydrogen-atom","https://github.com/phetsims/models-of-the-hydrogen-atom","https://github.com/phetsims/models-of-the-hydrogen-atom/blob/main/doc/model.md","https://www.jlab.org/physics/visualizingthequantumworld","https://github.com/Niuskir/Electron-Orbitals-Blender-3D","https://github.com/Niuskir/orbitals","https://github.com/shianjeng/quantum-wave-lab","https://github.com/francisco-kim/DoubleSlitSimulator","https://www.nist.gov/pml/atomic-spectra-database"];
/* Controls: key, Czech caption, range and initial value, KaTeX unit; or a list of choices. */
const electronAndersonSource=ElectronSources.push('https://journals.aps.org/pr/abstract/10.1103/PhysRev.43.491')-1;
const electronDiracAntiparticleSource=ElectronSources.push('https://www.physics.mcgill.ca/~keshav/551III/dirac1931.pdf')-1;
const electronProtonStructureSource=ElectronSources.push('https://atlas.cern/updates/briefing/insight-proton-structure')-1;
const ElectronLessons=[
{year:'1897',title:'Stopa v katodové trubici',caption:'Moderní rekonstrukce principu Thomsonova měření',controls:[
['U','Urychlovací napětí',100,1000,10,300,'V'],['E','Elektrické pole',0,20,.01,8,'kV/m'],['B','Magnetická indukce',0,2,.01,1,'mT'],['vectors','Vektory',['Pole a síly','Pouze svazek']]],
story:'Z katody vychází úzký svazek. Podle jedné představy přenášel poruchu prostředí, podle jiné jej tvořily nabité částice. Elektrické pole posune světelnou stopu proti směru pole. Stejné znaménko a stejný měrný náboj v různých trubicích ukázaly na společnou zápornou složku hmoty.',
task:'Ve vyvážené trubici určíš rychlost z poměru $E/B$. Po uložení vyvážení nech působit samotné magnetické pole. Z poloměru zakřivení a uložené rychlosti určíš velikost měrného náboje. Co by se změnilo s kladným nábojem?',
eq:[String.raw`\dot{\mathbf p}=-e(\mathbf E+\mathbf v\times\mathbf B),\quad \mathbf p=\gamma m_e\mathbf v`,String.raw`r=\gamma m_ev/(eB),\quad \gamma=\frac{1}{\sqrt{1-v^2/c^2}}`],
detail:'Pole působí jen mezi okraji desek. Dvě půlkopnutí elektrického pole obklopují rotaci hybnosti v magnetickém poli. Poloměr v druhém měření určí kružnice třemi body dráhy. Nerelativistické vyhodnocení s rostoucím napětím systematicky podhodnocuje měrný náboj. Stopa měří výchylku a neudává tvar částice.',src:[0,1]},
{year:'1904',title:'Elektrony v kladné kouli',caption:'Rovnováha prstence a její porušení',controls:[['N','Počet elektronů',1,8,1,5,''],['R','Poloměr koule',40,150,1,80,'pm'],['kick','Posunutí jednoho elektronu',0,.3,.01,.12,'R'],['field','Graf',['Pohyb elektronu','Pole kladné koule','Potenciál kladné koule']]],
story:'Neutrální atom s lehkými zápornými částicemi potřeboval také kladný náboj. Thomson zkoumal jeho spojité rozložení a prstence elektronů. Uvnitř rovnoměrné koule roste přitažlivá síla lineárně se vzdáleností od středu. Elektrony se mezi sebou odpuzují.',
task:'Začni s jedním elektronem. Zvětši poloměr koule a porovnej periodu. Pak přidej elektrony a vychyl jeden z prstence. Jeho pohyb se přenese na ostatní. Ve scéně rozptylu vyzkoušej stejný typ kladného prostředí.',
eq:['\\mathbf E_+=Q\\mathbf r/(4\\pi\\varepsilon_0 R^3)','\\omega_0^2=eQ/(4\\pi\\varepsilon_0m_eR^3)'],detail:'Model začíná přesným rovinným prstencem s vyrovnanými radiálními silami. Posunutí spouští netlumenou Verletovu integraci. Rovnováha prstence nemusí být stabilní vůči libovolné prostorové poruše. Vně koule odpovídá pole bodovému náboji.',src:[2,3]},
{year:'1909–1911',title:'Zpětný rozptyl',caption:'Průlet částice alfa kolem jednoho atomu',controls:[['E','Energie částice alfa',2,8,.1,5,'MeV'],['b','Nárazový parametr',0,160,1,20,'fm'],['Z','Protonové číslo terče',13,79,1,79,''],['target','Kde je kladný náboj',['V malém jádře','V objemu atomu']],['view','Pohled',['Detail srážky','Aparatura']]],
story:'Tenká fólie propustila většinu částic alfa téměř přímo. Některé však Geiger a Marsden zachytili i zpět. Rutherford spojil četnost velkých výchylek s velmi silným polem v malé oblasti atomu.',
task:'Přibliž svazek ke středu snížením nárazového parametru. Přepni typ náboje při stejné energii. U koule klesá síla u středu k nule, u jádra prudce roste. Sleduj také vzácné události na konci histogramu.',
eq:['b=A\\cot(\\theta/2),\\quad A=zZ e^2/(8\\pi\\varepsilon_0 E_k)','\\mathrm d\\sigma/\\mathrm d\\Omega=A^2/[4\\sin^4(\\theta/2)]'],detail:'Každá částice se rozptyluje jednou. Svazek rovnoměrně pokrývá kruh nárazových parametrů do 160 fm. Detektor pokrývá celý azimut. Referenční počet v intervalu úhlů je úměrný rozdílu ploch dvou kruhů omezených aperturou. Histogram jádra vzorkuje analytickou mapu úhlů, zvýrazněná dráha se integruje samostatně. Elektronový obal, stínění a vícenásobné srážky jsou zanedbány.',src:[4,6]},
{year:'1911–1913',title:'Proč atom přežije?',caption:'Klasická energetická bilance vodíku',controls:[['R','Počáteční poloměr',.6,3,.05,1,'a_0'],['rad','Vyzařování',['Vypnuto','Larmorův výkon']]],
story:'Přitažlivost jádra dokáže zakřivit dráhu elektronu do kružnice. Směr rychlosti se ale neustále mění. Klasická elektrodynamika takové částici přiřazuje vyzařovaný výkon. Atom ztrácí energii, poloměr klesá a výkon dále roste.',
task:'Zapni vyzařování. Porovnej dobu smršťování pro výchozí a dvojnásobný poloměr. Z energetické bilance plyne osminásobná doba. Stabilita běžné hmoty vyžaduje jiný popis vázaného elektronu.',
eq:['E=-\\kappa/(2r),\\quad P=2\\kappa^3/(3m_e^2c^3r^4)','r^3=r_0^3-4\\kappa^2t/(m_e^2c^3)'],detail:'Nehybné jádro, pomalý pokles poloměru a malá rychlost vůči světlu dovolují kvazikruhovou aproximaci. Konec výpočtu nastává při třech procentech výchozího poloměru nebo při desetině rychlosti světla podle toho, co nastane dříve. Orbitální fáze a pomalý pokles poloměru mají rozdílná časová měřítka.',src:[6,21]},
{year:'1913',title:'Čárové spektrum vodíku',caption:'Stacionární stavy a fotony',controls:[['ion','Jednoelektronový atom',['Vodík','Helium • jednou ionizované','Lithium • dvakrát ionizované']],['ni','Výchozí hladina',1,6,1,3,''],['nf','Cílová hladina',1,6,1,2,''],['photon','Energie dopadajícího fotonu',.1,124,.001,1.889,'eV']],
story:'Vodík září při určitých vlnových délkách. Bohr připustil jen vybrané hodnoty momentu hybnosti a stacionární stavy bez záření. Energii fotonu určuje rozdíl energií dvou hladin. Tím získaly čáry spektra společné vysvětlení.',
task:'Ponech cílovou hladinu druhou a zvyšuj výchozí od třetí do šesté. Sleduj přechod od červené k fialové. Obrať pořadí hladin a nalaď dopadající foton na jejich energetický rozdíl.',
eq:['L=n\\hbar,\\quad r_n=a_\\mu n^2/Z,\\quad E_n=-Z^2\\kappa/(2a_\\mu n^2)','\\lambda=hc/|E_f-E_i|'],detail:'Redukovaná hmotnost zahrnuje pohyb vybraného jádra. Pro vodík je jeho protonové číslo jedna. U jednoelektronových iontů s rostoucím nábojem jádra klesá poloměr a roste vazebná energie. Model udává vakuovou vlnovou délku bez jemné struktury. Pro srovnání Balmerových čar ve vzduchu se používá přibližný index 1,00028. Absorpce ve výukovém ovládání má toleranci 0,005 eV pro naladění posuvníku.',src:[5,6,7,31]},
{year:'1924',title:'Najdi povolenou dráhu vodíku',caption:'Návaznost fáze a oběh v poli jádra',controls:[['reference','Cílová hladina',['První','Druhá','Třetí']],['r','Zkoušený poloměr dráhy',25,500,1,85,'pm'],['lambda','Vlnová délka',.12,1.12,.001,.4,'nm']],
story:'De Broglie spojil hybnost elektronu s vlnovou délkou. Na uzavřené dráze musí po jednom oběhu navázat fáze vlny.',
task:'Zkoušej dvojice poloměru a vlnové délky. Sleduj, kdy fáze naváže a kdy zvolená vlnová délka zároveň odpovídá oběhu v poli jádra.',
eq:['p(r)=\\sqrt{\\mu\\kappa/r},\\quad \\lambda=h/p','\\Delta\\varphi=2\\pi(2\\pi r/\\lambda),\\quad r_n=a_\\mu n^2'],detail:'V klasickém pokusu s Larmorovým výkonem elektron při oběhu průběžně ztrácí energii a dráha se smršťuje. Bohrova povolená kružnice představuje stacionární stav. V kvantovém popisu má základní stav stálé rozložení náboje. Excitovaný vodík může vyzářit foton při přechodu na nižší hladinu. Prostorové rozložení pravděpodobnosti polohy ukazují orbitaly v další etapě.',src:[5,8]},
{year:'1926',title:'Kde elektron naměříme?',caption:'Vodíkové orbitaly • Bornova interpretace',controls:[['state','Orbital',['1s','2s','2p z','2p x','2p y','2p m=1','3s','3p z','3d z²','3d m=2']],['quality','Jemnost objemu',['Běžná','Jemná']],['view','Zobrazení',['Výsledky měření','Objem hustoty','Izoplocha hustoty','Rovinný řez orbitalem','Fáze','Srovnání s Bohrem']],['cut','Posun řezu',-.8,.8,.02,0,'R_{\\mathrm{okna}}'],['level','Hladina izoplochy',.01,.8,.01,.12,'w_{\\max}'],['mix','Příměs orbitalu',0,1,.02,0,''],['phase','Relativní fáze',0,360,2,0,'{}^\\circ']],
story:'Schrödinger našel stacionární vlny v Coulombově poli. Born přiřadil jejich čtverci význam pravděpodobnosti na jednotku objemu. Každý bod oblaku je jedna poloha v jiné, stejně připravené soustavě. Uzly vznikají tam, kde amplituda vymizí.',
task:'Zaškrtni Zobrazit řez a ponech posun na nule. U orbitalu $2\\mathrm{p}_z$ porovnej rovinu $xy$, která leží mezi laloky, s rovinou $xz$, která oba laloky protíná. Pak zkus posunout řez ve směru kolmém k rovině. Příměs druhého orbitalu najdeš pod Další stavy a zobrazení.',
eq:['\\psi=R_{n\\ell}Y_\\ell^m,\\quad w=|\\psi|^2,\\quad P_r=r^2|R_{n\\ell}|^2','\\Psi=\\sqrt{1-f}\\,\\psi_a+\\sqrt f\\,e^{i(\\varphi-\\Delta E t/\\hbar)}\\psi_b'],detail:'Posun řezu udává vzdálenost roviny od středu ve směru její kolmice. Rovina $xy$ se posouvá ve směru $z$, $xz$ ve směru $y$ a $yz$ ve směru $x$. Při nulovém posunu prochází rovina jádrem. Pravá scéna ukazuje tenkou vrstvu kolem této roviny. V superpozici je $\\psi_a$ vybraný orbital a $\\psi_b$ příměs pojmenovaná u posuvníku. Údaj udává váhu $f$ příměsi v procentech. Při $0\\,\\%$ máš pouze vybraný orbital, při $100\\,\\%$ pouze příměs. Mezi těmito hodnotami se skládají amplitudy obou orbitalů a tvar závisí na jejich relativní fázi. Izoplocha udává podíl maximální hustoty v zobrazené mřížce. Barva fáze rozlišuje fáze amplitudy, elektrický náboj je všude záporný. Objem i statistika mají konečné zorné pole.',src:[9,10,11]},
{year:'1927',title:'Difrakce elektronů na niklu',caption:'Zdroj elektronů, niklový krystal a otočný detektor',controls:[['U','Urychlovací napětí',20,160,1,54,'V'],['det','Úhel detektoru',0,85,.05,25,'{}^\\circ']],
story:'Davisson a Germer měnili rychlost elektronového svazku a měřili, kolik elektronů se od niklu rozptýlí do různých směrů. Ve vybraných směrech zachytili výrazně silnější signál. Polohy těchto maxim vysvětlili vzájemným zesilováním vln rozptýlených na pravidelně uspořádaných atomech.',
task:'Přesuň detektor na nejvyšší vrchol grafu a odečti úhel. Zvyš napětí a zjisti, kam musíš detektor přemístit, abys znovu zachytil nejsilnější signál.',
eq:['A(\\mathbf q)=\\sum_j e^{i\\mathbf q\\cdot\\mathbf R_j},\\quad I=|A|^2','\\mathbf q=\\mathbf k_f-\\mathbf k_i,\\quad |\\mathbf k_i|=|\\mathbf k_f|=2\\pi/\\lambda'],detail:'Model používá konečný výřez plošně středěné kubické mřížky niklu s normálou $[111]$ a kolmým dopadem svazku. Všechny atomy mají stejnou rozptylovou amplitudu. Vliv povrchu, vnitřního potenciálu a vícenásobného rozptylu model zanedbává. Uvedené úhly patří k výpočtu pro tuto geometrii. Graf používá při každém napětí vlastní maximum jako jednotku intenzity.',src:[12]},
{year:'1928–1932',title:'Elektron a pozitron v magnetickém poli',caption:'Diracova rovnice a rozlišení náboje z dráhy',controls:[['p','Velikost hybnosti',0,4,.01,1,'m_ec'],['field','Směr magnetického pole',['Do obrazovky','Z obrazovky']]],
story:'Dirac hledal kvantovou rovnici pro elektron, která by platila i při vysokých rychlostech. Rovnice z roku 1928 měla dvě energetické větve a popisovala také spin elektronu. V roce 1931 Dirac předpověděl částici se stejnou hmotností jako elektron a s opačným nábojem. Carl Anderson v roce 1932 pozoroval stopu pozitronu v mlžné komoře v magnetickém poli.',
task:'Při stejné hybnosti obrať magnetické pole a porovnej stáčení obou stop. Pak zvětši hybnost a sleduj, jak se mění zakřivení stop a rozdíl mezi výsledky v dolním grafu.',
eq:['i\\hbar\\partial_t\\Psi=(c\\boldsymbol\\alpha\\cdot\\hat{\\mathbf p}+\\beta m_ec^2)\\Psi','E_\\pm=\\pm\\sqrt{p^2c^2+m_e^2c^4}'],detail:'Záporná větev patří k matematickým řešením volné rovnice. V teorii kvantového pole odpovídají příslušné módy antičástici s kladnou fyzikální energií. Pravá scéna znázorňuje dráhy připraveného elektronu a pozitronu v homogenním poli. Jejich hybnost míří kolmo na pole, její velikost se podél dráhy nemění. Na Andersonově fotografii pomohla určit směr letu olověná deska. Částice v ní ztratila energii a za deskou se její stopa zakřivila víc. Ve schématu směr letu ukazuje šipka.',src:[13,electronDiracAntiparticleSource,14,electronAndersonSource]},
{year:'1989 / 2013',title:'Jedna detekce za druhou',caption:'Dvojštěrbina • časový vývoj ve dvou rozměrech',controls:[['mode','Příprava',['Obě koherentně','Horní štěrbina','Dolní štěrbina','Nekoherentní směs']],['width','Šířka otvoru',1,2,.05,1.5,'nm'],['gap','Vzdálenost středů',3,6,.25,4,'nm'],['energy','Energie svazku',.12,.5,.02,.3,'eV'],['view','Detektor',['Hustota','Reálná amplituda','Jednotlivé zásahy']],['quality','Výpočetní mřížka',['96 × 96','128 × 128']]],
story:'Jednotlivý průchod končí lokalizovanou detekcí. Mnoho stejně připravených elektronů vytvoří rozdělení, které závisí na tom, zda jsou obě cesty koherentní. Tonomura použil elektronový biprizmatický interferometr. Bach a spoluautoři ovládali dvě skutečné štěrbiny.',
task:'Otevři obě štěrbiny a přidávej zásahy. Pak zvol statistickou směs dvou samostatných příprav. Minimum může při ztrátě koherence zmizet. Jedna tečka na stínítku neprozradí předchozí klasickou dráhu.',
eq:['i\\hbar\\partial_t\\psi=[-\\hbar^2\\nabla^2/(2m_e)+V-iW]\\psi','P_{\\rm det}(y)=\\int (2W_{\\rm det}/\\hbar)|\\psi|^2\\,\\mathrm dx\\,\\mathrm dt'],detail:'Gaussův balík dopadá na konečnou bariéru. Na hraně štěrbiny se potenciál v buňce mřížky určuje podle podílu její zakryté výšky. Absorbér na pravém okraji zaznamenává úbytky pravděpodobnosti, ostatní okraje ji odvádějí. Počet vypuštěných elektronů zahrnuje i ty, které detektor nezachytí. Směs průměruje dvě samostatná řešení s jedním otvorem.',src:[15,16,17]},
{year:'Současnost',title:'Kde najdeš jeden elektron?',caption:'Měření polohy ve volném jednočásticovém stavu',controls:[['p','Střední hybnost',0,3,.05,1,'m_ec'],['width','Nejistota hybnosti',.1,.6,.01,.25,'m_ec']],
story:'Dnes je elektron elementární fermion se záporným elementárním nábojem, nenulovou klidovou hmotností a spinem jedna polovina. V kvantové teorii pole je kvantem elektronového pole. V jednočásticovém sektoru lze připravit prostorově rozprostřený stav.',
task:'Porovnej výsledky opakovaného měření polohy pro dvě přípravy s různým rozptylem hybnosti. Sleduj vodorovnou šířku shluku bodů a odečet rozptylu polohy.',
eq:['E_p^2=p^2c^2+m_e^2c^4','\\Psi(x,t)=\\int a(p)u(p)e^{i(px-E_pt)/\\hbar}\\,\\mathrm dp/\\sqrt{2\\pi\\hbar}'],detail:'Jednorozměrná superpozice kladných energií má pevnou spinovou polarizaci. Graf zobrazuje součet čtverců spinorových amplitud. Operátorové pole a tvorba párů vyžadují širší formalismus.',src:[14,18,19,20]},
{year:'Měřítka',title:'Jak malý detail rozliší sonda?',caption:'Rozptyl jako způsob zkoumání struktury',controls:[['zoom','Zorné pole',-20,-9,.05,-10,'m'],['q','Přenos hybnosti',2,14,.05,7,'\\mathrm{eV}/c']],
story:'Rozměr orbitalu popisuje připravený stav. Redukovaná Comptonova délka spojuje hmotnost s relativistickou kvantovou škálou. Klasický poloměr vzniká porovnáním elektrostatické energie s klidovou energií. Každá z těchto délek odpovídá jiné otázce.',
task:'Porovnej hybnost příchozího a rozptýleného fotonu. Jejich vektorový rozdíl získá elektron. Pak sleduj, jak se s velikostí tohoto přenosu mění rozlišení.',
eq:['a_0=\\hbar^2/(m_e\\kappa),\\quad \\bar\\lambda_C=\\hbar/(m_ec),\\quad r_e=\\kappa/(m_ec^2)','\\Delta x\\sim\\hbar/q'],detail:'Standardní model zachází s elektronem jako s bodovou částicí bez známé vnitřní struktury. Proton je složený. Jeho valenční obsah tvoří dva kvarky $u$ a jeden kvark $d$. Uvnitř přispívají také gluony a moře párů kvarků a antikvarků. Světelná vlákna a pohyblivé značky jsou názorná ilustrace dynamického kvantového stavu. Jejich pohyb má výtvarně zvolené tempo. Jantarová úsečka platí pro odhad rozlišení z nastaveného přenosu hybnosti. Převod mezí konkrétních modelů kompozitnosti na geometrický poloměr není univerzální.',src:[21,22,19,electronProtonStructureSource]}
];

const electronLabNotes=[
  {
    motivation:'V katodové trubici vznikala světelná stopa. Fyzici zkoumali, zda ji působí vlna v prostředí, nebo proud nabitých částic. Thomson porovnal poměr hmotnosti k velikosti náboje při různých plynech a materiálech elektrod. Podobný poměr podpořil závěr, že katodové paprsky tvoří stejný druh částice.',
    goal:'Urči velikost měrného náboje elektronu $e/m_e$. Značka $e$ je velikost náboje elektronu a $m_e$ jeho hmotnost. Jednotkou poměru je $\\mathrm{C/kg}$.',
    scene:'Zelená křivka sleduje svazek od katody ke stínítku. Střed vyznačuje kroužek na stínítku a přerušovaná čára $y=0$ v grafu.',
    reason:'Při stejném poli změní částice s větším nábojem na jednotku hmotnosti svůj pohyb výrazněji. Vychýlení stopy tak dovolí určit poměr náboje a hmotnosti. Ze směru výchylky v elektrickém poli poznáš, že náboj je záporný.',
    step:[
      'Nastav Magnetickou indukci na $1\\,\\mathrm{mT}$ a dál ji ponech stejnou. Pohybuj ovladačem Elektrické pole podle toho, jestli je stopa nad středem nebo pod ním.',
      'V okolí vyvážení se ovladač přichytí k přesné hodnotě. Stopa se trefí do kroužku a graf se srovná s přerušovanou čarou. Klikni na Uložit vyvážení.',
      'Klikni na Vypnout elektrické pole. Dráha se znovu zakřiví, protože teď působí jen magnetické pole. Odečti poloměr zakřivení $r$ a velikost měrného náboje $e/m_e$.'
    ],
    calculation:{
      formula:String.raw`\begin{aligned} v&=\frac{E_{\text{vyv}}}{B} \\[3pt] \frac{e}{m_e}&\simeq\frac{v}{Br}=\frac{E_{\text{vyv}}}{B^2r} \end{aligned}`,
      explanation:'Při rovné dráze mají obě síly stejnou velikost, takže $eE_{\\text{vyv}}=evB$. Po vypnutí elektrického pole měříš $r$ při stejné magnetické indukci $B$. Pro rychlost malou vůči rychlosti světla je magnetická síla $evB$ rovna $m_ev^2/r$. Ve výpočtu použij $E_{\\text{vyv}}$ uložené při vyvážení.'
    },
    clue:'Při vyvážení odečteš $y=0\\,\\mathrm{mm}$. Po vypnutí elektrického pole očekávej $e/m_e\\approx 1{,}76\\times10^{11}\\,\\mathrm{C/kg}$.',
    conclusion:'Svazek se v elektrickém poli vychyluje proti směru pole, takže částice nesou záporný náboj. Z vyvážení a zakřivení určíš měrný náboj $q_e/m_e=-e/m_e$. K určení samotného náboje nebo hmotnosti ještě potřebuješ nezávislé měření.'
  },
  {
    motivation:'Objev záporných elektronů otevřel otázku, jak zůstává celý atom neutrální a co jeho elektrony udrží pohromadě. Thomson zkoumal uspořádání elektronů uvnitř rovnoměrně rozloženého kladného náboje a jejich pohyb po vychýlení.',
    goal:'Ověř, zda rozložený kladný náboj vrací vychýlený elektron ke středu a jak síla této vazby závisí na velikosti koule.',
    scene:'Modré kuličky jsou elektrony. Jantarová šipka ukazuje sílu kladné koule a modrá šipka výsledné odpuzování od ostatních elektronů. V grafu Pohyb elektronu je přerušovaná čára poloha středu koule.',
    reason:'V neutrálním atomu mohou být náboje vyrovnané a elektron přesto po vychýlení z rovnováhy uniknout. Thomsonova představa proto potřebuje vratnou sílu. Jedním elektronem ji vyzkoušíš samostatně. S více elektrony pak uvidíš účinek jejich vzájemného odpuzování.',
    step:[
      'Nastav Počet elektronů na $1$, Poloměr koule na $80\\,\\mathrm{pm}$ a Graf na Pohyb elektronu. Zkus nulové posunutí a pak nastav Posunutí jednoho elektronu na $0{,}12R$.',
      'V grafu odečti čas od výchozího vrcholu k dalšímu. Odečet si zkontroluj podle údaje $T$. Zvětši poloměr na $120\\,\\mathrm{pm}$, ponech stejný počet elektronů a porovnej periody podle časové osy.',
      'Nastav Počet elektronů na $5$ a vrať Posunutí jednoho elektronu na $0$. Prohlédni si klidový prstenec a všimni si, že jeho střed je prázdný. Potom znovu nastav posunutí na $0{,}12R$ a sleduj i ostatní elektrony.'
    ],
    calculation:{
      formula:String.raw`F_x=-\frac{eQ}{4\pi\varepsilon_0 R^3}\,x,\qquad T=2\pi\sqrt{\frac{4\pi\varepsilon_0 m_eR^3}{eQ}}`,
      explanation:'Znaménko síly $F_x$ říká, že míří proti výchylce $x$. Pro jeden elektron uvnitř koule tím vznikají kmity s periodou $T$. Poloměr koule je $R$, její kladný náboj $Q$, velikost náboje elektronu $e$, jeho hmotnost $m_e$ a permitivita vakua $\\varepsilon_0$. Pro jeden elektron v neutrálním atomu platí $Q=e$.'
    },
    clue:'Při nastavení na jeden elektron je bez posunutí elektron ve středu. Po vychýlení jím projíždí tam a zpět. Zvětšení koule prodlouží periodu z asi $0{,}28\\,\\mathrm{fs}$ na $0{,}52\\,\\mathrm{fs}$. Při nastavení na pět elektronů jsou bez posunutí všechny v klidu na prstenci a graf prvního elektronu je vodorovný nad nulou. Když ho vychýlíš, pohnou se i ostatní.',
    conclusion:'Jeden elektron má rovnováhu ve středu koule. Při stejném náboji má větší koule slabší vratnou sílu, a proto jsou kmity pomalejší. U prstence vyvažuje přitažlivost koule odpuzování ostatních elektronů. Porušení této rovnováhy rozhýbe celý prstenec. Zda je kladný náboj ve skutečném atomu rozložený v kouli, prověří rozptyl částic alfa v dalším pokusu.'
  },
  {
    motivation:'Geiger a Marsden vysílali částice alfa na tenké kovové fólie, mimo jiné na zlatou. Většina částic prošla přibližně vpřed, ale některé zachytili zpět na straně zdroje. Rutherford zkoumal, co tak velký odklon říká o stavbě atomu.',
    goal:'Zjisti, kde musí být kladný náboj atomu zlata, aby mohl částici alfa odklonit zpět na stranu zdroje.',
    scene:'V pohledu Aparatura je zlatá fólie uprostřed kruhu, který vyznačuje polohy detektoru. Fólie je terč složený z mnoha atomů zlata. Částice alfa přilétá ze zdroje a je to kladně nabité jádro helia. Detail srážky ukazuje její průlet kolem jediného atomu terče. Každý atom zlata má protonové číslo $Z=79$.',
    reason:'Kladný náboj atomu částici alfa odpuzuje. Otázka je, jak silné je pole při těsném průletu. Přepínačem měníš, kde je stejný kladný náboj téhož atomu: v malém jádře nebo rozložený v objemu atomu podle Thomsonovy představy.',
    step:[
      'Ponech Protonové číslo terče na $79$ a v pohledu Aparatura najdi zlatou fólii uprostřed. Sleduj, odkud částice přilétá a kde ji zachytí detektor.',
      'Přepni na Detail srážky. Nastav energii na $5\\,\\mathrm{MeV}$ a Nárazový parametr na $10\\,\\mathrm{fm}$. Čárkovaná čára ukazuje, kudy by částice letěla bez odklonu.',
      'Přepínej mezi volbami V malém jádře a V objemu atomu. Sleduj směr odletu a odečti úhel $\\theta$. Zkontroluj, jestli v grafu přibyly zásahy napravo od čárkované čáry při $90^\\circ$. Jejich součet ukazuje údaj $N_{\\text{zpět}}$.'
    ],
    calculation:{
      formula:String.raw`\theta=2\arctan\!\left(\frac{A}{b}\right),\qquad A=\frac{zZe^2}{8\pi\varepsilon_0 E_k}`,
      explanation:'Vztah platí pro bodové jádro. Úhel $\\theta$ měříš od směru příletu. Nárazový parametr $b$ je vzdálenost, o kterou by částice minula střed při přímém letu. Značky $ze$ a $Ze$ jsou náboje částice alfa a jádra, $e$ je elementární náboj, $\\varepsilon_0$ permitivita vakua a $E_k$ energie příletu.'
    },
    clue:'S nábojem v jádře vyjde u vybrané dráhy asi $133^\\circ$. S nábojem rozloženým v objemu atomu je průlet téměř přímý. Graf shrnuje mnoho simulovaných průletů s různými nárazovými parametry. Každý sloupec počítá zásahy v jednom pásmu širokém $10^\\circ$, například od $0^\\circ$ do $10^\\circ$. Vlevo jsou částice letící téměř přímo, napravo od $90^\\circ$ částice odražené ke straně zdroje. Okrová křivka ukazuje očekávané počty pro náboj v jádře a při přepnutí slouží jako srovnání.',
    conclusion:'Velké odklony pozorované při průletu fólií podporují představu, že kladný náboj atomu je soustředěný v malém jádře. Rozptyl tak prověří rozložení kladného náboje, které jsme v pokusu s Thomsonovou koulí jen předpokládali.'
  },
  {
    motivation:'Jaderný model vysvětlil velké úhly rozptylu. Zůstala otázka stability. Klasická elektrodynamika říká, že zrychlený náboj vyzařuje, a elektron na kružnici mění směr rychlosti pořád.',
    goal:'Ověř, jestli si elektron při klasickém vyzařování udrží stálý poloměr dráhy.',
    scene:'Kružnice označuje výchozí dráhu. Graf ukazuje poloměr ve fyzikálním čase. Oběh elektronu je zpomalený pro názornost, takže z animace můžeš sledovat zmenšování dráhy, počet skutečných oběhů z ní nezjistíš.',
    reason:'Prověříš, jestli klasická oběžná dráha umí vysvětlit, proč běžné atomy vydrží.',
    step:'Přepni Vyzařování na Larmorův výkon a spusť animaci. Poté vyzařování vypni a porovnej průběhy.',
    calculation:{
      formula:String.raw`P_{\text{rad}}=\frac{e^2a^2}{6\pi\varepsilon_0c^3},\qquad a\propto\frac{1}{r^2}`,
      explanation:'Larmorův výkon $P_{\\text{rad}}$ udává, jak rychle elektron vyzařováním ztrácí energii. Zrychlení $a$ roste, když se poloměr dráhy $r$ zmenší. Značky $e$, $\\varepsilon_0$ a $c$ označují velikost náboje elektronu, permitivitu vakua a rychlost světla.'
    },
    clue:'S vyzařováním poloměr v grafu klesá, bez něj zůstává stálý. Pro výchozí Bohrovu vzdálenost končí výpočet přibližně po $16\\,\\mathrm{ps}$ na dolní mezi modelu.',
    conclusion:'Klasický oběh se zářením vede ke zmenšování dráhy. Stabilní vodík proto potřebuje jiný popis vázaného elektronu. V další etapě vyzkoušíš Bohrovy stacionární stavy.'
  },
  {
    motivation:'Spektrum vodíku obsahuje čáry na určitých vlnových délkách. Bohr hledal pravidlo, které stabilnímu atomu přiřadí právě takové rozdíly energií, jaké odpovídají pozorovaným čarám.',
    goal:'Propoj změnu energetické hladiny s posunem čáry ve spektru vodíku.',
    scene:'Jádro je ve společném středu šesti zobrazených drah. Z vybrané dvojice právě obsazenou dráhu poznáš podle plné modré čáry a druhou podle čárkované čáry. Ostatní jsou světlejší. Rozestupy drah jsou v nákresu upravené kvůli čitelnosti. Skutečný poloměr obsazené dráhy ukazuje odečet $r_n$. Kolem přechodu se oběh zpomalí, abys stihl sledovat foton. Svislé čáry v grafu označují vlnové délky.',
    reason:'Zkoušíš, zda vybrané energetické hladiny dokážou vysvětlit konkrétní barvy vodíku.',
    step:[
      'Ponech výchozí hladinu na třetí a cílovou na druhé. Klikni na Spustit emisi a sleduj záblesk při přechodu i odlet fotonu. Energii v tomto případě určí zvolené hladiny.',
      'Pro absorpci nastav výchozí hladinu na druhou a cílovou na třetí. Čárkovanou čáru posuň přímo v grafu nebo posuvníkem, až se přichytí ke spektrální čáře zvoleného přechodu. Ovladač se zarovná na potřebnou energii $\\Delta E$. Pak klikni na Vyslat foton.',
      'Zkus vyslat ho i s energií dál od rezonance. Porovnej oba průlety a sleduj, zda se obsazená hladina změní.'
    ],
    calculation:{
      formula:String.raw`\lambda=\frac{hc}{|E_f-E_i|}`,
      explanation:'Energie fotonu je velikost rozdílu počáteční a konečné energie atomu $E_i$ a $E_f$. Planckova konstanta je $h$, rychlost světla $c$ a vlnová délka fotonu $\\lambda$.'
    },
    clue:'Přechod ze třetí na druhou hladinu dává červenou čáru asi $656\\,\\mathrm{nm}$. Při opačném přechodu se elektron dostane na vyšší hladinu po pohlcení fotonu naladěného na $\\Delta E$. Mimo rezonanci foton proletí a obsazená hladina se nezmění. Plynulé předání zvýraznění mezi drahami znázorňuje změnu stavu. Obě dráhy odpovídají diskrétním hladinám.',
    conclusion:'Každá čára odpovídá určitému rozdílu energií mezi dvěma povolenými stavy vodíku. Z vlnových délek čar tak lze zjistit rozdíly energií uvnitř atomu.'
  },
  {
    motivation:'Bohrovy povolené dráhy vysvětlily spektrum, jejich výběr ale vstupoval do modelu jako předpoklad. De Broglieho vztah mezi hybností a vlnovou délkou nabízí názorné vysvětlení, proč na uzavřené dráze vyhoví jen určité stavy.',
    goal:'Najdi dvojici poloměru a vlnové délky, při které může elektron podle Bohrova modelu zůstat ve stacionárním stavu.',
    scene:'Vlevo vybereš cílovou hladinu z barevných řádků. V diagramu je stejnou barvou zvýrazněná plná čára cíle. Čárkovaná čára ukazuje energii kruhového oběhu při zkoušeném poloměru. Vpravo sleduješ samotnou vlnu kolem jádra. Jakmile se její fáze ve Spoji potkají, vlna zezelená.',
    reason:'Poloměr mění obvod dráhy a vlnová délka mění, kolik vln se na něj vejde. Zelená vlna potvrzuje návaznost fáze. U vodíku musí vlnová délka zároveň odpovídat hybnosti, se kterou lze při daném poloměru obíhat kolem jádra.',
    step:[
      'Zkus poloměr $100\\,\\mathrm{pm}$ a vlnovou délku kolem $0{,}314\\,\\mathrm{nm}$. Posuvník se přichytí ke dvěma celým vlnám. Srovnej nastavenou vlnovou délku s odečtem $\\lambda_{\\text{pro oběh}}$.',
      'Vyber první cílovou hladinu. Táhni čárkovanou čáru v diagramu nebo použij posuvník poloměru. U $53\\,\\mathrm{pm}$ čárkovaná čára dosedne na plnou a obě kružnice se vpravo překryjí. Potom dolaď vlnovou délku kolem $0{,}333\\,\\mathrm{nm}$ a sleduj, kdy se objeví Povolená dráha vodíku.',
      'Vyber druhou cílovou hladinu a postup zopakuj poblíž $212\\,\\mathrm{pm}$. Odečty energie a frekvence pak ukazují, jaký foton vodík potřebuje pro přechod z první na druhou hladinu.'
    ],
    calculation:{
      formula:String.raw`p=\sqrt{\frac{\mu\kappa}{r}},\qquad \lambda=\frac{h}{p},\qquad \frac{2\pi r}{\lambda}=n`,
      explanation:'První vztah vychází z rovnosti dostředivé a Coulombovy síly. Značka $\\mu$ je redukovaná hmotnost elektronu a protonu, $\\kappa=e^2/(4\\pi\\varepsilon_0)$, $e$ je elementární náboj a $\\varepsilon_0$ permitivita vakua. Druhý vztah určí vlnovou délku z hybnosti a Planckovy konstanty $h$. Po celém obvodu se musí vejít kladný celý počet vln $n$.'
    },
    clue:'Při $100\\,\\mathrm{pm}$ může být spoj zelený a odečty kinetické energie se ještě liší. Na povolené dráze se shodnou. Druhý povolený poloměr je čtyřikrát větší a celková energie stavu vzroste zhruba z $-13{,}6\\,\\mathrm{eV}$ na $-3{,}4\\,\\mathrm{eV}$. Pro přechod je potřeba dodat přibližně $10{,}2\\,\\mathrm{eV}$.',
    conclusion:'Spojení Coulombovy přitažlivosti a návaznosti fáze určuje povolené poloměry $r_n=a_\\mu n^2$. $a_\\mu$ je Bohrova délka s korekcí na pohyb jádra. Bohr samostatným postulátem stanovil, že elektron ve stacionárním stavu průběžně nezáří. Nejkratší nastavitelná vlna leží u meze vazby na zvolené dráze. Frekvenci fotonu určuje rozdíl celkových energií hladin, $\\nu_{1\\to n}=(E_n-E_1)/h$.'
  },
  {
    motivation:'Vlnová mechanika nahradila představu jedné kruhové dráhy vázaným stavem v prostoru. Aby šlo tento stav porovnat s měřením, potřebujeme z vlnové funkce předpovědět četnost různých poloh.',
    goal:'Zjisti, kde bys při opakovaných měřeních nejčastěji našel elektron a kde ho v daném stavu vůbec nenaměříš.',
    scene:'Vlevo je pro srovnání základní stav vodíku. Vpravo vybíráš ze tří tvarů. Každá tečka je jeden možný výsledek měření polohy. Hustší části oblaku znamenají častější nálezy v malém objemu. Graf dole sčítá polohy podle vzdálenosti od jádra.',
    reason:'Chceš rozlišit, co se dovíš z tvaru oblaku a co z grafu vzdálenosti. Oblak ukáže i směr od jádra. Graf shrnuje všechny směry do jedné křivky.',
    step:[
      'Začni u $2\\mathrm{p}$. Zapni Otáčet oblaky a porovnej dva laloky s kulovým základním stavem vlevo. Najdi rovinu mezi laloky, v níž je hustota nulová.',
      'Přepni na $2\\mathrm{s}$. Najdi kulový uzel, který odděluje vnitřní a vnější část oblaku. V grafu je jeho vzdálenost vyznačena čárkovanou čarou.',
      'Vyber $1\\mathrm{s}$. Porovnej nejhustší místo oblaku u jádra s vyznačeným vrcholem grafu. Řez zapneš zaškrtávátkem Zobrazit řez. Fázi a další orbitaly najdeš pod Další stavy a zobrazení.'
    ],
    calculation:{
      formula:String.raw`w=|\psi|^2,\qquad \mathrm dP=P_r(r)\,\mathrm dr=r^2|R_{n\ell}(r)|^2\,\mathrm dr`,
      explanation:'Ze stavu $\\psi$ určíš pravděpodobnost na jednotku objemu $w$. Pravděpodobnost $\\mathrm dP$ v tenké slupce o tloušťce $\\mathrm dr$ určuje radiální hustota $P_r$. Faktor $r^2$ zohledňuje větší objem vzdálených slupek a $R_{n\\ell}$ je radiální část stavu s kvantovými čísly $n,\\ell$.'
    },
    clue:'Stav $2\\mathrm{p}$ má prázdnou rovinu mezi laloky. Stav $2\\mathrm{s}$ má kulový uzel při $r/a_\\mu=2$. Ve stavu $1\\mathrm{s}$ je hustota největší u jádra a graf vzdálenosti vrcholí kolem $r/a_\\mu=1$. Veličina $a_\\mu$ je Bohrova délka s korekcí na pohyb jádra.',
    conclusion:'Orbital předpovídá, jaké polohy naměříš v daném stavu. Prostorový oblak ukáže tvar i uzly. Graf vzdálenosti zahrnuje všechna místa na kulové slupce, proto může vrcholit i dál od nejhustší části oblaku.'
  },
  {
    motivation:'De Broglie předpověděl, že i elektron má vlnovou délku danou jeho hybností. Davisson a Germer hledali měřitelný projev této vlny. Jako terč použili monokrystal niklu, kovu, jehož atomy v krystalu tvoří pravidelnou prostorovou mřížku.',
    goal:'Máš jeden detektor a chceš zachytit co nejvíc elektronů. Najdi mu nejlepší místo. Pak zjisti, jestli tam může zůstat, když zvýšíš napětí.',
    scene:'Vlevo vidíš uspořádání atomů niklu. Vpravo letí elektrony kolmo na krystal. Detektor zachytává elektrony rozptýlené do směru, ve kterém právě stojí. Plná křivka ukazuje, jaký signál model předpovídá v jednotlivých směrech. Tečka označuje hodnotu v místě detektoru.',
    reason:'Kdyby změna napětí ovlivnila jen množství vyslaných elektronů, nejsilnější signál by přicházel ze stejného směru. Zkus ověřit, jestli se vrchol přesune, i když polohu krystalu ani detektoru nezměníš.',
    step:[
      'Nech urychlovací napětí na $54\\,\\mathrm{V}$. Pohybuj posuvníkem Úhel detektoru nebo táhni přímo v grafu. Sleduj společně polohu detektoru ve scéně a tečku na křivce.',
      'Přesuň tečku na nejvyšší vrchol. Detektor se v jeho okolí přichytí a na nejsilnějším směru zezelená. Odečti úhel.',
      'Tipni si, jestli detektor zůstane na nejlepším místě. Přibliž posuvník napětí k $72\\,\\mathrm{V}$, kde se přichytí, a nejdřív s detektorem nehýbej. Čárkovaná křivka ukazuje výchozí stav při $54\\,\\mathrm{V}$. Porovnej polohu obou vrcholů a pak přesuň detektor na nový vrchol.'
    ],
    calculation:{
      formula:String.raw`\lambda=\frac{h}{p}\approx\frac{h}{\sqrt{2m_e eU}},\qquad \text{údaj v grafu}=\frac{I(\theta)}{I_{\max}}`,
      explanation:'Planckova konstanta $h$ a hybnost $p$ určují vlnovou délku $\\lambda$. Vyšší urychlovací napětí $U$ dává elektronu větší hybnost. Ve vztahu je $m_e$ hmotnost elektronu a $e$ velikost jeho náboje. $\\theta$ je úhel detektoru od kolmice a $I(\\theta)$ je intenzita v tomto směru. Každá křivka má vlastní maximum $I_{\\max}$. Mezi křivkami proto porovnávej úhly vrcholů.'
    },
    clue:'V tomto modelu leží nejsilnější vrchol při $54\\,\\mathrm{V}$ v úhlu $43{,}9^\\circ$. Při $72\\,\\mathrm{V}$ se vlnová délka zkrátí zhruba z $0{,}167\\,\\mathrm{nm}$ na $0{,}145\\,\\mathrm{nm}$ a nejsilnější směr leží v úhlu $5{,}55^\\circ$.',
    conclusion:'Přes různé atomy urazí vlna k detektoru různé vzdálenosti. Tam, kde se vrcholy rozptýlených vln sejdou, je signál silný. Kratší vlnová délka znamená, že se vrcholy mohou sejít v jiném směru. Krystal tak umožňuje poznat vlnové chování elektronu podle toho, kam dopadá nejvíc elektronů.'
  },
  {
    motivation:'Nerelativistický popis elektronu přestával při vysokých rychlostech stačit. Dirac hledal kvantovou rovnici slučitelnou se speciální relativitou, která by zároveň popsala spin elektronu.',
    goal:'Poznej podle stopy, která částice má kladný náboj. Pak zjisti, jak moc se při vysoké hybnosti liší dva výpočty kinetické energie.',
    scene:'Vlevo jsou dvě matematické větve celkové energie. Čárkovaná čára označuje zvolenou hybnost. Vpravo letí elektron a pozitron stejným směrem do magnetického pole. Křížky označují pole do obrazovky, tečky pole ven. Značky v dolním grafu ukazují relativistickou a klasickou kinetickou energii při zvolené hybnosti.',
    reason:'Dráha umožní rozlišit opačné náboje, i když obě částice mají stejnou hmotnost a stejnou velikost hybnosti. Srovnáním energií uvidíš, proč bylo potřeba spojit kvantový popis s relativitou.',
    step:[
      'Ponech hybnost na $p=m_ec$ a pole směrem do obrazovky. Sleduj šipku vstupu zleva. Která stopa se stáčí vzhůru?',
      'Tipni si, co se stane po obrácení pole. Přepni ho směrem z obrazovky. Porovnej stopy a ověř, jestli se zároveň změnily hodnoty kinetické energie.',
      'Porovnej v dolním grafu značky při $p=0{,}25\\,m_ec$ a $p=3\\,m_ec$. Všimni si také, jak větší hybnost ovlivní zakřivení stop.'
    ],
    calculation:{
      formula:String.raw`\begin{gathered}\mathbf F=q\,\mathbf v\times\mathbf B,\quad r=\frac{p}{eB}\\ E_{\text{k, rel}}=\sqrt{p^2c^2+m_e^2c^4}-m_ec^2,\quad E_{\text{k, klas}}=\frac{p^2}{2m_e}\end{gathered}`,
      explanation:'Síla $\\mathbf F$ působí kolmo na rychlost $\\mathbf v$, takže mění směr letu. $q$ je náboj se znaménkem a $e$ jeho velikost. $B$ je velikost magnetické indukce $\\mathbf B$, $r$ poloměr dráhy a $p$ velikost hybnosti. $m_e$ je klidová hmotnost elektronu i pozitronu a $c$ rychlost světla. Od celkové energie se při výpočtu kinetické energie odečte klidová energie $m_ec^2$.'
    },
    clue:'Při poli do obrazovky se pozitron stáčí nahoru a elektron dolů. Po obrácení pole se stopy vymění, energetické značky zůstanou na místě. S větší hybností rostou poloměry drah. Při $p=3\\,m_ec$ vychází přibližně $1{,}10\\,\\mathrm{MeV}$ relativisticky a $2{,}30\\,\\mathrm{MeV}$ klasicky.',
    conclusion:'Znáš-li směr letu a pole, směr zakřivení prozradí znaménko náboje. Pozitron má kladný náboj a při stejné hybnosti stejnou kladnou fyzikální energii jako elektron. Klasický výpočet při vysoké hybnosti energii výrazně nadhodnocuje.'
  },
  {
    motivation:'Difrakce svazku ukázala vlnové chování elektronů. Jednotlivé detekce umožnily zjistit, zda se interferenční obrazec skládá i tehdy, když elektrony procházejí aparaturou postupně po jednom.',
    goal:'Sestav ze zásahů interferenční obrazec a porovnej ho se statistickou směsí dvou samostatných průchodů.',
    scene:'Vlevo vidíš clonu se štěrbinami. Vpravo se na stínítku objevují jednotlivé záchyty. V grafu zelená křivka ukazuje očekávané rozložení a okrové sloupce záchyty z tvé série. Místa s málo zásahy mezi dvěma vrcholy jsou interferenční minima.',
    reason:'Prověříš, jestli stejný obrazec vznikne společnou vlnovou přípravou a obyčejným smícháním zásahů z jednoho či druhého otvoru.',
    step:[
      'Zvol Obě koherentně a klikni na Jeden elektron. Sleduj, zda na stínítku přibude bod. Potom klikni na Tisíc elektronů a najdi v grafu směry, kde je zásahů málo.',
      'Přepni na Nekoherentní směs a zopakuj dávku při stejné geometrii. Porovnej, co se stalo s místy, kde předtím skoro žádné zásahy nebyly.',
      'Změň vzdálenost štěrbin. Při tažení sleduj clonu a po puštění posuvníku se podívej na nově vypočtené rozložení.'
    ],
    calculation:{
      formula:String.raw`\begin{aligned} w_{\text{koher}}&\propto|\psi_1+\psi_2|^2\\[3pt] w_{\text{směs}}&\propto|\psi_1|^2+|\psi_2|^2\end{aligned}`,
      explanation:'Amplitudy $\\psi_1$ a $\\psi_2$ označují příspěvky z obou otvorů v názorném popisu na detektoru. U koherentní přípravy záleží na jejich relativní fázi. Ve stejně vážené směsi se sčítají pravděpodobnosti. Symbol $\\propto$ ponechává stranou normalizaci.'
    },
    clue:'Počet vyslaných elektronů roste při každém průchodu. Detektor zachytí jen část svazku. V koherentní přípravě se až s mnoha zásahy ukážou výrazná minima, která se ve směsi mohou vyplnit.',
    conclusion:'Interferenční obrazec může vzniknout i z jednotlivých zásahů. Při koherentní přípravě určuje jejich četnost součet amplitud včetně vzájemné fáze. Ve směsi se sčítají četnosti obou samostatných příprav a minima se vyplní.'
  },
  {
    motivation:'V kvantové teorii pole je elektron jedním kvantem elektronového pole. Jeden takto připravený elektron můžeš při měření najít na různých místech. To, jak široce jsou možná místa rozložená, závisí na přípravě.',
    goal:'Zjisti, jestli lze stejným způsobem zpřesnit polohu i hybnost elektronu.',
    scene:'Posuvník mění nejistotu hybnosti zobrazenou vlevo. Vpravo každý bod představuje jedno měření polohy na novém, stejně připraveném elektronu. Odečítej vodorovnou souřadnici bodu. Pod body je vidět předpověď pravděpodobnosti a vyznačená nejistota polohy. Výsledky měření se losují pro zobrazený výřez.',
    reason:'Změnou přípravy zkoušíš, zda užšímu rozdělení jedné veličiny odpovídá užší, nebo širší rozdělení druhé.',
    step:[
      'V počátečním stavu klikni na Změřit jednou. Vpravo přibude jediný bod. Klikni na Zopakovat stokrát a všimni si, kolem kterých poloh se body nahromadí.',
      'Zvyš Nejistotu hybnosti z $0{,}25\\,m_ec$ na $0{,}50\\,m_ec$ a zopakuj měření. Fialové body výchozí série zůstanou v horním řádku. Modré body nové série přibývají přímo pod nimi. Porovnej vodorovnou šířku obou shluků a obě křivky v grafu.',
      'Tlačítkem Přehrát můžeš sledovat posun a rozšiřování balíku. Při kliknutí na měření se čas zastaví, aby všechny body patřily ke stejnému okamžiku.'
    ],
    calculation:{
      formula:String.raw`\Delta x\,\Delta p\geq\frac{\hbar}{2}`,
      explanation:'Značky $\\Delta x$ a $\\Delta p$ označují směrodatné odchylky polohy a hybnosti. Redukovaná Planckova konstanta je $\\hbar$. Počáteční gaussovský stav má součin blízko dolní meze. Osa polohy používá jednotku $\\bar\\lambda_C=\\hbar/(m_ec)$, kde $m_e$ je hmotnost elektronu a $c$ rychlost světla.'
    },
    clue:'Po zdvojnásobení počátečního rozptylu hybnosti se předpovězený rozptyl polohy přibližně zmenší na polovinu. Rozdíl uvidíš na rozestupu bodů i na šířce křivek v pevném měřítku.',
    conclusion:'V tomto balíku získáš přesnější počáteční polohu za cenu větší nejistoty hybnosti. Šířka obálky popisuje, jak byl stav elektronu připraven.'
  },
  {
    motivation:'Když chceš zkoumat velmi malý objekt, můžeš na něj vyslat částici a změřit její rozptyl. Představ si foton namířený na volný elektron. Foton se odkloní a elektron odletí s hybností, kterou mu foton předal.',
    goal:'Ověř, který z ovladačů mění nejmenší délku, již může sonda rozlišit.',
    scene:'Vlevo vidíš rozptyl fotonu na elektronu. Vpravo se přibližuješ od elektronového oblaku vodíku k protonu. Na konci se objeví názorný model dvou kvarků $u$, jednoho kvarku $d$ a gluonového pole. Rozlišitelnou délku ukazuje jantarová úsečka. Teplý závoj označuje výřez menší než rozlišení nastavené sondy.',
    reason:'Prověříš rozdíl mezi zobrazeným výřezem a rozlišením, které skutečně poskytuje sonda.',
    step:[
      'Sleduj vlevo, co přilétá k elektronu a kam se foton po rozptylu odkloní. Přenos závisí na změně velikosti i směru hybnosti fotonu.',
      'Stiskni Spustit průlet k jádru. Při přibližování sleduj, kdy výřez klesne pod mez rozlišení. U konečného pohledu rozliš názorný model kvarků od údaje o rozlišení sondy. Pohyb modelu můžeš pozastavit.',
      'Nastav Zorné pole na $10^{-13}\\,\\mathrm{m}$ a zvyš Přenos hybnosti z $10^7\\,\\mathrm{eV}/c$ na $10^8\\,\\mathrm{eV}/c$. Porovnej délku úsečky a odečet $\\Delta x$.'
    ],
    calculation:{
      formula:String.raw`\Delta x\sim\frac{\hbar c}{qc}`,
      explanation:'Označ hybnost příchozího fotonu $\\mathbf p_{\\text{před}}$ a hybnost rozptýleného fotonu $\\mathbf p_{\\text{po}}$. Elektron získá hybnost $\\mathbf q=\\mathbf p_{\\text{před}}-\\mathbf p_{\\text{po}}$. Ovladač udává velikost $q=|\\mathbf q|$ v $\\mathrm{eV}/c$. Graf používá součin $qc$ v elektronvoltech. Značky $c$ a $\\hbar$ jsou rychlost světla a redukovaná Planckova konstanta. $\\Delta x$ odhaduje nejmenší rozlišitelnou délku.'
    },
    clue:'Desetinásobný přenos hybnosti zlepší odhad rozlišení desetkrát. Samotná změna zorného pole posune pohled na scénu a odečet $\\Delta x$ zůstane stejný.',
    conclusion:'Menší struktury můžeš hledat větším přenosem hybnosti. Zvětšení obrazu mění jen zobrazený výřez. Výsledek rozptylu vypovídá o struktuře elektronu pouze do meze rozlišení sondy.'
  }
];
