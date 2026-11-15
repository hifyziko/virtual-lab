/* Perspective framing shared by the particle catalog; bounds hold at every rotation. */
(function(root){
 function radius(atoms,cloud){return Math.max(...atoms.map(a=>Math.hypot(a[0],a[1],a[2])+(a[3]<0?.65:1.25)),cloud||0);}
 function fit(width,height,bound,maxZoom=1.02){
  const available=Math.max(1,Math.min(width-40,height-144)),q=available/(2*1.72*Math.max(1,height));
  const cameraZ=bound*Math.sqrt(1+1/(q*q));return Math.min(maxZoom,6.2/cameraZ);
 }
 const api={radius,fit};root.HiFyzikoParticleFraming=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
