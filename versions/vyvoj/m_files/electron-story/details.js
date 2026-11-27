const ElectronDetails=[
  "Napětí $U$ před vstupem do polí udává přírůstek energie $eU$. Hybnost $\\mathbf p$ má jednotku $\\mathrm{kg\\,m/s}$, rychlost $\\mathbf v$ jednotku $\\mathrm{m/s}$. Oranžové šipky ukazují elektrické pole $\\mathbf E$ v $\\mathrm{V/m}$, modré magnetickou indukci $\\mathbf B$ v teslech. Šipky u částice ukazují rychlost a oba příspěvky síly.",
  "Koule o poloměru $R$ nese náboj $Q=Ne$, kde $N$ je počet elektronů. Potenciál $\\Phi$ ve voltech má nulu v nekonečnu. Oranžová síla vyjadřuje přitažlivost kladného prostředí, modrá odpuzování ostatními elektrony.",
  "Nárazový parametr $b$ je kolmá vzdálenost přímky příletu od středu. $E_k$ je kinetická energie před srážkou, $Z$ je protonové číslo a $z=2$. Úhel $\\theta$ měří odklon od směru příletu. Účinný průřez má jednotku $\\mathrm{m^2}$, prostorový úhel steradián.",
  "Poloměr $r$ určuje rychlost $v$, dostředivé zrychlení $a$ a celkovou energii $E$. Výkon $P_{\\rm rad}$ ve wattech je úbytek energie za sekundu. Kružnice ve scéně označuje výchozí poloměr. Křivka u částice ukazuje poslední část skutečně vypočtené dráhy.",
  "Hlavní kvantové číslo $n$ určuje energii a poloměr. Indexy $i,f$ označují počáteční a konečný stav. $m_p$ je hmotnost protonu, $\\mu$ redukovaná hmotnost, $\\nu$ frekvence fotonu a $\\lambda$ jeho vakuová vlnová délka.",
  "Zkoušený obvod obsahuje $2\\pi r/\\lambda$ vlnových délek. Pro kruhový oběh v poli jádra současně platí $p^2/(\\mu r)=\\kappa/r^2$. S hybností danou tímto vztahem obvod obsahuje $\\sqrt{r/a_\\mu}$ vlnových délek. Odtud vycházejí povolené poloměry $r_n=a_\\mu n^2$.",
  "Kvantová čísla $n,\\ell,m$ určují radiální průběh, moment hybnosti a jeho projekci. $L$ je zobecněný Laguerreův polynom, $P$ přidružená Legendreova funkce a $N_{\\ell m}$ normalizace na jednotkové sféře. $w$ má jednotku $\\mathrm{m^{-3}}$, radiální hustota $\\mathrm{m^{-1}}$. Zvolený podíl $f$ je kvadrát amplitudy druhého stavu. Pro $1s$ je největší hustota u jádra. Objem slupek roste jako $4\\pi r^2\\,\\mathrm dr$, proto maximum radiální hustoty leží až při $a_\\mu$.",
  "Vektor $\\mathbf R_j$ označuje polohu atomu, $\\mathbf k_i$ a $\\mathbf k_f$ popisují směr a vlnovou délku dopadající a rozptýlené vlny. Vektor $\\mathbf q$ je jejich rozdíl. Fáze příspěvku každého atomu je $\\mathbf q\\cdot\\mathbf R_j$. Značka $i$ je imaginární jednotka, $A$ součet komplexních amplitud a $I$ intenzita. Detektor měří úhel $\\theta$ od kolmice k povrchu.",
  "Hybnost je uvedena v jednotkách $m_ec$. Matice $\\boldsymbol\\alpha,\\beta$ působí na čtyřsložkový spinor $\\Psi$, $\\hat{\\mathbf p}$ je operátor hybnosti a $\\hbar$ redukovaná Planckova konstanta. Vlevo jsou obě matematické větve celkové energie $E_\\pm$. Dole se porovnává kinetická energie. Vztah $v/c=p/\\sqrt{p^2+(m_ec)^2}$ dává skutečnou rychlost k zadané hybnosti.",
  "Bariéra má výšku $5\\,\\mathrm{eV}$ a tloušťku $1\\,\\mathrm{nm}$. Šířka otvoru $a$ a rozteč $d$ určují obálku a periodu vzdáleného obrazce. $W\\ge0$ je absorpční energie. Celková pravděpodobnost záchytu integruje pravděpodobnostní tok do absorbéru. Difrakční aproximace předpokládá široké rovnoměrné osvětlení a vzdálené stínítko.",
  "Hybnost je podélná, polarizace podél pohybu je pevná. $a(p)$ je Gaussova amplituda v hybnostním prostoru. Zobrazená hustota $\\Psi^\\dagger\\Psi$ má po integraci přes příčné souřadnice jednotku $\\mathrm{m^{-1}}$. Odstranění společné klidové fáze neovlivní hustotu.",
  "Zorné pole $L$ je šířka zobrazeného výřezu v metrech. V příkladu rozptylu dopadá foton na elektron v klidu a elektron získá rozdíl mezi hybností fotonu před rozptylem a po něm. Veličina $qc$ v elektronvoltech je velikost tohoto přenosu vynásobená rychlostí světla. Graf dává odhad rozlišení hypotetické sondy $\\Delta x$. Mez struktury elektronu se určuje z výsledků skutečných rozptylových měření."
];
const ElectronDerivations=[
  [
    "\\gamma=1+eU/(m_ec^2),\\quad \\dot{\\mathbf r}=\\mathbf p/(\\gamma m_e)",
    "\\gamma=(1-v^2/c^2)^{-1/2}"
  ],
  [
    "\\mathbf F_i=-e\\mathbf E_+(\\mathbf r_i)+\\kappa\\sum_{j\\ne i}\\frac{\\mathbf r_i-\\mathbf r_j}{|\\mathbf r_i-\\mathbf r_j|^3}",
    "\\Phi_+(r\\le R)=\\frac{Q}{8\\pi\\varepsilon_0 R}(3-r^2/R^2)"
  ],
  [
    "F_r=zZ\\kappa/r^2,\\quad \\mathrm d\\sigma=2\\pi b|\\mathrm db|,\\quad \\mathrm d\\Omega=2\\pi\\sin\\theta\\,\\mathrm d\\theta"
  ],
  [
    "v=\\sqrt{\\kappa/(m_er)},\\quad a=\\kappa/(m_er^2)",
    "P_{\\rm rad}=\\frac{e^2a^2}{6\\pi\\varepsilon_0c^3},\\quad \\frac{\\mathrm dE}{\\mathrm dr}\\dot r=-P_{\\rm rad}"
  ],
  [
    "\\mu=\\frac{m_em_p}{m_e+m_p},\\quad a_\\mu=\\frac{\\hbar^2}{\\mu\\kappa},\\quad h\\nu=|E_f-E_i|"
  ],
  [
    "\\lambda_{\\text{pro oběh}}=2\\pi\\sqrt{a_\\mu r},\\quad 2\\pi r/\\lambda_{\\text{pro oběh}}=\\sqrt{r/a_\\mu}"
  ],
  [
    "\\left[-\\frac{\\hbar^2}{2\\mu}\\nabla^2-\\frac{\\kappa}{r}\\right]\\psi=E\\psi,\\quad \\rho=\\frac{2r}{na_\\mu}",
    "R_{n\\ell}=\\sqrt{\\left(\\frac{2}{na_\\mu}\\right)^3\\frac{(n-\\ell-1)!}{2n(n+\\ell)!}}\\,e^{-\\rho/2}\\rho^\\ell L_{n-\\ell-1}^{2\\ell+1}(\\rho)",
    "Y_\\ell^m=N_{\\ell m}P_\\ell^m(\\cos\\theta)e^{im\\varphi}"
  ],
  [],
  [
    "E_k^{\\rm NR}=p^2/(2m_e),\\quad E_k^{\\rm rel}=E_+-m_ec^2"
  ],
  [
    "\\mathbf j=\\frac{\\hbar}{m_e}\\operatorname{Im}(\\psi^*\\nabla\\psi),\\quad \\partial_t|\\psi|^2+\\nabla\\cdot\\mathbf j=-2W|\\psi|^2/\\hbar",
    "I(\\theta)\\propto\\operatorname{sinc}^2(\\pi a\\sin\\theta/\\lambda)\\cos^2(\\pi d\\sin\\theta/\\lambda),\\quad\\operatorname{sinc}x=\\sin(x)/x"
  ],
  [
    "u(p)=\\sqrt{\\frac{E_p+m_ec^2}{2E_p}}\\begin{pmatrix}1\\\\0\\\\pc/(E_p+m_ec^2)\\\\0\\end{pmatrix},\\quad u^\\dagger u=1"
  ],
  [
    "\\Delta x\\sim\\frac{\\hbar c}{qc}"
  ]
];
const ElectronBibliography=[
  "J. J. Thomson (1897), Cathode Rays",
  "American Institute of Physics, The Discovery of the Electron",
  "J. J. Thomson (1904), On the Structure of the Atom",
  "J. J. Thomson’s plum-pudding atomic model: The making of a scientific myth (2013)",
  "E. Rutherford (1911), The Scattering of α and β Particles by Matter and the Structure of the Atom",
  "N. Bohr (1913), On the Constitution of Atoms and Molecules",
  "OpenStax, University Physics III, 6.4, Bohr’s Model of the Hydrogen Atom",
  "NIST, Handbook of Basic Atomic Spectroscopic Data, Strong Lines of Hydrogen",
  "L. de Broglie (1929), The Wave Nature of the Electron, Nobel Lecture",
  "OpenStax, University Physics III, 8.1, The Hydrogen Atom",
  "Oregon State University, The Hydrogen Atom",
  "M. Born (1954), The Statistical Interpretation of Quantum Mechanics, Nobel Lecture",
  "C. Davisson a L. H. Germer (1927), Diffraction of Electrons by a Crystal of Nickel",
  "P. A. M. Dirac (1928), The Quantum Theory of the Electron",
  "D. Tong, Quantum Field Theory, 4, The Dirac Equation",
  "A. Tonomura a kol. (1989), Demonstration of Single-Electron Buildup of an Interference Pattern",
  "R. Bach, D. Pope, S.-H. Liou a H. Batelaan (2013), Controlled Double-Slit Electron Diffraction",
  "University of Nebraska–Lincoln, Controlled Double-Slit Electron Diffraction",
  "D. Tong, University of Cambridge, Lectures on Quantum Field Theory",
  "D. Tong, Quantum Field Theory, Introduction",
  "D. Tong, Quantum Field Theory, 6, Quantum Electrodynamics",
  "NIST, Fundamental Physical Constants",
  "Particle Data Group, Review of Particle Physics",
  "PhET, Models of the Hydrogen Atom",
  "PhET, zdrojový projekt Models of the Hydrogen Atom",
  "PhET, dokumentace modelů vodíku",
  "Jefferson Lab, Visualizing the Quantum World",
  "Niuskir, Electron Orbitals Blender 3D",
  "Niuskir, Orbitals",
  "Shianjeng, Quantum Wave Lab",
  "Francisco Kim, DoubleSlitSimulator",
  "NIST, Atomic Spectra Database",
  "C. D. Anderson (1933), The Positive Electron",
  "P. A. M. Dirac (1931), Quantised Singularities in the Electromagnetic Field",
  "ATLAS, CERN (2021), New Insight into the Internal Structure of the Proton"
];

const ElectronComparison=[
 ['Záporná částice s měřitelnou hybností','Vychýlení svazku a měrný náboj','Struktura atomu a spektrální čáry','Elektronová optika v předepsaných polích'],
 ['Částice v rozloženém kladném náboji','Neutralita a malé kmity','Velké úhly rozptylu částic alfa','Analytické pole koule a kolektivní kmity'],
 ['Lehký elektron mimo koncentrovaný kladný náboj','Velké úhly rozptylu na jádře','Stabilita atomu a čárové spektrum','Pružný rozptyl dvou nábojů'],
 ['Zrychlený klasický bodový náboj','Záření a úbytek energie','Dlouhodobá stabilita základního stavu','Záření pomalých klasických nábojů'],
 ['Částice v postulovaném stacionárním stavu','Hlavní série čar vodíku','Intenzity čar, spin a jemná struktura','Rychlé odhady energií vodíkových iontů'],
 ['Hmota s fází určenou hybností','Vlnová délka a podmínka fáze na kružnici','Úplná prostorová struktura vázaných stavů','Odhad vlnové délky elektronového svazku'],
 ['Stav s komplexní amplitudou pravděpodobnosti','Vodíkové orbitaly a interference','Relativistické energie a vznik párů','Nerelativistická atomová fyzika'],
 ['Koherentně rozptylovaná elektronová vlna','Směrová maxima rozptylu','Přesné intenzity nízkoenergetické difrakce','Kinematická analýza vlivu uspořádání mřížky'],
 ['Relativistická částice se spinem jedna polovina','Volná disperze a spinorová struktura','Plná dynamika proměnného počtu částic','Jednočásticové relativistické stavy'],
 ['Kvantový stav dávající lokalizované detekce','Vznik interferenční statistiky','Ze samotné detekce nelze určit dřívější cestu','Koherentní elektronová optika'],
 ['Elementární fermion, kvantum elektronového pole','Jednočásticový balík jako sektor teorie','Zvolený jednorozměrný výpočet nezahrnuje interakce','Volný elektron s pevnou polarizací'],
 ['Bodová elementární částice v prostorově rozprostřeném stavu','Rozdíl mezi rozsahem stavu a rozlišením sondy','Jedno měřítko neurčuje geometrický poloměr','Řádový odhad dosažitelného rozlišení']
];
