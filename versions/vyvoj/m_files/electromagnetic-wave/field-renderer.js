/* Technical section plots of the analytic dipole. No FEM/Ansys data are implied. */
(function(root){'use strict';
 const REF=(2*Math.PI)**2,N=256,EXTENT=3.4;
 const stops=[[0,18,35,140],[.18,0,104,240],[.38,0,218,229],[.57,43,210,81],[.75,245,232,26],[.9,246,111,11],[1,190,18,20]];
 function color(u,signed=false,bands=true){u=Math.max(0,Math.min(1,u));if(signed&&Math.abs(u-.5)<1e-12)return [241,245,248];if(bands)u=Math.min(11,Math.floor(u*12))/11;const palette=signed?[[0,22,65,173],[.5,241,245,248],[1,189,37,31]]:stops;let i=1;while(i<palette.length-1&&u>palette[i][0])i++;const a=palette[i-1],b=palette[i],q=(u-a[0])/(b[0]-a[0]);return a.slice(1).map((v,j)=>Math.round(v+(b[j+1]-v)*q));}
 function normalize(v,max,mode,signed=false){const f=x=>mode==='linear'?x/max:Math.log1p(20*x)/Math.log1p(20*max);return signed?.5+.5*Math.sign(v)*f(Math.abs(v)):f(Math.max(0,v));}
 function inverse(u,max,mode,signed=false){const v=signed?2*u-1:u,a=Math.abs(v);return Math.sign(v)*(mode==='linear'?a*max:Math.expm1(a*Math.log1p(20*max))/20);}
 function sample(M,x,z,t,config,part='total'){
  const f=M.section(x,z,t,config,part);
  return {E:Math.hypot(f[0],f[1])/REF,Ez:f[1]/REF,B:Math.abs(f[2])/REF,S:Math.abs(f[5])*Math.hypot(f[3],f[4])/(REF*REF)};
 }
 // Integrate a curve in a fixed-time vector field. Forward/reverse RK4 halves
 // stop at the source, a null, an already closed loop or the plot boundary.
 function trace(M,seed,t,config,part='total',extent=EXTENT,step=.045){
  function unit(p){if((M.masked?M.masked(p):Math.hypot(...p)<.13)||Math.abs(p[0])>extent||Math.abs(p[1])>extent)return null;const f=M.section(p[0],p[1],t,config,part),n=Math.hypot(f[0],f[1]);return n<1e-7?null:[f[0]/n,f[1]/n];}
  function half(sign){let p=seed.slice();const points=[p];for(let k=0;k<600;k++){const a=unit(p);if(!a)break;let h=step*sign,q=null;for(let attempt=0;attempt<6;attempt++){const b=unit([p[0]+a[0]*h/2,p[1]+a[1]*h/2]);if(!b){h*=.5;continue;}const c=unit([p[0]+b[0]*h/2,p[1]+b[1]*h/2]);if(!c){h*=.5;continue;}const d=unit([p[0]+c[0]*h,p[1]+c[1]*h]);if(!d){h*=.5;continue;}const next=[p[0]+h*(a[0]+2*b[0]+2*c[0]+d[0])/6,p[1]+h*(a[1]+2*b[1]+2*c[1]+d[1])/6],end=unit(next),dot=v=>v?a[0]*v[0]+a[1]*v[1]:-1;if(Math.min(dot(b),dot(c),dot(d),dot(end))<.98){h*=.5;continue;}q=next;break;}if(!q||Math.hypot(q[0]-p[0],q[1]-p[1])<Math.abs(h)*.3)break;points.push(q);p=q;if(k>18&&Math.hypot(p[0]-seed[0],p[1]-seed[1])<Math.abs(h)*.8){points.closed=true;break;}}return points;}

  const forward=half(1);return forward.closed?forward:half(-1).reverse().slice(0,-1).concat(forward);
 }
 function create(M,makeCanvas){const raster=[makeCanvas(),makeCanvas()];for(const c of raster){c.width=N;c.height=N;}let cached='',curves=[],samples=null;
  function draw(c,w,h,state,opt,helpers){const {label,line,arrow,dot,circle,text,path}=helpers,L=opt.layer;
   const key=[state.t,state.frequency,state.burst,state.stopTime,opt.part].join('|');
   if(key!==cached){samples=new Float32Array(N*N*4);for(let j=0;j<N/2;j++)for(let i=0;i<N/2;i++){const x=(i/(N-1)*2-1)*EXTENT,z=(1-j/(N-1)*2)*EXTENT,v=sample(M,x,z,state.t,state,opt.part);for(const k of [(j*N+i)*4,(j*N+N-1-i)*4,((N-1-j)*N+i)*4,((N-1-j)*N+N-1-i)*4]){samples[k]=v.E;samples[k+1]=v.Ez;samples[k+2]=v.B;samples[k+3]=v.S;}}

    curves=[];const occupied=new Set(),cell=p=>Math.round(p[0]/.18)+','+Math.round(p[1]/.18),seeds=[];
    for(let a=0;a<20;a++){const theta=(a+.5)*Math.PI/10;seeds.push([.24*Math.cos(theta),.24*Math.sin(theta)]);}
    for(let r=.6;r<4.5;r+=.38)for(let a=0;a<24;a++){const theta=(a+.3)*Math.PI/12;seeds.push([r*Math.cos(theta),r*Math.sin(theta)]);}
    for(const seed of seeds){if(curves.length>=32)break;if(occupied.has(cell(seed))||Math.abs(seed[0])>EXTENT||Math.abs(seed[1])>EXTENT)continue;const p=trace(M,seed,state.t,state,opt.part);if(p.length<12)continue;const fresh=p.filter(q=>!occupied.has(cell(q))).length;if(fresh<p.length*.65)continue;curves.push(p);for(const q of p)occupied.add(cell(q));}
    cached=key;
   }
   c.fillStyle='#101b2a';c.fillRect(0,0,w,h);
   const gap=24,left=42,top=81,bottom=43,barSpace=65,panelWidth=(w-left-22-gap)/2,size=Math.min(panelWidth-barSpace,h-top-bottom),y=top+(h-top-bottom-size)/2;
   const columns=[opt.quantity==='Ez'?1:opt.quantity==='B'?2:0,3],max=opt.range;
   const plots=[];
   for(let panel=0;panel<2;panel++){
    const px=left+panel*(panelWidth+gap),signed=panel===0&&opt.quantity==='Ez',limit=panel===0?max:max*max;
    const rc=raster[panel].getContext('2d'),im=rc.createImageData(N,N);
    const count=opt.bands?12:1024,lut=Array.from({length:count},(_,i)=>color(i/(count-1),signed,false)),den=Math.log1p(20*limit);
    for(let j=0;j<N/2;j++)for(let i=0;i<N/2;i++){const k=(j*N+i)*4,v=samples[k+columns[panel]],a=opt.scale==='linear'?Math.abs(v)/limit:Math.log1p(20*Math.abs(v))/den,u=signed?.5+.5*Math.sign(v)*a:a;let rgb=lut[Math.min(count-1,Math.max(0,Math.floor(u*count)))];if(signed&&Math.abs(v)<1e-12)rgb=[241,245,248];if(Math.hypot(i-(N-1)/2,j-(N-1)/2)<N*.13/(2*EXTENT))rgb=[18,27,39];for(const q of [k,(j*N+N-1-i)*4,((N-1-j)*N+i)*4,((N-1-j)*N+N-1-i)*4]){im.data[q]=rgb[0];im.data[q+1]=rgb[1];im.data[q+2]=rgb[2];im.data[q+3]=255;}}

    rc.putImageData(im,0,0);c.imageSmoothingEnabled=true;c.drawImage(raster[panel],px,y,size,size);
    const project=(x,z)=>[px+(x/EXTENT+1)*size/2,y+(1-z/EXTENT)*size/2];plots.push(project);
    c.strokeStyle='#8b9bab';c.lineWidth=1;c.strokeRect(px,y,size,size);
    for(let tick=-3;tick<=3;tick++){const a=project(tick,-EXTENT),b=project(-EXTENT,tick);line(c,a,[a[0],a[1]+4],'#8b9bab');line(c,b,[b[0]-4,b[1]],'#8b9bab');label(L,'xt'+panel+'_'+tick,String(tick),a[0],a[1]+15,'#bccbdc');if(panel===0)label(L,'zt'+tick,String(tick),b[0]-16,b[1],'#bccbdc');}
    label(L,'xaxis'+panel,'x/\\lambda_0',px+size/2,y+size+34,'#bdcadb');
    if(panel===0)label(L,'zaxis','z/\\lambda_0',px+28,y-14,'#bdcadb');
    const title=panel===0?(opt.quantity==='Ez'?'E_z/E_*':opt.quantity==='B'?'|\\mathbf B|/B_*':'|\\mathbf E|/E_*'):'|\\mathbf S_{\\text{rad}}|/S_*';
    label(L,'panel'+panel,title,px+size*.5,57,'#e1eaf4');
    const bx=px+size+10,bw=13;
    for(let j=0;j<120;j++){const rgb=color(1-j/119,signed,opt.bands);c.fillStyle='rgb('+rgb.join(',')+')';c.fillRect(bx,y+j*size/120,bw,size/120+.5);}
    for(let k=0;k<=6;k++){const u=k/6,v=inverse(u,limit,opt.scale,signed),yy=y+size*(1-u);line(c,[bx+bw,yy],[bx+bw+4,yy],'#b6c8da');const val=Math.abs(v)<1e-8?'0':Math.abs(v)<.01?v.toExponential(1).replace(/e([+-]?\d+)/,'\\!\\cdot10^{$1}'):v.toFixed(Math.abs(v)<.1?2:1);label(L,'scale'+panel+'_'+k,val.replace('.', '{,}'),bx+bw+25,yy,'#d0dcea');}
    // Same geometry and source in both quantitative maps.
    const q=M.source(state.t,state).p,center=project(0,0),up=project(0,.22),down=project(0,-.22);
    line(c,up,down,'#15202e',10);line(c,up,down,'#c1c7ca',5);circle(c,...center,5,'#f3f6f8',1);dot(c,...up,6,q>=0?'#f1644d':'#509ce8');dot(c,...down,6,q>=0?'#509ce8':'#f1644d');
   }
   const project=plots[0];c.save();c.beginPath();c.rect(left,y,size,size);c.clip();
   if(opt.showE&&opt.overlay==='lines')for(const curve of curves){const p=curve.map(q=>project(...q));path(c,p,'#09131e99',2.7);path(c,p,'#f7f3d6',.85);for(let k=15;k<curve.length-2;k+=65){const a=p[k],f=M.field(...[curve[k][0],0,curve[k][1]],state.t,state,opt.part).E,len=Math.hypot(f[0],f[2]);if(len){const dx=f[0]/len,dy=-f[2]/len;path(c,[[a[0]+3.5*dx,a[1]+3.5*dy],[a[0]-3*dx-2*dy,a[1]-3*dy+2*dx],[a[0]-3*dx+2*dy,a[1]-3*dy-2*dx]],'#fff8d4',1,true);}}}
   for(let iz=-6;iz<=6;iz++)for(let ix=-6;ix<=6;ix++){const x=ix*.5,z=iz*.5;if(Math.hypot(x,z)<.3)continue;const f=M.field(x,0,z,state.t,state,opt.part),p=project(x,z),em=Math.hypot(...f.E);
    if(opt.showE&&opt.overlay==='vectors'&&em>1e-7){const len=18*Math.tanh(em/REF);arrow(c,p,[p[0]+len*f.E[0]/em,p[1]-len*f.E[2]/em],'#f7f3d6',1.7);}
    if(opt.showB&&ix%2===0&&iz%2===0&&Math.abs(f.B[1])>REF*.015){circle(c,...p,4,'#d9eeff',1);if(f.B[1]<0)dot(c,...p,1.3,'#d9eeff');else{line(c,[p[0]-2,p[1]-2],[p[0]+2,p[1]+2],'#d9eeff');line(c,[p[0]-2,p[1]+2],[p[0]+2,p[1]-2],'#d9eeff');}}
   }c.restore();
   if(opt.showS)for(let iz=-5;iz<=5;iz++)for(let ix=-5;ix<=5;ix++){const x=ix*.6,z=iz*.6,r=Math.hypot(x,z);if(r<.3)continue;const f=M.field(x,0,z,state.t,state,'radiation'),n=Math.hypot(...f.S),p=plots[1](x,z),len=19*Math.tanh(n/(REF*REF));if(n>1e-8)arrow(c,p,[p[0]+len*f.S[0]/n,p[1]-len*f.S[2]/n],'#fff8da',1.5);}
   for(let panel=0;panel<2;panel++){const p=plots[panel](state.probe,0);circle(c,...p,7,'#101b2a',4);circle(c,...p,7,'#fff',1.5);}
   label(L,'probe','r_{\\text{sonda}}='+ (state.probe*2.99792458).toFixed(2).replace('.','{,}')+'\\,\\mathrm m',w-163,24,'#d0dfec');
   return {size,curves:curves.length};
  }
  return {draw};
 }
 const api={color,normalize,inverse,sample,trace,create,REF,EXTENT};if(typeof module==='object')module.exports=api;else root.EMFieldRenderer=api;
})(typeof window==='object'?window:globalThis);
