(()=>{'use strict';const C=280,Y=267,radToDeg=180/Math.PI,pt=(r,a)=>[C+r*Math.cos(a),Y-r*Math.sin(a)];
function arrow(x,y,u,v,color,width=2){const length=Math.hypot(u,v);if(length<.5)return '';const head=Math.min(8,length*.4),nx=u/length,ny=v/length,ex=x+u,ey=y+v;return `<path d="M${x},${y}L${ex-head*.7*nx},${ey-head*.7*ny}" fill="none" stroke="${color}" stroke-width="${width}"/><path d="M${ex},${ey}L${ex-head*nx+head*.45*ny},${ey-head*ny-head*.45*nx}L${ex-head*nx-head*.45*ny},${ey-head*ny+head*.45*nx}Z" fill="${color}"/>`;}
const salient='M100 -35L100 -81L122.7 -81A147 147 0 0 1 122.7 81L100 81L100 35L42.43 35A55 55 0 0 1 -42.43 35L-100 35L-100 81L-122.7 81A147 147 0 0 1 -122.7 -81L-100 -81L-100 -35L-42.43 -35A55 55 0 0 1 42.43 -35Z';
function current(x,y,i,color,r=4){if(Math.abs(i)<.04)return '';return i>0?`<circle cx="${x}" cy="${y}" r="${r*.45}" fill="${color}"/>`:`<path d="M${x-r*.55} ${y-r*.55}l${r*1.1} ${r*1.1}m${-r*1.1} 0l${r*1.1} ${-r*1.1}" stroke="${color}" stroke-width="1.1"/>`;}
function excitationMark(x,y,i,r=4.8){if(Math.abs(i)<1e-6)return '';const d=r*.48;return '<g class="excitation-current" transform="translate('+x+' '+y+')"><circle r="'+r+'" fill="#fffdf7" stroke="${ink}" stroke-width="${r>=5?1.9:1.1}"/>'+(i>0?'<circle r="'+r*.42+'" fill="#684313"/>':'<path d="M'+(-d)+' '+(-d)+'L'+d+' '+d+'M'+(-d)+' '+d+'L'+d+' '+(-d)+'" fill="none" stroke="#684313" stroke-width="1.6" stroke-linecap="round"/>')+'</g>';}
const polygonPath=poly=>'M'+poly.map(p=>p[0].toFixed(2)+','+(-p[1]).toFixed(2)).join('L')+'Z';
function halfMagnet(poly,m,positive){const c=poly.reduce((a,p)=>[a[0]+p[0]/poly.length,a[1]+p[1]/poly.length],[0,0]),out=[],value=p=>(p[0]-c[0])*m[0]+(p[1]-c[1])*m[1];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],u=value(a),v=value(b);if((u>=0)===positive)out.push(a);if((u>=0)!==(v>=0)){const t=u/(u-v);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}return out;}
window.SyncMachineArt=function(s,relative,opts,fieldLines){const a=window.SyncPrinciple.values(s),poles=window.SyncPrinciple.polePairs(s),rv=relative?0:s.rotor,fv=rv-a.beta/poles,statorAngle=relative?-s.rotor:0,pre=relative?'rel':'lab';let windingMarks='';const native=s.type==='ipm4'?window.SyncIPM4Geometry:window.SyncIPMGeometry;
let h=`<defs><clipPath id="${pre}-iron">${s.type!=='salient'?'<circle r="147"/>':`<path d="${salient}"/>`}</clipPath></defs><circle cx="${C}" cy="${Y}" r="211" fill="#e7eeec" stroke="#8caaa3" stroke-width="2"/><circle cx="${C}" cy="${Y}" r="153" fill="#fafcfb" stroke="#c4d3ce"/><circle cx="${C}" cy="${Y}" r="207" fill="none" stroke="#becfc9" stroke-width=".6"/>`;
// The same semi-closed slot construction as the induction-principle module.
for(let k=0;k<24;k++){const t=k*Math.PI/12+statorAngle;h+=`<path transform="translate(${C} ${Y}) rotate(${-t*radToDeg})" d="M153 -3L179 -3L179 -8Q179 -10 182 -10L199 -10Q202 -10 202 -7L202 7Q202 10 199 10L182 10Q179 10 179 8L179 3L153 3" fill="#f8faf9" stroke="#a9bdb6" stroke-width="1"/>`;}
h+=`<g transform="translate(${C} ${Y}) rotate(${-rv*radToDeg})"><g fill="#f3eee3" stroke="#b9781c" stroke-width="2">${s.type!=='salient'?'<circle r="147"/>':`<path d="${salient}"/>`}</g><g clip-path="url(#${pre}-iron)" stroke="#d4c5a6" stroke-width=".4" opacity=".28">`;
for(let y=-144;y<150;y+=6)h+=`<path d="M-150 ${y}H150"/>`;h+='</g></g>';if(s.type.startsWith('ipm'))h+=`<g class="native-ipm-cavities" transform="translate(${C} ${Y}) rotate(${-rv*radToDeg})">${native.holes.map(poly=>'<path d="'+polygonPath(poly)+'" fill="#fafcfb" stroke="#b2bdb5" stroke-width=".8"/>').join('')}</g>`;
// Closed numerical flux contours, rotated from rotor coordinates into the observer frame.
h+=`<g transform="translate(${C} ${Y}) rotate(${-rv*radToDeg})">${fieldLines}</g>`;
for(let k=0;k<24;k++){const t=k*Math.PI/12+statorAngle,[x,y]=pt(191,t),i=(opts.currentScale??1)*Math.sin(poles*(t-fv)),color=['#cf5d4c','#527fb8','#aba044'][Math.floor((k+2)/4)%3];h+=`<g transform="translate(${x} ${y}) rotate(${-t*radToDeg})"><rect x="-8" y="-6" width="16" height="12" rx="3" fill="${color}" fill-opacity=".24" stroke="${color}" stroke-width=".9"/>${current(0,0,i,color,5)}</g>`;}
h+=`<g transform="translate(${C} ${Y}) rotate(${-rv*radToDeg})">`;
if(s.type==='salient'){for(const x of [-74,74])for(const sign of [-1,1]){h+=`<rect x="${x-22}" y="${sign>0?37:-60}" width="44" height="23" rx="4" fill="${s.excitation?'#ead0a4':'#e8e6df'}" stroke="#ba8b4d" stroke-width="1.4"/>`;for(const dx of [-13,0,13])windingMarks+=excitationMark(x+dx,sign*48.5,opts.rotorCurrents?-sign*opts.rotorCurrents.field:s.excitation&&s.excitationLevel>0?-sign:0);}}
else if(s.type==='smooth'){for(let k=0;k<24;k++){const t=k*Math.PI/12;if(Math.abs(Math.cos(t))>.85)continue;const x=130*Math.cos(t),y=-130*Math.sin(t);h+=`<g transform="rotate(${-t*radToDeg})"><path d="M147 -3L140 -3L140 -7L120 -7Q115 -7 115 0Q115 7 120 7L140 7L140 3L147 3" fill="#f9f6ef" stroke="#c3ae88"/><rect x="120" y="-5" width="18" height="10" rx="3" fill="${s.excitation?'#ead0a4':'#e8e6df'}"/></g>` ;windingMarks+=excitationMark(x,y,s.excitation&&s.excitationLevel>0?Math.sin(t):0,3.9);h+=``;}}
if(s.type.startsWith('spm')){const count=s.type==='spm4'?4:2,a=(count===4?35:65)*Math.PI/180,x=140*Math.cos(a),y=140*Math.sin(a),u=124*Math.cos(a),v=124*Math.sin(a);for(let k=0;k<count;k++)h+='<path transform="rotate('+(k*360/count)+')" d="M'+x+' '+(-y)+'A140 140 0 0 1 '+x+' '+y+'L'+u+' '+v+'A124 124 0 0 0 '+u+' '+(-v)+'Z" fill="'+(k%2?'#527fb8':'#cf5d4c')+'" stroke="#7c7165" stroke-width=".7"/>';}
if(s.type.startsWith('ipm')){for(const magnet of native.magnets){h+='<g class="native-ipm-magnet"><path d="'+polygonPath(halfMagnet(magnet.polygon,magnet.magnetization,false))+'" fill="#527fb8"/><path d="'+polygonPath(halfMagnet(magnet.polygon,magnet.magnetization,true))+'" fill="#cf5d4c"/><path d="'+polygonPath(magnet.polygon)+'" fill="none" stroke="#7c7165" stroke-width=".7"/></g>';}}
if(s.damper&&!s.type.startsWith('ipm')){const positions=s.type==='salient'?[-.42,-.21,0,.21,.42,Math.PI-.42,Math.PI-.21,Math.PI,Math.PI+.21,Math.PI+.42]:[...Array.from({length:24},(_,k)=>k*Math.PI/12).filter(t=>Math.abs(Math.cos(t))<=.85),-Math.PI/12,Math.PI/12,Math.PI-Math.PI/12,Math.PI+Math.PI/12];for(const [barIndex,t] of positions.entries()){const radius=s.type==='smooth'?143.5:138.5,barRadius=s.type==='smooth'?2.8:3.5,x=radius*Math.cos(t),y=-radius*Math.sin(t);if(s.type==='smooth'&&Math.abs(Math.cos(t))>.85)h+=`<g class="pole-face-damper-slot" transform="rotate(${-t*radToDeg})"><path d="M148 -1.8L146 -1.8L146 -3.8L140 -3.8Q137.5 -3.8 137.5 0Q137.5 3.8 140 3.8L146 3.8L146 1.8L148 1.8" fill="#fafcfb" stroke="#b8a583" stroke-width=".9"/></g>`;if(s.type==='salient')h+=`<g class="damper-slot" transform="rotate(${-t*radToDeg})"><path d="M148 -2.2L143 -2.2L143 -4.8L135 -4.8Q132.5 -4.8 132.5 0Q132.5 4.8 135 4.8L143 4.8L143 2.2L148 2.2" fill="#fafcfb" stroke="#b8a583" stroke-width=".9"/></g>`;h+=`<circle cx="${x}" cy="${y}" r="${barRadius}" fill="#edf4fe" stroke="#346fc0" stroke-width="1.4"/>${current(x,y,(opts.rotorCurrents?opts.rotorCurrents.bars[barIndex]:Math.sin(t+a.beta)*a.cage),'#346fc0',s.type==='smooth'?2.2:2.8)}`;}}
h+='</g>';
if(s.type.startsWith('spm')||s.type.startsWith('ipm')||s.excitation&&s.excitationLevel>.01){for(const [ang,label]of ((s.type==='ipm4'||s.type==='spm4')?[[rv,'S'],[rv+Math.PI/2,'J'],[rv+Math.PI,'S'],[rv+3*Math.PI/2,'J']]:[[rv,'S'],[rv+Math.PI,'J']])){const [x,y]=pt(121,ang);h+=`<circle cx="${x}" cy="${y}" r="10" fill="#fffaf0" fill-opacity=".94"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="12" font-weight="600" style="fill:#976318">${label}</text>`;}}
if(opts.axes){const [fx,fy]=pt(164,fv),[rx,ry]=pt(113,rv);if(Math.abs(a.beta)>.025){const [x,y]=pt(159,fv),[ex,ey]=pt(159,rv),[tx,ty]=pt(159,rv-a.beta/(2*poles));h+=`<path d="M${x} ${y}A159 159 0 0 ${a.beta>0?0:1} ${ex} ${ey}" fill="none" stroke="white" stroke-width="5"/><path d="M${x} ${y}A159 159 0 0 ${a.beta>0?0:1} ${ex} ${ey}" fill="none" stroke="#a76914" stroke-width="1.8"/><circle cx="${tx}" cy="${ty}" r="10" fill="white"/><text x="${tx}" y="${ty+5}" text-anchor="middle" font-size="17" style="fill:#a76914">${poles===2?'β/2':'β'}</text>`;}h+=arrow(C,Y,fx-C,fy-Y,'#007e6c',2.3)+arrow(C,Y,rx-C,ry-Y,'#b9781c',2.3);}
h+=`<circle cx="${C}" cy="${Y}" r="${s.type.startsWith('ipm')?147*13/37:24}" fill="#d6dedb" stroke="#8caaa3"/><circle cx="${C}" cy="${Y}" r="8" fill="#fff"/><path d="M${C-4} ${Y-22}h8v8h-8Z" fill="#b9c9c3"/>`;
if(opts.forces&&Math.abs(a.total)>.02){for(const t of [rv,rv+Math.PI]){const [x,y]=pt(130,t),length=38*Math.max(-1.6,Math.min(1.6,a.total));h+=arrow(x,y,-length*Math.sin(t),-length*Math.cos(t),'#ad365d',2.3);}}
const [px,py]=pt(232,fv);h+=`<circle cx="${C}" cy="${Y}" r="232" fill="none" stroke="#cfdfd7" stroke-width="1" stroke-dasharray="2 6"/><g class="drive-marker"><circle cx="${px}" cy="${py}" r="14" fill="#007e6c" stroke="white" stroke-width="2"/><text x="${px}" y="${py+4}" text-anchor="middle" font-size="11" style="fill:white">${opts.driveLabel||'Bₛ'}</text></g>`;
h+=`<text x="${C}" y="523" text-anchor="middle" font-size="11" style="fill:#6b807a">${s.type.startsWith('ipm')?(poles===2?'IPM · 4 póly · dvojité V':'IPM · 2 póly · dvojité V'):s.type.startsWith('spm')?'Povrchové permanentní magnety':s.type==='salient'?'Vyniklé póly · budicí vinutí kolem pólů':'Hladký rotor · rozložené budicí vinutí'}${s.damper?' · tlumicí klec':''}</text>`;h+=`<g transform="translate(${C} ${Y}) rotate(${-rv*radToDeg})">${windingMarks}</g>`;return h;};
// The same semi-closed stator-slot construction, with arbitrary winding occupancy.
window.SlottedWindingArt=function(W,d,colors,field){
 const pitch=2*Math.PI/W.Q,neck=Math.min(3,153*.16*pitch),body=Math.min(10,172*.32*pitch),f=n=>n.toFixed(3);
 let h='<circle r="211" fill="#e7eeec" stroke="#8caaa3" stroke-width="1.6"/><circle r="153" fill="#fafcfb" stroke="#c4d3ce"/>';
 W.theta.forEach(a=>{h+='<path transform="rotate('+(-a*180/Math.PI)+')" d="M153 '+f(-neck)+'L160 '+f(-neck)+'L160 '+f(-body)+'L183 '+f(-body)+'V'+f(body)+'H160V'+f(neck)+'H153Z" fill="#f8faf9" stroke="#a9bdb6" stroke-width=".65"/>';});
 h+='<circle r="147" fill="#f3eee3" stroke="#b9781c" stroke-width="1.6"/>'+field;
 W.sides.forEach((row,k)=>row.forEach(c=>{const radius=W.layers===2?(c.layer===0?176:166):171.5,a=W.theta[k],x=radius*Math.cos(a),y=-radius*Math.sin(a),val=c.sign*c.weight*d.curr[c.phase],color=colors[c.phase],rad=Math.min(4,body*.65);h+='<circle cx="'+x+'" cy="'+y+'" r="'+rad+'" fill="#fffdf7" stroke="'+color+'" stroke-width=".6"/>'+current(x,y,val,color,rad); }));
 h+='<circle r="24" fill="#d6dedb" stroke="#8caaa3"/><circle r="8" fill="#fff"/>';
 if(W.Q<=96)W.theta.forEach((a,k)=>{h+='<text x="'+(226*Math.cos(a))+'" y="'+(-226*Math.sin(a)+3)+'" text-anchor="middle" font-size="8" fill="#62747a">'+(k+1)+'</text>';});
 return h;
};
})();
// Shared induction cross-section: exact slot geometry from Princip asynchronního motoru.
(()=>{
const statorPath='M173 -3 L179 -3 L179 -8 Q179 -10 182 -10 L199 -10 Q202 -10 202 -7 L202 7 Q202 10 199 10 L182 10 Q179 10 179 8 L179 3 L173 3';
const rotorPath='M147 -2.5 L141 -2.5 L141 -7 Q141 -11 137 -11 L122 -11 Q116 -11 116 -5 L116 5 Q116 11 122 11 L137 11 Q141 11 141 7 L141 2.5 L147 2.5';
const phaseColors=['#cf5d4c','#527fb8','#aba044'];
function svg(rotor,stator=0){let h='<circle cx="320" cy="260" r="211" fill="#e7eeec" stroke="#8caaa3" stroke-width="2"/><circle cx="320" cy="260" r="173" fill="#fafcfb" stroke="#c4d3ce"/><circle cx="320" cy="260" r="147" fill="#f3eee3" stroke="#b9781c" stroke-width="3"/>';
for(const [count,angle,path,fill,stroke,cls]of [[24,stator,statorPath,'#f8faf9','#a9bdb6','stator-slots'],[20,rotor,rotorPath,'#ebe4d6','#c3ae88','rotor-slots']]){h+='<g class="'+cls+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1">';for(let k=0;k<count;k++)h+='<path transform="translate(320 260) rotate('+(-(angle+k*2*Math.PI/count)*180/Math.PI)+')" d="'+path+'"/>';h+='</g>';}
for(let k=0;k<24;k++){const t=stator+k*Math.PI/12,x=320+194*Math.cos(t),y=260-194*Math.sin(t);h+='<rect x="'+(x-8)+'" y="'+(y-6)+'" width="16" height="12" rx="4" fill="'+phaseColors[k%3]+'" transform="rotate('+(-t*180/Math.PI)+' '+x+' '+y+')"/>';}
return h;}
let paths;
function canvas(plot,rotor){const c=plot.c,scale=Math.min(Math.abs(plot.X(1)-plot.X(0)),Math.abs(plot.Y(1)-plot.Y(0)))/211;c.save();c.translate(plot.X(0),plot.Y(0));c.scale(scale,scale);
for(const [r,fill,stroke]of [[211,'#e7eeec','#8caaa3'],[173,'#fafcfb','#c4d3ce'],[147,'#f3eee3','#b9781c']]){c.beginPath();c.arc(0,0,r,0,2*Math.PI);c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
paths??=[new Path2D(statorPath),new Path2D(rotorPath)];for(const [count,angle,index,fill,stroke]of [[24,0,0,'#f8faf9','#a9bdb6'],[20,rotor,1,'#ebe4d6','#c3ae88']])for(let k=0;k<count;k++){c.save();c.rotate(-(angle+k*2*Math.PI/count));c.fillStyle=fill;c.strokeStyle=stroke;c.lineWidth=1;c.fill(paths[index]);c.stroke(paths[index]);c.restore();}for(const [r,fill]of [[25,'#d6dedb'],[8,'#fff']]){c.beginPath();c.arc(0,0,r,0,2*Math.PI);c.fillStyle=fill;c.fill();c.strokeStyle='#8caaa3';c.stroke();}c.restore();}
window.InductionMachineArt={svg,canvas,statorPath,rotorPath};
})();

// DC machine extension of the shared renderer. RMxprt-based dimensions and the
// same iron/copper palette, semi-closed slots, layered fields and current marks.
(()=>{
const C={iron:'#e7eeec',edge:'#8caaa3',rotor:'#f3eee3',copper:'#b9781c',red:'#cf5d4c',blue:'#527fb8',green:'#007e6c'},rad=180/Math.PI;
function mark(x,y,i,r=3.7){const ink=r>=5?(i>0?'#007e6c':'#285ca8'):'#8b5b19';return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffaf0" stroke="${C.copper}" stroke-width=".65"/>`+(Math.abs(i)<.01?'':i>0?`<circle cx="${x}" cy="${y}" r="${r*.38}" fill="${ink}"/>`:`<path d="M${x-r*.48} ${y-r*.48}l${r*.96} ${r*.96}m${-r*.96} 0l${r*.96} ${-r*.96}" stroke="${ink}" stroke-width="${r>=5?1.9:1.1}"/>`);}
window.DCMachineArt={
 mainFieldShape(angle){const c=Math.cos(2*angle),distance=Math.acos(Math.min(1,Math.abs(c)))/2,t=Math.max(0,Math.min(1,(Math.PI/4-distance)/(Math.PI/4-Math.PI/7)));return -Math.sign(c)*t*t*(3-2*t);},
 lamellaContact(start,end){const half=.052,wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));for(let k=0;k<4;k++){const center=Math.PI/4+k*Math.PI/2,d=wrap(start-center),lo=Math.max(d,-half),hi=Math.min(d+end-start,half);if(hi-lo>1e-9)return {touching:true,brush:k,from:start+lo-d,to:start+hi-d};}return {touching:false,brush:-1};},
 brushContact(theta,count=50){const pitch=2*Math.PI/count,gap=.012,first=this.lamellaContact(theta-pitch,theta-gap),second=this.lamellaContact(theta,theta+pitch-gap),shorted=first.touching&&second.touching&&first.brush===second.brush;return {shorted,brush:shorted?first.brush:-1};},
 coilCurrent(angle){const gap=.012,half=.052-gap/2,distance=Math.asin(Math.cos(2*(angle-gap/2)))/2;return Math.max(-1,Math.min(1,distance/half));},
 statorShape(G){const R=G.yoke,j=Math.sqrt(R*R-55*55),q=Math.sqrt(R*R-100),pt=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)].map(n=>n.toFixed(3)).join(' ');let inner='M'+pt(j,-55,0);for(let k=0;k<4;k++){const a=k*Math.PI/2,b=a+Math.PI/4;inner+='L'+pt(155,-55,a)+'L'+pt(143,-67,a)+'L'+pt(116.05,-67,a)+'A134 134 0 0 1 '+pt(116.05,67,a)+'L'+pt(143,67,a)+'L'+pt(155,55,a)+'L'+pt(j,55,a)+'A'+R+' '+R+' 0 0 1 '+pt(q,-10,b)+'L'+pt(136,-10,b)+'L'+pt(136,10,b)+'L'+pt(q,10,b)+'A'+R+' '+R+' 0 0 1 '+pt(j,-55,a+Math.PI/2);}return '<path class="dc-unified-stator" d="M'+G.outer+' 0A'+G.outer+' '+G.outer+' 0 1 1 '+(-G.outer)+' 0A'+G.outer+' '+G.outer+' 0 1 1 '+G.outer+' 0Z '+inner+'Z" fill="'+C.iron+'" fill-rule="evenodd" stroke="'+C.edge+'" stroke-width="1.5"/>';},
 machine(s,field='',opts={}){
 const G=opts.geometry||window.DCGeometry,theta=s.theta||0,current=s.current??1,flux=s.flux??1,brush=s.brush||0;
 let out=`<circle r="${G.yoke}" fill="#fafcfb"/>`+this.statorShape(G);
 for(let k=0;k<4;k++)out+=`<g transform="rotate(${-k*90})"><rect x="157" y="-79" width="27" height="22" rx="4" fill="#ead0a4" stroke="${C.copper}"/><rect x="157" y="57" width="27" height="22" rx="4" fill="#ead0a4" stroke="${C.copper}"/></g>`;
 out+=`<circle r="130" fill="${C.rotor}" stroke="${C.copper}" stroke-width="1.7"/><g transform="rotate(${-theta*rad})">`;
 for(let k=0;k<G.slots;k++)out+=`<path transform="rotate(${-k*360/G.slots})" d="${opts.enlargedSlots?'M131 -2.67L126.2 -2.67L124 -5.7L103.2 -4.7L103.2 4.7L124 5.7L126.2 2.67L131 2.67Z':G.slotPath}" fill="#fcfaf5" stroke="#b6a07a" stroke-width=".7"/>`;
 out+='</g>';
 for(let k=0;k<4;k++)out+=`<g transform="rotate(${-45-k*90})"><rect x="163" y="-20" width="29" height="10" rx="2" fill="${opts.interpoles?'#d9e6f8':'#eceee8'}" stroke="${opts.interpoles?C.blue:'#a4b3aa'}"/><rect x="163" y="10" width="29" height="10" rx="2" fill="${opts.interpoles?'#d9e6f8':'#eceee8'}" stroke="${opts.interpoles?C.blue:'#a4b3aa'}"/></g>`;
 out+=field;
 if(opts.conductors){
  // Explicit two-layer coil sides share the same machine geometry and current marks.
  for(const side of opts.conductors){const r=side.radius??116,x=r*Math.cos(side.angle),y=-r*Math.sin(side.angle);if(opts.showCurrents!==false)out+=mark(x,y,side.current,side.selected?5.8:3.7);if(side.color)out+=`<circle cx="${x}" cy="${y}" r="${side.selected?8:5.2}" fill="none" stroke="${side.color}" stroke-width="${side.selected?2.2:1.1}" opacity="${side.selected?1:.65}"/>`;}
 }else for(let k=0;k<G.slots;k++){const a=theta+k*2*Math.PI/G.slots,x=116*Math.cos(a),y=-116*Math.sin(a),i=current*(opts.brushCommutation?window.DCMachineArt.coilCurrent(a-brush):Math.sign(Math.cos(2*(a-brush))));if(opts.showCurrents!==false)out+=mark(x,y,i,opts.enlargedSlots?5.8:2.9);}
 for(let k=0;k<4;k++){
  const sign=(k%2?-1:1)*flux;out+=`<g transform="rotate(${-k*90})">`;
  for(const v of [-68,68])for(const u of [162,171,180])out+=mark(u,v,-sign*Math.sign(-v),3.6);
  if(opts.compensation)for(const v of [-40,-20,0,20,40]){const a=Math.asin(v/138)*180/Math.PI;out+=`<g transform="rotate(${a})"><path d="M133 -2.2H136V-5H148V5H136V2.2H133Z" fill="#fffaf0" stroke="#9b957a" stroke-width="1.1"/>${mark(141.5,0,-(opts.compensationCurrent??current)*(k%2?-1:1),3.6)}</g>`;}
  out+='</g>';
  const a=k*Math.PI/2,x=185*Math.cos(a),y=-185*Math.sin(a);out+=`<circle cx="${x}" cy="${y}" r="11" fill="#fffcf5"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="13" font-weight="650" fill="${sign>0?C.red:C.blue}">${Math.abs(sign)<.001?'':sign>0?'S':'J'}</text>`;
 }

 if(opts.interpoles&&opts.showCurrents!==false)for(let k=0;k<4;k++){out+=`<g transform="rotate(${-45-k*90})">`;for(const v of [-15,15])for(const u of [170,184])out+=mark(u,v,(opts.interpoleExcitation??current)*(k%2?-1:1)*Math.sign(v),3.3);out+='</g>';}
 if(opts.neutral){for(let k=0;k<2;k++){const a=Math.PI/4+k*Math.PI/2;out+=`<path d="M${-200*Math.cos(a)} ${200*Math.sin(a)}L${200*Math.cos(a)} ${-200*Math.sin(a)}" stroke="#94a2ad" stroke-width="1" stroke-dasharray="4 5"/>`;const b=a+(opts.neutralShift||0);out+=`<path d="M${-200*Math.cos(b)} ${200*Math.sin(b)}L${200*Math.cos(b)} ${-200*Math.sin(b)}" stroke="#ad365d" stroke-width="1.5" stroke-dasharray="7 4"/>`;}}
 if(opts.forces&&Math.abs(current*flux)>.001){
  // Two forces belonging to the highlighted full-pitch teaching coil.
  // Common automatic scale keeps direction and relative size legible.
  for(const a of [theta,theta+2*Math.PI*G.coilPitchSlots/G.slots]){
   const signed=-window.DCMachineArt.coilCurrent(a)*window.DCMachineArt.mainFieldShape(a)*Math.sign(current*flux),length=43*Math.abs(signed);
   if(length<1)continue;
   const dir=Math.sign(signed),dx=dir*Math.sin(a),dy=dir*Math.cos(a),x=116*Math.cos(a)+8*dx,y=-116*Math.sin(a)+8*dy;
   out+=window.DCVisual.arrow(x,y,length*dx,length*dy,'#fffaf5',7);
   out+=window.DCVisual.arrow(x,y,length*dx,length*dy,'#ad365d',3.4).replace('Z" fill=', 'Z" stroke="#fffaf5" stroke-width="1.2" paint-order="stroke" fill=');
  }
 }
 out+=`<circle r="${G.shaft}" fill="#d6dedb" stroke="${C.edge}"/><circle r="9" fill="#fafcfb" stroke="${C.edge}"/><path transform="rotate(${-theta*rad})" d="M-5 -40h10v11h-10Z" fill="#9aaea5"/>`;
 return out;
 },

 commutationTeaching(s){
 const V=window.DCVisual,t=s.phase,edge=220+180*t,left=edge-90,right=edge+90,C1='#bf5849',C2='#346fc0',CC='#008372';
 const m=(x,y,f,c='#284747',z=19,w=160)=>V.math(x,y,f,c,z,w),a=(x,y,dx,dy,c)=>V.arrow(x,y,dx,dy,c,2.4);
 let h='<defs><linearGradient id="cm-copper" x2="0" y2="1"><stop stop-color="#ffdfaa"/><stop offset=".5" stop-color="#dbac69"/><stop offset="1" stop-color="#b7803f"/></linearGradient><linearGradient id="cm-carbon" x2="1" y2="0"><stop stop-color="#263e38"/><stop offset=".5" stop-color="#647b71"/><stop offset="1" stop-color="#304b41"/></linearGradient></defs><rect x="15" y="20" width="610" height="390" rx="14" fill="#f7faf8" stroke="#d5e2da"/>';
 h+='<path d="M35 280H605" stroke="#aebfb7" stroke-width="18"/>';
 for(let j=-2;j<=2;j++){const x=edge+j*180;h+=`<rect x="${x}" y="220" width="180" height="44" fill="url(#cm-copper)" stroke="#a58a5b" stroke-width="1.3"/>`;}
 h+=`<path d="M${left} 220V160Q${edge} 40 ${right} 160V220" fill="none" stroke="${CC}" stroke-width="5"/>`;
 h+=`<path d="M${left-180} 220V160Q${left-90} 40 ${left} 160V220M${right} 220V160Q${right+90} 40 ${right+180} 160V220" fill="none" stroke="#718780" stroke-width="2"/>`;
 h+=a(left-110,77,40,0,'#718780')+a(right+110,77,-40,0,'#718780')+m(left-90,48,'i_a')+m(right+90,48,'i_a');
 if(Math.abs(s.i)>1e-5){const len=54*Math.min(1,Math.abs(s.i));h+=a(edge-Math.sign(s.i)*len/2,77,Math.sign(s.i)*len,0,CC);}
 // Moving markers follow the actual selected coil path; their speed and direction track its current.
 const travel=s.travel??t;
 if(Math.abs(s.i)>.02)for(let k=0;k<7;k++){
  const u=((k/7+travel)%1+1)%1;let x,y;
  if(u<.15){x=left;y=220-60*u/.15;}
  else if(u<.85){const v=(u-.15)/.7;x=left+180*v;y=160-240*v*(1-v);}
  else{x=right;y=160+60*(u-.85)/.15;}
  h+=`<circle class="cm-flow-dot" cx="${x}" cy="${y}" r="3.4" fill="#fff8c9"/>`;
 }
 h+=m(edge,48,'i',CC)+'<g class="cm-inductance-label"><title>Rozptylová indukčnost komutující cívky</title>'+m(edge,145,'L_\\sigma',CC,19,70)+'</g>';
 h+=m(left,247,'2',C2)+m(right,247,'1',C1);
 h+='<rect x="220" y="264" width="180" height="68" rx="2" fill="url(#cm-carbon)" stroke="#253e35" stroke-width="2"/>';
 if(t>0)h+=`<path d="M220 266H${edge}" stroke="${C2}" stroke-width="7"/>`;
 if(t<1)h+=`<path d="M${edge} 266H400" stroke="${C1}" stroke-width="7"/>`;
 h+='<path d="M225 272H395M225 324H395" stroke="#91a79c" stroke-width="1"/>';
 h+='<text x="310" y="308" text-anchor="middle" font-size="18" fill="white">Kartáč</text>';
 for(const [x,v,c,label]of [[(220+edge)/2,s.i2,C2,'i_2'],[(edge+400)/2,s.i1,C1,'i_1']]){if(Math.abs(v)>1e-5)h+=a(x,v>=0?185:216,0,v>=0?31:-31,c);h+=m(x,351,label,c,19,85);}
 h+=a(310,379,0,23,'#284747')+m(405,390,'I=2i_a','#284747',19,145);
 h+=a(465,315,85,0,'#718780')+'<text x="505" y="347" text-anchor="middle" font-size="14" fill="#718780">Pohyb lamel</text>';
 h+='<path d="M400 260V285" stroke="#bf5849" stroke-width="2"/>';
 if(t>.8&&Math.abs(s.i1)>.05)h+='<circle cx="400" cy="266" r="14" fill="#e99a32" opacity=".22"/>';
 return '<svg x="0" y="0" width="640" height="430" viewBox="0 0 640 430" overflow="hidden">'+h+'</svg>';
 },
 commutationDetail(s){
 if(s.teachingPhase!==undefined)return this.commutationTeaching({...s,phase:s.teachingPhase});
 const V=window.DCVisual,theta=-s.position*2*Math.PI,pitch=2*Math.PI/50,gap=.012,half=.052,axis=Math.PI/4+Math.round((theta-Math.PI/4)/(Math.PI/2))*Math.PI/2,scale=108/(pitch-gap),origin=270,bx=origin-(theta-axis)*scale,hw=half*scale,left=origin-pitch*scale,closed=this.brushContact(theta).shorted;
 const ink='#284747',muted='#748b85',accent='#ad365d';
 const label=(x,y,t,color=muted,size=12)=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" style="fill:'+color+'" font-family="Segoe UI,sans-serif" font-size="'+size+'">'+t+'</text>';
 let out='<defs><linearGradient id="dc-cu" x2="0" y2="1"><stop stop-color="#f6d39a"/><stop offset=".45" stop-color="#dba85b"/><stop offset="1" stop-color="#bb7e32"/></linearGradient><linearGradient id="dc-carbon" x2="1" y2="0"><stop stop-color="#263b39"/><stop offset=".5" stop-color="#586b65"/><stop offset="1" stop-color="#2b403c"/></linearGradient><pattern id="dc-insulation" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 5L5 0" stroke="#c5cbbf" stroke-width=".8"/></pattern><clipPath id="dc-brush-detail"><rect x="8" y="0" width="524" height="205"/></clipPath></defs><g clip-path="url(#dc-brush-detail)">';
 out+='<rect x="0" y="151" width="540" height="12" fill="#e4e6db" stroke="#9baba0"/><rect x="0" y="104" width="540" height="47" fill="url(#dc-insulation)"/>';
 for(let n=-3;n<=3;n++){if(n===-1||n===0)continue;const x=origin+n*pitch*scale;out+='<g opacity=".65"><path d="M'+x+' 104h108v39l-5 8H'+(x+5)+'l-5 -8Z" fill="url(#dc-cu)" stroke="#936a35" stroke-width="1"/><path d="M'+(x+3)+' 107h102M'+(x+3)+' 142h102" stroke="#fff1c9" fill="none"/></g>';}

 for(const [x,n]of [[left,'1'],[origin,'2']]){
  out+='<path d="M'+x+' 104h108v39l-5 8H'+(x+5)+'l-5 -8Z" fill="url(#dc-cu)" stroke="#936a35" stroke-width="1.3"/><path d="M'+(x+3)+' 107h102M'+(x+3)+' 142h102" fill="none" stroke="#fff1c9" stroke-width="1"/>';
  out+=V.math(x+54,130,n,'#724b23',16,45);
  out+='<rect x="'+(x+47)+'" y="151" width="14" height="15" rx="2" fill="#c3924d" stroke="#936a35"/><circle cx="'+(x+54)+'" cy="157" r="2.2" fill="#fff0c9"/>';
  const lo=Math.max(x,bx-hw),hi=Math.min(x+108,bx+hw);if(hi>lo)out+='<path d="M'+lo+' 104H'+hi+'" stroke="'+accent+'" stroke-width="3.2"/>';
 }
 out+='<path d="M'+(left+54)+' 166v24H228M310 190H'+(origin+54)+'v-24" fill="none" stroke="'+accent+'" stroke-width="2.5"/><path d="M228 190q8 -25 16 0q8 -25 16 0q8 -25 16 0q8 -25 16 0q8 -25 16 0h2" fill="none" stroke="'+accent+'" stroke-width="2.5"/>';
 out+='<path d="M'+(bx-hw-9)+' 92V47H'+(bx+hw+9)+'v45h-7V54H'+(bx-hw-2)+'v38Z" fill="#d7e0db" stroke="#7d958b" stroke-width="1.2"/>';
 out+='<rect x="'+(bx-hw)+'" y="66" width="'+2*hw+'" height="38" fill="url(#dc-carbon)" stroke="#243c36" stroke-width="1.3"/><path d="M'+(bx-hw+4)+' 69h'+(2*hw-8)+'" stroke="#91a59b" fill="none"/>';
 out+='<path d="M'+(bx-15)+' 22v6l-6 4 12 5-12 5 12 5-12 5 6 4v10" fill="none" stroke="#627d71" stroke-width="1.7"/><path d="M'+(bx+15)+' 66C'+(bx+35)+' 53 '+(bx+7)+' 34 '+(bx+22)+' 20" fill="none" stroke="#b88948" stroke-width="4" stroke-linecap="round"/><path d="M'+(bx+15)+' 66C'+(bx+35)+' 53 '+(bx+7)+' 34 '+(bx+22)+' 20" fill="none" stroke="#f5d6a3" stroke-width="1" stroke-dasharray="2 2"/>';
 if(bx>65&&bx<470)out+=label(bx-hw,13,'Kartáč ve vedení',ink,12);
 out+=label(404,87,'Izolace')+'<path d="M400 84H389L'+(origin-gap*scale/2)+' 101" fill="none" stroke="#8ba095" stroke-width=".8"/>'+label(393,191,'Cívka')+'<path d="M386 187H341" fill="none" stroke="#8ba095" stroke-width=".8"/>';
 if(s.sparks&&s.sparkRemaining>0){const x=s.sparkSide==='left'?origin-gap*scale:origin,y=104,fade=Math.min(1,s.sparkRemaining/.14),flip=Math.floor(s.sparkRemaining*100)%2?1:-1;out+='<g opacity="'+fade+'" pointer-events="none"><circle cx="'+x+'" cy="'+y+'" r="15" fill="#ffa321" opacity=".14"/><circle cx="'+x+'" cy="'+y+'" r="8" fill="#ffd03c" opacity=".35"/>';for(const [dx,dy]of [[-15,-16],[5,-23],[17,-11],[-19,3],[12,6]])out+='<path d="M'+x+' '+y+'l'+(dx*.4)+' '+(dy*.35)+'l'+(-flip*3)+' -3L'+(x+dx)+' '+(y+dy)+'" fill="none" stroke="#ec9420" stroke-width="2.4" stroke-linecap="round"/><path d="M'+x+' '+y+'l'+(dx*.65)+' '+(dy*.65)+'" stroke="#fff1a8" stroke-width="1.1"/>';out+='<circle cx="'+x+'" cy="'+y+'" r="2.8" fill="#fffbe1"/></g>';}
 out+='</g><rect x="74" y="210" width="392" height="23" rx="11" fill="'+(closed?'#faedf2':'#eef3ef')+'"/><circle cx="91" cy="221" r="3.5" fill="'+(closed?accent:muted)+'"/>'+label(104,225,closed?'Obě lamely v kontaktu · cívka zkratována':'Kontakt rozpojen · cívka není zkratována',closed?accent:muted,12);
 return out;
 },
 commutator(theta,current=1,count=24,linked=false,opts={}){const selected=opts.coilIndex||0,contact=window.DCMachineArt.brushContact(theta+selected*2*Math.PI/count,count);let out='<circle r="73" fill="#e9e3d8" stroke="#b8a484"/><circle r="36" fill="#d6dedb" stroke="#8caaa3"/>';
 for(let k=0;k<count;k++){const a=theta+k*2*Math.PI/count,b=a+2*Math.PI/count-(linked?.012:.025),pt=(r,t)=>`${r*Math.cos(t)},${-r*Math.sin(t)}`,touch=linked?this.lamellaContact(a,b):null,direction=this.coilCurrent((a+b)/2)*current;out+=`<path d="M${pt(73,a)}A73 73 0 0 0 ${pt(73,b)}L${pt(45,b)}A45 45 0 0 1 ${pt(45,a)}Z" fill="${linked?(touch.touching?'#dfa24a':Math.abs(direction)<.001?'#eed5ae':direction>0?'#91cbb4':'#9ebde5'):(Math.cos(2*a)*current>0?'#d69a4d':'#eed5ae')}" stroke="${linked&&(k===selected||k===(selected+count-1)%count)?'#ad365d':'#9c702f'}" stroke-width="${linked&&(k===selected||k===(selected+count-1)%count)?1.8:.55}"/>`;if(linked&&touch.touching)out+=`<path d="M${pt(73,touch.from)}A73 73 0 0 0 ${pt(73,touch.to)}" fill="none" stroke="#007e6c" stroke-width="2.2"/>`;}
 for(let k=0;k<4;k++){const col=linked&&contact.brush===k?'#ad365d':'#566561',h=.052,pt=(r,t)=>r*Math.cos(t)+','+r*Math.sin(t);out+=`<g transform="rotate(${-45-k*90})">`+(linked?`<path d="M${pt(73,-h)}L${pt(101,-h)}A101 101 0 0 1 ${pt(101,h)}L${pt(73,h)}A73 73 0 0 0 ${pt(73,-h)}Z" fill="${col}" stroke="#334640"/>`:'<rect x="68" y="-9" width="33" height="18" rx="2" fill="#566561" stroke="#334640"/>')+`<path d="M101 0h20" stroke="${k%2?C.blue:C.red}" stroke-width="3"/></g>`;}
 return out+'<circle r="9" fill="#fafcfb" stroke="#8caaa3"/>';},
 bldc(theta,phaseCurrents,field=''){
 const W={Q:24,layers:1,theta:Array.from({length:24},(_,k)=>k*Math.PI/12),sides:Array.from({length:24},(_,k)=>{const spatial=[0,2*Math.PI/3,4*Math.PI/3].map(a=>Math.sin(k*Math.PI/12-a));const phase=spatial.reduce((best,v,j)=>Math.abs(v)>Math.abs(spatial[best])?j:best,0),sign=spatial[phase]>=0?1:-1;return [{phase,sign,weight:1,layer:0}];})};
 let out=window.SlottedWindingArt(W,{curr:phaseCurrents},[C.red,C.blue,'#aba044'],'');
 out+='<circle r="147" fill="#fafcfb" stroke="#c4d3ce"/><circle r="123" fill="#f3eee3" stroke="#b9781c"/>'; 
 out+=`<g transform="rotate(${-theta*rad})"><path d="M57 -122A135 135 0 0 1 57 122L52 111A123 123 0 0 0 52 -111Z" fill="${C.red}" stroke="#8b7970"/><path d="M-57 122A135 135 0 0 1 -57 -122L-52 -111A123 123 0 0 0 -52 111Z" fill="${C.blue}" stroke="#8b7970"/></g>`+field;
 out+='<circle r="24" fill="#d6dedb" stroke="#8caaa3"/><circle r="8" fill="#fff"/>';return out;
 }
};
})();

/* Introductory two-pole model: finite-volume linear magnetostatics.
   Permeability follows the unified stator and wide pole shoes; rotor coil is air-core. */
(()=>{
 const T=2*Math.PI,green='#007e6c',blue='#346fc0',pink='#ad365d';
 const txt=(x,y,t,c='#233f49',size=18)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${c}" font-family="Segoe UI, sans-serif" font-size="${size}">${t}</text>`;
 const arrow=(x,y,dx,dy,c)=>{const l=Math.hypot(dx,dy);if(l<.2)return '';const ux=dx/l,uy=dy/l,h=Math.min(10,l*.65),w=h*.4;return `<path d="M${x} ${y}l${dx-h*.8*ux} ${dy-h*.8*uy}" stroke="${c}" stroke-width="${Math.min(3,l*.2)}" stroke-linecap="butt"/><path d="M${x+dx} ${y+dy}l${-h*ux+w*uy} ${-h*uy-w*ux}l${-2*w*uy} ${2*w*ux}Z" fill="${c}"/>`;};
 const mark=(x,y,i)=>`<circle cx="${x}" cy="${y}" r="12" fill="#fffdf7" stroke="${i>=0?green:blue}" stroke-width="2"/>`+(Math.abs(i)<.001?'':i>0?`<circle cx="${x}" cy="${y}" r="5" fill="${green}"/>`:`<path d="M${x-5} ${y-5}l10 10m-10 0l10 -10" stroke="${blue}" stroke-width="2.5"/>`);
 const api=window.DCSimpleModel={
  values(s){const a=Math.PI/2+s.position*T,j=-s.amount*(s.commutation?Math.sign(Math.sin(a)):1);return {a,j,x:window.DCSimpleFieldBasis.coilRadius*Math.cos(a),y:window.DCSimpleFieldBasis.coilRadius*Math.sin(a),moment:-j*s.flux*Math.sin(a)};},
  weights(s){const b=window.DCSimpleFieldBasis,v=this.values(s),u=((v.a/(2*Math.PI)%1)+1)%1*2*b.steps,i=Math.floor(u),t=u-i;const side=k=>({index:1+k%b.steps,sign:k%(2*b.steps)<b.steps?1:-1});return {b,p:side(i),q:side(i+1),t,j:s.rotor?v.j:0,f:s.stator?s.flux:0};},
  grid(s){const {b,p,q,t,j,f}=this.weights(s),a=new Float32Array(b.N*b.N);for(let k=0;k<a.length;k++)a[k]=f*b.fields[0][k]+j*((1-t)*p.sign*b.fields[p.index][k]+t*q.sign*b.fields[q.index][k]);return a;},
  potential(x,y,s){const {b,p,q,t,j,f}=this.weights(s),u=(x+b.R)*(b.N-1)/(2*b.R),v=(y+b.R)*(b.N-1)/(2*b.R),i=Math.floor(u),n=Math.floor(v);if(i<0||n<0||i>=b.N-1||n>=b.N-1)return 0;const sample=a=>{const k=n*b.N+i,dx=u-i,dy=v-n;return (1-dy)*((1-dx)*a[k]+dx*a[k+1])+dy*((1-dx)*a[k+b.N]+dx*a[k+b.N+1]);};return f*sample(b.fields[0])+j*((1-t)*p.sign*sample(b.fields[p.index])+t*q.sign*sample(b.fields[q.index]));},
  borePath(){const j=Math.sqrt(209*209-46*46);return 'M-46 '+(-j)+'L-46 -159L-95 -141V-120Q0 -145 95 -120V-141L46 -159V'+(-j)+'A209 209 0 0 1 46 '+j+'V159L95 141V120Q0 145 -95 120V141L-46 159V'+j+'A209 209 0 0 1 -46 '+(-j)+'Z';},
  contourLevels(s){const levels=[];for(let v=-1.54;v<1.55;v+=.14)if(Math.abs(v)>=.04)levels.push(v);const n=Math.max(0,Math.round(((s.lineCount??18)-6)/2)),gx=this.potential(2,0,s)-this.potential(-2,0,s),gy=this.potential(0,2,s)-this.potential(0,-2,s),len=Math.hypot(gx,gy);if(len>1e-10)for(let k=0;k<n;k++){const d=-80+160*(k+.5)/n,v=(Math.floor(this.potential(d*gx/len,d*gy/len,s)/.14)+.5)*.14;if(Math.abs(v)>1e-8&&!levels.some(w=>Math.abs(v-w)<.012))levels.push(v);}return levels;},
  field(s){const b=window.DCSimpleFieldBasis,c=MagneticContours(this.grid(s),b.N,b.R,s.stator&&s.rotor?green:s.stator?blue:pink,[],this.contourLevels(s));return c.paths+c.arrows;}
 };
 // Keep machine geometry in the shared machine renderer.
 window.DCMachineArt.simplePrinciple=function(s){const v=api.values(s),join=Math.sqrt(209*209-46*46);let out='<g transform="translate(335 285)"><path class="dc-simple-unified-stator" d="M238 0A238 238 0 1 1 -238 0A238 238 0 1 1 238 0Z M-46 '+(-join)+'L-46 -159L-95 -141V-120Q0 -145 95 -120V-141L46 -159V'+(-join)+'A209 209 0 0 1 46 '+join+'V159L95 141V120Q0 145 -95 120V141L-46 159V'+join+'A209 209 0 0 1 -46 '+(-join)+'Z" fill="#e7eeec" fill-rule="evenodd" stroke="#8caaa3" stroke-width="1.5"/>';
 for(const sign of [-1,1])out+=`<g transform="scale(1 ${sign})"><rect x="-69" y="-192" width="20" height="31" rx="5" fill="#e9c992" stroke="#b9781c"/><rect x="49" y="-192" width="20" height="31" rx="5" fill="#e9c992" stroke="#b9781c"/></g>`;
 out+=api.field(s);for(const y of [-176.5,176.5])for(const x of [-59,59])out+='<g transform="translate('+x+' '+y+') scale(.65)">'+mark(0,0,s.flux*Math.sign(x))+'</g>';
 out+=`<path d="M${v.x} ${-v.y}L${-v.x} ${v.y}" stroke="#a76914" stroke-width="5" opacity=".45"/><circle r="24" fill="#d6dedb" stroke="#8caaa3"/><circle r="8" fill="white" stroke="#8caaa3"/>`;
 out+=mark(v.x,-v.y,v.j)+mark(-v.x,v.y,-v.j);
 if(s.forces){out+=arrow(v.x,-v.y,v.j*s.flux*55,0,pink)+arrow(-v.x,v.y,-v.j*s.flux*55,0,pink);}
 out+=txt(0,-172,s.flux>=0?'S':'J')+txt(0,184,s.flux>=0?'J':'S')+'</g>';
 out+=txt(335,555,s.stator&&s.rotor?'Výsledné pole statoru a rotoru':s.stator?'Pouze statorové pole':s.rotor?'Pouze rotorové pole':'Pole skryta',s.stator&&s.rotor?green:s.stator?blue:pink);
 out+='<rect x="645" y="45" width="310" height="295" rx="14" fill="#f7faf7" stroke="#d4e0d8"/>'+txt(800,78,'Dvoudílný komutátor');
 const pt=(r,a)=>`${r*Math.cos(a)},${-r*Math.sin(a)}`;
 out+='<g transform="translate(800 205)">';
 for(let k=0;k<2;k++){const a=v.a+k*Math.PI+.035,b=a+Math.PI-.07;out+=`<path d="M${pt(65,a)}A65 65 0 0 0 ${pt(65,b)}L${pt(39,b)}A39 39 0 0 1 ${pt(39,a)}Z" fill="${(k?-v.j:v.j)>=0?'#91cbb4':'#9ebde5'}" stroke="#9c702f" stroke-width="1.5"/>`;}
 out+='<circle r="15" fill="#d6dedb" stroke="#8caaa3"/>';
 for(const sign of [-1,1])out+=`<g transform="scale(${sign} ${sign})"><path d="M${pt(65,-.12)}L${pt(91,-.12)}A91 91 0 0 0 ${pt(91,.12)}L${pt(65,.12)}A65 65 0 0 1 ${pt(65,-.12)}Z" fill="#566561" stroke="#334640"/><path d="M91 0h32" stroke="${sign<0?blue:green}" stroke-width="3"/></g>`;
 if(s.sparks&&s.commutation&&s.sparkRemaining>0&&Math.abs(s.amount)>.001){for(const sign of [-1,1]){const x=sign*65*Math.cos(.12),y=-sign*(s.sparkDirection||1)*65*Math.sin(.12);out+=`<g class="dc-simple-spark" opacity="${Math.min(1,s.sparkRemaining/.15)}"><circle cx="${x}" cy="${y}" r="15" fill="#ffb52c" opacity=".2"/>`;for(const [dx,dy]of [[-10,-18],[4,-23],[17,-12],[-16,5],[14,9]])out+=`<path d="M${x} ${y}l${dx*.4} ${dy*.4}l-2 -3L${x+dx} ${y+dy}" fill="none" stroke="#eaa025" stroke-width="2"/>`;out+=`<circle cx="${x}" cy="${y}" r="3" fill="#fff4b5"/></g>`;}}
 out+='</g>'+txt(800,312,s.commutation?'Proud se přepíná po půlotáčce':'Proud cívky má stálý směr',s.commutation?green:pink,16);
 out+='<rect x="645" y="360" width="310" height="180" rx="14" fill="#f7faf7" stroke="#d4e0d8"/>'+txt(800,391,'Moment jedné cívky');
 out+=`<path d="M680 455H920" stroke="#c3d5cb"/><path d="M800 423V485" stroke="#c3d5cb"/>`+arrow(800,455,v.moment*100,0,pink)+txt(800,518,Math.abs(v.moment)<.015?'Nulový moment':v.moment>0?'Proti směru hodinových ručiček':'Po směru hodinových ručiček',pink,14);
 return out;
 };
})();
/* Enlarged unrolled DC pole detail, shared with the field-composition lesson. */
(()=>{
 const symbol=(x,y,current,color,r=5)=>`<g data-current-sign="${Math.sign(current)}"><circle cx="${x}" cy="${y}" r="${r}" fill="#fffdf8" stroke="${color}" stroke-width="1.1"/>`+(Math.abs(current)<1e-9?'':current>0?`<circle cx="${x}" cy="${y}" r="${r*.35}" fill="${color}"/>`:`<path d="M${x-r*.48} ${y-r*.48}l${r*.96} ${r*.96}m${-r*.96} 0l${r*.96} ${-r*.96}" fill="none" stroke="${color}" stroke-width="1.5"/>`)+'</g>';
 window.DCMachineArt.unrolledCurrent=symbol;
 window.DCMachineArt.unrolledPole=function({x,width,polarity,excitation,compensation,interpole=false}){
  const half=width/2,stem=interpole?9:width*.21,color=interpole?'#ad365d':'#a76914',coilX=stem+9;
  let out=`<g data-winding="${interpole?'interpole':'main'}"><path d="M${x-stem} 45H${x+stem}V85L${x+half} 93V110H${x-half}V93L${x-stem} 85Z" fill="#dce4e8" stroke="#83969e" stroke-width="1.3"/>`;
  for(const side of [-1,1]){out+=`<rect x="${x+side*coilX-7}" y="51" width="14" height="32" rx="2" fill="${interpole?'#f4e3eb':'#f4e6ce'}" stroke="${color}"/>`;for(const y of [58,75])out+=symbol(x+side*coilX,y,-side*excitation,color,5);}
  if(!interpole){out+=`<text x="${x}" y="77" text-anchor="middle" font-family="Segoe UI,sans-serif" font-size="17" fill="#233f49">${Math.abs(excitation)<1e-9?'':polarity}</text>`;for(let j=0;j<7;j++){const cx=x+width*(j-3)/8;out+=`<rect x="${cx-7}" y="94" width="14" height="16" fill="#faf5ef" stroke="#b4a59c"/>`+symbol(cx,102,compensation,'#bf5849',5);}}
  return out+'</g>';
 };
})();
