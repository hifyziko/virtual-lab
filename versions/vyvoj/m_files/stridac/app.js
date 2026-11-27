(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const colors = ['#1266a0','#a34f22','#764784'], green = '#117a63', grey = '#91a4ab';
  const tex = s => katex.renderToString(s,{output:'html',throwOnError:true});
  const num = (x,d=0) => x.toFixed(d).replace('.', '{,}');
  const line = (x,y,X,Y,color='#536c75',w=2) => '<path d="M'+x+' '+y+'L'+X+' '+Y+'" fill="none" stroke="'+color+'" stroke-width="'+w+'"/>';
  const path = (d,color,w=2,fill='none') => '<path d="'+d+'" stroke="'+color+'" stroke-width="'+w+'" fill="'+fill+'" stroke-linejoin="round"/>';
  const dot = (x,y,r=3,color='#425e67') => '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+color+'"/>';
  const math = (x,y,s,width=68,color='#284651') => '<foreignObject x="'+(x-width/2)+'" y="'+(y-13)+'" width="'+width+'" height="26"><div xmlns="http://www.w3.org/1999/xhtml" class="math" style="color:'+color+'">'+tex(s)+'</div></foreignObject>';
  const label = (x,y,s) => '<text x="'+x+'" y="'+y+'" fill="#49626a" font-size="14" font-weight="600">'+s+'</text>';
  let p, model, probe='load', span=1, x=.02, start=0, frame=0, playing=false, last=0;
  let duty=.5, depth=.8, pulseZoom=false, autoCurrentMax=2;
  document.querySelectorAll('[data-tex]').forEach(el => el.innerHTML=tex(el.dataset.tex));

  const legX=[139,287,435], railY=[38,270], off='#a5b3b8';
  const activeWire='#13796d', diodeInk='#b36916';
  function flowGroup(id,body){return '<g class="flow" id="'+id+'">'+body+'</g>';}
  const trace=d=>'<path class="trace" d="'+d+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
  function circuit(){
    // Backgrounds group components independently of their switching state.
    let s='';
    s+='<g aria-hidden="true" pointer-events="none">';
    for(const a of legX){
      s+='<rect x="'+(a-58)+'" y="51" width="128" height="203" rx="8" fill="#f3f7f8" stroke="#dae4e6"/>';
    }
    s+='</g>';
    let foreground='';
    const deviceNums=[[1,3,5],[4,6,2]];
    for(let j=0;j<2;j++){
      const y=railY[j],cy=j?211:97;
      let bus='';
      for(let k=0;k<3;k++){
        const left=k?legX[k-1]:40;
        bus+=flowGroup('rail'+j+k,trace('M'+left+' '+y+'H'+legX[k]));
      }
      s+=bus;
      const from=j?154:38,to=j?270:154;
      s+=flowGroup('source'+j,trace('M40 '+from+'V'+(cy-17)+'M40 '+(cy+17)+'V'+to)+
        '<circle cx="40" cy="'+cy+'" r="17" stroke="currentColor" stroke-width="2" fill="white"/>'+
        trace('M35 '+(cy-6)+'h10m-5 -5v10M35 '+(cy+8)+'h10'));
      s+=math(73,cy+10,'U_d/2',58);
    }
    s+=dot(40,154)+math(19,154,'O',30);
    for(let k=0;k<3;k++){
      const a=legX[k],b=a+64;
      for(let j=0;j<2;j++){
        const top=j?154:38,y=top+58,n=deviceNums[j][k];
        s+=flowGroup('leads'+k+j,trace('M'+a+' '+top+'v29m0 58v29'));
        const transistor=trace('M0 -29v12l-10 6m0 -8v38m0 -9l10 7v12')+
          '<path d="M-1 16l-7 -1 4 -5z" fill="currentColor"/>';
        const diode=trace('M0 -29h26v23m0 15v20H0M19 -6h14')+
          '<path d="M19 9h14l-7 -15z" fill="white" stroke="currentColor" stroke-width="2"/>';
        const gate=trace('M-15 -11v22m-11 -11h11');
        const placement='<g transform="translate('+a+' '+y+')">';
        s+=placement+'<g color="'+off+'">'+transistor+gate+'</g>'+flowGroup('di'+k+j,diode)+'</g>';
        foreground+=placement+flowGroup('tr'+k+j,transistor)+flowGroup('gate'+k+j,gate)+'</g>';
        s+=math(a-35,y+21,'V_'+n,44)+math(a+49,y+2,'V_{\\mathrm R'+n+'}',44);
        s+=dot(a,railY[j],2.8);
      }
      const crossing=k===2?'v20':'v4q10 6 0 12v4';
      let load=trace('M'+a+' 154H'+b+'V260'+crossing+'v32');
      load+='<rect x="'+(b-7)+'" y="312" width="14" height="32" fill="white" stroke="currentColor" stroke-width="2"/>';
      if(k===0)s+=math(b-26,328,'R',28);
      if(p.loadType==='r')load+=trace('M'+b+' 344V449');
      else{
        load+=trace('M'+b+' 344v13'+('q16 4.5 0 9').repeat(4));
        if(k===0)s+=math(b-25,376,'L',28);
        if(p.loadType==='motor'){
          load+=trace('M'+b+' 393v8m0 28v20')+
            '<circle cx="'+b+'" cy="415" r="14" stroke="currentColor" stroke-width="2" fill="white"/>'+
            trace('M'+(b-8)+' 415q4 -10 8 0t8 0');
          s+=math(b-28,415,'u_{i'+(k+1)+'}',44)+math(b+22,403,'+',20);
        }else load+=trace('M'+b+' 393V449');
      }
      s+=flowGroup('load'+k,load)+dot(a,154,3.6)+math(b+16,152,String(k+1),23,colors[k]);
      s+='<g id="direction'+k+'" transform="translate('+b+' 297)"><path d="M-5 -5L0 5L5 -5Z" fill="'+activeWire+'"/></g>';
      if(k<2)s+=flowGroup('star'+k,trace('M'+b+' 449h148'));
    }
    s+=dot(351,449)+math(351,465,'N');
    s+='<circle id="probeRing" r="8" fill="none" stroke="#285984" stroke-width="2"/>';
    $('circuit').innerHTML=s+'<g class="transistorHighlights" pointer-events="none" aria-hidden="true">'+foreground+'</g>';
  }
  function showConduction(q,currents){
    const mark=(id,color)=>$(id).setAttribute('color',color);
    for(let k=0;k<3;k++){
      const i=currents[k],device=Inverter.conductingDevice(q.bits[k],i);
      const b=legX[k]+64;
      $('direction'+k).setAttribute('transform','translate('+b+' 297) scale('+(device==='off'?0:1)+' '+(i<0?-1:1)+')');
      mark('load'+k,device==='off'?off:activeWire);
      if(k<2)mark('star'+k,Math.abs(currents.slice(0,k+1).reduce((a,v)=>a+v,0))>1e-9?activeWire:off);
      for(let j=0;j<2;j++){
        const selected=q.bits[k]===1-j;
        $('tr'+k+j).dataset.command=selected?'on':'off';
        mark('gate'+k+j,selected?'#4169a0':off);
        mark('leads'+k+j,selected && device!=='off'?activeWire:off);
        mark('tr'+k+j,selected && device==='transistor'?activeWire:off);
        mark('di'+k+j,selected && device==='diode'?diodeInk:off);
        let railCurrent=0;
        for(let m=k;m<3;m++)if(q.bits[m]===1-j)railCurrent+=currents[m];
        const ink=Math.abs(railCurrent)>1e-9?activeWire:off;
        mark('rail'+j+k,ink);
        if(!k)mark('source'+j,ink);
      }
    }
  }
  const X=t=>77+(t-start)/span*692;
  const channelRows=[
    ['upper','Povel horního tranzistoru'],['lower','Povel dolního tranzistoru'],
    ['ref','Modulační reference'],['carrier','Trojúhelníková nosná'],
    ['primary','Napětí sond'],['other','Druhá reference napětí'],
    ['line','Sdružené napětí'],['emf','Indukované napětí'],['current','Fázový proud']
  ];
  const phaseIds=[0,1,2];
  const selections=new Map();
  function channelSymbol(type,k){
    const n=k+1;
    switch(type){
      case 'upper':return 's_{'+n+'+}';
      case 'lower':return 's_{'+n+'-}';
      case 'ref':return 'r_'+n;
      case 'carrier':return 'c';
      case 'line':return 'u_{'+n+((k+1)%3+1)+'}';
      case 'emf':return 'u_{i'+n+'}';
      case 'current':return 'i_'+n;
      default:return 'u_{'+n+((type==='primary')===(probe==='load')?'N':'O')+'}';
    }
  }
  function available(type,k){
    if(type==='carrier')return k===0 && p.mode!=='six';
    if(type==='ref')return p.mode==='pwm' || p.mode==='bench' && k===0;
    return type!=='emf' || p.loadType==='motor';
  }
  function selection(){
    if(!selections.has(p.mode)){
      const defaults=['primary0','primary1','primary2','current0','emf0'];
      defaults.push(...(p.mode==='six'?['upper0']:['ref0','carrier0']));
      selections.set(p.mode,new Set(defaults));
    }
    return selections.get(p.mode);
  }
  function channelMenu(){
    const selected=selection();
    $('channelList').innerHTML=channelRows.map(([type,title])=>{
      const cells=(type==='carrier'?[0]:phaseIds).map(k=>{
        const key=type+k;
        return '<label><input type="checkbox" data-channel="'+key+'" '+(available(type,k)?'':'disabled ')+(selected.has(key)?'checked':'')+' aria-label="'+title+(type==='carrier'?'':' '+(k+1))+'">'+tex(channelSymbol(type,k))+'</label>';
      }).join('');
      return '<div class="channelRow"><span>'+title+'</span>'+cells+'</div>';
    }).join('');
  }
  function closeChannels(){
    $('channels').open=false;
    $('channels').querySelector('summary').focus();
  }
  $('closeChannels').onclick=closeChannels;
  $('channels').onkeydown=e=>{if(e.key==='Escape')closeChannels();};
  $('channelList').onchange=e=>{
    const key=e.target.dataset.channel;
    if(!key)return;
    if(e.target.checked)selection().add(key);else selection().delete(key);
    plot(true);show();
  };
  function plot(keepWindow=false){
    if(!keepWindow)start=Math.max(0,Math.min(1-span,x-span/2));
    const end=start+span,segments=model.segments.filter(q=>q.end>start && q.start<end);
    const enabled=(type,k)=>available(type,k) && selection().has(type+k);
    const rows=[];
    function addRow(title,types,phases,min,max,unit){
      const signals=[];
      for(const type of types)for(const k of phases)if(enabled(type,k))signals.push({type,k});
      if(signals.length)rows.push({title,signals,min,max,unit});
    }
    addRow('Spínací povely',['upper','lower'],phaseIds,0,1,'');
    addRow('Modulační reference a nosná',['carrier','ref'],phaseIds,-1,1,'');
    for(const k of phaseIds)addRow('Napětí · fáze '+(k+1),['primary','other','line','emf'],[k],-1,1,'\\mathrm V');
    const limit=$('currentScale').value==='fixed'?Math.ceil(35/p.resistance):autoCurrentMax;
    addRow('Fázové proudy',['current'],phaseIds,-limit,limit,'\\mathrm A');
    const lineRange=phaseIds.some(k=>enabled('line',k))?Inverter.dc:2*Inverter.dc/3;
    let body='',captions='';
    const rowHeight=520/Math.max(rows.length,1);
    function samples(times,value,Y){
      return times.map((t,i)=>(i?'L':'M')+X(t).toFixed(2)+' '+Y(value(t)).toFixed(2)).join('');
    }
    const styles={other:'6 3',line:'8 3 2 3',emf:'3 3',lower:'5 3'};
    for(const [idx,row] of rows.entries()){
      const {signals,unit}=row;
      const min=unit==='\\mathrm V'?-lineRange:row.min,max=unit==='\\mathrm V'?lineRange:row.max;
      const top=idx*rowHeight+26,bottom=(idx+1)*rowHeight-5;
      const Y=v=>bottom-6-(v-min)/(max-min)*(bottom-top-12);
      body+='<rect x="77" y="'+top+'" width="692" height="'+(bottom-top)+'" rx="3" fill="#f7fafb" stroke="#e0e8e9"/>';
      for(let j=0;j<=16;j++)body+=line(77+692*j/16,top,77+692*j/16,bottom,j%4?'#e8edef':'#d4dfe0',.8);
      for(let j=0;j<=4;j++){
        const yy=Y(min+(max-min)*j/4);
        body+=line(77,yy,769,yy,'#e2eaeb',.8);
      }
      body+=line(77,Y(0),769,Y(0),'#b4c7c9',1);
      captions+=label(7,top-9,row.title)+math(48,Y(max),String(max).replace('.','{,}'),54)+math(48,Y(min),String(min).replace('.','{,}'),54);
      if(unit)captions+=math(34,(top+bottom)/2,unit,50);
      for(const [j,{type,k}] of signals.entries()){
        const color=type==='carrier'?grey:type==='emf'?'#41565a':type==='current'?[green,colors[1],colors[2]][k]:colors[k];
        const dash=styles[type],wrap=d=>'<g'+(dash?' stroke-dasharray="'+dash+'"':'')+'>'+path(d,color,type==='carrier'?1.4:2)+'</g>';
        const lx=765-(signals.length-j)*75;
        body+=wrap('M'+lx+' '+(top-12)+'h16');
        captions+=math(lx+41,top-12,channelSymbol(type,k),52,color);
        let d='';
        if(type==='ref'||type==='emf'||type==='carrier'){
          const ts=[start];
          if(type==='carrier'){
            const r=p.switching/p.frequency;
            for(let h=Math.floor(start*r*2)+1;h<end*r*2;h++)ts.push(h/(r*2));
          }else for(let h=1;h<240;h++)ts.push(start+span*h/240);
          ts.push(end);
          const signal=t=>type==='carrier'?Inverter.triangle(t*p.switching/p.frequency):type==='ref'?Inverter.reference(t,k,p):model.emf(t,k);
          d=samples(ts,signal,Y);
        }else{
          for(const q of segments){
            const a=Math.max(start,q.start),b=Math.min(end,q.end);
            if(type==='current'){
              const count=Math.max(1,Math.ceil((b-a)*220/span));
              for(let h=0;h<=count;h++){
                const t=a+(b-a)*h/count;
                d+=(d?'L':'M')+X(t).toFixed(2)+' '+Y(model.current(q,t,k)).toFixed(2);
              }
            }else{
              let v;
              if(type==='upper')v=q.bits[k];
              else if(type==='lower')v=1-q.bits[k];
              else if(type==='line')v=q.pole[k]-q.pole[(k+1)%3];
              else v=q[type==='primary'?probe:(probe==='load'?'pole':'load')][k];
              d+=d?'V'+Y(v).toFixed(2):'M'+X(a)+' '+Y(v).toFixed(2);
              d+='H'+X(b).toFixed(2);
            }
          }
        }
        body+=wrap(d);
      }
    }
    for(let j=0;j<=4;j++)captions+=math(77+j*173,542,num((start+span*j/4)*1000/p.frequency,2),74);
    captions+=math(730,567,'t\\,/\\,\\mathrm{ms}',102);
    if(!rows.length)captions+=label(250,250,'Vyberte měřenou veličinu v nabídce Kanály.');
    $('graph').innerHTML=body+'<g id="marker"><path d="M0 23V520" stroke="#354e57" stroke-dasharray="4 4"/><path d="M-5 20H5L0 27Z" fill="#354e57"/></g><g class="scopeCaptions" pointer-events="none">'+captions+'</g>';
  }
  let previousState='';
  function show(redraw=false) {
    if(redraw || x<start || x>=start+span && start+span<1-1e-10)plot();
    const q=model.at(x);
    const currents=[0,1,2].map(k=>model.current(q,x,k));
    showConduction(q,currents);
    const key=q.bits.join('')+probe;
    if(previousState!==key){
      previousState=key;
      $('probeRing').setAttribute('transform',probe==='pole'?'translate(40 154)':'translate(351 449)');
      $('readouts').innerHTML=q[probe].map((v,k)=>'<span style="color:'+colors[k]+'">'+tex('u_{'+(k+1)+(probe==='load'?'N':'O')+'}='+v+'\\,\\mathrm V')+'<small id="iRead'+k+'"></small></span>').join('');
    }
    currents.forEach((i,k)=>{
      const el=$('iRead'+k);
      const value=num(Math.abs(i)<.005?0:i,2);
      if(el.dataset.value!==value){
        el.dataset.value=value;
        el.innerHTML=tex('i_'+(k+1)+'='+value+'\\,\\mathrm A');
      }
    });
    $('marker').setAttribute('transform','translate('+X(x)+' 0)');
    $('time').innerHTML=tex(num(x*1000/p.frequency,2)+'\\,\\mathrm{ms}');
    $('cursor').value=Math.round(x*10000);
  }
  function rebuild() {
    const mode=$('mode').value;
    for(const id of ['depth','fsSlider','switching','pulses'])$(id).disabled=mode==='six';
    $('frequency').parentElement.firstChild.textContent=mode==='bench'?'Časová základna ':'Výstupní frekvence ';
    $('depthName').textContent=mode==='bench'?'Střída':'Hloubka modulace';
    const value=mode==='bench'?duty:depth;
    $('depth').value=Math.round(value*100);
    $('depthOut').innerHTML=tex(num(value*100)+'\\,\\%');
    const loadType=document.querySelector('input[name=loadType]:checked').value;
    $('inductance').disabled=loadType==='r';
    for(const id of ['emf','lag'])$(id).disabled=loadType!=='motor';

    if(mode==='six' && pulseZoom){span=1;pulseZoom=false;}
    function valueOf(id,previous){
      const field=$(id);
      return field.value && field.validity.valid ? Number(field.value) : previous;
    }
    p={mode,frequency:+$('frequency').value,switching:valueOf('switching',p?.switching ?? 1200),depth,duty,
       loadType,resistance:valueOf('resistance',p?.resistance ?? 10),
       inductance:valueOf('inductance',(p?.inductance ?? .01)*1000)/1000,
       emf:valueOf('emf',p?.emf ?? 8),lag:valueOf('lag',p?.lag ?? 20)};
    model=Inverter.build(p);
    let peak=0;
    for(const s of model.segments){
      for(let j=0;j<=8;j++){
        const t=s.start+(s.end-s.start)*j/8;
        for(const k of phaseIds)peak=Math.max(peak,Math.abs(model.current(s,t,k)));
      }
    }
    const tick=10**Math.floor(Math.log10(Math.max(.001,peak)))/2;
    autoCurrentMax=Number((Math.max(1,Math.ceil(peak/tick))*tick).toPrecision(4));
    if(pulseZoom)span=Math.min(1,2*p.frequency/p.switching);
    previousState='';circuit();channelMenu();updateZoom();show(true);
  }
  function stop(){playing=false;cancelAnimationFrame(frame);$('play').textContent='Přehrát';$('play').classList.remove('playing');}
  function tick(now){
    if(!playing)return;
    if(last)x=(x+Math.min(now-last,80)*p.frequency/(1000*Number($('slowdown').value)))%1;
    last=now;show();frame=requestAnimationFrame(tick);
  }
  $('play').onclick=()=>{if(playing){stop();return;}playing=true;last=0;$('play').textContent='Pozastavit';$('play').classList.add('playing');frame=requestAnimationFrame(tick);};
  function updateSlowdown(){
    $('slowdownValue').innerHTML=tex($('slowdown').value+'\\times');
  }
  $('slowdown').oninput=updateSlowdown;
  updateSlowdown();
  $('cursor').oninput=()=>{stop();x=Math.min(+$('cursor').value/10000,1-1e-10);show();};
  $('graph').onpointerdown=e=>{
    const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform($('graph').getScreenCTM().inverse());
    if(pt.x<77||pt.x>769)return;
    stop();x=Math.min(1-1e-10,start+span*(pt.x-77)/692);show();
  };
  for(const id of ['mode','frequency'])$(id).onchange=rebuild;
  for(const input of document.querySelectorAll('input[name=loadType]'))input.onchange=rebuild;
  for(const id of ['resistance','inductance','emf','lag','switching']){
    const field=$(id);
    field.oninput=()=>{
      if(!field.value || !field.validity.valid)return;
      if(id==='switching')$('fsSlider').value=field.value;
      rebuild();
    };
    field.onchange=()=>{
      if(!field.validity.valid || !field.value){
        field.value=String(id==='inductance'?Math.round(p.inductance*1000):p[id]);
      }
    };
  }
  $('fsSlider').oninput=()=>{$('switching').value=$('fsSlider').value;rebuild();};
  $('depth').oninput=()=>{if(p.mode==='bench')duty=+$('depth').value/100;else depth=+$('depth').value/100;rebuild();};
  function updateZoom(){
    $('zoomValue').innerHTML=tex(num(1/span,Number.isInteger(1/span)?0:1)+'\\times');
    $('zoomIn').disabled=span<=1/128;
    $('zoomOut').disabled=span>=1;
  }
  function zoom(width,byCarrier=false){
    pulseZoom=byCarrier;span=Math.max(1/128,Math.min(1,width));updateZoom();show(true);
  }
  $('bridgeView').onchange=()=>{$('bridge').dataset.view=$('bridgeView').value;};
  $('currentScale').onchange=()=>show(true);
  $('zoomIn').onclick=()=>zoom(span/2);
  $('zoomOut').onclick=()=>zoom(span*2);
  $('whole').onclick=()=>zoom(1);
  $('pulses').onclick=()=>zoom(2*p.frequency/p.switching,true);
  for(const button of document.querySelectorAll('#probes button'))button.onclick=()=>{
    for(const sibling of button.parentElement.children)sibling.setAttribute('aria-pressed',sibling===button);
    probe=button.dataset.probe;channelMenu();
    show(true);
  };
  $('help').onclick=()=>{const resume=playing;stop();$('guide').showModal();$('guide').onclose=()=>{if(resume)$('play').click();};};
  window.HiFyzikoFusionDispose=stop;
  rebuild();
})();
