# Aktuální stav předání

## GitHub a přenos — 15. listopadu 2026

### Postupné načítání — místní změna 15. listopadu 2026

Úvodní HTML bylo zmenšeno z 100 942 297 na 2 432 242 bajtů (o 97,6 %).
Třicet dva vložených lekcí a šest skupin numerických dat se sestavují
do 38 souborů `web/lazy/`. Stahují se až při otevření příslušného modulu,
s viditelným průběhem, návratem během načítání a opakováním při chybě.
Zdrojové HTML, matematické modely a původní renderery se zachovávají;
shoda všech přesunutých lekcí a dat je kontrolována SHA-256.

Změna je součástí `node tools/build-release.cjs`, publikace i soukromého ZIPu.
Obě dodávky aktualni jsou aktualizované. Veřejný výběr má nyní 192 souborů
(154 původních a 38 načítaných podle potřeby), celkem přibližně 177 MiB.
Celkový obsah zůstává zachovaný; zmenšil se objem potřebný při vstupu.

Prošlo úplné sestavení, `tools/project/check.cjs`, audit 440 veřejných zdrojů,
příprava publikačního výstupu, kontrola shody obou dodávek a místní DOM test
všech rozcestníků i odložených modulů. Testy zahrnují přímé odkazy, cache,
odchod během stahování, retry, odmítnutí poškozených dat a režim file://.
DOM test používá náhrady canvasu; prohlížeč se neotevíral a vzhled nebyl
vizuálně ověřen. Uživatel 15. listopadu 2026 výslovně schválil push tohoto
zrychlení pro vyzkoušení. Skutečné nasazení potvrzuje úspěšný běh Pages;
rozpracované změny fúzního modulu se tímto pushem nezveřejňují.

Níže uvedené počty a monolitické HTML popisují původní stav propojení.

Nejnovější pokyn uživatele: práce na fúzním modulu stále probíhá. **Další push
pouze na výslovné požádání.** Neposílat automaticky ani změny pravidel či tagy.
Přenosový balíček může nést dosud neodeslané místní commity. První schválený
projektový commit na GitHubu je b30b5f1; další rozpracované změny zachovat.

Schváleno: veřejný Git obsahuje minimum upravitelných zdrojů, pravidla a
sestavovací nástroje; Pages pouze prezentační soubory. Literatura se přenáší
v soukromém balíčku. Nepotřebné surové FEM výsledky se po ověření odstraňují;
malé modely a skripty zůstávají pro případný přepočet na požádání.

Přesný postup: PREDANI_PROJEKTU.md, pravidla AGENTS.md. Veřejný výběr:
config/project-files.json. Git historie navazuje na existující úvodní README.
Předávací ZIP vytváří node tools/project/handoff.cjs; obnova na novém počítači
node tools/project/restore.cjs. ZIP obsahuje literaturu a nesmí se zveřejnit.

Místně ověřeno: čisté sestavení z veřejného seznamu (přibližně 334 MiB),
bez literatury a bez machines-fem. Prezentační výběr má 154 souborů, přibližně
177 MiB. Datové soubory animací se shodují s původní dodávkou; sestavení hlavního
HTML pouze přidává dva prázdné řádky. Kontroly navigace, synchronizace, Parkovy
transformace, komutace, částic a Coulombova modelu prošly. Opraven zastaralý test,
který čekal čtyři soubory bariéry před doplněním fusion.js. Obsah modulů nezměněn.
Průběžné souběžné změny app.js/fusion.js fúzního modulu byly zachovány a do
kontrol je zahrnut také aktuální test-fusion-dt.cjs. Propojení nemění vzhled ani
fyzikální obsah modulů. Vizuální kontrola prohlížečem nebyla provedena a prohlížeč
se automaticky neotevíral.

Odstraněno devět adresářů nepoužívaných FEM výsledků a cache v
versions/vyvoj/m_files/machines-fem/dc-bldc (přibližně 1,99 GiB).
Modely .aedt, skripty, parametry a 19 malých metadat/obrysů v recompute-inputs
zůstaly zachované. Původní chráněné zálohy a literatura jsou nedotčené.

Publikační workflow se spouští při pushi do main. Stav skutečného nasazení
ověřujte v GitHub Actions; neodvozujte jej jen z místního sestavení.

## Výukové moduly — stav z 14. listopadu 2026

Tento dokument má přednost před historickými poznámkami o stavu projektu.
Aktivní kód je v `versions/vyvoj/m_files`. Hlavní sestavení je
`node tools/build-release.cjs` z kořene. Hotová aplikace je
`versions/aktualni/web/index.html`. Pravidla jsou v kořenovém a vnořených
AGENTS.md a v `versions/PRAVIDLA_LADENI_MODULU.md`.

## Poslední práce

- Synchronní stroje: modul `sm12-synchronizing`, zdroje `Web/synchronous/synchronizing*`.
  Dva rotory, budicí pole, nastavitelná klec, fázory a rozdílová napětí,
  indukčnosti a fáze na obou stranách spínače, přehrávání a proudy/moment.
  Opačný sled omezen na prvních 120 ms, skutečné otáčky jsou uvedeny.
  Fyzikální zjednodušení a testy: `m_files/reference/synchronous/README-synchronizing.md`.
- Parkova transformace: `sm08-rotor-dq`, soubory `rotor-dq-*` a `rotor-dq.js`.
  Tři sloupce: řezy, grafy, trvale viditelný výklad se živým výpočtem.
  Barevné čárkované průměty, větší popisky grafů; rovnice d/q zarovnané.
- Rozložení těchto modulů nastavuje také `Web/machine-window-layout.css`.
- Komutace DC: vysvětleno L_sigma a odstraněny kolize popisků se šipkami
  ve společném `Web/synchronous/machine-art.js` a `Web/direct-current/commutation.js`.
- Vzhled domovské stránky doplňují kořenové `tools/physics-preview.*`
  a `tools/physics-visual.*`. Neupravovat pouze hotový HTML výstup.

## Ověření a omezení

V této oddělené kopii bylo znovu provedeno celé sestavení, navigační kontrola,
testy fázovacího modelu a DOM ovládání, Parkovy transformace a komutace.
DOM test používá přibalený `tmp/sync-tests/linkedom.mjs` (LinkeDOM 0.18.12).
Nejde o browserovou kontrolu rozložení. Poslední rozložení Parkovy transformace
je vhodné na novém počítači vizuálně zkontrolovat při běžném a celém okně.
Prohlížeč se při sestavení automaticky nespouští.

Historické poznámky zůstávají v `versions/vyvoj/PREDANI_PROJEKTU.md`.
Literatura a referenční podklady jsou přibalené; Chapmanův PDF soubor je
Instructor’s Manual, nikoli plný text učebnice. Balíček je určen k předání
projektu, nikoli k veřejnému zveřejnění přiložené literatury.
