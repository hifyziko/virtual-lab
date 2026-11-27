(()=>{
  'use strict';
  const $=id=>document.getElementById(id),P=ElectronPhysics,lessons=ElectronLessons;
  let chapter=0,S={},cache={},T=0,running=true,disposed=false,last=0,frame=0,lastDraw=-Infinity,dirty=true;
  let worker=null,timer=0,balance=null,reading='',sceneMath='',beforeBohrRunning=true,beforePacketRunning=true;
  const camera={yaw:.28,pitch:.23,zoom:1};
  const initialModelCamera={yaw:.36,pitch:.34,zoom:1},modelCamera={...initialModelCamera};
  function resetExperimentCamera(index){
    if(index===6&&S.view===3){
      const {yaw,pitch}=OrbitalVolume.planes[S.plane];
      Object.assign(camera,{yaw,pitch,zoom:1});return;
    }
    const front=[7,8,9,10,11].includes(index);
    const tilted=[3,4,5,6].includes(index);
    const zoom=index===7?.84:index===5?1.35:1;
    Object.assign(camera,{yaw:front?0:index===6?1.42:.28,pitch:front?0:index===5?.48:tilted?.60:.23,zoom});
  }
  const initialAtomCamera={yaw:.62,pitch:.45,zoom:1},atomCamera={...initialAtomCamera},atomCache={};
  const pairButtons=[...document.querySelectorAll('[data-atom-pair]')];
  let showAtoms=true,atomPair=0,atomState=0;
  let atomRotating=false,quantumVisited=false,lastAtomDraw=-Infinity;
  let orbitalBasicState=2,orbitalReturnView=1,orbitalRotating=false;
  const orbitalNames=['1\\mathrm{s}','2\\mathrm{s}','2\\mathrm{p}'];
  const staticStages=new Set([8,11]);
  const fixedRateStages=new Set([4,7,9,10]);
  const slitParameters=['width','gap','energy'];
  const packetPlaybackEnd=12;
  const resolutionRoute=[[0,-9.55],[2.4,-10.28],[4.9,-11.32],[7.8,-12.55],[11.2,-13.88],[14.5,-14.68],[17,-14.85]];
  const resolutionSlopes=resolutionRoute.map(([time,zoom],i,route)=>{
    if(!i||i===route.length-1)return 0;
    const [before,wide]=route[i-1],[after,close]=route[i+1];
    const into=(zoom-wide)/(time-before),out=(close-zoom)/(after-time);
    return 2*into*out/(into+out);
  });
  const sliderReferences=[
    {U:[300],B:[0,1]},
    {R:[80,120],kick:[0,.12]},
    {E:[5],b:[0,10],Z:[13,29,47,79]},
    {R:[1,2]},
    {},
    {},
    {cut:[0],level:[.12],mix:[0,.5,1],phase:[0,90,180,270,360]},
    {U:[54,72]},
    {p:[0,.25,1,3]},
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
  let tuningBounds=null,tuningPointer=null,lastPlotKey=null;
  function plot(title,series,min,max,ymin,ymax,x,xu,y,yu,{showY=true,xLabel='',yLabel='',tune=false,updateKey}={}){
    const graph=$('graph');
    if(updateKey!==undefined){
      const key=updateKey+'|'+graph.clientWidth+'|'+graph.clientHeight;
      if(lastPlotKey===key)return;
      lastPlotKey=key;
    }
    $('chartTitle').textContent=title;
    const legend=$('chartLegend'),entries=series.filter(item=>item.label);
    const legendKey=JSON.stringify(entries.map(({label,color,bar,dash})=>[label,color,bar,dash]));
    if(legend.dataset.key!==legendKey){
      legend.replaceChildren(...entries.map(({label,color,bar,dash})=>{
        const item=document.createElement('li');
        item.textContent=label;item.className=bar?'legend-bar':dash?'legend-dash':'legend-line';item.style.setProperty('--legend-color',color);
        return item;
      }));
      legend.hidden=!entries.length;legend.dataset.key=legendKey;
    }
    const {left,right,top,bottom}=electronChart(graph,series,min,max,ymin,ymax);
    tuningBounds=tune?{left,right,min,max}:null;
    if(tune)graph.dataset.tune='';else delete graph.dataset.tune;
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
    tuningBounds=null;tuningPointer=null;lastPlotKey=null;delete $('graph').dataset.tune;$('graph').replaceChildren();
  }
  const tuningGraph=$('graph');
  function tuneFromGraph(event){
    if(!tuningBounds||chapter===4&&P.bohrGap(S)<=0)return;
    const {left,right,min,max}=tuningBounds,rect=tuningGraph.getBoundingClientRect();
    const px=(event.clientX-rect.left)*tuningGraph.clientWidth/rect.width;
    const directly=Math.min(1,Math.max(0,(px-left)/(right-left)));
    const x=min+(max-min)*directly,input=$(chapter===7?'knob-det':'knob-photon');
    const value=chapter===7?Math.round(x/Number(input.step))*Number(input.step):P.photonEnergy(x);
    input.value=Math.max(Number(input.min),Math.min(Number(input.max),value));
    input.oninput();
  }
  tuningGraph.onpointerdown=event=>{
    if(!tuningBounds||event.button!==0)return;
    tuningPointer=event.pointerId;tuningGraph.setPointerCapture(tuningPointer);tuneFromGraph(event);
  };
  tuningGraph.onpointermove=event=>{if(event.pointerId===tuningPointer)tuneFromGraph(event);};
  tuningGraph.onpointerup=tuningGraph.onpointercancel=tuningGraph.onlostpointercapture=()=>{tuningPointer=null;};
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
    if(chapter===11)$('protonMotion').hidden=protonInteriorOpacity(10**S.zoom)===0;
    if(chapter===5){
      const n=S.reference+1,energy=P.energy(n),delta=energy-P.energy(1);
      setMath($('modelKey'),'E_'+n+'='+fmt(energy,4)+unit('eV')+'\\quad\\Delta E_{1\\to '+n+'}='+(delta>0?'+':'')+fmt(delta,4)+unit('eV'));
    }
  }
  function loop(now){
    if(disposed)return;
    const active=document.visibilityState==='visible'&&!$('dialog').open,elapsed=last?Math.min(.15,Math.max(0,now-last)/1000):0;
    const advancing=!showAtoms&&(running||chapter===7)&&!staticStages.has(chapter)&&!worker&&active&&!cache.slitPreview&&(chapter!==6||S.orbitalAdvanced);
    const orbiting=showAtoms&&atomRotating&&active;
    const orbitalOrbiting=!showAtoms&&chapter===6&&orbitalRotating&&active;
    if(orbitalOrbiting)for(const view of S.view===3?[modelCamera]:[camera,modelCamera])view.yaw=(view.yaw+.36*elapsed)%P.tau;
    const bohrOrbiting=!showAtoms&&active&&chapter===4&&(!cache.bohrTrial||T>=P.bohrDuration);
    if(bohrOrbiting)cache.bohrAngle=((cache.bohrAngle??-1.66)+P.bohrOrbitRate*elapsed)%P.tau;
    if(advancing)T+=elapsed*(fixedRateStages.has(chapter)?1:Number($('rate').value));
    if(orbiting)atomCamera.yaw=(atomCamera.yaw+.52*elapsed)%P.tau;
    last=now;
    if(advancing&&chapter===9)advanceSlits(elapsed);
    if(advancing&&chapter===3&&S.rad&&T>=P.collapseDuration){T=P.collapseDuration;play(false);dirty=true;}
    if(advancing&&chapter===4&&cache.bohrTrial&&T>=P.bohrDuration){
      T=P.bohrDuration;cache.bohrAngle=P.bohrView(cache.bohrTrial,T).angle;play(false);dirty=true;
    }
    if(advancing&&chapter===10&&T>=packetPlaybackEnd){T=packetPlaybackEnd;play(false);}
    if(active&&!showAtoms&&chapter===11&&cache.resolutionFlight)advanceResolutionFlight(elapsed);
    if(active&&!showAtoms&&chapter===11&&cache.protonAnimating&&protonInteriorOpacity(10**S.zoom)>0){
      cache.protonTime=(cache.protonTime??0)+.72*elapsed;
      dirty=true;
    }
    if(dirty||(orbiting&&now-lastAtomDraw>=16)||((advancing||bohrOrbiting||orbitalOrbiting)&&now-lastDraw>=(chapter===6&&S.orbitalAdvanced?40:chapter===9?30:16))){
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
    const slitSettings=slitParameters.map(key=>S[key]);
    cache={frames:null,hits:[],fired:0,pending,flight,shotTime,slitSettings,rng:P.random(1989)};
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
    const visual=chapter===4||chapter===9&&key==='view'||chapter===7||chapter===11||chapter===6&&['view','cut','plane','phase','level'].includes(key);
    if(!visual){
      if(chapter===9)prepareSlits();
      else if(chapter===10&&key==='width'){
        const {packetBaseline}=cache;
        cache={packetBaseline};
        if(T===0&&S.width===.25&&packetBaseline){
          cache.packetShots=packetBaseline.shots;
          cache.packetRandom=packetBaseline.rng;
        }
      }
      else cache={};
    }
    if(chapter===0&&['U','B'].includes(key))balance=null;
    if(chapter===0)updateTubeControls();
    if(chapter===2&&key==='target'){
      $('modelTitle').textContent=S.target?'Atom s rozloženým nábojem':electronMilestones[2][1];
      $('modelKey').textContent=S.target?'Kladný náboj v objemu atomu':electronMilestones[2][2];
    }
    if(chapter===6&&key==='view')delete cache.modelSamples;
    if(chapter===7&&key==='U'){
      delete cache.dif;delete $('knob-det').dataset.snapped;
    }
    if(chapter===11&&key==='zoom'&&cache.resolutionFlight)stopResolutionFlight();
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
    if(index===4&&key==='photon'){
      const value=P.bohrGap(S);
      return value>0?{value,radius:Math.min(value*.42,(high-low)*.027)}:null;
    }
    if(index===5&&key==='r'){
      const unit=P.a*1e12,selected=S.reference+1;
      const target=unit*selected*selected,targetRadius=Math.max(step,(high-low)*.02);
      if(Math.abs(target-raw)<=targetRadius)return {value:target,radius:targetRadius};
      const order=Math.max(1,Math.round(Math.sqrt(raw/unit)));
      const bohr=unit*order*order,radius=(high-low)*.014;
      if(bohr>=low&&bohr<=high&&Math.abs(bohr-raw)<=radius)return {value:bohr,radius};
      const interval=S.lambda*1e3/P.tau,turns=Math.max(1,Math.round(raw/interval));
      values=[turns-1,turns,turns+1].map(n=>interval*n);
    }
    if(index===5&&key==='lambda'){
      const length=P.tau*S.r*.001,turns=Math.max(1,Math.round(length/raw));
      values=[turns-1,turns,turns+1].filter(n=>n>0).map(n=>length/n);
    }
    if(index===7&&key==='det')values=(cache.dif??=electronCrystal.diffraction(S.U)).targets;
    const candidates=[...new Set(values.filter(value=>Number.isFinite(value)&&value>=low&&value<=high))];
    if(!candidates.length)return null;
    const value=candidates.reduce((best,candidate)=>Math.abs(candidate-raw)<Math.abs(best-raw)?candidate:best);
    const separation=Math.min(...candidates.filter(candidate=>Math.abs(candidate-value)>1e-9).map(candidate=>Math.abs(candidate-value)));
    if(index===7&&key==='U')return {value,radius:3};
    if(index===7&&key==='det')return {value,radius:Math.min(2.5,separation*.45)};
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
  function orbitalControls(){
    const advanced=$('orbitalOptions').open===true;
    const slicing=S.view===3;
    S.orbitalAdvanced=advanced;
    $('orbitalCutToggle').checked=slicing;$('orbitalSection').hidden=!slicing;
    for(const [key,on] of [['view',!slicing],['level',S.view===2],['phase',S.mix>0&&S.mix<1]])$('knob-'+key).parentElement.hidden=!on;
    for(let i=0;i<orbitalNames.length;i++)$('orbitalPreset'+i).checked=S.state===i&&(S.view===1||slicing)&&S.mix===0;
    $('modelTitle').textContent=slicing?'Oblak s rovinou řezu':advanced?electronMilestones[6][1]:'Základní stav vodíku';
    $('modelKey').textContent=slicing?'Poloha řezu':advanced?electronMilestones[6][2]:'Srovnávací oblak';
    setMath($('orbitalMixCaption'),'\\text{Příměs }'+orbitalNames[OrbitalVolume.partnerIndex(S.state)]);
    $('play').parentElement.hidden=!advanced;$('rateRow').hidden=!advanced;
    setOrbitalRotation(orbitalRotating);
  }
  function selectOrbitalPreset(index){
    orbitalBasicState=index;
    for(const [key,value] of [['state',index],['view',S.view===3?3:1],['mix',0],['quality',0]]){
      if(S[key]===value)continue;
      const input=$('knob-'+key);input.value=value;input.oninput();
    }
    orbitalControls();dirty=true;
  }
  function addOrbitalChoices(){
    const fields=document.createElement('fieldset'),legend=document.createElement('legend');
    fields.className='orbital-presets';legend.textContent='Porovnej tvary';fields.append(legend);
    const names=['Kulový základní stav','Kulový stav s uzlem','Dva laloky'];
    for(const [i,name] of names.entries()){
      const row=document.createElement('label'),input=document.createElement('input');
      const symbol=document.createElement('span'),description=document.createElement('span');
      Object.assign(input,{type:'radio',name:'orbital-preset',id:'orbitalPreset'+i,checked:i===orbitalBasicState});
      setMath(symbol,orbitalNames[i]);description.textContent=name;
      input.onchange=()=>{if(input.checked)selectOrbitalPreset(i);};
      row.append(input,symbol,description);fields.append(row);
    }
    const cutToggle=document.createElement('input'),cutLabel=document.createElement('label');
    Object.assign(cutToggle,{id:'orbitalCutToggle',type:'checkbox'});
    cutLabel.className='orbital-cut-toggle';cutLabel.append(cutToggle,'Zobrazit řez');
    cutToggle.onchange=()=>{
      if(cutToggle.checked)orbitalReturnView=S.view;
      const view=$('knob-view');view.value=cutToggle.checked?3:S.orbitalAdvanced?orbitalReturnView:1;view.oninput();
    };
    const section=document.createElement('div'),planes=document.createElement('fieldset'),planeLabel=document.createElement('legend');
    section.id='orbitalSection';section.hidden=true;planes.className='compact-radio-options';planeLabel.textContent='Rovina řezu';planes.append(planeLabel);
    S.plane=0;
    OrbitalVolume.planes.forEach(({name},i)=>{
      const row=document.createElement('label'),radio=document.createElement('input'),symbol=document.createElement('span');
      Object.assign(radio,{id:'orbitalPlane'+i,type:'radio',name:'orbital-plane',checked:i===0});
      setMath(symbol,'\\text{'+name+'}');row.append(radio,symbol);planes.append(row);
      radio.onchange=()=>{
        if(!radio.checked||S.plane===i)return;
        S.plane=i;const {yaw,pitch}=OrbitalVolume.planes[i];Object.assign(camera,{yaw,pitch});resetSimulation('plane');
      };
    });
    section.append(planes);
    const options=document.createElement('details'),summary=document.createElement('summary');
    options.id='orbitalOptions';summary.textContent='Další stavy a zobrazení';options.append(summary);
    options.ontoggle=()=>{
      if(chapter!==6||$('orbitalOptions')!==options)return;
      if(options.open){orbitalControls();dirty=true;}
      else selectOrbitalPreset(orbitalBasicState);
    };
    $('controls').append(fields,cutLabel,section,options);
    return options;
  }
  function setOrbitalRotation(on){
    orbitalRotating=on;
    const button=$('orbitalRotate');
    if(button){button.textContent=on?'Zastavit otáčení':S.view===3?'Otáčet oblak':'Otáčet oblaky';button.setAttribute('aria-pressed',String(on));}
  }
  function action(caption,fn){const button=document.createElement('button');button.textContent=caption;button.onclick=fn;$('actions').append(button);return button;}
  function setResolutionField(value){
    S.zoom=value;
    const slider=$('knob-zoom');
    const sliderValue=Math.round(value*20)/20;
    slider.value=sliderValue;delete slider.dataset.snapped;
    setMath($('resolutionFieldValue'),fmt(10**sliderValue)+unit('m'));
    dirty=true;
  }
  function stopResolutionFlight(){
    delete cache.resolutionFlight;
    $('resolutionFlight').textContent='Spustit průlet k jádru';
  }
  function advanceResolutionFlight(elapsed){
    const flight=cache.resolutionFlight;
    flight.time=Math.min(resolutionRoute.at(-1)[0],flight.time+elapsed);
    const end=resolutionRoute.findIndex(([at],i)=>i>0&&flight.time<=at);
    const [t0,x0]=resolutionRoute[end-1],[t1,x1]=resolutionRoute[end];
    const duration=t1-t0,t=(flight.time-t0)/duration,blend=t*t*(3-2*t);
    const slope=(1-t)*resolutionSlopes[end-1]-t*resolutionSlopes[end];
    setResolutionField(x0+(x1-x0)*blend+t*(1-t)*duration*slope);
    if(flight.time===resolutionRoute.at(-1)[0])stopResolutionFlight();
  }
  function setProtonMotion(on){
    cache.protonAnimating=on;
    $('protonMotion').textContent=on?'Pozastavit model protonu':'Rozpohybovat proton';
    dirty=true;
  }
  function toggleResolutionFlight(){
    if(cache.resolutionFlight){stopResolutionFlight();dirty=true;return;}
    resetExperimentCamera(11);
    cache.resolutionFlight={time:0};
    cache.protonTime=0;
    setProtonMotion(true);
    setResolutionField(resolutionRoute[0][1]);
    $('resolutionFlight').textContent='Zastavit průlet';
  }
  function updateBohrControls(){
    const gap=P.bohrGap(S),absorption=gap>0,photon=$('knob-photon'),start=$('bohrStart');
    if(absorption){
      const {photonMin,photonMax}=P.bohrSpectrum(S);
      photon.min=photonMin;photon.max=photonMax;
      S.photon=Math.max(photonMin,Math.min(S.photon,photonMax));
    }
    photon.disabled=!absorption;photon.value=absorption?S.photon:Math.abs(gap);
    if(absorption&&S.photon===gap)photon.dataset.snapped='true';else delete photon.dataset.snapped;
    $('photonCaption').textContent=absorption?'Dopadající foton':'Energie fotonu';
    setMath($('photonValue'),fmt(absorption?S.photon:Math.abs(gap),4)+unit('eV'));
    setMath($('bohrTarget'),absorption?'\\text{Cíl }\\Delta E='+fmt(gap,4)+unit('eV'):gap<0?'\\text{Energie určena přechodem}':'\\text{Zvol různé hladiny}');
    const changed=cache.bohrTrial&&!sameBohrTrial();
    const tuning=P.bohrResonant(S)?'V rezonanci':'Dolaď energii';
    const message=absorption?changed?tuning+' · další pokus':tuning:gap<0?changed?'Emise · další pokus':'Emise z vyšší hladiny':'';
    if($('bohrFeedback').textContent!==message)$('bohrFeedback').textContent=message;
    updateBohrButton(start);
  }
  function updateHydrogenWavelengthRange(){
    const slider=$('knob-lambda'),level=S.reference+1;
    const boundLimit=P.tau*P.a*1e9*level/Math.SQRT2;
    const minimum=Math.ceil(boundLimit*1000)/1000;
    slider.min=minimum;
    if(S.lambda<minimum){slider.value=minimum;slider.oninput();}
  }
  function addDiracFieldChoices(name,labels){
    const fields=document.createElement('fieldset'),legend=document.createElement('legend');
    fields.className='compact-radio-options dirac-field';legend.textContent=name;fields.append(legend);
    S.field=0;
    for(const [index,label] of labels.entries()){
      const row=document.createElement('label'),choice=document.createElement('input');
      Object.assign(choice,{type:'radio',name:'dirac-field',id:'diracField'+index,value:String(index),checked:index===0});
      choice.onchange=()=>{
        if(!choice.checked||S.field===index)return;
        S.field=index;dirty=true;
      };
      row.append(choice,label);fields.append(row);
    }
    $('controls').append(fields);
  }
  function addHydrogenLevelChoices(name,labels){
    const fields=document.createElement('fieldset'),legend=document.createElement('legend');
    fields.className='hydrogen-levels';legend.textContent=name;fields.append(legend);
    S.reference=0;
    for(const [index,label] of labels.entries()){
      const row=document.createElement('label'),choice=document.createElement('input');
      const caption=document.createElement('span'),energy=document.createElement('span');
      const color=hydrogenLevelColors[index];
      Object.assign(choice,{type:'radio',name:'hydrogen-level',id:'hydrogenLevel'+(index+1),value:String(index),checked:index===0});
      row.style.setProperty('--level-color',color);row.style.setProperty('--level-tint',color+'19');
      caption.textContent=label;
      setMath(energy,fmt(P.energy(index+1),3)+unit('eV'));
      choice.onchange=()=>{
        if(!choice.checked||S.reference===index)return;
        S.reference=index;updateHydrogenWavelengthRange();dirty=true;
      };
      row.append(choice,caption,energy);fields.append(row);
    }
    $('controls').append(fields);
  }
  function sameBohrTrial(){return cache.bohrTrial&&['ni','nf','ion','photon'].every(key=>S[key]===cache.bohrTrial[key]);}
  function updateBohrButton(start=$('bohrStart')){
    if(!start)return;
    const gap=P.bohrGap(S),resume=sameBohrTrial()&&T<P.bohrDuration;
    start.textContent=resume?(running?'Pozastavit':'Pokračovat'):gap>0?'Vyslat foton':'Spustit emisi';
    start.disabled=gap===0;
  }
  function startBohr(){
    if(P.bohrGap(S)===0)return;
    if(sameBohrTrial()&&T<P.bohrDuration){play(!running);dirty=true;return;}
    cache.bohrTrial={...S,angle:P.bohrScene(S,cache,T).angle};T=0;play(true);updateBohrControls();dirty=true;
  }
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
    if(!cache.frames||cache.slitPreview)return;
    if(cache.flight)cache.flight.count+=number;
    else if(cache.pending)cache.pending+=number;
    else cache.flight={count:number,progress:0};
    S.view=2;$('knob-view').value=2;play(true);dirty=true;
  }
  function measurePacket(count){
    play(false);
    const {points,cumulative,mass}=electronPacketProfile(S,T,cache);
    const rng=cache.packetRandom??=P.random(1928),shots=cache.packetShots??=[];
    if(T===0&&S.width===.25)cache.packetBaseline={shots,rng};
    for(let i=0;i<count;i++){
      const draw=rng()*mass,j=cumulative.findIndex(value=>value>draw);
      const fraction=(draw-cumulative[j-1])/(cumulative[j]-cumulative[j-1]);
      const position=points[j-1][0]+fraction*(points[j][0]-points[j-1][0]);
      shots.push([position,rng()]);
    }
    dirty=true;
  }
  function select(index){
    if(chapter===4&&index!==4)play(beforeBohrRunning);
    if(chapter===10&&index!==10)play(beforePacketRunning);
    if(chapter!==4&&index===4)beforeBohrRunning=running;
    if(chapter!==10&&index===10)beforePacketRunning=running;
    stopWorker();chapter=index;S={};cache={};T=0;balance=null;sceneMath='';dirty=true;
    resetExperimentCamera(index);resetModelCamera();
    const l=lessons[index], milestone=electronMilestones[index];
    $('title').textContent=l.title;$('modelTitle').textContent=milestone[1];
    $('modelCategory').textContent=index===7?'Terč':index===11?'Sonda':'Dobová představa';
    const modelKey=$('modelKey');delete modelKey.dataset.formula;modelKey.textContent=milestone[2];
    const modelCanvas=$('modelCanvas'),energyDiagram=index===5;
    if(energyDiagram)modelCanvas.dataset.flat='';else delete modelCanvas.dataset.flat;
    $('modelHome').hidden=energyDiagram;
    modelCanvas.setAttribute('tabindex',energyDiagram?'-1':'0');
    modelCanvas.setAttribute('aria-label',energyDiagram?'Diagram energetických hladin vodíku. Čárkovaná čára odpovídá zkoušenému poloměru.':'Prostorový model. Otáčení šipkami nebo tažením.');
    $('previous').disabled=index===0;$('next').disabled=index===lessons.length-1;
    for(const [i,button] of [...$('milestones').children].entries()){
      if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    }
    $('controls').replaceChildren();$('actions').replaceChildren();clearGraph();
    if(index===4)$('actions').dataset.bohr='';else delete $('actions').dataset.bohr;
    orbitalBasicState=2;orbitalReturnView=1;orbitalRotating=false;
    const orbitalOptions=index===6?addOrbitalChoices():null;
    $('play').parentElement.hidden=index===4||index===7||staticStages.has(index);
    $('rateRow').hidden=fixedRateStages.has(index)||staticStages.has(index);
    $('step').hidden=index===9||index===10;
    for(const [key,name,min,max,step,initial,u] of l.controls){
      if(index===5&&key==='reference'){addHydrogenLevelChoices(name,min);continue;}
      if(index===8&&key==='field'){addDiracFieldChoices(name,min);continue;}
      const wrap=document.createElement('label'),out=document.createElement('output');wrap.textContent=name+' ';wrap.append(out);
      const choice=Array.isArray(min),input=document.createElement(choice?'select':'input');input.id='knob-'+key;
      const slitParameter=index===9&&slitParameters.includes(key);
      const formatValue=value=>{
        if(index===6&&key==='mix')return fmt(value*100,3)+'\\,\\%';
        if(index===11)return fmt(10**value)+unit(u);
        return fmt(value,5)+unit(u);
      };
      if(choice){
        min.forEach((s,i)=>{
          const option=new Option(s,i);
          if(index===6&&key==='view'&&i===3)option.hidden=true;
          input.add(option);
        });
        S[key]=index===6&&key==='state'?orbitalBasicState:index===6&&key==='view'?1:0;
        input.value=S[key];
      }else{
        Object.assign(input,{type:'range',min,max,step,value:initial});S[key]=initial;setMath(out,formatValue(initial));}
      if(index===4&&key==='photon'){
        const caption=document.createElement('span');caption.id='photonCaption';caption.textContent=name;
        out.id='photonValue';wrap.className='photon-control';wrap.replaceChildren(caption,out);
      }
      if(index===6&&key==='mix'){
        const caption=document.createElement('span');caption.id='orbitalMixCaption';
        wrap.replaceChildren(caption,out);
      }
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
        if(!choice)setMath(out,formatValue(S[key]));
        if(chapter===9&&S.mode===3&&S.view===1){S.view=0;$('knob-view').value=0;}
        if(chapter===6){
          if(key==='view'&&previous!==S.view&&(previous===3||S.view===3)){
            const oldZoom=camera.zoom;resetExperimentCamera(6);camera.zoom=oldZoom;
          }
          orbitalControls();
        }
        if(chapter===9)$('knob-view').options[1].disabled=S.mode===3;
        if(chapter===4){
          if(T>=P.bohrDuration&&['ion','ni','nf'].includes(key)&&S[key]!==previous)delete cache.bohrTrial;
          updateBohrControls();
        }
        if(S[key]!==previous){
          if(slitParameter){
            cache.slitPreview=slitParameters.some((name,i)=>S[name]!==cache.slitSettings[i]);
            dirty=true;
          }else resetSimulation(key);
        }
      }
      input.oninput=()=>applyValue(true);
      if(slitParameter)input.onchange=()=>{if(cache.slitPreview)prepareSlits();};
      if(!choice)input.onkeydown=event=>{
        const direction={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1}[event.key];
        if(!direction||!input.dataset.snapped)return;
        const target=sliderSnap(index,key,input,S[key]);
        if(!target||Math.abs(S[key]-target.value)>1e-8)return;
        event.preventDefault();
        const low=Number(input.min),edge=(target.value+direction*target.radius-low)/step;
        const outside=direction>0?Math.floor(edge+1e-9)+1:Math.ceil(edge-1e-9)-1;
        input.value=Math.max(low,Math.min(Number(input.max),low+outside*step));
        applyValue(false);
        if(slitParameter)input.onchange();
      };
      if(chapter===4&&key==='photon')input.max=14;
      if(chapter===7&&key==='U')input.dataset.snapped='true';
      if(chapter===11&&key==='zoom')out.id='resolutionFieldValue';
      wrap.append(input);(index===6&&key==='cut'?$('orbitalSection'):orbitalOptions??$('controls')).append(wrap);
    }
    if(index===5)updateHydrogenWavelengthRange();
    if(index===6){
      action('Otáčet oblaky',()=>setOrbitalRotation(!orbitalRotating)).id='orbitalRotate';
      setOrbitalRotation(false);orbitalControls();
    }
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
    if(index===4){
      const target=document.createElement('div');target.id='bohrTarget';$('actions').append(target);
      action('Spustit emisi',startBohr).id='bohrStart';
      const feedback=document.createElement('div');feedback.id='bohrFeedback';feedback.setAttribute('role','status');$('actions').append(feedback);
      $('knob-photon').setAttribute('aria-describedby','bohrTarget bohrFeedback');
      play(false);updateBohrControls();
    }
    if(index===9){action('Jeden elektron',()=>fire(1));action('Sto elektronů',()=>fire(100));action('Tisíc elektronů',()=>fire(1000));play(true);prepareSlits();}
    if(index===10){
      action('Změřit jednou',()=>measurePacket(1));
      action('Zopakovat stokrát',()=>measurePacket(100));
      play(false);
    }
    if(index===11){
      action('Spustit průlet k jádru',toggleResolutionFlight).id='resolutionFlight';
      action('Porovnat modely',()=>{$('depth').selectedIndex=2;guide();$('dialog').showModal();});
      const motion=action('',()=>setProtonMotion(!cache.protonAnimating));
      motion.id='protonMotion';motion.hidden=true;
      setProtonMotion(!matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
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
  function play(on){
    running=on;$('play').textContent=on?'Pozastavit':'Přehrát';
    if(chapter===4)updateBohrButton();
    if(chapter===10&&on)delete cache.packetShots;
  }
  $('play').onclick=()=>{
    if(!running){
      if(chapter===3&&S.rad&&T>=P.collapseDuration)T=0;
      if(chapter===10&&T>=packetPlaybackEnd)T=0;
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
    if(chapter===10){delete cache.packetShots;delete cache.packetBaseline;}
    dirty=true;
  };
  const zoom=f=>{camera.zoom=Math.max(.45,Math.min(2.8,camera.zoom*f));dirty=true;};
  $('out').onclick=()=>zoom(1/1.15);$('in').onclick=()=>zoom(1.15);$('home').onclick=()=>{resetExperimentCamera(chapter);dirty=true;};
  function moveHydrogenRadius(canvas,event){
    const rect=canvas.getBoundingClientRect();
    if(!rect.height)return;
    const scale=hydrogenDiagramScale(canvas.clientHeight),n=S.reference+1;
    const y=(event.clientY-rect.top)*canvas.clientHeight/rect.height;
    const landed=Math.abs(y-scale.y(P.energy(n)))<=6;
    const slider=$('knob-r');
    const radius=landed?P.a*1e12*n*n:scale.radiusAt(y);
    slider.value=Math.max(Number(slider.min),Math.min(Number(slider.max),radius));
    slider.oninput();
  }
  function attachCamera(canvas,view){
    let pointer=null;
    function rotate(dx,dy){view.yaw-=dx*.006;view.pitch=Math.max(-1.5,Math.min(1.5,view.pitch+dy*.006));dirty=true;}
    canvas.onpointerdown=e=>{
      if('flat' in canvas.dataset){if(e.button!==0)return;moveHydrogenRadius(canvas,e);}
      else if(view===atomCamera)setAtomRotation(false);
      else if(chapter===6)setOrbitalRotation(false);
      pointer=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);
    };
    canvas.onpointermove=e=>{
      if(!pointer)return;
      if('flat' in canvas.dataset)moveHydrogenRadius(canvas,e);
      else{rotate(e.clientX-pointer[0],e.clientY-pointer[1]);pointer=[e.clientX,e.clientY];}
    };
    canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=()=>pointer=null;
    canvas.onkeydown=e=>{
      if('flat' in canvas.dataset)return;
      const moves={ArrowLeft:[-14,0],ArrowRight:[14,0],ArrowUp:[0,-14],ArrowDown:[0,14]};
      if(moves[e.key]){e.preventDefault();if(view===atomCamera)setAtomRotation(false);else if(chapter===6)setOrbitalRotation(false);rotate(...moves[e.key]);}
    };
  }
  function resetModelCamera(){
    Object.assign(modelCamera,initialModelCamera);
    if([3,4,5,7].includes(chapter))modelCamera.pitch=.60;
    if(chapter===8||chapter===10||chapter===11){modelCamera.yaw=0;modelCamera.pitch=0;}
  }
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
    if(atomPair===2)selectOrbitalPreset(atomState);
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
