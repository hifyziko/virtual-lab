# Anténa a elektromagnetická vlna

Aktuální stav: 18. listopadu 2026. Modul em06-vlna, skupina Elektřina a magnetismus.
Zdroje: versions/vyvoj/m_files/electromagnetic-wave/. Výstup: versions/aktualni/web/em-vlna/.

## Fyzikální model

Po připomínce uživatele byl původní bodový dipól nahrazen Liénardovým–Wiechertovým
polem skutečně pohybujících se bodových nábojů. Výchozím námětem je uživatelův
electron_field_oscillating_wire_v9.m, přečtený ze síťové cesty. Soukromý originál
se do veřejného výstupu nekopíruje. Dřívější model.js zůstává pro regresní testy.
Aktivní výpočet je lw-model.js.

Vnitřní jednotky: c=1, q/(4πε₀)=1, T₀=10 ns, λ₀=c/f₀, f₀=100 MHz.
Retardovaný čas se řeší zvlášť pro každý náboj Newtonovou metodou. Elektrické pole
obsahuje rychlostní i zrychlovací člen; celé magnetické pole je n × E / c.
Poyntingův vektor se počítá z celkových polí. Bezprostřední okolí nábojů je maskované.

Výchozí pokus přesune jeden kladný náboj kvintickým průběhem o 0,32 λ₀ mezi 4 a 18 ns.
Předtím i poté stojí, rychlost i zrychlení jsou na koncích nulové. Maximum rychlosti
je asi 0,43 c: záměrně názorný model, nikoli driftová rychlost elektronů v kovu.
Tři předvolby ukazují počáteční stav, vznik ohybu a odcházející poruchu. Poslední
rozšíří zorné pole, aby bylo vidět celé čelo. Zelené kružnice představují příčinné
hranice prvního pohybu a následného zastavení.

Dipólový pokus používá dva protiběžné nábojové balíky ±q, amplitudu 0,065 λ₀,
frekvenci 60–140 MHz a hladký náběh/doběh. Jde o předepsaný pohyb, nikoli model
proudového rozložení, rezonance či impedance reálné antény. Prostorový pohled je
místní rovinné přiblížení, bez geometrického zeslabování a blízkého pole.

## Technické zobrazení

Vlevo je výchozí mapa změny elektrického pole proti počátečnímu stavu, bílé
siločáry aktuálního pole a volitelné šedé původní siločáry. Lze přepnout velikost
E, podepsané Ez, velikost B, vektory nebo pouze mapu. Siločáry se integrují
adaptivním RK4 přímo z retardovaného pole, nikoli z hrubé obrazové mřížky.
Vpravo je vždy samostatná podepsaná mapa −By; tečky/křížky udávají směr vůči
pozorovateli. Volitelně jsou vidět šipky E × B. Sonda zůstává uvnitř zorného pole.

Rozsahy jsou pevné v čase, s číselnými legendami, lineární nebo log(1+20|u|)
stupnicí a plynulými nebo pásmovými barvami technického postprocessingu.
Nejde o výsledky FEM ani o data Ansys. WebGL počítá pole pro každý pixel mapy
v rozlišení podle DPR (1024 až 3072 bodů na stranu). Při nedostupném WebGL se
použije CPU pole 257 × 257 a interpolovaný rastr 1024 × 1024. Siločáry jsou v obou
větvích počítané přímo. Hustota siločar nevyjadřuje tok; nejsou to hmotná vlákna.

## Ověření

node tools/test-em-wave.cjs: nezávislé derivace pohybu, podsvětelná rychlost,
reziduum retardovaného času, statické Coulombovo pole, kauzalita, vznik i vymizení B,
Maxwellovy rotace a divergence mimo zdroj pro skutečný pohybující se náboj i dipól.
Dále starší regresní fyzika, pevné škály, siločáry, skutečný app.js nad testovacím
DOM, předvolby, ovládání, KaTeX, dialog a ukončení animace. Volitelné EM_CANVAS_MODULE
a EM_RENDER_DIR ukládají kontrolní snímky přes instalovaný canvas.

Kontrolní snímky CPU větve byly vizuálně prohlédnuty. Neobsahují DOM matematické
popisky; ty ověřuje samostatně KaTeX test. Kompletní zobrazení a kompilace WebGL
shaderu v prohlížeči nebyly ověřeny: nebyl dostupný otevřený náhled a podle
uživatelského pravidla se nový prohlížeč neotevírá.

Sestavení: node tools/build-em-wave.cjs obnoví obě existující aktuální dodávky
a jejich progressive balení. Je součástí společného build-release přes knihovnu.
Kontrola: tools/test-progressive.cjs a tools/test-module-guide.cjs.

## Zdroje

V. Kindl: electron_field_oscillating_wire_v9.m, funkce movingPointChargeField.
Feynman, Leighton, Sands: The Feynman Lectures on Physics, II, kapitoly 20 a 21:
https://www.feynmanlectures.caltech.edu/II_20.html
https://www.feynmanlectures.caltech.edu/II_21.html

Výklad je vlastní; neveřejné podklady se nepublikují. Push nebyl proveden.


## EM vlna: světlá scéna a spodní rozložení — 18. listopadu 2026

Odstraněn řádek Virtuální laboratoř… z modulu. Scéna má světlé pozadí
a tmavé čitelné popisky. Opravena výška panelů, spodní rezerva map, oddělení
časové osy a poloha popisků náboje. Vodorovné otáčení prostorové vlny nyní
sleduje tažení myši. Přestavěna aktuální dodávka; EM a progressive testy prošly.


Rozlišení po připomínce: plátna zohledňují také CSS zvětšení modulu (fit),
nejen DPR obrazovky, a mají rezervu 1,25× pro vyhlazení. Hustota 1,5 až 4
pixelů na návrhový bod. GPU mapy mají nejméně 1024 bodů na stranu;
CPU náhradní mřížka má přes 7× více bodů než předchozí verze.

Krátký balík zkrácen: náběh jednu periodu, dobíhání druhou. Po dvou
periodách je zdroj opět v klidu, vzdálené vyzářené pole se dále šíří.
