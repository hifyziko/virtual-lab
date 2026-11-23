(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const magnetic = HiFyzikoParticleStyle.fields.magnetic;
  const presets = [[1,0],[1.75,0],[1.75,.34],[1.75,-.34]];
  const main = document.querySelector('main');

  const fieldVisible={current:false,pressure:true,field:false};
  const buttons = Array.from(byId('presets').children);
  const number = value => value.toFixed(2).replace('.', '{,}');
  const math = (id, tex) => katex.render(tex, byId(id));
  document.querySelectorAll('[data-tex]').forEach(node => katex.render(node.dataset.tex,node));

  function arrow(x,y,dx,dy) {
    const length=Math.hypot(dx,dy);
    if (length<.1) return '<circle cx="'+x+'" cy="'+y+'" r="2.5" fill="'+magnetic+'"/>';
    const head=Math.min(length*.50,9), neck=length-head, half=Math.min(head*.19,1.7);
    return '<path transform="translate('+x+' '+y+') rotate('+Math.atan2(dy,dx)*180/Math.PI+')" fill="'+magnetic+'" d="M0 '+(-half)+' H'+neck+' v'+(half-head*.46)+' L'+length+' 0 '+neck+' '+head*.46+' V'+half+' H0 Z"/>';
  }
  function label(x,y,text,anchor='middle',color='#35474e') {
    return '<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-size="15">'+text+'</text>';
  }
  const sx=x=>292+x*115, sy=z=>281-z*115;
  const sceneMath = new Map(['B_{\\rm T}/B_0','I_{\\rm p}','2b','d','0','1','2','3','4','5','6','7','8'].map(tex=>[tex,katex.renderToString(tex)]));
  function mathLabel(x,y,tex) {
    return `<foreignObject x="${x}" y="${y}" width="55" height="23"><span xmlns="http://www.w3.org/1999/xhtml" class="dimension">${sceneMath.get(tex)}</span></foreignObject>`;
  }
  function path(points) {
    return points.map(([x,z],i)=>(i?'L':'M')+sx(x).toFixed(2)+' '+sy(z).toFixed(2)).join(' ')+'Z';
  }
  function drawSection(model,k,d,boundary,plasmaRatio=1) {
    const edge=path(boundary);
    let svg=`<defs>
      <linearGradient id="shell" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#c5d4db"/><stop offset=".48" stop-color="#778f9d"/><stop offset="1" stop-color="#a7bbc6"/></linearGradient>
      <radialGradient id="plasma"><stop stop-color="#81cde3" stop-opacity=".30"/><stop offset=".72" stop-color="#5aa3d1" stop-opacity=".23"/><stop offset="1" stop-color="#6198c8" stop-opacity=".17"/></radialGradient>
      <radialGradient id="coil"><stop stop-color="#f5d9aa"/><stop offset=".47" stop-color="#ce985c"/><stop offset=".58" stop-color="#a67747"/><stop offset="1" stop-color="#f1d5b5"/></radialGradient>
      <filter id="halo" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
      <pattern id="grid" width="57.5" height="57.5" patternUnits="userSpaceOnUse" x="4.5" y="-6.5"><path d="M0 57.5 V0 H57.5" fill="none" stroke="#9eb2bc" stroke-opacity=".25" stroke-dasharray="2 6"/></pattern>
    </defs><rect width="600" height="570" fill="url(#grid)"/>
    ${fieldVisible[main.dataset.mode]?fieldBackdrop:''}
    <rect x="66" y="29" width="30" height="505" rx="8" fill="#dce6e9" stroke="#a0b4bf"/>
    <ellipse cx="292" cy="281" rx="173" ry="249" stroke="url(#shell)" stroke-width="9" fill="none"/> `;
    const currents=shapingCoilCurrents(model,plasmaRatio,shapingGeometry(boundary).areaRatio);
    shapingCoilPairs.forEach(([x,height],i)=>{
      const value=currents[i], magnitude=Math.abs(value).toFixed(2).replace('.',',');
      const mark=magnitude==='0,00'?'':value>0?'<circle r="2.6" fill="#634328"/>':'<path d="M-3 -3l6 6m0 -6l-6 6" fill="none" stroke="#634328" stroke-width="1.6"/>';
      for(const z of [height,-height]){
        svg+='<g transform="translate('+sx(x)+' '+sy(z)+')"><circle r="10" fill="url(#coil)" stroke="#9b704c" stroke-width="1.6"/>'+mark+'</g>';
        // Above/below the lateral conductors, away from the vessel and central column.
        if(i<2) svg+=label(sx(x)+4,sy(z)+(z>0?-17:27),magnitude,'middle','#704e35');
        else svg+=label(sx(x)+Math.sign(x)*15,sy(z)+5,magnitude,x<0?'end':'start','#704e35');
      }
    });
    if (main.dataset.mode==='field' && byId('reference').checked) {
      for (const [height,color,dash] of [[1,'#677982','6 6'],[k,'#aa722e','3 6']]) {
        svg+=`<ellipse cx="292" cy="281" rx="115" ry="${height*115}" fill="none" stroke="${color}" stroke-opacity=".78" stroke-width="1.5" stroke-dasharray="${dash}"/>`;
      }
    }
    svg+=`<path d="${edge}" fill="none" stroke="white" stroke-width="5" opacity=".85"/><path d="${edge}" fill="${fieldVisible[main.dataset.mode]?'none':'url(#plasma)'}" stroke="#245b9a" stroke-width="2.8"/>`;
    for(const fraction of [.88,.76,.64,.50,.36,.22]) {
      svg+=`<path d="${path(model.contour(fraction))}" fill="none" stroke="#214e85" stroke-opacity=".85" stroke-width="1.3"/>`;
    }
    const orbit=path(model.contour(.76));
    if(main.dataset.mode==="current") svg+='<circle id="sectionMarker" r="4" fill="#fff" stroke="#356ac3" stroke-width="1.6"/>';
    else svg+=`<g class="tracer"><circle r="7" fill="#4593bb" filter="url(#halo)"/><circle r="3.6" stroke="#356ac3" stroke-width="1.2" fill="#ffffff"/><animateMotion dur="10s" repeatCount="indefinite" path="${orbit}"/></g>`;
    if (main.dataset.mode==='field' && byId('vectors').checked) {
      for (const fraction of [.55,.86]) {
        for(const [x,z] of model.contour(fraction,16)) {
          const [bx,bz]=model.field(x,z);
          svg+=arrow(sx(x),sy(z),bx*19,-bz*19);
        }
      }
    }
    svg+='<path stroke="#a47130" stroke-dasharray="3 3" d="M292 '+sy(k)+' H'+sx(-d)+'"/><circle cx="'+sx(-d)+'" cy="'+sy(k)+'" r="4" fill="#a47130"/>';
    svg+=label(sx(-d)+(d<0?7:-7),sy(k)-10,'horní okraj',d<0?'start':'end','#875d2e');
    if(Math.abs(d)>.05) svg+=mathLabel((sx(-d)+sx(0))/2-7,sy(k)-25,'d');
    if(main.dataset.mode==='pressure'){
      if(byId('ellipseRef').checked)svg+='<path d="'+ellipsePath+'" fill="none" stroke="#493e36" stroke-width="1.8" stroke-dasharray="6 5"/>';

    }
    const gauge=sx(1.93);
    svg+=`<path d="M${gauge} ${sy(k)} V${sy(-k)} M${gauge-5} ${sy(k)} h10 M${gauge-5} ${sy(-k)} h10" fill="none" stroke="#698497"/>`;
    svg+=mathLabel(gauge+8,sy(0)-11,'2b');
    svg+=`<circle cx="${sx(model.axis)}" cy="${sy(0)}" r="7.5" fill="none" stroke="#926028"/><circle cx="${sx(model.axis)}" cy="${sy(0)}" r="2" fill="#926028"/>`;
    svg+=mathLabel(sx(model.axis)+10,sy(0)-24,'I_{\\rm p}');
    for(const [x,z,name] of (main.dataset.mode==='field' ? [[.78,0,'A'],[0,.78,'B']] : [])) {
      svg+='<circle cx="'+sx(x)+'" cy="'+sy(z)+'" r="4" fill="#fff6df" stroke="#805b2f" stroke-width="1.5"/>'+label(sx(x)+9,sy(z)-8,name,'start','#805b2f');
    }
    byId('sectionPlot').innerHTML=svg+label(27,556,'← K hlavní ose','start','#546b79')+label(573,556,'K vnější straně →','end','#546b79');
  }
  const fieldAt=x=>3.3/(3.3+x);
  // The field occupies the vacuum vessel, including the space outside the plasma.
  const mapRadius=173/115,lowField=fieldAt(mapRadius),highField=fieldAt(-mapRadius);
  const palette=[[36,64,161],[40,146,218],[46,201,207],[111,205,119],[248,222,70],[247,143,59],[190,50,47]];
  function fieldColour(value){
    const u=Math.min(1,Math.max(0,(value-lowField)/(highField-lowField)))*(palette.length-1);
    const i=Math.min(palette.length-2,Math.floor(u)),f=u-i;
    return 'rgb('+palette[i].map((v,c)=>Math.round(v+(palette[i+1][c]-v)*f)).join(',')+')';
  }
  const stops=Array.from({length:129},(_,i)=>{
    const f=i/128;
    return '<stop offset="'+f+'" stop-color="'+fieldColour(fieldAt(mapRadius*(2*f-1)))+'"/>';
  }).join('');
  const scaleTicks=Array.from({length:9},(_,i)=>{
    const f=i/8,y=147+224*f;
    return label(28,y+5,(highField+(lowField-highField)*f).toFixed(2).replace('.',','),'end')+
      '<path d="M31 '+y+'h5" stroke="#495965"/>';
  }).join('');
  const fieldBackdrop='<defs><linearGradient id="fieldMap">'+stops+'</linearGradient><linearGradient id="fieldKey" x1="0" y1="1" x2="0" y2="0">'+palette.map((rgb,i)=>'<stop offset="'+i/(palette.length-1)+'" stop-color="rgb('+rgb+')"/>').join('')+'</linearGradient></defs>'+
    '<ellipse cx="292" cy="281" rx="173" ry="249" fill="url(#fieldMap)"/>'+
    '<path d="M292 32V530" stroke="#283f52" stroke-dasharray="4 5"/>'+label(292,24,'R₀')+
    '<rect x="36" y="147" width="14" height="224" fill="url(#fieldKey)"/>'+mathLabel(3,113,'B_{\\rm T}/B_0')+scaleTicks;
  const ellipsePath=path(shapingModel(1.6,0).contour(1));
  const fieldCanvas=byId('shapeRing');
  let fieldContour=[],viewAz=.5,viewEl=.72,fieldDrag=null;
  function drawFieldRing(){
    if(main.dataset.mode!=='pressure'||!fieldContour.length)return;
    const bounds=fieldCanvas.getBoundingClientRect(), density=Math.min(devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(bounds.width*density)),h=Math.max(1,Math.round(bounds.height*density));
    fieldCanvas.width=w;fieldCanvas.height=h;
    const pen=fieldCanvas.getContext('2d'),scale=Math.min(w/9.2,h/(3.7+6.6*Math.abs(Math.sin(viewEl))));
    pen.translate(w/2,h/2);pen.scale(scale,scale);
    function point(phi,[x,z]){
      const angle=phi-viewAz,r=3.3+x,depth=r*Math.cos(angle);
      return [r*Math.sin(angle),depth*Math.sin(viewEl)-z*Math.cos(viewEl),depth*Math.cos(viewEl)+z*Math.sin(viewEl)];
    }
    const count=64,n=fieldContour.length,faces=[];
    const rings=Array.from({length:count},(_,i)=>fieldContour.map(p=>point(i*2*Math.PI/count,p)));
    for(let i=0;i<count;i++)for(let j=0;j<n;j++){
      const next=rings[(i+1)%count],k=(j+1)%n;
      const quad=[rings[i][j],next[j],next[k],rings[i][k]];
      faces.push({quad,depth:quad.reduce((sum,p)=>sum+p[2],0)/4,j});
    }
    faces.sort((a,b)=>a.depth-b.depth);
    const colours=fieldContour.map(([x])=>fieldVisible.pressure?fieldColour(fieldAt(x)):'#d6e7ec');
    pen.lineWidth=.013;
    for(const {quad,j} of faces){
      pen.beginPath();pen.moveTo(quad[0][0],quad[0][1]);
      for(let k=1;k<4;k++)pen.lineTo(quad[k][0],quad[k][1]);
      pen.closePath();pen.fillStyle=pen.strokeStyle=colours[j];pen.fill();pen.stroke();
    }
    function line(points,colour,width){
      pen.beginPath();points.forEach(([x,y],i)=>{if(i)pen.lineTo(x,y);else pen.moveTo(x,y);});
      pen.strokeStyle=colour;pen.lineWidth=width;pen.lineJoin='round';pen.stroke();
    }
    const cut=rings[16];line([...cut,cut[0]],'#519690',.038);
    const winding=Array.from({length:n*12+1},(_,i)=>{
      const index=i/12,j=Math.floor(index)%n,t=index%1,a=fieldContour[j],b=fieldContour[(j+1)%n];
      return point(index/n*6*Math.PI,[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);
    });
    line(winding,'rgba(53,106,195,.76)',.04);
  }
  fieldCanvas.onpointerdown=e=>{fieldDrag=[e.clientX,e.clientY];fieldCanvas.setPointerCapture(e.pointerId);};
  fieldCanvas.onlostpointercapture=()=>{fieldDrag=null;};
  fieldCanvas.onpointermove=e=>{
    if(!fieldDrag)return;
    viewAz-=(e.clientX-fieldDrag[0])*.008;viewEl=Math.max(-1.3,Math.min(1.3,viewEl+(e.clientY-fieldDrag[1])*.008));
    fieldDrag=[e.clientX,e.clientY];drawFieldRing();
  };
  const fieldObserver=new ResizeObserver(drawFieldRing);fieldObserver.observe(fieldCanvas);
  function updateFieldView(){
    const delta=Number(byId('scan').value),model=shapingModel(1.6,delta),boundary=model.contour(1,512);
    drawSection(model,1.6,delta,boundary);
    fieldContour=boundary.filter((_,i)=>i%8===0);drawFieldRing();
    const geometry=shapingGeometry(boundary);
    // B(R)*R is constant. Area and toroidal volume ratios use the same circular reference.
    math('fieldMean','\\langle B_{\\rm T}\\rangle_V/B_0='+ (geometry.areaRatio/geometry.volumeRatio).toFixed(3).replace('.','{,}'));
    math('scanValue',number(delta));
    byId('shapeName').textContent=delta===0?'Elipsa':delta>0?'Kladná triangularita':'Záporná triangularita';
  }
  function drawProbes(model) {
    let svg='';
    ['Proud plazmatu','Vnější cívky','Výsledné pole'].forEach((title,i)=>svg+=label(130+150*i,16,title));
    for (const [i,[x,z,name]] of [[.78,0,'Bod A'],[0,.78,'Bod B']].entries()) {
      const y=64+i*79, [bx,bz]=model.field(x,z);
      svg+=label(3,y+5,name,'start');
      [[-z,x],[bx+z,bz-x],[bx,bz]].forEach(([u,v],j)=>{
        const px=130+j*150;
        svg+='<path stroke="#d9dfe5" d="M'+(px-54)+' '+y+' h108 M'+px+' '+(y-33)+' v66"/>';
        svg+=arrow(px,y,u*29,-v*29);
      });
    }
    byId('probePlot').innerHTML=svg;
  }
  const ring=byId('ring'), ctx=ring.getContext('2d');
  const tau=2*Math.PI;
  let azimuth=.6, elevation=.47, drag=null, drawFrame=0;
  let ringK=1, ringQ=3, ringCache=null;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function project(phi,theta) {
    const radius=3.3+Math.cos(theta), angle=phi-azimuth;
    const horizontal=radius*Math.sin(angle), height=ringK*Math.sin(theta);
    const radial=radius*Math.cos(angle);
    return [horizontal,radial*Math.sin(elevation)-height*Math.cos(elevation),
      radial*Math.cos(elevation)+height*Math.sin(elevation)];
  }
  function prepareRing(w,h) {
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const pen=canvas.getContext('2d');
    const sin=Math.sin(elevation), cos=Math.cos(elevation);
    const tubeHeight=Math.hypot(sin,ringK*cos);
    const scale=Math.min(w/9.1,h/(2*(3.3*Math.abs(sin)+Math.hypot(sin,2*cos))+.4));
    pen.translate(w/2,h/2);pen.scale(scale,scale);

    // A solid torus is the union of balls swept along its central circle.
    // Elongation stretches the balls vertically; their orthographic images
    // are ellipses. Sweeping these ellipses gives a smooth projected shell.
    pen.save();
    pen.scale(1,tubeHeight);
    const axis=new Path2D(), ry=3.3*Math.abs(sin)/tubeHeight;
    if(ry<.00001){axis.moveTo(-3.3,0);axis.lineTo(3.3,0);}
    else {axis.ellipse(0,0,3.3,ry,0,0,tau);axis.closePath();}
    pen.lineCap='round';
    for(let layer=0;layer<32;layer++){
      pen.lineWidth=2*(1-layer/32);
      pen.strokeStyle=layer===0?'rgba(103,159,179,.14)':'rgba(117,181,195,.009)';
      pen.stroke(axis);
    }
    pen.restore();

    // A few pale poloidal sections reveal the tube's changing cross section.
    pen.strokeStyle='rgba(78,130,148,.23)';pen.lineWidth=.014;
    for(let i=0;i<8;i++){
      const section=new Path2D();
      for(let j=0;j<=96;j++){
        const [x,y]=project(tau*i/8,tau*j/96);
        if(j===0)section.moveTo(x,y);else section.lineTo(x,y);
      }
      section.closePath();
      if(i===2){
        pen.save();
        const upper=project(tau*i/8,Math.PI*.65), lower=project(tau*i/8,Math.PI*1.65);
        const light=pen.createLinearGradient(upper[0],upper[1],lower[0],lower[1]);
        light.addColorStop(0,'rgba(24,191,183,.43)');
        light.addColorStop(.43,'rgba(189,255,242,.24)');
        light.addColorStop(1,'rgba(10,161,173,.38)');
        pen.fillStyle=light;
        pen.fill(section);
        pen.shadowColor='rgba(26,209,193,.8)';
        pen.shadowBlur=scale*.11;
        pen.strokeStyle='rgba(20,164,161,.65)';
        pen.lineWidth=.044;
        pen.stroke(section);
        pen.shadowBlur=0;
        pen.lineWidth=.022;
        pen.strokeStyle='rgba(220,255,248,.95)';
        pen.stroke(section);
        pen.restore();
      }else pen.stroke(section);
    }

    // Draw one unbroken field line first. Reinforce nearer spans without
    // erasing the far-side winding at crossings.
    const samples=Math.ceil(160*ringQ);
    const points=Array.from({length:samples+1},(_,i)=>project(tau*ringQ*i/samples,tau*i/samples));
    pen.lineJoin='round';pen.lineCap='round';
    pen.beginPath();pen.moveTo(points[0][0],points[0][1]);
    for(const [x,y] of points.slice(1))pen.lineTo(x,y);
    pen.lineWidth=.049;pen.strokeStyle=magnetic;pen.globalAlpha=.63;pen.stroke();
    pen.globalAlpha=.16;pen.lineWidth=.059;
    for(const depth of [-2,-1,0,1,2]){
      pen.beginPath();
      for(let i=1;i<points.length;i++){
        const prev=points[i-1],next=points[i];
        if(next[2]>=depth){
          if(i===1||prev[2]<depth)pen.moveTo(prev[0],prev[1]);
          pen.lineTo(next[0],next[1]);
        }
      }
      pen.stroke();
    }
    return {canvas,scale};
  }
  function paintRing(time) {
    drawFrame=0;
    if(main.dataset.mode!=='current'||!ring.isConnected)return;
    const rect=ring.getBoundingClientRect(), density=Math.min(devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(rect.width*density)), h=Math.max(1,Math.round(rect.height*density));
    if(!ringCache||ring.width!==w||ring.height!==h){
      ring.width=w;ring.height=h;ringCache=prepareRing(w,h);
    }
    ctx.clearRect(0,0,w,h);ctx.drawImage(ringCache.canvas,0,0);
    const phase=reducedMotion.matches?0:(time%18000)/18000;
    const theta=tau*phase;
    const marker=byId("sectionMarker");
    marker.setAttribute("cx",sx(Math.cos(theta)));
    marker.setAttribute("cy",sy(ringK*Math.sin(theta)));
    const [px,py]=project(tau*ringQ*phase,theta);
    const x=w/2+px*ringCache.scale,y=h/2+py*ringCache.scale;
    ctx.beginPath();ctx.arc(x,y,Math.max(2,ringCache.scale*.085),0,tau);
    ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=magnetic;ctx.lineWidth=1.4*density;ctx.stroke();
    if(!reducedMotion.matches) drawFrame=requestAnimationFrame(paintRing);
  }
  function refreshRing() {
    ringCache=null;
    if(!drawFrame)drawFrame=requestAnimationFrame(paintRing);
  }
  function rotate(dx,dy){
    azimuth-=dx;elevation=Math.max(-1.35,Math.min(1.35,elevation+dy));refreshRing();
  }
  ring.onpointerdown=e=>{drag=[e.clientX,e.clientY];ring.setPointerCapture(e.pointerId);};
  ring.onpointermove=e=>{if(!drag)return;rotate((e.clientX-drag[0])*.008,(e.clientY-drag[1])*.008);drag=[e.clientX,e.clientY];};
  ring.onlostpointercapture=()=>{drag=null;};
  ring.onkeydown=e=>{
    const delta={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]}[e.key];
    if(delta){e.preventDefault();rotate(...delta);}
  };
  window.addEventListener('resize',refreshRing);
  reducedMotion.addEventListener('change',refreshRing);
  window.HiFyzikoFusionDispose=()=>{cancelAnimationFrame(drawFrame);fieldObserver.disconnect();window.removeEventListener('resize',refreshRing);reducedMotion.removeEventListener('change',refreshRing);ringCache=null;};
  function updateGeometry(boundary) {
    const geometry=shapingGeometry(boundary);
    math('area',number(geometry.areaRatio)+'\\times'); math('volume',number(geometry.volumeRatio)+'\\times');
  }
  function drawCurrentExperiment() {
    const k=Number(byId('elongate').value),ratio=Number(byId('currentRatio').value);
    const q=3*(1+k*k)/(2*ratio);
    const model=shapingModel(k,0);
    const boundary=model.contour(1);
    updateGeometry(boundary);
    drawSection(model,k,0,boundary,ratio);
    if(k!==ringK||q!==ringQ||!drawFrame){ringK=k;ringQ=q;refreshRing();}
    byId('shapeName').textContent=k===1?'Kruhový průřez':'Eliptický průřez';
    byId('currentTask').textContent=k===1&&ratio===1?'Zvyšuj elongaci při stejném proudu.':
      Math.abs(q-3)<.005?'Obě čáry se překrývají. Odečti proud.':q>3?'Přidávej proud až k překrytí čar.':'Uber proud až k překrytí čar.';
    math('elongationReading',number(k));math('currentReading',number(ratio));math('windQ','q='+number(q));
    const x=n=>43+n*50,base=123,top=30;
    let svg=label(12,17,'Poloidální oběhy','start');
    for(let n=0;n<=8;n++){
      svg+='<path d="M'+x(n)+' '+top+' V'+base+'" stroke="#d9e3e6"/>'+mathLabel(x(n)-4,base+1,String(n));
    }
    for(const [n,y] of [[0,base],[1,top]])svg+='<path d="M43 '+y+' H443" stroke="#afc1c8"/>'+mathLabel(20,y-9,String(n));
    svg+='<path d="M43 123 L'+x(q)+' 30" stroke="#356ac3" stroke-width="4"/><path d="M43 123 L193 30" stroke="#88683d" stroke-width="2" stroke-dasharray="6 5"/>';
    byId('windingPlot').innerHTML=svg+'<circle cx="'+x(q)+'" cy="30" r="4" fill="#356ac3"/>'+label(448,166,'Toroidální oběhy','end');
  }
  function update() {
    if(main.dataset.mode==='current') {drawCurrentExperiment();return;}

    if (main.dataset.mode==='pressure') {
      updateFieldView();
      return;
    }
    const k=Number(byId('k').value), d=Number(byId('d').value);
    const model=shapingModel(k,d), boundary=model.contour(1);
    updateGeometry(boundary);
    const factor=(1+k*k)/2;
    const fixedCurrent=byId('constraint').value==='current';
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(k===presets[i][0] && d===presets[i][1])));
    math('kValue',number(k)); math('dValue',number(d));

    math('q0','3{,}00'); math('q',number(fixedCurrent?3*factor:3));
    math('i0','1{,}00'); math('i',number(fixedCurrent?1:factor));
    drawSection(model,k,d,boundary,fixedCurrent?1:factor);
    drawProbes(model);
  }
  function setMode(mode) {

    main.dataset.mode=mode;
    byId('showField').checked=fieldVisible[mode];
    byId('currentMode').setAttribute('aria-pressed',String(mode==='current'));
    byId('pressureMode').setAttribute('aria-pressed',String(mode==='pressure'));
    byId('fieldMode').setAttribute('aria-pressed',String(mode==='field'));
    update();
  }
  byId('currentMode').onclick=()=>setMode('current');
  byId('restart').onclick=()=>{byId('elongate').value=1;byId('currentRatio').value=1;azimuth=.6;elevation=.47;refreshRing();update();};
  byId('pressureMode').onclick=()=>setMode('pressure');
  byId('fieldMode').onclick=()=>setMode('field');

  buttons.forEach((button,i)=>button.onclick=()=>{
    [byId('k').value,byId('d').value]=presets[i];
    update();
  });
  // Snap only while dragging. A wider release band keeps the handle steady,
  // but does not trap the next pointer gesture or a keyboard adjustment.
  function bindRange(id, anchors) {
    const input=byId(id);
    let dragging=false, held=null;
    input.addEventListener('pointerdown',()=>{dragging=true;held=null;});
    const release=()=>{dragging=false;held=null;};
    input.addEventListener('pointerup',release);
    input.addEventListener('pointercancel',release);
    input.addEventListener('lostpointercapture',release);
    input.addEventListener('blur',release);
    input.oninput=()=>{
      if(dragging) {
        const raw=Number(input.value), min=Number(input.min), max=Number(input.max);
        const band=(max-min)*Math.max(.015,Math.min(.035,4/Math.max(1,input.getBoundingClientRect().width)));
        if(held===null||Math.abs(raw-held)>1.65*band) {
          held=anchors().filter(v=>v>=min&&v<=max&&Math.abs(v-raw)<=band)
            .sort((a,b)=>Math.abs(raw-a)-Math.abs(raw-b))[0]??null;
        }
        if(held!==null) input.value=held;
      }
      update();
    };
  }
  bindRange('elongate',()=>[1,1.5,2,Math.sqrt(2*Number(byId('currentRatio').value)-1)]);
  bindRange('currentRatio',()=>[(1+Number(byId('elongate').value)**2)/2,1]);
  byId('currentRatio').onkeydown=e=>{
    const direction={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1}[e.key];
    if(direction){
      e.preventDefault();
      e.currentTarget.value=Number(e.currentTarget.value)+direction*.01;
      update();
    }
  };
  bindRange('scan',()=>[0]);
  byId('ellipseRef').onchange=update;
  byId('showField').onchange=e=>{fieldVisible[main.dataset.mode]=e.target.checked;update();};
  bindRange('k',()=>[1,1.6,1.75]);
  bindRange('d',()=>[0]);
  for (const id of ['reference','vectors','constraint']) byId(id).oninput=update;
  byId('help').onclick=()=>{
    const guide=byId('guide');
    guide.showModal();
    guide.scrollTop=0;
    if(main.dataset.mode!=='current') byId('guide-'+main.dataset.mode).scrollIntoView({block:'start'});
  };
  update();
})();
