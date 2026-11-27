/* Vector teaching scenes; normalized quantities, explicit model assumptions.
   Machine silhouettes live in the shared machine-art.js renderer. */
(()=>{'use strict';
const C={green:'#007e6c',gold:'#a76914',blue:'#346fc0',red:'#bf5849',pink:'#ad365d',muted:'#718780',ink:'#233f49',line:'#c9d8d1'},TAU=2*Math.PI;
const f=n=>Number(n.toFixed(3)),text=(x,y,s,color=C.muted,size=16,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" style="fill:${color}" font-size="${size}" font-family="Segoe UI, sans-serif">${s}</text>`;
const cache=new Map();function tex(s){if(!cache.has(s)){if(cache.size>600)cache.clear();cache.set(s,katex.renderToString(s,{throwOnError:true,output:'html'}));}return cache.get(s);}
function math(x,y,s,color=C.ink,size=18,w=130){return `<foreignObject x="${x-w/2}" y="${y-17}" width="${w}" height="38" style="overflow:visible"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${size}px;color:${color};text-align:center;white-space:nowrap">${tex(s)}</div></foreignObject>`;}
function arrow(x,y,dx,dy,color=C.green,width=2){const len=Math.hypot(dx,dy);if(len<.1)return '';const ux=dx/len,uy=dy/len,h=Math.min(10,len*.35),ex=x+dx,ey=y+dy;return `<path d="M${f(x)} ${f(y)}L${f(ex-h*.8*ux)} ${f(ey-h*.8*uy)}" stroke="${color}" stroke-width="${width}" fill="none"/><path d="M${f(ex)} ${f(ey)}L${f(ex-h*ux+h*.42*uy)} ${f(ey-h*uy-h*.42*ux)}L${f(ex-h*ux-h*.42*uy)} ${f(ey-h*uy+h*.42*ux)}Z" fill="${color}"/>`;}
function line(x1,y1,x2,y2,color=C.line,width=1,dash=''){return `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`;}
function label(x,y,s,color=C.ink){return text(x,y,s,color,16,'start');}
function frame(x,y,w,h,title){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#f7faf7" stroke="#dce6df"/>`+text(x+w/2,y+29,title,C.ink,17);}
function dot(x,y,color=C.green,r=5){return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="white" stroke-width="1.5"/>`;}
const wrap=a=>((a%TAU)+TAU)%TAU;
const bldcCurrents=a=>[[1,-1,0],[1,0,-1],[0,1,-1],[-1,1,0],[-1,0,1],[0,-1,1]][Math.floor(wrap(a)/(Math.PI/3))];
const bldcHall=a=>['101','100','110','010','011','001'][Math.floor(wrap(a)/(Math.PI/3))];
const fieldCache=new Map();
function field(coeff,bldc=false,rotor=0){
 const basis=window.DCFieldBasis,key=JSON.stringify([bldc,...coeff,rotor]);if(fieldCache.has(key))return fieldCache.get(key);
 const {N,R}=basis,h=2*R/(N-1),a=new Float32Array(N*N);
 if(!bldc){for(let k=0;k<a.length;k++)a[k]=basis.fields.reduce((sum,b,i)=>sum+(coeff[i]||0)*b[k],0);}
 else{
  const sample=(grid,x,y)=>{const u=(x+R)/h,v=(y+R)/h,i=Math.floor(u),j=Math.floor(v);if(i<0||j<0||i>=N-1||j>=N-1)return 0;const tx=u-i,ty=v-j,k=j*N+i;return (1-ty)*((1-tx)*grid[k]+tx*grid[k+1])+ty*((1-tx)*grid[k+N]+tx*grid[k+N+1]);};
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-R+i*h,y=-R+j*h;const rotate=(a)=>[x*Math.cos(a)+y*Math.sin(a),-x*Math.sin(a)+y*Math.cos(a)];a[j*N+i]=coeff[0]*sample(basis.bldc[0],...rotate(coeff[1]))+coeff[2]*sample(basis.bldc[1],...rotate(rotor));}
 }
 const out=MagneticContours(a,N,R,C.green);let n=0;const arrows=out.arrows.replace(/<path\b[^>]*\/>/g,s=>Math.floor(n++/2)%2?'':s);const result=out.paths+arrows;
 if(fieldCache.size>36)fieldCache.delete(fieldCache.keys().next().value);fieldCache.set(key,result);return result;
}
// Superpose fixed phase sources; rotate only the PM basis in the circular magnetic circuit.
function bldcPotential(currents,rotor){const {N,R,fields}=DCBLDCFieldBasis,h=2*R/(N-1),grid=new Float32Array(N*N),co=Math.cos(rotor),si=Math.sin(rotor);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-R+i*h,y=-R+j*h,u=(co*x+si*y+R)/h,v=(-si*x+co*y+R)/h,ix=Math.floor(u),iy=Math.floor(v),k=j*N+i;let pm=0;if(ix>=0&&iy>=0&&ix<N-1&&iy<N-1){const t=u-ix,w=v-iy,q=iy*N+ix,b=fields[3];pm=(1-w)*((1-t)*b[q]+t*b[q+1])+w*((1-t)*b[q+N]+t*b[q+N+1]);}grid[k]=pm+currents.reduce((sum,current,p)=>sum+current*fields[p][k],0);}return grid;}
function bldcField(currents,rotor){const key=JSON.stringify(['actual-bldc',...currents,rotor]);if(fieldCache.has(key))return fieldCache.get(key);const b=DCBLDCFieldBasis,out=MagneticContours(bldcPotential(currents,rotor),b.N,b.R,C.green,[],Array.from({length:20},(_,k)=>(k-9.5)*.18),{arrowFilter:p=>Math.hypot(p.x,p.y)<110}),result=out.paths+out.arrows;if(fieldCache.size>36)fieldCache.delete(fieldCache.keys().next().value);fieldCache.set(key,result);return result;}
function gapCurve(coeff){const {N,R,fields}=DCFieldBasis,h=2*R/(N-1),r=132;
 const sample=a=>{const u=(r*Math.cos(a)+R)/h,v=(r*Math.sin(a)+R)/h,i=Math.floor(u),j=Math.floor(v),tx=u-i,ty=v-j,k=j*N+i;let sum=0;for(let n=0;n<4;n++){const g=fields[n];sum+=(coeff[n]||0)*((1-ty)*((1-tx)*g[k]+tx*g[k+1])+ty*((1-tx)*g[k+N]+tx*g[k+N+1]));}return sum;};
 // B_r=(1/r)dA/dtheta. Average over a small angular aperture to suppress
 // Cartesian interface staircasing, rather than plotting nearest-grid noise.
 return a=>{let sum=0;for(let n=-2;n<=2;n++){const t=a+n*.018;sum+=(sample(t+.035)-sample(t-.035))/(r*.07);}return 35*sum/5;};}
let plotId=0;
function plot({curves,x=[0,1],y=[-1.3,1.3],xt='t',yt='i',cursor,point,pointColor=C.pink,yTicks,ticks=true,height=234}){
 const l=64,r=476,t=height===234?43:32,b=height-53,X=v=>l+(v-x[0])/(x[1]-x[0])*(r-l),Y=v=>b-(v-y[0])/(y[1]-y[0])*(b-t);let out='';
 for(const v of (yTicks||Array.from({length:5},(_,k)=>y[0]+(y[1]-y[0])*k/4))){out+=line(l,Y(v),r,Y(v),'#e4ebe7',.8);if(ticks)out+=math(28,Y(v)+3,f(v).toString().replace('.','{,}'),C.muted,11,50);}
 out+=arrow(l,b,0,t-b-5,C.muted,1)+arrow(l,b,r-l+7,0,C.muted,1);if(y[0]<0&&y[1]>0)out+=line(l,Y(0),r,Y(0),'#b5c7bd',1);
 out+=math(64,17,yt,C.muted,13,90)+math(518,b+29,xt,C.muted,13,40);
 for(let k=0;k<5;k++){const v=x[0]+(x[1]-x[0])*k/4;out+=math(X(v),b+27,f(v).toString().replace('.','{,}'),C.muted,11,65);}
 const clip='dc-plot-'+(++plotId);out+=`<defs><clipPath id="${clip}"><rect x="${l}" y="${t}" width="${r-l}" height="${b-t}"/></clipPath></defs><g clip-path="url(#${clip})">`;
 for(const c of curves){let d='';const arr=c.points||Array.from({length:201},(_,i)=>{const a=x[0]+(x[1]-x[0])*i/200;return[a,c.fn(a)];});for(const [i,p]of arr.entries()){d+=(i?'L':'M')+f(X(p[0]))+' '+f(Y(p[1]));}out+=`<path d="${d}" fill="none" stroke="${c.color||C.green}" stroke-width="${c.width??2.2}" opacity="${c.opacity??1}" stroke-linejoin="round"${c.dash?' stroke-dasharray="5 4"':''}/>`;}out+='</g>';
 if(cursor!==undefined){out+=line(X(cursor),t,X(cursor),b,C.gold,1,'3 4');for(const c of curves.filter(c=>c.fn)){const v=c.fn(cursor);if(v>=y[0]&&v<=y[1])out+=dot(X(cursor),Y(v),c.color||C.green,3.6);}}
 if(point)out+=dot(X(point[0]),Y(point[1]),pointColor,5);
 return out;
}
function legend(items){return items.map(([s,c])=>`<span><i style="background:${c}"></i>${tex(s)}</span>`).join('');}
function plotResult(title,curves,opts,items){return {title,svg:plot({curves,...opts}),legend:legend(items)};}
function wire(d,color=C.ink,width=2.2){return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;}
function coil(x,y,n=5,color=C.gold){let d=`M${x} ${y}`;for(let i=0;i<n;i++)d+=`a9 11 0 0 1 18 0`;return wire(d,color,2.3);}
function resistor(x,y,w=70,color=C.red){return `<rect x="${x}" y="${y-10}" width="${w}" height="20" fill="#fcf6f1" stroke="${color}" stroke-width="2"/>`;}
function circuit(s,options={}){
 const series=options.series,pwm=options.pwm,generator=options.generator;let out='';const top=180,bottom=425;
 out+=wire(`M130 ${top}H280M350 ${top}H390M480 ${top}H660V263M660 347V${bottom}H130`)+resistor(280,top)+coil(390,top);
 out+=`<circle cx="660" cy="305" r="42" fill="#f3f7f2" stroke="${C.green}" stroke-width="2"/>`+math(660,306,'u_i',C.green,24);
 out+=math(315,145,'R_a',C.red)+math(435,145,'L_a',C.gold)+math(105,310,pwm?'U_{\\mathrm{DC}}':'u_a',C.blue)+arrow(93,230,0,150,C.blue,2.2)+arrow(pwm?350:195,top,(pwm?38:65)*(generator?-1:1),0,C.green,3)+math(pwm?368:224,pwm?215:149,'i_a',C.green);
 out+=dot(130,top,C.ink,4)+dot(130,bottom,C.ink,4)+line(702,305,755,305,C.ink,4)+arrow(752,305,62,0,C.pink,3)+math(783,270,'M,\\,\\omega',C.pink,19,160);
 if(series){out+=wire(`M130 ${bottom}H210M300 ${bottom}H660`)+coil(210,bottom,5,C.gold)+math(254,468,'L_b',C.gold)+text(255,502,'Buzení v sérii s kotvou',C.muted,17);}
 else{out+=frame(250,40,260,64,options.shunt?'Derivační buzení':'Samostatné buzení')+math(567,78,'\\Phi',C.gold,25);}
 if(pwm){const on=s.position<s.amount;out+=`<rect x="170" y="162" width="82" height="36" rx="6" fill="${on?'#d8eee3':'#f6eee6'}" stroke="${on?C.green:C.gold}"/>`+text(211,186,on?'SEPNUTO':'VYPNUTO',on?C.green:C.gold,12);out+=wire('M260 180V425',on?C.line:C.green,on?1.2:4)+`<path d="M248 317L260 295L272 317Z" fill="white" stroke="${C.green}" stroke-width="2"/>`+line(248,292,272,292,C.green,2)+math(235,345,'D',C.green);if(!on)out+=arrow(260,375,0,-36,C.green,3);}
 if(options.shunt){out+=wire('M130 180H75V225M75 315V425H130',C.gold,2)+`<g transform="translate(75 225) rotate(90)">${coil(0,0,5)}</g>`+math(34,310,'I_b',C.gold);}
 return out;
}
function brushScene(s,step){const t=s.position,delay=step===0?0:s.amount*.8,ic=1-2*t/(1+delay),i1=1+ic,i2=1-ic;let out=text(450,42,'Detail přechodu mezi dvěma lamelami',C.ink,22);
 out+=`<rect x="105" y="228" width="310" height="125" rx="9" fill="#e2b574" stroke="${C.gold}" stroke-width="2"/><rect x="425" y="228" width="310" height="125" rx="9" fill="#e2b574" stroke="${C.gold}" stroke-width="2"/>`;
 const bx=265+t*160;out+=`<rect x="${bx}" y="172" width="160" height="72" rx="7" fill="#5e6f68" stroke="#334b40" stroke-width="2"/>`+text(bx+80,203,'KARTÁČ','#fff',16)+wire(`M${bx+80} 172V110H765`,C.green,3)+arrow(bx+140,110,-45,0,C.green,3)+math(790,111,'I',C.green);
 out+=wire('M270 353V423H375M465 423H580V353',C.gold,2.5)+coil(375,423)+math(420,469,'L_\\sigma',C.gold,23);
 out+=arrow(270,270,0,66*Math.max(0,i1/2),C.red,3)+math(227,299,'i_1',C.red,23)+arrow(580,270,0,66*Math.max(0,i2/2),C.blue,3)+math(624,299,'i_2',C.blue,23);
 out+=wire('M270 423H135M580 423H740',C.green,2)+arrow(220,423,-45,0,C.green,2)+arrow(640,423,45,0,C.green,2)+math(160,391,'I_a',C.green)+math(714,391,'I_a',C.green);
 out+=arrow(326,423,45*ic,0,C.green,3)+math(330,390,'i',C.green,23)+math(270,385,'1',C.gold)+math(580,385,'2',C.gold);
 out+=arrow(280,510,300,0,C.muted,1.5)+text(430,546,'Relativní poloha kartáče a lamel',C.muted,17);
 if(step===2&&t>.86&&delay>.1)out+=`<path d="M${bx+8} 245l-12 15 16-3-8 20" fill="none" stroke="#d78529" stroke-width="2.5"/>`+text(175,151,'Zbytkový proud při rozpojení',C.gold,16);
 return out;
}
// Qualitative smooth shapes, Chmelik fig. 5.1 and Fitzgerald fig. 7.9/7.11.
function idealGap(coeff){return a=>{const main=DCMachineArt.mainFieldShape(a),coverage=Math.abs(main),triangle=2/Math.PI*Math.asin(Math.sin(2*a)),arm=.6*triangle*(.12+.88*coverage),comp=-.6*triangle*.88*coverage,neutral=Math.exp(-Math.pow(Math.cos(2*a)/.25,4)),inter=-.05*triangle*neutral;return coeff[0]*main+coeff[1]*arm+(coeff[2]/DCCompensation.comp)*comp+(coeff[3]/DCCompensation.inter)*inter;};}
function unrolledField(s){
 const q=s.probe??1,coeff=[s.excitation===false?0:s.flux,s.armatureReaction===false?0:q,s.compensation===false?0:q*DCCompensation.comp,s.interpoles===false?0:q*DCCompensation.inter],colors=[C.gold,C.blue,C.red,C.pink],names=['Buzení','Kotva','Kompenzace','Pomocné póly'];
 const left=70,right=845,width=right-left,X=a=>left+a/TAU*width,Y=b=>365-b*59;
 let out=text(450,25,'Obvod vzduchové mezery rozvinutý do roviny',C.ink,21)+text(450,49,'Stejná poloha na obvodu = stejná svislice ve všech vrstvách',C.muted,14);
 for(let k=0;k<4;k++){const center=k*Math.PI/2;for(const shift of [0,TAU]){const lo=Math.max(0,center+shift-Math.PI/6),hi=Math.min(TAU,center+shift+Math.PI/6);if(hi<=lo)continue;out+='<rect x="'+X(lo)+'" y="67" width="'+(X(hi)-X(lo))+'" height="37" rx="3" fill="#e7eeec" stroke="#8caaa3"/>'+text((X(lo)+X(hi))/2,91,Math.abs(s.flux)<.001?'':((k%2===0)===(s.flux>0)?'S':'J'),C.ink,16);}
 const pp=center+Math.PI/4;out+='<rect x="'+(X(pp)-9)+'" y="79" width="18" height="25" fill="#e7eeec" stroke="#8caaa3"/>';out+=line(X(pp),107,X(pp),515,'#cedbd5',1,'3 5');}
 for(let k=0;k<50;k++){const theta=((s.position*TAU+k*TAU/50)%TAU+TAU)%TAU,x=X(theta),i=s.armatureReaction===false?0:q*Math.sign(Math.cos(2*theta));out+='<rect x="'+(x-5)+'" y="123" width="10" height="20" fill="#f3eee3" stroke="#b6a07a"/>';if(s.currents!==false&&Math.abs(i)>.001)out+=i>0?dot(x,133,C.blue,2):line(x-3,130,x+3,136,C.blue,1.5)+line(x-3,136,x+3,130,C.blue,1.5);}
 out+=text(450,168,'Hlavní a pomocné póly · pod nimi vodiče kotvy',C.muted,14);
 for(let b=-2;b<=2;b++)out+=line(left,Y(b),right,Y(b),b===0?'#91a89c':'#e1e9e4',b===0?1.3:1)+math(39,Y(b)+4,String(b),C.muted,12,50);
 out+=math(40,204,'B_r',C.ink,17,65);
 const total=idealGap(coeff),curves=coeff.map((v,k)=>idealGap(coeff.map((x,j)=>j===k?v:0)));
 const path=fn=>Array.from({length:361},(_,k)=>{const a=k*TAU/360;return(k?'L':'M')+f(X(a))+' '+f(Y(fn(-a)));}).join('');
 out+='<defs><clipPath id="dc-unrolled-clip"><rect x="70" y="200" width="775" height="318"/></clipPath></defs><g clip-path="url(#dc-unrolled-clip)">';
 curves.forEach((fn,k)=>{if(s.field&&coeff[k])out+='<path d="'+path(fn)+'" fill="none" stroke="'+colors[k]+'" stroke-width="1.7" stroke-dasharray="5 3"/>';});if(s.field)out+='<path d="'+path(total)+'" fill="none" stroke="'+C.green+'" stroke-width="3"/>';out+='</g>';
 for(let k=0;k<=4;k++)out+=math(X(k*Math.PI/2),537,String(k*90)+'^{\\circ}',C.muted,13,65);
 out+=math(866,537,'\\theta',C.muted,16,45);
 names.forEach((name,k)=>{const x=75+k*155;out+=line(x,563,x+20,563,colors[k],2,'5 3')+text(x+28,568,name,coeff[k]?colors[k]:C.muted,13,'start');});out+=line(728,563,752,563,C.green,3)+text(760,568,'Součet',C.green,13,'start');return out;
}
function brushDetail(s){return DCMachineArt.commutationDetail(s);}
function machineScene(s,kind,step){
 let a=-s.position*TAU,current=kind==='univerzalni'?s.amount*Math.sin(-a):s.amount,flux=kind==='univerzalni'?s.amount*Math.sin(-a):s.flux;
 if(kind==='rozbeh'){const rows=dynamics(s.amount),end=Math.round(s.position*(rows.length-1));current=rows[end][1];a=-rows.slice(0,end+1).reduce((sum,row)=>sum+row[2]*.02,0);}
 if(kind==='seriovy')flux=step===0?s.amount:Math.tanh(1.5*s.amount)/1.5;
 let coeff=[flux,.35*current,0,0];
 if(kind==='princip')coeff=[s.excitation===false?0:flux,s.armatureReaction===false?0:current,s.compensation===false?0:current*DCCompensation.comp,s.interpoles===false?0:current*DCCompensation.inter];
 if(kind==='princip'&&s.mode==='explore'){const q=s.probe??1;coeff=[s.excitation===false?0:flux,s.armatureReaction===false?0:q,s.compensation===false?0:q*DCCompensation.comp,s.interpoles===false?0:q*DCCompensation.inter];current=s.armatureReaction===false?0:q;flux=s.excitation===false?0:flux;}
 if(kind==='princip'&&s.mode!=='explore')coeff=[flux,current,current*DCCompensation.comp,current*DCCompensation.inter];
 if(kind==='kotva'||kind==='rozbeh'||kind==='seriovy')coeff=[flux,0,0,0];
 if(kind==='reakce')coeff=step===0?[flux,0,0,0]:step===1?[0,current,0,0]:[flux,current,0,0];
 if(kind==='kompenzace')coeff=[flux,current,step>0?current*DCCompensation.comp:0,step===2?current*DCCompensation.inter:0];
 const bgap=gapCurve(kind==='princip'&&s.mode!=='explore'?[flux,current,current*DCCompensation.comp,current*DCCompensation.inter]:coeff);let neutral=Math.PI/4,minimum=Infinity;for(let i=0;i<140;i++){const v=Math.PI/4-.35+.7*i/139,b=Math.abs(bgap(v));if(b<minimum){minimum=b;neutral=v;}}
 let fieldSvg=s.field?field(coeff):'';let out=`<g transform="translate(278 280)">${DCMachineArt.machine({theta:a,current,flux},fieldSvg,{brushCommutation:kind==='princip',enlargedSlots:kind==='princip',forceRadial:kind==='princip'?bgap:null,showCurrents:kind!=='princip'||s.currents!==false,forces:kind==='princip'&&s.mode!=='explore'&&s.forces!==false,neutral:['reakce','kompenzace'].includes(kind)&&!(kind==='reakce'&&step===1),neutralShift:neutral-Math.PI/4,compensation:(kind==='princip')||(kind==='kompenzace'&&step>0),compensationCurrent:s.mode==='explore'?(s.compensation===false?0:s.probe??1):current,interpoleExcitation:s.mode==='explore'?coeff[3]:kind==='princip'?current*DCCompensation.inter:coeff[3],interpoles:(kind==='princip')||(kind==='kompenzace'&&step===2)})}</g>`;
 if(kind==='kotva'||(kind==='princip'&&s.coil!==false)){const x=278+116*Math.cos(a),y=280-116*Math.sin(a),xx=278+116*Math.cos(a+TAU*DCGeometry.coilPitchSlots/DCGeometry.slots),yy=280-116*Math.sin(a+TAU*DCGeometry.coilPitchSlots/DCGeometry.slots);out+=line(x,y,xx,yy,C.pink,1.4,'5 5')+'<circle cx="'+x+'" cy="'+y+'" r="7" fill="none" stroke="'+C.pink+'" stroke-width="2"/><circle cx="'+xx+'" cy="'+yy+'" r="7" fill="none" stroke="'+C.pink+'" stroke-width="2"/>';}
 out+=kind==='princip'?math(751,552,'\\omega='+f(s.omega||0).toString().replace('.','{,}')+'\\,\\mathrm{p.u.}',C.muted,16,400):text(278,552,'Drážkovaná kotva · hlavní póly · budicí cívky',C.muted,16);
 out+=frame(564,35,308,220,'Komutátor a kartáče')+`<g transform="translate(718 157) scale(.84)">${DCMachineArt.commutator(a,current,kind==='princip'?50:24,kind==='princip')}</g>`;
 if(kind==='princip'&&s.mode!=='explore')out+=text(718,244,DCMachineArt.brushContact(a,50).shorted?'Zkrat cívky: sepnutý':'Zkrat cívky: rozepnutý',C.pink,13);
 if(kind==='princip')out+='<g transform="translate(62 0)">';
 out+=frame(564,275,308,233,['reakce','kompenzace'].includes(kind)?'Pole ve vzduchové mezeře':'Proud a magnetické pole');
 out+=line(588,327,624,327,C.green,2)+label(638,333,'Magnetické siločáry');
 out+=`<circle cx="607" cy="365" r="9" fill="#fffaf0" stroke="${C.gold}"/><circle cx="607" cy="365" r="3" fill="${kind==='princip'?C.green:C.gold}"/>`+label(638,371,'Proud k pozorovateli');
 out+=`<circle cx="607" cy="403" r="9" fill="#fffaf0" stroke="${C.gold}"/>`+line(603,399,611,407,kind==='princip'?C.blue:C.gold,1.9)+line(603,407,611,399,kind==='princip'?C.blue:C.gold,1.9)+label(638,409,'Proud od pozorovatele');
 out+=['reakce','kompenzace'].includes(kind)?line(587,449,624,449,C.pink,1.5,'7 4')+label(638,455,'Magnetická neutrála'):arrow(588,450,35,0,C.pink,2)+label(638,456,kind==='princip'?'Síly sledované cívky':'Síla na vodič');
 if(kind==='princip'){const start=out.lastIndexOf('<g transform="translate(62 0)">');out=out.slice(0,start)+out.slice(start).replace('x="718"','x="689"');out+='</g>';}
 if(kind==='princip')out+='<circle cx="278" cy="280" r="145.6" fill="transparent" class="dc-rotor-hit"><title>Táhněte rotorem pro změnu natočení</title></circle>';
 if(kind==='princip'){
  // Scale the complete cross-section (including coil highlights) as one group.
  const cut=out.indexOf('<foreignObject');
  // The speed readout is the first foreignObject after the machine and coil.
  if(cut>=0)out='<g transform="translate(-33.36 -33.6) scale(1.12)">'+out.slice(0,cut)+'</g>'+out.slice(cut);
  out=out.replace('x="564" y="35" width="308"','x="626" y="35" width="250"').replace('x="564" y="275" width="308"','x="564" y="275" width="250"').replaceAll('translate(718 157)','translate(751 157)').replaceAll('x="718"','x="751"');
 }
 return {out,coeff,bgap};
}
function bridge(i){const colors=[C.red,C.blue,C.gold];let out='';
 out+=wire('M25 35H245M25 235H245',C.ink,2);for(let k=0;k<3;k++){const x=50+k*80,active=i[k];out+=wire(`M${x} 35V235`,C.line,1.6);for(const side of [0,1]){const on=side===0?active>0:active<0,y=side?181:76;out+=`<rect x="${x-13}" y="${y-16}" width="26" height="32" rx="3" fill="${on?colors[k]:'#f5f7f3'}" stroke="${on?colors[k]:C.line}" stroke-width="1.5"/>`+text(x-24,y+5,'T'+(side?[4,6,2][k]:[1,3,5][k]),C.ink,12,'end');}out+=dot(x,135,colors[k],4)+wire(`M${x} 135H${x+18}V${267+k*25}H285`,active?colors[k]:C.line,active?2.5:1)+math(x,15,['A','B','C'][k],colors[k],16,40);}
 out+=math(12,33,'+',C.red,17,25)+math(12,240,'-',C.blue,17,25);return out;
}

function hallSensors(code,focus){
 // Each axis bisects the 180° interval in which its Hall signal is high.
 const axes=[-Math.PI/3,Math.PI/3,Math.PI];
 const labels=["A","B","C"],colors=[C.red,C.blue,C.gold];
 return axes.map((angle,k)=>{
  const x=r=>265+r*Math.cos(angle),y=r=>282-r*Math.sin(angle);
  const active=code[k]==="1",color=colors[k],label=labels[k];
  const markRadius=240,labelY=y(markRadius)+(k===1?-19:19);
  return `<g data-hall-sensor="${label}" data-hall-state="${code[k]}"><title>Hallova sonda ${label}: ${code[k]}</title>`
   +(focus?`<circle cx="${x(markRadius)}" cy="${y(markRadius)}" r="10" fill="none" stroke="${color}" stroke-width="1.5"/>`:'')
   +`<rect x="-6" y="-4" width="12" height="8" rx="2" transform="translate(${x(markRadius)} ${y(markRadius)}) rotate(${90-angle*180/Math.PI})" fill="${active?color:"white"}" stroke="${color}" stroke-width="2"/>`
   +math(x(markRadius),labelY+8,"H_"+label,color,15,42)+"</g>";
 }).join("");
}
function bldcScene(s,step,kind,panels){const a=s.position*TAU,phase=bldcCurrents(s.commutationAngle??a),space=[phase[0]-.5*(phase[1]+phase[2]),Math.sqrt(3)/2*(phase[1]-phase[2])],fa=Math.atan2(space[1],space[0]),rotor=fa-Math.PI/2; // smooth rotor below uses actual commanded angle, not sector jumps
 const theta=a-5*Math.PI/6,fl=s.field?bldcField(phase.map(i=>i*s.amount),theta):'';
 let out=`<g transform="translate(265 282)">${DCMachineArt.bldc(theta,phase.map(v=>v*s.amount),fl)}</g>`;
 out+=`<g transform="translate(265 282)">${arrow(0,0,155*s.amount*Math.cos(fa),-155*s.amount*Math.sin(fa),C.green,3)}${arrow(0,0,112*Math.cos(theta),-112*Math.sin(theta),C.gold,3)}</g>`;
 const bridgeDrawing=frame(535,30,340,390,'Třífázový tranzistorový můstek')+`<g transform="translate(555 77)">${bridge(phase)}</g>`;
 let circuit=bridgeDrawing,sideLogic='';
 if(kind==='bldc-poloha'){
 const driveAngle=s.commutationAngle??a,code=bldcHall(a),held=s.commutationAngle!==null,positive=phase.findIndex(v=>v>0),negative=phase.findIndex(v=>v<0);
 out+=hallSensors(code,step===0);
 const gatePair='T'+[1,3,5][positive]+' + T'+[4,6,2][negative],phasePath=['A','B','C'][positive]+'+ → '+['A','B','C'][negative]+'−';
 sideLogic=frame(906,48,125,95,'Hallovy sondy')+text(968,100,code,C.blue,22)+math(968,128,'H_A H_B H_C',C.muted,13,106)
  +frame(906,177,125,95,'Logika')+text(968,226,held?'Podrženo':bldcHall(driveAngle),C.ink,17)+text(968,252,'6 stavů',C.muted,13)
  +frame(906,306,125,95,'Povely')+text(968,354,gatePair,C.green,17)+text(968,378,phasePath,C.muted,14)
  +arrow(968,143,0,33,C.ink,1.5)+arrow(968,272,0,33,C.ink,1.5)+arrow(906,354,-29,0,C.ink,1.5);
 circuit+=frame(535,440,104,96,'Hallovy sondy')+text(587,493,code,C.blue,22)+math(587,521,'H_A H_B H_C',C.muted,12,100);
 circuit+=frame(660,440,104,96,'Logika')+text(712,490,held?'Podrženo':bldcHall(driveAngle),C.ink,17)+text(712,517,'6 stavů',C.muted,13);
 circuit+=frame(785,440,105,96,'Povely')+text(837,491,'T'+[1,3,5][positive]+' + T'+[4,6,2][negative],C.green,17)+text(837,517,['A','B','C'][positive]+'+ → '+['A','B','C'][negative]+'−',C.muted,14);
 circuit+=arrow(640,487,19,0,C.ink,1.5)+arrow(765,487,19,0,C.ink,1.5)+arrow(837,440,0,-20,C.ink,1.5);
 }else circuit+=frame(535,440,340,96,'Sepnutá dvojice')+text(705,511,['A+ → B−','A+ → C−','B+ → C−','B+ → A−','C+ → A−','C+ → B−'][Math.floor(wrap(s.commutationAngle??a)/(Math.PI/3))],C.green,21);

 if(kind==='bldc-poloha'){const torque=bldcTorque(s);for(const t of [theta,theta+Math.PI])out+=arrow(265+128*Math.cos(t),282-128*Math.sin(t),-42*torque*Math.sin(t),-42*torque*Math.cos(t),C.pink,2.5);}
 if(panels){panels.rotor=out;panels.circuit=bridgeDrawing+sideLogic;}
 out+=text(265,552,kind==='bldc-poloha'?'Táhněte rotorem · růžové šipky ukazují magnetický moment':'Proudový vektor a osa permanentních magnetů',C.muted,16);return out+circuit;
}
function energy(s){const I=s.amount,w=Math.max(.05,(1-.18*I)),pin=I+.08,cu=.18*I*I+.08,mech=.06*w,shaft=Math.max(0,pin-cu-mech);let out=text(450,45,'Od svorek až k hřídeli',C.ink,24);const y=210;
 const nodes=[[70,'Elektrický příkon',C.blue],[340,'Přeměněný výkon',C.green],[650,'Výkon na hřídeli',C.gold]];
 for(const [x,title,color]of nodes)out+=`<rect x="${x}" y="${y-45}" width="190" height="175" rx="14" fill="#f7faf7" stroke="${color}" stroke-width="1.3"/>`+text(x+95,y-12,title,C.ink,17);
 out+=math(165,y+46,'P_1',C.blue,32)+math(435,y+46,'P_{\\mathrm{em}}',C.green,32,190)+math(745,y+46,'P_2',C.gold,32);
 out+=arrow(260,y+38,80,0,C.green,Math.max(3,26*pin))+arrow(530,y+38,120,0,C.gold,Math.max(3,26*shaft));
 out+=arrow(305,y+40,0,170,C.red,Math.max(3,26*cu))+arrow(590,y+40,0,170,C.red,Math.max(3,26*mech));
 out+=text(305,455,'Měď a buzení',C.red,18)+text(590,455,'Mechanické ztráty',C.red,18)+text(450,525,'Šířka toku sleduje výkon · normalizovaný model',C.muted,17);return out;
}
function connectionScene(s){
 const currents=bldcCurrents(s.position*TAU).map(v=>v*s.amount),branches=[(currents[0]-currents[1])/3,(currents[1]-currents[2])/3,(currents[2]-currents[0])/3],colors=[C.red,C.blue,C.gold];let out=frame(25,40,410,465,'Hvězda')+frame(465,40,410,465,'Trojúhelník');
 const points=[[0,-125],[-115,95],[115,95]],centerY=267;
 for(const [side,cx] of [[0,230],[1,670]]){
  const p=points.map(([x,y])=>[cx+x,centerY+y]);
  for(let k=0;k<3;k++){
   const start=p[k],end=side?p[(k+1)%3]:[cx,centerY],dx=end[0]-start[0],dy=end[1]-start[1],len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI,val=side?branches[k]:currents[k],mx=(start[0]+end[0])/2,my=(start[1]+end[1])/2,color=Math.abs(val)>.001?colors[k]:C.line;
   out+=line(...start,...end,color,2.2)+`<g transform="translate(${mx} ${my}) rotate(${angle})"><rect x="-34" y="-10" width="68" height="20" fill="#fff" stroke="${color}" stroke-width="2"/></g>`;
   out+=arrow(mx-dy/len*23-dx/len*20*Math.sign(val),my+dx/len*23-dy/len*20*Math.sign(val),40*dx/len*Math.sign(val),40*dy/len*Math.sign(val),color,2.5);
   out+=dot(...start,colors[k],5)+math(start[0],start[1]+(k===0?-29:38),['A','B','C'][k],colors[k],20,50);
   if(!side)out+=math(cx+155,168+k*66,['i_a','i_b','i_c'][k]+'='+f(val).toString().replace('.','{,}'),colors[k],15,120);
  }
  if(!side)out+=dot(cx,centerY,C.ink,4);
 }
 out+=text(230,463,'Dvě aktivní fáze',C.green,18)+text(670,463,'Proud se rozdělí do dvou cest',C.green,18)+text(450,546,'Stejné proudy na svorkách · stejné odpory větví · bez indukovaných napětí',C.muted,16);
 return out;
}
function quadrants(s,step){const x=280,y=275,omega=(s.position-.5)*2,I=step===2?-omega/(.18+s.amount):(step===0?1:-1)*Math.sign(omega)*s.amount;let out=arrow(55,y,450,0,C.muted,1.5)+arrow(x,485,0,-420,C.muted,1.5)+math(511,y+28,'M',C.muted,22)+math(x-24,50,'\\omega',C.muted,22);
 for(const [px,py,title,col]of [[393,150,'Motor',C.green],[160,150,'Generátor',C.blue],[160,394,'Motor',C.green],[393,394,'Generátor',C.blue]])out+=text(px,py,title,col,19);
 out+=dot(x+I*165,y-omega*185,C.pink,8)+line(x,y-omega*185,x+I*165,y-omega*185,C.pink,1,'4 4');
 out+=frame(570,100,295,350,step===0?'Motorický chod':step===1?'Rekuperace':'Odporové brzdění');
 out+=text(717,185,step===2?'Brzdný odpor':'Elektrická strana',C.blue,18)+text(717,365,'Mechanická strana',C.gold,18);
 out+=step===0?arrow(717,212,0,108,C.green,9):arrow(717,325,0,-108,C.blue,9);
 out+=text(717,409,step===2?'Energie se mění na teplo':'Sledujte směr energie',C.muted,16);
 return out+text(280,540,'Směr momentu a směr otáčení posuzujte odděleně',C.muted,16);
}
function dynamics(load){const rows=[];let i=0,w=0;const dt=.002;for(let k=0;k<=5000;k++){const t=k*dt,z=t<5?.25:load,di=(1-.18*i-w)/.18,dw=(i-z-.05*w)/1.1;i+=di*dt;w+=dw*dt;if(k%10===0)rows.push([t,i,w,z]);}return rows;}
function winding(s,step){const a=s.position*TAU,count=step===2?12:1;return {coil:x=>Math.cos(2*x),out:x=>Array.from({length:count},(_,k)=>Math.abs(Math.cos(2*x+k*Math.PI/count))).reduce((sum,v)=>sum+v,0)/count,count};}
const configs={
 princip:['Natočení rotoru','Proud kotvy','Příčný řez strojem'],kotva:['Natočení rotoru','Buzení','Cívky, kartáče a komutátor'],schema:['Pracovní bod','Zatěžovací moment','Náhradní schéma'],rozbeh:['Čas děje','Zatížení po skoku','Rozběh a zatížení stroje'],reakce:['Natočení rotoru','Proud kotvy','Budicí pole a reakce kotvy'],komutace:['Průběh komutace','Vliv indukčnosti','Detail komutující cívky'],kompenzace:['Natočení rotoru','Proud kotvy','Kompenzace a pomocné póly'],rizeni:['Pracovní bod','Napětí kotvy','Rodina mechanických charakteristik'],seriovy:['Pracovní bod','Zatěžovací proud','Sériově buzený stroj'],bilance:['Pracovní bod','Zatěžovací proud','Tok výkonu'],brzdeni:['Směr a rychlost','Velikost momentu','Čtyři kvadranty pohonu'],dynamo:['Budicí proud','Odpor buzení','Samobuzení derivačního dynama'],pwm:['Spínací perioda','Střída PWM','Proudové cesty měniče'],univerzalni:['Časová fáze','Amplituda proudu','Síly při střídavém napájení'],bldc:['Elektrický úhel','Proud fází','Elektronická komutace'],'bldc-poloha':['Elektrický úhel','Proud fází','Snímače a spínání']};
function render(kind,s,step,plotHeight=234){if(kind==='rozvinuti'){kind='princip';s={...s,mode:'explore',fieldView:'unrolled'};}const a=s.position*TAU,A=kind==='princip'&&s.mode==='explore'?(s.armatureReaction===false?0:s.probe??1):s.amount,F=s.flux,unit='\\mathrm{p.u.}';let scene='',charts=[],note='Lineární výukové pole · homogenizované drážky · zvětšená mezera',mainTitle=configs[kind][2],readout='';
 const panels=kind==='bldc-poloha'&&step!==2?{}:null;
 const pair=(title,curves,opts,items)=>charts.push(plotResult(title,curves,{...opts,height:plotHeight},items));
 if(['princip','kotva','rozbeh','reakce','kompenzace','seriovy','univerzalni'].includes(kind)){
  const m=machineScene(s,kind,step);scene=m.out;
  if(['reakce','kompenzace'].includes(kind)){
   pair('Indukce po obvodu vzduchové mezery',[{fn:x=>gapCurve([F,0,0,0])(x),color:C.gold,dash:true},{fn:m.bgap,color:C.green}],{x:[0,TAU],y:[-2,2],xt:'\\xi',yt:'B_\\delta' },[['B_b',C.gold],['B_\\delta',C.green]]);
   pair('Příspěvky k výslednému poli',[{fn:gapCurve([0,A,0,0]),color:C.blue},{fn:gapCurve([0,0,kind==='kompenzace'&&step>0?A*DCCompensation.comp:0,0]),color:C.red},...(kind==='kompenzace'&&step===2?[{fn:gapCurve([0,0,0,A*DCCompensation.inter]),color:C.gold}]:[])],{x:[0,TAU],y:[-2,2],xt:'\\xi',yt:'B_\\delta'},[['B_a',C.blue],['B_{\\mathrm{komp}}',C.red],...(kind==='kompenzace'&&step===2?[['B_{\\mathrm{pp}}',C.gold]]:[])]);
  }else if(kind==='kotva'){
   const w=winding(s,step);pair('Napětí sledované v jedné cívce',[{fn:x=>w.coil(x)*A,color:C.blue}],{x:[0,TAU],cursor:a,xt:'\\theta',yt:'u_i',y:[-1.5,1.5]},[['u_{i,\\mathrm{civka}}',C.blue]]);
   pair('Napětí na kartáčích',[...(step===2?Array.from({length:12},(_,k)=>({fn:x=>Math.abs(Math.cos(2*x+k*Math.PI/12))*A/12,color:'#d5dfda'})):[]),{fn:x=>w.out(x)*A,color:C.green}],{x:[0,TAU],cursor:a,xt:'\\theta',yt:'u_a',y:[0,1.5]},[['u_{\\mathrm{kartace}}',C.green]]);note=step===2?'Sčítání příspěvků více cívek · zjednodušené sinusové napětí jedné cívky':'Jedna cívka · mechanické usměrnění · průběhy v poměrných jednotkách';
  }else if(kind==='rozbeh'){
   const rows=dynamics(A),time=s.position*10,row=rows[Math.round(s.position*(rows.length-1))];
   pair('Proud a otáčky při rozběhu',[{points:rows.map(r=>[r[0],r[1]]),color:C.blue},{points:rows.map(r=>[r[0],r[2]]),color:C.gold}],{x:[0,10],y:[-.8,2.5],cursor:time,xt:'t',yt:unit},[['i_a',C.blue],['\\omega',C.gold]]);
   pair('Moment motoru a zatížení',[{points:rows.map(r=>[r[0],r[1]]),color:C.green},{points:rows.map(r=>[r[0],r[3]]),color:C.red}],{x:[0,10],y:[-.8,2.5],cursor:time,xt:'t',yt:'M'},[['M',C.green],['M_z',C.red]]);note='Dynamický model kotvy a setrvačnosti · skok zátěže v polovině děje';
  }else if(kind==='seriovy'){
   const phi=i=>step===0?i:Math.tanh(1.5*i)/1.5;
   pair('Tok a moment v závislosti na proudu',[{fn:phi,color:C.gold},{fn:i=>i*phi(i),color:C.green}],{x:[0,1.5],y:[0,2.3],cursor:A,xt:'I_a',yt:unit},[['\\Phi',C.gold],['M',C.green]]);
   pair('Otáčky při odlehčování',[{fn:i=>(1-.18*i)/Math.max(.13,phi(i)),color:C.blue}],{x:[.15,1.5],y:[0,7],cursor:Math.max(.15,A),xt:'I_a',yt:'\\omega'},[['\\omega',C.blue]]);note='Porovnání lineárního a nasyceného buzení · dolní mez proudu omezuje rozsah grafu';
  }else if(kind==='princip'){
   const coilMoment=x=>-A*F*DCMachineArt.coilCurrent(-x)*DCMachineArt.mainFieldShape(-x),range=Math.max(.1,Math.abs(A),Math.abs(F),Math.abs(A*F))*1.08;
   pair('Proud, radiální indukce a moment cívky',[{fn:x=>A*DCMachineArt.coilCurrent(-x),color:C.blue},{fn:x=>F*DCMachineArt.mainFieldShape(-x),color:C.green},{fn:coilMoment,color:C.pink}],{x:[0,TAU],y:[-range,range],cursor:a,xt:'\\theta',yt:unit},[['i_a',C.blue],['B_r',C.green],['M_{\\mathrm{civka}}',C.pink]]);
   charts.push({title:'Komutace · kontakt kartáče a lamel',svg:brushDetail(s),legend:'<button data-comm-phase="before">Před nájezdem</button><button data-comm-phase="during">Dvě lamely</button><button data-comm-phase="after">Po sjetí</button>'});
   note=s.mode==='explore'?'Průzkum polí: nezávislé zkušební buzení vybraných vinutí, rotor stojí. Nejde o sériové provozní zapojení.':'Grafy: idealizované pole pod pólovým nástavcem a lineární komutace během překrytí lamel. Moment cívky v poměrných jednotkách; siločáry z lineárního modelu.';
  }else{
   const un=kind==='univerzalni';pair(un?'Proud a tok během periody':'Proud v otáčející se cívce',[{fn:x=>un?A*Math.sin(x):A*Math.sign(Math.cos(2*x)),color:C.blue},{fn:x=>un?A*Math.sin(x):F*Math.cos(2*x),color:C.gold}],{x:[0,TAU],y:[-1.5,1.5],cursor:a,xt:un?'\\omega t':'\\theta',yt:unit},[['i_a',C.blue],[un?'\\Phi':'B_\\delta',C.gold]]);
   pair(un?'Součin toku a proudu':'Příspěvek cívky k momentu',[{fn:x=>un?A*A*Math.sin(x)**2:A*F*Math.abs(Math.cos(2*x)),color:C.pink}],{x:[0,TAU],y:un?[0,2.1]:[-1.6,1.6],cursor:a,xt:un?'\\omega t':'\\theta',yt:'M'},[['M',C.pink]]);
  }
 }else if(kind==='komutace'){
  scene=brushScene(s,step);const delay=step===0?0:A*.8,fn=x=>1-2*x/(1+delay);
  pair('Obrácení proudu cívky',[{fn:x=>1-2*x,color:C.muted,dash:true},{fn,color:C.green}],{x:[0,1],y:[-1.2,1.2],cursor:s.position,xt:'t/T_k',yt:'i'},[['i_{\\mathrm{ideal}}',C.muted],['i',C.green]]);
  pair('Proudy oběma lamelami',[{fn:x=>1+fn(x),color:C.red},{fn:x=>1-fn(x),color:C.blue}],{x:[0,1],y:[0,2.2],cursor:s.position,xt:'t/T_k',yt:'i'},[['i_1',C.red],['i_2',C.blue]]);note='Kvalitativní model zpožděné komutace · proudy normalizované proudem větve';
 }else if(kind==='schema'||kind==='dynamo'||kind==='pwm'){
  scene=circuit(s,{shunt:kind==='dynamo',pwm:kind==='pwm'});
  if(kind==='schema'){
   const I=A,F=1,U=1,w=(U-.18*I)/F;
   pair('Napěťová bilance v ustálení',[{fn:x=>1,color:C.blue},{fn:x=>1-.18*x,color:C.green},{fn:x=>.18*x,color:C.red}],{x:[0,1.5],y:[0,1.3],cursor:I,xt:'I_a',yt:'U'},[['U_a',C.blue],['U_i',C.green],['R_a I_a',C.red]]);
   pair('Mechanická charakteristika',[{fn:x=>1-.18*x,color:C.gold}],{x:[0,1.5],y:[0,1.3],point:[I,w],xt:'M',yt:'\\omega'},[['\\omega(M)',C.gold]]);note='Ustálený stav · konstantní buzení · odpor kotvy v poměrných jednotkách';
  }else if(kind==='dynamo'){
   const mag=x=>.06+1.1*Math.tanh(1.6*x),res=.45+A;
   pair('Magnetizační křivka a budicí přímka',[{fn:mag,color:C.green},{fn:x=>res*x,color:C.red}],{x:[0,1.5],y:[0,1.8],cursor:1.5*s.position,xt:'I_b',yt:'U'},[['U_{i0}(I_b)',C.green],['R_b I_b',C.red]]);
   let v=.01,rows=[];for(let k=0;k<=400;k++){rows.push([k/40,mag(v)]);v+=.025*(mag(v)-res*v);}
   pair('Narůstání napětí při samobuzení',[{points:rows,color:C.gold}],{x:[0,10],y:[0,1.4],cursor:s.position*10,xt:'t',yt:'U'},[['U',C.gold]]);note='Model s remanencí a nasycením · správná polarita derivačního buzení';
  }else{
   const D=Math.min(.95,A),u=x=>(x%1)<D?1:0,amp=.25*D*(1-D),i=x=>.5+amp*((x%1)<D?(x%1)/D:1-((x%1)-D)/(1-D));
   pair('Napětí kotvy v jedné periodě',[{fn:u,color:C.blue},{fn:()=>D,color:C.gold,dash:true}],{x:[0,1],y:[0,1.2],cursor:s.position,xt:'t/T_s',yt:'u_a'},[['u_a',C.blue],['U_a',C.gold]]);
   pair('Spojitý proud indukčností',[{fn:i,color:C.green}],{x:[0,1],y:[0,.8],cursor:s.position,xt:'t/T_s',yt:'i_a'},[['i_a',C.green]]);note='Jednokvadrantový měnič · spojitý proud · kvalitativní trojúhelníkové zvlnění';
  }
 }else if(kind==='rizeni'){
  const flux=step===2?.55:1,U=A,curve=(u,phi)=>m=>(u-.18*m/phi)/phi;
  const curves=[.55,.8,1.1].map((v,i)=>({fn:curve(step===2?A:v*A,step===2?v:1),color:[C.blue,C.green,C.gold][i]}));
  scene=`<g transform="translate(35 70) scale(1.58)">${plot({curves,x:[0,1.8],y:[0,2],point:[s.position*1.8,curve(U,flux)(s.position*1.8)],xt:'M',yt:'\\omega'})}</g>`;
  pair('Mez momentu při proudovém omezení',[{fn:w=>w<=1?1:1/w,color:C.green}],{x:[0,2.5],y:[0,1.3],cursor:s.position*2.5,xt:'\\omega',yt:'M_{\\max}'},[['M_{\\max}',C.green]]);
  pair('Oblast konstantního výkonu',[{fn:w=>Math.min(w,1),color:C.gold}],{x:[0,2.5],y:[0,1.3],cursor:s.position*2.5,xt:'\\omega',yt:'P'},[['P_{\\max}',C.gold]]);note=step===2?'Rodina křivek pro různá buzení · normalizované veličiny':'Rodina křivek pro různá napětí kotvy · normalizované veličiny';
 }else if(kind==='bilance'){
  scene=energy(s);const eta=i=>Math.max(0,(i-.18*i*i-.06*Math.max(.05,1-.18*i))/(i+.08));
  pair('Ztráty se zatížením',[{fn:i=>.18*i*i+.08,color:C.red},{fn:i=>.06*Math.max(.05,1-.18*i),color:C.gold}],{x:[0,1.5],y:[0,.55],cursor:A,xt:'I_a',yt:'P'},[['P_{\\mathrm{Cu}}+P_b',C.red],['P_{\\mathrm{mech}}',C.gold]]);
  pair('Účinnost motoru včetně buzení',[{fn:eta,color:C.green}],{x:[0,1.5],y:[0,1],cursor:A,xt:'I_a',yt:'\\eta'},[['\\eta',C.green]]);note='Výuková bilance zahrnuje samostatné buzení · ztráty v železe a kartáčích zatím zanedbány';
 }else if(kind==='brzdeni'){
  const current=x=>step===2?-x/(.18+A):(step===0?1:-1)*Math.sign(x)*A,terminal=x=>x+.18*current(x);
  scene=quadrants(s,step);pair('Napěťová bilance ve zvoleném režimu',[{fn:x=>x,color:C.green},{fn:terminal,color:C.blue}],{x:[-1.2,1.2],y:[-1.6,1.6],cursor:(s.position-.5)*2,xt:'\\omega',yt:'U'},[['U_i',C.green],['U_a',C.blue]]);
  pair('Znaménko mechanického výkonu',[{fn:x=>x*current(x),color:C.pink}],{x:[-1.2,1.2],y:[-2,2],cursor:(s.position-.5)*2,xt:'\\omega',yt:'P_{\\mathrm{em}}'},[['M\\omega',C.pink]]);note=step===2?'Odporové brzdění · zdroj odpojen · napětí na svorkách brzdného odporu':'Motorická znaménková konvence · napětí respektuje odporový úbytek pro oba směry';
 }else{
  scene=bldcScene(s,step,kind,panels);
  if(kind==='bldc-poloha'){
   if(step===2){scene=connectionScene(s);mainTitle='Proudové cesty ve hvězdě a trojúhelníku';
    pair('Proudy fází v zapojení hvězda',[0,1,2].map(k=>({fn:x=>A*bldcCurrents(x)[k],color:[C.red,C.blue,C.gold][k]})),{x:[0,TAU],y:[-1.5,1.5],cursor:a,xt:'\\theta_e',yt:'i'},[['i_a',C.red],['i_b',C.blue],['i_c',C.gold]]);
    pair('Proudy větví v zapojení trojúhelník',[0,1,2].map(k=>({fn:x=>{const i=bldcCurrents(x);return A*(i[k]-i[(k+1)%3])/3;},color:[C.red,C.blue,C.gold][k]})),{x:[0,TAU],y:[-1.5,1.5],cursor:a,xt:'\\theta_e',yt:'i'},[['i_{ab}',C.red],['i_{bc}',C.blue],['i_{ca}',C.gold]]);note='Porovnání proudových cest pro stejné odpory · bez indukovaných napětí a cirkulačního proudu';
   }else{
    pair('Signály polohy v elektrické periodě',[0,1,2].map((k)=>({fn:x=>(+bldcHall(x)[k]*.65)+k*.85,color:[C.red,C.blue,C.gold][k]})),{x:[0,TAU],y:[0,2.7],cursor:a,xt:'\\theta_e',yt:'H'},[['H_A',C.red],['H_B',C.blue],['H_C',C.gold]]);
    pair(s.commutationAngle==null?'Fázové proudy při komutaci':'Proudy podržené dvojice',[0,1,2].map(k=>({fn:x=>A*bldcCurrents(s.commutationAngle??x)[k],color:[C.red,C.blue,C.gold][k]})),{x:[0,TAU],y:[-1.5,1.5],cursor:a,xt:'\\theta_e',yt:'i'},[['i_a',C.red],['i_b',C.blue],['i_c',C.gold]]);note='Siločáry: součet pole aktuálních fázových proudů a permanentních magnetů · lineární model s rozložením fázových vodičů a rovnoměrně magnetovanými PM; drážková vrstva homogenizovaná · Hallovy signály svisle odsazené';
   }
  }else{
   pair('Fázové proudy při šestikrokovém řízení',[0,1,2].map(k=>({fn:x=>bldcCurrents(x)[k]*A,color:[C.red,C.blue,C.gold][k]})),{x:[0,TAU],y:[-1.5,1.5],cursor:a,xt:'\\theta_e',yt:'i'},[['i_a',C.red],['i_b',C.blue],['i_c',C.gold]]);
   pair('Proudové pole vůči ose rotoru',[{fn:x=>{const i=bldcCurrents(x),fa=Math.atan2(Math.sqrt(3)/2*(i[1]-i[2]),i[0]-.5*(i[1]+i[2]));return A*Math.sin(fa-(x-5*Math.PI/6));},color:C.pink}],{x:[0,TAU],y:[-1.6,1.6],cursor:a,xt:'\\theta_e',yt:'M'},[['M',C.pink]]);note='Šestikrokové proudy · dvoupólový PM rotor · výukové pole se sinusovou základní složkou';
  }
 }
 if(kind==='princip'&&s.mode==='explore'&&s.fieldView==='unrolled'){scene=unrolledField(s);mainTitle='Rozvinutí obvodu · skládání polí';}
 return {scene,charts,note,mainTitle,panels};
}
function principleStep(s,dt){dt=Math.min(.06,Math.max(0,dt));const n=Math.max(1,Math.ceil(dt/.003)),h=dt/n;for(let i=0;i<n;i++){s.omega+=((s.flux*s.amount-.35*s.omega)/s.inertia)*h;s.position=((s.position+s.omega*h/TAU)%1+1)%1;}s.time=(s.time||0)+dt;if(dt>0){s.history??=[];s.history.push({t:s.time,w:s.omega});while(s.history.length>1&&s.history[0].t<s.time-15)s.history.shift();}return s;}
function bldcTorque(s){const a=s.position*TAU,i=bldcCurrents(s.commutationAngle??a),fa=Math.atan2(Math.sqrt(3)/2*(i[1]-i[2]),i[0]-.5*(i[1]+i[2]));return s.amount*Math.sin(fa-(a-5*Math.PI/6));}
function bldcStep(s,dt){let left=Math.min(.06,Math.max(0,dt));while(left>0){const h=Math.min(.003,left);s.omega=(s.omega||0)+(2*bldcTorque(s)-.9*(s.omega||0))*h;s.position=wrap(s.position*TAU+s.omega*h)/TAU;left-=h;}return s;}
window.DCVisual={bldcField,bldcPotential,bldcTorque,bldcStep,idealGap,principleStep,render,configs,arrow,math,tex,field,gapCurve,plot,dynamics,bldcCurrents};
})();
