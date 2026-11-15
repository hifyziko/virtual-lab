# Krátký překmit po změně zatížení

- Výchozí úroveň tlumení kývání snížena z 3,0 na 1,4. Cílové lokální tlumení se odvozuje z tuhosti pracovního bodu a setrvačnosti; odečítá se již přítomné malé-signálové tlumení klecí a mechanickým odporem. Pomocný člen zůstává nezáporný a mimo synchronní pásmo nulový.
- Při kroku vnějšího momentu z 0,35 na 0,55 p. j. vychází překmit úhlu kolem 4,6–4,8 % pro všechny čtyři rotory a následné ustálení. Přidán behaviorální test překmitu, doby prvního maxima a odeznění.
- Stálé mechanické ztráty, vnější moment i pevné měřítko grafu zachovány.

# Pevné měřítko momentové charakteristiky

- Svislá osa momentové charakteristiky je pevná ±6 p. j., stejně jako u časového grafu momentu. Při změně buzení, vnějšího momentu a mechanických ztrát se rozsah nepřepočítává.

# Implicitní mechanické ztráty

- Princip synchronního stroje má stálý mechanický odpor Mztr = 0,12 ω + 0,02 ω |ω| v poměrných jednotkách. Vždy působí proti skutečnému pohybu a odebírá energii, v nule zaniká. Jde o výukové parametry, nikoli kalibraci konkrétního stroje.
- Mechanické ztráty jsou oddělené od tlumení relativního kývání; působí i při synchronních otáčkách a velkém skluzu. Pevně orientovaný vnější moment zůstává zachován.
- Ustálené momenty: Mem = Mvnější + Mztr. Jediná čárkovaná reference v grafu proto zobrazuje tento součet při synchronních otáčkách. Meze vnějšího momentu i přednastavený zatížený běh ztráty zohledňují.
- Ověřena pasivita pro oba směry, doběh volného rotoru, rovnováha se ztrátami a zachování skutečného utržení i pohonu generátoru.

# Upřesněná mechanická zátěž: vnější moment

- Podle pokynu uživatele je na hřídeli pouze pevně orientovaný vnější moment, nikoli pasivní brzda. Směr se při průchodu nulovou rychlostí rotoru nemění. Kladný parametr působí proti směru pole, záporný ve směru pole.
- Přetížený motor může zastavit a roztočit se zpět; přebytek hnacího momentu urychluje generátor nad synchronní rychlost. Model neobsahuje regulátor turbíny ani ochrany. Nezaměňovat se samovolným rozběhem při nulovém vnějším momentu.
- Odstraněno přidržení v nule a pasivní přepínání znaménka. Upraveny popisy a testy všech čtyř rotorů v obou směrech. Princip zůstává první ve skupině.

# Pasivní zátěž po utržení a pořadí modulů

- Kladný moment zátěže je nyní pasivní brzda. Za pohybu působí proti rychlosti, v klidu vyrovnává dostupný moment do své meze. Integrátor zachytí zastavení bez překmitu vynuceného brzdou. Záporné zadání dál modeluje aktivní pohon generátoru ve směru pole.
- Ztráta synchronismu sama o sobě neblokuje fyzikální pohyb; odstraněno je nechtěné aktivní pohánění konstantním brzdným momentem proti původním otáčkám.
- Princip synchronního stroje je první modul ve skupině Synchronní stroje; skupina je řazená podle čísel.
- Modelové testy: brzdná zátěž po přetížení zastaví a neobrátí rotor, oba směry a všechny čtyři typy, pasivní výkon i statické vyrovnání momentu.

# Ruční směr pole a rozběh bez klece

- Posuvník polohy pole má obrácený směr růstu úhlu: doprava snižuje matematický úhel a otáčí pole po směru hodin, doleva naopak. Popisky krajů jsou prohozené; znaménková konvence fyzikálního modelu zůstává stejná. Přímé tažení v řezu dál sleduje skutečnou polohu ukazatele.
- Pomocné tlumení kývání používá kompaktní pásmo: D = gain * Δω * max(0, 1 − (Δω/0,9)²)². Při |Δω| ≥ 0,9 je přesně nulové, aby nemohlo vytvářet umělý rozběhový moment. Moment tlumicí klece je samostatný.
- Modelově ověřen rychlý start bez klece po 240 s, oba směry a všechny čtyři rotory. Výsledek s nulovým a maximálním pomocným tlumením je při rychlém skluzu totožný, synchronní zachycení nenastává. Dále prošly kontroly pomalého sledování, ustálení, klece a přetížení.

# Plynulé otevření aplikace

- startup-presentation.cjs potlačí zobrazení přechodného rozcestníku během registrace offline modulů. Při načítání se zobrazí neutrální text, hotová aplikace se odhalí v prvním snímku po dokončení všech registračních skriptů.
- Použito visibility, nikoli display:none, aby se nezměnily rozměry grafů a modulů. Zapojeno na konci build-learning-release.cjs; opakované sestavení bloky neduplikuje.
- Ověřeno pořadí inicializace a odhalení i idempotence generátoru. Chrome nebyl spouštěn.

# Zklidnění rotoru synchronního principu

- Po upřesnění uživatelem upraven modul sm01-princip. Výchozí nastavení tlumení zvýšeno z 0,65 na 3,0, posuvník rozšířen do 6.
- Tlumení relativní rychlosti je přizpůsobeno tuhosti a počtu pólů. Ve velkém skluzu rychle klesá, aby nenahrazovalo asynchronní moment. Pasivní odpor při nulové synchronní vazbě zachován samostatně. Při synchronní rychlosti je tlumicí moment nulový.
- Prošly modelové kontroly všech čtyř rotorů, malého vychýlení, zatížení motoru/generátoru, rozběhu klecí a skutečného utržení při přetížení.

# 1.7.1 · Větší fázorový diagram a průhledné popisky

- Všechny matematické popisky SVG mají průhledné pozadí. Fázorák zabírá dvě třetiny pracovní plochy, na menších displejích je první.
- Vypnutí Ra sloučí reaktance v kresbě i napěťovém polygonu, se zachováním původního elektrického modelu. Samostatný přepínač zanedbání rozptylu mění model: odečte rozptyl od synchronních reaktancí. Teprve při nulovém odporu i rozptylu platí Ui=Ua.
- Ra má rozsah 0–1 p. j., uložená výchozí hodnota 0,25 p. j.
- Ověřeny modely, slučování šipek a výkonové bilance výpočtem. Pro tuto úpravu nebyl spouštěn Chrome.

# 1.7.0 · Výuková konstrukce schématu a fázorů

- Barevné schéma přepracováno podle dodaných obrázků: zdroj vlevo, samostatný vnitřní uzel, rozptyl a vypínatelný odpor před svorkami vpravo.
- Klasická konstrukce napěťového polygonu, proudový trojúhelník Ia + Ik = Iμ a kresba rotoru na ose d. Přepínatelný rozklad d/q, kroky konstrukce a přesné oblouky beta/phi.
- Čistá matematická geometrie v synchronous/schema-geometry.js, kresba v schema-drawing.js; DOM ovladače v schema.js.
- Ověřeno nezávislou impedanční maticí (792 stavů), 1200 sadami parametrů a kontrolami skutečných SVG šipek pro šest základních pracovních režimů. Nulová tuhost se odlišuje od záporné.
- Metodické poznámky a přesné příkazy testů: m_files/reference/synchronous/README.md. Dodané prezentace a obě knihy se dále přenášejí se zdrojovými archivy.

# Dokončení kontroly · 1.6.2

- Vypínač Ra přímo v horním ovládání. Generátorický komentář zobrazuje skutečný vnitřní úhel beta, shodný s obloukem v diagramu.
- Všechny modelové a prohlížečové kontroly prošly; archiv obsahuje prezentace, knihy a poznámky z kontroly.

# Historie vydání

## 1.5.7 · 8. listopadu 2026

- Obrázek synchronního stroje v rozcestníku označuje severní a jižní pól rovnými písmeny S a J bez matematického formátování.

## 1.5.6 · 8. listopadu 2026

- Pravý panel bez prázdného pružného řádku kolem vektorů; dostupnou výšku využívá průběh před/po.
- Větší nadpisy, hodnoty, vysvětlení a tabulka harmonických, zejména na vysokém okně.

## 1.5.5 · 8. listopadu 2026

- Levý obrázek využívá volnou výšku panelu se zachováním proporcí.
- Vlny pod statorem mají vyšší amplitudu kresby, samostatný prostor a větší odstup osových popisků. Upravená animace skládání sleduje novou společnou osu.

## 1.5.4 · 8. listopadu 2026

- Graf před/po využívá celou šířku panelu; výška obou pravých grafů se zvětšuje podle dostupné výšky okna.
- Popisek průběhu je mimo SVG pod křivkami. Zvětšený popisek vektorového součtu a ověřené rozložení na velkém displeji.

## 1.5.3 · 8. listopadu 2026

- Trvale dostupný posuvník zešikmení vedle předvoleb, ostatní parametry zůstávají sbalené.
- Prostorová vlna přímo pod vektorovým součtem, kompaktní dva panely s viditelnými amplitudami a tabulkou harmonických.

## 1.5.2 · 8. listopadu 2026

- Dva dominantní panely statoru a součtu příspěvků, s větším písmem a hodnotami. Průběh a harmonické tvoří druhou řadu.
- Fázorový diagram využívá prostor podle skutečného rozsahu vektorů. Proporce statoru zůstávají zachované.

## 1.5.1 · 8. listopadu 2026

- Vráceny viditelné bloky statoru, fázorů, číselných hodnot, průběhu a harmonických. Na širokém okně jsou ve třech sloupcích s menšími mezerami a výplněmi.
- Odstraněno nestejnoměrné škálování obrázku: stator, kruhový řez i harmonické mají původní proporce.
- Sbalené je pouze podrobné nastavení stroje. Popisek Činitel zešikmení zachován.

## 1.5.0 · 8. listopadu 2026

- Modul zešikmení se na notebooku soustředí na stator a mechanismus potlačení harmonické. Ovládání je vedle obrázku, odborné parametry, hodnoty a fázory jsou ve sbalených podrobnostech.
- Výška hlavního pokusu reaguje na výšku okna. Ověřeno umístění obrázku i sbalených podrobností do okna 1366 × 768.
- Popisek „Podepsaný činitel“ změněn na „Činitel zešikmení“.

## 1.4.0 · 8. listopadu 2026

- Animované vyrušení je začleněné přímo do rozvinutého statoru. Samostatný velký úvodní panel odstraněn.
- Vlny vycházejí ze skutečných axiálních poloh v obrázku drážek a při skládání se přesouvají na společnou osu pod statorem. Všechny používají stejné obvodové měřítko.
- Zachováno přehrání, zastavení, ruční skládání a zvýraznění dvojice. Podrobný původní pohled je dostupný přes Prohlédnout jeden řez.
- Původní verze 1.3.0 je zachovaná.

## 1.3.0 · 8. listopadu 2026

- Zešikmení začíná animovaným pokusem: posun fází axiálních příspěvků, přenos na společnou osu a přímo viditelné vyrušení výsledné harmonické.
- Zvýrazněná dvojice řezů a sonda ukazují odečítání opačných příspěvků ve stejném místě po obvodu. Výslednice má pevné měřítko a srovnání s nezprohýbanou vlnou bez zešikmení.
- Přímé porovnání bez zešikmení / potlačení drážkové periodicity; ruční ovládání překrytí, opakování a zastavení animace. Respektuje omezení pohybu v nastavení systému.
- Oddělené panely na mobilu, opravené polohy popisků zubů a drážek. Dřívější stator, fázory a výpočty zůstávají dostupné.

## 1.2.0 · 8. listopadu 2026

- Aplikace přejmenována na **Virtuální laboratoř elektrických strojů**, bez značky Hi! Fyziko v uživatelském rozhraní. Autorství a pracoviště zachovány.
- Zešikmení: čelní pohled na stator, stylizovaný rozvinutý vnitřní povrch se zuby a ústími drážek a zvýraznění jedné drážky po délce.
- Harmonická vykreslená přímo na statoru a ve stejném obvodovém měřítku pod ním. Volba axiálního řezu ukazuje fázový posun; srovnání krajních řezů a průměru celé délky.
- Čitelnější kompaktní popisky na mobilu. Model činitele zešikmení a původní moduly zachovány.
- Verze 1.1.0 a 1.0.0-pred-upravami zůstávají dostupné beze změny.

## 1.1.0 · 8. listopadu 2026

- Nový vzhled rozcestníku při zachování log a barev tematických skupin.
- Témata jsou při prvním otevření sbalená; návrat z modulu zachovává otevřenou skupinu v dané relaci prohlížeče.
- Hledání bez diakritiky, počty modulů, rozbalení a sbalení všech témat.
- Vinutí: činitel zešikmení drážek, geometrie, součet axiálních fázorů, prostorová vlna a porovnání harmonických.
- Fyzikální principy: elektromechanická přeměna, vodič v poli, transformátor a výkonová bilance asynchronního motoru včetně mezních stavů.
- Odkaz na obecnou přeměnu z pokusů Proč odpor a Kam jde výkon v asynchronním motoru.
- Samostatný balíček webu a přehled uložených verzí. Angličtina odložena na další etapu.

## 1.0.0-pred-upravami · 8. listopadu 2026

- Archiv původní aplikace před uvedenými zásahy, spustitelný kompaktní web a vývojové zdroje s kontrolními součty.
- Záloha neobsahuje cache prohlížečů a surové výsledkové databáze FEM. Ty zůstávají v pracovním projektu; přehrávače a data potřebná pro výuku jsou součástí uloženého webu.






# 1.6.0 · Náhradní schéma synchronního stroje

- Uložen schválený stav 1.5.8-pred-schematem: samostatný web a ověřený archiv 3 795 vývojových souborů. Velké výsledky FEM zůstávají v pracovním projektu podle stávajícího zálohovacího postupu.
- Nový modul sm02-schema: propojené jednofázové náhradní schéma, fázory, osy d/q a výkony. Hladký rotor i vyniklé póly, buzení, úhel β, odpor a reaktance.
- Výukové kroky konstrukce, motor/generátor/kompenzátor, odpojené buzení, odbuzení a přibuzení při konstantním P. Nedostupný stabilní bod se výslovně hlásí.
- Motorická konvence, RMS fázory, normalizovaná třífázová výkonová báze; model ustáleného stavu. KaTeX funguje offline.

# 1.6.1 · Vnitřní napětí, zátěž generátoru a společná grafika

- Piktogramy přebírají skutečný renderer ze synchronního principu, včetně drážek a budicího vinutí.
- Generátor lze zadat činným výkonem zátěže a jejím fázovým posuvem. Model dopočítá Uib a beta, rozlišuje výstupní Ig a vstupní I.
- Schéma zrcadlené: buzení vlevo, svorky vpravo. Samostatný rozptyl, reakce kotvy a vnitřní napětí Ui. Ui je svislou reálnou referencí; imaginární osa vodorovná. Komplexní veličiny mají pruh nahoře, Ef přeznačeno na Uib.
- Beta je po ověření v podkladech rozdílem argumentů vnitřního Ui a budicího Uib; od terminálového úhlu se rozlišuje i ve výpočtu. Ra má samostatný vypínač. Podklady a kontrola knih jsou přibaleny ke zdrojům.

