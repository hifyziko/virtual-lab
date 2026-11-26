(()=>{
  'use strict';
  const $=id=>document.getElementById(id),P=ElectronPhysics,lessons=ElectronLessons;
  let chapter=0,S={},cache={},T=0,running=true,disposed=false,last=0,frame=0,lastDraw=-Infinity,dirty=true;
  let worker=null,timer=0,balance=null,reading='',sceneMath='';
  const camera={yaw:.28,pitch:.23,zoom:1};
  const initialModelCamera={yaw:.36,pitch:.34,zoom:1},modelCamera={...initialModelCamera};
  function resetExperimentCamera(index){
    const front=[6,8,9,10,11].includes(index);
    const tilted=[3,4,5,7].includes(index);
    Object.assign(camera,{yaw:front?0:.28,pitch:front?0:tilted?.60:.23,zoom:1});
  }
  const initialAtomCamera={yaw:.62,pitch:.45,zoom:1},atomCamera={...initialAtomCamera},atomCache={};
  const pairButtons=[...document.querySelectorAll('[data-atom-pair]')];
  let showAtoms=true,atomPair=0,atomState=0;
  let atomRotating=false,quantumVisited=false,lastAtomDraw=-Infinity;
  const orbitalNames=['1\\mathrm{s}','2\\mathrm{s}','2\\mathrm{p}'];
  const staticStages=new Set([8,11]);
  const sliderReferences=[
    {U:[300],B:[0,1]},
    {R:[80,120],kick:[0,.12]},
    {E:[5],b:[0,10],Z:[13,29,47,79]},
    {R:[1,2]},
    {},
    {U:[54],sigma:[.4]},
    {cut:[0],level:[.12],mix:[0,.5,1],phase:[0,90,180,270,360]},
    {U:[54],inc:[0]},
    {p:[0,1]},
    {width:[1.5],gap:[4],energy:[.3]},
    {p:[0,1],width:[.25,.5]},
    {zoom:Array.from({length:10},(_,i)=>i-19),q:Array.from({length:11},(_,i)=>i+3)}
  ];
  function fmt(number,digits=3){
    if(!Number.isFinite(number))return '\\text{mimo rozsah}';
    if(number===0)return '0';
    const exp=Math.floor(Math.log10(Math.abs(number)));
    if(exp>=5||exp< -3)return Number((number/10**exp).toPrecision(digits)).toString().replace('.','{,}')+'\\times10^{'+exp+'}';
    return Number(number.toPrecision(digits)).toString().replace('.','{,}');
  }
  const unitSymbol=u=>u.startsWith('\\')||u.startsWith('{}')||u.includes('_')?u:'\\mathrm{'+u+'}';
  const unit=u=>!u?'':(u==='{}^\\circ'?'':'\\,')+unitSymbol(u);
  const math=s=>katex.renderToString(s,{throwOnError:true,output:'htmlAndMathml'});
  function setMath(el,s){if(el.dataset.formula!==s){el.innerHTML=math(s);el.dataset.formula=s;}}
  function read(sym,num,u='',digits=3){reading+='<div>'+memoMath(sym+'='+fmt(num,digits)+unit(u))+'</div>';}
  function plot(title,series,min,max,ymin,ymax,x,xu,y,yu,{showY=true,xLabel='',yLabel=''}={}){
    $('chartTitle').textContent=title;
    const legend=$('chartLegend'),entries=series.filter(item=>item.label);
    const legendKey=JSON.stringify(entries.map(({label,color,bar})=>[label,color,bar]));
    if(legend.dataset.key!==legendKey){
      legend.replaceChildren(...entries.map(({label,color,bar})=>{
        const item=document.createElement('li');
        item.textContent=label;item.className=bar?'legend-bar':'legend-line';item.style.setProperty('--legend-color',color);
        return item;
      }));
      legend.hidden=!entries.length;legend.dataset.key=legendKey;
    }
    const graph=$('graph'),{left,right,top,bottom}=electronChart(graph,series,min,max,ymin,ymax);
    const key=[min,max,ymin,ymax,x,xu,y,yu].map(v=>typeof v==='number'?fmt(v):v).join('|');
    const axes=$('axes'),axisKey=[x,xu,y,yu,xLabel,yLabel,left,right,bottom].join('|');
    if(axes.dataset.key!==axisKey){
      const labels=[['y',y,yu,yLabel,8,2],['x',x,xu,xLabel,right,bottom+22]].map(([axis,name,u,description,px,py])=>{
        const label=document.createElement('span');label.className='axis-'+axis;
        label.style.left=px+'px';label.style.top=py+'px';
        const formula=name+(u?'\\;['+unitSymbol(u)+']':'');
        label.innerHTML=(description?'<span class="axis-label">'+description+'</span>':'')+math(formula);
        return label;
      });
      axes.replaceChildren(...labels);axes.dataset.key=axisKey;
    }
    const ticks=$('ticks'),tickKey=[key,right,bottom,showY].join('|');
    if(ticks.dataset.key!==tickKey){
      const nodes=[];
      for(let j=0;j<=4;j++){
        const f=j/4;
        for(const [axis,value,tx,ty] of [['x',min+(max-min)*f,left+(right-left)*f,bottom+4],['y',ymax-(ymax-ymin)*f,left-7,top+(bottom-top)*f]]){
          if(axis==='y'&&!showY)continue;
          const tick=document.createElement('span');tick.className='tick-'+axis;tick.style.left=tx+'px';tick.style.top=ty+'px';setMath(tick,fmt(value));nodes.push(tick);
        }
      }
      ticks.replaceChildren(...nodes);ticks.dataset.key=tickKey;
    }
  }
  const mathMemo=new Map();
  function memoMath(s){if(!mathMemo.has(s)){if(mathMemo.size>1200)mathMemo.clear();mathMemo.set(s,math(s));}return mathMemo.get(s);}
  function clearGraph(){
    $('chartTitle').textContent='';$('axes').replaceChildren();$('ticks').replaceChildren();
    const legend=$('chartLegend');legend.hidden=true;legend.replaceChildren();delete legend.dataset.key;
    delete $('ticks').dataset.key;delete $('axes').dataset.key;
    $('graph').replaceChildren();
  }
  function selectAtomPair(index){
    atomPair=index;
    for(const [i,button] of pairButtons.entries())button.setAttribute('aria-pressed',String(i===index));
    for(const side of [0,1]){
      const model=atomGallery[index+side];
      $('atomYear'+side).textContent=model.year;$('atomTitle'+side).textContent=model.name;
      const labels=model.legend.map(([color,label])=>{
        const item=document.createElement('li');item.textContent=label;item.style.setProperty('--swatch',atomColors[color]);
        if(index+side===2&&color==='electron')item.innerHTML=label+' '+math(index===2&&atomState?'n=2':'n=1');
        if(index+side===3&&color==='electron')item.innerHTML=label+' '+math(orbitalNames[atomState]);
        return item;
      });
      $('atomLegend'+side).replaceChildren(...labels);
    }
    $('atomExperiment').textContent=atomGalleryPairs[index].action;
    $('atomStateRow').hidden=index!==2;
    if(index===2&&!quantumVisited){
      quantumVisited=true;
      setAtomRotation(!matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    dirty=true;
  }
  function setAtomRotation(rotating){
    atomRotating=rotating;$('atomRotate').setAttribute('aria-pressed',String(rotating));
  }
  function setMode(atoms){
    showAtoms=atoms;dirty=true;
    $('atomDesk').hidden=!atoms;$('experimentDesk').hidden=atoms;
    $('atomPairs').hidden=!atoms;$('atomCameraTools').hidden=!atoms;
    $('atomMode').setAttribute('aria-pressed',String(atoms));$('experimentMode').setAttribute('aria-pressed',String(!atoms));
  }
  function paint(){
    const p=electronPainter($('canvas'),camera);reading='';
    drawElectronExperiment({p,P,S,T,cache,chapter,read,plot,scale:s=>sceneMath=s,fmt,balance});
    const model=electronPainter($('modelCanvas'),modelCamera,true);
    drawHistoricalElectron(model,chapter,S,T,cache);p.finish();model.finish();
    if(reading!==$('reading')._last){$('reading').innerHTML=reading;$('reading')._last=reading;}
    setMath($('scale'),sceneMath);
  }
  function loop(now){
    if(disposed)return;
    const active=document.visibilityState==='visible'&&!$('dialog').open,elapsed=last?Math.min(.15,Math.max(0,now-last)/1000):0;
    const advancing=!showAtoms&&running&&!staticStages.has(chapter)&&!worker&&active;
    const orbiting=showAtoms&&atomRotating&&active;
    if(advancing)T+=elapsed*Number($('rate').value);
    if(orbiting)atomCamera.yaw=(atomCamera.yaw+.52*elapsed)%P.tau;
    last=now;
    if(advancing&&chapter===9)advanceSlits(elapsed*Number($('rate').value));
    if(advancing&&chapter===3&&S.rad&&T>=P.collapseDuration){T=P.collapseDuration;play(false);dirty=true;}
    if(advancing&&chapter===10&&T>=18){T=18;play(false);}
    if(dirty||(orbiting&&now-lastAtomDraw>=16)||(advancing&&now-lastDraw>=(chapter===6?40:chapter===9?30:16))){
      if(showAtoms){
        for(const side of [0,1]){
          const painter=electronPainter($('atomCanvas'+side),atomCamera,true);
          drawAtomGallery(painter,atomPair+side,atomCache,atomPair===2?atomState:0,$('atomSection').checked);
          painter.finish();
        }
        lastAtomDraw=now;
      }
      else {paint();lastDraw=now;}
      dirty=false;
    }
    frame=requestAnimationFrame(loop);
  }
  function stopWorker(){clearTimeout(timer);if(worker)worker.terminate();worker=null;$('busy').hidden=true;}
  function prepareSlits(){
    stopWorker();
    const {pending=0,flight=null,shotTime}=cache;
    cache={frames:null,hits:[],fired:0,pending,flight,shotTime,rng:P.random(1989)};
    clearGraph();sceneMath='';dirty=true;
    const busy=$('busy'),progress=busy.querySelector('progress'),retry=busy.querySelector('button');
    progress.value=0;retry.hidden=true;busy.querySelector('strong').textContent='Výpočet šíření vlnového balíku';
    timer=setTimeout(()=>{busy.hidden=false;},150);
    function fail(){stopWorker();busy.hidden=false;busy.querySelector('strong').textContent='Výpočet se nepodařilo dokončit.';retry.hidden=false;retry.onclick=prepareSlits;}
    try{
      const url=URL.createObjectURL(new Blob([slitSolver.toString(),'\n','('+slitWorker.toString()+')();'],{type:'text/javascript'}));
      try{worker=new Worker(url);}finally{URL.revokeObjectURL(url);}
      const job=worker;
      worker.onerror=()=>{if(worker===job)fail();};
      worker.onmessage=({data})=>{
        if(worker!==job)return;
        if(data.frames){cache.frames=data.frames;stopWorker();dirty=true;}
        else progress.value=data.progress;
      };
      worker.postMessage({n:S.quality?128:96,dt:.25,mode:['both','upper','lower','mixed'][S.mode],width:S.width,gap:S.gap,energy:S.energy});
    }catch{fail();}
  }
  function resetSimulation(key){
    const visual=chapter===9&&key==='view'||chapter===7&&key==='det'||chapter===6&&['view','cut','phase','level'].includes(key);
    if(!visual){
      if(chapter===9)prepareSlits();
      else cache={};
    }
    if(chapter===0&&['U','B'].includes(key))balance=null;
    if(chapter===0)updateTubeControls();
    if(chapter===2&&key==='target'){
      $('modelTitle').textContent=S.target?'Atom s rozloženým nábojem':electronMilestones[2][1];
      $('modelKey').textContent=S.target?'Kladný náboj v objemu atomu':electronMilestones[2][2];
    }
    if(chapter===6&&key==='view')delete cache.modelSamples;
    dirty=true;
  }
  const tubeBalanceTarget=()=>P.speed(S.U)*S.B/1e6;
  const tubeCentered=()=>S.B>0&&Math.abs(S.E-tubeBalanceTarget())<1e-8;
  function tubeSnapRange(input){
    const target=tubeBalanceTarget();
    return target>0&&target<=Number(input.max)?Math.min(.30,target/2):0;
  }
  function sliderSnap(index,key,input,raw){
    const low=Number(input.min),high=Number(input.max),step=Number(input.step);
    if(index===0&&key==='E'){
      const value=tubeBalanceTarget(),radius=tubeSnapRange(input);
      const zeroRadius=radius>0?Math.min(.18,value*.45):.18;
      if(raw<=zeroRadius)return {value:0,radius:zeroRadius};
      return radius>0?{value,radius}:null;
    }
    let values=sliderReferences[index][key]||[];
    if(index===2&&key==='b')values=[...values,P.k*S.Z/(S.E*1e6*P.e)*1e15];
    if(index===4&&key==='photon')values=[P.energy(S.nf,S.ion+1)-P.energy(S.ni,S.ion+1)];
    if(index===5&&key==='r'){
      const interval=P.h/P.momentum(S.U)*1e12/P.tau;
      const order=Math.round(raw/interval);
      values=[(order-1)*interval,order*interval,(order+1)*interval];
    }
    if(index===7&&key==='det'&&cache.dif){
      const points=cache.dif,peak=Math.max(...points.map(([,y])=>y));
      values=points.filter(([,y],i)=>i>0&&i<points.length-1&&y>peak*.08&&y>points[i-1][1]&&y>=points[i+1][1]).map(([x])=>x);
    }
    const candidates=[...new Set(values.filter(value=>Number.isFinite(value)&&value>=low&&value<=high))];
    if(!candidates.length)return null;
    const value=candidates.reduce((best,candidate)=>Math.abs(candidate-raw)<Math.abs(best-raw)?candidate:best);
    const separation=Math.min(...candidates.filter(candidate=>Math.abs(candidate-value)>1e-9).map(candidate=>Math.abs(candidate-value)));
    const radius=Math.min(Math.max(.55*step,(high-low)*.014),separation*.29);
    return {value,radius};
  }
  function updateTubeControls(){
    const feedback=$('stageFeedback'),electric=$('knob-E'),centered=tubeCentered(),save=$('saveTubeBalance');
    save.disabled=!centered;save.hidden=balance!==null;
    $('disableTubeElectric').hidden=balance===null||S.E===0;
    if(centered)electric.setAttribute('aria-valuetext','Vyváženo');else electric.removeAttribute('aria-valuetext');
    const message=balance!==null&&S.E===0?'Odečti měrný náboj.':
      balance!==null?'Vypni elektrické pole.':
      centered?'Stopa je uprostřed. Ulož vyvážení.':
      S.B===0?'Přidej magnetické pole.':
      tubeBalanceTarget()>Number(electric.max)?'Sniž magnetickou indukci.':
      'Vyrovnej stopu na střed stínítka.';
    if(feedback.textContent!==message)feedback.textContent=message;
  }
  function orbitalControls(){for(const [key,on] of [['cut',S.view===3],['level',S.view===2],['phase',S.mix>0&&S.mix<1]])$('knob-'+key).parentElement.hidden=!on;}
  function action(caption,fn){const button=document.createElement('button');button.textContent=caption;button.onclick=fn;$('actions').append(button);return button;}
  function sampleShots(number){
    if(!cache.frames)return;
    const det=cache.frames.at(-1).det;
    for(let i=0;i<number;i++){const y=detectSlit(det,cache.rng);if(y!==null)cache.hits.push([y,cache.rng()]);}
    S.view=2;$('knob-view').value=2;cache.fired+=number;dirty=true;
  }
  function advanceSlits(elapsed){
    if(!cache.frames)return;
    if(cache.flight){
      const flight=cache.flight;
      flight.progress=Math.min(1,flight.progress+elapsed/1.45);
      if(flight.progress<1)return;
      cache.flight=null;
      if(flight.count===1){sampleShots(1);play(false);}
      else{cache.pending=flight.count;cache.shotTime=T;}
      dirty=true;
    }else if(cache.pending){
      const batch=Math.min(cache.pending,Math.floor(Math.max(0,T-cache.shotTime)*300));
      if(batch){cache.shotTime+=batch/300;cache.pending-=batch;sampleShots(batch);}
      if(!cache.pending)play(false);
    }else if(T>=(cache.frames.length-1)/3){
      T=(cache.frames.length-1)/3;play(false);dirty=true;
    }
  }
  function fire(number){
    if(!cache.frames)return;
    if(cache.flight)cache.flight.count+=number;
    else if(cache.pending)cache.pending+=number;
    else cache.flight={count:number,progress:0};
    S.view=2;$('knob-view').value=2;play(true);dirty=true;
  }
  function select(index){
    stopWorker();chapter=index;S={};cache={};T=0;balance=null;sceneMath='';dirty=true;
    resetExperimentCamera(index);resetModelCamera();
    const l=lessons[index], milestone=electronMilestones[index];
    $('title').textContent=l.title;$('modelTitle').textContent=milestone[1];$('modelKey').textContent=milestone[2];
    $('previous').disabled=index===0;$('next').disabled=index===lessons.length-1;
    for(const [i,button] of [...$('milestones').children].entries()){
      if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    }
    $('controls').replaceChildren();$('actions').replaceChildren();clearGraph();
    $('play').parentElement.hidden=staticStages.has(index);$('rateRow').hidden=staticStages.has(index);
    for(const [key,name,min,max,step,initial,u] of l.controls){
      const wrap=document.createElement('label'),out=document.createElement('output');wrap.textContent=name+' ';wrap.append(out);
      const choice=Array.isArray(min),input=document.createElement(choice?'select':'input');input.id='knob-'+key;
      if(choice){min.forEach((s,i)=>input.add(new Option(s,i)));S[key]=0;}else{
        Object.assign(input,{type:'range',min,max,step,value:initial});S[key]=initial;setMath(out,fmt(initial,5)+unit(u));}
      function applyValue(snapEnabled){
        const previous=S[key];
        const raw=Number(input.value);
        S[key]=raw;
        if(!choice){
          const target=snapEnabled?sliderSnap(index,key,input,raw):null;
          const edge=raw===Number(input.min)||raw===Number(input.max);
          const captured=target&&Math.abs(raw-target.value)<=target.radius&&(!edge||target.value===raw);
          if(captured){
            S[key]=target.value;input.value=target.value;input.dataset.snapped='true';
          }else delete input.dataset.snapped;
        }
        if(!choice)setMath(out,fmt(S[key],5)+unit(u));
        if(chapter===9&&S.mode===3&&S.view===1){S.view=0;$('knob-view').value=0;}
        if(chapter===6)orbitalControls();
        if(chapter===9)$('knob-view').options[1].disabled=S.mode===3;
        if(chapter===4&&key==='ion'){const input=$('knob-photon');input.max=14*(S.ion+1)**2;input.oninput();}
        if(S[key]!==previous)resetSimulation(key);
      }
      input.oninput=()=>applyValue(true);
      if(!choice)input.onkeydown=event=>{
        const direction={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1}[event.key];
        if(!direction||!input.dataset.snapped)return;
        const target=sliderSnap(index,key,input,S[key]);
        if(!target||Math.abs(S[key]-target.value)>1e-8)return;
        event.preventDefault();
        const edge=(target.value+direction*target.radius-min)/step;
        const outside=direction>0?Math.floor(edge+1e-9)+1:Math.ceil(edge-1e-9)-1;
        input.value=Math.max(min,Math.min(Number(input.max),min+outside*step));
        applyValue(false);
      };
      if(chapter===4&&key==='photon')input.max=14;
      wrap.append(input);$('controls').append(wrap);
    }
    if(index===6)orbitalControls();
    if(index===0){
      const feedback=document.createElement('p');feedback.id='stageFeedback';feedback.setAttribute('role','status');
      action('Uložit vyvážení',()=>{
        if(!tubeCentered())return;
        balance=S.E*1e6/S.B;updateTubeControls();$('disableTubeElectric').focus();dirty=true;
      }).id='saveTubeBalance';
      action('Vypnout elektrické pole',()=>{
        const electric=$('knob-E');electric.value=0;electric.oninput();electric.focus();
      }).id='disableTubeElectric';
      $('actions').append(feedback);
      updateTubeControls();
    }
    if(index===4)action('Naladit foton',()=>{const v=Math.abs(P.energy(S.ni,S.ion+1)-P.energy(S.nf,S.ion+1));if(v>=.1){const input=$('knob-photon');input.value=v;input.oninput();}});
    if(index===9){action('Jeden elektron',()=>fire(1));action('Sto elektronů',()=>fire(100));action('Tisíc elektronů',()=>fire(1000));play(true);prepareSlits();}
    if(index===11)action('Porovnat modely',()=>{$('depth').selectedIndex=2;guide();$('dialog').showModal();});
  }
  function guide(){const l=lessons[chapter],level=$('depth').selectedIndex;
    const prose=s=>s.replace(/\$([^$]+)\$/g,(_,v)=>math(v));
    function investigation(entry){
      const row=(name,content)=>'<dt>'+name+'</dt><dd>'+content+'</dd>';
      const steps=Array.isArray(entry.step)?'<ol>'+entry.step.map(step=>'<li>'+prose(step)+'</li>').join('')+'</ol>':prose(entry.step);
      const calculation=row('Klíčový vztah','<div class="formula">'+math(entry.calculation.formula)+'</div>'+prose(entry.calculation.explanation));
      return '<dl class="guide-investigation">'+row('Co k tomu vedlo',prose(entry.motivation))+
        row('Cíl',prose(entry.goal))+row('Co vidíš',prose(entry.scene))+row('Proč to zkoušet',prose(entry.reason))+
        row('Co udělej',steps)+row('Co máš pozorovat',prose(entry.clue))+
        row('Závěr',prose(entry.conclusion))+calculation+'</dl>';
    }
    const equations=l=>[...l.eq,...ElectronDerivations[lessons.indexOf(l)]].map(s=>'<div class="formula">'+math(s)+'</div>').join('');
    const sources=l=>l.src.map(i=>'<li><a target="_blank" rel="noopener" href="'+ElectronSources[i]+'">'+ElectronBibliography[i]+'</a></li>').join('');
    $('depth').parentElement.hidden=showAtoms;
    if(showAtoms){
      const pair=atomGalleryPairs[atomPair];
      $('dialogYear').textContent=atomGallery[atomPair].year+' / '+atomGallery[atomPair+1].year;
      $('dialogTitle').textContent=pairButtons[atomPair].textContent;
      $('guideNext').textContent=pair.action;
      const chapters=[1,2,4,6];
      const primary=atomPair===2?'<li><a target="_blank" rel="noopener" href="https://onlinelibrary.wiley.com/doi/full/10.1002/andp.19263840404">E. Schrödinger (1926), Quantisierung als Eigenwertproblem</a></li>':'';
      let note=atomPair===0?'Thomsonova ukázka představuje víceelektronový atom.':'Bohrovy kružnice pro vodík mají poloměry v poměru '+math('1:4')+'.';
      if(atomPair===2)note+=' Základní stav znázorňuje orbital '+math(orbitalNames[0])+'. Excitované orbitaly '+math(orbitalNames[1])+' a '+math(orbitalNames[2])+' mají stejné hlavní kvantové číslo '+math('n=2')+'. Prostorový řez ukáže jen body v tenké vrstvě přes jádro kolmo ke směru pohledu.';
      $('text').innerHTML=investigation(pair)+'<details><summary>Jak číst modely a zdroje</summary><p>Velikosti jader a částic jsou pro čitelnost zvětšené. Každý model má vlastní měřítko. '+note+'</p><ul>'+sources(lessons[chapters[atomPair]])+sources(lessons[chapters[atomPair+1]])+primary+'</ul></details>';
      return;
    }
    $('dialogYear').textContent=l.year;$('dialogTitle').textContent=l.title;
    $('guideNext').textContent=level===2?'Zpět k pokusu':'Jít k ovládání pokusu';
    const comparison=i=>'<dl>'+ElectronComparison[i].map((v,j)=>'<dt>'+['Představa elektronu','Co vysvětlí','Kde narazí','Kde platí'][j]+'</dt><dd>'+prose(v)+'</dd>').join('')+'</dl>';
    $('text').innerHTML=level===2?lessons.map((o,i)=>'<details '+(i===chapter?'open':'')+'><summary>'+o.year+' · '+o.title+'</summary>'+comparison(i)+'<p>'+prose(o.story)+'</p><ul>'+sources(o)+'</ul></details>').join(''):
      investigation(electronLabNotes[chapter])+'<details><summary>Co model vysvětlí a kde narazí</summary><p>'+prose(l.story)+'</p>'+comparison(chapter)+'<p>'+electronModelTransitions[chapter]+'</p></details>'+
      '<details '+(level===1?'open':'')+'><summary>Fyzikální model a zdroje</summary><p>'+prose(l.task)+'</p>'+equations(l)+'<p>'+prose(ElectronDetails[chapter])+'</p><p>'+prose(l.detail)+'</p><ul>'+sources(l)+'</ul></details>';
  }
  lessons.forEach((l,i)=>{
    const button=document.createElement('button'),year=document.createElement('time');year.textContent=l.year;
    button.append(year,electronMilestones[i][0]);button.onclick=()=>select(i);$('milestones').append(button);
  });
  $('previous').onclick=()=>select(chapter-1);$('next').onclick=()=>select(chapter+1);
  function play(on){running=on;$('play').textContent=on?'Pozastavit':'Přehrát';}
  $('play').onclick=()=>{
    if(!running){
      if(chapter===3&&S.rad&&T>=P.collapseDuration)T=0;
      if(chapter===10&&T>=18)T=0;
      if(chapter===9&&cache.frames&&!cache.flight&&!cache.pending){
        if(S.view===2){S.view=0;$('knob-view').value=0;T=0;}
        if(T>=(cache.frames.length-1)/3)T=0;
      }
    }
    play(!running);dirty=true;
  };
  $('step').onclick=()=>{
    play(false);T+=chapter===3?.025:chapter===9?1/3:.04;
    if(chapter===3&&S.rad)T=Math.min(T,P.collapseDuration);
    if(chapter===9)advanceSlits(1/3);
    dirty=true;
  };
  $('restart').onclick=()=>{
    T=0;
    if(chapter===9){cache.hits=[];cache.fired=0;cache.pending=0;cache.flight=null;cache.rng=P.random(1989);}
    dirty=true;
  };
  const zoom=f=>{camera.zoom=Math.max(.45,Math.min(2.8,camera.zoom*f));dirty=true;};
  $('out').onclick=()=>zoom(1/1.15);$('in').onclick=()=>zoom(1.15);$('home').onclick=()=>{resetExperimentCamera(chapter);dirty=true;};
  function attachCamera(canvas,view){
    let pointer=null;
    function rotate(dx,dy){view.yaw-=dx*.006;view.pitch=Math.max(-1.5,Math.min(1.5,view.pitch+dy*.006));dirty=true;}
    canvas.onpointerdown=e=>{if(view===atomCamera)setAtomRotation(false);pointer=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};
    canvas.onpointermove=e=>{if(pointer){rotate(e.clientX-pointer[0],e.clientY-pointer[1]);pointer=[e.clientX,e.clientY];}};
    canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=()=>pointer=null;
    canvas.onkeydown=e=>{
      const moves={ArrowLeft:[-14,0],ArrowRight:[14,0],ArrowUp:[0,-14],ArrowDown:[0,14]};
      if(moves[e.key]){e.preventDefault();if(view===atomCamera)setAtomRotation(false);rotate(...moves[e.key]);}
    };
  }
  function resetModelCamera(){Object.assign(modelCamera,initialModelCamera);if([3,4,5,7].includes(chapter))modelCamera.pitch=.60;}
  $('modelHome').onclick=()=>{resetModelCamera();dirty=true;};
  attachCamera($('modelCanvas'),modelCamera);attachCamera($('canvas'),camera);
  attachCamera($('atomCanvas0'),atomCamera);attachCamera($('atomCanvas1'),atomCamera);
  for(const [i,button] of pairButtons.entries())button.onclick=()=>selectAtomPair(i);
  $('atomRotate').onclick=()=>setAtomRotation(!atomRotating);
  $('atomHome').onclick=()=>{setAtomRotation(false);Object.assign(atomCamera,initialAtomCamera);dirty=true;};
  $('atomState').onchange=()=>{atomState=Number($('atomState').value);selectAtomPair(atomPair);};
  $('atomSection').onchange=()=>dirty=true;
  $('atomMode').onclick=()=>setMode(true);$('experimentMode').onclick=()=>setMode(false);
  function openAtomExperiment(){
    select(atomGalleryPairs[atomPair].experiment);setMode(false);$('experimentMode').focus();
    if(atomPair===2){const orbital=$('knob-state');orbital.value=atomState;orbital.oninput();}
  }
  $('atomExperiment').onclick=openAtomExperiment;
  $('guideNext').onclick=()=>{
    $('dialog').close();
    if(showAtoms)openAtomExperiment();
    else $('controls').querySelector('input,select')?.focus();
  };
  $('canvas').onwheel=e=>{e.preventDefault();zoom(Math.exp(-.001*e.deltaY));};
  $('guide').onclick=()=>{guide();$('dialog').showModal();};$('depth').onchange=guide;
  window.addEventListener('resize',()=>dirty=true);document.addEventListener('visibilitychange',()=>last=0);
  $('electronCredit').hidden=window.parent!==window;
  window.HiFyzikoFusionDispose=()=>{disposed=true;cancelAnimationFrame(frame);stopWorker();};select(0);selectAtomPair(0);frame=requestAnimationFrame(loop);
})();
