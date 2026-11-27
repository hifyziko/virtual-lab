const ConverterLessons = (() => {
  const modes = (...items) => ({key:'mode',label:'Zapojení a řízení',items});
  const slider = (key,label,min,max,value,unit,step=1) => ({key,label,min,max,value,unit,step});
  const load = {key:'load',label:'Zátěž',items:[['r','R'],['rl','RL'],['motor','RLu_i']],value:'rl'};
  const carrier = slider('carrier','Kmitočet spínání',200,2000,500,'\\mathrm{Hz}');
  const duty = slider('duty','Poměrná doba sepnutí',10,90,50,'\\%');
  const depth = slider('depth','Hloubka modulace',10,100,80,'\\%');
  const angle = slider('angle','Řídicí úhel',0,150,45,'{}^\\circ');
  const voltage = '\\mathrm V', current = '\\mathrm A';
  const rectSignals = [['u_a',voltage,0],['u_b',voltage,0],['u_c',voltage,0],['u_d',voltage,1],['i_d',current,2]];
  const pwmSignals = [['u_r^*','1',0],['u_{\\text{pila}}^*','1',0],['g','1',0],['u',voltage,1],['i',current,2]];
  const lessons = {
    diody:{
      title:'Neřízený usměrňovač',controls:[modes(['star','Trojfázové uzlové spojení'],['three','Trojfázové můstkové spojení'],['single','Jednofázový můstek'])],signals:rectSignals,reading:['U_d',voltage],
      theory:'V trojfázovém uzlovém spojení komutuje proud na následující diodu v průsečíku kladných půlvln fázových napětí. Na zátěži je napětí fáze, jejíž dioda vede proud.',
      meaning:'Střední usměrněné napětí je plocha pod průběhem okamžitého napětí za jednu periodu dělená dobou této periody. V jednofázovém můstku s odporovou zátěží přispívají obě půlvlny stejnou plochou.',
      task:'Zvolte trojfázové uzlové spojení. Posuňte kurzor přes průsečík dvou fázových napětí. Která dioda převzala proud? Porovnejte průběh na zátěži s jednofázovým můstkovým spojením.',
      assumptions:'Ideální diody, při zániku proudu se větev uzavře pro proud v závěrném směru. Trojfázové můstkové spojení je doplňující zapojení pro porovnání.',formula:"U_d=\\frac1T\\int_0^T u_d(t)\\,\\mathrm dt",source:'4.2.3–4.2.5, obr. 4-5 až 4-7'},
    tyristory:{
      title:'Trojfázové uzlové spojení',controls:[angle],signals:rectSignals,reading:['U_d',voltage],
      theory:'Řídicí úhel se měří od okamžiku přirozené komutace do přivedení řídicího impulzu. Při nepřerušovaném proudu převezme nově sepnutý tyristor proud předchozí fáze. Na zátěži je pak napětí nově připojené fáze. U odporové zátěže může proud zaniknout již při průchodu tohoto napětí nulou. Do sepnutí dalšího tyristoru je pak proud nulový. Při nepřerušovaném kladném proudu a záporném středním napětí se energie předává ze stejnosměrné strany na střídavou.',
      meaning:'Referenční střední napětí odpovídá nulovému úhlu řízení. Při nepřerušovaném proudu je střední napětí při pravém úhlu nulové. Při přerušovaném proudu určete střední hodnotu z napěťového průběhu.',
      task:'Zvětšujte úhel řízení. Vyberte zátěž s protinapětím, nastavte jeho zápornou hodnotu a zvětšete indukčnost. Sledujte, zda je proud nepřerušovaný, a porovnejte znaménka středního napětí a proudu.',
      assumptions:'Trojfázové uzlové spojení s okamžitou komutací. Uvedený vztah pro střední napětí platí při nepřerušovaném proudu. Pro střídačový chod se předpokládá zdroj na stejnosměrné straně.',formula:'U_d=U_{d0}\\cos\\alpha',source:'4.3.4–4.4, obr. 4-10, 4-12 a 4-15'},
    pwm:{
      title:'Komparátor a spínaná větev',controls:[modes(['fixed','Konstantní řídicí napětí'],['sine','Sinusový řídicí signál']),duty,depth,{...carrier,max:100000},load],signals:pwmSignals,reading:['U_{\\text{stř}}',voltage],
      theory:'Řídicí sinusový signál má frekvenci odpovídající požadované výstupní frekvenci střídače. V komparátoru se porovnává řídicí napětí s nosným signálem pilovitého charakteru. Při konstantním kmitočtu spínání zůstává perioda stejná. Změnou doby sepnutí se mění šířka napěťového pulzu, a tím střední hodnota výstupního napětí.',
      meaning:'Poměrná doba sepnutí je podíl doby sepnutí a spínací periody. Při sepnutí je na zátěži napětí meziobvodu, ve zbývající části periody je napětí nulové. U konstantního řídicího napětí proto poloviční doba sepnutí dává poloviční střední napětí.',
      task:'Zvolte konstantní řídicí napětí. Na horním průběhu najděte okamžik rovnosti obou napětí a pod ním změnu výstupního napětí. Prodlužte poměrnou dobu sepnutí a odečtěte střední hodnotu napětí. Přepněte z odporu na odpor a indukčnost. Při stejné poměrné době sepnutí zvyšte kmitočet spínání a porovnejte zvlnění proudu. Nakonec zvolte sinusový řídicí signál a sledujte šířku jednotlivých pulzů.',
      assumptions:'Řídicí a nosný signál jsou vyjádřeny poměrně. Napětí zátěže se měří vůči zápornému pólu zdroje. Střední hodnota se počítá za celý zobrazený záznam.',
      formula:"D=\\frac{T_1}{T},\\qquad f_s=\\frac1T,\\qquad U_{\\text{stř}}=D\\,U_d",source:'5.1 a 5.4, obr. 5-2 a 5-5, a 6.4.2, obr. 6-10'},
    pulzni:{
      title:'Měnič s tlumivkou',controls:[modes(['buck','Snižující'],['boost','Zvyšující']),duty,carrier],signals:[['g','1',0],['u_L',voltage,1],['i_L',current,2],['i_2',current,2]],reading:['U_2',voltage],
      theory:'Při sepnutí spínače přechází energie ze zdroje do zátěže a část se akumuluje v indukčnosti. Po vypnutí se energie nahromaděná v indukčnosti uvolní. Proud se uzavírá přes nulovou diodu.',
      meaning:'Poměrná doba sepnutí je podíl doby sepnutí a spínací periody. U snižujícího měniče určuje, po jakou část periody je připojen zdroj. U zvyšujícího měniče při vypnutí dodávají energii do výstupu zdroj i tlumivka. Vztahy mezi vstupním a výstupním napětím platí v ustáleném stavu při nepřerušovaném proudu tlumivky.',
      task:'Vyberte měnič pro snižování napětí. Porovnejte proud v době sepnutí a v době vypnutí spínače. Zvětšete poměrnou dobu sepnutí a odečtěte výstupní napětí. Pokus zopakujte u měniče pro zvyšování napětí.',
      assumptions:'Uvedené vztahy platí při nepřerušovaném proudu. Výpočet zahrnuje tlumivku měniče a výstupní kondenzátor. Proud tlumivkou a proud zátěže jsou zobrazeny samostatně.',formula:'U_{2,\\text{sniž}}=D U_1,\\qquad U_{2,\\text{zvyš}}=U_1/(1-D)',source:'5.1–5.2, obr. 5-2 a 5-3'},
    jednofazovy:{
      title:'Jednofázový H-můstek',controls:[modes(['six','Obdélníkové'],['pwm','Bipolární PWM']),depth,carrier,load],signals:pwmSignals,reading:['U_{\\text{stř}}',voltage],
      theory:'Spínáním spínačů je u napěťových střídačů vytvářen průběh výstupního napětí. Průběh proudu je následně dán charakterem zátěže. Při zatížení do odporu a indukčnosti převezmou po vypnutí spínačů vedení proudu nulové diody.',
      meaning:'Dvojice spínačů na úhlopříčkách můstku připojují napětí stejnosměrného zdroje k zátěži s opačnou polaritou. Při zatížení do odporu a indukčnosti může mít proud po přepnutí ještě původní směr. Po dobu vedení nulových diod se část energie z indukčnosti vrací do zdroje.',
      task:'Při obdélníkovém řízení vyhledejte změnu polarity napětí. Porovnejte průchod proudu nulou při ohmické zátěži a při zatížení do odporu a indukčnosti. Sledujte ve schématu, kdy vedou nulové diody.',
      assumptions:'Ideální spínače a diody, konstantní napětí zdroje.',formula:"u=\\begin{cases}+U_d&\\text{první dvojice spínačů}\\\\-U_d&\\text{druhá dvojice spínačů}\\end{cases}",source:'6.2–6.2.2, s. 65, a 6.4.2, obr. 6-10'},
    stridavy:{
      title:'Antiparalelní tyristory',controls:[angle,load],signals:[['u_s',voltage,0],['u',voltage,1],['i',current,2]],reading:['U_{\\mathrm{ef}}',voltage],
      theory:'Střídavé měniče napětí se používají k řízení napětí, proudu a výkonu střídavé zátěže. Základním zapojením jsou dva antiparalelně spojené tyristory.',
      meaning:'Efektivní hodnota se určuje z okamžitého napětí za celou síťovou periodu, včetně intervalů bez vedení. Při odporové zátěži určuje tato hodnota činný výkon. Při zatížení do odporu a indukčnosti určuje konec vedení tyristoru zánik proudu.',
      task:'Zvolte odporovou zátěž. Zvětšujte úhel řízení a odečítejte efektivní hodnotu výstupního napětí. Pak připojte odpor a indukčnost. Porovnejte okamžik průchodu napětí nulou s okamžikem zániku proudu.',
      assumptions:'Zapalovací povel trvá od nastaveného úhlu do konce příslušné půlperiody.',formula:"U_{\\mathrm{ef}}=\\sqrt{\\frac1T\\int_0^T u^2(t)\\,\\mathrm dt},\\qquad P_R=\\frac{U_{\\mathrm{ef}}^2}{R}",source:'7, obr. 7-1 a 7-2, s. 77–79'},
    kmitocet:{
      title:'Měnič s napěťovým meziobvodem',controls:[modes(['vf','Konstantní poměr U/f'],['fixed','Konstantní napětí']),slider('freq','Výstupní kmitočet',10,50,35,'\\mathrm{Hz}')],signals:[['u_{\\text{usm}}',voltage,0],['U_d',voltage,0],['u_{a1}',voltage,1],['u_{b1}',voltage,1],['u_{c1}',voltage,1],['i_a',current,2]],
      theory:'V usměrňovači se usměrní napájecí napětí vstupního kmitočtu. Střídač vytváří střídavé napětí požadovaného výstupního kmitočtu. Oba střídavé obvody odděluje stejnosměrný meziobvod. Výstupní kmitočet lze řídit nezávisle na vstupním.',
      meaning:'Při řízení s konstantním poměrem napětí a kmitočtu klesá s kmitočtem také napětí základní harmonické.',
      task:'Snižte výstupní kmitočet. Porovnejte periody napětí před meziobvodem a za střídačem. Přepněte z konstantního napětí na konstantní poměr napětí a kmitočtu. Sledujte amplitudu výstupního napětí.',
      assumptions:'Konstantní napětí meziobvodu, na výstupu základní harmonické fázových napětí. Při generátorickém chodu přebírá výkon brzdný odpor v meziobvodu. Schéma zobrazuje směr středního výkonu na stejnosměrné straně.',formula:"\\frac{U_{a1}}{f}=\\mathrm{konst.}",source:'8.2.1, obr. 8-3, a 12.5.5'},
    aktivni:{
      title:'Síťový vstup měniče',controls:[modes(['diode','Neřízený usměrňovač'],['active','Pulzní usměrňovač']),slider('amps','Proud za diodovým můstkem',1,5,2,'\\mathrm A')],signals:[['u_a',voltage,0],['i_{a,\\text{d}}',current,1],['i_{a,\\text{PWM}}',current,1],['p_a','\\mathrm W',2]],reading:['P_a','\\mathrm W'],
      theory:'U pulzního usměrňovače se vhodným spínáním tranzistorů dosahuje přibližně sinusového průběhu odebíraného proudu. Současně se požaduje odběr proudu první harmonické s dobrým účiníkem.',
      meaning:'Okamžitý výkon fáze je součin jejího napětí a proudu. Jeho střední hodnota za síťovou periodu je činný výkon fáze. U pulzního usměrňovače porovnejte průběh síťového proudu se sinusovým průběhem napětí stejné fáze.',
      task:'Porovnejte proud téže fáze u neřízeného a pulzního usměrňovače. Přepněte zapojení a odečtěte střední činný výkon fáze. Změňte odpor zátěže a porovnejte oba průběhy znovu.',
      assumptions:'Obě zapojení mají tutéž zátěž. U pulzního usměrňovače se předpokládá konstantní napětí meziobvodu a sinusový síťový proud ve fázi s napětím. Šipky ukazují proud na svorkách. Model středních hodnot neurčuje okamžité sepnutí tranzistorů.',formula:"p_a(t)=u_a(t)i_a(t),\\qquad P_a=\\frac1T\\int_0^T p_a(t)\\,\\mathrm dt",source:'4.9, s. 52–53, a 9, s. 86–93'}
  };
  for(const [id,lesson] of Object.entries(lessons)){
    // Rectifiers and inverters share some initial channel definitions; each
    // lesson needs its own list before adding measurements at different ports.
    lesson.signals=[...lesson.signals,['u_i',voltage,id==='aktivni'?0:1,'emf'],
      [id==='aktivni'?'i_{a\\,|\\,u_i=0}':'i_{\\,|\\,u_i=0}',current,id==='aktivni'?1:2,'comparison']];
    lesson.controls=lesson.controls.filter(c=>c.key!=='load'&&c.key!=='amps');
    lesson.controls.push(load,slider('resistance','Odpor',5,40,10,'\\Omega'),
      slider('inductance','Indukčnost',2,100,5,'\\mathrm{mH}'),
      slider('emf','Indukované napětí',-400,400,id==='pulzni'?80:160,'\\mathrm V',id==='pulzni'?1:.1));
    if(['pwm','jednofazovy','stridavy','kmitocet'].includes(id))
      lesson.controls.push(slider('lag','Fázový posuv',-180,180,0,'{}^\\circ'));
  }
  return lessons;
})();
