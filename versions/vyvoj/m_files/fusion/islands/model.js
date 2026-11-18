/* Linear incompressible resistive reduced MHD, Harris sheet.
 * x is transverse to sheet, y periodic, strong constant guide field along z.
 * psi=psi0+p(x,t)cos(ky); phi=f(x,t)sin(ky); omega=L f.
 * p_t=k B f+eta Lp; omega_t=-k(B Lp-B''p)+nu Lomega.
 * Fixed perturbations at conducting x boundaries. Normalized units.
 * Valid only for small islands; no invented nonlinear saturation.
 * Sources and conventions: docs/fuze/magneticke-ostrovy-navrh.md. */
(function(root){'use strict';
class Model{
 constructor({a=.7,k=.7,n=257,eta=.02,nu=.01,seed=.00001}={}){
  Object.assign(this,{a,k,n,eta,nu,seed,time:0,xmax:8});this.dx=16/(n-1);
  this.x=Float64Array.from({length:n},(_,i)=>-8+i*this.dx);
  this.B=Float64Array.from(this.x,x=>Math.tanh(x/a));
  this.Bpp=Float64Array.from(this.x,x=>-2*Math.tanh(x/a)/(a*a*Math.cosh(x/a)**2));
  this.p=Float64Array.from(this.x,x=>seed/Math.cosh(x/a)*(1-(x/8)**2));
  this.w=new Float64Array(n);this.f=new Float64Array(n);
  this.c=new Float64Array(n);this.d=new Float64Array(n);
 }
 lap(v){const out=new Float64Array(this.n),h=1/this.dx**2;for(let i=1;i<this.n-1;i++)out[i]=(v[i-1]-2*v[i]+v[i+1])*h-this.k**2*v[i];return out;}
 flow(w){const f=new Float64Array(this.n),h=1/this.dx**2,b=-2*h-this.k**2;this.c[0]=0;this.d[0]=0;for(let i=1;i<this.n-1;i++){const den=b-h*this.c[i-1];this.c[i]=h/den;this.d[i]=(w[i]-h*this.d[i-1])/den;}for(let i=this.n-2;i>0;i--)f[i]=this.d[i]-this.c[i]*f[i+1];return f;}
 rhs(p,w){const f=this.flow(w),lp=this.lap(p),lw=this.lap(w),dp=new Float64Array(this.n),dw=new Float64Array(this.n);for(let i=1;i<this.n-1;i++){dp[i]=this.k*this.B[i]*f[i]+this.eta*lp[i];dw[i]=-this.k*(this.B[i]*lp[i]-this.Bpp[i]*p[i])+this.nu*lw[i];}return [dp,dw];}
 step(dt){const [p1,w1]=this.rhs(this.p,this.w),p=new Float64Array(this.n),w=new Float64Array(this.n);for(let i=0;i<this.n;i++){p[i]=this.p[i]+dt*p1[i]/2;w[i]=this.w[i]+dt*w1[i]/2;}const [p2,w2]=this.rhs(p,w);for(let i=0;i<this.n;i++){this.p[i]+=dt*p2[i];this.w[i]+=dt*w2[i];}this.time+=dt;}
 get amplitude(){return Math.abs(this.p[(this.n-1)/2]);}
 get width(){return 4*Math.sqrt(this.a*this.amplitude);}
 get delta(){return 2*(1/(this.k*this.a)-this.k*this.a)/this.a;}
 snapshot(){return {time:this.time,p:Array.from(this.p),f:Array.from(this.flow(this.w)),amplitude:this.amplitude,width:this.width};}
}
const api={Model};root.IslandMHD=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
