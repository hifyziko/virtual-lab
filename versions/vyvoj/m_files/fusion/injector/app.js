(() => {
  'use strict';
  const $=id=>document.getElementById(id), M=InjectorModel, art=InjectorScene;
  function math(el,tex){
    if(el.dataset.rendered===tex)return;
    katex.render(tex,el,{throwOnError:true,output:'htmlAndMathml'});
    el.dataset.rendered=tex;
  }
  document.querySelectorAll('[data-tex]').forEach(el=>math(el,el.dataset.tex));
  const ticks=[0,500,1000].map(val=>{
    const el=document.createElement('span');el.className='tick';math(el,String(val));$('ticks').append(el);return el;
  });

  let zoom=art.camera(M.sample(0,1000,true)).zoom,manualZoom=zoom,automatic=true;
  let view={x:460,y:177,scale:1},manualCenter=view,returnProgress=1,drag=null;
  let gestureGrace=0,sliderHeld=false,returnZoom=1;
  let time=0, playing=false, raf=0, last=0;
  // Finite, softly enveloped noise textures. No sound source runs between cues.
  let audio=null;
  const textures=new Map(),voices=new Set();
  const soundCues=[
    [.020,'release'],[.053,'scatter'],[.10,'split'],[.18,'release'],
    [.254,'contact'],[.27,'capture'],[.38,'grid'],[.65,'strip',true],
    [.84,'plate',false],[.94,'release',true]
  ];
  // Duration, attack, initial/final noise bandwidth (Hz), peak amplitude.
  const textureSpecs={
    release:[.34,.055,560,1850,.048],scatter:[.22,.06,850,490,.033],
    split:[.32,.045,1250,460,.048],contact:[.28,.035,480,220,.043],
    capture:[.29,.07,1050,410,.038],grid:[.48,.09,290,870,.044],
    strip:[.38,.055,1450,650,.044],plate:[.52,.028,600,140,.067]
  };
  function unlockAudio(){
    if(!$('sound').checked || document.hidden)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      if(!audio)audio=new Audio();
      if(audio.state==='suspended')audio.resume().catch(()=>{});
    }catch{clearAudio();}
  }
  function clearAudio(){
    if(audio)audio.close().catch(()=>{});
    audio=null;textures.clear();voices.clear();
  }
  function quiet(){
    if(!audio)return;
    const now=audio.currentTime;
    for(const {source,gate} of voices){
      gate.gain.setTargetAtTime(0,now,.009);source.stop(now+.05);
    }
    voices.clear();
  }
  function texture(kind){
    if(textures.has(kind))return textures.get(kind);
    const [duration,attack,low,high,peak]=textureSpecs[kind],rate=audio.sampleRate;
    const buffer=audio.createBuffer(1,Math.ceil(duration*rate),rate),samples=buffer.getChannelData(0);
    let seed=719+low,first=0,second=0,bass=0,max=0;
    const bassMix=1-Math.exp(-2*Math.PI*75/rate);
    for(let i=0;i<samples.length;i++){
      const t=i/rate,u=i/(samples.length-1);
      seed=(Math.imul(1664525,seed)+1013904223)>>>0;
      const mix=1-Math.exp(-2*Math.PI*(low+(high-low)*u)/rate);
      first+=mix*(seed/2147483648-1-first);second+=mix*(first-second);
      bass+=bassMix*(second-bass);
      let signal=second-bass;
      if(kind==='plate'||kind==='contact'){
        // Damped, overlapping material resonances under the soft impact.
        signal+=.32*Math.exp(-12*t)*(Math.sin(2*Math.PI*98*t)+.4*Math.sin(2*Math.PI*163*t));
      }
      const rise=Math.sin(Math.PI/2*Math.min(1,t/attack))**2;
      const fall=(1-u)**2*Math.exp(-2*u);
      samples[i]=signal*rise*fall;max=Math.max(max,Math.abs(samples[i]));
    }
    for(let i=0;i<samples.length;i++)samples[i]*=peak/max;
    textures.set(kind,buffer);return buffer;
  }
  function playTexture(kind,volume=1){
    const source=audio.createBufferSource(),gate=audio.createGain();
    source.buffer=texture(kind);gate.gain.value=volume;
    source.connect(gate);gate.connect(audio.destination);
    const voice={source,gate};voices.add(voice);
    source.onended=()=>{source.disconnect();gate.disconnect();voices.delete(voice);};
    source.start();
  }
  function soundEvent(before,after,gas,continuous=false){
    if(!audio || !$('sound').checked || document.hidden || before===after)return;
    for(const [at,kind,branch] of soundCues){
      if(before>=at || after<at || (branch!==undefined && gas!==branch))continue;
      playTexture(kind);
    }
    if(continuous && before>=.73 && after<.84){
      const a=M.sample(before,1,gas).playSeconds,b=M.sample(after,1,gas).playSeconds;
      for(let i=0;i<art.beamCount;i++){
        const next=art.neighbour(i,b,gas);
        if(next.branch && next.x>=M.dumpX && art.neighbour(i,a,gas).x<M.dumpX){
          playTexture('plate',.38);
        }
      }
    }
  }
  function surface(el){
    const w=el.clientWidth,h=el.clientHeight;
    const ratio=Math.max(1,devicePixelRatio*(el.getBoundingClientRect().width/(w||1)));
    const px=Math.max(1,Math.round(w*ratio)),py=Math.max(1,Math.round(h*ratio));
    if(el.width!==px || el.height!==py){el.width=px;el.height=py;}
    const ctx=el.getContext('2d');ctx.setTransform(px/(w||1),0,0,py/(h||1),0,0);ctx.clearRect(0,0,w,h);
    return {ctx,w,h};
  }
  function overview(f,gas){
    const {ctx,w,h}=surface($('line'));
    art.overview(ctx,w,h,f,gas);
  }
  function graph(f,voltage,gas){
    const {ctx,w,h}=surface($('plot')),left=40,sx=(w-left-12)/(M.birthX+26-39);
    const y=e=>h-25-(h-36)*e/1000;
    for(let i=0;i<ticks.length;i++){
      const yy=y(i*500);ticks[i].style.top=yy+'px';
      art.line(ctx,[[left,yy],[w-10,yy]],'#d6e1e3',1);
    }
    ctx.translate(left-39*sx,0);
    ctx.font='12px "Segoe UI",sans-serif';ctx.fillStyle=art.ink;ctx.textAlign='left';
    ctx.fillText('Zdroj',39*sx,h-5);ctx.fillText('Mřížky',M.grids[0]*sx,h-5);
    ctx.textAlign='right';ctx.fillText('Plazma',(M.birthX+26)*sx,h-5);
    const stop=gas?M.birthX+26:M.dumpX;
    const points=[39,...M.grids.flatMap(x=>[x-2,x,x+2]),stop];
    const curve=points.map(x=>[x*sx,y(M.energy(x,voltage))]);
    if(!gas)curve.push([stop*sx,y(0)]);
    for(const x of M.grids)art.line(ctx,[[x*sx,y(0)],[x*sx,y(1000)]],'#d5dede',.7,[2,4]);
    art.line(ctx,curve,'#869eaa',1.4,[4,4]);
    const flown=points.filter(x=>x<f.x).map(x=>[x*sx,y(M.energy(x,voltage))]);
    if(f.impact)flown.push([f.x*sx,y(voltage)]);
    flown.push([f.x*sx,y(f.kinetic)]);art.line(ctx,flown,art.neutral,2.7);
    art.dot(ctx,f.x*sx,y(f.kinetic),4.8,art.neutral);
  }
  function setText(el,s){if(el.textContent!==s)el.textContent=s;}
  function reaction(f,gas){
    if(f.t<.042)return String.raw`\text{foton}+\mathrm D^0\to\mathrm D^++\mathrm e^-`;
    if(f.t>=.053 && f.t<.07)return String.raw`\mathbf F_{12}=-\mathbf F_{21}`;
    if(f.t<.10)return String.raw`\mathbf F_{\text{pole}}=-e\mathbf E`;
    if(f.t<.14)return String.raw`\mathrm e^-+\mathrm D_2\to\mathrm e^-+2\mathrm D^0`;
    if(f.t<.18)return String.raw`\mathrm D^0\qquad\mathrm D^0`;
    if(f.t<.211)return String.raw`\mathrm e^-+\mathrm D^0\to\mathrm D^++2\mathrm e^-`;
    if(f.t<.254)return String.raw`\mathrm D^0,\quad q=0`;
    if(f.t<.306)return String.raw`\mathrm D^0+\mathrm e^-_{\text{kov}}\to\mathrm D^-`;
    if(f.t<.34)return String.raw`\mathbf F_{\mathrm{el}}=-e\mathbf E`;
    if(f.t<.38)return String.raw`\mathbf F_{\mathrm{mag}}=-e\,\mathbf v\times\mathbf B`;
    if(f.t<.57)return String.raw`\Delta E_{\mathrm k}=e\Delta\varphi`;
    if(f.t<.65)return String.raw`q=-e,\quad E_{\mathrm k}=eU`;
    if(f.t<.73)return gas?String.raw`\mathrm D^-+\mathrm D_2\to\mathrm D^0+\mathrm D_2+\mathrm e^-`:String.raw`q=-e,\quad E_{\mathrm k}=eU`;
    if(f.impact)return String.raw`E_{\mathrm k}=0`;
    if(f.t<.84 || !gas)return gas?String.raw`q=0,\quad\mathbf F=\mathbf 0`:String.raw`\mathbf F=-e\mathbf E`;
    return f.t<.94?String.raw`q=0`:String.raw`\mathbf F=e\,\mathbf v\times\mathbf B`;
  }
  // SVG retains the live projection as vector paths, including at browser zoom.
  function renderRF(t,w,h,view){
    const svg=$('rf-vector'),marks=$('rf-marks'),src=InjectorSource;
    if(!svg.setAttribute)return;
    if(t>=.117){marks.replaceChildren();return;}
    svg.setAttribute('viewBox','0 0 '+w+' '+h);
    const ease=(a,b)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
    const front=art.frontView(t),project=art.detailProjector(t),open=ease(.011,.017);
    const pieces=[],phase=src.rfPhase(t),rf=Math.sin(phase),amber='#b57825';
    const fmt=p=>p.map(v=>v.toFixed(2)).join(',');
    const depth=p=>p[2]*(1-front)+(p[0]-200)*front;
    const path=points=>'M'+points.map(p=>fmt(project(p))).join(' L');
    function triangle(x,y,dx,dy,size,color){
      const len=Math.hypot(dx,dy);
      if(len<1e-8)return '';
      const a=dx*size/len,b=dy*size/len;
      return '<path fill="'+color+'" d="M'+fmt([x+a,y+b])+' L'+fmt([x-a*.7-b*.65,y-b*.7+a*.65])+' L'+fmt([x-a*.7+b*.65,y-b*.7-a*.65])+' Z"/>';
    }
    for(const x of src.loopStations){
      for(let half=0;half<2;half++){
        const samples=Array.from({length:33},(_,i)=>src.ringWorld(x,77,Math.PI*(half+i/32)));
        pieces.push([depth(samples[16]),'<path d="'+path(samples)+'" fill="none" stroke="'+amber+'" stroke-width="1.6" stroke-dasharray="4 5" opacity="'+(half?.88:.52)+'"/>']);
      }
      for(const offset of [0,Math.PI]){
        const a=offset-.65*Math.cos(phase),world=src.ringWorld(x,77,a),p=project(world);
        const q=project(src.ringWorld(x,77,a+.02*Math.sign(rf)));
        pieces.push([depth(world),'<g opacity="'+Math.abs(rf)+'">'+triangle(...p,q[0]-p[0],q[1]-p[1],5,amber)+'</g>']);
      }
    }
    function particle(fn,start,r,opacity,reference=false){
      const world=fn(t),p=project(world);
      // Drift module convention: age controls both opacity and line width quadratically.
      const count=16,duration=.024,turn=reference?src.lastReferenceTurn(t):-Infinity;
      let prev=fn(Math.max(start,t-duration)),segments='';
      for(let j=1;j<=count;j++){
        const age=(1-j/count)*Math.min(duration,t-start),next=fn(t-age);
        // When the electron retraces its arc, let the old outgoing trail expire
        // quickly enough for the returning head and its fresh trail to stand out.
        const outgoing=t-age<turn?Math.max(0,1-(t-turn)/.006):1;
        const weight=(1-age/duration)**2*outgoing;
        segments+='<path d="'+path([prev,next])+'" fill="none" stroke="#377fa5" stroke-linecap="round" stroke-width="'+(.3+r*1.1*weight)+'" opacity="'+(.8*weight)+'"/>';
        prev=next;
      }
      const order=depth(world);
      const fill=reference?'url(#rf-reference)':'url(#rf-electron)';
      pieces.push([order,'<g opacity="'+opacity+'">'+segments+'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+r+'" fill="'+fill+'"/></g>']);
    }
    if(open){
      const emphasis=ease(.017,.022)*(1-ease(.052,.058));
      for(let i=0;i<33;i+=4){
        const reference=i===0 && emphasis>0;
        particle(v=>src.ambientWorld(i,v),0,2.8+(reference?2.1*emphasis:0),
          (.55+(reference?.45:-.16)*emphasis)*open,reference);
      }
      const frame=src.sourceFrame(t);
      function sphere(p,z,r,fill,opacity=1){
        const [cx,cy]=project(src.inPlane(p,z));
        pieces.push([depth(src.inPlane(p,z)),'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" opacity="'+opacity+'"/>']);
      }
      function atom(p,z,opacity=1){
        sphere([p[0]-4,p[1]],z+1,9,'url(#rf-proton)',opacity);
        sphere([p[0]+5,p[1]+1],z-1,9,'url(#rf-neutron)',opacity);
      }
      function cloud(p,z,rx,ry,opacity=1){
        const [cx,cy]=project(src.inPlane(p,z));
        pieces.push([depth(src.inPlane(p,z))+18,'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#d6cbe4" fill-opacity="'+(.55*opacity)+'" stroke="#78658d" stroke-opacity="'+opacity+'" stroke-width="1.4"/>']);
      }
      if(frame.molecular)cloud([(frame.tracked[0]+frame.sibling[0])/2,161],60,46,29);
      else{cloud(frame.tracked,60,29,29);cloud(frame.sibling,60,29,29);}
      for(const [p,sibling] of [[frame.tracked,false],[frame.sibling,true]]){
        atom(p,60);
        sphere(src.orbital(p,t,sibling),57,4.8,'url(#rf-electron)');
      }
      if(t<.067){
        const opacity=1-ease(.032,.067),donor=[90,203];
        atom(donor,60,opacity);
        if(frame.donorBound){
          cloud(donor,60,29,29);
          sphere(frame.incident,60,5,'url(#rf-electron)');
        }
      }
      if(frame.donorBound && front>.05){
        const u=ease(.012,.020);
        const wave=Array.from({length:29},(_,i)=>src.inPlane([18+72*u-16+i*.6,154+49*u-8+i*.28+2.8*Math.sin(i*.8)],60));
        pieces.push([-Infinity,'<path d="'+path(wave)+'" fill="none" stroke="#88528b" stroke-width="2.1"/>']);
      }
      particle(src.neighbourWorld,0,4.8,.32+.68*ease(.037,.042)*(1-ease(.07,.078)));
      particle(src.projectileWorld,0,4.8,.32);
      if(t>=.020 && t<.10){
        particle(src.incidentWorld,.020,5,1);
        if(t<.042){
          const world=src.incidentWorld(t),e=src.electricField(world,t),p=project(world);
          const q=project(world.map((v,k)=>v+e[k])),dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy);
          if(len>1){
            let glyph='';
            for(const [sign,label,color] of [[1,'E',amber],[-1,'Fₑ','#17689b']]){
              const ux=sign*dx/len,uy=sign*dy/len,r=15+20*Math.abs(rf);
              const x=p[0]+ux*r,y=p[1]+uy*r;
              const start=[p[0]+6*ux,p[1]+6*uy],base=[x-3.5*ux,y-3.5*uy];
              glyph+='<path d="M'+fmt(start)+' L'+fmt(base)+'" fill="none" stroke="'+color+'" stroke-width="1.7"/>'+triangle(x,y,ux,uy,5,color)+'<text x="'+(x+uy*8)+'" y="'+(y-ux*8)+'" fill="'+color+'" font-family="Segoe UI,sans-serif" font-weight="600" text-anchor="middle" font-size="12">'+label+'</text>';
            }
            pieces.push([-Infinity,'<g opacity="'+Math.min(1,Math.abs(rf)*3)*ease(.020,.022)*(1-ease(.039,.042))+'">'+glyph+'</g>']);
          }
        }
      }
    }
    marks.setAttribute('transform','translate('+w/2+' '+h/2+') scale('+view.scale+') translate('+(-view.x)+' '+(-view.y)+')');
    marks.innerHTML=pieces.sort((a,b)=>b[0]-a[0]).map(p=>p[1]).join('');
  }
  function render(){
    const voltage=Number($('voltage').value),gas=$('gas').checked;
    const f=M.sample(time,voltage,gas);time=f.t;
    $('seek').max=f.endTime;$('seek').value=time;
    $('step').disabled=time>=f.endTime;
    setText($('play'),playing?'Pozastavit':time>=f.endTime?'Od začátku':'Přehrát');
    setText($('stage'),f.title);setText($('explanation'),f.description);
    setText($('action-caption'),f.caption);
    math($('reaction'),reaction(f,gas));
    math($('volts'),voltage+'\\,\\mathrm{kV}');math($('species'),f.symbol);
    math($('kinetic'),Math.round(f.kinetic)+'\\,\\mathrm{keV}');
    math($('velocity'),(f.speed/1e6).toFixed(2).replace('.','{,}')+'\\cdot10^6\\,\\mathrm{m\\,s^{-1}}');
    overview(f,gas);graph(f,voltage,gas);
    const cam=art.camera(f),{ctx,w,h}=surface($('micro'));
    const mix=automatic?returnProgress*returnProgress*(3-2*returnProgress):0;
    const vectorRF=Boolean($('rf-vector').setAttribute) && time<.117;
    view=art.micro(ctx,w,h,f,gas,zoom,{
      x:manualCenter.x+(cam.x-manualCenter.x)*mix,
      y:manualCenter.y+(cam.y-manualCenter.y)*mix
    },false,vectorRF);
    renderRF(time,w,h,view);
    if(automatic)$('cameraZoom').value=zoom;
  }
  function stop(){quiet();playing=false;cancelAnimationFrame(raf);raf=0;last=0;}
  function schedule(){if(!raf)raf=requestAnimationFrame(frame);}
  function frame(now){
    raf=0;
    const dt=last && !document.hidden?Math.min(.1,(now-last)/1000):0;
    last=now;
    const gas=$('gas').checked,voltage=Number($('voltage').value);
    const before=time;
    if(playing)time=M.advance(time,dt*Number($('speed').value),gas);
    const f=M.sample(time,voltage,gas);
    if(playing)soundEvent(before,time,gas,true);
    gestureGrace=Math.max(0,gestureGrace-dt);
    if(playing && !automatic && !drag && !sliderHeld && !gestureGrace){
      const ahead=M.advance(time,.85*Number($('speed').value),gas);
      const lens=$('micro');
      const nearEdge=sample=>{
        const [x,y]=art.focusParticle(sample);
        return Math.abs(x-view.x)*view.scale>lens.clientWidth*.40 ||
          Math.abs(y-view.y)*view.scale>lens.clientHeight*.40;
      };
      if(nearEdge(f) || nearEdge(M.sample(ahead,voltage,gas)))resumeCamera();
    }
    if(time>=f.endTime)playing=false;
    if(automatic)returnProgress=Math.min(1,returnProgress+dt/1.8);
    const blend=returnProgress*returnProgress*(3-2*returnProgress);
    const target=automatic?(1-blend)*returnZoom+blend*art.camera(f).zoom:manualZoom;
    zoom+=(target-zoom)*(-Math.expm1(-4*dt));
    if(Math.abs(target-zoom)<.001)zoom=target;
    render();
    if(playing || zoom!==target || (automatic && returnProgress<1))schedule();else last=0;
  }
  $('play').onclick=()=>{
    if(playing){stop();}else{
      if(time>=Number($('seek').max))time=0;
      unlockAudio();playing=true;
    }
    render();schedule();
  };
  $('step').onclick=()=>{
    stop();unlockAudio();const before=time,gas=$('gas').checked;
    time=M.sample(time,Number($('voltage').value),gas).next;
    soundEvent(before,time,gas);render();schedule();
  };
  $('sound').onchange=()=>{if($('sound').checked)unlockAudio();else quiet();};
  $('seek').oninput=()=>{stop();time=Number($('seek').value);render();schedule();};
  $('voltage').oninput=render;
  $('gas').onchange=()=>{stop();time=Math.min(time,.57);render();schedule();};
  function setManual(value){
    gestureGrace=.35;
    if(automatic)manualCenter={x:view.x,y:view.y};
    automatic=false;$('cameraAuto').checked=false;
    manualZoom=Math.max(.26,Math.min(3,value));$('cameraZoom').value=manualZoom;schedule();
  }
  $('cameraZoom').oninput=()=>setManual(Number($('cameraZoom').value));
  $('cameraZoom').onpointerdown=e=>{sliderHeld=true;e.currentTarget.setPointerCapture(e.pointerId);};
  $('cameraZoom').onlostpointercapture=()=>{sliderHeld=false;gestureGrace=.35;};
  function resumeCamera(){
    manualCenter={x:view.x,y:view.y};returnZoom=zoom;returnProgress=0;
    automatic=true;$('cameraAuto').checked=true;
  }
  $('cameraAuto').onchange=()=>{
    if($('cameraAuto').checked){
      resumeCamera();
    }else setManual(zoom);
    schedule();
  };
  $('micro').onwheel=e=>{
    e.preventDefault();
    const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?300:1);
    setManual((automatic?zoom:manualZoom)*Math.exp(-delta*.0015));
  };
  const lens=$('micro');
  lens.onpointerdown=e=>{
    if(e.button!==0)return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY};
    lens.setPointerCapture(e.pointerId);
  };
  lens.onpointermove=e=>{
    if(!drag || drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!dx && !dy)return;
    if(automatic)setManual(zoom);
    const scale=view.scale*lens.getBoundingClientRect().width/lens.clientWidth;
    manualCenter={x:view.x-dx/scale,y:Math.max(-180,Math.min(375,view.y-dy/scale))};
    drag.x=e.clientX;drag.y=e.clientY;render();
  };
  lens.onlostpointercapture=()=>{drag=null;gestureGrace=.35;};
  $('import-guide').onclick=()=>$('guide').showModal();$('close').onclick=()=>$('guide').close();
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)quiet();});
  window.HiFyzikoFusionDispose=()=>{stop();clearAudio();};
  window.addEventListener('pagehide',window.HiFyzikoFusionDispose);
  const observer=new ResizeObserver(render);observer.observe($('line'));observer.observe($('micro'));
  window.addEventListener('resize',render);render();
})();
