/* Playback only. All field lines and Boris trajectories come from offline data. */
(()=>{'use strict';
const script=document.currentScript,base=script.src||new URL(script.dataset.fusionSource,document.baseURI).href;
// Smooth interpolation of stored Boris samples; no field solve or added drift.
const playback=window.HelicityPlayback={
 tangents(values){const n=values.length/6,out=new Float32Array(values.length);for(let i=0;i<n;i++)for(let k=0;k<6;k++){const at=j=>values[j*6+k];out[i*6+k]=i===0?(-3*at(0)+4*at(1)-at(2))/2:i===n-1?(3*at(i)-4*at(i-1)+at(i-2))/2:i>=2&&i<n-2?(at(i-2)-8*at(i-1)+8*at(i+1)-at(i+2))/12:(at(i+1)-at(i-1))/2;}return out;},
 sample(values,tangents,frame,offset=0){const n=values.length/6-1,j=Math.min(n,Math.max(0,Math.floor(frame))),f=Math.max(0,Math.min(1,frame-j));return [0,1,2].map(k=>{const a=j*6+offset+k;if(j===n)return values[a];return (2*f**3-3*f*f+1)*values[a]+(f**3-2*f*f+f)*tangents[a]+(-2*f**3+3*f*f)*values[a+6]+(f**3-f*f)*tangents[a+6];});},
 trace(ctx,values,tangents,frame,offset,project){const end=Math.min(values.length/6-1,Math.max(0,frame));ctx.beginPath();const start=project(Array.from(values.subarray(offset,offset+3)));ctx.moveTo(start[0],start[1]);for(let j=0;j<Math.ceil(end);j++){const f=Math.min(1,end-j),a=j*6+offset,p=Array.from(values.subarray(a,a+3)),c1=p.map((v,k)=>v+tangents[a+k]/3),c2=p.map((_,k)=>values[a+6+k]-tangents[a+6+k]/3),left1=project(p.map((v,k)=>v+(c1[k]-v)*f)),left2=project(p.map((v,k)=>(1-f)**2*v+2*f*(1-f)*c1[k]+f*f*c2[k])),tip=project(this.sample(values,tangents,j+f,offset));ctx.bezierCurveTo(...left1.slice(0,2),...left2.slice(0,2),...tip.slice(0,2));}ctx.stroke();}
};
window.createHelicityLesson=({$,tex,label,ctx,gc,gpu})=>{
 const unroll=window.createSurfaceUnroll?.($,tex);
 const H=HelicityModel,blue='#356ac3',orange='#bb702f',green='#278578',electric='#b57825',electricRows=new Map(),bananaRows=new Map(),rows=new Map(),buffers=new Map(),frames=new Map();
 let active=false,disposed=false,loaded=false,loading=false,failed=false,partCount=0,i=20,u=0,now=0,previous=0,t=0,running=false,transition=null,held=null,drawKey='',background=null,staticObjects=[],current=null,pitchDeg=70;
 const presets=[['hDemoDrift','drift'],['hDemoOrbit','orbit'],['hDemoBanana','banana']];
 const duration=()=>current?(current.endFrame??(current.path.length/6-1))*current.dt:76.8e-6;
 const num=(v,n=2)=>Number(v.toFixed(n)).toString().replace('.','{,}');
 const nearest=(list,value)=>list.reduce((best,x)=>Math.abs(x.u-value)<Math.abs(best.u-value)?x:best,list[0]);
 // Axisymmetric b·grad(B): the radial profile is constant along B.
 // Since b_R=-B_theta*z/(r*B), dB/ds=B_theta*z/(r*R).
 const mirrorGrids=new Map();
 function mirrorGrid(meta){const key=[meta.u,meta.fieldScale].join(':');if(mirrorGrids.has(key))return mirrorGrids.get(key);
  const n=112,step=2*H.a/n,B=[],G=[],zRows=[],gain=(meta.fieldScale||1)*H.B0*Math.sin(H.angle(meta.u))*H.R;let max=0,lo=Infinity,hi=-Infinity;
  for(let j=0;j<=n;j++){const z=-H.a+j*step;zRows.push(z);for(let i=0;i<=n;i++){const x=-H.a+i*step,r=Math.hypot(x,z),R=H.R+x,k=j*(n+1)+i;B[k]=(meta.fieldScale||1)*Math.hypot(...H.field(meta.u,R,0,z));G[k]=r?gain*H.profile(r/H.a)*z/(r*R*R):0;if(r<=H.a){max=Math.max(max,Math.abs(G[k]));lo=Math.min(lo,B[k]);hi=Math.max(hi,B[k]);}}}
  const out={n,step,B,G,zRows,max,lo,hi};mirrorGrids.set(key,out);return out;
 }
 function mapColor(u){const stops=[[0,0,255],[0,180,255],[0,220,100],[255,255,0],[255,128,0],[255,0,0]],t=Math.max(0,Math.min(1,u))*5,i=Math.min(4,Math.floor(t)),f=t-i;return 'rgb('+stops[i].map((v,j)=>Math.round(v+(stops[i+1][j]-v)*f)).join(',')+')';}
 function prepareMirrorMap(meta){
  const canvas=document.createElement('canvas'),size=448,c=canvas.getContext('2d');canvas.width=canvas.height=size;
  const d=meta.detail,m=3.3435837768e-27,e=1.602176634e-19,K=.5*m*(d[1]**2+d[2]**2),mu=.5*m*d[2]**2/d[0],grid=mirrorGrid(meta),{n,step,B,G,zRows,max}=grid;meta.gradientMax=max;meta.fieldBounds=[grid.lo,grid.hi];meta.mirrorB=K/mu;
  const v=B.map((b,k)=>(K+e*(meta.electricZ||0)*zRows[Math.floor(k/(n+1))]-mu*b)/K),point=(i,j)=>[i*size/n,size-j*size/n];
  c.save();c.beginPath();c.arc(size/2,size/2,size/2,0,2*Math.PI);c.clip();
  // Same quantitative ANSYS-style rainbow as the other confinement maps.
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=j*(n+1)+i,Bmean=(B[k]+B[k+1]+B[k+n+1]+B[k+n+2])/4,x=i*4,y=size-(j+1)*4;c.fillStyle=mapColor((Bmean-grid.lo)/(grid.hi-grid.lo));c.fillRect(x,y,4,4);if(v[k]<0&&(i+j)%4===0){c.strokeStyle='rgba(24,28,32,.4)';c.lineWidth=1;c.beginPath();c.moveTo(x,y+4);c.lineTo(x+4,y);c.stroke();}}
  c.strokeStyle='#30363b';c.lineWidth=2.5;c.beginPath();
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=j*(n+1)+i,p=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],values=[v[k],v[k+1],v[k+n+2],v[k+n+1]],cross=[];for(let a=0;a<4;a++){const b=(a+1)%4;if((values[a]<0)===(values[b]<0))continue;const f=values[a]/(values[a]-values[b]);cross.push(point(p[a][0]+f*(p[b][0]-p[a][0]),p[a][1]+f*(p[b][1]-p[a][1])));}for(let a=0;a+1<cross.length;a+=2){c.moveTo(...cross[a]);c.lineTo(...cross[a+1]);}}
  c.stroke();c.restore();return canvas;
 }
 function decode(meta){if(frames.has(meta.id))return frames.get(meta.id);const source=buffers.get(meta.dataPart??Math.floor(meta.i/3)),values=new Float32Array(meta.lineLength+meta.pathLength);for(let j=0;j<values.length;j++)values[j]=source[meta.offset+j]*meta.scale;const points=[];for(let j=0;j<meta.lineLength;j+=3)points.push([values[j],values[j+1],values[j+2]]);const arc=[0];for(let j=1;j<points.length;j++)arc.push(arc[j-1]+Math.hypot(...points[j].map((v,k)=>v-points[j-1][k])));const out={...meta,q:H.q(meta.u,meta.r),points,arc,path:values.subarray(meta.lineLength)};if(meta.banana)out.sectionMap=prepareMirrorMap(out);out.closure=[1,1.5,2,3].find(Q=>Math.abs(out.q-Q)<1e-9)||0;out.tangents=playback.tangents(out.path);frames.set(meta.id,out);if(frames.size>5)frames.delete(frames.keys().next().value);return out;}
 function pick(){load();if(!loaded)return;const index=selectedIndex(),meta=!transition&&$('hScenario').value==='banana'?bananaRows.get([$('hElectric').checked?-500:0,index,pitchDeg].join(':')):nearest(($('hElectric').checked?electricRows:rows).get(index),u);if(current?.id!==meta.id){current=decode(meta);drawKey='';}if(!transition){i=index;u=meta.u;}}
 // Fetch only the selected radius and field regime. Preset transitions prepare
 // their intermediate radii before their animation starts; samples stay unchanged.
 const requests=new Map();let loadGeneration=0,needed=[];
 const dataKey=(index,banana=false)=>banana?'b-'+($('hElectric').checked?-500:0)+'-'+index:($('hElectric').checked?'e':'m')+'-'+index;
 const selectedIndex=()=>!transition&&$('hScenario').value==='banana'?Math.max(2,Math.min(20,2*Math.round(i/2))):Math.max(0,Math.min(20,Math.round(i)));
 function required(){
  if(!transition)return [dataKey(selectedIndex(),$('hScenario').value==='banana')];
  const out=[];for(let n=Math.min(Math.round(transition.fromI),transition.toI);n<=Math.max(Math.round(transition.fromI),transition.toI);n++)out.push(dataKey(n));
  if($('hScenario').value==='banana')out.push(dataKey(transition.toI,true));return out;
 }
 function clearRequests(){for(const {el,timer} of requests.values()){clearTimeout(timer);el.onload=el.onerror=null;el.remove();}requests.clear();}
 function load(){
  if(disposed)return;needed=required();
  if(needed.every(key=>buffers.has(key))){loaded=true;loading=false;failed=false;return;}
  loaded=false;if(loading||failed)return;loading=true;const generation=++loadGeneration,queue=needed.filter(key=>!buffers.has(key));partCount=needed.length-queue.length;update();
  function fail(){if(disposed||generation!==loadGeneration)return;clearRequests();loading=false;failed=true;update();}
  function pump(){
   if(disposed||generation!==loadGeneration||failed)return;
   if(!queue.length&&!requests.size){
    loading=false;loaded=true;
    // Bound decoded data memory after visiting many radii and scenarios.
    for(const key of buffers.keys()){if(buffers.size<=24)break;if(needed.includes(key))continue;buffers.delete(key);for(const map of [rows,electricRows])for(const [index,list] of map)if(list[0]?.dataPart===key)map.delete(index);for(const [id,meta] of bananaRows)if(meta.dataPart===key)bananaRows.delete(id);}
    pick();update();return;
   }
   while(queue.length&&requests.size<2){
    const key=queue.shift(),el=document.createElement('script'),timer=setTimeout(fail,60000);requests.set(key,{el,timer});
    el.src=new URL('helicity-chunks/'+key+'.js',base).href;
    el.onload=()=>{if(disposed||generation!==loadGeneration)return;try{
     const raw=window.HiFyzikoHelicityData?.[key];if(!raw||!raw.states?.length||!raw.data)throw Error('Missing helicity samples');
     const binary=atob(raw.data),bytes=new Uint8Array(binary.length);for(let j=0;j<binary.length;j++)bytes[j]=binary.charCodeAt(j);
     buffers.set(key,new Int16Array(bytes.buffer));
     for(const meta of raw.states){if(meta.banana)bananaRows.set([meta.electricZ,meta.i,meta.pitchDeg].join(':'),meta);else{const map=meta.electricZ?electricRows:rows;if(!map.has(meta.i))map.set(meta.i,[]);map.get(meta.i).push(meta);}}
     delete window.HiFyzikoHelicityData[key];clearTimeout(timer);el.remove();requests.delete(key);partCount++;pump();
    }catch(error){fail();}};
    el.onerror=fail;document.head.append(el);
   }
  }
  pump();
 }
 function update(){if(!active)return;for(const [id,value] of presets){$(id).disabled=!loaded;$(id).setAttribute('aria-pressed',String($('hScenario').value===value));}$('helixControls').hidden=false;$('hLoad').hidden=loaded;$('hProgress').removeAttribute?.('value');$('hProgress').hidden=failed;$('hLoadValue').hidden=true;$('hLoadText').textContent=failed?'Data se nepodařilo načíst.':'Načítání vybraného pokusu';$('hRetry').hidden=!failed;tex($('hLoadValue'),num(partCount/18*100,0)+String.raw`\,\%`);for(const id of ['hScenario','hMix','hRadius','hQ1','hQ15','hQ2','hQ3'])$(id).disabled=!loaded||(!['hScenario','hRadius'].includes(id)&&!!current?.banana);$('play').disabled=!loaded||!!transition;$('reset').disabled=!loaded;$('play').textContent=running?'Pauza':t>=duration()?'Přehrát znovu':'Spustit';
  const banana=!!current?.banana;$('hMixRow').hidden=banana;$('hQStops').hidden=banana;$('hPitchRow').hidden=!banana;$('hPitch').disabled=!loaded||!!transition;$('hPitch').value=String(pitchDeg);tex($('hPitchValue'),String.raw`\alpha_0=`+num(pitchDeg,0)+String.raw`^\circ`);$('hRadius').min=banana?'2':'0';$('hRadius').step=banana?'2':'1';$('hRadiusCaption').textContent=banana?'Počáteční plocha':'Vybraná magnetická plocha';
  $('hElectric').disabled=!loaded||!!transition;tex($('hElectricValue'),String.raw`E_z=-500\,\mathrm{V/m}`);$('hElectricValue').style.visibility=current?.electricZ?'visible':'hidden';$('hMix').value=String(u);$('hRadius').value=String(i);const r=current?.r||H.radius(Math.round(i)),Q=current?.q;tex($('hRadiusValue'),'r/a='+num(r/H.a,3)+(banana?String.raw`\quad q=`+num(Q,3):''));const ratio=u>=1?Infinity:Math.tan(H.angle(u))*H.profile(r/H.a);tex($('hMixValue'),'B_{\\mathrm P}/B_{\\mathrm T}='+(Number.isFinite(ratio)?num(ratio,3):'\\infty'));
  tex($('fieldValue'),'R_0=0{,}89\\,\\mathrm m,\\quad a=0{,}27\\,\\mathrm m');tex($('qValue'),'q='+(Q===null?'\\infty':Number.isFinite(Q)?num(Q,3):'\\text{—}'));tex($('rhoValue'),'I_p\\approx '+num(2*Math.PI*H.a*H.B0*(current?.fieldScale||1)*Math.sin(H.angle(u))*H.R/Math.sqrt(H.R*H.R-H.a*H.a)/(4*Math.PI*1e-7)/1000,1)+'\\,\\mathrm{kA}');tex($('timeValue'),'t='+num(t*1e6,2)+'\\,\\mathrm{\\mu s}');
  const closure=current?.closure;if(banana&&!transition){tex($('hClosure'),'q='+num(Q,3)+(closure?String.raw`\quad\text{uzavřená siločára}`:String.raw`\quad\text{neuzavřený úsek}`));}else{delete $('hClosure').dataset.texValue;$('hClosure').textContent=transition?'Přechod mezi konfiguracemi':u===0?'Čistě toroidální pole':u===1?'Čistě poloidální pole':closure?'Uzavřená siločára · rezonanční plocha':'Helikální pole · zobrazený úsek siločáry';}
  $('hOrbitCount').hidden=false;$('hOrbitCount').style.visibility=(closure||current?.banana)?'visible':'hidden';if(current?.banana)tex($('hOrbitCount'),current.electricZ?String.raw`E_{\mathrm{k},\parallel}\approx0`:String.raw`B_{\text{odraz}}\approx `+num(current.mirrorB,2)+String.raw`\,\mathrm T`);else if(closure)tex($('hOrbitCount'),'\\text{Oběhy: }'+(closure===1.5?'3\\ \\text{toroidální} + 2\\ \\text{poloidální}':num(closure,0)+'\\ \\text{toroidální} + 1\\ \\text{poloidální}'));
  for(const [id,Q]of [['hQ1',1],['hQ15',1.5],['hQ2',2],['hQ3',3]])$(id).setAttribute?.('aria-pressed',String(current?.closure===Q));
  $('mirrorRelation').hidden=!banana;$('mirrorRelation').style.fontSize='12px';$('mirrorRelation').title=current?.electricZ?'Odraz s elektrickým polem':'Odraz bez elektrického pole';$('graphTitle').style.visibility='visible';if(banana)tex($('mirrorRelation'),current.electricZ?String.raw`B\approx\dfrac{E_{\mathrm{k},0}+eE_z z}{\mu_{\text{start}}}`:String.raw`B_{\text{odraz}}\approx\dfrac{B_{\text{start}}}{\sin^2\alpha_0}`);
  $('modelLabel').textContent='Předpočítaná trajektorie · statické výukové pole';$('title').textContent=current?.banana?(current.bounces.length?'Magneticky zachycená částice':'Průběžná částice'):current?.u===0?'Toroidální pole: drift a únik':current?.u===1?'Poloidální magnetické pole':current?.closure?'Helicita: celý oběh siločáry':'Helikální magnetické pole';$('graphTitle').textContent='Poloidální průmět trajektorie';$('colorScale').hidden=true;$('cutControl').hidden=!$('cut').checked;
  $('status').textContent=current&&t>=current.escaped*current.dt&&current.escaped>=0?'Deuteron opustil objem · zrychlený odlet.':t>=duration()?(current?.endReason==='cycle'?'Dokončený poloidální oběh.':'Konec záznamu. Reset vrátí částici.'):'';
 }
 function reset(){transition=null;held=null;pick();running=false;t=0;update();}
 function cancel(){transition=null;held=null;reset();}
 function move(targetU,targetI,scenario){if(!loaded)return;running=false;t=0;transition={fromU:u,fromI:i,toU:targetU,toI:targetI,start:now,duration:1100,scenario};pick();update();}
 function selectScenario(){const scenario=$('hScenario').value,index=12,Q=(scenario==='orbit'||scenario==='banana')?2:0;move(Q?H.snap(Q,H.radius(index)):0,index,scenario);}
 $('hScenario').addEventListener('change',selectScenario);for(const [id,value] of presets)$(id).onclick=()=>{if(!loaded)return;$('hScenario').value=value;selectScenario();};
 for(const [id,Q]of [['hQ1',1],['hQ15',1.5],['hQ2',2],['hQ3',3]])$(id).onclick=()=>move(H.snap(Q,H.radius(Math.round(i))),Math.round(i),null);
 for(const id of ['hMix','hRadius'])$(id).addEventListener('pointerdown',cancel);
 $('hMix').addEventListener('input',()=>{transition=null;running=false;t=0;const raw=+$('hMix').value,r=H.radius(Math.round(i)),Qs=[1,1.5,2,3];if(held&&Math.abs(raw-H.snap(held,r))>.014)held=null;if(!held)held=Qs.find(Q=>Math.abs(raw-H.snap(Q,r))<.007)||null;u=held?H.snap(held,r):raw;pick();update();});
 $('hRadius').addEventListener('input',()=>{transition=null;running=false;t=0;held=null;i=current?.banana?Math.max(2,Math.min(20,2*Math.round(+$('hRadius').value/2))):+$('hRadius').value;pick();update();});
 $('hPitch').addEventListener('input',()=>{if(!loaded||!current?.banana)return;transition=null;running=false;t=0;pitchDeg=+$('hPitch').value;pick();update();});
 $('hRetry').onclick=()=>{failed=false;load();update();};$('hElectric').addEventListener('change',()=>{if(!loaded)return;transition=null;running=false;t=0;pick();update();});
 function tick(time){const elapsed=previous?time-previous:0;const dt=Math.min(50,previous?time-previous:0);previous=time;now=time;if(!active)return;if(transition&&!loaded){transition.start+=elapsed;return;}if(transition){const v=Math.max(0,Math.min(1,(time-transition.start)/transition.duration)),ease=v*v*(3-2*v);u=transition.fromU+(transition.toU-transition.fromU)*ease;i=transition.fromI+(transition.toI-transition.fromI)*ease;pick();if(v===1){const target=transition;transition=null;i=target.toI;u=target.toU;if(target.scenario)$('cut').checked=target.scenario!=='drift';pick();}update();}else if(running){const sinceEscape=current&&current.escaped>=0?t-current.escaped*current.dt:-1,blend=Math.max(0,Math.min(1,sinceEscape/1e-6)),rate=1+7*blend*blend*(3-2*blend);t=Math.min(duration(),t+dt*4e-9*rate);if(t===duration())running=false;update();}}
 function arrow(c,a,b,color){const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<1)return;const x=dx/length,y=dy/length,head=Math.min(7,length*.35),width=3,shaft=.8,base=[b[0]-head*x,b[1]-head*y];c.save();c.fillStyle=color;c.beginPath();c.moveTo(a[0]-shaft*y,a[1]+shaft*x);c.lineTo(base[0]-shaft*y,base[1]+shaft*x);c.lineTo(base[0]-width*y,base[1]+width*x);c.lineTo(b[0],b[1]);c.lineTo(base[0]+width*y,base[1]-width*x);c.lineTo(base[0]+shaft*y,base[1]-shaft*x);c.lineTo(a[0]+shaft*y,a[1]-shaft*x);c.closePath();c.fill();c.restore();}
 function marker(points,arc,phase,project,visible,color=blue){const length=arc.at(-1);if(!length)return;const distance=(phase%1)*length;let lo=0,hi=arc.length-1;while(hi-lo>1){const j=(lo+hi)>>1;if(arc[j]<distance)lo=j;else hi=j;}const f=(distance-arc[lo])/(arc[hi]-arc[lo]||1),world=points[lo].map((v,k)=>v+(points[hi][k]-v)*f);if(!visible(world))return;const p=project(world),a=project(points[lo]),b=project(points[hi]),d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<.01)return;const x=(b[0]-a[0])/d,y=(b[1]-a[1])/d;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(p[0]+5*x,p[1]+5*y);ctx.lineTo(p[0]-4*x-3*y,p[1]-4*y+3*x);ctx.lineTo(p[0]-4*x+3*y,p[1]-4*y-3*x);ctx.closePath();ctx.fill();}
 function draw({W,H:height,dpr,project,face,path,objects,scale,cameraKey}){if(!active||!current)return;unroll?.update(current);const cut=$('cut').checked,cutAngle=+$('cutPosition').value*Math.PI,show=$('showLines').checked,surfaces=$('surfaces').checked,key=[current.id,cameraKey,cut,cutAngle,show,surfaces,!!transition].join(':');const origin=project([0,0,0]),axisX=project([1,0,0]),axisY=project([0,1,0]),sectionPhi=cut?(project(H.point(0,0,cutAngle))[0]>project(H.point(0,0,cutAngle+Math.PI))[0]?cutAngle:cutAngle+Math.PI):Math.atan2(axisY[0]-origin[0],axisX[0]-origin[0]);const visible=p=>!cut||Math.sin(Math.atan2(p[1],p[0])-cutAngle)>=-1e-6;
  if(key!==drawKey){drawKey=key;const selected=current.r,N=transition?64:128,K=transition?24:48;
   // Show only the inspected surface; nested construction rings obscure the orbit.
   if(surfaces)for(let j=0;j<N;j++){const p=j*2*Math.PI/N,P=(j+1)*2*Math.PI/N;if(cut&&Math.sin((p+P)/2-cutAngle)<0)continue;for(let k=0;k<K;k++){const a=k*2*Math.PI/K,b=(k+1)*2*Math.PI/K;face([H.point(selected,a,p),H.point(selected,b,p),H.point(selected,b,P),H.point(selected,a,P)],'rgb(221,184,206)',.26,'matte');}}
   if(cut&&surfaces)for(const phi of [cutAngle,cutAngle+Math.PI]){const pts=[];for(let k=0;k<=128;k++)pts.push(H.point(selected,k*Math.PI/64,phi));path(pts,'#a891a0',.8,.45);}
   if(show){
    if(current.u===0)for(const theta of [Math.PI/2,Math.PI,3*Math.PI/2]){const p=[];for(let j=0;j<=192;j++){const q=H.point(selected,theta,j*Math.PI/96);if(visible(q))p.push(q);else if(p.length){path(p,blue,1,.7);p.length=0;}}if(p.length)path(p,blue,1,.7);}
    if(current.u===1){for(let j=1;j<6;j++){const phi=j*Math.PI/3;if(cut&&Math.sin(phi-cutAngle)<0)continue;const p=[];for(let k=0;k<=192;k++)p.push(H.point(selected,k*Math.PI/96,phi));path(p,blue,1.2,.65);}const exterior=[];for(let k=0;k<=192;k++)exterior.push(H.point(H.a*1.12,k*Math.PI/96,0));path(exterior,blue,1,.35);}
   }
   if(surfaces){const phi=sectionPhi,world=(x,z)=>[(H.R+x)*Math.cos(phi),(H.R+x)*Math.sin(phi),z];
    for(let k=0;k<64;k++)face([world(0,0),H.point(H.a,k*Math.PI/32,phi),H.point(H.a,(k+1)*Math.PI/32,phi)],'rgb(207,214,218)',.12,'matte');
    for(let c=-1.2*H.a;c<=1.2*H.a;c+=H.a*.18){const d=Math.sqrt(Math.max(0,H.a*H.a-c*c/2))/Math.sqrt(2);path([world(c/2-d,c/2+d),world(c/2+d,c/2-d)],'#acb7bd',.6,.3);}
    for(const fraction of [.2,.4,.6,.8,1]){const pts=[];for(let k=0;k<=128;k++)pts.push(H.point(H.a*fraction,k*Math.PI/64,phi));path(pts,'#8799a3',.8,.55);}
   }
   if(current.u>0){const p=[];for(let j=0;j<=192;j++)p.push(H.point(0,0,j*Math.PI/96));path(p,'#8c556c',1,.55);}
   staticObjects=objects.slice();background=gpu?gpu.render(objects,W,height,scale,dpr):null;
  }
  if(background)ctx.drawImage(background,0,0,W,height);else{for(const o of staticObjects.slice().sort((a,b)=>a.z-b.z)){ctx.globalAlpha=o.alpha;ctx.beginPath();if(o.face){o.points.forEach((p,j)=>j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=o.color;ctx.fill();}else{ctx.moveTo(o.a[0],o.a[1]);ctx.lineTo(o.b[0],o.b[1]);ctx.strokeStyle=o.color;ctx.lineWidth=o.width;ctx.stroke();}}ctx.globalAlpha=1;}
  if(surfaces){const phi=sectionPhi;ctx.save();ctx.strokeStyle='#30363b';ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();for(let k=0;k<=128;k++){const p=project(H.point(current.r,k*Math.PI/64,phi));k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();ctx.restore();}
  // Draw the entire selected line over the translucent shell, also in cutaway.
  // Canvas gives a reliable stroke width (WebGL LineBasicMaterial is one pixel).
  if(show){ctx.save();ctx.globalAlpha=1;ctx.setLineDash([]);ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();current.points.forEach((p,j)=>{const q=project(p);j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=4.6;ctx.stroke();ctx.strokeStyle=blue;ctx.lineWidth=2.6;ctx.stroke();ctx.restore();}
  if(show&&$('hFlow').checked&&!transition){for(let j=0;j<3;j++){const phase=(now/12000+j/3)%1;marker(current.points,current.arc,phase,project,()=>true);}}
  if(current.u>0){const amplitude=Math.sin(H.angle(current.u)),size=4+10*Math.sqrt(amplitude),width=2+5*Math.sqrt(amplitude),phi=-now/4000,point=H.point(0,0,phi),p=project(point),b=project(H.point(0,0,phi-.03)),dx=b[0]-p[0],dy=b[1]-p[1],d=Math.hypot(dx,dy)||1,x=dx/d,y=dy/d;ctx.fillStyle='#8c556c';ctx.beginPath();ctx.moveTo(p[0]+size*x,p[1]+size*y);ctx.lineTo(p[0]-.7*size*x-width*y,p[1]-.7*size*y+width*x);ctx.lineTo(p[0]-.7*size*x+width*y,p[1]-.7*size*y-width*x);ctx.closePath();ctx.fill();label($('math'),'helixCurrent','I_p',p[0],p[1]-size-16);}
  if(show&&(current.closure||current.u===0||current.u===1)){const p=project(current.points[0]);ctx.strokeStyle=blue;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p[0],p[1],6,0,2*Math.PI);ctx.stroke();}
  if(current.electricZ){const a=project([0,0,.09]),b=project([0,0,-.09]);arrow(ctx,a,b,electric);label($('math'),'helixE',String.raw`\mathbf E`,a[0]+17,a[1]-10);}
  const frame=Math.min(current.path.length/6-1,t/current.dt),j=Math.floor(frame),values=current.path,at=offset=>playback.sample(values,current.tangents,frame,offset);
  if($('hParticle').checked){ctx.save();ctx.lineJoin='round';ctx.lineCap='round';for(const [offset,color,dash] of [[0,orange,[]],[3,green,[3,4]]]){ctx.strokeStyle=color;ctx.lineWidth=offset?1.2:1.7;ctx.setLineDash(dash);playback.trace(ctx,values,current.tangents,frame,offset,project);}ctx.setLineDash([]);for(const [offset,color,size]of [[3,green,3],[0,orange,5]]){const p=project(at(offset));ctx.fillStyle=color;ctx.beginPath();ctx.arc(p[0],p[1],size,0,2*Math.PI);ctx.fill();if(offset===3&&p[0]>20&&p[0]<W-20&&p[1]>110&&p[1]<height-20)label($('math'),'helixD','\\mathrm D^+',p[0]+17,p[1]-15);}ctx.restore();}
  bananaExplanation(frame,project);const status=$('status');status.style.visibility=status.scrollHeight>status.clientHeight?'hidden':'visible';section(current,j);tex($('timeValue'),'t='+num(t*1e6,2)+'\\,\\mathrm{\\mu s}');
 }
 function bananaExplanation(frame,project){if(!current.banana||!current.detail)return;const d=current.detail,n=d.length/6-1,j=Math.min(n,Math.floor(frame)),f=frame-j,get=k=>d[6*j+k]+(j<n?(d[6*(j+1)+k]-d[6*j+k])*f:0),B=get(0),parallel=get(1),perp=get(2);
  tex($('fieldValue'),'B='+num(B,3)+String.raw`\,\mathrm T`);tex($('qValue'),String.raw`v_\parallel=`+num(parallel/1000,1)+String.raw`\,\mathrm{km/s}`);tex($('rhoValue'),String.raw`v_\perp=`+num(perp/1000,1)+String.raw`\,\mathrm{km/s}`);
  const near=current.bounces.some(k=>Math.abs(frame-k)<65);if((current.escaped<0||frame<current.escaped)&&t<duration())$('status').textContent=near?'Odraz: pohyb podél pole obrací směr.':current.electricZ?'Působí zrcadlení i elektrická síla.':'Zrcadlová síla směřuje ke slabšímu poli.';
  if(!$('hParticle').checked)return;const world=playback.sample(current.path,current.tangents,frame,3),a=project(world),unit=[get(3),get(4),get(5)],b=project(world.map((v,k)=>v+unit[k]*.1)),dx=b[0]-a[0],dy=b[1]-a[1],norm=Math.hypot(dx,dy)||1,length=42*parallel/Math.sqrt(2*H.energy*1.602176634e-19/3.3435837768e-27),tip=[a[0]+dx/norm*length,a[1]+dy/norm*length];arrow(ctx,a,tip,'#30363b');label($('math'),'bananaParallel',String.raw`\mathbf v_\parallel`,tip[0]+13,tip[1]+14);
  for(const [k,index]of current.bounces.slice(0,2).map((k,index)=>[k,index])){const p=project(Array.from(current.path.subarray(k*6+3,k*6+6))),pulse=Math.max(0,1-Math.abs(frame-k)/65);ctx.save();ctx.strokeStyle=pulse?orange:'#30363b';ctx.lineWidth=1.5;ctx.setLineDash(pulse?[]:[3,3]);ctx.beginPath();ctx.arc(p[0],p[1],6+5*pulse,0,2*Math.PI);ctx.stroke();ctx.restore();label($('math'),'bananaBounce'+index,String.raw`\text{odraz}`,p[0]+26,p[1]-12);}
 }
 function section(frame,index){const h=$('graph').clientHeight||180;if($('graph').height!==Math.round(h*2))$('graph').height=Math.round(h*2);gc.setTransform(2,0,0,2,0,0);gc.clearRect(0,0,260,h);for(const el of $('graphMath').children)el.hidden=true;
  // Equal metric axes, fitted once to the fixed outer radius, never to the orbit.
  const s=Math.min(112,(h-80)/2)/H.a,cx=130,cy=h/2,math=(key,formula,x,y)=>label($('graphMath'),key,formula,x,24+y*160/h);
  if(current.banana&&current.sectionMap){gc.drawImage(current.sectionMap,cx-H.a*s,cy-H.a*s,2*H.a*s,2*H.a*s);for(let k=0;k<90;k++){gc.fillStyle=mapColor(k/89);gc.fillRect(85+k,h-28,1,7);}math('hBmin',num(current.fieldBounds[0],2)+String.raw`\,\mathrm T`,45,h-24);math('hBmax',num(current.fieldBounds[1],2)+String.raw`\,\mathrm T`,215,h-24);}

  gc.strokeStyle='#242a30';gc.lineWidth=1.2;gc.beginPath();gc.moveTo(10,cy);gc.lineTo(244,cy);gc.moveTo(cx,current.banana?Math.min(cy+H.a*s+5,h-36):h-26);gc.lineTo(cx,32);gc.stroke();gc.fillStyle='#242a30';gc.beginPath();gc.moveTo(250,cy);gc.lineTo(244,cy-3);gc.lineTo(244,cy+3);gc.closePath();gc.fill();gc.beginPath();gc.moveTo(cx,26);gc.lineTo(cx-3,32);gc.lineTo(cx+3,32);gc.closePath();gc.fill();
  for(const r of [H.a*.25,H.a*.5,H.a*.75,H.a,current.r]){gc.strokeStyle=r===current.r?'#30363b':'#b7c1c7';gc.setLineDash(r===current.r?[5,4]:[]);gc.lineWidth=r===current.r?1.5:.7;gc.beginPath();gc.arc(cx,cy,r*s,0,2*Math.PI);gc.stroke();}

  gc.setLineDash([]);if(current.electricZ){const ex=Math.max(12,cx-H.a*s-20);arrow(gc,[ex,cy-46],[ex,cy-16],electric);math('hSectionE',String.raw`\mathbf E`,ex,cy-58);}if($('hParticle').checked){gc.save();gc.beginPath();gc.rect(8,8,244,h-32);gc.clip();gc.strokeStyle=orange;gc.lineWidth=1.2;playback.trace(gc,frame.path,frame.tangents,t/frame.dt,0,p=>[cx+(Math.hypot(p[0],p[1])-H.R)*s,cy-p[2]*s]);const p=playback.sample(frame.path,frame.tangents,t/frame.dt);gc.fillStyle=orange;gc.beginPath();gc.arc(cx+(Math.hypot(p[0],p[1])-H.R)*s,cy-p[2]*s,3,0,2*Math.PI);gc.fill();gc.restore();}
  if(current.banana&&$('hParticle').checked){gc.save();gc.beginPath();gc.rect(8,8,244,h-32);gc.clip();gc.strokeStyle=green;gc.lineWidth=2.1;playback.trace(gc,frame.path,frame.tangents,t/frame.dt,3,p=>[cx+(Math.hypot(p[0],p[1])-H.R)*s,cy-p[2]*s]);gc.strokeStyle='#30363b';gc.lineWidth=1.2;for(const bounce of current.bounces||[]){if(bounce>index)continue;const k=bounce*6+3;gc.beginPath();gc.arc(cx+(Math.hypot(frame.path[k],frame.path[k+1])-H.R)*s,cy-frame.path[k+2]*s,4,0,2*Math.PI);gc.stroke();}gc.restore();}
  math('hAxisR',String.raw`R-R_0\ [\mathrm m]`,130,h-10);math('hAxisZ',String.raw`z\ [\mathrm m]`,cx,10);
 }

 return {activate(){active=true;gc.clearRect(0,0,520,1000);for(const el of $('graphMath').children)el.hidden=true;$('fade').value='.65';load();pick();update();drawKey='';},deactivate(){unroll?.deactivate();$('hLoad').hidden=true;$('mirrorRelation').hidden=true;$('graphTitle').style.visibility='visible';active=false;running=false;transition=null;},sync:update,tick,draw,reset,toggle(){if(!loaded||transition)return;if(t>=duration())t=0;running=!running;update();},snapshot(){return {loaded,i,u,t,running,transition:!!transition,current};},dispose(){disposed=true;active=false;loadGeneration++;clearRequests();buffers.clear();rows.clear();electricRows.clear();bananaRows.clear();mirrorGrids.clear();frames.clear();}};
};
})();
