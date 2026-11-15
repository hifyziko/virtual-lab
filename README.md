# virtual-lab
Interactive laboratory for physics and electrical engineering

Virtuální laboratoř fyziky — aplikace 1.0.

Web: https://hifyziko.github.io/virtual-lab/

## Úpravy na novém počítači

Potřebujete Node.js 24, Git a Git LFS. Nejprve přečtěte `AGENTS.md`,
`PREDANI_PROJEKTU.md` a `PREDANI-AKTUALNI.md`.

```sh
git clone https://github.com/hifyziko/virtual-lab.git
cd virtual-lab
git lfs install --local
git lfs pull
git config --local core.autocrlf false
git config --local pull.ff only
node tools/build-release.cjs
node tools/project/check.cjs
```

Otevřete `versions/aktualni/web/index.html`. Běžná práce: Pull → úpravy zdrojů
→ sestavení a kontrola → místní Commit → **Push až na výslovný pokyn**. GitHub Actions publikuje pouze
vybraný hotový web při pushi do `main`. Pracovní větve se nepublikují.

Repozitář obsahuje upravitelné zdroje a minimální potřebná data. Literatura,
skeny, soukromá předání a výsledkové databáze FEM jsou mimo veřejný Git.
Soukromý přenosový balíček se vytváří podle `PREDANI_PROJEKTU.md`.
