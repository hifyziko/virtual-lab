(()=>{'use strict';
const $=id=>document.getElementById(id),cases=IslandData.cases;
const camera={yaw:-.45,pitch:.62,zoom:1};let drag=null,cutAnchor=[.85,.85];
let key='growing',time=0,running=false,last=null,raf,disposed=false;
function tex(id,s){const el=typeof id==='string'?$(id):id;if(el.dataset.rendered===s)return;el.dataset.rendered=s;katex.render(s,el,{throwOnError:false});}
document.querySelectorAll('[data-tex]').forEach(el=>tex(el,el.dataset.tex));
const num=(v,n=2)=>v.toFixed(n).replace('.','{,}');
function state(){const c=cases[key],frames=c.frames;let i=Math.min(frames.length-2,Math.floor(time));while(i>0&&frames[i].time>time)i--;while(i<frames.length-2&&frames[i+1].time<time)i++;const a=frames[i],b=frames[i+1],u=Math.max(0,Math.min(1,(time-a.time)/(b.time-a.time)));return {c,f:a.f.map((v,j)=>v+(b.f[j]-v)*u),p:a.p.map((v,j)=>v+(b.p[j]-v)*u),amplitude:a.amplitude+(b.amplitude-a.amplitude)*u,width:a.width+(b.width-a.width)*u};}
function surface(id){const canvas=$(id),w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(3,(window.devicePixelRatio||1)*canvas.getBoundingClientRect().width/w);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);const ctx=canvas.getContext('2d');ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);return {ctx,w,h};}
function sample(p,c,x){const q=Math.max(0,Math.min(c.n-1,(x+8)*(c.n-1)/16)),i=Math.min(c.n-2,Math.floor(q));return p[i]+(p[i+1]-p[i])*(q-i);}
function drawField(s){if($('baseline').checked)s={...s,p:s.p.map(()=>0),f:s.f.map(()=>0),amplitude:0,width:0};const {ctx,w,h}=surface('field'),l=56,r=w-20,t=50,b=h-60,e=Number($('zoom').value)*s.c.a,nx=92,ny=180,amp=s.amplitude;
 const values=Array.from({length:nx+1},(_,i)=>{const x=e-2*e*i/nx,base=s.c.a*Math.log(Math.cosh(x/s.c.a)),p=sample(s.p,s.c,x);return Float64Array.from({length:ny+1},(_,j)=>base+p*Math.cos(-Math.PI+4*Math.PI*j/ny));});
 ctx.fillStyle='#f7faff';ctx.fillRect(l,t,r-l,b-t);ctx.strokeStyle='#c7d0d8';ctx.lineWidth=1;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(l,(t+b)/2);ctx.lineTo(r,(t+b)/2);ctx.stroke();ctx.setLineDash([]);
 function contour(level,color,width,dashed=false){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dashed?[5,4]:[]);ctx.beginPath();for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
  const v=[values[i][j],values[i][j+1],values[i+1][j+1],values[i+1][j]],pts=[[j,i],[j+1,i],[j+1,i+1],[j,i+1]],hits=[];
  for(let q=0;q<4;q++){const z=(q+1)%4;if((v[q]<level)!==(v[z]<level)){const u=(level-v[q])/(v[z]-v[q]);hits.push([pts[q][0]+u*(pts[z][0]-pts[q][0]),pts[q][1]+u*(pts[z][1]-pts[q][1])]);}}
  // The analytic single-mode field has no ambiguous interior saddle cells
  // with this even periodic mesh: X-points lie on the periodic boundary.
  for(let q=0;q+1<hits.length;q+=2){ctx.moveTo(l+hits[q][0]/ny*(r-l),t+hits[q][1]/nx*(b-t));ctx.lineTo(l+hits[q+1][0]/ny*(r-l),t+hits[q+1][1]/nx*(b-t));}
 }ctx.stroke();ctx.setLineDash([]);}
 const vmax=s.c.a*Math.log(Math.cosh(e/s.c.a));
 // Equilibrium contours at the same fixed flux value, with the same axes.
 const fixed=s.c.frames[0].amplitude*6,eqX=s.c.a*Math.acosh(Math.exp(fixed/s.c.a));ctx.strokeStyle='#9ca8b2';ctx.lineWidth=1.4;ctx.setLineDash([6,5]);for(const sign of [-1,1]){const y=(t+b)/2+sign*eqX/(2*e)*(b-t);if(y>t&&y<b){ctx.beginPath();ctx.moveTo(l,y);ctx.lineTo(r,y);ctx.stroke();}}ctx.setLineDash([]);
 // Shade only flux enclosed by the separatrix; this is a magnetic region, not missing plasma.
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)if(values[i][j]<amp){ctx.fillStyle='#e4edf9';ctx.fillRect(l+j/ny*(r-l),t+i/nx*(b-t),(r-l)/ny+1,(b-t)/nx+1);}
 for(let j=1;j<=5;j++)contour(amp+vmax*j/6,'#356ac3',1.2);
 for(const f of [-.4,.5])contour(amp*f,'#356ac3',1.3);
 contour(s.c.frames[0].amplitude*6,'#174f9c',3.8);
 if($('marks').checked){contour(amp,'#293f57',1.7);ctx.fillStyle='#293f57';for(const x of [l+(r-l)/4,(l+r)/2,l+3*(r-l)/4]){ctx.beginPath();ctx.arc(x,(t+b)/2,3,0,Math.PI*2);ctx.fill();}}
 $('oLabel').hidden=$('xLabel').hidden=!$('marks').checked;tex('upper',num(e/s.c.a));tex('lower','-'+num(e/s.c.a));
 if($('marks').checked&&time>0){const arrows=[];let max=0;for(const xf of [-.7,-.35,.35,.7])for(let j=1;j<8;j++){const phase=-Math.PI+4*Math.PI*j/8,x=e*xf,d=.001*s.c.a,f=sample(s.f,s.c,x),fp=(sample(s.f,s.c,x+d)-sample(s.f,s.c,x-d))/(2*d),vx=-s.c.k*f*Math.cos(phase),vy=fp*Math.sin(phase),dx=vy*s.c.k/(4*Math.PI)*(r-l),dy=-vx/(2*e)*(b-t);arrows.push([l+j/8*(r-l),(t+b)/2-x/(2*e)*(b-t),dx,dy]);max=Math.max(max,Math.hypot(dx,dy));}for(const [xx,yy,dx,dy]of arrows)if(max>1e-12)IslandContext.arrow(ctx,xx,yy,dx/max*25,dy/max*25,'#22755f');}

 // Leaders identify physical regions; dimension uses the same numerical width as the readout.
 const middle=(t+b)/2,ox=(l+r)/2,xx=l+(r-l)/4;
 function leader(text,x,y,tx,ty,color){ctx.font='13px Segoe UI';ctx.fillStyle='#ffffffed';ctx.fillRect(x-3,y-14,text.length*6.8+6,19);ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+8,y+6);ctx.lineTo(tx,ty);ctx.stroke();}
 leader('Pole vychýlené poruchou',l,20,l+70,t+15,'#356ac3');
 if($('marks').checked&&time>0)leader('Odezva plazmatu: proudění',r-215,25,r-(r-l)*.25,middle-(b-t)*.18,'#22755f');
 $('oLabel').style.left=(ox+4)+'px';$('oLabel').style.top=(middle+6)+'px';$('xLabel').style.left=(xx-8)+'px';$('xLabel').style.top=(middle-27)+'px';
 leader('Odpor umožňuje přepojení',l+20,middle-50,xx,middle,'#805193');
 leader('Přepojený tok obepíná střed',ox+35,middle+65,ox,middle,'#356ac3');
 const half=s.width/(4*e)*(b-t),dimX=ox+35;ctx.strokeStyle='#805193';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(dimX,middle-half);ctx.lineTo(dimX,middle+half);for(const yy of [middle-half,middle+half]){ctx.moveTo(ox,yy);ctx.lineTo(dimX+5,yy);}ctx.stroke();
 tex('widthDimension','W');$('widthDimension').style.left=(dimX+7)+'px';$('widthDimension').style.top=(middle-8)+'px';
 // Arrows on outer field lines show the reversed in-plane direction.
 ctx.fillStyle='#356ac3';for(const [yy,dir]of [[t+12,1],[b-12,-1]]){const xx=l+(r-l)*.7;ctx.beginPath();ctx.moveTo(xx+dir*7,yy);ctx.lineTo(xx-dir*5,yy-4);ctx.lineTo(xx-dir*5,yy+4);ctx.closePath();ctx.fill();}
}
function axes(ctx,w,h){const box={l:34,r:w-13,t:31,b:h-29};ctx.strokeStyle='#c7d0d8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(box.l,box.t);ctx.lineTo(box.l,box.b);ctx.lineTo(box.r,box.b);ctx.stroke();return box;}
function profile(){const {ctx,w,h}=surface('current'),g=axes(ctx,w,h);for(const name of ['growing','damped']){ctx.strokeStyle=name===key?'#805193':'#a5acb4';ctx.lineWidth=name===key?2.5:1.2;ctx.setLineDash(name===key?[]:[4,4]);ctx.beginPath();const a=cases[name].a;for(let i=0;i<=200;i++){const x=-5+10*i/200,j=1/(a*Math.cosh(x/a)**2),xx=g.l+i/200*(g.r-g.l),yy=g.b-j/1.5*(g.b-g.t);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();}ctx.setLineDash([]);}
function growth(){const {ctx,w,h}=surface('growth'),g=axes(ctx,w,h),c=cases[key],f=c.frames,max=key==='growing'?f.at(-1).amplitude/f[0].amplitude:1.1,end=f.at(-1).time;tex('growthMax',num(max,1));tex('growthEnd',num(end,1));ctx.strokeStyle='#356ac3';ctx.lineWidth=2;ctx.beginPath();let started=false;for(const p of f){if(p.time>time)break;const x=g.l+p.time/end*(g.r-g.l),y=g.b+p.amplitude/f[0].amplitude/max*(g.b-g.t);started?ctx.lineTo(x,y):ctx.moveTo(x,y);started=true;}ctx.stroke();const s=state();ctx.fillStyle='#356ac3';ctx.beginPath();ctx.arc(g.l+time/end*(g.r-g.l),g.b+s.amplitude/f[0].amplitude/max*(g.b-g.t),3,0,2*Math.PI);ctx.fill();}
function draw(){const s=state(),end=s.c.frames.at(-1).time;tex('timeValue','t^{*}='+num(time,1));tex('speedValue',num(Number($('speed').value),2)+'\\,\\times');tex('zoomValue','\\pm'+num(Number($('zoom').value))+'a');tex('widthValue','W/a='+num(s.width/s.c.a,4));tex('amplitudeValue',num(s.amplitude/s.c.frames[0].amplitude,3)+'\\,\\times');$('time').value=time/end;
 $('title').textContent=key==='growing'?'Úzká proudová vrstva — vznik ostrova':'Široká proudová vrstva — útlum poruchy';$('stage').textContent=time>=end-.001?(key==='growing'?'Konec lineárního výpočtu: ostrov dosáhl meze malých poruch.':'Porucha zeslábla. Původní uspořádání pole se obnovuje.'):time<10?'Malá počáteční porucha vyvolává odezvu pole a proudění.':key==='growing'?'Porucha se zesiluje. Přepojený tok a šířka ostrova rostou.':'Porucha se tlumí a ostrov se zmenšuje.';

 $('cause').textContent=key==='growing'?'Úzká proudová vrstva umožňuje růst poruchy.':'V široké vrstvě se stejná porucha tlumí.';
 $('effect').textContent='Vychýlení pole vyvolá proudění. Odpor umožní změnu propojení u X-bodů; při nestabilitě přibývá přepojený tok kolem O-bodu.';
 $('play').textContent=running?'Pozastavit':'Spustit';
 const opts={slice:Number($('slice').value)*Math.PI/180,surfaces:$('surfaces').checked,island:$('island').checked,marks:$('marks').checked};
 tex('sliceValue',String($('slice').value)+'^\\circ');
 const world=surface('world');const anchor=IslandContext.draw(world.ctx,world.w,world.h,s,camera,opts);cutAnchor=[anchor.cut[0]/world.w,anchor.cut[1]/world.h];
 const cut=surface('section');IslandContext.section(cut.ctx,cut.w,cut.h,s,opts.slice,opts);
 drawReference();drawField(s);profile();growth();$('comparisonTitle').textContent=$('baseline').checked?'Bez poruchy: větve zůstávají oddělené':time===0?'Malá počáteční porucha — již obsahuje malý ostrov':'Porucha se vyvíjí: sleduj silnou modrou konturu';}


 function drawReference(){const {ctx,w,h}=surface('reference');ctx.strokeStyle='#356ac3';ctx.lineWidth=1.5;for(const yy of [12,h-12]){ctx.beginPath();ctx.moveTo(30,yy);ctx.lineTo(w-30,yy);ctx.stroke();IslandContext.arrow(ctx,w*.65,yy,yy<h/2?25:-25,0,'#356ac3');}ctx.strokeStyle='#805193';ctx.fillStyle='#805193';for(let x=40;x<w-30;x+=40){ctx.beginPath();ctx.arc(x,h/2,5,0,2*Math.PI);ctx.stroke();ctx.beginPath();ctx.moveTo(x-2,h/2-2);ctx.lineTo(x+2,h/2+2);ctx.moveTo(x-2,h/2+2);ctx.lineTo(x+2,h/2-2);ctx.stroke();}}
 function connections(){const sr=$('section').getBoundingClientRect(),fr=$('field').getBoundingClientRect(),wr=$('world').getBoundingClientRect(),lr=$('links').getBoundingClientRect();if(!lr.height)return;const {ctx,w,h}=surface('links'),sx=w/lr.width,sy=h/lr.height;const p=(rect,x,y)=>[(rect.left-lr.left+x*rect.width)*sx,(rect.top-lr.top+y*rect.height)*sy];ctx.strokeStyle='#805193';ctx.lineWidth=1.2;ctx.setLineDash([4,4]);for(const [from,to] of [[p(wr,...cutAnchor),p(sr,.5,.08)],[p(sr,.72,.35),p(fr,.01,.23)],[p(sr,.72,.65),p(fr,.01,.77)]]){ctx.beginPath();ctx.moveTo(...from);ctx.lineTo(...to);ctx.stroke();}ctx.setLineDash([]);}
 $('case').onchange=()=>{key=$('case').value;time=0;running=false;draw();};$('play').onclick=()=>{if(time>=cases[key].frames.at(-1).time)time=0;running=!running;draw();};$('reset').onclick=()=>{time=0;running=false;draw();};$('step').onclick=()=>{running=false;const next=cases[key].frames.find(f=>f.time>time+1e-7);if(next)time=next.time;draw();};$('time').oninput=()=>{running=false;time=Number($('time').value)*cases[key].frames.at(-1).time;draw();};
 for(const id of ['speed','zoom','slice'])$(id).oninput=draw;for(const id of ['marks','surfaces','island','baseline'])$(id).onchange=draw;
 $('help').onclick=()=>$('guide').showModal();$('closeHelp').onclick=()=>$('guide').close();
 $('cameraReset').onclick=()=>{Object.assign(camera,{yaw:-.45,pitch:.62,zoom:1});draw();};
 $('world').onpointerdown=e=>{drag=[e.clientX,e.clientY];$('world').setPointerCapture(e.pointerId);};
 $('world').onpointermove=e=>{if(!drag)return;camera.yaw-=(e.clientX-drag[0])*.008;camera.pitch=Math.max(-1.4,Math.min(1.4,camera.pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];draw();};
 $('world').onpointerup=$('world').onpointercancel=()=>{drag=null;};
 $('world').onwheel=e=>{e.preventDefault();camera.zoom=Math.max(.65,Math.min(1.55,camera.zoom*Math.exp(-e.deltaY*.001)));draw();};
 const resize=()=>draw();window.addEventListener('resize',resize);
 function tick(now){if(disposed)return;const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;if(running&&!document.hidden){time=Math.min(cases[key].frames.at(-1).time,time+dt*7*Number($('speed').value));if(time>=cases[key].frames.at(-1).time)running=false;draw();}raf=requestAnimationFrame(tick);}
 window.HiFyzikoFusionDispose=()=>{disposed=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};draw();raf=requestAnimationFrame(tick);
})();
