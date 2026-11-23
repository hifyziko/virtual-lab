# Kov a plazma: teplotní závislost vodivosti

Implementace 23. 11. 2026. Zdroj: `versions/vyvoj/m_files/fusion/conductivity/`.
Aktuální rozcestník: `versions/aktualni/web/index.html#fu15-vodivost`.
Bez pushe a nasazení; označení dodávky zůstává 1.0.

## Kmitající mřížka kovu

Chování a parametry vycházejí z přílohy
`HiFyziko_kovova_mrizka_v6_neutralita.zip`, z adresáře `module/`.
V opakované buňce je 32 kladných iontových zbytků a 32 vodivostních
elektronů. Buňky navazují vodorovně i svisle. Render je ořezává až na
hraně scény a výpočet používá nejbližší periodické obrazy uzlů.
Velikost počáteční rychlosti elektronů má rozptyl a při změně teploty se
přímo nepřenásobuje. Kresba ukazuje rovnovážné a okamžité polohy uzlů.
Jemné spojnice vyznačují sousedství iontů i přes hranici buňky.
Volitelné kružnice mají stejný poloměr jako dosah poruchového
potenciálu v modelu. Ten roste s druhou mocninou okamžité výchylky uzlu.
Elektrony vychyluje plynulá síla a malé lokální kvazielastické fononové
změny směru. Integrační krok sdílí geometrii uzlů mezi všemi elektrony.
Dolní detail kovu je SVG s jedním elektronem se stejným stínováním jako
v hlavní scéně. Zelená šipka ukazuje směr rychlosti, jantarová směr síly
od mřížky. Když jsou vidět obě, oblouk a boční odečet ukazují jejich úhel.
Pohyb elektronu pokračuje přes hranice periodické buňky bez opakování
krátkého úseku. Při nulové síle ukazuje odečet její nulovou hodnotu.
Jemné spojnice mřížky v pozadí se pohybují vzhledem k elektronu uprostřed.
Kresba používá dva různé pevné dosahy šipek pro jejich odlišení.
U průletu kolem protonu mají živá dráha a chladná
reference shodný předpis ukončení a měřítko záběru.
Teplota průletu je v hlavičce detailu. Posuvník Zahřátí má větší úchyt
a šířku přizpůsobenou oknu.
Rezistivita a drift zůstávají samostatnými výpočty.

Publikační inspirací pro vztah mezi výchylkou a rozptylem je
[Lee, Yuge a Shimizu (2012)](https://arxiv.org/abs/1109.2708).
Parametry a fononové události jsou didaktickým modelem z přílohy.

## Aktuální Coulombův model

Hlavní scéna sčítá přitažlivost protonů, odpuzování ostatních elektronů
a sílu vnějšího pole. V každé elektronové dvojici integrátor použije
stejný silový příspěvek s opačnými znaménky. Síly se počítají vůči nejbližší
periodické kopii. Předepsané rychlosti protonů posouvají jejich polohy
v každém podkroku. Zpětný ráz protonů je zanedbaný.

Ponechán je ověřený kandidát se silovým koeficientem 0,12 (původně 0,04).
Dosah stínění 0,55 je zachovaný. Změkčení jádra 0,04 místo 0,01 omezuje
zakřivení při nejbližších setkáních. Společný krok velocity Verlet má
horní mez 0,004 v názorném čase a zkracuje se podle bezpečného odhadu
relativní rychlosti a lokální dynamické doby.

Původní přesné přepisování celkové hybnosti a rozptylu po každém kroku
nahradila plynulá deterministická relaxace s časovou konstantou 2 v názorném
čase. Samostatně tlumí střední rychlost vzhledem k pozadí a vede tepelný
rozptyl k nastavení. Běžný integrační krok 0,004 opraví přibližně 0,2 %
odchylky. Posuvník bez přesunu částic přeškáluje relativní rychlosti
odmocninou poměru teplot. Spitzerův vztah se používá samostatně pro
rezistivitu a drift v pásu šipek.

Zahřátí, pauza a restart jsou v hlavičce. Hlavní scény využívají prostor
po samostatné ovládací liště, výkladových větách a zkrácení dolních detailů.
Polohy částic, stopy a vektory se kreslí z numerického modelu. Kresba
zachovává vypočtené polohy. Iontové zbytky a protony mají malé středy
s jemnými obrysy. V plazmatu vzniká zakřivení z integrovaných sil.
Při velmi blízkém průletu se kreslené značky mohou překrýt.

### Ověření aktuálního modelu

- Při srovnatelném průletu s příčným odstupem 0,18 se při 1 keV odklon
  zvýšil z 16,5° na 46,1° a při 10 keV z 1,6° na 4,6°. Vykreslené
  kontrolní trajektorie ukázaly plynulý ohyb. Při testu těsných průletů
  vyšla odchylka výstupního úhlu po zjemnění kroku pod 0,3°.
- Vypnutí odpuzování odstranilo očekávané opačné impulzy. Izolovaná
  dvojice s odpuzováním zachovala hybnost i přes periodickou hranici.
- Po 60 sekundách bez lázně činila podélná střední rychlost přibližně
  −0,56 a −1,08 pro 1 a 10 keV. Po 300 sekundách s upravenou lázní
  a pohyblivými ionty vyšla přibližně −0,09 a −0,08. V obou případech
  se elektrony stále pohybovaly oběma směry. Původní korekce střední
  rychlost po každém kroku přímo nastavovala na transportní hodnotu.
- Cílené testy ověřují síly, hybnost, teplotní škálování, vazbu ovladačů,
  matematickou sazbu a korektní ukončení animace. Statické trajektorie
  byly vizuálně zkontrolovány. Vykreslení celé stránky v prohlížeči
  zůstává neověřené.
- Kontrola SVG pro obě krajní teploty ověřuje, že pozice všech elektronů
  a protonů i směr zelené šipky odpovídají právě integrovanému stavu.

## Historie převzatého modulu

## Převzaté komponenty

Rámec, škálování a kompaktní ovládání z `fusion/plasma/style.css` a
`layout.js`; stejné radiální stínování kuliček jako `plasma/app.js`.
Barvy elektronů, protonů a elektrického pole z `particles/style.js`.
Lokální KaTeX, společná navigace a celá obrazovka; společný dialog
Ovládání a výklad. Registrace přes `particle-library-navigation.js`,
balení přes `build-particle-library.cjs` a automatické progressive závislosti.
Žádné nové knihovny, síťové závislosti ani kopie soukromé literatury.

## Model

- Zahřátí s v rozsahu 0–1: kov 300+400s K, elektronová teplota 1+9s keV.
- Kov: r=(0.1+T/300)/1.1, Poissonovy změny směru hybnosti s intenzitou
  2r v názorném čase. Žádné kontaktní odrazy. Kolektivní kmity jsou dvě
  vlny se zvětšenou amplitudou úměrnou odmocnině teploty.
- Plazma: r=T_keV^(-3/2) řídí samostatný transportní moment. Hlavní
  mikroskopická scéna nyní integruje skutečnou sílu z poloh všech
  pohybujících se protonů, bez náhodné úhlové difuze. Používá stíněný
  potenciál V=-0.04 exp(-R/0.55)/R, R=sqrt(r²+0.01²), v názorných
  jednotkách. Velocity Verlet s krokem nejvýše 0.004; periodický výřez.
  Elektron-elektronové síly a zpětný ráz protonů nejsou zahrnuté.
  Při změně Te se přepočte rychlost odmocninou poměru teplot,
  nikoli poloha. Mikrotrajektorie neodvozují Spitzerovu rezistivitu.
- Drift je přesná integrace prvního momentu relaxační rovnice při
  konstantním slabém poli. Tepelný pohyb a drift jsou oddělené.
  Zobrazený proud je ustálená odpověď 1/r, nikoli statistika 32 částic.
- Dolní průlet integruje přitažlivý Coulombův zákon velocity-Verletem,
  bez změkčení potenciálu. Nenulový parametr průletu vylučuje singularitu.
  Kladný iont je pevný, vstupní rychlost roste jako odmocnina teploty.
  Délka a čas jsou bezrozměrné. Probíhající průlet drží vstupní energii,
  následující přebírá aktuální ovladač; chladná reference je numerická.

## Omezení a zdroje

Kniha Entler–Kindl, Jaderná fúze a fúzní elektrárny, kap. 9.1, s. 181,
ověřená v lokálním PDF: pokles odporu a omezení ohmického ohřevu.
Parametrizace kovu a mikroskopické modely jsou vlastní didaktické
rozšíření podle zadání. Doplňující zdroje:

- https://www.ipp.mpg.de/1766097/spitzer
- https://farside.ph.utexas.edu/teaching/plasma/lectures/node55.html

Klasický izolovaný průlet neodvozuje Spitzerovu rezistivitu ani kvantový
účinný průřez při keV energiích. Konstantní hustota, Z=1, Coulombův
logaritmus a slabé pole; bez magnetického pole, turbulentního transportu,
relativistických korekcí či zpětného rázu. Jedna charakteristická rychlost
místo úplného rozdělení. Kov používá přibližně konstantní Fermiho rychlost.
Obě scény mají vlastní názorná prostorová a časová měřítka; porovnávat
lze teplotní trendy, ne absolutní vodivosti obou prostředí.

## Kontroly

`node tools/test-conductivity.cjs`: krajní hodnoty 2.212121 a 0.0316228,
monotónnost, převody teplot, znaménko síly, energie a moment hybnosti,
konvergence půlením kroku, pokles úhlu, četnost rozptylu a relaxace driftu,
zachování poloh při změně teploty, skutečný skript UI a KaTeX,
pauza/reset/výklad a ukončení animační smyčky.

Vizuální kontrola celé stránky v prohlížeči zatím neprovedena.
Ověřit čitelnost, překryvy, plynulost, rozměry a celou obrazovku,
zejména při Windows 125 %. Testovací maketa canvasu není screenshot.

## Změněné soubory

- Nové: `versions/vyvoj/m_files/fusion/conductivity/index.html`, `style.css`,
  `model.js`, `app.js`; `tools/test-conductivity.cjs`; tento dokument.
- Integrace: `tools/build-particle-library.cjs`,
  `tools/particle-library-navigation.js`, `tools/module-guide-data.js`.
- Kontroly: `tools/test-fusion-navigation.cjs`, `tools/project/check.cjs`.
- Výběr veřejných souborů: `config/project-files.json`, `.gitignore`.
- Stav: `PREDANI-AKTUALNI.md`; přestavěný výstup `versions/aktualni/web`.

Dříve rozpracované opravy proximity a asynchronních strojů nejsou
součástí této změny a zůstávají zachované.

Závěrečný výsledek: aktuální dodávka úspěšně dokončena včetně lazy
balíku. Celá sada `node tools/project/check.cjs` prošla (70 společných
výkladů, progressive načítání, fúzní navigace, fyzikální a UI regrese,
audit 607 veřejných zdrojových souborů). Vizualizace v prohlížeči
nadále neověřena. První sestavení zachytilo chybějící explicitní webové
položky; po doplnění allowlistu se dokončily standardní balicí kroky
v původním dočasném stromu a ověřené manifesty přešly do aktuální dodávky.

### Úprava názornosti 23. 11. 2026

Na připomínku uživatele přejmenováno na Teplotní závislost měrného
odporu kovu a plazmatu. Stopy mají modrou linku 1,2 px s průhledností
jako Plyn a plazma a spojitou kvadratickou interpolaci z řidších bodů
(zaoblení je pouze grafické). Kmity mřížky zvětšeny z 3× na 6×;
fyzikální závislost a rozsah 300–700 K zachovány. Pod oběma scénami je
pás šipek středního driftu: stejné názorné měřítko, posun z přesného
časového integrálu relaxační rovnice. Živý poměr driftu k výchozímu
stavu je oddělen od ustáleného proudu. Test ověřuje integrál driftu,
jeho opačné teplotní trendy a skutečné kreslení hladkých křivek.
Vizuální kontrola v prohlížeči neprovedena. Bez pushe.

Doplnění podle další připomínky: uzly kovu označené jako kladné iontové
zbytky, sousedé propojení jemnými čarami sledujícími kolektivní kmity.
Protony v plazmatu se pohybují při pevné iontové teplotě 1 keV; poměr
rychlostí vychází z hmotnostního poměru 1836 a iontový pohyb je navíc
pro čitelnost zvětšen 6×. Posuvník elektronové teploty jejich rychlost
nemění. Je to názorné pozadí, ne N-body výpočet sil. Test ověřuje pohyb,
konečné rychlosti a nezávislost iontové rychlosti na zahřátí elektronů.

### Revize grafiky a interakcí — 23. 11. 2026

Hlavní scény jsou SVG včetně částic, mřížky a ocásků. Mřížka se
počítá i za výřezem a ořezává bez obvodového rámu. U vybraného
elektronu se při skutečné rozptylové události současně označí okolní
buňka a vstupní/výstupní směr; nepředstírá se mechanický kontakt.
Redakční věta o nenarážení do kuličky odstraněna z hlavního popisku.
Ocásky přebírají jantarovou barvu, zeslabování a zužování z drawTail
v modulu Drift částic v poli; v hlavních scénách jsou spojitou
vyplněnou siluetou s gradientem, aby nevznikaly proužky mezi segmenty.

Zásadní fyzikální oprava plazmatu: náhodné úhlové změny zrušeny.
Test nově kontroluje gradient potenciálu, přitažlivost, energetickou
bilanci izolovaného průletu (pevný iont), pokles vychýlení s rychlostí
a konvergenci kroku. Změkčení a stínění jsou výslovné aproximace.
SVG scény prohlédnuty z renderovaných PNG; celá stránka v prohlížeči
neověřena. Dočasné náhledy jsou v tmp/conductivity-review, mimo web.

### Průlety, šipky a dlouhodobá tepelná rovnováha

Ionty se vykreslují před elektrony a stopami: zvětšené značky je
při překrytí zakrývají. Nejde o tvrdé srážky ani změnu fyzikální polohy.
Konečné jádro plazmatického potenciálu zmenšeno z 0.1 na 0.01;
při těsných průletech se krok adaptuje podle doby průletu a lokální
dynamické doby. Testy tří těsných průletů ověřují vychýlení a chybu
energie menší než 0.15 procenta při pevném iontu.

Blikající buňka a okamžité šipky před/po rozptylu odstraněny. Trvalá
zelená šipka ukazuje směr rychlosti, v plazmatu jantarová směr
elektrické síly. Délky jsou názorné, složky správně promítnuté do
scény. V kovu se individuální okamžitá síla nevymýšlí.

Opraveno neomezené urychlování souboru polem: po integraci iontových
sil se zachovají relativní směry rychlostí, přepočte jejich druhý
moment na zvolenou teplotu a první moment na řešení transportní
rovnice. Je to výslovně uvedená tepelná lázeň a momentová uzávěra,
ne další Coulombova síla ani náhodné přesměrování jednotlivých částic.
Práci pole odvádí lázeň; mikroskopický výřez neodvozuje Spitzerův zákon.
Test ověřuje po 60 sekundách obě teploty, správný drift, tepelnou
energii a obsazení obou směrů pohybu.

Po 300 sekundách: studené plazma 17 elektronů doprava / 15 doleva,
teplé 15 / 17; první moment odpovídá transportnímu řešení. Sestavený
výstup prošel kontrolou navigace, progressive načítání a společného
výkladu. Bez nového vizuálního průchodu prohlížečem a bez pushe.
