# Stručné souvislosti a ovládání modulů

Revize 16. 11. 2026. Výstupem je krátký průvodce pro každý z 57 modulů aktuálního katalogu. Každý obsahuje dva kroky ovládání, dvě důležité souvislosti, nejvýše jeden vztah, podklad a odkazy na navazující pokusy. Nejde o novou učebnici ani o úplnou odbornou revizi všech výpočtových modelů.

## Zdroje a skutečný rozsah čtení

- **Karel Chmelík: Stejnosměrné a komutátorové elektrické stroje, teorie obecného elektrického stroje.** Soukromý sken `versions/vyvoj/m_files/reference/direct-current/Chmelik-Stejnosmerne-a-komutatorove-stroje.pdf`, 126 stran PDF. Ověřena titulní strana, obsah a obrazové stránky s tištěnými čísly 13, 17, 20–22, 25–26, 29–30, 32, 34–35, 62, 81, 110, 113, 120–121 a 125. Tištěná stránka odpovídá stránce PDF o dvě nižší. Důležitá témata: rozdíl pole buzení a kotvy, místní působení kompenzace a pomocných pólů, změna proudu při komutaci, proud cívky versus proud kotvy, mechanická rovnice a transformace souřadnic. U vzorců se nepřebírá automaticky značení knihy: rozhraní zachovává konvence projektu.
- **Fitzgerald, Kingsley, Umans: Electric Machinery, 2003.** Relevantní oddíly kapitol 1–7, nikoli celá kniha stránku po stránce. Nově čteny zejména PDF 27, 39, 43, 83, 85, 138, 204, 208, 218, 297, 305, 333, 355 a 405 (tištěné strany o 15 nižší). Propojení: lineární indukčnost a její meze; magnetování a ztráty; příčná/podélná větev transformátoru; prostorové harmonické; d–q; výkonový úhel; skluzové ztráty a odpor rotoru. Předchozí ověřené kontroly stran 290–291 a dodatku C.2 jsou zdokumentované také v `reference/synchronous/README.md`.
- **Chapman, soubor pojmenovaný Electric Machinery Fundamentals (2004).** Jde o **Instructor’s Manual**, ne o celou učebnici. Pro definici změny napětí generátoru se používá dříve ověřený příklad 5-4(b–e), tištěné strany 115–116, PDF 121–122; viz `reference/synchronous/README.md`. Nezaměňovat změnu napětí při konkrétní zátěži s automaticky jmenovitou regulací.
- **Místní prezentace** `STEJNOSMERNE_1`, `STEJNOSMERNE_2`, `SYNCHRONNI_1_new`, `SYNCHRONNI_2(bude v TS2)` a `SYNCHRONNI_5`. Pro orientaci byl extrahován text; konkrétní vazby na modely navazují na referenční README a skutečné implementované ovladače. Použity zejména pasáže o vinutí, komutaci, BLDC a fázování. Samotná extrakce PDF není kontrolou všech schémat ani znaků.
- **`TEs knizka/`** obsahuje fotografované dvoustrany, nikoli vyhledávatelný text. Vizuálně zkontrolovány vybrané snímky: `sejmout0001.jpg` (tištěné str. 6–7), `sejmout0040.jpg` (84–85) a `sejmout0060.jpg` (124–125). Identita celé knihy není doložena titulní stranou; tyto snímky proto nová nápověda nepřipisuje automaticky Chmelíkovi. Starší zmínka „Chmelík, str. 79–82“ v synchronním README není touto revizí potvrzením identity této obrazové řady.
- **Kopylov nebyl použit**: dřívější poznámky projektu jej na pokyn autora vyloučily z revize. Kniha zůstává beze změny mezi soukromými podklady.
- **Fúze, galerie a vozidla:** uvedené učebnice strojů nepokrývají podrobnosti jejich modelů. Nápověda je proto označuje jako vlastní model/metodiku. Žádné nedoložené tvrzení se nepřipisuje Chmelíkovi. Skin/proximity odkazuje na analytické jádro `hf-core` a jeho hlášení ověření.

## Důležitá rozlišení v doplněném výkladu

1. Tok versus toková vazba; lineární superpozice versus nasycení; hysterezní energie za cyklus versus ztrátový výkon.
2. Magnetizační větev versus rozptyl; ustálený zkratový proud versus první nesymetrická špička; zapínací proud versus zkrat.
3. Časové versus prostorové harmonické; činitel vinutí pro konkrétní řád; potlačení harmonické versus současné zeslabení základní vlny.
4. Skluz a rotorová frekvence; přenos výkonu přes mezeru versus rotorové ztráty; účinek odporu na rozběh a účinnost.
5. Svorkové, vnitřní a budicí napětí; vnější a vnitřní úhel; motorická znaménková konvence; statická versus přechodová stabilita.
6. Souřadnicová transformace versus fyzikální změna proudu; amplitudová versus výkonová normalizace. Trojnásobek fázového výkonu se nepřenáší automaticky do poměrného modelu.
7. Komutace jako obrácení proudu cívky; proud cívky versus proud kotvy; pomocné póly versus kompenzační vinutí; časová pauza versus vypnutí proudu.
8. Fyzikální rychlosti produktů versus rychlost přehrávání; názorná velikost a povrch částice versus její skutečné rozměry.

## Integrace bez změny pracovních oken

Data jsou v `tools/module-guide-data.js`; obsluha v `tools/module-guide.js`, lokální styly v `tools/module-guide.css`. Sestavení je vkládá do aktuální aplikace přes `tools/build-physics-preview.cjs`. Nepřibyla externí závislost, žádné PDF ani skeny ve veřejném webu.

Tlačítko je pevně umístěné u pravého dolního okraje, na širokém monitoru v existující rezervě patičky s textem „Ovládání a výklad“, na užších oknech jako otazník s popisem. Nápověda je nativní modální dialog připojený přímo k dokumentu. Nevkládá se do hlavičky, měřeného modulu ani iframe; nemění jejich rozměry, styly, měřítko ani počet panelů. Nemění stav simulace a nevolá mount, dispose ani reset. Pokus může pod dialogem pokračovat. Escape zavře nápovědu dříve než obsluhu celé obrazovky. Přechod na jiný modul zavře starý výklad; historické odkazy galerie sdílejí jeden text.

Test `tools/test-module-guide.cjs` kontroluje přesné pokrytí skutečného katalogu, související odkazy, vzorce skutečným KaTeXem, zavírání, routování, izolaci od životního cyklu a úplnost vložení do offline sestavení. Společný test `Web/test-module-window-fit.cjs` ověřuje opakované škálování. Tyto kontroly nenahrazují vizuální kontrolu překryvů a čitelnosti v reálném prohlížeči. Prohlížeč se automaticky neotevírá.

## Mapa konkrétních modulů

Přesná mapa zdrojů, postupů a návazností je uložena u každého ID v `tools/module-guide-data.js`, nikoli v generovaném HTML. Následující tabulka shrnuje přiřazení bez opakování celého výkladu.

| Moduly | Hlavní doplnění | Podklad |
| --- | --- | --- |
| mag01, mag02, mag03, mag04 | Nasycení, paměť magnetování, energie smyčky, odlišné ztrátové mechanismy | Fitzgerald 1.2–1.4 |
| hf-skin-proximity | Vlastní a okolní pole, hloubka vniku, střídavý odpor | HF1/HF2 a jejich ověření |
| em01, em02, em03, em04 | Pohybové/transformační napětí, toková vazba, síla bez pohybu, výkon | Chmelík 33–34; Fitzgerald 1 a 3 |
| tr01, tr02, tr03, tr04, tr05 | Vazba, nasycení, přepočet schématu, příčná větev a rozptyl | Fitzgerald 1.4 a 2.2–2.5 |
| tr06 | Fázová/sdružená napětí a hodinové číslo | Fitzgerald 2.7 a místní modul |
| tr08, 11-transformator | Nesymetrie zkratu versus zapínací nasycení a remanence | Místní RL model; Fitzgerald 1.4 a 2 |
| 01-drazky, 07-vinuti, tocive-pole | Prostorový součet a podmínky kruhového pole | Fitzgerald 4.3–4.5 |
| 12-krok, 02-rozloha, 04-cinitel | Činitel pro daný harmonický řád a kompromis základní vlny | Fitzgerald 4.3, 4.6 a místní odvození |
| 03-pohyb, 05-drazkove, 06-casoprostor, 08-zesikmeni | Rychlost/směr harmonických, drážky a axiální skládání | Fitzgerald 4 a místní modely |
| am01, am02, am04, am05, 10-asynchronni | Skluz, frekvence rotoru, stabilní bod, odpor a mezní výkon | Fitzgerald 6.2–6.7 |
| sm01, sm07, sm08 | Úhel polí, salience, změna souřadnic a normalizace | Chmelík 37–38; Fitzgerald 5.6 |
| sm02, sm03, sm06 | Různá napětí a úhly, reluktanční moment a průmět proudu | Fitzgerald 5.2, 5.4, 5.7 |
| sm04 | Spojitost tokové vazby a meze modelu skoku proudu | Chmelík 38; Fitzgerald C.2; místní prezentace |
| sm05 | Napětí naprázdno a změna napětí při různém účiníku | Chapman Instructor’s Manual 5-4 |
| sm11, 09-synchronni, sm12 | Konstantní činný výkon, stabilita a podmínky fázování | Fitzgerald 5; místní synchronní podklady |
| sm09, sm10 | Proudový vektor a proudové/napěťové meze pohonu | Fitzgerald 5.8; vlastní model měniče |
| dc18, dc01, dc02, dc19 | Pole a komutátor, vinutí, proud cívky a proudové větve | Chmelík 4, 10, 18; STEJNOSMERNE_1 |
| dc06, dc17 | Obrácení proudu, indukčnost, kompenzace a pomocné póly | Chmelík 8–10 |
| dc03 | Zatížení → rychlost → indukované napětí → proud | STEJNOSMERNE_2; Chmelík 33–34 |
| dc16, dc15 | Mechanická versus elektronická komutace, snímač/odhad, PWM | Chmelík 22; STEJNOSMERNE_2 |
| 08-vozidla | Síla versus výkon a hranice energetické bilance | Vlastní model jízdních odporů |
| fu01, fu02 a historické odkazy galerie | Ruční řízení přehrávání, fyzikální hodnoty a názornost | Vlastní metodika fúze a galerie |
