# Grafické podklady a varianty vzhledu

## Platné rozhodnutí — 19. listopadu 2026

**Výchozí zůstává původní vzhled laboratoře.** Tmavý laboratorní styl je
uložená možnost pro budoucnost, nikoli schválený nový standard. Bez dalšího
pokynu uživatele jej nezapínat jako výchozí a nerozšiřovat na další moduly.

Aktuální pravidla práce jsou v [AGENTS.md](../../AGENTS.md). Přiložený návrhový
standard je referenční podklad; jeho imperativní formulace samy neautorizují
redesign, změnu rozložení, aktivaci ani publikaci.

## Varianta: tmavá vědecká laboratoř

- [Původní vizuální standard pro Codex](HIFYZIKO_VIZUALNI_STANDARD_PRO_CODEX.md)
  je uložený v nezměněném znění. Jeho zachování nezávisí na souboru na ploše
  konkrétního počítače.
- [Běžná aplikace](../../versions/aktualni/web/index.html) zachovává původní vzhled.
- [Samostatný náhled varianty](../../versions/aktualni/web/nahled-vzhledu.html)
  obsahuje úvod, oblast Elektřina a magnetismus a první sekci Základní
  elektromagnetické principy včetně jejich vnitřních panelů, scén a grafů.
  Náhled je generovaný soubor; vznikne při sestavení a není součástí veřejného
  publikačního výběru.

Směr varianty: navy pozadí, střídmé přechody, světlá typografie, jemné kontury,
kompaktní ovládání a významové barevné akcenty. Při případném pokračování
upravit i vnitřek modulů; samotný tmavý rám kolem světlých panelů uživatel
nepřijal. Poslední návrh zatím není finálně odsouhlasený ani vizuálně ověřený
v prohlížeči.

### Co při budoucím použití zachovat

- Existující poměry oken, plochu a čitelnost scén i grafů, rozložení panelů,
  automatické škálování a fullscreen. Výslovný požadavek uživatele zachovat
  poměry má přednost před doporučenými poměry nebo šířkami v podkladovém standardu.
- Fyzikální modely, data, význam barev, terminologii, KaTeX, ID ovladačů a odkazy.
  U barevných škál zachovat vazbu mezi hodnotou a barvou i jejich legendu.
- Původní materiálové přechody a numerické barevné mapy. Povinné barvy polí
  zůstávají elektrická jantarová `#b57825` a magnetická modrá `#356ac3`.
- Stávající vykreslování technických objektů; nepřekreslovat stroje zjednodušenou
  náhradou jen kvůli změně vzhledu.
- Samostatné porovnání s původním vzhledem a schvalování rozsahu po jednotlivých
  sekcích. Tato varianta neznamená souhlas s hromadnou přestavbou projektu.

### Zachovaná implementace

| Soubor | Účel |
| --- | --- |
| [visual-proposal.css](../../versions/vyvoj/m_files/Web/visual-proposal.css) | Sdílené barvy a styl vnějšího i vnitřního prostředí. |
| [visual-proposal.js](../../versions/vyvoj/m_files/Web/visual-proposal.js) | Omezení varianty na vybranou sekci a odkaz pro porovnání. |
| [visual-proposal-paint.js](../../versions/vyvoj/m_files/Web/visual-proposal-paint.js) | Prezentační adaptér CSS, SVG a Canvas i vložených lekcí; zachovává modely a geometrii. |
| [build-visual-proposal.cjs](../../tools/build-visual-proposal.cjs) | Vytvoření samostatného náhledu ze stávající progresivní dodávky a evidence v manifestech. |

Zdroje i tento podklad jsou zařazené do projektového seznamu souborů, aby
se uchovaly v historii a zdrojovém předání. Nejde o další číslovanou verzi.

### Jak na variantu později navázat

1. Přečíst toto rozhodnutí, návrhový standard a aktuální `AGENTS.md`.
2. Spustit `node tools/build-release.cjs`. Běžný `index.html` zůstane původní;
   sestavení vedle něj vytvoří samostatný `nahled-vzhledu.html` se společnými
   daty v `lazy/`. Pro samotnou obnovu náhledu z již sestavené dodávky lze použít
   `node tools/build-visual-proposal.cjs`.
3. Porovnat úvod a vnitřek první sekce s běžnou aplikací. Vizuálně ověřit
   desktop 1920 × 1080 a 1366 × 768, tablet, mobil a fullscreen; zkontrolovat
   ovládání, popisky, kontrast, fyzikální barvy a barevné škály.
4. Případné plošné nasazení připravit až na nový pokyn uživatele. Dosavadní
   adaptér je prototyp k posouzení, nikoli automatická migrace všech rendererů.
   Původní vzhled ponechat dostupný pro návrat.

Pro běžný provoz není nutné variantu odstraňovat ani upravovat zdroje:
spouštěcí vstup projektu i publikovaný web používají původní `index.html`.
Samostatný náhled nebyl publikován. Push vyžaduje výslovný pokyn uživatele.
