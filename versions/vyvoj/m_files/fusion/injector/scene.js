/* Fixed longitudinal section and equatorial view. Both share the graph's x axis. */
const InjectorScene = (() => {
  const {grids,dumpX,birthX,deflection}=InjectorModel;
  const electric=HiFyzikoParticleStyle.fields.electric, magnetic=HiFyzikoParticleStyle.fields.magnetic;
  const ink='#345463', steel='#8096a0', negative='#6855a2', neutral='#18786e', positive='#c36e36';
  const tau=2*Math.PI;
  function line(c,pts,color,width=1,dash=[]){
    c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
    c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);
  }
  function dot(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,tau);c.fill();}
  function circle(c,x,y,r,color,width=1){
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,tau);c.stroke();
  }
  function plate(c,x,y,w,h,a='#e2eaec',b=steel){
    const g=c.createLinearGradient(x,y,x+w*.25,y+h);g.addColorStop(0,a);g.addColorStop(.4,'#f8fbfa');g.addColorStop(1,b);
    c.fillStyle=g;c.fillRect(x,y,w,h);c.strokeStyle=b;c.lineWidth=1;c.strokeRect(x,y,w,h);
  }
  function arrow(c,x,y,dx,dy,color){
    const length=Math.hypot(dx,dy),tip=Math.min(9,length*.4);
    c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));c.fillStyle=color;c.beginPath();
    for(const [i,p] of [[0,-1.2],[length-tip,-1.2],[length-tip,-4],[length,0],[length-tip,4],[length-tip,1.2],[0,1.2]].entries())
      i?c.lineTo(...p):c.moveTo(...p);
    c.closePath();c.fill();c.restore();
  }
  // Visible top and side of a solid in the same oblique view as the RF turns.
  function solidPlate(c,x,y,w,h,a,b,depth=16){
    const face=[[x,y],[x+w,y],[x+w,y+h]];
    const back=face.map(([px,py])=>InjectorSource.project(px,py,depth));
    for(let i=0;i<2;i++){
      const corners=[face[i],back[i],back[i+1],face[i+1]];
      c.beginPath();corners.forEach(([px,py],j)=>j?c.lineTo(px,py):c.moveTo(px,py));
      c.closePath();c.fillStyle=i?'#91a6ae':'#c5d4d8';c.fill();
      c.strokeStyle=steel;c.lineWidth=.8;c.stroke();
    }
    plate(c,x,y,w,h,a,b);
  }
  function label(c,text,x,y,color=ink,size=15,align='center'){
    c.fillStyle=color;c.font='600 '+size+'px "Segoe UI",sans-serif';c.textAlign=align;c.fillText(text,x,y);
  }
  function detailLabeler(annotations){
    const placed=[];
    return (c,text,x,y,color=ink,size=15,align='center')=>{
      c.font='600 '+size+'px "Segoe UI",sans-serif';
      const width=c.measureText(text)?.width??text.length*size*.55;
      const left=x-(align==='center'?width/2:align==='right'?width:0);
      let baseline=y;
      for(let row=0;;row++){
        baseline=y+(row%2?1:-1)*Math.ceil(row/2)*(size+6);
        const box={left:left-3,right:left+width+3,top:baseline-size-2,bottom:baseline+size*.26+2};
        if(placed.every(b=>box.left>=b.right||box.right<=b.left||box.top>=b.bottom||box.bottom<=b.top)){
          placed.push(box);break;
        }
      }
      annotations.push([c.globalAlpha,text,x,baseline,color,size,align]);
      return baseline;
    };
  }
  function sphere(c,x,y,r,color,edge='#263744'){
    const g=c.createRadialGradient(x-r*.35,y-r*.42,r*.05,x,y,r);
    g.addColorStop(0,'#f8fcff');g.addColorStop(.36,color);g.addColorStop(1,edge);
    dot(c,x,y,r,g);
  }
  // The horizontal median plane of the project's ITER CAD assembly.
  const coilAngles=TokamakCAD.data.parts.filter(p=>p.part==='tf').flatMap(p=>p.rotations.map(a=>(a+(p.nativeAngle||0))*Math.PI/180));
  function path(c,x0,x1,fn,col,w=2,dash=[]){
    const pts=[];for(let x=x0;x<x1;x+=2)pts.push([x,fn(x)]);pts.push([x1,fn(x1)]);
    line(c,pts,col,w,dash);
  }
  const turns=Array.from({length:7},(_,i)=>84+11*i);
  const cell=[552,760],collector=[786,923],channel=[936,1067];
  function sectionX(x,inverse=false){
    const anchors=[[28,3],[58,54],[84,125],[150,355],[285,748],[295,993],[310,1018]];
    for(let i=1;i<anchors.length;i++){
      const [x1,d1]=inverse?anchors[i-1].slice().reverse():anchors[i-1];
      const [x2,d2]=inverse?anchors[i].slice().reverse():anchors[i];
      if(x<=x2)return d1+(d2-d1)*(x-x1)/(x2-x1);
    }
    return beamX(x);
  }
  function outerCloud(c,x,y,amount){
    if(amount<=0)return;
    c.save();c.translate(x,y);c.scale(70,48);c.globalAlpha*=amount;
    const wash=c.createRadialGradient(0,0,0,0,0,1);
    wash.addColorStop(0,'#7694bb35');
    wash.addColorStop(.55,'#7694bb30');
    wash.addColorStop(1,'#7694bb00');
    dot(c,0,0,1,wash);c.restore();
  }
  function electronCloud(c,x,y,r=29){
    const wash=c.createRadialGradient(x,y,0,x,y,r);
    wash.addColorStop(0,'#ede8f5');wash.addColorStop(.65,'#d9cdebbf');wash.addColorStop(1,'#b6a2ce85');
    dot(c,x,y,r,wash);circle(c,x,y,r,'#fffffff2',3);circle(c,x,y,r,'#74608e',1.2);
  }
  function nucleus(c,x,y){
    sphere(c,x-4,y-1,9,'#eb746c','#942b35');sphere(c,x+5,y+1,8.4,'#a6a8a9','#45505a');
  }
  function electron(c,x,y){
    sphere(c,x,y,4.8,'#126bc3','#154776');
  }
  function atom(c,x,y,n,t,scale=1,outer=n===2?1:0){
    c.save();c.translate(x,y);c.scale(scale,scale);
    if(outer)outerCloud(c,0,0,outer);
    if(n)electronCloud(c,0,0);
    nucleus(c,0,0);
    for(let i=0;i<n;i++){
      electron(c,...InjectorSource.boundElectron([0,0],t,i));
    }
    c.restore();
  }
  function tail(c,point,start,end,color,width,segments=16){
    if(end<=start)return;
    c.save();c.lineCap='round';c.strokeStyle=color;
    const opacity=c.globalAlpha;
    let prev=point(start);
    for(let i=1;i<=segments;i++){
      const u=i/segments,next=point(start+(end-start)*u),weight=u*u;
      c.globalAlpha=opacity*.8*weight;c.lineWidth=.3+width*weight;
      c.beginPath();c.moveTo(...prev);c.lineTo(...next);c.stroke();prev=next;
    }
    c.restore();
  }
  const sourceArt={coilTurns:turns.map(x=>sectionX(x)),line,dot,circle,sphere,plate:solidPlate,arrow,label,tail,atom,electronCloud,nucleus,electron};
  const beamCount=45;
  function neighbour(index,seconds,gas){
    const x=295+(seconds*24.6+index*805/beamCount)%805;
    // Illustrative outcomes: roughly half the neighbours leave as neutrals.
    const branch=gas?[0,1,0,-1][index%4]:1;
    const firstLoss=561+(index*67)%156;
    const secondLoss=firstLoss+18+(index*13)%22;
    let electrons=2;
    if(branch!==1 && x>=firstLoss)electrons=1;
    if(branch===-1 && x>=secondLoss)electrons=0;
    return {x,branch,electrons};
  }
  function greyParticle(c,x,y,n,phase){
    if(n){
      dot(c,x,y,6.4,'#e2dee8aa');circle(c,x,y,6.4,'#978da280',.6);
    }
    dot(c,x-1.6,y,3.1,'#68777e');dot(c,x+1.8,y+.6,2.8,'#929da2');
    for(let i=0;i<n;i++){
      const a=phase*8+i*Math.PI;
      dot(c,x+8*Math.cos(a),y+5*Math.sin(a),1.5,'#788a92');
    }
  }
  // Fixed positions in the longitudinal detail; the tracked particle and the
  // hardware use the same mapping on both sides of every station boundary.
  function beamX(x){
    if(x<310)return 868+(x-295)*10;
    if(x<=birthX)return 1018+(x-310)*2.2;
    return beamX(birthX)+(x-birthX)*9;
  }
  function smooth(t,a,b){
    const u=Math.max(0,Math.min(1,(t-a)/(b-a)));
    return u*u*(3-2*u);
  }
  const plasmaX=beamX(birthX)+115,plasmaY=68,plasmaRadius=245;
  const birthAngle=Math.atan2(218-plasmaY,-115),orbitRadius=Math.hypot(115,218-plasmaY);
  function orbitPoint(u,gyration){
    const a=birthAngle-234*u/orbitRadius,r=orbitRadius+(gyration?22*Math.sin(tau*u):0);
    return [plasmaX+r*Math.cos(a),plasmaY+r*Math.sin(a)];
  }
  function focusParticle(f){
    if(f.t<.34){
      const source=InjectorSource.sourceFrame(f.t);
      if(f.t<.080){
        const p=f.t<.02?InjectorSource.inPlane(source.incident,60):InjectorSource.incidentWorld(f.t);
        return detailProjector(f.t)(p);
      }
      return f.t<.10?source.incident:source.tracked;
    }
    if(f.t>=.94)return orbitPoint((f.t-.94)/.06,true);
    return [beamX(f.x),218+(f.electrons===2?45*deflection(f.x)/37:0)];
  }
  function camera(f){
    const t=f.t,arrival=approach(t),collision=smooth(t,.053,.084),surface=smooth(t,.202,.246);
    const exit=smooth(t,.286,.34),z=1+.42*collision+.43*surface;
    const sourceX=(460-92*collision)*(1-surface)+688*surface;
    const sourceY=(177+16*collision)*(1-surface)+(145+66*smooth(t,.27,.313))*surface;
    const target=t<.34?InjectorSource.sourceFrame(t).tracked[0]:beamX(f.x);
    const orbit=t>=.94?orbitPoint((t-.94)/.06,false):null;
    return {x:orbit?orbit[0]:(sourceX+(target-sourceX)*exit)+(1320-sourceX)*(1-arrival)**2.6,
      y:orbit?orbit[1]:sourceY+(218-sourceY)*exit+42*(1-arrival),zoom:.32*(1-arrival)+z*arrival+.26*frontView(t)+.32*smooth(t,.86,.98)};
  }
  // One section boundary surrounds the source, vacuum line and the schematic
  // slice of the tokamak. There is no transverse wall across the entry port.
  function detailVessel(c,y){
    const mouth=sectionX(channel[1]);
    c.save();
    // The wall opens at the tangent port into the equatorial plasma section.
    const upper=Math.PI-Math.asin((y-45-plasmaY)/plasmaRadius);
    const lower=Math.PI-Math.asin((y+45-plasmaY)/plasmaRadius);
    c.beginPath();c.moveTo(mouth,y-45);c.arc(plasmaX,plasmaY,plasmaRadius,upper,lower+tau);
    c.lineTo(mouth,y+45);c.fillStyle='#e0e9ea';c.fill();c.strokeStyle=steel;c.lineWidth=6;c.stroke();
    const plasma=c.createRadialGradient(plasmaX,plasmaY,95,plasmaX,plasmaY,plasmaRadius);
    plasma.addColorStop(0,'#dbc6db30');plasma.addColorStop(.57,'#dfc1db');
    plasma.addColorStop(1,'#ead7e900');
    dot(c,plasmaX,plasmaY,plasmaRadius,plasma);
    dot(c,plasmaX,plasmaY,92,'#edf4f4');circle(c,plasmaX,plasmaY,95,steel,6);
    c.restore();
  }
  // Teaching-scale exterior. All axial interfaces use the cutaway's station map.
  // Faces keep their world coordinates for lighting, visibility and depth order.
  const driverEnd=sectionX(174),start=sectionX(58),gridEnd=sectionX(530);
  const cellEnd=sectionX(cell[1]),collectorEnd=sectionX(collector[1]),out=sectionX(channel[1]);
  const sections=[[driverEnd,sectionX(285),164,164],[sectionX(285),gridEnd,153,153],
      [gridEnd,cellEnd,137,161],[cellEnd,collectorEnd,137,161]];
  function injectorExterior(){
    const faces=[],copper=[181,113,68];
    const steelRGB=[151,174,182],dark=[87,112,123],flange=[181,195,198],ceramic=[218,213,195];
    function face(points,color,alpha=1){
      const centre=[0,1,2].map(k=>points.reduce((sum,p)=>sum+p[k],0)/points.length);
      const a=points[0],b=points[1],d=points.at(-1);
      const u=b.map((v,k)=>v-a[k]),v=d.map((n,k)=>n-a[k]);
      const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      const len=Math.hypot(...n)||1;
      const light=.82+.21*(-.24*n[0]-.86*n[1]-.45*n[2])/len;
      faces.push({points,centre,n,rgb:color.map(x=>light*x/255),color:'rgb('+color.map(x=>Math.round(x*light)).join(',')+')',alpha:color===copper?.78:alpha});
    }
    function loft(a,b,color,alpha){
      face(a.slice().reverse(),color,alpha);face(b,color,alpha);
      a.forEach((p,i)=>{const j=(i+1)%a.length;face([p,a[j],b[j],b[i]],color,alpha);});
    }
    function housing(x1,x2,y,h,z,w,color,bevel=5){
      function end(x){return [[-h+bevel,-w],[h-bevel,-w],[h,-w+bevel],[h,w-bevel],
        [h-bevel,w],[-h+bevel,w],[-h,w-bevel],[-h,-w+bevel]].map(([dy,dz])=>[x,y+dy,z+dz]);}
      loft(end(x1),end(x2),color);
    }
    function tube(start,end,r,color,count=64){
      const dir=end.map((v,i)=>v-start[i]),len=Math.hypot(...dir);
      const [a,b,d]=dir.map(v=>v/len),rad=Math.hypot(a,b);
      const u=rad?[b/rad,-a/rad,0]:[1,0,0];
      const v=[b*u[2]-d*u[1],d*u[0]-a*u[2],a*u[1]-b*u[0]];
      const rim=p=>Array.from({length:count},(_,i)=>p.map((n,k)=>n+r*(u[k]*Math.cos(tau*i/count)+v[k]*Math.sin(tau*i/count))));
      loft(rim(start),rim(end),color);
    }
    function axial(x1,x2,y,r,color){tube([x1,y,0],[x2,y,0],r,color);}
    axial(6,start,184,43,flange);axial(start,driverEnd,184,128,ceramic);
    for(const x of [start,driverEnd-10])axial(x,x+12,184,143,flange);
    const pitch=sourceArt.coilTurns[1]-sourceArt.coilTurns[0];
    // A continuous tubular helix, including its two terminal leads.
    const first=sourceArt.coilTurns[0]-pitch/2;
    let previous;
    const steps=turns.length*72,sides=12;
    for(let i=0;i<=steps;i++){
      const a=tau*i/72,ca=Math.cos(a),sa=Math.sin(a),lead=pitch/tau;
      const scale=Math.hypot(137,lead),x=first+lead*a,y=184+137*ca,z=137*sa;
      const ring=Array.from({length:sides},(_,j)=>{
        const u=6.5*Math.cos(tau*j/sides),v=6.5*Math.sin(tau*j/sides);
        const offset=[-137*v/scale,ca*u-lead*sa*v/scale,sa*u+lead*ca*v/scale];
        const point=[x+offset[0],y+offset[1],z+offset[2]];
        point.normal=offset.map(n=>n/6.5);
        return point;
      });
      if(previous)ring.forEach((p,j)=>{
        const k=(j+1)%sides;face([previous[j],previous[k],ring[k],p],copper);
      });
      if(i===0 || i===steps)tube([x,y,z],[x,350,-32],6.5,copper,16);
      previous=ring;
    }
    for(const [x1,x2,h,w] of sections){
      housing(x1,x2,218,h,0,w,steelRGB,22);
      for(const x of [x1+6,x2-19]){
        housing(x,x+12,218,h+7,0,w+8,flange,23);
        for(const y of [218-h+43,218,218+h-43])
          tube([x+6,y,-w-7],[x+6,y,-w-14],5,dark,6);
      }
      const mid=(x1+x2)/2;
      // Stiffeners break up the flat vessel walls between the service flanges.
      const count=Math.floor((x2-x1)/160);
      for(let i=1;i<=count;i++){
        const x=x1+(x2-x1)*i/(count+1);
        housing(x-4,x+4,218,h+3,0,w+4,[133,153,163],22);
      }
      // Bolted inspection cover on the near wall and a capped roof port.
      housing(mid-68,mid+68,218,65,-w-5,6,flange,5);
      tube([mid,218,-w-7],[mid,218,-w-24],42,dark);
      tube([mid,218,-w-24],[mid,218,-w-30],48,flange);
      for(let k=0;k<8;k++){
        const a=tau*k/8,x=mid+39*Math.cos(a),y=218+39*Math.sin(a);
        tube([x,y,-w-30],[x,y,-w-34],4,dark,6);
      }
      tube([mid,218-h,0],[mid,218-h-34,0],32,dark);
      tube([mid,218-h-34,0],[mid,218-h-43,0],42,flange);
      for(const z of [-93,93]){
        const base=448,top=218+h-5;
        housing(mid-21,mid+21,(base+top)/2,(base-top)/2,z,18,dark,2);
        housing(mid-42,mid+42,454,6,z,33,flange,2);
      }
    }
    // Two visible jacket connections along the neutralizer and ion collector.
    // The bends terminate on the housings, so both ends of each run are visible.
    for(const [offset,level] of [[0,0],[27,18]]){
      const left=gridEnd+80+offset,right=collectorEnd-68-offset,y=294+level;
      const run=[[left,y,-151],[left,y,-190],[left+17,y,-205],
        [right-17,y,-205],[right,y,-190],[right,y,-151]];
      for(let i=1;i<run.length;i++)tube(run[i-1],run[i],5,[164,179,182],10);
      for(const x of [left,right])tube([x,y,-159],[x,y,-169],12,dark,12);
      for(let x=left+110;x<right-40;x+=180)housing(x-3,x+3,y,9,-184,25,dark,2);
    }
    // Ceramic feedthrough and its terminal above the acceleration section.
    const feed=sectionX(393);
    tube([feed,67,0],[feed,-8,0],14,ceramic);
    for(let j=0;j<5;j++)tube([feed,51-12*j,0],[feed,46-12*j,0],23,ceramic);
    tube([feed,-8,0],[feed,-20,0],12,dark);
    housing(driverEnd-30,collectorEnd+35,466,9,-93,20,dark,2);
    housing(driverEnd-30,collectorEnd+35,466,9,93,20,dark,2);
    function outlet(x1,x2,r,inner,color){
      const ring=(x,radius)=>Array.from({length:96},(_,i)=>[x,218+radius*Math.cos(tau*i/96),radius*Math.sin(tau*i/96)]);
      const a=ring(x1,r),b=ring(x2,r),c=ring(x1,inner),d=ring(x2,inner);
      a.forEach((p,i)=>{
        const j=(i+1)%a.length;
        face([p,a[j],b[j],b[i]],color);face([c[i],d[i],d[j],c[j]],dark);
        face([b[i],b[j],d[j],d[i]],color);face([a[j],p,c[i],c[j]],color);
      });
    }
    outlet(collectorEnd,out-14,54,45,steelRGB);
    for(const x of [collectorEnd+10,sectionX(975),out-14])outlet(x,x+14,72,45,flange);
    for(let i=0;i<8;i++)outlet(out-102+i*9,out-98+i*9,60,54,dark);
    const firstInternal=faces.length;
    const plate3=(x1,x2,top,bottom,depth,color=steelRGB)=>
      housing(x1,x2,(top+bottom)/2,(bottom-top)/2,0,depth,color,1);
    for(const [top,bottom] of [[54,160],[276,318]]){
      plate3(748,844,top,bottom,32);
      plate3(744,748,top,bottom,32,[202,161,91]);
    }
    for(const gx of [993,...grids.slice(2).map(beamX)]){
      for(const [top,bottom] of [[110,160],[276,310]])plate3(gx-2,gx+3,top,bottom,32,ceramic);
      for(const top of [138,276])plate3(gx-3,gx+4,top,top+22,33);
    }
    for(const side of [-1,1]){
      const a=184+side*134-2,b=218+side*111-2;
      plate3(sectionX(58),sectionX(285),a,a+5,24);
      plate3(sectionX(285),sectionX(530),b,b+5,24);
    }
    for(const dy of [-51,46])plate3(beamX(cell[0]),beamX(cell[1]),218+dy,224+dy,36);
    for(const dy of [-51,45])plate3(beamX(collector[0]),beamX(collector[1]),218+dy,224+dy,36,
      dy>0?[192,151,129]:steelRGB);
    for(const dy of [-40,40])plate3(beamX(channel[0]),beamX(channel[1]),218+dy,223+dy,24);
    for(let i=firstInternal;i<faces.length;i++)faces[i].internal=true;
    return faces;
  }
  const exterior=injectorExterior();
  // A depth buffer resolves intersecting flanges, winding and the near cover.
  // Only the exterior needs a 3D surface. The cutaway stays on its teaching canvas.
  const shellLayers=new WeakMap();
  function makeShellLayer(){
    const canvas=document.createElement('canvas');
    const gl=canvas.getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:true});
    if(!gl || typeof gl.createShader!=='function')return null;
    function shader(type,source){
      const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);
      return sh;
    }
    const program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,`
      attribute vec3 vertex, material, normal;

      uniform vec4 camera;
      uniform vec2 screen;
      uniform float reveal; uniform highp float frontView;
      varying vec3 color, world; varying float rim;

      void main(){
        float yaw=.54-.09*reveal, pitch=.39-.18*reveal;
        float cy=cos(yaw),sy=sin(yaw),cp=cos(pitch),sp=sin(pitch);
        float pivot=1320.*(1.-reveal);
        vec3 p=vertex-vec3(pivot,200.,0.);
        vec2 iso=vec2(pivot+cy*p.x+sy*p.z,200.+sy*sp*p.x+cp*p.y-cy*sp*p.z);
        vec2 cut=vertex.xy+vec2(.48,-.19)*vertex.z*camera.w;
                vec2 projected=mix(iso,cut,reveal);
        float a=-1.5707963268*frontView;
        vec2 frontal=vec2(200.+(vertex.x-200.)*cos(a)+vertex.z*sin(a)+245.*frontView,vertex.y);
        float perspective=1.+frontView*.0014*(vertex.x-200.);
        projected=vec2(445.,184.)+(mix(projected,frontal,frontView)-vec2(445.,184.))/perspective;
        vec2 pos=(projected-camera.xy)*camera.z/screen*2.;
        vec3 eye=normalize(mix(vec3(sy*cp,-sp,-cy*cp),vec3(.48*camera.w,-.19*camera.w,-1.),reveal));
        eye=normalize(mix(eye,vec3(-1.,0.,0.),frontView));
        float depth=dot(vertex,eye);
        gl_Position=vec4(pos.x,-pos.y,-depth/5000.,1.);
        world=vertex;
        rim=pow(max(0.,1.-abs(dot(normal,eye))),2.);
        color=material;

      }`));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
      precision mediump float;
      varying vec3 color, world; varying float rim;

      uniform float coating, openAmount, side, sectionMix; uniform highp float frontView;
      void main(){
        if(side*mix(world.z,world.x-200.,frontView)<0.)discard;
        float opacity=.10+.24*rim;
        if(coating<1.){
          opacity=mix(.28,side<0.?.46:.88,sectionMix);
        }
        if(world.y>380.) opacity=.92;
                float alpha=mix(coating,opacity,openAmount);
        alpha*=1.-frontView*(1.-smoothstep(48.,100.,world.x));
        alpha*=1.-frontView*smoothstep(395.,510.,world.x);
        if(alpha<.005)discard;
        gl_FragColor=vec4(color*alpha,alpha);
      }`));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
    gl.useProgram(program);
    const data=[],copperData=[],inside=[];
    for(const f of exterior){

      const norm=f.n.map(v=>v/(Math.hypot(...f.n)||1));
      for(let i=1;i+1<f.points.length;i++)
        for(const p of [f.points[0],f.points[i],f.points[i+1]]){
          const n=p.normal||norm;
          const light=.82+.21*(-.24*n[0]-.86*n[1]-.45*n[2]);
          const rgb=p.normal?[181,113,68].map(v=>v*light/255):f.rgb;
          (f.internal?inside:f.alpha<1?copperData:data).push(...p,...rgb,...n);
        }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data.concat(copperData,inside)),gl.STATIC_DRAW);
    for(const [name,n,offset] of [['vertex',3,0],['material',3,12],['normal',3,24]]){
      const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc,n,gl.FLOAT,false,36,offset);
    }
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
    const size=gl.getUniformLocation(program,'screen'),camera=gl.getUniformLocation(program,'camera');
    const opening=gl.getUniformLocation(program,'reveal'),count=data.length/9,coating=gl.getUniformLocation(program,'coating');
    const side=gl.getUniformLocation(program,'side'),openingAlpha=gl.getUniformLocation(program,'openAmount');
    const flat=gl.getUniformLocation(program,'sectionMix'),frontUniform=gl.getUniformLocation(program,'frontView');
    return (c,r,x,y,s,w,h,tilt,reveal,pass,front)=>{
      if(gl.isContextLost())return false;
      const width=c.canvas.width,height=c.canvas.height;
      if(canvas.width!==width || canvas.height!==height){canvas.width=width;canvas.height=height;}
      gl.viewport(0,0,width,height);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform2f(size,w,h);gl.uniform4f(camera,x,y,s,tilt);gl.uniform1f(opening,r);gl.uniform1f(frontUniform,front);
      if(pass===2){
        gl.uniform1f(side,0);gl.uniform1f(openingAlpha,0);gl.uniform1f(flat,0);gl.uniform1f(coating,1);
        gl.drawArrays(gl.TRIANGLES,(data.length+copperData.length)/9,inside.length/9);
      }else{
      gl.uniform1f(side,pass);gl.uniform1f(openingAlpha,reveal);gl.uniform1f(flat,1-tilt);
      gl.uniform1f(coating,1);gl.drawArrays(gl.TRIANGLES,0,count);
      // Resolve the nearest copper surface before blending. Back-facing
      // triangles of a turn must not accumulate tint through its front face.
      gl.uniform4f(camera,x,y,s,tilt);
      gl.uniform1f(coating,.85);gl.colorMask(false,false,false,false);gl.drawArrays(gl.TRIANGLES,count,copperData.length/9);
      gl.colorMask(true,true,true,true);
      gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES,count,copperData.length/9);gl.disable(gl.BLEND);
      }
      c.drawImage(canvas,x-w/(2*s),y-h/(2*s),w/s,h/s);
      return true;
    };
  }
  function approach(t){return smooth(t,.001,.009);}
  function frontView(t){return approach(t)*(1-smooth(t,.053,.080));}
  function detailProjector(t){return shellProjector(approach(t),0,frontView(t));}
  // A shallow oblique projection keeps the pitch visible in the longitudinal cutaway.
  function windingTilt(tilt){return .34+.66*tilt;}
  function shellProjector(angle,tilt,front=0){
    const yaw=.54-.09*angle,pitch=.39-.18*angle;
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),pivot=1320*(1-angle);
    return ([x,y,z])=>{
      const px=(pivot+(x-pivot)*cy+z*sy)*(1-angle)+(x+.48*z*tilt)*angle;
      const py=(200+(x-pivot)*sy*sp+(y-200)*cp-z*cy*sp)*(1-angle)+(y-.19*z*tilt)*angle;
      if(!front)return [px,py];
      const a=-Math.PI*front/2,perspective=1/(1+front*.0014*(x-200));
      const u=200+(x-200)*Math.cos(a)+z*Math.sin(a)+245*front;
      return [445+((px*(1-front)+u*front)-445)*perspective,
        184+((py-184)*(1-front)+(y-184)*front)*perspective];
    };
  }
  const shellImages=new WeakMap();
  function drawExterior(c,angle,x,y,s,w,h,tilt,reveal,pass,front){
    if(!shellImages.has(c))shellImages.set(c,new Map());
    const images=shellImages.get(c);
    if(!images.has(pass))images.set(pass,{canvas:document.createElement('canvas')});
    const entry=images.get(pass),canvas=entry.canvas;
    // The parent includes CSS/full-screen scaling and device pixel density.
    const ratio=(c.getTransform?.()?.a||s)/s;
    const key=[angle,x,y,s,w,h,tilt,reveal,ratio,front].join('/');
    if(entry.key!==key){
      canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));
      const ctx=canvas.getContext('2d');
      ctx.setTransform(ratio*s,0,0,ratio*s,ratio*(w/2-x*s),ratio*(h/2-y*s));
      if(!shellLayers.has(c))shellLayers.set(c,makeShellLayer());
      const layer=shellLayers.get(c);
      if(!layer || !layer(ctx,angle,x,y,s,w,h,tilt,reveal,pass,front))
        paintExterior(ctx,angle,tilt,reveal,pass,front);
      entry.key=key;
    }
    c.drawImage(canvas,x-w/(2*s),y-h/(2*s),w/s,h/s);
  }
  function paintExterior(c,angle,tilt,reveal,pass,front){
    const project=shellProjector(angle,tilt,front);
    const projectWinding=shellProjector(angle,tilt,front);
    const depth=p=>(p[0]*.45-p[1]*.25-p[2]*.86)*(1-front)-p[0]*front;
    const visible=exterior.filter(f=>depth(f.n)>0).sort((a,b)=>depth(a.centre)-depth(b.centre));
    c.save();
    for(const f of visible){
      if(Boolean(f.internal)!==(pass===2))continue;
      if(pass!==2 && pass*(f.centre[2]*(1-front)+(f.centre[0]-200)*front)<0)continue;
      const edge=1-Math.min(1,Math.abs(depth(f.n))/(Math.hypot(...f.n)||1));
      const restored=pass<0?.46:.88;
      const ghost=f.centre[1]>380?.92:f.alpha<1?restored+(.28-restored)*tilt:.10+.24*edge*edge;
      c.globalAlpha=(pass===2?1:f.alpha+(ghost-f.alpha)*reveal)*(1-front*(1-smooth(f.centre[0],48,100)))*(1-front*smooth(f.centre[0],395,510));
      const toScreen=f.alpha<1?projectWinding:project;
      c.beginPath();f.points.forEach((p,i)=>i?c.lineTo(...toScreen(p)):c.moveTo(...toScreen(p)));
      c.closePath();c.fillStyle=f.color;c.fill();c.strokeStyle=f.color;c.lineWidth=1;c.stroke();
    }
    c.restore();
  }
  function micro(c,w,h,f,gas,zoom,cam,overview=false,vectorRF=false){
    const t=f.t,y=218,s=Math.min(w/920,h/354)*zoom;
    const right=beamX(birthX+26)+140,half=w/(2*s);
    const focusX=cam.x,focusY=cam.y;
    const cx=right<=2*half?right/2:Math.max(half,Math.min(right-half,focusX));
    c.save();c.translate(w/2,h/2);c.scale(s,s);c.translate(-cx,-focusY);
    const front=overview?0:frontView(t);
    const angle=approach(t),reveal=smooth(t,.011,.017);
    const tilt=overview?1-smooth(t,.117,.141):0;
    if(overview && reveal<1){
      c.save();c.beginPath();c.rect(out,-300,right-out+400,950);c.clip();
      detailVessel(c,y);
      for(const a of coilAngles){
        c.save();c.translate(plasmaX,plasmaY);c.rotate(a);c.globalAlpha=.38;
        plate(c,plasmaRadius*.32,-3,plasmaRadius*.76,6);c.restore();
      }
      c.restore();
    }
    const annotations=[];
    drawExterior(c,angle,cx,focusY,s,w,h,tilt,reveal,reveal>0?1:0,front);
    if(reveal>0){
    c.save();
    detailVessel(c,y);
    const label=overview?((ctx,words,x,y)=>y):detailLabeler(annotations);
    drawExterior(c,angle,cx,focusY,s,w,h,tilt,reveal,2,front);
    if(cx-half<920 && front<.05)InjectorSource.draw(c,f,{...sourceArt,label,tilt,overview,vectorRF},Math.max(1,zoom),focusY);
    if(cx+half>=850 && front<.05){
      const chamber=beamX(661),entry=beamX(793),dump=beamX(dumpX),birth=beamX(birthX);
      const end=beamX(980),bend=45;
      // All stations are present even when a neighbouring station is in focus.
      label(c,'Extrakce',930,y-72);
      label(c,'Urychlovací mřížky',beamX(409),y-72);
      arrow(c,960,y+45,-48,0,electric);
      for(const gx of grids.slice(2))arrow(c,beamX(gx)-14,y+45,-38,0,electric);
      if(t>=.34 && t<.38){
        circle(c,950,153,5,magnetic,1.4);dot(c,950,153,1.5,magnetic);
        label(c,'B',939,157,magnetic,12,'right');
        tail(c,InjectorSource.ejected,t-.011,t,'#1882ae',3.3);
        electron(c,...InjectorSource.ejected(t));
      }
      label(c,gas?'Neutralizátor · molekulární deuterium':'Neutralizátor · bez plynu',chamber,y-72);
      if(gas){
        for(let i=0;i<14;i++){
          const gasPoint=v=>[beamX(563)+(i*67)%396+6*Math.sin(7*v+i),y+(i%2?32:-30)+4*Math.sin(11*v+i)];
          const [x,py]=gasPoint(t);
          tail(c,gasPoint,Math.max(0,t-.045),t,'#a8bcbf',1.6,5);
          dot(c,x,py,2.8,'#a8bcbf');dot(c,x+4,py+1,2.8,'#b1c5c7');
        }
        const after=smooth(t,.65,.73);
        const [x,py]=InjectorSource.boundElectron([chamber,y],.65,1);
        const gasX=x+7+9*after,gasY=py-5-14*after;
        c.save();c.translate(gasX+5.5,gasY-1);c.scale(.58,.38);
        electronCloud(c,0,0);c.restore();
        for(const [px,py] of [[gasX,gasY],[gasX+11,gasY-2]]){
          c.save();c.translate(px,py);c.scale(.38,.38);
          nucleus(c,0,0);electron(c,...InjectorSource.boundElectron([0,0],t,0));c.restore();
        }
      }
      label(c,'Iontová past',dump-74,y-72);
      if(gas)label(c,'Kladné ionty',beamX(collector[1])+15,y-bend,positive,12,'left');
      label(c,'Záporné ionty',beamX(collector[1])+15,y+bend+7,negative,12,'left');
      arrow(c,entry-22,y+28,0,-46,electric);
      for(const branch of gas?[-1,0,1]:[1]){
        const col=branch<0?positive:branch>0?negative:neutral;
        path(c,entry,branch?dump:end,x=>y+branch*bend*((x-entry)/(dump-entry))**2,col,1.4);
      }
      // Each neighbour travels through the source exit, gas cell and separator
      // on one clock. A collector terminates the path at its inner face.
      const beamEnd=beamX(1100);
      for(let i=0;i<beamCount;i++){
        const state=neighbour(i,f.playSeconds,gas),x=beamX(state.x),branch=state.branch;
        if(branch && x>=dump)continue;
        const py=px=>{
          const spread=(i%5-2)*3*(1-smooth(px,entry-36,entry));
          const u=Math.max(0,(px-entry)/(dump-entry));
          return y+spread+branch*bend*u*u;
        };
        const separation=smooth(x,entry-32,entry+10);
        const col=[positive,neutral,negative][state.electrons];
        c.save();c.globalAlpha=(.42+.41*separation)*Math.min(1,(x-868)/18,(beamEnd-x)/24);
        tail(c,v=>[v,py(v)],Math.max(868,x-28),x,separation?col:'#74858c',2.8,10);
        if(separation){
          atom(c,x,py(x),state.electrons,t+i,.43);
        }else greyParticle(c,x,py(x),state.electrons,t+i);
        c.restore();
      }
      label(c,'Výstupní kanál',end+75,y-72);
      for(const a of coilAngles){
        c.save();c.translate(plasmaX,plasmaY);c.rotate(a);c.globalAlpha=.38;
        plate(c,plasmaRadius*.32,-3,plasmaRadius*.76,6);c.restore();
      }
      for(const radius of [134,162,orbitRadius,216]){
        circle(c,plasmaX,plasmaY,radius,magnetic+'78',1);
      }
      // Keep the name in the clear margin outside the ring. At high zoom
      // the lower tangent normally leaves room below the vessel.
      const bottom=focusY+h/(2*s),outerBottom=plasmaY+plasmaRadius;
      if(bottom>outerBottom+24 && cx+half>plasmaX-180){
        label(c,'Plazma tokamaku',plasmaX,outerBottom+21,ink,15);
      }else{
        label(c,'Plazma tokamaku',plasmaX-254,y-102,ink,15,'right');
      }
      // One existing plasma electron supplies the later ionizing collision.
      const partner=32;
      const [impactX,impactY]=InjectorSource.boundElectron([birth,y],.94,0);
      function plasmaPoint(i,v){
        const r=116+(i*37)%104;
        const a=i*2.39996+v*(i%2?-.95:.68);
        return [plasmaX+r*Math.cos(a),plasmaY+r*Math.sin(a)];
      }
      function incoming(v){
        if(v<=.90)return plasmaPoint(partner,v);
        if(v>=.94){const u=(v-.94)/.06;return [impactX-81*u,impactY-36*u];}
        const [px,py]=plasmaPoint(partner,.90),u=(v-.90)/.04;
        return [px+(impactX-px)*u,py+(impactY-py)*u];
      }
      for(let i=0;i<46;i++){
        if(i===partner)continue;
        const [px,py]=plasmaPoint(i,t);
        c.save();c.globalAlpha=.48;
        tail(c,v=>plasmaPoint(i,v),Math.max(0,t-.035),t,'#84939a',1.7,5);
        if(i%2)greyParticle(c,px,py,0,0);else sphere(c,px,py,2.1,'#98a1a6');
        c.restore();
      }
      if(t<.94){
        const highlight=smooth(t,.88,.906);
        tail(c,incoming,Math.max(0,t-.012),t,'#267db5',1.7+1.6*highlight);
        sphere(c,...incoming(t),2.1+2.7*highlight,highlight?'#3992d0':'#98a1a6');
      }
      if(t>=.34){
        let x=beamX(f.x),py=y+(gas?0:bend*deflection(f.x)/37);
        // The imposed flight position is independent of the voltage setting.
        const past=v=>{
          if(v<.34)return InjectorSource.sourceFrame(v).tracked;
          if(v>=.94)return orbitPoint((v-.94)/.06,true);
          const px=InjectorModel.sample(v,1,gas).x;
          return [beamX(px),y+(gas?0:bend*deflection(px)/37)];
        };
        tail(c,past,t-.014,t,f.electrons===0?positive:f.electrons===1?neutral:negative,5);
        if(t>=.94){
          const u=(t-.94)/.06;
          const orbit=v=>orbitPoint(v,true);
          line(c,Array.from({length:65},(_,i)=>orbit(u*i/64)),positive+'55',1);
          [x,py]=orbit(u);
          tail(c,v=>[impactX-78*v,impactY+43*v],Math.max(0,u-.38),u,'#267db5',3.3);
          tail(c,incoming,t-.012,t,'#267db5',3.3);
        }
        atom(c,x,py,f.electrons,t);
        if(gas && t>=.65 && t<.73){
          const u=(t-.65)/.08,[ex,ey]=InjectorSource.boundElectron([chamber,y],.65,1);
          const stripped=v=>[ex-60*v,ey+(y-45+4.8-ey)*v];
          tail(c,stripped,Math.max(0,u-.38),u,'#267db5',3.3);
          electron(c,...stripped(u));
        }
        if(t>=.94){
          const u=(t-.94)/.06;
          electron(c,impactX-78*u,impactY+43*u);
          electron(c,...incoming(t));
        }
      }
    }
    c.restore();
    }
    if(reveal>0)drawExterior(c,angle,cx,focusY,s,w,h,tilt,reveal,-1,front);
    for(const [alpha,...args] of annotations){
      c.save();c.globalAlpha=alpha;label(c,...args);c.restore();
    }
    if(reveal<1 && !vectorRF){
      const project=shellProjector(angle,tilt,front);
      InjectorSource.drawField(c,t,(x,r,a)=>project([x,184+r*Math.cos(a),r*Math.sin(a)]),line,1-reveal,Math.min(3,Math.max(1,1/s)));
    }
    c.restore();
    return {x:cx,y:focusY,scale:s};
  }
  function drawOverview(c,w,h,f,gas){
    const right=plasmaX+plasmaRadius+45,scale=Math.min(w/(right+60),(h-25)/820);
    if(scale<=0)return;
    c.save();c.translate(0,22);
    const view=micro(c,w,h-22,f,gas,scale/Math.min(w/920,(h-22)/354),{x:right/2,y:184},true);
    c.restore();
    const marks=[[210,'RF zdroj'],[sectionX(405),'Urychlovač'],[sectionX(650),'Neutralizátor'],
      [sectionX(850),'Iontová past'],[sectionX(1000),'Kanál'],[plasmaX,'Tokamak']];
    const active=f.t<.34?0:f.t<.57?1:f.t<.73?2:f.t<.84||f.impact?3:f.t<.9?4:5;
    const size=Math.min(13,w/61);
    c.font='600 '+size+'px "Segoe UI",sans-serif';
    const widths=marks.map(([,name])=>c.measureText(name)?.width??name.length*size*.55);
    let edge=0;
    marks.forEach(([x,name],i)=>{
      const px=Math.max(w/2+(x-view.x)*scale,edge+widths[i]/2+8);
      edge=px+widths[i]/2;
      label(c,name,px,15,ink,size);
      if(i===active)line(c,[[px-18,19],[px+18,19]],ink,2);
    });
    if(f.t>=.017){
      const [x,y]=f.t<.1?InjectorSource.sourceFrame(f.t).incident:focusParticle(f);
      circle(c,w/2+(x-view.x)*scale,22+(h-22)/2+(y-view.y)*scale,5,ink,1.4);
    }
  }
  return {frontView,detailProjector,shellProjector,overview:drawOverview,micro,camera,focusParticle,beamCount,neighbour,line,dot,ink,neutral};
})();
