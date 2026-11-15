/* Fixed progressive simplex lap winding. Logical lamella k is drawn at segment k-1. */
(function(root){
 'use strict';
 const slots=48,poles=4,pitch=12;
 const coils=Array.from({length:slots},(_,k)=>Object.freeze({k,slot:k,returnSlot:(k+pitch)%slots,fromLamella:k,toLamella:(k+1)%slots,phase:2*Math.PI*k/slots}));
 const winding=Object.freeze({slots,poles,pitch,parallelPaths:poles,coils:Object.freeze(coils)});
 if(typeof module!=='undefined'&&module.exports)module.exports=winding;
 else root.DCArmatureWinding=winding;
})(typeof window!=='undefined'?window:globalThis);
