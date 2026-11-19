/* Design values, transcribed from the IPP project overview, checked 2026-11-19.
   https://www.ipp.cas.cz/Compass_U/overview/ — not operating measurements. */
window.CompassUData={
 parameters:[
  ['Toroidální pole','B_{\\mathrm t}=5\\,\\mathrm T'],
  ['Proud plazmatem','I_{\\mathrm p}=2\\,\\mathrm{MA}'],
  ['Hlavní poloměr','R=0{,}894\\,\\mathrm m'],
  ['Vedlejší poloměr','a=0{,}27\\,\\mathrm m'],
  ['Prodloužení','\\kappa=1{,}8'],
  ['Triangularita','\\delta=0{,}3\\text{–}0{,}6'],
  ['Ustálená část výboje','1\\text{–}3\\,\\mathrm s'],
  ['Při nižších parametrech','\\text{až }11\\,\\mathrm s'],
  ['První stěna, jmenovitě','300\\,{}^\\circ\\mathrm C']
 ],
 heating:{initial:{rows:[['NBI','3\\text{–}4\\,\\mathrm{MW}'],['ECRH','1\\,\\mathrm{MW}']],note:'Navíc dva diagnostické svazky, každý o výkonu 0,5 MW.'},extended:{rows:[['NBI','\\text{až }8\\,\\mathrm{MW}'],['ECRH','\\text{až }10\\,\\mathrm{MW}']],note:'Pozdější rozšíření podle aktuálního přehledu projektu.'}},
 clips:{assembly:{title:'Sestavení celého tokamaku',chapters:[['Základna',0],['Cívky',21],['Vnitřek',28.8],['Horní konstrukce',46],['Kryostat',59],['Hotová sestava',76.1]]},interior:{title:'Vnitřní sestava a průlet kamerou',chapters:[['Nádoba',0],['První stěna',8],['Divertor',15],['Průlet',21],['Hotová sestava',33.5]]}}
};
