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
  const backplate=document.createElement('canvas');
  let plateKey='', time=0, playing=false, raf=0, last=0;
  function surface(el){
    const w=el.clientWidth,h=el.clientHeight;
    const ratio=Math.min(3,Math.max(1,devicePixelRatio*(el.getBoundingClientRect().width/(w||1))));
    const px=Math.max(1,Math.round(w*ratio)),py=Math.max(1,Math.round(h*ratio));
    if(el.width!==px || el.height!==py){el.width=px;el.height=py;}
    const ctx=el.getContext('2d');ctx.setTransform(px/(w||1),0,0,py/(h||1),0,0);ctx.clearRect(0,0,w,h);
    return {ctx,w,h};
  }
  function overview(f,gas){
    const el=$('line'),{ctx,w,h}=surface(el);
    const key=[el.width,el.height,gas].join('/');
    const sectionScale=Math.min(w/1320,h/270);
    const sectionLeft=(w-sectionScale*1320)/2;
    const offset=(h-sectionScale*270)/2;
    if(key!==plateKey){
      backplate.width=el.width;backplate.height=el.height;
      const c=backplate.getContext('2d');
      c.setTransform(el.width/w*sectionScale,0,0,el.height/h*sectionScale,sectionLeft*el.width/w,offset*el.height/h);
      art.background(c,gas);plateKey=key;
    }
    ctx.drawImage(backplate,0,0,w,h);ctx.translate(sectionLeft,offset);ctx.scale(sectionScale,sectionScale);art.tracked(ctx,f,gas);
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
    if(f.t<.10)return String.raw`\mathbf F_{\mathrm e}=-e\mathbf E`;
    if(f.t<.14)return String.raw`\mathrm e^-+\mathrm D_2\to\mathrm e^-+2\mathrm D^0`;
    if(f.t<.18)return String.raw`\mathrm D^0\qquad\mathrm D^0`;
    if(f.t<.211)return String.raw`\mathrm e^-+\mathrm D^0\to\mathrm D^++2\mathrm e^-`;
    if(f.t<.254)return String.raw`\mathrm D^0,\quad q=0`;
    if(f.t<.306)return String.raw`\mathrm D^0+\mathrm e^-_{\text{kov}}\to\mathrm D^-`;
    if(f.t<.38)return String.raw`\mathbf F_{\mathrm{el}}=-e\mathbf E`;
    if(f.t<.57)return String.raw`\Delta E_{\mathrm k}=e\Delta\varphi`;
    if(f.t<.65)return String.raw`q=-e,\quad E_{\mathrm k}=eU`;
    if(f.t<.73)return gas?String.raw`\mathrm D^-+\mathrm D_2\to\mathrm D^0+\mathrm D_2+\mathrm e^-`:String.raw`q=-e,\quad E_{\mathrm k}=eU`;
    if(f.impact)return String.raw`E_{\mathrm k}=0`;
    if(f.t<.84 || !gas)return gas?String.raw`q=0,\quad\mathbf F=\mathbf 0`:String.raw`\mathbf F=-e\mathbf E`;
    return f.t<.94?String.raw`q=0`:String.raw`\mathbf F=e\,\mathbf v\times\mathbf B`;
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
    const {ctx,w,h}=surface($('micro'));art.micro(ctx,w,h,f,gas);
  }
  function stop(){playing=false;cancelAnimationFrame(raf);last=0;}
  function frame(now){
    if(!playing)return;
    if(last && !document.hidden){
      const seconds=Math.min(.10,(now-last)/1000)*Number($('speed').value);
      time=M.advance(time,seconds,$('gas').checked);
    }
    last=now;
    const end=M.sample(time,Number($('voltage').value),$('gas').checked).endTime;
    if(time>=end){time=end;stop();}
    render();if(playing)raf=requestAnimationFrame(frame);
  }
  $('play').onclick=()=>{
    if(playing)stop();else{
      if(time>=Number($('seek').max))time=0;
      playing=true;last=0;raf=requestAnimationFrame(frame);
    }
    render();
  };
  $('step').onclick=()=>{stop();time=M.sample(time,Number($('voltage').value),$('gas').checked).next;render();};
  $('seek').oninput=()=>{stop();time=Number($('seek').value);render();};
  $('voltage').oninput=render;
  $('gas').onchange=()=>{stop();time=Math.min(time,.57);render();};
  $('import-guide').onclick=()=>$('guide').showModal();$('close').onclick=()=>$('guide').close();
  document.addEventListener('visibilitychange',()=>{last=0;});
  window.HiFyzikoFusionDispose=stop;
  window.addEventListener('pagehide',stop);
  const observer=new ResizeObserver(render);observer.observe($('line'));observer.observe($('micro'));
  window.addEventListener('resize',render);render();
})();
