(function(root){'use strict';
// Pair the diagrams with the three steps of the calculation.
const graph=document.querySelector('.graph-panel'),diagrams=graph.querySelector('.origin-diagrams'),curve=graph.querySelector('.origin-curve'),plot=diagrams.querySelector('.plot-wrap'),voltage=diagrams.querySelector('.voltage-box');
graph.classList.remove('panel');graph.querySelector(':scope>h2').remove();
const triangle=document.createElement('section');triangle.className='panel origin-phasor';triangle.innerHTML='<h2>Napěťový trojúhelník</h2>';plot.before(triangle);triangle.append(plot,document.getElementById('legend'));
voltage.classList.add('panel');curve.classList.add('panel');diagrams.after(curve);
const theory=document.querySelector('main>details'),derivation=document.createElement('div');derivation.className='origin-derivation';derivation.append(graph.querySelector('.equations'),document.getElementById('lesson'));theory.querySelector('summary').after(derivation);theory.querySelector('summary').textContent='Odvození momentu, význam fázorů a předpoklady modelu';
const steps=document.createElement('section');steps.className='origin-steps';steps.setAttribute('aria-label','Tři kroky odvození momentu');const equationCards=derivation.querySelector('.equations');steps.append(...equationCards.children,graph.querySelector('.moment-result'));equationCards.remove();graph.append(steps);document.getElementById('metrics').remove();


const $=id=>document.getElementById(id),fmt=(n,d=2)=>(Math.abs(n)<.5*10**-d?0:n).toFixed(d).replace('.',','),num=(n,d=2)=>fmt(n,d).replace(',','{,}'),tex=s=>katex.renderToString(s.replaceAll('@',String.fromCharCode(92)),{throwOnError:true});
let phasorLabelScale=0;
const label=(x,y,w,s,color='#19313b')=>`<foreignObject x="${x-w/2}" y="${y-(phasorLabelScale?12*phasorLabelScale:17)}" width="${w}" height="${phasorLabelScale?24*phasorLabelScale:34}"><div xmlns="http://www.w3.org/1999/xhtml" class="math-label" style="color:${color};font-size:${phasorLabelScale?14*phasorLabelScale:w>300?15:12}px">${tex(w>300?colored(s):s)}</div></foreignObject>`;
// Match schema-drawing.js phasor shafts and open arrowheads in SVG units.
function arrow(a,b,color,width=2.4){const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy);if(n<.05)return '';const ux=dx/n,uy=dy/n,h=Math.min(5*(phasorLabelScale||1),n*.35),w=h*.36;return `<path d="M${a}L${b}" fill="none" stroke="${color}" stroke-width="${Math.min(width,2.2)*.6}" stroke-linecap="round"/><path d="M${b[0]-h*ux-w*uy},${b[1]-h*uy+w*ux}L${b}L${b[0]-h*ux+w*uy},${b[1]-h*uy-w*ux}" fill="none" stroke="${color}" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/>`;}
const colored=s=>s.replace(/@overline U_\{ib\}|@overline U_a|U_\{ib\}|U_a|@Delta U|@beta/g,v=>'@textcolor{'+(v.includes('ib')?'#ad701b':v.includes('Delta')?'#8661b1':v.includes('beta')?'#ba497d':'#007e6c')+'}{'+v+'}');
function characteristic(s,t){
 const el=$('momentCurve');if(!el)return;
 const samples=Array.from({length:181},(_,i)=>{const beta=-180+i*2;return {beta,m:SyncTorqueOriginModel.calculate({...s,beta},t).torque};});
 const width=Math.max(320,el.clientWidth||480),height=Math.max(200,el.clientHeight||400),left=58,right=width-42,top=52,bottom=height-38,center=(left+right)/2;
 const peak=Math.max(1,...samples.map(p=>Math.abs(p.m)))*1.12,order=10**Math.floor(Math.log10(peak)),limit=Math.ceil(peak/order*2)*order/2;
 const x=b=>left+(b+180)/360*(right-left),y=m=>top+(limit-m)/(2*limit)*(bottom-top),zero=y(0);
 el.setAttribute('viewBox','0 0 '+width+' '+height);
 let h='<defs><clipPath id="origin-moment-clip"><rect x="'+left+'" y="'+top+'" width="'+(right-left)+'" height="'+(bottom-top)+'"/></clipPath></defs>';
 h+='<rect x="'+left+'" y="'+top+'" width="'+(center-left)+'" height="'+(bottom-top)+'" fill="#f2f8f5"/><rect x="'+center+'" y="'+top+'" width="'+(right-center)+'" height="'+(bottom-top)+'" fill="#f8f5fa"/>';
 for(const v of [-1,-.5,0,.5,1]){const yy=y(limit*v);h+='<path d="M'+left+' '+yy+'H'+right+'" stroke="#e0e8e5" stroke-width=".8"/>'+label(26,yy,52,num(limit*v,1),'#657b82');}
 for(const beta of [180,90,0,-90,-180]){const xx=x(beta);h+='<path d="M'+xx+' '+top+'V'+bottom+'" stroke="#e4eae8" stroke-width=".8"/>'+label(xx,height-17,56,beta+'^{@circ}','#657b82');}
 h+='<path d="M'+left+' '+zero+'H'+right+'M'+center+' '+bottom+'V'+top+'" fill="none" stroke="#78908e" stroke-width="1"/>';
 h+='<text x="'+((left+center)/2)+'" y="34" text-anchor="middle" font-size="13" fill="#56746a">Motor</text><text x="'+((center+right)/2)+'" y="34" text-anchor="middle" font-size="13" fill="#75687f">Generátor</text>';
 h+=label(center,14,130,'M@,[ @mathrm{N@,m}]','#374f56')+label(right+22,zero,40,'@beta','#374f56');
 const curve=samples.map((p,i)=>(i?'L':'M')+x(p.beta).toFixed(2)+','+y(p.m).toFixed(2)).join('');
 h+='<path data-moment-curve="true" clip-path="url(#origin-moment-clip)" d="'+curve+'" fill="none" stroke="#007e6c" stroke-width="2.2" stroke-linejoin="round"/>';
 h+='<path d="M'+x(t.beta)+' '+zero+'V'+y(t.torque)+'" stroke="#ba497d" stroke-width="1" stroke-dasharray="3 3"/><circle data-working-point="true" data-beta="'+t.beta+'" data-moment="'+t.torque+'" cx="'+x(t.beta)+'" cy="'+y(t.torque)+'" r="5" fill="#ba497d" stroke="white" stroke-width="1.5"/>';
 el.innerHTML=h;el.setAttribute('data-limit',limit);
}
function diagram(t){
 const svg=$('plot');phasorLabelScale=760/Math.max(1,svg.clientWidth);const H=Math.max(365,760*svg.clientHeight/Math.max(1,svg.clientWidth)),drawingBottom=H-75;
 const {a}=t,vs=[[0,0],[1,0],a.E],xx=vs.map(v=>-v[1]),yy=vs.map(v=>-v[0]),k=Math.min(480/Math.max(.7,Math.max(...xx)-Math.min(...xx)),(H-150)/Math.max(1,Math.max(...yy)-Math.min(...yy))),ox=380-k*(Math.max(...xx)+Math.min(...xx))/2,oy=(drawingBottom+35)/2-k*(Math.max(...yy)+Math.min(...yy))/2,p=v=>[ox-k*v[1],oy-k*v[0]],O=p([0,0]),U=p([1,0]),E=p(a.E),mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
 let h=`<path d="M${ox} 22V${drawingBottom}M65 ${oy}H695" stroke="#d5dfdb" stroke-width="1"/><text x="${ox+7}" y="20" fill="#657b82" font-size="15">Re</text><text x="55" y="${oy-8}" fill="#657b82" font-size="15">Im</text><path data-voltage-triangle="true" d="M${O}L${E}L${U}Z" fill="#f7edcf" fill-opacity=".65"/>`;
 h+=arrow(O,U,'#007e6c')+arrow(O,E,'#ad701b')+arrow(E,U,'#8661b1');
 const left=E[0]>=ox,segments=[[O,U],[O,E],[E,U],[[ox,22],[ox,drawingBottom]],[[65,oy],[695,oy]]],boxes=[{x:ox-18,y:0,w:50,h:30},{x:35,y:oy-30,w:40,h:28}],pending=[];
 const arcSegments=(r,start,end)=>{const xy=t=>[ox-r*Math.sin(t),oy-r*Math.cos(t)];for(let i=0;i<32;i++)segments.push([xy(start+(end-start)*i/32),xy(start+(end-start)*(i+1)/32)]);};
 // Primary labels follow the vector tip; the difference label follows its normal.
 // Reject candidate boxes crossing any vector or an already placed label.
 const place=(...args)=>{pending.push(args);return "";};
 // Measure KaTeX, as in schema-drawing.js; keep the same coordinate system.
 const measureLabel=text=>{if(!document.createElement)return 56;const el=document.createElement('span');el.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font-size:'+(14*phasorLabelScale)+'px';el.innerHTML=tex(text);document.body.appendChild(el);const width=Math.ceil(el.offsetWidth)+8;el.remove();return Math.max(28,width);};
 const renderLabel=(a,b,text,color,secondary=false)=>{const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy),ux=n?dx/n:0,uy=n?dy/n:-1,anchor=secondary?mid(a,b):b,w=measureLabel(text),hh=24*phasorLabelScale;
  // Exact padded segment/rectangle clipping, matching schema-drawing.js.
  const hit=(box,c,d)=>{let lo=0,hi=1;const dx=d[0]-c[0],dy=d[1]-c[1],ps=[-dx,dx,-dy,dy],qs=[c[0]-box.x+3,box.x+w+3-c[0],c[1]-box.y+3,box.y+hh+3-c[1]];for(let i=0;i<4;i++){if(Math.abs(ps[i])<1e-9){if(qs[i]<0)return false;}else{const t=qs[i]/ps[i];if(ps[i]<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}}return true;};
  let best=null;
  for(const r of [24,38,54,74,96,125])for(let j=0;j<24;j++){const angle=Math.atan2(secondary?ux:uy,secondary?-uy:ux)+j*Math.PI/12,x=anchor[0]+r*Math.cos(angle),y=anchor[1]+r*Math.sin(angle),box={x:x-w/2,y:y-hh/2};if(box.x<15||box.x+w>745||box.y<34||box.y+hh>drawingBottom-15)continue;
   const score=segments.filter(v=>hit(box,...v)).length*10000+boxes.filter(q=>box.x<q.x+q.w+4&&box.x+w+4>q.x&&box.y<q.y+q.h+4&&box.y+hh+4>q.y).length*10000+r+Math.min(j,24-j)*2;
   if(!best||score<best.score)best={x,y,box,score};}
  if(best){boxes.push({...best.box,w,h:hh});return label(best.x,best.y,w,text,color);}return '';};
 h+=place(O,U,'@overline U_a','#007e6c')+place(O,E,'@overline U_{ib}','#ad701b');
 if(Math.hypot(U[0]-E[0],U[1]-E[1])>3)h+=place(E,U,'@Delta U','#8661b1',true);
 if(a.e>1e-8&&Math.abs(a.beta)>.05){const b=-a.beta*Math.PI/180,r=38,ex=ox+r*Math.sin(b),ey=oy-r*Math.cos(b);arcSegments(r,0,-b);h+=`<path d="M${ox} ${oy-r}A${r} ${r} 0 0 ${b>0?1:0} ${ex} ${ey}" fill="none" stroke="#ba497d" stroke-width="1"/>`+place(O,[ex,ey],'@beta','#ba497d');}
 if(a.amp>1e-8){const angle=Math.atan2(a.I[1],a.I[0]),xy=(r,t)=>[ox-r*Math.sin(t),oy-r*Math.cos(t)],radius=Math.cos(angle)<0?45:86,ar=Math.cos(angle)<0?34:62,end=xy(radius,angle),arc=xy(ar,angle),v=xy(ar+25,angle/2);segments.push([O,end]);arcSegments(ar,0,angle);h+=`<path d="M${O}L${end}" stroke="#3273b8" stroke-width="1.4" stroke-dasharray="3 4"/>`+place(O,end,'@overline I_a','#3273b8');if(Math.abs(angle)>.03)h+=`<path d="M${ox} ${oy-ar}A${ar} ${ar} 0 ${Math.abs(angle)>Math.PI?1:0} ${angle>0?0:1} ${arc}" fill="none" stroke="#3273b8" stroke-width="1"/>`+place(O,arc,'@varphi','#3273b8');}
 if(t.lossless&&Math.abs(E[0]-ox)>1){const foot=[ox,E[1]];segments.push([U,foot],[E,foot]);h+=`<path d="M${U}L${foot}" stroke="#9fbbb3" stroke-dasharray="4 4"/>`+arrow(E,foot,'#007e6c',3);}
 h+=pending.map(args=>renderLabel(...args)).join('');
 $('plot').setAttribute('viewBox','0 0 760 '+H);$('plot').innerHTML=h;phasorLabelScale=0;
}
function equations(id,title,lines){$(id+'Title').textContent=title;$(id).innerHTML=lines.map(s=>tex('@displaystyle '+colored(s))).join('');}
root.SyncTorqueOrigin=function(s,{phasor}){
 const read=(id,fallback)=>{const n=+$(id)?.value;return Number.isFinite(n)&&n>0?n:fallback;},t=SyncTorqueOriginModel.calculate(s,{voltage:read('baseVoltage',230),current:read('baseCurrent',10),frequency:read('baseFrequency',50),polePairs:Math.max(1,Math.round(read('polePairs',2)))}),{a}=t;
 diagram(t);phasor(a);characteristic(s,t);
 for(const svg of [$('plot'),$('voltage')])for(const path of svg.querySelectorAll('path[stroke]')){const axis=['#d5dfdb','#c7d5d1','#c7d5d1'].includes(path.getAttribute('stroke'));path.setAttribute('vector-effect','non-scaling-stroke');path.setAttribute('stroke-width',axis?'0.8':path.hasAttribute('stroke-dasharray')?'1':'1.4');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');}

 $('legend').innerHTML='<span style="color:#007e6c">Svorkové napětí</span><span style="color:#ad701b">Budicí napětí</span><span style="color:#8661b1">Úbytek ΔU</span>';
 const cosLines=['(@Delta U)^2=U_a^2+U_{ib}^2-2U_aU_{ib}@cos@beta'];
 if(t.smooth)cosLines.push('@Delta@overline U=(R_a+jX_s)@overline I_a',`I_a^*={@Delta U^*@over@sqrt{R_a^{*2}+X_s^{*2}}}=${num(t.cosineCurrent,3)}`);
 else cosLines.push('@begin{aligned}@Delta@overline U&=(R_a+jX_q)@overline I_a@@&@quad+j(X_d-X_q)@overline I_d@end{aligned}');
 equations('eq1','1. Úbytek napětí a proud',cosLines);
 if(t.lossless){equations('eq2','2. Činná složka proudu',[
  a.e>1e-8&&a.amp>1e-8&&Math.abs(t.cosPhi)>1e-8&&Math.abs(Math.sin(a.beta*Math.PI/180))>1e-8?'@frac{U_{ib}}{|@cos@varphi|}=@frac{X_sI_a}{|@sin@beta|}':'X_sI_a|@cos@varphi|=U_{ib}|@sin@beta|',
  `I_a^*@cos@varphi=-{U_{ib}^*@over X_s^*}@sin@beta=${num(t.sineCurrent,3)}`]);
 }else equations('eq2','2. Elektromagnetický výkon',[
  'P_{em}=m@operatorname{Re}(@overline U_i@overline I_a^*)',
  `P_{em}^*=P^*-R_a^*I_a^{*2}=${num(a.Pem,3)}`]);
 const law=t.lossless?'M=-@frac{mpU_aU_{ib}}{@omega_1X_s}@sin@beta':!a.r?'@begin{aligned}M={}&-@frac{mp}{@omega_1}@frac{U_aU_{ib}}{X_d}@sin@beta@@&-@frac{mp}{@omega_1}@frac{U_a^2}{2}@left(@frac1{X_q}-@frac1{X_d}@right)@sin(2@beta)@end{aligned}':'M=@frac{mp}{@omega_1}(U_aI_a@cos@varphi-R_aI_a^2)';
 equations('eq3','3. Elektromagnetický moment',[law,`@omega=@frac{@omega_1}{p}=@frac{2@pi f_1}{p}=${num(t.omega)}@,@mathrm{rad/s}`,`M=@frac{P_{em}}{@omega}=${num(t.torque)}@,@mathrm{N@,m}`]);
 $('status').textContent=(a.Pem>1e-7?'Motorický chod':a.Pem< -1e-7?'Generátorický chod':'Nulový moment')+(t.lossless?' · odvození sinovou větou':' · obecný výpočet');
 $('lesson').textContent='Úhel β roste od Ua k Uib proti směru hodinových ručiček: generátor má kladný β, motor záporný. Moment je kladný v motorickém režimu, záporný v generátorickém. Hvězdička značí poměrnou hodnotu; m = 3 fáze.';
 $('explanation').textContent='Tečkovaný paprsek v trojúhelníku ukazuje pouze směr proudu Ia, nikoli jeho velikost. Kosinová věta určí délku třetí strany napěťového trojúhelníku. U hladkého rotoru je tato délka rovna |Ra + jXs| Ia. Pro Ra = 0 pak sinová věta dává velikost činné složky; její znaménko určuje orientace β. Při zanedbání odporu je Ua = Ui a elektrický příkon se rovná elektromagnetickému výkonu. Při nenulovém Ra se odečtou měděné ztráty. U vyniklých pólů nelze všechny úbytky nahradit jediným jXsIa; obecný výpočet zahrnuje také reluktanční moment. Napětí a proud pro převod na N·m jsou efektivní fázové základy, nikoli sdružené napětí.';

 const aliases={Uib:'U_{ib}',Ua:'U_a',Ui:'U_i',Ia:'I_a',Xs:'X_s',Xd:'X_d',Xq:'X_q',Ra:'R_a',jXsIa:'jX_sI_a',jXs:'jX_s',Uif:'U_{if}',β:'@beta','β′':"@beta^{@prime}",φ:'@varphi','f₁':'f_1','N·m':'@mathrm{N@,m}',A:'@mathrm A',V:'@mathrm V',p:'p'};
 const pattern=/(?<![\p{L}\p{N}_])(?:jXsIa|jXs|Uib|Uif|Ua|Ui|Ia|Xs|Xd|Xq|Ra|β′|β|φ|f₁|N·m|[AV]|p(?=\s|$))(?![\p{L}\p{N}_])/gu;
 const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT),nodes=[];let node;while(node=walker.nextNode())if(!node.parentElement.closest('.katex,.origin-math,svg,script,style,select,option,output'))nodes.push(node);
 for(const node of nodes){const value=node.nodeValue;pattern.lastIndex=0;if(!pattern.test(value))continue;pattern.lastIndex=0;const fragment=document.createDocumentFragment();let last=0;for(const m of value.matchAll(pattern)){fragment.append(document.createTextNode(value.slice(last,m.index)));const span=document.createElement('span');span.className='origin-math';span.innerHTML=tex(aliases[m[0]]);fragment.append(span);last=m.index+m[0].length;}fragment.append(document.createTextNode(value.slice(last)));node.replaceWith(fragment);}
 for(const input of document.querySelectorAll('.controls input[type=range]')){const output=$(input.id+'Out');if(output)output.innerHTML=tex(num(s[input.id])+(input.id==='beta'?'^{@circ}':''));}
 root.torqueOriginState=t;return a;
};
if($('losslessExample'))$('losslessExample').onclick=()=>{$('type').value='smooth';$('r').value='0';$('r').dispatchEvent(new Event('input',{bubbles:true}));};
})(window);
