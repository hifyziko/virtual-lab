# Pracovní projekt · verze 1.0

## Synchronizace od 15. 11. 2026

Aktuální sdílený stav určuje větev `main` v `https://github.com/hifyziko/virtual-lab` a její commity. Níže uvedený ZIP z 14. 11. zůstává neměnným historickým výchozím podkladem, nikoli zdrojem novějších změn. Číselné kopie verzí nevznikají; aplikace zůstává 1.0.

Git verzováním sleduje jen veřejný seznam z `config/project-files.json`. `versions/aktualni`, vnořená dodávka, `dist`, `tmp`, `handoffs`, literatura a výsledky FEM jsou mimo Git. Web se sestaví na každém počítači i v GitHub Actions. Soukromé předání přibaluje literaturu a malé modelové vstupy; podrobnosti v `PREDANI_PROJEKTU.md`.

- **Aktivní zdroje všech bloků:** `versions/vyvoj/m_files/`.
- **Společné nástroje a rozcestník:** `tools/` v kořeni; sestavení `node tools/build-release.cjs`.
- **Jediná aktuální dodávka:** `versions/aktualni/web/index.html`; spouští ji `SPUSTIT_VYUKU.cmd`.
- **Pravidla:** `AGENTS.md`, `versions/AGENTS.md`, `versions/vyvoj/AGENTS.md` a `versions/PRAVIDLA_LADENI_MODULU.md`.
- **Podklady:** učebnice PDF v kořeni, `TEs knizka/`, `versions/vyvoj/m_files/reference/` a `docs/fuze/podklady/`.
- **Nový fúzní vývoj:** `versions/vyvoj/m_files/fusion/`; návrhy a rozhodnutí v `docs/fuze/`.
- **Pracovní fúzní návrhy:** `output/`; dosud používané testovací knihovny v `tmp/fusion-gallery/`.

## Úklid 14. 11. 2026

Staré kořenové `m_files`, rozbalené předání z `Aktualni_verze`, předchozí předávací ZIP, historické poznámky, náhledy a dočasné pracovní kopie byly přesunuty do `versions/archiv/uklid-2026-11-14/`. Nejsou aktivním vývojem. Přesný soupis je tam v `presunute-soubory.json`. Archiv umožňuje dohledat i případné jedinečné starší soubory; nic se neslučovalo přepisem nových zdrojů.

Fúzní rukopis je nyní v `docs/fuze/podklady/jaderna_fuze_finalni_verze.pdf`; odkazy v dokumentaci byly upraveny.

Chráněné zálohy `versions/1.0.0-pred-upravami` a `versions/1.5.8-pred-schematem` zůstávají zachované. Vnitřní `versions/vyvoj/versions/aktualni` je automatický sestavovací výstup. Kořenové `m_files` ani rozbalené předání už nejsou dalším místem pro editace.

Označení aplikace zůstává 1.0. Starý ZIP v archivu je historický snímek a neobsahuje novější fúzní práci; nové předání se má vytvořit z aktivního stromu výše.

Po ověření sestavení odstraněna dočasná sestavovací kopie přenosu `tmp/prenos-vyvoj` (1 085 MiB) a druhá totožná kopie archivu zdrojů (ověřeno SHA-256). Ostatní historické soubory jsou zachovány v archivu. Plné sestavení prošlo včetně galerie fúze a částic.

## Sjednocení současného webu

Jediný vstup do aplikace je `versions/aktualni/web/index.html`, případně `SPUSTIT_VYUKU.cmd`. Kořenový fúzní index a přehledy verzí byly vyřazeny a sestavení je nevytváří. Fúzní koncepční galerie a studie jsou v archivu, nikoli v dodávce. Databáze částic/jader/atomů a její sdílená definice zůstávají aktivní, dostupné z aktuálního rozcestníku. Sestavuje je `tools/build-particle-library.cjs`.

Rešerše, rozbor rukopisu, návrh témat, architektura a rizika zůstávají jako aktivní podklady v `docs/fuze/`; fúzní moduly se budou stavět postupně. Historické vizuální koncepty jsou v archivu. Složka `output` už není aktivní výstup pro spuštění aplikace.

## Oprava základu podle uživatele

Autoritativní současný základ je **PREDANI-2026-11-14.zip** v kořeni. Dne 14. 11. byly z tohoto ZIPu obnoveny aktivní zdroje a sestavení včetně posledních úprav fázování, Parkovy transformace a komutace. Předchozí pracovní strom se od ZIPu lišil; nahrazené soubory jsou uložené v `versions/archiv/uklid-2026-11-14/pred-obnovou-spravneho-predani/`.

K tomuto základu je připojená zachovaná databáze částic a jader. Fúzní galerie a koncepční studie se nesestavují. Rešerše a odborné podklady zůstávají v `docs/fuze/`. Jediný vstup zůstává `versions/aktualni/web/index.html`. ZIP je neměnný původní podklad; živá aplikace navíc obsahuje výše uvedenou databázi a sjednocení vstupu. Kontrolní součty původního ZIPu jsou v archivu, nikoli jako zavádějící kontrola upravené aplikace.
