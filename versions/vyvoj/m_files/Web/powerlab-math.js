/* Shared offline mathematical typesetting for DOM, SVG and canvas labels. */
(function boot(){
'use strict';
if(!document.createTreeWalker)return;
if(typeof katex==='undefined'){document.addEventListener('DOMContentLoaded',boot,{once:true});return;}
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const greek={α:'alpha',β:'beta',γ:'gamma',δ:'delta',Δ:'Delta',ε:'varepsilon',η:'eta',θ:'theta',λ:'lambda',μ:'mu',ν:'nu',ξ:'xi',π:'pi',ρ:'rho',σ:'sigma',τ:'tau',φ:'varphi',Φ:'Phi',ψ:'psi',Ψ:'Psi',ω:'omega',Ω:'Omega'};
const subs={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','ₐ':'a','ₑ':'e','ₕ':'h','ᵢ':'i','ⱼ':'j','ₖ':'k','ₗ':'l','ₘ':'m','ₙ':'n','ₚ':'p','ᵣ':'r','ₛ':'s','ₜ':'t','ᵤ':'u','ᵥ':'v','ₓ':'x','꜀':'c'};
const known={Pem:'P_{\\mathrm{em}}','Pδ':'P_{\\delta}',PCu2:'P_{\\mathrm{Cu}2}',Rz:'R_z',μr:'\\mu_r',ℓFe:'\\ell_{\\mathrm{Fe}}',Re:'\\operatorname{Re}',Im:'\\operatorname{Im}',MMF:'\\mathrm{MMF}',MMN:'\\mathrm{MMN}',RFe:'R_{\\mathrm{Fe}}',Imax:'I_{\\max}',Pmax:'P_{\\max}',Bmax:'B_{\\max}',Bmin:'B_{\\min}',Hmax:'H_{\\max}',Hc:'H_{\\mathrm c}',Br:'B_{\\mathrm r}',Bm:'B_{\\mathrm m}',Bs:'B_{\\mathrm s}',kW:'\\mathrm{kW}',Hz:'\\mathrm{Hz}',kHz:'\\mathrm{kHz}',Wb:'\\mathrm{Wb}',Nm:'\\mathrm{N\\,m}',rpm:'\\mathrm{rpm}',pu:'\\mathrm{pu}',mm:'\\mathrm{mm}',cm:'\\mathrm{cm}',kg:'\\mathrm{kg}',ms:'\\mathrm{ms}',kWh:'\\mathrm{kWh}',iμ:'i_{\\mu}',Xμ:'X_{\\mu}',ψs:'\\psi_{\\mathrm s}',ψr:'\\psi_{\\mathrm r}',δψ:'\\delta_{\\psi}'};
// Czech prose is left in the UI font; only complete mathematical tokens are matched.
const pattern=/(?<![\p{L}\p{N}_])(?:PCu2|Pem|Pδ|Rz|μr|ℓFe|y_d|RFe|Imax|Pmax|Bmax|Bmin|Hmax|Hc|Br|Bm|Bs|Re|Im|MMF|MMN|kWh|kHz|kW|Hz|Wb|Nm|rpm|pu|mm|cm|kg|ms|iμ|Xμ|ψs|ψr|δψ|[A-ZαβγδΔεηθλμνξπρστφΦψΨωΩ][₀-₉ₐₑₕᵢⱼₖₗₘₙₚᵣₛₜᵤᵥₓ꜀0-9]*(?:[,′'″]|_[a-zA-Z0-9]+)?|[a-z][₀-₉ₐₑₕᵢⱼₖₗₘₙₚᵣₛₜᵤᵥₓ꜀0-9]+|[fnpqstxyz](?=\s*(?:[=\[(]|$)))(?:\(t\))?(?![\p{L}\p{N}_])/gu;
function latex(token,vector=false){if(token.endsWith("(t)"))return latex(token.slice(0,-3),vector)+"(t)";if(vector)return "\\mathbf{"+latex(token)+"}";if(known[token])return known[token];let t=token,prime='';if(/[′'″]$/.test(t)){prime="^{\\prime}";t=t.slice(0,-1);}let chars=Array.from(t),base=chars.shift(),sub=chars.map(c=>subs[c]??c).join('').replace(/^_/,'').replace(/,$/,'');base=greek[base]?'\\'+greek[base]:base;return base+(sub?'_{'+sub+'}':'')+prime;}
const cache=new Map();
function math(token,vector=false){const key=(vector?"vector:":"")+token;if(cache.has(key))return cache.get(key);const html='<span class="pl-math" role="math" aria-label="'+esc(token)+'">'+katex.renderToString(latex(token,vector),{throwOnError:false,output:'html',strict:'ignore'})+'</span>';cache.set(key,html);if(cache.size>1500)cache.delete(cache.keys().next().value);return html;}
function richSymbols(text,plainMMF=false,vector=false){let found=false,last=0,out='';pattern.lastIndex=0;for(const m of text.matchAll(pattern)){if(plainMMF&&m[0]==='MMF')continue;found=true;out+=esc(text.slice(last,m.index))+math(m[0],vector);last=m.index+m[0].length;}return found?out+esc(text.slice(last)):null;}

/* Transformer quantities: typeset the value and upright unit together. */
function transformerRich(text,plainMMF,vector){
 const render=(tex,label)=>'<span class="pl-math" role="math" aria-label="'+esc(label)+'">'+katex.renderToString(tex,{throwOnError:true,output:'html',strict:'ignore'})+'</span>';
 const num=s=>s.replace(/[−–]/g,'-').replace(/\s/g,'').replace(/,/g,'{,}').replace(/∞/g,'\\infty').replace(/±/g,'\\pm ').replace(/([\d.{}]+)[eE]([+-]?\d+)/g,'$1\\cdot10^{$2}');
 const units={'Ω':'\\Omega','mΩ':'\\mathrm{m}\\Omega','cm²':'\\mathrm{cm}^{2}','mm²':'\\mathrm{mm}^{2}','%':'\\%','°':'{}^{\\circ}'};
 const compound={'∞':'\\infty','kA':'\\mathrm{kA}','kVA':'\\mathrm{kVA}','mWb':'\\mathrm{mWb}','mH':'\\mathrm{mH}','ωt':'\\omega t','τ/T':'\\tau/T','t/T':'t/T','B(τ)':'B(\\tau)','Φ(τ)':'\\Phi(\\tau)','Bm/Bk':'B_m/B_k','Td/T':'T_d/T','U₁,ef':'U_{1,\\mathrm{ef}}','iμ':'i_\\mu','X/R':'X/R'};
 const quantity=/(?<![\p{L}\p{N}_])([±+−–-]?(?:\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?|∞))\s*(kVA|mWb|kHz|cm²|mm²|mΩ|kA|kV|kW|Wb|Hz|mm|cm|ms|mH|[VAWTHsΩ%°])(?![\p{L}\p{N}_])|(?<![\p{L}\p{N}_])(?:kVA|kA|mWb|mH|[iu](?=\s*[=\[(]))(?![\p{L}\p{N}_])|∞|ωt|τ\/T|t\/T|B\(τ\)|Φ\(τ\)|Bm\/Bk|Td\/T|U₁,ef|iμ|X\/R|\[(?:kA|mWb|A\/m|V|A|T|ms|Wb)\]/gu;
 if(/^[\s±+−–\d.,eE-]+$/.test(text)&&/\d/.test(text))return render(num(text),text);
 let last=0,out='',found=false;
 for(const m of text.matchAll(quantity)){
  found=true;const before=text.slice(last,m.index);out+=richSymbols(before,plainMMF,vector)||esc(before);
  let tex=compound[m[0]]||latex(m[0],vector);
  if(m[1])tex=num(m[1])+(m[2]==='°'?'':'\\,')+(units[m[2]]||'\\mathrm{'+m[2]+'}');
  if(m[0].startsWith('['))tex='[\\mathrm{'+m[0].slice(1,-1)+'}]';
  out+=render(tex,m[0]);last=m.index+m[0].length;
 }
 if(!found)return richSymbols(text,plainMMF,vector);
 const tail=text.slice(last);return out+(richSymbols(tail,plainMMF,vector)||esc(tail));
}

/* Native induction lesson: complete quantities and multi-letter subscripts. */
function inductionRich(text,plainMMF,vector){
 const aliases={ns:'n_s',Mz:'M_z',Xm:'X_m',kX:'k_X',kR:'k_R',Rh:'R_h',Xh:'X_h',Rd:'R_d',Xd:'X_d',U:'U'};
 const unit={'Nm':String.raw`\mathrm{N\,m}`,'kg·m²':String.raw`\mathrm{kg\,m^2}`,'min⁻¹':String.raw`\mathrm{min}^{-1}`,'Ω':String.raw`\Omega`,'%':String.raw`\%`,'°':String.raw`{}^{\circ}`};
 const re=/(?<![\p{L}\p{N}_])([+−-]?\d+(?:[.,]\d+)?)\s*(kg·m²|min⁻¹|Nm|kW|Wb|Hz|[AVsΩ%°])(?![\p{L}\p{N}_])|(?<![\p{L}\p{N}_])(?:ns|Mz|Xm|kX|kR|Rh|Xh|Rd|Xd|cos\s*φ|η\*|min⁻¹|kg·m²|k(?=\s*(?:[=.,;:]|$)))(?![\p{L}\p{N}_])/gu;
 let last=0,out='',found=false;
 const render=tex=>'<span class="pl-math" role="math">'+katex.renderToString(tex,{throwOnError:false,output:'html',strict:'ignore'})+'</span>';
 for(const m of text.matchAll(re)){
  found=true;const before=text.slice(last,m.index);out+=richSymbols(before,plainMMF,vector)||esc(before);
  const token=m[0],tex=m[1]?m[1].replace('−','-').replace(/[.,]/,'{,}')+(m[2]==='°'?'':String.raw`\,`)+(unit[m[2]]||String.raw`\mathrm{`+m[2]+'}'):
   aliases[token]||unit[token]||(/^cos/.test(token)?String.raw`\cos\varphi`:token==='η*'?String.raw`\eta^{*}`:'k');
  out+=render(tex);last=m.index+token.length;
 }
 if(!found)return richSymbols(text,plainMMF,vector);
 const tail=text.slice(last);return out+(richSymbols(tail,plainMMF,vector)||esc(tail));
}
function rich(text,plainMMF=false,vector=false){
 if(/^(?:(?:Motorové|Generátorové) )?V-křivky(?: a PQ diagram| při stálém činném výkonu| motoru i generátoru)?$/.test(text.trim()))return null;
 if(document.querySelector('[data-module="10-asynchronni"]'))return inductionRich(text,plainMMF,vector);
 return document.querySelector('main[data-transformer-lesson],.gridplots.transformer')?transformerRich(text,plainMMF,vector):richSymbols(text,plainMMF,vector);
}

window.PowerLabMath={rich,latex,richQuantities:transformerRich};
const excluded='[data-plain-text],[data-plain-svg],script,style,textarea,input,select,option,code,pre,.katex,.pl-math,[data-tex],.pl-svg-math,.pl-canvas-math';
const svgPairs=new WeakMap(),svgFontSizes=new WeakMap(),measureCache=new Map();let measure;
function dimensions(html,size){const key=size+html;if(measureCache.has(key))return measureCache.get(key);if(!measure){measure=document.createElement('span');measure.className='pl-canvas-math';measure.style.cssText='position:fixed;left:-10000px;top:0;white-space:nowrap;visibility:hidden;pointer-events:none';document.body.appendChild(measure);}measure.style.fontSize=size+'px';measure.innerHTML=html;const r=measure.getBoundingClientRect(),v={w:r.width,h:r.height};measureCache.set(key,v);if(measureCache.size>1500)measureCache.delete(measureCache.keys().next().value);return v;}
function svgText(el){if(!el.isConnected||el.closest('[data-plain-svg]')||el.closest('.pl-svg-math')||el.querySelector('textPath'))return;let original=svgFontSizes.get(el);if(!original){original=parseFloat(getComputedStyle(el).fontSize)||12;svgFontSizes.set(el,original);}const matrix=el.getScreenCTM(),scale=matrix?Math.hypot(matrix.a,matrix.b):1;if(scale>0)el.style.fontSize=Math.max(original,14/scale)+'px';const text=el.textContent,html=rich(text,false,!!el.closest("[data-vector]"));let fo=svgPairs.get(el);if(!html){if(fo){fo.remove();svgPairs.delete(el);el.style.removeProperty('opacity');}return;}
 const style=getComputedStyle(el),size=parseFloat(style.fontSize)||12;let box;try{box=el.getBBox();}catch{return;}if(!box.width&&!box.height)return;
 const dim=dimensions(html,size),anchor=style.textAnchor,extra=dim.w-box.width;
 if(!fo){fo=document.createElementNS('http://www.w3.org/2000/svg','foreignObject');fo.classList.add('pl-svg-math');fo.setAttribute('pointer-events','none');const div=document.createElement('div');div.setAttribute('xmlns','http://www.w3.org/1999/xhtml');fo.appendChild(div);el.after(fo);svgPairs.set(el,fo);}
 const x=box.x-(anchor==='middle'?extra/2:anchor==='end'?extra:0),y=box.y+(box.height-dim.h)/2;
 fo.setAttribute('x',x);fo.setAttribute('y',y);fo.setAttribute('width',dim.w+4);fo.setAttribute('height',dim.h+4);if(el.hasAttribute('transform'))fo.setAttribute('transform',el.getAttribute('transform'));else fo.removeAttribute('transform');
 fo.firstChild.style.cssText='white-space:nowrap;line-height:1.2;font-size:'+size+'px;color:'+style.fill+';font-weight:'+style.fontWeight; if(fo.firstChild.innerHTML!==html)fo.firstChild.innerHTML=html;el.style.opacity='0';
}
function visit(root){if(!root||!root.isConnected)return;if(root.nodeType===3){const p=root.parentElement;if(!p||p.closest(excluded))return;const text=p.closest('svg text');if(text){svgText(text);return;}if(p.closest('svg'))return;const html=rich(root.nodeValue,!!p.closest('h1,h2,h3,h4,h5,h6,.modulehead,.plothead,.cardhead'));if(html){const wrap=document.createElement('span');wrap.className='pl-typeset';wrap.innerHTML=html;root.replaceWith(wrap);}return;}
 if(root.nodeType!==1||root.closest(excluded))return;if(root.matches('svg text')){svgText(root);return;}
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n,items=[];while(n=walker.nextNode())items.push(n);for(const item of items)visit(item);
}
let pending=new Set(),scheduled=false;function flush(){scheduled=false;observer.disconnect();const nodes=[...pending];pending.clear();for(const node of nodes)visit(node);observer.observe(document.body,{subtree:true,childList:true,characterData:true});}
const observer=new MutationObserver(records=>{for(const r of records){if(r.target.parentElement?.closest(excluded)||r.target.nodeType===1&&r.target.closest(excluded))continue;if(r.type==='characterData')pending.add(r.target);else{if(r.target instanceof SVGTextElement)pending.add(r.target);else for(const n of r.addedNodes)pending.add(n);}}if(pending.size&&!scheduled){scheduled=true;queueMicrotask(flush);}});
// Canvas labels are real KaTeX DOM overlays in the canvas coordinate system.
if(typeof CanvasRenderingContext2D!=='undefined'){
 const proto=CanvasRenderingContext2D.prototype,nativeFill=proto.fillText,nativeClear=proto.clearRect,states=new WeakMap();
 function layer(ctx){let state=states.get(ctx.canvas);if(state)return state;const parent=ctx.canvas.parentElement;if(!parent)return null;if(getComputedStyle(parent).position==='static')parent.style.position='relative';const root=document.createElement('div');root.className='pl-canvas-math';root.style.cssText='position:absolute;inset:0;overflow:hidden;pointer-events:none';parent.appendChild(root);state={root,nodes:[],index:0};states.set(ctx.canvas,state);return state;}
 proto.clearRect=function(...args){const state=states.get(this.canvas);if(state){state.index=0;for(const n of state.nodes)n.style.display='none';}return nativeClear.apply(this,args);};
 proto.fillText=function(value,x,y,maxWidth){const originalFont=this.font;const fontMatch=originalFont.match(/([\d.]+)px/);if(fontMatch&&+fontMatch[1]<14)this.font=originalFont.replace(fontMatch[0],'14px');try{return drawLabel.call(this,value,x,y,maxWidth);}finally{this.font=originalFont;}};
 function drawLabel(value,x,y,maxWidth){const text=String(value),html=rich(text);if(!html)return nativeFill.apply(this,arguments);const state=layer(this);if(!state)return nativeFill.apply(this,arguments);let node=state.nodes[state.index++];if(!node){node=document.createElement('span');node.style.cssText='position:absolute;white-space:nowrap;transform-origin:0 0;line-height:1.2';state.root.appendChild(node);state.nodes.push(node);}if(node.innerHTML!==html)node.innerHTML=html;
 const size=parseFloat(this.font.match(/([\d.]+)px/)?.[1]||11),dim=dimensions(html,size),m=this.getTransform(),sx=this.canvas.clientWidth/this.canvas.width,sy=this.canvas.clientHeight/this.canvas.height;
 let dx=this.textAlign==='center'?-dim.w/2:['right','end'].includes(this.textAlign)?-dim.w:0;let dy=this.textBaseline==='middle'?-dim.h/2:['top','hanging'].includes(this.textBaseline)?0:-dim.h*.8;
 const scale=maxWidth&&dim.w>maxWidth?maxWidth/dim.w:1;node.style.display='block';node.style.fontSize=size+'px';node.style.color=typeof this.fillStyle==='string'?this.fillStyle:'#193741';node.style.opacity=this.globalAlpha;node.style.left=this.canvas.offsetLeft+'px';node.style.top=this.canvas.offsetTop+'px';node.style.transform='matrix('+[m.a*sx,m.b*sy,m.c*sx,m.d*sy,m.e*sx,m.f*sy].join(',')+') translate('+x+'px,'+y+'px) translate('+dx+'px,'+dy+'px) scaleX('+scale+')';
 };
}
window.addEventListener('resize',()=>{requestAnimationFrame(()=>{for(const text of document.querySelectorAll('svg text'))svgText(text);});});
function start(){pending.add(document.body);flush();document.fonts?.ready.then(()=>{for(const text of document.querySelectorAll('svg text'))svgText(text);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
