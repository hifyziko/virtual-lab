# Pracovní projekt · verze 1.0

## Převzetí aktuálního projektu — 20. listopadu 2026

Na pokyn uživatele převzat soukromý archiv `virtual-lab-2026-11-20.zip`.
Aktivní větev: `prace/predani-2026-11-20`, převzatý commit
`c3f9924cd006b1632de03fc2c8e93344256ae0b6`. Ověřeno všech 1 793 souborů
podle SHA-256 manifestu a obnovena historie i LFS data. Původní `main`
zachována a aktualizována fast-forward na `567a598`. Aktuální výuka je
v `versions/aktualni/web/index.html`; zdroje v `versions/vyvoj/m_files`.
Soukromé podklady a chráněné zálohy zachovány. Push nebyl proveden.
Úplné sestavení prošlo; všechny části tools/project/check.cjs ověřeny.
Starší pomocná dodávka byla sestavením sjednocena s aktuálními zdroji.
Vizuální ověření ostrosti při změně velikosti okna nadále zbývá podle předání.

## Jediný aktuální stav — 18. listopadu 2026

Na výslovný pokyn uživatele byl převzat soukromý balíček
`HiFyziko-predani-na-jiny-pocitac-2026-11-16.zip`, commit
`7a9914e314a939d86f79a0b0a192e2a80d49734d` na větvi `main`.
Všech 1 514 souborů bylo ověřeno podle SHA-256 manifestu. Čistý původní
repozitář byl aktualizován pomocí `git pull --ff-only`; veřejné zdroje
souhlasily s balíčkem. Žádné místní změny nebyly zahozeny.

- **Upravitelné zdroje:** `versions/vyvoj/m_files/`.
- **Společné nástroje:** `tools/` a `config/project-files.json`.
- **Aktuální výuka:** `versions/aktualni/web/index.html`; spouštění také přes `SPUSTIT_VYUKU.cmd`.
- **Aktuální soukromý předávací ZIP:** `handoffs/virtual-lab-<čas>-<commit>.zip` a sousední `.zip.sha256`; přesný commit a potvrzení push uvádí `_handoff/state.json` uvnitř balíčku. Po ověření nahrazuje dřívější předání.
- **Literatura a malé modelové vstupy:** původní cesty; nikdy do veřejného webu ani Gitu.
- **Chráněné zálohy:** `versions/1.0.0-pred-upravami` a `versions/1.5.8-pred-schematem`; zůstávají nedotčené.

Sestavení: `node tools/build-release.cjs`. Kontrola: `node tools/project/check.cjs`.
Jedinou spustitelnou dodávkou je `versions/aktualni/web/index.html`.
Staré vstupní adresy ve vývojovém stromu po sestavení přesměrují na aktuální výuku
a zachovají odkaz na vybraný modul.

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
