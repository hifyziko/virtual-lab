(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const id = document.body.dataset.lesson, lesson = ConverterLessons[id];
  const p = {supply:'drive'}, colors = ['#2455a4','#b4650e','#8953a4','#087a69','#aa344b','#387745'];
  const tex = s => katex.renderToString(s,{output:'html',throwOnError:true});
  const decimal = (v,digits=2) => (Math.abs(v)<.5*10**(-digits)?0:v).toLocaleString('cs-CZ',{maximumFractionDigits:digits,useGrouping:false}).replace(',','{,}');
  const unit = s => s==='1'?'':s;
  const enabled = lesson.signals.map((_,k)=>!(id==='pwm'&&k===2));
  const signalColor=k=>({emf:'#a15b18',comparison:'#526c82'}[lesson.signals[k][3]]||colors[k%colors.length]);
  const channelName=k=>{
    const [symbol,, ,kind]=lesson.signals[k];
    if(kind==='emf')return 'Indukované napětí '+tex(symbol);
    if(kind==='comparison')return 'Proud při '+tex('u_i=0');
    return ['pwm','jednofazovy'].includes(id)?['Řídicí signál',id==='pwm'?'Pila':'Nosný signál','Spínací povel'][k]:'';
  };
  let model, start=0, end=2400, animation=0, lastState='';
  let count=2400;
  const bandCount=3;
  const gains=Array(bandCount).fill(1);
  const toolbar=document.createElement('div');toolbar.className='verticalScale';
  toolbar.innerHTML='<label>Svislé měřítko <select id="band"><option value="all">Všechny stopy</option>'+
    gains.map((_,k)=>'<option value="'+k+'">Stopa '+(k+1)+'</option>').join('')+'</select></label>'+
    '<button id="lessY" aria-label="Zmenšit svislé zvětšení">−</button><button id="moreY" aria-label="Zvětšit svislé zvětšení">+</button>'+
    '<button id="fitY">Přizpůsobit</button>';
  $('channelMenu').after(toolbar);
  $('closeChannels').onclick=()=>{$('channelMenu').open=false;};
  const rescale=factor=>{
    gains.forEach((g,k)=>{if($('band').value==='all'||Number($('band').value)===k)gains[k]=factor?Math.max(.125,Math.min(32,g*factor)):1;});plot();
  };
  $('lessY').onclick=()=>rescale(.5);$('moreY').onclick=()=>rescale(2);$('fitY').onclick=()=>rescale(0);
  $('circuitTitle').textContent=lesson.title;
  $('diagram').setAttribute('viewBox',id==='kmitocet'?'0 0 704 370':'0 0 510 370');
  $('diagram').insertAdjacentHTML('beforebegin','<div class="key" id="key"><i></i>Proudová cesta <i></i>Vodivá dioda</div>');
  $('viewLabel').hidden=!['pwm','jednofazovy','pulzni'].includes(id);
  $('bridgeView').onchange=()=>{
    p.view=$('bridgeView').value;
    $('key').classList.toggle('commands',p.view==='commands');
    $('key').innerHTML=p.view==='commands'?'<i></i>Povel zapnout <i></i>Povel vypnout':'<i></i>Proudová cesta <i></i>Vodivá dioda';
    lastState='';cursor();
  };
  $('diagram').setAttribute('aria-label',lesson.title);
  $('story').innerHTML='<h3>Základní teorie</h3><p>'+lesson.theory+'</p><p>'+tex(lesson.formula)+'</p><p>'+lesson.meaning+'</p>'+
    '<p id="loadTheory"></p>'+
    '<h3>Pokus</h3><p>'+lesson.task+'</p><h3>Podmínky pokusu</h3><p>'+lesson.assumptions+'</p>'+
    '<p><small>Václav Kůs, Elektrické pohony a výkonová elektronika, kap. '+lesson.source+'.</small></p>';
  for(const c of lesson.controls){
    const group=document.createElement('div');group.className='control';
    const parameter={resistance:'R',inductance:'L',emf:'u_i',lag:'\\varphi_i'}[c.key];
    group.innerHTML='<span>'+c.label+(parameter?' '+tex(parameter):'')+'</span>';
    const wideCarrier=id==='pwm'&&c.key==='carrier';
    // Each part of the slider covers a decade with a useful keyboard increment.
    const frequencyAt=v=>v<=2000?v:v<=3800?2000+(v-2000)*10:20000+(v-3800)*50;
    if(c.key==='load'){
      for(const [v,label] of c.items){
        const wrapper=document.createElement('label');
        wrapper.innerHTML='<input type="radio" name="load" value="'+v+'">'+tex(label);
        const radio=wrapper.firstChild;radio.checked=v===c.value;radio.onchange=()=>{p.load=v;update();};
        group.append(wrapper);
      }
      p.load=c.value;
    }else{
      const el=document.createElement(c.items?'select':'input');el.setAttribute('aria-label',c.label);el.id=c.key;
      if(c.items){
        for(const [v,label] of c.items)el.add(new Option(label,v));
        p[c.key]=c.items[0][0];
      }else{
        Object.assign(el,{type:'range',min:c.min,max:wideCarrier?5400:c.max,step:c.step,value:c.value});
        p[c.key]=c.value;
      }
      group.append(el);
      if(!c.items){const out=document.createElement('output');out.id=c.key+'Out';group.append(out);}
      el.oninput=()=>{
        p[c.key]=c.items?el.value:wideCarrier?frequencyAt(Number(el.value)):Number(el.value);update();
      };
    }
    const isLoad=(id==='tyristory'&&c.key==='angle')||c.key==='load'||['resistance','inductance','emf','lag'].includes(c.key);
    if(['pwm','pulzni','jednofazovy','stridavy','kmitocet','aktivni'].includes(id)&&c.key==='mode')$('guide').before(group);
    else (isLoad?$('loadSetup'):$('settings')).append(group);
  }
  const settings=$('settings'),topControls=[...settings.children],header=$('guide').parentElement;
  const title=header.querySelector('h1'),measure=document.createElement('canvas').getContext('2d');
  let lifted=null;
  function fitSettings(){
    if(settings.parentElement===header||['pwm','pulzni','jednofazovy','stridavy','kmitocet','aktivni'].includes(id))return;
    const style=getComputedStyle(settings),gap=parseFloat(style.columnGap)||0;
    const available=settings.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
    const widths=topControls.map(group=>group.offsetWidth);
    const required=widths.reduce((sum,w)=>sum+w,0)+gap*(widths.length-1);
    const loneTail=required>available&&required-widths.at(-1)-gap<=available;
    const candidate=loneTail?topControls.at(-1):null;
    measure.font=getComputedStyle(title).font;
    const titleWidth=measure.measureText(title.textContent).width+55;
    const buttons=[...header.children].filter(el=>el!==title&&el!==lifted);
    const room=header.clientWidth-titleWidth-buttons.reduce((sum,el)=>sum+el.offsetWidth,0)-6*(buttons.length+1);
    const next=candidate&&candidate.offsetWidth<=room?candidate:null;
    if(next===lifted)return;
    if(lifted)settings.append(lifted);
    if(next)header.insertBefore(next,$('guide'));
    lifted=next;
  }
  lesson.signals.forEach(([symbol,u],k)=>{
    const el=document.createElement('label');el.style.setProperty('--signal',signalColor(k));
    el.innerHTML='<input type="checkbox"><i></i>'+(channelName(k)||tex(symbol+(unit(u)?'\\,/\\,'+u:'')));
    el.firstChild.checked=enabled[k];
    el.firstChild.onchange=()=>{enabled[k]=el.firstChild.checked;plot();};$('signals').append(el);
  });
  const available=k=>(!lesson.signals[k][3]||p.load==='motor')&&!(id==='diody'&&p.mode==='single'&&(k===1||k===2))&&
    !(id==='jednofazovy'&&p.mode!=='pwm'&&k<2);
  function update(){
    const alternating=['jednofazovy','stridavy','kmitocet'].includes(id)||(id==='pwm'&&p.mode==='sine');
    const emfName='Indukované napětí';
    $('emf').previousElementSibling.innerHTML=emfName+' '+tex(alternating?'\\hat U_i':'U_i');
    $('emf').setAttribute('aria-label',alternating?'Amplituda indukovaného napětí':emfName);
    const limit=400;
    $('emf').min=alternating?0:-limit;$('emf').max=limit;
    if(alternating&&p.emf<0){p.emf=-p.emf;$('emf').value=p.emf;}
    p.emf=Math.max(Number($('emf').min),Math.min(limit,Math.round(p.emf/Number($('emf').step))*Number($('emf').step)));
    $('emf').value=p.emf;
    for(const c of lesson.controls.filter(c=>!c.items)){
      const inactive=(c.key==='duty'&&id==='pwm'&&p.mode!=='fixed')||
        (c.key==='depth'&&['fixed','six'].includes(p.mode))||(c.key==='carrier'&&p.mode==='six')||
        (c.key==='inductance'&&p.load==='r')||(c.key==='emf'&&p.load!=='motor')||
        (c.key==='lag'&&(p.load!=='motor'||(id==='pwm'&&p.mode==='fixed')));
      $(c.key).disabled=inactive;$(c.key+'Out').innerHTML=tex(decimal(p[c.key])+'\\,'+c.unit);
    }
    [...$('signals').children].forEach((el,k)=>{el.firstChild.disabled=!available(k);});
    const oldPosition=Number($('cursor').value);
    const timeFraction=model?timeAt(oldPosition)/model.period:oldPosition/count;
    model=ConverterModel.simulate(id,p);
    count=model.samples.length-1;
    $('cursor').max=count;
    $('cursor').value=indexAt(timeFraction*model.period);
    fitSettings();
    if(lesson.reading){
      const [symbol,u]=lesson.reading;
      const scale=ConverterModel.voltageScale(id,p.supply);
      const input=id==='pwm'||id==='jednofazovy'?['U_d',30]:id==='pulzni'?['U_1',24]:
        id==='aktivni'&&p.mode==='active'?['U_d',52]:['\\hat U_s',24];
      const sourceValue=input[0]+'='+decimal(input[1]*scale)+'\\,\\mathrm V';
      $('readings').innerHTML=tex(symbol+'='+decimal(model.result)+'\\,'+u)+'<small>'+tex(sourceValue)+'</small>';
    }
    lastState='';plot();
  }
  const label=(x,y,s,w=82)=>'<foreignObject x="'+x+'" y="'+y+'" width="'+w+'" height="24"><div class="axis">'+tex(s)+'</div></foreignObject>';
  function timeAt(n){return model.samples[n].time??model.period*n/count;}
  function indexAt(t){
    if(model.samples[0].time===undefined)return Math.max(0,Math.min(count,Math.round(t/model.period*count)));
    let lo=0,hi=count;
    while(lo<hi){
      const mid=Math.ceil((lo+hi)/2);
      if(timeAt(mid)<=t)lo=mid;else hi=mid-1;
    }
    return lo;
  }
  function position(n){return (timeAt(n)-timeAt(start))/(timeAt(end)-timeAt(start));}
  function plot(){
    // Keep the time width constant in SVG units and give the traces the full
    // measured panel height. Both axes, labels and traces retain their proportions.
    const svg=$('plot');
    const height=svg.clientWidth&&svg.clientHeight?840*svg.clientHeight/svg.clientWidth:500;
    const chartBottom=height-58, ticksY=height-45;
    svg.setAttribute('viewBox','0 0 840 '+height);
    const cycle=$('zoom').value==='cycle';
    const width=cycle?1/p.carrier:model.period/Number($('zoom').value);
    const left=Math.min(model.period-width,Math.max(0,timeAt(+$('cursor').value)-width/2));
    const pos=+$('cursor').value;
    start=Math.min(pos,left===0?0:indexAt(left));
    end=Math.max(pos,start+1,left+width>=model.period-1e-14?count:indexAt(left+width));
    const span=end-start;
    let markup='';
    const bands=bandCount, pitch=chartBottom/bands;
    for(let band=0;band<bands;band++){
      const keys=lesson.signals.map((sig,k)=>{
        return sig[2]===band&&available(k)&&enabled[k]?k:-1;
      }).filter(k=>k>=0);
      const top=23+band*pitch,height=pitch-31;
      let min=Infinity,max=-Infinity;
      for(let n=start;n<=end;n++)for(const k of keys){const v=model.samples[n].values[k];min=Math.min(min,v);max=Math.max(max,v);}
      if(!keys.length){min=0;max=1;}
      if(keys.some(k=>lesson.signals[k][1]==='1')){min=Math.min(0,min);max=Math.max(1,max);}
      const middle=(min+max)/2, radius=(max-min>1e-9?(max-min)*.5:Math.max(.05,Math.abs(middle)*.025))/gains[band];
      min=middle-radius;max=middle+radius;
      const y=v=>top+height-7-(height-14)*(v-min)/(max-min);
      markup+='<defs><clipPath id="bandClip'+band+'"><rect x="76" y="'+top+'" width="740" height="'+height+'"/></clipPath></defs>';
      markup+='<rect class="graticule" x="76" y="'+top+'" width="740" height="'+height+'" rx="4"/>';
      markup+='<foreignObject x="76" y="'+(top-23)+'" width="740" height="23"><div class="plotLegend">'+keys.map(k=>{
        const [symbol,u,,kind]=lesson.signals[k],name=kind?tex(symbol):channelName(k)||tex(symbol);
        return '<span><i style="border-top:3px '+(kind==='comparison'?'dashed':'solid')+' '+signalColor(k)+'"></i>'+name+(unit(u)?' '+tex('['+u+']'):'')+'</span>';
      }).join('')+'</div></foreignObject>';
      for(let tick=0;tick<=8;tick++){const x=76+tick*92.5;markup+='<path class="grid" d="M'+x+' '+top+'v'+height+'"/>';}
      const digits=Math.min(8,Math.max(2,Math.ceil(-Math.log10(radius))+1));
      for(const val of [min,(max+min)/2,max])markup+='<path class="grid" d="M76 '+y(val)+'h740"/>'+label(0,y(val)-11,decimal(val,digits),70);
      for(const k of keys){
        const step=(['pwm','jednofazovy'].includes(id)&&(k===2||k===3))||(id==='pulzni'&&k===0);
        const x=n=>(76+740*position(n)).toFixed(3);
        const value=n=>model.samples[n].values[k];
        let data='M'+x(start)+' '+y(value(start)).toFixed(3);
        if(step){
          for(let n=start+1;n<=end;n++){
            if(value(n)!==value(n-1))data+='H'+x(n)+'V'+y(value(n)).toFixed(3);
          }
          data+='H'+x(end);
        }else{
          // Preserve the endpoints and extrema in chronological order in every pixel column.
          const columns=Math.max(1,Math.round(svg.clientWidth*740/840*(window.devicePixelRatio||1)));
          for(let col=0;col<Math.min(columns,span);col++){
            const total=Math.min(columns,span);
            const first=start+1+Math.floor(col*span/total),last=start+Math.floor((col+1)*span/total);
            let low=first,high=first;
            for(let i=first+1;i<=last;i++){
              if(value(i)<value(low))low=i;
              if(value(i)>value(high))high=i;
            }
            for(const i of [...new Set([first,low,high,last])].sort((a,b)=>a-b))
              data+='L'+x(i)+' '+y(value(i)).toFixed(3);
          }
        }
        markup+='<path class="trace" clip-path="url(#bandClip'+band+')" stroke="'+signalColor(k)+'" '+(lesson.signals[k][3]==='comparison'?'stroke-dasharray="5 4" ':'')+'d="'+data+'"/>';
      }
    }
    const microseconds=width<.001;
    for(let k=0;k<=4;k++)markup+=label(40+185*k,ticksY,decimal((timeAt(start)+(timeAt(end)-timeAt(start))*k/4)*(microseconds?1e6:1000)),72);
    svg.innerHTML=markup+label(709,height-24,microseconds?'t\\,/\\,\\mu\\mathrm{s}':'t\\,/\\,\\mathrm{ms}',110)+'<path id="marker" class="marker" d="M0 8V'+(chartBottom-7)+'"/>';
    cursor();
  }
  let diagramLayout='';
  function cursor(){
    const pos=+$('cursor').value;
    if(pos<start||pos>end){plot();return;}
    $('marker').setAttribute('transform','translate('+(76+740*position(pos))+' 0)');
    const st=model.samples[pos].state, key=st.join(',');
    if(key!==lastState){
      const diagram=$('diagram');
      diagram.innerHTML=ConverterDiagram.draw(id,st,p);lastState=key;
      const layout=p.mode+'-'+p.load;
      if(layout!==diagramLayout){
        // Include the node labels (SVG foreignObjects) in the drawing bounds.
        // Holding the frame across switching states keeps the circuit stationary.
        const box=diagram.getBBox(),padding=22;
        if(box.width&&box.height){
          diagram.setAttribute('viewBox',[box.x-padding,box.y-padding,box.width+2*padding,box.height+2*padding].join(' '));
          diagramLayout=layout;
        }
      }
    }
  }
  function stop(){cancelAnimationFrame(animation);animation=0;$('play').textContent='Spustit';}
  $('cursor').oninput=cursor;$('zoom').onchange=plot;
  $('plot').onclick=e=>{
    const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform($('plot').getScreenCTM().inverse());
    $('cursor').value=indexAt(timeAt(start)+Math.min(1,Math.max(0,(pt.x-76)/740))*(timeAt(end)-timeAt(start)));cursor();
  };
  function slowdown(){
    const v=Number($('slow').value);
    if(id!=='pwm'||v<=10)return v;
    return v<=19?(v-9)*10:(v-18)*100;
  }
  if(id==='pwm'){
    const updateSlowdown=()=>{
      const text=slowdown().toLocaleString('cs-CZ')+'×';
      $('slowFactor').textContent=text;
      $('slow').setAttribute('aria-valuetext',text);
    };
    $('slow').oninput=updateSlowdown;
    updateSlowdown();
  }
  $('play').onclick=()=>{
    if(animation){stop();return;}
    let prev=performance.now(),time=timeAt(+$('cursor').value);
    function frame(now){
      const duration=$('zoom').value==='cycle'?1/p.carrier:model.period;
      time=(time+Math.min(100,now-prev)*duration*.55/(2400*slowdown()))%model.period;
      prev=now;
      $('cursor').value=indexAt(time);cursor();animation=requestAnimationFrame(frame);
    }
    $('play').textContent='Pozastavit';animation=requestAnimationFrame(frame);
  };
  $('guide').onclick=()=>{
    stop();
    const loadTheory={
      r:'U odporové zátěže má proud stejný průběh jako napětí na zátěži. '+tex('i=u/R')+'.',
      rl:'U zátěže s odporem a indukčností se část energie akumuluje v indukčnosti. Po změně napětí může proud dále téci původním směrem.',
      motor:'U motorické zátěže představuje zdroj '+tex('u_i')+' vnitřní indukované napětí stroje. Napětí na svorkách zátěže je součtem indukovaného napětí, úbytku napětí na odporu a napětí na indukčnosti. '+tex('u=Ri+L\\,\\mathrm di/\\mathrm dt+u_i')+'.'
    };
    $('loadTheory').innerHTML=loadTheory[p.load]+' <small>(Kůs, kap. 4.1 a 6.2–6.3.1.)</small>';
    document.querySelector('dialog').showModal();
  };
  update();
  const sizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(()=>plot()):null;
  sizeObserver?.observe($('plot'));
  const headerObserver=typeof ResizeObserver==='function'?new ResizeObserver(fitSettings):null;
  headerObserver?.observe(header);
  document.fonts?.ready.then(fitSettings);
  window.HiFyzikoFusionDispose=()=>{stop();sizeObserver?.disconnect();headerObserver?.disconnect();};
})();
