/* Retained GPU illustration. Numerical field and particle model stay in model.js. */
(()=>{'use strict';
window.createConfinementRenderer=()=>{
 if(typeof THREE==='undefined')return null;
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});}catch{return null;}
 let sizeKey="";
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(),group=new THREE.Group();scene.add(group);
 scene.add(new THREE.AmbientLight(0xffffff,.5));
 for(const [x,y,z,power] of [[-700,900,1800,1.4],[1000,250,600,.4]]){const light=new THREE.DirectionalLight(0xffffff,power);light.position.set(x,y,z);scene.add(light);}
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 function clear(){for(const child of [...group.children]){child.geometry.dispose();child.material.dispose();group.remove(child);}}
 return {render(objects,W,H,scale,dpr){
  clear();const nextSize=[W,H,dpr].join(':');if(nextSize!==sizeKey){sizeKey=nextSize;renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);}camera.left=0;camera.right=W;camera.top=H;camera.bottom=0;camera.near=.1;camera.far=20000;camera.position.set(0,0,10000);camera.updateProjectionMatrix();
  const batches=new Map(),colours=new Map();const colour=value=>{let c=colours.get(value);if(!c){c=new THREE.Color(value);colours.set(value,c);}return c;};
  for(const o of objects){const key=o.face?'face:'+o.material+':'+o.alpha:'line:'+o.color+':'+o.alpha;let b=batches.get(key);if(!b){b={sample:o,positions:[],colors:[],indices:[],vertices:new Map(),counts:[]};batches.set(key,b);}
   if(o.face){const ids=o.points.map((p,vertex)=>{const color=colour(o.vertexColors?.[vertex]||o.baseColor);const xyz=[p[0],H-p[1],p[2]*scale],key=xyz.map(v=>v.toFixed(5)).join(':');let id=b.vertices.get(key);if(id===undefined){id=b.positions.length/3;b.vertices.set(key,id);b.positions.push(...xyz);b.colors.push(color.r,color.g,color.b);b.counts.push(1);}else{b.colors[id*3]+=color.r;b.colors[id*3+1]+=color.g;b.colors[id*3+2]+=color.b;b.counts[id]++;}return id;});for(let i=1;i<ids.length-1;i++)b.indices.push(ids[0],ids[i],ids[i+1]);
   }else if(o.a)b.positions.push(o.a[0],H-o.a[1],o.a[2]*scale,o.b[0],H-o.b[1],o.b[2]*scale);
  }
  for(const b of batches.values()){if(!b.positions.length)continue;const o=b.sample,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));let item;
   if(o.face){b.colors=b.colors.map((v,i)=>v/b.counts[Math.floor(i/3)]);g.setAttribute('color',new THREE.Float32BufferAttribute(b.colors,3));g.setIndex(b.indices);g.computeVertexNormals();
    // Copper is a solid winding: its depth must occlude the shell behind it.
    // The transparent shell can still tint copper on the far side of the tube.
    const copper=o.material==='copper',opts={vertexColors:true,side:THREE.DoubleSide,transparent:!copper&&o.alpha<1,opacity:copper?1:o.alpha,depthTest:true,depthWrite:copper||o.alpha>=.95,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1};
    // Quantitative colours remain unlit; the grey/pink shell has smooth specular highlights.
    const material=(o.material==='map'||o.material==='matte')?new THREE.MeshBasicMaterial(opts):new THREE.MeshPhongMaterial({...opts,shininess:o.material==='copper'?75:110,specular:0xdddddd});item=new THREE.Mesh(g,material);
   }else{const mat=new THREE.LineBasicMaterial({color:o.color,transparent:o.alpha<1,opacity:o.alpha,depthWrite:false});item=new THREE.LineSegments(g,mat);item.renderOrder=2;}
   group.add(item);
  }
  renderer.render(scene,camera);return renderer.domElement;
 },dispose(){clear();renderer.dispose();renderer.forceContextLoss();}};
};
})();
