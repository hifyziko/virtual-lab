# COMPASS-U

Modul `fu10-compass` je v tématu Magnetické udržení a tokamak.
Zdroj je `versions/vyvoj/m_files/fusion/compass-u/`; uživatelský výstup
`versions/aktualni/web/index.html#fu10-compass`.

Velké video doplňuje kompaktní panel plánovaných návrhových hodnot.
Sestavení celého zařízení a detailní vnitřní sestava jsou dvě samostatná
videa s vlastní zapamatovanou pozicí. Videa se načítají až v otevřeném
modulu, vždy jen vybrané; žádné automatické přehrávání. Posuvník mění
čas, nikoli prostorový pohled. Připravený pohyb kamery je součástí videa.
Původní vzhled a rozměrové konvence ostatních modulů se nemění.

## Návrhové hodnoty

Ověřeno 19. 11. 2026 proti oficiálnímu přehledu ÚFP AV ČR:
[Tokamak overview](https://www.ipp.cas.cz/Compass_U/overview/),
oddíly Main design parameters, Heating power a Plasma facing components.
Hodnoty v `data.js` nejsou provozní měření ani příslib souběžného dosažení
všech maxim. Geometrie se při aktualizaci parametrů nepřepočítává.

- Toroidální pole 5 T, proud plazmatem 2 MA.
- Hlavní poloměr 0,894 m, vedlejší poloměr 0,27 m.
- Prodloužení 1,8; triangularita 0,3–0,6.
- Ustálená část výboje 1–3 s; až 11 s při nižších parametrech
  v konfiguraci lower single null.
- Počáteční ohřev: NBI 3–4 MW, ECRH 1 MW; navíc dva diagnostické
  svazky po 0,5 MW.
- Pozdější rozšíření: NBI až 8 MW, ECRH až 10 MW.
- Jmenovitá teplota první stěny a nádoby 300 °C; přehled uvádí až 500 °C.

Starší prezentace a články mají jiné etapy rozšíření ohřevu. Pro tuto
ukázku je rozhodující uvedený aktuální projektový přehled. Datum zahájení
provozu se nezobrazuje; modul nepřebírá zastaralé termíny ze starších článků.

## Obrazové podklady

Pořadí: Jan Klíma, CU_DOC_TokamakAssembly, snímky 11–82.
Předmontáž a doprava vnitřní sestavy: snímky 45–50. Nádoba se při
usazení vnitřku prezentačně skryje a následně odkryje na místě.
Vnitřní komponenty tedy neprolétají zavřenou stěnou nádoby.

Geometrie celého tokamaku zůstává z již schváleného zjednodušeného modelu.
Pro finální vzhled se mění materiály, světla a normály, nikoli vrcholy
nebo topologie. Hranice nad 25 stupňů zůstávají ostré; plošně vážené
normály chrání rovné desky. Soukromá kontrola SHA-256 potvrzuje shodnou
geometrii před a po úpravě normál. Malé detaily jsou záměrně potlačené.

Finální scéna celku má delší přílety dílů, proměnnou vzdálenost a výšku
kamery, pohled nad otevřenou sestavu a závěrečný oblet. Výstup je
1920 × 1080, 24 snímků/s, 2019 snímků (84,125 s). Obě aktivní videa mají
stejné čistě černé pozadí RGB 0,0,0. Nová PNG sekvence celku má skutečně
průhledný alfa kanál. Původní bílý studiový podklad se stíny je zachovaný
v samostatné světlé záloze; její hotové PNG jsou neprůhledné. Žádný světlý
výstup nebyl přepsán ani odstraněn. Ve videích nejsou popisky.

Soukromé CAD/PPT, Blender, úplné PNG sekvence a výrobní podklady nejsou
webové závislosti a nepatří do veřejného Gitu. Veřejný modul obsahuje pouze
video, malé náhledy, kód a přesně citované návrhové hodnoty.

## Kontroly

`node tools/test-compass-u.cjs` kontroluje volbu jediného videa,
zapamatování času, posuvník a obnovení přehrávání, rychlost, etapy ohřevu,
obnovu po chybě a uvolnění médií. Navigaci a sestavení ověřují společné
testy. Změna výstupu se dokončuje přes `node tools/build-release.cjs`
a `node tools/project/check.cjs`. Prohlížeč se automaticky nespouští.

Původní světlá záloha: celek 34 364 287 B, původní detail 20 130 103 B; oba klipy
Full HD při 24 snímcích/s. Načítá se pouze vybraný klip. Ověřeno všech
2019 snímků celku včetně SHA-256 kopie, dekódování MP4 a shoda barev.
Prošlo úplné sestavení i společná kontrola projektu. Prohlížeč nebyl spuštěn.

Aktivní černá varianta (19. 11. 2026): celek 27397300 B, vnitřek 20150673 B. Oba klipy mají stejný černý podklad; zachování
světlé zálohy včetně všech 2019 původních PNG ověřeno SHA-256.
Soukromé složky jsou Final-celek-cerne a Final-prulet-cerne; původní
Final-celek a Final-prulet zůstávají beze změny. Na veřejném webu jsou
pouze dvě aktivní černé varianty.
