# Uživatelské konvence pro výukovou grafiku

- Vektorové šipky kreslit tak, aby dřík končil u základny trojúhelníkového hrotu a nevyčníval z něj. Upřednostnit společnou vyplněnou siluetu dříku a hrotu; zohlednit i krátké šipky.
- Ovládání má být vždy malé a kompaktní při zachování čitelnosti; většinu dostupné plochy věnovat větším grafům a scéně. Uvolněné místo po zmenšení ovládání přidělit grafům, nikoli výplním panelu.

- Automatická vyskakovací hlášení používat jen pro blokace, o kterých student musí vědět, aby mohl pokračovat. Běžné stavové a výukové zprávy nepřekrývají scénu. Pokud se celá zpráva nevejde do stávajícího místa v levém panelu, vůbec ji tam nezobrazovat; nepřidávat posuvník, zkrácenou náhradu ani nezvětšovat panel. Výslovně otevřený výklad není automatické stavové hlášení.

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
- Úvodní web musí zůstat lehký: závěr sestavení `tools/build-progressive-web.cjs` odděluje vložené lekce a velké numerické báze do `web/lazy/`. Načítají se až při otevření příslušného modulu, s průběhem a možností opakování. Zachovat původní data, renderery, ID a odkazy; nové datové závislosti doplnit do tohoto sestavení a ověřit `tools/test-progressive.cjs`. Publikace i soukromé předání musí zahrnout přesně `progressiveFiles` z manifestu. Samotný index.html nestačí.
- Při pokynu „přesouváme se na jiný počítač“ aktualizovat předávací stav, ověřit sestavení a uložit práci místním commitem. Nedokončenou práci uložit na pracovní větev. Push provést jen při samostatném výslovném pokynu; jinak předat i dosud neodeslané commity. Poté vytvořit soukromý balíček `node tools/project/handoff.cjs` a předat ZIP i SHA-256. Balíček obsahuje také literaturu, malé zdrojové modely, parametry, skripty, historii a aktuální LFS data. Nikdy jej nenahrávat jako asset veřejného GitHub Release.
- Balíčky jsou v lokálním `handoffs/`, mimo Git i Pages. Přesun je kopie a ověření, nikoli smazání původního počítače. Na novém počítači rozbalit do nové složky a použít `node tools/project/restore.cjs`. Přihlašovací údaje a konfigurace konkrétního počítače se nepřenášejí.
- Nepotřebné objemné FEM výsledky, exporty a cache po ověření nezávislého sestavení odstranit, nepřenášet. Zachovat kompaktní data současných animací a malé zdrojové modely/geometrii/parametry/výpočetní skripty pro přepočet na požádání. Přepočítávání nespouštět automaticky. Chráněné zálohy uvedené výše zůstávají nedotčené.
- Pravidla a aktuální rozpracovanost musí být zapsané v projektu; nespoléhat na paměť předchozího chatu. Lokální absolutní cesty nepoužívat jako závislosti sestavení.

- Fúzní balíčky: elektrické pole má barvu jantarovou `#b57825`, magnetické modrou `#356ac3` (sdílené `HiFyzikoParticleStyle.fields`). Platí pro vektory, siločáry, značky a jejich popisky. Barevná mapa velikosti pole má samostatnou kvantitativní škálu. Podklady matematických popisků v driftovém modulu jsou průhledné.

- Úklid schválený 17. 11. 2026: jediný aktivní strom je `versions/vyvoj/m_files` a jediný uživatelský výstup `versions/aktualni/web`. V `handoffs/` ponechávat jen poslední ověřený předávací ZIP se SHA-256, nevytvářet další archivní kopie úklidu. Staré předávky a regenerovatelné výstupy po ověření odstranit; literaturu, malé modelové vstupy, historii Git a dvě chráněné zálohy zachovat. Podrobnosti v `VERZE.md`.
