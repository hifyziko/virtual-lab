(()=>{'use strict';const basis=window.AMFieldBasis,N=basis.N,R=basis.R,cache=new Map();
function field(a,delta,source){const key=[Math.round(delta*180),a.current,a.phase,source].join(':');if(cache.has(key))return cache.get(key);const f=basis.fields,grid=new Float32Array(N*N),s=source!=='rotor',r=source!=='stator',cos=Math.cos(delta),sin=Math.sin(delta),cageCos=a.current*Math.cos(delta-a.phase),cageSin=a.current*Math.sin(delta-a.phase);
 for(let i=0;i<grid.length;i++)grid[i]=(s?cos*f[0][i]+sin*f[1][i]:0)+(r?cageCos*f[2][i]+cageSin*f[3][i]:0);
 const color=source==='rotor'?'#8661b1':source==='stator'?'#007e6c':'#267e76',result=window.MagneticContours(grid,N,R,color),out=`<g class="numerical-flux" data-source="${source}" data-cage-current="${a.current}">${result.paths}${result.arrows}</g>`;if(cache.size>8)cache.clear();cache.set(key,out);return out;
}
window.AMNumericalField=field;
window.AMRealisticScene=function(base,a,fieldAngle,rotor,relative,source){const viewRotor=relative?0:rotor;let scene=base.replace(/<g class="flux-lines[^>]*>[\s\S]*?<\/g>/g,'').replace('r="173" fill="#fafcfb"','r="153" fill="#fafcfb"').replaceAll('d="M173 -3','d="M153 -3').replaceAll('L173 3"','L153 3"');
 const layers=source==='none'?'':`<g transform="translate(320 260) rotate(${-viewRotor*180/Math.PI})">${field(a,fieldAngle-rotor,source)}</g>`;
 scene=scene.replace(/<circle cx="[^"]+" cy="[^"]+" r="9"/,match=>layers+match);
 return '<g class="realistic-machine">'+scene+'</g>';
};
})();
