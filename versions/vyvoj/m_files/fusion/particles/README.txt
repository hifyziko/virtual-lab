SCHVÁLENÝ STYL ČÁSTIC A JADER
Aktuální sdílená definice: style.js; spojitý povrch: nuclear-shader.js.
Přehledy particle-list/index.html, jadra.html a atomy.html používají
stejné definice jader, barvy, vibrace a škálování značek.
Samotná jádra určuje nucleusIds: proton, deuteron, triton, helium3, alpha.
Atom přidává k témuž jádru elektronový obal; jádro se nekopíruje.
Značky: referenčně 50 px na průměr 150 px; okolní text 18 px.
Nastavení se mění jednou v knihovně a promítá do všech tří přehledů.
Aktuální procedurální WebGL renderer je particle-list/list.js.
Níže uvedené Three.js API patří ke staršímu náhledu particle-study.

Sdílená knihovna částic HiFyziko

Centrální výtvarná definice: style.js.
Obsahuje barvy, poloměry, geometrii, velikost popisků, osvětlení,
rozestupy, složení druhů a amplitudy pulzování.
Laloky: lobeAmplitude 0.038, breathingAmplitude 0.004; celková mez 4,2 %.
Elektron zůstává hladký. Fyzikální interpretace je ilustrativní.

motion.js: společné plynulé pulzování a předpočítané povrchové váhy.
particle-art.js: jediný renderer částic, výroba jader a jejich aktualizace.
Galerie particle-study/scene.js pouze skládá scénu a umísťuje popisky;
nekopíruje definice materiálů, geometrií, druhů ani deformací.

Načtení: Three.js, style.js, motion.js, particle-art.js (v tomto pořadí).
Použití:
const nucleus = HiFyzikoParticles.createNucleus('deuteron', {scale: 1, seed: 1});
scene.add(nucleus.group);
nucleus.update(timeInSeconds);
// Každá položka nucleus.particles nabízí tex a pevný lokální anchor pro popisek.
// Anchor převeďte přes nucleus.group.localToWorld při transformaci celého jádra.
nucleus.dispose();

Druhy: proton, neutron, electron, deuteron, triton, helium3, alpha.
Nové moduly mají odkazovat na tutéž knihovnu, nikoli kopírovat její kód.
Parametry geometrie měňte před vytvořením instancí; po změně a sestavení
obnovte stránku. Nejde o živý editor již existujících instancí.

Dodávka obsahuje jedinou společnou cestu web/shared/particles/.
Sestavení: node tools/build-particle-study.cjs
Kontrola: node tools/test-particle-library.cjs
Hlavní build-release.cjs tento build už zahrnuje.

Současná galerie už knihovnu používá. Budoucí moduly ji mají používat také.
Starší opuštěná galerie šesti výtvarných variant nebyla převedena;
nejde o konzumenta nyní zvoleného směru.
Prohlížeč ani vizuální kontrola nebyly automaticky spuštěny.
