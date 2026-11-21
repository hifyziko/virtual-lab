/* Shared poloidal cross-section and microwave launcher of the wave experiments. */
(() => {
'use strict';
const {electric:gold, magnetic:blue}=window.HiFyzikoParticleStyle.fields;
const violet='#8c4b9d';
function node(parent,tag,attrs={},text=''){
  const n=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);
  if(text)n.textContent=text;
  parent.appendChild(n);
  return n;
}
function line(root,d,stroke,width=1){
  return node(root,'path',{d,stroke,'stroke-width':width,fill:'none'});
}
function dot(root,x,y,r,fill){return node(root,'circle',{cx:x,cy:y,r,fill})}
function label(root,x,y,text){node(root,'text',{x,y},text)}
function gradient(defs,type,id,attrs,stops){
  const g=node(defs,type,{id,...attrs});
  for(const [offset,color,opacity=1] of stops)node(g,'stop',{offset,'stop-color':color,'stop-opacity':opacity});
}
function drawLauncher(root,x,y,scale,id){
  const group=node(root,'g',{
    transform:'translate('+x+' '+y+') scale('+scale+')',
    stroke:'#405664','stroke-linejoin':'round','aria-hidden':'true'
  });
  const defs=node(group,'defs');
  gradient(defs,'linearGradient',id+'-steel',{x2:'0%',y2:'100%'},[
    [0,'#f0f5f7'],[.23,'#bdced7'],[.48,'#93abb8'],[.72,'#dce7ec'],[1,'#677f8d']
  ]);
  const steel='url(#'+id+'-steel)';
  // Waveguide casing and rear connection.
  node(group,'path',{d:'M39-17H91L102-25H50Z',fill:'#dbe5eb'});
  node(group,'path',{d:'M39-17H91V17H39Z',fill:steel});
  node(group,'path',{d:'M91-17l11-8v34l-11 8Z',fill:'#728c9d'});
  node(group,'path',{d:'M28-27H39L50-35H39ZM39-27l11-8v54l-11 8Z',fill:'#7b96a6'});
  node(group,'rect',{x:28,y:-27,width:11,height:54,rx:2,fill:steel});
  for(const rib of [49,58,67,76,85]){
    node(group,'path',{d:'M'+rib+'-20l11-8h3l-11 8v39h-3Z',fill:'#668595','stroke-width':.7});
  }
  // Flared transition and a bolted flange around the recessed aperture.
  node(group,'path',{d:'M0-32L11-40 39-25 28-17Z',fill:'#e4ecf0'});
  node(group,'path',{d:'M0 32L28 17V-17L0-32Z',fill:steel});
  node(group,'rect',{x:-4,y:-34,width:15,height:68,rx:3,fill:steel});
  node(group,'rect',{x:-2,y:-25,width:9,height:50,rx:2,fill:'#253d4d'});
  node(group,'rect',{x:0,y:-21,width:4,height:42,rx:1,fill:'#142b39',stroke:'#bd945d','stroke-width':.75});
  for(const boltY of [-29,29]){
    dot(group,3,boltY,2.2,'#eff5f7');
    line(group,'M1.7 '+boltY+'h2.6','#516975',.65);
  }
  line(group,'M1.8 -15v30',gold,1.5);
}
function drawVessel(vessel){
  const defs=node(vessel,'defs');
  gradient(defs,'linearGradient','metal',{x2:'100%',y2:'75%'},[[0,'#8296a3'],[.22,'#dce5e8'],[.48,'#b0c1c9'],[.72,'#f2f5f6'],[1,'#8297a3']]);
  gradient(defs,'radialGradient','plasma',{},[[0,'#fafcff'],[.75,'#e8eef9'],[1,'#c0d0e7']]);
  gradient(defs,'linearGradient','beam',{},[[0,'#efc16d',.05],[1,'#efb75d',.55]]);
  const profiles=window.TokamakCADData.templates;
  function cadPath(points){
    return points.map(([r,z],i)=>(i?'L':'M')+(280+20*(r-6.2)).toFixed(2)+' '+(197-20*z).toFixed(2)).join('')+'Z';
  }
  function casing(profile,color){
    return node(vessel,'path',{d:cadPath(profile.outer)+cadPath(profile.inner),fill:color,'fill-rule':'evenodd',stroke:'#526875','stroke-width':1.2});
  }
  casing(profiles.tf,'#c6a487');
  node(vessel,'path',{d:cadPath(profiles.vessel.inner),fill:'url(#plasma)'});
  const apertureX=329,apertureY=197;
  const portMask=node(defs,'mask',{id:'vessel-port'});
  node(portMask,'rect',{width:405,height:395,fill:'white'});
  node(portMask,'rect',{x:apertureX,y:apertureY-10,width:32,height:20,fill:'black'});
  casing(profiles.vessel,'url(#metal)').setAttribute('mask','url(#vessel-port)');
  node(vessel,'path',{d:cadPath(profiles.csSection.structure),fill:'#a9bac4',stroke:'#536b79'});
  for(const panel of profiles.divertor)node(vessel,'path',{d:cadPath(panel),fill:'#879ba5',stroke:'#445b69','stroke-width':.8});
  node(node(defs,'clipPath',{id:'plasma-edge'}),'path',{d:cadPath(profiles.vessel.inner)});
  const layer=node(node(vessel,'g',{'clip-path':'url(#plasma-edge)'}),'g');
  node(layer,'rect',{x:-6,width:12,height:395,fill:violet,opacity:.16});
  line(layer,'M0 0V395',violet,2);
  node(vessel,'path',{d:'M'+apertureX+' 191L234 188V206L'+apertureX+' 203Z',fill:'url(#beam)'});
  line(vessel,'M234 197H'+apertureX,'#b5782566');
  const wave=line(vessel,'',gold,2);
  drawLauncher(vessel,apertureX,apertureY,.48,'vessel-launcher');
  dot(vessel,280,197,6,'white');dot(vessel,280,197,3,'#273c4b');
  label(vessel,145,389,'Vnitřní strana');label(vessel,292,389,'Vnější strana');
  const fieldSymbols=node(vessel,'g',{'clip-path':'url(#plasma-edge)'});
  for(const x of [222,249,276,303,330]){
    for(const y of [123,154,227,258]){
      const ring=dot(fieldSymbols,x,y,3.6,'none');
      ring.setAttribute('stroke',blue);ring.setAttribute('opacity',.55);
      dot(fieldSymbols,x,y,1.2,blue);
    }
  }
  return {layer,wave,apertureX};
}
window.HiFyzikoWaveArt={node,line,dot,label,gradient,drawLauncher,drawVessel};
})();
