/* Optional synthesized teaching cues, not recordings of a particular machine. */
(()=>{let ctx,enabled=true,last=-Infinity;const voices=new Set();
function stop(){for(const v of voices){try{v.stop();}catch{}}voices.clear();}
function paint(b){b.textContent=enabled?'Zvuk zapnutý':'Zvuk vypnutý';b.setAttribute('aria-pressed',String(enabled));b.style.background=enabled?'#007e6c':'#ffffff';b.style.color=enabled?'#ffffff':'#52666b';b.style.border=enabled?'1px solid #006b5b':'1px solid #b8cbc7';b.style.fontWeight=enabled?'600':'400';}
async function unlock(){if(!enabled)return;try{ctx??=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state!=='running')await ctx.resume();}catch{enabled=false;document.querySelectorAll('[data-machine-sound]').forEach(paint);}}
function mount(host){if(!host||host.querySelector('[data-machine-sound]'))return;const bar=host.querySelector('.actions')||host.querySelector('header');if(!bar)return;enabled=true;const b=document.createElement('button');b.type='button';b.dataset.machineSound='';paint(b);b.title='Zapnout nebo vypnout ilustrační zvuk';bar.appendChild(b);b.onclick=async()=>{enabled=!enabled;if(enabled)await unlock();else stop();paint(b);};}
function play(kind='spark'){if(!enabled||!ctx||ctx.state!=='running'||document.hidden||ctx.currentTime-last<.12)return;last=ctx.currentTime;const duration=kind==='slip'?.55:kind==='switch'?.025:.18,g=ctx.createGain(),now=ctx.currentTime;if(kind==='slip'||kind==='switch'){g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(kind==='slip'?.36:.20,now+.006);g.gain.exponentialRampToValueAtTime(.0001,now+duration);}else g.gain.setValueAtTime(.26,now);g.connect(ctx.destination);let source;if(kind==='slip'||kind==='switch'){source=ctx.createOscillator();source.type='triangle';source.frequency.setValueAtTime(kind==='switch'?900:110,now);source.frequency.exponentialRampToValueAtTime(kind==='switch'?350:42,now+duration);}else{source=ctx.createBufferSource();const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),a=b.getChannelData(0);// Several irregular micro-arcs instead of one broadband impact.
const bursts=[];for(let t=.002;t<duration-.025;t+=.012+Math.random()*.022)bursts.push({t,decay:.0015+Math.random()*.004,level:.5+Math.random()*.5});
const hp=Math.exp(-2*Math.PI*1000/ctx.sampleRate),lp=1-Math.exp(-2*Math.PI*7500/ctx.sampleRate);let previous=0,high=0,soft=0;
for(let i=0;i<a.length;i++){const t=i/ctx.sampleRate,noise=Math.random()*2-1;high=hp*(high+noise-previous);previous=noise;soft+=lp*(high-soft);let envelope=.06;for(const burst of bursts){const age=t-burst.t;if(age>=0)envelope+=burst.level*(1-Math.exp(-age/.00015))*Math.exp(-age/burst.decay);}const edge=Math.min(1,t/.001,(duration-t)/.012);a[i]=Math.max(-1,Math.min(1,soft*Math.min(1,envelope)*Math.max(0,edge)));}
source.buffer=b;}source.connect(g);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();g.disconnect();};source.start(now);source.stop(now+duration);}
async function clickSwitch(){
 if(!enabled||document.hidden)return;
 await unlock();
 if(!enabled||document.hidden||ctx?.state!=='running')return;
 const now=ctx.currentTime,source=ctx.createOscillator(),gain=ctx.createGain();
 source.type='triangle';
 source.frequency.setValueAtTime(1050,now);
 source.frequency.exponentialRampToValueAtTime(310,now+.022);
 gain.gain.setValueAtTime(0,now);
 gain.gain.linearRampToValueAtTime(.095,now+.0015);
 gain.gain.exponentialRampToValueAtTime(.0001,now+.029);
 source.connect(gain);gain.connect(ctx.destination);voices.add(source);
 source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};
 source.start(now);source.stop(now+.03);
}
window.MachineSound={mount,play,stop,clickSwitch};if(typeof document!=='undefined'){document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);window.addEventListener('hashchange',()=>{stop();enabled=true;});}
})();
