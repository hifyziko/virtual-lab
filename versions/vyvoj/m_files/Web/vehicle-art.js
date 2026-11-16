/* Original schematic side views, facing right. No photographs or brand marks.
   Reference silhouettes: Tesla configurator SIDE; Skoda Enyaq 2025 technical
   sheet; BMW i4 2022 brochure; VW ID.4 exterior press kit; original IONIQ 6
   design release (2022). These drawings are not dimensioned vehicle models. */
(() => {
 const models=[
  {name:'Tesla Model 3',color:'#b85a51',roof:1.10,
   body:[['M',-1.69,.29],['L',-1.69,.60],['Q',-1.62,.72,-1.30,.75],['Q',-.94,.85,-.69,1.04],['Q',-.19,1.24,.36,1.05],['L',.84,.73],['Q',1.41,.70,1.65,.52],['L',1.70,.29],['Z']],
   windows:[[[-1.12,.76],[-.66,1.02],[-.17,1.10],[-.12,.76]],[[-.06,.76],[-.11,1.10],[.32,1.01],[.73,.76]]],wheels:[-1.09,1.06],radius:.245,front:.53,rear:.61},
  {name:'Škoda Enyaq',color:'#568777',roof:1.32,
   body:[['M',-1.70,.31],['L',-1.70,.91],['L',-1.37,1.28],['Q',-1.29,1.36,-1.07,1.36],['L',.36,1.34],['L',.92,.91],['L',1.57,.85],['Q',1.72,.80,1.72,.64],['L',1.72,.31],['Z']],
   windows:[[[-1.48,.91],[-1.23,1.25],[-.20,1.25],[-.20,.91]],[[-.12,.91],[-.12,1.25],[.32,1.23],[.78,.91]]],wheels:[-1.12,1.10],radius:.285,front:.78,rear:.88,rails:true},
  {name:'BMW i4',color:'#497ca8',roof:1.12,
   body:[['M',-1.72,.28],['L',-1.72,.63],['L',-1.44,.72],['L',-.87,1.04],['Q',-.57,1.19,-.21,1.18],['L',.30,1.13],['L',.83,.78],['L',1.51,.72],['L',1.72,.59],['L',1.72,.28],['Z']],
   windows:[[[-1.21,.76],[-.80,1.03],[-.24,1.10],[-.22,.76]],[[-.15,.76],[-.17,1.10],[.27,1.06],[.71,.78]]],wheels:[-1.08,1.13],radius:.25,front:.64,rear:.64,vent:true},
  {name:'Volkswagen ID.4',color:'#7395a5',roof:1.31,
   body:[['M',-1.68,.32],['L',-1.68,.79],['Q',-1.55,1.06,-1.20,1.27],['Q',-.66,1.45,.30,1.29],['L',.91,.91],['Q',1.56,.89,1.69,.65],['L',1.70,.32],['Z']],
   windows:[[[-1.42,.88],[-1.15,1.20],[-.28,1.28],[-.23,.88]],[[-.16,.88],[-.21,1.28],[.27,1.22],[.76,.92]]],wheels:[-1.10,1.07],radius:.28,front:.73,rear:.80},
  {name:'Hyundai Ioniq 6',color:'#a28b73',roof:1.12,
   body:[['M',-1.74,.28],['L',-1.74,.54],['Q',-1.39,.64,-1.10,.89],['Q',-.63,1.36,.07,1.16],['Q',.48,1.06,.84,.78],['Q',1.40,.69,1.72,.49],['L',1.72,.28],['Z']],
   windows:[[[-1.12,.77],[-.83,1.01],[-.33,1.13],[-.26,.77]],[[-.19,.77],[-.26,1.12],[.10,1.09],[.71,.78]]],wheels:[-1.12,1.10],radius:.245,front:.51,rear:.56,spoiler:true},
  {name:'Vlastní vozidlo',color:'#658797',roof:1.17,
   body:[['M',-1.65,.29],['L',-1.65,.65],['L',-1.04,.78],['L',-.65,1.17],['L',.32,1.17],['L',.83,.78],['L',1.57,.67],['L',1.67,.29],['Z']],
   windows:[[[-.91,.79],[-.59,1.08],[-.14,1.08],[-.14,.79]],[[-.07,.79],[-.07,1.08],[.29,1.08],[.71,.79]]],wheels:[-1.08,1.08],radius:.25,front:.56,rear:.57}
 ];
 Lab.vehicleArt=function(p,selection,angle){
  const model=models[selection]||models[5],c=p.c,cos=Math.cos(angle),sin=Math.sin(angle);
  const point=(x,y)=>[p.X(x*cos-y*sin),p.Y(x*sin+y*cos)];
  function path(commands,fill,stroke='#344e57',width=1.3){
   c.beginPath();
   for(const [op,...v]of commands){
    if(op==='Z'){c.closePath();continue;}
    const a=point(v[0],v[1]);
    if(op==='M')c.moveTo(...a);
    else if(op==='L')c.lineTo(...a);
    else if(op==='Q')c.quadraticCurveTo(...a,...point(v[2],v[3]));
   }
   if(fill){c.fillStyle=fill;c.fill();}
   if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
  }
  const polygon=(points,fill,stroke)=>path([['M',...points[0]],...points.slice(1).map(q=>['L',...q]),['Z']],fill,stroke);
  const line=(a,b,color='#344e57',width=1)=>path([['M',...a],['L',...b]],null,color,width);
  const circle=(x,y,r,fill)=>{const q=point(x,y);c.beginPath();c.arc(q[0],q[1],Math.abs(p.X(r)-p.X(0)),0,2*Math.PI);c.fillStyle=fill;c.fill();};
  c.save();c.lineJoin='round';c.lineCap='round';
  polygon([[1.56,model.front],[3.05,.18],[3.05,1.03]],'#ead06540',null);
  path(model.body,model.color);
  for(const glass of model.windows)polygon(glass,'#d4e9ee','#3f5a64');
  line([-.11,.76],[-.11,.35],'#344e5770');
  line([.86,.72],[.92,.35],'#344e5770');
  line([-1.43,.37],[1.48,.37],'#344e5780');
  for(const x of [-.56,.48])line([x,.70],[x+.16,.70],'#edf5f5',1.8);
  const mirrorY=model.windows[1][model.windows[1].length-1][1]+.02;
  polygon([[.70,mirrorY+.02],[.84,mirrorY+.03],[.88,mirrorY-.04],[.75,mirrorY-.04]],model.color,'#344e57');
  polygon([[1.53,model.front],[1.69,model.front-.03],[1.69,model.front+.07],[1.53,model.front+.06]],'#ffe69b','#53666a');
  polygon([[-1.70,model.rear],[-1.53,model.rear],[-1.53,model.rear+.08],[-1.70,model.rear+.08]],'#c54f49','#6b4544');
  if(model.rails)for(const [a,b]of [[[-1.13,1.39],[-.40,1.39]],[[-.29,1.39],[.28,1.37]]])line(a,b,'#3e555a',1.8);
  if(model.vent)line([.81,.57],[.88,.65],'#273f49',2);
  if(model.spoiler)line([-1.74,.69],[-1.39,.69],'#374b50',2.2);
  for(const x of model.wheels){
   const y=model.radius;
   circle(x,y,model.radius,'#24363e');circle(x,y,model.radius*.66,'#c8d4d8');
   for(let j=0;j<5;j++){const a=j*2*Math.PI/5;line([x,y],[x+model.radius*.52*Math.cos(a),y+model.radius*.52*Math.sin(a)],'#70848c',1.2);}
   circle(x,y,model.radius*.17,'#526a74');
  }
  c.restore();return model.name;
 };
})();
