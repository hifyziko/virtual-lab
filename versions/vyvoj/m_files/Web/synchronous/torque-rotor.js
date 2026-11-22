(()=>{
'use strict';
const $=id=>document.getElementById(id),math=t=>katex.renderToString(t,{throwOnError:false});
const rotorContours=function(a,N,R,color,levels){const h=2*R/(N-1);let paths='',arrows='';const key=(i,j,vertical)=>(j*N+i)*2+(vertical?1:0);
 for(const level of levels.sort((a,b)=>a-b)){const nodes=new Map();
 const edge=(i,j,v0,v1,vertical)=>{const t=(level-v0)/(v1-v0);return {key:key(i,j,vertical),x:-R+(i+(vertical?0:t))*h,y:-R+(j+(vertical?t:0))*h,neighbors:[]};};
 const connect=(u,v)=>{if(!nodes.has(u.key))nodes.set(u.key,u);if(!nodes.has(v.key))nodes.set(v.key,v);nodes.get(u.key).neighbors.push(v.key);nodes.get(v.key).neighbors.push(u.key);};
 for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){const k=j*N+i,v0=a[k],v1=a[k+1],v2=a[k+N+1],v3=a[k+N];if(level<Math.min(v0,v1,v2,v3)||level>Math.max(v0,v1,v2,v3))continue;const v=[v0,v1,v2,v3];const cross=(x,y)=>(x<level)!==(y<level),edges=[];
 if(cross(v[0],v[1]))edges.push(edge(i,j,v[0],v[1],false));if(cross(v[1],v[2]))edges.push(edge(i+1,j,v[1],v[2],true));if(cross(v[2],v[3]))edges.push(edge(i,j+1,v[3],v[2],false));if(cross(v[3],v[0]))edges.push(edge(i,j,v[0],v[3],true));
 if(edges.length===2)connect(edges[0],edges[1]);else if(edges.length===4){const mid=(v[0]+v[1]+v[2]+v[3])/4;if((v[0]<level)===(mid<level)){connect(edges[0],edges[1]);connect(edges[2],edges[3]);}else{connect(edges[0],edges[3]);connect(edges[1],edges[2]);}}}
 const visited=new Set();for(const [id,start] of nodes){if(visited.has(id))continue;let current=start,prev=-1,pts=[];while(current&&!visited.has(current.key)){visited.add(current.key);pts.push(current);const next=current.neighbors.find(k=>k!==prev);prev=current.key;current=nodes.get(next);}if(pts.length<8)continue;const closed=current&&current.key===id;
 // Sub-cell corner rounding is only visual; contours retain the computed topology.
 const smooth=pts.map((p,i)=>{if(!closed&&(i===0||i===pts.length-1))return p;const before=pts[(i+pts.length-1)%pts.length],after=pts[(i+1)%pts.length];return {x:(before.x+2*p.x+after.x)/4,y:(before.y+2*p.y+after.y)/4};});
 const first=smooth[0],tail=smooth[smooth.length-1];let path=closed?`M${((first.x+tail.x)/2).toFixed(1)},${(-(first.y+tail.y)/2).toFixed(1)}`:`M${first.x.toFixed(1)},${(-first.y).toFixed(1)}`;
 for(let i=closed?0:1;i<smooth.length;i++){const p=smooth[i],next=smooth[(i+1)%smooth.length];if(!closed&&i===smooth.length-1)path+=`L${p.x.toFixed(1)},${(-p.y).toFixed(1)}`;else path+=`Q${p.x.toFixed(1)},${(-p.y).toFixed(1)} ${((p.x+next.x)/2).toFixed(1)},${(-(p.y+next.y)/2).toFixed(1)}`;}paths+=`<path d="${path}${closed?'Z':''}"/>`;
 // Orient two small arrowheads using B=(dA/dy,-dA/dx).
 for(const fraction of [.22,.72]){const p=pts[Math.floor(pts.length*fraction)],i=Math.max(1,Math.min(N-2,Math.round((p.x+R)/h))),j=Math.max(1,Math.min(N-2,Math.round((p.y+R)/h))),k=j*N+i;let bx=a[k+N]-a[k-N],by=-(a[k+1]-a[k-1]),len=Math.hypot(bx,by);if(len<1e-7)continue;bx/=len;by/=len;const x=p.x,y=-p.y,dx=bx,dy=-by;arrows+=`<path d="M${(x+3*dx).toFixed(1)},${(y+3*dy).toFixed(1)} l${(-7*dx+2.5*dy).toFixed(1)},${(-7*dy-2.5*dx).toFixed(1)} l${(-5*dy).toFixed(1)},${(5*dx).toFixed(1)} Z"/>`;}
 }}return {paths:`<g fill="none" stroke="${color}" stroke-width="1.25" opacity=".73" stroke-linejoin="round">${paths}</g>`,arrows:`<g fill="${color}" opacity=".8">${arrows}</g>`};}
;

function nearEqual(a){return Math.abs(a.xd-a.xq)/Math.max(a.xd,a.xq)<=.06;}
let cachedKey='',cachedArt='';
function rotorArt(type,e,field){
 const s={...SyncPrinciple.create(),type,rotor:0,field:0,excitation:e>0,excitationLevel:e,damper:false};
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.innerHTML=SyncMachineArt(s,false,{axes:false,forces:false},field);
 // Reuse the complete machine renderer, removing only the stator and its annotations.
 for(const node of [...svg.children]){
  const tag=node.tagName.toLowerCase(),r=+node.getAttribute('r');
  if(tag==='circle'&&(r>150||r===14)||tag==='path'&&(node.getAttribute('d')||'').startsWith('M153 -3')||tag==='g'&&node.querySelector('rect[x="-8"][width="16"]')||tag==='text'&&(node.getAttribute('y')==='523'||node.textContent==='Bₛ'))node.remove();
 }
 for(const iron of svg.querySelectorAll('[fill="#f3eee3"]'))iron.setAttribute('fill',type.startsWith('ipm4')?'#dfe8ef':'#efe6d6');
 if(type.startsWith('ipm4'))for(const lines of svg.querySelectorAll('[stroke="#d4c5a6"]'))lines.setAttribute('stroke','#b3c4d1');
 return svg.innerHTML;
}
function surfaceArt(smooth){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.innerHTML=smooth;
 for(const iron of svg.querySelectorAll('[fill="#efe6d6"]'))iron.setAttribute('fill','#dfe8ef');for(const lines of svg.querySelectorAll('[stroke="#d4c5a6"]'))lines.setAttribute('stroke','#b3c4d1');
 for(const node of [...svg.querySelectorAll('.excitation-current')])node.remove();
 for(const p of [...svg.querySelectorAll('path')])if((p.getAttribute('d')||'').startsWith('M147 -3'))p.parentElement.remove();
 for(const c of svg.querySelectorAll('circle[r="147"]'))c.setAttribute('r','132');
 const ring=(start,end)=>{const p=(r,t)=>[r*Math.cos(t*Math.PI/180),-r*Math.sin(t*Math.PI/180)];return 'M'+p(147,start)+'A147 147 0 0 0 '+p(147,end)+'L'+p(132,end)+'A132 132 0 0 1 '+p(132,start)+'Z';};
 const magnets='<g transform="translate(280 267)" class="surface-magnets"><path d="'+ring(-76,76)+'" fill="#cf5d4c" stroke="#956e59" stroke-width="1"/><path d="'+ring(104,256)+'" fill="#527fb8" stroke="#637d9a" stroke-width="1"/></g>';
 return svg.innerHTML+magnets;
}
function rotorFlux(s){
 if(!s.type.startsWith('ipm4'))return SyncFieldLines(s,'rotor');
 const v=SyncTorqueIPMField;let statMax=0;
 for(let j=0;j<v.N;j++)for(let i=0;i<v.N;i++){const r=Math.hypot(-v.R+2*v.R*i/(v.N-1),-v.R+2*v.R*j/(v.N-1));if(r>150&&r<205)statMax=Math.max(statMax,Math.abs(v.stator[j*v.N+i]));}
 const scale=v.outer/statMax,field=v.field.map((x,i)=>.1*x+(v.statorSign||1)*scale*v.stator[i]);let external=0;
 for(let j=0;j<v.N;j++)for(let i=0;i<v.N;i++){const r=Math.hypot(-v.R+2*v.R*i/(v.N-1),-v.R+2*v.R*j/(v.N-1));if(r>150&&r<205)external=Math.max(external,Math.abs(field[j*v.N+i]));}
 const levels=[];for(let k=1;k<=5;k++)levels.push(-external*k/6,external*k/6);return '<g class="pm-computed-flux">'+rotorContours(field,v.N,v.R,'#a76914',levels).paths+'</g>';
}
function renderRotor(a){
 const equal=nearEqual(a),type=equal?'smooth':a.xd>a.xq?'salient':'ipm4',show=$('rotorField').checked,key=[type,a.e,show].join(':');
 if(key!==cachedKey){
  const s={...SyncPrinciple.create(),type,rotor:0,field:0,excitation:a.e>0,excitationLevel:a.e,damper:false};
  const flux=show&&a.e>0?rotorFlux(s):'';
  let art;
  if(equal){const smooth=rotorArt('smooth',a.e,''),pm=surfaceArt(smooth);art='<defs><clipPath id="torque-left-half"><rect x="40" y="30" width="236" height="480"/></clipPath><clipPath id="torque-right-half"><rect x="284" y="30" width="240" height="480"/></clipPath></defs><g clip-path="url(#torque-left-half)">'+(smooth+'<g transform="translate(280 267)">'+flux+'</g>').replaceAll('lab-','torque-wound-')+'</g><g clip-path="url(#torque-right-half)">'+(pm+'<g transform="translate(280 267)">'+flux+'</g>').replaceAll('lab-','torque-spm-')+'</g>';}
  else art=rotorArt(type,a.e,flux).replaceAll('lab-','torque-example-');
  const qa=type==='ipm4'?Math.PI/4:Math.PI/2,qx=280+181*Math.cos(qa),qy=267-181*Math.sin(qa),ux=Math.cos(qa),uy=-Math.sin(qa);
  const axes='<path d="M280 267H461m-5-3 5 3-5 3M280 267L'+qx+' '+qy+'M'+(qx-5*ux-3*uy)+' '+(qy-5*uy+3*ux)+'L'+qx+' '+qy+'L'+(qx-5*ux+3*uy)+' '+(qy-5*uy-3*ux)+'" fill="none" stroke="#748884" stroke-width="1" stroke-dasharray="4 5"/><foreignObject x="464" y="252" width="30" height="30"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;color:#526b70">'+math('d')+'</div></foreignObject><foreignObject x="'+(qx-15)+'" y="'+(qy-32)+'" width="30" height="30"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;color:#526b70">'+math('q')+'</div></foreignObject>';
  cachedArt='<defs><clipPath id="torque-field-window"><circle cx="280" cy="267" r="218"/></clipPath></defs><g clip-path="url(#torque-field-window)">'+art+'</g>'+axes;cachedKey=key;
 }
 SyncTorqueTransition.update($('torqueRotor'),cachedArt,key,type);
 $('rotorExampleTitle').textContent=equal?'Srovnání rotorů':type==='salient'?'Vyniklé póly':'Vnořené magnety';
 const relation=equal?'L_d\\approx L_q':type==='salient'?'L_d>L_q':'L_q>L_d';if($('rotorRelation').dataset.relation!==relation){$('rotorRelation').innerHTML=math(relation);$('rotorRelation').dataset.relation=relation;}
 window.torqueRotorState={type,equal,relativeDifference:Math.abs(a.xd-a.xq)/Math.max(a.xd,a.xq),field:show,statorVisible:false};
}
let pending=null,pendingType='',timer=0;
window.SyncTorqueRotor=function(a){const type=nearEqual(a)?'smooth':a.xd>a.xq?'salient':'ipm4',current=$('torqueRotor').dataset.kind;if(!current||current===type){clearTimeout(timer);pending=null;pendingType='';renderRotor(a);return;}pending={...a};if(pendingType===type)return;clearTimeout(timer);pendingType=type;timer=setTimeout(()=>{const next=pending;pending=null;pendingType='';if(next)renderRotor(next);},180);};
})();
