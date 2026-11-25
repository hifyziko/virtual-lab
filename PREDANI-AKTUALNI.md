# Aktuální stav předání

## Sjednocení hlaviček modulů — 25. listopadu 2026

Běžné moduly mají velikost názvu a ovládacích prvků podle fúzních.
Při měřítku scény alespoň 80 % drží hlavička stálou velikost. Při dalším
zmenšení se mění pozvolněji. Její šířka sleduje šířku zobrazeného modulu
u nativních i vložených lekcí. Změna připravena nad commitem 217c8f2.


## Stejnosměrné stroje — 25. listopadu 2026

Ovládání je kompaktnější, průvodní texty a odkazy patří do společného
výkladu. Rovnice jsou u příslušných scén a grafů. Princip řízení BLDC
má dva grafy nahoře, rotor s tečně natočenými Hallovými sondami dole
vlevo a tranzistorový můstek se spínací logikou vpravo.
Elektronická komutace má volbu stavů v pravém dolním panelu.
Řízení otáček má volby v panelu oblastí řízení a samokompenzaci
u ovládání. Smyčkové vinutí má přepínače v hlavičce a údaje v pravém panelu.


## Terminologie fúzních modulů, 23. listopadu 2026

Prošlo všech 18 položek aktuálního fúzního rozcestníku podle knihy
Entler–Kindl. Sjednoceny popisky v rozcestníku, ve výkladech, ovladačích
a při přehrávání. Přehled modulů a stránek knihy je v `docs/fuze/README.md`.

## Měrný odpor kovu a plazmatu, 23. listopadu 2026

Modul `fu15-vodivost` je v sekci Základy plazmatu a fúze jako položka 08.
Animace sčítá přitažlivost protonů, párové odpuzování elektronů a vnější
elektrické pole. Předepsaný pohyb protonů a výuková tepelná lázeň jsou oddělené
od makroskopického výpočtu Spitzerovy rezistivity a driftu. Model a ověření
popisuje `docs/fuze/vodivost-kovu-a-plazmatu.md`.
Kov přebírá princip přílohy `HiFyziko_kovova_mrizka_v6_neutralita.zip`.
Ukazuje neutrální soubor 32 iontových zbytků a 32 vodivostních elektronů.
Kružnice kolem kmitajících uzlů vymezují dosah modelového potenciálu,
který plynule vychyluje elektron. Místní kmity ovlivňují také četnost
malých fononových změn směru. Mřížka vlevo navazuje přes okraje díky
periodickému vykreslení i výpočtu sil. V levém dolním detailu je jeden
elektron se stejnou značkou jako v hlavní scéně. Oblouk a boční odečet
ukazují úhel mezi rychlostí a silou. Detail běží průběžně i přes hranice
buňky a při nulové síle zobrazuje její nulovou hodnotu. Legenda kovu používá „32 iontů“
a „32 volných elektronů v buňce“. Jemné spojnice sledují polohy
sousedních iontů i přes hranice buňky. Výklad popisuje doporučený pokus.
Průlet kolem protonu používá společné měřítko pro všechny teploty
a zobrazuje živou i referenční dráhu.
Posuvník Zahřátí má delší dráhu a větší úchyt.

## Asynchronní motor, 22. listopadu 2026

Jemná část stupnice odporu v obou pokusech zabírá přes polovinu dráhy. Do poměru 0,1 má krok 0,0001 a nad ním 0,001. Princip ve volbě Spřažené toky zobrazuje jejich skutečný vzájemný úhel z lineárního modelu. Při zániku rotorového toku se úhel označí jako neurčený.

Princip AM zobrazuje jednu klec současně od statoru a od rotoru. Odpor ovlivňuje proud, fázové zpoždění, moment a rozběh proti konstantní brzdě. Přepínač veličin ukazuje magnetická napětí nebo celkové poměrné spřažené toky v lineárním modelu. Volba siločar je samostatná.

Proč rotor potřebuje odpor používá jediný stojící závit. Pole lze natočit posuvníkem nebo spustit jeho otáčení. Kompaktní panel má vedle posuvníků odporu a natočení pevný prostor pro odečty. Horní graf zobrazuje okamžitý a střední moment za periodu. Volba Tok smyčkou vyznačí kladnou normálu a přepne horní graf na budicí tok, indukované napětí a proud. Dolní graf zachovává síly na tyči a výslednici. Pod lupou se pokus zaměřuje na rozběh, zatížení a polohu pracovního bodu.

## Proximity efekt, 21. listopadu 2026

Zapracovány opravy souřadnic a místních vzorků indukovaného proudu v modulu Skin a proximity efekt.

## Coulombův rozptyl a směrová relaxace, 21. listopadu 2026

Modul `fu17-rozptyl` je ve skupině Základy plazmatu a fúze za Driftem částic v poli. Vazba z výkladu ECCD zůstává. Zdroje: `versions/vyvoj/m_files/fusion/scattering/`. Dva průlety používají stejné měřítko a čas. Vpravo jsou doba a příčný impuls, skládání hybnosti a směry elektronů po mnoha slabých setkáních. Integrace a reprodukovatelné náhodné odchylky vycházejí z přiloženého pokusu. Ověřeny shoda numerických drah a odchylek s přílohou, matematická sazba a ovládání v testovacím prostředí. Vizuální kontrola v prohlížeči zůstává otevřená.

Průlety, doba a impuls, skládání hybnosti i statistika setkání jsou vidět současně. Průlety běží ve smyčce a oba vektory jsou trvale zapnuté. Časový posuvník zůstává v horním ovládání a změna rychlosti zachovává čas. Okno používá společné vystředění a škálování podle obou rozměrů. Částice vykresluje sdílená knihovna Driftu s dvojnásobným vzorkováním v obou směrech a značky částic a vektorů jsou přímo ve scénách v KaTeXu.

## ECCD – neindukční vlečení proudu, 21. listopadu 2026

Modul ECCD nyní běží průběžně. Tažením zářiče se mění výběr rychlostí a znaménko proudu. Horní pravý panel ukazuje energii jednoho průchodu, spodní panely ustálené podélné rozdělení a proudové příspěvky. Ustálená odezva průměruje impulsní řešení přes exponenciálně rozdělené časy od ohřevu se středem 5 τ₀. Rozdíl profilů je vložen do hlavního grafu na společnou rychlostní osu. Naladění nabízí frekvenci pro tepelnou rychlost podle náklonu. Odchylka červeného profilu je pro zobrazení násobena čtyřmi, proud se počítá z fyzikálního profilu.

## NBI – ohřev plazmatu, 21. listopadu 2026

Modul `fu15-nbi` ve skupině Magnetické udržení a tokamak používá zdroje z `versions/vyvoj/m_files/fusion/nbi/`. Přehled s CAD modelem ITERu zobrazuje referenční dráhu a depozici ve vrstvách. Volitelné sledování kamerou a značky dalších částic byly odstraněny. Rozšířený pravý graf energie přepočítává osu podle dostupných rozměrů. Číselná bilance částice je v dolním pásu. Parametry se přepočítávají automaticky po otevření a změně hustoty nebo teploty. Okolí ionizace je v přehrávání plynule zpomalené. Deuteron pokračuje po dráze i během pulzu a odletu elektronu. Po spuštění se přehled tokamaku zmenší a vycentruje v levé části. Zvětšený detail plazmatu zabírá hlavní část scény a graf má užší pravý sloupec. Tři spodní oddíly jsou výškově zarovnané na střed. Řádek Za úsek letu je viditelný i před ionizací a mění pouze hodnoty, aby dolní panel neměnil výšku. Detail přebírá z mechanického náhledu gyraci okolních částic, střídání vybraných Coulombových setkání a barevné pulzy obou skupin. Deuteron se zpomaluje podle kinetické energie. Podíl okamžitého ohřevu vychází ze statistického tření, graf a tabulka sledují postupně předanou energii. Šipky u setkání ukazují přitažlivost a odpuzování. Směry, časy a nárazové vzdálenosti průletů se mění podle reprodukovatelného výběru. V detailu je osa gyrace deuteronu ve středu a plazma se od vstupu po ionizaci postupně zaplní. Pozadí zobrazuje elektrony, deuterony, tritony a tepelná alfa jádra. Tepelné stopy mají tlumené odstíny a druh rozlišuje typ čáry i barevný obrys částice. Středová dráha deuteronu je bílá. Stopy se při přechodu hranice kreslí souvisle ve dvou periodických výřezech. Plovoucí popisek terče nahradil stávající pevný popis setkání. Detail plazmatu využívá téměř celou výšku panelu a graf je přibližně o desetinu užší. Hlavička a popis setkání mají pevnou výšku, částice používají čtyři předkreslené obrázky a přehrávání omezuje skok po opožděném snímku. Iontová gyrace používá příslušná znaménka náboje a poměry nábojů k hmotnosti. Zobrazení dodatečně zpomaluje elektronovou fázi, aby se mezi snímky zdánlivě neobracel směr. Bilance ohřevu používá dál deuteriovou aproximaci. Zvýrazněné částice vstupují přes okraj detailu a po průletu stejně opouštějí záběr. V každé ukázce se celá relativní dráha vzorkuje rovnoměrně ve fyzikálním čase, s pevným zvětšením. Průlety se mohou překrývat. Graf radiální depozice používá vektorové křivky SVG a popisky KaTeX. Pojmenování volby Zobrazit ohřev vysvětluje výběr elektronů a iontů v radiálním grafu i prostorovém řezu. Sledovaný svazek a jeho bilance zůstávají stejné. Test `node tools/test-nbi.cjs` kontroluje model, rychlost přehrávání, růst obou energetických příspěvků, bilanci a ovládání. Vizuální kontrola v prohlížeči zůstává otevřená. Původní NBI byl odeslán commitem 4978044. Novější úpravy detailu obsahuje aktualizace origin/main s koncovým commitem 2165c3f.

## Předání k publikaci — 20. listopadu 2026

Uživatel obnovil souhlas s pushem na origin/main. Tento záznam nahrazuje
starší poznámky o pozastaveném pushi. GitHub Pages sestavuje web po pushi.

Dodávka zahrnuje kompaktní ovládání Hodinového čísla transformátoru,
přesun poznámky k modelu do výkladu a opravu rozbalení vlastního zapojení.
U PMSM jsou momenty vedle zvětšeného řezu a rozjezd má nižší ovládací panel.
Přibývají dříve popsané opravy okrajů, ovladačů vinutí a hodnocení milníků.
Celá regresní sada prošla při auditu rozložení. Po posledních úpravách
prošla kontrola balíčků a načítání. Vizuální ověření v prohlížeči zůstává otevřené.


## Plošný zdrojový audit prostoru — 20. listopadu 2026

Závěrečná kontrola: celá sada `node tools/project/check.cjs` prošla;
po posledním doladění CSS PMSM znovu prošly progressive a synchronní
geometrické kontroly. Bez skutečného prohlížeče.

Rozsah inventury: 71 cest modulů v aktuální dodávce (včetně aliasů),
45 samostatných CSS souborů a vložené styly v 67 zdrojových HTML.
Vyhledány pevné výšky, maximální velikosti scén, spodní odsazení a
explicitní řádky; kandidáti porovnáni s konečnými přepisy společných
rámců a s přesouváním výkladu do dialogu. Nejde o skutečné měření
vykreslených obdélníků v prohlížeči. Vizuální kontrola všech modulů,
záložek, fullscreen a zoomu je nadále NEPROVEDENA.

Potvrzené nové opravy: větší řez PMSM při zachování sloupce textu,
kompaktní ovládání pohonu PMSM a tři prázdné řádky u transformátorů.
U ostatních cest zdrojový průchod neprokázal další bezpečně odstranitelnou
rezervu; to není záruka, že za všech rozměrů nevzniká viditelná mezera.
Pevné rezervy pro živé popisky, vzorce a neměnné rozměry při přepínání
režimů nebyly plošně rušeny. Modely ani integrátory se nemění.

| Modul / cesta | Kontrolované rozložení | Výsledek zdrojové kontroly |
| --- | --- | --- |
| 01-drazky | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 02-rozloha | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 03-pohyb | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 04-cinitel | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 05-drazkove | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 06-casoprostor | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 07-vinuti | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 08-vozidla | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 08-zesikmeni | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 09-synchronni | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| 10-asynchronni | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| 11-transformator | Nativní transformátorový rámec | Odstraněn skrytý stavový řádek: 40 + 12 px |
| 12-krok | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| am01-princip | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| am02-momentova-charakteristika | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| am04-trakcni | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| am05-odpor-rotoru | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| dc01-princip | DC rámec + layout příslušného pokusu | Bez další prokázané vady; vizuálně neověřeno |
| dc02-kotva | DC rámec + layout příslušného pokusu | Bez další prokázané vady; vizuálně neověřeno |
| dc03-schema | DC rámec + layout příslušného pokusu | Bez další prokázané vady; vizuálně neověřeno |
| dc06-komutace | DC rámec + layout příslušného pokusu | Bez další prokázané vady; vizuálně neověřeno |
| dc15-bldc | DC rámec + layout příslušného pokusu | Bez další prokázané vady; vizuálně neověřeno |
| dc16-bldc-poloha | DC rámec + layout příslušného pokusu | Bez další prokázané vady; vizuálně neověřeno |
| dc17-rozvinuti | DC rámec + layout příslušného pokusu | Bez další prokázané vady; vizuálně neověřeno |
| dc18-dve-pole | DC rámec + layout příslušného pokusu | Bez další prokázané vady; vizuálně neověřeno |
| dc19-vinuti-komutace | DC rámec + layout příslušného pokusu | Bez další prokázané vady; vizuálně neověřeno |
| em01-indukovane-napeti | Základy: společný rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| em02-vzajemna-indukcnost | Základy: společný rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| em03-silove-ucinky | Základy: společný rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| em04-pohybove-napeti | Energetický/vlnový rámec + scéna | Bez další prokázané vady; vizuálně neověřeno |
| em04-premena | Energetický/vlnový rámec + scéna | Bez další prokázané vady; vizuálně neověřeno |
| em06-vlna | Energetický/vlnový rámec + scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu01-reakce | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu02-galerie | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu03-drift | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu04-udrzeni | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu05-rovnovaha | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu06-divertor | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu07-plazma | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu08-ostrovy | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu09-princip | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu10-compass | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu11-rekonexe | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu12-lawson | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu13-ohrev | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| fu14-milniky | Fúzní rámec + vlastní layout/scéna | Bez další prokázané vady; vizuálně neověřeno |
| hf-skin-proximity | Základy: společný rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| mag01-magnetizace | Základy: společný rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| mag02-hystereze | Základy: společný rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| mag03-hysterezni-ztraty | Základy: společný rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| mag04-virive-proudy | Základy: společný rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm01-princip | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm02-schema | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm03-torque | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm04-transients | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm05-isolated | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm06-torque-origin | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm07-dq | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm08-rotor-dq | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm09-pmsm-phasor | Strojový rámec + vlastní layout | Zvětšen řez podle panelu; bez limitu 110 px |
| sm10-pmsm-drive | Strojový rámec + vlastní layout | Kompaktní parametry a přehrávání, 106 místo 132 px |
| sm11-v-curves | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| sm12-synchronizing | Strojový rámec + vlastní layout | Bez další prokázané vady; vizuálně neověřeno |
| tocive-pole | Nativní rámec + layout modulu | Bez další prokázané vady; vizuálně neověřeno |
| tr01-matematicky | Společný transformátorový rámec | Bez další prokázané vady; vizuálně neověřeno |
| tr02-magnetizacni | Společný transformátorový rámec | Bez další prokázané vady; vizuálně neověřeno |
| tr03-schema | Společný transformátorový rámec | Odstraněn řádek přesunutého výkladu: 36 + 12 px |
| tr04-pricna-vetev | Společný transformátorový rámec | Bez další prokázané vady; vizuálně neověřeno |
| tr05-rozptylova-reaktance | Společný transformátorový rámec | Bez další prokázané vady; vizuálně neověřeno |
| tr06-hodinove-cislo | Společný transformátorový rámec | Bez další prokázané vady; vizuálně neověřeno |
| tr08-zkratovy-proud | Společný transformátorový rámec | Odstraněn řádek přesunutého výkladu: 38 + 12 px |

Aktuální zdrojový a uživatelský výstup aktualizován; předchozí místní
lazy balíčky ponechány pro otevřené relace. Push zůstává pozastavený.

## Spodní rezerva Dynamické stability — 20. listopadu 2026

Podle uživatelova snímku odstraněn prázdný 24px řádek po poznámce
přesunuté do výkladu a jeho 8px mezera. Spodní padding snížen ze 16
na 4 logické pixely. Celkem 44 px navíc připadá experimentu. Pravidlo
platí jen při skutečném přesunutí poznámky (data-guide-source); samostatná
stránka s viditelnou poznámkou ji zachovává. Fyzika a ovládání beze změny.
Globální zákaz neúčelných okrajů doplněn do AGENTS.md; nejde o plošné
nulování funkčních mezer ani tvrzení o vizuálním auditu všech modulů.
Aktuální dodávka aktualizována, předchozí lazy balíček ponechán pro
otevřené relace. Progressive a synchronní geometrické testy prošly.
Bez vizuálního testu v prohlížeči, bez pushe.

## Kompaktní ovládání statického PMSM — 20. listopadu 2026

Podle uživatelova snímku zmenšen pouze panel modulu „PMSM: proud, tok
a moment“. Čtyři parametry jsou vlevo, přepínače zobrazení a Nastavit
MTPA v kompaktní mřížce vpravo. Záložky mají šířku podle textu.
Logická výška panelu klesla ze 132 na 78 px; rozdíl 54 px dostává
grafická plocha. Zachovány vstupy, výpočty, barvy a režimy rozjezdu.
Aktuální místní dodávka a manifesty aktualizovány. Předchozí místní PMSM
balíčky tentokrát zachovány pro již otevřené stránky; změna vzhledu
se projeví po obnovení celé stránky. Testy progressive načítání,
synchronního měřítka a parametrů PMSM prošly; vizuální test neproveden.
Bez pushe.

## Otevřená místní stránka PMSM — 20. listopadu 2026

Uživatel potvrdil chybu při „Ověřit bod v měniči“ v místní verzi.
Po aktualizaci PMSM zůstala otevřená stránka s předchozími názvy lazy
balíčků; běžný úklid sestavení je odstranil. Aktuální cílová trasa,
předání pracovního bodu a oba aktuální balíčky prošly samostatným testem.
Pro zachování rozpracované otevřené relace byly místně obnoveny přesné
předchozí balíčky sm09 (1b62c558c9deafa1) a sm10 (2051fb96472b7624).
Nejsou součástí nového manifestu ani veřejné dodávky; další sestavení
je může uklidit. Čerstvé načtení indexu používá aktuální balíčky.
Bez změny modelu či odkazu, bez pushe.

## Rozšířená kontrola zadávání mimo Vinutí — 20. listopadu 2026

Potvrzená chyba: společné nastavení PMSM nabízelo setrvačnost J také
ve statickém modulu „PMSM: proud, tok a moment“. J je použitá pouze
v dynamice rozjezdu. Seznam parametrů nyní J obsahuje jen v modulu pohonu;
model a integrátor se nemění. Test test-pmsm-parameter-scope.cjs spouští
skutečnou konstrukci nastavení v obou režimech, ověřuje zachování blokace
Lq pro SPM a vliv J na zrychlení v původním modelu. Zařazen do check.cjs.

Rozsah a meze auditu:
- Statická inventura 30 vložených lekcí a 11 fúzních indexů: 345 nalezených
  vstupních polí/selectů, žádné bez textové vazby na obslužný JavaScript.
  To je pouze vyhledání kandidátů, nikoli důkaz účinku každého parametru.
- Ručně prověřené podmíněné vazby: tlumení v synchronizaci a stabilitě,
  Xq u hladkého rotoru ve V-křivkách a výkladu momentu, úhel čisté R/L/C
  zátěže, režimy PMSM, zdroj/brzdný odpor u DC brzdění, omezení regulačních
  parametrů DC, kruhový/obdélníkový průřez a styl pole v matici vodičů,
  zamykání počátečních podmínek Lawsonova pokusu.
- Nad rámec nalezené setrvačnosti není v tomto průchodu další potvrzená
  trvale neúčinná volba. Nejde o vyčerpávající funkční audit všech režimů,
  dynamicky vytvářených vstupů a krajních kombinací celé aplikace.
- Skutečný prohlížeč nebyl použit; neoznačovat toto za vizuální ověření.

PMSM zdroj, oba generované moduly, vložené lekce, aktuální lazy balíčky
včetně manifestů aktualizovány. Regrese PMSM, synchronizace, milníků,
progressive kontrola a veřejný audit prošly. Push stále pozastavený.

## Kontrola účinku ovladačů Vinutí — 20. listopadu 2026

Počet pólů odstraněn z Činitele rozlohy i Činitele vinutí, včetně stavu
parametru a resetu. Při pevném q měnil pouze skrytý počet drážek; grafy
ukazují elektrickou periodu nebo normalizované činitele. Rovnice zachovány.
U Drážkových harmonických se vstup přidaného řádu povolí až po zapnutí
„Další harmonická“; inicializace, změna i reset drží tento stav shodně.

Rozsah kontroly: skupina Vinutí, nikoli všechny fyzikální moduly aplikace.
- Činitel rozlohy, Pohyb harmonických, Činitel vinutí, Drážkové harmonické,
  Časové a prostorové harmonické: nový test spouští skutečné vykreslovací
  funkce a porovnává kreslicí příkazy při změně parametrů, bez skrytého statusu.
- Činitel kroku: test výběru základní harmonické včetně vysvětlujícího pohledu.
- Točivé pole: kontrola obsluh ovládání a existující modelové/layout testy;
  ruční výběr pólové roviny správně vypíná automatický detail.
- Od drážek k MMF: kontrola vazeb geometrie, vrstev, kroku, spektra a režimu
  vykreslení; přídavná harmonická již měla správné podmíněné povolení.
- Třífázové vinutí a MMF: počet pólů vstupuje do konstrukce, počtu drážek
  a mechanického rozložení; zachován. Ostatní volby jsou použity ve výpočtu
  nebo kresbě jednotlivých panelů.
- Činitel zešikmení: Q a p mění elektrické zešikmení a základní složku;
  zachovány spolu s řádem harmonické a polohou řezu.

Další trvale neúčinnou volbu jsem v této kontrole nenašel. Parametr může
mít nulový účinek ve zvláštním fyzikálním stavu (např. nulová amplituda)
a některé volby platí jen v odpovídajícím režimu; to není zbytečný parametr.
Nové testy jsou zahrnuty v tools/project/check.cjs. Aktivní dodávka a
manifesty aktualizovány, cílené testy a progressive kontrola prošly.
Vizuální test v prohlížeči zůstává neproveden. Push nadále pozastaven.

## Odeslání k uživatelské kontrole — 20. listopadu 2026

Uživatel výslovně schválil push aktuálních oprav na `origin/main`, následně
jej pozastavil kvůli kontrole významu počtu pólů v Činiteli rozlohy.
Změny jsou připravené v indexu, zatím bez commitu a bez nového pushe.
Tento commit zahrnuje níže popsané kompaktní rozložení, základní harmonickou
a didaktické hodnocení milníků. Výchozí vzdálený stav: `b0ae8ca`.
GitHub Pages po pushi sestaví a nasadí web automaticky; dokončení nasazení
je potřeba ověřit v Actions. Označení aplikace zůstává 1.0.
Ke kontrole na monitoru 1920 × 1080 při 125 %: Skin/Proximity (čitelnost
hlavičky a velikost scény), Činitel kroku (řád 1 v „Proč harmonická zmizí?“)
a Točivé pole (využití výšky grafů). Automatické geometrické testy
nenahrazují tuto uživatelskou vizuální kontrolu.

## Kompaktní okno a základní harmonická — 20. listopadu 2026

Skin/Proximity: přepínače a akce hlavičky mají samostatný řádek, aby při
přizpůsobování výšce nezůstával názvu úzký sloupec a následně miniaturní
scéna. Oprava je omezena na hlavičku tohoto modulu. Geometrický regresní
model pokrývá Full HD při 125 % a několik výšek po odečtení lišt.
Činitel kroku dovoluje řád 1 i v pohledu „Proč harmonická zmizí?“;
nenulový krok základní harmonickou nevynuluje, příslušné tlačítko proto
zůstává neaktivní. Test ověřuje výběr, tok a popisky i původní nulování
páté harmonické. Točivé pole po vyjmutí hlavičky nerezervuje prázdné řádky
pro hlavičku a skrytý status; získanou výšku dostávají grafy.
Aktivní dodávka aktualizována cíleně, manifesty přepočteny. Testy měřítka,
volby harmonické, Točivého pole, progressive balíčků a audit prošly.
Skutečné vizuální ověření v prohlížeči nebylo dostupné (ovládání prohlížeče
odmítnuto zásadou prostředí); geometrické testy je nenahrazují. Zahrnuto do aktuálního odeslání.

## Milníky — pouze didaktické hodnocení, 20. listopadu 2026

Při nulovém externím ohřevu je vědecký milník „Nehodnoceno – zkouška bez
externího ohřevu“, bez zelené kontrolky a bez nového či přetrvávajícího
oznámení jeho dosažení. Fyzikální nerovnost i Q v modelu zůstávají stejné;
výklad a tooltip vysvětlují nedefinovaný podíl při nule a formální limitu.
Od 40 keV nebo 3000 MW se ve stávajícím stavovém řádku zobrazí upozornění
na idealizovaný 0D model (bez vyčerpání paliva, helia a úplného transportu
a stability). Jde jen o didaktické prahy, nikoli regulaci nebo omezení.
Model, integrátor a grafické soubory beze změny; regresní testy ověřují
skutečnou prezentační funkci, vypnutí, obnovení ohřevu a ostatní milníky.
Aktuální dodávka a lazy balíčky aktualizovány. Zahrnuto do aktuálního odeslání.

## Vinutí — kompaktní ovládání a všechny fáze, 20. listopadu 2026

Následná úprava: fázory všech tří fází v Činiteli rozlohy mají společný
osový kříž a vedle něj délky výslednic a činitel rozlohy. Pro násobky tří
výslednice skutečně splývají; odlišeny tloušťkou a výslovným popiskem.
Statické náhledy a výpočtové testy opět ověřeny. Přímý odkaz na Činitel
vinutí je index.html#04-cinitel; samotný index.html vede na rozcestník.

Činitel kroku: Spustit přesunuto vlevo od Tempa, uvolněná výška připadá grafům.
Činitel rozlohy: všechny tři fáze v drážkách, samostatné fázorové součty
(Re nahoru, Im doleva), porovnání výslednic a společné spektrum.
Činitel rozlohy i Činitel vinutí mají pevné dvě řady grafů v dostupné výšce.
Činitel vinutí výslovně ukazuje součin obou činitelů a násobení amplitudou
1/nu, se zachovaným výběrem harmonických pro jednu nebo tři fáze.
V drážkových harmonických odstraněna neúčinná volba pólových dvojic;
graf zobrazuje jednu elektrickou periodu, Q/p=6q. Ve čtyřech upravených
modulech jsou prostorové řády označeny nu. Obecná konvence nu/mu v AGENTS.md.
Cíleně aktualizovány nativní moduly a CSS aktuální dodávky i její manifesty.
Ověřeno 49 třífázových nastavení a 2352 součinů/amplitud, KaTeX, test kroku
a navigace. Statické canvasové náhledy rozlohy prohlédnuté; skutečný
prohlížeč nebyl kontrolován. Bez push.

## Fyzikální doladění energetických milníků — 20. listopadu 2026

Bosch–Hale, výkonové bilance a midpoint integrátor zachovány. Okamžitá
kladná dodávka se odlišuje od ustáleného vyrovnání: diagnostika požaduje
Q >= Q_B, lokálně návratovou tepelnou odezvu a relativní odchylku bilance
do 0,1 % po 3 dobách udržení při pevných parametrech. Jde o výukové
časové ověření modelu, nikoli obecný důkaz stability tokamaku.
Hustota je po startu zamčená i v pauze, odemkne ji reset; před startem
přepočítává počáteční energii ze zvolené výchozí teploty. Knižní podmínka
zapálení zůstává okamžitá, samostatná zkouška bez ohřevu vyžaduje její
nepřetržité plnění po 5 dobách udržení. Horní mez modelu nedává závěr.
Změna parametrů ruší časové ověření. Testy používají skutečnou funkci
advance ze stránky a ověřují i integrální zachování energie.
Ověřeno: cílené testy, syntaxe a KaTeX, úplné sestavení a celá sada
tools/project/check.cjs včetně progressive a veřejného auditu prošly.
Aktivní dodávka aktualizována. Prohlížeč nebyl otevřen; bez push.


## Počítání návštěv — 20. listopadu 2026

Do zdrojového rozcestníku přidán GoatCounter pro účet hifyziko. Skript se
načítá pouze na https://hifyziko.github.io/virtual-lab/ (také index.html),
nikoli lokálně ani v iframe. Jednotná cesta /virtual-lab/ sčítá příchody
na web; přepínání modulů nevytváří další návštěvy. Přehled správce:
https://hifyziko.goatcounter.com/. Aktivace na veřejném webu vyžaduje
výslovně schválený push a úspěšné nasazení. Zpětná data nejsou k dispozici.
Ověřeno úplné sestavení a tools/project/check.cjs; izolovaný test potvrdil
načítání jen na veřejné adrese a jediný loader v aktuální dodávce.
Žádná zkušební návštěva nebyla odeslána.
Na výslovný pokyn uživatele odeslán commit 9d3b2a6 do origin/main.
Push obsahuje pouze počítadlo a jeho dokumentaci; ostatní rozpracované
změny zůstaly místní. Publikaci dokončuje GitHub Pages.


## Elektřina a magnetismus — 20. listopadu 2026

Ovládání je zhuštěné ve společném rozvržení oddílu. Rychlé volby využívají
stávající horní panel. Skin, Proximity a Matice vodičů se přepínají z hlavičky
vedle „Ovládání a výklad“. Schéma Princip je statická perspektivní kresba.
Svislý prostor uvolněný z ovládání a výkladu využívají scény
a grafy. V prostředním panelu hystereze má proměnná zpráva rezervovanou výšku.
Tlačítko „Moduly“ má původní plovoucí polohu.

## Energetické milníky fúze — 20. listopadu 2026

Modul #fu14-milniky je v tématu Základy plazmatu a fúze za Lawsonovým
kritériem. Ovládání vlevo nastavuje celkový externí ohřev, hustotu, dobu
udržení a účinnosti. Ohřev se dělí v poměru 60 % NBI a 40 % vlnový ohřev. Model integruje tepelnou energii plazmatu a počítá
fúzní výkon z reaktivity D–T podle Bosch–Hale. Tři milníky vyhodnocuje
samostatně. Pod scénou jsou živé výkony, které řídí také animaci toků.
Zvýrazněné tlačítko „Jak na to“ vede čtyřmi pokusy včetně ověření zapálení.
Tokamak využívá profily ITER ze stávajícího modulu. Rozměry okna vycházejí
z modulu Magnetické udržení.

## Převzetí aktuálního projektu — 20. listopadu 2026

Na pokyn uživatele převzat soukromý archiv `virtual-lab-2026-11-20.zip`.
Aktivní větev: `prace/predani-2026-11-20`, převzatý commit
`c3f9924cd006b1632de03fc2c8e93344256ae0b6`. Ověřeno všech 1 793 souborů
podle SHA-256 manifestu a obnovena historie i LFS data. Původní `main`
zachována a aktualizována fast-forward na `567a598`. Aktuální výuka je
v `versions/aktualni/web/index.html`; zdroje v `versions/vyvoj/m_files`.
Soukromé podklady a chráněné zálohy zachovány. Push nebyl proveden.
Úplné sestavení prošlo; všechny části tools/project/check.cjs ověřeny.
Starší pomocná dodávka byla sestavením sjednocena s aktuálními zdroji.
Vizuální ověření ostrosti při změně velikosti okna nadále zbývá podle předání.

## Soukromé předání na druhý počítač — 20. listopadu 2026

Pracovní větev `prace/predani-2026-11-20` zachycuje místní úpravy ostrosti
grafů a scén při změně měřítka a na displejích s vyšší hustotou pixelů.
Zahrnuje výpočtové prohlížeče strojů, nativní grafy a vybrané fúzní scény.
Aktuální web byl sestaven včetně 51 souborů načítaných při otevření modulů.
Vzhled a chování při skutečné změně velikosti okna zbývá ověřit v prohlížeči.
Přesný commit, větev a stav vůči vzdálené větvi jsou v `_handoff/state.json`.

## COMPASS-U: sjednocené černé pozadí, světlá záloha zachovaná — 19. listopadu 2026

Obě videa v modulu fu10-compass i výchozím soukromém HTML přehrávači
mají stejné čistě černé pozadí RGB 0,0,0. Celek 84,125 s,
27397300 B; vnitřek 36 s, 20150673 B. Full HD, 24 fps,
bez popisků. Kamera, montážní pohyb, geometrie, materiály a plánované
parametry se nemění. Černá je jen scéna videa a její načítací překryv;
světlé ovládání a zbytek aplikace zůstávají zachované.

Původní světlý výstup je BEZE ZMĚNY ve složce Blender-animace/Final-celek,
včetně MP4, Blenderu a celé světlé PNG sekvence. Po dodání černé varianty
se čtením znovu ověřila shoda všech jeho souborů a 2019 PNG přes SHA-256.
K otevření zálohy slouží COMPASS-U_montaz_svetle.html a samostatně zachovaný
COMPASS-U_webovy-nahled_svetle.zip. Také původní Final-prulet se nemění.

Nové soukromé výstupy: Final-celek-cerne (MP4, samostatný Blender,
2019 skutečně průhledných PNG RGBA a manifesty) a Final-prulet-cerne
(nově složené MP4 z původní průhledné sekvence). Podklad je tedy stejný
v obou videích, zatímco jejich PNG lze skládat i na jinou barvu.
Výchozí HTML a webový ZIP používají nové černé varianty. Do veřejného
modulu jdou pouze dvě aktuální MP4 a malé náhledy; světlá záloha,
Blender ani PNG sekvence se na web nepřibalují.

Ověřeno všech 2019 nových PNG, jejich kopie SHA-256, oba počty snímků,
fps a rozlišení, dekódování několika etap, černé rohy obou koncových
videí a barvy neprůhledných částí proti PNG. Prošlo sestavení i kontrola
projektu. Prohlížeč nebyl otevřen. Uživatel následně výslovně schválil
push včetně obou videí a požaduje funkční načítání z webu. Tato dodávka
je určená k publikaci přes stávající GitHub Pages; soukromé zálohy,
Blender a PNG sekvence se neodesílají.

## COMPASS-U: finální montáž a nový modul — 19. listopadu 2026

Hotový modul fu10-compass, téma Tokamak; zdroje jsou v
versions/vyvoj/m_files/fusion/compass-u/, stabilní vstup
versions/aktualni/web/index.html#fu10-compass. Velké video vlevo,
plánované parametry vpravo, přepínání celku/vnitřní sestavy, posuvník,
kapitoly, rychlost a společná nápověda. Zachován původní světlý vzhled,
kompaktní ovládání, počáteční vystředění i měřítko podle okna a patička 1.0.

Celková montáž je nově finální kovový render: 1920 × 1080, 24 fps,
2019 snímků, 84,125 s, MP4 34 364 287 B. Delší přílety dílů,
proměnná výška a vzdálenost kamery, pohled nad otevřený tokamak a
závěrečný oblet. Bílý studiový podklad se skutečnými měkkými stíny.
Bez popisků. Geometrie tokamaku se podle výslovného pokynu nemění;
upravené normály zachovávají ostré hrany nad 25 stupňů a rovné desky.
SHA-256 vrcholů a topologie před/po úpravě souhlasí; všech 159 objektů
je v původní koncové poloze (největší odchylka pod 4e-12 m).

Soukromé výstupy jsou v COMPASS-U/Blender-animace/Final-celek:
MP4, soběstačný Blender zdroj, dvě ukázková PNG, úplná sekvence PNG_RGBA
a kontrolní manifesty. Všech 2019 kopírovaných PNG ověřeno SHA-256;
sekvence má 4 451 865 506 B a obsahuje neprůhledný bílý podklad.
Pro transparentní nový render vypnout samostatnou kolekci Podklad a stín.
Samostatný finální průlet vnitřkem zůstává 36 s, 20 130 103 B; jeho
původní transparentní PNG sekvence je zachovaná. Obě MP4 mají moov na
začátku pro web. Přehrávač COMPASS-U_montaz.html a soukromý webový ZIP
už používají obě finální videa. Na web nejdou CAD, Blender ani PNG sekvence.

Aktuální návrhové hodnoty: ÚFP AV ČR, Tokamak overview,
https://www.ipp.cas.cz/Compass_U/overview/, ověřeno 19. 11. 2026.
R 0,894 m, a 0,27 m, B 5 T, Ip 2 MA; ohřev počátečně NBI 3–4 MW
a ECRH 1 MW, později až 8 a 10 MW. Geometrie se podle nových čísel
nepřepočítává. Datum spuštění zařízení není přebíráno ze starších podkladů.
Podrobnosti a citace montáže jsou v docs/fuze/compass-u.md.

Ověřeno: rozlišení, počet snímků, fps, dekódování začátku/pohledu shora/
konce, barvy MP4 proti PNG (průměrná odchylka pod 0,82 z 255),
jediné vybrané video, zapamatování času, posuvník, obnovení přehrávání,
etapy ohřevu, chyba/opakování, uvolnění médií, navigace a lazy URL včetně
náhledů. Prošlo úplné sestavení a node tools/project/check.cjs.
Prohlížeč nebyl spuštěn; žádný push nebyl proveden.

## Dvě témata fúze a přejmenování tokamaku — 19. listopadu 2026

Uživatel schválil rozdělení oblasti Plazma a fúze na Základy plazmatu
a fúze (plyn/plazma, reakce/bariéra, drift, galerie) a Magnetické udržení
a tokamak (udržení, tokamak, přepojení/ostrovy). Dlaždice mají nenápadný
krémový nebo ocelově modrý podklad a textový štítek Základy/Tokamak.
Obě témata se v oblasti otevírají nezávisle. Číslování je od 01 v každém
tématu, původní module IDs i group-fusion zůstávají funkční.

Dosavadní Divertor má širší název Tokamak: pole a plazma v katalogu,
hlavičce a titulu stránky. Obsah a source/route fu06-divertor, alias
fu05-rovnovaha i URL fuze-rovnovaha/divertor.html zůstaly zachované.
Globální vzhled není přepnutý na tmavou variantu; barevné změny jsou
omezené na nové skupiny a jejich dlaždice. Modely a renderery se nemění.
Ověřeno: přesné rozdělení 4/3 modulů, samostatné číslování, jediná dlaždice
každého modulu, otevření obou skupin a zachování historických odkazů.
Prošly testy navigace, progresivního načítání, 97 rovnováh s GPU geometrií,
sestavení a audit veřejného výběru. Prohlížeč nebyl spuštěn.

## Materiálový CAD řez cívek — 19. listopadu 2026

Uživatel zvolil „Materiálový CAD řez: přesné kontury a střídmé rozlišení
kovů“. Předchozí dekorativní varianty jsou zrušené. V řezu nejsou mřížky,
šrafové výplně, odlesky ani ozdobné rámečky vinutí. Konstrukce je ocelově
šedá, obálka vinutí tlumeně měděná; kreslí se zdrojové hranice součástí.

V pojmenovaném STEP byly ověřeny CS_WINDING_SPACE_RESERVATION#2HWWAG
a CS_WINDING_VOLUME_INSIDE#JV9VPZ. Jejich skutečné poloidální obrysy
včetně stupňů na koncích nahrazují šest vybarvených obalových obdélníků.
Šest označených modulů se dělí uvnitř této obálky, podpěra zůstává zvlášť.
Zdroj obsahuje obálky prostorů vinutí, nikoli samostatné závity nebo kabely;
žádné takové detaily nejsou domýšlené. Modulové dělení zůstává idealizací.

PF používají původní vnitřní profily vinutí tam, kde jsou ve zdroji.
U PF1/PF6 chybí samostatný vnitřní obrys; uložena je výslovně označená
odvozená obálka uvnitř hlavních svislých stěn pouzdra, nikoli předstíraný
výrobní detail. Materiálové regiony se regenerují existujícím příkazem
node tools/extract-iter-parameters.cjs --coil-bodies; zdrojové řezy zůstaly.

Detailní varianta má opět shodný referenční render; 3D geometrie, fyzika,
polohy PF popisků a průchody spojnic zůstaly zachované. Centry názvů CS
odpovídají skutečné obálce vinutí. Ověřeno v úzkém i širokém renderu.
Prošly testy 97 rovnováh s GPU geometrií a kontrolami původu materiálových
kontur, reprodukovatelnost generátoru, sestavení, navigace, progresivní
načítání i audit veřejného výběru. Sestavené zdroje jsou shodné.

## Technická konvence řezu vinutím místo mřížky — 19. listopadu 2026

Uživatel odmítl pravidelnou mřížku profilů jako tabulkovou výplň. Je
odstraněna: svazky CS/PF jsou souvislé ploché měděně odlišené oblasti
s jemným šrafováním pod 45 stupni a samostatným obrysem izolační mezery.
Šrafování označuje řez materiálem, nikoli jednotlivé vodiče nebo jejich
počet. Kolem názvů se vynechávají pouze šrafy, podklad zůstává souvislý.
Žádné prostorové odlesky ani čtvercové buňky. Polohy, dělení modulů,
popisky a geometrie zůstaly stejné; změna se týká jen Celého řezu.
Ověřeno v samostatném renderu a testu 97 rovnováh s GPU geometrií.
Sestavení, navigace a progresivní načítání prošly; sestavený skript
je shodný se zdrojem. Prohlížeč nebyl spuštěn.

## Ploché průřezy vinutí CS a PF — 19. listopadu 2026

Předchozí kovový gradient a boční dekorace CS neodpovídaly poloidálnímu
řezu a byly odstraněny. CS se opět kreslí jako šest plochých řezů modulů,
s konstrukčním obrysem a měděně zbarveným svazkem profilů vodičů uvnitř.
Střed zůstává čitelný pro svislý název; nejde o stříbrný středový prut.
Také PF1–PF6 mají v řezu měděně odlišené vinutí. Pokud zdrojový CAD
obsahuje vhodný vnitřní obrys svazku, použije se; jinak je svazek
schematicky vepsaný do pouzdra. Mřížka vodičů a izolace je názorná,
nepředepisuje výrobní počet, rozměry ani složení jednotlivých vodičů.

Úprava je jen v Celém řezu. Popisky, průchody spojnic, fyzika a 3D
geometrie zůstaly zachované. Ověřeno v renderu řezu a testech 97 rovnováh
s GPU geometrií. Referenční render detailní varianty je nezměněný.
Sestavení, navigace a progresivní načítání prošly. Sestavený skript
odpovídá zdroji; prohlížeč nebyl spuštěn.

## Technické zpracování solenoidu v celém řezu — 19. listopadu 2026

Šest oddílů CS má jemně zkosený kovový obrys, decentní příčné stínování
a zlatavé náznaky vinutí po stranách. Střed zůstává čistý pro vystředěné
svislé jméno modulu, bez rámečku popisku. Spáry jsou vizuálně oddělené.
Textura závitů je schematická a neudává skutečný počet či konstrukci vodičů.
Rozměry, šest modulů a jejich názvy se nemění; úprava platí pouze pro
Celý řez, detailní varianta a 3D geometrie zůstávají stejné.
Ověřeno v renderu úzkého i širokého řezu a testu 97 rovnováh s GPU
geometrií a kontrolami umístění popisků.
Sestavení, navigace a progresivní načítání prošly; sestavený skript
odpovídá zdroji. Referenční render detailního řezu je beze změny.

## Konkrétní vedení popisků pouze v celém řezu — 19. listopadu 2026

Uživatel určil místa popisků a doplnil, že detailní řez se nemá měnit.
V celém řezu jsou názvy CS vystředěné v šesti stejně velkých grafických
oddílech; rušivé pomocné vnitřní CAD čáry se v tomto modulovém náhledu
nevykreslují. PF3 je nad průřezem, PF4 pod průřezem. Spojnice separatrix
má průchod mezi PF1 a PF2, nádoby mezi PF2 a PF3, SOL pod názvem PF4
a X-bodu blízko nad PF5. Profil zůstává vodorovný. Všechny spojnice
jsou souvislé, bez skrytých částí.

Detailní varianta bez Celého řezu používá dosavadní rozložení; její
referenční render je byte-identický s předchozím stavem. Data rovnováh,
zdrojová geometrie a 3D náhled se nemění. Testy ověřují vystředění CS,
polohy PF3/PF4, průchody spojnic určenými mezerami a nekřížení skutečných
úseků lomených čar. Vizuálně ověřen úzký i široký celý řez.
Prošly testy 97 rovnováh s GPU geometrií, nové kontroly popisků,
sestavení, navigace i progresivní načítání. Sestavený skript je shodný.

## Vodorovný profil a skutečný prostor pro názvy CS — 19. listopadu 2026

Spojnice profilu zůstává vodorovná ve výšce profilového řezu. Ostatní
spojnice upřednostňují vodorovnou polohu; sklánějí se jen kvůli průřezu PF,
názvům cívek či nekřížení ostatních spojnic. Zrušeno automatické šikmení
všech čar. Spojnice jsou nadále celé viditelné.

U svislých názvů CS se nyní hledá volný obdélník pro celý text v rámci
každého modulu proti skutečným čarám CAD řezu, nikoli jen volný sloupec
v několika výškách. To opravuje zejména CS3L, jehož spodní část protínala
příčná konstrukční hrana. Popisky nemají box a geometrie se nemění.
Poloha názvů je uložená podle rozměrů řezu, takže se výběr při posouvání
parametrů neopakuje. Vizuálně ověřen celý úzký a široký řez.
Regrese ověřuje vodorovný profil a celý obdélník každého svislého názvu
CS proti původním čarám řezu při třech velikostech. Prošly testy 97
rovnováh s GPU geometrií, sestavení, navigace i progresivní načítání.

## Souvislé šikmé odkazové čáry — 19. listopadu 2026

Podle upřesnění uživatele je předchozí skrývání spojnic za cívkami zrušeno.
Každý popisek má jedinou souvislou šikmou spojnici od kotvy k boxu, bez
ořezu a skrytých úseků. Rozložení volí sklon a výšku textu podle kotvy,
rozměru řezu a polohy ostatních spojnic. Při volbě výšky se penalizuje
průchod přes názvy cívek, PF průřezy a křížení ostatních spojnic.
Tvar řezu, kotvy, styly cívek a fyzikální data zůstaly zachované.
Vizuálně ověřeno pro úzký a široký celý řez. Regrese kontroluje šikmost
a vzájemné nekřížení souvislých spojnic v obou rozsazích řezu.
Prošly testy 97 rovnováh s GPU geometrií, sestavení, navigace a progresivní
načítání. Sestavený skript odpovídá zdroji; prohlížeč nebyl spuštěn.

## Čitelnost CS/TF a odkazové čáry za cívkami — 19. listopadu 2026

Odkazové čáry popisků jsou v celém řezu ořezané přesnými siluetami
viditelných TF, PF a CS průřezů (včetně jejich otvorů). V ploše cívky se
nekreslí čára ani její bílý podklad; neprotínají tedy průřez ani jeho jméno.
TF je výrazněji označené na vnějším rameni namísto úzké vnitřní větve.
Svislé názvy modulů CS hledají volný pruh mezi původními čarami řezu,
aby je neprotínala středová čára. Boxy zůstávají jen u aktivních cívek.
Geometrie, dělení, rovnováhy ani profil se nemění.

Ověřeno v renderu úzkého i širokého celého řezu a testu 97 rovnováh
s GPU geometrií, popisky a ovládáním.
Odkazové čáry respektují i volné místo kolem jmen cívek v otvorech
průřezů. Finální sestavení, navigace a progresivní načítání prošly;
sestavené soubory jsou shodné se zdroji.

## Prosté popisky cívek a svislé CS — 19. listopadu 2026

Neaktivní popisky cívek v poloidálním řezu mají průhledný podklad bez
rámečku. Barevný box a zvýraznění zůstávají pouze právě ovládaným cívkám.
Jména šesti modulů CS jsou otočená o 90 stupňů a vystředěná v jejich
úzkých oddílech. Polohy, dělení solenoidu a fyzikální data se nemění.
Sestaveno do aktuálního webu; navigace a progresivní načítání prošly,
sestavený styl je shodný se zdrojem. Prohlížeč nebyl spuštěn.

## Vzhled ponechán původní, varianta uchována — 19. listopadu 2026

Poslední pokyn uživatele: výchozí vzhled zůstává původní; tmavou variantu
uchovat pro případné pozdější přepnutí. Rozhodnutí a kompletní rozcestník
podkladů jsou v [docs/grafika/README.md](docs/grafika/README.md), s viditelným
odkazem z hlavního README a pravidlem v AGENTS.md. Původní dodaný vizuální
standard je v této složce uložen v nezměněném znění, nezávisle na ploše počítače.
Zdroje adaptéru, samostatný builder i obnovitelný náhled zůstávají zachované.
Standard je referenční varianta, nikoli souhlas s redesignem nebo aktivací.
`index.html` a běžné spouštění se nemění. Nic se nepublikuje ani nepushuje.

## Bod uvnitř SOL, označení cívek a dělení CS v řezu — 19. listopadu 2026

Bod SOL neleží na vykreslené vnější kontuře: při stejné výšce je umístěn
uprostřed mezi separatrix a vnější hladinou 1,025. Jeho tok se kontroluje
uvnitř tohoto rozmezí a poloha mimo uzavřené plazma; bod je menší, aby
nezakrýval obě hranice tenké schematické vrstvy.

V celém poloidálním řezu se u viditelných cívek zobrazují PF1–PF6 a TF.
Centrální solenoid má pět dělicích spár a šest označených oddílů:
shora CS3U, CS2U, CS1U, CS1L, CS2L, CS3L. Dělení odpovídá šesti grafickým
modulům 3D idealizace, nemění proudy ani fyzikální parametry. Aktivní PF
mají zvýrazněné názvy. Datové podklady původního řezu zůstaly nedotčené.

Dolní místo pro barevnou stupnici je oddělené od názvu a čísel radiální
osy i při celém řezu; grafika si tento prostor rezervuje také bez mapy,
aby změna mapy neměnila měřítko. Regrese hlídá všech 12 jmen PF/CS a TF,
kotvu SOL, popisky mimo kresbu a volné místo pro stupnici.
Ověřeno ve vykresleném celém řezu, testu 97 rovnováh s GPU geometrií,
sestavení, navigaci a progresivním načítání. Sestavené zdroje jsou shodné.

## Nezávazný návrh tmavého vzhledu — 19. listopadu 2026

Na žádost uživatele samostatný náhled `versions/aktualni/web/nahled-vzhledu.html`:
úvodní obrazovka, oblast Elektřina a magnetismus a první sekce Základní
elektromagnetické principy včetně jejích modulů. Běžný `index.html` nový vzhled
nenačítá. V dalších sekcích se zkušební styl vypíná. Nejde o schválený redesign.
Předložený vizuální standard sloužil jako reference barevnosti a komponent;
výslovné zadání zachovat poměry oken má přednost před doporučeným makrolayoutem.

Sdílené tokeny a pravidla: `versions/vyvoj/m_files/Web/visual-proposal.css`;
omezení rozsahu a porovnávací odkaz: `visual-proposal.js`.
Po zpětné vazbě uživatele je přepracovaný také vnitřek modulů: tmavé plochy
grafů a scén, ovládání, výsledky, osy a kontrastní popisky. Původní pokus
s ponecháním světlých panelů byl odmítnut. Adaptér `visual-proposal-paint.js`
připravuje vložené lekce před prvním vykreslením a mění pouze vlastnosti
vzhledu v CSS, SVG a vykreslování Canvas. Rozměry, poměry panelů, geometrie,
výpočty a škálovací mechanismus zůstávají původní. Materiálové přechody,
ImageData a numerické RGB škály se nepřebarvují. Barevné rodiny fyzikálních
veličin jsou zachované, vybrané tahy a popisky mají světlejší odstíny;
povinné barvy elektrického a magnetického pole se zachovávají přesně.
Náhled vzniká po progresivním sestavení nástrojem `tools/build-visual-proposal.cjs`,
sdílí stejné odložené datové soubory a eviduje se v obou manifestech.
Není přidaný do veřejného výběru `webFiles`; nebyl publikován ani odeslán na GitHub.

Návrat k běžnému vzhledu: otevřít `index.html`, případně použít porovnávací odkaz
v náhledu. Odstranění integrace: odebrat volání `build-visual-proposal.cjs`
z `tools/build-release.cjs` a znovu sestavit. Ostatní rozpracované změny zachovat.
Prohlížeč nebyl automaticky spuštěn; vizuální kontrola rozlišení a fullscreen
zůstává k posouzení při otevření návrhu.
Prošlo sestavení, navigace samotného náhledu, progresivní načítání, výklady
a stávající testy škálování a fullscreen. Samostatná kontrola ověřila přesnou
shodu obou HTML mimo vložky návrhu, omezení stylu na vybrané cesty
a kontrolní součty dodávky. Kontroly rozměrů používají simulované prostředí;
nejsou náhradou vizuální kontroly návrhu v prohlížeči.
Po úpravě vnitřku navíc prošla simulovaná kontrola barevného adaptéru,
zachování argumentů a stavu Canvas, numerických RGB škál i offscreen rastrů,
neměnného těla/modelu vloženého dokumentu a přípravy před jeho vykreslením.
Pokus přečíst existující okno Chrome přes Computer Use odmítla politika
nástroje; vzhled tedy ani po této revizi není vizuálně ověřený v prohlížeči.

## Jediný průchod siločáry a označení SOL podle knihy — 19. listopadu 2026

Prostorové zobrazení opět používá jeden poloidální průchod vybrané
siločáry, bez opakování obrysů. Výraznější magnetický povrch zůstává.
Ověřeno v Entler–Kindl, Jaderná fúze a fúzní elektrárny, kap. 7.11–7.12,
obr. 7.18, s. 158–159: okrajová vrstva uvnitř, SOL vně separatrix.
Kotva popisku SOL nyní míří na otevřenou hladinu 1,025 u dolního boku,
kde je její odstup od separatrix čitelný, nikoli na nejvzdálenější bod
tenkého pásu poblíž separatrix. Kotva separatrix používá její skutečnou
konturu místo blízké vnitřní hladiny výplně. SOL má světle modrou výplň
a jedinou jemnější vnější konturu; černá separatrix zůstává samostatná.
Šířka výplně je stále pouze schematická, nikoli výsledek transportu.
Regrese kontroluje tok v kotvě SOL nad jednotkou a polohu vně uzavřené
oblasti; knižní PDF zůstává neveřejné.
Prošly testy 97 rovnováh a GPU geometrie, kotvy SOL, sestavení,
navigace i progresivního načítání. Nové označení vizuálně ověřeno v řezu.

## Více oběhů siločáry — 19. listopadu 2026

Uzavřený poloidální obrys se při prostorovém trasování prochází až třikrát
s nepřerušenou toroidální fází. Nejde o kopie stejné křivky ani umělé
spojení konců. Zachován limit šesti toroidálních oběhů i zastavení u X-bodu;
otevřená větev SOL se neopakuje. Pole, rovnováhy a profil zůstávají stejné.
Neutrální zobrazení vybraného povrchu má zvýšené krytí z 0,19 na 0,29
a jeho řezné plochy z 0,16 na 0,24. Kamera a geometrie se neměnily.
Regrese kontroluje prodloužení stopy, plynulou fázi a nepřítomnost skoků,
a nezměněné trasování otevřených větví.
Prošly testy 97 rovnováh s GPU geometrií a novými regresními kontrolami,
sestavení, navigace i progresivního načítání.

## Popisky řezu, vybraný povrch a kompaktní ovládání — 19. listopadu 2026

SOL, separatrix, X-bod, vakuová nádoba a profil mají vyhrazený pravý
popiskový sloupec mimo kresbu. Kotvy zůstávají na skutečné geometrii;
odkazové čáry a cílové body jsou barevně odlišené. Pozice textů se řadí
s minimálním rozestupem i při posouvání profilového řezu. Název radiální
osy je pod čísly, název svislé osy nad hrotem. Změnilo se rozložení,
nikoli tvar nebo data levého řezu. Ověřeny oba rozsahy při třech rozměrech.

Aktuální uzavřený magnetický povrch je v prostoru viditelnější průsvitnou
modrou plochou; při konstrukčním řezu má navíc průsvitné řezy a obrysy.
Siločára je dál samostatná prostorová křivka. Otevřená větev SOL se nesmí
uzavírat umělými řeznými plochami. Fyzikální data se neměnila.

Levé ovládání má nižší selecty, tlačítka a rozestupy; uvolněná výška patří
flexibilnímu grafu profilu. Posuvník výšky zůstává přímo u grafu.
Regrese kontroluje nepřekrývání popisků, jejich umístění mimo kresbu,
oddělení titulku radiální osy od čísel a viditelnost vybraného povrchu.
Prošly testy 97 rovnováh a GPU geometrie, popisků a povrchu, sestavení,
navigace i progresivního načítání. Popisky byly vizuálně ověřeny
v samostatném renderu plátna pro úzký a široký celý řez.

## Oprava deformovaného TF těla — 19. listopadu 2026

Předchozí varianta s polárním přepisem podpěr a výřezů PF byla chybná
a je zrušena. Sloučila hlavní tělo, lokální podpěry a pás vinutí; vznikly
zubaté a deformované obrysy. Test průniků sám o sobě správnost nezajišťuje.

Aktuální idealizace odděluje hladké D-tělo TF od lokálních konstrukčních
detailů. Vnitřní obrys vychází z původního CAD otvoru. Obal vzniká jeho
normálovým odsazením o 0,88 m, podle tloušťky 0,880901 m změřené v původním
nepřerušeném vnějším boku. Jde o názorné hlavní tělo se sjednocenou tloušťkou,
nikoli přesnou kopii celého pouzdra STEP. Drobné podpěry se vynechávají;
nedělají se umělé zářezy do pásu vinutí ani přídavná 20mm vůle.
PF pouzdra nadále používají své vlastní zdrojové obrysy a polohy.
Generátor: node tools/extract-iter-parameters.cjs --coil-bodies.
Starší přepínač --coil-clearances je pouze alias nové opravené varianty.

Zvětšený výchozí záběr, pevné měřítko při vypínání dílů, ovládání myší,
levý řez i diagnostický profil zůstávají. Regrese nyní ověřuje i hladký
konvexní D-obrys bez zářezů podpěr, vedle vzorkování průniků s PF.
Ověřeno v samostatném renderu geometrie, testu 97 rovnováh s GPU geometrií,
nových tvarových regresích, sestavení, navigaci a progresivním načítání.
Sestavené soubory jsou shodné se zdroji. Prohlížeč nebyl spuštěn.

## Profil napříč komorou — 19. listopadu 2026

Graf podél poloidálního obrysu nahrazen vodorovným profilovým řezem.
Posuvník Výška řezu mění z; zelená přerušovaná čára v levém řezu ukazuje
skutečnou polohu vzorkování. Vodorovná osa grafu je R v metrech, rozsah
je pevný podle komory a výpočetní sítě. Značky průchodů separatrix a první
stěnou vycházejí z průsečíků s jejich geometrií. Graf přebírá veličinu
barevné mapy; bez mapy zobrazuje tlak. Tlak, j a beta se kreslí pouze
v uzavřeném plazmatu; mimo síť, komoru a v materiálu jsou mezery.
Vzorkování nemění vybraný magnetický povrch, pole, rovnováhu ani 3D kameru.
Jde o názorný diagnostický řez, nikoli model konkrétního snímače.
Regrese porovnává hodnoty s původním modelem, polohu průsečíků, mezery
v SOL a materiálu a změnu výšky bez zásahu do rovnováhy nebo kamery.
Ověřeno sestavení, 97 rovnováh s GPU geometrií a novými testy profilu,
navigace a progresivní načítání. Křivka profilu byla zkontrolována také
v renderu plátna; prohlížeč nebyl spuštěn.

## Pevná plocha tokamaku a spodní popisky — 19. listopadu 2026

Odstraněno pozdější CSS přepsání `.views` na relativní polohu s automatickou
výškou. Plocha je opět absolutně ukotvená ze všech stran; rozměry pixelového
bufferu canvasu nesmějí zvětšovat prostor a tím měnit měřítko po přepnutí
geometrie. Pevná obálka celé sestavy a ruční zoom/otáčení myší zůstávají.
Popis plazmatu a legenda jsou společně dole mimo tokamak. Doplněn význam
osy `s/s_celkem`: normalizovaná délka po vybraném poloidálním obrysu,
nikoli radiální poloha nebo délka prostorové siločáry. Test hlídá také
výsledné CSS ukotvení prostoru, nejen kamerovou matici rendereru.
Ověřeno: test 97 rovnováh včetně GPU geometrie a kamery, sestavení,
navigace fúzních modulů a progresivní načítání. Prohlížeč nebyl spuštěn.

## Navazující porty, materiály a stálé měřítko — 19. listopadu 2026

Opraveny tři rodiny portů: otvor v obou pláštích, přechodové hrdlo a příruba
vycházejí ze stejného rámu. Poloidální parametrizace obou plášťů obsahuje
společné roviny otvoru; kořenové hrany mají přesně dvě incidentní plochy.
Stejné rámy prořezávají ve 3D i panely první stěny, stínění a úchyty.
Nahradilo to nesprávnou podmínku pro vynechávání panelů podle azimutu.
Levý řez včetně obkladu je přesně shodný s předchozím stavem.

Materiály mají vlastní metalness/roughness a odrazivost: pouzdra, nádoba,
broušená hrdla, leštěné příruby, vinutí, stínění a wolframové povrchy.
Řezné krycí plochy se nyní vytvářejí samostatně pro tělesa se svým materiálem;
otevřené dekorativní vložky se do stencilové výplně nezapočítávají.
Vizuální parametry jsou názorné, nikoli naměřené vlastnosti povrchů.

Odstraněno automatické přizpůsobování kamery náklonu. Měřítko používá pevnou
obálku celé sestavy pro všechny orientace a nezávisí na viditelnosti dílů.
Kolečko, explicitní reset a skutečná změna rozměru plochy zůstávají funkční.
Testy ověřují stálé měřítko při orbitování a shodnou kamerovou matici při
přepínání jednotlivých součástí. Rovnováhy, pole a levý referenční řez jsou
nezměněné. Sestaveno lokálně; cílené testy geometrie a rendereru i úplná kontrola node tools/project/check.cjs prošly. Sestavené soubory geometrie a rendereru jsou shodné se zdroji.

## Technické zpracování prostoru a souvislá siločára — 19. listopadu 2026

Na uživatelovo porovnání s původním obrázkem doplněny sražené hrany TF,
hladké 3D profily, vinutí, kovové lemy, spáry a táhla CS. Opraveny normály
PF/CS: válcové stěny se už nevyboulí odleskem čel. Zůstává lehká parametrická
sestava (cca 565 tisíc trojúhelníků včetně všech detailů, nikoli velká síť CAD).
Levý řez ani uložené rovnováhy nejsou změněny.

Vybraná prostorová siločára je opět celá, výrazná modrá s bílým lemem.
Používá trubici s transportovanými jednotkovými rámy a konstantní šířkou
v pixelech; kamera nemění její GPU buffery. Hloubkový test zachovává fyzické
zakrytí konstrukcí. Pohyb směrových značek pokračuje ve 3D. Diagnostické
kontury se dále ořezávají. Výtvarný řez odkrývá konstrukci, nikoli část
vybrané siločáry. Barevné vložky řezů mají oddělené hloubky proti blikání.
Viz docs/fuze/iter-native-cad.md. Sestavení a celá projektová kontrola prošly.
Prošly také cílené Three testy normál válcových stěn, rámy trubice, stálá
šířka siločáry při změně měřítka a disposal. Vizuálně prohlédnut samostatný
VTK náhled s barevnými vložkami a celou siločárou; prohlížeč se nespouštěl.

## Lehká parametrická sestava ITER — 18. listopadu 2026

Po uživatelově kontrole nahrazen objemný detailní export matematickými
šablonami a jejich opakováním. Geometrická data 151,5 MB → 0,325 MB,
celá sestava včetně obkladů 103 milionů → 389 952 trojúhelníků.
D-cívka a sektor nádoby sdílejí šablony; šest PF prstenců, CS a trojice
divertorových kazet se generují z kompaktních profilů. Montážní fáze
a počty 18 TF / 9 sektorů / 54 kazet zůstávají zachované. Výrobní detaily
jsou záměrně idealizované. Velké sítě nejsou v aktivním stromu ani dodávce.

Uživatel výslovně ocenil a požádal zachovat levý řez. Jeho podklady jsou
bitově shodné, ověřené pomocí referenceSections/SHA-256. Fyzikální data
a 97 rovnováh jsou nezměněné. Při řezu se ořezává i prostorová siločára;
směrové šipky jsou 3D značky s hloubkovým testem místo překryvu přes CS.
Aktuální zdroje: cad-parameters.js, parametric.js, cad.js, blanket.js.
Předchozí níže popsaný nativní export je již překonaný způsob dodávky.
Viz docs/fuze/iter-native-cad.md. Sestaveno do versions/aktualni/web;
celá projektová kontrola prošla. Prohlížeč se nespouští.

## Nativní sestava ITER a rekonstrukce obkladů — 18. listopadu 2026

Dokončeno nahrazení ručních konstrukčních profilů skutečnou sestavou STEP
z oficiálního modelu ITER pro 3D tisk v2.0. Tato úprava nahrazuje níže
popsané předchozí aproximace nádoby, cívek a divertoru. Zdrojové montážní
souřadnice zůstávají zachované, převod mm → m je ve všech osách stejný;
opakování dílů používá pouze rotace kolem osy stroje. STL tiskové orientace
nejsou vydávané za montážní souřadnice. Sítě i přesné poloidální řezy
exportují volitelné import-iter-cad.py a pack-iter-cad.py. Běžné sestavení
zůstává čistě Node.js bez CAD kernelu nebo přepočtu polí.

Uživatel výslovně doplnil požadavek rekonstruovat chybějící obklady podle
M. Merola, Design of ITER Plasma Facing Components (2009), snímky 78,
82–83 a 89. Rekonstrukce v blanket.js je oddělená od převzatých dílů:
18 lomených řad, samostatná čelní deska, stínicí bloky a úchyty k nádobě.
Opakování a výřezy jsou ilustrativní, nikoli výrobní mapa 440 modulů.
Přesné porovnání s předchozím commitem potvrdilo shodu všech dat mimo
machine, SHA-256 5a62035c6e7b10ee05fb9eefe0a0e5b9361c3db6f35794790cf8a7a0476811af.
Žádná rovnováha ani pole se při opravě konstrukce nepočítají znovu.

Podrobnosti, původ a omezení převodu: docs/fuze/iter-native-cad.md.
STEP, BRep, STL a PDF zůstávají privátně mimo Git a veřejný web.
Stav ověření: sestavení tools/build-release.cjs a celá projektová kontrola
prošly. Prošly testy 97 rovnováh, vytvoření nativních Three sítí s náhradou
WebGL driveru, kamera/cache/disposal, canvasový řez a samostatný VTK náhled.
Regrese všech 18 řad obkladů ověřuje polohu stínění za skutečnými čelními
trojúhelníky. Prohlížeč nebyl spuštěn. Web je v versions/aktualni/web.

## Divertor a blanket — oddělené plochy sestavy, 18. listopadu 2026

Na základě uživatelova anotovaného řezu přepracováno zasazení divertoru:
ochranné límce navazují na samostatný profil první stěny, terče pokračují
k výše umístěnému nesouměrnému dómu, pod ním je prostor pro odčerpávání.
První stěna, stínicí bloky blanketu, úchyty a dvojitá nádoba už nesdílejí
jedinou plochu. Blanket má vlastní modulární geometrii a místa pro porty;
její členění nereprodukuje skutečných 440 výrobních pozic ITER. Spodní
čerpací kanály jsou duté a navazují na prostor pod divertorem.

V oficiálním archivu IO_3D_models_v2.0.zip ověřeny divertorové STL/OBJ/STEP.
STL tří kazet a jednoho sektoru nádoby jsou soukromě v docs/fuze/podklady/
iter-model se záznamem CRC a SHA-256; nepatří do Gitu ani webu. Samostatný
soubor blanketu v seznamu 54 položek není. Tisková orientace STL není montážní
souřadný systém; veřejný model zůstává vlastní přiznanou aproximací podle
řezů a podkladů, nikoli ověřeným CAD sestavením.

Opraveno zahazování celé kontury při chybějícím druhém dopadu v rozsahu
dat: známá větev zůstává viditelná, konec sítě není dopad na materiál.
Přidána detekce případného zásahu uzavřeného plazmatu do materiálu.
Všechna uložená pole, rovnováhy, proudy a profily jsou nezměněné.

## Divertor — geometrie kazet podle ITER, 18. listopadu 2026

Přímo prohlédnut oficiální přehledový obrázek a rotující animace kazety na
https://www.iter.org/machine/divertor. Dřívější ploché nosiče a výrazně šikmý
vnější terč nahrazeny kazetou tvaru U, dvěma zakřivenými převážně svislými
terči a samostatným dómem na podpěrách. Celkem 54 kazet. Profily jsou vlastní
názornou aproximací; nejde o výrobní rozměry ani převzatou CAD síť.
Stejné profily slouží řezu, 3D sestavě i ukončení siločar na první překážce.
Spodní konstrukční obrys komory obklopuje kazetu a neprotíná její nosník.
Všech 97 rovnováh a referenční pole zůstaly nezměněné. Generátor má stejné
nové vstupy geometrie; žádný přepočet GS nebyl spuštěn.

## Divertor — oprava podle obr. 7.18 knihy, 18. listopadu 2026

Odstraněno vybarvení celé mezery mezi separatrix a první stěnou jako SOL.
Modrý pás u separatrix a podél divertorových větví je výslovně schematický;
jeho šířka ani útlum nejsou výsledkem transportního výpočtu. Mezera k první
stěně zůstává nevybarvená, konstrukční šrafování leží pouze za první stěnou.
Žlutá okrajová vrstva zůstává uvnitř separatrix; její sytost a krytí byly zvýšeny pro čitelné odlišení od růžového jádra. Přímé porovnání: Entler–Kindl,
Jaderná fúze a fúzní elektrárny, obr. 7.18, s. 158, kap. 7.11–7.12.
Kontura se v X-bodě kříží; výklad označuje její lokální numerickou rekonstrukci.
Podrobnosti a omezení jsou v docs/fuze/iter-divertor-2026-11-18.md.

## Předání na druhý počítač — 18. listopadu 2026

Uživatel výslovně požádal o soukromý ZIP a push, v pořadí nejprve
ověřený ZIP, poté push. Archiv proto může mít pushPending=true;
to zachycuje okamžik balení před následným odesláním stejného commitu.
Kompletní sestavení a tools/project/check.cjs prošly před balením.
Přesný commit je v _handoff/state.json. Aktuální plazma obsahuje hustotu
siločar 0,5–4× a opravenou únikovou energii ionizované dvojice.
Z pozorování kmitání zůstaly jen volitelné svislice středů, výchozí vypnuté.
Součástí předání jsou i aktuální úpravy divertoru, synchronizace
a izolované sestavení, které zachovává dostupný rozcestník.
Na novém počítači rozbalit do nové složky a spustit
node tools/project/restore.cjs; potom přečíst pravidla a ověřit stav Gitu.


## Uvolnění elektronů při ionizaci — 18. listopadu 2026

Opravena příprava nového elektronu: radiální relativní rychlost zahrnuje
únikovou energii měkkého Coulombova potenciálu a původní relativní
kinetickou energii. Zachována hybnost dvojice se zpětným rázem iontu;
energii dodává modelovaný tepelný rezervoár při změně ionizace.
Žádná průběžná odpudivá síla ani posouvání vykreslených částic.
Test dvaceti počátečních stavů ověřuje kladnou relativní energii a
skutečné odtržení integrované izolované dvojice. To nezaručuje únik
v magnetickém poli, od stěn ani od dalších nábojů. Rekombinace je nadále
řízena cílovou ionizací, není řešena mikroskopicky. Výklad doplněn.
Aktuální výstupy cíleně aktualizovány včetně manifestů; bez pushe.


## Zaměření plazmatu na ionizaci — 18. listopadu 2026

Konečné upřesnění: zůstává pouze nezaškrtnutá volba Středy nábojových složek,
která kreslí dvě svislé čáry bez popisků. Graf a vychýlení odstraněny.
Uživatel odložil rozvoj kolektivního kmitání. Odstraněny
značky středů, jejich přepínač, tlačítko vychýlení, graf oddělení nábojů
a příslušný návod. Priorita je názorné porovnání neutrálního plynu,
částečné a plné ionizace a reakce částic na pole. Přirozené vzájemné
síly a srážky zachované. Předchozí návrh PIC nyní není aktivní úkol.
Test modelu a ovládání prošel; aktualizována aktuální dodávka.


## Oprava dočasně chybějících fúzních modulů — 18. listopadu 2026

Příčinou nebylo smazání modulů, ale průběžné přepisování aktivního rozcestníku
během úplného sestavení: základní mezikrok ještě neobsahoval fúzní navigaci.
Úplný build nově používá izolované výstupy v tmp/release-build-* pro obě místní
dodávky. Před zveřejněním ověří přítomnost všech fúzních registrací, jejich
lazy dat, pořadí rozcestníku a SHA-256 všech souborů. Aktivační HTML nahradí
atomickým přejmenováním až po nakopírování připravených dat. Neúspěšné sestavení
ponechá poslední kompletní index. Předchozí lazy payloady zůstávají dostupné
pro již otevřené stránky. Zámek brání souběhu dvou úplných sestavení.

Nové kontroly v tools/project/test-tools.cjs simulují chybu kopírování,
neúplný rozcestník a poškozený datový soubor. Test fúzní navigace ověřuje také
skutečný obsah dodaného indexu. Během nového kompletního sestavení zůstával
aktivní index s šesti fúzními moduly a kontrola navigace procházela.
Úplné sestavení s izolovanými výstupy bylo dokončeno a obě aktuální dodávky
byly úspěšně přepnuty. Dočasné výstupy i zámek byly po dokončení odstraněny.

## Odstranění samostatného kolektivního režimu — 18. listopadu 2026

Podle výslovného pokynu uživatele odstraněn celý samostatný režim Kolektivní
kmitání: volič, PIC solver, jeho zvláštní vykreslení a předvolby, výklad i testy.
Zůstává jediný původní 2D model částic, Coulombovy síly, ionizace, srážky a B.
Přehrávání 0,25–4× je společné, výchozí 1×, maximální krok 0,003.
Volitelné přerušované svislice ukazují skutečné průměrné vodorovné polohy
elektronů a iontů (od čtyř dvojic), jejich rozdíl se dál měří v grafu.
Do dynamiky nebyla přidána žádná společná oscilace ani budicí síla.

Numerická diagnostika: 100 atomů, plná ionizace, B=0, kontakty vypnuté,
jednorázové posunutí elektronů o 0,65; při t*=3 vychází oddělení 0,0257
s elektrickou interakcí, 0,6578 bez ní, z totožných počátečních dat.
Zásadní kontrola: návrat podobné velikosti vzniká i při ponechání interakcí
pouze uvnitř původních dvojic (přibližně 0,053 při t*=3). Tento výsledek
NELZE prezentovat jako průkazný kolektivní plazmový kmit. Párově korelovaný
vznik elektronů a jen sto elektronů jsou významná omezení; šum, kontakty
a stěny dále zakrývají souhrnnou odezvu. UI výklad toto výslovně uvádí.

Doporučený další fyzikální rozvoj (zatím neimplementován): v tomtéž modelu
použít početnější výpočetní soubor s vyrovnanou počáteční hustotou a pole
řešené z hustoty náboje, například 2D PIC/Poisson; zobrazovat jen vzorek
částic a prostorovou poruchu hustoty. Ověřit konvergenci počtem a krokem,
energii i rozlišení kolektivní odezvy od párového návratu a odrazů.
Nevracet samostatnou předepsanou animaci. Doplněk k literatuře:
MIT OCW 22.611J, Basic plasma concepts (Debye shielding, plasma frequency,
plasma parameter); Stanford PDML About (mnoho částic v Debyeově sféře).
https://ocw.mit.edu/courses/22-611j-introduction-to-plasma-physics-i-fall-2006/pages/syllabus/
https://pdml.stanford.edu/about

Sestavení tools/build-particle-library.cjs dokončeno pro oba výstupy;
celá sada tools/project/check.cjs prošla včetně auditu veřejných souborů.
Testy původního modelu a nových měřených značek prošly; kontrola návratu
porovnává totožná počáteční data, netvrdí průkaz kolektivity. Canvasový
náhled zkontrolován bez otevření prohlížeče. Bez pushe.


## Čitelnější kolektivní pokus — 18. listopadu 2026

Na připomínku malého, pomalého a chaotického pohybu: viditelný vzorek
zmenšen z 32 na 12 elektronů ve dvou řadách; iontové značky ztlumené,
jejich záře v PIC režimu vypnutá. Šipky pole řidší, stopy kratší a slabší.
Všech 4096 makročástic se dál počítá. Parametr počáteční poruchy zvětšen
z 1,2 na 2; jde o jinou počáteční podmínku, nikoli zesílenou budicí sílu
během pohybu. Výchozí přehrávání 2×, samostatný posuvník 0,25–4×.
Maximální integrační krok 0,003 zůstává zachován zvýšením počtu podkroků.

Nepoužitelné ovladače ionizace, počtu, teploty, srážek a B jsou v PIC
režimu skryté, čímž levý graf získá větší výšku. V původním částicovém
pokusu jsou zachované. Dokumentace opravena na 12 zobrazených značek.
Test plazmatu prošel včetně skutečného UI tempa 4× a 0,25× při stejné
mezní délce integračního kroku. Odchylka energie nového výchozího modelu
v testovaném intervalu je přibližně 0,058 procenta. Canvasové náhledy
prohlédnuté; prohlížeč neotevřen. Bez pushe.

## Místní doplnění po pushi 85bb18c — 18. listopadu 2026

Pozadí Divertoru sjednoceno se sdíleným světlým podkladem částicových modulů
`#f9faf6`; odstraněn samostatný modrošedý gradient za tokamakem. Graf proudů
a popisky používají bílé podklady. Materiálové odlesky rendereru zachované.

Fialová 3D obálka nyní sleduje separatrix, nikoli vybraný magnetický povrch.
Výběr povrchu nemění mez uzavřené oblasti; změna rovnováhy proudy nebo tlakem ano.
Ostrá hranice fialové/žluté na zvolené hladině psi_N=0,90 byla následně odstraněna.
Okrajová vrstva je schematický plynulý přechod pouze uvnitř separatrix; její
fyzikální vnitřní mez a šířka nejsou řešeny transportním modelem. SOL je šrafovaná
oblast otevřených siločar od separatrix po materiálový obrys, bez umělé horní
meze psi_N=1,09. Předvolby přejmenovány na Vnitřní povrch, Separatrix a Siločára
v SOL; vybírají jednu křivku, nepřepínají oblasti. Regrese ověřuje umístění
šrafování vně a žlutého přechodu uvnitř separatrix i neměnnou GPU geometrii
obálky při výběru a její změnu při ovládání cívek.

Divertor: žlutá okrajová vrstva uvnitř separatrix podle Entler–Kindl, obr. 7.18,
s. 158; vrstva SOL zůstává vně. Doplněna první stěna a sjednoceno názvosloví.
Odstraněno číslo 3 a popisek oblasti mezi větvemi; okrajová vrstva má vlastní
slovní popisek. Přidáno výrazné označení ovládaných PF cívek v řezu a indikace
cívek mimo detailní záběr, bez automatické změny měřítka. Tlačítko Srovnat
odstraněno, kameru obnovuje dvojklik v prostoru. Mapa se jmenuje Normalizovaný
magnetický tok, posuvník Výběr magnetického povrchu; výklad odlišuje tok a indukci.
Ověřeno na 97 stavech, Three geometrii a canvasových náhledech tří rozměrů.
Podrobnosti docs/fuze/iter-divertor-2026-11-18.md. Změny jsou místní a vznikly
po původním ověřeném předávacím ZIPu s commitem 85bb18c. Další push ani balíček
se nevytvářejí bez nového výslovného pokynu.

## Samokonzistentní kolektivní pokus PIC — 18. listopadu 2026

Na výslovný pokyn uživatele nahrazen předchozí harmonický společný posun
samokonzistentním 1D elektrostatickým particle-in-cell výpočtem. Každý ze
4096 elektronových makročástic má vlastní polohu a rychlost. Náboj se
lineárně přenáší (CIC) na 128 uzlů. Periodická diskrétní Poissonova rovnice
se řeší FFT; potenciál má nulový střed, E je jeho centrální záporná
derivace. Stejná CIC váha interpoluje pole k částicím. Posun je integrovaný
velocity-Verletovou metodou. Normalizace n0=e=me=eps0=omega_pe=1; ionty
tvoří nehybné homogenní pozadí. Žádná časová sinusovka ani síla úměrná
předem zadanému společnému posunu se nepoužívá.

Výchozí porucha je prostorová nepravidelná kombinace šesti módů s pevně
reprodukovatelnými fázemi, amplitudovým parametrem 1,2 a malým rozptylem
rychlostí 0,06. Uživatelem schválen dobře viditelný, ne extrémní počátek.
Vychýlit elektrony jednorázově připraví srovnávací jeden sinusový mód;
další pohyb není buzený. Vypnutí elektrického působení vede k balistickému
pohybu aktuálními rychlostmi. Vrací se jen 32 vybraných značek; všechny
makročástice se počítají. Svislé rozložení značek je grafické. Barvy pásů
odpovídají aktuální rho, šipky lokálnímu vypočtenému E. Graf měří projekci
na první původní prostorový mód, nikoli společné přikázané vychýlení.
Obecný částicový pokus, jeho pružné stěny a srážky zůstávají samostatné.

Ověření: prostorové reziduum Poissonovy rovnice <1e-12; náboj a nulový
střed E. Malá studená porucha (amplituda 0,2) dává periodu 6,285057 proti
2*pi = 6,283185, přibližně 0,03 procenta odchylky. Sítě 32/64/128 dávají
6,313539 / 6,290751 / 6,285057: chyba klesá se zjemněním. Max. relativní
odchylka energie v tomto testu přibližně 0,043 procenta. Testuje se také
půlení časového kroku, nulová porucha, nezávislý lokální zásah do jedné
částice a vypnutí pole. Rovnoměrné posunutí všech částic v periodickém
homogenním pozadí nevytvoří návratovou sílu. Výchozí nepravidelný pokus
po 120 normalizovaných jednotkách času zůstává konečný a má max. odchylku
energie přibližně 0,055 procenta. Tyto hodnoty jsou numerické kontroly
konkrétního omezeného modelu, nikoli validace reálného fúzního plazmatu.

Primární odborné podklady: MIT Hutchinson, kap. 5, s. 101–102 (malá
plazmová porucha a teoretická frekvence); WarpX 26.01, Electrostatic PIC
(Poissonovo pole z hustoty makročástic); ParticleInCell.jl, Tutorial:
Langmuir oscillations (periodický PIC ověřovací pokus). Odkazy přímo
ve společném výkladu; přesné předpoklady a normalizace doplněny. Canvasové
náhledy začátku a další fáze prohlédnuty, prohlížeč neotevřen. Bez pushe.

## Předání na jiný počítač — 18. listopadu 2026

Aktuální sestavení zahrnuje přepracovaný Divertor s parametrickou konstrukcí ITER,
SOL, čitelnými značkami a jemnou siločárou, rozvinutí magnetického povrchu,
interaktivní plazma a modul elektromagnetické vlny s pohybujícími se náboji.
Zahrnuje také sjednocený výklad, opravy celého okna a aktuální navigaci.
Podrobnosti fúze jsou v docs/fuze/iter-divertor-2026-11-18.md;
elektromagnetické vlny v docs/EM-VLNA.md. Omezení výukových modelů zůstávají
uvedená v jejich výkladu. Verze aplikace zůstává 1.0.

Úplné sestavení node tools/build-release.cjs, celá sada node tools/project/check.cjs,
kontrola nástrojů předání a příprava veřejného webu prošly. Windows sestavení
omezeně opakuje dočasně blokované zápisy souborů; toto opatření dědí i podprocesy.
Prohlížeč nebyl automaticky spuštěn; testy DOM/canvas a GPU geometrie nenahrazují
vizuální kontrolu skutečného WebGL ve všech prohlížečích.

Uživatel výslovně schválil push a následné soukromé předání. Balíček se vytváří
teprve po pushi; přesný commit, vzdálený stav a SHA-256 souborů obsahuje _handoff/.
Na novém počítači rozbalit ZIP do nové složky a spustit node tools/project/restore.cjs.
Soukromá literatura a malé modelové podklady patří pouze do tohoto ZIPu.
Přihlašovací údaje ani surový velký archiv modelů se nepřenášejí.

## Odloženo: kolektivita vznikající z částicového výpočtu — 18. listopadu 2026

Uživatel upozornil, že současné Kolektivní kmitání působí jako předem
naprogramovaná animace. Platná připomínka: CollectiveModel řeší přesně
odvozený harmonický posun a všem elektronům přiděluje tentýž posun;
nejde o emergentní výsledek samostatných částic a pole. Další krok je
navrhnout a ověřit samokonzistentní elektrostatický model (např. 1D PIC
s řešením Poissonovy rovnice), v němž návratová odezva vznikne z rozložení
náboje, bez předpisu společného harmonického pohybu. Současný režim nelze
prezentovat jako takový částicový důkaz. Uživatel práci výslovně odložil
na jindy, nyní model nepřepsán. V této navazující relaci proběhlo pouze
čtení současného modelu a testů. Žádný push ani nový předávací ZIP.

## Kolektivní elektronové kmitání — 18. listopadu 2026

V úvodu do plazmatu nová nabídka Pokus: Plyn a ionizace / Kolektivní
kmitání. Druhý režim je samostatný standardní model studené elektronové
tekutiny proti homogennímu pevnému iontovému pozadí podle Hutchinson,
MIT 22.611J (2003), kap. 5, s. 101–102, obr. 5.1, rovnice 5.47–5.50:
https://ocw.mit.edu/courses/22-611j-introduction-to-plasma-physics-i-fall-2003/75c75c5df51f8fba1b2a903fde937ddc_chap5.pdf

Gaussův zákon dává E = ne*e*xi/eps0, pohyb elektronů xi'' = -omega_pe²*xi.
Implementováno přesným krokem v normalizovaném čase omega_pe*t. Všechny
značky elektronové tekutiny mají společné vychýlení, ionty jsou pevné.
Barevné krajní pásy ukazují oddělený povrchový náboj, jantarové šipky
společné elektrické pole. Nekreslí se neodpovídající siločáry bodových
kuliček. Vypnutí vzájemného působení ruší pole: pohyb pokračuje aktuální
rychlostí. Vychýlit elektrony znovu připraví společný posun a nulovou
rychlost; jde o vnější zásah. Původní částicový stav se při návratu zachová.

Ovladače teploty, ionizace, počtu, srážek a B jsou v tomto režimu záměrně
neaktivní. Předpoklady: lineární malá porucha, studená elektronová tekutina,
nehybné ionty, bez srážek, B a tlumení. Nejde o Debyeovo stínění, šíření
vln nebo automatický důkaz plazmových podmínek původního částicového modelu.
Značky jsou výběrové body kontinua, nikoli skutečný krystal. Výklad a
zdrojové odkazy aktualizovány. B značky a popisek mají na pokyn uživatele
v tomto modulu grafitovou barvu #37434b, modrá je vyhrazena elektronům.

Testy ověřují analytickou periodu, konstantní normalizovanou energii,
společný posun, pevné ionty, znaménko pole, nulovou celkovou sumu nábojů,
vypnutí pole a skutečné přepnutí UI. Canvasové náhledy počáteční a opačné
fáze prohlédnuty bez otevření prohlížeče; skutečné HTML/WebGL tím neověřeno.

## Plynulost, znaménko záře a revize fyziky — 18. listopadu 2026

Původní lokální raster byl při pohybu opožděný za elektrony. Nahrazen
září kreslenou synchronně podle aktuální polohy každého náboje: elektron
modře, kladný iont červeně. Záře nyní značí náboj, nikoli kvantitativní
velikost E; odstraněna neplatná barevná škála velikosti. Siločáry dál
vycházejí ze součtu Coulombových polí, jejich šipky míří od kladného
náboje k zápornému. Worker počítá pouze siločáry, nikoli plošný raster.
Proředěno trasování pro menší prodlevu. Stopy zaznamenávají integrační
mezikroky, maximální krok snížen na 0,003 názorného času.

Fyzikální audit: Sahova rovnice odpovídá Entler–Kindl, rámeček 2.1,
s. 31; Lorentzova síla a její směr kap. 2.2, rámeček 2.3, s. 31–32.
Vlastní dynamika je výuková ilustrace: rovina, poměr hmotností 25:1,
zesílená a změkčená Coulombova interakce, kontaktní disky, ideální stěny,
umělé časování ionizace. Nelze ji vydávat za kvantitativní simulaci
vodíkového plazmatu, skutečných srážek ani Debyeova stínění. Kontakty
zachovávají kinetickou energii izolované dvojice; poziční korekce kontaktů
v souběžném elektrickém potenciálu nejsou důkazem zachování celé energie.
Stručné vymezení nově na začátku společného výkladu. Doplňkově ověřeno
Fitzpatrick, Collisions a Debye Shielding (odkazy již ve výkladu).
Test plazmatu prošel včetně aktuálních poloh záře, barev a směru E.

## Siločáry a lokální teplá škála — 18. listopadu 2026

Na pokyn uživatele odstraněna celoplošná modrá mapa plazmového úvodu.
Zůstávají siločáry a jemná barevná vrstva jen kolem volných nábojů;
plynule přechází od světlé jantarové do červené podle stejného výsledného
E a dosavadní normalizace. Škála a výklad aktualizovány. Prostor mimo
lokální okolí je průhledný; jde o grafické okno, nikoli omezení dosahu
síly nebo fyzikální model stínění. Síly, srážky a stěny zachovány.
Test ověřuje průhledné vzdálené pozadí, přítomnost lokální škály,
teplou paletu i zachování siločar; celý test plazmatu prošel.

## Viditelnost atomů a elektrické působení — 18. listopadu 2026

Neutrální obal se nad modrou mapou ztrácel: nový světlý podklad, jemně
fialový obal a dvojitý světlý/tmavší obrys zachovávají rozpoznatelnost.
Neutrální atom nadále není zdrojem E pole; kreslí se nad mapou.

Znaménka Coulombových sil ověřena jako správná. Po zvětšení prostoru
byl jejich vizuální účinek slabý vůči tepelnému pohybu; názorný koeficient
elektrického působení zvýšen z 0,055 na 0,55. Zesílení a modelové měřítko
uvedeny ve výkladu. Všechny náboje používají stejné měřítko, párové síly
zůstávají stejně velké a opačné. Test integrovaných drah ověřuje znatelné
odpuzování i přitažlivost původně klidné dvojice, součet hybností a vypnutí
elektrického působení. Celý test plazmatu prošel, včetně stability a stěn.

## Pružné stěny hřiště obnoveny — 18. listopadu 2026

Na výslovný pokyn uživatele částice opět uzavírají ideální pružné stěny.
Odraz zrcadlí přesah a obrací jen normálovou rychlost; nepoužívá se
návratový potenciál, který mohl dříve dodat energii. Ošetřen i vícenásobný
přesah a kontakt částic posunutých srážkovou korekcí. Zohledněn modelový
poloměr kontaktu. E a B zůstávají přes hranici a vyhasínají až v lemu.
Výklad opraven z otevřeného prostoru na ideální pružné stěny. Testy
potvrdily zachování rychlosti a udržení atomu i obou znamének náboje
po 10 000 krocích včetně B; ověřena i tečná složka rychlosti.

## Názvy předvoleb Divertoru — 18. listopadu 2026

Po ověření knihy Entler–Kindl, kap. 7.9 a 7.11–7.12, s. 154–159,
přejmenovány předvolby Uvnitř / Separatrix / K terčům na Uzavřené plochy /
Separatrix / Vrstva SOL. Výklad volby aktualizován. Hodnoty normalizovaného
toku, fyzika a předvolby samotné se nemění; jde o opravu terminologie.

## EM vlna: vyšší rozlišení — 18. listopadu 2026

Ostrost pláten nyní respektuje skutečné zvětšení modulu i DPR. GPU mapy
1024–3072 bodů na stranu; CPU mřížka zvýšena z 97 na 257 bodů a rastr
z 512 na 1024. Zvýšení platí také pro prostorovou vlnu a spodní graf.


## Uvolnění plochy a odebrání clonění — 18. listopadu 2026

Na pokyn uživatele odstraněna zdrojová citace z patičky plazmového úvodu;
úplná citace knihy zůstává ve Zdroje společného výkladu. Patička odstraněna
z rozložení, označení Verze 1.0 je malé v hlavičce. Uvolněná výška přechází
na scénu a graf. Odebrán i posuvník Clonění pole z okolí a jeho profil;
B je opět homogenní v celém prostoru. Zachovány indukce, zapnutí i obrácení
pole. Test plazmatu prošel včetně zachování rychlosti při změně B.

## Clonění z okolí a otevřený prostor — 18. listopadu 2026

Upřesnění uživatele: posuvník má pole zmenšovat ze všech stran směrem
ke středu, nikoli odsouvat pouze zleva. Nové Clonění pole z okolí
plynule zmenšuje středový obdélník s hladkým okrajem. Stejný profil
používá magnetická síla i značky. Jde o předepsanou názornou masku,
ne o materiálový magnetický štít; indukované E se nepočítá.

Umělá návratová síla zcela odstraněna, prostor je otevřený. Původní
vnitřní okrajový potenciál mohl po ionizaci dodat elektronu energii
a společně s B vyvolávat pohyb kolem okraje. Samotné B práci nekoná.
Nové částice ani vychýlení elektronů se neomezují na původní obdélník.
Částice mohou opustit záběr; začátek pokusu obnoví reset. Test potvrdil
průchod hranicí bez umělého zrychlení a konstantní rychlost izolovaného
náboje při průběžné změně masky B. Zachovány srážky a elektrické síly.

## Pole za hranicí a odstranění okrajového urychlení — 18. listopadu 2026

Magnetické značky nově pokračují do stejného vnějšího lemu jako E mapa;
jejich kryvost plynule slábne. Fyzikální B zůstává homogenní a elektrické
síly neoříznuté. Návratová síla přesunuta z vnitřní oblasti až za hranici
(začíná 0,6 názorné jednotky vně), aby nově vytvořený elektron nezískal
energii z původního vnitřního okrajového potenciálu. Test potvrzuje průchod
nominální hranicí beze změny rychlosti při vypnutých interakcích.
Uživatel navrhl posuvník pro odsouvání pole; čeká se na upřesnění druhu pole
a cílového jevu. Zatím neimplementován.

## Rychlé porovnání ionizace, větší hřiště a srážky — 18. listopadu 2026

Plocha hřiště zdvojnásobena při zachování poměru stran (oba rozměry krát
odmocnina ze dvou). Kamera zahrnuje celé hřiště s ochranným lemem.
Tlačítka Plyn / Částečná ionizace / Plná ionizace připraví cílovou ionizaci
okamžitě a zachovávají pole, kameru a pauzu; při méně než 12 atomech
připraví 24 atomů. Teplotní rozsah zjemněn na 0,15–1,2 eV po 0,001 eV.
Plynulá ionizace posuvníkem konverguje rychleji po dávkách podle rozdílu.
Volby nejsou označeny jako ostrá hranice vzniku plazmatu: kolektivní
odezvu může mít už částečně ionizovaný soubor. Samotné dva náboje ji
nedokazují; výklad tento rozdíl uvádí.

Nový výchozí přepínač Srážky částic: pružné klasické diskové kontakty
atomů, iontů a elektronů, s hmotnostně váženým impulsem a odstraněním
překryvu. Zachování hybnosti a kinetické energie izolovaného kontaktu
ověřeno testem. Nejde o skutečné účinné průřezy, srážkovou ionizaci ani
mikroskopický model Coulombových srážek; omezení uvedena v dialogu.
Srážky lze vypnout nezávisle na vzájemném elektrickém působení.

## EM vlna: světlá scéna a spodní rozložení — 18. listopadu 2026

Odstraněn řádek Virtuální laboratoř… z modulu. Scéna má světlé pozadí
a tmavé čitelné popisky. Opravena výška panelů, spodní rezerva map, oddělení
časové osy a poloha popisků náboje. Vodorovné otáčení prostorové vlny nyní
sleduje tažení myši. Přestavěna aktuální dodávka; EM a progressive testy prošly.


## Ochranný lem a čitelnější mapa — 18. listopadu 2026

Výchozí pohled plazmového úvodu a dvojklik nyní zahrnují ochranný lem:
měřítko počítá s 1,36násobkem rozměrů hřiště, takže celé vnější vytrácení
zůstává v obraze. Test ověřuje rezervu alespoň 16 procent na každé straně.
Mlhavost mapy snížena zvýšením kryvosti z 24 na 64 procent a rozlišení
z 144 na 384 bodů za pohybu; při pauze až 1024 bodů na šířku.
Měkká maska zůstává pouze za fyzikální hranicí. Kuličky a dynamika zachovány.
Test plazmatu prošel. Úpravy Divertoru požadované před tímto upřesněním
(SOL, jemnost řezu a zarovnání grafu proudů) jsou stále další otevřenou prací;
v této změně nebyly implementovány.

## Plynulá okrajová síla místo tvrdého odrazu — 18. listopadu 2026

Částice se na pokyn uživatele už neodrážejí okamžitou změnou znaménka
rychlosti. U okrajů působí hladká kubicky rostoucí názorná návratová síla,
integrovaná v obou půlkrocích. Zrušen tvrdý grafický ořez částic. Jde
o modelovou okrajovou podmínku, ne o skutečné elektromagnetické udržení;
uvedeno ve výkladu. Měkká oblast dovoluje malé přesahy, stabilita ověřena.
Výchozí zoom a dvojklik drží celé hřiště v maximálním vejitelném měřítku;
canvas nově zabírá celou šířku scény. Test ověřuje plynulé obrácení
rychlosti po malých krocích, bez okamžitého zrcadlení polohy a rychlosti.

## Měkký vnější okraj a samostatné siločáry — 18. listopadu 2026

Vytrácení elektrického pole přesunuto mimo fyzikální hřiště: uvnitř
nezeslabuje, za hranicí přechází do průhledna v šířce 16 procent rozměru.
Nové zaškrtávátko Siločáry elektrického pole skrývá čáry a šipky při
zachování mapy. Název ovladače změněn na Magnetická indukce podle uživatele.
Test plazmatu prošel včetně masky přesahující skutečné hranice.

## EM vlna: vznik ohybu a samostatné B — 18. listopadu 2026

Modul em06-vlna nyní používá retardované Liénardovo–Wiechertovo pole pohybujících
se nábojů. Výchozí pokus ukazuje přesun jednoho náboje z klidu do klidu, původní
a aktuální siločáry, příčinné čelo a odcházející poruchu. Přidány tři časové
předvolby, samostatná podepsaná mapa B a WebGL výpočet pole na pixel. Siločáry
se integrují přímo z pole. Doplněn výklad a nové numerické testy LW modelu.
Numerika, ovládání a KaTeX prošly; kontrolní CPU snímky prohlédnuty. Celé UI
a WebGL kompilace v prohlížeči nebyly ověřeny, nový prohlížeč se neotevíral.
Aktuální dodávka přestavěna; prošly testy EM, progressive načítání a společného
výkladu i audit veřejných souborů. Podrobnosti a omezení: docs/EM-VLNA.md. Bez push.

## Souvislá mapa a měkčí okraje plazmatu — 18. listopadu 2026

Podle snímku odstraněna lokální intenzitou řízená průhlednost mapy,
která vytvářela kolem nábojů oddělené kulové skvrny. Při přítomnosti
volných nábojů má mapa souvislé slabé pozadí, její celková kryvost je
24 procent. Bez volných nábojů zůstává mapa průhledná. Vytrácení celé
vrstvy je rozšířeno na pětinu rozměru hřiště s jemnými přechodovými
body. Směry, čáry a fyzikální výpočet zachovány. Test plazmatu prošel.

## Hřiště a vytrácení na jeho hranicích — 18. listopadu 2026

Zvětšen fyzikální prostor z 12 × 7,5 na 18 × 10 názorných jednotek,
nové částice se rozmísťují po celé ploše. Canvas získal boční i svislou
plochu. Opraven svislý počátek projekce při posunu: částice, magnetické
značky, ořez a hranice nyní sdílejí tutéž transformaci. Ostrý vnitřní
rámeček odstraněn. Celé elektrické pole včetně siločar vyhasíná u skutečných
stěn hřiště, ne podle viewportu; maska sleduje zoom a posun. Částice
i magnetické značky jsou oříznuté stejným hřištěm. Test plazmatu prošel,
včetně konkrétních souřadnic masky pro posunuté hranice. Bez prohlížeče.

## Neutrální atomy bez elektrického pole — 18. listopadu 2026

Na pokyn uživatele odstraněno názorné elektrické pole neutrálních atomů.
Do mapy ani siločar nevstupují; zdrojem jsou pouze volné ionty a elektrony.
Platí pro worker i synchronní fallback, upraven i společný výklad.
Test potvrzuje nulovou mapu a žádné siločáry neutrálního souboru.

## Zklidnění pole plazmatu — 18. listopadu 2026

Podle dalšího snímku proředěny svazky siločar podle počtu nábojů,
odstraněno dvojí trasování spojení z obou znamének, zeslabena mapa
i čáry a zmenšeny/rozestoupeny směrové hroty. Celá vrstva včetně
siločar mizí u všech okrajů přes průhlednost; kuličky zůstávají ostré.
Bez změny fyziky. Kontroly modelu, workeru, kamery a hladkosti prošly.

## EM vlna — technické mapy a siločáry, 18. listopadu 2026

Na připomínku uživatele přepracována hlavní scéna na dvě kvantitativní
mapy pole a vyzařovaného toku energie, s technickou pásmovou paletou,
číselnými legendami a pevnými lineárními/logaritmickými rozsahy. Vlevo
lze přepínat velikost E, podepsané Ez a velikost B. Elektrické siločáry
jsou skutečnou integrací okamžitého pole, s adaptivním krokem; alternativně
vektory nebo samotná mapa. Staré pomocné kružnice odstraněné.
Graf zmenšen, ovládání zhutněné, hlavní plochu dostaly mapy. Model zůstává
analytický bodový dipól; výsledky nejsou vydávány za řešení z Ansysu.

Přestavěny obě aktuální dodávky včetně lazy dokumentu. Cílené testy
fyziky, barevných stupnic, tečnosti siločar, ovladačů, KaTeXu, načítání
a auditu prošly. Canvas mapy prohlédnuté; celý prohlížeč neotevřen.
Podrobnosti docs/EM-VLNA.md. Bez commitu a pushe.


## Oprava siločar podle snímku uživatele — 18. listopadu 2026

V plazmovém úvodu odstraněna interpolace směru z hrubého rastru, která
vytvářela zalomené krátké úseky u neutrálních atomů. Siločáry nyní začínají
rovnoměrně kolem zdrojů a používají přímé vyhodnocení součtu polí a adaptivní
krok jako v reakcích. Záporné zdroje se integrují proti poli, orientace
zobrazené čáry zůstává správná. Mapa slábne s polem i u okrajů scény;
odstraněn ostrý ořez mapy podle obdélníku fyzikálního prostoru. Kuličky,
ovládání a dynamika zachovány. Test ověřuje i radiální hladkost všech
šestnácti siločar neutrálního atomu. Vizuálně v prohlížeči neověřeno.

## Pole a zoom v úvodu do plazmatu — 18. listopadu 2026

Podle posledního upřesnění uživatele zůstávají původní názorné kuličky;
renderer katalogu se do tohoto modulu nepřevádí. Hlášení o nefunkčním
zapínání pole uživatel odvolal, ovládání zůstalo zachováno.
Elektrické pole nyní používá barevnou mapu velikosti výsledného vektoru
a souvislé dvoubarevné siločáry podle výtvarného řešení fúzních reakcí.
Názorné pole neutrálního atomu vyhasíná v obalu, neovlivňuje dynamiku.
Mapa má viditelnou bezrozměrnou škálu; její význam je ve výkladu.
Výpočet obrazu běží v Blob workeru, při pauze se zjemní; kamera odmítá
opožděný výsledek ze starého pohledu. Bez workeru je synchronní fallback.

Scéna získala šířku a výšku z kompaktnějšího rozložení. Kolečko přibližuje
kolem kurzoru, tažení posouvá kameru, dvojklik vrací celek. Stav pokusu
se nemění. Canvas zohledňuje skutečné zvětšení modulu a hustotu pixelů,
takže obraz při zvětšení není jen natažen z původního rozlišení.
Fyzikální model ani vzhled kuliček se neměnily. Bez pushe a prohlížeče.

Komponentové sestavení i celé `node tools/project/check.cjs` prošly.
Test plazmatu nově skutečně spouští zdroj Blob workeru, kontroluje
odmítnutí starého pohledu, ukončení workeru, zvětšené pixelové rozlišení,
zoom kolem kurzoru, návrat pohledu, znaménka a vyrušení polí.
Při sestavení doplněna chybějící runtime závislost právě upraveného
modulu elektromagnetické vlny: `em-vlna/field-renderer.js` do seznamu
sestavení i veřejných souborů. Jeho fyzikální ani výtvarný kód se neměnil.

## Anténa a elektromagnetická vlna — 18. listopadu 2026

Nový modul em06-vlna v Elektřině a magnetismu (pořadí 12). Uživatel upřesnil
EM vlnu, nikoli AM modulaci. Dva propojené pohledy: anténa a retardované
okolní pole; otočný prostorový detail rovinné vlny. Sdílený čas, pevná sonda,
frekvence, plynulé vypnutí, vlnový balík, volitelné E/B a tok energie.
Samostatný dialog Ovládání a výklad vysvětluje i meze bodového dipólu.
Zdrojový MATLAB byl přečten jako námět, do veřejného výběru se nekopíruje.
Zdroje a metodika: docs/EM-VLNA.md. Bez numerického řešení reálné antény.

Úplné sestavení prošlo s existujícím lokálním atomickým zápisem velkého HTML;
integrátorův vstup byl následně obnoven bajtově z kopie před tímto sestavením.
Prošlo celé tools/project/check.cjs včetně nového fyzikálního testu,
Maxwellových rovnic, KaTeXu, ovladačů, lazy načítání a auditu. Poslední drobný
posun popisku náboje následně ověřen cíleným testem a komponentovým sestavením.
Obě aktuální dodávky a jejich lazy manifesty aktualizované. Canvas scény byly
zkontrolovány jako rastry; kompletní vzhled v prohlížeči nebyl ověřen a
prohlížeč nebyl spuštěn. Verze zůstává 1.0. Bez commitu a bez pushe.


## Plyn, ionizovaný plyn a plazma — 18. listopadu 2026

Nový úvodní modul `fu07-plazma`, zdroj `fusion/plasma`, výstup
`fuze-plazma/index.html`. Začíná jedním neutrálním atomem; posuvníky přidávají
atomy a mění teplotu. Podle upřesnění uživatele se neřeší mechanismus ohřevu,
jen dodání tepla a kontrast neutrálního a ionizovaného souboru. Volné náboje
vytvářejí společné E pole a lze zapnout/obrátit B pole. Samostatný pokus
vychýlí elektrony; graf sleduje oddělení středních poloh nábojů.

Podklad přímo ověřen v Entler–Kindl, kap. 2.1–2.2, s. 30–32; rámeček 2.1
ověřen i obrazově. Cílová ionizace vychází ze Sahovy rovnice při pevné hustotě
1e20 m^-3. Názorná dynamika má hmotnostní poměr 25:1, měkkou Coulombovu
interakci, rovinný pohyb a odrazné stěny; není to kvantitativní simulace
vodíkového plazmatu. Počet značek není hustota, žádný práh počtu částic
automaticky neoznačuje plazma. Omezení a zdroje jsou ve společném výkladu.

Test `tools/test-plasma.cjs` ověřuje ionizaci, neutralitu, směry gyrace,
zachování energie při magnetické rotaci, součet vnitřních sil, stabilitu
a skutečné obsluhy UI včetně pauzy, restartu a disposal bez prohlížeče.
Nový modul je součástí lazy sestavení a veřejného seznamu zdrojů/runtime.
Bez spuštění prohlížeče a bez pushe.

Ověření dokončeno: `node tools/build-particle-library.cjs` aktualizoval
aktuální web i lazy balíčky; celé `node tools/project/check.cjs` prošlo
včetně nového testu, 61 společných výkladů, navigace a veřejného auditu.
Vizuální kontrola v prohlížeči neprovedena. Plné `build-release.cjs`
opakovaně skončilo chybou zápisu UNKNOWN do generovaného souboru
`Web/interaktivni-elektricke-stroje.html`. Tento před relací nezměněný
soubor byl po neúspěšném sestavení vrácen přesně z místního LFS objektu
(SHA-256 6eae652d32ad30db62522a279362979d75de5834ff5299214e97c204359167b1).
Dodávka nového modulu byla dokončena komponentovým sestavením výše.

## Spodní mezera magnetického udržení — 18. listopadu 2026

Na pokyn uživatele zmenšena časová lišta z 37 na 24 logických pixelů
a odstup nad ní z 10 na 4. Odstup hlavičky zůstává 10; pracovní plocha
1360 × 820 i automatické měřítko jsou zachované. Scéna a levý graf získají
19 pixelů výšky v základním měřítku. V režimu uzavírání do toroidu je
lišta dál skrytá a její nová mezera se neuplatní. Výpočty ani ovládání
se nemění. Úprava je omezená na CSS modulu fu04-udrzeni.

Obě aktivní dodávky včetně lazy balíčku aktualizované komponentovým
sestavením build-particle-library.cjs; jejich CSS se shoduje se zdrojem.
Celé tools/project/check.cjs prošlo včetně škálování, udržení, helicity,
ovladačů, načítání a auditu. Prohlížeč nebyl spuštěn, jde o kontrolu zdrojů
a automatické testy, nikoli vizuální ověření. Bez pushe.

## Názorné polohování plazmatu — 18. listopadu 2026

Divertor nově začíná pokusem Nahoru / dolů (PF2 + PF5), druhá volba Dovnitř / ven používá PF3 + PF4. Každá řada má 17 statických řešení s předem pevnou kombinací proudů, bez zpětné vazby. Celkem 97 stavů. Skutečný posun osy: svisle −34,3 až +35,2 cm, radiálně −28,1 až +32,3 cm. Vedlejší posun se zachovává. Výchozí detail ukazuje zvětšené plazma; celý stroj a konstrukci lze zapnout. Obrácený směr vodorovného otáčení opraven. Výklad a řez rozlišují vnitřní/vnější terč jediného dolního divertoru. Geometrie je vlastní parametrická ilustrace, ne import STL. Test ověřuje monotónní směrový účinek i pevné proudové kombinace. Web je aktualizován lokálně; push nebyl požadován.


## Aktuální stav — Divertor a rozvinutá plocha, 18. listopadu 2026

Na pokyn uživatele je v Magnetickém udržení přidané malé tlačítko Rozvinout
plochu vpravo nahoře. Náhled používá stejnou siločáru jako prostorový pohled,
periodické úhlové souřadnice a vybraný povrch. Fyzika částice je zachovaná.

Samostatná karta Rovnováha tokamaku je odstraněná. Divertor nese krátký název,
obsahuje vlastní parametrickou ilustraci ITER se šesti PF a šesti CS podle
zveřejněných poloh/průřezů, prostorové TF cívky, komoru a terče. Staré ID
rovnováhy přesměruje na tentýž Divertor. Zdrojové cesty zůstávají zachované.

Nové ovládání: výběr jedné PF cívky a jejího proudu, vždy s ostatními proudy
pevnými; samostatný tlakový pokus. 63 statických forward GS rovnováh, bez
regulátoru polohy. Nejde o časovou stabilitu. Osm map: tlak plazmatu, B, BP,
BT, Jphi, magnetický tlak, lokální beta a normalizovaný tok. Stejná škála
v řezu a na prostorové ploše. Detaily numeriky, ověřené zdroje, rozlišení
sítě, omezení a licence viz docs/fuze/iter-divertor-2026-11-18.md.

Oficiální tiskové STL byly prohlédnuty jen jako reference. Nepřenášejí se
na veřejný web ani do Gitu. Web má vlastní kresbu. Podklady v tmp lze znovu
stáhnout; nepovažovat je za zdrojovou závislost sestavení.

Průběžně prošly testy 63 rovnováh, nezměněných ostatních proudů, tečnosti
siločar, osmi map, KaTeXu, ovladačů a rozvinuté plochy. Canvas výstupy byly
prohlédnuté; prohlížeč nebyl spuštěn. Push ani místní commit nebyl požadován.

Dokončeno: úplné node tools/build-release.cjs a node tools/project/check.cjs
prošly, včetně všech fyzikálních testů, lazy načítání a auditu veřejných
souborů. Obě aktivní dodávky obsahují stejné aktuální zdroje modulů.
Při sestavení byl použit dřívější lokální atomický zápis velkého HTML;
sledovaný integrovaný vstup byl následně obnoven z vlastní předbuildové
kopie (bajtově shodné s HEAD). Verze zůstává 1.0. Žádný push ani commit.

## Oprava načítání a využití plochy — 17. listopadu 2026

Helicita dříve načítala všech 18 datových souborů (284 MB); veřejný výběr
navíc neobsahoval části 15–17, takže načítání končilo chybou. Sestavení nyní
beze změny vzorků rozděluje původní bázi do 62 balíčků podle poloměru a režimu.
První helikální pokus načítá jen 5,4 MB, další balíčky až podle volby.
Plynulé přechody připraví potřebné poloměry před animací; nepočítají trajektorie.
Mapu odrazu připravuje přehrávač pouze pro zobrazovaný stav, cache má limit.
Test helicity ověřuje úplný veřejný výběr, shodu všech vzorků a opakování po chybě.

Odstraněn redundantní pruh „Reálnější zobrazení · vypočtené pole“ u principu AM;
přepínač vypočteného pole zůstává. Společný dialog přebírá i obdobné textové pruhy.
Oba řezy principu AM využívají celou zbývající výšku; starý limit výšky scény
a závislost na skrytém panelu výkladu byly odstraněny. Uživatel výslovně schválil
push a nový soukromý ZIP po kontrole. Přesný commit a stav odeslání uvádí
`_handoff/state.json` v novém balíčku.

## Přesun na jiný počítač — 17. listopadu 2026

Předávací ZIP: `HiFyziko-predani-2026-11-17-oprava-nacitani.zip`.
Uživatel výslovně schválil push po úspěšné kontrole. Větev main, origin
https://github.com/hifyziko/virtual-lab.git. Přesný commit, stav odeslání,
manifest a LFS objekty uvádí `_handoff/` uvnitř soukromého balíčku.

Hotovo: sjednocený dialog výkladu, magnetické udržení a helicita včetně
předpočítaných stavů, dva nové GS moduly rovnováhy/divertoru, velké indikátory
načítání a dřívější dnešní změny synchronního stroje. Neprobíhá další přepočet.
Plné sestavení a všechny funkční kontroly prošly; audit veřejných souborů
prošel samostatně mimo omezení sandboxu. Publikační výběr: 295 souborů,
přibližně 651 MiB, bez knih/PDF, privátních podkladů a přihlašovacích údajů.
Jediný veřejný zdroj nad 100 MiB je spravovaný přes Git LFS.

Na novém počítači rozbalit do nové složky, spustit
`node tools/project/restore.cjs`, přečíst pravidla a ověřit vzdálený stav.
Výuka funguje z přibaleného webu; další sestavení potřebuje Node.js 24 a Git LFS,
nikoli Python ani FreeGS. Ty jsou potřeba jen pro výslovně vyžádaný přepočet.
Další krok je uživatelská vizuální kontrola nových modulů; nejde o rekonstrukci
skutečného výboje ani o dynamický model stability plazmatu.

## Dva nové moduly rovnováhy a divertoru — 17. listopadu 2026

- Rozcestník: fu05-rovnovaha a fu06-divertor. Zdroj fusion/equilibrium,
  výstup fuze-rovnovaha/index.html a divertor.html. Sdílejí data i renderer.
- 27 skutečných volných GS rovnováh FreeGS 0.8.2, síť 129 × 129. Tři řady
  po devíti stavech: tlak 1–17 kPa, požadovaná výška −4,8 až +4,8 cm,
  změna protažení. Proud plazmatem 200 kA, vakuové RB_T = 0,89 T m.
  Vlastní výukové uspořádání šesti kruhových cívek, nikoli skutečný COMPASS-U.
  Proud cívek se hledá inverzně pro požadované izotokové body a dolní x-bod.
- Křivky jsou hladiny vypočteného toku. Pole plyne z derivací stejného toku
  a proudové funkce; tlak z profilu FreeGS. Obrazový přechod mezi stavy není
  vydáván za dynamiku plazmatu. Offline řešení neběží při sestavení ani v UI.
- Řez a otáčivý prostorový pohled, výběr kliknutím nebo posuvníkem,
  zvýrazněná plocha/siločára, oddělené plochy a separatrix, poloidální mapa,
  tlaková mapa, mapa B, křivka tlaku/B_P a graf proudů cívek. B modré,
  povrchy růžové, společná kvantitativní barevná škála. Kovové cívky používají
  existující confinement renderer. GPU fallback je canvas, bez nové knihovny.
- Divertor: Uvnitř / Separatrix / K terčům s plynulým pohybem posuvníku.
  Otevřené křivky vybíráme kolem hlavního plazmatu (nikoli kolem cívek).
  Končí v rovině terčů. Pohyblivé trojúhelníky označují B, nejsou částice.
- Výklad podle knihy Entler–Kindl, kap. 7.9 s. 154–156 a 7.11–7.12
  s. 158–160, vizuálně ověřeny obr. 7.16 a 7.18. Značení r_c, p_pl, I_psi.
  Inspirace: EPFL TCV a FreeGSNKE Pulse Design Tool; odkazy ve výkladu.
- Přepočet explicitně: tools/precompute-tokamak-equilibrium.py --write;
  závislosti tools/tokamak-requirements.txt. Lokálně instalovány v tmp,
  do Gitu/webu se knihovny, PDF ani pomocné výstupy nedodávají.
- Test tools/test-tokamak-equilibrium.cjs zahrnut do project/check.cjs.
  Relativní reziduum GS v jádře 0,117–0,134 %, kontrola toku a tečnosti B,
  reakce tlaku/polohy, 27 stavů, KaTeX, obě UI, reset a disposal.
  Canvasové snímky kontrolovány bez spuštění prohlížeče.
- Dokončeno plné sestavení a všechny funkční kontroly project/check.cjs.
  Závěrečný audit Git v sandboxu narazil na EPERM; stejný audit spuštěný
  samostatně s povoleným přístupem prošel (520 veřejných souborů, secretScan passed).
  Ověřena také 3D tečnost siločáry k oběma složkám B a dopady celé nabízené
  vrstvy SOL na skutečně vykreslené terče. Publikace ani push neprovedeny.


## Tišší zvuk pouze při rychlém otáčení — 17. listopadu 2026

Nejnovější pokyn uživatele nahrazuje předchozí popis zvuku níže:
zvuk zůstává výchozí zapnutý, ale ozývá se pouze v režimu Točit rychle
(autoSpeed 7). Ruční posun, pomalý a zatížený běh jsou tiché.
Také zkušební pulz je omezen na tento režim; přechod jinam, pauza či
skrytí stránky jej přeruší. Opožděné dokončení inicializace audia po
přepnutí režimu už nemůže spustit zbylý pulz.

Pro měkčí průlet lopatky je šum vyhlazený a filtrovaný dolní propustí,
tón sinusový, náběh pomalejší. Hlavní zesílení sníženo z 0,28 na 0,16.
Fyzikální model a průchody polí se nemění. Rozšířené zvukové i původní
modelové testy prošly. Plné sestavení aktualizováno a v obou dodaných
lazy lekcích ověřeno omezení režimu, filtr, tón i nižší zesílení.
Poslech v prohlížeči nebyl ověřen. Bez publikace a bez push.


## Výchozí zapnutý a výraznější zvuk polí — 17. listopadu 2026

Na výslovné upřesnění uživatele je zvuk synchronního principu výchozí
zapnutý (stav tlačítka i audio ovladače). AudioContext se podle pravidel
prohlížeče otevře až při prvním ovládání pohybu, např. Točit rychle,
posunu pole nebo spuštění pokusu. Nevyžaduje další zapnutí tlačítkem.
První aktivace a opětovné zapnutí přehrají zkušební pulz; zkouška může
doběhnout i v klidu, zatímco tlačítko pauzy a skrytí stránky ji přeruší.
Vypnutí uživatelem zůstává respektované, další ovládání je samo nezapne.

Pulz je delší (při běžném rychlém míjení přibližně půl sekundy), má delší
náběh a výraznější tělo místo krátkého šustnutí. Filtrovaný šum doplňuje
jemný klesající trojúhelníkový tón. Hlavní zesílení zvýšeno z 0,14 na
0,28, vrchol obálky z 0,32 na 0,7. Počet souběžných hlasů je nadále
omezený. Obě zvukové větve se při vypnutí a odstranění správně ukončí.
Při zablokované inicializaci lze zvuk zapnout znovu; nepodporovaný
prohlížeč zůstává bez zvuku a experiment pokračuje.

Rozšířený zvukový test ověřuje výchozí aktivaci gestem, zkušební pulz,
délku a zesílení obálky, druhou vrstvu, ztišení a odpojení oscilátorů.
Původní modelové testy a celková kontrola prošly. Plné sestavení provedeno;
z obou výsledných progressive payloadů sm01-princip výslovně ověřeno,
že obsahují výchozí zapnutý stav, novou syntézu a zkušební pulz.
Poslech v prohlížeči nebyl ověřen; jeho UI přístup byl dříve zamítnut.

Při celkové kontrole opraven i čtečkový test KaTeXu v rozpracovaném
test-confinement.cjs: atributy data-tex nyní dekóduje z HTML entit stejně
jako DOM. Souběžná platná formule s &gt; dříve způsobovala falešnou chybu
testu. Samotné výukové vztahy ani zobrazení se tím nemění; tento soubor
zůstává s ostatní rozpracovanou částí confinement mimo zdejší commit.


## Výklad magnetického udržení podle vlastní knihy — 17. listopadu 2026

Po hlášené chybě NET::ERR_CERT_AUTHORITY_INVALID na farside.ph.utexas.edu
odstraněno všech šest aktivních odkazů na tento server z výkladu udržení.
Fitzpatrickovy citace zachovány jako text. Přidán ověřený veřejný odkaz
MIT OCW, Introduction to Plasma Physics I (Fall 2006), kapitola 2,
Motion of Charged Particles in Fields. Zabezpečení se neobchází ani
nepřepíná na HTTP. Sestavení a kontrola fúzní navigace prošly.

Následná úprava podle uživatele: nová část je zkrácena na přímý bodový výklad
pro studenta (proč se částice odráží, magnetický moment, podmínka odrazu,
elektrické pole a čtení mapy). Odstraněno redakční vysvětlování vztahu ke knize;
citace zůstávají u zdrojů. V textu i tooltipu se používá banánová trajektorie.

Výklad v fusion/confinement/index.html vychází primárně z knihy Entler–Kindl,
Jaderná fúze a fúzní elektrárny, poskytnutý finální rukopis. Doplněny významy
značek, magnetický moment, kinetická energie a lambda = E_k / mu podle
kapitoly 7.6 a rámečku 7.7 (s. 150–151), podmínka odrazu a odvození vztahu
s počátečním úhlem. Rozlišuje se magnetický moment a permeabilita vakua.
Elektrické rozšíření je oddělené jako doplnění animace; uvedeny předpoklady,
rozdíl adiabatické meze a Lorentzovy trajektorie i omezení modelu.
Citace rozměrů COMPASS-U opravena na kap. 2.3.5, s. 48; helicita na rámeček
7.6, s. 149–150. Bibliografie uvádí dostupnost rukopisu a doplňující veřejné
univerzitní zdroje Fitzpatricka. Rukopis se do veřejné dodávky nepřidává.
Vše je ve stávajícím dialogu Ovládání a výklad, bez zásahu do velikosti grafů.


## Názorný zvuk míjení synchronních polí — 17. listopadu 2026

Princip synchronního stroje má volitelné tlačítko Zvuk míjení polí
(výchozí stav vypnutý). Web Audio vytvoří krátké filtrované šustnutí
s měkkou obálkou při průchodu relativního elektrického úhlu přes další
násobek pi; počet pólových dvojic odpovídá vybranému rotoru. Rytmus
sleduje relativní pohyb pole a rotoru, nikoli samotné mechanické otáčky.
V synchronním běhu a bez aktivního rotorového buzení je zvuk tichý;
permanentní magnety se posuzují jako stále přítomné rotorové pole.
Malé odchylky rychlostí pod prahem nespouštějí zvuk při dokmitávání.
Jde o názorné ozvučení, nikoli o model skutečného hluku stroje/turbíny.

Zvuk vzniká v prohlížeči až po výslovném zapnutí, bez zvukových souborů,
mikrofonu nebo sítě. Hlasitost a počet hlasů jsou omezené. Pauza a skrytí
stránky pulzy ztiší, odstranění modulu zavře AudioContext a odpojí uzly.
Nový pokus či změna typu přenastaví referenční fázi bez falešného pulzu.
Nedostupné Web Audio neblokuje experiment. Tlačítko má aria-pressed
a vysvětlení je ve společném výkladu. Model, síly ani čas se nemění.

Přidán test-princip-sound.cjs do veřejného výběru a standardní kontroly:
opt-in, směry průchodu, počet pólů, synchronismus, buzení, pauza, restart,
vypnutí, fallback a uvolnění audio zdrojů. Prošel tento test, původní
test-model i celé node tools/project/check.cjs. Provedeno plné sestavení
node tools/build-release.cjs; obě aktuální dodávky včetně progressive
payloadu sm01-princip obsahují zvuk. Prohlížeč se nespouštěl; poslech
v prohlížeči nebyl ověřen (dřívější přístup UI nástroj zamítl).


## Jednoznačné značení energie a magnetického momentu — 17. listopadu 2026

Podmínka odrazu s elektrickým polem používá E_{k,0} pro počáteční
kinetickou energii a mu_start pro počáteční magnetický moment.
Rámeček ji uvádí ekvivalentně jako B ≈ (E_{k,0}+e Ez z)/mu_start,
aby zůstala na jedné řádce s čitelným zlomkem. Výklad definuje
počáteční energii 1 keV a odlišuje moment od permeability vakua.
Značka mu0 ve vztahu pro vektorový potenciál cívek zůstává správně
permeabilitou vakua. Fyzika, data a rozměry grafu jsou beze změny.

## q přímo u volby plochy a čitelný zlomek — 17. listopadu 2026

U banánové ukázky je r/a a skutečné q nyní přímo ve výstupu posuvníku
Počáteční plocha. Při dekódování vybraného záznamu se q a příznak
uzavření odvozují z jeho u a r; nezávisí na převzatém popisku původní
plochy. Regresní test ověřuje skutečnou sekvenci pointerdown/input
pro vnitřní, původní i vnější plochu: jiné q, jiné body siločáry,
jinou trajektorii a shodu obou viditelných popisků. Pole zůstává pevné.
Hodnoty: r/a=0,19 → q≈1,591; r/a=0,64 → q=2; r/a=1 → q≈3,275.

Rovnice v rámečku používá dfrac, velikost 12 px a šířku 124 px.
Zůstává na jedné řádce, čitatel a jmenovatel již nejsou zmenšené
řádkovým stylem. Mění se pouze vodorovné rozdělení stávajícího bloku
odečtů; velikost grafu ani výška panelu se nemění.

## Kompaktní hlavička a kontrast siločar bariéry — 17. listopadu 2026

Coulombova bariéra má místní silnější CSS pravidla vůči společné
navigaci: jediný řádek hlavičky (44 px), nadpis 19 px bez zalamování,
tlačítka a návrat 32 px vysoké s písmem 13 px. Text názvu i dostupné
ovladače zůstávají celé. Pevná plocha modulu a automatické škálování
se nemění; menší hlavička ponechá více místa scéně.

Na výslovnou žádost uživatele změněna pouze zde barva siločar z jantarové
na teple bílou s tenkým tmavým lemem, včetně směrových trojúhelníků.
Dvojitý tah zachovává kontrast přes světlé i tmavé odstíny mapy pole.
Platí pro oba styly siločar, worker i synchronní záložní kreslení.
Původní kvantitativní barevná mapa, data siločar a fyzika se nemění;
sdílené barevné značení ostatních modulů zůstává stejné.

Test-fusion-controls a test-fusion-field-worker prošly (ovládání,
stabilní přizpůsobení, oba styly, zachování mapy a konečné siločáry).
Navigace, progressive a audit prošly. Obě aktuální dodávky sestaveny.
Vizuální kontrola nebyla provedena; předchozí přístup k otevřenému
prohlížeči nástroj zamítl a nový se podle pravidla projektu nespouští.


## Náhled rozměrů před načítáním — 17. 11. 2026

Od solenoidu k toroidu (režim bend): posuvníky major/minor při input
aktualizují geometrii a hodnoty bez přípravy atlasu či výpočtu pole.
Předchozí příprava se při začátku změny zruší, staré siločáry se odstraní.
Zjednodušený geometrický náhled zůstává aktivní po celou dobu tažení;
change po uvolnění spustí jedinou přípravu pro konečné rozměry.
Ostatní režimy zachovávají dosavadní chování. Test confinement prošel,
včetně nové regrese více input událostí bez výpočtu a jediného commit.


## Značka D a místní q — 17. listopadu 2026

Značka D+ je ukotvená do gyračního středu v helikálním/banánovém
přehrávání, v solenoidu a magnetickém zrcadle i v driftovém modulu
(včetně D jako porovnávané částice). Samotná částice a její dráha se
nemění; mimo platnou oblast gyrace zůstává popisek u částice.

Pro banán uživatel zvolil typické řešení: zachovat pevné pole se střihem,
tedy nevnucovat q=2 každému poloměru změnou poměru polí. Původní
r/a=0,64, q=2, úhel 70 stupňů zůstává výchozí ukázkou. Řádek uzavření
nově ukazuje skutečné místní q a rozlišuje uzavřenou siločáru od
zobrazeného neuzavřeného úseku. Siločára už v atlasech odpovídala
každé ploše; problém nebyl v cache, ale v neviditelném q a očekávání,
že musí být uzavřená všude. Banánový oběh gyračního středu je jiná
věc než uzavření magnetické siločáry.

## Velké načítání a jemnější volby — 17. listopadu 2026

Načítání fúzních atlasů je přesunuto z ovládání do překryvu hlavní
scény (hLoad a atlasStatus). Helikální atlas ukazuje skutečný počet
připravených částí; vlastní výpočet toroidu svůj průběh, ostatní stahování
neurčitý pruh. Chyba nabídne opakování. Sdílený loader modulů má větší
pruh i panel. Šest FEM prohlížečů včetně canvas fallbacků dostává stejný
překryv přes hlavní obrazy; stav zůstává řízen původním #status.
Při bufferování se čeká 200 ms, opakované zprávy časovač neodkládají.
Nový společný tools/scene-loading.js vkládá build-compact-delivery.cjs;
test-scene-loading ověřuje načtení, buffer, chybu, retry a disposal.

Rovnice odrazu je v rámečku na jedné řádce. Šipka v_parallel je
ukotvena do zaznamenaného gyračního středu, nikoli do polohy gyrace D+.
Úhel nyní nabízí deset voleb 35–80 stupňů po 5; počáteční plocha deset
poloměrů r/a=0,19–1 po 0,09. Všech 200 kombinací s E i bez E je offline
připraveno v atlasech 14–17 (po 50). Loader čeká na všech 18 částí.
Pevné pole, čas do skutečného oběhu/úniku i dvojitá rychlost zůstávají.

## Podmínka odrazu vedle odečtů — 17. listopadu 2026

Rovnice přesunuta do malého rámečku vpravo vedle stávajících tří
odečtů B, v_parallel, v_perp. Je absolutně umístěná v jejich bloku;
odečty mají vyhrazenou levou část a rámeček nepřidává žádnou výšku.
Zlomkový vztah je rozdělen do dvou řádků, s E se obdobně ukazuje
mu0 B ≈ K0+eEz(z−z0). Graf má původní nadpis, jeho kreslicí oblast
nemá žádný nový překryv. Svislá osa končí nejméně 8 px nad barevnou
legendou a už ji neprotíná.

## Vztah pod Resetem a rychlejší přehrávání — 17. listopadu 2026

Vztah pro odraz je přesunut přímo pod řádek Spustit/Reset, mimo graf.
Původní nadpis průmětu je opět viditelný. Při zobrazení vztahu se
nevyhrazuje původní 32px stavový řádek; vztah používá 24px, takže se
graf nezmenšuje a zbývající místo dostává jeho flex kontejner.
Přehrávání helicity/gyrující částice je zrychleno z 2 na 4 us fyzikálního
času za sekundu. Energie, atlasy, trajektorie i konec oběhu jsou stejné.

## Viditelná podmínka odrazu a celý oběh — 17. listopadu 2026

Mapa zachycené částice nově zobrazuje velikost B, nikoli gradient,
ve stejné šestibarevné škále jako ostatní mapy modulu. Pevné krajní
hodnoty v teslech jsou pod průmětem. Černá mez a šrafa dál značí
adiabatickou energetickou dostupnost. Vztah B_odraz ≈ B_start/sin²(alpha0)
je v absolutně umístěném popisku přes původní záhlaví grafu;
původní nadpis pouze visibility:hidden. Žádné změny velikosti canvasu,
měřítka, výšky grafu ani nová řádka. Při E se vztah přepíná na
K0+e Ez(z−z0)−mu0 B ≈ 0. Číselná mez B_odraz je v existujícím řádku panelu.

Atlas 14 má délku individuální pro každý z 50 pokusů. Offline příprava
integruje až 400 us a hledá návrat gyračního středu do počáteční
poloidální fáze (vnější průchod z=0 směrem nahoru, kladné v_parallel,
oba odrazy nebo celý průběžný oběh). Konec interpoluje mezi vzorky;
trajektorii nijak nenatahuje ani nespojuje úsečkou. Únik dostane skutečný
odlet dalších 24 us. Všech 50 stavů skončilo návratem nebo únikem,
žádný limitem. Celý prostorový návrat deuteronu se neslibuje kvůli gyraci
a toroidální precesi. Regenerované elektrické atlasy mají aktuální hash.

## Pevné popisky detailu gyrace — 17. listopadu 2026

Popisek zpomalení i r_L rozděleny na samostatný pevný sloupec názvu
a pravostranně zarovnanou hodnotu. Oba mají rezervovanou šířku i výšku,
nemění se jejich poloha podle počtu číslic. Číselné hodnoty používají
stále jedno desetinné místo a sazbu KaTeX, jednotky zůstávají u pravého
okraje. Jde jen o úpravu sazby; hodnoty ani přehrávání se nemění.

Test-confinement, navigace, progressive a audit prošly. Obě aktuální
dodávky sestaveny. Vizuální kontrola v prohlížeči neproběhla, předchozí
přístup byl nástrojem zamítnut. Úprava je součástí nadále netrackovaného
sdíleného confinement modulu, bez přibrání jeho ostatních částí do commitu.


## Čitelný detail gyrace otevřených geometrií — 17. listopadu 2026

U solenoidu a magnetického zrcadla má detail vlastní názornou fázi:
nejvýše 0,45 oběhu za sekundu přehrávání. Zpomalení je adaptivní podle
místní cyklotronní frekvence a vybrané rychlosti hlavní animace. Pomalý
skutečný oběh se nezrychluje. Násobek zpomalení se sází v detailu přes
KaTeX; nadpis uvádí Názorný detail gyrace. Krátký průsvitný barevný oblouk
ukazuje směr otáčení. Pauza zastavuje také detail, změna B v pauze nehýbe
jeho fází. Reset připraví fázi podle nového počátečního stavu.

Detail není okamžitou fází skutečné částice v hlavní scéně; je to výslovně
označená zpomalená ilustrace. Jeho hodnota Larmorova poloměru odpovídá
aktuálnímu fyzikálnímu stavu. Hlavní čas, integrace, rychlost částice
a její odrazy/únik se nemění. Výklad rozlišení obou časových měřítek uvádí.
Helikální pokus zůstává beze změny.

Test-confinement prošel pro oba otevřené pokusy, krajní B a rychlosti:
směr a horní mez úhlového posunu detailu, popisek zpomalení, pauza,
změna B v pauze a přesný nezměněný fyzikální čas hlavní animace.
Navigace, progressive a audit prošly; obě aktuální dodávky sestaveny.
Vizuální kontrola nebyla provedena (přístup do již otevřeného prohlížeče
byl v předchozím pokusu nástrojem zamítnut); nový se nespouštěl.
Confinement je stále sdílený rozpracovaný modul mimo index; samostatný
commit by přibral cizí práci, proto úprava zůstává ve zdrojích a sestavení.


## Gradient podél pole a volitelná počáteční plocha — 17. listopadu 2026

Ukázka Zachycená nyní dovoluje pět počátečních ploch r/a =
0,28 / 0,46 / 0,64 / 0,82 / 1 a pět úhlů rychlosti vůči B
40 / 50 / 60 / 70 / 80 stupňů. Pole je při změně plochy stejné,
q=2 platí jen pro původní r/a=0,64. Energie zůstává 1 keV.
Úhel nahrazuje v této ukázce ovladač složení pole a tlačítka q,
tedy nezmenšuje průmět. Počáteční plocha není vazba částice na povrch.

Atlas 14 obsahuje všech 50 kombinací včetně E=0 a Ez=-500 V/m;
dráhy, rychlosti, odrazy a únik jsou výsledkem stejné plné Borisovy
integrace. Všechny elektrické atlasy regenerované se shodným fingerprintem.
Na výchozí ploše 40 stupňů probíhá, 70 stupňů se odráží. Na okraji
může gyrace okamžitě opustit objem; zachováno zrychlené přehrání úniku.

Mapa zobrazuje podepsaný G_parallel = (B/B) dot grad |B| v T/m,
modrá pokles a červená růst v kladném směru siločáry. Pevná symetrická
škála platí pro všechny plochy a úhly. Tmavá mez a šrafa zachovávají
adiabatickou podmínku K_parallel=0 včetně elektrické práce.
Použitý analytický vztah G_parallel=B_theta*z/(r*R) ověřen směrovou
konečnou diferencí v obou polorovinách. Společná mřížka i všech 50 map
se připraví při načtení; přepínání a přehrávání pole nepočítá.
Výklad rozlišuje zrcadlovou sílu od gradientového driftu a vysvětluje,
proč samotná rychlost při pevném úhlu nemění čistě magnetickou mez.
Zdroj: Fitzpatrick, Trapped and Passing Particles (UT Austin).

## Mapa podmínky odrazu — 17. listopadu 2026

V poloidálním průmětu zachycené částice nahrazuje orientační modrou
polovinu mapa K_parallel/K0. Modrá je adiabaticky dostupná oblast,
šedá se šrafou nepřístupná; tmavá vrstevnice značí K_parallel = 0.
Zahrnuje práci předepsaného Ez: K0 + e Ez z − mu0 B, start z0=0.
Jde o přibližnou podmínku pro daný magnetický moment, nikoli stěnu
nebo přesnou předpověď celé Borisovy orbity. Výklad uvádí omezení,
čistě magnetickou mez Bstart/sin²(alpha0) i zdroj UT Austin.
Obě bitmapy se připraví při načtení atlasu, animace již nevyhodnocuje
pole ani kontury. Rozměry grafu a trajektorie se nemění.

## Sloučené ukázky a větší průmět — 17. listopadu 2026

Oběh a Plochy sloučeny do tlačítka Helikální: stejný pokus umožňuje
sledování oběhu i průzkum poloměru. Zůstávají tři kompaktní tlačítka
Drift, Helikální, Zachycená. Poslední ukázka se ve scéně nazývá
Magneticky zachycená částice; odborný pojem banánová orbita zůstává
ve výkladu. Menší svislé výplně tlačítek, mezery a jednorádkové nastavení
E uvolňují místo přímo flex grafu. Průmět si zachovává shodné metrické
měřítko os a prostor pro popisky, nic se nenatahuje anizotropně.

## Proč vzniká banánový odraz — 17. listopadu 2026

Banánová předvolba nyní čte předpočítanou místní indukci, obě složky
rychlosti a směr B přímo z Borisova výpočtu (detail v atlasu 14).
V existujících třech řádcích panelu se zobrazují B, v_parallel a v_perp,
bez rozšíření ovládání. Černá šipka u částice ukazuje její rychlost podél
pole; v odrazu se zkrátí a obrátí. První dva body odrazu jsou označené
v prostoru a při dosažení zvýrazněné. Vnitřní polovina poloidálního
průmětu má jemný modrý podklad jako označení strany silnějšího pole.
Nejde o kvantitativní barevnou mapu ani automatický překryvný výklad.

Výklad doplněn o přibližné zachování magnetického momentu, přerozdělení
rovnoběžné a kolmé energie a zrcadlovou sílu −mu dB/ds. S elektrickým
polem výslovně zahrnuje e E_parallel, nikoli tvrzení o konstantní kinetické
energii. Odrazy zůstávají výsledkem integrace, nikoli zásahu do rychlosti.
Nový test ověřuje změnu znaménka v_parallel, vyšší B a v_perp v odrazech,
zachování součtu energií bez E a skutečné matematické popisky. Záznamy
jsou znovu reprodukovatelně vygenerované aktuálním nástrojem.

Ukázky helicity jsou nyní čtyři přímo dostupná tlačítka v jediném kompaktním
řádku: Drift, Oběh, Plochy, Banán. Nahrazují popisek a rozbalovací nabídku,
tedy ovládání nezvyšují; plné názvy jsou v title, aktivní stav přes aria-pressed.
Plynulé přejezdy, elektrické pole a předpočítané trajektorie se nemění.

## Nezávislé elektrické pole a banánová orbita — 17. listopadu 2026

Přepínač předepsaného Ez=−500 V/m je nezávislý na magnetických složkách:
nemění u, plochu ani předvolbu a zůstává aktivní při přejezdech posuvníků.
Všechny kombinace mají předpočítané dráhy: helicity-data/7.js až 13.js,
3045 elektrických stavů se stejnými 21 poloměry a 145 poměry jako bez E.
Integrátor v tools/precompute-helicity-electric.cjs používá celé prostorové
B včetně poloidální složky a plnou elektrickou sílu, včetně případného
rovnoběžného zrychlení. Elektrické pole zůstává předepsané, ne samokonzistentní.
Ve všech stavech ověřena bilance K−e Ez z, relativní chyba <1e−9; nulové E
obnovuje původní magnetické dráhy i pro smíšené a čistě poloidální pole.

Nová předvolba Banánová orbita: geometrie COMPASS-U, r/a=0,64, q=2,
B0=1 T, energie 1 keV, počáteční úhel 70°. Tyto parametry jsou pevné;
ovladače magnetického poměru a plochy jsou v předvolbě neaktivní. E lze
nezávisle přepínat. Dva záznamy v helicity-data/14.js trvají 160 μs,
obsahují skutečné změny znaménka paralelní rychlosti a zůstávají uvnitř
objemu. Bez E jsou během záznamu dva odrazy, s E tři. Průmět zvýrazňuje
zelenou dráhu gyračního středu a dosažené body odrazu. Oranžová gyrace
a modrá siločára jsou zachovány. B0 a počáteční úhel jsou viditelné v panelu,
rozdíl vůči ostatním předvolbám je také výslovně ve výkladu.

Tvar obou orbit ověřen i offline vykreslením skutečných souřadnic
gyračního středu (tmp/banana-check.png, pomocný neveřejný soubor).
Testy ověřují atlasové hashe a bilanci, zachování nastavení při změně E,
elektrické pole během přechodů, banánovou předvolbu, odrazy, celý delší
záznam a návrat do ostatních pokusů. Nové atlasové soubory jsou v allowlistu;
načítají se až uvnitř helikálního modulu. Browser nebyl automaticky otevřen.

Přepínač elektrického pole už není blokovaný nenulovou poloidální složkou.
Zapnutí z helikální konfigurace plynule nastaví toroidální pokus, zachová
vybraný poloměr a poté použije předpočítanou dráhu s E. Požadavek zapnutí
se během přejezdu neztrácí. Ruční přidání poloidální složky nebo volba
helikální předvolby srovnávací E vypíná. Test zahrnuje zapnutí, celý přejezd
i vypnutí bez změny vybraného poloměru.

## Zklidnění kresby a velikosti E — 17. listopadu 2026

Elektrické pole je nyní znázorněno jedinou jantarovou směrovou šipkou
v otvoru toroidu a jednou mimo kružnici poloidálního průmětu. Nezakrývá
trajektorii, osy ani průřez. Homogenní pole působí v celém modelu, nikoli
jen v místě symbolu; velikost šipky není kvantitativní škála.
Předepsané Ez sníženo z −1500 na −500 V/m pro mírnější výukový účinek;
21 trajektorií znovu předpočítáno. Při B0=0,5 T je E/B0=1 km/s a rozdíl
potenciálů přes 2a=0,54 m je 270 V. Ani tato hodnota není odvozena ze
samokonzistentní separace náboje či měření konkrétního režimu COMPASS-U.
Výklad toto omezení výslovně uvádí. Energetické, UI a atlasové testy prošly;
kontrolují také jedinou šipku v každém pohledu a umístění mimo křivky.

## Předepsané elektrické pole a odlišení hranic — 17. listopadu 2026

V čistě toroidálním režimu přidán přepínač Započítat elektrické pole.
Používá homogenní statické Ez=−1,5 kV/m jako názornou aproximaci účinku
separace náboje, nikoli samokonzistentní výpočet plazmatu. Jantarové vektory
E jsou ve 3D i poloidálním průmětu a odpovídají poli v Lorentzově integraci.
Při přidání poloidální složky se srovnávací elektrický pokus vypne.
Změna přepínače resetuje částici. Další atlas helicity-data/7.js obsahuje
21 předpočítaných drah pro všechny volitelné poloměry; generuje ho
tools/precompute-helicity-electric.cjs. Základní magnetické atlasy nezměněny.
Kontrola nulového E dává identickou původní dráhu; celková energie
K−e Ez z je zachována s relativní odchylkou <1e−9. Gyrační střed odečítá
lokální E×B rychlost. Za okrajem zůstává toto předepsané pole zapnuté.

Hranice vybraných magnetických ploch v prostoru i průmětu jsou čárkované
antracitové, ostatní obrysy šedé, siločáry modré. Hrot svislé osy má odstup
nad kružnicí; vyhrazený prostor zůstává při animaci a změně plochy pevný.
Regresní kontroly zahrnují obě zobrazení E, přepínač, vypnutí při helikálním
poli, energetickou bilanci, atlas a zachování nulového-E řešení.

Popisek z [m] v poloidálním průmětu je nyní vystředěný přímo nad hrotem
svislé osy. Horní prostor je rezervovaný pro popisek a hrot, aby nekolidovaly
s kružnicí ani nadpisem; shodné pevné měřítko obou os zůstává zachováno.

## Stabilní čas a rychlý odlet — 17. listopadu 2026

Časový údaj má jednotné dvě desetinné pozice a pevný KaTeX prostor
pomocí hphantom/mathllap, takže ani změna počtu číslic nepohybuje značkou
t, desetinnou pozicí či jednotkou. Platí napříč režimy udržení.
Helikální přehrávání po prvním překročení plazmatického profilu plynule
zrychlí z běžné rychlosti až na osminásobek, po stejné předpočítané dráze.
Zrychlení je uvedeno ve stavu a výkladu; čas ukazuje odpovídající fyzikální
čas. Konec uloženého záznamu se neprodlužuje ani nenahrazuje přímkou.
Regresní kontroly pokrývají číselný formát i zrychlení a reset.

Číselná hodnota Ip je na pokyn uživatele pouze v levém panelu. Ve scéně
zůstává KaTeX značka Ip a šipka s velikostí závislou na proudu.

## Opačná strana řezu a odstupy os — 17. listopadu 2026

Na další pokyn uživatele je šrafovaný prostorový průřez na opačné,
pravé straně pohledu (při řezu pravá hrana). Popisek R−R0 je pod kružnicí,
z vpravo od horního hrotu s dostatečným odstupem od vnějšího obrysu.
Pevné měřítko a maximální velikost kružnice se nemění. Regresní test
ověřuje odstup obdélníků obou popisků od vnější kružnice a stranu průřezu
s řezem i bez něj.

## Čisté poloidální pole a oprava matematických popisků — 17. listopadu 2026

Čistě poloidální režim už nekreslí dvanáct dvojic překrývajících se
kružnic: zachovává vybranou siločáru a pět dalších rovin, vnější pole
naznačuje jedinou smyčkou. Šrafovaný průřez je na levé straně pohledu;
u řezu vybírá levou hranu. Poloidální graf nemá číselné značky, pouze
výrazné tmavé osy se šipkami a KaTeX názvy/jednotkami; pevné izotropní
měřítko zachováno. Poloha popisků nyní zahrnuje odsazení grafu pod nadpisem.

Opraveny ztracené zpětné lomítka v dynamických textech Ip, approx, mathrm
a jednotkách os. Tyto řetězce používají String.raw. Regrese nově kontroluje
skutečné předané řetězce včetně příkazů, ne pouze syntaktické přijetí KaTeXem
(zkomolené příkazy dříve prošly jako běžná matematická písmena). Test nového
controlleru i integrační test app.js prošly. Fyzika ani atlas se nemění.

## Průřez plochami, proud a stabilní ovládání — 17. listopadu 2026

Popisky uzavření a počtů oběhů mají rezervovanou výšku; neaktivní údaj
oběhů používá visibility:hidden, takže posuvník ani tlačítka neposkakují.
Na jedné straně prostorové scény je při zapnutých plochách slabě šrafovaný
poloidální průřez s pěti vnořenými obrysy a modře zvýrazněným vybraným
poloměrem. Při řezu sleduje jeho hranu. Nevrací se kružnice kolem celého
toroidu. Velikost šipky Ip roste podle odmocniny amplitudy proudu, v nule
zmizí a popisek uvádí skutečnou modelovou velikost v kA.

Poloidální průmět využívá největší izotropní měřítko dostupného panelu
pro pevný vnější poloměr a. Výběr plochy, čas ani únik částice ho nemění;
pouze změna rozměru panelu přizpůsobí kresbu. Osy mají jednotky a číselné
značky. Stopu i značku částice řídí stejná interpolace. Pokračování mimo
vyznačený objem zůstává fyzikální Lorentzovou trajektorií v nenulovém poli,
nikoli uměle přímým odletem či připoutáním k magnetické ploše.
Testy kontrolují stálý řádek, jedinou rovinu rastru, růst proudové šipky,
pevné maximální měřítko grafu a integraci nového controlleru s app.js.

## Hladká trajektorie D⁺ a kontrola driftů — 17. listopadu 2026

Příčinou kostrbaté stopy bylo vynechávání dvou ze tří starších vzorků
gyrace v rendereru. Nově se používají všechny uložené body a kubická
Hermitova interpolace s derivacemi z uložených vzorků. Stejná interpolace
řídí značku částice i konec její stopy; žádná část dráhy se nenarovnává
ani nepřilepuje k siločáře. Přehrávání zpomaleno z 8 na 2 μs/s. Model
a předpočítané atlasy beze změny; nevzniká výpočet pole při přehrávání.

Test porovnává hladkou dráhu q=2 s dvojnásobně hustým Borisovým záznamem
(odchylka <0,25 mm), kontroluje všechny segmenty i konec stopy. Nezávislý
adiabatický odhad součtu gradientového driftu a driftu zakřivení pro čistě
toroidální pole dává 3,93 km/s, Borisův gyrační střed přibližně 3,96 km/s.
Oba magnetické drifty tedy vznikají správně integrací Lorentzovy rovnice.
Start na vnější ploše překračuje vyznačený objem už přibližně za 0,68 μs;
nejde o simulaci kontaktu s materiálovou stěnou. Předvolba driftu startuje
uvnitř. Výklad uvádí, že E×B a polarizační drift zde nejsou (E=0), stejně
jako srážky, turbulence a kolektivní transport. Zdroj: Fitzpatrick,
UT Austin, https://farside.ph.utexas.edu/teaching/plasma/lectures1/node19.html.

## Čitelnost helikální siločáry — 17. listopadu 2026

Vybraná siločára se kreslí celá i při řezu magnetickou plochou, modrým
tahem 2,6 px s jemným světlým oddělením od podkladu. Samostatná Canvas
vrstva řeší také omezení WebGL čar na jeden pixel. Směrové značky ani
počátek uzavřeného oběhu se řezem neskryjí. Pomocné soustředné prostorové
kružnice odstraněny; hrany řezu mají slabou neutrální barvu. Výchozí
zobrazená plocha je nejvyšší povolený poloměr r/a=1. Připravené částicové
pokusy zachovávají své ověřené počáteční podmínky a plynulý přejezd.
Fyzikální model ani předpočítaná data se nemění. Test ověřuje všech 769
bodů celé vybrané siločáry shodně s řezem i bez něj a spojení uzavřeného
oběhu bez mezery; obecný poměr se uměle neuzavírá.

## Helikální pole — připravené pokusy a plynulé ovládání, 17. listopadu 2026

Poslední režim magnetického udržení má tři předvolby: toroidální drift a únik,
helikální oběh q=2 a průzkum ploch q=3. Přepnutí přesune ovladače plynule
za 1,1 s; částice se zastaví a ruční zásah přejezd přeruší. Jeden posuvník
mění poměr toroidální/poloidální složky, druhý vybírá plochu bez změny pole.
Přichycení a přímá tlačítka q=1,3/2,2,3 nastavují skutečné uzavřené oběhy.
Řez, směrové značky, šipka konvenčního proudu, D⁺ a gyrační střed zůstávají.
Vybraná plocha je matně růžová, okolní plochy jsou šedé obrysové kontury.

Geometrie COMPASS-U R0=0,89 m, a=0,27 m je kruhová aproximace. Pevné
výukové B0=0,5 T, energie 1000 eV a počáteční úhel 30° nejsou parametry
skutečného výboje. Divergence-free pole má profil f(s)=2s-s³ uvnitř a 1/s
vně; proudový profil se při výběru plochy nemění. Toroidální proud má
správnou orientaci vůči poloidálnímu poli. Racionální q se označuje jako
rezonanční plocha, nikoli důkaz stability. Výklad rozlišuje q(r), q(a), q95
a konečnou částicovou orbitu; graf je poloidální průmět, ne Poincarého mapa.
Literatura: kniha Entler–Kindl, rámeček 7.6; CEA/IRFM Magnetic confinement;
Kikuchi, Energies 2010, 3, 1741. MHD rovnováha ani nestability se neřeší.

Nové helicity-model.js a tools/precompute-helicity.cjs připravují 3045 stavů
(21 poloměrů, společná množina 145 poměrů). Sedm helicity-data/*.js se načte
až při vstupu do helikálního režimu, s průběhem a opakováním při chybě.
Pohyb posuvníků ani přehrávání pak neintegrují pole. Borisův záznam trvá
76,8 μs, krok 40 ns se 64 podkroky; souřadnice mají kvantizaci <0,1 mm.
Po úniku se trajektorie dál přehrává do konce záznamu; automatický reset není.
tools/test-helicity.cjs ověřuje curl(A), nulovou divergenci, tečny siločar,
počty oběhů, energii, konvergenci kroku, všechna data a ovládání včetně
přerušení přejezdu a přehrávání bez výpočtu pole. Je zapojen do project/check.
Nové zdroje a veřejná data jsou výslovně v allowlistu; knihy zůstávají soukromé.
Prohlížeč se automaticky neotevírá; skutečný vzhled WebGL je třeba posoudit
v otevřené aplikaci. Neproveden commit ani push.

Sestavení tools/build-release.cjs dokončeno; následná jazyková korektura
promítnuta build-particle-library.cjs do obou aktuálních dodávek. Všechny
funkční testy v tools/project/check.cjs prošly včetně skutečné přípravy
vlastního atlasu; samostatný integrační smoke test spustil nový controller
přímo s app.js. Závěrečný audit ve společném příkazu narazil na sandboxový
spawnSync git EPERM; samostatně s povolením prošel. Navigační test nyní
odlišuje externí HTTPS zdroje od místních souborových závislostí.

## Prostorové zakrývání vinutí a toru — 17. listopadu 2026

Opravena chyba materiálu ohýbaných cívek: bendBand používal alpha=0,9,
takže měděný batch byl transparentní a nezapisoval hloubku. Plášť a
vinutí se proto neskládaly jako skutečné prostorové přední/zadní části.
Bendy nyní vytvářejí neprůhledné měděné plochy i v záložním Canvasu.
GPU renderer navíc všechny měděné materiály vždy vykresluje neprůhledně,
s opacity=1, depthTest=true a depthWrite=true, i pokud by starší volající
předal nižší alpha. Průhledný plášť má depthTest=true a respektuje přední
vinutí; zadní měď může být dál vidět skrz průhledný plášť. Nejde o
vynucení kreslení všech cívek přes torus; rozhoduje skutečná hloubka.
Model pole, geometrie závitů, směrové značky a fade se nemění.

Test-confinement prošel včetně skutečných Three materiálů pro měď
a plášť a jejich nastavení v uzavřené ohýbané scéně. Navigace, progressive
a audit prošly. Obě aktuální dodávky aktualizovány. Pokus o vizuální
kontrolu již otevřeného Chrome byl nástrojem Computer Use zamítnut
(Computer Use is not allowed on this app by policy). Nový prohlížeč se
nespouštěl; vizuální potvrzení překryvů proto zatím chybí. Změny jsou
ve stále rozpracovaném, dosud netrackovaném confinement modulu; nebyl
vytvořen samostatný commit, který by přibral jeho cizí rozpracované části.


## Fade směrových značek při uzavření — 17. listopadu 2026

Trojúhelníčky při dosažení úplného uzavření toroidu plynule mizí
(fade-out 1200 ms); při opětovném rozpojování se plynule vracejí
(fade-in 700 ms). Přechody používají smoothstep a při obrácení směru
navazují na právě vykreslenou průhlednost. Ostatní geometrie zůstávají
beze změny. Fade neovlivňuje průhlednost siločar ani povrchu, model pole
nebo částici. Po úplném zmizení se neměnná scéna již nepřekresluje
kvůli neviditelným značkám. Statický obraz GPU se během fade nemění.

Test-confinement prošel pro oba modely pole včetně obou přechodů,
obrácení během fade a cache hotového obrazu. Navigace, progressive
a audit prošly. Obě aktuální dodávky aktualizovány. Zdrojový confinement
je stále součástí souběžně rozpracovaného nového modulu; samostatný
commit by zahrnul i jeho ostatní nové soubory, proto se zde nevytváří.
Prohlížeč se automaticky nespouštěl.


## Pohyblivé směrové značky při ohýbání — 17. listopadu 2026

V pokusu Od solenoidu k toroidu přidány stejné pohyblivé vyplněné
trojúhelníčky jako v otevřených geometriích. Používají stávající flowHeads
a obloukovou délku vypočtených siločar, ve směru jejich trasování.
Fungují pro ideální pole i pole konečných cívek v přímém, částečně
ohnutém i uzavřeném stavu. Vypnutí siločar je skryje. Pohyb značek
nepředstavuje rychlost částic; výklad již netvrdí, že zde značky nejsou.

Animace překresluje pohyblivou vrstvu také při neměnné geometrii bend,
ale zachovává cache statického obrazu GPU, geometrii a připravené atlasové
siločáry. Neprovádí nové trasování ani nepouští částici v tomto pokusu.
Test-confinement ověřil pohyb při nezměněné scéně pro oba modely a tři
polohy ohnutí, nezměněný počet statických GPU renderů, nulové nové
trasování, skrytí značek se siločarami a nezměněný čas částice.
Navigace, progressive a audit prošly. Obě aktuální dodávky sestaveny.
Prohlížeč se automaticky nespouštěl; vizuální kontrola zatím neproběhla.

Poznámka ke sdílenému stromu: confinement a jeho test jsou nyní součástí
další rozpracované nové dodávky a dosud nejsou trackované. Tato úprava
je proto zachována ve zdrojích a sestavení, bez samostatného commitu,
který by musel přibrat celý cizí rozpracovaný modul.


## Ověření helicity a interpretace poměrů (17. listopadu 2026)

Podklad pro plánovanou úpravu helikálního pokusu; nová interakce ještě není implementována. Zadání: jediný tokamak, plynulý poměr od čistě toroidálního po čistě poloidální pole, výběr magnetické plochy, zachovaný řez a skutečný deuteron D⁺. Používat terminologii knihy Entler–Kindl, kap. 7.5 / rámeček 7.6, s. 149–150, a kap. 7.6 o banánových trajektoriích.

- Kniha: q je počet toroidálních oběhů na poloidální oběh; vztah q ≈ r*BT/(R*BP) je kruhová aproximace. Mez q(a)>1 uvedená v knize nesmí být prezentována jako postačující podmínka stability. Rozlišovat q konkrétní plochy, q(0), q(a) a q95; zejména q95 není q všude v objemu.
- CEA/IRFM: čistě toroidální pole má driftové ztráty; poloidální složka vede k helikálním drahám na magnetických plochách. Racionální q znamená uzavření siločáry, nikoli automatickou stabilitu. https://irfm.cea.fr/en/physics-of-fusion/magnetic-confinement/
- JET R(99)13 (indexovaný text části o bezpečnostním faktoru): pro q=m/n návrat po m toroidálních a n poloidálních obězích. Nízké řády jsou rezonančně významné. Lokální sklon není globální magnetická helicita. https://scipub.euro-fusion.org/wp-content/uploads/2014/11/JETR99013.pdf
- Kikuchi, JAEA, Energies 3 (2010), DOI 10.3390/en3111741, oddíly 3.2–3.4 a 5: stabilita závisí také na profilu proudu, tlaku a magnetickém střihu. Významné rezonance zahrnují 2/1 a 3/2. Existují různé provozní scénáře; neexistuje univerzálně nejlepší r/a nebo univerzální poměr BT/BP. https://www.mdpi.com/1996-1073/3/11/1741
- ITER-FEAT Outline Design Report (IAEA, 2000, indexovaný odstavec o omezeních MHD): q95 kolem 3 je kompromis konkrétního referenčního scénáře, ne obecná záruka stability. https://www-pub.iaea.org/MTCD/Publications/PDF/ITER-EDA-DS-20.pdf

Důsledky pro modul: přichycení pouze k vybraným nízkým racionálním q (např. 1, 3/2, 2, 3), označeným jako uzavření/rezonance, nikoli zelené optimum. Ostatní iracionální q neoznačovat automaticky jako bezpečná. Podmínky provozu uvádět u konkrétního profilu a geometrie; samotná kresba siločar ani Borisova dráha jedné částice neřeší MHD stabilitu. Čistě poloidální konec je názorný mezní stav, ne doporučený tokamakový režim. Výběr r/a musí pouze vzorkovat pevné pole/profil proudu (současné přepočítávání koeficientu podle vybrané plochy je nutné při nové úpravě odstranit). Nevyvozovat výhodný poměr COMPASS-U pouze z jeho rozměrů. V řezu rozlišit značku vedenou po siločáře a skutečný deuteron s konečným Larmorovým poloměrem a drifty.


## Předpočítané zavírání toroidu (17. listopadu 2026)

- Schválená změna: pole cívek používá celou sadu 201 hotových stavů (krok uzavření 0,005), ne přepočet po puštění posuvníku. Ukládá přesné trasované siločáry, radiální profil a mapu uzavřeného toroidu ve Float32. Žádná interpolace mezi různě topologickými křivkami. Test porovnává polohy a profil s původním solverem.
- Předvolby COMPASS-U, ITER, JET, SPARC a původní poměr 0,65/0,18 mají generovaná data v confinement/atlases/. Generátor tools/precompute-confinement.cjs se spouští výslovně, nikoli při běžném sestavení. Potřebné kompaktní numerické báze jsou výslovně v sourceFiles/webFiles. Každá má asi 26 MiB binárních hodnot, v samostatném Base64 JS kvůli offline file:// načtení; hlavní rozcestník ani vložený modul je neobsahují. Načte se pouze zvolená geometrie. Paměťová cache drží dvě sady a tři rozbalené snímky.
- Vlastní rozměry připraví všech 201 stavů jednou ve workeru s průběhem. Po dobu přípravy neaktivní pouze posuvník uzavření; ostatní volby umožňují přepnutí/zrušení. Změna indukce pouze násobí hodnoty, shodný poměr a/R0 používá stejnou bázi s přesným škálováním délek. Posuvník hotové animace již nevolá výpočet pole.
- Výchozí rozměry COMPASS-U: R0=0,89 m, a=0,27 m; výchozí model Pole cívek. Solenoid a zavírání nadále oddělené. Pohyblivé trojúhelníčky v zavírání zůstávají vypnuté; možnost Směr pole zatím jen návrh v reakci na dotaz uživatele.
- Odstraněn řádek HiFyziko / Virtuální laboratoř / Verze 1.0 ze spodní části tohoto modulu; flex layout přiděluje uvolněné místo scéně a grafu. Označení aplikace jinde zůstává 1.0.
- Ověření: test-confinement, test-confinement-atlas (všech pět sad, načítání, cache, škálování), fusion-navigation, progressive. Samostatně prošel i test-confinement-custom: přesný zdroj browser workeru spuštěný v samostatném Node workeru, všech 201 vlastních stavů, průběh, přenos bufferu a kontrola profilu. Skutečný prohlížeč nebyl automaticky otevřen.


- Výkon pole cívek: skalární superpozice odstraňuje dočasná vektorová pole uvnitř smyčky závitů. Kontrola 60 bodů pole i potenciálu proti původnímu výpočtu s odchylkou pod 1e-12. Místní Node benchmark bendData pro uzavření 0,5/1: původně 1004/901 ms, nově 224/182 ms (nejde o měření FPS prohlížeče). Worker nyní jako soběstačný Blob včetně modelu, bez importScripts při načítání aplikace; použitelný také z file://, kde externí worker mohl selhat. Samostatný field-worker.js zachován. Regrese provádí výpočet z přesného zdroje Blob workeru. Při návratu do cache se ruší čekající zastaralý požadavek.

- Ohýbání: zapnutí cívek přepíná na skutečné pole cívek, vypnutí na ideální pole; výběr modelu synchronizuje viditelnost cívek obousměrně. U ostatních pokusů zůstává přepínač cívek pouze zobrazením.

- Od solenoidu k toroidu: při vstupu do pokusu jsou siločáry vždy zapnuté (i pokud byly vypnuté v předchozím pokusu). Ideální siločáry se zobrazí ihned i během přípravy mapy/profilu workerem; vypnuté zůstávají pouze pohyblivé trojúhelníčky.

- Toroid (17. 11. 2026): přepínač Ideální pole / Pole cívek v pokusu ohýbání, výchozí ideální. Analytické spojité pole B0/(1+k*x), po uzavření B0*R0/R; otevřený ideální model platí lokálně uvnitř trubice a nepopisuje rozptyl konců. Konečné cívky zůstávají volitelné. Test curl(A), zákona zakřivení a absence azimutálního zvlnění.
- Worker předpočítá výchozí přímé/uzavřené geometrie obou modelů při načtení (pokud jsou workery podporované); další stavy na požádání. Ukládá normalizované siločáry, profil i vrcholové hodnoty mapy, nejvýše 12 stavů v každé cache. B pouze škáluje data. Žádný předstíraný předvýpočet všech kombinací posuvníků.
- V ohýbání/toroidu odstraněné pohyblivé směrové značky; nepřekresluje se nezměněná scéna. Zrcadlo a solenoid je zachovávají. Tlačítko Nový výstřel přejmenované na Reset.
- Rozlišení obou canvas rendererů zohledňuje skutečné CSS zvětšení modulu a DPR (limit 4). Odstraněn CSS filtr scény, jemnější sítě všech magnetických ploch (uzavřená mapa 192 × 64, helikální plochy 160 × 64). Barvy mapy z hodnot ve vrcholech, ne z průměrů buněk; fyzikální zvlnění pole cívek zůstává skutečné. Skutečný GPU obraz v prohlížeči se automaticky neotevíral.


- Úprava zrcadla/solenoidu (17. 11. 2026): magnetické plochy bez lesku a s jemnější průsvitností (matný neosvětlený materiál, alpha 0,055 při výchozím ovladači). Směrové trojúhelníčky nyní na všech siločarách; zrcadlené dvojice mají společnou fázi, takže značky nechybějí na spodní polovině. Toroidální plášť a kvantitativní mapa zachovány. Regrese kontroluje značky na každé křivce a matné plochy.

## Magnetické udržení — hladká grafika a terminologie knihy (17. listopadu 2026)

- Nový renderer.js používá stávající lokální Three.js: sdílené vrcholy, hladké normály, šedý poloprůhledný plášť při zavírání, jemně růžový po uzavření, nasvícená měděná vinutí a kovové objímky. Model fyziky zůstává beze změny. Při nedostupném WebGL zůstává Canvas fallback.
- Statická scéna se uchovává mezi snímky; GPU vykresluje dávky geometrií místo každého úseku zvlášť. Výpočet 24 siločar ohýbaného pole běží ve field-worker.js, kde prostředí dovoluje Worker; při chybě se použije synchronní výpočet. Profil zrcadla je cachovaný. Nejde o změřený příslib konkrétního FPS.
- Hustší ostré siločáry a pohyblivé trojúhelníčky bez dříku; rychlost značek jen ilustruje směr pole. Samostatné složky lze stále zobrazit, při skládání s výslednicí zeslábnou. Opravené znaménko vodorovného tažení kamery.
- Kvantitativní mapa až po úplném uzavření, Rainbow podle ANSYS (modrá–azurová–zelená–žlutá–oranžová–červená). Mapa bez osvětlení, aby lesk neměnil její význam; legenda v teslech. Barva magnetických siločar zůstává #356ac3.
- Terminologie fúzních modulů kontrolována proti knize, zejména kap. 2.2 a 7.3–7.6: helikální magnetické pole, toroidální/poloidální pole, hlavní/vedlejší poloměr, gyrační střed, Larmorův poloměr, grad-B drift, drift zakřivení, E×B drift. Opravené názvy v ovládání/výkladu/rozcestníku; interní ID a odkazy zachovány. Lokální helicita siločar není globální magnetická helicita.
- Ověřené R0/a z knihy (m): COMPASS-U 0,89/0,27; ITER 6,2/2; JET 2,95/1,25; SPARC 1,85/0,57. Předvolby i výklad mají tyto hodnoty; stále kruhová aproximace, bez D-tvaru a vertikálního protažení skutečných zařízení.
- Testy: fyzika a UI confinement, skutečná tvorba Three geometrií/normálů všech tří scén s náhradou GL kontextu, worker, cache, směr myši; navigace/progressive/module-guide. Prohlížeč nebyl automaticky otevřen; skutečný GPU obraz v prohlížeči zatím není vizuálně ověřen.


## Magnetické udržení — živá geometrie a profily (17. listopadu 2026)

Zrcadlo/solenoid: graf v nativních pixelových souřadnicích, z v metrech
a B na ose v teslech, číselné dílky, rozsah i za koncovými cívkami.
Marker není natažený a mimo rozsah zmizí. Řez zrcadla skrytý; částice
pokračuje v reálném poli i za původní hranicí a mimo obraz. Žádný
automatický reset nebo stop; nový výstřel pouze ovladačem. Siločáry
mají jemnější krok a startují po stejných přírůstcích toku rho*A_phi.

Ohýbání nyní skutečně počítá pole dvaceti natočených kruhových závitů
v každém mezistavu, součet analytických rotací jejich potenciálů.
Vektorový potenciál je také dostupný pro nezávislou kontrolu rotace.
Normalizace proudu zachovává zvolené B0 ve středu délky osy. Skutečné
siločáry jsou integrovány v tomto poli; mapa povrchu je magnetostatický
výsledek po úplném uzavření; během ohýbání se kreslí jen geometrický šedý plášť.
Výpočet mapy se uchovává do změny geometrie. Model nemá indukované E
a vodiče jsou ideálně tenké. V samostatném helikálním pokusu zůstává
osově symetrický ideální model kruhových ploch.

Rozměry R0 a a jsou skutečné vstupy pole, geometrií a trajektorií;
rozsahy 0,4–8 m a 0,08–2,5 m s omezením a<=0,48 R0. Předvolby
z místní knihy: COMPASS-U 0,89/0,27 m (s.48), ITER 6,2/2 m (s.45),
JET 2,95/1,25 m (s.41), SPARC 1,85/0,57 m (s.48). Kromě COMPASS-U
jsou poloměry polovinou průměru toroidu a šířky plazmatu v tabulkách.
Jde výslovně o kruhová přiblížení, ne D-tvar/protažení skutečných strojů;
předvolby nemění B. Kamera se přizpůsobí, fyzikální rozměry se nezaměňují
za pouhé měřítko kresby.

Původní graf uzavírání nahrazen na poslední pokyn profilem B přes celý
malý průměr v polovině délky: x=-a vnitřní, x=0 osa, x=+a vnější strana.
Mapa i profil reagují na geometrii. Barevná škála sytě modrá až sytě
červená; vektory zůstávají modré. Plynulý ovladač průhlednosti, vinutí
lze vypnout (v ohýbání výchozí vypnuté). Odstraněna časová lišta,
částicové legendy a neaktivní ovladače v ohýbání. Automatický záběr
vychází z aktuálního natočeného povrchu a využije spodní volnou plochu.

Test modulu: rotace potenciálu pro natočené závity v mezistavech i pro
velké rozměry, tečnost siločar, kalibrace, q a rozměrové předvolby,
útěk bez zastavení, fyzikální čas a B, grafy s jednotkami, mapa za
ohýbání a ovladače. Navigace/progressive/výklad prošly, dodávka
aktualizována. Scéna kontrolována ze záznamu canvas; prohlížeč neotevřen.
Bez pushe. Novější pokyny této sekce nahrazují starší omezení mapy,
řezu zrcadla a původní geometrické ukázky níže.


## Magnetické udržení — tempo, indukce a materiály (17. listopadu 2026)

Přehrávání má pevnou fyzikální stupnici 2 mikrosekundy za sekundu při
rychlosti 1×; posuvník 0,02× až 4×. Nahrazuje původní počet gyrokroků
za snímek, takže samotná změna B již nemění časovou stupnici. Integrační
krok zůstává omezen lokálním cyklotronním úhlem. Nový ovladač B0
0,1–2 T zachová částici, čas i energii; pole cívek se přepočte při
stejném zrcadlovém poměru.

Cívky mají prostorové měděné vinutí a koncové svazky s kovovými
okraji, při bočním pohledu podélný řez. Rozměry povrchové kresby jsou
názorné; proudový model zůstává tvořen původními závity. Ohýbání má
průsvitný nasvícený povrch a měděné pásy, po uzavření větší záběr.
Mapa B se u ohýbání zapne až pro úplný toroid, podle B0 R0/R, nikoli
podle neexistující simulace deformovaných cívek. V ostatních pokusech
mapa vychází ze skutečného pole modelu. Samostatná škála v T; počet
nakreslených siločar není kvantitativní mapa toku. Modré vektory
a růžový povrch bez mapy zachovány. Mírné odlesky jsou dekorativní.

Vizuální inspirace: Princeton Research Computing, Flux Surfaces within
Plasma from Tokamak Simulation (průsvitné plochy a řez), a COMSOL,
Magnetic Field of a Helmholtz Coil (geometrie a mapa velikosti pole).
Nejsou přebírány jejich obrázky ani výpočetní výsledky. Kresba scény
zkontrolována pomocí záznamu skutečných canvas příkazů do statických
náhledů; nejde o kontrolu HTML rozložení v prohlížeči.
Test modulu (včetně živého B, pomalého času a podmínky mapy), navigace,
progressive a výklad prošly; aktuální dodávka přestavěna. Bez pushe.


## Magnetické udržení — pole závitů, plochy a řezy (17. listopadu 2026)

Nahrazuje původní kvadratické pole zrcadla: konečné kruhové závity,
vektorový potenciál A_phi a jeho analytická rotace přes úplné eliptické
integrály (AGM). Základní solenoid má 16 závitů s poloměrem 0,24 m,
zrcadlo dvě silnější koncové cívky. Centrální B a zrcadlový poměr se
kalibrují proudy podle skutečného pole na ose. Siločáry se trasují
obloukovou délkou i mimo cívky, včetně rozptylového a vratného pole.
Singulární okolí ideálně tenkých vodičů je z trasování vynecháno.
Výchozí pohled zrcadla a solenoidu je vodorovný boční řez; proudové
závity jsou označeny tečkami/křížky. Tažení otáčí kamerou; tlačítko
a dvojklik obnoví boční pohled.

Toroid zůstává explicitně idealizovaný osově symetrický model kruhových
ploch, nikoli výpočet diskrétních cívek či MHD rovnováhy. Má nyní
explicitní potenciál A_phi=C r²/(2R), A_z=-B0 R0 ln(R/R0). Skládání
plynule přisouvá samostatné toroidální a poloidální pole; poměr složek
ovládá skutečné pole. Změny poměru polí/zrcadla zachovají částici a čas,
bez zahrnutí indukovaného E. Trasování se sdružuje do nejbližšího snímku.

Samostatné přepínače siločar, magnetických ploch a řezu. U toroidu jsou
plochy světle růžové a průsvitné; magnetické značky zůstávají modré.
U zrcadla vznikají plochy rotací vypočtených siločar. Řez zrcadlem se
posouvá podélně, toroidální poloidální řez se otáčí; zobrazí se polovina
plochy a zvýrazněná průsečnice. Levý graf při zapnutí řezu ukazuje
průřez plochami ve správném poměru stran. Poloměry zrcadlového řezu
se určují zachováním toku rho*A_phi.

Ověření: test modulu včetně rotace potenciálu uvnitř i vně cívek,
nezávislé Biotovy–Savartovy kvadratury, kalibrace zrcadlového poměru,
toku v řezu, zachování energie, odrazů a úniku, ovladačů ploch/řezů
a plynulého skládání. Navigace, progressive a výklad prošly.
Aktuální dodávka přestavěna. Prohlížeč neotevřen; bez pushe.
Zdroj vztahů kruhového závitu: NASA, Simpson a kol., Simple Analytic
Expressions for the Magnetic Field of a Circular Current Loop,
https://ntrs.nasa.gov/citations/20140002333 .


## Magnetické udržení — 17. listopadu 2026

Nový modul fu04-udrzeni, třetí karta skupiny Plazma a fúze; galerie je čtvrtá.
Zdroj versions/vyvoj/m_files/fusion/confinement, výstup fuze-udrzeni.
Čtyři pokusy: homogenní solenoid, prostorové magnetické zrcadlo, geometrické
ohýbání solenoidu s konstantní délkou osy a toroidální + poloidální pole.
Otočná canvas scéna, kompaktní ovládání, skutečný deuteron s Borisovou
integrací, stopa a gyrační střed, detail gyrace, rozvinutá magnetická plocha,
poměr složek obou znamének, délka a počáteční poloidální úhel siločáry.
Zrcadlo používá analytické vakuové přiblížení u osy (nulová divergence
i rotace), nikoli přesné pole nakreslených cívek. Toroid má kruhové
magnetické plochy, B_phi=B0 R0/R a B_theta=C r/R, nulovou divergenci.
Bez MHD rovnováhy, srážek a vlastních polí plazmatu. Ohýbání je výslovně
geometrické, částice v něm neběží. Změna fyzikálních parametrů připraví
nový výstřel; kamera, viditelnost a rychlost přehrávání stav nemění.
Kniha ověřena na str. 32–35 a 148–151, lokální PDF zůstává soukromé.

Test tools/test-confinement.cjs ověřuje odrazy a ztrátový kužel, únik
solenoidem, energii, divergenci, tečnost siločar k poli, q z oběhů,
spojení konců, skutečné ovladače v DOM/canvas adaptéru, KaTeX a disposal.
Modul zařazen do postupného načítání, publikačního seznamu a společného
výkladu. Sestavení aktualni proběhlo. Prohlížeč se neotevíral; vizuální
kontrola v prohlížeči není provedena. Všechny funkční testy z project/check
prošly; závěrečný audit byl dokončen samostatně mimo sandbox, který blokoval
spuštění čtecího git ls-files z Node. Audit: 473 veřejných souborů, bez nálezů.
Po poslední úpravě znovu prošly test modulu, navigace a progressive. Bez pushe.


## Údaje obou nábojů a didaktika zakřivení — 17. listopadu 2026

Ve společném driftu mají obě vybrané částice vlastní pojmenovanou sadu
živých údajů (energie, Larmorův poloměr, driftová rychlost, perioda).
Horní patří hlavní částici, spodní druhému náboji. Při přepnutí hlavní
částice se správně přehodí vlastnictví údajů; vypnutí druhého náboje jeho
sadu skryje. Záporná částice s umělou hmotností je takto označena, při
skutečném hmotnostním poměru má název Elektron. Názvy jsou i v dodávce,
nejen ve zdrojích. Již načtený dokument je nutné obnovit (Ctrl+F5).

Drift zakřivení je přepracován kolem podélného pohybu a posunu gyračního
středu mimo rovinu siločáry. Devět překrývajících se kružnic nahradila
jediná referenční siločára se třemi směrovými značkami; nový výchozí
pohled má yaw=-1,1 a tilt=0,4. Scéna rezervuje prostor pro Lorentzovu
kartu a automaticky se přizpůsobí většímu poloměru. Ukazuje R, směr z,
posun Delta z, hnědou v_parallel, zelenou v_curv a zelenou stopu středu.
Rychle rotující okamžité v a F jsou v této hlavní scéně skryté; fyzikální
Lorentzův piktogram zůstává. Graf má výslovný název Posun mimo rovinu
siločáry. Výchozí úhel je 80 stupňů, otáčení myší se omezuje na čitelné
náklony. Indukce se omezuje podle energie, částice a R tak, aby poměr
m*v/(|q|*B*R) ležel přibližně mezi 0,08 a 0,25. Při velkém posunu se
částice vypustí znovu bez zastavení času či animace, se zlomem stopy.

Opravena také funkce změny poloměru za běhu: nyní mění skutečnou radiální
polohu a počáteční místo dalšího vypuštění, ne jen referenční kresbu.
Změna odklonu používá místní radiální a tečný směr při zachované energii.
Samotný model předepsaného B a integrace Lorentzovy rovnice se nemění.

Test-drift prošel včetně oddělených údajů, obou hmotností a znamének B,
jediné siločáry, nepřerušeného běhu, mezí záběru a indukce, skutečné
změny R a aktualizovaného počátku. Navigace, progressive a audit prošly;
obě aktuální dodávky sestaveny. Prohlížeč se automaticky nespouštěl;
vizuální kontrola v prohlížeči zatím neproběhla.


## Zřetelnější Grad-B drift — 17. listopadu 2026

Na žádost uživatele trojnásobně zvýšen dostupný relativní gradient:
limit pozvolnosti podle největšího referenčního oběhu z 8 na 24 procent,
absolutní strop parametru z 0,2 na 0,6. Výchozí záporný parametr je -0,18
(ovladač -18 procent), nadále se omezí podle B, energie a částice.
Při běžném nastavení tak používá přibližně trojnásobek předchozího
skutečného gradientu. Silnější pole zůstává vlevo. Jde o skutečné
zesílení driftu integrací v poli, nikoli násobení nakresleného posunu.
Hladký omezený profil B, bezpečné E, obálka oběhů, maximální oddálení
a opakované vypouštění při velké separaci zůstávají.

Test-drift prošel včetně trojnásobku příspěvku v referenčním místě,
směru separace a zachování energie v silnějším gradientu, krajních
hodnot a dlouhého běhu v okně. Navigace, progressive a audit prošly.
Obě aktuální dodávky sestaveny; prohlížeč se automaticky nespouštěl.


## Bezpečné rozsahy a udržení oběhů v okně — 17. listopadu 2026

Opravena příčina rozjíždění měřítka společného driftu: kamera již
nesleduje okamžité polohy s neomezeným oddalováním. Počítá obálku celých
oběhů (střed i poloměr), rezervuje místo pro detail elektronu a kartu
Lorentzovy síly, posouvá se až při nedostatku místa a měřítko rozšiřuje
po odstupňovaných krocích s rezervou. Automatické i ruční oddálení je
ve společném pokusu omezeno na osminásobek výchozího rozsahu. Pokud by
se dvojice dál rozešla mimo tento rozsah, pokračuje pokus novým vypuštěním
ve výchozím místě; běh ani fyzikální čas se nezastaví. Přerušení stopy
označí nový začátek; nejde o fyzikální skok jedné souvislé trajektorie.

Pole Grad-B a společného driftu již neklesá exponenciálně až k nule.
Používá hladký omezený profil Bz=B0*exp(a*tanh(k*x/a)), a=ln(2),
k=gradient/length. Lokálně zůstává mezi polovinou a dvojnásobkem
centrální hodnoty B0, směr zachovává. Diagnostika používá skutečný místní
derivační člen k*(1-tanh(k*x/a)^2). Vztah pro drift je stále adiabatický.
Ovladač gradientu je navíc omezen podle největšího očekávaného oběhu
tak, aby změna pole přes tento poloměr nepřekročila přibližně 8 procent.
Společné E je omezeno na 4 procenta referenčního B0*v_proton, tedy na
nejvýše 8 procent rychlosti při nejnižším místním poli. Ostatní režimy
E×B zachovávají dosavadní limit. Výklad popisuje omezený model pole,
automatický pohled a opakované vypouštění.

Ověřeno test-drift: globální meze pole, skutečná místní derivace,
adiabatický limit, oba směry E/gradientu, krajní B a hmotnosti, celé
oběhy mimo překryvné karty, strop měřítka, dlouhý běh s novou dvojicí
a zachovaným časem i přehráváním, opakované vykreslení bez změny měřítka.
Navigace, progressive a audit prošly; obě aktuální dodávky sestaveny.
Prohlížeč se automaticky nespouštěl, vizuální kontrola zatím neproběhla.


## Šipky podle velikosti oběhu — 17. listopadu 2026

Ve společném E×B + Grad-B se šipky rychlosti a síly u hlavní částice
zmenšují úměrně Larmorovu poloměru, s horním limitem dosavadní velikosti.
Při promítnuté délce pod 4 px se šipka i popisek skryjí; při zvětšení
oběhu se obnoví. Elektron při skutečném poměru hmotností proto ve scéně
nemá velké rotující šipky. Změna se týká názorných šipek hlavní scény;
Lorentzův piktogram dál ukazuje veličiny ve vlastních měřítkách. Pohyb,
síla, kinetická energie, fyzikální čas a stav přehrávání se nemění.

Test-drift ověřil plynulé zmenšování při interpolaci hmotností, skrytí
nečitelných šipek i popisků a jejich návrat; zachování polohy i času.
Navigace, progressive a audit veřejných souborů prošly. Obě aktuální
dodávky sestaveny. Prohlížeč se automaticky nespouštěl.


## Plynulé nastavení společného driftu — 17. listopadu 2026

U Grad-B odstraněn odklon: všechny rovinné drifty mají rychlost kolmou
k B. Výchozí gradient je záporný v modelu i ovladači, tedy silnější pole
vlevo; uživatel jej dál může obrátit. Směr B se ve všech pokusech tohoto
modulu rozlišuje odstínem značek a siločar: kladný modrý, obrácený červený.
Velikost a sytost dál vyjadřují velikost pole, místní záře odpovídá jeho
barvě a vytrácí se do průhledna. Tečky/křížky i prostorové šipky zůstaly.

Společný E×B + Grad-B již nemá graf ani jeho legendu. Číselné údaje
zůstávají. Nastavení v tomto pokusu zachovává běh/pauzu i fyzikální čas:
také hmotnosti, výběr hlavního náboje a zapnutí druhého. Při změně hmotnosti
zůstává poloha a kinetická energie; výklad výslovně uvádí vnější změnu
modelu. Přepnutí hlavní částice mezi již přítomnými náboji přebírá její
skutečný stav. Přidaný druhý náboj začíná v aktuální poloze hlavního,
se zvolenou počáteční energií a ve stejném fyzikálním čase.

Ověřeno test-drift (včetně změn za běhu, zachování polohy a času,
obou odstínů ve všech šesti pokusech, skrytého grafu a směru gradientu),
navigace a progressive. Obě aktuální dodávky aktualizovány. Vizuální
kontrola v prohlížeči neproběhla; prohlížeč se automaticky nespouštěl.


## Společný drift a přechod hmotností — 17. listopadu 2026

Drift má nový pokus E×B + Grad-B. E a gradient se ovládají nezávisle;
hlavní částicí může být kladný nebo záporný náboj, přepínač přidá druhý.
Posuvník logaritmicky převádí stejnou hmotnost protonu pro oba náboje na
skutečný poměr proton/elektron (asi 1836,2). Mezilehlý záporný náboj je
označen jako modelový; změna hmotností připraví nový pokus. Kinetické
energie jsou společné, časy fyzikálně shodné, lokální Borisovy kroky
každé částice respektují její vlastní periodu (úhel nejvýše 0,025 rad).
Společné prostorové měřítko zůstává při přechodu hmotností stejné, pohled
udržuje oba náboje v záběru. Elektron má zvětšený detail. Graf sleduje
příčné rozcházení obou gyračních středů, případně polohy při vypnutých
středech. E je omezeno podle pomalejšího protonu. Vlastní pole separace
se nepočítá; částice jsou testovací a navzájem se neovlivňují.

U E×B a společného driftu je odklon skrytý a rychlost kolmá k B.
Piktogram má pětinásobně zvýrazněný elektrický příspěvek: legenda uvádí
5F_E a názornou F*=F_B+5F_E. Skutečná Lorentzova síla a integrace se
nemění; součet zobrazených šipek je přesný. Výklad obsahuje rozlišení
názorné výslednice. Piktogram zůstává bez vysvětlujících odstavců.

Ověření: test-drift (včetně skutečných hmotností, společného časového
okna, naměřeného Grad-B driftu obou znamének B, energie, interpolace,
ovládání a KaTeXu), navigace a progressive prošly. Výběr veřejných
souborů a kontrola citlivých dat prošly. Obě aktuální dodávky sestaveny.
Prohlížeč se podle pravidla projektu nespouštěl; vizuální kontrola
rozložení tohoto doplnění v prohlížeči zatím neproběhla.


17. 11. 2026 — Podle dalšího upřesnění obráceno pouze svislé otáčení
piktogramu (nahoru/dolů); vodorovný směr zůstává. Test driftu, navigace
a progressive obou aktualizovaných dodávek prošly.

## Větší nákres a obrácené otáčení — 17. listopadu 2026

Karta piktogramu má šířku 360 px, nákres výšku 280 px a soustava je
přibližně o 22 % větší. Hlavní vztah i symbolická legenda jsou menší
a nižší; větší část karty připadá grafice. Vodorovný i svislý směr tažení
myší je obrácený dle požadavku uživatele. Dvojklik nadále obnoví výchozí
pohled. Zvětšení zachovává společné měřítko sil a přesný vektorový součet.
Test obou směrů tažení a fyzikální/ovládací testy driftu prošly.
Obě dodávky aktualizovány; navigace a progressive ověřeny.

## Elektrická složka přímo v soustavě — 17. listopadu 2026

E, F_E, F_B i výsledná F nyní vycházejí ze stejného počátku jako v a B.
Samostatná spodní řada vektorů je odstraněná. Síly mají společné lineární
měřítko, takže koncový bod F přesně odpovídá součtu F_E+F_B v projekci.
Přerušované spojnice ukazují příspěvky obou složek. Volba sílového měřítka
používá dostupný rozsah E, takže změna E nepřeškáluje nezměněné F_B.
E má vlastní názornou stupnici jako ostatní pole; síly se vzájemně sčítají
ve společné stupnici. Při zapnutém E jsou označení sil v pevné barevné
legendě, aby se nepřekrývala u společného počátku.
Test ověřil společný počátek všech vektorů a přesný součet sil v obou
směrech B pro proton, elektron i alfa částici. Ověřena stabilita F_B při
změně E; test-drift, navigace a progressive obou dodávek prošly.

## Společná šířka textu a rovnic — 17. 11. 2026

Na uživatelský pokyn odstraněn limit 74ch u odstavců a položek výkladu.
Text nyní využívá stejnou dostupnou šířku jako bloky rovnic a při změně
velikosti okna se přirozeně přezalamuje. Velikost písma zůstává čitelná.


## Propojené velikosti šipek a náhled v poli — 17. listopadu 2026

Předchozí šipky piktogramu byly normalizované a u čekající částice mimo
pole správně vycházelo místní B=0; proto změna B nebyla vidět. Délky nyní
reagují na skutečné velikosti v, B, v×B, F_B, E, F_E i výsledné F přes
pevná názorná měřítka. Referenční hodnoty se nemění s ovladačem; rozsahy
jsou stlačené a mimo běžný rozsah se celá hlavní soustava společně vejde
do obrázku. Při čekání mimo pole a nenulovém nastaveném B karta ukazuje
jasně označený náhled „v poli“ se silou pro nastavené pole a aktuální
rychlost. Po vstupu používá skutečné místní pole. Fyzika mimo pole se
nemění; při nastaveném B=0 zůstávají síly nulové i v náhledu.
Test-drift ověřil růst šipek při změně B, E i energie, výslednou sílu
a oddělení náhledu od skutečné síly mimo pole. Navigace a progressive
pro obě aktualizované dodávky prošly.

## Čitelnost rovnic ve výkladech — 17. 11. 2026

Na další uživatelský pokyn zvětšena matematika v celé studijní šabloně.
Samostatné vztahy používají přibližně 23 px (na úzkém okně 21 px),
větší odstupy, jemné zelené pozadí a levý zvýrazňující okraj. Vložené
veličiny zůstávají součástí vět, mírně zvětšené na přibližně 18 px.
Rozlišení vychází z umístění vztahu v dokumentu; rovnice uvnitř odstavců,
seznamů a tabulek se nerozdělují do bloků. Sazba ve schématech SVG se nemění.


## Studijní šablona výkladů — 17. 11. 2026

Po uživatelské připomínce k rozpadlé sazbě napříč moduly výklad už nepřebírá
CSS třídy ani inline rozložení původních scén. Typický p.explain přebíral
dvousloupcovou mřížku hostitele; ta rozdělila věty a vložené veličiny do buněk.
HTML próza nyní používá vlastní izolovanou sazbu, značky v řádku, odstavce
s omezenou délkou řádku a oddělené blokové rovnice. KaTeX a SVG zůstávají
zachované. Společná studijní šablona přidává obsah s přechodem na kapitoly,
sjednocené nadpisy a zdroje s navazujícím studiem až na konci. Obsah neposílá
hash navigaci a neopouští pokus. Konkrétní vztahy a odstavec o proudových
šipkách TR01 převedeny z ručního HTML na souvislé výrazy KaTeXu.
Aktuální dodávka sestavena; testy module-guide (včetně regrese tříd explain /
formula a obsahu kapitol) a progressive prošly. Přísný KaTeX: 117 rovnic.
Skutečný vzhled v prohlížeči zatím neověřen; čeká na uživatelské posouzení.


## Stručný a otočný piktogram bez překrytí — 17. listopadu 2026

Podle snímku uživatele odstraněny nulové hodnoty a dlouhé názvy z nákresu.
V soustavě jsou jen krátké značky a vektory; součin je c. Nezbytné vztahy
a nulové hodnoty mají pevnou symbolickou legendu pod soustavou. Podle
dalšího upřesnění je karta pouze paměťová kotva, bez slovního výkladu,
popisů nebo pouček. Podrobné vysvětlení zůstává v hlavním výkladu modulu.
Karta je neprůhledně bílá, osy subtilnější a vlastní vektory silnější;
popisky nezasahují do hrotů šipek. Výchozí pohled je nesymetrický a lze
ho natáčet tažením; dvojklik ho obnoví. Pohyb částice, čas a hlavní kamera
se přitom nemění. Zachována stojatá vektorová sazba dle AGENTS.md.
Test-drift včetně nezávislého otáčení a nulového stavu ze snímku prošel.
Ověřeny obě dodávky test-fusion-navigation a test-progressive.

## Společný výklad v celém katalogu — 17. 11. 2026

Uživatel schválil pilot AM a požádal o stejný přesun všude. Všech 58
modulů nyní používá společný vstup Ovládání a výklad před celou obrazovkou;
fúzní moduly jej dostávají ve své vlastní hlavičce. Plovoucí otazník skrytý.
Průvodce sdružuje existující návody pro celý katalog a původní odborné
details/dialogy, včetně nativních modulů, PMSM, energetických pokusů a driftu.
Obsah zůstává v původních uzlech kvůli výpočtům a ID, ale mimo tok rozložení;
otevření pořizuje aktuální kopii. SVG zachovává styl a dostává unikátní ID.
Vzorce data-tex i data-math a textové veličiny/jednotky používají KaTeX.
Pokus se při otevření ani zavření neresetuje; dialog funguje také v celé
obrazovce fúzního iframe. Rozbalovací nastavení, polohy vodičů, živá Lorentzova
síla a nastavení PMSM zůstávají u pokusu. Volba vypočteného pole principu AM
zůstává dostupná mimo přesunutý výklad. U rotorové transformace se uvolňuje
pevná spodní řádka pro grafy. Ostatní přesuny hlavních ovladačů zatím neprobíhají.
Vizuální posouzení aktuálních oken čeká na uživatele; prohlížeč neotevřen.
Sestavení dokončeno. Test průvodců pokrývá všech 58 modulů a tři historické
adresy, oddělení nastavení od výkladu, aktuální kopie hodnot, přepnutí modulu,
jediné tlačítko a dialog v celé obrazovce iframe. Všech 110 původních rovnic
v přesouvaných details/dialogách vložených lekcí prošlo přísným KaTeXem.
Testy škálování (mock DOM), navigace, progressive i všechny funkční části
project/check prošly. Pouze závěrečný Git audit nedoběhl: spawnSync git EPERM.
Kontrola whitespace změněných běžných souborů prošla. Nic nepushnuto.


## Tučné stojaté vektory — 17. 11. 2026

Sjednocena vektorová sazba na KaTeX \mathbf ve všech dosud odlišných
rovnicích a živých popiscích driftu, jeho průvodci a výkladu odporu rotoru.
V H7 sjednocen vektor délkového elementu; v H6 označen popisek vnějšího
pole jako vektor, u magnetizace zachováno stávající data-vector.
Skalární velikosti a složky ani komplexní fázory se nemění. Pravidlo
je v AGENTS.md a versions/vyvoj/AGENTS.md. Aktuální dodávka přestavěna.
Test driftu a přímé vykreslení upravených rovnic skutečným KaTeX prošly.
Kontroly navigace a progressive prošly; celkový project/check se zastavil
na samostatné kontrole průvodce (guide must not manipulate measured lesson
or lifecycle), jehož rozpracované úpravy byly přítomné už před touto prací.
Prohlížeč neotevřen, nic nepushnuto.


## Pilot společného výkladu — 17. 11. 2026

Momentová charakteristika AM: v aktuální integrované výuce má tlačítko
Ovládání a výklad vlevo vedle celé obrazovky. Jeden společný dialog
obsahuje konkrétní návod, tři pokusy a oba původní odborné texty se zdroji.
Spodní dva details se při integraci přesouvají do inertního template;
samostatný zdrojový dokument si původní details zachovává. Volná výška
připadá stávajícímu pružnému grafu a schématu. U pilotu skrytý duplicitní
plovoucí otazník. Ostatní moduly zatím používají dosavadní průvodce.
Sdílené API ModuleGuide.open(content) nemění stav ani životní cyklus lekce.
Test module-guide doplněn o zachování teorie, zdrojů, KaTeX a otevření/zavření.
Sestavení a testy module-guide, progressive a module-window-fit prošly.
Celkový project/check prošel funkčními kontrolami, závěrečný audit souborů
nedoběhl kvůli spawnSync git EPERM v tomto prostředí. Geometrie ověřena
automatickými mock testy, nikoli novým snímkem skutečného prohlížeče.
Vizuální posouzení pilotu čeká na uživatele, další přesuny tlačítek pozastaveny.


## Sbalitelný kartézský piktogram Lorentzovy síly — 17. listopadu 2026

Do pravého dolního rohu přidána karta Lorentzova síla s rozbalením
a sbalením kliknutím na záhlaví. Po připomínce k čitelnosti používá větší
izometrický pohled s kartézskou mřížkou a osami x, y, z. Zobrazuje aktuální
náboj, v, B, zelený součin v×B a fialovou magnetickou sílu q(v×B) z místního
pole a skutečné rychlosti. Vztah směru síly k součinu je uveden podle náboje.
Při nenulovém E přibudou v samostatné spodní části E, F_E a výsledná F
a v záhlaví úplný Lorentzův vztah; při E=0 zůstává magnetická část.
Nulová magnetická síla je označená i pro v rovnoběžné s B. Délky vektorů
jsou výslovně názorné. Sbalení neovlivňuje polohu, rychlost, čas ani
přehrávání; skrytou kartu nevykresluje. Detail elektronu je vlevo nad
měřítkem. Popisky mají ochranu proti vzájemnému překrytí.
Ověřeny směry vektorů i součinu pro proton, elektron a alfa částici,
magnetická nula a rovnoběžnost v/B, sbalení za běhu a obě dodávky.
Test-drift, test-fusion-navigation a test-progressive prošly.
Další uživatelský návrh: ovládání, výklad a modelové podrobnosti sdružovat
pod jedno Vysvětlení vlevo vedle celé obrazovky; napříč projektem navázat
na společný ModuleGuide, nevytvářet další samostatné výkladové pásy.

## Měkká záře jednotlivých značek B — 17. listopadu 2026

Plošné modré podbarvení je podle upřesnění uživatele odstraněné. Místo něj
mají jednotlivé značky B lokální radiální záři s několika plynulými stupni
a zcela průhledným vnějším okrajem. Síla a dosah odpovídají místnímu B.
U vletu záře nezasahuje před hranici pole; při nulovém B se nekreslí.
Prostorové šipky mají měkký modrý stín. Výrazné velikosti značek zůstávají.
Ověřeno test-drift.cjs, test-fusion-navigation.cjs a test-progressive.cjs.
Obě aktuální dodávky byly aktualizovány, prohlížeč nebyl otevřen.

## Sjednocení principu AM — 17. 11. 2026

Doplnění: tlačítko spuštění/pauzy má společnou zelenou #007e6c, bílý
text a tmavší hover. Obnovení zůstává sekundární bílé. Rozměry nezměněny.

Vířivé proudy uživatel přijal. V Principu asynchronního motoru jsou
tlačítka Pozastavit/Spustit a Obnovit před oběma parametry. Upraven
princip-template.html, sloupce auto/1fr/1fr zachovávají původní šířky
skupin. Rozměry obou pohledů a fyzika beze změny. Vizuální posouzení
čeká na uživatele; prohlížečový test nebyl dostupný. Drifty nedotčeny.


## Sjednocení ovládání vířivých proudů — 17. 11. 2026

Ztráty vířivými proudy: skupina spuštění/pauzy, obrácení proudu a obnovení
přesunuta před parametry. Přesunuty i šířky sloupců v obou pravidlech
rozložení; mezery, padding, grafy a skripty beze změny. Výsledek určen
k postupnému uživatelskému posouzení. Drifty v této úpravě nedotčeny.


## Výraznější velikost značek a podtón B — 17. listopadu 2026

Na další žádost uživatele je rozdíl velikosti značek mezi slabým a silným
polem výraznější (poloměr přibližně 3 až 7 px pro 0,1–6 T); prostorové šipky
mají také výraznější odstupňování. Přidán jemný modrý podtón oblasti pole
s průhledností přibližně 2,5–9 %. U vletu nezačíná před hranicí pole,
při B=0 chybí. U Grad-B používá plynulý přechod podle skutečné místní
velikosti pole. Znaménko sytost ani podtón nemění, model pohybu zůstává stejný.
Ověřeno test-drift.cjs, test-fusion-navigation.cjs a test-progressive.cjs;
obě dodávky obsahují shodný aktuální zdroj modulu. Prohlížeč nebyl otevřen.

## Postupné sjednocení — hystereze (17. 11. 2026)

Skupina přehrávání, odmagnetování, nasycení a vymazání stopy je před
buzením. Prohozeny i odpovídající šířky sloupců ve zdroji a společném
stylu; pevná výška ovládání a geometrie tří panelů zachovány. Sestavení
a test fyzikálního modelu prošly. Vizuální posouzení čeká na uživatele.
Drifty v rámci této úpravy nedotčeny; jejich souběžné změny zachovány.


## Drifty: tlačítko směru a síla B — 17. listopadu 2026

Podle posledního upřesnění je rozsah velikosti B 0,1–6 T (výchozí 0,5 T).
Nula je dovolená pouze u vletu do pole, kde lze ukázat pokračující přímý let.
V gyraci a všech driftech se minimum hlídá i při přechodu z vletu a při změně
za běhu. Směr opět přepíná Obrátit B pole, se zachováním velikosti, rychlosti,
polohy a času. Síla pole se názorně zobrazuje sytostí původní sdílené modré,
mírným růstem značek a výrazností prostorových siločar a šipek. Grad-B
používá skutečnou místní velikost pole v místě každé značky. Znaménko mění
tečku/křížek či orientaci šipky, nikoli sytost a velikost. Měřítko pohledu
a délka časového okna byly přizpůsobeny výchozímu B=0,5 T. Platí i předchozí
omezení E a funkční zoom. Regresní test ověřuje obrat v každém pokusu,
limity a nulový vlet, barevnost/velikost při slabém a silném poli, prostorové
vykreslení a místní rozdíly Grad-B.
Obě dodávky byly aktualizovány; tools/project/check.cjs i samostatné testy
driftu, navigace a progresivního načítání prošly. Prohlížeč nebyl otevřen.

Magnetizace (17. 11. 2026): oprava výkladu požadavku — oba hlavní panely
mají původní bílou výplň a rámeček. Průhledný je pouze společný kontejner
main > .stage, který přebíral světlé pozadí ze sdíleného stylu. Geometrie zachována.


## Zkušební sjednocení ovládání — 17. listopadu 2026

Na pokyn uživatele upraveny první dva moduly k vizuálnímu posouzení:
Magnetizace má skupinu Přehrát cyklus / Odmagnetovat jako první sloupec
se zachováním šířek přesunutých sloupců. Magnetizační proud má přehrávání
a obnovení na začátku stejného časového řádku. Geometrie grafů, fyzika
a obsluha událostí nebyly upraveny. Kontroly společného škálování prošly.
Vizuální kontrola aktuálního výsledku čeká na uživatele; dostupné uložené
snímky jsou starší. Pokud proporce či přehlednost nevyhoví a nepůjdou
opravit, vrátit konkrétní modul. Změny dalších modulů zatím neprovedeny.


## Podepsané B přes nulu ve všech pokusech — 17. listopadu 2026

Tlačítko Obrátit pole je odstraněné. Společný posuvník B má rozsah −10 až
+10 T s nulou uprostřed ve všech pěti pokusech; záporné i kladné údaje mají
pevné místo. Změna za běhu zachovává polohu, rychlost i čas. V B=0 pole
nekreslí magnetické značky, pohyb je přímočarý, gyrační střed neexistuje
a fyzikální cyklotronová perioda je nekonečná. Krok animace má samostatnou
konečnou časovou referenci, analytická gyrace používá stabilní limit sinc
pro nulovou úhlovou rychlost. Rozsah E se mění s |B|; relativní poloha
ovladače se zachovává i přes B=0, kde je E vypnuté. Délka šipky E odpovídá
její poloze v dostupném rozsahu. Testy pokrývají volný pohyb B=0, přechody
kladné → nulové → záporné B ve všech pokusech a pro všechny částice,
souběžnou gyraci více druhů při B=0 a návrat rozsahu E i délku její šipky.
Úplné sestavení i tools/project/check.cjs prošly, prohlížeč nebyl otevřen.

## Klidnější E×B drift, zoom a stabilní údaje — 17. listopadu 2026

Na další připomínky byl široký rozsah E nahrazen přizpůsobivým limitem
|E| ≤ 0,08 |B| v (v odpovídá zvolené energii a částici). Změna B nebo energie
limit přepočítá, změna částice zachovává relativní polohu ovladače. Kamera
udržuje částici v záběru bez resetování fyziky; graf zachovává skutečné
souřadnice. Kolečko přibližuje a oddaluje kolem kurzoru ve všech pěti pokusech
včetně driftu zakřivení. Dvojklik obnoví pohled, bez změny fyziky či času.
Při tažení částice zůstává přiblížení zachované. Měřítko má ve všech pokusech
bílou kartu vykreslenou nad trajektoriemi. Názvy v nabídce, scéně, průvodci
a rozcestníku odpovídají rukopisu: E×B drift, Grad-B drift, Drift zakřivení.
Údaj E má samostatný pevný řádek a místo pro znaménko i exponent, takže
záporné hodnoty nemění rozměry ovládání. Regresní test zahrnuje 64 krajních
kombinací částice, B, energie a obou znamének polí, obousměrný zoom každého
pokusu, zachování fyziky, bílou kartu měřítka a pevné rozměry řádku E.
Úplné sestavení a tools/project/check.cjs prošly. Prohlížeč nebyl otevírán.

## Galerie na konci a elektrický drift — 17. listopadu 2026

Galerie je poslední položkou skupiny za driftovým experimentem (čísla 01/02/03),
původní ID a historické odkazy zůstávají. Kladné E směřuje dolů jako v obr. 7.9
na str. 146 přiloženého rukopisu; výpočet i šipka používají stejnou orientaci.
Graf elektrického driftu sleduje x. Rozsah E je ±30 MV/m, výchozí 300 kV/m;
při výchozím B=5 T dává skutečný drift 60 km/s místo téměř neviditelných
300 m/s. Nejde o násobení vykresleného pohybu. Nula E vypíná, znaménko E
a obrácení B mění směr podle E×B, nezávisle na náboji. Regresní testy
pokrývají modelovou energii/práci, oba směry polí, skutečné ovladače, šipku
a vodorovnou osu grafu včetně změny E během přehrávání bez resetu polohy
a času. Úplné sestavení a tools/project/check.cjs prošly. Prohlížeč se neotevíral.

## Převzetí a úklid — 17. listopadu 2026

Aktivní je balíček z 16. listopadu, commit `7a9914e314a939d86f79a0b0a192e2a80d49734d`.
Bylo ověřeno všech 1 514 souborů SHA-256 manifestu a shoda veřejných zdrojů
s hlavní větví GitHubu. Samostatné sestavení z balíčku a projektové kontroly
prošly. Aktuální vstup je `versions/aktualni/web/index.html`.
Nový ZIP se uchovává pouze v `handoffs/` spolu se SHA-256; starší předávky,
historický archiv a nepotřebné dočasné kopie byly odstraněny. Literatura,
malé vstupy pro přepočet, historie Git a dvě chráněné zálohy zůstávají.
Přesné uspořádání a zásady dalšího úklidu viz `VERZE.md`. Žádný push nebyl proveden.
Následující starší záznamy jsou historie, neurčují jiný aktuální základ.

## Aktuální souhrn pro předání — 16. listopadu 2026

Uživatel výslovně požádal o předávací balíček pro jiný počítač a push celé
aktuální verze. Předává se hlavní větev main, označení aplikace zůstává 1.0.
Starší poznámky „bez pushe“ níže popisují tehdejší dílčí stavy. Rozhodující
commit, stav vzdálené větve a příznak pushPending uvádí _handoff/state.json
v novém soukromém balíčku; nasazení se ověřuje v GitHub Actions.

Aktuální aplikace obsahuje 58 modulů včetně pěti pokusů s drifty částic,
průběžně doplněné fúzní scény a galerie, stručných průvodců, schválených
siluet vybraných vozidel a navigace bez hledání. Oprava načítání rozcestníku
je zachovaná. Elektrické pole má jantarovou a magnetické modrou barvu.
Průvodce necituje uživatelské prezentace; Bartoš je správně identifikovaný
jako Teorie elektrických strojů. Podrobné změny a omezení jsou níže.

Před uložením tohoto stavu prošly: úplné node tools/build-release.cjs,
node tools/project/check.cjs (včetně driftu, vozidel, fyzikálních modelů,
navigace a lazy načítání), node tools/project/test-tools.cjs a příprava
čistého publikačního výběru přes prepare-web.cjs. Webový výběr má 208
souborů, přibližně 182 MiB; obsahuje všech 42 progressiveFiles. Neobsahuje
knihy, skeny ani vývojové nástroje. Soukromý ZIP je přidává odděleně spolu
s historií Git a aktuálními skutečnými LFS daty. Stav veřejných zdrojů
prošel auditem. Prohlížeč se neotevíral; testy DOM/canvas a numeriky nejsou
vizuální kontrolou skutečného WebGL obrazu na novém počítači.

Při místním sestavení se u velkého generovaného HTML opakovaly chyby otevření
souboru ve Windows. Sestavení uspělo s lokálním dočasným atomickým zápisem;
nejde o závislost veřejného sestavení ani balíčku. Z LFS zdroje byly po
sestavení odstraněny pouze prokázané čtyři přidané prázdné řádky: obsah
zůstává bajtově totožný s předchozím commitem, bez zbytečné nové LFS kopie.

Na novém počítači ZIP rozbalit do nové prázdné složky a spustit
node tools/project/restore.cjs pod běžným uživatelským účtem. Poté přečíst
pravidla a předávací soubory, nastavit vlastní Git identitu a přihlášení,
provést git fetch origin a zkontrolovat stav; s čistým stromem pull --ff-only.
Požadované nástroje: Node.js 24, Git a Git LFS. Přihlašovací údaje ani
konfigurace tohoto počítače se nepřenášejí. Otevření hotové výuky:
versions/aktualni/web/index.html. FEM přepočet se automaticky nespouští.

## 16. listopadu 2026 — oprava rozcestníku po odstranění hledání

tools/physics-preview.js ještě předpokládal existenci discovery-search,
discovery-actions, module-search a search-status. Po odstranění hledání
selhal Lab.home při zápisu textContent do null a zůstala úvodní načítací
obrazovka. Odstraněny zbývající vazby i obsluha filtru; členění oblastí
zůstává. Lokální kontrola tmp/check-home-no-search.mjs používá LinkeDOM
a skutečné skripty home-discovery/physics-preview: původní kód prokazatelně
selže, oprava projde pro hlavní stránku, tři oblasti a devět skupin včetně
jejich výhradního rozbalování. Prohlížeč se nespouští. Souběžné změny
nového modulu driftu jsou zachované. Bez pushe.
Obě dodávky znovu sestaveny, tools/project/check.cjs prošel. DOM kontrola
prošla také se skriptem physics-preview vytaženým přímo z hotového index.html.

## 16. listopadu 2026 — obrázek podle vybraného vozidla (místní, bez pushe)

Modul 08-vozidla místo jedné společné karoserie kreslí pět původních
schematických siluet podle předvolby: Tesla Model 3, Škoda Enyaq, BMW i4,
VW ID.4 a Hyundai Ioniq 6. Liší se obrysem střechy a karoserie, okny,
proporcemi, barvou a drobnými detaily. Volba Vlastní parametry používá
neutrální siluetu. Nejde o rozměrové výkresy ani převzaté fotografie.
Není doložený rok původní Tesly; tato nejistota parametrů zůstává zachovaná.

Renderer vehicle-art.js se vkládá přes Web/build-vehicle.cjs před vlastní
vehicle-module.js. Silueta používá stejnou rotaci na svahu jako silové šipky
a původní plochu grafu. Výběr mění také přístupný popis canvasu. Nezměnily
se parametry předvoleb, fyzikální model, osy, rozvržení ani ovladače.

Vzhled byl porovnán s veřejnými podklady výrobců (jen jako vizuální reference):
Tesla konfigurátor SIDE; Škoda Enyaq 2025 technický list; BMW i4 2022 prospekt;
VW ID.4 tiskový materiál k designu; Hyundai původní Ioniq 6, design 2022.
Vektorový porovnávací náhled byl zkontrolován jako PNG bez prohlížeče.
Test tools/test-vehicle-art.cjs ověřuje šest různých kreseb, konečné souřadnice
a meze stávající plochy při sklonech ±20 %, návaznost výběru i vlastních
parametrů a nezměněné vstupy fyziky. Test je součástí project/check.cjs.
Souběžné úpravy rozcestníku a jiných modulů se zachovávají.

## 16. listopadu 2026 — navigace bez hledání (místní, bez pushe)

Na žádost uživatele odstraněno hledání na rozcestníku i v bočním stromu.
Odstraněna také tlačítka Rozbalit vše / Sbalit vše. Tematické skupiny mají
společné jméno details a při otevření zavírají ostatní skupiny; rozcestník
si pamatuje jedinou skupinu. Boční navigace při otevření zvýrazní a rozbalí
skupinu aktuálního modulu. Odkazy zpět a na hlavní rozcestník zachovány.
Existující prohlížečový test upraven pro nové chování, prohlížeč se nespouští.
Obě dodávky aktualni sestaveny, tools/project/check.cjs prošel.

## 16. listopadu 2026 — posouvání návodu ve fúzi (místní, bez pushe)

Panel Ovládání a návod měl neomezenou výšku a dlouhý výklad přesahoval
viditelnou část modulu. Nyní má šířku 480 a maximální výšku 680 logických
pixelů uvnitř škálované plochy 1360 × 820, vlastní svislé posouvání a stabilní
místo pro posuvník. Pojmenovaný region lze zaměřit klávesou Tab a posouvat
klávesnicí. Obsah výkladu zůstává celý; rozměry grafu se nemění.
Společné návody ostatních modulů již používají overflow:auto.
Kontrola zdrojových stylů zahrnula společné návody (57 modulů), rozbalovací
výklady uniform-module-layout, dialogy transformátorů a synchronních strojů.
Další stejná chyba nebyla nalezena: společné panely mají omezenou výšku a
overflow:auto, nativní modální dialogy využívají také výchozí posouvání
prohlížeče. Obě dodávky sestaveny a tools/project/check.cjs prošel.
Jde o kontrolu zdrojů a automatické testy, ne vizuální průchod prohlížečem.

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

## 16. listopadu 2026 — první modul driftů a vlet do pole (místní, bez pushe)

Nový fu03-drift ve skupině Plazma a fúze; zdroje fusion/drift/, dodávka
fuze-drift/index.html. Pět pokusů: vlet z oblasti bez pole do homogenního
magnetického pole, gyrace, elektrický, gradientní a křivostní drift.
Podklad: Entler–Kindl, Jaderná fúze a fúzní elektrárny, kap. 7.3–7.4,
str. 141–148. Kniha ani její extrakce nejsou přidané do veřejného webu.

Numerická Lorentzova rovnice v SI, symetrický Borisův krok; skutečné
hmotnosti elektronu, protonu, deuteronu a alfa částice. Ostrá hranice pole
je idealizovaná. Vlet ukazuje přímočarý pohyb, stáčení a následný výlet
po tečně. Gradient je exponenciální profil velikosti B při pevném směru;
křivostní pokus používá kruhové siločáry s konstantní velikostí B, aby
oddělil křivostní drift od gradientního. Gyrační střed a magnetické drifty
jsou v nehomogenním poli adiabatické aproximace. Bez srážek, vlastního
pole plazmatu, polarizačního a gravitačního driftu. Druhy částic se zatím
porovnávají přepínáním, nikoli současným párem ve scéně.

Vlevo ovládání a graf příčné polohy/středu, vpravo scéna s původním
sdíleným rendererem jader; při nedostupném WebGL označený bod. Posuvník
času, krokování, záporné přehrávání, tažení polohy a směru vletu, otáčení
křivostního pohledu, obrácení B, samostatný výklad. KaTeX i v dynamických
údajích. Rozměr 1360 × 820 a stejné škálování jako fúzní reakce. Nový
modul i jeho průvodce jsou součástí katalogu a lazy sestavení.

Test tools/test-drift.cjs: analytická gyrace, směr rotace, energie/práce,
volný pohyb před i po hranici, průměr půlkružnice a konvergence hranice,
velikosti a znaménka driftů, skutečné obsluhy ovládání, renderovací volání
a uvolnění zdrojů. Celá tools/project/check.cjs po dílčím sestavení prošla.
Vizuální kontrola neproběhla; prohlížeč se podle pravidel neotevíral.

Závěrečné úplné build-release uspělo s existujícím lokálním retry preloadem
(tmp/loading-optimization/retry-write.cjs) pro zamykání HTML ve Windows.
Obě aktivní dodávky byly kompletně přestavěné včetně všech lazy balíčků.
Závěrečná tools/project/check.cjs po úplném sestavení prošla včetně auditu.

## 16. listopadu 2026 — drift: kompaktní ovládání a čisté hroty šipek
Vektorové šipky mají jedinou vyplněnou siluetu; dřík končí u základny
trojúhelníkového hrotu, i u krátkých vektorů. Ovládání vlevo zhuštěné,
hodnoty vedle popisků, menší mezery a tlačítka; uvolněnou výšku získává
graf. Obě konvence uložené v AGENTS.md. Obě dodávky a lazy manifesty
aktualizované přes build-particle-library.cjs. Test driftu, navigace a
načítání prošel; prohlížeč neotevřen, bez pushe. Návrh dalšího zlepšení
vletu: zakončit výukový pokus u výstupu z pole; zatím neimplementováno.


## 16. listopadu 2026 — drift: umístění do pole a kontrast
Částici lze v přípravě přetáhnout dovnitř i ven z pole; obě strany používají
stejnou Lorentzovu integraci. Celá kružnice v poli zůstává uzavřená, dráha
přes hranici vyletí po tečně. Po puštění se podle potřeby rozšíří záběr
kružnice; během letu je pevný. Vlet má pole na pravých 73 % scény, sytější
podklad, tmavší směrové značky a ostrou hranici. Popisky grafu mají průhledné
pozadí; názvy os, číselná stupnice a čas mají oddělené okraje bez překryvu.
Rozšířen test: kroužení uvnitř a únik u hranice pro obě orientace B, skutečné
přetažení dovnitř a zpět. Test driftu, navigace a progresivní dodávky prošel.
Obě aktuální dodávky přestavěné dílčím sestavením. Bez prohlížeče a pushe.
Dřívější návrh zastavit vlet u výstupu se tímto nahrazuje volným umístěním.


## 16. listopadu 2026 — živá animace driftu a barvy polí
Odstraněn časový záznam, krok a zpětné přehrávání. Borisova integrace
běží nepřetržitě, uchovává omezenou stopu pro graf. Pauza a restart;
kamera při odletu sleduje částici. Energie a velikost i znaménko B se
mění za běhu, zachovávají polohu a čas; energie upraví velikost rychlosti.
Jde o vnější zásah, změna B nezahrnuje indukované E (popsáno v návodu).
Odstraněna zelená výplň oblasti a podklady všech popisků scény.
Sdílená paleta v particles/style.js: E jantarová #b57825, B modrá #356ac3.
Elektrické siločáry fúzních reakcí sjednoceny do jantarové; kvantitativní
mapa velikosti zachovaná. Konvence uložená v AGENTS.md. Obě dodávky
aktualizovány včetně lazy manifestů. Test živých změn, driftů, navigace
a progressive prošel. Vizuální ověření neproběhlo; bez pushe.


Drift — upřesnění ukončení vletu: kamera v pokusu entry zůstává pevná.
Po opuštění pole se přehrávání zastaví přesně uprostřed volné oblasti
mezi hranicí pole a levým panelem (interpolace posledního kroku).
Fyzikální rychlost se nenuluje, končí pouze animace. Spustit je dokončené;
Restart obnoví počáteční stav a běh. Test ověřuje konec, stabilní čas po
skončení a restart. Test driftu a navigace prošel; obě dodávky aktualizované.
Bez vizuální kontroly a bez pushe.


Drift — pevná měřítka a tokamakové indukce: odstraněno automatické
oddalování po položení a sledování kamerou. Referenční délka závisí pouze
na druhu částice (500 eV, 5 T); při změnách energie, B, polohy a geometrie
je pevná. Graf má pevný polohový rozsah a pevné časové okno s posuvem
časového počátku. Křivostní pohled nemění měřítko s poloměrem. Výchozí B
je 5 T, rozsah 1–10 T; opora ITER FAQ: toroidální pole na ose 5,3 T.
Opravena KaTeX sazba 1000 eV odstraněním lokalizovaného seskupování číslic,
regrese nyní používá skutečný KaTeX s throwOnError i pro 1000 eV.
Test driftu a dodávky prošel. Bez prohlížeče a bez pushe.


Drift — mizející stopa: širší a sytější u částice, úzká a průhledná vzadu.
Okamžitá gyrační kružnice i spojnice ke středu jemně čárkované. Změna B
a energie zachovává grafovou historii v pevném časovém okně; vysvětlení
posunu středu při změně poloměru doplněné v návodu. Odletělou částici
lze uchopit v aktuální poloze a přetáhnout dovnitř pro nový pokus.
Okolo označení B vynechané značky mřížky, podklad průhledný. Test driftu
včetně skutečného uchopení po ukončení a navigace prošel, obě dodávky
aktualizované. Bez vizuální kontroly a bez pushe.


Pauza: v rovinných pokusech lze přetáhnout částici z aktuální polohy
a připravit nové místo startu; platí i pro gyraci a oba rovinné drifty.
Křivostní prostorový pohled zachovává tažení pro otáčení kamery.
Test driftu a navigace prošel, obě dodávky aktualizované.


Drift — aktuální chování po odletu nahrazuje zastavení vlevo: částice
po opuštění viditelné plochy automaticky respawnuje do připravené polohy
a běží dál, se současnou energií a směrem nastavení. Čas a historie grafu
pokračují, skok je přerušený v grafu i stopě. Technický graf má neutrální
osy, jemnou pravidelnou mřížku, pět polohových úrovní, časové dílky
a čárkovaný průběh středu. Měřítka zůstávají pevná. Regrese ověřuje
skutečný návrat zpoza okraje a další běh/pauzu/tažení. Test driftu,
navigace a progressive prošel; obě dodávky aktualizované. Bez prohlížeče.


Drift — stabilní spodní lišta: pevná výška 50 px, pevné sloupce pro čas
a rychlost, čas má rezervovaných 250 px a zarovnání doprava. Změna počtu
číslic ani přechod na exponenciální sazbu neposouvá rychlost a ostatní
ovládání. Obě dodávky přestavěné; navigační kontrola prošla. Bez prohlížeče.


Drift — měřítko scény ukotvené v levém dolním rohu nad poznámkami,
malá bílá karta s měrnou úsečkou a hodnotou. Umístění nezávisí na
fyzikálních souřadnicích. Test driftu/navigace prošel, obě dodávky
aktualizované. Bez prohlížeče.


Gyrace — porovnání vedle sebe: ovladače Přidat vedle / Odebrat v pokusu
gyration. Až dvě doplňkové částice z nabídky proton/deuteron/alfa/elektron,
vlastní hmotnost, náboj, stopa a popisek; společné B, energie, úhel a čas.
Bez vzájemných sil. Doplňkové částice používají přesný homogenní magnetický
oběh, aby elektron nevyžadoval tisíce subkroků při iontové časové stupnici.
Graf a číselné údaje zůstávají hlavní částici, vysvětleno v návodu.
Přidání/odebrání připraví nový pokus. Živé B/energie mění i doplňkové
částice. Test skutečných ovladačů ověřil tři renderované částice, jejich
pohyb, limit počtu, živé změny a odebrání. Drift/navigace/progressive
prošly, obě dodávky aktualizované. Bez prohlížeče a bez pushe.


Drift — respawn nyní znamená návrat na připravený start a čekání na Spustit,
nikoli automatický další běh. Živé změny B/energie zachovávají připravenou
fyzikální startovní polohu (dříve se přepsala původním měřítkem modelu
a návrat mohl skončit mimo obraz). Návrat ukončí i aktuální dávku kroků.
Měřítko má bílou kartu pouze v gyraci; vlet i další pokusy bez podkladu.
Test driftu/navigace prošel a obě dodávky aktualizované, bez prohlížeče.


Drift — návrat v hlavičce sjednocen na orámované tlačítko ← Zpět; cíl
zůstává skupina Plazma a fúze, celý název v title a aria-label. Obě
dodávky aktualizované; navigační kontrola prošla. Bez prohlížeče.


Vlet — přepnutí druhu částice za běhu zachovává polohu, směr, čas,
historii i stav běhu/pauzy. Rychlost se upraví podle nové hmotnosti při
stejné zvolené kinetické energii. Měřítko a připravený start zachovány.
Test skutečného přepnutí za běhu i v pauze a navigace prošel; obě
dodávky aktualizované. Bez prohlížeče.


Gyrace — při pauze lze myší rozmístit hlavní i obě přidané částice
samostatně. Ostatní se nepřesouvají, restart zachovává uložené rozmístění.
Přesun v historii oddělený, nikoli fyzikální skok. Test skutečného tahu
přidané částice ověřil neměnnost zbývajících a zachování po restartu.
Drift/navigace prošly, obě dodávky aktualizované, bez prohlížeče.


Drift — na výslovné přání uživatele automatické rozšíření polohové osy
grafu při přesahu průběhu. Zaokrouhlené dílky 1/2/5, rezerva, rozsah se
nezmenšuje. Krátký oranžový panel Přizpůsobení os uvnitř horního okraje
grafu (1,7 s), bez změny rozměrů a bez zásahu do scény/pole. Časové okno
a historie zůstávají. Regrese skutečných ovladačů ověřuje překročení,
zobrazení a zmizení panelu i zachování rozšířeného rozsahu. Drift/navigace
prošly; obě dodávky aktualizované. Bez prohlížeče.


Gyrace — nabídka a Přidat vedle odstraněné. Čtyři přímé checkboxy pro
proton/deuteron/alfa/elektron, lze zobrazit všechny čtyři; poslední nelze
vypnout. Původní nabídka Částice v gyraci skrytá, v ostatních pokusech
zachovaná. Graf výslovně uvádí hlavní částici. Rozmístění přidaných částic
uložené podle druhu, nikoli indexu. Regrese ověřuje zapnutí elektronu,
všech čtyř částic, vypnutí i ochranu poslední. Test driftu/navigace/
progressive prošel, obě dodávky aktualizované. Bez prohlížeče.


Gyrace — elektron zvýrazněný: značka stejně velká jako ostatní, jemný
modrý prstenec a samostatná lupa oběhu vpravo dole, s fyzikálním rL.
Lupa používá stejný čas a aktuální radiální směr, nezpomaluje elektron
odlišně a nemění měřítko hlavní scény. Test ověřuje přítomnost detailu
a čitelné značky. Drift/navigace prošly; obě dodávky aktualizované.
Bez prohlížeče.


Drift — oprava nulových popisků os: přesnost se odvozuje od rozestupu
dílků, záporná nula normalizovaná. U malých rozsahů automaticky µm místo
mm a ns místo µs, jednotka uvedená na ose. Regrese pro všechny čtyři
druhy ověřuje pět různých hodnot na každé ose a absenci záporné nuly,
skutečnou sazbu KaTeX. Drift/navigace prošly, obě dodávky aktualizované.
Bez prohlížeče.


Gyrace — checkboxy nyní zachovávají aktuální stavy, čas, historii a běh
částic. Přidaná částice vznikne v aktuálním společném čase; vypnutí hlavní
předá graf existující vybrané částici. Společný krok všech částic vychází
z nejkratší gyrační periody: elektron tak zpomalí celou simulaci a jeho
skutečný oběh je rozlišený. Přidání/odebrání elektronu oznámí krátký
oranžový panel (2,4 s). Regrese ověřuje běh při checkboxech, nezměněnou
polohu/čas při přidání, zpomalení iontu a zmizení panelu. Drift/navigace
prošly, obě dodávky aktualizované, bez prohlížeče.


Gyrace — logaritmický posuvník rychlosti 0,1× až 10000× umožňuje sledovat
ionty i při zapnutém elektronu. Homogenní gyrace hlavní i dalších částic
používá přesný oběh a společný čas; omezený počet vzorků na snímek brání
zahlcení při vysoké rychlosti. Návod uvádí nerozlišené oběhy elektronu
při rychlém přehrávání a možné aliasování. Ostatní pokusy mají původní
maximum 3×. Regrese ověřila 10000×, konečné souřadnice a viditelný pohyb
iontu s elektronem. Drift/navigace prošly, obě dodávky aktualizované.


### Drift – společné prostorové měřítko (16. 11. 2026)
- Opraveno optické sjednocování drah při změně druhu částice: scéna používá pevnou referenci deuteronu při 500 eV a 5 T, nezávisle na vybrané částici. Alfa částice má při stejné energii a poli přibližně 70,5 % poloměru deuteronu.
- Regresní test kontroluje poměr skutečně vykreslených průměrů kružnic na canvasu po samostatném spuštění obou druhů částic.

### Drift – porovnání gyrace a historie vletu (16. 11. 2026)
- Gyrace místo časového grafu zobrazuje všechny vybrané částice: společné lineární pruhy Larmorových poloměrů, číselné poloměry v mm a periody v ns. Změny energie/pole se promítají za běhu.
- Časové grafy ostatních režimů zachovány; historie se ořezává podle zobrazeného časového okna s jedním předcházejícím bodem, nikoli pevného limitu 1440 vzorků. Střed dráhy má výraznější čáru.
- Vlet elektronu používá vlastní jemnější prostorové měřítko; gyrace ponechává společnou referenci deuteronu. Při přepnutí mezi elektronem a iontem se prostorové umístění přepočte tak, aby částice zůstala na stejném místě obrazovky; čas a běh pokračují, graf označí polohový skok přerušením čáry.
- Testy ověřují poměr pruhů, živé hodnoty, úplné časové okno i viditelnost elektronového oblouku a zachování běhu.

- Drift (16. 11.): samostatný elektron nyní používá jemnější pevné prostorové měřítko také v elektrickém, gradientním a křivostním driftu. Reference měřítka se volí při výběru částice, změny B a energie ji nemění; gyrace nadále používá společné měřítko. Testována viditelnost dráhy i pohybu ve všech třech režimech.

- Elektron: odstraněny dva ostré zvýrazňovací kruhy (poloměry 19/24 px), nahrazeny menší jemnou radiální září do průhledna s poloměrem 17 px.

- Gyrace: kolečko myši mění zoom kolem kurzoru (0,25 až 100 násobek), dvojklik obnoví výchozí pohled. Měřítko má stabilní délku na obrazovce a odpovídající fyzikální hodnotu. Přetahování respektuje zoom a posun kamery, přiblížení nezastaví animaci ani nespustí respawn mimo výřez. Ověřeno regresním testem.

- Gyrace: prostorová ortografická kamera ovládaná tažením pozadí, funkční i za běhu bez změny fyzikálního stavu. Dvojklik obnoví kolmý pohled a zoom. Kolečko i přesouvání částice v pauze používají bázi natočené kamery; přesouvání probíhá v rovině obrazovky. V nakloněném pohledu jsou modré prostorové siločáry se směrem B a stopa pokrývá až 2,5 periody. Úhel od příčné roviny má rozsah -90 až +90 stupňů. Testováno otáčení za běhu, zoom pod kurzorem a přesouvání v nakloněném pohledu i znaménko podélné rychlosti.

- Gyrace: průběžný přechod z horního okraje na dolní a opačně pro hlavní i přidané částice, bez zastavení či změny rychlosti. Zlom stopy je označen breakBefore. Přechod respektuje kameru a zoom.
- Všechny číselné posuvníky nyní používají živou aktualizaci; zejména úhel mění složky rychlosti bez restartu času či polohy. Test ověřuje opakované přechody oběma směry a kontinuitu času/polohy při změně úhlu.

- Gyrace, natočené pole: rozšířena matice z 3 × 3 na 7 × 7 siločar, příčný rozsah z 6 na 9 referenčních délek, podélná délka zkrácena z 8 na 5. Širší a kratší prostor pro posouzení čitelnosti při rotaci.

- Oprava návratu gyrace: hranice se kontroluje podle gyračního středu a pouze při viditelném podélném pohybu. Přesun probíhá výhradně podél B (osy z), bez posunutí příčného středu kružnice. Samotné kroužení už nespouští teleport. Stopa se kreslí až od posledního přerušení, takže po návratu nezůstává oddělený oblouk na opačném konci. Regresní test kružnice u horního okraje prošel.

- Magnetické udržení: značka deuteronu sjednocena na D⁺ místo ²H⁺, v popisku přes KaTeX.

- Plynulejší ohýbání: krok posuvníku 0,001; při tažení plášť 96 × 32, po 140 ms klidu návrat na 192 × 64. GPU cesta nepočítá zbytečně CPU osvětlení každé plošky, sdílí převody barev a nemění rozměry framebufferu při každém snímku. Projekce bodů siločar jen jednou. Ideální geometrie bez čekání na worker. Návrh uživatele: propojit solenoid a uzavírání do navazujícího pokusu s únikem částice; zatím diskuse, neimplementováno.

## Místní aktualizace webu — 18. listopadu 2026

Při kontrole zde byla čistá main na 7a9914e a hotový web ze 16. listopadu.
Proveden git pull --ff-only na 01f70f3 (25 novějších commitů včetně LFS).
Samotný pull neaktualizuje ignorovaný versions/aktualni/web; následovalo
úplné sestavení a úspěšné node tools/project/check.cjs včetně auditu.
Windows opět hlásil UNKNOWN při přímém přepisu velkého integrovaného HTML,
i mimo sandbox. Sestavení dokončeno s dočasným lokálním preloadem
 tmp/build-atomic.cjs pro atomický zápis tohoto souboru (NODE_OPTIONS).
Nejde o novou závislost sestavení. Sledovaný generovaný vstup byl po sestavení
obnoven z ověřeného místního LFS objektu aktuálního commitu.
Prohlížeč nebyl otevřen, push ani commit neproběhl. Označení zůstává 1.0.
## Celá obrazovka a spodní lišty — 18. 11. 2026
- Společná navigace zachytává tlačítka celé obrazovky před lokálními handlery, takže jeden klik nepřepíná dvakrát. Náhradní zobrazení zůstává použitelné i bez Fullscreen API nebo po odmítnutí požadavku. Fúzní vložené moduly přepínají hlavní okno; dostupný návrat a Esc.
- Spodní souhrny .statusline skryty v pracovní ploše (včetně řádku Asynchronní motor pod lupou). Vysvětlující patičky .footer/.footnote/.footerbar, .mathnote a driftová .sceneFoot přesunuty do společného výkladu; zachována živá měření a ovládací prvky. Hystereze neponechává prázdné pevné řádky po patičkách.
- Automatické ověření: všechny 30 vložené lekce, opakované rozměrové kontroly a test vstupu/výstupu z fullscreen při podporovaném, chybějícím i odmítnutém API. Prohlížeč automaticky neotevřen; skutečné uživatelské gesto v prohlížeči není tímto testem ověřeno.

- Dodávka sestavena, cílené kontroly fullscreen/rozměrů, společného výkladu, progressive, navigace fúze a audit veřejných souborů prošly. Celkové check.cjs zastaveno na souběžně rozpracovaném test-tokamak-equilibrium.cjs (choose: chybějící D.series[series]); nesouvisí s touto úpravou. Generovaný integrovaný vstup po sestavení vrácen do stavu Git, vlastní změny zůstávají ve sdílených upravitelných zdrojích.

### Navazující zpřesnění konstrukce ITER (18. 11. 2026)

Konstrukční zobrazení přepracováno na 18 D-cívek s rovnou vnitřní větví, 9 sektorů komory a 54 divertorových kazet s objemovými terči a středovou částí. Vlastní parametrická ilustrace, nikoli import STL či výrobní CAD. Jednotný poloviční řez všech konstrukčních sestav. Přepínač Konstrukce ITER automaticky zapíná celkový záběr. Výpočtová data 97 rovnováh a povrchy dopadu siločar zůstávají stejné. Kontrola rovnováh a vykreslení konstrukce s řezem i bez řezu prošla; aktualizovány obě místní webové dodávky. Bez push.

### TF cívky a demonstrace součástí (18. 11. 2026)

TF cívky odděleny od konstrukce a standardně zapnuty. Vlastní přepínače TF / PF a solenoid / konstrukce. Nabídka Ukázat zvýrazňuje TF, PF, CS, komoru či divertor; u TF doplněn směr toroidálního pole. Výběr nemění fyzikální stav, prostorový celkový záběr nezmenšuje detail řezu. Ověřeny výběry, reset, výchozí viditelnost a 97 rovnováh. Aktualizována místní webová dodávka, bez push.

### Ostrost a konstrukční pohled ITER (18. 11. 2026)

Canvas a WebGL respektují zvětšení modulu i DPR, mapy řezu nemají pevné nízké rozlišení. Pouzdra mají ostré hrany a ocelové odstíny; paneláž a vinutí teplé odlišení. Přidána hrdla komory a intercoil spoje, řez otevírá přední polovinu. Test tokamaku a confinement rendereru prošel. Aktualizována místní dodávka; bez push. Podrobnosti a omezení v docs/fuze/iter-divertor-2026-11-18.md.

### Rozložení Divertoru a popisky grafu (18. 11. 2026)

Prostřední řez zúžen z 55 % na 44 % scény, prostorový pohled rozšířen na 56 %. Popisky profilu mají společný počátek a rozměry s canvasem; horní jednotka a dolní souřadnice jsou uvnitř grafu, maximální hodnota je v samostatném levém okraji mimo hrot osy. Test tokamaku prošel, místní web přestavěn. Bez push.

### Názvosloví knihy a q95 (18. 11. 2026)

Divertor: samostatné přepínače Vakuová nádoba / Blanket a první stěna; názvy magnetické indukce rozepsané. Zdroje knihy doplněné v dialogu. Vlastní q95 se nově vyhodnocuje z pole a zobrazuje; reference 2,48 proti přibližně 3 pro základní scénář ITER. Model zatím nemá kalibrovaný profil proudu a q na ITER, výklad tuto odchylku přiznává. Další fyzikální zpřesnění vyžaduje úpravu vstupních profilů a nové řešení rovnováh. Aktualizována místní dodávka, bez push.

### Nádoba, kolize a SOL (18. 11. 2026)

Vakuová nádoba nyní viditelná standardně, dvouplášťová s mezerou a příčkami. Ocel a wolfram v odstínech kovové šedi podle materiálů. Přibližný TF obrys opraven proti kolizi s PF6 (vzorkovaný odstup 0,139 m; není úplnou CAD kontrolou). SOL ořez končí na první materiálové překážce, nepreferuje terče za stěnou. Dopady vyznačené; výklad podle Entler–Kindl doplněný o odborné ITER School zdroje a omezení numerické sítě/transportu. Jediné tlačítko výkladu díky existujícímu sjednocení theory/explanation. Test 97 stavů a regrese první stěny prošel. Podrobnosti v docs/fuze/iter-divertor-2026-11-18.md. Bez push.

### Užší řez a barevné vrstvy (18. 11. 2026)

Řez 37,4 % scény (−15 % proti předchozím 44 %), prostor 62,6 %. Funkční měděné odstíny TF/PF/CS, ocelová modrošedá nádoba, teplý světlý blanket s vlastním objemem, tmavá wolframová první stěna/PFC. Oddělení první stěny, blanketu a nádoby vysvětleno ve výkladu. Tloušťky ilustrativní. Dodávka aktualizovaná lokálně, bez push.

### Technický render a viditelnost (18. 11. 2026)

Checkbox bloky vpravo nahoře nahrazují Ukázat; samostatné TF/PF/CS, nádoba, blanket/první stěna, divertor. Divertor používá kontrastnější technický režim sdíleného rendereru, kovové odlesky a explicitní hrany. Mapy neosvětlené. Testy tokamaku a Three mesh builderu prošly, GL vzhled v prohlížeči neověřen. Přestavěny místní dodávky, bez push.

### Popisky CS a srozumitelný pohyb značek (18. 11. 2026)

Popisky CS3U–CS3L přesunuty doprava vedle jednotlivých cívek s levou kotvou textu; nekříží sloupec svislé osy ani její číselné popisky. Velikost scény zachována. Sekční viditelnost CS nyní reaguje na samostatný CS checkbox. Spustit nahrazeno Rozpohybovat značky / Zastavit značky s aria-pressed a tooltipem. Zapnutí animace zapíná viditelnost směrových značek; skrytí značek animaci zastaví. Nejde o spuštění plazmatu ani časový vývoj rovnováhy. Test ověřuje oddělení sloupců popisků a chování tlačítka. Web přestavěn lokálně; bez push.

### Souvislá nádoba (18. 11. 2026)

Odstraněna bloková konstrukce nádoby z obdélníkových pásů. Dva pláště nyní tvoří spojitou zakřivenou skořepinu bez rastru hran a vnitřních příčných destiček; uzavření pouze na řezu. Modulové bloky ponechané u blanketu. TF/PF výrazněji odlišené světlou zlatavou a červenohnědou měděnou. Sektory skutečné nádoby se svařují, nejde o oddělené bloky. Podrobnosti v docs/fuze/iter-divertor-2026-11-18.md. Bez push.

### Vzhled podle reference FUSION INDUSTRY (18. 11. 2026)

Na odkaz uživatele https://fusionindustry.jp/en/technology/3d/tokamak přepracována vlastní ilustrace: TF ocelový rám se sraženými hranami + samostatné vinutí, PF/CS vrstvené povrchy, linie vinutí CS a táhla, podpěrné patky TF. PBR kovy s vlastní procedurální mapou odrazů, tmavé pozadí pouze prostoru. Zachovány mapy a numerická pole. Nepřebírá se cizí model ani kód. Konstrukční detaily nadále ilustrativní, výstup skutečného GL v prohlížeči neověřen. Podrobnosti a testy v docs/fuze/iter-divertor-2026-11-18.md. Lokální sestavení, bez push.

### Místní oficiální model ITER a měřené oblouky TF (18. 11. 2026)

ZIP v Downloads byl ověřen: stejná v2.0, 54 položek. Čtyři soukromé referenční díly uložené v docs/fuze/podklady/iter-model s CRC/SHA-256. Ze STEP hlavního pouzdra TF ověřeny oblouky a šířka; vlastní webová geometrie upravena podle těchto číselných parametrů, bez přibalení převzaté sítě. Opravené normály kovů zachovávají ostré hrany; zesvětlené odrazové prostředí. Kontrolní render exportované geometrie vytvořen v Blender/Cycles (není screenshot WebGL). Automatická kontrola odmítla čtení nesouvisejících karet Chrome, dál se v něm nepokračovalo; skutečný webový GL výstup vizuálně neověřen. Podrobnosti a limity viz docs/fuze/iter-divertor-2026-11-18.md. Lokální sestavení; bez push.

### Světlý Divertor, PFC a výkon (18. 11. 2026)

Světlý podklad obnoven. Samostatné Kazety divertoru / PFC divertoru; wolframové členění obou terčů a dómu, oddělený chladič a ocelová kazeta. Geometrie dómu přidána do prvního materiálového kontaktu, nikoli do nového řešení pole. Při otáčení se nově znovu používají GPU sítě a mění se jen matice; pole se nepřepočítává. Cache světové geometrie, jediné vyhodnocení barev po obrysu, řádková maska rastru a lehčí síť nádoby. Kamera neobnovuje řez ani grafy. Předvolby ploch prolínají hotové obrazy. Testy ověřují skutečnou identitu Three geometrie a shodu projekce i PFC, dopad na dóm a ovládání. Detaily, zdroje knihy a omezení viz docs/fuze/iter-divertor-2026-11-18.md. Lokální dodávky aktualizované; bez push.

### Opravené překreslování Divertoru (18. 11. 2026)

Opraveny dvě regrese optimalizace: cache prostoru se nyní explicitně maže před kopií průhledného snímku a čtvrtá pomocná složka bodu siločáry phi se nikdy nezapisuje do XYZ bufferu. Otáčení ruší prolínání starého pohledu. Pixelový test s reálným canvasem ověřil smazání starého pixelu, Three test ověřil přesné XYZ a celé páry konců úseček. Výpočty plazmatu zachované. Podrobnosti v docs/fuze/iter-divertor-2026-11-18.md. Lokální sestavení, bez push.

### Stabilní pohled a PF (18. 11. 2026)

Checkboxy vpravo nahoře jsou ve dvou širších řadách. PF fungují samostatně; vazba viditelnosti na TF odstraněna. 3D měřítko vychází stále z celého stroje a nemění se při přepínání částí. Zoom 0,3–4× ponechán na myši. Celý řez mění jen 2D rozsah, nádoba jej sama nepřepíná. Three test ověřil všech šest samostatných PF a stejné matice kamery před/po změnách viditelnosti. Progressive a navigace prošly; místní dodávky aktualizované, bez push.

### Izočáry, SOL a karta proudů (18. 11. 2026)

Tlaková mapa oříznuta vektorovou křivkou psi_N=0,999 místo zubaté masky. Analytické bilineární izočáry zjemněné uvnitř buněk při zachování toku; opraven asymptotický rozhodovač sedlové buňky. Data 97 stavů zachována, křivka 0,999 ověřena ve všech. SOL a výřez soukromého toku mají jemné kvalitativní šrafování, popisky a legendu; nejde o transportní šířku ani tlak v SOL. Graf proudů v zarovnané kompaktní kartě s popisky uvnitř, stabilní škálou podle celé řady a názvy PF v dolní řadě. Testy fyziky, analytického sedla, Three geometrie a kompaktního grafu prošly. Obě místní dodávky aktualizované, bez push. Podrobnosti v docs/fuze/iter-divertor-2026-11-18.md.

EM krátký balík zkrácen z pěti na dvě periody buzení v CPU i GPU modelu;
doplněn test klidu zdroje po konci balíku.

18. 11. 2026 — Divertor: po revizi uživatelem jemná technická siločára (1,8 px řez / 2,1 px prostor, úzký světlý lem a malé plné hlavy). Výchozí plazma růžovofialové bez mapy; kvantitativní mapy zůstávají volitelné. Čtyři dolní prvky mají číselné značky a klíč vpravo bez dlouhých křížících se spojnic. Separatrix a SOL mají krátké odkazy. Ověřeno rozložení 380×540, 580×600 a 800×600, canvasové náhledy s přibližným textem prohlédnuty. Test 97 stavů, skutečných Three geometrií a confinement prošel. Podrobnosti docs/fuze/iter-divertor-2026-11-18.md. Bez push.

## 18. listopadu 2026 — viditelný budicí proud při fázování

Uživatel před sepnutím nenašel ovladač budicího proudu: dosud byl nepřímo
zastoupen ovladačem Napětí generátoru. V modulu sm12-synchronizing je nyní
přímo posuvník Budicí proud, v poměrné hodnotě Ib/IbN (0,75 až 1,25),
s vedlejším údajem odpovídajícího sdruženého napětí. Lineární vztah
Ug/UN=(Ib/IbN)(fg/fN) používá UN=400 V a fN=50 Hz; proud v ampérech
se bez parametrů budicího vinutí nevymýšlí. Změna frekvence zachovává
budicí proud a mění napětí. Stávající předvolby zachovávají své elektrické
počáteční stavy. Po sepnutí je ovladač nadále zamknutý pro pevný záznam.
Návod výslovně popisuje normalizaci a zanedbání saturace.

Lokální DOM test synchronizing/test-synchronizing-ui.cjs prošel (doplněna
maketa window.addEventListener pro novější zvukový modul), včetně změn
buzení před sepnutím, obou spínačů, předvoleb, fázorů a KaTeXu.
Prohlížeč neotevřen; bez vizuální kontroly a bez pushe.

Dokončení: aktuální dodávka přestavěna; po obnovení manifestu progresivního načítání prošla celá sada tools/project/check.cjs. Bez pushe.

Plazma: doplněn posuvník Hustota siločar 0,5–4×, výchozí 1×.
Mění počet startů siločar v synchronním i worker rendereru; hustota
je součást klíče cache i identifikace pohledu. Fyzikální síly nemění.
Aktuální výstupy a manifesty aktualizovány.

Oprava dodávky plazmatu: po cílených změnách je nutné vždy spustit
tools/build-progressive-web.cjs; rozcestník načítá zabalený dokument,
nikoli přímo fuze-plazma/index.html. Oba balíky nyní přestavěny a
ověřena přítomnost lineDensity i opravy únikové energie v lazy modulu.


## Obíhající elektron v modulu Plyn a plazma — 18. listopadu 2026

Neutrální atom má modrý elektron na obvodu obalu. Fáze oběhu používá
čas modelu, takže respektuje pauzu i rychlost přehrávání. Při ionizaci
se volný elektron připraví přímo v poloze vázané značky a pokračuje
radiálně ven se zachovanou přípravou únikové energie a zpětného rázu.
Poloměr obalu je společný pro model a kreslení, nezávislý na kameře.
Vázaná značka není volný náboj ani zdroj elektrického pole. Výklad
výslovně odlišuje názorné obíhání od skutečné trajektorie v atomu.
Regrese plazmatu prošla včetně návaznosti uvolnění a dvaceti únikových
stavů; pro větší počáteční vzdálenost ověřuje odtržení po delším čase.
Prohlížeč automaticky neotevřen; vzhled v prohlížeči neověřen. Bez pushe.

18. 11. 2026 — Plyn a plazma: zmenšen poloměr vázaného i volného elektronu z 0,52 na 0,20 násobku základní kreslicí velikosti. Vázaný elektron má přibližně polovinu průměru protonu v atomu (0,20 / 0,38); při ionizaci se jeho velikost nemění. Obě aktuální dodávky včetně lazy balíků přestavěny. Kontroly plazmatu, syntaxe a progressive prošly; bez pushe.


## Magnetické přepojení a vznik ostrova — 18. listopadu 2026

Přidán fu08-ostrovy jako místní lineární MHD experiment: Harrisova
proudová vrstva, útlum a růst stejné malé poruchy, vypočtené siločáry,
profil proudu, časový graf, pauza a krokování. Data mají hash modelu,
test ověřuje časovou/síťovou konvergenci i bilanci energie poruchy.
Růst končí na W/a=0,12, bez předstírané nelineární saturace. Prostorový
tokamak, NTM a ECCD zůstávají navazující rozšíření. Podrobnosti a přesné
meze v docs/fuze/magneticke-ostrovy-navrh.md. Canvas siločar prohlédnut,
celá stránka v prohlížeči neotevřena. Přidáno lazy načítání, bez pushe.


Ostrovy — přepracování názornosti: výchozí schéma tokamaku → řez →
místní vrstva, čtyři navazující kroky, proud a jeho směr, zvýrazněná
toková kontura před/po přepojení, vypočtené proudění a X-body uvnitř
obrazu. Výpočetní data beze změny. Canvasové náhledy prohlédnuté,
celá stránka v prohlížeči neotevřena; podrobnosti v návrhu ostrovů.

### Ostrovy — souvislý prostorový pohled, 18. 11. 2026
Odstraněn postup čtyřmi prezentačními kroky. Modul má otočný torus, posuvný řez a současně místní detail. Stejná vypočtená amplituda řídí všechny pohledy; toroidální geometrie je analytická ilustrace 2/1, šířka zvětšena 4×. Numerické a integrační testy prošly; aktivní web přestavěn, bez push. Podrobnosti v docs/fuze/magneticke-ostrovy-navrh.md.

### Ostrovy — důraz na příčinu a místní detail (18. 11. 2026)
Prstenec zmenšen na orientační sloupec spolu s řezem; hlavní plochu zabírá rozvinutá vrstva. Vodicí čáry spojují aktuální polohu řezu v toru s řezem a vybranou vrstvu s detailem. Doplněna kóta šířky ostrova a popisky s odkazy na pole, proudění, přepojení a střed ostrova. Obráceno tažení myší v obou osách; konvence zapsána v AGENTS.md a ověřena testem. Test-islands a test-fusion-navigation prošly, aktivní web přestavěn; canvas detail ověřen snímkem. Celý prohlížeč neotevírán, bez push.

### Ostrovy — porovnání neporušeného pole (18. 11. 2026)
Po zpětné vazbě ze snímku: výchozí příčný rozsah zmenšen na ±0,07a, redukován počet kontur, plocha ostrova podbarvena. Doplněno schéma proudu od pozorovatele a opačných příčných složek pole, přepínač porovnání bez poruchy při stejném čase/měřítku a šedá referenční kontura pevného toku. Odstraněny dlouhé propojovací čáry přes text. Výslovně uvedeno, že počáteční nenulová porucha již obsahuje malý ostrov a výpočet neřeší její původ. Test ostrovů ověřuje i zachování času při porovnání; test navigace prošel. Canvas kontrolován; prohlížeč neotevírán. Bez push.

### Ostrovy — svislé ovládání (18. 11. 2026)
Podle dalšího upřesnění uživatele obrácena pouze svislá osa vůči předchozí opravě: tažení dolů zvyšuje elevaci, doprava snižuje azimut. AGENTS.md i test upraveny. Test-islands prošel, aktivní web přestavěn.

### Hodinové číslo transformátoru — kompaktní ovládání

Předvolby a sbalená volba vlastního zapojení sdílejí řádek. Otevřený editor
využívá celou šířku. Ve vloženém modulu odpadl samostatný úvodní řádek.
Aktuální místní balíčky aktualizovány, kontrola načítání prošla.
Vizuální kontrola v prohlížeči neproběhla. Bez pushe.

### Menší mezery a graf rozběhu

Společná mezera v hlavních skupinách panelů a transformátorovém rámci
snížena z 12 na 8 px. Kresby příčné větve a rozptylové reaktance využívají
volnou výšku. Graf momentu v pokusu s odporem rotoru přepočítává osy a
křivky podle skutečné velikosti SVG, takže necentruje pevný obdélník.
Místní balíčky a manifesty aktualizovány. Kontrola načítání prošla.
Vizuální ověření zbývá. Bez pushe.

### Vizuální kontrola využití plochy

Otevřené okno Chrome s Matematickým transformátorem bylo nalezeno.
Prostředí zamítlo přístup k oknu, takže vizuální průchod neproběhl.
Pro každou cestu v tabulce výše ověřit běžné okno a celou obrazovku
při nastavení 1920 × 1080 a 125 %. Zkontrolovat mezeru mezi panely,
výšku ovládání, okraje uvnitř SVG a využití plochy při změně režimu.
U každého nálezu zaznamenat modul, režim a snímek před opravou a po ní.
### Předání k publikaci — 20. listopadu 2026

Odeslání na origin/main schváleno. Tato dávka navazuje na commit 43a2998.
Obsahuje menší mezery a okraje, kompaktnější ovládání Matematického
transformátoru a Vlastní a vzájemné indukčnosti, pružnou výšku grafiky
u Ztrát vířivými proudy a zalamování hlavičky Skin a proximity podle místa.
U odporu rotoru je větší řez a momentová charakteristika přepočítává
souřadnice podle velikosti panelu. Stav je pod grafem a pokyny k pohybu
jsou ve výkladu. Aktuální místní výstup je ve versions/aktualni/web.
Kontroly načítání, škálování a veřejného seznamu souborů prošly.
Plošná vizuální kontrola v prohlížeči zůstává otevřená.
GitHub Pages se sestaví po odeslání.

### Škálování tlačítek v hlavičce

Hlavička dříve přebírala pouze výslednou šířku modulu. Nyní se měří
v návrhové šířce a celá se škáluje společně s obsahem, včetně tlačítek
a textu. Testy měřítka, synchronních modulů a načítání prošly.
Vizuální ověření při 1920 × 1080 a 125 % zbývá.
Balení na druhý počítač zůstává pozastavené. Tato oprava je součástí odeslání na origin/main.

### 21. 11. 2026 — rozdělení indukovaného napětí

Původní odkaz `#em01-indukovane-napeti` otevírá transformační napětí dvou stojících cívek. Nový modul `#em01-pohybove-napeti` otevírá pohyb tyče a přímo přepíná na posuv pole vůči stojící cívce nebo otáčení cívky. Oba pohledy skládá `versions/vyvoj/m_files/em-core/voltage-lesson.cjs` nad společným modelem. Počty závitů budicí a snímací cívky mají přímo viditelné posuvníky v horní řadě ovladačů. Scéna a graf mají dva hlavní panely a podrobný výklad je v dialogu.
Oba výklady obsahují totální diferenciál tokové vazby podle proudu a natočení a rozklad indukovaného napětí na transformační a pohybový člen.
V transformačním pokusu lze snímací cívce nastavit pevné natočení od 0° do 360° posuvníkem i tažením ve scéně. Graf počítá obě křivky se znaménkem vzájemné indukčnosti pro zvolenou polohu.

### 21. 11. 2026 — injektor NBI se zápornými ionty

V části Magnetické udržení a tokamak otevírá odkaz `#fu18-injektor` řez injektorem s grafem energie, zvětšeným detailem a krokováním. Plyn v neutralizátoru přepíná mezi tangenciálním vstřikem do plazmatu a dopadem na desku separátoru. Následuje původní ohřev `#fu15-nbi` s vlastním referenčním nastavením. Zdroj modulu je ve `versions/vyvoj/m_files/fusion/injector`, kontrola obou průletů v `tools/test-injector.cjs`.

V injektoru nyní sdílí horní řez a graf jeden řádek. Hlavní animace výboje plynule spojuje přílet elektronu, rozštěpení molekuly, nárazovou ionizaci druhého atomu a přenos elektronu z povrchu s cesiem. Detail přiblíží povrch a sleduje iont až k otvoru mřížky. Krokování i ruční posuv používají stejný čas jako změny náboje.
Čas přehrávání je odstupňován po komentovaných dějích. Každý průběžný popisek v dolní části obrazu má ve výchozí rychlosti alespoň tři sekundy, zásadní srážky a zachycení elektronu mají vlastní intervaly. Tlačítko kroku i posuvník synchronizují pohyb a komentář v obou variantách pokusu.
