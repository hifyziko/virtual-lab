/* Proportions from the installed RMxprt dcm/z_500 example; not a CAD export.
   Dimensions in scene units: 130 corresponds to the 209.55 mm rotor radius.
   The air gap is enlarged to 4 for visibility and the teaching field grid. */
((root)=>{
 const scale=130/209.55,G={rotor:130,shaft:65*scale,outer:380*scale,yoke:329*scale,gap:4,slots:50,commutator:170*scale,poles:4};
 G.interpoleFaceRadius=136;
 G.interpoleHalfWidth=10;
 G.interpoleHalfArc=Math.atan2(G.interpoleHalfWidth,G.interpoleFaceRadius);
 G.interpoleFringeAngle=Math.atan2(G.interpoleFaceRadius-G.rotor,G.interpoleFaceRadius);
 G.poleHalfArc=Math.asin(67/134);
 G.polePitch=2*Math.PI/G.poles;
 G.poleArcRatio=2*G.poleHalfArc/G.polePitch;
 // Homogenized axial conductors are confined to iron in the pole face.
 G.compensationSource=(x,y)=>{const r=Math.hypot(x,y);if(r<=135||r>=141)return 0;for(let k=0;k<G.poles;k++)if(G.insidePole(...G.local(x,y,k)))return k%2?1:-1;return 0;};
 G.coilPitchSlots=Math.floor(G.slots/4);
 G.polePath='M134 -3 A134 134 0 0 1 116.05 -67 L139 -67 L151 -55 H205 V55 H151 L139 67 L116.05 67 A134 134 0 0 1 134 3 Z';
 // Continuous concave shoe at the bore, body behind it; local positive radial x.
 G.polePath='M116.05 -67 A134 134 0 0 1 116.05 67 L143 67 L155 55 H205 V-55 H155 L143 -67 Z';
 G.slotPath='M131 -2.67L126.2 -2.67L125 -4.03L103.2 -2.67L103.2 2.67L125 4.03L126.2 2.67L131 2.67Z';
 G.insidePole=(x,y)=>{const r=Math.hypot(x,y);return (x>=0&&r>=134&&r<=155&&Math.abs(y)<=67)||(x>=143&&x<=205&&Math.abs(y)<=55);};
 G.local=(x,y,k)=>{const a=k*Math.PI/2,c=Math.cos(a),s=Math.sin(a);return [x*c+y*s,-x*s+y*c];};
 G.iron=(x,y)=>{const r=Math.hypot(x,y);if((r<G.rotor&&r>G.shaft)||(r>G.yoke&&r<G.outer))return true;return [0,1,2,3].some(k=>{const a=G.local(x,y,k+.5);return G.insidePole(...G.local(x,y,k))||(a[0]>=G.interpoleFaceRadius&&a[0]<=205&&Math.abs(a[1])<=G.interpoleHalfWidth);});};
 root.DCGeometry=G;if(typeof module!=='undefined')module.exports=G;
})(typeof window==='undefined'?globalThis:window);
