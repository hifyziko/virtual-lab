/* Fit a stable laboratory surface before mounting the simulation. Never
 * measure the transformed output to determine its next scale. */
(()=>{'use strict';
 const root=document.documentElement;
 function fit(){
  const width=root.clientWidth||innerWidth,height=innerHeight;
  const scale=Math.max(.01,Math.min((width-16)/1360,(height-16)/820));
  root.style.setProperty('--fusion-fit',String(scale));
 }
 fit();addEventListener('resize',fit);document.addEventListener('fullscreenchange',fit);
})();
