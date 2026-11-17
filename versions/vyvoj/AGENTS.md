# Uživatelské konvence pro výukovou grafiku

Pravidla Gitu, publikace a přesunu mezi počítači z 15. 11. 2026 jsou v `../../AGENTS.md` a `../../PREDANI_PROJEKTU.md`. Jsou závazná i zde. Veřejný výběr zdrojů řídí `../../config/project-files.json`; knihy a výpočetní mezivýsledky do Gitu nepatří.

- Prostorové vektory polí a souvisejících veličin sázet tučně stojatě v KaTeXu (`\mathbf{E}`, `\mathbf{B}`, `\mathbf{H}`, `\mathbf{J}`, obdobně síla a rychlost), včetně rovnic, výkladu a popisků scén. Nepoužívat pro ně kurzivní `\boldsymbol` ani šipku nad značkou. Skalární velikosti a složky zůstávají běžnou matematickou kurzivou; komplexní fázory zachovávají pruh nahoře.

- Komplexní veličiny sázet v KaTeXu s pruhem nahoře (`\overline{...}`), nikoli podtržením. Skalární velikosti nemají pruh.
- Ve fázorových diagramech je reálná osa svislá, imaginární vodorovná. Zachovat orientaci násobení j; v aktuálním modulu je kladná reálná osa nahoru a kladná imaginární doleva.
- Ve fázorovém diagramu náhradního schématu synchronního stroje leží na kladné reálné ose svorkové napětí Ua (výslovná úprava uživatele). Vnitřní napětí Ui odpovídá uzlu mezi reakcí kotvy a rozptylovou reaktancí s odporem; obecně neleží na reálné ose. Budicí napětí značit Uib, ne Ef. Rozlišovat svorkové U a vnitřní Ui.
- Vnější zátěžný úhel beta je mezi Ua a Uib; ovládání a oblouk používají beta a solve. Vnitřní úhel Ui/Uib se značí beta s čárkou a používá internalBeta. Samostatný modul Momentová charakteristika dovoluje obě úhlové osy.
- Úhel beta je orientovaný od Ua k Uib, beta s čárkou od Ui k Uib; kladný směr je proti směru hodinových ručiček. Generátor má kladný úhel, motor záporný (ideální běžná provozní větev). Úhlová osa roste doprava. Proud, elektromagnetický výkon a moment zachovávají motorickou konvenci, proto sinusové momentové vztahy mají záporné znaménko a synchronizační tuhost je minus derivace motorického momentu podle beta. V názorném principu platí beta = p(theta_r - theta_s). S nenulovým odporem určovat režim podle výkonu, ne pouze podle znaménka úhlu.
- Pro tvary strojů používat existující renderer machine-art.js, nikoli nové zjednodušené náhražky.
- Aktivní práci průběžně aktualizovat v versions/aktualni; nevytvářet další číslované verze bez výslovné žádosti uživatele. Sestavení: node tools/build-release.cjs (výchozí cíl aktualni). Starší meziverze jsou ve versions/archiv. Zálohy 1.0.0-pred-upravami a 1.5.8-pred-schematem nepřepisovat. Prohlížeč automaticky nespouštět; uživateli předat stálý odkaz.

- Podklady pro další moduly: m_files/reference/synchronous/; přiložené učebnice Fitzgerald a Chapman v kořeni projektu. Uchovávat je ve zdrojových předávacích archivech, s poznámkami o ověřených vztazích a nepřesnostech. Chapmanův soubor je Instructor’s Manual, nikoli plný text učebnice.

- Automatické přizpůsobení modulu celé dostupné ploše okna prohlížeče je výchozí standard. Zachovat zvětšování i zmenšování až k limitu šířky nebo výšky, včetně místa pro navigaci a autorství. Měřítko počítat z neškálované přirozené šířky a stabilního vstupního viewportu; výstup škálování nesmí být vstupem dalšího měření. Opravy kmitání nesmějí vypnout automatické zvětšování. Ověřit opakované měření pro nativní i vložené moduly.

- V uživatelském rozhraní okamžité indukované napětí značit u_i v KaTeXu (`u_i`), nikoli e. Fázorové konvence U_i a U_ib zůstávají dle předchozích pravidel.

- Okamžité elektrické veličiny v uživatelském rozhraní značit malými písmeny (u, i, p), včetně indexů. Efektivní hodnoty, amplitudy a fázory ponechat velkými písmeny (U, I, P; fázory s pruhem nahoře). Pravidlo neaplikovat na B, H, tok, sílu ani moment; interní názvy proměnných nejsou matematické značky rozhraní.

## Závazné pravidlo matematické sazby

- Vždy používat KaTeX pro všechny matematické vztahy, značky veličin, indexy, řecká písmena a číselné hodnoty s jednotkami v celém uživatelském rozhraní, včetně ovladačů, tabulek, výsledků, popisků grafů a schémat i dynamických hlášek. Platí pro nové moduly i úpravy stávajících.
- Nepoužívat prostý text, Unicode náhražky indexů ani ručně skládané HTML jako náhradu matematické sazby. V SVG používat existující KaTeX/foreignObject renderer a v canvasu existující matematickou vrstvu. Běžný nematematický text zůstává běžným textem.
- Dynamicky změněné hodnoty znovu vysázet přes KaTeX; zachovat českou desetinnou čárku, správné mezery před jednotkami a stojaté jednotky. Při kontrole změn ověřit i matematiku v tabulkách a popiscích, nejen hlavní rovnice.

Pro další ladění modulů dodržuj také [PRAVIDLA_LADENI_MODULU.md](../PRAVIDLA_LADENI_MODULU.md).

- Velikost webové dodávky nemá pevný limit 100 MB. Sestavení velikost eviduje, ale kvůli překročení této hodnoty se nesmí zastavit.

- Výchozí standard pro všechny moduly: obsah je vodorovně vystředěný od prvního vykreslení. Odkaz zpět do rozcestníku/skupiny i celá hlavička jsou od začátku zarovnané s levou hranou zobrazeného modulu a sledují ji při změně měřítka, velikosti okna i celé obrazovky. Nesmí nejprve vzniknout zarovnání vlevo a následný skok doprostřed. Zachovat automatické zvětšování i zmenšování podle dostupné šířky a výšky.

- Aktuální dodávka má podle pokynu uživatele z 12. 11. 2026 stálé označení 1.0 v patičce. Nevytvářet další meziverze. Stav plánované čistky viz VERZE.md v kořeni projektu.
