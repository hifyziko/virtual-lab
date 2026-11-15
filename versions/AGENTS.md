# Pravidla projektu

Pravidla Gitu, veřejné publikace a soukromého předání mezi počítači jsou v kořenovém `../AGENTS.md` a `../PREDANI_PROJEKTU.md`. Platí pro všechny podadresáře. Literatura se přenáší soukromě; veřejný web obsahuje pouze prezentační soubory.

## Závazné pravidlo matematické sazby

- Vždy používat KaTeX pro všechny matematické vztahy, značky veličin, indexy, řecká písmena a číselné hodnoty s jednotkami v celém uživatelském rozhraní, včetně ovladačů, tabulek, výsledků, popisků grafů a schémat i dynamických hlášek. Platí pro nové moduly i úpravy stávajících.
- Nepoužívat prostý text, Unicode náhražky indexů ani ručně skládané HTML jako náhradu matematické sazby. V SVG používat existující KaTeX/foreignObject renderer a v canvasu existující matematickou vrstvu. Běžný nematematický text zůstává běžným textem.
- Dynamicky změněné hodnoty znovu vysázet přes KaTeX; zachovat českou desetinnou čárku, správné mezery před jednotkami a stojaté jednotky. Při kontrole změn ověřit i matematiku v tabulkách a popiscích, nejen hlavní rovnice.

Pro další ladění modulů dodržuj také [PRAVIDLA_LADENI_MODULU.md](PRAVIDLA_LADENI_MODULU.md).
