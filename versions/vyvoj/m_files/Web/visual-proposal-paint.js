/* Presentation adapter for the separate proposal, including srcdoc lessons.
   Only paint properties change. Geometry, pixel data and models stay intact. */
function installVisualProposalPaint(win,css,swatches){
 'use strict';
 if(win.HiFyzikoVisualProposalPaint)return;
 const doc=win.document,active=()=>doc.documentElement.hasAttribute('data-visual-proposal');
 const semantic={'#007c69':'#65dec1','#007e6c':'#65dec1','#00846e':'#65dec1',
  '#c34d32':'#f8859a','#c34d28':'#f8859a','#254fe1':'#7fa5ff','#254ee3':'#7fa5ff',
  '#244fe3':'#7fa5ff','#285aca':'#7fa5ff','#426ed4':'#7fa5ff',
  '#7856a6':'#c49df7','#8055b0':'#c49df7','#ca603a':'#ffad86',
  '#2a6ab3':'#7da9ed','#cf8137':'#ffbb67','#b46615':'#ffbb67'};
 function parse(value){
  if(typeof value!=='string')return null;
  let s=value.trim().toLowerCase();if(s==='white')s='#ffffff';if(s==='black')s='#000000';
  if(/^#[\da-f]{3,4}$/.test(s))s='#'+[...s.slice(1)].map(c=>c+c).join('');
  if(/^#[\da-f]{6}(?:[\da-f]{2})?$/.test(s))return [1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255).concat(s.length===9?parseInt(s.slice(7,9),16)/255:1);
  const m=s.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
  return m?[+m[1]/255,+m[2]/255,+m[3]/255,m[4]===undefined?1:+m[4]]:null;
 }
 const hex=v=>'#'+v.slice(0,3).map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
 const lum=v=>v.slice(0,3).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
 const withAlpha=(color,alpha)=>alpha>=.999?color:'rgba('+parse(color).slice(0,3).map(x=>Math.round(x*255)).join(',')+','+alpha+')';
 function color(value,role){
  const v=parse(value);if(!v||v[3]===0)return value;
  const key=hex(v),l=lum(v),chroma=Math.max(...v.slice(0,3))-Math.min(...v.slice(0,3));
  // Preserve the required electric/magnetic field colours and quantitative RGB palettes.
  if(key==='#b57825'||key==='#356ac3')return value;
  if(role==='surface'){
   if(l<.65)return value;
   return withAlpha(v[0]-v[2]>.10?'#29231b':'#0f1d2e',v[3]);
  }
  if(role==='line'&&chroma<.24&&l>.45)return withAlpha('#24405b',v[3]);
  if(semantic[key])return withAlpha(semantic[key],v[3]);
  if(role==='text'||role==='line'){
   if(chroma<.25&&l<.35)return withAlpha(role==='text'&&l<.10?'#edf6ff':'#9cb6cb',v[3]);
   if(role==='text'&&(l+.05)/(.012+.05)<4.5){
    let q=0,mixed=v;while(q<.7&&(lum(mixed)+.05)/.062<4.5){q+=.05;mixed=v.map((x,i)=>i<3?x+(1-x)*q:x);}
    return withAlpha(hex(mixed),v[3]);
   }
  }
  return value;
 }
 const literal=/#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})\b|rgba?\([^)]*\)|\b(?:white|black)\b/gi;
 function paintValue(value,role){
  if(/url\(/i.test(value))return value;
  return value.replace(literal,v=>color(v,role));
 }
 function sheetRules(rules){
  let result='';
  for(const rule of rules){
   if(rule.style&&rule.selectorText){
    // Shared root tokens are provided by visual-proposal.css.
    if(rule.selectorText.includes(':root')||rule.selectorText.includes('data-visual-proposal'))continue;
    const declarations=[];
    for(const prop of Array.from(rule.style)){
     let role=null;
     if(prop==='color'||prop==='text-decoration-color'||prop==='caret-color')role='text';
     else if(prop==='background'||prop==='background-color'||prop==='background-image')role='surface';
     else if(/^border(?:-(?:top|right|bottom|left))?(?:-color)?$/.test(prop)||prop==='outline-color')role='line';
     else if(prop==='stroke')role='line';
     else if(prop==='fill'&&/(?:text|label|note|caption)/i.test(rule.selectorText))role='text';
     if(!role)continue;
     // Colour scales are measurements. Their gradients must stay unchanged.
     if(role==='surface'&&/(?:colorLegend|colorbar|colourbar|color-scale)/i.test(rule.selectorText))continue;
     if(role==='surface'&&/(?:swatch|\.mark\b)/i.test(rule.selectorText))role='semantic';
     const old=rule.style.getPropertyValue(prop),next=paintValue(old,role);
     if(next!==old)declarations.push(prop+':'+next+'!important');
    }
    if(declarations.length)result+='html[data-visual-proposal] :is('+rule.selectorText+'){'+declarations.join(';')+'}\n';
   }else if(rule.cssRules&&rule.conditionText){
    const kind=rule.cssText.slice(0,rule.cssText.indexOf('{'));
    result+=kind+'{'+sheetRules(rule.cssRules)+'}\n';
   }
  }
  return result;
 }
 function attributeRules(){
  let result='';const values=new Set([...swatches,'white','black']);
  const selector=(attr,value)=>'['+attr+'='+JSON.stringify(value)+' i]';
  for(const value of values){
   const v=parse(value);if(!v)continue;
   const text=color(value,'text'),line=color(value,'line'),surface=color(value,'surface');
   const base='html[data-visual-proposal] ';
   if(text!==value)result+=base+'svg :is(text,tspan)'+selector('fill',value)+'{fill:'+text+'!important}\n';
   if(line!==value)result+=base+'svg '+selector('stroke',value)+'{stroke:'+line+'!important}\n';
   const fill=semantic[hex(v)];
   if(fill)result+=base+'svg '+selector('fill',value)+'{fill:'+withAlpha(fill,v[3])+'!important}\n';
   if(surface!==value&&Math.max(...v.slice(0,3))-Math.min(...v.slice(0,3))<.12)
    result+=base+'svg rect'+selector('fill',value)+'{fill:'+surface+'!important}\n';
   const rgb='rgb('+v.slice(0,3).map(x=>Math.round(x*255)).join(', ')+')';
   for(const alias of new Set([value,rgb]))for(const space of ['',' ']){
    if(text!==value)result+=base+selector('style','color:'+space+alias).replace('[style=','[style*=')+'{color:'+text+'!important}\n';
    if(text!==value)result+=base+'svg :is(text,tspan)'+selector('style','fill:'+space+alias).replace('[style=','[style*=')+'{fill:'+text+'!important}\n';
   }
  }
  return result;
 }
 const attributes=attributeRules();
 let generated;
 function refresh(){
  let rules='';
  for(const sheet of doc.styleSheets){
   if(sheet.ownerNode?.id?.startsWith('visual-proposal'))continue;
   try{rules+=sheetRules(sheet.cssRules);}catch(error){/* Cross-origin sheets retain their own presentation. */}
  }
  if(!generated){generated=doc.createElement('style');generated.id='visual-proposal-paint';doc.head.append(generated);}
  const next=rules+attributes;if(generated.textContent!==next)generated.textContent=next;
 }
 // Rendered drawing methods only: never modify ImageData, drawImage, gradients,
 // WebGL uniforms or offscreen rasters containing measured colour-map values.
 const proto=win.CanvasRenderingContext2D?.prototype;
 if(proto){
  // Canvas getters normalize rgb(...) to hex. Remember the assignment syntax
  // so a computed colour-map bin can never be mistaken for a paper token.
  const assignments=new WeakMap(),internal=new WeakSet();
  for(const property of ['fillStyle','strokeStyle']){
   const descriptor=Object.getOwnPropertyDescriptor(proto,property);
   if(!descriptor?.set)continue;
   Object.defineProperty(proto,property,{...descriptor,set(value){
    descriptor.set.call(this,value);
    if(!internal.has(this)){
     let values=assignments.get(this);if(!values){values={};assignments.set(this,values);}
     values[property]=typeof value==='string'&&/^rgba?\(/i.test(value);
    }
   }});
  }
  for(const [method,property,role] of [['fillText','fillStyle','text'],['strokeText','strokeStyle','text'],['stroke','strokeStyle','line'],['strokeRect','strokeStyle','line'],['fillRect','fillStyle','surface'],['fill','fillStyle','semantic']]){
   const original=proto[method];if(!original)continue;
   proto[method]=function(...args){
    if(!active()||!this.canvas.isConnected)return original.apply(this,args);
    const old=this[property];
    const numerical=assignments.get(this)?.[property];
    const next=typeof old==='string'&&!numerical?color(old,role):old;
    try{internal.add(this);if(next!==old)this[property]=next;return original.apply(this,args);}
    finally{if(next!==old)this[property]=old;internal.delete(this);}
   };
  }
 }
 // Prepare each lesson before its body scripts render the first frame.
 const descriptor=Object.getOwnPropertyDescriptor(win.HTMLIFrameElement.prototype,'srcdoc');
 function documentHTML(html){
  if(!active()||typeof html!=='string'||!/<head\b/i.test(html)||html.includes('id="visual-proposal-style"'))return html;
  const encode=value=>JSON.stringify(value).replace(/</g,'\\u003c');
  const code='('+installVisualProposalPaint.toString()+')(window,'+encode(css)+','+encode(swatches)+');';
  return html.replace(/<html\b([^>]*)>/i,'<html$1 data-visual-proposal="laboratory">')
   .replace(/<\/head>/i,()=>'<style id="visual-proposal-style">'+css+'</style><scr'+'ipt>'+code+'</scr'+'ipt></head>');
 }
 if(descriptor?.set)Object.defineProperty(win.HTMLIFrameElement.prototype,'srcdoc',{...descriptor,set(value){descriptor.set.call(this,documentHTML(value));}});
 win.HiFyzikoVisualProposalPaint={color,documentHTML,refresh};
 refresh();
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',refresh,{once:true});
}
