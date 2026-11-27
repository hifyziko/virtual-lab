/* IEC-style symbols. Coordinates at the ends of every symbol are its terminals.
   Arrows use conventional current, referred to the direction of each branch. */
const ConverterDiagram=(()=>{
  const ink='#344e59', idle='#96a7ad', flow='#13796d', diode='#b36916', command='#1266a0';
  const cache=new Map();
  let commandView=false,front='';
  const math=(x,y,v,w=64)=>{
    if(!cache.has(v))cache.set(v,katex.renderToString(v,{output:'html',throwOnError:true}));
    return '<foreignObject x="'+(x-w/2)+'" y="'+(y-13)+'" width="'+w+'" height="28"><div class="eq">'+cache.get(v)+'</div></foreignObject>';
  };
  const line=(d,color=ink,width=2.4)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"/>';
  const move=(x,y,a,s)=>'<g transform="translate('+x+' '+y+') rotate('+a+')">'+s+'</g>';
  const dot=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="'+ink+'"/>';
  const route=(d,sign)=>line(d,sign&&!commandView?flow:idle,sign&&!commandView?3:2.1);
  const arrow=(x,y,a,sign)=>sign&&!commandView?move(x,y,a+(sign<0?180:0),'<path d="M-6 -5L6 0 -6 5Z" fill="'+flow+'"/>'):'';
  function part(x,y,a,type,sign){
    const c=sign&&!commandView?flow:ink;
    let s;
    if(type==='R')s='<rect x="-15" y="-5.5" width="30" height="11" fill="white" stroke="'+c+'" stroke-width="2.4"/>';
    if(type==='L')s=line('M-15 0'+('a5 5 0 0 1 10 0').repeat(3),c);
    if(type==='C')s=line('M-15 0H-3M-3 -12V12M3 -12V12M3 0H15',c);
    if(type==='ac'||type==='dc'){
      s='<circle r="15" fill="white" stroke="'+c+'" stroke-width="2.4"/>'+
        (type==='ac'?line('M-10 0q5 -13 10 0t10 0',ink,1.8):
          line('M-11 0h7m-3.5 -3.5v7 M6 -3.5v7',ink,1.7));
      // Local positive pole is at the left-hand terminal.
    }
    return move(x,y,a,s);
  }
  const firstLoadCenter=p=>72-(p.load==='motor'?43:p.load==='r'?0:21.5);
  const loadArrowY=(railY,loadY,p)=>(railY+loadY+firstLoadCenter(p)-15)/2;
  function load(x,y,a,p,sign,ac=false,labels=true){
    // The branch always spans 144 units. Positive current enters its first end.
    const elements=p.load==='motor'?['R','L',ac?'ac':'dc']:p.load==='r'?['R']:['R','L'];
    let s='',last=0;
    elements.forEach((type,k)=>{
      const center=firstLoadCenter(p)+k*43;
      s+=route('M'+last+' 0H'+(center-15),sign)+part(center,0,0,type,sign);last=center+15;
    });
    s+=route('M'+last+' 0H144',sign);
    let out=move(x,y,a,s);
    if(labels)elements.forEach((type,k)=>{
      const d=firstLoadCenter(p)+k*43,vertical=a===90;
      out+=math(x+(vertical?30:d),y+(vertical?d:-22),type==='dc'||type==='ac'?'u_i':type,40);
    });
    return out;
  }
  function valve(x,y,a,type,conducts,gate=false){
    const color=conducts&&!commandView?(type==='D'?diode:flow):idle;
    let s;
    if(type==='T'){
      // Local anode on left, cathode bar on right; control lead enters on cathode side.
      s=line('M-21 0H-8 M8 0H21',color)+'<path d="M-8 -9V9L8 0Z" fill="white" stroke="'+color+'" stroke-width="2.5"/>'+
        line('M8 -10V10',color,2.8)+line('M8 4l10 11h8',gate?command:ink,2.3);
    }else if(type==='D'){
      s=line('M-21 0H-8 M8 0H21',color)+'<path d="M-8 -8V8L8 0Z" fill="white" stroke="'+color+'" stroke-width="2.4"/>'+line('M8 -9V9',color);
    }else{
      // Same symbol geometry and foreground order as the three-phase inverter.
      const placement='<g transform="translate('+x+' '+y+') rotate('+(a-90)+') scale('+21/29+')">';
      const transistor=c=>line('M0 -29v12l-10 6m0 -8v38m0 -9l10 7v12',c,3)+
        '<path d="M-1 16l-7 -1 4 -5z" fill="'+c+'"/>';
      const gatePath='M-15 -11v22m-11 -11h11';
      front+=placement+transistor(commandView?(gate?command:idle):color)+line(gatePath,gate?command:idle,3)+'</g>';
      return placement+transistor(idle)+line(gatePath,idle,3)+'</g>';
    }
    return move(x,y,a,s);
  }
  function leg(x,mid,upper,lower,transistors=false,gate=null){
    let s='';
    for(const [top,y,sign] of [[true,82,upper],[false,286,lower]]){
      const y0=top?38:mid,y1=top?mid:334;
      s+=route('M'+x+' '+y0+'V'+(y-21)+' M'+x+' '+(y+21)+'V'+y1,sign);
      if(transistors){
        s+=route('M'+x+' '+(y-28)+'h27v7 M'+(x+27)+' '+(y+21)+'v7h-27',sign<0);
        const conducting=Inverter.conductingDevice(1,sign);
        s+=valve(x+27,y,-90,'D',conducting==='diode')+valve(x,y,90,'Q',conducting==='transistor',gate!==null&&(top?gate:!gate));
      }else s+=valve(x,y,-90,'D',!!sign);
    }
    return s+dot(x,mid);
  }
  function dcSource(x,sign,label='U_d'){
    return route('M'+x+' 38V171 M'+x+' 201V334',sign)+part(x,186,90,'dc',sign)+math(x+31,186,label)+arrow(x,112,-90,sign);
  }
  function inverter(half,st,p){
    const [g,i]=st, a=half?235:125,b=385;
    let s=dcSource(48,half?g*i:(g?i:-i));
    const sourceI=half?g*i:(g?i:-i);
    s+=route('M48 38H'+a+' M48 334H'+a,sourceI);
    s+=leg(a,182,g?i:0,g?0:-i,true,g);
    if(half){
      s+=route('M235 182H341V186 M341 330V334H235',i)+load(341,186,90,p,i,p.mode!=='fixed')+arrow((235+341)/2,182,0,i);
      // Complementary gate drive is drawn separately from the power conductors.
      s+=line('M110 60v44l38 -22Z',ink,2)+line('M90 72h20 M90 92h20 M148 82h68.2 M168 82V286h16',command,1.6)+
        line('M115 71h6m-3 -3v6 M115 93h6',ink,1.3)+math(76,70,'u_r',32)+math(73,101,'u_{\\text{pila}}',54)+
        line('M184 279v14l12 -7Z',command,1.7)+'<circle cx="199" cy="286" r="3" fill="white" stroke="'+command+'" stroke-width="1.5"/>'+line('M202 286h14.2',command,1.6)+dot(168,82);
    }else{
      s+=route('M125 38H385',!g&&i)+route('M125 334H385',g&&i)+leg(b,182,g?0:-i,g?i:0,true,!g);
      s+=route('M125 182H183 M327 182H385',i)+load(183,182,0,p,i,true)+arrow(153,182,0,i);
    }
    return s;
  }
  function gridSource(k,y,to,sign,reactor=false){
    let s=route('M24 '+y+'H65 M95 '+y+'H'+(reactor?113:to),sign)+part(80,y,0,'ac',sign)+math(80,y-24,['u_a','u_b','u_c'][k],42);
    if(reactor)s+=part(128,y,0,'L',sign)+route('M143 '+y+'H'+to,sign);
    return s+arrow(reactor?155:114,y,0,sign);
  }
  function rectifier(id,st,p){
    const midpoint=id==='tyristory'||p.mode==='star',single=p.mode==='single',active=id==='aktivni'&&p.mode==='active';
    const ys=single?[142,222]:[128,189,250],xs=single?[178,287]:[184,261,338];
    const end=id==='aktivni'?506:448;
    const [hi,lo]=st,signs=active?st.slice(0,3):ys.map((_,k)=>Number(hi===k)-(midpoint?0:Number(lo===k)));
    const dc=active?st[3]:Number(hi>=0);
    let s='';
    if(single){
      s+=route('M46 142V167 M46 197V222',dc)+part(46,182,90,'ac',dc)+math(77,182,'u_s');
      ys.forEach((y,k)=>{s+=route('M46 '+y+'H'+xs[k],signs[k])+arrow(110,y,0,signs[k]);});
    }else{
      // A separate branch of the star-connected source is drawn for each phase.
      for(let k=0;k<2;k++)s+=route('M24 '+ys[k]+'V'+ys[k+1],signs.slice(0,k+1).reduce((a,b)=>a+b,0));
      ys.forEach((y,k)=>{s+=gridSource(k,y,midpoint?162:xs[k],signs[k],active);});
      s+=dot(24,189)+math(12,189,'N',20);
    }
    if(midpoint){
      for(let k=0;k<3;k++){
        const y=ys[k];s+=valve(183,y,0,id==='tyristory'?'T':'D',hi===k)+route('M204 '+y+'H268',signs[k]);
        if(k<2)s+=route('M268 '+y+'V'+ys[k+1],hi>k);
      }
      if(id==='tyristory')s+=math(164,107,'A',20)+math(204,107,'K',20)+math(214,156,'G',20);
      s+=dot(268,189)+route('M268 128V70H400V117 M400 261V308H24V250',dc)+load(400,117,90,p,dc)+arrow(400,loadArrowY(70,117,p),90,dc);
      return s;
    }
    ys.forEach((y,k)=>{
      const upper=!active&&hi===k,lower=!active&&lo===k;
      s+=leg(xs[k],y,upper,lower,active);
      const next=xs[k+1]??end;
      s+=route('M'+xs[k]+' 38H'+next,active?k===xs.length-1&&dc:hi>=0&&hi<=k)+route('M'+xs[k]+' 334H'+next,active?k===xs.length-1&&dc:lo>=0&&lo<=k);
    });
    if(active){
      s+=line('M427 38V171 M427 201V334')+part(427,186,90,'C',0)+dot(427,38)+dot(427,334);
    }
    return s+route('M'+end+' 38V114 M'+end+' 258V334',dc)+load(end,114,90,p,dc)+arrow(end,loadArrowY(38,114,p),90,dc);
  }
  function chopper(st,p){
    const [on,il,ic,i]=st,boost=p.mode==='boost',input=boost?il:on*il,output=boost&&on?0:il;
    let s=dcSource(48,input,'U_1')+route('M48 38H98',input)+route('M48 334H222',input);
    if(boost){
      s+=part(113,38,0,'L',il)+route('M128 38H222',il)+route('M222 38H267 M309 38H370',output)+valve(288,38,0,'D',!!output);
      s+=route('M222 38V159 M222 201V334',on*il)+valve(222,180,90,'Q',on&&il,on);
    }else{
      s+=route('M98 38H114 M156 38H222',input)+valve(135,38,0,'Q',on&&il,on);
      s+=route('M222 38V159 M222 201V334',!on&&il)+valve(222,180,-90,'D',!on&&il);
      s+=route('M222 38H267 M297 38H370',il)+part(282,38,0,'L',il);
    }
    s+=math(boost?113:282,16,'L_d')+dot(222,38)+dot(222,334)+arrow(70,38,0,input);
    s+=route('M222 334H370',output)+route('M370 38V171 M370 201V334',ic)+part(370,186,90,'C',ic)+arrow(370,113,90,ic);
    return s+dot(370,38)+dot(370,334)+route('M370 38H460V114 M460 258V334H370',i)+load(460,114,90,p,i)+arrow(460,82,90,i);
  }
  function acSwitch(st,p){
    const i=st[0];
    return route('M58 208V113H138 M58 238V333H399V295 M272 113H399V151',i)+part(58,223,90,'ac',i)+math(89,223,'u_s')+
      route('M138 113V76H183 M225 76H272V113',i>0)+valve(204,76,0,'T',i>0)+
      route('M138 113V150H183 M225 150H272V113',i<0)+valve(204,150,180,'T',i<0)+dot(138,113)+dot(272,113)+load(399,151,90,p,i,true)+arrow(399,132,90,i)+arrow(95,113,0,i);
  }
  function drive(st,p){
    // Fundamental-frequency equivalent. No instantaneous transistor states can
    // be deduced from this averaged model; arrows are drawn at its physical ports.
    const [hi,lo,...currents]=st,dcSign=st[5],braking=dcSign<0;
    const rows=[127,188,249],xs=[152,206,260];
    let s=route('M24 127V188',hi===0||lo===0)+route('M24 188V249',hi===2||lo===2)+dot(24,188)+math(13,188,'N_s',25);
    rows.forEach((y,k)=>{
      const i=Number(k===hi)-Number(k===lo);
      s+=gridSource(k,y,xs[k],i)+leg(xs[k],y,k===hi,k===lo);
      const next=xs[k+1]??300;
      s+=route('M'+xs[k]+' 38H'+next,hi>=0&&hi<=k)+route('M'+xs[k]+' 334H'+next,lo>=0&&lo<=k);
    });
    s+=part(315,38,0,'L',hi>=0)+route('M330 38H407 M300 334H407',hi>=0)+route('M407 38H484V108 M407 334H484V268',dcSign)+math(315,15,'L_d');
    s+=route('M407 38V80 M407 110V236 M407 278V334',braking)+part(407,95,90,'R',braking)+valve(407,257,90,'Q',braking)+dot(407,38)+dot(407,334)+math(429,92,'R_b',34)+arrow(407,142,90,braking);
    s+=line('M355 38V173 M355 203V334')+part(355,188,90,'C',0)+dot(355,38)+dot(355,334)+math(335,186,'C');
    s+='<rect x="447" y="108" width="75" height="160" rx="3" fill="white" stroke="'+ink+'" stroke-width="2.4"/>'+
      line('M454 244L515 131 M461 138h15m-15 5h15 M493 234q4 -10 8 0t8 0')+math(485,187,'3\\sim');
    rows.forEach((y,k)=>{s+=route('M522 '+y+'H551 M695 '+y+'H720',currents[k])+load(551,y,0,p,currents[k],true,k===0)+arrow(536,y,0,currents[k]);});
    return s+route('M720 127V188',currents[0])+route('M720 188V249',currents[2])+dot(720,188)+math(739,188,'N',25);
  }
  function draw(id,st,p){
    commandView=p.view==='commands';front='';
    let body;
    if(['diody','tyristory','aktivni'].includes(id))body=rectifier(id,st,p);
    else if(id==='pwm'||id==='jednofazovy')body=inverter(id==='pwm',st,p);
    else if(id==='pulzni')body=chopper(st,p);
    else if(id==='stridavy')body=acSwitch(st,p);
    else body=drive(st,p);
    return body+'<g pointer-events="none">'+front+'</g>';
  }
  return {draw};
})();
