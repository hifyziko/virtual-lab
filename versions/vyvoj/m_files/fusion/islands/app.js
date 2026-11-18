(()=>{'use strict';
const $=id=>document.getElementById(id),cases=IslandData.cases;
let key='growing',time=0,running=false,last=null,raf,disposed=false;
function tex(id,s){const el=typeof id==='string'?$(id):id;if(el.dataset.rendered===s)return;el.dataset.rendered=s;katex.render(s,el,{throwOnError:false});}
document.querySelectorAll('[data-tex]').forEach(el=>tex(el,el.dataset.tex));
const num=(v,n=2)=>v.toFixed(n).replace('.','{,}');
function state(){const c=cases[key],frames=c.frames;let i=Math.min(frames.length-2,Math.floor(time));while(i>0&&frames[i].time>time)i--;while(i<frames.length-2&&frames[i+1].time<time)i++;const a=frames[i],b=frames[i+1],u=Math.max(0,Math.min(1,(time-a.time)/(b.time-a.time)));return {c,p:a.p.map((v,j)=>v+(b.p[j]-v)*u),amplitude:a.amplitude+(b.amplitude-a.amplitude)*u,width:a.width+(b.width-a.width)*u};}
function surface(id){const canvas=$(id),w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(3,(window.devicePixelRatio||1)*canvas.getBoundingClientRect().width/w);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);const ctx=canvas.getContext('2d');ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);return {ctx,w,h};}
function sample(p,c,x){const q=Math.max(0,Math.min(c.n-1,(x+8)*(c.n-1)/16)),i=Math.min(c.n-2,Math.floor(q));return p[i]+(p[i+1]-p[i])*(q-i);}
function drawField(s){const {ctx,w,h}=surface('field'),l=56,r=w-20,t=32,b=h-38,e=Number($('zoom').value)*s.c.a,nx=92,ny=180,amp=s.amplitude;
 const values=Array.from({length:nx+1},(_,i)=>{const x=e-2*e*i/nx,base=s.c.a*Math.log(Math.cosh(x/s.c.a)),p=sample(s.p,s.c,x);return Float64Array.from({length:ny+1},(_,j)=>base+p*Math.cos(2*Math.PI*j/ny));});
 ctx.fillStyle='#f7faff';ctx.fillRect(l,t,r-l,b-t);ctx.strokeStyle='#c7d0d8';ctx.lineWidth=1;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(l,(t+b)/2);ctx.lineTo(r,(t+b)/2);ctx.stroke();ctx.setLineDash([]);
 function contour(level,color,width,dashed=false){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dashed?[5,4]:[]);ctx.beginPath();for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
  const v=[values[i][j],values[i][j+1],values[i+1][j+1],values[i+1][j]],pts=[[j,i],[j+1,i],[j+1,i+1],[j,i+1]],hits=[];
  for(let q=0;q<4;q++){const z=(q+1)%4;if((v[q]<level)!==(v[z]<level)){const u=(level-v[q])/(v[z]-v[q]);hits.push([pts[q][0]+u*(pts[z][0]-pts[q][0]),pts[q][1]+u*(pts[z][1]-pts[q][1])]);}}
  // The analytic single-mode field has no ambiguous interior saddle cells
  // with this even periodic mesh: X-points lie on the periodic boundary.
  for(let q=0;q+1<hits.length;q+=2){ctx.moveTo(l+hits[q][0]/ny*(r-l),t+hits[q][1]/nx*(b-t));ctx.lineTo(l+hits[q+1][0]/ny*(r-l),t+hits[q+1][1]/nx*(b-t));}
 }ctx.stroke();ctx.setLineDash([]);}
 const vmax=s.c.a*Math.log(Math.cosh(e/s.c.a));for(let j=1;j<=12;j++)contour(amp+vmax*j/13,'#356ac3',1.25);
 for(const f of [-.8,-.35,.2,.65])contour(amp*f,'#356ac3',1.3);
 if($('marks').checked){contour(amp,'#293f57',1.7);ctx.fillStyle='#293f57';for(const x of [l,(l+r)/2,r]){ctx.beginPath();ctx.arc(x,(t+b)/2,3,0,Math.PI*2);ctx.fill();}}
 $('oLabel').hidden=$('xLabel').hidden=!$('marks').checked;tex('upper',num(e/s.c.a));tex('lower','-'+num(e/s.c.a));
 // Arrows on outer field lines show the reversed in-plane direction.
 ctx.fillStyle='#356ac3';for(const [yy,dir]of [[t+12,1],[b-12,-1]]){const xx=l+(r-l)*.7;ctx.beginPath();ctx.moveTo(xx+dir*7,yy);ctx.lineTo(xx-dir*5,yy-4);ctx.lineTo(xx-dir*5,yy+4);ctx.closePath();ctx.fill();}
}
function axes(ctx,w,h){const box={l:34,r:w-13,t:31,b:h-29};ctx.strokeStyle='#c7d0d8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(box.l,box.t);ctx.lineTo(box.l,box.b);ctx.lineTo(box.r,box.b);ctx.stroke();return box;}
function profile(){const {ctx,w,h}=surface('current'),g=axes(ctx,w,h);for(const name of ['growing','damped']){ctx.strokeStyle=name===key?'#805193':'#a5acb4';ctx.lineWidth=name===key?2.5:1.2;ctx.setLineDash(name===key?[]:[4,4]);ctx.beginPath();const a=cases[name].a;for(let i=0;i<=200;i++){const x=-5+10*i/200,j=1/(a*Math.cosh(x/a)**2),xx=g.l+i/200*(g.r-g.l),yy=g.b-j/1.5*(g.b-g.t);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();}ctx.setLineDash([]);}
function growth(){const {ctx,w,h}=surface('growth'),g=axes(ctx,w,h),c=cases[key],f=c.frames,max=key==='growing'?f.at(-1).amplitude/f[0].amplitude:1.1,end=f.at(-1).time;tex('growthMax',num(max,1));tex('growthEnd',num(end,1));ctx.strokeStyle='#356ac3';ctx.lineWidth=2;ctx.beginPath();let started=false;for(const p of f){if(p.time>time)break;const x=g.l+p.time/end*(g.r-g.l),y=g.b+p.amplitude/f[0].amplitude/max*(g.b-g.t);started?ctx.lineTo(x,y):ctx.moveTo(x,y);started=true;}ctx.stroke();const s=state();ctx.fillStyle='#356ac3';ctx.beginPath();ctx.arc(g.l+time/end*(g.r-g.l),g.b+s.amplitude/f[0].amplitude/max*(g.b-g.t),3,0,2*Math.PI);ctx.fill();}
function draw(){const s=state(),end=s.c.frames.at(-1).time;tex('timeValue','t^{*}='+num(time,1));tex('speedValue',num(Number($('speed').value),2)+'\\,\\times');tex('zoomValue','\\pm'+num(Number($('zoom').value))+'a');tex('widthValue','W/a='+num(s.width/s.c.a,4));tex('amplitudeValue',num(s.amplitude/s.c.frames[0].amplitude,3)+'\\,\\times');$('time').value=time/end;
 $('title').textContent=key==='growing'?'Úzká proudová vrstva — vznik ostrova':'Široká proudová vrstva — útlum poruchy';$('stage').textContent=time>=end-.001?(key==='growing'?'Konec lineárního výpočtu: ostrov dosáhl meze malých poruch.':'Porucha zeslábla. Původní uspořádání pole se obnovuje.'):time<10?'Malá počáteční porucha vyvolává odezvu pole a proudění.':key==='growing'?'Porucha se zesiluje. Přepojený tok a šířka ostrova rostou.':'Porucha se tlumí a ostrov se zmenšuje.';
 $('play').textContent=running?'Pozastavit':'Spustit';drawField(s);profile();growth();}
 $('case').onchange=()=>{key=$('case').value;time=0;running=false;draw();};$('play').onclick=()=>{if(time>=cases[key].frames.at(-1).time)time=0;running=!running;draw();};$('reset').onclick=()=>{time=0;running=false;draw();};$('step').onclick=()=>{running=false;const next=cases[key].frames.find(f=>f.time>time+1e-7);if(next)time=next.time;draw();};$('time').oninput=()=>{running=false;time=Number($('time').value)*cases[key].frames.at(-1).time;draw();};for(const id of ['speed','zoom'])$(id).oninput=draw;$('marks').onchange=draw;$('help').onclick=()=>$('guide').showModal();$('closeHelp').onclick=()=>$('guide').close();
 const resize=()=>draw();window.addEventListener('resize',resize);
 function tick(now){if(disposed)return;const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;if(running&&!document.hidden){time=Math.min(cases[key].frames.at(-1).time,time+dt*7*Number($('speed').value));if(time>=cases[key].frames.at(-1).time)running=false;draw();}raf=requestAnimationFrame(tick);}
 window.HiFyzikoFusionDispose=()=>{disposed=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};draw();raf=requestAnimationFrame(tick);
})();
