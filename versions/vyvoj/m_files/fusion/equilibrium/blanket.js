/* Image-derived blanket reconstruction, separate from the imported STEP parts.
 * Merola, Design of ITER Plasma Facing Components (2009), slides 78–83, 89.
 * Eighteen faceted poloidal rows; repeated educational layout, not the 440
 * manufacturing positions. Each rear corner is anchored to the native vessel.
 */
(()=>{'use strict';const CAD=window.TokamakCAD,M=window.TokamakModel;
const imageProfile=[[3.95,-2.3],[3.95,-1.45],[3.95,-.6],[3.95,.25],[3.95,1.1],[3.95,1.95],[3.95,2.75],[4.02,3.5],[4.35,4.3],[5.15,4.75],[6.05,4.55],[6.95,3.85],[7.65,2.95],[8.2,1.95],[8.55,.8],[8.5,-.4],[8.1,-1.55],[7.5,-2.6],[6.85,-3.05]];
const rows=[],meshes=[],section=[],front=[],axis=[6.2,0],area=line=>Math.abs(line.reduce((s,p,i)=>s+p[0]*line[(i+1)%line.length][1]-line[(i+1)%line.length][0]*p[1],0)),cavity=CAD.sections('vessel').filter(l=>l.length>4&&Math.hypot(l[0][0]-l.at(-1)[0],l[0][1]-l.at(-1)[1])<.002&&M.contains(l,axis)).sort((a,b)=>area(a)-area(b))[0];if(!cavity)throw Error('Chybí vnitřní řez CAD nádoby.');const source=cavity.slice(1).map((p,i)=>[cavity[i],p]);
for(const q of imageProfile){const dx=q[0]-axis[0],dz=q[1]-axis[1],length=Math.hypot(dx,dz),u=[dx/length,dz/length],end=[axis[0]+u[0]*20,u[1]*20],hits=source.map(([a,b])=>M.intersection(axis,end,a,b)).filter(Boolean).sort((a,b)=>a.t-b.t);if(!hits.length)throw Error('Blanket nelze ukotvit k CAD nádoby.');const p=hits[0].p,hitRadius=Math.hypot(p[0]-axis[0],p[1]),frontRadius=Math.min(length,hitRadius-.35),face=[axis[0]+u[0]*frontRadius,u[1]*frontRadius],depth=Math.min(.42,hitRadius-frontRadius-.035);if(depth<=.05)throw Error('Nedostatečný prostor pro obklad.');rows.push({back:[face[0]+u[0]*depth,face[1]+u[1]*depth],anchor:[p[0]-u[0]*.035,p[1]-u[1]*.035],front:face,u});}
// Horizontal lower edges leave both imported divertor baffles unobstructed.
for(const index of [0,rows.length-1]){const row=rows[index],p=row.front,z=imageProfile[index][1],inboard=index===0,start=[axis[0],z],end=[inboard?0:20,z],hit=source.map(([a,b])=>M.intersection(start,end,a,b)).filter(Boolean).sort((a,b)=>a.t-b.t)[0];if(!hit)throw Error('Chybí dolní úchyt obkladu.');row.front=[imageProfile[index][0],z];row.anchor=[hit.p[0]+(inboard?.035:-.035),z];row.back=[inboard?Math.max(row.anchor[0]+.08,row.front[0]-.42):Math.min(row.anchor[0]-.08,row.front[0]+.42),z];}
function build(id,color,blocks,rotations,panels){return {cadId:id,part:'blanket',cadMesh:window.TokamakParametricMesh.blanketSector(id,blocks,panels),rotations,baseColor:color,material:'case',worldBounds:CAD.bounds,reconstructed:true};}

for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i],lerp=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t),af=lerp(a.front,b.front,.012),bf=lerp(a.front,b.front,.988),ab=lerp(a.back,b.back,.012),bb=lerp(a.back,b.back,.988),ad=lerp(af,ab,.075),bd=lerp(bf,bb,.075),N=(af[0]+bf[0])/2<6?18:36,half=Math.PI/N-.008/Math.max(1,(af[0]+bf[0])/2),rotations=Array.from({length:N},(_,j)=>(j+.5)*2*Math.PI/N);
 section.push([af,bf,bd,ad,af],[ad,bd,bb,ab,ad]);front.push([af,bf]);
 // Keep the large equatorial/upper port mouths open. Exact module variants are
 // not supplied by the source; this clearance follows the native port azimuths.
 const angles=Array.from({length:9},(_,j)=>(30+40*j)*Math.PI/180),panels=(N===18?[-10,10]:[-15,-5,5,15]).map(x=>x*Math.PI/180);
 const fingers=[];for(let j=0;j<10;j++){const t0=-half+2*half*j/10+.0006,t1=-half+2*half*(j+1)/10-.0006;fingers.push([af,bf,bd,ad,t0,t1]);}
 const shield=[];for(let j=0;j<10;j++){const t0=-half+.006+(2*half-.012)*j/10,t1=-half+.006+(2*half-.012)*(j+1)/10;shield.push([ad,bd,bb,ab,t0,t1]);}
 meshes.push(build('reconstructed-fw-'+i,'#838b89',fingers,angles,panels));meshes.push(build('reconstructed-shield-'+i,'#b9b8ad',shield,angles,panels));
 const mounts=[];for(const t of [.25,.75]){const p=lerp(ab,bb,t-.035),q=lerp(ab,bb,t+.035),r=lerp(a.anchor,b.anchor,t+.035),s=lerp(a.anchor,b.anchor,t-.035);mounts.push([p,q,r,s,-half*.55,half*.55]);section.push([p,q,r,s,p]);}meshes.push(build('reconstructed-mount-'+i,'#919b9e',mounts,angles,panels));
}
const objects=CAD.objects,sections=CAD.sections,mount=CAD.mount;CAD.sections=part=>part==='blanket'?section:sections(part);CAD.blanketFront=front;CAD.blanketRows=rows;CAD.blanketSource={url:'https://www.iter.org/sites/default/files/education/Merola_compressed.pdf',slides:[78,82,83,89],reconstructed:true};
CAD.objects=settings=>[...objects(settings),...(settings.visible.blanket?meshes.map(m=>({...m,finish:m.cadId.includes('-fw-')?'tungsten':m.cadId.includes('-shield-')?'shield-steel':'structural-steel',alpha:settings.focus==='all'||settings.focus==='blanket'?1:.10,cut:settings.cut})):[])];
CAD.mount=(D,M)=>{const found=mount(D,M);D.machine.cadBlanketSegments=front;D.machine.cadContactSegments.push(...front);const bins=new Map();for(const edge of D.machine.cadContactSegments){const [a,b]=edge;for(let x=Math.floor(Math.min(a[0],b[0])*4);x<=Math.floor(Math.max(a[0],b[0])*4);x++)for(let y=Math.floor(Math.min(a[1],b[1])*4);y<=Math.floor(Math.max(a[1],b[1])*4);y++){const key=x+':'+y;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(edge);}}D.machine.cadContactIndex=bins;D.machine.firstWall=rows.map(r=>r.front);return found;};
})();
