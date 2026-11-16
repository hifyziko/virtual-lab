# Aktuální stav předání

## 16. listopadu 2026 — oprava prvního otevření BLDC (místní, bez pushe)

Modul dc15-bldc (BLDC · elektronická komutace) postrádal v progresivním
sestavení závislost dc-bldc-fields. První otevření bez předchozí návštěvy
dc16-bldc-poloha končilo ReferenceError: DCBLDCFieldBasis is not defined,
ještě před vykreslením řezu motoru a dokončením připojení modulu.
Závislost doplněna v tools/build-progressive-web.cjs. Regresní test otevírá
skutečný renderer z dodávky v izolovaném kontextu, ověřuje motor, můstek,
diagram, napěťové průběhy a přepnutí všech šesti stavů. Původní dodávka
v tomto testu prokazatelně selhala. Vzhled se neověřuje spuštěním prohlížeče.
Obě dodávky aktualni přestavěny; tools/project/check.cjs včetně nové
regrese BLDC prošel, stejně jako test-module-window-fit.cjs. Push neproveden.

## 16. listopadu 2026 — ověřeno pro výslovně požadovaný push

Úplné sestavení build-release úspěšně dokončeno; dřívější chyba Missing
home group anchor se v aktuálním zdroji již neobjevila. Lokální Windows
zápisy vyžadovaly existující dočasný retry preload, který není součástí webu.
Obě dodávky znovu sestaveny ze zdrojů, bez ruční obnovy manifestů.
Projektové testy a kontrola veřejných souborů prošly. Součástí změn jsou
stromová navigace, jemné podklady, opravy a grafika fúze, ovládání indukce
a zesílené zvuky s novým jiskřením. Níže jsou historické průběžné poznámky.


## 16. listopadu 2026 — vyskakovací hlášení jen při blokaci (místní, bez pushe)

Na pokyn uživatele statusPopup ve fúzním experimentu nezobrazuje běžné informace
o letu, průchodu, produktech či dokončení, ani když jsou dlouhé. Zobrazí se jen
u výslovně označené blokace (např. nepřípustný výstřel, chybějící projektil,
selhání přípravy nebo zastavený výpočet) s vysvětlením dalšího postupu.
Tlačítko Blokace umožní po zavření znovu přečíst pouze tuto blokující zprávu.
Běžná zpráva v levém panelu se zobrazí celá, jen pokud se skutečně vejde do
vyhrazeného místa podle scrollWidth/Height a clientWidth/Height. Jinak zůstane
místo prázdné, bez zkrácení, posuvníku nebo přerozdělení rozměrů. Při změně
velikosti se kontrola opakuje. Záznam přehrávání uchovává i druh zprávy.

Pravidlo je uložené v kořenovém AGENTS.md a versions/PRAVIDLA_LADENI_MODULU.md.
Test ovládání pokrývá běžné dlouhé zprávy, oba směry přetečení, nulové místo,
opětovné zobrazení po zvětšení i otevření/zavření blokace. Modelové a přehrávací
kontroly z test-fusion-visual-contract.cjs prošly. Vzhled nebyl ověřen prohlížečem.
Souběžné úpravy fúze a dalších modulů se zachovávají.

## 16. listopadu 2026 — stručné průvodce modulů podle literatury (místní, bez pushe)

Upřesnění uživatele: v nápovědě necitovat jeho prezentace ani pracovní název
obrazové složky. Skenované dvoustrany jsou Bartoš: Teorie elektrických strojů;
tento název je opraven v mapě i příslušných bibliografických údajích nápovědy.

V aktuální aplikaci je doplněno 57 krátkých průvodců: ovládání, dvě podstatné
souvislosti, případný vztah a odkazy na navazující pokusy. Hlavním českým
podkladem je ověřený Chmelíkův sken stejnosměrných a komutátorových strojů
s teorií obecného stroje; doplňuje jej Fitzgerald a stávající referenční podklady.
Chapman zůstává označen jako Instructor’s Manual. Přesný rozsah selektivní
revize a mapa k modulům jsou v docs/LITERATURA-MODULY.md; nejde o kontrolu
celých knih ani kompletní revizi fyziky všech modelů. Knihy a skeny se do webu
nepřidávají. Kopylov nebyl použit podle dřívějšího pokynu v referenčních poznámkách.

Tlačítko otazníku u pravého dolního okraje (na širokém okně „Ovládání a výklad“)
otevírá samostatný modální dialog. Průvodce se nevkládá do měřených pracovních
ploch ani hlaviček a nemění jejich rozměry či škálování. Simulaci neresetuje;
pokus může pod nápovědou pokračovat. Escape zavře nejprve nápovědu. Zdroje:
tools/module-guide-data.js, module-guide.js a module-guide.css; integrace přes
build-physics-preview.cjs. Tři historické odkazy galerie sdílejí její výklad.

Obě dodávky aktualni sestaveny; prošly tools/project/check.cjs (včetně nového
test-module-guide.cjs a progresivního načítání), test opakovaného škálování
Web/test-module-window-fit.cjs a dodatečná kontrola skutečného DOM/KaTeXu pro
všech 57 dialogů. Pracovní DOM při otevření a zavření zůstává shodný. Prohlížeč
se neotevíral, překryvy a čitelnost nejsou vizuálně ověřené. Souběžné změny
fúzního modulu v jiném chatu se zachovávají a nejsou součástí této úpravy.

## 16. listopadu 2026 — více prostoru pro graf (místní úprava)

Předchozí stav 853c2a5 byl na výslovný pokyn odeslán a nasazen.
Tato úprava zatím odeslána není. Spodní údaje zabírají 72 místo 100 px,
graf má spodní okraj 42 místo 75 px. Trvalé E/Uc a U okolí odstraněny;
hodnota okolí je v legendě po najetí nebo zaměření klávesnicí.
Český popisek odhadu je běžný text, bez sazby diakritiky přes KaTeX.
Nevypočtený bod obratu ukazuje pomlčku místo NaN. Počet jader je opět
přímo v hlavním panelu pod tlačítky. Obě dodávky aktualni přestavěny.
Vizuální kontrola v prohlížeči neproběhla.
Nabídka Nastavení je na přání uživatele přejmenovaná na Ovládání a návod.
Z uživatelského návodu odstraněna věta Podklad s odkazem na učebnici, oddíly a strany.


## 16. listopadu 2026 — stabilní graf a jednodušší ovládání fúze (bez dalšího pushe)

Po nasazení f6700e1 uživatel upřesnil, že příprava přidává ovládání děla
a zmenšuje graf. Horní ovládací řádek má nyní stálých 220 logických pixelů,
údaje pod grafem 100; ani změna režimu, větve či délky stavové zprávy
nepřerozděluje plochu grafu. Stavová zpráva je u akčních tlačítek, mimo graf.
Vystřelit má trvale stejné místo; v ručním režimu je neaktivní.

Na přání uživatele jsou přepínače Pole a Siločáry v řádku s názvem.
Zvuk, počet jader, styl siločar, přesný náměr a volba navazující reakce jsou
v Nastavení. V hlavním panelu zůstávají režim, dvojice/větev, teplota
a příprava/výstřel/návrat. Všechny původní funkce a jejich ID zůstávají.
Obě dodávky aktualni včetně lazy balíčků aktualizované; projektové testy
prošly. Regresní test ověřuje stálou přítomnost tlačítka a správné povolení
výstřelu. Skutečný obraz prohlížeče nebyl vizuálně zkontrolován.
Předchozí push byl dokončen a nasazen; tato další úprava je pouze místní.

## 16. listopadu 2026 — malý displej a příprava fúzního pokusu (bez pushe)

Uživatel hlásil překrývání panelů hlavního fúzního experimentu na menším
notebooku. Později upřesnil, že příprava místně funguje, ale na webu je
tlačítko zašedlé a ostatní ovládání funguje. Při kontrole byl aktuální
zveřejněný `app.js` shodný s místním výchozím souborem (balíček
`fusion-fu01-reakce-e5e1d31dde0494e7.js`). Přesný stav uživatelovy webové
relace nebylo možné přečíst: nástroj odmítl přístup k již běžícímu Chromu
podle své politiky. Nový prohlížeč ani karta nebyly otevřeny.

Experiment nyní škáluje společnou logickou plochu 1360 × 820 podle šířky
i výšky viewportu. `barrier/layout.js` nastaví měřítko synchronně před
inicializací a přepočítává je při resize/fullscreen bez zpětné vazby ze
škálovaného obsahu. Hlavička, laboratoř, přehrávání a patička jsou ve stejné
vystředěné ploše. Závěrečná pravidla CSS sjednocují dřívější konfliktní
breakpointy; canvasy jsou vyjmuté z výpočtu přirozené velikosti gridu.
Souřadnice kliknutí, tažení, míření, posouvání a zoomu jsou převedeny do
logického canvasu. Rozlišení 2D i původního WebGL rendereru respektuje
skutečnou zobrazovanou velikost, aby zmenšení nezvyšovalo zbytečně zátěž GPU.

Příprava již není zakázaná jen kvůli tunelování, návratu nebo probíhající
reakci. Nabízí nový pokus; probíhající reakce/tunelování se ukončí a obnoví
se uložené vstupní částice. Platí i pro obě p-p volby a klávesnicové ovládání.
Chybějící projektil nadále přípravu znemožňuje, ale důvod je v titulku.
Hledání směru používá stejný numerický postup, rozdělený na krátké kroky
s přibližně 4ms rozpočtem. Zobrazuje stav a lze je zrušit; změna parametrů
zahodí zastaralý výsledek a výstřel nemůže předběhnout přípravu.

Obě aktivní dodávky přestavěné, včetně odložených dokumentů a manifestů.
Prošlo úplné sestavení (s lokálním opakováním dočasně zamčených zápisů,
viz níže), následná aktualizace fúzní dodávky a `tools/project/check.cjs`.
Nový `tools/test-fusion-controls.cjs` ověřuje počáteční fit, resize/fullscreen,
souřadnice při 0,65× / 1× / 1,5×, přípravu, shodu směru s původním solverem,
zrušení, p-p volby a nový pokus v dříve blokovaných stavech. Renderovací test
ověřuje rozlišení zmenšeného canvasu. DOM a grafické příkazy jsou simulované;
skutečné rozložení na notebooku ani webová relace nejsou vizuálně ověřené.
Nejde o potvrzení příčiny specifické pro HTTP. Verze zůstává 1.0, bez pushe.

## 16. listopadu 2026 — další odlehčení úvodního načítání (bez pushe)

Volitelná animace „Pole v transformátoru“ už není vložena do úvodního HTML.
`tools/build-progressive-web.cjs` ukládá celý původní dokument do samostatného
balíčku `dialog-transformer-field` v `web/lazy/`; načítá se až po otevření
dialogu. Původní data, renderer a ovládání zůstávají beze změny (ověřeno SHA-256
proti `transformator/pole-transformatoru-live.html`). Loader ukazuje průběh,
umožňuje opakování při chybě a používá cache v otevřené stránce. Zavření dialogu
zabrání pozdnímu spuštění animace; opětovné otevření načtená data nestahuje.
Podporováno HTTP(S) i místní file://. Manifest má nyní 41 odložených souborů;
publikace i soukromé předání je vybírají přes `progressiveFiles`.

Naměřená velikost úvodního HTML: 2 446 033 → 1 753 572 bajtů (−28,3 %).
Zkušební gzip v Node: 1 299 070 → 781 735 bajtů (−39,8 %).
Jde o objem dat, nikoli měření doby načítání v prohlížeči nebo skutečné
komprese na Pages. Celý obsah je zachován; data animace se pouze odkládají.

Obě dodávky aktualni sestaveny a jejich indexy jsou totožné. Prošlo
`tools/project/check.cjs`, včetně všech původních testů a nových kontrol
dialogu: zavření před zahájením i během stahování, opakování po chybě,
cache a oba způsoby načítání. Prohlížeč nebyl otevřen; vzhled ani skutečná
rychlost vykreslení nebyly vizuálně měřeny. Verze aplikace zůstává 1.0.

Na tomto Windows bylo nutné opravit vlastníka kořenové složky `.git`,
aby fungoval sandbox. Při sestavení se navíc opakovaně objevil přechodný
`UNKNOWN` při otevření velkého generovaného HTML k zápisu. Úplné sestavení
doběhlo s místním dočasným opakováním těchto zápisů; tento pomocník není
závislostí projektu ani součástí veřejných zdrojů. Příčina zámku není ověřena.
Nadbytečné prázdné řádky vzniklé přestavěním sledovaného zdrojového HTML
byly vráceny; změny fyzikálních modulů nejsou součástí této úpravy.

## GitHub a přenos — 15. listopadu 2026

### Předání na další počítač a schválený push

Uživatel po dokončení přehledové galerie výslovně požádal o soukromý
předávací ZIP a push posledního stavu. Tím nahradil předchozí zastavení
pushe. Předává se celý aktuální vývoj včetně souběžných úprav fúzních reakcí,
vlnového balíčku, společné galerie a navigace. Označení aplikace zůstává 1.0;
konkrétní stav určuje commit a `_handoff/state.json` v soukromém ZIPu.
ZIP obsahuje literaturu, malé zdrojové modely, aktuální web a Git/LFS historii.
Na dalším počítači rozbalit do nové složky, spustit
`node tools/project/restore.cjs` a přečíst pravidla. Další běžný postup je
Pull → úpravy → Commit → Push; další push opět pouze na výslovný pokyn.
Historické poznámky „bez pushe“ níže se vztahují k tehdejším dílčím úpravám.

### Fúze a galerie v projektu — místní změna 15. listopadu 2026

Oprava černého pole a ostrosti: původní zamýšlené čištění canvasu se kvůli
neúspěšné textové náhradě nepropsalo. Nyní se před každým snímkem vypne
scissor a celý buffer vyčistí světlou barvou pozadí; test kontroluje pořadí
i barvu. Limit 480 tisíc pixelů / 1024 px nahrazuje 6 milionů pixelů / 4096 px,
s podporou devicePixelRatio do 2 a adaptací podle výkonu. Ochrana fronty GPU
i uvolnění kontextu zůstávají aktivní. Test vyžaduje na velkém okně skutečně
vyšší rozlišení. Bez pushe.

Aktuální přání: menší modely a všechny současně. Výchozí volba „Vše“ ukazuje
13 různých modelů (9 částic/jader a 4 atomy), po pěti sloupcích na širokém
displeji. Filtry skupin zůstávají dostupné. Celý canvas se před vykreslením
vyčistí barvou pozadí, takže neobsazená pole nejsou černá. Push je po pokynu
„stop“ stále odvolaný; tato další změna se neodesílá.

Na další přání uživatele galerie znovu zobrazuje celou vybranou skupinu
současně: 5 částic, 5 jader nebo 4 atomy v přehledové mřížce. Na úzkém
displeji má dvě kolony. Zachovává jediný grafický kontext, společný omezený
kreslicí buffer a ochranu před hromaděním snímků na GPU.

Poslední oprava po snímku obrazovky: prázdnou galerii způsobilo chybné
zařazení jejího vnějšího rámu do nativního škálování `module-window-fit.js`.
To přidávalo `uniform-module-layout`, přepsalo výšku hostitele na `auto`
a iframe se zhroutil na výchozích 150 px. Obal má nyní správné označení
`imported-workspace`, takže si oba vložené fúzní moduly zachovávají
responzivní výšku. Regresní test se skutečným společným škálováním před
opravou selhal a po opravě prochází; pokrývá i staré odkazy galerie.
Navíc byl opraven pevný limit vzdálenosti 20 v ray marchingu: při automatickém
oddálení v nízkém okně skrýval model. Počet kroků i hranice modelu zůstávají
omezené, test pokrývá vzdálenější kameru pro částice, jádra a atomy.

V katalogu jsou dva vstupy: experiment `#fu01-reakce` a na další žádost
uživatele sjednocená galerie `#fu02-galerie`. Galerie přepíná částice (5),
jádra (5) a atomy (4), vždy s celou skupinou zobrazenou současně.
Původní odkazy `#fu02-jadra`, `#fu03-atomy` a `#fu04-castice` zůstávají
funkční jako vstupy do příslušné skupiny této jediné galerie. Také původní
přímé HTML adresy jsou zachované. Skupina `#group-fusion` patří do Plazma a fúze.

Společná hlavička, návrat a barevnost jsou ve
`versions/vyvoj/m_files/fusion/navigation/`, ve webu v `shared/fusion/`.
`build-progressive-web.cjs` připravuje dva balíčky `lazy/fusion-*.js` s HTML,
skripty, CSS i fonty. Vkládají se až při otevření přes `srcdoc`; galerie a její
staré odkazy sdílejí jeden balíček. Celkem je 40 odložených souborů.
Samostatné sestavení galerie obnovuje i tyto balíčky a manifest.

Po předchozí změně načítání uživatel dál hlásil nefunkční galerii a následně
„This page crashed“. Přesná příčina pádu prohlížeče nebyla potvrzena.
Galerie má kreslicí buffer nejvýše 480 000 pixelů / 1024 pixelů na delší
straně a nejvýše 30 snímků/s. Galerie i fúzní renderer neřadí další snímek
za vytíženou GPU. Souběžné úpravy fúzního experimentu vrátily jeho vlastní
rozlišení a snímkování; omezení galerie se na něj již nevztahují.
Galerie přepíná skupiny v jednom grafickém kontextu; odchod výslovně ruší
animaci a uvolňuje grafické prostředky. Vzhled povrchů a fyzikální modely
se nemění. Zdroj fúzních reakcí se dál upravuje souběžně v jiném chatu.

Kontroly v `tools/test-fusion-render-lifecycle.cjs` pokrývají přepínání,
počet kontextů, velká okna, omezení fronty snímků a opakovaný úklid;
grafické příkazy jsou zde simulované. Navigační test ověřuje sdílení balíčku,
staré odkazy, uvolnění dítěte a veřejné závislosti. DOM kontroly používají
skutečný KaTeX. Skutečné vykreslení WebGL ani odstranění pádu v uživatelově
prohlížeči nelze těmito testy potvrdit; nástroj pro vizuální kontrolu dříve
odmítl místní file:// adresu. Změny jsou pouze místní, v obou dodávkách aktualni.
**Bez pushe.**

### Návrat do nadřazeného tématu — místní změna 15. listopadu 2026

Na žádost uživatele je tlačítko „↑ O úroveň výš“ přesunuté z horních zkratek
přímo pod banner oblasti, před podtémata. Má výrazné pozadí v barvě oblasti,
minimální výšku 48 px a na úzké obrazovce plnou šířku. Z oblasti vede na hlavní
rozcestník, z podtématu do jeho oblasti; v hlavním rozcestníku se nezobrazuje.
Zdroje: `tools/physics-preview.js` a `tools/physics-preview.css`.
Obě dodávky aktualni jsou sestavené; prošla kontrola `tools/project/check.cjs`
a DOM kontrola umístění a cílů odkazů pro všechny oblasti a podtémata.
Prohlížeč nebyl otevřen. **Změna tlačítka zatím nebyla pushnutá.**

### Postupné načítání — místní změna 15. listopadu 2026

Úvodní HTML bylo zmenšeno z 100 942 297 na 2 432 242 bajtů (o 97,6 %).
Třicet dva vložených lekcí a šest skupin numerických dat se sestavují
do 38 souborů `web/lazy/`. Stahují se až při otevření příslušného modulu,
s viditelným průběhem, návratem během načítání a opakováním při chybě.
Zdrojové HTML, matematické modely a původní renderery se zachovávají;
shoda všech přesunutých lekcí a dat je kontrolována SHA-256.

Změna je součástí `node tools/build-release.cjs`, publikace i soukromého ZIPu.
Obě dodávky aktualni jsou aktualizované. Veřejný výběr má nyní 192 souborů
(154 původních a 38 načítaných podle potřeby), celkem přibližně 177 MiB.
Celkový obsah zůstává zachovaný; zmenšil se objem potřebný při vstupu.

Prošlo úplné sestavení, `tools/project/check.cjs`, audit 440 veřejných zdrojů,
příprava publikačního výstupu, kontrola shody obou dodávek a místní DOM test
všech rozcestníků i odložených modulů. Testy zahrnují přímé odkazy, cache,
odchod během stahování, retry, odmítnutí poškozených dat a režim file://.
DOM test používá náhrady canvasu; prohlížeč se neotevíral a vzhled nebyl
vizuálně ověřen. Uživatel 15. listopadu 2026 výslovně schválil push tohoto
zrychlení pro vyzkoušení. Skutečné nasazení potvrzuje úspěšný běh Pages;
rozpracované změny fúzního modulu se tímto pushem nezveřejňují.

Push zrychlení byl dokončen commitem `11b8cd2`. GitHub Pages běh
`43727926261` úspěšně sestavil a nasadil web. Z veřejné adresy bylo staženo
a pomocí SHA-256 ověřeno úvodní HTML (2 432 238 bajtů) i tři samostatné
balíčky lekcí/dat proti přesně odeslanému sestavení. Rozpracovaná fúze
zůstává místně; v tomto pushi nebyla zahrnuta.

Níže uvedené počty a monolitické HTML popisují původní stav propojení.

Nejnovější pokyn uživatele: práce na fúzním modulu stále probíhá. **Další push
pouze na výslovné požádání.** Neposílat automaticky ani změny pravidel či tagy.
Přenosový balíček může nést dosud neodeslané místní commity. První schválený
projektový commit na GitHubu je b30b5f1; další rozpracované změny zachovat.

Schváleno: veřejný Git obsahuje minimum upravitelných zdrojů, pravidla a
sestavovací nástroje; Pages pouze prezentační soubory. Literatura se přenáší
v soukromém balíčku. Nepotřebné surové FEM výsledky se po ověření odstraňují;
malé modely a skripty zůstávají pro případný přepočet na požádání.

Přesný postup: PREDANI_PROJEKTU.md, pravidla AGENTS.md. Veřejný výběr:
config/project-files.json. Git historie navazuje na existující úvodní README.
Předávací ZIP vytváří node tools/project/handoff.cjs; obnova na novém počítači
node tools/project/restore.cjs. ZIP obsahuje literaturu a nesmí se zveřejnit.

Místně ověřeno: čisté sestavení z veřejného seznamu (přibližně 334 MiB),
bez literatury a bez machines-fem. Prezentační výběr má 154 souborů, přibližně
177 MiB. Datové soubory animací se shodují s původní dodávkou; sestavení hlavního
HTML pouze přidává dva prázdné řádky. Kontroly navigace, synchronizace, Parkovy
transformace, komutace, částic a Coulombova modelu prošly. Opraven zastaralý test,
který čekal čtyři soubory bariéry před doplněním fusion.js. Obsah modulů nezměněn.
Průběžné souběžné změny app.js/fusion.js fúzního modulu byly zachovány a do
kontrol je zahrnut také aktuální test-fusion-dt.cjs. Propojení nemění vzhled ani
fyzikální obsah modulů. Vizuální kontrola prohlížečem nebyla provedena a prohlížeč
se automaticky neotevíral.

Odstraněno devět adresářů nepoužívaných FEM výsledků a cache v
versions/vyvoj/m_files/machines-fem/dc-bldc (přibližně 1,99 GiB).
Modely .aedt, skripty, parametry a 19 malých metadat/obrysů v recompute-inputs
zůstaly zachované. Původní chráněné zálohy a literatura jsou nedotčené.

Publikační workflow se spouští při pushi do main. Stav skutečného nasazení
ověřujte v GitHub Actions; neodvozujte jej jen z místního sestavení.

## Výukové moduly — stav z 14. listopadu 2026

Tento dokument má přednost před historickými poznámkami o stavu projektu.
Aktivní kód je v `versions/vyvoj/m_files`. Hlavní sestavení je
`node tools/build-release.cjs` z kořene. Hotová aplikace je
`versions/aktualni/web/index.html`. Pravidla jsou v kořenovém a vnořených
AGENTS.md a v `versions/PRAVIDLA_LADENI_MODULU.md`.

## Poslední práce

- Synchronní stroje: modul `sm12-synchronizing`, zdroje `Web/synchronous/synchronizing*`.
  Dva rotory, budicí pole, nastavitelná klec, fázory a rozdílová napětí,
  indukčnosti a fáze na obou stranách spínače, přehrávání a proudy/moment.
  Opačný sled omezen na prvních 120 ms, skutečné otáčky jsou uvedeny.
  Fyzikální zjednodušení a testy: `m_files/reference/synchronous/README-synchronizing.md`.
- Parkova transformace: `sm08-rotor-dq`, soubory `rotor-dq-*` a `rotor-dq.js`.
  Tři sloupce: řezy, grafy, trvale viditelný výklad se živým výpočtem.
  Barevné čárkované průměty, větší popisky grafů; rovnice d/q zarovnané.
- Rozložení těchto modulů nastavuje také `Web/machine-window-layout.css`.
- Komutace DC: vysvětleno L_sigma a odstraněny kolize popisků se šipkami
  ve společném `Web/synchronous/machine-art.js` a `Web/direct-current/commutation.js`.
- Vzhled domovské stránky doplňují kořenové `tools/physics-preview.*`
  a `tools/physics-visual.*`. Neupravovat pouze hotový HTML výstup.

## Ověření a omezení

V této oddělené kopii bylo znovu provedeno celé sestavení, navigační kontrola,
testy fázovacího modelu a DOM ovládání, Parkovy transformace a komutace.
DOM test používá přibalený `tmp/sync-tests/linkedom.mjs` (LinkeDOM 0.18.12).
Nejde o browserovou kontrolu rozložení. Poslední rozložení Parkovy transformace
je vhodné na novém počítači vizuálně zkontrolovat při běžném a celém okně.
Prohlížeč se při sestavení automaticky nespouští.

Historické poznámky zůstávají v `versions/vyvoj/PREDANI_PROJEKTU.md`.
Literatura a referenční podklady jsou přibalené; Chapmanův PDF soubor je
Instructor’s Manual, nikoli plný text učebnice. Balíček je určen k předání
projektu, nikoli k veřejnému zveřejnění přiložené literatury.


### Coulombova bariéra — rozpracovaná lokální změna 15. 11. 2026
Pohyblivé cíle při výstřelu, zamknuté při ručním ovládání a míření. Shift + tažení rozmísťuje jádra. Afinní projekce a společný integrátor predikce/letu; viditelná měkká vnější stěna pouze pro nabité částice. Bez automatického zoomu. Detaily a omezení v docs/fuze/COULOMB-MODEL.md, test tools/test-coulomb-mobile.cjs. Kreslené značky jsou zvětšené a mohou se při blízkých setkáních překrývat; dále ladit podle uživatelské vizuální kontroly. Git pull v této relaci selhal na zápisu .git/FETCH_HEAD (omezená oprávnění); změna není tímto krokem publikovaná.

Ověřeno po úpravě: úplné sestavení aktualni, testy navigace a modelů z project/check, nový test mobilních jader, lokální DOM test ovládání/fúze a audit veřejného seznamu (436 souborů). Audit bylo nutné spustit mimo omezený proces kvůli EPERM při spuštění Gitu; prošel. Prohlížeč neotevřen, vizuální vzhled neověřen.

Doplnění: libovolné jádro lze kliknutím/uchopením vybrat jako projektil. Každé těleso zachovává vlastní druh, A a Z i po výměně rolí. Shift pouze přesouvá. Testy výběru, letu, smíšených druhů a navazující D–T prošly; automatická vizuální kontrola nadále neprovedena.

Opraveno ruční přiblížení: opět dosahuje energetické hladiny U=E, odstup zvětšené kresby řeší pouze ruční grafická značka středu. Predikce děla je dávkovaná, aby náměr neblokoval UI. Test 80 změn úhlu a tří teplot prošel; viz docs/fuze/COULOMB-MODEL.md.

Aktuálně obnovován a ověřen řetězec výstřel–tunel–D–T: aktivace deuteronu před volbou cíle, dokončení náhledu před výstřelem bez opětovného přezbrojení. Přidán uživatelem zvolený samostatný detail a větší oblast doletu; odsouvání kresby projektilu odstraněno.

Poslední pokyn: detail odstranit. Panel odstraněn, těsné průlety řeší pouze zmenšení kreslených značek (včetně jejich popisků) bez změny skutečných poloh nebo trajektorie. Fyzikální kontakt se nadále posuzuje podle R v modelu.

Nejnovější pokyn: střelba pouze deuteronem, jiné konfigurace bez D mají dělo neaktivní. Velikosti jader pevné; místo zmenšování se didakticky rozestupují kresby a mezera klesá s teplotou. Stejný převod pro náhled i let; fyzikální integrátor a graf nezměněné.

Po dokončené fúzi se při dalším uchopení scény obnovují vstupní jádra (bez převzetí produktů). Teplotní ovladač nyní 10–500 MK.

### Fúze všech nabízených dvojic a 10 MK — místní změna 15. listopadu 2026
Doplněn registr reactions.js a produkty všech nabízených dvojic, včetně volitelných větví D–D a p–p. Neutron–triton je pružný rozptyl bez tunelování. Dělo vybírá projektil podle dvojice. Kinematika zachovává energii a hybnost; tříčásticové výstupy ukazují zvolenou přípustnou konfiguraci, nikoli fyzikální rozdělení pravděpodobnosti.
Opraveno ovládání při 10 MK, normalizace pole nezávislá na teplotě, záběr po ochlazení, příprava směru a adaptivní časový krok pomalých produktů. Neutrální jaderný kontakt má numerickou toleranci 0,001 fm, aby integrátor nezastavoval těsně před kontaktem. Podrobnosti a zdroje: docs/fuze/COULOMB-MODEL.md.
Prohlížeč nebyl otevřen; ovládání je testované v DOM s náhradním canvasem, nejde o vizuální kontrolu. Změny nejsou publikované ani pushnuté.
Ověření: úplné sestavení dokončeno; modelové a integrační testy z tools/project/check.cjs prošly, jeho závěrečný audit Gitu byl kvůli sandboxu spuštěn samostatně a prošel (442 souborů). DOM průběhy všech devíti kanálů dokončeny při 10 a 500 MK se třemi cíli; neutronová větev ověřena bez tunelování. Samostatně prošlo opakované tažení a míření při 10 MK. Zdroje a obě aktuální dodávky mají shodné soubory modulu.

### Viditelné volby p–p — 15. listopadu 2026
Pro p–p nahrazují skrytou volbu větve dvě tlačítka přímo v ovládání: „Tunelování bez β⁺ rozpadu“ a „Tunelování s β⁺ rozpadem“. Kliknutí připraví vybraný průběh, zvýrazní tlačítko; Vystřelit spustí děj. Volba vynutí navázání správnými produkty dané větve, obecné zaškrtávátko a původní tlačítko přípravy jsou pro p–p skryté. Ostatní dvojice zachovávají své ovládání. Aktualizovány obě dodávky pomocí build-particle-library.cjs.

### Míření a počet cílů — místní změna 15. listopadu 2026
Náhled ukazuje pouze směr a první odklon u nehybných cílů, po výstřelu zmizí. Odstraněno nelineární obcházení zvětšených značek v náhledu. Volba cílových jader rozšířena na 1–5 (výchozí 3). Neúspěšné hledání přípustné připravené reakce je nyní výslovně hlášeno; běžný výstřel zůstává dostupný. Obě aktuální dodávky aktualizovány. Kontrola lokálního náhledu při 10/100/500 MK a 1/3/5 cílech prošla; testy sil a mobilních jader zůstávají úspěšné. Prohlížeč nebyl otevřen.

### Upřesnění délky mířidla — 15. listopadu 2026
Náhled nově pokračuje přes první bod nejbližšího přiblížení a krátce za něj, aby byl vidět odklon (do 1,2násobku vzdálenosti v bodě obratu, nejvýše 0,65 této vzdálenosti po dráze za obratem). Končí také při přechodu k dalšímu nejbližšímu cíli. Cíle v náhledu stojí; pod zvětšenými značkami se čára přerušuje, ale její tvar se neohýbá kvůli obrysům. Nahrazuje předchozí limit 15° / 85 % vzdálenosti, který končil příliš brzy. Ověřeno zachování poloh cílů a viditelný odchozí úsek při 10/100/500 MK, včetně čelního směru. Obě aktuální dodávky sestaveny, DOM test ovládání při 10 MK prošel.

### Viditelnost produktů a schválený pozitron — 15. listopadu 2026
Pozitron nově používá stejnou geometrii/povrch jako elektron, sytě fialovou barvu a e⁺; uživatel schválil shodný tvar s jinou barvou a e⁺. Definice je ve společném particles/style.js, dostupná také v katalogu částic. Renderer nastavuje barvu leptonu samostatně pro každou instanci. Popisky produktů se odvozují z druhu, nikoli z pořadí alfa/neutron. Foton a neutrino mají alespoň vlastní symbol, ne chybějící výstup. Společná rychlost přehrávání je omezena nejrychlejším odletem z aktuální polohy tak, aby byl za přímočarého odletu viditelný nejméně 3,4 s; fyzikální rychlosti ani jejich poměry se nemění. Po opuštění záběru zůstává označení mimo záběr.
Ověřeno DOM zachycením skutečných instancí rendereru: neutron viditelný 227 snímků, pozitron 540 snímků. Nejde o vizuální test WebGL v prohlížeči. Obě aktuální dodávky aktualizovány.

### Neutrino a uvolněná energie — 15. listopadu 2026
Schválená podoba elektronového neutrina: světlá částice s tmavým obrysem a νₑ. Přidána do společné definice, sdíleného shaderu, katalogu a fúzní scény; popisek je tmavý. Geometrický obrys je řízen pohledovým úhlem povrchu, nikoli rastrovou texturou. Opraveny druhově závislé energetické popisky všech produktů.
Při emisi produktů se objeví klidné zlaté podbarvení místa reakce a trvalá karta Uvolněná energie +Q MeV, odvozená z registru reakčních klidových hmotností. Pružné kanály ukazují nulové uvolnění bez zlaté záře. Karta se při resetu skryje; nejde o dodatečnou energii v integrátoru. DOM kontrola D–T a p–p β⁺ ověřila Q, reset karty a vykreslování neutrina (383 viditelných snímků). Modelové testy všech kanálů a sdílené knihovny prošly. Aktualizovány obě dodávky; vizuální ověření v prohlížeči neproběhlo.

### Oprava obcházení neutrina — 15. listopadu 2026
Odstraněno odsouvání nabitých kreseb před neutrálními částicemi v schematicItems. Výpočet sil byl správně bez Coulombovy síly neutrina, ale zobrazovací transformace vytvářela falešnou objížďku a návrat. Neutrální částice nyní nevytěsňují žádné jiné značky; platí shodně pro živé kresby, pole i stopy. Silné srážky neutronů zůstávají věcí fyzikálního modelu, slabé interakce neutrin zde nejsou simulovány. Ověřeno průletem neutrina, gama a neutronu kolem dvou protonů: jejich kreslené polohy se proti stavu bez neutrální částice nemění. Odsazení dvojice nabitých jader zachováno.
Energetické podbarvení zesíleno na krátký měkký zlatý impuls s maximem po 0,22 s, širší plochou a postupným útlumem. Bez tlakové vlny, fyzikální energie nezměněna. Obě aktuální dodávky aktualizované, regresní test sil a test dodávky prošly.

### Souhrnný audit fúzního modulu — 15. listopadu 2026
Zkontrolovány všechny reakční větve: devět kanálů při 100 MK, jejich energetické popisky a reset prvním gestem, devět kanálů se třemi cíli při 10 MK a 500 MK. Všechny tyto průběhy dokončeny. Ovládání (zoom, opakované uchopení, uvolnění a příprava náměru) prošlo maticí 1/3/5 cílů × 10/100/500 MK. Testovací náhrada WheelEvent potřebuje explicitní clientX/clientY; její původní NaN nebylo chybou aplikace.
Nový trvalý tools/test-fusion-visual-contract.cjs zahrnut do tools/project/check.cjs: žádná odchylka nabitých značek kvůli neutrálnímu průletu; žádná elektrická síla ani fiktivní jaderný kontakt neutrina/gama; náhled první zatáčky; shodné Q D–T v obou modelech. Sjednoceno dříve zaokrouhlené Q v fusion.js s klidovými hmotnostmi z registru. Energetické, hybnostní a částicové testy všech kanálů prošly.
Neutrino má jasnější perleťový střed a lépe vymezený tmavý okraj. Nejde o světelné záření neutrina; přímá viditelnost je jen ilustrace. Zdroj: https://neutrinos.fnal.gov/faq/how-do-we-detect-neutrinos/ (světlo detektoru pochází z nabitých sekundárních částic). Neutrinová hmotnost je v kinematice pro tyto energie zanedbána; slabé interakce při odletu nejsou simulovány.
Úplné sestavení dokončeno, modelové a integrační kontroly projektu prošly. Závěrečný read-only audit byl kvůli sandboxovému spawnSync git EPERM spuštěn samostatně a prošel (446 souborů). Prohlížeč nebyl otevřen a skutečný WebGL vzhled nebyl vizuálně ověřen; DOM testy používají náhradu canvasu. Nejde o tvrzení absolutní bezchybnosti ani o ověření fyzikálních aproximací jako přesného modelu plazmatu.

Následné výtvarné upřesnění uživatele: neutrino nesmí působit jako nakreslené kolečko. Plochá světlá výplň a výrazná kontura nahrazeny standardním prostorovým nasvícením sdíleného členitého povrchu, s perleťovým základním materiálem a pouze jemným ztmavením na okraji. νₑ zůstává tmavé a stabilní. Obě dodávky aktualizovány, test sdílené knihovny i regresní test neutrálních průletů prošel. Fyzikální výpočty se nezměnily.

### Sjednocení scén a zamítnutý automatický zoom — 15. listopadu 2026
Odstraněno dodatečné odsouvání jednotlivých nabitých kreseb. Společné automatické zvětšování vyzkoušeno jako ochrana proti překrytí, ale uživatel jej výslovně odmítl; bylo vypnuto. Pohled je opět klidný a částice se výtvarně neodsouvají. Otázka nepřekrývání zvětšených značek je nyní otevřená: uživatel vybírá mezi názornou konzervativní silou před viditelným povrchem a zmenšením značek při těsném průletu. Dokud neodpoví, fyzikální síly se nemění; nezaručujeme nepřekrytí.
Zůstává sjednocené počáteční rozmístění a oblast při stejné teplotě a počtu cílů pro všechny reakce, i společné pravidlo odletového času (bez normalizace podle nejrychlejšího produktu nebo zvláštního DT směru). Doba zobrazení produktů 18 s. Tyto změny jsou nezávislé na nedořešeném způsobu zobrazení těsného průletu.

### Schválená varianta: měkký povrch jen pro dělo — 15. listopadu 2026
Uživatel po odmítnutí zoomu i zmenšování schválil názorné měkké odpuzování při střelbě, s původním ručním přibližováním. Zavedena volitelná konzervativní přídavná energie U = K(2R/r − 1)^4 pro r < 2R, jinak nula. R je součet viditelných poloměrů převedených do scénových souřadnic při přípravě výstřelu. Síla je přesná záporná derivace tohoto potenciálu a působí na dvojici opačně. Není to další skutečná jaderná síla. Základní Coulombův potenciál a ruční dragTowards/multiAdvance jsou beze změny; graf dál ukazuje fyzikální bariéru, nikoli tento výtvarně motivovaný člen.
Přídavná síla je pouze v mobileAdvance (výstřel), v krátkém náhledu děla a v propagaci nabitých produktů. Neutrino, foton ani neutron ji nemají. Člen je zahrnut do vyhodnocení lokální energie při přípravě tunelu. Odletové produkty stejné právě vznikající reakce jsou do prvního vzájemného oddělení výjimkou z tohoto modelu povrchu; Coulombova interakce mezi nimi zůstává. Ostatní zdroje se nevrací výtvarnou korekcí. Výstřel z už překrytých nabitých značek je odmítnut s pokynem částici oddálit.
Zachován společný rozsah počátečního rozmístění pro všechny reakce, pevné značky a klidná kamera. Udržovací buňka má nadále explicitně názorný charakter. Přídavný člen znamená, že celá střelecká scéna již není přesnou Rutherfordovou simulací ve fm; tato odlišnost je uvedena v nastavení.
Trvalý test kontroluje gradient přídavného potenciálu, nulovou sílu pro neutrální částici, nepřekrytí při dvoučásticovém průletu, energii i hybnost a trvalý zpětný ráz místo návratu kresby. Původní test ručního energetického limitu a ovládání při 10 MK prošel. Všech devět kanálů při 100 MK dokončeno, D–T s pěti cíli také.
Dodatečné ověření: D–T a p–p β⁺ při odletu kontrolují nepřekrytí nabitých značek vůči okolním jádrům; výjimkou je vlastní vznik společných produktů reakce před jejich prvním oddělením. Oba průběhy prošly. Helium-3 + helium-3 při 10 MK ve zkoušeném rozmístění nyní nemá nalezený dostatečně čelní připravený průchod: příprava jej výslovně odmítá, běžná střelba zůstává dostupná. Není potají vynuceno tunelování; test odmítnutí prošel. Všechny větve při 100 MK, zpětný ráz a zachování energie/hybnosti přídavného povrchu prošly. Obě aktuální dodávky aktualizované.

### Uchopení automaticky ručně a srozumitelné tempo — 15. listopadu 2026
Uchopení libovolného jádra i Shift + uchopení přepne interaction na drag a synchronizuje viditelnou volbu režimu. Tažení mimo jádra ponechá míření děla. Dotyk do probíhající nebo dokončené reakce obnoví vstupní jádra a přepne na ruční režim; gesto se spotřebuje, produkty se nestávají projektily.
Tempo předreakčního letu sníženo z 0,9 na 0,25 společného referenčního faktoru; odletové tempo zvýšeno z 0,18 na 0,6. Jde o dvě deklarovaná časová měřítka animace, nikoli fyzikální zpomalení produktů. V energetické kartě je výslovně uvedeno, že odlet je zvlášť zpomalený záběr a vizuální rychlost nelze porovnávat s výstřelem. Poměry fyzikálních rychlostí mezi současnými produkty zachovány. Odstraněno zastavení výstřelu podle délky bufferu stopy (při pomalejším přehrávání by ukončovalo let předčasně), nahrazeno vzdálenostní hranicí scény.
Prošel DOM test uchopení a Shift-uchopení vs. míření mimo částice i regresní test konzervativního povrchu. Obě aktuální dodávky aktualizovány.

### Plynulost webové animace — 15. listopadu 2026
Profilace pěti jader helia-3 s polem a siločárami odhalila hlavní zátěž v fieldLayer: přibližně 69 ms, celkový snímek 79 ms (Happy DOM/náhrada canvasu, bez skutečného GPU). Výpočet skalární mapy i obou stylů siločar přesunut do standardního Web Workeru vytvořeného z Blobu. Částice na výsledek nečekají; nejvýše jeden výpočet běží současně, aktuální polohy se odesílají nejvýše 25× za sekundu, nehybné pole se znovu nepočítá. Pole má rastr 192 px na šířku místo 144, s hladkým zvětšením; hustota zdrojových siločar zůstává. Pracovník se ukončuje při opuštění stránky, ne při uložení do bfcache.
Odstraněno samostatné omezení rendereru na 30 fps a limit 1024 px / 480000 pixelů, který na velkém okně snižoval rozlišení pod CSS rozměr. Zůstává DPR nejvýše 1,5 a GPU fence proti hromadění příkazů. Obnovená kvalita nezmenšuje geometrickou jemnost částic ani fyzikální časový krok.
Po úpravě naměřeno přibližně 8,1 ms průměrného hlavního snímku ve stejném scénáři. Test skutečného asynchronního workeru (Node worker_threads jako most browser API) ověřil 34 přijatých a vykreslených výsledků; oba styly mají konečné souřadnice, neutrální částice nepřidává elektrické pole. Trvalý tools/test-fusion-field-worker.cjs je součástí check.cjs a hlídá také plné rozlišení a vykreslení po 16 ms při připraveném GPU. D–T, p–p β⁺, automatické ruční uchopení a fyzikální regrese prošly.
Jde o běžné browser API, bez serverového výpočtu nebo dodatečného doplňku. Pokus o kontrolu již otevřené file:// stránky byl zablokován zásadou Browser Use URL policy; skutečný FPS/GPU a vizuální vzhled v prohlížeči nejsou tímto měřením ověřeny. Nejde o záruku 60 fps na každém zařízení.

### Oprava p–p bez β⁺ — 15. listopadu 2026
Příčina dojmu nerozpadlého útvaru: odletová dvojice s Q=0 začínala na malé fyzikální vzdálenosti, takže zvětšené protonové kresby a jejich popisky zůstávaly překryté. Závěr přechodné fáze nyní výslovně rozpojí dva protony ve směru vybraného odletu. Parametr minimumExitRadius v reakcích dovoluje této větvi navázat na viditelně oddělené výstupní polohy; ostatní větve zachovávají dosavadní výchozí hodnotu. Jde o ilustrační návaznost přechodného útvaru na konečný výstup, nikoli o nové uvolnění energie. Kinematika znovu řeší hybnosti při dané výstupní vzdálenosti včetně vzájemné Coulombovy energie.
Prošel DOM test přes skutečné tlačítko Tunelování bez β⁺ při 10/100/500 MK: přechodná fáze, dva od prvního výstupního snímku oddělené protony, odstraněné popisky přechodného útvaru, Q=0, dokončení animace. Trvalý modelový test hlídá energii a hybnost při zvětšené výstupní vzdálenosti. Obě aktuální dodávky aktualizovány, test workeru i rendererového kontraktu prošel. Skutečné WebGL vykreslení nebylo vizuálně ověřeno.

### Viditelný odlet p–p bez β⁺ — 15. listopadu 2026
Následná oprava řeší skutečný pohyb, nejen oddělené startovní kresby. Pružné větve (p–p bez β⁺ a n–T) nově používají jednotné časové měřítko stanovené podle relativní rychlosti produktů, s cílovým oddělováním 14 % kratšího rozměru scény za sekundu při výchozím zoomu. Oba produkty i ostatní jádra mají stejný časový faktor; hybnosti, energie a síly nejsou přenásobeny. Nejde o dodatečné Q. Běžné fúzní větve se nemění, karta pružné větve výslovně upozorňuje na upravený čas odletu.
DOM test nyní měří skutečný posun po jedné sekundě: při 10 MK 54/64 px a nárůst rozestupu 87 px; při 100 MK 41/47 px a nárůst 62 px; při 500 MK 41/46 px a nárůst 61 px (konkrétní kontrolní rozmístění). Všechny tři průběhy dokončeny, Q=0 a čisté popisky ověřeny. Modelové kontroly energie/hybnosti zachovány. Obě aktuální dodávky aktualizovány.

### 15. 11. 2026 — společná hranice ručního přibližování jader
Opravena regrese ručního přibližování u p–p i D–T: dragTowards dostává vzdálenost viditelných povrchů pro konkrétní dvojici (stejné geometrické rozměry jako dělo, mezera 8 px při základním zoomu). Energetické omezení zůstává, ke kontaktu kresby se rychlost plynule snižuje; analytická kontrola celého posunu brání přeskočení jádra rychlým pohybem kurzoru. Nejde o přidanou jadernou sílu. Ústup z mezní polohy funguje i u neutrálního projektilu. Velikost značek ani průběh fúze se touto opravou nemění.
Ověření: rozšířen tools/test-coulomb-multi.cjs o všech sedm dvojic při 10/100/500 MK; HappyDOM test skutečných pointer událostí pro 21 kombinací (tmp/fusion-gallery/test-manual-clearance.cjs). Prošly také modelové testy pohyblivých jader, vizuálního kontraktu a produktů reakcí. HappyDOM používá náhradní canvas, není to vizuální kontrola skutečného GPU.

### 15. 11. 2026 — ruční marker U=E a intenzita pole
Nahrazuje předchozí vizuální doraz v manualApproach: ruční výpočet používá opět pouze fyzikální jadernou hranici a energetický limit. Malá vzdálenost se zvětšuje jen při vykreslení aktivní částice; ostatní cíle stojí, velikost kreseb se nemění. Graf stále používá fyzikální x/y a dojde k průsečíku U=E. Při přechodu na dělo se viditelná poloha materializuje jako nový počáteční stav výstřelu (bez skoku kresby), tato schematičnost je vysvětlena v metodice.
Barevná mapa nyní počítá velikost vektorového součtu elektrických intenzit ve zobrazené geometrii (relativní škála, nikoli V/m). Worker i fallback používají stejný výpočet a rastr 192 px; zvýšena sytost podbarvení, odstraněny přidané oranžové záře, které zakrývaly rušení pole. Legenda i metodika změněny z potenciálu na intenzitu.
Ověření: 21 kombinací skutečných pointer událostí v HappyDOM při 10/100/500 MK, U/E > 0,995, viditelné oddělení a ústup; p-p a D-T přechod na dělo bez posunu. Trvalý regresní test v test-fusion-visual-contract.cjs spouští skutečný manualApproach a kontroluje U=E, oddělení kreseb a zachování polohy při přepnutí. Test workeru ověřuje nulové pole uprostřed dvou stejných nábojů a invariantní barvy při zoomu. Testy p-p produktů a ovládání prošly. Skutečné GPU vykreslení nebylo vizuálně kontrolováno; prohlížeč nebyl automaticky spuštěn.

### 15. 11. 2026 — délka tunelu v grafu
Grafický tunel nově spojuje dva kořeny U(q)=E jedné souvislé zakázané oblasti sousedící s jadernou jámou; jeho začátek se neodvozuje od vzdálenosti vizuálního kontaktu a konec není natvrdo r=R. Marker nejprve během úvodní pětiny animace dojde po křivce k vnějšímu průsečíku; teprve pak se kreslí tunel a průchod. U více hrbolů nepřemosťuje další klasicky dovolenou oblast. Není-li bariéra, tunel se nevykreslí. Při startu průchodu se uloží geometrie a energie grafu, takže následný odlet produktů nemění délku tunelu. Jde o ilustraci průchodu, nikoli o výpočet doby kvantového tunelování.
Regresní test v tools/test-fusion-visual-contract.cjs ověřuje oba kořeny, U>E mezi nimi, žádný tunel bez bariéry a oddělení sousedních bariér. Aktualizovány obě aktivní webové dodávky.

### 15. 11. 2026 — společné časové měřítko a vstup do tunelu
Výstřel i odlet produktů používají playbackRate; přechod z jednotek vstupního nerelativistického solveru do fm/c produktového solveru používá faktor sqrt(931494.10242). Odstraněno zvláštní zpomalení fúzních produktů i umělá minimální rychlost p-p/n-T. Nevyčerpaný integrační čas produktů se přenáší do dalšího snímku. Energetická karta a metodika nyní uvádějí společný čas výstřelu/odletu; tunelový a složený stav jsou nadále názorné efekty.
Příspěvek okolních nábojů v grafu nebyl nulový: nově je výraznější vyplněná plocha mezi potenciálem izolované dvojice a součtem, modrý úsek u markeru, legenda plochy a U_okolí se třemi desetinnými místy. Nepřibyla samostatná křivka. Výpočet sdílí graphSurroundingEnergy; p-p test kontroluje součet všech okolních protonů.
Začátek blikání ve scéně je synchronizován s příchodem markeru na vnější kořen U=E. barrierProfile sdílí graf a výpočet vstupní vzdálenosti; tato vzdálenost se ve scéně zobrazí stejným zvětšením malých vzdáleností jako při ručním přiblížení. První pětina efektu pouze přibližuje jádro; blikání, skoky a zvuk startují až potom. Testy kontrolují U=E včetně okolí a nepřítomnost skoků před dosažením vstupu.
Programové kontroly projektu prošly; závěrečný pouze čtecí audit spuštěn zvlášť kvůli sandboxovému spawnSync git EPERM a také prošel. HappyDOM ověřil p-p odlet při 10/100/500 MK se společným hodinovým převodem (bez dřívějších umělých prahů rychlosti). Skutečné GPU vykreslení není vizuálně ověřené.

### 15. 11. 2026 — volitelná rychlost společného přehrávání
Kvůli příliš rychlému odletu je výchozí společná rychlost pohybu 0,1× (desetinová oproti předchozímu stavu). V hlavních ovladačích je volba 0,02× / 0,1× / 0,25× / 1×. Používá stejný násobek pro přílet i všechny produkty, nikoli změnu fyzikálních rychlostí, energie či sil. Volbu lze změnit během letu bez resetu. Limit délky odletu je měřen ve škálovaném čase, takže pomalé přehrávání neukončí dráhu předčasně. Ruční tažení, tunelový efekt a promíchání nejsou zpomalovány touto volbou.
Ověření: regresní test společného hodinového převodu nyní zkouší všechny čtyři rychlosti. HappyDOM test D-T ověřil výchozí 0,1× a změnu během odletu na 0,02×: neutron urazí za stejný čas přesně pětinu vzdálenosti, bez resetování poloh. Kontrola shody obou dodávek se zdroji prošla. Prohlížeč nebyl spuštěn.

15. 11. 2026: Nabídka rychlosti nahrazena posuvníkem 0,02×–1,00× s krokem 0,01 a výchozí hodnotou 0,10×. Událost input průběžně aktualizuje rychlost, viditelný údaj i aria-valuetext. Ověřena změna rychlosti během odletu bez resetu a shoda obou dodávek se zdroji.

### 15. 11. 2026 — široký obousměrný ovladač přehrávání
Posuvník je pod celou laboratoří přes její šířku. Rozsah -1 až +1, krok 0,001, střed zastaví děj, vlevo se přehrává uložený průběh zpět, vpravo vpřed; vzdálenost od středu určuje rychlost. Výchozí +0,1×. Záznam začíná výstřelem, zahrnuje přílet, tunelování, složený stav i produkty. Při dosažení konce dosavadního záznamu lze plynule pokračovat v živém výpočtu. Nové nastavení či pokus záznam maže. Zpětný chod neintegruje fyziku obráceně ani znovu nelosuje výsledek. Ve zpětném přehrávání není přehráván zvuk.
Ukládají se kompaktní stavy bez kopií dlouhých trajektorií; při více než 12000 vzorcích se snižuje hustota záznamu se zachováním začátku i konce. Mezi vzorky stejné fáze se interpolují polohy, hybnosti a čas efektu, přes změnu druhu produktů se neinterpoluje. Kamera se při přehrávání nepřestavuje. Pomalu přehrávaný přílet nyní integruje i zbytek kroku v každém snímku, takže nečeká několik snímků na celý pevný krok. Čas tunelového a složeného efektu nyní respektuje ovladač přehrávání (při +0,1× zachovává dosavadní délku).
Ověření: trvalý VM test obousměrného přehrávání (interpolace, zastavení, přesný návrat na konec, omezení na začátku), HappyDOM test skutečného D-T pokusu od produktů zpět přes compound/tunnel/flight a vpřed do identických poloh, včetně změn rychlosti a resetu. Projektové testy prošly; pouze čtecí audit spuštěný zvlášť kvůli omezení sandboxu prošel. Skutečný GPU obraz nebyl vizuálně kontrolován.

### 15. 11. 2026 — ruční zásah obnovuje částice i rychlost
Opraven konflikt záporné rychlosti přehrávání s ručním tažením: bez aktivního záznamu zpětný ovladač neblokuje ruční integraci. Ruční uchopení (také Shift), ruční šipky a přepnutí do ručního režimu vracejí posuvník na +0,1×. První zásah do scény po fúzi (kliknutí, kolečko, šipky), případně úprava parametrů v ovládacím panelu, obnoví původní jádra i rychlost; posuvník přehrávání a pauza nadále slouží k prohlížení záznamu. Obnovení funguje už během odletu produktů i po přetočení záznamu zpět před reakci. Záznam se při obnově zahodí.
Ověření HappyDOM: ruční uchopení z rychlostí -1, 0, 0,02 a 1 vždy obnoví +0,1× a částice se dá táhnout; první klik během odletu D-T při nulové rychlosti obnoví deuteron/triton, vymaže záznam a nastaví +0,1×. Test obousměrného přehrávání stále prochází, obě dodávky odpovídají zdrojům.

15. 11. 2026 — Oprava zoomu: kolečko již nevolá resetAfterFusion. Mění pouze pohled a při připraveném děle aktualizuje náhled; při letu, fúzi a přehrávání náhled nepřepočítává. HappyDOM test zoomu dovnitř/ven během produktů potvrzuje zachování částic, fáze, záznamu a rychlosti. Nahrazuje předchozí pravidlo restartu kolečkem.

15. 11. 2026: Odstraněno tlačítko Pozastavit i jeho JS obsluha; zastavení zajišťuje nulová poloha obousměrného posuvníku. Test přehrávání včetně zastavení a test zoomu bez resetu prošly.

### 15. 11. 2026 — tlačítko referenční animace tunelování
Vedle Nastavení je Animace tunelování. Otevře modální přehrávač uživatelova MP4 „Trik, který využívá Slunce_ Kvantové tunelování…“; původní soubor beze změny zkopírován do fusion/barrier/tunnel-reference.mp4 (2 601 572 B), zařazen mezi zdrojové a webové soubory. Video se načítá až po otevření dialogu, ne při načtení laboratoře. Při otevření se pozastaví simulace a zvuk, při zavření se video zastaví a obnoví předchozí stav simulace. Nativní ovládání videa umožňuje přehrávání a posun času. Zavření funguje tlačítkem i Escape.
Build progresivní dodávky přepisuje data-video-src pro srcdoc vložený do hlavního rozcestníku; samostatná stránka používá relativní cestu. Video zůstává externí soubor, není vloženo do startovacího JS. Test navigace kontroluje cestu a hash videa v obou dodávkách. HappyDOM test ověřil lazy otevření, pozastavení laboratoře a zastavení videa/obnovu po zavření; skutečné dekódování videa nebylo v prohlížeči ověřeno.

15. 11. 2026: Podle dalšího upřesnění ruční uchopení/přepnutí a obnova po fúzi nastavují +1×. Při každém emitProducts se živé přehrávání automaticky nastaví na +0,1× (včetně p-p); posuvník a údaj se aktualizují. Zpětné přehrávání existujícího záznamu tento přechod znovu nevynucuje. Karta energie uvádí automatické zpomalení. HappyDOM ověřil reset ruční rychlosti, automatické zpomalení při emisi a zachování stavu při zoomu.

### 15. 11. 2026 — plynulý nájezd do průsečíku a viditelný marker
Nájezd před tunelováním už není pevná pětina 0,9s efektu (při 1× šlo o cca 18 ms). Jeho délka vychází ze zbývající zobrazené dráhy a příletové rychlosti, s minimem 1,8 interních jednotek času; rychlost přehrávání ji dál škáluje. Graf i scéna používají stejný hladký průběh nájezdu. Vlastní kvantové skoky a zvuk začínají až při dosažení vstupního průsečíku.
Vodorovný rozsah grafu nově zahrnuje šestinásobek startovní vzdálenosti pokusu místo pevného q<=6, které při nízkých teplotách drželo marker na pravém okraji. Rozsah se během ručního pohybu nemění a ukládá se do snímku bariéry při tunelování. Přidána jemná svislá projekce markeru na osu vzdálenosti a odpovídající popisy dalších dekád.
HappyDOM ověřil pomalý nájezd mnoha souvislými snímky bez skoku a dosažení vstupního bodu; u p-p a D-T při 10/100/500 MK ověřil, že marker začíná uvnitř grafu, při ručním přibližování se viditelně posouvá a polohy osových popisků zůstávají pevné. Test zpětného přehrávání a regresní vizuální/modelové testy prošly; obě dodávky odpovídají zdrojům. GPU obraz nebyl ručně kontrolován.

### 15. 11. 2026 — konečný dojezd ručního přiblížení na U=E
Původní odpor úměrný (1-U/E) nechával částici asymptoticky dojíždět k hranici, i když kurzor stál hluboko za ní. Odpor ovládání nyní používá odmocninový náběh; přesný omezovač úseku stále zastaví částici na U=E a nedovolí průnik. Měkké zpomalování zůstává, ale hranice je dosažena v konečném čase. Modelový regresní test pro p-p, D-T, D-He3 a He3-He3 při 10/100/500 MK potvrzuje dosažení přesné hranice do 0,5 s z 1,2násobku bodu obratu, stabilní zastavení a okamžitou možnost ústupu. Existující energetické a vizuální testy prošly, stejně jako HappyDOM pohyb markeru při ručním tažení.

### 15. 11. 2026 — kvazistatický ruční tah, nikoli fyzické dodávání práce
Ruční ovládání již nepoužívá časové dojíždění dragTowards. manualResistancePoint počítá polohu přímo z počátku uchopení a polohy kurzoru: délka tahu = dráha jádra + poddajnost × nárůst potenciální energie. Derivace tohoto vztahu dává odpor závislý na složce Coulombovy síly podél tahu. Je to výuková vazba myši, nikoli nová fyzikální síla; poddajnost je názorná. První překročení U=E se ořízne přesným řešením hranice, další držení myši nic neposouvá. Graf i fyzické souřadnice zůstávají konzistentní, zvětšení malé vzdálenosti je pouze vykreslení.
Vysvětlení ručního režimu výslovně říká, že tah vybírá polohy dostupné při zvolené energii a další práci nepřidává. Skutečné mechanické tlačení by energii dodávalo a U=E by nebyla univerzální zeď. Model volného pohybu představuje dělo. Testy kontrolují rostoucí odpor, přesný energetický doraz a nulové dojíždění při nehybném kurzoru (HappyDOM včetně rychlostí zpět/0/pomalu/rychle); modelové a vizuální regresní testy prošly.

15. 11. 2026 — Oprava okamžiku automatického zpomalení: +0,1× se nastavuje již při beginFusion, nikoli až při emitProducts. Platí i při dopředném přehrávání přes začátek reakce v uloženém záznamu; zpětný chod se nepřepíná. Posuvník a jeho údaj se mění stejnou funkcí. HappyDOM test potvrdil +0,1× již ve složeném stavu před emisí; obousměrné přehrávání a shoda dodávek prošly.

### 15. 11. 2026 — otáčitelná 3D ukázka tunelování a pevný 2D graf
Tlačítko Animace tunelování nyní otevírá skutečně vykreslovanou scénu místo MP4. Nové wave-packet.js a wave-preview.js jsou v obou dodávkách i progresivních srcdoc modulech. Zdrojová inspirace a parametry: uživatelův D:/HI!Fyziko/SHORTS/tunelovani/quantum_tunneling_3D_render_v2.m. Přesné stacionární rozptylové stavy obdélníkové bariéry jsou přepsány analyticky (ekvivalent okrajového systému v MATLABu); hbar=m=1, V0=21, a=0,35, k0=5,4, sigmaX=2, x0=-7,8, Nk=420. Pro web 360 prostorových vzorků a 601 časových snímků na t=0…3,15, zobrazených standardně za 18 s. Výpočet běží v Blob Workeru; cache cca 1,7 MB komplexních snímků, bez průběžné normalizace amplitudy. Prostorový interval -12…12 stejně jako v MATLABu ořezává vzdálené Gaussovy ocasy; záměrně se nezakrývá přenormalizováním.
3D perspektivní vektorové vykreslení na canvas: průhledný amplitudový obal |psi|, jasná komplexní křivka (x, S Re psi, S Im psi), průhledná bariéra. Tažení otáčí pouze horní 3D pohled, kolečko mění jeho přiblížení. Spodní hustota |psi|² má pevné osy a globální měřítko. Ovladače přehrát/pozastavit, časový posuvník a výchozí pohled; parametry bariéry nejsou nastavitelné. Dialog pozastaví hlavní laboratoř a zavření obnoví její stav. Původní MP4 zůstává zachované v dodávce jako referenční podklad, tlačítko jej už nepřehrává.
Nový tools/test-tunneling-wave.cjs ověřuje R+T=1 (max chyba cca 8,9e-16), konečné amplitudy a globální rozsah, výpočet ve workeru, změnu 3D projekce při rotaci bez jakékoli změny operací 2D grafu, časový posuvník a ukončení renderovací smyčky. Test zařazen do project/check. Projektové testy prošly; závěrečný audit souborů prošel samostatně po obejití sandboxového spawnSync git EPERM. Canvas ověřen programově, skutečný obraz v prohlížeči zatím nebyl vizuálně zkontrolován.

15. 11. 2026 — Automatické zpomalení a směr rotace: test všech devíti kanálů potvrdil původní přepnutí na +0,1× ve složeném stavu a při emisi. Přepnutí nyní nastává už při startTunnel, takže i nájezd a tunelový efekt všech nabitých dvojic jsou zpomalené; dopředné přehrávání záznamu přepíná rovněž při vstupu do tunelu. Neutronový kanál přepíná při blízkém setkání bez tunelu. Ověřeno skutečnými ovladači v HappyDOM pro všechny větve včetně p-p/β+, D-D obou větví, D-He3, He3-He3 a p-T. WavePreview má obrácený vodorovný i svislý směr otáčení na přání uživatele; test ověřuje směry a neměnnost pevného 2D grafu. Regresní testy přehrávání, navigace, fyziky i shoda dodávek prošly.

15. 11. 2026 — Vyšší rozlišení ukázky tunelování: výpočet 820 prostorových vzorků (stejně jako MATLAB, dosud 360), obal 24 místo 12 obvodových segmentů, canvas až 2× rozlišení pro HiDPI místo 1,5×. Hustota podélných polygonů se přizpůsobuje šířce scény a přiblížení (180–420 prstenců), vlna a 2D graf používají všech 820 bodů. Cache 601 snímků cca 3,77 MiB; měřený výpočet v Node cca 481 ms, v aplikaci běží ve workeru. Test fyziky, rotace/pevného grafu, 2× canvas rozlišení a navigace prošel. Reálné FPS prohlížeče nebylo měřeno.

15. 11. 2026 — Ruční nastavení rychlosti má přednost před automatikou. Automatické zpomalení na 0,1× proběhne nejvýše jednou během pokusu; pohyb posuvníku převezme řízení a další fáze tunelu, fúze, emise ani dopředný návrat záznamem rychlost nepřepisují. Zachovává se také ručně zvolené zastavení a zpětný chod i volba před výstřelem. Nové ruční nastavení pokusu nebo home obnoví automatiku; pouhé spuštění záznamu uživatelskou volbu nemaže. Regresní test a HappyDOM scénář ověřily tunel, složený stav, emisi, pauzu, zpětné i dopředné přehrání a reset. Obě aktuální dodávky přestavěny; shoda se zdroji a test navigace prošly.

15. 11. 2026 — Čitelný rozlet lehkých produktů a odstranění neutron–triton. Na žádost uživatele jsou všechny kanály s výstupním protonem, neutronem, pozitronem, neutrinem či fotonem při odletu navíc 10× zpomaleny. Společný časový faktor platí pro všechny produkty i okolní jádra; fyzikální energie, poměry rychlostí a síly se nemění. Posuvník se nepřepisuje a zůstává násobitelem přehrávání. Faktor je popsán v kartě energie a metodice. Limit doby odletu používá stejný faktor, aby zpomalení předčasně neukončilo děj. Neutron–triton odstraněn z nabídky i registru reakcí a metodiky; neutron zůstává jako produkt ostatních reakcí. Testy všech zbývajících kanálů zachování energie/hybnosti, vizuálního kontraktu a navigace prošly. HappyDOM ověřil skutečný 10× pomalejší fyzikální čas obou větví p–p a zachování ruční rychlosti. Obě aktuální dodávky přestavěny. Reálná vizuální kontrola v prohlížeči neprovedena.

15. 11. 2026 — Oprava podle upřesnění uživatele: odstraněn skrytý faktor 0,1 pro produkty. Při emisi se skutečná rychlost i poloha posuvníku přepnou na 0,01×, pokud uživatel již neposunul ovladač. Tunel zůstává automaticky na 0,1×; oba automatické kroky respektují uživatelské převzetí řízení. Ruční reset/new setup obnoví příznaky. Posuvník má symetrickou kvadratickou mapu rychlost = sign(u) × u², takže u středu lze jemně měnit pomalý chod vpřed i zpět. Údaj a aria-valuetext uvádějí skutečný násobitel, bez dalšího faktoru v pohybovém solveru. Modelové regresní testy mapování, automatických přechodů a uživatelské priority i navigace prošly; obě dodávky přestavěny.

15. 11. 2026 — Doplněny okamžité rychlosti produktů pod jejich energetické popisky, v km/s s oddělenými tisíci. Používají přímo relativistickou rychlost z hybnosti solveru (v/c × 299792,458 km/s), nezávislou na posuvníku přehrávání. Foton a nehmotná aproximace neutrina mají také označení c; vysvětlení vztažné soustavy a aproximace je v titulku popisku. Údaje zůstávají i u označení mimo záběr a při přehrávání záznamu. Ověřena numerická konverze a skutečné vykreslení dvouřádkového zápisu KaTeXem pro klidovou, hmotnou a nehmotnou částici; navigace prošla, obě dodávky aktualizovány.
15. 11. 2026 — Okamžitá rychlost v km/s doplněna také k vystřelenému jádru během letu (i při přehrávání záznamu). Vychází z vx/vy vstupního solveru s převodem jeho jednotek, nezávisí na časovém posuvníku. Při tunelové ilustraci a ručním tahu se skryje; při fúzi ji nahradí údaje produktů. Popisek zůstává u okraje i mimo záběr. Převod jednotek a regresní testy prošly, obě dodávky přestavěny.

Doplnění k úpravě grafu 16. 11.: na přání uživatele odstraněna tlačítka
Rozmístit znovu, Obnovit pohled a Výchozí stav z Nastavení. Celá obrazovka
je vpravo v hlavičce a používá sdílený handler fusion/navigation/page.js.

Další zhutnění ovládání podle snímku uživatele: horní řádek 180 místo 220 px,
popisky dvojice a větve vedle výběru, kratší potvrzení přípravy a p–p volby.
Delší stavové zprávy se posouvají ve vyhrazeném prostoru a nemění graf.
Ušetřených 40 logických pixelů dostává graf. Bez pushe.

Název Potenciálová bariéra a stručná poznámka k osám jsou v jediném řádku;
uvolněnou výšku využívá graf. Poznámka nadále upozorňuje na přesah křivky.

Průběžné pokyny k tažení, míření, přípravě a změně teploty textově zkráceny,
například „Táhni částici k jádru.“ Delší fyzikální vysvětlení zůstávají v návodu.

Popisek v grafu opraven na „Potenciálová jáma“; návod vysvětluje původ
v přitažlivé složce silné interakce. Fyzikální výpočet beze změny.

Na přání uživatele odstraněn popisek „Součet“ uvnitř grafu bariéry.

Odstraněn i vnitřní titulek „Společný potenciál“ (při reakci „Bariéra před reakcí“); hlavní nadpis grafu zůstává.

Údaje pod grafem: jeden pevný řádek 40 místo 72 px, pouze střední energie
a dostupný WKB odhad (při reakci Q). Matematické písmo zvětšeno o 50 %.
Bod obratu a rovnice reakce přesunuty do Ovládání a návod.
Rozsah vzdáleností v grafu již nezávisí na počtu jader ani velikosti scény;
používá společný rozsah pro 1–5 cílů při dané energii a dvojici.

Ostrost fúzní scény: 2D a WebGL buffer sleduje fyzické rozlišení displeje
(DPR do 2, limit 8 milionů pixelů), nikoli pevný limit násobku logické plochy.
Worker kreslí siločáry do plátna v rozlišení scény, zachovává všechny body
křivek a mapu počítá v šířce 384–768 místo 192. Vyšší krytí barev a tmavší
siločáry; fyzikální paleta i modely zachované. Delší zprávy nad 70 znaků
mají stručný stav a zavíratelnou bublinu ve scéně; lze ji znovu otevřít přes
Podrobnosti. Stejná zavřená zpráva se opakováním neotevírá. Bez pushe.

Odezva pole: při pohybu se barevná mapa počítá v šířce 256 bodů a nové
polohy se odesílají od 16 ms místo 40 ms. Po 100 ms klidu se automaticky
dopočítá plná kvalita 384–768. Siločáry zůstávají v plném rozlišení.
Výpočet intenzity používá ekvivalentní vzdálenost na druhou a odmocninu.

Sjednocení vrstev při pohybu: rychlý náhled pole se počítá synchronně
z aktuálních souřadnic částic, zpřesnění po zastavení zůstává ve workeru.
Číslo požadavku brání přepsání novějšího pole opožděnou odpovědí.
Relativní barevná škála nyní zohledňuje zoom stejně jako projekce poloh.
Náhled mapy má během pohybu 128 bodů, siločáry zůstávají v rozlišení canvasu.

Siločáry zjemněny: tloušťka 0,45/0,65 místo 0,8/1,1 logického pixelu,
stejně v hlavním i záložním rendereru; kontrast zachován.

Oprava nečinného zeleného Vystřelit: home v režimu děla novou částici
řádně připraví přes armGun. Dostupnost výstřelu zohledňuje canLaunch;
překrytí značek při zoomu už není trvale zaklapnutá blokace. Každý přepočet
povrchů stav obnoví a zoom jej provádí i po předchozím zákazu. Neplatný
výstřel hlásí důvod. Regresní testy: návrat → výstřel, zablokování zoomem
→ obnovení → výstřel; prošly. Přesný stav uživatelovy relace neověřen.

## 16. listopadu 2026 — indukované napětí: odsazení a přímé tažení (bez pushe)

Popisek Pohybové napětí má vodorovné odsazení; vnější pozadí modulu je
průhledné, aby navazovalo na okolní stránku bez barevného podkladu.
V homogenním poli lze uchopit vodič a táhnout jej; ovládá stejnou cílovou
polohu jako posuvník a zachovává původní dynamiku. V režimu pohyblivého
pole vodorovný tah mění rychlost pole včetně znaménka, synchronně s
posuvníkem. Cívku lze v režimu otáčení táhnout kolem středu; ruční změna
úhlu pozastaví přehrávání stejně jako posuvník fáze. Souřadnice respektují
SVG transformaci i měřítko hostitele, tah končí také při pointercancel.
Zdroje: em-core/motional-rod.css, motional-rod.js a ui.js.
Kontroly obsluh tažení v Node VM prošly (měřítko, meze, obrácení rychlosti,
zrušení tahu, přechod úhlu přes nulu); model, renderer a opakované škálování
prošly. Vizuální kontrola v prohlížeči neproběhla. Sestavení používá místní
dočasné opakování zápisu kvůli již známému zamykání velkého HTML.

Obnova dostupnosti: nalezen částečný web bez registrace fúze a bez progressive
manifestu. Obě dodávky znovu doplněny fúzí a lazy balíčky; navigační test
a progressive testy obou dodávek prošly. Kořenový manifest obnoven
z vložené instalace loaderu a SHA-256 ověřených balíčků; originalBytes zde
představuje rekonstruovaný součet shellu a balíčků, ne původní monolit.
Úplný build-release nad aktuálním zdrojem selhal v direct-current/integrate.cjs
na Missing home group anchor; tato samostatná chyba sestavení zůstává.
Žádný push. Prohlížeč neotevírán.

Sjednocení vnějších podkladů všech modulů dle opravy indukovaného napětí:
společný host a tělo vložených lekcí mají průhledné pozadí bez zeleného
obdélníku s ostrými rohy. Sdílená prezentační vrstva pokrývá i starší
vložené lekce, uniform-module-layout a fúzní stránky také samostatné otevření.
Vnitřní karty, grafy a fyzikální barevné mapy zůstávají zachované.
Dokončení: obě aktuální dodávky přestavěny; kontrola progressive payloadů,
hashů a navigace prošla. Ověřena přítomnost všech tří úprav v lazy EM01.
Celý project/check.cjs se zastavil na nesouvisejícím testu
 test-fusion-visual-contract.cjs:83 — maketa statusu nemá dataset.fullText
vyžadovaný souběžně změněným fúzním app.js. Tento test ani fúzní zdroje
nebyly v této úpravě měněny. Audit veřejných souborů prošel. Bez pushe.

Zkouška pouze EM01: světle zelená vrstva pod hlavním modulem, rohy 28 px
a vytracení okrajů 24 px. Obsah bez změny průhlednosti. Ostatní moduly
zůstávají průhledné. Obě lazy dodávky aktualizované. Bez pushe.

EM01: společný obal tří hlavních karet je průhledný, bez rámečku a stínu,
mezery mezi kartami 12 px. Bílé karty mají vlastní původní okraje.
Obě aktuální dodávky včetně lazy hashů aktualizované, bez pushe.

Schválený jemný zelený podklad EM01 rozšířen na všechny výukové moduly
kromě fúze: nativní workspaces a vložené lekce, rohy 28 px, vytracení 24 px.
Fúzní stránky s data-fusion-page a fusion-module-host výslovně vyloučeny.
Vnitřní karty a vědecké plochy zachované. Bez pushe.

Zkušební strom navigace: ?navigation=tree před hashem zapíná tlačítko
Moduly vlevo, výsuvný dialog s hledáním bez diakritiky, skupinami a aktivním
modulem. Používá katalog a existující hash odkazy, bez přednačítání lekcí.
Výchozí navigace beze změny, první varianta bez připnutí. Současně odstraněn
duplicitní podklad hostitelského workspace s iframe; podklad vlastní lekce.
Bez vizuálního ověření a bez pushe.

Zkušební navigace je nyní v modulech zapnutá při běžném otevření; uživatel
předchozí variantu za parametrem neviděl. Pro srovnání lze vypnout pomocí
?navigation=classic. Tlačítko Moduly vlevo. Bez pushe.

Při stromové navigaci skryty odkazy a.back v hlavičkách nativních i
vložených modulů. Klasická varianta je zachovává. Bez pushe.

Uživatel navigaci hledal na index.html# (rozcestník). Moduly jsou proto
trvale viditelné i na rozcestníku, bez parametrů. Strom obsahuje Rozcestník.
Odkazy a.back skryté vždy v hostiteli i vložených lekcích. Bez pushe.

Navigační tlačítko Moduly zvětšené na nejméně 142 × 50 CSS px, písmo 18 px,
bílý text na tmavě zeleném podkladu. Umístění vlevo nahoře; nezávislé
na měřítku modulů. Na úzkém displeji 120 × 46 px. Bez pushe.

Upřesnění uživatele: původní tlačítko Zpět v hlavičkách modulů zachovat.
Odstraněna pravidla, která je skrývala v nativních i vložených modulech.
Strom Moduly zůstává doplňkovou navigací. Bez pushe.

Na žádost uživatele zesílen společný MachineSound: jiskření 0,065 → 0,13,
spínání 0,025 → 0,05 a skluz 0,09 → 0,18 (přibližně +6 dB amplitudy).
Zdroj i obě aktuální dodávky aktualizovány; bez pushe.

Ve stromové navigaci zvýrazněn horní odkaz Hlavní rozcestník (#),
který vrací na nejvyšší úroveň laboratoře. Bez pushe.

BLDC: společný zvuk switch při změně sektoru zesílen z 0,05 na 0,10
(dalších přibližně +6 dB). Platí pro oba BLDC moduly. Bez pushe.

Další zesílení zvuků strojů na přání uživatele: jiskření 0,26, spínání
0,20, skluz 0,36; všechny přibližně +6 dB proti předchozímu stavu. Bez pushe.

Jiskření přepracováno: 180 ms série nepravidelných krátkých mikrooblouků
s tichým syčením, odfiltrování basů pod přibližně 1 kHz a zjemnění nejvyšších
frekvencí. Hladký začátek/konec, zachována hlasitost 0,26 a vypínání zvuku.
Spínání BLDC a skluz beze změny. Bez pushe.

## 16. listopadu 2026 — samočinná rychlost fúze podle viditelného pohybu

Pevných 0,01× při vzniku produktů nahrazuje automatika podle skutečných
rychlostí částic a jejich promítnutí do aktuálního záběru. Cílem je přibližně
sedm sekund na přejetí kratšího rozměru scény (v mezích posuvníku).
Řídí přílet i produkty všech kanálů včetně p–p bez slabé přeměny. Po odletu
rychlého záření z obrazu může plynule zrychlit zbývající pomalá jádra;
zpomalení je okamžité. Tunelový a složený názorný efekt zůstávají na 0,1×.

Výslovné upřesnění uživatele: automatika se zapíná sama, bez nového tlačítka;
posuvník je nadřazený. Jeho ruční změna vypne automatické zásahy po zbytek
pokusu, včetně nuly a zpětného chodu. Obnovení při nové přípravě respektuje
stávající resetovací místa. Viditelný posuvník a údaj vždy sledují skutečný
násobitel; společný čas všech částic a fyzikální vztahy se nemění.

Změněny barrier/app.js, návod v index.html a rozšířen test
 tools/test-fusion-visual-contract.cjs. Testuje všechny skutečné kanály,
rychlejší p–p oproti D–T, výběr částic v záběru, plynulé zrychlení,
nepozměněný fyzikální stav a přednost ručního posuvníku. Kontroly ovládání
a tohoto kontraktu prošly. Obě aktivní dodávky aktualizovány dílčím
sestavením tools/build-particle-library.cjs včetně lazy dokumentů a manifestů.
Prohlížeč neotevřen; bez pushe.

## 16. listopadu 2026 — zubaté siločáry při pěti jádrech

Pevný integrační krok trasování siločar mohl v blízkosti nulového pole
přeskakovat mezi protilehlými směry a kreslit pilku. Sdílený fieldLineStep
zmenšuje krok podle změny směru na začátku, uprostřed a na konci; při
nevyřešitelném směru čáru ukončí. Používá se ve workeru, rychlém náhledu
i záložním vykreslení bez workeru, pro oba styly siločar. Ze záložního
rozptýleného stylu odstraněna kvantizace směrů na pět pixelů. Výpočet
barevné intenzity pole a fyzikální pohyb beze změny.

Test test-fusion-field-worker.cjs prošel včetně pěti cílových jader a
projektilu: oba styly, pohybový i zpřesněný náhled, omezené změny směru
sousedních úseků a zastavení u symetrického nulového bodu bez oscilace.
Obě dodávky aktualizovány přes build-particle-library.cjs, lazy balíčky
včetně manifestů přepočteny. Bez vizuální kontroly v prohlížeči a bez pushe.
Před touto opravou prošla celá project/check.cjs pro automatické přehrávání.
