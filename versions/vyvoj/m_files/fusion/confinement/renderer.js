/* Retained GPU illustration. Numerical field and particle model stay in model.js. */
(()=>{'use strict';
const finishes=window.TokamakMaterialFinishes=Object.freeze({
 'structural-steel':{metalness:.84,roughness:.24,envMapIntensity:1.45},
 'vessel-steel':{metalness:.82,roughness:.27,envMapIntensity:1.45},
 'brushed-steel':{metalness:.9,roughness:.22,envMapIntensity:1.5,color:'#a9b8c2'},
 'machined-steel':{metalness:.96,roughness:.13,envMapIntensity:1.75,color:'#d1d8dd'},
 'polished-steel':{metalness:.92,roughness:.17,envMapIntensity:1.65},
 'copper':{metalness:.95,roughness:.23,envMapIntensity:1.45},
 'winding':{metalness:.9,roughness:.28,envMapIntensity:1.4},
 'tungsten':{metalness:.96,roughness:.24,envMapIntensity:1.35},
 'shield-steel':{metalness:.72,roughness:.43,envMapIntensity:1.1},
 'support-steel':{metalness:.78,roughness:.34,envMapIntensity:1.2},
 'dark-steel':{metalness:.72,roughness:.45,envMapIntensity:1.05}
});
window.createConfinementRenderer=(options={})=>{
 if(typeof THREE==='undefined')return null;
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,stencil:!!options.technical});}catch{return null;}
 const cadExposure=options.cadExposure??1;
 let sizeKey="",geometryKey=null;
 // Original procedural studio panorama. Broad light cards give metals readable reflections.
 let studio=null;
 if(options.technical){const w=512,h=256,pixels=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h,k=(y*w+x)*4,card=(a,b,c,d)=>u>a&&u<b&&v>c&&v<d;let c=v<.5?[135,151,164]:[62,79,94];if(card(.08,.18,.16,.68)||card(.57,.61,.08,.82))c=[245,247,249];else if(card(.76,.95,.16,.40))c=[161,180,197];else if(v<.10)c=[108,122,133];pixels.set([...c,255],k);}studio=new THREE.DataTexture(pixels,w,h);studio.mapping=THREE.EquirectangularReflectionMapping;studio.colorSpace=THREE.SRGBColorSpace;studio.needsUpdate=true;}

 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(),group=new THREE.Group();scene.add(group);
 const cadGroup=new THREE.Group(),cadGeometries=new Map(),cadClips=[];group.add(cadGroup);let cadKey='',markers=null;
 function updateMarkers(view){if(!view?.markers)return;if(!markers){markers=new THREE.InstancedMesh(new THREE.ConeGeometry(.045,.15,8),new THREE.MeshBasicMaterial({color:0x356ac3}),6);markers.frustumCulled=false;markers.userData.directionMarkers=true;group.add(markers);}markers.count=Math.min(6,view.markers.length);const up=new THREE.Vector3(0,1,0),matrix=new THREE.Matrix4();for(let i=0;i<markers.count;i++){const item=view.markers[i],direction=new THREE.Vector3(...item.d).normalize(),q=new THREE.Quaternion().setFromUnitVectors(up,direction);matrix.compose(new THREE.Vector3(...item.p),q,new THREE.Vector3(1,1,1));markers.setMatrixAt(i,matrix);}markers.instanceMatrix.needsUpdate=true;}

 function clearCAD(all=false){for(const child of [...cadGroup.children]){if(child.userData?.cadCap)child.geometry.dispose();for(const material of (Array.isArray(child.material)?child.material:[child.material]))material.dispose();cadGroup.remove(child);}cadClips.length=0;cadKey='';if(all){for(const geometry of cadGeometries.values())geometry.dispose();cadGeometries.clear();}}
 function updateCADClips(){if(!cadClips.length)return;const plane=new THREE.Plane(new THREE.Vector3(0,-1,0),0).applyMatrix4(group.matrix);for(const material of cadClips)material.clippingPlanes[0].copy(plane);}
 function renderCAD(entries){const key=JSON.stringify(entries.map(o=>[o.cadId,o.rotations,o.alpha,o.baseColor,o.finish,o.cut,o.cap]));if(key===cadKey){updateCADClips();return;}clearCAD();cadKey=key;renderer.localClippingEnabled=true;let order=100;
  for(const o of entries){let geometry=cadGeometries.get(o.cadId);if(!geometry){geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(o.cadMesh.positions,3));geometry.setIndex(new THREE.BufferAttribute(o.cadMesh.indices,1));if(o.cadMesh.normals)geometry.setAttribute('normal',new THREE.BufferAttribute(o.cadMesh.normals,3));else geometry.computeVertexNormals();geometry.computeBoundingBox();if(o.cadMesh.groups){const names=[];for(const g of o.cadMesh.groups){let index=names.indexOf(g.finish);if(index<0){index=names.length;names.push(g.finish);}geometry.addGroup(g.start,g.count,index);}geometry.userData.finishNames=names;}cadGeometries.set(o.cadId,geometry);}
   const box=geometry.boundingBox,range=angle=>{const s=Math.sin(angle),c=Math.cos(angle),ys=[s*box.min.x+c*box.min.y,s*box.min.x+c*box.max.y,s*box.max.x+c*box.min.y,s*box.max.x+c*box.max.y];return [Math.min(...ys),Math.max(...ys)];},visible=o.cut?o.rotations.filter(a=>range(a)[0]<=1e-6):o.rotations,crossing=o.cut?visible.filter(a=>range(a)[1]>=-1e-6):[];if(!visible.length)continue;
   const clipped=o.cut?[new THREE.Plane(new THREE.Vector3(0,-1,0),0).applyMatrix4(group.matrix)]:null;
   const make=(name,extra={})=>{const finish=finishes[name]||finishes['structural-steel'],material=new THREE.MeshStandardMaterial({...finish,envMapIntensity:finish.envMapIntensity*cadExposure,color:finish.color||o.baseColor,side:THREE.DoubleSide,envMap:studio,transparent:o.alpha<1,opacity:o.alpha,flatShading:!!o.reconstructed,depthWrite:o.alpha>=.95,clippingPlanes:clipped,...extra});material.userData.finish=name;if(clipped&&material.clippingPlanes)cadClips.push(material);return material;};
   const material=geometry.userData.finishNames?geometry.userData.finishNames.map(name=>make(name)):make(o.finish||'structural-steel');
   const instance=(mat,angles=visible)=>{const mesh=new THREE.InstancedMesh(geometry,mat,angles.length);for(let i=0;i<angles.length;i++)mesh.setMatrixAt(i,new THREE.Matrix4().makeRotationZ(angles[i]));mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;mesh.userData={cadPart:o.cadId,sourceFrame:!o.reconstructed&&!o.parametric,parametric:!!o.parametric,reconstructed:!!o.reconstructed,finish:o.finish};cadGroup.add(mesh);return mesh;};instance(material);
   // Each solid gets its own stencil and its own cap material. Open decorative
   // winding inserts must never contribute to the solid's winding number.
   if(o.cut&&o.cap!==false&&o.alpha>=.95&&crossing.length){for(const [side,operation]of [[THREE.BackSide,THREE.IncrementWrapStencilOp],[THREE.FrontSide,THREE.DecrementWrapStencilOp]]){const stencil=new THREE.MeshBasicMaterial({side,depthWrite:false,depthTest:false,colorWrite:false,clippingPlanes:clipped,stencilWrite:true,stencilFunc:THREE.AlwaysStencilFunc,stencilFail:operation,stencilZFail:operation,stencilZPass:operation});cadClips.push(stencil);instance(stencil,crossing).renderOrder=order;}
    const b=o.worldBounds,capGeometry=new THREE.PlaneGeometry(2*b.radius,b.zmax-b.zmin);capGeometry.rotateX(Math.PI/2);capGeometry.translate(0,-.00001,(b.zmin+b.zmax)/2);const capMaterial=make(o.finish||'structural-steel',{clippingPlanes:null,roughness:Math.max(.14,(finishes[o.finish]?.roughness||.24)*.85),stencilWrite:true,stencilRef:0,stencilFunc:THREE.NotEqualStencilFunc,stencilFail:THREE.ReplaceStencilOp,stencilZFail:THREE.ReplaceStencilOp,stencilZPass:THREE.ReplaceStencilOp}),cap=new THREE.Mesh(capGeometry,capMaterial);cap.userData={cadCap:true,finish:o.finish,forPart:o.cadId};cap.renderOrder=order+1;cap.onAfterRender=()=>renderer.clearStencil();cadGroup.add(cap);order+=3;
   }
  }
 }
 scene.add(new THREE.AmbientLight(0xffffff,options.technical?.18:.5));
 for(const [x,y,z,power] of (options.technical?[[-700,900,1200,1.15],[1100,100,500,.35],[-200,-500,-900,.65]]:[[-700,900,1800,1.4],[1000,250,600,.4]])){const light=new THREE.DirectionalLight(0xffffff,power);light.position.set(x,y,z);scene.add(light);}
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;

 function updateTubes(scale,angle){for(const child of group.children){const uniforms=child.material?.uniforms;if(uniforms?.pixelWidth)uniforms.radius.value=uniforms.pixelWidth.value/(2*scale);if(child.userData.fieldTube)child.rotation.z=angle;}}
 function addTube(o,scale){const points=o.tubeLine,positions=[],radial=[],indices=[],sides=8;let normal=null;
  for(let i=0;i<points.length;i++){const p=new THREE.Vector3(...points[i].slice(0,3)),a=new THREE.Vector3(...points[Math.max(0,i-1)].slice(0,3)),b=new THREE.Vector3(...points[Math.min(points.length-1,i+1)].slice(0,3)),tangent=b.sub(a).normalize();if(!normal){normal=new THREE.Vector3().crossVectors(tangent,new THREE.Vector3(0,0,1));if(normal.lengthSq()<1e-6)normal.crossVectors(tangent,new THREE.Vector3(0,1,0));}normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();const binormal=new THREE.Vector3().crossVectors(tangent,normal).normalize();for(let j=0;j<sides;j++){const angle=j*2*Math.PI/sides,n=normal.clone().multiplyScalar(Math.cos(angle)).addScaledVector(binormal,Math.sin(angle));positions.push(p.x,p.y,p.z);radial.push(n.x,n.y,n.z);}if(i)for(let j=0;j<sides;j++){const a=(i-1)*sides+j,b=(i-1)*sides+(j+1)%sides,c=i*sides+(j+1)%sides,d=i*sides+j;indices.push(a,c,b,a,d,c);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('radial',new THREE.Float32BufferAttribute(radial,3));g.setIndex(indices);g.computeVertexNormals();
  const vertexShader='attribute vec3 radial;uniform float radius;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+radial*radius,1.0);}',fragmentShader='uniform vec3 tint;uniform float alpha;void main(){gl_FragColor=vec4(tint,alpha);\n#include <colorspace_fragment>\n}';
  for(const [width,color,side,order]of [[o.width+1.4,'#ffffff',THREE.BackSide,3],[o.width,o.color,THREE.FrontSide,4]]){const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{radius:{value:width/(2*scale)},pixelWidth:{value:width},tint:{value:new THREE.Color(color)},alpha:{value:o.alpha}},side,depthTest:true,depthWrite:false,transparent:true,toneMapped:false});const item=new THREE.Mesh(g,material);item.frustumCulled=false;item.renderOrder=order;item.userData.fieldTube=true;group.add(item);}
 }
 function clear(){const disposed=new Set();for(const child of [...group.children]){if(child===cadGroup||child===markers)continue;if(!disposed.has(child.geometry)){child.geometry.dispose();disposed.add(child.geometry);}child.material.dispose();group.remove(child);}}
 return {render(objects,W,H,scale,dpr,view){
  const reuse=view?.world&&geometryKey===view.key;const nextSize=[W,H,dpr].join(':');if(nextSize!==sizeKey){sizeKey=nextSize;renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);}camera.left=0;camera.right=W;camera.top=H;camera.bottom=0;camera.near=.1;camera.far=20000;camera.position.set(0,0,10000);camera.updateProjectionMatrix();
  if(view?.world){const cy=Math.cos(view.yaw),sy=Math.sin(view.yaw),cp=Math.cos(view.pitch),sp=Math.sin(view.pitch);group.matrixAutoUpdate=false;group.matrix.set(cy*scale,-sy*scale,0,W*.5,-sy*sp*scale,-cy*sp*scale,cp*scale,H*(view.centerY??.48)-cp*(view.centerZ||0)*scale,sy*cp*scale,cy*cp*scale,sp*scale,0,0,0,0,1);group.matrixWorldNeedsUpdate=true;}else{group.matrixAutoUpdate=true;group.matrix.identity();}
  updateCADClips();updateMarkers(view);if(reuse){updateTubes(scale,view.tubeAngle??0);for(const child of group.children)child.material?.uniforms?.viewport?.value.set(W,H);renderer.render(scene,camera);return renderer.domElement;}
  clear();geometryKey=view?.world?view.key:null;
  const batches=new Map(),colours=new Map();const colour=value=>{let c=colours.get(value);if(!c){c=new THREE.Color(value);colours.set(value,c);}return c;};
  renderCAD(objects.filter(o=>o.cadMesh));for(const o of objects){if(o.cadMesh)continue;if(o.tubeLine){addTube(o,scale);continue;}const key=o.face?'face:'+o.material+':'+o.alpha:'line:'+o.color+':'+o.alpha+':'+(o.width||1);let b=batches.get(key);if(!b){b={sample:o,positions:[],colors:[],indices:[],vertices:new Map(),counts:[]};batches.set(key,b);}
   if(o.face){const xyzFace=o.points.map(p=>view?.world?p.slice(0,3):[p[0],H-p[1],p[2]*scale]),a=xyzFace[0],u=xyzFace[1].map((v,i)=>v-a[i]),v=xyzFace[2].map((v,i)=>v-a[i]),faceNormal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...faceNormal)||1;for(let i=0;i<3;i++)faceNormal[i]/=length;const crease=options.technical&&!['map','matte'].includes(o.material);const ids=o.points.map((p,vertex)=>{const color=colour(o.vertexColors?.[vertex]||o.baseColor);const xyz=view?.world?p:[p[0],H-p[1],p[2]*scale],key=xyz.map(v=>v.toFixed(5)).join(':');let groups=crease?b.vertices.get(key):null,id=crease?groups?.find(c=>c.normal.reduce((sum,x,i)=>sum+x*faceNormal[i],0)>.8660254)?.id:b.vertices.get(key);if(id===undefined){id=b.positions.length/3;if(crease){if(!groups){groups=[];b.vertices.set(key,groups);}groups.push({id,normal:faceNormal});}else b.vertices.set(key,id);b.positions.push(...xyz);b.colors.push(color.r,color.g,color.b);b.counts.push(1);}else{b.colors[id*3]+=color.r;b.colors[id*3+1]+=color.g;b.colors[id*3+2]+=color.b;b.counts[id]++;}return id;});for(let i=1;i<ids.length-1;i++)b.indices.push(ids[0],ids[i],ids[i+1]);
   }else if(o.a)b.positions.push(...(view?.world?[o.a[0],o.a[1],o.a[2],o.b[0],o.b[1],o.b[2]]:[o.a[0],H-o.a[1],o.a[2]*scale,o.b[0],H-o.b[1],o.b[2]*scale]));
  }
  for(const b of batches.values()){if(!b.positions.length)continue;const o=b.sample,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));let item;
   if(o.face){b.colors=b.colors.map((v,i)=>v/b.counts[Math.floor(i/3)]);g.setAttribute('color',new THREE.Float32BufferAttribute(b.colors,3));g.setIndex(b.indices);g.computeVertexNormals();
    // Copper is a solid winding: its depth must occlude the shell behind it.
    // The transparent shell can still tint copper on the far side of the tube.
    const copper=o.material==='copper',opts={vertexColors:true,side:THREE.DoubleSide,transparent:!copper&&o.alpha<1,opacity:copper?1:o.alpha,depthTest:true,depthWrite:copper||o.alpha>=.95,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1};
    // Quantitative colours remain unlit; the grey/pink shell has smooth specular highlights.
    const quantitative=o.material==='map'||o.material==='matte';const material=quantitative?new THREE.MeshBasicMaterial(opts):options.technical?new THREE.MeshStandardMaterial({...opts,envMap:studio,envMapIntensity:1.5,metalness:o.material==='winding'?.78:.72,roughness:o.material==='winding'?.28:o.material==='tungsten'?.42:.23,flatShading:false}):new THREE.MeshPhongMaterial({...opts,flatShading:o.material==='case',shininess:o.material==='case'?(options.technical?105:28):o.material==='copper'?75:110,specular:options.technical?0xffffff:0xdddddd});item=new THREE.Mesh(g,material);
   }else if(o.width>1){
    const positions=[],other=[],side=[],indices=[];for(let i=0;i<b.positions.length;i+=6){const a=b.positions.slice(i,i+3),z=b.positions.slice(i+3,i+6),n=positions.length/3;positions.push(...a,...a,...z,...z);other.push(...z,...z,...a,...a);side.push(-1,1,1,-1);indices.push(n,n+2,n+1,n+2,n+3,n+1);}
    g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('other',new THREE.Float32BufferAttribute(other,3));g.setAttribute('side',new THREE.Float32BufferAttribute(side,1));g.setIndex(indices);g.computeVertexNormals();
    const vertexShader=`attribute vec3 other;attribute float side;uniform vec2 viewport;uniform float width;void main(){vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0);vec4 q=projectionMatrix*modelViewMatrix*vec4(other,1.0);vec2 d=(q.xy/q.w-p.xy/p.w)*viewport;float len=max(length(d),0.0001);vec2 normal=vec2(-d.y,d.x)/len;p.xy+=normal*side*width/viewport*p.w;p.z-=0.00001*p.w;gl_Position=p;}`;
    const fragmentShader=`uniform vec3 tint;uniform float alpha;void main(){gl_FragColor=vec4(tint,alpha);
#include <colorspace_fragment>
}`;
    const make=(width,color)=>new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{viewport:{value:new THREE.Vector2(W,H)},width:{value:width},tint:{value:new THREE.Color(color)},alpha:{value:o.alpha}},side:THREE.DoubleSide,transparent:o.alpha<1,depthTest:true,depthWrite:false,toneMapped:false});
    const halo=new THREE.Mesh(g,make(o.width+1.4,'#ffffff'));halo.renderOrder=3;group.add(halo);item=new THREE.Mesh(g,make(o.width,o.color));item.renderOrder=4;
   }else{const mat=new THREE.LineBasicMaterial({color:o.color,transparent:o.alpha<1,opacity:o.alpha,depthWrite:false});item=new THREE.LineSegments(g,mat);item.renderOrder=2;}
   group.add(item);if(options.technical&&o.face&&o.material==='case'&&o.alpha>=.95){const edges=new THREE.EdgesGeometry(g,28),ink=new THREE.LineBasicMaterial({color:0x28343e,transparent:true,opacity:.14,depthWrite:false});group.add(new THREE.LineSegments(edges,ink));}
  }
  updateTubes(scale,view?.tubeAngle??0);renderer.render(scene,camera);return renderer.domElement;
 },dispose(){clear();clearCAD(true);markers?.geometry.dispose();markers?.material.dispose();studio?.dispose();renderer.dispose();renderer.forceContextLoss();}};
};
})();
