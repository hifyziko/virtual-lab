# Pravidla pro další ladění výukových modulů

Závazné zadání vycházející z odsouhlasených úprav projektu. Platí pro nové moduly i opravy stávajících. Konkrétní novější pokyn uživatele má přednost. Technické konvence doplňuje `vyvoj/AGENTS.md`.

## 1. Stabilní rozměry a automatické škálování

- Moduly mají jednotnou vnější šířku, styl a přiměřený poměr stran. Vycházet ze společného rámce projektu, nepřidávat vlastní nezávislé rozměrové systémy.
- Celý modul se automaticky zvětšuje i zmenšuje podle dostupné šířky **i výšky** okna. Započítat navigaci a autorství. Obsah nesmí přesahovat monitor ani být oříznutý zprava či dole.
- Přepínání záložek, zapnutí zátěže, změny parametrů ani průchod proudu nulou nesmějí měnit vnější rozměry či způsobovat poskakování.
- Měřítko počítat ze stabilních neškálovaných rozměrů. Výstup předchozího škálování nesmí být vstupem dalšího měření.
- V hlavním výukovém pohledu nevytvářet vodorovné ani svislé posuvníky, včetně posuvníků uvnitř rovnic. Přetékání neopravovat pouhým skrytím obsahu.
- Při nedostatku prostoru nejprve přeuspořádat a zhutnit obsah nebo přesunout doplňující výklad do detailu. Neřešit to nečitelně malým písmem.

## 2. Rozložení a využití prostoru

- Hlavní prostor patří grafům a technickým schématům. Ovládání má být kompaktní, se sjednocenými rozměry a čitelnými hodnotami.
- Respektovat stejné mezery mezi panely; panely, popisky, rovnice ani číselná políčka se nesmějí dotýkat či překrývat.
- Nechat pouze informace potřebné k danému vysvětlení. Nevracet odstraněné duplicitní karty nebo ovladače bez důvodu.
- Využívat volný prostor pro větší grafiku a čitelnost. Nezvětšovat samoúčelně výplně a prázdné mezery.
- Související moduly mají mít srovnatelně velká fyzická a náhradní schémata; přidání prvku nesmí zmenšit celé schéma.
- Výsledky je vhodné podávat kompaktní tabulkou, nikoli množstvím velkých karet s jednotlivými čísly.
- Výchozí standard pro všechny moduly: obsah je vodorovně vystředěný od prvního vykreslení. Odkaz zpět do rozcestníku/skupiny i celá hlavička jsou od začátku zarovnané s levou hranou zobrazeného modulu a sledují ji při změně měřítka, velikosti okna i celé obrazovky. Nesmí nejprve vzniknout zarovnání vlevo a následný skok doprostřed. Zachovat automatické zvětšování i zmenšování podle dostupné šířky a výšky.
- Hlavičku držet podle společného aktuálního vzoru, nevracet staré samostatné bannery HiFyziko. Konečné statické styly a pracovní šířku připravit před vykreslením obsahu; centrování a zarovnání hlavičky nesmějí čekat na dodatečný přepočet.
- Výklad otevírat bez změny rozměrů základního modulu. Změna parametrů má ihned přepočítat a zobrazit výsledky.

- Výjimka pro Točivé pole: nastavení je v levém bočním panelu, čtyři hlavní grafy mají stabilní plochu vpravo. Fázové ovladače přibývají svisle; při překročení dostupné výšky se posouvá pouze panel nastavení, nikoli celá stránka. Ostatní moduly Vinutí zachovávají horní ovládání.

## 3. KaTeX — povinné pravidlo

- **Veškerou matematiku vždy sázet přes KaTeX:** vztahy, veličiny, řecká písmena, indexy, výsledky, čísla s jednotkami, tabulky, ovladače, popisky os, schémata i dynamické hlášky.
- Nepoužívat prostý text ani Unicode indexy jako výslednou matematickou sazbu. Použít existující matematickou vrstvu pro HTML, SVG a canvas; nevytvářet další konkurenční renderer.
- Běžný vysvětlující text zůstává běžným textem. Zachovat českou desetinnou čárku, mezeru před jednotkou a stojaté jednotky.
- Dynamicky změněné hodnoty znovu správně vysázet. KaTeX nesmí vyvolat smyčku překreslování, změnu velikosti panelu ani posuvník.
- Komplexní veličiny a fázory mají pruh nahoře, skalární velikosti nikoli. Okamžitá napětí, proudy a výkony mají malá písmena. Indukované napětí značit u_i, u fázorů U_i; ne e.
- Sjednotit velikost písma podle role. Hlavní rovnice mají být dobře čitelné, ale musí se vejít společně s výsledky. Neprosazovat jednu velikost za cenu ořezu.

## 4. Technická grafika a grafy

- Používat čistou technickou kresbu, konzistentní tloušťky a barvy. Osy a konstrukční čáry jemnější než zobrazované průběhy; vyhnout se hrubé nebo deformované kresbě.
- Zachovat rozumný poměr stran konstrukce. Široký monitor není důvod graf vodorovně roztáhnout.
- Názvy os centrovat k hrotům šipek s jednotným odstupem. Číselné popisky umístit čitelně; značky průběhů blízko příslušnému signálu.
- Související osy zarovnat geometricky. V převodním grafu zapínacího proudu je časová osa proudu přesně pod osou B.
- Napěťové šipky v náhradních schématech vázat ke svorkám. Popisky držet v jednotné vzdálenosti; odpor a další prvky nesmějí kolidovat s popisy ani přívody.
- Magnetický tok kreslit siločarami. Směrové značky jsou samotné trojúhelníčky bez dříků, na každé druhé siločáře podle schváleného vzoru.
- Pro společné typy strojů a vinutí používat existující schválené renderery. Nezaměňovat směr požadované inspirace mezi moduly.
- U matice vodičů zachovat princip vykreslování a interpolace jako u proximity efektu, jemnou síť a jemné barevné rozlišení vodičů v grafu.
- Výpočtový model a fyzikální význam se nesmějí změnit jen kvůli vzhledu. Odlišovat elektrický a mechanický úhel, časové a prostorové harmonické; obecné modely mají platit pro n fází.

## 5. Ovládání a oznámení

- Ovladače seskupit přehledně, případně jemně barevně odlišit. Skrýt parametry, které pro zvolenou geometrii nedávají smysl.
- Reset či „Srovnat“ musí srovnat všechny příslušné parametry skupiny, včetně amplitud i fázových posunů, pokud je skupina obsahuje.
- Nenabízet přehrávání tam, kde nepomáhá vysvětlení. U zkratového proudu ponechat ruční časový odečet bez tlačítka Přehrát.
- Oznámení o změně rozsahu ukázat dočasně přímo u grafu, bez dialogu a bez posunutí rozložení. Použít jemné meruňkové pozadí a tmavší oranžový text.
- Číslovat moduly od 01 samostatně v každé sekci a řadit je podle návaznosti výkladu.

## 6. Aktuální uspořádání zkratového proudu

- Vlevo oba velké grafy, vpravo postupně **schéma → tabulka výsledků → všechny vztahy pro proud a obálky**.
- Tři samostatné karty pro ustálený proud, maximum a časovou konstantu se nezobrazují.
- Zachovat všechny vztahy; jejich písmo a mezery přizpůsobit tak, aby se vešly bez posuvníků. Tabulku nevytěsňovat do výkladu.

## 7. Postup a kontrola změn

1. Najít skutečný zdroj, společné styly a způsob vložení do aktuální aplikace. Zkontrolovat, že se upravuje verze, kterou uživatel používá.
2. Opravu omezit na potřebný modul či společné pravidlo. Nepřepisovat fyziku, nesouvisející moduly ani původní podklady kvůli kosmetické úpravě.
3. Pokud by změna ohrozila čitelnost, úplnost vysvětlení nebo konzistenci jiných modulů, oznámit konkrétní problém uživateli.
4. Ověřit syntaxi, matematickou sazbu, zachování funkce ovladačů a stabilitu rozměrů při přepínání a opakovaném škálování. Přiměřeně ověřit různé velikosti okna.
5. Pokud je dostupný prohlížeč, osobně zkontrolovat ořez, překryvy a popisky. Bez vizuální kontroly netvrdit, že vzhled byl ověřen.
6. Aktualizovat zdroje i aktivní dodávky v `vyvoj/versions/aktualni` a `aktualni`; při změně dodávky udržet manifest. Nevytvářet další číslované verze bez zadání.
7. Prohlížeč automaticky nespouštět. Stručně oznámit výsledek, provedené kontroly a případná omezení.
