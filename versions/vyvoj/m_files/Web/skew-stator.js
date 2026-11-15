/* Shared circumferential coordinate for the unwrapped bore and its spatial wave. */
window.SkewStator={render({Q,p,a,nu,t,k,compact=false,mechanism=null}){
 const left=70,right=610,top=170,bottom=390,pitch=90,mid=(left+right)/2;
 const hue=z=>`hsl(${190+150*z},55%,43%)`;
 const phaseScale=nu*2*Math.PI*p/Q;
 const value=(x,z)=>Math.cos(phaseScale*((x-mid)/pitch-a*(z-.5)));
 const wave=(z,base,amp,coefficient=1)=>{let d='';const N=Math.max(720,Math.ceil(nu*p/Q*6*30));for(let i=0;i<=N;i++){const x=left+(right-left)*i/N,y=base-amp*coefficient*(z===null?Math.cos(phaseScale*(x-mid)/pitch):value(x,z));d+=(i?' L':'M')+x.toFixed(2)+','+y.toFixed(2);}return d;};
 let s=`<defs><linearGradient id="sk-steel" x1="0" x2="1"><stop stop-color="#b7c6cb"/><stop offset=".3" stop-color="#f4f7f7"/><stop offset=".7" stop-color="#dce5e7"/><stop offset="1" stop-color="#9baeb5"/></linearGradient><linearGradient id="sk-slot" x1="0" x2="1"><stop stop-color="#182f3a"/><stop offset=".5" stop-color="#405c68"/><stop offset="1" stop-color="#132b36"/></linearGradient><clipPath id="sk-bore"><rect x="${left}" y="${top}" width="540" height="220" rx="4"/></clipPath></defs>`;
 // End view: laminated stator annulus, slot mouths, winding sides, empty bore.
 s+='<g transform="translate(0 -12)"><circle cx="86" cy="70" r="54" fill="#768d98"/><circle cx="86" cy="70" r="49" fill="#dce5e8" stroke="#a8bbc2"/><circle cx="86" cy="70" r="32" fill="#fff"/>';
 for(let j=0;j<Q;j++){const deg=j*360/Q;s+=`<g transform="rotate(${deg} 86 70)"><path d="M83,38 V27 Q86,23 89,27 V38" fill="#314d5a"/><path d="M84,30 V35 H88 V30" fill="#dba15b"/></g>`;}
 s+='<circle cx="86" cy="70" r="24" fill="none" stroke="#b7c9ce" stroke-dasharray="4 4"/></g><text x="86" y="133" text-anchor="middle">Čelní pohled</text><path d="M151,70 H205" stroke="#758f98" stroke-width="2"/><path d="M214,70 l-12,-6 v12 Z" fill="#758f98"/><text x="232" y="53" font-weight="650">Vnitřní povrch statoru rozvineme do roviny</text><text x="232" y="79" class="small">Díváme se z prostoru rotoru na zuby a ústí drážek.</text><text x="232" y="103" class="small">Výřez šesti drážkových roztečí · hloubka je stylizovaná.</text>';
 // Shallow extrusion makes it a toothed steel stack rather than lines on paper.
 s+=`<path d="M${left},${bottom} H${right} l10,13 H${left+10} Z" fill="#9aadb4"/><path d="M${right},${top} l10,13 V${bottom+13} l-10,-13 Z" fill="#718d99"/><rect x="${left}" y="${top}" width="540" height="220" fill="url(#sk-steel)" stroke="#9bafb6"/><g clip-path="url(#sk-bore)">`;
 for(let j=-2;j<=8;j++){const x=left+j*pitch+pitch/2,dx=a*pitch/2;
  s+=`<path class="sk-slot-shape" d="M${x-dx-12},${top} H${x-dx+12} L${x+dx+12},${bottom} H${x+dx-12} Z" fill="url(#sk-slot)"/><path d="M${x-dx-12},${top} L${x+dx-12},${bottom}" stroke="#6b838d" stroke-width="3"/><path d="M${x-dx+12},${top} L${x+dx+12},${bottom}" stroke="#f9ffff" stroke-width="2"/>`;
 }
 for(let j=1;j<16;j++){const y=top+j*(bottom-top)/16;s+=`<path d="M${left},${y} H${right}" stroke="#476674" opacity=".10"/>`;}
 const planeY=top+t*(bottom-top),shift=(t-.5)*a*pitch;
 s+=`<rect x="${left}" y="${planeY-28}" width="540" height="56" fill="white" opacity=".82"/><path d="M${left},${planeY} H${right}" stroke="${hue(t)}" stroke-dasharray="5 5"/><path id="sk-attached-wave" d="${wave(t,planeY,24)}" stroke="${hue(t)}" stroke-width="3" fill="none"/><path d="M${mid+45-a*pitch/2},${top} L${mid+45+a*pitch/2},${bottom}" stroke="#efad35" stroke-width="3" stroke-dasharray="5 4"/>`;
 s+=`<circle cx="${mid+45+shift}" cy="${planeY}" r="5" fill="#efad35" stroke="white" stroke-width="2"/></g>`;
 s+=`<path d="M${left},${top} H${right}" stroke="${hue(0)}" stroke-width="3"/><path d="M${left},${bottom} H${right}" stroke="${hue(1)}" stroke-width="3"/><text x="55" y="${top+4}" text-anchor="end">A</text><text x="55" y="${bottom+4}" text-anchor="end">C</text><path d="M35,${top+12} V${bottom-12}" stroke="#6d8996"/><path d="M35,${bottom-4} l-5,-10 h10 Z" fill="#6d8996"/><text x="18" y="280" transform="rotate(-90 18 280)" text-anchor="middle">Axiální směr z</text>`;
 const toothX=left+4*pitch-a*pitch/2,slotX=left+2.5*pitch-a*pitch/2;
 s+=`<path d="M${slotX},${top+18} L${left+2.5*pitch},140" stroke="#314d5a"/><text x="${left+2.5*pitch}" y="133" text-anchor="middle" class="small">Drážka</text><path d="M${toothX},${top+18} L${left+4*pitch},153" stroke="#314d5a"/><text x="${left+4*pitch}" y="133" text-anchor="middle" class="small">Zub</text>`;
 s+='<text x="340" y="443" text-anchor="middle" font-weight="650">Stejná obvodová souřadnice · různé axiální řezy</text>';
 for(let j=0;j<=6;j++){const x=left+j*pitch;s+=`<path d="M${x},490 V625" stroke="#e0e8ea"/><text x="${x}" y="652" text-anchor="middle" class="small">${j}τd</text>`;}
 s+=`<path d="M${left},560 H${right}" stroke="#aabdc4"/><text x="53" y="508" text-anchor="end" class="small">+1</text><text x="53" y="619" text-anchor="end" class="small">−1</text>`;
 for(const z of [0,1,t])s+=`<path class="sk-slice-wave" data-z="${z}" d="${wave(z,560,55)}" fill="none" stroke="${hue(z)}" stroke-width="${z===t?2.8:1.8}" ${z===t?'':'stroke-dasharray="7 5"'} opacity="${z===t?1:.7}"/>`;
 s+=`<path id="sk-integrated-wave" d="${wave(null,560,55,k)}" stroke="#163e32" stroke-width="3.5" fill="none"/><text x="340" y="697" text-anchor="middle">Obvodový směr · jedna rozteč τd = 360° / Q mechanických</text>`;
 if(mechanism){
  const {blend,probe,pair}=mechanism,N=12,total=nu*2*Math.PI*p*a/Q,cell=LearningModels.sinc(total/(2*N));
  s=s.replace(/<path id="sk-attached-wave"[^>]*\/>/,'').replace(/<path class="sk-slice-wave"[^>]*\/>/g,'').replace(/<path id="sk-integrated-wave"[^>]*\/>/,'');
  s=s.replace(/<rect x="70" y="[^"]*" width="540" height="56" fill="white" opacity=".82"\/>/,'');
  s=s.replace(/<text x="340" y="443"[^>]*>[^<]*<\/text>/,'');
  const probeX=left+(right-left)*probe;
  let overlay=`<path d="M${probeX},${top} V625" stroke="#91a5af" stroke-dasharray="4 5" opacity=".7"/>`;
  const renderSection=j=>{const z=j===0?0:j===N/2?.5:(j+.5)/N,originY=top+z*(bottom-top),base=originY*(1-blend)+560*blend,chosen=j===0||j===N/2,c=chosen?(j===0?'#007e6c':'#c34d69'):`hsl(${190+150*z},45%,55%)`;
   const amplitude=22+33*blend,d=wave(z,base,amplitude,chosen?1:cell); // Same six-slot coordinate as the teeth.
   const y=base-amplitude*(chosen?1:cell)*value(probeX,z);
   return `<path class="sk-demo-section" data-section="${j}" data-origin-y="${originY}" data-baseline="${base}" d="${d}" stroke="${c}" stroke-width="${pair&&chosen?3.6:1.3}" opacity="${pair&&!chosen?.16:chosen?1:.5}" fill="none"/>`+(chosen&&pair?`<path d="M${left},${originY} h-9" stroke="${c}" stroke-width="3"/><circle cx="${probeX}" cy="${y}" r="5" fill="${c}" stroke="white" stroke-width="1.5"/>`:'');};
  for(let j=0;j<N;j++)if(j!==0&&j!==N/2)overlay+=renderSection(j);
  overlay+=renderSection(0)+renderSection(N/2);
  overlay+=`<path d="${wave(null,560,55,1)}" fill="none" stroke="#9eada6" stroke-width="2" stroke-dasharray="6 5"/><path id="sk-demo-result" data-amplitude="${Math.abs(k)}" d="${wave(null,560,55,k)}" fill="none" stroke="#008267" stroke-width="4"/>`;
  s+=overlay;
 }
 if(compact){
  s=s.replace('Stator · čelní pohled','Stator').replace('Vnitřní povrch statoru rozvineme do roviny','Rozvinutý stator').replace('Díváme se z prostoru rotoru na zuby a ústí drážek.','Pohled z prostoru rotoru').replace('Výřez šesti drážkových roztečí · hloubka je stylizovaná.','Zuby a ústí drážek').replace('Stejná obvodová souřadnice · různé axiální řezy','Harmonické v jednotlivých řezech').replace('Obvodový směr · jedna rozteč τd = 360° / Q mechanických','Obvod v drážkových roztečích').replace('Axiální směr z','Délka z');
 }
 return s;
}};
