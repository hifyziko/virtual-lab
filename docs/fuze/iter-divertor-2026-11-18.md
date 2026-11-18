# Divertor ITER a rozvinutá plocha — 18. listopadu 2026

## Výsledek a rozsah

Magnetické udržení: přepínatelný úhlový náhled stejné uložené siločáry v pravém horním rohu scény. Vodorovně toroidální úhel, svisle poloidální; rozdělení přes periodické hrany nepropojuje nesouvisející body. Nejde o délkově nezkreslené rozvinutí toru. Změna plochy, pole i předvolby obnovuje náhled bez změny fyziky.

Divertor přebírá rovnováhu. Samostatná karta Rovnováha tokamaku byla odstraněna, staré ID fu05-rovnovaha otevírá tentýž Divertor. Zdrojová cesta equilibrium a veřejná cesta fuze-rovnovaha zůstávají kompatibilní. Samostatný index.html přesměrovává na divertor.html.

## Numerika

- Geometrické měřítko ITER: R0 = 6,2 m, a přibližně 2 m, toroidální indukce 5,3 T, Ip = 15 MA. Polohy/průřezy šesti PF a šesti CS převzaty jako číselné parametry zveřejněného souboru ITER/JOREK polcoils_iter.nml, M. Hoelzl 2017-03-01. Efektivní počty závitů z tohoto datasetu nejsou prohlášeny za aktuální výrobní specifikaci.
- Jen reference je inverse shape solve. Každý následující stav je **forward fixed-current**: FreeGS 0.8.2 s Newtonovým–Krylovovým řešením nelineárního rezidua přes SciPy 1.12.0. Numerická iterace nemění žádný proud. Není to regulátor polohy.
- 6 cívek × 9 proudových stavů, dále 9 tlakových stavů při pevných proudech. Aktivní pokus mění vždy jedinou cívku; výběr jiné obnoví referenci. Změna ampérzávitů ±0,6 MA, krok 0,15 MA. Zobrazený vodičový proud = ampérzávity / efektivní závity. Tlak na ose 350–650 kPa.
- Síť 65 × 65, volná hranice, Hagenowova metoda. Proud plazmatu a tlakový profil jsou předepsané. Max. nelineární reziduum < 2e-6 Wb/rad, nezávislé relativní GS reziduum v jádře přibližně 0,0021. Testy ověřují nezměněné proudy ostatních cívek, tokové hladiny, směrovou tečnost siločar a průsečíky terčů.
- Samostatná kontrola 129 × 129 se **stejnými proudy**: reference osa (6,34555; 0,38678) m proti (6,35336; 0,38715) m na síti 65; při +0,1 MA v PF3 (6,37465; 0,37047) m proti (6,38349; 0,37030) m. Absolutní polohová odchylka řádu 1 cm, přírůstková odezva se liší řádově 1 mm. Není to přesný model konkrétního výboje.
- Z exportovaného toku se odvozují kontury i poloidální pole. Derivace pro prohlížeč odpovídají stejné bilineární interpolaci toku. Přímé mapy: p, B, BP, BT, Jphi, magnetický tlak, lokální beta, normalizovaný tok. P, J a beta se nebarví mimo uzavřené plazma. Teplotu, hustotu ani tepelnou zátěž SOL tento model neřeší.
- Přechody mezi vypočtenými stavy nejsou časovou dynamikou. Vertikální stabilita, indukovaná napětí, pasivní vodiče a stabilizace nejsou řešeny. Reálné protáhlé plazma vyžaduje regulaci. Výklad to uvádí.
- Přepočet je pouze explicitní: `python tools/precompute-tokamak-equilibrium.py --write` s knihovnami z tools/tokamak-requirements.txt, volitelně `--deps`. Není součást sestavení webu. `--resume` smí použít pouze checkpointy z identické konfigurace a stejné sítě.

## Geometrie a zdroje

Primární kniha: Entler, S.; Kindl, V. Jaderná fúze a fúzní elektrárny. Kap. 2.3.2 a tab. 2.3, s. 43–45; kap. 7.9, s. 154–156; kap. 7.11–7.12, s. 158–160. Ověřeno ze soukromého PDF v docs/fuze/podklady; nezveřejňovat jej.

- ITER, magnets: https://www.iter.org/machine/magnets
- ITER, divertor: https://www.iter.org/machine/divertor
- ITER/JOREK geometrie: https://github.com/iterorganization/JOREK/blob/develop/reg_tests/testcases/freebound_equil_iter_starwallcoils/EXTRA_FILES/polcoils_iter.nml
- FreeGS: https://freegs.readthedocs.io/en/stable/creating_equilibria.html
- FreeGSNKE, přímé statické řešení: https://docs.freegsnke.com/notebooks/example02%20-%20static_forward_solve_mastu
- FreeGSNKE, příklad ITER (sám výslovně používá ilustrativní profilové parametry): https://docs.freegsnke.com/notebooks/example07c%20-%20iter

Oficiální 3D tiskový model: https://www.iter.org/fr/node/20687/make-your-own-tokamak-3d-printing ; archiv https://static.iter.org/com/3d/IO_3D_models_v2.0.zip . Vybrané části byly stažené jen do tmp/iter-reference a vizuálně prohlédnuté (TF cívka, sektor komory, divertorové kazety). Archiv má kolem 6,4 GB; byly staženy jen vybrané položky pomocí HTTP Range. Neobsahuje samostatnou licenci. Obecné https://www.iter.org/terms-use nepovoluje automaticky redistribuci/odvozeniny; tiskový článek výslovně podporuje vzdělávací tisk. STL/OBJ/STEP nejsou v Gitu ani webu. Web obsahuje vlastní parametrickou technickou ilustraci, nikoli převzatou síť. Průřezy komory a divertoru jsou přiznané zjednodušení; cívky používají zveřejněné číselné pozice. Renderuje je stávající confinement renderer.

## Kontroly

`tools/test-surface-unroll.cjs`: periodické švy, racionální q, čisté toroidální/poloidální pole, přepínání a změny náhledu. `tools/test-tokamak-equilibrium.cjs`: všech 63 stavů, neměnné ostatní proudy, tokové hladiny, průsečíky terčů, prostorová tečnost, KaTeX, všechny mapy, ovladače, reset a disposal. Canvas výstupy byly prohlédnuté bez prohlížeče; nejde o vizuální kontrolu celé HTML stránky či skutečného WebGL v prohlížeči.

## Úprava názornosti ovládání (18. 11. 2026)

Výchozí pokus posouvá plazma nahoru/dolů kombinací změn proudů PF2 a PF5; druhý pokus dovnitř/ven používá PF3 a PF4. Poměr změn proudů je pevný, zvolený jednou z odezvy původních samostatných cívek kolem referenčního stavu. Pro každý krok se řeší statická rovnováha při těchto předepsaných proudech; nejde o polohový regulátor ani geometrické posunutí povrchu. Každá směrová řada má 17 stavů, původních sedm řad po devíti stavech zůstává. Posuvník ukazuje vypočtený posun osy v cm, graf změny proudů v kA. Vedlejší posun se nezamlčuje.

Výchozí záběr je detail plazmatu, konstrukci a celé cívky lze zobrazit přepínači. Směr vodorovného tažení odpovídá magnetickému udržení. ITER má jeden dolní prstencový divertor s vnitřním a vnějším terčem (ITER Organization, https://www.iter.org/machine/divertor). Oba terče jsou popsané přímo v řezu. Geometrie zůstává vlastní parametrickou ilustrací podle zveřejněných podkladů, nikoli staženou STL sítí. Dynamická stabilita ani transport na terče se nepočítají.

## Podrobnější konstrukční ilustrace (18. 11. 2026)

Nahrazeny oválné TF prstence explicitním D-profilem s rovnou vnitřní větví a oblými rameny, přibližně 17 × 9 m včetně pouzdra. Osmnáct cívek má konečnou radiální i toroidální tloušťku. Komora je rozdělena na devět sektorů, s objemovou stěnou a schematickými vnitřními panely. Divertor tvoří 54 samostatných kazet s nosným tělesem, dvojicí terčů a středovou částí. Čelní plochy terčů stále přesně odpovídají průsečíkům siločar; uložené pole ani výpočtová hranice se nemění. Řez odkrývá tutéž toroidální polovinu všech sestav. Konstrukce ITER automaticky zapne celkový záběr. Vizualizace nadále není výrobní CAD; tvarování pouzder, paneláž a tloušťky jsou ilustrativní.

Zdroje počtů a rozměrů: https://www.iter.org/machine/magnets ; https://www.iter.org/machine/vacuum-vessel ; https://www.iter.org/machine/divertor . Vlastní geometrie; bez převzetí STL. Ověřeno všech 97 rovnováh, vykreslení konstrukce s řezem i bez něj, automatický celkový záběr a náhled pomocí canvasu; bez otevření prohlížeče.

## Viditelnost TF a výukový výběr součástí (18. 11. 2026)

TF byly chybně svázané s vypnutou konstrukcí. Nově mají samostatný přepínač TF cívky, zapnutý při načtení i resetu. PF a solenoid mají vlastní společný přepínač, komora zůstává samostatně. Prostorový záběr se s TF přizpůsobuje celé sestavě, detail poloidálního řezu se tím nezmenšuje. Nabídka Ukázat zvýrazní TF, PF, CS, komoru nebo divertor a ztlumí ostatní součásti; stručný popisek vysvětluje funkci. U TF je pomocná toroidální kružnice se směrovými hroty (složka pole, nikoli úplná šroubovicová siločára). Změna výběru zachovává fyzikální stav. Řez odkrývá polovinu sestavy; po vypnutí se zobrazí všech 18 TF. Testována výchozí viditelnost, všechny výběry, zachování stavu a vykreslení canvasem bez otevření prohlížeče.

### Konstrukční vzhled a ostrost (18. 11. 2026)

Rozlišení canvasů nyní zohledňuje skutečné zvětšení modulu a DPR (do 4×). Mapa řezu má rozlišení podle skutečné velikosti vykreslené oblasti místo pevného rastru 260×340; cache zahrnuje rozlišení. Stejné DPR používá WebGL. Nový materiál case zachovává ostré hrany kovových pouzder, ostatní moduly mají původní materiály. Komora a panely jsou neprůhledné, doplněna schematická přístupová hrdla a intercoil spoje. Řez ponechává zadní polovinu a otevírá vnitřek k výchozímu pozorovateli. Ocelové odstíny s teplým rozlišením vinutí/panelů jsou výukové, nikoli specifikace materiálů. Model zůstává vlastní ilustrací. Zdroje konstrukce: https://www.iter.org/node/20687/first-building-block-takes-shape a https://www.iter.org/node/20687/collective-strength . Testy tokamaku i sdíleného confinement rendereru prošly. Náhled canvasu ověřen, skutečný WebGL v prohlížeči nebyl otevřen.

### Terminologie knihy a kontrola q (18. 11. 2026)

Ověřena kniha Entler–Kindl, Jaderná fúze a fúzní elektrárny: kap. 10.2 s. 201 (vakuová nádoba), kap. 11.1 s. 276–277 a rámeček 11.1 (blanket), s. 284 (samostatné moduly první stěny ITER). V ovládání oddělena Vakuová nádoba od Blanketu a první stěny; doplněn výběr blanketu a funkce absorpce neutronů. Opraveny zkrácené názvy na Poloidální/Toroidální magnetická indukce. Soukromý text zůstává mimo web.

q95 vypočteno integrací B_T/(r B_P) dl / (2 pi) po uzavřené hladině psi_N=0,95. Reference přibližně 2,48 (2400 i 8000 segmentů), což neodpovídá základnímu ITER scénáři q95 přibližně 3 při 15 MA. Profil proudu nebyl kalibrován na ITER. Zobrazení nyní ukazuje vlastní vypočtené q95, výklad rozdíl výslovně uvádí a odkazuje na https://www.iter.org/sites/default/files/education/Pinches_lec.pdf . Neprováděno umělé přenásobení siločáry ani náročný nový numerický přepočet. Test rozšířen o q95 a výběr blanketu; prošel.

### Vakuová nádoba, materiály, geometrické kolize a SOL (18. 11. 2026)

Vakuová nádoba zapnutá od začátku i po resetu. Dva oddělené pláště s příčkami a mezipláštěm nahrazují jedinou plnou skořepinu. Barvy oceli stříbrošedé, wolframová první stěna a divertorové povrchy tmavošedé podle současného návrhu ITER (https://www.iter.org/machine/blanket , https://www.iter.org/machine/vacuum-vessel). Původní zlaté panely odstraněny. Tloušťky zůstávají ilustrativní. TF ramena upravena kvůli kolizi s PF6; vzorkované vrcholy průřezu mají odstup od PF alespoň 0,139 m. Nejde o úplnou certifikovanou kontrolu CAD ani přesný výrobní obrys TF; vnější podpory nejsou zahrnuté.

SOL: primární výklad Entler–Kindl kap. 7.11–7.12, s. 158–160. Doplněk D. Reiter, ITER School Basic boundary physics (https://www.iter.org/sites/default/files/education/190121-Reiter-ITER-School-basic-boundary-physics_n.pdf). Opraveno pořadí materiálových průsečíků: siločára končí na první stěně, pokud ji zasáhne před terčem. Předchozí algoritmus nesprávně preferoval dvojici terčů. Dopadové body vyznačeny, separatrix a otevřené větve mají odlišné živé popisky; doplněny dostupné kontury soukromého toku pod x-bodem. Výklad rozlišuje SOL a private flux a upozorňuje na konečné rozlišení sítě a chybějící transportní model. Tepelné toky ani skutečná šířka SOL se netvrdí. Test ověřuje ukončení na první překážce i případ terče za stěnou. 97 stavů prošlo.

Duplicitní tlačítko výkladu opraveno napojením ID theory na existující sběr dialogu explanation ve společném ModuleGuide; přímá samostatná stránka zachovává své tlačítko. Lokální web přestavěn, bez push.

### Šířka řezu a funkční barevnost (18. 11. 2026)

Prostřední panel zúžen o 15 % jeho dosavadní šířky: 44 % → 37,4 % scény; prostor 62,6 %. TF světle měděné, PF oranžově měděné, CS tmavě měděný. Barevné značení cívek je funkční, ne tvrzení o materiálu vnějšího pouzdra. Vakuová nádoba modrošedá ocel, blanket teple světle šedá ocel, první stěna a divertorové PFC wolframová tmavošedá. Blanket má nyní samostatný objem za tenkou vrstvou první stěny, před nádobou; původní tenká jednobarevná destička tyto části nerozlišovala. Pořadí od plazmatu: první stěna → blanket → mezera → vnitřní plášť nádoby → mezipláští → vnější plášť. Tloušťky ilustrativní. Oba ovladače jsou samostatné. Místní web přestavěn, bez push.

### Technický render a bloky součástí (18. 11. 2026)

Volba Ukázat nahrazena kompaktními checkboxy vpravo nahoře: TF, PF, CS, vakuová nádoba, blanket/první stěna a divertor. Součásti lze kombinovat; ovladače viditelnosti odstraněné z levého panelu. Renderer Divertoru používá samostatně zapnutý technický režim: menší ambientní světlo, tři směrové zdroje, lesk kovových pouzder a hrany EdgesGeometry. Barevné mapy zůstávají MeshBasicMaterial bez ovlivnění osvětlením. Ostatní moduly používají původní nastavení. Test skutečného Three mesh builderu ověřuje kovový lesk, neprůhlednost, technické hrany a neosvětlené mapy, disposal; bez skutečného GL kontextu. Testy tokamaku a confinement prošly. Celý vzhled WebGL v prohlížeči tím není vizuálně ověřen.

### Souvislé pláště nádoby a odstíny TF/PF (18. 11. 2026)

Nádoba původně sestávala z obdélníkových uzavřených pásů, jejichž příčné stěny a zvýrazněné hrany působily jako bloková skladba. Nahrazeno dvěma souvislými zakřivenými plášti: sdílená hladká geometrie podél poloidálního obrysu, bez vnitřních příčných stěn a bez obdélníkového technického rastru. Uzavřené plochy pouze na hranách zvoleného řezu. Výrobních devět sektorů je v reálu svařeno (https://www.iter.org/node/20687/europe-completes-another-vacuum-vessel-sector); souvislá nádoba proto nekreslí otevřené mezery. Blanket zůstává modulový. TF světle zlatavě měděné, PF sytě červenohnědé, CS tmavě měděný. Popisky CS přesunuty doprava, tlačítko animace přejmenované, viz PREDANI-AKTUALNI.md. Dodávka přestavěna lokálně, bez push.

### Vizuální reference FUSION INDUSTRY a vrstvené cívky (18. 11. 2026)

Na výslovný odkaz uživatele prohlédnut https://fusionindustry.jp/en/technology/3d/tokamak a přiložený obrázek. Web sám popisuje vlastní výukovou rekonstrukci bez přesné výrobní geometrie. Použit jako vizuální reference, nepřebírá se zdrojový kód, geometrie ani textura třetí strany.

Vlastní TF nyní mají ocelové obvodové pouzdro s osmibodovým sraženým průřezem a samostatný vložený měděný pás vinutí na obou širokých stranách. PF/CS mají sražené hrany a oddělené plochy vinutí a ocelových pouzder; CS vodorovné linie vinutí a šest schematických ocelových táhel. Doplněny podpěrné patky TF. Tyto detaily jsou ilustrativní, nikoli rekonstrukce výrobní dokumentace, a nemění numerické cívky/rovnováhy.

Technický režim rendereru převeden z Phong na MeshStandardMaterial (metalness/roughness). Vlastní procedurální equirektangulární panorama tvoří prostředí s velkými světelnými plochami; bez vzdálených závislostí a převzatých HDR souborů. Barevné fyzikální mapy zůstávají neosvětlené MeshBasicMaterial, ostatní moduly zachovávají původní režim. Pouze prostorový panel má tmavé studiové pozadí. Test sdíleného rendereru ověřuje PBR materiály, prostředí, neprůhlednost a neosvětlené mapy. Doplňkový TOKAMAK_GPU_MESH=1 ověřuje sestavení skutečných Three geometrií celého tokamaku a konečnost normál/vrcholů při změnách ovládání; nepředstavuje obrazovou kontrolu skutečného GL výstupu.

### Ověření místního ZIP a rozměrů pouzdra TF (18. 11. 2026)

Uživatel upozornil na IO_3D_models_v2.0.zip v Downloads. Archiv 6 404 448 551 B obsahuje 54 položek se shodnými názvy, velikostmi a offsety jako veřejná v2.0. Čtyři malé referenční díly ponechány soukromě v docs/fuze/podklady/iter-model; CRC ověřené proti archivu, manifest SHA-256 v soukromém source-verification.json. Není to jiná verze. Původní ZIP nepozměněn.

STEP hlavního pouzdra TFCC_VAR_B.1 používá metry v souřadnicích sestavy. Ze číselných geometrických parametrů ověřeny kruhové části: centrum (4,24; 0,029) m, poloměry 6,069/6,9507 m, ramena se středy (5,33346741116; 2,98205435452) a (5,33346741116; −2,92405435452) m, poloměry 2,920/3,802 m, hlavní boční stěny Y=±0,5175 m. Vlastní webová střednice nyní používá tyto měřené parametry a vlastní přechody k přímé vnitřní větvi; nejde o převzatou STL síť. Tloušťka pouzdra a vložené vinutí respektují ověřenou šířku. Přidaná táhla/patky/příslušenství jsou nadále ilustrativní. Vzorkovaná mezera TF/PF přibližně 0,421 m; bez úplné výrobní CAD kontroly. Na vnitřní straně omezena tloušťka nádobové ilustrace kvůli místu pro TF pouzdro, bez změny fyzikální stěny pro výpočet siločar.

V kontrolním renderu exportované skutečné geometrie přes Blender/Cycles byla prohlédnuta sestava. Jde o kontrolu 3D tvarů jiným rendererem, nikoli screenshot webového WebGL. Odstraněno vyhlazování normál přes ostré hrany (limit 30 stupňů), prostředí kovů zesvětleno. Test ověřuje zachování pravého úhlu i PBR vlastnosti.

Kontrola existujícího Chrome byla automatickou bezpečnostní kontrolou odmítnuta, protože by četla accessibility obsah nesouvisejících soukromých stránek. Čtení nebylo obcházeno; skutečný WebGL obraz v prohlížeči nadále vizuálně neověřen. Nebyl spuštěn nový prohlížeč. Veřejný web neobsahuje stažené STL/STEP.

Ověření dokončeno: test-tokamak-equilibrium.cjs v režimu TOKAMAK_GPU_MESH=1 (skutečné Three geometrie/materiály, bez GL kontextu), test-confinement.cjs včetně testu oddělených normál pravého úhlu, test-progressive.cjs, test-fusion-navigation.cjs, test-module-guide.cjs a audit veřejných souborů prošly. Komponentové sestavení obou dodávek dokončeno. Souběžně byl přidaný nový modul plazmatu; sestavení proto už nekontroluje přesně pět modulů, ale úplnost povinných cest a jedinečnost ID. Nový modul byl zachován a je součástí šestice lazy fúzních balíčků. Závislosti na soukromých STL/STEP nejsou součástí webu ani sestavení.

### Světlý podklad, PFC divertoru a odlehčení vykreslování (18. 11. 2026)

Prostor vrácen na světlé pozadí; zachovány kovové odrazy. Divertor rozdělen na ocelové nosné kazety a samostatně přepínatelné PFC. Oba terče mají členěné wolframové monobloky, centrální dóm wolframové dlaždice; pod terči barevně oddělen CuCrZr chladič a ocelová nosná vrstva. Počet řad a prstů je názorně zhrubněný, nejde o výrobní detail. Nosné části mají spodní žebra a patky namísto původní ploché obruče. Primární zdroj Entler–Kindl, kap. 11.7.5, tab. 11.12, s. 321; doplněk https://www.iter.org/machine/divertor (54 kazet, vnitřní/vnější terč a dóm). PFC vyznačené také v řezu. Dóm je součástí geometrie prvního kontaktu siločáry; do dat a generátoru přidána jen jeho geometrie, pole a 97 rovnovážných stavů zůstaly stejné.

Nalezené příčiny neobratného vykreslování a opravy:
- Při pohybu kamery se přestavovala a rušila celá GPU síť. Nově jsou konstrukce uchované ve světových souřadnicích; kamera/zoom/resize mění transformační matici a znovu používají tytéž GPU geometrie. Při změně fyziky, plochy, mapy a viditelnosti se geometrie obnoví.
- Barva prostorového povrchu se počítala opakovaně pro každý toroidální segment. Nově se vyhodnocuje jednou podél poloidálního obrysu a opakuje kolem toru.
- Rastr řezu testoval každý pixel proti celému mnohoúhelníku stěny. Nově se jednou připraví maska řádkovým průchodem a uloží podle rozlišení.
- Síť plášťů nádoby zmenšena z 144×136 na 96×68 intervalů, při zachování hladkých normál a výstupního rozlišení canvasu. Nejde o zmenšení rozlišení numerického pole.
- Při pohybu kamery se neobnovuje řez ani grafy, canvas a záložní plátna se nepřidělují znovu při shodných rozměrech.
- Předvolby ploch používají krátké prolínání hotových obrazů; nevytvářejí znovu mnoho mezilehlých 3D sítí během 650 ms.

Testy: skutečný Three mesh builder ověřuje totožnost GPU geometrie při pohybu kamery a změně velikosti, matematickou shodu projekce s předchozím zobrazením, neobnovování DOM řezu při kameře, PFC materiál a jeho přepínání, předvolby a dopad na dóm před další překážkou. Kontroly fyziky a sdíleného rendereru prošly. Jde o automatické testy bez skutečného GL kontextu, nikoli měření FPS v uživatelově prohlížeči. Fyzikální data stále přibližně 8,7 MB, načítaná odloženě; STL/STEP se do webu neposílají.

### Oprava stop snímků a rozbité siločáry (18. 11. 2026)

Regrese po odlehčení rendereru: při shodné velikosti se už znovu nepřidělovalo záložní plátno prostoru, ale před drawImage se nezrušil jeho předchozí průhledný obsah. Výsledkem byly trvalé stopy starých poloh. Nově se bitmapa cache explicitně smaže v jednotkové transformaci před každou kopií. Při otáčení se ruší případné prolínání starého pohledu.

Druhá chyba byla v převodu siločáry do světových souřadnic: pole bodu má čtyři složky [x,y,z,phi], ale nový line-buffer rozbaloval celé pole a zapisoval pomocný úhel jako souřadnici. Odtud vznikaly modré úsečky přes plazma. Renderer nyní vždy zapisuje právě tři souřadnice na bod; aplikace předává kanonické xyz. Test skutečného Three builderu ověřuje přesný buffer [1,2,3,4,5,6] pro dva body s pomocnými čtvrtými složkami. Celkový GPU test kontroluje trojice souřadnic i dvojice konců úseček.

Doplněn pixelový regresní test s reálným canvasem: vložený starý neprůhledný pixel musí po změně kamery a zkopírování nového průhledného snímku zmizet. Prošel. Testy 97 rovnováh, zachování GPU cache a sdíleného rendereru prošly. Nejde o změnu fyzikálního pole. Dodávka přestavěna lokálně; bez push.

Dodání opravy ověřeno: pixelový test reálného canvasu, TOKAMAK_GPU_MESH=1, sdílený renderer, progressive, fúzní navigace a audit prošly. Plné komponentové sestavení dvakrát narazilo na EBUSY u nesouvisejících helicity-chunks. Opravené zdroje Divertoru a rendereru proto byly cíleně zkopírovány do obou dodávek se zachováním úprav jiných modulů; manifesty a všechny lazy dokumenty znovu sestaveny build-progressive-web.cjs. Obě dodávky obsahují opravu. Běžné sestavení ze zdrojů zůstává nezávislé na dočasném pomocném skriptu.

### Nižší přepínače, samostatné PF a pevný záběr (18. 11. 2026)

Blok součástí rozšířen na čtyři sloupce / dvě řady; ovládání pohledu je pod ním, horní hranice scén zůstává stejná. Odstraněno podmíněné skrývání PF při vypnutých TF a neaktivním Celém řezu. 3D záběr nyní vždy používá referenční obálku celého stroje (26 × 19 m); viditelnost součástí ani Celý řez nemění měřítko, natočení ani přiblížení. Automatické přepnutí rozsahu řezu při zobrazení nádoby odstraněno. Celý řez označuje pouze explicitní změnu rozsahu 2D pohledu. Zoom kolečkem rozšířen na 0,3–4×, Srovnat/dvojklik obnoví záběr celku.

Test skutečného Three mesh builderu ověřuje samostatné zobrazení všech šesti PF bez TF/CS/PFC a neměnnou transformační matici po vypnutí i obnovení ostatních konstrukcí. Fyzikální stav zachovaný. Testy 97 stavů, progressive a fúzní navigace prošly. Obě místní dodávky aktualizované cíleně. Bez push.

### Plynulejší izočáry, oblasti SOL a zarovnaný graf proudů (18. 11. 2026)

Zubatý okraj tlakové mapy byl dán ořezáním binárně vzorkovanou maskou. Mapa p/J/beta je nyní v kresbě oříznuta vektorovou uzavřenou tokovou křivkou psi_N=0,999, takže její hrana je antialiasovaná. Uzavřená křivka 0,999 byla ověřena ve všech 97 stavech. Tlak v této mapě se vyhodnocuje z p(psi_N); binární maska nesmí tvarovat viditelný okraj plazmatu. Numerická data a síť rovnováhy se nepřepočítávala.

Marching squares nyní uvnitř buňky kreslí čtyři úseky analytické bilineární izočáry místo jediné spojnice koncových bodů. Přidané body přesně leží na původní funkci toku. Současně opraveno propojení v sedlové buňce: asymptotický rozhodovač podle determinantu místo původního nesprávného propojení podle průměru rohů. Test pro analytické sedlo ověřuje obě větve a hodnotu toku ve všech přidaných bodech; všech 97 rovnováh, tečnost pole a prostorové siločáry prošly. Nedochází k volnému geometrickému vyhlazování ani ke změně dat řešiče.

SOL je v řezu zřetelnější: vybraný interval 1 < psi_N <= 1,09 je světle modře šrafovaný; pod x-bodem je hnědě vyznačen výřez soukromého toku. Oba regiony mají popisky a legendu; separatrix má samostatný popisek. Šrafování není hodnotou tlaku ani vypočtenou transportní šířkou SOL. U map B/Bp/Bt, magnetického tlaku a toku se regiony nepřetírají kvalitativní barvou; zachovává se číselná škála. Prostor doplněn lehkým průsvitným povrchem vnější vybrané tokové hladiny SOL. Výklad nadále vychází z Entler–Kindl kap. 7.9, 7.11–7.12; private flux doplněn z uvedené ITER School literatury. Fyzikální model transport v SOL neřeší.

Graf proudů zarovnán s 3D plochou pomocí společného gridu, nikoli volně položeného absolutního panelu. Karta má pevnou kompaktní výšku, nadpis a jednotky vlevo, hodnoty v jedné horní řadě a PF názvy v dolní. Math overlay sdílí počátek i rozměry canvasu. Škála sloupců je pevná pro celou řadu konkrétního pokusu (nepřepočítává se z aktuálního snímku); odstraněn zbytečně velký univerzální rozsah 6 kA a drobné pseudo-sloupce pro nulu. Čísla jsou se znaménkem změny. Test malého grafu 440×78 ověřil popisky uvnitř hran, přítomnost popisků oblastí, ovladače a zachování GPU cache. Náhled čistých canvasů prohlédnut bez prohlížeče; nejde o screenshot celého HTML/WebGL.

Doplněn také přesný případ izočáry v nulovém sedle: větve procházejí kritickým bodem, test ověřuje jejich tok i umístění nullu. Graf proudů zobrazuje rozsah v záhlaví a test potvrdil jeho stálost během jedné řady pokusu. Po cíleném sestavení obou dodávek prošly progressive, fúzní navigace, audit i diff check.

### Výrazná siločára a srozumitelné popisky (18. 11. 2026)

Vybraná siločára Divertoru má v prostoru modrou obrazovou šířku 4 px a bílý lem 8 px, v řezu 3,5 / 7,5 px; směrové značky jsou větší a mají světlý obrys. Pro WebGL se používají obrazově extrudované pásy s hloubkovým testem místo platformně omezeného LineBasicMaterial. Šířka se zachovává při zoomu, změně velikosti i DPR, GPU geometrie při pohybu kamery zůstává v cache. Sdílené geometrie lemu a čáry se uvolňují jen jednou. Ostatní běžné čáry používají původní větev rendereru.

Popisky separatrix, SOL, x-bodu a terčů mají světlý podklad a odkazové čáry. Spodní popisky jsou v oddělených řádcích u pravého okraje. Nejasný popisek soukromý tok nahrazen oblastí mezi větvemi divertoru; fyzikální pojem private flux region je vysvětlen v dialogu. Doplněno vysvětlení magnetického toku v jednotkách Wb a jeho odlišení od tepelného a neutronového toku. Zdroje: Entler–Kindl kap. 7.9, 7.11–7.12 a ITER School boundary physics. Numerické rovnováhy beze změny.

Ověření: 97 rovnováh a dynamický KaTeX, skutečné Three geometrie s mock GPU, společné confinement regrese. Nový test ověřuje obě šířky pásů, hloubkový test, XYZ bez pomocného úhlu a aktualizaci viewport uniformu při použití cache. Skutečný WebGL snímek v prohlížeči nebyl v tomto kroku pořízen.

### Revize čitelnosti podle uživatelského snímku

Předchozí široký lem a dlouhé spojnice nevyhověly. Nahrazeny jemnou siločárou: modré jádro 1,8 px v řezu / 2,1 px ve 3D a jen úzké bílé oddělení 3,2 / 3,5 px. Plné směrové hlavy zmenšeny na 4 / 4,5 px s obrysem 0,6 px. Výchozí Divertor nyní ukazuje schematické růžovofialové plazma bez kvantitativní mapy; barevné mapy se stupnicí zůstávají volitelné. Obnovení výchozího stavu používá stejnou volbu.

Dolní čtyři prvky mají číselné značky s krátkými odkazy a klíč vpravo, nikoli dlouhé spojnice přes plazma. Separatrix má svislý krátký odkaz, SOL vodorovný krátký odkaz. Měřítko řezu se nemění. Regrese ověřuje nepřekrývající se řádky klíče a jeho meze pro plochy 380×540, 580×600 a 800×600. Canvasové náhledy těchto rozložení s přibližnou textovou vrstvou byly vizuálně prohlédnuty; nejde o skutečný HTML/WebGL screenshot. Matematika navíc ověřena skutečným KaTeXem. Numerický model beze změn.

### Popisky podle obr. 7.18, aktivní cívky a dvojklik — místní změny po předání

Přímo prohlédnut obr. 7.18, s. 158, v knize Entler–Kindl, Jaderná fúze a fúzní elektrárny; srovnána kap. 7.9, obr. 7.16 a kap. 7.11–7.12. Obrázek rozlišuje okrajovou vrstvu uvnitř separatrix, vrstvu SOL vně, první stěnu, X-bod a divertorové terče. Okrajová vrstva v předchozím modelu chyběla. Doplněn žlutý vektorový pás mezi tokovými hladinami 0,90 a 0,999 v základním pohledu bez kvantitativní mapy; tento volený interval je schematický, nikoli vypočtená transportní bariéra. Kvantitativní mapy nepřetírá. Separatrix používá vektorovou numerickou aproximaci stejně jako dříve.

Základní legenda a popisky nově používají magnetický povrch, okrajová vrstva, vrstva SOL, první stěna, X-bod a terče. Výchozí hnědé označení private flux region a jeho popisek/číslo 3 odstraněny; není to označení převzaté z obr. 7.18. Okrajová vrstva má vlastní slovní popisek bez čísla 3. Obrys materiálového kontaktu v poloidálním řezu představuje první stěnu, nikoli vnější plášť vakuové nádoby. Nádoba a blanket zůstávají samostatnými konstrukčními součástmi prostorové ilustrace.

Právě ovládané cívky mají v celkovém řezu měděné zvýraznění, rámeček a výrazný název. Detail řezu nemění měřítko: cívky mimo jeho záběr ukazuje malým označením se směrovou šipkou; skutečná poloha je k vidění při explicitní volbě Celý řez. Ověřeny PF2/PF5 pro svislý posun, PF3/PF4 pro radiální posun a jediná PF1 pro samostatný pokus. Při změně tlaku nejsou označené žádné měnící se cívky. Odstraněno tlačítko Srovnat; dvojklik v prostoru obnovuje pouze kameru, ne stav experimentu.

Položka mapy přejmenována na Normalizovaný magnetický tok, posuvník na Výběr magnetického povrchu. Ve výkladu výslovně odlišena bezrozměrná normalizovaná souřadnice povrchu od magnetické indukce v teslech. Testy 97 rovnováh, skutečných Three geometrií a canvasových náhledů ve třech rozměrech prošly; všechny změněné výrazy prošly KaTeXem. Tyto úpravy vznikly po commitu 85bb18c a nejsou součástí jeho původního předávacího ZIPu; nový push ani další předávka nebyly automaticky provedeny.

### Fialová obálka a hranice normalizovaného toku

Opravena záměna ve 3D: předchozí výrazná fialová plocha byla právě vybraný magnetický povrch, takže mohla působit jako změna celkového objemu při pohybu výběrového posuvníku. V základním pohledu nyní fialová obálka sleduje mez uzavřené oblasti do separatrix (numerická uzavřená aproximace psi_N=0,999). Vybraný povrch je samostatná slabě modrá plocha s výraznou modrou siločárou. Kvantitativní mapy dál patří k vybranému povrchu; kontextová obálka je u nich jen slabá neutrální. Vnější hranice uzavřené oblasti závisí na vypočtené rovnováze, ne na výběrovém posuvníku.

V řezu fialové pozadí sahá ke stejné numerické hranici; žlutý vektorový pás zvýrazňuje zvolený interval 0,90–0,999. Přechod fialové a žluté není samostatná fyzikální separatrix. Přímo v legendě uvedeno schematické vyznačení okrajové vrstvy; přesná volba hladiny a absence transportního výpočtu vysvětleny v dialogu. Vrstva SOL obsahuje plazma také vně separatrix, ta tedy není hranicí nulové hustoty částic.

Nová regrese skutečné generované GPU geometrie porovnává otisky obálky a vybraného povrchu při předvolbách separatrix/SOL/vnitřní povrch: obálka je přesně stejná, vybraný povrch se mění. Změna proudu cívek naopak mění i obálku. Ověřeno spolu se všemi 97 rovnováhami a canvasovým vykreslením. Nadále místní úpravy po předání 85bb18c; bez automatického push.

### Fyzikální oblasti a význam předvoleb — další zpřesnění

Ostrý přechod na zvolené hladině psi_N=0,90 zrušen: statická magnetická rovnováha neurčuje univerzální vnitřní mez okrajové vrstvy ani šířku pedestalu. V základním řezu se vykresluje plynulé žluté schematické zvýraznění uvnitř separatrix s intenzitou směrem k okraji. Parametr útlumu je pouze grafický, není transportním výsledkem. Kvantitativní mapy se tím nepřetírají. Vnější numerická hranice uzavřené oblasti zůstává vypočtená hladina 0,999 jako aproximace separatrix 1.

SOL nyní odpovídá oblasti otevřeného toku vně uzavřené oblasti uvnitř materiálového obrysu (psi_N>1), s vyloučením materiálu dómu. Ukončení šrafování na psi_N=1,09 odstraněno; hladiny 1,025 / 1,055 / 1,09 jsou pouze příklady vykreslených siločar. Zrušena také 3D obálka na 1,09, která mohla působit jako vypočtená hranice SOL; zůstávají reprezentativní otevřené křivky v poloidálních řezech. Oblast mezi divertorovými větvemi nemá popisek ani číslo 3.

Primární výklad: Entler–Kindl, Jaderná fúze a fúzní elektrárny, obr. 7.18, s. 158, kap. 7.11–7.12, s. 158–160; kap. 7.13.1, s. 160. Odborné doplnění: ITER Fusion Glossary (Separatrix/Scrape-off layer), https://www.iter.org/fusion-glossary?field_alphabets_value=S; P. A. Schneider a kol., Differences in the H-mode Pedestal Width of Temperature and Density, EFDA–JET–PR(11)61, https://scipub.euro-fusion.org/wp-content/uploads/2014/11/EFDP11061.pdf, zejména metody určení vrcholu a šířky pedestalu z profilů. Tato práce neposkytuje univerzální hladinu toku pro vnitřní mez okraje.

Tlačítka zůstávají funkčními rychlými volbami jedné křivky, nově Vnitřní povrch / Separatrix / Siločára v SOL. Nezapínají regiony a nemění plazmovou obálku. Canvasová regrese kontroluje pixely SOL pouze pro psi_N>1 včetně hodnot nad 1,09 a žluté zvýraznění pouze pro psi_N<1. Prošly i testy 97 rovnováh, Three geometrií, aktivních cívek, dvojkliku a matematické sazby. Náhled řezu 380×540 vizuálně prohlédnut s přibližnou textovou vrstvou, skutečný WebGL v prohlížeči nebyl nově otevřen.
