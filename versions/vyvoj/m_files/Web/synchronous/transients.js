(()=>{'use strict';const $=id=>document.getElementById(id),B=SyncTransientBasis,M=SyncTransients.create(B),math=s=>katex.renderToString(s.replaceAll('@',String.fromCharCode(92)),{throwOnError:false}),fmt=x=>x.toFixed(3).replace('.',','),timeAt=v=>.0002*(Math.pow(1+5/.0002,v/100)-1),limitsD=M.limits(0),limitsQ=M.limits(90);let damper=true,view='states',mode='sub',playing=false,raf=0,previous=0,queued=false;
const barsOf=c=>{const b=c.slice(1);return [...b,-b.reduce((a,v)=>a+v,0)];},maxF=Math.abs(limitsD.initial[0]),maxK=Math.max(...barsOf(limitsD.initial).map(Math.abs),...barsOf(limitsQ.initial).map(Math.abs));
const historyPlot=$('history');
const firstTime=.001,lastTime=5,timeRatio=lastTime/firstTime;
const histories=[true,false].map(withCage=>Array.from({length:121},(_,i)=>{
 const t=firstTime*Math.pow(timeRatio,i/120);
 return {t,d:M.at(0,'time',t,withCage).x,q:M.at(90,'time',t,withCage).x};
}));
const historyMarks=[[.001,'1@, @mathrm{ms}'],[.01,'10@, @mathrm{ms}'],[.1,'100@, @mathrm{ms}'],[1,'1@, @mathrm{s}'],[5,'5@, @mathrm{s}']];
const historyColors={d:'#985b1d',q:'#007c77'};
function historyLabel(x,y,w,tex,align='center'){
 return '<foreignObject x="'+x+'" y="'+y+'" width="'+w+'" height="22"><div xmlns="http://www.w3.org/1999/xhtml" class="history-label" style="justify-content:'+align+'">'+math(tex)+'</div></foreignObject>';
}
let plotKey='',marker='';
function chart(){
 const width=Math.max(280,historyPlot.clientWidth||640),height=Math.max(240,historyPlot.clientHeight||400);
 const left=52,right=width-34,top=29,bottom=height-56;
 const x=t=>left+Math.log(t/firstTime)/Math.log(timeRatio)*(right-left);
 const y=v=>bottom-v/1.28*(bottom-top);
 const historyIndex=view==='states'||damper?0:1;
 const key=[width,height,historyIndex].join(':');
 if(plotKey!==key){
  plotKey=key;
  historyPlot.setAttribute('viewBox','0 0 '+width+' '+height);
  let svg='<rect x="'+left+'" y="'+top+'" width="'+(right-left)+'" height="'+(bottom-top)+'" rx="4" fill="#f6faf8"/>';
  svg+=historyLabel(left,1,125,'X@;[@mathrm{p.@,j.}]','start');
  for(let i=0;i<=6;i++){
   const v=i/5,py=y(v);
   svg+='<path d="M'+left+' '+py+'H'+right+'" stroke="#d8e4df"/>';
   svg+=historyLabel(0,py-11,left-9,v.toFixed(1).replace('.','{,}'),'end');
  }
  for(const [t,label] of historyMarks){
   const px=x(t);
   svg+='<path d="M'+px+' '+top+'V'+bottom+'" stroke="#d8e4df"/>';
   svg+=historyLabel(px-29,bottom+4,58,label);
  }
  svg+='<path d="M'+left+' '+top+'V'+bottom+'H'+right+'" fill="none" stroke="#657b82"/>';
  svg+=historyLabel((left+right)/2-24,bottom+30,48,'t');
  for(const [axis,color] of Object.entries(historyColors)){
   const d=histories[historyIndex].map((p,i)=>(i?'L':'M')+x(p.t).toFixed(2)+','+y(p[axis]).toFixed(2)).join('');
   svg+='<path data-history-axis="'+axis+'" d="'+d+'" fill="none" stroke="'+color+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"'+(axis==='q'?' stroke-dasharray="8 5"':'')+'/>';
  }
  historyPlot.innerHTML=svg+'<g data-history-cursor></g>';
  marker=null;
 }
 const time=timeAt(+$('time').value);
 let next='';
 if(mode==='time'&&time>=firstTime){
  const px=x(time);
  const history=histories[historyIndex];
  const position=Math.min(history.length-1,Math.log(time/firstTime)/Math.log(timeRatio)*(history.length-1));
  const index=Math.min(history.length-2,Math.floor(position)),weight=position-index;
  next='<path d="M'+px+' '+top+'V'+bottom+'" stroke="#435f58" stroke-width="1.6" stroke-dasharray="6 5"/>';
  for(const [axis,color] of Object.entries(historyColors)){
   const from=history[index][axis],to=history[index+1][axis],value=from+weight*(to-from);
   next+='<circle data-cursor-axis="'+axis+'" cx="'+px+'" cy="'+y(value)+'" r="5.5" fill="'+color+'" stroke="white" stroke-width="2"/>';
  }
 }
 if(next!==marker){
  historyPlot.querySelector('[data-history-cursor]').innerHTML=next;
  marker=next;
 }
}
function draw(){const angle=+$('angle').value,t=timeAt(+$('time').value),a=M.at(angle,mode,t,view==='states'||damper),field=new Float32Array(B.N*B.N);let max=0;for(let i=0;i<field.length;i++){let v=0;for(let j=0;j<a.coefficients.length;j++)v+=a.coefficients[j]*B.fields[j][i];field[i]=v;max=Math.max(max,Math.abs(v));}if(max>0)for(let i=0;i<field.length;i++)field[i]*=1.48/max;
const contours=MagneticContours(field,B.N,B.R,'#007e6c'),s={...SyncPrinciple.create(),type:'salient',rotor:angle*Math.PI/180,field:0,excitation:true,excitationLevel:0,damper:view==='states'||damper,omega:0,fieldOmega:0},bars=barsOf(a.currents),rotorCurrents={field:a.currents[0]/maxF,bars:bars.map(v=>v/maxK)};let art=SyncMachineArt(s,false,{axes:false,forces:false,rotorCurrents},contours.paths+contours.arrows).replace(/<circle cx="512" cy="267" r="14"[\s\S]*?>Bₛ<\/text>/, '');
art+='<g class="delta-b-axis" opacity=".6"><path d="M32 267H528" fill="none" stroke="#007e6c" stroke-width=".9" stroke-dasharray="4 6"/><path d="M38 264L32 267L38 270M522 264L528 267L522 270" fill="none" stroke="#007e6c" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></g>';
for(const [delta,label] of [[0,'d'],[Math.PI/2,'q']]){const theta=s.rotor+delta,c=Math.cos(theta),sn=Math.sin(theta),x1=280+164*c,y1=267-164*sn,x2=280+234*c,y2=267-234*sn,lx=280+260*c,ly=267-242*sn;art+=`<path d="M${x1},${y1}L${x2},${y2}" fill="none" stroke="#5c6f70" stroke-width="1" stroke-dasharray="5 5"/><foreignObject class="rotor-axis-label" data-axis="${label}" x="${lx-13}" y="${ly-14}" width="26" height="28"><div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;height:100%;font-size:19px;color:#304648">${katex.renderToString(label,{throwOnError:true})}</div></foreignObject>`;}
art+='<g class="delta-b-marker"><circle cx="512" cy="267" r="14" fill="#007e6c" stroke="white" stroke-width="2"/><text x="512" y="271" text-anchor="middle" font-size="11" style="fill:white">ΔB</text></g>';$('machine').innerHTML=art;$('angleOut').textContent=angle+'°';$('axisD').setAttribute('aria-pressed',angle===0);$('axisQ').setAttribute('aria-pressed',angle===90);$('timeOut').textContent=mode==='time'?(t<1?(t*1000).toFixed(t<.01?1:0)+' ms':t.toFixed(2)+' s'):mode==='sub'?'0⁺':mode==='steady'?'t → ∞':'mezní stav';$('xValue').textContent=fmt(a.x);$('xName').textContent=mode==='sub'?'X″':mode==='trans'?'X′':mode==='steady'?'X':'X(t)';$('fieldCurrent').textContent=String(Math.round(100*a.currents[0]/maxF))+' %';const peak=Math.max(...bars.map(Math.abs))/maxK;$('cageCurrent').textContent=(100*peak).toFixed(0)+' %';$('fieldMeter').value=Math.min(1,Math.abs(a.currents[0])/maxF);$('cageMeter').value=Math.min(1,peak);
const titles={sub:'Rázový stav',trans:'Přechodný stav',steady:'Ustálený stav',time:'Časová odezva'};$('phaseTitle').textContent=titles[mode];
document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',b.dataset.mode===mode);});chart();window.transientState={angle,mode,t,damper,view,...a,maxField:max};}
function stop(){playing=false;cancelAnimationFrame(raf);$('play').textContent='▶ Přehrát od začátku';}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;draw();});}
$('angle').oninput=schedule;$('time').oninput=()=>{stop();mode='time';schedule();};$('axisD').onclick=()=>{$('angle').value=0;schedule();};$('axisQ').onclick=()=>{$('angle').value=90;schedule();};document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{stop();mode=b.dataset.mode;schedule();});
$('play').onclick=()=>{if(playing){stop();$('play').dataset.paused='true';$('play').textContent='▶ Pokračovat';return;}const resume=$('play').dataset.paused==='true'&&mode==='time'&&+$('time').value>0&&+$('time').value<100;$('play').dataset.paused='false';playing=true;mode='time';if(!resume)$('time').value=0;previous=performance.now();$('play').textContent='❚❚ Pozastavit';function tick(now){if(!playing)return;const dt=now-previous;if(dt>=65){$('time').value=Math.min(100,+$('time').value+dt/100);previous=now;draw();}if(+$('time').value>=100){stop();return;}raf=requestAnimationFrame(tick);}raf=requestAnimationFrame(tick);};
function setView(next){stop();view=next;mode=view==='states'?'sub':'time';$('stateControls').hidden=view!=='states';$('responseControls').hidden=view!=='response';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view));schedule();}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('damper').onchange=()=>{stop();damper=$('damper').checked;mode='time';$('time').value=0;schedule();};
$('eqD').innerHTML=math("X_d''<X_d'<X_d");$('eqQ').innerHTML=math("X_q''<X_q'=X_q");$('valuesD').textContent=[limitsD.sub,limitsD.trans,limitsD.steady].map(fmt).join(' → ')+' p. j.';$('valuesQ').textContent=[limitsQ.sub,limitsQ.trans,limitsQ.steady].map(fmt).join(' → ')+' p. j.';$('eqContinuity').innerHTML=math('@Delta u_r=R_r@Delta i_r+{d@Delta@psi_r@over dt}=0,@qquad@Delta@psi_r(0^+)=0');$('eqPhysics').innerHTML=math("@Delta@boldsymbol@psi_r=L_{rs}@Delta@boldsymbol i_s+L_{rr}@Delta@boldsymbol i_r,@qquad L_{rr}{d@Delta@boldsymbol i_r@over dt}+R_r@Delta@boldsymbol i_r=0")+'<br>'+math("X=@omega{@Delta@psi_s@over@Delta i_s},@qquad L_s''=L_{ss}-L_{sr}L_{rr}^{-1}L_{rs}");$('historyD').innerHTML=math('X_d');$('historyQ').innerHTML=math('X_q');draw();new ResizeObserver(()=>chart()).observe(historyPlot);document.fonts.ready.then(schedule);window.addEventListener('pagehide',stop);
})();
