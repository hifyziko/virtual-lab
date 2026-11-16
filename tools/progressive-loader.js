/* Keep navigation available while a selected lesson downloads. No startup prefetch. */
(()=>{'use strict';
 const values=new Map(),pending=new Map(),received=new Map(),listeners=new Set(),frames=new WeakMap();
 let assets={},installed=false;
 const emit=()=>{for(const fn of listeners)fn();};
 const ready=key=>values.has(key);
 const value=key=>{if(!ready(key))throw Error('Lesson data not loaded: '+key);return values.get(key);};
 const accept=(key,data)=>{if(!assets[key])throw Error('Unknown lesson data: '+key);values.set(key,data);};
 function execute(code){const script=document.createElement('script');script.textContent=code;document.head.append(script);script.remove();}
 async function download(key){
  const asset=assets[key];if(!asset)throw Error('Unknown lesson: '+key);
  received.set(key,0);emit();
  if(location.protocol==='file:'){
   await new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    const finish=error=>{clearTimeout(timer);script.remove();error?reject(error):resolve();};
    const timer=setTimeout(()=>finish(Error('Loading timed out')),120000);
    script.onload=()=>finish();script.onerror=()=>finish(Error('Lesson file is unavailable'));
    script.src=asset.path;document.head.append(script);
   });
  }else{
   const controller=new AbortController();let timer;
   const touch=()=>{clearTimeout(timer);timer=setTimeout(()=>controller.abort(),120000);};touch();
   try{
    const response=await fetch(asset.path,{signal:controller.signal});
    if(!response.ok)throw Error('Lesson download failed: '+response.status);
    let bytes;
    if(response.body?.getReader){
     const reader=response.body.getReader(),parts=[];let length=0;
     for(;;){const {done,value:part}=await reader.read();if(done)break;touch();parts.push(part);length+=part.length;received.set(key,length);emit();}
     bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
    }else bytes=new Uint8Array(await response.arrayBuffer());
    if(bytes.length!==asset.bytes)throw Error('Incomplete lesson download');
    if(globalThis.crypto?.subtle){
     const digest=await crypto.subtle.digest('SHA-256',bytes);
     const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
     if(hash!==asset.sha256)throw Error('Lesson checksum mismatch');
    }
    execute(new TextDecoder().decode(bytes));
   }finally{clearTimeout(timer);}
  }
  if(!ready(key))throw Error('Lesson did not initialize');
  received.set(key,asset.bytes);emit();
 }
 function load(key){
  if(ready(key))return Promise.resolve(value(key));
  if(!pending.has(key)){
   const job=download(key).then(()=>value(key)).catch(error=>{values.delete(key);received.delete(key);throw error;}).finally(()=>pending.delete(key));
   pending.set(key,job);
  }
  return pending.get(key);
 }
 function mountAfterLoading(module,keys,original,app,args){
  if(keys.every(ready))return original.apply(module,args);
  const entry=Lab.catalog.find(item=>item.id===module.id)||module;
  const panel=document.createElement('section');panel.className='lab-loading';panel.setAttribute('aria-busy','true');
  const back=document.createElement('a');back.className='back';back.href=entry.group?'#group-'+entry.group:'#';back.textContent='← Zpět do rozcestníku';
  const title=document.createElement('h1');title.textContent=entry.title;
  const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Načítání modulu…';
  const progress=document.createElement('progress');progress.max=1;progress.setAttribute('aria-label','Průběh načítání modulu');
  const hint=document.createElement('p');hint.className='lab-loading-note';hint.textContent='Můžete se vrátit do rozcestníku a vybrat jiný modul.';
  const retry=document.createElement('button');retry.textContent='Zkusit znovu';retry.hidden=true;
  panel.append(back,title,status,progress,hint,retry);app.replaceChildren(panel);
  let active=true;
  const update=()=>{
   if(!active)return;
   const total=keys.reduce((n,k)=>n+assets[k].bytes,0),loaded=keys.reduce((n,k)=>n+(ready(k)?assets[k].bytes:Math.min(received.get(k)||0,assets[k].bytes)),0);
   if(location.protocol!=='file:')progress.value=total?Math.min(.98,loaded/total):0;
   if(loaded===total)status.textContent='Připravuji animaci…';
  };
  listeners.add(update);update();
  Lab.dispose=()=>{active=false;listeners.delete(update);retry.onclick=null;};
  retry.onclick=()=>Lab.route();
  // Allow the loading panel to paint before cached responses are decoded and evaluated.
  requestAnimationFrame(()=>setTimeout(()=>{
   if(!active)return;
   Promise.all(keys.map(load)).then(()=>{
    if(active&&app.contains(panel)&&location.hash.slice(1)===module.id)Lab.route();
   }).catch(error=>{
    if(!active)return;
    panel.setAttribute('aria-busy','false');progress.hidden=true;retry.hidden=false;
    status.textContent='Modul se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.';
    console.warn('Module loading failed:',module.id,error);
   });
  },0));
 }
 function clearFrame(frame){
  frames.get(frame)?.();frame.srcdoc='';
 }
 function mountFrame(frame,key){
  clearFrame(frame);
  if(ready(key)){frame.srcdoc=value(key);return;}
  const panel=document.createElement('section');panel.className='lab-loading';panel.setAttribute('aria-busy','true');
  const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Načítání animace…';
  const progress=document.createElement('progress');progress.max=1;progress.setAttribute('aria-label','Průběh načítání animace');
  const retry=document.createElement('button');retry.type='button';retry.textContent='Zkusit znovu';retry.hidden=true;
  panel.append(status,progress,retry);frame.before(panel);
  const display=frame.style.display;frame.style.display='none';let active=true;
  const update=()=>{
   const total=assets[key].bytes,loaded=ready(key)?total:Math.min(received.get(key)||0,total);
   if(location.protocol!=='file:')progress.value=total?Math.min(.98,loaded/total):0;
   if(loaded===total)status.textContent='Připravuji animaci…';
  };
  const cleanup=()=>{active=false;listeners.delete(update);retry.onclick=null;panel.remove();frame.style.display=display;frames.delete(frame);};
  frames.set(frame,cleanup);listeners.add(update);update();
  retry.onclick=()=>mountFrame(frame,key);
  requestAnimationFrame(()=>setTimeout(()=>{
   if(!active)return;
   load(key).then(source=>{if(active){cleanup();frame.srcdoc=source;}}).catch(error=>{
    if(!active)return;
    panel.setAttribute('aria-busy','false');progress.hidden=true;retry.hidden=false;
    status.textContent='Animaci se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.';
    console.warn('Animation loading failed:',key,error);
   });
  },0));
 }
 function install(definitions,dependencies){
  if(installed)throw Error('Progressive loader already installed');installed=true;assets=definitions;
  for(const [id,keys] of Object.entries(dependencies)){
   const module=Lab.modules.get(id);if(!module)throw Error('Missing lazy module: '+id);
   for(const key of keys)if(!assets[key])throw Error('Missing lazy asset: '+key);
   const original=module.mount;
   module.mount=function(app,...rest){return mountAfterLoading(module,keys,original,app,[app,...rest]);};
  }
 }
 window.LabProgress={install,accept,value,ready,load,mountFrame,clearFrame};
})();
