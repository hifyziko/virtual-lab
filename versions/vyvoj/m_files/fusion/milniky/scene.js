'use strict';
(() => {
  const cutScale = 'translate(318 235) scale(1.17) translate(-318 -235)';
  const layer = id => document.getElementById(id);
  function element(parent, tag, attributes) {
    const node = document.createElementNS('http://www.w3.org/2000/svg',tag);
    for (const [key,value] of Object.entries(attributes)) node.setAttribute(key,value);
    parent.append(node);
    return node;
  }
  function path(parent,d,fill='none',stroke='#587482',width=1.3,extra={}) {
    return element(parent,'path',{d,fill,stroke,'stroke-width':width,'stroke-linejoin':'round','stroke-linecap':'round',...extra});
  }
  const metal='url(#metal)', housing='url(#housing)', copper='url(#copper)';
  const electric='#336c59', steam='#8998b0', hot='#cc6945', cold='#427f9f', teal='#1d9299';
  const floor=layer('foundation'), routes=layer('circuits'), reactor=layer('reactor'), machines=layer('machines');
  const heat=layer('heating'), labels=layer('labels');
  reactor.setAttribute('transform',cutScale);
  function text(x,y,content,minor=false,anchor='start') {
    element(labels,'text',{x,y,'text-anchor':anchor,class:minor?'note':''}).textContent=content;
  }
  function leader(d){path(labels,d,'none','#839ca9',1);}
  function base(x,y,w) {
    path(floor,`M${x} ${y}h${w}l10 -6h-${w}Z`,'#d9e3e6','#b9c9d0');
    path(floor,`M${x} ${y}h${w}v7h-${w}Z`,'url(#concrete)','#b9c9d0');
  }
  function flow(parent,id,d,color,width=5,pipe=true) {
    const g=element(parent,'g',{id:'flow-'+id,'data-flow':id});
    if(pipe) path(g,d,'none','#708795',width+2.2);
    path(g,d,'none',color,width);
    path(g,d,'none','#fff',Math.max(1.3,width*.36),{class:'stream','stroke-dasharray':'6 21',opacity:'.88'});
    return g;
  }
  base(116,391,402);base(557,352,60);base(637,352,45);base(747,349,345);base(1179,353,114);

  // Separate primary pipes, secondary steam and feedwater, and electrical bus.
  flow(routes,'primary-hot','M495 215H538Q550 215 550 206V192Q550 181 563 181H585',hot,9);
  flow(routes,'primary-return','M585 301H555Q541 301 541 290V274Q541 262 528 262H495',cold,8);
  flow(routes,'steam','M628 136V121Q628 110 640 110H775Q787 110 787 122V201',steam,8);
  flow(routes,'exhaust','M894 309V398',steam,11);
  flow(routes,'feedwater','M838 442V445Q838 449 831 449H637Q627 449 627 439V334',cold,5);
  flow(routes,'rejected-heat','M922 415H1066','#c78f71',5);
  flow(routes,'cooling-return','M1054 431H922',cold,5);
  flow(routes,'generation','M1032 172V169Q1032 158 1045 158H1138V225',electric,4,false);
  flow(routes,'grid','M1138 225Q1158 252 1181 250',electric,4,false);
  flow(routes,'recirculation','M1138 225V460Q1138 474 1123 474H-99Q-112 474 -112 460V166H-88',electric,4,false);
  flow(routes,'own-use','M1138 442H1166',electric,3,false);
  element(routes,'circle',{cx:1138,cy:442,r:3.3,fill:electric});
  flow(routes,'rf-supply','M-112 337H-83',electric,3,false);

  // Meridional section of the ITER assembly, using the equilibrium module's CAD profiles.
  const cad=window.TokamakCADData, {vessel,csSection,divertor}=cad.templates;
  const cx=318,cy=235,unit=14.2;
  const axisR=6.2, axisZ=.18;
  function point(r,z,angle){return [cx+unit*r*Math.cos(angle),cy-unit*z];}
  function polygon(points){return points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join('')+'Z';}
  function contour(points,a){return polygon(points.map(([r,z])=>point(r,z,a)));}
  function shell(section,a,fill,stroke='#6c8390'){
    path(reactor,contour(section.outer,a)+contour(section.inner,a),fill,stroke,1.05,{'fill-rule':'evenodd'});
  }
  const tfCase=cad.parts.find(p=>p.id==='Toroidal_field_coil_a');
  function section(part,angle){
    const outline=part.sections.map(profile=>contour(profile,angle)).join('');
    path(reactor,outline,'#c4cfd4','#586e7b',.7,{'fill-rule':'evenodd'});
  }
  // Show both cut faces. The blanket lining is schematic; its outer face
  // follows the CAD vessel aperture. The cassette contours come from CAD.
  const lining=vessel.inner.map(([r,z])=>[6.2+(r-6.2)*.82,z*.85]);
  for(const a of [0,Math.PI]){
    section(tfCase,a);shell(vessel,a,'#879eab');
    path(reactor,contour(vessel.inner,a),'#354d60','#4a6676');
    for(let i=0;i<lining.length;i+=4){
      const k=(i+4)%lining.length;
      if(lining[i][1]<-2.8)continue;
      path(reactor,polygon([vessel.inner[i],vessel.inner[k],lining[k],lining[i]].map(([r,z])=>point(r,z,a))),copper,'#998061',.7);
    }
    for(const profile of divertor) path(reactor,contour(profile,a),'#83939e','#354f60',.75);
    function plasma(scale){
      return Array.from({length:80},(_,j)=>{
        const t=j*2*Math.PI/80;
        return [axisR+1.9*scale*Math.cos(t+.36*Math.sin(t)),axisZ+3.15*scale*Math.sin(t)];
      });
    }
    path(reactor,contour(plasma(1),a),'url(#plasma)','#c288b1',1,{class:'plasma-volume'});
    path(reactor,contour(plasma(.95),a),'url(#burn-core)','none',0,{class:'fusion-light'});
    path(reactor,contour(plasma(.86),a),'none','#fbd9ea',.7,{opacity:.55});
    // The left cut illustrates fuel density and external heating.
    // The right cut shows the fusion products of the same plasma.
    if(a===0)continue;
    const clip=element(reactor,'clipPath',{id:'fuel-left'});
    path(clip,contour(plasma(.98),a),'white','none');
    const fuel=element(reactor,'g',{'clip-path':'url(#fuel-left)','aria-hidden':'true'});
    const count=48;
    for(let i=0;i<count;i++){
      const u=Math.sqrt(((i*17+4)%count+.5)/count)*.97, t=i*2.399963;
      const [x,y]=point(axisR+1.9*u*Math.cos(t+.36*Math.sin(t)),axisZ+3.15*u*Math.sin(t),a);
      const speed=.65+(i%7)*.12;
      const dx=5.5*Math.cos(i*1.71),dy=7*Math.sin(i*1.71);
      element(fuel,'circle',{cx:x,cy:y,r:i%3===0?1.65:2.25,fill:i%3===0?'#f0ffff':'#9be9f2',stroke:'#322146','stroke-width':.75,
        class:'fuel-particle','data-fuel-fraction':(i+.5)/count,
        style:`--drift-x:${dx}px;--drift-y:${dy}px;--drift-time:${speed}s;animation-delay:-${i*.21}s`});
    }
  }
  for(const angle of [0,Math.PI]){
    for(const part of cad.parts.filter(p=>p.part==='pf')){
      section(part,angle);
      path(reactor,contour(part.sectionWinding.profile,angle),'url(#winding)','#816c55',.65);
    }
    path(reactor,contour(csSection.structure,angle),metal);
    for(const aux of csSection.auxiliary)path(reactor,contour(aux,angle),housing,'#73838d',.5);
    const clipId=angle===0?'cs-right':'cs-left';
    const clip=element(reactor,'clipPath',{id:clipId});
    for(const profile of csSection.windings)path(clip,contour(profile,angle),'white','none');
    const [r0,r1,z0,z1]=csSection.bounds;
    for(let i=0;i<6;i++){
      const low=z0+(z1-z0)*i/6+.025, high=z0+(z1-z0)*(i+1)/6-.025;
      const face=[[r0,low],[r1,low],[r1,high],[r0,high]];
      path(reactor,contour(face,angle),'url(#winding)','#725e50',.6,{'clip-path':'url(#'+clipId+')'});
    }
  }
  for(const x of [219,390]){
    path(reactor,`M${x} 323h21l6 43h-32Z`,housing);
    path(reactor,`M${x-9} 365h39v4h-39Z`,metal);
  }
  for(const y of [218,258]){
    path(reactor,'M443 '+(y-4)+'H471V'+(y+4)+'H443Z',metal);
    path(reactor,'M465 '+(y-7)+'h5v14h-5Z',housing);
  }
  // Sectioned cooling passage in the outboard blanket, from cold to hot.
  flow(reactor,'blanket-channel','M469 258H438Q435 258 436 254Q442 239 442 222Q442 218 447 218H469',hot,3.4);
  // Side elevation of two toroidally separated ports. Both openings are
  // projected onto the cut face so the exit of each system stays visible.
  const beamline = element(heat,'g',{transform:'translate(-88 166) rotate(10)'});
  base(-90,218,140);
  path(heat,'M-72 186h11v29h-11ZM23 203h10v12H23Z',housing);
  // Source, accelerator grids and gas neutralizer share one vacuum axis.
  path(beamline,'M0 -16L10 -23H102L124 -11V11L102 23H10L0 16Z',metal);
  path(beamline,'M6 -11H105L117 -6V6L105 11H6Z','#364e5d');
  path(beamline,'M9 -9h12v18H9Z',copper);
  for(const x of [29,35,41]){
    path(beamline,`M${x} -11v8m0 6v8`,'none','#e0b982',2.6);
  }
  path(beamline,'M52 -8h48l7 4H52ZM52 8h48l7 -4H52Z',metal);
  // Tapered vacuum duct and port liner. The clear bore ends at the first wall.
  path(beamline,'M119 -11L196 -8L221 -12H264V-6H202L119 -4ZM119 11L196 8L221 12H264V6H202L119 4Z',housing);
  path(beamline,'M117 -4H264V6H117Z','#354b57','none');
  for(const x of [120,187,222]){
    path(beamline,`M${x} -13h4v8h-4ZM${x} 5h4v8h-4Z`,metal);
  }
  path(beamline,'M25 0H54','none','#e0a858',2,{class:'beam-light'});
  path(beamline,'M54 -1.8H264L307 -3V3L264 1.8H54Z','#efc15c','none',0,{opacity:.45,class:'beam-light'});
  const beam=flow(heat,'nbi','M54 0H307','#bc8625',2.3,false);
  beam.setAttribute('transform','translate(-88 166) rotate(10)');

  // Gyrotron output is turned by a mitre bend. The wave stays confined
  // until the steering mirror launches it through the blanket aperture.
  base(-90,366,90);
  path(heat,'M-82 360V319Q-82 309 -69 308H-42Q-29 309 -29 319V360Z',housing);
  path(heat,'M-73 311v-20q15 -12 31 0v20Z',metal);
  for(const y of [320,328,336])path(heat,`M-84 ${y}q26 8 56 0`,'none','#99744f',4);
  path(heat,'M-52 305H-5V263H158L180 267V275L156 277H9V317H-52Z',housing);
  path(heat,'M-52 311H2V270H159L176 271','none','#326773',4);
  path(heat,'M-5 263l14 14M-5 304l14 13','none','#cedce0',2);
  for(const x of [41,102,144])path(heat,`M${x} 259h4v5h-4ZM${x} 276h4v5h-4Z`,metal);
  path(heat,'M149 259h21l12 4 -4 5 -15 -4h-14ZM149 282h22l13 -10 -4 -4 -13 8h-18Z',metal);
  path(heat,'M163 275l18 -5','none','#294850',3);
  element(heat,'circle',{cx:172,cy:277,r:2.7,fill:metal,stroke:'#52727c'});
  path(heat,'M176 269L219 237Q224 242 223 250Z',teal,'none',0,{opacity:.15,class:'wave-light'});
  const rf=flow(heat,'ecrh','M176 269L218 243',teal,1.3,false);
  for(let i=0;i<5;i++){
    const x=183+i*7,y=265-i*4.3,r=3+i*.7;
    path(rf,`M${x-r*.55} ${y-r}q${r*1.7} ${r*.6} ${r*1.1} ${2*r}`,'none',teal,1.8,
      {class:'wavelet',style:'animation-delay:'+i*.18+'s'});
  }
  // The toroidal current crosses the two poloidal sections in opposite senses.
  const current=element(heat,'g',{id:'flow-induced-current','data-flow':'induced-current',transform:cutScale});
  element(current,'title',{}).textContent='Toroidální proud v plazmatu. Vlevo míří k pozorovateli, vpravo od něj.';
  function currentSymbol(parent,x,y,toward){
    const ink='#563660';
    element(parent,'circle',{cx:x,cy:y,r:5.4,fill:'#fff2fc',stroke:ink,'stroke-width':1.5});
    if(toward)element(parent,'circle',{cx:x,cy:y,r:1.8,fill:ink});
    else path(parent,`M${x-2.4} ${y-2.4}l4.8 4.8m0 -4.8l-4.8 4.8`,'none',ink,1.5);
  }
  currentSymbol(current,...point(axisR,axisZ,Math.PI),true);
  currentSymbol(current,...point(axisR,axisZ,0),false);

  // Closed gyro-orbits are enlarged for visibility in the poloidal section.
  const alpha=element(heat,'g',{id:'flow-alpha','data-flow':'alpha',transform:cutScale});
  const orbits=[[398,248,8,5],[417,246,6,5],[406,263,6,4]];
  for(const [i,[x,y,rx,ry]] of orbits.entries()){
    const orbit=element(alpha,'g',{'data-fusion-threshold':i/orbits.length});
    const track=`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;
    path(orbit,track,'none','#5a194a',3.4);
    path(orbit,track,'none','#ffa2ce',1.8);
    element(orbit,'circle',{r:4,fill:'#f32b7e',stroke:'#fff4fa','stroke-width':1.55,
      class:'alpha-particle',style:`offset-path:path("${track}");--period:${1.35+i%3*.16}s;--phase:-${i*.37}s`});
  }
  const neutrons=element(heat,'g',{id:'flow-neutrons','data-flow':'neutrons',transform:cutScale});
  const tiles=[16,8,24,32];
  for(const [i,target] of tiles.entries()){
    const [x,y]=point(...vessel.inner[target].map((v,k)=>(v+lining[target][k])/2),0);
    const [sx,sy]=point(axisR+.08*i,axisZ+1.45,0);
    const emission=element(neutrons,'g',{'data-fusion-threshold':i/tiles.length});
    path(emission,`M${sx} ${sy}L${x} ${y}`,'none','#ad7243',.75,{'stroke-dasharray':'1 4',opacity:.6});
    const style=`--dx:${x-sx}px;--dy:${y-sy}px;animation-delay:-${(i*.713)%2.8}s`;
    element(emission,'circle',{cx:x,cy:y,r:8,fill:'url(#impact-light)',class:'blanket-deposit',style});
    element(emission,'circle',{cx:sx,cy:sy,r:2.1,fill:'#fff7cc',stroke:'#b56d21','stroke-width':.85,class:'flying-neutron',style});
  }
  // Section through a coil-type steam generator. Primary coolant stays
  // inside the tube; feedwater enters the shell below its water surface.
  path(machines,'M583 318V177Q583 151 607 150H644Q669 151 669 177V318Q669 339 644 340H607Q583 338 583 318Z',metal);
  path(machines,'M621 151V136H635V151Z',housing);
  path(machines,'M593 180Q623 161 659 179V312Q633 332 593 312Z','#edf6f7');
  path(machines,'M593 201q9 -4 17 0t16 0t16 0t17 0v111q-29 19 -66 0Z','#bfdee6','#8eb8c2');
  // Bubbles form on the primary tube's wetted surface, then rise to the water line.
  for(const [i,[x,y]] of [[610,214],[620,230],[632,214],[645,228],[616,246],[640,261],[650,251],[626,277]].entries()){
    element(machines,'circle',{cx:x,cy:y,r:1.8+i%3*.45,fill:'#eafbff',stroke:'#6498aa','stroke-width':.8,
      class:'boiling-bubble','data-boil-threshold':i/8,style:`--rise:${202-y}px;--still:${(202-y)*(.24+.08*(i%6))}px;--period:${1.1+i%4*.27}s;--phase:-${i*.41}s`});
  }
  path(machines,'M623 344v-24h8v24ZM620 344h14v4h-14Z',metal);
  const coil='M585 181H599Q604 181 604 187V208Q604 215 612 215H638Q652 215 652 223Q652 231 638 231H615Q602 231 602 239Q602 247 615 247H638Q652 247 652 255Q652 263 638 263H615Q602 263 602 271Q602 279 615 279H638Q652 279 652 287Q652 301 639 301H585';
  flow(machines,'primary-coil',coil,'url(#primary-temperature)',5.5);
  for(const y of [181,301])path(machines,`M582 ${y-6}h4v12h-4Z`,metal);
  path(machines,'M610 340V348M646 340V348','none','#7f96a2',7);
  // Longitudinal section of the turbine with stationary and rotating blade rows.
  // Split pressure casing with an admission chest and a downward exhaust hood.
  path(machines,'M750 248v-27q0-12 12-13l12-2v-9h24v6h19l16-6 19-4 14-10 16-5h25q19 0 19 21v77q0 14-13 18l-9 4v13h-21v-13l-18-5-16-13-22-6-29-5h-33q-15-1-15-21Z',housing);
  path(machines,'M763 222q6-9 22-9h24q24 0 47-13l27-13h20q12 0 12 12v76q0 8-9 11l-14 6-15-7-23-15q-20-11-43-12h-30l-18-4Z','#344d5c','#667e8b');
  path(machines,'M774 209h23v6h-23ZM782 205v-14h10v14Z',metal);
  path(machines,'M903 191q11 1 11 13v65q0 10-9 16l-15 8 3-13q13-7 13-22v-45Z','#859ca6','#70858e',.8);
  // A longitudinal section shows the hub as a continuous stepped forging.
  path(machines,'M752 234h18l8-7h49l24 2 37-1 13 6h19v9h-19l-13 6-38-1-24 2h-48l-8-7h-18Z',metal);
  const axisY=238, turn=2*Math.PI, rows=[];
  path(machines,'M756 234H963V242H756Z',metal);
  for(const [x,tip,hub] of [[770,14,9],[781,15,9],[792,16,9],[805,18,9],[819,21,9],[834,25,9],[850,30,10],[867,36,10],[885,44,10]]){
    for(const side of [-1,1]){
      path(machines,`M${x} ${axisY+side*tip}h4l4 ${-side*(tip-hub-2)}h-2Z`,'#96afbb','#586e7a',.65);
    }
    element(machines,'ellipse',{cx:x+9,cy:axisY,rx:2.8,ry:hub+1,fill:housing,stroke:'#586e7b'});
    // The rear blades form a dark wheel envelope behind the lit front row.
    element(machines,'ellipse',{cx:x+9,cy:axisY,rx:2.9,ry:tip,fill:'#627e8d',stroke:'#526d7d','stroke-width':.5});
    const blades=Array.from({length:12},()=>path(machines,'','#aac1cb','#4f6777',.55,{class:'rotor-blade'}));
    rows.push({x:x+9,tip,hub,blades});
  }
  const shaft=element(machines,'g',{id:'flow-shaft','data-flow':'shaft'});
  path(shaft,'M921 234h41v8h-41Z',metal);
  path(machines,'M931 229h6v18h-6ZM939 229h6v18h-6Z',housing);
  // End bearings and stiffened pedestals carry the shaft load to the bedplate.
  function bearing(x){
    path(machines,`M${x-6} 244v-10q0-6 6-6t6 6v10Z`,metal,'#59717f',.85);
    path(machines,`M${x-4} 244h8l3 12h-14Z`,housing);
  }
  bearing(752);bearing(921);
  for(const [x,top] of [[773,268],[903,303],[983,279],[1081,280]]){
    path(machines,`M${x-4} ${top}h12v9l8 ${333-top-9}v6h-27v-6l7 ${top+9-333}Z`,housing);
    path(machines,`M${x-13} 339h33v5h-33Z`,metal);
  }
  path(machines,'M776 200V190h22v9M882 293v20h23v-21',housing);
  // Alternator with a cut through stator laminations, copper end turns and rotor.
  // Axial generator cutaway: end shields, laminated core, stationary end
  // windings and a cylindrical two-pole rotor with retaining rings.
  path(machines,'M951 222q0-12 13-16l12-12h102l17 9q9 4 9 18v37q0 10-10 15l-15 9H978l-16-11q-11-4-11-15Z',housing);
  path(machines,'M958 213l19-12h98l17 9v54l-13 9H975l-17-12Z','#384f5d','#718894');
  path(machines,'M976 195l10-10h84l10 9ZM973 276h109l-5 7H979Z',metal);
  for(const y of [202,254]){
    path(machines,`M984 ${y}h84v17h-84Z`,'#7c909c','#485f6d',1);
    for(let x=987;x<1068;x+=3)path(machines,`M${x} ${y+1}v15`,'none','#b5c6ce',.85);
  }
  for(let i=0;i<3;i++){
    const inset=i*2.2;
    path(machines,`M991 ${217+i*2}C${971-inset} ${213+i*2} ${967-inset} 222 ${966-inset} 230M991 ${253+i*2}Q${974-inset} 265 ${965-inset} 247M1060 ${217+i*2}Q${1081+inset} 208 ${1089+inset} 228M1060 ${253+i*2}Q${1081+inset} 266 ${1089+inset} 247`,'none','#c78955',2);
  }
  path(machines,'M953 234h15l9-7h90l10 7h24v8h-24l-10 7h-90l-9-7h-15Z',metal);
  bearing(954);bearing(1102);
  // The two retaining rings remain smooth as the slotted barrel turns.
  for(const x of [976,1059])path(machines,`M${x} 228h5v20h-5Z`,housing,'#5c7583',.6);
  const slots=Array.from({length:8},()=>path(machines,'','none','#536e80',1.3,{class:'rotor-slot'}));
  const bolts=Array.from({length:6},()=>element(machines,'circle',{r:1.2,fill:'#677f8e'}));
  // Project only the visible half of each wheel around the common shaft axis.
  function drawShaft(angle){
    rows.forEach((row,i)=>row.blades.forEach((blade,j)=>{
      const t=angle+j*turn/row.blades.length+i*.09;
      const visible=Math.cos(t)>=0;
      blade.setAttribute('visibility',visible?'visible':'hidden');
      if(!visible)return;
      const depth=Math.cos(t);
      function project(radius,twist,axial){
        return (row.x+axial+.10*radius*Math.cos(t+twist)).toFixed(2)+' '+
          (axisY+radius*Math.sin(t+twist)).toFixed(2);
      }
      const mid=(row.hub+row.tip)*.5;
      blade.setAttribute('d',`M${project(row.hub,0,-2)}Q${project(mid,.10,-1)} ${project(row.tip,.15,2)}L${project(row.tip,.05,5)}Q${project(mid,-.05,3)} ${project(row.hub,-.08,2)}Z`);
      blade.setAttribute('fill',`hsl(201 24% ${Math.round(47+32*depth)}%)`);
      blade.setAttribute('opacity',Math.min(1,depth*4).toFixed(2));
    }));
    slots.forEach((slot,j)=>{
      const t=angle+j*turn/slots.length;
      slot.setAttribute('visibility',Math.cos(t)<0?'hidden':'visible');
      const depth=Math.max(0,Math.cos(t));
      slot.setAttribute('stroke-width',(.45+1.25*depth).toFixed(2));
      slot.setAttribute('opacity',depth.toFixed(2));
      slot.setAttribute('d',`M984 ${axisY+9*Math.sin(t)}h74`);
    });
    bolts.forEach((bolt,j)=>{
      const t=angle+j*turn/bolts.length;
      bolt.setAttribute('cx',940+1.7*Math.cos(t));
      bolt.setAttribute('cy',axisY+7.3*Math.sin(t));
    });
  }
  let angle=.25, frame=0, last=0;
  drawShaft(angle);
  window.setMilestoneShaftRunning=running=>{
    cancelAnimationFrame(frame);
    last=0;
    if(!running || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    function advance(now){
      if(!last)last=now;
      angle=(angle+Math.min(now-last,100)*turn/6400)%turn;
      drawShaft(angle);
      last=now;
      frame=requestAnimationFrame(advance);
    }
    frame=requestAnimationFrame(advance);
  };
  for(const y of [218,252]){
    path(machines,`M984 ${y}h84v4h-84Z`,copper,'#876145',.8);
    for(let x=987;x<1068;x+=6)path(machines,`M${x} ${y+1}l-2 3`,'none','#895a3d',.8);
  }

  path(machines,'M1015 185v-13h32v13Z',housing);
  path(machines,'M1032 172v-14','none',electric,4);

  // Condenser water tubes and feed pump.
  const condenser=element(machines,'g',{id:'condenser',transform:'translate(0 36)'});
  path(condenser,'M808 371Q815 362 827 362H909Q925 362 931 376V397Q925 410 909 410H826Q812 410 808 399Z',metal);
  path(condenser,'M882 362v-6h23v6M832 409v5h12v-5',housing);
  path(condenser,'M819 374H918V399H819Z','#d3e7eb');
  for(let i=0;i<3;i++){
    const x=824+i*4, top=376+i*2.5, bottom=397-i*2.5;
    path(condenser,`M917 ${bottom}H${x+5}Q${x} ${bottom} ${x} ${bottom-5}V${top+5}Q${x} ${top} ${x+5} ${top}H917`,'none','#648b9d',1.45);
  }
  path(condenser,'M916 374h9v10h-9Z','#d0a38b');
  path(condenser,'M916 390h9v10h-9Z','#90b5c4');
  function pump(x,y,r){
    element(machines,'circle',{cx:x,cy:y,r,fill:metal,stroke:'#6b8492'});
    path(machines,`M${x+r*.5} ${y-r*.5}l${-r} ${r*.5} ${r} ${r*.5}Z`,'#688da0','none');
  }
  pump(761,449,10);
  pump(973,431,7);
  // Cooling tower cutaway: distributor, fill, ambient-air inlet and basin.
  const coolingTower=element(machines,'g',{transform:'translate(20 20)'});
  path(coolingTower,'M1030 412Q1048 381 1043 353Q1067 349 1085 353Q1081 381 1100 412Z',metal);
  path(coolingTower,'M1040 405Q1053 379 1050 357Q1064 354 1079 357Q1076 378 1090 405Z','#eef5f6','#a5b9c2',1);
  path(coolingTower,'M1038 395H1083','none','#c78f71',3);
  for(let x=1048;x<=1076;x+=7){
    path(coolingTower,`M${x} 396l-2 4m2 -4l2 4`,'none','#88b5c6',1.4);
  }
  for(let y=401;y<=403;y+=2)path(coolingTower,`M1047 ${y}h36`,'none','#93a9ad',1.4);
  path(coolingTower,'M1032 405q8 -2 16 0t16 0t16 0t17 0v9h-65Z','#9cc8d7','#7597a5');
  element(coolingTower,'ellipse',{cx:1064,cy:353,rx:21,ry:3,fill:'#859ea9',stroke:'#748a95'});  // Open lattice transmission tower and distribution cubicle.
  const tower=element(machines,'g',{transform:'translate(1232 255)'});
  for(const d of ['M-30 93L-10 -40L0 -87L10 -40L30 93','M-24 65L22 42L-18 16L13 -12L-10 -40M24 65L-22 42L18 16L-13 -12L10 -40','M-40 -48L-4 -68H4L40 -48ZM-52 -16L-10 -38H10L52 -16ZM-32 92H32'])
    path(tower,d,'none','#65808e',2.2);
  for(const x of [-39,39,-51,51]){const y=Math.abs(x)===39?-48:-16;path(tower,`M${x} ${y}v11`,'none','#94aab3',3);}
  path(tower,'M-51 -5Q-19 7 0 3T51 -5Q86 9 104 -3','none',electric,1.7);
  const auxiliary=element(machines,'g',{id:'auxiliary-switchgear',transform:'translate(0 36)'});
  path(auxiliary,'M1166 391l10 -7h46l10 7v31h-66Z',metal);
  for(let x=1174;x<=1216;x+=14)path(auxiliary,`M${x} 399h8m-8 5h8m-8 5h8`,'none','#6e8998',1.6);

  function direction(x,y,angle,color){
    path(routes,'M-5 -3.4L3 0L-5 3.4Z',color,'none',0,{transform:`translate(${x} ${y}) rotate(${angle})`});
  }
  for(const [x,y,angle] of [[521,215,0],[518,262,180],[727,110,0],[894,332,90],[627,399,-90],[994,415,0],[997,431,180]]){
    direction(x,y,angle,'#fff');
  }
  for(const [x,y,angle] of [[1095,158,0],[1138,303,90],[647,474,180],[-112,282,-90]]){
    direction(x,y,angle,electric);
  }
  text(-95,97,'Injektor NBI');text(-95,117,'Urychlovač a neutralizátor',true);
  leader('M-39 124V140L-23 158');
  text(44,138,'Svazkovod',true);leader('M80 144V165L92 190');
  text(-92,393,'Gyrotron');text(-92,413,'Mikrovlnný ohřev',true);
  text(12,314,'Vlnovod',true);leader('M43 300V282');
  text(30,354,'Natáčecí zrcadlo',true);leader('M95 340V325L171 278');
  text(188,35,'Tokamak');text(188,56,'Poloidální řez ITER',true);
  text(363,41,'Centrální solenoid',true);leader('M395 48V73L340 125');
  text(166,94,'Cívky PF',true);leader('M222 90L237 82L251 102');
  text(452,103,'Cívka TF',true);leader('M480 110L468 142L447 161');
  text(491,158,'Blanket',true);leader('M512 163L499 177L453 191');
  text(215,410,'Plazma D–T',false,'middle');
  text(422,423,'Produkty fúzní reakce',false,'middle');
  text(39,438,'Proud v plazmatu',true);currentSymbol(labels,156,434,true);text(167,438,'k nám',true);currentSymbol(labels,220,434,false);text(231,438,'od nás',true);
  text(509,325,'Samoohřev α',true);leader('M521 311L469 281L427 254');
  text(509,181,'Neutrony',true);leader('M522 187L490 200L447 214');
  text(511,128,'Primární okruh',true);
  text(620,60,'Parogenerátor',false,'middle');text(620,81,'Trubkový výměník',true,'middle');
  text(700,100,'Pára',true,'middle');
  text(859,78,'Parní turbína',false,'middle');text(859,99,'Lopatkové stupně',true,'middle');leader('M859 106V141L846 189');
  text(1027,78,'Generátor',false,'middle');text(1027,99,'Rotor a stator',true,'middle');leader('M1027 106V134L1002 183');
  text(1240,78,'Elektrická síť',false,'middle');text(867,466,'Kondenzátor',true,'middle');
  text(755,426,'Napájecí čerpadlo',true,'middle');text(1085,457,'Chladicí věž',true,'middle');
  text(1201,482,'Vlastní spotřeba',true,'middle');text(548,503,'Recirkulace elektřiny k ohřevu',false,'middle');
  for(const [x,color,label] of [
    [272,hot,'Horké chladivo'],[458,cold,'Voda a chladivo'],[650,steam,'Pára'],
    [758,'#a18154','Hřídel'],[889,electric,'Elektrické vedení']
  ]){
    path(labels,`M${x} 531h23`,'none',color,4);
    text(x+32,535,label,true);
  }
  document.getElementById('import-guide').onclick=()=>document.getElementById('guide').showModal();
})();
