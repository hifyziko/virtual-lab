# Uživatelské konvence pro výukovou grafiku

- Názvy veličin a poloh ve fúzních modulech přebírat z knihy Entler–Kindl nebo z podkladů ÚFP (IPP). Pro geometrii podle kap. 7.1 používat „elongace plazmatu“ a „střední triangularita plazmatu“. Výpočtové body bez zavedeného názvu určit souřadnicemi v poloidálním řezu.

- Při předávání upraveného výukového pokusu připojit učitelský příběh: co ukázat, čím pohnout, čeho si všimnout a jak fyzikální výsledek studentům vysvětlit. Ve webu patří tento souvislý výklad do „Ovládání a výklad“.

- Hlavní obrazovku pokusu věnovat scéně, grafům, ovládání a popiskům potřebným k odečtu. Souvislé vysvětlení, jak číst scénu nebo co znamená pozorovaný jev, patří do „Ovládání a výklad“. Nerezervovat mu řádek v patičce ani pod grafem.

- Prostorové harmonické vždy značit řeckým písmenem nu (`\nu`), časové harmonické řeckým písmenem mí (`\mu`). Platí pro ovladače, grafy, rovnice i výklad; prostorový řád neznačit n.

- Rozhodnutí 19. 11. 2026: ponechat původní vzhled jako výchozí. Tmavý laboratorní styl je pouze další možná varianta. Viditelné podklady, původní návrhový standard, zdroje náhledu a postup pro budoucí přepnutí jsou v [docs/grafika/README.md](docs/grafika/README.md). Uchovat je; neaktivovat ani plošně nerozšiřovat bez nového pokynu uživatele. Referenční standard v této složce není aktivní pravidlo pro redesign. Zachovat současné poměry oken.

- V uživatelském výkladu a citacích knihy neuvádět „poskytnutá finální verze rukopisu“ ani obdobné poznámky o stavu či předání rukopisu. Uvádět autory, název knihy a konkrétní kapitoly/strany.

- Výklad psát přímo pro studenta, stručně a případně bodově: význam veličin, jev a co sledovat v pokusu. Nepoužívat redakční nadpisy typu „Jak souvisí rovnice v rámečku s knihou“. Citace patří ke zdrojům. Dodržovat české vyjadřování knihy, zejména „banánová trajektorie“, nikoli „banánová orbita“.

- Výklady fúzních modulů čerpat primárně z uživatelovy knihy Entler–Kindl, Jaderná fúze a fúzní elektrárny (poskytnutý finální rukopis). Respektovat její terminologii a uvádět kapitoly, rámečky a strany. Ve společném výkladu vysvětlit všechny použité značky, vztahy a omezení modelu. Veřejné odborné zdroje používat jako doplněk s odkazy; neveřejné podklady přesně citovat. Vlastní rozšíření modelu zřetelně odlišit od výkladu knihy. Soukromý rukopis nepublikovat.

- Vektorové šipky kreslit tak, aby dřík končil u základny trojúhelníkového hrotu a nevyčníval z něj. Upřednostnit společnou vyplněnou siluetu dříku a hrotu; zohlednit i krátké šipky.
- Ovládání má být vždy malé a kompaktní při zachování čitelnosti; většinu dostupné plochy věnovat větším grafům a scéně. Uvolněné místo po zmenšení ovládání přidělit grafům, nikoli výplním panelu.

- Načítání a blokující přípravu dat zobrazovat velkým pruhem uprostřed hlavního okna/scény, nikoli drobným ukazatelem v ovládání. Známý průběh zobrazit skutečným naplněním; při neznámém použít neurčitý pohyblivý pruh bez smyšlených procent. Po dokončení překryv zmizí; chyba nabídne opakování. Krátké čekání mezi snímky potlačit malou prodlevou, aby překryv neblikal.

- Automatická vyskakovací hlášení používat jen pro blokace, o kterých student musí vědět, aby mohl pokračovat. Běžné stavové a výukové zprávy nepřekrývají scénu. Pokud se celá zpráva nevejde do stávajícího místa v levém panelu, vůbec ji tam nezobrazovat; nepřidávat posuvník, zkrácenou náhradu ani nezvětšovat panel. Výslovně otevřený výklad není automatické stavové hlášení.

- Prostorové vektory polí a souvisejících veličin sázet tučně stojatě v KaTeXu (`\mathbf{E}`, `\mathbf{B}`, `\mathbf{H}`, `\mathbf{J}`, obdobně síla a rychlost), včetně rovnic, výkladu a popisků scén. Nepoužívat pro ně kurzivní `\boldsymbol` ani šipku nad značkou. Skalární velikosti a složky zůstávají běžnou matematickou kurzivou; komplexní fázory zachovávají pruh nahoře.

- Komplexní veličiny sázet v KaTeXu s pruhem nahoře (`\overline{...}`), nikoli podtržením. Skalární velikosti nemají pruh.
- Ve fázorových diagramech je reálná osa svislá, imaginární vodorovná. Zachovat orientaci násobení j; v aktuálním modulu je kladná reálná osa nahoru a kladná imaginární doleva.
- Ve fázorovém diagramu náhradního schématu synchronního stroje leží na kladné reálné ose svorkové napětí Ua (výslovná úprava uživatele). Vnitřní napětí Ui odpovídá uzlu mezi reakcí kotvy a rozptylovou reaktancí s odporem; obecně neleží na reálné ose. Budicí napětí značit Uib, ne Ef. Rozlišovat svorkové U a vnitřní Ui.
- Vnější zátěžný úhel beta je mezi Ua a Uib; ovládání a oblouk používají beta a solve. Vnitřní úhel Ui/Uib se značí beta s čárkou a používá internalBeta. Samostatný modul Momentová charakteristika dovoluje obě úhlové osy.
- Pro tvary strojů používat existující renderer machine-art.js, nikoli nové zjednodušené náhražky.
- Aktivní práci průběžně aktualizovat v versions/aktualni; nevytvářet další číslované verze bez výslovné žádosti uživatele. Sestavení: node tools/build-release.cjs (výchozí cíl aktualni). Starší meziverze jsou ve versions/archiv. Zálohy 1.0.0-pred-upravami a 1.5.8-pred-schematem nepřepisovat. Prohlížeč automaticky nespouštět; uživateli předat stálý odkaz.

- Podklady pro další moduly: versions/vyvoj/m_files/reference/synchronous/; přiložené učebnice Fitzgerald a Chapman v kořeni projektu. Uchovávat je ve zdrojových předávacích archivech, s poznámkami o ověřených vztazích a nepřesnostech. Chapmanův soubor je Instructor’s Manual, nikoli plný text učebnice.

- Velikost webové dodávky nemá pevný limit 100 MB. Sestavení velikost eviduje, ale kvůli překročení této hodnoty se nesmí zastavit.

- Výchozí standard pro všechny moduly: obsah je vodorovně vystředěný od prvního vykreslení. Odkaz zpět do rozcestníku/skupiny i celá hlavička jsou od začátku zarovnané s levou hranou zobrazeného modulu a sledují ji při změně měřítka, velikosti okna i celé obrazovky. Nesmí nejprve vzniknout zarovnání vlevo a následný skok doprostřed. Zachovat automatické zvětšování i zmenšování podle dostupné šířky a výšky.

- Aktuální dodávka má podle pokynu uživatele z 12. 11. 2026 stálé označení 1.0 v patičce. Nevytvářet další meziverze. Stav plánované čistky viz VERZE.md v kořeni projektu.

## GitHub, publikace a přesun mezi počítači — schváleno 15. 11. 2026

- Jediný sdílený vývoj je `https://github.com/hifyziko/virtual-lab`, hlavní větev `main`. Historii tvoří commity; označení aplikace zůstává 1.0. Existující historii a README zachovat. Nikdy force push ani přepis historie.
- **Push pouze na výslovný pokyn uživatele** (upřesnění 15. 11. 2026). Úpravy, místní commit, sestavení ani pokyn k přesunu na jiný počítač samy o sobě push nepovolují. Neodesílat ani další opravy či tagy automaticky. Nasazený web odpovídá poslednímu výslovně odeslanému stavu.
- Než začne práce na jiném počítači: přečíst tento soubor, `PREDANI_PROJEKTU.md`, `PREDANI-AKTUALNI.md` a vnořená pravidla; zkontrolovat `git status`, větev a `origin`; s čistým stromem `git pull --ff-only`. Místní změny ani konflikty nikdy nezahodit. Nesouběžně upravovat stejnou práci na dvou počítačích bez větví a sloučení.
- Veřejný Git obsahuje jen upravitelné zdroje, potřebná data animací, pravidla a nutné nástroje. Výběr spravuje `config/project-files.json`; `.gitignore` generuje `node tools/project/files.cjs sync`. Nový soubor přidat vědomě příkazem `node tools/project/files.cjs add cesta`; před commitem `node tools/project/files.cjs audit` a `git diff --cached --stat`. Nepoužívat plošné přidání všeho ani `git add -f`.
- Pages publikuje výhradně výstup `node tools/project/prepare-web.cjs`, nikoli kořen projektu. Knihy, PDF podklady, skeny, soukromé poznámky, zálohy, profily prohlížeče, ladicí soubory, surové FEM výsledky a přihlašovací údaje na GitHub ani Pages nepatří. Potřebné licenční informace se zachovávají.
- Zdrojové cesty a odkazy modulů zachovat. Generovaný web je v `versions/aktualni/web`; Git ho znovu sestavuje ze zdrojů. Vývojové nástroje se nikdy nepřibalují do veřejného webu. Sestavení: `node tools/build-release.cjs`; kontrola: `node tools/project/check.cjs`. Prohlížeč automaticky neotevírat.
- Místní rozcestník aktualizovat sestavením z aktivního pracovního stromu. Hotový web ani jeho manifest nepřekopírovávat z pomocných pracovních kopií, z jiných chatů ani z GitHub Pages. Změny z oddělené práce přenášet do zdrojů a z těch společně sestavit dodávku.
- Úvodní web musí zůstat lehký: závěr sestavení `tools/build-progressive-web.cjs` odděluje vložené lekce a velké numerické báze do `web/lazy/`. Načítají se až při otevření příslušného modulu, s průběhem a možností opakování. Zachovat původní data, renderery, ID a odkazy; nové datové závislosti doplnit do tohoto sestavení a ověřit `tools/test-progressive.cjs`. Publikace i soukromé předání musí zahrnout přesně `progressiveFiles` z manifestu. Samotný index.html nestačí.
- Při pokynu „přesouváme se na jiný počítač“ aktualizovat předávací stav, ověřit sestavení a uložit práci místním commitem. Nedokončenou práci uložit na pracovní větev. Push provést jen při samostatném výslovném pokynu; jinak předat i dosud neodeslané commity. Poté vytvořit soukromý balíček `node tools/project/handoff.cjs` a předat ZIP i SHA-256. Balíček obsahuje také literaturu, malé zdrojové modely, parametry, skripty, historii a aktuální LFS data. Nikdy jej nenahrávat jako asset veřejného GitHub Release.
- Balíčky jsou v lokálním `handoffs/`, mimo Git i Pages. Přesun je kopie a ověření, nikoli smazání původního počítače. Na novém počítači rozbalit do nové složky a použít `node tools/project/restore.cjs`. Přihlašovací údaje a konfigurace konkrétního počítače se nepřenášejí.
- Nepotřebné objemné FEM výsledky, exporty a cache po ověření nezávislého sestavení odstranit, nepřenášet. Zachovat kompaktní data současných animací a malé zdrojové modely/geometrii/parametry/výpočetní skripty pro přepočet na požádání. Přepočítávání nespouštět automaticky. Chráněné zálohy uvedené výše zůstávají nedotčené.
- Pravidla a aktuální rozpracovanost musí být zapsané v projektu; nespoléhat na paměť předchozího chatu. Lokální absolutní cesty nepoužívat jako závislosti sestavení.

- Fúzní balíčky: elektrické pole má barvu jantarovou `#b57825`, magnetické modrou `#356ac3` (sdílené `HiFyzikoParticleStyle.fields`). Platí pro vektory, siločáry, značky a jejich popisky. Barevná mapa velikosti pole má samostatnou kvantitativní škálu. Podklady matematických popisků v driftovém modulu jsou průhledné.

- Úklid schválený 17. 11. 2026: jediný aktivní strom je `versions/vyvoj/m_files` a jediný uživatelský výstup `versions/aktualni/web`. V `handoffs/` ponechávat jen poslední ověřený předávací ZIP se SHA-256, nevytvářet další archivní kopie úklidu. Staré předávky a regenerovatelné výstupy po ověření odstranit; literaturu, malé modelové vstupy, historii Git a dvě chráněné zálohy zachovat. Podrobnosti v `VERZE.md`.

- Sjednocení výkladu (17. 11. 2026): uživatel schválil pilot Momentové charakteristiky AM a rozšíření na celý projekt. Společný vzor je jedno tlačítko „Ovládání a výklad“ vlevo vedle „Celá obrazovka“. Sdružovat návod k ovládání, doporučený pokus a teorii/model do společného dialogu, zachovat vztahy a zdroje. Matematiku i čísla s jednotkami sázet KaTeXem, české slovní indexy přes \text. Otevření nemění stav pokusu ani rozměry modulu. Uvolněnou plochu po výkladových pruzích přidělit grafům. Rozbalovací nastavení a živé popisky grafů nejsou výklad; zachovat jejich funkci u pokusu.

- Ovládání prostorových scén myší (18. 11. 2026): při tažení doprava snižovat azimut kamery; při tažení dolů zvyšovat její elevaci (oprava svislé osy podle uživatele). Tuto konvenci zachovat v nových a upravovaných prostorových modulech.

- Upřesnění 20. 11. 2026: ve všech modulech odstranit neúčelné prázdné okraje a rezervované řádky po skrytém či přesunutém obsahu. Uvolněnou šířku a výšku přidělit scéně a grafům, nikoli prázdné výplni panelů. Ponechat pouze malé funkční odstupy pro čitelnost a zabránění překryvům; neodstraňovat je plošným nulováním všech mezer.

- Ve všech modulech používat malé funkční mezery mezi panely. Grafy a scény mají růst podle dostupné plochy panelu. U grafů přepočítat kreslicí oblast podle rozměrů, u technických řezů zachovat poměr stran. Pevný rozměr ponechat jen tam, kde jej vyžaduje čitelnost nebo funkce ovladače.
