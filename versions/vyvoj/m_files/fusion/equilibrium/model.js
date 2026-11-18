/* Geometry and field evaluation of precomputed free-boundary GS equilibria.
   No equilibrium solve runs in the browser. psi is poloidal flux / (2 pi). */
(function(root){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function sample(a,g,r,z){const x=clamp((r-g.rmin)/(g.rmax-g.rmin)*(g.n-1),0,g.n-1.000001),y=clamp((z-g.zmin)/(g.zmax-g.zmin)*(g.n-1),0,g.n-1.000001),i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,n=g.n;return (a[i*n+j]*(1-u)+a[(i+1)*n+j]*u)*(1-v)+(a[i*n+j+1]*(1-u)+a[(i+1)*n+j+1]*u)*v;}
function profile(a,u){const x=clamp(u,0,1)*(a.length-1),i=Math.min(a.length-2,Math.floor(x));return a[i]+(a[i+1]-a[i])*(x-i);}
function norm(s,psi){return (psi-s.axis[2])/(s.boundary-s.axis[2]);}
function field(s,g,r,z){const hr=1e-6,hz=1e-6,dr=(sample(s.psi,g,r+hr,z)-sample(s.psi,g,r-hr,z))/(2*hr),dz=(sample(s.psi,g,r,z+hz)-sample(s.psi,g,r,z-hz))/(2*hz),u=norm(s,sample(s.psi,g,r,z));return [-dz/r,(s.mask&&sample(s.mask,g,r,z)<.5?s.f.at(-1):profile(s.f,u))/r,dr/r];}
function contours(s,g,u,nullPoint=null){const level=s.axis[2]+u*(s.boundary-s.axis[2]),n=g.n,segments=[],links=new Map();const key=p=>p.map(x=>Math.round(x*1e7)).join(',');
 for(let i=0;i<n-1;i++)for(let j=0;j<n-1;j++){
  const vs=[s.psi[i*n+j],s.psi[(i+1)*n+j],s.psi[(i+1)*n+j+1],s.psi[i*n+j+1]],xy=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],cuts=[];
  for(let e=0;e<4;e++){const k=(e+1)%4;if((vs[e]<level)===(vs[k]<level))continue;const t=(level-vs[e])/(vs[k]-vs[e]);cuts.push({e,p:[g.rmin+(xy[e][0]+t*(xy[k][0]-xy[e][0]))*(g.rmax-g.rmin)/(n-1),g.zmin+(xy[e][1]+t*(xy[k][1]-xy[e][1]))*(g.zmax-g.zmin)/(n-1)]});}
  if(cuts.length===4){const determinant=(vs[0]-level)*(vs[2]-level)-(vs[1]-level)*(vs[3]-level);if(determinant<0)cuts.push(cuts.shift());}
  // At the known saddle all four arms share the null, rather than choosing
  // two disconnected hyperbolae from roundoff in the marching-cell determinant.
  if(nullPoint&&cuts.length===4){const x=(nullPoint[0]-g.rmin)/(g.rmax-g.rmin)*(n-1),y=(nullPoint[1]-g.zmin)/(g.zmax-g.zmin)*(n-1);if(x>i&&x<i+1&&y>j&&y<j+1){for(let k=0;k<4;k+=2){const curve=[cuts[k].p,nullPoint.slice(0,2),cuts[k+1].p],id=segments.length;segments.push(curve);for(const p of [curve[0],curve[2]]){const q=key(p);if(!links.has(q))links.set(q,[]);links.get(q).push(id);}}continue;}}
  for(let k=0;k<cuts.length;k+=2){const id=segments.length,a=cuts[k].p,b=cuts[k+1].p;const dr=(g.rmax-g.rmin)/(n-1),dz=(g.zmax-g.zmin)/(n-1),ax=(a[0]-g.rmin)/dr-i,ay=(a[1]-g.zmin)/dz-j,bx=(b[0]-g.rmin)/dr-i,by=(b[1]-g.zmin)/dz-j,A=vs[0]-level,B=vs[1]-vs[0],C=vs[3]-vs[0],D=vs[2]-vs[1]-vs[3]+vs[0],curve=[a],critical=Math.abs(D)>1e-14&&Math.abs(A*D-B*C)<1e-12*Math.max(1,A*A,B*B,C*C,D*D)?[-C/D,-B/D]:null;for(let k=1;k<4;k++){const f=k/4;let x,y;if(critical&&critical.every(v=>v>=0&&v<=1)){const q=f<=.5?[ax,ay]:critical,t=f<=.5?critical:[bx,by],v=f<=.5?f*2:(f-.5)*2;x=q[0]+(t[0]-q[0])*v;y=q[1]+(t[1]-q[1])*v;}else if(Math.abs(bx-ax)>=Math.abs(by-ay)){x=ax+(bx-ax)*f;const den=C+D*x;y=Math.abs(den)>1e-14?-(A+B*x)/den:ay+(by-ay)*f;}else{y=ay+(by-ay)*f;const den=B+D*y;x=Math.abs(den)>1e-14?-(A+C*y)/den:ax+(bx-ax)*f;}if(Number.isFinite(x+y)&&x>=-1e-6&&x<=1+1e-6&&y>=-1e-6&&y<=1+1e-6)curve.push([g.rmin+(i+x)*dr,g.zmin+(j+y)*dz]);}curve.push(b);segments.push(curve);for(const p of [a,b]){const q=key(p);if(!links.has(q))links.set(q,[]);links.get(q).push(id);}}
 }
 const seen=new Set(),out=[];
 function walk(id,point){const line=[point];while(!seen.has(id)){seen.add(id);const seg=segments[id],forward=key(seg[0])===key(point),curve=forward?seg:seg.slice().reverse(),p=curve.at(-1);line.push(...curve.slice(1));point=p;const next=links.get(key(p)).find(x=>!seen.has(x));if(next===undefined)break;id=next;}return line;}
 for(const [k,ids]of links)if(ids.length===1&&!seen.has(ids[0])){const seg=segments[ids[0]],p=key(seg[0])===k?seg[0]:seg.at(-1);out.push(walk(ids[0],p));}
 for(let id=0;id<segments.length;id++)if(!seen.has(id))out.push(walk(id,segments[id][0]));
 return out.filter(p=>p.length>4);
}
function contains(poly,p){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function core(s,g,u){return contours(s,g,u).find(p=>Math.hypot(p[0][0]-p.at(-1)[0],p[0][1]-p.at(-1)[1])<1e-5&&contains(p,s.axis))||[];}
// Drawing-only C1 reconstruction of the stored flux. The equilibrium, field
// evaluation and particle/field-line integrator retain their original data.
function smoothSample(a,g,r,z){const gx=(r-g.rmin)/(g.rmax-g.rmin)*(g.n-1),gz=(z-g.zmin)/(g.zmax-g.zmin)*(g.n-1);if(gx<1||gx>g.n-2||gz<1||gz>g.n-2)return sample(a,g,r,z);const x=clamp((r-g.rmin)/(g.rmax-g.rmin)*(g.n-1),1,g.n-2.000001),y=clamp((z-g.zmin)/(g.zmax-g.zmin)*(g.n-1),1,g.n-2.000001),i=Math.floor(x),j=Math.floor(y);
 const cubic=(a,b,c,d,t)=>b+.5*t*(c-a+t*(2*a-5*b+4*c-d+t*(3*(b-c)+d-a)));
 const rows=[];for(let k=-1;k<=2;k++)rows.push(cubic(...[-1,0,1,2].map(l=>a[(i+k)*g.n+j+l]),y-j));return cubic(...rows,x-i);
}
function separatrix(s,g){const x=s.xpoints[0],dr=(g.rmax-g.rmin)/(g.n-1),dz=(g.zmax-g.zmin)/(g.n-1),h=1e-4,f=(r,z)=>smoothSample(s.psi,g,r,z),delta=f(...x)-s.boundary,gr=(f(x[0]+h,x[1])-f(x[0]-h,x[1]))/(2*h),gz=(f(x[0],x[1]+h)-f(x[0],x[1]-h))/(2*h);
 // Anchor value and gradient to the exported solver null. The compact C1
 // correction vanishes two source cells away; no new GS solve is performed.
 const value=(r,z)=>{const q=((r-x[0])/(2*dr))**2+((z-x[1])/(2*dz))**2,w=q<1?(1-q)**3:0;return f(r,z)-w*(delta+gr*(r-x[0])+gz*(z-x[1]));};
 const n=4*(g.n-1)+1,rr=dr/4,zz=dz/4,rmin=x[0]-(Math.floor((x[0]-g.rmin)/rr)+.5)*rr,zmin=x[1]-(Math.floor((x[1]-g.zmin)/zz)+.5)*zz,grid={n,rmin,rmax:rmin+rr*(n-1),zmin,zmax:zmin+zz*(n-1)},psi=new Float64Array(n*n);
 for(let i=0;i<n;i++)for(let j=0;j<n;j++)psi[i*n+j]=value(rmin+i*rr,zmin+j*zz);
 return contours({...s,psi},grid,1,x);
}
function resample(line,count=240){if(line.length<2)return [];const d=[0];for(let i=1;i<line.length;i++)d.push(d.at(-1)+Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]));let k=1;return Array.from({length:count},(_,i)=>{const t=d.at(-1)*i/(count-1);while(k<line.length-1&&d[k]<t)k++;const f=(t-d[k-1])/(d[k]-d[k-1]||1);return line[k-1].map((v,j)=>v+(line[k][j]-v)*f);});}
function fieldline(s,g,line,phase=0){line=resample(line,900);if(!line.length)return [];let phi=phase;const out=[];for(let i=0;i<line.length;i++){const [r,z]=line[i];if(!i){out.push([r*Math.cos(phi),r*Math.sin(phi),z,phi]);continue;}const [r0,z0]=line[i-1],b=field(s,g,(r+r0)/2,(z+z0)/2),bp=Math.hypot(b[0],b[2]);
 // At a separatrix a field line approaches the null asymptotically; never
 // jump across it or cap dphi (that would change the direction of B).
 if(bp<.002||Math.abs(norm(s,sample(s.psi,g,r,z))-1)<.001&&s.xpoints.some(p=>Math.hypot(p[0]-r,p[1]-z)<Math.max(g.rmax-g.rmin,g.zmax-g.zmin)/(g.n-1)*.6))break;
 const sign=(r-r0)*b[0]+(z-z0)*b[2]>=0?1:-1,dphi=sign*Math.hypot(r-r0,z-z0)*b[1]/(((r+r0)/2)*bp),steps=Math.max(1,Math.ceil(Math.abs(dphi)/.04));
 for(let j=1;j<=steps;j++){const f=j/steps,a=phi+dphi*f,rr=r0+(r-r0)*f,zz=z0+(z-z0)*f;if(Math.abs(a-phase)>12*Math.PI)return out;out.push([rr*Math.cos(a),rr*Math.sin(a),zz,a]);}phi+=dphi;}return out;}
function colour(t){const stops=[[0,0,255],[0,180,255],[0,220,100],[255,255,0],[255,128,0],[255,0,0]],x=clamp(t,0,1)*5,i=Math.min(4,Math.floor(x));return stops[i].map((v,k)=>Math.round(v+(stops[i+1][k]-v)*(x-i)));}
function quantity(s,g,r,z,kind){const u=norm(s,sample(s.psi,g,r,z)),inside=u>=0&&u<=1&&sample(s.mask,g,r,z)>.5,p=inside?profile(s.p,u):0,b=field(s,g,r,z),b2=b.reduce((n,v)=>n+v*v,0),mu=4e-7*Math.PI;return {p, b:Math.sqrt(b2),bp:Math.hypot(b[0],b[2]),bt:Math.abs(b[1]),j:inside?sample(s.j,g,r,z):0,pm:b2/(2*mu),beta:100*2*mu*p/b2,flux:u}[kind];}
function intersection(a,b,c,d){const v=[b[0]-a[0],b[1]-a[1]],w=[d[0]-c[0],d[1]-c[1]],det=v[0]*w[1]-v[1]*w[0];if(Math.abs(det)<1e-12)return null;const t=((c[0]-a[0])*w[1]-(c[1]-a[1])*w[0])/det,q=((c[0]-a[0])*v[1]-(c[1]-a[1])*v[0])/det;return t>=0&&t<=1&&q>=0&&q<=1?{t,p:a.map((v,k)=>v+t*(b[k]-v))}:null;}
function targetSegments(machine){return machine.targetProfiles?machine.targetProfiles.flatMap(line=>line.slice(1).map((p,i)=>[line[i],p])):machine.targets;}
function baffleSegments(machine){return (machine.baffles||[]).flatMap(line=>line.slice(1).map((p,i)=>[line[i],p]));}
function firstWallSegments(machine){return (machine.firstWall||[]).slice(1).map((p,i)=>[machine.firstWall[i],p]);}
function materialKind(p,machine){if(!p)return null;const on=segments=>segments.some(([a,b])=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=dx*dx+dz*dz,t=((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L;return t>=-1e-7&&t<=1+1e-7&&Math.abs((p[0]-a[0])*dz-(p[1]-a[1])*dx)<1e-7*Math.sqrt(L);});for(const [kind,segments]of [['target',targetSegments(machine)],['baffle',baffleSegments(machine)],['firstWall',firstWallSegments(machine)],['dome',(machine.dome||[]).slice(1).map((p,i)=>[machine.dome[i],p])],['vessel',machine.wall.map((p,i)=>[p,machine.wall[(i+1)%machine.wall.length]])]])if(on(segments))return kind;return null;}
function materialContact(line,machine){const segments=[...targetSegments(machine),...baffleSegments(machine),...firstWallSegments(machine),...(machine.dome||[]).slice(1).map((p,i)=>[machine.dome[i],p])];for(let i=1;i<line.length;i++)for(const [a,b]of segments)if(intersection(line[i-1],line[i],a,b))return true;return false;}
function blanketModules(machine){if(!machine.firstWall)return [];const rows=resample(machine.firstWall,17),out=[];for(let row=1;row<rows.length;row++){const a=rows[row-1],b=rows[row],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),normal=[-dz/L,dx/L],q=a.map((v,j)=>v+(b[j]-v)*.025),r=a.map((v,j)=>v+(b[j]-v)*.975),count=Math.max(18,Math.round(2*Math.PI*(a[0]+b[0])/2/1.5));for(let k=0;k<count;k++){const angle=(k+.5)*2*Math.PI/count,z=(a[1]+b[1])/2;const portAngle=Math.abs(Math.atan2(Math.sin(angle*9),Math.cos(angle*9)))/9;if(a[0]>7.5&&b[0]>7.5&&Math.min(a[1],b[1])<.65&&Math.max(a[1],b[1])>-.65&&portAngle<.15)continue;out.push({row:row-1,column:k,a:k*2*Math.PI/count+.0015,b:(k+1)*2*Math.PI/count-.0015,q,r,normal});}}return out;}
function divertorBranch(line,machine){if(line.length<3)return [];const peak=line.reduce((best,p,i)=>p[1]>line[best][1]?i:best,0),hits=[];for(let i=1;i<line.length;i++)for(const [a,b]of [...targetSegments(machine),...baffleSegments(machine),...firstWallSegments(machine),...(machine.dome||[]).slice(1).map((p,i)=>[machine.dome[i],p])]){const h=intersection(line[i-1],line[i],a,b);if(h)hits.push({at:i-1+h.t,p:h.p});}const wall=[...machine.wall,machine.wall[0]],bounds=hits.slice();for(let i=1;i<line.length;i++)for(let j=1;j<wall.length;j++){const h=intersection(line[i-1],line[i],wall[j-1],wall[j]);if(h)bounds.push({at:i-1+h.t,p:h.p});}const a=bounds.filter(h=>h.at<peak).sort((a,b)=>b.at-a.at)[0],b=bounds.filter(h=>h.at>peak).sort((a,b)=>a.at-b.at)[0];return [a?a.p:line[0],...line.slice(a?Math.ceil(a.at):1,b?Math.floor(b.at)+1:line.length-1),b?b.p:line.at(-1)];}
const api={sample,profile,norm,field,contours,core,separatrix,resample,fieldline,colour,contains,quantity,intersection,targetSegments,baffleSegments,firstWallSegments,materialKind,materialContact,blanketModules,divertorBranch};if(typeof module!=='undefined')module.exports=api;else root.TokamakModel=api;
})(typeof window==='undefined'?globalThis:window);
