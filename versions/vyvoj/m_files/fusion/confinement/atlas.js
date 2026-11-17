/* Load only the selected preset; custom dimensions prepare the same 201 states once. */
(()=>{'use strict';
const source=document.currentScript,base=source.src||new URL(source.dataset.fusionSource,document.baseURI).href;
const presets={default:[.65,.18],compass:[.89,.27],iter:[6.2,2],jet:[2.95,1.25],sparc:[1.85,.57]};
window.createConfinementAtlas=(M,events)=>{
 const codec=ConfinementAtlasCodec,cache=new Map();let token=0,key='',active=null,worker=null,decoded=new Map(),disposed=false;
 function stop(){worker?.terminate();worker=null;}
 function remember(k,a){cache.set(k,a);if(cache.size>2)cache.delete(cache.keys().next().value);}
 function load(id){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('atlases/'+id+'.js',base).href;script.onload=()=>{try{const raw=window.HiFyzikoBendAtlases[id],binary=atob(raw.data),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);delete window.HiFyzikoBendAtlases[id];resolve({steps:raw.steps,offsets:raw.offsets,values:new Float32Array(bytes.buffer)});}catch(error){reject(error);}finally{script.remove();}};script.onerror=()=>{script.remove();reject(Error('Načtení předpočítaného pole selhalo.'));};document.head.append(script);});}
 function custom(ratio,mine){return new Promise((resolve,reject)=>{
  const code=M.workerSource+codec.workerSource+`;self.onmessage=()=>{const parts=[],offsets=[0],steps=200;for(let i=0;i<=steps;i++){const p=ConfinementAtlasCodec.pack(ConfinementModel.bendData({mode:'bend',ideal:false,R0:.65,a:.65*${ratio},bend:i/steps}));parts.push(p);offsets.push(offsets.at(-1)+p.length);if(i%4===0)self.postMessage({progress:i/steps});}const values=new Float32Array(offsets.at(-1));let j=0;for(const p of parts){values.set(p,j);j+=p.length;}self.postMessage({steps,offsets,values},[values.buffer]);};`;
  try{const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));try{worker=new Worker(url);}finally{URL.revokeObjectURL(url);}worker.onerror=()=>{stop();reject(Error('Příprava vlastních rozměrů selhala.'));};worker.onmessage=({data})=>{if(disposed||mine!==token)return;if('progress'in data)events.progress(data.progress,true);else{stop();resolve(data);}};worker.postMessage({});}catch(error){stop();reject(error);}
 });}
 async function prepare(c){const ratio=c.a/c.R0,k=ratio.toPrecision(12);if(key===k)return;key=k;active=null;decoded.clear();stop();const mine=++token;const id=Object.keys(presets).find(id=>Math.abs(presets[id][1]/presets[id][0]-ratio)<1e-10);events.progress(0,!id);
  try{let a=cache.get(k);if(!a){a=id?await load(id):await custom(ratio,mine);if(disposed||mine!==token)return;remember(k,a);}if(disposed||mine!==token)return;active=a;events.ready();}catch(error){if(disposed||mine!==token)return;key='';events.error(error.message);}
 }
 return {prepare,frame(c){if(!active||key!==(c.a/c.R0).toPrecision(12))return null;const i=Math.round(c.bend*active.steps),frameKey=[i,c.R0].join(':');if(decoded.has(frameKey))return decoded.get(frameKey);const d=codec.unpack(active.values.subarray(active.offsets[i],active.offsets[i+1])),scale=c.R0/.65;for(const line of d.lines)for(const p of line)for(let j=0;j<3;j++)p[j]*=scale;for(const p of d.profile)p.x*=scale;decoded.set(frameKey,d);if(decoded.size>3)decoded.delete(decoded.keys().next().value);return d;},cancel(){token++;key='';active=null;decoded.clear();stop();},dispose(){disposed=true;token++;stop();cache.clear();decoded.clear();}};
};
})();
