(function(root){
function create(env){
 const states=new WeakMap();let serial=0;
 function scoped(art){const prefix='rotor-layer-'+(++serial)+'-',ids=[...art.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);for(const id of new Set(ids))art=art.replaceAll('id="'+id+'"','id="'+prefix+id+'"').replaceAll('url(#'+id+')','url(#'+prefix+id+')').replaceAll('href="#'+id+'"','href="#'+prefix+id+'"');return art;}
 function update(target,art,key,kind){
  let state=states.get(target);if(state?.key===key)return;
  if(state&&state.kind===kind){state.current.innerHTML=scoped(art);state.key=key;return;}
  const next=env.document.createElementNS('http://www.w3.org/2000/svg','g');next.setAttribute('class','rotor-current');next.innerHTML=scoped(art);
  if(state){const old=state.current,opacity=env.getComputedStyle(old).opacity;old.style.setProperty('--rotor-start-opacity',opacity||'1');old.setAttribute('class','rotor-leaving');old.setAttribute('aria-hidden','true');next.classList.add('rotor-entering');env.setTimeout(()=>old.remove(),380);env.setTimeout(()=>next.classList.remove('rotor-entering'),380);}
  target.append(next);states.set(target,{current:next,key,kind});target.dataset.kind=kind;
 }
 return {update};
}
if(typeof module==='object')module.exports=create;else root.SyncTorqueTransition=create(root);
})(typeof window==='object'?window:globalThis);
