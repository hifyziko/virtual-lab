const ElectronSources = ["https://doi.org/10.1080/14786449708621070","https://history.aip.org/exhibits/electron/","https://doi.org/10.1080/14786440409463107","https://doi.org/10.1002/andp.201300732","https://web.mit.edu/8.13/8.13c/references-fall/rutherford/rutherford-scattering-of-alpha-and-beta-particles.pdf","https://doi.org/10.1080/14786441308634955","https://openstax.org/books/university-physics-volume-3/pages/6-4-bohrs-model-of-the-hydrogen-atom","https://physics.nist.gov/PhysRefData/Handbook/Tables/hydrogentable2.htm","https://www.nobelprize.org/uploads/2016/04/broglie-lecture.pdf","https://openstax.org/books/university-physics-volume-3/pages/8-1-the-hydrogen-atom","https://books.physics.oregonstate.edu/GCF/hydroform.html","https://www.nobelprize.org/uploads/2018/06/born-lecture.pdf","https://doi.org/10.1103/PhysRev.30.705","https://www.math.ucsd.edu/~nwallach/Dirac1928.pdf","https://www.damtp.cam.ac.uk/user/tong/qft/qfthtml/S4.html","https://doi.org/10.1119/1.16104","https://doi.org/10.1088/1367-2630/15/3/033018","https://digitalcommons.unl.edu/physicsfacpub/105/","https://www.damtp.cam.ac.uk/user/tong/qft.htm","https://www.damtp.cam.ac.uk/user/tong/qft/qfthtml/S0.html","https://www.damtp.cam.ac.uk/user/tong/qft/qfthtml/S6.html","https://physics.nist.gov/cuu/Constants/","https://pdg.lbl.gov/","https://phet.colorado.edu/en/simulations/models-of-the-hydrogen-atom","https://github.com/phetsims/models-of-the-hydrogen-atom","https://github.com/phetsims/models-of-the-hydrogen-atom/blob/main/doc/model.md","https://www.jlab.org/physics/visualizingthequantumworld","https://github.com/Niuskir/Electron-Orbitals-Blender-3D","https://github.com/Niuskir/orbitals","https://github.com/shianjeng/quantum-wave-lab","https://github.com/francisco-kim/DoubleSlitSimulator","https://www.nist.gov/pml/atomic-spectra-database"];
/* Controls: key, Czech caption, range and initial value, KaTeX unit; or a list of choices. */
const electronAndersonSource=ElectronSources.push('https://journals.aps.org/pr/abstract/10.1103/PhysRev.43.491')-1;
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
{year:'1924',title:'Vlna se musí uzavřít',caption:'Fáze na kružnici a volný vlnový balík',controls:[['U','Urychlovací napětí',10,200,1,54,'V'],['r','Poloměr',30,250,1,80,'pm'],['sigma','Šířka balíku',.15,.8,.01,.4,'nm'],['view','Zobrazení',['Uzavřená fáze','Volný balík']]],
story:'Když světlo přenáší hybnost v jednotlivých kvantech, mohla by mít i hmota vlnovou délku? De Broglie spojil hybnost s prostorovou periodou fáze. Po oběhu uzavřené dráhy se musí fáze reprodukovat.',
task:'Měň poloměr a sleduj spoj křivky po jednom oběhu. V režimu balíku sleduj pohyb obálky a hřebenů uvnitř ní. Širší balík vyžaduje užší rozdělení hybnosti.',
eq:['\\lambda=h/p,\\quad pc=\\sqrt{eU(eU+2m_ec^2)}','\\Delta\\varphi=2\\pi(2\\pi r/\\lambda),\\quad pr=n\\hbar'],detail:'Kružnice je semiklasická analogie. Volný balík používá nerelativistickou Gaussovu obálku s disperzí. S kinetickou energií jako nulou klidové fáze je fázová rychlost p/(2m) a grupová p/m. Při započtení klidové energie se fázová rychlost změní.',src:[8,13]},
{year:'1926',title:'Kde elektron naměříme?',caption:'Vodíkové orbitaly • Bornova interpretace',controls:[['state','Orbital',['1s','2s','2p z','2p x','2p y','2p m=1','3s','3p z','3d z²','3d m=2']],['quality','Jemnost objemu',['Běžná','Jemná']],['view','Zobrazení',['Výsledky měření','Objem hustoty','Izoplocha hustoty','Pohyblivý řez','Fáze','Srovnání s Bohrem']],['cut','Poloha řezu',-.8,.8,.02,0,'R_{\\mathrm{okna}}'],['level','Hladina izoplochy',.01,.8,.01,.12,'w_{\\max}'],['mix','Podíl druhého stavu',0,1,.02,0,''],['phase','Relativní fáze',0,360,2,0,'{}^\\circ']],
story:'Schrödinger našel stacionární vlny v Coulombově poli. Born přiřadil jejich čtverci význam pravděpodobnosti na jednotku objemu. Každý bod oblaku je jedna poloha v jiné, stejně připravené soustavě. Uzly vznikají tam, kde amplituda vymizí.',
task:'Začni stavem 1s. Porovnej hustotu u jádra s pravděpodobností v kulové slupce. Přepni na 2s a vyhledej kulový uzel. Přimíchej druhý stav a měň relativní fázi. V čase pak sleduj interferenční člen hustoty.',
eq:['\\psi=R_{n\\ell}Y_\\ell^m,\\quad w=|\\psi|^2,\\quad P_r=r^2|R_{n\\ell}|^2','\\Psi=\\sqrt{1-f}\\,\\psi_a+\\sqrt f\\,e^{i(\\varphi-\\Delta E t/\\hbar)}\\psi_b'],detail:'Druhým stavem je 2p z, případně 1s, pokud už je zvolen 2p z. Izoplocha udává podíl maximální hustoty v zobrazené mřížce. Barva fáze rozlišuje fáze amplitudy, elektrický náboj je všude záporný. Objem i statistika mají konečné zorné pole.',src:[9,10,11]},
{year:'1927',title:'Niklový krystal jako mřížka',caption:'Kinematická difrakce na konečném krystalu',controls:[['U','Urychlovací napětí',20,160,1,54,'V'],['inc','Odklon dopadu od normály',-30,30,1,0,'{}^\\circ'],['det','Detektor od normály',0,85,1,50,'{}^\\circ']],
story:'Davisson a Germer měřili směr, ve kterém z monokrystalu niklu vystupují téměř pružně rozptýlené elektrony. V původní geometrii dopadal svazek kolmo na plochu (111). Výrazná maxima se měnila s napětím. Fáze příspěvků od různých atomů se mohla sejít právě ve směru detektoru.',
task:'Při pevném napětí projdi detektorem přes maximum. Pak změň napětí. Změnila se vlnová délka i podmínka pro konstruktivní interferenci.',
eq:['A(\\mathbf q)=\\sum_j e^{i\\mathbf q\\cdot\\mathbf R_j},\\quad I=|A|^2','\\mathbf q=\\mathbf k_f-\\mathbf k_i,\\quad |\\mathbf k|=2\\pi/\\lambda'],detail:'Geometrie používá konečný výřez fcc niklu s normálou [111]. Všechny atomové rozptylové faktory jsou rovny jedné. Povrchová rekonstrukce, vnitřní potenciál a vícenásobný rozptyl mění skutečné nízkoenergetické spektrum. Výška píků slouží pro srovnání uvnitř modelu.',src:[12]},
{year:'1928–1932',title:'Dvě větve energie',caption:'Volná Diracova rovnice',controls:[['p','Hybnost',0,4,.01,1,'m_ec']],
story:'Schrödingerova kinetická energie roste kvadraticky s hybností. Dirac hledal rovnici slučitelnou s relativitou. Její volná řešení mají dvě energetické větve a spinorovou strukturu. Spin jedna polovina je vnitřní vlastnost elektronu. Dirac předpověděl antičástici elektronu. Carl Anderson ji v roce 1932 rozpoznal podle stopy v mlžné komoře v magnetickém poli.',
task:'Začni blízko nulové hybnosti. Porovnej kinetické energie po odečtení klidové energie. Posouvej hybnost výše a sleduj, jak rychle se klasická parabola vzdaluje.',
eq:['i\\hbar\\partial_t\\Psi=(c\\boldsymbol\\alpha\\cdot\\hat{\\mathbf p}+\\beta m_ec^2)\\Psi','E_\\pm=\\pm\\sqrt{p^2c^2+m_e^2c^4}'],detail:'Záporná větev byla historickým interpretačním problémem. Kvantování Diracova pole dává vznik operátorům tvorby antičástic. Pozitron má kladnou energii, stejnou klidovou hmotnost a opačný náboj.',src:[13,14,electronAndersonSource]},
{year:'1989 / 2013',title:'Jedna detekce za druhou',caption:'Dvojštěrbina • časový vývoj ve dvou rozměrech',controls:[['mode','Příprava',['Obě koherentně','Horní štěrbina','Dolní štěrbina','Nekoherentní směs']],['width','Šířka otvoru',1,2,.25,1.5,'nm'],['gap','Vzdálenost středů',3,6,.25,4,'nm'],['energy','Energie svazku',.12,.5,.02,.3,'eV'],['view','Detektor',['Hustota','Reálná amplituda','Jednotlivé zásahy']],['quality','Výpočetní mřížka',['96 × 96','128 × 128']]],
story:'Jednotlivý průchod končí lokalizovanou detekcí. Mnoho stejně připravených elektronů vytvoří rozdělení, které závisí na tom, zda jsou obě cesty koherentní. Tonomura použil elektronový biprizmatický interferometr. Bach a spoluautoři ovládali dvě skutečné štěrbiny.',
task:'Otevři obě štěrbiny a přidávej zásahy. Pak zvol statistickou směs dvou samostatných příprav. Minimum může při ztrátě koherence zmizet. Jedna tečka na stínítku neprozradí předchozí klasickou dráhu.',
eq:['i\\hbar\\partial_t\\psi=[-\\hbar^2\\nabla^2/(2m_e)+V-iW]\\psi','P_{\\rm det}(y)=\\int (2W_{\\rm det}/\\hbar)|\\psi|^2\\,\\mathrm dx\\,\\mathrm dt'],detail:'Gaussův balík dopadá na konečnou bariéru. Absorbér na pravém okraji zaznamenává úbytky pravděpodobnosti, ostatní okraje ji odvádějí. Počet vypuštěných elektronů zahrnuje i ty, které detektor nezachytí. Směs průměruje dvě samostatná řešení s jedním otvorem.',src:[15,16,17]},
{year:'Současnost',title:'Kvantum elektronového pole',caption:'Volný jednočásticový stav s určeným spinem',controls:[['p','Střední hybnost',0,3,.05,1,'m_ec'],['width','Šířka v hybnosti',.1,.6,.01,.25,'m_ec']],
story:'Dnes je elektron elementární fermion se záporným elementárním nábojem, nenulovou klidovou hmotností a spinem jedna polovina. V kvantové teorii pole je kvantem elektronového pole. V jednočásticovém sektoru lze připravit prostorově rozprostřený stav.',
task:'Zvětši rozptyl hybnosti a sleduj počáteční šířku balíku. Pusť čas a porovnej pohyb jeho středu při různých hybnostech. Bodová interakce ve standardním modelu připouští i rozlehlý kvantový stav.',
eq:['E_p^2=p^2c^2+m_e^2c^4','\\Psi(x,t)=\\int a(p)u(p)e^{i(px-E_pt)/\\hbar}\\,\\mathrm dp/\\sqrt{2\\pi\\hbar}'],detail:'Jednorozměrná superpozice kladných energií má pevnou spinovou polarizaci. Graf zobrazuje součet čtverců spinorových amplitud. Operátorové pole a tvorba párů vyžadují širší formalismus.',src:[14,18,19,20]},
{year:'Měřítka',title:'Jak velký je elektron?',caption:'Logaritmická cesta od atomu k rozlišení sondy',controls:[['zoom','Zorné pole • mocnina deseti',-20,-9,.05,-10,''],['q','Přenos hybnosti • logaritmus',2,14,.05,7,'\\log_{10}(qc/\\mathrm{eV})']],
story:'Rozměr orbitalu popisuje připravený stav. Redukovaná Comptonova délka spojuje hmotnost s relativistickou kvantovou škálou. Klasický poloměr vzniká porovnáním elektrostatické energie s klidovou energií. Každá z těchto délek odpovídá jiné otázce.',
task:'Změň zvlášť zorné pole a přenos hybnosti. Pouze druhým ovladačem měníš odhad rozlišení experimentu. V detailu se neobjeví povrch elektronu. Jak lze přitom naměřit elektron na různých místech?',
eq:['a_0=\\hbar^2/(m_e\\kappa),\\quad \\bar\\lambda_C=\\hbar/(m_ec),\\quad r_e=\\kappa/(m_ec^2)','\\Delta x\\sim\\hbar/q'],detail:'Standardní model zachází s elektronem jako s bodovou částicí bez známé vnitřní struktury. Přenos hybnosti určuje řád rozlišení sondy. Převod mezí konkrétních modelů kompozitnosti na geometrický poloměr není univerzální.',src:[21,22,19]}
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
    scene:'Jádro je ve společném středu obou nakreslených drah. Zvýrazněná dráha patří právě obsazené hladině. Při přechodu dolů se od místa, kde elektron opustil vyšší dráhu, šíří vlnový balík znázorňující foton. Svislé čáry v grafu označují vlnové délky.',
    reason:'Zkoušíš, zda vybrané energetické hladiny dokážou vysvětlit konkrétní barvy vodíku.',
    step:'Ponech Cílovou hladinu na druhé a spusť pokus s Výchozí hladinou na třetí. Sleduj, odkud vyletí foton a kde po přechodu zůstane elektron. Pak zvyšuj Výchozí hladinu a porovnej zvýrazněné čáry v grafu. Chceš-li znovu vidět okamžik emise, použij Od začátku.',
    calculation:{
      formula:String.raw`\lambda=\frac{hc}{|E_f-E_i|}`,
      explanation:'Energie fotonu je velikost rozdílu počáteční a konečné energie atomu $E_i$ a $E_f$. Planckova konstanta je $h$, rychlost světla $c$ a vlnová délka fotonu $\\lambda$.'
    },
    clue:'Přechod ze třetí na druhou hladinu dává červenou čáru asi $656\\,\\mathrm{nm}$. Při větším rozdílu energií se čára posune ke kratším vlnovým délkám.',
    conclusion:'Každá čára odpovídá určitému rozdílu energií mezi dvěma povolenými stavy vodíku. Z vlnových délek čar tak lze zjistit rozdíly energií uvnitř atomu.'
  },
  {
    motivation:'Bohrovy povolené dráhy vysvětlily spektrum, jejich výběr ale vstupoval do modelu jako předpoklad. De Broglieho vztah mezi hybností a vlnovou délkou nabízí názorné vysvětlení, proč na uzavřené dráze vyhoví jen určité stavy.',
    goal:'Najdi poloměr, při kterém fáze vlny po oběhu plynule naváže na svůj začátek.',
    scene:'Křivka na obvodu kreslí fázi vlny. Popisek Spoj označuje místo, kde kruh uzavíráš.',
    reason:'Vlnová představa dává názorný důvod, proč na kružnici vyhovují jen určité kombinace poloměru a hybnosti.',
    step:'Při urychlovacím napětí $54\\,\\mathrm{V}$ vyzkoušej poloměr kolem $80\\,\\mathrm{pm}$. Měň poloměr a sleduj spoj. Potom změň urychlovací napětí.',
    calculation:{
      formula:String.raw`\lambda=\frac{h}{p},\qquad \frac{2\pi r}{\lambda}=j\quad (j\in\mathbb Z)`,
      explanation:'Vlnovou délku $\\lambda$ určuje hybnost elektronu $p$ a Planckova konstanta $h$. Obvod kružnice o poloměru $r$ musí obsahovat celý počet vln $j$.'
    },
    clue:'Při $54\\,\\mathrm{V}$ vyjde $\\lambda\\approx0{,}167\\,\\mathrm{nm}$. Okolo poloměru $80\\,\\mathrm{pm}$ se posuvník přichytí k hodnotě, při které spoj plynule naváže a na kružnici vyjdou tři vlny. Mimo okolí této hodnoty uvidíš ve spoji nesoulad.',
    conclusion:'Při dané hybnosti se fáze uzavře jen na kružnicích, do jejichž obvodu se vejde celý počet vln. Tato podmínka názorně vysvětluje výběr určitých poloměrů v modelu s kružnicí.'
  },
  {
    motivation:'Vlnová mechanika nahradila představu jedné kruhové dráhy vázaným stavem v prostoru. Aby šlo tento stav porovnat s měřením, potřebujeme z vlnové funkce předpovědět četnost různých poloh.',
    goal:'Porovnej nejhustší část oblaku s vrcholem grafu vzdálenosti od jádra a najdi v orbitalu místo s nulovou hustotou.',
    scene:'Každá tečka představuje možnou naměřenou polohu. Graf sčítá pravděpodobnost v tenkých kulových slupkách podle vzdálenosti od jádra.',
    reason:'Zkoušíš rozlišit dvě otázky. Jak pravděpodobná je poloha v malém objemu a jak pravděpodobná je určitá vzdálenost od jádra?',
    step:'Vyber orbital $1\\mathrm{s}$ a srovnej střed oblaku s vrcholem grafu. Pak přepni na $2\\mathrm{s}$ a vyhledej pokles v grafu.',
    calculation:{
      formula:String.raw`w=|\psi|^2,\qquad \mathrm dP=P_r(r)\,\mathrm dr=r^2|R_{n\ell}(r)|^2\,\mathrm dr`,
      explanation:'Ze stavu $\\psi$ určíš pravděpodobnost na jednotku objemu $w$. Pravděpodobnost $\\mathrm dP$ v tenké slupce o tloušťce $\\mathrm dr$ určuje radiální hustota $P_r$. Faktor $r^2$ zohledňuje větší objem vzdálených slupek a $R_{n\\ell}$ je radiální část stavu s kvantovými čísly $n,\\ell$.'
    },
    clue:'Ve stavu $1\\mathrm{s}$ je prostorová hustota největší u jádra, zatímco radiální graf vrcholí kolem $r/a_\\mu=1$. Ve stavu $2\\mathrm{s}$ najdeš uzel při $r/a_\\mu=2$. Veličina $a_\\mu$ je Bohrova délka s korekcí na pohyb jádra.',
    conclusion:'Pravděpodobnost určité vzdálenosti zahrnuje všechna místa na kulové slupce, proto má graf jiné maximum než prostorová hustota. Uzel je místo, kde hustota pravděpodobnosti klesá k nule.'
  },
  {
    motivation:'Vlnovou délku elektronu lze ověřit rozptylem na pravidelně uspořádaných atomech. Davisson a Germer proto měřili, v jakých směrech se od monokrystalu niklu rozptylují elektrony o různých rychlostech.',
    goal:'Najdi směr nejsilnějšího rozptylu a sleduj, kam se maximum posune po změně napětí.',
    scene:'Modré body označují atomy niklu. Graf ukazuje, kolik rozptýleného svazku detektor najde v různých směrech.',
    reason:'Zkoušíš, zda na posun intenzity stačí představa jedné dráhy, nebo zda výsledek určují fáze vln od mnoha atomů.',
    step:'Najdi výrazné maximum v grafu. Namiř tam detektor a změň urychlovací napětí.',
    calculation:{
      formula:String.raw`\lambda=\frac{h}{p},\qquad \frac{I}{N^2}=\left|\frac1N\sum_{j=1}^{N}\exp\!\bigl(i(\mathbf k_f-\mathbf k_i)\cdot\mathbf R_j\bigr)\right|^2`,
      explanation:'Planckova konstanta $h$ a hybnost $p$ určují vlnovou délku $\\lambda$. Vektory $\\mathbf k_i$ a $\\mathbf k_f$ popisují dopadající a rozptýlenou vlnu. Poloha každého atomu $\\mathbf R_j$ určuje jeho fázový příspěvek. Z jejich součtu získáš normalizovanou intenzitu $I/N^2$ pro $N$ atomů. Značka $i$ je imaginární jednotka.'
    },
    clue:'Při $54\\,\\mathrm{V}$ vyjde $\\lambda\\approx0{,}167\\,\\mathrm{nm}$. Se zvýšením napětí se vlnová délka zkrátí a některá maxima v úhlovém grafu změní polohu nebo výšku.',
    conclusion:'Výrazná maxima vznikají ve směrech, kde se rozptýlené vlny vzájemně zesílí. Změnou hybnosti se změní jejich vlnová délka a tím i podmínky zesílení. Úhlový graf tak umožňuje vlnovou povahu elektronů ověřit.'
  },
  {
    motivation:'Nerelativistický popis elektronu přestával při vysokých rychlostech stačit. Dirac hledal kvantovou rovnici slučitelnou se speciální relativitou, která by zároveň popsala spin elektronu.',
    goal:'Zjisti, při jakých hybnostech se už viditelně liší klasická a relativistická kinetická energie.',
    scene:'Horní scéna ukazuje dvě větve řešení Diracovy rovnice. V dolním grafu jsou klasická a relativistická kinetická energie.',
    reason:'Zjistíš, v jaké oblasti můžeš při výpočtu energie dál používat jednoduché klasické přiblížení.',
    step:'Začni téměř u nulové hybnosti a pomalu ji zvětšuj. Porovnej obě křivky dole.',
    calculation:{
      formula:String.raw`\begin{aligned} E_{\text{k, rel}}&=\sqrt{p^2c^2+m_e^2c^4}-m_ec^2\\[3pt] E_{\text{k, klas}}&=\frac{p^2}{2m_e}\end{aligned}`,
      explanation:'Pro stejnou hybnost $p$ počítáš kinetickou energii dvěma způsoby. V relativistickém vztahu odečteš od celkové energie klidovou energii $m_ec^2$. Značky $m_e$ a $c$ označují klidovou hmotnost elektronu a rychlost světla.'
    },
    clue:'U malých hybností jsou křivky blízko sebe. Pro $p=m_ec$ je relativistická kinetická energie asi $0{,}212\\,\\mathrm{MeV}$ a klasický výpočet dává $0{,}255\\,\\mathrm{MeV}$.',
    conclusion:'Při malé hybnosti stačí klasický vztah. Když se hybnost blíží měřítku $m_ec$, klasický výpočet energii výrazně nadhodnocuje. Pro takové elektrony použij relativistický vztah.'
  },
  {
    motivation:'Difrakce svazku ukázala vlnové chování elektronů. Jednotlivé detekce umožnily zjistit, zda se interferenční obrazec skládá i tehdy, když elektrony procházejí aparaturou postupně po jednom.',
    goal:'Sestav ze zásahů interferenční obrazec a porovnej ho se statistickou směsí dvou samostatných průchodů.',
    scene:'Svazek prochází otvory v cloně a končí v detektoru. Graf ukazuje rozdělení záchytů podél stínítka.',
    reason:'Prověříš, jestli stejný obrazec vznikne společnou vlnovou přípravou a obyčejným smícháním zásahů z jednoho či druhého otvoru.',
    step:'Zvol Obě koherentně a klikni na Jeden elektron. Po průchodu vlnového balíku sleduj, zda detektor přidal zásah. Potom přidej Tisíc elektronů. Přepni na Nekoherentní směs a zopakuj dávku při stejné geometrii.',
    calculation:{
      formula:String.raw`\begin{aligned} w_{\text{koher}}&\propto|\psi_1+\psi_2|^2\\[3pt] w_{\text{směs}}&\propto|\psi_1|^2+|\psi_2|^2\end{aligned}`,
      explanation:'Amplitudy $\\psi_1$ a $\\psi_2$ označují příspěvky z obou otvorů v názorném popisu na detektoru. U koherentní přípravy záleží na jejich relativní fázi. Ve stejně vážené směsi se sčítají pravděpodobnosti. Symbol $\\propto$ ponechává stranou normalizaci.'
    },
    clue:'Počet vyslaných elektronů roste při každém průchodu. Detektor zachytí jen část svazku. V koherentní přípravě se až s mnoha zásahy ukážou výrazná minima, která se ve směsi mohou vyplnit.',
    conclusion:'Interferenční obrazec může vzniknout i z jednotlivých zásahů. Při koherentní přípravě určuje jejich četnost součet amplitud včetně vzájemné fáze. Ve směsi se sčítají četnosti obou samostatných příprav a minima se vyplní.'
  },
  {
    motivation:'Relativistická kvantová teorie popisuje elektron i jako částicový stav pole. Při přípravě jednoho elektronu potřebujeme rozlišit prostorový rozsah tohoto stavu od otázky vnitřní struktury částice.',
    goal:'Zjisti, jak změna šířky rozdělení hybnosti ovlivní počáteční šířku vlnového balíku.',
    scene:'Obálka představuje hustotu jednočásticového stavu. Graf ji vykresluje podél směru pohybu.',
    reason:'Zkoušíš, jak souvisí příprava hybnosti s tím, jak přesně lze na začátku určit polohu.',
    step:'Pozastav animaci, dej Od začátku a zvyš Šířku v hybnosti. Porovnej vzdálenost od středu k bodům na stejné výšce obálky podle čísel na vodorovné ose.',
    calculation:{
      formula:String.raw`\Delta x\,\Delta p\geq\frac{\hbar}{2}`,
      explanation:'Značky $\\Delta x$ a $\\Delta p$ označují směrodatné odchylky polohy a hybnosti. Redukovaná Planckova konstanta je $\\hbar$. Pro jednoduchý gaussovský stav v počátečním čase je součin blízko dolní meze.'
    },
    clue:'Širší rozdělení hybnosti dává na začátku užší obálku polohy. Protože se osa grafu přizpůsobuje, porovnej číselnou šířku na ose.',
    conclusion:'V tomto balíku získáš přesnější počáteční polohu za cenu větší nejistoty hybnosti. Šířka obálky popisuje, jak byl stav elektronu připraven.'
  },
  {
    motivation:'Otázku, zda má elektron vnitřní strukturu, lze zkoumat rozptylem při vysokém přenosu hybnosti. K interpretaci měření potřebuješ vědět, jak malé vzdálenosti daná sonda vůbec rozliší.',
    goal:'Ověř, který z ovladačů mění nejmenší délku, již může sonda rozlišit.',
    scene:'V obraze se střídají fyzikální délková měřítka. Graf dole ukazuje odhad rozlišení podle přenosu hybnosti.',
    reason:'Prověříš rozdíl mezi zobrazeným výřezem a rozlišením, které skutečně poskytuje sonda.',
    step:'Nejprve změň jen Zorné pole. Potom ponech stejný výřez a zvyš Přenos hybnosti.',
    calculation:{
      formula:String.raw`\Delta x\sim\frac{\hbar c}{qc}`,
      explanation:'Přenos hybnosti je $q$, rychlost světla $c$ a redukovaná Planckova konstanta $\\hbar$. Graf používá veličinu $qc$ v jednotkách energie. Vztah odhaduje nejmenší rozlišitelnou délku $\\Delta x$.'
    },
    clue:'Desetinásobný přenos hybnosti zlepší odhad rozlišení desetkrát. Samotná změna zorného pole posune pohled na scénu a odečet $\\Delta x$ zůstane stejný.',
    conclusion:'Menší struktury můžeš hledat větším přenosem hybnosti. Zvětšení obrazu mění jen zobrazený výřez. Výsledek rozptylu vypovídá o struktuře elektronu pouze do meze rozlišení sondy.'
  }
];
