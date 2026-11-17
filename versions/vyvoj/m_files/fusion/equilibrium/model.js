/* Geometry and field evaluation of precomputed free-boundary GS equilibria.
   No equilibrium solve runs in the browser. psi is poloidal flux / (2 pi). */
(function(root){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function sample(a,g,r,z){const x=clamp((r-g.rmin)/(g.rmax-g.rmin)*(g.n-1),0,g.n-1.000001),y=clamp((z-g.zmin)/(g.zmax-g.zmin)*(g.n-1),0,g.n-1.000001),i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,n=g.n;return (a[i*n+j]*(1-u)+a[(i+1)*n+j]*u)*(1-v)+(a[i*n+j+1]*(1-u)+a[(i+1)*n+j+1]*u)*v;}
function profile(a,u){const x=clamp(u,0,1)*(a.length-1),i=Math.min(a.length-2,Math.floor(x));return a[i]+(a[i+1]-a[i])*(x-i);}
function norm(s,psi){return (psi-s.axis[2])/(s.boundary-s.axis[2]);}
function field(s,g,r,z){const hr=(g.rmax-g.rmin)/(g.n-1)*.3,hz=(g.zmax-g.zmin)/(g.n-1)*.3,dr=(sample(s.psi,g,r+hr,z)-sample(s.psi,g,r-hr,z))/(2*hr),dz=(sample(s.psi,g,r,z+hz)-sample(s.psi,g,r,z-hz))/(2*hz),u=norm(s,sample(s.psi,g,r,z));return [-dz/r,(s.mask&&sample(s.mask,g,r,z)<.5?s.f.at(-1):profile(s.f,u))/r,dr/r];}
function contours(s,g,u){const level=s.axis[2]+u*(s.boundary-s.axis[2]),n=g.n,segments=[],links=new Map();const key=p=>p.map(x=>Math.round(x*1e7)).join(',');
 for(let i=0;i<n-1;i++)for(let j=0;j<n-1;j++){
  const vs=[s.psi[i*n+j],s.psi[(i+1)*n+j],s.psi[(i+1)*n+j+1],s.psi[i*n+j+1]],xy=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],cuts=[];
  for(let e=0;e<4;e++){const k=(e+1)%4;if((vs[e]<level)===(vs[k]<level))continue;const t=(level-vs[e])/(vs[k]-vs[e]);cuts.push({e,p:[g.rmin+(xy[e][0]+t*(xy[k][0]-xy[e][0]))*(g.rmax-g.rmin)/(n-1),g.zmin+(xy[e][1]+t*(xy[k][1]-xy[e][1]))*(g.zmax-g.zmin)/(n-1)]});}
  if(cuts.length===4){const center=(vs[0]+vs[1]+vs[2]+vs[3])/4; if((center<level)===(vs[0]<level))cuts.push(cuts.shift());}
  for(let k=0;k<cuts.length;k+=2){const id=segments.length,a=cuts[k].p,b=cuts[k+1].p;segments.push([a,b]);for(const p of [a,b]){const q=key(p);if(!links.has(q))links.set(q,[]);links.get(q).push(id);}}
 }
 const seen=new Set(),out=[];
 function walk(id,point){const line=[point];while(!seen.has(id)){seen.add(id);const seg=segments[id],p=key(seg[0])===key(point)?seg[1]:seg[0];line.push(p);point=p;const next=links.get(key(p)).find(x=>!seen.has(x));if(next===undefined)break;id=next;}return line;}
 for(const [k,ids]of links)if(ids.length===1&&!seen.has(ids[0])){const seg=segments[ids[0]],p=key(seg[0])===k?seg[0]:seg[1];out.push(walk(ids[0],p));}
 for(let id=0;id<segments.length;id++)if(!seen.has(id))out.push(walk(id,segments[id][0]));
 return out.filter(p=>p.length>4);
}
function contains(poly,p){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function core(s,g,u){return contours(s,g,u).find(p=>Math.hypot(p[0][0]-p.at(-1)[0],p[0][1]-p.at(-1)[1])<1e-5&&contains(p,s.axis))||[];}
function resample(line,count=240){if(line.length<2)return [];const d=[0];for(let i=1;i<line.length;i++)d.push(d.at(-1)+Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]));let k=1;return Array.from({length:count},(_,i)=>{const t=d.at(-1)*i/(count-1);while(k<line.length-1&&d[k]<t)k++;const f=(t-d[k-1])/(d[k]-d[k-1]||1);return line[k-1].map((v,j)=>v+(line[k][j]-v)*f);});}
function fieldline(s,g,line,phase=0){line=resample(line,900);if(!line.length)return [];let phi=phase;const out=[];for(let i=0;i<line.length;i++){const [r,z]=line[i];if(!i){out.push([r*Math.cos(phi),r*Math.sin(phi),z,phi]);continue;}const [r0,z0]=line[i-1],b=field(s,g,(r+r0)/2,(z+z0)/2),bp=Math.hypot(b[0],b[2]);
 // At a separatrix a field line approaches the null asymptotically; never
 // jump across it or cap dphi (that would change the direction of B).
 if(bp<.002)break;
 const sign=(r-r0)*b[0]+(z-z0)*b[2]>=0?1:-1,dphi=sign*Math.hypot(r-r0,z-z0)*b[1]/(((r+r0)/2)*bp),steps=Math.max(1,Math.ceil(Math.abs(dphi)/.04));
 for(let j=1;j<=steps;j++){const f=j/steps,a=phi+dphi*f,rr=r0+(r-r0)*f,zz=z0+(z-z0)*f;if(Math.abs(a-phase)>12*Math.PI)return out;out.push([rr*Math.cos(a),rr*Math.sin(a),zz,a]);}phi+=dphi;}return out;}
function colour(t){const stops=[[0,0,255],[0,180,255],[0,220,100],[255,255,0],[255,128,0],[255,0,0]],x=clamp(t,0,1)*5,i=Math.min(4,Math.floor(x));return stops[i].map((v,k)=>Math.round(v+(stops[i+1][k]-v)*(x-i)));}
const api={sample,profile,norm,field,contours,core,resample,fieldline,colour,contains};if(typeof module!=='undefined')module.exports=api;else root.TokamakModel=api;
})(typeof window==='undefined'?globalThis:window);
