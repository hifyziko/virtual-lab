# Pokračování ve vývoji

## Jednotný postup od 15. 11. 2026

Repozitář: `https://github.com/hifyziko/virtual-lab`; hlavní větev `main`.
Web: `https://hifyziko.github.io/virtual-lab/`. Aplikace zůstává 1.0.
Historii změn tvoří commity, nikoli další kopie adresářů verzí.

### Nový počítač

Potřebujete Node.js 24, Git a Git LFS. Běžné sestavení nevyžaduje Python,
Ansys, přepočet FEM ani instalaci balíčků npm. Git autora a přihlášení nastavte
na každém počítači samostatně; hesla a tokeny do souborů projektu nepatří.

S GitHubem: naklonujte repozitář, spusťte `git lfs install --local`,
`git lfs pull`, `git config --local core.autocrlf false` a
`git config --local pull.ff only`.

Se soukromým ZIPem: rozbalte do nové prázdné složky a spusťte
`node tools/project/restore.cjs`. Obnova ověří SHA-256, obnoví Git historii
a aktuální LFS objekty, nastaví origin a zachová soukromou literaturu mimo Git.
S internetem poté proveďte `git fetch origin` a zkontrolujte stav před Pull.
Nikdy nerozbalujte balíček přes jinou rozpracovanou kopii.

### Každá pracovní relace

1. Přečtěte AGENTS.md, PREDANI-AKTUALNI.md a vnořená pravidla.
2. Zkontrolujte `git status`, větev a `git remote -v`.
3. S čistým stromem spusťte `git pull --ff-only`; odchylky řešte vědomým
   sloučením, nikdy resetem s odstraněním práce ani force pushem.
4. Upravujte zdroje v `versions/vyvoj/m_files`, nikoli pouze výsledné HTML.
5. Sestavte `node tools/build-release.cjs`, ověřte `node tools/project/check.cjs`.
6. Nové veřejné soubory registrujte pomocí `node tools/project/files.cjs add cesta`.
7. Spusťte `node tools/project/files.cjs stage`, zkontrolujte `git diff --cached`
   a vytvořte místní commit. `git push` až na výslovný pokyn uživatele.
   Výstupy sestavení se necommitují. Automatický push není součástí práce.

Push do main spouští sestavení a zveřejnění vybrané dodávky. Pro nedokončenou
práci použijte pracovní větev; například `git switch -c prace/nazev` a při
prvním pushi `git push -u origin HEAD`. Před zveřejněním změny slučte do main.

### Pokyn „přesouváme se na jiný počítač“

Aktualizujte PREDANI-AKTUALNI.md: co je hotové, co zbývá, výsledky kontrol,
omezení a další krok. Ověřte sestavení a vytvořte místní commit připraveného stavu.
Push proveďte pouze na výslovný pokyn; samotné předání není souhlas s pushem.
Pokud není práce hotová, použijte pracovní větev. Pak spusťte:

`node tools/project/handoff.cjs`

Výsledkem je soukromý ZIP a kontrolní součet v `handoffs/`. Obsahuje aktivní
zdroje, hotový web, pravidla, předávací poznámky, historii Git (bundle), skutečná
aktuální LFS data, literaturu a malé vstupy pro případný nový výpočet.
ZIP je nezávislý na přihlašovacích údajích původního počítače. Nikdy jej
nepublikujte v tomto veřejném repozitáři ani jako GitHub Release asset.
Při práci bez internetu se balíček označí jako dosud nepushnutý; nesmí se
tvrdit, že GitHub obsahuje tento stav. Původní kopii při přesunu nemažte.

Literatura se přenáší soukromě v původních cestách. Výsledky FEM, mezivýsledky,
cache a staré kompletní předávky se nepřenášejí. Malé zdrojové modely, skripty,
geometrie a parametry zůstávají pro přepočítání na výslovné požádání.
Kompaktní data současných animací patří k nutným zdrojům a musí zůstat.

### Publikační hranice

`config/project-files.json` obsahuje samostatný seznam veřejných zdrojů
a souborů hotového webu. `node tools/project/files.cjs sync` obnoví ochranný
`.gitignore`. `node tools/project/prepare-web.cjs` vytvoří pouze prezentační
kopii v nové složce `dist/pages`; existující složku nepřepíše.
Při nové verzi modulu doplňte také nové runtime soubory do seznamu `webFiles`.
CI ze zdrojů sestaví web, otestuje jej a publikuje jen tento výběr.

Úvodní stránka se sestavuje jako lehký rozcestník. Závěrečný krok
`tools/build-progressive-web.cjs` oddělí vložené lekce a numerické báze
do `web/lazy/`; původní zdroje, data a cesty modulů zůstávají zachované.
Moduly se načítají až po otevření, s průběhem, opakováním při chybě a cache
v otevřené stránce. Funguje také místní otevření přes `file://`.
Generované soubory uvádí `progressiveFiles` v manifestu; publikační nástroj
i předávací ZIP je přidávají automaticky. Nekopírujte samotný index.html.
Při přidání další velké datové závislosti upravte mapování v tomto sestavení
a spusťte `tools/test-progressive.cjs` nebo celé `tools/project/check.cjs`.

### Historické informace o výchozím podkladu

Následující poznámky popisují základ z 14. 11. 2026. Novější stav určuje Git
a PREDANI-AKTUALNI.md; starý ZIP se při pokračování přes novější zdroje neobnovuje.

Nejprve přečíst `AGENTS.md` a `VERZE.md`. Upravit aktivní zdroje v `versions/vyvoj/m_files/`; společné nástroje jsou v kořenovém `tools/`.

Sestavení z kořene: `node tools/build-release.cjs`.
Výsledek: `versions/aktualni/web/index.html`.
Verze zůstává 1.0. Prohlížeč automaticky nespouštět.

Referenční materiály: kořenové učebnice, `TEs knizka/`, `versions/vyvoj/m_files/reference/`, fúzní rukopis v `docs/fuze/podklady/`. Vývoj fúze a částic: `versions/vyvoj/m_files/fusion/`, rozhodnutí a rešerše: `docs/fuze/`.

Historické kopie z úklidu jsou pouze v `versions/archiv/uklid-2026-11-14/`; nejsou zdrojem pro další editace. Původní dvě chráněné zálohy se nepřepisují. Přenosový ZIP z 12. 11. je uložen v archivu a je starší než fúzní rozšíření z 14. 11.

Aktualizace: databáze částic se sestavuje samostatně přes `tools/build-particle-library.cjs`. Fúzní koncepční galerie a studie se do současné dodávky nezahrnují. Odborná rešerše a plány v `docs/fuze/` se zachovávají jako podklady. Jediný vstup do aplikace je `versions/aktualni/web/index.html`.

Aktivní základ byl na výslovný pokyn uživatele obnoven z kořenového `PREDANI-2026-11-14.zip`. Při další práci vycházet ze zdrojů obnovených v `versions/vyvoj/m_files`, nikoli z dřívějšího předání 1.0 ani z archivované předchozí pracovní kopie. Podrobnosti posledních úprav viz `PREDANI-AKTUALNI.md`; současná aplikace navíc zachovává databázi částic a omezuje vstupy na aktuální web.
