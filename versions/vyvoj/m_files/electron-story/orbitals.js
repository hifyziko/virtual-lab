const OrbitalVolume=(()=>{
  const states=[[1,0,0],[2,0,0],[2,1,0],[2,1,1,true],[2,1,-1,true],[2,1,1],[3,0,0],[3,1,0],[3,2,0],[3,2,2]];
  function make(index,mix,quality=0){
    const s=states[index],b=states[index===2?0:2],extent=3.2*Math.max(s[0]**2,mix?b[0]**2:0),n=quality?57:43;
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
  return {make,evaluate,sample,states};
})();
if(typeof module!=='undefined')module.exports=OrbitalVolume;
