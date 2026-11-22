(() => {
  'use strict';
  const cardGeometry = null;
  const turn = 2 * Math.PI;
  const cutHalfAngle = 5 * Math.PI / 18;
  const cutStart = Math.PI / 2 + cutHalfAngle;
  const solidAngle = turn - 2 * cutHalfAngle;

  function makeScene(three, profile = cardGeometry) {
    const scene = new three.Scene();
    const camera = new three.PerspectiveCamera(32, 600 / 410, .1, 150);
    camera.up.set(0, 0, 1);
    camera.position.set(0, 41.5, 19.5);
    camera.lookAt(0, 0, -.25);
    const key = new three.DirectionalLight('#fff3fa', 3);
    key.position.set(0, 5, 17);
    const rimLight = new three.DirectionalLight('#e0deff', 1.9);
    rimLight.position.set(0, -10, 8);
    scene.add(new three.HemisphereLight('#fff8fd', '#9c88ba', 2.25), key, rimLight);
    const metal = color => new three.MeshStandardMaterial({color, metalness:.24, roughness:.41});
    const coilMetal = metal('#aaa4c9'), ringMetal = metal('#9d94bf'), columnMetal = metal('#c5bbd2');

    function points(section) {
      return section.map(([r, z]) => new three.Vector2(r, z));
    }
    function add(geometry, material, angle = 0) {
      const object = new three.Mesh(geometry, material);
      object.rotation.z = angle;
      scene.add(object);
      return object;
    }
    function lathe(section, angle = 0, length = turn, segments = 180) {
      return new three.LatheGeometry(points([...section,section[0]]),segments,angle + Math.PI / 2,length)
        .rotateX(Math.PI / 2);
    }

    const contour = new three.Shape(points(profile.tf[0]));
    contour.holes.push(new three.Path(points(profile.tf[1])));
    const coil = new three.ExtrudeGeometry(contour,{
      depth:.78, bevelEnabled:true, bevelThickness:.075, bevelSize:.075, bevelSegments:3, steps:1
    }).rotateX(Math.PI / 2).translate(0,.39,0);
    for (let i=0;i<18;i++) {
      const angle = i*turn/18;
      const distance = Math.abs(Math.atan2(Math.sin(angle-Math.PI/2),Math.cos(angle-Math.PI/2)));
      if (distance > cutHalfAngle) add(coil,coilMetal,angle);
    }

    for (const [r0,r1,z0,z1] of profile.pf) {
      const z = (z0+z1)/2, half = (z1-z0)*.30;
      const inset = Math.min(.13,(r1-r0)*.22,half*.6);
      const flange = [[r0+inset,z-half],[r1-inset,z-half],[r1,z-half+inset],[r1,z+half-inset],
        [r1-inset,z+half],[r0+inset,z+half],[r0,z+half-inset],[r0,z-half+inset]];
      add(lathe(flange,cutStart,solidAngle,112),ringMetal);
      for (const [angle,side] of [[cutStart,three.FrontSide],[cutStart+solidAngle,three.BackSide]]) {
        const cap = ringMetal.clone();
        cap.side = side;
        add(new three.ShapeGeometry(new three.Shape(points(flange))).rotateX(Math.PI / 2),cap,angle);
      }
    }
    const [rCS, zMin, zMax] = profile.solenoid;
    add(new three.CylinderGeometry(rCS,rCS,zMax-zMin,96).rotateX(Math.PI/2).translate(0,0,(zMin+zMax)/2),columnMetal);

    const [rAxis,zAxis] = profile.plasma.axis;
    const material = new three.ShaderMaterial({
      side:three.DoubleSide,
      uniforms:{uTime:{value:0},uAxis:{value:new three.Vector2(rAxis,zAxis)}},
      vertexShader:`
        uniform float uTime;
        uniform vec2 uAxis;
        varying vec3 p;
        varying vec3 n;
        void main() {
          float r=length(position.xy), a=atan(position.y,position.x);
          float pulse=1.+.113*sin(uTime*1.9)+.025*sin(uTime*3.8)*cos((a-1.5707963)*4.);
          p=vec3(position.xy*((uAxis.x+(r-uAxis.x)*pulse)/r),uAxis.y+(position.z-uAxis.y)*pulse);
          n=normalize(normalMatrix*normal);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        }`,
      fragmentShader:`
        uniform float uTime;
        varying vec3 p;
        varying vec3 n;
        void main() {
          float a=atan(p.y,p.x), r=length(p.xy);
          float front=.5+.5*sin(5.*a-3.8*uTime+.9*p.z+.85*sin(11.*a+1.3*p.z+1.9*uTime));
          float strand=.5+.5*sin(13.*a+2.45*p.z+1.7*r+3.8*uTime+.75*sin(6.*a+p.z-1.9*uTime));
          float eddy=.5+.5*sin(21.*a-1.85*p.z+2.1*r-5.7*uTime);
          float edge=pow(1.-abs(normalize(n).z),1.65), breath=.5+.5*sin(uTime*1.9);
          vec3 color=mix(vec3(.26,.011,.25),vec3(.94,.14,.39),.20+.67*front);
          color=mix(color,vec3(1.,.64,.80),.69*pow(strand,3.)*(.22+.78*front)+.17*pow(eddy,4.)+.13*edge);
          color*=.78+.26*breath+.12*abs(normalize(n).y);
          gl_FragColor=vec4(color,1.);
          #include <colorspace_fragment>
        }`
    });
    add(lathe(profile.plasma.profile),material);

    return {scene,camera,material};
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {makeScene};
    return;
  }

  const app = document.getElementById('app');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current, engine;
  function loadEngine() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!engine) engine = new Promise((resolve,reject)=>{
      const script = document.createElement('script');
      script.src = 'shared/particles/vendor/three.js';
      script.onload = () => window.THREE ? resolve(window.THREE) : reject();
      script.onerror = reject;
      document.head.appendChild(script);
    }).catch(error=>{engine=undefined;throw error;});
    return engine;
  }
  function mount(host) {
    const canvas = host.querySelector('canvas');
    const picture = host.querySelector('picture');
    let renderer, model, frame = 0, elapsed = 0, previous, visible = false, loading = false, disposed = false, failed = false;
    function pause() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = undefined;
    }
    function paint(now) {
      frame = 0;
      if (disposed || !renderer || !visible || document.hidden) return;
      if (previous !== undefined && !motion.matches) elapsed += Math.min(.05,(now-previous)/1000);
      previous = now;
      model.material.uniforms.uTime.value = elapsed;
      renderer.render(model.scene,model.camera);
      if (!motion.matches) frame = requestAnimationFrame(paint);
    }
    function resume() {
      if (renderer && !failed && visible && !document.hidden && !frame) frame = requestAnimationFrame(paint);
    }
    function resize() {
      if (!renderer) return;
      const scale = Math.max(1.6,Math.min(devicePixelRatio || 1,2.5));
      const width = Math.max(1,Math.round(host.clientWidth*scale));
      const height = Math.max(1,Math.round(host.clientHeight*scale));
      renderer.setSize(width,height,false);
      model.camera.aspect = width/height;
      model.camera.zoom = Math.min(1,model.camera.aspect/1.22);
      model.camera.updateProjectionMatrix();
      resume();
    }
    function useFallback() {
      failed = true;
      pause();
      picture.hidden = false;
      canvas.hidden = true;
    }
    async function start() {
      if (renderer || loading || disposed || failed) return;
      loading = true;
      try {
        const three = await loadEngine();
        if (disposed || !visible) return;
        renderer = new three.WebGLRenderer({canvas,alpha:true,antialias:true});
        renderer.toneMapping = three.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        model = makeScene(three);
        resize();
        pause();
        paint(performance.now());
        canvas.hidden = false;
        picture.hidden = true;
      } catch {
        useFallback();
      } finally {
        loading = false;
      }
    }
    const viewport = new IntersectionObserver(([entry])=>{
      visible = entry.isIntersecting;
      if (visible) {start();resume();}
      else pause();
    });
    const size = new ResizeObserver(resize);
    viewport.observe(host);
    size.observe(host);
    function visibility() {if (document.hidden) pause();else resume();}
    canvas.addEventListener('webglcontextlost',useFallback);
    document.addEventListener('visibilitychange',visibility);
    motion.addEventListener('change',resume);
    return {host,dispose(){
      disposed = true;
      pause();
      viewport.disconnect();
      size.disconnect();
      canvas.removeEventListener('webglcontextlost',useFallback);
      document.removeEventListener('visibilitychange',visibility);
      motion.removeEventListener('change',resume);
      if (model) {
        const resources = new Set();
        model.scene.traverse(node=>{
          if (node.isMesh) {resources.add(node.geometry);resources.add(node.material);}
        });
        for (const resource of resources) resource.dispose();
      }
      renderer?.dispose();
    }};
  }
  function sync() {
    const host = app.querySelector('.iter-card-scene');
    if (host === current?.host) return;
    current?.dispose();
    current = host ? mount(host) : null;
  }
  if (app && 'IntersectionObserver' in window && 'ResizeObserver' in window) {
    new MutationObserver(sync).observe(app,{childList:true,subtree:true});
    sync();
  }
})();
