const OrbitalVolume=(()=>{
  const states=[[1,0,0],[2,0,0],[2,1,0],[2,1,1,true],[2,1,-1,true],[2,1,1],[3,0,0],[3,1,0],[3,2,0],[3,2,2]];
  const partnerIndex=index=>index===2?0:2;
  const planes=[
    {name:'xy',normal:2,coordinate:'z',axes:[0,1],yaw:0,pitch:0},
    {name:'xz',normal:1,coordinate:'y',axes:[0,2],yaw:0,pitch:-Math.PI/2},
    {name:'yz',normal:0,coordinate:'x',axes:[2,1],yaw:-Math.PI/2,pitch:0}
  ];
  function planePoint(plane,offset,u,v){
    const position=[0,0,0];
    position[plane.normal]=offset;
    position[plane.axes[0]]=u;position[plane.axes[1]]=v;
    return position;
  }
  function make(index,mix,quality=0){
    const s=states[index],b=states[partnerIndex(index)],extent=3.2*Math.max(s[0]**2,mix?b[0]**2:0),n=quality?57:43;
    const cells=[],h=2*extent/n;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){
      const xyz=[i,j,k].map(v=>(v-(n-1)/2)*h);
      const value=state=>ElectronPhysics.orbital(...state.slice(0,3),...xyz,state[3]);
      const [ar,ai]=value(s),[br,bi]=mix?value(b):[0,0];
      cells.push({xyz,ar:ar*Math.sqrt(1-mix),ai:ai*Math.sqrt(1-mix),br:br*Math.sqrt(mix),bi:bi*Math.sqrt(mix)});
    }
    return {s,b,extent,h,cells,n};
  }
  function evaluate(cell,phi){
    const re=cell.ar+cell.br*Math.cos(phi)-cell.bi*Math.sin(phi),im=cell.ai+cell.br*Math.sin(phi)+cell.bi*Math.cos(phi);
    return [re*re+im*im,Math.atan2(im,re)];
  }
  function sample(cdf,rng){let lo=0,hi=cdf.length-1,target=rng()*cdf[hi];while(lo<hi){const mid=(lo+hi)>>1;if(cdf[mid]<target)lo=mid+1;else hi=mid;}return lo;}
  return {make,evaluate,sample,states,partnerIndex,planes,planePoint};
})();
if(typeof module!=='undefined')module.exports=OrbitalVolume;
