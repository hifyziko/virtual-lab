(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const {node, line, dot, label, drawLauncher} = window.HiFyzikoWaveArt;
  const {electric, magnetic} = window.HiFyzikoParticleStyle.fields;
  const green = '#187767', ink = '#40515e';
  const fmt = (value, digits = 1) => Number(value.toFixed(digits)).toString().replace('.', '{,}');
  function math(target, tex) {
    if (target.dataset.rendered !== tex) {
      katex.render(tex, target);
      target.dataset.rendered = tex;
    }
  }
  function mathLabel(svg, x, y, width, tex, color = ink, align = 'left') {
    const box = node(svg, 'foreignObject', {x, y, width, height: 29});
    const span = document.createElement('span');
    span.style.cssText = 'display:block;text-align:' + align + ';color:' + color;
    box.appendChild(span);
    math(span, tex);
    return span;
  }
  function arrow(root, x, y, dx, dy, color, width = 3) {
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    const base = len - Math.min(10, len * 0.45);
    node(root, 'path', {
      d: 'M0 ' + (-width/2) + ' H' + base + ' v' + (-width) + ' L' + len + ' 0 ' + base + ' ' + (1.5*width) + ' v' + (-width) + ' H0Z',
      transform: 'translate(' + x + ' ' + y + ') rotate(' + Math.atan2(dy, dx) * 180 / Math.PI + ')', fill: color
    });
  }
  const ensemble = el('ensemble');
  const defs = node(ensemble,'defs');
  // Toroidal midplane. At the bottom of the ring the positive field tangent points right.
  const axisX=218, axisY=119, major=86, minor=24;
  const targetY=axisY+major;
  const glow=node(defs,'radialGradient',{id:'column-light'});
  for(const [offset,color] of [[0,'#7398b9'],[.56,'#7398b9'],[.65,'#a9c5dc'],[.78,'#eaf4fa'],[.90,'#b8cbdf'],[1,'#7794af']])
    node(glow,'stop',{offset,'stop-color':color});
  const overviewOffset=-69;
  const overview=node(ensemble,'g',{transform:'translate('+overviewOffset+' 0)'});
  const scene=node(overview,'g',{id:'eccd-plasma-scene'});
  label(ensemble,14,23,'Pohled shora');
  const circumference=(radius,color,width)=>node(scene,'circle',{cx:axisX,cy:axisY,r:radius,fill:'none',stroke:color,'stroke-width':width});
  circumference(major,'#bdcad2',2*(minor+4));
  const torus=dot(scene,axisX,axisY,major+minor,'url(#column-light)');
  const mask=node(defs,'mask',{id:'column-hole'});
  node(mask,'rect',{width:650,height:325,fill:'white'});dot(mask,axisX,axisY,major-minor,'black');
  torus.setAttribute('mask','url(#column-hole)');
  const heatClip=node(defs,'clipPath',{id:'heated-column'});
  const outer=major+minor, inner=major-minor;
  node(heatClip,'path',{'clip-rule':'evenodd',d:[outer,inner].map(r=>
    'M'+(axisX-r)+' '+axisY+'a'+r+' '+r+' 0 1 0 '+2*r+' 0a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0Z').join(' ')});
  const thermalPatch=node(scene,'g',{'clip-path':'url(#heated-column)',id:'temperature-trace','pointer-events':'none'});
  const thermalLayers=Array.from({length:14},()=>node(thermalPatch,'path',{fill:'#d74e57'}));
  const contour=Array.from({length:61},(_,i)=>[Math.cos(i*Math.PI/30),Math.sin(i*Math.PI/30)]);
  function drawThermalPatch(){
    const fraction=cycles/ECCD.pulseCycles;
    const initialAlong=beamWidth(62)/2, initialAcross=4;
    // Local diffusion in arc length and minor radius, in scene units per collision time.
    const along=Math.sqrt(initialAlong**2+2*24*elapsed);
    const across=Math.sqrt(initialAcross**2+2*3*elapsed);
    const peak=.92*fraction*(calc.heated/.6)*initialAlong*initialAcross/(along*across);
    thermalPatch.setAttribute('opacity',fraction===0?0:1);
    let previous=0;
    thermalLayers.forEach((layer,i)=>{
      const level=(thermalLayers.length-i)*2.8/thermalLayers.length;
      const opacity=.9*Math.sqrt(peak*Math.exp(-.5*(level-.1)**2));
      layer.setAttribute('opacity',(opacity-previous)/(1-previous));
      previous=opacity;
      const points=contour.map(([c,s])=>{
        const radius=major+level*across*s, phi=level*along*c/major;
        return [(axisX+radius*Math.sin(phi)).toFixed(2),(axisY+radius*Math.cos(phi)).toFixed(2)].join(' ');
      });
      layer.setAttribute('d','M'+points.join('L')+'Z');
    });
  }
  for(const offset of [-18,0,18]) circumference(major+offset,magnetic,.85).setAttribute('opacity',.5);
  const pulse=node(scene,'g');
  const beamGradient=node(defs,'linearGradient',{id:'eccd-beam-light',x1:'0%',x2:'0%',y1:'0%',y2:'100%'});
  const gaussian=r=>Math.exp(-2*r*r);
  for(let i=0;i<=32;i++){
    const r=(i/16-1)*2;
    node(beamGradient,'stop',{offset:i/32,'stop-color':'#ffac26','stop-opacity':gaussian(r)});
  }
  const beamLength=80;
  const beamSlices=Array.from({length:beamLength/2},()=>node(pulse,'path',{fill:'url(#eccd-beam-light)'}));
  const beamEdges=[-1,1].map(sign=>({sign,curve:line(pulse,'',electric,.35)}));
  const crests=Array.from({length:9},()=>line(pulse,'',electric,.8));
  const launcher=node(scene,'g');
  drawLauncher(launcher,0,0,.43,'cloud-launcher');
  const grip=node(launcher,'rect',{x:-5,y:-19,width:52,height:38,fill:'transparent',class:'launcher-grip'});
  node(grip,'title',{},'Tažením natoč zářič');
  const sample=node(scene,'g');
  line(overview,'M'+axisX+' '+targetY+'h92',magnetic,1.2).setAttribute('stroke-dasharray','3 3');
  arrow(overview,axisX+83,targetY,19,0,magnetic);
  mathLabel(overview,axisX+98,targetY-23,32,'\\mathbf B',magnetic);
  // Both views reference the same live geometry, beam and particle nodes.
  const crop={x:axisX-31,y:targetY-20,width:62,height:40};
  const inset={x:272,y:25,width:372,height:240};
  const frameColor='#708b9b';
  node(overview,'rect',{...crop,fill:'none',stroke:frameColor,'stroke-width':1.2});
  for(const dy of [0,1]){
    const startX=crop.x+crop.width+overviewOffset, startY=crop.y+dy*crop.height;
    line(ensemble,'M'+startX+' '+startY+'L'+inset.x+' '+(inset.y+dy*inset.height),frameColor,.8).setAttribute('stroke-dasharray','3 4');
  }
  label(ensemble,inset.x,18,'Místo zásahu');
  node(ensemble,'rect',{...inset,fill:'#f8fafc'});
  const zoom=node(ensemble,'svg',{...inset,viewBox:[crop.x,crop.y,crop.width,crop.height].join(' '),overflow:'hidden'});
  node(zoom,'use',{href:'#eccd-plasma-scene'});
  node(ensemble,'rect',{...inset,fill:'none',stroke:frameColor});
  const readings=node(ensemble,'g',{transform:'translate('+inset.x+' 0)'});
  const localResonance=mathLabel(readings,0,273,180,'0');
  const hotShare=mathLabel(readings,0,297,180,'0');

  const tangentFlows=node(readings,'g',{'aria-label':'Směry na tečně v místě zásahu'});
  label(readings,190,288,'Pohyb e⁻');
  label(readings,190,313,'Proud');
  const ringCaption=node(overview,'text',{x:axisX,y:axisY-7,'text-anchor':'middle'},'Vlečený proud');
  const ringCurrent=node(overview,'path',{fill:green});
  function showRingCurrent(j){
    if(Math.abs(j)<1e-10){
      ringCaption.textContent='Nulový proud';
      ringCurrent.setAttribute('d','');
      return;
    }
    ringCaption.textContent='Vlečený proud';
    // A single curved silhouette, positive current pointing right at the bottom.
    const sign=Math.sign(j), sweep=sign>0?0:1, span=.40+Math.min(Math.abs(j)/.05,1)*1.8;
    const start=-sign*span/2, end=sign*span/2, base=end-sign*.24;
    const pt=(r,a)=>[axisX+r*Math.sin(a),axisY+r*Math.cos(a)].join(' ');
    ringCurrent.setAttribute('d','M'+pt(39,start)+'A39 39 0 0 '+sweep+' '+pt(39,base)+
      'L'+pt(35,base)+'L'+pt(42,end)+'L'+pt(49,base)+'L'+pt(45,base)+
      'A45 45 0 0 '+(1-sweep)+' '+pt(45,start)+'Z');
  }
  const fract=x=>x-Math.floor(x);
  // Equal-weight Maxwellian samples. Opposite velocities share the same random
  // variates so changing the launch direction mirrors the selected population.
  const electrons=[];
  let spatialSeed=21763;
  function spatialSample(){
    spatialSeed=(Math.imul(spatialSeed,1664525)+1013904223)>>>0;
    return spatialSeed/4294967296;
  }
  const speedPairs=720;
  for(let i=0;i<speedPairs;i++){
    const radius=Math.sqrt(-Math.log((i+.5)/speedPairs));
    const speed=radius*Math.abs(Math.cos(2*Math.PI*fract(i*.618034)));
    for(const sign of [-1,1]){
      const seed=2*i+(sign+1)/2;
      const trail=line(sample,'','#6185ae',1.45);
      const body=dot(sample,0,0,2.5,'#316aa3');
      electrons.push({speed,sign,trail,body,background:i%4===0,x:spatialSample(),y:.78*spatialSample()+.22*spatialSample(),
        phase:seed*2.4, threshold:fract(i*.414214+.17),seed:i+1});
    }
  }
  let waveSpacing=12, beamDx=0, beamDy=-1;
  let edgeDistance=0;
  function beamWidth(s,scatter=true){
    const spread=scatter ? .36*Math.max(0,s-edgeDistance) : 0;
    return Math.hypot(4.8,.055*s,spread);
  }
  function drawBeamEnvelope(){
    // Outer intersection of the central ray with the circular plasma boundary.
    const b=major*beamDy;
    edgeDistance=62-b-Math.sqrt(b*b+2*major*minor+minor*minor);
    for(const {sign,curve} of beamEdges){
      const points=Array.from({length:41},(_,i)=>[2*i,sign*beamWidth(2*i)]);
      curve.setAttribute('d','M'+points.map(p=>p.join(' ')).join('L'));
      curve.setAttribute('opacity',.53);
    }
    for(const [i,slice] of beamSlices.entries()){
      const s=2*i, left=2*beamWidth(s), right=2*beamWidth(s+2);
      slice.setAttribute('d',`M${s} ${-left}L${s+2} ${-right}V${right}L${s} ${left}Z`);
      slice.setAttribute('opacity',Math.min(1,(beamLength-s)/15)*4.8/beamWidth(s));
    }
  }
  function capturePulse(){
    for(const p of electrons){
      const radius=major+(p.y-.5)*40;
      const phi=2*Math.PI*p.x+p.sign*p.speed*previewTime*34/radius;
      const ox=radius*Math.sin(phi), oy=radius*Math.cos(phi)-major;
      const along=ox*beamDx+oy*beamDy, across=ox*beamDy-oy*beamDx;
      const s=62+along;
      const offset=across/beamWidth(s);
      if(p.hotUntil<previewTime || p.hotUntil===undefined)p.absorbed=false;
      if(p.eligible && s>=edgeDistance && s<beamLength && Math.abs(offset)<2 &&
        fract(p.seed*.754877666)<gaussian(offset)){p.absorbed=true;p.hotUntil=previewTime+5;}
    }
  }
  function prepareCloud(angle){
    const rad=angle*Math.PI/180;
    beamDx=Math.cos(rad); beamDy=-Math.sin(rad);
    drawBeamEnvelope();
    const origin='translate('+(axisX-62*beamDx)+' '+(targetY-62*beamDy)+')';
    launcher.setAttribute('transform',origin+' rotate('+(180-angle)+')');
    pulse.setAttribute('transform',origin+' rotate('+(-angle)+')');
    waveSpacing=13*ECCD.cyclotron/Number(el('frequency').value);
    for(const p of electrons){
      p.hotUntil=undefined;
      p.eligible=p.threshold<calc.selection(p.speed*p.sign);
    }
  }
  let previewTime=0, previewFrame=0, lastPreview=null;
  function stopPreview(){
    cancelAnimationFrame(previewFrame);previewFrame=0;lastPreview=null;
  }
  function preview(now){
    if(lastPreview!==null) previewTime+=Math.min(now-lastPreview,100)/650;
    lastPreview=now;
    capturePulse(); drawEnsemble();
    if(dopplerVisible)drawDoppler();
    previewFrame=requestAnimationFrame(preview);
  }
  function drawEnsemble(){
    pulse.setAttribute('opacity',1);
    crests.forEach((crest,i)=>{
      const s=(i+fract((previewTime+elapsed+cycles*.1)*3))*waveSpacing;
      const half=.9*beamWidth(s);
      crest.setAttribute('d',s>beamLength?'':'M'+s+' '+(-half)+'q3 '+half+' 0 '+(2*half));
      crest.setAttribute('opacity',.55*Math.min(1,Math.max(0,(beamLength-s)/15)));
    });
    for(const p of electrons){
      const radius=major+(p.y-.5)*40;
      const initialPhi=2*Math.PI*p.x+p.sign*p.speed*previewTime*34/radius;
      const hit=p.absorbed;
      if(p.painted!==hit){
        p.painted=hit;
        const visible=hit||p.background;
        p.body.setAttribute('visibility',visible?'visible':'hidden');
        p.trail.setAttribute('visibility',visible?'visible':'hidden');
        p.body.setAttribute('fill',hit?(p.sign>0?'#ffc351':'#db8ce1'):'#4981b7');
        p.body.setAttribute('stroke',hit?'#85510e':'#316796');
        p.body.setAttribute('opacity',hit?1:.34);p.body.setAttribute('r',hit?3.1:1.3);
        p.trail.setAttribute('opacity',hit?1:.31);
        p.trail.setAttribute('stroke',hit?(p.sign>0?'#ad6406':'#933a98'):'#56799a');
      }
      if(!hit&&!p.background)continue;
      const direction=p.sign, phi=initialPhi;
      const phase=p.phase+(previewTime+elapsed)*8;
      const at=age=>{
        const r=radius+(hit && elapsed>0?2.8:1.6)*Math.sin(phase-8*age);
        const theta=phi-direction*p.speed*34*age/radius;
        return [axisX+r*Math.sin(theta),axisY+r*Math.cos(theta)];
      };
      const [x,y]=at(0);p.body.setAttribute('cx',x);p.body.setAttribute('cy',y);
      let d='';
      for(let i=6;i>=0;i--)d+=(i===6?'M':'L')+at(i*.055).map(v=>v.toFixed(1)).join(' ');
      p.trail.setAttribute('d',d);
    }
    math(el('cloud-state'),'\\text{Zasaženo }'+(100*calc.heated<.1?'{}<0{,}1':fmt(100*calc.heated,1))+'\\,\\%');

  }
  const relaxation=el('relax-detail');
  node(relaxation,'text',{x:220,y:206,'text-anchor':'middle'},'Pohyb elektronů');
  node(relaxation,'text',{x:460,y:206,'text-anchor':'middle'},'Vlečený proud');
  const flowArrows=node(relaxation,'g');
  const flowCenter=282, currentCenter=538;
  label(relaxation,15,19,'Skupina elektronů');
  label(relaxation,168,19,'← Proti poli');
  label(relaxation,308,19,'Po poli →');
  label(relaxation,460,19,'Příspěvek k proudu');
  const balanceRows=['Výběr pro ohřev','Ostatní elektrony','Celý soubor'].map((title,i)=>{
    const y=46+i*54, color=['#9d642a','#456888',green][i];
    node(relaxation,'rect',{x:6,y:y-16,width:668,height:47,rx:6,fill:['#fbf5e9','#f0f5fa','#eaf5f1'][i]});
    node(relaxation,'rect',{x:6,y:y-10,width:3,height:35,rx:1.5,fill:color});
    const name=node(relaxation,'text',{x:17,y:y+10},title);
    const left=node(relaxation,'rect',{y:y+14,height:7,rx:3,fill:'#866698'});
    const right=node(relaxation,'rect',{x:flowCenter+1,y:y+14,height:7,rx:3,fill:'#c39042'});
    const leftLabel=mathLabel(relaxation,160,y-10,114,'0',ink,'right');
    const rightLabel=mathLabel(relaxation,290,y-10,114,'0');
    line(relaxation,'M'+flowCenter+' '+(y+10)+'v15','#7b8992',1);
    const value=mathLabel(relaxation,426,y-12,224,'0',color,'center');
    line(relaxation,'M428 '+(y+19)+'h220','#c3cfd3');
    const direction=node(relaxation,'g');
    dot(relaxation,currentCenter,y+19,2.4,color);
    return {name,left,right,leftLabel,rightLabel,value,direction,y,color};
  });
  function drawBalance(){
    const [hot,cold]=calc.populations(elapsed);
    const total={left:hot.left+cold.left,right:hot.right+cold.right,mean:hot.mean+cold.mean};
    balanceRows[0].name.textContent='Ohřáté elektrony';
    [hot,cold,total].forEach((group,i)=>{
      const row=balanceRows[i], leftShare=group.left/(group.left+group.right);
      const leftWidth=112*leftShare;
      row.left.setAttribute('x',flowCenter-1-leftWidth);
      row.left.setAttribute('width',leftWidth);
      row.right.setAttribute('width',112*(1-leftShare));
      math(row.leftLabel,fmt(100*leftShare,1)+'\\,\\%');
      math(row.rightLabel,fmt(100*(1-leftShare),1)+'\\,\\%');
      const current=-group.mean;
      math(row.value,fmt(current,3)+'\\,J_0');
      row.direction.replaceChildren();
      arrow(row.direction,currentCenter,row.y+19,current*620,0,row.color,4);
    });
    el('relax-key').textContent=heating?'Během ohřevu se příspěvky obou skupin k proudu přesně ruší.':
      Math.abs(calc.current(1))<1e-12?'Oba směry jsou stejně zastoupené. Celkový proud je nulový.':
      'Ohřáté elektrony si déle uchovají původní směr. Jejich příspěvek k proudu převáží.';
  }
  function makeChart(svg, horizontal, vertical, xLabel, yLabel, xTicks, yTicks) {
    svg.replaceChildren();
    const w = svg.clientWidth, h = svg.clientHeight;
    const left = 57, right = w - 16, top = 30, bottom = h - 45;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    const x = u => left + (right-left)*(u-horizontal[0])/(horizontal[1]-horizontal[0]);
    const y = v => bottom - (bottom-top)*(v-vertical[0])/(vertical[1]-vertical[0]);
    node(svg, 'rect', {x:left, y:top, width:right-left, height:bottom-top, fill:'#f7fafb', stroke:'#bdccd5'});
    for (const value of xTicks) {
      line(svg, 'M' + x(value) + ' ' + top + 'V' + bottom, value === 0 ? '#9aaeb9' : '#dce5e9');
      mathLabel(svg, x(value)-17, bottom+3, 34, fmt(value), ink, 'center');
    }
    for (const value of yTicks) {
      line(svg, 'M' + left + ' ' + y(value) + 'H' + right, value === 0 ? '#91a4af' : '#dce5e9');
      mathLabel(svg, 0, y(value)-10, left-7, fmt(value, 3), ink, 'right');
    }
    mathLabel(svg, left+1, 0, 215, yLabel);
    mathLabel(svg, (left+right)/2-70, bottom+21, 140, xLabel, ink, 'center');
    return {svg, x, y};
  }
  const elapsed=5, cycles=ECCD.pulseCycles, heating=false;
  let calc;
  const velocityPlot=el('parallel-profile');
  let velocityAxes, baseline, perturbed, deviation, deltaArea;
  function setupVelocityAxes(){
    if(velocityPlot.style.display==='none' || !velocityPlot.clientWidth)return;
    velocityAxes=makeChart(velocityPlot,[-3,3],[-.45,1.3],'v_\\parallel/v_{\\mathrm{th}}','f_\\parallel/f_{\\max}',[-3,-2,-1,0,1,2,3],[0,.5,1]);
    deltaArea=node(velocityPlot,'path',{fill:'#f3cf89',stroke:'#a3681d','stroke-width':1.3});
    deviation=node(velocityPlot,'path',{fill:'#edbc4e',opacity:.85});
    baseline=line(velocityPlot,'','#28343d',4);
    baseline.setAttribute('stroke-dasharray','7 3');
    perturbed=line(velocityPlot,'','#bd4745',2);
    drawVelocityProfile();
  }
  function drawVelocityProfile(){
    if(velocityPlot.style.display==='none' || !velocityAxes)return;
    const samples=calc.distribution(elapsed).filter((p,i)=>Math.abs(p.u)<=3 && i%2===0);
    const coords=key=>samples.map(p=>velocityAxes.x(p.u).toFixed(2)+' '+velocityAxes.y(p[key]*Math.sqrt(Math.PI)).toFixed(2));
    const delta=samples.map(p=>velocityAxes.x(p.u).toFixed(2)+' '+velocityAxes.y(4*p.delta*Math.sqrt(Math.PI)).toFixed(2));
    deltaArea.setAttribute('d','M'+velocityAxes.x(-3)+' '+velocityAxes.y(0)+'L'+delta.join('L')+'L'+velocityAxes.x(3)+' '+velocityAxes.y(0)+'Z');
    const before=coords('equilibrium'), after=samples.map(p=>velocityAxes.x(p.u).toFixed(2)+' '+velocityAxes.y((p.equilibrium+4*p.delta)*Math.sqrt(Math.PI)).toFixed(2));
    baseline.setAttribute('d','M'+before.join('L'));
    perturbed.setAttribute('d','M'+after.join('L'));
    deviation.setAttribute('d','M'+before.join('L')+'L'+after.reverse().join('L')+'Z');
  }
  const energyPlot=el('energy-detail');
  let energyAxes;
  // With zero initial perpendicular velocity, the squared kick gives the gyrophase average.
  const meanPerpendicularGain=(u,periods=cycles)=>calc.pulseState(u,periods,0).gain;
  function energyPath(periods){
    return 'M'+Array.from({length:181},(_,i)=>{
      const u=(i-90)/30;
      return energyAxes.x(u).toFixed(2)+' '+energyAxes.y(meanPerpendicularGain(u,periods)).toFixed(2);
    }).join('L');
  }
  function setupEnergy(){
    if(!energyPlot.clientWidth || energyPlot.style.display==='none')return;
    energyAxes=makeChart(energyPlot,[-3,3],[0,.6],'v_\\parallel/v_{\\mathrm{th}}','\\langle\\Delta W_\\perp\\rangle\\;(\\mathrm{keV})',[-3,-2,-1,0,1,2,3],[0,.2,.4,.6]);
    if(calc.resonantU!==null && Math.abs(calc.resonantU)<=3){
      const x=energyAxes.x(calc.resonantU);
      line(energyPlot,'M'+x+' '+energyAxes.y(0)+'V'+energyAxes.y(.6),'#566b78',1.3).setAttribute('stroke-dasharray','4 3');
    }
    line(energyPlot,energyPath(cycles),electric,2.8);
  }
  function renderTime() {
    const j=calc.current(elapsed);
    el('torus-stage').textContent=heating ? 'Vlna dodává kolmou energii' :
      Math.abs(calc.current(1))<1e-12 ? 'Oba směry relaxují stejně' : 'Ohřáté elektrony déle drží směr';
    el('current-value').hidden=heating;
    math(el('current-value'), 'J_\\parallel/J_0=' + fmt(j,3));
    showRingCurrent(j);
    tangentFlows.replaceChildren();
    for(const [y,dx,color] of [[283,-j*1100,'#126bc3'],[308,j*1100,green]]){
      line(tangentFlows,'M270 '+y+'h98','#bdcad2');
      dot(tangentFlows,319,y,2,color);
      arrow(tangentFlows,319,y,dx,0,color,3.2);
    }
    flowArrows.replaceChildren();
    for(const [x,dx,color] of [[220,-j*1200,'#126bc3'],[460,j*1200,green]]){
      line(flowArrows,'M'+(x-72)+' 220h144','#bac9ce');
      dot(flowArrows,x,220,2.7,color);arrow(flowArrows,x,220,dx,0,color,4);
    }
    drawBalance();
    drawThermalPatch();
    drawVelocityProfile();
    drawEnsemble();

  }
  function refresh() {
    const angle = Number(el('angle').value), frequency = Number(el('frequency').value);
    calc = ECCD.experiment(angle, frequency,400,true);
    setupEnergy();
    const target=ECCD.cyclotron/(1-ECCD.thermalOverC*Math.abs(calc.parallel));
    const tuned=Math.round(target*2)/2;
    el('tune').textContent='Naladit '+String(tuned).replace('.',',')+' GHz';
    el('tune').onclick=()=>{el('frequency').value=tuned;refresh();};
    const u=calc.resonantU;
    el('tuning-state').textContent=u===null ? (frequency===ECCD.cyclotron?'Kolmý ohřev obou směrů':'Mimo cyklotronní rezonanci') :
      Math.abs(u)>1.7?'Rezonance v řídce obsazeném ocasu rozdělení':Math.abs(u)<.15?'Ohřev obou směrů u nulové rychlosti':'Rezonance v obsazené části rozdělení';
    prepareCloud(angle); capturePulse();
    const hot=calc.populations(0)[0];
    math(localResonance,calc.resonantU===null?'k_\\parallel=0':
      'v_{\\parallel,\\mathrm{rez}}='+fmt(calc.resonantU,2)+'\\,v_{\\mathrm{th}}');
    math(hotShare,'\\text{Z ohřátých po poli: }'+fmt(100*hot.right/calc.heated,1)+'\\,\\%');
    math(el('angle-value'), '\\chi=' + fmt(angle) + '^\\circ');
    math(el('frequency-value'), 'f=' + fmt(frequency) + '\\,\\mathrm{GHz}');
    if(dopplerVisible)refreshDoppler();
    renderTime();
  }
  function aim(){refresh();}
  el('angle').oninput=el('frequency').oninput=aim;
  let drag=null;
  const normalAngle=90,snapEntry=6,snapExit=12,snapReach=24;
  function pointerAngle(event){
    const position=ensemble.createSVGPoint();
    position.x=event.clientX;
    position.y=event.clientY;
    const local=position.matrixTransform(overview.getScreenCTM().inverse());
    return Math.atan2(Math.max(0,local.y-targetY),axisX-local.x)*180/Math.PI;
  }
  grip.onpointerdown=event=>{
    if(event.button!==0 || drag)return;
    const angle=Number(el('angle').value);
    drag={id:event.pointerId,offset:angle-pointerAngle(event),snapped:angle===normalAngle};
    ensemble.setPointerCapture(event.pointerId);
    ensemble.classList.add('dragging');
    event.preventDefault();
  };
  ensemble.onpointermove=event=>{
    if(drag?.id!==event.pointerId)return;
    const slider=el('angle');
    const requested=pointerAngle(event)+drag.offset,offset=requested-normalAngle;
    const distance=Math.abs(offset),threshold=drag.snapped?snapExit:snapEntry;
    drag.snapped=distance<=threshold;
    const blend=Math.max(0,Math.min(1,(distance-threshold)/(snapReach-threshold)));
    const angle=normalAngle+offset*blend*blend*(3-2*blend);
    const next=Math.max(Number(slider.min),Math.min(Number(slider.max),Math.round(angle)));
    if(next===Number(slider.value))return;

    slider.value=next;
    aim();
  };
  ensemble.onpointerup=ensemble.onpointercancel=ensemble.onlostpointercapture=event=>{
    if(drag?.id!==event.pointerId)return;
    drag=null;
    ensemble.classList.remove('dragging');
    if(ensemble.hasPointerCapture(event.pointerId))ensemble.releasePointerCapture(event.pointerId);

  };
  el('mirror').onclick = () => { el('angle').value = 180 - Number(el('angle').value); aim(); };
  el('normal').onclick = () => { el('angle').value = 90; el('frequency').value = ECCD.cyclotron; aim(); };
  el('reset').onclick = () => {

    el('angle').value = 65; el('frequency').value = 115;
    aim();
  };
  let dopplerVisible=false;
  const dopplerScene=el('doppler-scene');
  const laneX=72,laneY=33,laneWidth=347,laneHeight=245;
  const waveCenterX=laneWidth/2,waveCenterY=laneHeight/2;
  const stripX=433,stripWidth=43;
  const velocityY=u=>waveCenterY+35*u;
  const noGain=[237,241,244], fullGain=[184,63,50];
  const gainLimit=(2*Math.PI*cycles*ECCD.acceleration)**2;
  math(el('doppler-gain-max'),fmt(gainLimit,2)+'\\,\\mathrm{keV}');
  const dopplerDefs=node(dopplerScene,'defs');
  const gainGradient=node(dopplerDefs,'linearGradient',{id:'eccd-doppler-gain',gradientUnits:'userSpaceOnUse',
    x1:stripX,x2:stripX,y1:laneY+velocityY(-3),y2:laneY+velocityY(3)});
  const gainStops=Array.from({length:121},(_,i)=>({
    u:i/20-3,stop:node(gainGradient,'stop',{offset:i/120})
  }));
  mathLabel(dopplerScene,4,5,64,'v_\\parallel/v_{\\mathrm{th}}',ink,'center');
  label(dopplerScene,laneX,21,'Vlnoplochy');
  mathLabel(dopplerScene,laneX+laneWidth-81,5,24,'\\mathbf{B}',magnetic,'center');
  arrow(dopplerScene,laneX+laneWidth-51,16,49,0,magnetic,2);
  mathLabel(dopplerScene,stripX-4,5,stripWidth+8,'\\langle\\Delta W_\\perp\\rangle',ink,'center');
  mathLabel(dopplerScene,484,5,80,"f'\\;(\\mathrm{GHz})",ink,'center');
  const lanes=node(dopplerScene,'svg',{x:laneX,y:laneY,width:laneWidth,height:laneHeight,
    viewBox:'0 0 '+laneWidth+' '+laneHeight,overflow:'hidden'});
  node(lanes,'rect',{width:laneWidth,height:laneHeight,fill:'#f2f6f9'});
  for(let u=-3;u<=3;u++){
    const y=velocityY(u);
    line(lanes,'M0 '+y+'H'+laneWidth,u===0?'#b4c3d0':'#d3dfe7');
  }
  const dopplerWaves=node(lanes,'g',{opacity:.62});
  const waveStep=49, waveRate=1.6;
  for(let n=-7;n<=7;n++)line(dopplerWaves,'M'+(n*waveStep)+' -260v520',electric,1.6);
  node(dopplerScene,'rect',{x:stripX,y:laneY,width:stripWidth,height:laneHeight,
    rx:4,fill:'url(#eccd-doppler-gain)',stroke:'#c4d0d7'});
  const gainPointer=line(dopplerScene,'','#253848',2);
  const electronsPerRow=5;
  const dopplerRows=Array.from({length:7},(_,i)=>{
    const u=i-3, y=velocityY(u);
    mathLabel(dopplerScene,4,laneY+y-10,64,(u>0?'+':'')+fmt(u),ink,'center');
    const row=node(lanes,'g',{'data-velocity':u});
    const particles=Array.from({length:electronsPerRow},(_,j)=>{
      const marker=node(row,'g');
      const flash=node(marker,'circle',{r:11,fill:'none',stroke:electric,'stroke-width':2});
      node(marker,'circle',{r:6,stroke:'#334957','stroke-width':1.3});
      arrow(marker,Math.sign(u)*9,0,u*6,0,ink,1.8);
      return {marker,flash,start:(j+.5)/electronsPerRow+.02*u};
    });
    const reading=mathLabel(dopplerScene,484,laneY+y-10,80,'0',ink,'center');
    return {u,y,row,particles,reading};
  });
  function gainColor(u){
    const fraction=Math.min(1,meanPerpendicularGain(u)/gainLimit);
    return 'rgb('+noGain.map((channel,i)=>
      Math.round(channel+(fullGain[i]-channel)*fraction)).join(',')+')';
  }
  function refreshDoppler(){
    const f=Number(el('frequency').value);
    for(const {u,stop} of gainStops)stop.setAttribute('stop-color',gainColor(u));
    for(const {u,row,reading} of dopplerRows){
      row.setAttribute('fill',gainColor(u));
      math(reading,fmt(f*(1-u*calc.parallel*ECCD.thermalOverC),2));
    }
    const u=calc.resonantU;
    gainPointer.setAttribute('d',u===null||Math.abs(u)>3?'':'M'+(stripX+stripWidth+5)+' '+(laneY+velocityY(u))+'h-11');
    drawDoppler();
  }
  let dopplerStart=0;
  function drawDoppler(){
    const f=Number(el('frequency').value), angle=Number(el('angle').value);
    const t=previewTime-dopplerStart;
    const speed=waveStep*waveRate*ECCD.thermalOverC;
    const spacing=waveStep*ECCD.cyclotron/f, periods=t*waveRate*f/ECCD.cyclotron;
    const fieldY=Math.sin(angle*Math.PI/180);
    dopplerWaves.setAttribute('transform','translate('+waveCenterX+' '+waveCenterY+') rotate('+(-angle)+
      ') scale('+(spacing/waveStep)+' 1) translate('+(waveStep*fract(periods))+' 0)');
    for(const {u,y,particles} of dopplerRows){
      const travel=t*speed*u/laneWidth;
      for(const {marker,flash,start} of particles){
        const x=laneWidth*fract(start+travel);
        // This is the phase of the visible wave at the marker's current position.
        const phase=fract(periods-((x-waveCenterX)*calc.parallel-(y-waveCenterY)*fieldY)/spacing);
        marker.setAttribute('transform','translate('+x+' '+y+')');
        flash.setAttribute('opacity',Math.exp(-120*Math.min(phase,1-phase)**2));
      }
    }
  }
  el('doppler-help').onclick=()=>{
    dopplerStart=previewTime;
    dopplerVisible=!dopplerVisible;
    el('doppler-help').setAttribute('aria-pressed',String(dopplerVisible));
    el('energy-heading').textContent=dopplerVisible?'Dopplerův posun':'Energie získaná při průchodu svazkem';
    energyPlot.style.display=dopplerVisible?'none':'block';
    el('doppler-scene').style.display=dopplerVisible?'block':'none';
    el('energy-key').hidden=dopplerVisible;
    el('doppler-key').hidden=!dopplerVisible;
    if(dopplerVisible)refreshDoppler(); else setupEnergy();
  };
  el('help').onclick = () => el('guide').showModal();
  document.querySelectorAll('[data-tex]').forEach(span => math(span, span.dataset.tex));
  refresh();
  setupVelocityAxes();
  previewFrame=requestAnimationFrame(preview);
  const resize = new ResizeObserver(()=>{setupVelocityAxes();setupEnergy();});

  resize.observe(velocityPlot);
  resize.observe(energyPlot);
  window.addEventListener('pagehide', () => { stopPreview(); resize.disconnect(); }, {once:true});
})();
