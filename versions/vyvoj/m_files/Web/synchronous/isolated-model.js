(function(root){'use strict';
function solve(s, fraction=s.load, phi=s.phi){
 const angle=phi*Math.PI/180,c=Math.cos(angle),sn=Math.sin(angle),X=s.x*s.speed,E=s.e*s.speed,r=s.r,Ik=E/Math.hypot(r,X),I=fraction*Ik,A=r*c+X*sn,B=X*c-r*sn;
 const U=Math.max(0,Math.sqrt(Math.max(0,E*E-B*B*I*I))-A*I),Ig=[I*c,-I*sn],emf=[U+r*Ig[0]-X*Ig[1],r*Ig[1]+X*Ig[0]],xs=.15*s.speed,Ui=[U+r*Ig[0]-xs*Ig[1],r*Ig[1]+xs*Ig[0]];
 return {U,I,Ig,E:emf,Ui,Eabs:E,Ik,X,r,phi,P:U*Ig[0],Q:-U*Ig[1],loss:r*I*I,f:50*s.speed,Rload:I>1e-10?U/I*c:null,Xload:I>1e-10?U/I*sn:null};
}
const api={solve};if(typeof module==='object')module.exports=api;else root.SyncIsolated=api;
})(typeof window==='object'?window:globalThis);
