// Strang splitting with independent unitary Cayley steps for the two kinetic operators.
function slitSolver({n=128,dt=.10,energy=.25,width=1.1,gap=4,mode='both',absorb=true,barrier=true,size=32,screenX=size-6}={}){
  const dx=size/n, kinetic=.05788382, hb=.65821196, wave=Math.sqrt(energy/(kinetic*hb));
  const re=new Float64Array(n*n), im=re.slice(), det=new Float64Array(n), atten=re.slice(), phase=re.slice(), fraction=re.slice();
  let norm=0, lost=0,time=0;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const i=y*n+x,X=(x+.5)*dx,Y=(y+.5)*dx-size/2;
    const amp=Math.exp(-((X-6)**2/4+Y*Y/100)/2);
    re[i]=amp*Math.cos(wave*X);im[i]=amp*Math.sin(wave*X);norm+=amp*amp;
    const upper=Math.abs(Y-gap/2)<width/2,lower=Math.abs(Y+gap/2)<width/2;
    const hole=(mode!=='lower'&&upper)||(mode!=='upper'&&lower);
    phase[i]=barrier&&Math.abs(X-12)<.5&&!hole?-5*dt/(2*hb):0;
    const screen=Math.max(0,(X-screenX)/5)**2,edge=Math.max(0,(2-X)/2,(Math.abs(Y)-size/2+3)/3)**2;
    atten[i]=absorb?Math.exp(-(screen+edge)*dt/(2*hb)):1;fraction[i]=screen+edge?screen/(screen+edge):0;
  }
  for(let i=0;i<re.length;i++){re[i]/=Math.sqrt(norm);im[i]/=Math.sqrt(norm);}
  const alpha=kinetic*dt/(2*dx*dx), cr=new Float64Array(n),ci=cr.slice(),dr=cr.slice(),di=cr.slice(),invR=cr.slice(),invI=cr.slice();
  for(let j=0;j<n;j++){
    const a=1-(j?alpha*ci[j-1]:0),b=2*alpha+(j?alpha*cr[j-1]:0);
    invR[j]=a/(a*a+b*b);invI[j]=-b/(a*a+b*b);
    cr[j]=alpha*invI[j];ci[j]=-alpha*invR[j];
  }
  function sweep(vertical){
    const stride=vertical?n:1;
    for(let row=0;row<n;row++){
      const off=vertical?row:row*n;
      for(let j=0;j<n;j++){
        const i=off+j*stride;
        const rr=re[i]-alpha*((j?im[i-stride]:0)+(j+1<n?im[i+stride]:0)-2*im[i])-(j?alpha*di[j-1]:0);
        const ii=im[i]+alpha*((j?re[i-stride]:0)+(j+1<n?re[i+stride]:0)-2*re[i])+(j?alpha*dr[j-1]:0);
        dr[j]=rr*invR[j]-ii*invI[j];di[j]=rr*invI[j]+ii*invR[j];
      }
      for(let j=n-1;j>=0;j--){
        const i=off+j*stride,r=j+1<n?re[i+stride]:0,s=j+1<n?im[i+stride]:0;
        re[i]=dr[j]-cr[j]*r+ci[j]*s;im[i]=di[j]-ci[j]*r-cr[j]*s;
      }
    }
  }
  const cos=phase.map(Math.cos),sin=phase.map(Math.sin);
  function potential(){for(let i=0;i<re.length;i++){
    const r=re[i],s=im[i],a=atten[i],dl=(1-a*a)*(r*r+s*s);
    det[Math.floor(i/n)]+=dl*fraction[i];lost+=dl;re[i]=a*(cos[i]*r-sin[i]*s);im[i]=a*(cos[i]*s+sin[i]*r);
  }}
  function step(){potential();sweep(false);sweep(true);potential();time+=dt;}
  return {re,im,det,n,dx,step,get lost(){return lost;},get time(){return time;}};
}
function slitWorker(){
  self.onmessage=({data:opt})=>{
    const models=(opt.mode==='mixed'?['upper','lower']:[opt.mode]).map(mode=>slitSolver({...opt,mode}));
    const steps=Math.ceil(190/.25),frames=[];
    for(let i=0;i<steps;i++){
      for(const s of models)s.step();
      if(i%24===0||i===steps-1){
        const s=models[0],rho=Float32Array.from(s.re,(_,j)=>models.reduce((v,m)=>v+m.re[j]**2+m.im[j]**2,0)/models.length);
        frames.push({time:s.time,rho,re:opt.mode==='mixed'?null:Float32Array.from(s.re),det:Float32Array.from(s.det,(_,j)=>models.reduce((v,m)=>v+m.det[j],0)/models.length)});
        self.postMessage({progress:(i+1)/steps});
      }
    }
    self.postMessage({frames});
  };
}
function detectSlit(det,rng){
  let draw=rng();
  for(let i=0;i<det.length;i++){
    draw-=det[i];
    if(draw<=0)return (i+rng())/det.length;
  }
  return null;
}
if(typeof module!=='undefined'){module.exports=slitSolver;module.exports.detect=detectSlit;}
