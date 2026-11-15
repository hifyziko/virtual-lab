/* RMS phase phasors, passive (motor) current convention; beta = arg(Uib) - arg(Ua), generator positive. Three-phase per-unit bases. */
(function(root){
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],mul=(a,k)=>a.map(x=>x*k),j=a=>[-a[1],a[0]];
function solve({beta=-25,e=1.15,xd=1.2,xq=.75,r=0,xsigma=.15,type='salient'}={}){
 if(type==='smooth')xq=xd;
 const b=-beta*Math.PI/180,q=[Math.cos(b),-Math.sin(b)],d=mul(j(q),-1),den=r*r+xd*xq;
 const iq=(r*(Math.cos(b)-e)+xd*Math.sin(b))/den,id=-(r*Math.sin(b)-xq*(Math.cos(b)-e))/den;
 const Iq=mul(q,iq),Id=mul(d,id),I=add(Iq,Id),E=mul(q,e),RI=mul(I,r),XqI=mul(j(I),xq),extra=mul(j(Id),xd-xq);
 const XsigmaI=mul(j(I),xsigma),XaqI=mul(j(I),xq-xsigma),Ui=add([1,0],mul(add(RI,XsigmaI),-1));
 const end=add(add(add(E,RI),XqI),extra),amp=Math.hypot(...I),P=I[0],Q=-I[1],loss=r*amp*amp;
 const internalBeta=((beta-Math.atan2(Ui[1],Ui[0])*180/Math.PI)+540)%360-180;
 return {internalBeta,xsigma,XsigmaI,XaqI,Ui,beta,e,xd,xq,r,type,q,d,iq,id,Iq,Id,I,E,RI,XqI,extra,end,amp,P,Q,loss,Pem:P-loss,pf:amp>1e-9?Math.abs(P)/amp:null};
}
// Restoring stiffness: -dPem/d beta, with generator-positive angle.
function slope(s){const h=.001;return -(solve({...s,beta:s.beta+h}).Pem-solve({...s,beta:s.beta-h}).Pem)/(2*h*Math.PI/180)}
function atPower(s,target){
 const roots=[];let a=-179,fa=solve({...s,beta:a}).P-target;
 for(let b=a+.5;b<=179;b+=.5){const fb=solve({...s,beta:b}).P-target;if(fa*fb<=0){let lo=a,hi=b;for(let n=0;n<36;n++){const mid=(lo+hi)/2;if((solve({...s,beta:lo}).P-target)*(solve({...s,beta:mid}).P-target)<=0)hi=mid;else lo=mid;}const beta=(lo+hi)/2;if(slope({...s,beta})>1e-6)roots.push(beta);}a=b;fa=fb;}
 return roots.sort((a,b)=>Math.abs(a-s.beta)-Math.abs(b-s.beta))[0]??null;
}
function fromLoad(s,p,phi){
 const xq=s.type==='smooth'?s.xd:s.xq,Q=p*Math.tan(phi*Math.PI/180),I=[-p,Q];
 const w=add(add([1,0],mul(I,-s.r)),mul(j(I),-xq)),angle=Math.atan2(w[1],w[0]),d=[-Math.sin(angle),Math.cos(angle)];
 let e=Math.hypot(...w)+(s.xd-xq)*(I[0]*d[0]+I[1]*d[1]),beta=angle*180/Math.PI;
 if(e<0){e=-e;beta+=180}beta=(beta+540)%360-180;
 return solve({...s,e,beta});
}
function atInternalAngle(s,beta){
 const xq=s.type==='smooth'?s.xd:s.xq,ad=s.xd-s.xsigma,aq=xq-s.xsigma;if(ad<=0||aq<=0)return null;
 const b=-beta*Math.PI/180,q=[Math.cos(b),-Math.sin(b)],d=j(q),A=add(mul(q,Math.sin(b)/aq),mul(d,-Math.cos(b)/ad)),B=mul(d,s.e/ad),z=v=>add(mul(v,s.r),mul(j(v),s.xsigma)),K=add([1,0],z(A)),L=z(B),aa=K[0]**2+K[1]**2,bb=2*(K[0]*L[0]+K[1]*L[1]),cc=L[0]**2+L[1]**2-1,disc=bb*bb-4*aa*cc;
 if(disc<0)return null;const v=(-bb+Math.sqrt(disc))/(2*aa);if(v<=1e-9)return null;
 const u=add(mul(K,v),L),delta=beta-Math.atan2(u[1],u[0])*180/Math.PI;return solve({...s,beta:(delta+540)%360-180});
}
const api={atInternalAngle,solve,slope,atPower,fromLoad,add,mul,j};if(typeof module==='object')module.exports=api;else root.SyncSchema=api;
})(typeof window==='object'?window:globalThis);
