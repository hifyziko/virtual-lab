/* Short original teaching notes. Source locators and review limits: docs/LITERATURA-MODULY.md. */
(() => {
 'use strict';
 const sources = {
  magnetic:'Bartoš: Teorie elektrických strojů, str. 6–7 (magnetický obvod a tokové vazby); Fitzgerald: Electric Machinery, kap. 1.2–1.4 (materiály a střídavé buzení).',
  energy:'Chmelík: kap. 33–34, tištěné str. 110 a 113 (napěťová a pohybová rovnice); Fitzgerald: Electric Machinery, kap. 3 (síla, moment a energetická bilance).',
  transformer:'Fitzgerald: Electric Machinery, kap. 2.2–2.5 a 2.7 (transformátor a náhradní schéma).',
  winding:'Fitzgerald: Electric Machinery, kap. 4.3–4.6 (rozložené vinutí, točivé pole a napětí).',
  induction:'Fitzgerald: Electric Machinery, kap. 6.2–6.5 a 6.7 (skluz, moment a odpor rotoru).',
  synchronous:'Chmelík: kap. 37–38, tištěné str. 120–121 a 125 (transformace a model stroje); Fitzgerald: Electric Machinery, kap. 5.2 a 5.4–5.8 (fázory a výkonový úhel).',
  coordinates:'Chmelík: kap. 37, tištěné str. 120–121 (Parkova transformace); normalizace a směry os podle modelu projektu.',
  skin:'Vlastní analytické jádro HF1/HF2; předpoklady a ověření v hf-core/README.md a hf-core/HLASENI_OVERENI.md.',
  dc:'Chmelík: Stejnosměrné a komutátorové elektrické stroje, teorie obecného elektrického stroje; kap. 4, 6 a 18, tištěné str. 13, 17 a 62.',
  commutation:'Chmelík: týž svazek, kap. 8–10, tištěné str. 25–38 (reakce kotvy, kompenzace a komutace).',
  dcwinding:'Chmelík: kap. 10 a 18, tištěné str. 29–30 a 62 (komutace a proudové větve kotvy).',
  dcdrive:'Chmelík: kap. 33–34, tištěné str. 110 a 113 (napěťová a pohybová rovnice); vlastní model pohonu projektu.',
  bldc:'Chmelík: kap. 22, tištěná str. 81 (princip elektronické komutace); vlastní model řízení BLDC projektu.',
  transient:'Chmelík: kap. 38, tištěná str. 125 (budicí a tlumicí obvody); Fitzgerald: Electric Machinery, dodatek C.2.',
  syncconnect:'Vlastní výukový model fázování generátoru k síti a jeho metodika.',
  stiffness:'Bartoš: Teorie elektrických strojů, str. 124–125 (synchronizační moment); Fitzgerald: Electric Machinery, kap. 5.7.',
  regulation:'Chapman: Instructor’s Manual, příklad 5-4(b–e), tištěné str. 115–116. Jde o příručku řešení, nikoli plnou učebnici.',
  model:'Vlastní výukový model projektu a jeho metodika; uvedené knihy elektrických strojů toto téma nepokrývají.',
  lawson:'S. Entler, V. Kindl, Jaderná fúze a fúzní elektrárny, kap. 1.8, rámeček 1.4, str. 27; kap. 12.2, rámeček 12.1, str. 327; kap. 12.4–12.5, str. 329 a kap. 12.7, str. 333–334.',
  plasma:'S. Entler, V. Kindl: Jaderná fúze a fúzní elektrárny, kap. 2.1–2.2, str. 30–32; rámečky 2.1 a 2.3.',
  drift:'S. Entler, V. Kindl: Jaderná fúze a fúzní elektrárny, kap. 7.3–7.4, str. 141–148 (gyrace a drifty).'
 };
 const entries = {};
 function add(id, source, controls, points, equation, related) {
  if(entries[id]) throw Error('Duplicate module guide: '+id);
  entries[id]={source,controls,points,equation,related};
 }
 add('mag01-magnetizace','magnetic',
  ['Měňte budicí pole a sledujte současně domény a magnetizační křivku.','Porovnejte začátek magnetizace s oblastí nasycení.'],
  ['Nasycení znamená malý další přírůstek indukce při dalším zesilování pole; neznamená konec magnetického pole.','Doménový obrázek vysvětluje mechanismus, není mikroskopickým výpočtem konkrétního materiálu.'],null,['mag02-hystereze','tr02-magnetizacni']);
 add('mag02-hystereze','magnetic',
  ['Projděte buzením oběma směry a porovnejte stejné buzení při růstu a poklesu.','Sledujte, co zůstává po návratu budicího pole k nule.'],
  ['Stav závisí také na předchozím magnetování. Remanence a koercitivní pole popisují různé průsečíky hysterezní smyčky.','Pohyb doménové stěny je názorná idealizace; skutečný materiál má mnoho domén a mechanismů přepínání.'],null,['mag03-hysterezni-ztraty','11-transformator']);
 add('mag03-hysterezni-ztraty','magnetic',
  ['Měňte rozsah magnetování a porovnávejte plochu uzavřené smyčky.','Sledujte rozdíl mezi energií jednoho cyklu a výkonem ztrát.'],
  ['Plocha smyčky představuje energii rozptýlenou za cyklus a jednotku objemu.','Při stejné smyčce více cyklů za sekundu znamená větší ztrátový výkon. Skutečná smyčka se může s frekvencí také měnit.'],String.raw`w_h=\oint H\,\mathrm dB`,['mag02-hystereze','mag04-virive-proudy']);
 add('mag04-virive-proudy','magnetic',
  ['Porovnejte proudové smyčky v plném a děleném jádře pomocí dostupných voleb.','Měňte frekvenci a sledujte velikost ztrát.'],
  ['Proměnný tok indukuje uzavřené proudy i v samotném vodivém železe.','Izolované plechy omezují proudové cesty. Neodstraňují hysterezní ztráty; jde o dva různé mechanismy.'],null,['mag03-hysterezni-ztraty','hf-skin-proximity']);
 add('hf-skin-proximity','skin',
  ['Zvyšujte frekvenci a porovnávejte rozložení proudu uvnitř vodičů.','Porovnejte samostatný vodič se soustavou blízkých vodičů.'],
  ['Skin efekt souvisí s vlastním proměnným polem, proximity efekt s polem okolních vodičů.','Nerovnoměrné rozložení proudu zvyšuje střídavý odpor a ztráty. Hloubka vniku je měřítko útlumu, nikoli ostrá hranice vedení.'],String.raw`\delta=\sqrt{\frac{2\rho}{\omega\mu}}`,['mag04-virive-proudy','tr05-rozptylova-reaktance']);
 add('em01-indukovane-napeti','energy',
  ['Natočte snímací cívku posuvníkem nebo tažením ve scéně. Porovnejte souhlasné, kolmé a opačné natočení při stejném buzení.','Zvyšte frekvenci při stejné amplitudě proudu. Porovnejte vrcholy tokové vazby a napětí. Pozastavte animaci a najděte okamžik největšího napětí.'],
  ['Obě cívky stojí. Proud první cívky mění tokovou vazbu druhé. Největší velikost napětí nastává při nejrychlejší změně vazby.','Vzájemná indukčnost je při pevné poloze cívek v tomto lineárním modelu konstantní.'],String.raw`u_i=-M\frac{\mathrm d i_1}{\mathrm dt}`,['em01-pohybove-napeti','em02-vzajemna-indukcnost']);
 add('em01-pohybove-napeti','energy',
  ['Táhněte tyčí v poli a obraťte směr. Sledujte polaritu voltmetru.','Při posuvu pole měňte jeho rychlost. Při otáčení cívky sledujte napětí během jedné otáčky.'],
  ['V homogenním poli závisí napětí tyče na indukci, aktivní délce vodiče a rychlosti kolmé k poli i vodiči.','Ve stojící cívce se při posuvu prostorově proměnného pole mění tok. V otáčející se cívce se mění její orientace vůči poli.'],String.raw`u_i=Blv`,['em01-indukovane-napeti','em02-vzajemna-indukcnost']);
 add('em02-vzajemna-indukcnost','magnetic',
  ['Měňte proudy a vazbu cívek a sledujte jejich společný a rozptylový tok.','Porovnejte změnu proudu v první cívce s odezvou druhé.'],
  ['Vzájemná indukčnost popisuje tokovou vazbu jedné cívky způsobenou proudem druhé.','Lineární superpozice předpokládá stálé parametry magnetického obvodu; při nasycení tento předpoklad obecně neplatí.'],String.raw`\psi_1=L_1 i_1+M i_2`,['tr01-matematicky','tr05-rozptylova-reaktance']);
 add('em03-silove-ucinky','energy',
  ['Obracejte směr proudu v jednom vodiči a porovnávejte směr sil.','Měňte vzdálenost vodičů a sledujte sílu i tvar pole.'],
  ['U rovnoběžných vodičů se stejně orientované proudy přitahují a opačně orientované odpuzují.','Síla působí i bez pohybu. Mechanický výkon ale vyžaduje pohyb ve směru její složky.'],String.raw`p_{\mathrm{mech}}=\mathbf F\cdot\mathbf v`,['em04-premena','dc01-princip']);
 add('em05-reluktance','energy',
  ['Při zapnutém proudu vychylte kotvičku a pusťte ji. Sledujte úhel a moment.','Obraťte proud cívky a porovnejte moment při stejném úhlu. Nastavením tlumení měňte dobu, po kterou kotvička kmitá.'],
  ['Reluktanční moment je úměrný druhé mocnině proudu a závisí na natočení kotvičky.','Souosé natočení kotvičky odpovídá větší indukčnosti a menší reluktanci magnetického obvodu.'],
  String.raw`M=\tfrac12 I^2\frac{\mathrm dL}{\mathrm d\vartheta}`,['em02-vzajemna-indukcnost','em04-premena']);
 add('em04-premena','energy',
  ['Projděte jednotlivé experimenty a vždy porovnejte sílu, pohyb a elektrický výkon.','Zastavte pohyb a odlište nenulovou sílu či moment od mechanického výkonu.'],
  ['Přivedená energie se může rozdělit na energii pole, mechanickou práci a ztráty.','Indukované napětí nelze obecně ztotožnit jen s pohybovým napětím; existuje také transformační složka.'],String.raw`p_{\mathrm{mech}}=M\omega`,['em01-indukovane-napeti','dc03-schema']);
 add('tr01-matematicky','transformer',
  ['Měňte proudy a vazbu vinutí; sledujte vazby toků a napěťové rovnice.','Porovnejte dokonalou vazbu s případem rozptylu.'],
  ['Tok a toková vazba nejsou stejné veličiny: vazba zahrnuje i počet závitů.','Převod napětí ideálního transformátoru plyne ze společného toku, nikoli ze stejnosti proudů obou vinutí.'],String.raw`\psi=N\Phi`,['tr03-schema','tr05-rozptylova-reaktance']);
 add('tr02-magnetizacni','transformer',
  ['Porovnejte časový průběh toku s magnetizačním proudem.','Měňte buzení a sledujte nárůst proudových špiček při vstupu do nasycení.'],
  ['Při téměř sinusovém napětí může být magnetizační proud výrazně nesinusový.','Při daném kmitočtu určuje tok především integrál napětí; zvýšení napětí nebo snížení frekvence přibližuje jádro nasycení.'],String.raw`u_i=N\frac{\mathrm d\Phi}{\mathrm dt}`,['mag01-magnetizace','tr04-pricna-vetev']);
 add('tr03-schema','transformer',
  ['Měňte zátěž a porovnávejte napětí, proudy a úbytky na prvcích schématu.','Sledujte zvlášť příčnou větev a podélné impedance.'],
  ['Příčná větev reprezentuje magnetování a ztráty v železe; podélné prvky odpor vinutí a rozptyl.','Přepočet na jednu stranu zachovává výkonovou bilanci; přepočtený proud není skutečný proud druhého vinutí.'],null,['tr04-pricna-vetev','tr05-rozptylova-reaktance']);
 add('tr04-pricna-vetev','transformer',
  ['Měňte parametry magnetizační větve a porovnávejte složky proudu naprázdno.','Propojte náhradní schéma s vykresleným polem a energetickým pokusem.'],
  ['Magnetizační proud vytváří tok. Činná složka proudu naprázdno kryje zejména ztráty v železe.','Lineární náhradní větev je aproximace pracovního bodu; sama nevystihuje hysterezi ani proudové špičky při nasycení.'],null,['tr02-magnetizacni','mag03-hysterezni-ztraty']);
 add('tr05-rozptylova-reaktance','transformer',
  ['Měňte zatížení a sledujte rozptylové pole i úbytky napětí.','Porovnejte tok společný oběma vinutím s tokem vázaným pouze na část soustavy.'],
  ['Rozptyl představuje energii pole, která se neúčastní ideální společné vazby obou vinutí.','Rozptylová reaktance způsobuje úbytek napětí a omezuje zkratový proud. Sama ideální reaktance činný výkon nespotřebovává.'],String.raw`X_\sigma=\omega L_\sigma`,['tr03-schema','tr08-zkratovy-proud']);
 add('tr06-hodinove-cislo','transformer',
  ['Přepínejte zapojení vinutí a porovnávejte fázory příslušných sdružených napětí.','Sledujte orientaci vinutí a sled fází; teprve potom odečítejte hodinové číslo.'],
  ['Hodinové číslo vyjadřuje posun sekundárního sdruženého napětí vůči primárnímu ve standardním hodinovém zobrazení.','Nezaměňujte fázové a sdružené napětí. Stejný převod závitů nemusí znamenat stejný převod sdružených napětí.'],null,['tr01-matematicky','sm12-synchronizing']);
 add('tr08-zkratovy-proud','transformer',
  ['Ručním časovým odečtem porovnávejte okamžitý proud s obálkami.','Měňte okamžik vzniku zkratu a odpor s indukčností; sledujte první špičku.'],
  ['Proud po zapnutí tvoří ustálená střídavá složka a doznívající stejnosměrná složka.','Velká první špička není totéž co efektivní ustálený zkratový proud. Odpor určuje rychlost zániku nesymetrie.'],String.raw`\tau=\frac{L}{R}`,['tr05-rozptylova-reaktance','11-transformator']);
 add('11-transformator','magnetic',
  ['Porovnejte zapnutí v různých fázích napětí a různé počáteční magnetování.','Sledujte tok a proud společně, zejména první půlperiodu po zapnutí.'],
  ['Zapínací proud je především důsledkem přechodného nárůstu toku a nasycení jádra.','Zapnutí v nule napětí může být pro tok nepříznivé. Výsledek závisí také na remanenci; nelze jej určit jen okamžitou velikostí napětí.'],null,['tr02-magnetizacni','mag02-hystereze']);
 add('01-drazky','winding',
  ['Měňte rozložení proudů v drážkách a porovnávejte je se schody magnetického napětí.','Sledujte změnu znaménka skoku při obrácení proudu vodičem.'],
  ['Skok magnetického napětí odpovídá proudovému obložení v dané drážce.','Nesinusový prostorový průběh lze rozložit na harmonické; každá má vlastní amplitudu a počet pólů.'],null,['07-vinuti','02-rozloha']);
 add('07-vinuti','winding',
  ['Porovnávejte jednotlivé fáze a jejich výsledný prostorový součet.','Měňte uspořádání vinutí a sledujte základní vlnu i vyšší harmonické.'],
  ['Časový průběh proudu a prostorové rozložení vodičů jsou dvě různé příčiny harmonických.','Symetrická soustava může vytvářet točivé pole i tehdy, když jednotlivé fáze samy vytvářejí pole pulzující.'],null,['tocive-pole','06-casoprostor']);
 add('tocive-pole','winding',
  ['Měňte amplitudy a fáze napájení a sledujte trajektorii výsledného vektoru.','Obraťte sled fází a porovnejte směr otáčení pole.'],
  ['Kruhové pole vyžaduje odpovídající souměrné vinutí a vyvážené napájení. Nesymetrie může vytvořit eliptické pole.','Mechanická rychlost základního pole závisí na frekvenci a počtu pólových dvojic.'],String.raw`n_s=\frac{60f}{p}`,['07-vinuti','am01-princip']);
 add('12-krok','winding',
  ['Zkraťte cívkový krok a porovnávejte skládání obou stran cívky.','Sledujte zvlášť základní a vybranou vyšší harmonickou.'],
  ['Zkrácení kroku může potlačit určitou harmonickou, zároveň obvykle sníží i základní složku.','Fázorový posun mezi stranami cívky je pro různé řády harmonických různý.'],null,['02-rozloha','04-cinitel']);
 add('02-rozloha','winding',
  ['Měňte rozložení cívek v pásmu a porovnejte jednotlivé fázory s jejich součtem.','Přepněte řád harmonické a sledujte změnu výsledku.'],
  ['Rozložením se napětí jednotlivých cívek nesčítají vždy aritmeticky, ale jako fázory.','Činitel rozlohy patří ke konkrétní harmonické; nelze jednu hodnotu použít pro celé nesinusové pole.'],null,['12-krok','04-cinitel']);
 add('04-cinitel','winding',
  ['Měňte krok a rozlohu a porovnávejte jejich samostatný i společný účinek.','Porovnejte základní harmonickou s nežádoucí vyšší složkou.'],
  ['Činitel vinutí spojuje účinek kroku a rozlohy pro daný řád harmonické.','Dobré potlačení vyšší harmonické je kompromis s velikostí užitečné základní složky.'],String.raw`k_{w\nu}=k_{p\nu}k_{d\nu}`,['05-drazkove','08-zesikmeni']);
 add('03-pohyb','winding',
  ['Zvolte jeden pólový pár a řád 5. V prostorovém režimu spočítejte kladné oblasti kolem vzduchové mezery.','Přepněte na časové harmonické. Sledujte jedinou kladnou oblast a spočítejte kmity v pevné sondě během jedné základní periody.'],
  ['Prostorový řád určuje počet opakování vlny na pólový pár. Časový řád určuje počet kmitů v sondě za základní periodu.','Pátá prostorová vlna obíhá pětkrát pomaleji než základní. Pátá časová harmonická na základní prostorové vlně obíhá pětkrát rychleji. Obě postupují zpětně.'],null,['06-casoprostor','10-asynchronni']);
 add('05-drazkove','winding',
  ['Měňte parametry vinutí a porovnávejte činitele základní a drážkových harmonických.','Sledujte, které složky zůstávají výrazné i při potlačení jiných řádů.'],
  ['Diskrétní uložení vodičů do drážek vytváří specifické skupiny prostorových harmonických.','Činitel vinutí sám neurčuje celkový hluk či ztráty; záleží i na geometrii, permeanci a provozním bodu.'],null,['04-cinitel','08-zesikmeni']);
 add('06-casoprostor','winding',
  ['Měňte časové a prostorové harmonické odděleně.','Porovnávejte průběh v pevném místě s obrazem pole po obvodu v jednom okamžiku.'],
  ['Časový řád určuje časový kmitočet, prostorový řád počet pólových dvojic.','Stejný prostorový tvar může mít při jiném časovém kmitočtu jinou rychlost pohybu.'],null,['03-pohyb','tocive-pole']);
 add('08-zesikmeni','winding',
  ['Měňte zešikmení a sledujte skládání příspěvků podél délky stroje.','Porovnejte potlačení drážkové harmonické s poklesem základní vlny.'],
  ['Axiálně posunuté řezy dávají různě natočené příspěvky, které se mohou vzájemně rušit.','Zešikmení není bez následků pro základní složku a nenahrazuje úplný výpočet ztrát nebo momentového zvlnění.'],null,['05-drazkove','04-cinitel']);
 add('am01-princip','induction',
  ['Porovnejte stojící rotor s rotorem blízko rychlosti pole.','Při stejném skluzu změňte odpor klece. Potom nastavte synchronní otáčky a porovnejte magnetická napětí a spřažené toky.'],
  ['Proud v rotoru vzniká díky relativnímu pohybu vůči poli.','Při přesně synchronní rychlosti ideální základní vlna neindukuje rotorový proud, a proto nevytváří asynchronní moment.'],String.raw`s=\frac{n_s-n}{n_s}`,['am02-momentova-charakteristika','10-asynchronni']);
 add('am02-momentova-charakteristika','induction',
  ['Měňte pracovní rychlost a sledujte bod na momentové charakteristice.','Porovnejte průsečíky motorové a zátěžové charakteristiky.'],
  ['Rovnost momentů určuje kandidáta ustáleného bodu; jeho stabilita závisí na odezvě při malé změně rychlosti.','Maximum momentu vymezuje přetížitelnost daného ustáleného modelu, ne automaticky dovolený trvalý provoz.'],null,['am05-odpor-rotoru','am04-trakcni']);
 add('am05-odpor-rotoru','induction',
  ['Spusťte otáčení pole nebo nastavte polohu ručně. Ve spodním grafu porovnejte tangenciální složku s velikostí celé síly na tyči a s výslednicí na rotor.','Nastavte nulový odpor a porovnejte okamžitý a střední moment. Zvolte Tok statoru smyčkou a natočte pole do polohy největšího toku.'],
  ['Odpor rotoru umožňuje činný přenos výkonu, ale současně způsobuje ztráty.','Ve zjednodušeném ustáleném schématu zvýšení odporu posouvá maximum k většímu skluzu; nezajišťuje obecně vyšší účinnost.'],String.raw`P_{\mathrm{Cu2}}=sP_\delta`,['am02-momentova-charakteristika','am01-princip']);
 add('am04-trakcni','induction',
  ['Měňte frekvenci a porovnávejte rodinu momentových charakteristik.','Použijte volby provozního stavu a sledujte rychlost při změně zatížení.'],
  ['Pod základní rychlostí lze vhodným řízením napětí a frekvence přibližně udržovat tok a dostupný moment.','Po dosažení napěťového limitu tok klesá a oblast přibližně konstantního výkonu má klesající dostupný moment.'],null,['am02-momentova-charakteristika','08-vozidla']);
 add('10-asynchronni','induction',
  ['Spusťte rozběh z klidu a sledujte pracovní bod na momentové charakteristice.','Změňte zátěž a sledujte, při kterých otáčkách se hnací a zatěžovací moment vyrovnají.'],
  ['Frekvence rotorového proudu je určena relativním pohybem pole vůči rotoru.','Zvětšené řezy a značky proudů slouží názornosti; jejich geometrie není výrobním výkresem.'],String.raw`f_2=|s|f_1`,['am01-princip','03-pohyb']);
 add('sm01-princip','synchronous',
  ['Měňte vzájemné natočení polí a porovnávejte směr momentu.','Porovnejte generátorický a motorický pracovní bod.'],
  ['V synchronním ustáleném stavu se rotor a základní pole otáčejí stejnou rychlostí, ale mezi jejich osami zůstává zátěžný úhel.','Znaménko momentu a výkonu čtěte v motorické konvenci projektu; samotné natočení obrázku neurčuje tok energie.'],null,['sm02-schema','sm07-dq']);
 add('sm07-dq','synchronous',
  ['Táhněte směrem magnetického napětí a porovnávejte podélný a příčný příspěvek.','Sledujte základní harmonickou i deformovaný průběh v mezeře.'],
  ['Vyniklé póly dávají v různých směrech rozdílnou magnetickou vodivost.','Rozklad do os není rozdělení na dva stroje: složky popisují tentýž fyzikální stav. Výukový průběh v mezeře není detailní měření skutečného stroje.'],null,['sm08-rotor-dq','sm03-torque']);
 add('sm08-rotor-dq','coordinates',
  ['Táhněte zlatým úchytem rotoru a zeleným úchytem proudu; porovnejte oba pohledy.','Vyzkoušejte „Rotor stojí“, „Stejná rychlost“ a „Pomalejší rotor“.'],
  ['Souřadnicová transformace mění popis stejného proudového vektoru, nikoli proud ve stroji.','Modul zachovává amplitudu a předpokládá vyváženou soustavu bez nulové složky. Nejde o výkonově invariantní normalizaci ani simulaci rozběhu.'],null,['sm07-dq','sm09-pmsm-phasor']);
 add('sm02-schema','synchronous',
  ['Měňte buzení, zatížení a parametry stroje a sledujte uzavření fázorového obrazce.','Porovnávejte hladký a vyniklý rotor při stejném pracovním bodu.'],
  ['Svorkové napětí, vnitřní napětí výsledného toku a budicí napětí jsou různé veličiny.','Vnější úhel je mezi svorkovým a budicím napětím; vnitřní úhel mezi vnitřním a budicím napětím. Přepnutí označení úhlu nemění stroj.'],String.raw`\overline{U_a},\quad\overline{U_i},\quad\overline{U_{ib}};\qquad\beta,\ \beta'`,['sm03-torque','sm06-torque-origin']);
 add('sm03-torque','stiffness',
  ['Měňte buzení a vyniklost a porovnávejte budicí a reluktanční část momentu.','Přepněte vnější a vnitřní úhlovou osu a sledujte tentýž pracovní bod.'],
  ['Reluktanční moment může existovat i bez buzení díky rozdílu podélné a příčné reaktance.','Statickou stabilitu určuje místní synchronizační tuhost. Hranice hladkého bezeztrátového stroje se nedá bez úprav přenést na každý model.'],String.raw`K_s=-\frac{\mathrm dM}{\mathrm d\beta}`,['sm02-schema','09-synchronni']);
 add('sm06-torque-origin','synchronous',
  ['Měňte pracovní bod a sledujte průmět proudu do směru vnitřního napětí.','Porovnávejte elektromagnetický výkon a moment v motorickém i generátorickém režimu.'],
  ['Výkon elektromagnetické přeměny souvisí se vzájemnou orientací vnitřního napětí a proudu.','Průmět nepatří obecně do osy svorkového napětí. Vztah níže platí pro třífázový výkon při fázových efektivních hodnotách; poměrný model používá vlastní výkonovou základnu.'],String.raw`P_{\mathrm{em}}=3\operatorname{Re}\!\left(\overline{U_i}\,\overline{I_a}^{\,*}\right)`,['sm02-schema','em04-premena']);
 add('sm04-transients','transient',
  ['Porovnejte rázový, přechodný a ustálený mezní stav.','Měňte čas po skoku a sledujte změnové proudy budicího obvodu a klece.'],
  ['Konečné napětí nedovoluje okamžitý skok tokové vazby uzavřeného rotorového obvodu. To není zákaz lokální změny indukce v každém bodě.','Předepsaný skok statorového proudu není úplná simulace zkratu. Číselné reaktance a časy jsou vlastnostmi výukového modelu.'],String.raw`u_r=R_ri_r+\frac{\mathrm d\psi_r}{\mathrm dt}`,['sm12-synchronizing','tr08-zkratovy-proud']);
 add('sm05-isolated','regulation',
  ['Měňte buzení, rychlost a druh zátěže; sledujte svorkové napětí a frekvenci.','Porovnejte zatížený bod s napětím naprázdno při stejném buzení a rychlosti.'],
  ['Samostatný generátor nemá napětí a frekvenci předepsané nekonečnou sítí.','Změna napětí zatížením závisí i na účiníku; kapacitní zátěž může napětí zvýšit. Model drží rychlost pohonem a neobsahuje regulátor ani přechodové děje.'],String.raw`\mathrm{VR}=\frac{U_{a0}-U_a}{U_a}\,100\,\%`,['sm11-v-curves','sm12-synchronizing']);
 add('sm11-v-curves','synchronous',
  ['Při zvoleném činném výkonu měňte buzení a sledujte proud a jalový výkon.','Porovnejte proudové minimum s oběma stranami V-křivky.'],
  ['V-křivka porovnává buzení při stálém činném výkonu a svorkovém napětí.','Minimum proudu odpovídá nejmenší potřebě zdánlivého výkonu při daném činném výkonu. Neexistující stabilní řešení není chybějící kus křivky k domyšlení.'],null,['sm02-schema','sm05-isolated']);
 add('09-synchronni','synchronous',
  ['Měňte poruchu a sledujte vývoj úhlu a rychlosti rotoru v čase.','Porovnejte návrat do synchronismu s trvalým nárůstem úhlu.'],
  ['Po poruše rotor nezmění úhel skokem: nejprve zrychluje či zpomaluje podle nerovnováhy momentů.','Staticky přípustný bod nemusí přežít velkou poruchu. Záleží na délce poruchy, setrvačnosti a tlumení.'],null,['sm03-torque','sm12-synchronizing']);
 add('sm12-synchronizing','syncconnect',
  ['Posuvníkem Budicí proud srovnejte napětí generátoru se sítí. Nastavte také frekvenci, sled fází a okamžitý úhel.','Sepněte spínač a porovnejte proud a moment pro dobré a špatné sfázování.'],
  ['Malé rozdílové napětí v jediném okamžiku nenahrazuje kontrolu sledu fází a rozdílu frekvencí.','Klec tlumí relativní pohyb rotoru; neopravuje nesprávný sled fází. Model je výukový, nikoli návod k obsluze skutečné rozvodny.'],null,['sm04-transients','09-synchronni']);
 add('sm09-pmsm-phasor','synchronous',
  ['Měňte složky proudového vektoru a porovnejte tok, napětí a moment.','Sledujte zvlášť magnetový a reluktanční příspěvek u různých rotorů.'],
  ['Proud v příčné ose přímo spolupracuje s tokem magnetů; podélná složka mění tokovou a napěťovou bilanci.','Reluktanční příspěvek závisí na rozdílu indukčností. Stejný směr proudu nemusí být optimální pro každý rotor a rychlost.'],null,['sm08-rotor-dq','sm10-pmsm-drive']);
 add('sm10-pmsm-drive','synchronous',
  ['Měňte požadavek pohonu a sledujte současně proudový a napěťový limit.','Porovnejte rozjezd s oblastí vyšších rychlostí.'],
  ['Proudový limit omezuje moment, rostoucí indukované napětí postupně spotřebovává napěťovou rezervu měniče.','Oslabování pole rozšiřuje rychlostní rozsah, ale nezaručuje zachování původního momentu ani neomezený výkon.'],null,['sm09-pmsm-phasor','08-vozidla']);
 add('dc18-dve-pole','dc',
  ['Pomalu otáčejte rotorem a sledujte přepínání proudu komutátorem.','Porovnejte osu pole statoru s osou pole kotvy před přepnutím a po něm.'],
  ['Komutátor udržuje vhodnou orientaci pole kotvy vůči budicímu poli, i když se cívky otáčejí.','Mechanická poloha jedné cívky není totéž co prostorová osa výsledného proudového obložení celé kotvy.'],null,['dc01-princip','dc17-rozvinuti']);
 add('dc01-princip','dc',
  ['Spusťte pomalý chod nebo podržte rotor ručním natočením a sledujte proud i síly.','Obraťte proud kotvy nebo buzení a porovnejte směr momentu.'],
  ['Moment určuje součin toku a proudu kotvy; indukované napětí součin toku a rychlosti.','Pauza zastaví čas ukázky, nevypíná proud. Nenulový moment při zastaveném rotoru neznamená nenulový mechanický výkon.'],String.raw`M=k\Phi i_a,\qquad u_i=k\Phi\omega`,['dc18-dve-pole','dc03-schema']);
 add('dc02-kotva','dcwinding',
  ['Postupujte od jedné cívky k více cívkám pomocí ovladačů modulu.','Porovnejte průběh vybrané cívky s výsledkem na kartáčích.'],
  ['Napětí jedné otáčející se cívky mění polaritu; komutátor mění její připojení k vnějším svorkám.','Více prostorově rozmístěných cívek zmenšuje zvlnění, ale jejich sériové a paralelní spojení je nutné rozlišovat.'],null,['dc19-vinuti-komutace','dc06-komutace']);
 add('dc19-vinuti-komutace','dcwinding',
  ['Postupně sestavujte vinutí a sledujte vodivé cesty mezi kartáči.','Krokujte natočení a pozorujte přechod cívek mezi proudovými větvemi.'],
  ['Celkový proud kotvy se dělí do paralelních větví; proud jedné cívky není obecně celý svorkový proud.','Při přechodu pod kartáčem se dočasně mění propojení lamel a cívka komutuje. Počet větví závisí na druhu vinutí.'],null,['dc02-kotva','dc06-komutace']);
 add('dc06-komutace','commutation',
  ['Krokujte průchod kartáče přes dvě lamely a sledujte kontaktní plochy.','Porovnejte proud cívky s proudy obou lamel na začátku a konci komutace.'],
  ['Cívka musí během krátkého zkratování kartáčem obrátit proud, nikoli pouze přerušit jeho přívod.','Indukčnost brání rychlé změně proudu. O kvalitě komutace rozhoduje také kontakt a komutační pole; obrázek jiskry není výpočtem opotřebení kartáče.'],String.raw`u_L=L_\sigma\frac{\mathrm di}{\mathrm dt}`,['dc19-vinuti-komutace','dc17-rozvinuti']);
 add('dc17-rozvinuti','commutation',
  ['Zapínejte buzení, kotvu, kompenzaci a pomocné póly samostatně a společně.','Sledujte působiště polí pod hlavními póly a v oblasti komutace.'],
  ['Kompenzační vinutí omezuje reakci kotvy pod pólovými nástavci; pomocné póly pomáhají komutaci. Tyto funkce nejsou zaměnitelné.','Zobrazený součet polí využívá lineární báze. Při nasycení nelze obecně sečíst samostatné indukce stejným způsobem.'],null,['dc06-komutace','mag01-magnetizace']);
 add('dc03-schema','dcdrive',
  ['Měňte napětí, zatížení a buzení a propojujte pracovní bod se schématem.','Sledujte pořadí změn proudu, momentu a rychlosti po změně zatížení.'],
  ['Zatížení nezvyšuje proud přímo bez vazby na pohyb: pokles rychlosti sníží indukované napětí a změní napěťovou bilanci.','Odbuzení může zvýšit rychlost, ale při stejném proudovém limitu snižuje dostupný moment.'],String.raw`u_a=R_a i_a+L_a\frac{\mathrm di_a}{\mathrm dt}+u_i`,['dc01-princip','em04-premena']);
 add('dc16-bldc-poloha','bldc',
  ['Porovnejte kroky s Hallovými sondami a s odhadem polohy z napětí.','Použijte podržení dvojice fází a sledujte vztah polohy rotoru k dalšímu přepnutí.'],
  ['Snímač polohy může poskytovat informaci i při stání. Odhad z pohybového indukovaného napětí potřebuje dostatečnou rychlost.','Průchod napětí nulou a okamžik další komutace nejsou totožné události. Porovnání hvězdy a trojúhelníku vyžaduje rozlišit fázové a napájecí veličiny.'],null,['dc15-bldc','sm09-pmsm-phasor']);
 add('dc15-bldc','bldc',
  ['Krokujte šest komutačních stavů a sledujte sepnuté tranzistory a vodivou cestu.','Porovnávejte proudy fází s indukovaným napětím a momentem.'],
  ['Elektronika nahrazuje mechanické přepojování cívek podle polohy rotoru.','Idealizované proudové průběhy nejsou simulací každého spínacího přechodu měniče. PWM uvnitř komutačního intervalu je jiný děj než vlastní změna komutačního stavu.'],null,['dc16-bldc-poloha','dc06-komutace']);
 add('08-vozidla','model',
  ['Měňte rychlost, sklon a parametry vozidla; porovnávejte jednotlivé jízdní odpory.','Porovnejte potřebnou tažnou sílu a výkon při nízké a vysoké rychlosti.'],
  ['Odpor vzduchu roste přibližně s druhou mocninou rychlosti; jeho výkonový příspěvek při bezvětří s třetí.','Výkon na kolech není elektrický příkon baterie. Převod, účinnosti, adheze a zrychlování představují další podmínky pohonu.'],String.raw`P_{\mathrm{kola}}=F_{\mathrm{tah}}v`,['am04-trakcni','sm10-pmsm-drive']);
 add('fu01-reakce','model',
  ['Vyberte dvojici jader a případnou větev reakce; namiřte dělo a stiskněte Vystřelit. Shift s tažením přesouvá jádra.','Rychlost přehrávání lze ručně měnit i obrátit. Ruční volba má přednost před automatickým zpomalením.'],
  ['Teplota určuje vstupní podmínky, nikoli automatický úspěch každé reakce. Tunelová animace je didaktická ilustrace.','Zvětšené kresby nejsou měřítkem skutečných jader. Rychlosti u částic jsou fyzikální hodnoty modelu; posuvník mění rychlost přehrávání, ne tyto hodnoty.'],null,['fu02-galerie','em03-silove-ucinky']);
 add('fu02-galerie','model',
  ['Přepínejte skupiny Vše, částice, jádra a atomy.','Tažením prohlížejte prostorové modely a porovnávejte jejich druhy a popisky.'],
  ['Povrchy jsou názornou reprezentací, nikoli fotografií částic nebo ostrou hranicí elektronového obalu.','Porovnání barev a kreslených velikostí slouží orientaci; z náhledu nelze odečítat skutečné poměry rozměrů částic a atomů.'],null,['fu01-reakce']);
 sources.heating='S. Entler, V. Kindl, Jaderná fúze a fúzní elektrárny, kap. 9.3, s. 187–192, vztah (9.5), obr. 9.6–9.7 a kap. 9.3.2, s. 193.';
 sources.eccd='S. Entler, V. Kindl, Jaderná fúze a fúzní elektrárny, kap. 9.5.1–9.5.3, s. 194–199, obr. 9.8–9.11.';
 add('fu16-eccd','eccd',['Porovnej kolmý vstup se dvěma opačnými náklony svazku.','Časovým posuvníkem najdi okamžik největší proudové hustoty.'],['Při šikmém vstupu vybírá Dopplerův posun elektrony podle podélné rychlosti.','Elektrony po ohřevu ztrácejí původní směr pomaleji. Jejich výsledný tok a elektrický proud mají opačný směr.'],String.raw`J_\parallel=-e n_{\mathrm e}\langle v_\parallel\rangle`,['fu13-ohrev','fu11-rekonexe','fu17-rozptyl']);
 sources.scattering='S. Entler, V. Kindl, Jaderná fúze a fúzní elektrárny, kap. 9.5.2, s. 195–199, zejména s. 198 a obr. 9.11.';
 sources.shaping='S. Entler, V. Kindl, Jaderná fúze a fúzní elektrárny, kap. 7.1, s. 139, obr. 7.3 a kap. 7.17.3, s. 169. ÚFP AV ČR, magnetické cívky COMPASS.';
 add('fu19-tvar','shaping',['Začni kruhovým průřezem. Zvětši elongaci při stejném proudu a odečti počet toroidálních oběhů na jeden poloidální oběh.','Přidávej proud až do překrytí obou čar. Porovnej proud s výchozí hodnotou.'],['Při větší elongaci lze v eliptickém odhadu vést vyšší proud při stejném bezpečnostním faktoru.','Kladná triangularita může změnou zakřivení siločar a magnetického střihu umožnit strmější tlakový profil na okraji. V jádře pak lze dosáhnout vyššího tlaku.'],null,['fu09-princip','fu06-divertor']);
 sources.conductivity='S. Entler, V. Kindl, Jaderná fúze a fúzní elektrárny, kap. 9.1, s. 181. Model kovu a mikroskopické scény jsou vlastní didaktické rozšíření.';
 add('fu15-vodivost','conductivity',
  ['Zapni Oblasti rozptylu. Když se vlevo dole objeví šipka síly, pozastav animaci a odečti úhel mezi silou a rychlostí elektronu.','Posuň Zahřátí z minima na maximum. Porovnej rozsah kružnic a střední drift v kovu a potom oba průlety v plazmatu.'],
  ['Kmity zvětšují oblast kolem uzlu, v níž model vychyluje elektron. Četnější rozptyl odpovídá většímu měrnému odporu kovu.','V plazmatu se rychlejší elektron při podobném setkání vychýlí méně. Vzájemné odpuzování elektronů zachovává jejich celkovou hybnost. Měrný odpor určuje samostatný transportní model.'],
  String.raw`r_m=\frac{0{,}1+T_m/(300\,\mathrm K)}{1{,}1},\qquad r_p=\left(\frac{T_e}{1\,\mathrm{keV}}\right)^{-3/2}`,['fu17-rozptyl','fu07-plazma']);
 add('fu17-rozptyl','scattering',['Posuvníkem změň rychlost druhého elektronu a porovnej oba odklony při průletu.','Přepni na Více setkání a časovým posuvníkem sleduj směry obou skupin.'],['U rychlejšího elektronu síla působí kratší dobu a mění směr větší počáteční hybnosti.','Při mnoha slabých setkáních se náhodné odchylky částečně ruší.'],String.raw`\nu_{\mathrm D}\propto v^{-3}`,['fu16-eccd','fu03-drift']);
 sources.nbi='S. Entler, V. Kindl, Jaderná fúze a fúzní elektrárny, kap. 9.2, s. 181–186.';
 add('fu18-injektor','nbi',['Tlačítkem „Krok na další děj“ projdi očíslované kroky od výboje ve zdroji až po pohyb deuteronu v plazmatu.','Vypni plyn v neutralizátoru a sleduj místo dopadu částice.'],['Záporný iont zrychluje směrem k vyššímu elektrickému potenciálu.','Po ztrátě přidaného elektronu neutrální atom pokračuje z injektoru do tokamaku. Zbylé ionty jsou odkloněny na terče iontové pasti.'],String.raw`\Delta E_{\mathrm k}=eU`,['fu15-nbi','fu07-plazma']);
 add('fu15-nbi','nbi',['Nastav hustotu a teplotu. Po automatickém přepočtu přehraj dráhu.','Sniž hustotu a porovnej průnik svazku.'],['Neutrální atom proniká přímo. Po ionizaci vede magnetické pole rychlý deuteron podél magnetické plochy.','Při coulombovských srážkách předává rychlý iont energii elektronům a iontům.'],null,['fu13-ohrev','fu03-drift']);
 add('fu13-ohrev','heating',
  ['Změň frekvenci vlny a sleduj polohu vrstvy vůči vyznačenému místu.','Porovnej obě kruhové složky a krokuj po čtvrtinách periody gyrace.'],
  ['Souhlasně rotující elektrická síla může urychlovat elektron po několik oběhů.','Změnu kolmé energie jedné částice určuje práce elektrické síly.'],String.raw`P=q\mathbf E_\perp\cdot\mathbf v_\perp`,['fu03-drift','fu04-udrzeni']);
 add('fu12-lawson','lawson',
  ['Spusť chladnutí a porovnej oba průběhy. Pak pro každou hustotu nastav dobu udržení energie tak, aby výkon samoohřevu pokryl ztrátový výkon paliva, a zaznamenej mezní stav.','Opakuj měření při různých teplotách. V grafu najdi nejmenší potřebný trojný součin hustoty paliva, teploty a doby udržení energie.'],
  ['Doba udržení energie je poměr vnitřní energie paliva ke ztrátovému výkonu. Při konstantní době udržení energie zbývá po jedné takové době bez ohřevu přibližně 37 % původní energie.','Model zapálení předpokládá homogenní směs stejného počtu jader deuteria a tritia a úplné předání energie částic alfa plazmatu.'],String.raw`\tau_{\mathrm E}=\frac{U}{P_{\mathrm L}}`,['fu01-reakce','fu04-udrzeni']);
 sources.milestones='S. Entler, V. Kindl, Jaderná fúze a fúzní elektrárny, kap. 9, s. 181 a násl.; kap. 12.6–12.7 a 12.9–12.11, s. 330–339; kap. 13.9–13.12, s. 366–373.';
 add('fu14-milniky','milestones',
  ['Hustotu nastav před startem; během pokusu i pauzy je zamčená až do resetu. Měň externí ohřev, dobu udržení a účinnosti.','Porovnej okamžitou dodávku elektřiny s ustáleným vyrovnáním. Po vypnutí ohřevu sleduj samostatný výsledek zkoušky zapálení.'],
  ['Zapálení nastává, když výkon částic alfa pokrývá ztráty plazmatu. Okamžité splnění nerovnosti samo nezaručuje dlouhodobý pracovní bod.','Teplota se vyvíjí integrací vnitřní energie. Kladná dodávka při chladnutí může čerpat tuto energii; mezní zesílení pro inženýrské vyrovnání platí pro ustálený stav. Časová zkouška je doplněk modelu, nikoli důkaz stability skutečného tokamaku.'],String.raw`P_{\mathrm{NET}}=P_{\mathrm{GR}}-P_{\mathrm{SC}}^{\mathrm{NH}}-P_{\mathrm{HC}}`,['fu12-lawson','fu13-ohrev']);
 add('fu07-plazma','plasma',
  ['Přidávej atomy a posuvníkem teploty dodávej teplo. Sleduj uvolňování elektronů a pole vzniklých nábojů.','Zapni magnetické pole a porovnej dráhy neutrálních atomů, iontů a elektronů.'],
  ['Plazma může být částečně ionizované. Od samotné ionizace je odlišuje kolektivní chování a kvazineutralita v dostatečně velkém objemu.','Jde o názorný model se zmenšeným poměrem hmotností. Počet zobrazených atomů není hustota skutečného plynu; magnetické pole stáčí i jednotlivý volný náboj.'],String.raw`m\frac{\mathrm d\mathbf v}{\mathrm dt}=q(\mathbf E+\mathbf v\times\mathbf B)`,['fu03-drift','fu02-galerie']);
 add('fu03-drift','drift',
  ['Začněte vletem do magnetického pole: nastavte částici, energii a směr a spusťte pokus. Před spuštěním lze částici přetáhnout.','Přepněte na gyraci nebo jednotlivé drifty. Animaci pozastavíte tlačítkem, restart vrátí částici. Energii a indukci měňte i za běhu.'],
  ['Mimo pole se částice pohybuje přímo; v čistě magnetickém poli mění směr, nikoli kinetickou energii.','E×B drift má pro oba náboje stejný směr. Grad-B drift a drift zakřivení obracejí směr se znaménkem náboje. Pole jsou předepsaná; model nepočítá vlastní pole plazmatu.'],String.raw`\mathbf v_E=\frac{\mathbf E\times\mathbf B}{B^2}`,['fu01-reakce','fu02-galerie','em03-silove-ucinky']);
 // Historical deep links use the same gallery and the same guide.
 sources.confinement='Entler, Kindl: Jaderná fúze a fúzní elektrárny, kap. 2.2, s. 32–35; kap. 7.5–7.6, s. 148–151 (šroubovitost, bezpečnostní faktor a magnetické zrcadlení).';
 add('fu04-udrzeni','confinement',
  ['Porovnejte únik ze solenoidu s odrazem ve zrcadle. Měňte zrcadlový poměr a úhel rychlosti deuteronu vůči poli.','Posuvníkem uzavřete solenoid a složte samostatná pole. Zapněte průsvitné magnetické plochy, vypněte siločáry a posouvejte jejich řez.'],
  ['Odraz vzniká Lorentzovou integrací v poli konečných kruhových závitů odvozeném z vektorového potenciálu. Částice ve ztrátovém kuželu unikají.','Toroid odstraní otevřené konce, samotné toroidální pole však neodstraní drifty. Helicita magnetických siločar označuje lokální sklon; není to globální magnetická helicita.'],String.raw`\mathbf B=\mathbf B_{\mathrm T}+\mathbf B_{\mathrm P}`,['fu03-drift','fu01-reakce']);
 sources.equilibrium='Entler, Kindl: Jaderná fúze a fúzní elektrárny, kap. 7.9, s. 154–156; kap. 7.11–7.12, s. 158–160. Numerický model: FreeGS 0.8.2.';
 add('fu06-divertor','equilibrium',
  ['Vyberte poloidální cívku a měňte její proud. Ostatní proudy zůstávají pevné. Sledujte změnu osy a separatrix.','Volte Uvnitř, Separatrix a K terčům. Porovnejte tlak, indukci a proudovou hustotu v řezu a prostoru.'],
  ['Poloha plazmatu je výsledkem rovnováhy při zadaných proudech. Nepoužívá se regulátor polohy. Výběr jiné cívky obnoví výchozí stav.','Statické rovnováhy nepopisují vertikální stabilitu ani transport tepla k terčům. Geometrie vychází z ITER; nejde o konkrétní výboj.'],String.raw`-\nabla p_{\mathrm{pl}}+\mathbf J\times\mathbf B=0`,['fu04-udrzeni','fu03-drift']);
 add('fu09-princip','equilibrium',
  ['V připraveném řezu skryjte vybrané součásti pomocí přepínačů nad scénou a prohlédněte si vnitřek.','Vyberte konstantní, sinusový nebo lineárně rostoucí proud solenoidu a sledujte napětí i sklon siločar.'],
  ['Při dosažení meze se proud CS ustálí. Indukované napětí zanikne, proud plazmatem a sklon siločáry postupně klesají.','Poloidální pole proudu plazmatem mění stáčení výsledných siločar. Vnější cívky přidávají vlastní pole.'],null,['fu06-divertor','fu04-udrzeni']);
 sources.emwave='Feynman, Leighton, Sands: The Feynman Lectures on Physics, I, kap. 28; II, kap. 20. Vlastní retardovaný bodový dipólový model; metodika v docs/EM-VLNA.md.';
 add('em06-vlna','emwave',
  ['Začněte před pohybem a zvolte Vznik ohybu. Porovnejte bílé siločáry s původním polem; zelený kruh vyznačuje čelo změny.','Zvolte Vlna odchází. Vpravo sledujte magnetické pole, jeho znaménko a směr. Přepněte na dipólovou anténu nebo prostorový detail.'],
  ['Vzdálené pole odpovídá dřívějšímu pohybu náboje. Změna se šíří konečnou rychlostí světla; siločáry nejsou hmotná vlákna.','Model počítá retardované pole pohybujících se bodových nábojů. Neřeší impedanci ani rezonanci antény; prostorový detail je rovinné přiblížení.'],String.raw`\mathbf S=\frac{1}{\mu_0}\mathbf E\times\mathbf B`,['em01-indukovane-napeti','em03-silove-ucinky']);
 sources.reconnection='S. Entler, V. Kindl, Jaderná fúze a fúzní elektrárny, kap. 7.18, s. 171–172, rámeček 7.10 a kap. 7.19, s. 172–173. Vlastní názorný model helikálního toku.';
 add('fu11-rekonexe','reconnection',
  ['Nahoře sleduj rovnoběžné siločáry. Značka pod nimi ukazuje proud plazmatu do řezu. Vnes poruchu a porovnej původní a výsledný směr pole v P.','V kroku Přepojení najdi ve výseči vlevo bod A. V horním zvětšení sleduj, kam z A vede průsečnice magnetické plochy před průchodem bodem X a po něm.'],
  ['Před přepojením leží dvě větve stejné hladiny toku na opačných stranách rezonanční plochy. Při průchodu sedlovým bodem se změní jejich návaznost.','Elektrické pole může místně urychlit elektrony podél prstence. Za sekundu pak průřezem projde více náboje a proud zesílí. Pokud změněné magnetické pole pohne plazmatem tak, že se rozdíl v proudu zvětší, porucha může dál růst.'],null,['fu04-udrzeni','fu09-princip']);
 sources.compass='ÚFP AV ČR: Tokamak overview, Main design parameters a Heating power; ověřeno 19. 11. 2026. Montáž: Jan Klíma, CU_DOC_TokamakAssembly, snímky 11–82.';
 add('fu10-compass','compass',
  ['Spusť sestavení celého tokamaku a posuvníkem prohlédni jednotlivé etapy.','Přepni na vnitřní sestavu a sleduj průlet kamerou.'],
  ['Vedle videa jsou plánované návrhové hodnoty zařízení, nikoli výsledky měření.','Přílety dílů a pohyb kamery jsou názorná stylizace; drobné konstrukční detaily jsou zjednodušené.'],null,['fu09-princip','fu06-divertor']);
 const aliases={'fu08-ostrovy':'fu11-rekonexe','fu05-rovnovaha':'fu06-divertor','fu02-jadra':'fu02-galerie','fu03-atomy':'fu02-galerie','fu04-castice':'fu02-galerie'};
 const subpages={
  'em04-pohybove-napeti':{
   title:'Od transformačního k pohybovému napětí',source:'energy',
   controls:['Nastavte výchozí polohu tažením za modrý vodič nebo tlačítky předvoleb. Po zaměření scény lze úhel měnit šipkami. Rotor zůstane v nastavené poloze. Sledujte napětí při nulové rychlosti.','Postrčte rotor v obou směrech. Porovnejte příspěvky v grafu napětí a sledujte směr středního momentu.'],
   points:['Při stojícím rotoru vzniká transformační napětí časovou změnou pole. Pohyb rotoru přidává pohybovou složku napětí.','Graf sil ukazuje okamžité síly na dva vodiče. Pravá osa patří střednímu momentu celého souměrného rotoru.'],
   equation:String.raw`u_i=u_{i,\mathrm{tr}}+u_{i,\mathrm p}`,
   model:{
    title:'Vztahy a fyzikální model',
    equation:String.raw`\psi=\widehat\psi\cos(\omega t)\cos\alpha,\quad u_{i,\mathrm{tr}}=-\left.\frac{\partial\psi}{\partial t}\right|_\alpha,\quad u_{i,\mathrm p}=-\frac{\partial\psi}{\partial\alpha}\dot\alpha`,
    paragraphs:["Napětí patří jednomu sledovanému obvodu a jsou normalizována k amplitudě napětí stojícího obvodu. Mechanika odpovídá souměrnému jednofázovému rotoru: dvě stejná protiběžná pole mají v klidu opačné, stejně velké střední momenty. Druhý rotorový obvod není zakreslen.",
     "Pravý graf zobrazuje vodorovné složky sil (kladně doprava), normalizované k součinu referenčního proudu, délky a indukce; jejich stupnice je vlevo. Střední moment celého rotoru má samostatnou fialovou stupnici vpravo. Síly na dvojici vodičů nelze sečíst a zaměnit za moment. Fialový oblouk kolem středu ukazuje směr výsledného středního momentu celého rotoru; jeho délka je pro názornost zvýrazněna. Nejde o trvalé mechanické postrkování. Růžové a oranžové šipky ukazují okamžité síly na vodiče sledovaného obvodu od idealizovaného vnějšího pole; nejsou to momenty celého rotoru. Nulový výsledný střední moment neznamená nulový průměr každé jednotlivé síly.",
     "Samostatný nesouměrný závit může mít i ustavující moment; nulový rozběhový moment zde platí pro souměrný rotor. Po postrčení se skluzy liší a motor se rozbíhá ve zvoleném směru. Model středního momentu má poměr odporu a reaktance 0,2, ilustrační setrvačnost a malé tření. Elektrické zapínací přechody nejsou zahrnuty.",
     "Siločáry jsou ilustrací Biotova–Savartova pole dlouhých přímých vodičů bez železa; výpočet napětí používá idealizované harmonické vnější pole. Graf zachovává posledních 24 sekund modelového času. Čárka označuje zásah do pohybu."]
   },
   related:['em04-premena','em01-indukovane-napeti']
  }
 };
 window.ModuleGuideData={sources,entries,aliases,subpages};
})();
