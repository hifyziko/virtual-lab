# Pracovní projekt · verze 1.0

## Jediný aktuální stav — 17. listopadu 2026

Na výslovný pokyn uživatele byl převzat soukromý balíček
`HiFyziko-predani-na-jiny-pocitac-2026-11-16.zip`, commit
`7a9914e314a939d86f79a0b0a192e2a80d49734d` na větvi `main`.
Všech 1 514 souborů bylo ověřeno podle SHA-256 manifestu. Čistý původní
repozitář byl aktualizován pomocí `git pull --ff-only`; veřejné zdroje
souhlasily s balíčkem. Žádné místní změny nebyly zahozeny.

- **Upravitelné zdroje:** `versions/vyvoj/m_files/`.
- **Společné nástroje:** `tools/` a `config/project-files.json`.
- **Aktuální výuka:** `versions/aktualni/web/index.html`; spouštění také přes `SPUSTIT_VYUKU.cmd`.
- **Jediný soukromý předávací ZIP:** `handoffs/HiFyziko-predani-na-jiny-pocitac-2026-11-16.zip` a sousední `.sha256`.
- **Literatura a malé modelové vstupy:** původní cesty; nikdy do veřejného webu ani Gitu.
- **Chráněné zálohy:** `versions/1.0.0-pred-upravami` a `versions/1.5.8-pred-schematem`; zůstávají nedotčené.

Sestavení: `node tools/build-release.cjs`. Kontrola: `node tools/project/check.cjs`.
Vnořená `versions/vyvoj/versions/aktualni` a
`versions/vyvoj/m_files/Web/nahled-usporna-vyuka` jsou automatické pracovní
výstupy stávajícího sestavení, nikoli další verze pro editaci.

## Úklid 17. listopadu 2026

Po nezávislém sestavení balíčku odstraněny předávky ze 14. a 15. listopadu,
historický archiv `versions/archiv/uklid-2026-11-14`, rozbalené testovací
kopie, staré publikační výstupy `dist`, nepotřebné dočasné soubory a
zastaralé vygenerované webové soubory. Nové sestavení již automaticky
odstraňuje nepoužité soubory s kontrolním hashem v `web/lazy`.
Podrobný místní soupis je v `handoffs/uklid-2026-11-17.json`.

Nevytvářet další číslované kopie, archivy úklidu ani průběžné předávky.
Historii změn uchovává Git. Nový předávací ZIP vytvářet až při požadavku
na přesun; po ověření ponechat jediný aktuální ZIP. Aplikace zůstává 1.0.
Push se provádí jen na samostatný výslovný pokyn uživatele.
