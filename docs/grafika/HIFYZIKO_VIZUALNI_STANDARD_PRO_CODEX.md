# HiFyziko Virtual Lab — vizuální a interakční standard pro Codex

## Role a rozsah
Použij vzhled a interakční jazyk prototypů `lawson_prototyp.html` a `energeticke_milniky_prototyp.html` jako referenci pro vizuální identitu celého HiFyziko Virtual Lab (domovská stránka, rozcestník, navigace i jednotlivé moduly). Neprováděj hromadný redesign bez mého pokynu. Nejprve audituj existující rozložení a navrhni implementační postup. Zachovej funkčnost, výpočty, terminologii, URL, id ovládacích prvků a stávající moduly.

## Vizuální charakter
- Moderní vědecká laboratoř, nikoli herní UI ani přeplácaný sci-fi kokpit. Tmavě modré/navy podklady, velmi jemné gradienty, světlá typografie, tenké kontury a přiměřené světelné akcenty.
- Primární barevná paleta převzatá z prototypu (CSS custom properties):
  - `--bg: #070e19` — pozadí aplikace;
  - `--shell: #0c1626` — hlavní prostředí;
  - `--panel: #0f1d2e`, `--panel2: #102338` — panely;
  - `--line: #24405b` — jemné ohraničení;
  - `--muted: #9cb6cb`, `--white: #edf6ff` — texty;
  - `--cyan: #55cbea` — aktivní prvky, energie odcházející ze systému, interakce;
  - `--gold: #ffbb67` — fúzní reakce a teplo;
  - `--violet: #c49df7` — zásoba energie;
  - `--green: #65dec1` — užitečný výstup, úspěšná bilance;
  - `--red: #f8859a` — varování, nebezpečí nebo ztráta, pokud má být zdůrazněna.
- Barvy musí být fyzikálně významové a konzistentní napříč moduly; nikdy ne jediný nositel informace. K nim patří legenda, tvar, šipka či popisek.
- Zaoblené panely 12–16 px, jemné rámečky (cca 1 px), střídmé stíny. Žádná velká barevná tlačítka bez významu.
- Písmo Inter / system-ui; velký a čitelný nadpis, menší podtitulek, panely s krátkými jasnými názvy; dostatečná čitelnost ve třídě z projektoru.

## Makro-layout
- Jeden jednotný header: značka **HiFyziko / Virtual Lab**, navigace a aktivní sekce. Respektuj stávající identitu a neprováděj svévolné přejmenování.
- Maximální šířka hlavního obsahu přibližně 1580 px; vnější okraje a vnitřní rozestupy sjednotit.
- Výukový modul: hlavní vizualizace zaujímá přibližně 60–70 % šířky; ovládání a vysvětlení 30–40 %. Velký výjev má prioritu před tabulkami a diagnostickými bloky.
- Rozcestník webu: jednotná navigace a kompaktní tematické karty (elektromagnetismus / elektrické stroje / fúze). Nedělej z hlavní stránky doslovný laboratorní dashboard; přenes na ni barevnost, typografii, karty a stavy.
- Menší monitory, tablet, mobil: žádný horizontální scroll aplikace; obsah se adaptuje, komponenty se nedrobí do nečitelných oken. Výška scény se odvozuje od použitelného prostoru. Fullscreen musí zachovat poměry výjevu i ovládání.
- Důležité ovládání musí být vždy viditelné bez rozsáhlého scrollování na běžném notebooku.

## Animace a didaktika (povinná pravidla)
- Každý modul začíná *pozorovatelným fyzikálním jevem a otázkou*, nikoli vzorcem nebo dlouhým textem.
- Každý slider musí mít konkrétní, okamžitě rozpoznatelný vizuální účinek; jinak je ovládání nedokončené.
- Když se mění veličina, zvýrazni právě ovlivněnou příčinu a následek (barvou, krátkým pulzem, šipkou, krátkým vysvětlením). Student má vědět **co změnil, co se stalo a proč**.
- Animace musí mít srozumitelné tempo. Příliš pomalá animace vytváří dojem nefunkčnosti, příliš rychlá skryje mechanismus. Pro symbolický čas nabídni regulaci rychlosti; explicitně odlišuj demonstrační tempo od fyzikálního času.
- Základní fyziku animuj programově pomocí SVG/Canvas/HTML; nepřidávej fotorealistický obrázek tam, kde zakrývá mechanismus. Používej plynulé `requestAnimationFrame`, skutečné delta-time, omezení počtu částic a respektuj `prefers-reduced-motion`.
- Neanimuj důsledek nepravdivým mechanismem. Např. delší doba **energetického** udržení nesmí být kreslena jako delší doba života konkrétního iontu.
- Student řídí experiment sám. Povolené jsou nepovinné vzorové pokusy, reset a nápověda; zakázané automaticky postupující „filmy“ a umělé odemykání kroků.
- Nejdřív mechanismus, pak porovnání, teprve nakonec rovnice. Je-li k dispozici vzorec, nesmí nahrazovat vysvětlení.
- V jediném pohledu odděluj typy fyzikálních objektů, energetické toky, zásoby a měřené výstupy; nepoužívej vizuálně stejné částečky pro ionty a unikající energii.

## Komponenty a kód
- Společné design tokeny v centrálním CSS (`tokens.css` / existující ekvivalent) a sdílené komponenty pro panely, range-inputy, značky, nápovědy a legendy. Nevkládej do každého modulu další nezávislý design systém.
- Zachovej stávající framework/architekturu, pokud je funkční. Nepřidávej knihovnu jen kvůli vizuálnímu efektu.
- Odděluj fyzikální model, animaci a DOM; změny grafiky nesmějí potichu měnit fyzikální výpočty ani konvence.
- Sjednoť základní velikosti, zarovnání, interakční stavy (hover/focus/disabled) a popisky veličin. Každý input má jednotku a dostupný čitelný název.
- Přístupnost: viditelný focus, ovládání klávesnicí, dostatečný kontrast, živé vysvětlující texty tam, kde se mění výsledek.
- Zachovej možnost běhu přes GitHub Pages jako statický web; bez backendu pro základní demonstrace.

## Postup práce a omezení zásahu
1. Nejprve vypiš, které design tokeny a komponenty lze sdílet a které části současného webu jsou rizikové.
2. Připrav samostatný návrh společných CSS pravidel a **jednu** ukázkovou obrazovku (např. rozcestník nebo jeden modul).
3. Ukaž změny před úpravou zbývajících modulů; vyžádej si mé schválení rozsahu. Staré moduly nepřestavuj automaticky.
4. Testuj desktop 1920×1080 a 1366×768, tablet, mobil a fullscreen. Nesmí vznikat překryvy nebo useknuté panely.
5. Udělej kontrolu fyzikálních popisků, jednotek a znaménkových konvencí; neměň existující odborné konvence bez upozornění.
6. Na konci uveď soubory, které jsi změnil, proč, a jak se dají změny vrátit.

## Akceptační test
Styl je soudržný na rozcestníku i v modulech, ale **fyzikální výjev zůstává dominantní**; nevzniká přehlcená nástěnka. Student po každé manipulaci do dvou sekund pozná vizuální důsledek. Kód funguje na GitHub Pages bez zásahů do zbývajících modulů.
