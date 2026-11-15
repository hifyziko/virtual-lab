# PMSM: momentové řízení pohonu · 11. 11. 2026

- Výchozí momentové řízení: samostatný žádaný moment motoru, zátěž, momentová rampa a mez otáček. Změny požadavků jsou možné za běhu.
- Omezovač otáček a elektrické meze snižují skutečný moment; graf odlišuje požadavek, skutečnost, zátěž a dostupné maximum. Běžný momentový rozjezd může přirozeně dosáhnout MTPV.
- Otáčková rampa používá PI regulátor s anti-windup a momentovým limitem. Výuková ukázka maxima zůstává oddělená.

# PMSM: přehledné nastavení a explicitní spuštění · 11. 11. 2026

- Tři hlavní pohledy; samostatné spuštění, předvídatelná pauza a pokračování.
- Načtení ukázky připravuje parametry, změny nastavení připravují nový běh.
- Stav rozjezdu a důvod nemožného startu jsou viditelné u tlačítka. Doplňkové volby přesunuty do dialogů, nastavení křivek se zachovává.

# PMSM: mezní rozjezd zůstává na MTPV · 11. 11. 2026

- Nový výchozí režim Po maximální obálce požaduje při rozjezdu maximální přípustný moment a ukázku pozastaví při dosažení cílových otáček. Poslední bod zůstává na maximální obálce, bez následného přechodu na menší udržovací moment.
- Běžná rampa a rychlý rozjezd s regulací zůstávají samostatně volitelné. Vysvětlení rozlišuje pozastavenou ukázku od ustáleného fyzikálního chodu.
- Historie se uchovává nezávisle na obnovovací frekvenci; konec vzorového rozjezdu stále ukazuje začátek a průchod MTPA, odbuzováním a MTPV. Poslední vzorek vždy odpovídá aktuálnímu bodu.
- Kontrola pokrývá celý rozjezd do cíle, shodu koncového bodu s vykreslenou MTPV, zachování historie a opakování ukázky.

# PMSM: průchod MTPV, mez úplného odbuzení a společný panel · 11. 11. 2026

- Nová záložka Mez odbuzení ukazuje mezní proud, kompenzaci tokové vazby magnetů a dokončení MTPV až k meznímu bodu. Zřetelně rozlišuje přípustný mezní bod a cíl mimo proudovou či napěťovou mez.
- Vzorový rozjezd MTPV používá výchozí IPMSM, maximální dostupný moment, malou zátěž a větší setrvačnost; oblast MTPV je při rozjezdu skutečně dosažena. Po ustálení vysvětluje návrat k menšímu požadovanému momentu.
- Ovládání parametrů a rozjezdu je uvnitř jedné společné karty. Odstraněno duplicitní pravidlo řádků z hostitelských stylů.
- Hledání maxima sleduje zúženou napěťovou elipsu i při velmi vysokých otáčkách. Elektrická limita výkonu se počítá analyticky, nekonečné otáčky se neintegrují jako mechanický stav.

# PMSM: čitelná proudová mapa a skutečná stopa rozjezdu · 11. 11. 2026

- Proudová mapa pohonu používá souřadnice jako v přednášce SYNCHRONNI_5 a pevné měřítko při změně otáček. Fázorový modul zachovává původní orientaci komplexní roviny.
- Výchozí motorický výřez odděluje proudovou mez, aktuální napěťovou mez, momentový požadavek a optima MTPA/MTPV. Celé elipsy a další otáčkové meze jsou dostupné jako volitelné vrstvy.
- Opravena chybná trajektorie při rozjezdu: kreslí se skutečné proudové souřadnice historie, nikoli trajektorie jiného konstantního momentu.
- Režim maxima zobrazuje dosažitelný moment v ovladači. Výchozí požadavek je zvolen pro názorný průchod odbuzováním a omezením momentu.
- Při rozjezdu se výstupní proud, napětí a moment nově vzorkují po integračním kroku při stejných otáčkách jako mechanický graf; odstraněno zpoždění zobrazovaného pracovního bodu o jeden krok.
- Rovnice momentu, napěťové meze a optimalizace se nezměnily.

# Společné přizpůsobení oken ve všech sekcích · 11. 11. 2026

- Jeden společný rámec pro nativní i vložené moduly včetně pracovních verzí; měřítko vychází ze stabilní šířky a výšky okna a rezervuje navigaci a autorství.
- Odstraněna zpětná vazba od posuvníků a předchozího měřítka, ořez pravé strany a nevyužitá výška vybraných schémat a grafů.
- Hlavičky sledují vystředěný obsah, ovládání celé obrazovky je sjednocené; zvětšený graf se zobrazuje mimo škálovaný rodičovský panel.
- Výklad zachovává původní rozměry modulu a otevírá se nad ním. Výpočtové modely a matematické renderery zůstávají zachovány.
- Doplněny prohlížečové kontroly všech katalogových modulů a pěti pohledů FEM, změn velikosti, měřítka displeje a skutečných vstupních událostí.

# PMSM: celé grafy a přímý rozjezd · 10. 11. 2026

- Odstraněn ořez zprava způsobený vyšší specificitou pravidla rezervujícího posuvník. Oprava je omezená na nové PMSM moduly.
- Kompaktní společná lišta, tři kroky výkladu, větší grafická plocha a pevné rozměry napříč režimy.
- Momentová osa zahrnuje všechny složky; aktivní napěťové elipsy se vejdou celé. Neaktivní napěťová mez je výslovně označená.
- Volba Rozjezd rovnou spouští pohyb, včetně následné pauzy a pokračování.
- Bezokenní test: 22 kontrol rozložení, pět velikostí okna, všechny režimy, fullscreen a skutečný rozjezd. Snímky vizuálně zkontrolovány.

# PMSM: fázory, limity měniče a rozjezd · 10. 11. 2026

- Dva nové pracovní moduly: PMSM: proud, tok a moment; PMSM: limity měniče a rozjezd. Zařazeny jako sedmý a osmý blok synchronních strojů.
- Společný model se správnou normalizací d/q, proudovou mezí, napěťovým omezením včetně odporu, MTPA, odbuzováním a dosažitelnou MTPV.
- Ručně tažený proud, toková vrstva, napěťový polygon, magnetický a reluktanční moment. SPMSM/IPMSM používají společný renderer konstrukce stroje.
- Požadovaný moment a maximální obálka jsou oddělené experimenty; rozjezd respektuje momentovou rezervu, setrvačnost a konstantní nebo ventilátorovou zátěž.
- Originál SYNCHRONNI_5 a poznámky k opravám odvození jsou zahrnuty ve zdrojovém archivu.
- Prošlo 1245 numerických kontrol a testy ovladačů se striktní matematickou sazbou; zachovány testy principu stroje a kontrola navigace. Prohlížeč nebyl spuštěn, vzhled tedy čeká na vizuální připomínky.

# Transformace proudu do rotorových složek d–q · pracovní verze

- Nový samostatný modul sm08-rotor-dq: současný pohled ze statoru a z rotoru, tažení proudového vektoru i rotorových os, synchronní a pomalejší rotor.
- Fázové proudy a rotorové projekce ve společném čase; rovnice a číselný převod až v posledním kroku.
- Modelové i prohlížečové kontroly zahrnují invarianty transformace, myš, dotyk, klávesnici, stabilní kroky a čtyři šířky obrazovky.
- Dřívější modul potřeby složek d/q je schválený, označení pracovní verze bylo odstraněno.

# Pracovní modul: proč potřebujeme složky d a q? · 10. 11. 2026

- Nový modul sm07-dq: čtyři kroky, tažení směru i velikosti magnetického napětí, animace s pauzou a reverzací, přepínání hladkého a vyniklého rotoru, samostatná pole d/q a součet.
- Stávající numerické pole, společná normalizace proudu a měřítka; prostorový průběh B a první harmonická, návaznost na náhradní schéma.
- Ověřeny modelové vztahy, myš, dotyk, klávesnice, animace, rozlišení 390–1920 px a stabilní přizpůsobení oknu. Pracovní verze k připomínkám.

# Doplnění synchronních modulů podle literatury · 10. 11. 2026

- Momentová charakteristika: přepínatelné značky nulové synchronizační tuhosti a vyhodnocení statické větve. Kritérium zůstává vztažené k vnějšímu úhlu i při zobrazení vůči β′; zahrnuje Ra a vyniklost.
- Samostatný generátor: reference napětí naprázdno a procentní změna napětí při odlehčení při stejném buzení a otáčkách. Záporná změna při kapacitní zátěži je ověřena Chapmanovým číselným příkladem.
- Přechodové reaktance: doplněna rovnice kontinuity rotorové tokové vazby a rozlišení mezního stavu od skutečné časové trajektorie. Původní ilustrativní kalibrace modelu zůstává výslovně popsaná.
- Podklady: Fitzgerald, Chapmanův Instructor’s Manual a místní prezentace; Kopylov výslovně vyloučen. Konkrétní stránky, použití a omezení jsou zaznamenány v m_files/reference/synchronous/README.md a v rozbalovacím výkladu modulů.
- Grafická kontrola více pracovních bodů odhalila a opravila překrývání hodnot β/β′ pod miniaturním fázorákem; reference naprázdno má popisek v legendě, momentovka rezervu nad extrémy. Moduly zůstávají označené Rozpracováno.

# Dvoureaktanční fázory a nenápadný panel momentu/výkonu

- Schéma je na desktopu na 80 % původní velikosti; ponecháno vystředění Uib a popisek vpravo. Označení úhlu je nyní „zátěžný“.
- Samostatná záložka výkonové charakteristiky odstraněna. V hlavním fázorovém panelu je malý panel s momentovou a výkonovou charakteristikou, skutečným pracovním bodem, P, Q, |Ia| a účiníkem. Obě křivky jsou v poměrných jednotkách při stálé synchronní rychlosti; M* = Pem*. Přesná charakteristika vychází ze stávajícího modelu včetně Ra.
- Uživatel vybral učebnicový fázorový rozklad Id/Iq. V aktivním schématu vyniklých pólů není kosočtverec; je zde popsaný dvoureaktanční blok a ve fázorech příslušné samostatné úbytky. Blok je názornou kresbou anisotropního modelu, nikoli dvěma nezávislými fyzickými obvody.
- Ra je výchozí zapnutý a předvolby jeho stav zachovávají. Při zapnutí jsou Xad/Xaq a Xaσ (u hladkého Xa a Xaσ) oddělené; při vypnutí jsou sdružené do Xd/Xq, resp. Xs. Rozptyl ani význam Ui a beta se tím nemění. Předvolba účiníku jedna nově přesně zohledňuje i zapnutý Ra.
- Ověřena literatura Fitzgerald s. 284–286 a MIT/Kirtley, doplněny poznámky k podkladům. Testy pokrývají oddělené/sdružené reaktance, výchozí Ra, všechny předvolby, přesnou polohu obou pracovních bodů a sazbu KaTeX. Ovládání počítače nebylo použito.

# Kompaktní náhradní schéma a vystředěné buzení

- Samotná kresba náhradního schématu je na desktopu přibližně o 40 % menší; popisky mají kompenzovanou velikost písma. Zdroj Uib leží uprostřed mezi horní a dolní větví (y = 155) a jeho popisek je vpravo, ve stejné výšce.

# Synchronní stroj: schéma, rovnice a dominantní fázory

- Schéma je první položkou synchronních strojů, princip druhou; identifikátory a odkazy zachovány.
- Schéma je bez vlastní karty. Rovnice a trvale viditelné ovládání i parametry jsou pod ním; velký fázorový panel využívá dostupnou výšku. P, Q, |Ia| a účiník jsou v rohu tohoto panelu. Podrobnější vysvětlení a výkonová charakteristika zůstávají dostupné ve spodních rozbalovacích částech.
- Svorky jsou skutečně otevřené uzly; odstraněno svislé vodivé propojení mezi nimi. Svislou kladnou reálnou osou je nyní Ua na výslovný pokyn uživatele; zachována kladná Im doleva, orientace násobení j, a beta mezi Ui a Uib.
- Pro vyniklé póly je hlavní rovnice Ua − Ra Ia − jXq Ia − j(Xd−Xq) Id = Uib. Značení Uib bylo výslovně potvrzeno uživatelem podle přiloženého obrázku. Bez zkratky ΔUd; u hladkého rotoru člen vyniklosti ani jeho legenda nejsou. Xq/Xd zahrnují rozptyl. Volba zanedbání rozptylu odstraněna; Ra zůstává volitelný.
- Výpočet pracovního bodu a význam Ui se nemění. Ověřeny nezávislé síťové rovnice, 792 konstrukcí, 1200 náhodných parametrických zadání a 14 kombinací rotorů/předvoleb v UI bez prohlížeče. Automatické přizpůsobení dál zvětšuje i zmenšuje obsah stabilně.
- Uživatel výslovně zakázal ovládání počítače. UI automatizace nebyla provedena; původní pokus o přístup k existujícímu Chrome odmítla politika nástroje. Další kontrola probíhá jen v souborech a testech.

# Čistý průřez vinutím

- Na přání odstraněny barevné čáry čel propojující cívkové strany v modulu Od drážek k MMF. Zůstávají drážky, vodiče, jejich proudové značky a vypočtené pole.

# Proud při pohybu doleva a rozsah výkonu

- Grafické zobrazení proudu je čitelné pro obě znaménka i při malém proudu: dolní tečka má minimální viditelnou velikost a horní šipka minimální délku; proudové popisky a šipka se kreslí nad ostatními prvky. V nule značky mizí. Výpočet proudu a mechaniky se nemění.
- Pevný rozsah osy výkonu je nově ±50 W namísto ±6 W. Rozsah napětí/rychlosti zůstává stejný.
- Ověřena obě znaménka a proudy od 1 mA, pasivní energetická bilance i integrace rozhraní.

# Nenápadné ovládání a původní velikosti grafů

- Grafická úprava obou modulů: původní sdílená velikost grafických ploch, u MMF znovu zapojen původní přehled s větší horní řadou (1,65 : 1). Ovládání zůstává nahoře, bez předepsaných vysokých bloků ovladačů.
- Točivé pole má kompaktnější, barevně klidné ovládání; editory mají omezenou výšku nezávislou na počtu fází. Čisté vektorové plochy zůstávají. Výpočty a chování ovladačů beze změny.

# Obnovení původních proporcí grafů

- Odstraněna pevná výška 480 px, zvětšené hlavičky/legendy a předepsané sloupce jednotlivých ovladačů u MMF. Znovu platí původní velikosti panelů a poměr horní/dolní řady 1,65 : 1 u přehledu vinutí.
- Točivé pole má původní velikost sítě grafů se stejnými řadami; obsah canvasu neovlivňuje velikost řádků. Horní ovládání a pevně ohraničené editory zůstávají.

# Oprava horního ovládání a čisté vektorové diagramy

- V Točivém poli a Od drážek k MMF odstraněno boční rozložení; ovládání je nad grafy. V Točivém poli mají editory fází a harmonických pevnou výšku a velikostní izolaci, počet prvků se nepromítá do rozměrů celé stránky. Odstraněny 100% flexové báze a přepínání bočních sloupců.
- Vektorové panely Točivého pole používají čisté pozadí bez stupnic a číselné mřížky, se zachovanými stejnými měřítky os, orientací Re/Im, vodicími osami a kružnicemi. Časové a prostorové průběhy mají nadále číselné osy.
- Ověřeno generování a kreslení pro 1, 3, 5, 12, 24 a 1000 fází, stabilní struktura ovládání a opakované automatické přizpůsobení. Skutečné rozložení v prohlížeči nebylo při tomto běhu ověřeno; prohlížeč se dle projektové konvence nespouští.

# Ovládání, pole a uspořádání výukových modulů

- Točivé pole: otevřené ovládání v bočním panelu, seskupené přehrávání, pevné plochy grafů, legend a odečtů. Fázorová rovina má Re nahoru a kladné Im doleva.
- Od drážek k MMF: výchozí numerické pole, při čekání aktuální geometrie vinutí; barevná čela cívek sledují skutečný krok a obě vrstvy. Pevné plochy grafů a ovládání vedle nich.
- Čistě číselné nabídky ve výukových modulech nahrazeny diskrétními táhly se stejnými povolenými hodnotami a popisky. Synchronizace změn geometrie, resetu a zakázaných prvků; pojmenované režimy zůstávají nabídkami.
- Aktivní zdroje jsou ve versions/vyvoj; kořenový build-release.cjs je sestaví a publikuje do versions/aktualni. Zálohy se nemění.
- Ověření: modely vinutí/točivého pole, numerické pole a jeho worker, stavové změny táhel a opakované přizpůsobení oknu. Prohlížeč se dle konvence automaticky nespouští; skutečný layout tímto během nebyl vizuálně ověřen.

# Dvě projekce jednoho skutečného obvodu

- Horní a dolní pohled mají shodnou polohu tyčky, stav spínače a skutečný proud. Původní srovnávací panely odstraněny, přidané promítací vazby.
- Biotův–Savartův výpočet konečných úseků tyčky, kolejnic a návratu přes odpor je společný pro oba pohledy. Otevřený obvod nevytváří proudové pole. Ověřeno nezávislou kvadraturou.
- Značení indukovaného napětí u_i v rovnicích, popiscích a grafu. Pevné osy a pružné uchopení zachovány.

# Popisky, řez vodičem a pevný graf přeměny

- Čitelné popisky mimo úchop a proudovou šipku; horní pole bez vlastního panelu.
- Dolní porovnání řezů pro otevřený a uzavřený obvod při stejné rychlosti, s analytickým polem proudu a označeným zvětšením kresby.
- Pevný graf rychlosti a podle zapojení napětí nebo výkonu zátěže; automatické osy vypnuté.
- Akční tlačítka Zavřít/Otevřít obvod a viditelný horní přechod k pohybovému napětí.

# Tyčka se zátěží: pružné uchopení a původní grafika

- Ruka působí pružným a tlumeným úchopem. Uzavřený obvod vodič brzdí už při tažení; po puštění pokračuje skutečný volný pohyb. Ověřena práce ruky a bilance kinetické energie/tepla.
- Kresba vodiče, nábojů, pole a voltmetru je sdílená s původním pokusem pohybového napětí. Scéna má čistší kolejnice, spínač a odporovou zátěž.
- Zachováno automatické přizpůsobování oknu; prošly modelové, grafické a ovládací kontroly.

# Automatické využití dostupného okna

- Obnoveno zvětšování i zmenšování modulů podle dostupné šířky a výšky. Přirozená šířka vychází ze stabilních CSS omezení, nikoli z posledního škálovaného rozměru.
- Zachováno oddělení vnitřního viewportu iframe od jeho výsledného měřítka. Prošly opakované kontroly nativních i vložených modulů pro notebook a Full HD.
- Automatické využití dostupné plochy je zapsané jako projektový standard v AGENTS.md.

# Stabilní přizpůsobování oken modulů

- Společné přizpůsobování všech vložených modulů používá rozměry hlavního okna místo měnící se výšky iframe. Zmenšování přes transform nemění jeho vnitřní viewport.
- Měření se slučují do requestAnimationFrame a ruší při opuštění modulu; opraveno dvojí započítání posunutí stránky.
- Oblouk šipky reluktančního momentu končí pod základnou trojúhelníku.
- Prošly kontroly opakovaného měření, zachování fontů a CSS a testy ovládání. Skutečný prohlížeč nebyl automaticky spuštěn podle AGENTS.md.

# Vůle kotvičky a čitelnost reluktance

- Prodloužená ramena a ověřená vůle cívky v celém rozsahu otáčení.
- Pevný graf ±1,2 N·m, úhel vartheta, proud nad cívkou a výrazná fialová šipka momentu.
- Větší vykreslovací oblast v soustavě rotoru zabraňuje mizení pole v rozích horního jha.

# Plynulé pole reluktance

- Stejný numerický konturový renderer a soustava rotoru jako u synchronního stroje. Průběžná interpolace číselného pole z 91 řešených poloh namísto prolínání hotových SVG.
- Optimalizace alokací ve sdíleném rendereru při zachování totožného SVG výstupu.
- Ověřeny fyzikální modely, ovládání, numerické pole a regresní testy synchronního stroje; připraven animovaný náhled.

# Úprava podle kontroly uživatele

- Základní elektromagnetické principy: nový název skupiny a přesun reluktance z Vinutí.
- Pravoúhlý stator reluktance, opravené osové popisky a plynulé prolínání numerického pole se zachováním SVG prvků.
- Původní pole všech transformátorů obnoveno; matematický transformátor má jen vycentrovaný trojúhelník směru toku bez ocásku.

# Aktuální úprava · 9. listopadu 2026

- Samostatný reluktanční pokus v obecných principech, řízení statorového proudu, tažení kotvičky, postrčení a tlumení. Původní synchronní stroj zachován.
- Tyčka na kolejnicích se zátěží jako hlavní pokus elektromechanické přeměny. Původní výklad dostupný přes tlačítko.
- Numericky odvozené tvary siločar transformátoru s přepnutím na původní kresbu; původní obvodové modely zachovány.
- Prošly modelové testy a testy ovládání bez prohlížeče; statické kresby ověřeny. Desktopový layout a rychlost v prohlížeči zůstávají k vizuální kontrole. Podrobnosti: m_files/Web/energy-experiments/README.md.

# 1.7.1 · Větší fázorový diagram a průhledné popisky

- Všechny matematické popisky SVG mají průhledné pozadí. Fázorák zabírá dvě třetiny pracovní plochy, na menších displejích je první.
- Vypnutí Ra sloučí reaktance v kresbě i napěťovém polygonu, se zachováním původního elektrického modelu. Samostatný přepínač zanedbání rozptylu mění model: odečte rozptyl od synchronních reaktancí. Teprve při nulovém odporu i rozptylu platí Ui=Ua.
- Ra má rozsah 0–1 p. j., uložená výchozí hodnota 0,25 p. j.
- Ověřeny modely, slučování šipek a výkonové bilance výpočtem. Pro tuto úpravu nebyl spouštěn Chrome.

# 1.7.0 · Výuková konstrukce schématu a fázorů

- Barevné schéma přepracováno podle dodaných obrázků: zdroj vlevo, samostatný vnitřní uzel, rozptyl a vypínatelný odpor před svorkami vpravo.
- Klasická konstrukce napěťového polygonu, proudový trojúhelník Ia + Ik = Iμ a kresba rotoru na ose d. Přepínatelný rozklad d/q, kroky konstrukce a přesné oblouky beta/phi.
- Čistá matematická geometrie v synchronous/schema-geometry.js, kresba v schema-drawing.js; DOM ovladače v schema.js.
- Ověřeno nezávislou impedanční maticí (792 stavů), 1200 sadami parametrů a kontrolami skutečných SVG šipek pro šest základních pracovních režimů. Nulová tuhost se odlišuje od záporné.
- Metodické poznámky a přesné příkazy testů: m_files/reference/synchronous/README.md. Dodané prezentace a obě knihy se dále přenášejí se zdrojovými archivy.

# Dokončení kontroly · 1.6.2

- Vypínač Ra přímo v horním ovládání. Generátorický komentář zobrazuje skutečný vnitřní úhel beta, shodný s obloukem v diagramu.
- Všechny modelové a prohlížečové kontroly prošly; archiv obsahuje prezentace, knihy a poznámky z kontroly.

# Historie vydání

## 1.5.7 · 8. listopadu 2026

- Obrázek synchronního stroje v rozcestníku označuje severní a jižní pól rovnými písmeny S a J bez matematického formátování.

## 1.5.6 · 8. listopadu 2026

- Pravý panel bez prázdného pružného řádku kolem vektorů; dostupnou výšku využívá průběh před/po.
- Větší nadpisy, hodnoty, vysvětlení a tabulka harmonických, zejména na vysokém okně.

## 1.5.5 · 8. listopadu 2026

- Levý obrázek využívá volnou výšku panelu se zachováním proporcí.
- Vlny pod statorem mají vyšší amplitudu kresby, samostatný prostor a větší odstup osových popisků. Upravená animace skládání sleduje novou společnou osu.

## 1.5.4 · 8. listopadu 2026

- Graf před/po využívá celou šířku panelu; výška obou pravých grafů se zvětšuje podle dostupné výšky okna.
- Popisek průběhu je mimo SVG pod křivkami. Zvětšený popisek vektorového součtu a ověřené rozložení na velkém displeji.

## 1.5.3 · 8. listopadu 2026

- Trvale dostupný posuvník zešikmení vedle předvoleb, ostatní parametry zůstávají sbalené.
- Prostorová vlna přímo pod vektorovým součtem, kompaktní dva panely s viditelnými amplitudami a tabulkou harmonických.

## 1.5.2 · 8. listopadu 2026

- Dva dominantní panely statoru a součtu příspěvků, s větším písmem a hodnotami. Průběh a harmonické tvoří druhou řadu.
- Fázorový diagram využívá prostor podle skutečného rozsahu vektorů. Proporce statoru zůstávají zachované.

## 1.5.1 · 8. listopadu 2026

- Vráceny viditelné bloky statoru, fázorů, číselných hodnot, průběhu a harmonických. Na širokém okně jsou ve třech sloupcích s menšími mezerami a výplněmi.
- Odstraněno nestejnoměrné škálování obrázku: stator, kruhový řez i harmonické mají původní proporce.
- Sbalené je pouze podrobné nastavení stroje. Popisek Činitel zešikmení zachován.

## 1.5.0 · 8. listopadu 2026

- Modul zešikmení se na notebooku soustředí na stator a mechanismus potlačení harmonické. Ovládání je vedle obrázku, odborné parametry, hodnoty a fázory jsou ve sbalených podrobnostech.
- Výška hlavního pokusu reaguje na výšku okna. Ověřeno umístění obrázku i sbalených podrobností do okna 1366 × 768.
- Popisek „Podepsaný činitel“ změněn na „Činitel zešikmení“.

## 1.4.0 · 8. listopadu 2026

- Animované vyrušení je začleněné přímo do rozvinutého statoru. Samostatný velký úvodní panel odstraněn.
- Vlny vycházejí ze skutečných axiálních poloh v obrázku drážek a při skládání se přesouvají na společnou osu pod statorem. Všechny používají stejné obvodové měřítko.
- Zachováno přehrání, zastavení, ruční skládání a zvýraznění dvojice. Podrobný původní pohled je dostupný přes Prohlédnout jeden řez.
- Původní verze 1.3.0 je zachovaná.

## 1.3.0 · 8. listopadu 2026

- Zešikmení začíná animovaným pokusem: posun fází axiálních příspěvků, přenos na společnou osu a přímo viditelné vyrušení výsledné harmonické.
- Zvýrazněná dvojice řezů a sonda ukazují odečítání opačných příspěvků ve stejném místě po obvodu. Výslednice má pevné měřítko a srovnání s nezprohýbanou vlnou bez zešikmení.
- Přímé porovnání bez zešikmení / potlačení drážkové periodicity; ruční ovládání překrytí, opakování a zastavení animace. Respektuje omezení pohybu v nastavení systému.
- Oddělené panely na mobilu, opravené polohy popisků zubů a drážek. Dřívější stator, fázory a výpočty zůstávají dostupné.

## 1.2.0 · 8. listopadu 2026

- Aplikace přejmenována na **Virtuální laboratoř elektrických strojů**, bez značky Hi! Fyziko v uživatelském rozhraní. Autorství a pracoviště zachovány.
- Zešikmení: čelní pohled na stator, stylizovaný rozvinutý vnitřní povrch se zuby a ústími drážek a zvýraznění jedné drážky po délce.
- Harmonická vykreslená přímo na statoru a ve stejném obvodovém měřítku pod ním. Volba axiálního řezu ukazuje fázový posun; srovnání krajních řezů a průměru celé délky.
- Čitelnější kompaktní popisky na mobilu. Model činitele zešikmení a původní moduly zachovány.
- Verze 1.1.0 a 1.0.0-pred-upravami zůstávají dostupné beze změny.

## 1.1.0 · 8. listopadu 2026

- Nový vzhled rozcestníku při zachování log a barev tematických skupin.
- Témata jsou při prvním otevření sbalená; návrat z modulu zachovává otevřenou skupinu v dané relaci prohlížeče.
- Hledání bez diakritiky, počty modulů, rozbalení a sbalení všech témat.
- Vinutí: činitel zešikmení drážek, geometrie, součet axiálních fázorů, prostorová vlna a porovnání harmonických.
- Fyzikální principy: elektromechanická přeměna, vodič v poli, transformátor a výkonová bilance asynchronního motoru včetně mezních stavů.
- Odkaz na obecnou přeměnu z pokusů Proč odpor a Kam jde výkon v asynchronním motoru.
- Samostatný balíček webu a přehled uložených verzí. Angličtina odložena na další etapu.

## 1.0.0-pred-upravami · 8. listopadu 2026

- Archiv původní aplikace před uvedenými zásahy, spustitelný kompaktní web a vývojové zdroje s kontrolními součty.
- Záloha neobsahuje cache prohlížečů a surové výsledkové databáze FEM. Ty zůstávají v pracovním projektu; přehrávače a data potřebná pro výuku jsou součástí uloženého webu.






# 1.6.0 · Náhradní schéma synchronního stroje

- Uložen schválený stav 1.5.8-pred-schematem: samostatný web a ověřený archiv 3 795 vývojových souborů. Velké výsledky FEM zůstávají v pracovním projektu podle stávajícího zálohovacího postupu.
- Nový modul sm02-schema: propojené jednofázové náhradní schéma, fázory, osy d/q a výkony. Hladký rotor i vyniklé póly, buzení, úhel β, odpor a reaktance.
- Výukové kroky konstrukce, motor/generátor/kompenzátor, odpojené buzení, odbuzení a přibuzení při konstantním P. Nedostupný stabilní bod se výslovně hlásí.
- Motorická konvence, RMS fázory, normalizovaná třífázová výkonová báze; model ustáleného stavu. KaTeX funguje offline.

# 1.6.1 · Vnitřní napětí, zátěž generátoru a společná grafika

- Piktogramy přebírají skutečný renderer ze synchronního principu, včetně drážek a budicího vinutí.
- Generátor lze zadat činným výkonem zátěže a jejím fázovým posuvem. Model dopočítá Uib a beta, rozlišuje výstupní Ig a vstupní I.
- Schéma zrcadlené: buzení vlevo, svorky vpravo. Samostatný rozptyl, reakce kotvy a vnitřní napětí Ui. Ui je svislou reálnou referencí; imaginární osa vodorovná. Komplexní veličiny mají pruh nahoře, Ef přeznačeno na Uib.
- Beta je po ověření v podkladech rozdílem argumentů vnitřního Ui a budicího Uib; od terminálového úhlu se rozlišuje i ve výpočtu. Ra má samostatný vypínač. Podklady a kontrola knih jsou přibaleny ke zdrojům.


### 2026-11-09 — výpočet pole zvoleného vinutí

- V modulu Od drážek k MMF lze levý horní panel přepnout na animované numerické pole hladkého rotoru a drážkovaného statoru.
- Zdrojem jsou skutečné cívkové strany vybraného vinutí včetně vrstev, zkráceného kroku, počtu fází a obou zvolených časových řádů.
- Lineární 2D magnetostatika na periodické polární síti; řešení mimo hlavní vlákno, animace skládáním bází, pevné měřítko v celé periodě.
- Prošly numerické a UI/worker testy, 384 případů původního MMF modelu a testy přizpůsobování okna. Statická grafika ověřena, skutečný browser layout neověřen.

### 2026-11-09 — poloha drážek v numerickém poli vinutí

- Tělo drážek přesunuto k mezeře na poloměry 160–183, ústí zkráceno na 153–160. Proudové oblasti a značky vinutí posunuty shodně.
- Za drážkami zůstává souvislé jho tloušťky 28; změna je v řešiči i společném rendereru vinutí.
- Prošly numerické testy včetně 384 drážek a testy ovládání/workeru; statický náhled prohlédnut.

### 2026-11-09 — plný krok po změně vinutí

- Změna m, q nebo počtu vrstev nastaví plný krok y_d=mq; následné ruční zkrácení zůstává dostupné.
- Ověřeno přepínání parametrů, ruční zkrácení a ovládání numerického pole.

### 2026-11-10 — Vznik momentu podle přednášky

- Napěťový trojúhelník s úhly β a φ, kosinová věta pro proud a sinová věta pro činnou složku; podklad SYNCHRONNI_1_new.pdf, strany 54–58.
- Výpočet výkonu a momentu v N·m s přepočtem přes fázové efektivní základy, frekvenci a pólové dvojice.
- Zvlášť podmínky hladkého rotoru bez odporu a obecný výpočet se ztrátami či vyniklými póly. Zachována motorická konvence aplikace a rozlišení Ua/Ui/Uib.
- Nové odvození ověřeno 168 stavy a skutečným KaTeXem; existující modely 6252 stavy a stabilní přizpůsobení všech 25 importovaných modulů.
- Aktualizován pouze příslušný importovaný modul v nejnovějším předávaném balíčku; ostatních 24 zachováno přesně. Zdrojový archiv a pracovní zdroje synchronizovány.
