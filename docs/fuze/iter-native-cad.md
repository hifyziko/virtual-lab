# Parametrická sestava ITER

## Aktuální způsob zobrazení — 18. listopadu 2026

Na základě uživatelovy připomínky byl detailní export STEP nahrazen lehkou
matematickou sestavou. Původní síť byla příliš objemná a její drobné plochy,
kvantování a společné hrany zhoršovaly vykreslení. Nyní se generují základní
šablony: prstencový rám D-cívky, sektor dvojplášťové nádoby s porty, kruhové
PF/CS cívky a divertorová kazeta. Šablony se opakují tuhými rotacemi:
18 TF cívek, 9 sektorů nádoby a 54 kazet divertoru. Drobné šrouby, malé otvory,
vnitřní podpěry a odlišnosti výrobních variant jsou vynechány.

Profil R(u), Z(u) vytváří rotační plochu
x=R(u) cos φ, y=R(u) sin φ, z=Z(u). D-cívka používá vytažení prstencového
profilu v tečném směru. Nádoba používá dva společně parametrizované profily,
propojené u portů a hran sektorů; portová hrdla jsou duté rámy.
Rozměry a obrysy jsou odvozené z původních montážních souřadnic STEP.
Všechny osy mají stejné měřítko; model se nepřizpůsobuje tvaru plazmatu.
Prostorové idealizované profily nejsou vydávané za výrobní CAD.

Geometrická data klesla ze 151 515 594 B na 324 888 B. Celá viditelná sestava
včetně odvozených obkladů má 564 768 trojúhelníků místo původních více než
103 milionů (před prostorovým řezem). Šablony sdílejí buffery a renderer
opakování řeší instancemi. Běžné sestavení vyžaduje pouze Node.js.
Tato čísla nejsou měřením snímkové frekvence na uživatelově GPU.

## Levý řez a fyzika

Na výslovné přání uživatele zůstaly všechny podklady levého řezu zachované.
Jejich přesnou shodu s předchozím stavem ověřují SHA-256 v referenceSections
a test tokamakové rovnováhy. Prostorová idealizace proto nepřekresluje
referenční poloidální ilustraci. Stejná zůstávají uložená pole, 97 rovnováh,
proudy, tlakové profily a integrátor siločar. Žádný solver se nespouštěl.

Po připomínce uživatele z 19. 11. zůstává vybraná prostorová siločára celá
i při zapnutém konstrukčním řezu. Diagnostické kontury na řezné rovině se
ořezávají jako dosud. Kresba siločáry používá lehkou 3D trubici se stabilními
transportovanými rámy a modrým jádrem se světlým lemem. Její šířka je stálá
v pixelech při otáčení a změně měřítka; jde o grafické zvýraznění, nikoli
fyzikální průměr siločáry. Směrové značky jsou malé 3D kužely s hloubkovým testem,
takže se nekreslí jako překryv přes solenoid. Původní široké pásky v projekční rovině se pro vybranou siločáru nepoužívají.
Pohyb značek vlevo zůstává zachovaný.

## Zdroje a obklady

Zdroj obrysů a montážních poloh: ITER Organization / Centre for Energy
Research, [3D printable ITER v2.0](https://www.iter.org/fr/node/20687/make-your-own-tokamak-3d-printing),
[archiv](https://static.iter.org/com/3d/IO_3D_models_v2.0.zip).
Souřadnice STEP byly převedeny jednotně z mm na m. Tiskové orientace STL
se nepoužívají pro montáž. Kompaktní parametry zachovávají původ a SHA-256
jednotlivých referenčních dílů.

Samostatný blanket ve zdrojové sadě není. Uživatel výslovně schválil
rekonstrukci podle [M. Merola: Design of ITER Plasma Facing Components](https://www.iter.org/sites/default/files/education/Merola_compressed.pdf),
ITER International Summer School 2009, snímky 78, 82–83 a 89.
Obklady mají 18 lomených poloidálních řad, samostatné čelní desky,
stínicí bloky a úchyty. Uspořádání a portové výřezy jsou ilustrativní,
nikoli výrobní mapa 440 modulů. Regrese hlídá, aby stínění neprocházelo
skutečně triangulovaným čelem první stěny.

## Soubory a ověření

- cad-parameters.js: malé referenční řezy, obrysy, rozměry a počty opakování.
- parametric.js: generování matematických těles; žádné uložené trojúhelníky.
- cad.js: sdílení šablon, polohy sestavy, kamera a zachované poloidální řezy.
- blanket.js: oddělená rekonstrukce obkladů podle obrázků.

Ověření zahrnuje shodu všech 97 fyzikálních stavů, přesné zachování levých
řezů, rozpočet trojúhelníků, konečné souřadnice, tuhé rotace, ořez siločar,
zachování a uvolnění GPU bufferů. Three geometrie je v testech vytvářená
s náhradou WebGL driveru. Vizuálně byl prohlédnut samostatný VTK náhled
parametrické sestavy; nejde o screenshot skutečného webového WebGL.
Prohlížeč se automaticky nespouští.

Volitelná obnova parametrů z privátních podkladů: import-iter-cad.py
(FreeCAD Python), pack-iter-cad.py (do tmp/iter-cad-web), potom
node tools/extract-iter-parameters.cjs tmp/iter-cad-web.
Tento postup není součástí běžného sestavení. STEP, STL, PDF a velké
mezisítě zůstávají mimo veřejný Git a web.

## Technické zpracování — 19. listopadu 2026

TF pouzdra mají sražené hrany a hladké periodické B-spline profily; vložené
pásy ukazují vinutí a ocelové lemy. PF/CS pouzdra používají jemné zaoblení
rohů a samostatné normály stěn a čel. Rovné válcové stěny nemají smíchané
normály s čely, což odstraňuje nepřirozeně vypouklé odlesky modulů CS.
Členění CS doplňují úzké spáry, orientační rytmus závitů a táhla. Tyto
technické detaily jsou názorné a nejsou výrobním modelem. Barevné vložky
v rovině řezu mají drobný hloubkový posun proti společné krycí rovině, aby
nevznikalo soupeření koplanárních ploch. Data levého řezu i fyzika zůstávají
přesně shodné s předchozím stavem. Ověřují se také jednotkové rámy trubice,
konstantní šířka siločáry a uvolnění jejích sdílených GPU bufferů.

## Návaznost portů a materiály — 19. listopadu 2026

Otvory se již neurčují odděleně od hrdla. Společný rám s osou, sklonem
a rozměrem otvoru se promítá do obou plášťů; vzniklé kořenové smyčky
se přímo propojují s krkem a přírubou. Původní poloidální křivky zůstávají
zachované, mění se pouze jejich parametrizace pro prostorovou síť.
Blanketové panely se ve 3D ořezávají stejnými portovými poloprostory.
To nezasahuje do zachovaných polí ani do podkladů levého řezu.

Nádoba používá materiálové skupiny pláště, broušeného hrdla a leštěné
příruby. Pouzdra cívek, měděné/zlatavé vinutí, stínění a wolframové
komponenty mají odlišné nastavení kovovosti, drsnosti a odrazivosti.
Také krycí řezné plochy zachovávají materiál jednotlivých těles. Otevřené
vložky vinutí se nesmějí účastnit stencilové výplně. Vizuální parametry
nejsou vydávány za naměřené výrobní vlastnosti materiálů.

Regrese kontroluje sdílené hrany hrdla a stěny, shodné rámové úrovně
otvorů v obou pláštích, společnou osu vyústění a nepřekrytí otvorů
obkladem. Materiálové parametry se kontrolují na skutečně vytvořených
Three materiálech včetně skupin nádoby. Měřítko kamery je nezávislé
na orbitální orientaci a viditelnosti dílů; mění se pouze záměrným zoomem
a změnou rozměru plochy.

## Hlavní tělo TF a výchozí záběr — 19. listopadu 2026

Pokus převést vnější obrys se všemi podpěrami a výřezy do společného
polárního profilu se neosvědčil: podpěry deformovaly i pás vinutí.
Tato varianta se nepoužívá. Není přípustné potvrdit její věrnost jen tím,
že vyhoví vzorkům testu průniků.

Hlavní D-tělo má původní vnitřní CAD obrys a konstantní normálovou tloušťku
0,88 m. Ta odpovídá 0,880901 m změřeným mezi vnitřní a vnější stěnou
nepřerušeného vnějšího boku původního pouzdra. Rovnoměrná tloušťka je
idealizace; drobné lokální podpěry jsou vynechány a netvoří část hlavního
obrysu ani dekorativního pásu vinutí. Žádné dodatečné 20mm vyřezávání podle
PF se neprovádí. PF zůstávají ve zdrojových polohách a mají vlastní
zdrojové obrysy místo obalových obdélníků.

Obnovení malých parametrů: node tools/extract-iter-parameters.cjs --coil-bodies.
Testy kontrolují souvislý konvexní D-tvar, měřenou tloušťku, průniky s PF,
původní levý řez a neměnnou fyziku. Výchozí záběr používá skutečné dvojice
R,z na celé geometrii; při přepínání dílů ani otáčení měřítko nemění.
