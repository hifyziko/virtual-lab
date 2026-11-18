/* Retained GPU illustration. Numerical field and particle model stay in model.js. */
(()=>{'use strict';
window.createConfinementRenderer=(options={})=>{
 if(typeof THREE==='undefined')return null;
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});}catch{return null;}
 let sizeKey="",geometryKey=null;
 // Original procedural studio panorama. Broad light cards give metals readable reflections.
 let studio=null;
 if(options.technical){const w=512,h=256,pixels=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h,k=(y*w+x)*4,card=(a,b,c,d)=>u>a&&u<b&&v>c&&v<d;let c=v<.5?[135,151,164]:[62,79,94];if(card(.08,.18,.16,.68)||card(.57,.61,.08,.82))c=[245,247,249];else if(card(.76,.95,.16,.40))c=[161,180,197];else if(v<.10)c=[108,122,133];pixels.set([...c,255],k);}studio=new THREE.DataTexture(pixels,w,h);studio.mapping=THREE.EquirectangularReflectionMapping;studio.colorSpace=THREE.SRGBColorSpace;studio.needsUpdate=true;}

 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(),group=new THREE.Group();scene.add(group);
 scene.add(new THREE.AmbientLight(0xffffff,options.technical?.18:.5));
 for(const [x,y,z,power] of (options.technical?[[-700,900,1200,1.15],[1100,100,500,.35],[-200,-500,-900,.65]]:[[-700,900,1800,1.4],[1000,250,600,.4]])){const light=new THREE.DirectionalLight(0xffffff,power);light.position.set(x,y,z);scene.add(light);}
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 function clear(){const disposed=new Set();for(const child of [...group.children]){if(!disposed.has(child.geometry)){child.geometry.dispose();disposed.add(child.geometry);}child.material.dispose();group.remove(child);}}
 return {render(objects,W,H,scale,dpr,view){
  const reuse=view?.world&&geometryKey===view.key;const nextSize=[W,H,dpr].join(':');if(nextSize!==sizeKey){sizeKey=nextSize;renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);}camera.left=0;camera.right=W;camera.top=H;camera.bottom=0;camera.near=.1;camera.far=20000;camera.position.set(0,0,10000);camera.updateProjectionMatrix();
  if(view?.world){const cy=Math.cos(view.yaw),sy=Math.sin(view.yaw),cp=Math.cos(view.pitch),sp=Math.sin(view.pitch);group.matrixAutoUpdate=false;group.matrix.set(cy*scale,-sy*scale,0,W*.5,-sy*sp*scale,-cy*sp*scale,cp*scale,H*.48,sy*cp*scale,cy*cp*scale,sp*scale,0,0,0,0,1);group.matrixWorldNeedsUpdate=true;}else{group.matrixAutoUpdate=true;group.matrix.identity();}
  if(reuse){for(const child of group.children)child.material.uniforms?.viewport?.value.set(W,H);renderer.render(scene,camera);return renderer.domElement;}
  clear();geometryKey=view?.world?view.key:null;
  const batches=new Map(),colours=new Map();const colour=value=>{let c=colours.get(value);if(!c){c=new THREE.Color(value);colours.set(value,c);}return c;};
  for(const o of objects){const key=o.face?'face:'+o.material+':'+o.alpha:'line:'+o.color+':'+o.alpha+':'+(o.width||1);let b=batches.get(key);if(!b){b={sample:o,positions:[],colors:[],indices:[],vertices:new Map(),counts:[]};batches.set(key,b);}
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
  renderer.render(scene,camera);return renderer.domElement;
 },dispose(){clear();studio?.dispose();renderer.dispose();renderer.forceContextLoss();}};
};
})();
