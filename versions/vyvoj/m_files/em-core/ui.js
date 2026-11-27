const C=DATA.config, MU0=4*Math.PI*1e-7, NS='http://www.w3.org/2000/svg', PI=Math.PI;
const vectorReference=Math.max(...DATA.vectors.flatMap(row=>row.map(q=>Math.hypot(...q.b))));
const $=id=>document.getElementById(id);
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const fmt=(v,n=2)=>Number(v).toLocaleString('cs-CZ',{minimumFractionDigits:n,maximumFractionDigits:n});
const adjustableCoil = document.body.dataset.voltage === 'transform';
let run=true, phase=.15, lastT=0, directionSign=1, arrowOffset=0, lastArrow=0, mode=MODULE==='EM01'?(document.body.dataset.voltage || 'transform'):'self', angle=0, I=1;
const ORX=212, ORY=220, SCALE=1320, X2=C.d;
let fieldPaths=[];const graphScales={};let scaleNoticeUntil=0,scaleNoticeTimer=0;
function announceScale(){scaleNoticeUntil=performance.now()+3500;clearTimeout(scaleNoticeTimer);scaleNoticeTimer=setTimeout(()=>render(),3550)}
const sceneSymbolTex={'Uₘ':'U_m','Ψ₁₁':'\\Psi_{11}','L₁':'L_1','L₂':'L_2','mH':'\\mathrm{mH}','N₁':'N_1','N₂':'N_2','i₁(t)':'i_1(t)','i₁':'i_1','uᵢ':'u_i','û₂':'\\hat u_2','ûᵢ':'\\hat u_i','Ψ̂':'\\hat\\Psi','Ψ₂₁':'\\Psi_{21}','B₁·n₂':'\\mathbf B_1\\cdot\\mathbf n_2','B·n₂':'\\mathbf B\\cdot\\mathbf n_2','B₁':'\\mathbf B_1','n₂':'\\mathbf n_2','S₂':'S_2','α':'\\alpha','di₁/dt=0':'\\mathrm d i_1/\\mathrm d t=0','dα/dt=0':'\\mathrm d\\alpha/\\mathrm d t=0','M(α)':'M(\\alpha)','µT':'\\mu\\mathrm T','µH':'\\mu\\mathrm H','mWb':'\\mathrm{mWb}','mV':'\\mathrm{mV}','kHz':'\\mathrm{kHz}','Hz':'\\mathrm{Hz}','≥':'\\ge','·':'\\cdot','°':'{}^\\circ','%':'\\%','A·závit':'\\mathrm{A\\cdot závit}'};
const symbolPattern=Object.keys(sceneSymbolTex).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
function mathPattern(){return new RegExp(symbolPattern+'|(?<![\\p{L}\\d])[BAVkM](?![\\p{L}\\d])|[-+]?\\d+(?:[,.]\\d+)?|[=<>]','gu')}
function mixedTokens(text){return [...text.matchAll(mathPattern())]}
function tokenTex(token){return sceneSymbolTex[token]||(/^[BAVkM]$/.test(token)?(token==='B'?'\\mathbf B':['k','M'].includes(token)?token:'\\mathrm{'+token+'}'):token.replace(',','{,}'))}
function mathifyText(root){if(!root||!['EM01','EM02'].includes(MODULE))return;const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walk.nextNode()){const n=walk.currentNode;if(!n.parentElement.closest('svg,script,style,[data-tex],.katex,#motional-rod-panel'))nodes.push(n)}for(const node of nodes){const text=node.textContent,matches=mixedTokens(text);if(!matches.length)continue;const fragment=document.createDocumentFragment();let last=0;for(const m of matches){fragment.append(document.createTextNode(text.slice(last,m.index)));const span=document.createElement('span');span.dataset.tex=tokenTex(m[0]);fragment.append(span);last=m.index+m[0].length}fragment.append(document.createTextNode(text.slice(last)));node.replaceWith(fragment)}}
function sceneMathText(attrs,parent,text){const pattern=mathPattern();let tex='',last=0;for(const m of text.matchAll(pattern)){if(m.index>last)tex+='\\text{'+text.slice(last,m.index)+'}';tex+=tokenTex(m[0]);last=m.index+m[0].length}if(last<text.length)tex+='\\text{'+text.slice(last)+'}';const size=Number(attrs['font-size']||13),width=Math.min(630,Math.max(70,text.length*size*.72+20)),anchor=attrs['text-anchor'],x=Number(attrs.x||0)-(anchor==='middle'?width/2:anchor==='end'?width:0);const box=document.createElementNS(NS,'foreignObject');for(const [key,value] of Object.entries({x,y:Number(attrs.y||0)-size*1.05,width,height:size*2.5,'data-scene-math':text}))box.setAttribute(key,value);const span=document.createElement('div');span.setAttribute('xmlns','http://www.w3.org/1999/xhtml');span.style.cssText='font-size:'+size+'px;color:'+(attrs.fill||'#36505b')+';text-align:'+(anchor==='middle'?'center':anchor==='end'?'right':'left')+';white-space:nowrap';span.dataset.tex=tex;if(text.startsWith('Ψ₂₁')){span.className='flux-sign-badge';box.setAttribute('data-flux-sign','true')}box.append(span);parent.append(box);return box}
function svg(tag,attrs,parent,contents){if(tag==='text'&&['EM01','EM02'].includes(MODULE)&&['scene','chart','currentPreview'].includes(parent?.closest('svg')?.id)&&mixedTokens(String(contents)).length)return sceneMathText(attrs,parent,String(contents));const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs||{}))e.setAttribute(k,String(v));if(contents!==undefined)e.textContent=contents;if(parent)parent.appendChild(e);return e;}
function project(p){return {x:ORX+SCALE*p[0],y:ORY-SCALE*p[1]};}
function pathD(points){return points.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' ');}
function interp(arr,deg){deg=((deg%360)+360)%360;let idx=Math.floor(deg);let a=deg-idx;return arr[idx]*(1-a)+arr[idx+1]*a;}
function baseM(a){return interp(DATA.M,a);}
function baseDM(a){return interp(DATA.dM,a);}
function n1(){return Number($('N1').value);}
function n2(){return Number($('N2').value);}
function mutual(a){return baseM(a)*(n1()/2)*(n2()/2);}
function dMutual(a){return baseDM(a)*(n1()/2)*(n2()/2);}
function ownL(){return C.L1_2*(n1()/2)**2;}
function secondL(){return C.L2_2*(n2()/2)**2;}
function maths(){if(!window.katex)return;document.querySelectorAll('[data-tex]').forEach(node=>{const t=node.dataset.tex;if(node.dataset.done===t)return;try{window.katex.render(t,node,{throwOnError:false,displayMode:node.dataset.display==='1'});node.dataset.done=t;}catch(err){node.textContent=t}});}
window.addEventListener('katex-ready',maths);
function mark(id,formula){$(id).setAttribute('data-tex',formula);maths()}
// Fit the physical cross-section uniformly; move its captions and inset into
// the available height instead of stretching the coil geometry.
function sceneFrame(){
 const el=$('scene'),ratio=el.clientWidth/Math.max(1,el.clientHeight);
 if(!(ratio>0))return {left:0,top:0,width:660,height:450};
 const width=clamp(450*ratio,575,660),height=Math.max(450,width/ratio);
 return {left:0,top:(450-height)/2,width,height};
}
function renderSourceCoils(frame=sceneFrame()){const g=$('sourceCoils');g.replaceChildren();for(let ix of C.x1){let points=[];for(let j=0;j<=96;j++){let t=2*PI*j/96;points.push(project([ix,C.r1*Math.cos(t),C.r1*Math.sin(t)]));}drawRing(g,points,true)}
 svg('text',{x:ORX,y:415-frame.top,'font-size':14,fill:'#36505b','text-anchor':'middle','font-weight':700},$('sceneText'),'Cívka 1 · budicí');
 svg('text',{x:ORX+SCALE*C.d-75,y:415-frame.top,'font-size':14,fill:'#36505b','text-anchor':'start','font-weight':700},$('sceneText'),'Cívka 2 · rozpojená');
 svg('text',{x:18,y:29+frame.top,'font-size':19,fill:'#668089','text-anchor':'start','font-weight':600},$('sceneText'),'Magnetické napětí Uₘ = N₁ i₁ = '+fmt(n1()*I,1)+' A');
 svg('text',{x:ORX+SCALE*C.d-75,y:438-frame.top,'font-size':17,fill:'#64858b','text-anchor':'start'},$('sceneText'),'2 zobrazené závity, N₂ efektivních');
}
function drawRing(g,pts,source=false){
 if(true){
  const a=pts[0],b=pts[Math.floor((pts.length-1)/2)],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),rot=Math.atan2(dy,dx)*180/PI-90;
  const body=svg('g',{transform:`translate(${a.x} ${a.y}) rotate(${rot})`,'data-coil-turn':source?'source':'receiver'},g);
  if(source)svg('rect',{x:-7,y:0,width:14,height:len,rx:6,fill:'url(#copper)',stroke:'#8f451c','stroke-width':1.4},body);
  if(!source)svg('path',{d:`M0 9V${len-9}`,stroke:'#a66f40','stroke-width':1.1,'stroke-dasharray':'3 5',opacity:.22,'data-cutaway':'true'},body);
  if(source)svg('path',{d:`M-2.5 8V${len-8}`,stroke:'#fff6c5','stroke-width':1.4,opacity:.65},body);
  for(const [j,y] of [0,len].entries()){
   svg('circle',{cx:0,cy:y,r:9,fill:'url(#coilEnd)',stroke:'#7f3b20','stroke-width':1.4},body);
   svg('circle',{cx:0,cy:y,r:6.3,fill:'none',stroke:'#edb86a','stroke-width':1},body);
   if(source){const cross=j===0?I<0:I>=0,opacity=Math.min(1,Math.abs(I)/.1);
    if(cross)svg('path',{d:`M-3.6 ${y-3.6}L3.6 ${y+3.6}M3.6 ${y-3.6}L-3.6 ${y+3.6}`,stroke:'#263b47','stroke-width':1.8,opacity},body);
    else svg('circle',{cx:0,cy:y,r:2.5,fill:'#263b47',opacity},body);
   }
  }return;
 }
 if(!source)pts=pts.slice(Math.floor((pts.length-1)/2));
 svg('path',{d:pathD(pts),stroke:'#843c21','stroke-width':10,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},g);
 svg('path',{d:pathD(pts),stroke:'url(#copper)','stroke-width':7.8,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},g);
 const shine=pts.slice(8,46);
 svg('path',{d:pathD(shine),stroke:'#fff3c5','stroke-width':1.35,fill:'none',opacity:.7},g);
}
function buildFieldLines(){const g=$('backgroundLineGroup');g.replaceChildren();fieldPaths=[];
 const selected=DENSE_LINES;
 for(const points of selected){for(const mirror of [1,-1]){
  let pts=points.map(p=>project([p[0],p[1]*mirror,0]));
  let line=svg('path',{d:pathD(pts),stroke:'#3569d9','stroke-width':1.2,fill:'none','stroke-linecap':'round',opacity:.52},g);
  const total=line.getTotalLength();
  if(total>20){let ar=svg('path',{d:'M -5 -3.8 L 5.5 0 L -5 3.8 L -3 0 Z',fill:'#254ed2',stroke:'#fff','stroke-width':.6},g);
    fieldPaths.push({path:line,arrow:ar,total,offset:(fieldPaths.length*.311) % 1});
  }
 }}
 // axial central field direction: show through the center as well, with moving arrows
 const axisP=[];for(let x=-.16;x<=.265;x+=.0035)axisP.push(project([x,0,0]));
 let ax=svg('path',{d:pathD(axisP),stroke:'#3764db','stroke-width':2.0,fill:'none',opacity:.46},g);
 fieldPaths.push({path:ax,arrow:svg('path',{d:'M -5 -4 L 6 0 L -5 4 L -3 0 Z',fill:'#254ed2',stroke:'#fff','stroke-width':.7},g),total:ax.getTotalLength(),offset:.31});
}
function currentSignField(ts){if(!lastArrow)lastArrow=ts;let dt=Math.max(0,Math.min(.06,(ts-lastArrow)/1000));lastArrow=ts;
 let s=Math.sign(I);let strength=Math.abs(I)*n1()/150;let color=s>=0?'#2c58cc':'#9941bd';let inactive=strength<.005;
 if(run&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!inactive)arrowOffset=(arrowOffset+dt*.115*s+1)%1;
 for(let o of fieldPaths){let along=o.total*((arrowOffset+o.offset)%1),a=o.path.getPointAtLength(along),bef=o.path.getPointAtLength(Math.max(0,along-3)),aft=o.path.getPointAtLength(Math.min(o.total,along+3));
  let rot=Math.atan2(aft.y-bef.y,aft.x-bef.x)*180/PI + (s<0?180:0);
  o.arrow.setAttribute('transform',`translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${rot.toFixed(1)})`);
  o.arrow.setAttribute('opacity',inactive?'0':String(.34+ .6*clamp(strength/2,0,1)));
  o.arrow.setAttribute('fill',color);o.path.setAttribute('stroke',color);o.path.setAttribute('opacity',inactive?'.025':String(.08+.82*Math.sqrt(clamp(strength/5,0,1))));o.path.setAttribute('stroke-width',.65+1.8*Math.sqrt(clamp(strength/5,0,1)));
 }
 requestAnimationFrame(currentSignField);
}
function ringNormal(a){return [Math.cos(a),Math.sin(a),0]};
function ringU(a){return [-Math.sin(a),Math.cos(a),0]};
function receivePoint(a,xi,r,t){let n=ringNormal(a),u=ringU(a);return [C.d+xi*n[0]+r*Math.cos(t)*u[0],xi*n[1]+r*Math.cos(t)*u[1],r*Math.sin(t)];}
function arrow(g,p,vec,col,width=2.25,fade=1){let xx=p.x+vec.x,yy=p.y+vec.y;let norm=Math.hypot(vec.x,vec.y);if(norm<.05)return;fade*=Math.min(1,norm/2);const head=Math.min(5.2,norm*.4),wing=Math.min(2.8,norm*.22);
 svg('line',{x1:p.x.toFixed(2),y1:p.y.toFixed(2),x2:(xx-head*vec.x/norm).toFixed(2),y2:(yy-head*vec.y/norm).toFixed(2),stroke:col,'stroke-width':Math.min(width,wing*1.5),'stroke-linecap':'butt',opacity:fade},g);
 let dx=vec.x/norm,dy=vec.y/norm, px=-dy,py=dx;
 let d=`M ${xx.toFixed(2)} ${yy.toFixed(2)} L ${(xx-head*dx+wing*px).toFixed(2)} ${(yy-head*dy+wing*py).toFixed(2)} L ${(xx-head*dx-wing*px).toFixed(2)} ${(yy-head*dy-wing*py).toFixed(2)} Z`;
 svg('path',{d,fill:col,opacity:fade},g);
}
function drawInset(g,a,current){
 const cx=555,cy=159,rad=a*PI/180,n=ringNormal(rad),u=ringU(rad);
 const B0=DATA.vectors[Math.round(((a%360)+360)%360)%360][0].b;
 const bUnit=Math.hypot(B0[0],B0[1],B0[2])||1;
 const bnUnit=B0[0]*n[0]+B0[1]*n[1];
 const bn=bnUnit*(n1()/2)*current;
 const signB=current<0?-1:1;
 svg('circle',{cx,cy:143,r:101,fill:'#fff',stroke:'#d1e0df','stroke-width':1.7,opacity:.97},g);
 svg('text',{x:cx,y:85,fill:'#4c6871','font-size':12,'font-weight':750,'text-anchor':'middle'},g,'DETAIL PLOCHY S₂');
 // View from above: the receiver surface is seen edge-on as a teal segment.
 const ux=u[0],uy=-u[1], nx=n[0],ny=-n[1];
 svg('line',{x1:cx-51*ux,y1:cy-51*uy,x2:cx+51*ux,y2:cy+51*uy,stroke:'#34a9b0','stroke-width':5,'stroke-linecap':'round',opacity:.80},g);
 // Local B at the centre of the receiving turn, not an invented uniform-field arrow.
 let bdx=B0[0], bdy=-B0[1],bl=Math.hypot(bdx,bdy)||1;
 arrow(g,{x:cx-signB*48*bdx/bl,y:cy+13-signB*48*bdy/bl},{x:signB*91*bdx/bl,y:signB*91*bdy/bl},current<0?'#9941bd':'#2859d0',2.9,Math.min(.95,Math.abs(current)));
 svg('text',{x:cx+signB*57*bdx/bl,y:cy+13+signB*57*bdy/bl+12,fill:current<0?'#9941bd':'#2859d0','font-size':11,'font-weight':800,'text-anchor':'middle'},g,'B₁');
 // Surface normal and measured normal component, both at the actual selected angle.
 arrow(g,{x:cx,y:cy},{x:41*nx,y:41*ny},'#718790',1.9,.86);
 svg('text',{x:cx+57*nx,y:cy+57*ny-7,fill:'#566f78','font-size':12,'font-weight':700,'text-anchor':'middle'},g,'n₂');
 const q=bnUnit/bUnit;
 const c=bn<0?'#a64bb4':'#db762c';
 if(Math.abs(q)>0.005&&Math.abs(current)>.00001){arrow(g,{x:cx+7*uy,y:cy-7*ux},{x:39*q*nx*signB,y:39*q*ny*signB},c,3.5,.96);}
 svg('text',{x:cx,y:cy+43,fill:bn<0?'#a64bb4':'#b35f21','font-size':11,'font-weight':750,'text-anchor':'middle'},g,'B₁·n₂ = '+fmt(bn*1e6,1)+' µT');
}
function scene(a,current){
 const frame=sceneFrame();
 $('scene').setAttribute('viewBox',[frame.left,frame.top,frame.width,frame.height].join(' '));
 const clip=$('sceneClip').querySelector('rect');
 clip.setAttribute('y',frame.top+36);clip.setAttribute('width',frame.width-30);
 clip.setAttribute('height',frame.height-90);
 I=current;angle=a;let rad=a*PI/180, n=ringNormal(rad);
 $('sourceCoils').replaceChildren();$('sceneText').replaceChildren();renderSourceCoils(frame);
 const disk=$('receiveDisk'),vec=$('fieldSamples'),c2=$('receiveCoils');disk.replaceChildren();vec.replaceChildren();c2.replaceChildren();
 let surf=[];for(let j=0;j<=100;j++){let t=2*PI*j/100;surf.push(project(receivePoint(rad,0,C.r2,t)));}
 let phi=baseM(a)*(n1()/2)*(n2()/2)*current;let rel=clamp(Math.abs(baseM(a))/Math.abs(C.M0_2),0,1);
 let fc=phi<0?'#bb66c9':'#39aeba';
 svg('path',{d:pathD(surf)+' Z',fill:fc,opacity:.05+.19*rel,stroke:fc,'stroke-width':1.2,'stroke-dasharray':'4 5'},disk);
 svg('text',{x:ORX+SCALE*C.d+3,y:96,fill:phi<0?'#9a45b5':'#128d9b','font-size':16,'font-weight':800,'text-anchor':'middle'},vec,phi>=0?'Ψ₂₁ ≥ 0':'Ψ₂₁ < 0');
 // Nine measured B vectors from the same Biot–Savart model used to integrate the surface flux.
 let j0=Math.floor(((a%360)+360)%360),u=((a%360)+360)%360-j0;
 const next=DATA.vectors[(j0+1)%360];let vs=DATA.vectors[j0].map((q,k)=>({p:q.p.map((v,i)=>v+(next[k].p[i]-v)*u),b:q.b.map((v,i)=>v+(next[k].b[i]-v)*u),bn:q.bn+(next[k].bn-q.bn)*u}));
 const vColor=current<0?'#9941bd':'#2457ce';
 for(let q=0;q<vs.length;q++){
  const w=vs[q],p=project(w.p),B=w.b;
  const dx=32*B[0]/vectorReference,dy=-32*B[1]/vectorReference,scale=1;
  const strength=Math.min(1.5,Math.abs(current)*n1()/300);
  arrow(vec,p,{x:dx*scale*Math.sign(current)*strength,y:dy*scale*Math.sign(current)*strength},vColor,2.0,clamp(Math.abs(current),0,1));
  if([0,1,2].includes(q)){
    const ax=37*n[0]*w.bn/vectorReference*Math.sign(current),ay=-37*n[1]*w.bn/vectorReference*Math.sign(current);
    const blend=Math.tanh(w.bn*current/vectorReference*8),t=(blend+1)/2;
    const col='rgb('+[187,86,139].map((v,i)=>Math.round(v+([228,129,50][i]-v)*t)).join(',')+')';
    const component=svg('g',{'data-normal-component':q,'data-vx':ax*strength,'data-vy':ay*strength},vec);
    arrow(component,{x:p.x+3,y:p.y+3},{x:ax*strength,y:ay*strength},col,3.1,.95);
  }
 }
 // Explicitly labelled oriented surface normal, replacing ambiguous green arrow.
 const cen=project([C.d,0,0]);let nP=project([C.d+.030*n[0],.030*n[1],0]);
 arrow(vec,{x:cen.x,y:cen.y},{x:nP.x-cen.x,y:nP.y-cen.y},'#6c8188',2.15,.95);
 svg('text',{x:nP.x+9,y:nP.y-6,fill:'#647b84','font-size':13,'font-weight':700},vec,'n₂');
 for(let xi of C.x2){let ring=[];for(let j=0;j<=120;j++){let t=2*PI*j/120;ring.push(project(receivePoint(rad,xi,C.r2,t)));}drawRing(c2,ring);}
 // Enlargement of the normal component: a geometric measurement, not a color-coded guess.
 const detail=svg('g',{transform:'translate('+(frame.width-660)+' '+(frame.top-8)+')'},c2);drawInset(detail,a,current);
 return phi;
}
function graph(curves,xmarker,axis='percent',scales=[1,1],units=['','']){
 const g=$('chartGrid'),cg=$('chartCurves'),p=$('chartPointer');g.replaceChildren();cg.replaceChildren();p.replaceChildren();
 const chartHeight=['EM01','EM02'].includes(MODULE)?Math.max(150,560*$('chart').clientHeight/Math.max(1,$('chart').clientWidth)):405;$('chart').setAttribute('viewBox','0 0 560 '+chartHeight);const plotTop=40,plotBottom=chartHeight-45,plotMid=(plotTop+plotBottom)/2,plotHalf=(plotBottom-plotTop)/2;const xx=t=>72+416*t, yy=v=>plotMid-plotHalf*v;
 const clip=svg('clipPath',{id:'curveBounds'},g);svg('rect',{x:72,y:plotTop,width:416,height:plotBottom-plotTop},clip);cg.setAttribute('clip-path','url(#curveBounds)');
 for(const v of [-1,0,1]){svg('text',{x:65,y:yy(v)+5,'text-anchor':'end',fill:'#2855cf','font-size':18},g,fmt(v*scales[0],3));svg('text',{x:495,y:yy(v)+5,'text-anchor':'start',fill:'#c64d35','font-size':18},g,fmt(v*scales[1],2));}
 svg('text',{x:72,y:23,fill:'#2855cf','font-size':20},g,units[0]);svg('text',{x:488,y:23,fill:'#c64d35','font-size':20,'text-anchor':'end'},g,units[1]);
 for(let j=0;j<=10;j++){let x=xx(j/10);svg('line',{x1:x,y1:plotTop-5,x2:x,y2:plotBottom+5,stroke:'#e8efeb','stroke-width':1},g);if(j%2===0)svg('text',{x,y:chartHeight-12,'text-anchor':'middle',fill:'#8fa5aa','font-size':18},g,axis==='percent'?j*10+'%':j*18+'°');}
 for(let j=0;j<=8;j++){let y=plotTop+j*(plotBottom-plotTop)/8;svg('line',{x1:72,y1:y,x2:488,y2:y,stroke:j===4?'#a1b7b6':'#e8efec','stroke-width':j===4?1.5:1},g);}
 svg('line',{x1:xx(xmarker),y1:plotTop-5,x2:xx(xmarker),y2:plotBottom+5,stroke:'#6b868e','stroke-dasharray':'4 6','stroke-width':1.5},p);
 for(let [fn,color] of curves){let pts=[];for(let k=0;k<=260;k++){let x=k/260;pts.push({x:xx(x),y:yy(fn(x))});}
 svg('path',{d:pathD(pts),stroke:color,'stroke-width':3.4,fill:'none','stroke-linecap':'round'},cg);
 let val=fn(xmarker);svg('circle',{cx:xx(xmarker),cy:yy(val),visibility:Math.abs(val)>1?'hidden':'visible',r:6,fill:'#fff',stroke:color,'stroke-width':3},p);
 }
}
function scaleNotice(){  if(performance.now()<scaleNoticeUntil){const g=$('chartPointer');svg('rect',{x:205,y:63,width:250,height:38,rx:7,fill:'#fff4dc',stroke:'#c48d2c','stroke-width':1.5,'data-scale-notice':'true'},g);svg('text',{x:330,y:88,'text-anchor':'middle','font-size':18,'font-weight':750,fill:'#754d12'},g,'Měřítko změněno');}}
function setData(id,v){const el=$(id);if(['EM01','EM02'].includes(MODULE)){const match=String(v).match(/^([-+\d\s.,]+)\s*(mWb|mV|A|Hz|kHz|µH|°\/s|°|%)?$/);if(match){const units={'µH':'\\mu\\mathrm H','°':'{}^\\circ','°/s':'{}^\\circ\\!/\\mathrm s','%':'\\%'};el.dataset.tex=match[1].trim().replace(/\s/g,'').replace(',','{,}')+(match[2]?'\\,'+(units[match[2]]||'\\mathrm{'+match[2]+'}'):'');return}}el.textContent=v;}
function choose(m){mode=m;document.querySelectorAll('[data-mode]').forEach(e=>e.classList.toggle('active',e.dataset.mode===m));render();}
function fitInductionViewport(){if(!['EM01','EM02'].includes(MODULE)||innerWidth<900)return;const layout=document.querySelector('main>.layout');if(!layout||!layout.getClientRects().length)return;const uniform=layout.closest('main').classList.contains('uniform-module-layout'),outer=uniform?0:window.frameElement?window.frameElement.getBoundingClientRect().top+parent.scrollY:0,viewport=uniform?(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--module-host-height'))||1000):window.frameElement?parent.innerHeight:innerHeight,top=layout.getBoundingClientRect().top+scrollY;layout.style.setProperty('--em-layout-height',Math.max(280,viewport-outer-top-104)+'px')}
window.addEventListener('resize',fitInductionViewport);
function render(){
 fitInductionViewport();
 const p=phase,amp=Number($('amp')?.value||20)/10;
 if(MODULE==='EM02'){
  let ang=Number($('angle').value),cur=Number($('I').value)/10;
  let L1=ownL(),L2=secondL(),M=mutual(ang),ps1=L1*cur,ps2=M*cur,k=M/Math.sqrt(L1*L2);
  scene(ang,cur);
  const Lscale=C.L1_2*(250/2)**2,Mscale=Math.max(...DATA.M.map(Math.abs))*(250/2)*(180/2);
  graph([[x=>L1/Lscale,'#2a58ce'],[x=>baseM(180*x)*(n1()/2)*(n2()/2)/Mscale,'#c64d35']],ang/180,'deg',[Lscale*1e3,Mscale*1e6],['L₁ [mH]','M [µH]']);
  setData('angleOut',fmt(ang,0)+'°');setData('IOut',fmt(cur,1)+' A');setData('N1Out',n1());setData('N2Out',n2());
  setData('statA',fmt(ps1*1e3,3)+' mWb');setData('statB',fmt(ps2*1e3,3)+' mWb');setData('statC',fmt(L1*1e6,2)+' µH');setData('statD',fmt(M*1e6,2)+' µH');
  setData('kText',fmt(k,4));
  $('referenceInfo').textContent='L₁ = '+fmt(L1*1e6,2)+' µH · M(0°) = '+fmt(mutual(0)*1e6,2)+' µH';
  $('sceneExplain').textContent='Pole první cívky vytváří vlastní vazbu Ψ₁₁ i vzájemnou vazbu Ψ₂₁. U odkryté druhé cívky vidíš místní B₁ (modře) a kolmou složku B₁·n₂ (oranžově). Natočení mění vzájemnou vazbu, vlastní indukčnost L₁ zůstává stejná.';
  $('modeExpl').textContent='Obě vazby existují současně: Ψ₁₁ = L₁ i₁ a Ψ₂₁ = M i₁. Druhá cívka je rozpojená, proto v ní neteče proud, který by zpětně ovlivnil první cívku.';
  $('formSelf').classList.remove('muted');$('formMut').classList.remove('muted');
 }else{
  let freq=10**(Number($('freq').value)/1000*Math.log10(5000));
  let omega=Number($('omega').value)*PI/180, offset=Number($('offset').value), ia=Number($('amp').value)/10;
  let ang=mode==='transform'?(adjustableCoil?offset:0):(offset+360*p)%360;
  let cur=mode==='transform'?ia*Math.sin(2*PI*p):ia;
  let M=mutual(ang),Md=dMutual(ang),psi=M*cur, ui=mode==='transform'?-M*ia*2*PI*freq*Math.cos(2*PI*p):-ia*Md*omega;
  scene(ang,cur);
  const psiNorm=Math.abs((mode==='transform'?M:mutual(0))*ia);
  let uiMax=mode==='transform'?Math.abs(M*ia*2*PI*freq):Math.abs(ia*omega*Math.max(...DATA.dM.map(x=>Math.abs(x)))*(n1()/2)*(n2()/2));
  $('referenceInfo').textContent='Amplitudy: Ψ̂ = '+fmt(psiNorm*1e3,4)+' mWb · ûᵢ = '+fmt(uiMax*1e3,2)+' mV';
  const oldScale=graphScales[mode];
  if(!oldScale)graphScales[mode]=[Math.max(psiNorm*1.2,1e-8),Math.max(uiMax*1.2,1e-6)];
  else if(psiNorm>oldScale[0]||uiMax>oldScale[1]){graphScales[mode]=[Math.max(oldScale[0],psiNorm*1.2),Math.max(oldScale[1],uiMax*1.2)];announceScale()}
  const [psiScale,uScale]=graphScales[mode];
  $('voltageAmplitude').textContent='Amplituda napětí û₂ = '+(uiMax>=1?fmt(uiMax,2)+' V':fmt(uiMax*1e3,2)+' mV');
  $('scaleWarning').textContent='Rozsah se zvětší jen při překročení osy. Pro menší průběhy lze měřítko přizpůsobit tlačítkem.';
  const flux=t=>mode==='transform'?M*ia*Math.sin(2*PI*t):mutual((offset+360*t)%360)*ia;
  const voltage=t=>mode==='transform'?-M*ia*2*PI*freq*Math.cos(2*PI*t):-ia*dMutual((offset+360*t)%360)*omega;
  graph([[t=>flux(t)/psiScale,'#2e59ce'],[t=>voltage(t)/uScale,'#ce4e33']],p,'percent',[psiScale*1e3,uScale*1e3],['Ψ₂₁ [mWb]','uᵢ [mV]']);

  drawCurrentPreview(ia,freq,p);
  setData('N1Out',n1());setData('N2Out',n2());setData('ampOut',fmt(ia,1)+' A');setData('freqOut',freq<100?fmt(freq,1)+' Hz':freq<1000?fmt(freq,0)+' Hz':fmt(freq/1000,2)+' kHz');setData('omegaOut',Number($('omega').value)+' °/s');setData('offsetOut',Number($('offset').value)+'°');
  setData('statA',fmt(psi*1e3,4)+' mWb');setData('statB',fmt(ui*1e3,2)+' mV');setData('statC',fmt(cur,2)+' A');setData('statD',fmt(ang,0)+'°');
  $('sceneExplain').textContent=mode==='transform'?'Obě cívky stojí. Během půlperiody se obrací směr B₁ i šipek na siločarách. Změna pole mění tokovou vazbu Ψ₂₁, takže vzniká uᵢ.':'Budicí proud je konstantní. Druhá cívka se otáčí a mění se skutečný integrál B₁·n₂ přes její závity. Právě tato změna způsobuje pohybovou složku uᵢ.';
  $('transBox')?.classList.toggle('muted',mode!=='transform');$('moveBox')?.classList.toggle('muted',mode!=='motion');
  $('freqWrap').classList.toggle('hidden',mode!=='transform');$('omegaWrap').classList.toggle('hidden',mode!=='motion');$('offsetWrap').classList.toggle('hidden',mode!=='motion'&&!adjustableCoil);
  if($('modeExpl'))$('modeExpl').textContent=mode==='transform'?'Pevná geometrie: dα/dt=0. Aktivní je transformační člen totální časové derivace.':'Neměnný proud: di₁/dt=0. Aktivní je pohybový člen; k jeho vyčíslení používáme derivaci numericky vypočteného M(α).';
  setData('phaseOut',Math.round(p*100)+' %');
 }
 scaleNotice();if(['EM01','EM02'].includes(MODULE))for(const id of ['sceneExplain','modeExpl','referenceInfo','voltageAmplitude'])mathifyText($(id));maths();fitInductionViewport();
}
function drawCurrentPreview(amplitude,frequency,p){
 const g=$('currentPreview');g.replaceChildren();const h=Math.max(110,560*g.clientHeight/Math.max(1,g.clientWidth));g.setAttribute('viewBox','0 0 560 '+h);const left=50,right=515,cy=h*.53,sy=(h-48)/6,cycles=1+9*Math.log10(frequency)/Math.log10(5000);
 for(const v of [-3,0,3]){svg('line',{x1:left,y1:cy-v*sy,x2:right,y2:cy-v*sy,stroke:v?'#e3ece8':'#9cb2b5','stroke-width':1},g);svg('text',{x:42,y:cy-v*sy+5,'text-anchor':'end','font-size':18,fill:'#526e77'},g,v+'');}
 svg('text',{x:left,y:19,'font-size':20,fill:'#2855cf'},g,'i₁(t) [A]');
 const pts=[];for(let k=0;k<=650;k++){const t=k/650;pts.push({x:left+(right-left)*t,y:cy-sy*amplitude*(mode==='transform'?Math.sin(2*PI*(p+cycles*t)):1)})}
 svg('path',{d:pathD(pts),stroke:'#2855cf','stroke-width':2.5,fill:'none'},g);
 const instantaneous=amplitude*(mode==='transform'?Math.sin(2*PI*p):1),level=cy-sy*instantaneous;
 svg('line',{x1:left,y1:level,x2:right,y2:level,stroke:'#2855cf','stroke-width':1,opacity:.25},g);
 svg('circle',{cx:left,cy:level,r:5,fill:'#fff',stroke:'#2855cf','stroke-width':2,'data-current-marker':instantaneous},g);
 const readout=svg('foreignObject',{x:310,y:2,width:205,height:33},g),value=document.createElement('div');value.setAttribute('xmlns','http://www.w3.org/1999/xhtml');value.style.cssText='font-size:20px;text-align:right;color:#2855cf';value.dataset.tex='i_1='+fmt(instantaneous,2).replace(',','{,}')+'\\,\\mathrm A';readout.append(value);

 svg('text',{x:282,y:h-3,'text-anchor':'middle','font-size':15,fill:'#526e77'},g,mode==='transform'?'Vyšší frekvence → hustší vlny':'Pohybové napětí: budicí proud je konstantní');
}
function init(){
 if(MODULE==='EM01'){
  const surface=$('scene');let dragging=null;
  const point=e=>{const m=surface.getScreenCTM();return m?new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()):null};
  const bearing=p=>Math.atan2(ORY-p.y,p.x-(ORX+SCALE*C.d));
  surface.style.touchAction='none';surface.style.cursor='grab';
  const hint=document.createElementNS(NS,'title');hint.textContent='Táhněte cívku kolem jejího středu pro změnu natočení.';surface.prepend(hint);
  surface.addEventListener('pointerdown',e=>{if(e.button!==0||dragging||(mode!=='motion'&&!adjustableCoil))return;const p=point(e);if(!p)return;const r=Math.hypot(p.x-(ORX+SCALE*C.d),p.y-ORY);if(r<12||r>SCALE*C.r2+40)return;dragging={id:e.pointerId,angle:bearing(p),orientation:Number($('offset').value)};if(!adjustableCoil){run=false;setData('play','▶ Přehrát')}surface.setPointerCapture(e.pointerId);surface.style.cursor='grabbing';e.preventDefault()});
  surface.addEventListener('pointermove',e=>{if(!dragging||dragging.id!==e.pointerId)return;const p=point(e);if(!p)return;const a=bearing(p),delta=Math.atan2(Math.sin(a-dragging.angle),Math.cos(a-dragging.angle));dragging.angle=a;
   if(adjustableCoil){
    dragging.orientation=(dragging.orientation+delta*180/PI+360)%360;
    $('offset').value=Math.round(dragging.orientation);
   }else{
    phase=((phase+delta/(2*PI))%1+1)%1;
    $('phase').value=phase*1000;
   }
   render()});
  const stop=e=>{if(!dragging||dragging.id!==e.pointerId)return;dragging=null;surface.style.cursor='grab';if(surface.hasPointerCapture(e.pointerId))surface.releasePointerCapture(e.pointerId)};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,stop);
 }
 document.body.classList.add('em-lesson');if(MODULE==='EM02')document.body.classList.add('em-inductance');
 if(['EM01','EM02'].includes(MODULE)){mathifyText(document.querySelector('main'));document.querySelectorAll('.control>label').forEach(label=>{const output=label.querySelector('output');if(!output)return;const title=document.createElement('span');for(const child of [...label.childNodes])if(child!==output)title.append(child);label.prepend(title)})}
 if(MODULE==='EM01'){const mid=document.querySelector('main>.layout>.card:nth-child(2)'),tools=document.createElement('div');tools.className='em-graph-tools';mid.querySelector('.chartBox').before(tools);tools.append(mid.querySelector('.presets'),mid.querySelector('.scaleControls'));}
 if(MODULE==='EM01')$('fitScale').onclick=()=>{delete graphScales[MODULE==='EM01'?mode:'inductance'];announceScale();render()}; 

 $('fieldVisibility').onchange=()=>{$('backgroundLineGroup').style.display=$('fieldVisibility').checked?'':'none'};
 document.querySelectorAll('[data-angle]').forEach(b=>b.onclick=()=>{const a=+b.dataset.angle;if(MODULE==='EM02')$('angle').value=a;else{run=false;phase=a/360;$('phase').value=phase*1000;setData('play','▶ Přehrát')}render()});
 buildFieldLines();renderSourceCoils();
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>choose(b.dataset.mode));
 document.querySelectorAll('input[type=range]').forEach(e=>e.addEventListener('input',()=>{if(e.id==='phase'){phase=Number(e.value)/1000;run=false;setData('play', '▶ Přehrát');}render();}));
 let play=$('play');if(play)play.onclick=()=>{run=!run;play.textContent=run?'Ⅱ Pozastavit':'▶ Přehrát';};
 maths();render();requestAnimationFrame(currentSignField);
 if(MODULE==='EM02'||document.body.dataset.voltage){let lastSize='',queued=false;const observer=new ResizeObserver(()=>{const box=$('chart').getBoundingClientRect(),size=[box.width,box.height,$('scene').clientWidth,$('scene').clientHeight].map(v=>v.toFixed(2)).join('/');if(size===lastSize||queued)return;lastSize=size;queued=true;requestAnimationFrame(()=>{queued=false;render()})});observer.observe(document.querySelector('.chartBox'));observer.observe(document.querySelector('.sceneBox'));document.fonts.ready.then(()=>render())}
 function frame(t){if(!lastT)lastT=t;let dt=Math.min(.045,(t-lastT)/1000);lastT=t;
  if(run&&MODULE==='EM01'&&!document.body.classList.contains('rod-view-active')){
    let rate=mode==='transform'?.12:Number($('omega').value)/360;
    if(rate>0){phase=(phase+dt*rate)%1;$('phase').value=Math.round(phase*1000);render();}
  }
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}
init();
