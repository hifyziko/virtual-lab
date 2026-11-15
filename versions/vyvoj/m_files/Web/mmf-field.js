/* Numerical field bases computed off the UI thread, never by rotating a picture. */
(function(root){'use strict';
function create(onchange){
 let worker=null,timer=null,job=0,ready=null,pending='',disposed=false;const cache=new Map();
 function stop(){clearTimeout(timer);worker?.terminate();worker=null;}
 function request(W,mode,orders){
  const key=JSON.stringify([W.m,W.q,W.layers,W.y,mode,orders]);if(key===pending)return;pending=key;ready=cache.get(key)||null;stop();const id=++job;
  if(ready){onchange('');return;}onchange('Počítám pole z proudů zvoleného vinutí…');
  timer=setTimeout(()=>{
   if(disposed)return;
   const sources=[];for(const h of orders)for(const t of [0,Math.PI/(2*h)]){const d=W.compute(t,mode,W.Q,[],[],[[h,1,0]]),v=Array(W.Q*W.layers).fill(0);W.sides.forEach((row,k)=>row.forEach(c=>v[k*W.layers+c.layer]+=c.sign*c.weight*d.curr[c.phase]));sources.push(v);}
   const P=root.PolarSlotField,source='const system='+P.system.toString()+';const solve='+P.solve.toString()+';const cartesian='+P.cartesian.toString()+`;onmessage=e=>{try{const g=system(e.data.Q,e.data.layers),stats=[],fields=e.data.sources.map(v=>{const r=solve(g,v);stats.push({residual:r.residual,iterations:r.iterations});return cartesian(g,r.a);});postMessage({fields,stats},fields.map(a=>a.buffer));}catch(err){postMessage({error:err.message});}};`;
   const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
   try{worker=new Worker(url);}catch(err){URL.revokeObjectURL(url);onchange('Výpočet pole není dostupný: '+err.message);return;}URL.revokeObjectURL(url);
   worker.onmessage=e=>{if(disposed||id!==job)return;worker.terminate();worker=null;if(e.data.error){onchange('Pole se nepodařilo vypočítat: '+e.data.error);return;}ready={...e.data,orders,N:169,R:224};cache.set(key,ready);if(cache.size>8)cache.delete(cache.keys().next().value);onchange('');};
   worker.onerror=()=>{if(id===job&&!disposed)onchange('Výpočet pole není dostupný. Přepněte zpět na proudy v drážkách.');};worker.postMessage({Q:W.Q,layers:W.layers,sources});
  },120);
 }
 let lastKey='',lastContours='';
 function draw(W,d,colors,angle,spectrum){
  if(!ready)return '';
  const state=JSON.stringify([pending,angle,spectrum]);if(state!==lastKey){lastKey=state;
   const a=new Float32Array(ready.N**2);let bound=0;
   for(const [h,amp,shift]of spectrum){const idx=ready.orders.indexOf(h);if(idx<0)continue;const u=ready.fields[2*idx],v=ready.fields[2*idx+1],phase=h*angle+shift*Math.PI/180,c=amp*Math.cos(phase),s=amp*Math.sin(phase);let peak=0;for(let k=0;k<a.length;k++){a[k]+=c*u[k]+s*v[k];peak=Math.max(peak,Math.hypot(u[k],v[k]));}bound+=Math.abs(amp)*peak;}
   if(bound>1e-12)for(let k=0;k<a.length;k++)a[k]*=1.5/bound;
   const lines=root.MagneticContours(a,ready.N,ready.R,'#168d8a');lastContours=lines.paths+lines.arrows;
  }
  return root.SlottedWindingArt(W,d,colors,lastContours);
 }
 return {request,draw,isReady:()=>!!ready,dispose(){disposed=true;job++;stop();cache.clear();}};
}
root.WindingNumericalField={create};
})(globalThis);
