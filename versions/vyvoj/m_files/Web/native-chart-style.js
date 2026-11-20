/* Canvas presentation shared by the original modules; no model parameters. */
Lab.chart=function(canvas,xlim,ylim,xlabel='',ylabel='',options={}){
 const r=canvas.getBoundingClientRect(),logical=!!canvas.closest?.('[data-winding-viewport],[data-native-viewport]');
 const w=logical?canvas.clientWidth:r.width,h=logical?canvas.clientHeight:r.height;
 const d=Math.min((devicePixelRatio||1)*r.width/(w||1),Math.sqrt(8000000/(w*h)));
 if(!w||!h)return null;
 if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d)}
 const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);
 const pad=options.bare?{l:16,r:16,t:16,b:16}:{l:w<400?57:68,r:options.rightPad||(options.rightAxis?58:24),t:18,b:48},pw=Math.max(1,w-pad.l-pad.r),ph=Math.max(1,h-pad.t-pad.b);
 const X=v=>pad.l+(v-xlim[0])/(xlim[1]-xlim[0])*pw,Y=v=>pad.t+(ylim[1]-v)/(ylim[1]-ylim[0])*ph;
 if(!options.bare){
 const wash=c.createLinearGradient(0,pad.t,0,h-pad.b);wash.addColorStop(0,'#f9fbfc');wash.addColorStop(1,'#f0f7f4');
 c.beginPath();c.roundRect(pad.l,pad.t,pw,ph,8);c.fillStyle=wash;c.fill();c.strokeStyle='#d8e4e0';c.lineWidth=1;c.stroke();
 const ticks=(lo,hi,count)=>{const raw=(hi-lo)/count,p=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].find(k=>k*p>=raw)*p,out=[];for(let v=Math.ceil((lo-1e-10)/step)*step;v<=hi+step*1e-8;v+=step)out.push(Math.abs(v)<step*1e-8?0:v);return out};
 const fmt=v=>Number(v.toPrecision(7)).toLocaleString('cs-CZ',{maximumFractionDigits:4});
 c.font='12px system-ui';c.fillStyle='#607780';c.lineWidth=1;
 const degreeAxis=xlabel.includes('°')&&xlim[1]-xlim[0]>=180&&xlim[1]-xlim[0]<=360;
 const xticks=degreeAxis?Array.from({length:9},(_,i)=>xlim[0]+i*(xlim[1]-xlim[0])/8).filter((_,i)=>pw>900||i%2===0):ticks(...xlim,Math.max(2,Math.floor(pw/100)));
 for(const x of xticks){c.strokeStyle=x===0?'#80999f':'#e1eae8';c.beginPath();c.moveTo(X(x),pad.t);c.lineTo(X(x),h-pad.b);c.stroke();c.textAlign='center';c.fillText(fmt(x),X(x),h-pad.b+19)}
 for(const y of ticks(...ylim,Math.max(4,Math.floor(ph/70)))){c.strokeStyle=y===0?'#80999f':'#e1eae8';c.beginPath();c.moveTo(pad.l,Y(y));c.lineTo(w-pad.r,Y(y));c.stroke();c.textAlign='right';c.fillText(fmt(y),pad.l-9,Y(y)+4)}
 if(options.rightAxis){const [lo,hi]=options.rightAxis;for(const v of ticks(lo,hi,4)){const yy=Y(ylim[0]+(v-lo)/(hi-lo)*(ylim[1]-ylim[0]));c.strokeStyle='#80999f';c.beginPath();c.moveTo(w-pad.r,yy);c.lineTo(w-pad.r+4,yy);c.stroke();c.textAlign='left';c.fillStyle=options.rightColor||'#607780';c.fillText(fmt(v),w-pad.r+8,yy+4);}}
 c.font='13px system-ui';c.fillStyle='#294c58';c.textAlign='center';c.fillText(xlabel,pad.l+pw/2,h-7);
 c.save();c.translate(16,pad.t+ph/2);c.rotate(-Math.PI/2);c.fillText(ylabel,0,0);c.restore();
 }
 const clip=()=>{c.beginPath();c.rect(pad.l,pad.t,pw,ph);c.clip()};
 return {c,w,h,X,Y,pad,lineRight(xs,ys,color,width=1.5,dash=[]){const [lo,hi]=options.rightAxis;this.line(xs,ys.map(v=>ylim[0]+(v-lo)/(hi-lo)*(ylim[1]-ylim[0])),color,width,dash);},line(xs,ys,color,width=1.5,dash=[]){c.save();clip();c.beginPath();c.strokeStyle=color;c.lineWidth=width>=2?width*1.12:width;c.lineJoin='round';c.lineCap='round';c.setLineDash(dash);let started=false;xs.forEach((v,i)=>{if(!Number.isFinite(v)||!Number.isFinite(ys[i])){started=false;return}if(started)c.lineTo(X(v),Y(ys[i]));else c.moveTo(X(v),Y(ys[i]));started=true});c.stroke();c.restore()},dot(x,y,color,r=3){c.save();clip();c.beginPath();c.arc(X(x),Y(y),r+1,0,2*Math.PI);c.fillStyle='white';c.fill();c.beginPath();c.arc(X(x),Y(y),r,0,2*Math.PI);c.fillStyle=color;c.fill();c.restore()}};
};
