# Magnetické přepojení a vznik ostrova — rešerše a návrh

## Realizovaná první etapa — 18. listopadu 2026

Modul `fu08-ostrovy` / `fusion/islands` nyní ukazuje počátek rezistivní
ostrůvkové nestability v místní Harrisově proudové vrstvě. Starší návrh
níže popisuje také dosud nerealizované části: tokamakový řez, prostorový
ostrov, nelineární vývoj, NTM a ECCD. Nejde o dokončení těchto rozšíření.

Realizace používá dvě lineární rovnice redukované MHD pro poruchu toku
a vířivost; `model.js` obsahuje znaménkové konvence a `index.html` jejich
úplné vysvětlení. Pevný interval x = −8 až 8, periodická harmonická y,
257 bodů, k = 0,7, magnetická difuzivita 0,02, viskozita 0,01. Harrisova
tloušťka a = 0,7 nebo 2; počáteční toková amplituda ve středu 10⁻⁵,
počáteční proudění nulové. Rovnováha je udržovaná, její vlastní difuze
je odečtená. Časový krok 0,008, explicitní metoda středního bodu,
Poissonova úloha řešená tridiagonálně. Data generuje
`node tools/precompute-islands.cjs`; runtime nic nepřepočítává.

Úzká vrstva vykazuje růst, široká útlum. Růst končí při W/a = 0,12
(t* přibližně 92,58), útlum při t* = 160. Limit je didaktický limit
časového záznamu malé poruchy, nikoli vypočtená saturace či univerzální
hranice linearity. Přesnější mez závisí na rezistivní vrstvě.

Test `tools/test-islands.cjs` kontroluje shodu časového kroku a prostorové
sítě (257 proti 513 bodům, amplituda po t*=40 do 1 %), Poissonův reziduál,
symetrii a energetickou bilanci poruchy. Diskrétně platí
dE/dt = −k ∫ f B₀″ p dx − η ∫ (Lp)² dx − ν ∫ ω² dx;
energie může přicházet z udržované rovnováhy, difuzní členy ji odčerpávají.
Modelový hash chrání shodu dat se zdrojem. Ověřeno také ovládání,
KaTeX, pauza, přehrávání, časový posuvník a disposal. Siločáry vykreslené
skutečným canvasem byly vizuálně prohlédnuté; celá stránka v prohlížeči
automaticky neotevřena. Modul je přidaný do společného sestavení a lazy
načítání. Původní soukromé ani veřejné převzaté obrázky nejsou přibalené.

18. listopadu 2026. Návrh dalšího modulu, nikoli implementovaný modul.

## Schválené zaměření — 18. listopadu 2026

Uživatel schválil pokračování s prioritou názorně vysvětlit příčinu
a časový vývoj nestability. Výchozí pokus má postupovat od proudového
profilu přes malou poruchu k přepojení a růstu ostrova. Děj musí být
čitelný bez předchozí znalosti MHD a umožňovat pauzu a krokování.

Výchozí otázka pro studenta: Proč se jedna malá porucha utlumí,
zatímco druhá sama zesílí?

Výklad má postupně odhalit:

1. Proud plazmatem vytváří část magnetického pole. Jeho prostorové
   rozložení určuje výchozí konfiguraci a může poskytovat volnou energii
   rezistivní ostrůvkové nestabilitě. Samotná nerovnoměrnost proudu
   ani racionální hodnota q nestačí jako obecné kritérium nestability.
2. Stejný malý počáteční podnět vyvolá ve dvou doložených konfiguracích
   odlišnou odezvu. Student vidí profil proudu a graf velikosti poruchy.
3. V úzké rezistivní vrstvě se může změnit propojení siločar. Elektrický
   odpor umožňuje porušení zamrznutí toku; není sám zdrojem energie
   a nezaručuje růst každé poruchy.
4. Přepojené pole vytváří ostrov se středem, separatrix a X-body.
   Zvětšování ostrova je svázané s časovým vývojem vypočteného pole.
5. Prostor a řez ukazují stejný útvar. Navazující výklad vysvětlí
   vliv ostrova na transport a odliší mechanismus NTM.

Při přípravě není dovoleno nahradit chybějící dynamiku automaticky
rostoucím geometrickým parametrem a označit jej za MHD simulaci.
Stav realizace: schváleno zaměření; numerický model a modul zatím
nejsou implementované ani ověřené.

## Návaznost na projekt

Aktuální katalog obsahuje Plyn, ionizovaný plyn a plazma; Fúzní reakce
a Coulombovu bariéru; Drift částic v poli; Magnetické udržení; Divertor
a Galerii částic, jader a atomů. Nový pokus navazuje na magnetické plochy,
helicitu a bezpečnostní faktor v Magnetickém udržení. Divertor poskytuje
známé pojmy separatrix a X-bod; jeho osově symetrické rovnovážné pole
však samo nemodeluje neosově symetrickou ostrůvkovou nestabilitu.

## Hlavní podklad

S. Entler, V. Kindl: Jaderná fúze a fúzní elektrárny,
kap. 7.18, s. 171–172, rámeček 7.10 na s. 171:

- nestabilita znamená samovolné zesilování malé poruchy;
- rezistivní ostrůvková nestabilita (RTM) souvisí s profilem proudu,
  přepojením pole a vznikem magnetických ostrovů;
- neoklasická ostrůvková nestabilita (NTM) zesiluje již existující ostrov
  prostřednictvím změny bootstrap proudu po vyhlazení tlakového profilu.

Kap. 7.19, s. 172–173 pojednává o disrupcích. Ostrov se nesmí automaticky
vydávat za disrupci. Obr. 7.22 na s. 172 ukazuje tepelné následky disrupce
na první stěně JET, nikoli mechanismus vzniku ostrova.

Kap. 9.3.2, s. 193 uvádí možnost zacílit elektronový ohřev na ostrovy
a vznikající nestability. Detailní stabilizace NTM pomocí vlečení proudu
ECCD potřebuje doplňující odborný model; nelze ji redukovat na libovolné
lokální přihřátí.

Relevantní stránky byly přečteny; s. 171 a 172 také vizuálně prohlédnuty.
Soukromé stránky ani jejich obrázky se nepřibalují do veřejného modulu.

## Prohlédnuté obrazové a modelové reference

1. O. Agullo, Resistive MHD Stability Theory, ITER School 2017.
   https://www.iter.org/sites/default/files/education/lecture_olivier_agullo.pdf
   - PDF s. 8 / snímek 7: prostorový ostrov z NIMROD a helikální řez.
   - PDF s. 17 / snímek 16: převod toroidálního řezu do místního rovinného
     modelu; O-bod, X-bod, separatrix a šířka ostrova.
   - PDF s. 18–20 / snímky 17–19: vyhlazení teplotního profilu a transport.
   - PDF s. 22–29: rezistivní model a lineární růst.
   Obrázky na PDF s. 8 a 17 byly osobně vizuálně prohlédnuty.

2. A. Sen, Introduction to NTMs and Role of Rotation, ITER School 2010.
   https://www.iter.org/sites/default/files/education/Sen_Abhijit_talk.pdf
   - PDF s. 5: přechod od magnetických ploch k proudové vrstvě a ostrovům.
   - PDF s. 13: zpětná vazba mezi vyhlazením tlaku, výpadkem bootstrap
     proudu a růstem NTM; význam konečného prahu velikosti ostrova.
   - PDF s. 31–39: stabilizace a přesnost zaměření ECCD.
   Obrázky na PDF s. 5 a 13 byly osobně vizuálně prohlédnuty.

3. E. G. Kostadinova et al., Energetic electron transport in magnetic fields
   with island chains and stochastic regions, J. Plasma Phys. 89 (2023),
   905890420. DOI: https://doi.org/10.1017/S0022377823000879
   https://www.cambridge.org/core/journals/journal-of-plasma-physics/article/energetic-electron-transport-in-magnetic-fields-with-island-chains-and-stochastic-regions/58D4405E5EEE579812352798C3B36F06
   Obr. 1 byl vizuálně prohlédnut: Poincarého mapa rekonstruovaného pole
   výboje DIII-D, rozlišení O-bodu, X-bodu a separatrix; druhý panel
   ukazuje stochastickou oblast se zbytky ostrovů. Nejde o přímou fotografii
   siločar ani univerzální výsledek jediného ostrova. Článek je CC BY 4.0;
   pro modul přesto navržena vlastní kresba vypočteného pole.

4. H. Betar, D. Del Sarto, M. Ottaviani, A. Ghizzo, Microscopic scales of linear tearing modes:
   a tutorial on boundary layer theory for magnetic reconnection,
   J. Plasma Phys. 88 (2022), 925880601.
   https://www.cambridge.org/core/journals/journal-of-plasma-physics/article/microscopic-scales-of-linear-tearing-modes-a-tutorial-on-boundary-layer-theory-for-magnetic-reconnection/87490EEB31BEA2A9F52DE39B5A513B78
   Oddíl 2.1 a obr. 2 rozlišují ustálené přepojení od růstu tearing módu.
   Textově ověřeno; samotný obrázek nebyl kvůli nedostupnému obrazovému
   endpointu vizuálně prohlédnut. Nepoužívat jej jako ověřenou grafickou
   předlohu.

5. PPPL, M3D-C1 Overview, část Reduced Models.
   https://m3dc1.pppl.gov/m3dc1_overview.html
   Podklad k reprezentaci bezdivergentního pole potenciály a k rozlišení
   redukovaného modelu od plné rozšířené MHD.

## Doporučené znázornění

Pracovní název: Magnetické přepojení a vznik ostrova.

Tři propojené pohledy, přičemž lokální detail má dostat největší plochu:

1. Místní rovinný detail rezonanční vrstvy. Na začátku rovnoběžné složky
   pole opačného směru po stranách vrstvy; malá porucha; následně vznik
   O-bodu, X-bodů a oddělující separatrix. Umožnit pauzu a krokování.
   Všechny magnetické čáry modré; konkrétní vybraný svazek odlišit
   tloušťkou a označením, elektrické veličiny případně jantarové.
2. Poloidální řez a volitelná Poincarého mapa. Nejprve vnořené plochy,
   poté ostrovy u vybrané racionální plochy. Pro první příklad mód 2/1:
   v řezu dvě ostrovní oblasti. Při trasování ukládat průsečíky stejné
   siločáry s pevnou toroidální rovinou. Průsečíky nejsou částice.
3. Prostorový pohled na tutéž helikální strukturu s vyznačenou řeznou
   rovinou. Jednu siločáru lze sledovat a současně zobrazovat její
   průsečíky. Dvě oblasti v řezu mohou patřit jediné propojené struktuře
   vinoucí se kolem toru. Prostorový pohled musí vznikat z téhož
   geometrického modelu jako řez, nikoli nezávislou dekorací toru.

Místní rovinný model je přiblížení okolí rezonanční plochy; jeho geometrické
zasazení do toru není plnohodnotná toroidální MHD simulace. Oba významy
je třeba vysvětlit. V okolí X-bodu může vymizet příčná/helikální složka,
zatímco celkové pole má stále nenulovou vodicí toroidální složku.

## První experiment: porucha se tlumí, nebo roste

Stejná malá počáteční porucha ve stabilním a nestabilním nastavení.
Po stisku Spustit už student amplitudu neposouvá; vidí její vývoj
a vznikající šířku ostrova. Přidat jednoduchý časový graf amplitudy
poruchy či šířky ostrova. Růst nemá být vyvolán náhodným vlněním kresby.

Pro skutečný vývoj doporučen ověřený dvoupolový redukovaný rezistivní
MHD model pro magnetický tok a proudění. Malý výběr scénářů lze spočítat
předem, uložit a načítat až po otevření modulu. Vyžaduje samostatné
zvolení a ověření rovnováhy, okrajových podmínek, rezistivity, viskozity,
normalizace a parametrů stability před implementací.

Analytické pole s ručně měněnou amplitudou je vhodné pro samostatné
zkoumání topologie. Nesmí se označovat jako výpočet vzniku nestability.
Samotná Rutherfordova rovnice popisuje určitou fázi nelineárního vývoje;
bez ošetření přechodů režimů nestačí k průchodu od nulové poruchy.

## Navazující experimenty

- NTM: existující zárodečný ostrov, vyhlazení tlakového profilu, změna
  bootstrap proudu a zesílení ostrova. Výslovně odlišit od klasické RTM.
- Cílené ECCD: zacílení oblasti vlečení proudu a porovnání se zaměřením
  mimo ostrov; model musí obsahovat odpovídající stabilizační člen.
- Více módů a překryv ostrovů: zánik části pravidelných ploch a
  stochastické siločáry. To potřebuje model s více helicity;
  náhodně rozházené body nejsou důkazem chaotického pole.

## Kontroly před případnou realizací

- Bezdivergentní pole a shoda siločar s tokovými konturami.
- Poincarého průsečíky skutečně vypočtené ze stejného pole.
- Správný počet ostrovů a toroidální/poloidální periodicita módů.
- Tlumící a rostoucí scénář pro stejnou malou poruchu; časová a síťová
  konvergence a kontrola energetické bilance zvoleného modelu.
- Nenulová vodicí složka není omylem vymazána v X-bodu.
- Geometrické prohlížení, pohyb značek po siločáře a fyzikální časový
  vývoj mají jasně rozlišené ovládání i popis.
- Kompaktní ovládání a společný dialog Ovládání a výklad podle projektu.

Výsledek této rešerše je návrh. Nový modul, numerická báze ani veřejné
obrazové assety zatím nevznikly; předpočty nebyly spuštěny.


## Přepracování názornosti po připomínce uživatele

Původní samostatný detail ostrova neposkytoval dostatečný kontext.
Nový výchozí pohled ukazuje vlastní prostorové schéma tokamaku, příčný
řez s vnořenými plochami a vybranou vrstvu, propojenou s rozvinutým
místním pohledem. Výslovně se odlišuje schéma od globálního MHD řešení
a příčná složka vůči rezonanční šroubovici od celého magnetického pole.
Čtyři kroky: Kde se to děje; Proud vytváří pole; Jak se pole přepojí;
Růst, nebo útlum. Přepnutí kroku nezmění fyzikální čas.

V detailu jsou dvě periody: X-body leží uvnitř obrazu, centrální O-bod
uprostřed. Pevná hodnota tokové funkce šestkrát větší než počáteční
porucha zvýrazňuje nejprve dvě oddělené větve, později uzavřenou
konturu v ostrově. Nejde o sledování totožnosti hmotné siločáry.
Zelené šipky vycházejí z uložené proudové funkce: vx=−k f cos(ky),
vy=f′ sin(ky), délky normalizované pro každý snímek a promítnuté
stejně jako souřadnice. Fialové tečky v rovnovážném kroku znázorňují
proud k pozorovateli. Šipky jsou společné vyplněné siluety.

Vizuálně prohlédnuty skutečné canvasové náhledy kontextu a detailu
před/po přepojení. Test doplněn o průchod čtyřmi kroky a viditelnost
kontextu, proudu a proudění. Celá HTML stránka v prohlížeči neotevřena.
