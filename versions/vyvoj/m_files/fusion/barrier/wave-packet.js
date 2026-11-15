(function(root){'use strict';
// Port of quantum_tunneling_3D_render_v2.m. Units hbar=m=1.
// Exact stationary states of a finite rectangular barrier, not a drawn trajectory.
function compute(options={}){
 const nx=options.nx||820,nk=options.nk||420,nt=options.nt||601,V=21,a=.35,k0=5.4,sigma=.25,x0=-7.8,tMax=3.15,dx=24/(nx-1),dk=2/(nk-1),xs=new Float64Array(nx),energies=new Float64Array(nk),br=new Float64Array(nx*nk),bi=new Float64Array(nx*nk),ar=new Float64Array(nk),ai=new Float64Array(nk),trans=new Float64Array(nk);let norm=0,fluxError=0;
 for(let j=0;j<nk;j++){const k=4.4+j*dk,amp=Math.exp(-((k-k0)**2)/(4*sigma*sigma));ar[j]=amp*Math.cos(-k*x0);ai[j]=amp*Math.sin(-k*x0);norm+=(j===0||j===nk-1?.5:1)*amp*amp*dk;}
 const inv=1/Math.sqrt(norm);
 for(let j=0;j<nk;j++){
  ar[j]*=inv;ai[j]*=inv;const k=4.4+j*dk,E=k*k/2,q=Math.sqrt(2*(V-E)),ch=Math.cosh(q*a),d=(q*q-k*k)/(2*k*q)*Math.sinh(q*a),den=ch*ch+d*d,fr=ch/den,fi=-d/den,h=(q*q+k*k)/(2*k*q)*Math.sinh(q*a),rr=h*fi,ri=-h*fr;energies[j]=E;trans[j]=fr*fr+fi*fi;fluxError=Math.max(fluxError,Math.abs(rr*rr+ri*ri+trans[j]-1));
  for(let i=0;i<nx;i++){const x=-12+i*dx;xs[i]=x;let re,im;if(x<0){const c=Math.cos(k*x),s=Math.sin(k*x);re=c+rr*c+ri*s;im=s+ri*c-rr*s;}else if(x<=a){const c=Math.cosh(q*(a-x)),s=-k/q*Math.sinh(q*(a-x));re=fr*c-fi*s;im=fr*s+fi*c;}else{const c=Math.cos(k*(x-a)),s=Math.sin(k*(x-a));re=fr*c-fi*s;im=fr*s+fi*c;}br[i*nk+j]=re;bi[i*nk+j]=im;}
 }
 const real=new Float32Array(nt*nx),imag=new Float32Array(nt*nx),wr=new Float64Array(nk),wi=new Float64Array(nk);let rhoMax=0;
 for(let f=0;f<nt;f++){const t=tMax*f/(nt-1);for(let j=0;j<nk;j++){const c=Math.cos(energies[j]*t),s=-Math.sin(energies[j]*t);wr[j]=(ar[j]*c-ai[j]*s)*dk/Math.sqrt(2*Math.PI);wi[j]=(ar[j]*s+ai[j]*c)*dk/Math.sqrt(2*Math.PI);}
  for(let i=0;i<nx;i++){let re=0,im=0;for(let j=0;j<nk;j++){const k=i*nk+j;re+=br[k]*wr[j]-bi[k]*wi[j];im+=br[k]*wi[j]+bi[k]*wr[j];}real[f*nx+i]=re;imag[f*nx+i]=im;rhoMax=Math.max(rhoMax,re*re+im*im);}
 }
 let transmission=0;for(let j=0;j<nk;j++)transmission+=(j===0||j===nk-1?.5:1)*(ar[j]**2+ai[j]**2)*trans[j]*dk;
 return {nx,nt,xs,real,imag,rhoMax,tMax,V,a,k0,fluxError,transmission};
}
root.HiFyzikoWavePacket={compute};if(typeof module!=='undefined')module.exports={compute};
})(typeof globalThis!=='undefined'?globalThis:this);

