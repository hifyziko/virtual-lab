/* Shared, testable phasor construction. All vectors are RMS complex values. */
(function(root){
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],scale=(a,s)=>a.map(x=>x*s),j=a=>[-a[1],a[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
function build(a,{merged=false,twoReaction=false}={}){
 const angle=0; // Ua = 1 + j0 is the display reference; internal beta is unchanged.
 const rotate=v=>[v[0]*Math.cos(angle)+v[1]*Math.sin(angle),v[1]*Math.cos(angle)-v[0]*Math.sin(angle)];
 const v={};for(const k of ['q','d','I','Iq','Id','E','RI','extra','Ui','XsigmaI','XaqI'])v[k]=rotate(a[k]);
 v.U=rotate([1,0]);v.Ig=scale(v.I,-1);
 v.Ik=scale(v.d,a.e/(a.xd-a.xsigma));v.Imu=add(v.I,v.Ik);
 const reaction=i=>add(scale(j(scale(v.d,dot(i,v.d))),a.xd-a.xsigma),scale(j(scale(v.q,dot(i,v.q))),a.xq-a.xsigma));
 const chain=[{name:'saliency',term:v.extra,tex:'j(X_{ad}-X_{aq})\\overline I_d',color:'d'},
 {name:'reaction',term:v.XaqI,tex:a.type==='smooth'?'jX_a\\overline I_a':'jX_{aq}\\overline I_a',color:'x'},
 {name:'leakage',term:v.XsigmaI,tex:'jX_{a\\sigma}\\overline I_a',color:'leak'},
 {name:'resistance',term:v.RI,tex:'R_a\\overline I_a',color:'r'}];
 if(merged&&a.r===0){chain[1]={name:'synchronous',term:add(v.XaqI,v.XsigmaI),tex:a.type==='smooth'?'jX_s\\overline I_a':'jX_q\\overline I_a',color:'x'};chain[2]={...chain[2],term:[0,0]};}
 if(twoReaction&&a.type==='salient'){
  chain[0]={name:'direct',term:scale(j(v.Id),merged?a.xd:a.xd-a.xsigma),tex:merged?'jX_d\\overline I_d':'jX_{ad}\\overline I_d',color:'d'};
  chain[1]={name:'quadrature',term:scale(j(v.Iq),merged?a.xq:a.xq-a.xsigma),tex:merged?'jX_q\\overline I_q':'jX_{aq}\\overline I_q',color:'x'};
  if(merged)chain[2]={...chain[2],term:[0,0]};
 }
 let tip=v.E;for(const item of chain){item.start=tip;item.end=add(tip,item.term);tip=item.end;}
 return {v,chain,angle,beta:a.internalBeta*Math.PI/180,uiDefined:Math.hypot(...a.Ui)>1e-10,excitationDefined:a.e>1e-10,
  magnetizingVoltage:reaction(v.Imu),excitationVoltage:reaction(v.Ik)};
}
const api={build};if(typeof module==='object')module.exports=api;else root.SyncSchemaGeometry=api;
})(typeof window==='object'?window:globalThis);
